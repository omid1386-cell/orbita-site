// Regression tests for the Arabic propulsion-company dossier slice.
// Run with: node tests/company_propulsion_ar.test.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const companies = JSON.parse(fs.readFileSync(path.join(root, 'data/companies.json'), 'utf8'));
const propulsion = companies.filter(company => company.cat === 'propulsion');
const agencies = companies.filter(company => company.cat === 'agency');
const satelliteMakers = companies.filter(company => company.cat === 'satmaker');
const launch = companies.filter(company => company.cat === 'launch');
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

function hasArabic(value) {
  return typeof value === 'string' && arabic.test(value) && !persianOnly.test(value);
}

function decodeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function normalizeDigits(value) {
  return String(value == null ? '' : value)
    .replace(/[۰-۹]/g, digit => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)])
    .replace(/[٠-٩]/g, digit => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(digit)])
    .replace(/٪/g, '%');
}

function rawEnglishNarratives(company) {
  const items = [];
  for (const key of ['history_en', 'product_history_en', 'flagship_application_en']) {
    if (company[key]) items.push(company[key]);
  }
  for (const key of ['future_plans_en', 'notable_missions_en']) {
    items.push(...(company[key] || []));
  }
  for (const engine of company.engine_products_bilingual || []) {
    for (const key of ['rocket_en', 'engineering_desc_en']) {
      if (engine[key]) items.push(engine[key]);
    }
  }
  for (const test of company.test_history_en || []) {
    const title = test.title_en || test.title;
    const detail = test.desc_en || test.desc;
    if (title) items.push(title);
    if (detail) items.push(detail);
  }
  return items;
}

check(propulsion.length === 44, 'the propulsion-category slice contains 44 retained records');
const companyById = Object.fromEntries(companies.map(company => [company.id, company]));
const refreshedAuditIds = [
  'safran-vernon', 'paleblue', 'spaceforest', 'phasefour', 'accion', 'okb-fakel',
  'blueorigin-engine', 'spacex-engine', 'relativity-engine', 'enpulsion', 'bradford-ecaps'
];
const targetProduct = (id, name) => (companyById[id].engine_products_bilingual || [])
  .find(engine => engine.name_en === name);
const targetEvent = (id, year) => (companyById[id].test_history_en || [])
  .find(event => event.year === String(year));
check(refreshedAuditIds.length === 11 && refreshedAuditIds.every(id => companyById[id] && companyById[id].cat === 'propulsion'),
  'the refreshed audit slice contains exactly the 11 requested propulsion records');
const vinci = targetProduct('safran-vernon', 'Vinci');
check(companyById['safran-vernon'].founded === 2015 && /Lampoldshausen/.test(vinci.engineering_desc_en) &&
  /Bremen/.test(vinci.rocket_en) && /Lampoldshausen/.test(companyById['safran-vernon'].test_history_en.find(event => event.year === '2025').desc),
  'Vernon and Vinci distinguish ArianeGroup founding from the 2025 final-assembly transfer');
const kirx = targetEvent('paleblue', '2026');
check(companyById.paleblue.flagship_status_en === 'Flight-proven' && kirx &&
  /water ion thruster/.test(kirx.desc) && /water resistojet/.test(kirx.desc) && /RAISE-4/.test(kirx.desc),
  'Pale Blue records the reported in-orbit operation of both KIR-X propulsion types');
const perunFlight4 = targetEvent('spaceforest', '2026');
check(companyById.spaceforest.linkedin === 'https://www.linkedin.com/company/spaceforest/' &&
  companyById.spaceforest.flagship_status_en === 'In Development & Testing' && perunFlight4 &&
  /flight[- ]termination/.test(perunFlight4.desc) && /recovered within the test-range/.test(perunFlight4.desc) &&
  /not establish commercial service or reflight/.test(perunFlight4.desc),
  'SpaceForest Flight 4 remains a test milestone, not evidence of commercial service or reuse');
check(companyById.phasefour.flagship_status_en === 'Historical' &&
  /Apex acquired/.test(companyById.phasefour.history_en) && /Quantum Space acquired/.test(companyById.phasefour.history_en) &&
  /do not show that the legal entity dissolved/.test(companyById.phasefour.history_en),
  'Phase Four asset transfers are recorded without inferring legal dissolution');
check(companyById.accion.en.includes('Revolution Space') && companyById.accion.en.includes('formerly Accion Systems') &&
  companyById.accion.site === 'https://revolutionspace.com/' &&
  companyById.accion.linkedin === 'https://www.linkedin.com/company/revolution-space/',
  'the Accion legacy record uses Revolution Space as its current public-facing brand');
