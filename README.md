# HMS — Hotel Management System

An Airbnb-style hotel booking app built with **Next.js (App Router)**, **TypeScript**,
**Tailwind CSS**, and **Supabase** (Auth + Postgres + Storage).

It ships a landing page with a live hotel grid plus a full authentication system
with three roles — **guest**, **manager**, and **admin** — each with its own
sign-up and login flow, email verification, and role-based protected routes.

## 1. Prerequisites

- Node.js 18+ and npm
- A free [Supabase](https://supabase.com) project

## 2. Configure Supabase

1. **Create a project** at supabase.com.
2. **Apply the schema:** open _SQL Editor → New query_, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   `profiles`, `manager_verifications`, `hotels`, `rooms`, and `reviews` tables,
   the sign-up trigger, row-level-security policies, and two storage buckets.
3. **Enable Google OAuth** (for guests): _Authentication → Providers → Google_,
   add your Google client ID/secret.
4. **Email verification** is on by default. Under _Authentication → URL
   Configuration_, add `http://localhost:3000/auth/callback` to the **Redirect
   URLs**.
5. **Get your keys:** _Settings → API_ → copy the Project URL and the `anon`
   public key.

## 3. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## 5. Create an admin

Admins are created manually:

1. _Authentication → Users → Add user_ — create the user with email + password
   and mark the email confirmed.
2. In the SQL editor, set the role:

   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'admin@example.com');
   ```

3. Log in at `/login` → you'll be redirected to `/admin/dashboard`.

## How it fits together

| Area | File(s) |
| --- | --- |
| Supabase clients | [`lib/supabase/`](lib/supabase/) (browser, server, proxy/session) |
| Auth helpers | [`lib/auth.ts`](lib/auth.ts) |
| Auth context | [`components/AuthProvider.tsx`](components/AuthProvider.tsx) |
| Route protection | [`proxy.ts`](proxy.ts) + [`components/ProtectedRoute.tsx`](components/ProtectedRoute.tsx) |
| Landing page | [`app/page.tsx`](app/page.tsx) |
| Login | [`app/login/page.tsx`](app/login/page.tsx) |
| Guest sign-up | [`app/signup/page.tsx`](app/signup/page.tsx) |
| Manager sign-up | [`app/signup/manager/page.tsx`](app/signup/manager/page.tsx) |
| Email verification | [`app/verify-email/page.tsx`](app/verify-email/page.tsx) |
| OAuth / email-link callback | [`app/auth/callback/route.ts`](app/auth/callback/route.ts) |
| Dashboards | [`app/dashboard/`](app/dashboard/), [`app/manager/`](app/manager/), [`app/admin/`](app/admin/) |

### Sign-up data flow

Profiles are created by a Postgres trigger (`handle_new_user`) that reads the
metadata passed to `supabase.auth.signUp`, so it works even before the email is
confirmed (when no session exists yet). Manager verification documents are
uploaded to the `manager-documents` storage bucket during sign-up and the path
is passed in the same metadata.

### Role routing

| Role | After login |
| --- | --- |
| Guest | `/` |
| Manager (pending) | `/manager/waiting` |
| Manager (approved) | `/manager/dashboard` |
| Manager (rejected) | login error with the rejection reason |
| Admin | `/admin/dashboard` |

`proxy.ts` enforces these rules on every request to a protected route group.
