'use strict';
// نگهبان دادهٔ «فرودهای پیشِ رو» — بدون وابستگی به مرورگر.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const d = JSON.parse(fs.readFileSync(path.join(root, 'data/upcoming_landings.json'), 'utf8'));
const sites = JSON.parse(fs.readFileSync(path.join(root, 'data/recovery_sites.json'), 'utf8'));
const siteIds = new Set(sites.sites.map(s => s.id));
let n = 0; const pass = s => { n++; console.log('PASS:', s); };

// ساختار سطح بالا
assert(/^\d{4}-\d{2}-\d{2}$/.test(d.updated) && /^\d{4}-\d{2}-\d{2}$/.test(d.window_end));
assert(d.source_note_fa && d.source_note_en && Array.isArray(d.landings) && d.landings.length > 0);
assert(!('sample_site_ids' in d), 'محدودیت نمونه باید برداشته مانده باشد');
assert(!('site_shared' in d), 'جملهٔ زمان نسبت به پرتاب نباید در هیچ سطحی برگردد');
pass('ساختار سطح بالا سالم است؛ بدون محدودیت نمونه و بدون جملهٔ زمان نسبت به پرتاب');

// قواعد ردیف‌ها
const PAIRS = ['mission', 'vehicle', 'operator', 'mtype', 'customer', 'origin', 'time', 'precision', 'booster', 'downrange', 'note'];
const ids = new Set();
for (const r of d.landings) {
  assert(!ids.has(r.id), 'id یکتا: ' + r.id); ids.add(r.id);
  assert(siteIds.has(r.site_id), 'پایگاه معتبر: ' + r.site_id);
  assert(['go', 'tbc', 'queued'].includes(r.status));
  assert((r.date === null) === (r.status === 'queued'), 'بدون تاریخ یعنی در صف: ' + r.id);
  if (r.date) assert(/^\d{4}-\d{2}-\d{2}$/.test(r.date) && r.date <= d.window_end);
  assert(['asds', 'rtls', 'runway', 'parachute'].includes(r.ltype));
  assert(!('rocket_fa' in r) && !('tplus_fa' in r) && !('rocket_en' in r) && !('tplus_en' in r),
    'فیلدهای حذف‌شده نباید برگردند: ' + r.id);
  for (const p of PAIRS) {
    const fa = (p === 'mission') ? (p + '_fa' in r) : (p + '_fa' in r);
    const en = (p === 'mission') ? (p in r || p + '_en' in r) : (p + '_en' in r);
    if (p === 'mission') { assert(r.mission && r.mission_fa); continue; }
    assert((p + '_fa' in r) === (p + '_en' in r), 'دوزبانگی: ' + r.id + ' / ' + p);
  }
  assert(('time_fa' in r) === ('precision_fa' in r), 'زمان بدون دقت ممنوع: ' + r.id);
  assert(r.calendar_url && r.mtype_fa && r.customer_fa && r.origin_fa, 'فیلدهای پایهٔ جزئیات: ' + r.id);
}
pass(d.landings.length + ' ردیف: شناسه‌ها یکتا، پایگاه‌ها معتبر، وضعیت و تاریخ سازگار، دوزبانگی کامل');

// پیوندها فقط از دامنه‌های رسمی تأییدشده
const OK_HOSTS = ['x.com', 'www.spacex.com', 'www.blueorigin.com', 'plus.nasa.gov', 'www.nasa.gov', 'www.sierraspace.com'];
for (const r of d.landings) {
  for (const u of [r.stream_url, r.calendar_url]) {
    assert(u.startsWith('https://'), 'فقط https: ' + r.id);
    assert(OK_HOSTS.includes(new URL(u).host), 'دامنهٔ رسمی: ' + u);
  }
}
pass('همهٔ پیوندهای پخش و گاه‌شمار https و از دامنه‌های رسمی تأییدشده‌اند');

// سقف تکرار جمله‌های توصیفی در کل پرونده: حداکثر ۳ بار
const SENT = ['note_fa', 'origin_fa', 'downrange_fa', 'time_fa'];
const cnt = new Map();
for (const r of d.landings) for (const k of SENT) if (r[k]) cnt.set(r[k], (cnt.get(r[k]) || 0) + 1);
for (const [v, c] of cnt) assert(c <= 3, 'تکرار بیش از حد (' + c + '): ' + v);
pass('هیچ جملهٔ توصیفی بیش از ۳ بار در کل پرونده تکرار نشده است');

// ضد تکرار درون‌صفحه‌ای: مقدار مشترک میان چند ردیف یک پایگاه باید
// در «همهٔ» ردیف‌های دارای آن فیلد یکسان باشد تا در نمایش یک‌کاسه شود.
const FIELDS = ['origin_fa', 'downrange_fa', 'time_fa', 'booster_fa', 'note_fa'];
for (const sid of new Set(d.landings.map(r => r.site_id))) {
  const rows = d.landings.filter(r => r.site_id === sid);
  if (rows.length < 2) continue;
  for (const f of FIELDS) {
    const vals = rows.map(r => r[f]).filter(Boolean);
    const uniq = new Set(vals);
    if (vals.length > uniq.size) assert.equal(uniq.size, 1,
      'تکرار نمایشی در ' + sid + ' / ' + f);
  }
}
pass('در هیچ صفحه‌ای جملهٔ توصیفی تکراری کنار هم نمایش نمی‌یابد');

console.log(n + ' PASS / 0 FAIL');
