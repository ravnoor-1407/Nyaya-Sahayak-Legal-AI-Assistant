import { useState, useMemo } from "react";
import { Scale, Calendar, AlertTriangle, CheckCircle2, FileText, Copy, Printer, Check, Info, Download, ChevronDown, ChevronUp } from "lucide-react";
import { useLang } from "../LangContext";

const OFFENCES = [
  { id: "bns303", name: "Theft (BNS Section 303(2))", maxYears: 3, bns: "Section 303(2) BNS, 2023" },
  { id: "bns318", name: "Cheating & Inducing Delivery (BNS Section 318(4))", maxYears: 7, bns: "Section 318(4) BNS, 2023" },
  { id: "bns115", name: "Voluntarily Causing Hurt (BNS Section 115(2))", maxYears: 1, bns: "Section 115(2) BNS, 2023" },
  { id: "bns329", name: "House-trespass (BNS Section 329(1))", maxYears: 1, bns: "Section 329(1) BNS, 2023" },
  { id: "bns316", name: "Criminal Breach of Trust (BNS Section 316(2))", maxYears: 5, bns: "Section 316(2) BNS, 2023" },
  { id: "it66", name: "Computer Fraud (IT Act Section 66)", maxYears: 3, bns: "Section 66 Information Technology Act, 2000" },
  { id: "custom", name: "Other Offence (Custom Maximum Sentence)", maxYears: 0, bns: "Applicable Act & Section" },
];