const spt100 = targetProduct('okb-fakel', 'SPT-100');
const spt100b = targetProduct('okb-fakel', 'SPT-100B');
check(/80 mN/.test(spt100.thrust_en) && !/83 mN/.test(spt100.thrust_en) &&
  /83 mN/.test(spt100b.thrust_en) && /1.35 kW/.test(spt100b.thrust_en) &&
  /1,600 s/.test(spt100b.thrust_en) && /SPT-100B/.test(spt100b.rocket_en),
  'OKB Fakel ties 83 mN to the SPT-100B variant and its stated operating point');
const be4 = targetProduct('blueorigin-engine', 'BE-4');
const be3u = targetProduct('blueorigin-engine', 'BE-3U');
check(/640,000 lbf/.test(be4.thrust_en) && /220,000 lbf/.test(be4.thrust_en) &&
  /200,000 lbf/.test(be3u.thrust_en) && /100,000 lbf/.test(be3u.thrust_en),
  'Blue Origin BE-4 and BE-3U use the current manufacturer thrust and throttle ratings');
const raptor3 = targetProduct('spacex-engine', 'Raptor 3');
const flight14 = targetEvent('spacex-engine', '2026');
check(/250 tf/.test(raptor3.thrust_en) && /275 tf/.test(raptor3.thrust_en) && flight14 &&
  /first time/.test(flight14.desc) && /26 Starlink V3/.test(flight14.desc),
  'SpaceX separates Raptor 3 sea-level/vacuum thrust and records confirmed Flight 14 deployment');
const aeonR = targetProduct('relativity-engine', 'Aeon R');
const aeonV = targetProduct('relativity-engine', 'Aeon V');
const relativityUpdate = targetEvent('relativity-engine', '2026');
check(/269,000 lbf/.test(aeonR.thrust_en) && /sea-level/.test(aeonR.thrust_en) &&
  /323,000 lbf/.test(aeonV.thrust_en) && /vacuum/.test(aeonV.thrust_en) &&
  /acceptance testing/.test(relativityUpdate.desc) && /still undergoing inspection/.test(relativityUpdate.desc),
  'Relativity distinguishes Aeon R sea-level rating, Aeon V vacuum rating, and testing status');
const nexus = targetProduct('enpulsion', 'Nexus');
check(nexus.status_en === 'Product listed; flight status not stated' &&
  /4,500 s/.test(nexus.engineering_desc_en) && /no thrust rating or flight heritage is stated/.test(nexus.engineering_desc_en) &&
  /320 propulsion systems/.test(companyById.enpulsion.en_d) && /500 cumulative operational flight-years/.test(companyById.enpulsion.en_d),
  'ENPULSION separates Nexus specifications, unstated flight status, and cumulative on-orbit service');
const hpgp1 = targetProduct('bradford-ecaps', '1N HPGP');
const hpgp22 = targetProduct('bradford-ecaps', '22N HPGP');
check(/TRL 9/.test(hpgp1.engineering_desc_en) && /TRL 5\/6/.test(hpgp22.engineering_desc_en) &&
  hpgp22.status_en !== 'Qualified',
  'Bradford/ECAPS distinguishes the flight-mature 1 N product from the 22 N TRL 5/6 product');
const canonicalSourceStart = app.indexOf('  function canonicalCompanyRecords() {');
const canonicalSourceEnd = app.indexOf('  function allPoints() {', canonicalSourceStart);
const canonicalSource = canonicalSourceStart >= 0 && canonicalSourceEnd > canonicalSourceStart
  ? app.slice(canonicalSourceStart, canonicalSourceEnd) : '';
const allPointsStart = app.indexOf('  function allPoints() {');
const filteredPointsStart = app.indexOf('  function filteredPoints() {', allPointsStart);
const allPointsSource = allPointsStart >= 0 && filteredPointsStart > allPointsStart
  ? app.slice(allPointsStart, filteredPointsStart) : '';
const layerBarStart = app.indexOf('  function buildLayerBar() {');
const layerBarSource = layerBarStart >= 0 ? app.slice(layerBarStart, layerBarStart + 2800) : '';
let canonicalRecords = [];
try {
  const canonicalFn = vm.runInNewContext(canonicalSource + '\ncanonicalCompanyRecords;', { DATA: { companies } });
  canonicalRecords = canonicalFn();
} catch (error) {
  console.error('Canonical-company aggregation error:', error);
}
check(companyById['casc-6th'].alias_of_id === 'aalpt-china' &&
  companyById['aalpt-china'] && canonicalRecords.length === companies.length - 1 &&
  !canonicalRecords.some(company => company.id === 'casc-6th') &&
  canonicalRecords.some(company => company.id === 'aalpt-china') &&
  allPointsSource.includes('canonicalCompanyRecords().forEach') &&
  layerBarSource.includes('var companies = canonicalCompanyRecords();'),
  'CASC/AALPT remains as linked records but contributes one organization count and map point');
