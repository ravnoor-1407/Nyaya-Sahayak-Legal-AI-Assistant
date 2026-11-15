import { useState, useMemo } from "react";
import { Scale, Calendar, AlertTriangle, CheckCircle2, FileText, Copy, Printer, Check, Info, Download, Sparkles, RotateCcw } from "lucide-react";
import { useLang } from "../LangContext";
import { printLegalDocument, downloadWordDocument } from "../utils/legalExport";

const OFFENCES = [
  { id: "bns303", name: "Theft (BNS Section 303(2))", maxYears: 3, bns: "Section 303(2) BNS" },
  { id: "bns318", name: "Cheating & Dishonestly Inducing Delivery (BNS Section 318(4))", maxYears: 7, bns: "Section 318(4) BNS" },
  { id: "bns115", name: "Voluntarily Causing Hurt (BNS Section 115(2))", maxYears: 1, bns: "Section 115(2) BNS" },
  { id: "bns329", name: "House-trespass (BNS Section 329(1))", maxYears: 1, bns: "Section 329(1) BNS" },
  { id: "bns316", name: "Criminal Breach of Trust (BNS Section 316(2))", maxYears: 5, bns: "Section 316(2) BNS" },
  { id: "it66", name: "Computer Related Offences (IT Act Section 66)", maxYears: 3, bns: "Section 66 IT Act" },
  { id: "custom", name: "Other Offence (Custom Maximum Sentence)", maxYears: 0, bns: "Applicable Penal Section" },
];

