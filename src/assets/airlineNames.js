// Localized airline names keyed by 2-letter IATA code.
//
// Hebrew: localized name (when the preview language is Hebrew).
// English/French: keep the original English brand name.
//
// Flight numbers (LY543, IB7714, AF1234, ...) are NEVER translated — only the
// airline display name is.
//
// For airlines not listed here, the renderer falls back to the English name
// from src/assets/airlines_big.js so the preview still works correctly.

export const AIRLINE_NAMES = {
  // Israeli carriers
  LY: { he: "אל על", en: "El Al" },
  "6H": { he: "ישראייר", en: "Israir" },
  IZ: { he: "ארקיע", en: "Arkia" },

  // European flag carriers
  AF: { he: "אייר פראנס", en: "Air France" },
  BA: { he: "בריטיש איירווייז", en: "British Airways" },
  LH: { he: "לופטהנזה", en: "Lufthansa" },
  KL: { he: "ק.ל.מ.", en: "KLM" },
  LX: { he: "סוויס", en: "SWISS" },
  OS: { he: "אוסטריאן איירליינס", en: "Austrian Airlines" },
  AZ: { he: "אי.טי.אי. איירוויז", en: "ITA Airways" },
  AY: { he: "פינאייר", en: "Finnair" },
  IB: { he: "איבריה", en: "Iberia" },
  TP: { he: "טאפ אייר פורטוגל", en: "TAP Air Portugal" },
  A3: { he: "אגיאן איירליינס", en: "Aegean Airlines" },
  TK: { he: "טורקיש איירליינס", en: "Turkish Airlines" },
  LO: { he: "LOT פוליש איירליינס", en: "LOT Polish Airlines" },
  SN: { he: "בריסלס איירליינס", en: "Brussels Airlines" },
  SK: { he: "סאס", en: "SAS" },
  LG: { he: "לוקסאייר", en: "Luxair" },
  BT: { he: "אייר בלטיק", en: "airBaltic" },
  OK: { he: "צ'כיה איירליינס", en: "Czech Airlines" },
  RO: { he: "טארום", en: "TAROM" },

  // European low-cost
  W6: { he: "וויז אייר", en: "Wizz Air" },
  FR: { he: "ריינאייר", en: "Ryanair" },
  U2: { he: "איזיג'ט", en: "easyJet" },
  HV: { he: "טרנסביה", en: "Transavia" },
  VY: { he: "ויולינג", en: "Vueling" },
  DY: { he: "נורווגיאן", en: "Norwegian Air Shuttle" },
  EW: { he: "יורווינגס", en: "Eurowings" },
  PC: { he: "פגסוס", en: "Pegasus" },
  XQ: { he: "סאן אקספרס", en: "SunExpress" },
  WK: { he: "אדלוויס אייר", en: "Edelweiss Air" },
  OU: { he: "קרואטיה איירליינס", en: "Croatia Airlines" },
  JU: { he: "אייר סרביה", en: "Air Serbia" },

  // North America
  AA: { he: "אמריקן איירליינס", en: "American Airlines" },
  DL: { he: "דלתא", en: "Delta Air Lines" },
  UA: { he: "יונייטד", en: "United Airlines" },
  B6: { he: "ג'טבלו", en: "JetBlue" },
  AS: { he: "אלסקה איירליינס", en: "Alaska Airlines" },
  WN: { he: "סאות'ווסט", en: "Southwest Airlines" },
  AC: { he: "אייר קנדה", en: "Air Canada" },
  NK: { he: "ספיריט", en: "Spirit Airlines" },
  F9: { he: "פרונטיר", en: "Frontier Airlines" },
  TS: { he: "אייר טרנסאט", en: "Air Transat" },

  // Gulf / Middle East
  EK: { he: "אמירייטס", en: "Emirates" },
  EY: { he: "אתיחאד איירווייז", en: "Etihad Airways" },
  QR: { he: "קטאר איירווייז", en: "Qatar Airways" },
  MS: { he: "איגיפט אייר", en: "EgyptAir" },
  RJ: { he: "רויאל ג'ורדניאן", en: "Royal Jordanian" },
  WY: { he: "עומאן אייר", en: "Oman Air" },
  GF: { he: "גאלף אייר", en: "Gulf Air" },
  SV: { he: "סעודיה", en: "Saudia" },
  KU: { he: "כוויית איירווייז", en: "Kuwait Airways" },
  G9: { he: "אייר ערביה", en: "Air Arabia" },

  // Asia / Pacific
  SQ: { he: "סינגפור איירליינס", en: "Singapore Airlines" },
  CX: { he: "קת'יי פסיפיק", en: "Cathay Pacific" },
  NH: { he: "אנא", en: "ANA" },
  JL: { he: "ג׳אל איירליינס", en: "Japan Airlines" },
  KE: { he: "קוריאן אייר", en: "Korean Air" },
  OZ: { he: "אסיאנה", en: "Asiana Airlines" },
  CA: { he: "אייר צ׳יינה", en: "Air China" },
  CZ: { he: "צ׳יינה סאוזרן", en: "China Southern" },
  MU: { he: "צ׳יינה איסטרן", en: "China Eastern" },
  BR: { he: "איווה אייר", en: "EVA Air" },
  CI: { he: "צ׳יינה איירליינס", en: "China Airlines" },
  TG: { he: "תאי איירווייז", en: "Thai Airways" },
  VN: { he: "ויטנאם איירליינס", en: "Vietnam Airlines" },
  PR: { he: "פיליפינס איירליינס", en: "Philippine Airlines" },
  MH: { he: "מלזיה איירליינס", en: "Malaysia Airlines" },
  GA: { he: "גארודה אינדונזיה", en: "Garuda Indonesia" },
  HU: { he: "היינאן איירליינס", en: "Hainan Airlines" },
  PG: { he: "בנגקוק איירווייז", en: "Bangkok Airways" },

  // Russia / CIS
  SU: { he: "אירופלוט", en: "Aeroflot" },
  S7: { he: "S7 איירליינס", en: "S7 Airlines" },

  // Rail / Special
  W2: { he: "דויטשה באהן רייל", en: "Deutsch Bahn Rail" },
  HR: { he: "האהן אייר", en: "Hahn Air" },

  // Africa
  ET: { he: "אתיופיאן איירליינס", en: "Ethiopian Airlines" },
  KQ: { he: "קניה איירווייז", en: "Kenya Airways" },
  SA: { he: "סאות' אפריקן", en: "South African Airways" },
  AT: { he: "רויאל אייר מרוקו", en: "Royal Air Maroc" },

  // Latin America
  LA: { he: "לטאם", en: "LATAM" },
  AM: { he: "אירומקסיקו", en: "Aeromexico" },
  AR: { he: "אירוליניאס ארגנטינס", en: "Aerolineas Argentinas" },
  CM: { he: "קופה איירליינס", en: "Copa Airlines" },
  AV: { he: "אביאנקה", en: "Avianca" }
};

