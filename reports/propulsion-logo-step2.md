# گزارش گام ۲ — لوگوهای رکوردهای پیشرانش

**تاریخ بررسی:** ۲۳ اکتبر ۲۰۲۶  
**دامنه:** گروه دومِ ۲۴ رکورد از پیش تعیین‌شده؛ در زمان ثبت این گزارش، گام ۳ هنوز آغاز نشده بود.

## نتیجهٔ خلاصه

- برای **۲۲ رکورد از ۲۴ رکورد** نشانِ قابل‌انتساب و قابل‌استفاده ثبت شد.
- برای `ion-satellite` و `nakuja-project` لوگو اضافه نشد؛ ابهام یا نبودِ نشانِ متعلق به خود رکورد را با لوگوی شرکت/حامی دیگر پُر نکردم.
- **۱۹ فایل دارایی یکتا** (مجموعاً ۳۹۰٬۰۹۱ بایت) برای این ۲۲ رکورد اضافه شد. بعضی نشان‌های سازمان مادر میان چند رکورد مشترک‌اند؛ انتساب مادر در جدول صریح است.
- تغییرات master برای رکوردهای این گام فقط در فیلدهای `logo` و `logo_bg` است. شرح‌ها، کشورها، دسته‌بندی و سایر داده‌های رکوردها تغییر نکردند.
- برش‌ها با `tools/split_companies_by_category.py` بازسازی شدند: `propulsion` همچنان ۷۲ عضویت دارد؛ ۳ عضویت ثانویه حفظ شد. نسخهٔ cache داده و JavaScript به `20261023propulsionlogos2` رسید؛ نسخهٔ CSS تغییر نکرد.

## بررسی رکوردها

