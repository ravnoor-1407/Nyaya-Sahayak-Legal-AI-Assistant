import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mic, Send, Sparkles, Scale, RotateCcw, Info, Lock, LogIn } from "lucide-react";
import { useLang } from "../LangContext";
import { useAuth } from "../AuthContext";
import { chat } from "../api";
import { FAQ } from "../data/faq";
import AnswerBlock from "../components/AnswerBlock";

const VOICE = { en: "en-IN", hi: "hi-IN", pa: "pa-IN" };

export default function Assistant() {
  const { lang, tr } = useLang();
  const { user, ready } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const started = useRef(false);
  const scroller = useRef(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, busy]);

  const send = async (text) => {
    const question = (text !== undefined ? text : input).trim();
    if (!question || busy) return;
    if (!user) {
      navigate("/auth", { state: { from: "/assistant", q: question } });
      return;
    }
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setBusy(true);
    try {
      const d = await chat(question, lang);
      setMsgs((m) => [
        ...m,
        { role: "assistant", text: d.answer || "...", sources: d.sources || [], lang },
      ]);
    } catch (e) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          lang,
          sources: [],
          text: tr(
            "Could not reach the server. Start the backend and try again.",
            "सर्वर तक नहीं पहुँच पाए। बैकएंड चालू करके दोबारा कोशिश करें।",
            "ਸਰਵਰ ਤੱਕ ਨਹੀਂ ਪਹੁੰਚ ਸਕੇ। ਬੈਕਐਂਡ ਚਾਲੂ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
          ),
        },
      ]);
    }
    setBusy(false);
  };

  useEffect(() => {
    const q = location.state && location.state.q;
    if (q && !started.current) {
      if (ready && !user) {
        navigate("/auth", { replace: true, state: { from: "/assistant", q } });
        return;
      }
      if (user) {
        started.current = true;
        send(q);
        navigate(location.pathname, { replace: true, state: null });
      }
    }
  }, [user, ready]);

  const voice = () => {
    if (!user) {
      navigate("/auth", { state: { from: "/assistant" } });
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input is not supported in this browser. Use Chrome.");
      return;
    }
    const rec = new SR();
    rec.lang = VOICE[lang] || "en-IN";
    rec.onresult = (e) => setInput(e.results[0][0].transcript);
    rec.start();
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send();
  };

  return (
    <div className="card card-accent card-raised mx-auto flex h-[calc(100dvh-8.5rem)] min-h-[34rem] max-w-3xl flex-col overflow-hidden">
      <div className="chat-head flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="btn-primary grid h-10 w-10 place-items-center rounded-xl">
            <Scale size={18} />
          </span>
          <div className="leading-tight">
            <div className="font-display flex flex-wrap items-center gap-2 text-base font-bold">
              {tr("Nyaya AI Legal Assistant", "न्याय एआई कानूनी सहायक", "ਨਿਆਂ ਏਆਈ ਕਾਨੂੰਨੀ ਸਹਾਇਕ")}
              <span className="tone-badge" style={{ "--tone": "var(--c-green)" }}>
                {tr("Grounded RAG", "आधारित आरएजी", "ਆਧਾਰਿਤ ਆਰਏਜੀ")}
              </span>
            </div>
            <div className="text-xs text-muted">
              {tr(
                "Grounded in indexed statutes · Voice readout · Free public help",
                "शामिल कानूनों पर आधारित · आवाज़ में सुनें · निःशुल्क जन-सहायता",
                "ਸ਼ਾਮਲ ਕਾਨੂੰਨਾਂ 'ਤੇ ਆਧਾਰਿਤ · ਆਵਾਜ਼ ਵਿੱਚ ਸੁਣੋ · ਮੁਫ਼ਤ ਜਨਤਕ ਸਹਾਇਤਾ"
              )}
            </div>
          </div>
        </div>
        {msgs.length > 0 && user && (
          <button type="button" onClick={() => setMsgs([])} className="btn btn-ghost btn-sm">
            <RotateCcw size={13} />
            {tr("New chat", "नई चैट", "ਨਵੀਂ ਚੈਟ")}
          </button>
        )}
      </div>

      {ready && !user && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 text-xs font-medium"
          style={{ background: "var(--accent-soft)" }}
        >
          <span className="flex items-center gap-1.5">
            <Lock size={13} className="shrink-0 text-accent" />
            {tr(
              "Sign in is required to ask questions to the Nyaya AI Assistant.",
              "न्याय एआई सहायक से प्रश्न पूछने के लिए साइन इन आवश्यक है।",
              "ਨਿਆਂ ਏਆਈ ਸਹਾਇਕ ਨੂੰ ਸਵਾਲ ਪੁੱਛਣ ਲਈ ਸਾਈਨ ਇਨ ਲੋੜੀਂਦਾ ਹੈ।"
            )}
          </span>
          <Link to="/auth" state={{ from: "/assistant" }} className="btn btn-primary btn-sm py-1 px-3 text-xs font-bold">
            {tr("Sign in now →", "अभी साइन इन करें →", "ਹੁਣੇ ਸਾਈਨ ਇਨ ਕਰੋ →")}
          </Link>
        </div>
      )}

      <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-5 flex flex-col">
        {ready && !user ? (
          <div className="mx-auto my-auto flex max-w-md flex-col items-center justify-center py-6 px-4 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-accent shadow-lg shadow-amber-500/10">
              <Lock size={30} />
            </div>
            <h2 className="font-display text-2xl font-bold">
              {tr(
                "Sign in to Consult AI Assistant",
                "एआई सहायक से पूछने के लिए साइन इन करें",
                "ਏਆਈ ਸਹਾਇਕ ਨੂੰ ਪੁੱਛਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ"
              )}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {tr(
                "To ask legal questions and receive answers cited directly from Indian statutes, please sign in with your email or Google account.",
                "कानूनी प्रश्न पूछने और भारतीय कानूनों से सीधे संदर्भ सहित उत्तर पाने के लिए, कृपया अपने ईमेल या गूगल खाते से साइन इन करें।",
                "ਕਾਨੂੰਨੀ ਸਵਾਲ ਪੁੱਛਣ ਅਤੇ ਭਾਰਤੀ ਕਾਨੂੰਨਾਂ ਤੋਂ ਸਿੱਧੇ ਹਵਾਲਿਆਂ ਨਾਲ ਜਵਾਬ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ, ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਈਮੇਲ ਜਾਂ ਗੂਗਲ ਖਾਤੇ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰੋ।"
              )}
            </p>

            <div className="mt-6 flex w-full flex-col gap-2.5">
              <Link
                to="/auth"
                state={{ from: "/assistant", q: input }}
                className="btn btn-primary w-full justify-center py-2.5 text-sm font-bold shadow-md"
              >
                <LogIn size={16} />
                {tr(
                  "Sign in with Google or Email",
                  "Google या ईमेल से साइन इन करें",
                  "Google ਜਾਂ ਈਮੇਲ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰੋ"
                )}
              </Link>
              <Link
                to="/"
                className="btn btn-ghost w-full justify-center text-xs text-muted"
              >
                {tr("Back to home", "मुख्य पृष्ठ पर वापस जाएँ", "ਮੁੱਖ ਪੰਨੇ 'ਤੇ ਵਾਪਸ ਜਾਓ")}
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-left text-xs text-muted border-t pt-4 w-full">
              <div className="rounded-lg bg-surface/50 p-2.5 border border-line">
                <div className="font-bold text-ink">✓ {tr("Statutory Grounding", "कानूनी सटीकता", "ਕਾਨੂੰਨੀ ਸ਼ੁੱਧਤਾ")}</div>
                <div className="mt-0.5">{tr("Cites BNS, BNSS, BSA & Constitution", "बीएनएस, बीएनएसएस व संविधान की धाराएं", "ਬੀਐਨਐਸ, ਬੀਐਨਐਸਐਸ ਅਤੇ ਸੰਵਿਧਾਨ ਦੀਆਂ ਧਾਰਾਵਾਂ")}</div>
              </div>
              <div className="rounded-lg bg-surface/50 p-2.5 border border-line">
                <div className="font-bold text-ink">✓ {tr("100% Free Public Good", "पूर्णतः निःशुल्क जनसेवा", "ਬਿਲਕੁਲ ਮੁਫ਼ਤ ਜਨਤਕ ਸੇਵਾ")}</div>
                <div className="mt-0.5">{tr("Articles 21 & 39A compliance", "अनुच्छेद 21 व 39A के अनुरूप", "ਅਨੁਛੇਦ 21 ਅਤੇ 39A ਅਨੁਸਾਰ")}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className={"space-y-4" + (msgs.length === 0 ? " my-auto" : "")}>
            {msgs.length === 0 && (
              <div className="mx-auto max-w-lg">
                <h2 className="font-display text-center text-2xl font-bold">
                  {tr("Welcome to NyayaSahayak", "न्यायसहायक में आपका स्वागत है", "ਨਿਆਂਸਹਾਇਕ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ")}
                </h2>
                <p className="mx-auto mt-1 max-w-md text-center text-sm text-muted">
                  {tr(
                    "Ask any question in plain language. Answers come from the indexed Acts and cite the section.",
                    "सरल भाषा में कोई भी प्रश्न पूछिए। उत्तर शामिल अधिनियमों से आते हैं और धारा बताते हैं।",
                    "ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛੋ। ਜਵਾਬ ਸ਼ਾਮਲ ਐਕਟਾਂ ਤੋਂ ਆਉਂਦੇ ਹਨ ਅਤੇ ਧਾਰਾ ਦੱਸਦੇ ਹਨ।"
                  )}
                </p>
                <div className="mb-2 mt-5 flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted">
                    {tr("Frequently asked questions", "अक्सर पूछे जाने वाले प्रश्न", "ਅਕਸਰ ਪੁੱਛੇ ਜਾਂਦੇ ਸਵਾਲ")}
                  </span>
                  <span className="text-accent">
                    {tr("Click to ask instantly", "तुरंत पूछने के लिए दबाएँ", "ਤੁਰੰਤ ਪੁੱਛਣ ਲਈ ਦਬਾਓ")}
                  </span>
                </div>
                <div className="space-y-2">
                  {FAQ.map((f, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => send(tr(...f.q))}
                      className={
                        "rise zoom-hover-sm group card flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium " +
                        (i === 0 ? "faq-top" : "")
                      }
                      style={{ animationDelay: i * 70 + "ms" }}
                    >
                      <span>{tr(...f.q)}</span>
                      <Sparkles size={15} className="icon-pop shrink-0 text-accent" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m, i) => {
              if (m.role === "user") {
                return (
                  <div key={i} className="msg-in flex justify-end">
                    <div className="bubble-user max-w-[85%] px-4 py-2.5 text-sm">{m.text}</div>
                  </div>
                );
              }
              return (
                <div key={i} className="msg-in flex justify-start">
                  <div className="bubble-ai max-w-[92%] px-4 py-3">
                    <AnswerBlock text={m.text} sources={m.sources} lang={m.lang} />
                  </div>
                </div>
              );
            })}

            {busy && (
              <div className="flex items-center gap-2 text-sm text-muted" role="status">
                <Scale size={16} className="animate-bounce text-accent" />
                {tr("Searching the law…", "कानून में खोज रहे हैं…", "ਕਾਨੂੰਨ ਵਿੱਚ ਖੋਜ ਰਹੇ ਹਾਂ…")}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t p-3">
        {ready && !user ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-ink">
              <Lock size={16} className="text-accent shrink-0" />
              <span>
                {tr(
                  "You must be signed in to send questions to the AI Assistant.",
                  "एआई सहायक को प्रश्न भेजने के लिए आपका साइन इन होना अनिवार्य है।",
                  "ਏਆਈ ਸਹਾਇਕ ਨੂੰ ਸਵਾਲ ਭੇਜਣ ਲਈ ਤੁਹਾਡਾ ਸਾਈਨ ਇਨ ਹੋਣਾ ਲਾਜ਼ਮੀ ਹੈ।"
                )}
              </span>
            </div>
            <Link
              to="/auth"
              state={{ from: "/assistant" }}
              className="btn btn-primary btn-sm shrink-0 whitespace-nowrap"
            >
              <LogIn size={14} />
              {tr("Sign in to ask", "पूछने के लिए साइन इन करें", "ਪੁੱਛਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ")}
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex gap-2">
            <button
              type="button"
              onClick={voice}
              className="btn btn-ghost px-3"
              aria-label={tr("Speak your question", "बोलकर पूछें", "ਬੋਲ ਕੇ ਪੁੱਛੋ")}
            >
              <Mic size={17} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input flex-1"
              placeholder={tr(
                "Ask any legal question, e.g. Can police arrest without a warrant?",
                "कोई भी कानूनी प्रश्न पूछिए, जैसे: क्या पुलिस बिना वारंट गिरफ्तार कर सकती है?",
                "ਕੋਈ ਵੀ ਕਾਨੂੰਨੀ ਸਵਾਲ ਪੁੱਛੋ, ਜਿਵੇਂ: ਕੀ ਪੁਲਿਸ ਬਿਨਾਂ ਵਾਰੰਟ ਗ੍ਰਿਫ਼ਤਾਰ ਕਰ ਸਕਦੀ ਹੈ?"
              )}
            />
            <button type="submit" disabled={busy || !input.trim()} className="btn btn-primary">
              <Send size={16} />
              <span className="hidden sm:inline">{tr("Consult", "पूछें", "ਪੁੱਛੋ")}</span>
            </button>
          </form>
        )}
        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
          <Info size={12} className="shrink-0" />
          {tr(
            "General legal information, not legal advice. For free legal aid call 15100.",
            "यह सामान्य कानूनी जानकारी है, कानूनी सलाह नहीं। निःशुल्क विधिक सहायता के लिए 15100 पर कॉल करें।",
            "ਇਹ ਆਮ ਕਾਨੂੰਨੀ ਜਾਣਕਾਰੀ ਹੈ, ਕਾਨੂੰਨੀ ਸਲਾਹ नहीं। ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਲਈ 15100 'ਤੇ ਕਾਲ ਕਰੋ।"
          )}
        </p>
      </div>
    </div>
  );
}
