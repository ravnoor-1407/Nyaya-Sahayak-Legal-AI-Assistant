import json
import re
from pathlib import Path
from typing import Any

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
RAW = BASE_DIR / "data" / "raw"
OUT = BASE_DIR / "data" / "processed"
OUT.mkdir(parents=True, exist_ok=True)
INDIA_CODE = "https://www.indiacode.nic.in"

# Source Definitions and Metadata
SOURCES: list[dict[str, Any]] = [
    # Core Criminal & Constitutional
    dict(
        kind="csv",
        file="bns.csv",
        act="Bharatiya Nyaya Sanhita, 2023",
        unit="Section",
        category="criminal",
        year=2023,
        url=INDIA_CODE,
        sec_col="Section",
        title_col="Section _name",
        text_col="Description",
    ),
    dict(
        kind="pdf",
        file="constitution.pdf",
        act="Constitution of India",
        unit="Article",
        category="constitutional",
        year=1950,
        url="https://legislative.gov.in",
    ),
    dict(
        kind="pdf",
        file="bnss.pdf",
        act="Bharatiya Nagarik Suraksha Sanhita, 2023",
        unit="Section",
        category="criminal",
        year=2023,
        url=INDIA_CODE,
    ),
    dict(
        kind="pdf",
        file="bsa.pdf",
        act="Bharatiya Sakshya Adhiniyam, 2023",
        unit="Section",
        category="evidence",
        year=2023,
        url=INDIA_CODE,
    ),
    dict(
        kind="pdf",
        file="it_act.pdf",
        act="Information Technology Act, 2000",
        unit="Section",
        category="cyber",
        year=2000,
        url=INDIA_CODE,
    ),
    dict(
        kind="pdf",
        file="consumer_act.pdf",
        act="Consumer Protection Act, 2019",
        unit="Section",
        category="consumer",
        year=2019,
        url=INDIA_CODE,
    ),
    # Commercial & Banking
    dict(
        kind="pdf",
        file="ni_act.pdf",
        act="Negotiable Instruments Act, 1881",
        unit="Section",
        category="commercial",
        year=1881,
        url=INDIA_CODE,
    ),
    dict(
        kind="pdf",
        file="contract_act.pdf",
        act="Indian Contract Act, 1872",
        unit="Section",
        category="commercial",
        year=1872,
        url=INDIA_CODE,
    ),
    # Civil & Property
    dict(
        kind="pdf",
        file="cpc.pdf",
        act="Code of Civil Procedure, 1908",
        unit="Section",
        category="civil",
        year=1908,
        url=INDIA_CODE,
    ),
    dict(
        kind="pdf",
        file="property_act.pdf",
        act="Transfer of Property Act, 1882",
        unit="Section",
        category="property",
        year=1882,
        url=INDIA_CODE,
    ),
    # Family & Matrimonial
    dict(
        kind="pdf",
        file="dv_act.pdf",
        act="Protection of Women from Domestic Violence Act, 2005",
        unit="Section",
        category="family",
        year=2005,
        url=INDIA_CODE,
    ),
    dict(
        kind="pdf",
        file="hindu_marriage_act.pdf",
        act="Hindu Marriage Act, 1955",
        unit="Section",
        category="family",
        year=1955,
        url=INDIA_CODE,
    ),
    # Transparency & Public Welfare
    dict(
        kind="pdf",
        file="rti_act.pdf",
        act="Right to Information Act, 2005",
        unit="Section",
        category="administrative",
        year=2005,
        url=INDIA_CODE,
    ),
    dict(
        kind="pdf",
        file="legal_services_act.pdf",
        act="Legal Services Authorities Act, 1987",
        unit="Section",
        category="legal_aid",
        year=1987,
        url=INDIA_CODE,
    ),
    # Motor Vehicles & Transport
    dict(
        kind="pdf",
        file="mv_act.pdf",
        act="Motor Vehicles Act, 1988",
        unit="Section",
        category="motor_vehicle",
        year=1988,
        url=INDIA_CODE,
    ),
    # Special Protective Laws
    dict(
        kind="pdf",
        file="posh_act.pdf",
        act="Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013",
        unit="Section",
        category="workplace_safety",
        year=2013,
        url=INDIA_CODE,
    ),
    dict(
        kind="pdf",
        file="posco_act.pdf",
        act="Protection of Children from Sexual Offences Act, 2012",
        unit="Section",
        category="child_safety",
        year=2012,
        url=INDIA_CODE,
    ),
    # Subordinate Rules & Regulations
    dict(
        kind="pdf",
        file="consumer_ecommerce_rules.pdf",
        act="Consumer Protection (E-Commerce) Rules, 2020",
        unit="Rule",
        category="consumer",
        year=2020,
        url="https://consumeraffairs.nic.in",
    ),
    dict(
        kind="pdf",
        file="it_rules_2021.pdf",
        act="Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021",
        unit="Rule",
        category="cyber",
        year=2021,
        url="https://www.meity.gov.in",
    ),
    dict(
        kind="pdf",
        file="dv_rules_2006.pdf",
        act="Protection of Women from Domestic Violence Rules, 2006",
        unit="Rule",
        category="family",
        year=2006,
        url="https://wcd.nic.in",
    ),
    dict(
        kind="pdf",
        file="rti_fee_rules.pdf",
        act="Right to Information (Regulation of Fee and Cost) Rules, 2005",
        unit="Rule",
        category="administrative",
        year=2005,
        url="https://rti.gov.in",
    ),
]

