-- Auto-create a profile row when a new user signs up via auth.
-- Generates a temporary random username (user_xxxxxxxxxxxx) to satisfy NOT NULL.
-- The user picks their real username at /setup-username, which UPDATEs this row.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, 'user_' || substr(md5(random()::text), 1, 12));
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
