# گزارش ممیزی چهار حوزهٔ فضایی آسیا در ORBITA

**تاریخ برش بررسی:** ۶ نوامبر ۲۰۲۶؛ اصلاحیهٔ Stellar Kinetics در ۷ نوامبر ۲۰۲۶  
**دامنه:** شرکت‌های پیشران، سازمان‌ها و نهادهای فضایی، شرکت‌های پرتاب، و پایگاه‌ها/میدان‌های پرتاب.  
**اصل ممیزی:** پرتاب مداری، پرواز زیرمداری، آزمون زمینی/آتش گرم، اعلام تجاری و طرح پیشنهادی از هم جدا شده‌اند. شمار نامعلوم به صفر تبدیل نشده؛ مختصات و رابطهٔ نهادیِ تأییدنشده نیز حدس زده نشده است.

## جمع‌بندی اجرایی

- مجموعهٔ پایگاه‌ها از **۷۲ به ۷۸ رکورد** رسید؛ شش موردِ جاافتاده/نیازمند ثبت افزوده شدند: Hainan commercial، Xuhai، Jiupeng، Sonmiani، Pameunguep و طرح پیشنهادی Biak. اکنون ۳۶۲ ردیف تاریخچهٔ گزیده نگهداری می‌شود؛ این ردیف‌ها تاریخچهٔ کامل نیستند و از آن‌ها آمار کل محاسبه نمی‌شود.
- آمار و تاریخچهٔ Wenchang، Naro، Jeju و Taiki با تفکیک نوع فعالیت بازبینی شد. شمار padهای تجاری Hainan از padهای دولتی Wenchang جدا شده است.
- **۱۶ نهاد فضایی** به داده‌ها افزوده شدند؛ ماهیت حقوقی/عملیاتیِ آژانس ملی، پژوهشگاه، تنظیم‌گر، اپراتور ماهواره، کمیتهٔ دولتی و سازمان منطقه‌ای جداگانه ثبت شد.
- دادهٔ شرکت‌ها به‌روز شد: ۲۰۶ رکورد در چهار فایل دسته‌بندی‌شده؛ launch=60، propulsion=52 (از آن‌ها 51 رکورد canonical)، agency=66 و satmaker=28. اصلاحیهٔ ۷ نوامبر، Stellar Kinetics MCT را با کشور عمان و پیوند عملیاتی Etlaq افزود. شرکت/نهاد پیشران با شرکت پرتاب یکی فرض نشده است.
- پیش‌فرض‌های حدسی رابط دربارهٔ آمار، نرخ موفقیت، تعداد مراحل، بازاستفاده، وضعیت موشک، نوع مدار و سکوی LEO حذف/محدود شد. آمار Xuhai و Sonmiani با عدم‌قطعیت واقعی نمایش داده می‌شود.
- **اعتبارسنجی:** هر ۲۴ فایل آزمون Node موفق شد؛ `node --check assets/js/app.js`، کامپایل نحوی دو ابزار Python و اعتبارسنجی JSONها نیز موفق بود. فایل‌های دسته‌بندی شرکت‌ها از منبع canonical دوباره ساخته شدند.

## ۱. شرکت‌های پیشران

### اصلاحات و تمایزهای کلیدی

- **Delta V** در دستهٔ پیشران ثبت شد، نه شرکت پرتاب؛ آزمون/محصول پیشران سابقهٔ پرتاب مداری محسوب نمی‌شود.
- رکورد تکراری **IHI Aerospace** حذف و ارجاعات آن به رکورد canonical `ihi` منتقل شد.
- **Manastu Space** و **SpaceFields** افزوده شدند. در Manastu، نمایش درون‌مداری Vyom 2U روی POEM‑4، تحویل سخت‌افزار I‑Booster، آزمون صلاحیت Sharanga و توسعهٔ GP‑LAM جدا ثبت شده‌اند؛ هیچ‌یک به‌عنوان پرتابگر یا خدمت پرتاب شمرده نشده است. برای I‑Booster سابقهٔ پرواز فضایی تأییدشده فرض نشده است.
- دربارهٔ **SpaceFields**، گزارش آزمون آتش گرم aerospike در IISc Challakere در ۲۰۲۵ فقط آزمون زمینی است؛ مقدار رانش گزارش‌شده نیز رتبهٔ پروازیِ گواهی‌شده معرفی نشده است.
- ترجمه‌های عربیِ برچسب‌های تازهٔ دسته/نوع پیشران، وضعیت محصول و مادهٔ پیشران تکمیل شد تا نام‌های تازه به fallback عمومی یا متن انگلیسی نریزند.

