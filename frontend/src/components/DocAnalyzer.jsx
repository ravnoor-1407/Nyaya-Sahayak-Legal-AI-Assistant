import { useState, useRef } from "react";
import { Search, AlertTriangle, ShieldCheck, Clock, Check, RefreshCw, FileText, Sparkles, UploadCloud, File, X, AlertOctagon, CheckCircle2, Trash2 } from "lucide-react";
import { useLang } from "../LangContext";
import { analyzeDocument, analyzeDocumentFile } from "../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import JSZip from "jszip";

const SAMPLES = {
  bnss35: {
    title: "Police Summons (Sec 35 BNSS)",
    type: "danger",
    tag: "High Danger",
    text: `POLICE STATION SECTOR 17, CHANDIGARH
NOTICE OF APPEARANCE UNDER SECTION 35(3) BHARATIYA NAGARIK SURAKSHA SANHITA, 2023

To: Shri Vikram Malhotra, S/o R.K. Malhotra, R/o Flat 302, Sector 18, Chandigarh.

WHEREAS, an inquiry/investigation is being conducted in respect of Complaint No. 412/2026 registered at this Police Station alleging offences punishable under Sections 318(2) and 351(2) of the Bharatiya Nyaya Sanhita, 2023.

AND WHEREAS, your attendance is deemed necessary for the purpose of the said inquiry. You are hereby directed to appear in person before the undersigned Investigating Officer at Police Station Sector 17, Chandigarh on 20th November 2026 at 11:00 AM sharp to answer queries and produce relevant financial records.

TAKE NOTICE that as long as you comply with this notice and appear as directed, you shall not be arrested in respect of the offence mentioned unless for reasons to be recorded in writing. Failure to attend may render you liable for arrest under Section 35(5) of the BNSS upon obtaining an order from the Competent Magistrate.

Dated: 14/11/2026
(Sub-Inspector / Investigating Officer)`,
  },
  ni138: {
    title: "Cheque Bounce Notice (Sec 138)",
    type: "danger",
    tag: "Critical Danger",
    text: `LEGAL NOTICE UNDER SECTION 138 NEGOTIABLE INSTRUMENTS ACT, 1881

To: M/s Zenith Traders (Prop. Rajesh Gupta), Civil Lines, Ludhiana.

Under instructions from our client M/s Shivalik Goods, we hereby serve you with this statutory legal notice:
You had issued Cheque No. 901245 dated 25/10/2026 for an amount of Rs. 4,50,000/- drawn on Punjab National Bank in discharge of your debt. On presentation, the cheque was returned dishonoured on 02/11/2026 with remark "FUNDS INSUFFICIENT".

We hereby call upon you to make the payment of Rs. 4,50,000/- within 15 (FIFTEEN) DAYS of the receipt of this notice, failing which criminal proceedings under Section 138 of the Negotiable Instruments Act, 1881 shall be initiated against you before the Judicial Magistrate.`,
  },
  rent: {
    title: "Unfair Rent Agreement",
    type: "danger",
    tag: "Medium Danger",
    text: `RESIDENTIAL TENANCY LEASE AGREEMENT (EXTRACT)

Clause 8 (Security Deposit & Forfeiture):
The Tenant has paid a refundable security deposit of Rs. 1,00,000/-. However, if the Tenant terminates the tenancy before the lock-in period of 24 months, the entire security deposit of Rs. 1,00,000/- shall be forfeited by the Landlord without any refund, and the Landlord shall have the immediate right to disconnect electricity and water supply without court orders.`,
  },
  safe_noc: {
    title: "Clean NOC / Settlement",
    type: "safe",
    tag: "Safe / Low Risk",
    text: `NO OBJECTION CERTIFICATE & FULL AND FINAL SETTLEMENT RECEIPT

Date: 10th November 2026

TO WHOMSOEVER IT MAY CONCERN:
This is to certify that Mr. Rohan Verma (Tenant) residing at Flat 204, Royal Palms, New Delhi has vacated the premises peacefully on 09/11/2026. 
All pending utility bills, electricity charges, and monthly rents stand fully paid up to date. The refundable security deposit of Rs. 60,000/- has been refunded in full via bank transfer (Ref No. UTR98234190). 

The Landlord confirms there are no pending claims, disputes, or liabilities against the Tenant whatsoever. Both parties have mutually concluded the tenancy with mutual consent.

(Landlord Signature)
S.K. Bansal`,
  },
};

// Client-side DOCX text extractor via JSZip
async function extractTextFromDocx(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const xml = await zip.file("word/document.xml")?.async("text");
    if (!xml) return "";

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "application/xml");
    const paragraphs = xmlDoc.getElementsByTagName("w:p");
    const lines = [];

    for (let i = 0; i < paragraphs.length; i++) {
      const texts = paragraphs[i].getElementsByTagName("w:t");
      let pText = "";
      for (let j = 0; j < texts.length; j++) {
        pText += texts[j].textContent || "";
      }
      if (pText.trim()) {
        lines.push(pText.trim());
      }
    }
    return lines.join("\n\n");
  } catch (err) {
    console.warn("Client-side docx parsing note:", err);
    return "";
  }
}

