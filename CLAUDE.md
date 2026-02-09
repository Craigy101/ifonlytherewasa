# ReadMe

When you make changes that affect the functionality of the project or big changes to how to setup, you must change the ReadMe to reflect it.

# Project: If Only There Was A

Next.js 14 + Supabase + Tailwind + Tiptap rich text editor.

## Build & Check Commands

- **Type check (run first):** `npx tsc --noEmit`
- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`

Always run `npx tsc --noEmit` before `npm run build` to catch type errors early.

## Supabase Types

- Generated types live in `src/types/database.ts` — do NOT edit manually
- Regenerate with: `supabase gen types typescript --project-id encdkuftgwojcmnxitmt > src/types/database.ts`
- Convenience row aliases are in `src/types/index.ts` using the `Tables<>` helper
- When adding/removing DB columns, regenerate types and run `npx tsc --noEmit` to find all breakages

## Package Versions — Look Up Docs!

When integrating a new non-trivial package or using unfamiliar APIs, **always look up the official documentation for the specific versions we use** — do NOT rely on memory, as APIs change between major versions:

- **Next.js 14** (NOT 15 — no App Router breaking changes like async `cookies()`)
- **React 18** (NOT 19 — no `use()`, no server actions built-in, etc.)
- **@supabase/supabase-js v2** and **@supabase/ssr v0.8**

This applies to any significant library — if you're unsure about an API, check the docs for our version first.

## Supabase Client Best Practices

### Client Initialization
- **Browser client** (`src/lib/supabase/client.ts`): `createBrowserClient` from `@supabase/ssr` is a **singleton** internally — calling `createClient()` multiple times returns the same instance
- **Server client** (`src/lib/supabase/server.ts`): `createServerClient` with async cookie access — create fresh per request, never cache
- **Middleware** (`middleware.ts`): Create client inline with request/response cookie handlers — call `supabase.auth.getUser()` **immediately** after creation, no logic in between

### Client Usage in React
- In **providers/long-lived components**: wrap with `useState(() => createClient())` for a stable reference that won't trigger dependency array churn
- In **event handlers and callbacks**: calling `createClient()` inline is fine (singleton returns same instance)
- **Never** put `createClient()` bare at component top level if it's in a `useCallback`/`useEffect` dependency array — causes re-subscription loops and `AbortError: signal is aborted without reason`

### Auth Flow
- `handle_new_user` trigger on `auth.users` auto-creates a profile row on signup with a temp `user_xxxxxxxxxxxx` username
- Middleware redirects to `/setup-username` if `profile.username` is missing or starts with `user_`
- `UsernameSetupForm` **UPDATEs** the existing profile row (does NOT insert)

## Key Patterns

- Supabase select queries must match the actual DB columns — check `database.ts` Row types
- `PostCardData` in `src/components/feed/PostCard.tsx` is the canonical type for feed cards
- All select queries for posts in feeds must include the same columns to satisfy TypeScript's type inference on `let query =` reassignment
