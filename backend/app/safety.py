import re

BLOCK = [
    r"\b(evade|escape|dodge)\b.*\b(police|arrest|investigation)\b",
    r"\b(hide|destroy|tamper with|delete)\b.*\b(evidence|body|proof)\b",
    r"\b(forge|fake|counterfeit)\b.*\b(document|certificate|signature"
    r"|currency|aadhaar|passport|stamp)\b",
    r"\bget away with\b",
    r"\bbrib(e|ing)\b.*\b(police|judge|officer|official)\b",
    r"\b(make|build)\b.*\b(bomb|explosive)\b",
    r"\b(hack|steal)\b.*\b(account|password|bank|upi)\b",
    r"\b(blackmail|stalk)\b.*\b(her|him|someone|girl|woman)\b",
    r"सबूत\s*(मिटा|नष्ट)",
    r"ਸਬੂਤ\s*(ਮਿਟਾ|ਨਸ਼ਟ)",
]

SELF_HARM = [
    r"\bkill myself\b", r"\bsuicide\b", r"\bend my life\b",
    r"आत्महत्या", r"ਖੁਦਕੁਸ਼ੀ", r"ਖ਼ੁਦਕੁਸ਼ੀ",
]

DANGER = [
    r"\b(he|she|they) (is|are) (beating|hitting|attacking|following) me\b",
    r"\bi am being (attacked|beaten|followed|threatened)\b",
    r"\bkidnap",
    r"मुझे मार रहा", r"मुझे मार रही",
]

BLOCKED_MSG = {
    "en": "I can't help with that. I only give lawful, general legal "
          "information. If you need legal help, call NALSA on 15100.",
    "hi": "मैं इसमें मदद नहीं कर सकता। मैं केवल कानूनी जानकारी देता हूँ। "
          "कानूनी सहायता के लिए NALSA 15100 पर कॉल करें।",
    "pa": "ਮੈਂ ਇਸ ਵਿੱਚ ਮਦਦ ਨਹੀਂ ਕਰ ਸਕਦਾ। ਮੈਂ ਸਿਰਫ਼ ਕਾਨੂੰਨੀ ਜਾਣਕਾਰੀ ਦਿੰਦਾ ਹਾਂ। "
          "ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਲਈ NALSA 15100 'ਤੇ ਕਾਲ ਕਰੋ।",
}

SELF_HARM_MSG = {
    "en": "I'm sorry you are going through this. You are not alone. "
          "Please talk to someone now: call Tele-MANAS on 14416, or "
          "112 in an emergency.",
    "hi": "आप जिस दौर से गुज़र रहे हैं उसके लिए मुझे खेद है। आप अकेले नहीं हैं। "
          "कृपया अभी किसी से बात करें: Tele-MANAS 14416, या आपातकाल में 112।",
    "pa": "ਤੁਸੀਂ ਜਿਸ ਦੌਰ ਵਿੱਚੋਂ ਲੰਘ ਰਹੇ ਹੋ, ਉਸ ਲਈ ਮੈਨੂੰ ਅਫ਼ਸੋਸ ਹੈ। ਤੁਸੀਂ ਇਕੱਲੇ ਨਹੀਂ ਹੋ। "
          "ਕਿਰਪਾ ਕਰਕੇ ਹੁਣੇ ਕਿਸੇ ਨਾਲ ਗੱਲ ਕਰੋ: Tele-MANAS 14416, ਜਾਂ ਐਮਰਜੈਂਸੀ ਵਿੱਚ 112।",
}

DANGER_MSG = {
    "en": "**If you are in danger right now, call 112 immediately.**",
    "hi": "**यदि आप अभी खतरे में हैं, तो तुरंत 112 पर कॉल करें।**",
    "pa": "**ਜੇ ਤੁਸੀਂ ਹੁਣ ਖ਼ਤਰੇ ਵਿੱਚ ਹੋ, ਤਾਂ ਤੁਰੰਤ 112 'ਤੇ ਕਾਲ ਕਰੋ।**",
}

PII = [
    (re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b"), "[id-number]"),
    (re.compile(r"\b[6-9]\d{9}\b"), "[phone]"),
    (re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"), "[email]"),
]


def _match(patterns, text):
    return any(re.search(p, text, re.I | re.S) for p in patterns)


def check_blocked(q, lang):
    if _match(BLOCK, q):
        return BLOCKED_MSG.get(lang, BLOCKED_MSG["en"])
    return None


def self_harm(q, lang):
    if _match(SELF_HARM, q):
        return SELF_HARM_MSG.get(lang, SELF_HARM_MSG["en"])
    return None


def danger_note(q, lang):
    if _match(DANGER, q):
        return DANGER_MSG.get(lang, DANGER_MSG["en"])
    return ""


def scrub(q):
    for pattern, repl in PII:
        q = pattern.sub(repl, q)
    return q