<template>
  <q-page class="admin-page" dir="rtl">
    <q-header class="admin-header">
      <q-toolbar class="admin-toolbar">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          color="white"
          class="icon-btn"
          @click="goHome"
          aria-label="חזרה"
        />
        <div class="admin-brand">
          <div class="admin-brand-mark">
            <span>⚙</span>
          </div>
          <div class="admin-brand-text">
            <div class="admin-brand-title">ניהול תבניות</div>
            <div class="admin-brand-subtitle">Templates Editor</div>
          </div>
        </div>
        <q-btn
          flat
          round
          dense
          :icon="darkMode ? 'light_mode' : 'dark_mode'"
          color="white"
          class="icon-btn"
          @click="toggleDarkMode"
          :aria-label="darkMode ? 'מצב בהיר' : 'מצב חושך'"
        />
        <q-btn
          v-if="authed"
          flat
          round
          dense
          icon="logout"
          color="white"
          class="icon-btn"
          @click="logout"
          aria-label="יציאה"
        />
      </q-toolbar>
    </q-header>

    <!-- Password gate -->
    <div v-if="!authed" class="gate-wrapper">
      <div class="gate-card">
        <div class="gate-icon">&#128274;</div>
        <div class="gate-title">גישה מוגבלת</div>
        <div class="gate-subtitle">הזן סיסמה כדי לערוך תבניות</div>
        <q-input
          v-model="passwordInput"
          type="password"
          outlined
          dense
          label="סיסמה"
          class="gate-input"
          @keyup.enter="submitPassword"
          :error="passwordError"
          :error-message="passwordError ? 'סיסמה שגויה' : ''"
        />
        <q-btn
          color="primary"
          label="כניסה"
          unelevated
          no-caps
          class="gate-btn"
          @click="submitPassword"
        />
      </div>
    </div>

    <!-- Admin panel -->
    <div v-else class="admin-body">
      <!-- Category pill tabs: built-in pill always visible, active custom (if any)
           as a chip next to it, all other custom categories hidden behind a menu so
           the bar stays clean even when many custom categories exist. -->
      <div class="pill-tabs-wrap">
        <button
          v-for="cat in builtInCategoriesList"
          :key="cat.key"
          type="button"
          class="pill-tab-admin"
          :class="{ active: activeCategory === cat.key }"
          @click="activeCategory = cat.key"
        >
          {{ cat.label.he }}
        </button>
        <button
          v-if="!activeIsBuiltIn"
          type="button"
          class="pill-tab-admin active"
          @click="$refs.catMenu && $refs.catMenu.show()"
        >
          {{ activeCategoryLabel }}
        </button>
        <button
          type="button"
          class="pill-tab-admin pill-menu"
          aria-label="עוד קטגוריות ויצירה חדשה"
        >
          <q-icon name="menu" size="18px" />
          <q-menu
            ref="catMenu"
            anchor="bottom end"
            self="top end"
            class="cat-menu-dropdown"
          >
            <q-list dense class="cat-menu-list">
              <div v-if="customCategories.length">
                <div class="cat-menu-header">קטגוריות מותאמות אישית</div>
                <q-item
                  v-for="cat in customCategories"
                  :key="cat.key"
                  clickable
                  v-close-popup
                  class="cat-menu-item"
                  :class="{ 'cat-menu-item-active': activeCategory === cat.key }"
                  @click="activeCategory = cat.key"
                >
                  <q-item-section>{{ cat.label.he }}</q-item-section>
                  <q-item-section side>
                    <div class="cat-menu-actions">
                      <q-btn
                        flat dense round size="sm"
                        icon="edit"
                        color="primary"
                        aria-label="ערוך"
                        @click.stop="onMenuEdit(cat.key)"
                      />
                      <q-btn
                        flat dense round size="sm"
                        icon="delete"
                        color="negative"
                        aria-label="מחק"
                        @click.stop="onMenuDelete(cat.key)"
                      />
                    </div>
                  </q-item-section>
                </q-item>
                <q-separator class="cat-menu-sep" />
              </div>
              <q-item
                clickable
                v-close-popup
                class="cat-menu-add"
                @click="openAddCategory"
              >
                <q-item-section avatar>
                  <q-icon name="add" color="primary" />
                </q-item-section>
                <q-item-section>הוסף קטגוריה חדשה</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </button>
      </div>

      <!-- Edit/delete strip (custom categories only) -->
      <div v-if="!activeIsBuiltIn" class="custom-cat-actions">
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          color="primary"
          icon="edit"
          label="ערוך שם"
          @click="openEditCategory"
        />
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          color="negative"
          icon="delete"
          label="מחק קטגוריה"
          @click="openDeleteCategory"
        />
      </div>

      <!-- Language pill tabs -->
      <div class="pill-tabs-wrap pill-tabs-sub">
        <button
          v-for="lng in LANGUAGES"
          :key="lng.key"
          type="button"
          class="pill-tab-admin pill-tab-sub"
          :class="{ active: activeLang === lng.key }"
          @click="activeLang = lng.key"
        >
          {{ lng.label.he }}
        </button>
      </div>

      <!-- Status banner -->
      <div class="status-banner" :class="bannerClass">
        <span class="banner-icon">{{ bannerIcon }}</span>
        <span class="banner-text">{{ bannerText }}</span>
        <span v-if="unsaved" class="banner-dirty">• לא נשמר</span>
      </div>

      <!-- View-mode switch -->
      <div class="view-switch" role="tablist" aria-label="מצב עריכה">
        <button
          type="button"
          class="view-switch-btn"
          :class="{ active: !showPreview }"
          @click="showPreview = false"
          role="tab"
          :aria-selected="!showPreview"
        >
          <span class="view-switch-icon">📝</span>
          <span>עורך טקסט</span>
        </button>
        <button
          type="button"
          class="view-switch-btn"
          :class="{ active: showPreview }"
          @click="showPreview = true"
          role="tab"
          :aria-selected="showPreview"
        >
          <span class="view-switch-icon">📱</span>
          <span>תצוגה כטלפון</span>
        </button>
      </div>

      <!-- Editor -->
      <div v-if="!showPreview" class="editor-card">
        <TemplateEditor
          ref="editor"
          :key="editorKey"
          :value="draftValue"
          :lang="activeLang"
          :dir="currentDir"
          :placeholders="PLACEHOLDERS"
          toolbar-label="הוסף שדה:"
          @input="onEditorInput"
        />
      </div>

      <!-- Preview (replaces editor in place) -->
      <div v-else class="preview-wrap">
        <div class="preview-label">
          תצוגה מקדימה (ערכי דוגמה) — לחץ ״ערוך״ לעריכה בפורמט טלפון
        </div>
        <WhatsAppPhonePreview
          :text="previewText"
          :edit-value="draftValue"
          :dir="currentDir"
          contact-name="Gad Elnekave"
          :spacing-mode="true"
          :spacing-samples="spacingSamples"
          edit-hint="עריכת רווחים בלבד — אפשר להוסיף או למחוק רווחים ושורות בין המילים. לחץ ״שמור״ לשמירה."
          @update:editValue="draftValue = $event"
        />
      </div>

      <!-- Primary action buttons -->
      <div class="action-row">
        <q-btn
          color="primary"
          label="שמור"
          icon="save"
          unelevated
          no-caps
          size="md"
          class="primary-btn"
          :disable="!unsaved"
          @click="onSave"
        />
        <q-btn
          color="secondary"
          label="העתק ללוח"
          icon="content_copy"
          outline
          no-caps
          size="md"
          :disable="!draftValue"
          @click="onCopyToClipboard"
        />
      </div>

      <!-- Backup section -->
      <q-expansion-item
        class="section-card backup-section"
        header-class="backup-section-header"
        icon="cloud_download"
        label="גיבוי ושחזור תבניות"
      >
        <div class="backup-body">
          <p class="backup-info">
            התבניות נשמרות בדפדפן הזה בלבד. מומלץ להוריד גיבוי מדי פעם
            ולשמור אותו במקום בטוח (מייל, Drive וכו׳).
          </p>
          <div class="backup-actions">
            <q-btn
              color="primary"
              label="הורד גיבוי"
              icon="download"
              outline
              no-caps
              @click="onDownloadBackup"
            />
            <q-btn
              color="primary"
              label="העלה גיבוי"
              icon="upload"
              outline
              no-caps
              @click="$refs.fileInput.click()"
            />
            <input
              ref="fileInput"
              type="file"
              accept="application/json,.json"
              class="hidden-file-input"
              @change="onUploadBackup"
            />
          </div>

          <div v-if="history.length" class="history-block">
            <div class="history-title">גרסאות קודמות — {{ currentLangLabel }}</div>
            <div class="history-list">
              <div
                v-for="(entry, idx) in history"
                :key="entry.at + ':' + idx"
                class="history-row"
              >
                <div class="history-meta">
                  <span class="history-when">{{ formatTime(entry.at) }}</span>
                  <span class="history-preview">{{ snippet(entry.value) }}</span>
                </div>
                <q-btn
                  flat
                  dense
                  no-caps
                  size="sm"
                  color="primary"
                  label="שחזר גרסה זו"
                  icon="history"
                  @click="restoreHistoryEntry(entry)"
                />
              </div>
            </div>
          </div>
        </div>
      </q-expansion-item>


      <!-- Danger zone (built-in categories only) -->
      <div v-if="activeIsBuiltIn" class="danger-zone">
        <div class="danger-header">
          <span class="danger-icon" aria-hidden="true">⚠</span>
          <span>אזור מסוכן</span>
        </div>
        <div class="danger-body">
          <div class="danger-label">שחזור תבנית לברירת מחדל</div>
          <div class="danger-desc">
            פעולה זו תמחק את התבנית המותאמת אישית עבור <b>{{ currentLangLabel }}</b>
            ותחזיר את ברירת המחדל. להפעלה, הקלד/י את המילה
            <span class="danger-word">שחזר</span> בתיבה למטה.
          </div>
          <div class="danger-row">
            <q-input
              v-model="resetConfirmText"
              outlined
              dense
              dir="rtl"
              label="הקלד ״שחזר״ כדי לאשר"
              class="danger-input"
            />
            <q-btn
              color="negative"
              label="שחזר ברירת מחדל"
              icon="delete_forever"
              unelevated
              no-caps
              :disable="resetConfirmText.trim() !== 'שחזר'"
              @click="onReset"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Add category modal -->
    <q-dialog v-model="showAddCategoryModal" persistent>
      <q-card class="cat-dialog" dir="rtl">
        <q-card-section>
          <div class="cat-dialog-title">קטגוריה חדשה</div>
          <div class="cat-dialog-desc">
            תן שם לקטגוריה (לדוגמה: מלונות, ביטוח, השכרת רכב).
          </div>
          <q-input
            v-model="newCategoryName"
            outlined
            dense
            dir="rtl"
            label="שם הקטגוריה"
            autofocus
            class="q-mt-sm"
            @keyup.enter="confirmAddCategory"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="ביטול" color="grey-7" no-caps v-close-popup />
          <q-btn
            color="primary"
            label="צור"
            icon="add"
            unelevated
            no-caps
            :disable="!newCategoryName.trim()"
            @click="confirmAddCategory"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit category modal -->
    <q-dialog v-model="showEditCategoryModal" persistent>
      <q-card class="cat-dialog" dir="rtl">
        <q-card-section>
          <div class="cat-dialog-title">ערוך שם קטגוריה</div>
          <q-input
            v-model="editCategoryName"
            outlined
            dense
            dir="rtl"
            label="שם חדש"
            autofocus
            class="q-mt-sm"
            @keyup.enter="confirmEditCategory"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="ביטול" color="grey-7" no-caps v-close-popup />
          <q-btn
            color="primary"
            label="שמור"
            icon="save"
            unelevated
            no-caps
            :disable="!editCategoryName.trim()"
            @click="confirmEditCategory"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete category modal -->
    <q-dialog v-model="showDeleteCategoryModal" persistent>
      <q-card class="cat-dialog cat-dialog-danger" dir="rtl">
        <q-card-section>
          <div class="cat-dialog-title danger-title">⚠ מחק קטגוריה</div>
          <div class="cat-dialog-desc">
            פעולה זו תמחק לצמיתות את הקטגוריה
            <b>{{ activeCategoryLabel }}</b>
            ואת כל התבניות שלה (כל השפות).
            להפעלה, הקלד את שם הקטגוריה למטה:
            <span class="danger-word">{{ activeCategoryLabel }}</span>
          </div>
          <q-input
            v-model="deleteConfirmText"
            outlined
            dense
            dir="rtl"
            label="הקלד את שם הקטגוריה"
            autofocus
            class="q-mt-sm"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="ביטול" color="grey-7" no-caps v-close-popup />
          <q-btn
            color="negative"
            label="מחק לצמיתות"
            icon="delete_forever"
            unelevated
            no-caps
            :disable="deleteConfirmText.trim() !== activeCategoryLabel.trim()"
            @click="confirmDeleteCategory"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import TemplateEditor from "src/components/TemplateEditor.vue";
