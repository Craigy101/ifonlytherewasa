-- (Optional but usually needed for your schema/indexes)
create extension if not exists pgcrypto; -- gen_random_uuid()
create extension if not exists pg_trgm;  -- gin_trgm_ops
create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate text;
  tries int := 0;
begin
  -- idempotent: if already exists, skip
  if exists (select 1 from public.profiles p where p.id = new.id) then
    return new;
  end if;

  loop
    tries := tries + 1;

    -- random-ish username (no extensions required)
    candidate :=
      'user_' || substr(pg_catalog.md5(new.id::text || ':' || clock_timestamp()::text || ':' || tries::text), 1, 12);

    begin
      insert into public.profiles (id, username, avatar_url)
      values (new.id, candidate, null);

      exit; -- success
    exception
      when unique_violation then
        if tries >= 30 then
          raise exception 'Could not generate unique username for user % after % tries', new.id, tries;
        end if;
    end;
  end loop;

  return new;
end;
$$;

-- 2) Trigger on auth.users
drop trigger if exists on_auth_user_created_create_profile on auth.users;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row
execute function public.handle_new_auth_user_profile();
