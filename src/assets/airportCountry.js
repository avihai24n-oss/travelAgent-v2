// IATA airport code → ISO 3166-1 alpha-2 country code lookup.
//
// Only carries airports for countries we surface in visa-requirements
// rendering. The existing `lookupAirport()` returns a free-form country
// NAME ("United States" / "United Kingdom" / etc.) that's awkward to match
// against ISO-coded data tables — this file is the dedicated, deterministic
// alternative.
//
// When `getCountryCode(iata)` returns null, the renderer treats the
// airport as "country we don't have visa data for" and skips it silently.
// To extend coverage, add a row to AIRPORT_TO_COUNTRY (and, if necessary,
// add a new entry in visaRequirements.js).

export const AIRPORT_TO_COUNTRY = {
  // Israel (home — origin only)
  TLV: "IL", ETM: "IL", VDA: "IL", SDV: "IL", HFA: "IL",

  // USA
  JFK: "US", LGA: "US", EWR: "US", BOS: "US", MIA: "US", FLL: "US",
  ORD: "US", MDW: "US", ATL: "US", DFW: "US", IAH: "US", DAL: "US",
  LAX: "US", SFO: "US", SEA: "US", LAS: "US", PHX: "US", DEN: "US",
  MCO: "US", TPA: "US", BWI: "US", IAD: "US", DCA: "US", PHL: "US",
  DTW: "US", MSP: "US", SLC: "US", SAN: "US", PDX: "US", AUS: "US",
  CLT: "US", PIT: "US", CVG: "US", HNL: "US", ANC: "US",

  // United Kingdom
  LHR: "GB", LGW: "GB", STN: "GB", LTN: "GB", LCY: "GB",
  MAN: "GB", EDI: "GB", GLA: "GB", BHX: "GB", BRS: "GB", NCL: "GB",

  // Canada
  YYZ: "CA", YVR: "CA", YUL: "CA", YYC: "CA", YEG: "CA", YOW: "CA",
  YHZ: "CA", YWG: "CA", YQB: "CA",

  // Australia
  SYD: "AU", MEL: "AU", BNE: "AU", PER: "AU", ADL: "AU", CNS: "AU",
  OOL: "AU", CBR: "AU",

  // New Zealand
  AKL: "NZ", WLG: "NZ", CHC: "NZ", ZQN: "NZ",

  // India
  DEL: "IN", BOM: "IN", BLR: "IN", MAA: "IN", HYD: "IN", CCU: "IN",
  COK: "IN", GOI: "IN", PNQ: "IN", AMD: "IN", JAI: "IN", TRV: "IN",

  // China (mainland — HKG kept separate below)
  PEK: "CN", PKX: "CN", PVG: "CN", SHA: "CN", CAN: "CN", SZX: "CN",
  CTU: "CN", KMG: "CN", XIY: "CN", HGH: "CN", NKG: "CN",
  // Hong Kong and Macau — separate jurisdictions, not in CN visa rules.
  HKG: "HK", MFM: "MO",

  // Vietnam
  HAN: "VN", SGN: "VN", DAD: "VN", CXR: "VN", PQC: "VN",

  // Thailand
  BKK: "TH", DMK: "TH", HKT: "TH", CNX: "TH", USM: "TH", CEI: "TH",
  KBV: "TH", UTP: "TH",

  // Cambodia
  PNH: "KH", REP: "KH", KOS: "KH",

  // Sri Lanka
  CMB: "LK", HRI: "LK",

  // Indonesia
  CGK: "ID", DPS: "ID", SUB: "ID", JOG: "ID", LOP: "ID", BPN: "ID",

  // Morocco
  CMN: "MA", RAK: "MA", AGA: "MA", RBA: "MA", FEZ: "MA", TNG: "MA", OZZ: "MA",

  // Egypt
  CAI: "EG", SSH: "EG", LXR: "EG", HRG: "EG", ASW: "EG", HBE: "EG", RMF: "EG",

  // Jordan
  AMM: "JO", ADJ: "JO", AQJ: "JO",

  // Kenya
  NBO: "KE", MBA: "KE", KIS: "KE",

  // Tanzania
  DAR: "TZ", JRO: "TZ", ZNZ: "TZ",

  // Ethiopia
  ADD: "ET",

  // Uganda
  EBB: "UG",

  // Rwanda
  KGL: "RW",

  // Zimbabwe / Zambia (sharing one visaRequirements entry under "ZW")
  HRE: "ZW", VFA: "ZW", BUQ: "ZW",
  LUN: "ZW", LVI: "ZW", NLA: "ZW",

  // South Africa
  JNB: "ZA", CPT: "ZA", DUR: "ZA", PLZ: "ZA",

  // Mozambique
  MPM: "MZ", APL: "MZ", BEW: "MZ",

  // Seychelles
  SEZ: "SC", PRI: "SC",

  // Bahrain
  BAH: "BH",

  // Oman
  MCT: "OM", SLL: "OM",

  // Azerbaijan
  GYD: "AZ",

  // Myanmar
  RGN: "MM", MDL: "MM", NYT: "MM",

  // Nepal
  KTM: "NP"
};

// Resolves an IATA code → ISO 3166-1 alpha-2 country code. Returns null
// when we don't have a mapping (the renderer treats null as "no visa data
// for this airport — skip silently").
export function getCountryCode(iataCode) {
  if (!iataCode) return null;
  return AIRPORT_TO_COUNTRY[String(iataCode).toUpperCase()] || null;
}
