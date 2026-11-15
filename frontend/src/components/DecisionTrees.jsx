import { useState } from "react";
import { HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Shield, Scale, PhoneCall, ExternalLink, AlertOctagon } from "lucide-react";
import { useLang } from "../LangContext";

const SITUATIONS = [
  {
    id: "police",
    icon: "👮",
    title: ["Police Encounter / Confrontation", "पुलिस कार्रवाई या पूछताछ", "ਪੁਲਿਸ ਪੁੱਛਗਿੱਛ ਜਾਂ ਕਾਰਵਾਈ"],
    subtitle: ["Stopped by police or received a notice to visit the station", "पुलिस ने रोका या थाने आने का नोटिस दिया", "ਪੁਲਿਸ ਨੇ ਰੋਕਿਆ ਜਾਂ ਥਾਣੇ ਆਉਣ ਦਾ ਨੋਟਿਸ ਦਿੱਤਾ"],
    questions: {
      step1: {
        question: "What is your current situation with the police?",
        subtitle: "Select the option that best describes what is happening right now:",
        options: [
          {
            id: "notice",
            icon: "📄",
            title: "Police gave me a written notice to visit the station",
            detail: "The officer handed a formal paper asking me to appear for questioning/investigation.",
            next: "step2_notice",
          },
          {
            id: "threat_arrest",
            icon: "🚨",
            title: "Police are threatening to arrest me right now",
            detail: "Officers want to take me into custody immediately without showing a warrant.",
            next: "step2_arrest",
          },
          {
            id: "stopped_search",
            icon: "🛑",
            title: "Police stopped me on the road or want to search me",
            detail: "Routine check, vehicle search, or questioning on the street.",
            next: "res_search",
          },
        ],
      },
      step2_notice: {
        question: "What is the nature of the allegation or dispute?",
        subtitle: "Understanding the severity of the matter:",
        options: [
          {
            id: "minor",
            icon: "🔹",
            title: "Minor dispute, argument, or complaint (Punishment under 3 to 7 years)",
            detail: "Simple theft, property argument, family dispute, or verbal altercation.",
            next: "res_notice_minor",
          },
          {
            id: "serious",
            icon: "🔻",
            title: "Severe or major crime allegation (Punishment over 7 years)",
            detail: "Major violence, large commercial fraud, or severe bodily harm.",
            next: "res_notice_serious",
          },
        ],
      },
      step2_arrest: {
        question: "Did the police officer follow standard legal arrest safeguards?",
        subtitle: "Check what the officer did at the time of detention:",
        options: [
          {
            id: "no_memo",
            icon: "❌",
            title: "Officer refused to show identity badge or prepare an Arrest Memo",
            detail: "They did not explain the grounds of arrest or allow me to call my family.",
            next: "res_unlawful_arrest",
          },
          {
            id: "over_24h",
            icon: "⏳",
            title: "Person has been in custody for MORE than 24 hours without seeing a Judge",
            detail: "The police have detained them overnight or for multiple days without court production.",
            next: "res_over_24h",
          },
        ],
      },
    },
    results: {
      res_notice_minor: {
        type: "safe",
        badge: "PROTECTED BY LAW",
        title: "YOU CANNOT BE ARRESTED ROUTINELY AS LONG AS YOU COMPLY",
        summary: "Under Section 35(3) of the new Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS), police are strictly barred from arresting you for offences punishable under 3 to 7 years as long as you attend the inquiry. You do not need to panic.",
        statute: "Section 35(3) & 35(4) BNSS, 2023 (Arnesh Kumar Guidelines)",
        steps: [
          "Note the date, time, and police station mentioned in the notice.",
          "You have the right to have an advocate accompany you during the inquiry under Article 22(1).",
          "When you appear, ensure the investigating officer signs your copy of the notice acknowledging your presence.",
          "Police cannot arrest you without prior written reasons recorded and approved by a Judicial Magistrate.",
        ],
        helpline: "Dial 15100 for Free Legal Aid (NALSA)",
      },
      res_notice_serious: {
        type: "warning",
        badge: "LEGAL COUNSEL REQUIRED",
        title: "APPEAR WITH AN ADVOCATE OR SEEK ANTICIPATORY BAIL",
        summary: "For serious allegations where punishment exceeds 7 years, police have wider powers under Section 35(1) BNSS. Do not ignore the notice, but take immediate legal precautions before appearing.",
        statute: "Section 35(1) BNSS & Section 482 BNSS (Anticipatory Bail)",
        steps: [
          "Consult an advocate immediately to file an Anticipatory Bail application under Section 482 BNSS if you fear arrest.",
          "Inform two family members before visiting the police station.",
          "Do not sign blank papers or confess under pressure; confessions to police officers are not admissible evidence under Section 23 BSA, 2023.",
        ],
        helpline: "Contact your local District Legal Services Authority (DLSA)",
      },
      res_unlawful_arrest: {
        type: "danger",
        badge: "UNLAWFUL ACTION",
        title: "ARREST MEMO & FAMILY INTIMATION ARE MANDATORY CONSTITUTIONAL RIGHTS",
        summary: "An arrest without informing grounds or without a witness-signed memo is unconstitutional under Article 22(1) and Section 47 BNSS.",
        statute: "Sections 47, 48 BNSS & Supreme Court D.K. Basu Guidelines",
        steps: [
          "Politely demand: 'Officer, please record my arrest memo and allow me to make my mandatory telephone call under Section 48 BNSS.'",
          "The officer is legally obligated to immediately inform a designated family member or friend of the arrest and place of detention.",
          "The officer must display a clear name tag and badge number.",
          "If police physically abuse or illegally detain someone, family should immediately call 112 and send a telegram/email to the District Sessions Judge.",
        ],
        helpline: "Police Emergency: 112 | Free Legal Aid: 15100",
      },
      res_over_24h: {
        type: "danger",
        badge: "ILLEGAL CONFINEMENT",
        title: "DETENTION BEYOND 24 HOURS IS WRONGFUL CONFINEMENT",
        summary: "Every person arrested must be produced before the nearest Judicial Magistrate within 24 hours (excluding travel time). Keeping anyone beyond 24 hours is a criminal offence by police officers.",
        statute: "Section 58 BNSS & Constitution Article 22(2)",
        steps: [
          "Family members must immediately reach the Court of the Chief Judicial Magistrate (CJM) with an advocate.",
          "File an immediate application for production of the accused person or file a Habeas Corpus petition.",
          "Demand medical examination of the arrested person under Section 53 BNSS to prevent custodial torture.",
        ],
        helpline: "Emergency Judicial Remedy: Contact CJM Court or Dial 112",
      },
      res_search: {
        type: "safe",
        badge: "CITIZEN RIGHTS",
        title: "KNOW YOUR RIGHTS DURING POLICE SEARCHES",
        summary: "Police cannot conduct arbitrary body or phone searches without reasonable suspicion. Female citizens can ONLY be searched by a female police officer with strict decency.",
        statute: "Section 47(2) BNSS & Section 51 BNSS",
        steps: [
          "Stay calm and polite. Ask: 'Officer, may I know the reason for this check?'",
          "Police officers do NOT have the right to search through your private WhatsApp chats or photos during routine traffic checks without a cyber investigation order.",
          "Female search rule: A female can only be searched by a female officer under Section 47(2) BNSS.",
        ],
        helpline: "Women Helpline: 1091 | Emergency: 112",
      },
    },
  },
  {
    id: "bail",
    icon: "⚖️",
    title: ["Someone Close Arrested — Bail Rights", "गिरफ्तारी के बाद जमानत अधिकार", "ਗ੍ਰਿਫ਼ਤਾਰੀ ਤੋਂ ਬਾਅਦ ਜ਼ਮਾਨਤ ਅਧਿਕਾਰ"],
    subtitle: ["Find out if they can get bail at the police station today or need a court lawyer", "क्या थाने से ही जमानत मिलेगी या अदालत में वकील चाहिए", "ਕੀ ਥਾਣੇ ਤੋਂ ਜ਼ਮਾਨਤ ਮਿਲੇਗੀ ਜਾਂ ਅਦਾਲਤ ਵਿੱਚ ਵਕੀਲ ਚਾਹੀਦਾ ਹੈ"],
    questions: {
      step1: {
        question: "What type of crime is alleged against the person?",
        subtitle: "Distinguish between bailable and non-bailable offences in simple terms:",
        options: [
          {
            id: "minor_crime",
            icon: "🟢",
            title: "Minor Offence (Simple fight, defamation, petty theft, cheque bounce, traffic accident)",
            detail: "These are generally categorized as Bailable offences under law.",
            next: "res_bailable",
          },
          {
            id: "serious_crime",
            icon: "🔴",
            title: "Serious Offence (Major fraud, robbery, severe physical violence, drugs)",
            detail: "These are Non-Bailable offences requiring judicial court orders.",
            next: "res_non_bailable",
          },
        ],
      },
    },
    results: {
      res_bailable: {
        type: "safe",
        badge: "BAIL IS AN ABSOLUTE RIGHT",
        title: "POLICE CANNOT KEEP THEM IN JAIL IF YOU PROVIDE A BOND",
        summary: "For bailable offences, bail is not a favour—it is an absolute legal right. The Station House Officer (SHO) is legally required to release the person at the police station upon submitting a simple personal bond.",
        statute: "Section 478 Bharatiya Nagarik Suraksha Sanhita, 2023",
        steps: [
          "Go to the police station with an ID proof (Aadhaar/Voter ID) and address proof.",
          "Inform the officer: 'This is a bailable offence under Section 478 BNSS; we are ready to execute bail bond.'",
          "Police officers have zero discretion to reject bail if bond conditions are fulfilled.",
          "If police demand a bribe or refuse, immediately call 112 or complain to the Assistant Commissioner of Police (ACP).",
        ],
        helpline: "Legal Aid Helpline: 15100",
      },
      res_non_bailable: {
        type: "warning",
        badge: "COURT APPLICATION NEEDED",
        title: "BAIL MUST BE APPLIED BEFORE THE MAGISTRATE",
        summary: "'Non-bailable' does NOT mean bail is impossible; it just means the police cannot give bail at the station. Only a Judge can grant bail after hearing both sides.",
        statute: "Section 480 (Magistrate) & Section 483 (Sessions Court) BNSS",
        steps: [
          "Hire an advocate or request the free Legal Aid counsel appointed inside every Magistrate Court (under Section 341 BNSS).",
          "File a Bail Application under Section 480 BNSS when the accused is produced before the Magistrate within 24 hours.",
          "If the undertrial remains in jail, check our 'Section 479 Bail Calculator' — first-time offenders are legally entitled to release after serving 1/3rd sentence!",
        ],
        helpline: "Free Legal Aid: 15100 | Undertrial Bail Calculator in Citizen Hub",
      },
    },
  },
  {
    id: "cyber",
    icon: "💸",
    title: ["Lost Money to an Online Scam / UPI Fraud", "ऑनलाइन वित्तीय धोखाधड़ी / यूपीआई फ्रॉड", "ਸਾਈਬਰ ਠੱਗੀ / ਯੂਪੀਆਈ ਫਰਾਡ"],
    subtitle: ["Emergency steps to freeze fraudulent bank transfers and recover your money", "धोखाधड़ी वाली राशि को तुरंत बैंक में फ्रीज कराने के उपाय", "ਪੈਸੇ ਵਾਪਸ ਲੈਣ ਅਤੇ ਬੈਂਕ ਖਾਤਾ ਫਰੀਜ਼ ਕਰਵਾਉਣ ਦੇ ਕਦਮ"],
    questions: {
      step1: {
        question: "When did the fraudulent transaction take place?",
        subtitle: "Time is the most critical factor in recovering scammed money:",
        options: [
          {
            id: "golden_hour",
            icon: "⚡",
            title: "Happened right now or within the last 2 to 3 hours (Golden Hour)!",
            detail: "The money is likely still sitting in the scammer's bank account or digital wallet.",
            next: "res_golden_hour",
          },
          {
            id: "past_24h",
            icon: "⏳",
            title: "Happened more than 24 hours ago",
            detail: "The transaction took place yesterday or earlier.",
            next: "res_past_24h",
          },
        ],
      },
    },
    results: {
      res_golden_hour: {
        type: "danger",
        badge: "CRITICAL ACTION NOW",
        title: "CALL 1930 IMMEDIATELY TO FREEZE THE MONEY BEFORE WITHDRAWAL",
        summary: "You are inside the 'Golden Hour'. The National Cyber Crime Reporting Portal (I4C) has a direct digital integration with all Indian banks to place an immediate freeze on the recipient account.",
        statute: "MHA Cyber Crime Coordination Centre (I4C) & IT Act Sec 66D",
        steps: [
          "Pick up your phone and dial 1930 immediately.",
          "Keep ready: Bank name, account number, UPI reference (UTR 12-digit number), and debit SMS.",
          "The 1930 officer generates an automated financial freeze ticket to the beneficiary bank.",
          "After the call, register the formal acknowledgment on cybercrime.gov.in within 24 hours.",
        ],
        helpline: "National Cyber Helpline: 1930 (Toll-Free, 24/7)",
      },
      res_past_24h: {
        type: "warning",
        badge: "REPORT & ZERO-LIABILITY CLAIM",
        title: "FILE COMPLAINT & LODGE ZERO-LIABILITY DISPUTE WITH BANK",
        summary: "Even if time has passed, Indian banking regulations and criminal law protect victims through mandatory chargeback inquiries and cyber investigations.",
        statute: "RBI Circular on Customer Liability & Section 66D IT Act",
        steps: [
          "Lodge a formal cyber complaint on cybercrime.gov.in and download the PDF acknowledgment.",
          "Submit a formal written dispute with the bank acknowledgment to your home bank branch within 3 days.",
          "Under RBI rules, unauthorized electronic fraud reported promptly limits customer liability to zero or minimal amounts.",
        ],
        helpline: "National Cyber Portal: cybercrime.gov.in | Helpline: 1930",
      },
    },
  },
  {
    id: "consumer",
    icon: "🛍️",
    title: ["Seller / Company Cheated Me & Won't Refund", "कंपनी ने ठगा या रिफंड देने से मना किया", "ਕੰਪਨੀ ਨੇ ਠੱਗੀ ਕੀਤੀ ਜਾਂ ਰਿਫੰਡ ਨਹੀਂ ਦਿੱਤਾ"],
    subtitle: ["Consumer rights for defective products, flight/hotel cancellations, or service delays", "खराब सामान या सेवा में कमी पर बिना वकील अदालत जाने का तरीका", "ਬਿਨਾਂ ਵਕੀਲ ਖਪਤਕਾਰ ਅਦਾਲਤ ਵਿੱਚ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਨ ਦਾ ਤਰੀਕਾ"],
    questions: {
      step1: {
        question: "What is the total value of your claim (Price paid + Compensation sought)?",
        subtitle: "Indian consumer courts are divided by monetary value:",
        options: [
          {
            id: "district",
            icon: "🏷️",
            title: "Under ₹50 Lakhs (Laptops, phones, appliances, travel bookings, course fees)",
            detail: "Most everyday citizen consumer disputes fall into this bracket.",
            next: "res_district",
          },
          {
            id: "state",
            icon: "🏢",
            title: "Between ₹50 Lakhs and ₹2 Crores (Real estate flats, luxury vehicles)",
            detail: "Medium to high-value consumer disputes.",
            next: "res_state",
          },
          {
            id: "national",
            icon: "🏛️",
            title: "Above ₹2 Crores (Commercial equipment, multi-flat developer disputes)",
            detail: "Handled directly by the National Commission in New Delhi.",
            next: "res_national",
          },
        ],
      },
    },
    results: {
      res_district: {
        type: "safe",
        badge: "NO LAWYER REQUIRED",
        title: "FILE AT YOUR LOCAL DISTRICT CONSUMER COURT OR ONLINE VIA E-DAAKHIL",
        summary: "You can file a formal case from the comfort of your home at edaakhil.nic.in without hiring a private lawyer. The court will summon the company and order refunds plus compensation.",
        statute: "Section 34 Consumer Protection Act, 2019",
        steps: [
          "Send a formal 15-day Legal Notice to the company using our 'AI Legal Drafting Studio'.",
          "If they fail to refund, register on edaakhil.nic.in (Government of India e-filing portal).",
          "Attach your purchase invoice, payment proof, and email/WhatsApp chat logs.",
          "Under the 2019 Act, you can file the case in the district where YOU live, not where the company is headquartered!",
        ],
        helpline: "National Consumer Helpline: 1915 | E-Filing: edaakhil.nic.in",
      },
      res_state: {
        type: "warning",
        badge: "STATE COMMISSION",
        title: "STATE CONSUMER COMMISSION (SCDRC)",
        summary: "Claims between ₹50 Lakhs and ₹2 Crores lie directly before the State Consumer Commission located in the State Capital.",
        statute: "Section 47 Consumer Protection Act, 2019",
        steps: [
          "Serve a formal statutory notice with itemized loss computation.",
          "File complaint before the State Commission Bench.",
          "Pre-deposit of court fee is nominal compared to regular civil suits.",
        ],
        helpline: "National Consumer Helpline: 1915",
      },
      res_national: {
        type: "warning",
        badge: "APEX CONSUMER COURT",
        title: "NATIONAL CONSUMER COMMISSION (NCDRC, NEW DELHI)",
        summary: "Claims exceeding ₹2 Crores have original jurisdiction before the NCDRC in New Delhi.",
        statute: "Section 58 Consumer Protection Act, 2019",
        steps: [
          "High-value litigation requiring comprehensive documentation and legal representation.",
          "Direct appeal from NCDRC lies before the Supreme Court of India.",
        ],
        helpline: "NCDRC Registry: ncdrc.nic.in",
      },
    },
  },
];

