// Regression checks for the reviewed second-batch propulsion logo assets.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const companies = JSON.parse(fs.readFileSync(path.join(root, 'data/companies.json'), 'utf8'));
const propulsion = JSON.parse(fs.readFileSync(path.join(root, 'data/companies_propulsion.json'), 'utf8'));
const companyById = Object.fromEntries(companies.map(company => [company.id, company]));
const propulsionById = Object.fromEntries(propulsion.map(company => [company.id, company]));
const group2Ids = [
  'ihi', 'impulse', 'ion-x', 'kbhm-isayev', 'lpsc-test', 'kbkha', 'l3harris',
  'lpsc-isro', 'magdrive', 'manastu', 'miprons', 'moog', 'morpheus-space', 'nakuja-project',
  'nammo', 'nasa-stennis', 'nasa-wstf', 'niimash', 'ngpropulsion', 'energomash', 'okb-fakel',
  'otespace', 'paleblue'
];
const expectedLogos = {
  'ihi': 'assets/img/logos/ihi-aerospace-logo.png',
  'impulse': 'assets/img/logos/impulse-space-logo.svg',
  'ion-x': 'assets/img/logos/ion-x-logo.svg',
  'kbhm-isayev': 'assets/img/logos/roscosmos-parent-logo-2022.png',
  'lpsc-test': 'assets/img/logos/isro-parent-logo.png',
  'kbkha': 'assets/img/logos/kbkha-logo.svg',
  'l3harris': 'assets/img/logos/l3harris-logo.svg',
  'lpsc-isro': 'assets/img/logos/lpsc-logo.png',
  'magdrive': 'assets/img/logos/magdrive-logo.svg',
  'manastu': 'assets/img/logos/manastu-space-logo.svg',
  'miprons': 'assets/img/logos/miprons-logo.png',
  'moog': 'assets/img/logos/moog-logo.png',
  'morpheus-space': 'assets/img/logos/morpheus-space-logo.png',
  'nammo': 'assets/img/logos/nammo-logo.svg',
  'nasa-stennis': 'assets/img/logos/nasa-logo.svg',
  'nasa-wstf': 'assets/img/logos/nasa-logo.svg',
  'niimash': 'assets/img/logos/niimash-logo.png',
  'ngpropulsion': 'assets/img/logos/northrop-grumman-logo.png',
  'energomash': 'assets/img/logos/roscosmos-parent-logo-2022.png',
  'okb-fakel': 'assets/img/logos/roscosmos-parent-logo-2022.png',
  'otespace': 'assets/img/logos/otespace-logo.png',
  'paleblue': 'assets/img/logos/paleblue-logo.png'
};
const noVerifiedLogo = ['nakuja-project'];
const lightBackgroundIds = [
  'ihi', 'kbhm-isayev', 'lpsc-test', 'lpsc-isro', 'magdrive', 'energomash', 'okb-fakel'
];

assert.equal(group2Ids.length, 23, 'step 2 still contains the approved 24 records');
assert.ok(group2Ids.every(id => companyById[id]), 'all approved records remain in the master dataset');
assert.ok(group2Ids.every(id => propulsionById[id]), 'all approved records remain in the propulsion slice');
assert.deepEqual(
  group2Ids.filter(id => companyById[id].logo).sort(),
  Object.keys(expectedLogos).sort(),
  'only the reviewed and attributable group-2 logos are recorded'
);
assert.deepEqual(
  group2Ids.filter(id => !companyById[id].logo).sort(),
  [...noVerifiedLogo].sort(),
  'Nakuja Project remains without an independently attributed logo'
);

for (const [id, expectedPath] of Object.entries(expectedLogos)) {
  const company = companyById[id];
  assert.equal(company.logo, expectedPath, `${id} points to its reviewed asset`);
  assert.equal(propulsionById[id].logo, expectedPath, `${id} logo is present in the generated propulsion slice`);
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
    assert.match(svg, /^\s*(?:<\?xml[^>]*>\s*)?<svg\b/i, `${id} SVG has a root element`);
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
  assert.equal(propulsionById[id].logo, undefined, `${id} has no unverified logo in the propulsion slice`);
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(html, /window\.ORBITA_V = "20261023mapuk2";/);
assert.match(html, /window\.ORBITA_APP_V = "20261111launch68deepappv3";/);

console.log(`Verified ${Object.keys(expectedLogos).length} reviewed group-2 logo assignments across ${group2Ids.length} records; ${noVerifiedLogo.length} remain unassigned.`);
