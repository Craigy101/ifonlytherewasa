-- Seed common technologies
INSERT INTO public.technologies (name, slug) VALUES
  ('React', 'react'),
  ('Next.js', 'nextjs'),
  ('Vue.js', 'vuejs'),
  ('Angular', 'angular'),
  ('Svelte', 'svelte'),
  ('TypeScript', 'typescript'),
  ('JavaScript', 'javascript'),
  ('Python', 'python'),
  ('Django', 'django'),
  ('Flask', 'flask'),
  ('Ruby', 'ruby'),
  ('Ruby on Rails', 'ruby-on-rails'),
  ('Go', 'go'),
  ('Rust', 'rust'),
  ('Java', 'java'),
  ('Spring Boot', 'spring-boot'),
  ('C#', 'csharp'),
  ('.NET', 'dotnet'),
  ('PHP', 'php'),
  ('Laravel', 'laravel'),
  ('Swift', 'swift'),
  ('Kotlin', 'kotlin'),
  ('React Native', 'react-native'),
  ('Flutter', 'flutter'),
  ('Node.js', 'nodejs'),
  ('Express', 'express'),
  ('PostgreSQL', 'postgresql'),
  ('MySQL', 'mysql'),
  ('MongoDB', 'mongodb'),
  ('Redis', 'redis'),
  ('Docker', 'docker'),
  ('Kubernetes', 'kubernetes'),
  ('AWS', 'aws'),
  ('Google Cloud', 'google-cloud'),
  ('Azure', 'azure'),
  ('Terraform', 'terraform'),
  ('GraphQL', 'graphql'),
  ('Tailwind CSS', 'tailwind-css'),
  ('Supabase', 'supabase'),
  ('Firebase', 'firebase')
ON CONFLICT (slug) DO NOTHING;

-- Background matcher function
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
    -- Min pay reactions filter
    AND (si.min_pay_reactions IS NULL OR p.reaction_pay >= si.min_pay_reactions)
    -- Min engagement filter
    AND (
      si.min_engagement IS NULL
      OR (p.reaction_pay + p.reaction_nice + p.reaction_meh + p.reaction_bad + p.comment_count) >= si.min_engagement
    )
  ON CONFLICT (search_index_id, post_id) DO NOTHING;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Wrapper that runs matcher and creates notifications
CREATE OR REPLACE FUNCTION public.run_post_matching()
RETURNS INTEGER AS $$
DECLARE
  v_match RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Run the matcher first
  PERFORM public.match_posts_to_search_indices();

  -- Create notifications for new unnotified matches
  FOR v_match IN
    SELECT sim.id AS match_id, sim.post_id, si.developer_profile_id, si.id AS search_index_id, dp.user_id
    FROM public.search_index_matches sim
    JOIN public.search_indices si ON si.id = sim.search_index_id
    JOIN public.developer_profiles dp ON dp.id = si.developer_profile_id
    WHERE sim.email_sent = false
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.recipient_id = dp.user_id
        AND n.post_id = sim.post_id
        AND n.search_index_id = si.id
        AND n.type = 'search_match'
    )
  LOOP
    INSERT INTO public.notifications (recipient_id, actor_id, type, post_id, search_index_id)
    VALUES (v_match.user_id, v_match.user_id, 'search_match', v_match.post_id, v_match.search_index_id);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
