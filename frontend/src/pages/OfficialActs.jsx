import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Sparkles, Library, ShieldCheck, FileCheck2, Layers, BadgeCheck } from "lucide-react";
import { useLang } from "../LangContext";
import { getJSON } from "../api";
import { list, pick } from "../lib/normalize";
import Reveal from "../components/Reveal";

const INDIA_CODE = "https://www.indiacode.nic.in";

const ACTS = [
  {
    key: "constitution", tone: "var(--c-gold)", tag: "constitution_of_india",
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
    key: "nyaya", tone: "var(--c-rose)", tag: "bharatiya_nyaya_sanhita",
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
    key: "nagarik", tone: "var(--c-blue)", tag: "bharatiya_nagarik_suraksha_sanhita",
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
    key: "sakshya", tone: "var(--c-purple)", tag: "bharatiya_sakshya_adhiniyam",
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
    key: "information technology", tone: "var(--c-green)", tag: "information_technology_act",
    name: ["Information Technology Act, 2000", "सूचना प्रौद्योगिकी अधिनियम, 2000", "ਸੂਚਨਾ ਤਕਨਾਲੋਜੀ ਐਕਟ, 2000"],
    about: ["Cyber crime, electronic records and digital signatures.", "साइबर अपराध, इलेक्ट्रॉनिक रिकॉर्ड और डिजिटल हस्ताक्षर।", "ਸਾਈਬਰ ਅਪਰਾਧ, ਇਲੈਕਟ੍ਰਾਨਿਕ ਰਿਕਾਰਡ ਅਤੇ ਡਿਜੀਟਲ ਦਸਤਖ਼ਤ।"],
    authority: ["Ministry of Electronics and IT (Act No. 21 of 2000)", "इलेक्ट्रॉनिकी और सूचना प्रौद्योगिकी मंत्रालय (अधिनियम 21, 2000)", "ਇਲੈਕਟ੍ਰੋਨਿਕਸ ਅਤੇ ਆਈਟੀ ਮੰਤਰਾਲਾ (ਐਕਟ 21, 2000)"],
    enacted: ["9 June 2000 (assent)", "9 जून 2000 (स्वीकृति)", "9 ਜੂਨ 2000 (ਮਨਜ਼ੂਰੀ)"],
    effective: ["17 October 2000", "17 अक्टूबर 2000", "17 ਅਕਤੂਬਰ 2000"],
    version: ["As amended", "संशोधनों सहित", "ਸੋਧਾਂ ਸਮੇਤ"],
    href: "https://www.meity.gov.in",
    q: ["What does the IT Act say about identity theft?", "आईटी एक्ट पहचान की चोरी के बारे में क्या कहता है?", "ਆਈਟੀ ਐਕਟ ਪਛਾਣ ਦੀ ਚੋਰੀ ਬਾਰੇ ਕੀ ਕਹਿੰਦਾ ਹੈ?"],
  },
  {
    key: "consumer", tone: "var(--c-gold)", tag: "consumer_protection_act",
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
    key: "right to information", tone: "var(--c-blue)", tag: "right_to_information_act",
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
    key: "negotiable instruments", tone: "var(--c-rose)", tag: "negotiable_instruments_act",
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
    key: "domestic violence", tone: "var(--c-purple)", tag: "domestic_violence_act",
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
    key: "contract", tone: "var(--c-gold)", tag: "indian_contract_act",
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
    key: "civil procedure", tone: "var(--c-blue)", tag: "code_of_civil_procedure",
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
    key: "motor vehicle", tone: "var(--c-green)", tag: "motor_vehicles_act",
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
    key: "legal aid", tone: "var(--c-rose)", tag: "legal_services_authorities_act",
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
    key: "workplace harassment", tone: "var(--c-purple)", tag: "posh_act",
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
    key: "pocso", tone: "var(--c-rose)", tag: "pocso_act",
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
    key: "marriage", tone: "var(--c-gold)", tag: "hindu_marriage_act",
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
    key: "property", tone: "var(--c-blue)", tag: "transfer_of_property_act",
    name: ["Transfer of Property Act, 1882", "सम्पत्ति अन्तरण अधिनियम, 1882", "ਸੰਪਤੀ ਤਬਾਦਲਾ ਐਕਟ, 1882"],
    about: ["Sale, mortgage, lease, exchange, and gift of immovable property.", "अचल संपत्ति की बिक्री, बंधक, पट्टा (लीज) और दान।", "ਅਚੱਲ ਜਾਇਦਾਦ ਦੀ ਵਿਕਰੀ, ਗਹਿਣੇ, ਲੀਜ਼ ਅਤੇ ਤੋਹਫ਼ਾ।"],
    authority: ["Ministry of Law and Justice (Act No. 4 of 1882)", "विधि और न्याय मंत्रालय", "ਕਾਨੂੰਨ ਅਤੇ ਨਿਆਂ ਮੰਤਰਾਲਾ"],
    enacted: ["17 February 1882", "17 फरवरी 1882", "17 ਫਰਵਰੀ 1882"],
    effective: ["1 July 1882", "1 जुलाई 1882", "1 ਜੁਲਾਈ 1882"],
    version: ["As amended", "संशोधनों सहित", "ਸੋਧਾਂ ਸਮੇਤ"],
    href: "https://www.indiacode.nic.in/handle/123456789/2338?locale=en",
    q: ["What is the difference between a lease and a licence for property?", "पट्टा (Lease) और लाइसेंस में क्या कानूनी अंतर है?", "ਲੀਜ਼ ਅਤੇ ਲਾਇਸੈਂਸ ਵਿੱਚ ਕੀ ਕਾਨੂੰਨੀ ਫਰਕ ਹੈ?"],
  },
];

