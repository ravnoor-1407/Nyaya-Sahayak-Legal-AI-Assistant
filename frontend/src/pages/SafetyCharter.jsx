import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Database, Cpu, FileCheck2, Lock, Scale, HeartHandshake,
  Award, AlertTriangle, CircleSlash, Library, BookCheck,
} from "lucide-react";
import { useLang } from "../LangContext";
import { getJSON } from "../api";
import Reveal from "../components/Reveal";

const pct = (x) => (typeof x === "number" ? Math.round(x * 1000) / 10 + "%" : null);

export default function SafetyCharter() {
  const { tr } = useLang();
  const [ev, setEv] = useState(null);

  // Results written by backend/scripts/evaluate.py. Nothing is shown until they exist.
  useEffect(() => {
    getJSON("/api/eval")
      .then((d) => {
        if (d && d.n) setEv(d);
      })
      .catch(() => {});
  }, []);

  const mandate = [
    ["var(--c-gold)", ["Free to use", "उपयोग निःशुल्क", "ਵਰਤੋਂ ਮੁਫ਼ਤ"], ["No fees, ads or paywall for citizens.", "नागरिकों के लिए कोई शुल्क, विज्ञापन या पेवॉल नहीं।", "ਨਾਗਰਿਕਾਂ ਲਈ ਕੋਈ ਫੀਸ, ਇਸ਼ਤਿਹਾਰ ਜਾਂ ਪੇਵਾਲ ਨਹੀਂ।"]],
    ["var(--c-green)", ["Voice accessible", "आवाज़ सुलभ", "ਆਵਾਜ਼ ਸੁਲਭ"], ["Speak your question and listen to answers in the browser.", "बोलकर प्रश्न पूछिए और ब्राउज़र में उत्तर सुनिए।", "ਬੋਲ ਕੇ ਸਵਾਲ ਪੁੱਛੋ ਅਤੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਜਵਾਬ ਸੁਣੋ।"]],
    ["var(--c-blue)", ["Section 12 aid check", "धारा 12 सहायता जाँच", "ਧਾਰਾ 12 ਸਹਾਇਤਾ ਜਾਂਚ"], ["Connects eligible citizens to free legal aid.", "पात्र नागरिकों को निःशुल्क विधिक सहायता से जोड़ता है।", "ਯੋਗ ਨਾਗਰਿਕਾਂ ਨੂੰ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਨਾਲ ਜੋੜਦਾ ਹੈ।"]],
  ];

  const stages = [
    [Database, "var(--c-blue)", ["1. Statutory indexing", "1. कानूनी अनुक्रमण", "1. ਕਾਨੂੰਨੀ ਇੰਡੈਕਸਿੰਗ"], ["Acts are split by Article or Section so each passage keeps its number, then stored in a vector database.", "अधिनियमों को अनुच्छेद या धारा के अनुसार बाँटा जाता है ताकि हर अंश का क्रमांक बना रहे, फिर वेक्टर डेटाबेस में रखा जाता है।", "ਐਕਟਾਂ ਨੂੰ ਅਨੁਛੇਦ ਜਾਂ ਧਾਰਾ ਅਨੁਸਾਰ ਵੰਡਿਆ ਜਾਂਦਾ ਹੈ ਤਾਂ ਜੋ ਹਰ ਅੰਸ਼ ਦਾ ਨੰਬਰ ਬਣਿਆ ਰਹੇ, ਫਿਰ ਵੈਕਟਰ ਡੇਟਾਬੇਸ ਵਿੱਚ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ।"]],
    [Cpu, "var(--c-green)", ["2. Semantic vector search", "2. अर्थ-आधारित वेक्टर खोज", "2. ਅਰਥ-ਆਧਾਰਿਤ ਵੈਕਟਰ ਖੋਜ"], ["Your question, in English, Hindi or Punjabi, is matched to the closest passages by meaning.", "आपका प्रश्न, अंग्रेज़ी, हिंदी या पंजाबी में, अर्थ के आधार पर निकटतम अंशों से मिलाया जाता है।", "ਤੁਹਾਡਾ ਸਵਾਲ, ਅੰਗਰੇਜ਼ੀ, ਹਿੰਦੀ ਜਾਂ ਪੰਜਾਬੀ ਵਿੱਚ, ਅਰਥ ਦੇ ਆਧਾਰ 'ਤੇ ਸਭ ਤੋਂ ਨੇੜਲੇ ਅੰਸ਼ਾਂ ਨਾਲ ਮਿਲਾਇਆ ਜਾਂਦਾ ਹੈ।"]],
    [ShieldCheck, "var(--c-purple)", ["3. Grounded synthesis", "3. आधारित उत्तर निर्माण", "3. ਆਧਾਰਿਤ ਜਵਾਬ ਸਿਰਜਣ"], ["The language model is told to answer only from the retrieved passages and to name the Act and section.", "भाषा मॉडल को केवल प्राप्त अंशों से उत्तर देने और अधिनियम व धारा बताने को कहा जाता है।", "ਭਾਸ਼ਾ ਮਾਡਲ ਨੂੰ ਸਿਰਫ਼ ਮਿਲੇ ਅੰਸ਼ਾਂ ਤੋਂ ਜਵਾਬ ਦੇਣ ਅਤੇ ਐਕਟ ਤੇ ਧਾਰਾ ਦੱਸਣ ਲਈ ਕਿਹਾ ਜਾਂਦਾ ਹੈ।"]],
  ];

  const guards = [
    [FileCheck2, "var(--c-green)", ["Verifiable source provenance", "जाँचने योग्य स्रोत", "ਜਾਂਚਣ ਯੋਗ ਸਰੋਤ"], ["Answers list the Act and section, and you can open the passage to read it yourself.", "उत्तर में अधिनियम और धारा दिखती है, और आप अंश खोलकर खुद पढ़ सकते हैं।", "ਜਵਾਬ ਵਿੱਚ ਐਕਟ ਅਤੇ ਧਾਰਾ ਦਿਸਦੀ ਹੈ, ਅਤੇ ਤੁਸੀਂ ਅੰਸ਼ ਖੋਲ੍ਹ ਕੇ ਆਪ ਪੜ੍ਹ ਸਕਦੇ ਹੋ।"]],
    [CircleSlash, "var(--c-blue)", ["Graceful abstention", "सलीके से मना करना", "ਸਲੀਕੇ ਨਾਲ ਮਨ੍ਹਾ ਕਰਨਾ"], ["If a question falls outside the indexed laws, the assistant says so instead of guessing.", "प्रश्न शामिल कानूनों से बाहर हो तो सहायक अंदाज़ा लगाने की जगह यही बताता है।", "ਸਵਾਲ ਸ਼ਾਮਲ ਕਾਨੂੰਨਾਂ ਤੋਂ ਬਾਹਰ ਹੋਵੇ ਤਾਂ ਸਹਾਇਕ ਅੰਦਾਜ਼ਾ ਲਗਾਉਣ ਦੀ ਥਾਂ ਇਹੀ ਦੱਸਦਾ ਹੈ।"]],
    [Lock, "var(--c-purple)", ["Privacy and anonymity", "निजता और गोपनीयता", "ਨਿੱਜਤਾ ਅਤੇ ਗੁਮਨਾਮੀ"], ["Phone numbers, emails and ID numbers are removed before a question is logged. Do not share OTPs or card details.", "प्रश्न दर्ज होने से पहले फ़ोन नंबर, ईमेल और पहचान संख्याएँ हटा दी जाती हैं। ओटीपी या कार्ड विवरण साझा न करें।", "ਸਵਾਲ ਦਰਜ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਫ਼ੋਨ ਨੰਬਰ, ਈਮੇਲ ਅਤੇ ਪਛਾਣ ਨੰਬਰ ਹਟਾ ਦਿੱਤੇ ਜਾਂਦੇ ਹਨ। ਓਟੀਪੀ ਜਾਂ ਕਾਰਡ ਵੇਰਵੇ ਸਾਂਝੇ ਨਾ ਕਰੋ।"]],
    [BookCheck, "var(--c-gold)", ["Educational boundary", "शैक्षिक सीमा", "ਸਿੱਖਿਆ ਦੀ ਸੀਮਾ"], ["It explains the law. It is not a lawyer, and it points you to NALSA (15100) for representation.", "यह कानून समझाता है। यह वकील नहीं है, और प्रतिनिधित्व के लिए नालसा (15100) की ओर भेजता है।", "ਇਹ ਕਾਨੂੰਨ ਸਮਝਾਉਂਦਾ ਹੈ। ਇਹ ਵਕੀਲ ਨਹੀਂ ਹੈ, ਅਤੇ ਪ੍ਰਤੀਨਿਧਤਾ ਲਈ ਨਾਲਸਾ (15100) ਵੱਲ ਭੇਜਦਾ ਹੈ।"]],
  ];

  const bench = [
    ["var(--c-gold)", ["Top-3 retrieval", "शीर्ष-3 रिट्रीवल", "ਚੋਟੀ-3 ਰਿਟ੍ਰੀਵਲ"], ["Right section found in the first 3 results", "सही धारा पहले 3 परिणामों में मिली", "ਸਹੀ ਧਾਰਾ ਪਹਿਲੇ 3 ਨਤੀਜਿਆਂ ਵਿੱਚ ਮਿਲੀ"], ev ? pct(ev.hit3) : null],
    ["var(--c-green)", ["Top-5 retrieval", "शीर्ष-5 रिट्रीवल", "ਚੋਟੀ-5 ਰਿਟ੍ਰੀਵਲ"], ["Right section found in the first 5 results", "सही धारा पहले 5 परिणामों में मिली", "ਸਹੀ ਧਾਰਾ ਪਹਿਲੇ 5 ਨਤੀਜਿਆਂ ਵਿੱਚ ਮਿਲੀ"], ev ? pct(ev.hit5) : null],
    ["var(--c-blue)", ["Out-of-scope refusal", "दायरे से बाहर पर इनकार", "ਦਾਇਰੇ ਤੋਂ ਬਾਹਰ 'ਤੇ ਇਨਕਾਰ"], ["Off-topic questions the assistant declined", "बाहर के प्रश्न जिन्हें सहायक ने मना किया", "ਬਾਹਰਲੇ ਸਵਾਲ ਜਿਨ੍ਹਾਂ ਤੋਂ ਸਹਾਇਕ ਨੇ ਮਨ੍ਹਾ ਕੀਤਾ"], ev && ev.out_total ? ev.refused + " / " + ev.out_total : null],
    ["var(--c-purple)", ["Mean reciprocal rank", "औसत व्युत्क्रम रैंक", "ਔਸਤ ਉਲਟ ਦਰਜਾ"], ["How high the right section ranks (1.0 is best)", "सही धारा कितनी ऊपर आती है (1.0 सर्वश्रेष्ठ)", "ਸਹੀ ਧਾਰਾ ਕਿੰਨੀ ਉੱਪਰ ਆਉਂਦੀ ਹੈ (1.0 ਸਭ ਤੋਂ ਵਧੀਆ)"], ev && typeof ev.mrr === "number" ? ev.mrr.toFixed(2) : null],
  ];

  return (
    <div className="space-y-8">
      <section className="hero-bg card card-accent card-raised px-5 py-8 sm:px-10">
        <span className="tone-badge rise" style={{ "--tone": "var(--c-green)" }}>
          <ShieldCheck size={12} />
          {tr("Public good and citizen empowerment", "जन-हित और नागरिक सशक्तिकरण", "ਜਨ-ਹਿੱਤ ਅਤੇ ਨਾਗਰਿਕ ਸਸ਼ਕਤੀਕਰਨ")}
        </span>
        <h1 className="rise mt-3 text-3xl font-bold sm:text-4xl" style={{ animationDelay: "60ms" }}>
          {tr("NyayaSahayak AI Safety Charter", "न्यायसहायक एआई सुरक्षा चार्टर", "ਨਿਆਂਸਹਾਇਕ ਏਆਈ ਸੁਰੱਖਿਆ ਚਾਰਟਰ")}
        </h1>
        <p className="rise mt-2 max-w-2xl text-muted" style={{ animationDelay: "120ms" }}>
          {tr(
            "A legal information tool must be honest about what it knows. This charter explains how the assistant is kept grounded, careful and private.",
            "कानूनी जानकारी देने वाला उपकरण अपनी जानकारी को लेकर ईमानदार होना चाहिए। यह चार्टर बताता है कि सहायक को आधारित, सतर्क और निजी कैसे रखा जाता है।",
            "ਕਾਨੂੰਨੀ ਜਾਣਕਾਰੀ ਦੇਣ ਵਾਲਾ ਸਾਧਨ ਆਪਣੀ ਜਾਣਕਾਰੀ ਬਾਰੇ ਇਮਾਨਦਾਰ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ। ਇਹ ਚਾਰਟਰ ਦੱਸਦਾ ਹੈ ਕਿ ਸਹਾਇਕ ਨੂੰ ਆਧਾਰਿਤ, ਸਾਵਧਾਨ ਅਤੇ ਨਿੱਜੀ ਕਿਵੇਂ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ।"
          )}
        </p>
      </section>

      <section className="card tone-card p-6" style={{ "--tone": "var(--c-gold)" }}>
        <div className="eyebrow flex items-center gap-1.5">
          <Scale size={13} />
          {tr("Constitutional mandate and public purpose", "संवैधानिक अधिदेश और जन-उद्देश्य", "ਸੰਵਿਧਾਨਕ ਆਦੇਸ਼ ਅਤੇ ਜਨਤਕ ਉਦੇਸ਼")}
        </div>
        <h2 className="mt-1 text-2xl font-bold">
          {tr("Equal justice and free legal aid (Articles 21 and 39A)", "समान न्याय और निःशुल्क विधिक सहायता (अनुच्छेद 21 और 39A)", "ਬਰਾਬਰ ਨਿਆਂ ਅਤੇ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ (ਅਨੁਛੇਦ 21 ਅਤੇ 39A)")}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          {tr(
            "Article 39A directs the State to ensure that the legal system promotes justice on the basis of equal opportunity, including free legal aid. NyayaSahayak aims to narrow the knowledge gap that stops many citizens from using these guarantees.",
            "अनुच्छेद 39A राज्य को निर्देश देता है कि कानूनी व्यवस्था समान अवसर के आधार पर न्याय को बढ़ावा दे, जिसमें निःशुल्क विधिक सहायता शामिल है। न्यायसहायक उस जानकारी की खाई को घटाना चाहता है जो कई नागरिकों को इन गारंटियों का उपयोग करने से रोकती है।",
            "ਅਨੁਛੇਦ 39A ਰਾਜ ਨੂੰ ਹਦਾਇਤ ਦਿੰਦਾ ਹੈ ਕਿ ਕਾਨੂੰਨੀ ਪ੍ਰਣਾਲੀ ਬਰਾਬਰ ਮੌਕੇ ਦੇ ਆਧਾਰ 'ਤੇ ਨਿਆਂ ਨੂੰ ਉਤਸ਼ਾਹਿਤ ਕਰੇ, ਜਿਸ ਵਿੱਚ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਸ਼ਾਮਲ ਹੈ। ਨਿਆਂਸਹਾਇਕ ਉਸ ਜਾਣਕਾਰੀ ਦੇ ਪਾੜੇ ਨੂੰ ਘਟਾਉਣਾ ਚਾਹੁੰਦਾ ਹੈ ਜੋ ਕਈ ਨਾਗਰਿਕਾਂ ਨੂੰ ਇਨ੍ਹਾਂ ਗਰੰਟੀਆਂ ਦੀ ਵਰਤੋਂ ਤੋਂ ਰੋਕਦੀ ਹੈ।"
          )}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {mandate.map(([tone, t, d], i) => (
            <div key={i} className="card tone-card zoom-hover-sm p-3" style={{ "--tone": tone }}>
              <div className="text-sm font-bold tone-text">{tr(...t)}</div>
              <div className="mt-0.5 text-xs text-muted">{tr(...d)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-2xl font-bold">
          {tr("Retrieval-augmented generation (RAG) architecture", "रिट्रीवल-ऑगमेंटेड जनरेशन (आरएजी) संरचना", "ਰਿਟ੍ਰੀਵਲ-ਆਗਮੈਂਟਡ ਜਨਰੇਸ਼ਨ (ਆਰਏਜੀ) ਢਾਂਚਾ")}
        </h2>
        <p className="mb-4 text-sm text-muted">
          {tr("How an answer is built from the law, in three stages.", "कानून से उत्तर तीन चरणों में कैसे बनता है।", "ਕਾਨੂੰਨ ਤੋਂ ਜਵਾਬ ਤਿੰਨ ਪੜਾਵਾਂ ਵਿੱਚ ਕਿਵੇਂ ਬਣਦਾ ਹੈ।")}
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {stages.map(([Icon, tone, t, d], i) => (
            <Reveal key={i} delay={i * 90} className="h-full">
              <div className="card tone-card zoom-hover group h-full p-4" style={{ "--tone": tone }}>
                <span className="tone-icon">
                  <Icon size={20} className="icon-pop" />
                </span>
                <h3 className="mt-3 text-base font-bold">{tr(...t)}</h3>
                <p className="mt-1 text-sm text-muted">{tr(...d)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <div className="eyebrow flex items-center gap-1.5" style={{ "--tone": "var(--c-green)" }}>
          <Lock size={13} />
          {tr("Citizen protection charter", "नागरिक सुरक्षा चार्टर", "ਨਾਗਰਿਕ ਸੁਰੱਖਿਆ ਚਾਰਟਰ")}
        </div>
        <h2 className="mb-4 mt-1 text-2xl font-bold">
          {tr("Core safeguards", "मुख्य सुरक्षा उपाय", "ਮੁੱਖ ਸੁਰੱਖਿਆ ਉਪਾਅ")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {guards.map(([Icon, tone, t, d], i) => (
            <Reveal key={i} delay={(i % 2) * 90} className="h-full">
              <div className="card tone-card zoom-hover-sm group h-full p-4" style={{ "--tone": tone }}>
                <div className="flex items-center gap-2 font-bold tone-text">
                  <Icon size={17} className="icon-pop" />
                  {tr(...t)}
                </div>
                <p className="mt-1.5 text-sm text-muted">{tr(...d)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="card card-accent p-6">
        <div className="eyebrow flex items-center gap-1.5">
          <Award size={13} />
          {tr("Empirical benchmark", "अनुभवजन्य बेंचमार्क", "ਅਨੁਭਵੀ ਬੈਂਚਮਾਰਕ")}
        </div>
        <h2 className="mt-1 text-2xl font-bold">
          {ev
            ? tr("Tested on " + ev.n + " labelled questions", ev.n + " लेबल वाले प्रश्नों पर परीक्षित", ev.n + " ਲੇਬਲ ਵਾਲੇ ਸਵਾਲਾਂ 'ਤੇ ਪਰਖਿਆ")
            : tr("Evaluation results", "मूल्यांकन परिणाम", "ਮੁਲਾਂਕਣ ਨਤੀਜੇ")}
        </h2>
        {ev ? (
          ev.date && <p className="mono-line mt-1">{ev.date}</p>
        ) : (
          <p className="mt-1 text-sm text-muted">
            {tr(
              "These figures appear once the labelled evaluation set has been run. Nothing is shown until real results exist.",
              "ये आँकड़े लेबल वाले मूल्यांकन सेट को चलाने के बाद दिखेंगे। असली परिणाम आने तक कुछ नहीं दिखाया जाता।",
              "ਇਹ ਅੰਕੜੇ ਲੇਬਲ ਵਾਲਾ ਮੁਲਾਂਕਣ ਸੈੱਟ ਚਲਾਉਣ ਤੋਂ ਬਾਅਦ ਦਿਸਣਗੇ। ਅਸਲ ਨਤੀਜੇ ਆਉਣ ਤੱਕ ਕੁਝ ਨਹੀਂ ਦਿਖਾਇਆ ਜਾਂਦਾ।"
            )}
          </p>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bench.map(([tone, t, d, v], i) => (
            <div key={i} className="card tone-card zoom-hover-sm p-4 text-center" style={{ "--tone": tone }}>
              <div className="font-display text-3xl font-bold tone-text">
                {v ?? tr("Pending", "प्रतीक्षित", "ਬਕਾਇਆ")}
              </div>
              <div className="text-sm font-bold">{tr(...t)}</div>
              <div className="mt-1 text-xs text-muted">{tr(...d)}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="card p-6"
        style={{ borderColor: "var(--c-rose)", background: "color-mix(in srgb, var(--c-rose) 10%, var(--card))" }}
      >
        <h2 className="flex items-center gap-2 text-lg font-bold" style={{ color: "var(--c-rose)" }}>
          <AlertTriangle size={18} />
          {tr("Statutory boundary and disclaimer", "कानूनी सीमा और अस्वीकरण", "ਕਾਨੂੰਨੀ ਸੀਮਾ ਅਤੇ ਬੇਦਾਅਵਾ")}
        </h2>
        <p className="mt-2 text-sm">
          {tr(
            "NyayaSahayak is an automated legal information system for legal literacy and awareness. It does not provide legal advice or representation and does not create an advocate-client relationship. For representation, contact the National Legal Services Authority on 15100 or your nearest District Legal Services Authority.",
            "न्यायसहायक कानूनी साक्षरता और जागरूकता के लिए एक स्वचालित कानूनी जानकारी प्रणाली है। यह कानूनी सलाह या प्रतिनिधित्व नहीं देता और वकील-मुवक्किल संबंध नहीं बनाता। प्रतिनिधित्व के लिए राष्ट्रीय विधिक सेवा प्राधिकरण को 15100 पर या अपने निकटतम ज़िला विधिक सेवा प्राधिकरण से संपर्क करें।",
            "ਨਿਆਂਸਹਾਇਕ ਕਾਨੂੰਨੀ ਸਾਖਰਤਾ ਅਤੇ ਜਾਗਰੂਕਤਾ ਲਈ ਇੱਕ ਸਵੈਚਾਲਿਤ ਕਾਨੂੰਨੀ ਜਾਣਕਾਰੀ ਪ੍ਰਣਾਲੀ ਹੈ। ਇਹ ਕਾਨੂੰਨੀ ਸਲਾਹ ਜਾਂ ਪ੍ਰਤੀਨਿਧਤਾ ਨਹੀਂ ਦਿੰਦਾ ਅਤੇ ਵਕੀਲ-ਮੁਵੱਕਿਲ ਸੰਬੰਧ ਨਹੀਂ ਬਣਾਉਂਦਾ। ਪ੍ਰਤੀਨਿਧਤਾ ਲਈ ਰਾਸ਼ਟਰੀ ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਅਥਾਰਟੀ ਨੂੰ 15100 'ਤੇ ਜਾਂ ਆਪਣੀ ਨੇੜਲੀ ਜ਼ਿਲ੍ਹਾ ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਅਥਾਰਟੀ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।"
          )}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="tel:15100" className="btn btn-primary btn-sm">
            <HeartHandshake size={14} />
            {tr("Call 15100", "15100 पर कॉल करें", "15100 'ਤੇ ਕਾਲ ਕਰੋ")}
          </a>
          <Link to="/legal-aid" className="btn btn-ghost btn-sm">
            {tr("Check free legal aid", "निःशुल्क विधिक सहायता जाँचें", "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਜਾਂਚੋ")}
          </Link>
          <Link to="/official" className="btn btn-ghost btn-sm">
            <Library size={14} />
            {tr("See the sources", "स्रोत देखें", "ਸਰੋਤ ਵੇਖੋ")}
          </Link>
        </div>
      </section>
    </div>
  );
}