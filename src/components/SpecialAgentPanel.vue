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

        <!-- Agent compose bar -->
        <form class="agent-bar" :dir="dir" @submit.prevent="send">
          <input
            v-model="input"
            class="agent-input"
            :placeholder="placeholder"
            :disabled="loading || !apiOk"
            :dir="dir"
          />
          <button
            type="submit"
            class="agent-send"
            :disabled="loading || !apiOk || !input.trim()"
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
      hasDraft: false
    };
  },
  computed: {
    messageText() {
      return blocksToText(this.blocks);
    },
    renderedHtml() {
      return this.renderWhatsApp(this.messageText);
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
      }
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
      if (!instruction || this.loading) return;
      this.input = "";
      this.log.push({ kind: "user", text: instruction });
      this.loading = true;
      this.scrollDown();

      // Studio brief: the first message generates the full message from scratch.
      if (this.mode === "studio" && !this.hasDraft) {
        try {
          const { text, note } = await generateMessage({
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
        const { patch, note, dropped } = await composeMessage({
          instruction,
          blocks: this.blocks,
          lang: this.lang,
          flightSummary: this.flightSummary,
          history
        });
        this.blocks = applyPatch(this.blocks, patch);
        const applied = patch.length;
        const rejected = dropped && dropped.length ? dropped.length : 0;
        // Only report the model's success note when something actually changed —
        // otherwise a rejected op (e.g. it tried to edit the locked flight block)
        // would show a misleading "done" message.
        if (applied > 0) {
          if (note) this.log.push({ kind: "agent", text: note });
          if (rejected) {
            this.log.push({
              kind: "warn",
              text: this.dir === "rtl"
                ? "חלק מהשינויים דולגו כי נגעו בבלוק הטיסות הנעול."
                : "Some edits were skipped — they touched the locked flight block."
            });
          }
        } else if (rejected) {
          this.log.push({
            kind: "warn",
            text: this.dir === "rtl"
              ? "לא הצלחתי לבצע את זה — הבקשה נגעה בבלוק הטיסות הנעול. נסה לבקש להוסיף את המידע כשורה נפרדת."
              : "Couldn't apply that — it touched the locked flight block. Try adding the info as a separate line."
          });
        } else {
          this.log.push({
            kind: "agent",
            text: this.dir === "rtl" ? "לא בוצע שינוי." : "No change made."
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
    renderWhatsApp(src) {
      let s = String(src)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      s = s.replace(/```([\s\S]+?)```/g, "<code>$1</code>");
      s = s.replace(/(^|[^*\w])\*([^*\n]+?)\*(?![*\w])/g, "$1<b>$2</b>");
      s = s.replace(/(^|[^_\w])_([^_\n]+?)_(?![_\w])/g, "$1<i>$2</i>");
      s = s.replace(/(^|[^~\w])~([^~\n]+?)~(?![~\w])/g, "$1<s>$2</s>");
      return s;
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
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px 10px;
  background: #f0f2f5;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
.agent-input {
  flex: 1; height: 40px; border: 0; border-radius: 20px;
  padding: 0 16px; font-size: 14px; outline: 0;
  background: #fff; color: #111b21; font-family: inherit;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.06);
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
</style>
