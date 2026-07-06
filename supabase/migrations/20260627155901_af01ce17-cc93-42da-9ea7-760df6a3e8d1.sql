DROP POLICY IF EXISTS "Anon can read for tracking" ON public.citizen_requests;
REVOKE SELECT ON public.citizen_requests FROM anon;