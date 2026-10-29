import { useState } from "react";
import { Send, Phone, Mail, AlertTriangle } from "lucide-react";
import { useLang } from "../LangContext";

// Change this to your team's real address. The form opens the visitor's own email app.
const CONTACT_EMAIL = "nyayaSahayakLegal@gmail.com";

const TOPICS = [
  ["Free legal aid", "निःशुल्क विधिक सहायता", "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ"],
  ["Citizen guides", "नागरिक मार्गदर्शिकाएँ", "ਨਾਗਰਿਕ ਗਾਈਡਾਂ"],
  ["A wrong or missing answer", "गलत या अधूरा उत्तर", "ਗਲਤ ਜਾਂ ਅਧੂਰਾ ਜਵਾਬ"],
  ["Website feedback", "वेबसाइट पर प्रतिक्रिया", "ਵੈੱਬਸਾਈਟ 'ਤੇ ਫੀਡਬੈਕ"],
  ["Other", "अन्य", "ਹੋਰ"],
];

const LINES = [
  ["15100", ["National Legal Aid Helpline (NALSA)", "राष्ट्रीय विधिक सहायता हेल्पलाइन", "ਰਾਸ਼ਟਰੀ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਹੈਲਪਲਾਈਨ"], "var(--c-gold)"],
  ["1915", ["National Consumer Helpline", "राष्ट्रीय उपभोक्ता हेल्पलाइन", "ਰਾਸ਼ਟਰੀ ਖਪਤਕਾਰ ਹੈਲਪਲਾਈਨ"], "var(--c-green)"],
  ["1930", ["Cyber Crime Reporting", "साइबर अपराध शिकायत", "ਸਾਈਬਰ ਅਪਰਾਧ ਸ਼ਿਕਾਇਤ"], "var(--c-blue)"],
  ["181", ["Women in Distress", "संकट में महिलाएँ", "ਸੰਕਟ ਵਿੱਚ ਔਰਤਾਂ"], "var(--c-purple)"],
];

