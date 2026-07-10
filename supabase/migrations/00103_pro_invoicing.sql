-- Gabostock — Espace « Facturation Pro » (comptes solo/freelance)
-- Produit autonome, sans lien avec la gestion commerciale (société/magasins/stock).
-- Toutes les tables pro_* sont strictement privées à l'utilisateur (RLS: user_id = auth.uid()).

-- ========== TYPE DE COMPTE ==========
-- 'business' = utilisateur gestion commerciale (existant) ; 'solo' = espace facturation pro.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'business';

-- ========== PROFIL ÉMETTEUR (1 ligne / user) ==========
CREATE TABLE IF NOT EXISTS public.pro_issuer (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  tax_id TEXT,                       -- NIF / RCCM
  logo_url TEXT,
  currency TEXT NOT NULL DEFAULT 'XOF',
  default_vat_rate NUMERIC NOT NULL DEFAULT 0,
  legal_mentions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== CLIENTS ==========
CREATE TABLE IF NOT EXISTS public.pro_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'individual',   -- individual | company
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pro_clients_user_idx ON public.pro_clients(user_id);

-- ========== DOCUMENTS (devis / factures) ==========
CREATE TABLE IF NOT EXISTS public.pro_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,                        -- devis | facture
  number TEXT NOT NULL,
  client_id UUID REFERENCES public.pro_clients(id) ON DELETE SET NULL,
  -- Snapshot client (fige le document même si le client est modifié/supprimé)
  client_name TEXT,
  client_address TEXT,
  client_email TEXT,
  client_phone TEXT,
  client_tax_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',      -- draft | sent | accepted | paid | cancelled
  issue_date DATE NOT NULL DEFAULT (now()::date),
  due_date DATE,                             -- échéance facture / date de validité devis
  currency TEXT NOT NULL DEFAULT 'XOF',
  notes TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  vat_rate NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  converted_from_id UUID REFERENCES public.pro_documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pro_documents_user_idx ON public.pro_documents(user_id);
CREATE INDEX IF NOT EXISTS pro_documents_user_kind_idx ON public.pro_documents(user_id, kind);

-- ========== LIGNES DE DOCUMENT ==========
CREATE TABLE IF NOT EXISTS public.pro_document_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.pro_documents(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT '',
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT '',
  unit_price NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  position INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS pro_document_lines_doc_idx ON public.pro_document_lines(document_id);

-- ========== NUMÉROTATION AUTO (par user + type + année) ==========
CREATE TABLE IF NOT EXISTS public.pro_number_counters (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  year INT NOT NULL,
  seq INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, kind, year)
);

-- RPC atomique : renvoie le prochain numéro formaté (DEV-2026-001 / FAC-2026-001).
CREATE OR REPLACE FUNCTION public.pro_next_number(p_kind TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_year INT := EXTRACT(YEAR FROM now())::INT;
  v_seq INT;
  v_prefix TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF p_kind NOT IN ('devis', 'facture') THEN
    RAISE EXCEPTION 'invalid kind: %', p_kind;
  END IF;

  INSERT INTO public.pro_number_counters (user_id, kind, year, seq)
  VALUES (v_uid, p_kind, v_year, 1)
  ON CONFLICT (user_id, kind, year)
  DO UPDATE SET seq = public.pro_number_counters.seq + 1
  RETURNING seq INTO v_seq;

  v_prefix := CASE WHEN p_kind = 'devis' THEN 'DEV' ELSE 'FAC' END;
  RETURN v_prefix || '-' || v_year::TEXT || '-' || LPAD(v_seq::TEXT, 3, '0');
END;
$$;

-- ========== RLS ==========
ALTER TABLE public.pro_issuer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_document_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_number_counters ENABLE ROW LEVEL SECURITY;

-- pro_issuer : propriétaire uniquement (PK = user_id)
DROP POLICY IF EXISTS pro_issuer_owner ON public.pro_issuer;
CREATE POLICY pro_issuer_owner ON public.pro_issuer
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- pro_clients
DROP POLICY IF EXISTS pro_clients_owner ON public.pro_clients;
CREATE POLICY pro_clients_owner ON public.pro_clients
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- pro_documents
DROP POLICY IF EXISTS pro_documents_owner ON public.pro_documents;
CREATE POLICY pro_documents_owner ON public.pro_documents
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- pro_document_lines : accès via le document parent appartenant à l'utilisateur
DROP POLICY IF EXISTS pro_document_lines_owner ON public.pro_document_lines;
CREATE POLICY pro_document_lines_owner ON public.pro_document_lines
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.pro_documents d
    WHERE d.id = pro_document_lines.document_id AND d.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pro_documents d
    WHERE d.id = pro_document_lines.document_id AND d.user_id = auth.uid()
  ));

-- pro_number_counters : lecture seule côté client (écrit par la RPC SECURITY DEFINER)
DROP POLICY IF EXISTS pro_number_counters_owner ON public.pro_number_counters;
CREATE POLICY pro_number_counters_owner ON public.pro_number_counters
  FOR SELECT USING (user_id = auth.uid());

-- ========== GRANTS ==========
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_issuer TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_document_lines TO authenticated;
GRANT SELECT ON public.pro_number_counters TO authenticated;
GRANT EXECUTE ON FUNCTION public.pro_next_number(TEXT) TO authenticated;

-- ========== BUCKET STORAGE (logos émetteur) ==========
INSERT INTO storage.buckets (id, name, public)
VALUES ('pro-logos', 'pro-logos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "pro_logos_public_read" ON storage.objects;
CREATE POLICY "pro_logos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'pro-logos');

DROP POLICY IF EXISTS "pro_logos_authenticated_upload" ON storage.objects;
CREATE POLICY "pro_logos_authenticated_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pro-logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "pro_logos_authenticated_update" ON storage.objects;
CREATE POLICY "pro_logos_authenticated_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'pro-logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "pro_logos_authenticated_delete" ON storage.objects;
CREATE POLICY "pro_logos_authenticated_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'pro-logos' AND auth.role() = 'authenticated');

NOTIFY pgrst, 'reload schema';
