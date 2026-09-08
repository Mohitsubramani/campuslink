# Page 12: Profile
**Phase:** 5 — Profile & Notifications
**Depends on:** 11-GiveAway-Flow (needs all three modules producing data to aggregate)
**Unlocks:** 13-Notifications

## Goal
One place for a student to see everything they've posted and every transaction they've been part of.

## Routes
- `/profile` — tabs: My Activity, Borrow History, Handover History, Requests

## UI Components
- **My Activity** tab: all items posted by the user across LOST/FOUND/BORROW/GIVEAWAY, with status badges
- **Borrow History** tab: completed transactions where the user was the `receiver_id` (borrower)
- **Handover History** tab: completed transactions where the user was the `owner_id`
- **Requests** tab: pending requests, both incoming and outgoing (reuses Page 9's lists, combined into one view here for convenience)

## API Endpoints
```
GET /api/profile/activity
  returns: 200 { data: [items] }   -- WHERE user_id = req.user.id, all types/statuses

GET /api/profile/history?role=borrower|owner
  returns: 200 { data: [transactions] }
  -- role=borrower: WHERE receiver_id = req.user.id AND status='COMPLETED'
  -- role=owner:    WHERE owner_id = req.user.id AND status='COMPLETED'
```

## Database
Read-only aggregate queries — no new tables, just scoped `SELECT`s across `items` and `transactions`.

## Business Logic & Edge Cases
- Strictly scope every query to `req.user.id` — this page is the easiest place to accidentally leak another user's data, so double-check the WHERE clauses.
- Empty states per tab for new accounts.

## Acceptance Criteria
- [ ] Each tab shows only the logged-in user's own data.
- [ ] Borrow History and Handover History correctly separate borrower-side vs owner-side completed transactions.
- [ ] Requests tab correctly reflects live status from Pages 9 and 11.
