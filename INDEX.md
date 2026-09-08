# CampusLink — Page-by-Page Build Checklist

Build in this exact order — each page depends on the one(s) before it. Read `00-Shared-Reference.md` once before starting; every spec below assumes it.

**How to use these with Antigravity:** paste `00-Shared-Reference.md` + the one page spec you're currently building into Antigravity, in your real project folder. Don't jump ahead — later specs assume earlier pages already exist and work.

## Phase 1 — Foundation
- [x] Page 1 — Landing Page *(done: `campuslink-landing-v2.html`)*
- [ ] Page 2 — Signup, College Email Verification, Login → `02-Signup-Login.md`
- [ ] Page 3 — Home / Dashboard → `03-Home-Dashboard.md`

## Phase 2 — Lost & Found
- [ ] Page 4 — Post Lost/Found Item → `04-Post-Lost-Found-Item.md`
- [ ] Page 5 — Browse + Item Details → `05-Browse-Item-Details.md`
- [ ] Page 6 — My Posts → `06-My-Posts.md`

*Checkpoint: you now have a working MVP even with zero AI. Don't skip past this checkpoint without it fully working.*

## Phase 3 — Borrow
- [ ] Page 7 — List a Resource to Lend → `07-Borrow-List-Resource.md`
- [ ] Page 8 — Browse + Request → `08-Borrow-Browse-Request.md`
- [ ] Page 9 — Approve/Reject + Transaction → `09-Borrow-Approve-Transaction.md`
- [ ] Page 10 — Mark Returned → `10-Borrow-Return.md`

## Phase 4 — Give Away
- [ ] Page 11 — List → Browse → Claim → Approve → Handover → `11-GiveAway-Flow.md`

## Phase 5 — Profile & Notifications
- [ ] Page 12 — Profile (Activity / Borrow History / Handover History / Requests) → `12-Profile.md`
- [ ] Page 13 — Notifications → `13-Notifications.md`

*Checkpoint: full non-AI platform complete and demoable. This is your safety net.*

## Phase 6 — AI (build last, on top of a working platform)
- [ ] Page 14 — Embeddings + pgvector infrastructure → `14-AI-Embeddings-Setup.md`
- [ ] Page 15 — Lost ↔ Found AI Matching → `15-AI-LostFound-Matching.md`
- [ ] Page 16 — Need ↔ Resource AI Matching → `16-AI-Need-Resource-Matching.md`
- [ ] Page 17 — Smart Natural-Language Search *(optional, only if time remains)* → `17-AI-SmartSearch-Optional.md`

## If you run out of time
Stop after any checkpoint above — each one is a fully working, demoable state. Phase 6 is what makes the AI story strong for judges, but Phases 1–5 alone are already a complete, working product.