### دامنهٔ داده

در دادهٔ اصلی ۵۲ رکورد propulsion وجود دارد؛ رکوردهای مرتبط با CASC/AALPT در شمار canonical یک سازمان محسوب می‌شوند. برای اطلاعاتی که سازنده یا منبع عمومی تأیید نکرده، مقدار خالی/نامشخص حفظ شده است؛ تحویل محصول، آزمون زمینی، qualification و کارکرد در مدار چهار وضعیت جدا هستند.

## ۲. سازمان‌ها و نهادهای فضایی

۱۶ رکورد زیر افزوده شدند:

| شناسه | تمایز ثبت‌شده |
|---|---|
| NSAS سنگاپور | نهاد ملی توسعه و هماهنگی بخش فضایی؛ آغاز فعالیت در ۱ آوریل ۲۰۲۶ |
| KASA کرهٔ جنوبی | ادارهٔ دولتی مرکزی فضا، جدا از پژوهشگاه KARI |
| PhilSA فیلیپین | آژانس مرکزی ملی؛ توان پرتابگر به خود آژانس نسبت داده نشده |
| MYSA مالزی | نهاد فضایی و سنجش‌ازدور؛ خدمات دادهٔ ماهواره‌ای پرتاب محسوب نمی‌شوند |
| TASA تایوان | جانشین NSPO؛ فعالیت راکت کاوشی از آمار مداری جدا شده |
| Uzbekcosmos | نهاد دولتی پژوهش/فناوری فضایی و هماهنگی برنامه‌ها |
| Azercosmos | اپراتور ماهواره‌ای دولتی؛ نه شرکت پرتاب موشک و نه وزارتخانهٔ مستقل متعارف |
| GISTDA تایلند | نهاد عمومی داده‌های ماهواره‌ای و مشاهدهٔ زمین، نه اپراتور پرتابگر |
| VNSC ویتنام | مرکز پژوهشی زیرمجموعهٔ VAST، نه آژانس مستقل |
| IN‑SPACe هند | تنظیم‌گر/تسهیل‌گر مشارکت خصوصی، جدا از ISRO |
| کمیتهٔ هوافضای قزاقستان | کمیتهٔ دولتی در ساختار وزارتخانه‌ای، نه آژانس مستقل |
| SPARRSO بنگلادش | سازمان پژوهشی و سنجش‌ازدور، نه آژانس پرتاب مداری |
| INASA / BRIN اندونزی | برنامه/مجرای مشارکت ذیل BRIN؛ استقلال حقوقی جداگانه اثبات نشده |
| BSA بحرین | ثبت محتاطانه؛ منبع عمومی بررسی‌شده به‌تنهایی سند تأسیس مستقل یا وضعیت عملیاتی کامل را ثابت نمی‌کند |
| APSCO | سازمان منطقه‌ای بین‌دولتیِ مبتنی بر معاهده، نه آژانس یک کشور |
| UAE Space Agency | نهاد فدرال سیاست‌گذاری/هماهنگی، جدا از MBRSC مجری مأموریت‌ها |

مختصات نامطمئن برای این رکوردها حدس زده نشده و `null` مانده است. شرح مأموریت‌های شاخص فارسی و عربی نیز اصلاح شد؛ ترجمهٔ عربیِ عمومی و متن فارسیِ انگلیسی‌مانند با توضیح موردی جایگزین شد.

