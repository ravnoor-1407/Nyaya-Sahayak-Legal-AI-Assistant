import os
import math
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "demo_test_cases"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Fonts
WIN_FONTS = os.environ.get("WINDIR", r"C:\Windows") + r"\Fonts"
TIMES_BOLD = os.path.join(WIN_FONTS, "timesbd.ttf")
TIMES = os.path.join(WIN_FONTS, "times.ttf")
ARIAL_BOLD = os.path.join(WIN_FONTS, "arialbd.ttf")
ARIAL = os.path.join(WIN_FONTS, "arial.ttf")
CALIBRI_BOLD = os.path.join(WIN_FONTS, "calibrib.ttf")
CALIBRI = os.path.join(WIN_FONTS, "calibri.ttf")

WIDTH = 1200
HEIGHT = 1680

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def wrap_text(text, font, max_width, draw):
    lines = []
    paragraphs = text.split("\n")
    for p in paragraphs:
        if not p.strip():
            lines.append("")
            continue
        words = p.split()
        cur_line = ""
        for w in words:
            test_line = f"{cur_line} {w}".strip()
            bbox = draw.textbbox((0, 0), test_line, font=font)
            w_px = bbox[2] - bbox[0]
            if w_px <= max_width:
                cur_line = test_line
            else:
                if cur_line:
                    lines.append(cur_line)
                cur_line = w
        if cur_line:
            lines.append(cur_line)
    return lines

def create_paper_base(bg_color=(252, 251, 248)):
    img = Image.new("RGB", (WIDTH, HEIGHT), bg_color)
    draw = ImageDraw.Draw(img)
    # Subtle page outer border
    draw.rectangle([25, 25, WIDTH - 26, HEIGHT - 26], outline=(215, 212, 205), width=2)
    # Inner border line
    draw.rectangle([32, 32, WIDTH - 33, HEIGHT - 33], outline=(235, 232, 225), width=1)
    return img, draw

def draw_round_stamp(draw, center_x, center_y, radius, text_upper, text_lower, text_center, ink_color):
    cx, cy = center_x, center_y
    # Outer circle
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=ink_color, width=3)
    # Inner concentric circle
    r_in = radius - 14
    draw.ellipse([cx - r_in, cy - r_in, cx + r_in, cy + r_in], outline=ink_color, width=1)
    
    font_stamp = get_font(ARIAL_BOLD, 15)
    font_center = get_font(ARIAL_BOLD, 17)
    
    # Center text
    bbox = draw.textbbox((0, 0), text_center, font=font_center)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((cx - tw / 2, cy - th / 2), text_center, fill=ink_color, font=font_center)
    
    # Upper & lower text
    bbox_u = draw.textbbox((0, 0), text_upper, font=font_stamp)
    draw.text((cx - (bbox_u[2] - bbox_u[0]) / 2, cy - radius + 22), text_upper, fill=ink_color, font=font_stamp)
    
    bbox_l = draw.textbbox((0, 0), text_lower, font=font_stamp)
    draw.text((cx - (bbox_l[2] - bbox_l[0]) / 2, cy + radius - 38), text_lower, fill=ink_color, font=font_stamp)