import WhatsAppPhonePreview from "src/components/WhatsAppPhonePreview.vue";
import { LocalStorage } from "quasar";
import {
  PLACEHOLDERS,
  CATEGORIES,
  LANGUAGES,
  DEFAULT_TEMPLATES,
  FLIGHT_ITEM_KEYS,
  BUILT_IN_CATEGORY_KEYS,
  loadTemplate,
  saveTemplate,
  resetTemplate,
  hasCustomTemplate,
  loadHistory,
  exportAllTemplates,
  importAllTemplates,
  loadCustomCategories,
  addCustomCategory,
  renameCustomCategory,
  deleteCustomCategory
} from "src/assets/defaultTemplates.js";

const ADMIN_PASSWORD = "gad2026";
const AUTH_KEY = "adminAuthenticated";

// Sample values used in the admin Preview button only — not in production messages.
const PREVIEW_SAMPLES = {
  he: {
    CUSTOMER_NAME: "ישראל ישראלי",
    ALL_NAMES: "יחד עם דני ורחל",
    GREETING: "שלום!",
    DESTINATION: "מדריד",
    FLIGHTS:
      "*מסלול הטיסות 🌍*\n\n*טיסה/ות הלוך🛫*\nטיסת El Al - *LY543*\nתל אביב ⬅️ אתונה (ATH)\n*תיירים*\nממריא יום ג' 19 מאי 19:30\nנוחת    יום ג' 19 מאי 21:40\n💺 מושב *XX*\n\n*טיסה/ות חזור 🛬*\nטיסת El Al - *LY542*\nאתונה (ATH) ⬅️ תל אביב\n*תיירים*\nממריא יום ב' 25 מאי 10:35\nנוחת    יום ב' 25 מאי 12:35\n💺 מושב *XX*",
    AIRLINE_NAME: "EL AL",
    AIRLINE_CODE: "LY",
    CLASS: "מחלקת תיירים",
    CLASS_LINE: "💺*מחלקת תיירים*",
    PRICE: "👈 *$500 מבוגר x2*",
    CURRENCY: "$",
    BAGGAGE: "✅ מזוודה אחת 23 ק\"ג\n✅ כבודת יד",
    CHANGE_FEE: "100$",
    CANCEL_FEE: "250",
    NO_SHOW: "טוטאלוס",
    TICKET_ISSUANCE: "כרטוס מיידי",
    FAREWELL: "תודה רבה,\nגד אלנקווה"
  },
  en: {
    CUSTOMER_NAME: "Israel Israeli",
    ALL_NAMES: "with Danny & Rachel",
    GREETING: "Shalom!",
    DESTINATION: "Madrid",
    FLIGHTS:
      "*Itinerary 🌍*\n\n*Outbound flight🛫*\nEl Al - *LY543*\nTel-aviv ➡️ Athens (ATH)\n*Economy Cl.*\nDpt. Tue. 19 MAY 19:30\nArr.  Tue. 19 MAY 21:40\n💺 Seat *XX*\n\n*Inbound flight 🛬*\nEl Al - *LY542*\nAthens (ATH) ➡️ Tel-aviv\n*Economy Cl.*\nDpt. Mon. 25 MAY 10:35\nArr.  Mon. 25 MAY 12:35\n💺 Seat *XX*",
    AIRLINE_NAME: "EL AL",
    AIRLINE_CODE: "LY",
    CLASS: "Economy Class",
    CLASS_LINE: "💺*Economy Class*",
    PRICE: "  2 adult * $500",
    CURRENCY: "$",
    BAGGAGE: "✅ 1 checked bag 23 kg\n✅ Carry-on",
    CHANGE_FEE: "$100",
    CANCEL_FEE: "250",
    NO_SHOW: "Total loss",
    TICKET_ISSUANCE: "Immediate",
    FAREWELL: "Best regards,\nGad Elnekave"
  },
  fr: {
    CUSTOMER_NAME: "Israel Israeli",
    ALL_NAMES: "accompagné de Danny & Rachel",
    GREETING: "Shalom!",
    DESTINATION: "Madrid",
    FLIGHTS:
      "*Itinéraire 🌍*\n\n*Vol aller 🛫*\nEl Al - *LY543*\nTel-aviv ➡️ Athens (ATH)\n*Economy Cl.*\nDpt. Mar 19 MAI 19:30\nArr.  Mar 19 MAI 21:40\n💺 Siege *XX*\n\n*Vol retour 🛬*\nEl Al - *LY542*\nAthens (ATH) ➡️ Tel-aviv (TLV)\n*Economy Cl.*\nDpt. Lun 25 MAI 10:35\nArr.  Lun 25 MAI 12:35\n💺 Siege *XX*",
    AIRLINE_NAME: "EL AL",
    AIRLINE_CODE: "LY",
    CLASS: "Cl. Économique",
    CLASS_LINE: "💺 *Cl. Économique*",
    PRICE: "  2 adulte * $500",
    CURRENCY: "$",
    BAGGAGE: "✅ 1 bagage en soute 23 kg\n✅ Bagage cabine",
    CHANGE_FEE: "$100",
    CANCEL_FEE: "250",
    NO_SHOW: "Totalement perdu",
    TICKET_ISSUANCE: "Immédiat",
    FAREWELL: "Cordialement,\nGad Elnekave"
  }
};

