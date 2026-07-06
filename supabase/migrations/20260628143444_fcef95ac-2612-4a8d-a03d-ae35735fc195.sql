-- Harden RLS on storage.objects for request-attachments bucket
DROP POLICY IF EXISTS "Admins can read request attachments" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload request attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update request attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete request attachments" ON storage.objects;

-- Anyone (anon + authenticated) can INSERT into request-attachments (citizens upload without account)
CREATE POLICY "Anyone can upload request attachments"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'request-attachments');

-- Only admins can SELECT
CREATE POLICY "Admins can read request attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'request-attachments' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can UPDATE
CREATE POLICY "Admins can update request attachments"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'request-attachments' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'request-attachments' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can DELETE
CREATE POLICY "Admins can delete request attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'request-attachments' AND public.has_role(auth.uid(), 'admin'));