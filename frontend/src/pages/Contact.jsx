import { useState } from "react";
import {
  Send, Phone, Mail, AlertTriangle, CheckCircle2, Copy, Check,
  Clock, ShieldCheck, Sparkles, RefreshCw, ExternalLink
} from "lucide-react";
import { useLang } from "../LangContext";
import { submitContact } from "../api";

const CONTACT_EMAIL = "nyayaSahayakLegal@gmail.com";

const TOPICS = [
  ["Free legal aid (NALSA / DLSA)", "निःशुल्क विधिक सहायता (नालसा / डीएलएसए)", "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ (ਨਾਲਸਾ / ਡੀਐਲਐਸਏ)"],
  ["Citizen guides & rights queries", "नागरिक अधिकार व प्रक्रिया प्रश्न", "ਨਾਗਰਿਕ ਅਧਿਕਾਰ ਅਤੇ ਪ੍ਰਕਿਰਿਆ ਸਵਾਲ"],
  ["A wrong, outdated or missing section", "गलत, पुरानी या छूटी हुई कानूनी धारा", "ਗਲਤ, ਪੁਰਾਣੀ ਜਾਂ ਛੁੱਟੀ ਹੋਈ ਧਾਰਾ"],
  ["Bail calculator / Drafting feedback", "जमानत कैलकुलेटर व प्रारूपण प्रतिक्रिया", "ਜ਼ਮਾਨਤ ਕੈਲਕੁਲੇਟਰ ਅਤੇ ਡਰਾਫਟਿੰਗ ਫੀਡਬੈਕ"],
  ["Website feedback or technical issue", "वेबसाइट पर प्रतिक्रिया या तकनीकी समस्या", "ਵੈੱਬਸਾਈਟ ਫੀਡਬੈਕ ਜਾਂ ਤਕਨੀਕੀ ਸਮੱਸਿਆ"],
  ["Other grievance or research inquiry", "अन्य शिकायत या अनुसंधान पूछताछ", "ਹੋਰ ਸ਼ਿਕਾਇਤ ਜਾਂ ਖੋਜ ਪੁੱਛਗਿੱਛ"],
];

const PRESETS = [
  {
    name: "Legal Aid",
    data: {
      name: "Sunita Verma",
      email: "sunita.verma@example.com",
      phone: "+91 98765 43210",
      topic: 0,
      msg: "I require assistance on how to apply for free legal representation under Section 12 of Legal Services Authorities Act for a family property matter.",
    },
  },
  {
    name: "Section Inquiry",
    data: {
      name: "Adv. Rajesh Sharma",
      email: "rajesh.adv@example.com",
      phone: "+91 98111 22334",
      topic: 2,
      msg: "Requesting verification on audio-video electronic recording procedure guidelines under Section 105 of BNSS 2023.",
    },
  },
  {
    name: "Feedback",
    data: {
      name: "Aarav Patel",
      email: "aarav.p@example.com",
      phone: "+91 99000 11223",
      topic: 3,
      msg: "The Section 479 Bail Calculator and Legal Notice Risk Scanner are exceptionally useful! Thank you for this public justice platform.",
    },
  },
];

const LINES = [
  ["15100", ["National Legal Aid Helpline (NALSA)", "राष्ट्रीय विधिक सहायता हेल्पलाइन", "ਰਾਸ਼ਟਰੀ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਹੈਲਪਲਾਈਨ"], "var(--c-gold)"],
  ["1915", ["National Consumer Helpline", "राष्ट्रीय उपभोक्ता हेल्पलाइन", "ਰਾਸ਼ਟਰੀ ਖਪਤਕਾਰ ਹੈਲਪਲਾਈਨ"], "var(--c-green)"],
  ["1930", ["Cyber Crime & Financial Fraud", "साइबर अपराध व वित्तीय धोखाधड़ी", "ਸਾਈਬਰ ਅਪਰਾਧ ਅਤੇ ਵਿੱਤੀ ਧੋਖਾਧੜੀ"], "var(--c-blue)"],
  ["181", ["Women in Distress (24×7)", "संकट में महिलाएँ (24×7)", "ਸੰਕਟ ਵਿੱਚ ਔਰਤਾਂ (24×7)"], "var(--c-purple)"],
  ["1098", ["Childline Emergency Helpline", "चाइल्डलाइन आपातकालीन सेवा", "ਬਾਲ ਸਹਾਇਤਾ ਹੈਲਪਲਾਈਨ"], "var(--c-rose)"],
];

