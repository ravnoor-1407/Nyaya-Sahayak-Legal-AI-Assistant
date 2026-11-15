import { useState } from "react";
import { GitFork, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Shield, Scale, HelpCircle } from "lucide-react";
import { useLang } from "../LangContext";

const TREES = [
  {
    id: "arrest",
    title: ["Arrest Safeguards Navigator", "गिरफ्तारी सुरक्षा मार्गदर्शिका", "ਗ੍ਰਿਫ਼ਤਾਰੀ ਸੁਰੱਖਿਆ ਮਾਰਗਦਰਸ਼ਕ"],
    statute: "BNSS Sections 35, 47, 58 & Constitution Article 22",
    startNode: "q1",
    nodes: {
      q1: {
        text: "Is the alleged offence Cognizable (serious offence like theft, cheating, assault) or Non-Cognizable (defamation, simple nuisance)?",
        options: [
          { label: "Non-Cognizable Offence", next: "non_cog" },
          { label: "Cognizable Offence", next: "q2" },
        ],
      },
      non_cog: {
        isResult: true,
        type: "success",
        title: "ARREST WITHOUT WARRANT IS STRICTLY PROHIBITED",
        statute: "Section 174 & Section 35 BNSS",
        guidance: "For non-cognizable offences, a police officer has ZERO legal authority to arrest you without an arrest warrant duly signed and sealed by a Judicial Magistrate. If police threaten arrest, politely ask for the warrant.",
      },
      q2: {
        text: "What is the maximum statutory imprisonment prescribed for the alleged offence?",
        options: [
          { label: "7 Years or Less (e.g. Simple theft, cheating, hurt)", next: "less_7" },
          { label: "More than 7 Years or Life/Death", next: "more_7" },
        ],
      },
      less_7: {
        isResult: true,
        type: "warning",
        title: "MANDATORY NOTICE OF APPEARANCE (SECTION 35(3) BNSS)",
        statute: "Section 35(3) BNSS (formerly Sec 41A CrPC) & Arnesh Kumar Guidelines",
        guidance: "The police CANNOT arrest you routinely. The investigating officer is statutorily mandated to serve a Notice of Appearance. As long as you comply with the notice and cooperate in investigation, you cannot be arrested without prior written reasons recorded and approved by the Magistrate.",
      },
      more_7: {
        isResult: true,
        type: "danger",
        title: "ARREST PERMITTED UNDER SECTION 35(1) BNSS — PROCEDURAL SAFEGUARDS APPLY",
        statute: "Sections 47, 48, 58 BNSS & Article 22(2)",
        guidance: "For offences punishable by more than 7 years, police can arrest without warrant if reasonable grounds exist. However, mandatory safeguards apply: 1) Officer must show badge and prepare arrest memo signed by a witness (Sec 47); 2) Right to inform a nominated family member immediately (Sec 48); 3) Mandatory production before a Magistrate within 24 hours (Sec 58).",
      },
    },
  },
  {
    id: "bail",
    title: ["Bailable vs Non-Bailable Navigator", "जमानती बनाम गैर-जमानती अपराध", "ਜ਼ਮਾਨਤੀ ਬਨਾਮ ਗੈਰ-ਜ਼ਮਾਨਤੀ ਅਪਰਾਧ"],
    statute: "First Schedule & Section 478 / 480 BNSS",
    startNode: "q1",
    nodes: {
      q1: {
        text: "Is the offence categorized as Bailable in the First Schedule of the Bharatiya Nagarik Suraksha Sanhita, 2023?",
        options: [
          { label: "Yes, it is a Bailable Offence", next: "bailable" },
          { label: "No, it is Non-Bailable (or Unsure)", next: "non_bailable" },
        ],
      },
      bailable: {
        isResult: true,
        type: "success",
        title: "BAIL IS AN ABSOLUTE STATUTORY RIGHT (SECTION 478 BNSS)",
        statute: "Section 478 Bharatiya Nagarik Suraksha Sanhita, 2023",
        guidance: "You have an absolute statutory right to be released on bail right at the police station or before the Magistrate upon furnishing personal bond. Police officers have no discretion to refuse bail for a bailable offence.",
      },
      non_bailable: {
        isResult: true,
        type: "warning",
        title: "BAIL REQUIRES JUDICIAL DISCRETION (SECTION 480 BNSS)",
        statute: "Section 480 (Magistrate) & Section 483 (Sessions/High Court) BNSS",
        guidance: "'Non-bailable' does NOT mean bail cannot be granted; it simply means bail cannot be claimed as a matter of right at the police station. A formal Bail Application must be filed before the Judicial Magistrate or Sessions Judge.",
      },
    },
  },
  {
    id: "consumer",
    title: ["Consumer Forum Jurisdiction", "उपभोक्ता अदालत क्षेत्राधिकार", "ਖਪਤਕਾਰ ਅਦਾਲਤ ਅਧਿਕਾਰ ਖੇਤਰ"],
    statute: "Consumer Protection Act, 2019 (Sections 34, 47, 58)",
    startNode: "q1",
    nodes: {
      q1: {
        text: "What is the total value of consideration paid plus compensation claimed?",
        options: [
          { label: "Up to ₹50 Lakhs", next: "district" },
          { label: "Above ₹50 Lakhs up to ₹2 Crores", next: "state" },
          { label: "Above ₹2 Crores", next: "national" },
        ],
      },
      district: {
        isResult: true,
        type: "success",
        title: "DISTRICT CONSUMER COMMISSION (DCDRC)",
        statute: "Section 34 Consumer Protection Act, 2019",
        guidance: "File your complaint before the District Consumer Disputes Redressal Commission having territorial jurisdiction over your residence or where the opposite party operates. Online filing available via e-Daakhil (edaakhil.nic.in).",
      },
      state: {
        isResult: true,
        type: "warning",
        title: "STATE CONSUMER COMMISSION (SCDRC)",
        statute: "Section 47 Consumer Protection Act, 2019",
        guidance: "Complaints where consideration exceeds ₹50 Lakhs but is below ₹2 Crores lie directly before the State Consumer Commission located at the State capital.",
      },
      national: {
        isResult: true,
        type: "danger",
        title: "NATIONAL COMMISSION (NCDRC, NEW DELHI)",
        statute: "Section 58 Consumer Protection Act, 2019",
        guidance: "Original jurisdiction lies with the National Consumer Disputes Redressal Commission in New Delhi for high-value claims exceeding ₹2 Crores.",
      },
    },
  },
  {
    id: "cyber",
    title: ["Cyber Crime Reporting Protocol", "साइबर अपराध रिपोर्टिंग प्रोटोकॉल", "ਸਾਈਬਰ ਅਪਰਾਧ ਰਿਪੋਰਟਿੰਗ"],
    statute: "Information Technology Act, 2000 & MHA 1930 Helpline",
    startNode: "q1",
    nodes: {
      q1: {
        text: "What type of cyber crime occurred?",
        options: [
          { label: "Financial Fraud (UPI, Credit Card, Bank Phishing)", next: "fin" },
          { label: "Social Media Impersonation / Harassment / Extortion", next: "harass" },
        ],
      },
      fin: {
        isResult: true,
        type: "danger",
        title: "CRITICAL: GOLDEN HOUR REPORTING VIA 1930",
        statute: "Indian Cyber Crime Coordination Centre (I4C) & IT Act Sec 66D",
        guidance: "Immediately dial 1930 (National Cyber Financial Helpline) within 2 to 4 hours. The police coordination system directly alerts banks to freeze beneficiary accounts before the fraudsters can withdraw the funds. Also register complaint at cybercrime.gov.in.",
      },
      harass: {
        isResult: true,
        type: "warning",
        title: "MANDATORY 24-HOUR TAKEDOWN (IT RULES 2021)",
        statute: "IT Act Section 66E/67 & Rule 3(2)(b) IT Rules, 2021",
        guidance: "Preserve screenshots, URLs, and chat logs. Intermediaries (Instagram, WhatsApp, X) are statutorily required to remove non-consensual intimate imagery within 24 hours of receiving a complaint. File at cybercrime.gov.in or nearest Women Cyber Police Station.",
      },
    },
  },
];

