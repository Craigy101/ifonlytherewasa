CREATE TABLE public.post_categories (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

CREATE INDEX idx_post_categories_category ON public.post_categories(category_id);

ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Post categories are publicly readable" ON public.post_categories FOR SELECT USING (true);
CREATE POLICY "Post authors can manage categories" ON public.post_categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid())
);
CREATE POLICY "Post authors can delete categories" ON public.post_categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid())
);