## ۳. شرکت‌های پرتاب

### اصلاحیهٔ ۷ نوامبر ۲۰۲۶: Stellar Kinetics MCT (عمان)

- رکورد شرکت به کشور عمان افزوده شد و به Etlaq پیوند خورد؛ مختصات و دفتر مرکزیِ دقیق حدس زده نشد. گزارش Muscat Daily در ۲۰۲۵ شرکت/مجموعه را بین‌المللی و دارای دفاتر در نیوزیلند، عمان و پرتغال توصیف کرده بود؛ در منابع ۲۰۲۶، اپراتور Stellar Kinetics MCT عمانی معرفی می‌شود. ساختار دقیق حقوقی و مالکیت در داده قطعی نشده است.
- Duqm‑2/Kea‑1: دو تلاش کارزار ژوئیهٔ ۲۰۲۵ پیش از برخاستن متوقف شدند؛ بنابراین نه پرتاب موفق بودند و نه پرواز. آمار مداری شرکت صفرِ تأییدشده است.
- Karman X1 در اکتبر ۲۰۲۶ یک آزمون زیرمداری حدود ۱۰ کیلومتریِ راکت AZAD متعلق به OculloSpace بود؛ Stellar Kinetics MCT اپراتور و شریک مهندسی/ساخت بود، نه مالک برنامهٔ AZAD. Duqm‑1 در دسامبر ۲۰۲۴ نیز راکت Weka از Snowdon Consulting Limited بود، نه Stellar Kinetics.

### آمار و سابقهٔ پرواز

- برای CALT، SAST، ExPace، LandSpace، i‑Space، Galactic Energy، CAS Space، MHI و IAI **مجموع تجمیعیِ سازگار** ساخته نشد؛ مجموعهٔ سوابق، وسیله/اپراتور/دوره‌های متفاوت را ترکیب می‌کند. نتیجه «نامعلوم» است، نه صفر.
- Space Pioneer: یک تلاش مداریِ تأییدشده، Tianlong‑2 در ۲ آوریل ۲۰۲۳؛ آزمون‌های زمینی/زیرمداری جدا هستند.
- Orienspace: نخستین پرتاب دریایی Gravity‑1 در ۱۱ ژانویهٔ ۲۰۲۴، یک تلاش مداری؛ پرتاب دریایی دوبار شمرده نشده است.
- Skyroot: Vikram‑S زیرمداری است؛ Vikram‑1 در ۱۸ ژوئیهٔ ۲۰۲۶ تلاش مداریِ موفق ثبت شده است.
- Agnikul: پرواز SOrTeD در ۲۰۲۴ زیرمداری است؛ تلاش مداری تا تاریخ برش ثبت نشده.
- Space One: سه تلاش مداری KAIROS تا ۵ مارس ۲۰۲۶، هر سه ناموفق؛ تلاش بعدی تا تاریخ برش تأیید نشد.
- Innospace: یک تلاش مداری HANBIT‑Nano از Alcântara در ۲۲ دسامبر ۲۰۲۵، ناموفق؛ پرواز مداری دوم تا تاریخ برش تأیید نشد.
- Hanwha: آمار نمایش‌داده‌شده مربوط به **برنامهٔ Nuri** است، نه سابقهٔ انحصاری Hanwha؛ شرکت سه پرواز نخست را رهبری نکرد. پرواز پنجم در ۷ اکتبر ۲۰۲۶ به مدار رسید، اما یک CubeSat ثانویه جدا نشد؛ این رخداد با شکست وسیله یکی گرفته نشده است.
- Roketsan: پرتاب مداریِ تأییدشده ندارد؛ راکت کاوشی و آزمون فناوری، پرتاب مداری محسوب نمی‌شوند.
- Space Epoch: آزمون بازیابی/بازگشت ۱۲۵ثانیه‌ای در ۲۰۲۵ آزمون فناوری است، نه پرواز مداری.
- Perigee: شکست پرواز زیرمداری Blue Whale 0.1 در ۲۹ دسامبر ۲۰۲۱ ثبت شده؛ چون مجموعهٔ کامل آزمون‌ها تطبیق نشده، شمار زیرمداری کامل ساخته نشده است.
- Honda و Deep Blue: آزمون/هاپر/بازیابی به‌عنوان پرتاب مداری شمرده نشده‌اند. Interstellar Japan نیز تا تاریخ برش تلاش مداریِ تأییدشده‌ای نداشت.

