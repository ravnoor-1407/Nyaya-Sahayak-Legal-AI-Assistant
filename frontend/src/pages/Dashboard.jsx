import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Sparkles, Search, Library, FileText, BookOpen, HeartHandshake, Phone,
  ShieldCheck, Mail, Languages, Scale, TrendingUp, Lock, RotateCcw, LogIn, UserPlus,
} from "lucide-react";
import { useLang } from "../LangContext";
import { useAuth } from "../AuthContext";
import { getJSON } from "../api";
import CountUp from "../components/CountUp";
import Reveal from "../components/Reveal";

const COLORS = ["var(--c-gold)", "var(--c-blue)", "var(--c-green)", "var(--c-purple)", "var(--c-rose)"];

const LANG_NAMES = { en: "English", hi: "हिंदी", pa: "ਪੰਜਾਬੀ" };

const ACT_SHORT = {
  "Bharatiya Nyaya Sanhita": "BNS",
  "Bharatiya Nagarik Suraksha Sanhita": "BNSS",
  "Bharatiya Sakshya Adhiniyam": "BSA",
  "Information Technology Act": "IT Act",
  "Consumer Protection Act": "Consumer Act",
  "Constitution of India": "Constitution",
  "IPC to BNS Mapping": "IPC to BNS table",
};

const TOPIC = {
  constitutional: ["Constitutional", "संवैधानिक", "ਸੰਵਿਧਾਨਕ"],
  criminal: ["Criminal", "आपराधिक", "ਅਪਰਾਧਿਕ"],
  cyber: ["Cyber", "साइबर", "ਸਾਈਬਰ"],
  consumer: ["Consumer", "उपभोक्ता", "ਖਪਤਕਾਰ"],
  evidence: ["Evidence", "साक्ष्य", "ਸਬੂਤ"],
  blocked: ["Declined requests", "अस्वीकृत अनुरोध", "ਰੱਦ ਕੀਤੀਆਂ ਬੇਨਤੀਆਂ"],
  support: ["Support redirects", "सहायता निर्देश", "ਸਹਾਇਤਾ ਹਵਾਲੇ"],
  general: ["General", "सामान्य", "ਆਮ"],
};

// Accepts [{name, value}], [{label, count}] or {name: count} and returns [{name, value}]
function rows(x) {
  if (!x) return [];
  if (Array.isArray(x)) {
    return x
      .map((r) => ({
        name: String(r.name ?? r.label ?? r.topic ?? r.act ?? r.lang ?? r.language ?? ""),
        value: Number(r.value ?? r.count ?? r.total ?? 0),
      }))
      .filter((r) => r.name);
  }
  if (typeof x === "object") {
    return Object.entries(x)
      .filter(([, v]) => typeof v === "number")
      .map(([name, value]) => ({ name, value }));
  }
  return [];
}

