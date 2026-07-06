-- Anyone (anon + authenticated) can upload citizen request attachments
CREATE POLICY "Anyone can upload request attachments"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'request-attachments');

-- Admins can read attachments
CREATE POLICY "Admins can read request attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'request-attachments' AND public.has_role(auth.uid(), 'admin'));