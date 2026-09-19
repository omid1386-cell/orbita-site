#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Restore every binary asset ORBITA needs, in the right order.

    python3 restore_media.py            # everything
    python3 restore_media.py textures   # just the globe textures
    python3 restore_media.py photos     # just the 195 photos
    python3 restore_media.py vendor     # just the JS libraries

Safe to re-run: anything already present is skipped.
"""
import os
import subprocess
import sys
import urllib.request

BASE = os.path.dirname(os.path.abspath(__file__))
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/126 Safari/537.36"}

VENDOR = {
    "assets/vendor/maplibre-gl.js":   "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js",
    "assets/vendor/maplibre-gl.css":  "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css",
    "assets/vendor/three.min.js":     "https://unpkg.com/three@0.150.1/build/three.min.js",
    "assets/vendor/satellite.min.js": "https://unpkg.com/satellite.js@5.0.0/dist/satellite.min.js",
}


def run(script, note):
    path = os.path.join(BASE, script)
    if not os.path.exists(path):
        print(f"  ✗ {script} پیدا نشد")
        return
    print(f"\n▶ {note}")
    subprocess.run([sys.executable, script], cwd=BASE)


def do_vendor():
    print("\n▶ کتابخانه‌ها")
    for rel, url in VENDOR.items():
        dst = os.path.join(BASE, rel)
        if os.path.exists(dst) and os.path.getsize(dst) > 1000:
            print(f"  • {os.path.basename(rel)} از قبل موجود")
            continue
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=180) as r, open(dst, "wb") as f:
                f.write(r.read())
            print(f"  ✓ {os.path.basename(rel)}  {os.path.getsize(dst)/1024:.0f} KB")
        except Exception as e:
            print(f"  ✗ {os.path.basename(rel)}: {e}")


def do_photos():
    """Mission photos, then satellite photos, then relink the img flags."""
    run("fetch_images.py", "تصاویر مأموریت‌ها (۸۸ عدد، حدود ۵ دقیقه)")

    # fetch_sat_images.py needs the wiki titles that link_images.py strips out,
    # so regenerate the featured file first, download, then relink.
    feat = os.path.join(BASE, "data", "sat_featured.json")
    import json
    needs_wiki = True
    if os.path.exists(feat):
        with open(feat, encoding="utf-8") as fh:
            d = json.load(fh)
        needs_wiki = not any("wiki" in v for v in d.values())
    if needs_wiki:
        run("build_featured.py", "بازسازی فهرست شاخص (برای عناوین ویکی‌پدیا)")

    run("fetch_sat_images.py", "تصاویر ماهواره‌ها (۱۰۷ عدد، حدود ۵ دقیقه)")
    run("link_images.py", "اتصال تصاویر به داده و پاک‌سازی کلیدهای موقت")


def summary():
    print("\n" + "=" * 52)
    for rel in ("assets/tex", "assets/img/sats", "assets/img/missions",
                "assets/vendor", "assets/geo"):
        p = os.path.join(BASE, rel)
        if not os.path.isdir(p):
            print(f"  {rel:22s} — موجود نیست")
            continue
        files = [f for f in os.listdir(p) if not f.startswith(".")]
        size = sum(os.path.getsize(os.path.join(p, f)) for f in files)
        print(f"  {rel:22s} {len(files):4d} پرونده  {size/1048576:6.1f} MB")
    sats = os.path.join(BASE, "data", "sats.json")
    if os.path.exists(sats):
        print(f"  {'data/sats.json':22s}         {os.path.getsize(sats)/1048576:6.1f} MB")
    else:
        print(f"  {'data/sats.json':22s} — موجود نیست، اجرا کن: python3 build_sats.py")
    print("=" * 52)
    print("سپس:  python3 serve.py   →   http://localhost:5173")


def main():
    what = (sys.argv[1] if len(sys.argv) > 1 else "all").lower()
    if what in ("all", "vendor"):
        do_vendor()
    if what in ("all", "textures", "tex"):
        run("fetch_textures.py", "بافت‌های کرهٔ زمین (حدود ۴۵ مگابایت دانلود)")
    if what in ("all", "photos", "img"):
        do_photos()
    if what == "all" and not os.path.exists(os.path.join(BASE, "data", "sats.json")):
        run("build_sats.py", "فهرست ۱۶ هزار جسم مداری از سلست‌رک")
    summary()


if __name__ == "__main__":
    main()
