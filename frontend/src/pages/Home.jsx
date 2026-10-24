import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Sparkles, Phone, HeartHandshake, BookOpen, Library,
  ShieldCheck, Volume2, Lock, Scale, RotateCcw,
} from "lucide-react";
import { useLang } from "../LangContext";
import { useAuth } from "../AuthContext";
import { chat, getJSON } from "../api";
import { FAQ } from "../data/faq";
import AnswerBlock from "../components/AnswerBlock";
import Reveal from "../components/Reveal";
import CountUp from "../components/CountUp";

const HELPLINES = [
  {
    num: "15100", tone: "var(--c-gold)",
    tag: ["TOLL-FREE", "टोल-फ्री", "ਟੋਲ-ਫ੍ਰੀ"],
    name: ["NALSA free legal aid", "नालसा निःशुल्क विधिक सहायता", "ਨਾਲਸਾ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ"],
    note: ["Free lawyer and court-fee waiver", "निःशुल्क वकील और अदालती शुल्क में छूट", "ਮੁਫ਼ਤ ਵਕੀਲ ਅਤੇ ਅਦਾਲਤੀ ਫੀਸ ਵਿੱਚ ਛੋਟ"],
  },
  {
    num: "1930", tone: "var(--c-blue)",
    tag: ["IMMEDIATE CALL", "तुरंत कॉल", "ਤੁਰੰਤ ਕਾਲ"],
    name: ["Cyber and banking fraud", "साइबर और बैंकिंग धोखाधड़ी", "ਸਾਈਬਰ ਅਤੇ ਬੈਂਕ ਧੋਖਾਧੜੀ"],
    note: ["Report UPI, OTP and net banking fraud at once", "यूपीआई, ओटीपी और नेट बैंकिंग धोखाधड़ी तुरंत बताएँ", "ਯੂਪੀਆਈ, ਓਟੀਪੀ ਅਤੇ ਨੈੱਟ ਬੈਂਕਿੰਗ ਧੋਖਾਧੜੀ ਤੁਰੰਤ ਦੱਸੋ"],
  },
  {
    num: "1915", tone: "var(--c-green)",
    tag: ["NATIONAL", "राष्ट्रीय", "ਰਾਸ਼ਟਰੀ"],
    name: ["National Consumer Helpline", "राष्ट्रीय उपभोक्ता हेल्पलाइन", "ਰਾਸ਼ਟਰੀ ਖਪਤਕਾਰ ਹੈਲਪਲਾਈਨ"],
    note: ["Defective goods, false ads, e-commerce scams", "खराब सामान, झूठे विज्ञापन, ई-कॉमर्स ठगी", "ਖ਼ਰਾਬ ਸਮਾਨ, ਝੂਠੇ ਇਸ਼ਤਿਹਾਰ, ਈ-ਕਾਮਰਸ ਠੱਗੀ"],
  },
  {
    num: "181", tone: "var(--c-purple)",
    tag: ["EMERGENCY", "आपातकाल", "ਐਮਰਜੈਂਸੀ"],
    name: ["Women in distress", "संकट में महिलाएँ", "ਸੰਕਟ ਵਿੱਚ ਔਰਤਾਂ"],
    note: ["Support for women facing violence or danger", "हिंसा या खतरे का सामना कर रही महिलाओं की सहायता", "ਹਿੰਸਾ ਜਾਂ ਖ਼ਤਰੇ ਦਾ ਸਾਹਮਣਾ ਕਰ ਰਹੀਆਂ ਔਰਤਾਂ ਦੀ ਮਦਦ"],
  },
];

const cacheKey = (lang, q) => "ns-prev:" + lang + ":" + q;

