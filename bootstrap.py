#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Rebuild ORBITA from ORBITA-restore.md plus a network fetch of the binaries.

    python3 bootstrap.py /home/user/uploads/ORBITA-restore.md
"""
import os, re, sys, subprocess, urllib.request

ROOT = "/home/user/spaceapp"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/126 Safari/537.36"}

VENDOR = {
    "assets/vendor/maplibre-gl.js":  "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js",
    "assets/vendor/maplibre-gl.css": "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css",
    "assets/vendor/three.min.js":    "https://unpkg.com/three@0.150.1/build/three.min.js",
    "assets/vendor/satellite.min.js":"https://unpkg.com/satellite.js@5.0.0/dist/satellite.min.js",
}


def split_bundle(path):
    txt = open(path, encoding="utf-8").read()
    n = 0
    for m in re.finditer(r"<<<<<< FILE: (.+?)\n(.*?)\n>>>>>> END", txt, re.S):
        rel, body = m.group(1).strip(), m.group(2)
        dst = os.path.join(ROOT, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        open(dst, "w", encoding="utf-8").write(body)
        n += 1
    return n


def grab(url, dst):
    full = os.path.join(ROOT, dst)
    if os.path.exists(full) and os.path.getsize(full) > 1000:
        return True
    os.makedirs(os.path.dirname(full), exist_ok=True)
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=120) as r, open(full, "wb") as f:
            f.write(r.read())
        return True
    except Exception as e:
        print(f"   ناموفق {dst}: {e}")
        return False


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "/home/user/uploads/ORBITA-restore.md"
    os.makedirs(ROOT, exist_ok=True)

    print("۱/۴ استخراج پرونده‌های متنی…")
    print(f"    {split_bundle(src)} پرونده نوشته شد")

    print("۲/۴ دریافت کتابخانه‌ها…")
    ok = sum(grab(u, d) for d, u in VENDOR.items())
    print(f"    {ok} از {len(VENDOR)}")

    print("۳/۴ ساخت فهرست ماهواره‌ها از سلست‌رک (چند دقیقه)…")
    if os.path.exists(f"{ROOT}/data/sats.json"):
        print("    از قبل موجود است")
    else:
        subprocess.run([sys.executable, "build_sats.py"], cwd=ROOT)

    print("۴/۴ دریافت بافت‌های زمین…")
    print("    اجرا کن: python3 fetch_images.py   (بافت‌ها و تصاویر)")
    print()
    print("سپس: python3 serve.py   →   http://localhost:5173")
    print("نکته: تا نیامدن بافت‌ها، کرهٔ سه‌بعدی ساده دیده می‌شود.")


if __name__ == "__main__":
    main()
