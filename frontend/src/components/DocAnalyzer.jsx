import { useState, useRef } from "react";
import {
  Search,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Check,
  RefreshCw,
  FileText,
  Sparkles,
  UploadCloud,
  X,
  Printer,
  Copy,
  Download,
  RotateCcw,
} from "lucide-react";
import { useLang } from "../LangContext";
import { analyzeDocument, extractTextFromFile } from "../api";
import { printLegalDocument, downloadWordDocument } from "../utils/legalExport";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SAMPLES = {
  bnss35: {
    title: "Police Notice to Appear (Section 35(3) BNSS)",
    tag: "High Risk / Police Summons",
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
    title: "Cheque Dishonour Notice (Section 138 NI Act)",
    tag: "Critical Risk / 15-Day Demand",
    text: `LEGAL NOTICE UNDER SECTION 138 NEGOTIABLE INSTRUMENTS ACT, 1881

To: M/s Zenith Traders (Prop. Rajesh Gupta), Civil Lines, Ludhiana.

Under instructions from our client M/s Shivalik Goods, we hereby serve you with this statutory legal notice:
You had issued Cheque No. 901245 dated 25/10/2026 for an amount of Rs. 4,50,000/- drawn on Punjab National Bank in discharge of your debt. On presentation, the cheque was returned dishonoured on 02/11/2026 with remark "FUNDS INSUFFICIENT".

We hereby call upon you to make the payment of Rs. 4,50,000/- within 15 (FIFTEEN) DAYS of the receipt of this notice, failing which criminal proceedings under Section 138 of the Negotiable Instruments Act, 1881 shall be initiated against you before the Judicial Magistrate.`,
  },
  safe_lease: {
    title: "Standard Residential Agreement (Safe / Low Risk)",
    tag: "Safe / Standard Terms",
    text: `RESIDENTIAL LEASE AGREEMENT (STANDARD EXTRACT)

Clause 4 (Security Deposit Refund):
The Tenant has deposited an interest-free refundable security deposit of Rs. 30,000/- with the Landlord. Upon termination of tenancy and peaceful handover of vacant possession with 30 days prior written notice, the entire security deposit shall be refunded in full to the Tenant within 7 bank working days, subject only to actual outstanding electricity bills and mutually agreed physical repair expenses, if any.`,
  },
};

