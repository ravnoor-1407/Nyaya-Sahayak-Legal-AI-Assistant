import csv
import json

BNS = "Bharatiya Nyaya Sanhita, 2023"
BNSS = "Bharatiya Nagarik Suraksha Sanhita, 2023"
BSA = "Bharatiya Sakshya Adhiniyam, 2023"
CON = "Constitution of India"
IT = "Information Technology Act, 2000"
CPA = "Consumer Protection Act, 2019"

# (question, expected_act, expected_section, lang, in_scope)
ROWS = [
    # ---- English, BNS ----
    ("What is the punishment for theft?", BNS, "303", "en", 1),
    ("What is the punishment for robbery?", BNS, "309", "en", 1),
    ("What is dacoity?", BNS, "310", "en", 1),
    ("What is the punishment for murder?", BNS, "103", "en", 1),
    ("What is culpable homicide not amounting to murder?", BNS, "105", "en", 1),
    ("What is the punishment for cheating?", BNS, "318", "en", 1),
    ("What is the punishment for rape?", BNS, "64", "en", 1),
    ("What is the punishment for sexual harassment?", BNS, "75", "en", 1),
    ("What is the punishment for stalking?", BNS, "78", "en", 1),
    ("What is the punishment for defamation?", BNS, "356", "en", 1),
    ("What is the punishment for criminal intimidation?", BNS, "351", "en", 1),
    ("What is the punishment for extortion?", BNS, "308", "en", 1),
    ("What is cruelty by husband or relatives of the husband?", BNS, "85", "en", 1),
    ("What is dowry death?", BNS, "80", "en", 1),
    ("What is the punishment for abetment of suicide?", BNS, "108", "en", 1),
    ("What is criminal breach of trust?", BNS, "316", "en", 1),
    ("What is the punishment for causing grievous hurt?", BNS, "117", "en", 1),
    ("What is the punishment for causing death by negligence?", BNS, "106", "en", 1),
    ("What is criminal trespass?", BNS, "329", "en", 1),
    ("What is mischief under BNS?", BNS, "324", "en", 1),
    ("What does Section 303 of BNS say?", BNS, "303", "en", 1),
    # ---- Constitution ----
    ("What does Article 21 guarantee?", CON, "21", "en", 1),
    ("What does Article 14 say about equality?", CON, "14", "en", 1),
    ("What is the right to freedom of speech under the Constitution?", CON, "19", "en", 1),
    ("Which article protects against arrest and detention?", CON, "22", "en", 1),
    ("Which article abolishes untouchability?", CON, "17", "en", 1),
    ("Which article gives the right to constitutional remedies?", CON, "32", "en", 1),
    ("Which article prohibits child labour in factories?", CON, "24", "en", 1),
    ("Which article provides free legal aid?", CON, "39A", "en", 1),
    # ---- BNSS, BSA ----
    ("How is an FIR registered for a cognizable offence?", BNSS, "173", "en", 1),
    ("When can police arrest without a warrant?", BNSS, "35", "en", 1),
    ("Is an electronic record admissible as evidence?", BSA, "63", "en", 1),
    # ---- IT Act, Consumer Act ----
    ("What is the punishment for identity theft online?", IT, "66C", "en", 1),
    ("What is the punishment for cheating by personation using a computer?", IT, "66D", "en", 1),
    ("What is the punishment for violating privacy by publishing private images?", IT, "66E", "en", 1),
    ("What is the punishment for publishing obscene material electronically?", IT, "67", "en", 1),
    ("How do I file a complaint before the District Consumer Commission?", CPA, "35", "en", 1),
    ("What is the time limit for filing a consumer complaint?", CPA, "69", "en", 1),
    # ---- Hindi ----
    ("चोरी की सज़ा क्या है?", BNS, "303", "hi", 1),
    ("लूट की सज़ा क्या है?", BNS, "309", "hi", 1),
    ("हत्या की सज़ा क्या है?", BNS, "103", "hi", 1),
    ("धोखाधड़ी की सज़ा क्या है?", BNS, "318", "hi", 1),
    ("मानहानि की सज़ा क्या है?", BNS, "356", "hi", 1),
    ("बीएनएस की धारा 303 क्या कहती है?", BNS, "303", "hi", 1),
    ("संविधान का अनुच्छेद 21 क्या कहता है?", CON, "21", "hi", 1),
    ("एफआईआर कैसे दर्ज की जाती है?", BNSS, "173", "hi", 1),
    # ---- Punjabi ----
    ("ਚੋਰੀ ਦੀ ਸਜ਼ਾ ਕੀ ਹੈ?", BNS, "303", "pa", 1),
    ("ਕਤਲ ਦੀ ਸਜ਼ਾ ਕੀ ਹੈ?", BNS, "103", "pa", 1),
    ("ਧੋਖਾਧੜੀ ਦੀ ਸਜ਼ਾ ਕੀ ਹੈ?", BNS, "318", "pa", 1),
    ("ਪਿੱਛਾ ਕਰਨ ਦੀ ਸਜ਼ਾ ਕੀ ਹੈ?", BNS, "78", "pa", 1),
    ("ਸੰਵਿਧਾਨ ਦਾ ਅਨੁਛੇਦ 14 ਕੀ ਕਹਿੰਦਾ ਹੈ?", CON, "14", "pa", 1),
    ("ਸੰਵਿਧਾਨ ਦਾ ਅਨੁਛੇਦ 21 ਕੀ ਕਹਿੰਦਾ ਹੈ?", CON, "21", "pa", 1),
    # ---- Out of scope (should be refused) ----
    ("Who won the cricket world cup?", "", "", "en", 0),
    ("What is the best pizza recipe?", "", "", "en", 0),
    ("What is the weather in Delhi today?", "", "", "en", 0),
    ("Write a Python program to reverse a string.", "", "", "en", 0),
    ("Which phone should I buy under 20000 rupees?", "", "", "en", 0),
    ("भारत ने क्रिकेट विश्व कप कब जीता?", "", "", "hi", 0),
    ("सबसे अच्छी बिरयानी कैसे बनाएं?", "", "", "hi", 0),
    ("ਸਭ ਤੋਂ ਵਧੀਆ ਪੀਜ਼ਾ ਰੈਸਿਪੀ ਕੀ ਹੈ?", "", "", "pa", 0),
    ("ਅੱਜ ਮੌਸਮ ਕਿਵੇਂ ਹੈ?", "", "", "pa", 0),
]

with open("data/eval.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["question", "expected_act", "expected_section", "lang", "in_scope"])
    w.writerows(ROWS)
print("Wrote", len(ROWS), "rows to data/eval.csv")

# ---- Check each expected section exists in YOUR data, and show what it is ----
chunks = [json.loads(l) for l in open("data/processed/chunks.jsonl", encoding="utf-8")]
first = {}
for c in chunks:
    first.setdefault((c["act"], c["section"]), c)

print("\nVERIFY these against indiacode.nic.in (first 80 characters of each):\n")
seen = set()
for q, act, sec, lang, ins in ROWS:
    if not ins or (act, sec) in seen:
        continue
    seen.add((act, sec))
    c = first.get((act, sec))
    if c is None:
        print(f"MISSING  {act} {sec}   <- not in your data")
    else:
        snippet = (c["title"] + " | " + c["text"]).replace("\n", " ")[:80]
        print(f"ok       {act.split(',')[0]} {sec}: {snippet}")