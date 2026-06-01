# `feature/category-picker` — Branch Summary

> Snapshot of every change on this branch, what's done per language, and a
> step-by-step checklist for porting the Hebrew-only work to English + French.

Branch base: `12.6 @ deb768f` (last committed: "airlines: add EY, A3, AA RBD mappings").
Status: uncommitted working-tree changes only (no commits yet on the branch).

---

## 1. Files Touched

| File | Status | Scope |
|------|--------|-------|
| `src/assets/airlineRbd.js` | **NEW** | Per-airline RBD → cabin class table (17 carriers). |
| `src/assets/templateAutofill.js` | **NEW** | Engine that converts Gad's manual templates into the `{{...}}` syntax + section-toggle stripping. **Hebrew only so far.** |
| `src/assets/defaultTemplates.js` | modified | New placeholders `FLIGHT_SEATS` + `FLIGHT_SEAT_LABEL`; `💺 מושב/Seat/Siege *XX*` per-flight line replaced with `💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*`; `migrateSeatPlaceholder()` added to `loadTemplate`. |
| `src/i18n/he/index.js` | modified | Added `First Cl.` translation; prefixed class names with "מחלקת"; `combined compartment` → "מחלקות מעורבות". |
| `src/i18n/en-us/index.js` | modified | Added `First Cl. / Business Cl. / Premium Eco Cl. / Economy Cl. / combined compartment` translations. |
| `src/i18n/fr/index.js` | modified | Same set of class translations in French. |
| `src/pages/messageMixin.js` | modified | Per-airline RBD lookup via `resolveFlightClass`; new `parseSeatAssignments` for SSR lines; `segmentNumber` added to parsed flights; seat list attached per flight in `getParsedFlights`. |
| `src/pages/MessageBuilder.vue` | modified | Category picker (q-select); section-toggle accordion panel; persistence helpers; `classLineFor` / `flightClassDisplay` / `flightClassFallback` / `seatLabelFor` / `groupHeaderLabel` methods; render pipeline routes custom categories through `autofillTemplate`. |
| `src/pages/Admin.vue` | modified | Preview samples + sample flight data updated to match new class labels and `CLASS_LINE` placeholder. |

---

## 2. Features Delivered

### 2.1. Per-Airline RBD → Cabin Class

- **Data file:** `src/assets/airlineRbd.js` with `AIRLINE_RBD` (17 carriers: LY, LH, LX, TK, AF, KL, DL, BA, QR, EK, UA, IB, AZ, OS, EY, A3, AA) and `resolveFlightClass(iata, rbdLetter)`.
- **Wired in:** `messageMixin.js` → `parseFlightLinePure` and `setClassOfTravel` call `resolveFlightClass`. Falls back to `null` (= unknown) when carrier or letter isn't listed.
- **Status:** language-agnostic — works the same for he/en/fr quotes.

### 2.2. Class-of-Travel Labels — Per Language

All 3 i18n files now define `First Cl. / Business Cl. / Premium Eco Cl. / Economy Cl. / combined compartment`.

| Key | he | en | fr |
|-----|----|----|----|
| `First Cl.` | מחלקה ראשונה | First Class | Cl. Première |
| `Business Cl.` | מחלקת עסקים | Business Class | Cl. Affaire |
| `Premium Eco Cl.` | מחלקת פרמיום | Premium Eco. | Cl. Premium Eco |
| `Economy Cl.` | מחלקת תיירים | Economy Class | Cl. Économique |
| `combined compartment` | מחלקות מעורבות | Combined Compartments | Compartiments combinés |

Plus the styled `{{CLASS_LINE}}` resolver in `MessageBuilder.vue:classLineFor` knows each language's emoji + label combo:

| Cabin | he | en | fr |
|-------|----|----|----|
| First | 🥇 *מחלקה ראשונה* | 🥇 *First Class* | 🥇 *Cl. Première* |
| Business | 👔 *מחלקת עסקים* | 👔 *Business Class* | 👔 *Cl. Affaire* |
| Premium Eco | 🥂*מחלקת פרמיום* | 🥂*Premium Eco.* | 🥂 *Cl. Premium Eco* |
| Economy | 💺*מחלקת תיירים* | 💺*Economy Class* | 💺 *Cl. Économique* |

**Status:** complete in all 3 languages.

### 2.3. SSR Seat Detection