function Preview() {
  const { lang, tr } = useLang();
  const [sel, setSel] = useState(0);
  const [state, setState] = useState({ loading: true, data: null, error: false });
  const req = useRef(0);
  const loadedFor = useRef(null);
  const tabs = FAQ.slice(0, 4);

  const load = async (i) => {
    const id = ++req.current;
    const question = tr(...tabs[i].q);
    const key = cacheKey(lang, question);
    setSel(i);
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        setState({ loading: false, data: JSON.parse(cached), error: false });
        return;
      }
    } catch (e) {
      /* ignore */
    }
    setState({ loading: true, data: null, error: false });
    try {
      const data = await chat(question, lang);
      if (id !== req.current) return;
      if (data.answered) {
        try {
          sessionStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
          /* ignore */
        }
      }
      setState({ loading: false, data, error: false });
    } catch (e) {
      if (id === req.current) setState({ loading: false, data: null, error: true });
    }
  };

  useEffect(() => {
    if (loadedFor.current === lang) return;
    loadedFor.current = lang;
    load(0);
  }, [lang]);

  return (
    <div className="card card-accent card-raised floating-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="group flex items-center gap-2.5">
          <span className="logo-mark btn-primary grid h-9 w-9 place-items-center rounded-xl">
            <Scale size={17} />
          </span>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold">
              {tr("Nyaya AI Assistant (live preview)", "न्याय एआई सहायक (लाइव पूर्वावलोकन)", "ਨਿਆਂ ਏਆਈ ਸਹਾਇਕ (ਲਾਈਵ ਝਲਕ)")}
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--ok)" }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--ok)" }} />
              {tr("Grounded in indexed statutes", "शामिल कानूनों पर आधारित", "ਸ਼ਾਮਲ ਕਾਨੂੰਨਾਂ 'ਤੇ ਆਧਾਰਿਤ")}
            </div>
          </div>
        </div>
        <Link to="/assistant" className="text-xs font-semibold text-accent">
          {tr("Open full chat", "पूरी चैट खोलें", "ਪੂਰੀ ਚੈਟ ਖੋਲ੍ਹੋ")}
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tabs.map((t, i) => (
          <button
            key={i}
            type="button"
            onClick={() => load(i)}
            className={"chip " + (sel === i ? "chip-active" : "")}
          >
            {tr(...t.label)}
          </button>
        ))}
      </div>

      <div className="bg-surface-2 mt-3 min-h-48 rounded-xl p-3">
        <p className="bubble-user mb-2 px-3 py-2 text-sm font-medium">{tr(...tabs[sel].q)}</p>

        {state.loading && (
          <div role="status" aria-label="Loading" className="space-y-2 pt-1">
            <div className="skeleton h-3 w-11/12" />
            <div className="skeleton h-3 w-10/12" />
            <div className="skeleton h-3 w-8/12" />
            <p className="pt-1 text-xs text-muted">
              {tr("Searching the law…", "कानून में खोज रहे हैं…", "ਕਾਨੂੰਨ ਵਿੱਚ ਖੋਜ ਰਹੇ ਹਾਂ…")}
            </p>
          </div>
        )}

        {state.error && (
          <div className="text-sm">
            <p style={{ color: "var(--danger)" }}>
              {tr(
                "Could not reach the server. Start the backend and try again.",
                "सर्वर तक नहीं पहुँच पाए। बैकएंड चालू करके दोबारा कोशिश करें।",
                "ਸਰਵਰ ਤੱਕ ਨਹੀਂ ਪਹੁੰਚ ਸਕੇ। ਬੈਕਐਂਡ ਚਾਲੂ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
              )}
            </p>
            <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={() => load(sel)}>
              <RotateCcw size={13} />
              {tr("Try again", "फिर कोशिश करें", "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ")}
            </button>
          </div>
        )}

        {state.data && (
          <div className="msg-in" key={sel + "-" + lang}>
            <AnswerBlock
              text={state.data.answer}
              sources={state.data.sources || []}
              lang={lang}
              compact
              feedback={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { tr } = useLang();
  const { user } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [stats, setStats] = useState(null);

  const firstName = user ? user.name.split(" ")[0] : "";
  const displayName = firstName || (user ? user.name : "");
  const initials = user
    ? user.name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "";

  useEffect(() => {
    let alive = true;
    let timer;
    const fetchStats = () => {
      getJSON("/api/stats")
        .then((s) => {
          if (alive) setStats(s);
        })
        .catch(() => {
          if (alive) timer = setTimeout(fetchStats, 4000);
        });
    };
    fetchStats();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const text = q.trim();
    if (!user) {
      nav("/auth", { state: { from: "/assistant", q: text } });
      return;
    }
    nav("/assistant", text ? { state: { q: text } } : undefined);
  };

  const cells = [
    [stats ? stats.corpus.acts : "–", tr("Acts indexed", "अधिनियम शामिल", "ਸ਼ਾਮਲ ਐਕਟ"), "var(--c-gold)"],
    [stats ? stats.corpus.sections : "–", tr("Passages indexed", "शामिल अंश", "ਸ਼ਾਮਲ ਅੰਸ਼"), "var(--c-green)"],
    [3, tr("Languages", "भाषाएँ", "ਭਾਸ਼ਾਵਾਂ"), "var(--c-blue)"],
    [tr("Free", "निःशुल्क", "ਮੁਫ਼ਤ"), tr("Cost to use", "उपयोग का शुल्क", "ਵਰਤੋਂ ਦੀ ਫੀਸ"), "var(--c-purple)"],
  ];

  const tools = [
    {
      to: "/legal-aid", icon: HeartHandshake, tone: "var(--c-green)",
      title: tr("Free Legal Aid Calculator", "निःशुल्क विधिक सहायता कैलकुलेटर", "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਕੈਲਕੁਲੇਟਰ"),
      text: tr(
        "Women, children, SC/ST members, workers and people in custody can qualify for a free lawyer under Section 12. Check in about a minute.",
        "महिलाएँ, बच्चे, अनुसूचित जाति/जनजाति के सदस्य, श्रमिक और हिरासत में व्यक्ति धारा 12 के तहत निःशुल्क वकील के पात्र हो सकते हैं। लगभग एक मिनट में जाँचें।",
        "ਔਰਤਾਂ, ਬੱਚੇ, ਅਨੁਸੂਚਿਤ ਜਾਤੀ/ਜਨਜਾਤੀ ਦੇ ਮੈਂਬਰ, ਮਜ਼ਦੂਰ ਅਤੇ ਹਿਰਾਸਤ ਵਿੱਚ ਵਿਅਕਤੀ ਧਾਰਾ 12 ਅਧੀਨ ਮੁਫ਼ਤ ਵਕੀਲ ਦੇ ਹੱਕਦਾਰ ਹੋ ਸਕਦੇ ਹਨ। ਲਗਭਗ ਇੱਕ ਮਿੰਟ ਵਿੱਚ ਜਾਂਚੋ।"
      ),
      cta: tr("Evaluate my free aid", "मेरी पात्रता जाँचें", "ਮੇਰੀ ਯੋਗਤਾ ਜਾਂਚੋ"),
    },
    {
      to: "/hub", icon: BookOpen, tone: "var(--c-gold)",
      title: tr("Citizen Rights Handbooks", "नागरिक अधिकार मार्गदर्शिकाएँ", "ਨਾਗਰਿਕ ਅਧਿਕਾਰ ਗਾਈਡਾਂ"),
      text: tr(
        "Step-by-step guides for arrest rights, FIR, RTI and consumer complaints, each tied to the law behind it.",
        "गिरफ्तारी के अधिकार, एफआईआर, आरटीआई और उपभोक्ता शिकायत के चरण-दर-चरण मार्गदर्शन, संबंधित कानून सहित।",
        "ਗ੍ਰਿਫ਼ਤਾਰੀ ਦੇ ਅਧਿਕਾਰ, ਐਫ਼ਆਈਆਰ, ਆਰਟੀਆਈ ਅਤੇ ਖਪਤਕਾਰ ਸ਼ਿਕਾਇਤ ਲਈ ਕਦਮ-ਦਰ-ਕਦਮ ਗਾਈਡ, ਸੰਬੰਧਿਤ ਕਾਨੂੰਨ ਸਮੇਤ।"
      ),
      cta: tr("Open handbooks", "मार्गदर्शिकाएँ खोलें", "ਗਾਈਡ ਖੋਲ੍ਹੋ"),
    },
    {
      to: "/search", icon: Library, tone: "var(--c-blue)",
      title: tr("Law Search", "कानून खोज", "ਕਾਨੂੰਨ ਖੋਜ"),
      text: tr(
        "Search the Constitution, BNS, BNSS and other Acts by topic or section number and read the exact text.",
        "संविधान, बीएनएस, बीएनएसएस और अन्य अधिनियमों में विषय या धारा संख्या से खोजें और सटीक पाठ पढ़ें।",
        "ਸੰਵਿਧਾਨ, ਬੀਐਨਐਸ, ਬੀਐਨਐਸਐਸ ਅਤੇ ਹੋਰ ਐਕਟਾਂ ਵਿੱਚ ਵਿਸ਼ੇ ਜਾਂ ਧਾਰਾ ਨੰਬਰ ਨਾਲ ਖੋਜੋ ਅਤੇ ਸਹੀ ਪਾਠ ਪੜ੍ਹੋ।"
      ),
      cta: tr("Search the laws", "कानून खोजें", "ਕਾਨੂੰਨ ਖੋਜੋ"),
    },
  ];

  const trust = [
    {
      icon: Library, tone: "var(--c-green)",
      title: tr("Answers with sources", "स्रोत सहित उत्तर", "ਸਰੋਤ ਸਮੇਤ ਜਵਾਬ"),
      text: tr(
        "Each answer lists the Act and section it was drawn from.",
        "हर उत्तर में वह अधिनियम और धारा दिखती है जिससे वह तैयार हुआ।",
        "ਹਰ ਜਵਾਬ ਵਿੱਚ ਉਹ ਐਕਟ ਅਤੇ ਧਾਰਾ ਦਿਸਦੀ ਹੈ ਜਿਸ ਤੋਂ ਉਹ ਤਿਆਰ ਹੋਇਆ।"
      ),
    },
    {
      icon: ShieldCheck, tone: "var(--c-blue)",
      title: tr("Says when it does not know", "न जानने पर साफ़ कहता है", "ਪਤਾ ਨਾ ਹੋਣ 'ਤੇ ਸਾਫ਼ ਕਹਿੰਦਾ ਹੈ"),
      text: tr(
        "If a question is outside the indexed laws, it says so instead of guessing.",
        "अगर प्रश्न शामिल कानूनों से बाहर है, तो अंदाज़ा लगाने की जगह यही बताता है।",
        "ਜੇ ਸਵਾਲ ਸ਼ਾਮਲ ਕਾਨੂੰਨਾਂ ਤੋਂ ਬਾਹਰ ਹੈ, ਤਾਂ ਅੰਦਾਜ਼ਾ ਲਗਾਉਣ ਦੀ ਥਾਂ ਇਹੀ ਦੱਸਦਾ ਹੈ।"
      ),
    },
    {
      icon: Volume2, tone: "var(--c-gold)",
      title: tr("Voice readout", "आवाज़ में सुनें", "ਆਵਾਜ਼ ਵਿੱਚ ਸੁਣੋ"),
      text: tr(
        "Your browser can read answers aloud when it has a voice for your language.",
        "आपका ब्राउज़र उत्तर ज़ोर से पढ़ सकता है, बशर्ते उसमें उस भाषा की आवाज़ हो।",
        "ਤੁਹਾਡਾ ਬ੍ਰਾਊਜ਼ਰ ਜਵਾਬ ਉੱਚੀ ਪੜ੍ਹ ਸਕਦਾ ਹੈ, ਜੇ ਉਸ ਵਿੱਚ ਉਸ ਭਾਸ਼ਾ ਦੀ ਆਵਾਜ਼ ਹੋਵੇ।"
      ),
    },
    {
      icon: Lock, tone: "var(--c-purple)",
      title: tr("Your privacy", "आपकी निजता", "ਤੁਹਾਡੀ ਨਿੱਜਤਾ"),
      text: tr(
        "Phone numbers, emails and ID numbers are removed before a question is logged.",
        "प्रश्न दर्ज होने से पहले फ़ोन नंबर, ईमेल और पहचान संख्याएँ हटा दी जाती हैं।",
        "ਸਵਾਲ ਦਰਜ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਫ਼ੋਨ ਨੰਬਰ, ਈਮੇਲ ਅਤੇ ਪਛਾਣ ਨੰਬਰ ਹਟਾ ਦਿੱਤੇ ਜਾਂਦੇ ਹਨ।"
      ),
    },
  ];

  const delay = (ms) => ({ animationDelay: ms + "ms" });

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="hero-bg card card-accent card-raised overflow-hidden px-5 py-8 sm:px-10 sm:py-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            {user && (
              <div className="rise mb-4 flex items-center gap-2.5" style={delay(0)}>
                <span className="btn-primary grid h-7 w-7 place-items-center rounded-full text-xs font-bold shrink-0 shadow-sm">
                  {initials}
                </span>
                <span className="text-sm font-bold text-accent">
                  {tr("Hello", "नमस्ते", "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ")} {displayName}!
                </span>
                <span className="hidden sm:inline text-xs text-muted">
                  • {tr("Welcome to NyayaSahayak", "न्याय सहायक में स्वागत है", "ਨਿਆਂ ਸਹਾਇਕ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ")}
                </span>
              </div>
            )}
            <p
              className="rise bg-surface inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold text-accent"
              style={delay(user ? 30 : 0)}
            >
              <Sparkles size={14} />
              {tr(
                "Digital public legal good · Articles 21 and 39A",
                "डिजिटल जन-कानूनी सेवा · अनुच्छेद 21 और 39A",
                "ਡਿਜੀਟਲ ਜਨਤਕ ਕਾਨੂੰਨੀ ਸੇਵਾ · ਅਨੁਛੇਦ 21 ਅਤੇ 39A"
              )}
            </p>
            <h1 className="equal-font mt-5 text-balance text-3xl font-bold sm:text-4xl lg:text-[2.4rem]">
              <span className="rise block" style={delay(90)}>
                {tr("Equal justice under law,", "कानून के समक्ष समानता,", "ਕਾਨੂੰਨ ਸਾਹਮਣੇ ਬਰਾਬਰੀ,")}
              </span>
              <span className="rise block text-accent" style={delay(190)}>
                {tr("accessible to every citizen.", "हर भारतीय नागरिक के लिए सुलभ।", "ਹਰ ਨਾਗਰਿਕ ਲਈ ਪਹੁੰਚਯੋਗ।")}
              </span>
            </h1>
            <p className="rise mt-4 max-w-xl text-muted" style={delay(300)}>
              {tr(
                "Ask about Indian law in plain language. Every answer cites the Act and section it came from, so you can check it yourself.",
                "भारतीय कानून के बारे में सरल भाषा में पूछिए। हर उत्तर उस अधिनियम और धारा का हवाला देता है जिससे वह लिया गया है, ताकि आप खुद जाँच सकें।",
                "ਭਾਰਤੀ ਕਾਨੂੰਨ ਬਾਰੇ ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ ਪੁੱਛੋ। ਹਰ ਜਵਾਬ ਉਸ ਐਕਟ ਅਤੇ ਧਾਰਾ ਦਾ ਹਵਾਲਾ ਦਿੰਦਾ ਹੈ ਜਿਸ ਤੋਂ ਉਹ ਲਿਆ ਗਿਆ ਹੈ, ਤਾਂ ਜੋ ਤੁਸੀਂ ਆਪ ਜਾਂਚ ਸਕੋ।"
              )}
            </p>

            <form onSubmit={submit} className="rise mt-6 flex flex-col gap-2 sm:flex-row" style={delay(400)}>
              <label htmlFor="home-q" className="sr-only">
                {tr("Describe your legal problem", "अपनी कानूनी समस्या लिखिए", "ਆਪਣੀ ਕਾਨੂੰਨੀ ਸਮੱਸਿਆ ਲਿਖੋ")}
              </label>
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-3.5 text-accent" />
                <input
                  id="home-q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="input pl-10"
                  placeholder={tr("Describe your legal problem", "अपनी कानूनी समस्या लिखिए", "ਆਪਣੀ ਕਾਨੂੰਨੀ ਸਮੱਸਿਆ ਲਿਖੋ")}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {tr("Consult assistant", "सहायक से पूछें", "ਸਹਾਇਕ ਨੂੰ ਪੁੱਛੋ")}
              </button>
            </form>

            <div className="rise mt-4 flex flex-wrap gap-2" style={delay(500)}>
              <Link to="/legal-aid" className="chip" style={{ color: "var(--c-green)" }}>
                <HeartHandshake size={13} />
                {tr("Free lawyer eligibility", "मुफ़्त वकील की पात्रता", "ਮੁਫ਼ਤ ਵਕੀਲ ਦੀ ਯੋਗਤਾ")}
              </Link>
              <Link to="/hub" className="chip" style={{ color: "var(--c-gold)" }}>
                <BookOpen size={13} />
                {tr("Citizen handbooks", "नागरिक मार्गदर्शिकाएँ", "ਨਾਗਰਿਕ ਗਾਈਡਾਂ")}
              </Link>
              <Link to="/helplines" className="chip" style={{ color: "var(--c-blue)" }}>
                <Phone size={13} />
                {tr("Helplines", "हेल्पलाइन", "ਹੈਲਪਲਾਈਨ")}
              </Link>
            </div>
          </div>

          <div className="rise" style={delay(350)}>
            <Preview />
          </div>
        </div>

        <div
          className="rise mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
          style={delay(650)}
        >
          {cells.map(([value, label, color], i) => (
            <div key={i} className="card zoom-hover-sm rounded-2xl overflow-hidden px-4 py-4 text-center">
              <div className="font-display text-2xl font-bold" style={{ color }}>
                <CountUp value={value} />
              </div>
              <div className="text-xs font-semibold text-muted">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Reveal className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-2xl font-bold">
            {tr("National 24×7 citizen helplines", "राष्ट्रीय 24×7 नागरिक हेल्पलाइन", "ਰਾਸ਼ਟਰੀ 24×7 ਨਾਗਰਿਕ ਹੈਲਪਲਾਈਨ")}
          </h2>
          <Link to="/helplines" className="text-sm font-semibold text-accent">
            {tr("View all contacts", "सभी संपर्क देखें", "ਸਾਰੇ ਸੰਪਰਕ ਵੇਖੋ")}
          </Link>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HELPLINES.map((h, i) => (
            <Reveal key={h.num} delay={i * 90} className="h-full">
              <div
                className="card tone-card zoom-hover group flex h-full flex-col p-4"
                style={{ "--tone": h.tone }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold">{tr(...h.name)}</div>
                  <span className="tone-badge shrink-0">{tr(...h.tag)}</span>
                </div>
                <p className="mt-1 flex-1 text-sm text-muted">{tr(...h.note)}</p>
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="font-mono text-2xl font-bold tone-text">{h.num}</span>
                  <a href={"tel:" + h.num} className="btn btn-primary btn-sm">
                    <Phone size={14} className="icon-pop" />
                    {tr("Call", "कॉल करें", "ਕਾਲ ਕਰੋ")}
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <Reveal>
          <h2 className="text-2xl font-bold">
            {tr("Citizen legal empowerment toolkits", "नागरिक कानूनी सशक्तिकरण उपकरण", "ਨਾਗਰਿਕ ਕਾਨੂੰਨੀ ਸਸ਼ਕਤੀਕਰਨ ਸਾਧਨ")}
          </h2>
          <p className="mb-4 text-sm text-muted">
            {tr(
              "Pick a tool to check your rights or resolve a dispute.",
              "अपने अधिकार जाँचने या विवाद सुलझाने के लिए एक उपकरण चुनिए।",
              "ਆਪਣੇ ਅਧਿਕਾਰ ਜਾਂਚਣ ਜਾਂ ਵਿਵਾਦ ਸੁਲਝਾਉਣ ਲਈ ਇੱਕ ਸਾਧਨ ਚੁਣੋ।"
            )}
          </p>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {tools.map((t, i) => (
            <Reveal key={t.to} delay={i * 100} className="h-full">
              <div
                className="card tone-card zoom-hover group flex h-full flex-col p-5"
                style={{ "--tone": t.tone }}
              >
                <span className="tone-icon">
                  <t.icon size={21} className="icon-pop" />
                </span>
                <h3 className="mt-3 text-lg font-bold">{t.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted">{t.text}</p>
                <Link to={t.to} className="btn btn-primary mt-4">{t.cta}</Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal as="section" className="card card-accent p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="eyebrow">{tr("Responsible civic tech", "ज़िम्मेदार सिविक टेक", "ਜ਼ਿੰਮੇਵਾਰ ਸਿਵਿਕ ਟੈਕ")}</div>
            <h2 className="text-2xl font-bold">
              {tr("Why citizens can rely on NyayaSahayak", "नागरिक न्यायसहायक पर भरोसा क्यों कर सकते हैं", "ਨਾਗਰਿਕ ਨਿਆਂਸਹਾਇਕ 'ਤੇ ਭਰੋਸਾ ਕਿਉਂ ਕਰ ਸਕਦੇ ਹਨ")}
            </h2>
          </div>
          <Link to="/charter" className="text-sm font-semibold text-accent">
            {tr("Read the Safety Charter", "सुरक्षा चार्टर पढ़ें", "ਸੁਰੱਖਿਆ ਚਾਰਟਰ ਪੜ੍ਹੋ")}
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((t, i) => (
            <Reveal key={t.title} delay={i * 90} className="h-full">
              <div
                className="card tone-card zoom-hover-sm group h-full p-4"
                style={{ "--tone": t.tone }}
              >
                <div className="flex items-center gap-2 text-sm font-bold tone-text">
                  <t.icon size={17} className="icon-pop" />
                  {t.title}
                </div>
                <p className="mt-1.5 text-sm text-muted">{t.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </div>
  );
}