MAPPING: dict[str, str] = dict(
    file="ipc_bns_map.csv",
    ipc_col="IPC_Section",
    title_col="IPC_Title",
    bns_col="BNS_Section",
)

MAX_CHARS = 1500
SEC = re.compile(r"^\s*(\d{1,3}[A-Z]{0,2})\.\s+([A-Z][^\n]{2,140})", re.M)


def split_long(text: str, n: int = MAX_CHARS) -> list[str]:
    if len(text) <= n:
        return [text]
    parts: list[str] = []
    cur = ""
    for line in text.split("\n"):
        if len(cur) + len(line) > n and cur:
            parts.append(cur.strip())
            cur = ""
        cur += line + "\n"
    if cur.strip():
        parts.append(cur.strip())
    return parts


def clean_text(t: object) -> str:
    return str(t).replace("\r\n", "\n").replace("\r", "\n").strip()


def clean_section(v: object) -> str:
    v = str(v).strip()
    v = re.sub(r"(?i)^(section|sec\.?|rule|order)\s*", "", v)
    return v.strip(" .")


def pick(
    df: pd.DataFrame,
    given: str | None,
    keywords: list[str],
    avoid: tuple[str, ...] = (),
) -> str | None:
    if given and given in df.columns:
        return given
    for kw in keywords:
        for c in df.columns:
            lc = str(c).lower()
            if kw in lc and not any(a in lc for a in avoid):
                return str(c)
    return None


def csv_chunks(s: dict[str, Any]) -> list[dict[str, Any]]:
    path = RAW / str(s["file"])
    if not path.exists():
        print(f"SKIPPED (file not found): {s['file']}")
        return []
    df = pd.read_csv(path, dtype=str, encoding_errors="ignore").fillna("")
    sec_c = pick(
        df,
        str(s.get("sec_col")) if s.get("sec_col") is not None else None,
        ["section", "sec", "number", "no"],
        avoid=("name", "title", "desc"),
    )
    title_c = pick(
        df,
        str(s.get("title_col")) if s.get("title_col") is not None else None,
        ["title", "name", "heading", "offence", "offense"],
    )
    text_c = pick(
        df,
        str(s.get("text_col")) if s.get("text_col") is not None else None,
        ["description", "text", "content", "provision", "punishment", "details"],
    )
    if not sec_c or not text_c:
        print(f"Skipping CSV {s['file']}: columns could not be resolved.")
        return []
    out: list[dict[str, Any]] = []
    for _, r in df.iterrows():
        text = clean_text(r[text_c])
        if len(text) < 20:
            continue
        title = clean_text(r[title_c]) if title_c else ""
        out.append(
            dict(
                act=s["act"],
                unit=s["unit"],
                section=clean_section(r[sec_c]),
                title=title,
                text=text,
                category=s["category"],
                year=s["year"],
                source_url=s["url"],
            )
        )
    return out


def extract_pdf_text(path: Path) -> str:
    """Fast PDF text extraction via pypdfium2 with fallback to pdfplumber."""
    try:
        import pypdfium2 as pdfium
        pdf = pdfium.PdfDocument(str(path))
        pages_text = [page.get_textpage().get_text_range() for page in pdf]
        return "\n".join(pages_text)
    except Exception as ex:
        print(f"pypdfium2 fallback for {path.name}: {ex}")
        import pdfplumber
        with pdfplumber.open(path) as pdf:
            return "\n".join((pg.extract_text() or "") for pg in pdf.pages)


def pdf_chunks(s: dict[str, Any]) -> list[dict[str, Any]]:
    p = RAW / str(s["file"])
    if not p.exists():
        print("SKIPPED (file not found):", s["file"])
        return []

    text = extract_pdf_text(p)
    text = re.sub(r"\n{2,}", "\n", text)
    ms = list(SEC.finditer(text))
    out: list[dict[str, Any]] = []
    seen: set[str] = set()

    for i, m in enumerate(ms):
        title = m.group(2).strip(" .—-")[:100]
        # Skip amending acts table / adaptation orders front matter
        if re.search(r"(?i)\b(amendment|repealing|adaptation|decentralization|reorganisation)\b.*act", title):
            continue
        end = ms[i + 1].start() if i + 1 < len(ms) else len(text)
        body = text[m.start() : end].strip()
        if len(body) < 80 or body.count("....") > 3:
            continue
        sec_num = clean_section(m.group(1))
        if sec_num in seen:
            continue
        seen.add(sec_num)
        for part in split_long(body):
            out.append(
                dict(
                    act=s["act"],
                    unit=s["unit"],
                    section=sec_num,
                    title=title,
                    text=part,
                    category=s["category"],
                    year=s["year"],
                    source_url=s["url"],
                )
            )
    return out


