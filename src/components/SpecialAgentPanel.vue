<template>
  <div class="iphone-outer">
    <div class="iphone-frame">
      <div class="iphone-island"></div>
      <div class="iphone-screen">
        <!-- WhatsApp header -->
        <div class="wa-header">
          <span class="wa-back" aria-hidden="true" @click="$emit('close')">‹</span>
          <div class="wa-avatar">{{ avatarLetter }}</div>
          <div class="wa-contact">
            <div class="wa-name">{{ contactName }}</div>
            <div class="wa-presence">
              <span class="agent-dot" :class="{ off: !apiOk }"></span>
              {{ presenceLabel }}
            </div>
          </div>
          <button type="button" class="wa-close-btn" @click="$emit('close')">
            {{ dir === 'rtl' ? 'סגור' : 'Close' }}
          </button>
        </div>

        <div class="wa-lock-hint" :dir="dir">
          🔒 {{ dir === 'rtl' ? 'פרטי הטיסה מהאמדאוס נעולים ולא ישתנו' : 'Amadeus flight details are locked' }}
        </div>

        <!-- Chat: the live quote bubble + agent change-notes -->
        <div ref="chat" class="wa-chat" :dir="dir">
          <div class="wa-bubble wa-sent" :class="{ rtl: dir === 'rtl' }">
            <div class="wa-bubble-text" v-html="renderedHtml"></div>
            <div class="wa-bubble-meta">
              <span class="wa-bubble-time">{{ clockTime }}</span>
              <span class="wa-bubble-tick" aria-hidden="true">✓✓</span>
            </div>
          </div>

          <div
            v-for="(m, i) in log"
            :key="i"
            class="agent-note"
            :class="m.kind"
            :dir="dir"
          >
            <span v-if="m.kind === 'user'" class="agent-note-you">{{ dir === 'rtl' ? 'ביקשת:' : 'You:' }} </span>
            {{ m.text }}
          </div>

          <div v-if="loading" class="agent-typing" :dir="dir">
            <span></span><span></span><span></span>
          </div>
        </div>

        <!-- Confirmation gate: appears only when a change touches locked flight
             content (seats, etc.). Nothing locked changes without ✅ here. -->
        <div v-if="pendingOps.length" class="agent-confirm" :dir="dir">
          <div class="agent-confirm-head">
            🔒 {{ dir === 'rtl' ? 'שינוי בפרטי טיסה נעולים' : 'Change to locked flight details' }}
          </div>
          <div class="agent-confirm-body">{{ pendingSummary }}</div>
          <div class="agent-confirm-actions">
            <button type="button" class="ac-btn ac-reject" @click="rejectPending">
              ✖️ {{ dir === 'rtl' ? 'דחה' : 'Dismiss' }}
            </button>
            <button type="button" class="ac-btn ac-approve" @click="confirmPending">
              ✅ {{ dir === 'rtl' ? 'אשר שינוי' : 'Approve' }}
            </button>
          </div>
        </div>

        <!-- Agent compose bar -->
        <form class="agent-bar" :dir="dir" @submit.prevent="send">
          <textarea
            ref="input"
            v-model="input"
            class="agent-input"
            :placeholder="pendingOps.length ? (dir === 'rtl' ? 'אשר או דחה את השינוי למעלה…' : 'Approve or dismiss the change above…') : placeholder"
            :disabled="loading || !apiOk || pendingOps.length > 0"
            :dir="dir"
            rows="1"
            @keydown.enter.exact.prevent="send"
            @input="autoGrow"
          ></textarea>
          <button
            type="submit"
            class="agent-send"
            :disabled="loading || !apiOk || !input.trim() || pendingOps.length > 0"
            :aria-label="dir === 'rtl' ? 'שלח' : 'Send'"
          >➤</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import {
  splitIntoBlocks,
  blocksToText,
  applyPatch,
  composeMessage,
  generateMessage,
  pingComposeApi
} from "src/assets/agentCompose.js";

// Did Gad's message ask about seats at all? Only used as a fallback signal for
// the honest-outcome warning: if the model returned no seats we still want to
// speak up when the request was clearly about seating. Multilingual on purpose —
// Gad writes his requests in whatever language he feels like.
const SEAT_INTENT_RE = /מושב|הושב|כיסא|\bseats?\b|\bseating\b|\bsi[eè]ges?\b|\bplaces?\b/i;