export default function DecisionTrees() {
  const { tr } = useLang();
  const [activeTreeId, setActiveTreeId] = useState("arrest");
  const [currentNodeId, setCurrentNodeId] = useState("q1");
  const [history, setHistory] = useState([]);

  const activeTree = TREES.find((t) => t.id === activeTreeId) || TREES[0];
  const currentNode = activeTree.nodes[currentNodeId] || activeTree.nodes[activeTree.startNode];

  const handleSelect = (nextId) => {
    setHistory((prev) => [...prev, currentNodeId]);
    setCurrentNodeId(nextId);
  };

  const handleReset = () => {
    setCurrentNodeId(activeTree.startNode);
    setHistory([]);
  };

  return (
    <div className="space-y-6">
      <div className="card card-accent card-raised p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-line">
          <span className="tone-icon-sm" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
            <GitFork size={18} />
          </span>
          <div>
            <h2 className="text-xl font-bold font-display text-ink">
              {tr(
                "Interactive Procedural Decision Trees",
                "इंटरैक्टिव प्रक्रियात्मक निर्णय वृक्ष",
                "ਇੰਟਰਐਕਟਿਵ ਪ੍ਰਕਿਰਿਆਤਮਕ ਫੈਸਲਾ ਰੁੱਖ"
              )}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {tr(
                "Navigate your exact legal situation step-by-step through interactive statutory condition trees.",
                "अपने कानूनी परिदृश्य को चरण-दर-चरण नेविगेट करें और सटीक अधिकार जानें।",
                "ਆਪਣੀ ਕਾਨੂੰਨੀ ਸਥਿਤੀ ਨੂੰ ਕਦਮ-ਦਰ-ਕਦਮ ਸਮਝੋ।"
              )}
            </p>
          </div>
        </div>

        {/* Tree Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          {TREES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActiveTreeId(t.id);
                setCurrentNodeId(t.startNode);
                setHistory([]);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeTreeId === t.id
                  ? "border-accent bg-accent/10 shadow-sm"
                  : "border-line bg-surface/40 hover:bg-surface/80"
              }`}
            >
              <div className="text-xs font-bold text-ink">{tr(...t.title)}</div>
              <div className="text-[10px] text-muted truncate mt-0.5">{t.statute}</div>
            </button>
          ))}
        </div>

        {/* Interactive Question / Result Card */}
        <div className="mt-6 p-6 rounded-2xl border border-line bg-surface/40">
          <div className="flex items-center justify-between text-xs text-muted font-semibold mb-3">
            <span className="flex items-center gap-1.5">
              <Scale size={14} className="text-accent" />
              <span>{activeTree.statute}</span>
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="hover:text-ink flex items-center gap-1 text-[11px]"
            >
              <RotateCcw size={12} /> {tr("Restart", "पुनः आरंभ", "ਮੁੜ ਸ਼ੁਰੂ")}
            </button>
          </div>

          {!currentNode.isResult ? (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-ink font-display leading-snug">
                {currentNode.text}
              </h3>
              <div className="space-y-2.5 pt-2">
                {currentNode.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(opt.next)}
                    className="w-full text-left p-4 rounded-xl border border-line bg-surface hover:border-accent hover:bg-accent/5 transition-all flex items-center justify-between group shadow-sm"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-ink group-hover:text-accent">
                      {opt.label}
                    </span>
                    <ArrowRight size={16} className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                {currentNode.type === "success" ? (
                  <CheckCircle2 size={24} className="text-emerald-500 shrink-0 mt-0.5" />
                ) : currentNode.type === "danger" ? (
                  <AlertTriangle size={24} className="text-red-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={24} className="text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-ink tracking-wide">
                    {currentNode.title}
                  </h3>
                  <div className="text-xs font-semibold text-accent mt-0.5">
                    {currentNode.statute}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface/80 border border-line text-xs sm:text-sm leading-relaxed text-ink/90">
                {currentNode.guidance}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-sm btn-primary flex items-center gap-1.5 text-xs"
                >
                  <RotateCcw size={13} />
                  <span>{tr("Try Another Scenario", "अन्य परिदृश्य का परीक्षण करें", "ਹੋਰ ਸਥਿਤੀ ਦੇਖੋ")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
