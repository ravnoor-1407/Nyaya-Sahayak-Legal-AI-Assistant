import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Scale, Sun, Moon, ChevronDown, Menu, X, HeartHandshake, BookOpen,
  Search, Library, FileText, Phone, Mail, ShieldCheck, Sparkles,
  LogIn, LogOut, LayoutDashboard,
} from "lucide-react";
import { useLang } from "../LangContext";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import { useBackendStatus } from "../hooks";

const LANGS = [["en", "EN"], ["hi", "हिंदी"], ["pa", "ਪੰਜਾਬੀ"]];

// Inline styles on purpose: nothing in the stylesheet can override them.
const ICON_BOX = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 0,
  flexShrink: 0,
};
const ICON_SVG = { display: "block", margin: 0 };

function MenuLink({ to, icon: Icon, name, note, tone }) {
  return (
    <NavLink
      to={to}
      className="menu-link group"
      style={{ "--tone": tone, alignItems: "center" }}
    >
      <span className="tone-icon-sm" style={ICON_BOX}>
        <Icon size={17} className="icon-pop" style={ICON_SVG} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink">{name}</span>
        <span className="block text-xs text-muted">{note}</span>
      </span>
    </NavLink>
  );
}

export default function Navbar() {
  const { lang, setLang, tr } = useLang();
  const { theme, toggle } = useTheme();
  const { user, ready, logout } = useAuth();
  const status = useBackendStatus();
  const nav = useNavigate();
  const [menu, setMenu] = useState(false);
  const [acct, setAcct] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const wrap = useRef(null);
  const loc = useLocation();

  useEffect(() => {
    setMenu(false);
    setAcct(false);
    setMobile(false);
  }, [loc.pathname]);

  useEffect(() => {
    const onDown = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) {
        setMenu(false);
        setAcct(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenu(false);
        setAcct(false);
        setMobile(false);
      }
    };
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const groups = [
    {
      title: tr("Citizen rights and aid", "नागरिक अधिकार और सहायता", "ਨਾਗਰਿਕ ਅਧਿਕਾਰ ਅਤੇ ਸਹਾਇਤਾ"),
      tone: "var(--c-gold)",
      items: [
        {
          to: "/legal-aid", icon: HeartHandshake, tone: "var(--c-green)",
          name: tr("Free legal aid", "निःशुल्क विधिक सहायता", "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ"),
          note: tr("Section 12 calculator", "धारा 12 कैलकुलेटर", "ਧਾਰਾ 12 ਕੈਲਕੁਲੇਟਰ"),
        },
        {
          to: "/hub", icon: BookOpen, tone: "var(--c-blue)",
          name: tr("Citizen Hub", "नागरिक केंद्र", "ਨਾਗਰਿਕ ਕੇਂਦਰ"),
          note: tr("Arrest, FIR, RTI, consumer", "गिरफ्तारी, एफआईआर, आरटीआई", "ਗ੍ਰਿਫ਼ਤਾਰੀ, ਐਫ਼ਆਈਆਰ, ਆਰਟੀਆਈ"),
        },
      ],
    },
    {
      title: tr("Statutes and search", "कानून और खोज", "ਕਾਨੂੰਨ ਅਤੇ ਖੋਜ"),
      tone: "var(--c-blue)",
      items: [
        {
          to: "/search", icon: Search, tone: "var(--c-green)",
          name: tr("Law search", "कानून खोज", "ਕਾਨੂੰਨ ਖੋਜ"),
          note: tr("Semantic passage retrieval", "अर्थ-आधारित खोज", "ਅਰਥ-ਆਧਾਰਿਤ ਖੋਜ"),
        },
        {
          to: "/acts", icon: Library, tone: "var(--c-blue)",
          name: tr("Acts", "अधिनियम", "ਐਕਟ"),
          note: tr("Browse every section", "हर धारा देखें", "ਹਰ ਧਾਰਾ ਵੇਖੋ"),
        },
        {
          to: "/official", icon: FileText, tone: "var(--c-gold)",
          name: tr("Official Acts", "आधिकारिक अधिनियम", "ਅਧਿਕਾਰਤ ਐਕਟ"),
          note: tr("Details and official sources", "विवरण और आधिकारिक स्रोत", "ਵੇਰਵੇ ਅਤੇ ਅਧਿਕਾਰਤ ਸਰੋਤ"),
        },
      ],
    },
    {
      title: tr("Support and mission", "सहायता और उद्देश्य", "ਸਹਾਇਤਾ ਅਤੇ ਮਿਸ਼ਨ"),
      tone: "var(--c-green)",
      items: [
        {
          to: "/helplines", icon: Phone, tone: "var(--c-gold)",
          name: tr("Helplines", "हेल्पलाइन", "ਹੈਲਪਲਾਈਨ"),
          note: "15100, 1930, 1915, 181",
        },
        {
          to: "/contact", icon: Mail, tone: "var(--c-blue)",
          name: tr("Contact and inquiries", "संपर्क और पूछताछ", "ਸੰਪਰਕ ਅਤੇ ਪੁੱਛਗਿੱਛ"),
          note: tr("Send us a question", "हमें प्रश्न भेजें", "ਸਾਨੂੰ ਸਵਾਲ ਭੇਜੋ"),
        },
        {
          to: "/charter", icon: ShieldCheck, tone: "var(--c-purple)",
          name: tr("AI Safety Charter", "एआई सुरक्षा चार्टर", "ਏਆਈ ਸੁਰੱਖਿਆ ਚਾਰਟਰ"),
          note: tr("How answers are kept honest", "उत्तर भरोसेमंद कैसे रहते हैं", "ਜਵਾਬ ਭਰੋਸੇਯੋਗ ਕਿਵੇਂ ਰਹਿੰਦੇ ਹਨ"),
        },
      ],
    },
  ];

  const dot = status === "online" ? "#16a34a" : status === "offline" ? "#dc2626" : "#f59e0b";
  const dotClass = status === "connecting" ? "dot-pulse" : status === "online" ? "animate-pulse" : "";
  const statusText =
    status === "online"
      ? tr("Online", "ऑनलाइन", "ਆਨਲਾਈਨ")
      : status === "offline"
      ? tr("Offline", "ऑफ़लाइन", "ਔਫਲਾਈਨ")
      : tr("Connecting…", "कनेक्ट हो रहा है…", "ਕਨੈਕਟ ਹੋ ਰਿਹਾ ਹੈ…");
  const statusTip =
    status === "offline"
      ? tr("The backend server is not running", "बैकएंड सर्वर चालू नहीं है", "ਬੈਕਐਂਡ ਸਰਵਰ ਚਾਲੂ ਨਹੀਂ ਹੈ")
      : statusText;

  const initials = user
    ? user.name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "";
  const firstName = user ? user.name.split(" ")[0] : "";
  const displayName = firstName || (user ? user.name : "");

  const doLogout = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAcct(false);
    setMobile(false);
    logout();
    nav("/", { replace: true });
  };

  return (
    <header className="sticky top-3 z-40 px-3">
      <div ref={wrap} className="relative mx-auto max-w-6xl">
        <div
          className={
            "nav-pill flex items-center gap-2 sm:gap-3 rounded-full px-3 py-2 sm:px-4" +
            (scrolled ? " scrolled" : "")
          }
        >
          <Link to="/" className="group flex items-center gap-2 pr-1 sm:pr-2 shrink-0" aria-label="NyayaSahayak home">
            <span className="logo-mark btn-primary grid h-9 w-9 place-items-center rounded-xl shrink-0">
              <Scale size={18} />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="font-display block text-base font-bold text-accent whitespace-nowrap">
                NyayaSahayak <span className="text-xs font-semibold text-muted">न्याय सहायक</span>
              </span>
            </span>
          </Link>

          <nav className="ml-1 hidden items-center gap-1 lg:flex shrink-0" aria-label="Main">
            <NavLink to="/" end className="nav-link">
              {tr("Home", "मुख्य पृष्ठ", "ਮੁੱਖ ਪੰਨਾ")}
            </NavLink>
            <NavLink to="/assistant" className="btn btn-primary btn-sm pulse-glow">
              <Sparkles size={14} />
              {tr("AI Legal Assistant", "एआई कानूनी सहायक", "ਏਆਈ ਕਾਨੂੰਨੀ ਸਹਾਇਕ")}
            </NavLink>
            <button
              type="button"
              className="nav-link inline-flex items-center gap-1"
              aria-expanded={menu}
              aria-haspopup="true"
              onClick={() => {
                setMenu(!menu);
                setAcct(false);
              }}
            >
              {tr("Citizen Hub and Acts", "नागरिक केंद्र और कानून", "ਨਾਗਰਿਕ ਕੇਂਦਰ ਅਤੇ ਕਾਨੂੰਨ")}
              <ChevronDown size={14} className={menu ? "rotate-180" : ""} />
            </button>
            <NavLink to="/dashboard" className="nav-link">
              {tr("Dashboard", "डैशबोर्ड", "ਡੈਸ਼ਬੋਰਡ")}
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span
              className="hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted md:inline-flex"
              title={statusTip}
            >
              <span className={"h-2 w-2 rounded-full " + dotClass} style={{ background: dot }} />
              <span className="hidden xl:inline">{statusText}</span>
            </span>
            <button
              type="button"
              className="icon-btn theme-btn"
              onClick={toggle}
              aria-label={tr("Switch theme", "थीम बदलें", "ਥੀਮ ਬਦਲੋ")}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <div role="group" aria-label="Language" className="flex rounded-full border p-0.5">
              {LANGS.map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  aria-pressed={lang === code}
                  className={
                    "rounded-full px-2.5 py-1 text-xs font-semibold " +
                    (lang === code ? "chip-active" : "text-muted")
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {ready && !user && (
              <Link to="/auth" className="btn btn-primary btn-sm hidden sm:inline-flex">
                <LogIn size={14} />
                {tr("Sign in", "साइन इन", "ਸਾਈਨ ਇਨ")}
              </Link>
            )}
            {user && (
              <button
                type="button"
                className="hidden items-center gap-1 rounded-full border p-1 sm:flex hover:border-accent transition-all focus:outline-none focus:ring-2 focus:ring-accent/40"
                aria-expanded={acct}
                aria-haspopup="true"
                aria-label={user.name}
                title={`${user.name} (${user.email || ""})`}
                onClick={() => {
                  setAcct(!acct);
                  setMenu(false);
                }}
              >
                <span className="btn-primary grid h-7 w-7 place-items-center rounded-full text-xs font-bold shrink-0 shadow-sm">
                  {initials}
                </span>
                <ChevronDown size={12} className={"mr-1 text-muted transition-transform " + (acct ? "rotate-180" : "")} />
              </button>
            )}

            <button
              type="button"
              className="icon-btn lg:hidden"
              onClick={() => setMobile(!mobile)}
              aria-expanded={mobile}
              aria-label="Menu"
            >
              {mobile ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menu && (
          <div className="menu-pop card card-accent card-raised absolute left-0 right-0 top-full mt-2 hidden p-4 lg:block z-50 shadow-2xl bg-surface">
            <div className="grid grid-cols-3 gap-4">
              {groups.map((g) => (
                <div key={g.title}>
                  <div className="eyebrow mb-1 border-b px-2 pb-1.5" style={{ "--tone": g.tone }}>
                    {g.title}
                  </div>
                  {g.items.map((it) => (
                    <MenuLink key={it.to} {...it} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {acct && user && (
          <div className="menu-pop card card-accent card-raised absolute right-0 top-full mt-2 w-64 p-3 z-50 shadow-2xl bg-surface">
            <div className="border-b px-2 pb-2">
              <div className="font-bold text-accent">
                {tr("Hello", "नमस्ते", "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ")} {displayName}!
              </div>
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="truncate font-mono text-xs text-muted">{user.email}</div>
            </div>
            <NavLink to="/dashboard" className="menu-link mt-1 text-sm font-semibold" style={{ alignItems: "center" }}>
              <LayoutDashboard size={16} className="text-accent" />
              {tr("My dashboard", "मेरा डैशबोर्ड", "ਮੇਰਾ ਡੈਸ਼ਬੋਰਡ")}
            </NavLink>
            <button
              type="button"
              className="menu-link w-full text-left text-sm font-semibold"
              style={{ alignItems: "center" }}
              onClick={doLogout}
            >
              <LogOut size={16} className="text-accent" />
              {tr("Sign out", "साइन आउट", "ਸਾਈਨ ਆਊਟ")}
            </button>
          </div>
        )}

        {mobile && (
          <div className="menu-pop card card-accent card-raised absolute left-0 right-0 top-full mt-2 max-h-[70vh] overflow-y-auto p-3 lg:hidden z-50 shadow-2xl bg-surface">
            {user && (
              <div className="mb-2 flex items-center gap-2 border-b pb-2 px-1">
                <span className="btn-primary grid h-7 w-7 place-items-center rounded-full text-xs font-bold shrink-0">
                  {initials}
                </span>
                <div>
                  <div className="text-sm font-bold text-accent">
                    {tr("Hello", "नमस्ते", "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ")} {displayName}!
                  </div>
                  <div className="text-xs text-muted font-mono truncate">{user.email}</div>
                </div>
              </div>
            )}
            <NavLink to="/" end className="menu-link text-sm font-semibold">
              {tr("Home", "मुख्य पृष्ठ", "ਮੁੱਖ ਪੰਨਾ")}
            </NavLink>
            <NavLink to="/assistant" className="menu-link text-sm font-semibold">
              {tr("AI Legal Assistant", "एआई कानूनी सहायक", "ਏਆਈ ਕਾਨੂੰਨੀ ਸਹਾਇਕ")}
            </NavLink>
            <NavLink to="/dashboard" className="menu-link text-sm font-semibold">
              {tr("Dashboard", "डैशबोर्ड", "ਡੈਸ਼ਬੋਰਡ")}
            </NavLink>
            {groups.map((g) => (
              <div key={g.title} className="mt-2 border-t pt-2">
                <div className="eyebrow px-2 pb-1" style={{ "--tone": g.tone }}>
                  {g.title}
                </div>
                {g.items.map((it) => (
                  <MenuLink key={it.to} {...it} />
                ))}
              </div>
            ))}
            <div className="mt-2 border-t pt-2">
              {ready && !user && (
                <NavLink to="/auth" className="menu-link text-sm font-semibold">
                  <LogIn size={16} className="text-accent" />
                  {tr("Sign in or create account", "साइन इन या खाता बनाएँ", "ਸਾਈਨ ਇਨ ਜਾਂ ਖਾਤਾ ਬਣਾਓ")}
                </NavLink>
              )}
              {user && (
                <button type="button" className="menu-link w-full text-left text-sm font-semibold" onClick={doLogout}>
                  <LogOut size={16} className="text-accent" />
                  {tr("Sign out", "साइन आउट", "ਸਾਈਨ ਆਊਟ")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
