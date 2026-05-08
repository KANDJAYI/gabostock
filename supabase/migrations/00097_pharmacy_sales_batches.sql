-- Module Pharmacie — ventes par lot + restauration (annulation/modification).
-- Additif: colonnes nullables + adaptation des RPC existantes.

-- ========== 1) Sale items: lier un lot (optionnel) ==========
ALTER TABLE public.sale_items
  ADD COLUMN IF NOT EXISTS pharmacy_batch_id UUID NULL REFERENCES public.pharmacy_batches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pharmacy_lot_number TEXT NULL,
  ADD COLUMN IF NOT EXISTS pharmacy_expires_on DATE NULL;

COMMENT ON COLUMN public.sale_items.pharmacy_batch_id IS 'Pharmacie: lot vendu (optionnel).';
COMMENT ON COLUMN public.sale_items.pharmacy_lot_number IS 'Pharmacie: snapshot du numéro de lot au moment de la vente.';
COMMENT ON COLUMN public.sale_items.pharmacy_expires_on IS 'Pharmacie: snapshot date expiration au moment de la vente.';

CREATE INDEX IF NOT EXISTS idx_sale_items_pharmacy_batch ON public.sale_items(pharmacy_batch_id) WHERE pharmacy_batch_id IS NOT NULL;

-- ========== 2) RPC create_sale_with_stock: décrémenter le lot si batch_id fourni ==========
-- NOTE: signature inchangée, on lit `batch_id` dans chaque item JSON.
CREATE OR REPLACE FUNCTION public.create_sale_with_stock(
  p_company_id uuid,
  p_store_id uuid,
  p_customer_id uuid,
  p_created_by uuid,
  p_items jsonb,
  p_payments jsonb,
  p_discount decimal DEFAULT 0,
  p_sale_mode public.sale_mode DEFAULT 'quick_pos',
  p_document_type public.document_type DEFAULT 'thermal_receipt',
  p_client_request_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale_id uuid;
  v_sale_number text;
  v_subtotal decimal := 0;
  v_total decimal;
  v_item jsonb;
  v_product_id uuid;
  v_batch_id uuid;
  v_lot_number text;
  v_expires_on date;
  v_qty int;
  v_unit_price decimal;
  v_disc decimal;
  v_row_count int;
  v_product_name text;
  v_batch record;
  v_today date := (now() at time zone 'utc')::date;
BEGIN
  IF p_company_id IS NULL OR NOT (p_company_id IN (SELECT * FROM public.current_user_company_ids())) THEN
    RAISE EXCEPTION 'Accès refusé : entreprise invalide ou non autorisée';
  END IF;
  IF NOT public.has_store_access(p_store_id, p_company_id) THEN
    RAISE EXCEPTION 'Accès refusé : boutique non autorisée pour cette entreprise';
  END IF;
  IF p_created_by IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Accès refusé : créateur de la vente invalide';
  END IF;

  IF p_client_request_id IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(
      abs(hashtext(p_company_id::text)),
      abs(hashtext(p_client_request_id::text))
    );
    SELECT i.sale_id INTO v_sale_id
    FROM public.sale_sync_idempotency i
    WHERE i.company_id = p_company_id
      AND i.client_request_id = p_client_request_id;
    IF v_sale_id IS NOT NULL THEN
      RETURN v_sale_id;
    END IF;
  END IF;

  v_sale_number := 'S-' || nextval('public.sale_number_seq');

  -- 1) Décrémenter stock global boutique (comportement historique)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::int;
    IF v_qty IS NULL OR v_qty <= 0 THEN
      RAISE EXCEPTION 'Quantité invalide pour produit %', v_product_id;
    END IF;

    UPDATE public.store_inventory
    SET quantity = quantity - v_qty,
        updated_at = now()
    WHERE store_id = p_store_id
      AND product_id = v_product_id
      AND quantity >= v_qty;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;

    IF v_row_count = 0 THEN
      SELECT name INTO v_product_name FROM public.products WHERE id = v_product_id;
      RAISE EXCEPTION 'Stock insuffisant pour "%" (référence: %)', COALESCE(v_product_name, v_product_id::text), v_product_id;
    END IF;
  END LOOP;

  -- 2) Décrémenter stock par lot si batch_id fourni
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_batch_id := NULLIF((v_item->>'batch_id')::text, '')::uuid;
    IF v_batch_id IS NULL THEN
      CONTINUE;
    END IF;
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::int;

    SELECT id, store_id, company_id, product_id, lot_number, expires_on, quantity
    INTO v_batch
    FROM public.pharmacy_batches
    WHERE id = v_batch_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Lot pharmacie introuvable';
    END IF;
    IF v_batch.company_id IS DISTINCT FROM p_company_id OR v_batch.store_id IS DISTINCT FROM p_store_id THEN
      RAISE EXCEPTION 'Lot pharmacie non autorisé pour cette boutique';
    END IF;
    IF v_batch.product_id IS DISTINCT FROM v_product_id THEN
      RAISE EXCEPTION 'Lot pharmacie invalide: produit différent';
    END IF;
    IF v_batch.expires_on IS NOT NULL AND v_batch.expires_on < v_today THEN
      RAISE EXCEPTION 'Lot expiré: vente interdite';
    END IF;

    UPDATE public.pharmacy_batches
    SET quantity = quantity - v_qty,
        updated_at = now()
    WHERE id = v_batch_id
      AND quantity >= v_qty;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count = 0 THEN
      RAISE EXCEPTION 'Quantité lot insuffisante';
    END IF;
  END LOOP;

  -- 3) Totaux
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::int;
    v_unit_price := (v_item->>'unit_price')::decimal;
    v_disc := COALESCE((v_item->>'discount')::decimal, 0);
    v_subtotal := v_subtotal + (v_qty * v_unit_price - v_disc);
  END LOOP;
  v_total := GREATEST(0, v_subtotal - COALESCE(p_discount, 0));

  -- 4) Vente
  INSERT INTO public.sales (company_id, store_id, customer_id, sale_number, status, subtotal, discount, tax, total, created_by, sale_mode, document_type)
  VALUES (p_company_id, p_store_id, p_customer_id, v_sale_number, 'completed', v_subtotal, COALESCE(p_discount, 0), 0, v_total, p_created_by, COALESCE(p_sale_mode, 'quick_pos'::public.sale_mode), COALESCE(p_document_type, 'thermal_receipt'::public.document_type))
  RETURNING id INTO v_sale_id;

  -- 5) Lignes + mouvements (avec snapshots pharmacie si lot)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_batch_id := NULLIF((v_item->>'batch_id')::text, '')::uuid;
    v_qty := (v_item->>'quantity')::int;
    v_unit_price := (v_item->>'unit_price')::decimal;
    v_disc := COALESCE((v_item->>'discount')::decimal, 0);

    IF v_batch_id IS NOT NULL THEN
      SELECT lot_number, expires_on INTO v_lot_number, v_expires_on
      FROM public.pharmacy_batches WHERE id = v_batch_id;
      INSERT INTO public.sale_items (sale_id, product_id, quantity, unit_price, discount, total, pharmacy_batch_id, pharmacy_lot_number, pharmacy_expires_on)
      VALUES (v_sale_id, v_product_id, v_qty, v_unit_price, v_disc, v_qty * v_unit_price - v_disc, v_batch_id, v_lot_number, v_expires_on);
    ELSE
      INSERT INTO public.sale_items (sale_id, product_id, quantity, unit_price, discount, total)
      VALUES (v_sale_id, v_product_id, v_qty, v_unit_price, v_disc, v_qty * v_unit_price - v_disc);
    END IF;

    INSERT INTO public.stock_movements (store_id, product_id, type, quantity, reference_type, reference_id, created_by, notes)
    VALUES (p_store_id, v_product_id, 'sale_out', -v_qty, 'sale', v_sale_id, p_created_by, NULL);
  END LOOP;

  -- 6) Paiements
  INSERT INTO public.sale_payments (sale_id, method, amount, reference)
  SELECT v_sale_id,
         (elem->>'method')::payment_method,
         (elem->>'amount')::decimal,
         elem->>'reference'
  FROM jsonb_array_elements(p_payments) AS elem;

  -- 7) Idempotence
  IF p_client_request_id IS NOT NULL THEN
    INSERT INTO public.sale_sync_idempotency (company_id, client_request_id, sale_id)
    VALUES (p_company_id, p_client_request_id, v_sale_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_sale_id;
END;
$$;

-- ========== 3) RPC update_completed_sale_with_stock: restaurer + re-décrémenter lots ==========
CREATE OR REPLACE FUNCTION public.update_completed_sale_with_stock(
  p_sale_id uuid,
  p_customer_id uuid,
  p_items jsonb,
  p_payments jsonb,
  p_discount decimal DEFAULT 0,
  p_sale_mode public.sale_mode DEFAULT NULL,
  p_document_type public.document_type DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale record;
  v_item jsonb;
  v_item_old record;
  v_row_count int;
  v_product_id uuid;
  v_batch_id uuid;
  v_lot_number text;
  v_expires_on date;
  v_qty int;
  v_unit_price decimal;
  v_disc decimal;
  v_subtotal decimal := 0;
  v_total decimal;
  v_product_name text;
  v_batch record;
  v_today date := (now() at time zone 'utc')::date;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Au moins une ligne d''article est requise';
  END IF;
  IF p_payments IS NULL OR jsonb_typeof(p_payments) <> 'array' THEN
    RAISE EXCEPTION 'Paiements invalides';
  END IF;

  SELECT id, company_id, store_id, customer_id, status, sale_mode, document_type
  INTO v_sale
  FROM public.sales
  WHERE id = p_sale_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vente non trouvée';
  END IF;
  IF v_sale.status IS DISTINCT FROM 'completed'::public.sale_status THEN
    RAISE EXCEPTION 'Seules les ventes complétées peuvent être modifiées';
  END IF;
  IF v_sale.company_id IS NULL OR NOT (v_sale.company_id IN (SELECT * FROM public.current_user_company_ids())) THEN
    RAISE EXCEPTION 'Accès refusé : entreprise invalide ou non autorisée';
  END IF;
  IF NOT ('sales.update' = ANY (public.get_my_permission_keys(v_sale.company_id))) THEN
    RAISE EXCEPTION 'Permission refusée : modifier des ventes';
  END IF;
  IF NOT public.has_store_access(v_sale.store_id, v_sale.company_id) THEN
    RAISE EXCEPTION 'Accès refusé : boutique non autorisée pour cette entreprise';
  END IF;

  -- 1) Restaurer stock global + lots (si présents) des anciennes lignes
  FOR v_item_old IN
    SELECT product_id, quantity, pharmacy_batch_id FROM public.sale_items WHERE sale_id = p_sale_id
  LOOP
    UPDATE public.store_inventory
    SET quantity = quantity + v_item_old.quantity,
        updated_at = now()
    WHERE store_id = v_sale.store_id AND product_id = v_item_old.product_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count = 0 THEN
      INSERT INTO public.store_inventory (store_id, product_id, quantity, reserved_quantity)
      VALUES (v_sale.store_id, v_item_old.product_id, v_item_old.quantity, 0);
    END IF;

    IF v_item_old.pharmacy_batch_id IS NOT NULL THEN
      UPDATE public.pharmacy_batches
      SET quantity = quantity + v_item_old.quantity,
          updated_at = now()
      WHERE id = v_item_old.pharmacy_batch_id;
    END IF;

    INSERT INTO public.stock_movements (store_id, product_id, type, quantity, reference_type, reference_id, created_by, notes)
    VALUES (
      v_sale.store_id,
      v_item_old.product_id,
      'return_in',
      v_item_old.quantity,
      'sale',
      p_sale_id,
      auth.uid(),
      'Modification vente (lignes précédentes)'
    );
  END LOOP;

  DELETE FROM public.sale_payments WHERE sale_id = p_sale_id;
  DELETE FROM public.sale_items WHERE sale_id = p_sale_id;

  -- 2) Décrémenter stock global boutique (historique)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::int;
    IF v_qty IS NULL OR v_qty <= 0 THEN
      RAISE EXCEPTION 'Quantité invalide pour produit %', v_product_id;
    END IF;

    UPDATE public.store_inventory
    SET quantity = quantity - v_qty,
        updated_at = now()
    WHERE store_id = v_sale.store_id
      AND product_id = v_product_id
      AND quantity >= v_qty;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;

    IF v_row_count = 0 THEN
      SELECT name INTO v_product_name FROM public.products WHERE id = v_product_id;
      RAISE EXCEPTION 'Stock insuffisant pour "%" (référence: %)', COALESCE(v_product_name, v_product_id::text), v_product_id;
    END IF;
  END LOOP;

  -- 3) Décrémenter lots si batch_id fourni
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_batch_id := NULLIF((v_item->>'batch_id')::text, '')::uuid;
    IF v_batch_id IS NULL THEN
      CONTINUE;
    END IF;
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::int;

    SELECT id, store_id, company_id, product_id, lot_number, expires_on, quantity
    INTO v_batch
    FROM public.pharmacy_batches
    WHERE id = v_batch_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Lot pharmacie introuvable';
    END IF;
    IF v_batch.company_id IS DISTINCT FROM v_sale.company_id OR v_batch.store_id IS DISTINCT FROM v_sale.store_id THEN
      RAISE EXCEPTION 'Lot pharmacie non autorisé pour cette boutique';
    END IF;
    IF v_batch.product_id IS DISTINCT FROM v_product_id THEN
      RAISE EXCEPTION 'Lot pharmacie invalide: produit différent';
    END IF;
    IF v_batch.expires_on IS NOT NULL AND v_batch.expires_on < v_today THEN
      RAISE EXCEPTION 'Lot expiré: vente interdite';
    END IF;

    UPDATE public.pharmacy_batches
    SET quantity = quantity - v_qty,
        updated_at = now()
    WHERE id = v_batch_id
      AND quantity >= v_qty;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count = 0 THEN
      RAISE EXCEPTION 'Quantité lot insuffisante';
    END IF;
  END LOOP;

  -- 4) Totaux
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::int;
    v_unit_price := (v_item->>'unit_price')::decimal;
    v_disc := COALESCE((v_item->>'discount')::decimal, 0);
    v_subtotal := v_subtotal + (v_qty * v_unit_price - v_disc);
  END LOOP;
  v_total := GREATEST(0, v_subtotal - COALESCE(p_discount, 0));

  UPDATE public.sales s
  SET
    customer_id = p_customer_id,
    subtotal = v_subtotal,
    discount = COALESCE(p_discount, 0),
    tax = 0,
    total = v_total,
    sale_mode = COALESCE(p_sale_mode, s.sale_mode),
    document_type = COALESCE(p_document_type, s.document_type),
    updated_at = now()
  WHERE s.id = p_sale_id;

  -- 5) Nouvelles lignes + mouvements
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_batch_id := NULLIF((v_item->>'batch_id')::text, '')::uuid;
    v_qty := (v_item->>'quantity')::int;
    v_unit_price := (v_item->>'unit_price')::decimal;
    v_disc := COALESCE((v_item->>'discount')::decimal, 0);

    IF v_batch_id IS NOT NULL THEN
      SELECT lot_number, expires_on INTO v_lot_number, v_expires_on
      FROM public.pharmacy_batches WHERE id = v_batch_id;
      INSERT INTO public.sale_items (sale_id, product_id, quantity, unit_price, discount, total, pharmacy_batch_id, pharmacy_lot_number, pharmacy_expires_on)
      VALUES (p_sale_id, v_product_id, v_qty, v_unit_price, v_disc, v_qty * v_unit_price - v_disc, v_batch_id, v_lot_number, v_expires_on);
    ELSE
      INSERT INTO public.sale_items (sale_id, product_id, quantity, unit_price, discount, total)
      VALUES (p_sale_id, v_product_id, v_qty, v_unit_price, v_disc, v_qty * v_unit_price - v_disc);
    END IF;

    INSERT INTO public.stock_movements (store_id, product_id, type, quantity, reference_type, reference_id, created_by, notes)
    VALUES (v_sale.store_id, v_product_id, 'sale_out', -v_qty, 'sale', p_sale_id, auth.uid(), NULL);
  END LOOP;

  INSERT INTO public.sale_payments (sale_id, method, amount, reference)
  SELECT p_sale_id,
         (elem->>'method')::public.payment_method,
         (elem->>'amount')::decimal,
         elem->>'reference'
  FROM jsonb_array_elements(p_payments) AS elem;
