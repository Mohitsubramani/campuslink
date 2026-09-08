# Page 13: Notifications
**Phase:** 5 — Profile & Notifications
**Depends on:** 12-Profile
**Unlocks:** completes the non-AI platform — this is the last page before Phase 6 (AI)

## Goal
Surface the key events from every other module in one place: a bell icon with unread count, plus a full notifications page.

## Routes
- Bell dropdown (available on every authenticated page's nav)
- `/notifications` — full list

## UI Components
- Bell icon in nav with an unread-count badge (glass dropdown showing latest 5)
- Full page: chronological list, unread items visually distinct, "Mark all as read" button

## API Endpoints
```
GET /api/notifications
  returns: 200 { data: [notifications], unreadCount }

PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
```

## Database
New table already defined in Shared Reference: `notifications`. No new tables needed here — just start writing to it from other endpoints (see triggers below).

## Triggers to add into EXISTING endpoints (not new pages — go back and add these calls)
- `POST /api/requests` (Pages 8, 11) → insert notification for the **owner**: "New request on <item.title>"
- `PATCH /api/requests/:id` approve/reject (Page 9) → insert notification for the **requester**: "Your request was approved/rejected"
- `PATCH /api/transactions/:id` (Page 10) → optional: notify borrower on return confirmation
- Phase 6, Page 15 → insert notification when an AI match is found: "A possible match was found for your lost item"
- Return-due reminder: a simple scheduled check (cron job or a check-on-login) comparing `transactions.return_date` to now, for `ACTIVE` borrow transactions due within 24 hours

## Business Logic & Edge Cases
- Polling every 30 seconds for the bell badge is sufficient for a hackathon — don't build WebSockets/real-time unless every other page is already done with time to spare.
- Notifications are per-user; never expose another user's notifications via ID guessing (check `user_id = req.user.id` on every read/write).

## Acceptance Criteria
- [ ] Sending a request notifies the owner.
- [ ] Approving/rejecting a request notifies the requester.
- [ ] Unread count updates and clears correctly via "Mark all as read."
- [ ] (If time permits) A return-due reminder appears the day before `return_date`.
