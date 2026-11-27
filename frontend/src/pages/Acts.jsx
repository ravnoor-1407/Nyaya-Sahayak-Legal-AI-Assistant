import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Library,
  Search,
  ChevronDown,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Scale,
  HeartHandshake,
  Car,
  Landmark,
  Building2,
  ShieldCheck,
  FileText,
  ShieldAlert,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useLang } from "../LangContext";
import { getJSON } from "../api";
import { list, pick, flat } from "../lib/normalize";

const TONES = ["var(--c-gold)", "var(--c-blue)", "var(--c-green)", "var(--c-purple)", "var(--c-rose)"];
const PAGE = 40;

// Category Definitions with Trilingual Support
const CATEGORIES = [
  {
    id: "all",
    name: ["All Categories", "सभी श्रेणियाँ", "ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ"],
    icon: Library,
    tone: "var(--c-gold)",
  },
  {
    id: "criminal",
    name: ["Criminal Law & Evidence", "आपराधिक कानून एवं साक्ष्य", "ਫੌਜਦਾਰੀ ਕਾਨੂੰਨ ਅਤੇ ਸਬੂਤ"],
    desc: [
      "Substantive crimes, criminal procedures, bail, FIR, arrest, and electronic evidence under the new 2023 Sanhitas.",
      "नए 2023 कानूनों के तहत अपराध, प्रक्रिया, जमानत, गिरफ्तारी और साक्ष्य नियम।",
      "ਨਵੇਂ 2023 ਕਾਨੂੰਨਾਂ ਤਹਿਤ ਜੁਰਮ, ਅਪਰਾਧਿਕ ਪ੍ਰਕਿਰਿਆ, ਜ਼ਮਾਨਤ ਅਤੇ ਸਬੂਤ।",
    ],
    matchCats: ["criminal", "evidence"],
    icon: Scale,
    tone: "var(--c-rose)",
  },
  {
    id: "family",
    name: ["Marriage & Family Rights", "विवाह एवं पारिवारिक अधिकार", "ਵਿਆਹ ਅਤੇ ਪਰਿਵਾਰਕ ਅਧਿਕਾਰ"],
    desc: [
      "Marriage validity, divorce grounds, restitution of conjugal rights, domestic violence protection orders, and maintenance.",
      "विवाह की वैधता, तलाक, घरेलू हिंसा से सुरक्षा, निवास अधिकार और भरण-पोषण।",
      "ਵਿਆਹ ਦੀਆਂ ਸ਼ਰਤਾਂ, ਤਲਾਕ, ਘਰੇਲੂ ਹਿੰਸਾ ਸੁਰੱਖਿਆ ਅਤੇ ਖਰਚਾ।",
    ],
    matchCats: ["family"],
    icon: HeartHandshake,
    tone: "var(--c-purple)",
  },
  {
    id: "motor_vehicle",
    name: ["Traffic & Motor Vehicles", "यातायात एवं मोटर वाहन", "ਟ੍ਰੈਫਿਕ ਅਤੇ ਮੋਟਰ ਵਾਹਨ"],
    desc: [
      "Traffic rules, police challans, vehicle impounding, accident claims, driving licensing, and 2019 amended penalties.",
      "यातायात नियम, पुलिस चालान, दुर्घटना मुआवज़ा और वाहन कानून।",
      "ਟ੍ਰੈਫਿਕ ਨਿਯਮ, ਪੁਲਿਸ ਚਲਾਨ, ਦੁਰਘਟਨਾ ਮੁਆਵਜ਼ਾ ਅਤੇ ਲਾਇਸੈਂਸ।",
    ],
    matchCats: ["motor_vehicle"],
    icon: Car,
    tone: "var(--c-green)",
  },
  {
    id: "commercial",
    name: ["Commercial & Cheque Bounce", "व्यापार, चेक बाउंस एवं अनुबंध", "ਵਪਾਰ, ਚੈੱਕ ਬਾਊਂਸ ਅਤੇ ਇਕਰਾਰਨਾਮਾ"],
    desc: [
      "Section 138 cheque dishonour proceedings, 15-day demand notices, contract validity, breach of agreement, and commercial debts.",
      "चेक बाउंस (धारा 138), 15-दिवसीय कानूनी नोटिस और व्यावसायिक अनुबंध।",
      "ਚੈੱਕ ਬਾਊਂਸ (ਧਾਰਾ 138), 15-ਦਿਨਾ ਕਾਨੂੰਨੀ ਨੋਟਿਸ ਅਤੇ ਇਕਰਾਰਨਾਮਾ ਉਲੰਘਣਾ।",
    ],
    matchCats: ["commercial"],
    icon: Landmark,
    tone: "var(--c-gold)",
  },
  {
    id: "civil_property",
    name: ["Civil Court & Property", "दीवानी अदालत एवं संपत्ति", "ਦੀਵਾਨੀ ਅਦਾਲਤ ਅਤੇ ਜਾਇਦਾਦ"],
    desc: [
      "Civil court summons, temporary injunctions, stay orders, execution of decrees, property sale, lease, mortgage, and gift deeds.",
      "दीवानी अदालती समन, अंतरिम रोक (Stay Order), संपत्ति बिक्री और लीज।",
      "ਦੀਵਾਨੀ ਅਦਾਲਤੀ ਕਾਰਵਾਈ, ਸਟੇਅ ਆਰਡਰ, ਸੰਪਤੀ ਵਿਕਰੀ ਅਤੇ ਲੀਜ਼।",
    ],
    matchCats: ["civil", "property"],
    icon: Building2,
    tone: "var(--c-blue)",
  },
  {
    id: "constitutional_aid",
    name: ["Constitutional Rights & Legal Aid", "संवैधानिक अधिकार एवं विधिक सहायता", "ਸੰਵਿਧਾਨਕ ਅਧਿਕਾਰ ਅਤੇ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ"],
    desc: [
      "Fundamental rights, constitutional writ remedies (Habeas Corpus), Section 12 NALSA free legal aid, and Lok Adalat settlement.",
      "मौलिक अधिकार, रिट याचिकाएँ, सरकारी खर्च पर मुफ्त वकील और लोक अदालत।",
      "ਮੌਲਿਕ ਅਧਿਕਾਰ, ਰਿੱਟ ਪਟੀਸ਼ਨਾਂ, ਮੁਫ਼ਤ ਸਰਕਾਰੀ ਵਕੀਲ ਅਤੇ ਲੋਕ ਅਦਾਲਤ।",
    ],
    matchCats: ["constitutional", "legal_aid"],
    icon: ShieldCheck,
    tone: "var(--c-gold)",
  },
  {
    id: "consumer_rti",
    name: ["Consumer & Transparency (RTI)", "उपभोक्ता अधिकार एवं सूचना का अधिकार", "ਖਪਤਕਾਰ ਅਧਿਕਾਰ ਅਤੇ ਆਰਟੀਆਈ"],
    desc: [
      "Consumer Commission complaints, deficiency in service, e-commerce refunds, 30-day RTI application window, and fee waivers.",
      "उपभोक्ता शिकायतें, सेवा में कमी, 30-दिवसीय आरटीआई और सूचना का अधिकार।",
      "ਖਪਤਕਾਰ ਸ਼ਿਕਾਇਤਾਂ, ਈ-ਕਾਮਰਸ ਰਿਫੰਡ ਅਤੇ 30-ਦਿਨਾ ਆਰਟੀਆਈ ਜਵਾਬ।",
    ],
    matchCats: ["consumer", "administrative"],
    icon: FileText,
    tone: "var(--c-blue)",
  },
  {
    id: "tech_safety",
    name: ["Cyber, Tech & Special Safety", "साइबर अपराध, कार्यस्थल व बाल सुरक्षा", "ਸਾਈਬਰ ਅਪਰਾਧ ਅਤੇ ਸੁਰੱਖਿਆ"],
    desc: [
      "Cybercrime, identity theft, 24-hour social media deepfake takedowns, POSH workplace harassment, and POCSO child protection.",
      "साइबर अपराध, पॉश (कार्यस्थल पर यौन उत्पीड़न) और पॉक्सो बाल संरक्षण।",
      "ਸਾਈਬਰ ਅਪਰਾਧ, ਪੋਸ਼ ਕਾਰਜ ਸਥਾਨ ਸੁਰੱਖਿਆ ਅਤੇ ਪੋਕਸੋ ਬਾਲ ਸੁਰੱਖਿਆ।",
    ],
    matchCats: ["cyber", "workplace_safety", "child_safety"],
    icon: ShieldAlert,
    tone: "var(--c-rose)",
  },
  {
    id: "precedents",
    name: ["Supreme Court Precedents", "सुप्रीम कोर्ट ऐतिहासिक निर्णय", "ਸੁਪਰੀਮ ਕੋਰਟ ਇਤਿਹਾਸਕ ਫੈਸਲੇ"],
    desc: [
      "Binding judicial rulings under Article 141 on arrest notice (Arnesh Kumar), mandatory FIR (Lalita Kumari), and bail rules.",
      "गिरफ्तारी, अनिवार्य एफआईआर और जमानत पर सर्वोच्च न्यायालय के मार्गदर्शक सिद्धांत।",
      "ਗ੍ਰਿਫ਼ਤਾਰੀ, ਐਫਆਈਆਰ ਅਤੇ ਜ਼ਮਾਨਤ 'ਤੇ ਸੁਪਰੀਮ ਕੋਰਟ ਦੇ ਇਤਿਹਾਸਕ ਹੁਕਮ।",
    ],
    matchCats: ["precedent"],
    icon: Sparkles,
    tone: "var(--c-purple)",
  },
];

