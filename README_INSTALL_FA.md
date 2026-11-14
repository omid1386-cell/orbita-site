# ORBITA — Step 2: Next Landing Announcement

## What this update adds
A second compact announcement bar appears directly below the existing **Next Launch** ticker. It is labeled **Next Landing** and displays the nearest future dated landing/recovery entry from ORBITA's existing `data/upcoming_landings.json` snapshot.

The bar can display:
- Mission name
- Landing/recovery location
- Scheduled date and, when available, time
- Countdown to the planned date/time
- Scheduling status (Scheduled / To be confirmed / Queued)
- Operator schedule or webcast link, when present

If a `site_id` matches a recovery-site record, clicking the mission name flies to that site on the map and opens its recovery dossier.

## Data behavior and accuracy
- This update reuses the same `data/upcoming_landings.json` file already fetched by the current app and shown in the recovery-site dossier tabs.
- It selects the earliest future entry that has a usable date. Undated rows are not presented as the next landing.
- Cancelled, aborted, scrubbed, or failed entries are excluded.
- A full UTC timestamp or explicit `time_utc` can produce a countdown. Minute/second precision may show a detailed countdown; day/hour or date-only precision remains approximate.
- Date-only entries remain eligible through the stated calendar day and are never presented as a second-accurate countdown.
- The bar is a schedule announcement, not live tracking and not confirmation that touchdown has occurred. Schedules can change.
- The banner is hidden if the snapshot is unavailable or contains no future dated landing.

**Important:** The source ZIP supplied for this update did not contain `data/upcoming_landings.json`; the base app already references that file, so this package intentionally does not invent or replace its mission data. Keep the existing file in the repository. If that file is missing from the live repository, the new bar will remain hidden until a reviewed snapshot is added at that exact path.

## Files to upload
Replace these three files in the repository:
1. `assets/js/app.js`
2. `assets/css/app.css`
3. `index.html`

Do not replace or delete any other data files. In particular, preserve `data/upcoming_landings.json`, `data/recovery_sites.json`, all company data files, and the other existing datasets.

The HTML cache version is bumped so browsers fetch the new JavaScript and CSS.

## GitHub web upload (no VS Code terminal required)
1. Back up the current three files.
2. Open each matching path in GitHub.
3. Replace the file contents with the corresponding file in this package, keeping the same path and filename.
4. Commit the three file changes.
5. Wait for the Render deployment to finish.
6. Open the site and hard-refresh (`Ctrl + F5`).

## Git patch option
The patch is generated against the Step 1 app.js and the original 14-category package's index.html and app.css:
```bash
git apply --check ORBITA_STEP2_NEXT_LANDING_ANNOUNCEMENT.patch
```
If the check passes:
```bash
git apply ORBITA_STEP2_NEXT_LANDING_ANNOUNCEMENT.patch
```
Do not force-apply if the check fails. Use the complete replacement files after reconciling any newer local changes.

## Tests run
- `node --check assets/js/app.js`
- `node tests/country_profile_step1.test.cjs`
- `node tests/next_landing_announcement.test.cjs`

All passed in the prepared package.
