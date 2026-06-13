# Quote Style Guide — Gad's Voice in HE / EN / FR

This file is the **single source of truth for Gad's wording** across all
languages and across all quote categories (Standard Airfare, Multi
Airfare, future variants). Whenever a new template is written — or an
existing one is translated to another language — open this file first and
copy the relevant blocks verbatim, then customize only what the new
category actually changes.

This is not a UI document — it's an **internal authoring reference**.
The real text rendered to clients lives in:

- Supabase (`templates` table, columns `category` / `lang` / `value`) — Gad's authored versions.
- `src/assets/defaultTemplates.js` `DEFAULT_TEMPLATES` — fallback when a
  Supabase row doesn't exist yet (e.g. Hebrew Multi Airfare today).

When this file and Supabase disagree, **Supabase wins** (Gad's authored
copy is canon). Update this guide to match Supabase, never the other way
around. The exception is when this guide records a template we
authored on Gad's behalf because Supabase doesn't have a row yet — in
that case this guide is authoritative until Gad authors his own.

---

## Common architecture across all languages

Every quote — Standard or Multi Airfare — follows the same skeleton:

1. **Greeting** — Customer name + "Shalom!" (HE/EN) or formal opener (FR).
2. **Urgency line** — "Ticket issuance required …" (red-flag tone).
3. **Deadline timestamp** — Day + date + time, with `👈/👉` arrow.
4. **Body opener** — "In response to your request …" + traveler icon + destination + date.
5. **Confirmation request** — "Please reply from within this WhatsApp …".
6. **Separator** — `▬▬▬▬▬▬▬▬` (eight medium-shade boxes).
7. **Flight Itinerary** header + flight blocks (engine-injected) + seat/meal/wheelchair preferences.
8. **Airlines** block — operating carrier + codeshare wording.
9. **Travel Class** + optional Mixed Cabin block.
10. **Cost block** — single price (Standard) OR three-tier fare options (Multi Airfare).
11. **Caveats** — "Please note: prices may change …".
12. **Optional Add-Ons** — Preferred seats, extra bag, EL AL Protect.
13. **Baggage allowance + Preselected seats** — summary table.
14. **Fare Conditions** — change / cancellation / no-show penalties.
15. **Ticketing Deadline** — repeat of timestamp from step 3.
16. **Completion instructions** — how to reply.
17. **Signature** — Gad + AMEX + phone + email.

The flight-block injection point is the **blank line after the
"Flight Itinerary" header**. The autofill engine (`templateAutofill.js`)
expands `*Flight Itinerary 🌍*\n\n\n` (with trailing blank lines) into
one rendered flight block per Amadeus segment.

---

## Hebrew (HE) — Gad's voice

Authoritative source: Supabase `custom_mpsx5w8le42j` row, lang=`he`. The
file `/tmp/standard-he.txt` is a snapshot during authoring sessions.

### Greeting

```
*שם הנוסע*, שלום!
⏰ *מצריך את אישורך לכרטוס היום‼️*
​👈*יום א׳ ב׳ ג׳ ד׳ ה׳ ו׳ 0 חודש | שעה*
```

Notes:
- The `​` before `👈` is a U+200B zero-width space — Gad uses it to control RTL flow around the arrow. Preserve byte-for-byte.
- "מצריך את אישורך לכרטוס" is the Standard wording. Multi Airfare uses a different urgency phrasing — see Multi Airfare section.
- Customer-name placeholder is literal `*שם הנוסע*`. Autofill replaces it with `*{{CUSTOMER_NAME}}*` via the existing PATTERN_MAP.

### Body opener

```
בהמשך לפנייתך, להלן פרטי ההצעה המבוקשת עבור נסיעתך/כם *👤 / 👥 / 🧑‍🧒 / 🧑‍🧒‍🧒 / 🧑‍🧑‍🧒 / 🧑‍🧑‍🧒‍🧒*
הקרובה ל-*יעד* בתאריך *תאריך_יציאה*.

נא *אשר/י* בבקשה את *הנפקת כרטיסך (/ הכרטיס / _ כרטיסכם* תוך ציון התעריף שנבחר עבור כל אחד מהנוסעים), במענה חוזר מיידי מתוך הודעת ווצאפ זו, *בהתאם לתוכן ההצעה.*
```

