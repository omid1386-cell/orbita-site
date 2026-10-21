#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ماژول تاریخچهٔ پرتاب پایگاه‌ها — گام ۲ (روحیهٔ ترکیبی)

هر اجرا با ۱ درخواست، پرتاب‌های انجام‌شده از آخرین هم‌گام‌سازی را می‌گیرد و:
  ۱) آمار پایگاه‌های بذرخورده را جلو می‌برد (کل/موفق/ناموفق)
  ۲) دروازهٔ درج روایی را اجرا می‌کند:
       • شاخص (شکست، سرنشین‌دار، فراتر از مدار زمین، پرتابگرِ تازه برای آن پایگاه)
            ← «پیش‌نویس برای قلم انسان» در پروندهٔ وضعیت؛ انتشار خودکار ممنوع
       • عادیِ درج‌شدنی (محمولهٔ ناآشنا برای تاریخچهٔ آن پایگاه، زیر سقف ماهانه)
            ← ردیف کامل دوزبانه با تحلیل واقعیت‌محور یکتا، نشان‌دار auto
       • تکراری/منظومه‌ای ← فقط آمار
نخستین اجرا فقط نشانگر زمان را می‌کارد (بدون بلعیدن گذشته).
حالت پیش‌فرض گزارش است؛ --apply می‌نویسد. --since=YYYY-MM-DD برای آزمون.
"""
import json, sys, os, re, urllib.request, datetime

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITES = os.path.join(BASE, 'data', 'sites.json')
STATE = os.path.join(BASE, 'data', 'site_history_state.json')
SMAP = os.path.join(BASE, 'tools', 'site_map.json')
DICT = os.path.join(BASE, 'tools', 'dict_extra.json')
UPC = os.path.join(BASE, 'data', 'upcoming.json')
UA = 'OrbitaEducationalApp/1.0 (contact: orbita.app.dev@gmail.com)'

MEGA_RE = re.compile(r'starlink|oneweb|kuiper|leo \(l|qianfan|guowang|bluebird', re.I)
BEYOND = re.compile(r'lunar|moon|mars|helio|interplanet|escape|l1|l2|trans', re.I)
CREWED = re.compile(r'crew|human|astronaut|shenzhou|soyuz ms|gaganyaan', re.I)
MONTH_CAP = 2


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)


def site_for(launch, smap):
    loc, pad = launch.get('location') or '', launch.get('pad') or ''
    for rule in smap.get('pad_rules', []):
        if rule['location'] == loc and rule['pad_contains'] in pad:
            return rule['site']
    return smap.get('locations', {}).get(loc)


def harvest_dicts():
    d = {'rocket': {}, 'mtype': {}, 'orbit': {}, 'subs': {}}
    try:
        upc = json.load(open(UPC, encoding='utf-8'))
        rows = upc.get('launches') or []
        for r in rows:
            for key, fa_k, en_k in (('rocket', 'rocket_fa', 'rocket_en'),
                                    ('mtype', 'mtype_fa', 'mtype_en'), ('orbit', 'orbit_fa', 'orbit_en')):
                if r.get(en_k) and r.get(fa_k):
                    d[key].setdefault(r[en_k], r[fa_k])
    except Exception:
        pass
    try:
        x = json.load(open(DICT, encoding='utf-8'))
        for k in ('rocket', 'mtype', 'orbit'):
            d[k].update(x.get(k) or {})
        d['subs'] = x.get('payload_subs') or {}
    except Exception:
        pass
    return d


def payload_fa(mission, subs):
    t = mission or 'محمولهٔ اعلام‌نشده'
    for en, fa in subs.items():
        t = t.replace(en, fa)
    return t


def main():
    apply_mode = '--apply' in sys.argv
    since = None
    for a in sys.argv:
        if a.startswith('--since='):
            since = a.split('=')[1]
    today = datetime.date.today().isoformat()
    now_iso = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

    sites = json.load(open(SITES, encoding='utf-8'))
    by_id = {s['id']: s for s in sites}
    smap = json.load(open(SMAP, encoding='utf-8'))
    dicts = harvest_dicts()

    state = {'last_sync': None, 'drafts': []}
    if os.path.exists(STATE):
        state = json.load(open(STATE, encoding='utf-8'))

    marker = since or state.get('last_sync')
    if not marker:
        print('نخستین اجرا: فقط نشانگر زمان کاشته می‌شود (گذشته بلعیده نمی‌شود).')
        if apply_mode:
            state['last_sync'] = now_iso
            open(STATE, 'w', encoding='utf-8').write(json.dumps(state, ensure_ascii=False, indent=1))
            print('✅ نشانگر: %s' % now_iso)
        else:
            print('حالت گزارش بود؛ برای کاشت نشانگر: --apply')
        return

    try:
        res = fetch('https://ll.thespacedevs.com/2.2.0/launch/previous/?mode=list&limit=30&net__gte=%s' % marker)
    except Exception as e:
        print('⛔ دروازهٔ اعتبارسنجی: %s — لغو شد.' % e)
        sys.exit(2)
    launches = sorted(res.get('results', []), key=lambda r: r['net'])
    print('پرتاب‌های انجام‌شده از %s: %d' % (marker[:10], len(launches)))

    bumps, autos, drafts, skipped = [], [], [], []
    for L in launches:
        st = (L.get('status') or {}).get('abbrev', '')
        if st not in ('Success', 'Failure', 'Partial Failure'):
            continue
        sid = site_for(L, smap)
        if not sid or sid not in by_id:
            skipped.append((L, 'پایگاه بی‌نگاشت: ' + str(L.get('location'))[:36]))
            continue
        s = by_id[sid]
        ok = (st == 'Success')

        # ——— ۱) آمار
        if 'stats_total' in s:
            s['stats_total'] += 1
            if ok:
                s['stats_success'] += 1
            else:
                s['stats_fail'] += 1
            s['stats_asof'] = today
            bumps.append((sid, st))

        # ——— ۲) دروازهٔ روایت
        name = L.get('name') or ''
        mission = L.get('mission') or name.split(' | ')[-1]
        rk = name.split(' | ')[0]
        orbit = L.get('orbit') or ''
        mtype = L.get('mission_type') or ''
        hist = s.get('launches') or []
        def fam(x):
            x = str(x or '')
            x = re.sub(r'\s+Block\s*\d+\w*', '', x)
            x = re.sub(r'\s+Full Thrust', '', x)
            x = re.sub(r'^(H3)-\d+\w*', r'\1', x)
            x = re.sub(r'^(Ceres-1)S', r'\1', x)
            return x.strip()
        hist_rockets = {fam(h.get('rocket')) for h in hist}
        hist_payload_text = ' '.join(str(h.get('payload', '')) for h in hist)

        notable = []
        if not ok:
            notable.append('شکست/ناهنجاری')
        if CREWED.search(name + ' ' + mtype):
            notable.append('سرنشین‌دار')
        if BEYOND.search(str(orbit) + ' ' + mission):
            notable.append('فراتر از مدار زمین')
        if fam(rk) not in hist_rockets:
            notable.append('نخستین حضور این پرتابگر در تاریخچهٔ پایگاه')
        if notable:
            drafts.append({'site': sid, 'net': L['net'], 'name': name, 'mission': mission,
                           'rocket': rk, 'status': st, 'orbit': orbit, 'mtype': mtype,
                           'why': notable, 'added_on': today})
            continue

        if MEGA_RE.search(name):
            skipped.append((L, 'منظومه‌ای/تکراری — فقط آمار'))
            continue
        token = re.sub(r'[^A-Za-z0-9]', '', mission.split('(')[0]).lower()[:12]
        if token and token in re.sub(r'[^A-Za-z0-9]', '', hist_payload_text).lower():
            skipped.append((L, 'محمولهٔ آشنا — فقط آمار'))
            continue
        month = L['net'][:7]
        auto_this_month = sum(1 for h in hist if h.get('auto') and str(h.get('date', '')).startswith(month))
        if auto_this_month >= MONTH_CAP:
            skipped.append((L, 'سقف ماهانهٔ روایت پر است — فقط آمار'))
            continue

        # ——— ردیف خودکار دوزبانه با تحلیل واقعیت‌محور یکتا
        rk_fa = dicts['rocket'].get(rk, rk)
        mt_fa = dicts['mtype'].get(mtype, mtype or 'پرتاب مداری')
        orb_fa = dicts['orbit'].get(orbit, orbit or 'اعلام‌نشده')
        pfa = payload_fa(mission, dicts['subs'])
        an_fa = '✅ <b>تحلیل:</b> پرتاب %s با %s در %s انجام شد و محموله در مسیر %s قرار گرفت؛ ثبت خودکار از کتابخانهٔ پرتاب ۲.' % (
            pfa, rk_fa, L['net'][:10], orb_fa)
        an_en = '✅ <b>Analysis:</b> %s launched on %s aboard %s toward %s; auto-recorded from Launch Library 2.' % (
            mission, L['net'][:10], rk, orbit or 'its target orbit')
        row = {
            'date': L['net'][:10], 'rocket': rk, 'payload': pfa,
            'mtype': mt_fa, 'orbit': orb_fa, 'success': ok,
            'time_utc': L['net'][11:16], 'mass': '—', 'rocket_var': rk,
            'inc': '—', 'duration': '—',
            'analysis': an_fa, 'has_photo': False, 'photo_url': '',
            'mass_fa': '—', 'mass_en': '—',
            'inclination': '—', 'inclination_fa': '—', 'inclination_en': '—',
            'analysis_fa': an_fa, 'analysis_en': an_en,
            'auto': True, 'll2_id': L.get('id', ''),
        }
        hist.append(row)
        s['launches'] = hist
        autos.append((sid, mission))

    # ——— گزارش
    print('— جلوبرد آمار: %d پایگاه-رویداد' % len(bumps))
    for sid, st in bumps[:10]:
        print('   • %s (%s)' % (sid, st))
    print('— ردیف روایی خودکار: %d' % len(autos))
    for sid, m in autos:
        print('   • %s ← %s' % (sid, m[:44]))
    print('— پیش‌نویس شاخص (منتظر قلم انسان): %d' % len(drafts))
    for d in drafts:
        print('   • %s | %s | %s' % (d['site'], d['name'][:40], '، '.join(d['why'])))
    print('— فقط آمار/رد: %d' % len(skipped))
    for L, why in skipped[:8]:
        print('   • %s — %s' % ((L.get('name') or '')[:40], why))

    if not apply_mode:
        print('\nحالت گزارش بود؛ هیچ پرونده‌ای نوشته نشد. برای اعمال: --apply')
        return

    os.system('cp "%s" /tmp/sites.pre_history.json' % SITES)
    open(SITES, 'w', encoding='utf-8').write(json.dumps(sites, ensure_ascii=False, indent=1))
    state['last_sync'] = now_iso
    state.setdefault('drafts', []).extend(drafts)
    open(STATE, 'w', encoding='utf-8').write(json.dumps(state, ensure_ascii=False, indent=1))
    print('\n✅ اعمال شد: %d جلوبرد آمار، %d ردیف خودکار، %d پیش‌نویس ذخیره در %s' % (
        len(bumps), len(autos), len(drafts), os.path.basename(STATE)))


if __name__ == '__main__':
    main()