const ng = companyById.ngpropulsion;
const ngGem = ng.engine_products_bilingual.find(engine => engine.name_en === 'GEM 63 / GEM 63XL');
const castor = ng.engine_products_bilingual.find(engine => engine.name_en === 'Castor 30XL');
const impulse = companyById.impulse;
const saiph = impulse.engine_products_bilingual.find(engine => engine.name_en === 'Saiph');
const rigel = impulse.engine_products_bilingual.find(engine => engine.name_en === 'Rigel');
check(ngGem.thrust_en.includes('370,835 lbf') && ngGem.thrust_en.includes('463,249 lbf') &&
  castor.thrust_en.includes('119,900 lbf maximum') && castor.thrust_en.includes('104,350 lbf burn-time average') &&
  /26 N per Saiph/.test(saiph.thrust_en) && /208 N total/.test(saiph.thrust_en) &&
  Boolean(rigel && rigel.thrust_en.includes('200 lbf-class')),
  'GEM/CASTOR ratings are model- and metric-specific; Saiph is per thruster and Rigel is present');
const agile = companyById.agile.engine_products_bilingual.find(engine => engine.name_en === 'A2200');
const benchmark = companyById.benchmark.engine_products_bilingual;
const halcyon = benchmark.find(engine => engine.name_en === 'Halcyon (Monopropellant)');
const avant = benchmark.find(engine => engine.name_en === 'Halcyon Avant (Bipropellant)');
const moog5 = companyById.moog.engine_products_bilingual.find(engine => engine.name_en === 'MONARC-5');
const nucleus = companyById.nammo.engine_products_bilingual.find(engine => engine.name_en === 'Nucleus Hybrid Motor');
const micro = companyById.exotrail.engine_products_bilingual.find(engine => engine.name_en === 'spaceware micro');
check(agile.thrust_en === '2,200 N (500 lbf)' && /VoidRunner/.test(agile.rocket_en) &&
  halcyon.thrust_en.startsWith('1–10 N') && halcyon.propellant_en === 'High-test peroxide (HTP)' &&
  avant.thrust_en.includes('20 N') && avant.thrust_en.includes('22 N') &&
  moog5.thrust_en === '5 N' && nucleus.propellant_en === '87.5% H2O2 / HTPB' &&
  micro.thrust_en === 'Up to 7 mN' && micro.thrust_fa === 'تا ۷ میلی‌نیوتن' &&
  micro.thrust_ar === 'حتى 7 mN',
  'A2200, Halcyon variants, MONARC-5, Nucleus and spaceware Micro use their corrected specifications');
check(companyById['dawn-aerospace'].linkedin === 'https://www.linkedin.com/company/dawnaerospace/' &&
  companyById['lpsc-isro'].products[0].startsWith('Vikas storable liquid') &&
  companyById['lpsc-isro'].future_plans_fa[0].includes('CE-20') &&
  !companyById['lpsc-isro'].future_plans_fa[0].includes('متانی') &&
  companyById['lpsc-isro'].engine_products_bilingual.find(engine => engine.name_en === 'Vikas').engineering_desc_en.includes('not a cryogenic engine'),
  'Dawn link is corrected and LPSC Vikas/future-plan translations are aligned');
const yf77 = companyById['aalpt-china'].engine_products_bilingual.find(engine => engine.name_en === 'YF-77');
const go2 = companyById['morpheus-space'].engine_products_bilingual.find(engine => engine.name_en === 'GO-2');
check(yf77.thrust_en.includes('510 kN at sea level') && yf77.thrust_en.includes('700 kN in vacuum') &&
  go2.thrust_en === '5–400 µN total system thrust' && go2.propellant_en.includes('exact metal not publicly specified'),
  'YF-77 operating conditions and GO-2 micro-newton/metal-propellant qualifications are explicit');
check(companyById['avio-aero'].founded === 2013 && companyById['avio-aero'].history_en.includes('1908') &&
  companyById['avio-aero'].org_type_en.includes('Aviation') &&
  companyById['dlr-lampoldshausen'].org_type_en.includes('public aerospace research') &&
  companyById['dlr-lampoldshausen'].test_history_en.some(test => test.year === '2025' && /Vinci final assembly/.test(test.title)),
  'Avio Aero heritage and DLR test-center/Vinci responsibilities are distinguished');
check(companyById['nasa-stennis'].engine_products_bilingual.find(engine => engine.name_en === 'B-2 Stand').thrust_en.includes('3,000,000 lbf') &&
  companyById['nasa-stennis'].engine_products_bilingual.find(engine => engine.name_en.includes('Fred Haise')).thrust_en.includes('650,000 lbf') &&
  companyById['airborne-eng'].founded === 2001 && companyById['airborne-eng'].history_en.includes('2009') &&
  companyById['airborne-eng'].engine_products_bilingual[0].engineering_desc_en.includes('not an AEL engine rating'),
  'Stennis stand capacities and Airborne company/test-bay capacities are not assigned to engines');
