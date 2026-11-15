import { useState } from "react";
import { FileText, Copy, Printer, Check, Sparkles, AlertCircle, RefreshCw, Download, RotateCcw } from "lucide-react";
import { useLang } from "../LangContext";
import { draftDocument } from "../api";
import { printLegalDocument, downloadWordDocument } from "../utils/legalExport";

const BLANK_FORM = {
  complainant_name: "",
  contact: "",
  address: "",
  police_station: "",
  accused_name: "",
  opposite_party: "",
  date: "",
  location: "",
  cheque_number: "",
  bank_name: "",
  amount: "",
  description: "",
};

const SAMPLE_PRESETS = {
  theft: {
    doc_type: "fir",
    label: "Theft / Snatching Sample",
    data: {
      complainant_name: "Rahul Verma",
      contact: "+91 98765 43210",
      address: "H.No. 42, Sector 15, Chandigarh",
      police_station: "Sector 17 Central Police Station, Chandigarh",
      accused_name: "Unknown suspect (approx 25 yrs, black jacket)",
      date: "14/11/2026 at 07:30 PM",
      location: "Near Sector 17 Plaza Market, Chandigarh",
      amount: "Rs. 85,000",
      description: "While walking near the market entrance, two unidentified persons on a black motorcycle snatched my Samsung Galaxy S24 Ultra (IMEI: 354892019485721, Value approx Rs. 85,000) from my hand and fled towards Jan Marg. Kindly register an FIR under Section 173 BNSS and recover the stolen device.",
    },
  },
  cheque: {
    doc_type: "cheque_notice",
    label: "Cheque Bounce Sample",
    data: {
      complainant_name: "Suresh Sharma",
      contact: "+91 98123 45678",
      address: "B-12, Model Town, Jalandhar, Punjab",
      opposite_party: "M/s Apex Enterprises (Prop. Amit Kumar)",
      date: "01/11/2026",
      location: "State Bank of India, Main Branch, Jalandhar",
      cheque_number: "482019",
      bank_name: "HDFC Bank, Civil Lines, Jalandhar",
      amount: "Rs. 2,50,000",
      description: "Cheque issued towards outstanding payment for supply of construction material. Returned dishonoured on presentation with return memo citing 'Funds Insufficient'.",
    },
  },
  consumer: {
    doc_type: "consumer_notice",
    label: "Defective Goods Sample",
    data: {
      complainant_name: "Priya Nair",
      contact: "+91 99887 76655",
      address: "Flat 402, Green Glen Heights, Bengaluru",
      opposite_party: "ElectroTech Retail Pvt. Ltd. & Dell India",
      date: "10/10/2026",
      location: "Koramangala, Bengaluru",
      amount: "Rs. 68,000",
      description: "Purchased laptop on 10/10/2026 (Invoice No. ET-8841). Motherboard failed within 10 days. Authorized service center refused replacement or refund citing unreasonable pretexts, constituting gross deficiency in service.",
    },
  },
};

