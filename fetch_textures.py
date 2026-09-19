#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Rebuild the Earth textures in assets/tex/ from NASA Visible Earth.

Sources are large (the day map is ~30 MB before resizing), so each one is
streamed to a temporary file, downscaled with Image.draft() to keep memory
below the 2 GB sandbox limit, then written out as a progressive JPEG.

    python3 fetch_textures.py
"""
import os
import sys
import urllib.request

from PIL import Image

Image.MAX_IMAGE_PIXELS = None

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "assets", "tex")
TMP = "/tmp/orbita_tex"
os.makedirs(OUT, exist_ok=True)
os.makedirs(TMP, exist_ok=True)

UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/126 Safari/537.36"}

# name -> (url, target width, target height, jpeg quality, greyscale?)
JOBS = {
    "earth_day": (
        "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/"
        "world.topo.bathy.200412.3x21600x10800.jpg", 8192, 4096, 90, False),
    "earth_night": (
        "https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79765/"
        "dnb_land_ocean_ice.2012.13500x6750.jpg", 8192, 4096, 88, False),
    "earth_clouds": (
        "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/"
        "cloud_combined_2048.jpg", 4096, 2048, 88, False),
    "earth_normal": (
        "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73934/"
        "gebco_08_rev_elev_21600x10800.png", 4096, 2048, 88, True),
}


def fetch(url, dst):
    if os.path.exists(dst) and os.path.getsize(dst) > 100_000:
        print(f"    از قبل دانلود شده ({os.path.getsize(dst)/1048576:.1f} MB)")
        return True
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=600) as r, open(dst, "wb") as f:
            total = 0
            while True:
                chunk = r.read(1 << 20)
                if not chunk:
                    break
                f.write(chunk)
                total += len(chunk)
                sys.stdout.write(f"\r    دریافت {total/1048576:6.1f} MB")
                sys.stdout.flush()
        print()
        return True
    except Exception as e:
        print(f"\n    ناموفق: {e}")
        return False


def convert(src, name, w, h, q, grey):
    out = os.path.join(OUT, name + ".jpg")
    im = Image.open(src)
    im.draft("L" if grey else "RGB", (w, h))      # decode straight to a small size
    im = im.convert("L" if grey else "RGB").resize((w, h), Image.LANCZOS)
    if grey:
        im = im.convert("RGB")
    im.save(out, "JPEG", quality=q, optimize=True, progressive=True)
    print(f"    ساخته شد {name}.jpg  {w}x{h}  {os.path.getsize(out)/1048576:.2f} MB")


def make_specular():
    """Ocean mask derived from the elevation map: water is bright, land dark."""
    src = os.path.join(TMP, "earth_normal.src")
    out = os.path.join(OUT, "earth_spec.jpg")
    if not os.path.exists(src):
        print("    رد شد (نقشهٔ ارتفاع موجود نیست)")
        return
    im = Image.open(src)
    im.draft("L", (4096, 2048))
    im = im.convert("L").resize((4096, 2048), Image.LANCZOS)
    im = im.point(lambda v: 235 if v < 40 else 18)   # sea vs land
    im.convert("RGB").save(out, "JPEG", quality=84, optimize=True, progressive=True)
    print(f"    ساخته شد earth_spec.jpg  {os.path.getsize(out)/1048576:.2f} MB")


def make_stars():
    """Procedural starfield — no external source needed."""
    import random
    out = os.path.join(OUT, "stars.jpg")
    w, h = 4096, 2048
    im = Image.new("RGB", (w, h), (4, 6, 12))
    px = im.load()
    random.seed(42)
    for _ in range(26000):
        x, y = random.randrange(w), random.randrange(h)
        b = random.randint(90, 255)
        tint = random.choice([(1, 1, 1), (0.85, 0.9, 1), (1, 0.95, 0.85)])
        px[x, y] = (int(b * tint[0]), int(b * tint[1]), int(b * tint[2]))
        if b > 225:                                   # a few brighter stars bloom
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if 0 <= x + dx < w and 0 <= y + dy < h:
                    px[x + dx, y + dy] = (b // 3, b // 3, int(b / 2.6))
    im.save(out, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"    ساخته شد stars.jpg  {os.path.getsize(out)/1048576:.2f} MB")


def main():
    print("بازسازی بافت‌های کرهٔ زمین")
    print("منبع: NASA Visible Earth · حجم دانلود حدود ۴۵ مگابایت\n")

    for name, (url, w, h, q, grey) in JOBS.items():
        print(f"[{name}]")
        tmp = os.path.join(TMP, name + ".src")
        if fetch(url, tmp):
            try:
                convert(tmp, name, w, h, q, grey)
            except Exception as e:
                print(f"    خطا در تبدیل: {e}")

    print("\n[earth_spec]")
    make_specular()
    print("\n[stars]")
    make_stars()

    print("\nپایان. برای آزاد کردن فضا:  rm -rf /tmp/orbita_tex")
    have = sorted(os.listdir(OUT))
    print(f"بافت‌های موجود: {len(have)} → {', '.join(have)}")


if __name__ == "__main__":
    main()
