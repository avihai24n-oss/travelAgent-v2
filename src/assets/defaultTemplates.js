// Placeholder registry: each key maps to human-readable labels per language.
// Labels are what the admin sees rendered inside chips.
export const FLIGHT_ITEM_KEYS = [
  "FLIGHT_DIRECTION",
  "FLIGHT_AIRLINE",
  "FLIGHT_NUMBER",
  "FLIGHT_ORIGIN_CITY",
  "FLIGHT_ORIGIN_CODE",
  "FLIGHT_DEST_CITY",
  "FLIGHT_DEST_CODE",
  "FLIGHT_DEPART_DAY",
  "FLIGHT_DEPART_DATE",
  "FLIGHT_DEPART_MONTH",
  "FLIGHT_DEPART_TIME",
  "FLIGHT_ARRIVE_DAY",
  "FLIGHT_ARRIVE_DATE",
  "FLIGHT_ARRIVE_MONTH",
  "FLIGHT_ARRIVE_TIME",
  "FLIGHT_CLASS",
  "FLIGHT_SEATS",
  "FLIGHT_SEAT_LABEL",
  "FLIGHT_SEAT_TYPES",
  "FLIGHT_MEAL",
  "FLIGHT_WHEELCHAIR"
];

export const PLACEHOLDERS = {
  CUSTOMER_NAME: { he: "שם לקוח", en: "Customer", fr: "Client" },
  ALL_NAMES: { he: "שמות נוספים", en: "Other travelers", fr: "Autres voyageurs" },
  DESTINATION: { he: "יעד", en: "Destination", fr: "Destination" },
  FLIGHT_DIRECTION: { he: "כיוון", en: "Direction", fr: "Sens" },
  FLIGHT_AIRLINE: { he: "חברה", en: "Airline", fr: "Compagnie" },
  FLIGHT_NUMBER: { he: "מס' טיסה", en: "Flight no.", fr: "N° vol" },
  FLIGHT_ORIGIN_CITY: { he: "עיר מוצא", en: "Origin", fr: "Origine" },
  FLIGHT_ORIGIN_CODE: { he: "קוד מוצא", en: "Origin code", fr: "Code origine" },
  FLIGHT_DEST_CITY: { he: "עיר יעד", en: "Destination", fr: "Destination" },
  FLIGHT_DEST_CODE: { he: "קוד יעד", en: "Dest. code", fr: "Code dest." },
  FLIGHT_DEPART_DAY: { he: "יום המראה", en: "Dep. day", fr: "Jour dép." },
  FLIGHT_DEPART_DATE: { he: "תאריך המראה", en: "Dep. date", fr: "Date dép." },
  FLIGHT_DEPART_MONTH: { he: "חודש המראה", en: "Dep. month", fr: "Mois dép." },
  FLIGHT_DEPART_TIME: { he: "שעת המראה", en: "Dep. time", fr: "Heure dép." },
  FLIGHT_ARRIVE_DAY: { he: "יום נחיתה", en: "Arr. day", fr: "Jour arr." },
  FLIGHT_ARRIVE_DATE: { he: "תאריך נחיתה", en: "Arr. date", fr: "Date arr." },
  FLIGHT_ARRIVE_MONTH: { he: "חודש נחיתה", en: "Arr. month", fr: "Mois arr." },
  FLIGHT_ARRIVE_TIME: { he: "שעת נחיתה", en: "Arr. time", fr: "Heure arr." },
  FLIGHT_CLASS: { he: "מחלקת טיסה", en: "Flight class", fr: "Classe vol" },
  FLIGHT_SEATS: { he: "מושבים", en: "Seats", fr: "Sièges" },
  FLIGHT_SEAT_LABEL: { he: "מילת מושב (יחיד/רבים)", en: "Seat word (sg./pl.)", fr: "Mot siège (sg./pl.)" },
  FLIGHT_SEAT_TYPES: { he: "סוגי מושבים (LY)", en: "Seat types (LY)", fr: "Types de sièges (LY)" },
  FLIGHT_MEAL: { he: "ארוחה (מ-SSR)", en: "Meal (from SSR)", fr: "Repas (SSR)" },
  FLIGHT_WHEELCHAIR: { he: "כיסא גלגלים (מ-SSR)", en: "Wheelchair (from SSR)", fr: "Fauteuil roulant (SSR)" },
  FLIGHTS: { he: "פרטי טיסות (בלוק שלם)", en: "Flights (full block)", fr: "Vols (bloc entier)" },
  AIRLINE_NAME: { he: "חברת תעופה", en: "Airline", fr: "Compagnie" },
  AIRLINE_CODE: { he: "קוד חברה", en: "Airline code", fr: "Code compagnie" },
  CLASS: { he: "מחלקה", en: "Class", fr: "Classe" },
  CLASS_LINE: { he: "שורת מחלקה (אימוג'י + שם)", en: "Class line (emoji + name)", fr: "Ligne de classe (emoji + nom)" },
  PRICE: { he: "מחיר", en: "Price", fr: "Prix" },
  CURRENCY: { he: "מטבע", en: "Currency", fr: "Devise" },
  BAGGAGE: { he: "כבודה", en: "Baggage", fr: "Bagages" },
  CHANGE_FEE: { he: "דמי שינוי", en: "Change fee", fr: "Frais de changement" },
  CANCEL_FEE: { he: "דמי ביטול", en: "Cancel fee", fr: "Frais d'annulation" },
  NO_SHOW: { he: "אי-התייצבות", en: "No show", fr: "No show" },
  TICKET_ISSUANCE: { he: "מועד הנפקה", en: "Ticket issuance", fr: "Émission du billet" },
  TRAVELERS_ICON: { he: "אייקון נוסעים (1/2/3+)", en: "Travelers icon (1/2/3+)", fr: "Icône voyageurs (1/2/3+)" },
  TRAVELER_FIRST_NAMES: { he: "שמות פרטיים של כל הנוסעים", en: "All travelers' first names", fr: "Prénoms de tous les voyageurs" },
  TRAVEL_NOUN: { he: "נסיעתך / נסיעתכם", en: "your trip", fr: "votre voyage" },
  TICKET_NOUN: { he: "כרטיסך / כרטיסכם + תניית תעריף", en: "your ticket(s) + fare clause", fr: "votre billet / vos billets + tarif" },
  TICKET_WORD: { he: "כרטיסך / כרטיסכם", en: "your ticket(s)", fr: "votre billet / vos billets" }
};

