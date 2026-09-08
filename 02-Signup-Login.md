# Page 2: Signup, College Email Verification, Login
**Phase:** 1 — Foundation
**Depends on:** 00-Shared-Reference only
**Unlocks:** every other page (all routes below require a logged-in user)

## Goal
Only students with an approved college email domain can create an account; verification happens via OTP; returning users can log in.

## Routes
- `/signup` — signup form
- `/verify-otp` — OTP entry screen
- `/login` — login form

## UI Components
- `SignupForm`: name, roll_no, email, department, year, password → "Create Account" button
- `OtpScreen`: 6-digit input, "Verify" button, "Resend OTP" link with a 30s cooldown timer, shows the email it was sent to
- `LoginForm`: email, password → "Log In" button, "Forgot password" link (stub, no backend needed for hackathon)
- Reuse the glass/neumorphic input + button styles from the design system

## API Endpoints
```
POST /api/auth/signup
  body: { name, roll_no, email, department, year, password }
  logic: check email domain against ALLOWED_DOMAINS list (e.g. kce.ac.in, karpagamtech.ac.in)
         → 400 "College email required" if not allowed
         → create Supabase Auth user + users row (is_verified=false)
         → trigger OTP email via Supabase Auth
  returns: 201 { message: "OTP sent" }

POST /api/auth/verify-otp
  body: { email, otp }
  logic: verify via Supabase Auth → set users.is_verified = true
  returns: 200 { token, user }
  errors: 410 if OTP expired, 400 if incorrect

POST /api/auth/login
  body: { email, password }
  logic: Supabase Auth sign-in
  returns: 200 { token, user }
  errors: 401 bad credentials, 403 "Please verify your email" if is_verified = false
```

## Database
- Insert into `users` on signup (before verification, with `is_verified=false`).
- Flip `is_verified` to `true` on successful OTP verification.

## Business Logic & Edge Cases
- Duplicate email on signup → `409`.
- Non-college domain → reject before hitting Supabase Auth at all (cheap check first).
- Resend OTP → rate-limit to 1 per 30 seconds per email.
- Login before verification → `403`, frontend redirects back to `/verify-otp`.

## Acceptance Criteria
- [ ] Signing up with a `@gmail.com` email is rejected with a clear message.
- [ ] Signing up with an approved college email sends an OTP and lands on `/verify-otp`.
- [ ] Correct OTP verifies the account and redirects to `/home`.
- [ ] Logging in with a verified account works; with an unverified account, redirects to OTP screen.
