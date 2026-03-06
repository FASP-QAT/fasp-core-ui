import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import CryptoJS from "crypto-js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from "jspreadsheet";
import {
  jExcelLoadedFunctionWithoutPagination,
  onOpenFilter,
} from "../../CommonComponent/JExcelCommonFunctions.js";
import moment from "moment";
import React, { Component } from "react";
import { HorizontalBar, Pie } from "react-chartjs-2";
import Chart from "chart.js";
import Picker from "react-month-picker";
import { MultiSelect } from "react-multi-select-component";
import {
  Card,
  CardBody,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  Label,
} from "reactstrap";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import "../../scss/shipmentsByCountry.scss";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from "../../CommonComponent/Logo.js";
import MonthBox from "../../CommonComponent/MonthBox.js";
import getLabelText from "../../CommonComponent/getLabelText";
import {
  API_URL,
  INDEXED_DB_NAME,
  INDEXED_DB_VERSION,
  JEXCEL_PRO_KEY,
  MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS,
  REPORT_DATEPICKER_END_MONTH,
  REPORT_DATEPICKER_START_MONTH,
  SECRET_KEY,
} from "../../Constants.js";
import DropdownService from "../../api/DropdownService";
import FundingSourceService from "../../api/FundingSourceService";
import ReportService from "../../api/ReportService";
import ShipmentStatusService from "../../api/ShipmentStatusService";
import csvicon from "../../assets/img/csv.png";
import pdfIcon from "../../assets/img/pdf.png";
import i18n from "../../i18n";
import AuthenticationService from "../Common/AuthenticationService.js";
import AuthenticationServiceComponent from "../Common/AuthenticationServiceComponent";
import {
  addDoubleQuoteToRowContent,
  filterOptions,
  makeText,
  roundARU,
} from "../../CommonComponent/JavascriptCommonFunctions";

const ref = React.createRef();

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

/**
 * Component for Shipment Global Demand View Report.
 * Table section has been converted from a plain HTML <Table> to a
 * jspreadsheet (v8) instance with nested FSPA → Program → PU rows.
 */