check(companyById['nasa-wstf'].history_en.includes('selected the White Sands site in 1962') &&
  companyById['nasa-wstf'].history_en.includes('first test firing took place in 1964') &&
  companyById['nasa-wstf'].history_en.includes('name was established in 1965') &&
  companyById['lpsc-test'].en.startsWith('ISRO Propulsion Complex (IPRC)'),
  'WSTF milestones and the Mahendragiri IPRC name are corrected');
check(companyById.ihi.en_d.includes('zero, two or four') &&
  companyById.ihi.engine_products_bilingual.find(engine => engine.name_en === 'BT-4 Thruster').propellant_en === 'Hydrazine / N2O4 (NTO)' &&
  companyById['aio-propulsion'].engine_products_bilingual.find(engine => engine.name_en.startsWith('Simorgh')).propellant_en === 'UDMH / N2O4' &&
  companyById['aio-propulsion'].engine_products_bilingual.find(engine => engine.name_en.startsWith('Salman')).name_en.includes('not an AIO product') &&
  companyById['aio-propulsion'].engine_products_bilingual.find(engine => engine.name_en.startsWith('Salman')).thrust_en.includes('No independently verified'),
  'IHI H3/BT-4 variants and cautious AIO/Simorgh/Salman attribution are retained');
const rocketdyne = propulsion.find(company => company.id === 'rocketdyne');
const l3harris = propulsion.find(company => company.id === 'l3harris');
check(Boolean(rocketdyne && l3harris) && rocketdyne.en === 'Rocketdyne' &&
  l3harris.en.startsWith('L3Harris Technologies') && rocketdyne.site === 'https://rocketdyne.com/' &&
  l3harris.site === 'https://www.l3harris.com/',
  'current Rocketdyne and L3Harris identities, records, and official websites are separate');
check(rocketdyne.founded === 2026 && l3harris.founded === 2019 &&
  rocketdyne.city === 'Jupiter, Florida' && l3harris.city === 'Melbourne, Florida' &&
  rocketdyne.location_en.includes('city-level map pin') && l3harris.location_en.includes('city-level map pin') &&
  l3harris.lat === 28.0785034 && l3harris.lon === -80.6077908,
  'founding dates, headquarters, and city-level map pins distinguish Rocketdyne from L3Harris');
const rl10 = rocketdyne && rocketdyne.engine_products_bilingual[0];
const rs25 = l3harris && l3harris.engine_products_bilingual[0];
check(Boolean(rl10 && rs25) && rl10.name_en.includes('RL10') &&
  rl10.thrust_en.includes('RL10C-1-1') && rl10.thrust_en.includes('RL10E-1') &&
  rl10.thrust_en.includes('RL10B-2/RL10C-2') &&
  !rocketdyne.engine_products_bilingual.some(engine => /RS-25/.test(engine.name_en)) &&
  /RS-25/.test(rs25.name_en) && rs25.engineering_desc_en.includes('per engine'),
  'RL10 model-specific specifications belong to Rocketdyne and per-engine RS-25 data belongs to L3Harris');
const rs25Tests = l3harris ? l3harris.test_history_en : [];
check(rs25Tests.some(test => test.year === '2021' && /0528/.test(test.title_en) &&
  /not a new-production engine/.test(test.desc_en)) &&
  rs25Tests.some(test => test.year === '2025' && /20001/.test(test.title_en)) &&
  rocketdyne.test_history_en.length === 0,
  'the 2021 developmental RS-25 test is distinguished from the 2025 new-production test');
check(propulsion.every(company => company.ar && company.ar_d && arabic.test(company.ar) && arabic.test(company.ar_d)),
  'all propulsion profiles retain their Arabic names and descriptions');
check(propulsion.every(company => company.en && company.fa && company.en_d && company.fa_d),
  'existing English and Persian company data remains intact');
check(propulsion.every(company => !persianOnly.test(company.ar) && !persianOnly.test(company.ar_d)),
  'Arabic propulsion profile text contains no Persian-only letters');
check(agencies.length === 33 && agencies.every(company => company.ar && company.ar_d),
  'the completed agency slice is present without changing propulsion profiles');
check(satelliteMakers.length === 26 && satelliteMakers.every(company => company.ar && company.ar_d),
  'the separate satellite-manufacturer Arabic slice is complete');
check(launch.length === 61 && launch.every(company => company.ar && company.ar_d),
  'the completed launch-company Arabic slice remains intact');
check(app.includes('function propulsionArabicLocale(p) {') &&
  app.includes('function renderPropulsionCompanyArabic(p) {\n    return renderPropulsionDetail(p);'),
  'the former Arabic-only renderer now delegates to the shared propulsion template');
