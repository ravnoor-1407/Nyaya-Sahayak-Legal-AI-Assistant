import { Link } from "react-router-dom";
import { Scale, Phone, ExternalLink, HeartHandshake, ShieldCheck } from "lucide-react";
import { useLang } from "../LangContext";

const LINES = [
  ["15100", ["NALSA free legal aid", "नालसा निःशुल्क विधिक सहायता", "ਨਾਲਸਾ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ"], "var(--c-gold)"],
  ["1930", ["Cyber fraud reporting", "साइबर धोखाधड़ी की शिकायत", "ਸਾਈਬਰ ਧੋਖਾਧੜੀ ਸ਼ਿਕਾਇਤ"], "var(--c-blue)"],
  ["1915", ["Consumer helpline", "उपभोक्ता हेल्पलाइन", "ਖਪਤਕਾਰ ਹੈਲਪਲਾਈਨ"], "var(--c-green)"],
  ["181", ["Women in distress", "संकट में महिलाएँ", "ਸੰਕਟ ਵਿੱਚ ਔਰਤਾਂ"], "var(--c-purple)"],
  ["1098", ["Childline", "चाइल्डलाइन", "ਚਾਈਲਡਲਾਈਨ"], "var(--c-rose)"],
];

const PORTALS = [
  [["Tele-Law video advice", "टेली-लॉ वीडियो सलाह", "ਟੈਲੀ-ਲਾਅ ਵੀਡੀਓ ਸਲਾਹ"], "https://www.tele-law.in"],
  [["e-Courts case status", "ई-कोर्ट्स केस स्थिति", "ਈ-ਕੋਰਟਸ ਕੇਸ ਸਥਿਤੀ"], "https://ecourts.gov.in"],
  [["NALSA legal services", "नालसा विधिक सेवाएँ", "ਨਾਲਸਾ ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ"], "https://nalsa.gov.in"],
  [["e-Daakhil consumer filing", "ई-दाखिल उपभोक्ता शिकायत", "ਈ-ਦਾਖਲ ਖਪਤਕਾਰ ਸ਼ਿਕਾਇਤ"], "https://edaakhil.nic.in"],
  [["RTI Online (central)", "आरटीआई ऑनलाइन (केंद्रीय)", "ਆਰਟੀਆਈ ਆਨਲਾਈਨ (ਕੇਂਦਰੀ)"], "https://rtionline.gov.in"],
];

export default function Footer() {
  const { tr } = useLang();
  return (
    <footer className="site-footer mt-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="logo-mark btn-primary grid h-10 w-10 place-items-center rounded-xl">
              <Scale size={19} />
            </span>
            <span className="leading-tight">
              <span className="font-display block text-lg font-bold">NyayaSahayak</span>
              <span className="text-xs font-semibold text-accent">
                {tr("Citizen legal portal", "नागरिक कानूनी पोर्टल", "ਨਾਗਰਿਕ ਕਾਨੂੰਨੀ ਪੋਰਟਲ")}
              </span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted">
            {tr(
              "A public legal information assistant that answers from indexed Indian statutes and cites the Act and section every time.",
              "एक सार्वजनिक कानूनी जानकारी सहायक जो शामिल भारतीय कानूनों से उत्तर देता है और हर बार अधिनियम व धारा बताता है।",
              "ਇੱਕ ਜਨਤਕ ਕਾਨੂੰਨੀ ਜਾਣਕਾਰੀ ਸਹਾਇਕ ਜੋ ਸ਼ਾਮਲ ਭਾਰਤੀ ਕਾਨੂੰਨਾਂ ਤੋਂ ਜਵਾਬ ਦਿੰਦਾ ਹੈ ਅਤੇ ਹਰ ਵਾਰ ਐਕਟ ਤੇ ਧਾਰਾ ਦੱਸਦਾ ਹੈ।"
            )}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--ok)" }}>
            <ShieldCheck size={14} />
            {tr("Grounded in Indian law", "भारतीय कानून पर आधारित", "ਭਾਰਤੀ ਕਾਨੂੰਨ 'ਤੇ ਆਧਾਰਿਤ")}
          </p>
        </div>

        <div>
          <h3 className="eyebrow flex items-center gap-1.5" style={{ "--tone": "var(--c-gold)" }}>
            <Phone size={13} />
            {tr("Emergency helplines", "आपातकालीन हेल्पलाइन", "ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ")}
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            {LINES.map(([num, name, color]) => (
              <li key={num} className="flex items-center justify-between gap-3">
                <span className="text-muted">{tr(...name)}</span>
                <a href={"tel:" + num} className="font-mono font-bold hover:underline" style={{ color }}>
                  {num}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow flex items-center gap-1.5" style={{ "--tone": "var(--c-blue)" }}>
            <ExternalLink size={13} />
            {tr("Official portals", "आधिकारिक पोर्टल", "ਅਧਿਕਾਰਤ ਪੋਰਟਲ")}
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            {PORTALS.map(([name, href]) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-muted hover:text-accent"
                >
                  {tr(...name)}
                  <ExternalLink size={12} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow flex items-center gap-1.5" style={{ "--tone": "var(--c-green)" }}>
            <HeartHandshake size={13} />
            {tr("Free legal aid rights", "निःशुल्क विधिक सहायता अधिकार", "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਅਧਿਕਾਰ")}
          </h3>
          <p className="mt-3 text-sm text-muted">
            {tr(
              "Under Section 12 of the Legal Services Authorities Act, 1987, women, children, SC/ST members, persons in custody and others are entitled to a free lawyer.",
              "विधिक सेवा प्राधिकरण अधिनियम, 1987 की धारा 12 के तहत महिलाएँ, बच्चे, अनुसूचित जाति/जनजाति के सदस्य, हिरासत में व्यक्ति और अन्य निःशुल्क वकील के पात्र हैं।",
              "ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਅਥਾਰਟੀ ਐਕਟ, 1987 ਦੀ ਧਾਰਾ 12 ਅਧੀਨ ਔਰਤਾਂ, ਬੱਚੇ, ਅਨੁਸੂਚਿਤ ਜਾਤੀ/ਜਨਜਾਤੀ ਦੇ ਮੈਂਬਰ, ਹਿਰਾਸਤ ਵਿੱਚ ਵਿਅਕਤੀ ਅਤੇ ਹੋਰ ਮੁਫ਼ਤ ਵਕੀਲ ਦੇ ਹੱਕਦਾਰ ਹਨ।"
            )}
          </p>
          <Link to="/legal-aid" className="btn btn-primary btn-sm mt-3">
            {tr("Check my eligibility", "मेरी पात्रता जाँचें", "ਮੇਰੀ ਯੋਗਤਾ ਜਾਂਚੋ")}
          </Link>
        </div>
      </div>
      <div className="border-t px-4 py-4 text-center text-xs text-muted">
        {tr(
          "General legal information, not legal advice. For representation call NALSA on 15100.",
          "यह सामान्य कानूनी जानकारी है, कानूनी सलाह नहीं। प्रतिनिधित्व के लिए नालसा 15100 पर कॉल करें।",
          "ਇਹ ਆਮ ਕਾਨੂੰਨੀ ਜਾਣਕਾਰੀ ਹੈ, ਕਾਨੂੰਨੀ ਸਲਾਹ ਨਹੀਂ। ਪ੍ਰਤੀਨਿਧਤਾ ਲਈ ਨਾਲਸਾ 15100 'ਤੇ ਕਾਲ ਕਰੋ।"
        )}
      </div>
    </footer>
  );
}