# =========================================================================
# 1. POLICE SUMMONS UNDER SECTION 35(3) BNSS, 2023
# =========================================================================
def generate_bnss35_summons():
    img, draw = create_paper_base(bg_color=(253, 252, 249))
    
    # Header emblem / coat of arms placeholder
    draw.line([120, 160, WIDTH - 120, 160], fill=(70, 80, 95), width=2)
    draw.line([120, 164, WIDTH - 120, 164], fill=(160, 170, 180), width=1)
    
    f_h1 = get_font(TIMES_BOLD, 26)
    f_h2 = get_font(TIMES_BOLD, 19)
    f_title = get_font(TIMES_BOLD, 23)
    f_sub = get_font(TIMES_BOLD, 15)
    f_meta = get_font(CALIBRI, 16)
    f_body = get_font(TIMES, 18)
    f_bold = get_font(TIMES_BOLD, 18)
    
    # Header text
    t1 = "POLICE DEPARTMENT, UNION TERRITORY CHANDIGARH"
    draw.text(((WIDTH - draw.textbbox((0,0), t1, font=f_h1)[2]) / 2, 70), t1, fill=(20, 30, 45), font=f_h1)
    t2 = "OFFICE OF THE STATION HOUSE OFFICER, POLICE STATION SECTOR 17"
    draw.text(((WIDTH - draw.textbbox((0,0), t2, font=f_h2)[2]) / 2, 110), t2, fill=(40, 50, 65), font=f_h2)
    
    # Title Box
    draw.rectangle([180, 185, WIDTH - 180, 240], fill=(245, 247, 250), outline=(50, 65, 85), width=2)
    t_doc = "NOTICE OF APPEARANCE UNDER SECTION 35(3) BNSS, 2023"
    draw.text(((WIDTH - draw.textbbox((0,0), t_doc, font=f_title)[2]) / 2, 197), t_doc, fill=(150, 20, 20), font=f_title)
    
    t_old = "(Corresponding to Old Section 41A of Code of Criminal Procedure, 1973)"
    draw.text(((WIDTH - draw.textbbox((0,0), t_old, font=f_sub)[2]) / 2, 250), t_old, fill=(90, 100, 110), font=f_sub)
    
    # Meta / Reference details
    y = 290
    draw.text((120, y), "Memo No: PS-17/SEC-35/2026/412", fill=(30, 40, 55), font=f_meta)
    draw.text((WIDTH - 360, y), "Date of Issue: 14th November 2026", fill=(30, 40, 55), font=f_meta)
    
    y += 35
    draw.text((120, y), "Complaint / FIR Case No: 412/2026", fill=(30, 40, 55), font=f_meta)
    draw.text((WIDTH - 360, y), "Offences: Sec 318(2), 351(2) BNS, 2023", fill=(160, 25, 25), font=f_meta)
    
    draw.line([120, y + 30, WIDTH - 120, y + 30], fill=(210, 215, 220), width=1)
    
    y += 55
    draw.text((120, y), "To,", fill=(20, 25, 30), font=f_bold)
    y += 28
    draw.text((150, y), "Shri Vikram Malhotra, S/o Shri R.K. Malhotra", fill=(20, 25, 30), font=f_bold)
    y += 26
    draw.text((150, y), "Resident of: Flat No. 302, Palm Greens, Sector 18, Chandigarh (U.T.)", fill=(40, 45, 50), font=f_meta)
    
    # Notice Body
    y += 50
    paragraphs = [
        "WHEREAS, an official inquiry / criminal investigation is being conducted at this Police Station into allegations concerning financial cheating and criminal intimidation registered vide Complaint Case No. 412/2026 under Sections 318(2) and 351(2) of the Bharatiya Nyaya Sanhita, 2023 (BNS).",
        "AND WHEREAS, upon examination of material facts, your personal attendance and statement are deemed necessary for the proper investigation and inquiry into the alleged transactions.",
        "NOW THEREFORE, in exercise of powers conferred under Section 35, Sub-section (3) of the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS), you are hereby DIRECTED TO APPEAR IN PERSON before the undersigned Investigating Officer at Police Station Sector 17, Chandigarh on 20th November 2026 at 11:00 AM sharp to produce books of accounts, banking transaction receipts, and clarify your stand in respect of the alleged complaint.",
        "STATUTORY SAFEGUARD (SECTION 35(4) BNSS):\nTake notice that in compliance with statutory law and the guidelines of the Hon'ble Supreme Court of India in Arnesh Kumar v. State of Bihar and Satender Kumar Antil v. CBI, so long as you comply with this notice and appear as directed, you shall not be arrested in respect of the offence mentioned unless for reasons to be recorded in writing.",
        "WARNING OF ARREST UPON NON-COMPLIANCE (SECTION 35(5) BNSS):\nTAKE FURTHER NOTICE that if you fail to attend, evade, or refuse to comply with the directions contained in this notice, you shall be liable to be arrested under Section 35(5) of the BNSS upon obtaining an arrest order from the Competent Judicial Magistrate.",
    ]
    
    for p in paragraphs:
        is_warning = "WARNING OF ARREST" in p
        is_safeguard = "STATUTORY SAFEGUARD" in p
        
        lines = wrap_text(p, f_body, WIDTH - 240, draw)
        for line in lines:
            color = (180, 20, 20) if is_warning else ((20, 90, 40) if is_safeguard else (25, 30, 35))
            font = f_bold if (is_warning or is_safeguard or "NOW THEREFORE" in line or "DIRECTED TO APPEAR" in line) else f_body
            draw.text((120, y), line, fill=color, font=font)
            y += 28
        y += 14
        
    # Signature & Stamps
    y_sig = HEIGHT - 290
    draw.text((WIDTH - 420, y_sig), "Sd/-", fill=(20, 30, 40), font=f_meta)
    draw.text((WIDTH - 420, y_sig + 25), "(K.S. Virk, Sub-Inspector)", fill=(20, 30, 40), font=f_bold)
    draw.text((WIDTH - 420, y_sig + 50), "Investigating Officer / S.H.O.", fill=(50, 60, 70), font=f_meta)
    draw.text((WIDTH - 420, y_sig + 72), "Police Station Sector 17, Chandigarh", fill=(50, 60, 70), font=f_meta)
    draw.text((WIDTH - 420, y_sig + 94), "Mobile: +91 98765-43210", fill=(50, 60, 70), font=f_meta)
    
    # Official Rubber Stamp
    draw_round_stamp(draw, 260, HEIGHT - 230, 90, "POLICE STATION SECTOR 17", "CHANDIGARH POLICE", "SEAL * 14-NOV-2026", (30, 60, 150))
    
    out_path = os.path.join(OUTPUT_DIR, "1_police_summons_bnss35.jpg")
    img.save(out_path, "JPEG", quality=95)
    print("Generated:", out_path)

