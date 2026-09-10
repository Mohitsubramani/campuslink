# CampusLink — Smart Campus Resource Sharing & AI Lost-and-Found Platform

CampusLink is an exclusive full-stack platform built for college students to post lost/found belongings, borrow equipment, pass down free giveaway items, and utilize AI semantic matching.

---

## Allowed College Domains
- `@kce.ac.in`
- `@kahed.edu.in`
- `@karpagamtech.edu.in`

---

## Project Structure

```
c:/Users/Mohit S/Downloads/files/
├── client/                     # Vite + React + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Glassmorphism Navbar, UI Cards
│   │   ├── context/            # AuthContext (JWT & Supabase state)
│   │   ├── pages/              # Landing, Signup, Verify OTP, Login, Dashboard
│   │   ├── App.jsx             # React Router setup & protected routes
│   │   ├── index.css           # Design Tokens & Neumorphic styling
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Node.js + Express Backend API
│   ├── src/
│   │   ├── lib/supabase.js     # Supabase client + Dev Memory fallback
│   │   ├── middleware/auth.js  # requireAuth JWT middleware
│   │   ├── routes/auth.js      # Signup, OTP verification, Resend, Login APIs
│   │   ├── routes/dashboard.js # Home Dashboard stats API
│   │   └── index.js            # Express app entry point
│   ├── .env
│   └── package.json
│
├── supabase/
│   └── schema.sql              # Database table definitions & pgvector setup
│
└── INDEX.md                    # 17-Part Page-by-Page Checklist
```

---

## Getting Started

### 1. Database Setup (Supabase)
Run the contents of [`supabase/schema.sql`](file:///c:/Users/Mohit%20S/Downloads/files/supabase/schema.sql) in your [Supabase SQL Editor](https://supabase.com).

### 2. Start Backend Server
```bash
cd server
npm install
npm run dev
```
*Server runs on http://localhost:5000*

### 3. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
*Client runs on http://localhost:3000*

---

## Phase Progress
- [x] **Page 1**: Glassmorphic Landing Page (`/`)
- [x] **Page 2**: Signup (`/signup`), College Domain Check, OTP Entry (`/verify-otp`), Login (`/login`)
- [x] **Page 3**: Home Dashboard (`/home`)
- [x] **Phase 2 — Lost & Found** (Pages 4–6)
- [x] **Phase 3 — Resource Borrowing** (Pages 7–10)
- [x] **Phase 4 — Give Away** (Page 11)
- [x] **Phase 5 — Profile & Notifications** (Pages 12–13)
- [x] **Phase 6 — Gemini AI Embeddings & Vector Search** (Pages 14–17)
