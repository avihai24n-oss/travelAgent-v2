// One-time cleanup for browsers that cached an old, pre-fix version of the
// built-in flight template in localStorage. The bug pattern: the
// "מסלול הטיסות 🌍" / "Itinerary 🌍" / "Itinéraire 🌍" heading immediately
// followed by the first flight block with no blank line between them, which
// makes paragraph-based block expansion treat the heading as part of the
// block and repeat it for every flight. Newer builds ship a corrected default
// with a blank line, but a saved copy in localStorage (also mirrored to the
// cloud) keeps winning until it's wiped.
//
// This boot file runs BEFORE templateSync so the bootstrap pull/push round
// doesn't re-upload the stale local copy to the cloud.

const STALE_FLIGHT_TEMPLATES = [
  { key: "customTemplate:flight:he", needle: /\*מסלול הטיסות 🌍\*\n\*/ },
  { key: "customTemplate:flight:en", needle: /\*Itinerary 🌍\*\n\*/ },
  { key: "customTemplate:flight:fr", needle: /\*Itinéraire 🌍\*\n\*/ }
];

export default () => {
  try {
    for (const { key, needle } of STALE_FLIGHT_TEMPLATES) {
      const val = window.localStorage.getItem(key);
      if (val && needle.test(val)) {
        window.localStorage.removeItem(key);
        // eslint-disable-next-line no-console
        console.info("[template migration] cleared stale localStorage:", key);
      }
    }
  } catch (e) {
    // localStorage unavailable (private mode / quota) — nothing to do
  }
};
