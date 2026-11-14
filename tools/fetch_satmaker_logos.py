#!/usr/bin/env python3
"""Strict, audited logo retrieval for the 37 original ORBITA satellite makers.

Fetches media from companies' official websites first; curated public source links
are secondary. Does NOT create/recreate logos, use generic web favicons, or
modify any other ORBITA layer. PNG files are written only for validated results.
Run with --apply on a machine with internet access to update both data tables.
"""
from __future__ import annotations
import argparse
import csv
import io
import json
import re
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SAT_PATH = ROOT / 'data/companies_satmaker.json'
MERGED_PATH = ROOT / 'data/companies.json'
LOGO_DIR = ROOT / 'assets/img/logos/satmaker'
AUDIT_PATH = ROOT / 'docs/SATMAKER_LOGOS_AUDIT.csv'

# Human-confirmed company marks from brand press rooms / release images.
# These are SECONDARY fallbacks after the official company site. Logos
# themselves were visually reviewed; HTTP availability is checked at runtime.
CURATED = {
  'comat': 'https://www.aerospace-valley.com/sites/default/files/member-update/logo_153.jpeg',
  'mt-aerospace': 'https://www.bayern-innovativ.de/fileadmin/map/bilder/logos/kompetenzprofile/mt-aerospace-bayern-innovativ.jpg',
  'apco-technologies': 'https://espacemembre.gifen.fr/uploads/company_logo/l/o/g/o/logo-apco-67ff4a7d24868268688206.jpg',
  'dragonfly-space': 'https://media.licdn.com/dms/image/v2/D4E22AQGWkkPywcy9gA/feedshare-shrink_800/B4EZaqBtkoHoAk-/0/1746609298808?e=2147483647&t=n6bzQwHAS_AYYo1-XXS0L_P6KIesGQ6yWRCl1GSYmAY&v=beta',
  'simera-sense': 'https://cdn.lucidityinsights.com/uploads/startups/simera-sense.jpg',
  'cubespace': 'https://www.cubespace.co.za/img/default.687f9b7094435516bfab8a9e5e7335d0.jpg',
  'thales-alenia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Thales_Alenia_Space_Logo.svg/1280px-Thales_Alenia_Space_Logo.svg.png',
  'ohb': 'https://www.remotely.de/images/logos/12106_ohb-se_logo.png',
  'sstl': 'https://static.wixstatic.com/media/3d111e_36be0bf0b55d4bf48a55cc87cc539ef0~mv2.jpeg/v1/fill/w_800%2Ch_800%2Cal_c%2Cq_85%2Cenc_avif%2Cquality_auto/3d111e_36be0bf0b55d4bf48a55cc87cc539ef0~mv2.jpeg',
  'planet': 'https://mms.businesswire.com/media/20241021503372/en/1667152/23/logo.jpg',
  'york-space': 'https://cdn.pulse2.com/cdn/2026/03/York-Space-Systems-Logo.jpg',
  'astranis': 'https://cdn.prod.website-files.com/66db71cbfa4aa686aab4dc62/69b1cb2bbcd34dc1e369c451_astranis-a-logo.jpg',
  'iceye': 'https://mmx.prnewswire.com/media/MS1800791/ICEYE-Logo.jpg?id=OA2981753&p=facebook',
  'satellogic': 'https://satellogic.com/wp-content/uploads/2021/07/Satellogic_Logo_PNG_Horizontal_1_Positivo-THUMBNAIL.png',
  'blue-canyon': 'https://mms.businesswire.com/media/20210726005141/en/893703/5/BCT_Logo_High_Res.jpg?download=1',
  'gomspace': 'https://assets.rohde-schwarz.com/public/image/corporate/logos/gomspace-logo-rohde-schwarz_200_116537_1024_576_1.jpg',
  'nanoavionics': 'https://images.squarespace-cdn.com/content/v1/5fefc0e10400f4089005e773/1610216642752-VN2FZ2J0OXPP4T3OTABV/nano%2Bavionics.jpg',
  'endurosat': 'https://api.platform-production.ensun.io/file/managed-company-logo/6825d882aebe66f582a8a0af',
  'redwire': 'https://mms.businesswire.com/media/20221108006239/en/1630253/23/redwire-logo-horizontal-black-red_%281%29.jpg',
  'aac-clyde': 'https://images.dagensps.se/app/uploads/2023/08/aac-clyde-logo.png',
  'all-space': 'https://mma.prnewswire.com/media/1869635/ALL_SPACE_Logo.jpg?p=facebook',
  'bright-ascension': 'https://media2.spaceref.com/wp-content/uploads/2023/08/10104512/Bright-Ascension.png',
  'cobham-satcom': 'https://ram-tech.co.il/wp-content/uploads/2025/01/COBHAM-SATCOM.jpg',
}

