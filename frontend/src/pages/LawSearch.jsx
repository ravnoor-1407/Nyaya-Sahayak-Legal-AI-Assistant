import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Sparkles, ScanSearch } from "lucide-react";
import { useLang } from "../LangContext";
import { getJSON } from "../api";
import { list, pick, flat } from "../lib/normalize";

const TONES = ["var(--c-gold)", "var(--c-blue)", "var(--c-green)", "var(--c-purple)", "var(--c-rose)"];

const IDEAS = [
  ["Fundamental duties", "मौलिक कर्तव्य", "ਮੌਲਿਕ ਫ਼ਰਜ਼"],
  ["Right to equality", "समानता का अधिकार", "ਬਰਾਬਰੀ ਦਾ ਅਧਿਕਾਰ"],
  ["Theft punishment", "चोरी की सज़ा", "ਚੋਰੀ ਦੀ ਸਜ਼ਾ"],
  ["Bail", "जमानत", "ਜ਼ਮਾਨਤ"],
  ["RTI time limit", "आरटीआई समय सीमा", "ਆਰਟੀਆਈ ਸਮਾਂ ਸੀਮਾ"],
  ["Consumer refund", "उपभोक्ता रिफंड", "ਖਪਤਕਾਰ ਰਿਫੰਡ"],
];

