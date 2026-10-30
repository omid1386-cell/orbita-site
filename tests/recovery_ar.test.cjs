const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const recovery = JSON.parse(fs.readFileSync(path.join(root, 'data/recovery_sites.json'), 'utf8'));
const upcomingLandings = JSON.parse(fs.readFileSync(path.join(root, 'data/upcoming_landings.json'), 'utf8'));
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const PERSIAN_ONLY = /[پچژگکی]/;
const NON_LATIN_DIGITS = /[٠-٩۰-۹]/;

function check(label, fn) {
  try {
    fn();
    console.log(`PASS ${label}`);
  } catch (error) {
    console.error(`FAIL ${label}\n${error.stack || error}`);
    process.exitCode = 1;
  }
}

function sliceBetween(startToken, endToken) {
  const start = app.indexOf(startToken);
  const end = app.indexOf(endToken, start);
  assert.notEqual(start, -1, `missing source marker: ${startToken}`);
  assert.notEqual(end, -1, `missing source marker: ${endToken}`);
  return app.slice(start, end);
}

function recoveryApi(language) {
  const pieces = [
    sliceBetween('  function recoveryDate(date) {', '  /* External map links:'),
    sliceBetween('  function recoverySource(url, label) {', '  function recoveryOutcome(value, isLanding, method) {'),
    sliceBetween('  function recoveryOutcome(value, isLanding, method) {', '  function validRecoveryVideo(video, eventId) {'),
    sliceBetween('  function renderRecoveryVideos(event) {', '  function switchRecoveryTab(button) {')
  ];
  const context = {
    LANG: language,
    UPL: { data: upcomingLandings },
    C: { recovery: 'recovery-icon' },
    t: () => language === 'ar' ? 'الاستعادة' : language === 'fa' ? 'بازیابی' : 'Recovery',
    svgRecovery: () => '<svg aria-hidden="true"></svg>',
    fmtNum: (value) => Number(value).toLocaleString(language === 'ar' ? 'ar-u-nu-latn' : language === 'fa' ? 'fa-IR' : 'en-US'),
    esc: (value) => String(value == null ? '' : value).replace(/[&<>\"]/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
    })[c]),
    name: (o) => language === 'fa' ? (o.fa || o.en || '') : language === 'ar' ? (o.ar || o.en || '') : (o.en || o.fa || ''),
    desc: (o) => language === 'fa' ? (o.fa_d || o.en_d || '') : language === 'ar' ? (o.ar_d || o.en_d || '') : (o.en_d || o.fa_d || ''),
    // The existing recovery test independently validates every production video URL and event match.
    validRecoveryVideo: () => true
  };
  vm.createContext(context);
  const bundle = `(function(){${pieces.join('\n')}\nreturn {renderRecoveryDetail, renderRecoveryRegistry, recoveryDate, recoveryDisplay, recoveryArabicField, recoverySafeEnglish};})()`;
  return vm.runInContext(bundle, context);
}

check('the recovery Arabic slice bumps the shared asset cache version', () => {
  assert.ok(html.includes('window.ORBITA_V = \"20261030country08\";'));
});

check('all 20 recovery sites have Arabic names, descriptions, cities, countries, operators, methods and coordinates', () => {
  assert.equal(recovery.sites.length, 20);
  for (const site of recovery.sites) {
    for (const key of ['ar', 'ar_d', 'city_ar', 'country_ar', 'op_ar', 'method_ar', 'coordinate_note_ar']) {
      assert.ok(site[key], `${site.id}.${key} is missing`);
      assert.doesNotMatch(site[key], PERSIAN_ONLY, `${site.id}.${key} contains Persian-only orthography`);
      assert.doesNotMatch(site[key], NON_LATIN_DIGITS, `${site.id}.${key} contains non-Latin digits`);
    }
    assert.ok(!site.coordinate_audit || site.coordinate_audit.ar, `${site.id} coordinate audit lacks Arabic`);
    for (const source of site.coordinate_supporting_sources || []) assert.ok(source.ar, `${site.id} supporting coordinate source lacks Arabic`);
  }
});

check('all 70 sourced events have Arabic summaries and caveats; all detailed English narratives have Arabic counterparts', () => {
  const events = recovery.sites.flatMap((site) => site.events || []);
  assert.equal(events.length, 70);
  for (const event of events) {
    for (const key of ['summary_ar', 'note_ar']) {
      assert.ok(event[key], `${event.id}.${key} is missing`);
      assert.doesNotMatch(event[key], PERSIAN_ONLY, `${event.id}.${key} contains Persian-only orthography`);
      assert.doesNotMatch(event[key], NON_LATIN_DIGITS, `${event.id}.${key} contains non-Latin digits`);
    }
    for (const key of ['context', 'sequence', 'significance']) {
      if (event[`${key}_en`]) {
        assert.ok(event[`${key}_ar`], `${event.id}.${key}_ar is missing`);
        assert.doesNotMatch(event[`${key}_ar`], PERSIAN_ONLY, `${event.id}.${key}_ar contains Persian-only orthography`);
        assert.doesNotMatch(event[`${key}_ar`], NON_LATIN_DIGITS, `${event.id}.${key}_ar contains non-Latin digits`);
      }
    }
    if (event.recovery_scope_en) assert.ok(event.recovery_scope_ar, `${event.id} recovery-scope Arabic is missing`);
    if (event.actual_location_en) assert.ok(event.actual_location_ar, `${event.id} actual-location Arabic is missing`);
    for (const source of event.supporting_sources || []) if (source.en) assert.ok(source.ar, `${event.id} supporting source lacks Arabic`);
    for (const video of event.videos || []) assert.ok(video.title_ar, `${event.id} video title lacks Arabic`);
  }
});