export const CATEGORIES = [
  { key: "flight", label: { he: "הצעת טיסה", en: "Flight Quote", fr: "Devis de vol" } },
  { key: "flights_only", label: { he: "מסלול טיסות בלבד", en: "Flights Only", fr: "Itinéraire seul" } }
];

export const LANGUAGES = [
  { key: "he", dir: "rtl", label: { he: "עברית", en: "Hebrew", fr: "Hébreu" } },
  { key: "en", dir: "ltr", label: { he: "אנגלית", en: "English", fr: "Anglais" } },
  { key: "fr", dir: "ltr", label: { he: "צרפתית", en: "French", fr: "Français" } }
];

export const DEFAULT_TEMPLATES = {
  flight: {
    he: `*{{CUSTOMER_NAME}}*, שלום!
⏰ *נא אישורך להנפקת כרטיסך❗*
👈{{TICKET_ISSUANCE}}

בהמשך לפנייתך, להלן הצעתי עבור נסיעתך *(👤{{CUSTOMER_NAME}})* הקרובה ל*{{DESTINATION}}*
{{ALL_NAMES}}

*מסלול הטיסות 🌍*

*{{FLIGHT_DIRECTION}}*
טיסת {{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ⬅️ {{FLIGHT_DEST_CITY}} ({{FLIGHT_DEST_CODE}})
*{{FLIGHT_CLASS}}*
ממריא {{FLIGHT_DEPART_DAY}} {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
נוחת    {{FLIGHT_ARRIVE_DAY}} {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}

*{{FLIGHT_DIRECTION}}*
טיסת {{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ({{FLIGHT_ORIGIN_CODE}}) ⬅️ {{FLIGHT_DEST_CITY}}
*{{FLIGHT_CLASS}}*
ממריא {{FLIGHT_DEPART_DAY}} {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
נוחת    {{FLIGHT_ARRIVE_DAY}} {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}

*חברת התעופה:* ({{AIRLINE_CODE}}) ✈️
*{{AIRLINE_NAME}}*

*מחלקת הנסיעה*✈️
{{CLASS_LINE}}

*💲עלות הכרטיסים*💳
{{PRICE}}

🛑 *לתשומת לבך:*
* המחיר עלול להשתנות כל עוד לא הונפק הכרטיס❗

🧳 *כבודה*
✅ מזוודה אחת 23 ק"ג
✅ כבודת יד

*💺הושבה מראש*
✅ מושב סטנדרטי

⚠️ תנאי הכרטיס ⚠️
▪️ שינוי: {{CHANGE_FEE}}
▪️ ביטול: {{CANCEL_FEE}}{{CURRENCY}}
▪️ אי-התייצבות: {{NO_SHOW}}

*⏱️מועד הנפקת הכרטיס*⌛
⏰*{{TICKET_ISSUANCE}}*‼️

תודה רבה,
גד אלנקווה
בברכה,
    🏢 American Express Global Business Travel
📞 נייד: 054-5727055    ✉️ gad@gbtil.co.il`,
    en: `*{{CUSTOMER_NAME}}*, Shalom!
⏰ *Your tickets issuance approval❗*
👉 *{{TICKET_ISSUANCE}}*

In reply to your request, you'll find below my *Updated proposal* for your *(👤{{CUSTOMER_NAME}})* upcoming trip to *{{DESTINATION}}*
{{ALL_NAMES}}

Please, kindly *reply (from within this WhatsApp message)* with your *tickets issuance approval* accordingly with the content of this proposal.

*Itinerary 🌍*

*{{FLIGHT_DIRECTION}}*
{{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ➡️ {{FLIGHT_DEST_CITY}} ({{FLIGHT_DEST_CODE}})
*{{FLIGHT_CLASS}}*
Dpt. {{FLIGHT_DEPART_DAY}}. {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
Arr.  {{FLIGHT_ARRIVE_DAY}}. {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}

*{{FLIGHT_DIRECTION}}*
{{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ({{FLIGHT_ORIGIN_CODE}}) ➡️ {{FLIGHT_DEST_CITY}}
*{{FLIGHT_CLASS}}*
Dpt. {{FLIGHT_DEPART_DAY}}. {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
Arr.  {{FLIGHT_ARRIVE_DAY}}. {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}

*Airline:* ({{AIRLINE_CODE}}) ✈️
*{{AIRLINE_NAME}}*

*Class of Travel* ✈️
{{CLASS_LINE}}

🎫 *AIRFARE* 💲
{{PRICE}}

*Attention:* ❗
▪️ Above airfare may change unless tickets are issued ❗

🧳 *Baggage Allowance* 🧳
✅ 1 checked bag 23 kg
✅ Carry-on

💺 *Preselected Seats* 💺
✅ Included

⚠️ *Tickets Restrictions* ⚠️
▪️ Change: {{CHANGE_FEE}}
▪️ Cancel: {{CANCEL_FEE}}{{CURRENCY}}
▪️ No-show: {{NO_SHOW}}

*⏱️ Ticket issuance date* ⌛
⏰ *{{TICKET_ISSUANCE}}* ‼️

Thanks for replying (from within this WhatsApp message) with your tickets issuance confirmation.

Thanks,
Gad Elnekave
Sincerely Yours
🏢 American Express Global Business Travel
📞 Mob. 972-54-5727055
✉️ gad@gbtil.co.il`,
    fr: `*{{CUSTOMER_NAME}}*, Shalom!
⏰ *Validation d'émission de ton billet❗*
👉 *{{TICKET_ISSUANCE}}*

Pour faire suite à ta demande, tu trouveras ci-dessous ma *proposition actualisée* pour ton *(👤{{CUSTOMER_NAME}})* prochain voyage à *{{DESTINATION}}*
{{ALL_NAMES}}

Merci de *répondre (depuis ce message WhatsApp)* avec ta *validation d'émission de ton billet* conformément au contenu de cette proposition.

*Itinéraire 🌍*

*{{FLIGHT_DIRECTION}}*
{{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ➡️ {{FLIGHT_DEST_CITY}} ({{FLIGHT_DEST_CODE}})
*{{FLIGHT_CLASS}}*
Dpt. {{FLIGHT_DEPART_DAY}} {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
Arr.  {{FLIGHT_ARRIVE_DAY}} {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}

*{{FLIGHT_DIRECTION}}*
{{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ({{FLIGHT_ORIGIN_CODE}}) ➡️ {{FLIGHT_DEST_CITY}} ({{FLIGHT_DEST_CODE}})
*{{FLIGHT_CLASS}}*
Dpt. {{FLIGHT_DEPART_DAY}} {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
Arr.  {{FLIGHT_ARRIVE_DAY}} {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}

*Compagnie:* ({{AIRLINE_CODE}}) ✈️
*{{AIRLINE_NAME}}*

*Classe de voyage* ✈️
{{CLASS_LINE}}

🎫 *PRIX* 💲
{{PRICE}}

*Attention:* ❗
▪️ Le tarif ci-dessus peut changer tant que le billet n'est pas émis ❗

🧳 *Franchise bagages* 🧳
✅ 1 bagage en soute 23 kg
✅ Bagage cabine

💺 *Présélection sièges* 💺
✅ Incluse

⚠️ *Restrictions tarifaires* ⚠️
▪️ Modification: {{CHANGE_FEE}}
▪️ Annulation: {{CANCEL_FEE}}{{CURRENCY}}
▪️ No-show: {{NO_SHOW}}

*⏱️ Date d'émission du billet* ⌛
⏰ *{{TICKET_ISSUANCE}}* ‼️

Merci de répondre (depuis ce message WhatsApp) avec ta confirmation d'émission.

Merci,
Gad Elnekave
Cordialement
🏢 American Express Global Business Travel
📞 Mob. 972-54-5727055
✉️ gad@gbtil.co.il`
  },
  // ─── Flights-only mode ───
  // Renders only the itinerary header + per-flight blocks — no greeting,
  // no airline/class/price/conditions/signature. The agent picks this
  // category from the dropdown when they want a quick "just the routes"
  // reply (e.g. when the customer already saw the full quote and just
  // wants to re-confirm the schedule). Uses the same {{FLIGHT_*}} per-
  // flight placeholders as the standard `flight` template so expandFlightBlock
  // replicates the block per parsed PNR flight and groups outbound/inbound
  // automatically.
  flights_only: {
    he: `*מסלול הטיסות 🌍*

*{{FLIGHT_DIRECTION}}*
טיסת {{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ⬅️ {{FLIGHT_DEST_CITY}} ({{FLIGHT_DEST_CODE}})
*{{FLIGHT_CLASS}}*
ממריא {{FLIGHT_DEPART_DAY}} {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
נוחת    {{FLIGHT_ARRIVE_DAY}} {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}

*{{FLIGHT_DIRECTION}}*
טיסת {{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ({{FLIGHT_ORIGIN_CODE}}) ⬅️ {{FLIGHT_DEST_CITY}}
*{{FLIGHT_CLASS}}*
ממריא {{FLIGHT_DEPART_DAY}} {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
נוחת    {{FLIGHT_ARRIVE_DAY}} {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}`,
    en: `*Itinerary 🌍*

*{{FLIGHT_DIRECTION}}*
{{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ➡️ {{FLIGHT_DEST_CITY}} ({{FLIGHT_DEST_CODE}})
*{{FLIGHT_CLASS}}*
Dpt. {{FLIGHT_DEPART_DAY}}. {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
Arr.  {{FLIGHT_ARRIVE_DAY}}. {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}

*{{FLIGHT_DIRECTION}}*
{{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ({{FLIGHT_ORIGIN_CODE}}) ➡️ {{FLIGHT_DEST_CITY}}
*{{FLIGHT_CLASS}}*
Dpt. {{FLIGHT_DEPART_DAY}}. {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
Arr.  {{FLIGHT_ARRIVE_DAY}}. {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}`,
    fr: `*Itinéraire 🌍*

*{{FLIGHT_DIRECTION}}*
{{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ➡️ {{FLIGHT_DEST_CITY}} ({{FLIGHT_DEST_CODE}})
*{{FLIGHT_CLASS}}*
Dpt. {{FLIGHT_DEPART_DAY}} {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
Arr.  {{FLIGHT_ARRIVE_DAY}} {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}

*{{FLIGHT_DIRECTION}}*
{{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ({{FLIGHT_ORIGIN_CODE}}) ➡️ {{FLIGHT_DEST_CITY}}
*{{FLIGHT_CLASS}}*
Dpt. {{FLIGHT_DEPART_DAY}} {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
Arr.  {{FLIGHT_ARRIVE_DAY}} {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 {{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}`
  },
  // Multi Airfare Quote (Same flights) — Hebrew fallback. Gad authored the
  // EN row in Supabase (custom_mp3smmmgw4p5/en) but no HE row exists yet,
  // so this fallback feeds loadTemplate() when the agent picks the category
  // in Hebrew. Built from Gad's HE Standard voice (custom_mpsx5w8le42j/he)
  // + the EN Multi Airfare's 3-tier structure (Eco-Lite/Classic/Flex).
  // Once Gad authors his own HE version via Admin, his Supabase row will
  // override this fallback automatically (loadTemplate prefers localStorage).
  // Full authoring rationale + vocabulary mapping is in docs/QUOTE_STYLE_GUIDE.md.
  custom_mp3smmmgw4p5: {
    he: `*שם הנוסע*, שלום!
⏰ *מצריך את אישורך לכרטוס תוך 24 שעות*❗
👈*יום א׳ ב׳ ג׳ ד׳ ה׳ ו׳ 0 חודש | שעה*

בהמשך לפנייתך, להלן פרטי ההצעה המבוקשת עבור נסיעתך/כם *👤 / 👥 / 🧑‍🧒 / 🧑‍🧒‍🧒 / 🧑‍🧑‍🧒 / 🧑‍🧑‍🧒‍🧒*
הקרובה ל-*יעד* בתאריך *תאריך_יציאה*.

נא *אשר/י* בבקשה את *הנפקת כרטיסך (/ הכרטיס / _ כרטיסכם* תוך ציון התעריף שנבחר עבור כל אחד מהנוסעים), במענה חוזר מיידי מתוך הודעת ווצאפ זו, *בהתאם לתוכן ההצעה.*

▬▬▬▬▬▬▬▬

*מסלול הטיסות 🌍*




 💺מושב/י *00A-B-C//00D*
    מעבר / חלון / מעבר+חלון / חלון+אמצעי / מעבר+אמצעי
    מושב מועדף / מושב ספייס / מושב אקונומי קומפורט
 🍽️ *כשרה / צמחוני / ילדים / גלאט*
 👩‍🦽*כיסא גלגלים

▬▬▬▬▬▬▬▬

*חברת/ות תעופה:(LY,XX)* ✈️
 *אלעל* ״קונקט״ בשילוב עם *אייר*
*סונדור**
*(חברת בת של אלעל)לתשומת לבך טיסות מתופעלות במטוסי חברת *ABCDEF*!

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

▬▬▬▬▬▬▬▬

*אפשרויות תעריף 🎫*
לנוחותך, ניתן לבחור בין אפשרויות התעריף הבאות בהתאם לגמישות והשירותים שתעדיף/י:

🟥 *תעריף אקו-לייט* 🎫
💳 *מחיר הכרטיס:*
  👈 *000 דולר לנוסע*
  👈 *000 דולר × 0 נוסעים*


*כבודה מותרת* 🧳
     (לנוסע)
 ❌ ללא מזוודה
 ✅ מזוודה 1 (23 ק״ג)
 ✅ תיק יד 1 *8 ק״ג*

*הושבה מראש* 💺
 ❌ אינה כלולה
 ✅ מושבים סטנדרטיים*
  *(בכפוף לזמינות)

*תנאי הכרטיס* ⚠️
 👇גובה הקנס לנוסע👇
▪️ שינוי: 000$*
       *(+הפרשי מחיר)
▪️ ביטול: 000$
   👈*ללא החזר❗*
▪️ אי-התייצבות: הפסד מלא

▬▬▬▬▬▬▬▬

🟩 *תעריף אקו-קלאסיק* 🎫
💳 *מחיר הכרטיס:*
  👈 *000 דולר לנוסע*
  👈 *000 דולר × 0 נוסעים*

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
    👈*ללא החזר*❗
▪️ *אי-התייצבות: הפסד מלא*

▬▬▬▬▬▬▬▬

🟦 *תעריף אקו-פלקס* 🎫
💳 *מחיר:*
  👈 *0000 דולר*

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

▬▬▬▬▬▬▬▬

👈*נא להשיב בתשובה ישירה להודעת ווצאפ זו עם התעריף בו בחרת/ם לאישור הנפקת הכרטיס/ים*

🟥 תעריף אקו-לייט / 🟩 תעריף אקו-קלאסיק / 🟦 תעריף אקו-פלקס

*הערות חשובות ❗*
▪️ התעריפים נתונים לשינוי ללא הודעה מוקדמת כל עוד הכרטיסים לא הונפקו.
▪️ מושבים, תעריפים ותנאים מובטחים סופית רק לאחר הנפקת הכרטיסים.

▬▬▬▬▬▬▬▬

 🛟 *אלעל פרוטקט*💳
   👍 (ביטוח ביטול לכרטיס) 👍
   👈 *000$ לנוסע*
   👈 *$00 × 2 נוסעים**
מאפשרת ביטול הנסיעה / הכרטיס עד 72 שעות לפני מועד ההמראה מהארץ לכל המאוחר *והסבת ערך כרטיסך / כרטיסיכם לשובר קרדיט* (בקיזוז 75$ / 100$ / 125$ / 150$ דמי ניהול לנוסע) *למימוש על טיסות אלעל עתידיות* (על ידיך או כל אדם אחר מטעמך).
🫷 *הזהרה חשובה:* 🛑
* מותנה ברכישה במעמד הכרטוס❗️
* במקרה שהודעת ביטול הנסיעה תתקבל בטווח של פחות מ-72 שעות לפני מועד היציאה מהארץ, אז יחולו תנאי הביטול הסטנדרטים כמפורטים בהצעה זו מטה❗
* התעריף אקו-לייט אינו מקנה את הזכות לרכוש ביטוח ביטול ״אלעל פרוטקט״ בשונה משאר התעריפים הנ״ל❗️

▬▬▬▬▬▬▬▬

*⏱️מועד אחרון לכרטוס*⌛
🟥 🟩 🟦
 ⏰*כרטוס מיידי = היום*‼️
 ⏰ *תוך 24 / 48 / 72 שעות*❗
👈*יום ׳ 00 בחוד׳ | 00:00*

נא השב בבקשה במענך החוזר *מתוך גוף הצעת ווצאפ זו* עם *אישורך המידי להנפקת כרטיסך/סיכם* מתוך הסכמה למסלול & לתנאי התעריף שבחרת/ם כפי שפורטו מעלה.

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
✉️ מייל gad@gbtil.co.il`,
    // French fallback. Same architecture as the Hebrew sibling above —
    // built from Gad's FR Standard voice (custom_mpsx5w8le42j/fr) plus
    // the EN Multi Airfare's 3-tier fare structure. Activates via the
    // EN-duplicate detection in loadTemplate() because the Supabase
    // custom_mp3smmmgw4p5/fr row is currently a byte-copy of the EN row
    // (Gad hasn't authored a real FR version yet). Vocabulary mapping
    // and authoring rationale live in docs/QUOTE_STYLE_GUIDE.md.
    fr: `* *, Shalom ❗️
⏰ *L'émission du billet est requise sous 24 heures* ❗
​👉*Dim / Lun / Mar / Mer / Jeu / Ven | 00 mois | HH:MM*

Suite à votre demande, veuillez trouver ci-dessous l'offre proposée pour votre *👤 / 👥 / 🧑‍🧒 / 🧑‍🧒‍🧒 / 🧑‍🧑‍🧒 / 🧑‍🧑‍🧒‍🧒*
voyage à destination de * *, au départ du *DATE_DEPART*.

Merci de *confirmer* l'émission de votre/vos billet(s), en précisant le tarif choisi pour chaque passager, par réponse directe à ce message WhatsApp, *conformément au contenu de l'offre.*

▬▬▬▬▬▬▬▬

*Itinéraire des vols 🌍*



 💺 Siège(s) *00A-B-C // 00D*
       Couloir / Hublot /
       Couloir+Hublot /
       Hublot+Centre /
       Couloir+Centre
       Siège préférentiel /
       Siège Space
 🍽️ *Repas Casher / Végétarien / Enfant / Glatt*
 👩‍🦽*Assistance fauteuil roulant*

▬▬▬▬▬▬▬▬

*Compagnie(s) aérienne(s) : (LY, XX)* ✈️
*EL AL « Connect »* en partenariat avec *Air     *
*Sundor*
*(filiale d'EL AL). Veuillez noter : vols opérés par les appareils de la compagnie * *!

▔▔▔▔▔▔▔

✈️ *Classe de voyage* ✈️
   💺 *Classe Économique*
   🥂 *Classe Premium Economy*
   👔 *Classe Affaires /Business*

▔▔▔▔▔▔▔

🔀 Combinaison de classes 🔀

 ✈️ TLV ➡️ DEST
   💺 *Classe Économique*
   🥂 *Classe Premium Economy*
   👔 *Classe Affaires / Business*

 ✈️ DEST ➡️ TLV
   💺 *Classe Économique*
   🥂 *Classe Premium Economy*
   👔 *Classe Affaires / Business*

▬▬▬▬▬▬▬▬

*Options tarifaires 🎫*
Pour votre commodité, vous pouvez choisir parmi les options tarifaires suivantes selon la flexibilité et les services que vous préférez :

🟥 *Tarif Eco-Lite* 🎫
💳 *Prix du billet :*
  👉 *000 USD par passager*
  👉 *000 USD × 0 passagers*


*Franchise bagages* 🧳
     (par passager)
 ❌ Sans valise en soute
 ✅ 1 bagage en soute (23 kg)
 ✅ 1 bagage à main *8 kg*

*Présélection de siège* 💺
 ❌ Non incluse
 ✅ Sièges standards*
  *(Sous réserve de disponibilité)

*Conditions du billet* ⚠️
 👇Pénalités par personne👇
▪️ Modification : 000$*
       *(+ différence tarifaire)
▪️ Annulation : 000$
   👉*Non remboursable❗*
▪️ Non-présentation : Totalose

▬▬▬▬▬▬▬▬

🟩 *Tarif Eco-Classique* 🎫
💳 *Prix du billet :*
  👉 *000 USD par passager*
  👉 *000 USD × 0 passagers*

*Franchise bagages* 🧳
       (par passager)
 ✅ 1 bagage en soute *23 kg*
 ✅ 1 bagage à main *8 kg*

*Présélection de siège* 💺
 ✅ Sièges standards*
  *(Sous réserve de disponibilité)

*Conditions du billet* ⚠️
 👇Pénalités par personne👇
▪️ Modification : 000$*
     *(+ différence tarifaire)
▪️ *Annulation :*
    👉*Non remboursable*❗
▪️ *Non-présentation : Totalose*

▬▬▬▬▬▬▬▬

🟦 *Tarif Eco-Flex* 🎫
💳 *Prix :*
  👉 *0000 USD*

*Franchise bagages* 🧳
 ✅ 1 bagage en soute *23 kg*
 ✅ 1 bagage à main *8 kg*

*Présélection de siège* 💺
 ✅ Sièges standards / préférentiels*
  *(Sous réserve de disponibilité)

*Conditions du billet* ⚠️
▪️ Modification : 75$*
   *(+ différence tarifaire)
▪️ Annulation : 150$
▪️ Non-présentation : Totalose

▬▬▬▬▬▬▬▬

👉*Merci de répondre directement à ce message WhatsApp en précisant le tarif retenu pour confirmer l'émission du billet*

🟥 Tarif Eco-Lite / 🟩 Tarif Eco-Classique / 🟦 Tarif Eco-Flex

*Notes importantes ❗*
▪️ Les tarifs sont susceptibles d'évoluer sans préavis tant que les billets n'ont pas été émis.
▪️ Les sièges, tarifs et conditions ne sont garantis qu'après l'émission des billets.

▬▬▬▬▬▬▬▬

 🛟 *EL AL Protect* 💳
   👍 (Assurance annulation du billet) 👍
   👉 *000 USD par passager*
   👉 *00 USD × 2 passagers**
Permet l'annulation du voyage jusqu'à 72 heures avant le décollage depuis Israël et la conversion de la valeur de votre/vos billet(s) en bon d'avoir (sous déduction de 75 / 100 / 125 / 150 USD de frais de dossier par passager), valable pour de futurs vols EL AL (par vous-même ou toute personne désignée).
🫷 *Avertissement important :* 🛑
* Doit être souscrit au moment de l'émission du billet ❗️
* Si l'avis d'annulation est reçu moins de 72 heures avant le départ d'Israël, les conditions d'annulation standard détaillées ci-dessous s'appliqueront ❗
* Le tarif Eco-Lite ne donne *pas* droit à la souscription de l'assurance annulation « EL AL Protect », contrairement aux autres tarifs ci-dessus ❗️

▬▬▬▬▬▬▬▬

*⏱️ Date limite d'émission* ⌛
🟥 🟩 🟦
⏰ *Émission immédiate = Aujourd'hui* ‼️
⏳*Sous 24 / 48 / 72 heures* ❗
​👉*Dim 00 mois | HH:MM*

Merci de répondre à ce message WhatsApp avec votre accord pour l'émission de votre/vos billet(s) conformément à la proposition ci-dessus — ce qui vaudra acceptation de l'offre avant l'échéance indiquée.

✅ Pour finaliser votre réservation et émettre le billet :
Répondez directement à ce message en précisant :
1️⃣ Le tarif que vous avez choisi
2️⃣ Les options supplémentaires que vous souhaitez inclure

👉 *Votre réponse vaut acceptation de l'itinéraire et des conditions tarifaires.*

Merci beaucoup,
Cordialement,
Gad Elnekave


🏢 American Express Global Business Travel Israel
📞 Mobile : +972-54-5727055
✉️ Email : gad@gbtil.co.il`
  }
};


