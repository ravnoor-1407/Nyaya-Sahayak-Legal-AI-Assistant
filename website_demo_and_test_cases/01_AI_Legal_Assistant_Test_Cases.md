# 01 — AI Legal Assistant Test Cases (`/assistant`)

The **Nyaya AI Legal Assistant** is powered by a grounded Retrieval-Augmented Generation (RAG) architecture indexing the Bharatiya Nyaya Sanhita, 2023 (BNS), Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS), Bharatiya Sakshya Adhiniyam, 2023 (BSA), the Constitution of India, and allied public welfare acts.

---

## Test Scenarios Catalog

### Test Case 1.1: Police Arrest Rights under BNSS 2023
- **Prompt:** `"Can police arrest without a warrant in India, and what are my rights at the time of arrest?"`
- **Category:** Criminal Procedure & Fundamental Rights
- **Target Statutory Citations:**
  - `BNSS Section 35` (Arrest without warrant guidelines)
  - `BNSS Section 47` (Informing grounds of arrest & right to bail)
  - `BNSS Section 48` (Right to have family member informed)
  - `BNSS Section 58` (Production before Magistrate within 24 hours)
  - `Constitution of India, Article 22`
- **Expected Verification Points:**
  1. Clearly distinguishes cognizable vs non-cognizable offences.
  2. Mentions mandatory production before Magistrate within 24 hours excluding travel time.
  3. Displays interactive source pill badges (`BNSS Section 35`, `BNSS Section 47`, etc.).
  4. Statutory Audit pill displays verified citations (`80%+`).

---

### Test Case 1.2: Protection for Senior Citizens and Minor Offences
- **Prompt:** `"Can police arrest an elderly person or a woman for an offence punishable with less than 3 years?"`
- **Category:** BNSS 2024 Procedural Safeguards
- **Target Statutory Citations:**
  - `BNSS Section 35(7)` (Prior permission requirement from DSP/senior officer for elderly / infirm persons accused of offences punishable with less than 3 years)
- **Expected Verification Points:**
  1. Assistant highlights that under Section 35(7) BNSS, no arrest of a person who is infirm or over 60 years of age can be made without prior permission of an officer not below the rank of Deputy Superintendent of Police (DSP).
  2. Explains preliminary inquiry safeguard for offences punishable with 3 to 7 years.

---

### Test Case 1.3: Digital Evidence & Electronic Records Admissibility
- **Prompt:** `"What is required to submit a WhatsApp chat or phone recording as evidence in court under the new Bharatiya Sakshya Adhiniyam?"`
- **Category:** Law of Evidence (BSA 2023)
- **Target Statutory Citations:**
  - `BSA Section 61` (Admissibility of electronic records)
  - `BSA Section 63` (Certificate requirement for electronic evidence, replacing former Sec 65B of Indian Evidence Act)
- **Expected Verification Points:**
  1. Identifies Section 63 BSA as the direct successor to former Section 65B of the Indian Evidence Act, 1872.
  2. Clarifies the requirement of a certificate signed by the person in lawful charge of the device or computer system.
  3. Notes that primary and secondary electronic storage are codified under BSA.

---

### Test Case 1.4: Refusal by Police Station to Register FIR (Zero-FIR Remedy)
- **Prompt:** `"What legal remedies are available if a police station refuses to lodge my FIR for theft or assault?"`
- **Category:** Citizen Remedies & Police Accountability
- **Target Statutory Citations:**
  - `BNSS Section 173(1)` (Mandatory Zero-FIR registration irrespective of territorial jurisdiction)
  - `BNSS Section 173(3)` (Preliminary inquiry for offences punishable between 3 to 7 years)
  - `BNSS Section 173(4)` (Remedy of sending substance of complaint in writing to Superintendent of Police)
  - `BNSS Section 175(3) / 175(4)` (Application before Judicial Magistrate)
- **Expected Verification Points:**
  1. Details Zero-FIR concept: police must record the complaint and transfer it to the jurisdictional station.
  2. Mentions sending written complaint by post to the Superintendent of Police (SP).
  3. Mentions approaching the Magistrate if SP fails to act.

---

