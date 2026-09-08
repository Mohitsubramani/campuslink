# CampusLink — Shared Reference
*(Read this once. Every page spec below assumes this context instead of repeating it.)*

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- DB/Auth/Storage: Supabase (PostgreSQL + Auth + Storage)
- AI (Phase 6 only): Gemini API / free-tier embedding + LLM API, pgvector extension on Supabase Postgres

## Auth Convention
- All protected routes require a Supabase Auth session (JWT in `Authorization: Bearer <token>` header).
- Backend middleware `requireAuth` decodes the token, attaches `req.user = { id, email, name }`, and returns `401` if missing/invalid.
- Ownership checks (e.g. only the poster can edit their item) return `403` if `req.user.id` doesn't match the resource's owner field.

## API Convention
- Base path: `/api/...`, JSON in and out (except file uploads → `multipart/form-data`).
- Success: standard HTTP 200/201 + JSON body.
- Errors: `{ "error": "human-readable message" }` with the appropriate status code (`400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict, `500` server error).
- Pagination on list endpoints: `?page=1&limit=20`, response includes `{ data: [...], total, page, limit }`.

## Database Schema (authoritative — extend, don't fork)

```
users
------
id            uuid, pk
name          text
roll_no       text
email         text, unique
department    text
year          int
is_verified   boolean, default false
created_at    timestamptz

items                          -- type = LOST | FOUND | BORROW | GIVEAWAY
------
id                  uuid, pk
user_id             uuid, fk -> users.id      -- poster/owner
type                text
title               text
description         text
category            text
image_url           text, nullable
location            text
max_duration_days   int, nullable             -- BORROW only
status              text                      -- see status glossary below
embedding           vector(768), nullable     -- Phase 6 only
created_at          timestamptz

requests
---------
id             uuid, pk
item_id        uuid, fk -> items.id
requester_id   uuid, fk -> users.id
owner_id       uuid, fk -> users.id
note           text, nullable
requested_days int, nullable                  -- BORROW only
status         text                           -- PENDING | APPROVED | REJECTED
created_at     timestamptz

transactions
------------
id            uuid, pk
item_id       uuid, fk -> items.id
owner_id      uuid, fk -> users.id
receiver_id   uuid, fk -> users.id
type          text                            -- BORROW | GIVEAWAY | LOSTFOUND
start_date    timestamptz
return_date   timestamptz, nullable           -- BORROW only (expected return)
status        text                            -- ACTIVE | COMPLETED
created_at    timestamptz

notifications
-------------
id               uuid, pk
user_id          uuid, fk -> users.id
type             text                         -- MATCH_FOUND | REQUEST_RECEIVED | REQUEST_APPROVED | REQUEST_REJECTED | RETURN_DUE
message          text
related_item_id  uuid, nullable
is_read          boolean, default false
created_at       timestamptz
```

**Status glossary**
- `items.status`: `ACTIVE` (Lost/Found, unresolved) → `RESOLVED` · `AVAILABLE` (Borrow/Giveaway) → `BORROWED`/`CLAIMED` → back to `AVAILABLE` (Borrow, after return)
- `requests.status`: `PENDING` → `APPROVED` | `REJECTED`
- `transactions.status`: `ACTIVE` → `COMPLETED`

## Design System (from the Frontend module — reuse these tokens everywhere)
- Colors: surface `#ECEFF4`, ink `#1D2233`, ink-soft `#656C80`, accent gradient `#6C63FF → #8F7BFF`, accent teal `#1FC8B8`
- Fonts: Space Grotesk (headings), Inter (body/UI)
- Style: glassmorphic surfaces (`backdrop-filter: blur`) for nav/cards/panels, neumorphic soft-shadow elements for icon badges/stat chips/buttons, one accent gradient reserved for primary CTAs only
- Reference build: `campuslink-landing-v2.html`

## How to use these specs in Antigravity
Paste one page's spec + this shared reference into Antigravity per page, in the order given in `INDEX.md`. Each spec assumes all prior pages already exist — don't skip ahead.
