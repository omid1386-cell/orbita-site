#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
تازه‌ساز تب «فرودهای پیشِ رو» از کتابخانهٔ پرتاب ۲ — فاز الف (حالت دستی)

حالت پیش‌فرض فقط گزارش است؛ --apply تنها تاریخ و وضعیت ردیف‌های موجود را تازه می‌کند.
خط قرمزها:
  • لینک پخش، یادداشت‌ها و همهٔ متن‌های دست‌ساز هرگز لمس نمی‌شوند
  • حذف ردیف منقضی یا انتقال به تاریخچه فقط با تصمیم انسان (گزارش می‌شود، اعمال نمی‌شود)
  • افزودن ردیف تازه فقط با تدوین انسانی (نامزدها فقط فهرست می‌شوند)
  • هر اجرا دقیقاً ۲ درخواست به LL2
"""
import json, sys, os, urllib.request, urllib.error, datetime

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, 'data', 'upcoming_landings.json')
UA = 'OrbitaEducationalApp/1.0 (contact: orbita.app.dev@gmail.com)'
API_UP = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?mode=list&limit=100'
API_PREV = 'https://ll.thespacedevs.com/2.2.0/launch/previous/?mode=list&limit=40'
RECOVERY_LSPS = ('SpaceX', 'Blue Origin', 'Rocket Lab')
STATUS_MAP = {'Go': 'go', 'TBC': 'tbc', 'TBD': 'queued', 'Hold': 'hold'}


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def norm(s):
    return ''.join(ch for ch in str(s or '').lower() if ch.isalnum())


def match(our_mission, ll2_rows):
    """تطبیق نام مأموریت ما با نام/مأموریت LL2 (زیررشتهٔ نرمال‌شده)."""
    key = norm(our_mission)
    if len(key) < 4:
        return None
    for f in ll2_rows:
        if key in norm(f.get('name')) or key in norm(f.get('mission')):
            return f
    return None


def main():
    apply_mode = '--apply' in sys.argv
    today = datetime.date.today().isoformat()
    doc = json.load(open(DATA, encoding='utf-8'))
    key = [k for k, v in doc.items() if isinstance(v, list)][0]
    rows = doc[key]

    try:
        up = fetch(API_UP).get('results', [])
        prev = fetch(API_PREV).get('results', [])
    except Exception as e:
        print('⛔ دروازهٔ اعتبارسنجی: %s — لغو شد؛ نسخهٔ فعلی دست‌نخورده ماند.' % e)
        sys.exit(2)
    if len(up) < 60 or len(prev) < 20:
        print('⛔ دروازهٔ اعتبارسنجی: دادهٔ لاغر (%d/%d) — لغو شد.' % (len(up), len(prev)))
        sys.exit(2)

    updated, expired, unmatched = [], [], []
    for r in rows:
        base = str(r.get('mission', '')).split(' Landing')[0]
        f_prev = match(base, prev)
        if f_prev:
            land_ok = f_prev.get('landing_success')
            outcome = 'فرود موفق' if land_ok else ('فرود ناموفق' if land_ok is False else 'نتیجهٔ فرود ثبت‌نشده')
            expired.append((r, f_prev['net'][:10], outcome))
            continue
        f_up = match(base, up)
        if f_up is None:
            unmatched.append(r)
            continue
        changes = []
        new_date = f_up['net'][:10]
        st = STATUS_MAP.get((f_up.get('status') or {}).get('abbrev', ''), None)
        if r.get('date') and r['date'] != new_date:
            changes.append('تاریخ: %s ← %s' % (r['date'], new_date))
        if r.get('date') is None and (f_up.get('net_precision') or {}).get('name') in ('Minute', 'Hour', 'Day'):
            changes.append('از صف درآمد؛ تاریخ: %s' % new_date)
        if st and st != r.get('status'):
            changes.append('وضعیت: %s ← %s' % (r.get('status'), st))
        if changes:
            updated.append((r, new_date, st, changes))

    known = {norm(str(r.get('mission', '')).split(' Landing')[0]) for r in rows}
    horizon = (datetime.date.today() + datetime.timedelta(days=14)).isoformat()
    candidates = [f for f in up
                  if f.get('lsp_name') in RECOVERY_LSPS and f['net'][:10] <= horizon
                  and not any(k and k in norm(f.get('name')) for k in known)]

    print('============ گزارش تفاوت فرودها — %s ============' % today)
    print('— به‌روزشدنی: %d' % len(updated))
    for r, nd, st, ch in updated:
        print('   • %s: %s' % (r.get('mission'), ' | '.join(ch)))
    print('— منقضی (انجام‌شده؛ تصمیم انسانی برای حذف/انتقال به تاریخچه): %d' % len(expired))
    for r, nd, outcome in expired:
        print('   • %s | پرتاب %s | %s' % (r.get('mission'), nd, outcome))
    print('— بی‌تطبیق (در LL2 پیدا نشد؛ دست نمی‌خوریم): %d' % len(unmatched))
    for r in unmatched:
        print('   • %s (%s)' % (r.get('mission'), r.get('status')))
    print('— نامزد تازهٔ ۱۴ روز آینده (فقط فهرست؛ تدوین با انسان): %d' % len(candidates))
    for f in candidates[:10]:
        print('   • %s | %s | %s' % (f['net'][:10], (f.get('lsp_name') or '')[:12], (f.get('name') or '')[:46]))

    if not apply_mode:
        print('\nحالت گزارش بود؛ هیچ پرونده‌ای نوشته نشد. برای اعمال: --apply')
        return

    os.system('cp "%s" /tmp/landings.pre_refresh.json' % DATA)
    for r, nd, st, ch in updated:
        r['date'] = nd
        if st:
            r['status'] = st
    doc['updated'] = today
    open(DATA, 'w', encoding='utf-8').write(json.dumps(doc, ensure_ascii=False, indent=1))
    print('\n✅ اعمال شد: %d ردیف تازه شد (منقضی‌ها و نامزدها عمداً دست‌نخورده).' % len(updated))


if __name__ == '__main__':
    main()
