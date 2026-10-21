const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const sites = JSON.parse(fs.readFileSync(path.join(root, 'data/sites.json'), 'utf8'));
let seeded = 0, n = 0;
const pass = x => { n++; console.log('PASS', x); };
for (const s of sites) {
  const has = ['stats_total','stats_success','stats_fail','stats_asof'].map(k => k in s);
  assert(has.every(Boolean) || !has.some(Boolean), 'آمار یا کامل یا هیچ: ' + s.id);
  if (!has[0]) continue;
  seeded++;
  assert(Number.isInteger(s.stats_total) && s.stats_total >= 0, 'کل نامعتبر: ' + s.id);
  assert(Number.isInteger(s.stats_success) && s.stats_success >= 0, 'موفق نامعتبر: ' + s.id);
  assert.equal(s.stats_success + s.stats_fail, s.stats_total, 'موفق+ناموفق=کل: ' + s.id);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(s.stats_asof), 'مهر تاریخ: ' + s.id);
}
for (const s of sites) for (const h of (s.launches || [])) {
  if (!h.auto) continue;
  assert(/^\d{4}-\d{2}-\d{2}$/.test(h.date) && h.rocket && h.payload, 'ردیف خودکار ناقص: ' + s.id);
  assert(h.analysis_fa && h.analysis_en && typeof h.success === 'boolean', 'تحلیل دوزبانهٔ خودکار: ' + s.id);
  assert(h.ll2_id, 'ردپای منبع ردیف خودکار: ' + s.id);
}
pass('ردیف‌های روایی خودکار (در صورت وجود) دوزبانه و منبع‌دارند');
pass('آمار پایگاه‌ها سازگار است (' + seeded + ' پایگاه بذرخورده از ' + sites.length + ')');
console.log(n + ' PASS / 0 FAIL');
