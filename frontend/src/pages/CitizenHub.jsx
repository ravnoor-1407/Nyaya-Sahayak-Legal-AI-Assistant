import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronDown, CheckCircle2, Sparkles, HeartHandshake } from "lucide-react";
import { useLang } from "../LangContext";

const BOOKS = [
  {
    id: "arrest", tone: "var(--c-rose)",
    cat: ["Criminal law and fundamental rights", "आपराधिक कानून और मौलिक अधिकार", "ਅਪਰਾਧਿਕ ਕਾਨੂੰਨ ਅਤੇ ਮੌਲਿਕ ਅਧਿਕਾਰ"],
    law: "Constitution of India (Articles 21 and 22) | Bharatiya Nagarik Suraksha Sanhita, 2023",
    title: ["Arrest rights and police interaction guide", "गिरफ्तारी के अधिकार और पुलिस से व्यवहार मार्गदर्शिका", "ਗ੍ਰਿਫ਼ਤਾਰੀ ਦੇ ਅਧਿਕਾਰ ਅਤੇ ਪੁਲਿਸ ਨਾਲ ਵਿਹਾਰ ਗਾਈਡ"],
    desc: ["Critical constitutional rights you have during questioning and arrest.", "पूछताछ और गिरफ्तारी के दौरान आपके महत्वपूर्ण संवैधानिक अधिकार।", "ਪੁੱਛਗਿੱਛ ਅਤੇ ਗ੍ਰਿਫ਼ਤਾਰੀ ਦੌਰਾਨ ਤੁਹਾਡੇ ਮਹੱਤਵਪੂਰਨ ਸੰਵਿਧਾਨਕ ਅਧਿਕਾਰ।"],
    rights: [
      ["Right to be told the grounds of arrest (Article 22(1); BNSS s.47).", "गिरफ्तारी के आधार बताए जाने का अधिकार (अनुच्छेद 22(1); बीएनएसएस धारा 47)।", "ਗ੍ਰਿਫ਼ਤਾਰੀ ਦੇ ਆਧਾਰ ਦੱਸੇ ਜਾਣ ਦਾ ਅਧਿਕਾਰ (ਅਨੁਛੇਦ 22(1); ਬੀਐਨਐਸਐਸ ਧਾਰਾ 47)।"],
      ["Right to consult and be defended by a lawyer of your choice (Article 22(1)).", "अपनी पसंद के वकील से परामर्श और बचाव का अधिकार (अनुच्छेद 22(1))।", "ਆਪਣੀ ਪਸੰਦ ਦੇ ਵਕੀਲ ਨਾਲ ਸਲਾਹ ਅਤੇ ਬਚਾਅ ਦਾ ਅਧਿਕਾਰ (ਅਨੁਛੇਦ 22(1))।"],
      ["Must be produced before a Magistrate within 24 hours, excluding travel time (Article 22(2); BNSS s.58).", "यात्रा का समय छोड़कर 24 घंटे में मजिस्ट्रेट के सामने पेश करना ज़रूरी (अनुच्छेद 22(2); बीएनएसएस धारा 58)।", "ਸਫ਼ਰ ਦਾ ਸਮਾਂ ਛੱਡ ਕੇ 24 ਘੰਟਿਆਂ ਵਿੱਚ ਮੈਜਿਸਟ੍ਰੇਟ ਸਾਹਮਣੇ ਪੇਸ਼ ਕਰਨਾ ਜ਼ਰੂਰੀ (ਅਨੁਛੇਦ 22(2); ਬੀਐਨਐਸਐਸ ਧਾਰਾ 58)।"],
      ["Right to have a family member or friend told of the arrest (BNSS s.48).", "परिवार के सदस्य या मित्र को गिरफ्तारी की सूचना दिए जाने का अधिकार (बीएनएसएस धारा 48)।", "ਪਰਿਵਾਰ ਦੇ ਮੈਂਬਰ ਜਾਂ ਮਿੱਤਰ ਨੂੰ ਗ੍ਰਿਫ਼ਤਾਰੀ ਦੀ ਸੂਚਨਾ ਦਿੱਤੇ ਜਾਣ ਦਾ ਅਧਿਕਾਰ (ਬੀਐਨਐਸਐਸ ਧਾਰਾ 48)।"],
      ["Right to free legal aid if you cannot afford a lawyer (Article 39A).", "वकील का खर्च न उठा सकने पर निःशुल्क विधिक सहायता का अधिकार (अनुच्छेद 39A)।", "ਵਕੀਲ ਦਾ ਖਰਚਾ ਨਾ ਝੱਲ ਸਕਣ 'ਤੇ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਦਾ ਅਧਿਕਾਰ (ਅਨੁਛੇਦ 39A)।"],
    ],
    steps: [
      ["Stay calm and do not resist, even if you think the arrest is wrong.", "शांत रहें और विरोध न करें, भले ही आपको गिरफ्तारी गलत लगे।", "ਸ਼ਾਂਤ ਰਹੋ ਅਤੇ ਵਿਰੋਧ ਨਾ ਕਰੋ, ਭਾਵੇਂ ਤੁਹਾਨੂੰ ਗ੍ਰਿਫ਼ਤਾਰੀ ਗਲਤ ਲੱਗੇ।"],
      ["Ask for the reason and note the names and badges of the officers.", "कारण पूछिए और अधिकारियों के नाम व बैज नोट कीजिए।", "ਕਾਰਨ ਪੁੱਛੋ ਅਤੇ ਅਧਿਕਾਰੀਆਂ ਦੇ ਨਾਮ ਤੇ ਬੈਜ ਨੋਟ ਕਰੋ।"],
      ["Ask for a lawyer, or call 15100 for a free one.", "वकील माँगिए, या निःशुल्क वकील के लिए 15100 पर कॉल करें।", "ਵਕੀਲ ਮੰਗੋ, ਜਾਂ ਮੁਫ਼ਤ ਵਕੀਲ ਲਈ 15100 'ਤੇ ਕਾਲ ਕਰੋ।"],
      ["Ask the police to inform a relative, and tell the Magistrate about any injury or ill-treatment.", "पुलिस से किसी रिश्तेदार को सूचित करने को कहिए, और चोट या दुर्व्यवहार हो तो मजिस्ट्रेट को बताइए।", "ਪੁਲਿਸ ਨੂੰ ਕਿਸੇ ਰਿਸ਼ਤੇਦਾਰ ਨੂੰ ਦੱਸਣ ਲਈ ਕਹੋ, ਅਤੇ ਸੱਟ ਜਾਂ ਮਾੜੇ ਵਿਹਾਰ ਬਾਰੇ ਮੈਜਿਸਟ੍ਰੇਟ ਨੂੰ ਦੱਸੋ।"],
    ],
    ask: ["What are my rights if police arrest me?", "पुलिस गिरफ्तार करे तो मेरे क्या अधिकार हैं?", "ਪੁਲਿਸ ਗ੍ਰਿਫ਼ਤਾਰ ਕਰੇ ਤਾਂ ਮੇਰੇ ਕੀ ਅਧਿਕਾਰ ਹਨ?"],
  },
  {
    id: "fir", tone: "var(--c-blue)",
    cat: ["FIR and police complaints", "एफआईआर और पुलिस शिकायत", "ਐਫ਼ਆਈਆਰ ਅਤੇ ਪੁਲਿਸ ਸ਼ਿਕਾਇਤ"],
    law: "Bharatiya Nagarik Suraksha Sanhita, 2023 (Section 173)",
    title: ["How to file an FIR, and what if police refuse", "एफआईआर कैसे दर्ज करें और पुलिस मना करे तो क्या करें", "ਐਫ਼ਆਈਆਰ ਕਿਵੇਂ ਦਰਜ ਕਰੀਏ ਅਤੇ ਪੁਲਿਸ ਇਨਕਾਰ ਕਰੇ ਤਾਂ ਕੀ ਕਰੀਏ"],
    desc: ["Registering a complaint, Zero FIR and remedies when a station refuses.", "शिकायत दर्ज कराना, ज़ीरो एफआईआर और थाना मना करे तो उपाय।", "ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਵਾਉਣਾ, ਜ਼ੀਰੋ ਐਫ਼ਆਈਆਰ ਅਤੇ ਥਾਣਾ ਇਨਕਾਰ ਕਰੇ ਤਾਂ ਉਪਾਅ।"],
    rights: [
      ["For a cognizable offence, you can report at any police station (Zero FIR).", "संज्ञेय अपराध की सूचना आप किसी भी थाने में दे सकते हैं (ज़ीरो एफआईआर)।", "ਸੰਗਿਆਨਯੋਗ ਅਪਰਾਧ ਦੀ ਸੂਚਨਾ ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਥਾਣੇ ਵਿੱਚ ਦੇ ਸਕਦੇ ਹੋ (ਜ਼ੀਰੋ ਐਫ਼ਆਈਆਰ)।"],
      ["Information can be given orally or electronically, and must be read back to you.", "सूचना मौखिक या इलेक्ट्रॉनिक रूप से दी जा सकती है, और आपको पढ़कर सुनाई जानी चाहिए।", "ਸੂਚਨਾ ਮੌਖਿਕ ਜਾਂ ਇਲੈਕਟ੍ਰਾਨਿਕ ਰੂਪ ਵਿੱਚ ਦਿੱਤੀ ਜਾ ਸਕਦੀ ਹੈ, ਅਤੇ ਤੁਹਾਨੂੰ ਪੜ੍ਹ ਕੇ ਸੁਣਾਈ ਜਾਣੀ ਚਾਹੀਦੀ ਹੈ।"],
      ["You are entitled to a free copy of the FIR.", "एफआईआर की मुफ़्त प्रति पाना आपका अधिकार है।", "ਐਫ਼ਆਈਆਰ ਦੀ ਮੁਫ਼ਤ ਕਾਪੀ ਲੈਣਾ ਤੁਹਾਡਾ ਅਧਿਕਾਰ ਹੈ।"],
      ["If the station refuses, you can send the substance of the information to the Superintendent of Police.", "थाना मना करे तो सूचना का सार पुलिस अधीक्षक को भेज सकते हैं।", "ਥਾਣਾ ਇਨਕਾਰ ਕਰੇ ਤਾਂ ਸੂਚਨਾ ਦਾ ਸਾਰ ਪੁਲਿਸ ਕਪਤਾਨ ਨੂੰ ਭੇਜ ਸਕਦੇ ਹੋ।"],
    ],
    steps: [
      ["Go to the nearest police station and say what happened, when, where and who was involved.", "नज़दीकी थाने जाइए और बताइए कि क्या, कब, कहाँ हुआ और कौन शामिल था।", "ਨੇੜਲੇ ਥਾਣੇ ਜਾਓ ਅਤੇ ਦੱਸੋ ਕਿ ਕੀ, ਕਦੋਂ, ਕਿੱਥੇ ਹੋਇਆ ਅਤੇ ਕੌਣ ਸ਼ਾਮਲ ਸੀ।"],
      ["Read the written report carefully before you sign.", "हस्ताक्षर से पहले लिखी रिपोर्ट ध्यान से पढ़िए।", "ਦਸਤਖ਼ਤ ਤੋਂ ਪਹਿਲਾਂ ਲਿਖੀ ਰਿਪੋਰਟ ਧਿਆਨ ਨਾਲ ਪੜ੍ਹੋ।"],
      ["Take your free copy and note the FIR number.", "अपनी मुफ़्त प्रति लीजिए और एफआईआर संख्या लिख लीजिए।", "ਆਪਣੀ ਮੁਫ਼ਤ ਕਾਪੀ ਲਓ ਅਤੇ ਐਫ਼ਆਈਆਰ ਨੰਬਰ ਲਿਖ ਲਓ।"],
      ["If refused, send your complaint in writing to the Superintendent of Police, or approach a Magistrate.", "मना करने पर लिखित शिकायत पुलिस अधीक्षक को भेजिए, या मजिस्ट्रेट के पास जाइए।", "ਇਨਕਾਰ ਕਰਨ 'ਤੇ ਲਿਖਤੀ ਸ਼ਿਕਾਇਤ ਪੁਲਿਸ ਕਪਤਾਨ ਨੂੰ ਭੇਜੋ, ਜਾਂ ਮੈਜਿਸਟ੍ਰੇਟ ਕੋਲ ਜਾਓ।"],
    ],
    ask: ["What steps should I take if a police station refuses to register my FIR?", "थाना एफआईआर दर्ज करने से मना करे तो मैं क्या करूँ?", "ਥਾਣਾ ਐਫ਼ਆਈਆਰ ਦਰਜ ਕਰਨ ਤੋਂ ਇਨਕਾਰ ਕਰੇ ਤਾਂ ਮੈਂ ਕੀ ਕਰਾਂ?"],
  },
  {
    id: "aid", tone: "var(--c-green)",
    cat: ["Legal aid and access to justice", "विधिक सहायता और न्याय तक पहुँच", "ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਅਤੇ ਨਿਆਂ ਤੱਕ ਪਹੁੰਚ"],
    law: "Legal Services Authorities Act, 1987 (Act No. 39 of 1987) | Article 39A",
    title: ["How to get a free government lawyer", "सरकारी निःशुल्क वकील कैसे पाएँ", "ਸਰਕਾਰੀ ਮੁਫ਼ਤ ਵਕੀਲ ਕਿਵੇਂ ਲਈਏ"],
    desc: ["The procedure to access free representation and court-fee exemption through NALSA.", "नालसा के ज़रिए निःशुल्क प्रतिनिधित्व और अदालती शुल्क छूट पाने की प्रक्रिया।", "ਨਾਲਸਾ ਰਾਹੀਂ ਮੁਫ਼ਤ ਪ੍ਰਤੀਨਿਧਤਾ ਅਤੇ ਅਦਾਲਤੀ ਫੀਸ ਛੋਟ ਲੈਣ ਦੀ ਪ੍ਰਕਿਰਿਆ।"],
    rights: [
      ["Section 12 lists who qualifies, including women, children, SC/ST members and persons in custody.", "धारा 12 में पात्र लोग बताए गए हैं, जैसे महिलाएँ, बच्चे, अनुसूचित जाति/जनजाति के सदस्य और हिरासत में व्यक्ति।", "ਧਾਰਾ 12 ਵਿੱਚ ਯੋਗ ਲੋਕ ਦੱਸੇ ਗਏ ਹਨ, ਜਿਵੇਂ ਔਰਤਾਂ, ਬੱਚੇ, ਅਨੁਸੂਚਿਤ ਜਾਤੀ/ਜਨਜਾਤੀ ਦੇ ਮੈਂਬਰ ਅਤੇ ਹਿਰਾਸਤ ਵਿੱਚ ਵਿਅਕਤੀ।"],
      ["A panel lawyer is paid by the State, not by you.", "पैनल वकील का भुगतान राज्य करता है, आप नहीं।", "ਪੈਨਲ ਵਕੀਲ ਦਾ ਭੁਗਤਾਨ ਰਾਜ ਕਰਦਾ ਹੈ, ਤੁਸੀਂ ਨਹੀਂ।"],
      ["Court fees and other charges can be waived.", "अदालती शुल्क और अन्य खर्च माफ़ हो सकते हैं।", "ਅਦਾਲਤੀ ਫੀਸ ਅਤੇ ਹੋਰ ਖਰਚੇ ਮਾਫ਼ ਹੋ ਸਕਦੇ ਹਨ।"],
      ["Others qualify if their income is below the limit set by their State.", "अन्य लोग तब पात्र हैं जब उनकी आय राज्य द्वारा तय सीमा से कम हो।", "ਹੋਰ ਲੋਕ ਯੋਗ ਹਨ ਜੇ ਉਨ੍ਹਾਂ ਦੀ ਆਮਦਨ ਰਾਜ ਦੁਆਰਾ ਤੈਅ ਸੀਮਾ ਤੋਂ ਘੱਟ ਹੋਵੇ।"],
    ],
    steps: [
      ["Call 15100 or visit your District Legal Services Authority (DLSA) or Taluk Legal Services Committee.", "15100 पर कॉल करें या अपने ज़िला विधिक सेवा प्राधिकरण (डीएलएसए) या तालुक विधिक सेवा समिति जाएँ।", "15100 'ਤੇ ਕਾਲ ਕਰੋ ਜਾਂ ਆਪਣੇ ਜ਼ਿਲ੍ਹਾ ਕਾਨੂੰਨੀ ਸੇਵਾਵਾਂ ਅਥਾਰਟੀ (ਡੀਐਲਐਸਏ) ਜਾਂ ਤਾਲੁਕਾ ਕਮੇਟੀ ਜਾਓ।"],
      ["Carry an ID and proof of your category, such as a caste, disability or income certificate.", "पहचान पत्र और अपनी श्रेणी का प्रमाण (जाति, दिव्यांगता या आय प्रमाण पत्र) साथ रखिए।", "ਪਛਾਣ ਪੱਤਰ ਅਤੇ ਆਪਣੀ ਸ਼੍ਰੇਣੀ ਦਾ ਸਬੂਤ (ਜਾਤੀ, ਅਪੰਗਤਾ ਜਾਂ ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ) ਨਾਲ ਰੱਖੋ।"],
      ["Submit the application. You can also apply online through the NALSA website.", "आवेदन जमा कीजिए। आप नालसा की वेबसाइट से ऑनलाइन भी आवेदन कर सकते हैं।", "ਅਰਜ਼ੀ ਜਮ੍ਹਾਂ ਕਰੋ। ਤੁਸੀਂ ਨਾਲਸਾ ਦੀ ਵੈੱਬਸਾਈਟ ਰਾਹੀਂ ਆਨਲਾਈਨ ਵੀ ਅਰਜ਼ੀ ਦੇ ਸਕਦੇ ਹੋ।"],
      ["A panel lawyer is assigned to your case.", "आपके मामले के लिए पैनल वकील नियुक्त किया जाता है।", "ਤੁਹਾਡੇ ਮਾਮਲੇ ਲਈ ਪੈਨਲ ਵਕੀਲ ਨਿਯੁਕਤ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।"],
    ],
    ask: ["Who is eligible for a free government advocate under Section 12?", "धारा 12 के तहत निःशुल्क सरकारी वकील के लिए कौन पात्र है?", "ਧਾਰਾ 12 ਅਧੀਨ ਮੁਫ਼ਤ ਸਰਕਾਰੀ ਵਕੀਲ ਲਈ ਕੌਣ ਯੋਗ ਹੈ?"],
  },
  {
    id: "rti", tone: "var(--c-gold)",
    cat: ["Transparency and citizen governance", "पारदर्शिता और नागरिक शासन", "ਪਾਰਦਰਸ਼ਤਾ ਅਤੇ ਨਾਗਰਿਕ ਸ਼ਾਸਨ"],
    law: "The Right to Information Act, 2005 (Act No. 22 of 2005)",
    title: ["How to file an RTI application", "आरटीआई आवेदन कैसे करें", "ਆਰਟੀਆਈ ਅਰਜ਼ੀ ਕਿਵੇਂ ਕਰੀਏ"],
    desc: ["Ask a public authority for information, and appeal if you do not get it.", "सरकारी निकाय से जानकारी माँगिए, और न मिले तो अपील कीजिए।", "ਸਰਕਾਰੀ ਸੰਸਥਾ ਤੋਂ ਜਾਣਕਾਰੀ ਮੰਗੋ, ਅਤੇ ਨਾ ਮਿਲੇ ਤਾਂ ਅਪੀਲ ਕਰੋ।"],
    rights: [
      ["Every citizen can request information from a public authority.", "हर नागरिक सरकारी निकाय से जानकारी माँग सकता है।", "ਹਰ ਨਾਗਰਿਕ ਸਰਕਾਰੀ ਸੰਸਥਾ ਤੋਂ ਜਾਣਕਾਰੀ ਮੰਗ ਸਕਦਾ ਹੈ।"],
      ["The reply is due within 30 days (48 hours if life or liberty is involved).", "उत्तर 30 दिन में मिलना चाहिए (जीवन या स्वतंत्रता का मामला हो तो 48 घंटे)।", "ਜਵਾਬ 30 ਦਿਨਾਂ ਵਿੱਚ ਮਿਲਣਾ ਚਾਹੀਦਾ ਹੈ (ਜੀਵਨ ਜਾਂ ਆਜ਼ਾਦੀ ਦਾ ਮਾਮਲਾ ਹੋਵੇ ਤਾਂ 48 ਘੰਟੇ)।"],
      ["Applicants below the poverty line pay no fee.", "गरीबी रेखा से नीचे के आवेदकों से कोई शुल्क नहीं लिया जाता।", "ਗਰੀਬੀ ਰੇਖਾ ਤੋਂ ਹੇਠਾਂ ਵਾਲੇ ਬਿਨੈਕਾਰਾਂ ਤੋਂ ਕੋਈ ਫੀਸ ਨਹੀਂ ਲਈ ਜਾਂਦੀ।"],
      ["You can appeal if you get no reply or are not satisfied.", "उत्तर न मिले या संतुष्टि न हो तो आप अपील कर सकते हैं।", "ਜਵਾਬ ਨਾ ਮਿਲੇ ਜਾਂ ਸੰਤੁਸ਼ਟੀ ਨਾ ਹੋਵੇ ਤਾਂ ਤੁਸੀਂ ਅਪੀਲ ਕਰ ਸਕਦੇ ਹੋ।"],
    ],
    steps: [
      ["Address the Public Information Officer (PIO) of the department that holds the information.", "जिस विभाग के पास जानकारी है, उसके जन सूचना अधिकारी (PIO) को संबोधित कीजिए।", "ਜਿਸ ਵਿਭਾਗ ਕੋਲ ਜਾਣਕਾਰੀ ਹੈ, ਉਸਦੇ ਜਨ ਸੂਚਨਾ ਅਧਿਕਾਰੀ (PIO) ਨੂੰ ਸੰਬੋਧਨ ਕਰੋ।"],
      ["Write clear, specific questions and pay the application fee (Rs 10 for central bodies).", "स्पष्ट, विशिष्ट प्रश्न लिखिए और आवेदन शुल्क दीजिए (केंद्रीय निकायों के लिए 10 रुपये)।", "ਸਪੱਸ਼ਟ, ਖਾਸ ਸਵਾਲ ਲਿਖੋ ਅਤੇ ਅਰਜ਼ੀ ਫੀਸ ਦਿਓ (ਕੇਂਦਰੀ ਸੰਸਥਾਵਾਂ ਲਈ 10 ਰੁਪਏ)।"],
      ["Central departments accept applications online at rtionline.gov.in.", "केंद्रीय विभाग rtionline.gov.in पर ऑनलाइन आवेदन लेते हैं।", "ਕੇਂਦਰੀ ਵਿਭਾਗ rtionline.gov.in 'ਤੇ ਆਨਲਾਈਨ ਅਰਜ਼ੀ ਲੈਂਦੇ ਹਨ।"],
      ["No reply or unhappy? File a first appeal within 30 days, then a second appeal to the Information Commission.", "उत्तर न मिले या असंतुष्ट हों? 30 दिन में प्रथम अपील करें, फिर सूचना आयोग में द्वितीय अपील।", "ਜਵਾਬ ਨਾ ਮਿਲੇ ਜਾਂ ਅਸੰਤੁਸ਼ਟ ਹੋ? 30 ਦਿਨਾਂ ਵਿੱਚ ਪਹਿਲੀ ਅਪੀਲ ਕਰੋ, ਫਿਰ ਸੂਚਨਾ ਕਮਿਸ਼ਨ ਕੋਲ ਦੂਜੀ ਅਪੀਲ।"],
    ],
    ask: ["What is the maximum time for an officer to respond under the RTI Act?", "आरटीआई एक्ट में अधिकारी को उत्तर देने की अधिकतम समय सीमा क्या है?", "ਆਰਟੀਆਈ ਐਕਟ ਵਿੱਚ ਅਧਿਕਾਰੀ ਨੂੰ ਜਵਾਬ ਦੇਣ ਦੀ ਵੱਧ ਤੋਂ ਵੱਧ ਸਮਾਂ ਸੀਮਾ ਕੀ ਹੈ?"],
  },
  {
    id: "consumer", tone: "var(--c-purple)",
    cat: ["Consumer rights", "उपभोक्ता अधिकार", "ਖਪਤਕਾਰ ਅਧਿਕਾਰ"],
    law: "Consumer Protection Act, 2019 (Act No. 35 of 2019)",
    title: ["How to file a consumer complaint", "उपभोक्ता शिकायत कैसे दर्ज करें", "ਖਪਤਕਾਰ ਸ਼ਿਕਾਇਤ ਕਿਵੇਂ ਦਰਜ ਕਰੀਏ"],
    desc: ["From keeping proof to filing online with the Consumer Commission.", "सबूत सँभालने से लेकर उपभोक्ता आयोग में ऑनलाइन शिकायत तक।", "ਸਬੂਤ ਸੰਭਾਲਣ ਤੋਂ ਲੈ ਕੇ ਖਪਤਕਾਰ ਕਮਿਸ਼ਨ ਵਿੱਚ ਆਨਲਾਈਨ ਸ਼ਿਕਾਇਤ ਤੱਕ।"],
    rights: [
      ["You can seek a refund, repair, replacement or compensation for defective goods or deficient service.", "खराब सामान या कमी वाली सेवा पर रिफंड, मरम्मत, बदलाव या मुआवज़ा माँग सकते हैं।", "ਖ਼ਰਾਬ ਸਮਾਨ ਜਾਂ ਘਟੀਆ ਸੇਵਾ 'ਤੇ ਰਿਫੰਡ, ਮੁਰੰਮਤ, ਬਦਲੀ ਜਾਂ ਮੁਆਵਜ਼ਾ ਮੰਗ ਸਕਦੇ ਹੋ।"],
      ["Misleading advertisements and unfair trade practices can be challenged.", "भ्रामक विज्ञापनों और अनुचित व्यापार प्रथाओं को चुनौती दी जा सकती है।", "ਗੁੰਮਰਾਹਕੁਨ ਇਸ਼ਤਿਹਾਰਾਂ ਅਤੇ ਅਣਉਚਿਤ ਵਪਾਰਕ ਤਰੀਕਿਆਂ ਨੂੰ ਚੁਣੌਤੀ ਦਿੱਤੀ ਜਾ ਸਕਦੀ ਹੈ।"],
      ["A complaint is generally filed within two years of the problem arising.", "आमतौर पर समस्या होने के दो साल के भीतर शिकायत दर्ज करनी होती है।", "ਆਮ ਤੌਰ 'ਤੇ ਸਮੱਸਿਆ ਹੋਣ ਦੇ ਦੋ ਸਾਲਾਂ ਵਿੱਚ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਨੀ ਹੁੰਦੀ ਹੈ।"],
    ],
    steps: [
      ["Keep the bill, warranty card, photos and messages as proof.", "बिल, वारंटी कार्ड, फ़ोटो और संदेश सबूत के तौर पर रखिए।", "ਬਿੱਲ, ਵਾਰੰਟੀ ਕਾਰਡ, ਫੋਟੋਆਂ ਅਤੇ ਸੁਨੇਹੇ ਸਬੂਤ ਵਜੋਂ ਰੱਖੋ।"],
      ["Complain to the seller or company in writing, or call the helpline 1915.", "विक्रेता या कंपनी को लिखित शिकायत कीजिए, या हेल्पलाइन 1915 पर कॉल कीजिए।", "ਵਿਕਰੇਤਾ ਜਾਂ ਕੰਪਨੀ ਨੂੰ ਲਿਖਤੀ ਸ਼ਿਕਾਇਤ ਕਰੋ, ਜਾਂ ਹੈਲਪਲਾਈਨ 1915 'ਤੇ ਕਾਲ ਕਰੋ।"],
      ["If nothing happens, send a written notice stating exactly what you want.", "कुछ न हो तो लिखित नोटिस भेजिए जिसमें साफ़ लिखा हो कि आप क्या चाहते हैं।", "ਕੁਝ ਨਾ ਹੋਵੇ ਤਾਂ ਲਿਖਤੀ ਨੋਟਿਸ ਭੇਜੋ ਜਿਸ ਵਿੱਚ ਸਾਫ਼ ਲਿਖਿਆ ਹੋਵੇ ਕਿ ਤੁਸੀਂ ਕੀ ਚਾਹੁੰਦੇ ਹੋ।"],
      ["File with the District Consumer Commission, online through e-Daakhil.", "ई-दाखिल के ज़रिए ज़िला उपभोक्ता आयोग में ऑनलाइन शिकायत दर्ज कीजिए।", "ਈ-ਦਾਖਲ ਰਾਹੀਂ ਜ਼ਿਲ੍ਹਾ ਖਪਤਕਾਰ ਕਮਿਸ਼ਨ ਵਿੱਚ ਆਨਲਾਈਨ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ।"],
    ],
    ask: ["How do I file a consumer complaint?", "उपभोक्ता शिकायत कैसे दर्ज करूँ?", "ਖਪਤਕਾਰ ਸ਼ਿਕਾਇਤ ਕਿਵੇਂ ਦਰਜ ਕਰਾਂ?"],
  },
  {
    id: "cyber", tone: "var(--c-blue)",
    cat: ["Cyber safety", "साइबर सुरक्षा", "ਸਾਈਬਰ ਸੁਰੱਖਿਆ"],
    law: "Information Technology Act, 2000 | Bharatiya Nyaya Sanhita, 2023",
    title: ["What to do after an online fraud", "ऑनलाइन धोखाधड़ी के बाद क्या करें", "ਆਨਲਾਈਨ ਧੋਖਾਧੜੀ ਤੋਂ ਬਾਅਦ ਕੀ ਕਰੀਏ"],
    desc: ["Speed matters. Report within minutes if you can.", "गति मायने रखती है। हो सके तो कुछ ही मिनटों में शिकायत करें।", "ਗਤੀ ਮਾਇਨੇ ਰੱਖਦੀ ਹੈ। ਹੋ ਸਕੇ ਤਾਂ ਕੁਝ ਮਿੰਟਾਂ ਵਿੱਚ ਸ਼ਿਕਾਇਤ ਕਰੋ।"],
    rights: [],
    steps: [
      ["Call 1930 at once. The sooner you report, the better the chance of freezing the transfer.", "तुरंत 1930 पर कॉल करें। जितनी जल्दी शिकायत, पैसा रुकने की संभावना उतनी बेहतर।", "ਤੁਰੰਤ 1930 'ਤੇ ਕਾਲ ਕਰੋ। ਜਿੰਨੀ ਜਲਦੀ ਸ਼ਿਕਾਇਤ, ਪੈਸਾ ਰੁਕਣ ਦੀ ਸੰਭਾਵਨਾ ਓਨੀ ਬਿਹਤਰ।"],
      ["Tell your bank to block the card or account and note the complaint number.", "बैंक से कार्ड या खाता ब्लॉक कराइए और शिकायत संख्या लिख लीजिए।", "ਬੈਂਕ ਨੂੰ ਕਾਰਡ ਜਾਂ ਖਾਤਾ ਬਲਾਕ ਕਰਨ ਲਈ ਕਹੋ ਅਤੇ ਸ਼ਿਕਾਇਤ ਨੰਬਰ ਲਿਖ ਲਓ।"],
      ["File a report at cybercrime.gov.in with screenshots, transaction IDs and phone numbers.", "cybercrime.gov.in पर स्क्रीनशॉट, लेनदेन आईडी और फ़ोन नंबर के साथ शिकायत दर्ज कीजिए।", "cybercrime.gov.in 'ਤੇ ਸਕ੍ਰੀਨਸ਼ਾਟ, ਲੈਣ-ਦੇਣ ਆਈਡੀ ਅਤੇ ਫ਼ੋਨ ਨੰਬਰਾਂ ਨਾਲ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ।"],
    ],
    ask: ["What should I do if I lose money in an online fraud?", "ऑनलाइन धोखाधड़ी में पैसा गँवाने पर क्या करूँ?", "ਆਨਲਾਈਨ ਧੋਖਾਧੜੀ ਵਿੱਚ ਪੈਸੇ ਗੁਆਉਣ 'ਤੇ ਕੀ ਕਰਾਂ?"],
  },
];

