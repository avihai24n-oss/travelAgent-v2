<template>
  <div class="template-editor" :dir="dir">
    <div class="toolbar">
      <button
        type="button"
        class="undo-btn"
        :disabled="!canUndo"
        :title="dir === 'rtl' ? 'בטל (Ctrl+Z)' : 'Undo (Ctrl+Z)'"
        :aria-label="dir === 'rtl' ? 'בטל' : 'Undo'"
        @click="undo"
      >
        <span aria-hidden="true">↶</span>
        <span class="undo-label">{{ dir === 'rtl' ? 'בטל' : 'Undo' }}</span>
      </button>
      <button
        type="button"
        class="undo-btn"
        :disabled="!canRedo"
        :title="dir === 'rtl' ? 'בצע שוב (Ctrl+Shift+Z)' : 'Redo (Ctrl+Shift+Z)'"
        :aria-label="dir === 'rtl' ? 'בצע שוב' : 'Redo'"
        @click="redo"
      >
        <span aria-hidden="true">↷</span>
        <span class="undo-label">{{ dir === 'rtl' ? 'בצע שוב' : 'Redo' }}</span>
      </button>
      <span class="toolbar-sep"></span>
      <button
        type="button"
        class="fields-toggle"
        @click="fieldsVisible = !fieldsVisible"
        :aria-expanded="fieldsVisible ? 'true' : 'false'"
      >
        <span>{{ fieldsToggleLabel }}</span>
        <span class="fields-caret" aria-hidden="true">{{ fieldsVisible ? '▴' : '▾' }}</span>
      </button>
      <template v-if="fieldsVisible">
        <span class="toolbar-label">{{ toolbarLabel }}</span>
        <button
          v-for="key in placeholderKeys"
          :key="key"
          type="button"
          class="chip-btn"
          @mousedown.prevent="insertPlaceholder(key)"
        >
          {{ labelFor(key) }}
        </button>
      </template>
    </div>

    <div
      ref="editor"
      class="editor-area"
      :dir="dir"
      contenteditable="true"
      spellcheck="false"
      @beforeinput="onBeforeInput"
      @input="onInput"
      @keydown="onEditorKeyDown"
      @paste="onPaste"
      @dragstart="onDragStart"
      @dragover.prevent
      @drop="onDrop"
      @touchstart="onEditorTouchStart"
    ></div>
  </div>
</template>

<script>
const TOKEN_RE = /\{\{([A-Z_]+)\}\}/g;
const DELETE_TYPE_RE = /^delete/;