const sharedCompanyRoute = app.indexOf('if (LANG === "ar" && (p.cat === "propulsion"');
check(sharedCompanyRoute >= 0 && app.slice(sharedCompanyRoute, sharedCompanyRoute + 220).includes('return renderPropulsionDetail(p);'),
  'the company detail renderer uses the shared Persian-template structure in Arabic');

const openDetailStart = app.indexOf('  function openDetail(p) {');
const openDetailEnd = app.indexOf('  on("#detailClose"', openDetailStart);
const openDetailSource = openDetailStart >= 0 && openDetailEnd > openDetailStart
  ? app.slice(openDetailStart, openDetailEnd) : '';
check(openDetailSource.includes('if (cat === "propulsion" || (p.o && p.o.cat === "propulsion"))') &&
  openDetailSource.includes('innerHTML = renderPropulsionDetail(p);') &&
  !openDetailSource.includes('renderPropulsionCompanyArabic(p)'),
  'the production click route uses the same template for all propulsion-company languages');

const localeHelperStart = app.indexOf('  function propulsionArabicLocale(p) {');
const localeHelperEnd = app.indexOf('  function renderPropulsionCompanyArabic(p) {', localeHelperStart);
const rendererStart = app.indexOf('  function renderPropulsionDetail(p) {');
const rendererEnd = app.indexOf('  /* ================= landing & recovery', rendererStart);
const localeHelperSource = localeHelperStart >= 0 && localeHelperEnd > localeHelperStart
  ? app.slice(localeHelperStart, localeHelperEnd) : '';
const rendererSource = rendererStart >= 0 && rendererEnd > rendererStart
  ? app.slice(rendererStart, rendererEnd) : '';
const rendererBundle = localeHelperSource + '\n' + rendererSource;

function testEscape(value) {
  return String(value == null ? '' : value).replace(/[&<>\"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;'
  }[character]));
}
function makeRenderer(language) {
  const context = {
    LANG: language,
    window: { compById: () => null },
    t: key => key === 'cat_propulsion'
      ? (language === 'fa' ? 'پیشرانه‌های فضایی' : 'Space Propulsion')
      : key === 'country' ? (language === 'fa' ? 'کشور' : 'Country') : key,
    name: company => language === 'fa' ? (company.fa || company.en || '') : (company.en || company.fa || ''),
    desc: company => language === 'fa' ? (company.fa_d || company.en_d || '') : (company.en_d || company.fa_d || ''),
    esc: testEscape,
    cell: (label, value, ltr) => value
      ? '<div class="cell' + (ltr ? ' ltr' : '') + '"><small>' + testEscape(label) + '</small><b>' + testEscape(value) + '</b></div>'
      : '',
    iconFor: () => '<svg width="34" height="44" viewBox="0 0 34 44"></svg>',
    extractEntityLinks: () => ({ webUrl: null, displayWeb: null, linkedinUrl: null, displayLinkedin: null }),
    countryNameAr: value => ({ 'United States': 'الولايات المتحدة', Japan: 'اليابان', Iran: 'إيران' }[value] || null)
  };
  const renderer = vm.runInNewContext(rendererBundle + '\nrenderPropulsionDetail;', context);
  return { renderer, context };
}
function exerciseOpenDetail(language, company) {
  const detailBody = {};
  const detailPanel = { setAttribute() {}, classList: { add() {} } };
  const { renderer } = makeRenderer(language);
  const liveOpenDetail = vm.runInNewContext(openDetailSource + '\nopenDetail;', {
    LANG: language,
    document: { getElementById: () => detailPanel },
    $: selector => selector === '#detailBody' ? detailBody : detailPanel,
    renderPropulsionDetail: renderer
  });
  liveOpenDetail({ cat: 'propulsion', kind: 'propulsion', o: company });
  return detailBody.innerHTML;
}
try {
  const routeArabic = exerciseOpenDetail('ar', propulsion[0]);
  const routePersian = exerciseOpenDetail('fa', propulsion[0]);
  const routeEnglish = exerciseOpenDetail('en', propulsion[0]);
  check(routeArabic.includes(propulsion[0].ar) && routeArabic.includes('نظرة عامة والهندسة المعمارية') &&
    routeArabic.includes('المحركات وربط المهام') && routeArabic.includes('سجل الاختبارات وخارطة الطريق'),
    'the real openDetail path renders Arabic content inside the shared Persian template');
  check(routePersian.includes(propulsion[0].fa) && routePersian.includes('شناسنامه و معماری') &&
    routeEnglish.includes(propulsion[0].en) && routeEnglish.includes('Overview & Architecture'),
    'the existing Persian and English versions still use their original localized template text');
} catch (error) {
  console.error('Live openDetail route error:', error);
  check(false, 'the actual openDetail route renders the shared template in all three languages');
}
check(html.includes('window.ORBITA_V = "20261030country05";'),
  'HTML asset cache version is bumped for the shared Arabic propulsion template');

