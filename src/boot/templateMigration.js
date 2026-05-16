// One-shot cleanup for browsers that cached an old pre-fix version of the
// built-in flight template. Older saves were missing a blank line between the
// itinerary heading and the first flight block, which made the heading repeat
// for every flight when expanded. Same browser also shipped older formatting
// (parens around seat, plain-text class line, hardcoded direction string),
// so we wipe the cached flight templates unconditionally on first run and let
// the in-code defaults take over.
//
// Runs BEFORE templateSync's bootstrap so the bootstrap's "local-only → push
// to cloud" step doesn't re-upload the stale copy to Supabase.
//
// Uses a localStorage flag so it only runs once per browser. A subsequent
// legitimate edit by the user won't be wiped on later loads.

const MIGRATION_FLAG = "templateMigration.flightCleanup.v1";

const STALE_FLIGHT_KEYS = [
  "customTemplate:flight:he",
  "customTemplate:flight:en",
  "customTemplate:flight:fr"
];

export default () => {
  try {
    if (window.localStorage.getItem(MIGRATION_FLAG)) return;
    for (const k of STALE_FLIGHT_KEYS) {
      if (window.localStorage.getItem(k) !== null) {
        window.localStorage.removeItem(k);
        // eslint-disable-next-line no-console
        console.info("[template migration] cleared cached flight template:", k);
      }
    }
    window.localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
  } catch (e) {
    // localStorage unavailable — nothing to do
  }
};
