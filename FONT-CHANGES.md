# ORBITA — بستهٔ تغییر قلم: دانا (Dana Pro) — ۲۰۲۶-۱۰-۲۳ نسخهٔ d

## محتوای این بسته
| مسیر | تغییر |
|---|---|
| `assets/fonts/Dana-Light.woff2` | جدید — وزن 300 |
| `assets/fonts/Dana-Regular.woff2` | جدید — وزن 400 |
| `assets/fonts/Dana-Medium.woff2` | جدید — وزن 500 |
| `assets/fonts/Dana-DemiBold.woff2` | جدید — وزن 600 |
| `assets/fonts/Dana-ExtraBold.woff2` | جدید — وزن 800 |
| `assets/fonts/Dana-Bold.woff2` | جدید — وزن 700 |
| `assets/fonts/Dana-Black.woff2` | جدید — وزن 900 (رزرو) |
| `assets/fonts/FontLicense.txt` | جدید — سند لایسنس فونت‌ایران |
| `assets/css/app.css` | تعریف `@font-face` دانا + اولویت دانا در پشتهٔ فونت + نقشهٔ وزن |
| `assets/js/app.js` | **بدون تغییر نسبت به بستهٔ قبلی (20261023c)** — صرفاً برای خودکفایی بسته آمده |
| `index.html` | فقط بامپ نسخهٔ کش‌شکن `ORBITA_V → 20261023d` |

> **خودکفایی:** فایل‌های css/js این بسته، وضعیت نهاییِ تأییدشده (پالت + خوانایی + قلم) را دارند؛ اگر بستهٔ رنگی قبلی را هنوز آپلود نکرده‌اید، آپلود همین یک بسته کافی است. فایل‌های وزیرمتن به‌عنوان فالبک سر جای‌شان می‌مانند (حذف نشوند).

## نقشهٔ وزن اعمال‌شده
- **300 Light** → پاراگراف‌های بلند توضیحات
- **400 Regular** → متن عمومی رابط
- **500 Medium** → تب‌ها، چیپ‌ها، برچسب‌ها، دکمه‌ها
- **600 SemiBold** → سربرگ سکشن‌ها، آکاردئون‌ها، نام‌های پرتاب، مقادیر کلیدی
- **700 Bold** → تیترهای پرونده
- **800 ExtraBold** → لوگوی ORBITA
- **900 Black** → رزرو برای لهجه‌های نمایشی
- وزن‌های 100/200 عمداً استفاده نشده‌اند (خوانایی در اندازهٔ ریز)

## ⚠️ یادآوری لایسنس
کد لایسنس ۶ رقمی فونت‌ایران را در جای خالیِ `(.....)` داخل `assets/fonts/FontLicense.txt` درج کنید (شرط پروانهٔ استفادهٔ وب‌سایتی).

## نصب
```bash
cd مسیر/کلون/مخزن
unzip -o orbita-font-changes-20261023d.zip -x FONT-CHANGES.md
git add assets/css/app.css assets/js/app.js assets/fonts/ index.html
git commit -m "feat(font): switch UI typeface to Dana Pro (7 weights, 300-900) with weight-mapped roles"
git push
```

## تست‌شده
- هر ۷ فایل woff2 سالم و با ۲۰۰ سرو می‌شوند ✓
- تمام آزمون‌های داده ✓ · `node --check` ✓

> این سند اختیاری است؛ می‌توانید هنگام بازگشایی حذفش کنید.
