// Supabase Edge Function: compose-message
// "Specials" agent — lets Gad edit an existing WhatsApp quote by talking to it
// in free Hebrew. The agent NEVER invents templates or flight facts: it is
// grounded on Gad's own existing templates, placeholder vocabulary and emoji
// set (all passed in per request), and it returns SURGICAL patches to the
// current message blocks — never a full rewrite.
//
// Flight integrity: the flight block is a "locked" block. The agent is told it
// must never touch it, and the server drops any op that targets a locked block.
// The real flight facts always come from the Amadeus parser on the client.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Lang = "he" | "en" | "fr";

interface Block {
  id: string;
  type: "text" | "locked";
  text: string;
  label?: string;
}

interface Corpus {
  placeholders: { token: string; label: string }[];
  emojis: string[];
  templates: { category: string; text: string }[];
}

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

// Studio mode: concrete details already entered in the app that the agent must
// write into the message as real text (never as placeholders).
interface KnownDetails {
  customerName?: string;
  travelers?: string[];
  destination?: string;
  destinationCode?: string;
}

interface RequestBody {
  instruction: string;
  blocks: Block[];
  lang: Lang;
  flightSummary?: string;
  corpus: Corpus;
  history?: ChatTurn[];
  ping?: boolean;
  mode?: "edit" | "generate";
  knownDetails?: KnownDetails | null;
}

type PatchOp =
  | { op: "replace"; id: string; text: string }
  | { op: "insert_after"; id: string; text: string }
  | { op: "delete"; id: string };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

const LANG_NAME: Record<Lang, string> = {
  he: "Hebrew (עברית, right-to-left)",
  en: "English",
  fr: "French (Français)",
};