const requiredCompanyFields = [
  'city_ar', 'flagship_engine_ar', 'flagship_application_ar', 'history_ar', 'product_history_ar'
];
check(propulsion.every(company => requiredCompanyFields.every(key => hasArabic(company[key]))),
  'all 44 profiles have Arabic location, flagship, application, and history fields');
check(propulsion.every(company => ['future_plans_en', 'notable_missions_en'].every(sourceKey => {
  const arabicKey = sourceKey.replace(/_en$/, '_ar');
  const source = company[sourceKey] || [];
  const translated = company[arabicKey] || [];
  return source.length === translated.length && translated.every(hasArabic);
})), 'all future-plan and notable-mission entries are localized in Arabic');

const products = propulsion.flatMap(company => company.engine_products_bilingual || []);
const tests = propulsion.flatMap(company => company.test_history_en || []);
check(products.length === 93 && products.every(engine => hasArabic(engine.name_ar)),
  'all 93 engine-product names have an Arabic primary name after adding three current product rows');
check(products.every(engine => !engine.rocket_en || hasArabic(engine.rocket_ar)),
  'all displayed product applications have Arabic text');
check(products.every(engine => !engine.engineering_desc_en || hasArabic(engine.engineering_desc_ar)),
  'all displayed product engineering descriptions have Arabic text');
check(products.every(engine => !engine.thrust_en || !engine.thrust_ar ||
  hasArabic(engine.thrust_ar) || !/[A-Za-z]{4,}/.test(engine.thrust_ar)),
  'thrust values are Arabic or remain technical quantities without English prose');
check(tests.length === 99 && tests.every(test => hasArabic(test.title_ar) && hasArabic(test.desc_ar)),
  'all 99 test-history titles and descriptions have Arabic translations');
check(propulsion.every(company => company.engine_products_bilingual.every(engine =>
  engine.name_en && engine.type_en && engine.status_en && engine.rocket_en !== undefined &&
  engine.engineering_desc_en !== undefined)),
  'English technical product fields are preserved alongside Arabic translations');

let renderer;
let rendered = '';
const renderedByCompany = new Map();
let arabicMaps = null;
try {
  const setup = makeRenderer('ar');
  renderer = setup.renderer;
  for (const company of propulsion) {
    renderedByCompany.set(company.id, renderer({ o: company, cat: 'propulsion' }));
  }
  rendered = [...renderedByCompany.values()].join(' ');
  const helperContext = {
    LANG: 'ar', window: {},
    countryNameAr: value => ({ 'United States': 'الولايات المتحدة', Japan: 'اليابان', Iran: 'إيران' }[value] || null)
  };
  const getArabicLocale = vm.runInNewContext(localeHelperSource + '\npropulsionArabicLocale;', helperContext);
  arabicMaps = getArabicLocale({ o: propulsion[0] }).maps;
} catch (error) {
  console.error('Shared propulsion renderer error:', error);
}
const visible = decodeHtml(rendered.replace(/<[^>]*>/g, ' '));
check(Boolean(renderer) && propulsion.every(company => renderedByCompany.get(company.id) && renderedByCompany.get(company.id).includes(company.ar)),
  'the shared Persian-template renderer executes in Arabic for all 44 profiles');
check(!persianOnly.test(visible), 'rendered propulsion dossiers do not leak Persian-only letters');
check(rendered.includes('المادة الدافعة') && rendered.includes('سجلات اختبارات الإشعال الأرضي') &&
  rendered.includes('تاريخ الشركة وتطوير أنظمة الدفع') && rendered.includes('خطط تطوير قدرات الدفع'),
  'the shared template presents Arabic product, testing, history, and roadmap sections');
check(rendered.includes('نظرة عامة والهندسة المعمارية') && rendered.includes('المحركات وربط المهام') &&
  rendered.includes('سجل الاختبارات وخارطة الطريق') &&
  rendered.indexOf('id="compTabOverview"') < rendered.indexOf('id="compTabEngines"') &&
  rendered.indexOf('id="compTabEngines"') < rendered.indexOf('id="compTabTesting"'),
  'Arabic keeps the Persian template’s three-tab order and hierarchy');
check(propulsion.every(company => {
  const htmlForCompany = decodeHtml((renderedByCompany.get(company.id) || '').replace(/<[^>]*>/g, ' '));
  const values = [company.city_ar, company.flagship_engine_ar, company.flagship_application_ar,
    company.history_ar, company.product_history_ar,
    ...(company.future_plans_ar || []), ...(company.notable_missions_ar || []),
    ...(company.engine_products_bilingual || []).flatMap(engine => [
      engine.name_ar, engine.rocket_ar, engine.engineering_desc_ar
    ]),
    ...(company.test_history_en || []).flatMap(test => [test.title_ar, test.desc_ar])
  ].filter(value => typeof value === 'string' && value.trim());
  return values.every(value => htmlForCompany.includes(normalizeDigits(value)));
}), 'every translated propulsion field is still rendered in the shared template');

