# Page 15: AI Lost ↔ Found Matching
**Phase:** 6 — AI
**Depends on:** 14-AI-Embeddings-Setup
**Unlocks:** 16-AI-Need-Resource-Matching (same pipeline, different filter)

## Goal
When viewing a LOST item, show the AI's best-guess FOUND matches with a confidence score — this is the centerpiece "AI feature" for the judges.

## Routes
- Adds a "Potential Matches" section to the existing `/lost-found/:id` detail page (Page 5) — only shown when `item.type === 'LOST'`

## UI Components
- "Potential Matches" section: 3–5 candidate cards, each with the found item's thumbnail, title, location, and a confidence badge styled like the existing `93% Potential Match` chip from the design system
- "This looks like mine" CTA per candidate → creates a request linking the two items (reuses the `POST /api/requests` pattern from Page 8, with `item_id` = the FOUND item)
- Empty state: "No matches yet — we'll notify you if one appears" (ties into Page 13's notification trigger)

## API Endpoint
```
GET /api/items/:id/matches
  auth: required
  logic (only valid if item.type === 'LOST'):
    1. Structured filter: type='FOUND', status='ACTIVE', same category (or category=null)
    2. Vector search: cosine similarity between this item's embedding and filtered candidates' embeddings
       via pgvector — retrieve Top 20 by similarity
    3. AI reranking: send the LOST item + the 20 candidates' text fields to an LLM,
       ask it to score/rank by semantic similarity + location/time proximity + distinguishing details,
       and return a short explanation per candidate
    4. Return the Top 3–5 with a percentage score
  returns: 200 { matches: [ { item, score, explanation } ] }
  caching: cache this result for ~10 minutes per lost item so repeated page views don't
           re-run the AI reranking step every time
```

## Database
Read-only — queries `items` (with the `embedding` column via pgvector's `<=>` distance operator) and `pg_vector` index. No schema changes beyond what Page 14 already added.

## Business Logic & Edge Cases (this is the part judges will ask about — know it cold)
- **Never compare against every FOUND item.** Structured filtering + vector Top-20 retrieval happens first; the expensive AI reranking step only ever sees ~20 candidates, regardless of how large the FOUND table grows.
- If vector search returns zero candidates (e.g. brand-new category with nothing similar yet), skip the reranking call entirely and show the empty state — don't waste an AI call on nothing.
- Recomputing on every page view is wasteful — cache per lost-item-id for a short window.

## Acceptance Criteria
- [ ] Viewing a LOST item's detail page shows ranked FOUND candidates with % scores.
- [ ] Posting a FOUND item that closely matches an existing LOST item causes it to surface as a top candidate on next view.
- [ ] The matching pipeline demonstrably filters + retrieves Top-20 before any AI reranking call (this should be visible in your backend logs/architecture diagram for the demo).
- [ ] "This looks like mine" creates a proper request/notification, tying back into Pages 8/13.