function buildSystemPrompt(corpus: Corpus, lang: Lang): string {
  const placeholderList = corpus.placeholders
    .map((p) => `  {{${p.token}}} — ${p.label}`)
    .join("\n");
  const emojiList = corpus.emojis.join(" ");
  const examples = corpus.templates
    .map((t, i) => `--- EXAMPLE TEMPLATE ${i + 1} (${t.category}) ---\n${t.text}`)
    .join("\n\n");

  return `You are the "Specials" editing assistant for Gad, a veteran Israeli travel agent. Gad asks you to adapt an existing flight-quote WhatsApp message for a non-standard case (e.g. a rescue booking where an external body pays, a quote with no customer price, special payment terms, etc.).

LANGUAGE — read carefully: Gad may write his REQUEST in ANY language (Hebrew, English, French, Arabic, Russian, transliteration, mixed, …). Understand the request no matter which language it is in. But the QUOTE ITSELF stays in its original language: EVERY piece of text you output — every block's "text" AND the "note" — MUST be written in ${LANG_NAME[lang]}, the language of the quote. Never switch the message into the language of the request.

You edit ONE message that is given to you as an ordered list of BLOCKS. You return SURGICAL PATCHES to those blocks — never a full rewrite.

════════ HARD RULES (never break) ════════
1. NEVER invent a new template or new message structure. You LEAN ENTIRELY on Gad's existing templates below — reuse his exact phrasing, section order, punctuation and tone. When in doubt, copy his style verbatim and adjust minimally.
2. The flight block (type "locked") is the Amadeus itinerary. BY DEFAULT do not touch it — for a normal edit, never emit any op on a locked block. The exceptions are SEAT numbers (see rule 8, which overrides this default) and — only if the user clearly insists — meals. When you do emit a "replace" on a locked block, reproduce the block's current text EXACTLY and change ONLY the precise thing the user asked; every other flight fact (flight numbers, dates, times, airport names/codes, cities, directions, class) MUST stay byte-for-byte identical. Any op you emit on a locked block is NEVER applied automatically — the user is first shown a confirmation gate — so whenever you emit such an op you MUST also fill the top-level "summary" field describing exactly what will change. Use "insert_after" on the locked block ONLY to add a remark that is not itself flight content (a general note beside the itinerary); never use it for seats.
3. NEVER invent literal flight facts you were not given (flight numbers, dates, times, airport names/codes, class). Seat numbers / meals that the USER explicitly provides may be written into the locked block via a confirmed "replace" (rules 2 and 8).
4. Use ONLY placeholders from the ALLOWED PLACEHOLDERS list. Never invent a placeholder. If a value has no placeholder, write it as Gad's own plain wording.
5. Use ONLY emojis from the ALLOWED EMOJIS whitelist — the exact set Gad already uses. Never introduce a new emoji.
6. Write content in ${LANG_NAME[lang]}, matching Gad's voice. For Hebrew keep it RTL and use WhatsApp *bold* (single asterisks) exactly as Gad does.
7. Make the SMALLEST change that satisfies the request. Only include in "patch" the blocks that must change. Leave every other block out of the patch entirely.
8. SEATS — read this whole rule before writing any seat number. A quote talks about seating in TWO different places, and they mean DIFFERENT things. When the user gives you seat numbers you MUST update BOTH.

   PLACE 1 — the seat-number lines INSIDE the locked itinerary. Every flight segment in the locked block ends with its own seat line, and while the seats are unknown that line carries the literal placeholder "XX":
     Hebrew: "💺 מושבים: XX"      English: "(Seat XX - )"      French: "(Siege XX-)"
   "XX" means "seats not assigned yet" — it is a FIELD TO FILL, not a fact to protect. Treat "add seats", "תוסיף מושבים", "הושבה", "update the seats" and any similar request as an instruction to fill these lines. There is NO difference between "adding" and "changing" seats: both are a "replace" op on the locked block. Never answer a seat request with an "insert_after" and never leave an "XX" behind.
     • Replace the "XX" on the seat line of EVERY flight segment, not only the first one. A round trip has at least two segments and therefore at least two seat lines.
     • If the user maps seats to directions explicitly ("הלוך F3, חזור C4", "outbound 12A, return 14C"), honour that mapping segment by segment, in itinerary order.
     • If the user gives ONE flat list with no direction mapping (e.g. "F3, C4"), write that SAME list on every segment's seat line (the normal case: one seat per passenger, same seats each way).
     • Keep the surrounding wording of the seat line exactly as it already is — swap only the "XX" for the seat numbers, comma-separated. Change nothing else in the block.
     • Because this is a locked block, you MUST also fill "summary", spelling out per segment what will be written, e.g. "אעדכן את המושבים ל-F3, C4 בטיסת ההלוך ובטיסת החזור".

   PLACE 2 — the seating line in the FARE / TICKET-DETAILS section (a normal, non-locked block). This one is about the seating POLICY, never about seat numbers. It looks like "💺 הושבה" followed by a ✅/❌ line ("❌ללא הושבה מראש", "✅הושבה מראש (מושב סטנדרטי)", "✅כולל הושבה מראש (מושב מועדף)"), or the equivalent in English/French. Rules for it:
     • NEVER write seat numbers here. Seat numbers belong only in PLACE 1.
     • Once actual seats exist, a "❌ no pre-seating" line has become false — emit a "replace" on that block flipping it to the ✅ pre-seating wording that Gad already uses in his templates (keep his exact phrasing and indentation). If the section already says ✅, leave it alone.
     • If the fare section offers several ✅/❌ seating variants as a menu, keep only the ✅ one that now applies and drop the contradicting line, exactly as Gad does.

   So a seat request normally produces TWO ops: one "replace" on the locked itinerary (goes to the confirmation gate) and one "replace" on the fare block (applied immediately). Emit both in "patch".

════════ ALLOWED PLACEHOLDERS ════════
${placeholderList}

════════ ALLOWED EMOJIS ════════
${emojiList}

════════ GAD'S EXISTING TEMPLATES (your only style source) ════════
${examples}

════════ OUTPUT FORMAT ════════
Return ONLY a JSON object:
{
  "patch": [
    { "op": "replace", "id": "<block id>", "text": "<new text>" },
    { "op": "insert_after", "id": "<block id>", "text": "<new block text>" },
    { "op": "delete", "id": "<block id>" }
  ],
  "summary": "<REQUIRED whenever ANY op in patch targets a locked flight block: one short sentence in ${LANG_NAME[lang]} stating exactly what will change, naming every affected flight segment so Gad can verify before approving — e.g. 'אעדכן את המושבים ל-F3, C4 בטיסת ההלוך ובטיסת החזור'. Leave it as an empty string when no op touches a locked block.>",
  "note": "<one short sentence in ${LANG_NAME[lang]} telling Gad what you changed>"
}
- "op" is one of: "replace", "insert_after", "delete".
- "id" must be an id from the provided blocks (for insert_after, the new block goes right after that id).
- If nothing should change, return { "patch": [], "summary": "", "note": "<explanation>" }.
No markdown, no commentary — JSON only.`;
}

