import { useMemo, useState } from "react";
import { Phone, Search, Siren, ExternalLink, ShieldCheck } from "lucide-react";
import { useLang } from "../LangContext";
import Reveal from "../components/Reveal";

const CATS = [
  ["all", ["All", "सभी", "ਸਭ"]],
  ["emergency", ["Emergency", "आपातकाल", "ਐਮਰਜੈਂਸੀ"]],
  ["women", ["Women and children", "महिला और बच्चे", "ਔਰਤਾਂ ਅਤੇ ਬੱਚੇ"]],
  ["legal", ["Legal and consumer", "कानूनी और उपभोक्ता", "ਕਾਨੂੰਨੀ ਅਤੇ ਖਪਤਕਾਰ"]],
  ["cyber", ["Cyber", "साइबर", "ਸਾਈਬਰ"]],
  ["health", ["Health and elders", "स्वास्थ्य और बुज़ुर्ग", "ਸਿਹਤ ਅਤੇ ਬਜ਼ੁਰਗ"]],
];

const TONE = {
  emergency: "var(--c-rose)",
  women: "var(--c-purple)",
  legal: "var(--c-gold)",
  cyber: "var(--c-blue)",
  health: "var(--c-green)",
};

const CAT_LABEL = Object.fromEntries(CATS);