const rawNarratives = propulsion.flatMap(rawEnglishNarratives);
const longEnglishNarratives = rawNarratives.filter(value =>
  (String(value).match(/[A-Za-z]{3,}/g) || []).length >= 3
);
check(longEnglishNarratives.every(value => !visible.includes(value)),
  'English narrative source strings are not leaked into the Arabic dossier');
check(!visible.includes('LinkedIn') && !visible.includes('Spaceflight Operational Role') &&
  !visible.includes('Products Portfolio') && !visible.includes('Static Hot-Fire'),
  'English interface labels and unlocalized boilerplate are absent in Arabic');
check(rendered.includes('RS-25') && rendered.includes('CubeStar'),
  'official Latin technical identifiers remain available beside Arabic names when useful');

if (arabicMaps) {
  const productStatuses = products.map(engine => engine.status_en);
  const productTypes = products.map(engine => engine.type_en);
  const propellants = products.map(engine => engine.propellant_en);
  check(propulsion.every(company => arabicMaps.CATEGORY_AR[company.propulsion_category_en]),
    'all propulsion specialization labels have Arabic mappings');
  check(propulsion.every(company => arabicMaps.TYPE_AR[company.propulsion_type_en]),
    'all propulsion-system type labels have Arabic mappings');
  check(arabicMaps.CATEGORY_AR['Cryogenic & In-Space Propulsion'] &&
    arabicMaps.CATEGORY_AR['Liquid, Solid & Defense Propulsion'] &&
    arabicMaps.TYPE_AR['Cryogenic expander-cycle, monopropellant, bipropellant & electric propulsion'] &&
    arabicMaps.TYPE_AR['Staged-combustion liquid engines, solid motors & defense propulsion'],
    'new Rocketdyne and L3Harris propulsion labels are explicitly mapped to Arabic');
  check([...new Set(propulsion.map(company => company.flagship_status_en))].every(status => arabicMaps.STATUS_AR[status]),
    'all flagship statuses have Arabic mappings');
  check([...new Set(productStatuses)].every(status => arabicMaps.STATUS_AR[status]),
    'all propulsion-product statuses have Arabic mappings');
  check([...new Set(productTypes)].every(type => arabicMaps.PRODUCT_TYPE_AR[type]),
    'all engine-product type labels have Arabic mappings');
  check([...new Set(propellants)].filter(value => value !== '—').every(value => arabicMaps.PROPELLANT_AR[value]),
    'all named engine propellants have Arabic mappings');
}

