# RASPEHR — گام دوم: پایلوت لینک مستقیم گوگل ارث (V15)

این بسته یک پایلوت محدود پنج‌مکانی برای آزمون الگوی URL مستقیم Google Earth Web است.

## فایل‌ها
- `raspehr-3d/qa/RASPEHR_DIRECT_EARTH_LINK_PILOT_5.json` — پنج لینک نامزد و تنظیمات دوربین.
- `raspehr-3d/qa/RASPEHR_DIRECT_EARTH_LINK_PILOT_5.csv` — جدول ساده پایلوت.
- `raspehr-3d/qa/RASPEHR_DIRECT_EARTH_LINK_PILOT_5.html` — صفحه مستقل برای بازکردن لینک‌ها و ثبت نتیجه زنده در آینده.
- `raspehr-3d/qa/validate-direct-earth-pilot.cjs` — اعتبارسنج آفلاین URL و تطبیق مختصات.
- `raspehr-3d/qa/test-direct-earth-pilot-html.py` — آزمون رابط مستقل در Chromium محلی.
- `raspehr-3d/qa/RASPEHR_DIRECT_EARTH_PILOT_5_BROWSER_ATTEMPT.json` — گزارش تلاش‌های مرورگر این محیط.
- `raspehr-3d/tests/direct-earth-link-pilot.test.cjs` — پنج آزمون خودکار.
- `reports/RASPEHR_DIRECT_EARTH_STAGE2_PILOT_REPORT_FA.md` — گزارش فارسی.

## آزمون
از ریشه پروژه:
```bash
node raspehr-3d/qa/validate-direct-earth-pilot.cjs
node --test raspehr-3d/tests/direct-earth-link-pilot.test.cjs
```

## محدودیت
قالب URL دوربین Google Earth Web در مستندات رسمی به‌عنوان API عمومی تضمین نشده است. گوگل روش رسمی اشتراک‌گذاری را کپی URL نمای فعلی معرفی می‌کند. این لینک‌ها نامزد آزمایشی‌اند و تا آزمون زنده در Google Earth نباید به‌عنوان لینک تأییدشده در محصول فعال شوند.

این گام هیچ تغییری در رجیستری عملیاتی، UI، تصاویر یا نسخه منتشرشده ایجاد نمی‌کند.