# =========================================================================
# 2. SECTION 138 CHEQUE BOUNCE LEGAL NOTICE
# =========================================================================
def generate_sec138_notice():
    img, draw = create_paper_base(bg_color=(254, 253, 250))
    
    f_firm = get_font(TIMES_BOLD, 28)
    f_sub = get_font(TIMES, 15)
    f_urgent = get_font(ARIAL_BOLD, 14)
    f_title = get_font(TIMES_BOLD, 22)
    f_body = get_font(TIMES, 18)
    f_bold = get_font(TIMES_BOLD, 18)
    f_meta = get_font(CALIBRI, 16)
    
    # Advocate Letterhead
    draw.text(((WIDTH - draw.textbbox((0,0), "SHARMA & ASSOCIATES", font=f_firm)[2]) / 2, 60), "SHARMA & ASSOCIATES", fill=(15, 30, 60), font=f_firm)
    sub1 = "ADVOCATES & LEGAL CONSULTANTS — HIGH COURT OF PUNJAB & HARYANA"
    draw.text(((WIDTH - draw.textbbox((0,0), sub1, font=f_sub)[2]) / 2, 100), sub1, fill=(60, 70, 85), font=f_sub)
    sub2 = "Chamber No. 48, Bar Association Complex, Chandigarh - 160001 | Contact: 0172-2748921"
    draw.text(((WIDTH - draw.textbbox((0,0), sub2, font=f_sub)[2]) / 2, 125), sub2, fill=(90, 100, 115), font=f_sub)
    
    draw.line([100, 155, WIDTH - 100, 155], fill=(15, 30, 60), width=3)
    draw.line([100, 161, WIDTH - 100, 161], fill=(180, 190, 205), width=1)
    
    # Urgent Dispatch Banner
    draw.rectangle([100, 180, 520, 215], fill=(255, 235, 235), outline=(190, 30, 30), width=2)
    draw.text((115, 188), "BY REGISTERED POST A.D. & SPEED POST", fill=(190, 30, 30), font=f_urgent)
    
    draw.text((WIDTH - 380, 188), "Date: 05th November 2026", fill=(30, 40, 50), font=f_meta)
    
    # Notice Title
    y = 240
    t_head = "STATUTORY LEGAL DEMAND NOTICE UNDER SECTION 138"
    t_head2 = "OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 (AS AMENDED)"
    draw.text(((WIDTH - draw.textbbox((0,0), t_head, font=f_title)[2]) / 2, y), t_head, fill=(160, 15, 15), font=f_title)
    draw.text(((WIDTH - draw.textbbox((0,0), t_head2, font=f_title)[2]) / 2, y + 30), t_head2, fill=(160, 15, 15), font=f_title)
    
    y += 85
    draw.text((100, y), "To,", fill=(20, 25, 30), font=f_bold)
    y += 26
    draw.text((130, y), "M/s Zenith Traders (Proprietor: Shri Rajesh Gupta)", fill=(20, 25, 30), font=f_bold)
    y += 25
    draw.text((130, y), "Civil Lines, Near Clock Tower, Ludhiana, Punjab - 141001", fill=(40, 45, 50), font=f_meta)
    
    y += 50
    draw.text((100, y), "Sir / Madam,", fill=(20, 25, 30), font=f_body)
    y += 35
    
    body_text = [
        "Under express instructions from our client, M/s Shivalik Goods Pvt. Ltd., having its corporate office at Industrial Area Phase 1, Chandigarh, we hereby serve you with this statutory legal notice:",
        "1. That our client had supplied industrial hardware materials to your firm against Tax Invoices dated 10/09/2026 for a total value of Rs. 4,50,000/- (Rupees Four Lakh Fifty Thousand Only), which goods were duly acknowledged and accepted by you without dispute.",
        "2. That towards partial discharge of your legally enforceable debt and liability, you had issued Account Payee Cheque bearing No. 901245 dated 25/10/2026 for an amount of Rs. 4,50,000/- drawn on Punjab National Bank, Civil Lines Branch, Ludhiana.",
        "3. That our client presented the aforesaid cheque for realization through its banker, HDFC Bank, Chandigarh. However, the said cheque was dishonoured and returned unpaid vide Bank Return Memo dated 02/11/2026 with the official reason/remark: 'FUNDS INSUFFICIENT'.",
        "4. STATUTORY 15-DAY DEMAND:\nNOW THEREFORE, by means of this statutory notice, we hereby call upon and demand that you make payment of the aforesaid dishonoured cheque amount of Rs. 4,50,000/- (Rupees Four Lakh Fifty Thousand Only) to our client within 15 (FIFTEEN) DAYS from the date of receipt of this notice.",
        "5. CRIMINAL CONSEQUENCE WARNING:\nPLEASE TAKE SERIOUS NOTE that if you fail to make payment of the said amount within the stipulated period of 15 days, our client shall be constrained to institute criminal proceedings against you under Section 138 of the Negotiable Instruments Act, 1881 in the Competent Court of Judicial Magistrate, wherein you shall be liable to be punished with imprisonment for a term which may extend to TWO YEARS, or with fine up to DOUBLE the cheque amount (Rs. 9,00,000/-), or with both.",
    ]
    
    for p in body_text:
        is_warn = "CRIMINAL CONSEQUENCE WARNING" in p
        is_demand = "STATUTORY 15-DAY DEMAND" in p
        lines = wrap_text(p, f_body, WIDTH - 200, draw)
        for line in lines:
            c = (180, 20, 20) if is_warn else ((140, 30, 20) if is_demand else (25, 30, 35))
            f = f_bold if (is_warn or is_demand or "Rs. 4,50,000/-" in line or "15 (FIFTEEN) DAYS" in line) else f_body
            draw.text((100, y), line, fill=c, font=f)
            y += 27
        y += 12
        
    y_sig = HEIGHT - 260
    draw.text((WIDTH - 400, y_sig), "Yours faithfully,", fill=(30, 40, 50), font=f_meta)
    draw.text((WIDTH - 400, y_sig + 35), "Sd/-", fill=(20, 40, 100), font=f_meta)
    draw.text((WIDTH - 400, y_sig + 60), "ASHOK SHARMA, Advocate", fill=(15, 30, 60), font=f_bold)
    draw.text((WIDTH - 400, y_sig + 85), "Bar Council Regn: P/1482/2004", fill=(60, 70, 80), font=f_meta)
    draw.text((WIDTH - 400, y_sig + 107), "Counsel for M/s Shivalik Goods Pvt. Ltd.", fill=(60, 70, 80), font=f_meta)
    
    # Red Rectangular Stamp: Speed Post Dispatch
    draw.rectangle([110, HEIGHT - 230, 420, HEIGHT - 150], outline=(180, 30, 30), width=2)
    draw.text((130, HEIGHT - 215), "REGISTERED SPEED POST", fill=(180, 30, 30), font=f_urgent)
    draw.text((130, HEIGHT - 190), "CONSIGNMENT: EP849102941IN", fill=(30, 30, 30), font=f_meta)
    draw.text((130, HEIGHT - 168), "DISPATCHED: 05-NOV-2026", fill=(100, 30, 30), font=f_meta)
    
    out_path = os.path.join(OUTPUT_DIR, "2_cheque_bounce_notice_sec138.jpg")
    img.save(out_path, "JPEG", quality=95)
    print("Generated:", out_path)

