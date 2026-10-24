import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartHandshake, CheckCircle2, Phone, ExternalLink, Sparkles, RotateCcw, ArrowRight, Info,
} from "lucide-react";
import { useLang } from "../LangContext";

const CATS = [
  { id: "a", tone: "var(--c-gold)", auto: true, name: ["Member of a Scheduled Caste (SC) or Scheduled Tribe (ST)", "अनुसूचित जाति (SC) या अनुसूचित जनजाति (ST) का सदस्य", "ਅਨੁਸੂਚਿਤ ਜਾਤੀ (SC) ਜਾਂ ਅਨੁਸੂਚਿਤ ਜਨਜਾਤੀ (ST) ਦਾ ਮੈਂਬਰ"] },
  { id: "b", tone: "var(--c-rose)", auto: true, name: ["Victim of human trafficking or forced labour (begar)", "मानव तस्करी या बेगार का शिकार", "ਮਨੁੱਖੀ ਤਸਕਰੀ ਜਾਂ ਬੇਗਾਰ ਦਾ ਸ਼ਿਕਾਰ"] },
  { id: "c", tone: "var(--c-purple)", auto: true, name: ["Woman or child (under 18 years)", "महिला या बच्चा (18 वर्ष से कम)", "ਔਰਤ ਜਾਂ ਬੱਚਾ (18 ਸਾਲ ਤੋਂ ਘੱਟ)"] },
  { id: "d", tone: "var(--c-blue)", auto: true, name: ["Person with disability (Divyangjan)", "दिव्यांगजन", "ਦਿਵਿਆਂਗਜਨ"] },
  { id: "e", tone: "var(--c-green)", auto: true, name: ["Victim of mass disaster, ethnic violence, caste atrocity or flood", "सामूहिक आपदा, जातीय हिंसा, जातिगत अत्याचार या बाढ़ का पीड़ित", "ਸਮੂਹਿਕ ਆਫ਼ਤ, ਨਸਲੀ ਹਿੰਸਾ, ਜਾਤੀ ਅੱਤਿਆਚਾਰ ਜਾਂ ਹੜ੍ਹ ਦਾ ਪੀੜਤ"] },
  { id: "f", tone: "var(--c-gold)", auto: true, name: ["Industrial workman or factory worker", "औद्योगिक कामगार या फ़ैक्टरी मज़दूर", "ਉਦਯੋਗਿਕ ਕਾਮਾ ਜਾਂ ਫੈਕਟਰੀ ਮਜ਼ਦੂਰ"] },
  { id: "g", tone: "var(--c-rose)", auto: true, name: ["In police custody, protective home or prison", "पुलिस हिरासत, संरक्षण गृह या जेल में", "ਪੁਲਿਸ ਹਿਰਾਸਤ, ਸੁਰੱਖਿਆ ਘਰ ਜਾਂ ਜੇਲ੍ਹ ਵਿੱਚ"] },
  { id: "h", tone: "var(--c-blue)", auto: false, name: ["General or other citizen (income based)", "सामान्य या अन्य नागरिक (आय आधारित)", "ਆਮ ਜਾਂ ਹੋਰ ਨਾਗਰਿਕ (ਆਮਦਨ ਆਧਾਰਿਤ)"] },
];

const COVERED = [
  ["Fees of a qualified panel advocate, paid by the State", "योग्य पैनल वकील की फ़ीस, राज्य द्वारा भुगतान", "ਯੋਗ ਪੈਨਲ ਵਕੀਲ ਦੀ ਫੀਸ, ਰਾਜ ਦੁਆਰਾ ਭੁਗਤਾਨ"],
  ["Exemption from court fees and process costs", "अदालती शुल्क और प्रक्रिया खर्च से छूट", "ਅਦਾਲਤੀ ਫੀਸ ਅਤੇ ਪ੍ਰਕਿਰਿਆ ਖਰਚਿਆਂ ਤੋਂ ਛੋਟ"],
  ["Drafting of petitions, replies and legal documents", "याचिकाओं, उत्तरों और कानूनी दस्तावेज़ों का मसौदा", "ਪਟੀਸ਼ਨਾਂ, ਜਵਾਬਾਂ ਅਤੇ ਕਾਨੂੰਨੀ ਦਸਤਾਵੇਜ਼ਾਂ ਦਾ ਖਰੜਾ"],
  ["Certified copies of orders and documents", "आदेशों और दस्तावेज़ों की प्रमाणित प्रतियाँ", "ਹੁਕਮਾਂ ਅਤੇ ਦਸਤਾਵੇਜ਼ਾਂ ਦੀਆਂ ਪ੍ਰਮਾਣਿਤ ਕਾਪੀਆਂ"],
];

