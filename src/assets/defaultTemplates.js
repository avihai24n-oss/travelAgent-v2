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
  "FLIGHT_CLASS"
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
  FLIGHTS: { he: "פרטי טיסות (בלוק שלם)", en: "Flights (full block)", fr: "Vols (bloc entier)" },
  AIRLINE_NAME: { he: "חברת תעופה", en: "Airline", fr: "Compagnie" },
  AIRLINE_CODE: { he: "קוד חברה", en: "Airline code", fr: "Code compagnie" },
  CLASS: { he: "מחלקה", en: "Class", fr: "Classe" },
  PRICE: { he: "מחיר", en: "Price", fr: "Prix" },
  CURRENCY: { he: "מטבע", en: "Currency", fr: "Devise" },
  BAGGAGE: { he: "כבודה", en: "Baggage", fr: "Bagages" },
  CHANGE_FEE: { he: "דמי שינוי", en: "Change fee", fr: "Frais de changement" },
  CANCEL_FEE: { he: "דמי ביטול", en: "Cancel fee", fr: "Frais d'annulation" },
  NO_SHOW: { he: "אי-התייצבות", en: "No show", fr: "No show" },
  TICKET_ISSUANCE: { he: "מועד הנפקה", en: "Ticket issuance", fr: "Émission du billet" }
};