// Returns the airline name in the requested preview language.
//
//   lang === "he" → Hebrew name from AIRLINE_NAMES (if known)
//   lang === "en" or "fr" → English name from AIRLINE_NAMES (if known)
//
// If the IATA code isn't in our table, falls back to:
//   1. `fallback` (typically the English `airline.name` from airlines_big.js)
//   2. the IATA code itself
//   3. empty string
export function getLocalizedAirlineName(iataCode, lang, fallback) {
  if (!iataCode) return fallback || "";
  const entry = AIRLINE_NAMES[iataCode];
  if (entry) {
    if (lang === "he" && entry.he) return entry.he;
    if (entry.en) return entry.en;
  }
  return fallback || iataCode;
}

// Helper: extract the IATA airline code from a flight number.
//
// IATA airline codes are always exactly 2 alphanumeric characters (per the
// parser in messageMixin.js, which only accepts splitedLine[1] when it
// matches a known IATA in airlines_big.js). So the first 2 chars of any
// flight number ARE the airline code — regardless of whether the code
// contains digits (W2, W6, A3, B6, 6H, ...) or is purely letters (LY, AF).
//
// Previously we used `replace(/\d+$/, "")` which broke for codes containing
// trailing digits — "W6123" became "W" instead of "W6", which then failed
// the AIRLINE_NAMES lookup and showed the English fallback name in Hebrew
// previews.
export function airlineCodeFromFlightNumber(flightNumber) {
  if (!flightNumber) return "";
  return String(flightNumber).slice(0, 2);
}

// Walks the parsed flights and returns the unique set of airlines that
// appear in the itinerary. Order = first appearance in the PNR. The same
// IATA code appearing in multiple legs (e.g. outbound + inbound on LY) is
// collapsed to a single entry.
//
// Returns:
//   {
//     codes: "LY, IB"                                  // joined IATA codes
//     names: "אל על, איבריה"                            // joined localized names
//   }
//
// Used by the global {{AIRLINE_CODE}} and {{AIRLINE_NAME}} placeholders so
// quotes that span multiple carriers show every airline involved, not just
// the first one.
export function collectUniqueAirlines(flights, lang) {
  if (!Array.isArray(flights) || flights.length === 0) {
    return { codes: "", names: "" };
  }
  const seen = new Set();
  const codes = [];
  const names = [];
  for (const f of flights) {
    const code = airlineCodeFromFlightNumber(f && f.flightNumber);
    if (!code || seen.has(code)) continue;
    seen.add(code);
    codes.push(code);
    names.push(getLocalizedAirlineName(code, lang, f && f.airline));
  }
  return {
    codes: codes.join(", "),
    names: names.join(", ")
  };
}
