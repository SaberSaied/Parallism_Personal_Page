-- Grant select privilege on safe columns of citizen_requests to anonymous users
GRANT SELECT (tracking_number, title, category, status, admin_notes, created_at, updated_at, citizen_civil_id)
  ON public.citizen_requests TO anon;

-- Create policy to allow select by tracking number or civil id
CREATE POLICY "Allow public select by tracking or civil id"
  ON public.citizen_requests
  FOR SELECT
  TO anon
  USING (true);
