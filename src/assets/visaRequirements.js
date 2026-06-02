// Pre-arrival entry authorizations required for Israeli passport holders.
//
// Source: Gad's destinations.md (June 2026 verification), cross-checked
// against the Wikipedia "Visa requirements for Israeli citizens" master
// table and official government portals.
//
// Keys are ISO 3166-1 alpha-2 country codes. The matching from airport
// code → country code lives in `airportCountry.js`.
//
// Trigger semantics (when to surface the entry):
//   "always"      — required for transit too (any contact with the country
//                   triggers the obligation, regardless of stay duration).
//                   Examples: USA ESTA, UK ETA, Canada eTA.
//   "destination" — required only when the country is a real destination,
//                   not a short layover. Threshold-of-stay rules are
//                   applied at render time (currently >4h transit OR final
//                   destination → treated as destination).
//   "short_transit_ok" — same as "destination" but explicit about not
//                       triggering for transit ≤4h.
//
// Status semantics:
//   "REQUIRED"    — firm pre-arrival requirement.
//   "VERIFY"      — sources conflict or policy unstable. The renderer
//                   wraps these with a "check with consulate" caveat.
//
// Schema:
//   {
//     flag:           emoji string
//     name:           { he, en, fr }
//     tag:            short tag string (ESTA / ETA / eVisa / Visa / ...)
//     status:         "REQUIRED" | "VERIFY"
//     trigger:        "always" | "destination" | "short_transit_ok"
//     url:            official URL (or "" if consular-only)
//     title:          { he, en, fr } — one-line headline
//     description:    { he, en, fr } — 1–2 sentences
//     notes:          { he, en, fr } — extra context (optional)
//   }
//
// Excluded by design:
//   - FOREIGN_ONLY entries (ETA-IL): Gad's customers carry Israeli
//     passports, so they don't need ETA-IL.
//   - Visa-free destinations for Israelis (Turkey/UAE/Japan/Schengen/...):
//     if a country isn't in the map, the renderer treats it as "no
//     requirement" and skips silently.

