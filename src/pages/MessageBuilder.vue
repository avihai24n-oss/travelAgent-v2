<template>
  <q-page class="page-wrapper">
    <!-- Header -->
    <q-header class="modern-header">
      <q-toolbar class="toolbar-main">
        <div class="brand">
          <div class="brand-mark">
            <span class="brand-mark-inner">G</span>
          </div>
          <div class="brand-text">
            <div class="brand-title">Gad Elnekave</div>
            <div class="brand-subtitle">Travel Agent</div>
          </div>
        </div>
        <div class="header-actions">
          <q-btn
            flat
            round
            dense
            icon="dark_mode"
            color="white"
            size="sm"
            class="icon-btn"
            @click="darkMode = !darkMode"
            :aria-label="darkMode ? 'Light mode' : 'Dark mode'"
          />
          <q-btn
            flat
            round
            dense
            icon="settings"
            color="white"
            size="sm"
            class="icon-btn"
            aria-label="Admin"
            @click="$router.push('/admin')"
          />
        </div>
      </q-toolbar>
      <div class="header-tabs-wrap">
        <div class="header-tabs-pill">
          <button
            type="button"
            class="pill-tab"
            :class="{ active: tab === 'info' }"
            @click="tab = 'info'"
          >
            <span class="pill-tab-icon" aria-hidden="true">✎</span>
            <span>Build</span>
          </button>
          <button
            type="button"
            class="pill-tab"
            :class="{ active: tab === 'preview' }"
            @click="tab = 'preview'; onPreview()"
          >
            <span class="pill-tab-icon" aria-hidden="true">◉</span>
            <span>Preview</span>
          </button>
        </div>
      </div>
    </q-header>

    <!-- BUILD TAB -->
    <div v-if="tab === 'info'" class="content-area">
      <!-- Amadeus Code (Primary) -->
      <div class="section-card amadeus-hero">
        <div class="section-header amadeus-hero-header">
          <span class="section-icon">&#9992;</span>
          <span class="amadeus-hero-title">Amadeus Code</span>
          <q-btn-toggle
            v-model="selectedLang"
            no-caps
            rounded
            unelevated
            toggle-color="primary"
            color="white"
            text-color="primary"
            :options="[
              { label: 'EN', value: 'en' },
              { label: 'FR', value: 'fr' },
              { label: 'עב', value: 'he' }
            ]"
            class="lang-toggle lang-toggle-header"
          />
        </div>
        <div class="section-body">
          <q-input
            v-model="data.smartAmadeusCode"
            outlined
            autogrow
            placeholder="Paste Amadeus PNR code here..."
            type="textarea"
            class="amadeus-input amadeus-input-hero"
            input-style="min-height: 220px; font-size: 18px; line-height: 1.6;"
          />
          <div class="q-mt-md row items-center q-gutter-sm translate-row">
            <q-btn
              :label="selectDestinationBtnLabel"
              icon="flight_takeoff"
              color="primary"
              unelevated
              size="lg"
              class="translate-btn"
              :loading="isTranslatingNames"
              :disable="!data.smartAmadeusCode || apiStatus === 'offline'"
              @click="openDestinationPicker"
              no-caps
            />
            <q-btn
              :label="studioBtnLabel"
              icon="smart_toy"
              color="deep-purple-6"
              outline
              size="lg"
              class="studio-btn"
              :disable="!data.smartAmadeusCode || apiStatus === 'offline'"
              @click="onStartStudio"
              no-caps
            />
            <q-chip
              :color="apiStatusColor"
              text-color="white"
              size="md"
              :icon="apiStatusIcon"
              dense
            >
              {{ apiStatusLabel }}
            </q-chip>
            <q-btn
              flat
              dense
              round
              size="sm"
              icon="refresh"
              :loading="apiStatus === 'unknown'"
              @click="refreshApiStatus"
              :aria-label="selectedLang === 'he' ? 'בדוק חיבור' : 'Check API'"
            />
          </div>
          <div
            v-if="lastTranslatedNames.length"
            class="q-mt-sm translated-names-box"
            :dir="selectedLang === 'he' ? 'rtl' : 'ltr'"
          >
            <div class="text-caption text-grey-7">
              {{ translatedNamesHeading }}
            </div>
            <div class="text-body2">
              {{ lastTranslatedNames.join(", ") }}
            </div>
          </div>
          <div
            v-else-if="lastTranslationInfo"
            class="q-mt-sm text-caption text-grey-7"
          >
            {{ lastTranslationInfo }}
          </div>
          <q-input
            v-if="selectedLang === 'he'"
            v-model="ticketIssuanceDeadline"
            outlined
            dense
            label="מועד אחרון להנפקה (לדוגמה: יום א׳ 10 אוג׳ | 21:00)"
            class="q-mt-sm"
            dir="rtl"
          />
        </div>
      </div>

      <!-- Advanced options (collapsed by default) -->
      <q-expansion-item
        class="section-card advanced-panel"
        header-class="advanced-panel-header"
        expand-separator
        icon="tune"
        :label="advancedOptionsLabel"
      >

      <!-- Contact -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-icon">&#128222;</span>
          <span>Contact</span>
        </div>
        <div class="section-body row-flex">
          <q-input
            v-model="data.whatsappNumber"
            label="WhatsApp Number"
            outlined
            dense
            class="flex-grow"
          >
            <template v-slot:prepend>
              <q-icon name="phone" color="grey-6" />
            </template>
          </q-input>
          <q-btn
            v-if="contactListApiSupported"
            color="primary"
            icon="contacts"
            flat
            round
            @click="selectFromPhoneContactList()"
          />
        </div>
      </div>

      <!-- Travelers -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-icon">&#128100;</span>
          <span>Travelers</span>
        </div>
        <div class="section-body">
          <div class="travelers-scroll">
            <div
              v-for="(traveler, idx) in data.travelers"
              :key="idx"
              class="traveler-chip"
            >
              <div class="traveler-chip-header">
                <span class="traveler-label">Traveler {{ idx + 1 }}</span>
                <q-btn
                  v-if="idx !== 0"
                  icon="close"
                  flat
                  round
                  dense
                  size="xs"
                  color="negative"
                  @click="onRemoveTraveler(idx)"
                />
              </div>
              <q-input
                v-model="data.travelers[idx].name"
                label="Name"
                outlined
                dense
                class="q-mb-xs"
              />
              <q-select
                v-model="data.travelers[idx].type"
                :options="TRAVELER_TYPES"
                emit-value
                label="Type"
                outlined
                dense
              />
            </div>
            <q-btn
              icon="add"
              color="primary"
              round
              size="sm"
              class="add-traveler-btn"
              @click="onAddTraveler"
            />
          </div>
        </div>
      </div>

      <!-- Template Tabs -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-icon">&#128196;</span>
          <span>Template</span>
        </div>
        <div class="section-body">
          <q-tabs
            v-model="selectedTemplateTab"
            inline-label
            dense
            no-caps
            class="template-tabs"
            active-color="primary"
            indicator-color="primary"
          >
            <q-tab name="All" label="All" />
            <q-tab name="Multi tickets" label="Multi tickets" />
            <q-tab name="Family fare" label="Family fare" />
            <q-tab name="Custom" label="My Template" icon="edit" />
          </q-tabs>
        </div>
      </div>

      <!-- Dynamic Form Sections -->
      <div
        v-for="(items, boxName) in formStructure"
        :key="boxName"
        class="section-card"
      >
        <div class="section-header">
          <span class="section-icon" v-if="boxName === 'prices'">&#128176;</span>
          <span class="section-icon" v-else>&#9881;</span>
          <span>{{ boxName }}</span>
        </div>
        <div class="section-body">
          <div
            v-for="(item, index) in items"
            :key="item"
            v-if="checkIfDisplay(boxName, item)"
            class="form-group"
            :class="{ 'form-group-first': index === 0 }"
          >
            <div class="form-group-label">{{ item }}</div>
            <div
              v-for="(option, optionName) in data[boxName][item]"
              :key="optionName"
            >
              <q-input
                v-if="
                  option.type === 'input' &&
                    !option.hide &&
                    checkIfDisplaySubInput(optionName)
                "
                v-model.number="option.value"
                type="number"
                outlined
                dense
                :label="option.label"
                class="form-field"
                :class="{ 'sub-field': option.subInput }"
              />
              <q-select
                v-else-if="
                  option.type === 'selectMultiple' &&
                    checkIfDisplaySubInput(optionName)
                "
                outlined
                dense
                :type="option.type"
                v-model="option.selected"
                multiple
                :options="option.options"
                :label="
                  option.nameLabel
                    ? `${optionName} Multiple selection`
                    : 'Multiple selection'
                "
                class="form-field"
                :class="{ 'sub-field': option.subInput }"
                emit-value
              />
              <q-select
                v-else-if="
                  option.type === 'select' && checkIfDisplaySubInput(optionName)
                "
                outlined
                dense
                :type="option.type"
                v-model="option.selected"
                :options="option.options"
                label="Select"
                class="form-field"
                :class="{ 'sub-field': option.subInput }"
                emit-value
              />
              <q-option-group
                v-else-if="
                  option.type === 'radio' || option.type === 'checkbox'
                "
                :options="option.options"
                :type="option.type"
                v-model="option.selected"
                class="form-field"
              />
            </div>
          </div>
        </div>
      </div>

      </q-expansion-item>
    </div>

    <!-- PREVIEW TAB -->
    <!--
      Outer wrapper widens beyond the standard 640px so the section-toggles
      panel has room to sit beside the preview card without shifting the
      phone mockup off-center. The preview-card itself keeps its old
      640px-centered position via the 3-column grid below.
    -->
    <div v-else class="content-area preview-tab-area">
      <div class="preview-and-toggles">
        <div class="section-card preview-card">
          <div class="section-header">
            <span class="section-icon">&#128172;</span>
            <span>WhatsApp Message Preview</span>
          </div>
          <div class="section-body">
            <q-select
              v-if="categoryOptions.length > 1"
              v-model="selectedTemplateCategory"
              :options="categoryOptions"
              emit-value
              map-options
              dense
              outlined
              class="template-picker"
              :label="selectedLang === 'he' ? 'תבנית' : selectedLang === 'fr' ? 'Modèle' : 'Template'"
              @input="onTemplateCategoryChange"
            />
            <SpecialAgentPanel
              v-if="specialMode"
              :source-text="whatsappMessage"
              :dir="selectedLang === 'he' ? 'rtl' : 'ltr'"
              :lang="selectedLang"
              :flight-summary="flightSummaryForAgent"
              :contact-name="previewContactName"
              :mode="studioMode ? 'studio' : 'edit'"
              :itinerary-text="studioItinerary"
              :known-details="studioKnownDetails"
              @update:text="whatsappMessage = $event"
              @close="onCloseAgent"
            />
            <WhatsAppPhonePreview
              v-else
              :text="whatsappMessage"
              :dir="selectedLang === 'he' ? 'rtl' : 'ltr'"
              :contact-name="previewContactName"
              @update:text="whatsappMessage = $event"
            />
            <div class="preview-actions">
              <q-btn
                v-if="!specialMode"
                @click="specialMode = true; studioMode = false"
                class="special-btn"
                unelevated
                no-caps
                color="deep-purple-6"
                icon="auto_awesome"
                :label="selectedLang === 'he' ? 'ערוך עם AI' : selectedLang === 'fr' ? 'Éditer avec IA' : 'Edit with AI'"
                :disable="!whatsappMessage"
                size="md"
              />
              <q-btn
                @click="onCopyMessage"
                class="copy-msg-btn"
                unelevated
                no-caps
                color="primary"
                icon="content_copy"
                :label="copyBtnLabel"
                :disable="!whatsappMessage"
                size="md"
              />
              <q-btn
                @click="onRedirectToWhatsapp"
                class="send-btn"
                unelevated
                no-caps
                color="positive"
                icon="send"
                label="Send to WhatsApp"
                size="md"
              />
            </div>
          </div>
        </div>
        <!--
          Section-toggles panel — sibling of the preview-card so the phone
          mockup keeps its centered position. On wide screens the panel
          anchors to the right column of the grid (visual right regardless
          of RTL/LTR); on narrow screens it collapses to a horizontal
          scrollable chip strip above the card.
        -->
        <aside
          v-if="availableSections.length"
          class="section-toggles"
          :class="{ 'is-expanded': sectionsExpanded }"
          :dir="selectedLang === 'he' ? 'rtl' : 'ltr'"
        >
          <!--
            On mobile the header acts as the accordion trigger; on desktop
            CSS disables pointer-events and hides the chevron so it reads as
            a plain title and the list is always visible. activeSectionsCount
            renders a small badge so Gad sees at a glance how many sections
            are on without opening the list.
          -->
          <button
            type="button"
            class="section-toggles-header"
            @click="onToggleSectionsPanel"
            :aria-expanded="sectionsExpanded ? 'true' : 'false'"
          >
            <span class="section-toggles-title">
              Optional sections
            </span>
            <span v-if="activeSectionsCount" class="section-toggles-badge">{{ activeSectionsCount }}</span>
            <q-icon name="expand_more" class="section-toggles-chevron" />
          </button>
          <div class="section-toggles-list">
            <template v-for="item in groupedSections">
              <div
                v-if="item.type === 'group-header'"
                :key="'gh-' + item.group"
                class="section-toggle-group"
              >
                {{ groupHeaderLabel(item.group) }}
              </div>
              <label
                v-else
                :key="item.sec.key"
                class="section-toggle-row"
                :class="{ 'is-on': sectionToggles[item.sec.key], 'is-sub': item.sec.group }"
              >
                <span class="section-toggle-icon">{{ item.sec.icon }}</span>
                <span class="section-toggle-label">{{ englishSectionLabel(item.sec) }}</span>
                <q-checkbox
                  v-model="sectionToggles[item.sec.key]"
                  dense
                  class="section-toggle-control"
                  @input="onSectionToggleChange"
                />
              </label>
            </template>
          </div>
        </aside>
      </div>
    </div>

    <!-- DESTINATION PICKER DIALOG -->
    <q-dialog v-model="destinationPickerOpen" persistent>
      <q-card class="dest-dialog" :dir="selectedLang === 'he' ? 'rtl' : 'ltr'">
        <q-card-section>
          <div class="dest-dialog-title">{{ $t('destination picker title') }}</div>
          <div class="dest-dialog-desc">{{ $t('destination picker desc') }}</div>
          <div v-if="extractedDestinations.length === 0" class="dest-dialog-empty">
            {{ selectedLang === 'he'
              ? 'לא זיהיתי יעדים בקוד.'
              : selectedLang === 'fr'
                ? 'Aucune destination détectée.'
                : 'No destinations detected.' }}
          </div>
          <q-list v-else class="dest-list" separator>
            <q-item
              v-for="dest in extractedDestinations"
              :key="dest.code"
              clickable
              v-ripple
              tag="label"
              class="dest-item"
              :class="{ 'dest-item-selected': pendingDestinationCode === dest.code }"
            >
              <q-item-section avatar>
                <q-radio v-model="pendingDestinationCode" :val="dest.code" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="dest-item-label">
                  <span class="dest-flag">{{ dest.flag || '🏳️' }}</span>
                  <span class="dest-city">{{ dest.cityName }}</span>
                  <span class="dest-code">({{ dest.code }})</span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            no-caps
            color="grey-7"
            :label="$t('destination picker cancel')"
            @click="destinationPickerOpen = false"
          />
          <q-btn
            color="primary"
            unelevated
            no-caps
            icon="check"
            :label="$t('destination picker confirm')"
            :disable="!pendingDestinationCode || isTranslatingNames"
            :loading="isTranslatingNames"
            @click="confirmDestinationAndContinue"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- WELCOME DIALOG — first-visit "what's new" overlay -->
    <!-- Shows once per release. Dismissal writes `welcome_seen:ai-studio-beta-2026-07-19`
         to localStorage so subsequent visits skip it. Future releases bump the key. -->
    <q-dialog v-model="welcomeOpen" persistent>
      <q-card class="welcome-dialog" dir="rtl">
        <div class="welcome-header">
          <div class="welcome-emoji">🤖</div>
          <div class="welcome-title">חדש — עוזר ה-AI <span class="welcome-beta">beta</span></div>
          <div class="welcome-subtitle">שני מצבים חכמים לבניית הצעות — <strong>ואפשר גם להמשיך רגיל לגמרי</strong></div>
        </div>

        <q-card-section class="welcome-body">
          <div class="welcome-section">
            <div class="welcome-section-title">
              <span class="welcome-section-icon">🤖</span>
              <span>מצב סוכן — יצירה מאפס</span>
            </div>
            <div class="welcome-section-text">
              מדביקים אמדאוס ולוחצים <strong>מצב סוכן 🤖</strong>. פשוט <strong>מספרים בחופש</strong> מה תרצה בהצעה — הסיטואציה, מי משלם, התנאים — וה-AI בונה הצעה <strong>שלמה בסגנון שלך</strong>. מושלם ל<strong>הזמנות חילוץ</strong>, גוף חיצוני שמשלם, הצעה בלי מחיר ללקוח, ומקרים לא שגרתיים.
            </div>
          </div>

          <div class="welcome-section">
            <div class="welcome-section-title">
              <span class="welcome-section-icon">✨</span>
              <span>מיוחדות — עריכה בשיחה</span>
            </div>
            <div class="welcome-section-text">
              כבר יש הצעה מוכנה? לחץ <strong>מיוחדות ✨</strong> מתחת לתצוגה, <strong>דבר אל ההודעה</strong> ובקש שינויים נקודתיים ("תשנה דמי ביטול", "תוסיף מקומות מושב"). אפשר לכתוב <strong>בכל שפה</strong> — ההצעה תישאר תמיד בשפת המקור שלה.
            </div>
          </div>

          <div class="welcome-section">
            <div class="welcome-section-title">
              <span class="welcome-section-icon">🔒</span>
              <span>בטוח לחלוטין</span>
            </div>
            <div class="welcome-section-text">
              <strong>פרטי הטיסה מהאמדאוס תמיד נעולים</strong> ולא משתנים — מספרים, תאריכים ושעות תמיד מדויקים. ה-AI נשען <strong>אך ורק</strong> על התבניות, השפה והאימוג׳ים שלך, ולא ממציא כלום.
            </div>
          </div>

          <div class="welcome-section welcome-section-beta">
            <div class="welcome-section-title">
              <span class="welcome-section-icon">🧪</span>
              <span>גרסת beta — נשמח למשוב!</span>
            </div>
            <div class="welcome-section-text">
              זה <strong>חדש ועדיין משתפר</strong>. <strong>לא חייבים להשתמש בזה</strong> — אפשר להמשיך לעבוד בדיוק כרגיל, זה רק תוסף AI אופציונלי. מצאת באג או שיש לך רעיון לשיפור? <strong>שלח לי הערות</strong> ואני אמשיך לשפר 🙏
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="welcome-actions">
          <q-btn
            color="primary"
            unelevated
            no-caps
            size="md"
            class="welcome-cta"
            label="הבנתי, בוא ננסה! 🚀"
            @click="dismissWelcome"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import {
  TRAVELER_TYPES,
  CLASSES_TYPE_MAP,
  LANGS,
  FORM_STRUCTURE,
  FORM_ITEMS,
  FAMILY_FARE,
  NO_SHOW_FEE,
  NO_SHOW_PLUS_CHANGE_FEE,
  CHANGE_FEE,
  ORDER
} from "src/assets/consts.js";

