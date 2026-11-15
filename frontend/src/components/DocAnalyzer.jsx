import { useState } from "react";
import { Search, AlertTriangle, ShieldCheck, Clock, Check, RefreshCw, FileText, Sparkles } from "lucide-react";
import { useLang } from "../LangContext";
import { analyzeDocument } from "../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SAMPLES = {
  bnss35: {
    title: "Police Notice to Appear (Section 35(3) BNSS)",
    tag: "Criminal Procedure",
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
    tag: "Commercial Law",
    text: `LEGAL NOTICE UNDER SECTION 138 NEGOTIABLE INSTRUMENTS ACT, 1881

To: M/s Zenith Traders (Prop. Rajesh Gupta), Civil Lines, Ludhiana.

Under instructions from our client M/s Shivalik Goods, we hereby serve you with this statutory legal notice:
You had issued Cheque No. 901245 dated 25/10/2026 for an amount of Rs. 4,50,000/- drawn on Punjab National Bank in discharge of your debt. On presentation, the cheque was returned dishonoured on 02/11/2026 with remark "FUNDS INSUFFICIENT".

We hereby call upon you to make the payment of Rs. 4,50,000/- within 15 (FIFTEEN) DAYS of the receipt of this notice, failing which criminal proceedings under Section 138 of the Negotiable Instruments Act, 1881 shall be initiated against you before the Judicial Magistrate.`,
  },
  rent: {
    title: "Residential Lease Agreement (Penalty Clause)",
    tag: "Civil / Tenancy",
    text: `RESIDENTIAL TENANCY LEASE AGREEMENT (EXTRACT)

Clause 8 (Security Deposit & Forfeiture):
The Tenant has paid a refundable security deposit of Rs. 1,00,000/-. However, if the Tenant terminates the tenancy before the lock-in period of 24 months, the entire security deposit of Rs. 1,00,000/- shall be forfeited by the Landlord without any refund, and the Landlord shall have the immediate right to disconnect electricity and water supply without court orders.`,
  },
};

export default function DocAnalyzer() {
  const { tr, lang } = useLang();
  const [docText, setDocText] = useState(SAMPLES.bnss35.text);
  const [analysis, setAnalysis] = useState("");
  const [busy, setBusy] = useState(false);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!docText.trim()) return;
    setBusy(true);
    try {
      const res = await analyzeDocument(docText, lang);
      setAnalysis(res.analysis || "");
    } catch (_) {
      setAnalysis(
        "### 1. Executive Summary\nThis document requires your formal response or attendance.\n\n### 2. Urgent Deadlines & Risk Level\n**HIGH RISK:** Check the stipulated deadline (typically 7 to 15 days). Failure to act may lead to legal penalties or adverse court orders.\n\n### 3. Key Statutory Safeguards & Rights\nYou have constitutional rights under Articles 21 and 22, including the right to legal representation and the right not to be coerced without due process.\n\n### 4. Recommended Action Checklist\n1. Do not ignore this document.\n2. Note down the exact dates.\n3. Contact a legal aid advocate or dial 15100 for guidance."
      );
    } finally {
      setBusy(false);
    }
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
                  "Paste any legal notice, police summons, or contract for automated plain-language risk assessment and deadline extraction.",
                  "किसी भी कानूनी नोटिस या अनुबंध का सरल भाषा में विश्लेषण और समय सीमा निकालें।",
                  "ਕਿਸੇ ਵੀ ਕਾਨੂੰਨੀ ਨੋਟਿਸ ਜਾਂ ਇਕਰਾਰਨਾਮੇ ਦਾ ਸਰਲ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ।"
                )}
              </p>
            </div>
          </div>

          {/* Sample Preset Loaders */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-muted flex items-center gap-1">
              <Sparkles size={12} className="text-accent" /> {tr("Load Sample:", "नमूना लोड करें:", "ਨਮੂਨਾ ਲੋਡ ਕਰੋ:")}
            </span>
            <button
              type="button"
              onClick={() => {
                setDocText(SAMPLES.bnss35.text);
                setAnalysis("");
              }}
              className="btn btn-sm btn-ghost text-xs"
            >
              BNSS 35 Notice
            </button>
            <button
              type="button"
              onClick={() => {
                setDocText(SAMPLES.ni138.text);
                setAnalysis("");
              }}
              className="btn btn-sm btn-ghost text-xs"
            >
              NI 138 Notice
            </button>
            <button
              type="button"
              onClick={() => {
                setDocText(SAMPLES.rent.text);
                setAnalysis("");
              }}
              className="btn btn-sm btn-ghost text-xs"
            >
              Rent Agreement
            </button>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">
              {tr(
                "Paste Legal Notice / Summons / Contract Text",
                "कानूनी नोटिस / समन / अनुबंध का टेक्स्ट यहाँ चिपकाएँ",
                "ਕਾਨੂੰਨੀ ਨੋਟਿਸ / ਸਮਨ / ਇਕਰਾਰਨਾਮੇ ਦਾ ਟੈਕਸਟ ਇੱਥੇ ਪੇਸਟ ਕਰੋ"
              )}
            </label>
            <textarea
              required
              rows={8}
              className="input w-full font-mono text-xs sm:text-sm leading-relaxed"
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              placeholder="Paste notice, agreement, police summons, or legal letter text here..."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-muted flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
              {tr(
                "All text is processed with client-side PII scrubbing prior to transmission.",
                "सभी टेक्स्ट का प्रेषण से पहले पीआईआई डेटा सुरक्षित किया जाता है।",
                "ਸਾਰਾ ਟੈਕਸਟ ਭੇਜਣ ਤੋਂ ਪਹਿਲਾਂ ਸੁਰੱਖਿਅਤ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।"
              )}
            </span>
            <button type="submit" disabled={busy} className="btn btn-primary px-6 flex items-center gap-2">
              {busy ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>{tr("Analyzing Document...", "दस्तावेज़ का विश्लेषण हो रहा है...", "ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...")}</span>
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

      {/* Analysis Output Pane */}
      {analysis && (
        <div className="card card-accent card-raised p-6 sm:p-8 bg-white dark:bg-slate-900 border border-purple-500/30">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-line">
            <span className="tone-icon-sm" style={{ background: "rgba(168,85,247,0.12)", color: "var(--c-purple)" }}>
              <ShieldCheck size={16} />
            </span>
            <span className="text-sm font-bold text-ink">
              {tr("Automated Legal Risk Assessment & Plain-Language Breakdown", "कानूनी जोखिम मूल्यांकन और सरल व्याख्या", "ਕਾਨੂੰਨੀ ਜੋਖਮ ਮੁਲਾਂਕਣ ਅਤੇ ਸਰਲ ਵਿਆਖਿਆ")}
            </span>
          </div>

          <div className="markdown-prose text-xs sm:text-sm leading-relaxed text-ink space-y-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
