// Regression checks for the reviewed first-batch propulsion logo assets.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const companies = JSON.parse(fs.readFileSync(path.join(root, 'data/companies.json'), 'utf8'));
const propulsion = JSON.parse(fs.readFileSync(path.join(root, 'data/companies_propulsion.json'), 'utf8'));
const companyById = Object.fromEntries(companies.map(company => [company.id, company]));
const step1Ids = [
  'aalpt-china', 'asri-ukzn', 'agile', 'aio-propulsion', 'airborne-eng', 'safran-vernon',
  'atd-aerospace-rs', 'avio-aero', 'bellatrix', 'benchmark', 'blueorigin-engine', 'borospace',
  'bradford-ecaps', 'busek', 'cstp-nasrda', 'cubestar', 'dawn-aerospace', 'deltav',
  'dlr-lampoldshausen', 'enpulsion', 'europropulsion', 'exotrail', 'hyprspace', 'ienai-space'
];
const expectedLogoIds = new Set(step1Ids.filter(id => !['aio-propulsion', 'cubestar'].includes(id)));
const propulsionIds = new Set(propulsion.map(company => company.id));

assert.equal(step1Ids.length, 24, 'step 1 still contains the approved 24 records');
assert.ok(step1Ids.every(id => propulsionIds.has(id)), 'all step-1 records remain in the propulsion slice');
assert.deepEqual(
  new Set(step1Ids.filter(id => companyById[id] && companyById[id].logo)),
  expectedLogoIds,
  'only records with a verified logo mark have a logo path'
);

for (const id of expectedLogoIds) {
  const company = companyById[id];
  const relative = company.logo;
  assert.ok(relative.startsWith('assets/img/logos/'), `${id} uses a local logo asset`);
  assert.ok(fs.existsSync(path.join(root, relative)), `${id} logo file exists`);
  assert.ok(['.png', '.svg'].includes(path.extname(relative).toLowerCase()), `${id} uses a browser-supported image format`);
  assert.ok(propulsion.find(record => record.id === id)?.logo === relative, `${id} logo is present in the generated propulsion slice`);
  if (company.logo_bg != null) assert.equal(company.logo_bg, 'light', `${id} uses the supported light-surface option`);
}

const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const detailStart = app.indexOf('  function renderPropulsionDetail(p) {');
assert.notEqual(detailStart, -1, 'propulsion dossier renderer exists');
const detailEnd = app.indexOf('\n  function ', detailStart + 3);
const detailRenderer = app.slice(detailStart, detailEnd < 0 ? undefined : detailEnd);
assert.match(detailRenderer, /var logoSrc = o\.logo_data \|\| o\.logo;/);
assert.match(detailRenderer, /o\.logo_bg === "light"/);
assert.match(detailRenderer, /object-fit:contain/);
assert.match(detailRenderer, /iconFor\("propulsion", "active"\)/, 'unverified logos retain the category-icon fallback');

console.log(`Verified ${expectedLogoIds.size} reviewed step-1 logo assets; ${step1Ids.length - expectedLogoIds.size} records remain without a verified logo.`);
