# 05 — Contact & Grievance Desk Test Cases (`/contact`)

The **Citizen Support & Grievance Desk** provides a direct, reliable channel for citizens to report legal issues, inquire about legal aid, submit website feedback, or notify the project team of outdated or missing legal provisions.

---

## Test Scenarios Catalog

### Test Case 5.1: Successful Form Submission via Quick Preset
- **Action:**
  1. Open `/contact`.
  2. Click the **"Legal Aid"** quick preset button.
  3. Verify fields auto-fill:
     - Name: `Sunita Verma`
     - Email: `sunita.verma@example.com`
     - Phone: `+91 98765 43210`
     - Topic: `Free legal aid (NALSA / DLSA)`
     - Message: Pre-filled inquiry text.
  4. Click **"Submit Inquiry & Generate Ticket"**.
- **Expected Outcome:**
  - Spinner appears briefly (`Registering Inquiry...`).
  - Screen transitions to the **"Inquiry Successfully Registered"** confirmation card.
  - Generates a real ticket identifier (e.g. `NYA-2026-F8A2`).
  - Displays summary table with Name, Email, Category, and Registration Timestamp.
  - Shows 24–48 hour response SLA notice.

---

### Test Case 5.2: Copy Ticket ID to Clipboard
- **Action:** On the success screen from Test Case 5.1, click the **"Copy Ticket"** button.
- **Expected Outcome:**
  - Button toggles to a green checkmark icon with text **"Copied"**.
  - Clipboard contains the exact ticket ID string (`NYA-2026-XXXX`).

---

### Test Case 5.3: 1-Click Compose in Gmail Web
- **Action:** On the success screen, click **"Open in Gmail Web"**.
- **Expected Outcome:**
  - Opens `mail.google.com` in a new browser tab with:
    - Recipient pre-filled: `nyayaSahayakLegal@gmail.com`
    - Subject pre-filled: `[NYA-2026-XXXX] NyayaSahayak: Free legal aid (NALSA / DLSA)`
    - Body pre-filled with ticket ID, user name, email, and message text.

---

### Test Case 5.4: Input Validation (Short Name & Invalid Email)
- **Action:**
  1. Click **"New Inquiry"** to reset the form.
  2. Enter Name: `A` (less than 2 characters).
  3. Enter Email: `invalid-email-string` (missing `@` and domain).
  4. Enter Message: `help` (less than 10 characters).
  5. Click **"Submit Inquiry & Generate Ticket"**.
- **Expected Outcome:**
  - Form submission is prevented.
  - Red validation error borders appear on all three invalid fields.
  - Clear error messages display:
    - *"Please enter at least 2 characters."*
    - *"Please enter a valid email address."*
    - *"Message must contain at least 10 characters."*

---

### Test Case 5.5: Copy Project Email & Click-to-Call Helplines
- **Action:**
  1. In the right panel, observe the **"Direct Project Coordination Email"** card.
  2. Click **"Copy"** next to `nyayaSahayakLegal@gmail.com` -> Copied toast triggers.
  3. Under **"National 24×7 Citizen Helplines"**, click on the **15100** button.
  4. Verify the link triggers `tel:15100` (launches dialer on mobile / phone app on desktop).
  5. Repeat for **1930** (Cyber Fraud) and **181** (Women in Distress).