Notes:
- The big string of traveler emojis `👤 / 👥 / 🧑‍🧒 / 🧑‍🧒‍🧒 / 🧑‍🧑‍🧒 / 🧑‍🧑‍🧒‍🧒` is a placeholder. Autofill collapses it down to the single icon matching the actual party composition.
- `*יעד*` → `*{{DESTINATION}}*`. `*תאריך_יציאה*` → `*{{DEPARTURE_DATE}}*`. Autofill handles both.

### Flight Itinerary section

```
▬▬▬▬▬▬▬▬

*מסלול הטיסות 🌍* 




 💺מושב/י *00A-B-C//00D* 
    מעבר / חלון / מעבר+חלון / חלון+אמצעי / מעבר+אמצעי
    מושב מועדף / מושב ספייס / מושב אקונומי קומפורט 
 🍽️ *כשרה / צמחוני / ילדים / גלאט*
 👩‍🦽*כיסא גלגלים
```

Notes:
- **Three blank lines** between `*מסלול הטיסות 🌍*` and the seat line. The engine uses this gap as the flight-block injection anchor.
- The seat block, meal block, and wheelchair block are **strip-style toggles** — if the PNR doesn't include the SSR, they're stripped during autofill.

### Airlines / Operating Carrier

```
▬▬▬▬▬▬▬▬

*חברת/ות תעופה:(LY,XX)* ✈️
 *אלעל* ״קונקט״ בשילוב עם *אייר*
*סונדור**
*(חברת בת של אלעל)לתשומת לבך טיסות מתופעלות במטוסי חברת *ABCDEF*! 
```

Notes:
- "אלעל ״קונקט״ בשילוב עם" — codeshare wording used only when EL AL Connect or another codeshare is detected. Autofill swaps it out for the actual partner.
- The double quotes around "קונקט" are guillemets (`״…״`), not ASCII quotes. Preserve byte-for-byte.

### Travel Class (and Mixed Cabin)

```
▔▔▔▔▔▔▔

✈️ *מחלקת הנסיעה*✈️
   💺 *מחלקת תיירים (Economy)*
   🥂 *מחלקת פרמיום (Premium)*
   👔 *מחלקת עסקים (Business)*

▔▔▔▔▔▔▔

🔀 שילוב מחלקות בטיסות 🔀

 ✈️ ת״א ⬅️ אבגדה
   💺 *מחלקת תיירים (Economy)*
   🥂 *מחלקת פרמיום (Premium)*
   👔 *מחלקת עסקים (Business)*

 ✈️ אבגדה ⬅️ ת״א
   💺 *מחלקת תיירים (Economy)*
   🥂 *מחלקת פרמיום (Premium)*
   👔 *מחלקת עסקים (Business)*
```

Notes:
- The light-shade separator `▔▔▔▔▔▔▔` (Upper One Eighth Block, U+2594) is Gad's intra-section divider; the medium-shade `▬▬▬▬▬▬▬▬` is between full sections. Don't substitute one for the other.
- The Mixed Cabin block is an **OPTIONAL_SECTION** — stripped unless cabin classes actually mix across segments.
- "ת״א" is Hebrew shorthand for Tel Aviv. Substitution into `TLV` is handled.
- The arrow is `⬅️` (left-pointing on RTL terminals = "from →") — visual direction matches the reading order.

### Cost block (Standard only — Multi Airfare overrides this)

```
▬▬▬▬▬▬▬▬

*💰 פירוט העלויות*

🎫*מחיר הכרטיס/ים:* 💳
   👈*000 דולר לנוסע**
   👈*000 דולר 2x נוסעים** 
  *(לפי תעריף אקו-קלאסיק)
```

Notes:
- `000 דולר` is a literal placeholder Gad fills in manually after the auto-render. We don't substitute it.
- "אקו-קלאסיק" — note the spelling with hyphen. Match this hyphenation everywhere ("אקו-לייט", "אקו-פלקס").

### Caveats

