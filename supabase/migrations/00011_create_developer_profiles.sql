-- Enable pg_trgm for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Technologies lookup table
CREATE TABLE public.technologies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_technologies_name_trgm ON public.technologies USING gin(name gin_trgm_ops);

ALTER TABLE public.technologies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "technologies_select" ON public.technologies FOR SELECT USING (true);
CREATE POLICY "technologies_insert" ON public.technologies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Developer profiles (linked 1:1 to profiles)
CREATE TABLE public.developer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT CHECK (char_length(bio) <= 1000),
  github_username TEXT CHECK (char_length(github_username) <= 39),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_developer_profiles_user ON public.developer_profiles(user_id);
CREATE INDEX idx_developer_profiles_stripe ON public.developer_profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

ALTER TABLE public.developer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_profiles_select" ON public.developer_profiles FOR SELECT USING (true);
CREATE POLICY "dev_profiles_insert" ON public.developer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dev_profiles_update" ON public.developer_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Developer tech stack junction
CREATE TABLE public.developer_technologies (
  developer_profile_id UUID NOT NULL REFERENCES public.developer_profiles(id) ON DELETE CASCADE,
  technology_id INT NOT NULL REFERENCES public.technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (developer_profile_id, technology_id)
);

ALTER TABLE public.developer_technologies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_tech_select" ON public.developer_technologies FOR SELECT USING (true);
CREATE POLICY "dev_tech_insert" ON public.developer_technologies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.developer_profiles WHERE id = developer_profile_id AND user_id = auth.uid())
);
CREATE POLICY "dev_tech_delete" ON public.developer_technologies FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.developer_profiles WHERE id = developer_profile_id AND user_id = auth.uid())
);
