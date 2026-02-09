-- Add solved fields to posts
ALTER TABLE public.posts
  ADD COLUMN is_solved BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN solved_at TIMESTAMPTZ,
  ADD COLUMN solved_by TEXT CHECK (solved_by IN ('author', 'community')),
  ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN solved_vote_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_posts_is_solved ON public.posts(is_solved);

-- Solved votes table
CREATE TABLE public.solved_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_solved_votes_post ON public.solved_votes(post_id);

ALTER TABLE public.solved_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "solved_votes_select" ON public.solved_votes FOR SELECT USING (true);
CREATE POLICY "solved_votes_insert" ON public.solved_votes FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND NOT EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid())
);
CREATE POLICY "solved_votes_delete" ON public.solved_votes FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update solved_vote_count and auto-solve
CREATE OR REPLACE FUNCTION public.update_solved_vote_count()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
  v_view_count INTEGER;
  v_required INTEGER;
  v_is_solved BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET solved_vote_count = solved_vote_count + 1 WHERE id = NEW.post_id;

    SELECT solved_vote_count, view_count, is_solved INTO v_count, v_view_count, v_is_solved
    FROM public.posts WHERE id = NEW.post_id;

    v_required := GREATEST(ceil(sqrt(v_view_count / 10.0))::integer, 3);

    IF NOT v_is_solved AND v_count >= v_required THEN
      UPDATE public.posts
      SET is_solved = true, solved_at = now(), solved_by = 'community'
      WHERE id = NEW.post_id;
    END IF;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET solved_vote_count = solved_vote_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_solved_vote_count
AFTER INSERT OR DELETE ON public.solved_votes
FOR EACH ROW EXECUTE FUNCTION public.update_solved_vote_count();

-- RPC to increment view count
CREATE OR REPLACE FUNCTION public.increment_post_view(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts SET view_count = view_count + 1 WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
