# Page 8: Browse Borrow Listings + Request to Borrow
**Phase:** 3 — Borrow
**Depends on:** 07-Borrow-List-Resource
**Unlocks:** 09-Borrow-Approve-Transaction

## Goal
Let students browse available items to borrow and send a request to the owner.

## Routes
- `/borrow` — browse/list (status='AVAILABLE' only)
- `/borrow/:id` — detail page with a "Request to Borrow" action

## UI Components
- Grid of cards (same visual pattern as Page 5): image, title, max duration, category
- Detail page: full description + a "Request to Borrow" button that opens a small modal (requested days, optional note) → submits the request

## API Endpoints
```
GET /api/items?type=BORROW&status=AVAILABLE&category=&page=&limit=
GET /api/items/:id

POST /api/requests
  auth: required
  body: { item_id, requested_days, note }
  logic: owner_id = item.user_id, requester_id = req.user.id, status='PENDING'
         → reject with 400 if requester_id === owner_id ("You can't borrow your own item")
         → reject with 409 if item.status !== 'AVAILABLE'
  returns: 201 { request }
```

## Database
Insert into `requests`. No change to `items.status` yet — that only flips on approval (Page 9).

## Business Logic & Edge Cases
- Disable/hide the "Request to Borrow" button on the frontend if `item.status !== 'AVAILABLE'` (defense in depth alongside the backend check).
- A student can have at most one pending request per item — reject a duplicate pending request with `409`.

## Acceptance Criteria
- [ ] Browse shows only available Borrow items.
- [ ] Requesting your own item is blocked.
- [ ] A valid request is created with `status='PENDING'` and appears in the owner's incoming requests (Page 9).
