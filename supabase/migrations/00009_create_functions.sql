-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram index for @mention fuzzy search
CREATE INDEX idx_profiles_username_trgm ON public.profiles USING gin(username_lower gin_trgm_ops);

-- Popularity score calculation
CREATE OR REPLACE FUNCTION public.calculate_popularity_score(
  p_pay INT, p_nice INT, p_meh INT, p_bad INT, p_comment_count INT, p_created_at TIMESTAMPTZ
)
RETURNS FLOAT AS $$
DECLARE
  weighted_score FLOAT;
  age_hours FLOAT;
  gravity FLOAT := 1.8;
BEGIN
  weighted_score := (p_pay * 4.0) + (p_nice * 2.0) + (p_meh * -1.0) + (p_bad * -3.0) + (p_comment_count * 0.5);
  age_hours := EXTRACT(EPOCH FROM (now() - p_created_at)) / 3600.0;
  RETURN weighted_score / POWER(GREATEST(age_hours, 0.1) + 2, gravity);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Recalculate all popularity scores (called by pg_cron)
CREATE OR REPLACE FUNCTION public.recalculate_all_popularity()
RETURNS void AS $$
BEGIN
  UPDATE public.posts SET popularity_score = public.calculate_popularity_score(
    reaction_pay, reaction_nice, reaction_meh, reaction_bad, comment_count, created_at
  ) WHERE is_deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Full-text search RPC
CREATE OR REPLACE FUNCTION public.search_posts(
  search_query TEXT,
  result_limit INT DEFAULT 20,
  result_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  body TEXT,
  author_id UUID,
  created_at TIMESTAMPTZ,
  reaction_pay INT,
  reaction_nice INT,
  reaction_meh INT,
  reaction_bad INT,
  comment_count INT,
  rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.title, p.slug, p.body, p.author_id, p.created_at,
    p.reaction_pay, p.reaction_nice, p.reaction_meh, p.reaction_bad,
    p.comment_count,
    ts_rank(p.fts, websearch_to_tsquery('english', search_query))::FLOAT AS rank
  FROM public.posts p
  WHERE p.is_deleted = false
    AND p.fts @@ websearch_to_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Username search for @mentions (fuzzy)
CREATE OR REPLACE FUNCTION public.search_usernames(query TEXT, result_limit INT DEFAULT 5)
RETURNS TABLE (id UUID, username TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username
  FROM public.profiles p
  WHERE p.username_lower LIKE lower(query) || '%'
  ORDER BY similarity(p.username_lower, lower(query)) DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Notification trigger on comment insert
CREATE OR REPLACE FUNCTION public.create_notification_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  parent_author_id UUID;
  mentioned_username TEXT;
  mentioned_user_id UUID;
  mention_matches TEXT[];
BEGIN
  -- 1. Notify post author on top-level comments
  IF NEW.parent_id IS NULL THEN
    SELECT p.author_id INTO post_author_id FROM public.posts p WHERE p.id = NEW.post_id;
    IF post_author_id IS NOT NULL AND post_author_id != NEW.author_id THEN
      INSERT INTO public.notifications (recipient_id, actor_id, type, post_id, comment_id)
      VALUES (post_author_id, NEW.author_id, 'reply_post', NEW.post_id, NEW.id);
    END IF;
  ELSE
    -- 2. Notify parent comment author on replies
    SELECT c.author_id INTO parent_author_id FROM public.comments c WHERE c.id = NEW.parent_id;
    IF parent_author_id IS NOT NULL AND parent_author_id != NEW.author_id THEN
      INSERT INTO public.notifications (recipient_id, actor_id, type, post_id, comment_id)
      VALUES (parent_author_id, NEW.author_id, 'reply_comment', NEW.post_id, NEW.id);
    END IF;
  END IF;

  -- 3. Notify @mentioned users (parse from body - looks for @username patterns)
  FOR mention_matches IN SELECT regexp_matches(NEW.body, '@([a-zA-Z0-9_]+)', 'g') LOOP
    mentioned_username := mention_matches[1];
    SELECT pr.id INTO mentioned_user_id FROM public.profiles pr WHERE pr.username_lower = lower(mentioned_username);
    IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.author_id THEN
      INSERT INTO public.notifications (recipient_id, actor_id, type, post_id, comment_id)
      VALUES (mentioned_user_id, NEW.author_id, 'mention', NEW.post_id, NEW.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_insert_notify
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.create_notification_on_comment();