END;
$$;

-- ========== 4) Annulation vente: restaurer lots si présents ==========
CREATE OR REPLACE FUNCTION public.cancel_sale_restore_stock(p_sale_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale record;
  v_item record;
  v_row_count int;
BEGIN
  SELECT id, store_id, status INTO v_sale
  FROM public.sales WHERE id = p_sale_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vente non trouvée';
  END IF;
  IF v_sale.status != 'completed' THEN
    RAISE EXCEPTION 'Vente déjà annulée ou non complétée';
  END IF;

  FOR v_item IN
    SELECT product_id, quantity, pharmacy_batch_id FROM public.sale_items WHERE sale_id = p_sale_id
  LOOP
    UPDATE public.store_inventory
    SET quantity = quantity + v_item.quantity,
        updated_at = now()
    WHERE store_id = v_sale.store_id AND product_id = v_item.product_id;
    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    IF v_row_count = 0 THEN
      INSERT INTO public.store_inventory (store_id, product_id, quantity, reserved_quantity)
      VALUES (v_sale.store_id, v_item.product_id, v_item.quantity, 0);
    END IF;

    IF v_item.pharmacy_batch_id IS NOT NULL THEN
      UPDATE public.pharmacy_batches
      SET quantity = quantity + v_item.quantity,
          updated_at = now()
      WHERE id = v_item.pharmacy_batch_id;
    END IF;

    INSERT INTO public.stock_movements (store_id, product_id, type, quantity, reference_type, reference_id, notes)
    VALUES (v_sale.store_id, v_item.product_id, 'return_in', v_item.quantity, 'sale', p_sale_id, 'Annulation vente');
  END LOOP;

  UPDATE public.sales SET status = 'cancelled' WHERE id = p_sale_id;
END;
$$;

