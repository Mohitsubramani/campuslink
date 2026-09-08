# Page 9: Approve / Reject Borrow Requests
**Phase:** 3 — Borrow
**Depends on:** 08-Borrow-Browse-Request
**Unlocks:** 10-Borrow-Return

## Goal
Let the owner approve or reject incoming borrow requests; approval creates a tracked transaction.

## Routes
- `/borrow/requests` — incoming requests (as owner)
- `/borrow/requests/mine` — outgoing requests (as requester), shows live status

## UI Components
- Incoming list: requester name, requested days, note, Approve/Reject buttons
- Outgoing list: item, status badge (Pending/Approved/Rejected), due date once approved

## API Endpoints
```
GET /api/requests/incoming     -- auth required, owner_id = req.user.id
GET /api/requests/mine         -- auth required, requester_id = req.user.id

PATCH /api/requests/:id
  auth: required
  body: { status: 'APPROVED'|'REJECTED' }
  logic: only allowed if req.user.id === request.owner_id
         → 409 if request.status !== 'PENDING' (already decided)
         if APPROVED:
           - insert transactions row: type='BORROW', item_id, owner_id, receiver_id=requester_id,
             start_date=now, return_date=now + requested_days, status='ACTIVE'
           - update items.status = 'BORROWED'
         if REJECTED:
           - just update requests.status
  returns: 200 { request, transaction? }
```

## Database
- Update `requests.status`.
- On approval: insert `transactions`, update `items.status`.

## Business Logic & Edge Cases
- Only the owner can decide — `403` otherwise.
- Re-deciding an already-decided request → `409`.
- Approving one request for an item should implicitly make other pending requests for the same item show as unavailable on the frontend (item is now `BORROWED`) — but leave those other requests' status as `PENDING` in the DB rather than auto-rejecting them, to keep this simple; just filter them out of "available to act on" in the UI.

## Acceptance Criteria
- [ ] Approving creates a transaction and flips the item to `BORROWED`.
- [ ] Rejecting only updates the request, no transaction created.
- [ ] Requester sees the updated status and due date immediately after approval.
