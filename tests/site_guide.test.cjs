'use strict';
// Regression checks for the lightweight, localized site guide and its data claims.
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/css/app.css'), 'utf8');
const countrySource = fs.readFileSync(path.join(root, 'assets/geo/countries-source.md'), 'utf8');
const upcoming = JSON.parse(fs.readFileSync(path.join(root, 'data/upcoming.json'), 'utf8'));
const upcomingLandings = JSON.parse(fs.readFileSync(path.join(root, 'data/upcoming_landings.json'), 'utf8'));
const recovery = JSON.parse(fs.readFileSync(path.join(root, 'data/recovery_sites.json'), 'utf8'));
const companies = JSON.parse(fs.readFileSync(path.join(root, 'data/companies.json'), 'utf8'));
const sites = JSON.parse(fs.readFileSync(path.join(root, 'data/sites.json'), 'utf8'));
const missions = JSON.parse(fs.readFileSync(path.join(root, 'data/missions.json'), 'utf8'));

const dialogStart = html.indexOf('<dialog id="siteGuideDialog"');
const dialogEnd = html.indexOf('</dialog>', dialogStart);
assert.ok(dialogStart >= 0 && dialogEnd > dialogStart, 'site guide dialog is present in the page');
const dialog = html.slice(dialogStart, dialogEnd + '</dialog>'.length);
const guideStart = app.indexOf('  function bindSiteGuide() {');
const guideEnd = app.indexOf('  var MAP_STYLE', guideStart);
assert.ok(guideStart >= 0 && guideEnd > guideStart, 'site guide event binding exists');
const guideBinding = app.slice(guideStart, guideEnd);

const guideKeys = [
  'guide_title', 'guide_quick_title', 'guide_map_title', 'guide_search_title',
  'guide_country_title', 'guide_projects_title', 'guide_companies_title',
  'guide_site_title', 'guide_recovery_title', 'guide_next_title', 'guide_data_title',
  'guide_scope_title', 'guide_sources_title', 'guide_metrics_title', 'guide_limits_title',
  'guide_glossary_title', 'guide_note'
];
const guideBodyKeys = [
  'guide_quick_body', 'guide_map_body', 'guide_search_body', 'guide_country_body',
  'guide_projects_body', 'guide_companies_body', 'guide_site_body', 'guide_recovery_body',
  'guide_next_body', 'guide_data_body', 'guide_scope_body', 'guide_sources_body',
  'guide_metrics_body', 'guide_limits_body', 'guide_glossary_body'
];
function localeValues(key) {
  const re = new RegExp(`\\b${key}: "([^"\\n]*)"`, 'g');
  return [...app.matchAll(re)].map(match => match[1]);
}
function normalizeDigits(text) {
  return text
    .replace(/[۰-۹]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x06f0 + 0x30))
    .replace(/[٠-٩]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x0660 + 0x30));
}

test('the guide has an accessible topbar trigger and fifteen progressive-disclosure sections', () => {
  assert.match(html, /<button id="siteGuideBtn"[^>]*aria-haspopup="dialog"[^>]*aria-controls="siteGuideDialog"/);
  assert.match(html, /data-i18n="guide_button"/);
  assert.match(html, /data-i18n-aria-label="guide_button"/);
  assert.match(dialog, /aria-labelledby="siteGuideTitle"/);
  assert.match(dialog, /aria-describedby="siteGuideIntro"/);
  assert.match(dialog, /id="siteGuideClose"[^>]*data-i18n-aria-label="guide_close"/);
  assert.equal((dialog.match(/<details class="site-guide-section"/g) || []).length, 15,
    'the expanded guide covers map/search, country and organization profiles, launch/recovery, the banner, and retained caveats');
  assert.match(dialog, /<details class="site-guide-section" open>/,
    'only the quick-start section is visible immediately');
  assert.deepEqual(
    [...dialog.matchAll(/class="site-guide-step" aria-hidden="true">(\d{2})/g)].map(m => m[1]),
    ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15']
  );
});