// ── "what just changed" highlight ─────────────────────────────────────
// After an agent edit the changed text is marker-highlighted for a moment so Gad
// can see what moved without re-reading the whole quote. Deliberately NOT used
// for Studio's first message: there, virtually everything is new.
const HIGHLIGHT_MS = 5000;

// Sentinels stand in for the <mark> tags while the WhatsApp formatting passes
// run, so those regexes never have to cope with markup. Replaced with real tags
// last. Both are control chars that cannot occur in a quote.
const MARK_OPEN = "\u0001";
const MARK_CLOSE = "\u0002";

// True if the slice would split a *bold* / _italic_ / ~strike~ run — inserting a
// sentinel there would produce crossing tags, so callers widen to the full line.
function splitsFormatting(slice) {
  return ["*", "_", "~"].some(ch => slice.split(ch).length % 2 === 0);
}

// Given one line before and after, returns [start, end] over just the part that
// differs — so "💺 מושבים: XX" → "💺 מושבים: B1, B2" marks only the seat numbers
// rather than the whole line. Falls back to the whole line when the change is a
// pure deletion (nothing new left to point at).
function changedRange(oldLine, newLine) {
  const max = Math.min(oldLine.length, newLine.length);
  let start = 0;
  while (start < max && oldLine[start] === newLine[start]) start += 1;
  let back = 0;
  while (
    back < max - start &&
    oldLine[oldLine.length - 1 - back] === newLine[newLine.length - 1 - back]
  ) {
    back += 1;
  }
  const end = newLine.length - back;
  return end <= start ? [0, newLine.length] : [start, end];
}

// Widens a range out to whitespace boundaries so the marker covers whole words:
// "850$" → "920$" differs only in "92", but highlighting "920$" reads far better.
function snapToWords(line, start, end) {
  let s = start;
  while (s > 0 && !/\s/.test(line[s - 1])) s -= 1;
  let e = end;
  while (e < line.length && !/\s/.test(line[e])) e += 1;
  return [s, e];
}

/**
 * Line-level diff of the message text: which lines of `after` are new or edited,
 * and which slice of each actually changed.
 *
 * Common head and tail lines are trimmed first, so inserting a block marks only
 * that block instead of everything below it.
 *
 * @returns {Object} map of line index in `after` → [start, end] char range
 */
function diffMarks(before, after) {
  const a = String(before || "").split("\n");
  const b = String(after || "").split("\n");
  let head = 0;
  while (head < a.length && head < b.length && a[head] === b[head]) head += 1;
  let tail = 0;
  while (
    tail < a.length - head &&
    tail < b.length - head &&
    a[a.length - 1 - tail] === b[b.length - 1 - tail]
  ) {
    tail += 1;
  }
  // Equal-sized changed regions line up 1:1 (a replace editing lines in place),
  // so each new line has a counterpart to narrow against. Otherwise lines were
  // added or removed and there is no reliable pairing — mark them whole.
  const aligned = a.length - tail - head === b.length - tail - head;
  const marks = {};
  for (let i = head; i < b.length - tail; i += 1) {
    const line = b[i];
    if (!line.length) continue;
    const counterpart = aligned ? a[i] : null;
    if (typeof counterpart === "string") {
      // Untouched lines sit inside the changed span too (edit one seat line per
      // flight and every header between them lands in range) — leave them alone.
      if (counterpart === line) continue;
      const [start, end] = changedRange(counterpart, line);
      marks[i] = snapToWords(line, start, end);
    } else {
      marks[i] = [0, line.length];
    }
  }
  return marks;
}

