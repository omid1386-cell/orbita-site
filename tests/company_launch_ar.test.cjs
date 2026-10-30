// Regression tests for the Arabic launch-company dossier slice.
// Run with: node tests/company_launch_ar.test.cjs
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const companies = JSON.parse(fs.readFileSync(path.join(root, 'data/companies.json'), 'utf8'));
const sites = JSON.parse(fs.readFileSync(path.join(root, 'data/sites.json'), 'utf8'));
const launchCompanies = companies.filter(company => company.cat === 'launch');
const propulsionCompanies = companies.filter(company => company.cat === 'propulsion');
const agencyCompanies = companies.filter(company => company.cat === 'agency');
const satelliteMakers = companies.filter(company => company.cat === 'satmaker');
const arabic = /[\u0600-\u06FF]/;
const persianOnly = /[پچژگکی]/;
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

check(launchCompanies.length === 61, 'the launch-category slice contains 61 records');
check(launchCompanies.every(company => company.ar && company.ar_d && arabic.test(company.ar) && arabic.test(company.ar_d)),
  'all 61 launch companies have Arabic names and descriptions');
check(launchCompanies.every(company => company.en && company.fa && company.en_d && company.fa_d),
  'existing English and Persian company data remains intact');
check(launchCompanies.every(company => !persianOnly.test(company.ar) && !persianOnly.test(company.ar_d)),
  'Arabic company translations contain no Persian-only letters');
check(propulsionCompanies.length === 44 && propulsionCompanies.every(company => company.ar && company.ar_d),
  'the completed propulsion-category Arabic slice remains present');
check(agencyCompanies.length === 33 && agencyCompanies.every(company => company.ar && company.ar_d),
  'the completed agency-category Arabic slice remains present');
check(satelliteMakers.length === 26 && satelliteMakers.every(company => company.ar && company.ar_d),
  'the separate satellite-manufacturer Arabic slice is complete');
check(app.includes('if (LANG === "ar" && (p.cat === "launch" || p.kind === "launch" || o.cat === "launch")) return renderLaunchCompanyArabic(p);'),
  'the real Arabic launch route dispatches to its dedicated renderer');
check(app.includes('نظرة عامة وإحصاءات') && app.includes('أسطول مركبات الإطلاق') &&
  app.includes('التاريخ والشبكة') && app.includes('المدار المتزامن مع الشمس (SSO)'),
  'launch-profile tabs and technical labels are Arabic');
check(app.includes('safeEnglish(value, fallback)') && app.includes('missionLabel(value)') &&
  app.includes('techValue(value, kind)'),
  'source values pass through Arabic-safe display helpers');
check(html.includes('window.ORBITA_V = "20261030country08";'), 'the HTML asset cache version is bumped for the Arabic template');

// Guard the shared bilingual renderer so this Arabic-only task cannot change Persian or English output.
const companyDetailStart = app.indexOf('  function renderCompanyDetail(p) {');
const countryMarker = app.indexOf('  /* ================= COUNTRY PROFILE SYSTEM ================= */', companyDetailStart);
const sharedRenderer = app.slice(companyDetailStart, countryMarker);
const sharedRendererHash = crypto.createHash('sha256').update(sharedRenderer).digest('hex');
check(sharedRendererHash === '8184c83f7450b75cc1068f60727654a4ecffb58c37b5e995b1c0c2fbe2ed0c82',
  'the shared Persian/English company renderer is unchanged');