export default {
  name: "TemplateEditor",
  props: {
    value: { type: String, default: "" },
    lang: { type: String, default: "he" },
    dir: { type: String, default: "rtl" },
    placeholders: { type: Object, required: true },
    toolbarLabel: { type: String, default: "" }
  },
  data() {
    return {
      draggedKey: null,
      draggedNode: null,
      touchDragging: false,
      touchChip: null,
      touchChipKey: null,
      touchGhost: null,
      history: [],
      historyIndex: -1,
      historyTimer: null,
      applyingHistory: false,
      fieldsVisible: false
    };
  },
  beforeDestroy() {
    this.removeTouchGlobalListeners();
    if (this.touchGhost && this.touchGhost.parentNode) {
      this.touchGhost.parentNode.removeChild(this.touchGhost);
    }
  },
  computed: {
    placeholderKeys() {
      return Object.keys(this.placeholders);
    },
    canUndo() {
      return this.historyIndex > 0 || this.historyTimer !== null;
    },
    canRedo() {
      return this.historyIndex < this.history.length - 1;
    },
    fieldsToggleLabel() {
      if (this.dir === "rtl") {
        return this.fieldsVisible ? "הסתר שדות" : "הוסף שדה";
      }
      return this.fieldsVisible ? "Hide fields" : "Add field";
    }
  },
  watch: {
    value(newVal) {
      if (newVal !== this.serialize()) {
        this.renderFromValue(newVal);
        if (!this.applyingHistory) this.resetHistory(newVal);
      }
    },
    lang() {
      // Language switch — re-render so chip labels update.
      this.renderFromValue(this.value);
    }
  },
  mounted() {
    this.renderFromValue(this.value);
    this.resetHistory(this.value || "");
  },
  methods: {
    labelFor(key) {
      const entry = this.placeholders[key];
      if (!entry) return key;
      return entry[this.lang] || entry.he || entry.en || key;
    },

    renderFromValue(tpl) {
      const root = this.$refs.editor;
      if (!root) return;
      root.innerHTML = "";
      const str = tpl || "";
      let lastIdx = 0;
      TOKEN_RE.lastIndex = 0;
      let m;
      while ((m = TOKEN_RE.exec(str)) !== null) {
        if (m.index > lastIdx) {
          this.appendTextWithLineBreaks(root, str.slice(lastIdx, m.index));
        }
        root.appendChild(this.buildChipNode(m[1]));
        lastIdx = m.index + m[0].length;
      }
      if (lastIdx < str.length) {
        this.appendTextWithLineBreaks(root, str.slice(lastIdx));
      }
    },

    appendTextWithLineBreaks(root, text) {
      const parts = text.split("\n");
      parts.forEach((part, idx) => {
        if (part.length) root.appendChild(document.createTextNode(part));
        if (idx < parts.length - 1) root.appendChild(document.createElement("br"));
      });
    },

    buildChipNode(key) {
      const chip = document.createElement("span");
      chip.className = "chip-token";
      chip.setAttribute("contenteditable", "false");
      chip.setAttribute("draggable", "true");
      chip.dataset.placeholder = key;

      const labelEl = document.createElement("span");
      labelEl.className = "chip-token-label";
      labelEl.textContent = this.labelFor(key);
      chip.appendChild(labelEl);

      const closeBtn = document.createElement("span");
      closeBtn.className = "chip-close";
      closeBtn.setAttribute("contenteditable", "false");
      closeBtn.setAttribute("draggable", "false");
      closeBtn.setAttribute("aria-label", this.dir === "rtl" ? "הסר שדה" : "Remove field");
      closeBtn.title = this.dir === "rtl" ? "הסר שדה" : "Remove field";
      closeBtn.textContent = "×";
      // Prevent the chip's drag/selection logic from firing when interacting
      // with the close button.
      const swallow = e => { e.preventDefault(); e.stopPropagation(); };
      closeBtn.addEventListener("mousedown", swallow);
      closeBtn.addEventListener("dragstart", swallow);
      closeBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        this.requestRemoveChip(chip);
      });
      chip.appendChild(closeBtn);

      return chip;
    },

    requestRemoveChip(chipEl) {
      if (!chipEl || !chipEl.dataset || !chipEl.dataset.placeholder) return;
      const isHe = this.dir === "rtl";
      const label = this.labelFor(chipEl.dataset.placeholder);
      this.$q.dialog({
        title: isHe ? "להסיר שדה?" : "Remove field?",
        message: isHe
          ? `להסיר את השדה "${label}" מהתבנית?`
          : `Remove "${label}" from the template?`,
        ok: {
          label: isHe ? "הסר" : "Remove",
          color: "negative",
          unelevated: true,
          noCaps: true
        },
        cancel: {
          label: isHe ? "ביטול" : "Cancel",
          flat: true,
          color: "grey-7",
          noCaps: true
        },
        persistent: false
      }).onOk(() => {
        this.removeChip(chipEl);
      });
    },

    removeChip(chipEl) {
      if (!chipEl || !chipEl.parentNode) return;
      chipEl.parentNode.removeChild(chipEl);
      this.emitChange();
    },

    serialize() {
      const root = this.$refs.editor;
      if (!root) return "";
      return this.nodeToString(root);
    },

    nodeToString(node) {
      let out = "";
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          out += child.nodeValue;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child;
          if (el.tagName === "BR") {
            out += "\n";
          } else if (el.dataset && el.dataset.placeholder) {
            out += `{{${el.dataset.placeholder}}}`;
          } else if (el.tagName === "DIV") {
            // contenteditable sometimes wraps new lines in <div>
            if (out.length && !out.endsWith("\n")) out += "\n";
            out += this.nodeToString(el);
          } else {
            out += this.nodeToString(el);
          }
        }
      });
      return out;
    },

    emitChange() {
      const v = this.serialize();
      this.$emit("input", v);
      this.snapshotValue(v);
    },

    onInput() {
      this.emitChange();
    },

    resetHistory(value) {
      if (this.historyTimer) {
        clearTimeout(this.historyTimer);
        this.historyTimer = null;
      }
      this.history = [value];
      this.historyIndex = 0;
    },

    snapshotValue(value) {
      if (this.applyingHistory) return;
      if (this.historyTimer) clearTimeout(this.historyTimer);
      this.historyTimer = setTimeout(() => {
        this.historyTimer = null;
        this.commitSnapshot(value);
      }, 300);
    },

    commitSnapshot(value) {
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }
      if (this.history[this.history.length - 1] === value) return;
      this.history.push(value);
      if (this.history.length > 100) this.history.shift();
      this.historyIndex = this.history.length - 1;
    },

    flushPendingSnapshot() {
      if (!this.historyTimer) return;
      clearTimeout(this.historyTimer);
      this.historyTimer = null;
      this.commitSnapshot(this.serialize());
    },

    undo() {
      this.flushPendingSnapshot();
      if (this.historyIndex <= 0) return;
      this.historyIndex--;
      this.applyHistoryState(this.history[this.historyIndex]);
    },

    redo() {
      this.flushPendingSnapshot();
      if (this.historyIndex >= this.history.length - 1) return;
      this.historyIndex++;
      this.applyHistoryState(this.history[this.historyIndex]);
    },

    applyHistoryState(value) {
      this.applyingHistory = true;
      this.renderFromValue(value);
      this.$emit("input", value);
      this.$nextTick(() => {
        this.applyingHistory = false;
      });
    },

    onEditorKeyDown(e) {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      } else if ((k === "z" && e.shiftKey) || k === "y") {
        e.preventDefault();
        this.redo();
      }
    },

    onBeforeInput(e) {
      if (!DELETE_TYPE_RE.test(e.inputType)) return;
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      if (this.wouldAffectChip(range, e.inputType)) {
        e.preventDefault();
      }
    },

    wouldAffectChip(range, inputType) {
      if (!range.collapsed) {
        const frag = range.cloneContents();
        const tmp = document.createElement("div");
        tmp.appendChild(frag);
        return !!tmp.querySelector("[data-placeholder]");
      }
      const { startContainer, startOffset } = range;
      const isBackward = /Backward/.test(inputType) || inputType === "deleteEntireSoftLine";
      const isForward = /Forward/.test(inputType);
      const isLineOrWord = /Word|Soft|Hard|deleteEntireSoftLine/.test(inputType);

      if (isLineOrWord) {
        return this.$refs.editor.querySelector("[data-placeholder]") !== null
          ? this.lineOrWordWouldTouchChip(range, isBackward)
          : false;
      }

      if (startContainer.nodeType === Node.TEXT_NODE) {
        if (isBackward && startOffset === 0) {
          const prev = startContainer.previousSibling;
          return this.isChip(prev);
        }
        if (isForward && startOffset === startContainer.nodeValue.length) {
          const next = startContainer.nextSibling;
          return this.isChip(next);
        }
        return false;
      }
      if (startContainer.nodeType === Node.ELEMENT_NODE) {
        if (isBackward) {
          const prev = startContainer.childNodes[startOffset - 1];
          return this.isChip(prev);
        }
        if (isForward) {
          const next = startContainer.childNodes[startOffset];
          return this.isChip(next);
        }
      }
      return false;
    },

    lineOrWordWouldTouchChip(range, backward) {
      // Conservative: walk from caret in the given direction; if we hit a chip
      // before a line break, consider it touched.
      const walker = document.createTreeWalker(
        this.$refs.editor,
        NodeFilter.SHOW_ALL,
        null,
        false
      );
      // Simpler heuristic: if the editor contains any chip on the caret's line,
      // block. Splits by <br> and <div>.
      return true;
    },

    isChip(node) {
      return !!(node && node.dataset && node.dataset.placeholder);
    },

    insertPlaceholder(key) {
      const root = this.$refs.editor;
      if (!root) return;
      root.focus();
      const sel = window.getSelection();
      let range;
      if (sel && sel.rangeCount && root.contains(sel.anchorNode)) {
        range = sel.getRangeAt(0);
      } else {
        range = document.createRange();
        range.selectNodeContents(root);
        range.collapse(false);
      }
      range.deleteContents();
      const chip = this.buildChipNode(key);
      range.insertNode(chip);
      // Move cursor just after the inserted chip
      const after = document.createRange();
      after.setStartAfter(chip);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
      this.emitChange();
    },

    onPaste(e) {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text");
      if (!text) return;
      this.insertPlainAndTokens(text);
    },

    insertPlainAndTokens(text) {
      const root = this.$refs.editor;
      if (!root) return;
      const sel = window.getSelection();
      let range;
      if (sel && sel.rangeCount && root.contains(sel.anchorNode)) {
        range = sel.getRangeAt(0);
      } else {
        range = document.createRange();
        range.selectNodeContents(root);
        range.collapse(false);
      }
      range.deleteContents();

      const frag = document.createDocumentFragment();
      let lastIdx = 0;
      TOKEN_RE.lastIndex = 0;
      let m;
      while ((m = TOKEN_RE.exec(text)) !== null) {
        if (m.index > lastIdx) {
          this.appendTextWithLineBreaks(frag, text.slice(lastIdx, m.index));
        }
        if (this.placeholders[m[1]]) {
          frag.appendChild(this.buildChipNode(m[1]));
        } else {
          this.appendTextWithLineBreaks(frag, m[0]);
        }
        lastIdx = m.index + m[0].length;
      }
      if (lastIdx < text.length) {
        this.appendTextWithLineBreaks(frag, text.slice(lastIdx));
      }

      const lastChild = frag.lastChild;
      range.insertNode(frag);
      if (lastChild) {
        const after = document.createRange();
        after.setStartAfter(lastChild);
        after.collapse(true);
        sel.removeAllRanges();
        sel.addRange(after);
      }
      this.emitChange();
    },

    onDragStart(e) {
      const target = e.target;
      if (!this.isChip(target)) {
        e.preventDefault();
        return;
      }
      this.draggedKey = target.dataset.placeholder;
      this.draggedNode = target;
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/placeholder", this.draggedKey);
      }
    },

    onDrop(e) {
      e.preventDefault();
      if (!this.draggedNode || !this.draggedKey) return;
      this.moveChipToPoint(this.draggedNode, this.draggedKey, e.clientX, e.clientY);
      this.draggedKey = null;
      this.draggedNode = null;
    },

    moveChipToPoint(chipEl, key, x, y) {
      const dropRange = this.rangeFromPoint(x, y);
      const editorEl = this.$refs.editor;
      if (!dropRange || !editorEl || !editorEl.contains(dropRange.startContainer)) {
        return;
      }
      if (chipEl && chipEl.parentNode) chipEl.parentNode.removeChild(chipEl);
      const newChip = this.buildChipNode(key);
      dropRange.insertNode(newChip);
      const after = document.createRange();
      after.setStartAfter(newChip);
      after.collapse(true);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(after);
      }
      this.emitChange();
    },

    rangeFromPoint(x, y) {
      if (document.caretRangeFromPoint) {
        return document.caretRangeFromPoint(x, y);
      }
      if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(x, y);
        if (pos) {
          const r = document.createRange();
          r.setStart(pos.offsetNode, pos.offset);
          r.collapse(true);
          return r;
        }
      }
      return null;
    },

    onEditorTouchStart(e) {
      const target = e.target && e.target.closest
        ? e.target.closest("[data-placeholder]")
        : null;
      if (!target) return;
      if (!e.cancelable) return;
      e.preventDefault();

      this.touchDragging = true;
      this.touchChip = target;
      this.touchChipKey = target.dataset.placeholder;

      const ghost = target.cloneNode(true);
      ghost.classList.add("chip-ghost");
      ghost.style.position = "fixed";
      ghost.style.pointerEvents = "none";
      ghost.style.zIndex = "9999";
      ghost.style.transform = "translate(-50%, -50%)";
      document.body.appendChild(ghost);
      this.touchGhost = ghost;

      const touch = e.touches && e.touches[0];
      if (touch) this.moveGhostTo(touch.clientX, touch.clientY);

      document.addEventListener("touchmove", this.onTouchMoveGlobal, { passive: false });
      document.addEventListener("touchend", this.onTouchEndGlobal);
      document.addEventListener("touchcancel", this.onTouchEndGlobal);
    },

    moveGhostTo(x, y) {
      if (!this.touchGhost) return;
      this.touchGhost.style.left = x + "px";
      this.touchGhost.style.top = y + "px";
    },

    onTouchMoveGlobal(e) {
      if (!this.touchDragging) return;
      if (e.cancelable) e.preventDefault();
      const touch = e.touches && e.touches[0];
      if (touch) this.moveGhostTo(touch.clientX, touch.clientY);
    },

    onTouchEndGlobal(e) {
      if (!this.touchDragging) return;
      const touch = (e.changedTouches && e.changedTouches[0]) || null;

      if (this.touchGhost && this.touchGhost.parentNode) {
        this.touchGhost.parentNode.removeChild(this.touchGhost);
      }
      this.touchGhost = null;

      if (touch && this.touchChip && this.touchChipKey) {
        this.moveChipToPoint(this.touchChip, this.touchChipKey, touch.clientX, touch.clientY);
      }

      this.touchDragging = false;
      this.touchChip = null;
      this.touchChipKey = null;
      this.removeTouchGlobalListeners();
    },

    removeTouchGlobalListeners() {
      document.removeEventListener("touchmove", this.onTouchMoveGlobal, { passive: false });
      document.removeEventListener("touchend", this.onTouchEndGlobal);
      document.removeEventListener("touchcancel", this.onTouchEndGlobal);
    }
  }
};
</script>