export default function BailCalculator() {
  const { tr } = useLang();

  // 8 months default arrest date for realistic calculation
  const defaultArrest = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 8);
    return d.toISOString().split("T")[0];
  }, []);

  // Step 1: Eligibility Calculation State
  const [selectedOffence, setSelectedOffence] = useState("bns303");
  const [customYears, setCustomYears] = useState(3);
  const [isFirstTimer, setIsFirstTimer] = useState(true);
  const [isLifeOrDeath, setIsLifeOrDeath] = useState(false);
  const [arrestDate, setArrestDate] = useState(defaultArrest);

  // Step 2: Application Memo Fields (Clearly Organized)
  const [accusedName, setAccusedName] = useState("Anil Kumar");
  const [parentName, setParentName] = useState("Shri Ramesh Kumar");
  const [jailName, setJailName] = useState("Central Jail Patiala, Punjab");
  const [firDetails, setFirDetails] = useState("FIR No. 104/2026, P.S. Civil Lines, Patiala");
  const [courtName, setCourtName] = useState("Court of Chief Judicial Magistrate, Patiala");

  const [showMemo, setShowMemo] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeOffence = OFFENCES.find((o) => o.id === selectedOffence) || OFFENCES[0];
  const maxSentenceYears = selectedOffence === "custom" ? Number(customYears) || 1 : activeOffence.maxYears;

  // Section 479 BNSS: First-time undertrial = 1/3rd; Repeat = 1/2
  const fraction = isFirstTimer ? 1 / 3 : 1 / 2;
  const fractionLabel = isFirstTimer ? "1/3rd (First-Time Offender Reform)" : "1/2 (Prior Undertrial / Convict)";

  const maxDays = Math.round(maxSentenceYears * 365);
  const thresholdDays = Math.round(maxDays * fraction);

  // Compute days served
  const today = new Date();
  const arrestD = new Date(arrestDate);
  const diffTime = Math.max(0, today - arrestD);
  const daysServed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const progressPercent = Math.min(100, Math.round((daysServed / (thresholdDays || 1)) * 100));
  const isEligible = !isLifeOrDeath && daysServed >= thresholdDays;
  const daysRemaining = Math.max(0, thresholdDays - daysServed);

  // Projected eligibility date
  const eligibilityDate = useMemo(() => {
    const d = new Date(arrestDate);
    d.setDate(d.getDate() + thresholdDays);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }, [arrestDate, thresholdDays]);

  // Clean Word Document Export for Bail Petition
  const handleDownloadWord = () => {
    const text = document.getElementById("bail-memo-text")?.innerText || "";
    if (!text) return;
    const blob = new Blob([text], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bail_Application_Sec479_${accusedName.replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Dedicated Clean Document Printing (Prints ONLY the Bail Application Petition)
  const handlePrintPetition = () => {
    const petitionText = document.getElementById("bail-memo-text")?.innerText || "";
    if (!petitionText) return;

    const printWin = window.open("", "_blank", "width=850,height=1000");
    if (!printWin) {
      window.print();
      return;
    }

    const escaped = petitionText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    printWin.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>Bail Application - Sec 479 BNSS</title>
    <style>
      @page {
        size: A4;
        margin: 25mm 20mm 25mm 20mm;
      }
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        color: #111111;
        background: #ffffff;
        margin: 0;
        padding: 20px 25px;
        line-height: 1.6;
      }
      .court-header {
        text-align: center;
        border-bottom: 2px solid #222222;
        padding-bottom: 12px;
        margin-bottom: 24px;
      }
      .court-title {
        font-size: 13pt;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0 4px 0;
      }
      .court-sub {
        font-size: 9.5pt;
        color: #444444;
        text-transform: uppercase;
      }
      .petition-body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 11.5pt;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 1.65;
        text-align: justify;
      }
      .court-footer {
        margin-top: 40px;
        padding-top: 10px;
        border-top: 1px solid #cccccc;
        font-size: 8.5pt;
        color: #666666;
        display: flex;
        justify-content: space-between;
      }
    </style>
  </head>
  <body>
    <div class="court-header">
      <div class="court-title">Formal Application for Mandatory Statutory Bail</div>
      <div class="court-sub">Under Section 479 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)</div>
    </div>
    <div class="petition-body">${escaped}</div>
    <div class="court-footer">
      <span>Generated via NyayaSahayak Legal AI Assistant</span>
      <span>Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
    </div>
  </body>
</html>`);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 300);
  };

  const handleCopyMemo = () => {
    const text = document.getElementById("bail-memo-text")?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* STEP 1: CALCULATOR CARD */}
      <div className="card card-accent card-raised p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <span className="tone-icon-sm" style={{ background: "rgba(59,130,246,0.12)", color: "var(--c-blue)" }}>
              <Scale size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold font-display text-ink">
                  {tr(
                    "Section 479 BNSS Undertrial Mandatory Bail Calculator",
                    "बीएनएसएस धारा 479 विचाराधीन जमानत कैलकुलेटर",
                    "ਬੀਐਨਐਸਐਸ ਧਾਰਾ 479 ਅੰਡਰਟਰਾਇਲ ਜ਼ਮਾਨਤ ਕੈਲਕੁਲੇਟਰ"
                  )}
                </h2>
                <span className="badge badge-accent text-[10px] uppercase font-bold tracking-wider">
                  2024 Legal Reform
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {tr(
                  "Determine mandatory release entitlement for undertrial prisoners: 1/3rd max sentence for first-timers, 1/2 for others.",
                  "2024 के नए कानून के तहत विचाराधीन कैदियों की अनिवार्य जमानत पात्रता: पहली बार के अपराधियों हेतु 1/3 सजा।",
                  "2024 ਦੇ ਨਵੇਂ ਕਾਨੂੰਨ ਅਧੀਨ ਅੰਡਰਟਰਾਇਲ ਕੈਦੀਆਂ ਦੀ ਲਾਜ਼ਮੀ ਜ਼ਮਾਨਤ ਯੋਗਤਾ ਦੀ ਗਣਨਾ ਕਰੋ।"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {/* Left Column: Offence & Custody Date */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("1. Select Alleged Offence Charged", "1. आरोपित अपराध चुनें", "1. ਦੋਸ਼ੀ ਅਪਰਾਧ ਚੁਣੋ")}
              </label>
              <select
                className="input w-full text-sm font-medium"
                value={selectedOffence}
                onChange={(e) => setSelectedOffence(e.target.value)}
              >
                {OFFENCES.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} {o.maxYears > 0 ? `(Max: ${o.maxYears} Yrs)` : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedOffence === "custom" && (
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">
                  {tr("Maximum Imprisonment Specified by Law (Years)", "कानून द्वारा निर्धारित अधिकतम सजा (वर्ष)", "ਵੱਧ ਤੋਂ ਵੱਧ ਸਜ਼ਾ (ਸਾਲ)")}
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="20"
                  className="input w-full text-sm font-medium"
                  value={customYears}
                  onChange={(e) => setCustomYears(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("2. Date of Remand to Custody (Arrest Date)", "2. न्यायिक हिरासत में भेजे जाने की तिथि", "2. ਹਿਰਾਸਤ ਦੀ ਮਿਤੀ")}
              </label>
              <input
                type="date"
                className="input w-full text-sm font-medium"
                value={arrestDate}
                onChange={(e) => setArrestDate(e.target.value)}
              />
              <span className="text-[11px] text-muted block mt-1">
                {tr(
                  "Count starts from the date of initial remand to judicial custody.",
                  "गणना न्यायिक हिरासत में भेजे जाने की पहली तारीख से शुरू होती है।",
                  "ਗਿਣਤੀ ਨਿਆਂਇਕ ਹਿਰਾਸਤ ਵਿੱਚ ਭੇਜੇ ਜਾਣ ਦੀ ਮਿਤੀ ਤੋਂ ਸ਼ੁਰੂ ਹੁੰਦੀ ਹੈ।"
                )}
              </span>
            </div>
          </div>

          {/* Right Column: Prisoner Profile (First-Time vs Repeat) */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1.5">
                {tr("3. Undertrial Prisoner's Record (Section 479(1) BNSS)", "3. विचाराधीन कैदी का पूर्व रिकॉर्ड", "3. ਅੰਡਰਟਰਾਇਲ ਦਾ ਪਿਛੋਕੜ")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFirstTimer(true)}
                  className={`p-3 text-left rounded-xl border transition-all ${
                    isFirstTimer
                      ? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500"
                      : "border-line bg-surface/40 hover:bg-surface/80"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className={isFirstTimer ? "text-emerald-500" : "text-muted"} />
                    <span className="text-xs font-bold text-ink">
                      {tr("First-Time Undertrial", "प्रथम बार विचाराधीन", "ਪਹਿਲੀ ਵਾਰ ਅੰਡਰਟਰਾਇਲ")}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted block mt-1 leading-snug">
                    {tr("Never previously convicted. Entitled to mandatory release after serving 1/3rd.", "अतीत में कभी सजा नहीं हुई। 1/3 अवधि पर अनिवार्य जमानत।", "ਅਤੀਤ ਵਿੱਚ ਕੋਈ ਸਜ਼ਾ ਨਹੀਂ। 1/3 ਸਮੇਂ 'ਤੇ ਜ਼ਮਾਨਤ।")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFirstTimer(false)}
                  className={`p-3 text-left rounded-xl border transition-all ${
                    !isFirstTimer
                      ? "border-accent bg-accent/10 shadow-sm ring-1 ring-accent"
                      : "border-line bg-surface/40 hover:bg-surface/80"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Scale size={15} className={!isFirstTimer ? "text-accent" : "text-muted"} />
                    <span className="text-xs font-bold text-ink">
                      {tr("Prior Convict / Repeat", "पूर्व दोषी / आदतन", "ਪੁਰਾਣਾ ਦੋਸ਼ੀ / ਦੁਹਰਾਅ")}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted block mt-1 leading-snug">
                    {tr("Previously convicted. Entitled to mandatory release after serving 1/2 period.", "पूर्व में सजायाफ्ता। 1/2 अवधि पर अनिवार्य जमानत।", "ਪਹਿਲਾਂ ਸਜ਼ਾ ਹੋਈ। 1/2 ਸਮੇਂ 'ਤੇ ਜ਼ਮਾਨਤ।")}
                  </span>
                </button>
              </div>
            </div>

            {/* Statutory Exclusion */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3.5">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isLifeOrDeath}
                  onChange={(e) => setIsLifeOrDeath(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-red-400 text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 block">
                    {tr("Does offence carry Death or Life Imprisonment?", "क्या अपराध में मृत्युदंड या आजीवन कारावास शामिल है?", "ਕੀ ਅਪਰਾਧ ਵਿੱਚ ਮੌਤ ਜਾਂ ਉਮਰ ਕੈਦ ਦੀ ਸਜ਼ਾ ਹੈ?")}
                  </span>
                  <span className="text-[11px] text-muted block mt-0.5">
                    {tr(
                      "Statutory Bar: Section 479 does not apply to capital or life-sentence offences.",
                      "वैधानिक रोक: धारा 479 मृत्युदंड या आजीवन कारावास के मामलों पर लागू नहीं होती।",
                      "ਮੌਤ ਜਾਂ ਉਮਰ ਕੈਦ ਵਾਲੇ ਮਾਮਲਿਆਂ ਵਿੱਚ ਇਹ ਧਾਰਾ ਲਾਗੂ ਨਹੀਂ ਹੁੰਦੀ।"
                    )}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Calculation Metrics Dashboard */}
        <div className="mt-6 pt-5 border-t border-line">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-5">
            <div className="p-3.5 rounded-xl bg-surface/60 border border-line">
              <div className="text-[11px] text-muted font-medium">{tr("Custody Undergone", "हिरासत के दिन", "ਹਿਰਾਸਤ ਦੇ ਦਿਨ")}</div>
              <div className="text-2xl font-extrabold text-ink mt-0.5">{daysServed} <span className="text-xs font-normal text-muted">{tr("Days", "दिन", "ਦਿਨ")}</span></div>
            </div>
            <div className="p-3.5 rounded-xl bg-surface/60 border border-line">
              <div className="text-[11px] text-muted font-medium">{tr("Mandatory Threshold", "अनिवार्य सीमा", "ਲਾਜ਼ਮੀ ਸੀਮਾ")}</div>
              <div className="text-2xl font-extrabold text-amber-800 dark:text-amber-300 mt-0.5">{thresholdDays} <span className="text-xs font-normal text-muted">{tr("Days", "दिन", "ਦਿਨ")}</span></div>
            </div>
            <div className="p-3.5 rounded-xl bg-surface/60 border border-line">
              <div className="text-[11px] text-muted font-medium">{tr("Statutory Ratio", "वैधानिक अंश", "ਕਾਨੂੰਨੀ ਅੰਸ਼")}</div>
              <div className="text-sm font-bold text-ink mt-1.5">{isFirstTimer ? "1/3rd (First-Timer)" : "1/2 (Repeat)"}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-surface/60 border border-line">
              <div className="text-[11px] text-muted font-medium">{tr("Statutory Eligibility Date", "पात्रता तिथि", "ਯੋਗਤਾ ਮਿਤੀ")}</div>
              <div className="text-sm font-bold text-ink mt-1.5">{isEligible ? tr("Active Right Now", "अभी सक्रिय है", "ਹੁਣੇ ਸਰਗਰਮ") : eligibilityDate}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-semibold mb-1.5 text-muted">
              <span>{tr("Custody Completed toward Mandatory Bail Threshold", "अनिवार्य जमानत सीमा की ओर पूरी की गई हिरासत", "ਲਾਜ਼ਮੀ ਜ਼ਮਾਨਤ ਸੀਮਾ ਵੱਲ ਪੂਰੀ ਕੀਤੀ ਹਿਰਾਸਤ")}</span>
              <span className="font-bold text-ink">{progressPercent}%</span>
            </div>
            <div className="w-full bg-surface/80 rounded-full h-3 overflow-hidden border border-line">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  isEligible ? "bg-emerald-500" : isLifeOrDeath ? "bg-red-500" : "bg-amber-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Status Verdict Banner */}
          {isLifeOrDeath ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div className="text-xs text-red-900 dark:text-red-200">
                <span className="font-bold block text-sm mb-0.5">
                  {tr("Statutory Exception: Excluded from Section 479 BNSS", "धारा 479 बीएनएसएस के तहत अपात्र", "ਧਾਰਾ 479 ਬੀਐਨਐਸਐਸ ਤਹਿਤ ਅਯੋਗ")}
                </span>
                {tr(
                  "Section 479 BNSS explicitly bars relief for offences punishable by death or imprisonment for life. Bail in such matters must be applied under regular judicial discretion under Section 480 or 483 BNSS.",
                  "बीएनएसएस की धारा 479 मृत्युदंड या आजीवन कारावास वाले अपराधों पर लागू नहीं होती। इन मामलों में नियमित जमानत अदालत के विवेक पर निर्भर करती है।",
                  "ਮੌਤ ਜਾਂ ਉਮਰ ਕੈਦ ਵਾਲੇ ਮਾਮਲਿਆਂ ਵਿੱਚ ਇਹ ਧਾਰਾ ਲਾਗੂ ਨਹੀਂ ਹੁੰਦੀ। ਨਿਯਮਿਤ ਜ਼ਮਾਨਤ ਲਈ ਅਦਾਲਤ ਵਿੱਚ ਅਰਜ਼ੀ ਦੇਣੀ ਹੋਵੇਗੀ।"
                )}
              </div>
            </div>
          ) : isEligible ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={22} />
                <div className="text-xs text-emerald-900 dark:text-emerald-200 max-w-xl">
                  <span className="font-bold block text-sm mb-0.5">
                    {tr(
                      "ELIGIBLE FOR MANDATORY STATUTORY BAIL (SEC 479(1) BNSS)",
                      "धारा 479(1) बीएनएसएस के तहत अनिवार्य जमानत हेतु पात्र",
                      "ਧਾਰਾ 479(1) ਬੀਐਨਐਸਐਸ ਤਹਿਤ ਲਾਜ਼ਮੀ ਜ਼ਮਾਨਤ ਲਈ ਯੋਗ"
                    )}
                  </span>
                  {tr(
                    `The undertrial has completed ${daysServed} days in custody, exceeding the statutory requirement of ${thresholdDays} days. Under Section 479(1) BNSS, the Court or Jail Superintendent is legally obligated to release the prisoner on personal bond with or without sureties.`,
                    `विचाराधीन कैदी ने ${thresholdDays} दिनों की अनिवार्य सीमा से अधिक (${daysServed} दिन) पूरे कर लिए हैं। न्यायालय या जेल अधीक्षक को उन्हें व्यक्तिगत मुचलके पर रिहा करना होगा।`,
                    `ਅੰਡਰਟਰਾਇਲ ਨੇ ${thresholdDays} ਦਿਨਾਂ ਦੀ ਲਾਜ਼ਮੀ ਸੀਮਾ ਤੋਂ ਵੱਧ (${daysServed} ਦਿਨ) ਪੂਰੇ ਕਰ ਲਏ ਹਨ। ਅਦਾਲਤ ਨਿੱਜੀ ਮੁਚਲਕੇ 'ਤੇ ਰਿਹਾਅ ਕਰੇਗੀ।`
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMemo(true)}
                className="btn btn-sm btn-primary flex items-center gap-1.5 text-xs font-bold shadow-sm"
              >
                <FileText size={15} />
                <span>{tr("Generate Formal Bail Petition", "औपचारिक जमानत अर्जी तैयार करें", "ਲਾਜ਼ਮੀ ਜ਼ਮਾਨਤ ਅਰਜ਼ੀ ਬਣਾਓ")}</span>
              </button>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-100 dark:bg-amber-950/70 border-2 border-amber-500 dark:border-amber-600 flex items-start justify-between gap-4 flex-wrap shadow-xs">
              <div className="flex items-start gap-3">
                <Info className="text-amber-800 dark:text-amber-300 shrink-0 mt-0.5" size={22} />
                <div className="text-xs max-w-xl space-y-1">
                  <span className="font-extrabold text-amber-950 dark:text-amber-100 block text-sm tracking-tight">
                    {tr(
                      `Custody in Progress (${daysRemaining} Days Remaining)`,
                      `हिरासत अवधि जारी (${daysRemaining} दिन शेष)`,
                      `ਹਿਰਾਸਤ ਜਾਰੀ (${daysRemaining} ਦਿਨ ਬਾਕੀ)`
                    )}
                  </span>
                  <p className="text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                    {tr(
                      `Mandatory statutory bail entitlement under Section 479 will activate on ${eligibilityDate} upon completing ${thresholdDays} days in custody.`,
                      `${thresholdDays} दिन पूरे होने पर ${eligibilityDate} को धारा 479 के तहत अनिवार्य जमानत का अधिकार सक्रिय होगा।`,
                      `${thresholdDays} ਦਿਨ ਪੂਰੇ ਹੋਣ 'ਤੇ ${eligibilityDate} ਨੂੰ ਲਾਜ਼ਮੀ ਜ਼ਮਾਨਤ ਦਾ ਅਧਿਕਾਰ ਮਿਲੇਗਾ।`
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMemo(true)}
                className="btn btn-sm btn-ghost bg-surface border-2 border-line hover:border-accent text-ink flex items-center gap-1.5 text-xs font-bold shadow-xs"
              >
                <FileText size={15} className="text-accent" />
                <span>{tr("Preview Bail Petition Draft", "अर्जी प्रारूप देखें", "ਅਰਜ਼ੀ ਪ੍ਰਾਰੂਪ ਦੇਖੋ")}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STEP 2: CLEAR FORMAL BAIL PETITION GENERATOR & PREVIEW */}
      {showMemo && (
        <div className="card card-accent card-raised p-6 sm:p-8 bg-white dark:bg-slate-900 border border-accent/40 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div className="flex items-center gap-2">
              <span className="tone-icon-sm" style={{ background: "rgba(59,130,246,0.12)", color: "var(--c-blue)" }}>
                <FileText size={16} />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-ink">
                  {tr("Court Bail Application Generator (Section 479 BNSS)", "अदालत जमानत अर्जी जनरेटर (धारा 479 बीएनएसएस)", "ਅਦਾਲਤ ਜ਼ਮਾਨਤ ਅਰਜ਼ੀ (ਧਾਰਾ 479 ਬੀਐਨਐਸਐਸ)")}
                </h3>
                <p className="text-[11px] text-muted">
                  {tr("Fill in case details below to auto-populate the official court petition.", "अदालत की अर्जी में स्वतः भरने हेतु मामले का विवरण दर्ज करें।", "ਅਦਾਲਤੀ ਅਰਜ਼ੀ ਵਿੱਚ ਵੇਰਵੇ ਦਰਜ ਕਰੋ।")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMemo}
                className="btn btn-sm btn-ghost text-xs flex items-center gap-1"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? tr("Copied!", "कॉपी हो गया!", "ਕਾਪੀ ਹੋ ਗਿਆ!") : tr("Copy", "कॉपी", "ਕਾਪੀ")}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadWord}
                className="btn btn-sm btn-ghost border border-line text-xs flex items-center gap-1"
              >
                <Download size={14} />
                <span>{tr("Word (.doc)", "वर्ड (.doc)", "ਵਰਡ (.doc)")}</span>
              </button>
              <button
                type="button"
                onClick={handlePrintPetition}
                className="btn btn-sm btn-primary text-xs flex items-center gap-1"
              >
                <Printer size={14} />
                <span>{tr("Print / PDF", "प्रिंट / पीडीएफ", "ਪ੍ਰਿੰਟ / ਪੀਡੀਐਫ")}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMemo(false)}
                className="btn btn-sm btn-ghost text-xs text-muted hover:text-ink ml-1"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Simple, Friendly Input Fields for Petition */}
          <div className="p-4 rounded-xl bg-surface/50 border border-line space-y-3">
            <div className="text-xs font-bold text-ink uppercase tracking-wider">
              {tr("Enter Accused & Court Details", "आरोपी व अदालत का विवरण", "ਦੋਸ਼ੀ ਅਤੇ ਅਦਾਲਤ ਦਾ ਵੇਰਵਾ")}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">
                  {tr("Prisoner's Full Name", "कैदी / आरोपी का नाम", "ਕੈਦੀ / ਦੋਸ਼ੀ ਦਾ ਨਾਮ")} *
                </label>
                <input
                  type="text"
                  className="input w-full text-xs font-medium"
                  value={accusedName}
                  onChange={(e) => setAccusedName(e.target.value)}
                  placeholder="e.g. Anil Kumar"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">
                  {tr("Father's / Spouse's Name", "पिता / पति का नाम", "ਪਿਤਾ / ਪਤੀ ਦਾ ਨਾਮ")}
                </label>
                <input
                  type="text"
                  className="input w-full text-xs font-medium"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. S/o Shri Ramesh Kumar"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">
                  {tr("Current Jail / Prison Facility", "वर्तमान जेल का नाम", "ਮੌਜੂਦਾ ਜੇਲ੍ਹ ਦਾ ਨਾਮ")}
                </label>
                <input
                  type="text"
                  className="input w-full text-xs font-medium"
                  value={jailName}
                  onChange={(e) => setJailName(e.target.value)}
                  placeholder="e.g. Central Jail Patiala"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted block mb-1">
                  {tr("FIR No. & Police Station", "एफआईआर संख्या व थाना", "ਐਫ਼ਆਈਆਰ ਨੰਬਰ ਅਤੇ ਥਾਣਾ")}
                </label>
                <input
                  type="text"
                  className="input w-full text-xs font-medium"
                  value={firDetails}
                  onChange={(e) => setFirDetails(e.target.value)}
                  placeholder="e.g. FIR No. 104/2026, P.S. Civil Lines"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-muted block mb-1">
                  {tr("Competent Court / Magistrate Name", "संबद्ध अदालत / मजिस्ट्रेट का नाम", "ਸੰਬੰਧਿਤ ਅਦਾਲਤ / ਮੈਜਿਸਟਰੇਟ ਦਾ ਨਾਮ")}
                </label>
                <input
                  type="text"
                  className="input w-full text-xs font-medium"
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  placeholder="e.g. In the Court of Chief Judicial Magistrate, Patiala"
                />
              </div>
            </div>
          </div>

          {/* Authentic Court Petition Preview */}
          <div
            id="bail-memo-text"
            className="p-6 sm:p-8 border border-gray-300 dark:border-gray-700 bg-amber-500/[0.02] rounded-lg font-mono text-xs sm:text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed selection:bg-amber-500/20"
          >
{`IN THE COURT OF ${courtName.toUpperCase()}
APPLICATION NO. ________ OF 2026

IN THE MATTER OF:
STATE
VERSUS
${accusedName.toUpperCase()} (${parentName.toUpperCase()})
PRESENTLY CONFINED AT: ${jailName.toUpperCase()}
... APPLICANT / ACCUSED

CASE DETAILS:
${firDetails.toUpperCase()}
UNDER SECTION(S): ${activeOffence.bns.toUpperCase()}

APPLICATION UNDER SECTION 479(1) OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (BNSS) FOR RELEASE OF THE APPLICANT ON MANDATORY STATUTORY BAIL ON PERSONAL BOND

MOST RESPECTFULLY SHOWETH:

1. That the Applicant / Accused ${accusedName} was arrested on ${arrestDate} and has undergone continuous detention in judicial custody since then, presently lodged in ${jailName}.

2. That the Applicant is charged with offences under ${activeOffence.bns}, for which the maximum imprisonment prescribed by law is ${maxSentenceYears} years (${maxDays} days).

3. STATUTORY GROUNDS UNDER SECTION 479 BNSS:
   ${isFirstTimer 
     ? `a) That the Applicant is a FIRST-TIME OFFENDER who has never previously been convicted of any offence in the past.
   b) Under the mandatory first proviso of Section 479(1) BNSS (2024 reform), a first-time undertrial SHALL be released on bail upon undergoing detention of ONE-THIRD (1/3rd) of the maximum period of imprisonment.` 
     : `a) That the Applicant has undergone detention for a period exceeding ONE-HALF (1/2) of the maximum period of imprisonment specified for the alleged offence under Section 479(1) BNSS.`}

4. DETENTION COMPUTATION:
   - Prescribed Maximum Sentence: ${maxSentenceYears} Years (${maxDays} Days)
   - Statutory Release Threshold: ${thresholdDays} Days (${isFirstTimer ? "1/3rd fraction" : "1/2 fraction"})
   - Actual Custody Undergone as on ${today.toLocaleDateString("en-IN")}: ${daysServed} Days
   - Eligibility Status: ${daysServed >= thresholdDays ? "STATUTORILY ENTITLED TO IMMEDIATE RELEASE" : `Mandatory entitlement unlocks on ${eligibilityDate}`}

5. STATUTORY BAR INAPPLICABLE:
   That the offence alleged does not carry punishment of death or imprisonment for life as one of the specified punishments, and therefore the statutory exception does not apply to the Applicant.

6. MANDATORY STATUTORY DUTY:
   That under Section 479(3) BNSS, the Legislature has cast a mandatory statutory duty upon the Jail Superintendent and the Court to facilitate release of such undertrial prisoners on personal bond without surety.

PRAYER:
It is therefore most respectfully prayed that this Hon'ble Court may be pleased to:
a) Direct the immediate release of the Applicant / Accused ${accusedName} on statutory bail under Section 479(1) BNSS on furnishing a personal bond with or without sureties;
b) Pass any other order deemed just and proper in the interest of justice.

PLACE: _____________________
DATE: ${today.toLocaleDateString("en-IN")}

APPLICANT / ADVOCATE FOR APPLICANT`}
          </div>
        </div>
      )}
    </div>
  );
}
