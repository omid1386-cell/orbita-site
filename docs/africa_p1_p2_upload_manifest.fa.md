# راهنمای ZIP بارگذاری ORBITA — اصلاحات P1، داده‌های P2 و ممیزی تماس‌ها

## مبدأ و دامنه

- baseline واقعی مخزن از `origin/main` تازه شد. پس از `git fetch --prune origin main`، شاخه به commit `b0efe17` (مرجع `origin/main`) به‌روزرسانی شد؛ checkout مبنا پاک و `HEAD` با `origin/main` برابر بود.
- ZIP گزینشی است: **۳۱ فایل** در مسیرهای واقعی مخزن؛ کل workspace، فایل‌های پشتیبان، cache، کلید یا credential بسته‌بندی نمی‌شوند.
- بسته همهٔ فایل‌های بستهٔ P1/P2 قبلی را حفظ می‌کند و اصلاح ممیزی تماس‌های P2 را هم اضافه می‌کند. تک‌تک فایل‌های بسته با baseline تازه مقایسه شدند؛ فایل‌های هم‌نامِ بسته نسخهٔ جاری workspace هستند و تغییرات baseline در این فایل‌ها از بین نرفته‌اند.
- بخش عملیاتی گزارش‌گیری برنامه تغییر نکرده است؛ نشانی عمومی API در `index.html` با baseline برابر است. فقط tokenهای cache داده/کد برای بارگیری نسخهٔ تازه افزایش یافته‌اند.
- هیچ commit، push یا deploy انجام نشده است.

## محتوای بسته

**یادداشت و مستندات**

- `PATCH_README_fa.md`
- `docs/africa_p1_p2_upload_manifest.fa.md`
- `docs/africa_priority2_audit.md`
- `docs/africa_priority2_sources.json`
- `docs/africa_priority2_contact_audit.fa.md`

**کد و داده**

- `assets/js/app.js`
- `index.html`
- `data/companies.json`
- `data/companies_agency.json`
- `data/companies_launch.json`
- `data/companies_propulsion.json`
- `data/companies_satmaker.json`
- `data/sites.json`
- `tools/build_country_tiles.sh`

**آزمون‌ها**

- `tests/africa_priority1.test.cjs`
- `tests/africa_priority2.test.cjs`
- `tests/africa_priority2_contacts.test.cjs`
- `tests/boot_optimization.test.cjs`
- `tests/cluster_label_startup.test.cjs`
- `tests/company_agency_ar.test.cjs`
- `tests/company_launch_ar.test.cjs`
- `tests/company_propulsion_ar.test.cjs`
- `tests/company_satmaker_ar.test.cjs`
- `tests/country_ar.test.cjs`
- `tests/country_interaction.test.cjs`
- `tests/i18n_ar.test.cjs`
- `tests/map_pan_markers.test.cjs`
- `tests/recovery_ar.test.cjs`
- `tests/reporting.test.cjs`
- `tests/site_ar.test.cjs`
- `tests/site_stats.test.cjs`

## تغییر ممیزی تماس‌ها

- fallbackهای ساختگی `isa.ir`، LinkedIn آژانس فضایی ایران و `info@isa.ir` از پروفایل آژانس‌ها حذف شده‌اند؛ فیلد خالی نمایش داده نمی‌شود.
- وب‌سایت ZINGSA به `.ac.zw` اصلاح شد؛ ASES دیگر X را به‌عنوان وب‌سایت نشان نمی‌دهد؛ لینک‌های جاری و غیرقابل‌تأیید ISRA و PyraLink خالی مانده‌اند؛ AGEOS و NIST به مقصدهای مستندشده اصلاح شده‌اند.
- داده‌های چهار فایل دسته‌بندی از `companies.json` همگام شدند. لینک یا ایمیلِ تازه‌ای بدون منبع رسمی اضافه نشده است.

## اعتبارسنجی روی baseline تازه

- `unzip -t` — موفق.
- `node --check assets/js/app.js` — موفق.
- اعتبارسنجی JSON فایل‌های داده و منبع‌نامه — موفق.
- `node --test tests/*.test.cjs report-api/server.test.mjs` — **۶۵/۶۵ آزمون موفق**.
- ZIP روی checkout پاک از commit `b0efe17` استخراج شد؛ هر ۳۱ فایل با workspace و baseline مقایسه شدند و مجموعهٔ کامل آزمون‌ها روی checkout استخراج‌شده نیز اجرا شد: **۶۵/۶۵ موفق**.
- آزمون مرورگری اجرا نشد: Playwright در محیط نصب نیست.
- آزمون‌ها شامل حفاظت از تفکیک نهاد/شرکت و سایت، اصلاح‌های P1/P2، و عدم نمایش لینک/ایمیل ساختگی در پروفایل آژانس‌هاست.

## روش استفاده

ZIP را فقط روی checkout همان مخزن و baseline `b0efe17` استخراج کنید؛ سپس diff را بازبینی و آزمون‌ها را اجرا کنید. فایل‌های هم‌نام را جایگزین و فایل‌های جدید را در مسیرهای موجود اضافه کنید. پیش از commit یا انتشار، تغییرات را خودتان بازبینی کنید. بسته هیچ عملیات Git یا deploy انجام نمی‌دهد.