test('the guide is localized, static, and adds no external media requests', () => {
  for (const key of [...guideKeys, ...guideBodyKeys]) {
    assert.equal(localeValues(key).length, 3, `${key} exists in fa/en/ar dictionaries`);
    assert.match(dialog, new RegExp(`data-i18n="${key}"`), `${key} is used by the guide markup`);
  }
  for (const key of ['guide_scope_body', 'guide_sources_body', 'guide_metrics_body', 'guide_limits_body']) {
    assert.match(dialog, new RegExp(`<p class="site-guide-copy" data-i18n="${key}"></p>`),
      `${key} stays out of the HTML fallback and is filled from the active locale at startup`);
  }
  assert.doesNotMatch(dialog, /<(?:img|iframe|video|audio|script)\b/i,
    'the guide does not add image, player, or script network work');
  assert.match(app, /\$\$\("\[data-i18n-aria-label\]"\)/,
    'icon-only controls receive a localized accessible name');
});

test('approved profile copy is localized and the existing Space Projects copy stays unchanged', () => {
  const approvedBodyKeys = [
    'guide_map_body', 'guide_search_body', 'guide_country_body', 'guide_companies_body',
    'guide_site_body', 'guide_recovery_body', 'guide_next_body', 'guide_glossary_body'
  ];
  for (const key of approvedBodyKeys) {
    const values = localeValues(key);
    assert.equal(values.length, 3, `${key} exists in fa/en/ar`);
    for (const value of values) assert.doesNotMatch(value, /\*\*|`/, `${key} has no raw Markdown markers`);
    assert.doesNotMatch(values[2], /[پچژگکی]/, `${key} Arabic copy contains no Persian-only letters`);
  }
  assert.deepEqual(localeValues('guide_projects_title'), ['پروژه‌های فضایی', 'Space Projects', 'المشاريع الفضائية']);
  assert.deepEqual(localeValues('guide_projects_body'), [
    'در برگهٔ پروژه‌های فضایی می‌توانید نتایج بارگذاری‌شده را جست‌وجو کنید و بر اساس وضعیت، مدار یا نوع مأموریت فیلتر کنید.',
    'The Space Projects tab lets you search loaded results and filter them by status, orbit or mission type.',
    'تتيح علامة تبويب المشاريع الفضائية البحث ضمن النتائج المحمّلة وتصفيتها حسب الحالة أو المدار أو نوع المهمة.'
  ]);
  assert.equal((dialog.match(/data-i18n="guide_projects_body"/g) || []).length, 1,
    'the existing short Projects entry remains a single, unchanged section');
  const allApproved = approvedBodyKeys.map(localeValues).flat().join('\n');
  assert.match(allApproved, /Launch Library 2/);
  assert.match(allApproved, /The Space Devs/);
  assert.match(allApproved, /satellite manufacturers|سازندگان ماهواره|مصنّعو الأقمار الصناعية/);
  assert.match(allApproved, /manual|دستی|يدوية/);
  assert.match(allApproved, /UTC/);
});

test('coverage, sources, freshness, statuses and location caveats match the local datasets', () => {
  assert.equal(recovery.sites.length, 20);
  assert.match(recovery.scope, /20 representative locations across four countries and international waters/i);
  assert.match(recovery.scope, /not complete global coverage/i);
  assert.ok(recovery.sites.every(site => site.reviewed_on), 'recovery location review dates are recorded');
  assert.ok(recovery.sites.every(site => (site.events || []).every(event => event.source_url && (event.verified_on || site.reviewed_on))),
    'recovery event sources and verification/review dates are available in the dossiers');

  assert.match(upcoming.note_fa, /The Space Devs/);
  assert.match(upcoming.note_fa, /هم‌زمانی زنده/);
  assert.match(upcomingLandings.source_note_en, /Manual snapshot of Launch Library 2/i);
  assert.ok(upcomingLandings.landings.some(row => !row.date), 'the landing snapshot contains queued rows without a date');
  assert.match(countrySource, /Terrae 2026\.10/);
  assert.match(countrySource, /28 September 2026/);
  assert.match(countrySource, /not authoritative legal boundaries/i);

  const scopeCopy = localeValues('guide_scope_body');
  assert.equal(scopeCopy.length, 3);
  for (const text of scopeCopy) {
    assert.match(normalizeDigits(text), /(?:^|\D)20(?:\D|$)/,
      'the current recovery-location count is stated in every language');
    assert.match(text, /ORBITA/);
  }
  const sourceCopy = localeValues('guide_sources_body').join('\n');
  assert.match(sourceCopy, /The Space Devs/);
  assert.match(sourceCopy, /Launch Library 2/);
  assert.match(sourceCopy, /manual|دستی|يدوية/);
  assert.doesNotMatch(sourceCopy, /2026-10-(?:13|24)|October 13, 2026|۱۳ اکتبر ۲۰۲۶/,
    'mutable update/snapshot dates are not hardcoded into the guide');

  const metricsCopy = localeValues('guide_metrics_body').join('\n');
  assert.match(metricsCopy, /Go\/TBC\/TBD/);
  assert.match(metricsCopy, /TBA/);
  assert.match(metricsCopy, /UTC/);
  assert.match(metricsCopy, /zero|صفر|الصفر/i,
    'the guide explains that zero or blank is a data-coverage statement, not proof of absence');
  const locationCopy = localeValues('guide_limits_body').join('\n');
  assert.match(locationCopy, /Terrae 2026\.10/);
  assert.match(locationCopy, /OpenStreetMap/);

  const genericProvenance = record => ['source_url', 'sources', 'reviewed_on', 'verified_on']
    .some(key => Object.hasOwn(record, key));
  assert.ok(companies.every(record => !genericProvenance(record)));
  assert.ok(sites.every(record => !genericProvenance(record)),
    'photo-source fields are not treated as citations for all facility facts');
  assert.ok(missions.every(record => !genericProvenance(record)));
  assert.ok(companies.some(record => record.site), 'company websites are present but are not per-field source metadata');
  assert.ok(sites.some(record => record.photo_source_url), 'site photo credits are distinct from general data citations');
});

test('opening and closing the guide is isolated from map events and restores focus', () => {
  assert.match(guideBinding, /dialog\.showModal\(\)/);
  assert.match(guideBinding, /dialog\.close\(\)/);
  assert.match(guideBinding, /event\.target === dialog/,
    'clicking the modal backdrop closes the guide');
  assert.match(guideBinding, /event\.stopPropagation\(\)/,
    'guide keys do not invoke unrelated global map shortcuts');
  assert.match(guideBinding, /aria-expanded", "true"/);
  assert.match(guideBinding, /aria-expanded", "false"/);
  assert.match(guideBinding, /trigger\.focus\(\{ preventScroll: true \}\)/,
    'keyboard focus returns to the trigger after closing');
  assert.doesNotMatch(guideBinding, /map\.on\(|queryRenderedFeatures|renderMarkers\(|setData\(|fetch\(/,
    'the guide introduces no map listeners, data queries, rerenders, or fetches');
});

test('guide styling is responsive and only its own content scrolls', () => {
  assert.match(css, /\.site-guide-dialog::backdrop/);
  assert.match(css, /\.site-guide-content\{[^}]*overflow-y:auto/);
  assert.match(css, /\.site-guide-copy\{[^}]*white-space:pre-line/,
    'line breaks in approved multi-paragraph copy remain readable in all locales');
  assert.match(css, /@media\(max-width:820px\)[\s\S]*?\.guide-trigger-label\{display:none\}/,
    'the header trigger becomes a compact, accessibly labelled icon on mobile');
  assert.match(css, /@media\(max-width:560px\)[\s\S]*?\.site-guide-dialog\{/,
    'the guide is sized for narrow screens');
  assert.match(css, /\.site-guide-section summary:focus-visible/,
    'keyboard focus remains visible in the guide');
});

console.log('PASS: the localized site guide is on-demand, keyboard accessible, data-caveat aware, responsive, and isolated from map work.');