export default function Contact() {
  const { tr } = useLang();
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(0);
  const [msg, setMsg] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = name.trim().length > 1 && msg.trim().length > 9;

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    const subject = "NyayaSahayak inquiry: " + TOPICS[topic][0];
    const body = "Name: " + name.trim() + "\n\n" + msg.trim();
    window.location.href =
      "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  };

  return (
    <div className="space-y-6">
      <section className="hero-bg card card-accent card-raised px-5 py-8 sm:px-10">
        <span className="tone-badge rise" style={{ "--tone": "var(--c-gold)" }}>
          <Mail size={12} />
          {tr("Citizen support and grievance assistance", "नागरिक सहायता और शिकायत निवारण", "ਨਾਗਰਿਕ ਸਹਾਇਤਾ ਅਤੇ ਸ਼ਿਕਾਇਤ ਨਿਵਾਰਣ")}
        </span>
        <h1 className="rise mt-3 text-3xl font-bold sm:text-4xl" style={{ animationDelay: "60ms" }}>
          {tr("Contact and inquiries", "संपर्क और पूछताछ", "ਸੰਪਰਕ ਅਤੇ ਪੁੱਛਗਿੱਛ")}
        </h1>
        <p className="rise mt-2 max-w-2xl text-muted" style={{ animationDelay: "120ms" }}>
          {tr(
            "Send a question or feedback to the project team. For urgent legal help, use the helplines on the right.",
            "परियोजना टीम को प्रश्न या प्रतिक्रिया भेजिए। तुरंत कानूनी मदद के लिए दाईं ओर की हेल्पलाइन का उपयोग करें।",
            "ਪ੍ਰੋਜੈਕਟ ਟੀਮ ਨੂੰ ਸਵਾਲ ਜਾਂ ਫੀਡਬੈਕ ਭੇਜੋ। ਤੁਰੰਤ ਕਾਨੂੰਨੀ ਮਦਦ ਲਈ ਸੱਜੇ ਪਾਸੇ ਦੀਆਂ ਹੈਲਪਲਾਈਨਾਂ ਵਰਤੋ।"
          )}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submit} className="card card-accent p-5 sm:p-6" noValidate>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Send size={18} className="text-accent" />
            {tr("Submit an inquiry or feedback", "पूछताछ या प्रतिक्रिया भेजें", "ਪੁੱਛਗਿੱਛ ਜਾਂ ਫੀਡਬੈਕ ਭੇਜੋ")}
          </h2>

          <label className="mt-4 block text-sm font-semibold" htmlFor="c-name">
            {tr("Name", "नाम", "ਨਾਮ")}
          </label>
          <input
            id="c-name"
            className="input mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tr("e.g. Ramesh Kumar", "जैसे रमेश कुमार", "ਜਿਵੇਂ ਰਮੇਸ਼ ਕੁਮਾਰ")}
          />

          <label className="mt-3 block text-sm font-semibold" htmlFor="c-topic">
            {tr("Topic", "विषय", "ਵਿਸ਼ਾ")}
          </label>
          <select id="c-topic" className="input mt-1" value={topic} onChange={(e) => setTopic(Number(e.target.value))}>
            {TOPICS.map((t, i) => (
              <option key={i} value={i}>
                {tr(...t)}
              </option>
            ))}
          </select>

          <label className="mt-3 block text-sm font-semibold" htmlFor="c-msg">
            {tr("Your message", "आपका संदेश", "ਤੁਹਾਡਾ ਸੁਨੇਹਾ")}
          </label>
          <textarea
            id="c-msg"
            rows={5}
            className="input mt-1"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={tr(
              "Describe your question without OTPs, card numbers or Aadhaar.",
              "ओटीपी, कार्ड नंबर या आधार के बिना अपना प्रश्न लिखिए।",
              "ਓਟੀਪੀ, ਕਾਰਡ ਨੰਬਰ ਜਾਂ ਆਧਾਰ ਤੋਂ ਬਿਨਾਂ ਆਪਣਾ ਸਵਾਲ ਲਿਖੋ।"
            )}
          />

          {touched && !valid && (
            <p className="mt-2 text-sm" style={{ color: "var(--danger)" }}>
              {tr(
                "Please add your name and a message of at least 10 characters.",
                "कृपया अपना नाम और कम से कम 10 अक्षरों का संदेश लिखिए।",
                "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਨਾਮ ਅਤੇ ਘੱਟੋ-ਘੱਟ 10 ਅੱਖਰਾਂ ਦਾ ਸੁਨੇਹਾ ਲਿਖੋ।"
              )}
            </p>
          )}

          <button type="submit" className="btn btn-primary mt-4 w-full">
            {tr("Open in my email app", "मेरे ईमेल ऐप में खोलें", "ਮੇਰੀ ਈਮੇਲ ਐਪ ਵਿੱਚ ਖੋਲ੍ਹੋ")}
            <Send size={15} />
          </button>
          <p className="mt-2 flex items-start gap-1.5 text-xs text-muted">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            {tr(
              "This opens a draft in your own email app. Nothing is stored on this website.",
              "यह आपके अपने ईमेल ऐप में ड्राफ़्ट खोलता है। इस वेबसाइट पर कुछ संग्रहीत नहीं होता।",
              "ਇਹ ਤੁਹਾਡੀ ਆਪਣੀ ਈਮੇਲ ਐਪ ਵਿੱਚ ਖਰੜਾ ਖੋਲ੍ਹਦਾ ਹੈ। ਇਸ ਵੈੱਬਸਾਈਟ 'ਤੇ ਕੁਝ ਸਟੋਰ ਨਹੀਂ ਹੁੰਦਾ।"
            )}
          </p>
        </form>

        <section className="card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Phone size={18} className="text-accent" />
            {tr("National 24×7 citizen hotlines", "राष्ट्रीय 24×7 नागरिक हॉटलाइन", "ਰਾਸ਼ਟਰੀ 24×7 ਨਾਗਰਿਕ ਹਾਟਲਾਈਨ")}
          </h2>
          <p className="mb-4 text-sm text-muted">
            {tr("Toll-free immediate telephone assistance.", "टोल-फ्री तत्काल फ़ोन सहायता।", "ਟੋਲ-ਫ੍ਰੀ ਤੁਰੰਤ ਫ਼ੋਨ ਸਹਾਇਤਾ।")}
          </p>
          <div className="space-y-3">
            {LINES.map(([num, name, tone]) => (
              <div
                key={num}
                className="card tone-card zoom-hover-sm flex items-center justify-between gap-3 p-3"
                style={{ "--tone": tone }}
              >
                <div className="text-sm font-bold">{tr(...name)}</div>
                <a href={"tel:" + num} className="btn btn-primary btn-sm">
                  <Phone size={14} />
                  <span className="font-mono">{num}</span>
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}