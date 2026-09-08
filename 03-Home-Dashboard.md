# Page 3: Home / Dashboard
**Phase:** 1 — Foundation
**Depends on:** 02-Signup-Login (must be authenticated)
**Unlocks:** navigation into all three modules

## Goal
A logged-in landing page that orients the student: quick access to all 3 modules and a snapshot of their own activity.

## Routes
- `/home` (protected — redirect to `/login` if no valid session)

## UI Components
- Sticky glass nav (reused from landing page) — now shows the user's name + logout instead of "Sign Up"
- Three module tiles: Lost & Found, Borrow, Give Away — each a neumorphic card linking to that module's browse page
- "Recent Activity" strip — last 3 notifications (read-only preview; full list lives on Page 13)
- Quick search bar (plain keyword search for now — natural-language parsing is Phase 6 / Page 17)
- Empty states for a brand-new account (no activity yet)

## API Endpoints
```
GET /api/dashboard/summary
  auth: required
  returns: 200 {
    activeLostCount, activeFoundCount,
    myActiveBorrows, myActiveGiveaways,
    recentNotifications: [ { id, message, created_at, is_read } ]  // limit 3
  }
```

## Database
Read-only aggregate queries across `items`, `transactions`, `notifications` scoped to `req.user.id`. No writes on this page.

## Business Logic & Edge Cases
- New account with zero activity → show friendly empty-state copy, not blank cards.
- Logout clears the Supabase session and redirects to `/` (landing page).

## Acceptance Criteria
- [ ] Unauthenticated visit to `/home` redirects to `/login`.
- [ ] Authenticated visit shows the user's name and correct counts.
- [ ] Each module tile navigates to that module's browse page (built in later pages).
