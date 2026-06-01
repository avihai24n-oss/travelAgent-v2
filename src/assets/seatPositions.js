// Seat-position lookup keyed by IATA airline code.
//
// Airlines have different cabin layouts, so the same seat letter ("A", "D",
// "K") can mean window on one carrier and aisle on another. We store the
// mapping per airline. For carriers we don't have a map for, the helper
// returns "" and the caller treats it as "no seat-position info" — the
// preview just omits the line, exactly as it does when SSR data is missing.
//
// Currently populated for EL AL (LY) per the layout supplied by Gad:
//   A-B-C       (left side)        A=window  B=middle  C=aisle
//   H-J-K       (right side)       H=aisle   J=middle  K=window
//   D-E-F-G     (middle section)   D & G = aisle; E & F = middle
//
// To support a new airline, add an entry mirroring the seat-letter → position
// mapping for its dominant layout (typical narrow-body 3-3 or wide-body 3-4-3).

export const SEAT_POSITIONS = {
  LY: {
    A: "window",
    B: "middle",
    C: "aisle",
    D: "aisle",
    E: "middle",
    F: "middle",
    G: "aisle",
    H: "aisle",
    J: "middle",
    K: "window"
  }
};

// Human-readable labels per language. Keep the strings short — they appear
// inline in the WhatsApp preview right under the seat-number line.
export const SEAT_POSITION_LABELS = {
  he: { window: "ליד החלון", middle: "באמצע שורה", aisle: "ליד המעבר" },
  en: { window: "Window",    middle: "Middle",      aisle: "Aisle" },
  fr: { window: "Hublot",    middle: "Milieu",      aisle: "Couloir" }
};

// Returns the position word for a single seat (e.g. "24A" + LY + "he" →
// "ליד החלון"). Returns "" when the airline isn't mapped, the seat letter
// isn't recognised, or the input is malformed — caller decides what to do
// with the empty result.
function getOneSeatPosition(seat, airlineCode, lang) {
  if (!seat || !airlineCode) return "";
  const map = SEAT_POSITIONS[airlineCode];
  if (!map) return "";
  // Seat looks like "24A" / "30B" / "29E". The letter is the last char.
  const letter = String(seat).slice(-1).toUpperCase();
  const positionKey = map[letter];
  if (!positionKey) return "";
  const labels = SEAT_POSITION_LABELS[lang] || SEAT_POSITION_LABELS.en;
  return labels[positionKey] || "";
}

// Renders the seat-position SUFFIX that gets appended to the seat line in
// the rendered preview. Returns either an empty string (no display) or a
// string that STARTS with "\n" so the position lands on its own line under
// the seat numbers.
//
// Returns "" when:
//   - The flight has no parsed seats.
//   - The airline isn't in SEAT_POSITIONS (e.g. IB on a mixed-carrier PNR
//     — the user said the feature is LY-only for now, but the same logic
//     also gates any other unmapped carrier so adding airlines later is
//     additive and safe).
//   - All seats came out empty after lookup.
export function getSeatTypesSuffix(seats, airlineCode, lang) {
  if (!Array.isArray(seats) || !seats.length) return "";
  if (!airlineCode || !SEAT_POSITIONS[airlineCode]) return "";
  const positions = seats
    .map(s => getOneSeatPosition(s, airlineCode, lang))
    .filter(p => p);
  if (!positions.length) return "";
  return "\n" + positions.join(", ");
}
