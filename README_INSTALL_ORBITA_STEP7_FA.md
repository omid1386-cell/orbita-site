# راهنمای نگهداری و نصب آتی — گام هفتم ORBITA

## اکنون لازم نیست چیزی بارگذاری کنید

گام هفتم صرفاً در نسخه کاری آماده شده است. تا زمان تأیید کاربر، **هیچ Push، Commit یا Deploy ضروری نیست**.

## وقتی تصمیم به آزمایش یا نصب گرفتید

### حالت الف: گام‌های ۱ تا ۶ و بازطراحی UI پرتاب‌ها قبلاً نصب شده‌اند

بسته **DELTA** را استخراج کنید و فایل‌های زیر را با حفظ مسیر نسبی در شاخه جداگانه پروژه جایگزین/اضافه کنید:

- `index.html`
- `assets/js/upcoming-launch-browser.js`
- `assets/js/upcoming-landing-browser.js`
- `assets/js/upcoming-event-display.js` (جدید)
- `assets/css/upcoming-event-display.css` (جدید)
- `tests/upcoming-event-display.test.cjs` (آزمون جدید)

### حالت ب: مراحل قبلی هنوز در سایت نصب نشده‌اند

از بسته **CUMULATIVE** استفاده کنید که مجموعه فایل‌های تغییر یافته گام‌های ۱ تا ۷ را به همراه بازطراحی قبلی در بر دارد؛ این بسته، کل سورس نرم‌افزار نیست و باید روی نسخه متناظر مبنا اعمال شود.

## تست پیشنهادی بعد از نصب در شاخه Preview

1. تأیید اجرای موفق `refresh-global-launches.yml` و `refresh-global-landings.yml` در GitHub و وجود رکوردهای زنده در فایل‌های JSON.
2. بازکردن پرتاب‌ها و فرودها، بررسی ۷، ۱۴، ۳۰ و ۱۲۰ روز و ترکیب دو کشور هم‌زمان.
3. مشاهده وضعیت «در انتظار نخستین به‌روزرسانی» تا قبل از همگام‌سازی موفق، بدون جایگزین‌کردن با داده‌های آزمایشی.
4. نمایش وضعیت‌های در انتظار تأیید، توقف، لغو و نامشخص؛ بررسی آخرین زمان به‌روزرسانی.
5. روی فرودهایی با `associated_launch_date_not_landing_time` دقت کنید: روز پرتاب نباید به‌عنوان ساعت یا زمان دقیق فرود معرفی شود.
6. بررسی فارسی/انگلیسی/عربی، موبایل و دسکتاپ، حالت روشن/تاریک و باز و بسته‌کردن شناسنامه‌ها و پنل‌ها.
7. در صورت مشکل، به کامیت پیشین برگردید. فایل‌های داده و موتور نقشه در این بسته دست نخورده‌اند.

## آزمون آفلاین

```bash
node --test tests/upcoming-event-display.test.cjs tests/upcoming-launch-filters.test.cjs tests/upcoming-landing-filters.test.cjs tests/upcoming-launch-ui.test.cjs tests/upcoming-landing-ui.test.cjs tests/launch-mission-ui-redesign.test.cjs
python tools/test_global_launches.py
python tools/test_global_landings.py
```

**مهم:** از ZIP قدیمی تحقیقات ۵ یا فایل‌های نامرتبط برای جایگزینی استفاده نکنید. این بسته فقط روی سورس مربوط به گام‌های ۱ تا ۶ و UI نهایی پرتاب‌ها آزموده شده است.
