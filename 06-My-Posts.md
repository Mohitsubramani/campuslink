# Page 6: My Lost & Found Posts
**Phase:** 2 — Lost & Found
**Depends on:** 05-Browse-Item-Details
**Unlocks:** completes the Lost & Found module (core CRUD loop is now done)

## Goal
Let a student see and manage their own lost/found posts, and mark one resolved once it's handled.

## Routes
- `/lost-found/mine` — tabs: My Lost, My Found

## UI Components
- Tabbed list identical in style to Page 5's cards, plus a "Mark Resolved" button on each active card
- Resolved items shown in a collapsed/secondary section within the same tab

## API Endpoints
```
GET /api/items/mine?type=LOST|FOUND
  auth: required
  returns: 200 { data: [items] }   // scoped to req.user.id, all statuses

PATCH /api/items/:id
  auth: required
  body: { status: 'RESOLVED' }
  logic: only allowed if req.user.id === item.user_id
  returns: 200 { item }
  errors: 403 if not the owner, 404 if not found
```

## Database
Update `items.status` for the caller's own rows only.

## Business Logic & Edge Cases
- Attempting to resolve someone else's post → `403` (test this explicitly).
- Resolving an item does not delete it — it stays visible in "My Posts" for the record.

## Acceptance Criteria
- [ ] Owner sees only their own posts, split by Lost/Found.
- [ ] "Mark Resolved" updates status and moves the item to the resolved section.
- [ ] Attempting the PATCH as a non-owner (via API directly) returns 403.
