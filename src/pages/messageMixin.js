import { DAYS, MONTHS, CLASSES_TYPE_MAP } from "src/assets/consts.js";
import { airlines } from "src/assets/airlines_big.js";
import index from "airportsjs";
import { airports } from "src/assets/iata";
import {
  getLocalizedAirlineName,
  airlineCodeFromFlightNumber
} from "src/assets/airlineNames.js";

// IATA codes that aren't in the airportsjs npm dataset (e.g. railway-station
// codes used by airline PNRs like QKL = Köln Hbf) fall back to the local
// iata.js so the rest of the parsing pipeline still works.
function lookupAirport(code) {
  const ext = index.lookupByIataCode(code);
  if (ext) return ext;
  const local = airports[code];
  if (!local) return null;
  return { city: local.CityNameEn, country: local.CountryNameEn, iata: code };
}

// destructuring to keep only what is needed

const messageMixin = {
  methods: {
    init() {
      if (
        "contacts" in navigator &&
        "select" in navigator.contacts &&
        "getProperties" in navigator.contacts
      ) {
        this.contactListApiSupported = true;
      }

      if (!String.prototype.splice) {
        /**
         * {JSDoc}
         *
         * The splice() method changes the content of a string by removing a range of
         * characters and/or adding new characters.
         *
         * @this {String}
         * @param {number} start Index at which to start changing the string.
         * @param {number} delCount An integer indicating the number of old chars to remove.
         * @param {string} newSubStr The String that is spliced in.
         * @return {string} A new string with the spliced substring.
         */
        String.prototype.splice = function(start, delCount, newSubStr) {
          return (
            this.slice(0, start) +
            newSubStr +
            this.slice(start + Math.abs(delCount))
          );
        };
      }
    },
    async selectFromPhoneContactList() {
      if (this.contactListApiSupported) {
        try {
          const availableProperties = await navigator.contacts.getProperties();

          if (availableProperties.includes("address")) {
            const contactProperties = ["name", "tel", "address"];

            const contacts = await navigator.contacts.select(
              contactProperties,
              { multiple: false }
            );

            this.data.whatsappNumber = contacts[0].tel;
            this.data.travelers[0].name = `${contacts[0].name}`;
          } else {
            console.log(
              "Contact Picker API on your device doesn't support address property"
            );
          }
        } catch {
          console.log("Unexpected error happened in Contact Picker API");
        }
      } else {
        console.log("Your browser doesn't support Contact Picker API");
      }
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    onRedirectToWhatsapp() {
      const url = `https://api.whatsapp.com/send?phone=${
        this.data.whatsappNumber
      }&text=%20${encodeURIComponent(this.whatsappMessage)}`;
      window.open(url, "_blank");
    },
    isFlightLine(line) {
      if (!line) return false;
      // Carrier code can be alphanumeric (W2, U2, 9W, 4U, …) — match A–Z and 0–9
      // in the 2–3 char carrier slot. Rest of the pattern (number, class letter,
      // date) keeps the line specific enough that non-flight rows don't slip in.
      return /\b[A-Z0-9]{2,3}\s*\d{1,4}\s+[A-Z]\s+\d{2}[A-Z]{3}/.test(line);
    },
    getAmadeusTranslate(linesString) {
      if (linesString.length) {
        let splited,
          nextLineSplited,
          hoursDifference = 0,
          way,
          txt = "";

        //             ? this.$t("other destination flight")

        const rawLines = linesString.split("\n");
        const lines = rawLines.filter(l => this.isFlightLine(l));
        let nextLine;

        lines.forEach((line, idx) => {
          splited = this.getSplittedLine(line);
          nextLineSplited = this.getSplittedLine(lines[idx + 1]);

          line = this.getSplitedLineDetails(splited);
          if (!line) return;

          if (idx === 0) {
            this.firstDepart = line.departAirport;
          }

          if (nextLineSplited)
            nextLine = this.getSplitedLineDetails(nextLineSplited);

          if (nextLine) {
            hoursDifference = this.getHourDifference(line, nextLine);
            if (idx === 0) {
              way = this.$t("outbound flight");
              txt += `*${way}*`;
            }
          }
          
          const departAirport =
            this.selectedLang === "he"
              ? airports[line.departAirportCode]
                ? airports[line.departAirportCode].CityNameHe
                : line.departAirport
              : line.departAirport;

          const destAirport =
            this.selectedLang === "he"
              ? airports[line.destAirportCode]
                ? airports[line.destAirportCode].CityNameHe
                : line.destAirport
              : line.destAirport;

          var flightPrefix = this.$i18n.locale === 'he' ? '' : this.prefixFlight;
          var flightDash = this.$i18n.locale === 'he' ? ' – ' : ' - ';
          var classLine = this.$i18n.locale === 'he' ? '' : ('\n' + this.$t(this.$t(line.flightClass)));

          var isHe = this.$i18n.locale === 'he';
          var sp = isHe ? '' : ' ';

          var localizedAirline = getLocalizedAirlineName(
            airlineCodeFromFlightNumber(line.flightNumber),
            this.$i18n.locale,
            line.airline
          );

          txt += `\n${flightPrefix}${localizedAirline}${flightDash}*${
            line.flightNumber
          }* \n${departAirport} ${
            line.departAirport === "Tel Aviv"
              ? `${this.directionEmoji} `
              : `(${line.departAirportCode}) ${this.directionEmoji} `
          }${destAirport} ${
            line.destAirport === "Tel Aviv" ? "" : `(${line.destAirportCode})`
          }${classLine}\n${sp}${this.$t(
            "dpt."
          )} ${this.$t(`${line.departDay}`)}${this.getRightSpaceAlignment(
            line.departDay
          )} ${line.departDateNumberOnlyStr} ${this.$t(
            line.departMonth
          )}${this.getRightSpaceAlignment(line.departMonth)} ${
            line.departTime
          }\n${sp}${this.$t("arr.")} ${this.$t(
            `${line.destDay}`
          )}${this.getRightSpaceAlignment(line.destDay)} ${
            line.destDateNumberStr
          } ${this.$t(line.destMonth)}${this.getRightSpaceAlignment(
            line.destMonth
          )} ${line.destTime}\n${this.$t("seat number")}\n`;

          if (24 < hoursDifference) {
            if (way.includes(this.$t("inbound flight"))) {
              txt = txt.replace(
                `${this.$t("inbound flight")}`,
                `${this.$t("other destination flight")}`
              );
            }
            way = this.$t("inbound flight");
            txt += `\n*${way}*`;
          }
        });
        return txt;
      } else return "";
    },
    getParsedFlights() {
      const raw = this.data.smartAmadeusCode || "";
      if (!raw) return [];
      const lines = raw.split("\n").filter(l => this.isFlightLine(l));
      const flights = [];
      for (const rawLine of lines) {
        const splitted = this.getSplittedLine(rawLine);
        if (!splitted) continue;
        const f = this.parseFlightLinePure(splitted);
        if (f) flights.push(f);
      }
      if (!flights.length) return [];

      const outboundLbl = this.$t("outbound flight");
      const inboundLbl = this.$t("inbound flight");
      const connectionLbl = this.$t("connection flight");
      const continuingLbl = this.$t("continuing flight");
      const LAYOVER_THRESHOLD_HOURS = 10;

      // Find the index of the flight that LANDS at the user-picked final destination.
      // Everything up to and including that flight is outbound; everything after is return.
      // If the user hasn't picked yet (or the picked code isn't found), fall back to
      // the previous behaviour: a >24h gap flips outbound→inbound.
      const finalDestCode = this.selectedFinalDestination
        ? this.selectedFinalDestination.code
        : null;
      let turnaroundIdx = -1;
      if (finalDestCode) {
        for (let i = 0; i < flights.length; i++) {
          if (flights[i].destAirportCode === finalDestCode) {
            turnaroundIdx = i;
            break;
          }
        }
      }

      const labelFor = (isFirstInGroup, gapFromPrev, baseLabel) => {
        if (isFirstInGroup) return baseLabel;
        return gapFromPrev < LAYOVER_THRESHOLD_HOURS ? connectionLbl : continuingLbl;
      };

      if (turnaroundIdx !== -1) {
        // Destination-driven labelling (preferred path).
        for (let i = 0; i < flights.length; i++) {
          const isOutbound = i <= turnaroundIdx;
          const isFirstInGroup = isOutbound ? i === 0 : i === turnaroundIdx + 1;
          const base = isOutbound ? outboundLbl : inboundLbl;
          const gap = i > 0 ? this.getHourDifference(flights[i - 1], flights[i]) : Infinity;
          flights[i].direction = labelFor(isFirstInGroup, gap, base);
          flights[i].directionGroup = isOutbound ? "outbound" : "inbound";
        }
      } else {
        // Fallback: 24h-gap heuristic, with the same connection/continuing rule
        // applied within each leg.
        let group = "outbound";
        let firstInGroup = true;
        for (let i = 0; i < flights.length; i++) {
          const base = group === "outbound" ? outboundLbl : inboundLbl;
          const gap = i > 0 ? this.getHourDifference(flights[i - 1], flights[i]) : Infinity;
          flights[i].direction = labelFor(firstInGroup, gap, base);
          flights[i].directionGroup = group;
          const next = flights[i + 1];
          if (next) {
            const nextGap = this.getHourDifference(flights[i], next);
            if (group === "outbound" && nextGap > 24) {
              group = "inbound";
              firstInGroup = true;
              continue;
            }
          }
          firstInGroup = false;
        }
      }
      return flights;
    },
    parseFlightLinePure(splitedLine) {
      if (!splitedLine || splitedLine.length < 11) return null;
      try {
        const line = {};
        const latterOfclassOfTravel = splitedLine[3];
        const dayNumber = splitedLine[5];
        const airlineEntry = airlines.filter(
          item => item.IATA === splitedLine[1]
        )[0];
        if (!airlineEntry) return null;
        line.airline = airlineEntry.name;
        line.flightNumber = `${splitedLine[1]}${splitedLine[2]}`;
        line.departAirportCode = splitedLine[6].slice(0, 3);
        line.destAirportCode = splitedLine[6].slice(3, 6);
        const departInfo = lookupAirport(line.departAirportCode);
        const destInfo = lookupAirport(line.destAirportCode);
        if (!departInfo || !destInfo) return null;
        line.departAirport = departInfo.city;
        line.destAirport = destInfo.city;
        line.departTime = `${splitedLine[8].slice(0, 2)}:${splitedLine[8].slice(
          2,
          4
        )}`;
        line.destTime = `${splitedLine[9].slice(0, 2)}:${splitedLine[9].slice(
          2,
          4
        )}`;
        line.departDate = `${splitedLine[4]}`;
        line.destDate = `${splitedLine[10]}`;
        line.departDay = DAYS[dayNumber - 1];
        line.departDateNumberOnlyStr = line.departDate.substr(0, 2);
        line.departDateNumberOnly = +line.departDate.substr(0, 2);
        line.destDateNumberStr = line.destDate.substr(0, 2);
        line.destDateNumberOnly = +line.destDate.substr(0, 2);
        line.destMonth = line.destDate.substr(2, 5);
        line.departMonth = line.departDate.substr(2, 5);
        line.destHour = line.destTime.substr(0, 2);
        line.destMinutes = line.destTime.substr(3, 5);
        line.departHour = line.departTime.substr(0, 2);
        line.departMinutes = line.departTime.substr(3, 5);
        let flightClass;
        for (const key in CLASSES_TYPE_MAP) {
          if (CLASSES_TYPE_MAP[key].some(l => l === latterOfclassOfTravel)) {
            flightClass = key;
            break;
          }
        }
        line.flightClass = flightClass;
        if (line.departMonth === line.destMonth) {
          line.destDay =
            line.departDateNumberOnly !== line.destDateNumberOnly
              ? line.departDateNumberOnly < line.destDateNumberOnly
                ? DAYS[+dayNumber === 7 ? 0 : +dayNumber]
                : +dayNumber === 1
                ? DAYS[6]
                : DAYS[dayNumber - 2]
              : line.departDay;
        } else if (
          MONTHS.indexOf(line.departMonth) > MONTHS.indexOf(line.destMonth)
        ) {
          line.destDay = +dayNumber === 1 ? DAYS[6] : DAYS[dayNumber - 2];
        } else {
          line.destDay = DAYS[+dayNumber === 7 ? 6 : +dayNumber];
        }
        return line;
      } catch (e) {
        return null;
      }
    },
    getSplitedLineDetails(splitedLine) {
      if (!splitedLine || splitedLine.length < 11) return;
      let line = {},
        latterOfclassOfTravel,
        dayNumber;

      latterOfclassOfTravel = splitedLine[3];
      line.flightClass = this.setClassOfTravel(latterOfclassOfTravel);
      const airlineEntry = airlines.filter(item => item.IATA === splitedLine[1])[0];
      if (!airlineEntry) return;
      line.airline = airlineEntry.name;
      line.flightNumber = `${splitedLine[1]}${splitedLine[2]}`;
      dayNumber = splitedLine[5];
      line.departAirportCode = splitedLine[6].slice(0, 3);
      line.destAirportCode = splitedLine[6].slice(3, 6);
      const departInfoLegacy = lookupAirport(line.departAirportCode);
      const destInfoLegacy = lookupAirport(line.destAirportCode);
      if (!departInfoLegacy || !destInfoLegacy) return;
      this.data.journey.push(departInfoLegacy.city);
      this.data.journey.push(destInfoLegacy.city);
      if (!this.data.journeyCodes) this.data.journeyCodes = {};
      this.data.journeyCodes[departInfoLegacy.city] = line.departAirportCode;
      this.data.journeyCodes[destInfoLegacy.city] = line.destAirportCode;
      line.departAirport = `${departInfoLegacy.city}`;
      line.destAirport = `${destInfoLegacy.city}`;
      line.departTime = `${splitedLine[8].slice(0, 2)}:${splitedLine[8].slice(
        2,
        4
      )}`;
      line.destTime = `${splitedLine[9].slice(0, 2)}:${splitedLine[9].slice(
        2,
        4
      )}`;
      line.departDate = `${splitedLine[4]}`;
      line.destDate = `${splitedLine[10]}`;
      line.departDay = DAYS[dayNumber - 1];

      // * day logic
      line.departDateNumberOnlyStr = line.departDate.substr(0, 2);
      line.departDateNumberOnly = +line.departDate.substr(0, 2);
      line.destDateNumberStr = line.destDate.substr(0, 2);
      line.destDateNumberOnly = +line.destDate.substr(0, 2);
      line.destMonth = line.destDate.substr(2, 5);
      line.departMonth = line.departDate.substr(2, 5);
      line.destHour = line.destTime.substr(0, 2);
      line.destMinutes = line.destTime.substr(3, 5);
      line.departHour = line.departTime.substr(0, 2);
      line.departMinutes = line.departTime.substr(3, 5);

      if (line.departMonth === line.destMonth) {
        line.destDay =
          line.departDateNumberOnly !== line.destDateNumberOnly
            ? line.departDateNumberOnly < line.destDateNumberOnly
              ? DAYS[+dayNumber === 7 ? 0 : +dayNumber]
              : // * in case dayNumber is mon (1) in js [0] and the previos day is sun (7) in js [6]
              +dayNumber === 1
              ? DAYS[6]
              : DAYS[dayNumber - 2]
            : line.departDay;
      } else if (
        MONTHS.indexOf(line.departMonth) > MONTHS.indexOf(line.destMonth)
      ) {
        // * in case dayNumber is mon (1) in js [0] and the previos day is sun (7) in js [6]
        line.destDay = +dayNumber === 1 ? DAYS[6] : DAYS[dayNumber - 2];
      } else {
        line.destDay = DAYS[+dayNumber === 7 ? 6 : +dayNumber];
      }
      //

      return line;
    },
    getSplittedLine(line) {
      if (!line) return;
      let charsToFirstNumber;
      charsToFirstNumber = line.search(/\d/);
      line = line.slice(charsToFirstNumber, line.length - 1);
      // * handles 4 numbers - ly1996
      line = line.splice(5, 0, " ");
      // * handle * - 4*
      line = line.splice(20, 1, " ");

      return line.split(/(\s+)/).filter(e => e.trim().length > 0);
    },
    setClassOfTravel(latterOfclassOfTravel) {
      let isInClass = false,
        flightClass;
      for (const key in CLASSES_TYPE_MAP) {
        isInClass = CLASSES_TYPE_MAP[key].some(
          latter => latter === latterOfclassOfTravel
        );
        if (isInClass) {
          flightClass = key;
          if (this.data.classOfTravel && this.data.classOfTravel !== key) {
            this.data.classOfTravel = "combined compartment";
          } else this.data.classOfTravel = key;
        }
      }
      return flightClass;
    },
    getHourDifference(line, nextLine) {
      let currYear = new Date().getFullYear(),
        destFormattedDate = new Date(),
        nextLineDepartFormattedDate = new Date();

      destFormattedDate.setFullYear(currYear);
      destFormattedDate.setMonth(MONTHS.indexOf(line.destMonth));
      destFormattedDate.setDate(line.destDateNumberOnly);
      destFormattedDate.setHours(line.destHour);
      destFormattedDate.setMinutes(line.destMinutes);
      nextLineDepartFormattedDate.setFullYear(currYear);
      nextLineDepartFormattedDate.setMonth(
        MONTHS.indexOf(nextLine.departMonth)
      );
      nextLineDepartFormattedDate.setDate(nextLine.departDateNumberOnly);
      nextLineDepartFormattedDate.setHours(nextLine.departHour);
      nextLineDepartFormattedDate.setMinutes(nextLine.departMinutes);

      const difference =
        nextLineDepartFormattedDate.getTime() - destFormattedDate.getTime();
      const hoursDifference = Math.floor(difference / 1000 / 60 / 60);

      return hoursDifference;
    },
    getRightSpaceAlignment(str) {
      str = this.$t(str).toLowerCase();
      switch (str) {
        // * en
        case "sun":
          return " ";
        case "tue":
          return " ";
        case "thu":
          return " ";
        case "fri":
          return "   ";
        case "sat":
          return "  ";
        // * fr
        case "dim":
          return " ";
        case "lun":
          return " ";
        case "mer":
          return " ";
        case "jeu":
          return " ";
        case "ven":
          return " ";
        case "sam":
          return "";
        // * he
        case "יום א":
          return "";
        case "יום ב":
          return "";
        case "יום ג":
          return "";
        case "יום ד":
          return "";
        case "יום ה":
          return "";
        case "יום ו":
          return " ";
        case "יום ש":
          return "";
        case "ינו'":
          return "   ";
        case "פבר'":
          return "";
        case "מרץ":
          return " ";
        case "אפר'":
          return "";
        case "מאי":
          return " ";
        case "יוני":
          return "  ";
        case "יולי":
          return "  ";
        case "אוג'":
          return "";
        case "ספט'":
          return "";
        case "אוק'":
          return " ";
        case "נוב'":
          return "  ";
        case "דצמ'":
          return "";

        // * months
        case "jan":
          return "";
        case "feb":
          return " ";
        case "mar":
          return "";
        case "apr":
          return " ";
        case "may":
          return "";
        case "jun":
          return " ";
        case "jul":
          return " ";
        case "aug":
          return "";
        case "sep":
          return " ";
        case "oct":
          return "";
        case "nov":
          return " ";
        case "dec":
          return "";

        default:
          return "";
      }
    }
  },
  computed: {
    directionEmoji() {
      return this.$i18n.locale === "he" ? "⬅️" : "➡️";
    },
    prefixFlight() {
      return this.$i18n.locale === "he" ? "טיסת " : "";
    }
  }
};
export default messageMixin;
