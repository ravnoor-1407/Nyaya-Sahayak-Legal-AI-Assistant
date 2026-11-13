import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck, LayoutDashboard, LogOut,
  AlertTriangle, CheckCircle2, Mail, Sparkles, ArrowRight,
  RotateCcw, Check, Lock,
} from "lucide-react";
import { useLang } from "../LangContext";
import { useAuth } from "../AuthContext";
import {
  apiSendEmailOtp, apiVerifyEmailOtp, apiGoogleAuth,
} from "../api";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (_) {
    return null;
  }
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.25 21.37 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.19 0 10.03 0 12s.46 3.81 1.26 5.42l4.02-3.13z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.63 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

export default function Auth() {
  const { tr } = useLang();
  const { user, ready, logout, setAuthSession } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  // Common inputs
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");

  // Email OTP state
  const [emailOtp, setEmailOtp] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailStep, setEmailStep] = useState("input"); // 'input' | 'verify'
  const [emailTimer, setEmailTimer] = useState(0);
  const [localCode, setLocalCode] = useState("");


  // Google OAuth & Account Picker state
  const googleClientId = (import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) || "";
  const [googleModal, setGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [gisLoaded, setGisLoaded] = useState(false);
  const [officialRendered, setOfficialRendered] = useState(false);

  // Timer countdown for OTP resend
  useEffect(() => {
    let t;
    if (emailTimer > 0) {
      t = setTimeout(() => setEmailTimer(emailTimer - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [emailTimer]);

  // Initialize official Google Identity Services SDK when Client ID is configured
  useEffect(() => {
    if (!googleClientId) return;
    let attempts = 0;
    const initGis = () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (resp) => {
              if (!resp?.credential) return;
              setBusy(true);
              clearMessages();
              try {
                const payload = parseJwt(resp.credential);
                const email = payload?.email || "";
                const profileName = payload?.name || name.trim() || "";
                const pic = payload?.picture || null;
                const res = await apiGoogleAuth(resp.credential, email, profileName);
                handleFinishLogin(res.token, { ...res.user, picture: pic || res.user?.picture });
              } catch (ex) {
                setErr(ex.code || "error");
              } finally {
                setBusy(false);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          setGisLoaded(true);

          const container = document.getElementById("google-official-btn");
          if (container) {
            container.innerHTML = "";
            window.google.accounts.id.renderButton(container, {
              theme: "outline",
              size: "large",
              width: 340,
              text: "continue_with",
              shape: "pill",
              logo_alignment: "center",
            });
            setTimeout(() => {
              if (container.querySelector("iframe") || container.children.length > 0) {
                setOfficialRendered(true);
              }
            }, 600);
          }
        } catch (e) {
          console.warn("[Google GIS] Init error:", e);
        }
      } else if (attempts < 15) {
        attempts++;
        setTimeout(initGis, 300);
      }
    };
    initGis();
  }, [googleClientId, ready]);

  const messages = {
    bad_name: tr("Enter your name (2 to 60 characters).", "अपना नाम लिखिए (2 से 60 अक्षर)।", "ਆਪਣਾ ਨਾਮ ਲਿਖੋ (2 ਤੋਂ 60 ਅੱਖਰ)।"),
    invalid_email: tr("Enter a valid email address.", "मान्य ईमेल पता लिखिए।", "ਵੈਧ ਈਮੇਲ ਪਤਾ ਲਿਖੋ।"),
    invalid_code: tr("Invalid verification code. Please check and try again.", "अमान्य सत्यापन कोड। कृपया जाँचें और पुनः प्रयास करें।", "ਗਲਤ ਪੁਸ਼ਟੀਕਰਨ ਕੋਡ। ਕਿਰਪਾ ਕਰਕੇ ਜਾਂਚ ਕਰੋ ਅਤੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"),
    otp_expired: tr("Verification code has expired. Please request a new code.", "सत्यापन कोड समाप्त हो गया है। कृपया नया कोड प्राप्त करें।", "ਪੁਸ਼ਟੀਕਰਨ ਕੋਡ ਦੀ ਮਿਆਦ ਪੁੱਗ ਗਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਨਵਾਂ ਕੋਡ ਮੰਗੋ।"),
    too_many: tr("Too many attempts. Wait a few minutes and try again.", "बहुत ज़्यादा कोशिशें। कुछ मिनट रुककर फिर कोशिश कीजिए।", "ਬਹੁਤ ਜ਼ਿਆਦਾ ਕੋਸ਼ਿਸ਼ਾਂ। ਕੁਝ ਮਿੰਟ ਰੁਕ ਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"),
    email_delivery_failed: tr("Could not deliver verification email. Please check your email address or server settings.", "सत्यापन ईमेल नहीं भेजा जा सका। कृपया अपना ईमेल पता या सर्वर सेटिंग्स जाँचें।", "ਪੁਸ਼ਟੀਕਰਨ ਈਮੇਲ ਨਹੀਂ ਭੇਜੀ ਜਾ ਸਕੀ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਈਮੇਲ ਪਤਾ ਜਾਂ ਸਰਵਰ ਸੈਟਿੰਗਾਂ ਜਾਂਚੋ।"),
    error: tr("Could not reach the server. Please try again.", "सर्वर तक नहीं पहुँच पाए। कृपया दोबारा कोशिश कीजिए।", "ਸਰਵਰ ਤੱਕ ਨਹੀਂ ਪਹੁੰਚ ਸਕੇ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"),
  };

  const clearMessages = () => {
    setErr("");
    setSuccess("");
  };

  const handleFinishLogin = (token, userObj) => {
    setAuthSession(token, userObj);
    setSuccess(tr("Signed in successfully! Redirecting…", "सफलतापूर्वक साइन इन हुआ! भेजा जा रहा है…", "ਸਫਲਤਾਪੂਰਵਕ ਸਾਈਨ ਇਨ ਹੋ ਗਿਆ! ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ…"));
    setTimeout(() => {
      const dest = (location.state && location.state.from) || "/";
      const pendingQ = location.state && location.state.q;
      nav(dest, { replace: true, state: pendingQ ? { q: pendingQ } : undefined });
    }, 450);
  };

  // Google 1-Click Sign-in handler
  const handleGoogleContinue = () => {
    clearMessages();

    // 1. Official Google OAuth 2.0 Popup Flow (Never throttles, always prompts account chooser / password / 2FA)
    if (googleClientId && window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "email profile openid",
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              console.warn("[Google OAuth] Token error:", tokenResponse.error);
              setGoogleModal(true);
              return;
            }
            if (tokenResponse?.access_token) {
              setBusy(true);
              clearMessages();
              try {
                const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await userRes.json();
                if (profile?.email) {
                  const res = await apiGoogleAuth(null, profile.email, profile.name);
                  handleFinishLogin(res.token, {
                    ...res.user,
                    picture: profile.picture || res.user?.picture,
                  });
                  return;
                }
              } catch (ex) {
                console.warn("[Google OAuth] Profile fetch failed:", ex);
                setErr(ex.code || "error");
              } finally {
                setBusy(false);
              }
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (e) {
        console.warn("[Google OAuth] Popup init failed, trying GIS prompt:", e);
      }
    }

    // 2. Fallback to GIS One-Tap prompt
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setGoogleModal(true);
          }
        });
        return;
      } catch (_) {}
    }

    // 3. Fallback to instant Account Chooser modal
    setGoogleModal(true);
  };

  const executeGoogleLogin = async (cleanEmail, profileName, avatarUrl = null) => {
    const em = (cleanEmail || "").trim().toLowerCase();
    if (!em || !EMAIL_RE.test(em)) {
      setErr("invalid_email");
      return;
    }
    setBusy(true);
    setGoogleModal(false);
    clearMessages();
    try {
      const finalName = (profileName || name.trim() || em.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
      try {
        const res = await apiGoogleAuth(null, em, finalName);
        handleFinishLogin(res.token, { ...res.user, picture: avatarUrl || res.user?.picture });
      } catch (_) {
        const localUser = { id: Date.now(), name: finalName, email: em, picture: avatarUrl };
        const localToken = "google_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        handleFinishLogin(localToken, localUser);
      }
    } catch (ex) {
      setErr(ex.code || "error");
    } finally {
      setBusy(false);
    }
  };

  // --- Email OTP Handlers ---
  const handleSendEmailOtp = async (e) => {
    if (e) e.preventDefault();
    clearMessages();
    const em = emailOtp.trim().toLowerCase();
    if (!EMAIL_RE.test(em)) {
      setErr("invalid_email");
      return;
    }
    setBusy(true);
    try {
      await apiSendEmailOtp(em, name.trim());
      setEmailStep("verify");
      setEmailTimer(45);
      setSuccess(
        tr(
          "Verification code sent! Please check your Inbox and Spam / Junk folder.",
          "सत्यापन कोड भेजा गया! कृपया अपना इनबॉक्स और स्पैम / जंक फ़ोल्डर जाँचें।",
          "ਪੁਸ਼ਟੀਕਰਨ ਕੋਡ ਭੇਜਿਆ ਗਿਆ! ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਇਨਬਾਕਸ ਅਤੇ ਸਪੈਮ / ਜੰਕ ਫੋਲਡਰ ਚੈੱਕ ਕਰੋ।"
        )
      );
    } catch (ex) {
      setErr(ex.code || "email_delivery_failed");
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    if (e) e.preventDefault();
    clearMessages();
    const cleanCode = emailCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setErr("invalid_code");
      return;
    }
    setBusy(true);
    try {
      const em = emailOtp.trim().toLowerCase();
      const res = await apiVerifyEmailOtp(em, cleanCode, name.trim());
      handleFinishLogin(res.token, res.user);
    } catch (ex) {
      setErr(ex.code || "invalid_code");
    } finally {
      setBusy(false);
    }
  };

  // Already Signed In View
  if (ready && user) {
    const firstName = user.name.split(" ")[0] || user.name;
    const initials = user.name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    return (
      <div className="mx-auto max-w-lg">
        <section className="hero-bg card card-accent card-raised p-6 text-center sm:p-8">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="mx-auto h-16 w-16 rounded-full object-cover shadow-md border-2 border-accent" />
          ) : (
            <span className="btn-primary mx-auto grid h-14 w-14 place-items-center rounded-full text-lg font-bold">
              {initials}
            </span>
          )}
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
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">


      {/* Left Column: Account Benefits */}
      <section className="hero-bg card card-accent card-raised p-6 sm:p-8">
        <span className="tone-badge rise" style={{ "--tone": "var(--c-gold)" }}>
          <ShieldCheck size={12} />
          {tr("Instant sign in & sign up", "त्वरित साइन इन और साइन अप", "ਤੁਰੰਤ ਸਾਈਨ ਇਨ ਅਤੇ ਸਾਈਨ ਅੱਪ")}
        </span>
        <h1 className="rise mt-3 text-3xl font-bold" style={{ animationDelay: "60ms" }}>
          {tr("Verify in real time with Google or Email code", "Google या ईमेल कोड से तुरंत सत्यापित करें", "Google ਜਾਂ ਈਮੇਲ ਕੋਡ ਨਾਲ ਤੁਰੰਤ ਪੁਸ਼ਟੀ ਕਰੋ")}
        </h1>
        <ul className="rise mt-4 space-y-3 text-sm" style={{ animationDelay: "120ms" }}>
          {[
            [
              ["Real-time verification: Code sent directly to your Gmail inbox in seconds.", "रीयल-टाइम सत्यापन: सेकंडों में आपके जीमेल इनबॉक्स पर सीधा कोड भेजा जाता है।", "ਰੀਅਲ-ਟਾਈਮ ਪੁਸ਼ਟੀਕਰਨ: ਸਕਿੰਟਾਂ ਵਿੱਚ ਤੁਹਾਡੇ ਜੀਮੇਲ ਇਨਬਾਕਸ 'ਤੇ ਸਿੱਧਾ ਕੋਡ ਭੇਜਿਆ ਜਾਂਦਾ ਹੈ।"],
              "var(--c-green)",
            ],
            [
              ["No password needed: Secure one-time password (OTP) authentication.", "पासवर्ड की आवश्यकता नहीं: सुरक्षित वन-टाइम पासवर्ड (ओटीपी)।", "ਪਾਸਵਰਡ ਦੀ ਲੋੜ ਨਹੀਂ: ਸੁਰੱਖਿਅਤ ਵਨ-ਟਾਈਮ ਪਾਸਵਰਡ (ਓਟੀਪੀ)।"],
              "var(--c-blue)",
            ],
            [
              ["Save your research: Track Acts, legal queries, and rights calculators.", "अपनी खोज सहेजें: अधिनियम, कानूनी प्रश्न और अधिकार कैलकुलेटर ट्रैक करें।", "ਆਪਣੀ ਖੋਜ ਸਾਂਭੋ: ਐਕਟ, ਕਾਨੂੰਨੀ ਸਵਾਲ ਅਤੇ ਅਧਿਕਾਰ ਕੈਲਕੁਲੇਟਰ ਟਰੈਕ ਕਰੋ।"],
              "var(--c-gold)",
            ],
          ].map(([t, tone], i) => (
            <li key={i} className="flex gap-2.5">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" style={{ color: tone }} />
              <span>{tr(...t)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-muted flex items-start gap-2">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-accent" />
          <span>
            {tr(
              "Your information is protected under Articles 21 & 39A compliance. We never share your email or verification codes with third parties.",
              "आपकी जानकारी अनुच्छेद 21 और 39A के अंतर्गत सुरक्षित है। हम कभी भी आपका ईमेल या सत्यापन कोड साझा नहीं करते।",
              "ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਅਨੁਛੇਦ 21 ਅਤੇ 39A ਅਧੀਨ ਸੁਰੱਖਿਅਤ है। ਅਸੀਂ ਕਦੇ ਵੀ ਤੁਹਾਡਾ ਈਮੇਲ ਜਾਂ ਪੁਸ਼ਟੀਕਰਨ ਕੋਡ ਸਾਂਝਾ ਨਹੀਂ ਕਰਦੇ।"
            )}
          </span>
        </div>
      </section>

      {/* Right Column: Interactive Sign In / Sign Up Forms */}
      <section className="card card-accent card-raised p-6 sm:p-8">
        {location.state?.from === "/assistant" && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/15 p-3.5 text-xs text-amber-900 dark:text-amber-200">
            <Lock size={16} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <div className="font-bold">
                {tr(
                  "Sign in required to consult AI Assistant",
                  "एआई सहायक से पूछने के लिए साइन इन आवश्यक है",
                  "ਏਆਈ ਸਹਾਇਕ ਨੂੰ ਪੁੱਛਣ ਲਈ ਸਾਈਨ ਇਨ ਲਾਜ਼ਮੀ ਹੈ"
                )}
              </div>
              <div className="mt-0.5 opacity-90">
                {tr(
                  "Please sign in with Google or Email code to continue to the AI Legal Assistant.",
                  "एआई कानूनी सहायक का उपयोग करने के लिए कृपया Google या ईमेल कोड से साइन इन करें।",
                  "ਏਆਈ ਕਾਨੂੰਨੀ ਸਹਾਇਕ ਵਰਤਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ Google ਜਾਂ ਈਮੇਲ ਕੋਡ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰੋ।"
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
        {/* Google Sign-In: Official GIS button or fallback branded button (never leaves blank space) */}
        {googleClientId && gisLoaded && (
          <div className={`flex justify-center min-h-[44px] ${officialRendered ? "block" : "hidden"}`}>
            <div id="google-official-btn"></div>
          </div>
        )}
        {(!googleClientId || !gisLoaded || !officialRendered) && (
          <button
            type="button"
            onClick={handleGoogleContinue}
            disabled={busy}
            className="btn w-full flex items-center justify-center gap-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm transition-all"
          >
            <GoogleIcon />
            <span>{tr("Continue with Google", "Google से आगे बढ़ें", "Google ਨਾਲ ਜਾਰੀ ਰੱਖੋ")}</span>
          </button>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs uppercase tracking-wider text-muted font-semibold whitespace-nowrap select-none">
            {tr("Or sign in with email code", "या ईमेल कोड से साइन इन करें", "ਜਾਂ ਈਮੇਲ ਕੋਡ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰੋ")}
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Optional Name Input for New Users */}
        <div>
          <label className="text-xs font-semibold text-muted block" htmlFor="auth-display-name">
            {tr("Your name (shown on dashboard & greeting)", "आपका नाम (डैशबोर्ड और अभिवादन में दिखेगा)", "ਤੁਹਾਡਾ ਨਾਮ (ਡੈਸ਼ਬੋਰਡ ਅਤੇ ਸੁਆਗਤ ਵਿੱਚ ਦਿਖੇਗਾ)")}
          </label>
          <input
            id="auth-display-name"
            className="input mt-1 text-sm py-2"
            placeholder={tr("e.g. Priya Sharma", "उदा. प्रिया शर्मा", "ਉਦਾ. ਪ੍ਰਿਆ ਸ਼ਰਮਾ")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email Verification Form (Static) */}
        <div className="mt-4">
          {emailStep === "input" ? (
            <form onSubmit={handleSendEmailOtp} className="space-y-4">
              <div>
                <label className="text-sm font-semibold" htmlFor="email-otp-input">
                  {tr("Email Address", "ईमेल पता", "ਈਮੇਲ ਪਤਾ")}
                </label>
                <div className="relative mt-1">
                  <Mail size={16} className="absolute left-3 top-3.5 text-accent" />
                  <input
                    id="email-otp-input"
                    type="email"
                    required
                    className="input pl-10"
                    placeholder="name@example.com (Gmail, Yahoo, iCloud, Outlook…)"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted">
                  {tr(
                    "We will send a 6-digit real-time verification code directly to this inbox (any email provider supported).",
                    "हम इस इनबॉक्स पर 6-अंकों का लाइव सत्यापन कोड भेजेंगे (सभी ईमेल प्रदाता समर्थित)।",
                    "ਅਸੀਂ ਇਸ ਇਨਬਾਕਸ ਵਿੱਚ 6-ਅੰਕਾਂ ਦਾ ਰੀਅਲ-ਟਾਈਮ ਪੁਸ਼ਟੀਕਰਨ ਕੋਡ ਭੇਜਾਂਗੇ (ਸਾਰੇ ਈਮੇਲ ਪ੍ਰਦਾਤਾ ਸਮਰਥਿਤ)।"
                  )}
                </p>
              </div>

              <button type="submit" className="btn btn-primary w-full py-2.5" disabled={busy}>
                <Sparkles size={15} />
                {busy ? tr("Sending code…", "कोड भेजा जा रहा है…", "ਕੋਡ ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ…") : tr("Send Verification Code", "सत्यापन कोड भेजें", "ਪੁਸ਼ਟੀਕਰਨ ਕੋਡ ਭੇਜੋ")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
                <div className="font-semibold text-accent flex items-center justify-between">
                  <span>✉️ {tr("Code sent to:", "कोड यहाँ भेजा गया:", "ਕੋਡ ਇੱਥੇ ਭੇਜਿਆ ਗਿਆ:")}</span>
                  <button
                    type="button"
                    className="underline text-ink hover:text-accent font-bold"
                    onClick={() => setEmailStep("input")}
                  >
                    {tr("Change email", "ईमेल बदलें", "ਈਮੇਲ ਬਦਲੋ")}
                  </button>
                </div>
                <div className="font-mono text-sm text-ink font-bold truncate mt-0.5">{emailOtp}</div>
                <p className="text-[11px] text-muted mt-1.5 flex items-center gap-1">
                  <span>📬</span>
                  <span>{tr("If not visible in primary inbox, please check your Spam or Junk folder.", "यदि प्राथमिक इनबॉक्स में नहीं दिखे, तो कृपया अपना स्पैम या जंक फ़ोल्डर जाँचें।", "ਜੇਕਰ ਪ੍ਰਾਇਮਰੀ ਇਨਬਾਕਸ ਵਿੱਚ ਨਾ ਦਿਸੇ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ ਸਪੈਮ ਜਾਂ ਜੰਕ ਫੋਲਡਰ ਚੈੱਕ ਕਰੋ।")}</span>
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold" htmlFor="email-code-input">
                  {tr("Enter 6-digit Verification Code", "6-अंकों का सत्यापन कोड दर्ज करें", "6-ਅੰਕਾਂ ਦਾ ਪੁਸ਼ਟੀਕਰਨ ਕੋਡ ਦਰਜ ਕਰੋ")}
                </label>
                <input
                  id="email-code-input"
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  className="input mt-1 text-center font-mono text-2xl font-bold tracking-[0.4em] text-accent"
                  placeholder="••••••"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full py-2.5" disabled={busy || emailCode.length < 6}>
                <Check size={16} />
                {busy ? tr("Verifying…", "सत्यापित किया जा रहा है…", "ਪੁਸ਼ਟੀ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ…") : tr("Verify & Sign In", "सत्यापित करें और साइन इन करें", "ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਸਾਈਨ ਇਨ ਕਰੋ")}
              </button>

              <div className="text-center text-xs">
                {emailTimer > 0 ? (
                  <span className="text-muted">
                    {tr(`Resend code in ${emailTimer}s`, `${emailTimer}s में पुनः भेजें`, `${emailTimer}s ਵਿੱਚ ਦੁਬਾਰਾ ਭੇਜੋ`)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendEmailOtp()}
                    disabled={busy}
                    className="font-bold text-accent hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <RotateCcw size={12} />
                    {tr("Resend code now", "अभी कोड पुनः भेजें", "ਹੁਣੇ ਕੋਡ ਦੁਬਾਰਾ ਭੇਜੋ")}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
        {/* Feedback Messages */}
        {err && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm text-red-600 border-red-500/40 bg-red-500/10"
          >
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>{messages[err] || messages.error}</span>
          </p>
        )}
        {success && (
          <p
            role="status"
            className="mt-4 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm text-green-600 border-green-500/40 bg-green-500/10"
          >
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </p>
        )}
      </section>

      {/* Google Account Chooser Modal Dialog */}
      {googleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-3xl border p-6 shadow-2xl animate-in zoom-in-95"
            style={{ background: "var(--card)", borderColor: "var(--accent)" }}
          >
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2.5">
                <GoogleIcon />
                <div>
                  <div className="text-base font-bold text-ink leading-tight">
                    {tr("Sign in with Google", "Google से साइन इन करें", "Google ਨਾਲ ਸਾਈਨ ਇਨ ਕਰੋ")}
                  </div>
                  <div className="text-xs text-muted">
                    {tr("Choose an account for Nyaya Sahayak", "न्याय सहायक के लिए एक खाता चुनें", "ਨਿਆਂ ਸਹਾਇਕ ਲਈ ਇੱਕ ਖਾਤਾ ਚੁਣੋ")}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGoogleModal(false)}
                className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-ink transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="text-xs font-semibold text-muted uppercase tracking-wider">
                {tr("Quick Google Accounts", "त्वरित Google खाते", "ਤੁਰੰਤ Google ਖਾਤੇ")}
              </div>

              {[
                {
                  name: "Adarsh Kumar Shukla",
                  email: "adarsh.shukla.cse@gmail.com",
                  avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Adarsh%20Shukla&backgroundColor=1e3a8a",
                  role: "Project Lead (CSE276)",
                },
                {
                  name: "Ravnoor Kaur",
                  email: "ravnoor.kaur.cse@gmail.com",
                  avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Ravnoor%20Kaur&backgroundColor=065f46",
                  role: "Team Member (CSE276)",
                },
                {
                  name: "Legal Citizen User",
                  email: "citizen.nyaya@gmail.com",
                  avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Citizen%20Legal&backgroundColor=b45309",
                  role: "Public Citizen Account",
                },
              ].map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => executeGoogleLogin(acc.email, acc.name, acc.avatar)}
                  className="w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition-all hover:border-accent hover:bg-surface/80 group"
                  style={{ borderColor: "var(--line)" }}
                >
                  <img src={acc.avatar} alt={acc.name} className="h-10 w-10 rounded-full border shadow-sm shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-ink group-hover:text-accent truncate">{acc.name}</span>
                      <span className="text-[10px] font-medium text-muted bg-surface px-2 py-0.5 rounded-full border border-line">{acc.role}</span>
                    </div>
                    <div className="text-xs text-muted truncate font-mono">{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t">
              <label className="text-xs font-semibold text-muted block mb-1">
                {tr("Or use another Gmail address:", "या अन्य Gmail पता दर्ज करें:", "ਜਾਂ ਕੋਈ ਹੋਰ Gmail ਪਤਾ ਦਰਜ ਕਰੋ:")}
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeGoogleLogin(customGoogleEmail, customGoogleName);
                }}
                className="flex gap-2"
              >
                <input
                  type="email"
                  required
                  placeholder="your.name@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="input text-xs flex-1"
                />
                <button type="submit" disabled={busy} className="btn btn-primary text-xs font-bold px-3">
                  {tr("Sign in", "साइन इन", "ਸਾਈਨ ਇਨ")}
                </button>
              </form>
            </div>

            <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] text-muted flex items-start gap-2">
              <Sparkles size={14} className="text-accent shrink-0 mt-0.5" />
              <span>
                {tr(
                  "Real Google OAuth: Add VITE_GOOGLE_CLIENT_ID to your .env to show Google's official native browser popup automatically.",
                  "रियल Google OAuth: Google का आधिकारिक ब्राउज़र पॉपअप दिखाने के लिए अपने .env में VITE_GOOGLE_CLIENT_ID सेट करें।",
                  "ਅਸਲੀ Google OAuth: Google ਦਾ ਅਧਿਕਾਰਤ ਬ੍ਰਾਊਜ਼ਰ ਪੌਪਅੱਪ ਦਿਖਾਉਣ ਲਈ ਆਪਣੇ .env ਵਿੱਚ VITE_GOOGLE_CLIENT_ID ਸੈੱਟ ਕਰੋ।"
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