export default function LegalAid() {
  const { tr } = useLang();
  const nav = useNavigate();
  const [pick, setPick] = useState(null);
  const [done, setDone] = useState(false);
  const cat = CATS.find((c) => c.id === pick);

  const reset = () => {
    setPick(null);
    setDone(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="hero-bg card card-accent card-raised px-5 py-8 sm:px-8">
        <span className="tone-badge rise" style={{ "--tone": "var(--c-green)" }}>
          <HeartHandshake size={12} />
          {tr("Section 12, Legal Services Authorities Act, 1987", "धारा 12, विधिक सेवा प्राधिकरण अधिनियम, 1987", "ਧਾਰਾ 12, ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਅਥਾਰਟੀ ਐਕਟ, 1987")}
        </span>
        <h1 className="rise mt-3 text-3xl font-bold sm:text-4xl" style={{ animationDelay: "60ms" }}>
          {tr("Free legal aid and lawyer eligibility calculator", "निःशुल्क विधिक सहायता और वकील पात्रता कैलकुलेटर", "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਅਤੇ ਵਕੀਲ ਯੋਗਤਾ ਕੈਲਕੁਲੇਟਰ")}
        </h1>
        <p className="rise mt-2 text-muted" style={{ animationDelay: "120ms" }}>
          {tr(
            "Find out in about a minute whether you qualify for a free government-paid advocate and a waiver of court fees.",
            "लगभग एक मिनट में जानिए कि क्या आप सरकारी खर्च पर वकील और अदालती शुल्क की माफ़ी के पात्र हैं।",
            "ਲਗਭਗ ਇੱਕ ਮਿੰਟ ਵਿੱਚ ਜਾਣੋ ਕਿ ਕੀ ਤੁਸੀਂ ਸਰਕਾਰੀ ਖਰਚੇ 'ਤੇ ਵਕੀਲ ਅਤੇ ਅਦਾਲਤੀ ਫੀਸ ਦੀ ਮਾਫ਼ੀ ਲਈ ਯੋਗ ਹੋ।"
          )}
        </p>
      </section>

      {!done && (
        <section className="card card-accent p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">
              {tr("1. Select your citizen category", "1. अपनी नागरिक श्रेणी चुनिए", "1. ਆਪਣੀ ਨਾਗਰਿਕ ਸ਼੍ਰੇਣੀ ਚੁਣੋ")}
            </h2>
            <span className="tone-badge">{tr("Step 1 of 2", "चरण 1 / 2", "ਪੜਾਅ 1 / 2")}</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CATS.map((c, i) => {
              const on = pick === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPick(c.id)}
                  className={"card tone-card zoom-hover-sm rise relative p-4 text-left " + (on ? "acc-open" : "")}
                  style={{ "--tone": c.tone, animationDelay: i * 40 + "ms" }}
                >
                  {on && <CheckCircle2 size={18} className="absolute right-3 top-3 tone-text" />}
                  <div className={"pr-6 text-sm font-bold " + (on ? "text-accent" : "")}>{tr(...c.name)}</div>
                  <div className="mono-line mt-1">
                    {tr("Section", "धारा", "ਧਾਰਾ")} 12({c.id})
                    {c.auto ? " · " + tr("free, no income test", "निःशुल्क, आय जाँच नहीं", "ਮੁਫ਼ਤ, ਆਮਦਨ ਜਾਂਚ ਨਹੀਂ") : ""}
                  </div>
                </button>
              );
            })}
          </div>
          <button type="button" className="btn btn-primary mt-5" disabled={!pick} onClick={() => setDone(true)}>
            {tr("Evaluate my free legal aid eligibility", "मेरी निःशुल्क विधिक सहायता पात्रता जाँचें", "ਮੇਰੀ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਯੋਗਤਾ ਜਾਂਚੋ")}
            <ArrowRight size={16} />
          </button>
        </section>
      )}

      {done && cat && (
        <section
          className="card msg-in p-5 sm:p-6"
          style={{
            borderColor: cat.auto ? "var(--c-green)" : "var(--c-gold)",
            background: "color-mix(in srgb, " + (cat.auto ? "var(--c-green)" : "var(--c-gold)") + " 10%, var(--card))",
          }}
        >
          <div className="flex items-start gap-3">
            <span className="tone-icon" style={{ "--tone": cat.auto ? "var(--c-green)" : "var(--c-gold)" }}>
              {cat.auto ? <CheckCircle2 size={22} /> : <Info size={22} />}
            </span>
            <div>
              <div className="eyebrow" style={{ "--tone": cat.auto ? "var(--c-green)" : "var(--c-gold)" }}>
                {tr("Statutory assessment", "वैधानिक आकलन", "ਕਾਨੂੰਨੀ ਮੁਲਾਂਕਣ")}
              </div>
              <h2 className="text-2xl font-bold">
                {cat.auto
                  ? tr("You are likely entitled to free legal aid", "आप निःशुल्क विधिक सहायता के पात्र हो सकते हैं", "ਤੁਸੀਂ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਦੇ ਹੱਕਦਾਰ ਹੋ ਸਕਦੇ ਹੋ")
                  : tr("Eligibility depends on your income", "पात्रता आपकी आय पर निर्भर है", "ਯੋਗਤਾ ਤੁਹਾਡੀ ਆਮਦਨ 'ਤੇ ਨਿਰਭਰ ਹੈ")}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {cat.auto
                  ? tr(
                      "Under Section 12(" + cat.id + ") of the Legal Services Authorities Act, 1987, people in this category are entitled to legal services without an income test.",
                      "विधिक सेवा प्राधिकरण अधिनियम, 1987 की धारा 12(" + cat.id + ") के तहत इस श्रेणी के लोग आय जाँच के बिना कानूनी सेवाओं के पात्र हैं।",
                      "ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਅਥਾਰਟੀ ਐਕਟ, 1987 ਦੀ ਧਾਰਾ 12(" + cat.id + ") ਅਧੀਨ ਇਸ ਸ਼੍ਰੇਣੀ ਦੇ ਲੋਕ ਆਮਦਨ ਜਾਂਚ ਤੋਂ ਬਿਨਾਂ ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਦੇ ਹੱਕਦਾਰ ਹਨ।"
                    )
                  : tr(
                      "Under Section 12(h), you qualify if your annual income is below the limit your State Government has set. The limit differs by State, so ask your District Legal Services Authority or call 15100.",
                      "धारा 12(h) के तहत आप तब पात्र हैं जब आपकी वार्षिक आय आपकी राज्य सरकार की तय सीमा से कम हो। सीमा राज्य के अनुसार अलग है, इसलिए अपने ज़िला विधिक सेवा प्राधिकरण से पूछें या 15100 पर कॉल करें।",
                      "ਧਾਰਾ 12(h) ਅਧੀਨ ਤੁਸੀਂ ਤਦ ਯੋਗ ਹੋ ਜਦੋਂ ਤੁਹਾਡੀ ਸਾਲਾਨਾ ਆਮਦਨ ਤੁਹਾਡੀ ਰਾਜ ਸਰਕਾਰ ਦੀ ਤੈਅ ਸੀਮਾ ਤੋਂ ਘੱਟ ਹੋਵੇ। ਸੀਮਾ ਰਾਜ ਅਨੁਸਾਰ ਵੱਖਰੀ ਹੈ, ਇਸ ਲਈ ਆਪਣੇ ਜ਼ਿਲ੍ਹਾ ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਅਥਾਰਟੀ ਤੋਂ ਪੁੱਛੋ ਜਾਂ 15100 'ਤੇ ਕਾਲ ਕਰੋ।"
                    )}
              </p>
            </div>
          </div>

          <div className="bg-surface mt-4 rounded-xl border p-4">
            <h3 className="eyebrow">{tr("What free legal aid can cover", "निःशुल्क विधिक सहायता में क्या शामिल हो सकता है", "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਵਿੱਚ ਕੀ ਸ਼ਾਮਲ ਹੋ ਸਕਦਾ ਹੈ")}</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {COVERED.map((c, i) => (
                <div key={i} className="check-item">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--c-green)" }} />
                  <span>{tr(...c)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a className="btn btn-primary" href="tel:15100">
              <Phone size={15} />
              {tr("Call 15100 (toll-free)", "15100 पर कॉल करें (टोल-फ्री)", "15100 'ਤੇ ਕਾਲ ਕਰੋ (ਟੋਲ-ਫ੍ਰੀ)")}
            </a>
            <a className="btn btn-ghost" href="https://nalsa.gov.in" target="_blank" rel="noreferrer">
              {tr("Apply on the NALSA portal", "नालसा पोर्टल पर आवेदन करें", "ਨਾਲਸਾ ਪੋਰਟਲ 'ਤੇ ਅਰਜ਼ੀ ਦਿਓ")}
              <ExternalLink size={14} />
            </a>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => nav("/assistant", { state: { q: "Who is eligible for a free government advocate under Section 12 of the Legal Services Authorities Act?" } })}
            >
              <Sparkles size={14} />
              {tr("Ask the assistant for details", "विवरण के लिए सहायक से पूछें", "ਵੇਰਵਿਆਂ ਲਈ ਸਹਾਇਕ ਤੋਂ ਪੁੱਛੋ")}
            </button>
            <button type="button" className="btn btn-ghost ml-auto" onClick={reset}>
              <RotateCcw size={14} />
              {tr("Check another citizen", "किसी और की जाँच करें", "ਕਿਸੇ ਹੋਰ ਦੀ ਜਾਂਚ ਕਰੋ")}
            </button>
          </div>
          <p className="mt-3 text-xs text-muted">
            {tr(
              "This is an indication, not a decision. The Legal Services Authority makes the final determination.",
              "यह एक संकेत है, निर्णय नहीं। अंतिम निर्णय विधिक सेवा प्राधिकरण करता है।",
              "ਇਹ ਇੱਕ ਸੰਕੇਤ ਹੈ, ਫ਼ੈਸਲਾ ਨਹੀਂ। ਅੰਤਿਮ ਫ਼ੈਸਲਾ ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਅਥਾਰਟੀ ਕਰਦੀ ਹੈ।"
            )}
          </p>
        </section>
      )}
    </div>
  );
}