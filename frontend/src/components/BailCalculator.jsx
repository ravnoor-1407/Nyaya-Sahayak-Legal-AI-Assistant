import { useState, useMemo } from "react";
import { Scale, Calendar, AlertTriangle, CheckCircle2, FileText, Copy, Printer, Check, Info } from "lucide-react";
import { useLang } from "../LangContext";

const OFFENCES = [
  { id: "bns303", name: "Theft (BNS Section 303(2))", maxYears: 3, bns: "Section 303(2) BNS" },
  { id: "bns318", name: "Cheating & Dishonestly Inducing Delivery (BNS Section 318(4))", maxYears: 7, bns: "Section 318(4) BNS" },
  { id: "bns115", name: "Voluntarily Causing Hurt (BNS Section 115(2))", maxYears: 1, bns: "Section 115(2) BNS" },
  { id: "bns329", name: "House-trespass (BNS Section 329(1))", maxYears: 1, bns: "Section 329(1) BNS" },
  { id: "bns316", name: "Criminal Breach of Trust (BNS Section 316(2))", maxYears: 5, bns: "Section 316(2) BNS" },
  { id: "it66", name: "Computer Related Offences (IT Act Section 66)", maxYears: 3, bns: "Section 66 IT Act" },
  { id: "custom", name: "Other Offence (Custom Maximum Sentence)", maxYears: 0, bns: "Applicable Act" },
];

