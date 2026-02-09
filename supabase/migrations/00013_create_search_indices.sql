-- Product type enum
DO $$ BEGIN
  CREATE TYPE public.product_type AS ENUM ('website', 'app', 'desktop_app', 'hardware', 'physical_product');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Search indices table
CREATE TABLE public.search_indices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_profile_id UUID NOT NULL REFERENCES public.developer_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  product_types public.product_type[] NOT NULL DEFAULT '{}',
  category_ids INTEGER[] NOT NULL DEFAULT '{}',
  keyword_patterns TEXT[] NOT NULL DEFAULT '{}',
  min_pay_reactions INTEGER,
  min_engagement INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_free BOOLEAN NOT NULL DEFAULT false,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_indices_dev ON public.search_indices(developer_profile_id);
CREATE INDEX idx_search_indices_active ON public.search_indices(is_active) WHERE is_active = true;

ALTER TABLE public.search_indices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "search_indices_select" ON public.search_indices FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.developer_profiles WHERE id = developer_profile_id AND user_id = auth.uid())
);
CREATE POLICY "search_indices_insert" ON public.search_indices FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.developer_profiles WHERE id = developer_profile_id AND user_id = auth.uid())
);
CREATE POLICY "search_indices_update" ON public.search_indices FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.developer_profiles WHERE id = developer_profile_id AND user_id = auth.uid())
);
CREATE POLICY "search_indices_delete" ON public.search_indices FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.developer_profiles WHERE id = developer_profile_id AND user_id = auth.uid())
);

-- Search index matches table
CREATE TABLE public.search_index_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_index_id UUID NOT NULL REFERENCES public.search_indices(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(search_index_id, post_id)
);

CREATE INDEX idx_search_index_matches_index ON public.search_index_matches(search_index_id);
CREATE INDEX idx_search_index_matches_unsent ON public.search_index_matches(email_sent) WHERE email_sent = false;

ALTER TABLE public.search_index_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "search_index_matches_select" ON public.search_index_matches FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.search_indices si
    JOIN public.developer_profiles dp ON dp.id = si.developer_profile_id
    WHERE si.id = search_index_id AND dp.user_id = auth.uid()
  )
);