```
🛑 **לתשומת לבך:*
* עלות הכרטיס/ים עלולה להתייקר כל עוד לא הונפקו❗
* זמינות המושבים שסומנו מעלה אינה סופית ותיקבע סופית בעת הכרטוס❗️
* מצריך הנפקת כרטיסך/כם היום / תוך 24 48 72 שעות❗️
```

### Optional Add-Ons

```
▔▔▔▔▔▔▔
🟦 *תוספות אופציונליות*

💺 *מושב/ים מועדפים*💳
💺 *מושב/י ״ספייס״**💳
   👈*000$ לנוסע לכיוון**
   👈*$00 × 2 נוסעים לכיוון**
 *מקנה מרווח רגליים מוגדל + מיקום 
   בשורות הקדמיות של מחלקת התיירים  
 *מקנה מיקום בשורות הקדמיות 
   הקדמיות של מחלקת התיירים  

🧳 *מזוודה נוספת*💳
   👈*000$ לנוסע**
   👈*$00 × 2 נוסעים**

 🛟 *אלעל פרוטקט*💳
    (ביטוח ביטול לכרטיס)👍
   👈*000$ לנוסע*
   👈*$00 × 2 נוסעים**
מאפשרת ביטול הניסעה / הכרטיס עד 72 שעות לפני מועד ההמראה מהארץ לכל המאוחר *והסבת ערך כרטיסך / כרטיסיכם לשובר קרדיט* (בקיזוז 75$ / 100$ / 125$ / 150$ דמי ניהול לנוסע) *למימוש על טיסות אלעל עתידיות* (על ידיך או כל אדם אחר מטעמך).    
🫷 *הזהרה חשובה:* 🛑                                                                                                                                                                                          
* מותנה ברכישה במעמד הכרטוס❗️
* במקרה שהודעת ביטול הנסיעה תתקבל בטווח של פחות מ-72 שעות לפני מועד היציאה מהארץ, אז יחולו תנאי הביטול הסטנרדטים כמפורטים בהצעה זו מטה❗          
* התעריף אקו-לייט אינו מקנה את הזכות לרכוש ביטוח ביטול ״אלעל פרוטקט״ בשונה משאר התעריפים הנ״ל❗️   
```