# =========================================================================
# 3. UNFAIR RESIDENTIAL TENANCY LEASE AGREEMENT
# =========================================================================
def generate_unfair_rent_agreement():
    img, draw = create_paper_base(bg_color=(252, 251, 247))
    
    f_h1 = get_font(TIMES_BOLD, 26)
    f_h2 = get_font(TIMES_BOLD, 17)
    f_title = get_font(TIMES_BOLD, 20)
    f_body = get_font(TIMES, 18)
    f_bold = get_font(TIMES_BOLD, 18)
    f_meta = get_font(CALIBRI, 16)
    
    # e-Stamp header simulation
    draw.rectangle([90, 60, WIDTH - 90, 160], fill=(245, 240, 230), outline=(160, 140, 110), width=2)
    draw.text(((WIDTH - draw.textbbox((0,0), "GOVERNMENT OF NATIONAL CAPITAL TERRITORY OF DELHI", font=f_h2)[2]) / 2, 75), 
              "GOVERNMENT OF NATIONAL CAPITAL TERRITORY OF DELHI", fill=(90, 70, 40), font=f_h2)
    draw.text(((WIDTH - draw.textbbox((0,0), "NON-JUDICIAL e-STAMP CERTIFICATE: IN-DL84920491823101", font=f_meta)[2]) / 2, 105), 
              "NON-JUDICIAL e-STAMP CERTIFICATE: IN-DL84920491823101", fill=(60, 50, 30), font=f_meta)
    draw.text(((WIDTH - draw.textbbox((0,0), "CONSIDERATION: LEASE DEED (ARTICLE 35) | STAMP DUTY PAID: RS. 500/-", font=f_meta)[2]) / 2, 130), 
              "CONSIDERATION: LEASE DEED (ARTICLE 35) | STAMP DUTY PAID: RS. 500/-", fill=(90, 70, 40), font=f_meta)
    
    y = 195
    t1 = "RESIDENTIAL TENANCY LEASE AGREEMENT"
    draw.text(((WIDTH - draw.textbbox((0,0), t1, font=f_h1)[2]) / 2, y), t1, fill=(20, 25, 35), font=f_h1)
    
    y += 50
    draw.text((100, y), "This Residential Tenancy Agreement is executed on this 1st day of June 2026 at New Delhi BETWEEN:", fill=(30, 35, 40), font=f_body)
    y += 30
    draw.text((100, y), "1. Shri S.K. Bansal, S/o Late Sh. O.P. Bansal, R/o Hauz Khas, New Delhi (hereinafter called the 'LANDLORD')", fill=(30, 35, 40), font=f_bold)
    y += 28
    draw.text((100, y), "2. Shri Rohit Mehra, S/o Sh. V.K. Mehra, R/o Saket, New Delhi (hereinafter called the 'TENANT').", fill=(30, 35, 40), font=f_bold)
    
    y += 45
    draw.text((100, y), "WHEREAS the Landlord agrees to let out Flat No. 402, Royal Palms, Saket, New Delhi on the following terms:", fill=(30, 35, 40), font=f_body)
    
    y += 40
    clauses = [
        "Clause 1 (Term & Lock-In): The tenancy shall be for a duration of 24 months commencing 01/06/2026. Both parties agree to a strict mandatory lock-in period of 24 months.",
        "Clause 3 (Rent): Monthly rental of Rs. 35,000/- payable in advance on or before the 5th day of every calendar month.",
        "Clause 8 (CRITICAL RISK — SECURITY DEPOSIT FORFEITURE & DISCONNECTION):\nThe Tenant has deposited an interest-free refundable security deposit of Rs. 1,00,000/- (Rupees One Lakh Only) with the Landlord.\nIT IS EXPRESSLY STIPULATED THAT in the event the Tenant terminates the tenancy, vacates, or commits any breach before the completion of the 24-month lock-in period, the ENTIRE SECURITY DEPOSIT OF RS. 1,00,000/- SHALL BE FORFEITED UNCONDITIONALLY by the Landlord without any refund or offset.\nFURTHERMORE, the Landlord reserves the unilateral, non-appealable right to immediately disconnect electricity and water utilities, and padlock the premises WITHOUT ANY JUDICIAL ORDER OR COURT PROCEEDINGS in case of a 7-day delay in rent payment.",
        "Clause 11 (Jurisdiction): Exclusive jurisdiction shall vest with local civil courts at New Delhi.",
    ]
    
    for c in clauses:
        is_clause8 = "CRITICAL RISK" in c
        lines = wrap_text(c, f_body, WIDTH - 200, draw)
        for line in lines:
            color = (190, 20, 20) if is_clause8 else (25, 30, 35)
            font = f_bold if (is_clause8 or "Clause" in line) else f_body
            draw.text((100, y), line, fill=color, font=font)
            y += 27
        y += 18
        
    y_sig = HEIGHT - 220
    draw.text((140, y_sig), "IN WITNESS WHEREOF the parties have set their hands:", fill=(40, 50, 60), font=f_meta)
    
    draw.text((140, y_sig + 60), "Sd/-", fill=(20, 30, 40), font=f_meta)
    draw.text((140, y_sig + 85), "(S.K. BANSAL)", fill=(20, 30, 40), font=f_bold)
    draw.text((140, y_sig + 110), "LANDLORD", fill=(60, 70, 80), font=f_meta)
    
    draw.text((WIDTH - 360, y_sig + 60), "Sd/-", fill=(20, 30, 40), font=f_meta)
    draw.text((WIDTH - 360, y_sig + 85), "(ROHIT MEHRA)", fill=(20, 30, 40), font=f_bold)
    draw.text((WIDTH - 360, y_sig + 110), "TENANT", fill=(60, 70, 80), font=f_meta)
    
    out_path = os.path.join(OUTPUT_DIR, "3_unfair_tenancy_agreement.jpg")
    img.save(out_path, "JPEG", quality=95)
    print("Generated:", out_path)