| شناسه | نتیجه و نوع نشان | فایل پروژه | منبع/یادداشت انتساب |
|---|---|---|---|
| `ihi` | لوگوی خود IHI Aerospace | `assets/img/logos/ihi-aerospace-logo.png` | [صفحهٔ رسمی IHI Aerospace](https://www.ihi.co.jp/ia/en/index.html) · [PNG سربرگ](https://www.ihi.co.jp/ia/en/i/logo_main.png) |
| `impulse` | لوگوی خود Impulse Space؛ SVG از نشان inline در navigation استخراج شد | `assets/img/logos/impulse-space-logo.svg` | [وب‌سایت رسمی](https://www.impulsespace.com/) |
| `ion-satellite` | **افزوده نشد.** دامنهٔ ثبت‌شده در رکورد در واکشی DNS حل نشد؛ نتایج عمومی با D-Orbit ION و ION-X نیز قابل‌تفکیک قطعی نبودند. | — | لوگوی `D-Orbit` یا `ION-X` به این رکورد نسبت داده نشد. |
| `ion-x` | نشان سادهٔ رسمی ION-X، بدون tagline برای خوانایی بهتر | `assets/img/logos/ion-x-logo.svg` | [وب‌سایت رسمی](https://ion-x.space/) · [SVG رسمی `logo-simple`](https://ion-x.space/wp-content/themes/ionx/asset/img/logo-simple.svg) |
| `kbhm-isayev` | **نشان مادر Roscosmos**؛ نه لوگوی مستقل KBKhM | `assets/img/logos/roscosmos-parent-logo-2022.png` | [اطلاعیهٔ رسمی Roscosmos دربارهٔ انتقال KBKhMash به ساختار NPO Energomash](https://www.roscosmos.ru/30083/) · [راهنمای نشان Roscosmos](https://www.roscosmos.ru/brand/) · [پروندهٔ تصویری ۲۰۲۲ با منبع اصلی Roscosmos](https://commons.wikimedia.org/wiki/File:2022-roscosmos-logo-main-eng.png) |
| `lpsc-test` | **نشان مادر ISRO** برای IPRC؛ لوگوی مستقل IPRC در این بررسی از نظر بصری قابل دریافت و تأیید نبود | `assets/img/logos/isro-parent-logo.png` | [وب‌سایت رسمی IPRC](https://www1.iprc.gov.in/) · [نشان/آیکون رسمی ISRO از دامنهٔ ISRO](https://www.isro.gov.in/media_isro/image/favicon.png.webp) |
| `kbkha` | لوگوی خود KBKhA | `assets/img/logos/kbkha-logo.svg` | [وب‌سایت رسمی](https://kbkha.ru/) · [SVG لوگوی رسمی](https://kbkha.ru/templates/default/img/logo.svg) |
| `l3harris` | لوگوی جاری L3Harris | `assets/img/logos/l3harris-logo.svg` | [وب‌سایت رسمی](https://www.l3harris.com/) · [SVG سربرگ/پاورقی](https://www.l3harris.com/themes/custom/l3harris/images/logo-footer.svg) |
| `lpsc-isro` | نشان اختصاصی Liquid Propulsion Systems Centre (LPSC) | `assets/img/logos/lpsc-logo.png` | [وب‌سایت رسمی LPSC](https://www.lpsc.gov.in/) · [تصویر رسمی `LPSC_Logo.jpg`](https://www.lpsc.gov.in/images/LPSC_Logo.jpg) |
| `magdrive` | لوگوی خود Magdrive؛ نسخهٔ مشکی روی زمینهٔ روشن | `assets/img/logos/magdrive-logo.svg` | [وب‌سایت رسمی](https://magdrive.space/) · [SVG لوگوی رسمی](https://magdrive.space/wp-content/themes/magdrive/assets/svgs/main-logo.svg) |
| `manastu` | لوگوی خود Manastu Space؛ SVG inline سربرگ | `assets/img/logos/manastu-space-logo.svg` | [وب‌سایت رسمی](https://manastuspace.com/) |
| `miprons` | لوگوی خود MIPRONS | `assets/img/logos/miprons-logo.png` | [صفحهٔ رسمی فناوری](https://www.miprons.com/technology/) · [PNG لوگوی رسمی](https://www.miprons.com/wp-content/uploads/2025/01/miprons-logo-new.png) |
| `moog` | نشان سازمانی Moog برای رکورد Moog Space and Defense | `assets/img/logos/moog-logo.png` | [صفحهٔ رسمی Moog Space](https://www.moog.com/markets/space.html) · [لوگوی رسمی WebP](https://www.moog.com/content/dam/sites/moog/images/logos/Moog_logo_white_1450.webp) |
| `morpheus-space` | لوگوی جاری Morpheus Space | `assets/img/logos/morpheus-space-logo.png` | [وب‌سایت رسمی](https://www.morpheus.space/) · [PNG ارجاع‌شده در سایت](https://static.wixstatic.com/media/dc8ce2_13a77a07be814338aebf5f9c8ac6e097~mv2.png) |
| `nakuja-project` | **افزوده نشد.** نشان مستقل پروژه از منبع رسمی قابل‌تأیید به‌دست نیامد؛ نشان ANSYS در صفحه، نشان حامی است نه لوگوی پروژه. | — | [وب‌سایت رسمی پروژه](https://nakujaproject.com/) |
| `nammo` | لوگوی خود Nammo | `assets/img/logos/nammo-logo.svg` | [وب‌سایت رسمی](https://www.nammo.com/) · [SVG لوگوی سربرگ](https://www.nammo.com/wp-content/themes/customtheme-2.0/a/img/nammo_logo.svg) |
| `nasa-stennis` | **نشان سازمان مادر NASA**، نه نشان مستقل Stennis | `assets/img/logos/nasa-logo.svg` | [صفحهٔ رسمی Stennis](https://www.nasa.gov/stennis/) · [SVG رسمی NASA](https://www.nasa.gov/wp-content/themes/nasa/assets/images/nasa-logo.svg) |
| `nasa-wstf` | **نشان سازمان مادر NASA**، نه نشان مستقل White Sands Test Facility | `assets/img/logos/nasa-logo.svg` | [صفحهٔ رسمی NASA دربارهٔ آزمون‌های WSTF](https://www.nasa.gov/reference/jsc-hazardous-testing/) · [SVG رسمی NASA](https://www.nasa.gov/wp-content/themes/nasa/assets/images/nasa-logo.svg) |
| `niimash` | نشان سربرگ رسمی NIIMash؛ نسخهٔ سفیدِ مورد استفادهٔ CSS سایت و شامل نشان ترکیبی Roscosmos/NIIMash | `assets/img/logos/niimash-logo.png` | [وب‌سایت رسمی](https://www.niimashspace.ru/) · [PNG ارجاع‌شده در CSS برای `.logo-auto`](https://www.niimashspace.ru/upload/apriori.corp/de8/vs41g7a0hakgmq9b6a6xan2mxwpcomd5.png) |
| `ngpropulsion` | **نشان مادر Northrop Grumman** برای بخش پیشرانش | `assets/img/logos/northrop-grumman-logo.png` | [وب‌سایت رسمی](https://www.northropgrumman.com/) · [لوگوی رسمی white-on-clear](https://cdn.northropgrumman.com/-/media/wp-content/uploads/2019/12/NGC-logo-white-on-clear.png) |
| `energomash` | **نشان مادر Roscosmos**؛ لوگوی مستقل NPO Energomash ثبت نشد | `assets/img/logos/roscosmos-parent-logo-2022.png` | [اطلاعیه‌های رسمی Roscosmos دربارهٔ NPO Energomash](https://www.roscosmos.ru/tag/npo-ehnergomash/) · [راهنمای نشان Roscosmos](https://www.roscosmos.ru/brand/) · [پروندهٔ تصویری ۲۰۲۲](https://commons.wikimedia.org/wiki/File:2022-roscosmos-logo-main-eng.png) |
| `okb-fakel` | **نشان مادر Roscosmos**؛ لوگوی مستقل OKB Fakel در این گام تأیید نشد | `assets/img/logos/roscosmos-parent-logo-2022.png` | [وب‌سایت رسمی Fakel](https://fakel-russia.ru/) دربارهٔ عضویت در ساختار NPO Energomash/Roscosmos · [راهنمای نشان Roscosmos](https://www.roscosmos.ru/brand/) · [فایل نشان ۲۰۲۲](https://commons.wikimedia.org/wiki/File:2022-roscosmos-logo-main-eng.png) |
| `otespace` | لوگوی خود OteSpace | `assets/img/logos/otespace-logo.png` | [وب‌سایت رسمی](https://www.otespace.cz/) · [تصویر سربرگ با alt برابر `ote space logo`](https://www.otespace.cz/wp-content/uploads/elementor/thumbs/Datovy-zdroj-6@4x-qgqzaklr10rxqbmko6h8uixa0u1uokcdljvhuzg98m.png) |
| `paleblue` | لوگوی خود Pale Blue | `assets/img/logos/paleblue-logo.png` | [وب‌سایت رسمی](https://pale-blue.co.jp/) · [PNG لوگوی سربرگ](https://pale-blue.co.jp/wp-content/themes/paleblue/img/header_logo.png) |

## آماده‌سازی دارایی‌ها و پیاده‌سازی

- SVGهای inline در Impulse Space و Manastu از HTML خام استخراج شدند تا حروف‌چینی `viewBox` حفظ شود. SVGها با XML parser بررسی شدند؛ عنصر اجرایی، تصویر جاسازی‌شده یا ارجاع خارجی ندارند.
- فایل رسمی Moog (WebP)، ISRO (favicon با قالب WebP) و Northrop Grumman (با وجود پسوند `.png`، پاسخ WebP) به PNG واقعی تبدیل شدند. نشان LPSC از JPEG رسمی به PNG با اندازهٔ ۵۱۲×۵۱۲ تبدیل شد؛ لوگوی Morpheus Space از ۷۳۰۵×۲۹۴۶ به ۱۶۰۰×۶۴۵ پیکسل کوچک شد.
- برای نشان‌های تیره یا نشان‌های والد با نوشتهٔ خاکستری، `logo_bg: "light"` ثبت شد؛ بقیه با زمینهٔ تیرهٔ پیش‌فرض رندر می‌شوند.
- دارایی‌های قدیمیِ مشکوک مانند تصویر ساختمانی Moog، تصویر موتور Energomash و فایل `ihi.png` (سند کمیسیون اروپا) بازنویسی یا به‌عنوان لوگو استفاده نشدند.

## آزمون‌ها

- `node --check assets/js/app.js` — موفق.
- `node --test tests/*.test.cjs` — **۶۴ آزمون موفق، صفر شکست**.
- آزمون جدید `tests/propulsion_logo_group2_assets.test.cjs` تعداد ۲۲ انتساب، مسیرهای فایل، فرمت PNG/SVG، زمینه‌های روشن و دو رکوردِ بدون لوگوی تأییدشده را کنترل می‌کند.
- تعدادهای بازسازی برش‌ها: launch ۶۸، propulsion ۷۲، agency ۹۶، satmaker ۲۸ عضویت؛ سه عضویت ثانویه حفظ شد. آزمون خودکار مرورگر اجرا نشد؛ Playwright در محیط موجود نصب نیست. پیش‌نمایش فایل‌های نامزد و خروجی نهایی بصری بررسی شد.

## بستهٔ گام ۱ و کاهش حجم فضای کاری

- گزارش و بستهٔ گام ۱ حفظ شدند: `/home/user/orbita/reports/propulsion-logo-step1.md` و `/home/user/orbita-propulsion-logo-step1-github.zip`. بنا به درخواست کاربر، بستهٔ افزایشی گام ۲ ساخته شد تا روی نسخه‌ای اعمال شود که گام ۱ را دریافت کرده است؛ کاربر بسته را دانلود کرد و خواست نسخهٔ محلی حذف شود، بنابراین فایل ZIP از فضای کاری پاک شد.
- بنا به اجازهٔ کاربر، پوشهٔ کاری `.work` با ۳۹ فایل در `/home/user/orbita/orbita-work-archive-20261023.zip` فشرده شد. آزمون `unzip -t` موفق بود و مقایسهٔ استخراج با اصل، یکسان‌بودن همهٔ فایل‌ها را تأیید کرد؛ سپس پوشهٔ اصلی حذف شد. حجم پیشین ۱۰٬۷۰۸٬۸۸۵ بایت و آرشیو ۵٬۳۳۱٬۸۴۸ بایت است؛ صرفه‌جویی خالص ۵٬۳۷۷٬۰۳۷ بایت.
- بنا به همان اجازه، ۹ نسخهٔ پشتیبان قدیمی با مجموع ۱٬۳۱۱٬۴۹۹ بایت حذف شدند. کاهش خالص دو کار حدود ۶٫۴ MiB است.
- اندازهٔ `orbita` از حدود ۹۷ MB به حدود ۹۱ MB و اندازهٔ کل فضای کاری از حدود ۱۱۲ MB به حدود ۱۰۶ MB رسید. بستهٔ اروپا، بسته‌های قبلی، فایل‌های اصلی پروژه و `assets/geo/countries.json` دست‌نخورده ماندند.

**گام ۲ کامل است. در زمان ثبت این گزارش اجازهٔ گام ۳ هنوز دریافت نشده بود؛ کاربر بعداً صریحاً آغاز گام ۳ را مجاز کرد.**