export default {
  name: "SpecialAgentPanel",
  props: {
    // Rendered one-off message to seed the editable blocks from.
    sourceText: { type: String, default: "" },
    dir: { type: String, default: "ltr" },
    lang: { type: String, default: "he" },
    flightSummary: { type: String, default: "" },
    contactName: { type: String, default: "Gad Elnekave" },
    // "edit" seeds the editable blocks from sourceText;
    // "studio" starts from the locked itinerary and generates the message from a brief.
    mode: { type: String, default: "edit" },
    itineraryText: { type: String, default: "" },
    // Studio only: concrete details entered so far (customer name, travelers,
    // destination) so the agent writes them in as real text, not placeholders.
    knownDetails: { type: Object, default: null }
  },
  data() {
    return {
      blocks: [],
      log: [],
      input: "",
      loading: false,
      apiOk: true,
      hasDraft: false,
      // Ops that touch the locked flight block, waiting for the user's
      // explicit confirmation (seats, etc.), plus a human summary of them.
      pendingOps: [],
      pendingSummary: "",
      // True once an agent patch has actually altered the message text. The
      // parent uses it (via update:edited) to warn before a template rebuild
      // wipes this work — in edit mode the sourceText watcher below re-splits
      // the blocks, so an unguarded rebuild would silently discard it.
      aiEdited: false,
      // Marker highlight of the last agent change: { text, marks }. `text` is the
      // message the ranges were computed against, so the highlight drops itself
      // if the message changes for any other reason instead of glowing on the
      // wrong line. Cleared after HIGHLIGHT_MS.
      highlight: null,
      highlightTimer: null
    };
  },
  computed: {
    messageText() {
      return blocksToText(this.blocks);
    },
    renderedHtml() {
      const text = this.messageText;
      // Only honour a highlight computed against exactly this text.
      const marks =
        this.highlight && this.highlight.text === text ? this.highlight.marks : null;
      return this.renderWhatsApp(text, marks);
    },
    avatarLetter() {
      const n = (this.contactName || "G").trim();
      return n ? n.charAt(0).toUpperCase() : "G";
    },
    clockTime() {
      const d = new Date();
      const pad = n => String(n).padStart(2, "0");
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },
    presenceLabel() {
      if (!this.apiOk) return this.dir === "rtl" ? "הסוכן לא זמין" : "agent offline";
      return this.dir === "rtl" ? "סוכן מיוחדות" : "Specials agent";
    },
    placeholder() {
      if (!this.apiOk) return this.dir === "rtl" ? "הסוכן אינו מוגדר" : "agent not configured";
      if (this.mode === "studio" && !this.hasDraft) {
        return this.dir === "rtl"
          ? "תאר את ההצעה שתרצה…"
          : "Describe the offer you want…";
      }
      return this.dir === "rtl"
        ? "בקש לערוך… (למשל: הזמנת חילוץ, חברת הביטוח משלמת)"
        : "Ask to edit…";
    }
  },
  watch: {
    sourceText: {
      immediate: true,
      handler(val) {
        // Edit mode seeds its blocks from sourceText. Studio mode seeds ONCE in
        // mounted() and must NEVER re-seed here: the parent binds :source-text
        // two-way to whatsappMessage, so every message update would otherwise
        // fire this watcher, wipe the generated draft, reset hasDraft, and
        // re-push the intro note (the "no response" + "repeated messages" bug).
        if (this.mode === "studio") return;
        this.blocks = splitIntoBlocks(val || "");
        // Freshly seeded from the parent's message — nothing of the agent's own
        // work is riding on these blocks any more, and any "what just changed"
        // highlight belongs to text that no longer exists.
        this.aiEdited = false;
        this.clearHighlight();
      }
    },
    aiEdited(val) {
      this.$emit("update:edited", val);
    },
    messageText(val) {
      // Bubble the current message up so the parent can send it to WhatsApp.
      this.$emit("update:text", val);
    }
  },
  async mounted() {
    // Guarantee studio seeding even when sourceText is empty (watcher may see no change).
    if (this.mode === "studio" && !this.hasDraft && !this.blocks.length) {
      this.seedStudio();
    }
    this.$emit("update:text", this.messageText);
    const res = await pingComposeApi();
    this.apiOk = res.ok && res.openaiConfigured;
  },
  beforeDestroy() {
    // Don't leave the highlight timer firing into a torn-down component.
    this.clearHighlight();
  },
  methods: {
    seedStudio() {
      // Studio starts with ONLY the locked itinerary; the first message is a brief.
      this.blocks = [{ id: "b1", type: "locked", text: this.itineraryText }];
      this.hasDraft = false;
      this.log.push({
        kind: "agent",
        text:
          this.dir === "rtl"
            ? "כתוב לי מה תרצה בהצעה — הסיטואציה, התנאים, מי משלם — ואבנה אותה בסגנון שלך."
            : "Tell me what you want in the offer — the situation, the terms, who pays — and I'll build it in your style."
      });
    },
    async send() {
      const instruction = this.input.trim();
      // A pending confirmation must be resolved (approve/dismiss) before sending.
      if (!instruction || this.loading || this.pendingOps.length) return;
      this.input = "";
      this.$nextTick(this.autoGrow); // shrink the textarea back to one row
      this.log.push({ kind: "user", text: instruction });
      this.loading = true;
      this.scrollDown();

      // Studio brief: the first message generates the full message from scratch.
      if (this.mode === "studio" && !this.hasDraft) {
        try {
          const {
            text,
            note,
            seatsRequested,
            seatsFilled,
            seatLines
          } = await generateMessage({
            brief: instruction,
            lang: this.lang,
            flightSummary: this.flightSummary,
            itineraryText: this.itineraryText,
            knownDetails: this.knownDetails,
            history: this.buildHistory()
          });
          this.blocks = splitIntoBlocks(text);
          this.hasDraft = true;
          if (note) this.log.push({ kind: "agent", text: note });
          // Never let a confident note stand over an itinerary that still says
          // "XX" — that was the bug where a seat request looked like it worked.
          this.reportSeatOutcome({ instruction, seatsRequested, seatsFilled, seatLines });
        } catch (e) {
          this.apiOk = String(e && e.message).indexOf("missing_proxy_config") === -1 ? this.apiOk : false;
          this.log.push({
            kind: "error",
            text: this.dir === "rtl" ? "שגיאה בפנייה לסוכן. נסה שוב." : "Agent request failed. Try again."
          });
        } finally {
          this.loading = false;
          this.scrollDown();
        }
        return;
      }

      try {
        const history = this.buildHistory();
        const { patch, pending, summary, note } = await composeMessage({
          instruction,
          blocks: this.blocks,
          lang: this.lang,
          flightSummary: this.flightSummary,
          history
        });

        // Apply the non-locked ops immediately, and measure whether the message
        // TEXT actually changed — the honest signal of success (a "replace" with
        // identical text, or a fully-rejected patch, changes nothing).
        const beforeText = blocksToText(this.blocks);
        this.blocks = applyPatch(this.blocks, patch);
        const changed = blocksToText(this.blocks) !== beforeText;
        if (changed) {
          this.aiEdited = true;
          this.setHighlight(beforeText);
        }
        if (changed && note) this.log.push({ kind: "agent", text: note });

        // Ops that touch the locked flight block don't apply on their own — stage
        // them behind the confirmation gate (seats, etc.).
        if (Array.isArray(pending) && pending.length) {
          this.pendingOps = pending;
          this.pendingSummary =
            (summary && summary.trim()) ||
            (this.dir === "rtl"
              ? "שינוי בפרטי הטיסה הנעולים."
              : "A change to the locked flight details.");
          return; // finally{} clears loading & scrolls
        }

        // Nothing pending: if nothing actually changed, say so plainly so Gad
        // never mistakes a silent no-op for success.
        if (!changed) {
          this.log.push({
            kind: "warn",
            text: this.dir === "rtl"
              ? "לא הצלחתי לבצע את זה 🙁 נסה לנסח אחרת, או לערוך ידנית בתצוגה."
              : "I couldn't do that 🙁 Try rephrasing, or edit it manually in the preview."
          });
        }
      } catch (e) {
        this.apiOk = String(e && e.message).indexOf("missing_proxy_config") === -1 ? this.apiOk : false;
        this.log.push({
          kind: "error",
          text: this.dir === "rtl" ? "שגיאה בפנייה לסוכן. נסה שוב." : "Agent request failed. Try again."
        });
      } finally {
        this.loading = false;
        this.scrollDown();
      }
    },
    buildHistory() {
      // Compact prior turns so multi-step edits keep context.
      return this.log
        .filter(m => m.kind === "user" || m.kind === "agent")
        .map(m => ({ role: m.kind === "user" ? "user" : "assistant", content: m.text }));
    },
    scrollDown() {
      this.$nextTick(() => {
        const el = this.$refs.chat;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    // Grow the compose textarea with its content (Shift+Enter adds lines),
    // capped so it never eats the chat. Resets to one row when emptied.
    autoGrow() {
      const el = this.$refs.input;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 96) + "px";
    },
    // Studio's first message can only fill seats through the "seats" field the
    // model returns — the itinerary is spliced in afterwards, so the model
    // cannot reach it. When that fails (no seats returned, or fewer than the
    // itinerary has segments) the seat lines still read "XX", and Gad has to
    // hear it: an unnoticed "XX" goes out to the customer.
    reportSeatOutcome({ instruction, seatsRequested, seatsFilled, seatLines }) {
      const rtl = this.dir === "rtl";
      const asked = seatsRequested || SEAT_INTENT_RE.test(String(instruction || ""));
      if (!asked) return;

      if (!seatsFilled) {
        this.log.push({
          kind: "warn",
          text: rtl
            ? "לא הצלחתי להכניס את המושבים למסלול — הוא עדיין מציג XX. בקש מהמושבים שוב עכשיו, בהודעה נפרדת, ואעדכן אותם."
            : "I couldn't put the seats into the itinerary — it still shows XX. Ask for the seats again now, as a separate message, and I'll set them."
        });
        return;
      }
      if (seatsFilled < seatLines) {
        const left = seatLines - seatsFilled;
        this.log.push({
          kind: "warn",
          text: rtl
            ? `מילאתי מושבים ב-${seatsFilled} מתוך ${seatLines} הטיסות. ב-${left} עוד מופיע XX — תגיד לי אילו מושבים שם.`
            : `I filled seats on ${seatsFilled} of ${seatLines} flights. ${left} still shows XX — tell me which seats go there.`
        });
      }
    },
    // ── confirmation gate for locked (flight) changes ──────────────────
    confirmPending() {
      if (!this.pendingOps.length) return;
      const beforeText = blocksToText(this.blocks);
      // allowLocked: these ops were explicitly approved, so they may land on the
      // locked flight block (e.g. update the seat line).
      this.blocks = applyPatch(this.blocks, this.pendingOps, { allowLocked: true });
      const changed = blocksToText(this.blocks) !== beforeText;
      if (changed) {
        this.aiEdited = true;
        this.setHighlight(beforeText);
      }
      this.log.push({
        kind: changed ? "agent" : "warn",
        text: changed
          ? this.dir === "rtl" ? "✅ עודכן." : "✅ Updated."
          : this.dir === "rtl" ? "לא הצלחתי לבצע את זה 🙁" : "I couldn't do that 🙁"
      });
      this.clearPending();
      this.scrollDown();
    },
    rejectPending() {
      this.log.push({
        kind: "warn",
        text: this.dir === "rtl" ? "השינוי בוטל." : "Change dismissed."
      });
      this.clearPending();
      this.scrollDown();
    },
    clearPending() {
      this.pendingOps = [];
      this.pendingSummary = "";
    },
    // `marks` (optional) maps line index → [start, end] to marker-highlight.
    // Sentinels go in on the raw text and only become <mark> tags at the very
    // end, so the WhatsApp formatting regexes below never meet HTML.
    renderWhatsApp(src, marks) {
      let s = String(src);

      if (marks) {
        s = s
          .split("\n")
          .map((line, i) => {
            const range = marks[i];
            if (!range) return line;
            let [start, end] = range;
            // Never let a sentinel land inside a formatting run — that would
            // emit tags that cross each other. Mark the whole line instead.
            if (splitsFormatting(line.slice(start, end))) {
              start = 0;
              end = line.length;
            }
            return (
              line.slice(0, start) +
              MARK_OPEN +
              line.slice(start, end) +
              MARK_CLOSE +
              line.slice(end)
            );
          })
          .join("\n");
      }

      s = s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      s = s.replace(/```([\s\S]+?)```/g, "<code>$1</code>");
      s = s.replace(/(^|[^*\w])\*([^*\n]+?)\*(?![*\w])/g, "$1<b>$2</b>");
      s = s.replace(/(^|[^_\w])_([^_\n]+?)_(?![_\w])/g, "$1<i>$2</i>");
      s = s.replace(/(^|[^~\w])~([^~\n]+?)~(?![~\w])/g, "$1<s>$2</s>");

      if (marks) {
        s = s
          .split(MARK_OPEN)
          .join('<mark class="wa-new">')
          .split(MARK_CLOSE)
          .join("</mark>");
      }
      return s;
    },
    // ── change highlight ───────────────────────────────────────────────
    // Marker-highlights whatever the just-applied patch changed, for
    // HIGHLIGHT_MS. A newer change replaces an older one (and restarts the
    // clock) so the yellow always means "this is what just happened".
    setHighlight(beforeText) {
      const marks = diffMarks(beforeText, this.messageText);
      if (!Object.keys(marks).length) return;
      this.highlight = { text: this.messageText, marks };
      if (this.highlightTimer) clearTimeout(this.highlightTimer);
      this.highlightTimer = setTimeout(() => {
        this.highlight = null;
        this.highlightTimer = null;
      }, HIGHLIGHT_MS);
      this.$nextTick(this.scrollToHighlight);
    },
    clearHighlight() {
      if (this.highlightTimer) {
        clearTimeout(this.highlightTimer);
        this.highlightTimer = null;
      }
      this.highlight = null;
    },
    // Brings the first highlighted line into view — a change further up a long
    // quote is otherwise missed entirely. Scrolls the chat pane by hand rather
    // than via scrollIntoView, which would also scroll the page.
    scrollToHighlight() {
      const chat = this.$refs.chat;
      if (!chat) return;
      const el = chat.querySelector("mark.wa-new");
      if (!el) return;
      const target = el.getBoundingClientRect();
      const pane = chat.getBoundingClientRect();
      const delta = target.top - pane.top - chat.clientHeight / 2 + target.height / 2;
      chat.scrollTop = Math.max(0, chat.scrollTop + delta);
    }
  }
};
</script>

<style lang="scss" scoped>
/* Reuses the iPhone/WhatsApp look from WhatsAppPhonePreview, adds the agent bar. */
.iphone-outer {
  display: flex;
  justify-content: center;
  padding: 16px 8px;
  width: 100%;
  box-sizing: border-box;
}

.iphone-frame {
  position: relative;
  width: 393px;
  height: 852px;
  background: #1a1a1c;
  border-radius: 55px;
  padding: 11px;
  box-sizing: content-box;
  box-shadow:
    0 0 0 2px #2b2b2e inset,
    0 0 0 1px #050506,
    0 20px 40px rgba(0, 0, 0, 0.28),
    0 6px 12px rgba(0, 0, 0, 0.18);
  flex-shrink: 0;
}

.iphone-island {
  position: absolute;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  width: 126px;
  height: 37px;
  background: #000;
  border-radius: 20px;
  z-index: 20;
}

.iphone-screen {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 44px;
  background: #efeae2;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.wa-header {
  background: #008069;
  color: #fff;
  padding: 8px 14px;
  padding-top: 34px;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 54px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.wa-back { font-size: 28px; line-height: 1; width: 16px; font-weight: 300; cursor: pointer; }
.wa-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: #dfe5e7; color: #008069;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 18px; flex-shrink: 0;
}
.wa-contact { flex: 1; min-width: 0; }
.wa-name { font-weight: 600; font-size: 16px; line-height: 1.2; }
.wa-presence { font-size: 12px; opacity: 0.9; margin-top: 2px; display: flex; align-items: center; gap: 5px; }

.agent-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #7ee787; display: inline-block;
  box-shadow: 0 0 4px rgba(126, 231, 135, 0.8);
}
.agent-dot.off { background: #ff8a80; box-shadow: none; }

.wa-close-btn {
  height: 30px; padding: 0 12px; border-radius: 15px; border: 0;
  background: rgba(255, 255, 255, 0.18); color: #fff;
  font-size: 13px; font-weight: 600; cursor: pointer; flex-shrink: 0;
  font-family: inherit;
}
.wa-close-btn:hover { background: rgba(255, 255, 255, 0.28); }

.wa-lock-hint {
  background: #fff8e1; color: #7a5800;
  border-bottom: 1px solid #fdd835;
  padding: 6px 14px; font-size: 12px; font-weight: 500; text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.wa-chat {
  flex: 1;
  background-color: #efeae2;
  background-image:
    radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    radial-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px);
  background-size: 22px 22px, 34px 34px;
  background-position: 0 0, 11px 11px;
  padding: 14px 10px;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.wa-bubble {
  max-width: 85%; min-width: 70px;
  background: #d9fdd3; border-radius: 8px;
  padding: 6px 9px 7px; margin-bottom: 10px;
  position: relative; box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
  color: #111b21; font-size: 14.2px; line-height: 1.38;
  margin-left: auto; margin-right: 4px;
}
.wa-bubble.rtl { margin-left: 4px; margin-right: auto; }
.wa-bubble::after {
  content: ""; position: absolute; top: 0; right: -7px;
  width: 0; height: 0;
  border-top: 8px solid #d9fdd3; border-right: 8px solid transparent;
}
.wa-bubble.rtl::after {
  right: auto; left: -7px; border-right: none;
  border-left: 8px solid transparent; border-top: 8px solid #d9fdd3;
}
.wa-bubble-text { white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; }
.wa-bubble-text ::v-deep b { font-weight: 700; }
.wa-bubble-text ::v-deep i { font-style: italic; }
.wa-bubble-text ::v-deep s { text-decoration: line-through; }

/*
  Marker highlight on whatever the last agent edit changed. Injected via v-html,
  so it needs ::v-deep like the tags above. The colour lives in a custom property
  so the keyframes work for both themes, and box-decoration-break keeps the
  marker looking continuous when a run wraps across lines.
*/
.wa-bubble-text ::v-deep mark.wa-new {
  --wa-new-bg: #ffe680;
  background-color: var(--wa-new-bg);
  color: inherit;
  border-radius: 3px;
  padding: 0 2px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  animation: waNewFade 5s ease-out forwards;
}
/* Holds the colour, then releases it over the last ~0.9s so it doesn't just
   blink out. Must match HIGHLIGHT_MS in the script. */
@keyframes waNewFade {
  0%, 82% { background-color: var(--wa-new-bg); }
  100% { background-color: transparent; }
}
body.body--dark .wa-bubble-text ::v-deep mark.wa-new {
  --wa-new-bg: #7d6413;
  color: #fff6d5;
}

.wa-bubble-meta {
  display: inline-flex; gap: 3px; align-items: center; float: right;
  margin: 2px 0 -2px 6px; color: #667781; font-size: 11px; line-height: 1;
}
.wa-bubble.rtl .wa-bubble-meta { float: left; margin: 2px 6px -2px 0; }
.wa-bubble-tick { color: #53bdeb; font-size: 13px; }

/* Agent change-notes (system-style, centered) */
.agent-note {
  max-width: 90%; margin: 0 auto 8px;
  background: #ffffff; color: #3b4a54;
  border-radius: 7px; padding: 5px 10px;
  font-size: 12.5px; line-height: 1.35; text-align: center;
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.1);
}
.agent-note.user {
  background: rgba(0, 128, 105, 0.10); color: #075e54; font-weight: 500;
}
.agent-note.warn { background: #fff3cd; color: #7a5800; }
.agent-note.error { background: #fdecea; color: #b71c1c; }
.agent-note-you { font-weight: 700; }

.agent-typing {
  display: flex; gap: 4px; padding: 6px 12px; margin: 0 auto 8px;
  background: #fff; border-radius: 12px; width: fit-content;
}
.agent-typing span {
  width: 7px; height: 7px; border-radius: 50%; background: #9aa6ac;
  animation: agentBlink 1.2s infinite ease-in-out both;
}
.agent-typing span:nth-child(2) { animation-delay: 0.2s; }
.agent-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes agentBlink {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

/* Agent compose bar */
.agent-bar {
  display: flex; align-items: flex-end; gap: 8px;
  padding: 8px 10px 10px;
  background: #f0f2f5;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
.agent-input {
  flex: 1; box-sizing: border-box;
  min-height: 40px; max-height: 96px;
  border: 0; border-radius: 20px;
  padding: 9px 16px; font-size: 14px; line-height: 1.35; outline: 0;
  background: #fff; color: #111b21; font-family: inherit;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.06);
  resize: none; overflow-y: auto;
}
.agent-input:disabled { opacity: 0.6; }
.agent-send {
  width: 40px; height: 40px; border-radius: 50%; border: 0;
  background: #008069; color: #fff; font-size: 17px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background 0.15s, transform 0.1s;
}
[dir="rtl"] .agent-send { transform: scaleX(-1); }
.agent-send:hover:not(:disabled) { background: #00a884; }
.agent-send:active:not(:disabled) { transform: scale(0.92); }
[dir="rtl"] .agent-send:active:not(:disabled) { transform: scaleX(-1) scale(0.92); }
.agent-send:disabled { opacity: 0.5; cursor: default; }

/* Confirmation gate for locked flight changes (seats, etc.) */
.agent-confirm {
  margin: 0 8px 6px;
  background: #fff8e1;
  border: 1px solid #fdd835;
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  animation: acRise 0.18s ease-out;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
@keyframes acRise {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.agent-confirm-head {
  font-size: 12.5px; font-weight: 700; color: #7a5800; margin-bottom: 4px;
}
.agent-confirm-body {
  font-size: 13.5px; line-height: 1.4; color: #4a3b00;
  white-space: pre-wrap; word-break: break-word;
}
.agent-confirm-actions {
  display: flex; gap: 8px; margin-top: 10px;
}
.ac-btn {
  flex: 1; height: 38px; border: 0; border-radius: 19px;
  font-size: 13.5px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: filter 0.15s, transform 0.1s;
}
.ac-btn:active { transform: scale(0.97); }
.ac-approve { background: #00a884; color: #fff; }
.ac-approve:hover { filter: brightness(1.06); }
.ac-reject { background: #fff; color: #b23c3c; box-shadow: inset 0 0 0 1px #e6c9c9; }
.ac-reject:hover { background: #fdf3f3; }

@media (max-width: 440px) {
  .iphone-outer { padding: 8px 0; }
  .iphone-frame {
    width: 100%; max-width: 393px; height: auto;
    aspect-ratio: 393 / 852; border-radius: 13vw; padding: 2.5vw;
  }
  .iphone-screen { border-radius: calc(13vw - 2.5vw); }
  .iphone-island { top: 4.5vw; width: 32vw; height: 9vw; border-radius: 6vw; }
}

/* Dark mode */
body.body--dark .iphone-frame { background: #0b0b0d; }
body.body--dark .iphone-screen { background: #0b141a; }
body.body--dark .wa-chat {
  background-color: #0b141a;
  background-image:
    radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px);
}
body.body--dark .wa-header { background: #202c33; color: #e9edef; }
body.body--dark .wa-avatar { background: #6b7c85; color: #0b141a; }
body.body--dark .wa-bubble { background: #005c4b; color: #e9edef; box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.5); }
body.body--dark .wa-bubble::after { border-top-color: #005c4b; }
body.body--dark .wa-bubble-meta { color: #aebac1; }
body.body--dark .wa-lock-hint { background: #3a2f10; color: #fde68a; border-bottom-color: #92641b; }
body.body--dark .agent-note { background: #202c33; color: #cfd6db; }
body.body--dark .agent-note.user { background: rgba(0, 168, 132, 0.18); color: #a7f3d0; }
body.body--dark .agent-note.warn { background: #3a2f10; color: #fde68a; }
body.body--dark .agent-note.error { background: #4a1c1c; color: #ffb4ab; }
body.body--dark .agent-bar { background: #1e2a30; border-top-color: rgba(255, 255, 255, 0.06); }
body.body--dark .agent-input { background: #2a3942; color: #e9edef; }
body.body--dark .agent-confirm { background: #3a2f10; border-color: #92641b; box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.4); }
body.body--dark .agent-confirm-head { color: #fde68a; }
body.body--dark .agent-confirm-body { color: #f0e2b8; }
body.body--dark .ac-reject { background: #2a3942; color: #ffb4ab; box-shadow: inset 0 0 0 1px #5a3a3a; }
body.body--dark .ac-reject:hover { background: #33272a; }
</style>
