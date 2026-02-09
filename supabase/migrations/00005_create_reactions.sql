CREATE TYPE public.reaction_type AS ENUM ('pay', 'nice', 'meh', 'bad');

CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  type public.reaction_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX idx_reactions_post ON public.reactions(post_id);
CREATE INDEX idx_reactions_user ON public.reactions(user_id);

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reactions are publicly readable" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change their reaction" ON public.reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove their reaction" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update denormalized reaction counts on posts
CREATE OR REPLACE FUNCTION public.update_reaction_counts()
RETURNS TRIGGER AS $$
DECLARE
  target_post_id UUID;
BEGIN
  target_post_id := COALESCE(NEW.post_id, OLD.post_id);
  UPDATE public.posts SET
    reaction_pay  = (SELECT count(*) FROM public.reactions WHERE post_id = target_post_id AND type = 'pay'),
    reaction_nice = (SELECT count(*) FROM public.reactions WHERE post_id = target_post_id AND type = 'nice'),
    reaction_meh  = (SELECT count(*) FROM public.reactions WHERE post_id = target_post_id AND type = 'meh'),
    reaction_bad  = (SELECT count(*) FROM public.reactions WHERE post_id = target_post_id AND type = 'bad')
  WHERE id = target_post_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reaction_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reactions
  FOR EACH ROW EXECUTE FUNCTION public.update_reaction_counts();