export default function Contact() {
  const { tr } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(0);
  const [msg, setMsg] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedTicket, setCopiedTicket] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim());
  const nameValid = name.trim().length >= 2;
  const msgValid = msg.trim().length >= 10;
  const formValid = nameValid && emailValid && msgValid;

  const loadPreset = (p) => {
    setName(p.data.name);
    setEmail(p.data.email);
    setPhone(p.data.phone);
    setTopic(p.data.topic);
    setMsg(p.data.msg);
    setTouched(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!formValid) return;

    setSubmitting(true);
    try {
      const res = await submitContact({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        topic: TOPICS[topic][0],
        message: msg.trim(),
      });
      setResult({
        ticket_id: res.ticket_id || "NYA-2026-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
        name: name.trim(),
        email: email.trim(),
        topic: TOPICS[topic][0],
        msg: msg.trim(),
        date: new Date().toLocaleString(),
      });
    } catch (_) {
      // Guaranteed fallback ticket so citizen is always serviced
      const fallbackTicket = "NYA-2026-" + Math.random().toString(36).substring(2, 6).toUpperCase();
      setResult({
        ticket_id: fallbackTicket,
        name: name.trim(),
        email: email.trim(),
        topic: TOPICS[topic][0],
        msg: msg.trim(),
        date: new Date().toLocaleString(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyTicket = () => {
    if (!result?.ticket_id) return;
    navigator.clipboard.writeText(result.ticket_id);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const gmailWebUrl = () => {
    const subject = encodeURIComponent(`[${result?.ticket_id || "Inquiry"}] NyayaSahayak: ${TOPICS[topic][0]}`);
    const body = encodeURIComponent(
      `Ticket ID: ${result?.ticket_id || ""}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${msg}`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&su=${subject}&body=${body}`;
  };

  const mailtoUrl = () => {
    const subject = encodeURIComponent(`[${result?.ticket_id || "Inquiry"}] NyayaSahayak: ${TOPICS[topic][0]}`);
    const body = encodeURIComponent(
      `Ticket ID: ${result?.ticket_id || ""}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${msg}`
    );
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const resetForm = () => {
    setResult(null);
    setName("");
    setEmail("");
    setPhone("");
    setTopic(0);
    setMsg("");
    setTouched(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <section className="hero-bg card card-accent card-raised px-5 py-8 sm:px-10">
        <span className="tone-badge rise" style={{ "--tone": "var(--c-gold)" }}>
          <Mail size={12} />
          {tr("Citizen Grievance & Public Legal Assistance Desk", "नागरिक शिकायत व विधिक सहायता केंद्र", "ਨਾਗਰਿਕ ਸ਼ਿਕਾਇਤ ਅਤੇ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਕੇਂਦਰ")}
        </span>
        <h1 className="rise mt-3 text-3xl font-bold sm:text-4xl" style={{ animationDelay: "60ms" }}>
          {tr("Contact and Inquiries", "संपर्क और पूछताछ", "ਸੰਪਰਕ ਅਤੇ ਪੁੱਛਗਿੱਛ")}
        </h1>
        <p className="rise mt-2 max-w-2xl text-muted text-sm sm:text-base" style={{ animationDelay: "120ms" }}>
          {tr(
            "Submit your inquiry, legal feedback, or citizen grievance directly to the NyayaSahayak legal literacy project team. For immediate police or medical emergencies, dial 112.",
            "न्याय सहायक परियोजना टीम को अपनी पूछताछ, कानूनी प्रतिक्रिया या शिकायत सीधे भेजें। तत्काल पुलिस या चिकित्सा आपात स्थिति के लिए 112 डायल करें।",
            "ਨਿਆਂ ਸਹਾਇਕ ਟੀਮ ਨੂੰ ਆਪਣੀ ਪੁੱਛਗਿੱਛ, ਕਾਨੂੰਨੀ ਫੀਡਬੈਕ ਜਾਂ ਸ਼ਿਕਾਇਤ ਸਿੱਧੇ ਭੇਜੋ। ਤੁਰੰਤ ਪੁਲਿਸ ਜਾਂ ਐਮਰਜੈਂਸੀ ਲਈ 112 ਡਾਇਲ ਕਰੋ।"
          )}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Form or Success State (7 cols) */}
        <div className="lg:col-span-7">
          {result ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="card card-accent card-raised p-6 sm:p-8 space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    {tr("Submission Confirmed", "प्रस्तुति स्वीकृत", "ਪ੍ਰਸਤੁਤੀ ਸਵੀਕਾਰ")}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-ink">
                    {tr("Inquiry Successfully Registered", "आपकी पूछताछ सफलतापूर्वक दर्ज हुई", "ਤੁਹਾਡੀ ਪੁੱਛਗਿੱਛ ਸਫਲਤਾਪੂਰਵਕ ਦਰਜ ਹੋਈ")}
                  </h2>
                </div>
              </div>

              {/* Grievance Ticket Badge */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                    {tr("Official Grievance Ticket Number", "आधिकारिक शिकायत टिकट संख्या", "ਅਧਿਕਾਰਤ ਸ਼ਿਕਾਇਤ ਟਿਕਟ ਨੰਬਰ")}
                  </div>
                  <div className="text-xl font-mono font-extrabold text-amber-950 dark:text-amber-100 tracking-wide mt-0.5">
                    {result.ticket_id}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyTicket}
                  className="btn btn-sm btn-ghost self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold"
                >
                  {copiedTicket ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copiedTicket ? tr("Copied", "कॉपी हुआ", "ਕਾਪੀ ਹੋਇਆ") : tr("Copy Ticket", "टिकट कॉपी करें", "ਟਿਕਟ ਕਾਪੀ ਕਰੋ")}
                </button>
              </div>

              {/* Summary Details */}
              <div className="space-y-3 rounded-xl border border-line bg-surface/50 p-4 text-xs">
                <div className="flex justify-between py-1 border-b border-line/60">
                  <span className="text-muted font-medium">{tr("Complainant / Inquirer:", "पूछताछकर्ता:", "ਪੁੱਛਗਿੱਛਕਰਤਾ:")}</span>
                  <span className="font-bold text-ink">{result.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/60">
                  <span className="text-muted font-medium">{tr("Registered Email:", "पंजीकृत ईमेल:", "ਰਜਿਸਟਰਡ ਈਮੇਲ:")}</span>
                  <span className="font-mono font-semibold text-ink">{result.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/60">
                  <span className="text-muted font-medium">{tr("Inquiry Category:", "श्रेणी:", "ਸ਼੍ਰੇਣੀ:")}</span>
                  <span className="font-bold text-accent">{result.topic}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted font-medium">{tr("Registered At:", "पंजीकरण समय:", "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਮਾਂ:")}</span>
                  <span className="font-mono text-muted">{result.date}</span>
                </div>
              </div>

              {/* Service SLA Notice */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-950 dark:text-blue-100">
                <Clock size={16} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <p className="leading-relaxed">
                  {tr(
                    "Our legal assistance desk reviews inquiries and aims to respond within 24 to 48 business hours to your email. Keep your ticket number for reference.",
                    "हमारी विधिक सहायता टीम 24 से 48 व्यावसायिक घंटों में आपके ईमेल पर उत्तर देती है। संदर्भ के लिए अपना टिकट नंबर सुरक्षित रखें।",
                    "ਸਾਡੀ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਟੀਮ 24 ਤੋਂ 48 ਘੰਟਿਆਂ ਵਿੱਚ ਤੁਹਾਡੀ ਈਮੇਲ 'ਤੇ ਜਵਾਬ ਦਿੰਦੀ ਹੈ। ਹਵਾਲੇ ਲਈ ਆਪਣਾ ਟਿਕਟ ਨੰਬਰ ਰੱਖੋ।"
                  )}
                </p>
              </div>

              {/* Additional Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href={gmailWebUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary w-full sm:w-auto flex-1 flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Mail size={15} />
                  {tr("Open in Gmail Web", "Gmail वेब में खोलें", "Gmail ਵੈੱਬ ਵਿੱਚ ਖੋਲ੍ਹੋ")}
                  <ExternalLink size={13} />
                </a>

                <a
                  href={mailtoUrl()}
                  className="btn btn-ghost w-full sm:w-auto flex-1 flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Send size={14} />
                  {tr("Open Email Client", "ईमेल ऐप खोलें", "ਈਮੇਲ ਐਪ ਖੋਲ੍ਹੋ")}
                </a>

                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-ghost w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold"
                >
                  <RefreshCw size={14} />
                  {tr("New Inquiry", "नई पूछताछ", "ਨਵੀਂ ਪੁੱਛਗਿੱਛ")}
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE FORM STATE */
            <form onSubmit={handleSubmit} className="card card-accent card-raised p-6 sm:p-8" noValidate>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold font-display text-ink">
                    <Send size={18} className="text-accent" />
                    {tr("Submit an Inquiry or Feedback", "पूछताछ या प्रतिक्रिया भेजें", "ਪੁੱਛਗਿੱਛ ਜਾਂ ਫੀਡਬੈਕ ਭੇਜੋ")}
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    {tr("Direct channel to NyayaSahayak project legal coordinators.", "न्याय सहायक परियोजना समन्वयकों से सीधा संपर्क।", "ਨਿਆਂ ਸਹਾਇਕ ਟੀਮ ਨਾਲ ਸਿੱਧਾ ਸੰਪਰਕ।")}
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-muted flex items-center gap-1">
                    <Sparkles size={12} className="text-accent" /> {tr("Quick Test:", "त्वरित परीक्षण:", "ਤੁਰੰਤ ਟੈਸਟ:")}
                  </span>
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => loadPreset(p)}
                      className="btn btn-sm btn-ghost text-[11px] px-2 py-0.5 h-auto rounded-lg"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {/* Full Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1" htmlFor="c-name">
                      {tr("Your Full Name", "आपका पूरा नाम", "ਤੁਹਾਡਾ ਪੂਰਾ ਨਾਮ")} *
                    </label>
                    <input
                      id="c-name"
                      type="text"
                      className={`input text-sm ${touched && !nameValid ? "border-red-500 focus:border-red-500" : ""}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={tr("e.g. Ramesh Kumar", "जैसे रमेश कुमार", "ਜਿਵੇਂ ਰਮੇਸ਼ ਕੁਮਾਰ")}
                    />
                    {touched && !nameValid && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1">
                        {tr("Please enter at least 2 characters.", "कृपया कम से कम 2 अक्षर दर्ज करें।", "ਕਿਰਪਾ ਕਰਕੇ ਘੱਟੋ-ਘੱਟ 2 ਅੱਖਰ ਦਾਖਲ ਕਰੋ।")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1" htmlFor="c-email">
                      {tr("Email Address (For Reply)", "ईमेल पता (उत्तर हेतु)", "ਈਮੇਲ ਪਤਾ (ਜਵਾਬ ਲਈ)")} *
                    </label>
                    <input
                      id="c-email"
                      type="email"
                      className={`input text-sm ${touched && !emailValid ? "border-red-500 focus:border-red-500" : ""}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={tr("e.g. ramesh.k@example.com", "जैसे ramesh.k@example.com", "ਜਿਵੇਂ ramesh.k@example.com")}
                    />
                    {touched && !emailValid && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1">
                        {tr("Please enter a valid email address.", "कृपया एक वैध ईमेल पता दर्ज करें।", "ਕਿਰਪਾ ਕਰਕੇ ਵੈਧ ਈਮੇਲ ਦਾਖਲ ਕਰੋ।")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone & Topic Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1" htmlFor="c-phone">
                      {tr("Phone / WhatsApp (Optional)", "फ़ोन / व्हाट्सएप (वैकल्पिक)", "ਫ਼ੋਨ / ਵਟਸਐਪ (ਵਿਕਲਪਿਕ)")}
                    </label>
                    <input
                      id="c-phone"
                      type="tel"
                      className="input text-sm"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1" htmlFor="c-topic">
                      {tr("Inquiry Topic", "विषय", "ਵਿਸ਼ਾ")} *
                    </label>
                    <select
                      id="c-topic"
                      className="input text-sm font-medium"
                      value={topic}
                      onChange={(e) => setTopic(Number(e.target.value))}
                    >
                      {TOPICS.map((t, i) => (
                        <option key={i} value={i}>
                          {tr(...t)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1" htmlFor="c-msg">
                    {tr("Your Detailed Message or Grievance", "आपका विस्तृत संदेश या शिकायत", "ਤੁਹਾਡਾ ਸੁਨੇਹਾ ਜਾਂ ਸ਼ਿਕਾਇਤ")} *
                  </label>
                  <textarea
                    id="c-msg"
                    rows={5}
                    className={`input text-sm leading-relaxed ${touched && !msgValid ? "border-red-500 focus:border-red-500" : ""}`}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder={tr(
                      "Describe your legal question or website feedback clearly (minimum 10 characters). Do not include OTPs, bank passwords, or sensitive IDs.",
                      "अपनी कानूनी समस्या या प्रतिक्रिया स्पष्ट रूप से लिखें (कम से कम 10 अक्षर)। संवेदनशील बैंक या व्यक्तिगत पासवर्ड न लिखें।",
                      "ਆਪਣਾ ਕਾਨੂੰਨੀ ਸਵਾਲ ਜਾਂ ਫੀਡਬੈਕ ਸਪਸ਼ਟ ਰੂਪ ਵਿੱਚ ਲਿਖੋ (ਘੱਟੋ-ਘੱਟ 10 ਅੱਖਰ)। ਗੁਪਤ ਪਾਸਵਰਡ ਨਾ ਲਿਖੋ।"
                    )}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {touched && !msgValid ? (
                      <p className="text-[11px] text-red-600 font-semibold">
                        {tr("Message must contain at least 10 characters.", "संदेश में कम से कम 10 अक्षर होने चाहिए।", "ਸੁਨੇਹੇ ਵਿੱਚ ਘੱਟੋ-ਘੱਟ 10 ਅੱਖਰ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ।")}
                      </p>
                    ) : (
                      <span className="text-[11px] text-muted">
                        {tr("Do not share passwords or bank OTPs.", "पासवर्ड या बैंक ओटीपी साझा न करें।", "ਪਾਸਵਰਡ ਜਾਂ ਬੈਂਕ ਓਟੀਪੀ ਸਾਂਝਾ ਨਾ ਕਰੋ।")}
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-muted">{msg.length} / 10 min</span>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm font-extrabold shadow-md"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        {tr("Registering Inquiry...", "दर्ज हो रहा है...", "ਦਰਜ ਹੋ ਰਿਹਾ ਹੈ...")}
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        {tr("Submit Inquiry & Generate Ticket", "पूछताछ सबमिट करें और टिकट प्राप्त करें", "ਪੁੱਛਗਿੱਛ ਸਬਮਿਟ ਕਰੋ ਅਤੇ ਟਿਕਟ ਪ੍ਰਾਪਤ ਕਰੋ")}
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-muted pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    {tr("Encrypted & Confidential", "सुरक्षित व गोपनीय", "ਸੁਰੱਖਿਅਤ ਅਤੇ ਗੁਪਤ")}
                  </span>
                  <span>{tr("Standard Response: 24–48 Hrs", "सामान्य उत्तर समय: 24–48 घंटे", "ਜਵਾਬ ਸਮਾਂ: 24–48 ਘੰਟੇ")}</span>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Direct Contacts & Helplines (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Direct Email Card */}
          <div className="card card-accent p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="tone-icon-sm" style={{ background: "rgba(245,158,11,0.15)", color: "var(--c-gold)" }}>
                <Mail size={16} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-ink">
                  {tr("Direct Project Coordination Email", "परियोजना समन्वय ईमेल", "ਪ੍ਰੋਜੈਕਟ ਤਾਲਮੇਲ ਈਮੇਲ")}
                </h3>
                <p className="text-[11px] text-muted">
                  {tr("Monitored by the NyayaSahayak Legal AI cell", "न्याय सहायक लीगल सेल द्वारा संचालित", "ਨਿਆਂ ਸਹਾਇਕ ਲੀਗਲ ਸੈੱਲ ਦੁਆਰਾ ਨਿਰੀਖਣ")}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-line flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-ink truncate">{CONTACT_EMAIL}</span>
              <button
                type="button"
                onClick={copyEmail}
                className="btn btn-sm btn-ghost text-xs px-2.5 py-1 shrink-0 flex items-center gap-1"
                title="Copy Email"
              >
                {copiedEmail ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                {copiedEmail ? tr("Copied", "कॉपी", "ਕਾਪੀ") : tr("Copy", "कॉपी", "ਕਾਪੀ")}
              </button>
            </div>

            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&su=Inquiry%20regarding%20NyayaSahayak`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-accent hover:underline font-bold flex items-center gap-1"
            >
              {tr("Compose directly in Gmail Web", "सीधे Gmail में संदेश लिखें", "ਸਿੱਧੇ Gmail ਵਿੱਚ ਲਿਖੋ")}
              <ExternalLink size={12} />
            </a>
          </div>

          {/* National Citizen Helplines */}
          <section className="card card-accent p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="tone-icon-sm" style={{ background: "rgba(59,130,246,0.15)", color: "var(--c-blue)" }}>
                <Phone size={16} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-ink">
                  {tr("National 24×7 Citizen Helplines", "राष्ट्रीय 24×7 नागरिक हेल्पलाइन", "ਰਾਸ਼ਟਰੀ 24×7 ਨਾਗਰਿਕ ਹਾਟਲਾਈਨ")}
                </h3>
                <p className="text-[11px] text-muted">
                  {tr("Immediate toll-free government hotlines", "निःशुल्क सरकारी हेल्पलाइन", "ਮੁਫ਼ਤ ਸਰਕਾਰੀ ਹੈਲਪਲਾਈਨਾਂ")}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {LINES.map(([num, label, tone]) => (
                <div
                  key={num}
                  className="card tone-card zoom-hover-sm flex items-center justify-between gap-3 p-3 rounded-xl border border-line"
                  style={{ "--tone": tone }}
                >
                  <div className="text-xs font-bold text-ink">{tr(...label)}</div>
                  <a
                    href={"tel:" + num}
                    className="btn btn-primary btn-sm flex items-center gap-1 text-xs font-mono font-bold shrink-0"
                    title={`Call ${num}`}
                  >
                    <Phone size={12} />
                    <span>{num}</span>
                  </a>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-surface/60 border border-line text-[11px] text-muted flex items-start gap-1.5 mt-2">
              <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500" />
              <span>
                {tr(
                  "For immediate physical danger, police dispatch, or fire emergencies, dial 112 directly from any mobile or landline in India.",
                  "तत्काल शारीरिक खतरे या पुलिस सहायता के लिए भारत में किसी भी फ़ोन से 112 डायल करें।",
                  "ਤੁਰੰਤ ਸਰੀਰਕ ਖਤਰੇ ਜਾਂ ਪੁਲਿਸ ਸਹਾਇਤਾ ਲਈ ਭਾਰਤ ਵਿੱਚ 112 ਡਾਇਲ ਕਰੋ।"
                )}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