function buildUserPrompt(body: RequestBody): string {
  const blocksJson = JSON.stringify(
    body.blocks.map((b) => ({
      id: b.id,
      type: b.type,
      label: b.label || null,
      // Locked blocks now expose their real text so that — ONLY when the user
      // explicitly asks to change locked flight content (e.g. seat numbers) —
      // the model can emit a "replace" that reproduces the block byte-for-byte
      // with just that one thing changed. Such ops are never auto-applied; the
      // server returns them as "pending" for the user to confirm.
      text: b.text,
    })),
    null,
    2
  );
  const flightCtx = body.flightSummary
    ? `\nFLIGHT FACTS (read-only context, already rendered inside the locked block — never repeat as literals):\n${body.flightSummary}\n`
    : "";
  return `CURRENT MESSAGE BLOCKS:
${blocksJson}
${flightCtx}
GAD'S REQUEST:
${body.instruction}`;
}

function formatKnownDetails(kd: KnownDetails | null | undefined): string {
  if (!kd) return "(none — rely on the brief for names/destination)";
  const lines: string[] = [];
  if (kd.customerName) lines.push(`Customer name: ${kd.customerName}`);
  if (Array.isArray(kd.travelers) && kd.travelers.length) {
    lines.push(`All travelers: ${kd.travelers.join(", ")}`);
  }
  if (kd.destination) {
    lines.push(`Destination: ${kd.destination}${kd.destinationCode ? ` (${kd.destinationCode})` : ""}`);
  }
  return lines.length ? lines.join("\n") : "(none — rely on the brief)";
}

