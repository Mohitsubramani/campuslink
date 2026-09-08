# Page 14: AI Embeddings Infrastructure (no user-facing page)
**Phase:** 6 — AI
**Depends on:** 13-Notifications (the full non-AI platform should already work)
**Unlocks:** 15-AI-LostFound-Matching, 16-AI-Need-Resource-Matching

## Goal
Set up the plumbing so every item gets a stored embedding — without this, Pages 15–16 have nothing to search against. This is backend/infra only, nothing for the user to see.

## What to do
1. Enable the `pgvector` extension on the Supabase Postgres instance.
2. Confirm the `items.embedding vector(768)` column exists (already in the schema per Shared Reference — create it now if it wasn't added earlier).
3. Write one internal function: `generateEmbedding(text: string): number[]` that calls the chosen embedding API (Gemini embeddings or another free-tier text-embedding model — pick ONE and stick with it, don't mix models for the same column).
4. Hook it into the **existing** `POST /api/items` handler (Page 4/7/11's endpoint — same one, don't duplicate it): after inserting the item, build a text string from `title + description + category`, generate its embedding, and `UPDATE items SET embedding = ... WHERE id = ...`.
5. Add a small backfill script (one-off, run manually) that generates embeddings for any pre-existing items that don't have one yet.

## Business Logic & Edge Cases
- **Never regenerate an embedding on every search** — generate once at create/update time, store it, reuse it. This is the entire point of the architecture (see the RAG/scalability discussion) — search time should only read stored embeddings, not call the embedding API per search.
- If the embedding API call fails, the item should still save successfully (catch the error, log it, leave `embedding = NULL`, and let the backfill script pick it up later). Don't block item creation on AI availability.
- If an item's `title`/`description`/`category` is edited later, regenerate its embedding on that update too.

## Acceptance Criteria
- [ ] `pgvector` extension is active on the database.
- [ ] Every newly created item has a non-null `embedding` within a few seconds.
- [ ] An embedding-API outage does not prevent item creation (graceful degradation).
- [ ] A backfill script exists and successfully fills in embeddings for older items.
