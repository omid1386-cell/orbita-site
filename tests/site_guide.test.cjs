'use strict';
// Regression checks for ORBITA's searchable, visual, localized Help center.
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

const guideTitleKeys = [
  'guide_title', 'guide_quick_title', 'guide_map_title', 'guide_search_title',
  'guide_country_title', 'guide_companies_title',
  'guide_site_title', 'guide_recovery_title', 'guide_next_title', 'guide_controls_title',
  'guide_report_title', 'guide_data_title', 'guide_scope_title', 'guide_sources_title',
  'guide_metrics_title', 'guide_limits_title', 'guide_glossary_title', 'guide_note'
];
const guideBodyKeys = [
  'guide_quick_body', 'guide_map_body', 'guide_search_body', 'guide_country_body',
  'guide_companies_body', 'guide_site_body', 'guide_recovery_body',
  'guide_next_body', 'guide_controls_body', 'guide_report_body', 'guide_data_body',
  'guide_scope_body', 'guide_sources_body', 'guide_metrics_body', 'guide_limits_body',
  'guide_glossary_body'
];
const guideUiKeys = [
  'guide_search_label', 'guide_search_placeholder', 'guide_search_hint', 'guide_search_clear',
  'guide_tasks_title', 'guide_tasks_intro', 'guide_task_find_title', 'guide_task_find_body',
  'guide_task_counts_title',
  'guide_task_counts_body', 'guide_results_heading', 'guide_results_count',
  'guide_no_results_title', 'guide_no_results_body', 'guide_suggestions_label',
  'guide_suggest_map', 'guide_suggest_metrics',
  'guide_topics_title', 'guide_topics_intro', 'guide_open_map',
  'guide_open_report', 'guide_site_tab_overview', 'guide_site_tab_history',
  'guide_site_tab_upcoming', 'guide_site_tab_analysis', 'guide_recovery_tab_overview',
  'guide_recovery_tab_history', 'guide_recovery_tab_upcoming'
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

test('the existing Help icon opens an accessible dialog with local search and task shortcuts', () => {
  assert.match(html, /<button id="siteGuideBtn"[^>]*aria-haspopup="dialog"[^>]*aria-controls="siteGuideDialog"/);
  assert.match(html, /data-i18n="guide_button"/);
  assert.match(html, /data-i18n-aria-label="guide_button"/);
  assert.match(dialog, /aria-labelledby="siteGuideTitle"/);
  assert.match(dialog, /aria-describedby="siteGuideIntro"/);
  assert.match(dialog, /id="siteGuideSearch" type="search"/);
  assert.match(dialog, /<label for="siteGuideSearch"[^>]*data-i18n="guide_search_label"/);
  assert.match(dialog, /id="siteGuideSearchClear"[^>]*hidden/);
  assert.match(dialog, /id="siteGuideResultsStatus"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(dialog, /id="siteGuideNoResults"[^>]*hidden/);
  assert.match(dialog, /id="siteGuideShortcuts"/);
  assert.match(dialog, /data-guide-open-topic="search"/);
  assert.doesNotMatch(dialog, /data-guide-open-topic="projects"/);
  assert.match(dialog, /data-guide-open-topic="metrics"/);
  assert.match(dialog, /id="siteGuideClose"[^>]*data-i18n-aria-label="guide_close"/);
});

test('the guide covers all current user-facing areas and gives each topic an identifying icon', () => {
  const topics = [...dialog.matchAll(/data-guide-topic="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(topics, [
    'quick', 'map', 'search', 'country', 'companies', 'site', 'recovery',
    'next', 'controls', 'report', 'data', 'scope', 'sources', 'metrics', 'limits', 'glossary'
  ]);
  assert.equal((dialog.match(/class="site-guide-topic-icon" data-guide-icon=/g) || []).length, topics.length);
  assert.match(dialog, /data-guide-visual="map-categories"/);
  assert.doesNotMatch(dialog, /data-guide-visual="missions-table"/);
  assert.match(dialog, /data-guide-visual="company-categories"/);
  assert.match(dialog, /data-guide-visual="site-tabs"/);
  assert.match(dialog, /data-guide-visual="recovery-tabs"/);
  assert.match(dialog, /data-guide-visual="top-controls"/);
  assert.match(app, /function guideIconMarkup\(name\)/);
  assert.match(app, /iconFor\(name, "active"\)/,
    'map-category help previews reuse the app’s actual marker artwork');
  assert.match(app, /function renderGuideVisuals\(\)/);
  assert.doesNotMatch(dialog, /<details class="site-guide-section"[^>]* open>/,
    'topic details stay collapsed until a user chooses one');
});

test('all Help text and controls are localized in Persian, English, and Arabic', () => {
  for (const key of [...guideTitleKeys, ...guideBodyKeys, ...guideUiKeys]) {
    assert.equal(localeValues(key).length, 3, `${key} exists in fa/en/ar`);
  }
  for (const key of [...guideTitleKeys, ...guideBodyKeys]) {
    assert.match(dialog, new RegExp(`data-i18n="${key}"`), `${key} is used by Help markup`);
  }
  for (const key of guideUiKeys) {
    assert.ok(app.includes(`"${key}"`) || dialog.includes(`data-i18n="${key}"`) ||
      dialog.includes(`data-i18n-ph="${key}"`) || dialog.includes(`data-i18n-aria-label="${key}"`),
      `${key} is used by localized Help UI or a generated preview`);
  }
  assert.doesNotMatch(dialog, /<(?:img|iframe|video|audio|script)\b/i,
    'visuals are local inline artwork and add no external media requests');
  assert.match(app, /\$\$\("\[data-i18n-aria-label\]"\)/,
    'icon-only controls receive localized accessible names');
});

test('the Help search matches localized content and synonyms and offers alternatives for an empty result', () => {
  assert.match(app, /function guideSearchNormalize\(value\)/);
  assert.match(app, /normalize\("NFKC"\)/);
  assert.match(app, /\.replace\(\/\[يى\]\/g, "ی"\)/);
  assert.match(guideBinding, /data-guide-keywords/);
  assert.match(guideBinding, /words\.every\(function \(word\)/);
  assert.match(guideBinding, /noResults\.hidden = !active \|\| matchCount > 0/);
  assert.match(guideBinding, /guide_results_count/);
  assert.match(guideBinding, /siteGuideSearchClear/);
  assert.match(dialog, /data-i18n="guide_no_results_title"/);
  assert.match(dialog, /data-guide-open-topic="map"[^>]*data-i18n="guide_suggest_map"/);
  assert.doesNotMatch(dialog, /data-guide-open-topic="projects"/);
  assert.match(dialog, /data-guide-open-topic="metrics"[^>]*data-i18n="guide_suggest_metrics"/);
});

test('guide actions open the matching app view without loading new data', () => {
  assert.match(dialog, /data-guide-command="map-search"/);
  assert.doesNotMatch(dialog, /data-guide-command="missions"/);
  assert.match(dialog, /data-guide-command="report"/);
  assert.match(guideBinding, /function openTopic\(key\)/);
  assert.match(guideBinding, /function runGuideCommand\(command\)/);
  assert.match(guideBinding, /\.tab\[data-view='map'\]/);
  assert.doesNotMatch(guideBinding, /\.tab\[data-view='missions'\]/);
  assert.match(guideBinding, /#reportBtn/);
  assert.match(guideBinding, /openSide\(true\)/);
  assert.doesNotMatch(guideBinding, /map\.on\(|queryRenderedFeatures|renderMarkers\(|setData\(|fetch\(/,
    'Help navigation adds no map listeners, network fetches, or map-data rerenders');
});

test('expanded guide content accurately explains map profiles, sources, and limitations', () => {
  const approvedBodyKeys = [
    'guide_map_body', 'guide_search_body', 'guide_country_body',
    'guide_companies_body', 'guide_site_body', 'guide_recovery_body', 'guide_next_body',
    'guide_controls_body', 'guide_report_body', 'guide_glossary_body'
  ];
  for (const key of approvedBodyKeys) {
    const values = localeValues(key);
    assert.equal(values.length, 3, `${key} exists in all locales`);
    for (const value of values) assert.doesNotMatch(value, /\*\*|`/, `${key} has no raw Markdown markers`);
    assert.doesNotMatch(values[2], /[پچژگکی]/, `${key} Arabic copy contains no Persian-only letters`);
  }
  const allApproved = approvedBodyKeys.map(localeValues).flat().join('\n');
  assert.match(allApproved, /Launch Library 2/);
  assert.match(allApproved, /The Space Devs/);
  assert.match(allApproved, /satellite manufacturers|سازندگان ماهواره|مصنّعو الأقمار الصناعية/);
  assert.match(allApproved, /manual|دستی|يدوية/);
  assert.match(allApproved, /UTC/);
  assert.equal((dialog.match(/data-i18n="guide_projects_body"/g) || []).length, 0);
});

test('coverage, sources, freshness, statuses, and location caveats match the local datasets', () => {
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
  assert.doesNotMatch(metricsCopy, /Space Projects|فهرست پروژه‌ها|علامة المشاريع الفضائية/);
  assert.match(metricsCopy, /zero|صفر|الصفر/i,
    'zero or blank is explained as a data-coverage statement, not proof of absence');
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

test('opening and closing Help is keyboard accessible and restores focus', () => {
  assert.match(guideBinding, /dialog\.showModal\(\)/);
  assert.match(guideBinding, /dialog\.close\(\)/);
  assert.match(guideBinding, /event\.target === dialog/,
    'clicking the modal backdrop closes Help');
  assert.match(guideBinding, /event\.stopPropagation\(\)/,
    'Help keys do not invoke unrelated global map shortcuts');
  assert.match(guideBinding, /aria-expanded", "true"/);
  assert.match(guideBinding, /aria-expanded", "false"/);
  assert.match(guideBinding, /trigger\.focus\(\{ preventScroll: true \}\)/,
    'keyboard focus returns to the Help trigger after closing');
  assert.match(guideBinding, /search\.focus\(\{ preventScroll: true \}\)/,
    'opening Help moves focus to its search field');
});

test('Help styling is responsive, visually identifies sections, and keeps its own scrolling', () => {
  assert.match(css, /\.site-guide-dialog::backdrop/);
  assert.match(css, /\.site-guide-content\{[^}]*overflow:auto/);
  assert.match(css, /\.site-guide-copy\{[^}]*white-space:pre-line/);
  assert.match(css, /\.site-guide-topic-icon/);
  assert.match(css, /\.site-guide-preview-categories/);
  assert.match(css, /\.site-guide-task-grid/);
  assert.match(css, /\.site-guide-searchbox:focus-within/);
  assert.match(css, /\.site-guide-section summary:focus-visible/);
  assert.match(css, /@media\(max-width:820px\)[\s\S]*?\.guide-trigger-label\{display:none\}/,
    'the topbar trigger remains a compact, accessible icon on mobile');
  assert.match(css, /@media\(max-width:680px\)[\s\S]*?\.site-guide-task-grid\{grid-template-columns:1fr[^}]*\}/,
    'Help shortcuts adapt to narrow screens');
});

console.log('PASS: the searchable Help center is localized, visual, accessible, and grounded in current app data.');
