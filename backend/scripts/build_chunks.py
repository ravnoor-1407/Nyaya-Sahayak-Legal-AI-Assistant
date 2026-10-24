import json
import re
from pathlib import Path

import pandas as pd
import pdfplumber

RAW = Path("data/raw")
OUT = Path("data/processed")
OUT.mkdir(parents=True, exist_ok=True)
INDIA_CODE = "https://www.indiacode.nic.in"

# Leave *_col as None to auto-detect. Set exact names if detection is wrong.
SOURCES = [
       dict(kind="csv", file="bns.csv",
         act="Bharatiya Nyaya Sanhita, 2023", unit="Section",
         category="criminal", year=2023, url=INDIA_CODE,
         sec_col="Section", title_col="Section _name",
         text_col="Description"),
       dict(kind="pdf", file="constitution.pdf",
         act="Constitution of India", unit="Article",
         category="constitutional", year=1950,
         url="https://legislative.gov.in"),
    dict(kind="pdf", file="bnss.pdf",
         act="Bharatiya Nagarik Suraksha Sanhita, 2023", unit="Section",
         category="criminal", year=2023, url=INDIA_CODE),
    dict(kind="pdf", file="bsa.pdf",
         act="Bharatiya Sakshya Adhiniyam, 2023", unit="Section",
         category="evidence", year=2023, url=INDIA_CODE),
    dict(kind="pdf", file="it_act.pdf",
         act="Information Technology Act, 2000", unit="Section",
         category="cyber", year=2000, url=INDIA_CODE),
    dict(kind="pdf", file="consumer_act.pdf",
         act="Consumer Protection Act, 2019", unit="Section",
         category="consumer", year=2019, url=INDIA_CODE),
]

MAPPING = dict(file="ipc_bns_map.csv", ipc_col="IPC_Section",
               title_col="IPC_Title", bns_col="BNS_Section")

MAX_CHARS = 1500
SEC = re.compile(r"^\s*(\d{1,3}[A-Z]{0,2})\.\s+([A-Z][^\n]{2,140})", re.M)


def split_long(text, n=MAX_CHARS):
    if len(text) <= n:
        return [text]
    parts, cur = [], ""
    for line in text.split("\n"):
        if len(cur) + len(line) > n and cur:
            parts.append(cur.strip())
            cur = ""
        cur += line + "\n"
    if cur.strip():
        parts.append(cur.strip())
    return parts


def clean_text(t):
    return str(t).replace("\r\n", "\n").replace("\r", "\n").strip()


def clean_section(v):
    v = str(v).strip()
    v = re.sub(r"(?i)^(section|sec\.?)\s*", "", v)
    return v.strip(" .")


def pick(df, given, keywords, avoid=()):
    if given and given in df.columns:
        return given
    for kw in keywords:
        for c in df.columns:
            lc = c.lower()
            if kw in lc and not any(a in lc for a in avoid):
                return c
    return None


def csv_chunks(s):
    path = RAW / s["file"]
    df = pd.read_csv(path, dtype=str, encoding_errors="ignore").fillna("")
    print("CSV columns found:", list(df.columns))
    sec_c = pick(df, s.get("sec_col"),
                 ["section", "sec", "number", "no"],
                 avoid=("name", "title", "desc"))
    title_c = pick(df, s.get("title_col"),
                   ["title", "name", "heading", "offence", "offense"])
    text_c = pick(df, s.get("text_col"),
                  ["description", "text", "content", "provision",
                   "punishment", "details"])
    print("Using -> section:", sec_c, "| title:", title_c, "| text:", text_c)
    if not sec_c or not text_c:
        raise SystemExit("Could not detect columns. Set them in SOURCES.")
    out = []
    for _, r in df.iterrows():
        text = clean_text(r[text_c])
        if len(text) < 20:
            continue
        title = clean_text(r[title_c]) if title_c else ""
        out.append(dict(act=s["act"], unit=s["unit"],
                        section=clean_section(r[sec_c]),
                        title=title, text=text,
                        category=s["category"], year=s["year"],
                        source_url=s["url"]))
    return out


def pdf_chunks(s):
    p = RAW / s["file"]
    if not p.exists():
        print("SKIPPED (file not found):", s["file"])
        return []
    with pdfplumber.open(p) as pdf:
        text = "\n".join((pg.extract_text() or "") for pg in pdf.pages)
    text = re.sub(r"\n{2,}", "\n", text)
    ms = list(SEC.finditer(text))
    out, seen = [], set()
    for i, m in enumerate(ms):
        end = ms[i + 1].start() if i + 1 < len(ms) else len(text)
        body = text[m.start():end].strip()
        if len(body) < 80 or body.count("....") > 3:
            continue
        if m.group(1) in seen:
            continue
        seen.add(m.group(1))
        title = m.group(2).strip(" .—-")[:100]
        for part in split_long(body):
            out.append(dict(act=s["act"], unit=s["unit"],
                            section=m.group(1), title=title, text=part,
                            category=s["category"], year=s["year"],
                            source_url=s["url"]))
    return out


def mapping_chunks(m):
    p = RAW / m["file"]
    if not p.exists():
        print("IPC mapping file not found, skipping.")
        return []
    df = pd.read_csv(p, dtype=str, encoding_errors="ignore").fillna("")
    need = ("ipc_col", "title_col", "bns_col")
    if not all(m[k] in df.columns for k in need):
        print("Mapping columns differ. Found:", list(df.columns))
        print("Update MAPPING in build_chunks.py. Skipping mapping.")
        return []
    out = []
    for _, r in df.iterrows():
        ipc = r[m["ipc_col"]]
        ttl = r[m["title_col"]]
        bns = r[m["bns_col"]]
        txt = ("IPC Section " + ipc + " (" + ttl + ") now corresponds to "
               "Bharatiya Nyaya Sanhita (BNS) Section " + bns + ".")
        out.append(dict(act="IPC to BNS Mapping", unit="IPC Section",
                        section=clean_section(ipc), title=ttl, text=txt,
                        category="criminal", year=2023,
                        source_url=INDIA_CODE))
    return out

def enrich_titles(chunks):
    """Give BNS sections a heading using the IPC titles from the mapping."""
    titles = {}
    for c in chunks:
        if c["act"] != "IPC to BNS Mapping":
            continue
        m = re.search(r"\(BNS\) Section (.+?)\.?$", c["text"])
        if not m:
            continue
        rest = re.sub(r"\([^)]*\)", "", m.group(1))
        for num in re.findall(r"\b\d{1,3}[A-Z]{0,2}\b", rest):
            lst = titles.setdefault(num, [])
            t = c["title"].strip()
            if t and t not in lst and len(lst) < 3:
                lst.append(t)
    added = 0
    for c in chunks:
        if c["act"].startswith("Bharatiya Nyaya") and not c["title"].strip():
            t = titles.get(c["section"])
            if t:
                c["title"] = "; ".join(t)
                added += 1
    print("Titles added to BNS sections from IPC mapping:", added)

if __name__ == "__main__":
    chunks = []
    for s in SOURCES:
        if s["kind"] == "csv" and not (RAW / s["file"]).exists():
            print("SKIPPED (file not found):", s["file"])
            continue
        c = csv_chunks(s) if s["kind"] == "csv" else pdf_chunks(s)
        print(s["act"] + ":", len(c), "chunks\n")
        chunks += c
    chunks += mapping_chunks(MAPPING)
    enrich_titles(chunks)
    with open(OUT / "chunks.jsonl", "w", encoding="utf-8") as f:
        for c in chunks:
            f.write(json.dumps(c, ensure_ascii=False) + "\n")
    print("TOTAL:", len(chunks))