import messageMixin from "./messageMixin";
import { LocalStorage } from "quasar";
import { airports } from "src/assets/iata";
import {
  loadTemplate,
  FLIGHT_ITEM_KEYS,
  CATEGORIES,
  loadCustomCategories
} from "src/assets/defaultTemplates.js";
import {
  autofillTemplate,
  OPTIONAL_SECTIONS,
  SECTION_SUPPORT
} from "src/assets/templateAutofill.js";
import { resolveVisaForFlights } from "src/assets/visaRequirements.js";
import { getCountryCode } from "src/assets/airportCountry.js";
import { flagFromCountry } from "src/assets/countryFlag.js";
import {
  getLocalizedAirlineName,
  airlineCodeFromFlightNumber,
  collectUniqueAirlines
} from "src/assets/airlineNames.js";
import { getSeatTypesSuffix } from "src/assets/seatPositions.js";
import { getLocalizedMealName } from "src/assets/mealCodes.js";
import {
  parseAmadeusNames,
  translateNamesViaProxy,
  buildTravelersFromNames,
  pingTranslationApi
} from "src/assets/nameTranslator.js";
import WhatsAppPhonePreview from "src/components/WhatsAppPhonePreview.vue";
import SpecialAgentPanel from "src/components/SpecialAgentPanel.vue";

// Welcome popup release tag. Bump this on every release that ships new
// features worth highlighting — everyone sees the dialog once more.
// Module-level const (NOT on the component options) so it isn't reactive
// and isn't accidentally persisted with the component state.
const WELCOME_KEY = "welcome_seen:ai-studio-beta-2026-07-19";