# Prefer actual, explicit press-room brand assets before scraping generic page markup.
PREFERRED_SITES = {
  # Maxar Space Systems rebranded to Lanteris: do NOT fetch the old Maxar/Vantor logo.
  'maxar': 'https://www.lanterisspace.com/',
}

PRESS_PAGES = {
  'astranis': 'https://www.astranis.com/media',
  'gomspace': 'https://gomspace.com/brand-resources/',
  'satellogic': 'https://satellogic.com/news/press-room/',
}


def _request(session, url, timeout=12):
    if not url.startswith('https://'):
        raise ValueError('Only HTTPS content accepted')
    r = session.get(url, timeout=timeout, allow_redirects=True, headers={'Accept': 'text/html,image/webp,image/avif,image/png,image/jpeg,image/svg+xml,*/*;q=0.8'}, stream=True)
    r.raise_for_status()
    raw = r.raw.read(7_000_000 + 1)
    if len(raw) > 7_000_000:
        raise ValueError('Asset too large')
    return r.url, r.headers.get('content-type', '').split(';')[0], raw


def _logo_candidates(html_text, base, company_name):
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html_text, 'html.parser')
    seen = set()
    candidates = []
    def push(ref, score, why):
        if not ref or str(ref).startswith(('data:', 'blob:', 'javascript:')):
            return
        url = urllib.parse.urljoin(base, ref.strip())
        if not url.startswith('https://') or url in seen:
            return
        seen.add(url); candidates.append((score,url,why))
    for item in soup.select('script[type="application/ld+json"]'):
        try: data = json.loads(item.string or item.text or '')
        except Exception: continue
        def walk(obj, depth=0):
            if depth > 6:return
            if isinstance(obj,list):
                for sub in obj:walk(sub,depth+1)
            elif isinstance(obj,dict):
                typ = obj.get('@type',[])
                if isinstance(typ,str):typ=[typ]
                if any(t in ('Organization','Corporation','LocalBusiness','Brand') for t in typ):
                    logo=obj.get('logo')
                    if isinstance(logo,dict):logo=logo.get('url') or logo.get('contentUrl')
                    if isinstance(logo,str):push(logo,130,'official_jsonld_logo')
                for sub in obj.values():
                    if isinstance(sub,(list,dict)):walk(sub,depth+1)
        walk(data)
    for img in soup.select('img'):
        src = img.get('data-src') or img.get('data-lazy-src') or img.get('src')
        if not src:
            srcset = img.get('srcset','').split(',')
            src=srcset[-1].strip().split(' ')[0] if srcset else None
        if not src:continue
        classes=' '.join(img.get('class',[])).lower()
        alt=(img.get('alt') or '').lower()
        path=src.lower()
        in_header=bool(img.find_parent('header'))
        in_logo=bool(img.find_parent(class_=re.compile('logo|brand|navbar|site-identity',re.I)))
        score=0
        if 'logo' in path:score+=45
        if 'logo' in classes or 'brand' in classes:score+=50
        if 'logo' in alt:score+=25
        if in_header:score+=35
        if in_logo:score+=30
        # Disallow vague logo in irrelevant page sections (affiliates/partners).
        keys=[k for k in re.findall(r'[a-z]{4,}',company_name.lower()) if k not in ('space','systems','technologies','aerospace','satellite','company','limited')]
        if any(k in alt or k in path for k in keys):score+=25
        if img.find_parent(['footer']):score-=40
        if img.find_parent(class_=re.compile('sponsor|customer|partner',re.I)):score-=60
        if score>=85:push(src,score,'official_site_html_logo')
    for link in soup.select('link[rel]'):
        rel=' '.join(link.get('rel',[])).lower()
        # Apple touch-icons are official site marks, but not automatically treated as
        # full company wordmarks. Kept for audit instead of auto-publication.
        if 'apple-touch-icon' in rel:push(link.get('href'),25,'official_site_icon_for_review')
    return sorted(candidates,reverse=True)


