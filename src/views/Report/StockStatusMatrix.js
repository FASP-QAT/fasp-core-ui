import "antd/dist/antd.css";
import CryptoJS from "crypto-js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import { onOpenFilter, jExcelLoadedFunction, jExcelLoadedFunctionWithoutPagination, jExcelLoadedFunctionStockStatusMatrix } from "../../CommonComponent/JExcelCommonFunctions.js";
import moment from "moment";
import React from "react";
import { Line } from "react-chartjs-2";
import { MultiSelect } from "react-multi-select-component";
import { Card, CardBody, FormGroup, Input, InputGroup, Label } from "reactstrap";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from "../../CommonComponent/Logo.js";
import getLabelText from "../../CommonComponent/getLabelText";
import {
  API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION,
  JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, SECRET_KEY,
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
  addDoubleQuoteToRowContent, filterOptions, formatter,
  formatterMOS, roundAMC, makeText,
} from "../../CommonComponent/JavascriptCommonFunctions";
import Picker from "react-month-picker";
import MonthBox from "../../CommonComponent/MonthBox.js";
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';

// ─── Constants ────────────────────────────────────────────────────────────────

const pickerLang = {
  months: [
    i18n.t("static.month.jan"), i18n.t("static.month.feb"),
    i18n.t("static.month.mar"), i18n.t("static.month.apr"),
    i18n.t("static.month.may"), i18n.t("static.month.jun"),
    i18n.t("static.month.jul"), i18n.t("static.month.aug"),
    i18n.t("static.month.sep"), i18n.t("static.month.oct"),
    i18n.t("static.month.nov"), i18n.t("static.month.dec"),
  ],
  from: "From", to: "To",
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
const ALL_STOCK_STATUS = legendcolor.map(item => ({ label: item.text, value: item.value }));

const entityname = i18n.t("static.dashboard.productCatalog");

const DARK_COLORS = [
  '#d4bbff', '#BA0C2F', '#757575', '#0067B9', '#A7C6ED', '#205493', '#ba4e00', '#6C6463', '#BC8985', '#cfcdc9',
  '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626', '#d4bbff', '#BA0C2F', '#757575', '#0067B9', '#A7C6ED',
  '#205493', '#ba4e00', '#6C6463', '#BC8985', '#cfcdc9', '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
  '#d4bbff', '#BA0C2F', '#757575', '#0067B9', '#A7C6ED',
];
const LIGHT_COLORS = [
  '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED', '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
  '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626', '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
  '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9', '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
  '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function deriveMonthColumns(stockStatusMatrix, startDate, endDate) {
  const keySet = new Set();
  (stockStatusMatrix || []).forEach(row =>
    Object.keys(row.dataMap || {}).forEach(k => {
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
  if (!dataEntry || dataEntry.stockStatusId === -1) return null;
  const { mos, closingBalance } = dataEntry;
  if (showQuantity || planBasedOn === 2) {
    return closingBalance != null ? Math.round(closingBalance) : null;
  }
  return mos != null ? roundAMC(mos) : null;
}

// Local version: derive statusId from MOS vs min/reorder thresholds
function calcStatusIdLocal(mos, minMos, reorderFrequency) {
  if (mos == null) return -1;
  const v = roundAMC(mos);
  if (v === 0) return 0;
  if (v < minMos) return 1;
  if (v > minMos + reorderFrequency) return 3;
  return 2;
}

// Calculate dynamic maxStock for plan-by-qty
// For each month: dynamicMax = minStock + reorderFrequency * AMC
// Return the average across all months that have AMC data.
function calcAverageMaxStock(supplyPlanEntries, minStock, reorderFrequency) {
  const monthlyMaxValues = supplyPlanEntries
    .filter(sp => sp.amc != null && sp.amc > 0)
    .map(sp => minStock + reorderFrequency * sp.amc);

  if (monthlyMaxValues.length === 0) return 0;
  const sum = monthlyMaxValues.reduce((acc, v) => acc + v, 0);
  return sum / monthlyMaxValues.length;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default class StockStatusMatrix extends React.Component {
  constructor(props) {
    super(props);
    var dt = new Date(); dt.setMonth(dt.getMonth() - 3);
    var dt1 = new Date(); dt1.setMonth(dt1.getMonth() + 14);

    this.state = {
      stockStatusMatrix: [],
      stockStatusDetails: [],
      filteredMatrix: [],
      filteredDetails: [],
      monthColumns: [],
      programs: [], versions: [], planningUnits: [],
      planningUnitValues: [], planningUnitLabels: [],
      // Default: all stock statuses selected
      stockStatusValues: ALL_STOCK_STATUS,
      stockStatusLabels: ALL_STOCK_STATUS.map(x => x.label),
      rangeValue: {
        from: { year: dt.getFullYear(), month: dt.getMonth() + 1 },
        to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 },
      },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      programId: "", versionId: "",
      showQuantity: false,   // default unchecked
      showIcon: true,        // default checked
      showDetailData: false, // Show Data button toggle
      removePlannedShipments: false,
      removeTBDFundingSourceShipments: false,
      message: "", loading: true,
      lang: localStorage.getItem("lang"),
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

  // ─── Utility ─────────────────────────────────────────────────────────────────

  destroyJExcel(divId) {
    try { jexcel(document.getElementById(divId), ""); } catch (_) { }
    try { jexcel.destroy(document.getElementById(divId), true); } catch (_) { }
  }

  processApiData(stockStatusMatrix, stockStatusDetails) {
    const { from, to } = this.state.rangeValue;
    const startDate = `${from.year}-${String(from.month).padStart(2, "0")}-01`;
    const lastDay = new Date(to.year, to.month, 0).getDate();
    const endDate = `${to.year}-${String(to.month).padStart(2, "0")}-${lastDay}`;

    const rangeFilteredDetails = stockStatusDetails.filter(
      d => d.month >= startDate && d.month <= endDate
    );
    const monthColumns = deriveMonthColumns(stockStatusMatrix, startDate, endDate);
    this.setState(
      { stockStatusMatrix, stockStatusDetails: rangeFilteredDetails, monthColumns, loading: false, message: "" },
      () => this.applyStockStatusFilter()
    );
  }

  applyStockStatusFilter() {
    const { stockStatusMatrix, stockStatusDetails, stockStatusValues } = this.state;
    const selectedIds = stockStatusValues.map(v => Number(v.value));

    let filteredMatrix = stockStatusMatrix;
    let filteredDetails = stockStatusDetails;

    if (selectedIds.length > 0) {
      filteredMatrix = stockStatusMatrix.filter(row =>
        Object.values(row.dataMap || {}).some(d => selectedIds.includes(d.stockStatusId))
      );
      filteredDetails = stockStatusDetails.filter(d =>
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

    // Build lookup maps keyed by puId+dateKey so updateTable works correctly
    // after sorting/pagination regardless of visual row index.
    const statusLookup = {};   // `${puId}|${dateKey}` → stockStatusId
    const entryLookup = {};    // `${puId}|${dateKey}` → full entry
    filteredMatrix.forEach(row => {
      const puId = row.planningUnit.id;
      Object.entries(row.dataMap || {}).forEach(([dateKey, entry]) => {
        const lookupKey = `${puId}|${dateKey}`;
        statusLookup[lookupKey] = entry.stockStatusId;
        entryLookup[lookupKey] = entry;
      });
    });

    const tableRows = filteredMatrix.map(row => {
      const puLabel = getLabelText(row.planningUnit.label, lang) + " | " + row.planningUnit.id;
      const puId = row.planningUnit.id;
      const planBy = row.planBasedOn === 1 ? i18n.t("static.report.mos") : i18n.t("static.report.qty");
      const minMax = row.planBasedOn === 1
        ? `${formatterMOS(row.minMonthsOfStock, 0)} / ${formatterMOS(Number(row.minMonthsOfStock) + Number(row.reorderFrequency), 0)}`
        : `${formatter(Math.round(row.minStock || 0))} / ${formatter(Math.round(row.maxStock || 0))}`;

      const dataCells = monthColumns.map(dateKey => {
        const entry = (row.dataMap || {})[dateKey];
        return entry ? cellDisplayValue(entry, showQuantity, row.planBasedOn) : null;
      });

      // puId stored in last hidden column for click navigation and updateTable lookup
      return [puLabel, planBy, minMax, ...dataCells, row.notes || "", String(puId)];
    });

    const monthCols = monthColumns.map(dateKey => ({
      title: moment(dateKey).format("MMM YYYY"),
      type: "numeric",
      width: 72,
      readOnly: true,
      align: "center",
      // NOTE: Do NOT set render/naRender here — updateTable handles all cell
      // content and colour for month columns. A render callback here would
      // overwrite the innerHTML that updateTable writes, causing colours to
      // disappear on page changes when jSpreadsheet re-renders cells.
    }));

    const columns = [
      { title: i18n.t("static.planningunit.planningunit"), type: "text", width: 230, readOnly: true },
      { title: i18n.t("static.stockStatus.plannedBy"), type: "text", width: 62, readOnly: true },
      {
        title: `${i18n.t("static.stockStatusMatrix.minMax")}`,
        type: "text", width: 95, readOnly: true,
      },
      ...monthCols,
      { title: i18n.t("static.program.notes"), type: "text", width: 140, readOnly: true },
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
        const nonNa = rows.filter(r => r[col] !== null && r[col] !== "" && r[col] !== undefined);
        const na = rows.filter(r => r[col] === null || r[col] === "" || r[col] === undefined);
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
        if (section === "cell" && x === 0) {
          // Use tableRows with absolute row index y — reliable after sort
          const rowData = tableRows[y] || [];
          const puId = rowData[rowData.length - 1];
          if (puId) {
            localStorage.setItem("stockStatusMatrixPayload", JSON.stringify({
              programId: self.state.programId,
              versionId: self.state.versionId,
              planningUnitId: puId
            }));
            let url = window.location.href.split('#')[0] + '#/report/stockStatus';
            window.open(url, "_blank");
          }
        }
      },
      // updateTable is the single source of truth for ALL cell styling in month
      // columns. No render callback is registered on those columns so jSpreadsheet
      // never resets the innerHTML/style between pages.
      //
      // IMPORTANT: `row` is always the ABSOLUTE data index. We read directly from
      // the `tableRows` closure array — reliable after both sorting and pagination.
      // worksheet.getRowData(row) is NOT used here because on paginated/sorted
      // instances it can map the argument as a visual index instead of absolute,
      // returning wrong data and causing colours to disappear on pages 2+.
      updateTable(worksheet, cell, col, row, value) {
        const td = cell && cell.element ? cell.element : cell;
        if (!td || !td.style) return;

        // Style PU name column as clickable
        if (col === 0 && row >= 0) {
          td.style.cursor = "pointer";
          return;
        }

        if (col < monthStartIdx || col > monthEndIdx) return;

        // Use closure tableRows with absolute row index — always correct
        const rowData = tableRows[row];
        if (!rowData) return;
        const puId = rowData[rowData.length - 1]; // last col is always puId
        const dateKey = monthColumns[col - monthStartIdx];
        const lookupKey = `${puId}|${dateKey}`;
        const entry = entryLookup[lookupKey];
        const statusId = entry != null ? entry.stockStatusId : -1;
        const bgColor = colorForStatus(statusId);

        const textColor = (bgColor === "#BA0C2F" || bgColor === "#118b70") ? "#fff" : "#333";
        const fontWeight = (entry && entry.actualStock) ? "bold" : "normal";

        // Show "N/A" for missing/NA entries; otherwise let the numeric value show
        if (value === null || value === "" || value === undefined) {
          td.innerHTML = "N/A";
        }

        // Apply background colour — use cssText so it always overrides jSpreadsheet
        // default styles that get re-applied on every page render.
        td.style.cssText = `background-color: ${bgColor} !important; color: ${textColor} !important; font-weight: ${fontWeight} !important;`;

        // Icon overlay
        if (self.state.showIcon && entry) {
          if (entry.expiredQty && entry.expiredQty > 0 && !td.querySelector("i.warning-icon")) {
            const warningIcon = document.createElement("i");
            warningIcon.className = "fa fa-exclamation-triangle warning-icon";
            warningIcon.style.color = "#ED8944";
            warningIcon.style.marginRight = "3px";
            td.prepend(warningIcon);
          }
          if (entry.shipmentQty && entry.shipmentQty > 0 && !td.querySelector("i.truck-icon")) {
            const truckIcon = document.createElement("i");
            truckIcon.className = "fa fa-truck truck-icon";
            truckIcon.style.color = "#ba0c2f";
            truckIcon.style.marginRight = "3px";
            td.prepend(truckIcon);
          }
        }

        // Tooltip
        if (entry) {
          const tips = [];
          tips.push(
            `${i18n.t("static.report.stock")}: ${entry.closingBalance != null
              ? formatter(Math.round(entry.closingBalance))
              : 0
            }`
          );
          tips.push(
            `${i18n.t("static.stockStatusMatrix.totalShipmentQty")}: ${entry.shipmentQty != null ? formatter(entry.shipmentQty) : 0
            }`
          );
          tips.push(
            `${i18n.t("static.supplyPlan.expiredQty")}: ${entry.expiredQty != null ? formatter(entry.expiredQty) : 0
            }`
          );
          td.title = tips.join(" | ");
        }
      },
      contextMenu: () => false,
    };

    this.matrixEl = jexcel(document.getElementById("stockMatrixTableDiv"), options);
  }

  loadedMatrix(instance) {
    jExcelLoadedFunctionWithoutPagination(instance);
    try {
      const currentMonthLabel = moment().format("MMM YYYY");
      const table = instance.element || instance;
      const ths = table.querySelectorAll("thead tr td");
      ths.forEach(th => {
        if ((th.innerText || th.textContent || "").trim() === currentMonthLabel) {
          th.classList.add("supplyplan-Thead");
          th.style.cssText += "background-color: #e4e5e6 !important; color: #20a8d8 !important;";
        }
      });
    } catch (_) { }
  }

  // ─── Table 2: Stock Status Detail ────────────────────────────────────────────

  buildDetailJExcel() {
    this.destroyJExcel("stockDetailTableDiv");
    const { filteredDetails, lang } = this.state;
    if (!filteredDetails.length) return;

    const sorted = [...filteredDetails].sort((a, b) => {
      if (a.month < b.month) return -1;
      if (a.month > b.month) return 1;
      return getLabelText(a.planningUnit.label, lang)
        .localeCompare(getLabelText(b.planningUnit.label, lang));
    });

    // col indices:
    // 0=Month, 1=PU, 2=Consumption, 3=AMC, 4=Stock, 5=MOS, 6=StockStatus,
    // 7=statusId(hidden), 8=actualStock(hidden), 9=actualConsumption(hidden), 10=planBasedOn(hidden)
    const tableRows = sorted.map(row => {
      const statusLabel = (STOCK_STATUS_MAP[row.stockStatusId] || STOCK_STATUS_MAP["-1"]).label;
      const matrixRow = this.state.filteredMatrix.find(
        r => String(r.planningUnit.id) === String(row.planningUnit.id)
      );
      const planBasedOn = matrixRow ? matrixRow.planBasedOn : 1;

      // For plan-by-qty store "" so the MOS cell renders truly blank with no colour.
      const mosValue = planBasedOn === 2
        ? ""
        : (row.mos != null ? roundAMC(row.mos) : null);

      return [
        moment(row.month).format("MMM YYYY"),
        getLabelText(row.planningUnit.label, lang) + " | " + row.planningUnit.id,
        row.consumptionQty != null ? Math.round(row.consumptionQty) : null,
        row.amc != null ? Math.round(row.amc) : null,
        row.closingBalance != null ? Math.round(row.closingBalance) : null,
        mosValue,
        statusLabel,
        String(row.stockStatusId),              // hidden – stock status colour
        row.actualStock ? "1" : "0",            // hidden – bold for actual balance
        row.actualConsumption ? "1" : "0",      // hidden – purple/black for consumption
        String(planBasedOn),                    // hidden – plan basis
      ];
    });

    const columns = [
      { title: i18n.t("static.common.month"), type: "text", width: 85, readOnly: true },
      { title: i18n.t("static.planningunit.planningunit"), type: "text", width: 270, readOnly: true },
      { title: i18n.t("static.supplyPlan.consumption"), type: "numeric", mask: "#,##0", width: 105, readOnly: true },
      { title: i18n.t("static.report.amc"), type: "numeric", mask: "#,##0", width: 105, readOnly: true },
      { title: i18n.t("static.report.stock"), type: "numeric", mask: "#,##0", width: 105, readOnly: true },
      { title: i18n.t("static.report.mos"), type: "numeric", mask: "#,##0.00", width: 80, readOnly: true, align: "center" },
      { title: i18n.t("static.dashboard.stockstatusmain"), type: "text", width: 125, readOnly: true },
      { title: "statusId", type: "hidden" },
      { title: "actualStock", type: "hidden" },
      { title: "actualConsumption", type: "hidden" },
      { title: "planBasedOn", type: "hidden" },
    ];

    // ── Colour-application helper ─────────────────────────────────────────────
    // Applies colours/styles to every visible cell in the detail table.
    // Called from both onload and onpagechange so colours are always present
    // regardless of which page is displayed.
    //
    // `pageSize`  – rows per page (from pagination setting)
    // `pageIndex` – 0-based current page number
    //
    // We query the rendered <td> elements directly from the DOM because that is
    // the only reliable cross-version way to reach cells after a page change.
    // The absolute data-row index for any visible row is:
    //   absoluteRowIdx = pageIndex * pageSize + visibleRowOffset
    const applyDetailColours = (el, pageSize, pageIndex) => {
      if (!el) return;
      const tbody = el.querySelector && el.querySelector("tbody");
      if (!tbody) return;
      const trs = tbody.querySelectorAll("tr");
      console.log("Trs Test@123",trs);
      trs.forEach((tr, visibleRowOffset) => {
        const absoluteRowIdx = pageIndex * pageSize + visibleRowOffset;
        const rowData = tableRows[absoluteRowIdx];
        if (!rowData) return;

        const isActualStock       = rowData[8] === "1";
        const isActualConsumption = rowData[9] === "1";
        const planBasedOn         = Number(rowData[10]);
        const statusId            = Number(rowData[7]);
        const bgColor             = colorForStatus(statusId);
        const textColor           = (bgColor === "#BA0C2F" || bgColor === "#118b70") ? "#fff" : "#000";

        const tds = tr.querySelectorAll("td");
        tds.forEach(td => {
          const col = Number(td.getAttribute("data-x"));
          if (isNaN(col)) return;

          // ── Col 2 (Consumption) ──
          if (col === 2) {
            if (!td.textContent.trim()) td.innerHTML = "N/A";
            td.setAttribute("style",
              isActualConsumption
                ? "color: #000 !important; font-weight: bold !important;"
                : "color: rgb(170,85,161) !important; font-style: italic !important;"
            );
            return;
          }

          // ── Col 3 (AMC) ──
          if (col === 3) {
            if (!td.textContent.trim()) td.innerHTML = "N/A";
            return;
          }

          // ── Col 4 (Stock / closing balance) ──
          if (col === 4) {
            if (!td.textContent.trim()) td.innerHTML = "N/A";
            if (isActualStock) td.setAttribute("style", "font-weight: bold !important;");
            return;
          }

          // ── Col 5 (MOS) ──
          if (col === 5) {
            if (planBasedOn === 2) {
              // plan-by-qty: completely blank, no colour
              td.innerHTML = "";
              td.style.cssText = "";
              return;
            }
            // plan-by-mos: colour same as stock status
            if (!td.textContent.trim()) td.innerHTML = "N/A";
            const fontWeight = isActualStock ? "bold" : "normal";
            td.style.cssText = `background-color: ${bgColor} !important; color: ${textColor} !important; text-align: center !important; font-weight: ${fontWeight} !important;`;
            return;
          }

          // ── Col 6 (Stock Status label) ──
          if (col === 6) {
            td.setAttribute("style",
              `background-color: ${bgColor} !important; color: ${textColor} !important; text-align: center !important;`
            );
            return;
          }
        });
      });
    };

    jexcel.setDictionary({ Show: " ", entries: " " });

    const pageSize = Number(localStorage.getItem("sesRecordCount")) || 10;
    // Track the current page so onpagechange always has the right index.
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
        // Apply colours to page 1 on initial load
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
      // onpagechange fires AFTER the new page's rows are rendered into the DOM.
      // jSpreadsheet passes `page` as a 1-based page number (page 1 = first page).
      // We convert to 0-based for use as an array offset multiplier.
      onchangepage: (instance, page) => {
        const zeroBasedPage = Math.max(0, Number(page) - 1);
        currentPage = zeroBasedPage;
        const el = instance.element || instance;
        applyDetailColours(el, pageSize, currentPage)
      },
      contextMenu: () => false,
    };

    this.detailEl = jexcel(document.getElementById("stockDetailTableDiv"), options);
  }

  loadedDetail(instance) { jExcelLoadedFunctionStockStatusMatrix(instance, 1); }

  // ─── Line Graph ───────────────────────────────────────────────────────────────

  buildChartData() {
    const { filteredDetails, showQuantity, lang, filteredMatrix } = this.state;
    if (!filteredDetails.length) return null;

    const isDarkMode = document.body.classList.contains("dark-mode");
    const backgroundColor1 = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

    const allMonths = [...new Set(filteredDetails.map(d => d.month))].sort();
    const labels = allMonths.map(m => moment(m).format("MMM YYYY"));

    const byPU = {};
    filteredDetails.forEach(d => {
      const id = d.planningUnit.id;
      if (!byPU[id]) byPU[id] = { label: getLabelText(d.planningUnit.label, lang), data: {} };

      const matrixRow = filteredMatrix.find(r => String(r.planningUnit.id) === String(id));
      const planBasedOn = matrixRow ? matrixRow.planBasedOn : 1;
      const isQty = showQuantity || planBasedOn === 2;

      const val = isQty
        ? (d.closingBalance != null ? Math.round(d.closingBalance) : null)
        : (d.mos != null ? (roundAMC(d.mos)) : null);
      byPU[id].data[d.month] = val;
    });

    const puKeys = Object.keys(byPU);
    const datasets = puKeys.map((id, index) => {
      const matrixRow = filteredMatrix.find(r => String(r.planningUnit.id) === String(id));
      const planBasedOn = matrixRow ? matrixRow.planBasedOn : 1;
      const yAxisID = showQuantity
        ? "y-axis-1"
        : planBasedOn === 2
          ? "y-axis-2"
          : "y-axis-1";

      return {
        type: "line",
        pointStyle: "line",
        lineTension: 0,
        backgroundColor: "transparent",
        label: byPU[id].label,
        data: allMonths.map(m => byPU[id].data[m] ?? null),
        borderColor: backgroundColor1[index % backgroundColor1.length],
        spanGaps: false,
        yAxisID: yAxisID,
      };
    });

    return { labels, datasets };
  }

  // ─── CSV export ───────────────────────────────────────────────────────────────

  exportCSV() {
    const { filteredMatrix, monthColumns, filteredDetails, showQuantity, lang } = this.state;
    const csvRow = [];

    csvRow.push(`"${i18n.t("static.dashboard.stockstatusmatrix").replaceAll(" ", "%20")}"`);
    csvRow.push("");

    const t1Headers = [
      i18n.t("static.planningunit.planningunit"),
      i18n.t("static.stockStatus.plannedBy"),
      `${i18n.t("static.report.minMosOrQty")}/${i18n.t("static.report.maxMosOrQty")}`,
      ...monthColumns.map(d => moment(d).format("MMM YYYY")),
      i18n.t("static.program.notes"),
    ];
    const A = [addDoubleQuoteToRowContent(t1Headers.map(h => h.replaceAll(" ", "%20")))];
    filteredMatrix.forEach(row => {
      const minMax = row.planBasedOn === 1
        ? `${formatterMOS(row.minMonthsOfStock, 0)}/${formatterMOS(Number(row.minMonthsOfStock) + Number(row.reorderFrequency), 0)}`
        : `${formatter(Math.round(row.minStock || 0))}/${formatter(Math.round(row.maxStock || 0))}`;
      A.push(addDoubleQuoteToRowContent([
        (getLabelText(row.planningUnit.label, lang) + " | " + row.planningUnit.id).replaceAll(",", " ").replaceAll(" ", "%20"),
        row.planBasedOn === 1 ? i18n.t("static.report.mos") : i18n.t("static.report.qty"),
        minMax,
        ...monthColumns.map(dateKey => {
          const entry = (row.dataMap || {})[dateKey];
          const raw = entry ? cellDisplayValue(entry, showQuantity, row.planBasedOn) : null;
          if (raw == null) return i18n.t("static.supplyPlanFormula.na");
          return showQuantity || row.planBasedOn === 2 ? formatter(raw) : formatterMOS(raw, 2);
        }),
        (row.notes || "").replaceAll(" ", "%20"),
      ]));
    });
    A.forEach(r => csvRow.push(r.join(",")));
    csvRow.push(""); csvRow.push("");

    csvRow.push(`"${i18n.t("static.report.stockStatusDetail").replaceAll(" ", "%20")}"`);
    csvRow.push("");
    const t2Headers = [
      i18n.t("static.common.month"), i18n.t("static.planningunit.planningunit"),
      i18n.t("static.report.consumption"), i18n.t("static.dashboard.amc"),
      i18n.t("static.report.stock"), i18n.t("static.report.mos"),
      i18n.t("static.dashboard.stockstatusmain"),
    ];
    const B = [addDoubleQuoteToRowContent(t2Headers.map(h => h.replaceAll(" ", "%20")))];
    filteredDetails.forEach(row => {
      const statusLabel = (STOCK_STATUS_MAP[row.stockStatusId] || STOCK_STATUS_MAP["-1"]).label;
      const matrixRow = this.state.filteredMatrix.find(
        r => String(r.planningUnit.id) === String(row.planningUnit.id)
      );
      const planBasedOn = matrixRow ? matrixRow.planBasedOn : 1;

      // FIX 2: MOS blank in CSV for plan-by-qty
      const mosDisplay = planBasedOn === 2
        ? ""
        : (row.mos != null ? formatterMOS(roundAMC(row.mos), 1) : i18n.t("static.supplyPlanFormula.na"));

      B.push(addDoubleQuoteToRowContent([
        moment(row.month).format("MMM YYYY").replaceAll(" ", "%20"),
        (getLabelText(row.planningUnit.label, lang) + " | " + row.planningUnit.id).replaceAll(",", " ").replaceAll(" ", "%20"),
        row.consumptionQty != null ? Math.round(row.consumptionQty) : "",
        row.amc != null ? Math.round(row.amc) : "",
        row.closingBalance != null ? Math.round(row.closingBalance) : "",
        mosDisplay,
        statusLabel.replaceAll(" ", "%20"),
      ]));
    });
    B.forEach(r => csvRow.push(r.join(",")));

    const a = document.createElement("a");
    a.href = "data:attachment/csv," + csvRow.join("%0A");
    a.target = "_Blank";
    a.download = i18n.t("static.dashboard.stockstatusmatrix") + ".csv";
    document.body.appendChild(a);
    a.click();
  }

  // ─── PDF export ───────────────────────────────────────────────────────────────

  exportPDF() {
    const { filteredMatrix, monthColumns, filteredDetails, showQuantity, lang } = this.state;
    const doc = new jsPDF("landscape", "pt", "A4");
    doc.setFontSize(8);

    const addHeaders = d => {
      const n = d.internal.getNumberOfPages();
      for (let i = 1; i <= n; i++) {
        d.setFontSize(12); d.setFont("helvetica", "bold"); d.setPage(i);
        d.addImage(LOGO, "png", 0, 10, 180, 50, "FAST");
        d.setTextColor("#002f6c");
        d.text(i18n.t("static.dashboard.stockstatusmatrix"), d.internal.pageSize.width / 2, 60, { align: "center" });
      }
    };
    const addFooters = d => {
      const n = d.internal.getNumberOfPages();
      d.setFont("helvetica", "bold"); d.setFontSize(6);
      for (let i = 1; i <= n; i++) {
        d.setPage(i);
        d.text(`Page ${i} of ${n}`, d.internal.pageSize.width / 9, d.internal.pageSize.height - 30, { align: "center" });
        d.text(`Copyright © 2020 ${i18n.t("static.footer")}`, (d.internal.pageSize.width * 6) / 7, d.internal.pageSize.height - 30, { align: "center" });
      }
    };

    const head1 = [[
      i18n.t("static.planningunit.planningunit"),
      i18n.t("static.stockStatus.plannedBy"),
      `${i18n.t("static.report.minMosOrQty")} / ${i18n.t("static.report.maxMosOrQty")}`,
      ...monthColumns.map(d => moment(d).format("MMM YY")),
      i18n.t("static.program.notes"),
    ]];
    const colorMap1 = filteredMatrix.map(row =>
      monthColumns.map(dateKey => {
        const entry = (row.dataMap || {})[dateKey];
        return entry ? colorForStatus(entry.stockStatusId) : "#cfcdc9";
      })
    );
    const body1 = filteredMatrix.map(row => {
      const minMax = row.planBasedOn === 1
        ? `${formatterMOS(row.minMonthsOfStock, 0)} / ${formatterMOS(Number(row.minMonthsOfStock) + Number(row.reorderFrequency), 0)}`
        : `${formatter(Math.round(row.minStock || 0))} / ${formatter(Math.round(row.maxStock || 0))}`;
      return [
        getLabelText(row.planningUnit.label, lang) + " | " + row.planningUnit.id,
        row.planBasedOn === 1 ? i18n.t("static.report.mos") : i18n.t("static.report.qty"),
        minMax,
        ...monthColumns.map(dateKey => {
          const entry = (row.dataMap || {})[dateKey];
          const raw = entry ? cellDisplayValue(entry, showQuantity, row.planBasedOn) : null;
          if (raw == null) return i18n.t("static.supplyPlanFormula.na");
          return showQuantity || row.planBasedOn === 2 ? formatter(raw) : formatterMOS(raw, 2);
        }),
        row.notes || "",
      ];
    });
    doc.autoTable({
      margin: { top: 80, bottom: 90 }, startY: 90,
      head: head1, body: body1,
      styles: { lineWidth: 1, fontSize: 6, halign: "center", overflow: "linebreak" },
      columnStyles: { 0: { cellWidth: 100 } },
      didParseCell(data) {
        if (data.section === "body" && data.column.index >= 3 && data.column.index < 3 + monthColumns.length) {
          data.cell.styles.fillColor = colorMap1[data.row.index]?.[data.column.index - 3] || "#cfcdc9";
        }
      },
    });

    const head2 = [[
      i18n.t("static.common.month"), i18n.t("static.planningunit.planningunit"),
      i18n.t("static.report.consumption"), i18n.t("static.dashboard.amc"),
      i18n.t("static.report.stock"), i18n.t("static.report.mos"),
      i18n.t("static.dashboard.stockstatusmain"),
    ]];
    const colorMap2 = filteredDetails.map(r => {
      const matrixRow = this.state.filteredMatrix.find(
        m => String(m.planningUnit.id) === String(r.planningUnit.id)
      );
      const planBasedOn = matrixRow ? matrixRow.planBasedOn : 1;
      return { bgColor: colorForStatus(r.stockStatusId), planBasedOn };
    });
    const body2 = filteredDetails.map((row, idx) => {
      const statusLabel = (STOCK_STATUS_MAP[row.stockStatusId] || STOCK_STATUS_MAP["-1"]).label;
      const planBasedOn = colorMap2[idx].planBasedOn;
      // FIX 2: MOS blank in PDF for plan-by-qty
      const mosDisplay = planBasedOn === 2
        ? ""
        : (row.mos != null ? formatterMOS(roundAMC(row.mos), 1) : i18n.t("static.supplyPlanFormula.na"));

      return [
        moment(row.month).format("MMM YYYY"),
        getLabelText(row.planningUnit.label, lang) + " | " + row.planningUnit.id,
        row.consumptionQty != null ? formatter(Math.round(row.consumptionQty)) : "",
        row.amc != null ? formatter(Math.round(row.amc)) : "",
        row.closingBalance != null ? formatter(Math.round(row.closingBalance)) : "",
        mosDisplay,
        statusLabel,
      ];
    });
    doc.autoTable({
      margin: { top: 80, bottom: 90 }, startY: doc.lastAutoTable.finalY + 20,
      head: head2, body: body2,
      styles: { lineWidth: 1, fontSize: 7, halign: "center", overflow: "linebreak" },
      columnStyles: { 1: { cellWidth: 130 } },
      didParseCell(data) {
        if (data.section === "body") {
          // Col 6 = Stock Status: always colour
          if (data.column.index === 6) {
            data.cell.styles.fillColor = colorMap2[data.row.index]?.bgColor || "#cfcdc9";
          }
          // Col 5 = MOS: only colour for plan-by-mos rows
          if (data.column.index === 5 && colorMap2[data.row.index]?.planBasedOn !== 2) {
            data.cell.styles.fillColor = colorMap2[data.row.index]?.bgColor || "#cfcdc9";
          }
        }
      },
    });

    addHeaders(doc); addFooters(doc);
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
      req.onsuccess = e => {
        const db = e.target.result;
        const get = db.transaction(["programPlanningUnit"], "readwrite").objectStore("programPlanningUnit").getAll();
        get.onsuccess = () => {
          const lang = this.state.lang;
          const proList = get.result
            .filter(r => r.program.id == programId && r.active)
            .map(r => ({ label: r.planningUnit.label, value: r.planningUnit.id, json: r }))
            .sort((a, b) =>
              getLabelText(a.label, lang).toUpperCase() > getLabelText(b.label, lang).toUpperCase() ? 1 : -1
            );
          this.setState({
            planningUnits: proList,
            planningUnitValues: proList.map(p => ({ label: getLabelText(p.label, lang) + " | " + p.value, value: Number(p.value) })),
          }, () => this.filterData());
        };
      };
    } else {
      ReportService.getDropdownListByProgramIds({ programIds: [programId], onlyAllowPuPresentAcrossAllPrograms: false })
        .then(res => {
          const lang = this.state.lang;
          const list = (res.data.planningUnitList || []).sort((a, b) =>
            getLabelText(a.label, lang).toUpperCase() > getLabelText(b.label, lang).toUpperCase() ? 1 : -1
          );
          this.setState({
            planningUnits: list,
            planningUnitValues: list.map(p => ({ label: getLabelText(p.label, lang) + " | " + p.id, value: Number(p.id) })),
          }, () => this.filterData());
        })
        .catch(() => this.setState({ planningUnits: [], loading: false }));
    }
  }

  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => this.filterData());
  }
  _handleClickRangeBox() { this.refs.pickRange.show(); }

  handlePlanningUnitChange = ids => {
    ids = ids.sort((a, b) => parseInt(a.value) - parseInt(b.value));
    this.setState({ planningUnitValues: ids, planningUnitLabels: ids.map(e => e.label) });
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
    const planningUnitIds = this.state.planningUnitValues.map(e => e.value.toString());
    const { from, to } = this.state.rangeValue;
    const startDate = `${from.year}-${String(from.month).padStart(2, "0")}-01`;
    const lastDay = new Date(to.year, to.month, 0).getDate();
    const endDate = `${to.year}-${String(to.month).padStart(2, "0")}-${lastDay}`;

    if (planningUnitIds.length > 0 && programId > 0 && versionId != 0 && this.state.stockStatusValues.length > 0) {
      if (versionId.includes("Local")) {
        this.setState({ loading: true });
        getDatabase();
        const req = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        req.onerror = () => this.setState({ message: i18n.t("static.program.errortext"), loading: false });
        req.onsuccess = e => {
          const db = e.target.result;
          const version = versionId.split("(")[0].trim();
          const userId = CryptoJS.AES.decrypt(localStorage.getItem("curUser"), SECRET_KEY).toString(CryptoJS.enc.Utf8);
          const key = `${programId}_v${version}_uId_${userId}`;
          const get = db.transaction(["programData"], "readwrite").objectStore("programData").get(key);
          get.onerror = () => this.setState({ loading: false });
          get.onsuccess = () => {
            const programData = get.result?.programData;
            if (!programData) { this.setState({ loading: false }); return; }

            const puDataList = programData.planningUnitDataList || [];
            const generalData = JSON.parse(
              CryptoJS.AES.decrypt(programData.generalData, SECRET_KEY).toString(CryptoJS.enc.Utf8)
            );
            const matrix = []; const details = [];

            planningUnitIds.forEach(puId => {
              const puItem = this.state.planningUnits.find(p => String(p.id || p.value) === puId);
              const puActualLabel = puItem ? puItem.label : { label_en: String(puId) };

              const puSettings = (this.state.planningUnits || []).find(p => String(p.value) === puId) || {};
              const minMos = puSettings.json?.minMonthsOfStock || 5;
              const reorderFreq = puSettings.json?.reorderFrequencyInMonths || 5;
              const planBasedOn = puSettings.json?.planBasedOn || 1;
              const minStock = puSettings.json?.minQty || 0;
              const notes = puSettings.json?.notes || "";

              const puDataIdx = puDataList.findIndex(p => p.planningUnitId == puId);
              let programJson = { supplyPlan: [] };
              if (puDataIdx !== -1) {
                const bytes = CryptoJS.AES.decrypt(puDataList[puDataIdx].planningUnitData, SECRET_KEY);
                programJson = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
              }

              const inRangeEntries = (programJson.supplyPlan || []).filter(
                sp => sp.planningUnitId == puId && sp.transDate >= startDate && sp.transDate <= endDate
              );

              let maxStock;
              if (planBasedOn === 2) {
                maxStock = calcAverageMaxStock(inRangeEntries, minStock, reorderFreq);
              } else {
                maxStock = puSettings.json?.maxStock || 0;
              }

              const dataMap = {};
              inRangeEntries.forEach(sp => {
                const useWps = this.state.removePlannedShipments;
                const useWtbd = this.state.removeTBDFundingSourceShipments;

                const mos = useWps ? sp.mosWps : useWtbd ? sp.mosWtbdps : sp.mos;
                const cb = useWps ? sp.closingBalanceWps : useWtbd ? sp.closingBalanceWtbdps : sp.closingBalance;
                const amc = sp.amc;

                let statusId;
                if (planBasedOn === 1) {
                  statusId = calcStatusIdLocal(mos, minMos, reorderFreq);
                } else {
                  const dynamicMax = amc != null ? minStock + reorderFreq * amc : maxStock;
                  statusId = cb == null ? -1
                    : cb === 0 ? 0
                    : cb < minStock ? 1
                    : cb > dynamicMax ? 3
                    : 2;
                }

                const shipmentQty = useWps ? sp.shipmentTotalQtyWps : useWtbd ? sp.shipmentTotalQtyWtbdps : sp.shipmentTotalQty;
                const expiredQty = useWps ? sp.expiredStockWps : useWtbd ? sp.expiredStockWtbdps : sp.expiredStock;

                dataMap[sp.transDate] = {
                  mos, closingBalance: cb, amc,
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
                  amc, closingBalance: cb,
                  actualStock: !!sp.actualStock,
                  mos, stockStatusId: statusId,
                });
              });

              matrix.push({
                planningUnit: { id: Number(puId), label: puActualLabel },
                planBasedOn, minMonthsOfStock: minMos, reorderFrequency: reorderFreq,
                maxStock: Math.round(maxStock),
                minStock, dataMap, notes,
              });
            });

            this.processApiData(matrix, details);
          };
        };
      } else {
        this.setState({ loading: true });
        const inputjson = {
          programId, versionId, startDate, stopDate: endDate,
          planningUnitIds,
          stockStatusConditions: this.state.stockStatusValues.map(e => String(e.value)),
          removePlannedShipments: this.state.removePlannedShipments ? 1
            : this.state.removeTBDFundingSourceShipments ? 2 : 0,
          fundingSourceIds: [], procurementAgentIds: [],
          showByQty: this.state.showQuantity,
        };
        ProductService.getStockStatusMatrixData(inputjson)
          .then(response => {
            let { stockStatusMatrix = [], stockStatusDetails = [] } = response.data;

            stockStatusMatrix = stockStatusMatrix.map(row => {
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
                const dynamicMax = amc != null ? minStock + (row.reorderFrequency || 0) * amc : avgMax;
                const statusId = cb == null ? -1
                  : cb === 0 ? 0
                  : cb < minStock ? 1
                  : cb > dynamicMax ? 3
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
            stockStatusMatrix.forEach(r => { matrixById[r.planningUnit.id] = r; });
            stockStatusDetails = stockStatusDetails.map(detail => {
              const matrixRow = matrixById[detail.planningUnit.id];
              if (!matrixRow || matrixRow.planBasedOn !== 2) return detail;
              const entry = (matrixRow.dataMap || {})[detail.month];
              if (!entry) return detail;
              return { ...detail, stockStatusId: entry.stockStatusId };
            });

            this.processApiData(stockStatusMatrix, stockStatusDetails);
          })
          .catch(error => {
            this.setState({ filteredMatrix: [], filteredDetails: [], loading: false });
            if (error.message === "Network Error") {
              this.setState({ message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage") });
            } else {
              switch (error.response?.status) {
                case 401: this.props.history.push(`/login/static.message.sessionExpired`); break;
                case 403: this.props.history.push(`/accessDenied`); break;
                case 409: this.setState({ message: i18n.t("static.common.accessDenied") }); break;
                default: this.setState({ message: "static.unkownError" });
              }
            }
          });
      }
    } else if (programId == 0) {
      this.setState({ message: i18n.t("static.common.selectProgram"), filteredMatrix: [], filteredDetails: [], loading: false });
    } else if (versionId == 0) {
      this.setState({ message: i18n.t("static.program.validversion"), filteredMatrix: [], filteredDetails: [], loading: false });
    } else if (planningUnitIds.length === 0) {
      this.setState({ message: i18n.t("static.procurementUnit.validPlanningUnitText"), filteredMatrix: [], filteredDetails: [], loading: false });
    } else if (this.state.stockStatusValues.length == 0) {
      this.setState({ message: i18n.t("static.stockStatusMatrix.selectStockStatus"), filteredMatrix: [], filteredDetails: [], loading: false });
    }
  }

  // ─── Program / version loading ────────────────────────────────────────────────

  getPrograms = () => {
    if (localStorage.getItem("sessionType") === "Online") {
      DropdownService.getSPProgramBasedOnRealmId(AuthenticationService.getRealmId())
        .then(res => {
          const proList = res.data.map(p => ({ programId: p.id, label: p.label, programCode: p.code }));
          this.setState({ programs: proList, loading: false }, () => this.consolidatedProgramList());
        })
        .catch(() => this.setState({ programs: [], loading: false }, () => this.consolidatedProgramList()));
    } else {
      this.setState({ loading: false });
      this.consolidatedProgramList();
    }
  };

  consolidatedProgramList = () => {
    let proList = [...this.state.programs];
    getDatabase();
    const req = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    req.onsuccess = e => {
      const db = e.target.result;
      const get = db.transaction(["programData"], "readwrite").objectStore("programData").getAll();
      get.onsuccess = () => {
        const userId = CryptoJS.AES.decrypt(localStorage.getItem("curUser"), SECRET_KEY).toString(CryptoJS.enc.Utf8);
        get.result.forEach(r => {
          if (r.userId == userId) {
            const pd = JSON.parse(CryptoJS.AES.decrypt(r.programData.generalData, SECRET_KEY).toString(CryptoJS.enc.Utf8));
            if (!proList.find(p => p.programId == pd.programId)) proList.push(pd);
          }
        });
        const sorted = proList.sort((a, b) => a.programCode.toLowerCase() > b.programCode.toLowerCase() ? 1 : -1);
        const sesId = localStorage.getItem("sesProgramIdReport");
        if (sesId) {
          this.setState({ programs: sorted, programId: sesId },
            () => { this.filterVersion(); this.filterData(); });
        } else {
          this.setState({ programs: sorted });
        }
      };
    };
  };

  filterVersion = () => {
    const programId = this.state.programId;
    if (!programId || programId == 0) { this.setState({ versions: [] }); return; }
    localStorage.setItem("sesProgramIdReport", programId);
    if (!this.state.programs.find(p => p.programId == programId)) { this.setState({ versions: [] }); return; }
    if (localStorage.getItem("sessionType") === "Online") {
      this.setState({ versions: [] }, () => {
        DropdownService.getVersionListForSPProgram(programId)
          .then(res => this.setState({ versions: res.data }, () => this.consolidatedVersionList(programId)))
          .catch(() => this.setState({ versions: [], loading: false }));
      });
    } else {
      this.setState({ versions: [] }, () => this.consolidatedVersionList(programId));
    }
  };

  consolidatedVersionList = programId => {
    let verList = [...this.state.versions];
    getDatabase();
    const req = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    req.onsuccess = e => {
      const db = e.target.result;
      const get = db.transaction(["programData"], "readwrite").objectStore("programData").getAll();
      get.onsuccess = () => {
        const userId = CryptoJS.AES.decrypt(localStorage.getItem("curUser"), SECRET_KEY).toString(CryptoJS.enc.Utf8);
        get.result.forEach(r => {
          if (r.userId == userId && r.programId == programId) {
            const pd = JSON.parse(CryptoJS.AES.decrypt(r.programData.generalData, SECRET_KEY).toString(CryptoJS.enc.Utf8));
            const v = pd.currentVersion;
            if (v) {
              v.versionId = `${v.versionId} (Local)`;
              v.cutOffDate = pd.cutOffDate || "";
              verList.push(v);
            }
          }
        });
        const unique = [...new Map(verList.map(v => [v.versionId, v])).values()];
        const versionList = unique.sort((a, b) => {
          const aLocal = String(a.versionId).includes("Local");
          const bLocal = String(b.versionId).includes("Local");
          if (aLocal && !bLocal) return -1;
          if (!aLocal && bLocal) return 1;
          const aNum = parseInt(String(a.versionId).replace(/[^0-9]/g, ""), 10) || 0;
          const bNum = parseInt(String(b.versionId).replace(/[^0-9]/g, ""), 10) || 0;
          return bNum - aNum;
        });
        const sesVer = localStorage.getItem("sesVersionIdReport");
        const matched = sesVer && versionList.find(v => v.versionId == sesVer);
        this.setState(
          { versions: versionList, versionId: matched ? sesVer : (versionList[0]?.versionId || "") },
          () => this.getPlanningUnit()
        );
      };
    };
  };

  componentDidMount() { this.getPrograms(); }

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
      planningUnits, programs, versions, filteredMatrix, filteredDetails,
      showDetailData, showQuantity: showQty,
    } = this.state;

    const isDarkMode = document.body.classList.contains("dark-mode");
    const fontColor = isDarkMode ? "#fff" : "#212721";
    const gridLineColor = isDarkMode ? "#444" : "#e0e0e0";

    const planningUnitList = planningUnits.map(item => ({
      label: getLabelText(item.label, this.state.lang) + " | " + (item.id || item.value),
      value: Number(item.id || item.value),
    }));

    const programOptions = programs.map((item, i) => (
      <option key={i} value={item.programId}>{item.programCode}</option>
    ));
    const versionOptions = versions.map((item, i) => (
      <option key={i} value={item.versionId}>
        {item.versionStatus?.id == 2 && item.versionType?.id == 2 ? item.versionId + "**"
          : item.versionType?.id == 2 ? item.versionId + "*"
            : item.versionId}
        {" "}({moment(item.createdDate).format("MMM DD YYYY")})
        {item.cutOffDate ? ` (${i18n.t("static.supplyPlan.start")} ${moment(item.cutOffDate).format("MMM YYYY")})` : ""}
      </option>
    ));

    const hasData = filteredMatrix.length > 0;
    const hasDetails = filteredDetails.length > 0;
    const chartData = (hasDetails && showDetailData) ? this.buildChartData() : null;

    let hasMOS = false;
    let hasQty = false;
    if (showQty) {
      hasMOS = false;
      hasQty = false;
    } else {
      if (filteredMatrix) {
        hasQty = filteredMatrix.some(r => r.planBasedOn === 2);
        hasMOS = filteredMatrix.some(r => r.planBasedOn === 1);
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
            id: 'y-axis-1',
            type: 'linear',
            position: 'left',
            display: showQty || hasMOS || (!hasMOS && !hasQty),
            scaleLabel: {
              display: true,
              labelString: showQty ? i18n.t("static.report.stock") : i18n.t("static.report.mos"),
              fontColor,
            },
            ticks: {
              beginAtZero: true,
              fontColor,
              callback: function (value) {
                var x = (value + "").split(".");
                var x1 = x[0], x2 = x.length > 1 ? "." + x[1] : "";
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) x1 = x1.replace(rgx, "$1,$2");
                return x1 + x2;
              },
            },
            gridLines: { color: gridLineColor, drawBorder: true, lineWidth: 0, zeroLineColor: gridLineColor },
          },
          {
            id: 'y-axis-2',
            type: 'linear',
            position: 'right',
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
                var x1 = x[0], x2 = x.length > 1 ? "." + x[1] : "";
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) x1 = x1.replace(rgx, "$1,$2");
                return x1 + x2;
              },
            },
            gridLines: { color: gridLineColor, drawBorder: false, lineWidth: 0, zeroLineColor: gridLineColor },
          }
        ],
        xAxes: [{
          scaleLabel: { display: true, labelString: i18n.t("static.common.month"), fontColor, fontStyle: "normal", fontSize: "12" },
          ticks: { fontColor },
          gridLines: { color: gridLineColor, drawBorder: true, lineWidth: 0, zeroLineColor: gridLineColor },
        }],
      },
      tooltips: {
        mode: "index",
        enabled: false,
        custom: CustomTooltips,
        callback: function (value) {
          var x = (value + "").split(".");
          var x1 = x[0], x2 = x.length > 1 ? "." + x[1] : "";
          var rgx = /(\d+)(\d{3})/;
          while (rgx.test(x1)) x1 = x1.replace(rgx, "$1,$2");
          return x1 + x2;
        },
      },
      legend: {
        display: true, position: "bottom",
        labels: { usePointStyle: true, fontColor, fontSize: 12, boxWidth: 9, boxHeight: 2 },
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
                <span style={{ cursor: "pointer" }}
                  onClick={() => this.refs.formulaeChild.toggleStockStatusMatrix()}>
                  <small className="supplyplanformulas">
                    {i18n.t("static.supplyplan.supplyplanformula")}
                  </small>
                </span>
              </a>
              {(hasData || hasDetails) && (
                <div className="card-header-actions">
                  <img style={{ height: "25px", width: "25px", cursor: "pointer" }}
                    src={pdfIcon} title={i18n.t("static.report.exportPdf")}
                    onClick={() => this.exportPDF()} />
                  <img style={{ height: "25px", width: "25px", cursor: "pointer" }}
                    src={csvicon} title={i18n.t("static.report.exportCsv")}
                    onClick={() => this.exportCSV()} />
                </div>
              )}
            </div>
          </div>

          <CardBody className="pb-md-3 pb-lg-2 pt-lg-0">
            <div className="pl-0">
              {/* ── Filter row 1 ── */}
              <div className="row">
                <FormGroup className="col-md-3">
                  <Label>{i18n.t("static.report.dateRange")}
                    <span className="stock-box-icon fa fa-sort-desc ml-1"></span>
                  </Label>
                  <div className="controls edit">
                    <Picker ref="pickRange"
                      years={{ min: this.state.minDate, max: this.state.maxDate }}
                      value={this.state.rangeValue} lang={pickerLang}
                      key={JSON.stringify(this.state.minDate) + "-" + JSON.stringify(this.state.rangeValue)}
                      onDismiss={this.handleRangeDissmis}>
                      <MonthBox
                        value={makeText(this.state.rangeValue.from) + " ~ " + makeText(this.state.rangeValue.to)}
                        onClick={this._handleClickRangeBox} />
                    </Picker>
                  </div>
                </FormGroup>

                <FormGroup className="col-md-3">
                  <Label>{i18n.t("static.program.program")}</Label>
                  <div className="controls">
                    <InputGroup>
                      <Input type="select" name="programId" id="programId" bsSize="sm"
                        onChange={e => this.setProgramId(e)} value={this.state.programId}>
                        <option value="0">{i18n.t("static.common.select")}</option>
                        {programOptions}
                      </Input>
                    </InputGroup>
                  </div>
                </FormGroup>

                <FormGroup className="col-md-3">
                  <Label>{i18n.t("static.report.versionFinal*")}</Label>
                  <div className="controls">
                    <InputGroup>
                      <Input type="select" name="versionId" id="versionId" bsSize="sm"
                        onChange={e => this.setVersionId(e)} value={this.state.versionId}>
                        <option value="0">{i18n.t("static.common.select")}</option>
                        {versionOptions}
                      </Input>
                    </InputGroup>
                  </div>
                </FormGroup>

                <FormGroup className="col-md-3">
                  <Label>{i18n.t("static.planningunit.planningunit")}</Label>
                  <span className="reportdown-box-icon fa fa-sort-desc ml-1"></span>
                  <div onBlur={this.handleBlur}><MultiSelect name="planningUnitId" id="planningUnitId"
                    filterOptions={filterOptions} bsSize="md"
                    value={this.state.planningUnitValues}
                    onChange={e => this.handlePlanningUnitChange(e)}
                    options={planningUnitList} disabled={this.state.loading}
                    overrideStrings={{
                      allItemsAreSelected: i18n.t("static.common.allitemsselected"),
                      selectSomeItems: i18n.t("static.common.select"),
                    }} /></div>
                </FormGroup>
              </div>

              {/* ── Filter row 2 ── */}
              <div className="row">
                <FormGroup className="col-md-3">
                  <Label>{i18n.t("static.report.withinstock")}</Label>
                  <div onBlur={this.handleBlur}><MultiSelect name="stockStatusId" id="stockStatusId" bsSize="sm"
                    value={this.state.stockStatusValues}
                    onChange={e => this.setState({ stockStatusValues: e, stockStatusLabels: e.map(x => x.label) })}
                    options={legendcolor.map(item => ({ label: item.text, value: item.value }))}
                    overrideStrings={{
                      allItemsAreSelected: i18n.t("static.common.allitemsselected"),
                      selectSomeItems: i18n.t("static.common.select"),
                    }} /></div>
                </FormGroup>

                <FormGroup className="col-md-3">
                  <div className="controls form-check">
                    <Input className="form-check-input" type="checkbox" id="removePlannedShipments"
                      checked={this.state.removePlannedShipments}
                      onChange={e => this.setState({ removePlannedShipments: e.target.checked }, () => this.filterData())} />
                    <Label className="form-check-label" htmlFor="removePlannedShipments">
                      {i18n.t("static.report.removePlannedShipments")}
                    </Label>
                  </div>
                  <div className="controls form-check mt-1">
                    <Input className="form-check-input" type="checkbox" id="removeTBDFundingSourceShipments"
                      checked={this.state.removeTBDFundingSourceShipments}
                      onChange={e => this.setState({ removeTBDFundingSourceShipments: e.target.checked }, () => this.filterData())} />
                    <Label className="form-check-label" htmlFor="removeTBDFundingSourceShipments">
                      {i18n.t("static.report.removeTBDFundingSourceShipments")}
                    </Label>
                  </div>
                </FormGroup>

                <FormGroup className="col-md-3">
                  <div className="controls form-check">
                    <Input className="form-check-input" type="checkbox" id="showQuantity"
                      checked={this.state.showQuantity}
                      onChange={e => this.setState({ showQuantity: e.target.checked }, () => {
                        this.buildMatrixJExcel();
                        if (this.state.showDetailData) this.buildDetailJExcel();
                      })} />
                    <Label className="form-check-label" htmlFor="showQuantity">
                      {i18n.t("static.report.showQuantity")}
                    </Label>
                  </div>
                  <div className="controls form-check mt-1">
                    <Input className="form-check-input" type="checkbox" id="showIcon"
                      checked={this.state.showIcon}
                      onChange={e => this.setState({ showIcon: e.target.checked }, () => this.buildMatrixJExcel())} />
                    <Label className="form-check-label" htmlFor="showIcon">
                      {i18n.t("static.report.showIcon")}
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
                            <span className="legendcolor" style={{ backgroundColor: item.color }}></span>
                            <span className="legendcommitversionText">{item.text}</span>
                          </li>
                        ))}
                        <li>
                          <span className="fa fa-truck legendcolor" style={{ color: '#ba0c2f' }}></span>
                          <span className="legendcommitversionText">{i18n.t("static.shipment.shipment")}</span>
                        </li>
                        <li>
                          <span className="fa fa-exclamation-triangle legendcolor" style={{ color: '#ED8944' }}></span>
                          <span className="legendcommitversionText">{i18n.t("static.supplyplan.exipredStock")}</span>
                        </li>
                        <li>
                          <span className="legendcommitversionText"><b>{i18n.t("static.supplyPlan.actualBalance")}</b></span>
                        </li>
                      </ul>
                    </FormGroup>

                    <div className="ReportSearchMarginTop TableWidth100">
                      <div className="jexcelremoveReadonlybackground TableWidth100" id="stockMatrixTableDiv" />
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
                              <span className="legendcommitversionText" style={{ color: "rgb(170, 85, 161)" }}>
                                <i>{i18n.t("static.supplyPlan.forecastedConsumption")}</i>
                              </span>
                            </li>
                            <li>
                              <span className="blacklegend legendcolor"></span>
                              <span className="legendcommitversionText">{i18n.t("static.supplyPlan.actualConsumption")}</span>
                            </li>
                            <li>
                              <span className="legendcolor"></span>
                              <span className="legendcommitversionText"><b>{i18n.t("static.supplyPlan.actualBalance")}</b></span>
                            </li>
                          </ul>
                        </FormGroup>
                        <div className="consumptionDataEntryTable ReportSearchMarginTop TableWidth100">
                          <div className="jexcelremoveReadonlybackground TableWidth100" id="stockDetailTableDiv" />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {!hasData && !this.state.loading && this.state.planningUnitValues.length > 0 && (
                  <h5 className="red mt-3">{i18n.t("static.shipmentDetails.noData")}</h5>
                )}
              </div>

              {/* ── Loading spinner ── */}
              <div style={{ display: this.state.loading ? "block" : "none" }}>
                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }}>
                  <div className="align-items-center">
                    <h4><strong>{i18n.t("static.common.loading")}</strong></h4>
                    <div className="spinner-border blue ml-4" role="status"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
}