const LINES = [
  { num: "15100", cat: "legal", href: "https://nalsa.gov.in", name: ["National Legal Aid Helpline (NALSA)", "राष्ट्रीय विधिक सहायता हेल्पलाइन (नालसा)", "ਰਾਸ਼ਟਰੀ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਹੈਲਪਲਾਈਨ (ਨਾਲਸਾ)"], note: ["Free lawyer appointment and legal guidance for eligible citizens.", "पात्र नागरिकों के लिए निःशुल्क वकील और कानूनी मार्गदर्शन।", "ਯੋਗ ਨਾਗਰਿਕਾਂ ਲਈ ਮੁਫ਼ਤ ਵਕੀਲ ਅਤੇ ਕਾਨੂੰਨੀ ਮਾਰਗਦਰਸ਼ਨ।"] },
  { num: "1915", cat: "legal", href: "https://consumerhelpline.gov.in", name: ["National Consumer Helpline (NCH)", "राष्ट्रीय उपभोक्ता हेल्पलाइन (एनसीएच)", "ਰਾਸ਼ਟਰੀ ਖਪਤਕਾਰ ਹੈਲਪਲਾਈਨ (ਐਨਸੀਐਚ)"], note: ["Refund disputes, defective goods and misleading ads.", "रिफंड विवाद, खराब सामान और भ्रामक विज्ञापन।", "ਰਿਫੰਡ ਵਿਵਾਦ, ਖ਼ਰਾਬ ਸਮਾਨ ਅਤੇ ਗੁੰਮਰਾਹਕੁਨ ਇਸ਼ਤਿਹਾਰ।"] },
  { num: "1930", cat: "cyber", href: "https://cybercrime.gov.in", name: ["National Cyber Crime Reporting Helpline", "राष्ट्रीय साइबर अपराध शिकायत हेल्पलाइन", "ਰਾਸ਼ਟਰੀ ਸਾਈਬਰ ਅਪਰਾਧ ਸ਼ਿਕਾਇਤ ਹੈਲਪਲਾਈਨ"], note: ["Call straight after an online money fraud so the transfer can be flagged.", "ऑनलाइन पैसे की धोखाधड़ी के तुरंत बाद कॉल करें ताकि लेनदेन रोका जा सके।", "ਆਨਲਾਈਨ ਪੈਸੇ ਦੀ ਧੋਖਾਧੜੀ ਤੋਂ ਤੁਰੰਤ ਬਾਅਦ ਕਾਲ ਕਰੋ ਤਾਂ ਜੋ ਲੈਣ-ਦੇਣ ਰੋਕਿਆ ਜਾ ਸਕੇ।"] },
  { num: "181", cat: "women", name: ["Women in Distress Helpline", "संकट में महिला हेल्पलाइन", "ਸੰਕਟ ਵਿੱਚ ਔਰਤਾਂ ਹੈਲਪਲਾਈਨ"], note: ["Crisis support, counselling and referral for women facing violence.", "हिंसा झेल रही महिलाओं के लिए संकट सहायता, परामर्श और मार्गदर्शन।", "ਹਿੰਸਾ ਝੱਲ ਰਹੀਆਂ ਔਰਤਾਂ ਲਈ ਸੰਕਟ ਸਹਾਇਤਾ, ਸਲਾਹ ਅਤੇ ਮਾਰਗਦਰਸ਼ਨ।"] },
  { num: "1091", cat: "women", name: ["Women Helpline (police)", "महिला हेल्पलाइन (पुलिस)", "ਮਹਿਲਾ ਹੈਲਪਲਾਈਨ (ਪੁਲਿਸ)"], note: ["Harassment, stalking and personal safety.", "उत्पीड़न, पीछा करने और निजी सुरक्षा के लिए।", "ਛੇੜਛਾੜ, ਪਿੱਛਾ ਕਰਨ ਅਤੇ ਨਿੱਜੀ ਸੁਰੱਖਿਆ ਲਈ।"] },
  { num: "1098", cat: "women", href: "https://www.childlineindia.org", name: ["Childline Emergency Service", "चाइल्डलाइन आपातकालीन सेवा", "ਚਾਈਲਡਲਾਈਨ ਐਮਰਜੈਂਸੀ ਸੇਵਾ"], note: ["Children in danger, abuse, child labour or abandonment.", "खतरे, शोषण, बाल श्रम या परित्याग में बच्चे।", "ਖ਼ਤਰੇ, ਸ਼ੋਸ਼ਣ, ਬਾਲ ਮਜ਼ਦੂਰੀ ਜਾਂ ਤਿਆਗ ਵਿੱਚ ਬੱਚੇ।"] },
  { num: "112", cat: "emergency", name: ["Emergency Response (112)", "आपातकालीन सेवा (112)", "ਐਮਰਜੈਂਸੀ ਸੇਵਾ (112)"], note: ["Single number for police, fire and ambulance.", "पुलिस, दमकल और एम्बुलेंस के लिए एक ही नंबर।", "ਪੁਲਿਸ, ਫਾਇਰ ਅਤੇ ਐਂਬੂਲੈਂਸ ਲਈ ਇੱਕ ਨੰਬਰ।"] },
  { num: "100", cat: "emergency", name: ["Police", "पुलिस", "ਪੁਲਿਸ"], note: ["Report a crime or immediate danger.", "अपराध या तत्काल खतरे की सूचना दें।", "ਅਪਰਾਧ ਜਾਂ ਤੁਰੰਤ ਖ਼ਤਰੇ ਦੀ ਸੂਚਨਾ ਦਿਓ।"] },
  { num: "101", cat: "emergency", name: ["Fire Service", "अग्निशमन सेवा", "ਅੱਗ ਬੁਝਾਊ ਸੇਵਾ"], note: ["Fire brigade.", "दमकल सेवा।", "ਫਾਇਰ ਬ੍ਰਿਗੇਡ।"] },
  { num: "108", cat: "emergency", name: ["Ambulance", "एम्बुलेंस", "ਐਂਬੂਲੈਂਸ"], note: ["Medical emergency (available in most states).", "चिकित्सा आपातकाल (अधिकांश राज्यों में)।", "ਮੈਡੀਕਲ ਐਮਰਜੈਂਸੀ (ਜ਼ਿਆਦਾਤਰ ਰਾਜਾਂ ਵਿੱਚ)।"] },
  { num: "14567", cat: "health", name: ["Elderline", "एल्डरलाइन", "ਐਲਡਰਲਾਈਨ"], note: ["Information and help for senior citizens.", "वरिष्ठ नागरिकों के लिए जानकारी और सहायता।", "ਸੀਨੀਅਰ ਨਾਗਰਿਕਾਂ ਲਈ ਜਾਣਕਾਰੀ ਅਤੇ ਸਹਾਇਤਾ।"] },
  { num: "14416", cat: "health", name: ["Tele-MANAS", "टेली-मानस", "ਟੈਲੀ-ਮਾਨਸ"], note: ["Free mental health counselling.", "निःशुल्क मानसिक स्वास्थ्य परामर्श।", "ਮੁਫ਼ਤ ਮਾਨਸਿਕ ਸਿਹਤ ਸਲਾਹ।"] },
];

