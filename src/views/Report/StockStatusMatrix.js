import "antd/dist/antd.css";
import CryptoJS from "crypto-js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from "jspreadsheet";
import {
  onOpenFilter,
  jExcelLoadedFunction,
  jExcelLoadedFunctionWithoutPagination,
  jExcelLoadedFunctionStockStatusMatrix,
} from "../../CommonComponent/JExcelCommonFunctions.js";
import moment from "moment";
import React from "react";
import { Line } from "react-chartjs-2";
import { MultiSelect } from "react-multi-select-component";
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from "../../CommonComponent/Logo.js";
import getLabelText from "../../CommonComponent/getLabelText";
import {
  API_URL,
  DATE_FORMAT_CAP,
  INDEXED_DB_NAME,
  INDEXED_DB_VERSION,
  JEXCEL_PAGINATION_OPTION,
  JEXCEL_PRO_KEY,
  SECRET_KEY,
} from "../../Constants.js";
import DropdownService from "../../api/DropdownService";
import ProductService from "../../api/ProductService";
import ReportService from "../../api/ReportService";
import csvicon from "../../assets/img/csv.png";
import pdfIcon from "../../assets/img/pdf.png";
import i18n from "../../i18n";
import AuthenticationService from "../Common/AuthenticationService.js";
import AuthenticationServiceComponent from "../Common/AuthenticationServiceComponent";
import SupplyPlanFormulas from "../SupplyPlan/SupplyPlanFormulas";
import {
  addDoubleQuoteToRowContent,
  filterOptions,
  formatter,
  formatterMOS,
  roundAMC,
  makeText,
} from "../../CommonComponent/JavascriptCommonFunctions";
import Picker from "react-month-picker";
import MonthBox from "../../CommonComponent/MonthBox.js";
import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";

// ─── Constants ────────────────────────────────────────────────────────────────

const pickerLang = {
  months: [
    i18n.t("static.month.jan"),
    i18n.t("static.month.feb"),
    i18n.t("static.month.mar"),
    i18n.t("static.month.apr"),
    i18n.t("static.month.may"),
    i18n.t("static.month.jun"),
    i18n.t("static.month.jul"),
    i18n.t("static.month.aug"),
    i18n.t("static.month.sep"),
    i18n.t("static.month.oct"),
    i18n.t("static.month.nov"),
    i18n.t("static.month.dec"),
  ],
  from: "From",
  to: "To",
};

// stockStatusId → { label, color }
const STOCK_STATUS_MAP = {
  "-1": { label: i18n.t("static.supplyPlanFormula.na"), color: "#cfcdc9" },
  0: { label: i18n.t("static.report.stockout"), color: "#BA0C2F" },
  1: { label: i18n.t("static.report.lowstock"), color: "#f48521" },
  2: { label: i18n.t("static.report.okaystock"), color: "#118b70" },
  3: { label: i18n.t("static.report.overstock"), color: "#edb944" },
};

const legendcolor = [
  { text: i18n.t("static.report.stockout"), color: "#BA0C2F", value: 0 },
  { text: i18n.t("static.report.lowstock"), color: "#f48521", value: 1 },
  { text: i18n.t("static.report.okaystock"), color: "#118b70", value: 2 },
  { text: i18n.t("static.report.overstock"), color: "#edb944", value: 3 },
  { text: i18n.t("static.supplyPlanFormula.na"), color: "#cfcdc9", value: -1 },
];

// All stock status options pre-selected by default
const ALL_STOCK_STATUS = legendcolor.map((item) => ({
  label: item.text,
  value: item.value,
}));

const entityname = i18n.t("static.dashboard.productCatalog");

const DARK_COLORS = [
  "#d4bbff",
  "#BA0C2F",
  "#757575",
  "#0067B9",
  "#A7C6ED",
  "#205493",
  "#ba4e00",
  "#6C6463",
  "#BC8985",
  "#cfcdc9",
  "#49A4A1",
  "#118B70",
  "#EDB944",
  "#F48521",
  "#ED5626",
  "#d4bbff",
  "#BA0C2F",
  "#757575",
  "#0067B9",
  "#A7C6ED",
  "#205493",
  "#ba4e00",
  "#6C6463",
  "#BC8985",
  "#cfcdc9",
  "#49A4A1",
  "#118B70",
  "#EDB944",
  "#F48521",
  "#ED5626",
  "#d4bbff",
  "#BA0C2F",
  "#757575",
  "#0067B9",
  "#A7C6ED",
];
const LIGHT_COLORS = [
  "#002F6C",
  "#BA0C2F",
  "#212721",
  "#0067B9",
  "#A7C6ED",
  "#205493",
  "#651D32",
  "#6C6463",
  "#BC8985",
  "#cfcdc9",
  "#49A4A1",
  "#118B70",
  "#EDB944",
  "#F48521",
  "#ED5626",
  "#002F6C",
  "#BA0C2F",
  "#212721",
  "#0067B9",
  "#A7C6ED",
  "#205493",
  "#651D32",
  "#6C6463",
  "#BC8985",
  "#cfcdc9",
  "#49A4A1",
  "#118B70",
  "#EDB944",
  "#F48521",
  "#ED5626",
  "#002F6C",
  "#BA0C2F",
  "#212721",
  "#0067B9",
  "#A7C6ED",
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function deriveMonthColumns(stockStatusMatrix, startDate, endDate) {
  const keySet = new Set();
  (stockStatusMatrix || []).forEach((row) =>
    Object.keys(row.dataMap || {}).forEach((k) => {
      if (k >= startDate && k <= endDate) keySet.add(k);
    })
  );
  return Array.from(keySet).sort();
}

function colorForStatus(statusId) {
  return (STOCK_STATUS_MAP[statusId] || STOCK_STATUS_MAP["-1"]).color;
}

// Returns raw number or null (null → shown as N/A via render callback on numeric col)
function cellDisplayValue(dataEntry, showQuantity, planBasedOn) {
  if (!dataEntry || dataEntry.stockStatusId == -1) return null;
  const { mos, closingBalance } = dataEntry;
  if (showQuantity || planBasedOn == 2) {
    return closingBalance != null ? Math.round(closingBalance) : null;
  }
  return mos != null ? roundAMC(mos) : null;
}

// Local version: derive statusId from MOS vs min/reorder thresholds
function calcStatusIdLocal(mos, minMos, reorderFrequency) {
  if (mos == null) return -1;
  const v = roundAMC(mos);
  if (v == 0) return 0;
  if (v < minMos) return 1;
  if (v > minMos + reorderFrequency) return 3;
  return 2;
}

// Calculate dynamic maxStock for plan-by-qty
// For each month: dynamicMax = minStock + reorderFrequency * AMC
// Return the average across all months that have AMC data.
function calcAverageMaxStock(supplyPlanEntries, minStock, reorderFrequency) {
  const monthlyMaxValues = (supplyPlanEntries || [])
    .filter((sp) => sp.amc != null && sp.amc > 0)
    .map((sp) => minStock + reorderFrequency * sp.amc);

  if (monthlyMaxValues.length == 0) return 0;
  const sum = monthlyMaxValues.reduce((acc, v) => acc + v, 0);
  return sum / monthlyMaxValues.length;
}

// ─── PDF Icon Helpers ─────────────────────────────────────────────────────────
// We render each FontAwesome icon onto a tiny offscreen <canvas> using the FA
// font that is already loaded in the browser, then stamp the canvas as a PNG
// image into the PDF via doc.addImage(). This guarantees a pixel-perfect match
// to the on-screen icons — no hand-drawn approximations needed.
//
// FA unicode code points:
//   fa-truck                → U+F0D1  (\uf0d1)
//   fa-exclamation-triangle → U+F071  (\uf071)
//
// Returns a { dataUrl, widthPt } object. widthPt is the pt width to reserve
// in the PDF so the caller can advance its x cursor correctly.

function renderFaIconToDataUrl(glyphChar, color, sizePx = 28) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = sizePx;
    canvas.height = sizePx;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, sizePx, sizePx);
    // "Font Awesome 5 Free" is the name used by FA5; FA4 registers as "FontAwesome"
    // We try both so it works regardless of which version the project uses.
    ctx.font = `900 ${sizePx * 0.85}px "Font Awesome 5 Free", "FontAwesome"`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(glyphChar, sizePx / 2, sizePx / 2);
    return { dataUrl: canvas.toDataURL("image/png"), widthPt: 10 };
  } catch (_) {
    return null;
  }
}

