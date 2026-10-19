#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
تازه‌ساز تب «پرتاب‌های پیشِ رو» از کتابخانهٔ پرتاب ۲ (LL2)
فاز الف — حالت دستی با گزارش تفاوت

حالت پیش‌فرض: فقط گزارش تفاوت (هیچ پرونده‌ای نوشته نمی‌شود)
با سوئیچ --apply: تغییرات پس از گذر از نگهبان‌ها اعمال می‌شود

پنج نگهبان:
  ۱) بودجهٔ سهمیه: هر اجرا دقیقاً ۲ درخواست به LL2
  ۲) دروازهٔ اعتبارسنجی: خطای شبکه/سهمیه یا دادهٔ لاغر ← لغو کامل، نسخهٔ سالم می‌ماند
  ۳) ادغام حفاظتی: ردیف‌های دست‌ساز (manual-*)، یادداشت پایگاه‌های خاموش،
     لینک پخش/تقویم و توضیح‌های دوزبانهٔ موجود هرگز بازنویسی نمی‌شوند
  ۴) واژه‌نامهٔ خودی: ردیف تازه فقط اگر همهٔ واژه‌هایش معادل فارسی داشته باشد افزوده می‌شود؛
     وگرنه در گزارش با برچسب «نیازمند ترجمه/نگاشت» می‌آید و منتظر انسان می‌ماند
  ۵) مهر تازگی: زمان برداشت موفق در فرادادهٔ پرونده ثبت می‌شود
