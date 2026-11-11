# بسته بازگردانی پرونده شرکت‌های پرتاب ORBITA

**مبنای ساخت:** ورک‌اسپیس ارسالی کاربر + بسته نقشه جهانی و حذف هویت‌های مورد توافق + بازسازی پرونده پرتاب در ۱۱ نوامبر ۲۰۲۶.

## نصب گیت‌هاب
۱. از شاخه اصلی GitHub یک نسخه ZIP پشتیبان بگیرید.
۲. فایل ZIP حاضر را روی رایانه استخراج کنید؛ در ریشه آن `data`، `assets`، `tests`، `docs`، و `index.html` است.
۳. پوشه‌ها را در مسیر همنام مخزن جایگزین کنید: `data/companies.json`، `data/companies_launch.json`، `data/companies_propulsion.json`، `assets/js/app.js`، `index.html` و سه آزمون داخل `tests/`. سایر فایل‌های پروژه را تغییر ندهید.
۴. پیش از ادغام در شاخه اصلی، در یک branch آزمایشی آپلود کنید. با `node --test tests/*.test.cjs` آزمون‌ها را اجرا کنید.
۵. در سایت تست، نمونه شرکت‌های SpaceX، ULA، Rocket Lab، Blue Origin، Skyroot، PLD Space و دو شرکت با ناوگان مستقل تأییدنشده را در تب‌های «آمار»، «ناوگان»، «تاریخچه» و سه زبان باز کنید.

## نکته اساسی
پوشه داده کامل کاتالوگ ۱۶ هزار ماهواره و پروژه‌ها در این ZIP نیست؛ برنامه طبق درخواست کاربر فقط روی پرونده شرکت‌های پرتاب کار کرده است. عدد **—** در برخی خانه‌ها یعنی جمع‌بندی تأییدشده موجود نیست، نه اینکه تعداد پرتاب صفر است. این ZIP ادعای ۱۰۰٪ راستی‌آزمایی همه ۶۸ شرکت ندارد.

## ابطال داده‌های قدیمی
با جایگزینی فایل `index.html`، نسخه کشِ `app.js` مطابق این بسته خوانده می‌شود. اگر تغییرات بعدی در GitHub انجام شده باشد، این فایل‌های مشترک باید قبل از بارگذاری ادغام فیلدمحور شوند تا تغییرات جدید از بین نروند.

## منابع نمونه
- SpaceX (مدیریت و مقر): https://ir.spacex.com/leadership/ و https://ir.spacex.com/faqs-and-contact/
- ULA (مدیرعامل ۲۰۲۶): https://newsroom.ulalaunch.com/releases/mark-peller-named-united-launch-alliance-president-and-chief-executive-officer
- تعداد تلاش‌های مداری تا ۸ نوامبر ۲۰۲۶: https://mcval.org/launches/launchers
- Rocket Lab گزارش بورسی ۲۰۲۶: https://www.sec.gov/Archives/edgar/data/1819994/000181999426000074/rklb-20260930.htm
- Skyroot پرتاب مداری: https://www.isro.gov.in/First_private_orbital_launch_lifts_from_Sriharikota.html
- RFA مدیریت: https://www.rfa.space/about/

## فایل‌های گزارش
- `docs/LAUNCH_EVIDENCE_AND_GAPS.csv`: ردیف به ردیف وضعیت و موارد باز
- `docs/LAUNCH_SUMMARY.json`: شمارش و وضعیت تکمیل
