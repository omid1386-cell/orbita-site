#!/usr/bin/env python3
"""پیوند تصاویر محلی به دادهٔ ماهواره‌های شاخص.

بر اساس وجود پروندهٔ assets/img/sats/<norad>.jpg کلید img را تنظیم می‌کند.
همچنین کلیدهای موقتی wiki و raw را حذف می‌کند تا حجم داده کم شود.
اجرای دوباره امن است.
"""
import json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, "data", "sat_featured.json")
IMGD = os.path.join(ROOT, "assets", "img", "sats")

with open(DATA, encoding="utf-8") as fh:
    feat = json.load(fh)

have = 0
for nid, rec in feat.items():
    rec.pop("wiki", None)
    rec.pop("raw", None)
    if os.path.isfile(os.path.join(IMGD, nid + ".jpg")):
        rec["img"] = 1
        have += 1
    else:
        rec.pop("img", None)

with open(DATA, "w", encoding="utf-8") as fh:
    json.dump(feat, fh, ensure_ascii=False, separators=(",", ":"))

size = os.path.getsize(DATA)
print("ماهواره‌ها: %d | با تصویر: %d | بدون تصویر: %d | حجم پرونده: %d بایت"
      % (len(feat), have, len(feat) - have, size))
