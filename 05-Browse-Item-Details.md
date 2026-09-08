# Page 5: Browse Lost & Found + Item Details
**Phase:** 2 — Lost & Found
**Depends on:** 04-Post-Lost-Found-Item
**Unlocks:** 06-My-Posts, 15-AI-LostFound-Matching (adds to the detail page later)

## Goal
Let any student browse active lost/found posts and view full details of one.

## Routes
- `/lost-found` — browse/list, with a `type` toggle (Lost / Found)
- `/lost-found/:id` — detail page

## UI Components
- Filter bar: type toggle, category dropdown, location text filter
- Grid of item cards: image thumbnail, title, location, "Lost"/"Found" badge
- Detail page: full image, description, category, location, date, poster's name only (no contact info exposed directly — that comes via a request/claim flow, kept simple for v1 as a "Contact" button that's a stub)
- "Resolved" badge overlay if `status='RESOLVED'`

## API Endpoints
```
GET /api/items?type=LOST|FOUND&category=&location=&page=&limit=
  returns: 200 { data: [items], total, page, limit }   // status=ACTIVE only by default

GET /api/items/:id
  returns: 200 { item, poster: { name } }
  errors: 404 if not found
```

## Database
Read-only queries on `items`, filtered by `type` and `status='ACTIVE'`, joined to `users` for the poster's name only.

## Business Logic & Edge Cases
- Empty results → friendly empty state ("No lost items match your filters yet").
- Resolved items are excluded from the default browse list but still viewable directly by ID (shows the "Resolved" badge).

## Acceptance Criteria
- [ ] Browsing shows only `ACTIVE` items of the selected type.
- [ ] Filters (category, location) narrow the results correctly.
- [ ] Detail page loads the correct item and poster name.
- [ ] Visiting a resolved item's URL still works but shows it as resolved.