- `messageMixin.js:parseSeatAssignments(rawPnr)` recognises `SSR RQST/SEAT/NSST` lines, extracts segment + passenger seats.
- Each parsed flight gets `f.seats: ["24D", "24F"]` (or `[]`).
- New placeholders: `{{FLIGHT_SEATS}}` (renders `24D, 24F` or `XX` fallback) and `{{FLIGHT_SEAT_LABEL}}` (renders the singular/plural seat word).
- `MessageBuilder.vue:seatLabelFor(seats)` picks the seat word per language: he `מושב`/`מושבים`, en `Seat`/`Seats`, fr `Siège`/`Sièges`.
- `defaultTemplates.js:migrateSeatPlaceholder` rewrites cached templates that still hold the literal `מושב *XX*` / `Seat *XX*` / `Siege *XX*` so old saves pick up real seat numbers automatically.

**Status:** language-agnostic engine; per-language label complete in he/en/fr.

### 2.4. Category Picker

- **UI:** `q-select` in the WhatsApp Preview area (`MessageBuilder.vue`), labelled in current language ("תבנית" / "Modèle" / "Template").
- **State:** `selectedTemplateCategory` data field + per-language persistence via `pickerStorageKey(lang)` (`pickerChoice:<lang>` in `localStorage`).
- **Default per language:** `he` → `custom_mpsx5w8le42j` (Standard Airfare Quote); other langs → `flight`. See `loadPickerChoice()`.
- **Hides itself** when only `flight` is available (`v-if="categoryOptions.length > 1"`).

**Status:** language-agnostic. UI labels already localised.

### 2.5. Auto-Fill Engine + Section Toggles (Hebrew only)

`src/assets/templateAutofill.js` exports:
- `OPTIONAL_SECTIONS` — registry of toggleable section regexes (per language).
- `SECTION_SUPPORT` — categories that opt into the toggle panel (per language).
- `autofillTemplate(tpl, lang, toggles)` — the engine.

Pipeline (in order):
1. Normalise CRLF → LF.
2. **Strip optional sections** that are off (per-language regexes).
3. **Auto-managed wrapper headers** (only 🟦 add-ons currently): if no sub-toggle is on, drop the header line.
4. **Inject standard flight block** after the language's itinerary marker (`*מסלול הטיסות 🌍*` / `*Itinerary 🌍*` / `*Itinéraire 🌍*`).
5. **Collapse class-menu blocks** to `{{CLASS_LINE}}`.
6. **Apply manual placeholder substitutions** (`PATTERN_MAP[lang]`).
7. Cleanup pass — collapse duplicate dividers / triple blanks.

### 2.6. Section Toggle Panel (Hebrew only)

- **Desktop (≥1100px):** Right-column panel beside the centred phone preview. 3-column grid `1fr | 640px | 1fr`.
- **Mobile (<1100px):** Accordion ABOVE the preview (via `order: -1`), collapsed by default, max-height 55vh, scroll inside.
- **Per row:** `[icon] [label] [checkbox]` with hover and on-state styling. Sub-items (with `group:` field) are indented and prefixed by a group header.
- **Toggles persist** per `(lang, category)` via `sectionTogglesKey(lang, category)` in `localStorage`.
- **Sections initialised to `false`** explicitly (no Quasar indeterminate `-` state).

#### Current Hebrew section registry (15 toggles, 4 groups)

| Group | Key | Icon | Label |
|-------|-----|------|-------|
| preferences | pref_seat | 🪑 | מספר מושב + סוג |
| preferences | pref_meal | 🍽️ | העדפת ארוחה |
| preferences | pref_wheelchair | ♿ | כיסא גלגלים |
| — | codeshare_notes | 🤝 | הערות קודשייר |
| — | combined_compartments | 🔀 | שילוב מחלקות בטיסות |
| — | extended_caveat | ⚠️ | לתשומת לבך מורחב (3 שורות) |
| addons | addon_preferred_seats | 🪑 | מושב מועדף |
| addons | addon_space_seats | ⭐ | מושב ספייס |
| addons | addon_extra_baggage | 🛄 | מזוודה נוספת |
| addons | addon_elal_protect | 🛡️ | אלעל פרוטקט |
| — | detailed_baggage | 🧳 | כבודה מורחבת (4 אפשרויות) |
| — | detailed_seats | 💺 | הושבה מראש מורחבת |
| — | tariff_tier_second | 💸 | תנאי כרטיס: +72h / -72h |
| — | extended_issuance_options | ⏰ | אופציות מועד הנפקה (מיידי / 24 / 48 / 72) |
| — | completion_instructions | ✅ | הוראת סיום הזמנה |

