# 03 — Bare Acts Explorer & Gazette Verification (`/acts`, `/official`)

The **Bare Acts & Official Gazette Module** provides an authentic, gazette-verified repository of India's newly enacted legal framework, enabling clause-by-clause reading, chapter filtering, and official verification against Ministry of Law and Justice gazette notifications.

---

## Test Scenarios & Verification Workflow

### Test Case 3.1: Switch Between Indexed Core Statutes
- **Action:** Open `/acts` and click the Statute selector tabs.
- **Statutes to Verify:**
  1. **Bharatiya Nyaya Sanhita, 2023** (Act No. 45 of 2023) — 358 Sections.
  2. **Bharatiya Nagarik Suraksha Sanhita, 2023** (Act No. 46 of 2023) — 531 Sections.
  3. **Bharatiya Sakshya Adhiniyam, 2023** (Act No. 47 of 2023) — 170 Sections.
  4. **The Constitution of India** — Fundamental Rights, Directive Principles, Writs.
  5. **POCSO Act, 2012** (Act No. 32 of 2012).
- **Expected Verification Points:**
  - Act title, Act Number, Year, and Gazetted Date are displayed prominently.
  - Section count dynamically updates.
  - Left navigation list displays all sections in numerical order.

---

### Test Case 3.2: Filtering Sections by Chapter / Keyword
- **Action on `/acts`:**
  1. Select **Bharatiya Nyaya Sanhita, 2023**.
  2. In the search/filter input box, type: `"defamation"`.
  3. Observe filtered list: Section 356 (*Defamation*) appears immediately.
  4. Click on **Section 356** -> Main pane renders the definition, exceptions, and community service / simple imprisonment punishments.

---

### Test Case 3.3: Official Gazette Verification Badge (`/official`)
- **Action:** Navigate to `/official`.
- **Expected Verification Points:**
  1. Displays the **"Official Acts and Official Gazette Corpus"** hero banner.
  2. Shows the statutory audit badge verifying that all indexed text originates directly from the official Extraordinary Gazette of India notifications published by the Authority.
  3. Provides outbound links to official government repositories (`egazette.gov.in` and `indiacode.nic.in`).

---

### Test Case 3.4: Trilingual Bare Act UI Rendering
- **Action:**
  1. Switch language to **हिन्दी** via navbar.
  2. Section headings and chapter descriptions update to Devanagari Hindi.
  3. Switch language to **ਪੰਜਾਬੀ** via navbar.
  4. Interface updates to Gurmukhi Punjabi.
