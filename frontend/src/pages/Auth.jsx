import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogIn, UserPlus, ShieldCheck, LayoutDashboard, LogOut,
  AlertTriangle, CheckCircle2, Mail, Lock, Sparkles, ArrowRight,
  Eye, EyeOff, Dices, User,
} from "lucide-react";
import { useLang } from "../LangContext";
import { useAuth } from "../AuthContext";

const SAMPLE_NAMES = [
  "Priya Sharma",
  "Rahul Kumar",
  "Ananya Singh",
  "Amit Patel",
  "Simran Kaur",
  "Vikram Malhotra",
  "Neha Gupta",
  "Arjun Rao",
];

export default function Auth() {
  const { tr } = useLang();
  const { user, ready, login, register, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  // Mode: "in" for Sign In, "up" for Sign Up
  const [mode, setMode] = useState(
    location.state && location.state.mode === "up" ? "up" : "in"
  );

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State feedback
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");

  const messages = {
    invalid_email: tr(
      "Please enter a valid email address (e.g. user@example.com).",
      "कृपया एक मान्य ईमेल पता दर्ज करें (उदा. user@example.com)।",
      "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ ਈਮੇਲ ਪਤਾ ਦਰਜ ਕਰੋ (ਉਦਾ. user@example.com)।"
    ),
    empty_password: tr(
      "Please enter a password.",
      "कृपया पासवर्ड दर्ज करें।",
      "ਕਿਰਪਾ ਕਰਕੇ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ।"
    ),
    error: tr(
      "Could not reach the server. Please try again.",
      "सर्वर तक नहीं पहुँच पाए। कृपया दोबारा कोशिश कीजिए।",
      "ਸਰਵਰ ਤੱਕ ਨਹੀਂ ਪਹੁੰਚ ਸਕੇ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
    ),
  };

  const clearMessages = () => {
    setErr("");
    setSuccess("");
  };

  const handleFinishLogin = () => {
    setSuccess(
      tr(
        "Signed in successfully! Redirecting…",
        "सफलतापूर्वक साइन इन हुआ! भेजा जा रहा है…",
        "ਸਫਲਤਾਪੂਰਵਕ ਸਾਈਨ ਇਨ ਹੋ ਗਿਆ! ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ…"
      )
    );
    setTimeout(() => {
      const dest = (location.state && location.state.from) || "/";
      const pendingQ = location.state && location.state.q;
      nav(dest, { replace: true, state: pendingQ ? { q: pendingQ } : undefined });
    }, 450);
  };

  const handleFillRandom = () => {
    clearMessages();
    const randomId = Math.floor(100 + Math.random() * 900);
    const sample = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
    const handle = sample.toLowerCase().replace(/\s+/g, ".");
    setName(sample);
    setEmail(`${handle}.${randomId}@example.com`);
    setPassword("demo1234");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    clearMessages();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErr("invalid_email");
      return;
    }
    if (!cleanPassword) {
      setErr("empty_password");
      return;
    }

    setBusy(true);
    try {
      if (mode === "up") {
        await register(cleanName || undefined, cleanEmail, cleanPassword);
      } else {
        await login(cleanEmail, cleanPassword, cleanName || undefined);
      }
      handleFinishLogin();
    } catch (ex) {
      setErr(ex.code || "error");
    } finally {
      setBusy(false);
    }
  };

  // Already Signed In View
  if (ready && user) {
    const firstName = user.name ? user.name.split(" ")[0] : "Citizen";
    const initials = user.name
      ? user.name
          .split(" ")
          .filter(Boolean)
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "NS";

    return (
      <div className="mx-auto max-w-lg">
        <section className="hero-bg card card-accent card-raised p-6 text-center sm:p-8">
          <span className="btn-primary mx-auto grid h-14 w-14 place-items-center rounded-full text-lg font-bold">
            {initials}
          </span>
          <h1 className="mt-4 text-2xl font-bold text-accent">
            {tr("Hello", "नमस्ते", "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ")} {firstName}!
          </h1>
          <p className="mt-1 text-sm text-muted">
            {tr("You are currently signed in as", "आप वर्तमान में साइन इन हैं:", "ਤੁਸੀਂ ਵਰਤਮਾਨ ਵਿੱਚ ਸਾਈਨ ਇਨ ਹੋ:")}{" "}
            <b className="text-ink">{user.name}</b>
            {user.email && (
              <span className="block font-mono text-xs text-muted mt-0.5">{user.email}</span>
            )}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn btn-primary">
              <ArrowRight size={15} />
              {tr("Go to Home", "मुख्य पृष्ठ पर जाएँ", "ਮੁੱਖ ਪੰਨੇ 'ਤੇ ਜਾਓ")}
            </Link>
            <Link to="/dashboard" className="btn btn-ghost">
              <LayoutDashboard size={15} />
              {tr("My dashboard", "मेरा डैशबोर्ड", "ਮੇਰਾ ਡੈਸ਼ਬੋਰਡ")}
            </Link>
            <button type="button" className="btn btn-ghost" onClick={() => logout()}>
              <LogOut size={15} />
              {tr("Sign out", "साइन आउट", "ਸਾਈਨ ਆਊਟ")}
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      {/* Left Column: Demo Information & 1-Click Credentials */}
      <section className="hero-bg card card-accent card-raised p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <span className="tone-badge rise" style={{ "--tone": "var(--c-gold)" }}>
            <Sparkles size={13} />
            {tr("Basic Demo Mode", "बेसिक डेमो मोड", "ਬੇਸਿਕ ਡੈਮੋ ਮੋਡ")}
          </span>

          <h1 className="rise mt-3 text-3xl font-bold" style={{ animationDelay: "60ms" }}>
            {tr(
              "Sign in with any email & password",
              "किसी भी ईमेल और पासवर्ड से साइन इन करें",
              "ਕਿਸੇ ਵੀ ਈਮੇਲ ਅਤੇ ਪਾਸਵਰਡ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰੋ"
            )}
          </h1>

          <p className="mt-2 text-sm text-muted">
            {tr(
              "For this demo, simply enter any random email address and a password. No OTPs, email verifications, or phone confirmations are required.",
              "इस डेमो के लिए, बस कोई भी यादृच्छिक ईमेल पता और पासवर्ड दर्ज करें। किसी ओटीपी या ईमेल सत्यापन की आवश्यकता नहीं है।",
              "ਇਸ ਡੈਮੋ ਲਈ, ਬਸ ਕੋਈ ਵੀ ਬੇਤਰਤੀਬ ਈਮੇਲ ਪਤਾ ਅਤੇ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ। ਕਿਸੇ ਓਟੀਪੀ ਜਾਂ ਈਮੇਲ ਪੁਸ਼ਟੀਕਰਨ ਦੀ ਲੋੜ ਨਹੀਂ ਹੈ।"
            )}
          </p>

          <ul className="rise mt-5 space-y-3 text-sm" style={{ animationDelay: "120ms" }}>
            {[
              [
                [
                  "Instant Access: Type any email address and password to sign in immediately.",
                  "त्वरित पहुँच: तुरंत साइन इन करने के लिए कोई भी ईमेल और पासवर्ड लिखें।",
                  "ਤੁਰੰਤ ਪਹੁੰਚ: ਤੁਰੰਤ ਸਾਈਨ ਇਨ ਕਰਨ ਲਈ ਕੋਈ ਵੀ ਈਮੇਲ ਅਤੇ ਪਾਸਵਰਡ ਲਿਖੋ।"
                ],
                "var(--c-green)",
              ],
              [
                [
                  "AI Legal Assistant: Access legal consultations, rights guidance, and citations.",
                  "एआई कानूनी सहायक: कानूनी परामर्श, अधिकार मार्गदर्शन और संदर्भ प्राप्त करें।",
                  "ਏਆਈ ਕਾਨੂੰਨੀ ਸਹਾਇਕ: ਕਾਨੂੰਨੀ ਸਲਾਹ, ਅਧਿਕਾਰ ਮਾਰਗਦਰਸ਼ਨ ਅਤੇ ਹਵਾਲੇ ਪ੍ਰਾਪਤ ਕਰੋ।"
                ],
                "var(--c-blue)",
              ],
              [
                [
                  "Saved History: Your questions, dashboard bookmarks, and activity are preserved.",
                  "सहेजा गया इतिहास: आपके प्रश्न, डैशबोर्ड बुकमार्क और गतिविधियाँ सुरक्षित रहेंगी।",
                  "ਸਾਂਭਿਆ ਇਤਿਹਾਸ: ਤੁਹਾਡੇ ਸਵਾਲ, ਡੈਸ਼ਬੋਰਡ ਬੁੱਕਮਾਰਕ ਅਤੇ ਗਤੀਵਿਧੀਆਂ ਸੁਰੱਖਿਅਤ ਰਹਿਣਗੀਆਂ।"
                ],
                "var(--c-gold)",
              ],
            ].map(([t, tone], i) => (
              <li key={i} className="flex gap-2.5">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0" style={{ color: tone }} />
                <span>{tr(...t)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 1-Click Demo Account Quick Fill Button */}
        <div className="mt-6 rounded-2xl border border-line bg-surface/70 p-4">
          <div className="flex items-center justify-between text-xs text-muted mb-2 font-medium">
            <span>{tr("Need a quick random email?", "तुरंत यादृच्छिक ईमेल चाहिए?", "ਤੁਰੰਤ ਬੇਤਰਤੀਬ ਈਮੇਲ ਚਾਹੀਦੀ ਹੈ?")}</span>
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
              {tr("1-Click Demo", "1-क्लिक डेमो", "1-ਕਲਿੱਕ ਡੈਮੋ")}
            </span>
          </div>
          <button
            type="button"
            onClick={handleFillRandom}
            className="btn btn-ghost w-full flex items-center justify-center gap-2 border border-line hover:border-accent text-sm font-semibold"
          >
            <Dices size={16} className="text-accent" />
            <span>{tr("Fill Random Demo Credentials", "यादृच्छिक डेमो क्रेडेंशियल भरें", "ਬੇਤਰਤੀਬ ਡੈਮੋ ਕ੍ਰੈਡੈਂਸ਼ੀਅਲ ਭਰੋ")}</span>
          </button>
        </div>
      </section>

      {/* Right Column: Sign In / Sign Up Form */}
      <section className="card card-accent card-raised p-6 sm:p-8">
        {location.state?.from === "/assistant" && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/15 p-3.5 text-xs text-amber-900 dark:text-amber-200">
            <Lock size={16} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <div className="font-bold">
                {tr(
                  "Sign in required to consult AI Assistant",
                  "एआई सहायक से परामर्श के लिए साइन इन आवश्यक है",
                  "ਏਆਈ ਸਹਾਇਕ ਨਾਲ ਸਲਾਹ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਲਾਜ਼ਮੀ ਹੈ"
                )}
              </div>
              <div className="mt-0.5 opacity-90">
                {tr(
                  "Enter any email address and password below to continue to the AI Legal Assistant.",
                  "एआई कानूनी सहायक का उपयोग जारी रखने के लिए नीचे कोई भी ईमेल और पासवर्ड दर्ज करें।",
                  "ਏਆਈ ਕਾਨੂੰਨੀ ਸਹਾਇਕ ਦੀ ਵਰਤੋਂ ਜਾਰੀ ਰੱਖਣ ਲਈ ਹੇਠਾਂ ਕੋਈ ਵੀ ਈਮੇਲ ਅਤੇ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ।"
                )}
              </div>
              {location.state?.q && (
                <div className="mt-2 rounded-lg bg-surface/60 px-2.5 py-1.5 font-medium italic border border-line">
                  "{location.state.q}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab switchers: Sign In vs Sign Up */}
        <div className="flex rounded-xl bg-surface/80 p-1 border border-line mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("in");
              clearMessages();
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "in"
                ? "bg-accent text-accent-contrast shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            <LogIn size={15} />
            <span>{tr("Sign In", "साइन इन", "ਸਾਈਨ ਇਨ")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("up");
              clearMessages();
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "up"
                ? "bg-accent text-accent-contrast shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            <UserPlus size={15} />
            <span>{tr("Create Account", "खाता बनाएँ", "ਖਾਤਾ ਬਣਾਓ")}</span>
          </button>
        </div>

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field (shown for Create Account or optional) */}
          {mode === "up" && (
            <div>
              <label className="text-xs font-semibold text-muted block mb-1" htmlFor="auth-name">
                {tr("Your Full Name", "आपका पूरा नाम", "ਤੁਹਾਡਾ ਪੂਰਾ ਨਾਮ")}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-muted" />
                <input
                  id="auth-name"
                  type="text"
                  className="input pl-10 text-sm"
                  placeholder={tr("e.g. Priya Sharma", "उदा. प्रिया शर्मा", "ਉਦਾ. ਪ੍ਰਿਆ ਸ਼ਰਮਾ")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="text-xs font-semibold text-muted block mb-1" htmlFor="auth-email">
              {tr("Email Address", "ईमेल पता", "ਈਮੇਲ ਪਤਾ")}
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-muted" />
              <input
                id="auth-email"
                type="email"
                required
                className="input pl-10 text-sm"
                placeholder="name@example.com (any random email)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-muted" htmlFor="auth-password">
                {tr("Password", "पासवर्ड", "ਪਾਸਵਰਡ")}
              </label>
              <span className="text-[11px] text-muted">
                {tr("Any password works", "कोई भी पासवर्ड चलेगा", "ਕੋਈ ਵੀ ਪਾਸਵਰਡ ਕੰਮ ਕਰੇਗਾ")}
              </span>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-muted" />
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                required
                className="input pl-10 pr-10 text-sm"
                placeholder={tr("Enter password", "पासवर्ड दर्ज करें", "ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-muted hover:text-ink focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2"
            disabled={busy}
          >
            {mode === "up" ? <UserPlus size={16} /> : <LogIn size={16} />}
            <span>
              {busy
                ? tr("Signing in…", "साइन इन हो रहा है…", "ਸਾਈਨ ਇਨ ਹੋ ਰਿਹਾ ਹੈ…")
                : mode === "up"
                ? tr("Create Account & Sign In", "खाता बनाएँ और साइन इन करें", "ਖਾਤਾ ਬਣਾਓ ਅਤੇ ਸਾਈਨ ਇਨ ਕਰੋ")
                : tr("Sign In", "साइन इन करें", "ਸਾਈਨ ਇਨ ਕਰੋ")}
            </span>
          </button>
        </form>

        {/* Switch mode footer */}
        <div className="mt-5 text-center text-xs text-muted">
          {mode === "in" ? (
            <p>
              {tr("Don't have an account?", "खाता नहीं है?", "ਖਾਤਾ ਨਹੀਂ ਹੈ?")}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("up");
                  clearMessages();
                }}
                className="font-bold text-accent hover:underline ml-1"
              >
                {tr("Create one now", "अभी बनाएँ", "ਹੁਣੇ ਬਣਾਓ")}
              </button>
            </p>
          ) : (
            <p>
              {tr("Already have credentials?", "पहले से क्रेडेंशियल हैं?", "ਪਹਿਲਾਂ ਤੋਂ ਕ੍ਰੈਡੈਂਸ਼ੀਅਲ ਹਨ?")}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("in");
                  clearMessages();
                }}
                className="font-bold text-accent hover:underline ml-1"
              >
                {tr("Sign in here", "यहाँ साइन इन करें", "ਇੱਥੇ ਸਾਈਨ ਇਨ ਕਰੋ")}
              </button>
            </p>
          )}
        </div>

        {/* Feedback Messages */}
        {err && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm text-red-600 border-red-500/40 bg-red-500/10 animate-in fade-in"
          >
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>{messages[err] || messages.error}</span>
          </p>
        )}
        {success && (
          <p
            role="status"
            className="mt-4 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm text-green-600 border-green-500/40 bg-green-500/10 animate-in fade-in"
          >
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </p>
        )}
      </section>
    </div>
  );
}