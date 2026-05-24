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
    <div v-else class="content-area">
      <div class="section-card preview-card">
        <div class="section-header">
          <span class="section-icon">&#128172;</span>
          <span>WhatsApp Message Preview</span>
        </div>
        <div class="section-body">
          <button
            v-if="selectedLang === 'en'"
            type="button"
            class="multi-fare-toggle"
            :class="{ active: useMultiFareMode }"
            @click="onToggleMultiFare"
          >
            <span class="multi-fare-toggle-icon">{{ useMultiFareMode ? '✓' : '🎫' }}</span>
            <span class="multi-fare-toggle-label">
              {{ useMultiFareMode ? 'Standard quote' : 'Multi-fare quote (OPTIMA / COMFORT / FLEX)' }}
            </span>
          </button>
          <WhatsAppPhonePreview
            :text="whatsappMessage"
            :dir="selectedLang === 'he' ? 'rtl' : 'ltr'"
            :contact-name="previewContactName"
            @update:text="whatsappMessage = $event"
          />
          <div class="preview-actions">
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
import { loadTemplate, FLIGHT_ITEM_KEYS, MULTI_FARE_TEMPLATES } from "src/assets/defaultTemplates.js";
import { flagFromCountry } from "src/assets/countryFlag.js";
import {
  getLocalizedAirlineName,
  airlineCodeFromFlightNumber,
  collectUniqueAirlines
} from "src/assets/airlineNames.js";
import {
  parseAmadeusNames,
  translateNamesViaProxy,
  buildTravelersFromNames,
  pingTranslationApi
} from "src/assets/nameTranslator.js";
import WhatsAppPhonePreview from "src/components/WhatsAppPhonePreview.vue";

export default {
  components: { WhatsAppPhonePreview },
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
      darkMode: false,
      ticketIssuanceDeadline: "",
      useMultiFareMode: false
    };
  },
  created() {
    this.init();
    this.darkMode = LocalStorage.getItem("darkMode");
    this.$q.dark.set(this.darkMode);
  },
  mounted() {
    this.refreshApiStatus();
  },
  methods: {
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
        this.destinationPickerOpen = false;
        this.tab = "preview";
        this.onPreview();
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
        this.destinationPickerOpen = false;
        this.tab = "preview";
        this.onPreview();
        this.$q.notify({
          type: "positive",
          message: this.translatedCountMsg(newTravelers.length),
          timeout: 2500
        });
      } catch (err) {
        const msg =
          err && err.message === "missing_proxy_config"
            ? this.missingApiKeyMsg
            : this.translationFailedMsg;
        this.lastTranslationInfo = msg;
        this.$q.notify({ type: "negative", message: msg, timeout: 4000 });
        console.error("translate names error:", err);
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
        const msg =
          err && err.message === "missing_proxy_config"
            ? this.missingApiKeyMsg
            : this.translationFailedMsg;
        this.lastTranslationInfo = msg;
        this.$q.notify({ type: "negative", message: msg, timeout: 4000 });
        console.error("translate names error:", err);
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
    onToggleMultiFare() {
      this.useMultiFareMode = !this.useMultiFareMode;
      this.onPreview();
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
      const multiFareTpl =
        this.useMultiFareMode && MULTI_FARE_TEMPLATES[langKey];
      const tpl = multiFareTpl || loadTemplate("flight", langKey);
      if (!tpl) return "";

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
        PRICE: this.airfareTxt,
        CURRENCY: this.selectedCurrency,
        BAGGAGE: this.baggageList,
        CHANGE_FEE: this.changeFeeValue,
        CANCEL_FEE: cancelFee,
        NO_SHOW: this.noShowValue,
        TICKET_ISSUANCE: ticketIssuance,
        FAREWELL: this.$t("farewell")
      };

      const withFlights = this.expandFlightBlock(tpl);

      return withFlights.replace(/\{\{([A-Z_]+)\}\}/g, (m, key) =>
        values[key] !== undefined ? values[key] : m
      );
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
    // Per-flight class label. When the parser couldn't resolve the RBD
    // letter to a cabin (airline not in AIRLINE_RBD, letter not listed,
    // charter PNR, or anything else returning null), we fall back to the
    // original "Economy/Premium/Business Class" placeholder so the line
    // still reads naturally in the message.
    flightClassDisplay(flightClass) {
      if (flightClass) return this.$t(flightClass);
      if (this.selectedLang === "he") return "מחלקת תיירים/עסקים/פרמיום";
      if (this.selectedLang === "fr") return "Classe Économique/Premium/Affaires";
      return "Economy/Premium/Business Class";
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
        FLIGHT_CLASS: this.flightClassDisplay(f.flightClass)
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
      switch (this.selectedLang) {
        case "he":
          return "פרטים נוספים (אופציונלי)";
        case "fr":
          return "Plus d'options (optionnel)";
        default:
          return "More options (optional)";
      }
    },
    selectedCurrency() {
      return this.data.prices.currency.currency.selected;
    },
    previewContactName() {
      const name = (this.data.travelers[0] && this.data.travelers[0].name) || "";
      return name.trim() || (this.selectedLang === "he" ? "לקוח" : "Customer");
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

.multi-fare-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin: 0 0 14px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1.5px dashed #94a3b8;
  background: #f8fafc;
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
  font-family: inherit;
}

.multi-fare-toggle:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.multi-fare-toggle:active {
  transform: scale(0.99);
}

.multi-fare-toggle.active {
  background: linear-gradient(180deg, #2563eb, #1d4ed8);
  color: #fff;
  border-style: solid;
  border-color: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.multi-fare-toggle.active:hover {
  background: linear-gradient(180deg, #1d4ed8, #1e40af);
}

.multi-fare-toggle-icon {
  font-size: 18px;
  line-height: 1;
}

.multi-fare-toggle-label {
  flex: 1;
  text-align: center;
}

body.body--dark .multi-fare-toggle {
  background: #1e293b;
  border-color: #475569;
  color: #cbd5e1;
}

body.body--dark .multi-fare-toggle:hover {
  background: #1e3a5f;
  border-color: #3b82f6;
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
