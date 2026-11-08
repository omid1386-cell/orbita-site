# گزارش گام ۳ — نشان‌های رکوردهای پیشرانش

**تاریخ بررسی:** ۲۳ اکتبر ۲۰۲۶  
**دامنه:** سومین گروهِ ۲۴ رکورد از برش ۷۲عضوی پیشرانش؛ این گام با اجازهٔ صریح کاربر آغاز شد.

## نتیجهٔ کلی

- برای **۲۳ رکورد از ۲۴ رکورد** نشانِ قابل‌انتساب پیدا و ثبت شد. برای `pyralink-aerospace` نشان اضافه نشد؛ در دادهٔ رکورد وب‌سایتی ثبت نشده و منبع معتبری برای نشان همان سازمان پیدا نشد.
- **۲۱ فایل دارایی تازه** با حجم مجموع **۴۶۳٬۱۰۵ بایت** افزوده شد. دو فایلِ ازپیش‌موجود دوباره استفاده شدند: نشان دانشگاه شریف و نشان مادر CASC برای نام مستعار آکادمی ششم.
- در شش رکورد، نشان سازمان بالادست به‌کار رفته و این انتساب در جدول روشن شده است: دانشگاه شریف، SpaceX، Relativity Space، CASC، Safran و Rostec. نشان Proton-PM از فایل رسمی خود شرکت استخراج شد و عبارت وابستگی به NPO Energomash را در خود دارد.
- در `data/companies.json` برای رکوردهای این گام فقط فیلدهای `logo` و `logo_bg` تغییر کردند؛ متن‌ها، کشورها، دسته‌بندی و سایر داده‌ها دست‌نخورده ماندند. رابطهٔ `casc-6th` با `aalpt-china` حفظ شد.
- برش‌های داده بازسازی شدند: propulsion همچنان **۷۲ عضویت** و سه عضویت ثانویه دارد. نسخهٔ حافظهٔ داده و برنامه در `index.html` و آزمون‌ها به `20261023propulsionlogos3` رسید؛ نسخهٔ CSS تغییر نکرد.

## بررسی ۲۴ رکورد

