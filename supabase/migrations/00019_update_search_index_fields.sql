-- Replace min_engagement with min_weekly_pay_usd on search_indices
ALTER TABLE public.search_indices
  ADD COLUMN min_weekly_pay_usd INTEGER;

ALTER TABLE public.search_indices
  DROP COLUMN min_engagement;

-- Update matcher function to check weekly_pay_usd instead of engagement
CREATE OR REPLACE FUNCTION public.match_posts_to_search_indices()
RETURNS TABLE(new_matches_count INTEGER) AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  INSERT INTO public.search_index_matches (search_index_id, post_id)
  SELECT si.id, p.id
  FROM public.search_indices si
  CROSS JOIN public.posts p
  WHERE si.is_active = true
    AND p.is_deleted = false
    AND p.is_solved = false
    -- Product type filter
    AND (
      cardinality(si.product_types) = 0
      OR p.product_type = ANY(si.product_types)
    )
    -- Category filter
    AND (
      cardinality(si.category_ids) = 0
      OR EXISTS (
        SELECT 1 FROM public.post_categories pc
        WHERE pc.post_id = p.id AND pc.category_id = ANY(si.category_ids)
      )
    )
    -- Keyword pattern filter (any keyword matches title or body)
    AND (
      cardinality(si.keyword_patterns) = 0
      OR EXISTS (
        SELECT 1 FROM unnest(si.keyword_patterns) AS kw
        WHERE p.title ILIKE '%' || kw || '%' OR p.body ILIKE '%' || kw || '%'
      )
    )
    -- Min "I'd pay" reactions filter
    AND (si.min_pay_reactions IS NULL OR p.reaction_pay >= si.min_pay_reactions)
    -- Min weekly pay USD filter (checks post author's stated willingness to pay)
    AND (si.min_weekly_pay_usd IS NULL OR p.weekly_pay_usd >= si.min_weekly_pay_usd)
  ON CONFLICT (search_index_id, post_id) DO NOTHING;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