export default function LawSearch() {
  const { tr } = useLang();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [act, setAct] = useState("");
  const [k, setK] = useState(4);
  const [actList, setActList] = useState([]);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const [asked, setAsked] = useState("");

  useEffect(() => {
    getJSON("/api/acts")
      .then((d) =>
        setActList(
          list(d, "acts", "items", "results").map((r) => ({
            id: String(pick(r, "id", "act_id", "slug", "name", "act", "title")),
            name: String(pick(r, "name", "act", "title", "id")),
          }))
        )
      )
      .catch(() => {});
  }, []);

  const run = async (text) => {
    const query = (text !== undefined ? text : q).trim();
    if (!query) return;
    setQ(query);
    setBusy(true);
    setErr(false);
    setAsked(query);
    try {
      let url = "/api/search?q=" + encodeURIComponent(query) + "&k=" + k;
      if (act) url += "&act=" + encodeURIComponent(act);
      const d = await getJSON(url);
      const rows = list(d, "results", "hits", "items", "sources").map((r) => {
        const m = flat(r);
        const actName = String(pick(m, "act", "act_name"));
        const unit = String(pick(m, "unit") || "Section");
        const section = String(pick(m, "section", "number", "article"));
        return {
          act: actName,
          label: String(pick(m, "label")) || [actName, unit, section].filter(Boolean).join(" "),
          title: String(pick(m, "title", "heading")),
          text: String(pick(m, "text", "snippet", "document", "content")),
        };
      });
      setRes(rows.slice(0, k));
    } catch (e) {
      setErr(true);
      setRes(null);
    }
    setBusy(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    run();
  };

  return (
    <div className="space-y-6">
      <section className="hero-bg card card-accent card-raised px-5 py-8 sm:px-10">
        <span className="tone-badge rise" style={{ "--tone": "var(--c-green)" }}>
          <ScanSearch size={12} />
          {tr("Direct passage retrieval", "सीधा अंश पुनर्प्राप्ति", "ਸਿੱਧੀ ਅੰਸ਼ ਪ੍ਰਾਪਤੀ")}
        </span>
        <h1 className="rise mt-3 text-3xl font-bold sm:text-4xl" style={{ animationDelay: "60ms" }}>
          {tr("Indian statutory document search", "भारतीय कानूनी दस्तावेज़ खोज", "ਭਾਰਤੀ ਕਾਨੂੰਨੀ ਦਸਤਾਵੇਜ਼ ਖੋਜ")}
        </h1>
        <p className="rise mt-2 max-w-2xl text-muted" style={{ animationDelay: "120ms" }}>
          {tr(
            "Search by meaning, not just exact words. You can type in English, Hindi or Punjabi.",
            "सिर्फ़ सटीक शब्दों से नहीं, अर्थ से खोजिए। आप अंग्रेज़ी, हिंदी या पंजाबी में लिख सकते हैं।",
            "ਸਿਰਫ਼ ਸਹੀ ਸ਼ਬਦਾਂ ਨਾਲ ਨਹੀਂ, ਅਰਥ ਨਾਲ ਖੋਜੋ। ਤੁਸੀਂ ਅੰਗਰੇਜ਼ੀ, ਹਿੰਦੀ ਜਾਂ ਪੰਜਾਬੀ ਵਿੱਚ ਲਿਖ ਸਕਦੇ ਹੋ।"
          )}
        </p>

        <form onSubmit={onSubmit} className="rise mt-5 space-y-3" style={{ animationDelay: "180ms" }}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3.5 text-accent" />
              <input
                className="input pl-10"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={tr(
                  "Search legal topics (e.g. Fundamental Duties, Constitutional Remedies, Legal Aid)",
                  "कानूनी विषय खोजें (जैसे मौलिक कर्तव्य, संवैधानिक उपचार, विधिक सहायता)",
                  "ਕਾਨੂੰਨੀ ਵਿਸ਼ੇ ਖੋਜੋ (ਜਿਵੇਂ ਮੌਲਿਕ ਫ਼ਰਜ਼, ਸੰਵਿਧਾਨਕ ਉਪਾਅ, ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ)"
                )}
                aria-label={tr("Search the laws", "कानून खोजें", "ਕਾਨੂੰਨ ਖੋਜੋ")}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={busy || !q.trim()}>
              {busy ? tr("Searching…", "खोज रहे हैं…", "ਖੋਜ ਰਹੇ ਹਾਂ…") : tr("Search corpus", "संग्रह खोजें", "ਸੰਗ੍ਰਹਿ ਖੋਜੋ")}
              <Search size={15} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-muted">
              <SlidersHorizontal size={14} className="text-accent" />
              {tr("Filters", "फ़िल्टर", "ਫਿਲਟਰ")}
            </span>
            <select
              className="input w-auto"
              value={act}
              onChange={(e) => setAct(e.target.value)}
              aria-label={tr("Act", "अधिनियम", "ਐਕਟ")}
            >
              <option value="">{tr("All Acts", "सभी अधिनियम", "ਸਾਰੇ ਐਕਟ")}</option>
              {actList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <select
              className="input w-auto"
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              aria-label={tr("Passages to retrieve", "कितने अंश", "ਕਿੰਨੇ ਅੰਸ਼")}
            >
              {[4, 6, 10].map((n) => (
                <option key={n} value={n}>
                  {tr("Top", "शीर्ष", "ਚੋਟੀ ਦੇ")} {n}
                </option>
              ))}
            </select>
          </div>
        </form>
      </section>

      {!res && !busy && !err && (
        <div className="card p-5">
          <p className="text-sm font-semibold">{tr("Try one of these", "इनमें से कोई आज़माइए", "ਇਨ੍ਹਾਂ ਵਿੱਚੋਂ ਕੋਈ ਅਜ਼ਮਾਓ")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {IDEAS.map((t, i) => (
              <button key={i} type="button" className="chip" onClick={() => run(t[0])}>
                <Search size={12} />
                {tr(...t)}
              </button>
            ))}
          </div>
        </div>
      )}

      {busy && (
        <div className="space-y-3">
          {[0, 1, 2].map((n) => (
            <div key={n} className="skeleton h-24" />
          ))}
        </div>
      )}

      {err && (
        <p className="card p-6 text-center" style={{ color: "var(--danger)" }}>
          {tr(
            "The search failed. Check that the backend is running and try again.",
            "खोज विफल रही। जाँचिए कि बैकएंड चालू है और दोबारा कोशिश कीजिए।",
            "ਖੋਜ ਅਸਫਲ ਰਹੀ। ਜਾਂਚੋ ਕਿ ਬੈਕਐਂਡ ਚਾਲੂ ਹੈ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
          )}
        </p>
      )}

      {res && !busy && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {res.length} {tr("passages for", "अंश, खोज:", "ਅੰਸ਼, ਖੋਜ:")} <b className="text-ink">{asked}</b>
          </p>
          {res.length === 0 && (
            <p className="card p-6 text-center text-muted">
              {tr(
                "Nothing found in the indexed laws. Try different words.",
                "शामिल कानूनों में कुछ नहीं मिला। अलग शब्द आज़माइए।",
                "ਸ਼ਾਮਲ ਕਾਨੂੰਨਾਂ ਵਿੱਚ ਕੁਝ ਨਹੀਂ ਮਿਲਿਆ। ਵੱਖਰੇ ਸ਼ਬਦ ਅਜ਼ਮਾਓ।"
              )}
            </p>
          )}
          {res.map((r, i) => (
            <article
              key={i}
              className="card tone-card zoom-hover-sm rise p-5"
              style={{ "--tone": TONES[i % TONES.length], animationDelay: i * 70 + "ms" }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="tone-badge font-mono">#{i + 1}</span>
                <span className="tone-badge font-mono">{r.label}</span>
              </div>
              {r.title && <h3 className="mt-2 text-lg font-bold">{r.title}</h3>}
              <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm text-muted">{r.text}</p>
              <button
                type="button"
                className="btn btn-primary btn-sm mt-4"
                onClick={() => nav("/assistant", { state: { q: "Explain " + r.label + " in simple words" } })}
              >
                <Sparkles size={14} />
                {tr("Ask AI about this", "इस बारे में एआई से पूछें", "ਇਸ ਬਾਰੇ ਏਆਈ ਤੋਂ ਪੁੱਛੋ")}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}