export default function FirDraftStudio() {
  const { tr, lang } = useLang();
  const [docType, setDocType] = useState("fir");
  // Default to completely BLANK form so user fills it in
  const [formData, setFormData] = useState(BLANK_FORM);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadSample = (key) => {
    const p = SAMPLE_PRESETS[key];
    if (p) {
      setDocType(p.doc_type);
      setFormData(p.data);
      setDraft("");
    }
  };

  const handleClear = () => {
    setFormData(BLANK_FORM);
    setDraft("");
  };

  const handleField = (f, v) => {
    setFormData((prev) => ({ ...prev, [f]: v }));
  };

  const getDocTitle = () => {
    switch (docType) {
      case "fir":
        return "ZERO-FIR / POLICE COMPLAINT (SEC 173 BNSS)";
      case "cheque_notice":
        return "STATUTORY DEMAND NOTICE (SEC 138 NI ACT)";
      case "consumer_notice":
        return "CONSUMER GRIEVANCE NOTICE (CPA 2019)";
      case "rent_notice":
        return "SECURITY DEPOSIT REFUND LEGAL NOTICE";
      default:
        return "FORMAL LEGAL DRAFT";
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setBusy(true);
    try {
      const res = await draftDocument(docType, formData, lang);
      setDraft(res.draft || "");
    } catch (_) {
      // Fallback deterministic draft generator
      const dateStr = formData.date || new Date().toLocaleDateString("en-IN");
      const name = formData.complainant_name || "[Complainant / Citizen Name]";
      const contact = formData.contact || "[Contact Number]";
      const addr = formData.address || "[Residential Address]";
      const opp = formData.police_station || formData.opposite_party || "[Opposite Authority / Party]";
      const facts = formData.description || "[Detailed description of facts and incident]";

      setDraft(
        `${getDocTitle()}\nDate: ${new Date().toLocaleDateString("en-IN")}\n\nTO:\n${opp}\n\nFROM:\n${name}\nAddress: ${addr}\nContact: ${contact}\n\nSUBJECT: Formal Notice / Statutory Complaint under Applicable Indian Law.\n\nMOST RESPECTFULLY SHOWETH:\n\n1. That the Complainant is a law-abiding citizen residing at the aforementioned address.\n\n2. Incident Particulars:\n   - Date & Time: ${dateStr}\n   - Location: ${formData.location || "[Location of Incident]"}\n   - Financial Value / Claim: ${formData.amount || "N/A"}\n\n3. Facts of the Case:\n${facts}\n\n4. Relief / Statutory Action Requested:\n   You are hereby called upon to take immediate statutory cognizance of the aforesaid facts and initiate appropriate proceedings in accordance with law.\n\nVERIFICATION:\nI, ${name}, do hereby verify that the contents stated above are true and correct to the best of my knowledge and belief.\n\n___________________________\nSignature / Thumb Impression\n(${name})`
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

  // Isolated print: Prints ONLY the legal draft on an official A4 page
  const handlePrint = () => {
    if (!draft) return;
    printLegalDocument(getDocTitle(), draft);
  };

  // Instant export as Microsoft Word document (.doc)
  const handleDownloadDoc = () => {
    if (!draft) return;
    downloadWordDocument(`${docType}_draft`, getDocTitle(), draft);
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
                "Draft court-ready Police Complaints (Zero-FIR under Sec 173 BNSS) and statutory legal notices ready for print or Word export.",
                "धारा 173 बीएनएसएस के तहत पुलिस शिकायत और कानूनी नोटिस तैयार करें, जिसे सीधे प्रिंट या वर्ड में निर्यात किया जा सकता है।",
                "ਧਾਰਾ 173 ਬੀਐਨਐਸਐਸ ਅਧੀਨ ਪੁਲਿਸ ਸ਼ਿਕਾਇਤ ਅਤੇ ਕਾਨੂੰਨੀ ਨੋਟਿਸ ਤਿਆਰ ਕਰੋ।"
              )}
            </p>
          </div>

          {/* Sample Loaders for User Reference */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-muted flex items-center gap-1">
              <Sparkles size={12} className="text-accent" /> {tr("Demo Samples:", "नमूने:", "ਨਮੂਨੇ:")}
            </span>
            <button
              type="button"
              onClick={() => loadSample("theft")}
              className="btn btn-sm btn-ghost text-[11px] py-1 px-2.5 h-auto border border-line"
            >
              Theft FIR
            </button>
            <button
              type="button"
              onClick={() => loadSample("cheque")}
              className="btn btn-sm btn-ghost text-[11px] py-1 px-2.5 h-auto border border-line"
            >
              Cheque 138
            </button>
            <button
              type="button"
              onClick={() => loadSample("consumer")}
              className="btn btn-sm btn-ghost text-[11px] py-1 px-2.5 h-auto border border-line"
            >
              Consumer Notice
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-sm btn-ghost text-[11px] py-1 px-2 h-auto text-muted hover:text-red-500"
              title="Clear all fields"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* Document Type Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          <button
            type="button"
            onClick={() => setDocType("fir")}
            className={`p-3 rounded-xl border text-left transition-all text-xs font-semibold ${
              docType === "fir"
                ? "bg-accent/15 border-accent text-accent-ink font-bold shadow-sm"
                : "border-line bg-surface/50 text-muted hover:bg-surface"
            }`}
          >
            <div className="font-bold text-ink">Police Complaint / FIR</div>
            <div className="text-[10px] text-muted mt-0.5">Sec 173 BNSS Zero-FIR</div>
          </button>

          <button
            type="button"
            onClick={() => setDocType("cheque_notice")}
            className={`p-3 rounded-xl border text-left transition-all text-xs font-semibold ${
              docType === "cheque_notice"
                ? "bg-accent/15 border-accent text-accent-ink font-bold shadow-sm"
                : "border-line bg-surface/50 text-muted hover:bg-surface"
            }`}
          >
            <div className="font-bold text-ink">Cheque Bounce Notice</div>
            <div className="text-[10px] text-muted mt-0.5">Sec 138 NI Act (15-Day)</div>
          </button>

          <button
            type="button"
            onClick={() => setDocType("consumer_notice")}
            className={`p-3 rounded-xl border text-left transition-all text-xs font-semibold ${
              docType === "consumer_notice"
                ? "bg-accent/15 border-accent text-accent-ink font-bold shadow-sm"
                : "border-line bg-surface/50 text-muted hover:bg-surface"
            }`}
          >
            <div className="font-bold text-ink">Consumer Legal Notice</div>
            <div className="text-[10px] text-muted mt-0.5">Consumer Protection Act</div>
          </button>

          <button
            type="button"
            onClick={() => setDocType("rent_notice")}
            className={`p-3 rounded-xl border text-left transition-all text-xs font-semibold ${
              docType === "rent_notice"
                ? "bg-accent/15 border-accent text-accent-ink font-bold shadow-sm"
                : "border-line bg-surface/50 text-muted hover:bg-surface"
            }`}
          >
            <div className="font-bold text-ink">Rent Deposit Notice</div>
            <div className="text-[10px] text-muted mt-0.5">Security Deposit Refund</div>
          </button>
        </div>

        {/* Input Form Fields: Clean with Helpful Placeholders */}
        <form onSubmit={handleGenerate} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("Your Full Name (Complainant)", "आपका पूरा नाम (शिकायतकर्ता)", "ਤੁਹਾਡਾ ਪੂਰਾ ਨਾਮ")}
              </label>
              <input
                type="text"
                className="input w-full text-sm"
                value={formData.complainant_name}
                onChange={(e) => handleField("complainant_name", e.target.value)}
                placeholder="e.g. Rahul Verma"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("Contact Number", "संपर्क नंबर", "ਸੰਪਰਕ ਨੰਬਰ")}
              </label>
              <input
                type="text"
                className="input w-full text-sm"
                value={formData.contact}
                onChange={(e) => handleField("contact", e.target.value)}
                placeholder="e.g. +91 98765 43210"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">
              {tr("Your Complete Address", "आपका पूरा पता", "ਤੁਹਾਡਾ ਪੂਰਾ ਪਤਾ")}
            </label>
            <input
              type="text"
              className="input w-full text-sm"
              value={formData.address}
              onChange={(e) => handleField("address", e.target.value)}
              placeholder="e.g. H.No. 42, Sector 15, Chandigarh"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {docType === "fir" ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">
                    {tr("Target Police Station", "संबद्ध पुलिस स्टेशन", "ਪੁਲਿਸ ਸਟੇਸ਼ਨ")}
                  </label>
                  <input
                    type="text"
                    className="input w-full text-sm"
                    value={formData.police_station}
                    onChange={(e) => handleField("police_station", e.target.value)}
                    placeholder="e.g. Sector 17 Central Police Station, Chandigarh"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">
                    {tr("Accused / Suspect Details", "आरोपी / संदिग्ध का विवरण", "ਦੋਸ਼ੀ ਦਾ ਵੇਰਵਾ")}
                  </label>
                  <input
                    type="text"
                    className="input w-full text-sm"
                    value={formData.accused_name}
                    onChange={(e) => handleField("accused_name", e.target.value)}
                    placeholder="e.g. Unknown suspect (approx 25 yrs, black jacket) or specific person"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">
                    {tr("Opposite Party / Defaulter Name", "विपक्षी पार्टी / देनदार का नाम", "ਦੂਜੀ ਧਿਰ ਦਾ ਨਾਮ")}
                  </label>
                  <input
                    type="text"
                    className="input w-full text-sm"
                    value={formData.opposite_party}
                    onChange={(e) => handleField("opposite_party", e.target.value)}
                    placeholder="e.g. M/s Apex Enterprises / Landlord Name / Store Manager"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">
                    {docType === "cheque_notice" ? "Cheque Number & Bank" : "Disputed Amount / Claim"}
                  </label>
                  <input
                    type="text"
                    className="input w-full text-sm"
                    value={docType === "cheque_notice" ? formData.cheque_number : formData.amount}
                    onChange={(e) =>
                      handleField(docType === "cheque_notice" ? "cheque_number" : "amount", e.target.value)
                    }
                    placeholder={docType === "cheque_notice" ? "e.g. Cheque No. 482019 (SBI Main Branch)" : "e.g. Rs. 85,000"}
                  />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("Date & Time of Incident / Transaction", "घटना / लेनदेन की तिथि और समय", "ਮਿਤੀ ਅਤੇ ਸਮਾਂ")}
              </label>
              <input
                type="text"
                className="input w-full text-sm"
                value={formData.date}
                onChange={(e) => handleField("date", e.target.value)}
                placeholder="e.g. 14/11/2026 at 07:30 PM"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("Location / Branch / Platform", "स्थान / शाखा / प्लेटफार्म", "ਸਥਾਨ ਜਾਂ ਪਲੇਟਫਾਰਮ")}
              </label>
              <input
                type="text"
                className="input w-full text-sm"
                value={formData.location}
                onChange={(e) => handleField("location", e.target.value)}
                placeholder="e.g. Near Sector 17 Plaza Market, Chandigarh"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">
              {tr("Description of Incident / Grievance (Facts)", "घटना / शिकायत का पूरा विवरण (तथ्य)", "ਘਟਨਾ ਦਾ ਪੂਰਾ ਵੇਰਵਾ")}
            </label>
            <textarea
              className="input w-full text-sm h-28"
              value={formData.description}
              onChange={(e) => handleField("description", e.target.value)}
              placeholder="e.g. While walking near the market entrance, two unidentified persons on a black motorcycle snatched my phone and fled towards Jan Marg..."
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-muted">
              {tr(
                "⚡ Generates standard statutory legal structure under Indian law.",
                "⚡ भारतीय कानून के तहत मानक वैधानिक प्रारूप तैयार करता है।",
                "⚡ ਭਾਰਤੀ ਕਾਨੂੰਨ ਅਧੀਨ ਮਿਆਰੀ ਕਾਨੂੰਨੀ ਫਾਰਮੈਟ ਤਿਆਰ ਕਰਦਾ ਹੈ।"
              )}
            </span>
            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary flex items-center gap-2 text-xs font-bold"
            >
              {busy ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
              <span>{busy ? tr("Generating Draft...", "प्रारूप तैयार हो रहा है...", "ਡਰਾਫਟ ਬਣ ਰਿਹਾ ਹੈ...") : tr("Generate Formal Legal Draft", "औपचारिक कानूनी प्रारूप बनाएं", "ਕਾਨੂੰਨੀ ਡਰਾਫਟ ਬਣਾਓ")}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated Legal Document Output */}
      {draft && (
        <div className="card card-accent card-raised p-6 sm:p-8 bg-white dark:bg-slate-900 border border-accent/40">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-line flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-accent/20 text-accent-ink">
                Ready for Print / Filing
              </span>
              <span className="text-xs text-muted font-medium">Standard Indian Legal Layout</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-sm btn-ghost text-xs flex items-center gap-1 border border-line"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadDoc}
                className="btn btn-sm btn-ghost text-xs flex items-center gap-1 border border-line"
                title="Download editable Microsoft Word document"
              >
                <Download size={14} />
                <span>Word (.doc)</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-sm btn-primary text-xs flex items-center gap-1"
                title="Prints ONLY this document on clean white paper"
              >
                <Printer size={14} />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* Printable Document Box */}
          <div
            id="printable-legal-draft"
            className="printable-legal-doc p-6 sm:p-8 border border-gray-300 dark:border-gray-700 bg-amber-500/[0.02] rounded-xl font-serif text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed shadow-inner"
          >
            {draft}
          </div>

          <p className="text-[11px] text-muted text-center mt-4">
            💡 <strong>Note:</strong> Clicking <strong>Print / Save PDF</strong> prints strictly this document page without any website headers, sidebars, or menus.
          </p>
        </div>
      )}
    </div>
  );
}
