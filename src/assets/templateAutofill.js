// Auto-fill engine for Gad-authored custom templates.
//
// Why this exists:
//   The built-in `flight` template uses our {{PLACEHOLDER}} syntax, so the
//   renderer in MessageBuilder.vue knows how to substitute values from the
//   form + parsed PNR. Gad's own custom templates (in Supabase) use his own
//   conventions: "שם הנוסע", "(LY,XX)", a literal empty area where flights
//   should go, etc. We don't want to rewrite his stored content — those rows
//   are HIS authoring surface and must stay exactly as he saved them.
//
//   This module is the bridge. At render time, given Gad's template text and
//   the preview language, it returns a text where his manual placeholders
//   have been converted to our {{...}} syntax and a standard flight block has
//   been injected at the right spot. The result feeds the existing render
//   pipeline (expandFlightBlock + replace) untouched.
//
// Guarantees:
//   - The Supabase row is never written from here. Read-only consumer.
//   - If a pattern doesn't match (Gad changed his template, typo, etc.) the
//     corresponding section is left as-is. The engine never throws.
//   - Categories the engine doesn't know about: returns the input unchanged.
//
// Extending:
//   - Add a new (regex → placeholder) entry in PATTERN_MAP[lang] for each
//     manual placeholder you want auto-filled.
//   - Add a new section marker in SECTION_INJECTIONS if you want a standard
//     block injected after a marker line (e.g. flight list).

// Standard flight block — the exact shape we want injected after the
// "Itinerary" header for each parsed PNR flight. Same fields as the built-in
// `flight` template's per-flight block; matches what expandFlightBlock
// expects (a paragraph that contains at least one {{FLIGHT_*}} placeholder).
const STANDARD_FLIGHT_BLOCK = {
  he:
    "*{{FLIGHT_DIRECTION}}*\n" +
    "טיסת {{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*\n" +
    "{{FLIGHT_ORIGIN_CITY}} ⬅️ {{FLIGHT_DEST_CITY}} ({{FLIGHT_DEST_CODE}})\n" +
    "*{{FLIGHT_CLASS}}*\n" +
    "ממריא {{FLIGHT_DEPART_DAY}} {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}\n" +
    "נוחת    {{FLIGHT_ARRIVE_DAY}} {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}\n" +
    "💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}",
  en:
    "*{{FLIGHT_DIRECTION}}*\n" +
    "{{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*\n" +
    "{{FLIGHT_ORIGIN_CITY}} ➡️ {{FLIGHT_DEST_CITY}} ({{FLIGHT_DEST_CODE}})\n" +
    "*{{FLIGHT_CLASS}}*\n" +
    "Dpt. {{FLIGHT_DEPART_DAY}}. {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}\n" +
    "Arr.  {{FLIGHT_ARRIVE_DAY}}. {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}\n" +
    "💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}",
  fr:
    "*{{FLIGHT_DIRECTION}}*\n" +
    "{{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*\n" +
    "{{FLIGHT_ORIGIN_CITY}} ➡️ {{FLIGHT_DEST_CITY}} ({{FLIGHT_DEST_CODE}})\n" +
    "*{{FLIGHT_CLASS}}*\n" +
    "Dpt. {{FLIGHT_DEPART_DAY}} {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}\n" +
    "Arr.  {{FLIGHT_ARRIVE_DAY}} {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}\n" +
    "💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}"
};

// Section markers — when the engine sees one of these lines in Gad's template,
// it injects the standard flight block right after it (consuming any blank
// lines between the marker and the next non-blank line, so the block sits
// snug under the heading regardless of how many empty rows Gad left).
const SECTION_INJECTIONS = [
  {
    // The English marker accepts both "*Itinerary 🌍*" (used by the built-in
    // default flight template) and "*Flight Itinerary 🌍*" (used by Gad's
    // Standard Airfare Quote). Same idea for he/fr later if Gad adopts a
    // different wording.
    languages: {
      he: /^\*מסלול הטיסות 🌍\*\s*$/,
      en: /^\*(?:Flight )?Itinerary 🌍\*\s*$/,
      // French: accepts the built-in default "*Itinéraire 🌍*" AND Gad's
      // wording in the Standard Airfare Quote "*Itinéraire des vols 🌍*".
      fr: /^\*Itinéraire(?: des vols)? 🌍\*\s*$/
    },
    block: STANDARD_FLIGHT_BLOCK
  }
];

