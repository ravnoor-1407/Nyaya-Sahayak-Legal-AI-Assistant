import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Library, Search, ChevronDown, ArrowLeft, Sparkles, RotateCcw } from "lucide-react";
import { useLang } from "../LangContext";
import { getJSON } from "../api";
import { list, pick, flat } from "../lib/normalize";

const TONES = ["var(--c-gold)", "var(--c-blue)", "var(--c-green)", "var(--c-purple)", "var(--c-rose)"];
const PAGE = 40;

export default function Acts() {
  const { tr } = useLang();
  const nav = useNavigate();
  const [acts, setActs] = useState(null);
  const [error, setError] = useState(false);
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
            return {
              id: name,
              name,
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
      <section className="hero-bg card card-accent card-raised px-5 py-8 sm:px-10">
        <span className="tone-badge rise" style={{ "--tone": "var(--c-blue)" }}>
          <Library size={12} />
          {tr("Browse the indexed Acts", "शामिल अधिनियम देखें", "ਸ਼ਾਮਲ ਐਕਟ ਵੇਖੋ")}
        </span>
        <h1 className="rise mt-3 text-3xl font-bold sm:text-4xl" style={{ animationDelay: "60ms" }}>
          {tr("Acts and sections", "अधिनियम और धाराएँ", "ਐਕਟ ਅਤੇ ਧਾਰਾਵਾਂ")}
        </h1>
        <p className="rise mt-2 max-w-2xl text-muted" style={{ animationDelay: "120ms" }}>
          {tr(
            "Pick an Act to read its sections. Filter by section number, title or any word in the text.",
            "धाराएँ पढ़ने के लिए कोई अधिनियम चुनिए। धारा संख्या, शीर्षक या पाठ के किसी शब्द से छाँटिए।",
            "ਧਾਰਾਵਾਂ ਪੜ੍ਹਨ ਲਈ ਕੋਈ ਐਕਟ ਚੁਣੋ। ਧਾਰਾ ਨੰਬਰ, ਸਿਰਲੇਖ ਜਾਂ ਪਾਠ ਦੇ ਕਿਸੇ ਸ਼ਬਦ ਨਾਲ ਛਾਣੋ।"
          )}
        </p>
      </section>

      {!sel && (
        <>
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
          {!error && acts === null && (
            <div className="grid gap-4 md:grid-cols-2">
              {[0, 1, 2, 3].map((k) => (
                <div key={k} className="skeleton h-28" />
              ))}
            </div>
          )}
          {acts && acts.length === 0 && (
            <p className="card p-6 text-center text-muted">
              {tr("No Acts found.", "कोई अधिनियम नहीं मिला।", "ਕੋਈ ਐਕਟ ਨਹੀਂ ਮਿਲਿਆ।")}
            </p>
          )}
          {acts && acts.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {acts.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => choose(a)}
                  className="card tone-card zoom-hover group rise p-5 text-left"
                  style={{ "--tone": a.tone, animationDelay: i * 60 + "ms" }}
                >
                  <div className="flex items-start gap-3">
                    <span className="tone-icon">
                      <Library size={20} className="icon-pop" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold">{a.name}</h3>
                      {a.count && (
                        <span className="tone-badge mt-1 font-mono">
                          {a.count.toLocaleString("en-IN")} {tr("passages", "अंश", "ਅੰਸ਼")}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {sel && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSel(null)}>
              <ArrowLeft size={14} />
              {tr("All Acts", "सभी अधिनियम", "ਸਾਰੇ ਐਕਟ")}
            </button>
            <h2 className="text-xl font-bold">{sel.name}</h2>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-3.5 text-accent" />
            <input
              className="input pl-10"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(PAGE);
              }}
              placeholder={tr("Filter by section number, title or word", "धारा संख्या, शीर्षक या शब्द से छाँटिए", "ਧਾਰਾ ਨੰਬਰ, ਸਿਰਲੇਖ ਜਾਂ ਸ਼ਬਦ ਨਾਲ ਛਾਣੋ")}
            />
          </div>

          {secErr && (
            <p className="card p-6 text-center" style={{ color: "var(--danger)" }}>
              {tr("Could not load the sections of this Act.", "इस अधिनियम की धाराएँ लोड नहीं हो सकीं।", "ਇਸ ਐਕਟ ਦੀਆਂ ਧਾਰਾਵਾਂ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀਆਂ।")}
            </p>
          )}
          {!secErr && secs === null && (
            <div className="space-y-3">
              {[0, 1, 2].map((k) => (
                <div key={k} className="skeleton h-16" />
              ))}
            </div>
          )}
          {secs && (
            <>
              <p className="text-xs text-muted">
                {shown.length.toLocaleString("en-IN")} {tr("sections", "धाराएँ", "ਧਾਰਾਵਾਂ")}
              </p>
              <div className="space-y-3">
                {shown.slice(0, limit).map((r, i) => {
                  const id = r.section + "-" + i;
                  const isOpen = open === id;
                  return (
                    <article
                      key={id}
                      className={"card acc zoom-hover-sm " + (isOpen ? "acc-open" : "")}
                      style={{ "--tone": sel.tone }}
                    >
                      <button
                        type="button"
                        className="acc-head !py-3"
                        aria-expanded={isOpen}
                        onClick={() => setOpen(isOpen ? null : id)}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="tone-badge font-mono">
                            {r.unit} {r.section}
                          </span>
                          {r.title && <span className="mt-1 block font-semibold">{r.title}</span>}
                          {!isOpen && r.text && (
                            <span className="mt-1 line-clamp-2 block text-sm text-muted">{r.text}</span>
                          )}
                        </span>
                        <span className="acc-chev">
                          <ChevronDown size={18} />
                        </span>
                      </button>
                      <div className={"acc-body " + (isOpen ? "open" : "")}>
                        <div>
                          <div className="acc-inner">
                            <p className="whitespace-pre-wrap text-sm">{r.text}</p>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm mt-4"
                              onClick={() =>
                                nav("/assistant", {
                                  state: { q: "Explain " + r.unit + " " + r.section + " of " + sel.name + " in simple words" },
                                })
                              }
                            >
                              <Sparkles size={14} />
                              {tr("Ask AI about this", "इस बारे में एआई से पूछें", "ਇਸ ਬਾਰੇ ਏਆਈ ਤੋਂ ਪੁੱਛੋ")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              {shown.length > limit && (
                <div className="text-center">
                  <button type="button" className="btn btn-ghost" onClick={() => setLimit(limit + PAGE)}>
                    {tr("Show more", "और दिखाएँ", "ਹੋਰ ਵੇਖੋ")}
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