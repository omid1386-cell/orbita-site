#!/usr/bin/env python3
"""Build ORBITA satellite dataset: merges Celestrak TLEs + SATCAT metadata into compact JSON."""
import csv, json, os, glob

SRC = "/tmp/tle"
OUT = "/home/user/spaceapp/data"

GROUP_FA = {
    "stations": ("ایستگاه‌های فضایی", "Space stations"),
    "science": ("علمی و پژوهشی", "Science"),
    "weather": ("هواشناسی", "Weather"),
    "goes": ("هواشناسی زمین‌ثابت", "GOES weather"),
    "resource": ("سنجش از دور", "Earth resources"),
    "sarsat": ("جست‌وجو و نجات", "Search & rescue"),
    "dmc": ("پایش بلایا", "Disaster monitoring"),
    "tdrss": ("رله داده", "Data relay"),
    "argos": ("پایش محیطی", "Environmental"),
    "planet": ("تصویربرداری تجاری", "Commercial imaging"),
    "spire": ("هواشناسی تجاری", "Commercial weather"),
    "gps-ops": ("ناوبری جی‌پی‌اس", "GPS navigation"),
    "glo-ops": ("ناوبری گلوناس", "GLONASS navigation"),
    "galileo": ("ناوبری گالیله", "Galileo navigation"),
    "beidou": ("ناوبری بی‌دو", "BeiDou navigation"),
    "sbas": ("تقویت ناوبری", "SBAS augmentation"),
    "nnss": ("ناوبری قدیمی", "Legacy navigation"),
    "musson": ("ناوبری نظامی روسیه", "Russian navigation"),
    "geo": ("مخابراتی زمین‌ثابت", "Geostationary comms"),
    "intelsat": ("اینتل‌ست", "Intelsat"),
    "ses": ("اس‌ای‌اس", "SES"),
    "iridium-NEXT": ("ایریدیوم", "Iridium NEXT"),
    "oneweb": ("وان‌وب", "OneWeb"),
    "starlink": ("استارلینک", "Starlink"),
    "amateur": ("رادیو آماتوری", "Amateur radio"),
    "x-comm": ("مخابرات تجربی", "Experimental comms"),
    "other-comm": ("سایر مخابراتی", "Other comms"),
    "military": ("نظامی", "Military"),
    "radar": ("کالیبراسیون رادار", "Radar calibration"),
    "cubesat": ("مکعب‌ماهواره", "CubeSat"),
    "engineering": ("مهندسی و فناوری", "Engineering"),
    "education": ("آموزشی", "Education"),
    "other": ("سایر", "Other"),
}

OWNER_FA = {
    "US": ("ایالات متحده", "United States"), "PRC": ("چین", "China"),
    "CIS": ("روسیه", "Russia"), "ESA": ("آژانس فضایی اروپا", "ESA"),
    "IRAN": ("ایران", "Iran"), "JPN": ("ژاپن", "Japan"), "IND": ("هند", "India"),
    "FR": ("فرانسه", "France"), "UK": ("بریتانیا", "United Kingdom"),
    "GER": ("آلمان", "Germany"), "ITSO": ("اینتل‌ست", "Intelsat"),
    "SES": ("اس‌ای‌اس", "SES"), "CA": ("کانادا", "Canada"), "SKOR": ("کره جنوبی", "South Korea"),
    "NKOR": ("کرهٔ شمالی", "North Korea"), "ISRA": ("اسرائیل", "Israel"),
    "TURK": ("ترکیه", "Türkiye"), "UAE": ("امارات", "UAE"), "SAUD": ("عربستان", "Saudi Arabia"),
    "BRAZ": ("برزیل", "Brazil"), "ARGN": ("آرژانتین", "Argentina"), "AUS": ("استرالیا", "Australia"),
    "SPN": ("اسپانیا", "Spain"), "NETH": ("هلند", "Netherlands"), "NOR": ("نروژ", "Norway"),
    "SWED": ("سوئد", "Sweden"), "FIN": ("فنلاند", "Finland"), "DEN": ("دانمارک", "Denmark"),
    "POL": ("لهستان", "Poland"), "CZCH": ("چک", "Czechia"), "SWTZ": ("سوئیس", "Switzerland"),
    "BEL": ("بلژیک", "Belgium"), "LUXE": ("لوکزامبورگ", "Luxembourg"), "PAKI": ("پاکستان", "Pakistan"),
    "THAI": ("تایلند", "Thailand"), "INDO": ("اندونزی", "Indonesia"), "MALA": ("مالزی", "Malaysia"),
    "VTNM": ("ویتنام", "Vietnam"), "SING": ("سنگاپور", "Singapore"), "EGYP": ("مصر", "Egypt"),
    "ALG": ("الجزایر", "Algeria"), "NIG": ("نیجریه", "Nigeria"), "RSA": ("آفریقای جنوبی", "South Africa"),
    "MEX": ("مکزیک", "Mexico"), "CHLE": ("شیلی", "Chile"), "PERU": ("پرو", "Peru"),
    "KAZ": ("قزاقستان", "Kazakhstan"), "AZER": ("آذربایجان", "Azerbaijan"), "BELA": ("بلاروس", "Belarus"),
    "UKR": ("اوکراین", "Ukraine"), "GREC": ("یونان", "Greece"), "POR": ("پرتغال", "Portugal"),
    "IRAQ": ("عراق", "Iraq"), "QAT": ("قطر", "Qatar"), "BHR": ("بحرین", "Bahrain"),
    "ESRO": ("آژانس فضایی اروپا", "ESRO"), "EUME": ("یومت‌ست", "EUMETSAT"),
    "EUTE": ("یوتل‌ست", "Eutelsat"), "ASRA": ("اتریش", "Austria"), "NZ": ("نیوزیلند", "New Zealand"),
    "TBD": ("نامشخص", "Unknown"), "UNK": ("نامشخص", "Unknown"),
}

