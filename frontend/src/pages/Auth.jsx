import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogIn, UserPlus, ShieldCheck, LayoutDashboard, LogOut,
  AlertTriangle, CheckCircle2, Mail, Lock, ArrowRight,
  Eye, EyeOff, User, Scale, BookOpen,
} from "lucide-react";
import { useLang } from "../LangContext";
import { useAuth } from "../AuthContext";

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
  const [rememberMe, setRememberMe] = useState(true);

  // State feedback
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");

  const messages = {
    invalid_email: tr(
      "Please enter a valid email address.",
      "कृपया एक मान्य ईमेल पता दर्ज करें।",
      "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ ਈਮੇਲ ਪਤਾ ਦਰਜ ਕਰੋ।"
    ),
    empty_password: tr(
      "Please enter your password.",
      "कृपया अपना पासवर्ड दर्ज करें।",
      "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ।"
    ),
    error: tr(
      "Authentication error. Please try again.",
      "प्रमाणीकरण त्रुटि। कृपया पुनः प्रयास करें।",
      "ਪ੍ਰਮਾਣਿਕਤਾ ਗਲਤੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
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
      {/* Left Column: Official Portal Information */}
      <section className="hero-bg card card-accent card-raised p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <span className="tone-badge rise" style={{ "--tone": "var(--c-gold)" }}>
            <ShieldCheck size={13} />
            {tr("Citizen Access Portal", "नागरिक सहायता पोर्टल", "ਨਾਗਰਿਕ ਸਹਾਇਤਾ ਪੋਰਟਲ")}
          </span>

          <h1 className="rise mt-3 text-3xl font-bold" style={{ animationDelay: "60ms" }}>
            {tr(
              "Access Citizen Legal Services",
              "नागरिक कानूनी सेवाओं तक पहुँचें",
              "ਨਾਗਰਿਕ ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਤੱਕ ਪਹੁੰਚੋ"
            )}
          </h1>

          <p className="mt-2 text-sm text-muted">
            {tr(
              "Sign in to consult the AI legal assistant, bookmark statutory references, and access free legal aid tools under Articles 21 & 39A of the Constitution of India.",
              "एआई कानूनी सहायक से परामर्श करने, कानूनी संदर्भों को सहेजने और भारत के संविधान के अनुच्छेद 21 और 39A के तहत मुफ्त कानूनी सहायता उपकरण प्राप्त करने के लिए साइन इन करें।",
              "ਏਆਈ ਕਾਨੂੰਨੀ ਸਹਾਇਕ ਨਾਲ ਸਲਾਹ ਕਰਨ, ਕਾਨੂੰਨੀ ਹਵਾਲਿਆਂ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਰਨ ਅਤੇ ਭਾਰਤ ਦੇ ਸੰਵਿਧਾਨ ਦੇ ਅਨੁਛੇਦ 21 ਅਤੇ 39A ਅਧੀਨ ਮੁਫਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।"
            )}
          </p>

          <ul className="rise mt-6 space-y-3.5 text-sm" style={{ animationDelay: "120ms" }}>
            {[
              [
                [
                  "Verified Statutory Guidance: Direct citations from BNS, BNSS, BSA, and Constitution of India.",
                  "सत्यापित वैधानिक मार्गदर्शन: बीएनएस, बीएनएसएस, बीएसए और भारत के संविधान से सीधे उद्धरण।",
                  "ਪ੍ਰਮਾਣਿਤ ਕਾਨੂੰਨੀ ਮਾਰਗਦਰਸ਼ਨ: ਬੀਐਨਐਸ, ਬੀਐਨਐਸਐਸ, ਬੀਐਸਏ ਅਤੇ ਭਾਰਤ ਦੇ ਸੰਵਿਧਾਨ ਤੋਂ ਸਿੱਧੇ ਹਵਾਲੇ।"
                ],
                "var(--c-green)",
                Scale,
              ],
              [
                [
                  "Confidential & Private: Your queries and consultation details are protected under legal privacy norms.",
                  "गोपनीय और सुरक्षित: आपके प्रश्न और परामर्श विवरण कानूनी गोपनीयता नियमों के तहत सुरक्षित हैं।",
                  "ਗੁਪਤ ਅਤੇ ਸੁਰੱਖਿਅਤ: ਤੁਹਾਡੇ ਸਵਾਲ ਅਤੇ ਸਲਾਹ ਦੇ ਵੇਰਵੇ ਕਾਨੂੰਨੀ ਗੋਪਨੀਯਤਾ ਨਿਯਮਾਂ ਅਧੀਨ ਸੁਰੱਖਿਅਤ ਹਨ।"
                ],
                "var(--c-blue)",
                ShieldCheck,
              ],
              [
                [
                  "Citizen Rights Portfolio: Access personalized legal aid calculations, saved queries, and rights handbooks.",
                  "नागरिक अधिकार पोर्टफोलियो: व्यक्तिगत कानूनी सहायता गणना, सहेजे गए प्रश्न और अधिकार पुस्तिकाएँ प्राप्त करें।",
                  "ਨਾਗਰਿਕ ਅਧਿਕਾਰ ਪੋਰਟਫੋਲੀਓ: ਨਿੱਜੀ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਗਣਨਾ, ਸੁਰੱਖਿਅਤ ਕੀਤੇ ਸਵਾਲ ਅਤੇ ਅਧਿਕਾਰ ਪੁਸਤਕਾਂ ਪ੍ਰਾਪਤ ਕਰੋ।"
                ],
                "var(--c-gold)",
                BookOpen,
              ],
            ].map(([t, tone, Icon], i) => (
              <li key={i} className="flex gap-2.5">
                <Icon size={17} className="mt-0.5 shrink-0" style={{ color: tone }} />
                <span>{tr(...t)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-surface/70 p-4 text-xs text-muted flex items-start gap-2.5">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" />
          <p>
            {tr(
              "NyayaSahayak is a digital public legal initiative designed to ensure equal justice under law is accessible to every citizen.",
              "न्याय सहायक एक डिजिटल सार्वजनिक कानूनी पहल है जिसे यह सुनिश्चित करने के लिए डिज़ाइन किया गया है कि कानून के तहत समान न्याय हर नागरिक के लिए सुलभ हो।",
              "ਨਿਆਏ ਸਹਾਇਕ ਇੱਕ ਡਿਜੀਟਲ ਪਬਲਿਕ ਕਾਨੂੰਨੀ ਪਹਿਲਕਦਮੀ ਹੈ ਜੋ ਇਹ ਯਕੀਨੀ ਬਣਾਉਣ ਲਈ ਤਿਆਰ ਕੀਤੀ ਗਈ ਹੈ ਕਿ ਕਾਨੂੰਨ ਅਧੀਨ ਬਰਾਬਰ ਨਿਆਂ ਹਰੇਕ ਨਾਗਰਿਕ ਤੱਕ ਪਹੁੰਚਯੋਗ ਹੋਵੇ।"
            )}
          </p>
        </div>
      </section>

      {/* Right Column: Authentic Sign In / Create Account Form */}
      <section className="card card-accent card-raised p-6 sm:p-8">
        {location.state?.from === "/assistant" && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/15 p-3.5 text-xs text-amber-900 dark:text-amber-200">
            <Lock size={16} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <div className="font-bold">
                {tr(
                  "Sign in to continue to AI Legal Assistant",
                  "एआई कानूनी सहायक का उपयोग करने के लिए साइन इन करें",
                  "ਏਆਈ ਕਾਨੂੰਨੀ ਸਹਾਇਕ ਦੀ ਵਰਤੋਂ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ"
                )}
              </div>
              <div className="mt-0.5 opacity-90">
                {tr(
                  "Please enter your credentials below to access legal consultations and citations.",
                  "कानूनी परामर्श और संदर्भों तक पहुँचने के लिए कृपया नीचे अपने क्रेडेंशियल दर्ज करें।",
                  "ਕਾਨੂੰਨੀ ਸਲਾਹ ਅਤੇ ਹਵਾਲਿਆਂ ਤੱਕ ਪਹੁੰਚਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਆਪਣੇ ਵੇਰਵੇ ਦਰਜ ਕਰੋ।"
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

        {/* Tab switchers: Sign In vs Create Account */}
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
          {/* Name field (shown for Create Account) */}
          {mode === "up" && (
            <div>
              <label className="text-xs font-semibold text-muted block mb-1" htmlFor="auth-name">
                {tr("Full Name", "पूरा नाम", "ਪੂਰਾ ਨਾਮ")}
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
                placeholder="name@example.com"
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
              {mode === "in" && (
                <button
                  type="button"
                  onClick={() => alert(tr("Password recovery: You can enter your email with any password to sign in directly.", "पासवर्ड रिकवरी: आप सीधे साइन इन करने के लिए किसी भी पासवर्ड के साथ अपना ईमेल दर्ज कर सकते हैं।", "ਪਾਸਵਰਡ ਰਿਕਵਰੀ: ਤੁਸੀਂ ਸਿੱਧਾ ਸਾਈਨ ਇਨ ਕਰਨ ਲਈ ਕਿਸੇ ਵੀ ਪਾਸਵਰਡ ਨਾਲ ਆਪਣਾ ਈਮੇਲ ਦਰਜ ਕਰ ਸਕਦੇ ਹੋ।"))}
                  className="text-[11px] text-muted hover:text-accent font-medium"
                >
                  {tr("Forgot password?", "पासवर्ड भूल गए?", "ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?")}
                </button>
              )}
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-muted" />
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                required
                className="input pl-10 pr-10 text-sm"
                placeholder="••••••••"
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

          {/* Remember Me Option */}
          {mode === "in" && (
            <div className="flex items-center gap-2 pt-1 text-xs text-muted">
              <input
                id="auth-remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-line text-accent focus:ring-accent"
              />
              <label htmlFor="auth-remember" className="cursor-pointer">
                {tr("Keep me signed in on this device", "मुझे इस डिवाइस पर साइन इन रखें", "ਮੈਨੂੰ ਇਸ ਡਿਵਾਈਸ 'ਤੇ ਸਾਈਨ ਇਨ ਰੱਖੋ")}
              </label>
            </div>
          )}

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
                ? tr("Create Account", "खाता बनाएँ", "ਖਾਤਾ ਬਣਾਓ")
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
                {tr("Create an account", "खाता बनाएँ", "ਖਾਤਾ ਬਣਾਓ")}
              </button>
            </p>
          ) : (
            <p>
              {tr("Already registered?", "पहले से पंजीकृत हैं?", "ਪਹਿਲਾਂ ਤੋਂ ਰਜਿਸਟਰਡ ਹੋ?")}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("in");
                  clearMessages();
                }}
                className="font-bold text-accent hover:underline ml-1"
              >
                {tr("Sign in to your account", "अपने खाते में साइन इन करें", "ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰੋ")}
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

        {/* Privacy Note */}
        <div className="mt-6 border-t border-line/60 pt-3 text-center text-[11px] text-muted">
          {tr(
            "Protected by Articles 21 & 39A compliance. Your legal inquiries remain anonymous.",
            "अनुच्छेद 21 और 39A अनुपालन द्वारा सुरक्षित। आपकी कानूनी पूछताछ गोपनीय रहती है।",
            "ਅਨੁਛੇਦ 21 ਅਤੇ 39A ਅਨੁਕੂਲਤਾ ਦੁਆਰਾ ਸੁਰੱਖਿਅਤ। ਤੁਹਾਡੀ ਕਾਨੂੰਨੀ ਪੁੱਛਗਿੱਛ ਗੁਪਤ ਰਹਿੰਦੀ ਹੈ।"
          )}
        </div>
      </section>
    </div>
  );
}
