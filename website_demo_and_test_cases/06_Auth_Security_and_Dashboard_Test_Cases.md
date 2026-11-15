# 06 — Authentication, Security & Dashboard Test Cases (`/auth`, `/dashboard`)

NyayaSahayak features a passwordless, secure authentication system backed by **Google Identity Services (GIS)** and **Real-Time 6-Digit Email OTP Verification**, preserving user privacy and session data under Articles 21 & 39A compliance.

---

## Test Scenarios Catalog

### Test Case 6.1: Google One-Tap Sign In
- **Action:**
  1. Navigate to `/auth`.
  2. Click the official **"Continue with Google"** button.
  3. Complete Google account selection.
- **Expected Outcome:**
  - Token is generated and stored in memory.
  - User is redirected to `/dashboard` or the originating legal consultation page.
  - Navbar updates to display the user's Google profile avatar and greeting.

---

### Test Case 6.2: Real-Time Email OTP Verification Flow
- **Action:**
  1. In `/auth`, fill in:
     - Name: `Priya Sharma`
     - Email Address: `priya.sharma@example.com`
  2. Click **"Send Verification Code"**.
- **Expected Outcome:**
  - Button switches to loading state, then reveals the 6-digit OTP input view.
  - Notice displays: *"6-digit verification code sent to priya.sharma@example.com"*.
  - A countdown timer (e.g. 60 seconds) starts for OTP resend.
  - Entering the correct 6-digit code automatically submits or unlocks **"Verify Code & Sign In"**.
  - On verification, redirects to `/dashboard`.

---

### Test Case 6.3: Rate Limiting & Invalid OTP Handling
- **Action:**
  1. In the OTP screen, enter an incorrect code: `000000`.
  2. Click **"Verify Code"**.
- **Expected Outcome:**
  - Error message is displayed: *"Invalid or expired verification code"*.
  - User is allowed up to 5 attempts before the code is invalidated.

---

### Test Case 6.4: Dashboard Research History & Session Persistence
- **Action:**
  1. After signing in, navigate to `/dashboard`.
  2. Observe the sections:
     - Personal Citizen Greeting with Name and Email.
     - Quick Navigation Cards to Citizen Tools (Bail Calculator, Scanner, Drafting Studio, Legal Aid).
     - Recent Legal Queries and Saved Research log.
- **Expected Outcome:**
  - Previous consultations made in `/assistant` appear with timestamps and topic tags.
  - Clicking any previous query re-opens the question in `/assistant`.