export default function BailCalculator() {
  const { tr } = useLang();

  // All fields start BLANK with helpful placeholders
  const [selectedOffence, setSelectedOffence] = useState("bns303");
  const [customYears, setCustomYears] = useState(3);
  const [isFirstTimer, setIsFirstTimer] = useState(true);
  const [isLifeOrDeath, setIsLifeOrDeath] = useState(false);
  const [arrestDate, setArrestDate] = useState("");
  const [accusedName, setAccusedName] = useState("");
  const [courtName, setCourtName] = useState("");
  const [firNumber, setFirNumber] = useState("");
  const [policeStation, setPoliceStation] = useState("");
  const [showMemo, setShowMemo] = useState(false);
  const [copied, setCopied] = useState(false);

  // Quick sample loader for demonstration purposes
  const loadDemoSample = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 14); // 14 months ago
    setSelectedOffence("bns303");
    setIsFirstTimer(true);
    setIsLifeOrDeath(false);
    setArrestDate(d.toISOString().split("T")[0]);
    setAccusedName("Rajesh Kumar");
    setCourtName("Court of Chief Judicial Magistrate, Patiala");
    setFirNumber("FIR No. 182/2025");
    setPoliceStation("Police Station Civil Lines, Patiala");
    setShowMemo(true);
  };

  const handleReset = () => {
    setSelectedOffence("bns303");
    setIsFirstTimer(true);
    setIsLifeOrDeath(false);
    setArrestDate("");
    setAccusedName("");
    setCourtName("");
    setFirNumber("");
    setPoliceStation("");
    setShowMemo(false);
  };

  const activeOffence = OFFENCES.find((o) => o.id === selectedOffence) || OFFENCES[0];
  const maxSentenceYears = selectedOffence === "custom" ? Number(customYears) || 1 : activeOffence.maxYears;

  // Section 479 BNSS: First-time undertrials = 1/3rd; Others = 1/2
  const fraction = isFirstTimer ? 1 / 3 : 1 / 2;
  const fractionLabel = isFirstTimer ? "1/3rd (First-Time Offender)" : "1/2 (Prior Undertrial)";

  const maxDays = maxSentenceYears * 365;
  const thresholdDays = Math.round(maxDays * fraction);

  // Compute days served from arrest date
  const hasDate = Boolean(arrestDate);
  const today = new Date();
  const arrestD = hasDate ? new Date(arrestDate) : today;
  const diffTime = Math.max(0, today - arrestD);
  const daysServed = hasDate ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0;

  const progressPercent = hasDate ? Math.min(100, Math.round((daysServed / thresholdDays) * 100)) : 0;
  const isEligible = hasDate && !isLifeOrDeath && daysServed >= thresholdDays;
  const daysRemaining = Math.max(0, thresholdDays - daysServed);

  // Calculate projected date of eligibility
  const eligibilityDate = useMemo(() => {
    if (!hasDate) return "—";
    const d = new Date(arrestDate);
    d.setDate(d.getDate() + thresholdDays);
    return d.toLocaleDateString("en-IN");
  }, [arrestDate, thresholdDays, hasDate]);

  const applicantDisplayName = accusedName.trim() || "[Undertrial Prisoner Name]";
  const courtDisplayName = courtName.trim() || "[Name of Jurisdictional Court]";
  const firDisplayName = firNumber.trim() || "[FIR Number / Year]";
  const psDisplayName = policeStation.trim() || "[Concerned Police Station]";

  const memoContent = `IN THE COURT OF ${courtDisplayName.toUpperCase()}
APPLICATION NO. ______ OF ${new Date().getFullYear()}

IN THE MATTER OF:
STATE
VERSUS
${applicantDisplayName.toUpperCase()} ... APPLICANT / ACCUSED

FIR NO.: ${firDisplayName}
POLICE STATION: ${psDisplayName}
UNDER SECTION(S): ${activeOffence.bns}

APPLICATION UNDER SECTION 479(1) OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (BNSS) FOR STATUTORY RELEASE OF THE APPLICANT ON BAIL ON PERSONAL BOND WITHOUT SURETIES

MOST RESPECTFULLY SHOWETH:

1. That the Applicant / Accused ${applicantDisplayName} was arrested and remanded into judicial custody on ${arrestDate || "[Date of Arrest]"} in connection with ${firDisplayName} registered at ${psDisplayName}.

2. That the maximum sentence prescribed by law for the alleged offence under ${activeOffence.bns} is ${maxSentenceYears} years (i.e. ${maxDays} days).

3. That the Applicant has undergone continuous detention in judicial custody for ${daysServed} days as of today (${new Date().toLocaleDateString("en-IN")}).

4. STATUTORY ENTITLEMENT UNDER SECTION 479(1) BNSS:
   ${
     isFirstTimer
       ? "That the Applicant is a FIRST-TIME OFFENDER who has never previously been convicted of any offence. Under the first proviso to Section 479(1) BNSS, a first-time undertrial is statutorily entitled to mandatory release on bail upon undergoing detention for ONE-THIRD (1/3rd) of the maximum period of imprisonment specified for that offence."
       : "That the Applicant has undergone continuous detention exceeding ONE-HALF (1/2) of the maximum period of imprisonment specified for the alleged offence."
   }

5. That the statutory threshold required under Section 479 BNSS is ${thresholdDays} days. The Applicant has completed ${daysServed} days in custody, thereby fully satisfying the statutory condition.

6. That the alleged offence does not carry the punishment of death or imprisonment for life, and therefore the statutory exclusion under Section 479 does not apply.

7. That under Section 479(3) BNSS, a mandatory statutory duty is cast upon the Court / Jail Superintendent to facilitate the release of such undertrial prisoners.

PRAYER:
In view of the above statutory mandate, it is most respectfully prayed that this Hon'ble Court may be pleased to:
a) Order the immediate release of the Applicant ${applicantDisplayName} on personal bond with or without sureties under Section 479(1) of the Bharatiya Nagarik Suraksha Sanhita, 2023;
b) Pass any other order deemed just and equitable in the interest of justice.

PLACE: _____________________
DATED: ${new Date().toLocaleDateString("en-IN")}

APPLICANT / ADVOCATE FOR APPLICANT`;

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(memoContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintMemo = () => {
    printLegalDocument("SECTION 479 BNSS BAIL APPLICATION", memoContent);
  };

  const handleDownloadDoc = () => {
    downloadWordDocument("Section_479_BNSS_Bail_Application", "BAIL APPLICATION UNDER SECTION 479 BNSS", memoContent);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="card card-accent card-raised p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center gap-2.5">
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
                  "Calculate mandatory statutory release under India's 2024 reform (1/3rd custody for first-time undertrials).",
                  "2024 के नए कानून के तहत विचाराधीन कैदियों की 1/3 अवधि पर अनिवार्य जमानत की गणना करें।",
                  "2024 ਦੇ ਨਵੇਂ ਕਾਨੂੰਨ ਅਧੀਨ ਅੰਡਰਟਰਾਇਲਾਂ ਦੀ ਲਾਜ਼ਮੀ ਜ਼ਮਾਨਤ ਯੋਗਤਾ ਦੀ ਗਣਨਾ ਕਰੋ।"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadDemoSample}
              className="btn btn-sm btn-ghost text-xs flex items-center gap-1 border border-line"
              title="Load realistic example for demo"
            >
              <Sparkles size={13} className="text-accent" />
              <span>Load Sample</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-sm btn-ghost text-xs flex items-center gap-1 border border-line text-muted"
              title="Reset all fields"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Section 1: Offence & Custody Details */}
        <div className="mt-5">
          <div className="text-xs font-bold text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-accent/20 text-accent-ink inline-flex items-center justify-center font-bold text-[11px]">
              1
            </span>
            <span>{tr("Offence & Custody Period", "अपराध और हिरासत अवधि", "ਅਪਰਾਧ ਅਤੇ ਹਿਰਾਸਤ")}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("Alleged Offence Charged", "आरोपित अपराध", "ਦੋਸ਼ੀ ਅਪਰਾਧ")}
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

            {selectedOffence === "custom" ? (
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">
                  {tr("Max Sentence Prescribed (Years)", "अधिकतम निर्धारित सजा (वर्ष)", "ਵੱਧ ਤੋਂ ਵੱਧ ਸਜ਼ਾ (ਸਾਲ)")}
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="20"
                  className="input w-full text-sm"
                  value={customYears}
                  onChange={(e) => setCustomYears(e.target.value)}
                  placeholder="e.g. 3"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">
                  {tr("Date of Remand / Arrest to Judicial Custody", "गिरफ्तारी / न्यायिक हिरासत की तिथि", "ਹਿਰਾਸਤ ਦੀ ਮਿਤੀ")}
                </label>
                <input
                  type="date"
                  className="input w-full text-sm"
                  value={arrestDate}
                  onChange={(e) => setArrestDate(e.target.value)}
                />
              </div>
            )}
          </div>

          {selectedOffence === "custom" && (
            <div className="mt-4">
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("Date of Remand / Arrest to Judicial Custody", "गिरफ्तारी / न्यायिक हिरासत की तिथि", "ਹਿਰਾਸਤ ਦੀ ਮਿਤੀ")}
              </label>
              <input
                type="date"
                className="input w-full text-sm"
                value={arrestDate}
                onChange={(e) => setArrestDate(e.target.value)}
              />
            </div>
          )}

          {/* Statutory Status Checkboxes */}
          <div className="mt-4 p-4 rounded-xl border border-line bg-surface/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFirstTimer}
                onChange={(e) => setIsFirstTimer(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
              />
              <div>
                <span className="text-xs font-bold text-ink block">
                  {tr("First-Time Offender (Never convicted in the past)", "प्रथम बार अपराधी (अतीत में कभी सजा नहीं हुई)", "ਪਹਿਲੀ ਵਾਰ ਦੋਸ਼ੀ")}
                </span>
                <span className="text-[11px] text-muted block mt-0.5">
                  {tr("2024 BNSS Reform: Entitled to mandatory bail upon serving 1/3rd of sentence.", "2024 का नया सुधार: सजा का 1/3 भाग पूरा करने पर अनिवार्य जमानत।", "ਸਜ਼ਾ ਦਾ 1/3 ਸਮਾਂ ਪੂਰਾ ਹੋਣ 'ਤੇ ਜ਼ਮਾਨਤ।")}
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isLifeOrDeath}
                onChange={(e) => setIsLifeOrDeath(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-red-400 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="text-xs font-bold text-red-600 dark:text-red-400 block">
                  {tr("Offence carries Death or Life Imprisonment", "अपराध में मृत्युदंड या आजीवन कारावास शामिल है", "ਮੌਤ ਜਾਂ ਉਮਰ ਕੈਦ ਵਾਲਾ ਅਪਰਾਧ")}
                </span>
                <span className="text-[11px] text-muted block mt-0.5">
                  {tr("Statutory Exclusion: Section 479 does not apply to life/death offences.", "वैधानिक रोक: धारा 479 मृत्यु/आजीवन मामलों में लागू नहीं होती।", "ਮੌਤ ਜਾਂ ਉਮਰ ਕੈਦ 'ਤੇ ਲਾਗੂ ਨਹੀਂ।")}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 2: Live Statutory Eligibility Calculator */}
        <div className="mt-6 pt-5 border-t border-line">
          <div className="text-xs font-bold text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-accent/20 text-accent-ink inline-flex items-center justify-center font-bold text-[11px]">
              2
            </span>
            <span>{tr("Statutory Threshold & Live Calculation", "वैधानिक सीमा और लाइव गणना", "ਕਾਨੂੰਨੀ ਸੀਮਾ ਅਤੇ ਗਣਨਾ")}</span>
          </div>

          {!hasDate ? (
            <div className="p-4 rounded-xl bg-surface/80 border border-line text-center text-xs text-muted">
              📅 {tr("Please select the Date of Arrest above to calculate days in custody and bail eligibility.", "हिरासत के दिन और जमानत पात्रता की गणना के लिए कृपया ऊपर गिरफ्तारी की तारीख चुनें।", "ਹਿਰਾਸਤ ਦੇ ਦਿਨਾਂ ਦੀ ਗਣਨਾ ਲਈ ਉੱਪਰ ਮਿਤੀ ਚੁਣੋ।")}
            </div>
          ) : (
            <>
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
                  <div className="text-xs font-bold text-ink mt-1.5">{fractionLabel}</div>
                </div>
                <div className="p-3 rounded-xl bg-surface/60 border border-line">
                  <div className="text-xs text-muted font-medium">{tr("Eligibility Date", "पात्रता तिथि", "ਯੋਗਤਾ ਮਿਤੀ")}</div>
                  <div className="text-xs font-bold text-ink mt-1.5">{eligibilityDate}</div>
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

              {/* Status Verdict Alert */}
              {isLifeOrDeath ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                  <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <div className="text-xs text-red-900 dark:text-red-200">
                    <span className="font-bold block text-sm mb-0.5">
                      {tr("Statutory Bar: Relief Inapplicable under Section 479", "धारा 479 के तहत राहत लागू नहीं", "ਧਾਰਾ 479 ਤਹਿਤ ਰਾਹਤ ਲਾਗੂ ਨਹੀਂ")}
                    </span>
                    {tr(
                      "Section 479 BNSS explicitly bars relief for offences punishable by death or life imprisonment.",
                      "बीएनएसएस की धारा 479 उन अपराधों में लागू नहीं होती जिनमें मृत्युदंड या आजीवन कारावास का प्रावधान है।",
                      "ਮੌਤ ਜਾਂ ਉਮਰ ਕੈਦ ਵਾਲੇ ਮਾਮਲਿਆਂ ਵਿੱਚ ਧਾਰਾ 479 ਲਾਗੂ ਨਹੀਂ ਹੁੰਦੀ।"
                    )}
                  </div>
                </div>
              ) : isEligible ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                    <div className="text-xs text-emerald-900 dark:text-emerald-200">
                      <span className="font-bold block text-sm mb-0.5">
                        {tr("MANDATORY BAIL ACTIVATED (SECTION 479(1) BNSS)", "धारा 479(1) बीएनएसएस के तहत अनिवार्य जमानत सक्रिय", "ਧਾਰਾ 479(1) ਬੀਐਨਐਸਐਸ ਤਹਿਤ ਲਾਜ਼ਮੀ ਜ਼ਮਾਨਤ")}
                      </span>
                      {tr(
                        `The undertrial has completed ${daysServed} days in custody, crossing the statutory threshold of ${thresholdDays} days. The Court shall release them on personal bond.`,
                        `कैदी ने ${thresholdDays} दिनों की अनिवार्य सीमा से अधिक (${daysServed} दिन) पूरे कर लिए हैं। न्यायालय को उन्हें व्यक्तिगत मुचलके पर रिहा करना होगा।`,
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
                    <span>{tr("Prepare Bail Application", "जमानत अर्जी तैयार करें", "ਜ਼ਮਾਨਤ ਅਰਜ਼ੀ ਤਿਆਰ ਕਰੋ")}</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <Info className="text-accent shrink-0 mt-0.5" size={18} />
                    <div className="text-xs text-amber-900 dark:text-amber-200">
                      <span className="font-bold block text-sm mb-0.5">
                        {tr(
                          `In Custody: ${daysRemaining} Days Remaining for Mandatory Release`,
                          `हिरासत जारी: अनिवार्य रिहाई हेतु ${daysRemaining} दिन शेष`,
                          `ਹਿਰਾਸਤ ਜਾਰੀ: ਲਾਜ਼ਮੀ ਰਿਹਾਈ ਲਈ ${daysRemaining} ਦਿਨ ਬਾਕੀ`
                        )}
                      </span>
                      {tr(
                        `Mandatory statutory bail entitlement will activate on ${eligibilityDate} upon completing ${thresholdDays} days in custody.`,
                        `${thresholdDays} दिन पूरे होने पर ${eligibilityDate} को धारा 479 के तहत अनिवार्य जमानत सक्रिय होगी।`,
                        `${thresholdDays} ਦਿਨ ਪੂਰੇ ਹੋਣ 'ਤੇ ${eligibilityDate} ਨੂੰ ਲਾਜ਼ਮੀ ਜ਼ਮਾਨਤ ਮਿਲੇਗੀ।`
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMemo(true)}
                    className="btn btn-sm btn-ghost flex items-center gap-1.5 text-xs font-semibold border border-line"
                  >
                    <FileText size={14} />
                    <span>{tr("Draft Application Advance", "अग्रिम अर्जी देखें", "ਅਰਜ਼ੀ ਦੇਖੋ")}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Section 3: Refined, Crystal-Clear Bail Application Memo */}
      {showMemo && (
        <div className="card card-accent card-raised p-6 sm:p-8 bg-white dark:bg-slate-900 border border-accent/40">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-line flex-wrap gap-2">
            <div>
              <div className="text-sm font-bold text-ink flex items-center gap-2">
                <FileText size={16} className="text-accent" />
                <span>{tr("Section 479 BNSS Bail Application (Court Ready)", "धारा 479 बीएनएसएस न्यायालय जमानत अर्जी", "ਕਾਨੂੰਨੀ ਜ਼ਮਾਨਤ ਅਰਜ਼ੀ")}</span>
              </div>
              <p className="text-[11px] text-muted mt-0.5">
                Fill the applicant & court details below to auto-update the formal petition.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMemo}
                className="btn btn-sm btn-ghost text-xs flex items-center gap-1 border border-line"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Petition"}</span>
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
                onClick={handlePrintMemo}
                className="btn btn-sm btn-primary text-xs flex items-center gap-1"
                title="Prints strictly this legal petition on clean paper"
              >
                <Printer size={14} />
                <span>Print / Save PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMemo(false)}
                className="btn btn-sm btn-ghost text-xs text-muted hover:text-red-500"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Clean, Non-Confusing Filing Details Header */}
          <div className="p-4 rounded-xl bg-surface/50 border border-line mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1">
                {tr("Undertrial Prisoner's Name", "कैदी / आरोपी का नाम", "ਦੋਸ਼ੀ ਦਾ ਨਾਮ")}
              </label>
              <input
                type="text"
                className="input w-full text-xs"
                value={accusedName}
                onChange={(e) => setAccusedName(e.target.value)}
                placeholder="e.g. Anil Kumar"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1">
                {tr("Court Name & City", "अदालत का नाम व शहर", "ਅਦਾਲਤ ਦਾ ਨਾਮ")}
              </label>
              <input
                type="text"
                className="input w-full text-xs"
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                placeholder="e.g. Court of CJM, Patiala"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1">
                {tr("FIR Number", "प्राथमिकी (एफआईआर) संख्या", "ਐਫਆਈਆਰ ਨੰਬਰ")}
              </label>
              <input
                type="text"
                className="input w-full text-xs"
                value={firNumber}
                onChange={(e) => setFirNumber(e.target.value)}
                placeholder="e.g. FIR No. 124/2026"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1">
                {tr("Police Station", "संबद्ध थाना", "ਪੁਲਿਸ ਸਟੇਸ਼ਨ")}
              </label>
              <input
                type="text"
                className="input w-full text-xs"
                value={policeStation}
                onChange={(e) => setPoliceStation(e.target.value)}
                placeholder="e.g. PS Civil Lines, Patiala"
              />
            </div>
          </div>

          {/* Printable Court Application Body */}
          <div
            id="bail-memo-text"
            className="printable-legal-doc p-6 sm:p-8 border border-gray-300 dark:border-gray-700 bg-amber-500/[0.02] rounded-xl font-serif text-xs sm:text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed shadow-inner"
          >
            {memoContent}
          </div>

          <p className="text-[11px] text-muted text-center mt-3">
            💡 Clicking <strong>Print / Save PDF</strong> prints strictly the formal court application on an official A4 page without website headers or buttons.
          </p>
        </div>
      )}
    </div>
  );
}
