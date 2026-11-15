import { useState } from "react";
import {
  ShieldAlert,
  PhoneCall,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Scale,
  CreditCard,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { useLang } from "../LangContext";
import { Link } from "react-router-dom";

const ACTION_GUIDES = [
  {
    id: "police",
    icon: ShieldAlert,
    iconColor: "var(--c-blue)",
    bgColor: "rgba(59,130,246,0.12)",
    title: ["Police Called or Questioning You?", "पुलिस पूछताछ या थाने बुलाने पर क्या करें?", "ਪੁਲਿਸ ਪੁੱਛਗਿੱਛ ਵੇਲੇ ਕੀ ਕਰੀਏ?"],
    category: "Criminal Procedure & Personal Liberty",
    statute: "BNSS Sections 35, 47, 48, 58 & Constitution Article 22",
    summary: "Clear, practical rules on what the police can and cannot do under India's new criminal laws.",
    firstStep: "Stay calm and ask the officer for their name, designation, and whether a written Notice of Appearance (Section 35(3) BNSS) has been issued.",
    rights: [
      {
        title: "No Routine Arrest for Offences under 7 Years",
        desc: "Under Section 35(3) BNSS, police cannot arrest you routinely. They must serve a written Notice of Appearance. As long as you comply, you cannot be arrested without prior written magistrate sanction.",
      },
      {
        title: "Right to Have an Advocate Present",
        desc: "Under Article 22(1) of the Constitution and Section 38 BNSS, you have the fundamental right to consult and be defended by a legal practitioner of your choice.",
      },
      {
        title: "Strict 24-Hour Production Rule",
        desc: "If detained, police must produce you before the nearest Judicial Magistrate within 24 hours under Section 58 BNSS and Article 22(2). Detention beyond 24 hours without court order is illegal.",
      },
      {
        title: "Mandatory Information to Family",
        desc: "Under Section 48 BNSS, the police officer is legally mandated to immediately inform a nominated relative or friend about your arrest and the place where you are held.",
      },
    ],
    donts: [
      "Do not run away, resist physically, or sign blank papers.",
      "Do not give any statement without understanding what is written; you have the right to remain silent against self-incrimination (Article 20(3)).",
    ],
    helpline: { label: "Free Legal Aid (NALSA)", number: "15100", tel: "15100" },
    actionBtn: { label: "Check Bail Entitlement", link: "/bail-calculator" },
  },
  {
    id: "cyber",
    icon: CreditCard,
    iconColor: "var(--c-rose)",
    bgColor: "rgba(224,90,71,0.12)",
    title: ["Lost Money in an Online Scam / UPI Fraud?", "ऑनलाइन धोखाधड़ी या यूपीआई फ्रॉड हुआ?", "ਆਨਲਾਈਨ ਠੱਗੀ ਹੋਣ 'ਤੇ ਕੀ ਕਰੀਏ?"],
    category: "Cyber Crime & Financial Protection",
    statute: "Section 66D Information Technology Act & MHA CFCFRMS Protocol",
    summary: "Immediate steps to take within the 'Golden 2 Hours' to freeze and recover stolen funds.",
    firstStep: "Dial 1930 immediately! The National Cyber Crime helpline can trigger an instant freeze on the scammer's bank account before the money is withdrawn.",
    rights: [
      {
        title: "The Golden 2-Hour Window",
        desc: "When reported within 2 hours, the Indian Cyber Crime Coordination Centre (I4C) communicates directly with bank payment gateways to halt transactions midway.",
      },
      {
        title: "Zero Liability for Prompt Reporting",
        desc: "Under RBI Circular DBR.No.Leg.BC.78/09.07.005, if unauthorized electronic banking transactions are reported within 3 working days, customer liability is zero or strictly capped.",
      },
      {
        title: "Statutory FIR under Sec 66D IT Act",
        desc: "Cheating by personation using computer resources carries up to 3 years imprisonment. Every citizen has the right to register a cyber complaint without jurisdictional hurdles.",
      },
    ],
    donts: [
      "Do not delete SMS, UPI transaction IDs, bank statements, or WhatsApp chat screenshots.",
      "Do not click any remote-access app links (AnyDesk, TeamViewer, QuickSupport) sent by callers claiming to be bank executives.",
    ],
    helpline: { label: "National Cyber Helpline", number: "1930", tel: "1930" },
    actionBtn: { label: "File on Cybercrime.gov.in", link: "https://cybercrime.gov.in", external: true },
  },
  {
    id: "rent",
    icon: Building2,
    iconColor: "var(--c-gold)",
    bgColor: "rgba(245,158,11,0.12)",
    title: ["Landlord Refusing to Return Security Deposit?", "मकान मालिक सिक्योरिटी डिपॉजिट वापस नहीं कर रहा?", "ਮਕਾਨ ਮਾਲਕ ਸਕਿਓਰਿਟੀ ਵਾਪਸ ਨਹੀਂ ਕਰ ਰਿਹਾ?"],
    category: "Tenancy & Civil Rights",
    statute: "Model Tenancy Act & Indian Contract Act (Section 73/74)",
    summary: "How to legally recover your security deposit when landlords make unreasonable deductions.",
    firstStep: "Send a written message/email requesting an itemized breakdown of any alleged damages along with actual repair bills or contractor receipts.",
    rights: [
      {
        title: "No Arbitrary Deductions",
        desc: "Landlords cannot deduct deposit for normal wear-and-tear (e.g., standard repainting, age of property). Deductions are only permissible for actual proven structural damages.",
      },
      {
        title: "Mandatory Refund Timeline",
        desc: "Security deposits must be refunded upon peaceful handover of possession within the agreement timeline (typically within 7 to 30 days).",
      },
      {
        title: "Unfair Trade Practice under Consumer Act",
        desc: "Unjust withholding of rental advance constitutes unfair trade practice. Tenants can issue a formal 15-day demand notice claiming deposit with 12% interest.",
      },
    ],
    donts: [
      "Do not hand over keys without taking video/photo proof of the vacant, clean premises.",
      "Do not accept verbal excuses; keep every communication in writing.",
    ],
    helpline: { label: "National Consumer Helpline", number: "1915", tel: "1915" },
    actionBtn: { label: "Draft Rent Refund Notice", link: "/drafting" },
  },
  {
    id: "cheque",
    icon: Scale,
    iconColor: "var(--c-purple)",
    bgColor: "rgba(168,85,247,0.12)",
    title: ["Cheque Bounced or Money Owed to You?", "चेक बाउंस हो गया या आपका पैसा अटका है?", "ਚੈੱਕ ਬਾਊਂਸ ਹੋ ਗਿਆ ਜਾਂ ਪੈਸੇ ਅਟਕੇ ਹਨ?"],
    category: "Commercial Law & Negotiable Instruments",
    statute: "Section 138 Negotiable Instruments Act, 1881",
    summary: "Strict statutory procedure to recover debt and initiate criminal proceedings for bounced cheques.",
    firstStep: "Collect the official 'Cheque Return Memo' from your bank specifying the date and dishonour reason (e.g. 'Funds Insufficient').",
    rights: [
      {
        title: "Strict 30-Day Notice Rule",
        desc: "You must send a formal legal demand notice to the drawer within 30 days from the date you received the bank return memo.",
      },
      {
        title: "15 Days Mandatory Cure Period",
        desc: "The drawer is given 15 days from the date of receiving the notice to clear the payment. The crime occurs ONLY if they fail to pay within these 15 days.",
      },
      {
        title: "Criminal Prosecution & Double Compensation",
        desc: "Under Section 138 NI Act, the court can award imprisonment up to 2 years and a fine of up to DOUBLE the cheque amount to the victim.",
      },
    ],
    donts: [
      "Do not delay sending the notice beyond the 30-day limit, or the criminal remedy may expire.",
      "Do not surrender the original dishonoured cheque or bank memo.",
    ],
    helpline: { label: "National Legal Aid", number: "15100", tel: "15100" },
    actionBtn: { label: "Draft 15-Day Cheque Notice", link: "/drafting" },
  },
];

export default function DecisionTrees() {
  const { tr } = useLang();
  const [selectedId, setSelectedId] = useState("police");

  const activeGuide = ACTION_GUIDES.find((g) => g.id === selectedId) || ACTION_GUIDES[0];
  const Icon = activeGuide.icon;

  return (
    <div className="space-y-6">
      <div className="card card-accent card-raised p-6">
        <div className="pb-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <span className="tone-icon-sm" style={{ background: "rgba(16,185,129,0.12)", color: "var(--c-green)" }}>
              <ShieldCheck size={18} />
            </span>
            <div>
              <h2 className="text-xl font-bold font-display text-ink">
                {tr(
                  "Citizen Action Guides: Everyday Legal Situations",
                  "नागरिक त्वरित सहायता: आम कानूनी स्थितियां",
                  "ਨਾਗਰਿਕ ਤੁਰੰਤ ਸਹਾਇਤਾ: ਆਮ ਕਾਨੂੰਨੀ ਸਥਿਤੀਆਂ"
                )}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {tr(
                  "Plain-language, step-by-step rights and immediate remedies for real-life legal situations. Zero confusing jargon.",
                  "वास्तविक जीवन की स्थितियों के लिए सरल भाषा में अधिकार और तत्काल उपाय। कोई जटिल तकनीकी शब्दावली नहीं।",
                  "ਅਸਲ ਜ਼ਿੰਦਗੀ ਦੀਆਂ ਸਥਿਤੀਆਂ ਲਈ ਸਰਲ ਭਾਸ਼ਾ ਵਿੱਚ ਅਧਿਕਾਰ ਅਤੇ ਤੁਰੰਤ ਕਦਮ।"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Everyday Situation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {ACTION_GUIDES.map((g) => {
            const GIcon = g.icon;
            const isSelected = g.id === selectedId;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedId(g.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-accent/15 border-accent shadow-sm"
                    : "border-line bg-surface/50 hover:bg-surface"
                }`}
              >
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center mb-2.5"
                  style={{ background: g.bgColor, color: g.iconColor }}
                >
                  <GIcon size={18} />
                </div>
                <div className="font-bold text-xs text-ink line-clamp-2">{tr(g.title[0], g.title[1], g.title[2])}</div>
                <div className="text-[10px] text-muted mt-1">{g.category}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Situation Breakdown */}
      <div className="card card-accent card-raised p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: activeGuide.bgColor, color: activeGuide.iconColor }}
            >
              <Icon size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">
                {tr(activeGuide.title[0], activeGuide.title[1], activeGuide.title[2])}
              </h3>
              <p className="text-xs text-muted mt-0.5">{activeGuide.statute}</p>
            </div>
          </div>

          {/* Quick Action Button */}
          {activeGuide.actionBtn.external ? (
            <a
              href={activeGuide.actionBtn.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-primary flex items-center gap-1.5 text-xs font-bold"
            >
              <span>{activeGuide.actionBtn.label}</span>
              <ExternalLink size={13} />
            </a>
          ) : (
            <Link
              to={activeGuide.actionBtn.link}
              className="btn btn-sm btn-primary flex items-center gap-1.5 text-xs font-bold"
            >
              <span>{activeGuide.actionBtn.label}</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>

        {/* Immediate First Step Box */}
        <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-accent-ink uppercase tracking-wider">
            <Sparkles size={14} className="text-accent" />
            <span>{tr("Immediate First Step (What to do right now):", "पहला तत्काल कदम:", "ਪਹਿਲਾ ਤੁਰੰਤ ਕਦਮ:")}</span>
          </div>
          <p className="text-sm font-semibold text-ink leading-relaxed">
            {activeGuide.firstStep}
          </p>
        </div>

        {/* Key Statutory Rights */}
        <div>
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">
            {tr("Your Essential Statutory Rights & Protections", "आपके प्रमुख कानूनी अधिकार", "ਤੁਹਾਡੇ ਕਾਨੂੰਨੀ ਅਧਿਕਾਰ")}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeGuide.rights.map((r, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface/60 border border-line space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-ink">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span>{r.title}</span>
                </div>
                <p className="text-xs text-muted leading-relaxed pl-5">
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* What NOT to do */}
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            <AlertTriangle size={15} />
            <span>{tr("Common Mistakes to Avoid (What NOT to do):", "बचने योग्य सामान्य गलतियाँ:", "ਬਚਣ ਯੋਗ ਗਲਤੀਆਂ:")}</span>
          </div>
          <ul className="space-y-1 text-xs text-red-950 dark:text-red-200 list-disc pl-5">
            {activeGuide.donts.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>

        {/* Emergency Helpline Banner */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface/60 border border-line flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs">
            <PhoneCall size={16} className="text-accent" />
            <span className="font-bold text-ink">{activeGuide.helpline.label}:</span>
            <span className="text-muted">Dial toll-free {activeGuide.helpline.number}</span>
          </div>
          <a
            href={`tel:${activeGuide.helpline.tel}`}
            className="btn btn-sm btn-ghost text-xs font-bold border border-line flex items-center gap-1.5 text-accent"
          >
            <span>Call {activeGuide.helpline.number}</span>
            <ArrowRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
