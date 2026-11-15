import { useState } from "react";
import { FileText, Copy, Printer, Check, Sparkles, AlertCircle, RefreshCw, Download } from "lucide-react";
import { useLang } from "../LangContext";
import { draftDocument } from "../api";

const PRESETS = {
  theft: {
    doc_type: "fir",
    label: "Sample: Mobile Theft (BNS 303)",
    data: {
      complainant_name: "Rahul Verma",
      contact: "+91 9876543210",
      address: "H.No. 42, Sector 15, Chandigarh",
      police_station: "Sector 17 Central Police Station, Chandigarh",
      accused_name: "Unknown suspect (approx 25 yrs, black jacket)",
      date: "14/11/2026 at 07:30 PM",
      location: "Near Sector 17 Plaza Market, Chandigarh",
      description: "While walking near the market entrance, two unidentified persons on a black motorcycle snatched my Samsung Galaxy S24 Ultra (IMEI: 354892019485721, Value approx Rs. 85,000) from my hand and fled towards Jan Marg. Kindly register an FIR and recover the stolen device.",
      amount: "Rs. 85,000",
    },
  },
  cheque: {
    doc_type: "cheque_notice",
    label: "Sample: Cheque Bounce (Sec 138 NI Act)",
    data: {
      complainant_name: "Suresh Sharma",
      contact: "+91 9812345678",
      address: "B-12, Model Town, Jalandhar, Punjab",
      opposite_party: "M/s Apex Enterprises (Prop. Amit Kumar)",
      date: "01/11/2026",
      location: "State Bank of India, Main Branch, Jalandhar",
      cheque_number: "482019",
      bank_name: "HDFC Bank, Civil Lines, Jalandhar",
      amount: "2,50,000",
      description: "Cheque issued towards outstanding payment for supply of construction material. Returned dishonoured on presentation with return memo dated 05/11/2026 citing 'Funds Insufficient'.",
    },
  },
  consumer: {
    doc_type: "consumer_notice",
    label: "Sample: Defective Laptop (Consumer Act 2019)",
    data: {
      complainant_name: "Priya Nair",
      contact: "+91 9988776655",
      address: "Flat 402, Green Glen Heights, Bengaluru",
      opposite_party: "ElectroTech Retail Pvt. Ltd. & Dell India",
      date: "10/10/2026",
      location: "Koramangala, Bengaluru",
      amount: "68,000",
      description: "Purchased laptop on 10/10/2026 (Invoice No. ET-8841). Motherboard failed within 10 days. Authorized service center refused replacement or repair citing unreasonable pretexts, constituting gross deficiency in service.",
    },
  },
};

