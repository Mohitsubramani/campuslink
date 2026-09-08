# Page 17: Smart Natural-Language Search (OPTIONAL — only if time remains)
**Phase:** 6 — AI, stretch goal
**Depends on:** 16-AI-Need-Resource-Matching
**Status:** Build this LAST, only if Pages 2–16 are fully working with time to spare. Do not start this while any earlier page is incomplete.

## Goal
Let the existing search bars on `/lost-found` and `/borrow` accept plain-language queries ("I lost a black bag near the library yesterday") instead of requiring structured filter selection.

## Routes
- No new route — enhances the existing search bars on Pages 5 and 8

## API Endpoint
```
POST /api/ai/parse-query
  body: { text }
  logic: send text to an LLM, ask it to extract { object, color, location, time_range, category }
  returns: 200 { object, color, location, time_range, category }
```
The frontend then feeds these extracted fields into the **existing** `GET /api/items?...` filters (Page 5/8) — this endpoint doesn't search anything itself, it only translates free text into the structured filters you already built.

## Business Logic & Edge Cases
- If the LLM can't confidently extract a field, leave it blank rather than guessing — an overly-narrow guessed filter (wrong location) is worse than no filter.
- This is a nice-to-have polish feature, not core to the "we don't do exhaustive search" architecture story — don't let it eat time that Pages 2–16 need.

## Stretch-within-a-stretch (only if everything else is done early)
- Image embeddings: combine `image_url` visual features with the text embedding for a stronger Lost↔Found match signal. Only attempt this after Page 15's text-only matching is fully working and demoed — it's an enhancement, not a dependency.

## Acceptance Criteria
- [ ] A natural-language search query populates the existing structured filters correctly.
- [ ] Ambiguous or unparseable queries fall back gracefully to an unfiltered browse rather than erroring out.
