
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.request_status AS ENUM ('submitted','under_review','assigned','in_progress','resolved','closed');
CREATE TYPE public.initiative_status AS ENUM ('نشط','مكتمل','مخطط له');

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- PARLIAMENT INFO (singleton)
CREATE TABLE public.parliament_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  office_address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  working_hours TEXT NOT NULL,
  social_media JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.parliament_info TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.parliament_info TO authenticated;
GRANT ALL ON public.parliament_info TO service_role;
ALTER TABLE public.parliament_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read parliament_info" ON public.parliament_info FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write parliament_info" ON public.parliament_info FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_parliament_info_updated BEFORE UPDATE ON public.parliament_info FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- STATISTICS
CREATE TABLE public.statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.statistics TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.statistics TO authenticated;
GRANT ALL ON public.statistics TO service_role;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read statistics" ON public.statistics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write statistics" ON public.statistics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- TIMELINE
CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.timeline_events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.timeline_events TO authenticated;
GRANT ALL ON public.timeline_events TO service_role;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read timeline" ON public.timeline_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write timeline" ON public.timeline_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- TESTIMONIALS
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  avatar TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write testimonials" ON public.testimonials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ACHIEVEMENTS
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  image TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  likes INT NOT NULL DEFAULT 0,
  status TEXT,
  progress INT,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read achievements" ON public.achievements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write achievements" ON public.achievements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_achievements_updated BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- INITIATIVES
CREATE TABLE public.initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  status public.initiative_status NOT NULL DEFAULT 'نشط',
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  image TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  progress INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.initiatives TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.initiatives TO authenticated;
GRANT ALL ON public.initiatives TO service_role;
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read initiatives" ON public.initiatives FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write initiatives" ON public.initiatives FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_initiatives_updated BEFORE UPDATE ON public.initiatives FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- GALLERY
CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT ALL ON public.gallery_items TO service_role;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read gallery" ON public.gallery_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write gallery" ON public.gallery_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- CITIZEN REQUESTS
CREATE TABLE public.citizen_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT NOT NULL UNIQUE,
  citizen_name TEXT NOT NULL,
  citizen_civil_id TEXT NOT NULL,
  citizen_phone TEXT NOT NULL,
  citizen_email TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status public.request_status NOT NULL DEFAULT 'submitted',
  admin_notes TEXT NOT NULL DEFAULT '',
  assigned_to TEXT NOT NULL DEFAULT '',
  attachments TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.citizen_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.citizen_requests TO authenticated;
GRANT ALL ON public.citizen_requests TO service_role;
ALTER TABLE public.citizen_requests ENABLE ROW LEVEL SECURITY;
-- Citizens can submit (anon insert), but reads happen only via server fn or admin
CREATE POLICY "anyone can submit request" ON public.citizen_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin manage requests" ON public.citizen_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_requests_updated BEFORE UPDATE ON public.citizen_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- BOOTSTRAP FIRST ADMIN (any authenticated user can promote themselves if no admin exists)
CREATE OR REPLACE FUNCTION public.bootstrap_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  existing_count INT;
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN FALSE; END IF;
  SELECT COUNT(*) INTO existing_count FROM public.user_roles WHERE role = 'admin';
  IF existing_count > 0 THEN RETURN FALSE; END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (uid, 'admin') ON CONFLICT DO NOTHING;
  RETURN TRUE;
END $$;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin() TO authenticated;