<style lang="scss" scoped>
.template-editor {
  border: 1px solid #d0d7de;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 10px 12px;
    background: #f6f8fa;
    border-bottom: 1px solid #d0d7de;
    align-items: center;
  }

  .toolbar-label {
    font-size: 12px;
    color: #57606a;
    margin-inline-end: 6px;
  }

  .editor-area {
    min-height: 260px;
    padding: 14px 16px;
    font-size: 14px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
    outline: none;
    background: #fff;
  }
}

body.body--dark .template-editor {
  border-color: #444;
  background: #1e1e1e;

  .toolbar {
    background: #2a2a2a;
    border-bottom-color: #444;
  }

  .toolbar-label {
    color: #aaa;
  }

  .editor-area {
    background: #1e1e1e;
    color: #e0e0e0;
  }
}
</style>

<style lang="scss">
/* NOT scoped — chip-token nodes are JS-created and scoped styles don't reach them. */

/* Toolbar buttons stay as small pills (they're actions, not inline content). */
.template-editor .chip-btn {
  display: inline-flex;
  align-items: center;
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background: #3b82f6;
  color: #fff;
  border: 1px solid #2563eb;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.template-editor .undo-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: #fff;
  color: #374151;
  border: 1px solid #d0d7de;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  min-height: 32px;
}

