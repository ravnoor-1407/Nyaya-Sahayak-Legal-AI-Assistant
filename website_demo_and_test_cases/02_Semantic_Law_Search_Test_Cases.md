# 02 — Semantic Law Search Test Cases (`/search`)

The **Semantic Law Search Engine** allows legal professionals and ordinary citizens to search the indexed statutory corpus using either exact legal citations, statutory section numbers, or plain natural language factual scenarios.

---

## Test Scenarios & Query Benchmark

### Test Case 2.1: Exact New Section Lookup
- **Query:** `"Section 105 BNSS"`
- **Target Statute:** Bharatiya Nagarik Suraksha Sanhita, 2023
- **Expected Search Result:**
  - Top Match: **BNSS Section 105** — *"Recording of search and seizure through audio-video electronic means."*
  - Key Text Snippet: Mandates that the process of conducting search of a place or seizure of any property shall be recorded through audio-video electronic means preferably mobile phone.

---

### Test Case 2.2: Cross-Walk from Old IPC to New BNS (Murder)
- **Query:** `"Murder definition and punishment"`
- **Target Statute:** Bharatiya Nyaya Sanhita, 2023 (formerly IPC Section 300 & 302)
- **Expected Search Result:**
  - Top Match: **BNS Section 101** (Murder defined) and **BNS Section 103** (Punishment for murder).
  - Demonstrates that the search engine seamlessly indexes the new codified numbering without needing IPC references.

---

### Test Case 2.3: Electronic Records Admissibility (Replacing 65B IEA)
- **Query:** `"electronic record admissibility certificate"`
- **Target Statute:** Bharatiya Sakshya Adhiniyam, 2023
- **Expected Search Result:**
  - Top Match: **BSA Section 63** — *"Admissibility of electronic records."*
  - Proves the system retrieves the correct replacement provision for Section 65B of the repealed Indian Evidence Act.

---

### Test Case 2.4: Zero-FIR Mandatory Registration
- **Query:** `"zero fir registration at any police station"`
- **Target Statute:** Bharatiya Nagarik Suraksha Sanhita, 2023
- **Expected Search Result:**
  - Top Match: **BNSS Section 173** — *"Information in cognizable cases."*
  - Highlights sub-section (1) regarding information given irrespective of the area where the offence was committed.

---

### Test Case 2.5: Mandatory Undertrial Bail Entitlement
- **Query:** `"undertrial prisoner maximum period for which can be detained"`
- **Target Statute:** Bharatiya Nagarik Suraksha Sanhita, 2023
- **Expected Search Result:**
  - Top Match: **BNSS Section 479** — *"Maximum period for which undertrial prisoner can be detained."*
  - Sub-section highlights the historic 2024 reform: first-time offenders who have undergone detention for 1/3rd of the maximum term are entitled to mandatory release.

---

### Test Case 2.6: Speedy Trial & Protection of Life / Liberty
- **Query:** `"Article 21 right to speedy trial and legal aid"`
- **Target Statute:** Constitution of India
- **Expected Search Result:**
  - Top Matches: **Constitution Article 21** (*Protection of life and personal liberty*) and **Article 39A** (*Equal justice and free legal aid*).

---

### Test Case 2.7: Offences Against Women (Stalking & Harassment)
- **Query:** `"stalking of woman through electronic communication"`
- **Target Statute:** Bharatiya Nyaya Sanhita, 2023
- **Expected Search Result:**
  - Top Match: **BNS Section 78** — *"Stalking."*
  - Covers monitoring the use by a woman of the internet, email, or any other form of electronic communication.

---

### Test Case 2.8: Child Protection & Mandatory Reporting
- **Query:** `"mandatory reporting of child sexual offence"`
- **Target Statute:** Protection of Children from Sexual Offences (POCSO) Act, 2012
- **Expected Search Result:**
  - Top Match: **POCSO Section 19** (*Reporting of offences*) and **Section 21** (*Punishment for failure to report*).

---

### Test Case 2.9: Cheque Dishonour 15-Day Statutory Demand
- **Query:** `"cheque bounce demand notice fifteen days"`
- **Target Statute:** Negotiable Instruments Act, 1881
- **Expected Search Result:**
  - Top Match: **NI Act Section 138** — *"Dishonour of cheque for insufficiency, etc., of funds in the account."*

---

### Test Case 2.10: Community Service as a New Form of Punishment
- **Query:** `"community service punishment for petty offences"`
- **Target Statute:** Bharatiya Nyaya Sanhita, 2023
- **Expected Search Result:**
  - Top Match: **BNS Section 4(f)** and specific small offences (e.g. theft of property under ₹5,000 upon return, public intoxication nuisance) where community service has been introduced for the first time in Indian statutory history.