import {
  isSyncConfigured,
  fetchAllTemplatesRemote,
  upsertTemplateRemote,
  deleteTemplateRemote,
  fetchCustomCategoriesRemote,
  upsertCustomCategoryRemote,
  deleteCustomCategoryRemote
} from "./templateSync.js";

// Detect outdated/buggy flight templates that pre-date the round-trip format
// rewrite. A template is treated as outdated when it carries any of these
// fingerprints that the current code never emits:
//   - The direction header is hardcoded (e.g. "*טיסה/ות הלוך🛫*") instead of
//     the {{FLIGHT_DIRECTION}} placeholder, so per-flight labels (outbound /
//     connecting / continuing / inbound) can never appear.
//   - The seat line uses the old parenthesised "(מושב - *XX*)" / "(Seat *XX*)"
//     shape that the current default replaced with "מושב *XX*" / "Seat *XX*".
//   - The itinerary heading sits directly above the first FLIGHT_ line with no
//     blank separator, so paragraph-based block expansion folds the heading
//     into the block and repeats it per flight.
// When loadTemplate / bootstrap sees one of these, it pretends nothing is
// cached and falls back to the corrected default shipped in code.
export function isOutdatedFlightTemplate(value) {
  if (typeof value !== "string" || !value) return false;
  const hasPlaceholderDirection = value.indexOf("{{FLIGHT_DIRECTION}}") !== -1;
  const HARDCODED_DIRECTION = [
    "*טיסה/ות הלוך",
    "*טיסה/ות חזור",
    "*Outbound flight",
    "*Inbound flight",
    "*Vol aller",
    "*Vol retour"
  ];
  if (!hasPlaceholderDirection) {
    for (const needle of HARDCODED_DIRECTION) {
      if (value.indexOf(needle) !== -1) return true;
    }
  }
  if (value.indexOf("(מושב - *XX*)") !== -1) return true;
  if (value.indexOf("(Seat *XX*)") !== -1) return true;
  if (value.indexOf("(Siege *XX*)") !== -1) return true;
  if (/\*מסלול הטיסות 🌍\*\n\*/.test(value)) return true;
  if (/\*Itinerary 🌍\*\n\*/.test(value)) return true;
  if (/\*Itinéraire 🌍\*\n\*/.test(value)) return true;
  return false;
}