export const VISA_REQUIREMENTS = {
  US: {
    flag: "🇺🇸",
    name: { he: "ארה״ב", en: "USA", fr: "États-Unis" },
    tag: "ESTA",
    status: "REQUIRED",
    trigger: "always",
    url: "https://esta.cbp.dhs.gov",
    title: { he: "אישור ESTA נדרש", en: "ESTA required", fr: "ESTA requis" },
    description: {
      he: "חובה לפני העלייה למטוס. נדרש גם בטרנזיט. תקף לשנתיים.",
      en: "Required before boarding. Required for transit too. Valid 2 years.",
      fr: "Requis avant l'embarquement. Aussi en transit. Valable 2 ans."
    }
  },

  GB: {
    flag: "🇬🇧",
    name: { he: "בריטניה", en: "United Kingdom", fr: "Royaume-Uni" },
    tag: "ETA",
    status: "REQUIRED",
    trigger: "always",
    url: "https://www.gov.uk/eta",
    title: { he: "אישור UK ETA נדרש", en: "UK ETA required", fr: "UK ETA requise" },
    description: {
      he: "חובה לפני העלייה למטוס. נדרש גם בטרנזיט דרך בריטניה.",
      en: "Required before boarding. Also required for transit through the UK.",
      fr: "Requis avant l'embarquement. Aussi en transit au Royaume-Uni."
    }
  },

  CA: {
    flag: "🇨🇦",
    name: { he: "קנדה", en: "Canada", fr: "Canada" },
    tag: "eTA",
    status: "REQUIRED",
    trigger: "always",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html",
    title: { he: "eTA קנדה נדרש", en: "Canada eTA required", fr: "AVE Canada requise" },
    description: {
      he: "נדרש לכניסה אווירית, כולל טרנזיט. בדרך כלל מאושר תוך דקות.",
      en: "Required for air arrivals incl. transit. Usually approved in minutes.",
      fr: "Requise pour les arrivées par avion, transit inclus. Souvent approuvée en quelques minutes."
    }
  },

  AU: {
    flag: "🇦🇺",
    name: { he: "אוסטרליה", en: "Australia", fr: "Australie" },
    tag: "Visitor visa 600",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://immi.homeaffairs.gov.au",
    title: { he: "ויזת מבקרים אוסטרליה (subclass 600)", en: "Visitor Visa 600 required", fr: "Visa Visiteur 600 requis" },
    description: {
      he: "ויזה אונליין לפני הטיסה. זמן עיבוד משתנה — להגיש מוקדם (כשבועיים מראש).",
      en: "Online visa before flying. Processing time varies — apply early (~2 weeks).",
      fr: "Visa en ligne avant le vol. Délai variable — déposer tôt (~2 semaines)."
    }
  },

  NZ: {
    flag: "🇳🇿",
    name: { he: "ניו זילנד", en: "New Zealand", fr: "Nouvelle-Zélande" },
    tag: "NZeTA",
    status: "REQUIRED",
    trigger: "always",
    url: "https://nzeta.immigration.govt.nz",
    title: { he: "NZeTA נדרש", en: "NZeTA required", fr: "NZeTA requise" },
    description: {
      he: "נדרש כולל טרנזיט. תקף לשנתיים. בנוסף — הצהרת NZTD תוך 24 שעות לפני ההגעה.",
      en: "Required incl. transit. Valid 2 years. Plus NZTD declaration within 24h of arrival.",
      fr: "Requise transit inclus. Valable 2 ans. Plus déclaration NZTD dans les 24h."
    }
  },

  IN: {
    flag: "🇮🇳",
    name: { he: "הודו", en: "India", fr: "Inde" },
    tag: "eVisa",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://indianvisaonline.gov.in/evisa/",
    title: { he: "eVisa הודו נדרש", en: "India eVisa required", fr: "eVisa Inde requis" },
    description: {
      he: "כניסה רק בנמלי תעופה/יציאה מוגדרים. בנוסף — כרטיס e-Arrival תוך 72 שעות לפני ההגעה.",
      en: "Entry via designated airports/seaports only. Plus e-Arrival card within 72h of arrival.",
      fr: "Entrée par aéroports/ports désignés uniquement. Plus carte e-Arrival dans les 72h."
    }
  },

  CN: {
    flag: "🇨🇳",
    name: { he: "סין", en: "China", fr: "Chine" },
    tag: "Visa",
    status: "REQUIRED",
    trigger: "destination",
    url: "",
    title: { he: "ויזת סטיקר קונסולרית נדרשת", en: "Consular sticker visa required", fr: "Visa consulaire requis" },
    description: {
      he: "אין eVisa ואין ויזה בגבול לאזרחי ישראל. רק ויזת סטיקר מקונסוליה — להתחיל שבועות מראש.",
      en: "No eVisa and no visa-on-arrival for Israelis. Consular sticker only — start weeks ahead.",
      fr: "Pas d'eVisa ni de visa à l'arrivée pour les Israéliens. Visa consulaire uniquement — commencer plusieurs semaines à l'avance."
    }
  },

  VN: {
    flag: "🇻🇳",
    name: { he: "וייטנאם", en: "Vietnam", fr: "Viêt Nam" },
    tag: "eVisa",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://evisa.gov.vn",
    title: { he: "eVisa וייטנאם נדרש", en: "Vietnam eVisa required", fr: "eVisa Vietnam requis" },
    description: {
      he: "ויזה בגבול בוטלה ב-2022. eVisa בלבד, אונליין.",
      en: "Visa-on-arrival discontinued in 2022. eVisa only, online.",
      fr: "Visa à l'arrivée supprimé en 2022. eVisa uniquement, en ligne."
    }
  },

  TH: {
    flag: "🇹🇭",
    name: { he: "תאילנד", en: "Thailand", fr: "Thaïlande" },
    tag: "TDAC",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://tdac.immigration.go.th",
    title: { he: "כרטיס הגעה דיגיטלי TDAC נדרש", en: "TDAC arrival card required", fr: "Carte d'arrivée TDAC requise" },
    description: {
      he: "אין צורך בויזה לאזרחי ישראל (עד 60 יום). חובה למלא כרטיס הגעה דיגיטלי תוך 72 שעות לפני ההגעה.",
      en: "No visa needed for Israelis (up to 60 days). Digital arrival card mandatory within 72h of arrival.",
      fr: "Pas de visa requis pour les Israéliens (jusqu'à 60 jours). Carte d'arrivée numérique obligatoire dans les 72h."
    }
  },

  KH: {
    flag: "🇰🇭",
    name: { he: "קמבודיה", en: "Cambodia", fr: "Cambodge" },
    tag: "eVisa",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://www.evisa.gov.kh",
    title: { he: "eVisa קמבודיה נדרש", en: "Cambodia eVisa required", fr: "eVisa Cambodge requis" },
    description: {
      he: "ויזה בגבול קיימת אך מומלץ להגיש eVisa מראש.",
      en: "VOA exists but advance eVisa recommended.",
      fr: "Visa à l'arrivée disponible mais eVisa préalable recommandé."
    }
  },

  LK: {
    flag: "🇱🇰",
    name: { he: "סרי לנקה", en: "Sri Lanka", fr: "Sri Lanka" },
    tag: "ETA",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://eta.gov.lk",
    title: { he: "ETA סרי לנקה נדרש", en: "Sri Lanka ETA required", fr: "ETA Sri Lanka requise" },
    description: {
      he: "ETA חינמי לאזרחי ישראל. דרישות הקדמה תנודתיות — להסדיר מראש.",
      en: "ETA free for Israelis. Advance-arrangement rules fluctuate — arrange early.",
      fr: "ETA gratuite pour les Israéliens. Règles de pré-arrangement variables — à organiser tôt."
    }
  },

  ID: {
    flag: "🇮🇩",
    name: { he: "אינדונזיה", en: "Indonesia", fr: "Indonésie" },
    tag: "Visa",
    status: "VERIFY",
    trigger: "destination",
    url: "",
    title: { he: "ויזה מקונסוליה — לבדיקה", en: "Consular visa — verify", fr: "Visa consulaire — à vérifier" },
    description: {
      he: "אזרחי ישראל בקטגוריית 'calling visa' (לא VOA סטנדרטי). מומלץ לבדוק עם הקונסוליה לפני ההזמנה.",
      en: "Israelis fall under \"calling visa\" category (not standard VOA). Verify with consulate before booking.",
      fr: "Catégorie « calling visa » pour les Israéliens (pas de VOA standard). À vérifier avec le consulat."
    }
  },

  MA: {
    flag: "🇲🇦",
    name: { he: "מרוקו", en: "Morocco", fr: "Maroc" },
    tag: "eVisa",
    status: "VERIFY",
    trigger: "destination",
    url: "https://www.acces-maroc.ma",
    title: { he: "מצב ויזה למרוקו — לבדיקה", en: "Morocco visa status — verify", fr: "Statut visa Maroc — à vérifier" },
    description: {
      he: "מקורות חלוקים (פטור/eVisa עד 30 יום). מומלץ לבדוק עם הקונסוליה לפני שמצהירים סופית.",
      en: "Sources conflict (visa-free vs eVisa up to 30 days). Verify with consulate before finalising.",
      fr: "Sources divergentes (sans visa vs eVisa 30 jours). Vérifier avec le consulat."
    }
  },

  EG: {
    flag: "🇪🇬",
    name: { he: "מצרים", en: "Egypt", fr: "Égypte" },
    tag: "Visa",
    status: "REQUIRED",
    trigger: "destination",
    url: "",
    title: { he: "ויזה מקונסוליה נדרשת", en: "Consular visa required", fr: "Visa consulaire requis" },
    description: {
      he: "פטור של 14 יום קיים רק לסיני/טאבא בכניסה יבשתית. שאר המדינה דורש ויזה קונסולרית.",
      en: "14-day exemption only for Sinai/Taba via overland entry. Rest of the country needs consular visa.",
      fr: "Exemption de 14 jours uniquement pour Sinaï/Taba par voie terrestre. Reste du pays — visa consulaire."
    }
  },

  JO: {
    flag: "🇯🇴",
    name: { he: "ירדן", en: "Jordan", fr: "Jordanie" },
    tag: "eVisa",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://www.gateway2jordan.gov.jo",
    title: { he: "eVisa ירדן נדרש", en: "Jordan eVisa required", fr: "eVisa Jordanie requis" },
    description: {
      he: "eVisa מראש (גם בגבול בתנאים). Jordan Pass מבטל את אגרת הויזה לשהייה של 3 לילות ומעלה.",
      en: "eVisa in advance (also at border conditionally). Jordan Pass waives the visa fee for 3+ nights.",
      fr: "eVisa à l'avance (aussi à la frontière sous conditions). Le Jordan Pass annule les frais de visa à partir de 3 nuits."
    }
  },

  KE: {
    flag: "🇰🇪",
    name: { he: "קניה", en: "Kenya", fr: "Kenya" },
    tag: "eTA",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://www.etakenya.go.ke",
    title: { he: "eTA קניה נדרש", en: "Kenya eTA required", fr: "eTA Kenya requise" },
    description: {
      he: "כל המבקרים חייבים eTA מאז 2024. אגרה כ-$32.50.",
      en: "All visitors need eTA since 2024. Fee ~$32.50.",
      fr: "Tous les visiteurs ont besoin de l'eTA depuis 2024. Tarif ~32,50 $."
    }
  },

  TZ: {
    flag: "🇹🇿",
    name: { he: "טנזניה", en: "Tanzania", fr: "Tanzanie" },
    tag: "eVisa",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://eservices.immigration.go.tz",
    title: { he: "eVisa טנזניה נדרש", en: "Tanzania eVisa required", fr: "eVisa Tanzanie requis" },
    description: {
      he: "ויזה בגבול קיימת, אך מומלץ להגיש eVisa מראש.",
      en: "VOA available, but advance eVisa recommended.",
      fr: "Visa à l'arrivée disponible, mais eVisa préalable recommandé."
    }
  },

  ET: {
    flag: "🇪🇹",
    name: { he: "אתיופיה", en: "Ethiopia", fr: "Éthiopie" },
    tag: "eVisa",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://www.evisa.gov.et",
    title: { he: "eVisa אתיופיה נדרש", en: "Ethiopia eVisa required", fr: "eVisa Éthiopie requis" },
    description: {
      he: "ויזה בגבול קיימת רק בנמל אדיס אבבה. eVisa בטוח יותר.",
      en: "VOA only at Addis Ababa airport. eVisa is safer.",
      fr: "Visa à l'arrivée uniquement à Addis-Abeba. eVisa préférable."
    }
  },

  UG: {
    flag: "🇺🇬",
    name: { he: "אוגנדה", en: "Uganda", fr: "Ouganda" },
    tag: "eVisa",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://visas.immigration.go.ug",
    title: { he: "eVisa אוגנדה נדרש", en: "Uganda eVisa required", fr: "eVisa Ouganda requis" },
    description: {
      he: "להגיש לפני הטיסה. שהייה עד 3 חודשים.",
      en: "Apply before flying. Stay up to 3 months.",
      fr: "Déposer avant le vol. Séjour jusqu'à 3 mois."
    }
  },

  RW: {
    flag: "🇷🇼",
    name: { he: "רואנדה", en: "Rwanda", fr: "Rwanda" },
    tag: "eVisa",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://irembo.gov.rw",
    title: { he: "eVisa רואנדה נדרש", en: "Rwanda eVisa required", fr: "eVisa Rwanda requis" },
    description: {
      he: "ויזה בגבול קיימת, מומלץ להגיש מראש.",
      en: "VOA available, advance recommended.",
      fr: "Visa à l'arrivée disponible, préalable recommandé."
    }
  },

  ZW: {
    flag: "🇿🇼",
    name: { he: "זימבבואה / זמביה", en: "Zimbabwe / Zambia", fr: "Zimbabwe / Zambie" },
    tag: "eVisa",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://www.evisa.gov.zw",
    title: { he: "eVisa לזימבבואה/זמביה (מפלי ויקטוריה)", en: "Zimbabwe/Zambia eVisa (Victoria Falls)", fr: "eVisa Zimbabwe/Zambie (chutes Victoria)" },
    description: {
      he: "eVisa לכל מדינה בנפרד. זמינות KAZA UniVisa תנודתית — לבדוק בעת ההזמנה.",
      en: "eVisa per country. KAZA UniVisa availability fluctuates — check at booking.",
      fr: "eVisa par pays. La disponibilité du KAZA UniVisa varie — à vérifier lors de la réservation."
    }
  },

  ZA: {
    flag: "🇿🇦",
    name: { he: "דרום אפריקה", en: "South Africa", fr: "Afrique du Sud" },
    tag: "Visa-free / Verify",
    status: "VERIFY",
    trigger: "destination",
    url: "",
    title: { he: "פטור ויזה — לבדיקה לפני הטיסה", en: "Visa-free — verify before flying", fr: "Sans visa — à vérifier avant le vol" },
    description: {
      he: "פטור עד 90 יום, אבל מומלץ לבדוק את הסטטוס הדיפלומטי לפני הטיסה.",
      en: "Visa-free up to 90 days, but verify current diplomatic status before flying.",
      fr: "Sans visa jusqu'à 90 jours, mais vérifier le statut diplomatique actuel avant de voler."
    }
  },

  MZ: {
    flag: "🇲🇿",
    name: { he: "מוזמביק", en: "Mozambique", fr: "Mozambique" },
    tag: "ETA",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://evisa.gov.mz",
    title: { he: "ETA מוזמביק נדרש", en: "Mozambique ETA required", fr: "ETA Mozambique requise" },
    description: {
      he: "להסדיר לפחות 48 שעות לפני ההגעה דרך פלטפורמת eVisa.",
      en: "Register at least 48h before arrival via the eVisa platform.",
      fr: "Enregistrement au moins 48h avant l'arrivée via la plateforme eVisa."
    }
  },

  SC: {
    flag: "🇸🇨",
    name: { he: "סיישל", en: "Seychelles", fr: "Seychelles" },
    tag: "EBS",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://seychelles.govtas.com",
    title: { he: "אישור EBS סיישל נדרש", en: "Seychelles EBS required", fr: "Autorisation EBS Seychelles requise" },
    description: {
      he: "Electronic Border System Travel Authorization לפני הטיסה.",
      en: "Electronic Border System Travel Authorization before travel.",
      fr: "Autorisation de voyage Electronic Border System avant le voyage."
    }
  },

  BH: {
    flag: "🇧🇭",
    name: { he: "בחריין", en: "Bahrain", fr: "Bahreïn" },
    tag: "eVisa",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://www.evisa.gov.bh",
    title: { he: "eVisa בחריין נדרש", en: "Bahrain eVisa required", fr: "eVisa Bahreïn requis" },
    description: {
      he: "ויזה בגבול קיימת. נדרשת הוכחת אמצעים + כתובת אכסון בבחריין.",
      en: "VOA available. Proof of funds + Bahrain address required.",
      fr: "Visa à l'arrivée disponible. Justificatif de fonds + adresse à Bahreïn requis."
    }
  },

  OM: {
    flag: "🇴🇲",
    name: { he: "עומאן", en: "Oman", fr: "Oman" },
    tag: "Visa",
    status: "VERIFY",
    trigger: "destination",
    url: "https://evisa.rop.gov.om",
    title: { he: "מצב ויזה לעומאן — לבדיקה", en: "Oman visa — verify", fr: "Visa Oman — à vérifier" },
    description: {
      he: "מאגר Wikipedia מציין 'ויזה נדרשת'. לבדוק זכאות לאזרחי ישראל עם הקונסוליה/סוכנות.",
      en: "Master table lists \"visa required\". Verify Israeli eligibility with consulate/agency.",
      fr: "La liste de référence indique « visa requis ». Vérifier l'éligibilité israélienne avec le consulat/l'agence."
    }
  },

  AZ: {
    flag: "🇦🇿",
    name: { he: "אזרבייג'ן", en: "Azerbaijan", fr: "Azerbaïdjan" },
    tag: "e-Visa",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://evisa.gov.az",
    title: { he: "e-Visa אזרבייג'ן (ASAN) נדרש", en: "Azerbaijan e-Visa (ASAN) required", fr: "e-Visa Azerbaïdjan (ASAN) requis" },
    description: {
      he: "ויזה בגבול קיימת, e-Visa נקי יותר.",
      en: "VOA available, e-Visa cleaner.",
      fr: "Visa à l'arrivée disponible, l'e-Visa est préférable."
    }
  },

  MM: {
    flag: "🇲🇲",
    name: { he: "מיאנמר", en: "Myanmar", fr: "Myanmar" },
    tag: "eVisa",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://evisa.moip.gov.mm",
    title: { he: "eVisa מיאנמר נדרש", en: "Myanmar eVisa required", fr: "eVisa Myanmar requis" },
    description: {
      he: "כניסה רק דרך נמלי יאנגון / ניי פיי טאו / מנדליי.",
      en: "Entry via Yangon / Nay Pyi Taw / Mandalay airports only.",
      fr: "Entrée uniquement via Yangon / Nay Pyi Taw / Mandalay."
    }
  },

  NP: {
    flag: "🇳🇵",
    name: { he: "נפאל", en: "Nepal", fr: "Népal" },
    tag: "eVisa / VOA",
    status: "REQUIRED",
    trigger: "destination",
    url: "https://nepaliport.immigration.gov.np",
    title: { he: "ויזת eVisa או VOA נדרשת", en: "eVisa or VOA required", fr: "eVisa ou VOA requise" },
    description: {
      he: "eVisa מראש או VOA. מילוי הטופס אונליין חוסך זמן בנמל.",
      en: "eVisa in advance or VOA. Pre-filling the form online saves time at the airport.",
      fr: "eVisa à l'avance ou VOA. Remplir le formulaire en ligne fait gagner du temps à l'aéroport."
    }
  }
};