def _convert_image(data, content_type):
    from PIL import Image, ImageOps, ImageStat
    if data.lstrip()[:100].startswith((b'<?xml',b'<svg')) or content_type == 'image/svg+xml':
        from cairosvg import svg2png
        # Harden SVG before passing to renderer. External references, script and
        # entity declarations are never permitted.
        low=data.lower()
        if any(x in low for x in (b'<script',b'<foreignobject',b'<!doctype',b'<!entity',b'href="http',b'href="//',b'xlink:href="http',b'onload=',b'onerror=')):
            raise ValueError('SVG has external or active content')
        data=svg2png(bytestring=data,output_width=1000)
    if content_type.startswith('text/') and not data.startswith((b'\x89PNG',b'\xff\xd8',b'RIFF',b'GIF8')):
        raise ValueError('HTML/text response, not an image')
    image=Image.open(io.BytesIO(data)); image.load()
    if image.width < 100 or image.height < 45:
        raise ValueError('Unusable dimensions')
    if image.width/image.height > 16 or image.height/image.width > 6:
        raise ValueError('Not a sensible logo aspect ratio')
    rgba=image.convert('RGBA')
    rgba.thumbnail((1000,600),Image.Resampling.LANCZOS)
    # Reject placeholders and solid 1-color squares already present in some
    # legacy files; do not mistake them for valid brand assets.
    sample=rgba.resize((32,32))
    distinct=len(set(sample.getdata()))
    if distinct <= 2:
        raise ValueError('Flat/placeholder image; not a verifiable company mark')
    buf=io.BytesIO();rgba.save(buf,format='PNG',optimize=True)
    return buf.getvalue(),(rgba.width,rgba.height)


def _site_domains(company):
    from urllib.parse import urlparse
    host=urlparse(company.get('site','')).hostname or ''
    if host.startswith('www.'):host=host[4:]
    return host


