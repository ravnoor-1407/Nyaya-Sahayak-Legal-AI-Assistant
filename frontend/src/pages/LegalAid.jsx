import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartHandshake,
  CheckCircle2,
  Phone,
  ExternalLink,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Info,
  ShieldCheck,
  AlertTriangle,
  Scale,
  FileText,
  Printer,
  Copy,
  Check,
  Building2,
  Users,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import { useLang } from "../LangContext";

// Official State Legal Services Authority (SLSA) Annual Income Ceilings under Section 12(h)
const STATES_DATA = [
  { id: "delhi", name: "Delhi (NCT)", ceiling: 300000, dlsaName: "Delhi State Legal Services Authority (DSLSA)" },
  { id: "punjab", name: "Punjab", ceiling: 300000, dlsaName: "Punjab State Legal Services Authority (PULSA)" },
  { id: "haryana", name: "Haryana", ceiling: 300000, dlsaName: "Haryana State Legal Services Authority (HALSA)" },
  { id: "chandigarh", name: "Chandigarh (UT)", ceiling: 300000, dlsaName: "State Legal Services Authority, U.T. Chandigarh" },
  { id: "maharashtra", name: "Maharashtra", ceiling: 300000, dlsaName: "Maharashtra State Legal Services Authority (MSLSA)" },
  { id: "uttar_pradesh", name: "Uttar Pradesh", ceiling: 300000, dlsaName: "UP State Legal Services Authority (UPSLSA)" },
  { id: "karnataka", name: "Karnataka", ceiling: 300000, dlsaName: "Karnataka State Legal Services Authority (KSLSA)" },
  { id: "tamil_nadu", name: "Tamil Nadu", ceiling: 300000, dlsaName: "Tamil Nadu State Legal Services Authority (TNSLSA)" },
  { id: "west_bengal", name: "West Bengal", ceiling: 300000, dlsaName: "West Bengal State Legal Services Authority (WBSLSA)" },
  { id: "rajasthan", name: "Rajasthan", ceiling: 300000, dlsaName: "Rajasthan State Legal Services Authority (RSLSA)" },
  { id: "gujarat", name: "Gujarat", ceiling: 300000, dlsaName: "Gujarat State Legal Services Authority (GSLSA)" },
  { id: "madhya_pradesh", name: "Madhya Pradesh", ceiling: 300000, dlsaName: "MP State Legal Services Authority (MPSLSA)" },
  { id: "bihar", name: "Bihar", ceiling: 300000, dlsaName: "Bihar State Legal Services Authority (BSLSA)" },
  { id: "kerala", name: "Kerala", ceiling: 300000, dlsaName: "Kerala State Legal Services Authority (KeLSA)" },
  { id: "andhra_pradesh", name: "Andhra Pradesh", ceiling: 300000, dlsaName: "AP State Legal Services Authority (APSLSA)" },
  { id: "telangana", name: "Telangana", ceiling: 300000, dlsaName: "Telangana State Legal Services Authority (TGSLSA)" },
  { id: "odisha", name: "Odisha", ceiling: 300000, dlsaName: "Odisha State Legal Services Authority (OSLSA)" },
  { id: "assam", name: "Assam & North East", ceiling: 300000, dlsaName: "Assam State Legal Services Authority (ASLSA)" },
  { id: "other", name: "Other State / Union Territory", ceiling: 300000, dlsaName: "State Legal Services Authority (SLSA)" },
];