const storageKey = (category, lang) => `customTemplate:${category}:${lang}`;
const historyKey = (category, lang) => `customTemplateHistory:${category}:${lang}`;
const HISTORY_LIMIT = 20;
const CUSTOM_CATEGORIES_KEY = "customCategories";

export const BUILT_IN_CATEGORY_KEYS = CATEGORIES.map(c => c.key);

// One-shot bootstrap: pull cloud state into localStorage on app start, then push
// any local-only data up. Caller awaits this before reading templates so the UI
// shows the latest content from any device.
//
// Conflict resolution: cloud wins on conflicts (we treat the cloud as the
// source of truth). For Gad's setup this is fine — almost always one writer.
//
// Returns { ok, pulled, pushed, error } so the UI can show a sync indicator.
export async function bootstrapTemplateSync() {
  if (!isSyncConfigured()) {
    return { ok: false, pulled: 0, pushed: 0, error: "not_configured" };
  }
  let pulled = 0;
  let pushed = 0;
  try {
    const remoteTpls = await fetchAllTemplatesRemote();
    for (const compoundKey of Object.keys(remoteTpls)) {
      const sepIdx = compoundKey.lastIndexOf(":");
      if (sepIdx === -1) continue;
      const cat = compoundKey.slice(0, sepIdx);
      const lang = compoundKey.slice(sepIdx + 1);
      const remoteVal = remoteTpls[compoundKey].value;
      // Refuse to cache outdated/buggy flight templates pulled from cloud —
      // they'd otherwise override the corrected in-code default at render time.
      if (cat === "flight" && isOutdatedFlightTemplate(remoteVal)) {
        try { window.localStorage.removeItem(storageKey(cat, lang)); } catch (e) { /* ignore */ }
        continue;
      }
      try {
        window.localStorage.setItem(storageKey(cat, lang), remoteVal);
        pulled++;
      } catch (e) { /* storage full / private mode — skip */ }
    }

    const remoteCats = await fetchCustomCategoriesRemote();
    if (remoteCats.length) {
      try {
        window.localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(remoteCats));
        pulled += remoteCats.length;
      } catch (e) { /* skip */ }
    }

    // Push local-only entries to cloud ONLY on the very first sync for this
    // browser — afterwards we never auto-push, only pull. Without this gate
    // any cached stale template (e.g. one left behind after a cloud delete)
    // would be re-uploaded on the next bootstrap, undoing the cleanup.
    const PUSH_UP_FLAG = "templateSync.initialPushUpDone";
    let alreadyPushed = false;
    try {
      alreadyPushed = !!window.localStorage.getItem(PUSH_UP_FLAG);
    } catch (e) { /* ignore */ }

    if (!alreadyPushed) {
      const remoteKeys = new Set(Object.keys(remoteTpls));
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (!k || k.indexOf("customTemplate:") !== 0) continue;
          const rest = k.slice("customTemplate:".length);
          if (remoteKeys.has(rest)) continue;
          const sepIdx = rest.lastIndexOf(":");
          if (sepIdx === -1) continue;
          const cat = rest.slice(0, sepIdx);
          const lang = rest.slice(sepIdx + 1);
          const value = window.localStorage.getItem(k);
          if (typeof value !== "string") continue;
          try {
            await upsertTemplateRemote(cat, lang, value);
            pushed++;
          } catch (e) { /* skip — best effort */ }
        }
      } catch (e) { /* iterate failure — skip */ }

      const remoteCatKeys = new Set(remoteCats.map(c => c.key));
      const localCats = loadCustomCategories();
      for (const cat of localCats) {
        if (remoteCatKeys.has(cat.key)) continue;
        try {
          await upsertCustomCategoryRemote(cat);
          pushed++;
        } catch (e) { /* skip */ }
      }

      try {
        window.localStorage.setItem(PUSH_UP_FLAG, new Date().toISOString());
      } catch (e) { /* ignore */ }
    }

    return { ok: true, pulled, pushed, error: null };
  } catch (err) {
    return { ok: false, pulled, pushed, error: String(err && err.message || err) };
  }
}