// Sample per-flight data for the Preview button — round-trip TLV ↔ ATH, 2 flights.
const PREVIEW_FLIGHTS = {
  he: [
    {
      FLIGHT_DIRECTION: "טיסה/ות הלוך🛫",
      directionGroup: "outbound",
      FLIGHT_AIRLINE: "El Al",
      FLIGHT_NUMBER: "LY543",
      FLIGHT_ORIGIN_CITY: "תל אביב",
      FLIGHT_ORIGIN_CODE: "TLV",
      FLIGHT_DEST_CITY: "אתונה",
      FLIGHT_DEST_CODE: "ATH",
      FLIGHT_DEPART_DAY: "יום ג'",
      FLIGHT_DEPART_DATE: "19",
      FLIGHT_DEPART_MONTH: "מאי",
      FLIGHT_DEPART_TIME: "19:30",
      FLIGHT_ARRIVE_DAY: "יום ג'",
      FLIGHT_ARRIVE_DATE: "19",
      FLIGHT_ARRIVE_MONTH: "מאי",
      FLIGHT_ARRIVE_TIME: "21:40",
      FLIGHT_CLASS: "מחלקת תיירים"
    },
    {
      FLIGHT_DIRECTION: "טיסה/ות חזור 🛬",
      directionGroup: "inbound",
      FLIGHT_AIRLINE: "El Al",
      FLIGHT_NUMBER: "LY542",
      FLIGHT_ORIGIN_CITY: "אתונה",
      FLIGHT_ORIGIN_CODE: "ATH",
      FLIGHT_DEST_CITY: "תל אביב",
      FLIGHT_DEST_CODE: "TLV",
      FLIGHT_DEPART_DAY: "יום ב'",
      FLIGHT_DEPART_DATE: "25",
      FLIGHT_DEPART_MONTH: "מאי",
      FLIGHT_DEPART_TIME: "10:35",
      FLIGHT_ARRIVE_DAY: "יום ב'",
      FLIGHT_ARRIVE_DATE: "25",
      FLIGHT_ARRIVE_MONTH: "מאי",
      FLIGHT_ARRIVE_TIME: "12:35",
      FLIGHT_CLASS: "מחלקת תיירים"
    }
  ],
  en: [
    {
      FLIGHT_DIRECTION: "Outbound flight🛫",
      directionGroup: "outbound",
      FLIGHT_AIRLINE: "El Al",
      FLIGHT_NUMBER: "LY543",
      FLIGHT_ORIGIN_CITY: "Tel-aviv",
      FLIGHT_ORIGIN_CODE: "TLV",
      FLIGHT_DEST_CITY: "Athens",
      FLIGHT_DEST_CODE: "ATH",
      FLIGHT_DEPART_DAY: "Tue",
      FLIGHT_DEPART_DATE: "19",
      FLIGHT_DEPART_MONTH: "MAY",
      FLIGHT_DEPART_TIME: "19:30",
      FLIGHT_ARRIVE_DAY: "Tue",
      FLIGHT_ARRIVE_DATE: "19",
      FLIGHT_ARRIVE_MONTH: "MAY",
      FLIGHT_ARRIVE_TIME: "21:40",
      FLIGHT_CLASS: "Economy Class"
    },
    {
      FLIGHT_DIRECTION: "Inbound flight 🛬",
      directionGroup: "inbound",
      FLIGHT_AIRLINE: "El Al",
      FLIGHT_NUMBER: "LY542",
      FLIGHT_ORIGIN_CITY: "Athens",
      FLIGHT_ORIGIN_CODE: "ATH",
      FLIGHT_DEST_CITY: "Tel-aviv",
      FLIGHT_DEST_CODE: "TLV",
      FLIGHT_DEPART_DAY: "Mon",
      FLIGHT_DEPART_DATE: "25",
      FLIGHT_DEPART_MONTH: "MAY",
      FLIGHT_DEPART_TIME: "10:35",
      FLIGHT_ARRIVE_DAY: "Mon",
      FLIGHT_ARRIVE_DATE: "25",
      FLIGHT_ARRIVE_MONTH: "MAY",
      FLIGHT_ARRIVE_TIME: "12:35",
      FLIGHT_CLASS: "Economy Class"
    }
  ],
  fr: [
    {
      FLIGHT_DIRECTION: "Vol aller 🛫",
      directionGroup: "outbound",
      FLIGHT_AIRLINE: "El Al",
      FLIGHT_NUMBER: "LY543",
      FLIGHT_ORIGIN_CITY: "Tel-aviv",
      FLIGHT_ORIGIN_CODE: "TLV",
      FLIGHT_DEST_CITY: "Athens",
      FLIGHT_DEST_CODE: "ATH",
      FLIGHT_DEPART_DAY: "Mar",
      FLIGHT_DEPART_DATE: "19",
      FLIGHT_DEPART_MONTH: "MAI",
      FLIGHT_DEPART_TIME: "19:30",
      FLIGHT_ARRIVE_DAY: "Mar",
      FLIGHT_ARRIVE_DATE: "19",
      FLIGHT_ARRIVE_MONTH: "MAI",
      FLIGHT_ARRIVE_TIME: "21:40",
      FLIGHT_CLASS: "Cl. Économique"
    },
    {
      FLIGHT_DIRECTION: "Vol retour 🛬",
      directionGroup: "inbound",
      FLIGHT_AIRLINE: "El Al",
      FLIGHT_NUMBER: "LY542",
      FLIGHT_ORIGIN_CITY: "Athens",
      FLIGHT_ORIGIN_CODE: "ATH",
      FLIGHT_DEST_CITY: "Tel-aviv",
      FLIGHT_DEST_CODE: "TLV",
      FLIGHT_DEPART_DAY: "Lun",
      FLIGHT_DEPART_DATE: "25",
      FLIGHT_DEPART_MONTH: "MAI",
      FLIGHT_DEPART_TIME: "10:35",
      FLIGHT_ARRIVE_DAY: "Lun",
      FLIGHT_ARRIVE_DATE: "25",
      FLIGHT_ARRIVE_MONTH: "MAI",
      FLIGHT_ARRIVE_TIME: "12:35",
      FLIGHT_CLASS: "Cl. Économique"
    }
  ]
};

