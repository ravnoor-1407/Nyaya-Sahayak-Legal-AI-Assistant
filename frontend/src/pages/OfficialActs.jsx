import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ExternalLink,
  Sparkles,
  Library,
  ShieldCheck,
  FileCheck2,
  Layers,
  BadgeCheck,
  Scale,
  HeartHandshake,
  Car,
  Landmark,
  Building2,
  FileText,
  ShieldAlert,
  Search,
  RotateCcw,
} from "lucide-react";
import { useLang } from "../LangContext";
import { getJSON } from "../api";
import { list, pick } from "../lib/normalize";
import Reveal from "../components/Reveal";

const INDIA_CODE = "https://www.indiacode.nic.in";

// 10 Official Categories with Trilingual Support
const CATEGORIES = [
  {
    id: "all",
    name: ["All Categories", "सभी श्रेणियाँ", "ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ"],
    icon: Library,
    tone: "var(--c-gold)",
  },
  {
    id: "criminal",
    name: ["Criminal Law & Evidence", "आपराधिक कानून एवं साक्ष्य", "ਫੌਜਦਾਰੀ ਕਾਨੂੰਨ ਅਤੇ ਸਬੂਤ"],
    desc: [
      "Substantive crimes, criminal procedures, bail, FIR, arrest, and electronic evidence under the new 2023 Sanhitas.",
      "नए 2023 कानूनों के तहत अपराध, प्रक्रिया, जमानत, गिरफ्तारी और साक्ष्य नियम।",
      "ਨਵੇਂ 2023 ਕਾਨੂੰਨਾਂ ਤਹਿਤ ਜੁਰਮ, ਅਪਰਾਧਿਕ ਪ੍ਰਕਿਰਿਆ, ਜ਼ਮਾਨਤ ਅਤੇ ਸਬੂਤ।",
    ],
    icon: Scale,
    tone: "var(--c-rose)",
  },
  {
    id: "family",
    name: ["Marriage & Family Rights", "विवाह एवं पारिवारिक अधिकार", "ਵਿਆਹ ਅਤੇ ਪਰਿਵਾਰਕ ਅਧਿਕਾਰ"],
    desc: [
      "Marriage validity, divorce grounds, restitution of conjugal rights, domestic violence protection orders, and maintenance.",
      "विवाह की वैधता, तलाक, घरेलू हिंसा से सुरक्षा, निवास अधिकार और भरण-पोषण।",
      "ਵਿਆਹ ਦੀਆਂ ਸ਼ਰਤਾਂ, ਤਲਾਕ, ਘਰੇਲੂ ਹਿੰਸਾ ਸੁਰੱਖਿਆ ਅਤੇ ਖਰਚਾ।",
    ],
    icon: HeartHandshake,
    tone: "var(--c-purple)",
  },
  {
    id: "motor_vehicle",
    name: ["Traffic & Motor Vehicles", "यातायात एवं मोटर वाहन", "ਟ੍ਰੈਫਿਕ ਅਤੇ ਮੋਟਰ ਵਾਹਨ"],
    desc: [
      "Traffic rules, police challans, vehicle impounding, accident claims, driving licensing, and 2019 amended penalties.",
      "यातायात नियम, पुलिस चालान, दुर्घटना मुआवज़ा और वाहन कानून।",
      "ਟ੍ਰੈਫਿਕ ਨਿਯਮ, ਪੁਲਿਸ ਚਲਾਨ, ਦੁਰਘਟਨਾ ਮੁਆਵਜ਼ਾ ਅਤੇ ਲਾਇਸੈਂਸ।",
    ],
    icon: Car,
    tone: "var(--c-green)",
  },
  {
    id: "commercial",
    name: ["Commercial & Cheque Bounce", "व्यापार, चेक बाउंस एवं अनुबंध", "ਵਪਾਰ, ਚੈੱਕ ਬਾਊਂਸ ਅਤੇ ਇਕਰਾਰਨਾਮਾ"],
    desc: [
      "Section 138 cheque dishonour proceedings, 15-day demand notices, contract validity, breach of agreement, and commercial debts.",
      "चेक बाउंस (धारा 138), 15-दिवसीय कानूनी नोटिस और व्यावसायिक अनुबंध।",
      "ਚੈੱਕ ਬਾਊਂਸ (ਧਾਰਾ 138), 15-ਦਿਨਾ ਕਾਨੂੰਨੀ ਨੋਟਿਸ ਅਤੇ ਇਕਰਾਰਨਾਮਾ ਉਲੰਘਣਾ।",
    ],
    icon: Landmark,
    tone: "var(--c-gold)",
  },
  {
    id: "civil_property",
    name: ["Civil Court & Property", "दीवानी अदालत एवं संपत्ति", "ਦੀਵਾਨੀ ਅਦਾਲਤ ਅਤੇ ਜਾਇਦਾਦ"],
    desc: [
      "Civil court summons, temporary injunctions, stay orders, execution of decrees, property sale, lease, mortgage, and gift deeds.",
      "दीवानी अदालती समन, अंतरिम रोक (Stay Order), संपत्ति बिक्री और लीज।",
      "ਦੀਵਾਨੀ ਅਦਾਲਤੀ ਕਾਰਵਾਈ, ਸਟੇਅ ਆਰਡਰ, ਸੰਪਤੀ ਵਿਕਰੀ ਅਤੇ ਲੀਜ਼।",
    ],
    icon: Building2,
    tone: "var(--c-blue)",
  },
  {
    id: "constitutional_aid",
    name: ["Constitutional Rights & Legal Aid", "संवैधानिक अधिकार एवं विधिक सहायता", "ਸੰਵਿਧਾਨਕ ਅਧਿਕਾਰ ਅਤੇ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ"],
    desc: [
      "Fundamental rights, constitutional writ remedies (Habeas Corpus), Section 12 NALSA free legal aid, and Lok Adalat settlement.",
      "मौलिक अधिकार, रिट याचिकाएँ, सरकारी खर्च पर मुफ्त वकील और लोक अदालत।",
      "ਮੌਲਿਕ ਅਧਿਕਾਰ, ਰਿੱਟ ਪਟੀਸ਼ਨਾਂ, ਮੁਫ਼ਤ ਸਰਕਾਰੀ ਵਕੀਲ ਅਤੇ ਲੋਕ ਅਦਾਲਤ।",
    ],
    icon: ShieldCheck,
    tone: "var(--c-gold)",
  },
  {
    id: "consumer_rti",
    name: ["Consumer & Transparency (RTI)", "उपभोक्ता अधिकार एवं सूचना का अधिकार", "ਖਪਤਕਾਰ ਅਧਿਕਾਰ ਅਤੇ ਆਰਟੀਆਈ"],
    desc: [
      "Consumer Commission complaints, deficiency in service, e-commerce refunds, 30-day RTI application window, and fee waivers.",
      "उपभोक्ता शिकायतें, सेवा में कमी, 30-दिवसीय आरटीआई और सूचना का अधिकार।",
      "ਖਪਤਕਾਰ ਸ਼ਿਕਾਇਤਾਂ, ਈ-ਕਾਮਰਸ ਰਿਫੰਡ ਅਤੇ 30-ਦਿਨਾ ਆਰਟੀਆਈ ਜਵਾਬ।",
    ],
    icon: FileText,
    tone: "var(--c-blue)",
  },
  {
    id: "tech_safety",
    name: ["Cyber, Tech & Special Safety", "साइबर अपराध, कार्यस्थल व बाल सुरक्षा", "ਸਾਈਬਰ ਅਪਰਾਧ ਅਤੇ ਸੁਰੱਖਿਆ"],
    desc: [
      "Cybercrime, identity theft, 24-hour social media deepfake takedowns, POSH workplace harassment, and POCSO child protection.",
      "साइबर अपराध, पॉश (कार्यस्थल पर यौन उत्पीड़न) और पॉक्सो बाल संरक्षण।",
      "ਸਾਈਬਰ ਅਪਰਾਧ, ਪੋਸ਼ ਕਾਰਜ ਸਥਾਨ ਸੁਰੱਖਿਆ ਅਤੇ ਪੋਕਸੋ ਬਾਲ ਸੁਰੱਖਿਆ।",
    ],
    icon: ShieldAlert,
    tone: "var(--c-rose)",
  },
  {
    id: "precedents",
    name: ["Supreme Court Precedents", "सुप्रीम कोर्ट ऐतिहासिक निर्णय", "ਸੁਪਰੀਮ ਕੋਰਟ ਇਤਿਹਾਸਕ ਫੈਸਲੇ"],
    desc: [
      "Binding judicial rulings under Article 141 on arrest notice (Arnesh Kumar), mandatory FIR (Lalita Kumari), and bail rules.",
      "गिरफ्तारी, अनिवार्य एफआईआर और जमानत पर सर्वोच्च न्यायालय के मार्गदर्शक सिद्धांत।",
      "ਗ੍ਰਿਫ਼ਤਾਰੀ, ਐਫਆਈਆਰ ਅਤੇ ਜ਼ਮਾਨਤ 'ਤੇ ਸੁਪਰੀਮ ਕੋਰਟ ਦੇ ਇਤਿਹਾਸਕ ਹੁਕਮ।",
    ],
    icon: Sparkles,
    tone: "var(--c-purple)",
  },
];