// Fire-and-forget helper — invoked from save paths. Errors are swallowed and
// logged to console; the local copy is the source of truth until next bootstrap.
function pushSafely(promise) {
  if (!promise || typeof promise.then !== "function") return;
  promise.catch(err => {
    // eslint-disable-next-line no-console
    console.warn("template sync push failed:", err && err.message || err);
  });
}

export function loadCustomCategories() {
  try {
    const raw = window.localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter(c => c && typeof c.key === "string" && c.label && typeof c.label.he === "string");
  } catch (e) {
    return [];
  }
}

export function saveCustomCategories(arr) {
  try {
    window.localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(arr || []));
    return true;
  } catch (e) {
    return false;
  }
}

export function addCustomCategory(label) {
  const name = String(label || "").trim();
  if (!name) return null;
  const key = "custom_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const arr = loadCustomCategories();
  const created = { key, label: { he: name, en: name, fr: name } };
  arr.push(created);
  saveCustomCategories(arr);
  pushSafely(upsertCustomCategoryRemote(created));
  return created;
}

export function renameCustomCategory(key, label) {
  const name = String(label || "").trim();
  if (!key || !name) return false;
  const arr = loadCustomCategories();
  const cat = arr.find(c => c.key === key);
  if (!cat) return false;
  cat.label = { he: name, en: name, fr: name };
  saveCustomCategories(arr);
  pushSafely(upsertCustomCategoryRemote(cat));
  return true;
}

