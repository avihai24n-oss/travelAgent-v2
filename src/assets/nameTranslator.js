const NAME_LINE_RE = /(?:\d+\.)?\s*([A-Z][A-Z'\-]+)\/([A-Z][A-Z '\-]*?)\s+(MR|MRS|MS|MSTR|MISS|DR|CHD|CHLD|INF|INFT)(?=\s|$)/gim;

// Inline infant marker — Amadeus parks lap-infants inside parentheses
// attached to the accompanying adult's name line, e.g.:
//   5.MERCKADO/AMIT ALBERT MR (INF/ZOHAR SHALOM/21JAN26)
//                              └────── this group ─────┘
// Capture group 1 is the infant's name (everything between "INF/" and the
// next "/" or the closing ")"). The trailing "/DOB" segment is optional —
// some carriers omit it. We DON'T pull the surname from here because
// infants almost always share their accompanying adult's surname, which
// we capture from the same line via NAME_LINE_RE.
const INF_INLINE_RE = /\(INF\/([A-Z][A-Z' \-]*?)(?:\/[^)]+)?\)/gi;

export function parseAmadeusNames(raw) {
  if (!raw || typeof raw !== "string") return [];
  const names = [];
  const seen = new Set();

  // Process line-by-line so inline infants attach to the adult they're
  // bracketed against. (A single-pass scan over the whole string would
  // lose the adult ↔ infant association when there are multiple PAX lines.)
  const lines = String(raw).split("\n");
  for (const line of lines) {
    // Track the last adult surname seen on THIS line, so any inline infant
    // that follows on the same line inherits it.
    let lineAdultSurname = null;

    NAME_LINE_RE.lastIndex = 0;
    let m;
    while ((m = NAME_LINE_RE.exec(line)) !== null) {
      const surname = m[1].trim();
      const firstName = m[2].trim();
      const title = m[3].toUpperCase();
      // Remember the first adult-titled surname on this line.
      if (!lineAdultSurname && /^(MR|MRS|MS|DR)$/.test(title)) {
        lineAdultSurname = surname;
      }
      const key = `${surname}|${firstName}|${title}`;
      if (!seen.has(key)) {
        seen.add(key);
        names.push({ surname, firstName, title });
      }
    }

    INF_INLINE_RE.lastIndex = 0;
    let inf;
    while ((inf = INF_INLINE_RE.exec(line)) !== null) {
      const firstName = inf[1].trim();
      if (!firstName) continue;
      // Surname: prefer the accompanying adult's; fall back to the last
      // word of the infant's own string if no adult was found on the line
      // (rare edge case — the parser is usually fed a well-formed PNR).
      const surname = lineAdultSurname || firstName.split(/\s+/).pop();
      const key = `${surname}|${firstName}|INF`;
      if (seen.has(key)) continue;
      seen.add(key);
      names.push({ surname, firstName, title: "INF" });
    }
  }

  return names;
}

function titleToType(title) {
  const t = (title || "").toUpperCase();
  if (t === "CHD" || t === "CHLD") return "child";
  if (t === "INF" || t === "INFT") return "infant";
  return "adult";
}

export async function pingTranslationApi() {
  const supabaseUrl = process.env.VUE_APP_SUPABASE_URL;
  const supabaseKey = process.env.VUE_APP_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return { ok: false, reason: "missing_proxy_config" };
  }
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/translate-names`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ ping: true })
    });
    if (!res.ok) return { ok: false, reason: `status_${res.status}` };
    const data = await res.json();
    return {
      ok: data.ok === true,
      openaiConfigured: data.openaiConfigured === true
    };
  } catch (err) {
    return { ok: false, reason: "network_error" };
  }
}

export async function translateNamesViaProxy(names, targetLang) {
  if (!names || !names.length) return [];

  const supabaseUrl = process.env.VUE_APP_SUPABASE_URL;
  const supabaseKey = process.env.VUE_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("missing_proxy_config");
  }

  const payload = {
    names: names.map(n => ({
      firstName: n.firstName,
      surname: n.surname,
      title: n.title
    })),
    lang: targetLang
  };

  const res = await fetch(`${supabaseUrl}/functions/v1/translate-names`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`proxy_error: ${res.status} ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  if (!Array.isArray(data.names)) throw new Error("invalid_shape");
  return data.names.map(s => String(s).trim());
}

export function buildTravelersFromNames(parsedNames, translatedStrings) {
  return parsedNames.map((n, i) => ({
    name: translatedStrings[i] || `${n.firstName} ${n.surname}`,
    type: titleToType(n.title)
  }));
}
