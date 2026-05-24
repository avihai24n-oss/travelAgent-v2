// Per-airline RBD (Reservation Booking Designator) → cabin class mapping.
//
// Each top-level key is an airline IATA code (2 chars, uppercase).
// Each value is an object whose keys are the cabin-class identifiers used by
// the rest of the app (must match the keys in CLASSES_TYPE_MAP / i18n):
//   "First Cl."       → ראשונה / First / Première
//   "Business Cl."    → עסקים / Business / Affaires
//   "Premium Eco Cl." → פרימיום / Premium Eco
//   "Economy Cl."     → תיירים / Economy / Économique
//
// Lookup order matters: classes are iterated in object-insertion order, and
// the first class that contains the RBD letter wins. Always list classes from
// the highest cabin down to Economy so a letter that legitimately appears in
// two cabins for the same carrier (e.g. TK "P" — Business in some fares and
// Economy in others) resolves to the higher cabin.
//
// Adding a new carrier:
//   1) Add a new IATA key.
//   2) List ONLY single-letter RBDs. Multi-character codes (e.g. "JN", "PZ",
//      "XN") used for award/upgrade inventory are skipped because the Amadeus
//      parser reads exactly one character from position [3].
//   3) If a carrier doesn't have a Premium Eco or First cabin, omit that key.
//
// If a carrier is absent from this map, or the RBD letter isn't listed in any
// of the carrier's cabins, the parser leaves flightClass empty and the
// renderer falls back to the language-appropriate placeholder
// ("מחלקת תיירים/עסקים/פרמיום" / "Economy/Premium/Business Class").

export const AIRLINE_RBD = {
  // EL AL
  LY: {
    "Business Cl.":    ["C", "I", "D", "Z", "J", "X"],
    "Premium Eco Cl.": ["W", "Q", "B", "P", "A"],
    "Economy Cl.":     ["Y", "M", "K", "V", "S", "L", "H", "N", "G", "O", "U", "E"],
  },

  // Lufthansa
  LH: {
    "First Cl.":       ["F", "A"],
    "Business Cl.":    ["J", "C", "D", "Z", "P"],
    "Premium Eco Cl.": ["G", "E", "N"],
    "Economy Cl.":     ["Y", "B", "M", "U", "H", "Q", "V", "W", "S", "T", "L", "K"],
  },

  // Swiss
  LX: {
    "First Cl.":       ["F", "A"],
    "Business Cl.":    ["J", "C", "D", "Z", "P"],
    "Premium Eco Cl.": ["G", "E", "N"],
    "Economy Cl.":     ["Y", "B", "M", "U", "H", "Q", "V", "W", "S", "T", "L", "K"],
  },

  // Turkish Airlines — NOTE: "P" appears in both Business and Economy in the
  // source data. Business is listed first, so P resolves to Business.
  TK: {
    "Business Cl.": ["J", "C", "D", "K", "Z", "P"],
    "Economy Cl.":  ["Y", "B", "M", "H", "S", "E", "Q", "A", "O", "T", "L", "V", "U"],
  },

  // Air France
  AF: {
    "First Cl.":       ["F", "A"],
    "Business Cl.":    ["J", "C", "D", "I", "Z", "O"],
    "Premium Eco Cl.": ["W", "S", "A"],
    "Economy Cl.":     ["Y", "B", "M", "U", "K", "H", "L", "Q", "T", "E", "N", "R", "V", "X"],
  },

  // KLM (same fare structure as AF in the source table)
  KL: {
    "First Cl.":       ["F", "A"],
    "Business Cl.":    ["J", "C", "D", "I", "Z", "O"],
    "Premium Eco Cl.": ["W", "S", "A"],
    "Economy Cl.":     ["Y", "B", "M", "U", "K", "H", "L", "Q", "T", "E", "N", "R", "V", "X"],
  },

  // Delta Air Lines
  DL: {
    "Business Cl.":    ["J", "C", "D", "I", "Z"],
    "Premium Eco Cl.": ["P", "A", "G"],
    "Economy Cl.":     ["W", "S", "Y", "B", "M", "H", "Q", "K", "L", "U", "T", "X", "V"],
  },

  // British Airways
  BA: {
    "First Cl.":       ["F", "A"],
    "Business Cl.":    ["J", "C", "D", "R", "I"],
    "Premium Eco Cl.": ["W", "E", "T"],
    "Economy Cl.":     ["Y", "B", "H", "K", "M", "L", "V", "S", "N", "Q", "O", "G"],
  },

  // Qatar Airways
  QR: {
    "First Cl.":    ["F", "A"],
    "Business Cl.": ["J", "C", "D", "I", "R", "P"],
    "Economy Cl.":  ["Y", "B", "H", "M", "K", "L", "V", "S", "N", "Q", "O", "T"],
  },

  // Emirates
  EK: {
    "First Cl.":       ["F", "A", "Z"],
    "Business Cl.":    ["J", "C", "I", "O"],
    "Premium Eco Cl.": ["W"],
    "Economy Cl.":     ["Y", "E", "B", "M", "H", "K", "U", "L", "T", "Q", "V", "X", "N"],
  },

  // United Airlines (Polaris = Business). Multi-letter award/upgrade codes
  // (JN, IN, PZ, XN) are intentionally omitted — parser reads a single letter.
  UA: {
    "Business Cl.":    ["J", "C", "D", "Z", "P"],
    "Premium Eco Cl.": ["O", "A", "R"],
    "Economy Cl.":     ["Y", "B", "M", "E", "U", "H", "Q", "V", "W", "S", "T", "L", "K", "G", "N"],
  },

  // Iberia
  IB: {
    "Business Cl.":    ["J", "C", "D", "I", "R"],
    "Premium Eco Cl.": ["W", "E", "T"],
    "Economy Cl.":     ["Y", "B", "H", "K", "M", "L", "V", "S", "N", "O", "Q"],
  },

  // ITA Airways
  AZ: {
    "Business Cl.":    ["J", "C", "D", "I", "Z"],
    "Premium Eco Cl.": ["W", "P"],
    "Economy Cl.":     ["Y", "B", "M", "H", "K", "V", "T", "Q", "N", "X", "L"],
  },

  // Austrian Airlines
  OS: {
    "Business Cl.":    ["J", "C", "D", "Z", "P"],
    "Premium Eco Cl.": ["G", "E", "N"],
    "Economy Cl.":     ["Y", "B", "M", "U", "H", "Q", "V", "W", "S", "T", "L", "K"],
  },
};

// Resolves an (IATA, RBD letter) pair to a cabin-class key. Returns null if
// the airline isn't mapped, or if the letter isn't listed for that airline.
// Callers should treat null as "unknown" and fall back to the placeholder.
export function resolveFlightClass(airlineIATA, rbdLetter) {
  if (!airlineIATA || !rbdLetter) return null;
  const carrier = AIRLINE_RBD[airlineIATA.toUpperCase()];
  if (!carrier) return null;
  const letter = String(rbdLetter).toUpperCase();
  for (const cabinKey of Object.keys(carrier)) {
    if (carrier[cabinKey].indexOf(letter) !== -1) return cabinKey;
  }
  return null;
}