export function deleteCustomCategory(key) {
  if (!key) return false;
  const arr = loadCustomCategories();
  const next = arr.filter(c => c.key !== key);
  saveCustomCategories(next);
  try {
    for (const lang of LANGUAGES.map(l => l.key)) {
      window.localStorage.removeItem(storageKey(key, lang));
      window.localStorage.removeItem(historyKey(key, lang));
      pushSafely(deleteTemplateRemote(key, lang));
    }
  } catch (e) {
    // ignore
  }
  pushSafely(deleteCustomCategoryRemote(key));
  return true;
}

// Older saved templates baked a static "Economy/Premium/Business Class" line
// per flight, and a separate "*Compartment* 💺 / *{{CLASS}}*" summary block
// whose label/emoji didn't match the per-cabin styling Gad now wants. The
// renderer resolves the per-flight cabin from the RBD letter via
// {{FLIGHT_CLASS}}, and the summary block via {{CLASS_LINE}}, so on load
// we silently upgrade saved text to the new placeholder shapes. Idempotent.
function migrateFlightClassPlaceholder(value) {
  if (typeof value !== "string" || !value) return value;
  let out = value
    .split("*מחלקת תיירים/עסקים/פרמיום*").join("*{{FLIGHT_CLASS}}*")
    .split("*Economy/Premium/Business Class*").join("*{{FLIGHT_CLASS}}*")
    .split("*Classe Économique/Premium/Affaires*").join("*{{FLIGHT_CLASS}}*");

  const OLD_COMPARTMENT_BLOCKS = [
    { from: "*מחלקת שירות* 💺\n*{{CLASS}}*", to: "*מחלקת הנסיעה*✈️\n{{CLASS_LINE}}" },
    { from: "*Compartment* 💺\n*{{CLASS}}*",   to: "*Class of Travel* ✈️\n{{CLASS_LINE}}" },
    { from: "*Compartiment* 💺\n*{{CLASS}}*",  to: "*Classe de voyage* ✈️\n{{CLASS_LINE}}" }
  ];
  for (const { from, to } of OLD_COMPARTMENT_BLOCKS) {
    out = out.split(from).join(to);
  }
  return out;
}