export default function FirDraftStudio() {
  const { tr, lang } = useLang();
  const [docType, setDocType] = useState("fir");
  const [formData, setFormData] = useState(PRESETS.theft.data);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadPreset = (key) => {
    const p = PRESETS[key];
    if (p) {
      setDocType(p.doc_type);
      setFormData(p.data);
      setDraft("");
    }
  };

  const handleField = (f, v) => {
    setFormData((prev) => ({ ...prev, [f]: v }));
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setBusy(true);
    try {
      const res = await draftDocument(docType, formData, lang);
      setDraft(res.draft || "");
    } catch (_) {
      // Fallback client generation
      setDraft(
        `LEGAL DRAFT (${docType.toUpperCase()})\nDate: ${new Date().toLocaleDateString()}\n\nTO: ${formData.police_station || formData.opposite_party || "Concerned Authority"}\nFROM: ${formData.complainant_name}\n\nSUBJECT: Formal Complaint / Legal Notice under statutory Indian law.\n\n1. Complainant: ${formData.complainant_name}, Contact: ${formData.contact}, Residing at: ${formData.address}.\n2. Incident Date/Time: ${formData.date} at ${formData.location}.\n3. Facts: ${formData.description}\n\nRelief Claimed: Appropriate statutory registration and remedies under the Bharatiya Nagarik Suraksha Sanhita, 2023 / relevant laws.\n\nVerification: Declared true to personal knowledge.`
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="card card-accent card-raised p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="tone-icon-sm" style={{ background: "rgba(224,90,71,0.12)", color: "var(--c-rose)" }}>
                <FileText size={18} />
              </span>
              <h2 className="text-xl font-bold font-display text-ink">
                {tr("AI Legal Drafting Studio", "एआई कानूनी प्रारूपण स्टूडियो", "ਏਆਈ ਕਾਨੂੰਨੀ ਡਰਾਫਟਿੰਗ ਸਟੂਡੀਓ")}
              </h2>
            </div>
            <p className="text-xs text-muted mt-1">
              {tr(
                "Generate legally structured Police Complaints (Zero-FIR under Sec 173 BNSS) and 15-day statutory notices ready for print.",
                "धारा 173 बीएनएसएस के तहत पुलिस शिकायत और 15-दिवसीय कानूनी नोटिस तुरंत तैयार करें।",
                "ਧਾਰਾ 173 ਬੀਐਨਐਸਐਸ ਤਹਿਤ ਪੁਲਿਸ ਸ਼ਿਕਾਇਤ ਅਤੇ 15-ਦਿਨਾਂ ਦੇ ਕਾਨੂੰਨੀ ਨੋਟਿਸ ਤਿਆਰ ਕਰੋ।"
              )}
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-muted flex items-center gap-1">
              <Sparkles size={12} className="text-accent" /> {tr("Quick Test:", "त्वरित परीक्षण:", "ਤੁਰੰਤ ਟੈਸਟ:")}
            </span>
            <button type="button" onClick={() => loadPreset("theft")} className="btn btn-sm btn-ghost text-xs">
              {tr("Theft FIR", "चोरी एफआईआर", "ਚੋਰੀ ਐਫ਼ਆਈਆਰ")}
            </button>
            <button type="button" onClick={() => loadPreset("cheque")} className="btn btn-sm btn-ghost text-xs">
              {tr("Cheque Bounce", "चेक बाउंस", "ਚੈੱਕ ਬਾਊਂਸ")}
            </button>
            <button type="button" onClick={() => loadPreset("consumer")} className="btn btn-sm btn-ghost text-xs">
              {tr("Consumer Notice", "उपभोक्ता नोटिस", "ਖਪਤਕਾਰ ਨੋਟਿਸ")}
            </button>
          </div>
        </div>

        {/* Document Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          {[
            ["fir", tr("Zero-FIR / Police Complaint", "ज़ीरो एफआईआर / पुलिस शिकायत", "ਜ਼ੀਰੋ ਐਫ਼ਆਈਆਰ / ਪੁਲਿਸ ਸ਼ਿਕਾਇਤ"), "Sec 173 BNSS"],
            ["cheque_notice", tr("Cheque Dishonour Notice", "चेक अनादर नोटिस", "ਚੈੱਕ ਬਾਊਂਸ ਨੋਟਿਸ"), "Sec 138 NI Act"],
            ["consumer_notice", tr("Consumer Deficiency Notice", "उपभोक्ता शिकायत नोटिस", "ਖਪਤਕਾਰ ਨੋਟਿਸ"), "Consumer Act 2019"],
            ["tenant_notice", tr("Security Deposit Refund", "जमानत राशि वापसी नोटिस", "ਸੁਰੱਖਿਆ ਡਿਪਾਜ਼ਿਟ ਵਾਪਸੀ"), "Tenancy Rights"],
          ].map(([id, title, tag]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setDocType(id);
                setDraft("");
              }}
              className={`text-left p-3 rounded-xl border transition-all ${
                docType === id
                  ? "border-accent bg-accent/10 shadow-sm"
                  : "border-line bg-surface/40 hover:bg-surface/80"
              }`}
            >
              <div className="text-xs font-bold text-ink">{title}</div>
              <div className="text-[10px] text-accent font-semibold mt-0.5">{tag}</div>
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("Your Full Name (Complainant / Sender)", "आपका पूरा नाम (शिकायतकर्ता)", "ਤੁਹਾਡਾ ਪੂਰਾ ਨਾਮ (ਸ਼ਿਕਾਇਤਕਰਤਾ)")} *
              </label>
              <input
                type="text"
                required
                className="input w-full text-sm"
                value={formData.complainant_name || ""}
                onChange={(e) => handleField("complainant_name", e.target.value)}
                placeholder="e.g. Priya Sharma"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("Phone / Mobile Contact", "फोन / मोबाइल नंबर", "ਫੋਨ / ਮੋਬਾਈਲ ਸੰਪਰਕ")} *
              </label>
              <input
                type="text"
                required
                className="input w-full text-sm"
                value={formData.contact || ""}
                onChange={(e) => handleField("contact", e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {docType === "fir"
                  ? tr("Concerned Police Station / Location", "संबंधित थाना / स्थान", "ਸੰਬੰਧਿਤ ਪੁਲਿਸ ਥਾਣਾ / ਸਥਾਨ")
                  : tr("Opposite Party Name (Company / Person)", "विपक्षी पक्षकार का नाम", "ਦੂਜੀ ਧਿਰ ਦਾ ਨਾਮ")}
              </label>
              <input
                type="text"
                className="input w-full text-sm"
                value={docType === "fir" ? formData.police_station || "" : formData.opposite_party || ""}
                onChange={(e) =>
                  handleField(docType === "fir" ? "police_station" : "opposite_party", e.target.value)
                }
                placeholder={docType === "fir" ? "e.g. Police Station Sector 17, Chandigarh" : "e.g. M/s ABC Retail Ltd."}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("Date & Time of Incident / Transaction", "घटना / लेन-देन की तिथि व समय", "ਘਟਨਾ / ਲੈਣ-ਦੇਣ ਦੀ ਮਿਤੀ ਅਤੇ ਸਮਾਂ")}
              </label>
              <input
                type="text"
                className="input w-full text-sm"
                value={formData.date || ""}
                onChange={(e) => handleField("date", e.target.value)}
                placeholder="e.g. 14/11/2026 at 07:30 PM"
              />
            </div>
          </div>

          {docType === "cheque_notice" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Cheque Number *</label>
                <input
                  type="text"
                  className="input w-full text-sm"
                  value={formData.cheque_number || ""}
                  onChange={(e) => handleField("cheque_number", e.target.value)}
                  placeholder="e.g. 482019"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Bank Name *</label>
                <input
                  type="text"
                  className="input w-full text-sm"
                  value={formData.bank_name || ""}
                  onChange={(e) => handleField("bank_name", e.target.value)}
                  placeholder="e.g. HDFC Bank, Civil Lines"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Amount (Rs.) *</label>
                <input
                  type="text"
                  className="input w-full text-sm"
                  value={formData.amount || ""}
                  onChange={(e) => handleField("amount", e.target.value)}
                  placeholder="e.g. 2,50,000"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">
              {tr("Detailed Facts of Grievance / Incident Description", "शिकायत के विस्तृत तथ्य / घटना का विवरण", "ਸ਼ਿਕਾਇਤ ਦੇ ਵਿਸਥਾਰਪੂਰਵਕ ਤੱਥ")} *
            </label>
            <textarea
              required
              rows={4}
              className="input w-full text-sm leading-relaxed"
              value={formData.description || ""}
              onChange={(e) => handleField("description", e.target.value)}
              placeholder="Describe clearly what happened, who was involved, stolen property, or deficiency in service..."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-muted flex items-center gap-1.5">
              <AlertCircle size={14} className="text-accent shrink-0" />
              {tr(
                "Drafts are formatted under modern 2023 statutes with verification declarations.",
                "प्रारूप 2023 के आधुनिक कानूनों के तहत तैयार किए जाते हैं।",
                "ਡਰਾਫਟ 2023 ਦੇ ਨਵੇਂ ਕਾਨੂੰਨਾਂ ਤਹਿਤ ਤਿਆਰ ਕੀਤੇ ਜਾਂਦੇ ਹਨ।"
              )}
            </span>
            <button type="submit" disabled={busy} className="btn btn-primary px-6 flex items-center gap-2">
              {busy ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>{tr("Drafting in Progress...", "प्रारूपण जारी है...", "ਡਰਾਫਟਿੰਗ ਜਾਰੀ ਹੈ...")}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{tr("Generate Legal Draft", "कानूनी प्रारूप तैयार करें", "ਕਾਨੂੰਨੀ ਡਰਾਫਟ ਤਿਆਰ ਕਰੋ")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Draft Preview */}
      {draft && (
        <div className="card card-accent card-raised p-6 sm:p-8 relative bg-white dark:bg-slate-900 border border-amber-500/30">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-line print:hidden">
            <div className="flex items-center gap-2">
              <span className="tone-icon-sm" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                <Check size={16} />
              </span>
              <span className="text-sm font-bold text-ink">
                {tr("Statutory Legal Draft Ready", "वैधानिक कानूनी प्रारूप तैयार है", "ਕਾਨੂੰਨੀ ਡਰਾਫਟ ਤਿਆਰ ਹੈ")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-sm btn-ghost flex items-center gap-1.5 text-xs"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? tr("Copied!", "कॉपी हो गया!", "ਕਾਪੀ ਹੋ ਗਿਆ!") : tr("Copy Text", "टेक्स्ट कॉपी करें", "ਟੈਕਸਟ ਕਾਪੀ ਕਰੋ")}</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-sm btn-primary flex items-center gap-1.5 text-xs"
              >
                <Printer size={14} />
                <span>{tr("Print / PDF", "प्रिंट / पीडीएफ", "ਪ੍ਰਿੰਟ / ਪੀਡੀਐਫ")}</span>
              </button>
            </div>
          </div>

          {/* Printable Letterhead Format */}
          <div className="p-6 sm:p-8 border border-gray-300 dark:border-gray-700 bg-amber-500/[0.02] rounded-lg font-mono text-xs sm:text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed selection:bg-amber-500/20">
            {draft}
          </div>
        </div>
      )}
    </div>
  );
}