check('all landing registries and explanatory row notes have Arabic labels while preserving the 1,028 source rows', () => {
  const registries = recovery.sites.filter((site) => site.landing_registry);
  const entries = registries.flatMap((site) => site.landing_registry.entries || []);
  assert.equal(registries.length, 16);
  assert.equal(entries.length, 1028);
  for (const site of registries) {
    const registry = site.landing_registry;
    assert.ok(registry.scope_ar, `${site.id} registry scope lacks Arabic`);
    assert.ok(registry.basis_ar, `${site.id} registry date basis lacks Arabic`);
    for (const row of registry.entries) {
      if (row.n_en) {
        assert.ok(row.n_ar, `${site.id} registry note lacks Arabic: ${row.n_en}`);
        assert.doesNotMatch(row.n_ar, PERSIAN_ONLY);
        assert.doesNotMatch(row.n_ar, NON_LATIN_DIGITS);
      }
    }
  }
});

check('the existing recovery renderer executes in Arabic for every site and presents Arabic UI, dates and outcomes', () => {
  const api = recoveryApi('ar');
  for (const site of recovery.sites) {
    const html = api.renderRecoveryDetail(site);
    assert.ok(html.includes(site.ar), `${site.id} Arabic site name was not rendered`);
    assert.ok(html.includes(site.ar_d), `${site.id} Arabic site description was not rendered`);
    assert.match(html, /نظرة عامة/);
    assert.match(html, /سجل الهبوط والاستعادة/);
    assert.match(html, /ملف الموقع/);
    assert.match(html, /الأحداث الموثقة/);
    assert.match(html, /مصادر الحدث|المصادر وملاحظات السجل/);
    assert.doesNotMatch(html, PERSIAN_ONLY, `${site.id} rendered Persian-only text`);
    assert.doesNotMatch(html, NON_LATIN_DIGITS, `${site.id} rendered non-Latin digits`);
    assert.match(html, /20[0-9]{2}|[0-9]{1,2} \S+ 20[0-9]{2}/, `${site.id} Arabic date did not use Western digits`);
    for (const event of site.events) {
      assert.ok(html.includes(event.summary_ar), `${site.id}/${event.id} Arabic summary not rendered`);
      assert.ok(html.includes(event.note_ar), `${site.id}/${event.id} Arabic record note not rendered`);
      if (event.context_en) assert.ok(html.includes(event.context_ar), `${event.id} context translation not rendered`);
      if (event.sequence_en) assert.ok(html.includes(event.sequence_ar), `${event.id} sequence translation not rendered`);
      if (event.significance_en) assert.ok(html.includes(event.significance_ar), `${event.id} significance translation not rendered`);
    }
  }
  assert.equal(api.recoveryDate('2026-10-24').includes('٢٠٢٦'), false);
});

check('Arabic-safe fallback rejects Persian source fragments but retains approved English technical names', () => {
  const api = recoveryApi('ar');
  assert.equal(api.recoveryArabicField('إحداثيات الموقع'), 'إحداثيات الموقع');
  assert.equal(api.recoveryArabicField('مختصات سایت'), '');
  assert.equal(api.recoverySafeEnglish('مختصات سایت', 'غير متاح'), 'غير متاح');
  assert.equal(api.recoverySafeEnglish('Falcon 9 · ۱۴۰۳', 'غير متاح'), 'Falcon 9 · 1403');
  assert.equal(api.recoveryDisplay('عنوان فارسی', 'Falcon 9', '', 'غير متاح'), 'Falcon 9');
});

check('Persian and English recovery views remain available beside Arabic', () => {
  const faApi = recoveryApi('fa');
  const enApi = recoveryApi('en');
  const site = recovery.sites[0];
  const faHtml = faApi.renderRecoveryDetail(site);
  const enHtml = enApi.renderRecoveryDetail(site);
  assert.ok(faHtml.includes(site.fa));
  assert.ok(faHtml.includes('معرفی محل'));
  assert.ok(faHtml.includes('کشور محل بازگشت'));
  assert.ok(faHtml.includes('تاریخچهٔ فرود و بازیابی'));
  assert.ok(enHtml.includes(site.en));
  assert.ok(enHtml.includes('Landing & recovery history'));
});

if (process.exitCode) process.exit(process.exitCode);
console.log('Recovery Arabic checks complete.');