# =========================================================================
# 4. SAFE SETTLEMENT NOC & NO-DUES RECEIPT
# =========================================================================
def generate_safe_settlement_noc():
    img, draw = create_paper_base(bg_color=(253, 254, 251))
    
    f_h1 = get_font(TIMES_BOLD, 26)
    f_h2 = get_font(TIMES_BOLD, 18)
    f_body = get_font(TIMES, 18)
    f_bold = get_font(TIMES_BOLD, 18)
    f_meta = get_font(CALIBRI, 16)
    
    y = 90
    t1 = "NO OBJECTION CERTIFICATE & FULL AND FINAL SETTLEMENT RECEIPT"
    draw.text(((WIDTH - draw.textbbox((0,0), t1, font=f_h1)[2]) / 2, y), t1, fill=(20, 80, 45), font=f_h1)
    
    t2 = "MUTUAL DISCHARGE OF TENANCY & FINANCIAL OBLIGATIONS"
    draw.text(((WIDTH - draw.textbbox((0,0), t2, font=f_h2)[2]) / 2, y + 42), t2, fill=(60, 70, 80), font=f_h2)
    
    draw.line([120, y + 80, WIDTH - 120, y + 80], fill=(20, 120, 60), width=2)
    
    y += 110
    draw.text((120, y), "Date of Issuance: 10th November 2026", fill=(30, 40, 50), font=f_meta)
    draw.text((WIDTH - 420, y), "Premises: Flat 204, Royal Palms, New Delhi", fill=(30, 40, 50), font=f_meta)
    
    y += 50
    draw.text((120, y), "TO WHOMSOEVER IT MAY CONCERN,", fill=(20, 30, 40), font=f_bold)
    y += 40
    
    body = [
        "This is to formally certify and acknowledge that Mr. Rohan Verma (Tenant), son of Late Shri K.L. Verma, who was residing at Flat No. 204, Royal Palms Apartments, Saket, New Delhi under lease agreement dated 01/11/2024, has voluntarily and peacefully vacated the leased premises on 09th November 2026.",
        "1. UTILITIES & RENT CLEARED: All monthly rent payments, maintenance charges, electricity bills, water dues, and domestic gas pipeline charges stand paid in full and up-to-date with zero outstanding balance.",
        "2. FULL REFUND OF SECURITY DEPOSIT: The entire interest-free refundable security deposit of Rs. 60,000/- (Rupees Sixty Thousand Only) has been successfully refunded back to the Tenant via electronic bank transfer (NEFT/RTGS UTR Reference: UTR9823419087) on 09/11/2026.",
        "3. CONDITION OF PREMISES: The Landlord confirms having inspected the flat and found fixtures, fittings, and paint in good, acceptable condition without any damages.",
        "4. ABSOLUTE DISCHARGE & NO LEGAL DISPUTE: The undersigned Landlord explicitly certifies that there are NO pending claims, disputes, legal dues, or liabilities against the Tenant whatsoever. Both parties mutually and irrevocably discharge each other from all covenants of the tenancy.",
    ]
    
    for p in body:
        lines = wrap_text(p, f_body, WIDTH - 240, draw)
        for line in lines:
            is_sec = "FULL REFUND" in line or "NO LEGAL DISPUTE" in line
            c = (20, 110, 50) if is_sec else (30, 35, 40)
            f = f_bold if (is_sec or "UTILITIES" in line or "CONDITION" in line) else f_body
            draw.text((120, y), line, fill=c, font=f)
            y += 28
        y += 16
        
    # Signature
    y_sig = HEIGHT - 270
    draw.text((WIDTH - 380, y_sig), "Issued with mutual satisfaction,", fill=(50, 60, 70), font=f_meta)
    draw.text((WIDTH - 380, y_sig + 35), "Sd/-", fill=(20, 40, 90), font=f_meta)
    draw.text((WIDTH - 380, y_sig + 60), "S.K. BANSAL (Landlord)", fill=(20, 30, 40), font=f_bold)
    draw.text((WIDTH - 380, y_sig + 85), "Contact: +91 98111-23456", fill=(60, 70, 80), font=f_meta)
    
    # Green Round Stamp
    draw_round_stamp(draw, 260, HEIGHT - 220, 85, "FULL & FINAL SETTLEMENT", "NO CLAIMS PENDING", "VERIFIED * PAID", (20, 120, 50))
    
    out_path = os.path.join(OUTPUT_DIR, "4_safe_settlement_noc.jpg")
    img.save(out_path, "JPEG", quality=95)
    print("Generated:", out_path)