const PLATFORMS = [
  { tag: ["Govt video legal advice", "सरकारी वीडियो कानूनी सलाह", "ਸਰਕਾਰੀ ਵੀਡੀਓ ਕਾਨੂੰਨੀ ਸਲਾਹ"], tone: "var(--c-purple)", href: "https://www.tele-law.in", name: ["Tele-Law", "टेली-लॉ", "ਟੈਲੀ-ਲਾਅ"], by: ["Department of Justice, Ministry of Law and Justice", "न्याय विभाग, विधि और न्याय मंत्रालय", "ਨਿਆਂ ਵਿਭਾਗ, ਕਾਨੂੰਨ ਅਤੇ ਨਿਆਂ ਮੰਤਰਾਲਾ"], note: ["Talk to a panel lawyer by video or phone through Common Service Centres.", "कॉमन सर्विस सेंटर के ज़रिए पैनल वकील से वीडियो या फ़ोन पर बात करें।", "ਕਾਮਨ ਸਰਵਿਸ ਸੈਂਟਰ ਰਾਹੀਂ ਪੈਨਲ ਵਕੀਲ ਨਾਲ ਵੀਡੀਓ ਜਾਂ ਫ਼ੋਨ 'ਤੇ ਗੱਲ ਕਰੋ।"] },
  { tag: ["National judicial data grid", "राष्ट्रीय न्यायिक डेटा ग्रिड", "ਰਾਸ਼ਟਰੀ ਨਿਆਂਇਕ ਡੇਟਾ ਗ੍ਰਿਡ"], tone: "var(--c-blue)", href: "https://ecourts.gov.in", name: ["eCourts Services", "ई-कोर्ट्स सेवाएँ", "ਈ-ਕੋਰਟਸ ਸੇਵਾਵਾਂ"], by: ["eCommittee, Supreme Court of India", "ई-समिति, भारत का सर्वोच्च न्यायालय", "ਈ-ਕਮੇਟੀ, ਭਾਰਤ ਦੀ ਸੁਪਰੀਮ ਕੋਰਟ"], note: ["Check case status, cause lists and orders.", "मामले की स्थिति, वाद सूची और आदेश देखें।", "ਮਾਮਲੇ ਦੀ ਸਥਿਤੀ, ਵਾਦ ਸੂਚੀ ਅਤੇ ਹੁਕਮ ਵੇਖੋ।"] },
  { tag: ["Consumer filing", "उपभोक्ता शिकायत", "ਖਪਤਕਾਰ ਸ਼ਿਕਾਇਤ"], tone: "var(--c-green)", href: "https://edaakhil.nic.in", name: ["e-Daakhil", "ई-दाखिल", "ਈ-ਦਾਖਲ"], by: ["Department of Consumer Affairs", "उपभोक्ता मामले विभाग", "ਖਪਤਕਾਰ ਮਾਮਲੇ ਵਿਭਾਗ"], note: ["File a consumer complaint online with the Consumer Commission.", "उपभोक्ता आयोग में ऑनलाइन शिकायत दर्ज करें।", "ਖਪਤਕਾਰ ਕਮਿਸ਼ਨ ਵਿੱਚ ਆਨਲਾਈਨ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ।"] },
  { tag: ["Transparency", "पारदर्शिता", "ਪਾਰਦਰਸ਼ਤਾ"], tone: "var(--c-gold)", href: "https://rtionline.gov.in", name: ["RTI Online (central)", "आरटीआई ऑनलाइन (केंद्रीय)", "ਆਰਟੀਆਈ ਆਨਲਾਈਨ (ਕੇਂਦਰੀ)"], by: ["Department of Personnel and Training", "कार्मिक और प्रशिक्षण विभाग", "ਕਰਮਚਾਰੀ ਅਤੇ ਸਿਖਲਾਈ ਵਿਭਾਗ"], note: ["File RTI applications to central public authorities.", "केंद्रीय सार्वजनिक प्राधिकरणों को आरटीआई आवेदन भेजें।", "ਕੇਂਦਰੀ ਜਨਤਕ ਅਥਾਰਟੀਆਂ ਨੂੰ ਆਰਟੀਆਈ ਅਰਜ਼ੀ ਭੇਜੋ।"] },
];

