-- KrishiSetu: Supabase Security Advisor Hardening
-- Revoke execute permissions from public and client roles on internal SECURITY DEFINER functions

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;
