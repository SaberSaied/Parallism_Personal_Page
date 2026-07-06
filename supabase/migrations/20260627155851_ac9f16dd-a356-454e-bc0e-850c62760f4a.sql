-- Make citizen email optional and allow public read for tracking lookups
ALTER TABLE public.citizen_requests ALTER COLUMN citizen_email DROP NOT NULL;
ALTER TABLE public.citizen_requests ALTER COLUMN citizen_email SET DEFAULT NULL;

-- Allow anon SELECT (the server fn uses publishable key + narrow column projection + WHERE filter).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='citizen_requests' AND policyname='Anon can read for tracking') THEN
    EXECUTE 'CREATE POLICY "Anon can read for tracking" ON public.citizen_requests FOR SELECT TO anon USING (true)';
  END IF;
END $$;

GRANT SELECT ON public.citizen_requests TO anon;