// Class-of-Travel "menu" block — Gad's custom templates list all three cabin
// options after a "Class of travel" heading so he can highlight the relevant
// one manually. We collapse that menu to a single styled line that matches
// the actual cabin of the trip (uses our existing {{CLASS_LINE}} resolver).
// NOTE: `u` flag is mandatory — the cabin emojis are non-BMP code points and
// without `u` JS would treat them as surrogate pairs inside the character
// class and never match a single styled line.
const CLASS_MENU_PATTERNS = {
  he: /(?:[ \t]*[💺🥂👔🥇]\s*\*?מחלקת [^*\n]+\*?[^\n]*\n?){2,4}/gu,
  en: /(?:[ \t]*[💺🥂👔🥇]\s*\*?[^*\n]*?(?:Economy|Premium|Business|First)[^\n]*\*?\n?){2,4}/gu,
  // French: accepts both "Cl. Économique" (built-in default) and "Classe ..."
  // (Gad's wording in the Standard Airfare Quote). Tolerant of typos like
  // "Économe" / "Économie" Gad sprinkled into the combined-cabin block.
  fr: /(?:[ \t]*[💺🥂👔🥇]\s*\*?(?:Cl\.|Classe)[^\n]*\*?\n?){2,4}/gu
};

// Manual placeholder → {{...}} substitutions, per language.
//
// Rules of thumb when adding:
//   - Prefer the most distinctive surrounding context you can (Gad's
//     placeholders share words with regular prose, so a bare "יעד" would
//     over-match). Bold markers (`*...*`) and emoji anchors are usually
//     enough.
//   - Group regex flags so the match consumes the literal placeholder only,
//     leaving formatting around it (asterisks, emoji) untouched in the
//     output. The replacement is wrapped with the same formatting we
//     stripped, so the rendered line stays visually identical aside from
//     having real data instead of the stub.
//   - When a placeholder shows up multiple times (e.g. ticket-issuance
//     appears at the top and the bottom of the standard quote), give it a
//     `/g` flag — both occurrences should get the same value.
const PATTERN_MAP = {
  he: [
    // Customer name — appears as the very first bold token of the message
    // and (sometimes) inline elsewhere. Anchoring on "*שם הנוסע*" keeps
    // matches narrow.
    { match: /\*שם הנוסע\*/g, replace: "*{{CUSTOMER_NAME}}*" },

    // Ticket-issuance line — Gad writes a "day-letter day-letter ... | hour"
    // legend that he edits in place. We pick it up by the leading "👈*יום "
    // anchor (which is consistent across both occurrences) plus the literal
    // "| שעה" or "| 00:00" tail he uses.
    { match: /\*יום [א-ז׳' ״ ]+\d* ?חודש ?\| ?שעה\*/g, replace: "*{{TICKET_ISSUANCE}}*" },
    { match: /\*יום ׳ \d+ בחוד׳ \| \d+:\d+\*/g, replace: "*{{TICKET_ISSUANCE}}*" },

    // Destination — "*יעד*" inline.
    { match: /\*יעד\*/g, replace: "*{{DESTINATION}}*" },

    // Trip departure date — "*תאריך_יציאה*" in the intro line. Uses the
    // GLOBAL {{TRIP_DEPART_DATE}} placeholder (NOT one of the per-flight
    // FLIGHT_* keys) so expandFlightBlock doesn't see this paragraph as a
    // flight block and split flights into the wrong place.
    { match: /\*תאריך_יציאה\*/g, replace: "*{{TRIP_DEPART_DATE}}*" },

    // Airline-code legend "(LY,XX)" → "({{AIRLINE_CODE}})". Tight regex so
    // we don't accidentally rewrite a real airline pair the user typed.
    { match: /\(LY,\s*XX\)/g, replace: "({{AIRLINE_CODE}})" },

    // Travelers icon — Gad's intro line lists every person/group emoji
    // separated by "/" so he can manually keep the relevant one.
    // Collapse that list to a single {{TRAVELERS_ICON}} placeholder; the
    // renderer picks 👤 / 👥 / 👨‍👩‍👧‍👦 based on the parsed PNR pax count.
    // Anchored on the exact prose surrounding it ("נסיעתך/כם … הקרובה ל")
    // so we never touch icons elsewhere in the template.
    //
    // IMPORTANT: this pattern must run BEFORE the נסיעתך/כם → {{TRAVEL_NOUN}}
    // swap below, because the icon-replace anchors on the literal "נסיעתך/כם"
    // string. The icon match leaves the literal in place ($1) so the next
    // pattern can still replace it.
    {
      match: /(נסיעתך\/כם)[^\n]*?(?=\s+הקרובה)/g,
      replace: "$1 {{TRAVELERS_ICON}}"
    },

    // "נסיעתך/כם" → "{{TRAVEL_NOUN}}". Gad spells out both grammatical
    // forms manually so he can keep the relevant one; the renderer now
    // picks "נסיעתך" (1 passenger) or "נסיעתכם" (2+) based on the parsed
    // PNR. Runs AFTER the icon pattern above, which intentionally leaves
    // the literal in place ($1) for this swap to find.
    { match: /נסיעתך\/כם/g, replace: "{{TRAVEL_NOUN}}" }
  ],
  en: [
    // Older generic English templates used `*Xxxxxxx*` / `*Day .. | ..*` as
    // manual placeholders. Keep recognising them for backwards compat.
    { match: /\*Xxxxxxx\*/g, replace: "*{{CUSTOMER_NAME}}*" },
    { match: /\*Day [0-9A-Za-z ]+\| [0-9 APMapm:]+\*/g, replace: "*{{TICKET_ISSUANCE}}*" },

    // Gad's Standard Airfare Quote (en) — patterns aligned to his exact
    // phrasing in custom_mpsx5w8le42j/en.

    // Customer name — "Dear * *," (two empty bolds with a space between
    // them, intended for first name / last name) becomes one bold token.
    { match: /Dear \* \*,/g, replace: "Dear *{{CUSTOMER_NAME}}*," },

    // Ticket-issuance (top legend) — "*Sun / Mon / Tue / Wed / Thu / Fri |
    // 00 Month | HH:MM*" gets replaced with the actual issuance string.
    { match: /\*Sun \/ Mon \/ Tue \/ Wed \/ Thu \/ Fri \| 00 Month \| HH:MM\*/g, replace: "*{{TICKET_ISSUANCE}}*" },

    // Ticket-issuance (bottom) — "*Sun 00 Month | HH:MM*"
    { match: /\*Sun 00 Month \| HH:MM\*/g, replace: "*{{TICKET_ISSUANCE}}*" },

    // Destination — "to *DEST*" inside the trip intro line.
    { match: /to \*DEST\*/g, replace: "to *{{DESTINATION}}*" },

    // Travelers icon — same rationale as Hebrew, but here we can't anchor
    // on prose ("for your … trip" isn't unique enough), so we match the
    // emoji list directly: 3+ person/group emojis joined by " / ". Catches
    // 👤 / 👥 / 🧑‍🤝‍🧑 / 👨‍👩‍👧 / 👨‍👩‍👧‍👦 (Gad's typical 5-icon line) and
    // tolerates ZWJ sequences + skin-tone modifiers without listing them
    // all. {{TRAVELERS_ICON}} resolves to a single icon at render time.
    {
      // Match a list of 3+ pictographic "icons" joined by " / ". Each
      // icon can be a simple emoji (👤, 🧒) OR a ZWJ sequence like
      // 🧑‍🧒‍🧒 / 🧑‍🧑‍🧒‍🧒 (adult + child(ren), couple + children, etc.).
      // \p{Extended_Pictographic} covers any emoji char in Unicode without
      // us having to enumerate them, so new icons Gad picks (👶, 🧓, …)
      // are caught automatically. The continuation class is the same set
      // plus ZWJ (U+200D) and skin-tone modifiers (U+1F3FB–U+1F3FF) so
      // multi-codepoint sequences stay together.
      match: /\p{Extended_Pictographic}(?:[‍\u{1F3FB}-\u{1F3FF}\p{Extended_Pictographic}]*)?(?:\s*\/\s*\p{Extended_Pictographic}(?:[‍\u{1F3FB}-\u{1F3FF}\p{Extended_Pictographic}]*)?){2,}/gu,
      replace: "{{TRAVELERS_ICON}}"
    },

    // Trip departure date — "*DATE*" in the intro line. Uses the GLOBAL
    // {{TRIP_DEPART_DATE}} placeholder (NOT one of the per-flight FLIGHT_*
    // keys) so expandFlightBlock doesn't see this paragraph as a flight
    // block and split flights into the wrong place.
    { match: /\*DATE\*/g, replace: "*{{TRIP_DEPART_DATE}}*" },

    // Airline-code legend "(LY, XX)" → "({{AIRLINE_CODE}})". Allow optional
    // whitespace after the comma so a single-airline edit still matches.
    { match: /\(LY,\s*XX\)/g, replace: "({{AIRLINE_CODE}})" }
  ],
  fr: [
    // Gad's Standard Airfare Quote (fr) — patterns aligned to his exact
    // phrasing in custom_mpsx5w8le42j/fr.

    // Customer name — "Cher/Chère * *," (two empty bolds with a space
    // between them, intended for first / last name) becomes one bold.
    { match: /Cher\/Chère \* \*,/g, replace: "Cher/Chère *{{CUSTOMER_NAME}}*," },

    // Ticket-issuance (top legend) — "*Dim / Lun / Mar / Mer / Jeu / Ven |
    // 00 mois | HH:MM*"
    { match: /\*Dim \/ Lun \/ Mar \/ Mer \/ Jeu \/ Ven \| 00 mois \| HH:MM\*/g, replace: "*{{TICKET_ISSUANCE}}*" },

    // Ticket-issuance (bottom) — "*Dim 00 mois | HH:MM*"
    { match: /\*Dim 00 mois \| HH:MM\*/g, replace: "*{{TICKET_ISSUANCE}}*" },

    // Destination — "destination de * *," (same empty-bolds shape as the
    // customer name).
    { match: /destination de \* \*,/g, replace: "destination de *{{DESTINATION}}*," },

    // Travelers icon — same generic emoji-list match used for English.
    // Catches Gad's "👤 / 👥 / 🧑‍🤝‍🧑 / 👨‍👩‍👧 / 👨‍👩‍👧‍👦" sequence regardless of
    // the surrounding French prose, so we don't need to anchor on
    // "voyage" / "votre" / "ton" / etc.
    {
      // Match a list of 3+ pictographic "icons" joined by " / ". Each
      // icon can be a simple emoji (👤, 🧒) OR a ZWJ sequence like
      // 🧑‍🧒‍🧒 / 🧑‍🧑‍🧒‍🧒 (adult + child(ren), couple + children, etc.).
      // \p{Extended_Pictographic} covers any emoji char in Unicode without
      // us having to enumerate them, so new icons Gad picks (👶, 🧓, …)
      // are caught automatically. The continuation class is the same set
      // plus ZWJ (U+200D) and skin-tone modifiers (U+1F3FB–U+1F3FF) so
      // multi-codepoint sequences stay together.
      match: /\p{Extended_Pictographic}(?:[‍\u{1F3FB}-\u{1F3FF}\p{Extended_Pictographic}]*)?(?:\s*\/\s*\p{Extended_Pictographic}(?:[‍\u{1F3FB}-\u{1F3FF}\p{Extended_Pictographic}]*)?){2,}/gu,
      replace: "{{TRAVELERS_ICON}}"
    },

    // Trip departure date — "*DATE_DEPART*" in the intro line. Uses the
    // GLOBAL {{TRIP_DEPART_DATE}} placeholder (NOT one of the per-flight
    // FLIGHT_* keys) so expandFlightBlock doesn't see this paragraph as
    // a flight block and split flights into the wrong place.
    { match: /\*DATE_DEPART\*/g, replace: "*{{TRIP_DEPART_DATE}}*" },

    // Airline-code legend "(LY, XX)" → "({{AIRLINE_CODE}})". Allow
    // optional whitespace after the comma.
    { match: /\(LY,\s*XX\)/g, replace: "({{AIRLINE_CODE}})" },

    // ─── Drop draft duplicates of the closing paragraph ───
    // Gad left three "🇫🇷 ✅ …" lines in the FR template that don't have
    // an equivalent in the Hebrew/English versions — they look like draft
    // wording variants of the structured "✅ Pour finaliser" block below.
    // Keeping them produces the quadruple-paragraph render the user saw.
    // We strip them unconditionally (render-time only — the Supabase row
    // is left exactly as Gad authored it). The "main" intro paragraph
    // ("Merci de répondre…", analog of Hebrew "נא השב") stays, and the
    // structured block ("✅ Pour finaliser…", analog of Hebrew
    // "✅ לסיום ההזמנה") remains under the `completion_instructions`
    // toggle.
    { match: /\n🇫🇷 ✅[^\n]+/gu, replace: "" }
  ]
};

// Optional sections — content that lives in Gad's Standard Airfare Quote but
// NOT in the in-code `flight` default. Each gets a toggle in the UI so he
// can opt in/out per quote. Default state (UI) is "all off", which makes
// the rendered Standard read like an upgraded version of the in-code default.
//
// Adding a new section:
//   1) Add an entry below with `key`, `label` (Hebrew UI label), and a
//      multi-line regex (`u` flag is mandatory because the content contains
//      non-BMP emoji code points).
//   2) The regex must match EXACTLY the lines you want to drop when the
//      toggle is off. Use `[\s\S]*?` + a lookahead for the next anchor so
//      the match terminates cleanly at the section boundary.
//   3) The cleanup pass below collapses runs of consecutive dividers and
//      blank lines, so a section's regex doesn't have to perfectly own its
//      surrounding whitespace — just make sure no stray content leaks.
export const OPTIONAL_SECTIONS = {
  he: [
    // ─── העדפות פר־טיסה — 3 תת־סקציות ───
    // Splits Gad's seat/meal/wheelchair block into independent toggles.
    // Patterns are sized so each can be removed in isolation; the cleanup
    // pass collapses the leftover blank lines.
    {
      key: "pref_seat",
      icon: "🪑",
      label: "מספר מושב + סוג",
      group: "preferences",
      pattern: / *💺מושב\/י[\s\S]*?(?=\n 🍽️|\n 👩‍🦽|\n▬▬▬▬)/u
    },
    {
      key: "pref_meal",
      icon: "🍽️",
      label: "העדפת ארוחה",
      group: "preferences",
      pattern: /\n 🍽️ \*כשרה[^\n]*/u
    },
    {
      key: "pref_wheelchair",
      icon: "♿",
      label: "כיסא גלגלים",
      group: "preferences",
      pattern: /\n 👩‍🦽\*כיסא גלגלים[^\n]*/u
    },
    {
      key: "codeshare_notes",
      icon: "🤝",
      label: "הערות קודשייר",
      pattern: / \*אלעל\* ״קונקט״[\s\S]*?(?=\n+▔▔▔▔)/u
    },
    {
      key: "combined_compartments",
      icon: "🔀",
      label: "שילוב מחלקות בטיסות",
      pattern: /\n▔▔▔▔▔▔▔\n\n🔀 שילוב מחלקות[\s\S]*?(?=\n▬▬▬▬)/u
    },
    {
      key: "extended_caveat",
      icon: "⚠️",
      label: "לתשומת לבך מורחב (3 שורות)",
      pattern: /\n🛑 \*\*לתשומת לבך:\*\n(?:\*[^\n]*\n){2,}/u
    },
    // ─── תוספות אופציונליות — 4 תת־סקציות ───
    // Each sub-toggle controls a single add-on within Gad's 🟦 block.
    // The 🟦 header + leading ▔ divider are kept automatically when ANY of
    // the four is on (see ADDON_KEYS handling below); when ALL are off the
    // header gets stripped too so the section vanishes cleanly.
    {
      key: "addon_preferred_seats",
      icon: "🪑",
      label: "מושב מועדף",
      group: "addons",
      pattern: /\n💺 \*מושב\/ים מועדפים\*💳\n/u
    },
    {
      key: "addon_space_seats",
      icon: "⭐",
      label: "מושב ספייס",
      group: "addons",
      pattern: /\n💺 \*מושב\/י ״ספייס״\*\*💳\n[\s\S]*?(?=\n\n🧳 \*מזוודה|\n\n? 🛟 \*אלעל|\n▬▬▬▬)/u
    },
    {
      key: "addon_extra_baggage",
      icon: "🛄",
      label: "מזוודה נוספת",
      group: "addons",
      pattern: /\n🧳 \*מזוודה נוספת\*💳\n[\s\S]*?(?=\n\n? 🛟 \*אלעל|\n▬▬▬▬)/u
    },
    {
      key: "addon_elal_protect",
      icon: "🛡️",
      label: "אלעל פרוטקט",
      group: "addons",
      pattern: /\n 🛟 \*אלעל פרוטקט\*💳\n[\s\S]*?(?=\n▬▬▬▬)/u
    },
    // ─── חזרה למבנה הרגיל ───
    {
      key: "detailed_baggage",
      icon: "🧳",
      label: "כבודה מורחבת (4 אפשרויות)",
      pattern: / 🧳 \*כבודה לנוסע:\*[\s\S]*?(?=\n\n? 💺 \*הושבה מראש:\*|\n▬▬▬▬)/u
    },
    {
      key: "detailed_seats",
      icon: "💺",
      label: "הושבה מראש מורחבת",
      pattern: / 💺 \*הושבה מראש:\*[\s\S]*?(?=\n▬▬▬▬)/u
    },
    {
      key: "tariff_tier_second",
      icon: "💸",
      label: "תנאי כרטיס: +72h / -72h",
      pattern: /\n\*תנאי הכרטיסים\*⚠️\n[\s\S]*?(?=\n▬▬▬▬)/u
    },
    {
      key: "extended_issuance_options",
      icon: "⏰",
      label: "אופציות מועד הנפקה (מיידי / 24 / 48 / 72)",
      pattern: / ⏰\*כרטוס מיידי = היום\*‼️\n ⏰ \*תוך 24 \/ 48 \/ 72 שעות\*❗\n/u
    },
    {
      key: "completion_instructions",
      icon: "✅",
      label: "הוראת סיום הזמנה",
      pattern: /\n✅ לסיום ההזמנה[\s\S]*?(?=\n👈\*קבלת המענה)/u
    }
  ],
  // ─── English (aligned to Gad's custom_mpsx5w8le42j/en template) ───
  // Keys mirror the Hebrew entries 1:1 so a toggle Gad turns on in he stays
  // on when he switches preview language to en — same `sectionTogglesKey`
  // shape, same UX. Patterns are translated against Gad's exact phrasing.
  en: [
    // ─── group: preferences — per-flight passenger preferences ───
    {
      key: "pref_seat",
      icon: "🪑",
      label: "Seat number + type",
      group: "preferences",
      pattern: / *💺 Seat\(s\)[\s\S]*?(?=\n 🍽️|\n 👩‍🦽|\n▬▬▬▬)/u
    },
    {
      key: "pref_meal",
      icon: "🍽️",
      label: "Meal preference",
      group: "preferences",
      pattern: /\n 🍽️ \*Kosher[^\n]*/u
    },
    {
      key: "pref_wheelchair",
      icon: "♿",
      label: "Wheelchair assistance",
      group: "preferences",
      pattern: /\n 👩‍🦽 \*Wheelchair[^\n]*/u
    },
    // ─── stand-alone ───
    {
      key: "codeshare_notes",
      icon: "🤝",
      label: "Codeshare notes",
      pattern: / \*EL AL "Connect"\*[\s\S]*?(?=\n+▬▬▬▬)/u
    },
    {
      key: "combined_compartments",
      icon: "🔀",
      label: "Mixed Cabin Itinerary",
      pattern: /\n🔀 Mixed Cabin Itinerary[\s\S]*?(?=\n+▬▬▬▬)/u
    },
    {
      key: "extended_caveat",
      icon: "⚠️",
      label: "Please Note (3 caveats)",
      pattern: /\n🛑 \*\*Please Note:\*\n(?:\*[^\n]*\n){2,}/u
    },
    // ─── group: addons — 🟦 "Optional Add-Ons" container ───
    {
      key: "addon_preferred_seats",
      icon: "🪑",
      label: "Preferred Seats",
      group: "addons",
      pattern: /\n💺 \*Preferred Seats\* 💳\n/u
    },
    {
      key: "addon_space_seats",
      icon: "⭐",
      label: "\"Space\" Seats",
      group: "addons",
      pattern: /\n💺 \*"Space" Seats\*\* 💳\n[\s\S]*?(?=\n+▔▔▔▔|\n+▬▬▬▬)/u
    },
    {
      key: "addon_extra_baggage",
      icon: "🛄",
      label: "Additional Baggage",
      group: "addons",
      pattern: /\n🧳 \*Additional Baggage\* 💳\n[\s\S]*?(?=\n+▔▔▔▔|\n+▬▬▬▬)/u
    },
    {
      key: "addon_elal_protect",
      icon: "🛡️",
      label: "EL AL Protect",
      group: "addons",
      pattern: /\n 🛟 \*EL AL Protect\* 💳\n[\s\S]*?(?=\n+▬▬▬▬)/u
    },
    // ─── stand-alone: detailed baggage ───
    {
      key: "detailed_baggage",
      icon: "🧳",
      label: "Detailed baggage allowance",
      pattern: /🧳 \*Baggage allowance\*[\s\S]*?(?=\n+▔▔▔▔|\n+▬▬▬▬)/u
    },
    // ─── stand-alone: detailed preselected seats ───
    {
      key: "detailed_seats",
      icon: "💺",
      label: "Detailed preselected seats",
      pattern: /💺\*Preselected Seats:\*[\s\S]*?(?=\n+▬▬▬▬)/u
    },
    // ─── stand-alone: USA Tkts restrictions (analog of Hebrew +72h/-72h) ───
    {
      key: "tariff_tier_second",
      icon: "💸",
      label: "USA Tkts. Restrictions (48h)",
      pattern: /\n⚠️ \*USA Tkts\. Restrictions\*[\s\S]*?(?=\n+▔▔▔▔)/u
    },
    // ─── issuance — single toggle removes both timing lines ───
    {
      key: "extended_issuance_options",
      icon: "⏰",
      label: "Issuance time options (Immediate / 24 / 48 / 72)",
      pattern: / ⏰ \*Immediate ticketing = Today\* ‼️\n ⏰ \*Within 24 \/ 48 \/ 72 hours\* ❗\n/u
    },
    // ─── completion instructions — 3 paragraphs Gad uses as closing ───
    {
      key: "completion_instructions",
      icon: "✅",
      label: "Completion instructions (3 paragraphs)",
      pattern: /\n Thank you for replying[\s\S]*?(?=\n\nThank you very much)/u
    }
  ],
  // ─── French (aligned to Gad's custom_mpsx5w8le42j/fr template) ───
  // Keys mirror the Hebrew/English entries 1:1 so the same toggle preserves
  // its on/off state across language switches. `tariff_tier_second` is
  // intentionally OMITTED — Gad's French template has only the base fare
  // conditions block, no second-tier (+72h/-72h or USA-style) variant.
  fr: [
    // ─── group: preferences ───
    {
      key: "pref_seat",
      icon: "🪑",
      label: "Numéro de siège + type",
      group: "preferences",
      pattern: / *💺 Siège\(s\)[\s\S]*?(?=\n 🍽️|\n 👩‍🦽|\n▬▬▬▬)/u
    },
    {
      key: "pref_meal",
      icon: "🍽️",
      label: "Préférence repas",
      group: "preferences",
      pattern: /\n 🍽️ \*Repas[^\n]*/u
    },
    {
      key: "pref_wheelchair",
      icon: "♿",
      label: "Assistance fauteuil roulant",
      group: "preferences",
      pattern: /\n 👩‍🦽\*Assistance fauteuil[^\n]*/u
    },
    // ─── stand-alone ───
    {
      key: "codeshare_notes",
      icon: "🤝",
      label: "Notes codeshare",
      pattern: /\*EL AL « Connect »\*[\s\S]*?(?=\n+▬▬▬▬)/u
    },
    {
      key: "combined_compartments",
      icon: "🔀",
      label: "Combinaison de classes",
      pattern: /\n🔀 Combinaison de classes[\s\S]*?(?=\n+▬▬▬▬)/u
    },
    {
      key: "extended_caveat",
      icon: "⚠️",
      label: "À noter (3 mentions)",
      pattern: /\n🛑 \*\*À noter :\*\n(?:\*[^\n]*\n){2,}/u
    },
    // ─── group: addons — 🟦 "Options supplémentaires" container ───
    {
      key: "addon_preferred_seats",
      icon: "🪑",
      label: "Sièges préférentiels",
      group: "addons",
      pattern: /\n💺 \*Sièges préférentiels\* 💳\n/u
    },
    {
      key: "addon_space_seats",
      icon: "⭐",
      label: "Sièges « Space »",
      group: "addons",
      pattern: /\n💺 \*Sièges « Space »\*\* 💳\n[\s\S]*?(?=\n+🧳 \*Bagage supplémentaire|\n+ 🛟 \*EL AL|\n+▬▬▬▬)/u
    },
    {
      key: "addon_extra_baggage",
      icon: "🛄",
      label: "Bagage supplémentaire",
      group: "addons",
      pattern: /\n🧳 \*Bagage supplémentaire\* 💳\n[\s\S]*?(?=\n+ 🛟 \*EL AL|\n+▬▬▬▬)/u
    },
    {
      key: "addon_elal_protect",
      icon: "🛡️",
      label: "EL AL Protect",
      group: "addons",
      pattern: /\n 🛟 \*EL AL Protect\* 💳\n[\s\S]*?(?=\n+▬▬▬▬)/u
    },
    // ─── stand-alone: detailed baggage ───
    {
      key: "detailed_baggage",
      icon: "🧳",
      label: "Bagages par passager (4 options)",
      pattern: /🧳 \*Bagages par passager :\*[\s\S]*?(?=\n+\*Preselection|\n+▬▬▬▬)/u
    },
    // ─── stand-alone: detailed preselected seats ───
    {
      key: "detailed_seats",
      icon: "💺",
      label: "Présélection sièges détaillée",
      pattern: /\*Preselection Sièges\*💺[\s\S]*?(?=\n+▬▬▬▬)/u
    },
    // ─── issuance — single toggle removes both timing lines ───
    {
      key: "extended_issuance_options",
      icon: "⏰",
      label: "Options délai d'émission (Aujourd'hui / 24 / 48 / 72)",
      pattern: /⏰ \*Aujourd'hui\* ‼️\n⏳\*Sous 24 \/ 48 \/ 72 heures\* ❗\n/u
    },
    // ─── completion instructions — Gad's "Pour finaliser" closing block ───
    {
      key: "completion_instructions",
      icon: "✅",
      label: "Instructions de finalisation",
      pattern: /\n✅ Pour finaliser[\s\S]*?(?=\n\n👉 \*Votre réponse)/u
    }
  ]
};

// Keys belonging to the 🟦 "Optional add-ons" container. The 🟦 header line
// (and the ▔ divider above it) is auto-managed: kept when ANY of these is
// on, stripped when ALL are off. This lives outside OPTIONAL_SECTIONS so
// the UI doesn't show a separate toggle for the header.
const ADDON_KEYS = [
  "addon_preferred_seats",
  "addon_space_seats",
  "addon_extra_baggage",
  "addon_elal_protect"
];

// Header regex (per language): the leading ▔ divider + the 🟦 line + any
// blank line(s) underneath. Matches exactly the chunk to strip when the
// wrapper collapses. The `▔+` quantifier accommodates Gad's varying divider
// widths (sometimes 7, sometimes 8+).
const ADDONS_HEADER_PATTERNS = {
  he: /\n▔▔▔▔▔▔▔\n🟦 \*תוספות אופציונליות\*\n+/u,
  en: /\n▔+\n+🟦 \*Optional Add-Ons\*\n+/u,
  // French — Gad puts the 🟦 line right under the divider with no blank
  // line between them, so `\n*` (zero or more newlines) after the divider.
  fr: /\n▔+\n*🟦 \*Options supplémentaires\*\n+/u
};

// Categories that opt into the section-toggle UI. When the user picks a
// category NOT in this list (e.g. the in-code `flight` default), the
// checkbox panel hides and no section stripping runs.
export const SECTION_SUPPORT = {
  // Standard Airfare Quote — supported in he + en + fr (Gad's content
  // exists in all three).
  custom_mpsx5w8le42j: { he: true, en: true, fr: true }
};

// Public entry point.
//
// Returns the template with Gad's manual placeholders converted to our
// {{...}} syntax, the standard flight block injected after the itinerary
// header, and optional sections stripped per the `toggles` map (a
// `{ sectionKey: bool }` shape — `true` keeps the section, anything else
// removes it). The caller then runs the result through the existing
// expandFlightBlock + replace pipeline. Idempotent: feeding the output
// back in is a no-op (regexes don't match the new {{...}} form).
export function autofillTemplate(tpl, lang, toggles) {
  if (typeof tpl !== "string" || !tpl) return tpl;
  const langKey = lang && PATTERN_MAP[lang] ? lang : "en";

  // Normalize CRLF/CR → LF. Gad's Admin saves to Supabase with Windows-style
  // line endings; every regex below assumes LF, so we strip the \r once and
  // the rest of the pipeline (renderer included) only ever sees LF.
  let out = tpl.replace(/\r\n?/g, "\n");

  // 1. Strip optional sections that are OFF. Done BEFORE injection /
  //    pattern replacement so the section patterns can rely on the original
  //    shape of the template (Gad's literal text and dividers).
  const sections = OPTIONAL_SECTIONS[langKey] || [];
  const onMap = toggles || {};
  for (const sec of sections) {
    if (onMap[sec.key] === true) continue;
    out = out.replace(sec.pattern, "");
  }

  // 1b. If the 🟦 "Optional add-ons" wrapper has no surviving sub-section,
  //     drop the header + divider too so the section vanishes cleanly
  //     instead of leaving a lonely title.
  const anyAddonOn = ADDON_KEYS.some(k => onMap[k] === true);
  const headerRe = ADDONS_HEADER_PATTERNS[langKey];
  if (!anyAddonOn && headerRe) {
    out = out.replace(headerRe, "");
  }

  // 2. Inject flight block after each known section marker.
  for (const inj of SECTION_INJECTIONS) {
    const re = inj.languages[langKey];
    const block = inj.block[langKey];
    if (!re || !block) continue;
    out = injectAfterMarker(out, re, block);
  }

  // 3. Collapse the class-menu block (three styled lines) into our single
  //    {{CLASS_LINE}} placeholder. Replace ALL occurrences — Gad sometimes
  //    repeats the menu under a "combined compartments" section.
  const menuRe = CLASS_MENU_PATTERNS[langKey];
  if (menuRe) {
    out = out.replace(menuRe, "{{CLASS_LINE}}\n");
  }

  // 4. Apply per-language manual-placeholder substitutions.
  for (const rule of PATTERN_MAP[langKey] || []) {
    out = out.replace(rule.match, rule.replace);
  }

  // 5. Cleanup pass — section removal leaves consecutive dividers and
  //    runs of blank lines. Collapse them so the output stays tidy without
  //    requiring perfect-boundary regexes per section.
  out = collapseDividers(out);

  return out;
}

// Helper: cleans up leftover dividers + blank runs after section stripping.
//
// Three problems we have to handle in order:
//   (1) Gad sprinkles zero-width-space-only lines as spacers (U+200B alone
//       on a row). When a section above them is stripped, these become
//       invisible-yet-counted blanks that hide between dividers and prevent
//       the collapse below from running. Drop them first.
//   (2) After several adjacent sections are removed, the template can have
//       multiple lonely ▔/▬ dividers separated only by blank lines (no
//       content between them). Collapse any run of 2+ divider lines —
//       mixed ▔/▬ are fine — into a single ▬ separator.
//   (3) Trim runs of 3+ blank lines down to 2 so the result doesn't have
//       awkward gaps where sections used to be.
function collapseDividers(text) {
  return text
    // (1) Lines whose only content is the zero-width space U+200B.
    .replace(/\n​(?=\n)/gu, "")
    // (2) Runs of divider lines (▔ or ▬, in any order) separated only by
    //     blanks (so `\n+` between iterations to skip empty rows that the
    //     stripped sections used to fill). 2+ in a row collapse to a
    //     single ▬ — a stronger separator since the content between
    //     them is gone.
    .replace(/(?:\n+[ \t​]*[▔▬]+[ \t​]*){2,}/gu, "\n\n▬▬▬▬▬▬▬▬")
    // (3) Limit runs of blank lines to 2 newlines.
    .replace(/\n{3,}/g, "\n\n");
}

// Finds a marker line, drops the (possibly several) blank lines immediately
// after it, and inserts `block` separated from the marker by a single blank
// line. Anything below the inserted block is preserved verbatim. If the
// marker isn't present, returns input unchanged.
function injectAfterMarker(text, markerRe, block) {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (markerRe.test(lines[i].trim())) {
      // Skip blank/whitespace-only lines after the marker.
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      const head = lines.slice(0, i + 1).join("\n");
      const tail = lines.slice(j).join("\n");
      return head + "\n\n" + block + "\n\n" + tail;
    }
  }
  return text;
}