شرکت‌های بازبینی‌شده در این دور شامل CALT، SAST، ExPace، LandSpace، i‑Space، Galactic Energy، Space Pioneer، Orienspace، Deep Blue، CAS Space، Skyroot، Agnikul، MHI، Interstellar Technologies، Space One، Innospace، IAI، Roketsan، Hanwha، Perigee، Space Epoch، EtherealX، Honda، AIO ایران، بخش فضایی نیروی هوافضای سپاه و (در اصلاحیهٔ ۷ نوامبر) Stellar Kinetics MCT عمان بودند. آمار ناسازگار Galactic Energy/Hyperbola‑1 به عدد قطعی تبدیل نشد؛ Hatef‑3 نیز پرتاب‌شده فرض نشده است.

## ۴. پایگاه‌ها و میدان‌های پرتاب

### شش مورد افزوده‌شده

| رکورد | نتیجهٔ ممیزی |
|---|---|
| Hainan commercial | محل تجاری جدید؛ نشانگر از مرکز تقریبی pad علامت‌گذاری شده، نه مختصات نقشه‌برداری‌شدهٔ دقیق |
| Xuhai | ۱۰ مأموریت پژوهشی گزارش‌شدهٔ TASA تا ۱۸ اکتبر ۲۰۲۵؛ نتیجهٔ تک‌تک مأموریت‌ها نامعلوم |
| Jiupeng | میدان آزمون/راکت کاوشی تایوان؛ مجموع کامل عمومی احراز نشد و پایگاه مداری معرفی نمی‌شود |
| Sonmiani | دست‌کم دو پرواز موفق Rehbar در ۱۹۶۲؛ حداقل مستند، نه کل سابقه؛ آمار شکست کامل نامعلوم |
| Pameunguep | فعالیت راکت کاوشی/پژوهشی ثبت شد؛ شمار کاملِ قابل‌تطبیق ساخته نشد |
| Biak | طرح پیشنهادی بندر فضایی؛ صفر پرتاب ثبت‌شده، نه پایگاهی با عملیات جاری |

برای پنج مورد، مختصات نامطمئن `null` است؛ فقط Hainan commercial مختصات تقریبیِ pad دارد. برای Sonmiani فیلد شکست `null` است و رابط آن را «دست‌کم ۲» نشان می‌دهد، نه «۲ از ۲» یا نرخ ۱۰۰٪.

### آمار و رویدادهای اصلاح‌شده

- **Wenchang دولتی:** ۵۱ کل / ۴۸ موفق / ۳ ناموفق از padهای 175 و 176.
- **Hainan commercial:** ۲۵ / ۲۵ / ۰ از padهای 218 و 219. این دو گروه در LL2 در یک location قرار دارند، اما در دادهٔ ORBITA جدا شده‌اند. جمعِ دو گروه: ۷۶ / ۷۳ / ۳.
- شکست Long March‑7A / ChinaSat‑4B در ۱۰ اوت ۲۰۲۶ در تاریخچهٔ Wenchang افزوده شد.
- **Naro:** ۸ / ۵ / ۳ تلاش مداری؛ شمار خام padها ۹ رویداد دارد، چون یک آزمون زیرمداری KSLV‑TLV را هم شامل می‌شود. تفکیک pad: LC‑2/pad 192 شش رویداد و LC‑1/pad 64 سه رویداد؛ آمار مداریِ دستی، رویداد زیرمداری را کنار می‌گذارد.
- پرواز چهارم Nuri در ۲۷ نوامبر ۲۰۲۵ و پرواز پنجم در ۷ اکتبر ۲۰۲۶ در تاریخچهٔ Naro ثبت شد؛ در پرواز پنجم وسیله به مدار رسید ولی یک ماهواره جدا نشد.
- **Taiki:** ۷ / ۳ / ۴ با `stats_kind=suborbital`، نه آمار مداری.
- **Jeju:** شکست پرواز Blue Whale 0.1 در ۲۹ دسامبر ۲۰۲۱ حفظ شد؛ رویداد ۱۳ اکتبر ۲۰۲۴ که آزمون زمینی/بارج بود به‌عنوان پرواز ثبت نمی‌شود.

