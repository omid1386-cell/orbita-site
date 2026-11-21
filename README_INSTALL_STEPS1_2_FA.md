# راهنمای نصب بسته ORBITA — گام‌های ۱ و ۲

این بسته **فقط هفت فایل جدید** به مخزن اضافه می‌کند. هیچ فایل موجودی را جایگزین نمی‌کند:

1. `tools/upcoming_event_contract.py`
2. `tools/audit_upcoming_events.py`
3. `tools/refresh_global_launches.py`
4. `tools/test_global_launches.py`
5. `tests/upcoming_global.test.cjs`
6. `.github/workflows/refresh-global-launches.yml`
7. `data/upcoming_global.json`

دو فایل مستنداتی و گزارش آزمون نیز فقط برای مطالعه در بسته وجود دارند.

## بارگذاری

- ساختار پوشه‌ها را حفظ کنید؛ هفت فایل بالا را در همان مسیرها به مخزن فعلی اضافه کنید.
- Commit/Push کنید. اگر شاخهٔ اصلی GitHub حفاظت شده باشد، مجوز Push ربات گردش‌کار باید متناسب با سیاست مخزن تنظیم شود.
- در صفحه **Actions**، گردش‌کار `refresh-global-launches-120-days` را انتخاب کنید و `Run workflow` بزنید.
- پس از اجرای موفق، فایل `data/upcoming_global.json` باید دارای `coverage_status: complete_from_source_at_fetch_time` و `count` مثبت باشد. در صورت خطای API، فایل قبلی باقی می‌ماند؛ گزارش خطا را در Actions بررسی کنید.
- تست مستقل: `python -m unittest discover -s tools -p 'test_global_launches.py' -v` و `node tests/upcoming_global.test.cjs`.

## مرزبندی

- این بسته **فیلترهای ظاهری** را هنوز نمی‌سازد (گام ۳ به بعد).
- دادهٔ موجود شناسنامه‌ها و نسخهٔ فعلی نقشه دست‌نخورده مانده است.
- گردش‌کار جدید برای محدودیت درخواست LL2 مستقل و با فاصله از گردش‌کار قبلی تنظیم شده است؛ اجرای دستی هم‌زمان دو گردش‌کار ممکن است با خطای 429 روبه‌رو شود و در آن صورت دادهٔ قبلی حفظ می‌شود.
- تغییر در `data/upcoming_global.json` پس از اولین اجرای واقعی صرفاً از محل LL2 انجام می‌شود؛ هرگز مقدار `count: 0` فایل ابتدایی را به معنی «هیچ پرتابی وجود ندارد» به کاربر نشان ندهید.