function buildGenerateSystemPrompt(
  corpus: Corpus,
  lang: Lang,
  knownDetails?: KnownDetails | null
): string {
  const emojiList = corpus.emojis.join(" ");
  const examples = corpus.templates
    .map((t, i) => `--- EXAMPLE TEMPLATE ${i + 1} (${t.category}) ---\n${t.text}`)
    .join("\n\n");
  const details = formatKnownDetails(knownDetails);

  return `You are the "Studio" writing assistant for Gad, a veteran Israeli travel agent. Gad gives you a free-text BRIEF describing a flight quote he wants, and you write the COMPLETE WhatsApp flight-quote message from scratch, entirely in Gad's own voice.

LANGUAGE — read carefully: Gad may write his BRIEF in ANY language (Hebrew, English, French, Arabic, Russian, transliteration, mixed, …). Understand the brief no matter which language it is in. But the QUOTE ITSELF stays in its own language: EVERY piece of text you output — the "message" AND the "note" — MUST be written in ${LANG_NAME[lang]}, the language of the quote. Never switch the message into the language of the brief.

You write ONE full message. You do NOT return patches — you return the entire finished message as a single string.

════════ HARD RULES (never break) ════════
1. NEVER invent a new template, structure or emoji. You LEAN ENTIRELY on Gad's existing templates below — reuse his exact phrasing, section order, punctuation, tone and layout. When in doubt, copy his style verbatim and adjust minimally.
2. The message MUST contain EXACTLY ONE {{FLIGHTS}} token, placed exactly where the flight itinerary belongs. That single token is the ONLY place flight details ever appear.
3. NEVER write literal flight facts yourself (flight numbers, dates, times, airport names/codes, seat numbers, layovers). Those are rendered deterministically from the Amadeus PNR wherever {{FLIGHTS}} sits. If you need the itinerary, it is already there — write {{FLIGHTS}} and nothing else for it. SEAT NUMBERS specifically: see rule 8 — they go in the "seats" field, NEVER in "message".
4. {{FLIGHTS}} IS THE ONLY placeholder you may output. Do NOT output any other {{...}} token — no {{CUSTOMER_NAME}}, {{DESTINATION}}, {{PRICE}} etc. Gad's templates show those placeholders only as STYLE examples; you must replace them with REAL concrete text. Use the KNOWN DETAILS below for the customer name, travelers and destination, and the brief for everything else. If a value is unknown and not in the brief, omit it gracefully rather than leaving a placeholder.
5. Use ONLY emojis from the ALLOWED EMOJIS whitelist — the exact set Gad already uses. Never introduce a new emoji.
6. Write content in ${LANG_NAME[lang]}, matching Gad's voice. For Hebrew keep it RTL and use WhatsApp *bold* (single asterisks) exactly as Gad does.
7. Output the FULL message — greeting, itinerary token, price, terms, sign-off — as Gad would send it, complete and ready to paste.
8. SEATS. The rendered itinerary carries one seat line per flight segment, holding the literal placeholder "XX" while the seats are unknown ("💺 מושבים: XX" / "(Seat XX - )" / "(Siege XX-)"). You cannot edit it — {{FLIGHTS}} is substituted after you finish. So when the brief supplies seat numbers:
   • Put them ONLY in the top-level "seats" array, one entry per flight segment in itinerary order. The app substitutes each entry for that segment's "XX". Example: "seats": ["B1, B2", "A1, A2"] means B1, B2 on the first flight and A1, A2 on the second.
   • If the brief maps seats to directions ("הלוך B1 B2, חזור A1 A2", "outbound 12A, return 14C"), order the array accordingly: outbound first, then inbound.
   • If the brief gives ONE flat list with no direction mapping ("המושבים B1, B2"), return a SINGLE-entry array (["B1, B2"]) — the app applies that list to every segment. Do NOT pad or guess extra entries.
   • Write the seat numbers NOWHERE in "message" — no "💺 הושבה: הלוך - B1, B2" summary line, no seat numbers in the fare section, nothing. Duplicating them there is a bug: the itinerary already shows them once the app substitutes.
   • Since real seats now exist, the fare/ticket section's seating POLICY line must read the ✅ pre-seating wording Gad uses (not "❌ ללא הושבה מראש"). That line is about policy and never carries numbers.
   • If the brief mentions no seats at all, return an empty array.

════════ KNOWN DETAILS (write these in as real text — NEVER as placeholders) ════════
${details}

════════ ALLOWED EMOJIS ════════
${emojiList}

════════ GAD'S EXISTING TEMPLATES (your only style source) ════════
${examples}

════════ OUTPUT FORMAT ════════
Return ONLY a JSON object:
{
  "message": "<the full WhatsApp quote message, with exactly one {{FLIGHTS}} token>",
  "seats": ["<seats for flight 1, comma-separated>", "<seats for flight 2>", "..."],
  "note": "<one short sentence in ${LANG_NAME[lang]} telling Gad what you wrote>"
}
- "seats" is REQUIRED. Per rule 8: one entry per flight segment in itinerary order, a single entry to apply the same seats to every segment, or [] when the brief mentions no seats. Never repeat these numbers inside "message".
No markdown, no commentary — JSON only.`;
}