## اصلاح رابط و ابزارهای داده

- در آمار شرکت‌های پرتاب، `null` و مقدار خالی به «—» تبدیل می‌شوند؛ صفر فقط وقتی صفر واقعیِ ثبت‌شده است نمایش داده می‌شود. تعداد ناوگان فعال از طول آرایه حدس زده نمی‌شود.
- پیش‌فرض‌های حدسی ۹۵٪/۱۰۰٪، دو مرحله، «یک‌بارمصرف»، Operational و «Launch Vehicle» از رندر مشترک حذف شدند؛ scope آمار در رندر فارسی/انگلیسی نیز کنار نسخهٔ عربی دیده می‌شود.
- پایگاه بدون `stats_kind` دیگر به‌صورت پیش‌فرض مداری برچسب نمی‌خورد؛ مدار نامعلوم در تاریخچه نیز LEO فرض نمی‌شود. اسکریپت همگام‌سازی تاریخچه برای سایت بدون نوع آمار، آمار عددی را خودکار تغییر نمی‌دهد؛ تاریخچهٔ رواییِ واجد شرایط جدا می‌تواند حفظ شود.
- ابزار بذرپاشی از چند pad برای هر site پشتیبانی می‌کند؛ Wenchang و Hainan commercial هرکدام از دو pad جمع می‌شوند.
- cache token در `index.html` پس از اصلاحیه به `20261107stellarkinetics1` تغییر کرد. هیچ commit، push یا deploy انجام نشد.

## منابع منتخب

### پایگاه‌ها و آمار پرتاب