function Chart({ title, data }) {
  const { tr } = useLang();
  return (
    <Reveal className="card p-5">
      <h3 className="mb-3 text-base font-bold">{title}</h3>
      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          {tr("No data yet. Ask a few questions first.", "अभी डेटा नहीं है। पहले कुछ प्रश्न पूछिए।", "ਹਾਲੇ ਡੇਟਾ ਨਹੀਂ ਹੈ। ਪਹਿਲਾਂ ਕੁਝ ਸਵਾਲ ਪੁੱਛੋ।")}
        </p>
      ) : (
        <div style={{ width: "100%", height: Math.max(200, data.length * 34) }}>
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke="var(--muted)" fontSize={12} />
              <YAxis type="category" dataKey="name" width={130} stroke="var(--muted)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, color: "var(--ink)" }}
                cursor={{ fill: "var(--accent-soft)" }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Reveal>
  );
}

export default function Dashboard() {
  const { tr } = useLang();
  const { user, ready } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);

  // Loads when the page opens, when you sign in or out, when you come back to
  // this tab, and when you press refresh.
  const uid = user ? user.id : 0;
  useEffect(() => {
    if (!ready) return undefined;
    let alive = true;
    let timer;
    const load = () => {
      getJSON("/api/stats")
        .then((s) => {
          if (alive) {
            setStats(s);
            setError(false);
          }
        })
        .catch(() => {
          if (alive) {
            setError(true);
            timer = setTimeout(load, 4000);
          }
        });
    };
    setStats(null);
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [ready, uid, tick]);

  const s = stats || {};
  const personal = s.signed_in === true;
  const corpus = s.corpus || {};
  const fb = s.feedback || {};
  const up = Number(fb.up ?? 0);
  const down = Number(fb.down ?? 0);
  const score = up + down > 0 ? Math.round((up / (up + down)) * 100) : null;

  const cards = [
    [corpus.acts ?? "–", tr("Acts indexed", "अधिनियम शामिल", "ਸ਼ਾਮਲ ਐਕਟ"), "var(--c-gold)", ""],
    [corpus.sections ?? "–", tr("Passages indexed", "शामिल अंश", "ਸ਼ਾਮਲ ਅੰਸ਼"), "var(--c-green)", ""],
    [personal ? s.total : "–", tr("Your questions", "आपके प्रश्न", "ਤੁਹਾਡੇ ਸਵਾਲ"), "var(--c-blue)", ""],
    [personal && score !== null ? score : "–", tr("Rated helpful", "उपयोगी रेटिंग", "ਲਾਭਦਾਇਕ ਰੇਟਿੰਗ"), "var(--c-purple)", personal && score !== null ? "%" : ""],
  ];

  const features = [
    { to: "/assistant", icon: Sparkles, tone: "var(--c-gold)", title: ["AI Legal Assistant", "एआई कानूनी सहायक", "ਏਆਈ ਕਾਨੂੰਨੀ ਸਹਾਇਕ"], text: ["Ask in English, Hindi or Punjabi and get an answer with Act and section citations.", "अंग्रेज़ी, हिंदी या पंजाबी में पूछिए और अधिनियम व धारा के हवाले सहित उत्तर पाइए।", "ਅੰਗਰੇਜ਼ੀ, ਹਿੰਦੀ ਜਾਂ ਪੰਜਾਬੀ ਵਿੱਚ ਪੁੱਛੋ ਅਤੇ ਐਕਟ ਤੇ ਧਾਰਾ ਦੇ ਹਵਾਲਿਆਂ ਸਮੇਤ ਜਵਾਬ ਲਓ।"], cta: ["Open assistant", "सहायक खोलें", "ਸਹਾਇਕ ਖੋਲ੍ਹੋ"] },
    { to: "/search", icon: Search, tone: "var(--c-green)", title: ["Law Search", "कानून खोज", "ਕਾਨੂੰਨ ਖੋਜ"], text: ["Search by topic or section number and read the exact passage.", "विषय या धारा संख्या से खोजें और सटीक अंश पढ़ें।", "ਵਿਸ਼ੇ ਜਾਂ ਧਾਰਾ ਨੰਬਰ ਨਾਲ ਖੋਜੋ ਅਤੇ ਸਹੀ ਅੰਸ਼ ਪੜ੍ਹੋ।"], cta: ["Search laws", "कानून खोजें", "ਕਾਨੂੰਨ ਖੋਜੋ"] },
    { to: "/acts", icon: Library, tone: "var(--c-blue)", title: ["Acts browser", "अधिनियम ब्राउज़र", "ਐਕਟ ਬ੍ਰਾਊਜ਼ਰ"], text: ["Open any indexed Act and scroll through its sections.", "कोई भी शामिल अधिनियम खोलें और उसकी धाराएँ देखें।", "ਕੋਈ ਵੀ ਸ਼ਾਮਲ ਐਕਟ ਖੋਲ੍ਹੋ ਅਤੇ ਉਸਦੀਆਂ ਧਾਰਾਵਾਂ ਵੇਖੋ।"], cta: ["Browse Acts", "अधिनियम देखें", "ਐਕਟ ਵੇਖੋ"] },
    { to: "/official", icon: FileText, tone: "var(--c-rose)", title: ["Official Acts", "आधिकारिक अधिनियम", "ਅਧਿਕਾਰਤ ਐਕਟ"], text: ["Issuing authority, dates and a link to the official source for each Act.", "हर अधिनियम के जारीकर्ता, तिथियाँ और आधिकारिक स्रोत का लिंक।", "ਹਰ ਐਕਟ ਦੇ ਜਾਰੀਕਰਤਾ, ਤਰੀਕਾਂ ਅਤੇ ਅਧਿਕਾਰਤ ਸਰੋਤ ਦਾ ਲਿੰਕ।"], cta: ["View registry", "रजिस्ट्री देखें", "ਰਜਿਸਟਰੀ ਵੇਖੋ"] },
    { to: "/hub", icon: BookOpen, tone: "var(--c-gold)", title: ["Citizen Hub", "नागरिक केंद्र", "ਨਾਗਰਿਕ ਕੇਂਦਰ"], text: ["Step-by-step handbooks for arrest, FIR, RTI, consumer and cyber problems.", "गिरफ्तारी, एफआईआर, आरटीआई, उपभोक्ता और साइबर समस्याओं के चरण-दर-चरण मार्गदर्शन।", "ਗ੍ਰਿਫ਼ਤਾਰੀ, ਐਫ਼ਆਈਆਰ, ਆਰਟੀਆਈ, ਖਪਤਕਾਰ ਅਤੇ ਸਾਈਬਰ ਸਮੱਸਿਆਵਾਂ ਲਈ ਕਦਮ-ਦਰ-ਕਦਮ ਗਾਈਡ।"], cta: ["Read handbooks", "मार्गदर्शिकाएँ पढ़ें", "ਗਾਈਡ ਪੜ੍ਹੋ"] },
    { to: "/legal-aid", icon: HeartHandshake, tone: "var(--c-green)", title: ["Free Legal Aid Checker", "निःशुल्क विधिक सहायता जाँच", "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਜਾਂਚ"], text: ["Find out if you qualify for a free lawyer under Section 12.", "जानिए कि क्या आप धारा 12 के तहत निःशुल्क वकील के पात्र हैं।", "ਜਾਣੋ ਕਿ ਕੀ ਤੁਸੀਂ ਧਾਰਾ 12 ਅਧੀਨ ਮੁਫ਼ਤ ਵਕੀਲ ਲਈ ਯੋਗ ਹੋ।"], cta: ["Launch checker", "जाँच शुरू करें", "ਜਾਂਚ ਸ਼ੁਰੂ ਕਰੋ"] },
    { to: "/helplines", icon: Phone, tone: "var(--c-purple)", title: ["Helplines", "हेल्पलाइन", "ਹੈਲਪਲਾਈਨ"], text: ["Searchable emergency and legal helplines with tap-to-call.", "खोजने योग्य आपातकालीन और कानूनी हेल्पलाइन, एक टैप में कॉल।", "ਖੋਜਣ ਯੋਗ ਐਮਰਜੈਂਸੀ ਅਤੇ ਕਾਨੂੰਨੀ ਹੈਲਪਲਾਈਨ, ਇੱਕ ਟੈਪ ਵਿੱਚ ਕਾਲ।"], cta: ["See helplines", "हेल्पलाइन देखें", "ਹੈਲਪਲਾਈਨ ਵੇਖੋ"] },
    { to: "/charter", icon: ShieldCheck, tone: "var(--c-blue)", title: ["AI Safety Charter", "एआई सुरक्षा चार्टर", "ਏਆਈ ਸੁਰੱਖਿਆ ਚਾਰਟਰ"], text: ["How the assistant stays grounded, honest and private.", "सहायक कैसे आधारित, ईमानदार और निजी रहता है।", "ਸਹਾਇਕ ਕਿਵੇਂ ਆਧਾਰਿਤ, ਇਮਾਨਦਾਰ ਅਤੇ ਨਿੱਜੀ ਰਹਿੰਦਾ ਹੈ।"], cta: ["Read charter", "चार्टर पढ़ें", "ਚਾਰਟਰ ਪੜ੍ਹੋ"] },
    { to: "/contact", icon: Mail, tone: "var(--c-rose)", title: ["Contact and inquiries", "संपर्क और पूछताछ", "ਸੰਪਰਕ ਅਤੇ ਪੁੱਛਗਿੱਛ"], text: ["Send feedback or a question to the project team.", "परियोजना टीम को प्रतिक्रिया या प्रश्न भेजें।", "ਪ੍ਰੋਜੈਕਟ ਟੀਮ ਨੂੰ ਫੀਡਬੈਕ ਜਾਂ ਸਵਾਲ ਭੇਜੋ।"], cta: ["Contact us", "संपर्क करें", "ਸੰਪਰਕ ਕਰੋ"] },
  ];

  const bookmarks = [
    [["Fundamental right", "मौलिक अधिकार", "ਮੌਲਿਕ ਅਧਿਕਾਰ"], "Article 21: Protection of life and personal liberty", ["Constitution of India", "भारत का संविधान", "ਭਾਰਤ ਦਾ ਸੰਵਿਧਾਨ"], "What does Article 21 protect?", "var(--c-gold)"],
    [["Arrest rights", "गिरफ्तारी अधिकार", "ਗ੍ਰਿਫ਼ਤਾਰੀ ਅਧਿਕਾਰ"], "Article 22: Protection against arrest and detention", ["Constitution of India", "भारत का संविधान", "ਭਾਰਤ ਦਾ ਸੰਵਿਧਾਨ"], "What does Article 22 say about arrest?", "var(--c-rose)"],
    [["FIR procedure", "एफआईआर प्रक्रिया", "ਐਫ਼ਆਈਆਰ ਪ੍ਰਕਿਰਿਆ"], "Section 173: Information in cognizable cases (FIR)", ["Bharatiya Nagarik Suraksha Sanhita, 2023", "भारतीय नागरिक सुरक्षा संहिता, 2023", "ਭਾਰਤੀ ਨਾਗਰਿਕ ਸੁਰੱਖਿਆ ਸੰਹਿਤਾ, 2023"], "How is an FIR registered under BNSS Section 173?", "var(--c-blue)"],
    [["Government transparency", "सरकारी पारदर्शिता", "ਸਰਕਾਰੀ ਪਾਰਦਰਸ਼ਤਾ"], "Section 7(1): Disposal of request (RTI 30-day window)", ["Right to Information Act, 2005", "सूचना का अधिकार अधिनियम, 2005", "ਸੂਚਨਾ ਦਾ ਅਧਿਕਾਰ ਐਕਟ, 2005"], "What is the time limit to answer an RTI request?", "var(--c-green)"],
  ];

  const topicName = (k) => (TOPIC[k] ? tr(...TOPIC[k]) : k);
  const actName = (k) => {
    const base = String(k).split(",")[0];
    return ACT_SHORT[base] || base;
  };

  const topics = rows(s.by_topic).map((r) => ({ name: topicName(r.name), value: r.value }));
  const langs = rows(s.by_lang).map((r) => ({ name: LANG_NAMES[r.name] || r.name, value: r.value }));
  const acts = rows(s.by_act).map((r) => ({ name: actName(r.name), value: r.value }));
  const recent = Array.isArray(s.recent) ? s.recent : [];
  const firstName = user ? user.name.split(" ")[0] : "";
  const displayName = firstName || (user ? user.name : "");
  const initials = user
    ? user.name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "";

  return (
    <div className="space-y-8">
      <section className="hero-bg card card-accent card-raised px-5 py-8 sm:px-10">
        {user && (
          <div className="rise mb-4 flex items-center gap-2.5">
            <span className="btn-primary grid h-7 w-7 place-items-center rounded-full text-xs font-bold shrink-0 shadow-sm">
              {initials}
            </span>
            <span className="text-sm font-bold text-accent">
              {tr("Hello", "नमस्ते", "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ")} {displayName}!
            </span>
            <span className="hidden sm:inline text-xs text-muted">
              • {tr("Welcome to your operations overview", "आपके संचालन विवरण में स्वागत है", "ਤੁਹਾਡੇ ਸੰਚਾਲਨ ਵੇਰਵੇ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ")}
            </span>
          </div>
        )}
        <span className="tone-badge rise" style={{ "--tone": "var(--c-blue)" }}>
          <TrendingUp size={12} />
          {tr("Citizen legal empowerment and analytics", "नागरिक कानूनी सशक्तिकरण और विश्लेषण", "ਨਾਗਰਿਕ ਕਾਨੂੰਨੀ ਸਸ਼ਕਤੀਕਰਨ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ")}
        </span>
        <h1 className="rise mt-3 text-3xl font-bold sm:text-4xl" style={{ animationDelay: "60ms" }}>
          {tr("Citizen justice operations dashboard", "नागरिक न्याय संचालन डैशबोर्ड", "ਨਾਗਰਿਕ ਨਿਆਂ ਸੰਚਾਲਨ ਡੈਸ਼ਬੋਰਡ")}
        </h1>
        <p className="rise mt-2 max-w-2xl text-muted" style={{ animationDelay: "120ms" }}>
          {tr(
            "Everything this site offers in one place, plus your own usage and coverage once you sign in.",
            "इस साइट की सभी सुविधाएँ एक जगह, और साइन इन करने पर आपका अपना उपयोग और कवरेज।",
            "ਇਸ ਸਾਈਟ ਦੀਆਂ ਸਾਰੀਆਂ ਸਹੂਲਤਾਂ ਇੱਕ ਥਾਂ, ਅਤੇ ਸਾਈਨ ਇਨ ਕਰਨ 'ਤੇ ਤੁਹਾਡੀ ਆਪਣੀ ਵਰਤੋਂ ਅਤੇ ਕਵਰੇਜ।"
          )}
        </p>
        {error && (
          <p className="mt-3 text-sm" style={{ color: "var(--danger)" }}>
            {tr("Backend not reachable. Retrying…", "बैकएंड नहीं मिल रहा। फिर कोशिश हो रही है…", "ਬੈਕਐਂਡ ਨਹੀਂ ਮਿਲ ਰਿਹਾ। ਮੁੜ ਕੋਸ਼ਿਸ਼ ਹੋ ਰਹੀ ਹੈ…")}
          </p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([v, label, tone, suffix], i) => (
          <Reveal key={i} delay={i * 80} className="h-full">
            <div className="card tone-card zoom-hover-sm h-full p-4 text-center" style={{ "--tone": tone }}>
              <div className="font-display text-3xl font-bold tone-text">
                <CountUp value={v} />
                {suffix}
              </div>
              <div className="text-xs font-semibold text-muted">{label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <section className="card p-5 sm:p-6">
        <h2 className="text-2xl font-bold">
          {tr("Citizen legal services quick action hub", "नागरिक कानूनी सेवाएँ त्वरित कार्य केंद्र", "ਨਾਗਰਿਕ ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਤੁਰੰਤ ਕਾਰਵਾਈ ਕੇਂਦਰ")}
        </h2>
        <p className="mb-4 text-sm text-muted">
          {tr("Direct access to every tool on the site.", "साइट के हर उपकरण तक सीधी पहुँच।", "ਸਾਈਟ ਦੇ ਹਰ ਸਾਧਨ ਤੱਕ ਸਿੱਧੀ ਪਹੁੰਚ।")}
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.to} delay={(i % 3) * 80} className="h-full">
              <div className="card tone-card zoom-hover group flex h-full flex-col p-4" style={{ "--tone": f.tone }}>
                <span className="tone-icon">
                  <f.icon size={20} className="icon-pop" />
                </span>
                <h3 className="mt-3 text-base font-bold">{tr(...f.title)}</h3>
                <p className="mt-1 flex-1 text-sm text-muted">{tr(...f.text)}</p>
                <button type="button" className="btn btn-primary btn-sm mt-3" onClick={() => nav(f.to)}>
                  {tr(...f.cta)}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
          <Languages size={14} className="text-accent" />
          {tr(
            "Also: English, Hindi and Punjabi interface, dark and light themes, voice input and read-aloud answers.",
            "साथ में: अंग्रेज़ी, हिंदी और पंजाबी इंटरफ़ेस, डार्क व लाइट थीम, आवाज़ से प्रश्न और उत्तर सुनना।",
            "ਨਾਲ ਹੀ: ਅੰਗਰੇਜ਼ੀ, ਹਿੰਦੀ ਅਤੇ ਪੰਜਾਬੀ ਇੰਟਰਫੇਸ, ਡਾਰਕ ਤੇ ਲਾਈਟ ਥੀਮ, ਆਵਾਜ਼ ਨਾਲ ਸਵਾਲ ਅਤੇ ਜਵਾਬ ਸੁਣਨਾ।"
          )}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Scale size={20} className="text-accent" />
          {tr("Essential constitutional and statutory bookmarks", "आवश्यक संवैधानिक और वैधानिक बुकमार्क", "ਜ਼ਰੂਰੀ ਸੰਵਿਧਾਨਕ ਅਤੇ ਕਾਨੂੰਨੀ ਬੁੱਕਮਾਰਕ")}
        </h2>
        <p className="mb-4 text-sm text-muted">
          {tr("Click one to ask the assistant.", "सहायक से पूछने के लिए किसी एक पर दबाइए।", "ਸਹਾਇਕ ਤੋਂ ਪੁੱਛਣ ਲਈ ਕਿਸੇ ਇੱਕ 'ਤੇ ਦਬਾਓ।")}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {bookmarks.map(([tag, title, act, q, tone], i) => (
            <button
              key={i}
              type="button"
              onClick={() => nav("/assistant", { state: { q } })}
              className="card tone-card zoom-hover group p-4 text-left"
              style={{ "--tone": tone }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="tone-badge font-mono">{tr(...tag)}</span>
                <Sparkles size={15} className="icon-pop tone-text" />
              </div>
              <div className="mt-2 font-bold">{title}</div>
              <div className="text-sm text-muted">{tr(...act)}</div>
            </button>
          ))}
        </div>
      </section>

      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">
              {personal
                ? tr("Your usage and coverage", "आपका उपयोग और कवरेज", "ਤੁਹਾਡੀ ਵਰਤੋਂ ਅਤੇ ਕਵਰੇਜ")
                : tr("Usage and coverage", "उपयोग और कवरेज", "ਵਰਤੋਂ ਅਤੇ ਕਵਰੇਜ")}
            </h2>
            {user && (
              <p className="text-sm text-muted">
                {tr("Signed in as ", "साइन इन: ", "ਸਾਈਨ ਇਨ: ")}
                <b className="text-ink">{user.name}</b>
                {tr(". Based on questions you asked while signed in.", "। साइन इन रहते पूछे गए आपके प्रश्नों पर आधारित।", "। ਸਾਈਨ ਇਨ ਰਹਿੰਦੇ ਪੁੱਛੇ ਤੁਹਾਡੇ ਸਵਾਲਾਂ 'ਤੇ ਆਧਾਰਿਤ।")}
              </p>
            )}
          </div>
          {user && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTick(tick + 1)}>
              <RotateCcw size={13} />
              {tr("Refresh", "ताज़ा करें", "ਤਾਜ਼ਾ ਕਰੋ")}
            </button>
          )}
        </div>

        {ready && !user && (
          <div className="card card-accent card-raised p-6 text-center sm:p-8">
            <span className="tone-icon mx-auto" style={{ "--tone": "var(--c-gold)" }}>
              <Lock size={20} />
            </span>
            <h3 className="mt-3 text-xl font-bold">
              {tr("Sign in to see your usage", "अपना उपयोग देखने के लिए साइन इन करें", "ਆਪਣੀ ਵਰਤੋਂ ਵੇਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ")}
            </h3>
            <p className="mx-auto mt-1 max-w-xl text-sm text-muted">
              {tr(
                "Topics, languages and Acts are tracked per account, and a new account starts from zero. Questions asked while signed out are not saved.",
                "विषय, भाषाएँ और अधिनियम हर खाते के लिए अलग दर्ज होते हैं, और नया खाता शून्य से शुरू होता है। साइन आउट रहते पूछे गए प्रश्न सहेजे नहीं जाते।",
                "ਵਿਸ਼ੇ, ਭਾਸ਼ਾਵਾਂ ਅਤੇ ਐਕਟ ਹਰ ਖਾਤੇ ਲਈ ਵੱਖਰੇ ਦਰਜ ਹੁੰਦੇ ਹਨ, ਅਤੇ ਨਵਾਂ ਖਾਤਾ ਸਿਫ਼ਰ ਤੋਂ ਸ਼ੁਰੂ ਹੁੰਦਾ ਹੈ। ਸਾਈਨ ਆਊਟ ਹੋਣ ਸਮੇਂ ਪੁੱਛੇ ਸਵਾਲ ਸੰਭਾਲੇ ਨਹੀਂ ਜਾਂਦੇ।"
              )}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link to="/auth" state={{ from: "/dashboard" }} className="btn btn-primary">
                <LogIn size={15} />
                {tr("Sign in", "साइन इन", "ਸਾਈਨ ਇਨ")}
              </Link>
              <Link to="/auth" state={{ from: "/dashboard", mode: "up" }} className="btn btn-ghost">
                <UserPlus size={15} />
                {tr("Create account", "खाता बनाएँ", "ਖਾਤਾ ਬਣਾਓ")}
              </Link>
            </div>
          </div>
        )}

        {user && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Chart title={tr("Questions by topic", "विषय के अनुसार प्रश्न", "ਵਿਸ਼ੇ ਅਨੁਸਾਰ ਸਵਾਲ")} data={topics} />
            <Chart title={tr("Languages used", "प्रयुक्त भाषाएँ", "ਵਰਤੀਆਂ ਭਾਸ਼ਾਵਾਂ")} data={langs} />
            <Chart title={tr("Most-referenced Acts", "सबसे अधिक संदर्भित अधिनियम", "ਸਭ ਤੋਂ ਵੱਧ ਹਵਾਲੇ ਵਾਲੇ ਐਕਟ")} data={acts} />
            <Reveal className="card p-5">
              <h3 className="mb-3 text-base font-bold">{tr("Recent questions", "हाल के प्रश्न", "ਹਾਲੀਆ ਸਵਾਲ")}</h3>
              {recent.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">
                  {tr("No questions yet. Ask the assistant something.", "अभी कोई प्रश्न नहीं। सहायक से कुछ पूछिए।", "ਹਾਲੇ ਕੋਈ ਸਵਾਲ ਨਹੀਂ। ਸਹਾਇਕ ਤੋਂ ਕੁਝ ਪੁੱਛੋ।")}
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {recent.slice(0, 8).map((r, i) => (
                    <li key={i} className="bg-surface-2 rounded-lg border px-3 py-2">
                      {typeof r === "string" ? r : r.question || r.q || JSON.stringify(r)}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          </div>
        )}
      </div>
    </div>
  );
}