// Older saved templates baked a literal "*XX*" on the seat line as a hint
// for the agent to fill in manually. Now that the parser pulls seat numbers
// from SSR lines, swap the literal XX for {{FLIGHT_SEATS}} so saved templates
// — including custom categories the user authored — get real seat numbers
// when the PNR includes SSR data. The {{FLIGHT_SEATS}} renderer still emits
// "XX" when no SSR data is found, so behaviour is unchanged for PNRs that
// don't carry seat assignments. Idempotent (the new shape is left alone).
function migrateSeatPlaceholder(value) {
  if (typeof value !== "string" || !value) return value;
  // Three migrations run in sequence, each idempotent on its own and safe
  // to apply on top of any prior state:
  //   1. literal "XX" → "{{FLIGHT_SEATS}}" (for templates that predate any
  //      seat-related work).
  //   2. drop the hard-coded "מושב"/"Seat"/"Siege" noun in favour of
  //      "{{FLIGHT_SEAT_LABEL}}" so the word pluralises when 2+ passengers
  //      have seats.
  //   3. append "{{FLIGHT_SEAT_TYPES}}" right after the seat-number bold
  //      block. The renderer turns it into "\n<position>, <position>" only
  //      for LY flights and an empty string otherwise, so the position
  //      line surfaces under El Al rows and disappears for everyone else.
  //      The negative-lookahead in the regex keeps this pass idempotent —
  //      we never double-append.
  return value
    .split("מושב *XX*").join("מושב *{{FLIGHT_SEATS}}*")
    .split("Seat *XX*").join("Seat *{{FLIGHT_SEATS}}*")
    .split("Siege *XX*").join("Siege *{{FLIGHT_SEATS}}*")
    .split("מושב *{{FLIGHT_SEATS}}*").join("{{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*")
    .split("Seat *{{FLIGHT_SEATS}}*").join("{{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*")
    .split("Siege *{{FLIGHT_SEATS}}*").join("{{FLIGHT_SEAT_LABEL}} *{{FLIGHT_SEATS}}*")
    .replace(
      /\*\{\{FLIGHT_SEATS\}\}\*(?!\{\{FLIGHT_SEAT_TYPES\}\})/g,
      "*{{FLIGHT_SEATS}}*{{FLIGHT_SEAT_TYPES}}"
    )
    // Fourth pass: append {{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}} immediately
    // after {{FLIGHT_SEAT_TYPES}} when those new per-flight placeholders
    // aren't already there. Renderer emits "" for flights without SSR
    // meal/wheelchair codes, so this is invisible on PNRs that don't carry
    // those preferences. Negative-lookahead keeps the pass idempotent —
    // running on an already-migrated template doesn't double the markers.
    .replace(
      /\{\{FLIGHT_SEAT_TYPES\}\}(?!\{\{FLIGHT_MEAL\}\})/g,
      "{{FLIGHT_SEAT_TYPES}}{{FLIGHT_MEAL}}{{FLIGHT_WHEELCHAIR}}"
    );
}