export default {
  components: { WhatsAppPhonePreview, SpecialAgentPanel },
  mixins: [messageMixin],
  data() {
    return {
      tab: "info",
      selectedTemplateTab: "All",
      contactListApiSupported: false,
      isTranslatingNames: false,
      lastTranslationInfo: "",
      lastTranslatedNames: [],
      destinationPickerOpen: false,
      pendingDestinationCode: null,
      selectedFinalDestination: null,
      // When true, confirming the destination opens the AI Studio agent
      // instead of building a template message. Set by onStartStudio().
      studioIntent: false,
      // Concrete details (customer name, travelers, destination) handed to the
      // Studio agent so it writes them into the message instead of placeholders.
      studioKnownDetails: null,
      // Welcome dialog — first-visit "what's new" overlay. Stays open
      // until the user clicks the CTA, which writes a per-release flag to
      // localStorage so subsequent visits skip it. Bump WELCOME_KEY on
      // every release that warrants a fresh greeting.
      welcomeOpen: false,
      apiStatus: "unknown", // "unknown" | "ok" | "offline" | "misconfigured"
      TRAVELER_TYPES: TRAVELER_TYPES,
      CLASSES_TYPE_MAP: CLASSES_TYPE_MAP,
      LANGS: LANGS,
      selectedLang: "en",
      formStructure: FORM_STRUCTURE,
      selectedBagges: [],
      data: {
        whatsappNumber: null,
        travelers: [{ name: "", type: "adult" }],
        smartAmadeusCode: "",
        journey: [],
        classOfTravel: "",
        firstDepart: null,
        ...FORM_ITEMS
      },
      previewTxt: "",
      whatsappMessage: "",
      // "מיוחדות" — swaps the preview for the Specials agent panel so Gad can
      // adapt the message by talking to it (rescue bookings, external payer, …).
      specialMode: false,
      // "מצב סוכן" — Studio: AI writes the whole message from a brief; only the
      // itinerary is fixed. Reuses specialMode to swap in SpecialAgentPanel.
      studioMode: false,
      studioItinerary: "",
      darkMode: false,
      ticketIssuanceDeadline: "",
      // Pilot: lets Gad pick which template fills with the Amadeus PNR data.
      // "flight" is the in-code default; other entries come from the custom
      // categories he created in Admin (synced from Supabase on app boot).
      // For Hebrew we default to Gad's Standard Airfare Quote — the picker
      // value is restored from localStorage on mount if he had picked
      // something else previously.
      selectedTemplateCategory: "flight",
      availableCustomCategories: [],
      // Map of optional-section keys → true/false. Renders as a checkbox
      // group below the picker (Hebrew only for now). Persisted per
      // (lang, category) pair so each language/template combo remembers
      // its own state across reloads.
      sectionToggles: {},
      // Accordion state for the toggle panel — only affects mobile (<1100px).
      // Desktop CSS force-shows the list regardless of this flag, so the
      // value here is "mobile collapsed/expanded" only. Default `false`
      // (collapsed) so the WhatsApp preview is the first thing visible.
      sectionsExpanded: false
    };
  },
  created() {
    this.init();
    this.darkMode = LocalStorage.getItem("darkMode");
    this.$q.dark.set(this.darkMode);
  },
  mounted() {
    this.refreshApiStatus();
    // Bootstrap (src/boot/templateSync.js) is awaited before the app renders,
    // so by the time we mount the custom categories are in localStorage.
    this.availableCustomCategories = loadCustomCategories();
    this.selectedTemplateCategory = this.loadPickerChoice(this.selectedLang);
    this.sectionToggles = this.loadSectionToggles(
      this.selectedLang,
      this.selectedTemplateCategory
    );
    // First-visit welcome popup. Shows once per release; the localStorage
    // key carries the release tag so bumping it in code re-opens the
    // popup for everyone (the user effectively opts-in to "show me what's
    // new this time too"). Wrapped in try/catch — Safari private mode
    // throws on localStorage access.
    try {
      const seen = window.localStorage.getItem(WELCOME_KEY);
      if (seen !== "1") this.welcomeOpen = true;
    } catch (e) { /* localStorage unavailable — silently skip */ }
  },
  methods: {
    dismissWelcome() {
      try {
        window.localStorage.setItem(WELCOME_KEY, "1");
      } catch (e) { /* localStorage full / private mode — best-effort only */ }
      this.welcomeOpen = false;
    },
    onAddTraveler() {
      this.data.travelers.push({
        name: "",
        type: "adult"
      });
    },
    translatedCountMsg(count) {
      switch (this.selectedLang) {
        case "he":
          return `תורגמו ${count} שמות`;
        case "fr":
          return `${count} noms traduits`;
        default:
          return `${count} names filled`;
      }
    },
    async refreshApiStatus() {
      this.apiStatus = "unknown";
      const result = await pingTranslationApi();
      if (!result.ok) {
        this.apiStatus = "offline";
        return;
      }
      this.apiStatus = result.openaiConfigured ? "ok" : "misconfigured";
    },
    // Entry point for Studio mode: route through the SAME destination picker as
    // the normal flow (so the multi-destination "pick the primary" step and the
    // passenger-name translation both run), then open the agent instead of
    // building a template. The branch happens in confirmDestinationAndContinue.
    onStartStudio() {
      this.studioIntent = true;
      this.openDestinationPicker();
    },
    onOpenStudio() {
      // Studio: hand the AI the fixed itinerary + the concrete details Gad
      // already entered (customer name, travelers, destination) and let it write
      // the whole message from his brief — do NOT build a template message here.
      // getAmadeusTranslate mutates data.journey/journeyCodes, so snapshot/restore.
      const jSnap = (this.data.journey || []).slice();
      const jcSnap = { ...(this.data.journeyCodes || {}) };
      this.studioItinerary = this.getAmadeusTranslate(this.data.smartAmadeusCode || "");
      this.data.journey = jSnap;
      this.data.journeyCodes = jcSnap;

      const firstName = ((this.data.travelers[0] && this.data.travelers[0].name) || "").trim();
      const allNames = (this.data.travelers || [])
        .map(t => (t.name || "").trim())
        .filter(Boolean);
      const dest = this.selectedFinalDestination;
      this.studioKnownDetails = {
        customerName: firstName,
        travelers: allNames,
        destination: dest ? (dest.cityName || dest.city || "") : "",
        destinationCode: dest ? dest.code || "" : ""
      };

      this.studioMode = true;
      this.specialMode = true;
      this.tab = "preview";
    },
    onCloseAgent() {
      this.specialMode = false;
      this.studioMode = false;
      this.studioIntent = false;
    },
    // Shared tail of confirmDestinationAndContinue: either open the Studio agent
    // (studio intent) or build the normal template message.
    proceedAfterDestination() {
      this.destinationPickerOpen = false;
      if (this.studioIntent) {
        this.studioIntent = false;
        this.onOpenStudio();
      } else {
        this.tab = "preview";
        this.onPreview();
      }
    },
    openDestinationPicker() {
      const prev = this.selectedFinalDestination ? this.selectedFinalDestination.code : null;
      const dests = this.extractedDestinations;
      const stillValid = prev && dests.some(d => d.code === prev);
      this.pendingDestinationCode = stillValid ? prev : null;
      this.destinationPickerOpen = true;
    },
    async confirmDestinationAndContinue() {
      if (!this.pendingDestinationCode) return;
      const picked = this.extractedDestinations.find(d => d.code === this.pendingDestinationCode);
      if (!picked) return;
      this.selectedFinalDestination = picked;

      const raw = this.data.smartAmadeusCode || "";
      const parsedNames = parseAmadeusNames(raw);

      if (parsedNames.length === 0) {
        this.lastTranslatedNames = [];
        this.lastTranslationInfo = "";
        this.proceedAfterDestination();
        return;
      }

      this.isTranslatingNames = true;
      this.lastTranslationInfo = "";
      this.lastTranslatedNames = [];
      try {
        const translated = await translateNamesViaProxy(parsedNames, this.selectedLang);
        const newTravelers = buildTravelersFromNames(parsedNames, translated);
        this.data.travelers = newTravelers;
        this.lastTranslatedNames = newTravelers.map(t => t.name);
        this.proceedAfterDestination();
        this.$q.notify({
          type: "positive",
          message: this.translatedCountMsg(newTravelers.length),
          timeout: 2500
        });
      } catch (err) {
        // Translation failed (proxy down, OpenAI missing, network error, …).
        // Fall back to the original Latin-script names from the PNR so the
        // flow doesn't dead-end on a transient backend hiccup.
        // buildTravelersFromNames with an empty array uses `${firstName}
        // ${surname}` as the fallback per traveler, exactly what we want.
        const fallbackTravelers = buildTravelersFromNames(parsedNames, []);
        this.data.travelers = fallbackTravelers;
        this.lastTranslatedNames = fallbackTravelers.map(t => t.name);
        this.proceedAfterDestination();
        const msg =
          err && err.message === "missing_proxy_config"
            ? this.missingApiKeyMsg
            : this.translationFailedMsg;
        this.lastTranslationInfo = msg;
        this.$q.notify({ type: "warning", message: msg, timeout: 3000 });
        console.warn("translate names failed, using original names:", err);
      } finally {
        this.isTranslatingNames = false;
      }
    },
    async onTranslateNamesFromPNR() {
      const raw = this.data.smartAmadeusCode || "";
      const parsed = parseAmadeusNames(raw);
      if (!parsed.length) {
        this.lastTranslatedNames = [];
        this.lastTranslationInfo = this.noNamesFoundMsg;
        this.$q.notify({
          type: "warning",
          message: this.noNamesFoundMsg,
          timeout: 3000
        });
        return;
      }
      this.isTranslatingNames = true;
      this.lastTranslationInfo = "";
      this.lastTranslatedNames = [];
      try {
        const translated = await translateNamesViaProxy(
          parsed,
          this.selectedLang
        );
        const newTravelers = buildTravelersFromNames(parsed, translated);
        this.data.travelers = newTravelers;
        this.lastTranslatedNames = newTravelers.map(t => t.name);
        this.onPreview();
        this.$q.notify({
          type: "positive",
          message: this.translatedCountMsg(newTravelers.length),
          timeout: 2500
        });
      } catch (err) {
        // Same fallback as onConfirmDestination — keep the original PNR
        // names so the agent isn't blocked on a transient backend hiccup.
        const fallbackTravelers = buildTravelersFromNames(parsed, []);
        this.data.travelers = fallbackTravelers;
        this.lastTranslatedNames = fallbackTravelers.map(t => t.name);
        this.onPreview();
        const msg =
          err && err.message === "missing_proxy_config"
            ? this.missingApiKeyMsg
            : this.translationFailedMsg;
        this.lastTranslationInfo = msg;
        this.$q.notify({ type: "warning", message: msg, timeout: 3000 });
        console.warn("translate names failed, using original names:", err);
      } finally {
        this.isTranslatingNames = false;
      }
    },
    onRemoveTraveler(idx) {
      this.data.travelers = this.data.travelers.filter(
        (traveler, index) => index !== idx
      );
    },
    prepareTextForClipboard(text) {
      // Preserve preview spacing in WhatsApp:
      // - Blank lines get a zero-width-space so WhatsApp can't collapse them.
      // - Runs of 2+ regular spaces become non-breaking spaces so WhatsApp
      //   doesn't crunch them down to a single space.
      return text
        .split("\n")
        .map(line => {
          if (line.trim() === "") return "​";
          return line.replace(/ {2,}/g, m => " ".repeat(m.length));
        })
        .join("\n");
    },
    onTemplateCategoryChange() {
      this.savePickerChoice(this.selectedLang, this.selectedTemplateCategory);
      this.sectionToggles = this.loadSectionToggles(
        this.selectedLang,
        this.selectedTemplateCategory
      );
      this.onPreview();
    },
    onSectionToggleChange() {
      this.saveSectionToggles(
        this.selectedLang,
        this.selectedTemplateCategory,
        this.sectionToggles
      );
      this.onPreview();
    },
    onToggleSectionsPanel() {
      this.sectionsExpanded = !this.sectionsExpanded;
    },
    // Group-header labels for the optional-sections panel. Locked to
    // English on purpose — the panel is agent UI chrome, not customer-
    // facing text, and Gad wants the same labels regardless of which
    // preview language is selected.
    groupHeaderLabel(group) {
      const labels = {
        preferences: "🧑‍✈️ Per-flight preferences",
        addons: "🟦 Optional Add-Ons",
        // Multi Airfare specific: 5 tier sub-toggles live under this header.
        airfare_options: "🎫 Airfare options (Multi Airfare)"
      };
      return labels[group] || "";
    },
    // English label for a section row, found by key in OPTIONAL_SECTIONS.en.
    // The keys are 1:1 across he / en / fr by design, so a Hebrew preview
    // that lists the same `pref_meal` toggle still shows "Meal preference"
    // here. Falls back to the section's own label if the English entry is
    // missing for any reason (defensive — keys should always be in `en`).
    englishSectionLabel(sec) {
      if (!sec || !sec.key) return "";
      const enList = OPTIONAL_SECTIONS.en || [];
      const found = enList.find(s => s.key === sec.key);
      return (found && found.label) || sec.label || "";
    },
    // Per-language picker choice — keyed by lang so EN/HE/FR each remember
    // their own preferred template independently. Default for Hebrew is
    // Gad's Standard Airfare Quote (custom_mpsx5w8le42j); other langs fall
    // back to the in-code `flight` template.
    pickerStorageKey(lang) {
      return `pickerChoice:${lang}`;
    },
    loadPickerChoice(lang) {
      try {
        const saved = window.localStorage.getItem(this.pickerStorageKey(lang));
        if (saved) {
          // Validate against current options — if the category was deleted
          // we don't want a stale key.
          const found = this.categoryOptions.find(o => o.value === saved);
          if (found) return saved;
        }
      } catch (e) { /* localStorage unavailable */ }
      // Languages that ship Gad's Standard Airfare Quote with autofill
      // patterns default to it; others stay on the in-code `flight` template.
      const standardLangs = ["he", "en", "fr"];
      return standardLangs.includes(lang) ? "custom_mpsx5w8le42j" : "flight";
    },
    savePickerChoice(lang, category) {
      try {
        window.localStorage.setItem(this.pickerStorageKey(lang), category);
      } catch (e) { /* localStorage full / private mode */ }
    },
    sectionTogglesKey(lang, category) {
      return `sectionToggles:${lang}:${category}`;
    },
    loadSectionToggles(lang, category) {
      // Baseline initialization. Toggles with `defaultOn: true` start checked
      // (e.g. Multi Airfare's 5 tier toggles, which ARE the core content of
      // the quote — without them the picker choice makes no sense). All
      // others start unchecked. Any persisted user choice overlays on top.
      const base = {};
      for (const sec of OPTIONAL_SECTIONS[lang] || []) {
        base[sec.key] = sec.defaultOn === true;
      }
      try {
        const raw = window.localStorage.getItem(
          this.sectionTogglesKey(lang, category)
        );
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            for (const k of Object.keys(parsed)) {
              if (k in base) base[k] = !!parsed[k];
            }
          }
        }
      } catch (e) { /* unparseable / unavailable — keep the all-false base */ }
      return base;
    },
    saveSectionToggles(lang, category, toggles) {
      try {
        window.localStorage.setItem(
          this.sectionTogglesKey(lang, category),
          JSON.stringify(toggles || {})
        );
      } catch (e) { /* localStorage full */ }
    },
    async onCopyMessage() {
      const text = this.whatsappMessage || "";
      if (!text) return;
      const prepared = this.prepareTextForClipboard(text);
      try {
        await navigator.clipboard.writeText(prepared);
        const msg = this.selectedLang === "he"
          ? "הועתק ללוח"
          : this.selectedLang === "fr"
            ? "Copié"
            : "Copied";
        this.$q.notify({ type: "positive", message: msg, position: "top", timeout: 1500 });
      } catch (e) {
        const fail = this.selectedLang === "he"
          ? "שגיאה בהעתקה"
          : this.selectedLang === "fr"
            ? "Erreur de copie"
            : "Copy failed";
        this.$q.notify({ type: "negative", message: fail, position: "top", timeout: 2000 });
      }
    },
    onPreview() {
      let flightsTxt;

      this.data.journey = [];
      this.data.journeyCodes = {};
      this.data.classOfTravel = "";

      flightsTxt = this.getAmadeusTranslate(this.data.smartAmadeusCode);

      switch (this.selectedTemplateTab) {
        case "All":
          this.whatsappMessage = this.buildFromCustomTemplate(flightsTxt);
          break;

        case "Multi tickets":
          this.whatsappMessage = `*${this.capitalizeFirstLetter(
            this.data.travelers[0].name
          )}*, ${this.$t("shalom")}
        \n${this.getRelevantTxtStructure("opening")}\n\n${this.$t(
            "ticket explanation"
          )} \n\n*${this.$t("itinerary")}* ${
            this.data.details.itinerary.itinerary.selected
          } \n${flightsTxt}\n*${this.$t("trip total cost")}:*\n${this.$t(
            "price calc demo"
          )}\n\n${this.priceExplanationTxt}\n\n${
            this.ticketingOptionsTxt
          }${this.$t("please pay again msg")} \n\n${this.$t("farewell")}`;
          break;

        case "Family fare":
          this.whatsappMessage = `*${this.capitalizeFirstLetter(
            this.data.travelers[0].name
          )}*, ${this.$t("shalom")}
        \n${this.getRelevantTxtStructure("opening")}\n\n*${this.$t(
            "itinerary"
          )}* ${
            this.data.details.itinerary.itinerary.selected
          } \n${flightsTxt} \n${this.$t(
            "airline"
          )}* (XX) ✈️\n  *xx*, *xx* & *xx*\n
*${this.$t("class of travel")} 💺*\n  ${this.$t(
            "compartment options"
          )} \n\n*${this.$t("airfare")} 💲* \n${this.airfareTxt}\n${this.$t(
            "please pay again msg"
          )} \n\n${this.$t("farewell")}`;
          break;

        case "Custom":
          this.whatsappMessage = this.buildFromCustomTemplate(flightsTxt);
          break;

        default:
          break;
      }
      if (this.data.travelers.length === 1) {
        this.whatsappMessage = this.whatsappMessage.replaceAll(
          `\n${this.$t("p. p. = per person")}`,
          ""
        );
        this.whatsappMessage = this.whatsappMessage.replaceAll(
          this.$t("p. p."),
          ""
        );
      }
      if (this.$i18n.locale === "he") {
        this.whatsappMessage = this.whatsappMessage.replaceAll(
          `\n${this.$t("p. p. = per person")}`,
          ""
        );
      }
    },
    buildFromCustomTemplate(flightsTxt) {
      const langKey = this.selectedLang;
      // Load whichever category the picker selected. For `flight` /
      // `flights_only` this is the in-code default; for custom categories
      // it's the Supabase row Gad authored.
      let tpl = loadTemplate(this.selectedTemplateCategory, langKey);
      if (!tpl) return "";
      // Custom (Gad-authored) categories use his own manual placeholders
      // ("שם הנוסע", "(LY,XX)", a blank itinerary area, etc.). Run them
      // through the auto-fill engine so they end up looking like our
      // standard {{...}} template — the Supabase row stays untouched, this
      // transformation lives only in the render path. Built-in templates
      // (`flight`, `flights_only`) are already in {{...}} form so skipping
      // autofill for them saves a regex pass and avoids the engine's
      // flight-block injection from duplicating the in-template blocks.
      const BUILT_IN_TEMPLATE_KEYS = ["flight", "flights_only"];
      if (!BUILT_IN_TEMPLATE_KEYS.includes(this.selectedTemplateCategory)) {
        tpl = autofillTemplate(
          tpl,
          langKey,
          this.sectionToggles,
          this.selectedTemplateCategory
        );
      }

      const customerName = this.capitalizeFirstLetter(
        this.data.travelers[0].name || ""
      );
      const allNames =
        this.data.travelers.length > 1 && this.allNamesTxt
          ? this.allNamesTxt
          : "";
      const cancelFee = this.data.prices["cancel fee"].cancelFee.value;
      const ticketIssuanceBase = this.$t(
        this.data.prices["​ticket issuance"]["​ticket issuance"].selected
      );
      const deadline =
        langKey === "he" && this.ticketIssuanceDeadline
          ? "\n👈" + this.ticketIssuanceDeadline
          : "";
      const ticketIssuance = ticketIssuanceBase + deadline;
      const classTxt = this.$t(this.data.classOfTravel) || "XX";
      const classLineTxt = this.classLineFor(this.data.classOfTravel, langKey);

      // Collect every airline that appears in the parsed PNR (deduped, in PNR
      // order). For a one-airline itinerary this is just that airline; for a
      // multi-carrier itinerary (e.g. IB issued + LY operating, or a multi-leg
      // trip on different airlines) the codes and names are joined with ", ".
      // Names are localized to the preview language; codes are always the
      // IATA identifiers and never change between languages.
      const parsedFlights = this.getParsedFlights();
      const { codes: airlineCode, names: airlineName } = collectUniqueAirlines(
        parsedFlights,
        langKey
      );

      // Pax count for every render-time pluralization decision below.
      // Prefers the form (typed/translated names); when the form is at
      // its default empty state, falls back to the HK<N> token in the
      // first PNR segment so a "HK2"-only PNR still renders plural copy.
      const paxCount = this.getEffectivePaxCount(parsedFlights);

      // Pax categories — scans the Amadeus text for "(CHD" / "(INF"
      // markers so the price block can append per-category rows
      // (child / infant) alongside the adult row. Adults are derived
      // from paxCount minus children (infants don't take a seat and
      // aren't counted in HK).
      const paxCategories = this.parsePaxCategories(
        this.data.smartAmadeusCode || ""
      );
      const adultCount = Math.max(
        paxCount - paxCategories.children,
        1
      );

      // The first flight's departure date — used by the intro-line
      // placeholder Gad writes as "תאריך_יציאה" / "*DATE*" / "*DATE_DEPART*".
      // We expose it as a GLOBAL placeholder (TRIP_DEPART_DATE), NOT one of
      // the FLIGHT_* family, so expandFlightBlock doesn't mistakenly tag the
      // intro paragraph as a per-flight block (the bug that wiped half the
      // itinerary the first time we tried to wire this up).
      const firstFlight = parsedFlights[0];
      const tripDepartDate = firstFlight
        ? `${firstFlight.departDateNumberOnlyStr} ${this.$t(firstFlight.departMonth)}`
        : "";

      const values = {
        CUSTOMER_NAME: customerName,
        ALL_NAMES: allNames,
        GREETING: this.$t("shalom"),
        DESTINATION: this.journeyTxt,
        FLIGHTS: flightsTxt,
        AIRLINE_NAME: airlineName,
        AIRLINE_CODE: airlineCode,
        CLASS: classTxt,
        CLASS_LINE: classLineTxt,
        TRIP_DEPART_DATE: tripDepartDate,
        PRICE: this.airfareTxt,
        CURRENCY: this.selectedCurrency,
        BAGGAGE: this.baggageList,
        CHANGE_FEE: this.changeFeeValue,
        CANCEL_FEE: cancelFee,
        NO_SHOW: this.noShowValue,
        TICKET_ISSUANCE: ticketIssuance,
        // Traveler icon picked by passenger count parsed from the PNR.
        // Gad's manual templates listed multiple person/group emojis
        // separated by "/" so he could keep the relevant one by hand; the
        // autofill pattern collapses that list to {{TRAVELERS_ICON}} and
        // we resolve it here based on how many travelers ended up in the
        // form (which the PNR / name-translation step populates).
        TRAVELERS_ICON: this.travelersIconFor(paxCount),
        // First names of every traveler, comma-separated, in the same
        // language as the rest of the message. Sits immediately after the
        // TRAVELERS_ICON in the intro line so the customer sees a quick
        // roll-call ("...נסיעתכם 👨‍👩‍👧‍👦 משה, רחל, יוסי, שרה"). Empty when
        // we have no parsed travelers — the autofill engine then leaves a
        // single trailing space after the icon, which WhatsApp collapses.
        TRAVELER_FIRST_NAMES: this.travelerFirstNames(),
        // Possessive "trip" word matched to passenger count for Hebrew
        // (נסיעתך vs נסיעתכם). English / French render to a single fixed
        // form so the same placeholder works in every language template.
        TRAVEL_NOUN: this.travelNounFor(paxCount, langKey),
        // Ticket-issuance phrase + embedded fare clause, matched to the
        // current language and passenger count. Renders as a single
        // chunk that drops into Gad's confirm-issuance line, so a
        // 1-passenger quote reads "...your ticket, specifying the chosen
        // fare for you..." and a 3-passenger quote reads "...your
        // tickets, specifying the chosen fare for each..." without the
        // agent editing anything by hand.
        TICKET_NOUN: this.ticketNounFor(paxCount, langKey),
        // "Ticket" noun on its own (no fare clause) for Gad's secondary
        // confirm-issuance line near the bottom of the template — "נא השב
        // … להנפקת כרטיסך/סיכם …". Same singular/plural rules as
        // TICKET_NOUN; the fare clause is omitted because that sentence
        // already contains the rest of its own context.
        TICKET_WORD: this.ticketWordFor(paxCount, langKey),
        FAREWELL: this.$t("farewell")
      };

      const withFlights = this.expandFlightBlock(tpl);

      const rendered = withFlights.replace(/\{\{([A-Z_]+)\}\}/g, (m, key) =>
        values[key] !== undefined ? values[key] : m
      );

      // Substitute the price rows of the price-details block with the
      // quote price Gad typed in the Amadeus input ("2000USD" /
      // "2000NIS" / etc.). Runs BEFORE pluralization so the per-pax
      // anchor (" לנוסע" / " per passenger" / " par passager") is
      // still in place for the singular-pax stripping pass to find.
      // No-op when Gad didn't type a price token — the template's
      // "000" placeholder is left untouched. Adult count is used for
      // the per-adult fare math; child / infant rows below carry
      // their own "000" placeholders pending the upcoming per-cat
      // price UI.
      const priced = this.applyPriceFromPnr(rendered, adultCount);

      // Inject child- and infant-pricing rows after the adult block
      // when the PNR carries "(CHD" / "(INF" markers. Each row is
      // gated on its own category count (no row when zero, multi row
      // added when ≥ 2). No-op for adult-only bookings.
      const withCategories = this.applyCategoryRows(priced, paxCategories);

      // Apply singular/plural rules to the price-details +
      // ticket-conditions blocks near the bottom of Gad's Standard
      // Airfare Quote. Adult-row rules react to ADULT count; ticket
      // noun rules ("/ים" / "(s)" / article pairs) react to TOTAL
      // ticket count.
      const pluralized = this.applyPluralization(
        withCategories,
        adultCount,
        paxCount
      );

      // Inject the visa-requirements block right before the signature when
      // the toggle is on. Done AFTER value substitution so the block can
      // splice into the final message (the rest of the engine is
      // strip-based; this one is the opposite).
      return this.injectVisaBlock(pluralized, parsedFlights, langKey);
    },
    // Builds the "🛂 מסמכי כניסה נדרשים" block from the parsed PNR.
    // Returns empty string when the toggle is off or no destination on the
    // trip requires anything (in which case the caller skips injection).
    computeVisaBlock(flights, langKey) {
      if (!this.sectionToggles || this.sectionToggles.visa_requirements !== true) return "";
      if (!Array.isArray(flights) || !flights.length) return "";

      // Hours from this flight's arrival to the next flight's departure.
      // The last leg returns Infinity (no "next flight"), which the
      // resolver treats as a real stay (above the short-transit threshold).
      const hoursAtStop = (i) => {
        const cur = flights[i];
        const next = flights[i + 1];
        if (!next) return Infinity;
        const diff = this.getHourDifference(cur, next);
        // getHourDifference returns negative when the months wrap awkwardly;
        // treat any non-positive value as "long enough to count as a stay".
        return diff > 0 ? diff : Infinity;
      };

      const entries = resolveVisaForFlights(
        flights,
        langKey,
        getCountryCode,
        hoursAtStop
      );
      if (!entries.length) return "";

      // Alias the parameter so the per-language lookups below read more
      // naturally — `lang` was the original variable name and got dropped
      // during a refactor, leaving an undefined-variable ReferenceError
      // that bubbled up to the renderer and produced an empty preview
      // any time the visa toggle was on.
      const lang = langKey;
      const headers = {
        he: "🛂 *מסמכי כניסה נדרשים*",
        en: "🛂 *Entry Documents Required*",
        fr: "🛂 *Documents d'entrée requis*"
      };
      const verifyTag = {
        he: "⚠️ לבדיקה",
        en: "⚠️ Verify",
        fr: "⚠️ À vérifier"
      };
      // RTL-aware arrow: WhatsApp's bidi puts the URL (LTR run) on the
      // visual LEFT of the line in Hebrew, so the arrow visually ends up
      // on the right. Switching to 👈 makes it point toward the URL.
      // English/French keep the right-pointing 👉.
      const urlArrow = lang === "he" ? "👈" : "👉";
      const lines = [headers[lang] || headers.he, ""];
      for (const e of entries) {
        const { country, status } = e;
        const flag = country.flag;
        const name = (country.name && (country.name[lang] || country.name.he)) || e.code;
        const title = (country.title && (country.title[lang] || country.title.he)) || "";
        const desc = (country.description && (country.description[lang] || country.description.he)) || "";
        const head = status === "VERIFY"
          ? `${flag} *${name}* - ${verifyTag[lang] || verifyTag.he}`
          : `${flag} *${name}* - ${title}`;
        lines.push(head);
        if (desc) lines.push(desc);
        if (country.url) lines.push(`${urlArrow} ${country.url}`);
        lines.push("");
      }
      // Trim a trailing blank, return.
      while (lines.length && lines[lines.length - 1] === "") lines.pop();
      return lines.join("\n");
    },
    // Splices the visa block into the rendered message right before the
    // signature ("תודה רבה,"/"Thank you very much"/"Merci beaucoup,").
    // No-op when the block is empty or the signature anchor isn't found.
    injectVisaBlock(text, flights, langKey) {
      const block = this.computeVisaBlock(flights, langKey);
      if (!block) return text;
      const anchors = {
        he: /(\n+)(תודה רבה,)/u,
        en: /(\n+)(Thank you very much)/u,
        fr: /(\n+)(Merci beaucoup,)/u
      };
      const re = anchors[langKey] || anchors.he;
      if (!re.test(text)) return text;
      return text.replace(re, `\n\n${block}\n\n$2`);
    },
    expandFlightBlock(tpl) {
      const hasPerFlightKey = FLIGHT_ITEM_KEYS.some(k =>
        tpl.includes(`{{${k}}}`)
      );
      if (!hasPerFlightKey) return tpl;

      const flights = this.getParsedFlights();
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

      // Distribute flights to blocks BY DIRECTION (not by index):
      // - First block = all outbound flights
      // - Second block = all inbound flights
      // - If template has only 1 block, everything goes there
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
              .map(f => this.renderFlightBlock(s.lines.join("\n"), f))
              .join("\n\n")
          );
        }
      }
      return out.join("\n");
    },
    // Resolves the {{CLASS_LINE}} placeholder — the single emoji+class line
    // that lives under the "Class of Travel" header. Spacing between emoji
    // and asterisks is preserved verbatim from the source templates (Gad
    // wrote them with intentional per-cabin variation).
    //
    // When the overall classOfTravel comes back as "combined compartment"
    // (mixed cabins across the PNR) or as something we don't have a styled
    // line for, we emit just the bold label with no emoji.
    classLineFor(classOfTravel, langKey) {
      const lang = langKey || this.selectedLang || "en";
      const STYLED = {
        he: {
          "First Cl.":       "🥇 *מחלקה ראשונה*",
          "Business Cl.":    "👔 *מחלקת עסקים*",
          "Premium Eco Cl.": "🥂*מחלקת פרמיום*",
          "Economy Cl.":     "💺*מחלקת תיירים*"
        },
        en: {
          "First Cl.":       "🥇 *First Class*",
          "Business Cl.":    "👔 *Business Class*",
          "Premium Eco Cl.": "🥂*Premium Eco.*",
          "Economy Cl.":     "💺*Economy Class*"
        },
        fr: {
          "First Cl.":       "🥇 *Cl. Première*",
          "Business Cl.":    "👔 *Cl. Affaire*",
          "Premium Eco Cl.": "🥂 *Cl. Premium Eco*",
          "Economy Cl.":     "💺 *Cl. Économique*"
        }
      };
      const styled = (STYLED[lang] || STYLED.en)[classOfTravel];
      if (styled) return styled;
      const fallback = this.$t(classOfTravel || "");
      return fallback ? `*${fallback}*` : "";
    },
    // Per-flight class label. Prefixed with the cabin's emoji so the line
    // reads "👔 מחלקת עסקים" (Business), "💺 מחלקת תיירים" (Economy), etc.
    // Icons match what `classLineFor` uses for the global {{CLASS_LINE}}
    // so the visual language stays consistent between the per-flight rows
    // and the summary "Class of Travel" block.
    //
    // When the parser couldn't resolve the RBD letter to a cabin (airline
    // not in AIRLINE_RBD, letter not listed, charter PNR, or anything else
    // returning null), we fall back to the original
    // "Economy/Premium/Business Class" placeholder — no emoji, because
    // there's no specific cabin to brand it with.
    flightClassDisplay(flightClass) {
      if (flightClass) {
        const CLASS_ICONS = {
          "First Cl.": "🥇",
          "Business Cl.": "👔",
          "Premium Eco Cl.": "🥂",
          "Economy Cl.": "💺"
        };
        const label = this.$t(flightClass);
        const icon = CLASS_ICONS[flightClass];
        return icon ? `${icon} ${label}` : label;
      }
      if (this.selectedLang === "he") return "מחלקת תיירים/עסקים/פרמיום";
      if (this.selectedLang === "fr") return "Classe Économique/Premium/Affaires";
      return "Economy/Premium/Business Class";
    },
    // Returns the meal-line suffix for a single flight — empty when the
    // flight has no SSR meal code, "\n🍽️ <localized name> ✅" when it does.
    // The leading newline lands the meal on a separate line inside the
    // per-flight block, immediately under the seat-type line.
    flightMealSuffix(f, lang) {
      if (!f || !f.meal) return "";
      const name = getLocalizedMealName(f.meal, lang);
      if (!name) return "";
      return "\n🍽️ " + name + " ✅";
    },
    // Returns the wheelchair-line suffix for a single flight — empty when
    // the flight has no SSR WCHR/WCHS/WCHC, "\n👩‍🦽 <label> ✅" when it
    // does. Plain text (no bold) per Gad's spec; the ✅ alone signals that
    // assistance is included.
    flightWheelchairSuffix(f, lang) {
      if (!f || !f.wheelchair) return "";
      const labels = {
        he: "כיסא גלגלים",
        en: "Wheelchair assistance",
        fr: "Assistance fauteuil roulant"
      };
      const label = labels[lang] || labels.en;
      return "\n👩‍🦽 " + label + " ✅";
    },
    // Returns the single icon representing the passenger group size in the
    // quote intro line:
    //   0 / 1 → 👤  (one silhouette)
    //   2     → 👥  (two silhouettes)
    //   3+    → 👨‍👩‍👧‍👦  (family ZWJ sequence — agreed group icon)
    // Driven by the count of travelers the form ended up with, which lines
    // up with the PNR's passenger list after parseAmadeusNames + the form
    // is filled. Language-agnostic — same icons everywhere.
    travelersIconFor(count) {
      const n = Number(count) || 0;
      if (n <= 1) return "👤";
      if (n === 2) return "👥";
      return "👨‍👩‍👧‍👦";
    },
    // Returns the part of a full name before the first whitespace, i.e.
    // the first name. Handles edge cases:
    //   - empty / falsy input → ""
    //   - single-word name (no space) → the whole name
    //   - leading whitespace → trimmed first, then split
    // Used to extract the addressable first name from a traveler's
    // possibly-translated "First Last" string for the intro line.
    firstNameOf(fullName) {
      const trimmed = String(fullName || "").trim();
      if (!trimmed) return "";
      const spaceIdx = trimmed.indexOf(" ");
      return spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
    },
    // Comma-separated first names for every traveler in `this.data.travelers`,
    // in the same language as the rest of the message (the name field has
    // already been translated by translateNamesViaProxy or fallen back to
    // the original PNR names on API failure). Empty travelers and travelers
    // with empty names are filtered out so a stray blank row in the form
    // doesn't produce a dangling ", ".
    travelerFirstNames() {
      const travelers = Array.isArray(this.data.travelers) ? this.data.travelers : [];
      return travelers
        .map(t => this.firstNameOf(t && t.name))
        .filter(Boolean)
        .join(", ");
    },
    // Returns the correct possessive form of "trip" for the current
    // language and passenger count:
    //   he: 1 → "נסיעתך"  (singular addressee)
    //       2+ → "נסיעתכם" (plural addressee)
    //   en: always "your trip" — English doesn't mark grammatical number
    //       on "you" / "your", so one form covers both cases.
    //   fr: always "votre voyage" — Gad's templates use the formal
    //       "votre" everywhere (per Gad's preference), no informal
    //       "ton voyage" form needed.
    travelNounFor(count, lang) {
      const n = Number(count) || 0;
      if (lang === "he") return n <= 1 ? "נסיעתך" : "נסיעתכם";
      if (lang === "fr") return "votre voyage";
      return "your trip";
    },
    // Returns just the singular/plural "ticket" word — no fare clause.
    // Used by the secondary confirm-issuance sentence Gad has near the
    // bottom of his template ("נא השב … להנפקת כרטיסך/סיכם …"). HE only
    // for now — Gad's en/fr templates don't carry the equivalent sentence
    // structure (or they do but we haven't seen it yet), so they fall
    // back to a fixed form that won't break if the placeholder is unused.
    ticketWordFor(count, lang) {
      const isSingular = (Number(count) || 0) <= 1;
      if (lang === "he") return isSingular ? "כרטיסך" : "כרטיסכם";
      if (lang === "fr") return isSingular ? "votre billet" : "vos billets";
      return isSingular ? "your ticket" : "your tickets";
    },
    // Resolves the pax count to use for singular/plural decisions and
    // per-pax icon rendering. Prefers what's in the form (typed names,
    // or a multi-row travelers array) because that's a positive signal
    // the agent already curated the list. Falls back to the HK<N>
    // count from the first PNR flight segment when the form is still
    // at its default "1 empty row" state — covers the common case
    // where Gad pastes a PNR with only flight segments and no name
    // section ("HK2" / "HK3" in the segment line is the booking's
    // real pax count).
    getEffectivePaxCount(parsedFlights) {
      const list = this.data.travelers || [];
      const hasRealName = list.some(
        t => t && String(t.name || "").trim()
      );
      if (hasRealName || list.length > 1) return list.length;
      const first = parsedFlights && parsedFlights[0];
      if (first && first.paxCount > 0) return first.paxCount;
      return list.length || 1;
    },
    // Pax-category detector. Scans the raw Amadeus text for the
    // standard markers Amadeus emits next to a name when the booking
    // includes a child or an infant:
    //   - "(CHD/..." — the passenger on that line IS a child (its own
    //     seat, separate ticket, child fare).
    //   - "(INF/..." — that adult is travelling with a lap infant (no
    //     seat of its own, listed as an SSR attached to the parent).
    // Returns counts so the price block can append a per-category row
    // for each present category. Case insensitive on the marker so
    // ad-hoc lowercase Gad sometimes types still gets picked up.
    parsePaxCategories(rawPnr) {
      const text = String(rawPnr || "");
      const children = (text.match(/\(CHD\b/gi) || []).length;
      const infants = (text.match(/\(INF\b/gi) || []).length;
      return { children, infants };
    },
    // Builds a single child- or infant-pricing row matching Gad's
    // existing adult-row formatting per language. ALWAYS emits the
    // category qualifier (" לילד" / " per child" / " par enfant", and
    // the same shape for infants) — unlike the adult per-pax row
    // (which can safely drop " לנוסע" when there's only one adult
    // because the row's identity is then clear from context),
    // child/infant rows must keep the qualifier so 1 child + 1
    // infant don't render as two indistinguishable "000 דולר**"
    // lines. Multi-pax rows use the category-specific plural
    // (ילדים / children / enfants — תינוקות / infants / bébés) so
    // they never collide with the adult-row patterns downstream
    // (those anchor on "נוסעים" / "passengers" / "passagers").
    buildCategoryRow(category, type, count, lang) {
      const arrow = lang === "he" ? "👈" : "👉";
      const indent = "   ";
      if (lang === "he") {
        const sing = category === "child" ? "ילד" : "תינוק";
        const plur = category === "child" ? "ילדים" : "תינוקות";
        if (type === "per") {
          return `${indent}${arrow}*000 דולר ל${sing}**`;
        }
        return `${indent}${arrow}*000 דולר ${count}x ${plur}**`;
      }
      if (lang === "en") {
        const sing = category === "child" ? "child" : "infant";
        const plur = category === "child" ? "children" : "infants";
        if (type === "per") {
          return `${indent}${arrow}*USD 000 per ${sing}**`;
        }
        return `${indent}${arrow}*USD 000 for ${count}x ${plur}**`;
      }
      if (lang === "fr") {
        const sing = category === "child" ? "enfant" : "bébé";
        const plur = category === "child" ? "enfants" : "bébés";
        if (type === "per") {
          return `${indent}${arrow}*000 USD par ${sing}**`;
        }
        return `${indent}${arrow}*000 USD ${count}x ${plur}**`;
      }
      return "";
    },
    // Assembles all the new category rows that should follow the
    // adult block, in canonical industry order (adult → child →
    // infant). Per-pax row is added when count ≥ 1; the multi row
    // is added in addition when count ≥ 2 (same gating as the adult
    // section uses). Returns a string that starts with a leading
    // newline so it splices cleanly onto the end of the adult
    // multi-pax line, or "" when nothing to add.
    buildCategoryRows(categories, lang) {
      const rows = [];
      if (categories.children >= 1) {
        rows.push(
          this.buildCategoryRow("child", "per", categories.children, lang)
        );
        if (categories.children >= 2) {
          rows.push(
            this.buildCategoryRow(
              "child",
              "multi",
              categories.children,
              lang
            )
          );
        }
      }
      if (categories.infants >= 1) {
        rows.push(
          this.buildCategoryRow("infant", "per", categories.infants, lang)
        );
        if (categories.infants >= 2) {
          rows.push(
            this.buildCategoryRow(
              "infant",
              "multi",
              categories.infants,
              lang
            )
          );
        }
      }
      return rows.length ? "\n" + rows.join("\n") : "";
    },
    // Injects the child/infant rows after the adult multi-pax row in
    // the price-details block. Runs AFTER applyPriceFromPnr so the
    // adult row is already its final form (real amount, real count)
    // and BEFORE applyPluralization so the adult-singular cleanup
    // (strip " לנוסע", drop the "Nx נוסעים" row when adults == 1)
    // runs unchanged on the substituted text. No-op when neither
    // category is present.
    applyCategoryRows(text, categories) {
      const lang = this.selectedLang;
      if (!text) return text;
      if (categories.children === 0 && categories.infants === 0) {
        return text;
      }
      const newRows = this.buildCategoryRows(categories, lang);
      if (!newRows) return text;
      if (lang === "he") {
        return text.replace(
          /(👈\*\d+\s+\S+\s+\d+x נוסעים\*\*)/,
          `$1${newRows}`
        );
      }
      if (lang === "en") {
        return text.replace(
          /((?:👈|👉)\*\S+\s+\d+\s+for\s+\d+x\s+passengers\*\*)/i,
          `$1${newRows}`
        );
      }
      if (lang === "fr") {
        return text.replace(
          /((?:👈|👉)\*\d+\s+\S+\s+\d+x\s+passagers\*\*)/i,
          `$1${newRows}`
        );
      }
      return text;
    },
    // Quote-price parser. Looks at the raw Amadeus text for a token
    // like "2000USD" / "2000 usd" / "2000NIS" — Gad types this inline
    // when he wants the standard quote to show a real fare instead of
    // the literal "000" placeholder he left in his template. Case
    // insensitive; first match wins (he's expected to type one price
    // per booking). Returns null when no token is found so the caller
    // can skip the substitution entirely (leaving Gad's "000" in
    // place is the right fallback — the agent will fill it in by
    // hand the way he always has).
    parseQuotePrice(rawPnr) {
      if (!rawPnr) return null;
      const m = String(rawPnr).match(/\b(\d+)\s*(USD|NIS|EUR)\b/i);
      if (!m) return null;
      return {
        amount: parseInt(m[1], 10),
        currency: m[2].toUpperCase()
      };
    },
    // Localized currency token used inside the rendered quote lines.
    // Hebrew uses the full word, English keeps the ISO code (Gad's
    // template already reads "USD 000"), French uses the symbol (his
    // template reads "000 $"). Falls back to the raw ISO code when
    // the currency is one we haven't mapped yet so a new currency
    // still renders something usable instead of breaking.
    currencyWord(currency, lang) {
      const map = {
        USD: { he: "דולר", en: "USD", fr: "$" },
        NIS: { he: "שקל", en: "NIS", fr: "₪" },
        EUR: { he: "אירו", en: "EUR", fr: "€" }
      };
      return (map[currency] && map[currency][lang]) || currency;
    },
    // Inserts Gad's quote price into the per-pax and multi-pax rows of
    // the price-details block. Runs BEFORE applyPluralization so the
    // singular/plural pass downstream still has its anchors in place
    // ("לנוסע" / "per passenger" / "par passager") on the per-pax row.
    //
    // No-op when:
    //   - Gad didn't type a price token in the Amadeus input — we
    //     leave his "000" placeholder alone (manual fill, same as
    //     before this feature existed).
    //   - Neither row is present in the template — match fails
    //     silently.
    //
    // For 1 pax, the multi-pax row gets substituted here too even
    // though pluralization will then strip it — the substitution is
    // cheap and keeps the logic uniform regardless of count.
    applyPriceFromPnr(text, adultCount) {
      if (!text) return text;
      const price = this.parseQuotePrice(
        this.data.smartAmadeusCode || ""
      );
      if (!price) return text;
      const lang = this.selectedLang;
      const word = this.currencyWord(price.currency, lang);
      const perPax = price.amount;
      // Adult-row total uses the ADULT headcount (children + infants
      // have their own rows downstream, computed independently of the
      // adult fare). When there's only 1 adult, the multi-pax row
      // gets substituted here anyway — pluralization will then drop
      // the line, keeping the logic uniform regardless of count.
      const count = Math.max(Number(adultCount) || 1, 1);
      const total = perPax * count;
      let out = text;

      if (lang === "he") {
        // Per-pax row — "👈*<num> <currency> לנוסע**". Currency token
        // is whatever Gad wrote in the template (his stock is "דולר");
        // we replace it with the language-correct word for the price
        // he typed in the Amadeus, even if those differ ("2000NIS" in
        // a template that read "דולר" → renders "2000 שקל").
        out = out.replace(
          /👈\*\d+\s+\S+\s+לנוסע\*\*/g,
          `👈*${perPax} ${word} לנוסע**`
        );
        // Multi-pax row — same structure with the "Nx נוסעים" tail.
        out = out.replace(
          /👈\*\d+\s+\S+\s+\d+x נוסעים\*\*/g,
          `👈*${total} ${word} ${count}x נוסעים**`
        );
      } else if (lang === "en") {
        // Per-pax row — Gad's EN format is "<currency> <num> per X**".
        // (?:👈|👉) tolerates either pointing direction, alternation
        // (not character class) because the emojis are surrogate
        // pairs.
        out = out.replace(
          /(?:👈|👉)\*\S+\s+\d+\s+per\s+(?:passenger|person|pax)\*\*/gi,
          `👉*${word} ${perPax} per passenger**`
        );
        // Multi-pax row — "<currency> <num> for Nx passengers**".
        out = out.replace(
          /(?:👈|👉)\*\S+\s+\d+\s+for\s+\d+x\s+passengers\*\*/gi,
          `👉*${word} ${total} for ${count}x passengers**`
        );
      } else if (lang === "fr") {
        // Per-pax row — Gad's FR format is "<num> <symbol> par X**".
        out = out.replace(
          /(?:👈|👉)\*\d+\s+\S+\s+par\s+(?:passager|personne)\*\*/gi,
          `👉*${perPax} ${word} par passager**`
        );
        // Multi-pax row — "<num> <symbol> Nx passagers**".
        out = out.replace(
          /(?:👈|👉)\*\d+\s+\S+\s+\d+x\s+passagers\*\*/gi,
          `👉*${total} ${word} ${count}x passagers**`
        );
      }

      return out;
    },
    // Language-aware post-processor that conditions the bottom-of-quote
    // "price details" + "ticket conditions" blocks on the actual
    // passenger count. Runs after the {{...}} substitution so it
    // operates on literal text from Gad's Supabase row (none of the
    // markers it looks for are placeholders).
    //
    // Hebrew rules (Gad's most-edited template):
    //   1. "הכרטיס/ים" → "הכרטיס" (1 pax) | "הכרטיסים" (2+ pax)
    //   2. " לנוסע"    → stripped (1 pax) | kept (2+ pax)
    //   3. "👈*… 2x נוסעים …**" row → line removed (1) | "2x" → real
    //      passenger count (2+).
    //
    // English rules — mirror the Hebrew structure with Gad's EN
    // phrasings:
    //   1. Any "word(s)" → drop "(s)" for 1, append "s" for 2+
    //      (Gad uses "(s)" as the canonical singular/plural marker).
    //   2. " per passenger" → stripped (1) | kept (2+)
    //   3. "👈*… 2x passengers …**" row → line removed (1) | "2x" →
    //      real passenger count (2+).
    //
    // French rules — Gad mixes "(s)" suffixes with article pairs
    // ("du/des", "le/les", "votre/vos", …) so we handle both:
    //   1. Article pairs: take the singular (first) or plural (second)
    //      side of the slash.
    //   2. Any "word(s)" → drop or +s, same as English.
    //   3. " par passager" → stripped (1) | kept (2+)
    //   4. "👈*… 2x passagers …**" row → line removed (1) | "2x" →
    //      real passenger count (2+).
    //
    // Why post-process rather than add placeholders: the rules touch
    // many lines across the quote bottom and are mechanical; routing
    // them through placeholders would force Gad to edit his Supabase
    // row, which the autofill engine deliberately avoids (his
    // authoring conventions stay intact in storage).
    applyPluralization(text, adultCount, paxCount) {
      const lang = this.selectedLang;
      if (!text) return text;
      // Splitting the two counts lets the adult-row rules (per-pax
      // qualifier strip + multi row) react to the ACTUAL adult
      // headcount, while ticket-noun rules (the "/ים" / "(s)" /
      // "du/des" pairs) still react to the total ticketed count
      // (adults + children — infants share an adult's ticket).
      const isAdultSingular = (Number(adultCount) || 0) <= 1;
      const isPaxSingular = (Number(paxCount) || 0) <= 1;
      let out = text;

      if (lang === "he") {
        // Rule 1 — "הכרטיס/ים" → singular/plural noun. Tied to TICKET
        // count (paxCount) since it refers to total tickets issued.
        out = out.replace(
          /הכרטיס\/ים/g,
          isPaxSingular ? "הכרטיס" : "הכרטיסים"
        );

        // Rule 2 — leading-space included so removal collapses both
        // the word AND the spacing in front of it; otherwise a stray
        // space would be left after the price. Tied to ADULT count —
        // this qualifier belongs to the adult per-pax row, which only
        // makes sense when there's 2+ adults.
        if (isAdultSingular) {
          out = out.replace(/ לנוסע/g, "");
        }

        // Rule 3 — multi-pax adult row. Singular drops the line
        // entirely (including its leading indentation and trailing
        // newline); plural substitutes Gad's "2x" placeholder with
        // the real adult count.
        if (isAdultSingular) {
          out = out.replace(
            /^[ \t]*👈\*[^\n]*\d+x נוסעים[^\n]*\n?/gm,
            ""
          );
        } else {
          out = out.replace(
            /\d+x נוסעים/g,
            `${adultCount}x נוסעים`
          );
        }
      } else if (lang === "en") {
        // Rule 1 — generic "(s)" marker. Matches any letter-only word
        // followed by "(s)": "ticket(s)", "passenger(s)", etc. Tied
        // to total ticket count (paxCount), same rationale as the
        // Hebrew "/ים" rule.
        out = out.replace(
          /([A-Za-zÀ-ÿ]+)\(s\)/g,
          isPaxSingular ? "$1" : "$1s"
        );

        // Rule 2 — per-pax qualifier stripped for singular. Gad
        // alternates between " per passenger", " per person", and
        // " per pax" across his EN template, so we accept all three.
        // Tied to ADULT count.
        if (isAdultSingular) {
          out = out.replace(/ per (?:passenger|person|pax)/gi, "");
        }

        // Rule 3 — multi-pax adult row. Same logic as Hebrew but
        // with "passengers" anchor. Gad's EN template uses 👉
        // (right-pointing, natural for LTR) instead of 👈; we accept
        // either via alternation. NOT a character class — emojis are
        // surrogate pairs and `[👈👉]` without the `u` flag would
        // only match a single half, leaving the other half to break
        // the rest of the pattern.
        if (isAdultSingular) {
          out = out.replace(
            /^[ \t]*(?:👈|👉)\*[^\n]*\d+x passengers[^\n]*\n?/gim,
            ""
          );
        } else {
          out = out.replace(
            /\d+x passengers/gi,
            `${adultCount}x passengers`
          );
        }
      } else if (lang === "fr") {
        // Rule 1a — French article pairs Gad writes with a slash in
        // his template ("du/des billet(s)", "votre/vos client(s)",
        // etc.). Tied to total ticket count (paxCount).
        const articlePairs = [
          ["du", "des"],
          ["le", "les"],
          ["la", "les"],
          ["un", "des"],
          ["mon", "mes"],
          ["ton", "tes"],
          ["son", "ses"],
          ["votre", "vos"],
          ["notre", "nos"],
          ["ce", "ces"]
        ];
        for (const [sing, plur] of articlePairs) {
          const re = new RegExp(`\\b${sing}\\/${plur}\\b`, "gi");
          out = out.replace(re, isPaxSingular ? sing : plur);
        }

        // Rule 1b — generic "(s)" marker. Tied to total ticket count.
        // Latin-1 range covers French accented letters (À-ÿ).
        out = out.replace(
          /([A-Za-zÀ-ÿ]+)\(s\)/g,
          isPaxSingular ? "$1" : "$1s"
        );

        // Rule 2 — per-pax qualifier stripped for singular. Same
        // alternation rationale as English: Gad uses both
        // " par passager" and " par personne" in his FR template.
        // Tied to ADULT count.
        if (isAdultSingular) {
          out = out.replace(/ par (?:passager|personne)/gi, "");
        }

        // Rule 3 — multi-pax adult row. Same alternation rationale
        // as English: surrogate-pair emojis must be matched as full
        // literals (not in a character class) so both halves stay
        // together.
        if (isAdultSingular) {
          out = out.replace(
            /^[ \t]*(?:👈|👉)\*[^\n]*\d+x passagers[^\n]*\n?/gim,
            ""
          );
        } else {
          out = out.replace(
            /\d+x passagers/gi,
            `${adultCount}x passagers`
          );
        }
      }

      return out;
    },
    // Returns the full ticket-issuance phrase with the embedded fare
    // clause, matched to the current language and passenger count.
    // Always includes the fare clause — Gad's Standard Airfare Quote
    // assumes the customer is choosing a fare even on single-passenger
    // tickets ("specifying the chosen fare for you"). The plural form
    // shifts the recipient to "כל אחד מהנוסעים" / "each" / "chacun des
    // passagers" depending on language.
    ticketNounFor(count, lang) {
      const isSingular = (Number(count) || 0) <= 1;
      if (lang === "he") {
        return isSingular
          ? "כרטיסך תוך ציון התעריף שנבחר עבורך"
          : "כרטיסכם תוך ציון התעריף שנבחר עבור כל אחד מהנוסעים";
      }
      if (lang === "fr") {
        return isSingular
          ? "votre billet, en précisant le tarif choisi pour vous"
          : "vos billets, en précisant le tarif choisi pour chacun des passagers";
      }
      return isSingular
        ? "your ticket, specifying the chosen fare for you"
        : "your tickets, specifying the chosen fare for each";
    },
    // Returns the seat-label word ("מושב"/"מושבים" / "Seat"/"Seats" /
    // "Siège"/"Sièges") matching the current preview language, with plural
    // form when this flight has 2+ seats. Zero or one seat → singular,
    // which also covers PNRs that didn't include SSR data.
    seatLabelFor(seats) {
      const count = Array.isArray(seats) ? seats.length : 0;
      const lang = this.selectedLang;
      if (lang === "he") return count >= 2 ? "מושבים" : "מושב";
      if (lang === "fr") return count >= 2 ? "Sièges" : "Siège";
      return count >= 2 ? "Seats" : "Seat";
    },
    renderFlightBlock(blockTpl, f) {
      const isHe = this.selectedLang === "he";
      const departCity = isHe
        ? (airports[f.departAirportCode] &&
            airports[f.departAirportCode].CityNameHe) ||
          f.departAirport
        : f.departAirport;
      const destCity = isHe
        ? (airports[f.destAirportCode] &&
            airports[f.destAirportCode].CityNameHe) ||
          f.destAirport
        : f.destAirport;
      // Airline NAME is localized; the FLIGHT_NUMBER (e.g. "LY543") stays
      // verbatim in every language since it's a system identifier.
      const flightAirlineCode = airlineCodeFromFlightNumber(f.flightNumber);
      const localizedAirline = getLocalizedAirlineName(
        flightAirlineCode,
        this.selectedLang,
        f.airline
      );
      const map = {
        FLIGHT_DIRECTION: f.direction || "",
        FLIGHT_AIRLINE: localizedAirline,
        FLIGHT_NUMBER: f.flightNumber || "",
        FLIGHT_ORIGIN_CITY: departCity || "",
        FLIGHT_ORIGIN_CODE: f.departAirportCode || "",
        FLIGHT_DEST_CITY: destCity || "",
        FLIGHT_DEST_CODE: f.destAirportCode || "",
        FLIGHT_DEPART_DAY: this.$t(`${f.departDay}`),
        FLIGHT_DEPART_DATE: f.departDateNumberOnlyStr || "",
        FLIGHT_DEPART_MONTH: this.$t(f.departMonth),
        FLIGHT_DEPART_TIME: f.departTime || "",
        FLIGHT_ARRIVE_DAY: this.$t(`${f.destDay}`),
        FLIGHT_ARRIVE_DATE: f.destDateNumberStr || "",
        FLIGHT_ARRIVE_MONTH: this.$t(f.destMonth),
        FLIGHT_ARRIVE_TIME: f.destTime || "",
        FLIGHT_CLASS: this.flightClassDisplay(f.flightClass),
        // Comma-separated seat list for this flight; falls back to "XX"
        // when the PNR didn't include SSR seat lines, so existing
        // templates with literal "XX" keep their meaning when the
        // {{FLIGHT_SEATS}} placeholder is used in their place.
        FLIGHT_SEATS: (f.seats && f.seats.length) ? f.seats.join(", ") : "XX",
        // Pluralizes the seat label based on how many seats this flight
        // has. Two or more seats → plural form (מושבים / Seats / Sièges).
        // Zero or one → singular. The label is plain text — bold marker
        // (* … *) lives in the surrounding template, not here.
        FLIGHT_SEAT_LABEL: this.seatLabelFor(f.seats),
        // Seat-position suffix — "\nליד החלון, באמצע שורה" for an LY flight
        // with parsed seats, "" for every other case (no SSR data, unmapped
        // airline like IB / LH). The leading "\n" lands the text on the
        // line below the seat numbers exactly as Gad asked, and the empty
        // string for non-LY flights makes the position line disappear
        // entirely rather than leave a blank row.
        FLIGHT_SEAT_TYPES: getSeatTypesSuffix(
          f.seats,
          flightAirlineCode,
          this.selectedLang
        ),
        // Meal + wheelchair suffixes — both return "" when this flight
        // doesn't have a matching SSR, so a flight with neither just
        // renders its seat / seat-type lines unchanged. The leading "\n"
        // inside the value places each line on its own row directly
        // beneath the seat-types line.
        FLIGHT_MEAL: this.flightMealSuffix(f, this.selectedLang),
        FLIGHT_WHEELCHAIR: this.flightWheelchairSuffix(f, this.selectedLang)
      };
      return blockTpl.replace(/\{\{([A-Z_]+)\}\}/g, (m, key) =>
        map[key] !== undefined ? map[key] : m
      );
    },
    getRelevantTxtStructure(part, first, second) {
      if (this.selectedLang === "en") {
        switch (part) {
          case "opening":
            return `${this.$t("flight desc")} ${this.allNamesTxt}\n*${
              this.journeyTxt
            }*\n\n${this.$t("please pay msg")} `;

          default:
            return part;
        }
      } else if (this.selectedLang === "fr") {
        switch (part) {
          case "opening":
            return `${this.$t("flight desc")} *${this.journeyTxt}*${
              this.allNamesTxt ? `\n${this.allNamesTxt}` : ""
            }\n\n${this.$t("please pay msg")} `;

          default:
            return part;
        }
      } else if (this.selectedLang === "he") {
        switch (part) {
          case "opening":
            return `${this.$t("flight desc")} *(👤${this.capitalizeFirstLetter(this.data.travelers[0].name)})* הקרובה ל*${this.journeyTxt}*${
              this.data.travelers.length > 1 ? `\nעם ${this.allNamesTxt}` : ""
            }\n\n${this.$t("please pay msg")}`;
          case "priceDetails":
            return `${this.data.prices.price[first].value}${
              this.selectedCurrency
            } * ${this.travelersTypeAmountMap[first]} ${this.$t(first)}\n`;

          default:
            return part;
        }
      }
    },
    getAmountOfSpecificTraveler(travelerType) {
      return this.data.travelers.filter(tr => tr.type === travelerType).length;
    },
    checkIfDisplay(boxName, item) {
      const tempalteToShow = this.data[boxName][item].templatesToBeDisplayIn;
      if (this.selectedTemplateTab === "All") return true;
      if (!tempalteToShow) return true;
      return tempalteToShow.includes(this.selectedTemplateTab);
    },
    checkIfDisplaySubInput(optionName) {
      switch (optionName) {
        case FAMILY_FARE:
          return this.data.details.airfare.airfare.selected === FAMILY_FARE;
        // * no show
        case NO_SHOW_FEE:
          return (
            this.data.prices["no show"]["no show"].selected === NO_SHOW_FEE ||
            this.data.prices["no show"]["no show"].selected ===
              NO_SHOW_PLUS_CHANGE_FEE
          );
          break;
        case NO_SHOW_PLUS_CHANGE_FEE:
          return (
            this.data.prices["no show"]["no show"].selected ===
            NO_SHOW_PLUS_CHANGE_FEE
          );
          break;
        // * change fee
        case CHANGE_FEE:
          return (
            this.data.prices["Change fees"]["Change fees"].selected ===
              "(+difference in fare)" ||
            this.data.prices["Change fees"]["Change fees"].selected ===
              "Only permitted upon availability on Bonus Quota!"
          );
          break;

        default:
          return true;
      }
    }
  },
  computed: {
    // Optional sections to render as a checkbox panel — empty array (panel
    // hidden) when the currently-selected (lang, category) pair isn't in
    // SECTION_SUPPORT. The panel reads from this list, so adding sections
    // is a one-line registry change in templateAutofill.js.
    availableSections() {
      const cat = this.selectedTemplateCategory;
      const lang = this.selectedLang;
      if (!SECTION_SUPPORT[cat] || !SECTION_SUPPORT[cat][lang]) return [];
      // Filter by category scope. Toggles with `categories: [...]` only
      // appear for listed categories; `notCategories: [...]` hides them for
      // listed categories. This keeps the Standard quote's flat list of
      // toggles unchanged while letting Multi Airfare show its 5 tier
      // toggles plus the shared (preferences / codeshare / mixed-cabin /
      // EL AL Protect / closing) entries.
      return (OPTIONAL_SECTIONS[lang] || []).filter(sec => {
        if (sec.categories && !sec.categories.includes(cat)) return false;
        if (sec.notCategories && sec.notCategories.includes(cat)) return false;
        return true;
      });
    },
    // How many optional sections are currently ON. Shown as a badge in
    // the accordion header so Gad can tell at a glance how customized the
    // current quote is without expanding the list.
    activeSectionsCount() {
      let n = 0;
      for (const sec of this.availableSections) {
        if (this.sectionToggles[sec.key] === true) n++;
      }
      return n;
    },
    // Layout-ready section list with a synthetic group-header row injected
    // before each new `group` boundary. The UI just iterates this and
    // branches on item.type — no `v-for` math in the template, no chance
    // of group dividers landing in the wrong place when sections are
    // reordered in OPTIONAL_SECTIONS.
    groupedSections() {
      const out = [];
      let lastGroup = null;
      for (const sec of this.availableSections) {
        const group = sec.group || null;
        if (group !== lastGroup && group) {
          out.push({ type: "group-header", group });
        }
        lastGroup = group;
        out.push({ type: "item", sec });
      }
      return out;
    },
    // Picker options, ordered:
    //   1. Standard Airfare Quote (custom_mpsx5w8le42j) — pinned to top
    //      with a ⭐ prefix because Gad uses it as his primary template.
    //   2. Flights Only (flights_only) — pinned second, in-code itinerary.
    //   3. Multi Airfare Quote (custom_mp3smmmgw4p5) — pinned third.
    //   4. Everything else (Gad's other Supabase categories) follows.
    //
    // The legacy in-code "Flight Quote" (`flight`) is intentionally
    // hidden from the picker — Gad's Supabase Standard Airfare Quote
    // replaced it as the default. The `flight` template still lives in
    // DEFAULT_TEMPLATES (it's the fallback for languages that haven't
    // adopted the Standard yet), but agents shouldn't reach for it.
    //
    // Each visible entry gets an icon prefix from CATEGORY_ICONS so the
    // dropdown reads at a glance.
    categoryOptions() {
      const lang = this.selectedLang;
      const labelOf = c => {
        // "Flights Only" stays in English across all preview languages.
        // It's an agent-facing UI label, not customer-facing content —
        // Gad referred to it by its English name from day one.
        if (c.key === "flights_only") return "Flights Only";
        return (c.label && (c.label[lang] || c.label.en || c.label.he)) || c.key;
      };
      const HIDDEN = ["flight"];
      const all = [
        ...CATEGORIES
          .filter(c => !HIDDEN.includes(c.key))
          .map(c => ({ value: c.key, label: labelOf(c) })),
        ...(this.availableCustomCategories || []).map(c => ({
          value: c.key,
          label: labelOf(c)
        }))
      ];
      const PINNED = [
        "custom_mpsx5w8le42j",   // ⭐ Standard Airfare Quote — primary
        "flights_only",          // ✈️  Flights Only — in-code itinerary
        "custom_mp3smmmgw4p5"    // 🎫 Multi Airfare Quote (Same flights)
      ];
      // Per-category dropdown icons. ⭐ pulls double duty as both the
      // primary-template marker and Standard's icon. Other Supabase
      // categories Gad adds later fall back to 📋.
      const CATEGORY_ICONS = {
        custom_mpsx5w8le42j: "⭐",
        flights_only: "✈️",
        custom_mp3smmmgw4p5: "🎫"
      };
      const pinned = [];
      const rest = [];
      for (const item of all) {
        if (PINNED.includes(item.value)) pinned.push(item);
        else rest.push(item);
      }
      pinned.sort(
        (a, b) => PINNED.indexOf(a.value) - PINNED.indexOf(b.value)
      );
      const withIcon = item => ({
        ...item,
        label: (CATEGORY_ICONS[item.value] || "📋") + " " + item.label
      });
      return [...pinned.map(withIcon), ...rest.map(withIcon)];
    },
    translateBtnLabel() {
      switch (this.selectedLang) {
        case "he":
          return "תרגם שמות מ-PNR";
        case "fr":
          return "Traduire les noms du PNR";
        default:
          return "Fill names from PNR";
      }
    },
    selectDestinationBtnLabel() {
      return this.$t("select destination");
    },
    studioBtnLabel() {
      return this.selectedLang === "he"
        ? "מצב סוכן"
        : this.selectedLang === "fr"
        ? "Mode agent"
        : "Agent mode";
    },
    extractedDestinations() {
      // Returns unique non-origin airports found in the parsed PNR, ready
      // for the destination-picker dialog. The first flight's origin is treated
      // as "home" and excluded.
      const raw = this.data.smartAmadeusCode || "";
      if (!raw) return [];
      const lines = raw.split("\n").filter(l => this.isFlightLine(l));
      if (!lines.length) return [];
      const codes = [];
      const seen = new Set();
      let originCode = null;
      for (const rawLine of lines) {
        const splitted = this.getSplittedLine(rawLine);
        if (!splitted) continue;
        const f = this.parseFlightLinePure(splitted);
        if (!f) continue;
        if (originCode === null) originCode = f.departAirportCode;
        if (f.destAirportCode && f.destAirportCode !== originCode && !seen.has(f.destAirportCode)) {
          seen.add(f.destAirportCode);
          codes.push(f.destAirportCode);
        }
      }
      const isHe = this.selectedLang === "he";
      return codes.map(code => {
        const meta = airports[code] || {};
        const cityName = isHe
          ? meta.CityNameHe || meta.CityNameEn || code
          : meta.CityNameEn || code;
        const country = meta.CountryNameEn || "";
        return {
          code,
          cityName,
          country,
          flag: flagFromCountry(country)
        };
      });
    },
    copyBtnLabel() {
      switch (this.selectedLang) {
        case "he":
          return "העתק להודעה";
        case "fr":
          return "Copier le message";
        default:
          return "Copy message";
      }
    },
    noNamesFoundMsg() {
      switch (this.selectedLang) {
        case "he":
          return "לא נמצאו שמות בקוד ה-PNR";
        case "fr":
          return "Aucun nom trouvé dans le PNR";
        default:
          return "No names found in PNR";
      }
    },
    translationFailedMsg() {
      switch (this.selectedLang) {
        case "he":
          return "תרגום השמות נכשל — נסה שוב";
        case "fr":
          return "Échec de la traduction des noms";
        default:
          return "Name translation failed";
      }
    },
    missingApiKeyMsg() {
      switch (this.selectedLang) {
        case "he":
          return "חסר מפתח API";
        case "fr":
          return "Clé API manquante";
        default:
          return "Missing API key";
      }
    },
    translatedNamesHeading() {
      switch (this.selectedLang) {
        case "he":
          return "שמות שתורגמו:";
        case "fr":
          return "Noms traduits :";
        default:
          return "Translated names:";
      }
    },
    apiStatusColor() {
      switch (this.apiStatus) {
        case "ok":
          return "positive";
        case "misconfigured":
          return "warning";
        case "offline":
          return "negative";
        default:
          return "grey";
      }
    },
    apiStatusIcon() {
      switch (this.apiStatus) {
        case "ok":
          return "check_circle";
        case "misconfigured":
          return "warning";
        case "offline":
          return "error";
        default:
          return "hourglass_empty";
      }
    },
    apiStatusLabel() {
      const isHe = this.selectedLang === "he";
      const isFr = this.selectedLang === "fr";
      switch (this.apiStatus) {
        case "ok":
          return isHe ? "API פעיל" : isFr ? "API actif" : "API online";
        case "misconfigured":
          return isHe
            ? "API פעיל, OpenAI לא מוגדר"
            : isFr
            ? "API actif, OpenAI non configuré"
            : "API online, OpenAI not configured";
        case "offline":
          return isHe ? "API לא זמין" : isFr ? "API hors ligne" : "API offline";
        default:
          return isHe ? "בודק..." : isFr ? "Vérification..." : "Checking...";
      }
    },
    advancedOptionsLabel() {
      // Always English regardless of preview language — the section options
      // bar is part of the agent's UI chrome, not the customer-facing text.
      // Locking it to English keeps the form layout / muscle memory stable
      // when Gad switches preview language between he / en / fr.
      return "More options (optional)";
    },
    selectedCurrency() {
      return this.data.prices.currency.currency.selected;
    },
    previewContactName() {
      const name = (this.data.travelers[0] && this.data.travelers[0].name) || "";
      return name.trim() || (this.selectedLang === "he" ? "לקוח" : "Customer");
    },
    // Compact, read-only flight facts handed to the Specials agent as context.
    // The agent never edits these — they live in the locked flight block — but
    // seeing them helps it phrase the wrapper correctly.
    flightSummaryForAgent() {
      try {
        const flights = this.getParsedFlights();
        if (!flights || !flights.length) return "";
        return flights
          .map(f => {
            const dir = f.direction ? `${f.direction}: ` : "";
            return `${dir}${f.airline} ${f.flightNumber} ${f.departAirportCode}→${f.destAirportCode} ${f.departDay || ""} ${f.departDateNumberOnlyStr || ""} ${f.departMonth || ""} ${f.departTime || ""}`.trim();
          })
          .join("\n");
      } catch (e) {
        return "";
      }
    },
    travelersTypeAmountMap() {
      let travelersTypeAmountMap = {};
      this.data.travelers.forEach(traveler => {
        if (travelersTypeAmountMap[traveler.type])
          ++travelersTypeAmountMap[traveler.type];
        else travelersTypeAmountMap[traveler.type] = 1;
      });
      return travelersTypeAmountMap;
    },
    totalPrice() {
      let total = 0;
      for (const key in this.travelersTypeAmountMap) {
        total +=
          this.travelersTypeAmountMap[key] * this.data.prices.price[key].value;
      }
      return total;
    },
    noShowValue() {
      const noShowSelection = this.data.prices["no show"]["no show"].selected;
      switch (noShowSelection) {
        case "total loss":
          return this.$t("total loss");
        case NO_SHOW_FEE:
          return this.data.prices["no show"][NO_SHOW_FEE].value;
        case NO_SHOW_PLUS_CHANGE_FEE:
          const noShowFee = this.data.prices["no show"][NO_SHOW_FEE].value;
          const changeFee = this.data.prices["no show"][NO_SHOW_PLUS_CHANGE_FEE]
            .value;
          return `${noShowFee}${this.selectedCurrency} + ${this.$t(
            "change fee"
          )}: ${changeFee}${this.selectedCurrency}`;

        default:
          return `0${this.selectedCurrency}`;
          break;
      }
    },
    changeFeeValue() {
      const changeFeeSelection = this.data.prices["Change fees"]["Change fees"]
        .selected;
      const changeFeeValue = this.data.prices["Change fees"][CHANGE_FEE].value;
      switch (changeFeeSelection) {
        case "Non Changeable":
          return this.$t("Non Changeable");
        case "Non Refundable":
          return this.$t("Non Refundable");
        case "(+difference in fare)":
          return `${changeFeeValue}${this.selectedCurrency}\n       ${this.$t(
            "(+difference in fare)"
          )}`;
        case "Only permitted upon availability on Bonus Quota!":
          return `${changeFeeValue}${this.selectedCurrency}\n       ${this.$t(
            "Only permitted upon availability on Bonus Quota!"
          )}`;

        default:
          return `0${this.selectedCurrency}`;
          break;
      }
    },
    baggageList() {
      var sep = this.$i18n.locale === "he" ? "\n" : "\n ";
      var prefix = this.$i18n.locale === "he" ? "\n✅ " : "\n ";
      return (
        prefix +
        this.data.details.baggage.baggage.selected
          .map(baggage => this.$t(baggage))
          .join(this.$i18n.locale === "he" ? "\n✅ " : ",\n ")
      );
    },
    priceDetails() {
      let priceTxt = ``;
      for (const key in this.travelersTypeAmountMap) {
        if (this.$i18n.locale === "he") {
          var count = this.travelersTypeAmountMap[key];
          priceTxt += `👈 *${this.data.prices.price[key].value}${this.selectedCurrency} ${this.$t(key)}${count > 1 ? ' x' + count : ''}*\n`;
        } else {
          priceTxt += `  ${this.travelersTypeAmountMap[key]} ${this.$t(
            key
          )} * ${this.data.prices.price[key].value}${this.selectedCurrency} \n`;
        }
      }
      priceTxt += `\n*${this.$t("total")}* ${this.totalPrice}${
        this.selectedCurrency
      }`;
      return priceTxt;
    },
    mealTxt() {
      const selectedMeals = this.data.details.food.food.selected;
      if (!selectedMeals.length) return "";
      else
        return `\n✅${this.$t("meal")} 🍴 ${selectedMeals.map(
          meal => `\n${this.$t(meal)}`
        )}\n`;
    },
    allNamesTxt() {
      // your upcoming flight
      let txt = "";
      if (this.$i18n.locale === "en") {
        txt = `${this.$t("your")}`;
        if (this.data.travelers.length === 1) txt += "s ";
        else {
          this.data.travelers.forEach((traveler, idx) => {
            if (idx === 0) return;
            // * first traveler is the the "your" above
            txt += " & " + this.capitalizeFirstLetter(traveler.name);
          });
          txt = `*${txt}\'s* `;
        }
        return txt + this.$t("upcoming trip to");
      } else if (this.$i18n.locale === "fr") {
        this.data.travelers.forEach((traveler, idx) => {
          if (idx === 0) return;
          if (idx === 1) {
            txt += `accompagné de *${this.capitalizeFirstLetter(
              traveler.name
            )}*`;
          } else {
            // * & will added form the second and so
            txt += " *& " + this.capitalizeFirstLetter(traveler.name) + "*";
          }
        });
        return txt;
      } else if (this.$i18n.locale === "he") {
        this.data.travelers.forEach((traveler, idx) => {
          if (idx === 0) return;
          // * first traveler is the the "your" above
          txt += `${this.capitalizeFirstLetter(traveler.name)}${
            idx < this.data.travelers.length - 1 ? " & " : ""
          }`;
        });
        txt = `*${txt}* `;
        return txt;
      }
    },
    journeyTxt() {
      let txt = "";
      let uniqeDestinations;
      uniqeDestinations = this.data.journey.filter(
        (item, idx, array) =>
          this.firstDepart !== item && array.indexOf(item) === idx
      );

      uniqeDestinations.forEach((place, idx) => {
        var name = place;
        if (this.$i18n.locale === "he" && this.data.journeyCodes && this.data.journeyCodes[place]) {
          var code = this.data.journeyCodes[place];
          if (airports[code] && airports[code].CityNameHe) {
            name = airports[code].CityNameHe;
          }
        } else {
          name = this.$t(place);
        }
        txt += `${name}${
          idx < uniqeDestinations.length - 1 ? ", " : ""
        }`;
      });
      return txt;
    },
    airfareTxt() {
      if (this.data.details.airfare.airfare.selected === "Family fare") {
        let introFamilyFareTxt = `${this.$t(FAMILY_FARE)}`,
          optionsFamilyFareTxt = ``,
          fareDetailsTxt = ``;
        this.data.details.airfare[FAMILY_FARE].selected.forEach(
          (option, idx) => {
            optionsFamilyFareTxt += `${idx + 1}. ${this.$t(
              `option-${option}`
            )}`;
            fareDetailsTxt += `\n${this.$t(option)}\n`;
          }
        );
        if (this.$i18n.locale === "he") {
          return introFamilyFareTxt + fareDetailsTxt;
        } else {
          return (
            introFamilyFareTxt +
            optionsFamilyFareTxt +
            fareDetailsTxt +
            `\n${this.$t("attention")} \n${this.$t(
              "price may change"
            )} \n\n⚠️${this.$t("restrictions")}⚠️\n${this.$t("change")} ${
              this.changeFeeValue
            } ${this.$t("p. p.")} \n${this.$t("cancel")} ${
              this.data.prices["cancel fee"].cancelFee.value
            }${this.selectedCurrency} ${this.$t("p. p.")} \n${this.$t(
              "no show"
            )} ${this.noShowValue} ${this.$t("p. p.")} \n*${this.$t(
              "ticket issuance"
            )}:*\n      *${this.$t(
              this.data.prices["​ticket issuance"]["​ticket issuance"].selected
            )}* \n${this.$t("p. p. = per person")}`
          );
        }
      } else {
        return this.priceDetails;
      }
    },
    priceExplanationTxt() {
      return `${this.$t("trip explanation 1")} ${
        this.data.prices["multi tickets"].numOfTicketOptions.value
      } ${this.$t("trip explanation 2")}`;
    },
    ticketingOptionsTxt() {
      let txt = "";
      const numOfTicketingOptions = this.data.prices["multi tickets"]
        .numOfTicketOptions.value;
      for (let num = 0; num < numOfTicketingOptions; num++) {
        if (this.$i18n.locale === "he") {
          // ! check why not showen order
          txt += `*כרטיס ${this.$t(ORDER[num])}*: ${this.$t(
            "ticket option details"
          )}\n`;
        } else {
          txt += `*${this.$t(ORDER[num])} ${this.$t(
            "ticket option details"
          )} \n`;
        }
      }
      return txt;
    }
  },
  watch: {
    selectedLang: {
      handler(lang) {
        this.$i18n.locale = lang;
        // Restore the picker + section state for this language. Same flow
        // mounted() uses — keeps each (lang, category) pair independent so
        // switching languages doesn't bleed Hebrew's toggle choices into EN.
        this.selectedTemplateCategory = this.loadPickerChoice(lang);
        this.sectionToggles = this.loadSectionToggles(
          lang,
          this.selectedTemplateCategory
        );
        if (this.tab === 'preview') {
          this.onPreview();
        }
      },
      immediate: true
    },
    tab(newTab) {
      if (newTab === 'preview') {
        this.onPreview();
      }
    },
    selectedTemplateCategory() {
      if (this.tab === 'preview') {
        this.onPreview();
      }
    },
    // Multi Airfare Eco-Lite cross-reference notice. The EL AL Protect
    // block lists "the Eco-Lite fare does not entitle..." as one of its
    // bullet points; that bullet only makes sense while Eco-Lite is part
    // of the offer. When the user disables Eco-Lite, surface a one-shot
    // toast so they can decide whether to also disable EL AL Protect (or
    // keep it for the other two tiers). We never auto-hide either — the
    // user owns the final composition.
    "sectionToggles.tier_eco_lite"(newVal, oldVal) {
      if (
        oldVal === true &&
        newVal === false &&
        this.sectionToggles.addon_elal_protect === true
      ) {
        const messages = {
          he: "אקו-לייט הוסר. שים לב: בלוק אלעל פרוטקט עדיין מזכיר אותו — שקול להסתיר אותו ידנית אם לא רלוונטי.",
          en: "Eco-Lite removed. Note: the EL AL Protect block still references it — consider hiding it manually if no longer relevant.",
          fr: "Eco-Lite retiré. Note : le bloc EL AL Protect le mentionne encore — pensez à le masquer manuellement s'il n'est plus pertinent."
        };
        this.$q.notify({
          type: "info",
          message: messages[this.selectedLang] || messages.en,
          position: "top",
          timeout: 6000,
          actions: [{ label: "OK", color: "white" }]
        });
      }
    },
    "data.travelers": {
      handler(travelers) {
        for (const key in this.data.prices.price) {
          if (travelers.filter(traveler => traveler.type === key).length) {
            this.data.prices.price[key].hide = false;
          } else this.data.prices.price[key].hide = true;
        }
      },
      deep: true,
      immediate: true
    },
    selectedTemplateTab(tab) {
      if (tab === "Family fare") {
        this.data.details.airfare.airfare.selected = "Family fare";
      } else this.data.details.airfare.airfare.selected = "";
      if (tab === "Multi tickets") {
        this.data.prices["multi tickets"].numOfTicketOptions.value = 1;
      } else this.data.prices["multi tickets"].numOfTicketOptions.value = 0;
    },
    darkMode: {
      handler(state) {
        this.$q.dark.set(state);
        LocalStorage.set("darkMode", state);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
$font-stack: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
  'Helvetica Neue', Arial, sans-serif;

.page-wrapper {
  padding-top: 130px;
  padding-bottom: 32px;
  min-height: 100vh;
  background: #f5f7fa;
  font-family: $font-stack;
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body.body--dark .page-wrapper {
  background: #121212;
}

/* Header */
.modern-header {
  background:
    radial-gradient(1200px 300px at 10% -10%, rgba(99, 153, 255, 0.25), transparent 60%),
    radial-gradient(900px 240px at 110% 0%, rgba(255, 180, 120, 0.15), transparent 55%),
    linear-gradient(180deg, #0b1730 0%, #0a1226 100%);
  box-shadow: 0 4px 24px rgba(6, 15, 35, 0.35);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: saturate(140%) blur(8px);
}

.toolbar-main {
  padding: 10px 18px 6px;
  min-height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #0ea5e9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.15) inset,
    0 8px 20px rgba(59, 130, 246, 0.35);
  flex-shrink: 0;
}

.brand-mark-inner {
  font-family: $font-stack;
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.5px;
}

.brand-text { line-height: 1.1; min-width: 0; }

.brand-title {
  font-family: $font-stack;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-subtitle {
  font-family: $font-stack;
  color: rgba(255, 255, 255, 0.58);
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-top: 2px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px !important;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.16);
}

/* Pill tabs */
.header-tabs-wrap {
  display: flex;
  justify-content: center;
  padding: 0 16px 12px;
}

.header-tabs-pill {
  display: inline-flex;
  gap: 2px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  backdrop-filter: blur(6px);
}

.pill-tab {
  font-family: $font-stack;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 18px;
  border-radius: 999px;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, transform 0.1s ease;
}

.pill-tab:hover { color: #fff; }

.pill-tab.active {
  background: linear-gradient(180deg, #ffffff, #eef2ff);
  color: #0b1730;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.pill-tab:active { transform: scale(0.97); }

.pill-tab-icon {
  font-size: 14px;
  line-height: 1;
}

/* Content */
.content-area {
  max-width: 640px;
  margin: 0 auto;
  padding: 20px 16px;
  width: 100%;
  box-sizing: border-box;
}

/* Section Cards */
.section-card {
  background: white;
  border-radius: 14px;
  margin-bottom: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

body.body--dark .section-card {
  background: #1e1e1e;
}

.section-header {
  padding: 14px 18px;
  font-weight: 600;
  font-size: 16px;
  color: #1a73e8;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 0.1px;
}

body.body--dark .section-header {
  border-bottom-color: #333;
  color: #8ab4f8;
}

.section-icon {
  font-size: 20px;
}

.section-body {
  padding: 18px;
  font-size: 15px;
}

/* Row flex for contact */
.row-flex {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flex-grow {
  flex: 1;
}

/* Travelers */
.travelers-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  align-items: flex-start;
}

.traveler-chip {
  min-width: 170px;
  max-width: 200px;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 12px;
  flex-shrink: 0;
}

body.body--dark .traveler-chip {
  background: #2a2a2a;
}

.traveler-chip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.traveler-label {
  font-weight: 600;
  font-size: 13px;
  color: #555;
}

body.body--dark .traveler-label {
  color: #bbb;
}

.add-traveler-btn {
  flex-shrink: 0;
  margin-top: 24px;
}

/* Amadeus */
.amadeus-input {
  font-family: 'JetBrains Mono', 'Roboto Mono', 'SF Mono', Menlo, monospace;
  font-size: 14px;
}

.amadeus-hero {
  border: 2px solid #1976d2;
  box-shadow: 0 6px 24px rgba(25, 118, 210, 0.18);
  border-radius: 18px;
}

body.body--dark .amadeus-hero {
  border-color: #64b5f6;
  box-shadow: 0 6px 24px rgba(100, 181, 246, 0.22);
}

.amadeus-hero-header {
  font-size: 20px !important;
  font-weight: 700 !important;
  color: #1976d2;
  padding: 18px 20px !important;
  letter-spacing: 0.2px;
}

body.body--dark .amadeus-hero-header {
  color: #64b5f6;
}

.amadeus-hero .section-icon {
  font-size: 24px;
}

.amadeus-hero .section-body {
  padding: 20px;
}

.amadeus-input-hero {
  font-family: 'JetBrains Mono', 'Roboto Mono', 'SF Mono', Menlo, monospace;
}

.amadeus-input-hero ::v-deep textarea {
  font-size: 19px !important;
  line-height: 1.65 !important;
  min-height: 240px !important;
  letter-spacing: 0.3px;
}

/* Translate row */
.translate-row {
  flex-wrap: wrap;
  row-gap: 8px;
}

.translate-btn ::v-deep .q-btn__content {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.translate-btn {
  border-radius: 10px;
  padding: 0 22px;
}

/* Translated names display */
.translated-names-box {
  background: #e8f5e9;
  border-radius: 10px;
  padding: 12px 14px;
  border-left: 3px solid #43a047;
}

body.body--dark .translated-names-box {
  background: #1b2e1c;
  border-left-color: #66bb6a;
}

.translated-names-box .text-caption {
  font-size: 13px;
  font-weight: 500;
}

.translated-names-box .text-body2 {
  font-size: 16px;
  font-weight: 600;
  color: #2e7d32;
  margin-top: 2px;
}

body.body--dark .translated-names-box .text-body2 {
  color: #a5d6a7;
}

/* Language toggle in Amadeus header */
.amadeus-hero-title { flex: 1; }

.lang-toggle-header {
  margin-left: auto;
  flex-shrink: 0;
  background: #f3f6fb;
  border: 1px solid #d9e2ec;
  border-radius: 999px;
  padding: 2px;
  overflow: hidden;
}

body.body--dark .lang-toggle-header {
  background: #1c2733;
  border-color: #344c5e;
}

.lang-toggle-header ::v-deep .q-btn {
  min-height: 28px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.4px;
  min-width: 38px;
}

.lang-toggle-header ::v-deep .q-btn__content {
  font-family: $font-stack;
}

/* Advanced options panel */
.advanced-panel {
  margin-top: 4px;
  border: 1px dashed #cfd8dc;
  background: transparent;
  box-shadow: none;
}

body.body--dark .advanced-panel {
  border-color: #37474f;
}

.advanced-panel ::v-deep .advanced-panel-header {
  font-family: $font-stack;
  font-size: 15px;
  font-weight: 500;
  color: #607d8b;
  padding: 14px 18px;
  min-height: 52px;
}

body.body--dark .advanced-panel ::v-deep .advanced-panel-header {
  color: #90a4ae;
}

.advanced-panel ::v-deep .q-expansion-item__content {
  padding: 8px 0 0 0;
}

/* Template tabs */
.template-tabs {
  background: #f8f9fa;
  border-radius: 8px;
}

body.body--dark .template-tabs {
  background: #2a2a2a;
}

/* Form groups */
.form-group {
  margin-top: 16px;
  &.form-group-first {
    margin-top: 0;
  }
}

.form-group-label {
  font-weight: 600;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  text-transform: capitalize;
}

body.body--dark .form-group-label {
  color: #aaa;
}

.form-field {
  max-width: 100%;
  margin-top: 6px;
}

.sub-field {
  margin-left: 16px;
}

/* Language toggle */
.lang-toggle {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

body.body--dark .lang-toggle {
  border-color: #444;
}

/* Preview */
.preview-card {
  min-height: 300px;
}

.preview-bubble {
  background: #e7ffdb;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
  position: relative;

  &.rtl {
    direction: rtl;
  }
}

body.body--dark .preview-bubble {
  background: #1a3a2a;
}

.preview-textarea {
  font-size: 13px;
  line-height: 1.5;
}

.preview-textarea ::v-deep .q-field__control {
  background: transparent !important;
}

.preview-textarea ::v-deep .q-field__native {
  color: #111;
}

body.body--dark .preview-textarea ::v-deep .q-field__native {
  color: #e0e0e0;
}

.send-btn {
  width: 100%;
  border-radius: 10px;
  padding: 12px;
  font-weight: 600;
}

.preview-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.copy-msg-btn {
  width: 100%;
  border-radius: 10px;
  padding: 12px;
  font-weight: 600;
}

.template-picker {
  margin: 0 0 12px;
}

// On the preview tab we relax content-area's 640px cap so the toggles
// panel has room to sit beside the preview card. The card itself stays
// at 640px wide and centered via the grid below.
.content-area.preview-tab-area {
  max-width: 1180px;
}

// Desktop ≥1100px: 3-column grid keeps the preview-card visually
// centered (1fr | 640px | 1fr) and drops the section-toggles panel into
// the right column where there's plenty of empty space.
// Below 1100px: stack vertically with the toggles strip ABOVE the card.
.preview-and-toggles {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@media (min-width: 1100px) {
  .preview-and-toggles {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(0, 640px) minmax(280px, 1fr);
    grid-template-areas: "spacer card panel";
    column-gap: 24px;
    align-items: start;
  }
  .preview-and-toggles > .preview-card {
    grid-area: card;
    margin: 0; // card sits centered via the grid, no auto margins needed
  }
  .preview-and-toggles > .section-toggles {
    grid-area: panel;
    position: sticky;
    top: 16px;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
  }
}

.section-toggles {
  padding: 14px 14px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #fff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.04);
}
body.body--dark .section-toggles {
  background: #1e1e1e;
  border-color: #334155;
  box-shadow: none;
}

// Accordion trigger. On desktop CSS below disables the click affordance and
// hides the chevron so it reads as a plain section title.
.section-toggles-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0 4px 0;
  margin: 0 0 4px;
  background: transparent;
  border: 0;
  cursor: pointer;
  font: inherit;
  text-align: inherit;
  color: inherit;
}
.section-toggles-title {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  flex: 1;
  text-align: start;
}
body.body--dark .section-toggles-title {
  color: #94a3b8;
}
.section-toggles-badge {
  min-width: 22px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: #22c55e;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.section-toggles-chevron {
  font-size: 22px;
  color: #94a3b8;
  transition: transform 0.2s ease;
}
.section-toggles.is-expanded .section-toggles-chevron {
  transform: rotate(180deg);
}
.section-toggles-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 8px;
}

// One row = [icon] [label] [checkbox]. Click anywhere toggles the box.
.section-toggle-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  border: 1px solid transparent;
}
.section-toggle-row:hover {
  background: #f8fafc;
}
.section-toggle-row.is-on {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
body.body--dark .section-toggle-row:hover {
  background: #262626;
}
body.body--dark .section-toggle-row.is-on {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.4);
}

.section-toggle-icon {
  font-size: 20px;
  line-height: 1;
  width: 26px;
  flex-shrink: 0;
  text-align: center;
}
.section-toggle-label {
  flex: 1;
  font-size: 14.5px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.35;
}
body.body--dark .section-toggle-label {
  color: #e2e8f0;
}
.section-toggle-control {
  margin: 0;
  pointer-events: none; // row label handles click → no double event
}

// Group sub-header for "🟦 תוספות אופציונליות" — a thin separator + label
// that lives between sibling rows. The 4 sub-section rows that follow are
// indented via `.is-sub` so the hierarchy reads at a glance.
.section-toggle-group {
  margin: 12px 6px 4px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.3px;
}
body.body--dark .section-toggle-group {
  border-top-color: #334155;
  color: #94a3b8;
}
.section-toggle-row.is-sub {
  // RTL: indent on the right; LTR: indent on the left. `margin-inline-start`
  // resolves both automatically based on the parent's `dir`.
  margin-inline-start: 14px;
}
.section-toggle-row.is-sub + .section-toggle-row:not(.is-sub) {
  margin-top: 6px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

// Mobile (<1100px): collapsible accordion. The same row layout used on
// desktop — icon + label + checkbox — sits inside a collapsible list whose
// visibility is driven by the `.is-expanded` flag on the parent. When the
// list is open we cap its height and let it scroll internally so it never
// pushes the WhatsApp preview off-screen. `order: -1` pulls the panel
// above the phone mockup so the accordion header is the first thing the
// user sees on entering the preview tab.
@media (max-width: 1099px) {
  .preview-and-toggles > .section-toggles {
    order: -1;
  }
  .section-toggles {
    padding: 12px 12px 4px;
  }
  .section-toggles-header {
    padding: 6px 4px;
    margin: 0;
  }
  .section-toggles-title {
    font-size: 13px;
  }
  .section-toggles:not(.is-expanded) .section-toggles-list {
    display: none;
  }
  .section-toggles.is-expanded .section-toggles-list {
    max-height: 55vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 8px;
  }
}

// Desktop (≥1100px): header is decorative; chevron hidden, click disabled,
// list always rendered. Keeps the JS state (`sectionsExpanded`) irrelevant
// on this breakpoint without forcing the user to remember another flag.
@media (min-width: 1100px) {
  .section-toggles-header {
    cursor: default;
    pointer-events: none;
  }
  .section-toggles-chevron {
    display: none;
  }
  .section-toggles-list {
    display: flex !important;
  }
}

/* Welcome dialog — first-visit "what's new" greeting overlay.
 * Sized for comfortable reading on mobile + desktop; the colored
 * header gives it a "greeting card" feel rather than a notification.
 * RTL is hard-coded on the q-card since the content is Hebrew. */
.welcome-dialog {
  width: 100%;
  max-width: 560px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
}

.welcome-header {
  text-align: center;
  background: linear-gradient(135deg, #4a90e2 0%, #6cb1f7 60%, #8ccfff 100%);
  color: white;
  padding: 28px 24px 22px;
}

.welcome-emoji {
  font-size: 54px;
  line-height: 1;
  margin-bottom: 10px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.welcome-title {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
  letter-spacing: -0.2px;
}

.welcome-subtitle {
  font-size: 14px;
  opacity: 0.95;
  font-weight: 500;
}

.welcome-beta {
  display: inline-block;
  vertical-align: middle;
  margin-inline-start: 6px;
  padding: 2px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.welcome-section-beta {
  background: #fff8e1;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 12px 14px;
}

body.body--dark .welcome-section-beta {
  background: #3a2f10;
  border-color: #92641b;
}

.welcome-body {
  padding: 22px 24px 14px;
  background: #fafbfd;
}

.welcome-section {
  margin-bottom: 20px;
}

.welcome-section:last-child {
  margin-bottom: 0;
}

.welcome-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #0b1730;
  margin-bottom: 8px;
  line-height: 1.3;
}

.welcome-section-icon {
  font-size: 20px;
  line-height: 1;
}

.welcome-section-text {
  font-size: 14px;
  line-height: 1.65;
  color: #3a4554;
}

.welcome-howto-item {
  margin-top: 8px;
  padding: 10px 12px;
  background: white;
  border-radius: 10px;
  border-right: 3px solid #4a90e2;
}

.welcome-howto-item strong {
  color: #0b1730;
}

.welcome-howto-sub {
  margin-top: 4px;
  font-size: 13.5px;
  color: #475569;
  letter-spacing: 0.2px;
}

.welcome-actions {
  padding: 12px 24px 22px;
  background: #fafbfd;
}

.welcome-cta {
  min-width: 200px;
  font-weight: 700;
  font-size: 15px;
  padding: 8px 24px;
  border-radius: 999px;
}

/* Dark-mode adaptations — match the existing dest-dialog tweaks below. */
body.body--dark .welcome-dialog {
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}
body.body--dark .welcome-body,
body.body--dark .welcome-actions {
  background: #1a2032;
}
body.body--dark .welcome-section-title {
  color: #e3e8f0;
}
body.body--dark .welcome-section-text {
  color: #b6becc;
}
body.body--dark .welcome-howto-item {
  background: #232b3f;
  border-right-color: #6cb1f7;
}
body.body--dark .welcome-howto-item strong {
  color: #e3e8f0;
}
body.body--dark .welcome-howto-sub {
  color: #8b95a8;
}

/* Destination picker dialog */
.dest-dialog {
  min-width: 320px;
  max-width: 420px;
  width: 100%;
  border-radius: 14px;
}

.dest-dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: #0b1730;
  margin-bottom: 6px;
}

body.body--dark .dest-dialog-title { color: #8ab4f8; }

.dest-dialog-desc {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 8px;
}

body.body--dark .dest-dialog-desc { color: #aab; }

.dest-dialog-empty {
  padding: 20px 8px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}

.dest-list {
  margin-top: 8px;
  border: 1px solid #e4e9f1;
  border-radius: 10px;
  overflow: hidden;
}

body.body--dark .dest-list { border-color: #2e3842; }

.dest-item {
  padding: 10px 12px;
  transition: background 0.15s ease;
}

.dest-item-selected {
  background: rgba(37, 99, 235, 0.08);
}

body.body--dark .dest-item-selected {
  background: rgba(96, 165, 250, 0.15);
}

.dest-item-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 500;
}

.dest-flag { font-size: 22px; line-height: 1; }
.dest-city { color: #0b1730; }
.dest-code {
  color: #64748b;
  font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
  font-size: 13px;
  font-weight: 600;
}

body.body--dark .dest-city { color: #e9edef; }
body.body--dark .dest-code { color: #94a3b8; }

/* Dark mode heading fix */
body.body--dark {
  h1, h2, h3, h4, h5, h6 {
    color: white;
  }
}
</style>