// ── validation helpers ────────────────────────────────────────────────
function extractPlaceholders(text: string): string[] {
  const out: string[] = [];
  const re = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  if (body.ping) {
    return json({ ok: true, openaiConfigured: Boolean(Deno.env.get("OPENAI_KEY")) });
  }

  const mode: "edit" | "generate" = body.mode === "generate" ? "generate" : "edit";

  if (!body.instruction || typeof body.instruction !== "string") {
    return json({ error: "no_instruction" }, 400);
  }
  if (mode === "edit" && (!Array.isArray(body.blocks) || body.blocks.length === 0)) {
    return json({ error: "no_blocks" }, 400);
  }
  if (!body.corpus || !Array.isArray(body.corpus.placeholders)) {
    return json({ error: "no_corpus" }, 400);
  }
  const lang: Lang = body.lang === "en" || body.lang === "fr" ? body.lang : "he";

  const apiKey = Deno.env.get("OPENAI_KEY");
  if (!apiKey) return json({ error: "missing_api_key" }, 500);

  // ── "generate" (Studio) mode — write a full message from a free-text brief ──
  if (mode === "generate") {
    const flightCtx = body.flightSummary
      ? `\n\nFLIGHT FACTS (read-only context, rendered deterministically wherever {{FLIGHTS}} sits — never repeat as literals):\n${body.flightSummary}`
      : "";
    const genMessages = [
      { role: "system", content: buildGenerateSystemPrompt(body.corpus, lang, body.knownDetails) },
      ...(Array.isArray(body.history) ? body.history.slice(-8) : []),
      { role: "user", content: `GAD'S BRIEF:\n${body.instruction}${flightCtx}` },
    ];

    const genRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: genMessages,
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
    });

    if (!genRes.ok) {
      const errText = await genRes.text();
      return json({ error: "openai_error", status: genRes.status, detail: errText.slice(0, 300) }, 502);
    }

    const genData = await genRes.json();
    const genRaw = genData?.choices?.[0]?.message?.content;
    if (!genRaw) return json({ error: "empty_response" }, 502);

    let genParsed: { message?: unknown; note?: unknown; seats?: unknown };
    try {
      genParsed = JSON.parse(genRaw);
    } catch {
      return json({ error: "invalid_model_json" }, 502);
    }

    const message =
      typeof genParsed.message === "string" ? genParsed.message.trim() : "";
    if (!message) return json({ error: "empty_response" }, 502);

    const genNote =
      typeof genParsed.note === "string" && genParsed.note.trim() ? genParsed.note.trim() : "";

    // Seat numbers the brief supplied, one entry per flight segment (see rule 8).
    // The model must NOT write these into the message — the client substitutes
    // them for the itinerary's "XX" placeholders, so the Amadeus-rendered flight
    // facts are never touched by generated text.
    const seats = Array.isArray(genParsed.seats)
      ? genParsed.seats
          .map((s) => (typeof s === "string" ? s.trim() : ""))
          .filter((s) => s.length > 0)
      : [];

    return json({ message, seats, note: genNote });
  }

  const messages = [
    { role: "system", content: buildSystemPrompt(body.corpus, lang) },
    ...(Array.isArray(body.history) ? body.history.slice(-8) : []),
    { role: "user", content: buildUserPrompt(body) },
  ];

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    return json({ error: "openai_error", status: openaiRes.status, detail: errText.slice(0, 300) }, 502);
  }

  const data = await openaiRes.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return json({ error: "empty_response" }, 502);

  let parsed: { patch?: unknown; summary?: unknown; note?: unknown };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json({ error: "invalid_model_json" }, 502);
  }

  const rawPatch = Array.isArray(parsed.patch) ? (parsed.patch as PatchOp[]) : [];

  // ── server-side enforcement of the hard rules ──────────────────────
  const lockedIds = new Set(body.blocks.filter((b) => b.type === "locked").map((b) => b.id));
  const knownIds = new Set(body.blocks.map((b) => b.id));
  const allowedTokens = new Set(body.corpus.placeholders.map((p) => p.token));

  const accepted: PatchOp[] = []; // applied immediately (non-locked)
  const pending: PatchOp[] = []; // touch a locked block → require user confirmation
  const dropped: string[] = [];

  for (const op of rawPatch) {
    if (!op || typeof op !== "object" || !("op" in op) || !("id" in op)) {
      dropped.push("malformed op");
      continue;
    }
    if (op.op !== "replace" && op.op !== "insert_after" && op.op !== "delete") {
      dropped.push(`unknown op "${(op as { op: string }).op}"`);
      continue;
    }
    if (!knownIds.has(op.id)) {
      dropped.push(`op on unknown block ${op.id}`);
      continue;
    }
    // The placeholder whitelist applies to any text the model emits — including
    // ops we will later route to "pending".
    if (op.op === "replace" || op.op === "insert_after") {
      if (typeof op.text !== "string") {
        dropped.push(`missing text on ${op.op}`);
        continue;
      }
      const unknown = extractPlaceholders(op.text).filter((t) => !allowedTokens.has(t));
      if (unknown.length) {
        dropped.push(`unknown placeholder(s) {{${unknown.join(", ")}}}`);
        continue;
      }
    }
    // A replace/delete that hits a LOCKED flight block is NOT applied silently.
    // It becomes "pending" so the client can show a confirmation gate (seats,
    // etc.). insert_after only ADDS a block after the locked one — it never
    // changes flight facts — so it stays auto-applied.
    if (lockedIds.has(op.id) && op.op !== "insert_after") {
      pending.push(op);
      continue;
    }
    accepted.push(op);
  }

  const note =
    typeof parsed.note === "string" && parsed.note.trim() ? parsed.note.trim() : "";
  const summary =
    typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary.trim() : "";

  return json({ patch: accepted, pending, summary, note, dropped });
});