// Pre-render both icons once so they are ready synchronously during didDrawCell.
// Called just before exportPDFFromModal builds the autoTable.
function buildPdfIconCache() {
  return {
    truck: {
      light: renderFaIconToDataUrl("\uf0d1", "#ffffff", 28),
      dark: renderFaIconToDataUrl("\uf0d1", "#333333", 28),
    },
    warning: {
      light: renderFaIconToDataUrl("\uf071", "#ffffff", 28),
      dark: renderFaIconToDataUrl("\uf071", "#333333", 28),
    },
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default class StockStatusMatrix extends React.Component {
  constructor(props) {
    super(props);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - 3);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + 14);

    this.state = {
      stockStatusMatrix: [],
      stockStatusDetails: [],
      filteredMatrix: [],
      filteredDetails: [],
      monthColumns: [],
      programs: [],
      versions: [],
      planningUnits: [],
      planningUnitValues: [],
      planningUnitLabels: [],
      // Default: all stock statuses selected
      stockStatusValues: ALL_STOCK_STATUS,
      stockStatusLabels: ALL_STOCK_STATUS.map((x) => x.label),
      rangeValue: {
        from: { year: dt.getFullYear(), month: dt.getMonth() + 1 },
        to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 },
      },
      minDate: {
        year: new Date().getFullYear() - 10,
        month: new Date().getMonth() + 1,
      },
      maxDate: {
        year: new Date().getFullYear() + 10,
        month: new Date().getMonth() + 1,
      },
      programId: "",
      versionId: "",
      showQuantity: false, // default unchecked
      showIcon: true, // default checked
      showDetailData: false, // Show Data button toggle
      removePlannedShipments: false,
      removeTBDFundingSourceShipments: false,
      message: "",
      loading: true,
      lang: localStorage.getItem("lang"),
      exportModal: false,
      onlyDownloadedPrograms: false,
      exportProgramIds: [],
      exportVersionId: "",
      exportPlanningUnitIds: [],
      exportType: 0, // 1 for PDF, 2 for CSV
      downloadedPrograms: [],
      allProgramsForExport: [],
      versionsForExport: [],
      planningUnitsForExport: [],
      exportLoading: false,
      exportMessage: "",
      PlanningUnitDataForExport: [],
      puByProgramForExport: {}, // keyed by programId → puList, used to filter PUs per-program at export time
    };

    this._handleClickRangeBox = this._handleClickRangeBox.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.filterData = this.filterData.bind(this);
    this.setProgramId = this.setProgramId.bind(this);
    this.setVersionId = this.setVersionId.bind(this);
    this.buildMatrixJExcel = this.buildMatrixJExcel.bind(this);
    this.buildDetailJExcel = this.buildDetailJExcel.bind(this);
    this.loadedMatrix = this.loadedMatrix.bind(this);
    this.loadedDetail = this.loadedDetail.bind(this);
  }

  toggleExportModal = (type) => {
    if (!this.state.exportModal) {
      this.fetchProgramsForExport();
    }
    const programsForExport = this.state.programs
      .filter((p) => String(p.programId) == String(this.state.programId))
      .map((p) => ({
        label: p.programCode,
        value: p.programId,
      }));

    // Build puByProgramForExport synchronously from the already-loaded
    // planningUnits on the main screen, so fetchDataForExport has the
    // per-program PU map immediately — even before the async
    // fetchVersionsAndPlanningUnits() call completes.
    const syncPuByProgram = {};
    if (programsForExport.length == 1) {
      const pid = String(programsForExport[0].value);
      syncPuByProgram[pid] = (this.state.planningUnits || []).map((p) => ({
        ...p,
        id: p.id || p.value,
        value: p.id || p.value,
      }));
    }

    this.setState(
      {
        exportModal: !this.state.exportModal,
        exportType: type,
        exportProgramIds: programsForExport,
        exportVersionId: this.state.versionId,
        exportPlanningUnitIds: this.state.planningUnitValues,
        onlyDownloadedPrograms: false,
        puByProgramForExport: syncPuByProgram,
      },
      () => {
        if (this.state.exportModal && programsForExport.length > 0) {
          this.fetchVersionsAndPlanningUnits(false); // will overwrite puByProgramForExport with full data when ready
        }
      }
    );
  };

  /**
   * Fetch programs for export modal
   */
  fetchProgramsForExport = () => {
    const downloadedPrograms = [];
    const allPrograms = [...this.state.programs];

    // Get downloaded programs from IndexedDB
    getDatabase();
    const req = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    req.onsuccess = (e) => {
      const db = e.target.result;
      const get = db
        .transaction(["programData"], "readwrite")
        .objectStore("programData")
        .getAll();
      get.onsuccess = () => {
        const userId = CryptoJS.AES.decrypt(
          localStorage.getItem("curUser"),
          SECRET_KEY
        ).toString(CryptoJS.enc.Utf8);
        get.result.forEach((r) => {
          if (r.userId == userId) {
            const pd = JSON.parse(
              CryptoJS.AES.decrypt(
                r.programData.generalData,
                SECRET_KEY
              ).toString(CryptoJS.enc.Utf8)
            );
            if (
              !downloadedPrograms.find(
                (p) =>
                  p.programId == pd.programId &&
                  p.versionId == pd.currentVersion.versionId
              )
            ) {
              downloadedPrograms.push({
                programId: pd.programId,
                label: pd.programName || { label_en: "Unknown" },
                code: pd.programCode,
                versionId: pd.currentVersion.versionId,
                displayLabel: `${pd.programCode}~v${pd.currentVersion.versionId}`,
              });
            }
          }
        });

        const sortedDownloaded = downloadedPrograms.sort((a, b) =>
          (a.displayLabel || "").toUpperCase() >
          (b.displayLabel || "").toUpperCase()
            ? 1
            : -1
        );
        const sortedAll = allPrograms.sort((a, b) =>
          (a.programCode || "").toUpperCase() >
          (b.programCode || "").toUpperCase()
            ? 1
            : -1
        );

        this.setState({
          downloadedPrograms: sortedDownloaded,
          allProgramsForExport: sortedAll,
        });
      };
    };
  };

  /**
   * Handle onlyDownloadedPrograms checkbox change
   */
  handleOnlyDownloadedChange = (e) => {
    this.setState({
      onlyDownloadedPrograms: e.target.checked,
      exportProgramIds: [],
      exportVersionId: "",
      exportPlanningUnitIds: [],
      versionsForExport: [],
      planningUnitsForExport: [],
      puByProgramForExport: {},
    });
  };

  /**
   * Handle program selection change
   */
  handleExportProgramChange = (selectedPrograms) => {
    this.setState(
      {
        exportProgramIds: selectedPrograms,
        exportVersionId: "",
        exportPlanningUnitIds: [],
        planningUnitsForExport: [],
        puByProgramForExport: {},
      },
      () => {
        if (selectedPrograms.length > 0) {
          this.fetchVersionsAndPlanningUnits();
        }
      }
    );
  };

  /**
   * Fetch versions and planning units based on selected programs
   */
  fetchVersionsAndPlanningUnits = (resetSelections = true) => {
    const { exportProgramIds, onlyDownloadedPrograms, exportVersionId } =
      this.state;
    const lang = this.state.lang;
    const vId = onlyDownloadedPrograms
      ? null
      : exportProgramIds.length > 1
      ? null
      : exportVersionId || null;
    if (onlyDownloadedPrograms || String(vId).includes("Local")) {
      const selectedProgramIds = exportProgramIds.map((p) => p.value);
      getDatabase();
      const req = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      req.onsuccess = (e) => {
        const db = e.target.result;
        const ppuGet = db
          .transaction(["programPlanningUnit"], "readwrite")
          .objectStore("programPlanningUnit")
          .getAll();
        ppuGet.onsuccess = () => {
          // Build per-program PU map
          const puByProgram = {};
          (ppuGet.result || [])
            .filter(
              (r) =>
                selectedProgramIds
                  .map((id) => String(id))
                  .includes(String(r.program.id)) && r.active
            )
            .forEach((r) => {
              const pid = String(r.program.id);
              if (!puByProgram[pid]) puByProgram[pid] = [];
              puByProgram[pid].push({
                label: r.planningUnit.label,
                value: r.planningUnit.id,
                json: r,
              });
            });

          // Deduplicate and sort within each program
          Object.keys(puByProgram).forEach((pid) => {
            const seen = new Map();
            puByProgram[pid].forEach((p) => seen.set(p.value, p));
            puByProgram[pid] = [...seen.values()].sort((a, b) =>
              getLabelText(a.label, lang).toUpperCase() >
              getLabelText(b.label, lang).toUpperCase()
                ? 1
                : -1
            );
          });

          // Flat union for the dropdown display (deduplicated by PU id)
          const flatUnion = [];
          const seenIds = new Set();
          Object.values(puByProgram)
            .flat()
            .forEach((p) => {
              if (!seenIds.has(p.value)) {
                seenIds.add(p.value);
                flatUnion.push(p);
              }
            });
          flatUnion.sort((a, b) =>
            getLabelText(a.label, lang).toUpperCase() >
            getLabelText(b.label, lang).toUpperCase()
              ? 1
              : -1
          );

          this.setState({
            planningUnitsForExport: flatUnion,
            puByProgramForExport: puByProgram, // keyed map for per-program filtering
            exportPlanningUnitIds: resetSelections
              ? flatUnion.map((p) => ({
                  label: getLabelText(p.label, lang) + " | " + p.value,
                  value: p.value,
                }))
              : this.state.exportPlanningUnitIds,
          });
        };
      };
    }
    if (!onlyDownloadedPrograms) {
      if (exportProgramIds.length == 1) {
        const selectedProgramId = exportProgramIds[0].value;
        DropdownService.getVersionListForSPProgram(selectedProgramId)
          .then((res) => {
            let verList = [...(res.data || [])];
            getDatabase();
            const req = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            req.onsuccess = (e) => {
              const db = e.target.result;
              const get = db
                .transaction(["programData"], "readwrite")
                .objectStore("programData")
                .getAll();
              get.onsuccess = () => {
                const userId = CryptoJS.AES.decrypt(
                  localStorage.getItem("curUser"),
                  SECRET_KEY
                ).toString(CryptoJS.enc.Utf8);
                get.result.forEach((r) => {
                  if (
                    r.userId == userId &&
                    String(r.programId) == String(selectedProgramId)
                  ) {
                    const pd = JSON.parse(
                      CryptoJS.AES.decrypt(
                        r.programData.generalData,
                        SECRET_KEY
                      ).toString(CryptoJS.enc.Utf8)
                    );
                    if (pd.currentVersion) {
                      pd.currentVersion.versionId = `${pd.currentVersion.versionId} (Local)`;
                      verList.push(pd.currentVersion);
                    }
                  }
                });
                const unique = [
                  ...new Map(verList.map((v) => [v.versionId, v])).values(),
                ];
                const versionList = unique.sort((a, b) => {
                  const aLocal = String(a.versionId).includes("Local");
                  const bLocal = String(b.versionId).includes("Local");
                  if (aLocal && !bLocal) return -1;
                  if (!aLocal && bLocal) return 1;
                  const aNum =
                    parseInt(String(a.versionId).replace(/[^0-9]/g, ""), 10) ||
                    0;
                  const bNum =
                    parseInt(String(b.versionId).replace(/[^0-9]/g, ""), 10) ||
                    0;
                  return bNum - aNum;
                });
                const localVer = versionList.find((v) =>
                  String(v.versionId).includes("Local")
                );
                this.setState(
                  {
                    versionsForExport: versionList,
                    exportVersionId: resetSelections
                      ? localVer
                        ? localVer.versionId
                        : versionList.length > 0
                        ? versionList[0].versionId
                        : ""
                      : this.state.exportVersionId,
                  },
                  () => {
                    if (!String(vId).includes("Local")) {
                      this.fetchPlanningUnitsForExportProgram(
                        selectedProgramId,
                        resetSelections
                      );
                    }
                  }
                );
              };
            };
          })
          .catch(() => this.setState({ versionsForExport: [] }));
      } else {
        // Multiple programs: fetch PUs per-program separately and store the map
        const programIds = exportProgramIds.map((p) => p.value);
        Promise.all(
          programIds.map((pid) =>
            ReportService.getDropdownListByProgramIds({
              programIds: [pid],
              onlyAllowPuPresentAcrossAllPrograms: false,
            })
              .then((res) => ({
                pid: String(pid),
                puList: res.data.planningUnitList || [],
              }))
              .catch(() => ({ pid: String(pid), puList: [] }))
          )
        ).then((results) => {
          const puByProgram = {};
          results.forEach(({ pid, puList }) => {
            puByProgram[pid] = puList
              .map((p) => ({ ...p, value: p.id, json: p }))
              .sort((a, b) =>
                getLabelText(a.label, lang).toUpperCase() >
                getLabelText(b.label, lang).toUpperCase()
                  ? 1
                  : -1
              );
          });

          // Flat union for the dropdown (deduplicated by PU id)
          const flatUnion = [];
          const seenIds = new Set();
          Object.values(puByProgram)
            .flat()
            .forEach((p) => {
              if (!seenIds.has(p.id || p.value)) {
                seenIds.add(p.id || p.value);
                flatUnion.push(p);
              }
            });
          flatUnion.sort((a, b) =>
            getLabelText(a.label, lang).toUpperCase() >
            getLabelText(b.label, lang).toUpperCase()
              ? 1
              : -1
          );

          this.setState({
            planningUnitsForExport: flatUnion,
            puByProgramForExport: puByProgram,
            exportPlanningUnitIds: resetSelections
              ? flatUnion.map((p) => ({
                  label:
                    getLabelText(p.label, lang) + " | " + (p.id || p.value),
                  value: p.id || p.value,
                }))
              : this.state.exportPlanningUnitIds,
          });
        });
      }
    }
  };

  fetchPlanningUnitsForExportProgram = (programId, resetSelections = true) => {
    const lang = this.state.lang;
    ReportService.getDropdownListByProgramIds({
      programIds: [programId],
      onlyAllowPuPresentAcrossAllPrograms: false,
    })
      .then((res) => {
        const puList = (res.data.planningUnitList || []).sort((a, b) =>
          getLabelText(a.label, lang).toUpperCase() >
          getLabelText(b.label, lang).toUpperCase()
            ? 1
            : -1
        );
        // Store both the flat list for the dropdown and the per-program map
        const puByProgram = {
          [String(programId)]: puList.map((p) => ({
            ...p,
            value: p.id,
            json: p,
          })),
        };
        this.setState({
          planningUnitsForExport: puList,
          puByProgramForExport: puByProgram,
          exportPlanningUnitIds: resetSelections
            ? puList.map((p) => ({
                label: getLabelText(p.label, lang) + " | " + p.id,
                value: p.id,
              }))
            : this.state.exportPlanningUnitIds,
        });
      })
      .catch(() =>
        this.setState({ planningUnitsForExport: [], puByProgramForExport: {} })
      );
  };

  /**
   * Handle version selection change
   */
  handleExportVersionChange = (e) => {
    this.setState(
      {
        exportVersionId: e.target.value,
        exportPlanningUnitIds: [],
      },
      () => {
        if (this.state.exportVersionId) {
          this.fetchPlanningUnitsForExportProgram(
            this.state.exportProgramIds[0].value
          );
        }
      }
    );
  };

  /**
   * Handle export planning unit selection
   */
  handleExportPlanningUnitChange = (selectedUnits) => {
    this.setState({
      exportPlanningUnitIds: selectedUnits,
    });
  };

  /**
   * Fetch data for export
   */
  fetchDataForExport = () => {
    const {
      exportProgramIds,
      exportVersionId,
      exportPlanningUnitIds,
      rangeValue,
      onlyDownloadedPrograms,
      puByProgramForExport,
    } = this.state;

    const programIds = (exportProgramIds || []).map((p) => p.value);
    // All selected PU ids (user's selection in the modal)
    const selectedPuIds = new Set(
      (exportPlanningUnitIds || []).map((p) => String(p.value || p.id))
    );

    const startDate = `${rangeValue.from.year}-${String(
      rangeValue.from.month
    ).padStart(2, "0")}-01`;
    const lastDay = new Date(
      rangeValue.to.year,
      rangeValue.to.month,
      0
    ).getDate();
    const endDate = `${rangeValue.to.year}-${String(
      rangeValue.to.month
    ).padStart(2, "0")}-${lastDay}`;

    this.setState({ exportLoading: true, exportMessage: "" });

    const fetchProgramData = (pId) => {
      const vId = onlyDownloadedPrograms
        ? exportProgramIds.find((p) => p.value == pId)?.versionId
        : programIds.length > 1
        ? null
        : exportVersionId || null;

      // Derive a clean numeric versionId:
      // - null / undefined / "" / -1  → send -1 (server treats as "latest")
      // - "123 (Local)"               → parse the numeric part only
      // - "123"                        → parseInt
      // - NaN guard: if parseInt fails, fall back to -1
      let cleanVersionId;
      if (vId == null || vId == "" || vId == -1) {
        cleanVersionId = -1;
      } else if (String(vId).includes("Local")) {
        const parsed = parseInt(String(vId).split("(")[0].trim(), 10);
        cleanVersionId = isNaN(parsed) ? -1 : parsed;
      } else {
        const parsed = parseInt(String(vId), 10);
        cleanVersionId = isNaN(parsed) ? -1 : parsed;
      }

      // ── Fix 2 & 3: only pass PUs that belong to THIS program ──
      const programPuIds = ((puByProgramForExport || {})[String(pId)] || [])
        .map((p) => Number(p.id || p.value))
        .filter((id) => selectedPuIds.has(id));

      // Fallback: if no per-program map available, use full selected list
      const planningUnitIds =
        programPuIds.length > 0 ? programPuIds : [...selectedPuIds];

      const inputjson = {
        programId: pId,
        programIds: [pId],
        versionId: cleanVersionId,
        startDate: startDate,
        stopDate: endDate,
        planningUnitIds: planningUnitIds,
        stockStatusConditions: this.state.stockStatusValues.map((e) =>
          Number(e.value)
        ),
        removePlannedShipments: this.state.removePlannedShipments
          ? 1
          : this.state.removeTBDFundingSourceShipments
          ? 2
          : 0,
        fundingSourceIds: [],
        procurementAgentIds: [],
        showByQty: this.state.showQuantity,
      };

      if (onlyDownloadedPrograms || String(vId).includes("Local")) {
        return new Promise((resolve) => {
          this.fetchExportDataFromIndexedDB(
            pId,
            vId,
            planningUnitIds,
            startDate,
            endDate,
            resolve
          );
        });
      } else {
        return ProductService.getStockStatusMatrixData(inputjson).then(
          (response) => {
            const matrix = (response.data.stockStatusMatrix || []).map((r) => ({
              ...r,
              programId: pId,
              planBasedOn: r.planBasedOn ?? r.planningUnit?.planBasedOn ?? 1,
            }));
            const details = (response.data.stockStatusDetails || []).map(
              (r) => ({
                ...r,
                programId: pId,
              })
            );
            return { matrix, details };
          }
        );
      }
    };

    Promise.all(programIds.map((id) => fetchProgramData(id)))
      .then((allResults) => {
        const combinedMatrix = allResults.flatMap((r) => r.matrix || []);
        const combinedDetails = allResults.flatMap((r) => r.details || []);

        this.prepareExportData(
          combinedMatrix,
          combinedDetails,
          startDate,
          endDate,
          () => {
            this.setState({
              exportModal: false,
              onlyDownloadedPrograms: false,
            });
            if (this.state.exportType == 1) {
              this.exportPDFFromModal();
            } else {
              this.exportCSVFromModal();
            }
          }
        );
      })
      .catch((err) => {
        console.error("Export Error:", err);
        this.setState({
          exportLoading: false,
          exportMessage: i18n.t("static.common.error"),
        });
      });
  };
  /**
   * Fetch export data from IndexedDB for downloaded programs
   */
  fetchExportDataFromIndexedDB = (
    programId,
    versionId,
    planningUnitIds,
    startDate,
    endDate,
    resolve // Added
  ) => {
    const version = String(versionId).split("(")[0].trim();
    const userId = CryptoJS.AES.decrypt(
      localStorage.getItem("curUser"),
      SECRET_KEY
    ).toString(CryptoJS.enc.Utf8);
    const key = `${programId}_v${version}_uId_${userId}`;

    getDatabase();
    const req = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    req.onsuccess = (e) => {
      const db = e.target.result;
      const get = db
        .transaction(["programData"], "readwrite")
        .objectStore("programData")
        .get(key);
      get.onsuccess = () => {
        const programData = get.result?.programData;
        if (!programData) {
          this.setState({
            exportLoading: false,
            exportModal: false, // Added
            exportMessage: i18n.t("static.program.errortext"),
          });
          return;
        }

        const puDataList = programData.planningUnitDataList || [];
        const generalData = JSON.parse(
          CryptoJS.AES.decrypt(programData.generalData, SECRET_KEY).toString(
            CryptoJS.enc.Utf8
          )
        );

        const matrix = [];
        const details = [];

        planningUnitIds.forEach((puId) => {
          const puItem = this.state.planningUnitsForExport.find(
            (p) => String(p.id || p.value) == String(puId)
          );
          const puActualLabel = puItem
            ? puItem.label
            : { label_en: String(puId) };

          const puSettings =
            this.state.planningUnitsForExport.find(
              (p) => String(p.value || p.id) == String(puId)
            ) || {};
          const minMos =
            puSettings.json?.minMonthsOfStock ??
            puSettings.minMonthsOfStock ??
            5;
          const reorderFreq =
            puSettings.json?.reorderFrequencyInMonths ??
            puSettings.reorderFrequencyInMonths ??
            5;
          const planBasedOn =
            puSettings.json?.planBasedOn ?? puSettings.planBasedOn ?? 1;
          const minStock = puSettings.json?.minQty ?? puSettings.minQty ?? 0;
          const notes = puSettings.json?.notes ?? puSettings.notes ?? "";

          const puDataIdx = puDataList.findIndex(
            (p) => p.planningUnitId == puId
          );
          let programJson = { supplyPlan: [] };
          if (puDataIdx !== -1) {
            const bytes = CryptoJS.AES.decrypt(
              puDataList[puDataIdx].planningUnitData,
              SECRET_KEY
            );
            programJson = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
          }

          const inRangeEntries = (programJson.supplyPlan || []).filter(
            (sp) =>
              sp.planningUnitId == puId &&
              sp.transDate >= startDate &&
              sp.transDate <= endDate
          );

          let maxStock;
          if (planBasedOn == 2) {
            maxStock = calcAverageMaxStock(
              inRangeEntries,
              minStock,
              reorderFreq
            );
          } else {
            maxStock = puSettings.json?.maxStock || 0;
          }

          const dataMap = {};
          inRangeEntries.forEach((sp) => {
            const useWps = this.state.removePlannedShipments;
            const useWtbd = this.state.removeTBDFundingSourceShipments;

            const mos = useWps ? sp.mosWps : useWtbd ? sp.mosWtbdps : sp.mos;
            const cb = useWps
              ? sp.closingBalanceWps
              : useWtbd
              ? sp.closingBalanceWtbdps
              : sp.closingBalance;
            const amc = sp.amc;

            let statusId;
            if (planBasedOn == 1) {
              statusId = calcStatusIdLocal(mos, minMos, reorderFreq);
            } else {
              const dynamicMax =
                amc != null ? minStock + reorderFreq * amc : maxStock;
              statusId =
                cb == null
                  ? -1
                  : cb == 0
                  ? 0
                  : cb < minStock
                  ? 1
                  : cb > dynamicMax
                  ? 3
                  : 2;
            }

            const shipmentQty = useWps
              ? sp.shipmentTotalQtyWps
              : useWtbd
              ? sp.shipmentTotalQtyWtbdps
              : sp.shipmentTotalQty;
            const expiredQty = useWps
              ? sp.expiredStockWps
              : useWtbd
              ? sp.expiredStockWtbdps
              : sp.expiredStock;

            dataMap[sp.transDate] = {
              mos,
              closingBalance: cb,
              amc,
              stockStatusId: statusId,
              actualStock: !!sp.actualStock,
              shipmentQty,
              expiredQty,
            };
            details.push({
              programId: programId, // Added
              month: sp.transDate,
              planningUnit: { id: Number(puId), label: puActualLabel },
              consumptionQty: sp.consumption || 0,
              actualConsumption: !!sp.actualConsumption,
              amc,
              closingBalance: cb,
              actualStock: !!sp.actualStock,
              mos,
              stockStatusId: statusId,
            });
          });

          matrix.push({
            programId: programId, // Added
            planningUnit: { id: Number(puId), label: puActualLabel },
            planBasedOn,
            minMonthsOfStock: minMos,
            reorderFrequency: reorderFreq,
            maxStock: Math.round(maxStock),
            minStock,
            dataMap,
            notes,
          });
        });

        if (resolve) resolve({ matrix, details });
      };
    };
  };

  /**
   * Apply status recalculation for plan-by-qty matrices
   */
  applyStatusRecalculation = (stockStatusMatrix, startDate, endDate) => {
    return (stockStatusMatrix || []).map((row) => {
      if (row.planBasedOn !== 2) return row;

      const inRangeEntries = Object.entries(row.dataMap || {}).filter(
        ([dateKey]) => dateKey >= startDate && dateKey <= endDate
      );
      const avgMax = calcAverageMaxStock(
        inRangeEntries.map(([, entry]) => entry),
        row.minStock || 0,
        row.reorderFrequency || 0
      );

      const updatedDataMap = {};
      inRangeEntries.forEach(([dateKey, entry]) => {
        const amc = entry.amc;
        const cb = entry.closingBalance;
        const minStock = row.minStock || 0;
        const dynamicMax =
          amc != null ? minStock + (row.reorderFrequency || 0) * amc : avgMax;
        const statusId =
          cb == null
            ? -1
            : cb == 0
            ? 0
            : cb < minStock
            ? 1
            : cb > dynamicMax
            ? 3
            : 2;
        updatedDataMap[dateKey] = { ...entry, stockStatusId: statusId };
      });

      return { ...row, maxStock: Math.round(avgMax), dataMap: updatedDataMap };
    });
  };

  /**
   * Prepare data for export
   */
  prepareExportData = (
    stockStatusMatrix,
    stockStatusDetails,
    startDate,
    endDate,
    callback
  ) => {
    const { from, to } = this.state.rangeValue;

    const recalculatedMatrix = this.applyStatusRecalculation(
      stockStatusMatrix,
      startDate,
      endDate
    );

    const rangeFilteredDetails = (stockStatusDetails || []).filter(
      (d) => d.month >= startDate && d.month <= endDate
    );
    const monthColumns = deriveMonthColumns(
      recalculatedMatrix,
      startDate,
      endDate
    );

    const selectedIds = this.state.stockStatusValues.map((v) =>
      Number(v.value)
    );
    let filteredMatrix = recalculatedMatrix;
    let filteredDetails = rangeFilteredDetails;

    if (selectedIds.length > 0) {
      filteredMatrix = (stockStatusMatrix || []).filter((row) =>
        Object.values(row.dataMap || {}).some((d) =>
          selectedIds.includes(d.stockStatusId)
        )
      );
      filteredDetails = (rangeFilteredDetails || []).filter((d) =>
        selectedIds.includes(d.stockStatusId)
      );
    }

    this.setState(
      {
        PlanningUnitDataForExport: {
          stockStatusMatrix: filteredMatrix,
          stockStatusDetails: filteredDetails,
          monthColumns: monthColumns,
          startDate: startDate,
          endDate: endDate,
          showQuantity: this.state.showQuantity,
          lang: this.state.lang,
        },
      },
      () => {
        // Wait for hidden charts to render.
        setTimeout(() => {
          if (callback) {
            callback();
          } else {
            if (this.state.exportType == 1) {
              this.exportPDFFromModal();
            } else {
              this.exportCSVFromModal();
            }
          }
        }, 1200);
      }
    );
  };

  /**
   * Export PDF from modal data
   */
  exportPDFFromModal = () => {
    const {
      stockStatusMatrix,
      stockStatusDetails,
      monthColumns,
      showQuantity,
      lang,
      startDate,
      endDate,
    } = this.state.PlanningUnitDataForExport || {};
    const doc = new jsPDF("landscape", "pt", "A4");
    console.log("PlanningUnitDataForExport Test@123",this.state.planningUnitsForExport)
    // Pre-render FA icons from the browser's loaded FontAwesome font once,
    // so didDrawCell can stamp them synchronously without re-creating canvases.
    const iconCache = buildPdfIconCache();
    // iconPt: the pt size we stamp each icon at inside the cell
    const ICON_PT = 8;
    // gap between icons and between last icon and the value text
    const ICON_GAP = 2;

    const addHeaders = (d) => {
      const n = d.internal.getNumberOfPages();
      for (let i = 1; i <= n; i++) {
        d.setPage(i);
        if (String(LOGO).startsWith("data:image")) {
          d.addImage(LOGO, "png", 30, 10, 180, 50, "FAST");
        }
        d.setFontSize(14);
        d.setFont("helvetica", "bold");
        d.setTextColor("#002f6c");
        d.text(
          i18n.t("static.dashboard.stockstatusmatrix"),
          d.internal.pageSize.width / 2,
          40,
          { align: "center" }
        );
      }
    };

    const addFooters = (d) => {
      const n = d.internal.getNumberOfPages();
      d.setFont("helvetica", "normal");
      d.setFontSize(7);
      for (let i = 1; i <= n; i++) {
        d.setPage(i);
        d.text(`Page ${i} of ${n}`, 40, d.internal.pageSize.height - 30);
        d.text(
          `Copyright © 2020 ${i18n.t("static.footer")}`,
          d.internal.pageSize.width - 40,
          d.internal.pageSize.height - 30,
          { align: "right" }
        );
      }
    };

    const renderBoldLine = (label, value, x, y, maxWidth) => {
      doc.setFont("helvetica", "bold");
      const fullLabel = label + ": ";
      doc.text(fullLabel, x, y);
      const labelWidth = doc.getTextWidth(fullLabel);
      doc.setFont("helvetica", "normal");
      if (maxWidth) {
        const lines = doc.splitTextToSize(String(value), maxWidth - labelWidth);
        doc.text(lines, x + labelWidth, y);
        return lines.length * 11 + 4;
      } else {
        doc.text(String(value), x + labelWidth, y);
        return 15;
      }
    };

    const renderFilterSummary = (
      currentY,
      showAll = true,
      progLabel = null,
      puLabel = null,
      versionText = null,
      onlyProgram = false
    ) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor("#002f6c");

      if (showAll) {
        currentY += renderBoldLine(
          i18n.t("static.report.dateRange"),
          `${moment(startDate).format("MMM YYYY")} ~ ${moment(endDate).format(
            "MMM YYYY"
          )}`,
          40,
          currentY
        );

        const programNames = (this.state.exportProgramIds || [])
          .map((p) => p.label.split("~v")[0])
          .join(", ");
        currentY += renderBoldLine(
          i18n.t("static.program.program"),
          programNames,
          40,
          currentY,
          doc.internal.pageSize.width - 80
        );

        if (this.state.exportProgramIds.length == 1) {
          const rawLabel = this.state.exportProgramIds[0].label;
          const vFromLabel = rawLabel.includes("~v")
            ? rawLabel.split("~v")[1]+" (Local)"
            : null;
          const vText =
            vFromLabel ||
            (this.state.onlyDownloadedPrograms
              ? this.state.exportProgramIds[0].versionId ||
                i18n.t("static.report.latest")
              : this.state.exportVersionId);
          currentY += renderBoldLine(
            i18n.t("static.report.version"),
            vText,
            40,
            currentY
          );
        }

        const puNames = (this.state.exportPlanningUnitIds || [])
          .map((p) => p.label)
          .join(", ");
        currentY += renderBoldLine(
          i18n.t("static.planningunit.planningunit"),
          puNames,
          40,
          currentY,
          doc.internal.pageSize.width - 80
        );

        currentY += renderBoldLine(
          i18n.t("static.report.withinstock"),
          (this.state.stockStatusValues || []).map((v) => v.label).join(", "),
          40,
          currentY,
          doc.internal.pageSize.width - 80
        );
        currentY += renderBoldLine(
          i18n.t("static.report.showQuantity"),
          showQuantity
            ? i18n.t("static.program.yes")
            : i18n.t("static.program.no"),
          40,
          currentY
        );
        currentY += renderBoldLine(
          i18n.t("static.report.removePlannedShipments"),
          this.state.removePlannedShipments
            ? i18n.t("static.program.yes")
            : i18n.t("static.program.no"),
          40,
          currentY
        );
        currentY += renderBoldLine(
          i18n.t("static.report.removeTBDFundingSourceShipments"),
          this.state.removeTBDFundingSourceShipments
            ? i18n.t("static.program.yes")
            : i18n.t("static.program.no"),
          40,
          currentY
        );
      } else {
        const [cleanProg, vFromProg] = (progLabel || "").split("~v");
        currentY += renderBoldLine(
          i18n.t("static.program.program"),
          cleanProg,
          40,
          currentY,
          doc.internal.pageSize.width - 80
        );
      }
      return currentY;
    };

    // First Page: Filters only
    renderFilterSummary(80);

    const uniquePrograms = this.state.exportProgramIds;
    uniquePrograms.forEach((prog) => {
      const progId = prog.value;
      const programFilteredMatrix = (stockStatusMatrix || []).filter(
        (m) => String(m.programId) == String(progId)
      );
      const progPUIds = (this.state.exportPlanningUnitIds || [])
        .filter((p) =>
          programFilteredMatrix.some((m) => m.planningUnit.id == p.value)
        )
        .map((p) => p.label);
      if (progPUIds.length > 0) {
        const progLabel = prog.label;

        if (programFilteredMatrix.length == 0) return;

        const programFilteredDetails = (stockStatusDetails || []).filter(
          (d) => String(d.programId) == String(progId)
        );

        const progPUIdsLabel = (this.state.exportPlanningUnitIds || [])
          .filter((p) =>
            programFilteredMatrix.some((m) => m.planningUnit.id == p.value)
          )
          .map((p) => p.label)
          .join(", ");

        // Section 1: Matrix Table (with horizontal chunking)
        const maxColsPerPage = 15;
        const chunks = [];
        for (let i = 0; i < monthColumns.length; i += maxColsPerPage) {
          chunks.push(monthColumns.slice(i, i + maxColsPerPage));
        }

        chunks.forEach((chunkMonths, cIdx) => {
          doc.addPage();
          let y = 80;
          const versionText = this.state.onlyDownloadedPrograms
            ? prog.versionId || i18n.t("static.report.latest")
            : uniquePrograms.length == 1
            ? this.state.exportVersionId
            : i18n.t("static.report.latest");

          if (cIdx == 0) {
            y = renderFilterSummary(
              y,
              false,
              progLabel,
              progPUIdsLabel,
              versionText,
              false
            );
          } else {
            y = renderFilterSummary(
              y,
              false,
              progLabel,
              progPUIdsLabel,
              versionText,
              true
            );
          }

          const head = [
            [
              i18n.t("static.planningunit.planningunit"),
              i18n.t("static.stockStatus.plannedBy"),
              i18n.t("static.stockStatusMatrix.minMax"),
              ...chunkMonths.map((d) => moment(d).format("MMM YY")),
              i18n.t("static.program.notes"),
            ],
          ];
          const body = programFilteredMatrix.map((row) => {
            const minMax =
              row.planBasedOn == 1
                ? `${formatterMOS(row.minMonthsOfStock, 0)} / ${formatterMOS(
                    Number(row.minMonthsOfStock) + Number(row.reorderFrequency),
                    0
                  )}`
                : `${formatter(Math.round(row.minStock || 0))} / ${formatter(
                    Math.round(row.maxStock || 0)
                  )}`;

            return [
              getLabelText(row.planningUnit.label, this.state.lang) +
                " | " +
                row.planningUnit.id,
              row.planBasedOn == 1
                ? i18n.t("static.report.mos")
                : i18n.t("static.report.qty"),
              minMax,
              ...chunkMonths.map((dateKey) => {
                const entry = (row.dataMap || {})[dateKey];
                const raw = entry
                  ? cellDisplayValue(entry, showQuantity, row.planBasedOn)
                  : null;
                if (raw == null) return i18n.t("static.supplyPlanFormula.na");
                const formatted =
                  showQuantity || row.planBasedOn == 2
                    ? formatter(raw)
                    : formatterMOS(raw, 2);
                return formatted !== i18n.t("static.supplyPlanFormula.na")
                  ? formatted.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  : formatted;
              }),
              row.notes || "",
            ];
          });

          doc.autoTable({
            startY: y + 10,
            head: head,
            body: body,
            margin: { top: 120 },
            // ── FIX 1 & 2: dynamic left padding based on which icons are present ──
            // We pre-compute per-cell icon widths so text never overlaps icons.
            // The didParseCell hook sets left padding to accommodate 0, 1, or 2 icons.
            styles: {
              lineWidth: 1,
              fontSize: 6,
              halign: "center",
              valign: "middle",
              overflow: "linebreak",
            },
            columnStyles: {
              0: { cellWidth: 100, halign: "left" },
              [3 + chunkMonths.length]: { halign: "left" },
            },
            didDrawPage(data) {
              if (data.pageNumber > 1) {
                renderFilterSummary(
                  80,
                  false,
                  progLabel,
                  progPUIdsLabel,
                  versionText,
                  true
                );
              }
            },
            didParseCell(data) {
              if (
                data.section == "body" &&
                data.column.index >= 3 &&
                data.column.index < 3 + chunkMonths.length
              ) {
                const dateKey = chunkMonths[data.column.index - 3];
                const rowData = programFilteredMatrix[data.row.index];
                const entry = (rowData.dataMap || {})[dateKey];
                const bgColor = entry
                  ? colorForStatus(entry.stockStatusId)
                  : "#cfcdc9";
                data.cell.styles.fillColor = bgColor;
                if (bgColor == "#BA0C2F" || bgColor == "#118b70") {
                  data.cell.styles.textColor = "#ffffff";
                }

                // Reserve left padding for however many icons will be drawn:
                // each icon is ICON_PT wide + ICON_GAP, plus a 2pt left buffer.
                const hasTruck = entry && entry.shipmentQty > 0;
                const hasWarning = entry && entry.expiredQty > 0;
                const iconCount = (hasTruck ? 1 : 0) + (hasWarning ? 1 : 0);
                const leftPad =
                  iconCount > 0 ? 2 + iconCount * (ICON_PT + ICON_GAP) : 4;
                data.cell.styles.halign = "center";
                data.cell.styles.cellPadding = {
                  left: leftPad,
                  right: 2,
                  top: 2,
                  bottom: 2,
                };
              }
            },
            didDrawCell(data) {
              if (
                data.section == "body" &&
                data.column.index >= 3 &&
                data.column.index < 3 + chunkMonths.length && data.row.index!=-1
              ) {
                const dateKey = chunkMonths[data.column.index - 3];
                console.log("programFilteredMatrix Test@123",data.row.index);
                const rowData = programFilteredMatrix[data.row.index];
                const entry = (rowData.dataMap || {})[dateKey];
                if (!entry) return;

                // Stamp FA icons as tiny PNG images, advancing x after each one.
                // Icons are vertically centred within the cell.
                let iconX = data.cell.x + 2;
                const iconY = data.cell.y + (data.cell.height - ICON_PT) / 2;

                const bgColor = entry
                  ? colorForStatus(entry.stockStatusId)
                  : "#cfcdc9";
                const isLight = bgColor == "#BA0C2F" || bgColor == "#118b70";
                const version = isLight ? "light" : "dark";

                if (entry.shipmentQty > 0 && iconCache.truck[version]) {
                  doc.addImage(
                    iconCache.truck[version].dataUrl,
                    "PNG",
                    iconX,
                    iconY,
                    ICON_PT,
                    ICON_PT
                  );
                  iconX += ICON_PT + ICON_GAP;
                }

                if (entry.expiredQty > 0 && iconCache.warning[version]) {
                  doc.addImage(
                    iconCache.warning[version].dataUrl,
                    "PNG",
                    iconX,
                    iconY,
                    ICON_PT,
                    ICON_PT
                  );
                }
              }
            },
          });
        });

        // Section 2: Graph
        const canvas = document.getElementById(`export-chart-${progId}`);
        if (canvas && typeof canvas.toDataURL == "function") {
          const canvasImg = canvas.toDataURL("image/png", 1.0);
          if (
            canvasImg &&
            canvasImg.length > 100 &&
            canvasImg.startsWith("data:image")
          ) {
            doc.addPage();
            renderFilterSummary(
              80,
              false,
              progLabel,
              progPUIdsLabel,
              versionText,
              true
            );
            doc.addImage(canvasImg, "png", 40, 120, 750, 420);
          }
        }

        // Section 3: Details Table
        doc.addPage();
        const headDet = [
          [
            i18n.t("static.common.month"),
            i18n.t("static.planningunit.planningunit"),
            i18n.t("static.supplyPlan.consumption"),
            i18n.t("static.report.amc"),
            i18n.t("static.report.stock"),
            i18n.t("static.report.mos"),
            i18n.t("static.dashboard.stockstatusmain"),
          ],
        ];

        const bodyDet = programFilteredDetails.map((row) => {
          const matrixRow = programFilteredMatrix.find(
            (m) => String(m.planningUnit.id) == String(row.planningUnit.id)
          );
          const planBasedOn = matrixRow
            ? matrixRow.planBasedOn ?? matrixRow.planningUnit?.planBasedOn ?? 1
            : row.planningUnit?.planBasedOn ?? 1;
          const statusLabel = (
            STOCK_STATUS_MAP[row.stockStatusId] || STOCK_STATUS_MAP["-1"]
          ).label;
          return [
            moment(row.month).format("MMM YY"),
            getLabelText(row.planningUnit.label, this.state.lang) +
              " | " +
              row.planningUnit.id,
            row.consumptionQty != null
              ? formatter(Math.round(row.consumptionQty))
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : "",
            row.amc != null
              ? formatter(Math.round(row.amc))
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : "",
            row.closingBalance != null
              ? formatter(Math.round(row.closingBalance))
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : "",
            planBasedOn == 2
              ? "-"
              : row.mos != null
              ? formatterMOS(roundAMC(row.mos), 1)
              : i18n.t("static.supplyPlanFormula.na"),
            statusLabel,
          ];
        });
        let y = 80;
        const versionText = this.state.onlyDownloadedPrograms
          ? prog.versionId || i18n.t("static.report.latest")
          : uniquePrograms.length == 1
          ? this.state.exportVersionId
          : i18n.t("static.report.latest");

        doc.autoTable({
          startY:
            renderFilterSummary(
              y,
              false,
              progLabel,
              progPUIdsLabel,
              versionText
            ) + 10,
          head: headDet,
          body: bodyDet,
          margin: { top: 120 },
          styles: {
            lineWidth: 1,
            fontSize: 6,
            halign: "center",
            valign: "middle",
            overflow: "linebreak",
          },
          columnStyles: {
            1: { cellWidth: 150, halign: "left" },
            6: { halign: "left" },
          },
          didDrawPage(data) {
            if (data.pageNumber > 1) {
              renderFilterSummary(
                80,
                false,
                progLabel,
                progPUIdsLabel,
                versionText,
                true
              );
            }
          },
          didParseCell(data) {
            if (data.section == "body") {
              const rowData = programFilteredDetails[data.row.index];
              const matrixRow = programFilteredMatrix.find(
                (m) =>
                  String(m.planningUnit.id) == String(rowData.planningUnit.id)
              );
              const pbo = matrixRow ? matrixRow.planBasedOn : 1;
              const bg = colorForStatus(rowData.stockStatusId);
              if (
                data.column.index == 6 ||
                (data.column.index == 5 && pbo !== 2)
              ) {
                data.cell.styles.fillColor = bg;
                if (bg == "#BA0C2F" || bg == "#118b70")
                  data.cell.styles.textColor = "#ffffff";
              }
            }
          },
        });
      }
    });

    addHeaders(doc);
    addFooters(doc);
    doc.save(i18n.t("static.dashboard.stockstatusmatrix") + ".pdf");
    this.setState({ exportModal: false, exportLoading: false });
  };

  /**
   * Export CSV from modal data
   * ── FIX 3: all filter values are now included in the CSV header block ──
   */
  exportCSVFromModal = () => {
    const {
      stockStatusMatrix,
      stockStatusDetails,
      monthColumns,
      showQuantity,
      startDate,
      endDate,
    } = this.state.PlanningUnitDataForExport || {};

    const csvRow = [];

    // ── Date range ──
    csvRow.push(
      '"' +
        (
          i18n.t("static.report.dateRange") +
          ": " +
          moment(startDate).format("MMM YYYY") +
          " ~ " +
          moment(endDate).format("MMM YYYY")
        ).replaceAll(" ", "%20") +
        '"'
    );
    csvRow.push("");

    // ── Programs ──
    this.state.exportProgramIds.forEach((ele) =>
      csvRow.push(
        '"' +
          (
            i18n.t("static.program.program") +
            ": " +
            ele.label.toString()
          ).replaceAll(" ", "%20") +
          '"'
      )
    );
    csvRow.push("");

    // ── Version (single program, non-downloaded only) ──
    if (
      !this.state.onlyDownloadedPrograms &&
      this.state.exportProgramIds.length == 1
    ) {
      csvRow.push(
        '"' +
          (
            i18n.t("static.report.version") +
            ": " +
            this.state.exportVersionId
          ).replaceAll(" ", "%20") +
          '"'
      );
      csvRow.push("");
    }

    // ── Planning units ──
    this.state.exportPlanningUnitIds.forEach((ele) =>
      csvRow.push(
        '"' +
          (
            i18n.t("static.planningunit.planningunit") +
            ": " +
            ele.label.toString()
          ).replaceAll(" ", "%20") +
          '"'
      )
    );
    csvRow.push("");

    // ── FIX 3: Stock status filter ──
    const stockStatusLabels = (this.state.stockStatusValues || [])
      .map((v) => v.label)
      .join(", ");
    csvRow.push(
      '"' +
        (
          i18n.t("static.report.withinstock") +
          ": " +
          stockStatusLabels
        ).replaceAll(" ", "%20") +
        '"'
    );
    csvRow.push("");

    // ── FIX 3: Show Quantity ──
    csvRow.push(
      '"' +
        (
          i18n.t("static.report.showQuantity") +
          ": " +
          (this.state.showQuantity
            ? i18n.t("static.program.yes")
            : i18n.t("static.program.no"))
        ).replaceAll(" ", "%20") +
        '"'
    );
    csvRow.push("");

    // ── FIX 3: Remove Planned Shipments ──
    csvRow.push(
      '"' +
        (
          i18n.t("static.report.removePlannedShipments") +
          ": " +
          (this.state.removePlannedShipments
            ? i18n.t("static.program.yes")
            : i18n.t("static.program.no"))
        ).replaceAll(" ", "%20") +
        '"'
    );
    csvRow.push("");

    // ── FIX 3: Remove TBD Funding Source Shipments ──
    csvRow.push(
      '"' +
        (
          i18n.t("static.report.removeTBDFundingSourceShipments") +
          ": " +
          (this.state.removeTBDFundingSourceShipments
            ? i18n.t("static.program.yes")
            : i18n.t("static.program.no"))
        ).replaceAll(" ", "%20") +
        '"'
    );
    csvRow.push("");
    csvRow.push("");

    const uniquePrograms = this.state.exportProgramIds;

    uniquePrograms.forEach((prog) => {
      const progId = prog.value;
      const progLabel = prog.label;

      const programFilteredMatrix = (stockStatusMatrix || []).filter(
        (m) => String(m.programId) == String(progId)
      );
      if (programFilteredMatrix.length == 0) return;

      const programFilteredDetails = (stockStatusDetails || []).filter(
        (d) => String(d.programId) == String(progId)
      );

      csvRow.push(
        `${i18n.t("static.dashboard.programheader")}: ${progLabel.replaceAll(
          " ",
          "%20"
        )}`
      );
      csvRow.push("");
      csvRow.push("");

      const t1Headers = [
        i18n.t("static.planningunit.planningunit"),
        i18n.t("static.stockStatus.plannedBy"),
        i18n.t("static.stockStatusMatrix.minMax"),
        ...monthColumns.map((d) => moment(d).format("MMM YY")),
        i18n.t("static.program.notes"),
      ];

      const A = [
        addDoubleQuoteToRowContent(
          t1Headers.map((h) => h.replaceAll(" ", "%20"))
        ),
      ];
      programFilteredMatrix.forEach((row) => {
        const minMax =
          row.planBasedOn == 1
            ? `${formatterMOS(row.minMonthsOfStock, 0)}/${formatterMOS(
                Number(row.minMonthsOfStock) + Number(row.reorderFrequency),
                0
              )}`
            : `${formatter(Math.round(row.minStock || 0))}/${formatter(
                Math.round(row.maxStock || 0)
              )}`;
        A.push(
          addDoubleQuoteToRowContent([
            (
              getLabelText(row.planningUnit.label, this.state.lang) +
              " | " +
              row.planningUnit.id
            )
              .replaceAll(",", " ")
              .replaceAll(" ", "%20"),
            row.planBasedOn == 1
              ? i18n.t("static.report.mos")
              : i18n.t("static.report.qty"),
            minMax,
            ...monthColumns.map((dateKey) => {
              const entry = (row.dataMap || {})[dateKey];
              const raw = entry
                ? cellDisplayValue(entry, showQuantity, row.planBasedOn)
                : null;
              if (raw == null) return i18n.t("static.supplyPlanFormula.na");
              return showQuantity || row.planBasedOn == 2
                ? formatter(raw)
                : formatterMOS(raw, 2);
            }),
            (row.notes || "").replaceAll(" ", "%20"),
          ])
        );
      });
      A.forEach((r) => csvRow.push(r.join(",")));

      csvRow.push("");
      csvRow.push("");
      const t2Headers = [
        i18n.t("static.common.month"),
        i18n.t("static.planningunit.planningunit"),
        i18n.t("static.supplyPlan.consumption"),
        i18n.t("static.report.amc"),
        i18n.t("static.report.stock"),
        i18n.t("static.report.mos"),
        i18n.t("static.dashboard.stockstatusmain"),
      ];

      const B = [
        addDoubleQuoteToRowContent(
          t2Headers.map((h) => h.replaceAll(" ", "%20"))
        ),
      ];
      programFilteredDetails.forEach((row) => {
        const statusLabel = (
          STOCK_STATUS_MAP[row.stockStatusId] || STOCK_STATUS_MAP["-1"]
        ).label;
        const matrixRow = programFilteredMatrix.find(
          (r) => String(r.planningUnit.id) == String(row.planningUnit.id)
        );
        const planBasedOn = matrixRow
          ? matrixRow.planBasedOn ?? matrixRow.planningUnit?.planBasedOn ?? 1
          : row.planningUnit?.planBasedOn ?? 1;
        const mosDisplay =
          planBasedOn == 2
            ? "-"
            : row.mos != null
            ? formatterMOS(roundAMC(row.mos), 1)
            : i18n.t("static.supplyPlanFormula.na");

        B.push(
          addDoubleQuoteToRowContent([
            moment(row.month).format("MMM YY").replaceAll(" ", "%20"),
            (
              getLabelText(row.planningUnit.label, this.state.lang) +
              " | " +
              row.planningUnit.id
            )
              .replaceAll(",", " ")
              .replaceAll(" ", "%20"),
            row.consumptionQty != null ? Math.round(row.consumptionQty) : "",
            row.amc != null ? Math.round(row.amc) : "",
            row.closingBalance != null ? Math.round(row.closingBalance) : "",
            mosDisplay,
            statusLabel.replaceAll(" ", "%20"),
          ])
        );
      });
      B.forEach((r) => csvRow.push(r.join(",")));
      csvRow.push("");
      csvRow.push("");
    });

    const a = document.createElement("a");
    a.href = "data:attachment/csv," + csvRow.join("%0A");
    a.target = "_Blank";
    a.download = i18n.t("static.dashboard.stockstatusmatrix") + ".csv";
    document.body.appendChild(a);
    a.click();

    this.setState({ exportModal: false, exportLoading: false });
  };

  /**
   * Get error message from error response
   */
  getErrorMessage = (error) => {
    if (error.message == "Network Error") {
      return API_URL.includes("uat")
        ? i18n.t("static.common.uatNetworkErrorMessage")
        : API_URL.includes("demo")
        ? i18n.t("static.common.demoNetworkErrorMessage")
        : i18n.t("static.common.prodNetworkErrorMessage");
    }
    switch (error.response?.status) {
      case 401:
        this.props.history.push(`/login/static.message.sessionExpired`);
        break;
      case 403:
        this.props.history.push(`/accessDenied`);
        break;
      case 409:
        return i18n.t("static.common.accessDenied");
      default:
        return "static.unkownError";
    }
  };

  // ─── Utility ─────────────────────────────────────────────────────────────────

  destroyJExcel(divId) {
    try {
      jexcel(document.getElementById(divId), "");
    } catch (_) {}
    try {
      jexcel.destroy(document.getElementById(divId), true);
    } catch (_) {}
  }

  processApiData(stockStatusMatrix, stockStatusDetails) {
    const { from, to } = this.state.rangeValue;
    const startDate = `${from.year}-${String(from.month).padStart(2, "0")}-01`;
    const lastDay = new Date(to.year, to.month, 0).getDate();
    const endDate = `${to.year}-${String(to.month).padStart(
      2,
      "0"
    )}-${lastDay}`;

    const rangeFilteredDetails = (stockStatusDetails || []).filter(
      (d) => d.month >= startDate && d.month <= endDate
    );
    const monthColumns = deriveMonthColumns(
      stockStatusMatrix,
      startDate,
      endDate
    );
    this.setState(
      {
        stockStatusMatrix,
        stockStatusDetails: rangeFilteredDetails,
        monthColumns,
        loading: false,
        message: "",
      },
      () => this.applyStockStatusFilter()
    );
  }

  applyStockStatusFilter() {
    const { stockStatusMatrix, stockStatusDetails, stockStatusValues } =
      this.state;
    const selectedIds = (stockStatusValues || []).map((v) => Number(v.value));

    let filteredMatrix = stockStatusMatrix || [];
    let filteredDetails = stockStatusDetails || [];

    if (selectedIds.length > 0) {
      filteredMatrix = (stockStatusMatrix || []).filter((row) =>
        Object.values(row.dataMap || {}).some((d) =>
          selectedIds.includes(d.stockStatusId)
        )
      );
      filteredDetails = (stockStatusDetails || []).filter((d) =>
        selectedIds.includes(d.stockStatusId)
      );
    }

    this.setState({ filteredMatrix, filteredDetails }, () => {
      this.buildMatrixJExcel();
      if (this.state.showDetailData) this.buildDetailJExcel();
    });
  }

  // ─── Table 1: Stock Status Matrix ────────────────────────────────────────────

  buildMatrixJExcel() {
    this.destroyJExcel("stockMatrixTableDiv");
    const { filteredMatrix, monthColumns, showQuantity, lang } = this.state;
    if (!filteredMatrix.length) return;

    const statusLookup = {};
    const entryLookup = {};
    filteredMatrix.forEach((row) => {
      const puId = row.planningUnit.id;
      Object.entries(row.dataMap || {}).forEach(([dateKey, entry]) => {
        const lookupKey = `${puId}|${dateKey}`;
        statusLookup[lookupKey] = entry.stockStatusId;
        entryLookup[lookupKey] = entry;
      });
    });

    const tableRows = filteredMatrix.map((row) => {
      const puLabel =
        getLabelText(row.planningUnit.label, lang) +
        " | " +
        row.planningUnit.id;
      const puId = row.planningUnit.id;
      const planBy =
        row.planBasedOn == 1
          ? i18n.t("static.report.mos")
          : i18n.t("static.report.qty");
      const minMax =
        row.planBasedOn == 1
          ? `${formatterMOS(row.minMonthsOfStock, 0)} / ${formatterMOS(
              Number(row.minMonthsOfStock) + Number(row.reorderFrequency),
              0
            )}`
          : `${formatter(Math.round(row.minStock || 0))} / ${formatter(
              Math.round(row.maxStock || 0)
            )}`;

      const dataCells = monthColumns.map((dateKey) => {
        const entry = (row.dataMap || {})[dateKey];
        return entry
          ? cellDisplayValue(entry, showQuantity, row.planBasedOn)
          : null;
      });

      return [
        puLabel,
        planBy,
        minMax,
        ...dataCells,
        row.notes || "",
        String(puId),
      ];
    });

    const monthCols = monthColumns.map((dateKey) => ({
      title: moment(dateKey).format("MMM YY"),
      type: "numeric",
      mask: "#,##0",
      width: 72,
      readOnly: true,
      align: "center",
    }));

    const columns = [
      {
        title: i18n.t("static.planningunit.planningunit"),
        type: "text",
        width: 230,
        readOnly: true,
        align: "left",
      },
      {
        title: i18n.t("static.stockStatus.plannedBy"),
        type: "text",
        width: 62,
        readOnly: true,
      },
      {
        title: `${i18n.t("static.stockStatusMatrix.minMax")}`,
        type: "text",
        width: 95,
        readOnly: true,
      },
      ...monthCols,
      {
        title: i18n.t("static.program.notes"),
        type: "text",
        width: 140,
        readOnly: true,
        align: "left",
      },
      { title: "puId", type: "hidden" },
    ];

    const monthStartIdx = 3;
    const monthEndIdx = monthStartIdx + monthColumns.length - 1;

    jexcel.setDictionary({ Show: " ", entries: " " });

    const self = this;

    const options = {
      data: tableRows,
      columns,
      columnDrag: false,
      editable: false,
      license: JEXCEL_PRO_KEY,
      onopenfilter: onOpenFilter,
      allowRenameColumn: false,
      filters: true,
      onload: this.loadedMatrix,
      pagination: false,
      search: true,
      columnSorting: true,
      onsort: (worksheet, col, direction) => {
        if (col < monthStartIdx || col > monthEndIdx) return;
        const rows = worksheet.getData();
        const nonNa = rows.filter(
          (r) => r[col] !== null && r[col] !== "" && r[col] !== undefined
        );
        const na = rows.filter(
          (r) => r[col] == null || r[col] == "" || r[col] == undefined
        );
        if (na.length > 0) worksheet.setData([...nonNa, ...na]);
      },
      wordWrap: false,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      copyCompatibility: true,
      allowExport: false,
      position: "top",
      onclick: (worksheet, section, x, y) => {
        if (section == "cell" && x == 0) {
          const rowData = tableRows[y] || [];
          const puId = rowData[rowData.length - 1];
          if (puId) {
            localStorage.setItem(
              "stockStatusMatrixPayload",
              JSON.stringify({
                programId: self.state.programId,
                versionId: self.state.versionId,
                planningUnitId: puId,
              })
            );
            let url =
              window.location.href.split("#")[0] + "#/report/stockStatus";
            window.open(url, "_blank");
          }
        }
      },
      updateTable(worksheet, cell, col, row, value) {
        const td = cell && cell.element ? cell.element : cell;
        if (!td || !td.style) return;

        if (col == 0 && row >= 0) {
          td.style.cursor = "pointer";
          td.style.setProperty("text-align", "left", "important");
          return;
        }

        if (col == monthEndIdx + 1 && row >= 0) {
          td.style.setProperty("text-align", "left", "important");
          return;
        }

        if (col < monthStartIdx || col > monthEndIdx) return;

        const rowData = tableRows[row];
        if (!rowData) return;
        const puId = rowData[rowData.length - 1];
        const dateKey = monthColumns[col - monthStartIdx];
        const lookupKey = `${puId}|${dateKey}`;
        const entry = entryLookup[lookupKey];
        const statusId = entry != null ? entry.stockStatusId : -1;
        const bgColor = colorForStatus(statusId);

        const textColor =
          bgColor == "#BA0C2F" || bgColor == "#118b70" ? "#fff" : "#333";
        const fontWeight = entry && entry.actualStock ? "bold" : "normal";

        if (value == null || value == "" || value == undefined) {
          td.innerHTML = "N/A";
        }

        td.style.cssText = `background-color: ${bgColor} !important; color: ${textColor} !important; font-weight: ${fontWeight} !important;`;

        if (self.state.showIcon && entry) {
          if (
            entry.expiredQty &&
            entry.expiredQty > 0 &&
            !td.querySelector("i.warning-icon")
          ) {
            const warningIcon = document.createElement("i");
            warningIcon.className = "fa fa-exclamation-triangle warning-icon";
            warningIcon.style.color = textColor;
            warningIcon.style.marginRight = "5px";
            td.prepend(warningIcon);
          }
          if (
            entry.shipmentQty &&
            entry.shipmentQty > 0 &&
            !td.querySelector("i.truck-icon")
          ) {
            const truckIcon = document.createElement("i");
            truckIcon.className = "fa fa-truck truck-icon";
            truckIcon.style.color = textColor;
            truckIcon.style.marginRight = "5px";
            td.prepend(truckIcon);
          }
        }

        if (entry) {
          const tips = [];
          tips.push(
            `${i18n.t("static.report.stock")}: ${
              entry.closingBalance != null
                ? formatter(Math.round(entry.closingBalance))
                : 0
            }`
          );
          tips.push(
            `${i18n.t("static.stockStatusMatrix.totalShipmentQty")}: ${
              entry.shipmentQty != null ? formatter(entry.shipmentQty) : 0
            }`
          );
          tips.push(
            `${i18n.t("static.supplyPlan.expiredQty")}: ${
              entry.expiredQty != null ? formatter(entry.expiredQty) : 0
            }`
          );
          td.title = tips.join(" | ");
        }
      },
      contextMenu: () => false,
    };

    this.matrixEl = jexcel(
      document.getElementById("stockMatrixTableDiv"),
      options
    );
  }

  loadedMatrix(instance) {
    jExcelLoadedFunctionWithoutPagination(instance);
    try {
      const currentMonthLabel = moment().format("MMM YY");
      const table = instance.element || instance;
      const ths = table.querySelectorAll("thead tr td");
      ths.forEach((th) => {
        if (
          (th.innerText || th.textContent || "").trim() == currentMonthLabel
        ) {
          th.classList.add("supplyplan-Thead");
          th.style.cssText +=
            "background-color: #e4e5e6 !important; color: #20a8d8 !important;";
        }
      });
    } catch (_) {}
  }

  // ─── Table 2: Stock Status Detail ────────────────────────────────────────────

  buildDetailJExcel() {
    this.destroyJExcel("stockDetailTableDiv");
    const { filteredDetails, lang } = this.state;
    if (!filteredDetails.length) return;

    const sorted = [...filteredDetails].sort((a, b) => {
      if (a.month < b.month) return -1;
      if (a.month > b.month) return 1;
      return getLabelText(a.planningUnit.label, lang).localeCompare(
        getLabelText(b.planningUnit.label, lang)
      );
    });

    const tableRows = sorted.map((row) => {
      const statusLabel = (
        STOCK_STATUS_MAP[row.stockStatusId] || STOCK_STATUS_MAP["-1"]
      ).label;
      const matrixRow = this.state.filteredMatrix.find(
        (r) => String(r.planningUnit.id) == String(row.planningUnit.id)
      );
      const planBasedOn = matrixRow ? matrixRow.planBasedOn : 1;

      const mosValue =
        planBasedOn == 2 ? "" : row.mos != null ? roundAMC(row.mos) : null;

      return [
        moment(row.month).format("MMM YY"),
        getLabelText(row.planningUnit.label, lang) +
          " | " +
          row.planningUnit.id,
        row.consumptionQty != null ? Math.round(row.consumptionQty) : null,
        row.amc != null ? Math.round(row.amc) : null,
        row.closingBalance != null ? Math.round(row.closingBalance) : null,
        mosValue,
        statusLabel,
        String(row.stockStatusId),
        row.actualStock ? "1" : "0",
        row.actualConsumption ? "1" : "0",
        String(planBasedOn),
      ];
    });

    const columns = [
      {
        title: i18n.t("static.common.month"),
        type: "text",
        width: 85,
        readOnly: true,
      },
      {
        title: i18n.t("static.planningunit.planningunit"),
        type: "text",
        width: 270,
        readOnly: true,
      },
      {
        title: i18n.t("static.supplyPlan.consumption"),
        type: "numeric",
        mask: "#,##0",
        width: 105,
        readOnly: true,
      },
      {
        title: i18n.t("static.report.amc"),
        type: "numeric",
        mask: "#,##0",
        width: 105,
        readOnly: true,
      },
      {
        title: i18n.t("static.report.stock"),
        type: "numeric",
        mask: "#,##0",
        width: 105,
        readOnly: true,
      },
      {
        title: i18n.t("static.report.mos"),
        type: "numeric",
        mask: "#,##0.00",
        width: 80,
        readOnly: true,
        align: "center",
      },
      {
        title: i18n.t("static.dashboard.stockstatusmain"),
        type: "text",
        width: 125,
        readOnly: true,
      },
      { title: "statusId", type: "hidden" },
      { title: "actualStock", type: "hidden" },
      { title: "actualConsumption", type: "hidden" },
      { title: "planBasedOn", type: "hidden" },
    ];

    const applyDetailColours = (el, pageSize, pageIndex) => {
      if (!el) return;
      const tbody = el.querySelector && el.querySelector("tbody");
      if (!tbody) return;
      const trs = tbody.querySelectorAll("tr");
      trs.forEach((tr, visibleRowOffset) => {
        const absoluteRowIdx = pageIndex * pageSize + visibleRowOffset;
        const rowData = tableRows[absoluteRowIdx];
        if (!rowData) return;

        const isActualStock = rowData[8] == "1";
        const isActualConsumption = rowData[9] == "1";
        const planBasedOn = Number(rowData[10]);
        const statusId = Number(rowData[7]);
        const bgColor = colorForStatus(statusId);
        const textColor =
          bgColor == "#BA0C2F" || bgColor == "#118b70" ? "#fff" : "#000";

        const tds = tr.querySelectorAll("td");
        tds.forEach((td) => {
          const col = Number(td.getAttribute("data-x"));
          if (isNaN(col)) return;

          if (col == 2) {
            if (!td.textContent.trim()) td.innerHTML = "N/A";
            td.setAttribute(
              "style",
              isActualConsumption
                ? "color: #000 !important; font-weight: bold !important;"
                : "color: rgb(170,85,161) !important; font-style: italic !important;"
            );
            return;
          }

          if (col == 3) {
            if (!td.textContent.trim()) td.innerHTML = "N/A";
            return;
          }

          if (col == 4) {
            if (!td.textContent.trim()) td.innerHTML = "N/A";
            if (isActualStock)
              td.setAttribute("style", "font-weight: bold !important;");
            return;
          }

          if (col == 5) {
            if (planBasedOn == 2) {
              td.innerHTML = "-";
              td.style.cssText = "";
              return;
            }
            if (!td.textContent.trim()) td.innerHTML = "N/A";
            const fontWeight = isActualStock ? "bold" : "normal";
            td.style.cssText = `background-color: ${bgColor} !important; color: ${textColor} !important; text-align: center !important; font-weight: ${fontWeight} !important;`;
            return;
          }

          if (col == 6) {
            td.setAttribute(
              "style",
              `background-color: ${bgColor} !important; color: ${textColor} !important; text-align: center !important;`
            );
            return;
          }
        });
      });
    };

    jexcel.setDictionary({ Show: " ", entries: " " });

    const pageSize = Number(localStorage.getItem("sesRecordCount")) || 10;
    let currentPage = 0;

    const options = {
      data: tableRows,
      columns,
      columnDrag: false,
      editable: false,
      license: JEXCEL_PRO_KEY,
      onopenfilter: onOpenFilter,
      allowRenameColumn: false,
      filters: true,
      onload: (instance) => {
        jExcelLoadedFunctionStockStatusMatrix(instance, 1);
        const el = instance.element || instance;
        applyDetailColours(el, pageSize, 0);
      },
      pagination: pageSize,
      search: true,
      columnSorting: true,
      wordWrap: false,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      copyCompatibility: true,
      allowExport: false,
      paginationOptions: JEXCEL_PAGINATION_OPTION,
      position: "top",
      onchangepage: (instance, page) => {
        const zeroBasedPage = Math.max(0, Number(page) - 1);
        currentPage = zeroBasedPage;
        const el = instance.element || instance;
        applyDetailColours(el, pageSize, currentPage);
      },
      contextMenu: () => false,
    };

    this.detailEl = jexcel(
      document.getElementById("stockDetailTableDiv"),
      options
    );
  }

  loadedDetail(instance) {
    jExcelLoadedFunctionStockStatusMatrix(instance, 1);
  }

  // Helper for export charts
  buildChartDataForProgram = (
    progId,
    filteredDetails,
    filteredMatrix,
    showQuantity,
    lang
  ) => {
    const progDetails = (filteredDetails || []).filter(
      (d) => String(d.programId) == String(progId)
    );
    if (!progDetails.length) return null;

    const isDarkMode = document.body.classList.contains("dark-mode");
    const backgroundColor1 = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const allMonths = [
      ...new Set((progDetails || []).map((d) => d.month)),
    ].sort();
    const labels = allMonths.map((m) => moment(m).format("MMM YY"));

    const byPU = {};
    progDetails.forEach((d) => {
      const id = d.planningUnit.id;
      if (!byPU[id])
        byPU[id] = {
          label: getLabelText(d.planningUnit.label, lang),
          data: {},
        };

      const matrixRow = filteredMatrix.find(
        (r) => String(r.planningUnit.id) == String(id)
      );
      const planBasedOn = matrixRow ? matrixRow.planBasedOn : 1;
      const isQty = showQuantity || planBasedOn == 2;

      const val = isQty
        ? d.closingBalance != null
          ? Math.round(d.closingBalance)
          : null
        : d.mos != null
        ? roundAMC(d.mos)
        : null;
      byPU[id].data[d.month] = val;
    });

    const puKeys = Object.keys(byPU);
    const datasets = puKeys.map((id, index) => {
      const matrixRow = (filteredMatrix || []).find(
        (r) => String(r.planningUnit.id) == String(id)
      );
      const planBasedOn = matrixRow ? matrixRow.planBasedOn : 1;
      const yAxisID =
        showQuantity || planBasedOn == 1 ? "y-axis-1" : "y-axis-2";

      return {
        type: "line",
        pointStyle: "line",
        lineTension: 0,
        backgroundColor: "transparent",
        label: byPU[id].label,
        data: allMonths.map((m) => byPU[id].data[m] ?? null),
        borderColor: backgroundColor1[index % backgroundColor1.length],
        borderWidth: 4,
        spanGaps: false,
        yAxisID: yAxisID,
      };
    });

    return { labels, datasets };
  };

  // ─── Line Graph ───────────────────────────────────────────────────────────────

  buildChartData() {
    const { filteredDetails, showQuantity, lang, filteredMatrix } = this.state;
    if (!filteredDetails || !filteredDetails.length) return null;

    const isDarkMode = document.body.classList.contains("dark-mode");
    const backgroundColor1 = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const allMonths = [
      ...new Set((filteredDetails || []).map((d) => d.month)),
    ].sort();
    const labels = allMonths.map((m) => moment(m).format("MMM YY"));

    const byPU = {};
    filteredDetails.forEach((d) => {
      const id = d.planningUnit.id;
      if (!byPU[id])
        byPU[id] = {
          label: getLabelText(d.planningUnit.label, lang),
          data: {},
        };

      const matrixRow = filteredMatrix.find(
        (r) => String(r.planningUnit.id) == String(id)
      );
      const planBasedOn = matrixRow ? matrixRow.planBasedOn : 1;
      const isQty = showQuantity || planBasedOn == 2;

      const val = isQty
        ? d.closingBalance != null
          ? Math.round(d.closingBalance)
          : null
        : d.mos != null
        ? roundAMC(d.mos)
        : null;
      byPU[id].data[d.month] = val;
    });

    const puKeys = Object.keys(byPU);
    const datasets = puKeys.map((id, index) => {
      const matrixRow = filteredMatrix.find(
        (r) => String(r.planningUnit.id) == String(id)
      );
      const planBasedOn = matrixRow ? matrixRow.planBasedOn : 1;
      const yAxisID = showQuantity
        ? "y-axis-1"
        : planBasedOn == 2
        ? "y-axis-2"
        : "y-axis-1";

      return {
        type: "line",
        pointStyle: "line",
        lineTension: 0,
        backgroundColor: "transparent",
        label: byPU[id].label,
        data: allMonths.map((m) => byPU[id].data[m] ?? null),
        borderColor: backgroundColor1[index % backgroundColor1.length],
        borderWidth: 4,
        spanGaps: false,
        yAxisID: yAxisID,
      };
    });

    return { labels, datasets };
  }

  // ─── CSV export ───────────────────────────────────────────────────────────────

  exportCSV() {
    const {
      filteredMatrix,
      monthColumns,
      filteredDetails,
      showQuantity,
      lang,
    } = this.state;
    const csvRow = [];

    csvRow.push(
      `"${i18n.t("static.dashboard.stockstatusmatrix").replaceAll(" ", "%20")}"`
    );
    csvRow.push("");

    const t1Headers = [
      i18n.t("static.planningunit.planningunit"),
      i18n.t("static.stockStatus.plannedBy"),
      `${i18n.t("static.report.minMosOrQty")}/${i18n.t(
        "static.report.maxMosOrQty"
      )}`,
      ...monthColumns.map((d) => moment(d).format("MMM YY")),
      i18n.t("static.program.notes"),
    ];
    const A = [
      addDoubleQuoteToRowContent(
        t1Headers.map((h) => h.replaceAll(" ", "%20"))
      ),
    ];
    filteredMatrix.forEach((row) => {
      const minMax =
        row.planBasedOn == 1
          ? `${formatterMOS(row.minMonthsOfStock, 0)}/${formatterMOS(
              Number(row.minMonthsOfStock) + Number(row.reorderFrequency),
              0
            )}`
          : `${formatter(Math.round(row.minStock || 0))}/${formatter(
              Math.round(row.maxStock || 0)
            )}`;
      A.push(
        addDoubleQuoteToRowContent([
          (
            getLabelText(row.planningUnit.label, lang) +
            " | " +
            row.planningUnit.id
          )
            .replaceAll(",", " ")
            .replaceAll(" ", "%20"),
          row.planBasedOn == 1
            ? i18n.t("static.report.mos")
            : i18n.t("static.report.qty"),
          minMax,
          ...monthColumns.map((dateKey) => {
            const entry = (row.dataMap || {})[dateKey];
            const raw = entry
              ? cellDisplayValue(entry, showQuantity, row.planBasedOn)
              : null;
            if (raw == null) return i18n.t("static.supplyPlanFormula.na");
            return showQuantity || row.planBasedOn == 2
              ? formatter(raw)
              : formatterMOS(raw, 2);
          }),
          (row.notes || "").replaceAll(" ", "%20"),
        ])
      );
    });
    A.forEach((r) => csvRow.push(r.join(",")));
    csvRow.push("");
    csvRow.push("");

    csvRow.push(
      `"${i18n.t("static.report.stockStatusDetail").replaceAll(" ", "%20")}"`
    );
    csvRow.push("");
    const t2Headers = [
      i18n.t("static.common.month"),
      i18n.t("static.planningunit.planningunit"),
      i18n.t("static.supplyPlan.consumption"),
      i18n.t("static.report.amc"),
      i18n.t("static.report.stock"),
      i18n.t("static.report.mos"),
      i18n.t("static.dashboard.stockstatusmain"),
    ];
    const B = [
      addDoubleQuoteToRowContent(
        t2Headers.map((h) => h.replaceAll(" ", "%20"))
      ),
    ];
    filteredDetails.forEach((row) => {
      const statusLabel = (
        STOCK_STATUS_MAP[row.stockStatusId] || STOCK_STATUS_MAP["-1"]
      ).label;
      const matrixRow = this.state.filteredMatrix.find(
        (r) => String(r.planningUnit.id) == String(row.planningUnit.id)
      );
      const planBasedOn = matrixRow ? matrixRow.planBasedOn : 1;

      const mosDisplay =
        planBasedOn == 2
          ? ""
          : row.mos != null
          ? formatterMOS(roundAMC(row.mos), 1)
          : i18n.t("static.supplyPlanFormula.na");

      B.push(
        addDoubleQuoteToRowContent([
          moment(row.month).format("MMM YY").replaceAll(" ", "%20"),
          (
            getLabelText(row.planningUnit.label, lang) +
            " | " +
            row.planningUnit.id
          )
            .replaceAll(",", " ")
            .replaceAll(" ", "%20"),
          row.consumptionQty != null ? Math.round(row.consumptionQty) : "",
          row.amc != null ? Math.round(row.amc) : "",
          row.closingBalance != null ? Math.round(row.closingBalance) : "",
          mosDisplay,
          statusLabel.replaceAll(" ", "%20"),
        ])
      );
    });
    B.forEach((r) => csvRow.push(r.join(",")));

    const a = document.createElement("a");
    a.href = "data:attachment/csv," + csvRow.join("%0A");
    a.target = "_Blank";
    a.download = i18n.t("static.dashboard.stockstatusmatrix") + ".csv";
    document.body.appendChild(a);
    a.click();
  }

  // ─── PDF export ───────────────────────────────────────────────────────────────

  exportPDF() {
    const {
      filteredMatrix,
      monthColumns,
      filteredDetails,
      showQuantity,
      lang,
    } = this.state;
    const doc = new jsPDF("landscape", "pt", "A4");
    doc.setFontSize(8);

    const addHeaders = (d) => {
      const n = d.internal.getNumberOfPages();
      for (let i = 1; i <= n; i++) {
        d.setFontSize(12);
        d.setFont("helvetica", "bold");
        d.setPage(i);
        d.addImage(LOGO, "png", 0, 10, 180, 50, "FAST");
        d.setTextColor("#002f6c");
        d.text(
          i18n.t("static.dashboard.stockstatusmatrix"),
          d.internal.pageSize.width / 2,
          60,
          { align: "center" }
        );
      }
    };
    const addFooters = (d) => {
      const n = d.internal.getNumberOfPages();
      d.setFont("helvetica", "bold");
      d.setFontSize(6);
      for (let i = 1; i <= n; i++) {
        d.setPage(i);
        d.text(
          `Page ${i} of ${n}`,
          d.internal.pageSize.width / 9,
          d.internal.pageSize.height - 30,
          { align: "center" }
        );
        d.text(
          `Copyright © 2020 ${i18n.t("static.footer")}`,
          (d.internal.pageSize.width * 6) / 7,
          d.internal.pageSize.height - 30,
          { align: "center" }
        );
      }
    };

    const head1 = [
      [
        i18n.t("static.planningunit.planningunit"),
        i18n.t("static.stockStatus.plannedBy"),
        `${i18n.t("static.report.minMosOrQty")} / ${i18n.t(
          "static.report.maxMosOrQty"
        )}`,
        ...monthColumns.map((d) => moment(d).format("MMM YY")),
        i18n.t("static.program.notes"),
      ],
    ];
    const colorMap1 = filteredMatrix.map((row) =>
      monthColumns.map((dateKey) => {
        const entry = (row.dataMap || {})[dateKey];
        return entry ? colorForStatus(entry.stockStatusId) : "#cfcdc9";
      })
    );
    const body1 = filteredMatrix.map((row) => {
      const minMax =
        row.planBasedOn == 1
          ? `${formatterMOS(row.minMonthsOfStock, 0)} / ${formatterMOS(
              Number(row.minMonthsOfStock) + Number(row.reorderFrequency),
              0
            )}`
          : `${formatter(Math.round(row.minStock || 0))} / ${formatter(
              Math.round(row.maxStock || 0)
            )}`;
      return [
        getLabelText(row.planningUnit.label, lang) +
          " | " +
          row.planningUnit.id,
        row.planBasedOn == 1
          ? i18n.t("static.report.mos")
          : i18n.t("static.report.qty"),
        minMax,
        ...monthColumns.map((dateKey) => {
          const entry = (row.dataMap || {})[dateKey];
          const raw = entry
            ? cellDisplayValue(entry, showQuantity, row.planBasedOn)
            : null;
          if (raw == null) return i18n.t("static.supplyPlanFormula.na");
          return showQuantity || row.planBasedOn == 2
            ? formatter(raw)
            : formatterMOS(raw, 2);
        }),
        row.notes || "",
      ];
    });
    doc.autoTable({
      margin: { top: 80, bottom: 90 },
      startY: 90,
      head: head1,
      body: body1,
      styles: {
        lineWidth: 1,
        fontSize: 6,
        halign: "center",
        overflow: "linebreak",
      },
      columnStyles: { 0: { cellWidth: 100 } },
      didParseCell(data) {
        if (
          data.section == "body" &&
          data.column.index >= 3 &&
          data.column.index < 3 + monthColumns.length
        ) {
          data.cell.styles.fillColor =
            colorMap1[data.row.index]?.[data.column.index - 3] || "#cfcdc9";
        }
      },
    });

    const head2 = [
      [
        i18n.t("static.common.month"),
        i18n.t("static.planningunit.planningunit"),
        i18n.t("static.supplyPlan.consumption"),
        i18n.t("static.report.amc"),
        i18n.t("static.report.stock"),
        i18n.t("static.report.mos"),
        i18n.t("static.dashboard.stockstatusmain"),
      ],
    ];
    const colorMap2 = filteredDetails.map((r) => {
      const matrixRow = this.state.filteredMatrix.find(
        (m) => String(m.planningUnit.id) == String(r.planningUnit.id)
      );
      const planBasedOn = matrixRow ? matrixRow.planBasedOn : 1;
      return { bgColor: colorForStatus(r.stockStatusId), planBasedOn };
    });
    const body2 = filteredDetails.map((row, idx) => {
      const statusLabel = (
        STOCK_STATUS_MAP[row.stockStatusId] || STOCK_STATUS_MAP["-1"]
      ).label;
      const planBasedOn = colorMap2[idx].planBasedOn;
      const mosDisplay =
        planBasedOn == 2
          ? ""
          : row.mos != null
          ? formatterMOS(roundAMC(row.mos), 1)
          : i18n.t("static.supplyPlanFormula.na");

      return [
        moment(row.month).format("MMM YY"),
        getLabelText(row.planningUnit.label, lang) +
          " | " +
          row.planningUnit.id,
        row.consumptionQty != null
          ? formatter(Math.round(row.consumptionQty))
          : "",
        row.amc != null ? formatter(Math.round(row.amc)) : "",
        row.closingBalance != null
          ? formatter(Math.round(row.closingBalance))
          : "",
        mosDisplay,
        statusLabel,
      ];
    });
    doc.autoTable({
      margin: { top: 80, bottom: 90 },
      startY: doc.lastAutoTable.finalY + 20,
      head: head2,
      body: body2,
      styles: {
        lineWidth: 1,
        fontSize: 7,
        halign: "center",
        overflow: "linebreak",
      },
      columnStyles: { 1: { cellWidth: 130 } },
      didParseCell(data) {
        if (data.section == "body") {
          if (data.column.index == 6) {
            data.cell.styles.fillColor =
              colorMap2[data.row.index]?.bgColor || "#cfcdc9";
          }
          if (
            data.column.index == 5 &&
            colorMap2[data.row.index]?.planBasedOn !== 2
          ) {
            data.cell.styles.fillColor =
              colorMap2[data.row.index]?.bgColor || "#cfcdc9";
          }
        }
      },
    });

    addHeaders(doc);
    addFooters(doc);
    doc.save(i18n.t("static.dashboard.stockstatusmatrix") + ".pdf");
  }

  // ─── Program / Version / PU loading ──────────────────────────────────────────

  getPlanningUnit() {
    const programId = document.getElementById("programId").value;
    const versionId = document.getElementById("versionId")?.value ?? "0";
    if (programId <= 0 || versionId == 0) return;

    if (versionId.includes("Local")) {
      getDatabase();
      const req = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      req.onsuccess = (e) => {
        const db = e.target.result;
        const get = db
          .transaction(["programPlanningUnit"], "readwrite")
          .objectStore("programPlanningUnit")
          .getAll();
        get.onsuccess = () => {
          const lang = this.state.lang;
          const proList = get.result
            .filter((r) => r.program.id == programId && r.active)
            .map((r) => ({
              label: r.planningUnit.label,
              value: r.planningUnit.id,
              json: r,
            }))
            .sort((a, b) =>
              getLabelText(a.label, lang).toUpperCase() >
              getLabelText(b.label, lang).toUpperCase()
                ? 1
                : -1
            );
          this.setState(
            {
              planningUnits: proList,
              planningUnitValues: proList.map((p) => ({
                label: getLabelText(p.label, lang) + " | " + p.value,
                value: Number(p.value),
              })),
            },
            () => this.filterData()
          );
        };
      };
    } else {
      ReportService.getDropdownListByProgramIds({
        programIds: [programId],
        onlyAllowPuPresentAcrossAllPrograms: false,
      })
        .then((res) => {
          const lang = this.state.lang;
          const list = (res.data.planningUnitList || []).sort((a, b) =>
            getLabelText(a.label, lang).toUpperCase() >
            getLabelText(b.label, lang).toUpperCase()
              ? 1
              : -1
          );
          this.setState(
            {
              planningUnits: list,
              planningUnitValues: list.map((p) => ({
                label: getLabelText(p.label, lang) + " | " + p.id,
                value: Number(p.id),
              })),
            },
            () => this.filterData()
          );
        })
        .catch(() => this.setState({ planningUnits: [], loading: false }));
    }
  }

  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => this.filterData());
  }
  _handleClickRangeBox() {
    this.refs.pickRange.show();
  }

  handlePlanningUnitChange = (ids) => {
    ids = ids.sort((a, b) => parseInt(a.value) - parseInt(b.value));
    this.setState({
      planningUnitValues: ids,
      planningUnitLabels: ids.map((e) => e.label),
    });
  };

  handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      this.filterData();
    }
  };

  // ─── Main data fetch ──────────────────────────────────────────────────────────

  filterData() {
    const programId = document.getElementById("programId").value;
    const versionId = document.getElementById("versionId")?.value ?? "0";
    const planningUnitIds = this.state.planningUnitValues.map((e) =>
      Number(e.value)
    );
    const { from, to } = this.state.rangeValue;
    const startDate = `${from.year}-${String(from.month).padStart(2, "0")}-01`;
    const lastDay = new Date(to.year, to.month, 0).getDate();
    const endDate = `${to.year}-${String(to.month).padStart(
      2,
      "0"
    )}-${lastDay}`;

    if (
      planningUnitIds.length > 0 &&
      programId > 0 &&
      versionId != 0 &&
      this.state.stockStatusValues.length > 0
    ) {
      if (versionId.includes("Local")) {
        this.setState({ loading: true });
        getDatabase();
        const req = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        req.onerror = () =>
          this.setState({
            message: i18n.t("static.program.errortext"),
            loading: false,
          });
        req.onsuccess = (e) => {
          const db = e.target.result;
          const version = versionId.split("(")[0].trim();
          const userId = CryptoJS.AES.decrypt(
            localStorage.getItem("curUser"),
            SECRET_KEY
          ).toString(CryptoJS.enc.Utf8);
          const key = `${programId}_v${version}_uId_${userId}`;
          const get = db
            .transaction(["programData"], "readwrite")
            .objectStore("programData")
            .get(key);
          get.onerror = () => this.setState({ loading: false });
          get.onsuccess = () => {
            const programData = get.result?.programData;
            if (!programData) {
              this.setState({ loading: false });
              return;
            }

            const puDataList = programData.planningUnitDataList || [];
            const generalData = JSON.parse(
              CryptoJS.AES.decrypt(
                programData.generalData,
                SECRET_KEY
              ).toString(CryptoJS.enc.Utf8)
            );
            const matrix = [];
            const details = [];

            (planningUnitIds || []).forEach((puId) => {
              const puItem = (this.state.planningUnits || []).find(
                (p) => String(p.id || p.value) == puId
              );
              console.log("this.state.planningUnits", this.state.planningUnits);
              const puActualLabel = puItem
                ? puItem.label
                : { label_en: String(puId) };

              const puSettings =
                (this.state.planningUnits || []).find(
                  (p) => String(p.value) == puId
                ) || {};
              const minMos = puSettings.json?.minMonthsOfStock || 5;
              const reorderFreq =
                puSettings.json?.reorderFrequencyInMonths || 5;
              const planBasedOn = puSettings.json?.planBasedOn || 1;
              const minStock = puSettings.json?.minQty || 0;
              const notes = puSettings.json?.notes || "";

              const puDataIdx = puDataList.findIndex(
                (p) => p.planningUnitId == puId
              );
              let programJson = { supplyPlan: [] };
              if (puDataIdx !== -1) {
                const bytes = CryptoJS.AES.decrypt(
                  puDataList[puDataIdx].planningUnitData,
                  SECRET_KEY
                );
                programJson = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
              }

              const inRangeEntries = (programJson.supplyPlan || []).filter(
                (sp) =>
                  sp.planningUnitId == puId &&
                  sp.transDate >= startDate &&
                  sp.transDate <= endDate
              );

              let maxStock;
              if (planBasedOn == 2) {
                maxStock = calcAverageMaxStock(
                  inRangeEntries,
                  minStock,
                  reorderFreq
                );
              } else {
                maxStock = puSettings.json?.maxStock || 0;
              }

              const dataMap = {};
              inRangeEntries.forEach((sp) => {
                const useWps = this.state.removePlannedShipments;
                const useWtbd = this.state.removeTBDFundingSourceShipments;

                const mos = useWps
                  ? sp.mosWps
                  : useWtbd
                  ? sp.mosWtbdps
                  : sp.mos;
                const cb = useWps
                  ? sp.closingBalanceWps
                  : useWtbd
                  ? sp.closingBalanceWtbdps
                  : sp.closingBalance;
                const amc = sp.amc;

                let statusId;
                if (planBasedOn == 1) {
                  statusId = calcStatusIdLocal(mos, minMos, reorderFreq);
                } else {
                  const dynamicMax =
                    amc != null ? minStock + reorderFreq * amc : maxStock;
                  statusId =
                    cb == null
                      ? -1
                      : cb == 0
                      ? 0
                      : cb < minStock
                      ? 1
                      : cb > dynamicMax
                      ? 3
                      : 2;
                }

                const shipmentQty = useWps
                  ? sp.shipmentTotalQtyWps
                  : useWtbd
                  ? sp.shipmentTotalQtyWtbdps
                  : sp.shipmentTotalQty;
                const expiredQty = useWps
                  ? sp.expiredStockWps
                  : useWtbd
                  ? sp.expiredStockWtbdps
                  : sp.expiredStock;

                dataMap[sp.transDate] = {
                  mos,
                  closingBalance: cb,
                  amc,
                  stockStatusId: statusId,
                  actualStock: !!sp.actualStock,
                  shipmentQty,
                  expiredQty,
                  planningUnitIds: null,
                };
                details.push({
                  month: sp.transDate,
                  planningUnit: { id: Number(puId), label: puActualLabel },
                  consumptionQty: sp.consumption || 0,
                  actualConsumption: !!sp.actualConsumption,
                  amc,
                  closingBalance: cb,
                  actualStock: !!sp.actualStock,
                  mos,
                  stockStatusId: statusId,
                });
              });

              matrix.push({
                planningUnit: { id: Number(puId), label: puActualLabel },
                planBasedOn,
                minMonthsOfStock: minMos,
                reorderFrequency: reorderFreq,
                maxStock: Math.round(maxStock),
                minStock,
                dataMap,
                notes,
              });
            });

            this.processApiData(matrix, details);
          };
        };
      } else {
        this.setState({ loading: true });
        const inputjson = {
          programId,
          versionId,
          startDate,
          stopDate: endDate,
          planningUnitIds,
          stockStatusConditions: this.state.stockStatusValues.map((e) =>
            Number(e.value)
          ),
          removePlannedShipments: this.state.removePlannedShipments
            ? 1
            : this.state.removeTBDFundingSourceShipments
            ? 2
            : 0,
          fundingSourceIds: [],
          procurementAgentIds: [],
          showByQty: this.state.showQuantity,
        };
        ProductService.getStockStatusMatrixData(inputjson)
          .then((response) => {
            let { stockStatusMatrix = [], stockStatusDetails = [] } =
              response.data;

            stockStatusMatrix = stockStatusMatrix.map((row) => {
              if (row.planBasedOn !== 2) return row;

              const inRangeEntries = Object.entries(row.dataMap || {}).filter(
                ([dateKey]) => dateKey >= startDate && dateKey <= endDate
              );
              const avgMax = calcAverageMaxStock(
                inRangeEntries.map(([, entry]) => entry),
                row.minStock || 0,
                row.reorderFrequency || 0
              );

              const updatedDataMap = {};
              inRangeEntries.forEach(([dateKey, entry]) => {
                const amc = entry.amc;
                const cb = entry.closingBalance;
                const minStock = row.minStock || 0;
                const dynamicMax =
                  amc != null
                    ? minStock + (row.reorderFrequency || 0) * amc
                    : avgMax;
                const statusId =
                  cb == null
                    ? -1
                    : cb == 0
                    ? 0
                    : cb < minStock
                    ? 1
                    : cb > dynamicMax
                    ? 3
                    : 2;
                updatedDataMap[dateKey] = { ...entry, stockStatusId: statusId };
              });

              return {
                ...row,
                maxStock: Math.round(avgMax),
                dataMap: updatedDataMap,
              };
            });

            const matrixById = {};
            stockStatusMatrix.forEach((r) => {
              matrixById[r.planningUnit.id] = r;
            });
            stockStatusDetails = stockStatusDetails.map((detail) => {
              const matrixRow = matrixById[detail.planningUnit.id];
              if (!matrixRow || matrixRow.planBasedOn !== 2) return detail;
              const entry = (matrixRow.dataMap || {})[detail.month];
              if (!entry) return detail;
              return { ...detail, stockStatusId: entry.stockStatusId };
            });

            this.processApiData(stockStatusMatrix, stockStatusDetails);
          })
          .catch((error) => {
            this.setState({
              filteredMatrix: [],
              filteredDetails: [],
              loading: false,
            });
            if (error.message == "Network Error") {
              this.setState({
                message: API_URL.includes("uat")
                  ? i18n.t("static.common.uatNetworkErrorMessage")
                  : API_URL.includes("demo")
                  ? i18n.t("static.common.demoNetworkErrorMessage")
                  : i18n.t("static.common.prodNetworkErrorMessage"),
              });
            } else {
              switch (error.response?.status) {
                case 401:
                  this.props.history.push(
                    `/login/static.message.sessionExpired`
                  );
                  break;
                case 403:
                  this.props.history.push(`/accessDenied`);
                  break;
                case 409:
                  this.setState({
                    message: i18n.t("static.common.accessDenied"),
                  });
                  break;
                default:
                  this.setState({ message: "static.unkownError" });
              }
            }
          });
      }
    } else if (programId == 0) {
      this.setState({
        message: i18n.t("static.common.selectProgram"),
        filteredMatrix: [],
        filteredDetails: [],
        loading: false,
      });
    } else if (versionId == 0) {
      this.setState({
        message: i18n.t("static.program.validversion"),
        filteredMatrix: [],
        filteredDetails: [],
        loading: false,
      });
    } else if (planningUnitIds.length == 0) {
      this.setState({
        message: i18n.t("static.procurementUnit.validPlanningUnitText"),
        filteredMatrix: [],
        filteredDetails: [],
        loading: false,
      });
    } else if (this.state.stockStatusValues.length == 0) {
      this.setState({
        message: i18n.t("static.stockStatusMatrix.selectStockStatus"),
        filteredMatrix: [],
        filteredDetails: [],
        loading: false,
      });
    }
  }

  // ─── Program / version loading ────────────────────────────────────────────────

  getPrograms = () => {
    if (localStorage.getItem("sessionType") == "Online") {
      DropdownService.getSPProgramBasedOnRealmId(
        AuthenticationService.getRealmId()
      )
        .then((res) => {
          const proList = res.data.map((p) => ({
            programId: p.id,
            label: p.label,
            programCode: p.code,
          }));
          this.setState({ programs: proList, loading: false }, () =>
            this.consolidatedProgramList()
          );
        })
        .catch(() =>
          this.setState({ programs: [], loading: false }, () =>
            this.consolidatedProgramList()
          )
        );
    } else {
      this.setState({ loading: false });
      this.consolidatedProgramList();
    }
  };

  consolidatedProgramList = () => {
    let proList = [...this.state.programs];
    getDatabase();
    const req = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    req.onsuccess = (e) => {
      const db = e.target.result;
      const get = db
        .transaction(["programData"], "readwrite")
        .objectStore("programData")
        .getAll();
      get.onsuccess = () => {
        const userId = CryptoJS.AES.decrypt(
          localStorage.getItem("curUser"),
          SECRET_KEY
        ).toString(CryptoJS.enc.Utf8);
        get.result.forEach((r) => {
          if (r.userId == userId) {
            const pd = JSON.parse(
              CryptoJS.AES.decrypt(
                r.programData.generalData,
                SECRET_KEY
              ).toString(CryptoJS.enc.Utf8)
            );
            if (!proList.find((p) => p.programId == pd.programId))
              proList.push(pd);
          }
        });
        const sorted = proList.sort((a, b) =>
          a.programCode.toLowerCase() > b.programCode.toLowerCase() ? 1 : -1
        );
        const sesId = localStorage.getItem("sesProgramIdReport");
        if (sesId) {
          this.setState({ programs: sorted, programId: sesId }, () => {
            this.filterVersion();
            this.filterData();
          });
        } else {
          this.setState({ programs: sorted });
        }
      };
    };
  };

  filterVersion = () => {
    const programId = this.state.programId;
    if (!programId || programId == 0) {
      this.setState({ versions: [] });
      return;
    }
    localStorage.setItem("sesProgramIdReport", programId);
    if (!this.state.programs.find((p) => p.programId == programId)) {
      this.setState({ versions: [] });
      return;
    }
    if (localStorage.getItem("sessionType") == "Online") {
      this.setState({ versions: [] }, () => {
        DropdownService.getVersionListForSPProgram(programId)
          .then((res) =>
            this.setState({ versions: res.data }, () =>
              this.consolidatedVersionList(programId)
            )
          )
          .catch(() => this.setState({ versions: [], loading: false }));
      });
    } else {
      this.setState({ versions: [] }, () =>
        this.consolidatedVersionList(programId)
      );
    }
  };

  consolidatedVersionList = (programId) => {
    let verList = [...this.state.versions];
    getDatabase();
    const req = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    req.onsuccess = (e) => {
      const db = e.target.result;
      const get = db
        .transaction(["programData"], "readwrite")
        .objectStore("programData")
        .getAll();
      get.onsuccess = () => {
        const userId = CryptoJS.AES.decrypt(
          localStorage.getItem("curUser"),
          SECRET_KEY
        ).toString(CryptoJS.enc.Utf8);
        get.result.forEach((r) => {
          if (r.userId == userId && r.programId == programId) {
            const pd = JSON.parse(
              CryptoJS.AES.decrypt(
                r.programData.generalData,
                SECRET_KEY
              ).toString(CryptoJS.enc.Utf8)
            );
            const v = pd.currentVersion;
            if (v) {
              v.versionId = `${v.versionId} (Local)`;
              v.cutOffDate = pd.cutOffDate || "";
              verList.push(v);
            }
          }
        });
        const unique = [
          ...new Map(verList.map((v) => [v.versionId, v])).values(),
        ];
        const versionList = unique.sort((a, b) => {
          const aLocal = String(a.versionId).includes("Local");
          const bLocal = String(b.versionId).includes("Local");
          if (aLocal && !bLocal) return -1;
          if (!aLocal && bLocal) return 1;
          const aNum =
            parseInt(String(a.versionId).replace(/[^0-9]/g, ""), 10) || 0;
          const bNum =
            parseInt(String(b.versionId).replace(/[^0-9]/g, ""), 10) || 0;
          return bNum - aNum;
        });
        const sesVer = localStorage.getItem("sesVersionIdReport");
        const matched =
          sesVer && versionList.find((v) => v.versionId == sesVer);
        this.setState(
          {
            versions: versionList,
            versionId: matched ? sesVer : versionList[0]?.versionId || "",
          },
          () => this.getPlanningUnit()
        );
      };
    };
  };

  componentDidMount() {
    this.getPrograms();
  }

  setProgramId(event) {
    this.setState({ programId: event.target.value, versionId: "" }, () => {
      localStorage.setItem("sesVersionIdReport", "");
      this.filterVersion();
      this.filterData();
    });
  }
  setVersionId(event) {
    this.setState({ versionId: event.target.value }, () => {
      localStorage.setItem("sesVersionIdReport", this.state.versionId);
      this.getPlanningUnit();
    });
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  render() {
    const {
      planningUnits,
      programs,
      versions,
      filteredMatrix,
      filteredDetails,
      showDetailData,
      showQuantity: showQty,
    } = this.state;

    const isDarkMode = document.body.classList.contains("dark-mode");
    const fontColor = isDarkMode ? "#fff" : "#212721";
    const gridLineColor = isDarkMode ? "#444" : "#e0e0e0";

    const planningUnitList = planningUnits.map((item) => ({
      label:
        getLabelText(item.label, this.state.lang) +
        " | " +
        (item.id || item.value),
      value: Number(item.id || item.value),
    }));

    const programOptions = programs.map((item, i) => (
      <option key={i} value={item.programId}>
        {item.programCode}
      </option>
    ));
    const versionOptions = versions.map((item, i) => (
      <option key={i} value={item.versionId}>
        {item.versionStatus?.id == 2 && item.versionType?.id == 2
          ? item.versionId + "**"
          : item.versionType?.id == 2
          ? item.versionId + "*"
          : item.versionId}{" "}
        ({moment(item.createdDate).format("MMM DD YYYY")})
        {item.cutOffDate
          ? ` (${i18n.t("static.supplyPlan.start")} ${moment(
              item.cutOffDate
            ).format("MMM YYYY")})`
          : ""}
      </option>
    ));

    const hasData = filteredMatrix.length > 0;
    const hasDetails = filteredDetails.length > 0;
    const chartData =
      hasDetails && showDetailData ? this.buildChartData() : null;

    let hasMOS = false;
    let hasQty = false;
    if (showQty) {
      hasMOS = false;
      hasQty = false;
    } else {
      if (filteredMatrix) {
        hasQty = filteredMatrix.some((r) => r.planBasedOn == 2);
        hasMOS = filteredMatrix.some((r) => r.planBasedOn == 1);
      }
    }

    const chartOptions = {
      maintainAspectRatio: false,
      title: {
        display: true,
        text: i18n.t("static.dashboard.stockstatusovertime"),
        fontColor,
      },
      scales: {
        yAxes: [
          {
            id: "y-axis-1",
            type: "linear",
            position: "left",
            display: showQty || hasMOS || (!hasMOS && !hasQty),
            scaleLabel: {
              display: true,
              labelString: showQty
                ? i18n.t("static.report.stock")
                : i18n.t("static.report.mos"),
              fontColor,
            },
            ticks: {
              beginAtZero: true,
              fontColor,
              callback: function (value) {
                var x = (value + "").split(".");
                var x1 = x[0],
                  x2 = x.length > 1 ? "." + x[1] : "";
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) x1 = x1.replace(rgx, "$1,$2");
                return x1 + x2;
              },
            },
            gridLines: {
              color: gridLineColor,
              drawBorder: true,
              lineWidth: 0,
              zeroLineColor: gridLineColor,
            },
          },
          {
            id: "y-axis-2",
            type: "linear",
            position: "right",
            display: !showQty && hasQty,
            scaleLabel: {
              display: true,
              labelString: i18n.t("static.report.stock"),
              fontColor,
            },
            ticks: {
              beginAtZero: true,
              fontColor,
              callback: function (value) {
                var x = (value + "").split(".");
                var x1 = x[0],
                  x2 = x.length > 1 ? "." + x[1] : "";
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) x1 = x1.replace(rgx, "$1,$2");
                return x1 + x2;
              },
            },
            gridLines: {
              color: gridLineColor,
              drawBorder: false,
              lineWidth: 0,
              zeroLineColor: gridLineColor,
            },
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: i18n.t("static.common.month"),
              fontColor,
              fontStyle: "normal",
              fontSize: "12",
            },
            ticks: { fontColor },
            gridLines: {
              color: gridLineColor,
              drawBorder: true,
              lineWidth: 0,
              zeroLineColor: gridLineColor,
            },
          },
        ],
      },
      tooltips: {
        mode: "index",
        enabled: false,
        custom: CustomTooltips,
        callback: function (value) {
          var x = (value + "").split(".");
          var x1 = x[0],
            x2 = x.length > 1 ? "." + x[1] : "";
          var rgx = /(\d+)(\d{3})/;
          while (rgx.test(x1)) x1 = x1.replace(rgx, "$1,$2");
          return x1 + x2;
        },
      },
      legend: {
        display: true,
        position: "bottom",
        labels: {
          usePointStyle: true,
          fontColor,
          fontSize: 12,
          boxWidth: 15,
          boxHeight: 4,
        },
      },
    };

    return (
      <div className="animated">
        <AuthenticationServiceComponent history={this.props.history} />
        <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
        <h5 className="red">{i18n.t(this.state.message, { entityname })}</h5>
        <SupplyPlanFormulas ref="formulaeChild" />

        <Card>
          {/* ── Header icons ── */}
          <div className="Card-header-reporticon pb-2">
            <div className="card-header-actions">
              <a className="card-header-action">
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    this.refs.formulaeChild.toggleStockStatusMatrix()
                  }
                >
                  <small className="supplyplanformulas">
                    {i18n.t("static.supplyplan.supplyplanformula")}
                  </small>
                </span>
              </a>
              {(hasData || hasDetails) && (
                <div className="card-header-actions">
                  <img
                    style={{ height: "25px", width: "25px", cursor: "pointer" }}
                    src={pdfIcon}
                    title={i18n.t("static.report.exportPdf")}
                    onClick={() => this.toggleExportModal(1)}
                  />
                  <img
                    style={{ height: "25px", width: "25px", cursor: "pointer" }}
                    src={csvicon}
                    title={i18n.t("static.report.exportCsv")}
                    onClick={() => this.toggleExportModal(2)}
                  />
                </div>
              )}
            </div>
          </div>

          <CardBody className="pb-md-3 pb-lg-2 pt-lg-0">
            <div className="pl-0">
              {/* ── Filter row 1 ── */}
              <div className="row">
                <FormGroup className="col-md-3">
                  <Label>
                    {i18n.t("static.report.dateRange")}
                    <i
                      className="fa fa-info-circle icons"
                      title={i18n.t("static.report.reportPeriodTooltip")}
                      aria-hidden="true"
                      style={{
                        color: "#002f6c",
                        cursor: "pointer",
                        marginLeft: "5px",
                      }}
                    ></i>
                    <span className="stock-box-icon fa fa-sort-desc ml-1"></span>
                  </Label>
                  <div className="controls edit">
                    <Picker
                      ref="pickRange"
                      years={{
                        min: this.state.minDate,
                        max: this.state.maxDate,
                      }}
                      value={this.state.rangeValue}
                      lang={pickerLang}
                      key={
                        JSON.stringify(this.state.minDate) +
                        "-" +
                        JSON.stringify(this.state.rangeValue)
                      }
                      onDismiss={this.handleRangeDissmis}
                    >
                      <MonthBox
                        value={
                          makeText(this.state.rangeValue.from) +
                          " ~ " +
                          makeText(this.state.rangeValue.to)
                        }
                        onClick={this._handleClickRangeBox}
                      />
                    </Picker>
                  </div>
                </FormGroup>

                <FormGroup className="col-md-3">
                  <Label>{i18n.t("static.program.program")}</Label>
                  <div className="controls">
                    <InputGroup>
                      <Input
                        type="select"
                        name="programId"
                        id="programId"
                        bsSize="sm"
                        onChange={(e) => this.setProgramId(e)}
                        value={this.state.programId}
                      >
                        <option value="0">
                          {i18n.t("static.common.select")}
                        </option>
                        {programOptions}
                      </Input>
                    </InputGroup>
                  </div>
                </FormGroup>

                <FormGroup className="col-md-3">
                  <Label>
                    {i18n.t("static.report.versionFinal*")}{" "}
                    <i
                      className="fa fa-info-circle icons"
                      title={i18n.t("static.report.versionTooltip")}
                      aria-hidden="true"
                      style={{
                        color: "#002f6c",
                        cursor: "pointer",
                        marginLeft: "5px",
                      }}
                    ></i>
                  </Label>
                  <div className="controls">
                    <InputGroup>
                      <Input
                        type="select"
                        name="versionId"
                        id="versionId"
                        bsSize="sm"
                        onChange={(e) => this.setVersionId(e)}
                        value={this.state.versionId}
                      >
                        <option value="0">
                          {i18n.t("static.common.select")}
                        </option>
                        {versionOptions}
                      </Input>
                    </InputGroup>
                  </div>
                </FormGroup>

                <FormGroup className="col-md-3">
                  <Label>{i18n.t("static.planningunit.planningunit")}</Label>
                  <span className="reportdown-box-icon fa fa-sort-desc ml-1"></span>
                  <div onBlur={this.handleBlur}>
                    <MultiSelect
                      name="planningUnitId"
                      id="planningUnitId"
                      filterOptions={filterOptions}
                      bsSize="md"
                      value={this.state.planningUnitValues}
                      onChange={(e) => this.handlePlanningUnitChange(e)}
                      options={planningUnitList}
                      disabled={this.state.loading}
                      overrideStrings={{
                        allItemsAreSelected: i18n.t(
                          "static.common.allitemsselected"
                        ),
                        selectSomeItems: i18n.t("static.common.select"),
                      }}
                    />
                  </div>
                </FormGroup>
              </div>

              {/* ── Filter row 2 ── */}
              <div className="row">
                <FormGroup className="col-md-3">
                  <Label>{i18n.t("static.report.withinstock")}</Label>
                  <div onBlur={this.handleBlur}>
                    <MultiSelect
                      name="stockStatusId"
                      id="stockStatusId"
                      bsSize="sm"
                      value={this.state.stockStatusValues}
                      onChange={(e) =>
                        this.setState({
                          stockStatusValues: e,
                          stockStatusLabels: e.map((x) => x.label),
                        })
                      }
                      options={legendcolor.map((item) => ({
                        label: item.text,
                        value: item.value,
                      }))}
                      overrideStrings={{
                        allItemsAreSelected: i18n.t(
                          "static.common.allitemsselected"
                        ),
                        selectSomeItems: i18n.t("static.common.select"),
                      }}
                    />
                  </div>
                </FormGroup>

                <FormGroup className="col-md-3 mt-3">
                  <div className="controls form-check">
                    <Input
                      className="form-check-input"
                      type="checkbox"
                      id="removePlannedShipments"
                      checked={this.state.removePlannedShipments}
                      onChange={(e) =>
                        this.setState(
                          { removePlannedShipments: e.target.checked },
                          () => this.filterData()
                        )
                      }
                    />
                    <Label
                      className="form-check-label"
                      htmlFor="removePlannedShipments"
                    >
                      {i18n.t("static.report.removePlannedShipments")}
                      <i
                        className="fa fa-info-circle icons"
                        title={i18n.t(
                          "static.report.removePlannedShipmentsTooltip"
                        )}
                        aria-hidden="true"
                        style={{
                          color: "#002f6c",
                          cursor: "pointer",
                          marginLeft: "5px",
                        }}
                      ></i>
                    </Label>
                  </div>
                  <div className="controls form-check mt-1">
                    <Input
                      className="form-check-input"
                      type="checkbox"
                      id="removeTBDFundingSourceShipments"
                      checked={this.state.removeTBDFundingSourceShipments}
                      onChange={(e) =>
                        this.setState(
                          { removeTBDFundingSourceShipments: e.target.checked },
                          () => this.filterData()
                        )
                      }
                    />
                    <Label
                      className="form-check-label"
                      htmlFor="removeTBDFundingSourceShipments"
                    >
                      {i18n.t("static.report.removeTBDFundingSourceShipments")}
                      <i
                        className="fa fa-info-circle icons"
                        title={i18n.t(
                          "static.report.removeTBDFundingSourceShipmentsTooltip"
                        )}
                        aria-hidden="true"
                        style={{
                          color: "#002f6c",
                          cursor: "pointer",
                          marginLeft: "5px",
                        }}
                      ></i>
                    </Label>
                  </div>
                </FormGroup>

                <FormGroup className="col-md-3 mt-3">
                  <div className="controls form-check">
                    <Input
                      className="form-check-input"
                      type="checkbox"
                      id="showQuantity"
                      checked={this.state.showQuantity}
                      onChange={(e) =>
                        this.setState(
                          { showQuantity: e.target.checked },
                          () => {
                            this.buildMatrixJExcel();
                            if (this.state.showDetailData)
                              this.buildDetailJExcel();
                          }
                        )
                      }
                    />
                    <Label className="form-check-label" htmlFor="showQuantity">
                      {i18n.t("static.report.showQuantity")}
                      <i
                        className="fa fa-info-circle icons"
                        title={i18n.t("static.report.showQuantityTooltip")}
                        aria-hidden="true"
                        style={{
                          color: "#002f6c",
                          cursor: "pointer",
                          marginLeft: "5px",
                        }}
                      ></i>
                    </Label>
                  </div>
                  <div className="controls form-check mt-1">
                    <Input
                      className="form-check-input"
                      type="checkbox"
                      id="showIcon"
                      checked={this.state.showIcon}
                      onChange={(e) =>
                        this.setState({ showIcon: e.target.checked }, () =>
                          this.buildMatrixJExcel()
                        )
                      }
                    />
                    <Label className="form-check-label" htmlFor="showIcon">
                      {i18n.t("static.report.showIcon")}
                      <i
                        className="fa fa-info-circle icons"
                        title={i18n.t("static.report.showIconTooltip")}
                        aria-hidden="true"
                        style={{
                          color: "#002f6c",
                          cursor: "pointer",
                          marginLeft: "5px",
                        }}
                      ></i>
                    </Label>
                  </div>
                </FormGroup>
              </div>

              {/* ── Data area ── */}
              <div style={{ display: this.state.loading ? "none" : "block" }}>
                {hasData && (
                  <div className="row">
                    <FormGroup className="col-md-10 mt-3">
                      <ul className="legendcommitversion list-group">
                        {legendcolor.map((item, idx) => (
                          <li key={idx}>
                            <span
                              className="legendcolor"
                              style={{ backgroundColor: item.color }}
                            ></span>
                            <span className="legendcommitversionText">
                              {item.text}
                            </span>
                          </li>
                        ))}
                        <li>
                          <span
                            className="fa fa-truck legendcolor"
                            style={{ color: "#000" }}
                          ></span>
                          <span className="">
                            {i18n.t("static.shipment.shipment")}
                          </span>
                        </li>
                        <li>
                          <span
                            className="fa fa-exclamation-triangle legendcolor"
                            style={{ color: "#000" }}
                          ></span>
                          <span className="">
                            {i18n.t("static.supplyplan.exipredStock")}
                          </span>
                        </li>
                        <li>
                          <span className="legendcommitversionText">
                            <b>{i18n.t("static.supplyPlan.actualBalance")}</b>
                          </span>
                        </li>
                      </ul>
                    </FormGroup>

                    <div className="ReportSearchMarginTop TableWidth100">
                      <div
                        className="jexcelremoveReadonlybackground TableWidth100"
                        id="stockMatrixTableDiv"
                      />
                    </div>
                  </div>
                )}

                {hasDetails && (
                  <div className="col-md-12">
                    <button
                      className="mr-1 mb-2 mt-2 float-right btn btn-info btn-md showdatabtn"
                      onClick={() => {
                        const next = !showDetailData;
                        this.setState({ showDetailData: next }, () => {
                          if (next) this.buildDetailJExcel();
                        });
                      }}
                    >
                      {showDetailData
                        ? i18n.t("static.common.hideData")
                        : i18n.t("static.common.showData")}
                    </button>
                  </div>
                )}

                {showDetailData && (
                  <>
                    {chartData && (
                      <div className="mt-4 mb-2" style={{ height: "450px" }}>
                        <Line data={chartData} options={chartOptions} />
                      </div>
                    )}

                    {hasDetails && (
                      <div className="row">
                        <FormGroup className="col-md-10 mt-3">
                          <ul className="legendcommitversion list-group mb-2 pt-2 pb-2">
                            <li>
                              <span className="purplelegend legendcolor"></span>
                              <span
                                className="legendcommitversionText"
                                style={{ color: "rgb(170, 85, 161)" }}
                              >
                                <i>
                                  {i18n.t(
                                    "static.supplyPlan.forecastedConsumption"
                                  )}
                                </i>
                              </span>
                            </li>
                            <li>
                              <span className="blacklegend legendcolor"></span>
                              <span className="legendcommitversionText">
                                {i18n.t("static.supplyPlan.actualConsumption")}
                              </span>
                            </li>
                            <li>
                              <span className="legendcolor"></span>
                              <span className="legendcommitversionText">
                                <b>
                                  {i18n.t("static.supplyPlan.actualBalance")}
                                </b>
                              </span>
                            </li>
                          </ul>
                        </FormGroup>
                        <div className="consumptionDataEntryTable ReportSearchMarginTop TableWidth100">
                          <div
                            className="jexcelremoveReadonlybackground TableWidth100"
                            id="stockDetailTableDiv"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {!hasData &&
                  !this.state.loading &&
                  this.state.planningUnitValues.length > 0 && (
                    <h5 className="red mt-3">
                      {i18n.t("static.stockStatusMatrix.noData")}
                    </h5>
                  )}
              </div>
              <Modal isOpen={this.state.exportModal} className="modal-lg">
                <ModalHeader
                  toggle={() => this.toggleExportModal(0)}
                  className="modalHeaderSupplyPlan"
                >
                  <strong>
                    {this.state.exportType == 1
                      ? i18n.t("static.supplyPlan.exportAsPDF")
                      : i18n.t("static.supplyPlan.exportAsCsv")}
                  </strong>
                </ModalHeader>
                <ModalBody>
                  <div className="row mb-1">
                    <div className="col-md-4">
                      <Label className="mb-0">
                        {i18n.t("static.program.program")}
                      </Label>
                    </div>
                    <div className="col-md-8 text-right">
                      <FormGroup check inline className="mb-0">
                        <Label check htmlFor="onlyDownloaded" className="mb-0">
                          <Input
                            type="checkbox"
                            id="onlyDownloaded"
                            checked={this.state.onlyDownloadedPrograms}
                            onChange={this.handleOnlyDownloadedChange}
                          />
                          {i18n.t("static.common.onlyDownloadedProgram")}
                        </Label>
                      </FormGroup>
                    </div>
                  </div>
                  <FormGroup>
                    <MultiSelect
                      name="exportProgramIds"
                      id="exportProgramIds"
                      options={
                        this.state.onlyDownloadedPrograms
                          ? this.state.downloadedPrograms.map((p) => ({
                              value: p.programId,
                              label: p.displayLabel,
                              versionId: p.versionId,
                            }))
                          : this.state.allProgramsForExport.map((p) => ({
                              value: p.programId,
                              label: p.programCode,
                            }))
                      }
                      value={this.state.exportProgramIds}
                      onChange={this.handleExportProgramChange}
                      filterOptions={filterOptions}
                      overrideStrings={{
                        allItemsAreSelected: i18n.t(
                          "static.common.allitemsselected"
                        ),
                        selectSomeItems: i18n.t("static.common.select"),
                      }}
                    />
                  </FormGroup>

                  {!this.state.onlyDownloadedPrograms &&
                    this.state.exportProgramIds.length == 1 && (
                      <FormGroup>
                        <Label>{i18n.t("static.report.version")}</Label>
                        <Input
                          type="select"
                          name="exportVersionId"
                          id="exportVersionId"
                          value={this.state.exportVersionId}
                          onChange={this.handleExportVersionChange}
                          bsSize="sm"
                        >
                          <option value="">
                            {i18n.t("static.common.select")}
                          </option>
                          {(this.state.versionsForExport || []).map((v, i) => (
                            <option key={i} value={v.versionId}>
                              {v.versionId} (
                              {moment(v.createdDate).format("MMM DD YYYY")})
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    )}

                  <FormGroup>
                    <Label>{i18n.t("static.planningunit.planningunit")}</Label>
                    <MultiSelect
                      name="exportPlanningUnitIds"
                      id="exportPlanningUnitIds"
                      options={(this.state.planningUnitsForExport || []).map(
                        (p) => ({
                          value: p.value || p.id,
                          label:
                            getLabelText(p.label, this.state.lang) +
                            " | " +
                            (p.value || p.id),
                        })
                      )}
                      value={this.state.exportPlanningUnitIds}
                      onChange={this.handleExportPlanningUnitChange}
                      filterOptions={filterOptions}
                      overrideStrings={{
                        allItemsAreSelected: i18n.t(
                          "static.common.allitemsselected"
                        ),
                        selectSomeItems: i18n.t("static.common.select"),
                      }}
                    />
                  </FormGroup>
                </ModalBody>
                <ModalFooter>
                  {this.state.exportProgramIds.length > 0 &&
                    this.state.exportPlanningUnitIds.length > 0 &&
                    (!this.state.onlyDownloadedPrograms &&
                    this.state.exportProgramIds.length == 1
                      ? this.state.exportVersionId
                      : true) && (
                      <Button
                        color="success"
                        size="md"
                        onClick={this.fetchDataForExport}
                        disabled={this.state.exportLoading}
                      >
                        {this.state.exportLoading
                          ? i18n.t("static.common.loading")
                          : i18n.t("static.common.submit")}
                      </Button>
                    )}
                </ModalFooter>
              </Modal>

              {/* ── Loading spinner ── */}
              <div style={{ display: this.state.loading ? "block" : "none" }}>
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ height: "500px" }}
                >
                  <div className="align-items-center">
                    <h4>
                      <strong>{i18n.t("static.common.loading")}</strong>
                    </h4>
                    <div
                      className="spinner-border blue ml-4"
                      role="status"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden charts for PDF export support - must be visible enough for browser to render canvas */}
            <div
              id="hidden-export-charts"
              style={{
                position: "absolute",
                left: "-10000px",
                top: "0",
                visibility: "hidden",
              }}
            >
              {this.state.exportLoading &&
                this.state.PlanningUnitDataForExport &&
                (this.state.exportProgramIds || []).map((prog, idx) => {
                  const cData = this.buildChartDataForProgram(
                    prog.value,
                    this.state.PlanningUnitDataForExport.stockStatusDetails,
                    this.state.PlanningUnitDataForExport.stockStatusMatrix,
                    this.state.showQuantity,
                    this.state.lang
                  );
                  if (!cData) return null;
                  return (
                    <div key={idx} style={{ width: "800px", height: "400px" }}>
                      <Line
                        id={`export-chart-${prog.value}`}
                        data={cData}
                        options={chartOptions}
                      />
                    </div>
                  );
                })}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
}
