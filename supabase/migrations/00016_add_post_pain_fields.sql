-- Add pain-point fields to posts
ALTER TABLE public.posts
  ADD COLUMN weekly_pay_usd INTEGER,
  ADD COLUMN time_spent_weekly TEXT,
  ADD COLUMN current_solution TEXT;