.template-editor .undo-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.template-editor .undo-btn:active:not(:disabled) {
  background: #e5e7eb;
}

.template-editor .undo-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.template-editor .undo-btn span[aria-hidden] {
  font-size: 16px;
  line-height: 1;
}

.template-editor .toolbar-sep {
  display: inline-block;
  width: 1px;
  height: 20px;
  background: #d0d7de;
  margin: 0 4px;
}

.template-editor .fields-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: #eef2ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  min-height: 32px;
}

.template-editor .fields-toggle:hover {
  background: #e0e7ff;
  border-color: #a5b4fc;
}

.template-editor .fields-toggle:active {
  background: #c7d2fe;
}

.template-editor .fields-caret {
  font-size: 12px;
  line-height: 1;
}

body.body--dark .template-editor .fields-toggle {
  background: #2a2a3a;
  color: #a5b4fc;
  border-color: #4338ca;
}

body.body--dark .template-editor .fields-toggle:hover {
  background: #312e81;
  border-color: #6366f1;
}

@media (max-width: 480px) {
  .template-editor .undo-btn .undo-label {
    display: none;
  }
  .template-editor .undo-btn {
    padding: 6px 10px;
  }
}

body.body--dark .template-editor .undo-btn {
  background: #2a2a2a;
  color: #e0e0e0;
  border-color: #444;
}

