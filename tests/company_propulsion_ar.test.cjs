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

check(propulsion.length === 43, 'the propulsion-category slice contains 43 records');
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
check(html.includes('window.ORBITA_V = "20261025ar17";'),
  'HTML asset cache version is bumped for the shared Arabic propulsion template');

const requiredCompanyFields = [
  'city_ar', 'flagship_engine_ar', 'flagship_application_ar', 'history_ar', 'product_history_ar'
];
check(propulsion.every(company => requiredCompanyFields.every(key => hasArabic(company[key]))),
  'all 43 profiles have Arabic location, flagship, application, and history fields');
check(propulsion.every(company => ['future_plans_en', 'notable_missions_en'].every(sourceKey => {
  const arabicKey = sourceKey.replace(/_en$/, '_ar');
  const source = company[sourceKey] || [];
  const translated = company[arabicKey] || [];
  return source.length === translated.length && translated.every(hasArabic);
})), 'all future-plan and notable-mission entries are localized in Arabic');

const products = propulsion.flatMap(company => company.engine_products_bilingual || []);
const tests = propulsion.flatMap(company => company.test_history_en || []);
check(products.length === 88 && products.every(engine => hasArabic(engine.name_ar)),
  'all 88 engine-product names have an Arabic primary name');
check(products.every(engine => !engine.rocket_en || hasArabic(engine.rocket_ar)),
  'all displayed product applications have Arabic text');
check(products.every(engine => !engine.engineering_desc_en || hasArabic(engine.engineering_desc_ar)),
  'all displayed product engineering descriptions have Arabic text');
check(products.every(engine => !engine.thrust_en || !engine.thrust_ar ||
  hasArabic(engine.thrust_ar) || !/[A-Za-z]{4,}/.test(engine.thrust_ar)),
  'thrust values are Arabic or remain technical quantities without English prose');
check(tests.length === 94 && tests.every(test => hasArabic(test.title_ar) && hasArabic(test.desc_ar)),
  'all 94 test-history titles and descriptions have Arabic translations');
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
  'the shared Persian-template renderer executes in Arabic for all 43 profiles');
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
