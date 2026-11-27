import { useEffect, useState } from "react";
import { Download, X, WifiOff, Smartphone, ShieldCheck } from "lucide-react";
import { useLang } from "../LangContext";

export default function InstallPwaBanner() {
  const { tr } = useLang();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // 1. Monitor online / offline network state
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 2. Monitor PWA installation prompt
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      return; // Already running inside installed PWA
    }

    const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
    if (dismissed) {
      return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-banner-dismissed", "true");
  };

  return (
    <>
      {/* Offline Status Toast */}
      {isOffline && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-2 border-2 border-amber-600 animate-bounce"
        >
          <WifiOff size={14} className="shrink-0" />
          <span>
            {tr(
              "Offline Mode Active: Emergency Rights & Helplines available offline",
              "ऑफ़लाइन मोड सक्रिय: आपातकालीन अधिकार और हेल्पलाइन उपलब्ध हैं",
              "ਔਫਲਾਈਨ ਮੋਡ ਸਰਗਰਮ: ਐਮਰਜੈਂਸੀ ਅਧਿਕਾਰ ਅਤੇ ਹੈਲਪਲਾਈਨ ਉਪਲਬਧ ਹਨ"
            )}
          </span>
        </aside>
      )}

      {/* PWA Mobile Install Floating Banner */}
      {showBanner && deferredPrompt && (
        <aside
          role="region"
          aria-label="Install App"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[400px] z-50 p-4 rounded-2xl bg-surface border-2 border-amber-500 shadow-2xl flex items-start gap-3 backdrop-blur-md"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-accent shrink-0 mt-0.5 border border-amber-500/40">
            <Smartphone size={22} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-ink tracking-tight">
                {tr("Install NyayaSahayak App", "न्याय सहायक ऐप इंस्टॉल करें", "ਨਿਆਂ ਸਹਾਇਕ ਐਪ ਇੰਸਟਾਲ ਕਰੋ")}
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 uppercase">
                Offline Ready
              </span>
            </div>

            <p className="text-[11px] text-muted mt-1 leading-snug font-medium">
              {tr(
                "Install on your home screen for instant one-tap access to emergency rights & helplines without internet.",
                "बिना इंटरनेट के भी आपातकालीन अधिकार और कानूनी सहायता के लिए होम स्क्रीन पर इंस्टॉल करें।",
                "ਬਿਨਾਂ ਇੰਟਰਨੈੱਟ ਐਮਰਜੈਂਸੀ ਅਧਿਕਾਰਾਂ ਅਤੇ ਹੈਲਪਲਾਈਨ ਲਈ ਹੋਮ ਸਕ੍ਰੀਨ 'ਤੇ ਇੰਸਟਾਲ ਕਰੋ।"
              )}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleInstallClick}
                className="btn btn-sm btn-primary text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Download size={13} />
                <span>{tr("Install App", "ऐप इंस्टॉल करें", "ਐਪ ਇੰਸਟਾਲ ਕਰੋ")}</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="btn btn-sm btn-ghost text-xs text-muted hover:text-ink font-semibold"
              >
                {tr("Not now", "अभी नहीं", "ਹੁਣੇ ਨਹੀਂ")}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-surface-2 text-muted hover:text-ink shrink-0"
            aria-label="Dismiss banner"
          >
            <X size={15} />
          </button>
        </aside>
      )}
    </>
  );
}