body.body--dark .template-editor .undo-btn:hover:not(:disabled) {
  background: #333;
  border-color: #666;
}

body.body--dark .template-editor .toolbar-sep {
  background: #444;
}

.template-editor .chip-btn:hover {
  background: #2563eb;
}

/* Inline placeholders inside the editor — subtle pill with built-in close button. */
.template-editor .chip-token {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  color: #2563eb;
  cursor: grab;
  user-select: none;
  white-space: nowrap;
  border-radius: 5px;
  padding: 1px 5px;
  background: rgba(37, 99, 235, 0.06);
  vertical-align: baseline;
  transition: background 0.12s ease;
}

.template-editor .chip-token:hover {
  background: rgba(37, 99, 235, 0.14);
}

.template-editor .chip-token:active {
  cursor: grabbing;
  opacity: 0.85;
}

.template-editor .chip-token-label {
  pointer-events: none;
}

.template-editor .chip-token .chip-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.22);
  color: rgba(37, 99, 235, 0.85);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
}

.template-editor .chip-token .chip-close:hover {
  background: rgb(255, 59, 48);
  color: #fff;
}

.template-editor .chip-token .chip-close:active {
  transform: scale(0.88);
}

/* Ghost shown while dragging a token. */
.chip-ghost {
  display: inline-block;
  font-weight: 700;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.15);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 13px;
  pointer-events: none;
  opacity: 0.95;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 6px rgba(30, 64, 175, 0.2);
}

body.body--dark .template-editor .chip-token,
body.body--dark .chip-ghost {
  color: #60a5fa;
}

body.body--dark .template-editor .chip-token {
  background: rgba(96, 165, 250, 0.1);
}

body.body--dark .template-editor .chip-token:hover {
  background: rgba(96, 165, 250, 0.22);
}

body.body--dark .template-editor .chip-token .chip-close {
  background: rgba(96, 165, 250, 0.28);
  color: rgba(96, 165, 250, 0.9);
}

body.body--dark .template-editor .chip-token .chip-close:hover {
  background: rgb(255, 69, 58);
  color: #fff;
}

body.body--dark .template-editor .chip-btn {
  background: #3b82f6;
  border-color: #60a5fa;
  color: #fff;
}

body.body--dark .template-editor .chip-btn:hover {
  background: #60a5fa;
  color: #0b1220;
}

body.body--dark .chip-ghost {
  background: rgba(96, 165, 250, 0.2);
}
</style>
