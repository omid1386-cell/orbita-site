# ORBITA — Step 1: Country profile cleanup and precise country-name display

## Included changes
1. Removed the explanatory statistics note under the 14-category country-profile summary in Persian, English, and Arabic. The statistics, counts, category cards, and tabs are unchanged.
2. Country-name display is now field-specific:
   - Country profile heading: Persian `فلسطین اشغالی`, English `Occupied Palestine`, Arabic `فلسطين المحتلة`.
   - Country fields for records belonging to canonical country `Israel` use the matching localized country display label.
   - Explicit prose phrase `کشور اسرائیل` is displayed as `فلسطین اشغالی` in Persian.
   - Organization/company names and official names remain unchanged, including `سازمان فضایی اسرائیل`, `صنایع هوافضای اسرائیل`, `Israel Space Agency`, and `Israel Aerospace Industries`.
3. Updated `country_fa` for the Israel-associated site record in `data/sites.json` to `فلسطین اشغالی`. The canonical `country` value remains `Israel`.

## What is not changed
- Canonical country identifiers, ISO codes, IDs, coordinates, matching/filtering logic, and source URLs.
- Organization/company names or their official English names.
- Other countries' labels and data.
- Statistics and the 14 category counts.

## Install without terminal (GitHub web interface)
1. Back up the current `assets/js/app.js` and `data/sites.json`.
2. Replace `assets/js/app.js` with the file in this package at the same path.
3. Replace `data/sites.json` with the file in this package at the same path.
4. Commit the changes to GitHub and wait for deployment.
5. Hard-refresh the site (`Ctrl+F5`) and check a country profile, an Israel-associated organization/company profile, and the Israel-associated site detail.

## Install with Git
The patch is intended for the app.js version from the previous ORBITA all-profile name-fix package and the original `data/sites.json` included in the 14-category Chabahar ZIP. In the repository root:
```bash
git apply --check ORBITA_STEP1_COUNTRY_PROFILE_FIX.patch
```
If check passes:
```bash
git apply ORBITA_STEP1_COUNTRY_PROFILE_FIX.patch
```
If check fails, do not force it; use the two complete files from this package after reconciling any newer local edits.

## Validation
JavaScript syntax and focused behavior tests are included in `tests/`.
