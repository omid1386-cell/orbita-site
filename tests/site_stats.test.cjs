const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const sites = JSON.parse(fs.readFileSync(path.join(root, 'data/sites.json'), 'utf8'));
const siteStatsMap = JSON.parse(fs.readFileSync(path.join(root, 'tools/site_stats_map.json'), 'utf8'));
const seedTool = fs.readFileSync(path.join(root, 'tools/seed_site_stats.py'), 'utf8');
const historyTool = fs.readFileSync(path.join(root, 'tools/update_site_history.py'), 'utf8');
let seeded = 0, n = 0;
const pass = x => { n++; console.log('PASS', x); };
for (const s of sites) {
  const has = ['stats_total','stats_success','stats_fail','stats_asof'].map(k => k in s);
  assert(has.every(Boolean) || !has.some(Boolean), 'آمار یا کامل یا هیچ: ' + s.id);
  if (!has[0]) continue;
  seeded++;
  assert(Number.isInteger(s.stats_total) && s.stats_total >= 0, 'کل نامعتبر: ' + s.id);
  assert(s.stats_success == null || (Number.isInteger(s.stats_success) && s.stats_success >= 0), 'موفق نامعتبر: ' + s.id);
  assert(s.stats_fail == null || (Number.isInteger(s.stats_fail) && s.stats_fail >= 0), 'ناموفق نامعتبر: ' + s.id);
  if (s.stats_success != null && s.stats_fail != null) {
    assert(s.stats_success + s.stats_fail <= s.stats_total, 'نتایج از کل بیشترند: ' + s.id);
    if (s.stats_complete === true) assert.equal(s.stats_success + s.stats_fail, s.stats_total, 'آمار کامل باید با کل برابر باشد: ' + s.id);
  }
  if (s.stats_complete === true) {
    assert(Number.isInteger(s.stats_success) && Number.isInteger(s.stats_fail), 'آمار کامل نباید outcome نامعلوم داشته باشد: ' + s.id);
  }
  if (s.stats_is_minimum === true) {
    assert.equal(s.stats_complete, false, 'شمار حداقلی باید ناقص علامت‌گذاری شود: ' + s.id);
    assert(s.stats_scope_fa && /دست.?کم|حداقل/.test(s.stats_scope_fa), 'توضیح فارسی حداقل: ' + s.id);
    assert(s.stats_scope_en && /minimum|at least/i.test(s.stats_scope_en), 'توضیح انگلیسی حداقل: ' + s.id);
  }
  assert(/^\d{4}-\d{2}-\d{2}$/.test(s.stats_asof), 'مهر تاریخ: ' + s.id);
}
for (const s of sites) for (const h of (s.launches || [])) {
  if (!h.auto) continue;
  assert(/^\d{4}-\d{2}-\d{2}$/.test(h.date) && h.rocket && h.payload, 'ردیف خودکار ناقص: ' + s.id);
  assert(h.analysis_fa && h.analysis_en && typeof h.success === 'boolean', 'تحلیل دوزبانهٔ خودکار: ' + s.id);
  assert(h.ll2_id, 'ردپای منبع ردیف خودکار: ' + s.id);
}
assert.deepEqual(siteStatsMap.locations.wenchang, { pads: [175, 176] });
assert.deepEqual(siteStatsMap.locations['hainan-commercial'], { pads: [218, 219] });
assert(seedTool.includes("if isinstance(lid, dict) and lid.get('pads')"), 'seed script supports multiple pads');
assert(historyTool.includes("stats_kind = s.get('stats_kind')") &&
  historyTool.includes("stats_countable = stats_kind in ('orbital', 'suborbital')") &&
  historyTool.includes("if stats_countable and 'stats_total' in s"),
  'history updater leaves untyped totals unchanged while preserving eligible narrative history');
pass('multi-pad sources are summed, while automated history does not guess a site launch type');
const overberg = sites.find(s => s.id === 'overberg');
assert(overberg, 'Overberg exists');
assert.equal(overberg.stats_total, 0, 'Overberg has zero verified orbital launches');
assert.equal(overberg.stats_success, 0);
assert.equal(overberg.stats_fail, 0);
assert((overberg.launches || []).length > 0, 'Overberg retains historical/suborbital records independently');
pass('Overberg orbital statistics remain explicitly zero despite separate suborbital/test rows');
const xuhai = sites.find(s => s.id === 'xuhai');
assert(xuhai, 'Xuhai exists');
assert.equal(xuhai.stats_asof, '2025-10-18', 'Xuhai count cut-off matches TASA report');
assert.equal(xuhai.stats_success, null, 'Xuhai outcomes remain unknown rather than fabricated');
assert.equal(xuhai.stats_fail, null, 'Xuhai outcomes remain unknown rather than fabricated');
pass('Xuhai reported count uses the TASA reporting cut-off and unknown outcomes remain unknown');
const sonmiani = sites.find(s => s.id === 'sonmiani');
assert(sonmiani, 'Sonmiani exists');
assert.equal(sonmiani.stats_total, 2);
assert.equal(sonmiani.stats_is_minimum, true, 'Sonmiani count is explicitly a lower bound');
assert.equal(sonmiani.stats_complete, false);
assert.equal(sonmiani.stats_fail, null, 'Sonmiani does not imply a complete failure count');
assert((sonmiani.launches || []).every(row => row.orbit === 'Suborbital' &&
  row.mtype_fa === 'پرتاب زیرمداری' && row.mtype_en === 'Suborbital sounding-rocket flight' && row.mtype_ar),
  'Sonmiani Rehbar rows are classified as suborbital rather than orbital');
pass('Sonmiani is represented as a documented minimum, not a complete total');
pass('ردیف‌های روایی خودکار (در صورت وجود) دوزبانه و منبع‌دارند');
pass('آمار پایگاه‌ها سازگار است (' + seeded + ' پایگاه بذرخورده از ' + sites.length + ')');
console.log(n + ' PASS / 0 FAIL');