def _same_domain(link, site):
    from urllib.parse import urlparse
    host=(urlparse(link).hostname or '').lower()
    base=_site_domains(site).lower()
    return bool(base and (host==base or host.endswith('.'+base)))


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--apply',action='store_true',help='Write verified logos + update both existing JSON tables')
    p.add_argument('--max',type=int,default=37)
    p.add_argument('--only',default=None)
    args=p.parse_args()
    try:
        import requests
        from PIL import Image
        import bs4
        import cairosvg
    except ImportError:
        print('Missing dependencies: pip install requests pillow beautifulsoup4 cairosvg',file=sys.stderr);return 2
    sats=json.loads(SAT_PATH.read_text(encoding='utf8'))
    merged=json.loads(MERGED_PATH.read_text(encoding='utf8'))
    assert len({x['id'] for x in sats})==len(sats),'Duplicate satellite maker IDs'
    orig_other={x['id']:json.dumps(x,ensure_ascii=False,sort_keys=True) for x in merged if x.get('cat')!='satmaker'}
    merged_sat={x['id']:x for x in merged if x.get('cat')=='satmaker'}
    assert set(merged_sat)=={x['id'] for x in sats},'Satmaker data out of sync!'
    session=requests.Session()
    session.headers.update({'User-Agent':'Mozilla/5.0 ORBITA Satellite Company Logo Audit/1.0 (editorial reference)'})
    rows=[]; successes=0; changed=0
    for company in sats:
        if args.only and company['id']!=args.only:continue
        if len(rows)>=args.max:break
        cid=company['id']; title=company.get('en',''); logo=company.get('logo');
        # Genuine existing local file (unless solid-color placeholder) => never replace.
        local=ROOT / logo if isinstance(logo,str) and not logo.startswith(('http:','https:','data:')) else None
        if local and local.exists():
            try:
                _convert_image(local.read_bytes(),'image/png')
                rows.append(dict(id=cid,name=title,status='existing_local',source_url=str(logo),method='unchanged',note='Valid existing local asset'))
                continue
            except Exception:
                pass
        candidates=[]; errors=[]
        official=[PRESS_PAGES[cid]] if cid in PRESS_PAGES else []
        site=PREFERRED_SITES.get(cid,company.get('site',''))
        source_company=dict(company,site=site)
        if site: official.append(site)
        for page in official:
            try:
                final,ctype,raw=_request(session,page,timeout=12)
                if 'html' not in ctype:continue
                candidates.extend((score,url,why) for score,url,why in _logo_candidates(raw.decode('utf8','replace'),final,title) if score>=85 and (_same_domain(url,source_company) or _same_domain(url,{'site':final})))
            except Exception as exc:errors.append('site:'+str(exc)[:115])
        candidates.sort(reverse=True)
        candidates=candidates[:6]
        curated=CURATED.get(cid)
        if curated:candidates.append((60,curated,'curated_press_or_verified_brand_image'))
        chosen=None
        for score,url,why in candidates[:10]:
            try:
                final,ctype,raw=_request(session,url,timeout=12)
                png,dim=_convert_image(raw,ctype)
                chosen=(final,png,why,dim)
                break
            except Exception as exc:errors.append('asset:'+str(exc)[:100])
        if not chosen:
            rows.append(dict(id=cid,name=title,status='unresolved',source_url=curated or site,method='not_published',note='; '.join(errors[:3]) or 'No confirmed downloadable logo'))
            print('UNRESOLVED',cid,flush=True)
            continue
        final,png,method,dim=chosen
        filename=f'assets/img/logos/satmaker/{cid}.png'
        if args.apply:
            LOGO_DIR.mkdir(parents=True,exist_ok=True)
            (ROOT/filename).write_bytes(png)
            for rec in (company,merged_sat[cid]):
                rec['logo']=filename
                rec['logo_bg']='light'  # real logos may be dark; white panel prevents invisible black-on-black.
                rec.pop('logo_kind',None)  # clear 'orbita_editorial_nonofficial' when replaced with real image
        successes+=1
        rows.append(dict(id=cid,name=title,status='downloaded' if args.apply else 'verified_not_written',source_url=final,method=method,note=f'{dim[0]}x{dim[1]} px; validated image'))
        print('OK',cid,method,flush=True)
    if args.apply:
        assert orig_other=={x['id']:json.dumps(x,ensure_ascii=False,sort_keys=True) for x in merged if x.get('cat')!='satmaker'},'Forbidden layer modified'
        assert len(sats)==37,'Unexpected satellite-maker record count'
        SAT_PATH.write_text(json.dumps(sats,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        MERGED_PATH.write_text(json.dumps(merged,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        AUDIT_PATH.parent.mkdir(exist_ok=True,parents=True)
        with AUDIT_PATH.open('w',encoding='utf8',newline='') as fh:
            w=csv.DictWriter(fh,fieldnames=['id','name','status','source_url','method','note']);w.writeheader();w.writerows(rows)
    print(json.dumps({'candidate_count':len(sats),'processed':len(rows),'verified_images':successes,'unresolved':sum(r['status']=='unresolved' for r in rows),'applied':args.apply},ensure_ascii=False))
    return 0

if __name__=='__main__':sys.exit(main())