export const CATEGORIES = [
  { key: "flight", label: { he: "הצעת טיסה", en: "Flight Quote", fr: "Devis de vol" } }
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
*מחלקת תיירים/עסקים/פרמיום*
ממריא {{FLIGHT_DEPART_DAY}} {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
נוחת    {{FLIGHT_ARRIVE_DAY}} {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 מושב *XX*

*{{FLIGHT_DIRECTION}}*
טיסת {{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ({{FLIGHT_ORIGIN_CODE}}) ⬅️ {{FLIGHT_DEST_CITY}}
*מחלקת תיירים/עסקים/פרמיום*
ממריא {{FLIGHT_DEPART_DAY}} {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
נוחת    {{FLIGHT_ARRIVE_DAY}} {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 מושב *XX*

*חברת התעופה:* ({{AIRLINE_CODE}}) ✈️
*{{AIRLINE_NAME}}*

*מחלקת שירות* 💺
*{{CLASS}}*

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
*Economy/Premium/Business Class*
Dpt. {{FLIGHT_DEPART_DAY}}. {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
Arr.  {{FLIGHT_ARRIVE_DAY}}. {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 Seat *XX*

*{{FLIGHT_DIRECTION}}*
{{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ({{FLIGHT_ORIGIN_CODE}}) ➡️ {{FLIGHT_DEST_CITY}}
*Economy/Premium/Business Class*
Dpt. {{FLIGHT_DEPART_DAY}}. {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
Arr.  {{FLIGHT_ARRIVE_DAY}}. {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 Seat *XX*

*Airline:* ({{AIRLINE_CODE}}) ✈️
*{{AIRLINE_NAME}}*

*Compartment* 💺
*{{CLASS}}*

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
*Economy/Premium/Business Class*
Dpt. {{FLIGHT_DEPART_DAY}} {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
Arr.  {{FLIGHT_ARRIVE_DAY}} {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 Siege *XX*

*{{FLIGHT_DIRECTION}}*
{{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ({{FLIGHT_ORIGIN_CODE}}) ➡️ {{FLIGHT_DEST_CITY}} ({{FLIGHT_DEST_CODE}})
*Economy/Premium/Business Class*
Dpt. {{FLIGHT_DEPART_DAY}} {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
Arr.  {{FLIGHT_ARRIVE_DAY}} {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 Siege *XX*

*Compagnie:* ({{AIRLINE_CODE}}) ✈️
*{{AIRLINE_NAME}}*

*Compartiment* 💺
*{{CLASS}}*

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
  }
};

// Multi-fare quote template — used by the toggle in the Preview area.
// Same flight-block engine as DEFAULT_TEMPLATES.flight (identical itinerary
// format kept verbatim from the regular template), but the single AIRFARE
// section is replaced by three fare tiers (OPTIMA / COMFORT / FLEX). Manual-
// fill fields (prices, change/cancel fees, passenger count) are literal ___
// so the agent fills them in by editing the rendered message.
// Currently EN only; he/fr to be added later — until then the toggle is hidden.
export const MULTI_FARE_TEMPLATES = {
  en: `*{{CUSTOMER_NAME}}*, Shalom!
⏰ *Your tickets issuance approval❗*
👉 *{{TICKET_ISSUANCE}}*

In reply to your request, you'll find below my *Updated proposal* for your *(👤{{CUSTOMER_NAME}})* upcoming trip to *{{DESTINATION}}*
{{ALL_NAMES}}

Please reply directly to this WhatsApp message with:
✅ Your approval to issue the *___ tickets*
✅ Your selected fare option: 🟥 *OPTIMA* / 🟩 *COMFORT* / 🟦 *FLEX*

*Itinerary 🌍*

*{{FLIGHT_DIRECTION}}*
{{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ➡️ {{FLIGHT_DEST_CITY}} ({{FLIGHT_DEST_CODE}})
*Economy/Premium/Business Class*
Dpt. {{FLIGHT_DEPART_DAY}}. {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
Arr.  {{FLIGHT_ARRIVE_DAY}}. {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 Seat *XX*

*{{FLIGHT_DIRECTION}}*
{{FLIGHT_AIRLINE}} - *{{FLIGHT_NUMBER}}*
{{FLIGHT_ORIGIN_CITY}} ({{FLIGHT_ORIGIN_CODE}}) ➡️ {{FLIGHT_DEST_CITY}}
*Economy/Premium/Business Class*
Dpt. {{FLIGHT_DEPART_DAY}}. {{FLIGHT_DEPART_DATE}} {{FLIGHT_DEPART_MONTH}} {{FLIGHT_DEPART_TIME}}
Arr.  {{FLIGHT_ARRIVE_DAY}}. {{FLIGHT_ARRIVE_DATE}} {{FLIGHT_ARRIVE_MONTH}} {{FLIGHT_ARRIVE_TIME}}
💺 Seat *XX*

*Airline:* ({{AIRLINE_CODE}}) ✈️
*{{AIRLINE_NAME}}*

*Compartment* 💺
*{{CLASS}}*

*AIRFARE OPTIONS* 🎫
For the same itinerary above, you may choose one of the following *3 fare options*:

-----------------------------

🟥 *OPTIMA Rate* 🎫
💳 *Price:*
👉 *___ x ___ Adults*

*Baggage Allowance* 🧳
✅ 1 checked bag *23 kg*
✅ 1 handbag *8 kg*

*Preselected Seats* 💺
❌ Not included
*Seats can only be selected 24 hours before each flight* ❗

*Ticket Restrictions* ⚠️
▪️ Change: *___ p.p.*
  *(+ fare difference, if applicable)*
▪️ Cancellation: *Non-refundable* ❗
▪️ No-show: *Total loss*

-----------------------------

🟩 *COMFORT Rate* 🎫
💳 *Price:*
👉 *___ x ___ Adults*

*Baggage Allowance* 🧳
✅ 1 checked bag *23 kg*
✅ 1 handbag *8 kg*

*Preselected Seats* 💺
✅ Standard seats included

*Ticket Restrictions* ⚠️
▪️ Change: *___ p.p.*
  *(+ fare difference, if applicable)*
▪️ Cancellation: *___ p.p.*
▪️ No-show: *Total loss*

-----------------------------

🟦 *FLEX Rate* 🎫
💳 *Price:*
👉 *___ x ___ Adults*

*Baggage Allowance* 🧳
✅ 1 checked bag *23 kg*
✅ 1 handbag *8 kg*

*Preselected Seats* 💺
✅ Standard / preferred seats included

*Ticket Restrictions* ⚠️
▪️ Change: *___ p.p.*
   *(+ fare difference, if applicable)*
▪️ Cancellation: *___ p.p.*
▪️ No-show: *Total loss*

-----------------------------

👉 *Please indicate your preferred fare option for each passenger.*

*Important Notes* ❗
▪️ Fares are subject to change without prior notice until tickets are issued.
▪️ Seats, fares, and conditions are only guaranteed once tickets are issued.
▪️ *p.p. = per person*

⏱️ *Ticket issuance deadline*
🟥 🟩 🟦
👉 *{{TICKET_ISSUANCE}}*

To proceed, please reply directly to this WhatsApp message with your *fare choice* and your *approval to issue the tickets*.

Thanks,
Gad Elnekave
Sincerely Yours
🏢 American Express Global Business Travel
📞 Mob. 972-54-5727055
✉️ gad@gbtil.co.il`
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

export function loadTemplate(category, lang) {
  try {
    const saved = window.localStorage.getItem(storageKey(category, lang));
    // For built-in `flight`, ignore a cached value if it carries the old
    // pre-fix structure — we'd rather render the up-to-date default than the
    // broken save. Custom categories are always honoured as-is.
    if (saved !== null && !(category === "flight" && isOutdatedFlightTemplate(saved))) {
      return saved;
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
