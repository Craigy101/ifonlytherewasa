-- Add search_match to notification types
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'search_match';

-- Add product_type to posts
ALTER TABLE public.posts ADD COLUMN product_type public.product_type;

-- Add search_index_id to notifications
ALTER TABLE public.notifications ADD COLUMN search_index_id UUID REFERENCES public.search_indices(id) ON DELETE SET NULL;
