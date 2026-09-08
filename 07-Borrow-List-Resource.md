# Page 7: List a Resource to Lend
**Phase:** 3 — Borrow
**Depends on:** 06-My-Posts (reuses the same item-posting pattern)
**Unlocks:** 08-Borrow-Browse-Request

## Goal
Let a student list something they own for other students to borrow temporarily.

## Routes
- `/borrow/new`

## UI Components
- `ItemForm` — same component as Page 4, reused with `type='BORROW'`, plus one extra field: `max_duration_days` (number input, "Max days you're willing to lend for")

## API Endpoints
```
POST /api/items
  (same endpoint as Page 4 — it already handles `type` generically)
  body adds: max_duration_days (int, required when type='BORROW')
  logic: insert items row with status='AVAILABLE' instead of 'ACTIVE'
  returns: 201 { item }
```

## Database
Same `items` table — no schema change needed, `max_duration_days` column already exists per Shared Reference.

## Business Logic & Edge Cases
- `status` for BORROW/GIVEAWAY items is `AVAILABLE` (not `ACTIVE`, which is Lost/Found-specific) — keep this distinction consistent in every later query.
- `max_duration_days` must be a positive integer.

## Acceptance Criteria
- [ ] Listing a resource succeeds with `status='AVAILABLE'`.
- [ ] The item appears on the Borrow browse page (Page 8) immediately.
- [ ] Reused `ItemForm` component confirms Page 4's form was built generically enough to extend — if not, refactor now before Give Away (Page 11) needs it too.
