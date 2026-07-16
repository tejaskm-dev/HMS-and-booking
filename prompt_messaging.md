# Antigravity Task — Polish the BookNest Messaging System

You are working in **BookNest**, a hotel booking platform. A guest↔host messaging feature
was recently merged to `main` but it is a first pass and needs to be brought up to a
production, Airbnb-grade standard. Do all of the work below in one effort. Read the
existing code first — match its patterns; do not rewrite things that already work.

---

## 1. Stack & conventions (follow these exactly)

- **Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict).**
- **Supabase** for DB, Auth, Realtime, Storage. Three clients already exist — use the right one:
  - `lib/supabase/client.ts` → browser (Client Components). RLS-enforced.
  - `lib/supabase/server.ts` → Server Components / Server Actions / Route Handlers. RLS-enforced.
  - `lib/supabase/admin.ts` → service-role, **bypasses RLS**. Server-only; use only when strictly necessary.
  - `lib/authServer.ts` → `getManagerContext()` returns `{ supabase, userId }` from the verified JWT.
- **Security is RLS-first.** Row Level Security governs *which rows*; table `GRANT`s govern access.
  Never weaken RLS. Mirror the existing helper pattern: `SECURITY DEFINER` functions with
  `set search_path = public` to avoid policy recursion (see `supabase/hms_management_migration.sql`
  → `can_manage_hotel`, `can_operate_hotel`, `owns_hotel`, `is_hotel_staff`).
- **Tailwind v4.** Brand color tokens already defined in `app/globals.css`:
  - Brand green: `brand-50…brand-950` (primary `#0A4335` = `brand-700`, `#0F5A46` = `brand-600`).
  - Gold: `gold-50…gold-900` (`#C9A24D` = `gold-500`).
  - Background cream `#F8F7F4`. Luxury, modern, restrained aesthetic.
