# -*- coding: utf-8 -*-
"""دریافت تصویر ماهواره‌های شاخص از ویکی‌پدیا و ذخیرهٔ محلی."""
import json, os, time, urllib.parse, urllib.request, io
from PIL import Image

UA = "OrbitaAerospaceApp/1.0 (https://github.com/orbita-app; orbita-app@example.com) python-urllib/3"
API = "https://en.wikipedia.org/w/api.php"
OUT = "assets/img/sats"
os.makedirs(OUT, exist_ok=True)

BROWSER = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
           "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")

def get(url, browser=False):
    h = {"User-Agent": BROWSER if browser else UA}
    if browser:
        h["Referer"] = "https://en.wikipedia.org/"
        h["Accept"] = "image/avif,image/webp,image/*,*/*;q=0.8"
    r = urllib.request.Request(url, headers=h)
    return urllib.request.urlopen(r, timeout=90).read()

def main():
    feat = json.load(open("data/sat_featured.json", encoding="utf-8"))
    titles = {}
    for sid, v in feat.items():
        t = v.get("wiki")
        if t:
            titles.setdefault(t, []).append(sid)
    keys = list(titles)
    thumbs = {}
    for i in range(0, len(keys), 20):
        batch = keys[i:i + 20]
        q = {"action": "query", "format": "json", "prop": "pageimages",
             "piprop": "thumbnail|original", "pithumbsize": "640",
             "titles": "|".join(batch), "redirects": "1"}
        data = json.loads(get(API + "?" + urllib.parse.urlencode(q)))
        pages = data.get("query", {}).get("pages", {})
        norm = {}
        for r in data.get("query", {}).get("redirects", []):
            norm[r["to"]] = r["from"]
        for p in pages.values():
            th = p.get("thumbnail", {}).get("source")
            if not th:
                continue
            name = p["title"]
            for orig in (name, norm.get(name)):
                if orig in titles:
                    thumbs[orig] = th
        print("دسته", i // 20 + 1, "دریافت شد:", len(thumbs))
        time.sleep(1.1)

    ok = 0
    for t, url in thumbs.items():
        for sid in titles[t]:
            path = os.path.join(OUT, sid + ".jpg")
            if os.path.exists(path):
                ok += 1
                continue
            try:
                raw = None
                for attempt in range(4):
                    try:
                        raw = get(url, browser=True); break
                    except Exception as ex:
                        if "429" not in str(ex) or attempt == 3:
                            raise
                        time.sleep(8 * (attempt + 1))
                im = Image.open(io.BytesIO(raw)).convert("RGB")
                w, h = im.size
                if w > 640:
                    im = im.resize((640, int(h * 640 / w)), Image.LANCZOS)
                im.save(path, quality=85, optimize=True)
                ok += 1
            except Exception as e:
                print("خطا", sid, t, e)
            time.sleep(0.9)
    print("تصویر ذخیره‌شده:", ok, "از", len(feat))

    have = {f[:-4] for f in os.listdir(OUT) if f.endswith(".jpg")}
    for sid, v in feat.items():
        v["img"] = 1 if sid in have else 0
        v.pop("wiki", None)
        v.pop("raw", None)
    json.dump(feat, open("data/sat_featured.json", "w", encoding="utf-8"),
              ensure_ascii=False, separators=(",", ":"))
    print("بدون تصویر:", sorted(s for s in feat if not feat[s]["img"]))

if __name__ == "__main__":
    main()
