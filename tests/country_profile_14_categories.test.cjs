'use strict';
// Country dossiers must expose every map category, load every company slice,
// count multi-role entities once, and use a sourced Chabahar launch-site photo.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/css/app.css'), 'utf8');
const sites = JSON.parse(fs.readFileSync(path.join(root, 'data/sites.json'), 'utf8'));

const expectedCompanyCategories = [
  'launch', 'propulsion', 'satmaker', 'components', 'payloads', 'ground_services',
  'inspace_services', 'agency', 'university_space', 'test_facility', 'ground_station', 'mission_control'
];
const expectedAllCategories = [...expectedCompanyCategories.slice(0, 9), 'site', 'recovery', ...expectedCompanyCategories.slice(9)];
const renderStart = app.indexOf('  function renderCountryProfile(p) {');
const renderEnd = app.indexOf('  window.isEntityInCountry = isEntityInCountry;', renderStart);
assert.ok(renderStart >= 0 && renderEnd > renderStart, 'country renderer is present');
const rendererSource = app.slice(renderStart, renderEnd);

assert.ok(app.includes('COMPANY_CATEGORY_KEYS.every(function (key) { return COMPANY_CATEGORY_STATE[key] === "ready"; })'),
  'country dossier waits for every company category to finish loading');
assert.ok(app.includes('].concat(COMPANY_CATEGORY_KEYS.map(loadCompanyCategory))'),
  'country dossier requests all twelve company category datasets');
assert.ok(app.includes('else if (/^cCategory[A-Za-z0-9]+$/.test(tabId))'),
  'shared tab switcher supports dynamically generated category tabs');
assert.ok(rendererSource.includes('var categoryDefs = ['), 'country renderer declares its complete category list');
for (const key of expectedAllCategories) {
  assert.ok(rendererSource.includes('key: "' + key + '"'), 'country renderer includes ' + key);
}
assert.ok(rendererSource.includes('Object.keys(uniqueCompanyIds).length + siteItems.length + recoveryItems.length'),
  'headline total counts unique company IDs plus sites and recovery locations');
assert.ok(rendererSource.includes('multi-role entity') || rendererSource.includes('موجودیت چندنقشی'),
  'country dossier explains how multi-role records affect totals');
assert.ok(rendererSource.includes('Registered Records') && rendererSource.includes('رکورد ثبت‌شده'),
  'headline total is labelled as registered records rather than active entities');
assert.ok(css.includes('.country-profile-summary-grid') && css.includes('.country-profile-tabs') && css.includes('@media(max-width:560px)'),
  '14-category summary and tabs have responsive styling');
assert.ok(html.includes('20261114-country-profile-14categories-chabahar-v1'),
  'HTML cache keys are bumped for the country dossier and Chabahar image');