export default function DocAnalyzer() {
  const { tr, lang } = useLang();
  // Starts empty with placeholder
  const [docText, setDocText] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleClear = () => {
    setDocText("");
    setFileInfo(null);
    setAnalysisResult(null);
  };

  const handleLoadSample = (key) => {
    const s = SAMPLES[key];
    if (s) {
      setDocText(s.text);
      setFileInfo({ name: `${s.title}.txt`, size: s.text.length });
      setAnalysisResult(null);
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      if (file.name.endsWith(".txt")) {
        const text = await file.text();
        setDocText(text);
        setFileInfo({ name: file.name, size: file.size });
        setAnalysisResult(null);
      } else {
        const res = await extractTextFromFile(file);
        if (res.text) {
          setDocText(res.text);
          setFileInfo({ name: file.name, size: file.size, chars: res.chars });
          setAnalysisResult(null);
        } else {
          alert(res.error || "Could not extract text from document.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error reading document file: " + (err.message || "Failed to process file"));
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!docText.trim()) return;
    setBusy(true);
    try {
      const res = await analyzeDocument(docText, lang);
      setAnalysisResult(res);
    } catch (_) {
      // Deterministic fallback check
      const isDanger = /arrest|police|summons|warrant|138|cheque|penalty|forfeit/i.test(docText);
      setAnalysisResult({
        is_danger: isDanger,
        risk_level: isDanger ? "DANGER" : "SAFE",
        risk_headline: isDanger
          ? "DANGER / HIGH RISK DETECTED: URGENT LEGAL TIMELINES & ACTIONS REQUIRED"
          : "SAFE / LOW RISK: STANDARD TERMS / INFORMATIONAL NOTICE",
        analysis: `### 1. Executive Summary\n${
          isDanger
            ? "This document contains a formal legal summons, demand notice, or coercive statutory directive."
            : "This document appears to be a standard agreement or informational notice with no immediate coercive threat."
        }\n\n### 2. Urgent Deadlines & Risk Level\n${
          isDanger
            ? "**CRITICAL RISK (RED):** Strict statutory time limits apply (typically 7 to 15 days). Non-compliance may lead to court summons, adverse warrants, or criminal liability."
            : "**LOW RISK (GREEN):** Standard contractual terms. No immediate penalty or criminal exposure identified."
        }\n\n### 3. Key Statutory Safeguards & Rights\nYou have protected fundamental rights under Articles 21 and 22 of the Constitution of India, including the right to legal counsel and due process of law.\n\n### 4. Recommended Action Checklist\n1. Review all dates and demands carefully.\n2. Do not ignore statutory notices.\n3. Call the National Legal Aid helpline at 15100 for free counsel if in doubt.`,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult?.analysis) return;
    navigator.clipboard.writeText(analysisResult.analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (!analysisResult) return;
    const title = analysisResult.is_danger
      ? "LEGAL RISK AUDIT REPORT (HIGH RISK / DANGER)"
      : "LEGAL RISK AUDIT REPORT (SAFE / LOW RISK)";
    printLegalDocument(title, analysisResult.analysis);
  };

  const handleDownloadDoc = () => {
    if (!analysisResult) return;
    downloadWordDocument("Legal_Risk_Assessment_Report", "LEGAL DOCUMENT RISK AUDIT", analysisResult.analysis);
  };

  return (
    <div className="space-y-6">
      <div className="card card-accent card-raised p-6">
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
                  "Upload or paste any summons, police notice, or contract for automated danger/safety detection and plain-language breakdown.",
                  "किसी भी समन, पुलिस नोटिस या अनुबंध को अपलोड करें या चिपकाएं; तुरंत खतरे/सुरक्षा का विश्लेषण प्राप्त करें।",
                  "ਕਿਸੇ ਵੀ ਸਮਨ ਜਾਂ ਨੋਟਿਸ ਨੂੰ ਅਪਲੋਡ ਕਰੋ; ਤੁਰੰਤ ਜੋਖਮ ਵਿਸ਼ਲੇਸ਼ਣ ਪ੍ਰਾਪਤ ਕਰੋ।"
                )}
              </p>
            </div>
          </div>

          {/* Sample Preset Loaders for User Convenience */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-muted flex items-center gap-1">
              <Sparkles size={12} className="text-accent" /> {tr("Try Samples:", "नमूने:", "ਨਮੂਨੇ:")}
            </span>
            <button
              type="button"
              onClick={() => handleLoadSample("bnss35")}
              className="btn btn-sm btn-ghost text-[11px] py-1 px-2.5 h-auto border border-line text-red-600 dark:text-red-400"
            >
              🔴 Police Notice
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample("ni138")}
              className="btn btn-sm btn-ghost text-[11px] py-1 px-2.5 h-auto border border-line text-red-600 dark:text-red-400"
            >
              🔴 Cheque Bounce
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample("safe_lease")}
              className="btn btn-sm btn-ghost text-[11px] py-1 px-2.5 h-auto border border-line text-emerald-600 dark:text-emerald-400"
            >
              🟢 Safe Contract
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-sm btn-ghost text-[11px] py-1 px-2 h-auto text-muted hover:text-red-500"
              title="Clear all"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* Drag and Drop File Upload Zone */}
        <div className="mt-5">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-accent bg-accent/10"
                : "border-line/70 hover:border-accent/60 bg-surface/40 hover:bg-surface/70"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx,.doc"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="p-3 rounded-full bg-accent/15 text-accent-ink">
                {uploading ? (
                  <RefreshCw className="animate-spin" size={22} />
                ) : (
                  <UploadCloud size={22} />
                )}
              </div>
              <div className="text-xs font-bold text-ink">
                {uploading
                  ? tr("Extracting text from document...", "दस्तावेज़ से टेक्स्ट निकाला जा रहा है...", "ਟੈਕਸਟ ਕੱਢਿਆ ਜਾ ਰਿਹਾ ਹੈ...")
                  : tr(
                      "Click to upload or drag & drop legal notice / contract",
                      "कानूनी नोटिस या अनुबंध फ़ाइल यहाँ खींचें या अपलोड करें",
                      "ਕਾਨੂੰਨੀ ਨੋਟਿਸ ਜਾਂ ਇਕਰਾਰਨਾਮਾ ਇੱਥੇ ਅਪਲੋਡ ਕਰੋ"
                    )}
              </div>
              <p className="text-[11px] text-muted">
                Supports PDF (.pdf), Microsoft Word (.docx), and Text (.txt)
              </p>
            </div>
          </div>

          {/* Active Uploaded File Badge */}
          {fileInfo && (
            <div className="flex items-center justify-between mt-3 px-3 py-2 rounded-xl bg-accent/10 border border-accent/30 text-xs">
              <div className="flex items-center gap-2 font-medium text-ink truncate">
                <FileText size={15} className="text-accent shrink-0" />
                <span className="truncate">{fileInfo.name}</span>
                <span className="text-[11px] text-muted shrink-0">
                  ({fileInfo.chars ? `${fileInfo.chars} characters` : `${Math.round(fileInfo.size / 1024)} KB`})
                </span>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-muted hover:text-red-500 ml-2"
                title="Remove file"
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Text Area for Pasting Notice or Summons */}
        <form onSubmit={handleAnalyze} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">
              {tr(
                "Or Paste Legal Notice / Summons / Contract Text Below:",
                "या नीचे कानूनी नोटिस / समन / अनुबंध का टेक्स्ट चिपकाएँ:",
                "ਜਾਂ ਹੇਠਾਂ ਕਾਨੂੰਨੀ ਨੋਟਿਸ / ਸਮਨ ਦਾ ਟੈਕਸਟ ਪੇਸਟ ਕਰੋ:"
              )}
            </label>
            <textarea
              className="input w-full text-sm h-40 font-mono leading-relaxed"
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              placeholder="Paste the text of a police summons, court notice, cheque bounce demand, eviction notice, or tenancy agreement here..."
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted">
              {tr(
                "🔒 Scans for statutory deadlines, coercive threats, and constitutional rights.",
                "🔒 वैधानिक समय-सीमा, कानूनी धमकियों और अधिकारों का त्वरित विश्लेषण।",
                "🔒 ਸਮਾਂ-ਸੀਮਾ ਅਤੇ ਸੰਵਿਧਾਨਕ ਅਧਿਕਾਰਾਂ ਦੀ ਜਾਂਚ ਕਰਦਾ ਹੈ।"
              )}
            </span>
            <button
              type="submit"
              disabled={busy || !docText.trim()}
              className="btn btn-primary flex items-center gap-2 text-xs font-bold"
            >
              {busy ? <RefreshCw className="animate-spin" size={14} /> : <Search size={14} />}
              <span>{busy ? tr("Analyzing Document...", "विश्लेषण जारी है...", "ਵਿਸ਼ਲੇਸ਼ਣ ਚੱਲ ਰਿਹਾ ਹੈ...") : tr("Scan & Detect Legal Risks", "जोखिम विश्लेषण करें", "ਜੋਖਮ ਸਕੈਨ ਕਰੋ")}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="card card-accent card-raised p-6 sm:p-8 space-y-6">
          {/* 1. Traffic Light Indicator: GREEN TICK FOR SAFE, RED TICK FOR DANGER */}
          {analysisResult.is_danger ? (
            <div className="p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/40 flex items-start gap-4 shadow-sm animate-in fade-in duration-300">
              <div className="p-2.5 rounded-xl bg-red-600 text-white shrink-0 mt-0.5 shadow">
                <AlertOctagon size={28} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600 text-white flex items-center gap-1.5 shadow-sm">
                    <span>🔴</span>
                    <span>DANGER / HIGH RISK DETECTED</span>
                  </span>
                  <span className="text-xs font-bold text-red-700 dark:text-red-300">
                    Urgent Legal Action Required
                  </span>
                </div>
                <p className="text-sm font-semibold text-red-950 dark:text-red-100">
                  {tr(
                    "Warning: This document contains statutory deadlines, criminal allegations, police summons, or financial forfeiture clauses. Do not ignore it.",
                    "चेतावनी: इस दस्तावेज़ में वैधानिक समय-सीमा, आपराधिक आरोप, पुलिस समन या ज़ब्ती की शर्तें शामिल हैं। इसे अनदेखा न करें।",
                    "ਚੇਤਾਵਨੀ: ਇਸ ਦਸਤਾਵੇਜ਼ ਵਿੱਚ ਕਾਨੂੰਨੀ ਸਮਾਂ-ਸੀਮਾ, ਪੁਲਿਸ ਸਮਨ ਜਾਂ ਜ਼ਬਤੀ ਦੀਆਂ ਸ਼ਰਤਾਂ ਹਨ। ਇਸ ਨੂੰ ਅਣਦੇਖਾ ਨਾ ਕਰੋ।"
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 flex items-start gap-4 shadow-sm animate-in fade-in duration-300">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow">
                <CheckCircle2 size={28} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white flex items-center gap-1.5 shadow-sm">
                    <span>🟢</span>
                    <span>SAFE / LOW RISK</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    No Immediate Coercive Threat
                  </span>
                </div>
                <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                  {tr(
                    "No immediate risk of arrest, criminal prosecution, or adverse forfeiture was detected in this document. Standard legal terms apply.",
                    "इस दस्तावेज़ में गिरफ्तारी, आपराधिक मुकदमों या अनुचित ज़ब्ती का कोई तत्काल खतरा नहीं पाया गया है।",
                    "ਇਸ ਦਸਤਾਵੇਜ਼ ਵਿੱਚ ਗ੍ਰਿਫ਼ਤਾਰੀ ਜਾਂ ਕਾਨੂੰਨੀ ਖਤਰੇ ਦਾ ਕੋਈ ਤਤਕਾਲ ਜੋਖਮ ਨਹੀਂ ਪਾਇਆ ਗਿਆ।"
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pb-3 border-b border-line flex-wrap gap-2">
            <span className="text-xs font-bold text-ink uppercase tracking-wider">
              {tr("Plain-Language Statutory Audit Breakdown", "सरल भाषा में कानूनी विश्लेषण", "ਸਰਲ ਭਾਸ਼ਾ ਵਿੱਚ ਕਾਨੂੰਨੀ ਵਿਸ਼ਲੇਸ਼ਣ")}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-sm btn-ghost text-xs flex items-center gap-1 border border-line"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Report"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadDoc}
                className="btn btn-sm btn-ghost text-xs flex items-center gap-1 border border-line"
                title="Download Microsoft Word document"
              >
                <Download size={14} />
                <span>Word (.doc)</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-sm btn-primary text-xs flex items-center gap-1"
                title="Prints strictly this audit report on clean paper"
              >
                <Printer size={14} />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* Detailed Markdown Breakdown */}
          <div className="printable-legal-doc prose dark:prose-invert max-w-none text-sm text-ink space-y-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {analysisResult.analysis}
            </ReactMarkdown>
          </div>

          {/* Emergency Helplines Footer */}
          <div className="p-4 rounded-xl bg-surface/60 border border-line flex items-center justify-between flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink">Free Citizen Legal Aid:</span>
              <span className="text-muted">Dial 15100 (NALSA) or 1930 (Cyber Crime Helpline)</span>
            </div>
            <a
              href="tel:15100"
              className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
            >
              Call 15100 (Toll Free) →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