// Helper — short-transit threshold used when trigger="destination". Any
// destination with hoursAtStop ≤ this is treated as "just transit" and the
// requirement is hidden. Trigger="always" entries bypass this.
export const SHORT_TRANSIT_THRESHOLD_HOURS = 4;

// Resolves the visa block for a parsed PNR.
//
// Input:
//   flights     — array from getParsedFlights() (each has destAirportCode +
//                 the timing fields used by getHourDifference)
//   lang        — "he" | "en" | "fr"
//   getCountry  — function (iataCode) → ISO country code or null
//   hoursAtStop — function (flightIndex) → number of hours at this flight's
//                 destination before the next departure (Infinity for the
//                 last leg, meaning "stay through end of trip")
//
// Returns: array of { code, country, hours, trigger, status } for each
// destination/transit that requires pre-arrival action. Order matches the
// order of appearance in the PNR. Duplicates (same country visited twice)
// are deduped — first occurrence wins.
export function resolveVisaForFlights(flights, lang, getCountry, hoursAtStop) {
  if (!Array.isArray(flights) || !flights.length) return [];
  const seen = new Set();
  const result = [];
  for (let i = 0; i < flights.length; i++) {
    const f = flights[i];
    const code = getCountry(f.destAirportCode);
    if (!code || code === "IL") continue;      // Home country — never list
    if (seen.has(code)) continue;              // De-dupe across legs
    const req = VISA_REQUIREMENTS[code];
    if (!req) continue;                        // No requirement on file
    const hours = hoursAtStop(i);
    const isShortTransit = hours <= SHORT_TRANSIT_THRESHOLD_HOURS;
    if (req.trigger === "destination" && isShortTransit) continue;
    seen.add(code);
    result.push({
      code,
      country: req,
      hours,
      trigger: req.trigger,
      status: req.status
    });
  }
  return result;
}
