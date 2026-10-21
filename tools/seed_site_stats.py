#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""بذرپاشی تدریجی آمار واقعی پایگاه‌ها (جمع کل پرتاب و موفق‌ها) از کتابخانهٔ پرتاب ۲.
هر اجرا حداکثر N پایگاهِ بدون آمار را می‌کارد (پیش‌فرض ۳ = ۶ درخواست).
کاربرد: python3 tools/seed_site_stats.py [--apply] [--max-sites=3]
بدون --apply فقط گزارش می‌دهد."""
import json, sys, os, urllib.request, datetime

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITES = os.path.join(BASE, 'data', 'sites.json')
SMAP = os.path.join(BASE, 'tools', 'site_stats_map.json')
UA = 'OrbitaEducationalApp/1.0 (contact: orbita.app.dev@gmail.com)'

def count(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)['count']

def main():
    apply_mode = '--apply' in sys.argv
    maxn = 3
    for a in sys.argv:
        if a.startswith('--max-sites='):
            maxn = int(a.split('=')[1])
    sites = json.load(open(SITES, encoding='utf-8'))
    smap = json.load(open(SMAP, encoding='utf-8'))['locations']
    today = datetime.date.today().isoformat()

    pending = [s for s in sites if s['id'] in smap and 'stats_total' not in s]
    print('پایگاه‌های در صف بذرپاشی: %d | این نوبت: %d' % (len(pending), min(maxn, len(pending))))
    done = []
    for s in pending[:maxn]:
        lid = smap[s['id']]
        qp = ('pad__ids=%d' % lid['pad']) if isinstance(lid, dict) else ('location__ids=%d' % lid)
        try:
            total = count('https://ll.thespacedevs.com/2.2.0/launch/previous/?%s&limit=1' % qp)
            succ = count('https://ll.thespacedevs.com/2.2.0/launch/previous/?%s&status__ids=3&limit=1' % qp)
        except Exception as e:
            print('  ⛔ %s: %s — این نوبت رد شد' % (s['id'], e))
            break
        s['stats_total'] = total
        s['stats_success'] = succ
        s['stats_fail'] = total - succ
        s['stats_asof'] = today
        done.append((s['id'], total, succ))
        print('  ✓ %-16s کل=%d موفق=%d' % (s['id'], total, succ))
    if not done:
        print('چیزی برای کاشتن نبود یا خطا رخ داد.')
        return
    if apply_mode:
        open(SITES, 'w', encoding='utf-8').write(json.dumps(sites, ensure_ascii=False, indent=1))
        print('✅ ثبت شد: %d پایگاه.' % len(done))
    else:
        print('حالت گزارش بود؛ برای ثبت: --apply')

if __name__ == '__main__':
    main()
