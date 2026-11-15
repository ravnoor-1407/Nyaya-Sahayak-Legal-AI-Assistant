# 04 — NALSA Section 12 Free Legal Aid Calculator (`/legal-aid`)

Under **Article 39A of the Constitution of India** and **Section 12 of the Legal Services Authorities Act, 1987**, the State must provide free legal aid to eligible categories of citizens to ensure that justice is not denied by reason of economic or other disabilities.

The **Legal Aid Calculator** computes automatic statutory entitlement and state-specific income ceiling eligibility.

---

## Test Scenarios Catalog

### Test Case 4.1: Automatic Qualification — Woman / Child
- **Input Parameters:**
  - Category: `Woman` or `Child (under 18)`
  - Annual Income: Any amount (e.g. ₹10,00,000)
  - State: Any State
- **Statutory Authority:** Section 12(c) of Legal Services Authorities Act, 1987.
- **Expected Outcome:**
  - **Verdict:** `ELIGIBLE FOR FREE LEGAL AID` (हरा / Green Badge)
  - **Reason:** Women and children are entitled to free legal aid without any income test.
  - **Action Steps:** Formulates step-by-step instructions to approach the nearest Taluk or District Legal Services Authority (DLSA) or dial `15100`.

---

### Test Case 4.2: Automatic Qualification — Scheduled Caste / Scheduled Tribe
- **Input Parameters:**
  - Category: `Member of Scheduled Caste (SC)` or `Scheduled Tribe (ST)`
  - Annual Income: Any amount
- **Statutory Authority:** Section 12(a) of Legal Services Authorities Act, 1987.
- **Expected Outcome:**
  - **Verdict:** `ELIGIBLE FOR FREE LEGAL AID`
  - **Reason:** Direct statutory exemption under Section 12(a); income is not a disqualifying criterion.

---

### Test Case 4.3: Automatic Qualification — Undertrial in Custody
- **Input Parameters:**
  - Category: `Person in Custody / Undertrial Prisoner`
  - Annual Income: N/A
- **Statutory Authority:** Section 12(g) of Legal Services Authorities Act, 1987.
- **Expected Outcome:**
  - **Verdict:** `ELIGIBLE FOR FREE LEGAL AID`
  - **Reason:** Anyone detained in prison or custody is entitled to a free legal aid defense advocate appointed by the court / DLSA.

---

### Test Case 4.4: General Category Citizen Below State Income Ceiling (Delhi)
- **Input Parameters:**
  - Category: `General Category Citizen`
  - State: `Delhi` (Ceiling: ₹3,00,000)
  - Annual Family Income: `₹1,80,000`
- **Statutory Authority:** Section 12(h) of Legal Services Authorities Act, 1987.
- **Expected Outcome:**
  - **Verdict:** `ELIGIBLE FOR FREE LEGAL AID`
  - **Reason:** Annual income of ₹1,80,000 is below the Delhi State Legal Services Authority ceiling of ₹3,00,000.

---

### Test Case 4.5: General Category Citizen Exceeding State Income Ceiling
- **Input Parameters:**
  - Category: `General Category Citizen`
  - State: `Delhi`
  - Annual Family Income: `₹6,50,000`
- **Expected Outcome:**
  - **Verdict:** `NOT ELIGIBLE UNDER INCOME CRITERIA` (Amber Warning)
  - **Explanation:** Income exceeds the statutory limit for free government advocate assignment.
  - **Alternative Remedies:** Recommends alternative options: Lok Adalat for pre-litigation mediation, legal advice clinics, and private pro-bono advocate networks.

---

### Test Case 4.6: Special Protected Groups (Disaster Victims / Industrial Workmen)
- **Input Parameters:**
  - Category: `Victim of Mass Disaster / Ethnic Violence / Flood` or `Industrial Workman`
- **Statutory Authority:** Section 12(e) & 12(f) of Legal Services Authorities Act, 1987.
- **Expected Outcome:**
  - **Verdict:** `ELIGIBLE FOR FREE LEGAL AID`
  - Highlights entitlement to waiver of court fees, preparation of paperbooks, and advocate fees paid entirely by the State.
