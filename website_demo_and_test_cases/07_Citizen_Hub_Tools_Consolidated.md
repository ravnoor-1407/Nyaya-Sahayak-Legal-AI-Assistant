# 07 — Citizen Hub Tools Master Reference (`/hub`, `/drafting`, `/bail-calculator`, `/scanner`, `/flowcharts`)

This document provides a consolidated master reference for all four core **Citizen Legal Action Hub** tools, bringing together their testing inputs, statutory logic, expected UI outputs, and sample test files.

---

## Tool 1: AI Legal Drafting Studio (`/drafting`)

### Purpose
Generates legally structured, court-ready formal legal notices and Zero-FIR complaints under Section 173 BNSS with isolated Word-like printing.

### Test Scenarios
1. **Theft Zero-FIR under Sec 173 BNSS:**
   - Click preset: **"Theft FIR"**
   - Fields: Complainant: `Rahul Verma`, Mobile: `+91 9876543210`, Location: `Sector 18 Market, Metro Pillar 42`, Date/Time: Recent timestamp, Description: Theft of laptop bag containing HP Spectre and identity cards.
   - Click: **"Generate Formal Legal Draft"** -> AI formats draft with statutory verification clause.
   - Click: **"Print / Save as PDF"** -> **VERIFY:** Only the clean legal document is sent to the printer/PDF dialog (not the website header, footer, or sidebar).

2. **Cheque Dishonour Notice under Sec 138 NI Act:**
   - Click preset: **"Cheque Bounce"**
   - Click: **"Generate Formal Legal Draft"** -> Creates formal 15-day statutory demand notice citing Section 138 Negotiable Instruments Act and Section 318 BNS (Cheating).

---

## Tool 2: Section 479 BNSS Undertrial Mandatory Bail Calculator (`/bail-calculator`)

### Purpose
Implements the 2024 criminal justice reform under Section 479 BNSS, granting mandatory bail to undertrials who have spent 1/3rd (first-timers) or 1/2 (repeat offenders) of the maximum sentence in detention.

### Test Scenarios
1. **First-Time Undertrial Qualifying under 1/3rd Rule:**
   - Offence: `Theft (Section 303(2) BNS)` -> Maximum sentence: 3 Years (36 Months).
   - First-time Offender: `YES` -> Mandatory Threshold: **12 Months (1/3rd)**.
   - Date of Custody: Set to 14 months ago.
   - Result: **MANDATORY BAIL APPLICABLE (ELIGIBLE FOR IMMEDIATE RELEASE)**.
   - Pre-filled Bail Application: Under Section 479 BNSS before Chief Judicial Magistrate.

2. **Repeat Undertrial Qualifying under 1/2 Rule:**
   - Offence: `Cheating (Section 318(4) BNS)` -> Maximum sentence: 7 Years (84 Months).
   - First-time Offender: `NO` -> Mandatory Threshold: **42 Months (1/2)**.
   - Custody Date: Set to 45 months ago.
   - Result: **MANDATORY BAIL APPLICABLE**.

3. **Ineligible Life Imprisonment / Capital Offence:**
   - Offence: `Murder (Section 103(1) BNS)` -> Penalty: Life Imprisonment / Death.
   - Result: **NOT APPLICABLE** (Section 479 BNSS explicitly excludes offences punishable by death or life imprisonment).

---

## Tool 3: Legal Document Scanner & Risk Analyzer (`/scanner`)

### Purpose
Scans uploaded `.docx`, `.pdf`, or text legal notices to detect hidden statutory risks, deadlines, and legal traps, while actively rejecting non-legal documents.

### Test Scenarios
1. **Urgent Police Summons (High Risk):**
   - Upload file: `sample_documents/Police_Summons_Sec35_BNSS.docx`
   - Result:
     - Badge: **DANGER / HIGH RISK — URGENT ACTION REQUIRED** (Red Alert).
     - Detected Deadline: 48-Hour appearance notice under Sec 35(3) BNSS.
     - Plain Language Breakdown: Explains right to legal counsel under Art 22(1) and BNSS Sec 35(7).

2. **Cheque Dishonour Notice (High Risk):**
   - Upload file: `sample_documents/Cheque_Dishonour_Notice_Sec138_NI_Act.docx`
   - Result:
     - Badge: **DANGER / HIGH RISK**.
     - Detected Countdown: Mandatory 15-day statutory payment window under Sec 138 NI Act.

3. **Residential Tenancy Agreement (Medium Risk):**
   - Upload file: `sample_documents/Residential_Tenancy_Lease_Agreement.docx`
   - Result:
     - Badge: **MEDIUM RISK / ATTENTION REQUIRED** (Amber Badge).
     - Breakdown: Details 11-month lease terms, lock-in period, and security deposit return conditions.

4. **Mutual Settlement & NOC (Safe):**
   - Upload file: `sample_documents/Mutual_Settlement_and_NOC_Receipt.docx`
   - Result:
     - Badge: **SAFE / LOW RISK** (Green Tick & Shield).
     - Breakdown: Explains that all claims have been discharged and liabilities released.

5. **Non-Legal Academic Assignment (Rejection Guardrail):**
   - Upload file: `sample_documents/Non_Legal_University_Assignment.docx`
   - Result:
     - **NON-LEGAL DOCUMENT DETECTED** (Warning Banner).
     - Notice: *"This uploaded file appears to be an academic paper, engineering report, or non-legal text rather than a formal legal notice, court summons, or contract. The Legal Risk Analyzer only processes formal legal instruments."*

---

## Tool 4: Interactive Procedural Decision Trees (`/flowcharts`)

### Purpose
Simplifies complex legal workflows into step-by-step interactive decision cards for citizens navigating stressful legal encounters.

### Available Decision Flows
1. **What to do if Police Arrest You (BNSS Sec 35, 47, 48, 58)**:
   - Node 1: Is there a warrant? -> Cognizable vs Non-cognizable route.
   - Node 2: Grounds of arrest informed? -> Section 47 BNSS invocation.
   - Node 3: Family member informed? -> Section 48 BNSS requirement.
   - Node 4: 24-hour Magistrate production -> Section 58 BNSS compliance.

2. **Remedies if Police Station Refuses FIR (BNSS Sec 173, 175)**:
   - Node 1: Zero-FIR at any station.
   - Node 2: Send complaint to Superintendent of Police (SP) by registered post.
   - Node 3: Application to Magistrate under Section 175(3) BNSS.

3. **Cheque Bounce Legal Remedies (NI Act Sec 138)**:
   - Node 1: Obtain Bank Memo ("Funds Insufficient").
   - Node 2: Issue 30-day statutory demand notice.
   - Node 3: Wait 15 days for payment -> File complaint within next 30 days before Magistrate.