- **Icons:** use `lucide-react` / SVGs for ALL UI chrome. **Never use emoji glyphs as UI icons.**
  (Emoji *as message content* in the emoji picker is fine — that's content, not chrome.)
- **Mobile:** inputs must stay ≥16px font on touch to avoid iOS focus-zoom (a global rule already
  exists in `app/globals.css`; don't regress it).
- Server mutations live in `app/messages/actions.ts` (`"use server"`). Keep that pattern.
- Run `npx tsc --noEmit`, `npx eslint`, and `npm run build` before finishing. All must pass.

---

## 2. Current messaging files (read these first)

| File | Role |
|---|---|
| `supabase/hms_messaging_migration.sql` | Tables `conversations`, `messages`; trigger; RLS; grants; realtime publication; `message-attachments` storage bucket (currently **public**). |
| `app/messages/actions.ts` | Server actions: `getOrCreateConversation`, `sendMessage`, `markRead`, `setResolved`. |
| `app/messages/page.tsx` + `GuestMessagesClient.tsx` | Guest-side inbox + thread. |
| `app/messages/[conversationId]/page.tsx` | Redirects to `/messages?c=<id>`. |
| `app/manager/messages/page.tsx` + `MessagesClient.tsx` | Manager/staff inbox + thread + booking panel + quick actions. |
| `components/messaging/ChatThread.tsx` | Message list rendering + realtime subscription. Used by BOTH clients. |
| `components/messaging/Composer.tsx` | Text input, emoji grid, image upload (already has canvas compression). |
| `app/api/messages/guest-email/route.ts` | Resolves guest email via admin client (gated by an RLS-visible conversation). |
| `app/api/messages/unread-count/route.ts` | Guest unread badge count. |
| `lib/types.ts` | `Message`, `Conversation`, `MessageAttachment`, `StaffPermission` (includes `reply_messages`). |

**Data model recap:** `conversations` (one per `hotel_id`+`guest_id`, has `last_message_at`,
`last_message_preview`, `guest_unread`, `host_unread`, `status`, optional `booking_id`).
`messages` (`conversation_id`, `sender_id`, `sender_role` 'guest'|'host', `body`, `attachments` jsonb,
`read_at`, `created_at`). An `AFTER INSERT` trigger updates the parent conversation's preview +
unread counters. Manager/staff access is gated by `can_manage_hotel(hotel_id, 'reply_messages')`.

---

## 3. Bugs / problems to fix

### 3a. Guests show as "guest" instead of their real name (manager view) — ROOT CAUSE: RLS
`app/manager/messages/page.tsx` selects `profiles:guest_id (full_name, phone)`, but `profiles`
RLS only allows **read own** and **read admin** (`supabase/schema.sql`). A manager has no policy to
read a guest's profile row, so the join returns `null` and the UI falls back to "Guest" everywhere
(conversation list, thread header, avatar initials, booking panel).

**Fix (preferred): add a scoped RLS policy** letting a hotel's manager/staff read the profiles of
guests they have a conversation with — implemented via a `SECURITY DEFINER` helper to avoid the
`profiles ↔ conversations` recursion. Sketch:

```sql
create or replace function public.shares_conversation_with(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.conversations c
    where c.guest_id = p_profile_id
      and public.can_manage_hotel(c.hotel_id, 'reply_messages')
  );
$$;
grant execute on function public.shares_conversation_with(uuid) to authenticated;

create policy "profiles: read conversation guests"
  on public.profiles for select
  using (public.shares_conversation_with(id));
```

Put this in a **new** idempotent migration file `supabase/hms_messaging_names_migration.sql`
(do not edit already-applied migrations destructively). After this, the existing `profiles:guest_id`
join returns the real name. Then make the UI render the real **full name** and correct **initials**
in: conversation list, thread header, avatars, and the Guest Information panel. Fall back to a
graceful label (e.g. "Guest" + masked email) only when `full_name` is genuinely null.
Also surface the guest email already available via `app/api/messages/guest-email`.

> NOTE: the migration must be applied to the live DB (Supabase SQL editor or the project's migration
> flow). Flag this clearly in your summary — code alone won't fix the live data.

### 3b. Realtime feels slow / messages not near-instant — STRUCTURAL
- Both `handleSend` functions just `await sendMessage(...)`, and `sendMessage` calls
  `revalidatePath` on 3 routes. The sender's own message only appears after a full server
  round-trip + revalidation. **There is no optimistic UI.** The optimistic-reconcile code in
  `ChatThread.tsx` is currently dead (nothing ever adds a `sending: true` message).
- **Dual state / dual realtime:** each client keeps its own `messages` state AND its own realtime
  channel, then passes `messages` into `ChatThread`, which *also* keeps its own copy and its own
  channel. When the parent prop changes, `ChatThread` resets to it and can **drop** realtime
  messages it received independently → flicker / lost messages.

**Fix — make it near-instant and correct:**
1. **Single source of truth** for the active thread's messages + its realtime subscription. Pick ONE
   owner (recommended: `ChatThread`, or a shared `useConversationMessages(conversationId)` hook) and
   make the other side presentational. Eliminate the double subscription and the prop-reset race.
2. **Optimistic send:** on send, immediately append a temp message (`sending: true`, temp id, correct
   `sender_role`, `created_at = now`) so it renders instantly; clear the composer; then persist in the
   background; reconcile/replace the temp message when the real row arrives (via the action result
   AND/OR the realtime echo). Dedupe by `id`. On failure, roll back and restore composer text.
3. **Stop `revalidatePath` on send** — it fights optimistic/realtime state and causes refetch jank.
   `sendMessage` should insert and return the saved row; the UI updates via optimistic + realtime.
   (Keep revalidation only where a fresh server render is genuinely needed, e.g. first navigation.)
4. **Subscription robustness:** handle channel status (`SUBSCRIBED`/`CHANNEL_ERROR`/`TIMED_OUT`),
   resubscribe on reconnect, and on (re)subscribe refetch the latest messages to fill any gap missed
   while disconnected. Keep the `conversation_id=eq.` server-side filter.
5. Optional but nice for sub-100ms: also emit a Supabase **Broadcast** on send for instant peer
   delivery, with `postgres_changes` as the durable backstop. Only if it stays simple.

Keep the manager **quick-replies** (`sendQuickReply`) and booking-link logic working through the
same send path.

### 3c. Manager chat UX is lackluster — REDESIGN to an Airbnb-grade standard
The current manager messaging UI lacks real UX. Research how mature messaging UIs (Airbnb host
inbox, Intercom, modern support inboxes) structure this, and implement a polished, luxury-themed
version. Requirements:
- **Conversation list (left):** guest avatar (real initials/photo), real name, last-message preview,
  relative timestamp, unread badge, resolved/open state; tabs/filter (All / Unread / Resolved);
  search; sorted by `last_message_at`; clear active state; skeleton + empty states.
- **Thread (center):** sticky header with guest name + presence/last-seen-ish line + booking context
  chip; date separators; grouped consecutive bubbles; read/delivered/sending states; image messages
  with lightbox; smooth (non-janky) autoscroll that respects when the user has scrolled up; "new
  messages" pill; typing indicator if feasible (Supabase presence/broadcast); graceful empty state.
- **Right panel:** guest info (real name, email, phone), booking info, quick actions — keep existing
  capability but visually align to the luxury theme.
- Fully responsive (mobile: list ↔ thread navigation). Match brand green/gold/cream; restrained,
  premium feel; lucide icons only for chrome.

### 3d. Proper emoji system
Replace the fixed 48-glyph grid in `Composer.tsx` with a real picker: search box, categories,
**recently used** (persist in `localStorage`), and skin-tone selection where applicable. Insert at
the caret position (not just append). Keep it lightweight — prefer a small/headless approach or a
well-maintained library; if adding a dependency, justify size. Emoji-as-content is allowed.

### 3e. Image handling + attachment security
- Compression already exists (canvas, 1920px, JPEG 0.85) — keep/refine it. Add **multi-image** send,
  per-file progress, thumbnails, and a **lightbox** viewer in the thread.
- **Security:** the `message-attachments` bucket is currently **public** (`public: true`, public read
  policy) — these are private DMs and should not be world-readable by URL. Switch to a **private
  bucket** and serve images via **signed URLs** (`createSignedUrl`, short TTL, re-signed on display
  via a server action/route). Update upload (`getPublicUrl` → signed) and `ChatThread` rendering
  accordingly. Also scope the storage upload path/policy so users can only write under conversations
  they belong to, if practical.

---

## 4. Hard constraints

- **Do not weaken RLS or grants.** All new DB objects must be idempotent and in a new migration file.
- Preserve existing working features: booking↔conversation linking (`app/api/bookings/route.ts`),
  quick replies, unread badges, `markRead`, `setResolved`, the guest-email route.
- Keep the `reply_messages` staff-permission gating intact (managers always pass via ownership).
- TypeScript strict — no `any` in new code where avoidable; type `attachments` as `MessageAttachment[]`.
- `npx tsc --noEmit`, `npx eslint`, and `npm run build` must all pass.
- Commit style for this repo: short, basic, lowercase, single-line messages; **no Co-Authored-By trailer.**

---

## 5. Acceptance criteria

1. Manager/staff inbox shows each guest's **real name + initials** (and email/phone in the panel);
   "guest" fallback only appears when data is truly absent. New `profiles` read policy is scoped to
   conversation participants and uses a `SECURITY DEFINER` helper (no recursion).
2. Sending a message shows it **instantly** for the sender (optimistic) and arrives near-instantly
   for the other party; no flicker, no dropped/duplicated messages; works across reconnects.
3. `sendMessage` no longer revalidates on every send; single source of truth for thread state.
4. Manager chat is visually and interaction-wise on par with a top-tier host inbox, themed to brand.
5. Emoji picker has search + categories + recents + skin tones, inserts at caret.
6. Attachments support multi-image + lightbox; bucket is private with signed-URL delivery.
7. Build/typecheck/lint green. Provide a short summary of changes + the SQL that must be run on the
   live DB.

---

## 6. Notes
- The live DB already has the messaging tables, RLS, table grants, and realtime publication. Your new
  migration only *adds* the profiles-read policy/helper (and any storage policy changes for the
  private bucket). Call out every SQL statement that must be run against the live Supabase project.
- Brand: BookNest — "stays that feel like home." Luxury, calm, premium. Green `#0A4335`, gold
  `#C9A24D`, cream `#F8F7F4`.