class ShipmentGlobalDemandView extends Component {
  constructor(props) {
    super(props);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    this.state = {
      labels: ["PSM", "GF", "Local", "Govt"],
      datasets: [
        {
          data: [5615266, 13824000, 0, 26849952],
          backgroundColor: ["#4dbd74", "#f86c6b", "#8aa9e6", "#EDB944"],
          legend: { position: "bottom" },
        },
      ],
      isDarkMode: false,
      dropdownOpen: false,
      radioSelected: 2,
      lang: localStorage.getItem("lang"),
      countrys: [],
      versions: [],
      planningUnits: [],
      consumptions: [],
      productCategories: [],
      planningUnitValues: [],
      planningUnitLabels: [],
      fundingSourceValues: [],
      fundingSourceLabels: [],
      shipmentStatusValues: [],
      shipmentStatusLabels: [],
      programValues: [],
      shipmentStatuses: [],
      fundingSources: [],
      fundingSourcesOriginal: [],
      programLabels: [],
      programs: [],
      countryValues: [],
      countryLabels: [],
      realmList: [],
      fundingSourceSplit: [],
      planningUnitSplit: [],
      procurementAgentSplit: [],
      table1Headers: [],
      show: false,
      message: "",
      rangeValue: {
        from: { year: dt.getFullYear(), month: dt.getMonth() + 1 },
        to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 },
      },
      minDate: {
        year: new Date().getFullYear() - 10,
        month: new Date().getMonth() + 1,
      },
      maxDate: {
        year:
          new Date().getFullYear() +
          MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS,
        month: new Date().getMonth() + 1,
      },
      loading: true,
      programLst: [],
      procurementAgentTypeId: false,
      fundingSourceTypes: [],
      fundingSourceTypeValues: [],
      fundingSourceTypeLabels: [],
      groupByFundingSourceType: false,
      groupBy: 1,
      procurementAgentValues: [],
      procurementAgentLabels: [],
      procurementAgents: [],
      viewById: 1,
      data: {
        planningUnitQuantity: [],
        fspaCostAndPerc: [],
        fspaProgramSplit: [],
        fspaCountrySplit: [],
      },
      aggregateByCountry: false,
      hideCalculations: false,
      collapsePlanningUnits: false,
      collapseAll: false,
      collapsedRows: new Set(),
      sortConfig: { col: null, dir: "asc" }, // tracks active column sort
    };
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.getPrograms = this.getPrograms.bind(this);
    this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getFundingSourceType = this.getFundingSourceType.bind(this);
    this.setViewById = this.setViewById.bind(this);
    this.setVersionId = this.setVersionId.bind(this);
    this.getProcurementAgentList = this.getProcurementAgentList.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.buildJExcel = this.buildJExcel.bind(this);
    this.tableDiv = React.createRef();
    this.el = null;
  }
  handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      this.fetchData();
    }
  };

  handleBlurCountry = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      this.getPrograms();
      this.fetchData();
    }
  };

  handleBlurProgram = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      this.filterVersion();
      this.getFundingSource();
      this.fetchData();
      this.getPlanningUnit();
      this.getProcurementAgentList();
    }
  };

  handleCheckboxChange(e) {
    const { name, checked } = e.target;
    const extra =
      name === "collapseAll" && !checked ? { collapsedRows: new Set() } : {};
    this.setState({ [name]: checked, ...extra }, () => {
      this.buildJExcel();
    });
  }

  // ------------------------------------------------------------------
  // toggleCollapse – same as original, but rebuilds the table
  // ------------------------------------------------------------------
  toggleCollapse(key) {
    let newCollapsedRows = new Set(this.state.collapsedRows);

    // If collapseAll is active and user clicks an FSPA toggle,
    // turn off collapseAll and seed collapsedRows with all OTHER fspa keys
    // so only the clicked one expands.
    if (this.state.collapseAll && key.startsWith("fspa_")) {
      const dataSource = this.state.aggregateByCountry
        ? this.state.data.fspaCountrySplit
        : this.state.data.fspaProgramSplit;

      // Collect all unique fspa keys
      const allFspaKeys = new Set();
      if (dataSource) {
        dataSource.forEach((d) => {
          allFspaKeys.add(`fspa_${d.fspa.code}`);
        });
      }

      // Seed collapsedRows with all fspa keys EXCEPT the one being toggled
      allFspaKeys.forEach((k) => {
        if (k !== key) newCollapsedRows.add(k);
      });

      this.setState(
        { collapseAll: false, collapsedRows: newCollapsedRows },
        () => {
          this.buildJExcel();
        }
      );
      return;
    }

    // Normal toggle
    if (newCollapsedRows.has(key)) {
      newCollapsedRows.delete(key);
    } else {
      newCollapsedRows.add(key);
    }
    this.setState({ collapsedRows: newCollapsedRows }, () => {
      this.buildJExcel();
    });
  }

  setViewById(e) {
    this.setState({ viewById: e.target.value }, () => {
      this.fetchData();
    });
  }

  // ------------------------------------------------------------------
  // buildJExcel – builds / rebuilds the jspreadsheet table.
  //
  // Changes vs previous version:
  //  • rowHeaders: false          → no row-number column
  //  • accordion column title: '' → truly blank (no sort/filter icon on it)
  //  • + / - icons               → styled <button> elements (not arrow chars)
  //  • indentation               → applied via paddingLeft on TD cells in onload
  //                                (no leading spaces in the cell value)
  //  • sorting / filter / search → enabled on data columns only;
  //                                accordion col and label col have these
  //                                disabled so the hierarchy is not disrupted
  //  • search box                → rendered above the table via jspreadsheet
  //                                built-in search:true option
  // ------------------------------------------------------------------
  buildJExcel() {
    // ── Save scroll position so sorting / rebuild doesn't jump to top ──
    // const scrollContainer = document.querySelector(".globalviwe-scroll") ||
    //   document.querySelector(".app-body") ||
    //   document.documentElement;
    // const savedScrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
    // const savedWindowScrollY = window.scrollY;

    // Destroy any previous instance
    if (this.tableDiv && this.tableDiv.current) {
      try {
        jexcel.destroy(this.tableDiv.current, true);
      } catch (_) {
        /* ignore if nothing to destroy */
      }
    }

    const dataSource = this.state.aggregateByCountry
      ? this.state.data.fspaCountrySplit
      : this.state.data.fspaProgramSplit;

    if (!dataSource || dataSource.length === 0) return;

    // ---------------------------------------------------------------
    // 1. Build grouping hierarchy (unchanged logic)
    // ---------------------------------------------------------------
    let grouping = {};
    let grandTotalCost = 0;
    let grandPUCost = 0;
    let grandFreightCost = 0;

    dataSource.forEach((d) => {
      const fspaCode = d.fspa.code;
      const programCode = d.programCountry ? (this.state.aggregateByCountry?getLabelText(d.programCountry.label,this.state.lang):d.programCountry.code) : "N/A";

      if (!grouping[fspaCode]) {
        grouping[fspaCode] = {
          code: fspaCode,
          label: d.fspa.label,
          programs: {},
          totalPuCost: 0,
          totalFreightCost: 0,
          totalCost: 0,
        };
      }
      if (!grouping[fspaCode].programs[programCode]) {
        grouping[fspaCode].programs[programCode] = {
          code: programCode,
          label: d.programCountry ? d.programCountry.label : "N/A",
          pus: [],
          totalPuCost: 0,
          totalFreightCost: 0,
          totalCost: 0,
        };
      }

      const puLabel = getLabelText(d.planningUnit.label, this.state.lang);
      const puDisplay = `${puLabel} | ${d.planningUnit.id}`;

      grouping[fspaCode].programs[programCode].pus.push({
        id: d.planningUnit.id,
        display: puDisplay,
        quantity: d.quantity,
        totalPuCost: d.cost,
        totalFreightCost: d.freightCost,
        totalCost: d.totalCost,
      });

      grouping[fspaCode].programs[programCode].totalPuCost += d.cost;
      grouping[fspaCode].programs[programCode].totalFreightCost +=
        d.freightCost;
      grouping[fspaCode].programs[programCode].totalCost += d.totalCost;
      grouping[fspaCode].totalPuCost += d.cost;
      grouping[fspaCode].totalFreightCost += d.freightCost;
      grouping[fspaCode].totalCost += d.totalCost;
      grandPUCost += d.cost;
      grandFreightCost += d.freightCost;
      grandTotalCost += d.totalCost;
    });

    let fspasList = Object.values(grouping).sort((a, b) =>
      a.code.toString().toUpperCase() > b.code.toString().toUpperCase() ? 1 : -1
    );
    fspasList.forEach((f) => {
      f.programsList = Object.values(f.programs).sort((a, b) =>
        a.code.toString().toUpperCase() > b.code.toString().toUpperCase()
          ? 1
          : -1
      );
      f.programsList.forEach((p) => {
        p.pus.sort((a, b) =>
          a.display.toString().toUpperCase() >
            b.display.toString().toUpperCase()
            ? 1
            : -1
        );
      });
    });

    // ---------------------------------------------------------------
    // 2. Formatters
    // ---------------------------------------------------------------
    const formatCurr = (val) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    const formatNum = (val) =>
      val ? new Intl.NumberFormat("en-US").format(val) : 0;
    const formatPerc = (val) => (val * 100).toFixed(1) + "%";

    const isSingleProgram = this.state.programValues.length === 1;
    const showQtyCol =
      !this.state.collapsePlanningUnits && !this.state.collapseAll;

    // ---------------------------------------------------------------
    // 3. + / - icon HTML builder
    //    Uses a real <button> so it is visually distinct and accessible.
    //    The data-key attribute drives toggleCollapse().
    // ---------------------------------------------------------------
    const makeToggleBtn = (collapseKey, isCollapsed) =>
      `<i class="jss-accordion-btn fa ${isCollapsed ? "fa-plus-square-o" : "fa-minus-square-o"
      } supplyPlanIcon" data-key="${collapseKey}" style="cursor:pointer;font-size:16px;"></i>`;

    // ---------------------------------------------------------------
    // 4. Row metadata
    //    Each logical row carries extra fields so the onload callback
    //    can apply correct indentation and styling without re-parsing
    //    the cell text.
    //
    //    indentPx: pixels of left padding on the label (col 1) TD
    //              fspa=0, program=20, pu under fspa=20, pu under prog=40
    // ---------------------------------------------------------------

    // rows array entries: { data: [...], rowType, indentPx }
    const rows = [];

    // ---------------------------------------------------------------
    // Sort helpers – must be defined before fspasList.forEach so they
    // are in scope when sortedPus() is called while building rows.
    // ---------------------------------------------------------------
    const { col: sortColIdx, dir: sortDir } = this.state.sortConfig;

    const getSortVal = (pu, colIdx) => {
      if (colIdx === null || colIdx <= 0)
        return (pu.display || "").toUpperCase();
      if (colIdx === 1) return (pu.display || "").toUpperCase();
      let offset = colIdx - 2;
      if (showQtyCol) {
        if (offset === 0) return pu.quantity || 0;
        offset--;
      }
      if (!this.state.hideCalculations) {
        if (offset === 0) return pu.totalPuCost || 0;
        if (offset === 1) return pu.totalFreightCost || 0;
        offset -= 2;
      }
      if (offset === 0) return pu.totalCost || 0;
      if (offset === 1) return pu.totalCost || 0; // % col – same order as totalCost
      return (pu.display || "").toUpperCase();
    };

    const sortedPus = (pus) => {
      if (sortColIdx === null) return pus;
      return [...pus].sort((a, b) => {
        const av = getSortVal(a, sortColIdx);
        const bv = getSortVal(b, sortColIdx);
        const cmp =
          typeof av === "string" ? (av < bv ? -1 : av > bv ? 1 : 0) : av - bv;
        return sortDir === "desc" ? -cmp : cmp;
      });
    };

    const pushRow = (
      expandHtml,
      labelText,
      qty,
      puCost,
      freightCost,
      totalCost,
      perc,
      rowType,
      collapseKey,
      fspaCode,
      progCode,
      indentPx
    ) => {
      const row = [expandHtml, labelText];
      if (showQtyCol) {
        // For header rows (fspa / program), show "-" instead of a grey cell
        const isHeaderRow = rowType === "fspa" || rowType === "program";
        row.push(
          isHeaderRow
            ? "-"
            : qty !== undefined && qty !== null
              ? formatNum(qty)
              : ""
        );
      }
      if (!this.state.hideCalculations) {
        row.push(
          puCost !== "" && puCost !== undefined ? formatCurr(puCost) : ""
        );
        row.push(
          freightCost !== "" && freightCost !== undefined
            ? formatCurr(freightCost)
            : ""
        );
      }
      row.push(
        totalCost !== "" && totalCost !== undefined ? formatCurr(totalCost) : ""
      );
      row.push(perc);
      // hidden meta columns
      row.push(rowType);
      row.push(collapseKey || "");
      row.push(fspaCode || "");
      row.push(progCode || "");
      rows.push({ data: row, rowType, indentPx: indentPx || 0 });
    };

    fspasList.forEach((fspa) => {
      const isFspaCollapsed =
        this.state.collapseAll ||
        this.state.collapsedRows.has(`fspa_${fspa.code}`);

      pushRow(
        makeToggleBtn(`fspa_${fspa.code}`, isFspaCollapsed),
        fspa.code,
        undefined,
        fspa.totalPuCost,
        fspa.totalFreightCost,
        fspa.totalCost,
        grandTotalCost > 0 ? formatPerc(fspa.totalCost / grandTotalCost) : "0%",
        "fspa",
        `fspa_${fspa.code}`,
        fspa.code,
        "",
        0 // indent: 0 px – top-level FSPA
      );

      if (!isFspaCollapsed) {
        if (isSingleProgram) {
          // Single-program mode: PUs appear directly under FSPA
          if (!this.state.collapsePlanningUnits) {
            fspa.programsList.forEach((prog) => {
              sortedPus(prog.pus).forEach((pu) => {
                pushRow(
                  "",
                  pu.display,
                  pu.quantity,
                  pu.totalPuCost,
                  pu.totalFreightCost,
                  pu.totalCost,
                  fspa.totalCost > 0
                    ? formatPerc(pu.totalCost / fspa.totalCost)
                    : "0%",
                  "pu",
                  "",
                  fspa.code,
                  prog.code,
                  20 // indent: 20 px – one level under FSPA
                );
              });
            });
          }
        } else {
          // Multi-program mode: Program rows then PU rows
          fspa.programsList.forEach((prog) => {
            const progKey = `prog_${fspa.code}_${prog.code}`;
            const isProgCollapsed = this.state.collapsedRows.has(progKey);

            pushRow(
              makeToggleBtn(progKey, isProgCollapsed),
              prog.code,
              undefined,
              prog.totalPuCost,
              prog.totalFreightCost,
              prog.totalCost,
              fspa.totalCost > 0
                ? formatPerc(prog.totalCost / fspa.totalCost)
                : "0%",
              "program",
              progKey,
              fspa.code,
              prog.code,
              20 // indent: 20 px – one level under FSPA
            );

            if (!isProgCollapsed && !this.state.collapsePlanningUnits) {
              sortedPus(prog.pus).forEach((pu) => {
                pushRow(
                  "",
                  pu.display,
                  pu.quantity,
                  pu.totalPuCost,
                  pu.totalFreightCost,
                  pu.totalCost,
                  prog.totalCost > 0
                    ? formatPerc(pu.totalCost / prog.totalCost)
                    : "0%",
                  "pu",
                  "",
                  fspa.code,
                  prog.code,
                  40 // indent: 40 px – two levels under FSPA
                );
              });
            }
          });
        }
      }
    });

    // Grand total row (no indent, no toggle button)
    const totalRowData = ["", i18n.t("static.supplyPlan.total")];
    if (showQtyCol) totalRowData.push("");
    if (!this.state.hideCalculations) {
      totalRowData.push(formatCurr(grandPUCost));
      totalRowData.push(formatCurr(grandFreightCost));
    }
    totalRowData.push(formatCurr(grandTotalCost));
    totalRowData.push("");
    // meta
    totalRowData.push("total");
    totalRowData.push("");
    totalRowData.push("");
    totalRowData.push("");
    rows.push({ data: totalRowData, rowType: "total", indentPx: 0 });

    // ---------------------------------------------------------------
    // 5. Column definitions
    //
    //    • Accordion column (col 0): type html, no sort, no filter,
    //      blank title, narrow width.
    //    • Label column (col 1): text, sort enabled, filter enabled
    //      (so the user can search by label).
    //    • Data columns (qty, costs, %): text, sort + filter enabled.
    //    • Hidden meta columns: type hidden (never shown).
    //
    //    NOTE: jspreadsheet v8 controls per-column sort/filter via
    //    the `sort` and `filter` column properties.
    // ---------------------------------------------------------------
    const fspaOrPAHeader =
      this.state.viewById == 1
        ? i18n.t("static.fundingSourceHead.fundingSource")
        : i18n.t("static.report.procurementAgentName");

    const progHeader = this.state.aggregateByCountry
      ? i18n.t("static.dashboard.country")
      : i18n.t("static.program.program");

    let labelColHeader = fspaOrPAHeader;
    if (!isSingleProgram) labelColHeader += ` / ${progHeader}`;
    if (showQtyCol)
      labelColHeader += ` / ${i18n.t("static.dashboard.planningunitheader")}`;

    // ── Dynamic label column width ──────────────────────────────────────
    // collapseAll      → only short FSPA/PA codes visible       → narrow
    // collapsePlanUnits→ FSPA + Program/Country rows visible     → medium
    // neither          → full Planning Unit names visible         → wide
    const labelColWidth =
      this.state.collapseAll ||
        (this.state.collapsePlanningUnits && this.state.programValues.length == 1)
        ? 120
        : this.state.collapsePlanningUnits
          ? 180
          : 300;

    const columns = [
      // [0] accordion / toggle column – NO sort, NO filter, blank title
      {
        title: " ", // using a space instead of empty string avoids jspreadsheet rendering "A"
        type: "html",
        width: 38,
        readOnly: true,
        sort: false, // disable sort arrow on this column
        filter: false, // disable filter dropdown on this column
      },
      // [1] label column – width adapts to what rows are visible
      {
        title: labelColHeader,
        type: "text",
        width: labelColWidth,
        readOnly: true,
        sort: true,
        filter: true,
      },
    ];

    if (showQtyCol) {
      columns.push({
        title: `${i18n.t(
          "static.shipment.qty"
        )} <i class="fa fa-info-circle icons ToltipInfoicon" title="${i18n.t(
          "static.tooltip.qtyMayRepresentMultipleShipments"
        )}"></i>`,
        type: "numeric",
        mask: "#,##0",
        width: 120,
        readOnly: true,
        sort: true,
        filter: true,
        align: "right",
      });
    }
    if (!this.state.hideCalculations) {
      columns.push({
        title: `${i18n.t(
          "static.shipment.totalPUCost"
        )} <i class="fa fa-info-circle icons ToltipInfoicon" title="${i18n.t(
          "static.tooltip.totalPlanningUnitCost"
        )}"></i>`,
        type: "numeric",
        mask: "$#,##0.00",
        width: 140,
        readOnly: true,
        sort: true,
        filter: true,
        align: "right",
      });
      columns.push({
        title: `${i18n.t(
          "static.shipment.totalFreightCost"
        )} <i class="fa fa-info-circle icons ToltipInfoicon" title="${i18n.t(
          "static.tooltip.totalFreightCost"
        )}"></i>`,
        type: "numeric",
        mask: "$#,##0.00",
        width: 140,
        readOnly: true,
        sort: true,
        filter: true,
        align: "right",
      });
    }
    columns.push({
      title: `${i18n.t(
        "static.shipment.totalCost"
      )} <i class="fa fa-info-circle icons ToltipInfoicon" title="${i18n.t(
        "static.tooltip.totalCostGlobalDemand"
      )}"></i>`,
      type: "numeric",
      mask: "$#,##0.00",
      width: 140,
      readOnly: true,
      sort: true,
      filter: true,
      align: "right",
    });
    columns.push({
      title: `${i18n.t(
        "static.shipment.totalCostPerc"
      )} <i class="fa fa-info-circle icons ToltipInfoicon" title="${i18n.t(
        "static.tooltip.totalCostPercGlobalDemand"
      )}"></i>`,
      type: "numeric",
      mask: "0.00%",
      width: 110,
      readOnly: true,
      sort: true,
      filter: true,
      align: "right",
    });
    // Hidden meta columns – these are never visible
    columns.push({ title: "_rowType", type: "hidden" });
    columns.push({ title: "_collapseKey", type: "hidden" });
    columns.push({ title: "_fspaCode", type: "hidden" });
    columns.push({ title: "_progCode", type: "hidden" });

    // ---------------------------------------------------------------
    // 6. Index of first "data" column (after accordion + label).
    //    Used in onload to right-align numeric cells.
    // ---------------------------------------------------------------
    const FIRST_DATA_COL = 3; // qty / puCost / freightCost / totalCost / %

    // ---------------------------------------------------------------
    // 7. jspreadsheet instance options
    // ---------------------------------------------------------------
    const self = this;

    const options = {
      data: rows.map((r) => r.data),
      columns,
      editable: false,
      rowHeaders: false, // ← REMOVE row-number column
      allowInsertRow: false,
      allowDeleteRow: false,
      allowInsertColumn: false,
      allowDeleteColumn: false,
      columnDrag: false,
      columnSorting: true, // ← sort arrows still show; actual sort done via onsort rebuild
      search: true, // ← use jspreadsheet's native fast search,
      onbeforesearch: function (worksheet, term) {
        const tbody = worksheet.tbody;
        if (!tbody) return false;
      
        const trs = tbody.querySelectorAll("tr");
        const rowsMeta = self._rowsMeta || [];
        const lowerTerm = (term || "")
          .toLowerCase()
          .trim()
          .replace(/[$,]/g, "");
      
        const displayValues = new Array(rowsMeta.length);
        const metaColCount = 4;
      
        if (!lowerTerm) {
          // No search term — show everything
          for (let i = 0; i < rowsMeta.length; i++) {
            displayValues[i] = "";
          }
        } else {
          // ── Pass 1: find which rows match directly ────────────────────────
          // Matching a parent row (fspa/program) shows ONLY that row itself,
          // not its children. Children only appear if they match directly.
          const visibleFspas = new Set();
          const visibleProgs = new Set(); // "fspaCode|||progCode"
      
          for (let i = 0; i < rowsMeta.length; i++) {
            const rt = rowsMeta[i].rowType;
            const visibleColCount = rowsMeta[i].data.length - metaColCount;
            const fspaCode = rowsMeta[i].data[rowsMeta[i].data.length - 2] || "";
            const progCode = rowsMeta[i].data[rowsMeta[i].data.length - 1] || "";
      
            let matched = false;
            for (let j = 1; j < visibleColCount; j++) {
              const cellVal = (rowsMeta[i].data[j] || "")
                .toString()
                .toLowerCase()
                .replace(/[$,]/g, "");
              if (cellVal.includes(lowerTerm)) {
                matched = true;
                break;
              }
            }
      
            // Set display for pu and total rows directly
            if (rt === "pu" || rt === "total") {
              displayValues[i] = matched ? "" : "none";
            }
      
            if (matched) {
              if (rt === "fspa") {
                // FSPA matched — show it, but do NOT add to visibleProgs
                // so its child programs and PUs stay hidden
                visibleFspas.add(fspaCode);
              } else if (rt === "program") {
                // Program matched — show it and its parent fspa,
                // but do NOT cascade down to PU children
                visibleFspas.add(fspaCode);
                visibleProgs.add(fspaCode + "|||" + progCode);
              } else if (rt === "pu") {
                // PU matched — bubble up to show parent program and fspa
                visibleFspas.add(fspaCode);
                visibleProgs.add(fspaCode + "|||" + progCode);
              }
              // total row: already set displayValues[i] = "" above
            }
          }
      
          // ── Pass 2: resolve fspa and program row visibility ───────────────
          for (let i = 0; i < rowsMeta.length; i++) {
            const rt = rowsMeta[i].rowType;
            if (rt === "pu" || rt === "total") continue;
      
            const fspaCode = rowsMeta[i].data[rowsMeta[i].data.length - 2] || "";
            const progCode = rowsMeta[i].data[rowsMeta[i].data.length - 1] || "";
      
            if (rt === "fspa") {
              displayValues[i] = visibleFspas.has(fspaCode) ? "" : "none";
            } else if (rt === "program") {
              displayValues[i] = visibleProgs.has(fspaCode + "|||" + progCode)
                ? ""
                : "none";
            }
          }
        }
      
        // ── Batch all DOM writes in one rAF ───────────────────────────
        requestAnimationFrame(() => {
          for (let i = 0; i < rowsMeta.length; i++) {
            const tr = trs[i];
            if (tr && tr.style.display !== displayValues[i]) {
              tr.style.display = displayValues[i];
            }
          }
        });
      
        return false;
      },
      
      onbeforefilter: function (worksheet, filters, filteredRows) {
        const tbody = worksheet.tbody;
        if (!tbody) return false;
      
        const trs = tbody.querySelectorAll("tr");
        const rowsMeta = self._rowsMeta || [];
      
        // ── If no filters active, show everything ────────────────────
        const hasActiveFilter =
          filters && Object.values(filters).some((f) => f && f.length > 0);
      
        if (!hasActiveFilter) {
          requestAnimationFrame(() => {
            for (let i = 0; i < rowsMeta.length; i++) {
              const tr = trs[i];
              if (tr) tr.style.display = "";
            }
          });
          return false;
        }
      
        const displayValues = new Array(rowsMeta.length);
        const metaColCount = 4;
      
        // ── Pass 1: determine which rows pass ALL active filters ─────
        // Matching a parent row (fspa/program) shows ONLY that row itself,
        // not its children. Children only appear if they match directly.
        const visibleFspas = new Set();
        const visibleProgs = new Set();
      
        for (let i = 0; i < rowsMeta.length; i++) {
          const rt = rowsMeta[i].rowType;
          const visibleColCount = rowsMeta[i].data.length - metaColCount;
          const fspaCode = rowsMeta[i].data[rowsMeta[i].data.length - 2] || "";
          const progCode = rowsMeta[i].data[rowsMeta[i].data.length - 1] || "";
      
          let matched = true;
      
          // Check every active filter column
          for (const [colIdx, filterValues] of Object.entries(filters)) {
            const col = parseInt(colIdx);
            if (!filterValues || filterValues.length === 0) continue;
            if (col >= visibleColCount) continue;
      
            const cellVal = (rowsMeta[i].data[col] || "")
              .toString()
              .toLowerCase()
              .replace(/[$,]/g, "")
              .trim();
      
            const filterMatch = filterValues.some((fv) => {
              const fvStr = (fv || "")
                .toString()
                .toLowerCase()
                .replace(/[$,]/g, "")
                .trim();
              return cellVal === fvStr || cellVal.includes(fvStr);
            });
      
            if (!filterMatch) {
              matched = false;
              break;
            }
          }
      
          // Set display for pu and total rows directly
          if (rt === "pu" || rt === "total") {
            displayValues[i] = matched ? "" : "none";
          }
      
          if (matched) {
            if (rt === "fspa") {
              // FSPA matched — show it, but do NOT cascade to child programs/PUs
              visibleFspas.add(fspaCode);
            } else if (rt === "program") {
              // Program matched — show it and its parent fspa,
              // but do NOT cascade down to PU children
              visibleFspas.add(fspaCode);
              visibleProgs.add(fspaCode + "|||" + progCode);
            } else if (rt === "pu") {
              // PU matched — bubble up to show parent program and fspa
              visibleFspas.add(fspaCode);
              visibleProgs.add(fspaCode + "|||" + progCode);
            }
            // total row: already set displayValues[i] = "" above
          }
        }
      
        // ── Pass 2: resolve fspa and program row visibility ───────────
        for (let i = 0; i < rowsMeta.length; i++) {
          const rt = rowsMeta[i].rowType;
          if (rt === "pu" || rt === "total") continue;
      
          const fspaCode = rowsMeta[i].data[rowsMeta[i].data.length - 2] || "";
          const progCode = rowsMeta[i].data[rowsMeta[i].data.length - 1] || "";
      
          if (rt === "fspa") {
            displayValues[i] = visibleFspas.has(fspaCode) ? "" : "none";
          } else if (rt === "program") {
            displayValues[i] = visibleProgs.has(fspaCode + "|||" + progCode)
              ? ""
              : "none";
          }
        }
      
        // ── Batch all DOM writes in one rAF ──────────────────────────
        requestAnimationFrame(() => {
          for (let i = 0; i < rowsMeta.length; i++) {
            const tr = trs[i];
            if (tr && tr.style.display !== displayValues[i]) {
              tr.style.display = displayValues[i];
            }
          }
        });
      
        return false;
      },
      filters: true, // ← enable column filter dropdowns
      pagination: false,
      allowRenameColumn: false,
      license: JEXCEL_PRO_KEY,
      contextMenu: () => false,
      onopenfilter: onOpenFilter,

      // -----------------------------------------------------------
      // onsort – fires AFTER jspreadsheet completes its native flat sort.
      // We rebuild immediately with our group-aware sort so FSPA, Program,
      // and Total rows are never moved; only PU rows are reordered.
      // -----------------------------------------------------------
      onsort: function (worksheet, column, order) {
        const currentDir = self.state.sortConfig?.col === column 
            ? self.state.sortConfig.dir 
            : "desc";
        const dir = currentDir === "asc" ? "desc" : "asc";
        
        self.setState({ sortConfig: { col: column, dir } }, () =>
            self.buildJExcel()
        );
    },

      // -----------------------------------------------------------
      // onsearch – fires AFTER jspreadsheet has hidden non-matching rows.
      // We re-show any fspa/program/total rows whose children are visible.
      // -----------------------------------------------------------
      onsearch: function (worksheet, terms) {
        if (!terms || (typeof terms === "string" && terms.trim() === ""))
          return;
        const tbody = worksheet.tbody;
        if (!tbody) return;
        const colLen = columns.length;

        // First pass: collect which fspa/prog codes have at least one visible PU
        const visibleFspas = new Set();
        const visibleProgs = new Set(); // "fspaCode|||progCode"
        let anyPuVisible = false;
        rows.forEach((rowMeta, idx) => {
          if (rowMeta.rowType !== "pu") return;
          const trEl = tbody.children[idx];
          if (!trEl || trEl.style.display === "none") return;
          const fspa = rowMeta.data[colLen - 2] || "";
          const prog = rowMeta.data[colLen - 1] || "";
          visibleFspas.add(fspa);
          visibleProgs.add(fspa + "|||" + prog);
          anyPuVisible = true;
        });

        // Second pass: un-hide parent rows whose children are visible
        rows.forEach((rowMeta, idx) => {
          const t = rowMeta.rowType;
          if (t !== "fspa" && t !== "program" && t !== "total") return;
          const trEl = tbody.children[idx];
          if (!trEl) return;
          const fspa = rowMeta.data[colLen - 2] || "";
          const prog = rowMeta.data[colLen - 1] || "";
          if (
            (t === "fspa" && visibleFspas.has(fspa)) ||
            (t === "program" && visibleProgs.has(fspa + "|||" + prog)) ||
            (t === "total" && anyPuVisible)
          ) {
            trEl.style.display = "";
          }
        });
      },

      // -----------------------------------------------------------
      // onload: apply styles + indentation + click handler
      // -----------------------------------------------------------
      onload: function (instance) {
        jExcelLoadedFunctionWithoutPagination(instance);

        const worksheet = instance.worksheets[0];
        // Store worksheet reference so custom search can call worksheet.search()
        self._worksheet = worksheet;

        const tbody = worksheet.tbody;
        const rowsForOnload = rows;

        rowsForOnload.forEach((rowMeta, rowIdx) => {
          const trEl = tbody.children[rowIdx];
          if (!trEl) return;

          const { rowType, indentPx } = rowMeta;

          // ── Row-level background / font styling ──────────────
          // Zebra pattern – starts with blue on row 0
          const zebraColor = rowIdx % 2 === 0 ? "#e5edf5" : "#ffffff";
          trEl.style.backgroundColor = zebraColor;
          if (
            rowType === "fspa" ||
            rowType === "program" ||
            rowType === "total"
          ) {
            trEl.style.fontWeight = "bold";
          }
          if (rowType === "total") {
            trEl.style.backgroundColor = "#ccc";
          }

          const cells = trEl.querySelectorAll("td");

          cells.forEach((td, cIdx) => {
            // ── Indentation + left-align on the LABEL cell ────
            // DOM order (jspreadsheet renders a hidden row-num td):
            //   cIdx 0 = row-num td  |  cIdx 1 = accordion  |  cIdx 2 = label  |  cIdx 3+ = data
            if (cIdx === 2) {
              td.style.paddingLeft = `${(indentPx || 0) + 6}px`;
              td.style.textAlign = "left";
              td.querySelectorAll("*").forEach((el) => {
                el.style.textAlign = "left";
              });
            }

            // ── Right-align all data columns (td + inner elements) ────
            if (cIdx >= FIRST_DATA_COL) {
              td.style.textAlign = "right";
              td.style.paddingRight = "8px";
              td.querySelectorAll("*").forEach((el) => {
                el.style.textAlign = "right";
              });
            }

            // ── Accordion cell: show pointer cursor over whole td ──
            if (cIdx === 1) {
              const hasIcon = td.querySelector(".jss-accordion-btn");
              if (hasIcon) td.style.cursor = "pointer";
            }

            // ── For header rows qty cell: show "-" dash ──
            // Numeric type renders empty string as "0"; we override the
            // rendered HTML in-place so the stored value stays empty
            // (empty sorts correctly relative to real numbers).
            if (
              showQtyCol &&
              cIdx === FIRST_DATA_COL &&
              (rowType === "fspa" || rowType === "program")
            ) {
              td.style.textAlign = "center";
              td.style.color = "#999";
              // Replace whatever jspreadsheet rendered ("0") with a dash.
              // The <span> is jspreadsheet's inner value node; fall back to
              // directly setting textContent on the td if no span is found.
              const inner = td.querySelector("span.jss_view, span, div");
              if (inner) {
                inner.textContent = "-";
              } else {
                td.textContent = "-";
              }
            }
          });
        });

        // ── Fix column header (thead) alignment ──────────────────
        const thead = worksheet.thead;
        if (thead) {
          const headerRows = thead.querySelectorAll("tr");
          headerRows.forEach((tr) => {
            const ths = tr.querySelectorAll("td, th");
            ths.forEach((th, cIdx) => {
              if (cIdx === 2) {
                // label column header – left align
                th.style.textAlign = "left";
                th.querySelectorAll("*").forEach((el) => {
                  el.style.textAlign = "left";
                });
              } else if (cIdx >= FIRST_DATA_COL) {
                // data column headers – right align
                th.style.textAlign = "right";
                th.querySelectorAll("*").forEach((el) => {
                  el.style.textAlign = "right";
                });
              }
            });
          });
        }

        // ── Delegated click handler – whole accordion cell is clickable ──
        tbody.addEventListener("click", function (e) {
          // 1) Clicked directly on the icon span?
          const btn = e.target.closest(".jss-accordion-btn");
          if (btn) {
            const key = btn.getAttribute("data-key");
            if (key) self.toggleCollapse(key);
            return;
          }
          // 2) Clicked anywhere else inside the accordion td (DOM cIdx 1)?
          const td = e.target.closest("td");
          if (!td) return;
          const tr = td.closest("tr");
          if (!tr) return;
          const allTds = Array.from(tr.querySelectorAll("td"));
          if (allTds.indexOf(td) === 1) {
            // cIdx 1 = accordion column
            const iconSpan = td.querySelector(".jss-accordion-btn");
            if (iconSpan) {
              const key = iconSpan.getAttribute("data-key");
              if (key) self.toggleCollapse(key);
            }
          }
        });

        // ── Prevent scroll jump when clicking a column header to sort ──
        // jspreadsheet resets scroll internally after sort; capture the
        // scroll position on mousedown and restore it at multiple delays
        // to reliably catch both sync and async scroll resets.
        // if (worksheet.thead) {
        //   worksheet.thead.addEventListener("mousedown", function () {
        //     const snapScrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
        //     const snapWindowY = window.scrollY;
        //     const restore = function () {
        //       if (scrollContainer) scrollContainer.scrollTop = snapScrollTop;
        //       window.scrollTo(0, snapWindowY);
        //     };
        //     setTimeout(restore, 0);
        //     setTimeout(restore, 50);
        //     setTimeout(restore, 150);
        //   });
        // }

        // ── Restore scroll position after initial rebuild ──
        // requestAnimationFrame(() => {
        //   if (scrollContainer) scrollContainer.scrollTop = savedScrollTop;
        //   window.scrollTo(0, savedWindowScrollY);
        // });
      },
    };

    // ---------------------------------------------------------------
    // 8. Mount jspreadsheet
    // ---------------------------------------------------------------
    this._rowsMeta = rows;
    if (this.tableDiv && this.tableDiv.current) {
      this.el = jexcel(this.tableDiv.current, options);
    }
  }

  // ------------------------------------------------------------------
  // exportCSV – unchanged from original
  // ------------------------------------------------------------------
  exportCSV() {
    var csvRow = [];
    csvRow.push(
      '"' +
      (
        i18n.t("static.report.dateRange") +
        " : " +
        makeText(this.state.rangeValue.from) +
        " ~ " +
        makeText(this.state.rangeValue.to)
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    [...this.state.countryLabels]
      .sort((a, b) => {
        var A = a.toString().toUpperCase();
        var B = b.toString().toUpperCase();
        return A > B ? 1 : -1;
      })
      .map((ele) =>
        csvRow.push(
          '"' +
          (
            i18n.t("static.dashboard.country") +
            " : " +
            ele.toString()
          ).replaceAll(" ", "%20") +
          '"'
        )
      );
    csvRow.push("");
    [...this.state.programLabels]
      .sort((a, b) => {
        var A = a.toString().toUpperCase();
        var B = b.toString().toUpperCase();
        return A > B ? 1 : -1;
      })
      .map((ele) =>
        csvRow.push(
          '"' +
          (
            i18n.t("static.program.program") +
            " : " +
            ele.toString()
          ).replaceAll(" ", "%20") +
          '"'
        )
      );
    csvRow.push("");
    if (this.state.programValues.length == 1) {
      csvRow.push(
        '"' +
        (
          i18n.t("static.report.version") +
          "  :  " +
          document.getElementById("versionId").selectedOptions[0].text
        ).replaceAll(" ", "%20") +
        '"'
      );
      csvRow.push("");
    }
    [...this.state.planningUnitLabels]
      .sort((a, b) => {
        var A = a.toString().toUpperCase();
        var B = b.toString().toUpperCase();
        return A > B ? 1 : -1;
      })
      .map((ele) =>
        csvRow.push(
          '"' +
          (
            i18n.t("static.planningunit.planningunit") +
            " : " +
            ele.toString()
          )
            .replaceAll("#", "%23")
            .replaceAll(" ", "%20") +
          '"'
        )
      );
    csvRow.push("");
    csvRow.push(
      '"' +
      (
        i18n.t("static.common.display") +
        " : " +
        (this.state.viewById == 1
          ? i18n.t("static.fundingSourceHead.fundingSource")
          : i18n.t("static.report.procurementAgentName"))
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    if (this.state.viewById == 1) {
      [...this.state.fundingSourceLabels]
        .sort((a, b) => {
          var A = a.toString().toUpperCase();
          var B = b.toString().toUpperCase();
          return A > B ? 1 : -1;
        })
        .map((ele) =>
          csvRow.push(
            '"' +
            (
              i18n.t("static.budget.fundingsource") +
              " : " +
              ele.toString()
            ).replaceAll(" ", "%20") +
            '"'
          )
        );
    } else {
      [...this.state.procurementAgentLabels]
        .sort((a, b) => {
          var A = a.toString().toUpperCase();
          var B = b.toString().toUpperCase();
          return A > B ? 1 : -1;
        })
        .map((ele) =>
          csvRow.push(
            '"' +
            (
              i18n.t("static.report.procurementAgentName") +
              " : " +
              ele.toString()
            ).replaceAll(" ", "%20") +
            '"'
          )
        );
    }
    csvRow.push("");
    this.state.shipmentStatusLabels.map((ele) =>
      csvRow.push(
        '"' +
        (i18n.t("static.common.status") + " : " + ele.toString()).replaceAll(
          " ",
          "%20"
        ) +
        '"'
      )
    );
    csvRow.push("");
    csvRow.push(
      '"' +
      (
        i18n.t("static.shipment.aggregateByCountry") +
        " : " +
        (this.state.aggregateByCountry ? "Yes" : "No")
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    csvRow.push(
      '"' +
      (
        i18n.t("static.shipment.hideCalculations") +
        " : " +
        (this.state.hideCalculations ? "Yes" : "No")
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    csvRow.push(
      '"' +
      (
        i18n.t("static.shipment.collapsePlanningUnits") +
        " : " +
        (this.state.collapsePlanningUnits ? "Yes" : "No")
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    csvRow.push("");
    csvRow.push(
      '"' + i18n.t("static.common.youdatastart").replaceAll(" ", "%20") + '"'
    );
    csvRow.push("");

    let dataList = this.state.aggregateByCountry
      ? this.state.data.fspaCountrySplit
      : this.state.data.fspaProgramSplit;

    if (dataList && dataList.length > 0) {
      var A = [];
      let tableHeadTemp = [];
      const isSingleProgramCsvHdr = this.state.programValues.length === 1;
      let fspaHeader =
        this.state.viewById == 1
          ? i18n.t("static.fundingSourceHead.fundingSource")
          : i18n.t("static.report.procurementAgentName");
      let progHeader = this.state.aggregateByCountry
        ? i18n.t("static.dashboard.country")
        : i18n.t("static.program.program");
      const hidesPUs =
        this.state.collapsePlanningUnits || this.state.collapseAll;
      let headerLabel = isSingleProgramCsvHdr
        ? hidesPUs
          ? `${fspaHeader}`
          : `${fspaHeader} / ${i18n.t("static.dashboard.planningunitheader")}`
        : hidesPUs
          ? `${fspaHeader} / ${progHeader}`
          : `${fspaHeader} / ${progHeader} / ${i18n.t(
            "static.dashboard.planningunitheader"
          )}`;
      tableHeadTemp.push(headerLabel.replaceAll(" ", "%20"));
      if (!this.state.collapsePlanningUnits && !this.state.collapseAll) {
        tableHeadTemp.push(
          i18n.t("static.shipment.qty").replaceAll(" ", "%20")
        );
      }
      if (!this.state.hideCalculations) {
        tableHeadTemp.push(
          i18n.t("static.shipment.totalPUCost").replaceAll(" ", "%20")
        );
        tableHeadTemp.push(
          i18n.t("static.shipment.totalFreightCost").replaceAll(" ", "%20")
        );
      }
      tableHeadTemp.push(
        i18n.t("static.shipment.totalCost").replaceAll(" ", "%20")
      );
      tableHeadTemp.push(
        i18n.t("static.shipment.totalCostPerc").replaceAll(" ", "%20")
      );
      A[0] = addDoubleQuoteToRowContent(tableHeadTemp);

      let grandPUCost = 0;
      let grandFreightCost = 0;
      let grandTotalCost = 0;
      let grouping = {};

      dataList.forEach((item) => {
        let fspa = item.fspa;
        let fspaId = fspa ? fspa.id : 0;
        let fspaCode = fspa ? fspa.code : "N/A";
        grandPUCost += item.cost;
        grandFreightCost += item.freightCost;
        grandTotalCost += item.totalCost;
        if (!grouping[fspaId]) {
          grouping[fspaId] = {
            id: fspaId,
            code: fspaCode,
            totalPuCost: 0,
            totalFreightCost: 0,
            totalCost: 0,
            programs: {},
          };
        }
        grouping[fspaId].totalPuCost += item.cost;
        grouping[fspaId].totalFreightCost += item.freightCost;
        grouping[fspaId].totalCost += item.totalCost;
        let prog = item.programCountry;
        let progId = prog ? prog.id : 0;
        let progCode = prog ? prog.code : "N/A";
        if (!grouping[fspaId].programs[progId]) {
          grouping[fspaId].programs[progId] = {
            id: progId,
            code: progCode,
            totalPuCost: 0,
            totalFreightCost: 0,
            totalCost: 0,
            pus: [],
          };
        }
        grouping[fspaId].programs[progId].totalPuCost += item.cost;
        grouping[fspaId].programs[progId].totalFreightCost += item.freightCost;
        grouping[fspaId].programs[progId].totalCost += item.totalCost;
        grouping[fspaId].programs[progId].pus.push({
          id: item.planningUnit.id,
          display: getLabelText(item.planningUnit.label, this.state.lang),
          quantity: item.quantity,
          totalPuCost: item.cost,
          totalFreightCost: item.freightCost,
          totalCost: item.totalCost,
        });
      });

      const renderPerc = (value) => (value * 100).toFixed(2) + "%";
      let fspasList = Object.values(grouping).sort((a, b) => {
        var A = a.code.toString().toUpperCase();
        var B = b.code.toString().toUpperCase();
        return A > B ? 1 : -1;
      });
      fspasList.forEach((f) => {
        f.programsList = Object.values(f.programs).sort((a, b) => {
          var A = a.code.toString().toUpperCase();
          var B = b.code.toString().toUpperCase();
          return A > B ? 1 : -1;
        });
        f.programsList.forEach((p) => {
          p.pus.sort((a, b) => {
            var A = a.display.toString().toUpperCase();
            var B = b.display.toString().toUpperCase();
            return A > B ? 1 : -1;
          });
        });
      });

      const isSingleProgramCsv = this.state.programValues.length === 1;
      fspasList.forEach((fspa) => {
        let row = [fspa.code.replaceAll(",", " ").replaceAll(" ", "%20")];
        if (!this.state.collapsePlanningUnits && !this.state.collapseAll)
          row.push("");
        if (!this.state.hideCalculations) {
          row.push(fspa.totalPuCost);
          row.push(fspa.totalFreightCost);
        }
        row.push(fspa.totalCost);
        row.push(
          grandTotalCost > 0
            ? renderPerc(fspa.totalCost / grandTotalCost)
            : "0%"
        );
        A.push(addDoubleQuoteToRowContent(row));
        if (!this.state.collapseAll) {
          if (isSingleProgramCsv) {
            if (!this.state.collapsePlanningUnits) {
              fspa.programsList.forEach((prog) => {
                prog.pus.forEach((pu) => {
                  let puRow = [
                    ("  " + pu.display)
                      .replaceAll(",", " ")
                      .replaceAll(" ", "%20"),
                    pu.quantity,
                  ];
                  if (!this.state.hideCalculations) {
                    puRow.push(pu.totalPuCost);
                    puRow.push(pu.totalFreightCost);
                  }
                  puRow.push(pu.totalCost);
                  puRow.push(
                    fspa.totalCost > 0
                      ? renderPerc(pu.totalCost / fspa.totalCost)
                      : "0%"
                  );
                  A.push(addDoubleQuoteToRowContent(puRow));
                });
              });
            }
          } else {
            fspa.programsList.forEach((prog) => {
              let progRow = [
                ("  " + prog.code).replaceAll(",", " ").replaceAll(" ", "%20"),
              ];
              if (!this.state.collapsePlanningUnits && !this.state.collapseAll)
                progRow.push("");
              if (!this.state.hideCalculations) {
                progRow.push(prog.totalPuCost);
                progRow.push(prog.totalFreightCost);
              }
              progRow.push(prog.totalCost);
              progRow.push(
                fspa.totalCost > 0
                  ? renderPerc(prog.totalCost / fspa.totalCost)
                  : "0%"
              );
              A.push(addDoubleQuoteToRowContent(progRow));
              if (!this.state.collapsePlanningUnits) {
                prog.pus.forEach((pu) => {
                  let puRow = [
                    ("    " + pu.display)
                      .replaceAll(",", " ")
                      .replaceAll(" ", "%20"),
                    pu.quantity,
                  ];
                  if (!this.state.hideCalculations) {
                    puRow.push(pu.totalPuCost);
                    puRow.push(pu.totalFreightCost);
                  }
                  puRow.push(pu.totalCost);
                  puRow.push(
                    prog.totalCost > 0
                      ? renderPerc(pu.totalCost / prog.totalCost)
                      : "0%"
                  );
                  A.push(addDoubleQuoteToRowContent(puRow));
                });
              }
            });
          }
        }
      });

      let totalRow = [i18n.t("static.supplyPlan.total").replaceAll(" ", "%20")];
      if (!this.state.collapsePlanningUnits && !this.state.collapseAll)
        totalRow.push("");
      if (!this.state.hideCalculations) {
        totalRow.push(grandPUCost);
        totalRow.push(grandFreightCost);
      }
      totalRow.push(grandTotalCost);
      totalRow.push("");
      A.push(addDoubleQuoteToRowContent(totalRow));

      for (var i = 0; i < A.length; i++) {
        csvRow.push(A[i].join(","));
      }
    }

    var csvString = csvRow.join("%0A");
    var a = document.createElement("a");
    a.href = "data:attachment/csv," + csvString;
    a.target = "_Blank";
    a.download =
      i18n.t("static.dashboard.shipmentByPlanningUnit") +
      makeText(this.state.rangeValue.from) +
      " ~ " +
      makeText(this.state.rangeValue.to) +
      ".csv";
    document.body.appendChild(a);
    a.click();
  }

  // ------------------------------------------------------------------
  // exportPDF – same as original but reads data from jspreadsheet
  // instance instead of cloning the HTML table
  // ------------------------------------------------------------------
  exportPDF = () => {
    const addFooters = (doc) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          "Page " + String(i) + " of " + String(pageCount),
          doc.internal.pageSize.width / 9,
          doc.internal.pageSize.height - 30,
          { align: "center" }
        );
        doc.text(
          "Copyright © 2020 " + i18n.t("static.footer"),
          (doc.internal.pageSize.width * 6) / 7,
          doc.internal.pageSize.height - 30,
          { align: "center" }
        );
      }
    };
    const addHeaders = (doc) => {
      const pageCount = doc.internal.getNumberOfPages();
      for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setPage(i);
        doc.addImage(LOGO, "png", 0, 10, 180, 50, "FAST");
        doc.setTextColor("#002f6c");
        doc.text(
          i18n.t("static.dashboard.shipmentByPlanningUnit"),
          doc.internal.pageSize.width / 2,
          60,
          { align: "center" }
        );
        if (i == 1) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.text(
            i18n.t("static.report.dateRange") +
            " : " +
            makeText(this.state.rangeValue.from) +
            " ~ " +
            makeText(this.state.rangeValue.to),
            doc.internal.pageSize.width / 8,
            90,
            { align: "left" }
          );
        }
      }
    };

    const unit = "pt";
    const size = "A4";
    const orientation = "landscape";
    const doc = new jsPDF(orientation, unit, size, true);
    doc.setFontSize(8);
    doc.setTextColor("#002f6c");

    var len = 120;
    var countryLabelsText = doc.splitTextToSize(
      i18n.t("static.dashboard.country") +
      " : " +
      this.state.countryLabels.join("; "),
      (doc.internal.pageSize.width * 3) / 4
    );
    doc.text(doc.internal.pageSize.width / 8, 110, countryLabelsText);
    len = len + countryLabelsText.length * 10;

    var planningText = doc.splitTextToSize(
      i18n.t("static.program.program") +
      " : " +
      this.state.programLabels.join("; "),
      (doc.internal.pageSize.width * 3) / 4
    );
    doc.text(doc.internal.pageSize.width / 8, len, planningText);
    len = len + planningText.length * 10;
    if (this.state.programValues.length == 1) {
      len += 10;
      doc.text(
        i18n.t("static.report.version") +
        " : " +
        document.getElementById("versionId").selectedOptions[0].text,
        doc.internal.pageSize.width / 8,
        len,
        { align: "left" }
      );
      len += 10;
    }

    doc.setFontSize(8);
    doc.setTextColor("#002f6c");
    var puText = doc.splitTextToSize(
      i18n.t("static.planningunit.planningunit") +
      " : " +
      this.state.planningUnitLabels.join("; "),
      (doc.internal.pageSize.width * 3) / 4
    );
    let y = len + 10;
    var viewByText = doc.splitTextToSize(
      i18n.t("static.common.display") +
      " : " +
      (this.state.viewById == 1
        ? i18n.t("static.fundingSourceHead.fundingSource")
        : i18n.t("static.report.procurementAgentName")),
      (doc.internal.pageSize.width * 3) / 4
    );
    for (var i = 0; i < viewByText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      }
      doc.text(doc.internal.pageSize.width / 8, y, viewByText[i]);
      y = y + 10;
    }

    var sourceOrAgentText =
      this.state.viewById == 1
        ? doc.splitTextToSize(
          i18n.t("static.budget.fundingsource") +
          " : " +
          this.state.fundingSourceLabels.join("; "),
          (doc.internal.pageSize.width * 3) / 4
        )
        : doc.splitTextToSize(
          i18n.t("static.report.procurementAgentName") +
          " : " +
          this.state.procurementAgentLabels.join("; "),
          (doc.internal.pageSize.width * 3) / 4
        );
    y = y + 10;
    for (var i = 0; i < sourceOrAgentText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      }
      doc.text(doc.internal.pageSize.width / 8, y, sourceOrAgentText[i]);
      y = y + 10;
    }

    var statusText = doc.splitTextToSize(
      i18n.t("static.common.status") +
      " : " +
      this.state.shipmentStatusLabels.join("; "),
      (doc.internal.pageSize.width * 3) / 4
    );
    y = y + 10;
    for (var i = 0; i < statusText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      }
      doc.text(doc.internal.pageSize.width / 8, y, statusText[i]);
      y = y + 10;
    }

    y = y + 10;
    for (var i = 0; i < puText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      }
      doc.text(doc.internal.pageSize.width / 8, y, puText[i]);
      y = y + 10;
    }

    y = y + 10;
    var filterProps = [
      i18n.t("static.shipment.aggregateByCountry") +
      " : " +
      (this.state.aggregateByCountry ? "Yes" : "No"),
      i18n.t("static.shipment.hideCalculations") +
      " : " +
      (this.state.hideCalculations ? "Yes" : "No"),
      i18n.t("static.shipment.collapsePlanningUnits") +
      " : " +
      (this.state.collapsePlanningUnits ? "Yes" : "No"),
    ];
    for (var i = 0; i < filterProps.length; i++) {
      var propText = doc.splitTextToSize(
        filterProps[i],
        (doc.internal.pageSize.width * 3) / 4
      );
      for (var j = 0; j < propText.length; j++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 80;
        }
        doc.text(doc.internal.pageSize.width / 8, y, propText[j]);
        y = y + 10;
      }
      y = y + 10;
    }

    doc.setTextColor("#fff");
    var height = doc.internal.pageSize.height;
    var h1 = 50;
    let startY = y + 10;

    var canvas = document.getElementById("cool-canvas1");
    if (canvas) {
      var canvasImg = canvas.toDataURL("image/png", 1.0);
      let pages = Math.ceil(startY / height);
      for (var j = 1; j < pages; j++) {
        doc.addPage();
      }
      let startYtable = startY - (height - h1) * (pages - 1);
      if (startYtable > height - 300) {
        doc.addPage();
        startYtable = 80;
      }
      let barWidth = doc.internal.pageSize.width - 20;
      doc.addImage(
        canvasImg,
        "png",
        10,
        startYtable,
        barWidth,
        380,
        "a",
        "CANVAS"
      );
    }

    var canvas2 = document.getElementById("cool-canvas2");
    if (canvas2) {
      var canvasImg2 = canvas2.toDataURL("image/png", 1.0);
      doc.addPage();

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Use most of the page width for the pie chart
      let pieWidth = pageWidth - 80; // 40px margin on each side
      let pieHeight = pageHeight - 180; // leave room for header/footer

      // Maintain aspect ratio — keep it square so the pie isn't squished
      let pieSize = Math.min(pieWidth, pieHeight);

      let pieX = (pageWidth - pieSize) / 2;
      let pieY = (pageHeight - pieSize) / 2; // vertically centered on page

      doc.addImage(
        canvasImg2,
        "png",
        pieX,
        pieY,
        pieSize,
        pieSize,
        "b",
        "CANVAS"
      );
    }

    // ---- Build PDF table from jspreadsheet data ----
    doc.addPage();
    let startYtable2 = 80;

    if (this.el) {
      try {
        const worksheet = this.el.worksheets ? this.el.worksheets[0] : this.el;
        const jsonData = worksheet.getJson ? worksheet.getJson(false) : [];

        // Build header row
        const isSingleProgram = this.state.programValues.length === 1;
        const showQtyColPdf =
          !this.state.collapsePlanningUnits && !this.state.collapseAll;
        let fspaHeader =
          this.state.viewById == 1
            ? i18n.t("static.fundingSourceHead.fundingSource")
            : i18n.t("static.report.procurementAgentName");
        let progHeader = this.state.aggregateByCountry
          ? i18n.t("static.dashboard.country")
          : i18n.t("static.program.program");
        const hidesPUs =
          this.state.collapsePlanningUnits || this.state.collapseAll;
        const isSingleProgramCsvHdr = this.state.programValues.length === 1;
        let headerLabel = isSingleProgramCsvHdr
          ? hidesPUs
            ? `${fspaHeader}`
            : `${fspaHeader} / ${i18n.t("static.dashboard.planningunitheader")}`
          : hidesPUs
            ? `${fspaHeader} / ${progHeader}`
            : `${fspaHeader} / ${progHeader} / ${i18n.t(
              "static.dashboard.planningunitheader"
            )}`;

        const pdfHeaders = [headerLabel];
        if (showQtyColPdf) pdfHeaders.push(i18n.t("static.shipment.qty"));
        if (!this.state.hideCalculations) {
          pdfHeaders.push(i18n.t("static.shipment.totalPUCost"));
          pdfHeaders.push(i18n.t("static.shipment.totalFreightCost"));
        }
        pdfHeaders.push(i18n.t("static.shipment.totalCost"));
        pdfHeaders.push(i18n.t("static.shipment.totalCostPerc"));

        // Build data rows (skip icon col 0, skip hidden meta cols)
        const pdfBody = jsonData.map((row, idx) => {
          const vals = Object.values(row);
          // col 0 = html icon (skip), col 1 = label, then data cols
          // last 4 are hidden meta cols (skip)
          const visibleVals = vals.slice(1, vals.length - 4);
          const rowType = vals[vals.length - 4];

          // Determine indentation manually since 'rows' array is out of scope here
          let indentPx = 0;
          if (rowType === "program") {
            indentPx = 20;
          } else if (rowType === "pu") {
            indentPx = isSingleProgram ? 20 : 40;
          }

          if (indentPx > 0) {
            visibleVals[0] = " ".repeat(indentPx / 5) + visibleVals[0];
          }

          // We also need the indent for this row to correctly format the PDF
          visibleVals._pdfIndent = indentPx;
          visibleVals._rowType = rowType;

          return visibleVals;
        });

        const colStylesPdf = {};
        pdfHeaders.forEach((_, idx) => {
          colStylesPdf[idx] = { halign: idx === 0 ? "left" : "right" };
        });

        doc.autoTable({
          margin: { top: 80, bottom: 70 },
          startY: startYtable2,
          head: [pdfHeaders],
          body: pdfBody,
          styles: { lineWidth: 1, fontSize: 8 },
          columnStyles: colStylesPdf,
          didParseCell: function (data) {
            if (data.cell.section === "body") {
              const indentPx = data.row.raw._pdfIndent || 0;
              const rowType = data.row.raw._rowType;

              if (data.column.index === 0 && indentPx > 0) {
                const cp = data.cell.styles.cellPadding;
                const padObj =
                  typeof cp === "object"
                    ? { ...cp }
                    : { top: cp, right: cp, bottom: cp, left: cp };
                // Scale indent slightly for PDF, 1px in browser ~ 0.5pt in PDF, plus baseline padding
                padObj.left = (padObj.left || 2) + indentPx * 0.5;
                data.cell.styles.cellPadding = padObj;
              }

              // Apply background color to qty column for FSPA and program rows
              if (
                showQtyColPdf &&
                data.column.index === 1 &&
                (rowType === "fspa" || rowType === "program")
              ) {
                // data.cell.styles.fillColor = [211, 211, 211];
                data.cell.styles.textColor = [0, 0, 0];
              }
            }
          },
        });
      } catch (err) {
        console.error("PDF table generation error", err);
      }
    }

    addHeaders(doc);
    addFooters(doc);
    doc.save(i18n.t("static.dashboard.shipmentByPlanningUnit") + ".pdf");
  };

  // ------------------------------------------------------------------
  // fetchData – same as original, but setState callback calls buildJExcel
  // ------------------------------------------------------------------
  fetchData = () => {
    this.setState({
      sortConfig: { col: null, dir: "asc" },
      data: {
        planningUnitQuantity: [],
        fspaCostAndPerc: [],
        fspaProgramSplit: [],
        fspaCountrySplit: [],
      },
    })
    console.log("Procurement agent values ", this.state.procurementAgentValues);
    let versionId =
      this.state.programValues.length == 1
        ? this.state.versionId.toString()
        : "0";
    if (versionId.includes("Local")) {
      let versionId = document.getElementById("versionId").value;
      let programId = this.state.programValues[0].value;
      let startDate =
        this.state.rangeValue.from.year +
        "-" +
        this.state.rangeValue.from.month +
        "-01";
      let endDate =
        this.state.rangeValue.to.year +
        "-" +
        this.state.rangeValue.to.month +
        "-" +
        new Date(
          this.state.rangeValue.to.year,
          this.state.rangeValue.to.month + 1,
          0
        ).getDate();
      let planningUnitIds = this.state.planningUnitValues.map((ele) =>
        ele.value.toString()
      );
      let fundingSourceIds = this.state.fundingSourceValues.map((ele) =>
        ele.value.toString()
      );
      let shipmentStatusIds = this.state.shipmentStatusValues.map((ele) =>
        ele.value.toString()
      );

      if (
        programId > 0 &&
        versionId != 0 &&
        this.state.planningUnitValues.length > 0 &&
        ((this.state.viewById == 1 &&
          this.state.fundingSourceValues.length > 0) ||
          (this.state.viewById == 2 &&
            this.state.procurementAgentValues.length > 0)) &&
        this.state.shipmentStatusValues.length > 0
      ) {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
          this.setState({
            message: i18n.t("static.program.errortext"),
            loading: false,
          });
        }.bind(this);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;
          var programDataTransaction = db1.transaction(
            ["programData"],
            "readwrite"
          );
          var version = versionId.split("(")[0].trim();
          var userBytes = CryptoJS.AES.decrypt(
            localStorage.getItem("curUser"),
            SECRET_KEY
          );
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          var program = `${programId}_v${version}_uId_${userId}`;
          var programDataOs = programDataTransaction.objectStore("programData");
          var programRequest = programDataOs.get(program);
          programRequest.onerror = function (event) {
            this.setState({
              message: i18n.t("static.program.errortext"),
              loading: false,
            });
          }.bind(this);
          programRequest.onsuccess = function (e) {
            this.setState({ loading: true });
            var planningUnitDataList =
              programRequest.result.programData.planningUnitDataList;
            let combinedShipmentList = [];
            for (let i = 0; i < planningUnitIds.length; i++) {
              var planningUnitDataIndex = planningUnitDataList.findIndex(
                (c) => c.planningUnitId == planningUnitIds[i]
              );
              var programJson = {};
              if (planningUnitDataIndex != -1) {
                var planningUnitData = planningUnitDataList.filter(
                  (c) => c.planningUnitId == planningUnitIds[i]
                )[0];
                var programDataBytes = CryptoJS.AES.decrypt(
                  planningUnitData.planningUnitData,
                  SECRET_KEY
                );
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                programJson = JSON.parse(programData);
              } else {
                programJson = { shipmentList: [] };
              }
              var shipmentList = programJson.shipmentList;
              if (shipmentList) {
                for (let j = 0; j < shipmentList.length; j++) {
                  if (shipmentList[j].planningUnit.id == planningUnitIds[i]) {
                    combinedShipmentList.push(shipmentList[j]);
                  }
                }
              }
            }
            const activeFilter = combinedShipmentList.filter(
              (c) =>
                (c.active == true || c.active == "true") &&
                (c.accountFlag == true || c.accountFlag == "true")
            );
            let dateFilter = activeFilter.filter((c) =>
              moment(
                c.receivedDate == null || c.receivedDate == ""
                  ? c.expectedDeliveryDate
                  : c.receivedDate
              ).isBetween(startDate, endDate, null, "[)")
            );
            let reportView = this.state.viewById;
            let fspaFilter = [];
            if (reportView == 1) {
              fspaFilter = dateFilter.filter((c) =>
                fundingSourceIds.includes(c.fundingSource.id.toString())
              );
            } else {
              let procurementAgentIds = this.state.procurementAgentValues.map(
                (ele) => ele.value.toString()
              );
              fspaFilter = dateFilter.filter((c) =>
                procurementAgentIds.includes(c.procurementAgent.id.toString())
              );
            }
            let shipmentStatusFilter = fspaFilter.filter((c) =>
              shipmentStatusIds.includes(c.shipmentStatus.id.toString())
            );
            var procurementAgentTransaction = db1.transaction(
              ["procurementAgent"],
              "readwrite"
            );
            var procurementAgentOs =
              procurementAgentTransaction.objectStore("procurementAgent");
            var procurementAgentRequest = procurementAgentOs.getAll();
            var procurementAgentList = [];
            procurementAgentRequest.onsuccess = function (e) {
              var myResult = procurementAgentRequest.result;
              for (var k = 0; k < myResult.length; k++) {
                procurementAgentList[k] = {
                  id: myResult[k].procurementAgentId,
                  code: myResult[k].procurementAgentCode,
                };
              }
              let fspaCostAndPercMap = {};
              let totalGrandCost = 0;
              shipmentStatusFilter.forEach((item) => {
                let fspa =
                  reportView == 1 ? item.fundingSource : item.procurementAgent;
                let fspaId = fspa ? fspa.id : 0;
                let conversionRate =
                  item.currency && item.currency.conversionRateToUsd
                    ? item.currency.conversionRateToUsd
                    : 1;
                let amount =
                  (item.productCost || 0) * conversionRate +
                  (item.freightCost || 0) * conversionRate;
                totalGrandCost += amount;
                if (!fspaCostAndPercMap[fspaId]) {
                  fspaCostAndPercMap[fspaId] = { fspa: fspa, cost: 0, perc: 0 };
                }
                fspaCostAndPercMap[fspaId].cost += amount;
              });
              let locFspaCostAndPerc = Object.values(fspaCostAndPercMap);
              if (totalGrandCost > 0) {
                locFspaCostAndPerc.forEach((x) => {
                  x.perc = x.cost / totalGrandCost;
                });
              }

              let fspaProgramSplitMap = {};
              let fspaCountrySplitMap = {};
              let planningUnitQuantityMap = {};
              let programInfo = {
                id: this.state.programValues[0].value,
                label: { label_en: this.state.programValues[0].label },
                code: this.state.programValues[0].label,
              };
              let countryInfo =
                this.state.countryValues &&
                  this.state.countryValues.length === 1
                  ? {
                    id: this.state.countryValues[0].value,
                    label: { label_en: this.state.countryValues[0].label },
                    code: this.state.countryValues[0].label,
                  }
                  : programInfo;

              shipmentStatusFilter.forEach((item) => {
                let fspa =
                  reportView == 1 ? item.fundingSource : item.procurementAgent;
                let fspaId = fspa ? fspa.id : 0;
                let fspaCode = fspa ? fspa.code : "N/A";
                let puId = item.planningUnit.id;
                let qty = item.shipmentQty || 0;
                let conversionRate =
                  item.currency && item.currency.conversionRateToUsd
                    ? item.currency.conversionRateToUsd
                    : 1;
                let cost = (item.productCost || 0) * conversionRate;
                let freightCost = (item.freightCost || 0) * conversionRate;
                let totalCost = cost + freightCost;
                if (!planningUnitQuantityMap[puId]) {
                  planningUnitQuantityMap[puId] = {
                    planningUnit: item.planningUnit,
                    fspaQuantity: {},
                  };
                }
                if (!planningUnitQuantityMap[puId].fspaQuantity[fspaCode]) {
                  planningUnitQuantityMap[puId].fspaQuantity[fspaCode] = 0;
                }
                planningUnitQuantityMap[puId].fspaQuantity[fspaCode] += qty;
                let progKey = fspaId + "_" + programInfo.id + "_" + puId;
                if (!fspaProgramSplitMap[progKey]) {
                  fspaProgramSplitMap[progKey] = {
                    fspa: fspa,
                    programCountry: programInfo,
                    planningUnit: item.planningUnit,
                    quantity: 0,
                    cost: 0,
                    freightCost: 0,
                    totalCost: 0,
                  };
                }
                fspaProgramSplitMap[progKey].quantity += qty;
                fspaProgramSplitMap[progKey].cost += cost;
                fspaProgramSplitMap[progKey].freightCost += freightCost;
                fspaProgramSplitMap[progKey].totalCost += totalCost;
                let ctryKey = fspaId + "_" + countryInfo.id + "_" + puId;
                if (!fspaCountrySplitMap[ctryKey]) {
                  fspaCountrySplitMap[ctryKey] = {
                    fspa: fspa,
                    programCountry: countryInfo,
                    planningUnit: item.planningUnit,
                    quantity: 0,
                    cost: 0,
                    freightCost: 0,
                    totalCost: 0,
                  };
                }
                fspaCountrySplitMap[ctryKey].quantity += qty;
                fspaCountrySplitMap[ctryKey].cost += cost;
                fspaCountrySplitMap[ctryKey].freightCost += freightCost;
                fspaCountrySplitMap[ctryKey].totalCost += totalCost;
              });

              this.setState(
                {
                  data: {
                    planningUnitQuantity: Object.values(
                      planningUnitQuantityMap
                    ),
                    fspaCostAndPerc: locFspaCostAndPerc,
                    fspaProgramSplit: Object.values(fspaProgramSplitMap),
                    fspaCountrySplit: Object.values(fspaCountrySplitMap),
                  },
                  message: "",
                  fundingSourceSplit: locFspaCostAndPerc,
                  table1Headers: [],
                  loading: false,
                },
                () => {
                  // ← KEY CHANGE: rebuild jspreadsheet after data load
                  this.buildJExcel();
                }
              );
            }.bind(this);
          }.bind(this);
        }.bind(this);
      } else if (programId == 0) {
        this.setState({
          message: i18n.t("static.common.selectProgram"),
          data: {
            planningUnitQuantity: [],
            fspaCostAndPerc: [],
            fspaProgramSplit: [],
            fspaCountrySplit: [],
          },
          loading: false,
        });
      } else if (versionId == 0) {
        this.setState({
          message: i18n.t("static.program.validversion"),
          data: {
            planningUnitQuantity: [],
            fspaCostAndPerc: [],
            fspaProgramSplit: [],
            fspaCountrySplit: [],
          },
          loading: false,
        });
      } else if (this.state.planningUnitValues.length == 0) {
        this.setState({
          message: i18n.t("static.procurementUnit.validPlanningUnitText"),
          data: {
            planningUnitQuantity: [],
            fspaCostAndPerc: [],
            fspaProgramSplit: [],
            fspaCountrySplit: [],
          },
          loading: false,
        });
      } else if (
        this.state.viewById == 1 &&
        this.state.fundingSourceValues.length == 0
      ) {
        this.setState({
          message: i18n.t("static.fundingSource.selectFundingSource"),
          data: {
            planningUnitQuantity: [],
            fspaCostAndPerc: [],
            fspaProgramSplit: [],
            fspaCountrySplit: [],
          },
          loading: false,
        });
      } else if (
        this.state.viewById == 2 &&
        this.state.procurementAgentValues.length == 0
      ) {
        this.setState({
          message: i18n.t("static.procurementAgent.selectProcurementAgent"),
          data: {
            planningUnitQuantity: [],
            fspaCostAndPerc: [],
            fspaProgramSplit: [],
            fspaCountrySplit: [],
          },
          loading: false,
        });
      } else if (this.state.shipmentStatusValues.length == 0) {
        this.setState({
          message: i18n.t("static.report.validShipmentStatusText"),
          data: {
            planningUnitQuantity: [],
            fspaCostAndPerc: [],
            fspaProgramSplit: [],
            fspaCountrySplit: [],
          },
          loading: false,
        });
      }
    } else {
      let startDate =
        this.state.rangeValue.from.year +
        "-" +
        this.state.rangeValue.from.month +
        "-01";
      let endDate =
        this.state.rangeValue.to.year +
        "-" +
        this.state.rangeValue.to.month +
        "-" +
        new Date(
          this.state.rangeValue.to.year,
          this.state.rangeValue.to.month,
          0
        ).getDate();
      let planningUnitIds =
        this.state.planningUnitValues.length == this.state.planningUnits.length
          ? []
          : this.state.planningUnitValues.map((ele) => ele.value.toString());
      let fundingSourceIds =
        this.state.fundingSourceValues.length ==
          this.state.fundingSources.length
          ? []
          : this.state.fundingSourceValues.map((ele) => ele.value.toString());
      let procurementAgentIds =
        this.state.procurementAgentValues.length ==
          this.state.procurementAgentValues.length
          ? []
          : this.state.procurementAgentValues.map((ele) =>
            ele.value.toString()
          );
      let shipmentStatusIds =
        this.state.shipmentStatusValues.length ==
          this.state.shipmentStatuses.length
          ? []
          : this.state.shipmentStatusValues.map((ele) => ele.value.toString());
      let realmId = AuthenticationService.getRealmId();
      let CountryIds =
        this.state.countryValues.length == this.state.countrys.length
          ? []
          : this.state.countryValues.map((ele) => ele.value.toString());
      let programIds = this.state.programValues.map((ele) =>
        ele.value.toString()
      );
      let groupByProcurementAgentType = this.state.procurementAgentTypeId;
      let groupByFundingSourceType = 0;
      let versionId =
        this.state.programValues.length == 1
          ? this.state.versionId.toString()
          : "0";

      if (
        this.state.countryValues.length > 0 &&
        this.state.programValues.length > 0 &&
        this.state.planningUnitValues.length > 0 &&
        ((this.state.viewById == 1 &&
          this.state.fundingSourceValues.length > 0) ||
          (this.state.viewById == 2 &&
            this.state.procurementAgentValues.length > 0)) &&
        this.state.shipmentStatusValues.length > 0 &&
        ((this.state.programValues.length == 1 && versionId != "") ||
          this.state.programValues.length > 1)
      ) {
        this.setState({ message: "", loading: true });
        var inputjson = {
          realmId: realmId,
          startDate: startDate,
          stopDate: endDate,
          realmCountryIds: CountryIds,
          programIds: programIds,
          versionId: versionId,
          planningUnitIds: planningUnitIds,
          fundingSourceIds:
            this.state.viewById == 1 ? fundingSourceIds : procurementAgentIds,
          shipmentStatusIds: shipmentStatusIds,
          reportView: this.state.viewById,
        };
        ReportService.shipmentOverview(inputjson)
          .then((response) => {
            try {
              this.setState(
                {
                  data: response.data,
                  fundingSourceSplit: [],
                  planningUnitSplit: [],
                  procurementAgentSplit: [],
                  table1Headers: [],
                  loading: false,
                },
                () => {
                  // ← KEY CHANGE: rebuild jspreadsheet after data load
                  this.buildJExcel();
                }
              );
            } catch (error) {
              this.setState({ loading: false });
            }
          })
          .catch((error) => {
            if (error.message === "Network Error") {
              this.setState({
                message: API_URL.includes("uat")
                  ? i18n.t("static.common.uatNetworkErrorMessage")
                  : API_URL.includes("demo")
                    ? i18n.t("static.common.demoNetworkErrorMessage")
                    : i18n.t("static.common.prodNetworkErrorMessage"),
                loading: false,
              });
            } else {
              switch (error.response ? error.response.status : "") {
                case 401:
                  this.props.history.push(
                    `/login/static.message.sessionExpired`
                  );
                  break;
                case 409:
                  this.setState({
                    message: i18n.t("static.common.accessDenied"),
                    loading: false,
                    color: "#BA0C2F",
                  });
                  break;
                case 403:
                  this.props.history.push(`/accessDenied`);
                  break;
                case 500:
                case 404:
                case 406:
                case 412:
                  this.setState({
                    message: error.response.data.messageCode,
                    loading: false,
                  });
                  break;
                default:
                  this.setState({
                    message: "static.unkownError",
                    loading: false,
                  });
                  break;
              }
            }
          });
      } else if (this.state.countryValues.length == 0) {
        this.setState({
          message: i18n.t("static.program.validcountrytext"),
          data: {
            planningUnitQuantity: [],
            fspaCostAndPerc: [],
            fspaProgramSplit: [],
            fspaCountrySplit: [],
          },
          loading: false,
        });
      } else if (this.state.programValues.length == 0) {
        this.setState({
          message: i18n.t("static.common.selectProgram"),
          data: {
            planningUnitQuantity: [],
            fspaCostAndPerc: [],
            fspaProgramSplit: [],
            fspaCountrySplit: [],
          },
          loading: false,
        });
      } else if (this.state.programValues.length == 1 && versionId == 0) {
        this.setState({
          message: i18n.t("static.program.validversion"),
          data: {
            planningUnitQuantity: [],
            fspaCostAndPerc: [],
            fspaProgramSplit: [],
            fspaCountrySplit: [],
          },
          loading: false,
        });
      } else if (this.state.planningUnitValues.length == 0) {
        this.setState({
          message: i18n.t("static.procurementUnit.validPlanningUnitText"),
          data: {
            planningUnitQuantity: [],
            fspaCostAndPerc: [],
            fspaProgramSplit: [],
            fspaCountrySplit: [],
          },
          loading: false,
        });
      } else if (
        this.state.viewById == 1 &&
        this.state.fundingSourceValues.length == 0
      ) {
        this.setState({
          message: i18n.t("static.fundingSource.selectFundingSource"),
          data: {
            planningUnitQuantity: [],
            fspaCostAndPerc: [],
            fspaProgramSplit: [],
            fspaCountrySplit: [],
          },
          loading: false,
        });
      } else if (
        this.state.viewById == 2 &&
        this.state.procurementAgentValues.length == 0
      ) {
        this.setState({
          message: i18n.t("static.procurementAgent.selectProcurementAgent"),
          data: {
            planningUnitQuantity: [],
            fspaCostAndPerc: [],
            fspaProgramSplit: [],
            fspaCountrySplit: [],
          },
          loading: false,
        });
      } else if (this.state.shipmentStatusValues.length == 0) {
        this.setState({
          message: i18n.t("static.report.validShipmentStatusText"),
          data: {
            planningUnitQuantity: [],
            fspaCostAndPerc: [],
            fspaProgramSplit: [],
            fspaCountrySplit: [],
          },
          loading: false,
        });
      }
    }
  };

  // ------------------------------------------------------------------
  // componentDidMount – same as original
  // ------------------------------------------------------------------
  componentDidMount() {
    const isDarkMode =
      document.documentElement.getAttribute("data-theme") === "dark";
    this.setState({ isDarkMode });
    const observer = new MutationObserver(() => {
      const updatedDarkMode =
        document.documentElement.getAttribute("data-theme") === "dark";
      this.setState({ isDarkMode: updatedDarkMode });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    Chart.plugins.register({
      afterDraw: function (chart) {
        if (chart.config.type === "pie" && chart.canvas.id === "cool-canvas2") {
          const ctx = chart.chart.ctx;
          const total = chart.data.datasets[0].data.reduce(
            (sum, value) => sum + parseInt(value),
            0
          );
          chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            if (!meta.hidden) {
              meta.data.forEach((element, index) => {
                if (!chart.getDatasetMeta(datasetIndex).data[index].hidden) {
                  ctx.save();
                  const model = element._model;
                  const startAngle = model.startAngle;
                  const endAngle = model.endAngle;
                  const midAngle = startAngle + (endAngle - startAngle) / 2;
                  const x = Math.cos(midAngle);
                  const y = Math.sin(midAngle);
                  const lineX = model.x + x * model.outerRadius;
                  const lineY = model.y + y * model.outerRadius;
                  const labelX = model.x + x * (model.outerRadius + 10);
                  const labelY = model.y + y * (model.outerRadius + 10);
                  const value = dataset.data[index];
                  const percentage = ((value / total) * 100).toFixed(2) + "%";
                  if (((value / total) * 100).toFixed(2) > 2) {
                    ctx.beginPath();
                    ctx.moveTo(model.x, model.y);
                    ctx.lineTo(lineX, lineY);
                    ctx.lineTo(labelX, labelY);
                    ctx.strokeStyle = dataset.backgroundColor[index];
                    ctx.stroke();
                    ctx.textAlign = x >= 0 ? "left" : "right";
                    ctx.font = "number 10px Arial";
                    ctx.fillStyle = dataset.backgroundColor[index];
                    ctx.fillText(
                      `${percentage}`,
                      x < 0
                        ? x < -0.5
                          ? labelX
                          : labelX + 8
                        : x < 0.5
                          ? labelX - 8
                          : labelX,
                      y < 0
                        ? y < -0.5
                          ? labelY - 8
                          : labelY
                        : y < 0.5
                          ? labelY
                          : labelY + 8
                    );
                    ctx.restore();
                  }
                }
              });
            }
          });
        }
      },
    });

    this.getCountrys();
    this.getShipmentStatusList();
  }

  // ------------------------------------------------------------------
  // All remaining methods are IDENTICAL to the original
  // ------------------------------------------------------------------
  getCountrys = () => {
    this.setState({ loading: true });
    if (localStorage.getItem("sessionType") === "Online") {
      let realmId = AuthenticationService.getRealmId();
      DropdownService.getRealmCountryDropdownList(realmId)
        .then((response) => {
          var listArray = response.data;
          listArray.sort((a, b) => {
            var itemLabelA = getLabelText(
              a.label,
              this.state.lang
            ).toUpperCase();
            var itemLabelB = getLabelText(
              b.label,
              this.state.lang
            ).toUpperCase();
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState({ countrys: listArray }, () => {
            this.fetchData();
          });
        })
        .catch((error) => {
          this.setState({ countrys: [] });
          if (error.message === "Network Error") {
            this.setState({
              message: API_URL.includes("uat")
                ? i18n.t("static.common.uatNetworkErrorMessage")
                : API_URL.includes("demo")
                  ? i18n.t("static.common.demoNetworkErrorMessage")
                  : i18n.t("static.common.prodNetworkErrorMessage"),
              loading: false,
            });
          } else {
            switch (error.response ? error.response.status : "") {
              case 401:
                this.props.history.push(`/login/static.message.sessionExpired`);
                break;
              case 403:
                this.props.history.push(`/accessDenied`);
                break;
              default:
                this.setState({
                  message: "static.unkownError",
                  loading: false,
                });
                break;
            }
          }
        });
    } else {
      var db1;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transaction = db1.transaction(["country"], "readwrite");
        var Country = transaction.objectStore("country");
        var getRequest = Country.getAll();
        getRequest.onsuccess = function (event) {
          var myResult = getRequest.result;
          var proList = [];
          for (var i = 0; i < myResult.length; i++) {
            proList.push({
              label: myResult[i].label,
              id: myResult[i].countryId,
            });
          }
          proList.sort((a, b) => {
            var A = getLabelText(a.label, this.state.lang).toUpperCase();
            var B = getLabelText(b.label, this.state.lang).toUpperCase();
            return A > B ? 1 : -1;
          });
          this.setState({ countrys: proList, loading: false }, () => {
            this.fetchData();
          });
        }.bind(this);
      }.bind(this);
    }
  };

  handleChange = (countrysId) => {
    countrysId = countrysId.sort(
      (a, b) => parseInt(a.value) - parseInt(b.value)
    );
    this.setState(
      {
        countryValues: countrysId.map((ele) => ele),
        countryLabels: countrysId.map((ele) => ele.label),
        programValues: [],
        programLabels: [],
        planningUnitValues: [],
        planningUnitLabels: [],
        data: {
          planningUnitQuantity: [],
          fspaCostAndPerc: [],
          fspaProgramSplit: [],
          fspaCountrySplit: [],
        },
        fundingSourceSplit: [],
        planningUnitSplit: [],
        procurementAgentSplit: [],
        table1Headers: [],
        programLst: [],
        versionId: "",
        procurementAgentValues: [],
        procurementAgentLabels: [],
      },
      () => { }
    );
  };

  handleChangeProgram = (programIds) => {
    programIds = programIds.sort(
      (a, b) => parseInt(a.value) - parseInt(b.value)
    );
    this.setState(
      {
        programValues: programIds.map((ele) => ele),
        programLabels: programIds.map((ele) => ele.label),
        versionId: "",
        procurementAgentValues: [],
        procurementAgentLabels: [],
        planningUnitValues: [],
        planningUnitLabels: [],
        data: {
          planningUnitQuantity: [],
          fspaCostAndPerc: [],
          fspaProgramSplit: [],
          fspaCountrySplit: [],
        },
      },
      () => { }
    );
  };

  getProcurementAgentList() {
    this.setState({ loading: true });
    if (localStorage.getItem("sessionType") === "Online") {
      var programIds = this.state.programValues.map((ele) => ele.value);
      DropdownService.getProcurementAgentDropdownListForFilterMultiplePrograms(
        programIds
      )
        .then((response) => {
          var listArray = response.data.sort((a, b) =>
            a.code.toUpperCase() > b.code.toUpperCase() ? 1 : -1
          );
          this.setState({
            procurementAgents: listArray,
            loading: false,
            procurementAgentValues: listArray.map((c) => ({
              value: c.id,
              label: c.code,
            })),
            procurementAgentLabels: listArray.map((c) => c.code),
          });
        })
        .catch(() => {
          this.setState({ procurementAgents: [] });
        });
    } else {
      var db3;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onsuccess = function (e) {
        db3 = e.target.result;
        var paOs = db3
          .transaction(["procurementAgent"], "readwrite")
          .objectStore("procurementAgent");
        var paRequest = paOs.getAll();
        paRequest.onsuccess = function (event) {
          var pa = paRequest.result
            .filter((c) =>
              [...new Set(c.programList.map((ele) => ele.id))].includes(
                parseInt(this.state.programValues[0].value)
              )
            )
            .map((r) => ({
              id: r.procurementAgentId,
              code: r.procurementAgentCode,
              label: r.label,
            }));
          this.setState({
            procurementAgents: pa.sort((a, b) =>
              a.code.toLowerCase() < b.code.toLowerCase() ? -1 : 1
            ),
            procurementAgentValues: pa.map((c) => ({
              value: c.id,
              label: c.code,
            })),
            procurementAgentLabels: pa.map((c) => c.code),
          });
        }.bind(this);
      }.bind(this);
    }
  }

  handleProcurementAgentChange = (procurementAgentIds) => {
    console.log("procurementAgentIds Test@123", procurementAgentIds);
    this.setState(
      {
        procurementAgentValues: procurementAgentIds.map((ele) => ele),
        procurementAgentLabels: procurementAgentIds.map((ele) => ele.label),
        data: {
          planningUnitQuantity: [],
          fspaCostAndPerc: [],
          fspaProgramSplit: [],
          fspaCountrySplit: [],
        },
      },
      () => {
        // this.fetchData();
      }
    );
  };

  getShipmentStatusList() {
    if (localStorage.getItem("sessionType") === "Online") {
      ShipmentStatusService.getShipmentStatusListActive()
        .then((response) => {
          var listArray = response.data.sort((a, b) =>
            getLabelText(a.label, this.state.lang).toUpperCase() >
              getLabelText(b.label, this.state.lang).toUpperCase()
              ? 1
              : -1
          );
          this.setState(
            {
              shipmentStatuses: listArray,
              shipmentStatusValues: listArray.map((c) => ({
                value: c.shipmentStatusId,
                label: getLabelText(c.label, this.state.lang),
              })),
              shipmentStatusLabels: listArray.map((c) =>
                getLabelText(c.label, this.state.lang)
              ),
              loading: false,
            },
            () => {
              // this.fetchData();
            }
          );
        })
        .catch(() => {
          this.setState({ countrys: [] });
        });
    } else {
      var db2;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onsuccess = function (e) {
        db2 = e.target.result;
        var sStatusRequest = db2
          .transaction(["shipmentStatus"], "readwrite")
          .objectStore("shipmentStatus")
          .getAll();
        sStatusRequest.onsuccess = function (event) {
          var sStatusResult = sStatusRequest.result;
          this.setState({
            shipmentStatuses: sStatusResult,
            shipmentStatusValues: sStatusResult.map((c) => ({
              value: c.shipmentStatusId,
              label: getLabelText(c.label, this.state.lang),
            })),
            shipmentStatusLabels: sStatusResult.map((c) =>
              getLabelText(c.label, this.state.lang)
            ),
          });
        }.bind(this);
      }.bind(this);
    }
  }

  getFundingSourceType = () => {
    let realmId = AuthenticationService.getRealmId();
    this.setState({ loading: true });
    if (localStorage.getItem("sessionType") === "Online") {
      FundingSourceService.getFundingsourceTypeListByRealmId(realmId)
        .then((response) => {
          if (response.status == 200) {
            var fundingSourceTypes = response.data.sort((a, b) =>
              a.fundingSourceTypeCode.toLowerCase() <
                b.fundingSourceTypeCode.toLowerCase()
                ? -1
                : 1
            );
            this.setState({ fundingSourceTypes, loading: false }, () => {
              this.consolidatedFundingSourceTypeList();
            });
          } else {
            this.setState(
              { message: response.data.messageCode, loading: false },
              () => {
                this.consolidatedFundingSourceTypeList();
              }
            );
          }
        })
        .catch(() => {
          this.setState({ fundingSourceTypes: [], loading: false }, () => {
            this.consolidatedFundingSourceTypeList();
          });
        });
    } else {
      this.consolidatedFundingSourceTypeList();
      this.setState({ loading: false });
    }
  };

  consolidatedFundingSourceTypeList = () => {
    let realmId = AuthenticationService.getRealmId();
    var fstList = this.state.fundingSourceTypes;
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var getRequest = db1
        .transaction(["fundingSourceType"], "readwrite")
        .objectStore("fundingSourceType")
        .getAll();
      getRequest.onsuccess = function (event) {
        var myResult = getRequest.result.filter((c) => c.realm.id == realmId);
        for (var i = 0; i < myResult.length; i++) {
          if (
            !this.state.fundingSourceTypes.some(
              (k) => k.fundingSourceTypeId == myResult[i].fundingSourceTypeId
            )
          ) {
            fstList.push(myResult[i]);
          }
        }
        this.setState({
          fundingSourceTypes: fstList.sort((a, b) =>
            a.fundingSourceTypeCode.toLowerCase() <
              b.fundingSourceTypeCode.toLowerCase()
              ? -1
              : 1
          ),
        });
      }.bind(this);
    }.bind(this);
  };

  handleFundingSourceTypeChange = (fundingSourceTypeIds) => {
    fundingSourceTypeIds = fundingSourceTypeIds.sort(
      (a, b) => parseInt(a.value) - parseInt(b.value)
    );
    this.setState(
      {
        fundingSourceTypeValues: fundingSourceTypeIds.map((ele) => ele),
        fundingSourceTypeLabels: fundingSourceTypeIds.map((ele) => ele.label),
      },
      () => {
        var filteredFundingSourceArr = [];
        var fundingSources = this.state.fundingSourcesOriginal;
        for (var i = 0; i < fundingSourceTypeIds.length; i++) {
          for (var j = 0; j < fundingSources.length; j++) {
            if (
              fundingSources[j].fundingSourceType.id ==
              fundingSourceTypeIds[i].value
            ) {
              filteredFundingSourceArr.push(fundingSources[j]);
            }
          }
        }
        if (filteredFundingSourceArr.length > 0) {
          filteredFundingSourceArr.sort((a, b) =>
            a.code.toLowerCase() < b.code.toLowerCase() ? -1 : 1
          );
        }
        this.setState(
          {
            fundingSources: filteredFundingSourceArr,
            fundingSourceValues: [],
            fundingSourceLabels: [],
          },
          () => {
            this.fetchData();
          }
        );
      }
    );
  };

  getFundingSource = () => {
    this.setState({ loading: true });
    if (localStorage.getItem("sessionType") === "Online") {
      let programIds = this.state.programValues.map((ele) => Number(ele.value));
      DropdownService.getFundingSourceForProgramsDropdownList(programIds)
        .then((response) => {
          this.setState({
            fundingSources: response.data,
            loading: false,
            fundingSourceValues: response.data.map((c) => ({
              value: c.id,
              label: c.code,
            })),
            fundingSourceLabels: response.data.map((c) => c.code),
          });
        })
        .catch(() => {
          this.setState({ fundingSources: [] });
        });
    } else {
      var db3;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onsuccess = function (e) {
        db3 = e.target.result;
        var fSourceRequest = db3
          .transaction(["fundingSource"], "readwrite")
          .objectStore("fundingSource")
          .getAll();
        fSourceRequest.onsuccess = function (event) {
          var fSourceResult = fSourceRequest.result.filter((c) =>
            [...new Set(c.programList.map((ele) => ele.id))].includes(
              parseInt(this.state.programValues[0].value)
            )
          );
          var fundingSource = fSourceResult.map((r, i) => ({
            id: r.fundingSourceId,
            code: r.fundingSourceCode,
            label: r.label,
            fundingSourceType: fSourceRequest.result[i].fundingSourceType,
          }));
          this.setState({
            fundingSources: fundingSource.sort((a, b) =>
              a.code.toLowerCase() < b.code.toLowerCase() ? -1 : 1
            ),
            fundingSourceValues: fundingSource.map((c) => ({
              value: c.id,
              label: c.code,
            })),
            fundingSourceLabels: fundingSource.map((c) => c.code),
          });
        }.bind(this);
      }.bind(this);
    }
  };

  getPrograms = () => {
    this.setState({ loading: true });
    if (localStorage.getItem("sessionType") === "Online") {
      let newCountryList = [
        ...new Set(this.state.countryValues.map((ele) => ele.value)),
      ];
      if (newCountryList.length > 0) {
        DropdownService.getSPProgramWithFilterForMultipleRealmCountryForDropdown(
          newCountryList
        )
          .then((response) => {
            var listArray = response.data.sort((a, b) =>
              a.code.toUpperCase() > b.code.toUpperCase() ? 1 : -1
            );
            this.setState({ programLst: listArray, loading: false });
          })
          .catch(() => {
            this.setState({ programLst: [], loading: false });
          });
      }
    } else {
      let newCountryList = [
        ...new Set(this.state.countryValues.map((ele) => ele.value)),
      ];
      if (newCountryList.length > 0) {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;
          var getRequest = db1
            .transaction(["programData"], "readwrite")
            .objectStore("programData")
            .getAll();
          getRequest.onsuccess = function (event) {
            var myResult = getRequest.result;
            var userBytes = CryptoJS.AES.decrypt(
              localStorage.getItem("curUser"),
              SECRET_KEY
            );
            var userId = userBytes.toString(CryptoJS.enc.Utf8);
            var proList = [];
            for (var i = 0; i < myResult.length; i++) {
              if (myResult[i].userId == userId) {
                var generalProgramDataBytes = CryptoJS.AES.decrypt(
                  myResult[i].programData.generalData,
                  SECRET_KEY
                );
                var generalProgramJson = JSON.parse(
                  generalProgramDataBytes.toString(CryptoJS.enc.Utf8)
                );
                if (
                  generalProgramJson.realmCountry.country.countryId ==
                  this.state.countryValues[0].value
                ) {
                  proList.push({
                    code: myResult[i].programCode,
                    id: myResult[i].id.split("_")[0],
                  });
                }
              }
            }
            proList.sort((a, b) => (a.code > b.code ? 1 : -1));
            this.setState({ programLst: proList, loading: false }, () => {
              this.fetchData();
            });
          }.bind(this);
        }.bind(this);
      }
    }
  };

  filterVersion = () => {
    this.setState({ loading: true });
    let programId = this.state.programValues;
    if (programId.length == 1) {
      programId = programId[0].value;
      const program = this.state.programLst.filter((c) => c.id == programId);
      if (program.length == 1) {
        if (localStorage.getItem("sessionType") === "Online") {
          this.setState({ versions: [] }, () => {
            DropdownService.getVersionListForSPProgram(programId)
              .then((response) => {
                this.setState(
                  {
                    versions: response.data.sort(
                      (a, b) => a.versionId - b.versionId
                    ),
                  },
                  () => {
                    this.consolidatedVersionList(programId);
                  }
                );
              })
              .catch(() => {
                this.setState({ programs: [], loading: false });
              });
          });
        } else {
          this.setState({ versions: [] }, () => {
            this.consolidatedVersionList(programId);
          });
        }
      } else {
        this.setState({ versions: [] });
      }
    } else {
      this.setState({ versions: [] }, () => {
        this.getPlanningUnit();
      });
    }
  };

  consolidatedVersionList = (programId) => {
    this.setState({ loading: true });
    var verList = this.state.versions;
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var getRequest = db1
        .transaction(["programData"], "readwrite")
        .objectStore("programData")
        .getAll();
      getRequest.onsuccess = function (event) {
        var myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(
          localStorage.getItem("curUser"),
          SECRET_KEY
        );
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var i = 0; i < myResult.length; i++) {
          if (
            myResult[i].userId == userId &&
            myResult[i].programId == programId
          ) {
            var databytes = CryptoJS.AES.decrypt(
              myResult[i].programData.generalData,
              SECRET_KEY
            );
            var programData = databytes.toString(CryptoJS.enc.Utf8);
            var version = JSON.parse(programData).currentVersion;
            version.versionId = `${version.versionId} (Local)`;
            version.cutOffDate = JSON.parse(programData).cutOffDate || "";
            verList.push(version);
          }
        }
        let versionList = verList
          .filter((x, i, a) => a.indexOf(x) === i)
          .reverse();
        const savedVersion = localStorage.getItem("sesVersionIdReport");
        const versionId = versionList.some((c) => c.versionId == savedVersion)
          ? savedVersion
          : versionList[0].versionId;
        this.setState({ versions: versionList, versionId }, () => {
          this.getPlanningUnit();
        });
      }.bind(this);
    }.bind(this);
  };

  getPlanningUnit = () => {
    this.setState(
      { planningUnits: [], planningUnitValues: [], loading: true },
      () => {
        if (!(localStorage.getItem("sessionType") === "Online")) {
          var db1;
          getDatabase();
          var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
          openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitRequest = db1
              .transaction(["programPlanningUnit"], "readwrite")
              .objectStore("programPlanningUnit")
              .getAll();
            planningunitRequest.onsuccess = function (e) {
              var myResult = planningunitRequest.result;
              var programId = this.state.programValues[0].value;
              var proList = myResult
                .filter((r) => r.program.id == programId && r.active == true)
                .map((r) => r.planningUnit);
              this.setState({ planningUnits: proList, message: "" }, () => {
                this.fetchData();
              });
            }.bind(this);
          }.bind(this);
        } else {
          let programValues = this.state.programValues.map((c) => c.value);
          this.setState(
            {
              planningUnits: [],
              planningUnitValues: [],
              planningUnitLabels: [],
            },
            () => {
              if (programValues.length > 0) {
                var programJson = {
                  tracerCategoryIds: [],
                  programIds: programValues,
                };
                DropdownService.getProgramPlanningUnitDropdownList(programJson)
                  .then((response) => {
                    var listArray = response.data.sort((a, b) =>
                      getLabelText(a.label, this.state.lang).toUpperCase() >
                        getLabelText(b.label, this.state.lang).toUpperCase()
                        ? 1
                        : -1
                    );
                    this.setState({ planningUnits: listArray }, () => {
                      this.fetchData();
                    });
                  })
                  .catch(() => {
                    this.setState({ planningUnits: [] });
                  });
              }
            }
          );
        }
      }
    );
  };

  handlePlanningUnitChange = (planningUnitIds) => {
    planningUnitIds = planningUnitIds.sort(
      (a, b) => parseInt(a.value) - parseInt(b.value)
    );
    this.setState(
      {
        planningUnitValues: planningUnitIds.map((ele) => ele),
        planningUnitLabels: planningUnitIds.map((ele) => ele.label),
        data: {
          planningUnitQuantity: [],
          fspaCostAndPerc: [],
          fspaProgramSplit: [],
          fspaCountrySplit: [],
        },
      },
      () => {
        // this.fetchData();
      }
    );
  };

  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => {
      this.fetchData();
    });
  }
  _handleClickRangeBox(e) {
    this.refs.pickRange.show();
  }
  loading = () => (
    <div className="animated fadeIn pt-1 text-center">
      {i18n.t("static.common.loading")}
    </div>
  );

  handleFundingSourceChange(fundingSourceIds) {
    fundingSourceIds = fundingSourceIds.sort(
      (a, b) => parseInt(a.value) - parseInt(b.value)
    );
    this.setState(
      {
        fundingSourceValues: fundingSourceIds.map((ele) => ele),
        fundingSourceLabels: fundingSourceIds.map((ele) => ele.label),
        data: {
          planningUnitQuantity: [],
          fspaCostAndPerc: [],
          fspaProgramSplit: [],
          fspaCountrySplit: [],
        },
      },
      () => {
        // this.fetchData();
      }
    );
  }

  handleShipmentStatusChange(shipmentStatusIds) {
    shipmentStatusIds = shipmentStatusIds.sort(
      (a, b) => parseInt(a.value) - parseInt(b.value)
    );
    this.setState(
      {
        shipmentStatusValues: shipmentStatusIds.map((ele) => ele),
        shipmentStatusLabels: shipmentStatusIds.map((ele) => ele.label),
        data: {
          planningUnitQuantity: [],
          fspaCostAndPerc: [],
          fspaProgramSplit: [],
          fspaCountrySplit: [],
        },
      },
      () => {
        // this.fetchData();
      }
    );
  }

  setProcurementAgentTypeId(e) {
    var procurementAgentTypeId = e.target.checked;
    this.setState(
      {
        procurementAgentTypeId,
        groupByFundingSourceType: procurementAgentTypeId
          ? false
          : this.state.groupByFundingSourceType,
      },
      () => {
        this.fetchData();
      }
    );
  }

  setGroupByValues(e) {
    var groupByValue = e.target.value;
    var procurementAgentTypeId = groupByValue == 1 || groupByValue == 3;
    var groupByFundingSourceType = groupByValue == 2 || groupByValue == 3;
    this.setState(
      {
        procurementAgentTypeId,
        groupByFundingSourceType,
        groupBy: groupByValue,
      },
      () => {
        this.fetchData();
      }
    );
  }

  setVersionId(event) {
    var versionLabel = document
      .getElementById("versionId")
      .selectedOptions[0].text.toString();
    this.setState({ versionLabel, versionId: event.target.value }, () => {
      if (this.state.versionId != "" && this.state.versionId != 0) {
        localStorage.setItem("sesVersionIdReport", this.state.versionId);
        this.getPlanningUnit();
        this.fetchData();
      }
    });
  }

  // ------------------------------------------------------------------
  // render
  // ------------------------------------------------------------------
  render() {
    const { isDarkMode } = this.state;
    const fontColor = isDarkMode ? "#e4e5e6" : "#212721";
    const gridLineColor = isDarkMode ? "#444" : "#e0e0e0";

    // ---- chart options (unchanged) ----
    const options = {
      plugins: { datalabels: { formatter: () => "" } },
      title: {
        display: true,
        text:
          i18n.t("static.shipmentOverview.planningUnitQuantityByPU") +
          " " +
          (this.state.viewById == 1
            ? i18n.t("static.fundingSourceHead.fundingSource")
            : i18n.t("static.report.procurementAgentName")),
        fontColor,
      },
      scales: {
        xAxes: [
          {
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: i18n.t("static.shipment.qty"),
              fontColor,
              fontStyle: "normal",
              fontSize: "12",
            },
            ticks: {
              beginAtZero: true,
              fontColor,
              callback: function (value) {
                var cell1 = value + "";
                var x = cell1.split(".");
                var x1 = x[0];
                var x2 = x.length > 1 ? "." + x[1] : "";
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                  x1 = x1.replace(rgx, "$1,$2");
                }
                return x1 + x2;
              },
            },
            gridLines: {
              display: false,
              lineWidth: 0,
              color: gridLineColor,
              zeroLineColor: gridLineColor,
            },
          },
        ],
        yAxes: [
          {
            stacked: true,
            labelString: i18n.t("static.common.product"),
            fontColor,
            ticks: {
              fontColor,
              fontSize: 11,
              callback: function (value) {
                return value.length > 40 ? value.substr(0, 40) + "..." : value;
              },
            },
            gridLines: { color: gridLineColor, zeroLineColor: gridLineColor },
          },
        ],
      },
      tooltips: {
        enabled: false,
        custom: CustomTooltips,
        filter: function (tooltipItem, data) {
          let value =
            data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          return value !== 0 && value !== "0" && value !== 0.0;
        },
        callbacks: {
          label: function (tooltipItem, data) {
            let value =
              data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            var cell1 = value + "";
            var x = cell1.split(".");
            var x1 = x[0];
            var x2 = x.length > 1 ? "." + x[1] : "";
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
              x1 = x1.replace(rgx, "$1,$2");
            }
            return (
              data.datasets[tooltipItem.datasetIndex].label + " : " + x1 + x2
            );
          },
        },
      },
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: "bottom",
        labels: { usePointStyle: true, fontColor },
      },
    };

    const darkModeColors = [
      "#A7C6ED",
      "#BA0C2F",
      "#118B70",
      "#EDB944",
      "#A7C6ED",
      "#20a8d8",
      "#6C6463",
      "#F48521",
      "#49A4A1",
      "#cfcdc9",
      "#A7C6ED",
      "#BA0C2F",
      "#118B70",
      "#EDB944",
      "#A7C6ED",
      "#20a8d8",
      "#6C6463",
      "#F48521",
      "#49A4A1",
      "#cfcdc9",
      "#A7C6ED",
      "#BA0C2F",
      "#118B70",
      "#EDB944",
      "#A7C6ED",
      "#20a8d8",
      "#6C6463",
      "#F48521",
      "#49A4A1",
      "#cfcdc9",
      "#A7C6ED",
      "#BA0C2F",
      "#118B70",
      "#EDB944",
      "#A7C6ED",
    ];
    const lightModeColors = [
      "#002F6C",
      "#BA0C2F",
      "#118B70",
      "#EDB944",
      "#A7C6ED",
      "#651D32",
      "#6C6463",
      "#F48521",
      "#49A4A1",
      "#212721",
      "#002F6C",
      "#BA0C2F",
      "#118B70",
      "#EDB944",
      "#A7C6ED",
      "#651D32",
      "#6C6463",
      "#F48521",
      "#49A4A1",
      "#212721",
      "#002F6C",
      "#BA0C2F",
      "#118B70",
      "#EDB944",
      "#A7C6ED",
      "#651D32",
      "#6C6463",
      "#F48521",
      "#49A4A1",
      "#212721",
      "#002F6C",
      "#BA0C2F",
      "#118B70",
      "#EDB944",
      "#A7C6ED",
    ];
    const backgroundColor1 = isDarkMode ? darkModeColors : lightModeColors;

    const planningUnitQuantity = [
      ...(this.state.data.planningUnitQuantity || []),
    ].sort((a, b) => {
      var A = (
        getLabelText(a.planningUnit.label, this.state.lang) +
        " | " +
        a.planningUnit.id
      ).toUpperCase();
      var B = (
        getLabelText(b.planningUnit.label, this.state.lang) +
        " | " +
        b.planningUnit.id
      ).toUpperCase();
      return A > B ? 1 : -1;
    });
    const labels = planningUnitQuantity.map(
      (item) =>
        getLabelText(item.planningUnit.label, this.state.lang) +
        " | " +
        item.planningUnit.id
    );
    const allFspaCodes = [
      ...new Set(
        planningUnitQuantity.flatMap((item) =>
          Object.keys(item.fspaQuantity || {})
        )
      ),
    ].sort((a, b) =>
      a.toString().toUpperCase() > b.toString().toUpperCase() ? 1 : -1
    );
    const datasets = allFspaCodes.map((code, index) => ({
      label: code,
      data: planningUnitQuantity.map((item) =>
        roundARU((item.fspaQuantity && item.fspaQuantity[code]) || 0, 1)
      ),
      backgroundColor: backgroundColor1[index % backgroundColor1.length],
      borderWidth: 0,
    }));
    const chartData = { labels, datasets };

    const usaidColors = isDarkMode ? darkModeColors : lightModeColors;
    const fspaCostAndPercSorted = [
      ...(this.state.data.fspaCostAndPerc || []),
    ].sort((a, b) =>
      (a.fspa ? a.fspa.code : "N/A") > (b.fspa ? b.fspa.code : "N/A") ? 1 : -1
    );
    const pieLabels = [
      ...new Set(
        fspaCostAndPercSorted.map((ele) => (ele.fspa ? ele.fspa.code : "N/A"))
      ),
    ];
    const chartDataForPie = {
      labels: pieLabels,
      datasets: [
        {
          data: fspaCostAndPercSorted.map((ele) => ele.cost),
          backgroundColor: usaidColors.slice(0, pieLabels.length),
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    };

    const optionsPie = {
      layout: {
        padding: {
          left: 50,
          right: 50,
          top: 0,
          bottom: 0,
        },
      },
      title: {
        display: true,
        text:
          i18n.t("static.shipment.totalCost") +
          " by " +
          (this.state.viewById == 1
            ? i18n.t("static.fundingSourceHead.fundingSource")
            : i18n.t("static.report.procurementAgentName")),
        fontColor,
      },
      legend: {
        position: "bottom",
        labels: { fontColor, usePointStyle: true },
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItems, data) {
            var value =
              data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index];
            return (
              data.labels[tooltipItems.index] + " : $ " + value.toLocaleString()
            );
          },
        },
      },
      plugins: { datalabels: { display: false } },
    };

    const pickerLangLocal = {
      months: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      from: "From",
      to: "To",
      fontColor,
    };
    const { rangeValue } = this.state;

    const { versions } = this.state;
    let versionList =
      versions.length > 0 &&
      versions.map((item, i) => (
        <option key={i} value={item.versionId}>
          {item.versionId}
        </option>
      ));

    const { programLst } = this.state;
    let programList =
      programLst.length > 0 &&
      programLst.map((item) => ({ label: item.code, value: item.id }));

    const { countrys } = this.state;
    let countryList =
      countrys.length > 0 &&
      countrys.map((item) => ({
        label: getLabelText(item.label, this.state.lang),
        value: item.id,
      }));

    const { planningUnits } = this.state;
    let planningUnitList =
      planningUnits.length > 0 &&
      planningUnits.map((item) => ({
        label: getLabelText(item.label, this.state.lang),
        value: item.id,
      }));

    const { fundingSources } = this.state;
    let fundingSourceList =
      fundingSources.length > 0 &&
      fundingSources.map((item) => ({ label: item.code, value: item.id }));

    const { procurementAgents } = this.state;
    let procurementAgentListDD =
      procurementAgents.length > 0 &&
      procurementAgents.map((item) => ({ label: item.code, value: item.id }));

    const { shipmentStatuses } = this.state;
    let shipmentStatusList =
      shipmentStatuses.length > 0 &&
      shipmentStatuses.map((item) => ({
        label: getLabelText(item.label, this.state.lang),
        value: item.shipmentStatusId,
      }));

    const dataAvailable =
      this.state.data.planningUnitQuantity.length > 0 ||
      this.state.data.fspaCostAndPerc.length > 0 ||
      this.state.data.fspaCountrySplit.length > 0;
    const tableDataAvailable =
      (this.state.aggregateByCountry
        ? this.state.data.fspaCountrySplit
        : this.state.data.fspaProgramSplit) &&
      (this.state.aggregateByCountry
        ? this.state.data.fspaCountrySplit
        : this.state.data.fspaProgramSplit
      ).length > 0;

    return (
      <div className="animated fadeIn">
        <AuthenticationServiceComponent history={this.props.history} />
        <h6 className="mt-success">
          {i18n.t(this.props.match.params.message)}
        </h6>
        <h5 className="red">{i18n.t(this.state.message)}</h5>
        <Card>
          <div className="Card-header-reporticon">
            {dataAvailable && (
              <div className="card-header-actions">
                <a className="card-header-action">
                  <img
                    style={{ height: "25px", width: "25px", cursor: "pointer" }}
                    src={pdfIcon}
                    title="Export PDF"
                    onClick={() => {
                      var curTheme = localStorage.getItem("theme");
                      if (curTheme == "dark") {
                        this.setState({ isDarkMode: false }, () => {
                          setTimeout(() => {
                            this.exportPDF();
                            if (curTheme == "dark") {
                              this.setState({ isDarkMode: true });
                            }
                          }, 0);
                        });
                      } else {
                        this.exportPDF();
                      }
                    }}
                  />
                  <img
                    style={{ height: "25px", width: "25px", cursor: "pointer" }}
                    src={csvicon}
                    title={i18n.t("static.report.exportCsv")}
                    onClick={() => this.exportCSV()}
                  />
                </a>
              </div>
            )}
          </div>
          <CardBody className="pt-lg-0 pb-lg-0">
            <div ref={ref}>
              <Form>
                <div className="pl-0">
                  <div className="row">
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">
                        {i18n.t("static.report.dateRange")}
                        <span className="stock-box-icon fa fa-sort-desc ml-1"></span>
                      </Label>
                      <div className="controls">
                        <Picker
                          ref="pickRange"
                          years={{
                            min: this.state.minDate,
                            max: this.state.maxDate,
                          }}
                          value={rangeValue}
                          lang={pickerLangLocal}
                          onDismiss={this.handleRangeDissmis}
                        >
                          <MonthBox
                            value={
                              makeText(rangeValue.from) +
                              " ~ " +
                              makeText(rangeValue.to)
                            }
                            onClick={this._handleClickRangeBox}
                          />
                        </Picker>
                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="programIds">
                        {i18n.t("static.program.realmcountry")}
                      </Label>
                      <span className="reportdown-box-icon fa fa-sort-desc ml-1"></span>
                      <div className="controls">
                        <div onBlur={this.handleBlurCountry}>
                          <MultiSelect
                            bsSize="sm"
                            name="countryIds"
                            id="countryIds"
                            value={this.state.countryValues}
                            onChange={(e) => {
                              this.handleChange(e);
                            }}
                            options={
                              countryList && countryList.length > 0
                                ? countryList
                                : []
                            }
                            disabled={this.state.loading}
                            overrideStrings={{
                              allItemsAreSelected: i18n.t(
                                "static.common.allitemsselected"
                              ),
                              selectSomeItems: i18n.t("static.common.select"),
                            }}
                            filterOptions={filterOptions}
                          />
                        </div>
                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="programIds">
                        {i18n.t("static.program.program")}
                      </Label>
                      <span className="reportdown-box-icon fa fa-sort-desc ml-1"></span>
                      <div className="controls">
                        <div onBlur={this.handleBlurProgram}>
                          <MultiSelect
                            bsSize="sm"
                            name="programIds"
                            id="programIds"
                            value={this.state.programValues}
                            onChange={(e) => {
                              this.handleChangeProgram(e);
                            }}
                            options={
                              programList && programList.length > 0
                                ? programList
                                : []
                            }
                            disabled={this.state.loading}
                            overrideStrings={{
                              allItemsAreSelected: i18n.t(
                                "static.common.allitemsselected"
                              ),
                              selectSomeItems: i18n.t("static.common.select"),
                            }}
                            filterOptions={filterOptions}
                          />
                        </div>
                      </div>
                    </FormGroup>
                    {this.state.programValues.length == 1 && (
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">
                          {i18n.t("static.report.version")}
                        </Label>
                        <div className="controls">
                          <InputGroup>
                            <Input
                              type="select"
                              name="versionId"
                              id="versionId"
                              bsSize="sm"
                              value={this.state.versionId}
                              onChange={(e) => {
                                this.setVersionId(e);
                              }}
                            >
                              <option value="-1">
                                {i18n.t("static.common.select")}
                              </option>
                              {versionList}
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>
                    )}
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">
                        {i18n.t("static.report.planningUnit")}
                      </Label>
                      <span className="reportdown-box-icon fa fa-sort-desc ml-1"></span>
                      <div className="controls">
                        <div onBlur={this.handleBlur}>
                          <MultiSelect
                            name="planningUnitId"
                            id="planningUnitId"
                            bsSize="md"
                            value={this.state.planningUnitValues}
                            onChange={(e) => {
                              this.handlePlanningUnitChange(e);
                            }}
                            options={
                              planningUnitList && planningUnitList.length > 0
                                ? planningUnitList
                                : []
                            }
                            disabled={this.state.loading}
                            overrideStrings={{
                              allItemsAreSelected: i18n.t(
                                "static.common.allitemsselected"
                              ),
                              selectSomeItems: i18n.t("static.common.select"),
                            }}
                            filterOptions={filterOptions}
                          />
                        </div>
                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">
                        {i18n.t("static.common.display")}
                      </Label>
                      <div className="controls">
                        <InputGroup>
                          <Input
                            type="select"
                            name="viewById"
                            id="viewById"
                            bsSize="sm"
                            onChange={(e) => {
                              this.setViewById(e);
                            }}
                          >
                            <option value="1">
                              {i18n.t("static.fundingSourceHead.fundingSource")}
                            </option>
                            <option value="2">
                              {i18n.t("static.report.procurementAgentName")}
                            </option>
                          </Input>
                        </InputGroup>
                      </div>
                    </FormGroup>
                    {this.state.viewById == 1 && (
                      <FormGroup className="col-md-3" id="fundingSourceDiv">
                        <Label htmlFor="appendedInputButton">
                          {i18n.t("static.budget.fundingsource")}
                        </Label>
                        <span className="reportdown-box-icon fa fa-sort-desc ml-1"></span>
                        <div className="controls">
                          <div onBlur={this.handleBlur}>
                            <MultiSelect
                              name="fundingSourceId"
                              id="fundingSourceId"
                              bsSize="sm"
                              value={this.state.fundingSourceValues}
                              onChange={(e) => {
                                this.handleFundingSourceChange(e);
                              }}
                              options={
                                fundingSourceList &&
                                  fundingSourceList.length > 0
                                  ? fundingSourceList
                                  : []
                              }
                              disabled={this.state.loading}
                              overrideStrings={{
                                allItemsAreSelected: i18n.t(
                                  "static.common.allitemsselected"
                                ),
                                selectSomeItems: i18n.t("static.common.select"),
                              }}
                              filterOptions={filterOptions}
                            />
                          </div>
                        </div>
                      </FormGroup>
                    )}
                    {this.state.viewById == 2 && (
                      <FormGroup className="col-md-3" id="paDiv">
                        <Label htmlFor="appendedInputButton">
                          {i18n.t("static.report.procurementAgentName")}
                        </Label>
                        <span className="reportdown-box-icon fa fa-sort-desc ml-1"></span>
                        <div className="controls">
                          <div onBlur={this.handleBlur}>
                            <MultiSelect
                              name="procurementAgentId"
                              id="procurementAgentId"
                              bsSize="md"
                              value={this.state.procurementAgentValues}
                              filterOptions={filterOptions}
                              onChange={(e) => {
                                this.handleProcurementAgentChange(e);
                              }}
                              options={
                                procurementAgentListDD &&
                                  procurementAgentListDD.length > 0
                                  ? procurementAgentListDD
                                  : []
                              }
                              disabled={this.state.loading}
                              overrideStrings={{
                                allItemsAreSelected: i18n.t(
                                  "static.common.allitemsselected"
                                ),
                                selectSomeItems: i18n.t("static.common.select"),
                              }}
                            />
                          </div>
                        </div>
                      </FormGroup>
                    )}
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">
                        {i18n.t("static.common.status")}
                      </Label>
                      <span className="reportdown-box-icon fa fa-sort-desc ml-1"></span>
                      <div className="controls">
                        <div onBlur={this.handleBlur}>
                          <MultiSelect
                            name="shipmentStatusId"
                            id="shipmentStatusId"
                            bsSize="sm"
                            value={this.state.shipmentStatusValues}
                            onChange={(e) => {
                              this.handleShipmentStatusChange(e);
                            }}
                            options={
                              shipmentStatusList &&
                                shipmentStatusList.length > 0
                                ? shipmentStatusList
                                : []
                            }
                            disabled={this.state.loading}
                            overrideStrings={{
                              allItemsAreSelected: i18n.t(
                                "static.common.allitemsselected"
                              ),
                              selectSomeItems: i18n.t("static.common.select"),
                            }}
                            filterOptions={filterOptions}
                          />
                        </div>
                      </div>
                    </FormGroup>
                  </div>
                </div>
              </Form>

              {this.state.data.planningUnitQuantity.length > 0 && (
                <span>
                  <i>{i18n.t("static.shipment.note")}</i>
                </span>
              )}
<br/>
              <div style={{ display: this.state.loading ? "none" : "block" }}>
                <Col md="12 pl-0">
                  <div
                    className="row grid-divider"
                    style={{ display: "flex", alignItems: "stretch" }}
                  >
                    {this.state.data.planningUnitQuantity.length > 0 && (
                      <Col md="8 pl-0" style={{ padding: "0" }}>
                        <div className="chart-wrapper shipmentOverviewgraphheight">
                          <HorizontalBar
                            key={`bar-${this.state.viewById
                              }-${allFspaCodes.join(",")}`}
                            id="cool-canvas1"
                            data={chartData}
                            options={options}
                          />
                        </div>
                      </Col>
                    )}
                    {this.state.data.fspaCostAndPerc.length > 0 && (
                      <Col md="4 pl-0" style={{ padding: "0" }}>
                        <div
                          className="chart-wrapper shipmentOverviewgraphheight"
                          style={{ width: "100%", position: "relative" }}
                        >
                          <Pie
                            key={`pie-${this.state.viewById}-${pieLabels.join(
                              ","
                            )}`}
                            id="cool-canvas2"
                            data={chartDataForPie}
                            options={{
                              ...optionsPie,
                              maintainAspectRatio: false,
                            }}
                          />
                        </div>
                      </Col>
                    )}
                  </div>
                </Col>
                <br />
                <Col md="12 pl-0 pb-lg-1">
                  <div className="globalviwe-scroll">
                    {tableDataAvailable && (
                      <div className="col-md-12 mt-2">
                        {/* Toolbar row: checkboxes on left, custom search on right */}
                        <div
                          className="d-flex align-items-center flex-wrap mb-1"
                          style={{ columnGap: "16px" }}
                        >
                          {this.state.programValues.length > 1 && (
                            <FormGroup
                              check
                              inline
                              style={{ paddingLeft: 0, margin: 0 }}
                            >
                              <Input
                                style={{ marginLeft: 0 }}
                                className="form-check-input"
                                type="checkbox"
                                id="aggregateByCountry"
                                name="aggregateByCountry"
                                checked={this.state.aggregateByCountry}
                                onChange={this.handleCheckboxChange}
                              />
                              <Label
                                className="form-check-label"
                                check
                                htmlFor="aggregateByCountry"
                              >
                                {i18n.t("static.shipment.aggregateByCountry")}
                              </Label>
                            </FormGroup>
                          )}
                          <FormGroup
                            check
                            inline
                            style={{ paddingLeft: 0, margin: 0 }}
                          >
                            <Input
                              style={{ marginLeft: 0 }}
                              className="form-check-input"
                              type="checkbox"
                              id="hideCalculations"
                              name="hideCalculations"
                              checked={this.state.hideCalculations}
                              onChange={this.handleCheckboxChange}
                            />
                            <Label
                              className="form-check-label"
                              check
                              htmlFor="hideCalculations"
                            >
                              {i18n.t("static.shipment.hideCalculations") ||
                                "Hide Calculations"}
                            </Label>
                          </FormGroup>
                          <FormGroup
                            check
                            inline
                            style={{ paddingLeft: 0, margin: 0 }}
                          >
                            <Input
                              style={{ marginLeft: 0 }}
                              className="form-check-input"
                              type="checkbox"
                              id="collapsePlanningUnits"
                              name="collapsePlanningUnits"
                              checked={this.state.collapsePlanningUnits}
                              onChange={this.handleCheckboxChange}
                            />
                            <Label
                              className="form-check-label"
                              check
                              htmlFor="collapsePlanningUnits"
                            >
                              {i18n.t(
                                "static.shipment.collapsePlanningUnits"
                              ) || "Collapse Planning Units"}
                            </Label>
                          </FormGroup>
                          <FormGroup
                            check
                            inline
                            style={{ paddingLeft: 0, margin: 0 }}
                          >
                            <Input
                              style={{ marginLeft: 0 }}
                              className="form-check-input"
                              type="checkbox"
                              id="collapseAll"
                              name="collapseAll"
                              checked={this.state.collapseAll}
                              onChange={this.handleCheckboxChange}
                            />
                            <Label
                              className="form-check-label"
                              check
                              htmlFor="collapseAll"
                            >
                              {"Collapse All"}
                            </Label>
                          </FormGroup>
                        </div>

                        <div
                          className={`${this.state.collapseAll
                            ? "Width40"
                            : this.state.collapsePlanningUnits
                              ? "Width60"
                              : "TableWidth100"
                            }`}
                          style={{
                            overflow: "visible",
                            position: "relative",
                          }}
                        >
                          <div
                            id="shipmentGlobalDemandTableDiv"
                            ref={this.tableDiv}
                            className="shipmentGlobalDemandTable jexcelremoveReadonlybackground TableWidth100"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
              </div>

              <div style={{ display: this.state.loading ? "block" : "none" }}>
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ height: "500px" }}
                >
                  <div className="align-items-center">
                    <div>
                      <h4>
                        <strong>{i18n.t("static.common.loading")}</strong>
                      </h4>
                    </div>
                    <div
                      className="spinner-border blue ml-4"
                      role="status"
                    ></div>
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

export default ShipmentGlobalDemandView;
