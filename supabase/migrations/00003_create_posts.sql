CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 10 AND char_length(title) <= 300),
  slug TEXT NOT NULL UNIQUE,
  body TEXT NOT NULL CHECK (char_length(body) >= 20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  comment_count INT NOT NULL DEFAULT 0,
  reaction_pay INT NOT NULL DEFAULT 0,
  reaction_nice INT NOT NULL DEFAULT 0,
  reaction_meh INT NOT NULL DEFAULT 0,
  reaction_bad INT NOT NULL DEFAULT 0,
  popularity_score FLOAT NOT NULL DEFAULT 0,
  fts TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'B')
  ) STORED
);

CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_posts_popularity ON public.posts(popularity_score DESC, created_at DESC);
CREATE INDEX idx_posts_fts ON public.posts USING gin(fts);
CREATE INDEX idx_posts_not_deleted ON public.posts(is_deleted) WHERE is_deleted = false;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts are publicly readable" ON public.posts FOR SELECT USING (is_deleted = false);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts within 1 hour" ON public.posts FOR UPDATE USING (
  auth.uid() = author_id AND (
    created_at > now() - interval '1 hour'
    OR is_deleted = false
  )
);