export default function CitizenHub() {
  const { tr } = useLang();
  const nav = useNavigate();
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-6">
      <section className="hero-bg card card-accent card-raised px-5 py-8 sm:px-10">
        <span className="tone-badge rise" style={{ "--tone": "var(--c-gold)" }}>
          <BookOpen size={12} />
          {tr("Citizen legal empowerment handbooks", "नागरिक कानूनी सशक्तिकरण मार्गदर्शिकाएँ", "ਨਾਗਰਿਕ ਕਾਨੂੰਨੀ ਸਸ਼ਕਤੀਕਰਨ ਗਾਈਡਾਂ")}
        </span>
        <h1 className="rise mt-3 text-3xl font-bold sm:text-4xl" style={{ animationDelay: "60ms" }}>
          {tr("Plain-language citizen rights handbooks", "सरल भाषा में नागरिक अधिकार मार्गदर्शिकाएँ", "ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ ਨਾਗਰਿਕ ਅਧਿਕਾਰ ਗਾਈਡਾਂ")}
        </h1>
        <p className="rise mt-2 max-w-2xl text-muted" style={{ animationDelay: "120ms" }}>
          {tr(
            "Actionable guides for everyday legal situations. Tap a handbook to open it. Opening one closes the previous one.",
            "रोज़मर्रा की कानूनी स्थितियों के लिए व्यावहारिक मार्गदर्शिकाएँ। खोलने के लिए दबाइए। एक खुलने पर पिछली बंद हो जाती है।",
            "ਰੋਜ਼ਮਰ੍ਹਾ ਦੇ ਕਾਨੂੰਨੀ ਹਾਲਾਤਾਂ ਲਈ ਵਿਹਾਰਕ ਗਾਈਡ। ਖੋਲ੍ਹਣ ਲਈ ਦਬਾਓ। ਇੱਕ ਖੁੱਲ੍ਹਣ 'ਤੇ ਪਿਛਲੀ ਬੰਦ ਹੋ ਜਾਂਦੀ ਹੈ।"
          )}
        </p>
      </section>

      <div className="space-y-4">
        {BOOKS.map((b, i) => {
          const isOpen = open === b.id;
          return (
            <article
              key={b.id}
              className={"card acc zoom-hover-sm rise " + (isOpen ? "acc-open" : "")}
              style={{ "--tone": b.tone, animationDelay: i * 70 + "ms" }}
            >
              <button
                type="button"
                className="acc-head"
                aria-expanded={isOpen}
                aria-controls={"hb-" + b.id}
                onClick={() => setOpen(isOpen ? null : b.id)}
              >
                <span className="min-w-0 flex-1">
                  <span className="tone-badge">{tr(...b.cat)}</span>
                  <span className="mono-line mt-2 block">{b.law}</span>
                  <span className={"font-display mt-1 block text-xl font-bold " + (isOpen ? "text-accent" : "")}>
                    {tr(...b.title)}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{tr(...b.desc)}</span>
                </span>
                <span className="acc-chev">
                  <ChevronDown size={18} />
                </span>
              </button>

              <div id={"hb-" + b.id} className={"acc-body " + (isOpen ? "open" : "")}>
                <div>
                  <div className="acc-inner">
                    {b.rights.length > 0 && (
                      <>
                        <h3 className="eyebrow flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          {tr("Your legal rights under the law", "कानून के तहत आपके अधिकार", "ਕਾਨੂੰਨ ਅਧੀਨ ਤੁਹਾਡੇ ਅਧਿਕਾਰ")}
                        </h3>
                        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                          {b.rights.map((r, k) => (
                            <div key={k} className="check-item">
                              <CheckCircle2 size={16} className="mt-0.5 shrink-0 tone-text" />
                              <span>{tr(...r)}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <h3 className="eyebrow mt-5">
                      {tr("What to do, step by step", "क्या करें, चरण-दर-चरण", "ਕੀ ਕਰੀਏ, ਕਦਮ-ਦਰ-ਕਦਮ")}
                    </h3>
                    <ol className="mt-3 space-y-3">
                      {b.steps.map((s, k) => (
                        <li key={k} className="flex gap-3">
                          <span className="btn-primary grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold">
                            {k + 1}
                          </span>
                          <p className="pt-0.5 text-sm">{tr(...s)}</p>
                        </li>
                      ))}
                    </ol>

                    <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => nav("/assistant", { state: { q: tr(...b.ask) } })}
                      >
                        <Sparkles size={14} />
                        {tr("Ask the AI about this", "इस बारे में एआई से पूछें", "ਇਸ ਬਾਰੇ ਏਆਈ ਤੋਂ ਪੁੱਛੋ")}
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => nav("/legal-aid")}>
                        <HeartHandshake size={14} />
                        {tr("Check free legal aid", "निःशुल्क विधिक सहायता जाँचें", "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਜਾਂਚੋ")}
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-muted">
                      {tr(
                        "General information, not legal advice.",
                        "यह सामान्य जानकारी है, कानूनी सलाह नहीं।",
                        "ਇਹ ਆਮ ਜਾਣਕਾਰੀ ਹੈ, ਕਾਨੂੰਨੀ ਸਲਾਹ ਨਹੀਂ।"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}