// Localized meal-preference labels keyed by Amadeus SSR meal code.
//
// Source:
//   - Amadeus "MEAL CODES IN SSR" reference screens (AVML…VOML).
//   - Glatt-kosher additions provided manually by Gad (SKML / KCML / KFML).
//
// Usage:
//   When a PNR carries an SSR meal code (e.g. "SSR KSML LY HK1 …"), the
//   parser pulls the 4-letter code and the renderer surfaces the matching
//   localized name in the preview's "Meal preference" section, in the
//   currently selected preview language.
//
//   Codes not in this table fall back to the raw code (e.g. "XYZW") so the
//   agent still sees something actionable and can decide whether to add it
//   to this file.

export const MEAL_CODES = {
  // Per-airline-specific notes (LY / LH / UA) are retained in `en` so the
  // agent has the same context the GDS screen shows; HE / FR keep clean
  // wording. Carrier suffixes don't change the dish, only who serves it.

  AVML: {
    he: "ארוחה הינדית צמחונית",
    en: "Vegetarian Hindu Meal",
    fr: "Repas végétarien hindou"
  },
  BBML: {
    he: "ארוחת תינוק",
    en: "Baby Meal",
    fr: "Repas pour bébé"
  },
  BLML: {
    he: "ארוחה תפלה",
    en: "Bland Meal",
    fr: "Repas fade"
  },
  CHML: {
    he: "ארוחת ילדים",
    en: "Child Meal",
    fr: "Repas enfant"
  },
  CNML: {
    he: "ארוחת עוף",
    en: "Chicken Meal (LY specific)",
    fr: "Repas au poulet"
  },
  DBML: {
    he: "ארוחה לחולי סוכרת",
    en: "Diabetic Meal",
    fr: "Repas diabétique"
  },
  FPML: {
    he: "צלחת פירות",
    en: "Fruit Platter",
    fr: "Plateau de fruits"
  },
  FSML: {
    he: "ארוחת דגים",
    en: "Fish Meal",
    fr: "Repas au poisson"
  },
  GFML: {
    he: "ארוחה ללא גלוטן",
    en: "Gluten-Intolerant Meal",
    fr: "Repas sans gluten"
  },
  HNML: {
    he: "ארוחה הינדית (לא צמחונית)",
    en: "Hindu Meal (Non-Vegetarian)",
    fr: "Repas hindou (non végétarien)"
  },
  IVML: {
    he: "ארוחה הודית צמחונית",
    en: "Indian Vegetarian Meal",
    fr: "Repas végétarien indien"
  },
  JPML: {
    he: "ארוחה יפנית",
    en: "Japanese Meal",
    fr: "Repas japonais"
  },
  KSML: {
    he: "ארוחה כשרה",
    en: "Kosher Meal",
    fr: "Repas casher"
  },
  LCML: {
    he: "ארוחה דלת קלוריות",
    en: "Low Calorie Meal",
    fr: "Repas hypocalorique"
  },
  LFML: {
    he: "ארוחה דלת שומן",
    en: "Low Fat Meal",
    fr: "Repas pauvre en graisses"
  },
  LSML: {
    he: "ארוחה דלת מלח",
    en: "Low Salt Meal",
    fr: "Repas pauvre en sel"
  },
  MOML: {
    he: "ארוחה מוסלמית",
    en: "Muslim Meal",
    fr: "Repas musulman"
  },
  NFML: {
    he: "ארוחה ללא דגים",
    en: "No Fish Meal (LH specific)",
    fr: "Repas sans poisson"
  },
  NLML: {
    he: "ארוחה ללא לקטוז",
    en: "Lactose-Free Meal",
    fr: "Repas sans lactose"
  },
  OBML: {
    he: "ארוחת אובנטו יפנית",
    en: "Japanese Obento Meal (UA specific)",
    fr: "Repas obento japonais"
  },
  RVML: {
    he: "ארוחה צמחונית גולמית",
    en: "Raw Vegetarian Meal",
    fr: "Repas végétarien cru"
  },
  SFML: {
    he: "ארוחת פירות ים",
    en: "Seafood Meal",
    fr: "Repas fruits de mer"
  },
  SPML: {
    he: "ארוחה מיוחדת",
    en: "Special Meal (specify food)",
    fr: "Repas spécial"
  },
  VGML: {
    he: "ארוחה טבעונית",
    en: "Vegan Meal",
    fr: "Repas végétalien"
  },
  VJML: {
    he: "ארוחה ג'יין צמחונית",
    en: "Jain Vegetarian Meal",
    fr: "Repas végétarien jaïn"
  },
  VLML: {
    he: "ארוחה צמחונית חלבית-ביצית",
    en: "Lacto-Ovo Vegetarian Meal",
    fr: "Repas végétarien lacto-ovo"
  },
  VOML: {
    he: "ארוחה צמחונית מזרחית",
    en: "Oriental Vegetarian Meal",
    fr: "Repas végétarien oriental"
  },

  // Glatt-kosher tier (LY-specific, provided manually). Each is a stricter
  // sub-class of the corresponding base meal — agent uses these when the
  // passenger asked for Glatt rather than the generic kosher equivalent.
  SKML: {
    he: "ארוחה גלאט כשרה",
    en: "Glatt Kosher Meal",
    fr: "Repas casher glatt"
  },
  KCML: {
    he: "ארוחת ילדים גלאט כשרה",
    en: "Glatt Kosher Child Meal",
    fr: "Repas enfant casher glatt"
  },
  KFML: {
    he: "ארוחת דגים גלאט כשרה",
    en: "Glatt Kosher Fish Meal",
    fr: "Repas poisson casher glatt"
  }
};

// Returns the meal name in the requested preview language.
//
//   lang === "he" → Hebrew label.
//   lang === "en" / "fr" → English / French label.
//
// Falls back through:
//   1. requested-language entry from MEAL_CODES.
//   2. English entry (if Hebrew/French missing).
//   3. the raw code itself (so an unknown code like "ZZML" stays visible
//      in the preview rather than disappearing silently).
//   4. empty string when no input was given.
export function getLocalizedMealName(code, lang) {
  if (!code) return "";
  const key = String(code).toUpperCase().trim();
  const entry = MEAL_CODES[key];
  if (entry) {
    if (entry[lang]) return entry[lang];
    if (entry.en) return entry.en;
  }
  return key;
}

// Convenience: returns the list of every code we recognise — handy for
// debug screens / admin "show all known codes" features later on.
export function listKnownMealCodes() {
  return Object.keys(MEAL_CODES);
}