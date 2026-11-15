# NyayaSahayak (न्याय सहायक) — Master Website Demo & Test Suite

Welcome to the comprehensive demo and test case repository for the **NyayaSahayak Legal AI Assistant** platform. This repository contains end-to-end test scenarios, presentation cheat-sheets, sample legal documents, and viva talking points covering every single page, tool, and feature across the entire web application.

---

## 📁 Folder Structure & Test Navigator

```
website_demo_and_test_cases/
├── README.md                                    # This Master Demo Manual & Viva Guide
├── 01_AI_Legal_Assistant_Test_Cases.md          # Grounded RAG, Statutory Audits, Trilingual QA, Safety Filters
├── 02_Semantic_Law_Search_Test_Cases.md         # Semantic retrieval, Old IPC -> New BNS cross-walk, Exact sections
├── 03_Bare_Acts_and_Gazette_Verification.md     # BNS, BNSS, BSA, Constitution, POCSO & Gazette verification
├── 04_NALSA_Sec12_Free_Legal_Aid_Test_Cases.md  # Section 12 Legal Aid Calculator & State income limits
├── 05_Contact_and_Grievance_Desk_Test_Cases.md  # Ticket generation, Gmail Web dispatch, 24x7 Helplines
├── 06_Auth_Security_and_Dashboard_Test_Cases.md # Google GIS, 6-digit Email OTP, Session storage, Research log
├── 07_Citizen_Hub_Tools_Consolidated.md         # Bail Calculator, Doc Scanner, Draft Studio, Decision Trees
├── 08_Adversarial_Safety_and_Guardrails.md      # Malicious query blocks, Self-harm assistance, Jailbreaks
├── all_website_test_cases.json                  # Machine-readable test suite (JSON format)
└── sample_documents/                            # Real .docx and .txt files for Scanner and Drafting tests
    ├── Police_Summons_Sec35_BNSS.docx           # Triggers High Risk (Countdown & Section 35(3) notice)
    ├── Cheque_Dishonour_Notice_Sec138_NI_Act.docx # Triggers High Risk (15-day statutory countdown)
    ├── Residential_Tenancy_Lease_Agreement.docx  # Triggers Medium Risk (Deposit refund & notice terms)
    ├── Mutual_Settlement_and_NOC_Receipt.docx   # Triggers Safe Green Badge (Discharged liabilities)
    └── Non_Legal_University_Assignment.docx     # Triggers Rejection Banner (Non-legal document protection)
```

---

## ⚡ Master Quick Reference Table

| Feature / Page | Route URL | Purpose & Core Capabilities | Primary Demo Test Case | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **AI Legal Assistant** | `/assistant` | Grounded RAG on new 2023 criminal statutes, voice readout, statutory citation audits. | *"Can police arrest an elderly citizen without warrant under BNSS?"* | Cites BNSS Sec 35(7), provides practical steps, shows **Statutory Audit: 80%+ verified** badge. |
| **Semantic Law Search** | `/search` | Hybrid BM25 + dense semantic retrieval over BNS, BNSS, BSA, Constitution & POCSO. | *"electronic record certificate admissibility"* | Retrieves Section 63 BSA 2023 (replacing 65B IEA) with exact gazette text. |
| **Bare Acts Explorer** | `/acts`, `/official` | Full chapter-wise bare act browser with official Gazette metadata & trilingual text. | Select **BNSS 2023** -> Chapter XXXV -> **Section 479**. | Displays statutory text of Sec 479 mandatory undertrial bail with Act No. 46 of 2023 badge. |
| **Sec 12 NALSA Legal Aid** | `/legal-aid` | Section 12 Legal Services Authorities Act qualification engine with state income ceilings. | **Category: Woman** or **SC/ST** or **Custody Undertrial**. | Instant Green **"Eligible for Free Legal Aid"** badge under Article 39A + DLSA filing steps. |
| **Contact & Grievance Desk**| `/contact` | Citizen inquiry portal with automated ticket ID generation and 24x7 Helplines. | Click preset **"Legal Aid"** -> Click **"Submit Inquiry"**. | Generates **Grievance Ticket ID: #NYA-2026-XXXX**, shows summary & 1-click Gmail draft. |
| **Authentication & Dash** | `/auth`, `/dashboard` | Google GIS one-tap + secure 6-digit email OTP + session history dashboard. | Enter email -> Click **"Send Verification Code"**. | Instant OTP delivery + access to Dashboard tracking past legal research. |
| **Sec 479 Bail Calculator** | `/bail-calculator` | 2024 BNSS mandatory release calculation (1/3rd max sentence for first-time undertrials). | **Offence: Theft (Sec 303(2) BNS)**, First-timer: **Yes**, Custody: **14 Months**. | **MANDATORY BAIL ELIGIBLE** (Threshold: 12 months) + Pre-filled Bail Application Draft. |
| **Legal Document Scanner** | `/scanner` | Upload/paste legal notices to detect hidden risks, statutory countdowns, and validity. | Upload `1_Police_Summons_Sec35_BNSS.docx`. | **DANGER / HIGH RISK** (Red Alert) + Extracted 48-Hour Deadline + Plain Language Breakdown. |
| **AI Legal Drafting Studio**| `/drafting` | Zero-FIR & Statutory Notice generator with isolated Word-like printing. | Click **"Theft FIR"** preset -> Click **"Generate Formal Legal Draft"**. | Generates Sec 173 BNSS Zero-FIR. Click **"Print / Save as PDF"** prints only clean draft. |
| **Procedural Decision Trees**| `/flowcharts` | Interactive citizen rights decision navigator for arrest, FIR refusal, and cheque bounce. | Select **"Police Arrest Rights"** -> Click through decision nodes. | Step-by-step guidance on Sec 47/48/58 BNSS rights with helpline referrals. |

