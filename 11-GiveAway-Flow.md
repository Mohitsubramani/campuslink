# Page 11: Give Away — List, Browse, Claim, Approve, Handover
**Phase:** 4 — Give Away
**Depends on:** 10-Borrow-Return (reuses the Borrow pattern minus the return step)
**Unlocks:** 12-Profile

## Goal
Same shape as Borrow, but simpler — no due dates, no return step. Build this fast by adapting Pages 7–9's components and endpoints.

## Routes
- `/giveaway/new` — list an item to give away
- `/giveaway` — browse available giveaways
- `/giveaway/:id` — detail + "Claim This" button
- `/giveaway/claims` — incoming claims (owner view)
- `/giveaway/mine` — my outgoing claims

## UI Components
- Reuse `ItemForm` with `type='GIVEAWAY'` (no `max_duration_days` field needed for this type)
- Reuse the browse grid and detail page pattern from Pages 5/8
- Reuse the incoming/outgoing request list pattern from Page 9, relabeled "Claims" instead of "Requests"

## API Endpoints
```
POST /api/items                     -- type='GIVEAWAY', status='AVAILABLE' (existing endpoint, no changes)
GET  /api/items?type=GIVEAWAY&status=AVAILABLE
GET  /api/items/:id
POST /api/requests                  -- item_id only, no requested_days needed for GIVEAWAY
GET  /api/requests/incoming / mine  -- existing endpoints, already generic across types

PATCH /api/requests/:id
  body: { status: 'APPROVED'|'REJECTED' }
  logic: if APPROVED and item.type === 'GIVEAWAY':
           - insert transactions: type='GIVEAWAY', start_date=now, return_date=null, status='COMPLETED'  (immediately complete — no return step)
           - update items.status = 'CLAIMED'
```

## Database
Same `requests`/`transactions`/`items` tables — only the branching logic in the existing `PATCH /api/requests/:id` handler needs a `type==='GIVEAWAY'` case added.

## Business Logic & Edge Cases
- No due dates, no "mark returned" page needed — a giveaway transaction is `COMPLETED` the moment it's approved.
- Once claimed, the item disappears from the browse list (`status='CLAIMED'` excluded from `AVAILABLE` queries).

## Acceptance Criteria
- [ ] Listing, browsing, and claiming all work end to end.
- [ ] Approving a claim immediately completes the transaction (no separate return step).
- [ ] Claimed items no longer appear in the giveaway browse list.