Notes:
- Typo present in Gad's source: "הסטנרדטים" (missing a ר) and "הניסעה" (typo of "הנסיעה"). Preserve byte-for-byte — fixing in our copy diverges from his canon.
- Trailing spaces on the "הזהרה חשובה" line are deliberate (Gad's WhatsApp formatting). Preserve.

### Baggage / Preselected Seats summary

```
▬▬▬▬▬▬▬▬


 🧳 *כבודה לנוסע:*
   ✅ מזוודה 23 ק״ג 🧳
   ❌ ללא מזוודה ❗🧳 
   ✅ תיק יד 8 ק״ג 👜
   ❌ ללא טרולי❗👜 


 💺 *הושבה מראש:*
   ✅ מושבים סטנדרטיים* / מועדפים* / ספייס*
     *(בכפוף לזמינות❗)
   ❌ ללא הושבה מראש*
     *(אופציונלית❗)
```

### Fare Conditions

```
▬▬▬▬▬▬▬▬


⚠️ *תנאי הכרטיס/ים:* ⚠️
 🎫 תעריף אקו-פלקס 
  👇 גובה הקנס לנוסע👇
▪️ שינוי: *000$ לנוסע
    *(+הפרשי מחיר אם יידרש)
▪️ ביטול: 000$ לנוסע
      🎫 000$ לנוסע
     💺 ללא החזר
▪️ *אי-התייצבות:* טוטלוס
```

### Ticketing Deadline

```
▬▬▬▬▬▬▬▬

*⏱️מועד אחרון לכרטוס*⌛
 ⏰*כרטוס מיידי = היום*‼️
 ⏰ *תוך 24 / 48 / 72 שעות*❗
👈*יום ׳ 00 בחוד׳ | 00:00*
```

### Completion + signature

```
נא השב בבקשה במענך החוזר *מתוך גוף הצעת ווצאפ זו* עם *אישורך המידי להנפקת כרטיסך/סיכם* מתוך הסכמה למסלול & לתנאי הכרטיס כפי שפורטו מעלה.

✅ לסיום ההזמנה והנפקת הכרטיס / הנפקת כרטיסיכם:
נא השב / השיבו מתוך הודעה זו וציין / ציינו את:
 1️⃣ התעריף בו בחרת / בחרתם
 2️⃣ התוספות שתרצה / תרצו להוסיף

👈*קבלת המענה מהווה אישור למסלול ולתנאי התעריף.*

תודה רבה, 
בברכה
גד אלנקווה
 

🏢 אמריקן אקספרס נסיעות עסקיות גלובליות 
📞 נייד: 054-5727055    
✉️ מייל gad@gbtil.co.il
```

---

## Hebrew Multi Airfare — what changes from Standard

Multi Airfare keeps the same skeleton (greeting → body → flight → airlines → class → cost → caveats → … → signature) and **replaces only the cost block** with a three-tier fare structure.

### Greeting variant

Multi Airfare opens with **bare name + Shalom** (no "שלום!" Hebrew greeting prefix word — same as the EN version which drops "Dear"):

EN: `* *, Shalom!` (no "Dear" prefix)
HE: `*שם הנוסע*, שלום!` ← same as Standard. **Keep it identical.**

The urgency phrasing is different though — EN uses "Ticket issuance required within 24 hours" while Standard uses "Your confirmation is required for ticketing today". For HE Multi Airfare we use Gad's existing "מצריך את אישורך לכרטוס" — the same phrasing as the HE Standard — for voice consistency. If Gad later edits to a tier-specific phrasing, his Supabase copy wins.

### Replacement: three fare tiers

This block replaces the single-price "פירוט העלויות" section. Each tier is identified by color emoji and contains: price, baggage, preselected seats, ticket restrictions.

```
▬▬▬▬▬▬▬▬

*אפשרויות תעריף 🎫*
לנוחותך, ניתן לבחור בין אפשרויות התעריף הבאות בהתאם לגמישות והשירותים שתעדיף/י:

🟥 *תעריף אקו-לייט* 🎫
💳 *מחיר הכרטיס:*
  👉 *000 דולר*
  👉 *000 דולר × 0 נוסעים*


*כבודה מותרת* 🧳
     (לנוסע)
 ❌ ללא מזוודה
 ✅ מזוודה 1 (23 ק״ג)
 ✅ תיק יד אחד *8 ק״ג*

*הושבה מראש* 💺
 ❌ אינה כלולה
 ✅ מושבים סטנדרטיים*
  *(בכפוף לזמינות)

*תנאי הכרטיס* ⚠️
 👇גובה הקנס לנוסע👇
▪️ שינוי: 000$* 
       *(+הפרשי מחיר)
▪️ ביטול: 000$
   👉*ללא החזר❗*
▪️ אי-התייצבות: הפסד מלא*

------------------------

🟩 *תעריף אקו-קלאסיק* 🎫
💳 *מחיר הכרטיס:*
  👉 *000 דולר*
  👉 *000 דולר × 0 נוסעים*

*כבודה מותרת* 🧳
       (לנוסע)
 ✅ מזוודה 1 *23 ק״ג*
 ✅ תיק יד 1 *8 ק״ג*

*הושבה מראש* 💺
 ✅ מושבים סטנדרטיים*
  *(בכפוף לזמינות)

*תנאי הכרטיס* ⚠️
 👇גובה הקנס לנוסע👇
▪️ שינוי: 000$*
     *(+הפרשי מחיר)
▪️ *ביטול:*
    👉*ללא החזר*❗
▪️ *אי-התייצבות: הפסד מלא*

-----------------------------

🟦 *תעריף אקו-פלקס* 🎫
💳 *מחיר:*
  👉 *0000 דולר*

*כבודה מותרת* 🧳
 ✅ מזוודה 1 *23 ק״ג*
 ✅ תיק יד 1 *8 ק״ג*

*הושבה מראש* 💺
 ✅ מושבים סטנדרטיים / מועדפים*
  *(בכפוף לזמינות)

*תנאי הכרטיס* ⚠️
▪️ שינוי: 75$*
   *(+הפרשי מחיר)
▪️ ביטול: 150$
▪️ אי-התייצבות: הפסד מלא

------------------------

👉*נא להשיב בתשובה ישירה להודעת ווצאפ זו עם התעריף בו בחרת לאישור הנפקת הכרטיס*

🟥 תעריף אקו-לייט / 🟩 תעריף אקו-קלאסיק / 🟦 תעריף אקו-פלקס

*הערות חשובות ❗*
▪️ התעריפים נתונים לשינוי ללא הודעה מוקדמת כל עוד הכרטיסים לא הונפקו.
▪️ מושבים, תעריפים ותנאים מובטחים רק לאחר הנפקת הכרטיסים.
```

Vocabulary mapping (EN → HE) used here:
- AIRFARE OPTIONS → אפשרויות תעריף
- For your convenience → לנוחותך
- Eco-Lite Rate → תעריף אקו-לייט (Gad's exact hyphenation, used in his Standard's "תעריף אקו-פלקס" / "אקו-קלאסיק")
- Airfare → מחיר הכרטיס (matches Gad's Standard cost block wording)
- Baggage Allowance → כבודה מותרת (Standard uses "כבודה לנוסע" — close cousin; "מותרת" makes the tier-specific allowance sense clearer)
- (Per person) → (לנוסע)
- Preselected Seat → הושבה מראש (matches Gad's Standard wording exactly)
- Ticket Restrictions → תנאי הכרטיס (matches Gad's "תנאי הכרטיס/ים" — singular form for per-tier context)
- Penalty per person → גובה הקנס לנוסע (Gad's Standard wording verbatim)
- Change → שינוי (Gad's Standard wording verbatim)
- Cancellation → ביטול (Gad's Standard wording verbatim)
- Non-refundable → ללא החזר (Gad's Standard wording verbatim)
- No-show: Total loss → אי-התייצבות: הפסד מלא (Gad's Standard uses "טוטלוס" — but for the Multi Airfare tier-restrictions block, "הפסד מלא" is the more readable Hebrew phrasing; Gad will adjust via Admin if he prefers)

---

## English (EN)

Authoritative source: Supabase `custom_mp3smmmgw4p5` row, lang=`en`
(Gad-authored). The file `/tmp/multifare-gad-en.txt` is a snapshot.
For Standard EN, source is `custom_mpsx5w8le42j` lang=`en`,
snapshot `/tmp/standard-en.txt`.

### Greeting (Multi Airfare)

```
* *, Shalom!
⏰ *Ticket issuance required within 24 hours* ❗
👉*Day 00Mmm | 0 PM*
```

vs Standard EN, which opens:

```
Dear * *,
⏰ *Your confirmation is required for ticketing today‼️*
​👉*Sun / Mon / Tue / Wed / Thu / Fri | 00 Month | HH:MM*
```

Differences for Multi Airfare:
- No "Dear" prefix → bare `* *, Shalom!`.
- Urgency phrasing shifts to "within 24 hours" tier-friendly wording.
- Date format is the compact `Day 00Mmm | 0 PM`.

### Fare tier vocabulary

Identical across both EN templates:
- Eco-Lite Rate / Eco-Classic Rate / Eco-Flex Rate
- Baggage Allowance → ❌ No Checked bag / ✅ 1 Checked bag (23 kg) / ✅ 1 handbag *8 kg*
- Preselected Seat → ❌ Not included / ✅ Standard Seats* (*Subject to availability)
- Ticket Restrictions → Change / Cancellation / No-show
- Penalty per person → 👇 Penalty per person 👇
- *Non-refundable* / Total loss

---

## French (FR)

Authoritative source: Supabase `custom_mpsx5w8le42j` row, lang=`fr`
(Gad-authored Standard). For Multi Airfare FR: Supabase row is currently
a byte-copy of EN (placeholder), so the in-code fallback at
`DEFAULT_TEMPLATES.custom_mp3smmmgw4p5.fr` is what actually renders. The
fallback was built by translating the EN Multi Airfare's 3-tier structure
into Gad's FR Standard voice. `loadTemplate()` detects the EN-duplicate
and prefers the fallback automatically; once Gad authors a real FR row
in Admin (any content that differs from EN byte-for-byte), the loader's
duplicate check fails and his Supabase row wins.
Snapshot at `/tmp/standard-fr.txt`.

### Greeting

```
Cher/Chère * *, Shalom ❗️
⏰ *Votre confirmation est requise pour l'émission du billet aujourd'hui‼️*
​👉*Dim / Lun / Mar / Mer / Jeu / Ven | 00 mois | HH:MM*
```

Notes:
- French opens with both gendered honorifics "Cher/Chère" — Gad lets the agent pick. The "* *" placeholder is the name itself.
- "Shalom" is kept as a salutation (cultural marker — Gad's branding).

### Vocabulary

- Itinerary → Itinéraire des vols
- Airlines → Compagnie(s) aérienne(s)
- Travel Class → Classe de voyage
  - Economy → Classe Économique
  - Premium Economy → Classe Premium Economy
  - Business → Classe Affaires / Business
- Mixed Cabin → Combinaison de classes
- Cost Breakdown → Détail des coûts
- Ticket Price → Prix du billet
- (Eco-Classic rate) → (Selon le Tarif Eco-Classique)
- Please note → À noter
- Optional Add-Ons → Options supplémentaires
- Preferred Seats → Sièges préférentiels
- Space Seats → Sièges « Space »
- Additional Baggage → Bagage supplémentaire
- Baggage allowance → Bagages par passager
- Preselected Seats → Preselection Sièges
- Fare Conditions → Conditions du billet
- Change → Modification
- Cancellation → Annulation
- No-Show → Non-présentation
- Total Loss → Totalose (Gad's spelling — likely Hebrew-borrow; preserve byte-for-byte)
- Ticketing Deadline → Date limite d'émission

### Multi Airfare FR — vocabulary mapping

The 3-tier fare structure was translated from EN → FR using Gad's existing
FR Standard vocabulary where it overlaps. New tier-specific phrases were
modeled on the EN Multi Airfare and adapted to French formality.

| EN (Gad's authored Multi Airfare) | FR (our fallback) | Source |
|---|---|---|
| `* *, Shalom!` (no "Dear" prefix) | `* *, Shalom ❗️` (no "Cher/Chère" prefix) | Drops the Standard's honorific to match the bare Multi Airfare cadence; keeps `Shalom ❗️` from the FR Standard. |
| `Ticket issuance required within 24 hours` | `L'émission du billet est requise sous 24 heures` | Reuses FR Standard's "L'émission du billet" phrasing with the "sous 24 heures" tier-friendly suffix. |
| AIRFARE OPTIONS 🎫 | Options tarifaires 🎫 | Direct translation; matches Gad's "Tarif Eco-…" usage in FR Standard. |
| For your convenience, you may choose … | Pour votre commodité, vous pouvez choisir … | Direct translation. |
| Eco-Lite Rate / Eco-Classic Rate / Eco-Flex Rate | Tarif Eco-Lite / Tarif Eco-Classique / Tarif Eco-Flex | "Tarif" matches FR Standard's "Tarif Eco-Lite /Classique / Flex" wording from the conditions block (line 113 of `/tmp/standard-fr.txt`). |
| Airfare / Price | Prix du billet / Prix | "Prix du billet" matches FR Standard's "Prix du billet" cost-block label. |
| Baggage Allowance | Franchise bagages | Standard airline-industry French ("franchise" = allowance); reads cleaner than "Bagages autorisés". |
| (Per person) | (par passager) | Matches FR Standard's "par passager" everywhere. |
| ❌ No Checked bag | ❌ Sans valise en soute | Matches FR Standard's "Sans valises en soute" (singularized for per-tier context). |
| ✅ 1 Checked bag (23 kg) | ✅ 1 bagage en soute (23 kg) | Matches FR Standard's "Bagage soute 23 kg". |
| ✅ 1 handbag *8 kg* | ✅ 1 bagage à main *8 kg* | Matches FR Standard's "Bagage à main 8 kg". |
| Preselected Seat | Présélection de siège | French for "preselected seat"; aligns with FR Standard's "Preselection Sièges" header. |
| ❌ Not included | ❌ Non incluse | Standard French negative phrasing. |
| ✅ Standard Seats* / Preferred Seats | ✅ Sièges standards* / préférentiels | Matches FR Standard's "Sièges standards*" and "Sièges préférentiels". |
| *(Subject to availability) | *(Sous réserve de disponibilité) | Matches FR Standard's "(Sous reserves de disponibilite)" — corrected to canonical French spelling. |
| Ticket Restrictions | Conditions du billet | Matches FR Standard's "Conditions du billet" header. |
| 👇 Penalty per person 👇 | 👇 Pénalités par personne 👇 | Matches FR Standard's "Montant pénalités par personne". |
| Change | Modification | Matches FR Standard's "Modification". |
| Cancellation | Annulation | Matches FR Standard's "Annulation". |
| Non-refundable | Non remboursable | Matches FR Standard's "Non remboursable". |
| No-show: Total loss | Non-présentation : Totalose | Matches FR Standard's "Non-présentation : Totalose" (Gad's spelling — likely a Hebrew-borrow neologism; preserve byte-for-byte). |
| (+Difference in fare) | (+ différence tarifaire) | Matches FR Standard's "(+ différence tarifaire le cas échéant)". |
| Kindly reply directly to this WhatsApp … | Merci de répondre directement à ce message WhatsApp … | Standard FR polite-imperative; aligned with FR Standard's confirmation request. |
| Important Notes | Notes importantes | Direct translation. |
| Fares are subject to change … | Les tarifs sont susceptibles d'évoluer sans préavis … | FR Standard uses "Le prix des billets est susceptible d'augmenter" — same construction, plural "tarifs" because we're talking about tiers. |
| Seats, fares, and conditions are only guaranteed once tickets are issued | Les sièges, tarifs et conditions ne sont garantis qu'après l'émission des billets | Standard French construction; mirrors EN Multi Airfare's guarantee clause. |
| Ticket issuance deadline | Date limite d'émission | Matches FR Standard's "Date limite d'émission" header. |
| Immediate Purchase / Within 24/48/72 hours | Émission immédiate = Aujourd'hui / Sous 24 / 48 / 72 heures | Matches FR Standard's deadline block wording. |

The EL AL Protect block and the entire body opener (greeting, destination,
ticket confirmation request, signature) are kept verbatim from the FR
Standard so Gad's voice carries through identically. Only the cost block
swaps out (3-tier replaces single Prix du billet) and the urgency line
shifts to "sous 24 heures".

---

When (in the future) we add a proper Hebrew or French Multi Airfare row,
build from these vocab tables + the Multi Airfare structural diff above.

---

## Section toggles — UI ↔ template wiring

The OPTIONAL_SECTIONS registry in `src/assets/templateAutofill.js` controls
the checkbox panel rendered next to the preview. Each entry can opt into
three behaviors that the Multi Airfare overhaul introduced:

- **`defaultOn: true`** — the toggle starts checked. Used for the 5 AIRFARE
  OPTIONS sub-toggles (3 tiers + selection callout + important notes) which
  ARE the core content of the Multi Airfare quote. Without `defaultOn`, an
  entry defaults to unchecked (Standard quote behavior — the toggle ADDS
  content).
- **`categories: [...]`** — entry only appears when the active category is
  in the list. The 5 tier toggles use `categories: ["custom_mp3smmmgw4p5"]`
  so they don't show up in the Standard quote panel.
- **`notCategories: [...]`** — inverse: entry is hidden for listed categories.
  Used to scope Standard-only toggles (`extended_caveat`, `addon_preferred_seats`,
  `addon_space_seats`, `addon_extra_baggage`, `detailed_baggage`,
  `detailed_seats`, `tariff_tier_second`) away from Multi Airfare.

### Multi Airfare panel layout

When the user picks `custom_mp3smmmgw4p5` from the picker:

| Group | Toggle (key) | Default | Notes |
|---|---|---|---|
| _(pinned top)_ | `visa_requirements` | OFF | Visa requirements injection (injection-style, no pattern) |
| 🧑‍✈️ Per-flight preferences | `pref_seat`, `pref_meal`, `pref_wheelchair` | OFF | Same patterns as Standard |
| _(ungrouped)_ | `codeshare_notes` | OFF | "אלעל ״קונקט״ בשילוב עם" / "EL AL « Connect »" |
| _(ungrouped)_ | `combined_compartments` | OFF | "🔀 שילוב מחלקות" / "🔀 Mixed Cabin Itinerary" |
| 🎫 Airfare options (Multi Airfare) | `tier_eco_lite` | **ON** | Strips 🟥 block + trailing ▬▬▬▬ |
| 🎫 Airfare options (Multi Airfare) | `tier_eco_classic` | **ON** | Strips 🟩 block + trailing ▬▬▬▬ |
| 🎫 Airfare options (Multi Airfare) | `tier_eco_flex` | **ON** | Strips 🟦 block + trailing ▬▬▬▬ |
| 🎫 Airfare options (Multi Airfare) | `selection_callout` | **ON** | "👈*נא להשיב…" / "👉*Kindly reply…" / "👉*Merci de répondre…" |
| 🎫 Airfare options (Multi Airfare) | `important_notes` | **ON** | "*הערות חשובות ❗*" / "*Important Notes ❗*" / "*Notes importantes ❗*" |
| 🟦 Optional Add-Ons | `addon_elal_protect` | OFF | EL AL Protect block (insurance + Eco-Lite exclusion note) |
| _(ungrouped)_ | `extended_issuance_options` | OFF | "⏰ כרטוס מיידי…" timing legend |
| _(ungrouped)_ | `completion_instructions` | OFF | "✅ לסיום ההזמנה…" closing block |

### Standard panel layout (unchanged)

Standard's panel is identical to what it was before the Multi Airfare
overhaul, except that the 7 Standard-only entries now carry an explicit
`notCategories` scope so they stay hidden when the user switches to Multi
Airfare. No defaults changed for Standard.

### Eco-Lite cross-reference notice

When the user disables `tier_eco_lite` AND `addon_elal_protect` is on, a
one-shot toast fires (`MessageBuilder.vue → watch.sectionToggles.tier_eco_lite`)
warning that the EL AL Protect block still references the Eco-Lite exclusion.
The toast is localized to the active preview language. We do NOT auto-hide
either block — the user owns the final composition.

### Divider normalization

Gad's EN Multi Airfare row uses `------------------------` dash dividers
between the 3 tiers / sections. The HE/FR fallbacks we authored use
`▬▬▬▬▬▬▬▬` bar dividers to match the rest of his quotes. `autofillTemplate`
normalizes dash lines (15+ dashes) to bars at the very start of its
pipeline, so every downstream regex (OPTIONAL_SECTIONS strip patterns,
cleanup pass) sees a single divider style and the rendered output stays
visually consistent across all 3 languages. Supabase content is never
modified — normalization is render-time only.

---

## Authoring checklist (when adding a new language or category)

1. Open Supabase to confirm whether Gad already has a row — if yes, his copy wins; copy it into this guide.
2. If no row exists yet, start from the closest sibling (Standard EN ↔ Standard HE; Multi Airfare EN ↔ Standard HE for tier voice).
3. Match emoji + separator + placeholder conventions byte-for-byte. Don't "fix" typos or normalize spaces — Gad will fix in Admin if he wants to.
4. Run the autofill engine against a sample PNR to confirm all placeholders resolve. Patterns live in [`src/assets/templateAutofill.js`](../src/assets/templateAutofill.js).
5. If the new category needs OPTIONAL_SECTIONS or SECTION_INJECTIONS support, register the category in `SECTION_SUPPORT`.
6. If the new template uses a greeting variant that the existing PATTERN_MAP doesn't cover, add a new pattern (anchored with `^...$` + multiline flag to avoid in-prose false matches).
7. Add a fallback entry in `DEFAULT_TEMPLATES` so the template loads even when Supabase has no row. Once Gad authors his own in Admin, his copy will override the fallback automatically.