# =========================================================================
# 5. NON-LEGAL ACADEMIC HOMEWORK / ASSIGNMENT
# =========================================================================
def generate_non_legal_assignment():
    img, draw = create_paper_base(bg_color=(255, 255, 255))
    
    f_univ = get_font(ARIAL_BOLD, 22)
    f_dept = get_font(ARIAL, 16)
    f_title = get_font(ARIAL_BOLD, 20)
    f_meta = get_font(CALIBRI, 16)
    f_meta_b = get_font(CALIBRI_BOLD, 16)
    f_body = get_font(CALIBRI, 17)
    f_bold = get_font(CALIBRI_BOLD, 17)
    
    # University Header
    y = 80
    u1 = "LOVELY PROFESSIONAL UNIVERSITY, PUNJAB"
    draw.text(((WIDTH - draw.textbbox((0,0), u1, font=f_univ)[2]) / 2, y), u1, fill=(180, 70, 20), font=f_univ)
    y += 35
    u2 = "DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING — B.TECH (AI & ML)"
    draw.text(((WIDTH - draw.textbbox((0,0), u2, font=f_dept)[2]) / 2, y), u2, fill=(70, 80, 90), font=f_dept)
    
    draw.line([120, y + 35, WIDTH - 120, y + 35], fill=(200, 205, 210), width=2)
    
    # Title Box
    y += 65
    draw.rectangle([120, y, WIDTH - 120, y + 70], fill=(245, 248, 255), outline=(100, 140, 200), width=1)
    t = "LABORATORY ASSIGNMENT #3: CONVOLUTIONAL NEURAL NETWORKS"
    draw.text(((WIDTH - draw.textbbox((0,0), t, font=f_title)[2]) / 2, y + 22), t, fill=(20, 50, 110), font=f_title)
    
    # Student Metadata Box
    y += 100
    draw.rectangle([120, y, WIDTH - 120, y + 105], fill=(250, 250, 250), outline=(220, 225, 230), width=1)
    draw.text((140, y + 15), "Student Name:", fill=(60, 70, 80), font=f_meta)
    draw.text((260, y + 15), "Rahul Sharma", fill=(20, 30, 40), font=f_meta_b)
    draw.text((WIDTH - 420, y + 15), "Course Code:", fill=(60, 70, 80), font=f_meta)
    draw.text((WIDTH - 300, y + 15), "CSE421 (Deep Learning)", fill=(20, 30, 40), font=f_meta_b)
    
    draw.text((140, y + 45), "University ID / UID:", fill=(60, 70, 80), font=f_meta)
    draw.text((280, y + 45), "12204918", fill=(20, 30, 40), font=f_meta_b)
    draw.text((WIDTH - 420, y + 45), "Semester / Sec:", fill=(60, 70, 80), font=f_meta)
    draw.text((WIDTH - 300, y + 45), "Semester VII (K22GF)", fill=(20, 30, 40), font=f_meta_b)
    
    draw.text((140, y + 75), "Submission Date:", fill=(60, 70, 80), font=f_meta)
    draw.text((280, y + 75), "24th November 2026", fill=(20, 30, 40), font=f_meta)
    draw.text((WIDTH - 420, y + 75), "Faculty Supervisor:", fill=(60, 70, 80), font=f_meta)
    draw.text((WIDTH - 280, y + 75), "Dr. P.K. Gupta", fill=(20, 30, 40), font=f_meta_b)
    
    # Paper Content
    y += 135
    paragraphs = [
        "1. OBJECTIVE & PROBLEM STATEMENT:\nThe objective of this machine learning practical coursework is to design, implement, and benchmark deep convolutional neural network (CNN) architectures for visual object recognition on the CIFAR-10 computer vision dataset.",
        "2. THEORETICAL BACKGROUND:\nStandard fully connected multi-layer perceptrons fail to scale efficiently on high-resolution image matrices due to exponential parameter explosion and lack of spatial translation invariance. Convolutional feature maps apply localized discrete 2D kernel filters sliding across spatial dimensions.",
        "3. EXPERIMENTAL SETUP & HYPERPARAMETERS:\n- Framework: PyTorch 2.4.0 with CUDA GPU acceleration\n- Architecture: ResNet-18 residual architecture with skip residual connections\n- Optimization: AdamW optimizer (learning rate 0.001, weight decay 1e-4) vs SGD with Nesterov momentum (0.9)\n- Loss Criterion: Multi-class Cross-Entropy Loss with Label Smoothing (0.1)",
        "4. EMPIRICAL RESULTS & DISCUSSION:\nOver 50 training epochs, ResNet-18 converged to a top-1 test classification accuracy of 93.4% with cosine annealing learning rate scheduler. Data augmentations including RandomCrop(32, padding=4) and RandomHorizontalFlip played a critical role in preventing overfitting.",
    ]
    
    for p in paragraphs:
        lines = wrap_text(p, f_body, WIDTH - 240, draw)
        for line in lines:
            is_head = line.startswith(("1.", "2.", "3.", "4."))
            draw.text((120, y), line, fill=(20, 30, 40) if is_head else (60, 70, 80), font=f_bold if is_head else f_body)
            y += 26
        y += 16
        
    y_sig = HEIGHT - 180
    draw.text((120, y_sig), "Self-Declaration: I hereby declare that this assignment represents my own authentic coursework.", fill=(100, 110, 120), font=f_meta)
    draw.text((WIDTH - 300, y_sig + 40), "Student Signature: Rahul S.", fill=(30, 50, 120), font=f_bold)
    
    out_path = os.path.join(OUTPUT_DIR, "5_non_legal_assignment.jpg")
    img.save(out_path, "JPEG", quality=95)
    print("Generated:", out_path)

if __name__ == "__main__":
    generate_bnss35_summons()
    generate_sec138_notice()
    generate_unfair_rent_agreement()
    generate_safe_settlement_noc()
    generate_non_legal_assignment()
    print("All 5 demo photos successfully generated in", OUTPUT_DIR)
