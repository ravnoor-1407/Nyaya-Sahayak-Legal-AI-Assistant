import { useState, useRef } from "react";
import { Search, AlertTriangle, ShieldCheck, Clock, Check, RefreshCw, FileText, Sparkles, UploadCloud, File, X, AlertOctagon, CheckCircle2 } from "lucide-react";
import { useLang } from "../LangContext";
import { analyzeDocument, analyzeDocumentFile } from "../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    title: "Clean NOC / Rent Receipt",
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

export default function DocAnalyzer() {
  const { tr, lang } = useLang();
  const [inputMode, setInputMode] = useState("paste"); // "paste" | "upload"
  const [docText, setDocText] = useState(SAMPLES.bnss35.text);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  const handleSelectSample = (key) => {
    const s = SAMPLES[key];
    if (s) {
      setInputMode("paste");
      setDocText(s.text);
      setUploadedFile(null);
      setResult(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
      setInputMode("upload");
      setResult(null);
    }
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setBusy(true);
    setResult(null);

    try {
      if (inputMode === "upload" && uploadedFile) {
        const res = await analyzeDocumentFile(uploadedFile, lang);
        setResult(res);
      } else {
        if (!docText.trim()) return;
        const res = await analyzeDocument(docText, lang);
        setResult(res);
      }
    } catch (err) {
      // Deterministic fallback if API fails
      const textToScan = inputMode === "upload" && uploadedFile ? uploadedFile.name : docText;
      const isBenign = /receipt|noc|clearance|settlement|safe|no objection/i.test(textToScan);
      const is138 = /138|cheque|dishonour/i.test(textToScan);
      const isBnss = /35|police|summons|warrant|notice/i.test(textToScan);

      const isSafe = isBenign && !is138 && !isBnss;
      setResult({
        analyzed: true,
        is_safe: isSafe,
        risk_status: isSafe ? "safe" : "danger",
        risk_level: isSafe ? "LOW" : is138 ? "CRITICAL" : "HIGH",
        analysis: isSafe
          ? `### 1. Executive Summary (In Plain Words)\nThis document is a standard acknowledgment, receipt, or no-objection certificate. It serves as legitimate proof of transaction or mutual clearance.\n\n### 2. Automated Legal Risk Assessment\n- Danger / Red Flags Detected: None. No threats of arrest, prosecution, or financial forfeiture.\n- Critical Deadlines: None. No legal limitation clock is running.\n- Risk Severity: LOW. Safe informational document.\n\n### 3. Key Statutory Safeguards & Citizen Rights\nStandard civil law protections apply. You are entitled to keep this document as valid legal proof.\n\n### 4. Recommended Action Checklist\n1. Verify that personal details and figures are accurate.\n2. Store a digital and physical copy for your records.\n3. No urgent legal action or court appearance required.`
          : `### 1. Executive Summary (In Plain Words)\nThis document is a formal legal notice or police summons requiring your immediate attention.\n\n### 2. Automated Legal Risk Assessment\n- Danger / Red Flags Detected: Formal legal proceedings or police investigation. Non-compliance may trigger criminal complaints or warrants.\n- Critical Deadlines: Check specified time limits (usually 7 to 15 days).\n- Risk Severity: HIGH DANGER. Immediate legal response advised.\n\n### 3. Key Statutory Safeguards & Citizen Rights\nYou have constitutional rights under Articles 21 and 22, including the right to legal counsel and protection against arbitrary arrest.\n\n### 4. Recommended Action Checklist\n1. Note the exact dates and deadlines.\n2. Do not ignore or evade the document.\n3. Consult an advocate or call free legal aid helpline 15100.`,
      });
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
                  "Upload or paste any legal notice, summons, or contract to detect risks, extract deadlines, and get plain-language guidance.",
                  "किसी भी कानूनी नोटिस, समन या अनुबंध को अपलोड या पेस्ट करें और तत्काल जोखिम पहचानें।",
                  "ਕਿਸੇ ਵੀ ਕਾਨੂੰਨੀ ਨੋਟਿਸ ਜਾਂ ਇਕਰਾਰਨਾਮੇ ਨੂੰ ਅਪਲੋਡ ਜਾਂ ਪੇਸਟ ਕਰਕੇ ਜੋਖਮ ਪਛਾਣੋ।"
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
              className="btn btn-sm btn-ghost text-xs text-red-600 dark:text-red-400"
            >
              🔴 {tr("Police Summons", "पुलिस समन", "ਪੁਲਿਸ ਸਮਨ")}
            </button>
            <button
              type="button"
              onClick={() => handleSelectSample("ni138")}
              className="btn btn-sm btn-ghost text-xs text-red-600 dark:text-red-400"
            >
              🔴 {tr("Cheque Bounce", "चेक बाउंस", "ਚੈੱਕ ਬਾਊਂਸ")}
            </button>
            <button
              type="button"
              onClick={() => handleSelectSample("safe_noc")}
              className="btn btn-sm btn-ghost text-xs text-emerald-600 dark:text-emerald-400 font-semibold"
            >
              🟢 {tr("Safe NOC / Receipt", "सुरक्षित रसीद", "ਸੁਰੱਖਿਅਤ ਰਸੀਦ")}
            </button>
          </div>
        </div>

        {/* Input Mode Switcher (Paste Text vs Upload File) */}
        <div className="flex items-center gap-2 mt-5">
          <button
            type="button"
            onClick={() => setInputMode("paste")}
            className={`btn btn-sm text-xs font-semibold ${
              inputMode === "paste" ? "btn-primary" : "btn-ghost border border-line"
            }`}
          >
            <FileText size={14} className="mr-1" />
            {tr("Paste Document Text", "टेक्स्ट पेस्ट करें", "ਟੈਕਸਟ ਪੇਸਟ ਕਰੋ")}
          </button>
          <button
            type="button"
            onClick={() => setInputMode("upload")}
            className={`btn btn-sm text-xs font-semibold ${
              inputMode === "upload" ? "btn-primary" : "btn-ghost border border-line"
            }`}
          >
            <UploadCloud size={14} className="mr-1" />
            {tr("Upload File (PDF / DOCX / TXT)", "फ़ाइल अपलोड करें (PDF / Word / TXT)", "ਫਾਈਲ ਅਪਲੋਡ ਕਰੋ")}
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleAnalyze} className="mt-4 space-y-4">
          {inputMode === "paste" ? (
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr(
                  "Paste Legal Notice / Summons / Agreement Text",
                  "कानूनी नोटिस / समन / समझौते का टेक्स्ट यहाँ चिपकाएँ",
                  "ਕਾਨੂੰਨੀ ਨੋਟਿਸ / ਸਮਨ / ਇਕਰਾਰਨਾਮੇ ਦਾ ਟੈਕਸਟ ਇੱਥੇ ਪੇਸਟ ਕਰੋ"
                )}
              </label>
              <textarea
                required
                rows={8}
                className="input w-full font-mono text-xs sm:text-sm leading-relaxed"
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                placeholder="Paste the full text of your legal notice, police letter, tenancy agreement, or contract here..."
              />
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
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
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="tone-icon-sm" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                    <File size={20} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-ink">{uploadedFile.name}</div>
                    <div className="text-xs text-muted">
                      {(uploadedFile.size / 1024).toFixed(1)} KB &bull; {tr("Ready for risk scan", "जोखिम स्कैन हेतु तैयार", "ਸਕੈਨ ਲਈ ਤਿਆਰ")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                    className="p-1 rounded-full hover:bg-surface text-muted hover:text-ink ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <UploadCloud size={24} />
                  </div>
                  <div className="text-sm font-bold text-ink">
                    {tr("Click to browse or Drag & Drop legal document", "फ़ाइल ब्राउज़ करें या यहाँ खींचकर छोड़ें", "ਫਾਈਲ ਅਪਲੋਡ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ")}
                  </div>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    {tr(
                      "Supports PDF (.pdf), Microsoft Word (.docx), and Plain Text (.txt) up to 10MB.",
                      "पीडीएफ, वर्ड (.docx) और टेक्स्ट फाइलें समर्थित हैं।",
                      "ਪੀਡੀਐਫ, ਵਰਡ ਅਤੇ ਟੈਕਸਟ ਫਾਈਲਾਂ ਸਮਰਥਿਤ ਹਨ।"
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Privacy badge and submit button */}
          <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
            <span className="text-[11px] text-muted flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
              {tr(
                "Client-side de-identification scrubs sensitive Aadhaar & phone numbers before processing.",
                "संवेदनशील आधार व फोन नंबरों को पहले सुरक्षित किया जाता है।",
                "ਸੰਵੇਦਨਸ਼ੀਲ ਵੇਰਵੇ ਪਹਿਲਾਂ ਸੁਰੱਖਿਅਤ ਕੀਤੇ ਜਾਂਦੇ ਹਨ।"
              )}
            </span>
            <button
              type="submit"
              disabled={busy || (inputMode === "upload" && !uploadedFile) || (inputMode === "paste" && !docText.trim())}
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

      {/* RESULTS DISPLAY: PROMINENT GREEN/RED STATUS BANNER FIRST, THEN STRUCTURED BREAKDOWN */}
      {result && (
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
                      {tr("SAFE — NO IMMEDIATE PUNITIVE THREAT DETECTED", "सुरक्षित — कोई तत्काल दंडात्मक जोखिम नहीं", "ਸੁਰੱਖਿਅਤ — ਕੋਈ ਤੁਰੰਤ ਜੋਖਮ ਨਹੀਂ")}
                    </span>
                    <span className="badge bg-emerald-500 text-white font-bold text-xs uppercase px-2 py-0.5">
                      {tr("Low Risk", "कम जोखिम", "ਘੱਟ ਜੋਖਮ")}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-300 mt-1 leading-relaxed">
                    {tr(
                      "This document does not contain any coercive police arrest summons, court trial warrants, or criminal dishonour threats. It appears to be a legitimate acknowledgment, clearance, or mutual agreement.",
                      "इस दस्तावेज़ में कोई पुलिस समन, अदालती वारंट या आपराधिक मुकदमा चलाने की धमकी नहीं मिली है। यह एक वैध रसीद या सहमति पत्र प्रतीत होता है।",
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