const ACTS = [
  {
    key: "constitution", category: "constitutional_aid", tone: "var(--c-gold)", tag: "constitution_of_india",
    name: ["The Constitution of India", "भारत का संविधान", "ਭਾਰਤ ਦਾ ਸੰਵਿਧਾਨ"],
    about: ["The supreme law of India. It sets out the structure of government, fundamental rights, directive principles and duties of citizens.", "भारत का सर्वोच्च कानून। इसमें सरकार की संरचना, मौलिक अधिकार, नीति-निदेशक तत्व और नागरिकों के कर्तव्य हैं।", "ਭਾਰਤ ਦਾ ਸਰਵਉੱਚ ਕਾਨੂੰਨ। ਇਸ ਵਿੱਚ ਸਰਕਾਰ ਦਾ ਢਾਂਚਾ, ਮੌਲਿਕ ਅਧਿਕਾਰ, ਨਿਰਦੇਸ਼ਕ ਸਿਧਾਂਤ ਅਤੇ ਨਾਗਰਿਕਾਂ ਦੇ ਫ਼ਰਜ਼ ਹਨ।"],
    authority: ["Ministry of Law and Justice (Legislative Department)", "विधि और न्याय मंत्रालय (विधायी विभाग)", "ਕਾਨੂੰਨ ਅਤੇ ਨਿਆਂ ਮੰਤਰਾਲਾ (ਵਿਧਾਨਕ ਵਿਭਾਗ)"],
    enacted: ["26 November 1949", "26 नवंबर 1949", "26 ਨਵੰਬਰ 1949"],
    effective: ["26 January 1950", "26 जनवरी 1950", "26 ਜਨਵਰੀ 1950"],
    version: ["As amended", "संशोधनों सहित", "ਸੋਧਾਂ ਸਮੇਤ"],
    href: "https://legislative.gov.in/constitution-of-india/",
    q: ["What are my fundamental rights?", "मेरे मौलिक अधिकार क्या हैं?", "ਮੇਰੇ ਮੌਲਿਕ ਅਧਿਕਾਰ ਕੀ ਹਨ?"],
  },
  {
    key: "nyaya", category: "criminal", tone: "var(--c-rose)", tag: "bharatiya_nyaya_sanhita",
    name: ["Bharatiya Nyaya Sanhita, 2023 (BNS)", "भारतीय न्याय संहिता, 2023 (बीएनएस)", "ਭਾਰਤੀ ਨਿਆਂ ਸੰਹਿਤਾ, 2023 (ਬੀਐਨਐਸ)"],
    about: ["The substantive criminal code that replaced the Indian Penal Code.", "मूल आपराधिक संहिता जिसने भारतीय दंड संहिता की जगह ली।", "ਮੂਲ ਅਪਰਾਧਿਕ ਸੰਹਿਤਾ ਜਿਸ ਨੇ ਭਾਰਤੀ ਦੰਡ ਸੰਹਿਤਾ ਦੀ ਥਾਂ ਲਈ।"],
    authority: ["Ministry of Home Affairs (Act No. 45 of 2023)", "गृह मंत्रालय (अधिनियम संख्या 45, 2023)", "ਗ੍ਰਹਿ ਮੰਤਰਾਲਾ (ਐਕਟ ਨੰਬਰ 45, 2023)"],
    enacted: ["25 December 2023 (assent)", "25 दिसंबर 2023 (स्वीकृति)", "25 ਦਸੰਬਰ 2023 (ਮਨਜ਼ੂਰੀ)"],
    effective: ["1 July 2024", "1 जुलाई 2024", "1 ਜੁਲਾਈ 2024"],
    version: ["In force", "लागू", "ਲਾਗੂ"],
    href: "https://www.mha.gov.in",
    q: ["What is the punishment for theft under BNS?", "बीएनएस में चोरी की सज़ा क्या है?", "ਬੀਐਨਐਸ ਵਿੱਚ ਚੋਰੀ ਦੀ ਸਜ਼ਾ ਕੀ ਹੈ?"],
  },
  {
    key: "nagarik", category: "criminal", tone: "var(--c-blue)", tag: "bharatiya_nagarik_suraksha_sanhita",
    name: ["Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)", "भारतीय नागरिक सुरक्षा संहिता, 2023 (बीएनएसएस)", "ਭਾਰਤੀ ਨਾਗਰਿਕ ਸੁਰੱਖਿਆ ਸੰਹਿਤਾ, 2023 (ਬੀਐਨਐਸਐਸ)"],
    about: ["Criminal procedure: arrest, FIR, bail, investigation and trial. It replaced the CrPC.", "आपराधिक प्रक्रिया: गिरफ्तारी, एफआईआर, जमानत, जाँच और मुकदमा। इसने सीआरपीसी की जगह ली।", "ਅਪਰਾਧਿਕ ਪ੍ਰਕਿਰਿਆ: ਗ੍ਰਿਫ਼ਤਾਰੀ, ਐਫ਼ਆਈਆਰ, ਜ਼ਮਾਨਤ, ਜਾਂਚ ਅਤੇ ਮੁਕੱਦਮਾ। ਇਸ ਨੇ ਸੀਆਰਪੀਸੀ ਦੀ ਥਾਂ ਲਈ।"],
    authority: ["Ministry of Home Affairs (Act No. 46 of 2023)", "गृह मंत्रालय (अधिनियम संख्या 46, 2023)", "ਗ੍ਰਹਿ ਮੰਤਰਾਲਾ (ਐਕਟ ਨੰਬਰ 46, 2023)"],
    enacted: ["25 December 2023 (assent)", "25 दिसंबर 2023 (स्वीकृति)", "25 ਦਸੰਬਰ 2023 (ਮਨਜ਼ੂਰੀ)"],
    effective: ["1 July 2024", "1 जुलाई 2024", "1 ਜੁਲਾਈ 2024"],
    version: ["In force", "लागू", "ਲਾਗੂ"],
    href: "https://www.mha.gov.in",
    q: ["How does bail work under BNSS?", "बीएनएसएस में जमानत कैसे मिलती है?", "ਬੀਐਨਐਸਐਸ ਵਿੱਚ ਜ਼ਮਾਨਤ ਕਿਵੇਂ ਮਿਲਦੀ ਹੈ?"],
  },
  {
    key: "sakshya", category: "criminal", tone: "var(--c-purple)", tag: "bharatiya_sakshya_adhiniyam",
    name: ["Bharatiya Sakshya Adhiniyam, 2023 (BSA)", "भारतीय साक्ष्य अधिनियम, 2023 (बीएसए)", "ਭਾਰਤੀ ਸਾਕਸ਼ੀ ਅਧਿਨਿਯਮ, 2023 (ਬੀਐਸਏ)"],
    about: ["The law of evidence in courts. It replaced the Indian Evidence Act, 1872.", "अदालतों में साक्ष्य का कानून। इसने भारतीय साक्ष्य अधिनियम, 1872 की जगह ली।", "ਅਦਾਲਤਾਂ ਵਿੱਚ ਸਬੂਤ ਦਾ ਕਾਨੂੰਨ। ਇਸ ਨੇ ਭਾਰਤੀ ਸਬੂਤ ਐਕਟ, 1872 ਦੀ ਥਾਂ ਲਈ।"],
    authority: ["Ministry of Home Affairs (Act No. 47 of 2023)", "गृह मंत्रालय (अधिनियम संख्या 47, 2023)", "ਗ੍ਰਹਿ ਮੰਤਰਾਲਾ (ਐਕਟ ਨੰਬਰ 47, 2023)"],
    enacted: ["25 December 2023 (assent)", "25 दिसंबर 2023 (स्वीकृति)", "25 ਦਸੰਬਰ 2023 (ਮਨਜ਼ੂਰੀ)"],
    effective: ["1 July 2024", "1 जुलाई 2024", "1 ਜੁਲਾਈ 2024"],
    version: ["In force", "लागू", "ਲਾਗੂ"],
    href: "https://www.mha.gov.in",
    q: ["Are electronic records valid evidence?", "क्या इलेक्ट्रॉनिक रिकॉर्ड वैध साक्ष्य हैं?", "ਕੀ ਇਲੈਕਟ੍ਰਾਨਿਕ ਰਿਕਾਰਡ ਜਾਇਜ਼ ਸਬੂਤ ਹਨ?"],
  },
  {
    key: "information technology", category: "tech_safety", tone: "var(--c-green)", tag: "information_technology_act",
    name: ["Information Technology Act, 2000", "सूचना प्रौद्योगिकी अधिनियम, 2000", "ਸੂਚਨਾ ਤਕਨਾਲੋਜੀ ਐਕਟ, 2000"],
    about: ["Cyber crime, electronic records, identity theft, and intermediary guidelines.", "साइबर अपराध, इलेक्ट्रॉनिक रिकॉर्ड और डिजिटल हस्ताक्षर।", "ਸਾਈਬਰ ਅਪਰਾਧ, ਇਲੈਕਟ੍ਰਾਨਿਕ ਰਿਕਾਰਡ ਅਤੇ ਡਿਜੀਟਲ ਦਸਤਖ਼ਤ।"],
    authority: ["Ministry of Electronics and IT (Act No. 21 of 2000)", "इलेक्ट्रॉनिकी और सूचना प्रौद्योगिकी मंत्रालय (अधिनियम 21, 2000)", "ਇਲੈਕਟ੍ਰੋਨਿਕਸ ਅਤੇ ਆਈਟੀ ਮੰਤਰਾਲਾ (ਐਕਟ 21, 2000)"],
    enacted: ["9 June 2000 (assent)", "9 जून 2000 (स्वीकृति)", "9 ਜੂਨ 2000 (ਮਨਜ਼ੂਰੀ)"],
    effective: ["17 October 2000", "17 अक्टूबर 2000", "17 ਅਕਤੂਬਰ 2000"],
    version: ["As amended", "संशोधनों सहित", "ਸੋਧਾਂ ਸਮੇਤ"],
    href: "https://www.meity.gov.in",
    q: ["What does the IT Act say about identity theft?", "आईटी एक्ट पहचान की चोरी के बारे में क्या कहता है?", "ਆਈਟੀ ਐਕਟ ਪਛਾਣ ਦੀ ਚੋਰੀ ਬਾਰੇ ਕੀ ਕਹਿੰਦਾ ਹੈ?"],
  },
  {
    key: "consumer", category: "consumer_rti", tone: "var(--c-gold)", tag: "consumer_protection_act",
    name: ["Consumer Protection Act, 2019", "उपभोक्ता संरक्षण अधिनियम, 2019", "ਖਪਤਕਾਰ ਸੁਰੱਖਿਆ ਐਕਟ, 2019"],
    about: ["Consumer rights, complaints and the Consumer Commissions.", "उपभोक्ता अधिकार, शिकायतें और उपभोक्ता आयोग।", "ਖਪਤਕਾਰ ਅਧਿਕਾਰ, ਸ਼ਿਕਾਇਤਾਂ ਅਤੇ ਖਪਤਕਾਰ ਕਮਿਸ਼ਨ।"],
    authority: ["Department of Consumer Affairs (Act No. 35 of 2019)", "उपभोक्ता मामले विभाग (अधिनियम 35, 2019)", "ਖਪਤਕਾਰ ਮਾਮਲੇ ਵਿਭਾਗ (ਐਕਟ 35, 2019)"],
    enacted: ["9 August 2019 (assent)", "9 अगस्त 2019 (स्वीकृति)", "9 ਅਗਸਤ 2019 (ਮਨਜ਼ੂਰੀ)"],
    effective: ["20 July 2020 (main provisions)", "20 जुलाई 2020 (मुख्य प्रावधान)", "20 ਜੁਲਾਈ 2020 (ਮੁੱਖ ਉਪਬੰਧ)"],
    version: ["In force", "लागू", "ਲਾਗੂ"],
    href: "https://consumeraffairs.nic.in",
    q: ["What are my rights as a consumer?", "उपभोक्ता के रूप में मेरे क्या अधिकार हैं?", "ਖਪਤਕਾਰ ਵਜੋਂ ਮੇਰੇ ਕੀ ਅਧਿਕਾਰ ਹਨ?"],
  },
  {
    key: "right to information", category: "consumer_rti", tone: "var(--c-blue)", tag: "right_to_information_act",
    name: ["Right to Information Act, 2005", "सूचना का अधिकार अधिनियम, 2005", "ਸੂਚਨਾ ਦਾ ਅਧਿਕਾਰ ਐਕਟ, 2005"],
    about: ["Your right to ask public authorities for information, with a 30-day reply window.", "सरकारी निकायों से जानकारी माँगने का आपका अधिकार, 30 दिन की उत्तर-सीमा के साथ।", "ਸਰਕਾਰੀ ਸੰਸਥਾਵਾਂ ਤੋਂ ਜਾਣਕਾਰੀ ਮੰਗਣ ਦਾ ਤੁਹਾਡਾ ਅਧਿਕਾਰ, 30 ਦਿਨ ਦੀ ਜਵਾਬ-ਸੀਮਾ ਨਾਲ।"],
    authority: ["Department of Personnel and Training (Act No. 22 of 2005)", "कार्मिक और प्रशिक्षण विभाग (अधिनियम 22, 2005)", "ਕਰਮਚਾਰੀ ਅਤੇ ਸਿਖਲਾਈ ਵਿਭਾਗ (ਐਕਟ 22, 2005)"],
    enacted: ["15 June 2005 (assent)", "15 जून 2005 (स्वीकृति)", "15 ਜੂਨ 2005 (ਮਨਜ਼ੂਰੀ)"],
    effective: ["12 October 2005", "12 अक्टूबर 2005", "12 ਅਕਤੂਬਰ 2005"],
    version: ["As amended", "संशोधनों सहित", "ਸੋਧਾਂ ਸਮੇਤ"],
    href: "https://rti.gov.in",
    q: ["How do I use the RTI Act?", "आरटीआई एक्ट का उपयोग कैसे करूँ?", "ਆਰਟੀਆਈ ਐਕਟ ਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕਰਾਂ?"],
  },
  {
    key: "negotiable instruments", category: "commercial", tone: "var(--c-rose)", tag: "negotiable_instruments_act",
    name: ["Negotiable Instruments Act, 1881", "परक्राम्य लिखत अधिनियम, 1881", "ਗੱਲਬਾਤ ਯੋਗ ਲਿਖਤ ਐਕਟ, 1881"],
    about: ["Cheque bounce, 15-day statutory notices, and criminal dishonour proceedings under Section 138.", "चेक बाउंस, 15-दिवसीय कानूनी नोटिस और धारा 138 के तहत कार्रवाई।", "ਚੈੱਕ ਬਾਊਂਸ, 15-ਦਿਨਾ ਕਾਨੂੰਨੀ ਨੋਟਿਸ ਅਤੇ ਧਾਰਾ 138 ਤਹਿਤ ਕਾਰਵਾਈ।"],
    authority: ["Ministry of Finance (Act No. 26 of 1881)", "वित्त मंत्रालय (अधिनियम 26, 1881)", "ਵਿੱਤ ਮੰਤਰਾਲਾ (ਐਕਟ 26, 1881)"],
    enacted: ["9 December 1881", "9 दिसंबर 1881", "9 ਦਸੰਬਰ 1881"],
    effective: ["1 March 1882", "1 मार्च 1882", "1 ਮਾਰਚ 1882"],
    version: ["As amended (2018)", "संशोधनों सहित", "ਸੋਧਾਂ ਸਮੇਤ"],
    href: "https://www.indiacode.nic.in/handle/123456789/2262?locale=en",
    q: ["What should I do if a cheque bounces under Section 138?", "धारा 138 में चेक बाउंस होने पर क्या प्रक्रिया है?", "ਧਾਰਾ 138 ਤਹਿਤ ਚੈੱਕ ਬਾਊਂਸ ਹੋਣ 'ਤੇ ਕੀ ਕਰੀਏ?"],
  },
  {
    key: "domestic violence", category: "family", tone: "var(--c-purple)", tag: "domestic_violence_act",
    name: ["Protection of Women from Domestic Violence Act, 2005", "घरेलू हिंसा से महिलाओं का संरक्षण अधिनियम, 2005", "ਘਰੇਲੂ ਹਿੰਸਾ ਐਕਟ, 2005"],
    about: ["Protection orders, residence rights, maintenance, and Domestic Incident Reports (DIR).", "सुरक्षा आदेश, निवास अधिकार, भरण-पोषण और घरेलू घटना रिपोर्ट।", "ਸੁਰੱਖਿਆ ਹੁਕਮ, ਰਿਹਾਇਸ਼ੀ ਅਧਿਕਾਰ ਅਤੇ ਗੁਜ਼ਾਰਾ ਭੱਤਾ।"],
    authority: ["Ministry of Women and Child Development (Act No. 43 of 2005)", "महिला एवं बाल विकास मंत्रालय", "ਮਹਿਲਾ ਅਤੇ ਬਾਲ ਵਿਕਾਸ ਮੰਤਰਾਲਾ"],
    enacted: ["13 September 2005", "13 सितंबर 2005", "13 ਸਤੰਬਰ 2005"],
    effective: ["26 October 2006", "26 अक्टूबर 2006", "26 ਅਕਤੂਬਰ 2006"],
    version: ["In force", "लागू", "ਲਾਗੂ"],
    href: "https://www.indiacode.nic.in/handle/123456789/2021?locale=en",
    q: ["How can a woman obtain a protection order under the DV Act?", "घरेलू हिंसा में सुरक्षा आदेश कैसे प्राप्त करें?", "ਘਰੇਲੂ ਹਿੰਸਾ ਤਹਿਤ ਸੁਰੱਖਿਆ ਹੁਕਮ ਕਿਵੇਂ ਮਿਲਦਾ ਹੈ?"],
  },
  {
    key: "contract", category: "commercial", tone: "var(--c-gold)", tag: "indian_contract_act",
    name: ["Indian Contract Act, 1872", "भारतीय अनुबंध अधिनियम, 1872", "ਭਾਰਤੀ ਇਕਰਾਰਨਾਮਾ ਐਕਟ, 1872"],
    about: ["Legality of agreements, breach of contract, damages, indemnity, and guarantee.", "समझौतों की वैधता, अनुबंध का उल्लंघन, हर्जाना और गारंटी।", "ਸਮਝੌਤਿਆਂ ਦੀ ਵੈਧਤਾ, ਇਕਰਾਰਨਾਮੇ ਦੀ ਉਲੰਘਣਾ ਅਤੇ ਹਰਜਾਨਾ।"],
    authority: ["Ministry of Law and Justice (Act No. 9 of 1872)", "विधि और न्याय मंत्रालय", "ਕਾਨੂੰਨ ਅਤੇ ਨਿਆਂ ਮੰਤਰਾਲਾ"],
    enacted: ["25 April 1872", "25 अप्रैल 1872", "25 ਅਪ੍ਰੈਲ 1872"],
    effective: ["1 September 1872", "1 सितंबर 1872", "1 ਸਤੰਬਰ 1872"],
    version: ["As amended", "संशोधनों सहित", "ਸੋਧਾਂ ਸਮੇਤ"],
    href: "https://www.indiacode.nic.in/handle/123456789/2187?locale=en",
    q: ["What constitutes a valid legal contract?", "वैध कानूनी अनुबंध के क्या नियम हैं?", "ਜਾਇਜ਼ ਕਾਨੂੰਨੀ ਇਕਰਾਰਨਾਮੇ ਦੇ ਕੀ ਨਿਯਮ ਹਨ?"],
  },
  {
    key: "civil procedure", category: "civil_property", tone: "var(--c-blue)", tag: "code_of_civil_procedure",
    name: ["Code of Civil Procedure, 1908 (CPC)", "सिविल प्रक्रिया संहिता, 1908", "ਦੀਵਾਨੀ ਪ੍ਰਕਿਰਿਆ ਸੰਹਿਤਾ, 1908"],
    about: ["Procedure in Civil Courts, summons, temporary injunctions, stay orders, and execution of decrees.", "दीवानी अदालतों की प्रक्रिया, समन, अंतरिम निषेधाज्ञा और डिक्री।", "ਦੀਵਾਨੀ ਅਦਾਲਤਾਂ ਦੀ ਕਾਰਵਾਈ, ਸੰਮਨ ਅਤੇ ਸਟੇਅ ਆਰਡਰ।"],
    authority: ["Ministry of Law and Justice (Act No. 5 of 1908)", "विधि और न्याय मंत्रालय", "ਕਾਨੂੰਨ ਅਤੇ ਨਿਆਂ ਮੰਤਰਾਲਾ"],
    enacted: ["21 March 1908", "21 मार्च 1908", "21 ਮਾਰਚ 1908"],
    effective: ["1 January 1909", "1 जनवरी 1909", "1 ਜਨਵਰੀ 1909"],
    version: ["As amended", "संशोधनों सहित", "ਸੋਧਾਂ ਸਮੇਤ"],
    href: "https://www.indiacode.nic.in/handle/123456789/2191?locale=en",
    q: ["How can I get an interim injunction or stay order under CPC?", "सीपीसी में अंतरिम रोक (Stay Order) कैसे मिलता है?", "ਸੀਪੀਸੀ ਤਹਿਤ ਸਟੇਅ ਆਰਡਰ ਕਿਵੇਂ ਮਿਲਦਾ ਹੈ?"],
  },
  {
    key: "motor vehicle", category: "motor_vehicle", tone: "var(--c-green)", tag: "motor_vehicles_act",
    name: ["Motor Vehicles Act, 1988", "मोटर वाहन अधिनियम, 1988", "ਮੋਟਰ ਵਾਹਨ ਐਕਟ, 1988"],
    about: ["Traffic rules, challans, third-party insurance, hit-and-run compensation, and driving licensing.", "यातायात नियम, चालान, बीमा, दुर्घटना मुआवज़ा और ड्राइविंग लाइसेंस।", "ਟ੍ਰੈਫਿਕ ਨਿਯਮ, ਚਲਾਨ, ਬੀਮਾ ਅਤੇ ਦੁਰਘਟਨਾ ਮੁਆਵਜ਼ਾ।"],
    authority: ["Ministry of Road Transport and Highways (Act No. 59 of 1988)", "सड़क परिवहन एवं राजमार्ग मंत्रालय", "ਸੜਕ ਆਵਾਜਾਈ ਅਤੇ ਰਾਜਮਾਰਗ ਮੰਤਰਾਲਾ"],
    enacted: ["14 October 1988", "14 अक्टूबर 1988", "14 ਅਕਤੂਬਰ 1988"],
    effective: ["1 July 1989 (Amended 2019)", "1 जुलाई 1989", "1 ਜੁਲਾਈ 1989"],
    version: ["As amended (2019)", "संशोधनों सहित", "ਸੋਧਾਂ ਸਮੇਤ"],
    href: "https://www.indiacode.nic.in/handle/123456789/1998?locale=en",
    q: ["What are my rights if issued a traffic police challan?", "ट्रैफिक पुलिस चालान जारी होने पर मेरे क्या अधिकार हैं?", "ਟ੍ਰੈਫਿਕ ਚਲਾਨ ਹੋਣ 'ਤੇ ਮੇਰੇ ਕੀ ਅਧਿਕਾਰ ਹਨ?"],
  },
  {
    key: "legal aid", category: "constitutional_aid", tone: "var(--c-rose)", tag: "legal_services_authorities_act",
    name: ["Legal Services Authorities Act, 1987", "विधिक सेवा प्राधिकरण अधिनियम, 1987", "ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਅਥਾਰਟੀ ਐਕਟ, 1987"],
    about: ["Free legal aid under Section 12, government-paid panel lawyers, and Lok Adalat conciliation.", "धारा 12 में मुफ्त वकील, अदालती शुल्क माफी और लोक अदालत।", "ਧਾਰਾ 12 ਤਹਿਤ ਮੁਫ਼ਤ ਵਕੀਲ ਅਤੇ ਲੋਕ ਅਦਾਲਤ ਸਮਝੌਤਾ।"],
    authority: ["National Legal Services Authority (NALSA) (Act No. 39 of 1987)", "राष्ट्रीय विधिक सेवा प्राधिकरण (नालसा)", "ਰਾਸ਼ਟਰੀ ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਅਥਾਰਟੀ (ਨਾਲਸਾ)"],
    enacted: ["11 October 1987", "11 अक्टूबर 1987", "11 ਅਕਤੂਬਰ 1987"],
    effective: ["9 November 1995", "9 नवंबर 1995", "9 ਨਵੰਬਰ 1995"],
    version: ["In force", "लागू", "ਲਾਗੂ"],
    href: "https://nalsa.gov.in",
    q: ["Who is eligible for free government legal aid under Section 12?", "धारा 12 के तहत मुफ्त वकील का पात्र कौन है?", "ਧਾਰਾ 12 ਅਧੀਨ ਮੁਫ਼ਤ ਵਕੀਲ ਦਾ ਕੌਣ ਹੱਕਦਾਰ ਹੈ?"],
  },
  {
    key: "workplace harassment", category: "tech_safety", tone: "var(--c-purple)", tag: "posh_act",
    name: ["POSH Act, 2013", "कार्यस्थल पर महिलाओं का यौन उत्पीड़न अधिनियम, 2013", "ਕਾਰਜ ਸਥਾਨ 'ਤੇ ਔਰਤਾਂ ਦਾ ਜਿਨਸੀ ਸ਼ੋਸ਼ਣ ਐਕਟ, 2013"],
    about: ["Protection from sexual harassment at workplace, mandatory Internal Complaints Committee (ICC).", "कार्यस्थल पर सुरक्षा और आंतरिक शिकायत समिति (ICC)।", "ਕਾਰਜ ਸਥਾਨ 'ਤੇ ਸੁਰੱਖਿਆ ਅਤੇ ਆਈਸੀਸੀ ਕਮੇਟੀ।"],
    authority: ["Ministry of Women and Child Development (Act No. 14 of 2013)", "महिला एवं बाल विकास मंत्रालय", "ਮਹਿਲਾ ਅਤੇ ਬਾਲ ਵਿਕਾਸ ਮੰਤਰਾਲਾ"],
    enacted: ["22 April 2013", "22 अप्रैल 2013", "22 ਅਪ੍ਰੈਲ 2013"],
    effective: ["9 December 2013", "9 दिसंबर 2013", "9 ਦਸੰਬਰ 2013"],
    version: ["In force", "लागू", "ਲਾਗੂ"],
    href: "https://www.indiacode.nic.in/handle/123456789/2104?locale=en",
    q: ["What is the procedure for filing a complaint with ICC under POSH Act?", "पॉश एक्ट में आंतरिक शिकायत समिति (ICC) को शिकायत कैसे करें?", "ਪੋਸ਼ ਐਕਟ ਤਹਿਤ ਆਈਸੀਸੀ ਨੂੰ ਸ਼ਿਕਾਇਤ ਕਿਵੇਂ ਦਰਜ ਕਰੀਏ?"],
  },
  {
    key: "pocso", category: "tech_safety", tone: "var(--c-rose)", tag: "pocso_act",
    name: ["POCSO Act, 2012", "लैंगिक अपराधों से बालकों का संरक्षण अधिनियम, 2012", "ਪੋਕਸੋ ਐਕਟ, 2012"],
    about: ["Protection of children from sexual assault, harassment and pornography, child-friendly courts.", "बच्चों के यौन शोषण से सुरक्षा और बाल-मित्र अदालतें।", "ਬੱਚਿਆਂ ਦੀ ਜਿਨਸੀ ਸ਼ੋਸ਼ਣ ਤੋਂ ਸੁਰੱਖਿਆ ਅਤੇ ਵਿਸ਼ੇਸ਼ ਅਦਾਲਤਾਂ।"],
    authority: ["Ministry of Women and Child Development (Act No. 32 of 2012)", "महिला एवं बाल विकास मंत्रालय", "ਮਹਿਲਾ ਅਤੇ ਬਾਲ ਵਿਕਾਸ ਮੰਤਰਾਲਾ"],
    enacted: ["19 June 2012", "19 जून 2012", "19 ਜੂਨ 2012"],
    effective: ["14 November 2012 (Amended 2019)", "14 नवंबर 2012", "14 ਨਵੰਬਰ 2012"],
    version: ["As amended (2019)", "संशोधनों सहित", "ਸੋਧਾਂ ਸਮੇਤ"],
    href: "https://www.indiacode.nic.in/handle/123456789/2079?locale=en",
    q: ["What are the mandatory reporting duties under POCSO Act?", "पॉक्सो एक्ट के तहत अपराध की सूचना देना क्यों अनिवार्य है?", "ਪੋਕਸੋ ਐਕਟ ਤਹਿਤ ਰਿਪੋਰਟ ਕਰਨਾ ਕਿਉਂ ਲਾਜ਼ਮੀ ਹੈ?"],
  },
  {
    key: "marriage", category: "family", tone: "var(--c-gold)", tag: "hindu_marriage_act",
    name: ["Hindu Marriage Act, 1955", "हिन्दू विवाह अधिनियम, 1955", "ਹਿੰਦੂ ਵਿਆਹ ਐਕਟ, 1955"],
    about: ["Conditions for marriage, restitution of conjugal rights, judicial separation, and divorce grounds.", "विवाह की शर्तें, दाम्पत्य अधिकारों की पुनर्स्थापना और तलाक के आधार।", "ਵਿਆਹ ਦੀਆਂ ਸ਼ਰਤਾਂ, ਅਦਾਲਤੀ ਵੱਖਰੇਵੇਂ ਅਤੇ ਤਲਾਕ ਦੇ ਆਧਾਰ।"],
    authority: ["Ministry of Law and Justice (Act No. 25 of 1955)", "विधि और न्याय मंत्रालय", "ਕਾਨੂੰਨ ਅਤੇ ਨਿਆਂ ਮੰਤਰਾਲਾ"],
    enacted: ["18 May 1955", "18 मई 1955", "18 ਮਈ 1955"],
    effective: ["18 May 1955", "18 मई 1955", "18 ਮਈ 1955"],
    version: ["As amended", "संशोधनों सहित", "ਸੋਧਾਂ ਸਮੇਤ"],
    href: "https://www.indiacode.nic.in/handle/123456789/1553?locale=en",
    q: ["What are the valid grounds for divorce under Hindu Marriage Act?", "हिन्दू विवाह अधिनियम में तलाक के वैध आधार क्या हैं?", "ਹਿੰਦੂ ਵਿਆਹ ਐਕਟ ਵਿੱਚ ਤਲਾਕ ਦੇ ਜਾਇਜ਼ ਆਧਾਰ ਕੀ ਹਨ?"],
  },
  {
    key: "property", category: "civil_property", tone: "var(--c-blue)", tag: "transfer_of_property_act",
    name: ["Transfer of Property Act, 1882", "सम्पत्ति अन्तरण अधिनियम, 1882", "ਸੰਪਤੀ ਤਬਾਦਲਾ ਐਕਟ, 1882"],
    about: ["Sale, mortgage, lease, exchange, and gift of immovable property.", "अचल संपत्ति की बिक्री, बंधक, पट्टा (लीज) और दान।", "ਅਚੱਲ ਜਾਇਦਾਦ ਦੀ ਵਿਕਰੀ, ਗਹਿਣੇ, ਲੀਜ਼ ਅਤੇ ਤੋਹਫ਼ਾ।"],
    authority: ["Ministry of Law and Justice (Act No. 4 of 1882)", "विधि और न्याय मंत्रालय", "ਕਾਨੂੰਨ और ਨਿਆਂ ਮੰਤਰਾਲਾ"],
    enacted: ["17 February 1882", "17 फरवरी 1882", "17 ਫਰਵਰੀ 1882"],
    effective: ["1 July 1882", "1 जुलाई 1882", "1 ਜੁਲਾਈ 1882"],
    version: ["As amended", "संशोधनों सहित", "ਸੋਧਾਂ ਸਮੇਤ"],
    href: "https://www.indiacode.nic.in/handle/123456789/2338?locale=en",
    q: ["What is the difference between a lease and a licence for property?", "पट्टा (Lease) और लाइसेंस में क्या कानूनी अंतर है?", "ਲੀਜ਼ ਅਤੇ ਲਾਇਸੈਂਸ ਵਿੱਚ ਕੀ ਕਾਨੂੰਨੀ ਫਰਕ ਹੈ?"],
  },
  {
    key: "sc_precedents", category: "precedents", tone: "var(--c-purple)", tag: "sc_precedents",
    name: ["Supreme Court Landmark Precedents", "सुप्रीम कोर्ट ऐतिहासिक निर्णय", "ਸੁਪਰੀਮ ਕੋਰਟ ਇਤਿਹਾਸਕ ਫੈਸਲੇ"],
    about: ["Binding judicial declarations under Article 141: Arnesh Kumar (Notice of Appearance), Lalita Kumari (Mandatory FIR), Satender Antil (Bail Guidelines), D.K. Basu (Arrestee Rights), and Puttaswamy (Right to Privacy).", "अनुच्छेद 141 के तहत बाध्यकारी न्यायिक निर्णय: अर्नेश कुमार (गिरफ्तारी नोटिस), ललिता कुमारी (अनिवार्य एफआईआर), डी.के. बसु (अधिकार)।", "ਅਨੁਛੇਦ 141 ਅਧੀਨ ਸੁਪਰੀਮ ਕੋਰਟ ਦੇ ਮਾਰਗਦਰਸ਼ਕ ਫੈਸਲੇ: ਅਰਨੇਸ਼ ਕੁਮਾਰ, ਲਲਿਤਾ ਕੁਮਾਰੀ, ਡੀ.ਕੇ. ਬਾਸੂ ਅਤੇ ਜ਼ਮਾਨਤ ਨਿਯਮ।"],
    authority: ["Supreme Court of India (Constitution Article 141)", "भारत का सर्वोच्च न्यायालय (अनुच्छेद 141)", "ਭਾਰਤ ਦੀ ਸੁਪਰੀਮ ਕੋਰਟ (ਅਨੁਛੇਦ 141)"],
    enacted: ["Landmark Rulings (1997 - 2024)", "ऐतिहासिक निर्णय", "ਇਤਿਹਾਸਕ ਫੈਸਲੇ"],
    effective: ["Binding law on all courts and police stations across India", "पूरे भारत के सभी न्यायालयों एवं थानों पर बाध्यकारी", "ਭਾਰਤ ਭਰ ਦੇ ਸਾਰੇ ਥਾਣਿਆਂ ਅਤੇ ਅਦਾਲਤਾਂ 'ਤੇ ਲਾਗੂ"],
    version: ["Binding Precedent", "बाध्यकारी नज़ीर", "ਲਾਜ਼ਮੀ ਨਜ਼ੀਰ"],
    href: "https://main.sci.gov.in/",
    q: ["What are the mandatory guidelines for arrest under Arnesh Kumar and D.K. Basu?", "अर्नेश कुमार और डी.के. बसु में गिरफ्तारी के क्या अनिवार्य नियम हैं?", "ਅਰਨੇਸ਼ ਕੁਮਾਰ ਅਤੇ ਡੀ.ਕੇ. ਬਾਸੂ ਅਨੁਸਾਰ ਗ੍ਰਿਫ਼ਤਾਰੀ ਦੇ ਕੀ ਨਿਯਮ ਹਨ?"],
  },
];

