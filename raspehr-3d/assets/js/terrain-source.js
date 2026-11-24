/* RASPEHR default: remote AWS tiles. Run tools/fetch_dem_z2.py to host them locally.
 * In self-hosted mode this file is rewritten to assets/dem/terrarium/.
 * Do not claim the DEM is available offline until the downloader has succeeded. */
window.RASPEHR_TERRAIN_URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/';