function makeRenderer(lang) {
  const launchStart = app.indexOf('  function renderLaunchCompanyArabic(p) {');
  const sourceStart = lang === 'ar' ? launchStart : companyDetailStart;
  if (sourceStart < 0 || countryMarker <= sourceStart) return null;
  const context = {
    LANG: lang,
    DATA: { sites },
    window: { findEngineSuppliers: () => [] },
    name: company => lang === 'ar' ? (company.ar || company.en || company.fa || '') : (company.fa || company.en || ''),
    desc: company => lang === 'ar' ? (company.ar_d || company.en_d || '') : (company.fa_d || company.en_d || ''),
    esc: value => String(value == null ? '' : value).replace(/[&<>\"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[char])),
    t: key => ({ country: lang === 'ar' ? 'الدولة' : 'کشور' }[key] || key),
    cell: (label, value) => value ? '<div class="cell"><small>' + String(label) + '</small><b>' + String(value) + '</b></div>' : '',
    countryNameAr: () => null,
    extractEntityLinks: item => ({
      webUrl: item.site || null,
      displayWeb: item.site ? item.site.replace(/^https?:\/\//, '') : null,
      linkedinUrl: item.linkedin_url || item.linkedin || null,
      displayLinkedin: 'LinkedIn'
    })
  };
  try {
    return vm.runInNewContext(app.slice(sourceStart, countryMarker) + '\nrenderCompanyDetail;', context);
  } catch (error) {
    console.error(`${lang} company renderer error:`, error);
    return null;
  }
}

const arabicRenderer = makeRenderer('ar');
const persianRenderer = makeRenderer('fa');
let rendered = '';
if (arabicRenderer) rendered = launchCompanies.map(company => arabicRenderer({ o: company, cat: 'launch' })).join(' ');
const visible = rendered.replace(/<[^>]*>/g, ' ').replace(/&(?:amp|lt|gt|quot);/g, ' ');
check(Boolean(arabicRenderer) && launchCompanies.every(company => rendered.includes(company.ar)),
  'the actual Arabic display route renders every translated launch-company name');
check(!persianOnly.test(visible), 'rendered Arabic launch-company profiles do not leak Persian-only letters');
check(rendered.includes('SpaceX') && rendered.includes('AIO') && rendered.includes('Falcon 9'),
  'official Latin company and vehicle names remain available as secondary text');

function tabIds(markup) {
  return [...markup.matchAll(/onclick="switchCompTab\('([^']+)'/g)].map(match => match[1]);
}
check(Boolean(arabicRenderer) && Boolean(persianRenderer) &&
  JSON.stringify(tabIds(arabicRenderer({ o: launchCompanies[0], cat: 'launch' }))) === JSON.stringify(['overview', 'vehicles', 'timeline']) &&
  JSON.stringify(tabIds(persianRenderer({ o: launchCompanies[0], cat: 'launch' }))) === JSON.stringify(['overview', 'vehicles', 'timeline']),
  'Arabic and Persian launch profiles expose the same three tabs in the same order');

function structuralSignature(markup) {
  const tags = markup.match(/<\/?[a-zA-Z][^>]*>/g) || [];
  return tags.map(token => {
    const closing = /^<\//.test(token);
    const tag = token.match(/^<\/?([a-zA-Z][\w:-]*)/)[1].toLowerCase();
    if (closing) return `/${tag}`;
    const stable = ['class', 'id', 'style', 'type'].map(attribute => {
      const match = token.match(new RegExp('(?:^|\\s)' + attribute + '="([^"]*)"'));
      return match ? `${attribute}=${match[1].replace(/\s+/g, ' ').trim()}` : '';
    }).filter(Boolean);
    return `<${tag}${stable.length ? ' ' + stable.join(' ') : ''}>`;
  }).join('');
}
function unique(values) {
  return [...new Set(Array.isArray(values) ? values : [])];
}
function alignPersianTemplateData(company) {
  return {
    ...company,
    mission_types_fa: unique(company.mission_types_en),
    orbital_capabilities_fa: unique(company.orbital_capabilities_en),
    timeline_fa: company.timeline_en || company.timeline_fa || [],
    customers_fa: company.customers_en || company.customers_fa || [],
    partners_fa: company.partners_en || company.partners_fa || []
  };
}
let structuralParity = Boolean(arabicRenderer && persianRenderer);
let parityFailure = '';
if (structuralParity) {
  for (const company of launchCompanies) {
    const aligned = alignPersianTemplateData(company);
    const arHtml = arabicRenderer({ o: aligned, cat: 'launch' });
    const faHtml = persianRenderer({ o: aligned, cat: 'launch' });
    if (structuralSignature(arHtml) !== structuralSignature(faHtml)) {
      structuralParity = false;
      parityFailure = company.id;
      break;
    }
  }
}
if (!structuralParity) console.error('First Arabic/Persian DOM-shape mismatch:', parityFailure || '(renderer unavailable)');
check(structuralParity,
  'Arabic and Persian launch dossiers have the same DOM structure and layout across all 61 records');

if (arabicRenderer) {
  const spacex = launchCompanies.find(company => company.id === 'spacex');
  const spacexHtml = spacex ? arabicRenderer({ o: spacex, cat: 'launch' }) : '';
  check((spacexHtml.match(/مهام فضائية مدارية/g) || []).length === 1,
    'duplicate mission labels remain deduplicated in Arabic dossiers');
  const englishUiLabels = [
    'Historical Timeline', 'Primary Customers', 'Industrial Partners & Propulsion Suppliers',
    'Performance Statistics', 'Annual Launch Trend', 'Mission Types & Orbit Capabilities',
    'Operational Launch Sites', 'Fly to Location', 'Detailed Rockets Fleet Specifications',
    'Success Rate', 'Last Flight'
  ];
  check(englishUiLabels.every(label => !rendered.includes(label)),
    'English interface headings do not leak into Arabic launch dossiers');
}

if (arabicRenderer) {
  const synthetic = {
    ...launchCompanies[0],
    country: 'فارسی', city: 'شهر فارسی', founder_en: 'نام فارسی', ceo_en: 'مدیر فارسی',
    mission_types_en: ['مأموریت فارسی'], orbital_capabilities_en: ['زیرمداری زیستی'],
    timeline_en: [{ year: 2024, title: 'عنوان فارسی', desc: 'شرح فارسی' }],
    rockets_fleet: [{ name: 'Qased (قاصد)', status_en: 'Operational', stages: 1,
      propellant_en: 'LOX / Methane', engine_type_en: 'Engine  (فارسی)', thrust_en: '100 kN',
      payload_leo_en: '50 kg', payload_sso_en: '—', payload_gto_en: 'Not applicable', height_en: '10 m',
      diameter_en: '2 m', mass_en: '100 kg', total_launches: 2, success_launches: 2, failed_launches: 0 }]
  };
  try {
    const simulated = arabicRenderer({ o: synthetic, cat: 'launch' }).replace(/<[^>]*>/g, ' ');
    check(!persianOnly.test(simulated) && simulated.includes('الفضاء السحيق') === false &&
      simulated.includes('رحلات شبه مدارية لأغراض بيولوجية'),
      'Persian-only fallback values are suppressed while mapped orbital terms stay Arabic');
  } catch (error) {
    console.error('Synthetic Arabic fallback test error:', error);
    check(false, 'Persian-only fallback values are suppressed while mapped orbital terms stay Arabic');
  }
}

console.log(`${passed} PASS / ${failed} FAIL`);
process.exitCode = failed ? 1 : 0;