---

## 🎯 Recommended 5-Minute Live Presentation / Viva Flow

When presenting or demonstrating NyayaSahayak to professors, evaluators, or judges, follow this high-impact 5-minute trajectory:

1. **Step 1: Homepage & Trilingual Switcher (30s)**
   - Open `/` (Light mode by default). Click `हिन्दी` and `ਪੰਜਾਬੀ` pills in the top navbar to prove 100% real-time localization.
   - Show the quick law search pill and citizen empowerment tools hero.

2. **Step 2: AI Legal Assistant & Statutory Grounding Audit (60s)**
   - Navigate to `/assistant`.
   - Ask: *"What are my rights if police refuse to register an FIR?"*
   - Highlight the **Statutory Audit Pill** (e.g. *80% verified citations against official gazettes*) showing zero hallucinations.
   - Click **"Listen"** to demonstrate text-to-speech voice readout.

3. **Step 3: Section 479 BNSS Undertrial Bail Calculator (60s)**
   - Navigate to `/bail-calculator`.
   - Select offence: *Theft (Section 303(2) BNS)* -> Max sentence: 3 Years.
   - Toggle First-Time Offender: *YES* -> Threshold automatically computes to **1 Year (1/3rd)**.
   - Set custody date to 14 months ago -> Click **"Calculate Undertrial Bail Entitlement"**.
   - Show the green **"MANDATORY BAIL APPLICABLE"** alert and the generated bail application draft.

4. **Step 4: Legal Document Scanner & Non-Legal Guardrail (60s)**
   - Navigate to `/scanner`.
   - Drag and drop `Non_Legal_University_Assignment.docx` -> Demonstrate the **Non-Legal Document Warning Banner** rejecting irrelevant academic text.
   - Drag and drop `Police_Summons_Sec35_BNSS.docx` -> Instantly displays **DANGER / HIGH RISK**, extracts the 48-hour response countdown, and provides plain-language defense steps.

5. **Step 5: Contact Desk & Citizen Grievance Ticketing (30s)**
   - Navigate to `/contact`.
   - Click the **"Legal Aid"** quick preset -> Click **"Submit Inquiry & Generate Ticket"**.
   - Show the live **Grievance Ticket Number `#NYA-2026-XXXX`**, 24x7 hotlines (15100 NALSA, 1930 Cyber Fraud), and direct Gmail web composer integration.

---

## 🔒 Safety, Guardrails & Academic Rigor

NyayaSahayak implements a **Constitutional Safety Charter**:
- **Article 21 & 39A Grounded**: Promotes speedy justice, undertrial rights, and free legal aid.
- **Strictly Educational**: Prominent statutory disclaimers prevent advocate-client liability.
- **Client-Side De-identification**: PII scrubbing removes Aadhaar and bank details before AI analysis.
- **Adversarial Hardening**: Blocks jailbreaks, crime assistance, and provides Tele-MANAS 14416 referrals for distress queries.
