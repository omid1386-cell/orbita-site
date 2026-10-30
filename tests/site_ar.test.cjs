// Regression tests for the staged Arabic launch-site dossier.
// Run with: node tests/site_ar.test.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sites = JSON.parse(fs.readFileSync(path.join(root, 'data/sites.json'), 'utf8'));
const arabic = /[\u0600-\u06FF]/;
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

check(sites.length === 64 && new Set(sites.map(site => site.id)).size === 64,
  'the source set contains 64 unique launch sites');
check(sites.every(site => typeof site.ar === 'string' && site.ar.trim() && arabic.test(site.ar) &&
  typeof site.ar_d === 'string' && site.ar_d.trim() && arabic.test(site.ar_d)),
  'all 64 launch sites have Arabic names and descriptions');
check(sites.every(site => site.en && site.fa && site.en_d && site.fa_d),
  'existing English and Persian site fields remain intact');
const persianOnlyLetters = /[پچژگکی]/;
check(sites.every(site => !persianOnlyLetters.test(site.ar) && !persianOnlyLetters.test(site.ar_d)),
  'the Arabic site translations contain no Persian-only letters');
const launchRows = sites.flatMap(site => site.launches || []);
check(launchRows.length === 350 && launchRows.every(launch => launch.payload_ar && arabic.test(launch.payload_ar)),
  'all 350 launch-history payload names now have Arabic labels');
check(launchRows.every(launch => launch.analysis_ar && arabic.test(launch.analysis_ar)),
  'all 350 launch-history success/failure analyses now have Arabic translations');
check(launchRows.every(launch => launch.payload && launch.analysis_fa && launch.analysis_en),
  'original Persian and English launch-history fields remain intact');
check(launchRows.every(launch => !persianOnlyLetters.test(launch.payload_ar + launch.analysis_ar)),
  'new launch-history Arabic fields contain no Persian-only letters');

const infraMatch = app.match(/var INFRA_LABEL_AR = (\{[\s\S]*?\n  \});/);
let infraMap = {};
if (infraMatch) {
  try { infraMap = vm.runInNewContext('(' + infraMatch[1] + ')'); }
  catch (error) { console.error(error); }
}
const infraNames = [...new Set(sites.flatMap(site => (site.infra || []).map(item => item.name)))];
check(infraMatch && infraNames.length === 50 && infraNames.every(name => Object.prototype.hasOwnProperty.call(infraMap, name)),
  'Arabic infrastructure labels cover every one of the 50 source labels');
check(Object.values(infraMap).every(value => typeof value === 'string' && arabic.test(value)),
  'every infrastructure fallback label is Arabic');

check(app.includes('var geoAnalysisText = isAr ? (o.geo_analysis_ar || "لا يتوفر تحليل جغرافي عربي موثّق لهذا الموقع بعد.")'),
  'Arabic site dossiers never render the Persian-only geo_analysis field');
check(app.includes('localizedInfraName(item, LANG)') && !app.includes("esc(item.name) + '</span>'"),
  'infrastructure names are localized instead of leaking their Persian source text');
check(app.includes('isAr ? safeArabic(l.payload_ar, "اسم الحمولة غير متاح بالعربية")') &&
  app.includes('var arabicAnalysis = safeArabic(l.analysis_ar, "")') &&
  app.includes('esc("لا يتوفر وصف عربي لهذا الإطلاق حالياً.")') &&
  app.includes('safeEnglish(l.mass_en || l.mass, "—")'),
  'launch history uses Arabic payload names and an Arabic-only success/failure analysis fallback');
check(app.includes('if (!/[\\u0600-\\u06FF]/.test(v)) return v;') &&
  app.includes('.replace(/[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/g, " ")'),
  'Arabic-script fragments are stripped from English fallback values');
check(app.includes('buildUpcomingTabInner(o.id, isFa, isAr)') &&
  app.includes('up.getAttribute("data-isar") === "1"'),
  'the upcoming-launch tab retains Arabic locale state when reopened');
check(app.includes('ST_AR = { Go: "مؤكد", TBC: "بانتظار التأكيد", TBD: "الموعد غير محدد" }') &&
  app.includes('"التحليل والبنية التحتية"') && app.includes('"قائمة التحقق من بنية موقع الإطلاق"'),
  'site dossier and upcoming-tab controls have Arabic labels and statuses');
check(app.includes('dormant: "خامل"') && app.includes('dormant: "راکد"') && app.includes('dormant: "Dormant"'),
  'dormant launch sites have localized Persian, English, and Arabic status labels');
check(html.includes('window.ORBITA_V = "20261030country05";'), 'HTML asset cache version is bumped for the site slice');