export default function Helplines() {
  const { tr } = useLang();
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return LINES.filter((l) => {
      if (cat !== "all" && l.cat !== cat) return false;
      if (!s) return true;
      return l.num.includes(s) || [...l.name, ...l.note].join(" ").toLowerCase().includes(s);
    });
  }, [cat, q]);

  return (
    <div className="space-y-8">
      <section className="hero-bg card card-accent card-raised overflow-hidden px-5 py-8 sm:px-10">
        <span className="tone-badge rise" style={{ "--tone": "var(--c-gold)" }}>
          {tr("Government emergency helplines", "सरकारी आपातकालीन हेल्पलाइन", "ਸਰਕਾਰੀ ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ")}
        </span>
        <h1 className="rise mt-3 text-3xl font-bold sm:text-4xl" style={{ animationDelay: "60ms" }}>
          {tr("Citizen emergency helplines and legal directory", "नागरिक आपातकालीन हेल्पलाइन और कानूनी निर्देशिका", "ਨਾਗਰਿਕ ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ ਅਤੇ ਕਾਨੂੰਨੀ ਡਾਇਰੈਕਟਰੀ")}
        </h1>
        <p className="rise mt-2 max-w-2xl text-muted" style={{ animationDelay: "120ms" }}>
          {tr(
            "Tap a number to call from your phone. In immediate danger, call 112 first.",
            "फ़ोन से कॉल करने के लिए नंबर दबाइए। तुरंत खतरे में हों तो पहले 112 पर कॉल करें।",
            "ਫ਼ੋਨ ਤੋਂ ਕਾਲ ਕਰਨ ਲਈ ਨੰਬਰ ਦਬਾਓ। ਤੁਰੰਤ ਖ਼ਤਰੇ ਵਿੱਚ ਹੋਵੋ ਤਾਂ ਪਹਿਲਾਂ 112 'ਤੇ ਕਾਲ ਕਰੋ।"
          )}
        </p>
        <a href="tel:112" className="btn btn-primary pulse-glow rise mt-5" style={{ animationDelay: "180ms" }}>
          <Siren size={16} />
          {tr("Emergency: call 112", "आपातकाल: 112 पर कॉल करें", "ਐਮਰਜੈਂਸੀ: 112 'ਤੇ ਕਾਲ ਕਰੋ")}
        </a>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3.5 text-accent" />
          <input
            className="input pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tr("Search by name or number", "नाम या नंबर से खोजें", "ਨਾਮ ਜਾਂ ਨੰਬਰ ਨਾਲ ਖੋਜੋ")}
            aria-label={tr("Search helplines", "हेल्पलाइन खोजें", "ਹੈਲਪਲਾਈਨ ਖੋਜੋ")}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCat(id)}
              className={"chip " + (cat === id ? "chip-active" : "")}
            >
              {tr(...label)}
            </button>
          ))}
        </div>
      </div>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Phone size={18} className="text-accent" />
          {tr("National 24×7 toll-free citizen helplines", "राष्ट्रीय 24×7 टोल-फ्री नागरिक हेल्पलाइन", "ਰਾਸ਼ਟਰੀ 24×7 ਟੋਲ-ਫ੍ਰੀ ਨਾਗਰਿਕ ਹੈਲਪਲਾਈਨ")}
        </h2>
        {shown.length === 0 ? (
          <p className="card p-6 text-center text-muted">
            {tr("No helpline matches your search.", "कोई हेल्पलाइन नहीं मिली।", "ਕੋਈ ਹੈਲਪਲਾਈਨ ਨਹੀਂ ਮਿਲੀ।")}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {shown.map((l, i) => (
              <Reveal key={l.num} delay={(i % 2) * 90} className="h-full">
                <div
                  className="card tone-card zoom-hover group flex h-full flex-col p-5"
                  style={{ "--tone": TONE[l.cat] }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="tone-badge">{tr(...CAT_LABEL[l.cat])}</span>
                    <span className="tone-badge" style={{ "--tone": "var(--c-green)" }}>
                      {tr("Toll-free", "टोल-फ्री", "ਟੋਲ-ਫ੍ਰੀ")}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold">{tr(...l.name)}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted">{tr(...l.note)}</p>
                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <a href={"tel:" + l.num} className="btn btn-primary">
                      <Phone size={15} className="icon-pop" />
                      <span className="font-mono">{l.num}</span>
                    </a>
                    {l.href && (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                      >
                        {tr("Official portal", "आधिकारिक पोर्टल", "ਅਧਿਕਾਰਤ ਪੋਰਟਲ")}
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <ShieldCheck size={18} className="text-accent" />
          {tr("Official government digital justice platforms", "आधिकारिक सरकारी डिजिटल न्याय मंच", "ਅਧਿਕਾਰਤ ਸਰਕਾਰੀ ਡਿਜੀਟਲ ਨਿਆਂ ਪਲੇਟਫਾਰਮ")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {PLATFORMS.map((p, i) => (
            <Reveal key={p.href} delay={(i % 2) * 90} className="h-full">
              <div
                className="card tone-card zoom-hover group flex h-full flex-col p-5"
                style={{ "--tone": p.tone }}
              >
                <span className="tone-badge self-start">{tr(...p.tag)}</span>
                <h3 className="mt-3 text-lg font-bold">{tr(...p.name)}</h3>
                <div className="mono-line">{tr(...p.by)}</div>
                <p className="mt-2 flex-1 text-sm text-muted">{tr(...p.note)}</p>
                <div className="mt-4 flex justify-end border-t pt-3">
                  <a href={p.href} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                    {tr("Access government platform", "सरकारी मंच खोलें", "ਸਰਕਾਰੀ ਪਲੇਟਫਾਰਮ ਖੋਲ੍ਹੋ")}
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-muted">
        {tr(
          "Numbers can change and some services differ by state. Verify before relying on them.",
          "नंबर बदल सकते हैं और कुछ सेवाएँ राज्य के अनुसार अलग होती हैं। उपयोग से पहले जाँच लें।",
          "ਨੰਬਰ ਬਦਲ ਸਕਦੇ ਹਨ ਅਤੇ ਕੁਝ ਸੇਵਾਵਾਂ ਰਾਜ ਅਨੁਸਾਰ ਵੱਖਰੀਆਂ ਹੁੰਦੀਆਂ ਹਨ। ਵਰਤੋਂ ਤੋਂ ਪਹਿਲਾਂ ਜਾਂਚ ਲਓ।"
        )}
      </p>
    </div>
  );
}