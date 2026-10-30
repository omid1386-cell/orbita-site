// Static regression tests for Arabic country names and the country-profile slice.
// Run with: node tests/country_ar.test.cjs
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let passed = 0;
let failed = 0;

function check(condition, label) {
  if (condition) {
    console.log('PASS ' + label);
    passed++;
  } else {
    console.error('FAIL ' + label);
    failed++;
  }
}

const arabic = /[\u0600-\u06FF]/;
const expectedOverrides = {
  Norway: 'النرويج',
  France: 'فرنسا',
  Taiwan: 'تايوان',
  'Turkish Republic of Northern Cyprus': 'قبرص الشمالية',
  Somaliland: 'أرض الصومال',
  Kosovo: 'كوسوفو'
};
for (const file of ['assets/geo/countries.json', 'assets/geo/labels.json']) {
  const geo = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const complete = geo.features.length === 177 && geo.features.every(feature =>
    feature.properties && typeof feature.properties.NAME_AR === 'string' && arabic.test(feature.properties.NAME_AR));
  check(complete, file + ' contains an Arabic name for all 177 country features');
  if (complete) {
    const byName = new Map(geo.features.map(feature => [feature.properties.NAME, feature.properties.NAME_AR]));
    check(Object.entries(expectedOverrides).every(([name, value]) => byName.get(name) === value),
      file + ' contains explicit Arabic overrides for the six nonstandard country codes');
  }
}

check(app.includes('country_ar: props.NAME_AR || countryNameAr(props.NAME, props.ISO)') &&
  app.includes('country_ar: best.properties.NAME_AR || countryNameAr(best.properties.NAME, best.properties.ISO)'),
  'Arabic country names survive polygon and label-based geographic matching');
check(app.includes('country_ar: record.ar, country_iso: record.iso') &&
  app.includes('var cAr = p.country_ar || (p.o ? p.o.country_ar : null) || countryNameAr(cEn, cIso) || cEn;'),
  'map selection passes the Arabic name through to the country dossier');
check(app.includes('var isAr = (typeof LANG !== "undefined" && LANG === "ar");') &&
  app.includes('"شركات أنظمة الدفع"') && app.includes('"شركات الإطلاق"') &&
  app.includes('"وكالات الفضاء"') && app.includes('"مواقع الإطلاق"') &&
  app.includes('"الهبوط والاستعادة"'),
  'country-dossier controls and categories have Arabic labels');
check(app.includes('live_note: "لا يتوفر وصف عربي لهذا الإطلاق حالياً."'),
  'live records use the exact user-approved Arabic fallback');
check(html.includes('window.ORBITA_V = "20261030country04";'), 'HTML and asset cache version is bumped for this slice');

console.log(`${passed} PASS / ${failed} FAIL`);
process.exitCode = failed ? 1 : 0;