export default function LegalAid() {
  const { tr } = useLang();
  const nav = useNavigate();

  // Multi-step Quiz State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Answers State
  const [category, setCategory] = useState("");
  const [stateId, setStateId] = useState("delhi");
  const [incomeBracket, setIncomeBracket] = useState("");
  const [disputeType, setDisputeType] = useState("");
  const [forum, setForum] = useState("district");
  const [applicantName, setApplicantName] = useState("");

  // UI state for application draft
  const [showApplication, setShowApplication] = useState(false);
  const [copiedApp, setCopiedApp] = useState(false);

  // Question 1: Demographic Group
  const categories = [
    {
      id: "woman_child",
      section: "12(c)",
      auto: true,
      icon: "👩",
      title: tr("Woman or Child (under 18)", "महिला या बच्चा (18 वर्ष से कम)", "ਔਰਤ ਜਾਂ ਬੱਚਾ (18 ਸਾਲ ਤੋਂ ਘੱਟ)"),
      desc: tr(
        "100% Free legal aid unconditionally — NO income test or asset ceiling applies.",
        "बिना किसी आय सीमा के पूर्णतः निःशुल्क कानूनी सहायता।",
        "ਕਿਸੇ ਵੀ ਆਮਦਨ ਸੀਮਾ ਤੋਂ ਬਿਨਾਂ 100% ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ।"
      ),
    },
    {
      id: "sc_st",
      section: "12(a)",
      auto: true,
      icon: "🏛️",
      title: tr("Scheduled Caste (SC) or Scheduled Tribe (ST)", "अनुसूचित जाति (SC) या अनुसूचित जनजाति (ST)", "ਅਨੁਸੂਚਿਤ ਜਾਤੀ (SC) ਜਾਂ ਅਨੁਸੂਚਿਤ ਜਨਜਾਤੀ (ST)"),
      desc: tr(
        "Statutory exemption under Article 39A & Sec 12(a) — Zero income check required.",
        "अनुच्छेद 39A एवं धारा 12(a) के तहत आय प्रमाण की कोई आवश्यकता नहीं।",
        "ਅਨੁਛੇਦ 39A ਅਤੇ ਧਾਰਾ 12(a) ਅਧੀਨ ਬਿਨਾਂ ਆਮਦਨ ਜਾਂਚ ਮੁਫ਼ਤ ਸਹਾਇਤਾ।"
      ),
    },
    {
      id: "custody",
      section: "12(g)",
      auto: true,
      icon: "⛓️",
      title: tr("Person in Custody, Detention or Prison Undertrial", "पुलिस हिरासत, जेल अथवा विचाराधीन बंदी", "ਪੁਲਿਸ ਹਿਰਾਸਤ, ਜੇਲ੍ਹ ਜਾਂ ਅੰਡਰਟਰਾਇਲ ਬੰਦੀ"),
      desc: tr(
        "Every undertrial has an absolute fundamental right to a free legal defense advocate.",
        "प्रत्येक विचाराधीन कैदी को निःशुल्क बचाव वकील का मौलिक अधिकार प्राप्त है।",
        "ਹਰ ਅੰਡਰਟਰਾਇਲ ਨੂੰ ਮੁਫ਼ਤ ਬਚਾਓ ਵਕੀਲ ਦਾ ਮੌਲਿਕ ਅਧਿਕਾਰ ਪ੍ਰਾਪਤ ਹੈ।"
      ),
    },
    {
      id: "disabled",
      section: "12(d)",
      auto: true,
      icon: "♿",
      title: tr("Person with Disability (Divyangjan) or Mental Illness", "दिव्यांगजन अथवा मानसिक स्वास्थ्य स्थिति वाले व्यक्ति", "ਦਿਵਿਆਂਗਜਨ ਜਾਂ ਮਾਨਸਿਕ ਸਿਹਤ ਸਥਿਤੀ ਵਾਲੇ ਵਿਅਕਤੀ"),
      desc: tr(
        "Protected under Rights of Persons with Disabilities Act & Sec 12(d) — 100% Free.",
        "दिव्यांगजन अधिकार अधिनियम एवं धारा 12(d) के अंतर्गत पूर्णतः निःशुल्क।",
        "ਦਿਵਿਆਂਗ ਵਿਅਕਤੀਆਂ ਦੇ ਅਧਿਕਾਰ ਐਕਟ ਅਧੀਨ 100% ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ।"
      ),
    },
    {
      id: "disaster_victim",
      section: "12(b)/(e)",
      auto: true,
      icon: "🛡️",
      title: tr("Victim of Trafficking, Forced Labour, Disaster, or Violence", "मानव तस्करी, बेगार, आपदा या जातिगत हिंसा पीड़ित", "ਤਸਕਰੀ, ਬੇਗਾਰ, ਆਫ਼ਤ ਜਾਂ ਹਿੰਸਾ ਪੀੜਤ"),
      desc: tr(
        "Victims of mass disasters, floods, riots, or human trafficking qualify immediately.",
        "बाढ़, दंगा, प्राकृतिक आपदा अथवा तस्करी के शिकार नागरिकों को तुरंत निःशुल्क सहायता।",
        "ਕੁਦਰਤੀ ਆਫ਼ਤਾਂ, ਦੰਗਿਆਂ ਜਾਂ ਤਸਕਰੀ ਦੇ ਪੀੜਤਾਂ ਨੂੰ ਤੁਰੰਤ ਮੁਫ਼ਤ ਸਹਾਇਤਾ।"
      ),
    },
    {
      id: "workman",
      section: "12(f)",
      auto: true,
      icon: "🏭",
      title: tr("Industrial Workman or Factory Labourer", "औद्योगिक कामगार या फ़ैक्टरी मज़दूर", "ਉਦਯੋਗਿਕ ਕਾਮਾ ਜਾਂ ਫੈਕਟਰੀ ਮਜ਼ਦੂਰ"),
      desc: tr(
        "Workers in factories and industrial establishments qualify under Sec 12(f).",
        "कारखानों और औद्योगिक प्रतिष्ठानों में कार्यरत कामगार सीधे धारा 12(f) में पात्र हैं।",
        "ਫੈਕਟਰੀਆਂ ਅਤੇ ਉਦਯੋਗਾਂ ਵਿੱਚ ਕੰਮ ਕਰਦੇ ਮਜ਼ਦੂਰ ਧਾਰਾ 12(f) ਤਹਿਤ ਯੋਗ ਹਨ।"
      ),
    },
    {
      id: "general",
      section: "12(h)",
      auto: false,
      icon: "👤",
      title: tr("General Citizen / Family / Senior Citizen / Other", "सामान्य नागरिक / परिवार / वरिष्ठ नागरिक / अन्य", "ਆਮ ਨਾਗਰਿਕ / ਪਰਿਵਾਰ / ਸੀਨੀਅਰ ਨਾਗਰਿਕ / ਹੋਰ"),
      desc: tr(
        "Evaluated against your State Government's official annual income ceiling.",
        "आपकी राज्य सरकार द्वारा निर्धारित वार्षिक आय सीमा के आधार पर पात्रता।",
        "ਤੁਹਾਡੀ ਰਾਜ ਸਰਕਾਰ ਦੁਆਰਾ ਨਿਰਧਾਰਿਤ ਸਾਲਾਨਾ ਆਮਦਨ ਸੀਮਾ ਦੇ ਆਧਾਰ 'ਤੇ ਯੋਗਤਾ।"
      ),
    },
  ];

  // Question 3: Income Brackets
  const incomeBrackets = [
    {
      id: "bpl_150k",
      max: 150000,
      label: tr("Under ₹1,50,000 / year (Below ₹12,500/month)", "₹1,50,000 / वर्ष से कम (₹12,500/माह से कम)", "₹1,50,000 / ਸਾਲ ਤੋਂ ਘੱਟ"),
      note: tr("Qualifies automatically across ALL 36 States and Union Territories in India.", "भारत के सभी राज्यों एवं केंद्र शासित प्रदेशों में पूर्णतः पात्र।", "ਭਾਰਤ ਦੇ ਸਾਰੇ ਰਾਜਾਂ ਵਿੱਚ 100% ਯੋਗ।"),
    },
    {
      id: "mid_300k",
      max: 300000,
      label: tr("₹1,50,001 to ₹3,00,000 / year (₹12,500 - ₹25,000/month)", "₹1,50,001 से ₹3,00,000 / वर्ष", "₹1,50,001 ਤੋਂ ₹3,00,000 / ਸਾਲ"),
      note: tr("Qualifies in Delhi, Punjab, Maharashtra, UP, and majority of Indian High Courts.", "दिल्ली, पंजाब, महाराष्ट्र, यूपी और अधिकांश राज्यों के लिए पूर्णतः पात्र।", "ਦਿੱਲੀ, ਪੰਜਾਬ, ਮਹਾਰਾਸ਼ਟਰ ਅਤੇ ਯੂਪੀ ਸਮੇਤ ਬਹੁਤੇ ਰਾਜਾਂ ਵਿੱਚ ਯੋਗ।"),
    },
    {
      id: "upper_500k",
      max: 500000,
      label: tr("₹3,00,001 to ₹5,00,000 / year (₹25,000 - ₹41,500/month)", "₹3,00,001 से ₹5,00,000 / वर्ष", "₹3,00,001 ਤੋਂ ₹5,00,000 / ਸਾਲ"),
      note: tr("Eligible for Supreme Court Middle Income Group Scheme & Senior Citizen limits.", "सुप्रीम कोर्ट मध्यम आय वर्ग योजना एवं वरिष्ठ नागरिक छूट के अंतर्गत विचारणीय।", "ਸੁਪਰੀਮ ਕੋਰਟ ਮਿਡਲ ਇਨਕਮ ਗਰੁੱਪ ਸਕੀਮ ਤਹਿਤ ਯੋਗ।"),
    },
    {
      id: "above_500k",
      max: 99999999,
      label: tr("Above ₹5,00,000 / year (Above ₹41,500/month)", "₹5,00,000 / वर्ष से अधिक", "₹5,00,000 / ਸਾਲ ਤੋਂ ਵੱਧ"),
      note: tr("General income ceiling exceeded, but eligible unconditionally if in Category 1-6 or Lok Adalat.", "सामान्य सीमा से अधिक, परंतु श्रेणी 1-6 अथवा लोक अदालत में निःशुल्क पात्र।", "ਆਮ ਸੀਮਾ ਤੋਂ ਵੱਧ, ਪਰ ਸ਼੍ਰੇਣੀ 1-6 ਜਾਂ ਲੋਕ ਅਦਾਲਤ ਵਿੱਚ ਯੋਗ।"),
    },
  ];

  // Question 4: Dispute Types
  const disputeTypes = [
    {
      id: "criminal",
      icon: "⚖️",
      title: tr("Criminal Case / Police FIR / Bail / Arrest", "आपराधिक मामला / पुलिस प्राथमिकी / जमानत / गिरफ्तारी", "ਫੌਜਦਾਰੀ ਕੇਸ / ਐਫਆਈਆਰ / ਜ਼ਮਾਨਤ / ਗ੍ਰਿਫ਼ਤਾਰੀ"),
      desc: tr("Right to free counsel under Article 21 and Section 12.", "अनुच्छेद 21 एवं धारा 12 के अंतर्गत मुफ्त बचाव वकील का अधिकार।", "ਅਨੁਛੇਦ 21 ਅਧੀਨ ਮੁਫ਼ਤ ਵਕੀਲ ਦਾ ਅਧਿਕਾਰ।"),
    },
    {
      id: "matrimonial",
      icon: "🏠",
      title: tr("Family / Matrimonial / Domestic Violence / Maintenance", "पारिवारिक / वैवाहिक / घरेलू हिंसा / भरण-पोषण", "ਪਰਿਵਾਰਕ / ਵਿਆਹ / ਘਰੇਲੂ ਹਿੰਸਾ / ਖਰਚਾ"),
      desc: tr("Free representation before Family Courts & Protection Officers.", "पारिवारिक अदालतों और संरक्षण अधिकारियों के समक्ष निःशुल्क पैरवी।", "ਪਰਿਵਾਰਕ ਅਦਾਲਤਾਂ ਅੱਗੇ ਮੁਫ਼ਤ ਵਕੀਲ।"),
    },
    {
      id: "property",
      icon: "📜",
      title: tr("Property / Land / Tenancy / Eviction Dispute", "संपत्ति / भूमि / किराएदारी / बेदखली विवाद", "ਜ਼ਮੀਨ ਜਾਇਦਾਦ / ਕਿਰਾਏਦਾਰੀ / ਬੇਦਖਲੀ ਵਿਵਾਦ"),
      desc: tr("Free court fee exemption and panel civil advocate.", "अदालती शुल्क माफ़ी और दीवानी वकील की निःशुल्क सेवा।", "ਅਦਾਲਤੀ ਫੀਸ ਛੋਟ ਅਤੇ ਮੁਫ਼ਤ ਦੀਵਾਨੀ ਵਕੀਲ।"),
    },
    {
      id: "labour",
      icon: "💼",
      title: tr("Labour / Wages / Unlawful Termination", "श्रम / वेतन / गैरकानूनी बर्खास्तगी", "ਮਜ਼ਦੂਰੀ / ਤਨਖਾਹ / ਗੈਰ-ਕਾਨੂੰਨੀ ਬਰਖਾਸਤਗੀ"),
      desc: tr("Free legal services before Labour Courts and Industrial Tribunals.", "श्रम न्यायालयों और औद्योगिक न्यायाधिकरणों के समक्ष निःशुल्क सेवा।", "ਲੇਬਰ ਕੋਰਟ ਅੱਗੇ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸੇਵਾ।"),
    },
    {
      id: "consumer_cyber",
      icon: "🛍️",
      title: tr("Consumer Fraud / Cyber Crime / Online Cheating", "उपभोक्ता धोखाधड़ी / साइबर अपराध / ऑनलाइन ठगी", "ਖਪਤਕਾਰ ਧੋਖਾਧੜੀ / ਸਾਈਬਰ ਅਪਰਾਧ / ਆਨਲਾਈਨ ਠੱਗੀ"),
      desc: tr("Free petition drafting and representation before Consumer Commissions.", "उपभोक्ता आयोगों के समक्ष निःशुल्क याचिका और पैरवी।", "ਖਪਤਕਾਰ ਫੋਰਮ ਅੱਗੇ ਮੁਫ਼ਤ ਅਰਜ਼ੀ।"),
    },
  ];

  // Question 5: Forums
  const forums = [
    {
      id: "district",
      name: tr("District Court / Taluka Committee (DLSA / TLSC)", "ज़िला अदालत / तालुक विधिक सेवा समिति", "ਜ਼ਿਲ੍ਹਾ ਅਦਾਲਤ / ਤਾਲੁਕਾ ਕਮੇਟੀ"),
      desc: tr("First instance trial courts and Magistrate courts.", "प्रथम दृष्टया विचारण अदालतें एवं मजिस्ट्रेट अदालत।", "ਜ਼ਿਲ੍ਹਾ ਅਦਾਲਤਾਂ ਅਤੇ ਮੈਜਿਸਟ੍ਰੇਟ ਅਦਾਲਤ।"),
    },
    {
      id: "high_court",
      name: tr("High Court (High Court Legal Services Committee)", "उच्च न्यायालय (हाई कोर्ट विधिक सेवा समिति)", "ਹਾਈ ਕੋਰਟ ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਕਮੇਟੀ"),
      desc: tr("Appeals, revisions, and constitutional writ petitions.", "अपील, पुनरीक्षण एवं रिट याचिकाएँ।", "ਅਪੀਲਾਂ ਅਤੇ ਰਿੱਟ ਪਟੀਸ਼ਨਾਂ।"),
    },
    {
      id: "supreme_court",
      name: tr("Supreme Court of India (SCLSC)", "भारत का सर्वोच्च न्यायालय (SCLSC)", "ਭਾਰਤ ਦੀ ਸੁਪਰੀਮ ਕੋਰਟ"),
      desc: tr("Special Leave Petitions (SLP) and National Appeals.", "विशेष अनुमति याचिका (SLP) एवं राष्ट्रीय अपीलें।", "ਐਸਐਲਪੀ ਅਤੇ ਸੁਪਰੀਮ ਕੋਰਟ ਅਪੀਲਾਂ।"),
    },
    {
      id: "lok_adalat",
      name: tr("National Lok Adalat (Pre-litigation / Settlement)", "राष्ट्रीय लोक अदालत (मुकदमा-पूर्व समझौता)", "ਕੌਮੀ ਲੋਕ ਅਦਾਲਤ (ਸਮਝੌਤਾ)"),
      desc: tr("100% Free dispute resolution for everyone, with full court fee refund.", "सभी नागरिकों के लिए पूरी तरह निःशुल्क, कोर्ट फीस की पूर्ण वापसी।", "ਸਾਰਿਆਂ ਲਈ ਬਿਲਕੁਲ ਮੁਫ਼ਤ, ਕੋਰਟ ਫੀਸ ਦੀ ਪੂਰੀ ਵਾਪਸੀ।"),
    },
  ];

  const selectedCategoryObj = categories.find((c) => c.id === category);
  const selectedStateObj = STATES_DATA.find((s) => s.id === stateId) || STATES_DATA[0];
  const selectedIncomeObj = incomeBrackets.find((b) => b.id === incomeBracket);
  const selectedDisputeObj = disputeTypes.find((d) => d.id === disputeType);
  const selectedForumObj = forums.find((f) => f.id === forum);

  // EVALUATE ELIGIBILITY
  const isAutoExempt = selectedCategoryObj?.auto || false;
  const isIncomeWithinStateLimit =
    selectedIncomeObj && selectedIncomeObj.max <= selectedStateObj.ceiling;
  const isSupremeCourtMiddleIncome =
    forum === "supreme_court" && selectedIncomeObj && selectedIncomeObj.max <= 500000;
  const isLokAdalat = forum === "lok_adalat";

  const isEligible = isAutoExempt || isIncomeWithinStateLimit || isSupremeCourtMiddleIncome || isLokAdalat;

  // Handlers
  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setCategory("");
    setStateId("delhi");
    setIncomeBracket("");
    setDisputeType("");
    setForum("district");
    setApplicantName("");
    setShowApplication(false);
  };

  // Generate Formal NALSA Form 1 Draft
  const getFormalDraft = () => {
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const citizen = applicantName.trim() || "Applicant (Citizen of India)";
    const catTitle = selectedCategoryObj?.title || "Citizen under Section 12";
    const secClause = selectedCategoryObj?.section || "12(h)";
    const dispute = selectedDisputeObj?.title || "Legal Grievance / Litigation";
    const authority = selectedStateObj.dlsaName;

    return `FORM NO. 1
APPLICATION FOR FREE LEGAL SERVICES / ADVOCATE UNDER SECTION 12
LEGAL SERVICES AUTHORITIES ACT, 1987 (NALSA)

TO,
THE MEMBER SECRETARY / SECRETARY,
${authority.toUpperCase()},
DISTRICT LEGAL SERVICES AUTHORITY (DLSA).
Date: ${today}

1. APPLICANT PARTICULARS:
   - Full Name of Applicant: ${citizen}
   - State / Union Territory: ${selectedStateObj.name}
   - Statutory Category Claimed: ${catTitle}
   - Applicable Statutory Provision: Section ${secClause} of Legal Services Authorities Act, 1987

2. NATURE OF PROCEEDING & FORUM:
   - Nature of Matter: ${dispute}
   - Proposed Judicial Forum: ${selectedForumObj?.name || "District & Sessions Court"}
   - Estimated Annual Household Income: ${selectedIncomeObj?.label || "Subject to statutory verification"}

3. STATUTORY GROUNDS & RELIEF PRAYED:
   (i)  The applicant humbly submits that under Section 12 of the Legal Services Authorities Act, 1987,
        the applicant qualifies for free legal services, being ${isAutoExempt ? "a member of the protected class exempt from financial ceiling" : `within the statutory annual income limit of Rs. ${selectedStateObj.ceiling.toLocaleString("en-IN")} prescribed by the State Government`}.
   (ii) PRAYER: In accordance with Sections 12 and 13 of the Act, the Hon'ble Authority is requested to:
        a) Assign a qualified Panel Advocate from the DLSA/HCLSC Panel to represent the applicant.
        b) Grant complete exemption and waiver from all Court Fees, process fees, and typing/photocopying expenses.
        c) Furnish certified true copies of relevant orders, charge-sheets, or proceedings free of charge.

VERIFICATION:
I, the above-named applicant, do hereby solemnly declare that the statements made herein are true to the best of my knowledge and belief.

_______________________________
Signature / Thumb Impression of Applicant
Helpline: National Legal Aid Helpline 15100 (Toll-Free 24x7)`;
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(getFormalDraft());
    setCopiedApp(true);
    setTimeout(() => setCopiedApp(false), 2500);
  };

  const handlePrintDraft = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Hero Banner */}
      <section className="hero-bg card card-accent card-raised px-5 py-8 sm:px-10">
        <span className="tone-badge rise" style={{ "--tone": "var(--c-green)" }}>
          <HeartHandshake size={14} />
          {tr("Section 12, Legal Services Authorities Act, 1987", "धारा 12, विधिक सेवा प्राधिकरण अधिनियम, 1987", "ਧਾਰਾ 12, ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਅਥਾਰਟੀ ਐਕਟ, 1987")}
        </span>
        <h1 className="rise mt-3 text-3xl font-black sm:text-4xl text-ink tracking-tight" style={{ animationDelay: "60ms" }}>
          {tr(
            "Free Legal Aid & Lawyer Eligibility Quiz",
            "निःशुल्क विधिक सहायता और सरकारी वकील पात्रता प्रश्नावली",
            "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਅਤੇ ਸਰਕਾਰੀ ਵਕੀਲ ਯੋਗਤਾ ਕਵਿਜ਼"
          )}
        </h1>
        <p className="rise mt-2 text-muted text-sm sm:text-base font-medium max-w-2xl leading-relaxed" style={{ animationDelay: "120ms" }}>
          {tr(
            "Answer 4 simple questions to find out if you qualify for a 100% free government-appointed advocate, waiver of court fees, and full litigation support under NALSA guidelines.",
            "4 आसान प्रश्नों के उत्तर देकर जानिए कि क्या आप नालसा दिशा-निर्देशों के तहत सरकारी खर्च पर वकील और अदालती शुल्क माफ़ी के पात्र हैं।",
            "4 ਆਸਾਨ ਸਵਾਲਾਂ ਦੇ ਜਵਾਬ ਦੇ ਕੇ ਜਾਣੋ ਕਿ ਕੀ ਤੁਸੀਂ ਨਾਲਸਾ ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼ਾਂ ਤਹਿਤ ਸਰਕਾਰੀ ਖਰਚੇ 'ਤੇ ਮੁਫ਼ਤ ਵਕੀਲ ਅਤੇ ਕੋਰਟ ਫੀਸ ਮਾਫ਼ੀ ਦੇ ਹੱਕਦਾਰ ਹੋ।"
          )}
        </p>

        {/* Stepper Progress Bar */}
        <div className="mt-6 pt-5 border-t border-line/60">
          <div className="flex items-center justify-between text-xs font-bold text-ink mb-2">
            <span className="text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              {tr(`Question ${Math.min(currentStep, 4)} of 4`, `प्रश्न ${Math.min(currentStep, 4)} / 4`, `ਸਵਾਲ ${Math.min(currentStep, 4)} / 4`)}
            </span>
            <span className="text-muted">
              {currentStep === 1 && tr("Demographic Group", "नागरिक श्रेणी", "ਨਾਗਰਿਕ ਸ਼੍ਰੇਣੀ")}
              {currentStep === 2 && tr("Jurisdiction & State", "राज्य व क्षेत्राधिकार", "ਰਾਜ ਅਤੇ ਅਧਿਕਾਰ ਖੇਤਰ")}
              {currentStep === 3 && tr("Household Income", "पारिवारिक आय", "ਪਰਿਵਾਰਕ ਆਮਦਨ")}
              {currentStep === 4 && tr("Nature of Legal Dispute", "कानूनी विवाद की प्रकृति", "ਕਾਨੂੰਨੀ ਵਿਵਾਦ ਦੀ ਕਿਸਮ")}
              {currentStep === 5 && tr("Final Assessment Report", "अंतिम पात्रता रिपोर्ट", "ਅੰਤਿਮ ਯੋਗਤਾ ਰਿਪੋਰਟ")}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden border border-line">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, (currentStep / 4) * 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* ================= STEP 1: CATEGORY SELECTION ================= */}
      {currentStep === 1 && (
        <section className="card card-accent card-raised p-6 sm:p-8 bg-surface border border-line space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                {tr("Question 1", "प्रश्न 1", "ਸਵਾਲ 1")}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                {tr("Who is seeking legal aid?", "विधिक सहायता किसके लिए चाहिए?", "ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਕਿਸ ਲਈ ਚਾਹੀਦੀ ਹੈ?")}
              </h2>
              <p className="text-xs sm:text-sm text-muted font-medium mt-1">
                {tr(
                  "Certain demographic groups receive unconditional free legal defense under Section 12 without any income ceiling.",
                  "विधिक सेवा प्राधिकरण अधिनियम की धारा 12 के तहत कुछ श्रेणियों को बिना किसी आय सीमा के 100% मुफ्त वकील मिलता है।",
                  "ਧਾਰਾ 12 ਤਹਿਤ ਕੁਝ ਵਰਗਾਂ ਨੂੰ ਬਿਨਾਂ ਆਮਦਨ ਜਾਂਚ ਮੁਫ਼ਤ ਵਕੀਲ ਮਿਲਦਾ ਹੈ।"
                )}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            {categories.map((c) => {
              const isSel = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between shadow-xs ${
                    isSel
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/60 ring-2 ring-amber-400/40"
                      : "border-line bg-surface hover:bg-surface-2 hover:border-amber-500/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{c.icon}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                      c.auto
                        ? "bg-emerald-100 text-emerald-900 border-emerald-500 dark:bg-emerald-950/80 dark:text-emerald-200"
                        : "bg-surface-2 text-ink border-line"
                    }`}>
                      {tr("Sec", "धारा", "ਧਾਰਾ")} {c.section} {c.auto ? "• " + tr("100% Free", "निःशुल्क", "ਮੁਫ਼ਤ") : ""}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className={`text-sm sm:text-base font-black ${isSel ? "text-amber-950 dark:text-amber-100" : "text-ink"}`}>
                      {c.title}
                    </h3>
                    <p className="text-xs text-muted font-medium mt-1 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>

                  {isSel && (
                    <div className="mt-3 pt-2 border-t border-amber-300 dark:border-amber-700/60 flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                      <CheckCircle2 size={15} className="text-amber-600 shrink-0" />
                      <span>{tr("Selected Category", "चयनित श्रेणी", "ਚੁਣੀ ਗਈ ਸ਼੍ਰੇਣੀ")}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-line">
            <span className="text-xs text-muted font-medium">
              {tr("Select your group to continue", "आगे बढ़ने के लिए अपनी श्रेणी चुनें", "ਅੱਗੇ ਵਧਣ ਲਈ ਸ਼੍ਰੇਣੀ ਚੁਣੋ")}
            </span>
            <button
              type="button"
              disabled={!category}
              onClick={handleNext}
              className="btn btn-primary px-6 flex items-center gap-2 font-bold shadow-md"
            >
              <span>{tr("Continue", "आगे बढ़ें", "ਅੱਗੇ ਵਧੋ")}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* ================= STEP 2: STATE & JURISDICTION ================= */}
      {currentStep === 2 && (
        <section className="card card-accent card-raised p-6 sm:p-8 bg-surface border border-line space-y-6">
          <div>
            <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
              {tr("Question 2", "प्रश्न 2", "ਸਵਾਲ 2")}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              {tr("Select your State or Union Territory", "अपना राज्य अथवा केंद्र शासित प्रदेश चुनें", "ਆਪਣਾ ਰਾਜ ਜਾਂ ਕੇਂਦਰ ਸ਼ਾਸਿਤ ਪ੍ਰਦੇਸ਼ ਚੁਣੋ")}
            </h2>
            <p className="text-xs sm:text-sm text-muted font-medium mt-1 leading-relaxed">
              {tr(
                "Each State Legal Services Authority (SLSA) sets its own statutory annual income ceiling under Section 12(h).",
                "धारा 12(h) के तहत प्रत्येक राज्य विधिक सेवा प्राधिकरण अपनी आधिकारिक वार्षिक आय सीमा तय करता है।",
                "ਹਰ ਰਾਜ ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਅਥਾਰਟੀ ਆਪਣੀ ਆਮਦਨ ਸੀਮਾ ਤੈਅ ਕਰਦੀ ਹੈ।"
              )}
            </p>
          </div>

          {/* Quick Notice if User is Already Auto-Exempt */}
          {isAutoExempt && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-600/70 text-emerald-950 dark:text-emerald-100 flex items-start gap-3 shadow-xs">
              <ShieldCheck size={22} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm space-y-1">
                <span className="font-extrabold block">
                  {tr(
                    `✨ Automatic Exemption Active: ${selectedCategoryObj?.title}`,
                    `✨ स्वतः छूट सक्रिय: ${selectedCategoryObj?.title}`,
                    `✨ ਆਟੋਮੈਟਿਕ ਛੋਟ ਸਰਗਰਮ: ${selectedCategoryObj?.title}`
                  )}
                </span>
                <p className="font-medium text-emerald-900 dark:text-emerald-200">
                  {tr(
                    "You are already eligible for 100% free legal aid regardless of your State or income. We only need your State to route you to the correct local DLSA office.",
                    "आप बिना किसी आय सीमा के पूर्णतः पात्र हैं। आपका राज्य केवल निकटतम ज़िला विधिक सेवा प्राधिकरण (DLSA) से जोड़ने के लिए पूछा जा रहा है।",
                    "ਤੁਸੀਂ ਬਿਨਾਂ ਆਮਦਨ ਜਾਂਚ ਦੇ ਪੂਰੀ ਤਰ੍ਹਾਂ ਯੋਗ ਹੋ। ਤੁਹਾਡਾ ਰਾਜ ਸਿਰਫ਼ ਸਥਾਨਕ ਡੀਐਲਐਸਏ ਦਫ਼ਤਰ ਨਾਲ ਜੋੜਨ ਲਈ ਪੁੱਛਿਆ ਜਾ ਰਿਹਾ ਹੈ।"
                  )}
                </p>
              </div>
            </div>
          )}

          {/* State Selector Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-ink uppercase tracking-wider block">
              {tr("State / Union Territory Jurisdiction:", "राज्य / केंद्र शासित प्रदेश क्षेत्राधिकार:", "ਰਾਜ / ਕੇਂਦਰ ਸ਼ਾਸਿਤ ਪ੍ਰਦੇਸ਼:")}
            </label>
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
              {STATES_DATA.map((st) => {
                const isSel = stateId === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStateId(st.id)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                      isSel
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/70 ring-2 ring-amber-400/40"
                        : "border-line bg-surface hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSel ? "text-amber-950 dark:text-amber-100" : "text-ink"}`}>
                        {st.name}
                      </span>
                      {isSel && <CheckCircle2 size={15} className="text-amber-600 shrink-0" />}
                    </div>
                    <span className="text-[11px] text-muted font-medium mt-1">
                      {tr("Ceiling:", "अधिकतम सीमा:", "ਸੀਮਾ:")} ₹{(st.ceiling / 100000).toFixed(1)} {tr("Lakhs/yr", "लाख/वर्ष", "ਲੱਖ/ਸਾਲ")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-line">
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-ghost px-4 flex items-center gap-2 font-bold text-ink"
            >
              <ArrowLeft size={16} />
              <span>{tr("Back", "पीछे", "ਪਿੱਛੇ")}</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary px-6 flex items-center gap-2 font-bold shadow-md"
            >
              <span>{tr("Continue to Income Check", "आय विवरण पर आगे बढ़ें", "ਆਮਦਨ ਵੇਰਵੇ 'ਤੇ ਅੱਗੇ ਵਧੋ")}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* ================= STEP 3: HOUSEHOLD INCOME ================= */}
      {currentStep === 3 && (
        <section className="card card-accent card-raised p-6 sm:p-8 bg-surface border border-line space-y-6">
          <div>
            <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
              {tr("Question 3", "प्रश्न 3", "ਸਵਾਲ 3")}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              {tr("What is your estimated annual family income?", "आपकी अनुमानित वार्षिक पारिवारिक आय कितनी है?", "ਤੁਹਾਡੀ ਸਾਲਾਨਾ ਪਰਿਵਾਰਕ ਆਮਦਨ ਕਿੰਨੀ ਹੈ?")}
            </h2>
            <p className="text-xs sm:text-sm text-muted font-medium mt-1 leading-relaxed">
              {tr(
                `Under Section 12(h) in ${selectedStateObj.name}, free legal aid is statutory for citizens with annual income up to ₹${selectedStateObj.ceiling.toLocaleString("en-IN")}.`,
                `${selectedStateObj.name} में धारा 12(h) के तहत ₹${selectedStateObj.ceiling.toLocaleString("en-IN")} तक की वार्षिक आय वाले नागरिक पूर्णतः निःशुल्क विधिक सहायता के हकदार हैं।`,
                `${selectedStateObj.name} ਵਿੱਚ ₹${selectedStateObj.ceiling.toLocaleString("en-IN")} ਤੱਕ ਦੀ ਆਮਦਨ ਵਾਲੇ ਨਾਗਰਿਕ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਦੇ ਹੱਕਦਾਰ ਹਨ।`
              )}
            </p>
          </div>

          <div className="space-y-3">
            {incomeBrackets.map((br) => {
              const isSel = incomeBracket === br.id;
              const qualifiesInSelectedState = br.max <= selectedStateObj.ceiling;

              return (
                <button
                  key={br.id}
                  type="button"
                  onClick={() => setIncomeBracket(br.id)}
                  className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-start justify-between gap-4 shadow-xs ${
                    isSel
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/70 ring-2 ring-amber-400/40"
                      : "border-line bg-surface hover:bg-surface-2 hover:border-amber-500/50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`text-sm sm:text-base font-black ${isSel ? "text-amber-950 dark:text-amber-100" : "text-ink"}`}>
                        {br.label}
                      </span>
                      {(isAutoExempt || qualifiesInSelectedState) && (
                        <span className="badge text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-500 px-2 py-0.5">
                          {tr("Eligible", "पात्र", "ਯੋਗ")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted font-medium mt-1.5 leading-relaxed">
                      {br.note}
                    </p>
                  </div>

                  <div className="shrink-0 mt-1">
                    {isSel ? (
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                        ✓
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-line bg-surface" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-line">
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-ghost px-4 flex items-center gap-2 font-bold text-ink"
            >
              <ArrowLeft size={16} />
              <span>{tr("Back", "पीछे", "ਪਿੱਛੇ")}</span>
            </button>
            <button
              type="button"
              disabled={!incomeBracket}
              onClick={handleNext}
              className="btn btn-primary px-6 flex items-center gap-2 font-bold shadow-md"
            >
              <span>{tr("Continue to Dispute Type", "मामले का विवरण चुनें", "ਕੇਸ ਦਾ ਵੇਰਵਾ ਚੁਣੋ")}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* ================= STEP 4: DISPUTE NATURE & FORUM ================= */}
      {currentStep === 4 && (
        <section className="card card-accent card-raised p-6 sm:p-8 bg-surface border border-line space-y-6">
          <div>
            <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
              {tr("Question 4", "प्रश्न 4", "ਸਵਾਲ 4")}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              {tr("What kind of legal case do you need help with?", "आपको किस प्रकार के कानूनी मामले में सहायता चाहिए?", "ਤੁਹਾਨੂੰ ਕਿਸ ਕਿਸਮ ਦੇ ਕੇਸ ਵਿੱਚ ਸਹਾਇਤਾ ਚਾਹੀਦੀ ਹੈ?")}
            </h2>
            <p className="text-xs sm:text-sm text-muted font-medium mt-1 leading-relaxed">
              {tr(
                "Free legal aid covers criminal defense, civil suits, matrimonial cases, and labour matters in all courts.",
                "निःशुल्क विधिक सहायता में सभी अदालतों में आपराधिक बचाव, दीवानी मुकदमे, वैवाहिक विवाद और श्रम मामले शामिल हैं।",
                "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਵਿੱਚ ਫੌਜਦਾਰੀ, ਦੀਵਾਨੀ, ਪਰਿਵਾਰਕ ਅਤੇ ਲੇਬਰ ਕੇਸ ਸ਼ਾਮਲ ਹਨ।"
              )}
            </p>
          </div>

          {/* Dispute Type Selection */}
          <div className="grid gap-3 sm:grid-cols-2">
            {disputeTypes.map((dt) => {
              const isSel = disputeType === dt.id;
              return (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => setDisputeType(dt.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                    isSel
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/70 ring-2 ring-amber-400/40"
                      : "border-line bg-surface hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{dt.icon}</span>
                    <h3 className={`text-xs sm:text-sm font-bold ${isSel ? "text-amber-950 dark:text-amber-100" : "text-ink"}`}>
                      {dt.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted font-medium mt-2 leading-relaxed">
                    {dt.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Forum / Court Level */}
          <div className="pt-3 border-t border-line space-y-3">
            <label className="text-xs font-bold text-ink uppercase tracking-wider block">
              {tr("Required Court Level / Forum:", "अपेक्षित अदालत स्तर / मंच:", "ਅਦਾਲਤ ਪੱਧਰ / ਫੋਰਮ:")}
            </label>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {forums.map((fm) => {
                const isSel = forum === fm.id;
                return (
                  <button
                    key={fm.id}
                    type="button"
                    onClick={() => setForum(fm.id)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                      isSel
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/70"
                        : "border-line bg-surface hover:bg-surface-2"
                    }`}
                  >
                    <div className="text-xs font-extrabold text-ink">{fm.name}</div>
                    <div className="text-[11px] text-muted font-medium mt-0.5">{fm.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-line">
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-ghost px-4 flex items-center gap-2 font-bold text-ink"
            >
              <ArrowLeft size={16} />
              <span>{tr("Back", "पीछे", "ਪਿੱਛੇ")}</span>
            </button>
            <button
              type="button"
              disabled={!disputeType}
              onClick={() => setCurrentStep(5)}
              className="btn btn-primary px-7 flex items-center gap-2 font-black shadow-md text-sm"
            >
              <Sparkles size={16} />
              <span>{tr("View My Legal Aid Verdict", "मेरी पात्रता रिपोर्ट देखें", "ਮੇਰੀ ਯੋਗਤਾ ਰਿਪੋਰਟ ਦੇਖੋ")}</span>
            </button>
          </div>
        </section>
      )}

      {/* ================= STEP 5: FINAL STATUTORY REPORT ================= */}
      {currentStep === 5 && (
        <section className="space-y-6">
          {/* Main Verdict Card */}
          <div
            className={`card p-6 sm:p-8 rounded-2xl border-2 shadow-md ${
              isEligible
                ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-600 dark:border-emerald-500 text-emerald-950 dark:text-emerald-100"
                : "bg-amber-50 dark:bg-amber-950/80 border-amber-600 dark:border-amber-500 text-amber-950 dark:text-amber-100"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3.5 rounded-2xl text-white shadow-md shrink-0 ${
                  isEligible ? "bg-emerald-600" : "bg-amber-600"
                }`}
              >
                {isEligible ? <CheckCircle2 size={34} /> : <AlertTriangle size={34} />}
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`badge text-xs font-black uppercase px-2.5 py-0.5 border ${
                      isEligible
                        ? "bg-emerald-200 text-emerald-950 border-emerald-600 dark:bg-emerald-900/90 dark:text-emerald-100"
                        : "bg-amber-200 text-amber-950 border-amber-600 dark:bg-amber-900/90 dark:text-amber-100"
                    }`}
                  >
                    {isEligible
                      ? tr("QUALIFIED FOR 100% FREE LEGAL AID", "100% निःशुल्क कानूनी सहायता हेतु पात्र", "100% ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਲਈ ਯੋਗ")
                      : tr("SUBJECT TO DISCRETIONARY DETERMINATION", "विवेकाधीन निर्धारण के अधीन", "ਵਿਵੇਕੀ ਨਿਰਣੇ ਦੇ ਅਧੀਨ")}
                  </span>
                  <span className="text-xs font-extrabold opacity-80">
                    {tr("Statute: Legal Services Authorities Act, 1987", "अधिनियम: विधिक सेवा प्राधिकरण अधिनियम, 1987", "ਐਕਟ: ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਅਥਾਰਟੀ ਐਕਟ, 1987")}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 leading-snug">
                  {isEligible
                    ? tr("You are entitled to a Free Government Advocate & Court Fee Waiver", "आप सरकारी खर्च पर वकील और अदालती शुल्क माफ़ी के पूर्ण पात्र हैं", "ਤੁਸੀਂ ਮੁਫ਼ਤ ਸਰਕਾਰੀ ਵਕੀਲ ਅਤੇ ਕੋਰਟ ਫੀਸ ਮਾਫ਼ੀ ਦੇ ਪੂਰੇ ਹੱਕਦਾਰ ਹੋ")
                    : tr("Annual Income exceeds standard ceiling; Discretionary legal aid or Lok Adalat available", "आय सीमा अधिक है; लोक अदालत अथवा विशेषाधिकार सहायता उपलब्ध है", "ਆਮਦਨ ਸੀਮਾ ਵੱਧ ਹੈ; ਲੋਕ ਅਦਾਲਤ ਰਾਹੀਂ ਮੁਫ਼ਤ ਹੱਲ ਸੰਭਵ ਹੈ")}
                </h2>

                <p className="text-xs sm:text-sm font-semibold leading-relaxed mt-2 opacity-95">
                  {isAutoExempt
                    ? tr(
                        `Under Section ${selectedCategoryObj?.section}, citizens belonging to the "${selectedCategoryObj?.title}" group are granted statutory exemption from financial ceilings. You qualify unconditionally without an income test.`,
                        `धारा ${selectedCategoryObj?.section} के तहत "${selectedCategoryObj?.title}" वर्ग के नागरिकों को आय प्रमाण पत्र प्रस्तुत करने की कोई आवश्यकता नहीं है। आप बिना किसी आय सीमा के 100% पात्र हैं।`,
                        `ਧਾਰਾ ${selectedCategoryObj?.section} ਤਹਿਤ "${selectedCategoryObj?.title}" ਵਰਗ ਦੇ ਨਾਗਰਿਕ ਬਿਨਾਂ ਆਮਦਨ ਜਾਂਚ ਦੇ ਪੂਰੀ ਤਰ੍ਹਾਂ ਮੁਫ਼ਤ ਸਹਾਇਤਾ ਦੇ ਹੱਕਦਾਰ ਹਨ।`
                      )
                    : isIncomeWithinStateLimit
                    ? tr(
                        `Under Section 12(h), your annual family income is within the official statutory limit of ₹${selectedStateObj.ceiling.toLocaleString("en-IN")} established by the ${selectedStateObj.dlsaName}. You are fully eligible for a panel lawyer.`,
                        `धारा 12(h) के अनुसार आपकी पारिवारिक आय ${selectedStateObj.name} की आधिकारिक सीमा ₹${selectedStateObj.ceiling.toLocaleString("en-IN")} के भीतर है। आप निःशुल्क पैनल वकील के पात्र हैं।`,
                        `ਧਾਰਾ 12(h) ਅਧੀਨ ਤੁਹਾਡੀ ਆਮਦਨ ${selectedStateObj.name} ਦੀ ਸਰਕਾਰੀ ਸੀਮਾ ₹${selectedStateObj.ceiling.toLocaleString("en-IN")} ਦੇ ਅੰਦਰ ਹੈ।`
                      )
                    : isLokAdalat
                    ? tr(
                        "National Lok Adalats provide complete, binding, and 100% free dispute resolution for all citizens regardless of income, with a full refund of any court fees paid.",
                        "राष्ट्रीय लोक अदालतें बिना किसी आय सीमा के सभी नागरिकों के विवादों का निःशुल्क निपटारा करती हैं, तथा जमा की गई कोर्ट फीस पूरी वापस की जाती है।",
                        "ਲੋਕ ਅਦਾਲਤਾਂ ਬਿਨਾਂ ਕਿਸੇ ਆਮਦਨ ਸੀਮਾ ਦੇ ਸਾਰੇ ਨਾਗਰਿਕਾਂ ਨੂੰ ਮੁਫ਼ਤ ਨਿਆਂ ਦਿੰਦੀਆਂ ਹਨ।"
                      )
                    : tr(
                        `Your annual income bracket exceeds the standard Section 12(h) ceiling (₹${selectedStateObj.ceiling.toLocaleString("en-IN")}) for regular civil matters. However, you may still apply to the DLSA Secretary under special hardship/indigency discretion, or utilize Lok Adalat conciliation.`,
                        `आपकी आय नियमित मामलों के लिए निर्धारित सीमा से अधिक है। फिर भी, विशेष परिस्थितियों या कठिनाई के आधार पर ज़िला विधिक सेवा सचिव को आवेदन दिया जा सकता है।`,
                        `ਤੁਹਾਡੀ ਆਮਦਨ ਤੈਅ ਸੀਮਾ ਤੋਂ ਵੱਧ ਹੈ, ਪਰ ਵਿਸ਼ੇਸ਼ ਹਾਲਾਤਾਂ ਵਿੱਚ ਡੀਐਲਐਸਏ ਸਕੱਤਰ ਨੂੰ ਅਰਜ਼ੀ ਦਿੱਤੀ ਜਾ ਸਕਦੀ ਹੈ।`
                      )}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Breakdown Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Box 1: Statutory Entitlements */}
            <div className="card card-accent card-raised p-5 sm:p-6 bg-surface border border-line space-y-3">
              <h3 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                {tr("What Free Legal Aid Covers (100% Free):", "निःशुल्क कानूनी सहायता में क्या-क्या शामिल है:", "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਵਿੱਚ ਕੀ ਸ਼ਾਮਲ ਹੈ:")}
              </h3>
              <ul className="text-xs sm:text-sm text-ink space-y-2 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{tr("Full fees of a qualified Panel Advocate, paid entirely by the State.", "योग्य पैनल वकील की पूरी फीस, जिसका भुगतान सरकार करती है।", "ਸਰਕਾਰ ਦੁਆਰਾ ਅਦਾ ਕੀਤੀ ਵਕੀਲ ਦੀ ਪੂਰੀ ਫੀਸ।")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{tr("Complete waiver from Court Fees, process charges, and stamp paper costs.", "अदालती शुल्क, समन खर्च और स्टांप पेपर से पूर्ण छूट।", "ਕੋਰਟ ਫੀਸ ਅਤੇ ਪ੍ਰਕਿਰਿਆ ਖਰਚਿਆਂ ਤੋਂ ਪੂਰੀ ਛੋਟ।")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{tr("Drafting of FIR complaints, bail pleas, appeals, and court responses.", "प्राथमिकी, जमानत याचिका, अपील और कानूनी उत्तरों का निशुल्क प्रारूपण।", "ਜ਼ਮਾਨਤ ਅਤੇ ਅਪੀਲਾਂ ਦਾ ਮੁਫ਼ਤ ਖਰੜਾ।")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{tr("Certified true copies of judgments, orders, and police charge-sheets.", "निर्णयों, आदेशों और चार्जशीट की प्रमाणित प्रतियाँ निःशुल्क।", "ਹੁਕਮਾਂ ਅਤੇ ਚਾਰਜਸ਼ੀਟਾਂ ਦੀਆਂ ਪ੍ਰਮਾਣਿਤ ਕਾਪੀਆਂ।")}</span>
                </li>
              </ul>
            </div>

            {/* Box 2: Your Case Context */}
            <div className="card card-accent card-raised p-5 sm:p-6 bg-surface border border-line space-y-3">
              <h3 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Scale size={16} className="text-accent" />
                {tr("Your Evaluated Case Parameters:", "आपके मूल्यांकित केस विवरण:", "ਤੁਹਾਡੇ ਕੇਸ ਦੇ ਵੇਰਵੇ:")}
              </h3>
              <div className="space-y-2 text-xs font-medium text-ink">
                <div className="flex justify-between py-1 border-b border-line">
                  <span className="text-muted">{tr("Demographic Group:", "नागरिक श्रेणी:", "ਸ਼੍ਰੇਣੀ:")}</span>
                  <span className="font-bold">{selectedCategoryObj?.title}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line">
                  <span className="text-muted">{tr("Statutory Section:", "कानूनी धारा:", "ਧਾਰਾ:")}</span>
                  <span className="font-bold text-accent">Section {selectedCategoryObj?.section}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line">
                  <span className="text-muted">{tr("State / DLSA:", "राज्य / विधिक प्राधिकरण:", "ਰਾਜ / ਅਥਾਰਟੀ:")}</span>
                  <span className="font-bold">{selectedStateObj.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line">
                  <span className="text-muted">{tr("Income Bracket:", "पारिवारिक आय:", "ਆਮਦਨ:")}</span>
                  <span className="font-bold">{selectedIncomeObj?.label}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted">{tr("Legal Matter:", "कानूनी मामला:", "ਮਾਮਲਾ:")}</span>
                  <span className="font-bold">{selectedDisputeObj?.title}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Station: Toll-Free Call & NALSA Portal */}
          <div className="card card-accent card-raised p-6 sm:p-8 bg-surface border border-line space-y-4">
            <h3 className="text-base font-black text-ink tracking-tight flex items-center gap-2">
              <Phone size={18} className="text-emerald-600" />
              {tr("Immediate Action Station — Claim Free Legal Aid Now", "तुरंत निःशुल्क कानूनी सहायता प्राप्त करें", "ਹੁਣੇ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਪ੍ਰਾਪਤ ਕਰੋ")}
            </h3>
            <p className="text-xs sm:text-sm text-muted font-medium leading-relaxed">
              {tr(
                "You can initiate your free advocate assignment immediately by calling the 24x7 toll-free National Legal Aid Helpline, applying on the official NALSA portal, or generating your formal printable application below.",
                "आप 24x7 टोल-फ्री राष्ट्रीय विधिक सेवा हेल्पलाइन 15100 पर कॉल करके, नालसा पोर्टल पर ऑनलाइन आवेदन करके या नीचे दिए गए प्रारूप को प्रिंट करके तुरंत वकील प्राप्त कर सकते हैं।",
                "ਤੁਸੀਂ 15100 'ਤੇ ਕਾਲ ਕਰਕੇ ਜਾਂ ਨਾਲਸਾ ਪੋਰਟਲ 'ਤੇ ਅਰਜ਼ੀ ਦੇ ਕੇ ਤੁਰੰਤ ਮੁਫ਼ਤ ਵਕੀਲ ਲੈ ਸਕਦੇ ਹੋ।"
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="tel:15100"
                className="btn btn-primary px-5 flex items-center gap-2 text-xs font-black shadow-md"
              >
                <Phone size={15} />
                <span>{tr("Call Helpline: 15100 (Toll-Free 24x7)", "कॉल करें: 15100 (टोल-फ्री 24x7)", "ਕਾਲ ਕਰੋ: 15100 (ਟੋਲ-ਫ੍ਰੀ)")}</span>
              </a>

              <a
                href="https://nalsa.gov.in"
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost border-2 border-line hover:border-accent flex items-center gap-2 text-xs font-bold text-ink hover:bg-surface-2"
              >
                <span>{tr("Official NALSA Portal", "नालसा आधिकारिक पोर्टल", "ਨਾਲਸਾ ਪੋਰਟਲ")}</span>
                <ExternalLink size={14} />
              </a>

              <button
                type="button"
                onClick={() => setShowApplication(!showApplication)}
                className="btn btn-ghost border-2 border-amber-500/80 text-xs font-extrabold text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2"
              >
                <FileText size={15} className="text-amber-600" />
                <span>
                  {showApplication
                    ? tr("Hide Application Draft", "आवेदन प्रारूप छिपाएँ", "ਅਰਜ਼ੀ ਡਰਾਫਟ ਲੁਕਾਓ")
                    : tr("Generate Printable Form 1 Application", "प्रिंट करने योग्य फॉर्म 1 आवेदन तैयार करें", "ਫਾਰਮ 1 ਅਰਜ਼ੀ ਡਰਾਫਟ ਕਰੋ")}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  nav("/assistant", {
                    state: {
                      q: `I qualify under Section ${selectedCategoryObj?.section} of the Legal Services Authorities Act, 1987 in ${selectedStateObj.name} for a ${selectedDisputeObj?.title}. How do I get an assigned panel lawyer immediately?`,
                    },
                  })
                }
                className="btn btn-ghost border border-line text-xs font-bold text-ink hover:bg-surface-2 flex items-center gap-2"
              >
                <Sparkles size={14} className="text-accent" />
                <span>{tr("Consult Nyaya AI Assistant", "न्याय सहायक से पूछें", "ਏਆਈ ਸਹਾਇਕ ਤੋਂ ਪੁੱਛੋ")}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="btn btn-ghost text-xs text-muted hover:text-ink font-bold ml-auto flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>{tr("Retake Quiz", "पुनः जाँच करें", "ਦੁਬਾਰਾ ਜਾਂਚੋ")}</span>
              </button>
            </div>
          </div>

          {/* Formal Printable Application Form 1 Accordion */}
          {showApplication && (
            <div className="card card-accent card-raised p-6 sm:p-8 bg-surface border-2 border-line space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-line">
                <div>
                  <h4 className="text-base font-black text-ink tracking-tight flex items-center gap-2">
                    <FileText size={18} className="text-accent" />
                    {tr("Official NALSA Form 1 Legal Aid Application Draft", "आधिकारिक नालसा फॉर्म 1 कानूनी सहायता आवेदन", "ਅਧਿਕਾਰਤ ਨਾਲਸਾ ਫਾਰਮ 1 ਅਰਜ਼ੀ ਡਰਾਫਟ")}
                  </h4>
                  <p className="text-xs text-muted font-medium mt-0.5">
                    {tr(
                      "Pre-filled with your verified statutory section, State DLSA, and case grounds.",
                      "आपके वैधानिक अनुभाग, ज़िला विधिक प्राधिकरण एवं केस विवरण से स्वतः भरा हुआ।",
                      "ਤੁਹਾਡੇ ਕਾਨੂੰਨੀ ਅਨੁਭਾਗ ਅਤੇ ਡੀਐਲਐਸਏ ਨਾਲ ਆਪਣੇ ਆਪ ਭਰਿਆ ਹੋਇਆ।"
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyDraft}
                    className="btn btn-sm btn-ghost border border-line text-xs font-bold text-ink flex items-center gap-1.5"
                  >
                    {copiedApp ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{copiedApp ? tr("Copied!", "कॉपी हो गया!", "ਕਾਪੀ ਹੋ ਗਿਆ!") : tr("Copy Text", "टेक्स्ट कॉपी करें", "ਟੈਕਸਟ ਕਾਪੀ ਕਰੋ")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintDraft}
                    className="btn btn-sm btn-primary text-xs font-black flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer size={14} />
                    <span>{tr("Print Application", "आवेदन प्रिंट करें", "ਅਰਜ਼ੀ ਪ੍ਰਿੰਟ ਕਰੋ")}</span>
                  </button>
                </div>
              </div>

              {/* Optional Name Customizer */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-ink whitespace-nowrap">
                  {tr("Applicant Name (Optional):", "आवेदक का नाम (वैकल्पिक):", "ਬਿਨੈਕਾਰ ਦਾ ਨਾਮ:")}
                </label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder={tr("e.g. Smt. Sunita Devi", "उदा. श्रीमती सुनीता देवी", "ਉਦਾਹਰਨ ਸੁਨੀਤਾ ਦੇਵੀ")}
                  className="input input-sm flex-1 text-xs bg-surface border-line"
                />
              </div>

              {/* Printable Monospace Application Body */}
              <div className="p-6 rounded-xl bg-surface-2 border-2 border-line font-mono text-xs sm:text-sm text-ink whitespace-pre-wrap leading-relaxed shadow-inner selection:bg-amber-500/20">
                {getFormalDraft()}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