- TASA، Xuhai و راکت‌های پژوهشی: [صفحهٔ مأموریت TASA](https://www.tasa.org.tw/en-US/missions/detail/f0de077e-8565-4481-b87e-39493b9cf986)، [اعلامیهٔ TASA](https://www.tasa.org.tw/zh-TW/announcements/detail/71c5e389-3248-4d04-a0f7-80e79159b04d)
- Jiupeng: [Taipei Times، ۲۷ مارس ۲۰۲۵](https://www.taipeitimes.com/News/taiwan/archives/2025/03/27/2003834152)
- Sonmiani: [تاریخچهٔ SUPARCO](http://www.suparco.gov.pk/pages/history.asp)
- Pameunguep و راکت‌های RX: [مقالهٔ BRIN](https://ejournal.brin.go.id/ijoa/article/view/12835)، [مقالهٔ BRIN (PDF)](https://ejournal.brin.go.id/ijoa/article/download/12270/9579)
- Biak: [گزارش Jubi](https://jubi.id/nasional-internasional/2026/siapa-yang-berkomitmen-dalam-rencana-pembangunan-bandar-antariksa-di-biak/)، [تحلیل Devpolicy](https://devpolicy.org/biaks-spaceport-future-between-opportunity-and-uncertainty-20260810/)
- Hainan commercial: [Xinhua، نخستین پرتاب تجاری در ۳۰ نوامبر ۲۰۲۴](https://english.news.cn/20241130/f2c273e8f706491fa7b346700a3243f1/c.html)
- آمار و شناسه‌های padها: [LL2، location Naro](https://ll.thespacedevs.com/2.2.0/location/9/?format=json) و [LL2، پرتاب ۲۵ اکتبر ۲۰۲۶](https://ll.thespacedevs.com/2.2.0/launch/6b95bcc8-1f88-4539-84fe-f63630138766/?format=json)
- شکست Long March‑7A: [Xinhua، ۱۰ اوت ۲۰۲۶](https://english.news.cn/20260810/092535e6a2bb414082f9cd4cde22a2a2c.html)
- پروازهای Nuri: [KASA، پرتاب چهارم](https://www.kasa.go.kr/bbs/BBSMSTR_000000000041/view.do?nttId=B000000002451Qi6kR4)، [Xinhua، پرواز پنجم](https://english.news.cn/20261007/99bd757038684ff8b19ee73c6cc8a4bd/c.html)، [DongA Science، CubeSat جدا‌نشده](https://www.dongascience.com/en/news/80238)

### شرکت‌های پرتاب و پیشران

- Space One/KAIROS: [Reuters، ۵ مارس ۲۰۲۶](https://www.reuters.com/science/japans-private-rocket-maker-space-one-fails-third-kairos-launch-2026-03-05/)
- Innospace: [SpaceNews، بررسی شکست HANBIT‑Nano](https://spacenews.com/innospace-completes-investigation-into-hanbit-nano-launch-failure/)
- Skyroot: [Satellite Today، ۲۰ ژوئیهٔ ۲۰۲۶](https://www.satellitetoday.com/launch/2026/07/20/skyroot-aerospace-makes-history-for-india-with-first-launch-success/)
- Agnikul/SOrTeD: [Orbital Today، ۳۰ مه ۲۰۲۴](https://orbitaltoday.com/2024/05/30/indian-startup-agnikul-cosmos-successfully-launched-its-agnibaan-sorted-rocket/)
- Space Epoch: [Reuters، آزمون سامانهٔ بازیابی](https://www.reuters.com/science/chinas-space-epoch-conducts-key-test-reusable-rocket-ambitions-2025-05-29/)
- Honda: [Honda Global، پژوهش پروازپذیری مجدد](https://global.honda/en/topics/2025/c_2025-06-17ceng.html)
- Delta V: [دربارهٔ شرکت](https://www.deltav.com.tr/en/about-us)؛ Manastu: [محصولات](https://manastuspace.com/products)؛ SpaceFields: [فناوری](https://spacefields.in/technology/) و [دربارهٔ ما](https://spacefields.in/about-us/)
- Roketsan: [مرور نقش در برنامهٔ فضایی ترکیه](https://www.asianmilitaryreview.com/2021/08/an-important-task-for-roketsan-in-turkeys-space-journey/)
- عمان / Duqm و Stellar Kinetics: [Etlaq، Duqm‑2 / Kea‑1](https://etlaq.om/launches/duqm-2/)، [Oman Observer، لغو تلاش‌ها](https://www.omanobserver.om/article/1173453/oman/transport/duqm-2-launch-aborted-due-to-technical-glitch)، [Muscat Daily، دفاتر بین‌المللی (۲۰۲۵)](https://www.muscatdaily.com/2025/07/02/etlaq-spaceport-in-duqm-to-start-operating-by-2027/)، [وزارت خارجهٔ عمان، Karman X1](https://www.fm.gov.om/en/58792/)، [اطلاعیهٔ OculloSpace دربارهٔ AZAD/Karman X1](https://www.prnewswire.com/apac/news-releases/singapores-space-sme-ocullospace-successfully-flies-first-rocket-azad-the-dreamer-from-oman-302903258.html)، [Etlaq، Duqm‑1 / Weka از Snowdon Consulting](https://www.etlaq.om/launches/duqm-1)

این گزارش خلاصهٔ ممیزی داده و کد است؛ «فاقد مجموع تأییدشده» به معنی «هیچ فعالیتی نداشته» نیست، و آمارهای ناقص/محدود باید همراه scope خود خوانده شوند.
