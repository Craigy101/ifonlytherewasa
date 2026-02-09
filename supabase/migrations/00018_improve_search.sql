-- 1. Recreate the fts column to include current_solution (weight C)
--    Strip HTML tags from body before indexing so tag names don't pollute the tsvector
ALTER TABLE public.posts DROP COLUMN fts;
ALTER TABLE public.posts ADD COLUMN fts TSVECTOR GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', regexp_replace(coalesce(body, ''), '<[^>]*>', ' ', 'g')), 'B') ||
  setweight(to_tsvector('english', coalesce(current_solution, '')), 'C')
) STORED;

CREATE INDEX idx_posts_fts ON public.posts USING gin(fts);

-- Drop the old version (must match the argument types)
DROP FUNCTION IF EXISTS public.search_posts(TEXT, INT, INT);

-- Recreate
CREATE FUNCTION public.search_posts(
  search_query TEXT,
  result_limit INT DEFAULT 20,
  result_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  body TEXT,
  current_solution TEXT,
  author_id UUID,
  created_at TIMESTAMPTZ,
  reaction_pay INT,
  reaction_nice INT,
  reaction_meh INT,
  reaction_bad INT,
  comment_count INT,
  rank FLOAT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  tsq tsquery;
  sanitized_words TEXT[];
BEGIN
  sanitized_words := array(
    SELECT regexp_replace(w, '[^a-zA-Z0-9]', '', 'g')
    FROM unnest(string_to_array(trim(search_query), ' ')) AS w
    WHERE regexp_replace(w, '[^a-zA-Z0-9]', '', 'g') <> ''
  );

  IF array_length(sanitized_words, 1) IS NULL THEN
    RETURN;
  END IF;

  tsq := to_tsquery(
    'english',
    array_to_string(
      array(SELECT sw || ':*' FROM unnest(sanitized_words) AS sw),
      ' & '
    )
  );

  RETURN QUERY
  SELECT
    p.id, p.title, p.slug, p.body, p.current_solution,
    p.author_id, p.created_at,
    p.reaction_pay, p.reaction_nice, p.reaction_meh, p.reaction_bad,
    p.comment_count,
    ts_rank_cd(p.fts, tsq)::FLOAT AS rank
  FROM public.posts p
  WHERE p.is_deleted = false
    AND p.fts @@ tsq
  ORDER BY rank DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;

-- Re-grant if you previously granted (dropping removes privileges)
GRANT EXECUTE ON FUNCTION public.search_posts(TEXT, INT, INT) TO anon, authenticated;
