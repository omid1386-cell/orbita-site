#!/usr/bin/env python3
"""Download a real photo for every mission from Wikipedia/Wikimedia into assets/img/missions/."""
import json, os, re, time, urllib.parse, urllib.request

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "assets", "img", "missions")
os.makedirs(OUT, exist_ok=True)
UA = {"User-Agent": "OrbitaAerospaceApp/1.0 (educational project)"}

TITLES = {
 "artemis1":"Artemis 1","artemis2":"Artemis 2","artemis3":"Artemis 3",
 "roman":"Nancy Grace Roman Space Telescope","jwst":"James Webb Space Telescope",
 "hubble":"Hubble Space Telescope","starship":"SpaceX Starship","iss":"International Space Station",
 "tiangong":"Tiangong","crewdragon":"SpaceX Dragon 2","starliner":"Boeing Starliner",
 "dreamchaser":"Dream Chaser (spacecraft)","gateway":"Lunar Gateway","europaclipper":"Europa Clipper",
 "dragonfly":"Dragonfly (spacecraft)","psyche":"Psyche (spacecraft)",
 "perseverance":"Perseverance rover","curiosity":"Curiosity (rover)","msr":"Mars sample-return mission",
 "parker":"Parker Solar Probe","voyager":"Voyager program","newhorizons":"New Horizons",
 "juno":"Juno (spacecraft)","lucy":"Lucy (spacecraft)","osirisapex":"OSIRIS-REx",
 "chang-e-6":"Chang'e 6 mission","chang-e-7":"Chang'e 7 lunar mission","ilrs":"International Lunar Research Station",
 "tianwen1":"Tianwen-1","tianwen2":"Tianwen-2","chandrayaan3":"Chandrayaan-3",
 "gaganyaan":"Gaganyaan","adityal1":"Aditya-L1","nisar":"NISAR",
 "slim":"SLIM (spacecraft)","hayabusa2":"Hayabusa2",
 "mmx":"Martian Moons eXploration","juice":"Jupiter Icy Moons Explorer","bepicolombo":"BepiColombo",
 "hera":"Hera (space mission)","dart":"Double Asteroid Redirection Test","solarorbiter":"Solar Orbiter",
 "euclid":"Euclid (spacecraft)","plato":"PLATO (spacecraft)","exomars":"Rosalind Franklin (rover)",
 "ariane6":"Ariane 6 rocket","vegac":"Vega C","starlink":"Starlink","kuiper":"Kuiper Systems",
 "oneweb":"OneWeb satellite constellation","galileo":"Galileo (satellite navigation)",
 "beidou":"BeiDou","gpsiii":"GPS Block III","navic":"Indian Regional Navigation Satellite System",
 "copernicus":"Copernicus Programme","pace":"PACE (satellite)","spherex":"SPHEREx telescope",
 "im1":"Intuitive Machines IM-1 Odysseus","blueghost1":"Blue Ghost Mission 1","axiom":"Axiom Station","vasthaven":"Haven-1",
 "orbitalreef":"Orbital Reef","polarisdawn":"Polaris Dawn","shenzhou":"Shenzhou program",
 "nuri":"Nuri (rocket)","danuri":"Danuri","hope":"Emirates Mars Mission","mbrexplorer":"Emirates Mission to the Asteroid Belt",
 "khayyam":"Khayyam (satellite)","pars1":"Pars 1 (satellite)","simorgh-saman":"Simorgh (rocket)",
 "chamran1":"Chamran-1","soraya":"Soraya (satellite)","noor3":"Noor (satellite)",
 "zafar":"Zafar (satellite)","nahid2":"Nahid (satellite)","vulcan":"Vulcan Centaur","newglenn":"New Glenn",
 "h3":"H3 (rocket)","lm10":"Long March 10","angara":"Angara (rocket family)","electron":"Rocket Lab Electron",
 "eris":"Eris rocket Gilmour","spectrum":"Spectrum launch vehicle Isar","zhuque2":"Zhuque-2 rocket","chandrayaan4":"Chandrayaan-4",
 "luna26":"Luna 26","lisa":"Laser Interferometer Space Antenna",
}

def api(url):
    delay = 1.0
    for attempt in range(6):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=25) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(delay); delay *= 1.8; continue
            raise
    raise RuntimeError("rate limited")

def summary_image(title):
    try:
        d = api("https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title.replace(" ", "_")))
        th = d.get("thumbnail", {}).get("source")
        if th:
            return th
    except Exception as e:
        print('summary err', title, repr(e)[:120])
        return None
    return None

def title_image(title):
    try:
        d = api("https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageimages"
                "&piprop=thumbnail&pithumbsize=500&titles=" + urllib.parse.quote(title))
        pages = (d.get("query") or {}).get("pages") or {}
        for p in pages.values():
            src = (p.get("thumbnail") or {}).get("source")
            if src:
                return src
    except Exception as e:
        print("title err", title, repr(e)[:90])
    return None

def search_image(q):
    try:
        d = api("https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrlimit=3"
                "&gsrsearch=" + urllib.parse.quote(q) + "&prop=pageimages&piprop=thumbnail&pithumbsize=500")
        pages = (d.get("query") or {}).get("pages") or {}
        for p in sorted(pages.values(), key=lambda x: x.get("index", 99)):
            src = (p.get("thumbnail") or {}).get("source")
            if src:
                return src
    except Exception:
        return None
    return None

missions = json.load(open(os.path.join(BASE, "data", "missions.json"), encoding="utf-8"))
ok = miss = 0
for m in missions:
    mid = m["id"]
    dest_rel = f"assets/img/missions/{mid}.jpg"
    dest = os.path.join(BASE, dest_rel)
    if os.path.exists(dest) and os.path.getsize(dest) > 4000:
        m["img"] = dest_rel; ok += 1; continue
    title = TITLES.get(mid, m["en"])
    url = title_image(title) or summary_image(title) or search_image(title) or search_image(m["en"] + " spacecraft")
    if not url:
        m["img"] = ""; miss += 1; print("NO IMAGE:", mid, title); continue
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=40) as r:
            data = r.read()
        open(dest, "wb").write(data)
        m["img"] = dest_rel; ok += 1
        print("ok", mid, len(data)//1024, "KB")
    except Exception as e:
        m["img"] = ""; miss += 1; print("FAIL", mid, e)
    time.sleep(1.1)

json.dump(missions, open(os.path.join(BASE, "data", "missions.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=None, separators=(",", ":"))
print("done:", ok, "images,", miss, "missing")
