-- Audit logs must remain insertable even when parent rows are deleted (ex. deleting a company cascades to products/sales triggers).
-- Keeping strict FKs on historical audit rows breaks cascading deletes because triggers insert audit rows after parent deletion.
-- We therefore drop audit_logs foreign keys to companies/stores/auth.users while keeping the columns for filtering.

ALTER TABLE IF EXISTS public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_company_id_fkey,
  DROP CONSTRAINT IF EXISTS audit_logs_store_id_fkey,
  DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

