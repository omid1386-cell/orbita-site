# راهنمای نصب گام‌های ۳ و ۴ ORBITA

این بسته، تغییرات گام‌های ۱ تا ۴ را به‌صورت تجمیعی دارد؛ بنابراین اگر هنوز بسته گام‌های ۱ و ۲ را روی GitHub قرار نداده‌اید، همین بسته را مبنای نصب قرار دهید.

## ۱) پیش از نصب

1. از نسخه فعلی مخزن نسخه پشتیبان بگیرید.
2. فایل ZIP را روی رایانه استخراج کنید.
3. مسیرهای داخل ZIP از ریشه مخزن ORBITA نوشته شده‌اند؛ ساختار پوشه‌ها را حفظ کنید.

## ۲) فایل‌هایی که باید در مخزن قرار بگیرند

### فایل‌های رابط و فیلتر گام‌های ۳ و ۴

- `index.html`
- `assets/css/app.css`
- `assets/js/upcoming-launch-filters.js`
- `assets/js/upcoming-launch-browser.js`
- `data/country_codes.json`
- `tests/upcoming-launch-filters.test.cjs`
- `tests/upcoming-launch-ui.test.cjs`

### فایل‌های داده و به‌روزرسانی گام‌های ۱ و ۲

- `data/upcoming_global.json`
- `tools/upcoming_event_contract.py`
- `tools/audit_upcoming_events.py`
- `tools/refresh_global_launches.py`
- `tools/test_global_launches.py`
- `.github/workflows/refresh-global-launches.yml`
- `tests/upcoming_global.test.cjs`

فایل `tools/ll2_compat.py` نیز در بسته آمده تا وابستگی دریافت داده‌های Launch Library 2 همراه مجموعه باشد.

## ۳) اجرای آزمون‌ها

پس از بارگذاری فایل‌ها، این آزمون‌ها را می‌توان محلی یا در GitHub Actions اجرا کرد:

```bash
python -m unittest discover -s tools -p 'test_global_launches.py' -v
node tests/upcoming_global.test.cjs
node tests/upcoming-launch-filters.test.cjs
node tests/upcoming-launch-ui.test.cjs
```

## ۴) نخستین همگام‌سازی داده‌های واقعی

1. در GitHub مخزن را باز کنید.
2. به بخش Actions بروید.
3. گردش‌کار `refresh-global-launches-120-days` را انتخاب کنید.
4. گزینه `Run workflow` را اجرا کنید.
5. پس از موفقیت، گردش‌کار فایل `data/upcoming_global.json` را با داده کامل دریافتی از Launch Library 2 به‌روزرسانی و commit می‌کند.

تا پیش از نخستین اجرای موفق، رابط جدید پیام «در انتظار نخستین همگام‌سازی» را نمایش می‌دهد. داده آزمایشی یا ساختگی در فایل اصلی قرار داده نشده است.

## ۵) مشاهده در نرم‌افزار

پس از انتشار، دکمه «پرتاب‌های پیش‌رو» در نوار بالای نقشه ظاهر می‌شود. از آن می‌توان بازه ۷، ۱۴، ۳۰ یا ۱۲۰ روز را انتخاب کرد و یک یا چند کشور را هم‌زمان فیلتر کرد.

مبنای کشور به‌صورت پیش‌فرض کشور اپراتور/ارائه‌دهنده پرتاب است. برای فیلتر جغرافیایی، گزینه «کشور محل پرتاب» را انتخاب کنید.

## ۶) نکات مهم

- فایل `data/upcoming.json` و تب‌های فعلی پرتاب هر پایگاه تغییر نکرده‌اند.
- `data/upcoming_landings.json` و تب فرودهای پیش‌رو در این مرحله تغییر نکرده‌اند؛ رابط فرودها در گام‌های ۵ و ۶ ساخته می‌شود.
- هیچ کلید API یا رمز محرمانه‌ای به فایل‌های عمومی اضافه نشده است.
- این بسته روی سایت آنلاین منتشر نشده است؛ انتشار فقط پس از بارگذاری و تأیید شما انجام می‌شود.