### Test Case 1.5: Trilingual Hindi Legal Consultation
- **Prompt (हिन्दी):** `"यदि कोई चेक बाउंस हो जाए तो कानूनी नोटिस भेजने के लिए कितना समय मिलता है?"`
- **Category:** Commercial & Negotiable Instruments Act
- **Target Statutory Citations:**
  - `Negotiable Instruments Act, 1881, Section 138`
- **Expected Verification Points:**
  1. Assistant detects Devanagari script and answers entirely in accurate legal Hindi.
  2. States the mandatory **30-day window** from the date of receiving the bank memo to issue a statutory demand notice.
  3. Explains the **15-day period** given to the drawer to make payment before a criminal complaint can be filed within the next 30 days.

---

### Test Case 1.6: Trilingual Punjabi Legal Consultation
- **Prompt (ਪੰਜਾਬੀ):** `"ਮੁਫ਼ਤ ਸਰਕਾਰੀ ਵਕੀਲ ਲੈਣ ਲਈ ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਅਥਾਰਟੀ ਐਕਟ ਦੀ ਧਾਰਾ 12 ਅਧੀਨ ਕੌਣ ਯੋਗ ਹੈ?"`
- **Category:** Free Legal Aid & Access to Justice
- **Target Statutory Citations:**
  - `Legal Services Authorities Act, 1987, Section 12`
  - `Constitution of India, Article 39A`
- **Expected Verification Points:**
  1. Assistant detects Gurmukhi script and responds in natural legal Punjabi.
  2. Lists eligible groups: women, children, members of SC/ST, victims of human trafficking, undertrial prisoners in custody, and low-income individuals.
  3. Cites national legal aid helpline `15100`.

---

### Test Case 1.7: Hit-and-Run Provision Clarification under BNS
- **Prompt:** `"What is the punishment for hit and run under Section 106(2) of the Bharatiya Nyaya Sanhita?"`
- **Category:** Criminal Law (BNS 2023)
- **Target Statutory Citations:**
  - `BNS Section 106(1)` (Causing death by rash or negligent act: up to 5 years)
  - `BNS Section 106(2)` (Escape without reporting to police officer or magistrate: up to 10 years and fine)
- **Expected Verification Points:**
  1. Accurately distinguishes between standard negligence (Sec 106(1)) and fleeing without reporting (Sec 106(2)).
  2. Mentions maximum imprisonment of 10 years for failure to report immediately after the incident.

---

### Test Case 1.8: Cyber Crime & Financial Fraud Immediate Action
- **Prompt:** `"My bank account was debited ₹50,000 in an unauthorized UPI phishing transaction. What should I do immediately?"`
- **Category:** Cyber Law & Urgent Financial Freezing
- **Target Statutory Citations & Hotlines:**
  - `Information Technology Act, 2000, Section 66D`
  - `BNS Section 318` (Cheating)
  - `National Cyber Crime Helpline: 1930`
  - `portal: cybercrime.gov.in`
- **Expected Verification Points:**
  1. Emphasizes the **Golden Hour** principle: dial **1930** immediately to freeze funds before the scammer withdraws them.
  2. Advises lodging a complaint on `cybercrime.gov.in` and notifying the bank branch in writing within 72 hours for zero customer liability under RBI guidelines.

---

### Test Case 1.9: Audio Playback & Citation Modal Verification
- **Action:** Ask any legal question on `/assistant`.
- **Steps:**
  1. Observe the response stream.
  2. Click the **"Listen"** (सुने / ਸੁਣੋ) button -> Web Speech synthesis speaks the answer aloud. Click **"Stop"** to cancel.
  3. Click the **"Copy"** button -> Toast confirms text copied to clipboard.
  4. Click any source pill (e.g. `BNSS Section 47`) -> Opens the citation card showing the official section snippet and act title.

---

### Test Case 1.10: Grounding Audit Score Calculation
- **Action:** Inspect the statutory audit badge rendered below the answer.
- **Expected Verification Points:**
  1. Shows: `Statutory Audit: XX% verified citations against official gazettes`.
  2. High-contrast emerald badge (`text-emerald-950 font-bold`) readable in both Light and Dark mode.
  3. Verifies that the citations match the indexed Government of India gazette corpus.
