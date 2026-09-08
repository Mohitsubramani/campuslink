# Page 4: Post Lost / Found Item
**Phase:** 2 — Lost & Found
**Depends on:** 03-Home-Dashboard
**Unlocks:** 05-Browse-ItemDetails, 06-My-Posts

## Goal
Let a student post a lost item or a found item with enough detail for later browsing and (in Phase 6) AI matching.

## Routes
- `/lost-found/new?type=LOST` or `?type=FOUND`

## UI Components
- `ItemForm`: image upload (single image, drag-or-click), title, description (textarea), category dropdown (Bags, Electronics, ID/Documents, Books, Keys, Other), location (free text), date/time picker
- Submit button label changes based on type: "Post Lost Item" / "Post Found Item"

## API Endpoints
```
POST /api/items
  auth: required
  content-type: multipart/form-data
  body: { type: 'LOST'|'FOUND', title, description, category, location, image (file) }
  logic: upload image to Supabase Storage bucket `item-images` → get public URL
         → insert items row: user_id=req.user.id, status='ACTIVE'
  returns: 201 { item }
  errors: 400 if required fields missing, 413 if image too large (limit 5MB)
```

## Database
- Insert into `items` with `type`, `status='ACTIVE'`, `image_url` from Storage.

## Business Logic & Edge Cases
- Only one image in v1 — don't build multi-image upload, it's not worth the time here.
- Accept image types: jpg/png/webp only.
- `location` and `category` are plain fields for now — no map picker needed.

## Acceptance Criteria
- [ ] Posting a LOST item with an image succeeds and returns the created item.
- [ ] Posting a FOUND item works identically with `type=FOUND`.
- [ ] Missing title/description is rejected with a clear 400 message.
- [ ] The new item is immediately visible on the Browse page (Page 5).
