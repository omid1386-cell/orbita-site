#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
تازه‌ساز تب «فرودهای پیشِ رو» — نسخهٔ ۲ (هم‌تراز با تب پرتاب‌ها)

حالت پیش‌فرض فقط گزارش است؛ --apply می‌نویسد.
توانایی‌ها:
  • به‌روزرسانی تاریخ/وضعیت ردیف‌های موجود + محل و نوع فرود اگر منبع جابه‌جا کرده باشد
  • حذف ردیف‌های انجام‌شده (و اعلام «منتظر ثبت در تاریخچه» — نثر تاریخچه با انسان)
  • افزودن ردیف تازه برای فرودهای بوستر اپراتورهای بازیاب با نگهبان کامل:
      نگاشت شناور/منطقه به ۲۰ سایت ما + ترجمهٔ کامل + لینک یدکی مصوب اپراتور؛
      هر چه ناقص بماند فقط گزارش می‌شود، وارد تب نمی‌شود
خط قرمزها: لینک اختصاصی و یادداشت‌های دست‌ساز هرگز بازنویسی نمی‌شوند؛
سهمیه: ۲ درخواست فهرستی + حداکثر --max-detail (پیش‌فرض ۶) درخواست تفصیلی.
"""
import json, sys, os, re, urllib.request, urllib.error, datetime

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, 'data', 'upcoming_landings.json')
UA = 'OrbitaEducationalApp/1.0 (contact: orbita.app.dev@gmail.com)'
API = 'https://ll.thespacedevs.com/2.2.0/launch/'

RECOVERY_LSPS = ('SpaceX', 'Blue Origin')
STATUS_MAP = {'Go': 'go', 'TBC': 'tbc', 'TBD': 'queued', 'Hold': 'queued'}

SHIP2SITE = {
    'OCISLY': 'recovery-ocisly', 'JRTI': 'recovery-jrti', 'ASOG': 'recovery-asog',
    'LZ-1': 'recovery-lz1', 'LZ-2': 'recovery-lz1', 'LZ-4': 'recovery-lz4',
    'LZ-40': 'recovery-lz40', 'LPV-1': 'recovery-jacklyn', 'Jacklyn': 'recovery-jacklyn',
}
SITE_FA = {
    'recovery-ocisly': 'شناور «البته هنوز دوستت دارم»', 'recovery-jrti': 'شناور «فقط دستورها را بخوان»',
    'recovery-asog': 'شناور «کمبودی از وقار»', 'recovery-lz1': 'منطقهٔ فرود ۱ کیپ‌کاناورال',
    'recovery-lz4': 'منطقهٔ فرود ۴ وندنبرگ', 'recovery-lz40': 'منطقهٔ فرود ۴۰ کیپ‌کاناورال',
    'recovery-jacklyn': 'شناور جکلین',
}
TYPE2LTYPE = {'ASDS': 'asds', 'RTLS': 'rtls'}
VEHICLE_FA = {'Falcon 9': 'مرحلهٔ اول فالکون ۹ بلوک ۵', 'Falcon Heavy': 'بوسترهای فالکون هوی',
              'New Glenn': 'مرحلهٔ اول نیو گلن'}
VEHICLE_EN = {'Falcon 9': 'Falcon 9 Block 5 first stage', 'Falcon Heavy': 'Falcon Heavy boosters',
              'New Glenn': 'New Glenn first stage'}
STREAM_FALLBACK = {'SpaceX': 'https://x.com/SpaceX', 'Blue Origin': 'https://x.com/blueorigin'}
CALENDAR_FALLBACK = {'SpaceX': 'https://www.spacex.com/launches/', 'Blue Origin': 'https://www.blueorigin.com/missions'}
OP_FA = {'SpaceX': 'اسپیس‌ایکس', 'Blue Origin': 'بلو اوریجین'}
ORIGIN = {
    ('Space Launch Complex 40',): ('پرتاب از مجتمع ۴۰ ایستگاه نیروی فضایی کیپ‌کاناورال در فلوریدا',
                                   'Launch from SLC-40, Cape Canaveral SFS, Florida'),
    ('Launch Complex 39A',): ('پرتاب از مجتمع ۳۹A مرکز فضایی کندی در فلوریدا',
                              'Launch from LC-39A, Kennedy Space Center, Florida'),
    ('Space Launch Complex 4',): ('پرتاب از مجتمع ۴-شرقی پایگاه نیروی فضایی وندنبرگ در کالیفرنیا',
                                  'Launch from SLC-4E, Vandenberg SFB, California'),
    ('Launch Complex 36',): ('پرتاب از مجتمع ۳۶ کیپ‌کاناورال در فلوریدا',
                             'Launch from LC-36, Cape Canaveral, Florida'),
}


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)


def norm(s):
    return ''.join(ch for ch in str(s or '').lower() if ch.isalnum())


def match(key, rows):
    key = norm(key)
    if len(key) < 4:
        return None
    for f in rows:
        if key in norm(f.get('name')) or key in norm(f.get('mission')):
            return f
    return None


def origin_of(pad_name, loc_name):
    for keys, val in ORIGIN.items():
        if any(k in (pad_name or '') for k in keys):
            return val
    return ('پرتاب از %s' % (loc_name or 'پایگاه اعلام‌نشده'), 'Launch from %s' % (loc_name or 'TBA'))


def landing_of(detail):
    """نخستین فرودِ دارای تلاش در مرحله‌های پرتابگر."""
    for s in ((detail.get('rocket') or {}).get('launcher_stage') or []):
        L = s.get('landing') or {}
        if L.get('attempt'):
            return L, (s.get('launcher') or {})
    return None, None


def main():
    apply_mode = '--apply' in sys.argv
    maxd = 6
    for a in sys.argv:
        if a.startswith('--max-detail='):
            maxd = int(a.split('=')[1])
    today = datetime.date.today().isoformat()
    horizon = (datetime.date.today() + datetime.timedelta(days=28)).isoformat()

    doc = json.load(open(DATA, encoding='utf-8'))
    key = [k for k, v in doc.items() if isinstance(v, list)][0]
    rows = doc[key]

    try:
        up = fetch(API + 'upcoming/?mode=list&limit=100').get('results', [])
        prev = fetch(API + 'previous/?mode=list&limit=40').get('results', [])
    except Exception as e:
        print('⛔ دروازهٔ اعتبارسنجی: %s — لغو شد؛ نسخهٔ فعلی دست‌نخورده ماند.' % e)
        sys.exit(2)
    if len(up) < 60 or len(prev) < 20:
        print('⛔ دروازهٔ اعتبارسنجی: دادهٔ لاغر (%d/%d) — لغو شد.' % (len(up), len(prev)))
        sys.exit(2)

    # ——— تطبیق ردیف‌های موجود
    updated, expired, unmatched, out_rows = [], [], [], []
    detail_budget = maxd
    detail_cache = {}

    def detail_of(lid):
        nonlocal detail_budget
        if lid in detail_cache:
            return detail_cache[lid]
        if detail_budget <= 0:
            return None
        detail_budget -= 1
        try:
            d = fetch(API + lid + '/')
        except Exception:
            d = None
        detail_cache[lid] = d
        return d

    for r in rows:
        base = str(r.get('mission', '')).split(' Landing')[0]
        if match(base, prev):
            expired.append(r)
            continue
        f = match(base, up)
        if f is None:
            unmatched.append(r)
            out_rows.append(r)
            continue
        new = dict(r)
        ch = []
        nd = f['net'][:10]
        st = STATUS_MAP.get((f.get('status') or {}).get('abbrev', ''))
        if r.get('date') != nd and (r.get('date') or (f.get('net_precision') or {}).get('name') in ('Minute', 'Hour', 'Day')):
            ch.append('تاریخ: %s ← %s' % (r.get('date'), nd))
            new['date'] = nd
            hh = f['net'][11:16]
            new['time_fa'] = 'ساعت %s به وقت جهانی' % hh
            new['time_en'] = '%s UTC' % hh
            new['precision_fa'] = 'روز و ساعت مشخص'
            new['precision_en'] = 'Confirmed date & time'
        if st:
            if new.get('date') is None and st != 'queued':
                st = 'queued'
            elif new.get('date') is not None and st == 'queued':
                st = 'tbc'
            if st != r.get('status'):
                ch.append('وضعیت: %s ← %s' % (r.get('status'), st))
                new['status'] = st
        # جابه‌جایی محل/نوع فرود طبق حالت تفصیلی (فقط برای ردیف‌های نزدیک)
        if f['net'][:10] <= horizon:
            dd = detail_of(f['id'])
            if dd:
                L, _ = landing_of(dd)
                if L:
                    ab = ((L.get('location') or {}).get('abbrev')) or ''
                    site = SHIP2SITE.get(ab)
                    lt = TYPE2LTYPE.get(((L.get('type') or {}).get('abbrev')) or '')
                    if site and site != r.get('site_id'):
                        ch.append('محل فرود: %s ← %s' % (r.get('site_id'), site))
                        new['site_id'] = site
                    if lt and lt != r.get('ltype'):
                        ch.append('نوع فرود: %s ← %s' % (r.get('ltype'), lt))
                        new['ltype'] = lt
        if ch:
            updated.append((r, ch))
            out_rows.append(new)
        else:
            out_rows.append(r)

    # ——— نامزدهای تازه (با نگهبان کامل)
    known = {norm(str(r.get('mission', '')).split(' Landing')[0]) for r in rows}
    new_rows, need_human = [], []
    for f in up:
        if f.get('lsp_name') not in RECOVERY_LSPS or f['net'][:10] > horizon:
            continue
        if any(k and k in norm(f.get('name')) for k in known):
            continue
        dd = detail_of(f['id'])
        if dd is None:
            need_human.append((f, 'بودجهٔ تفصیلی تمام شد یا خطا'))
            continue
        L, booster = landing_of(dd)
        if not L:
            continue  # این پرواز تلاش فرود ندارد
        ab = ((L.get('location') or {}).get('abbrev')) or ((L.get('location') or {}).get('name')) or ''
        site = SHIP2SITE.get(ab)
        lt = TYPE2LTYPE.get(((L.get('type') or {}).get('abbrev')) or '')
        rk = (f.get('name') or '').split(' | ')[0]
        vkey = next((k for k in VEHICLE_FA if rk.startswith(k)), None)
        lsp = f.get('lsp_name')
        problems = []
        if not site: problems.append('شناور/منطقهٔ بی‌نگاشت: ' + ab)
        if not lt: problems.append('نوع فرود پشتیبانی‌نشده')
        if not vkey: problems.append('پرتابگر بی‌معادل: ' + rk)
        if lsp not in STREAM_FALLBACK: problems.append('لینک یدکی مصوب ندارد')
        if problems:
            need_human.append((f, '؛ '.join(problems)))
            continue
        mission = f.get('mission') or 'Undisclosed mission'
        pad = (dd.get('pad') or {})
        ofa, oen = origin_of(pad.get('name'), (pad.get('location') or {}).get('name'))
        # یکتایی جمله‌های توصیفی (سقف تکرار در قرارداد تب): مبدأ با نام مأموریت
        ofa = 'مأموریت %s — %s' % (mission, ofa)
        oen = '%s — %s' % (mission, oen)
        prec = (f.get('net_precision') or {}).get('name')
        dated = prec in ('Minute', 'Hour', 'Day')
        hh = f['net'][11:16]
        st_new = STATUS_MAP.get((f.get('status') or {}).get('abbrev', ''), 'queued')
        # قرارداد تب: بی‌تاریخ یعنی در صف؛ تاریخ‌دار نمی‌تواند در صف بماند
        st_new = 'queued' if not dated else ('tbc' if st_new == 'queued' else st_new)
        serial = booster.get('serial_number') if booster else None
        flights = booster.get('flights') if booster else None
        row = {
            'id': 'upl-auto-' + f['id'][:8],
            'site_id': site,
            'mission': mission, 'mission_fa': mission,
            'vehicle_en': VEHICLE_EN[vkey], 'vehicle_fa': VEHICLE_FA[vkey],
            'ltype': lt,
            'date': f['net'][:10] if dated else None,
            'status': st_new,
            'operator_en': lsp, 'operator_fa': OP_FA[lsp],
            'stream_url': STREAM_FALLBACK[lsp],
            'calendar_url': CALENDAR_FALLBACK[lsp],
            'mtype_fa': 'فرود و بازیابی بوستر', 'mtype_en': 'Booster landing & recovery',
            'customer_fa': OP_FA[lsp], 'customer_en': lsp,
            'origin_fa': ofa, 'origin_en': oen,
            'note_fa': 'ردیف خودکار از کتابخانهٔ پرتاب ۲ برای مأموریت %s؛ فرود در %s.' % (mission, SITE_FA.get(site, site)),
            'note_en': 'Auto-tracked from Launch Library 2 for %s; landing on %s.' % (mission, ab),
        }
        if dated:
            row['time_fa'] = 'ساعت %s به وقت جهانی' % hh
            row['time_en'] = '%s UTC' % hh
            row['precision_fa'] = 'روز و ساعت مشخص'
            row['precision_en'] = 'Confirmed date & time'
        if serial:
            row['booster_fa'] = 'بوستر %s (پرواز %sم)' % (serial, flights or '؟')
            row['booster_en'] = 'Booster %s (flight %s)' % (serial, flights or '?')
        new_rows.append(row)

    # ——— گزارش
    print('============ گزارش تفاوت فرودها (نسخهٔ ۲) — %s ============' % today)
    print('درخواست تفصیلی مصرف‌شده: %d از %d' % (maxd - detail_budget, maxd))
    print('— به‌روزشدنی: %d' % len(updated))
    for r, ch in updated:
        print('   • %s: %s' % (r.get('mission'), ' | '.join(ch)))
    print('— انجام‌شده (حذف از تب؛ منتظر ثبت انسانی در تاریخچه): %d' % len(expired))
    for r in expired:
        print('   • %s (%s)' % (r.get('mission'), r.get('date')))
    print('— بی‌تطبیق (دست‌نخورده): %d' % len(unmatched))
    print('— ردیف تازهٔ آمادهٔ افزودن: %d' % len(new_rows))
    for row in new_rows:
        print('   • %s | %s | %s ← %s' % (row['date'] or 'در صف', row['vehicle_en'][:22], row['mission'][:30], row['site_id']))
    print('— نیازمند تصمیم انسان: %d' % len(need_human))
    for f, why in need_human[:10]:
        print('   • %s | %s — %s' % (f['net'][:10], (f.get('name') or '')[:40], why))

    if not apply_mode:
        print('\nحالت گزارش بود؛ هیچ پرونده‌ای نوشته نشد. برای اعمال: --apply')
        return

    os.system('cp "%s" /tmp/landings.pre_refresh.json' % DATA)
    out_rows.extend(new_rows)
    out_rows.sort(key=lambda r: (r.get('date') is None, r.get('date') or '9999'))
    doc[key] = out_rows
    doc['updated'] = today
    open(DATA, 'w', encoding='utf-8').write(json.dumps(doc, ensure_ascii=False, indent=1))
    print('\n✅ اعمال شد: %d به‌روزرسانی، %d حذف، %d افزودن. پشتیبان: /tmp/landings.pre_refresh.json' % (
        len(updated), len(expired), len(new_rows)))


if __name__ == '__main__':
    main()