function templateStructure(html) {
  return (html.match(/<\/?[a-z][^<>]*>/gi) || []).map(tag => {
    const name = (tag.match(/^<\/?([a-z][a-z0-9-]*)/i) || [,'?'])[1].toLowerCase();
    const closing = tag.startsWith('</') ? '/' : '';
    const id = (tag.match(/\bid="([^"]*)"/i) || [,''])[1];
    const classes = (tag.match(/\bclass="([^"]*)"/i) || [,''])[1];
    return closing + name + '#' + id + '.' + classes;
  }).join(' ');
}
const parityProfile = {
  ...propulsion[0],
  ar: 'اسم عربي نموذجي', ar_d: 'وصف عربي نموذجي موثق.',
  fa: 'نام فارسی نمونه', fa_d: 'شرح فارسی نمونه.',
  city_ar: 'مدينة نموذجية', city_fa: 'شهر نمونه',
  flagship_engine_ar: 'محرك نموذجي', flagship_engine_fa: 'موتور نمونه',
  flagship_application_ar: 'مركبة إطلاق نموذجية', flagship_application_fa: 'پرتابگر نمونه',
  history_ar: 'تاريخ الشركة باللغة العربية.', history_fa: 'تاریخچه فارسی شرکت.',
  product_history_ar: 'تطور المنتجات باللغة العربية.', product_history_fa: 'تاریخچه فارسی محصولات.',
  notable_missions_ar: ['مهمة فضائية نموذجية'], notable_missions_fa: ['ماموریت فضایی نمونه'],
  future_plans_ar: ['خطة تطوير نموذجية'], future_plans_fa: ['برنامه آینده نمونه'],
  test_history_en: [{ year: '2024', title_ar: 'اختبار محرك نموذجي', desc_ar: 'نجاح الاختبار التجريبي.',
    title_fa: 'آزمون موتور نمونه', desc_fa: 'آزمون با موفقیت انجام شد.', title_en: 'Sample engine test', desc_en: 'Test completed.' }],
  test_history_fa: [{ year: '2024', title_fa: 'آزمون موتور نمونه', desc_fa: 'آزمون با موفقیت انجام شد.' }],
  engine_products_bilingual: [{
    name_ar: 'محرك تجريبي', name_fa: 'موتور آزمایشی', name_en: 'Prototype Engine 1',
    type_en: 'Expander Cycle', type_fa: 'چرخه انبساط', status_en: 'Operational', status_fa: 'عملیاتی',
    propellant_en: 'LOX / Methane', propellant_fa: 'اکسیژن مایع / متان',
    thrust_ar: '80 kN', thrust_fa: '۸۰ کیلونیوتن', thrust_en: '80 kN', isp_ar: '320 s',
    rocket_ar: 'مركبة الإطلاق النموذجية', rocket_fa: 'پرتابگر نمونه',
    engineering_desc_ar: 'شرح عربي لدور المحرك.', engineering_desc_fa: 'شرح فارسی موتور.', used_by_ids: []
  }],
  products: [], website: null, site: null, linkedin: null, lat: null, lon: null
};
try {
  const htmlAr = makeRenderer('ar').renderer({ o: parityProfile, cat: 'propulsion' });
  const htmlFa = makeRenderer('fa').renderer({ o: parityProfile, cat: 'propulsion' });
  const structureAr = templateStructure(htmlAr).split(' ');
  const structureFa = templateStructure(htmlFa).split(' ');
  if (structureAr.join(' ') !== structureFa.join(' ')) {
    const max = Math.max(structureAr.length, structureFa.length);
    for (let i = 0; i < max; i++) {
      if (structureAr[i] !== structureFa[i]) {
        console.error('Template structure first difference at', i, 'AR:', structureAr[i], 'FA:', structureFa[i]);
        console.error('AR context:', structureAr.slice(Math.max(0, i - 5), i + 8).join(' '));
        console.error('FA context:', structureFa.slice(Math.max(0, i - 5), i + 8).join(' '));
        break;
      }
    }
  }
  check(structureAr.join(' ') === structureFa.join(' '),
    'Arabic and Persian use the same markup, classes, and section order');
} catch (error) {
  console.error('Template parity check error:', error);
  check(false, 'Arabic and Persian use the same markup, classes, and section order');
}

if (renderer) {
  const synthetic = {
    ...propulsion[0],
    ar: 'اسم فارسی', ar_d: 'شرح فارسی', en_d: 'English safe fallback فارسی',
    city_ar: 'مدينة فارسی', flagship_engine_ar: 'محرك فارسی', flagship_application_ar: 'کاربرد فارسی',
    engine_products_bilingual: [{
      name_en: 'Engine فارسی', name_ar: 'محرك فارسی', status_en: 'Operational',
      type_en: propulsion[0].engine_products_bilingual[0].type_en,
      propellant_en: propulsion[0].engine_products_bilingual[0].propellant_en,
      thrust_en: '120 N', thrust_ar: '١٢٠ kN', isp_en: null,
      rocket_en: 'Persian rocket', rocket_ar: 'موشک فارسی',
      engineering_desc_en: 'Persian detail', engineering_desc_ar: 'شرح فارسی'
    }],
    test_history_en: [{ year: '۲۰۲۰', title: 'عنوان فارسی', desc: 'شرح فارسی', title_ar: 'عنوان فارسی', desc_ar: 'شرح فارسی' }],
    history_en: 'Persian history', history_ar: 'تاریخچه فارسی',
    product_history_en: 'Persian product history', product_history_ar: 'محصول فارسی',
    future_plans_en: ['Persian plan'], future_plans_ar: ['برنامه فارسی'],
    notable_missions_en: ['Persian mission'], notable_missions_ar: ['ماموریت فارسی']
  };
  try {
    const syntheticHtml = renderer({ o: synthetic, cat: 'propulsion' });
    const syntheticVisible = decodeHtml(syntheticHtml.replace(/<[^>]*>/g, ' '));
    check(!persianOnly.test(syntheticVisible) && syntheticVisible.includes('120 kN'),
      'Persian-only fallbacks are suppressed and technical digits normalize to 0–9');
    check(!syntheticVisible.includes('English safe fallback') &&
      syntheticVisible.includes('لا يتوفر وصف عربي موثّق لهذه الجهة حالياً.') &&
      syntheticVisible.includes('محرك غير مسمى'),
      'missing Arabic translations use Arabic fallbacks rather than English or Persian text');
  } catch (error) {
    console.error('Synthetic Arabic fallback test error:', error);
    check(false, 'Persian-only fallback fields are suppressed and technical values are retained');
  }
}

console.log(`${passed} PASS / ${failed} FAIL`);
process.exitCode = failed ? 1 : 0;