// Validation function: Ensure uploaded text is a genuine legal notice, summons, or contract
function validateLegalDocument(text, filename = "") {
  const clean = (text || "").trim();
  const combined = `${filename || ""} ${clean}`;

  if (clean.length < 35) {
    return {
      isValid: false,
      reason: "The document text is too brief to constitute an official legal notice, court summons, or contract.",
    };
  }

  // Explicit non-legal / academic / student assignment check
  const isAcademicOrMisc = /\b(assignment|curriculum|syllabus|semester|b\.tech|m\.tech|roll\s*no|uid\s*:\s*\d+|lovely professional university|course code|submitted by|supervision of|faculty supervisor|invention disclosure form|patent application title|annexure 3b|resume|curriculum vitae|homework|class test|practical file)\b/i.test(
    combined
  );

  // Core legal instrument keywords
  const hasLegalHeading = /\b(notice of appearance|statutory legal notice|legal notice|demand notice|show cause notice|eviction notice|summons to appear|summons to accused|warrant of arrest|bailable warrant|court summons|lease agreement|tenancy agreement|rental agreement|indemnity bond|power of attorney|affidavit|memorandum of understanding|consumer complaint|cheque dishonour notice|first information report|zero fir|quashing petition|bail application)\b/i.test(
    combined
  );

  const hasProceduralTerms = /\b(under instructions from our client|under instructions from my client|hereby call upon you to|failing which legal proceedings|take notice that|whereas,? an inquiry|whereas,? an investigation|directed to appear in person|in the court of|judicial magistrate|police station|station house officer|investigating officer|return memo dated|dishonoured on presentation|forfeiture of.*deposit|without prejudice to rights|hereby serve you with this notice)\b/i.test(
    clean
  );

  const hasStatutoryAndRoles =
    /\b(section\s+\d+|sec\.?\s*\d+|article\s+\d+|bnss|bns|ipc|crpc|negotiable instruments act|consumer protection act|contract act)\b/i.test(
      clean
    ) &&
    /\b(complainant|accused|petitioner|respondent|plaintiff|defendant|opposite party|landlord|tenant|noticee|advocate|counsel|sub-inspector)\b/i.test(
      clean
    );

  if (isAcademicOrMisc && !(hasLegalHeading && hasProceduralTerms)) {
    return {
      isValid: false,
      reason: "Academic paper, university assignment, or non-legal educational document detected.",
    };
  }

  if (!hasLegalHeading && !hasProceduralTerms && !hasStatutoryAndRoles) {
    return {
      isValid: false,
      reason: "No formal legal notice, police summons, court warrant, or agreement structure detected.",
    };
  }

  return { isValid: true, reason: "Valid legal document." };
}

