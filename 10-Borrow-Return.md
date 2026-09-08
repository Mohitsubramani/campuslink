# Page 10: Mark Borrowed Item as Returned
**Phase:** 3 — Borrow
**Depends on:** 09-Borrow-Approve-Transaction
**Unlocks:** completes the Borrow module

## Goal
Close the loop: the owner marks an item returned, freeing it up for the next borrower.

## Routes
- `/borrow/lent` — items I've lent out (as owner), with due dates
- `/borrow/borrowed` — items I've borrowed (as borrower), with due dates

## UI Components
- List cards showing item, borrower/owner name, due date (highlighted red if overdue: `now > return_date`)
- "Mark Returned" button — visible only on the owner's `/borrow/lent` view

## API Endpoints
```
GET /api/transactions/mine?role=owner|borrower
  auth: required
  returns: 200 { data: [transactions with item + counterpart user info] }

PATCH /api/transactions/:id
  auth: required
  body: { status: 'COMPLETED' }
  logic: only allowed if req.user.id === transaction.owner_id
         → update transactions.status = 'COMPLETED'
         → update items.status = 'AVAILABLE'
  returns: 200 { transaction }
  errors: 403 if not the owner, 409 if already completed
```

## Database
Update `transactions.status` and `items.status`.

## Business Logic & Edge Cases
- Overdue styling is frontend-only (compare `return_date` to current time) — no backend cron needed yet (that arrives with notifications, Page 13).
- Only the owner marks it returned in v1 — don't build a two-sided confirmation flow, it's not worth the time.

## Acceptance Criteria
- [ ] Marking returned frees the item (`status='AVAILABLE'`) so it can be borrowed again.
- [ ] Overdue items are visually flagged on both the lent and borrowed views.
- [ ] Non-owner cannot mark another owner's transaction as returned.
