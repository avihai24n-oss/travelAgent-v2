// Client for the "Specials" composing agent (Supabase Edge Function
// `compose-message`). Mirrors nameTranslator.js: the OpenAI key stays inside
// the edge function; here we only build the grounding corpus, call the proxy,
// and apply the surgical patch it returns.
//
// GROUNDING: the agent must never invent a template. buildCorpus() feeds it
// Gad's own current templates (style source), the allowed placeholder tokens,
// and the exact emoji set already used in those templates. The edge function
// enforces the same limits server-side.

import {
  PLACEHOLDERS,
  CATEGORIES,
  loadTemplate,
  loadCustomCategories
} from "src/assets/defaultTemplates.js";

const EMOJI_RE = /\p{Extended_Pictographic}/gu;

// Collects every emoji actually present in Gad's current templates for `lang`,
// so the whitelist follows whatever he customised (not a hard-coded list).
function collectEmojis(templateTexts) {
  const set = new Set();
  for (const txt of templateTexts) {
    const found = String(txt || "").match(EMOJI_RE);
    if (found) found.forEach(e => set.add(e));
  }
  return [...set];
}

// Builds the grounding corpus sent with every request: placeholders the agent
// may use, the emoji whitelist, and Gad's existing templates as style examples.
export function buildCorpus(lang) {
  const categories = [
    ...CATEGORIES.map(c => c.key),
    ...loadCustomCategories().map(c => c.key)
  ];
  const seen = new Set();
  const templates = [];
  for (const cat of categories) {
    if (seen.has(cat)) continue;
    seen.add(cat);
    const text = loadTemplate(cat, lang);
    if (text && text.trim()) templates.push({ category: cat, text });
  }

  const placeholders = Object.keys(PLACEHOLDERS).map(token => ({
    token,
    label: (PLACEHOLDERS[token] && (PLACEHOLDERS[token][lang] || PLACEHOLDERS[token].en)) || token
  }));

  const emojis = collectEmojis(templates.map(t => t.text));

  return { placeholders, emojis, templates };
}

function proxyConfig() {
  const supabaseUrl = process.env.VUE_APP_SUPABASE_URL;
  const supabaseKey = process.env.VUE_APP_SUPABASE_ANON_KEY;
  return { supabaseUrl, supabaseKey };
}

export async function pingComposeApi() {
  const { supabaseUrl, supabaseKey } = proxyConfig();
  if (!supabaseUrl || !supabaseKey) return { ok: false, reason: "missing_proxy_config" };
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/compose-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ ping: true })
    });
    if (!res.ok) return { ok: false, reason: `status_${res.status}` };
    const data = await res.json();
    return { ok: data.ok === true, openaiConfigured: data.openaiConfigured === true };
  } catch (err) {
    return { ok: false, reason: "network_error" };
  }
}

/**
 * Sends Gad's free-text request + the current message blocks to the agent and
 * returns { patch, note, dropped }.
 *
 * @param {Object}   args
 * @param {string}   args.instruction   Gad's free-text request (his language).
 * @param {Array}    args.blocks        [{ id, type: "text"|"locked", text, label? }]
 * @param {string}   args.lang          "he" | "en" | "fr"
 * @param {string}  [args.flightSummary] Read-only human-readable flight facts.
 * @param {Array}   [args.history]      Prior chat turns [{ role, content }].
 */