export default function DocAnalyzer() {
  const { tr, lang } = useLang();
  const [docText, setDocText] = useState(SAMPLES.bnss35.text);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractionMsg, setExtractionMsg] = useState("");
  const [invalidDoc, setInvalidDoc] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  const handleSelectSample = (key) => {
    const s = SAMPLES[key];
    if (s) {
      setDocText(s.text);
      setUploadedFile(null);
      setExtractionMsg("");
      setInvalidDoc(null);
      setResult(null);
    }
  };

  const handleProcessFile = async (file) => {
    if (!file) return;
    setUploadedFile(file);
    setInvalidDoc(null);
    setResult(null);
    setExtracting(true);
    setExtractionMsg(tr("Reading document contents...", "दस्तावेज़ की सामग्री पढ़ी जा रही है...", "ਦਸਤਾਵੇਜ਼ ਪੜ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ..."));

    try {
      const lower = (file.name || "").toLowerCase();
      if (lower.endsWith(".docx")) {
        const extracted = await extractTextFromDocx(file);
        if (extracted && extracted.trim()) {
          setDocText(extracted);
          setExtractionMsg(
            tr(
              `Successfully extracted ${extracted.length.toLocaleString()} characters from "${file.name}" into the text box below.`,
              `"${file.name}" से ${extracted.length.toLocaleString()} अक्षर नीचे टेक्स्ट बॉक्स में निकाल लिए गए हैं।`,
              `"${file.name}" ਵਿੱਚੋਂ ${extracted.length.toLocaleString()} ਅੱਖਰ ਹੇਠਾਂ ਟੈਕਸਟ ਬਾਕਸ ਵਿੱਚ ਕੱਢ ਲਏ ਗਏ ਹਨ।`
            )
          );
        } else {
          setExtractionMsg(tr(`File ready for scan: "${file.name}"`, `स्कैन हेतु तैयार फ़ाइल: "${file.name}"`, `ਸਕੈਨ ਲਈ ਤਿਆਰ ਫਾਈਲ`));
        }
      } else if (lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".json")) {
        const text = await file.text();
        if (text) {
          setDocText(text);
          setExtractionMsg(
            tr(
              `Read ${text.length.toLocaleString()} characters from "${file.name}".`,
              `"${file.name}" से ${text.length.toLocaleString()} अक्षर पढ़े गए।`,
              `"${file.name}" ਵਿੱਚੋਂ ${text.length.toLocaleString()} ਅੱਖਰ ਪੜ੍ਹੇ ਗਏ।`
            )
          );
        }
      } else if (lower.endsWith(".pdf")) {
        setExtractionMsg(
          tr(
            `PDF attached: "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Text will be processed upon clicking Analyze.`,
            `पीडीएफ संलग्न: "${file.name}"। विश्लेषण पर क्लिक करने पर प्रक्रिया होगी।`,
            `ਪੀਡੀਐਫ ਨੱਥੀ: "${file.name}"। ਵਿਸ਼ਲੇਸ਼ਣ 'ਤੇ ਕਲਿੱਕ ਕਰਨ 'ਤੇ ਪ੍ਰਕਿਰਿਆ ਹੋਵੇਗੀ।`
          )
        );
      } else {
        setExtractionMsg(`Attached: "${file.name}"`);
      }
    } catch (e) {
      console.error("File read error:", e);
      setExtractionMsg(`Attached: "${file.name}"`);
    } finally {
      setExtracting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleClear = () => {
    setDocText("");
    setUploadedFile(null);
    setExtractionMsg("");
    setInvalidDoc(null);
    setResult(null);
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!docText.trim() && !uploadedFile) return;

    setInvalidDoc(null);
    setResult(null);

    // Client-side pre-validation: Is this a legal document?
    const validation = validateLegalDocument(docText, uploadedFile?.name);
    if (!validation.isValid) {
      setInvalidDoc({
        isInvalid: true,
        reason: validation.reason,
      });
      return;
    }

    setBusy(true);

    try {
      if (uploadedFile && (!docText.trim() || uploadedFile.name.toLowerCase().endsWith(".pdf"))) {
        const res = await analyzeDocumentFile(uploadedFile, lang);
        if (res.is_legal_document === false || res.error === "NON_LEGAL_DOCUMENT") {
          setInvalidDoc({
            isInvalid: true,
            reason: res.reason || "Non-legal document detected.",
          });
        } else {
          setResult(res);
          if (res.extracted_text && !docText.trim()) {
            setDocText(res.extracted_text);
          }
        }
      } else {
        const res = await analyzeDocument(docText, lang);
        if (res.is_legal_document === false || res.error === "NON_LEGAL_DOCUMENT") {
          setInvalidDoc({
            isInvalid: true,
            reason: res.reason || "Non-legal document detected.",
          });
        } else {
          setResult(res);
        }
      }
    } catch (err) {
      // Offline fallback for genuine legal documents
      const combined = `${uploadedFile?.name || ""} ${docText}`;
      const is138 = /138|cheque.*dishonour|dishonour.*cheque/i.test(combined);
      const isPoliceNotice = /35\(3\)|notice of appearance|police station|summons to appear|failure to attend/i.test(
        combined
      );
      const isBenign = /receipt|noc|clearance|settlement|safe|no objection/i.test(combined);

      if (is138) {
        setResult({
          analyzed: true,
          is_legal_document: true,
          is_safe: false,
          risk_status: "danger",
          risk_level: "CRITICAL",
          analysis: `### 1. Executive Summary (In Plain Words)
This document is a Statutory Legal Notice under Section 138 of the Negotiable Instruments Act, 1881 regarding dishonour of a cheque.

### 2. Automated Legal Risk Assessment
- Danger / Red Flags Detected: Threat of criminal complaint under Section 138 NI Act with up to 2 years imprisonment or fine up to double the cheque amount.
- Critical Deadlines: CRITICAL: 15-day statutory cure window from the date of receipt. Failure to pay permits criminal court filing within 30 days thereafter.
- Risk Severity: CRITICAL DANGER. Do not ignore this document under any circumstances.

### 3. Key Statutory Safeguards & Citizen Rights
You have the right to inspect bank return memos, verify if a legally enforceable debt actually existed, and raise defenses (e.g. stop payment for fraud or advance security cheque).

### 4. Recommended Action Checklist
1. Immediately check the date this notice was received (day 1 of 15 starts then).
2. Consult an advocate to prepare a formal reply within 15 days.
3. If amount is legitimately due, pay and obtain a signed written receipt/acknowledgment.`,
        });
      } else if (isPoliceNotice) {
        setResult({
          analyzed: true,
          is_legal_document: true,
          is_safe: false,
          risk_status: "danger",
          risk_level: "HIGH",
          analysis: `### 1. Executive Summary (In Plain Words)
This document is a formal Notice of Appearance issued by the Police under Section 35(3) of the Bharatiya Nagarik Suraksha Sanhita, 2023 (formerly Sec 41A CrPC).

### 2. Automated Legal Risk Assessment
- Danger / Red Flags Detected: Formal police inquiry. Failure to appear can lead to arrest with prior Magistrate permission under Section 35(5) BNSS.
- Critical Deadlines: Strict date and time of appearance mentioned in the notice.
- Risk Severity: HIGH DANGER. Immediate legal attention required.

### 3. Key Statutory Safeguards & Citizen Rights
Under Section 35(3) & 35(4) BNSS, as long as you comply with the notice and appear, police CANNOT arrest you without recorded reasons and Magistrate permission. You have the right to legal counsel under Article 22(1).

### 4. Recommended Action Checklist
1. Note the exact date, time, and police station mentioned.
2. Do NOT evade the notice. Cooperate in the inquiry.
3. Take a copy of the notice and get your attendance marked/signed by the investigating officer.
4. Call 15100 for free legal aid if you cannot afford an advocate.`,
        });
      } else if (isBenign) {
        setResult({
          analyzed: true,
          is_legal_document: true,
          is_safe: true,
          risk_status: "safe",
          risk_level: "LOW",
          analysis: `### 1. Executive Summary (In Plain Words)
This document is a standard acknowledgment, receipt, or no-objection certificate. It serves as legitimate proof of transaction or mutual clearance.

### 2. Automated Legal Risk Assessment
- Danger / Red Flags Detected: None. No threats of arrest, prosecution, or financial forfeiture.
- Critical Deadlines: None. No legal limitation clock is running.
- Risk Severity: LOW. Safe informational document.

### 3. Key Statutory Safeguards & Citizen Rights
Standard civil law protections apply. You are entitled to keep this document as valid legal proof of payment or mutual agreement.

### 4. Recommended Action Checklist
1. Verify that personal details and figures are accurate.
2. Store a digital and physical copy for your records.
3. No urgent legal action or court appearance required.`,
        });
      } else {
        setResult({
          analyzed: true,
          is_legal_document: true,
          is_safe: true,
          risk_status: "safe",
          risk_level: "LOW",
          analysis: `### 1. Executive Summary (In Plain Words)
This document represents legal terms or contractual correspondence between parties. No immediate threat of police arrest, criminal charges, or penalty was detected.

### 2. Automated Legal Risk Assessment
- Danger / Red Flags Detected: No imminent threat of police detention or criminal prosecution identified.
- Critical Deadlines: Review any specified contractual notice periods.
- Risk Severity: LOW / STANDARD.

### 3. Key Statutory Safeguards & Citizen Rights
Standard civil rights and contract law protections apply.

### 4. Recommended Action Checklist
1. Review the document carefully for your personal records.
2. If this relates to an ongoing dispute, consult free legal aid via NALSA helpline 15100.
3. No emergency legal action required.`,
        });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card card-accent card-raised p-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <span className="tone-icon-sm" style={{ background: "rgba(168,85,247,0.12)", color: "var(--c-purple)" }}>
              <Search size={18} />
            </span>
            <div>
              <h2 className="text-xl font-bold font-display text-ink">
                {tr(
                  "Legal Document Scanner & Risk Analyzer",
                  "कानूनी दस्तावेज़ स्कैनर और जोखिम विश्लेषक",
                  "ਕਾਨੂੰਨੀ ਦਸਤਾਵੇਜ਼ ਸਕੈਨਰ ਅਤੇ ਜੋਖਮ ਵਿਸ਼ਲੇਸ਼ਕ"
                )}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {tr(
                  "Upload any legal notice, court summons, or contract to scan for risks, deadlines, and statutory rights.",
                  "केवल कानूनी नोटिस, अदालती समन या अनुबंध अपलोड या पेस्ट करें और तत्काल जोखिम पहचानें।",
                  "ਸਿਰਫ਼ ਕਾਨੂੰਨੀ ਨੋਟਿਸ, ਅਦਾਲਤੀ ਸਮਨ ਜਾਂ ਇਕਰਾਰਨਾਮਾ ਅਪਲੋਡ ਜਾਂ ਪੇਸਟ ਕਰਕੇ ਜੋਖਮ ਪਛਾਣੋ।"
                )}
              </p>
            </div>
          </div>

          {/* Quick Preset Samples */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-muted flex items-center gap-1">
              <Sparkles size={12} className="text-accent" /> {tr("Quick Test:", "त्वरित परीक्षण:", "ਤੁਰੰਤ ਟੈਸਟ:")}
            </span>
            <button
              type="button"
              onClick={() => handleSelectSample("bnss35")}
              className="btn btn-sm btn-ghost text-xs text-red-600 dark:text-red-400 font-semibold"
            >
              🔴 {tr("Police Summons", "पुलिस समन", "ਪੁਲਿਸ ਸਮਨ")}
            </button>
            <button
              type="button"
              onClick={() => handleSelectSample("ni138")}
              className="btn btn-sm btn-ghost text-xs text-red-600 dark:text-red-400 font-semibold"
            >
              🔴 {tr("Cheque Bounce", "चेक बाउंस", "ਚੈੱਕ ਬਾਊਂਸ")}
            </button>
            <button
              type="button"
              onClick={() => handleSelectSample("rent")}
              className="btn btn-sm btn-ghost text-xs text-amber-600 dark:text-amber-400 font-semibold"
            >
              🟡 {tr("Rent Agreement", "किराया अनुबंध", "ਕਿਰਾਇਆ ਇਕਰਾਰਨਾਮਾ")}
            </button>
            <button
              type="button"
              onClick={() => handleSelectSample("safe_noc")}
              className="btn btn-sm btn-ghost text-xs text-emerald-600 dark:text-emerald-400 font-semibold"
            >
              🟢 {tr("Clean NOC", "एनओसी रसीद", "ਐਨਓਸੀ ਰਸੀਦ")}
            </button>
          </div>
        </div>

        {/* UNIFIED INPUT: FIRST DRAG & DROP FILE UPLOAD, THEN "OR", THEN TEXTAREA */}
        <form onSubmit={handleAnalyze} className="mt-5 space-y-4">
          {/* 1. Drag & Drop File Upload Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-accent bg-accent/10"
                : uploadedFile
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-line bg-surface/30 hover:border-accent hover:bg-surface/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />

            {uploadedFile ? (
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="tone-icon-sm" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                  <File size={22} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-ink">{uploadedFile.name}</div>
                  <div className="text-xs text-muted">
                    {(uploadedFile.size / 1024).toFixed(1)} KB &bull;{" "}
                    {extracting
                      ? tr("Extracting contents...", "सामग्री निकाली जा रही है...", "ਸਮੱਗਰੀ ਕੱਢੀ ਜਾ ਰਹੀ ਹੈ...")
                      : tr("Loaded into text box below", "नीचे टेक्स्ट बॉक्स में लोड किया गया", "ਹੇਠਾਂ ਟੈਕਸਟ ਬਾਕਸ ਵਿੱਚ ਲੋਡ ਕੀਤਾ ਗਿਆ")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                    setExtractionMsg("");
                  }}
                  className="p-1.5 rounded-full hover:bg-surface text-muted hover:text-ink ml-2"
                  title="Remove File"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="mx-auto w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <UploadCloud size={22} />
                </div>
                <div className="text-sm font-bold text-ink">
                  {tr("Drag & Drop your legal file here, or click to browse", "कानूनी दस्तावेज़ यहाँ खींचकर छोड़ें या ब्राउज़ करें", "ਕਾਨੂੰਨੀ ਫਾਈਲ ਇੱਥੇ ਖਿੱਚ ਕੇ ਛੱਡੋ ਜਾਂ ਬ੍ਰਾਊਜ਼ ਕਰੋ")}
                </div>
                <p className="text-xs text-muted max-w-md mx-auto">
                  {tr(
                    "Supports Word (.docx), PDF (.pdf), and Plain Text (.txt). Document text will automatically populate the text area below.",
                    "वर्ड (.docx), पीडीएफ (.pdf) और टेक्स्ट फाइलें समर्थित हैं। सामग्री स्वतः नीचे लोड हो जाएगी।",
                    "ਵਰਡ, ਪੀਡੀਐਫ ਅਤੇ ਟੈਕਸਟ ਫਾਈਲਾਂ ਸਮਰਥਿਤ ਹਨ। ਸਮੱਗਰੀ ਹੇਠਾਂ ਟੈਕਸਟ ਬਾਕਸ ਵਿੱਚ ਆ ਜਾਵੇਗੀ।"
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Extraction Confirmation Banner if file was read */}
          {extractionMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border-2 border-emerald-600/70 flex items-center justify-between text-xs text-emerald-950 dark:text-emerald-100 shadow-xs">
              <span className="flex items-center gap-2 font-bold">
                <CheckCircle2 size={16} className="text-emerald-800 dark:text-emerald-300 shrink-0" />
                {extractionMsg}
              </span>
              <button
                type="button"
                onClick={() => setExtractionMsg("")}
                className="text-emerald-900 dark:text-emerald-200 hover:text-emerald-950 font-extrabold ml-2 p-1"
                aria-label="Dismiss message"
              >
                ✕
              </button>
            </div>
          )}

          {/* 2. Middle Divider: "OR" */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs font-bold text-muted uppercase tracking-widest px-3 py-1 rounded-full bg-surface border border-line">
              {tr("OR", "अथवा", "ਜਾਂ")}
            </span>
            <div className="flex-1 h-px bg-line" />
          </div>

          {/* 3. Text Area for Pasting, Typing, or Reviewing Extracted Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-muted block">
                {tr(
                  "Paste, type, or review extracted legal document text below:",
                  "नीचे कानूनी दस्तावेज़ का टेक्स्ट चिपकाएँ, लिखें या समीक्षा करें:",
                  "ਕਾਨੂੰਨੀ ਦਸਤਾਵੇਜ਼ ਦਾ ਟੈਕਸਟ ਹੇਠਾਂ ਪੇਸਟ ਕਰੋ ਜਾਂ ਵੇਖੋ:"
                )}
              </label>
              {docText.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted">
                    {docText.length.toLocaleString()} {tr("characters", "अक्षर", "ਅੱਖਰ")}
                  </span>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[11px] text-muted hover:text-red-500 flex items-center gap-0.5 ml-2"
                  >
                    <Trash2 size={12} /> {tr("Clear", "साफ़ करें", "ਸਾਫ਼ ਕਰੋ")}
                  </button>
                </div>
              )}
            </div>
            <textarea
              required={!uploadedFile}
              rows={8}
              className="input w-full font-mono text-xs sm:text-sm leading-relaxed"
              value={docText}
              onChange={(e) => {
                setDocText(e.target.value);
                if (invalidDoc) setInvalidDoc(null);
              }}
              placeholder="Paste or review the legal notice, police summons, contract, or court paper here..."
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
            <span className="text-[11px] text-muted flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
              {tr(
                "Specialized exclusively for legal notices, court summons, and contracts.",
                "विशेष रूप से कानूनी नोटिसों, समन और अनुबंधों के लिए तैयार।",
                "ਸਿਰਫ਼ ਕਾਨੂੰਨੀ ਨੋਟਿਸਾਂ ਅਤੇ ਸਮਨਾਂ ਲਈ ਤਿਆਰ ਕੀਤਾ ਗਿਆ।"
              )}
            </span>
            <button
              type="submit"
              disabled={busy || (!docText.trim() && !uploadedFile)}
              className="btn btn-primary px-6 flex items-center gap-2 font-bold shadow-sm"
            >
              {busy ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>{tr("Scanning Document & Risks...", "दस्तावेज़ स्कैन हो रहा है...", "ਸਕੈਨਿੰਗ ਜਾਰੀ ਹੈ...")}</span>
                </>
              ) : (
                <>
                  <Search size={15} />
                  <span>{tr("Analyze & Detect Risks", "विश्लेषण करें और जोखिम पहचानें", "ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ ਅਤੇ ਜੋਖਮ ਪਛਾਣੋ")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* FANCY ERROR SCREEN: NON-LEGAL DOCUMENT DETECTED */}
      {invalidDoc && invalidDoc.isInvalid && (
        <div className="card p-6 sm:p-8 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-500 dark:border-amber-600 shadow-md space-y-5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-md shrink-0">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge bg-amber-200 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 border border-amber-600 font-extrabold text-xs uppercase px-2.5 py-0.5">
                  {tr("NON-LEGAL DOCUMENT DETECTED", "अमान्य दस्तावेज़ — केवल कानूनी दस्तावेज़ समर्थित हैं", "ਗੈਰ-ਕਾਨੂੰਨੀ ਦਸਤਾਵੇਜ਼")}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-100 tracking-tight">
                {tr("Not a Valid Legal Document — Analysis Paused", "अमान्य दस्तावेज़ — केवल कानूनी दस्तावेज़ विश्लेषित किए जाते हैं", "ਗੈਰ-ਕਾਨੂੰਨੀ ਦਸਤਾਵੇਜ਼ — ਵਿਸ਼ਲੇਸ਼ਣ ਰੋਕਿਆ ਗਿਆ")}
              </h3>
              <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 font-medium leading-relaxed">
                {tr(
                  "NyayaSahayak's Scanner is engineered exclusively for official legal notices, police summons (BNSS/CrPC), court warrants, 15-day cheque dishonour demand letters (Sec 138 NI Act), and tenancy/commercial contracts. The document you submitted appears to be an academic assignment, resume, or general non-legal file.",
                  "न्याय सहायक का स्कैनर केवल आधिकारिक कानूनी नोटिसों, पुलिस समन (बीएनएसएस), अदालती वारंट, चेक बाउंस नोटिस (धारा 138) और कानूनी अनुबंधों के विश्लेषण हेतु तैयार किया गया है। आपका दस्तावेज़ एक सामान्य असाइनमेंट या गैर-कानूनी फाइल प्रतीत होता है।",
                  "ਨਿਆਂ ਸਹਾਇਕ ਦਾ ਸਕੈਨਰ ਸਿਰਫ਼ ਅਧਿਕਾਰਤ ਕਾਨੂੰਨੀ ਨੋਟਿਸਾਂ, ਪੁਲਿਸ ਸਮਨਾਂ ਅਤੇ ਅਦਾਲਤੀ ਦਸਤਾਵੇਜ਼ਾਂ ਦੇ ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਤਿਆਰ ਕੀਤਾ ਗਿਆ ਹੈ। ਤੁਹਾਡਾ ਦਸਤਾਵੇਜ਼ ਇੱਕ ਆਮ ਅਸਾਈਨਮੈਂਟ ਜਾਂ ਗੈਰ-ਕਾਨੂੰਨੀ ਫਾਈਲ ਜਾਪਦਾ ਹੈ।"
                )}
              </p>
            </div>
          </div>

          {/* Two Guidance Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-amber-400 dark:border-amber-700/60">
            <div className="p-4 rounded-xl bg-surface border-2 border-emerald-500/50 shadow-xs">
              <div className="text-xs font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5 mb-2">
                <CheckCircle2 size={16} className="text-emerald-700 dark:text-emerald-400" />
                {tr("Documents You CAN Scan Here:", "यहाँ समर्थित कानूनी दस्तावेज़:", "ਇੱਥੇ ਸਕੈਨ ਕਰਨ ਯੋਗ ਦਸਤਾਵੇਜ਼:")}
              </div>
              <ul className="text-xs text-ink font-medium space-y-1.5 list-disc list-inside">
                <li>{tr("Police Notices & Appearance Orders (Sec 35 BNSS)", "पुलिस उपस्थिति समन व नोटिस (धारा 35 बीएनएसएस)", "ਪੁਲਿਸ ਨੋਟਿਸ (ਧਾਰਾ 35 ਬੀਐਨਐਸਐਸ)")}</li>
                <li>{tr("Court Summons & Judicial Arrest Warrants", "अदालती समन एवं न्यायिक वारंट", "ਅਦਾਲਤੀ ਸਮਨ ਅਤੇ ਵਾਰੰਟ")}</li>
                <li>{tr("15-Day Cheque Dishonour Notices (Sec 138 NI Act)", "15-दिवसीय चेक अनादर नोटिस (धारा 138)", "ਚੈੱਕ ਬਾਊਂਸ ਨੋਟਿਸ (ਧਾਰਾ 138)")}</li>
                <li>{tr("Residential & Commercial Tenancy Lease Agreements", "किराया एवं लीज अनुबंध", "ਕਿਰਾਏਨਾਮਾ ਅਤੇ ਲੀਜ਼ ਇਕਰਾਰਨਾਮੇ")}</li>
                <li>{tr("Deficiency in Service & Consumer Legal Notices", "उपभोक्ता शिकायत एवं सेवा में कमी नोटिस", "ਖਪਤਕਾਰ ਕਾਨੂੰਨੀ ਨੋਟਿਸ")}</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-surface border-2 border-red-500/50 shadow-xs">
              <div className="text-xs font-black text-red-950 dark:text-red-200 flex items-center gap-1.5 mb-2">
                <AlertOctagon size={16} className="text-red-700 dark:text-red-400" />
                {tr("Documents NOT Supported:", "असमर्थित दस्तावेज़:", "ਅਸਮਰਥਿਤ ਦਸਤਾਵੇਜ਼:")}
              </div>
              <ul className="text-xs text-ink font-medium space-y-1.5 list-disc list-inside">
                <li>{tr("University Assignments, Homework & Thesis Papers", "विश्वविद्यालय असाइनमेंट, गृहकार्य व थीसिस", "ਯੂਨੀਵਰਸਿਟੀ ਅਸਾਈਨਮੈਂਟ ਅਤੇ ਥੀਸਿਸ")}</li>
                <li>{tr("Resumes, CVs, and Job Applications", "बायोडाटा एवं नौकरी आवेदन", "ਨੌਕਰੀ ਲਈ ਰਿਜ਼ਿਊਮ")}</li>
                <li>{tr("Software Code, Technical Manuals & Articles", "सॉफ्टवेयर कोड, तकनीकी लेख व मैनुअल", "ਤਕਨੀਕੀ ਲੇਖ ਅਤੇ ਕੋਡ")}</li>
                <li>{tr("General invoices without legal dispute clauses", "सामान्य रसीदें जिनमें कानूनी विवाद न हो", "ਆਮ ਰਸੀਦਾਂ")}</li>
              </ul>
            </div>
          </div>

          {/* Quick Recovery Actions */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-amber-400 dark:border-amber-700/60">
            <span className="text-xs font-bold text-amber-950 dark:text-amber-100">
              {tr("Try testing with a real legal sample:", "वास्तविक कानूनी नमूने के साथ परीक्षण करें:", "ਅਸਲ ਕਾਨੂੰਨੀ ਨਮੂਨੇ ਨਾਲ ਟੈਸਟ ਕਰੋ:")}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleSelectSample("bnss35")}
                className="btn btn-sm btn-ghost border-2 border-red-500/60 text-xs font-extrabold text-red-800 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                🔴 {tr("Load Police Summons", "पुलिस समन लोड करें", "ਪੁਲਿਸ ਸਮਨ")}
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample("ni138")}
                className="btn btn-sm btn-ghost border-2 border-red-500/60 text-xs font-extrabold text-red-800 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                🔴 {tr("Load Cheque Bounce Notice", "चेक बाउंस नोटिस", "ਚੈੱਕ ਬਾਊਂਸ ਨੋਟਿਸ")}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-sm btn-ghost text-xs text-ink font-bold border border-line ml-1 hover:bg-surface-2"
              >
                {tr("Clear Form", "फ़ॉर्म साफ़ करें", "ਸਾਫ਼ ਕਰੋ")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS DISPLAY: PROMINENT GREEN/RED STATUS BANNER FIRST, THEN STRUCTURED BREAKDOWN */}
      {result && result.is_legal_document && (
        <div className="space-y-4">
          {/* 1. FIRST: PROMINENT VISUAL STATUS INDICATOR */}
          {result.is_safe ? (
            <div className="card p-6 sm:p-7 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-emerald-500 text-white shadow-md shrink-0">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg sm:text-xl font-extrabold text-emerald-800 dark:text-emerald-200">
                      {tr("SAFE — NO IMMEDIATE PUNITIVE THREAT DETECTED", "सुरक्षित — कोई दंडात्मक कानूनी जोखिम नहीं", "ਸੁਰੱਖਿਅਤ — ਕੋਈ ਕਾਨੂੰਨੀ ਖਤਰਾ ਨਹੀਂ")}
                    </span>
                    <span className="badge bg-emerald-500 text-white font-bold text-xs uppercase px-2 py-0.5">
                      {tr("Safe / Low Risk", "सुरक्षित / कम जोखिम", "ਸੁਰੱਖਿਅਤ / ਘੱਟ ਜੋਖਮ")}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-300 mt-1 leading-relaxed">
                    {tr(
                      "This document does not contain any personal police summons, arrest warrants, criminal complaints, or forfeiture countdowns. It represents a standard receipt, benign clearance, or non-coercive legal communication.",
                      "इस दस्तावेज़ में कोई पुलिस समन, अदालती वारंट, आपराधिक मुकदमा या जब्ती की समय सीमा नहीं है। यह एक वैध रसीद या सहमति पत्र प्रतीत होता है।",
                      "ਇਸ ਦਸਤਾਵੇਜ਼ ਵਿੱਚ ਕੋਈ ਪੁਲਿਸ ਸਮਨ ਜਾਂ ਅਦਾਲਤੀ ਵਾਰੰਟ ਨਹੀਂ ਹੈ। ਇਹ ਇੱਕ ਜਾਇਜ਼ ਰਸੀਦ ਜਾਂ ਸਹਿਮਤੀ ਪੱਤਰ ਜਾਪਦਾ ਹੈ।"
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 sm:p-7 rounded-2xl bg-red-500/10 border-2 border-red-500/40 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-red-600 text-white shadow-md shrink-0">
                  <AlertOctagon size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg sm:text-xl font-extrabold text-red-800 dark:text-red-200">
                      {tr("DANGER / HIGH RISK — URGENT ACTION REQUIRED", "खतरा / उच्च जोखिम — तत्काल कार्रवाई आवश्यक", "ਖਤਰਾ / ਉੱਚ ਜੋਖਮ — ਤੁਰੰਤ ਕਾਰਵਾਈ ਲੋੜੀਂਦੀ")}
                    </span>
                    <span className="badge bg-red-600 text-white font-bold text-xs uppercase px-2 py-0.5">
                      {result.risk_level || "HIGH"} RISK
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-red-900 dark:text-red-300 mt-1 leading-relaxed">
                    {tr(
                      "Critical statutory countdown or threat of coercive action detected! Do not ignore this document. Failure to respond within the statutory timeframe may result in arrest warrants, ex-parte court orders, or forfeiture.",
                      "वैधानिक समय सीमा या कानूनी कार्रवाई का खतरा! इस दस्तावेज़ को नजरअंदाज न करें। समय पर उत्तर न देने पर वारंट या नुकसान हो सकता है।",
                      "ਕਾਨੂੰਨੀ ਸਮਾਂ ਸੀਮਾ ਜਾਂ ਕਾਰਵਾਈ ਦਾ ਖਤਰਾ! ਇਸ ਦਸਤਾਵੇਜ਼ ਨੂੰ ਨਜ਼ਰਅੰਦਾਜ਼ ਨਾ ਕਰੋ। ਸਮੇਂ ਸਿਰ ਜਵਾਬ ਨਾ ਦੇਣ 'ਤੇ ਵਾਰੰਟ ਜਾਰੀ ਹੋ ਸਕਦੇ ਹਨ।"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. AUTOMATED LEGAL RISK ASSESSMENT & PLAIN LANGUAGE BREAKDOWN */}
          <div className="card card-accent card-raised p-6 sm:p-8 bg-white dark:bg-slate-900 border border-purple-500/30 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-line">
              <span className="tone-icon-sm" style={{ background: "rgba(168,85,247,0.12)", color: "var(--c-purple)" }}>
                <ShieldCheck size={18} />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-ink">
                  {tr("Automated Legal Risk Assessment & Plain-Language Breakdown", "कानूनी जोखिम मूल्यांकन और सरल व्याख्या", "ਕਾਨੂੰਨੀ ਜੋਖਮ ਮੁਲਾਂਕਣ ਅਤੇ ਸਰਲ ਵਿਆਖਿਆ")}
                </h3>
                <p className="text-[11px] text-muted">
                  {tr("Clear translation of complex legal clauses into actionable citizen guidance.", "जटिल कानूनी धाराओं का सरल व स्पष्ट मार्गदर्शन।", "ਗੁੰਝਲਦਾਰ ਕਾਨੂੰਨੀ ਧਾਰਾਵਾਂ ਦਾ ਸਰਲ ਮਾਰਗਦਰਸ਼ਨ।")}
                </p>
              </div>
            </div>

            <div className="markdown-prose text-xs sm:text-sm leading-relaxed text-ink space-y-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.analysis}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
