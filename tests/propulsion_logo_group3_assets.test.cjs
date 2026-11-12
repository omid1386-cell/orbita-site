// Regression checks for the reviewed third-batch propulsion logo assets.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const companies = JSON.parse(fs.readFileSync(path.join(root, 'data/companies.json'), 'utf8'));
const propulsion = JSON.parse(fs.readFileSync(path.join(root, 'data/companies_propulsion.json'), 'utf8'));
const companyById = Object.fromEntries(companies.map(company => [company.id, company]));
const propulsionById = Object.fromEntries(propulsion.map(company => [company.id, company]));

const group3Ids = [
  'rocketdyne', 'ursamajor', 'thrustme', 'spaceforest', 'phasefour', 'accion', 'sitael',
  'spacex-engine', 'relativity-engine', 'casc-6th', 'vacco', 'solid-state-propulsion-za',
  'pyralink-aerospace', 'spacefields', 'regulus-guyane', 'safran-spacecraft-propulsion',
  'pulsar-fusion', 't4i', 'pangea-propulsion', 'uec-kuznetsov', 'proton-pm', 'sets', 'thaliana-space'
];

const expectedLogos = {
  'rocketdyne': 'assets/img/logos/rocketdyne-logo.png',
  'ursamajor': 'assets/img/logos/ursamajor-logo.png',
  'thrustme': 'assets/img/logos/thrustme-logo.png',
  'spaceforest': 'assets/img/logos/spaceforest-logo.svg',
  'phasefour': 'assets/img/logos/phasefour-logo.png',
  'accion': 'assets/img/logos/revolution-space-logo.png',
  'sitael': 'assets/img/logos/sitael-logo.png',
  'spacex-engine': 'assets/img/logos/spacex-logo.svg',
  'relativity-engine': 'assets/img/logos/relativity-space-logo.png',
  'casc-6th': 'assets/img/logos/casc-parent-logo.png',
  'vacco': 'assets/img/logos/vacco-logo.png',
  'solid-state-propulsion-za': 'assets/img/logos/solid-state-propulsion-logo.png',
  'spacefields': 'assets/img/logos/spacefields-logo.png',
  'regulus-guyane': 'assets/img/logos/regulus-logo.png',
  'safran-spacecraft-propulsion': 'assets/img/logos/safran-parent-logo.svg',
  'pulsar-fusion': 'assets/img/logos/pulsar-fusion-logo.svg',
  't4i': 'assets/img/logos/t4i-logo.png',
  'pangea-propulsion': 'assets/img/logos/pangea-propulsion-logo.svg',
  'uec-kuznetsov': 'assets/img/logos/rostech-parent-logo.svg',
  'proton-pm': 'assets/img/logos/proton-pm-logo.svg',
  'sets': 'assets/img/logos/sets-logo.svg',
  'thaliana-space': 'assets/img/logos/thaliana-space-logo.svg'
};
const noVerifiedLogo = ['pyralink-aerospace'];
const lightBackgroundIds = [
  'thrustme', 'spaceforest', 'accion', 'sitael', 'casc-6th', 'vacco',
  'solid-state-propulsion-za', 'regulus-guyane', 'safran-spacecraft-propulsion',
  'pangea-propulsion', 'uec-kuznetsov', 'proton-pm'
];

assert.equal(group3Ids.length, 23, 'step 3 still contains the approved 24 records');
assert.equal(propulsion.length, 68, 'the reviewed 68-record propulsion slice remains complete');
assert.ok(group3Ids.every(id => companyById[id]), 'all approved records remain in the master dataset');
assert.ok(group3Ids.every(id => propulsionById[id]), 'all approved records remain in the propulsion slice');
assert.deepEqual(
  group3Ids.filter(id => companyById[id].logo).sort(),
  Object.keys(expectedLogos).sort(),
  'only reviewed and attributable group-3 logos are recorded'
);
assert.deepEqual(
  group3Ids.filter(id => !companyById[id].logo).sort(),
  [...noVerifiedLogo].sort(),
  'PyraLink remains without an unverified mark'
);

for (const [id, expectedPath] of Object.entries(expectedLogos)) {
  const company = companyById[id];
  const sliceCompany = propulsionById[id];
  assert.equal(company.logo, expectedPath, `${id} points to its reviewed asset`);
  assert.equal(sliceCompany.logo, expectedPath, `${id} logo is present in the generated propulsion slice`);
  assert.equal(sliceCompany.logo_bg, company.logo_bg, `${id} logo background is preserved in the propulsion slice`);
  assert.ok(expectedPath.startsWith('assets/img/logos/'), `${id} uses a local logo asset`);
  const absolute = path.join(root, expectedPath);
  assert.ok(fs.existsSync(absolute), `${id} logo file exists`);
  const ext = path.extname(absolute).toLowerCase();
  assert.ok(['.png', '.svg'].includes(ext), `${id} uses a supported image format`);
  if (ext === '.png') {
    const signature = fs.readFileSync(absolute).subarray(0, 8);
    assert.deepEqual([...signature], [137, 80, 78, 71, 13, 10, 26, 10], `${id} is a real PNG file`);
  } else {
    const svg = fs.readFileSync(absolute, 'utf8');
    assert.match(svg, /^\s*(?:<\?xml[^>]*>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg\b/i, `${id} SVG has a root element`);
    assert.doesNotMatch(svg, /<script\b|<foreignObject\b|<image\b|href=["']https?:/i, `${id} SVG has no active or remote content`);
  }
  if (lightBackgroundIds.includes(id)) {
    assert.equal(company.logo_bg, 'light', `${id} uses the supported light background`);
  } else {
    assert.equal(company.logo_bg, undefined, `${id} keeps the default dark background`);
  }
}

for (const id of noVerifiedLogo) {
  assert.equal(companyById[id].logo, undefined, `${id} remains without an unverified mark`);
  assert.equal(companyById[id].logo_bg, undefined, `${id} has no background override without a logo`);
  assert.equal(propulsionById[id].logo, undefined, `${id} has no unverified logo in the propulsion slice`);
}

assert.equal(companyById['casc-6th'].alias_of_id, 'aalpt-china', 'the CASC alias relationship is preserved');
assert.equal(companyById['casc-6th'].logo, companyById['aalpt-china'].logo, 'the CASC alias reuses the existing parent mark');
assert.equal(companyById['casc-6th'].logo_bg, companyById['aalpt-china'].logo_bg, 'the CASC alias uses the same mark background');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(html, /window\.ORBITA_V = "20261023mapuk2";/);
assert.match(html, /window\.ORBITA_APP_V = "20261111launch68deepappv3";/);

console.log(`Verified ${Object.keys(expectedLogos).length} reviewed group-3 logo assignments across ${group3Ids.length} records; one remains unassigned.`);
