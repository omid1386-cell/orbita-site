#!/usr/bin/env python3
"""RASPEHR staging smoke after user-approved deployment.
Example: python raspehr-3d/tools/staging-smoke.py https://YOUR-RENDER-URL.onrender.com --output staging.json
This does not publish, edit remote files, or claim a physical-device test.
"""
from __future__ import annotations
import argparse,json,sys,urllib.request,urllib.error,urllib.parse,time
from datetime import datetime, timezone

def fetch(origin,relative,timeout=15):
    url=urllib.parse.urljoin(origin.rstrip('/')+'/',relative)
    req=urllib.request.Request(url,headers={'User-Agent':'RASPEHR-Release-Smoke/1.0'})
    with urllib.request.urlopen(req,timeout=timeout) as response:
        
        data=response.read(20_000_001)
        if len(data)>20_000_000:raise ValueError('Resource exceeded the 20 MB inspection limit')
        return response.status,response.headers.get('Content-Type',''),data,response.geturl()

def run(origin):
    checks=[]
    def step(label,relative,expected=None,ctype=None):
        try:
            status,typ,data,url=fetch(origin,relative)
            if status!=200: raise ValueError(f'HTTP {status}')
            if expected and expected.encode('utf-8') not in data:raise ValueError('Required markup absent: '+expected)
            if ctype and ctype not in typ:raise ValueError('Unexpected MIME: '+typ)
            checks.append({'id':label,'result':'PASS','bytes_read':len(data),'url':url})
            return data
        except Exception as e:
            checks.append({'id':label,'result':'FAIL','error':str(e)[:300]})
            return None
    shell=step('original_2d_home','index.html','raspehrStage5Toggle','text/html')
    html=step('three_dimensional_page','raspehr-3d/index.html','mobileMainSheet','text/html')
    for rel in [
        'assets/js/raspehr-stage5-switch.js',
        'raspehr-3d/assets/js/globe-engine.js',
        'raspehr-3d/assets/js/entity-markers.js',
        'raspehr-3d/assets/js/local-facility-view.js',
        'raspehr-3d/assets/js/mobile-bottom-sheet.js',
        'raspehr-3d/assets/css/priority5-visual.css',
        'raspehr-3d/assets/js/entity-stage3-ui.js',
        'raspehr-3d/assets/js/prototype.js',
        'assets/vendor/three.min.js']:
        step('static:'+rel,rel)
    for rel in ['data/companies.json','data/sites.json','data/recovery_sites.json']:
        raw=step('data:'+rel,rel,ctype='json')
        if raw:
            try:json.loads(raw)
            except Exception as e:checks.append({'id':'valid_json:'+rel,'result':'FAIL','error':str(e)})
    warnings=[
        'فقط در دسترس‌بودن HTTP و وجود فایل‌ها آزموده شده؛ کلیک روی نقشه، WebGL و نمای محلی باید روی مرورگر واقعی جدا بررسی شود.',
        'اتصال زنده OpenAerialMap/OSM و اعتبار مختصات ۲۳ نقطه مرجع در این اسکریپت تأیید نمی‌شود.',
        'عملکرد گوشی فیزیکی و GPU آن فقط با ثبت نتیجه آزمون انسانی قابل تأیید است.',
        'نتیجه PASS این اسکریپت مجوز انتشار عمومی محسوب نمی‌شود.'
    ]
    return {'project':'RASPEHR','timestamp_utc':datetime.now(timezone.utc).isoformat(),'base_url':origin,
        'checks':checks,'http_checks_passed':sum(x['result']=='PASS' for x in checks),
        'http_checks_failed':sum(x['result']=='FAIL' for x in checks),
        'stage':'POST_DEPLOYMENT_SMOKE','warnings':warnings,'production_approval':False}

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('url',help='deployed origin, for example https://orbita-site.onrender.com')
    ap.add_argument('--output',default='RASPEHR_STAGING_SMOKE_RESULTS.json')
    args=ap.parse_args()
    parts=urllib.parse.urlsplit(args.url)
    if parts.scheme not in ('http','https') or not parts.netloc:ap.error('url must include a valid http(s) origin')
    report=run(args.url)
    with open(args.output,'w',encoding='utf-8') as f:json.dump(report,f,ensure_ascii=False,indent=2)
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if report['http_checks_failed']==0 else 1
if __name__=='__main__':sys.exit(main())
