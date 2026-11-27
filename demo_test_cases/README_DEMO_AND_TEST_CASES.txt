================================================================================
           NYAYASAHAYAK (न्याय सहायक) — MASTER WEBSITE DEMO & TEST CASES
================================================================================
Version: 2.4.0 (Production)
Platform: https://nyaya-sahayak-legal-ai-assistant.vercel.app

This folder contains all test cases, demo inputs, sample documents, and viva 
instructions for every feature and page of the NyayaSahayak Legal AI Assistant.

You can open any of these .txt files in VS Code and directly copy-paste the test 
inputs during demonstrations, presentations, or evaluations.

--------------------------------------------------------------------------------
TABLE OF CONTENTS & QUICK NAVIGATOR:
--------------------------------------------------------------------------------

1. Sample Documents & Camera Photos for Document Scanner:
   A. Word (.docx) & Text (.txt) Documents:
      - 1_Police_Summons_Notice_Sec35_BNSS.docx   (DANGER / HIGH RISK - 48h Countdown)
      - 2_Cheque_Bounce_Notice_Sec138_NI_Act.docx (DANGER / HIGH RISK - 15-day Notice)
      - 3_Residential_Tenancy_Lease_Agreement.docx (MEDIUM RISK - 11-month Lease)
      - 4_Non_Legal_University_Assignment.docx (REJECTED - Non-Legal Document Banner)
      - 5_Mutual_Settlement_and_NOC_Receipt.docx (SAFE / LOW RISK - Green Shield)

   B. Realistic Legal Document Photos (.jpg) for Camera & Vision OCR Testing:
      - 1_police_summons_bnss35.jpg         (Police Station seal, FIR ref, Sec 35(5) arrest warning)
      - 2_cheque_bounce_notice_sec138.jpg   (Advocate letterhead, Speed Post barcode, 15-day deadline)
      - 3_unfair_tenancy_agreement.jpg      (e-Stamp certificate, Clause 8 deposit forfeiture & disconnection)
      - 4_safe_settlement_noc.jpg           (Green full settlement seal, NEFT UTR deposit refund receipt)
      - 5_non_legal_assignment.jpg          (University coursework paper for guardrail rejection test)

2. Feature Test Case Files:
   - 01_AI_Legal_Assistant_Test_Cases.txt    -> RAG queries, BNSS/BNS/BSA, Hindi/Punjabi, Audit
   - 02_Semantic_Law_Search_Test_Cases.txt   -> Exact sections, concept queries, IPC->BNS mapping
   - 03_Bail_Calculator_Test_Cases.txt       -> Sec 479 BNSS mandatory undertrial release (1/3 & 1/2)
   - 04_Legal_Document_Scanner_Test_Cases.txt-> Risk analyzer upload, text paste & rejection test
   - 05_AI_Legal_Drafting_Studio_Test_Cases.txt -> Zero-FIR, Cheque Notice, isolated Word-like print
   - 06_Interactive_Problem_Solver_Decision_Trees.txt -> Step-by-step citizen procedural rights
   - 07_NALSA_Sec12_Free_Legal_Aid_Test_Cases.txt -> Sec 12 calculator & State income ceiling rules
   - 08_Contact_and_Inquiries_Test_Cases.txt -> Grievance ticket generation, Gmail draft & hotlines
   - 09_Bare_Acts_and_Official_Gazettes_Test_Cases.txt -> Acts browser, chapters & gazette audit
   - 10_Auth_and_Security_Guardrails_Test_Cases.txt -> Google GIS, Email OTP, crime block & helpline

--------------------------------------------------------------------------------
FAST 5-MINUTE LIVE DEMO SEQUENCE:
--------------------------------------------------------------------------------
Step 1: Open Home Page (Light Mode by default). Click "हिन्दी" and "ਪੰਜਾਬੀ" in 
        navbar to show instant 100% trilingual UI translation.
Step 2: Go to AI Legal Assistant (/assistant). Ask:
        "Can police arrest without warrant under BNSS and what are my rights?"
        Show the Statutory Audit Pill (80%+ verified citations) and click "Listen".
Step 3: Go to Sec 479 Bail Calculator (/bail-calculator). Select "Theft", First-timer: YES, 
        Custody: 14 months -> Triggers Green "MANDATORY BAIL APPLICABLE" banner + application draft.
Step 4: Go to Document Scanner (/scanner). 
        - Upload "4_Non_Legal_University_Assignment.docx" -> Shows Non-Legal Rejection Banner.
        - Upload "1_Police_Summons_Notice_Sec35_BNSS.docx" -> Shows DANGER / HIGH RISK + 48h Countdown.
Step 5: Go to Contact (/contact). Click preset "Legal Aid" -> Click "Submit Inquiry" -> 
        Generates live Ticket ID #NYA-2026-XXXX with 1-click Gmail draft button.
================================================================================
