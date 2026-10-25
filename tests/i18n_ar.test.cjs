// Static guard for the staged Arabic-locale foundation.
// Run with: node tests/i18n_ar.test.cjs
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

const start = app.indexOf('var I18N = {');
const end = app.indexOf('\n  function t(k)', start);
const block = start >= 0 && end > start ? app.slice(start, end) : '';
const dictionaries = {};
for (const locale of ['fa', 'en', 'ar']) {
  const match = block.match(new RegExp('(?:^|\\n)\\s*' + locale + ':\\s*\\{([\\s\\S]*?)\\n\\s*\\}\\s*,?', 'm'));
  if (!match) continue;
  const entries = [...match[1].matchAll(/(?:^|,)\s*([A-Za-z_][A-Za-z0-9_]*):\s*"((?:[^"\\]|\\.)*)"/g)];
  dictionaries[locale] = new Map(entries.map(entry => [entry[1], entry[2]]));
}

const allLocalesFound = ['fa', 'en', 'ar'].every(locale => dictionaries[locale]);
check(allLocalesFound, 'fa/en/ar central dictionaries are present');

if (allLocalesFound) {
  const keySets = ['fa', 'en', 'ar'].map(locale => new Set(dictionaries[locale].keys()));
  const sameKeys = keySets.every(set => set.size === keySets[0].size && [...keySets[0]].every(key => set.has(key)));
  check(sameKeys, 'fa/en/ar central dictionaries have identical key coverage');
  const arValuesValid = [...dictionaries.ar].every(([key, value]) => value.trim() && value !== key);
  check(arValuesValid, 'Arabic dictionary has no empty values or raw key fallbacks');
  check(dictionaries.ar.size >= 120, 'Arabic dictionary covers the shared interface and common tools');

  const htmlKeys = new Set();
  for (const attr of ['data-i18n', 'data-i18n-ph', 'data-i18n-title']) {
    const re = new RegExp(attr + '="([^"]+)"', 'g');
    let m;
    while ((m = re.exec(html))) htmlKeys.add(m[1]);
  }
  const missingHtmlKeys = [...htmlKeys].filter(key => !dictionaries.ar.has(key));
  check(missingHtmlKeys.length === 0, 'all HTML translation attributes exist in Arabic (' + htmlKeys.size + ' unique keys)');
}

check(app.includes('LANG === "fa" ? "en" : LANG === "en" ? "ar" : "fa"'), 'language selector cycles Persian → English → Arabic');
check(app.includes('(LANG === "fa" || LANG === "ar") ? "rtl" : "ltr"'), 'Arabic and Persian both select RTL direction');
check(app.includes('["get", "name_ar"], ["get", "name:ar"], ["get", "name_en"]'), 'basemap prefers Arabic labels and falls back to English');

console.log(`${passed} PASS / ${failed} FAIL`);
process.exitCode = failed ? 1 : 0;
