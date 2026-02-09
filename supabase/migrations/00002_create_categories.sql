CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6B7280',
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_slug ON public.categories(slug);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);

INSERT INTO public.categories (name, slug, description, color, sort_order) VALUES
  ('Technology', 'technology', 'Software, hardware, and digital tools', '#3B82F6', 1),
  ('Health', 'health', 'Medical, fitness, and wellness solutions', '#10B981', 2),
  ('Education', 'education', 'Learning tools and educational resources', '#8B5CF6', 3),
  ('Finance', 'finance', 'Money management and financial tools', '#F59E0B', 4),
  ('Home & Living', 'home-living', 'Household and lifestyle improvements', '#EC4899', 5),
  ('Transportation', 'transportation', 'Getting around and travel', '#06B6D4', 6),
  ('Food & Drink', 'food-drink', 'Culinary and beverage innovations', '#F97316', 7),
  ('Environment', 'environment', 'Sustainability and green solutions', '#22C55E', 8),
  ('Social', 'social', 'Communication and community tools', '#A855F7', 9),
  ('Work & Productivity', 'work-productivity', 'Workplace and efficiency tools', '#64748B', 10),
  ('Entertainment', 'entertainment', 'Fun, games, and media', '#EF4444', 11),
  ('Other', 'other', 'Everything else', '#6B7280', 99);