def orbit_class(apo, per, inc, period):
    """LEO / MEO / GEO / HEO / SSO(polar)"""
    if apo is None or per is None:
        return "leo"
    if period and 1400 < period < 1470 and inc is not None and inc < 15 and apo - per < 2000:
        return "geo"
    if apo - per > 12000:
        return "heo"
    if per > 25000:
        return "geo"
    if per > 2000:
        return "meo"
    if inc is not None and (80 <= inc <= 105):
        return "sso"
    return "leo"

# ---------- read group membership ----------
groups = {}
for path in glob.glob(os.path.join(SRC, "*.tle")):
    g = os.path.basename(path)[:-4]
    if g == "active":
        continue
    lines = [l.rstrip() for l in open(path, encoding="utf-8", errors="ignore") if l.strip()]
    for i in range(0, len(lines) - 2, 3):
        n = lines[i + 1].split()[1].strip("U").split("U")[0]
        try:
            nid = int(lines[i + 1][2:7])
        except Exception:
            continue
        groups.setdefault(nid, g)

# ---------- satcat metadata ----------
meta = {}
for row in csv.DictReader(open(os.path.join(SRC, "satcat.csv"), encoding="utf-8", errors="ignore")):
    try:
        nid = int(row["NORAD_CAT_ID"])
    except Exception:
        continue
    meta[nid] = row

def num(v):
    try:
        return float(v)
    except Exception:
        return None

# ---------- active TLEs ----------
lines = [l.rstrip() for l in open(os.path.join(SRC, "active.tle"), encoding="utf-8", errors="ignore") if l.strip()]
sats, owners, gnames = [], {}, {}
for i in range(0, len(lines) - 2, 3):
    name, l1, l2 = lines[i].strip(), lines[i + 1], lines[i + 2]
    if not l1.startswith("1 ") or not l2.startswith("2 "):
        continue
    try:
        nid = int(l1[2:7])
    except Exception:
        continue
    m = meta.get(nid, {})
    apo, per = num(m.get("APOGEE")), num(m.get("PERIGEE"))
    inc, period = num(m.get("INCLINATION")), num(m.get("PERIOD"))
    if inc is None:
        try:
            inc = float(l2[8:16])
        except Exception:
            inc = 0.0
    own = (m.get("OWNER") or "UNK").strip()
    grp = groups.get(nid, "other")
    owners[own] = OWNER_FA.get(own, (own, own))
    gnames[grp] = GROUP_FA.get(grp, (grp, grp))
    sats.append([
        nid, name, l1, l2, grp, own,
        (m.get("LAUNCH_DATE") or ""), (m.get("LAUNCH_SITE") or ""),
        round(period, 1) if period else None,
        round(inc, 2) if inc is not None else None,
        int(apo) if apo else None, int(per) if per else None,
        (m.get("RCS") or ""), orbit_class(apo, per, inc, period),
    ])

sats.sort(key=lambda s: (s[13] != "geo", s[0]))
out = {
    "epoch": "",
    "fields": ["id", "name", "t1", "t2", "grp", "own", "launch", "site", "period", "inc", "apo", "per", "rcs", "cls"],
    "owners": owners, "groups": gnames, "sats": sats,
}
json.dump(out, open(os.path.join(OUT, "sats.json"), "w", encoding="utf-8"),
          ensure_ascii=False, separators=(",", ":"))

from collections import Counter
print("total:", len(sats))
print("classes:", Counter(s[13] for s in sats))
print("groups:", Counter(s[4] for s in sats).most_common(12))
print("size MB:", round(os.path.getsize(os.path.join(OUT, "sats.json")) / 1e6, 2))