export async function composeMessage({ instruction, blocks, lang, flightSummary, history }) {
  const { supabaseUrl, supabaseKey } = proxyConfig();
  if (!supabaseUrl || !supabaseKey) throw new Error("missing_proxy_config");

  const payload = {
    instruction,
    blocks,
    lang,
    flightSummary: flightSummary || "",
    corpus: buildCorpus(lang),
    history: Array.isArray(history) ? history.slice(-8) : []
  };

  const res = await fetch(`${supabaseUrl}/functions/v1/compose-message`, {
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
  return {
    patch: Array.isArray(data.patch) ? data.patch : [],
    note: typeof data.note === "string" ? data.note : "",
    dropped: Array.isArray(data.dropped) ? data.dropped : []
  };
}

/**
 * "Studio" mode — generates a full WhatsApp message from scratch from Gad's
 * brief, then splices the pre-rendered flight itinerary into it. Same URL/auth
 * pattern as composeMessage, but with `mode: "generate"` and no blocks.
 *
 * The edge function returns { message, note } where `message` carries exactly
 * one `{{FLIGHTS}}` token marking where the itinerary belongs; we substitute
 * the caller-provided `itineraryText` for that token (or fall back to inserting
 * it as its own paragraph if the model omitted the token).
 *
 * @param {Object}   args
 * @param {string}   args.brief          Gad's free-text brief (his language).
 * @param {string}   args.lang           "he" | "en" | "fr"
 * @param {string}  [args.flightSummary] Read-only human-readable flight facts.
 * @param {string}  [args.itineraryText] Pre-rendered itinerary to splice in.
 * @param {Array}   [args.history]       Prior chat turns [{ role, content }].
 * @returns {Promise<{ text: string, note: string }>}
 */
export async function generateMessage({ brief, lang, flightSummary, itineraryText, knownDetails, history }) {
  const { supabaseUrl, supabaseKey } = proxyConfig();
  if (!supabaseUrl || !supabaseKey) throw new Error("missing_proxy_config");

  const payload = {
    mode: "generate",
    instruction: brief,
    lang,
    flightSummary: flightSummary || "",
    knownDetails: knownDetails || null,
    corpus: buildCorpus(lang),
    history: Array.isArray(history) ? history.slice(-8) : []
  };

  const res = await fetch(`${supabaseUrl}/functions/v1/compose-message`, {
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
  const message = typeof data.message === "string" ? data.message : "";
  const note = typeof data.note === "string" ? data.note : "";
  const itinerary = String(itineraryText || "");

  // Substitute the single {{FLIGHTS}} token (tolerating inner spaces) with the
  // pre-rendered itinerary.
  const FLIGHTS_TOKEN_RE = /\{\{\s*FLIGHTS\s*\}\}/;
  let text;
  if (FLIGHTS_TOKEN_RE.test(message)) {
    text = message.replace(FLIGHTS_TOKEN_RE, itinerary);
  } else {
    // FALLBACK: no token — drop the itinerary in as its own paragraph after the
    // first blank-line-separated paragraph; if there's no blank line, append it
    // at the end with a blank line before it.
    const sep = message.indexOf("\n\n");
    if (sep !== -1) {
      text = message.slice(0, sep + 2) + itinerary + "\n\n" + message.slice(sep + 2);
    } else {
      text = message + "\n\n" + itinerary;
    }
  }

  return { text, note: note || "" };
}

// ── region engine ─────────────────────────────────────────────────────
// The "Specials" mode operates on the ALREADY-RENDERED WhatsApp message (a
// one-off message Gad then edits/sends), split into paragraph blocks. Flight
// itinerary paragraphs are locked so neither Gad's edits nor the agent can
// corrupt the Amadeus-derived facts.

// A paragraph is a flight itinerary block if it carries a 3-letter IATA code in
// parentheses — e.g. "(JFK)" — which appears only in rendered flight lines and
// nowhere else in Gad's templates (the airline line uses a 2-letter code).
const FLIGHT_PARAGRAPH_RE = /\([A-Z]{3}\)/;

export function isFlightParagraph(text) {
  return FLIGHT_PARAGRAPH_RE.test(String(text || ""));
}

// Splits a rendered message into blocks on blank lines, tagging flight
// paragraphs as "locked". Consecutive flight paragraphs are merged into one
// locked block so the itinerary stays visually intact.
export function splitIntoBlocks(renderedText) {
  const paras = String(renderedText || "").split(/\n{2,}/);
  const blocks = [];
  let idx = 0;
  for (const para of paras) {
    if (!para.trim() && !para.length) continue;
    const locked = isFlightParagraph(para);
    const prev = blocks[blocks.length - 1];
    if (locked && prev && prev.type === "locked") {
      prev.text += "\n\n" + para;
      continue;
    }
    idx += 1;
    blocks.push({
      id: `b${idx}`,
      type: locked ? "locked" : "text",
      text: para
    });
  }
  return blocks;
}

// Joins blocks back into a WhatsApp message. Empty text blocks are dropped so a
// "delete" that leaves an empty region doesn't produce a double blank line.
export function blocksToText(blocks) {
  return blocks
    .map(b => String(b.text || "").replace(/\s+$/, ""))
    .filter(t => t.length)
    .join("\n\n");
}

let insertCounter = 0;
function newBlockId() {
  insertCounter += 1;
  return `agent_${insertCounter}_${blockIdSalt()}`;
}
// Small non-time salt so ids stay unique within a session without Date.now().
function blockIdSalt() {
  return Math.floor((insertCounter + 1) * 2654435761 % 100000).toString(36);
}

/**
 * Applies the agent's patch to a blocks array and returns a NEW array.
 * Locked blocks are never modified (the server already drops such ops; this is
 * a second line of defence). Unknown ops are ignored.
 */
export function applyPatch(blocks, patch) {
  if (!Array.isArray(patch) || !patch.length) return blocks.slice();
  const lockedIds = new Set(blocks.filter(b => b.type === "locked").map(b => b.id));
  let result = blocks.slice();

  for (const op of patch) {
    if (!op) continue;
    // A locked block can be an insert_after anchor (adds a new block after it),
    // but never replaced or deleted.
    if (lockedIds.has(op.id) && op.op !== "insert_after") continue;
    const idx = result.findIndex(b => b.id === op.id);
    if (idx === -1) continue;

    if (op.op === "replace" && typeof op.text === "string") {
      result[idx] = { ...result[idx], text: op.text };
    } else if (op.op === "delete") {
      result.splice(idx, 1);
    } else if (op.op === "insert_after" && typeof op.text === "string") {
      result.splice(idx + 1, 0, { id: newBlockId(), type: "text", text: op.text });
    }
  }
  return result;
}