// Exercise the real site renderer with all 64 records to catch runtime errors or Persian leakage.
const siteStart = app.indexOf('  function renderSiteDetail(p) {');
const siteEnd = app.indexOf('  /* ============ upcoming launches per site', siteStart);
const infraStart = app.indexOf('  // Arabic labels for the repeated launch-site infrastructure checklist.');
const renderable = siteStart >= 0 && siteEnd > siteStart && infraStart >= 0;
let renderedSiteHtml = '';
let renderedSiteText = '';
let renderedPersianSiteText = '';
let renderedEnglishSiteText = '';
if (renderable) {
  const sandbox = {
    LANG: 'ar',
    iconFor: () => '<svg width="30" height="38"></svg>',
    statusLabel: status => ({ active: 'نشط', inactive: 'غير نشط', dormant: 'خامل', under_construction: 'قيد الإنشاء' }[status] || status),
    name: site => sandbox.LANG === 'fa' ? (site.fa || site.en) : (sandbox.LANG === 'ar' ? (site.ar || site.en || site.fa) : (site.en || site.fa)),
    desc: site => sandbox.LANG === 'fa' ? (site.fa_d || site.en_d) : (sandbox.LANG === 'ar' ? (site.ar_d || site.en_d || '') : (site.en_d || site.fa_d)),
    esc: value => String(value == null ? '' : value).replace(/[&<>\"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[char])),
    t: key => ({ cat_site: 'مواقع الإطلاق', country: 'الدولة', operator: 'المشغّل', status: 'الحالة', first_launch: 'أول إطلاق', pads: 'منصات الإطلاق', coords: 'الإحداثيات' }[key] || key),
    cell: (label, value) => value ? '<div><small>' + String(label) + '</small><b>' + String(value) + '</b></div>' : '',
    countryNameAr: () => 'الولايات المتحدة',
    upcomingCountFor: () => 0,
    buildUpcomingTabInner: () => '<div>لا تتوفر بيانات الإطلاقات القادمة بعد.</div>'
  };
  try {
    const renderer = vm.runInNewContext(app.slice(infraStart, siteStart) + app.slice(siteStart, siteEnd) + '\nrenderSiteDetail;', sandbox);
    renderedSiteHtml = sites.map(site => renderer({ o: site, cat: 'site' })).join(' ');
    renderedSiteText = renderedSiteHtml.replace(/<[^>]*>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, ' ');
    sandbox.LANG = 'fa';
    renderedPersianSiteText = renderer({ o: sites[0], cat: 'site' });
    sandbox.LANG = 'en';
    renderedEnglishSiteText = renderer({ o: sites[0], cat: 'site' });
  } catch (error) {
    console.error('Arabic site renderer error:', error);
  }
}
check(renderable && renderedSiteText.length > 0, 'the actual Arabic site renderer runs for all 64 records');
check(!persianOnlyLetters.test(renderedSiteText), 'rendered Arabic site dossiers contain no Persian-only letters');
const escapeHtml = value => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
check(renderable && launchRows.every(launch => renderedSiteHtml.includes(escapeHtml(launch.payload_ar)) &&
  renderedSiteHtml.includes(escapeHtml(launch.analysis_ar))),
  'the Arabic site renderer displays every localized payload name and analysis');
check(renderedSiteText.includes('تحليل النجاح:') && renderedSiteText.includes('تحليل الإخفاق:'),
  'successful and failed launches have Arabic analysis headings');
const normalizedRenderedText = renderedSiteText.replace(/\s+/g, ' ').trim();
const englishAnalysisLeaks = launchRows.some(launch => {
  const body = String(launch.analysis_en || '')
    .replace(/^\s*(?:✅|❌)\s*<b>(?:Analysis|Success Analysis|Failure Analysis):<\/b>\s*/i, '')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return body.length > 30 && normalizedRenderedText.includes(body);
});
check(!englishAnalysisLeaks, 'Arabic launch drawers do not show the English success/failure narratives');
check(renderedPersianSiteText.includes(sites[0].fa) && renderedEnglishSiteText.includes(sites[0].en),
  'site dossier rendering continues to preserve Persian and English names');

const upcomingStart = app.indexOf('  function buildUpcomingTabInner(siteId, isFa, isAr) {');
const upcomingEnd = app.indexOf('  window.toggleSiteLaunchDrawer', upcomingStart);
let upcomingText = '';
let translatedUpcomingText = '';
if (upcomingStart >= 0 && upcomingEnd > upcomingStart) {
  const launch = {
    payload_en: 'Test payload', rocket_en: 'Falcon 9', orbit_en: 'SSO',
    mtype_en: 'Satellite launch', customer_en: 'Commercial',
    desc_en: 'شرح فارسي لا ينبغي أن يظهر'
  };
  const effective = { dateEn: 'Oct 25, 2026', timeEn: '16:00 UTC', status: 'Go', precision: 'day', updatedLive: false };
  const upcomingSandbox = {
    UPC: { data: { sites_covered: ['test-site'], updated: '2026-10-24', site_notes: {} }, liveOk: true },
    upcVisibleRows: () => [{ l: launch, eff: effective }],
    esc: value => String(value == null ? '' : value).replace(/[&<>\"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[char]))
  };
  try {
    const renderUpcoming = vm.runInNewContext(app.slice(upcomingStart, upcomingEnd) + '\nbuildUpcomingTabInner;', upcomingSandbox);
    upcomingText = renderUpcoming('test-site', false, true).replace(/<[^>]*>/g, ' ');
    launch.payload_ar = 'حمولة تجريبية';
    launch.desc_ar = 'وصف عربي للمهمة';
    translatedUpcomingText = renderUpcoming('test-site', false, true).replace(/<[^>]*>/g, ' ');
  } catch (error) {
    console.error('Arabic upcoming-tab renderer error:', error);
  }
}
check(upcomingText.includes('لا يتوفر وصف عربي لهذا الإطلاق حالياً.') && !persianOnlyLetters.test(upcomingText),
  'upcoming tab rejects Persian-only content and falls back to the approved Arabic notice');
check(translatedUpcomingText.includes('حمولة تجريبية') && translatedUpcomingText.includes('وصف عربي للمهمة'),
  'upcoming tab uses Arabic fields when they are available');

console.log(`${passed} PASS / ${failed} FAIL`);
process.exitCode = failed ? 1 : 0;