export default function OfficialActs() {
  const { tr } = useLang();
  const nav = useNavigate();
  const [counts, setCounts] = useState([]);

  // Optional: show how many passages of each Act are indexed, if /api/acts exposes it.
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

  const pillars = [
    [ShieldCheck, "var(--c-green)", ["No invented statutes", "कोई गढ़ा हुआ कानून नहीं", "ਕੋਈ ਘੜਿਆ ਕਾਨੂੰਨ ਨਹੀਂ"], ["Every entry maps to a real enacted Act.", "हर प्रविष्टि एक वास्तविक अधिनियमित कानून से जुड़ी है।", "ਹਰ ਐਂਟਰੀ ਇੱਕ ਅਸਲ ਲਾਗੂ ਕਾਨੂੰਨ ਨਾਲ ਜੁੜੀ ਹੈ।"]],
    [FileCheck2, "var(--c-blue)", ["Official sources", "आधिकारिक स्रोत", "ਅਧਿਕਾਰਤ ਸਰੋਤ"], ["Text comes from government repositories such as India Code.", "पाठ इंडिया कोड जैसे सरकारी भंडारों से है।", "ਪਾਠ ਇੰਡੀਆ ਕੋਡ ਵਰਗੇ ਸਰਕਾਰੀ ਭੰਡਾਰਾਂ ਤੋਂ ਹੈ।"]],
    [Layers, "var(--c-purple)", ["Section-aware chunks", "धारा-आधारित अंश", "ਧਾਰਾ-ਆਧਾਰਿਤ ਅੰਸ਼"], ["Passages keep their Article or Section number.", "अंश अपना अनुच्छेद या धारा क्रमांक बनाए रखते हैं।", "ਅੰਸ਼ ਆਪਣਾ ਅਨੁਛੇਦ ਜਾਂ ਧਾਰਾ ਨੰਬਰ ਬਣਾਈ ਰੱਖਦੇ ਹਨ।"]],
  ];

  const meta = (label, value) => (
    <div>
      <div className="mono-line">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <section className="hero-bg card card-accent card-raised px-5 py-8 sm:px-10">
        <span className="tone-badge rise" style={{ "--tone": "var(--c-gold)" }}>
          <BadgeCheck size={12} />
          {tr("Statutory document registry", "कानूनी दस्तावेज़ रजिस्ट्री", "ਕਾਨੂੰਨੀ ਦਸਤਾਵੇਜ਼ ਰਜਿਸਟਰੀ")}
        </span>
        <h1 className="rise mt-3 text-3xl font-bold sm:text-4xl" style={{ animationDelay: "60ms" }}>
          {tr("Indian legal corpus and provenance registry", "भारतीय कानूनी संग्रह और स्रोत रजिस्ट्री", "ਭਾਰਤੀ ਕਾਨੂੰਨੀ ਸੰਗ੍ਰਹਿ ਅਤੇ ਸਰੋਤ ਰਜਿਸਟਰੀ")}
        </h1>
        <p className="rise mt-2 max-w-2xl text-muted" style={{ animationDelay: "120ms" }}>
          {tr(
            "The laws this assistant draws on, with their issuing authority and dates. For the authoritative text, always follow the official source link on each card.",
            "वे कानून जिन पर यह सहायक आधारित है, उनके जारीकर्ता और तिथियों सहित। प्रामाणिक पाठ के लिए हर कार्ड का आधिकारिक स्रोत लिंक देखें।",
            "ਉਹ ਕਾਨੂੰਨ ਜਿਨ੍ਹਾਂ 'ਤੇ ਇਹ ਸਹਾਇਕ ਆਧਾਰਿਤ ਹੈ, ਉਨ੍ਹਾਂ ਦੇ ਜਾਰੀਕਰਤਾ ਅਤੇ ਤਰੀਕਾਂ ਸਮੇਤ। ਪ੍ਰਮਾਣਿਕ ਪਾਠ ਲਈ ਹਰ ਕਾਰਡ ਦਾ ਅਧਿਕਾਰਤ ਸਰੋਤ ਲਿੰਕ ਵੇਖੋ।"
          )}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {pillars.map(([Icon, tone, t, d], i) => (
            <div
              key={i}
              className="card tone-card zoom-hover-sm group flex items-start gap-3 p-3"
              style={{ "--tone": tone }}
            >
              <span className="tone-icon-sm">
                <Icon size={16} className="icon-pop" />
              </span>
              <div>
                <div className="text-sm font-bold">{tr(...t)}</div>
                <div className="text-xs text-muted">{tr(...d)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-5">
        {ACTS.map((a, i) => {
          const n = countFor(a.key);
          return (
            <Reveal key={a.tag} delay={(i % 2) * 70}>
              <div className="card tone-card zoom-hover-sm p-5 sm:p-6" style={{ "--tone": a.tone }}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tone-badge font-mono">{a.tag}</span>
                  <span className="tone-badge" style={{ "--tone": "var(--c-green)" }}>
                    <BadgeCheck size={12} />
                    {tr("Official source linked", "आधिकारिक स्रोत लिंक सहित", "ਅਧਿਕਾਰਤ ਸਰੋਤ ਲਿੰਕ ਸਮੇਤ")}
                  </span>
                  {n && (
                    <span className="chip ml-auto cursor-default font-mono">
                      {n.toLocaleString("en-IN")} {tr("passages indexed", "अंश शामिल", "ਅੰਸ਼ ਸ਼ਾਮਲ")}
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-2xl font-bold">{tr(...a.name)}</h2>
                <p className="mt-1 text-sm text-muted">{tr(...a.about)}</p>

                <div className="bg-surface-2 mt-4 grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
                  {meta(tr("Issuing authority", "जारीकर्ता प्राधिकरण", "ਜਾਰੀਕਰਤਾ ਅਥਾਰਟੀ"), tr(...a.authority))}
                  {meta(tr("Enacted", "अधिनियमित", "ਲਾਗੂ ਕੀਤਾ"), tr(...a.enacted))}
                  {meta(tr("Effective date", "प्रभावी तिथि", "ਪ੍ਰਭਾਵੀ ਤਾਰੀਖ਼"), tr(...a.effective))}
                  {meta(tr("Version status", "संस्करण स्थिति", "ਸੰਸਕਰਣ ਸਥਿਤੀ"), tr(...a.version))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => nav("/assistant", { state: { q: tr(...a.q) } })}
                  >
                    <Sparkles size={14} />
                    {tr("Ask AI", "एआई से पूछें", "ਏਆਈ ਤੋਂ ਪੁੱਛੋ")}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => nav("/acts")}>
                    <Library size={14} />
                    {tr("Browse sections", "धाराएँ देखें", "ਧਾਰਾਵਾਂ ਵੇਖੋ")}
                  </button>
                  <div className="ml-auto flex flex-wrap gap-3 text-sm font-semibold">
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
                <p className="mono-line mt-3">
                  {tr("Language: English", "भाषा: अंग्रेज़ी", "ਭਾਸ ਾ: ਅੰਗਰੇਜ਼ੀ").replace("ਭਾਸ ਾ", "ਭਾਸ਼ਾ")}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}