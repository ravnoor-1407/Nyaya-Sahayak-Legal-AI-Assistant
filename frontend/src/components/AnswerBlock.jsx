import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Volume2, Square, ThumbsUp, ThumbsDown, Copy, Check } from "lucide-react";
import { useLang } from "../LangContext";
import { sendFeedback } from "../api";

const SHORT = {
  "Bharatiya Nyaya Sanhita": "BNS",
  "Bharatiya Nagarik Suraksha Sanhita": "BNSS",
  "Bharatiya Sakshya Adhiniyam": "BSA",
  "Information Technology Act": "IT Act",
  "Consumer Protection Act": "Consumer Act",
  "Constitution of India": "Constitution",
};

function chipLabel(s) {
  if (s.act === "IPC to BNS Mapping") return "IPC " + s.section;
  const name = s.act.split(",")[0];
  return (SHORT[name] || name) + " " + s.unit + " " + s.section;
}

const VOICE = { en: "en-IN", hi: "hi-IN", pa: "pa-IN" };

export default function AnswerBlock({
  text,
  sources = [],
  lang = "en",
  compact = false,
  feedback = true,
}) {
  const { tr } = useLang();
  const [open, setOpen] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [voted, setVoted] = useState(null);
  const [copied, setCopied] = useState(false);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    return () => {
      if (canSpeak) window.speechSynthesis.cancel();
    };
  }, [canSpeak]);

  const speak = () => {
    if (!canSpeak) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const plain = text
      .replace(/\[[^\]]*\]/g, " ")
      .replace(/^\s*[-*]\s+/gm, "")
      .replace(/[*_#`>|]/g, " ");
    const u = new SpeechSynthesisUtterance(plain);
    u.lang = VOICE[lang] || "en-IN";
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      /* ignore */
    }
  };

  const vote = (up) => {
    setVoted(up);
    sendFeedback(up);
  };

  const active = open !== null ? sources[open] : null;

  return (
    <div>
      <div className={"md text-sm " + (compact ? "max-h-56 overflow-y-auto pr-1" : "")}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>

      {sources.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-xs text-muted">
            {tr("Sources", "स्रोत", "ਸਰੋਤ")}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((s, i) => (
              <button
                key={i}
                type="button"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
                className={"chip chip-cite " + (open === i ? "chip-active" : "")}
              >
                {chipLabel(s)}
              </button>
            ))}
          </div>
          {active && (
            <div className="msg-in bg-surface-2 mt-2 whitespace-pre-wrap rounded-xl border p-3 text-xs text-muted">
              <b className="text-ink">
                {active.label}
                {active.title ? " - " + active.title : ""}
              </b>
              {"\n"}
              {active.snippet}
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {canSpeak && (
          <button type="button" onClick={speak} className="chip">
            {speaking ? <Square size={12} /> : <Volume2 size={13} />}
            {speaking ? tr("Stop", "रोकें", "ਰੋਕੋ") : tr("Listen", "सुनें", "ਸੁਣੋ")}
          </button>
        )}
        <button type="button" onClick={copy} className="chip">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? tr("Copied", "कॉपी हुआ", "ਕਾਪੀ ਹੋਇਆ") : tr("Copy", "कॉपी", "ਕਾਪੀ")}
        </button>
        {feedback && (
          <span className="ml-auto flex">
            <button
              type="button"
              className="icon-btn"
              aria-label="Helpful"
              aria-pressed={voted === true}
              onClick={() => vote(true)}
              style={voted === true ? { color: "var(--ok)" } : undefined}
            >
              <ThumbsUp size={15} />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Not helpful"
              aria-pressed={voted === false}
              onClick={() => vote(false)}
              style={voted === false ? { color: "var(--danger)" } : undefined}
            >
              <ThumbsDown size={15} />
            </button>
          </span>
        )}
      </div>
    </div>
  );
}