export default function OfficialActs() {
  const { tr, lang } = useLang();
  const nav = useNavigate();
  const [counts, setCounts] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [query, setQuery] = useState("");

  // Fetch passage counts from backend
  useEffect(() => {
    let alive = true;
    getJSON("/api/acts")
      .then((d) => {
        if (!alive) return;
        const rows = list(d, "acts", "items", "results").map((r) => ({
          name: String(pick(r, "name", "act", "title", "id")).toLowerCase(),
          n: Number(pick(r, "count", "sections", "passages", "n", "chunks")),
        }));
        setCounts(rows);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const countFor = (key) => {
    const hit = counts.find((c) => c.name.includes(key));
    return hit && Number.isFinite(hit.n) && hit.n > 0 ? hit.n : null;
  };

  const getCategoryDef = (catId) => {
    return CATEGORIES.find((c) => c.id === catId) || CATEGORIES[0];
  };

  // Filtered Acts based on Category and Search Query
  const filteredActs = useMemo(() => {
    return ACTS.filter((a) => {
      // Category filter
      if (selectedCat !== "all" && a.category !== selectedCat) {
        return false;
      }
      // Search filter
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const names = a.name.map((n) => n.toLowerCase()).join(" ");
        const abouts = a.about.map((ab) => ab.toLowerCase()).join(" ");
        const authorities = a.authority.map((au) => au.toLowerCase()).join(" ");
        const match =
          names.includes(q) ||
          abouts.includes(q) ||
          authorities.includes(q) ||
          a.tag.toLowerCase().includes(q) ||
          a.key.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [selectedCat, query]);

  // Count acts per category
  const categoryCounts = useMemo(() => {
    const res = { all: ACTS.length };
    for (const a of ACTS) {
      res[a.category] = (res[a.category] || 0) + 1;
    }
    return res;
  }, []);

  const pillars = [
    [ShieldCheck, "var(--c-green)", ["No invented statutes", "कोई गढ़ा हुआ कानून नहीं", "ਕੋਈ ਘੜਿਆ ਕਾਨੂੰਨ ਨਹੀਂ"], ["Every entry maps to a real enacted Act.", "हर प्रविष्टि एक वास्तविक अधिनियमित कानून से जुड़ी है।", "ਹਰ ਐਂਟਰੀ ਇੱਕ ਅਸਲ ਲਾਗੂ ਕਾਨੂੰਨ ਨਾਲ ਜੁੜੀ ਹੈ।"]],
    [FileCheck2, "var(--c-blue)", ["Official sources", "आधिकारिक स्रोत", "ਅਧਿਕਾਰਤ ਸਰੋਤ"], ["Text comes from government repositories such as India Code.", "पाठ इंडिया कोड जैसे सरकारी भंडारों से है।", "ਪਾਠ ਇੰਡੀਆ ਕੋਡ ਵਰਗੇ ਸਰਕਾਰੀ ਭੰਡਾਰਾਂ ਤੋਂ ਹੈ।"]],
    [Layers, "var(--c-purple)", ["Section-aware chunks", "धारा-आधारित अंश", "ਧਾਰਾ-ਆਧਾਰਿਤ ਅੰਸ਼"], ["Passages keep their Article or Section number.", "अंश अपना अनुच्छेद या धारा क्रमांक बनाए रखते हैं।", "ਅੰਸ਼ ਆਪਣਾ ਅਨੁਛੇਦ ਜਾਂ ਧਾਰਾ ਨੰਬਰ ਬਣਾਈ ਰੱਖਦੇ ਹਨ।"]],
  ];

  const meta = (label, value) => (
    <div>
      <div className="mono-line text-[11px] font-bold text-muted">{label}</div>
      <div className="text-xs sm:text-sm font-semibold text-ink mt-0.5">{value}</div>
    </div>
  );

  const activeCategoryDef = getCategoryDef(selectedCat);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="hero-bg card card-accent card-raised px-5 py-8 sm:px-10">
        <span className="tone-badge rise" style={{ "--tone": "var(--c-gold)" }}>
          <BadgeCheck size={12} />
          {tr("Statutory document registry", "कानूनी दस्तावेज़ रजिस्ट्री", "ਕਾਨੂੰਨੀ ਦਸਤਾਵੇਜ਼ ਰਜਿਸਟਰੀ")}
        </span>
        <h1 className="rise mt-3 text-3xl font-bold sm:text-4xl text-ink" style={{ animationDelay: "60ms" }}>
          {tr("Indian legal corpus and provenance registry", "भारतीय कानूनी संग्रह और स्रोत रजिस्ट्री", "ਭਾਰਤੀ ਕਾਨੂੰਨੀ ਸੰਗ੍ਰਹਿ ਅਤੇ ਸਰੋਤ ਰਜਿਸਟਰੀ")}
        </h1>
        <p className="rise mt-2 max-w-2xl text-muted text-sm sm:text-base leading-relaxed" style={{ animationDelay: "120ms" }}>
          {tr(
            "The official enacted laws this assistant draws on, organized by legal domain. For the authoritative text, follow the official ministry and India Code source links on each card.",
            "वे आधिकारिक कानून जिन पर यह सहायक आधारित है, कानूनी क्षेत्र अनुसार व्यवस्थित। प्रामाणिक पाठ हेतु आधिकारिक मंत्रालय एवं इंडिया कोड लिंक देखें।",
            "ਉਹ ਅਧਿਕਾਰਤ ਕਾਨੂੰਨ ਜਿਨ੍ਹਾਂ 'ਤੇ ਇਹ ਸਹਾਇਕ ਆਧਾਰਿਤ ਹੈ, ਕਾਨੂੰਨੀ ਸ਼੍ਰੇਣੀ ਅਨੁਸਾਰ ਵੰਡੇ ਹੋਏ। ਪ੍ਰਮਾਣਿਕ ਪਾਠ ਲਈ ਸਰਕਾਰੀ ਲਿੰਕ ਵੇਖੋ।"
          )}
        </p>

        {/* 3 Pillars */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {pillars.map(([Icon, tone, t, d], i) => (
            <div
              key={i}
              className="card tone-card zoom-hover-sm group flex items-start gap-3 p-3 bg-surface border border-line"
              style={{ "--tone": tone }}
            >
              <span className="tone-icon-sm shrink-0">
                <Icon size={16} className="icon-pop" />
              </span>
              <div>
                <div className="text-sm font-bold text-ink">{tr(...t)}</div>
                <div className="text-xs text-muted leading-relaxed mt-0.5">{tr(...d)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Navigation Bar */}
        <div className="mt-8 pt-6 border-t border-line/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-accent">
                {tr("Browse by Legal Domain", "कानूनी क्षेत्र अनुसार देखें", "ਕਾਨੂੰਨੀ ਖੇਤਰ ਅਨੁਸਾਰ ਵੇਖੋ")}
              </span>
              <span className="text-xs text-muted ml-2 font-medium">
                ({filteredActs.length} {tr("Acts in view", "अधिनियम दृश्यमान", "ਐਕਟ ਮੌਜੂਦ")})
              </span>
            </div>

            {/* Live Search Filter */}
            <div className="relative max-w-xs w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr("Search by Act name or keyword...", "अधिनियम या कीवर्ड खोजें...", "ਐਕਟ ਦਾ ਨਾਮ ਜਾਂ ਕੀਵਰਡ ਖੋਜੋ...")}
                className="input w-full pl-9 pr-8 py-1.5 text-xs rounded-xl"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSel = selectedCat === cat.id;
              const catName = lang === "hi" ? cat.name[1] : lang === "pa" ? cat.name[2] : cat.name[0];
              const count = categoryCounts[cat.id] || 0;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCat(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all border ${
                    isSel
                      ? "tab-active bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 border-amber-600 font-black shadow-md ring-2 ring-amber-400/40"
                      : "bg-surface text-ink hover:text-ink hover:bg-surface-2 border-line font-bold"
                  }`}
                  style={isSel ? { color: "#0f172a", backgroundColor: "#f59e0b" } : undefined}
                >
                  <Icon
                    size={14}
                    className={`shrink-0 ${isSel ? "text-slate-950" : "text-accent"}`}
                    style={isSel ? { color: "#0f172a" } : undefined}
                  />
                  <span
                    className={isSel ? "font-black tracking-tight" : "text-ink font-bold"}
                    style={isSel ? { color: "#0f172a" } : undefined}
                  >
                    {catName}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold ${
                      isSel ? "bg-slate-950/20 text-slate-950" : "bg-surface-2 text-muted border border-line/60"
                    }`}
                    style={isSel ? { color: "#0f172a" } : undefined}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Category Scope Banner */}
          {selectedCat !== "all" && activeCategoryDef.desc && (
            <div className="p-3.5 rounded-xl bg-surface-2 border border-line flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-ink font-medium">
                <activeCategoryDef.icon size={16} className="text-accent shrink-0" />
                <span>{tr(...activeCategoryDef.desc)}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCat("all")}
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1 shrink-0"
              >
                <RotateCcw size={12} />
                {tr("Show all categories", "सभी श्रेणियाँ देखें", "ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ ਵੇਖੋ")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Acts Registry Cards List */}
      <div className="space-y-5">
        {filteredActs.length === 0 ? (
          <div className="card p-12 text-center bg-surface border border-line space-y-3">
            <Library size={32} className="mx-auto text-muted/60" />
            <h3 className="text-base font-bold text-ink">
              {tr("No matching Acts found", "कोई संबंधित अधिनियम नहीं मिला", "ਕੋਈ ਮਿਲਦਾ ਐਕਟ ਨਹੀਂ ਮਿਲਿਆ")}
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              {tr(
                "Try clearing your search query or switching to 'All Categories'.",
                "कृपया खोज कीवर्ड साफ़ करें या 'सभी श्रेणियाँ' चुनें।",
                "ਕਿਰਪਾ ਕਰਕੇ ਖੋਜ ਸਾਫ਼ ਕਰੋ ਜਾਂ 'ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ' ਚੁਣੋ।"
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedCat("all");
              }}
              className="btn btn-sm btn-ghost border border-line text-xs font-bold"
            >
              <RotateCcw size={12} />
              {tr("Reset Filters", "फ़िल्टर रीसेट करें", "ਫਿਲਟਰ ਰੀਸੈਟ ਕਰੋ")}
            </button>
          </div>
        ) : (
          filteredActs.map((a, i) => {
            const n = countFor(a.key);
            const catDef = getCategoryDef(a.category);
            const catName = lang === "hi" ? catDef.name[1] : lang === "pa" ? catDef.name[2] : catDef.name[0];

            return (
              <Reveal key={a.tag} delay={(i % 2) * 70}>
                <div className="card tone-card zoom-hover-sm p-5 sm:p-6 bg-surface border border-line" style={{ "--tone": a.tone }}>
                  {/* Card Header: Tag, Category Badge, Official link badge, and Passages */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tone-badge font-mono text-xs font-bold">{a.tag}</span>

                    {/* Category Tag Badge */}
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-extrabold border flex items-center gap-1.5"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--tone) 12%, transparent)",
                        borderColor: "color-mix(in srgb, var(--tone) 40%, transparent)",
                        color: "var(--tone)",
                      }}
                    >
                      <catDef.icon size={12} />
                      <span>{catName}</span>
                    </span>

                    <span className="tone-badge text-xs" style={{ "--tone": "var(--c-green)" }}>
                      <BadgeCheck size={12} />
                      {tr("Official source linked", "आधिकारिक स्रोत लिंक सहित", "ਅਧਿਕਾਰਤ ਸਰੋਤ ਲਿੰਕ ਸਮੇਤ")}
                    </span>

                    {n && (
                      <span className="chip ml-auto cursor-default font-mono text-xs font-bold">
                        {n.toLocaleString("en-IN")} {tr("passages indexed", "अंश शामिल", "ਅੰਸ਼ ਸ਼ਾਮਲ")}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-xl sm:text-2xl font-black text-ink tracking-tight">{tr(...a.name)}</h2>
                  <p className="mt-1 text-xs sm:text-sm text-muted font-medium leading-relaxed">{tr(...a.about)}</p>

                  {/* Metadata Grid */}
                  <div className="bg-surface-2 mt-4 grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2 lg:grid-cols-4">
                    {meta(tr("Issuing authority", "जारीकर्ता प्राधिकरण", "ਜਾਰੀਕਰਤਾ ਅਥਾਰਟੀ"), tr(...a.authority))}
                    {meta(tr("Enacted", "अधिनियमित", "ਲਾਗੂ ਕੀਤਾ"), tr(...a.enacted))}
                    {meta(tr("Effective date", "प्रभावी तिथि", "ਪ੍ਰਭਾਵੀ ਤਾਰੀਖ਼"), tr(...a.effective))}
                    {meta(tr("Version status", "संस्करण स्थिति", "ਸੰਸਕਰਣ ਸਥਿਤੀ"), tr(...a.version))}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-line/60">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs font-bold"
                      onClick={() => nav("/assistant", { state: { q: tr(...a.q) } })}
                    >
                      <Sparkles size={14} />
                      {tr("Ask AI", "एआई से पूछें", "ਏਆਈ ਤੋਂ ਪੁੱਛੋ")}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm border border-line flex items-center gap-1.5 text-xs font-bold text-ink hover:bg-surface-2"
                      onClick={() => nav("/acts")}
                    >
                      <Library size={14} />
                      {tr("Browse sections", "धाराएँ देखें", "ਧਾਰਾਵਾਂ ਵੇਖੋ")}
                    </button>
                    <div className="ml-auto flex flex-wrap gap-3 text-xs sm:text-sm font-semibold">
                      <a
                        href={a.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-accent hover:underline"
                      >
                        {tr("View official ministry source", "आधिकारिक मंत्रालय स्रोत देखें", "ਅਧਿਕਾਰਤ ਮੰਤਰਾਲਾ ਸਰੋਤ ਵੇਖੋ")}
                        <ExternalLink size={13} />
                      </a>
                      <a
                        href={INDIA_CODE}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-muted hover:text-accent hover:underline"
                      >
                        India Code
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                  <p className="mono-line mt-3 text-[11px] text-muted font-bold">
                    {tr("Language: English (Official Gazette)", "भाषा: अंग्रेज़ी (आधिकारिक राजपत्र)", "ਭਾਸ਼ਾ: ਅੰਗਰੇਜ਼ੀ (ਅਧਿਕਾਰਤ ਗਜ਼ਟ)")}
                  </p>
                </div>
              </Reveal>
            );
          })
        )}
      </div>
    </div>
  );
}
