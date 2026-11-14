'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const start = app.indexOf('  function renderCountryProfile(p) {');
const end = app.indexOf('  window.isEntityInCountry = isEntityInCountry;', start);
assert.ok(start >= 0 && end > start, 'country renderer is present');
const source = app.slice(start, end);
const company = { id: 'israel-fa-only', cat: 'agency', country: '', country_fa: 'اسرائیل', fa: 'نمونه سازمان', en: 'Sample Agency' };
const sandbox = {
  LANG: 'fa',
  esc: value => String(value == null ? '' : value),
  DATA: { sites: [], recoveries: [] },
  canonicalCompanyRecords: () => [company],
  isEntityInCountry: (o, en, fa) => (o.country || '') === en || (o.country_fa || '') === fa,
  companyBelongsToCategory: (o, key) => o.cat === key,
  name: o => o.fa || o.en || o.id,
  desc: o => o.fa_d || o.en_d || '',
  layerName: key => key,
  countryOf: () => 'اسرائیل',
  countryNameAr: () => 'إسرائيل',
  countryNameKey: name => String(name || '').trim().toLowerCase(),
  flagCodesFor: () => ['il'],
  fallbackLogoDataUri: () => 'data:image/svg+xml;base64,AA==',
  fallbackImageErrorAttribute: () => '',
  extractEntityLinks: () => ({}),
  document: { getElementById: () => null }
};
vm.runInNewContext(source + '\nthis.renderCountryProfile = renderCountryProfile;', sandbox, { timeout: 3000 });
const html = sandbox.renderCountryProfile({ country: 'Israel', country_en: 'Israel', country_fa: 'اسرائیل', country_iso: 'IL' });
assert.match(html, /<h2 class="d-title">فلسطین اشغالی<\/h2>/, 'Persian country profile title uses the requested display name');
assert.doesNotMatch(html, /<div class="d-sub">Israel<\/div>/, 'canonical English label is not repeated in Persian country profile');
assert.match(html, /1 رکورد ثبت‌شده/, 'record matching still uses the original Persian country value');
sandbox.LANG = 'en';
const englishHtml = sandbox.renderCountryProfile({ country: 'Israel', country_en: 'Israel', country_fa: 'اسرائیل', country_iso: 'IL' });
assert.match(englishHtml, /<h2 class=\"d-title\">Israel<\/h2>/, 'English interface retains the canonical English country name');
console.log('PASS: Persian country dossier displays فلسطین اشغالی; canonical matching and record counts remain intact.');