// Execute the actual renderer in a small isolated harness to verify the 14 tabs/panels.
const sampleCompanies = [
  { id: 'multi-launch-propulsion', cat: 'launch', secondary_categories: ['propulsion'], country: 'Iran', fa: 'شرکت چندنقشی', en: 'Multi-role Company', city: 'Tehran', city_fa: 'تهران' },
  { id: 'satmaker', cat: 'satmaker', country: 'Iran', fa: 'سازنده ماهواره', en: 'Satellite Maker' },
  { id: 'components', cat: 'components', country: 'Iran', fa: 'سازنده قطعات', en: 'Component Maker' },
  { id: 'payloads', cat: 'payloads', country: 'Iran', fa: 'سازنده محموله', en: 'Payload Maker' },
  { id: 'ground-services', cat: 'ground_services', country: 'Iran', fa: 'خدمات زمینی', en: 'Ground Services' },
  { id: 'inspace-services', cat: 'inspace_services', country: 'Iran', fa: 'خدمات مداری', en: 'In-space Services' },
  { id: 'agency', cat: 'agency', country: 'Iran', fa: 'سازمان فضایی', en: 'Space Agency' },
  { id: 'university', cat: 'university_space', country: 'Iran', fa: 'دانشگاه', en: 'University' },
  { id: 'test-facility', cat: 'test_facility', country: 'Iran', fa: 'مرکز آزمون', en: 'Test Facility' },
  { id: 'ground-station', cat: 'ground_station', country: 'Iran', fa: 'ایستگاه زمینی', en: 'Ground Station' },
  { id: 'mission-control', cat: 'mission_control', country: 'Iran', fa: 'مرکز کنترل', en: 'Mission Control' }
];
const labels = Object.fromEntries(expectedAllCategories.map(k => [k, k]));
const sandbox = {
  LANG: 'fa',
  DATA: { sites: [{ id: 'site-1', country: 'Iran', fa: 'پایگاه پرتاب', en: 'Launch Site', lat: 25, lon: 60 }], recoveries: [{ id: 'recovery-1', country: 'Iran', fa: 'محل بازیابی', en: 'Recovery Site', lat: 26, lon: 61 }] },
  canonicalCompanyRecords: () => sampleCompanies,
  isEntityInCountry: (o, en, fa) => o.country === en || o.country_fa === fa,
  companyBelongsToCategory: (o, key) => o.cat === key || (o.secondary_categories || []).includes(key),
  name: o => o.fa || o.en || o.id,
  desc: o => o.fa_d || o.en_d || '',
  layerName: key => labels[key] || key,
  countryOf: () => 'ایران',
  countryNameAr: () => 'إيران',
  flagCodesFor: () => ['ir'],
  fallbackLogoDataUri: () => 'data:image/svg+xml;base64,AA==',
  fallbackImageErrorAttribute: () => '',
  extractEntityLinks: () => ({}),
  esc: value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])),
  document: { getElementById: () => null }
};
vm.runInNewContext(rendererSource + '\nthis.renderCountryProfile = renderCountryProfile;', sandbox, { timeout: 3000 });
const rendered = sandbox.renderCountryProfile({ country: 'Iran', country_en: 'Iran', country_fa: 'ایران', country_ar: 'إيران', country_iso: 'IR' });
const count = (regex) => (rendered.match(regex) || []).length;
assert.equal(count(/class="site-tab-btn country-profile-tab/g), 14, 'runtime renderer emits 14 category tabs');
assert.equal(count(/class="site-tab-content country-profile-panel/g), 14, 'runtime renderer emits 14 category panels');
assert.equal(count(/class="country-profile-summary-item/g), 14, 'runtime renderer emits 14 category summary cells');
assert.match(rendered, /13 رکورد ثبت‌شده/, 'headline counts 11 unique companies + 2 infrastructure records with the multi-role entity once');
assert.match(rendered, /cCategoryGroundServices/, 'new category tab IDs are generated for ground services');

const chabahar = sites.find(s => s.id === 'chabahar');
assert.ok(chabahar, 'Chabahar launch site record exists');
assert.equal(chabahar.photo_url, 'https://newsmedia.tasnimnews.com/Tasnim/Uploaded/Image/1402/07/10/14020710092925717284705610.jpg',
  'Chabahar uses the Tasnim-published image identified as the actual spaceport');
assert.equal(chabahar.photo_credit, 'Tasnim News Agency', 'Chabahar image has an explicit credit');
assert.equal(chabahar.photo_license, 'CC BY 4.0', 'Chabahar image records the publisher-stated CC BY 4.0 license');
assert.match(chabahar.photo_source_url, /^https:\/\/www\.tasnimnews\.ir\//, 'Chabahar image links to its source article');
assert.ok(chabahar.photo_caption_fa && chabahar.photo_caption_en && chabahar.photo_caption_ar,
  'Chabahar image captions are localized in all three interface languages');

console.log('PASS: all 14 country categories, full data loading, unique totals, responsive UI, and sourced Chabahar image.');