def mapping_chunks(m: dict[str, str]) -> list[dict[str, Any]]:
    p = RAW / m["file"]
    if not p.exists():
        print("IPC mapping file not found, skipping.")
        return []
    df = pd.read_csv(p, dtype=str, encoding_errors="ignore").fillna("")
    need = ("ipc_col", "title_col", "bns_col")
    if not all(m[k] in df.columns for k in need):
        print("Mapping columns differ. Skipping mapping.")
        return []
    out: list[dict[str, Any]] = []
    for _, r in df.iterrows():
        ipc = str(r[m["ipc_col"]])
        ttl = str(r[m["title_col"]])
        bns = str(r[m["bns_col"]])
        txt = (
            "IPC Section " + ipc + " (" + ttl + ") now corresponds to "
            "Bharatiya Nyaya Sanhita (BNS) Section " + bns + "."
        )
        out.append(
            dict(
                act="IPC to BNS Mapping",
                unit="IPC Section",
                section=clean_section(ipc),
                title=ttl,
                text=txt,
                category="criminal",
                year=2023,
                source_url=INDIA_CODE,
            )
        )
    return out


def precedent_chunks() -> list[dict[str, Any]]:
    p = RAW / "sc_precedents.csv"
    if not p.exists():
        print("Supreme Court precedents file not found, skipping.")
        return []
    df = pd.read_csv(p, dtype=str, encoding_errors="ignore").fillna("")
    out: list[dict[str, Any]] = []
    for _, r in df.iterrows():
        case = str(r.get("Case_Name", "")).strip()
        citation = str(r.get("Citation", "")).strip()
        sec = clean_section(r.get("Section", ""))
        unit = str(r.get("Unit", "Section")).strip()
        title = str(r.get("Title", "")).strip()
        holding = str(r.get("Holding_Text", "")).strip()
        category = str(r.get("Category", "constitutional")).strip()
        statute = str(r.get("Applicable_Statute", "Supreme Court of India")).strip()
        year = int(r["Year"]) if str(r.get("Year", "")).isdigit() else 2024

        full_text = (
            f"Landmark Supreme Court of India Judgment: {case} [{citation} ({year})]. "
            f"Applicable Statute: {statute} ({unit} {sec}). "
            f"Key Legal Principle & Citizen Rights: {holding}"
        )
        out.append(
            dict(
                act=f"Supreme Court Landmark Precedent: {case}",
                unit=unit,
                section=sec,
                title=f"{case} — {title}",
                text=full_text,
                category=category,
                year=year,
                source_url="https://judgments.ecourts.gov.in",
            )
        )
    print(f"Loaded {len(out)} Supreme Court Landmark Precedent chunks.")
    return out


def enrich_titles(chunks: list[dict[str, Any]]) -> None:
    """Give BNS sections a heading using the IPC titles from the mapping."""
    titles: dict[str, list[str]] = {}
    for c in chunks:
        if c["act"] != "IPC to BNS Mapping":
            continue
        m = re.search(r"\(BNS\) Section (.+?)\.?$", str(c["text"]))
        if not m:
            continue
        rest = re.sub(r"\([^)]*\)", "", m.group(1))
        for num in re.findall(r"\b\d{1,3}[A-Z]{0,2}\b", rest):
            lst = titles.setdefault(num, [])
            t = str(c["title"]).strip()
            if t and t not in lst and len(lst) < 3:
                lst.append(t)
    added = 0
    for c in chunks:
        if str(c["act"]).startswith("Bharatiya Nyaya") and not str(c["title"]).strip():
            t = titles.get(str(c["section"]))
            if t:
                c["title"] = "; ".join(t)
                added += 1
    print("Titles added to BNS sections from IPC mapping:", added)


if __name__ == "__main__":
    chunks: list[dict[str, Any]] = []
    for s in SOURCES:
        c = csv_chunks(s) if s["kind"] == "csv" else pdf_chunks(s)
        print(s["act"] + ":", len(c), "chunks")
        chunks += c

    chunks += mapping_chunks(MAPPING)
    chunks += precedent_chunks()
    enrich_titles(chunks)

    with open(OUT / "chunks.jsonl", "w", encoding="utf-8") as f:
        for c in chunks:
            f.write(json.dumps(c, ensure_ascii=False) + "\n")
    print(f"\n==========================================")
    print(f"SUCCESS! TOTAL CHUNKS GENERATED: {len(chunks)}")
    print(f"==========================================")