export default function DecisionTrees() {
  const { tr, lang } = useLang();
  const [selectedSituationId, setSelectedSituationId] = useState("police");
  const [currentNodeId, setCurrentNodeId] = useState("step1");
  const [history, setHistory] = useState([]);

  const activeSituation = SITUATIONS.find((s) => s.id === selectedSituationId) || SITUATIONS[0];
  const currentNode = activeSituation.questions[currentNodeId];
  const activeResult = activeSituation.results[currentNodeId];

  const handleSelectSituation = (id) => {
    setSelectedSituationId(id);
    setCurrentNodeId("step1");
    setHistory([]);
  };

  const handleSelectOption = (opt) => {
    setHistory((prev) => [...prev, { nodeId: currentNodeId, chosen: opt.title }]);
    setCurrentNodeId(opt.next);
  };

  const handleReset = () => {
    setCurrentNodeId("step1");
    setHistory([]);
  };

  const handleGoBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentNodeId(prev.nodeId);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="card card-accent card-raised p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <span className="tone-icon-sm" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
              <Shield size={18} />
            </span>
            <div>
              <h2 className="text-xl font-bold font-display text-ink">
                {tr(
                  "Interactive Legal Problem Solver",
                  "सरल कानूनी समस्या समाधान",
                  "ਸਰਲ ਕਾਨੂੰਨੀ ਸਮੱਸਿਆ ਹੱਲ"
                )}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {tr(
                  "Choose your real-world situation and answer 2 simple questions to find your exact legal rights and immediate next steps.",
                  "अपनी वास्तविक समस्या चुनें और 2 सरल प्रश्नों के उत्तर देकर अपने कानूनी अधिकार व तत्काल कदम जानें।",
                  "ਆਪਣੀ ਸਮੱਸਿਆ ਚੁਣੋ ਅਤੇ 2 ਸਰਲ ਸਵਾਲਾਂ ਦੇ ਜਵਾਬ ਦੇ ਕੇ ਆਪਣੇ ਕਾਨੂੰਨੀ ਅਧਿਕਾਰ ਜਾਣੋ।"
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="btn btn-sm btn-ghost text-xs flex items-center gap-1.5 border border-line"
          >
            <RotateCcw size={13} />
            <span>{tr("Start Over", "पुनः शुरू करें", "ਮੁੜ ਸ਼ੁਰੂ ਕਰੋ")}</span>
          </button>
        </div>

        {/* 4 Everyday Real-Life Situations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {SITUATIONS.map((s) => {
            const isSelected = s.id === selectedSituationId;
            const titleText = lang === "hi" ? s.title[1] : lang === "pa" ? s.title[2] : s.title[0];
            const subText = lang === "hi" ? s.subtitle[1] : lang === "pa" ? s.subtitle[2] : s.subtitle[0];

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSituation(s.id)}
                className={`p-4 text-left rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-accent bg-accent/10 shadow-sm ring-1 ring-accent"
                    : "border-line bg-surface/40 hover:bg-surface/80"
                }`}
              >
                <div>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-xs font-bold text-ink leading-snug">{titleText}</div>
                  <div className="text-[11px] text-muted mt-1 leading-snug">{subText}</div>
                </div>
                <div className="text-[10px] text-accent font-semibold mt-3 flex items-center gap-1">
                  <span>{tr("Resolve Situation", "समाधान देखें", "ਹੱਲ ਦੇਖੋ")}</span> &rarr;
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* QUESTION OR RESULT DISPLAY */}
      {currentNode ? (
        <div className="card card-accent card-raised p-6 sm:p-8 bg-white dark:bg-slate-900 border border-line space-y-6">
          {/* Breadcrumb / Step tracker */}
          <div className="flex items-center justify-between text-xs text-muted pb-3 border-b border-line">
            <span className="font-semibold text-accent uppercase tracking-wider">
              {tr("Step", "कदम", "ਕਦਮ")} {history.length + 1}
            </span>
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleGoBack}
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                &larr; {tr("Back to previous question", "पिछले प्रश्न पर लौटें", "ਪਿਛਲੇ ਸਵਾਲ 'ਤੇ ਵਾਪਸ")}
              </button>
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-ink">
              {currentNode.question}
            </h3>
            <p className="text-xs text-muted mt-1">
              {currentNode.subtitle}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentNode.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className="w-full text-left p-4 sm:p-5 rounded-2xl border border-line bg-surface/40 hover:border-accent hover:bg-accent/5 transition-all group flex items-start gap-4"
              >
                <div className="text-2xl shrink-0 mt-0.5">{opt.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-ink group-hover:text-accent transition-colors">
                    {opt.title}
                  </div>
                  <div className="text-xs text-muted mt-0.5 leading-relaxed">
                    {opt.detail}
                  </div>
                </div>
                <div className="p-2 rounded-full bg-surface group-hover:bg-accent/20 group-hover:text-accent transition-all shrink-0 mt-1">
                  <ArrowRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : activeResult ? (
        <div className="space-y-4">
          {/* Visual Verdict Banner */}
          <div
            className={`card p-6 sm:p-8 rounded-2xl border-2 shadow-sm ${
              activeResult.type === "safe"
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100"
                : activeResult.type === "danger"
                ? "bg-red-500/10 border-red-500/40 text-red-950 dark:text-red-100"
                : "bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-100"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3.5 rounded-full text-white shadow-md shrink-0 ${
                  activeResult.type === "safe"
                    ? "bg-emerald-600"
                    : activeResult.type === "danger"
                    ? "bg-red-600"
                    : "bg-amber-500"
                }`}
              >
                {activeResult.type === "safe" ? (
                  <CheckCircle2 size={30} />
                ) : activeResult.type === "danger" ? (
                  <AlertOctagon size={30} />
                ) : (
                  <AlertTriangle size={30} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge font-bold text-xs uppercase px-2.5 py-0.5 bg-black/10 dark:bg-white/10">
                    {activeResult.badge}
                  </span>
                  <span className="text-xs font-semibold opacity-75">
                    {activeResult.statute}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold mt-1.5 leading-snug">
                  {activeResult.title}
                </h3>
                <p className="text-xs sm:text-sm mt-2 leading-relaxed opacity-90">
                  {activeResult.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Action Checklist & Helpline */}
          <div className="card card-accent card-raised p-6 sm:p-8 bg-white dark:bg-slate-900 border border-line space-y-5">
            <div>
              <h4 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                {tr("What you must do right now (Action Checklist):", "आपको अभी क्या करना चाहिए (कार्रवाई सूची):", "ਤੁਹਾਨੂੰ ਹੁਣ ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ:")}
              </h4>
              <ul className="mt-3 space-y-2.5">
                {activeResult.steps.map((st, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Helpline Call Box */}
            <div className="p-4 rounded-xl bg-surface/70 border border-line flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5 text-xs text-muted">
                <PhoneCall size={16} className="text-accent shrink-0" />
                <span>
                  <strong>{tr("Official Helpline:", "आधिकारिक हेल्पलाइन:", "ਅਧਿਕਾਰਤ ਹੈਲਪਲਾਈਨ:")}</strong> {activeResult.helpline}
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-sm btn-ghost border border-line text-xs font-semibold"
              >
                {tr("Test Another Situation", "दूसरी समस्या का समाधान देखें", "ਹੋਰ ਸਮੱਸਿਆ ਦਾ ਹੱਲ ਦੇਖੋ")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