// Helper to reliably map an Act to a category ID
function getActCategoryId(act) {
  const name = (act.name || act.act || "").toLowerCase();
  const cat = (act.category || "").toLowerCase();

  if (name.startsWith("supreme court") || cat === "precedent") return "precedents";
  if (name.includes("motor vehicle") || cat === "motor_vehicle") return "motor_vehicle";
  if (name.includes("marriage") || name.includes("domestic violence") || cat === "family") return "family";
  if (name.includes("negotiable") || name.includes("contract") || cat === "commercial") return "commercial";
  if (name.includes("civil procedure") || name.includes("property") || cat === "civil" || cat === "property") return "civil_property";
  if (name.includes("constitution") || name.includes("legal services") || cat === "constitutional" || cat === "legal_aid") return "constitutional_aid";
  if (name.includes("consumer") || name.includes("information") || cat === "consumer" || cat === "administrative") return "consumer_rti";
  if (name.includes("technology") || name.includes("harassment") || name.includes("children") || name.includes("posh") || name.includes("pocso") || cat === "cyber" || cat === "workplace_safety" || cat === "child_safety") return "tech_safety";
  return "criminal";
}

export default function Acts() {
  const { tr } = useLang();
  const nav = useNavigate();
  const [acts, setActs] = useState(null);
  const [error, setError] = useState(false);
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Section viewer state
  const [sel, setSel] = useState(null);
  const [secs, setSecs] = useState(null);
  const [secErr, setSecErr] = useState(false);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [limit, setLimit] = useState(PAGE);

  const loadActs = () => {
    setError(false);
    getJSON("/api/acts")
      .then((d) => {
        setActs(
          list(d, "acts", "items", "results").map((r, i) => {
            const name = String(pick(r, "name", "act", "title", "id"));
            const rawCat = String(pick(r, "category") || "");
            const year = pick(r, "year");
            const catId = getActCategoryId({ name, category: rawCat });
            return {
              id: name,
              name,
              category: rawCat,
              catId,
              year,
              count: Number(pick(r, "count", "sections", "passages", "n", "chunks")) || null,
              tone: TONES[i % TONES.length],
            };
          })
        );
      })
      .catch(() => setError(true));
  };

  useEffect(() => {
    loadActs();
  }, []);

  const choose = (a) => {
    setSel(a);
    setSecs(null);
    setSecErr(false);
    setQ("");
    setOpen(null);
    setLimit(PAGE);
    getJSON("/api/acts/sections?act=" + encodeURIComponent(a.name))
      .then((d) => {
        const rows = list(d, "sections", "items", "passages", "chunks", "results").map((r) => {
          const m = flat(r);
          return {
            section: String(pick(m, "section", "number", "article")),
            unit: String(pick(m, "unit") || "Section"),
            title: String(pick(m, "title", "heading")),
            text: String(pick(m, "text", "snippet", "document", "content")),
          };
        });
        setSecs(rows);
      })
      .catch(() => setSecErr(true));
  };

  // Filter Acts by Category and Search Term
  const filteredActs = useMemo(() => {
    if (!acts) return [];
    let res = acts;

    if (selectedCat !== "all") {
      res = res.filter((a) => a.catId === selectedCat);
    }

    const s = searchQuery.trim().toLowerCase();
    if (s) {
      res = res.filter((a) => a.name.toLowerCase().includes(s) || a.catId.toLowerCase().includes(s));
    }

    return res;
  }, [acts, selectedCat, searchQuery]);

  // Counts per category for badges
  const categoryCounts = useMemo(() => {
    if (!acts) return {};
    const map = { all: acts.length };
    for (const a of acts) {
      map[a.catId] = (map[a.catId] || 0) + 1;
    }
    return map;
  }, [acts]);

  // Group Acts by Category when "all" is active and not searching
  const groupedCategories = useMemo(() => {
    if (!acts || selectedCat !== "all" || searchQuery.trim()) return null;
    const groups = [];
    for (const cat of CATEGORIES) {
      if (cat.id === "all") continue;
      const matchingActs = acts.filter((a) => a.catId === cat.id);
      if (matchingActs.length > 0) {
        groups.push({
          ...cat,
          acts: matchingActs,
        });
      }
    }
    return groups;
  }, [acts, selectedCat, searchQuery]);

  const shown = useMemo(() => {
    if (!secs) return [];
    const s = q.trim().toLowerCase();
    if (!s) return secs;
    return secs.filter(
      (r) =>
        r.section.toLowerCase() === s ||
        r.section.toLowerCase().startsWith(s) ||
        r.title.toLowerCase().includes(s) ||
        r.text.toLowerCase().includes(s)
    );
  }, [secs, q]);

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <section className="hero-bg card card-accent card-raised px-5 py-8 sm:px-10">
        <span className="tone-badge rise" style={{ "--tone": "var(--c-blue)" }}>
          <Library size={14} />
          {tr("Categorized Statutory Law Library", "श्रेणीबद्ध वैधानिक कानून पुस्तकालय", "ਸ਼੍ਰੇਣੀਬੱਧ ਕਾਨੂੰਨੀ ਲਾਇਬ੍ਰੇਰੀ")}
        </span>
        <h1 className="rise mt-3 text-3xl font-black sm:text-4xl text-ink tracking-tight" style={{ animationDelay: "60ms" }}>
          {tr("Acts, Rules and Sections by Category", "श्रेणी अनुसार अधिनियम, नियम और धाराएँ", "ਸ਼੍ਰੇਣੀ ਅਨੁਸਾਰ ਐਕਟ, ਨਿਯਮ ਅਤੇ ਧਾਰਾਵਾਂ")}
        </h1>
        <p className="rise mt-2 max-w-2xl text-muted text-sm sm:text-base font-medium leading-relaxed" style={{ animationDelay: "120ms" }}>
          {tr(
            "Explore indexed Indian laws categorized by subject: Criminal Law, Marriage & Family, Motor Vehicles & Traffic, Commercial & Cheque Bounce, Civil & Property, and Supreme Court Landmark Precedents.",
            "विषय अनुसार विभाजित भारतीय कानूनों का अन्वेषण करें: आपराधिक कानून, विवाह एवं परिवार, मोटर वाहन एवं यातायात, व्यापार एवं चेक बाउंस, दीवानी व संपत्ति, और सर्वोच्च न्यायालय के ऐतिहासिक निर्णय।",
            "ਵਿਸ਼ੇ ਅਨੁਸਾਰ ਵੰਡੇ ਭਾਰਤੀ ਕਾਨੂੰਨਾਂ ਦੀ ਪੜਚੋਲ ਕਰੋ: ਫੌਜਦਾਰੀ ਕਾਨੂੰਨ, ਵਿਆਹ ਅਤੇ ਪਰਿਵਾਰ, ਮੋਟਰ ਵਾਹਨ ਅਤੇ ਟ੍ਰੈਫਿਕ, ਵਪਾਰ ਅਤੇ ਚੈੱਕ ਬਾਊਂਸ, ਅਤੇ ਸੁਪਰੀਮ ਕੋਰਟ ਦੇ ਫੈਸਲੇ।"
          )}
        </p>
      </section>

      {/* ================= ACTS BROWSER (NO ACT SELECTED) ================= */}
      {!sel && (
        <div className="space-y-6">
          {/* Category Tabs Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-line/60">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSel = selectedCat === cat.id;
              const count = categoryCounts[cat.id] || 0;
              if (cat.id !== "all" && count === 0) return null;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCat(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs whitespace-nowrap transition-all border ${
                    isSel
                      ? "tab-active bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 border-amber-600 font-black shadow-md ring-2 ring-amber-400/40"
                      : "bg-surface text-ink hover:text-ink hover:bg-surface-2 border-line font-bold"
                  }`}
                  style={isSel ? { color: "#0f172a", backgroundColor: "#f59e0b" } : undefined}
                >
                  <Icon size={15} className={`shrink-0 ${isSel ? "text-slate-950" : "text-accent"}`} style={isSel ? { color: "#0f172a" } : undefined} />
                  <span className={isSel ? "font-black tracking-tight" : "text-ink font-bold"} style={isSel ? { color: "#0f172a" } : undefined}>
                    {tr(...cat.name)}
                  </span>
                  <span
                    className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      isSel ? "bg-black/20 text-slate-950" : "bg-surface-2 text-muted border border-line"
                    }`}
                    style={isSel ? { color: "#0f172a" } : undefined}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar for Acts */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
              <input
                className="input pl-11 pr-10 py-3 rounded-full text-xs sm:text-sm bg-surface border-line shadow-xs focus:ring-2 focus:ring-amber-500/30 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tr(
                  "Search acts by name or keyword, e.g. 'Cheque', 'Marriage', 'Traffic', 'BNS', 'RTI', 'Bail'...",
                  "अधिनियम खोजें, जैसे 'चेक बाउंस', 'विवाह', 'यातायात', 'बीएनएस', 'आरटीआई'...",
                  "ਕਾਨੂੰਨ ਖੋਜੋ, ਜਿਵੇਂ 'ਚੈੱਕ ਬਾਊਂਸ', 'ਵਿਆਹ', 'ਟ੍ਰੈਫਿਕ', 'ਆਰਟੀਆਈ'..."
                )}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {selectedCat !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedCat("all")}
                className="btn btn-ghost border border-line rounded-full text-xs font-bold text-ink shrink-0 px-4"
              >
                <RotateCcw size={13} />
                <span>{tr("Clear Filter", "फ़िल्टर हटाएं", "ਸਾਫ਼ ਕਰੋ")}</span>
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="card p-6 text-center">
              <p style={{ color: "var(--danger)" }}>
                {tr("Could not load the Acts. Is the backend running?", "अधिनियम लोड नहीं हो सके। क्या बैकएंड चालू है?", "ਐਕਟ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ। ਕੀ ਬੈਕਐਂਡ ਚਾਲੂ ਹੈ?")}
              </p>
              <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={loadActs}>
                <RotateCcw size={13} />
                {tr("Try again", "फिर कोशिश करें", "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ")}
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {!error && acts === null && (
            <div className="grid gap-4 md:grid-cols-2">
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <div key={k} className="skeleton h-28 rounded-2xl" />
              ))}
            </div>
          )}

          {/* Empty Search Result */}
          {acts && filteredActs.length === 0 && (
            <div className="card p-8 text-center bg-surface border border-line space-y-2">
              <p className="text-base font-bold text-ink">
                {tr("No matching Acts found in this category.", "इस श्रेणी में कोई अधिनियम नहीं मिला।", "ਇਸ ਸ਼੍ਰੇਣੀ ਵਿੱਚ ਕੋਈ ਐਕਟ ਨਹੀਂ ਮਿਲਿਆ।")}
              </p>
              <p className="text-xs text-muted">
                {tr("Try searching for different keywords or select 'All Categories'.", "अलग शब्द से खोजें अथवा 'सभी श्रेणियाँ' चुनें।", "ਕਿਸੇ ਹੋਰ ਸ਼ਬਦ ਨਾਲ ਖੋਜੋ ਜਾਂ 'ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ' ਚੁਣੋ।")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCat("all");
                  setSearchQuery("");
                }}
                className="btn btn-primary btn-sm mt-3"
              >
                {tr("View All Acts", "सभी अधिनियम देखें", "ਸਾਰੇ ਐਕਟ ਵੇਖੋ")}
              </button>
            </div>
          )}

          {/* ================= OPTION A: CATEGORIZED GROUPS (When 'all' is selected & no search) ================= */}
          {groupedCategories && (
            <div className="space-y-8">
              {groupedCategories.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <section key={group.id} className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-line">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-surface-2 border border-line text-accent">
                          <GroupIcon size={18} />
                        </span>
                        <div>
                          <h2 className="text-lg sm:text-xl font-black text-ink tracking-tight flex items-center gap-2">
                            <span>{tr(...group.name)}</span>
                            <span className="badge text-xs font-mono font-bold bg-surface-2 text-muted border border-line">
                              {group.acts.length} {tr("Acts / Rules", "अधिनियम / नियम", "ਐਕਟ / ਨਿਯਮ")}
                            </span>
                          </h2>
                          <p className="text-xs text-muted font-medium mt-0.5">{tr(...group.desc)}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCat(group.id)}
                        className="text-xs font-bold text-accent hover:underline hidden sm:flex items-center gap-1 shrink-0"
                      >
                        <span>{tr("View category", "श्रेणी देखें", "ਵੇਖੋ")}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {group.acts.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => choose(a)}
                          className="card card-accent card-raised p-6 text-left bg-surface border-2 border-line hover:border-amber-500 rounded-3xl transition-all duration-200 group flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {a.year && (
                                  <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-accent border border-amber-500/30">
                                    {a.year}
                                  </span>
                                )}
                                <span className="text-[11px] font-semibold text-muted">
                                  {tr("Enacted Law", "अधिनियमित कानून", "ਲਾਗੂ ਕਾਨੂੰਨ")}
                                </span>
                              </div>
                              <h3 className="text-base sm:text-lg font-black text-ink group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors leading-snug">
                                {a.name}
                              </h3>
                            </div>
                            <div className="p-3 rounded-full bg-surface-2 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all border border-line shrink-0 text-muted shadow-xs">
                              <ArrowRight size={16} />
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                            <span className="font-mono text-xs font-bold text-accent">
                              {a.count ? `${a.count.toLocaleString("en-IN")} ${tr("passages indexed", "अंश शामिल", "ਅੰਸ਼ ਸ਼ਾਮਲ")}` : tr("Full text available", "पूर्ण पाठ उपलब्ध", "ਪੂਰਾ ਪਾਠ")}
                            </span>
                            <span className="text-xs font-bold text-muted group-hover:text-ink transition-colors flex items-center gap-1">
                              <span>{tr("Browse sections", "धाराएँ देखें", "ਧਾਰਾਵਾਂ ਵੇਖੋ")}</span>
                              <span>&rarr;</span>
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* ================= OPTION B: FILTERED GRID (When a specific category or search query is active) ================= */}
          {!groupedCategories && filteredActs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted font-bold">
                <span>
                  {tr("Showing", "प्रदर्शित", "ਵੇਖਾ ਰਿਹਾ")}: {filteredActs.length} {tr("Acts & Statutes", "अधिनियम", "ਐਕਟ")}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {filteredActs.map((a) => {
                  const catDef = CATEGORIES.find((c) => c.id === a.catId) || CATEGORIES[1];
                  const CatIcon = catDef.icon;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => choose(a)}
                      className="card card-accent card-raised p-6 text-left bg-surface border-2 border-line hover:border-amber-500 rounded-3xl transition-all duration-200 group flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-accent border border-amber-500/35 flex items-center gap-1.5 shadow-xs">
                              <CatIcon size={13} className="shrink-0" />
                              <span>{tr(...catDef.name)}</span>
                            </span>
                            {a.year && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-surface-2 text-muted border border-line">
                                {a.year}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-ink group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors leading-snug">
                            {a.name}
                          </h3>
                        </div>
                        <div className="p-3 rounded-full bg-surface-2 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all border border-line shrink-0 text-muted shadow-xs">
                          <ArrowRight size={16} />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                        <span className="font-mono text-xs font-bold text-accent">
                          {a.count ? `${a.count.toLocaleString("en-IN")} ${tr("passages indexed", "अंश शामिल", "ਅੰਸ਼ ਸ਼ਾਮਲ")}` : tr("Full text available", "पूर्ण पाठ उपलब्ध", "ਪੂਰਾ ਪਾਠ")}
                        </span>
                        <span className="text-xs font-bold text-muted group-hover:text-ink transition-colors flex items-center gap-1">
                          <span>{tr("Browse sections", "धाराएँ देखें", "ਧਾਰਾਵਾਂ ਵੇਖੋ")}</span>
                          <span>&rarr;</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= ACT SECTIONS VIEWER (WHEN AN ACT IS CLICKED) ================= */}
      {sel && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn btn-ghost btn-sm border border-line font-bold text-xs text-ink flex items-center gap-1.5 hover:bg-surface-2"
                onClick={() => setSel(null)}
              >
                <ArrowLeft size={14} />
                <span>{tr("Back to All Acts", "सभी अधिनियमों पर लौटें", "ਸਾਰੇ ਐਕਟਾਂ 'ਤੇ ਵਾਪਸ")}</span>
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">{sel.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="badge text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border border-amber-500/50">
                    {tr(...(CATEGORIES.find((c) => c.id === sel.catId)?.name || ["Statute", "अधिनियम", "ਐਕਟ"]))}
                  </span>
                  {sel.year && <span className="text-xs text-muted font-semibold font-mono">{sel.year}</span>}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs font-bold shadow-sm"
              onClick={() =>
                nav("/assistant", {
                  state: { q: `Explain the key provisions and citizen rights under ${sel.name} in simple words.` },
                })
              }
            >
              <Sparkles size={14} />
              <span>{tr("Ask AI about this Act", "इस अधिनियम पर एआई से पूछें", "ਇਸ ਐਕਟ ਬਾਰੇ ਏਆਈ ਨੂੰ ਪੁੱਛੋ")}</span>
            </button>
          </div>

          {/* Search within Sections */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3.5 text-accent" />
            <input
              className="input pl-10 text-xs sm:text-sm bg-surface border-line"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(PAGE);
              }}
              placeholder={tr(
                "Filter sections by number, title or exact words (e.g. '138', 'Bail', 'Arrest', 'Penalty')...",
                "धारा संख्या, शीर्षक अथवा शब्द से खोजें (उदा. '138', 'जमानत', 'गिरफ्तारी')...",
                "ਧਾਰਾ ਨੰਬਰ ਜਾਂ ਸ਼ਬਦ ਨਾਲ ਖੋਜੋ..."
              )}
            />
          </div>

          {secErr && (
            <p className="card p-6 text-center text-sm font-semibold" style={{ color: "var(--danger)" }}>
              {tr("Could not load the sections of this Act.", "इस अधिनियम की धाराएँ लोड नहीं हो सकीं।", "ਇਸ ਐਕਟ ਦੀਆਂ ਧਾਰਾਵਾਂ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀਆਂ।")}
            </p>
          )}

          {!secErr && secs === null && (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((k) => (
                <div key={k} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          )}

          {secs && (
            <>
              <div className="flex items-center justify-between text-xs text-muted font-bold">
                <span>
                  {shown.length.toLocaleString("en-IN")} {tr("provisions found", "प्रावधान मिले", "ਧਾਰਾਵਾਂ ਮਿਲੀਆਂ")}
                </span>
                {q && (
                  <button type="button" onClick={() => setQ("")} className="text-accent hover:underline">
                    {tr("Clear section search", "खोज साफ़ करें", "ਸਾਫ਼ ਕਰੋ")}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {shown.slice(0, limit).map((r, i) => {
                  const id = r.section + "-" + i;
                  const isOpen = open === id;
                  return (
                    <article
                      key={id}
                      className={`card acc transition-all border-2 ${
                        isOpen ? "acc-open border-amber-500/80 bg-surface" : "border-line bg-surface hover:border-line"
                      }`}
                      style={{ "--tone": sel.tone }}
                    >
                      <button
                        type="button"
                        className="acc-head !py-3 px-4 sm:px-6"
                        aria-expanded={isOpen}
                        onClick={() => setOpen(isOpen ? null : id)}
                      >
                        <span className="min-w-0 flex-1 text-left">
                          <span className="tone-badge font-mono font-bold text-xs">
                            {r.unit} {r.section}
                          </span>
                          {r.title && (
                            <span className="mt-1 block font-black text-ink text-sm sm:text-base tracking-tight">
                              {r.title}
                            </span>
                          )}
                          {!isOpen && r.text && (
                            <span className="mt-1 line-clamp-2 block text-xs sm:text-sm text-muted font-medium leading-relaxed">
                              {r.text}
                            </span>
                          )}
                        </span>
                        <span className="acc-chev">
                          <ChevronDown size={18} />
                        </span>
                      </button>
                      <div className={"acc-body " + (isOpen ? "open" : "")}>
                        <div>
                          <div className="acc-inner px-4 sm:px-6 pb-5 pt-2">
                            <div className="p-4 rounded-xl bg-surface-2 border border-line font-mono text-xs sm:text-sm text-ink whitespace-pre-wrap leading-relaxed shadow-inner">
                              {r.text}
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                              <button
                                type="button"
                                className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs font-bold"
                                onClick={() =>
                                  nav("/assistant", {
                                    state: {
                                      q: `Explain ${r.unit} ${r.section} of ${sel.name} in simple everyday language with practical citizen rights and consequences.`,
                                    },
                                  })
                                }
                              >
                                <Sparkles size={14} />
                                {tr("Explain this Section with AI", "एआई से इस धारा का अर्थ समझें", "ਇਸ ਧਾਰਾ ਦਾ ਅਰਥ ਸਮਝੋ")}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {shown.length > limit && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    className="btn btn-ghost border border-line text-xs font-bold text-ink hover:bg-surface-2 px-6"
                    onClick={() => setLimit(limit + PAGE)}
                  >
                    {tr("Load more sections", "और धाराएँ देखें", "ਹੋਰ ਵੇਖੋ")} ({shown.length - limit} {tr("remaining", "शेष", "ਬਾਕੀ")})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
