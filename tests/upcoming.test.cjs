// آزمون دادهٔ پرتاب‌های پیشِ رو (upcoming.json)
const fs = require('fs');
const path = require('path');
let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { console.log('PASS ' + name); pass++; }
  else { console.log('FAIL ' + name); fail++; }
}
const doc = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'upcoming.json'), 'utf8'));
const sites = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'sites.json'), 'utf8'));
const siteIds = new Set(sites.map(s => s.id));
const L = doc.launches || [];

check('تعداد ردیف‌ها ۱۳۱ است', L.length === 131);
check('همهٔ ردیف‌ها به پایگاه معتبر اشاره می‌کنند', L.every(l => siteIds.has(l.site)));
check('هر ۶۳ پایگاه پوشش‌دار اعلام شده‌اند', Array.isArray(doc.sites_covered) && doc.sites_covered.length === 63 && doc.sites_covered.every(id => siteIds.has(id)));
check('مهر به‌روزرسانی موجود است', /^\d{4}-\d{2}-\d{2}$/.test(doc.updated || ''));
const REQ = ['ll2_id','net','date_label_fa','date_label_en','precision','precision_fa','time_fa','time_en','rocket_fa','rocket_en','payload_fa','payload_en','mtype_fa','mtype_en','orbit_fa','orbit_en','customer_fa','customer_en','desc_fa','desc_en','status'];
check('هیچ ستون الزامی خالی نیست', L.every(l => REQ.every(k => typeof l[k] === 'string' && l[k].length > 0)));
check('شناسهٔ مرجع یکتا است', new Set(L.map(l => l.ll2_id)).size === L.length);
check('توضیح فارسی تکراری وجود ندارد', new Set(L.map(l => l.desc_fa)).size === L.length);
check('توضیح انگلیسی تکراری وجود ندارد', new Set(L.map(l => l.desc_en)).size === L.length);
check('درجهٔ قطعیت معتبر است', L.every(l => ['day','month','quarter','tbd'].includes(l.precision)));
check('هیچ تاریخ گذشته‌ای در داده نیست', L.every(l => l.net >= '2026-10-01'));
const HOSTS = ['www.spacex.com','x.com','www.ulalaunch.com','www.youtube.com','www.arianespace.com','www.avio.com','rocketlabcorp.com','www.isro.gov.in','www.mhi.com','fireflyspace.com','www.relativityspace.com','www.nasa.gov','www.kari.re.kr','www.isaraerospace.com','www.blueorigin.com','www.rfa.space','www.esa.int','global.jaxa.jp','www.gspace.com','www.innospc.com','istellartech.com','www.virgingalactic.com'];
function okUrl(u) { if (!u) return true; try { const h = new URL(u); return h.protocol === 'https:' && HOSTS.includes(h.hostname); } catch (e) { return false; } }
check('پیوندهای گاه‌شمار فقط از دامنه‌های رسمی تأییدشده', L.every(l => okUrl(l.calendar_url)));
check('پیوندهای پخش زنده فقط از دامنه‌های رسمی تأییدشده', L.every(l => okUrl(l.stream_url)));
check('ردیف‌های با قطعیت روزانه، ساعت دارند', L.filter(l => l.precision === 'day').every(l => /\d{2}:\d{2}/.test(l.time_fa)));
const NOTES = doc.site_notes || {};
check('بیست یادداشت وضعیت برای پایگاه‌های خاموش موجود است', Object.keys(NOTES).length === 20 && Object.keys(NOTES).every(id => siteIds.has(id)));
check('همهٔ یادداشت‌ها دوزبانه و غیرخالی‌اند', Object.values(NOTES).every(n => Array.isArray(n) && n.length === 2 && n[0].length > 5 && n[1].length > 5));
console.log(pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
