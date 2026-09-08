# Page 16: AI Need ↔ Resource Matching
**Phase:** 6 — AI
**Depends on:** 15-AI-LostFound-Matching (reuses the exact same pipeline function, different source filter)
**Unlocks:** 17-AI-SmartSearch (optional stretch)

## Goal
Let a student describe what they need in plain language and get ranked Borrow/Giveaway suggestions — same underlying architecture as Page 15, applied to a different table filter. This is what proves to judges the AI isn't a one-off feature but a reusable layer.

## Routes
- `/borrow/need` — new small page: "What do you need?" text input + optional duration

## UI Components
- Simple form: free-text need description, optional "for how many days" field
- Results list: same candidate-card + confidence-badge style as Page 15

## API Endpoint
```
POST /api/ai/need-match
  auth: required
  body: { query_text, duration_days? }
  logic:
    1. Generate an embedding for query_text (reuse Page 14's generateEmbedding function)
    2. Structured filter: type IN ('BORROW','GIVEAWAY'), status='AVAILABLE'
    3. Vector search: Top 20 by similarity against the filtered set
    4. AI reranking: same reranking function built for Page 15, generalized to accept
       "a query" instead of "a lost item" as the anchor — this is the point where you
       should refactor Page 15's reranker into a shared function taking (anchorText, candidates)
       rather than writing a second one from scratch
    5. Return Top 3–5
  returns: 200 { matches: [ { item, score, explanation } ] }
```

## Database
Read-only, same pattern as Page 15 — no schema changes.

## Business Logic & Edge Cases
- This endpoint is proof that the retrieval pipeline (embed → filter → vector search → rerank) is reusable, not Lost & Found-specific — build it by extracting Page 15's pipeline into a shared function, don't copy-paste and diverge it.
- A query like "Arduino UNO" should surface an "Arduino kit" or "Arduino + sensors" listing even without an exact keyword match — this is the concrete demo moment for judges.

## Acceptance Criteria
- [ ] A natural-language need query returns relevant Borrow/Giveaway items even when the exact product name doesn't match.
- [ ] The underlying pipeline function is shared with Page 15, not duplicated (check this in code review before the demo).
- [ ] Results respect `status='AVAILABLE'` — claimed/borrowed items never appear.