export default {
  name: "AdminPage",
  components: { TemplateEditor, WhatsAppPhonePreview },
  data() {
    return {
      authed: false,
      passwordInput: "",
      passwordError: false,
      PLACEHOLDERS,
      LANGUAGES,
      activeCategory: CATEGORIES[0].key,
      activeLang: "he",
      draftValue: "",
      savedValue: "",
      showPreview: false,
      isCustom: false,
      resetConfirmText: "",
      history: [],
      darkMode: false,
      customCategories: [],
      showAddCategoryModal: false,
      newCategoryName: "",
      showEditCategoryModal: false,
      editCategoryName: "",
      showDeleteCategoryModal: false,
      deleteConfirmText: ""
    };
  },
  computed: {
    allCategories() {
      return [...CATEGORIES, ...this.customCategories];
    },
    builtInCategoriesList() {
      return CATEGORIES;
    },
    activeIsBuiltIn() {
      return BUILT_IN_CATEGORY_KEYS.indexOf(this.activeCategory) !== -1;
    },
    activeCategoryLabel() {
      const found = this.allCategories.find(c => c.key === this.activeCategory);
      return found ? found.label.he : this.activeCategory;
    },
    currentDir() {
      const found = LANGUAGES.find(l => l.key === this.activeLang);
      return found ? found.dir : "ltr";
    },
    currentLangLabel() {
      const found = LANGUAGES.find(l => l.key === this.activeLang);
      return found ? found.label.he : this.activeLang;
    },
    unsaved() {
      return this.draftValue !== this.savedValue;
    },
    editorKey() {
      return `${this.activeCategory}:${this.activeLang}`;
    },
    bannerClass() {
      if (!this.activeIsBuiltIn && !this.isCustom) return "banner-empty";
      return this.isCustom ? "banner-custom" : "banner-default";
    },
    bannerIcon() {
      if (!this.activeIsBuiltIn && !this.isCustom) return "📋";
      return this.isCustom ? "✏️" : "📄";
    },
    bannerText() {
      if (!this.activeIsBuiltIn && !this.isCustom) return "תבנית ריקה — מלא טקסט ולחץ ״שמור״";
      return this.isCustom ? "תבנית מותאמת אישית (שמורה)" : "תבנית ברירת מחדל";
    },
    previewText() {
      const sample = PREVIEW_SAMPLES[this.activeLang] || PREVIEW_SAMPLES.en;
      const flights = PREVIEW_FLIGHTS[this.activeLang] || PREVIEW_FLIGHTS.en;
      const expanded = this.expandFlightBlockPreview(this.draftValue || "", flights);
      return expanded.replace(
        /\{\{([A-Z_]+)\}\}/g,
        (m, key) => (sample[key] !== undefined ? sample[key] : m)
      );
    },
    spacingSamples() {
      const base = PREVIEW_SAMPLES[this.activeLang] || PREVIEW_SAMPLES.en;
      const flight = (PREVIEW_FLIGHTS[this.activeLang] || PREVIEW_FLIGHTS.en)[0] || {};
      return { ...base, ...flight };
    }
  },
  watch: {
    activeCategory() {
      this.loadCurrent();
    },
    activeLang() {
      this.loadCurrent();
    }
  },
  created() {
    try {
      if (window.sessionStorage.getItem(AUTH_KEY) === "true") {
        this.authed = true;
      }
    } catch (e) { /* noop */ }
    this.darkMode = !!LocalStorage.getItem("darkMode");
    this.$q.dark.set(this.darkMode);
    this.customCategories = loadCustomCategories();
    if (this.authed) this.loadCurrent();
  },
  methods: {
    submitPassword() {
      if (this.passwordInput === ADMIN_PASSWORD) {
        try {
          window.sessionStorage.setItem(AUTH_KEY, "true");
        } catch (e) { /* noop */ }
        this.authed = true;
        this.passwordError = false;
        this.passwordInput = "";
        this.loadCurrent();
      } else {
        this.passwordError = true;
      }
    },
    logout() {
      try {
        window.sessionStorage.removeItem(AUTH_KEY);
      } catch (e) { /* noop */ }
      this.authed = false;
      this.draftValue = "";
      this.savedValue = "";
      this.showPreview = false;
    },
    goHome() {
      this.$router.push("/");
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      this.$q.dark.set(this.darkMode);
      LocalStorage.set("darkMode", this.darkMode);
    },
    loadCurrent() {
      const cat = this.activeCategory;
      const lang = this.activeLang;
      const loaded = loadTemplate(cat, lang);
      this.savedValue = loaded;
      this.draftValue = loaded;
      this.isCustom = hasCustomTemplate(cat, lang);
      this.resetConfirmText = "";
      this.history = loadHistory(cat, lang);
    },
    onEditorInput(newVal) {
      this.draftValue = newVal;
    },
    onSave() {
      saveTemplate(this.activeCategory, this.activeLang, this.draftValue);
      this.savedValue = this.draftValue;
      this.isCustom = true;
      this.history = loadHistory(this.activeCategory, this.activeLang);
      this.$q.notify({
        type: "positive",
        message: "התבנית נשמרה",
        position: "top",
        timeout: 1500
      });
    },
    onReset() {
      if (this.resetConfirmText.trim() !== "שחזר") return;
      resetTemplate(this.activeCategory, this.activeLang);
      const def = (DEFAULT_TEMPLATES[this.activeCategory] || {})[this.activeLang] || "";
      this.savedValue = def;
      this.draftValue = def;
      this.isCustom = false;
      this.resetConfirmText = "";
      this.history = loadHistory(this.activeCategory, this.activeLang);
      this.$q.notify({
        type: "info",
        message: "הוחזרה ברירת המחדל",
        position: "top",
        timeout: 1500
      });
    },
    restoreHistoryEntry(entry) {
      this.draftValue = entry.value;
      this.$q.notify({
        type: "info",
        message: "גרסה קודמת נטענה לעורך. לחץ ״שמור״ כדי לאמץ אותה.",
        position: "top",
        timeout: 3000
      });
    },
    formatTime(ts) {
      try {
        const d = new Date(ts);
        const pad = n => String(n).padStart(2, "0");
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch (e) {
        return "";
      }
    },
    snippet(value) {
      const txt = (value || "").replace(/\s+/g, " ").trim();
      return txt.length > 60 ? txt.slice(0, 60) + "…" : txt;
    },
    onDownloadBackup() {
      const payload = exportAllTemplates();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0, 10);
      const a = document.createElement("a");
      a.href = url;
      a.download = `templates-backup-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 500);
      this.$q.notify({
        type: "positive",
        message: "הגיבוי הורד",
        position: "top",
        timeout: 1500
      });
    },
    openAddCategory() {
      this.newCategoryName = "";
      this.showAddCategoryModal = true;
    },
    confirmAddCategory() {
      const name = this.newCategoryName.trim();
      if (!name) return;
      const created = addCustomCategory(name);
      if (created) {
        this.customCategories = loadCustomCategories();
        this.activeCategory = created.key;
        this.showAddCategoryModal = false;
        this.$q.notify({
          type: "positive",
          message: `הקטגוריה "${name}" נוצרה`,
          position: "top",
          timeout: 1500
        });
      }
    },
    openEditCategory() {
      if (this.activeIsBuiltIn) return;
      this.editCategoryName = this.activeCategoryLabel;
      this.showEditCategoryModal = true;
    },
    onMenuEdit(key) {
      if (this.$refs.catMenu) this.$refs.catMenu.hide();
      this.activeCategory = key;
      this.$nextTick(() => this.openEditCategory());
    },
    onMenuDelete(key) {
      if (this.$refs.catMenu) this.$refs.catMenu.hide();
      this.activeCategory = key;
      this.$nextTick(() => this.openDeleteCategory());
    },
    confirmEditCategory() {
      const name = this.editCategoryName.trim();
      if (!name || this.activeIsBuiltIn) return;
      if (renameCustomCategory(this.activeCategory, name)) {
        this.customCategories = loadCustomCategories();
        this.showEditCategoryModal = false;
        this.$q.notify({
          type: "positive",
          message: "השם עודכן",
          position: "top",
          timeout: 1500
        });
      }
    },
    openDeleteCategory() {
      if (this.activeIsBuiltIn) return;
      this.deleteConfirmText = "";
      this.showDeleteCategoryModal = true;
    },
    confirmDeleteCategory() {
      if (this.activeIsBuiltIn) return;
      if (this.deleteConfirmText.trim() !== this.activeCategoryLabel.trim()) return;
      const deletedLabel = this.activeCategoryLabel;
      deleteCustomCategory(this.activeCategory);
      this.customCategories = loadCustomCategories();
      this.activeCategory = CATEGORIES[0].key;
      this.showDeleteCategoryModal = false;
      this.loadCurrent();
      this.$q.notify({
        type: "info",
        message: `הקטגוריה "${deletedLabel}" נמחקה`,
        position: "top",
        timeout: 2000
      });
    },
    async onCopyToClipboard() {
      const text = this.draftValue || "";
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        this.$q.notify({
          type: "positive",
          message: "הטקסט הועתק ללוח",
          position: "top",
          timeout: 1500
        });
      } catch (e) {
        this.$q.notify({
          type: "negative",
          message: "שגיאה בהעתקה",
          position: "top",
          timeout: 2000
        });
      }
    },
    onUploadBackup(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result || ""));
          const count = importAllTemplates(data);
          this.customCategories = loadCustomCategories();
          this.loadCurrent();
          this.$q.notify({
            type: "positive",
            message: `נטענו ${count} תבניות מהגיבוי`,
            position: "top",
            timeout: 2000
          });
        } catch (err) {
          this.$q.notify({
            type: "negative",
            message: "קובץ גיבוי לא תקין",
            position: "top",
            timeout: 2500
          });
        }
      };
      reader.readAsText(file);
    },
    expandFlightBlockPreview(tpl, flights) {
      const hasPerFlightKey = FLIGHT_ITEM_KEYS.some(k =>
        tpl.includes(`{{${k}}}`)
      );
      if (!hasPerFlightKey) return tpl;

      const lines = tpl.split("\n");
      const flightKeyRe = new RegExp(
        `\\{\\{(${FLIGHT_ITEM_KEYS.join("|")})\\}\\}`
      );

      const segs = [];
      let cur = null;
      for (let li = 0; li < lines.length; li++) {
        const ln = lines[li];
        if (ln.trim() === "") {
          if (cur) { segs.push(cur); cur = null; }
          segs.push({ type: "blank" });
        } else {
          if (!cur) cur = { type: "para", lines: [], hasFlight: false };
          cur.lines.push(ln);
          if (flightKeyRe.test(ln)) cur.hasFlight = true;
        }
      }
      if (cur) segs.push(cur);

      const blockIdx = [];
      segs.forEach((s, si) => {
        if (s.type === "para" && s.hasFlight) blockIdx.push(si);
      });
      if (!blockIdx.length) return tpl;

      // Distribute by direction (matches MessageBuilder's expandFlightBlock).
      const perBlock = blockIdx.map(() => []);
      const hasTwoBlocks = blockIdx.length >= 2;
      flights.forEach(f => {
        const bi = hasTwoBlocks && f.directionGroup === "inbound" ? 1 : 0;
        perBlock[bi].push(f);
      });

      const out = [];
      for (let si = 0; si < segs.length; si++) {
        const s = segs[si];
        if (s.type === "blank") { out.push(""); continue; }
        const bi = blockIdx.indexOf(si);
        if (bi === -1) {
          out.push(s.lines.join("\n"));
        } else if (perBlock[bi].length) {
          out.push(
            perBlock[bi]
              .map(f =>
                s.lines.join("\n").replace(/\{\{([A-Z_]+)\}\}/g, (m, key) =>
                  f[key] !== undefined ? f[key] : m
                )
              )
              .join("\n\n")
          );
        }
      }
      return out.join("\n");
    }
  }
};
</script>

<style lang="scss" scoped>
$font-stack: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
  'Helvetica Neue', Arial, sans-serif;

.admin-page {
  padding-top: 90px;
  padding-bottom: 64px;
  min-height: 100vh;
  background: #f5f7fa;
  direction: rtl;
  font-family: $font-stack;
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body.body--dark .admin-page {
  background: #121212;
}

/* Header (matches MessageBuilder header) */
.admin-header {
  background:
    radial-gradient(1200px 300px at 10% -10%, rgba(99, 153, 255, 0.25), transparent 60%),
    radial-gradient(900px 240px at 110% 0%, rgba(255, 180, 120, 0.15), transparent 55%),
    linear-gradient(180deg, #0b1730 0%, #0a1226 100%);
  box-shadow: 0 4px 24px rgba(6, 15, 35, 0.35);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.admin-toolbar {
  padding: 12px 18px;
  min-height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.admin-brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.15) inset,
    0 8px 20px rgba(99, 102, 241, 0.35);
  flex-shrink: 0;
}

.admin-brand-title {
  font-family: $font-stack;
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.admin-brand-subtitle {
  font-family: $font-stack;
  color: rgba(255, 255, 255, 0.58);
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-top: 2px;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px !important;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.16);
}

/* Gate */
.gate-wrapper {
  display: flex;
  justify-content: center;
  padding: 48px 16px;
}

.gate-card {
  background: #fff;
  border-radius: 16px;
  padding: 36px 32px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 8px 32px rgba(11, 23, 48, 0.10);
  text-align: center;
}

body.body--dark .gate-card {
  background: #1e1e1e;
  color: #e0e0e0;
}

.gate-icon { font-size: 40px; margin-bottom: 10px; }

.gate-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #0b1730;
}

body.body--dark .gate-title { color: #8ab4f8; }

.gate-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

body.body--dark .gate-subtitle { color: #aaa; }

.gate-input { margin-bottom: 16px; }

.gate-btn {
  width: 100%;
  border-radius: 10px;
  padding: 12px;
  font-size: 15px;
}

/* Body */
.admin-body {
  max-width: 760px;
  margin: 0 auto;
  padding: 20px 16px;
  width: 100%;
  box-sizing: border-box;
}

/* Pill tabs */
.pill-tabs-wrap {
  display: inline-flex;
  gap: 4px;
  padding: 5px;
  background: #fff;
  border: 1px solid #e4e9f1;
  border-radius: 999px;
  box-shadow: 0 1px 3px rgba(11, 23, 48, 0.06);
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.pill-tabs-sub {
  margin-bottom: 14px;
  background: #f3f6fb;
  border-color: #d9e2ec;
}

body.body--dark .pill-tabs-wrap {
  background: #1e1e1e;
  border-color: #333;
}

body.body--dark .pill-tabs-sub {
  background: #1c2733;
  border-color: #344c5e;
}

.pill-tab-admin {
  font-family: $font-stack;
  border: 0;
  background: transparent;
  color: #475569;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, transform 0.1s ease;
}

.pill-tab-admin:hover { color: #0b1730; }

.pill-tab-admin.active {
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  color: #fff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.pill-tab-sub.active {
  background: linear-gradient(180deg, #6366f1, #4f46e5);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
}

.pill-tab-admin:active { transform: scale(0.97); }

body.body--dark .pill-tab-admin { color: #aaa; }
body.body--dark .pill-tab-admin:hover { color: #fff; }

/* Status banner */
.status-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  margin: 12px 0;
  font-size: 14px;
  font-weight: 500;
}

.banner-default {
  background: #f1f5f9;
  color: #475569;
}

.banner-custom {
  background: #fef3c7;
  color: #92400e;
}

.banner-empty {
  background: #e0f2fe;
  color: #075985;
}

body.body--dark .banner-default { background: #2a2a2a; color: #bbb; }
body.body--dark .banner-custom { background: #4a3b10; color: #fde68a; }
body.body--dark .banner-empty { background: #0c2e44; color: #bae6fd; }

/* Add-category pill */
.pill-add {
  border: 1.5px dashed #94a3b8 !important;
  color: #475569 !important;
  background: transparent !important;
  margin-inline-start: 4px;
}

.pill-add:hover {
  border-color: #2563eb !important;
  color: #2563eb !important;
  background: rgba(37, 99, 235, 0.05) !important;
}

body.body--dark .pill-add {
  border-color: #475569 !important;
  color: #94a3b8 !important;
}

body.body--dark .pill-add:hover {
  border-color: #60a5fa !important;
  color: #60a5fa !important;
  background: rgba(96, 165, 250, 0.1) !important;
}

/* Hamburger menu pill — Apple-style translucent button */
.pill-menu {
  background: rgba(120, 120, 128, 0.12) !important;
  border: 0.5px solid rgba(0, 0, 0, 0.04) !important;
  color: #1c1c1e !important;
  padding: 8px 14px !important;
  display: inline-flex !important;
  align-items: center;
  margin-inline-start: 4px;
  transition: background 0.18s ease, transform 0.1s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.pill-menu:hover {
  background: rgba(120, 120, 128, 0.18) !important;
  color: #000 !important;
}

.pill-menu:active {
  transform: scale(0.96);
}

body.body--dark .pill-menu {
  background: rgba(120, 120, 128, 0.24) !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
  color: rgba(255, 255, 255, 0.92) !important;
}

body.body--dark .pill-menu:hover {
  background: rgba(120, 120, 128, 0.36) !important;
  color: #fff !important;
}

/* Apple-style frosted-glass dropdown */
.cat-menu-dropdown {
  border-radius: 14px !important;
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: saturate(180%) blur(24px);
  -webkit-backdrop-filter: saturate(180%) blur(24px);
  box-shadow:
    0 0.5px 0 rgba(0, 0, 0, 0.04) inset,
    0 0 0 0.5px rgba(0, 0, 0, 0.06),
    0 6px 16px rgba(0, 0, 0, 0.08),
    0 16px 40px rgba(0, 0, 0, 0.14) !important;
  margin-top: 8px;
  overflow: hidden;
}

body.body--dark .cat-menu-dropdown {
  background: rgba(36, 36, 38, 0.85) !important;
  box-shadow:
    0 0.5px 0 rgba(255, 255, 255, 0.06) inset,
    0 0 0 0.5px rgba(255, 255, 255, 0.08),
    0 8px 20px rgba(0, 0, 0, 0.32),
    0 20px 48px rgba(0, 0, 0, 0.5) !important;
}

.cat-menu-list {
  min-width: 280px;
  padding: 5px;
}

.cat-menu-header {
  font-size: 11px;
  font-weight: 600;
  color: rgba(60, 60, 67, 0.6);
  letter-spacing: 0.3px;
  padding: 8px 12px 4px;
  font-family: $font-stack;
}

body.body--dark .cat-menu-header {
  color: rgba(235, 235, 245, 0.55);
}

.cat-menu-item {
  font-family: $font-stack;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px !important;
  min-height: 36px !important;
  border-radius: 8px;
  margin: 1px 0;
  color: #1c1c1e;
  transition: background 0.12s ease, color 0.12s ease;
}

.cat-menu-item:hover {
  background: rgba(0, 0, 0, 0.05) !important;
}

body.body--dark .cat-menu-item {
  color: rgba(255, 255, 255, 0.92);
}

body.body--dark .cat-menu-item:hover {
  background: rgba(255, 255, 255, 0.07) !important;
}

.cat-menu-item-active {
  background: rgba(0, 122, 255, 0.12) !important;
  color: rgb(0, 122, 255) !important;
  font-weight: 600;
}

.cat-menu-item-active:hover {
  background: rgba(0, 122, 255, 0.18) !important;
}

body.body--dark .cat-menu-item-active {
  background: rgba(10, 132, 255, 0.22) !important;
  color: rgb(10, 132, 255) !important;
}

body.body--dark .cat-menu-item-active:hover {
  background: rgba(10, 132, 255, 0.3) !important;
}

.cat-menu-actions {
  display: flex;
  gap: 2px;
  align-items: center;
}

.cat-menu-actions ::v-deep .q-btn {
  opacity: 0.55;
  transition: opacity 0.15s ease, background 0.15s ease;
  min-height: 28px;
  min-width: 28px;
}

.cat-menu-item:hover .cat-menu-actions ::v-deep .q-btn {
  opacity: 1;
}

.cat-menu-actions ::v-deep .q-btn .q-icon {
  font-size: 17px;
}

.cat-menu-sep {
  margin: 5px 4px !important;
  height: 0.5px !important;
  background: rgba(60, 60, 67, 0.12) !important;
  opacity: 1 !important;
}

body.body--dark .cat-menu-sep {
  background: rgba(255, 255, 255, 0.1) !important;
}

.cat-menu-add {
  font-family: $font-stack;
  font-size: 14px;
  font-weight: 500;
  color: rgb(0, 122, 255);
  padding: 8px 12px !important;
  min-height: 36px !important;
  border-radius: 8px;
  margin: 1px 0;
  transition: background 0.12s ease;
}

.cat-menu-add:hover {
  background: rgba(0, 122, 255, 0.1) !important;
}

.cat-menu-add ::v-deep .q-icon {
  color: rgb(0, 122, 255);
  font-size: 18px;
}

body.body--dark .cat-menu-add {
  color: rgb(10, 132, 255);
}

body.body--dark .cat-menu-add:hover {
  background: rgba(10, 132, 255, 0.18) !important;
}

body.body--dark .cat-menu-add ::v-deep .q-icon {
  color: rgb(10, 132, 255);
}

/* Custom-category edit/delete strip */
.custom-cat-actions {
  display: flex;
  gap: 4px;
  margin: -4px 0 8px;
  padding: 4px 6px;
  background: rgba(99, 102, 241, 0.06);
  border-radius: 8px;
  align-items: center;
}

body.body--dark .custom-cat-actions {
  background: rgba(138, 180, 248, 0.08);
}

/* Category dialogs */
.cat-dialog {
  min-width: 320px;
  max-width: 90vw;
  border-radius: 14px;
  font-family: $font-stack;
}

body.body--dark .cat-dialog {
  background: #1e1e1e;
  color: #e0e0e0;
}

.cat-dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: #0b1730;
  margin-bottom: 6px;
}

body.body--dark .cat-dialog-title { color: #8ab4f8; }

.cat-dialog-title.danger-title { color: #991b1b; }

body.body--dark .cat-dialog-title.danger-title { color: #fca5a5; }

.cat-dialog-desc {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.7;
}

body.body--dark .cat-dialog-desc { color: #aab; }

.cat-dialog-danger {
  border: 2px solid #fca5a5;
}

body.body--dark .cat-dialog-danger {
  border-color: #7f1d1d;
}

.banner-dirty {
  margin-inline-start: auto;
  color: #dc2626;
  font-weight: 700;
}

/* View-mode switch (Editor vs Phone preview) */
.view-switch {
  display: flex;
  gap: 6px;
  padding: 5px;
  background: #fff;
  border: 1px solid #e4e9f1;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(11, 23, 48, 0.06);
  margin: 6px 0 14px;
  width: 100%;
  box-sizing: border-box;
}

body.body--dark .view-switch {
  background: #1e1e1e;
  border-color: #333;
}

.view-switch-btn {
  flex: 1;
  font-family: $font-stack;
  border: 0;
  background: transparent;
  color: #475569;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
}

.view-switch-btn:hover { color: #0b1730; }

.view-switch-btn:active { transform: scale(0.98); }

.view-switch-btn.active {
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  color: #fff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.32);
}

body.body--dark .view-switch-btn { color: #aaa; }
body.body--dark .view-switch-btn:hover { color: #fff; }

.view-switch-icon { font-size: 18px; line-height: 1; }

/* Editor card wrapper */
.editor-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 1px 4px rgba(11, 23, 48, 0.08);
  margin-top: 4px;
}

body.body--dark .editor-card { background: #1e1e1e; }

/* Actions */
.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.primary-btn {
  border-radius: 10px;
  padding: 0 22px;
  font-weight: 600;
  min-height: 42px;
}

.primary-btn ::v-deep .q-btn__content { font-size: 15px; }

/* Preview */
.preview-wrap { margin-top: 20px; }

.preview-label {
  font-size: 13px;
  color: #555;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
}

body.body--dark .preview-label { color: #bbb; }

/* Backup section */
.backup-section {
  margin-top: 20px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(11, 23, 48, 0.08);
  overflow: hidden;
}

body.body--dark .backup-section { background: #1e1e1e; }

.backup-section ::v-deep .backup-section-header {
  padding: 14px 18px;
  font-family: $font-stack;
  font-weight: 600;
  font-size: 15px;
  color: #1d4ed8;
}

body.body--dark .backup-section ::v-deep .backup-section-header { color: #8ab4f8; }

.backup-body { padding: 4px 18px 18px; }

.backup-info {
  font-size: 13.5px;
  color: #475569;
  margin: 0 0 14px;
  line-height: 1.6;
}

body.body--dark .backup-info { color: #aab; }

.backup-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hidden-file-input { display: none; }

/* Placeholder management — Apple-style minimal list with refined rows */
.placeholders-section {
  margin-top: 20px;
  background: #fff;
  border-radius: 14px;
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(11, 23, 48, 0.06);
  overflow: hidden;
}

body.body--dark .placeholders-section {
  background: #1e1e1e;
  box-shadow:
    0 0 0 0.5px rgba(255, 255, 255, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.4);
}

.placeholders-section ::v-deep .placeholders-section-header {
  padding: 14px 18px;
  font-family: $font-stack;
  font-weight: 600;
  font-size: 15px;
  color: #1c1c1e;
}

body.body--dark .placeholders-section ::v-deep .placeholders-section-header {
  color: #f5f5f7;
}

.placeholders-body {
  padding: 4px 18px 18px;
}

.placeholders-info {
  font-size: 13px;
  color: rgba(60, 60, 67, 0.65);
  margin: 0 0 14px;
  line-height: 1.6;
}

body.body--dark .placeholders-info {
  color: rgba(235, 235, 245, 0.6);
}

.placeholders-section-title {
  font-size: 11px;
  font-weight: 600;
  color: rgba(60, 60, 67, 0.55);
  letter-spacing: 0.4px;
  text-transform: uppercase;
  margin: 10px 0 6px;
  font-family: $font-stack;
}

body.body--dark .placeholders-section-title {
  color: rgba(235, 235, 245, 0.45);
}

.placeholders-count {
  font-weight: 400;
  color: rgba(60, 60, 67, 0.4);
  margin-inline-start: 2px;
  letter-spacing: 0;
}

body.body--dark .placeholders-count {
  color: rgba(235, 235, 245, 0.35);
}

.placeholders-list {
  display: flex;
  flex-direction: column;
  background: rgba(120, 120, 128, 0.06);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

body.body--dark .placeholders-list {
  background: rgba(255, 255, 255, 0.04);
}

.placeholder-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  font-family: $font-stack;
  transition: background 0.12s ease;
}

.placeholder-row + .placeholder-row {
  border-top: 0.5px solid rgba(60, 60, 67, 0.12);
}

body.body--dark .placeholder-row + .placeholder-row {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.placeholder-row-custom:hover {
  background: rgba(0, 0, 0, 0.03);
}

body.body--dark .placeholder-row-custom:hover {
  background: rgba(255, 255, 255, 0.04);
}

.placeholder-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.placeholder-key {
  font-size: 12.5px;
  font-family: 'SF Mono', 'JetBrains Mono', 'Roboto Mono', monospace;
  color: rgb(0, 122, 255);
  direction: ltr;
}

body.body--dark .placeholder-key {
  color: rgb(10, 132, 255);
}

.placeholder-label {
  font-size: 13.5px;
  color: #1c1c1e;
  font-weight: 500;
}

body.body--dark .placeholder-label {
  color: rgba(255, 255, 255, 0.9);
}

.placeholder-badge {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 3px 8px;
  background: rgba(120, 120, 128, 0.16);
  color: rgba(60, 60, 67, 0.7);
  border-radius: 999px;
  text-transform: uppercase;
}

/* Small Apple-style "x" close button next to each custom placeholder */
.placeholder-x-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(120, 120, 128, 0.2);
  color: rgba(60, 60, 67, 0.8);
  border: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
}

.placeholder-x-btn:hover {
  background: rgba(255, 59, 48, 0.95);
  color: #fff;
}

.placeholder-x-btn:active {
  transform: scale(0.9);
}

body.body--dark .placeholder-x-btn {
  background: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.85);
}

body.body--dark .placeholder-x-btn:hover {
  background: rgba(255, 69, 58, 0.95);
  color: #fff;
}

body.body--dark .placeholder-badge {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(235, 235, 245, 0.7);
}

.placeholders-empty {
  font-size: 13px;
  color: rgba(60, 60, 67, 0.5);
  padding: 14px 16px;
  background: rgba(120, 120, 128, 0.04);
  border-radius: 10px;
  margin-bottom: 10px;
  text-align: center;
  font-style: italic;
}

body.body--dark .placeholders-empty {
  background: rgba(255, 255, 255, 0.03);
  color: rgba(235, 235, 245, 0.5);
}

.add-placeholder-btn {
  border-radius: 10px;
  padding: 10px 18px;
  font-weight: 600;
}

.builtin-placeholders-inner {
  margin-top: 16px;
  background: transparent;
  border-radius: 10px;
  box-shadow: none;
}

.builtin-placeholders-inner ::v-deep .builtin-placeholders-header {
  font-size: 12.5px;
  color: rgba(60, 60, 67, 0.55);
  padding: 6px 8px;
  min-height: 32px;
  font-weight: 500;
}

body.body--dark .builtin-placeholders-inner ::v-deep .builtin-placeholders-header {
  color: rgba(235, 235, 245, 0.45);
}

.builtin-list {
  max-height: 320px;
  overflow-y: auto;
}

.placeholder-error {
  margin-top: 10px;
  padding: 8px 12px;
  background: rgba(255, 59, 48, 0.1);
  color: rgb(215, 38, 27);
  font-size: 13px;
  border-radius: 8px;
  border: 0.5px solid rgba(255, 59, 48, 0.2);
}

body.body--dark .placeholder-error {
  background: rgba(255, 69, 58, 0.18);
  color: rgb(255, 105, 97);
  border-color: rgba(255, 69, 58, 0.3);
}

.history-block {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #d9e2ec;
}

body.body--dark .history-block { border-top-color: #2e3842; }

.history-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 10px;
}

body.body--dark .history-title { color: #cbd5e1; }

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #eef2f7;
}

body.body--dark .history-row {
  background: #212a34;
  border-color: #2e3842;
}

.history-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.history-when {
  font-size: 12.5px;
  color: #64748b;
  font-variant-numeric: tabular-nums;
}

body.body--dark .history-when { color: #94a3b8; }

.history-preview {
  font-size: 13px;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

body.body--dark .history-preview { color: #cbd5e1; }

/* Danger zone */
.danger-zone {
  margin-top: 28px;
  border: 2px solid #fca5a5;
  border-radius: 14px;
  background: #fff5f5;
  overflow: hidden;
}

body.body--dark .danger-zone {
  border-color: #7f1d1d;
  background: #2a1515;
}

.danger-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(180deg, #fee2e2, #fecaca);
  color: #991b1b;
  font-size: 15px;
  font-weight: 700;
  border-bottom: 1px solid #fca5a5;
  letter-spacing: 0.3px;
}

body.body--dark .danger-header {
  background: linear-gradient(180deg, #3a1414, #2a1010);
  color: #fca5a5;
  border-bottom-color: #7f1d1d;
}

.danger-icon { font-size: 18px; }

.danger-body { padding: 16px 18px 18px; }

.danger-label {
  font-size: 15px;
  font-weight: 600;
  color: #7f1d1d;
  margin-bottom: 6px;
}

body.body--dark .danger-label { color: #fecaca; }

.danger-desc {
  font-size: 13.5px;
  color: #991b1b;
  line-height: 1.7;
  margin-bottom: 14px;
}

body.body--dark .danger-desc { color: #f3b0b0; }

.danger-word {
  display: inline-block;
  padding: 0 8px;
  background: #fecaca;
  border-radius: 5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
}

body.body--dark .danger-word {
  background: #7f1d1d;
  color: #fecaca;
}

.danger-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-end;
}

.danger-input {
  flex: 1;
  min-width: 200px;
}
</style>