Auto-managed wrapper: `🟦 תוספות אופציונליות` header is stripped when all 4 `addon_*` toggles are off.

Group labels (from `MessageBuilder.vue:groupHeaderLabel`):
- `preferences` → 🧑‍✈️ העדפות פר־טיסה
- `addons` → 🟦 תוספות אופציונליות

---

## 3. Per-Language Status Matrix

| Feature | he | en | fr |
|---------|----|----|----|
| Per-airline RBD class lookup | ✅ | ✅ | ✅ |
| Class i18n keys (First/Business/Premium/Economy/Combined) | ✅ | ✅ | ✅ |
| `{{CLASS_LINE}}` styled lines (emoji + label) | ✅ | ✅ | ✅ |
| `{{FLIGHT_CLASS}}` per-flight (auto-translated) | ✅ | ✅ | ✅ |
| Seat detection (SSR parser) | ✅ | ✅ | ✅ |
| Seat label singular/plural (`seatLabelFor`) | ✅ | ✅ | ✅ |
| Category picker label | ✅ | ✅ | ✅ |
| Category default (per-language picker default) | ✅ Standard | ✅ flight | ✅ flight |
| `autofillTemplate` — manual placeholders | ✅ 5 patterns | ⚠️ 2 patterns | ❌ empty `[]` |
| `autofillTemplate` — itinerary marker (flight injection) | ✅ | ✅ | ✅ |
| `autofillTemplate` — class menu collapse | ✅ | ✅ | ✅ |
| Optional sections registry | ✅ 15 toggles | ❌ none | ❌ none |
| Auto-managed wrapper headers | ✅ 🟦 add-ons | ❌ none | ❌ none |
| Section panel UI text (title, group labels) | ✅ Hebrew | ⚠️ "Optional sections" only | ⚠️ "Sections optionnelles" only |
| Standard Airfare Quote template in Supabase | ✅ exists (`custom_mpsx5w8le42j` / he) | ❓ Gad-authored — needs check | ❓ Gad-authored — needs check |

✅ Done · ⚠️ Partial · ❌ Missing · ❓ Depends on Gad's Admin content

---

## 4. Porting Checklist — Apply to All Languages

The Hebrew-specific work that needs replication is concentrated in 2 files:
`src/assets/templateAutofill.js` and the section-panel UI labels in `src/pages/MessageBuilder.vue`.

### 4.1. Pre-requisites (do these first)

1. **Read each language's `Standard Airfare Quote` row from Supabase** (`category = custom_mpsx5w8le42j`, `lang ∈ {en, fr}`) and save copies to `/tmp/pilot-template-{en,fr}.txt`.
   ```bash
   curl -sS "https://vvsvbiudqzislexwzzlk.supabase.co/rest/v1/templates?select=value&category=eq.custom_mpsx5w8le42j&lang=eq.en" \
     -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
   ```
2. Confirm en/fr templates **exist** and that Gad authored them with the same structural skeleton as the Hebrew version (same dividers, same section ordering). If not, either ask him to align them or write per-language patterns from scratch.

### 4.2. For each new language (`en`, `fr`):

For every section in the table below, port the pattern by translating Gad's literal text:

| Language step | File | What to add |
|---|---|---|
| ① Manual placeholders | `templateAutofill.js:PATTERN_MAP[lang]` | Customer name, ticket-issuance line, destination, airline-code legend `(LY,XX)` — translated regexes. |
| ② Optional sections registry | `templateAutofill.js:OPTIONAL_SECTIONS[lang]` | All 15 toggles. Each needs: key (reuse the Hebrew key for cross-lang persistence), icon, **localised label**, **localised pattern** (regex against translated text), and `group` if applicable. |
| ③ Auto-managed wrappers | `templateAutofill.js:ADDONS_HEADER_PATTERNS[lang]` | The 🟦 wrapper header regex in the new language's wording. Add new ones if Gad introduces wrapper headers (🛑 caveats, 🧳 baggage, 💺 seats) — currently only 🟦 is auto-managed. |
| ④ Standard flight block | `templateAutofill.js:STANDARD_FLIGHT_BLOCK[lang]` | Already present for all 3 langs. Leave alone unless wording changes. |
| ⑤ Class menu patterns | `templateAutofill.js:CLASS_MENU_PATTERNS[lang]` | Already present for all 3 langs. |
| ⑥ Itinerary marker | `templateAutofill.js:SECTION_INJECTIONS[*].languages[lang]` | Already present for all 3 langs. |
| ⑦ Category opt-in | `templateAutofill.js:SECTION_SUPPORT[custom_mpsx5w8le42j][lang]` | Add `en: true` and `fr: true` once their toggles are wired. |
| ⑧ Picker default (optional) | `MessageBuilder.vue:loadPickerChoice` | Decide whether en/fr also default to the Standard Airfare Quote (replace `lang === "he" ?` line with a per-lang map). |
| ⑨ Section panel title | `MessageBuilder.vue` (the `aside` block) | Already localised ("סקציות אופציונליות" / "Sections optionnelles" / "Optional sections"). |
| ⑩ Group header labels | `MessageBuilder.vue:groupHeaderLabel` | Currently returns Hebrew text only. Either accept the language as a 2nd arg or change to a `{ [lang]: { [group]: label } }` map. |

### 4.3. Verification per language

Run this from the project root after porting each language:

```bash
node -e "
const { autofillTemplate, OPTIONAL_SECTIONS } = require('./src/assets/templateAutofill.js');
const fs = require('fs');
const orig = fs.readFileSync('/tmp/pilot-template-en.txt', 'utf8');
const sections = OPTIONAL_SECTIONS.en;
let pass = 0;
for (const sec of sections) {
  if (orig.replace(/\r\n?/g,'\n').match(sec.pattern)) pass++;
  else console.log('MISS:', sec.key);
}
console.log('Patterns:', pass + '/' + sections.length);
const allOff = autofillTemplate(orig, 'en', {});
console.log('All-off output bytes:', allOff.length);
"
```

Then test in the running app: switch language, pick the Standard Airfare Quote, toggle each section on/off and confirm the preview tracks.

### 4.4. Sanity guard — keep Supabase untouched

Every iteration:
```bash
curl -sS "https://vvsvbiudqzislexwzzlk.supabase.co/rest/v1/templates?select=value&category=eq.custom_mpsx5w8le42j&lang=eq.he" \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON" | \
  python3 -c "import json,sys,hashlib; d=json.loads(sys.stdin.read()); print(hashlib.md5(d[0]['value'].encode()).hexdigest())"
```
Compare against the backup at `/tmp/pilot-template-backup.txt`. The MD5 must stay constant.

---

## 5. Open Issues / Known Limitations

1. **`fr` PATTERN_MAP is empty.** Even French templates won't get manual placeholders substituted. Highest-priority item when porting.
2. **Group labels (`groupHeaderLabel`) are Hebrew-only.** Will display Hebrew text inside an English/French panel until updated.
3. **The 🟦 auto-managed header logic is hardcoded to `ADDONS_HEADER_PATTERNS`.** If en/fr need other wrappers stripped, generalise to an array-of-headers + array-of-keys structure (the earlier `AUTO_HEADERS` design from the reverted batch can be reinstated cleanly).
4. **`migrateFlightClassPlaceholder` and `migrateSeatPlaceholder`** run against all saved templates. They already cover all 3 languages (he/en/fr) for the seat literal. Verify no double-migration after porting.
5. **Per-airline RBD table covers 17 carriers.** If a quote pops `flightClass = null` in production, that's an unmapped carrier or RBD letter — extend `airlineRbd.js`.

---

## 6. Files at a Glance

```
src/
├── assets/
│   ├── airlineRbd.js              (NEW)  17-carrier RBD table + resolver
│   ├── templateAutofill.js        (NEW)  Engine — Hebrew-complete; en/fr need porting
│   ├── defaultTemplates.js        (mod)  Seat placeholders + migration
│   └── consts.js                  (—)    Untouched; CLASSES_TYPE_MAP still used as fallback by setClassOfTravel
├── i18n/
│   ├── he/index.js                (mod)  4 class labels + combined
│   ├── en-us/index.js             (mod)  same
│   └── fr/index.js                (mod)  same
└── pages/
    ├── messageMixin.js            (mod)  RBD lookup + SSR seat parser + segmentNumber
    ├── MessageBuilder.vue         (mod)  Picker + panel + persistence + 5 new methods
    └── Admin.vue                  (mod)  Preview samples synced
```