export function loadTemplate(category, lang) {
  try {
    const saved = window.localStorage.getItem(storageKey(category, lang));
    // For built-in `flight`, ignore a cached value if it carries the old
    // pre-fix structure — we'd rather render the up-to-date default than the
    // broken save. Custom categories are always honoured as-is, except for
    // the EN-duplicate FR row check below.
    if (saved !== null && !(category === "flight" && isOutdatedFlightTemplate(saved))) {
      // Multi Airfare Quote — the Supabase fr row Gad uploaded today is a
      // byte-for-byte copy of the en row (a placeholder, not an authored
      // French translation). When we detect this duplicate, fall through
      // to the DEFAULT_TEMPLATES.fr fallback (built from Gad's FR Standard
      // voice). Once Gad authors a real FR copy in Admin, his content
      // will diverge from en and this branch becomes a no-op automatically.
      if (
        category === "custom_mp3smmmgw4p5" &&
        lang === "fr" &&
        DEFAULT_TEMPLATES[category] &&
        DEFAULT_TEMPLATES[category].fr
      ) {
        const enRow = window.localStorage.getItem(storageKey(category, "en"));
        if (enRow !== null && enRow === saved) {
          return DEFAULT_TEMPLATES[category].fr;
        }
      }
      return migrateSeatPlaceholder(migrateFlightClassPlaceholder(saved));
    }
  } catch (e) {
    // localStorage unavailable — fall back to default
  }
  return (DEFAULT_TEMPLATES[category] && DEFAULT_TEMPLATES[category][lang]) || "";
}

export function saveTemplate(category, lang, value) {
  try {
    const prev = window.localStorage.getItem(storageKey(category, lang));
    if (prev !== null && prev !== value) {
      pushHistory(category, lang, prev);
    }
    window.localStorage.setItem(storageKey(category, lang), value);
    pushSafely(upsertTemplateRemote(category, lang, value));
    return true;
  } catch (e) {
    return false;
  }
}

export function resetTemplate(category, lang) {
  try {
    const prev = window.localStorage.getItem(storageKey(category, lang));
    if (prev !== null) pushHistory(category, lang, prev);
    window.localStorage.removeItem(storageKey(category, lang));
    pushSafely(deleteTemplateRemote(category, lang));
    return true;
  } catch (e) {
    return false;
  }
}

export function hasCustomTemplate(category, lang) {
  try {
    return window.localStorage.getItem(storageKey(category, lang)) !== null;
  } catch (e) {
    return false;
  }
}

function pushHistory(category, lang, value) {
  try {
    const raw = window.localStorage.getItem(historyKey(category, lang));
    const arr = raw ? JSON.parse(raw) : [];
    arr.unshift({ at: Date.now(), value });
    const trimmed = arr.slice(0, HISTORY_LIMIT);
    window.localStorage.setItem(historyKey(category, lang), JSON.stringify(trimmed));
  } catch (e) {
    // ignore
  }
}

export function loadHistory(category, lang) {
  try {
    const raw = window.localStorage.getItem(historyKey(category, lang));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function exportAllTemplates() {
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    templates: {},
    customCategories: loadCustomCategories()
  };
  try {
    const prefix = "customTemplate:";
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k || k.indexOf(prefix) !== 0) continue;
      const rest = k.slice(prefix.length);
      const sepIdx = rest.lastIndexOf(":");
      if (sepIdx === -1) continue;
      const value = window.localStorage.getItem(k);
      if (value === null) continue;
      payload.templates[rest] = value;
    }
  } catch (e) {
    // ignore
  }
  return payload;
}

export function importAllTemplates(payload) {
  if (!payload || typeof payload !== "object" || !payload.templates) {
    throw new Error("invalid_backup");
  }
  if (Array.isArray(payload.customCategories)) {
    saveCustomCategories(
      payload.customCategories.filter(
        c => c && typeof c.key === "string" && c.label && typeof c.label.he === "string"
      )
    );
  }
  const entries = Object.entries(payload.templates);
  let count = 0;
  for (const [key, value] of entries) {
    if (typeof value !== "string") continue;
    const sepIdx = key.lastIndexOf(":");
    if (sepIdx === -1) continue;
    const cat = key.slice(0, sepIdx);
    const lang = key.slice(sepIdx + 1);
    if (!cat || !lang) continue;
    try {
      const prev = window.localStorage.getItem(storageKey(cat, lang));
      if (prev !== null && prev !== value) pushHistory(cat, lang, prev);
      window.localStorage.setItem(storageKey(cat, lang), value);
      count++;
    } catch (e) {
      // skip
    }
  }
  return count;
}