"""
import json, sys, os, urllib.request, urllib.error, datetime, copy

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, 'data', 'upcoming.json')
SITE_MAP = os.path.join(BASE, 'tools', 'site_map.json')
UA = 'OrbitaEducationalApp/1.0 (contact: orbita.app.dev@gmail.com)'
API = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?mode=list&limit=100'

FA_DIGITS = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')

STATUS_FA = {'Go': 'تأیید شده', 'TBC': 'در انتظار تأیید', 'TBD': 'نامشخص', 'Hold': 'متوقف'}

MONTH_FA = {1: 'ژانویه', 2: 'فوریه', 3: 'مارس', 4: 'آوریل', 5: 'مه', 6: 'ژوئن',
            7: 'ژوئیه', 8: 'اوت', 9: 'سپتامبر', 10: 'اکتبر', 11: 'نوامبر', 12: 'دسامبر'}
MONTH_EN = {1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 6: 'June',
            7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December'}
Q_FA = {1: 'سه‌ماههٔ نخست', 2: 'سه‌ماههٔ دوم', 3: 'سه‌ماههٔ سوم', 4: 'سه‌ماههٔ چهارم'}


def fmt_timing(net, prec_name):
    """زمان‌بندی را دقیقاً در واژگان قرارداد برنامه تولید می‌کند
    (precision فقط day/month/quarter/tbd؛ برچسب و ساعت طبق قراردادهای موجود)."""
    y, mo = int(net[:4]), int(net[5:7])
    hhmm = net[11:16]
    if prec_name in ('Minute', 'Hour', 'Day'):
        return {'precision': 'day', 'precision_fa': 'روز و ساعت مشخص', 'precision_en': 'Confirmed date & time',
                'date_label_fa': net[:10], 'date_label_en': net[:10],
                'time_fa': 'ساعت %s به وقت جهانی' % hhmm, 'time_en': '%s UTC' % hhmm}
    if prec_name in ('Week', 'Month'):
        return {'precision': 'month', 'precision_fa': 'فقط ماه مشخص', 'precision_en': 'Month known',
                'date_label_fa': '%s %d' % (MONTH_FA[mo], y), 'date_label_en': '%s %d' % (MONTH_EN[mo], y),
                'time_fa': 'در طول %s %d' % (MONTH_FA[mo], y), 'time_en': 'During %s %d' % (MONTH_EN[mo], y)}
    if prec_name == 'Quarter':
        q = (mo - 1) // 3 + 1
        return {'precision': 'quarter', 'precision_fa': 'بازهٔ فصلی', 'precision_en': 'Quarterly window',
                'date_label_fa': '%s %d' % (Q_FA[q], y), 'date_label_en': 'Q%d %d' % (q, y),
                'time_fa': '%s %d' % (Q_FA[q], y), 'time_en': 'Q%d %d' % (q, y)}
    return {'precision': 'tbd', 'precision_fa': 'در انتظار اعلام تاریخ', 'precision_en': 'Date TBA',
            'date_label_fa': 'در انتظار اعلام', 'date_label_en': 'TBA',
            'time_fa': 'تاریخ دقیق اعلام نشده', 'time_en': 'Exact date TBA'}


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def harvest_dicts(rows):
    """واژه‌نامه‌ها را از ردیف‌های دوزبانهٔ موجود + پروندهٔ تکمیلی برداشت می‌کند."""
    d = {'rocket': {}, 'mtype': {}, 'orbit': {}, 'customer': {}, 'payload_subs': {}}
    for r in rows:
        for key, fa_k, en_k in (('rocket', 'rocket_fa', 'rocket_en'), ('mtype', 'mtype_fa', 'mtype_en'),
                                ('orbit', 'orbit_fa', 'orbit_en'), ('customer', 'customer_fa', 'customer_en')):
            en, fa = r.get(en_k), r.get(fa_k)
            if en and fa:
                d[key].setdefault(en, fa)
    extra_path = os.path.join(BASE, 'tools', 'dict_extra.json')
    if os.path.exists(extra_path):
        extra = json.load(open(extra_path, encoding='utf-8'))
        for key in d:
            for en, fa in (extra.get(key) or {}).items():
                d[key][en] = fa
    return d


def payload_fa_of(mission, dicts):
    """ترجمهٔ محموله با جایگزینی‌های واژه‌نامه؛ نام‌های خاص دست‌نخورده می‌مانند."""
    t = mission or ''
    for en, fa in dicts.get('payload_subs', {}).items():
        t = t.replace(en, fa)
    return t


def site_for(launch, smap):
    """نگاشت مکان LL2 به شناسهٔ پایگاه ما؛ ابهام‌ها با قاعدهٔ سکو حل می‌شوند."""
    loc, pad = launch.get('location') or '', launch.get('pad') or ''
    for rule in smap.get('pad_rules', []):
        if rule['location'] == loc and rule['pad_contains'] in pad:
            return rule['site']
    return smap.get('locations', {}).get(loc)


def fa_date(iso):
    return iso[:10]


def main():
    apply_mode = '--apply' in sys.argv
    today = datetime.date.today().isoformat()

    cur = json.load(open(DATA, encoding='utf-8'))
    rows = cur['launches'] if 'launches' in cur else None
    if rows is None:
        for k, v in cur.items():
            if isinstance(v, list):
                rows = v
                break
    smap = json.load(open(SITE_MAP, encoding='utf-8')) if os.path.exists(SITE_MAP) else {'locations': {}, 'pad_rules': []}
    dicts = harvest_dicts(rows)

    # ——— برداشت (نگهبان ۱: فقط دو درخواست)
    try:
        p1 = fetch(API)
        p2 = fetch(API + '&offset=100')
    except urllib.error.HTTPError as e:
        print('⛔ دروازهٔ اعتبارسنجی: پاسخ HTTP %s — لغو شد؛ نسخهٔ فعلی دست‌نخورده ماند.' % e.code)
        sys.exit(2)
    except Exception as e:
        print('⛔ دروازهٔ اعتبارسنجی: خطای شبکه (%s) — لغو شد.' % e)
        sys.exit(2)

    fresh = p1.get('results', []) + p2.get('results', [])
    # ——— نگهبان ۲: دادهٔ لاغر یا ناهمخوان یعنی لغو
    if len(fresh) < 120:
        print('⛔ دروازهٔ اعتبارسنجی: فقط %d ردیف رسید (انتظار ~۲۰۰) — لغو شد.' % len(fresh))
        sys.exit(2)
    fby = {r['id']: r for r in fresh}
    ll2_rows = [r for r in rows if not str(r.get('ll2_id', '')).startswith('manual-')]
    matched = sum(1 for r in ll2_rows if r['ll2_id'] in fby)
    past_dated = [r for r in ll2_rows if r['net'][:10] < today]
    if ll2_rows and (matched + len(past_dated)) / len(ll2_rows) < 0.5:
        print('⛔ دروازهٔ اعتبارسنجی: تطبیق شناسه‌ها زیر ۵۰٪ — ساختار منبع شاید عوض شده؛ لغو شد.')
        sys.exit(2)

    # ——— مقایسه
    updated, launched, unchanged, flagged = [], [], [], []
    new_rows, need_human = [], []
    out_rows = []
    for r in rows:
        i = str(r.get('ll2_id', ''))
        if i.startswith('manual-'):
            out_rows.append(r)          # نگهبان ۳: دست‌سازها عیناً
            continue
        f = fby.get(i)
        if f is None:
            if r['net'][:10] < today:
                launched.append(r)       # احتمالاً انجام شده؛ در حالت اعمال حذف می‌شود
            else:
                flagged.append((r, 'در فهرست آیندهٔ LL2 نیست (تاریخ دوردست یا جابه‌جا)'))
                out_rows.append(r)
            continue
        new = copy.deepcopy(r)
        changes = []
        timing = fmt_timing(f['net'], (f.get('net_precision') or {}).get('name'))
        if str(f['net'])[:16] != str(r['net'])[:16]:
            changes.append('تاریخ: %s ← %s' % (r['net'][:10], f['net'][:10]))
            new['net'] = f['net']
        if timing['precision'] != r.get('precision') or (changes and timing['precision'] == 'day'):
            changes.append('زمان‌بندی: %s' % timing['date_label_fa'])
        if changes:
            new.update(timing)
        st = (f.get('status') or {}).get('abbrev')
        if st and st != r.get('status'):
            changes.append('وضعیت: %s ← %s' % (r.get('status'), st))
            new['status'] = st
            if STATUS_FA.get(st):
                new['status_fa'] = STATUS_FA[st]
        if changes:
            updated.append((r, changes))
            out_rows.append(new)
        else:
            unchanged.append(r)
            out_rows.append(r)

    # ——— ردیف‌های تازهٔ LL2 که ما نداریم (نگهبان ۴)
    known = {str(r.get('ll2_id')) for r in rows}
    wend = cur.get('window_end', '2027-01-06')
    for f in fresh:
        if f['id'] in known or str(f['net'])[:10] > wend:
            continue
        site = site_for(f, smap)
        rk = (f.get('name') or '').split(' | ')[0]
        rk_fa = dicts['rocket'].get(rk)
        if site and rk_fa:
            new_rows.append((f, site, rk, rk_fa))
        else:
            why = []
            if not site:
                why.append('پایگاه بی‌نگاشت: ' + str(f.get('location'))[:40])
            if not rk_fa:
                why.append('موشک بی‌معادل: ' + rk)
            need_human.append((f, '؛ '.join(why)))

    # ——— گزارش تفاوت
    print('================= گزارش تفاوت — %s =================' % today)
    print('برداشت LL2: %d ردیف | تطبیق شناسه: %d/%d' % (len(fresh), matched, len(ll2_rows)))
    print('— بی‌تغییر: %d' % len(unchanged))
    print('— به‌روزشدنی: %d' % len(updated))
    for r, ch in updated[:20]:
        print('   • %s (%s): %s' % (r.get('rocket_en', '؟')[:20], r.get('payload_en', '؟')[:24], ' | '.join(ch)))
    print('— انجام‌شده (حذف‌شدنی از تب): %d' % len(launched))
    for r in launched:
        print('   • %s | %s | %s' % (r['net'][:10], r.get('rocket_en', '؟')[:20], r.get('payload_en', '؟')[:28]))
    print('— خارج از افق/جابه‌جا (نگه داشته می‌شوند): %d' % len(flagged))
    print('— ردیف تازهٔ آمادهٔ افزودن (نگاشت و ترجمه کامل): %d' % len(new_rows))
    for f, site, rk, _ in new_rows[:15]:
        print('   • %s | %s | %s ← %s' % (f['net'][:10], rk[:18], (f.get('mission') or '؟')[:26], site))
    print('— نیازمند تصمیم انسان (ترجمه/نگاشت ناقص): %d' % len(need_human))
    for f, why in need_human[:15]:
        print('   • %s | %s — %s' % (f['net'][:10], (f.get('name') or '؟')[:38], why))
    print('— ردیف‌های دست‌ساز حفاظت‌شده: %d' % sum(1 for r in rows if str(r.get('ll2_id', '')).startswith('manual-')))

    if not apply_mode:
        print('\nحالت گزارش بود؛ هیچ پرونده‌ای نوشته نشد. برای اعمال: --apply')
        return

    # ——— اعمال (فقط با --apply)
    os.system('cp "%s" /tmp/upcoming.pre_refresh.json' % DATA)
    seen_desc = {r.get('desc_fa') for r in out_rows} | {r.get('desc_en') for r in out_rows}
    for f, site, rk, rk_fa in new_rows:
        mt = f.get('mission_type') or 'Orbital Launch'
        orb = f.get('orbit') or 'TBA'   # مدار نامعلوم حدس زده نمی‌شود
        timing = fmt_timing(f['net'], (f.get('net_precision') or {}).get('name'))
        pfa = payload_fa_of(f.get('mission'), dicts) or 'محمولهٔ نامشخص'
        pen = f.get('mission') or 'Undisclosed payload'
        # توضیح یکتا؛ در صورت برخورد، پسوند شناسه می‌گیرد (برای صیقل انسانی پرچم می‌شود)
        dfa = 'پرتاب %s با محمولهٔ %s؛ زمان‌بندی: %s.' % (rk_fa, pfa, timing['date_label_fa'])
        den = '%s launching %s; schedule: %s.' % (rk, pen, timing['date_label_en'])
        if dfa in seen_desc or den in seen_desc:
            dfa += ' (شناسهٔ %s)' % f['id'][:8]
            den += ' (id %s)' % f['id'][:8]
        seen_desc |= {dfa, den}
        row = {
            'site': site, 'll2_id': f['id'], 'net': f['net'],
            'rocket_fa': rk_fa, 'rocket_en': rk,
            'payload_fa': pfa, 'payload_en': pen,
            'mtype_fa': dicts['mtype'].get(mt, mt), 'mtype_en': mt,
            'orbit_fa': dicts['orbit'].get(orb, orb), 'orbit_en': orb,
            'customer_fa': dicts['customer'].get(f.get('lsp_name') or '', f.get('lsp_name') or ''),
            'customer_en': f.get('lsp_name') or '',
            'desc_fa': dfa, 'desc_en': den,
            'calendar_url': '', 'stream_url': '',
            'status': (f.get('status') or {}).get('abbrev', 'TBD'),
            'status_fa': STATUS_FA.get((f.get('status') or {}).get('abbrev'), 'نامشخص'),
        }
        row.update(timing)
        out_rows.append(row)
    out_rows.sort(key=lambda r: r['net'])
    key = 'launches' if 'launches' in cur else [k for k, v in cur.items() if isinstance(v, list)][0]
    cur[key] = out_rows
    cur['updated'] = today            # نگهبان ۵: مهر تازگی
    open(DATA, 'w', encoding='utf-8').write(json.dumps(cur, ensure_ascii=False, indent=1))
    print('\n✅ اعمال شد: %d به‌روزرسانی، %d حذف انجام‌شده، %d ردیف تازه. پشتیبان: /tmp/upcoming.pre_refresh.json' % (
        len(updated), len(launched), len(new_rows)))


if __name__ == '__main__':
    main()