export default function BailCalculator() {
  const { tr } = useLang();

  // 6 months ago default arrest date
  const defaultArrest = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 8);
    return d.toISOString().split("T")[0];
  }, []);

  const [selectedOffence, setSelectedOffence] = useState("bns303");
  const [customYears, setCustomYears] = useState(3);
  const [isFirstTimer, setIsFirstTimer] = useState(true);
  const [isLifeOrDeath, setIsLifeOrDeath] = useState(false);
  const [arrestDate, setArrestDate] = useState(defaultArrest);
  const [accusedName, setAccusedName] = useState("Anil Kumar");
  const [courtName, setCourtName] = useState("Chief Judicial Magistrate, District Courts");
  const [showMemo, setShowMemo] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeOffence = OFFENCES.find((o) => o.id === selectedOffence) || OFFENCES[0];
  const maxSentenceYears = selectedOffence === "custom" ? Number(customYears) || 1 : activeOffence.maxYears;

  // Section 479 BNSS: First-time = 1/3rd; Repeat = 1/2
  const fraction = isFirstTimer ? 1 / 3 : 1 / 2;
  const fractionLabel = isFirstTimer ? "1/3rd (First-Time Offender)" : "1/2 (Prior Undertrial)";

  const maxDays = maxSentenceYears * 365;
  const thresholdDays = Math.round(maxDays * fraction);

  // Compute days served
  const today = new Date();
  const arrestD = new Date(arrestDate);
  const diffTime = Math.max(0, today - arrestD);
  const daysServed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const progressPercent = Math.min(100, Math.round((daysServed / thresholdDays) * 100));
  const isEligible = !isLifeOrDeath && daysServed >= thresholdDays;
  const daysRemaining = Math.max(0, thresholdDays - daysServed);

  // Calculate projected eligibility date
  const eligibilityDate = useMemo(() => {
    const d = new Date(arrestDate);
    d.setDate(d.getDate() + thresholdDays);
    return d.toLocaleDateString();
  }, [arrestDate, thresholdDays]);

  const handleCopyMemo = () => {
    const text = document.getElementById("bail-memo-text")?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="card card-accent card-raised p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-line">
          <span className="tone-icon-sm" style={{ background: "rgba(59,130,246,0.12)", color: "var(--c-blue)" }}>
            <Scale size={18} />
          </span>
          <div>
            <h2 className="text-xl font-bold font-display text-ink">
              {tr(
                "Section 479 BNSS Undertrial Mandatory Bail Calculator",
                "बीएनएसएस धारा 479 विचाराधीन जमानत कैलकुलेटर",
                "ਬੀਐਨਐਸਐਸ ਧਾਰਾ 479 ਅੰਡਰਟਰਾਇਲ ਜ਼ਮਾਨਤ ਕੈਲਕੁਲੇਟਰ"
              )}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {tr(
                "Determine mandatory statutory bail eligibility under the 2024 reform (1/3rd period for first-time undertrials).",
                "2024 के नए कानून के तहत विचाराधीन कैदियों की अनिवार्य जमानत पात्रता की गणना करें।",
                "2024 ਦੇ ਨਵੇਂ ਕਾਨੂੰਨ ਅਧੀਨ ਅੰਡਰਟਰਾਇਲਾਂ ਦੀ ਲਾਜ਼ਮੀ ਜ਼ਮਾਨਤ ਯੋਗਤਾ ਦੀ ਗਣਨਾ ਕਰੋ।"
              )}
            </p>
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {/* Left Column: Offence & Sentence */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("Select Offence Charged", "आरोपित अपराध चुनें", "ਦੋਸ਼ੀ ਅਪਰਾਧ ਚੁਣੋ")}
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
                  {tr("Maximum Prescribed Sentence (Years)", "अधिकतम निर्धारित सजा (वर्ष)", "ਵੱਧ ਤੋਂ ਵੱਧ ਸਜ਼ਾ (ਸਾਲ)")}
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="20"
                  className="input w-full text-sm"
                  value={customYears}
                  onChange={(e) => setCustomYears(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("Date of Arrest / Remand to Judicial Custody", "गिरफ्तारी / न्यायिक हिरासत की तिथि", "ਹਿਰਾਸਤ ਦੀ ਮਿਤੀ")}
              </label>
              <input
                type="date"
                className="input w-full text-sm"
                value={arrestDate}
                onChange={(e) => setArrestDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("Accused / Undertrial Person's Name", "आरोपी / विचाराधीन व्यक्ति का नाम", "ਦੋਸ਼ੀ ਦਾ ਨਾਮ")}
              </label>
              <input
                type="text"
                className="input w-full text-sm"
                value={accusedName}
                onChange={(e) => setAccusedName(e.target.value)}
                placeholder="e.g. Anil Kumar"
              />
            </div>
          </div>

          {/* Right Column: First Timer Status & Exclusions */}
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-surface/40 p-4 space-y-3">
              <div className="text-xs font-bold text-ink uppercase tracking-wider">
                {tr("Statutory Criteria under Section 479(1) BNSS", "धारा 479(1) बीएनएसएस के तहत पात्रता मानदंड", "ਧਾਰਾ 479(1) ਬੀਐਨਐਸਐਸ ਤਹਿਤ ਮਾਪਦੰਡ")}
              </div>

              {/* Toggle 1: First Timer */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFirstTimer}
                  onChange={(e) => setIsFirstTimer(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                />
                <div>
                  <span className="text-xs font-bold text-ink block">
                    {tr("First-Time Offender (Never convicted in the past)", "प्रथम बार अपराधी (अतीत में कभी सजा नहीं हुई)", "ਪਹਿਲੀ ਵਾਰ ਦੋਸ਼ੀ (ਅਤੀਤ ਵਿੱਚ ਕੋਈ ਸਜ਼ਾ ਨਹੀਂ)")}
                  </span>
                  <span className="text-[11px] text-muted block mt-0.5">
                    {tr("Entitled to mandatory bail upon serving 1/3rd of max sentence.", "अधिकतम सजा का 1/3 भाग पूरा करने पर अनिवार्य जमानत।", "ਵੱਧ ਤੋਂ ਵੱਧ ਸਜ਼ਾ ਦਾ 1/3 ਸਮਾਂ ਪੂਰਾ ਹੋਣ 'ਤੇ ਜ਼ਮਾਨਤ।")}
                  </span>
                </div>
              </label>

              {/* Toggle 2: Life / Death Exception */}
              <label className="flex items-start gap-3 cursor-pointer select-none pt-2 border-t border-line/60">
                <input
                  type="checkbox"
                  checked={isLifeOrDeath}
                  onChange={(e) => setIsLifeOrDeath(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-red-400 text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 block">
                    {tr("Offence carries Death or Life Imprisonment", "अपराध में मृत्युदंड या आजीवन कारावास शामिल है", "ਅਪਰਾਧ ਵਿੱਚ ਮੌਤ ਜਾਂ ਉਮਰ ਕੈਦ ਦੀ ਸਜ਼ਾ ਹੈ")}
                  </span>
                  <span className="text-[11px] text-muted block mt-0.5">
                    {tr("Statutory bar: Sec 479 does not apply to life/death offences.", "वैधानिक रोक: धारा 479 मृत्यु/आजीवन मामलों में लागू नहीं होती।", "ਮੌਤ ਜਾਂ ਉਮਰ ਕੈਦ ਵਾਲੇ ਮਾਮਲਿਆਂ ਵਿੱਚ ਲਾਗੂ ਨਹੀਂ।")}
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("Jurisdiction Court Name", "संबद्ध अदालत का नाम", "ਅਦਾਲਤ ਦਾ ਨਾਮ")}
              </label>
              <input
                type="text"
                className="input w-full text-sm"
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                placeholder="e.g. Chief Judicial Magistrate, Patiala"
              />
            </div>
          </div>
        </div>

        {/* Calculation Result Banner */}
        <div className="mt-6 pt-5 border-t border-line">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-5">
            <div className="p-3 rounded-xl bg-surface/60 border border-line">
              <div className="text-xs text-muted font-medium">{tr("Days Served", "हिरासत के दिन", "ਹਿਰਾਸਤ ਦੇ ਦਿਨ")}</div>
              <div className="text-xl font-bold text-ink mt-0.5">{daysServed} {tr("Days", "दिन", "ਦਿਨ")}</div>
            </div>
            <div className="p-3 rounded-xl bg-surface/60 border border-line">
              <div className="text-xs text-muted font-medium">{tr("Statutory Threshold", "अनिवार्य सीमा", "ਕਾਨੂੰਨੀ ਸੀਮਾ")}</div>
              <div className="text-xl font-bold text-accent mt-0.5">{thresholdDays} {tr("Days", "दिन", "ਦਿਨ")}</div>
            </div>
            <div className="p-3 rounded-xl bg-surface/60 border border-line">
              <div className="text-xs text-muted font-medium">{tr("Fraction Applied", "लागू अंश", "ਲਾਗੂ ਅੰਸ਼")}</div>
              <div className="text-sm font-bold text-ink mt-1.5">{fractionLabel}</div>
            </div>
            <div className="p-3 rounded-xl bg-surface/60 border border-line">
              <div className="text-xs text-muted font-medium">{tr("Threshold Date", "पात्रता तिथि", "ਯੋਗਤਾ ਮਿਤੀ")}</div>
              <div className="text-sm font-bold text-ink mt-1.5">{eligibilityDate}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-semibold mb-1 text-muted">
              <span>{tr("Custody Served toward Mandatory Bail", "अनिवार्य जमानत की ओर बिताई गई अवधि", "ਲਾਜ਼ਮੀ ਜ਼ਮਾਨਤ ਵੱਲ ਹਿਰਾਸਤ ਦਾ ਸਮਾਂ")}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-surface/80 rounded-full h-2.5 overflow-hidden border border-line">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  isEligible ? "bg-emerald-500" : isLifeOrDeath ? "bg-red-500" : "bg-amber-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Status Verdict */}
          {isLifeOrDeath ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-red-900 dark:text-red-200">
                <span className="font-bold block text-sm mb-0.5">
                  {tr("Statutory Exception: Not Eligible under Section 479", "धारा 479 के तहत अपात्र", "ਧਾਰਾ 479 ਤਹਿਤ ਅਯੋਗ")}
                </span>
                {tr(
                  "Section 479 BNSS explicitly bars relief for offences for which the punishment of death or imprisonment for life has been specified as one of the punishments.",
                  "बीएनएसएस की धारा 479 स्पष्ट रूप से उन अपराधों पर रोक लगाती है जिनमें मृत्युदंड या आजीवन कारावास का प्रावधान है।",
                  "ਬੀਐਨਐਸਐਸ ਦੀ ਧਾਰਾ 479 ਸਪੱਸ਼ਟ ਤੌਰ 'ਤੇ ਉਨ੍ਹਾਂ ਅਪਰਾਧਾਂ 'ਤੇ ਰੋਕ ਲਗਾਉਂਦੀ ਹੈ ਜਿਨ੍ਹਾਂ ਵਿੱਚ ਮੌਤ ਜਾਂ ਉਮਰ ਕੈਦ ਦੀ ਸਜ਼ਾ ਹੈ।"
                )}
              </div>
            </div>
          ) : isEligible ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <div className="text-xs text-emerald-900 dark:text-emerald-200">
                  <span className="font-bold block text-sm mb-0.5">
                    {tr(
                      "ELIGIBLE FOR MANDATORY STATUTORY BAIL UNDER SEC 479 BNSS",
                      "धारा 479 बीएनएसएस के तहत अनिवार्य जमानत हेतु पात्र",
                      "ਧਾਰਾ 479 ਬੀਐਨਐਸਐਸ ਤਹਿਤ ਲਾਜ਼ਮੀ ਜ਼ਮਾਨਤ ਲਈ ਯੋਗ"
                    )}
                  </span>
                  {tr(
                    `The undertrial has completed ${daysServed} days in custody, exceeding the statutory requirement of ${thresholdDays} days. Under Section 479(1) BNSS, the Court shall release them on personal bond with or without sureties.`,
                    `विचाराधीन कैदी ने ${thresholdDays} दिनों की वैधानिक सीमा से अधिक (${daysServed} दिन) पूरे कर लिए हैं। न्यायालय को उन्हें व्यक्तिगत मुचलके पर रिहा करना होगा।`,
                    `ਅੰਡਰਟਰਾਇਲ ਨੇ ${thresholdDays} ਦਿਨਾਂ ਦੀ ਸੀਮਾ ਤੋਂ ਵੱਧ (${daysServed} ਦਿਨ) ਪੂਰੇ ਕਰ ਲਏ ਹਨ। ਅਦਾਲਤ ਨਿੱਜੀ ਮੁਚਲਕੇ 'ਤੇ ਰਿਹਾਅ ਕਰੇਗੀ।`
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMemo(true)}
                className="btn btn-sm btn-primary flex items-center gap-1.5 text-xs font-bold"
              >
                <FileText size={14} />
                <span>{tr("Generate Bail Memo", "जमानत अर्जी बनाएं", "ਜ਼ਮਾਨਤ ਅਰਜ਼ੀ ਬਣਾਓ")}</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3">
                <Info className="text-accent shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold block text-sm mb-0.5">
                    {tr(
                      `Custody in Progress (${daysRemaining} Days Remaining)`,
                      `हिरासत अवधि जारी (${daysRemaining} दिन शेष)`,
                      `ਹਿਰਾਸਤ ਜਾਰੀ (${daysRemaining} ਦਿਨ ਬਾਕੀ)`
                    )}
                  </span>
                  {tr(
                    `Mandatory bail entitlement under Section 479 will activate on ${eligibilityDate} upon completing ${thresholdDays} days.`,
                    `${thresholdDays} दिन पूरे होने पर ${eligibilityDate} को धारा 479 के तहत अनिवार्य जमानत का अधिकार सक्रिय होगा।`,
                    `${thresholdDays} ਦਿਨ ਪੂਰੇ ਹੋਣ 'ਤੇ ${eligibilityDate} ਨੂੰ ਲਾਜ਼ਮੀ ਜ਼ਮਾਨਤ ਦਾ ਅਧਿਕਾਰ ਮਿਲੇਗਾ।`
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMemo(true)}
                className="btn btn-sm btn-ghost flex items-center gap-1.5 text-xs font-semibold border border-line"
              >
                <FileText size={14} />
                <span>{tr("Preview Application", "अर्जी पूर्वावलोकन", "ਅਰਜ਼ੀ ਦੇਖੋ")}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generated Bail Application Memo Modal/Card */}
      {showMemo && (
        <div className="card card-accent card-raised p-6 sm:p-8 bg-white dark:bg-slate-900 border border-accent/40">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
            <span className="text-sm font-bold text-ink flex items-center gap-2">
              <FileText size={16} className="text-accent" />
              {tr("Section 479 BNSS Bail Application Memo", "धारा 479 बीएनएसएस जमानत अर्जी प्रारूप", "ਧਾਰਾ 479 ਬੀਐਨਐਸਐਸ ਜ਼ਮਾਨਤ ਅਰਜ਼ੀ")}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMemo}
                className="btn btn-sm btn-ghost text-xs flex items-center gap-1"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Memo"}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-sm btn-primary text-xs flex items-center gap-1"
              >
                <Printer size={14} />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMemo(false)}
                className="btn btn-sm btn-ghost text-xs"
              >
                ✕ Close
              </button>
            </div>
          </div>

          <div
            id="bail-memo-text"
            className="p-6 border border-gray-300 dark:border-gray-700 bg-amber-500/[0.02] rounded-lg font-mono text-xs sm:text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed"
          >
{`IN THE COURT OF ${courtName.toUpperCase()}
APPLICATION NO. ______ OF 2026

IN THE MATTER OF:
STATE
VERSUS
${accusedName.toUpperCase()} ... ACCUSED / APPLICANT

APPLICATION UNDER SECTION 479 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (BNSS) FOR RELEASE OF THE APPLICANT ON BAIL ON PERSONAL BOND WITHOUT SURETY

MOST RESPECTFULLY SHOWETH:

1. That the Applicant / Accused ${accusedName} was arrested on ${arrestDate} and has been continuously remanded in judicial custody since then.
2. That the Applicant is charged with offences under ${activeOffence.bns}, for which the maximum statutory sentence prescribed by law is ${maxSentenceYears} years (${maxDays} days).
3. That under Section 479(1) of the Bharatiya Nagarik Suraksha Sanhita, 2023:
   ${isFirstTimer ? "- The Applicant is a FIRST-TIME OFFENDER who has never previously been convicted of any offence, and is statutorily entitled to release on bail upon undergoing detention of ONE-THIRD (1/3rd) of the maximum imprisonment." : "- The Applicant has undergone custody exceeding ONE-HALF (1/2) of the maximum period of imprisonment specified for the alleged offence."}
4. That the statutory threshold required under Section 479 BNSS is ${thresholdDays} days. The Applicant has already undergone ${daysServed} days in custody as on today (${today.toLocaleDateString()}).
5. That the offence alleged does not carry punishment of death or imprisonment for life, and thus the statutory bar does not apply.
6. That under Section 479(3) BNSS, a mandatory obligation is cast upon the State / Jail Superintendent to facilitate the release of such undertrial prisoners.

PRAYER:
It is therefore most respectfully prayed that this Hon'ble Court may be pleased to:
a) Direct the release of the Applicant / Accused ${accusedName} on statutory bail on executing a personal bond with or without sureties as this Court deems fit;
b) Pass any other order deemed just and proper in the interest of justice.

PLACE: _____________________
DATE: ${today.toLocaleDateString()}

APPLICANT / ADVOCATE FOR APPLICANT`}
          </div>
        </div>
      )}
    </div>
  );
}