| شناسه | نتیجه و انتساب | فایل محلی | منبع راستی‌آزمایی |
|---|---|---|---|
| `sharif-iran` | نشان دانشگاه صنعتی شریف به‌عنوان سازمان میزبان/مادر است، نه نشان یک آزمایشگاه مستقل. صفحهٔ رسمی، درس Space Propulsion را تأیید می‌کند؛ وجود آزمایشگاهی با نام دقیق رکورد از همان صفحه ثابت نمی‌شود. | `assets/img/logos/sharif-iran.png` (فایل موجود؛ فقط قالب آن اصلاح شد) | [صفحهٔ رسمی درس پیشرانش](http://ae.sharif.edu/~spacepropulsion/) · [وب‌سایت دانشگاه شریف](https://sharif.edu) |
| `rocketdyne` | نشان رسمی خود Rocketdyne؛ نشان قدیمی Aerojet Rocketdyne جایگزین نشد. | `assets/img/logos/rocketdyne-logo.png` | [وب‌سایت Rocketdyne](https://rocketdyne.com/) · [فایل نشان در دامنهٔ رسمی](https://rocketdyne.com/assets/Rocketdyne_Full_Logo_COLOR_WHT_RGB_1785158337859-sSmAuIRQ.png) · [تأیید ایجاد Rocketdyne پس از واگذاری واحد پیشرانش](https://www.aeroequity.com/ae-industrial-closes-purchase-of-l3harriss-space-propulsion-power-and-electronics-units-establishing-the-business-as-rocketdyne/) |
| `ursamajor` | نشان رسمی خود Ursa Major. | `assets/img/logos/ursamajor-logo.png` | [وب‌سایت رسمی](https://ursamajor.com/) · [فایل نشان در وب‌سایت رسمی](https://ursamajor.com/wp-content/uploads/2026/11/PrimaryLogo_OrangeWhte3.png) |
| `thrustme` | نشان رسمی خود ThrustMe؛ از فایل سربرگ ارجاع‌شده در CSS رسمی. | `assets/img/logos/thrustme-logo.png` | [وب‌سایت رسمی](https://www.thrustme.fr/) · [CSS رسمی سربرگ](https://www.thrustme.fr/base/visual/css/stylesheets/public.css?v=11202610) · [فایل نشان](https://www.thrustme.fr/base/visual/img/logoTop.png) |
| `spaceforest` | نشان رسمی خود SpaceForest؛ نسخهٔ برداری سایت. | `assets/img/logos/spaceforest-logo.svg` | [وب‌سایت رسمی](https://spaceforest.pl/) · [SVG نشان](https://spaceforest.pl/wp-content/uploads/2024/10/SpaceForest-logo.svg) |
| `phasefour` | نشان تاریخی خود Phase Four از نسخهٔ بایگانی‌شدهٔ وب‌سایت رسمی؛ به شرکت‌های بعدی یا خریداران دارایی‌ها نسبت داده نشده است. | `assets/img/logos/phasefour-logo.png` | [صفحهٔ رسمی بایگانی‌شده](https://web.archive.org/web/20240111090407id_/https://phasefour.io/) · [فایل نشان سربرگ از بایگانی رسمی، ۹ فوریهٔ ۲۰۲۲](https://web.archive.org/web/20220209183007id_/https://phasefour.io/wp-content/uploads/2021/08/P4LogoHeader-Dark.png) |
| `accion` | نشان جاری Revolution Space از دامنهٔ رسمیِ ثبت‌شده برای این رکورد؛ به‌عنوان نشان تاریخی Accion Systems معرفی نشده است. | `assets/img/logos/revolution-space-logo.png` | [وب‌سایت Revolution Space](https://revolutionspace.com/) · [فایل رسمی در نسخهٔ بایگانی‌شده، ۲۹ اکتبر ۲۰۲۳](https://web.archive.org/web/20231029085851id_/https://revolutionspace.com/wp-content/uploads/2023/10/logo-home_revolution-space.webp) |
| `sitael` | نشان رنگی رسمی خود SITAEL؛ فایل بایگانی‌شدهٔ سایت با صفحهٔ رسمی رویداد پیشرانش در ۲۰۲۴ تطبیق داده شد. | `assets/img/logos/sitael-logo.png` | [صفحهٔ رسمی SITAEL در کنفرانس پیشرانش ۲۰۲۴](https://www.sitael.com/sitael-at-the-space-propulsion-conference-2024/) · [فایل نشان در نسخهٔ بایگانی‌شدهٔ وب‌سایت رسمی](https://web.archive.org/web/20190719073002id_/http://www.sitael.com/wp-content/uploads/2015/10/logo_sitael_colore.png) |
| `spacex-engine` | نشان شرکت مادر SpaceX، نه نشان جداگانهٔ موتور Raptor؛ SVG از مؤلفهٔ لوگوی سایت رسمی استخراج شد. | `assets/img/logos/spacex-logo.svg` | [وب‌سایت SpaceX](https://www.spacex.com/) · [کد اصلی رسمی شامل مؤلفهٔ `spx-logo-svg`](https://www.spacex.com/main.31216f547cbf0c31.js) |
| `relativity-engine` | نشان شرکت مادر Relativity Space؛ نشان مستقلی برای خانوادهٔ موتورهای Aeon ثبت نشده است. | `assets/img/logos/relativity-space-logo.png` | [وب‌سایت رسمی](https://relativityspace.com/) · [فایل نشان سفید از میزبان رسانه‌ای مورد استفادهٔ سایت](https://images.squarespace-cdn.com/content/v1/59a8fb50d2b8575fad311abb/1505499304234-STDBEYPYD2DPUUIHRAL4/Relativity_White_RGB_900px.png) |
| `casc-6th` | **نشان مادر CASC**؛ این رکورد نام مستعار `aalpt-china` است، پس همان فایل مرحلهٔ ۱ دوباره استفاده شد و فایل تکراری ساخته نشد. | `assets/img/logos/casc-parent-logo.png` (موجود) | [صفحهٔ رسمی CASC دربارهٔ آکادمی ششم](https://www.spacechina.com/n25/n142/n152/n12989/n13957/c25220/content.html) · [نشان CASC از دامنهٔ رسمی](https://www.spacechina.com/n25/template/2488533/2488594.png) |
| `vacco` | نشان رسمی خود VACCO؛ تصویر GIF سربرگ به PNG واقعی تبدیل شد. | `assets/img/logos/vacco-logo.png` | [وب‌سایت رسمی](https://vacco.com/) · [فایل نشان سربرگ](https://vacco.com/images/uploads/site-images/logo.gif) |
| `solid-state-propulsion-za` | نشان رسمی خود Solid State Propulsion؛ فایل اصلی شفاف و متعلق به سایت شرکت است. | `assets/img/logos/solid-state-propulsion-logo.png` | [وب‌سایت رسمی](https://solidstatepropulsion.co.za/) · [فایل نشان](https://solidstatepropulsion.co.za/wp-content/uploads/2023/06/ssplogotransm1.png) |
| `pyralink-aerospace` | **افزوده نشد.** وب‌سایتی در خود رکورد ثبت نشده و نشان هم‌نام یا مشابه را نمی‌توان با اطمینان به همین سازمان نسبت داد. | — | منبع رسمیِ قابل‌انتساب برای نشان این رکورد پیدا نشد؛ از حدس یا نشان سازمان دیگر استفاده نشد. |
| `spacefields` | نشان رسمی خود SpaceFields؛ فایل WebP سایت به PNG واقعی تبدیل و برای حفظ حجم کوچک شد. | `assets/img/logos/spacefields-logo.png` | [وب‌سایت رسمی](https://spacefields.in/) · [فایل نشان در سایت](https://spacefields.in/wp-content/uploads/2024/08/Logo2.png.webp) |
| `regulus-guyane` | نشان خود Regulus از فهرست بازیگران مرکز فضایی گویان/CNES؛ نشان CNES یا مرکز فضایی به‌جای شرکت استفاده نشد. | `assets/img/logos/regulus-logo.png` | [فهرست رسمی بازیگران مرکز فضایی گویان](https://centrespatialguyanais.cnes.fr/en/acteurs) · [فایل نشان Regulus در دامنهٔ CNES](https://centrespatialguyanais.cnes.fr/sites/default/files/styles/webp_original/public/2025-08/REGULUS%20LOGO%2021-9%20copie.jpg.webp?itok=QC9Tqow7) |
| `safran-spacecraft-propulsion` | نشان سازمان مادر Safran، نه نشان مستقل واحد پیشرانش فضایی. | `assets/img/logos/safran-parent-logo.svg` | [صفحهٔ رسمی Safran دربارهٔ محل Vernon](https://www.safran-group.com/locations/france/safran-aircraft-engines-vernon-2077314) · [SVG نشان Safran](https://www.safran-group.com/themes/custom/safran_fo/public/images/logo.svg) |
| `pulsar-fusion` | نشان رسمی خود Pulsar Fusion؛ نشان برداری رسمی واژهٔ PULSAR است. | `assets/img/logos/pulsar-fusion-logo.svg` | [وب‌سایت رسمی](https://pulsarfusion.com/) · [SVG نشان](https://pulsarfusion.com/wp-content/uploads/2023/12/pulsar-logotype.svg) |
| `t4i` | نشان رسمی خود T4i؛ فایل سفید سایت برای زمینهٔ تیره نگه داشته شد. | `assets/img/logos/t4i-logo.png` | [وب‌سایت رسمی](https://www.t4innovation.com/) · [PNG نشان](https://www.t4innovation.com/wp-content/uploads/2025/09/T4i-logo_R.png) |
| `pangea-propulsion` | نشان خود Pangea؛ از نماد برداری `logo` درون صفحهٔ رسمی استخراج شد و رنگ پیش‌فرض سیاه SVG حفظ شد. | `assets/img/logos/pangea-propulsion-logo.svg` | [وب‌سایت رسمی](https://www.pangeapropulsion.com/en/)؛ نشان به‌صورت `symbol id="logo"` در HTML صفحه است. |
| `uec-kuznetsov` | **نشان مادر Rostec**، نه نشان اختصاصی UEC-Kuznetsov. صفحهٔ رسمی به `#icon-logo` ارجاع می‌دهد، اما تعریف آن در HTML دریافت‌شده نبود؛ بنابراین نشان Rostec که همان سایت به آن پیوند می‌دهد، با انتساب روشن انتخاب شد. | `assets/img/logos/rostech-parent-logo.svg` | [صفحهٔ رسمی UEC-Kuznetsov](https://www.uecrus.com/about/structure/pao-odk-kuznetsov/) · [SVG نشان Rostec در همان وب‌سایت رسمی](https://www.uecrus.com/local/templates/odk/images/rostech.svg) |
| `proton-pm` | نشان رسمی خود Proton-PM از PDF رسمی لوگو استخراج شد؛ در زیرنویس نشان آمده است «ساختار یکپارچهٔ NPO Energomash». این فایل نشان مادر نیست. | `assets/img/logos/proton-pm-logo.svg` | [صفحهٔ رسمی هویت بصری](https://protonpm.ru/company/style/) · [PDF رسمی لوگو، نسخهٔ بایگانی‌شده در ۷ اوت ۲۰۲۴](https://web.archive.org/web/20240807181052id_/https://protonpm.ru/upload/iblock/204/ss6mamj6njjarynsr30huwm7si2w8ch7/PROTON_PM_logo-rus.pdf) |
| `sets` | نشان رسمی خود SETS؛ نسخهٔ برداری سایت. | `assets/img/logos/sets-logo.svg` | [وب‌سایت رسمی](https://sets.space/) · [SVG نشان](https://sets.space/wp-content/themes/sets-space/assets/images/general/logo-sets.svg) |
| `thaliana-space` | نشان رسمی خود Thaliana Space؛ نسخهٔ برداری سایت. | `assets/img/logos/thaliana-space-logo.svg` | [وب‌سایت رسمی](https://thaliana.space/) · [SVG نشان](https://thaliana.space/wp-content/themes/thaliana-space/assets/images/logo.svg) |

## آماده‌سازی دارایی‌ها و زمینهٔ نمایش

- برای ۱۳ نشان تیره، `logo_bg: "light"` ثبت شد تا روی زمینهٔ روشن خوانا بمانند: `sharif-iran`، `thrustme`، `spaceforest`، `accion`، `sitael`، `casc-6th`، `vacco`، `solid-state-propulsion-za`، `regulus-guyane`، `safran-spacecraft-propulsion`، `pangea-propulsion`، `uec-kuznetsov` و `proton-pm`. باقی نشان‌ها روی زمینهٔ تیرهٔ پیش‌فرض نمایش داده می‌شوند.
- فایل‌های Ursa Major، Revolution Space، SpaceFields و Regulus از WebP و فایل VACCO از GIF به PNG واقعی تبدیل شدند؛ بعضی تصویرهای بزرگ برش/کوچک و بهینه شدند. نشان‌های SpaceX و Pangea از SVG درون صفحه استخراج شدند و نشان Proton-PM از PDF برداری رسمی به SVG تبدیل شد.
- فایل محلی `sharif-iran.png` پیش از این در واقع JPEG بود، با آن‌که پسوندش PNG بود. چون فقط همین رکورد از آن استفاده می‌کند، همان مسیر به PNG واقعی و فشرده تبدیل شد؛ ظاهر نشان تغییر نکرد.
- SVGها از نظر XML، وجود محتوای اجرایی و وابستگی به منبع خارجی بررسی شدند؛ PNGهای تازه نیز با امضای واقعی PNG کنترل شدند.

## پیاده‌سازی و آزمون

- فایل اصلی داده و برش‌های دسته‌ای به‌روزرسانی شدند؛ تعداد عضویت‌ها تغییر نکرد. داده‌های غیر از نشان‌ها با نسخهٔ پیش از گام ۳ مقایسه شدند و یکسان ماندند.
- نسخهٔ داده و JavaScript در `index.html` و آزمون‌های وابسته به آن به `20261023propulsionlogos3` افزایش یافت؛ نشانگر نسخهٔ CSS تغییر نکرد.
- `node --check assets/js/app.js` موفق شد. `node --test tests/*.test.cjs` با **۶۵ آزمون موفق و صفر شکست** پایان یافت؛ آزمون تازهٔ `tests/propulsion_logo_group3_assets.test.cjs` ۲۳ انتساب و رکوردِ بدون نشان را کنترل می‌کند.
- آزمون خودکار مرورگر اجرا نشد؛ Playwright در محیط موجود نصب نیست. پیش‌نمایش دارایی‌های تازه نیز بصری بررسی شد.

## حفظ پروژه‌ها و بسته‌ها

- فایل‌ها و بسته‌های پروژهٔ اروپا و بستهٔ گام ۱ دست‌نخورده ماندند. بستهٔ افزایشی گام ۳ در `/home/user/orbita-propulsion-logo-step3-github.zip` ساخته شد؛ این بسته نسخهٔ کامل پروژه نیست و باید روی نسخه‌ای اعمال شود که گام‌های ۱ و ۲ را دارد.
- بستهٔ گام ۲ پس از دانلود کاربر و به درخواست او از فضای کاری حذف شده بود؛ همین نکته در گزارش گام ۲ نیز اصلاح شد.

**گام ۳ کامل شد؛ بررسی نشان‌های سه گروهِ ۷۲ رکورد پیشرانش به پایان رسید.**
