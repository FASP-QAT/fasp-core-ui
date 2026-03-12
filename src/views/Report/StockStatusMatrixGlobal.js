import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import jsPDF from "jspdf";
import "jspdf-autotable";
import CryptoJS from 'crypto-js';
import moment from "moment";
import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import Picker from 'react-month-picker';
import { MultiSelect } from 'react-multi-select-component';
import jexcel from 'jspreadsheet';
import { jExcelLoadedFunction, onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import {
    Card,
    CardBody,
    Col,
    Form,
    FormGroup, Input, InputGroup,
    Label,
    Table
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import "../../scss/shipmentsByCountry.scss"
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP_FOUR_DIGITS, MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH, JEXCEL_PRO_KEY, JEXCEL_PAGINATION_OPTION, JEXCEL_DEFAULT_PAGINATION, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, dateFormatterLanguage, filterOptions, makeText } from '../../CommonComponent/JavascriptCommonFunctions.js';
import WorldMap from '../../CommonComponent/WorldMap.js';
const ref = React.createRef();
function getColumnLetter(index) {
    let letter = '';
    while (index >= 0) {
        letter = String.fromCharCode((index % 26) + 65) + letter;
        index = Math.floor(index / 26) - 1;
    }
    return letter;
}
const legendcolor = [
  { text: i18n.t("static.report.stockout"), color: "#BA0C2F", value: 0 },
  { text: i18n.t("static.report.lowstock"), color: "#f48521", value: 1 },
  { text: i18n.t("static.report.okaystock"), color: "#118b70", value: 2 },
  { text: i18n.t("static.report.overstock"), color: "#edb944", value: 3 },
  { text: i18n.t("static.supplyPlanFormula.na"), color: "#cfcdc9", value: 4 },
];

// ─── PDF Icon Helpers ─────────────────────────────────────────────────────────
/**
 * Renders a FontAwesome glyph to a PNG data URL via an offscreen canvas.
 */
function renderFaIconToDataUrl(glyphChar, color, sizePx = 28) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width  = sizePx;
    canvas.height = sizePx;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, sizePx, sizePx);
    ctx.font = `900 ${sizePx * 0.85}px "Font Awesome 5 Free", "FontAwesome"`;
    ctx.fillStyle = color;
    ctx.textAlign  = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(glyphChar, sizePx / 2, sizePx / 2);
    return { dataUrl: canvas.toDataURL("image/png"), widthPt: 10 };
  } catch (_) {
    return null;
  }
}

/**
 * Pre-renders truck and warning icons once for the export duration.
 */
function buildPdfIconCache() {
  return {
    truck:   renderFaIconToDataUrl("\uf0d1", "#BA0C2F", 28),
    warning: renderFaIconToDataUrl("\uf071", "#ED8944", 28),
  };
}


/**
 * Component for Shipment Global View Report.
 */
class StockStatusMatrixGlobal extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            isDarkMode: false,
            labels: ['GF', 'Govt', 'Local', 'PSM'],
            datasets: [{
                data: [13824000, 26849952, 0, 5615266],
                backgroundColor: ['#F48521', '#118b70', '#002f6c', '#EDB944']
            }],
            dropdownOpen: false,
            radioSelected: 2,
            lang: localStorage.getItem('lang'),
            countrys: [],
            planningUnits: [],
            consumptions: [],
            countryValues: [],
            countryLabels: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            programValues: [],
            programLabels: [],
            programs: [],
            message: '',
            countrySplitList: [],
            countryShipmentSplitList: [],
            versions: [],
            versionId: 0,
            data:
            {
                countrySplitList: [],
                countryShipmentSplitList: []
            },
            lab: [],
            val: [],
            realmList: [],
            table1Body: [],
            table1Headers: [],
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS, month: new Date().getMonth() + 1 },
            loading: true,
            programLst: [],
            puUnit: {
                label: {
                    label_en: ''
                }
            },
            equivalencyUnitList: [],
            programEquivalencyUnitList: [],
            yaxisEquUnit: -1,
            forecastingUnits: [],
            allForecastingUnits: [],
            forecastingUnitValues: [],
            forecastingUnitLabels: [],
            planningUnitList: [],
            planningUnitListAll: [],
            planningUnitId: [],
            shipmentJexcel: '',
            hideIcons: false,
            yaxisEquUnitLabel: [i18n.t('static.program.no')],
            noData: false,
            removePlannedShipments: false,
            removeTbdFundingSource: false,
            aggregateCountries: false,
            viewBy: 1,
            stockStatusValues: legendcolor.map(item => ({ value: item.value, label: item.text }))
        };
        this.getCountrys = this.getCountrys.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.handleChange = this.handleChange.bind(this)
        this.handleChangeProgram = this.handleChangeProgram.bind(this)
        this.filterProgram = this.filterProgram.bind(this);
        this.yAxisChange = this.yAxisChange.bind(this);
        this.setRemovePlannedShipments = this.setRemovePlannedShipments.bind(this);
        this.setRemoveTBD = this.setRemoveTBD.bind(this);
        this.setAggregateCountries = this.setAggregateCountries.bind(this);
        this.setViewBy = this.setViewBy.bind(this);
        this.setStockStatusId = this.setStockStatusId.bind(this);
        this.buildShipmentJexcel = this.buildShipmentJexcel.bind(this);
    }
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
    }
    /**
     * Exports the data to a CSV file.
     */
    exportCSV() {
        let responseData = this.state.data;
        let dataList = responseData.dataList;
        let showByQty = this.state.viewBy == 2;
        let allDates = new Set();
        dataList.forEach(item => {
            Object.keys(item.dataMap).forEach(date => allDates.add(date));
        });
        let sortedDates = Array.from(allDates).sort();

        let csvRow = [];
        csvRow.push(addDoubleQuoteToRowContent([i18n.t('static.dashboard.stockstatusmatrix') + " (Global)"]));
        csvRow.push(addDoubleQuoteToRowContent([i18n.t('static.report.dateRange') + " : " + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)]));
        csvRow.push(addDoubleQuoteToRowContent([i18n.t('static.program.realmcountry') + " : " + this.state.countryLabels.join("; ")]));
        csvRow.push(addDoubleQuoteToRowContent([i18n.t('static.program.program') + " : " + this.state.programLabels.join("; ")]));
        if (this.state.programValues.length == 1) {
            csvRow.push(addDoubleQuoteToRowContent([i18n.t('static.report.version') + " : " + this.state.versionLabel]));
        }
        csvRow.push(addDoubleQuoteToRowContent([i18n.t("static.shipmentReport.yAxisInEquivalencyUnit") + " : " + (this.state.yaxisEquUnit != -1 ? this.state.yaxisEquUnitLabel : i18n.t('static.program.no'))]));
        csvRow.push(addDoubleQuoteToRowContent([i18n.t('static.report.planningUnit') + " : " + this.state.planningUnitLabels.join("; ")]));
        csvRow.push(addDoubleQuoteToRowContent([i18n.t("static.report.withinstock") + " : " + this.state.stockStatusValues.map(ele => ele.label).join("; ")]));
        csvRow.push(addDoubleQuoteToRowContent(["Show by" + " : " + (this.state.viewBy == 1 ? i18n.t('static.report.mos') : i18n.t('static.report.quantity'))]));
        csvRow.push(addDoubleQuoteToRowContent([i18n.t('static.report.removePlannedShipments') + " : " + (this.state.removePlannedShipments ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False'))]));
        csvRow.push(addDoubleQuoteToRowContent([i18n.t('static.report.removeTBDFundingSourceShipments') + " : " + (this.state.removeTbdFundingSource ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False'))]));
        csvRow.push(addDoubleQuoteToRowContent(["Aggregate Countries" + " : " + (this.state.aggregateCountries ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False'))]));
        csvRow.push(addDoubleQuoteToRowContent(["Hide Icons" + " : " + (this.state.hideIcons ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False'))]));
        const reportTitle = (this.state.yaxisEquUnit != -1 && this.state.yaxisEquUnit != "-1")
            ? i18n.t("static.equivalancyUnit.equivalancyUnits") + " : " + (Array.isArray(this.state.yaxisEquUnitLabel) ? this.state.yaxisEquUnitLabel.join("; ") : this.state.yaxisEquUnitLabel)
            : i18n.t('static.report.planningUnit') + " : " + (Array.isArray(this.state.planningUnitLabels) ? this.state.planningUnitLabels.join("; ") : this.state.planningUnitLabels);
        csvRow.push("");
        csvRow.push(addDoubleQuoteToRowContent([reportTitle]));
        csvRow.push("");
        let isEquUnitMode = this.state.yaxisEquUnit != -1 && this.state.yaxisEquUnit != "-1";
        let headerRow = [this.state.aggregateCountries ? i18n.t('static.dashboard.country') : i18n.t('static.dashboard.program')];
        if (isEquUnitMode) {
            headerRow.push(i18n.t('static.modelingValidation.puLevel'));
        }
        headerRow.push(...sortedDates.map(date => moment(date).format('MMM YY')));
        csvRow.push(addDoubleQuoteToRowContent(headerRow));

        dataList.forEach(item => {
            let row = [];
            row.push(getLabelText(item.programOrCountry.label, this.state.lang));
            if (isEquUnitMode) {
                let puIds = new Set();
                sortedDates.forEach(date => {
                    if (item.dataMap[date] && item.dataMap[date].planningUnitIds) {
                        item.dataMap[date].planningUnitIds.split(',').forEach(id => puIds.add(id));
                    }
                });
                row.push(Array.from(puIds).join(', '));
            }
            sortedDates.forEach(date => {
                let dataEntry = item.dataMap[date];
                if (dataEntry) {
                    let val = showByQty ? dataEntry.closingBalance : dataEntry.mos;
                    row.push(val !== null && val !== undefined ? (val % 1 === 0 ? val : val.toFixed(1)) : "N/A");
                } else {
                    row.push("N/A");
                }
            });
            csvRow.push(addDoubleQuoteToRowContent(row));
        });

        csvRow.push("");
        let uniquePUs = new Set();
        dataList.forEach(item => {
            Object.values(item.dataMap).forEach(dataEntry => {
                if (dataEntry.planningUnitIds) {
                    dataEntry.planningUnitIds.split(',').forEach(pu => {
                        let trimmed = pu.trim();
                        if (trimmed) uniquePUs.add(trimmed);
                    });
                }
            });
        });
        Array.from(uniquePUs).sort().forEach(puId => {
            let puObj = (this.state.planningUnitListAll || []).find(p => p.id == puId);
            if (puObj) {
                let labelText = getLabelText(puObj.label, this.state.lang);
                csvRow.push(addDoubleQuoteToRowContent([puObj.id + " " + labelText]));
            } else {
                let parts = puId.split(' | ');
                let formattedStr = parts.length > 1 ? parts[1] + " " + parts[0] : puId;
                csvRow.push(addDoubleQuoteToRowContent([formattedStr]));
            }
        });

        let csvString = csvRow.join("\r\n");
        let a = document.createElement("a");
        a.href = "data:attachment/csv," + encodeURIComponent(csvString);
        a.target = "_Blank";
        a.download = i18n.t('static.dashboard.stockstatusmatrix') + " (Global)" + ".csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
    /**
     * Exports the data to a PDF file.
     */
    exportPDF = async () => {
        const iconCache = buildPdfIconCache();
        const ICON_PT = 8;
        const ICON_GAP = 2;

        const addFooters = (doc) => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6);
            for (var i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setPage(i);
                doc.text(
                    "Page " + String(i) + " of " + String(pageCount),
                    doc.internal.pageSize.width / 9,
                    doc.internal.pageSize.height - 30,
                    {
                        align: "center",
                    }
                );
                doc.text(
                    "Copyright © 2020 " + i18n.t("static.footer"),
                    (doc.internal.pageSize.width * 6) / 7,
                    doc.internal.pageSize.height - 30,
                    {
                        align: "center",
                    }
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
                    i18n.t("static.dashboard.stockstatusmatrix") + " (Global)",
                    doc.internal.pageSize.width / 2,
                    75,
                    {
                        align: "center",
                    }
                );
                if (i == 1) {
                    doc.setFontSize(8);
                    doc.setFont("helvetica", "normal");
                    doc.text(
                        i18n.t("static.report.dateRange") +
                        " : " +
                        makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to),
                        doc.internal.pageSize.width / 8,
                        105,
                        {
                            align: "left",
                        }
                    );
                    doc.text(
                        i18n.t("static.program.realmcountry") +
                        " : " +
                        this.state.countryLabels.join("; "),
                        doc.internal.pageSize.width / 8,
                        120,
                        {
                            align: "left",
                        }
                    );
                    doc.text(
                        i18n.t("static.program.program") +
                        " : " +
                        this.state.programLabels.join("; "),
                        doc.internal.pageSize.width / 8,
                        135,
                        {
                            align: "left",
                        }
                    );
                    if (this.state.programValues.length == 1) {
                        doc.text(
                            i18n.t("static.report.version") + " : " + this.state.versionLabel,
                            doc.internal.pageSize.width / 8,
                            150,
                            { align: "left" }
                        );
                    }
                    doc.text(
                        i18n.t("static.shipmentReport.yAxisInEquivalencyUnit") + " : " + (this.state.yaxisEquUnit != -1 ? this.state.yaxisEquUnitLabel : i18n.t('static.program.no')),
                        doc.internal.pageSize.width / 8,
                        165,
                        { align: "left" }
                    );
                    doc.text(
                        i18n.t("static.report.planningUnit") + " : " + this.state.planningUnitLabels.join("; "),
                        doc.internal.pageSize.width / 8,
                        180,
                        { align: "left" }
                    );
                    doc.text(
                        i18n.t("static.report.withinstock") + " : " + this.state.stockStatusValues.map(ele => ele.label).join("; "),
                        doc.internal.pageSize.width / 8,
                        195,
                        { align: "left" }
                    );
                    doc.text(
                        "Show by" + " : " + (this.state.viewBy == 1 ? i18n.t('static.report.mos') : i18n.t('static.report.quantity')),
                        doc.internal.pageSize.width / 8,
                        210,
                        { align: "left" }
                    );
                    doc.text(
                        i18n.t('static.report.removePlannedShipments') + " : " + (this.state.removePlannedShipments ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False')),
                        doc.internal.pageSize.width / 8,
                        225,
                        { align: "left" }
                    );
                    doc.text(
                        i18n.t('static.report.removeTBDFundingSourceShipments') + " : " + (this.state.removeTbdFundingSource ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False')),
                        doc.internal.pageSize.width / 8,
                        240,
                        { align: "left" }
                    );
                    doc.text(
                        "Aggregate Countries" + " : " + (this.state.aggregateCountries ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False')),
                        doc.internal.pageSize.width / 8,
                        255,
                        { align: "left" }
                    );
                    doc.text(
                        "Hide Icons" + " : " + (this.state.hideIcons ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False')),
                        doc.internal.pageSize.width / 8,
                        270,
                        { align: "left" }
                    );

                    const reportTitle = (this.state.yaxisEquUnit != -1 && this.state.yaxisEquUnit != "-1")
                        ? i18n.t("static.equivalancyUnit.equivalancyUnits") + " : " + (Array.isArray(this.state.yaxisEquUnitLabel) ? this.state.yaxisEquUnitLabel.join("; ") : this.state.yaxisEquUnitLabel)
                        : i18n.t('static.report.planningUnit') + " : " + (Array.isArray(this.state.planningUnitLabels) ? this.state.planningUnitLabels.join("; ") : this.state.planningUnitLabels);

                    doc.setFont("helvetica", "bold");
                    doc.setTextColor("#002f6c");
                    doc.text(
                        reportTitle,
                        doc.internal.pageSize.width / 8,
                        290,
                        { align: "left" }
                    );
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(0);

                    let y = 315;
                    legendcolor.forEach((item, index) => {
                        doc.setDrawColor(0);
                        doc.setFillColor(item.color);
                        doc.rect(doc.internal.pageSize.width / 8 + (index * 90), y, 12, 12, "F");
                        doc.setTextColor(0);
                        doc.setFont("helvetica", "normal");
                        doc.setFontSize(8);
                        doc.text(item.text, doc.internal.pageSize.width / 8 + (index * 90) + 15, y + 10);
                    });
                    
                    if (iconCache.truck) {
                        doc.addImage(iconCache.truck.dataUrl, 'PNG', doc.internal.pageSize.width / 8 + (5 * 90) - 15, y + 2, ICON_PT, ICON_PT);
                    }
                    doc.setTextColor(0);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(8);
                    doc.text(i18n.t('static.shipment.shipment'), doc.internal.pageSize.width / 8 + (5 * 90), y + 10);
                    
                    if (iconCache.warning) {
                        doc.addImage(iconCache.warning.dataUrl, 'PNG', doc.internal.pageSize.width / 8 + (5 * 90) + 95, y + 2, ICON_PT, ICON_PT);
                    }
                    doc.setTextColor(0);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(8);
                    doc.text(i18n.t('static.supplyPlan.expiry'), doc.internal.pageSize.width / 8 + (5 * 90) + 110, y + 10);
                }
            }
        };

        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const doc = new jsPDF(orientation, unit, size);
        doc.setFontSize(8);

        let responseData = this.state.data;
        let dataList = responseData.dataList;
        let showByQty = this.state.viewBy == 2;
        let allDates = new Set();
        dataList.forEach(item => {
            Object.keys(item.dataMap).forEach(date => allDates.add(date));
        });
        let sortedDates = Array.from(allDates).sort();

        let isEquUnitMode = this.state.yaxisEquUnit != -1 && this.state.yaxisEquUnit != "-1";
        const colOffset = isEquUnitMode ? 2 : 1;
        let headerCols = [
            { content: this.state.aggregateCountries ? i18n.t('static.dashboard.country') : i18n.t('static.dashboard.program'), styles: { halign: 'center' } }
        ];
        if (isEquUnitMode) {
            headerCols.push({ content: i18n.t('static.modelingValidation.puLevel'), styles: { halign: 'center' } });
        }
        headerCols.push(...sortedDates.map(date => ({ content: moment(date).format('MMM YY'), styles: { halign: 'center' } })));
        let header = [headerCols];

        let dataIcons = dataList.map(item => {
            return sortedDates.map(date => {
                let dataEntry = item.dataMap[date];
                if (dataEntry && !this.state.hideIcons) {
                    return {
                        hasShipment: dataEntry.shipmentQty > 0,
                        hasExpiry: dataEntry.expiredQty > 0
                    };
                }
                return { hasShipment: false, hasExpiry: false };
            });
        });

        let data = dataList.map(item => {
            let row = [];
            row.push(getLabelText(item.programOrCountry.label, this.state.lang));
            if (isEquUnitMode) {
                let puIds = new Set();
                sortedDates.forEach(date => {
                    if (item.dataMap[date] && item.dataMap[date].planningUnitIds) {
                        item.dataMap[date].planningUnitIds.split(',').forEach(id => puIds.add(id));
                    }
                });
                row.push(Array.from(puIds).join(', '));
            }
            sortedDates.forEach(date => {
                let dataEntry = item.dataMap[date];
                if (dataEntry) {
                    let val = showByQty ? dataEntry.closingBalance : dataEntry.mos;
                    row.push(val !== null && val !== undefined ? (val % 1 === 0 ? val : val.toFixed(1)) : i18n.t("static.supplyPlanFormula.na"));
                } else {
                    row.push(i18n.t("static.supplyPlanFormula.na"));
                }
            });
            return row;
        });

        let dataColor = dataList.map(item => {
            return sortedDates.map(date => {
                let dataEntry = item.dataMap[date];
                if (dataEntry) {
                    let val = showByQty ? dataEntry.closingBalance : dataEntry.mos;
                    if (val === null || val === undefined) {
                        return '#cfcdc9';
                    }
                    let stockStatusId = dataEntry.stockStatusId;
                    let colorEntry = legendcolor.find(c => c.value === stockStatusId);
                    return colorEntry ? colorEntry.color : '#cfcdc9';
                } else {
                    return '#cfcdc9';
                }
            });
        });

        doc.autoTable({
            margin: { top: 80, bottom: 50 },
            startY: 360,
            head: header,
            body: data,
            styles: { lineWidth: 0.1, fontSize: 7, halign: 'center', valign: 'middle' },
            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'left' },
            },
            didParseCell: function (data) {
                if (data.section === 'body' && data.column.index >= colOffset) {
                    let color = dataColor[data.row.index][data.column.index - colOffset];
                    data.cell.styles.fillColor = color;
                    data.cell.styles.textColor = '#000';

                    let icons = dataIcons[data.row.index][data.column.index - colOffset];
                    let iconCount = (icons.hasShipment ? 1 : 0) + (icons.hasExpiry ? 1 : 0);
                    let rightPad = iconCount > 0 ? 4 + iconCount * (ICON_PT + ICON_GAP) : 4;
                    data.cell.styles.halign = 'right';
                    data.cell.styles.cellPadding = { left: 2, right: rightPad, top: 2, bottom: 2 };
                }
            },
            didDrawCell: function (data) {
                if (data.section === 'body' && data.column.index >= colOffset) {
                    let icons = dataIcons[data.row.index][data.column.index - colOffset];
                    if (icons.hasShipment || icons.hasExpiry) {
                        let iconCount = (icons.hasShipment ? 1 : 0) + (icons.hasExpiry ? 1 : 0);
                        let totalIconWidth = iconCount * (ICON_PT + ICON_GAP) - ICON_GAP;
                        let iconX = data.cell.x + data.cell.width - totalIconWidth - 3;
                        const iconY = data.cell.y + (data.cell.height - ICON_PT) / 2;

                        if (icons.hasShipment && iconCache.truck) {
                            doc.addImage(iconCache.truck.dataUrl, "PNG", iconX, iconY, ICON_PT, ICON_PT);
                            iconX += ICON_PT + ICON_GAP;
                        }
                        if (icons.hasExpiry && iconCache.warning) {
                            doc.addImage(iconCache.warning.dataUrl, "PNG", iconX, iconY, ICON_PT, ICON_PT);
                        }
                    }
                }
            }
        });

        let finalY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor("#002f6c");
        
        let uniquePUs = new Set();
        dataList.forEach(item => {
            Object.values(item.dataMap).forEach(dataEntry => {
                if (dataEntry.planningUnitIds) {
                    dataEntry.planningUnitIds.split(',').forEach(pu => {
                        let trimmed = pu.trim();
                        if (trimmed) uniquePUs.add(trimmed);
                    });
                }
            });
        });

        Array.from(uniquePUs).sort().forEach((puId, index) => {
            let puObj = (this.state.planningUnitListAll || []).find(p => p.id == puId);
            let formattedStr = "";
            if (puObj) {
                formattedStr = puObj.id + " " + getLabelText(puObj.label, this.state.lang);
            } else {
                let parts = puId.split(' | ');
                formattedStr = parts.length > 1 ? parts[1] + " " + parts[0] : puId;
            }
            
            // Check for page overflow
            if (finalY > doc.internal.pageSize.height - 50) {
                doc.addPage();
                finalY = 50;
            }
            
            doc.text(formattedStr, doc.internal.pageSize.width / 8, finalY);
            finalY += 15;
        });
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);

        addHeaders(doc);
        addFooters(doc);
        doc.save(i18n.t("static.dashboard.stockstatusmatrix") + " (Global)" + ".pdf");
    }
    /**
     * Handles the change event for program selection.
     * @param {array} programIds - The array of selected program IDs.
     */
    handleChangeProgram(programIds) {
        programIds = programIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            programValues: programIds.map(ele => ele),
            programLabels: programIds.map(ele => ele.label).sort((a, b) => a.localeCompare(b))
        }, () => {
            this.filterVersion();
            this.getDropdownLists();
            this.fetchData()
        })
    }
    /**
     * Retrieves the list of countries based on the realm ID and updates the state with the list.
     */
    getCountrys() {
        this.setState({
            loading: true
        })
        let realmId = AuthenticationService.getRealmId();
        DropdownService.getRealmCountryDropdownList(realmId)
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    countrys: listArray,
                    countryValues: [],
                    countryLabels: [],
                    loading: false
                }, () => {
                })
            }).catch(
                error => {
                    this.setState({
                        countrys: []
                    })
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 409:
                                this.setState({
                                    message: i18n.t('static.common.accessDenied'),
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Calls the get countrys function on page load
     */
    componentDidMount() {
        // Detect initial theme
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        this.setState({ isDarkMode });

        // Listening for theme changes
        const observer = new MutationObserver(() => {
            const updatedDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
            this.setState({ isDarkMode: updatedDarkMode });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        this.getCountrys();
    }
    getDropdownLists() {
        var json = {
        programIds: this.state.programValues.map(ele => ele.value),
        onlyAllowPuPresentAcrossAllPrograms: this.state.onlyShowAllPUs
        }
        ReportService.getDropdownListByProgramIds(json).then(response => {
            const newPlanningUnitList = response.data.planningUnitList;
            const prevSelectedIds = this.state.planningUnitId.map(ele => ele.value || ele); // handles both object and value
            const filteredPlanningUnitId = newPlanningUnitList
                .filter(pu => prevSelectedIds.includes(pu.id))
                .map(pu => ({ label: getLabelText(pu.label, this.state.lang) + " | " + pu.id, value: pu.id }));
            this.setState({
                equivalencyUnitList: response.data.equivalencyUnitList,
                planningUnitListAll: newPlanningUnitList,
                planningUnitList: newPlanningUnitList,
                planningUnits: newPlanningUnitList,
                planningUnitId: [],
                planningUnitLabels: [],
                consumptions: []
            }, () => {
                if (this.state.yaxisEquUnit != -1 && this.state.programValues.length > 0 && this.state.equivalencyUnitList.filter(x => x.id == this.state.yaxisEquUnit).length > 0) {
                    var validFu = this.state.equivalencyUnitList.filter(x => x.id == this.state.yaxisEquUnit)[0].forecastingUnitIds;
                    var planningUnitList = this.state.planningUnitList.filter(x => validFu.includes(x.forecastingUnitId.toString()));
                    this.setState({
                        planningUnitList: planningUnitList
                    })
                } else {
                    this.setState({
                        yaxisEquUnit: -1,
                        yaxisEquUnitLabel: [i18n.t('static.program.no')],
                        noData: false
                    })
                }
            })
        }).catch(
        error => {
            this.setState({
            consumptions: [], loading: false
            }, () => { })
            if (error.message === "Network Error") {
            this.setState({
                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                loading: false
            });
            } else {
            switch (error.response ? error.response.status : "") {
                case 401:
                this.props.history.push(`/login/static.message.sessionExpired`)
                break;
                case 409:
                this.setState({
                    message: i18n.t('static.common.accessDenied'),
                    loading: false,
                    color: "#BA0C2F",
                });
                break;
                case 403:
                this.props.history.push(`/accessDenied`)
                break;
                case 500:
                case 404:
                case 406:
                this.setState({
                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                    loading: false
                });
                break;
                case 412:
                this.setState({
                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                    loading: false
                });
                break;
            }
            }
        }
        );
    }
    yAxisChange(e) {
        var yaxisEquUnit = e.target.value;
        var planningUnitList = this.state.planningUnitListAll;
        var el = document.getElementById("yaxisEquUnit");
        var yaxisEquUnitLabel = el && el.selectedOptions && el.selectedOptions.length > 0 ? el.selectedOptions[0].text.toString() : "";
        if (yaxisEquUnit != -1) {
            var validFu = this.state.equivalencyUnitList.filter(x => x.id == e.target.value)[0].forecastingUnitIds;
            planningUnitList = planningUnitList.filter(x => validFu.includes(x.forecastingUnitId.toString()));
        }
        this.setState({
            yaxisEquUnit: yaxisEquUnit,
            planningUnitList: planningUnitList,
            yaxisEquUnitLabel: [yaxisEquUnitLabel],
            planningUnitId: [],
            planningUnitLabels: [],
            consumptions: [],
            onlyShowAllPUs: false
        }, () => {
            this.fetchData();
        })
    }
    setOnlyShowAllPUs(e) {
        var checked = e.target.checked;
        this.setState({
            onlyShowAllPUs: checked,
        }, () => {
            this.getDropdownLists();
        })
    }
    setRemovePlannedShipments(e) {
        var checked = e.target.checked;
        this.setState({
            removePlannedShipments: checked,
        }, () => {
            this.fetchData();
        })
    }
    setRemoveTBD(e) {
        var checked = e.target.checked;
        this.setState({
            removeTbdFundingSource: checked,
        }, () => {
            this.fetchData();
        })
    }
    setAggregateCountries(e) {
        var checked = e.target.checked;
        this.setState({
            aggregateCountries: checked,
        }, () => {
            this.fetchData();
        })
    }
    setHideIcons(e) {
        var checked = e.target.checked;
        this.setState({
            hideIcons: checked,
        }, () => {
            this.buildShipmentJexcel();
        })
    }
    setViewBy(e) {
        this.setState({
            viewBy: e.target.value,
        }, () => {
            this.fetchData();
        })
    }
    setStockStatusId(e) {
        this.setState({
            stockStatusValues: e.map(item => item),
        }, () => {
            this.fetchData();
        })
    }
    setPlanningUnit(e) {
        if (this.state.yaxisEquUnit == -1) {
        var selectedText = e.map(item => item.label);
        var tempPUList = e.filter(puItem => !this.state.planningUnitId.map(ele => ele).includes(puItem));
        var planningUnitIds = e.map(ele => ele).length == 0 ? [] : e.length == 1 ? e.map(ele => ele) : tempPUList; 
        this.setState({
            planningUnitId: planningUnitIds,
            planningUnitLabels: planningUnitIds.map(ele => ele.label).sort((a, b) => a.localeCompare(b)),
            planningUnitIdExport: e.map(ele => ele).length == 0 ? [] : e.length == 1 ? e.map(ele => ele) : tempPUList,
            show: false,
            dataList: [],
            consumptionAdjForStockOutId: false,
            loading: false,
            planningUnitDetails: "",
            planningUnitDetailsExport: ""
        }, () => {
            this.fetchData();
            // this.filterData(this.state.rangeValue);
        })
        } else {
            if (this.state.yaxisEquUnit > 0) {
                var planningUnitIds = e.map(ele => ele)
                this.setState({
                planningUnitId: planningUnitIds,
                planningUnitLabels: planningUnitIds.map(ele => ele.label).sort((a, b) => a.localeCompare(b)),
                planningUnitIdExport: e.map(ele => ele),
                show: false,
                dataList: [],
                consumptionAdjForStockOutId: false,
                loading: false
                }, () => {
                if (this.state.planningUnitId.length > 0) {
                    this.fetchData();
                    // this.filterData(this.state.rangeValue);
                } else {
                    this.setState({
                    consumptions: [],
                    }, () => { })
                }
                })
            }
        }
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })
        this.fetchData();
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    /**
     * Displays a loading indicator while data is being loaded.
     */
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
    /**
     * Fetches data based on selected filters.
     */
    fetchData = () => {
        let realmId = AuthenticationService.getRealmId()
        let CountryIds = this.state.countryValues.length == this.state.countrys.length ? [] : this.state.countryValues.map(ele => (ele.value).toString());
        let includePlanningShipments = !this.state.removePlannedShipments;
        let programIds = this.state.programValues.length == this.state.programLst.length ? [] : this.state.programValues.map(ele => (ele.value).toString());
        let planningUnitIds = this.state.planningUnitId.length == this.state.planningUnits.length ? [] : this.state.planningUnitId.map(ele => (ele.value).toString());
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + String(this.state.rangeValue.to.month).padStart(2, '0') + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        
        if (realmId > 0 && planningUnitIds.length != 0 && this.state.countryValues.length > 0 && this.state.programValues.length > 0) {
            this.setState({
                message: '',
                loading: true
            })
            var inputjson = {
                realmId: realmId,
                startDate: startDate,
                stopDate: endDate,
                realmCountryIds: CountryIds,
                programIds: programIds,
                versionId: this.state.versionId,
                equivalencyUnitId: this.state.yaxisEquUnit == -1 ? 0 : this.state.yaxisEquUnit,
                planningUnitIds: planningUnitIds,
                stockStatusConditions: this.state.stockStatusValues.length == legendcolor.length ? [] : this.state.stockStatusValues.map(ele => ele.value).join(','),
                removePlannedShipments: this.state.removeTbdFundingSource ? 2 : includePlanningShipments ? 0 : 1,
                reportView: this.state.aggregateCountries ? 2 : 1,
                showByQty: this.state.viewBy == 1 ? false : true
            }
            ReportService.stockStatusMatrixGlobal(inputjson)
                .then(response => {
                    if (response.data.dataList.length != 0) {
                        response.data.dataList.sort((a, b) => {
                            let labelA = getLabelText(a.programOrCountry.label, this.state.lang).toLowerCase();
                            let labelB = getLabelText(b.programOrCountry.label, this.state.lang).toLowerCase();
                            return labelA.localeCompare(labelB);
                        });
                        this.setState({
                            data: response.data,
                            table1Body: response.data.dataList,
                            loading: false
                        }, () => {
                            this.buildShipmentJexcel();
                        })
                    }
                    else {
                        this.setState({
                            data: response.data,
                            table1Body: [],
                            loading: false,
                            noData: true
                        }, () => { }
                        )
                    }
                }).catch(
                    error => {
                        this.setState({
                            loading: false
                        }, () => {
                        })
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
                                    break;
                                case 409:
                                    this.setState({
                                        message: i18n.t('static.common.accessDenied'),
                                        loading: false,
                                        color: "#BA0C2F",
                                    });
                                    break;
                                case 403:
                                    this.props.history.push(`/accessDenied`)
                                    break;
                                case 500:
                                case 404:
                                case 406:
                                    this.setState({
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                        loading: false
                                    });
                                    break;
                            }
                        }
                    }
                );
        } else if (realmId <= 0) {
            this.setState({
                message: i18n.t('static.common.realmtext'),
                data: [],
                table1Body: [],
            });
        } else if (this.state.countryValues.length == 0) {
            this.setState({
                message: i18n.t('static.program.validcountrytext'),
                data: [],
                table1Body: [],
            });
        } else if (this.state.programValues.length == 0) {
            this.setState({
                message: i18n.t('static.common.selectProgram'),
                data: [],
                table1Body: [],
            });
        } else if (planningUnitIds.length == 0) {
            this.setState({
                message: i18n.t('static.common.selectPlanningUnit'),
                data: [],
                table1Body: [],
            });
        }
    }

    /**
     * Builds the Shipment Global View Jexcel table based on the fetched data.
     */
    buildShipmentJexcel() {
        let responseData = this.state.data;
        let dataList = responseData.dataList;
        let showByQty = this.state.viewBy == 2;
        let allDates = new Set();
        dataList.forEach(item => {
            Object.keys(item.dataMap).forEach(date => allDates.add(date));
        });
        let sortedDates = Array.from(allDates).sort();
        let isEquUnitMode = this.state.yaxisEquUnit != -1 && this.state.yaxisEquUnit != "-1";
        let columns = [
            {
                title: this.state.aggregateCountries ? i18n.t('static.dashboard.country') : i18n.t('static.dashboard.program'),
                type: 'text',
                width: 200,
                filter: true
            }
        ];
        if (isEquUnitMode) {
            columns.push({
                title: i18n.t('static.modelingValidation.puLevel'),
                type: 'text',
                width: 100,
                filter: true
            });
        }
        sortedDates.forEach(date => {
            columns.push({
                title: moment(date).format('MMM YY'),
                type: 'text',
                width: 80,
                align: 'center',
                filter: true
            });
        });
        let jexcelData = [];
        dataList.forEach(item => {
            let row = [];
            row.push(getLabelText(item.programOrCountry.label, this.state.lang));
            if (isEquUnitMode) {
                let puIds = new Set();
                sortedDates.forEach(date => {
                    if (item.dataMap[date] && item.dataMap[date].planningUnitIds) {
                        item.dataMap[date].planningUnitIds.split(',').forEach(id => puIds.add(id));
                    }
                });
                row.push(Array.from(puIds).join(', '));
            }
            sortedDates.forEach(date => {
                let dataEntry = item.dataMap[date];
                if (dataEntry) {
                    let val = showByQty ? dataEntry.closingBalance : dataEntry.mos;
                    row.push(val !== null && val !== undefined ? (val % 1 === 0 ? val : val.toFixed(1)) : i18n.t("static.supplyPlanFormula.na"));
                } else {
                    row.push(i18n.t("static.supplyPlanFormula.na"));
                }
            });
            jexcelData.push(row);
        });
        jexcel.destroy(document.getElementById("shipmentJexcel"), true);
        const colOffset = isEquUnitMode ? 2 : 1;
        var options = {
            data: jexcelData,
            columnDrag: false,
            columns: columns,
            editable: false,
            filters: true,
            search: true,
            position: 'top',
            copyCompatibility: true,
            allowExport: false,
            pagination: localStorage.getItem("sesRecordCount"),
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            license: JEXCEL_PRO_KEY,
            onload: function (instance) {
                jExcelLoadedFunction(instance);
            },
            onfilter: onOpenFilter,
            updateTable: function (instance, cell, col, row, val, label, cellName) {
                if (col >= colOffset) {
                    let date = sortedDates[col - colOffset];
                    let dataEntry = (dataList[row] && dataList[row].dataMap) ? dataList[row].dataMap[date] : null;
                    if (val == i18n.t("static.supplyPlanFormula.na")) {
                        cell.style.backgroundColor = '#cfcdc9';
                        cell.style.color = '#000';
                    } else if (dataEntry) {
                        let stockStatusId = dataEntry.stockStatusId;
                        let colorEntry = legendcolor.find(c => c.value === stockStatusId);
                        if (colorEntry) {
                            cell.style.backgroundColor = colorEntry.color;
                            cell.style.color = '#000';
                        }
                    }

                    if (dataEntry) {
                        let innerHTML = val;
                        if (!this.state.hideIcons) {
                            if (dataEntry.shipmentQty > 0) {
                                innerHTML += ' <i class="fa fa-truck" aria-hidden="true" style="color: #BA0C2F;" title="' + i18n.t('static.shipment.shipment') + ': ' + dataEntry.shipmentQty + '"></i>';
                            }
                            if (dataEntry.expiredQty > 0) {
                                innerHTML += ' <i class="fa fa-exclamation-triangle" aria-hidden="true" style="color: #ED8944;" title="' + i18n.t('static.supplyPlan.expiry') + ': ' + dataEntry.expiredQty + '"></i>';
                            }
                        }
                        cell.innerHTML = innerHTML;
                    }
                }
            }.bind(this)
        };
        var shipmentJexcel = jexcel(document.getElementById("shipmentJexcel"), options);
        this.setState({ shipmentJexcel });
    }
    /**
     * Handles the change event for countries.
     * @param {Array} countrysId - An array containing the selected country IDs.
     */
    handleChange(countrysId) {
        countrysId = countrysId.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            countryValues: countrysId.map(ele => ele),
            countryLabels: countrysId.map(ele => ele.label).sort((a, b) => a.localeCompare(b))
        }, () => {
            this.filterProgram();
        })
    }
    /**
     * Filters programs based on selected countries.
     */
    filterProgram = () => {
        let countryIds = this.state.countryValues.map(ele => ele.value);
        this.setState({
            programLst: [],
            programValues: [],
            programLabels: [],
        }, () => {
            if (countryIds.length != 0) {
                let newCountryList = [... new Set(countryIds)];
                DropdownService.getSPProgramWithFilterForMultipleRealmCountryForDropdown(newCountryList)
                    .then(response => {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = a.code.toUpperCase();
                            var itemLabelB = b.code.toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        if (listArray.length > 0) {
                            this.setState({
                                programLst: listArray,
                                programValues: [],
                                programLabels: []
                            }, () => {
                                this.getDropdownLists();
                            });
                        } else {
                            this.setState({
                                programLst: []
                            }, () => {
                                this.getDropdownLists();
                            });
                        }
                    }).catch(
                        error => {
                            this.setState({
                                programLst: [], loading: false
                            })
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                    loading: false
                                });
                            } else {
                                switch (error.response ? error.response.status : "") {
                                    case 401:
                                        this.props.history.push(`/login/static.message.sessionExpired`)
                                        break;
                                    case 409:
                                        this.setState({
                                            message: i18n.t('static.common.accessDenied'),
                                            loading: false,
                                            color: "#BA0C2F",
                                        });
                                        break;
                                    case 403:
                                        this.props.history.push(`/accessDenied`)
                                        break;
                                    case 500:
                                    case 404:
                                    case 406:
                                        this.setState({
                                            message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                            loading: false
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                            loading: false
                                        });
                                        break;
                                }
                            }
                        }
                    );
            } else {
                this.setState({
                    programLst: []
                }, () => {
                    this.fetchData()
                });
            }
        })
    }
    consolidatedVersionList = (programId) => {
        const { versions } = this.state;
        var verList = versions;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(["programData"], "readwrite");
            var program = transaction.objectStore("programData");
            var getRequest = program.getAll();
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(
                localStorage.getItem("curUser"),
                SECRET_KEY
                );
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                if (
                    myResult[i].programId == programId
                ) {
                    var databytes = CryptoJS.AES.decrypt(
                    myResult[i].programData.generalData,
                    SECRET_KEY
                    );
                    var programData = databytes.toString(CryptoJS.enc.Utf8);
                    var version = JSON.parse(programData).currentVersion;
                    version.versionId = `${version.versionId} (Local)`;
                    version.cutOffDate = JSON.parse(programData).cutOffDate != undefined && JSON.parse(programData).cutOffDate != null && JSON.parse(programData).cutOffDate != "" ? JSON.parse(programData).cutOffDate : ""
                    // verList.push(version);
                }
                }
                let versionList = verList.filter(function (x, i, a) {
                return a.indexOf(x) === i;
                });
                versionList.reverse();
                this.setState(
                {
                    versions: versionList,
                    versionId: versionList[0].versionId,
                    versionLabel: [versionList[0].versionStatus.id == 2 && versionList[0].versionType.id == 2
                    ? versionList[0].versionId + "*"
                    : versionList[0].versionId + " " + "("+
                    (moment(versionList[0].createdDate).format(`MMM DD YYYY`)) + ")"]
                },
                () => {
                    // this.filterData(this.state.rangeValue);
                    this.getDropdownLists();
                });
            }.bind(this);
        }.bind(this);
    };
    filterVersion = () => {
        let programId = this.state.programValues;
        if (programId.length == 1) {
        programId = programId[0].value
        const program = this.state.programLst.filter(
            (c) => c.id == programId
        );
        if (program.length == 1) {
            if (localStorage.getItem("sessionType") === 'Online') {
            this.setState(
                {
                versions: [],
                },
                () => {
                DropdownService.getVersionListForSPProgram(
                    programId
                )
                    .then((response) => {
                    this.setState(
                        {
                        versions: [],
                        },
                        () => {
                        this.setState(
                            {
                            versions: response.data,
                            },
                            () => {
                            this.consolidatedVersionList(programId);
                            }
                        );
                        }
                    );
                    })
                    .catch((error) => {
                    this.setState({
                        programs: [],
                        loading: false,
                    });
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
                            message: i18n.t('static.common.accessDenied'),
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
                            this.setState({
                            message: i18n.t(error.response.data.messageCode, {
                                entityname: i18n.t("static.dashboard.program"),
                            }),
                            loading: false,
                            });
                            break;
                        case 412:
                            this.setState({
                            message: i18n.t(error.response.data.messageCode, {
                                entityname: i18n.t("static.dashboard.program"),
                            }),
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
                }
            );
            } else {
            this.setState(
                {
                versions: [],
                },
                () => {
                this.consolidatedVersionList(programId);
                }
            );
            }
        } else {
            this.setState({
            versions: [],
            });
        }
        } else {
        this.setState({
            versions: [],
        }, () => {
            // this.filterData(this.state.rangeValue);
            this.getDropdownLists();
        });
        }
    };
    setVersionId(event) {
        var el = document.getElementById("versionId");
        var versionLabel = el && el.selectedOptions && el.selectedOptions.length > 0 ? el.selectedOptions[0].text.toString() : "";
        this.setState(
        {
            versionLabel: versionLabel,
            versionId: event.target.value,
        },
        () => {
            if (this.state.versionId != "")
            this.getDropdownLists();
        }
        );
    }
    /**
     * Renders the Shipment Global View report table.
     * @returns {JSX.Element} - Shipment Global View report table.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { countrys } = this.state;
        let countryList = countrys.length > 0 && countrys.map((item, i) => {
            return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
        }, this);
        const { programLst } = this.state;
        let programList = [];
        programList = programLst.length > 0
            && programLst.map((item, i) => {
                return (
                    { label: (item.code), value: item.id }
                )
            }, this);
        const { equivalencyUnitList } = this.state;
        let equivalencyUnitList1 = equivalencyUnitList.length > 0
        && equivalencyUnitList.map((item, i) => {
            return (
            <option key={i} value={item.id}>
                {item.label.label_en}
            </option>
            )
        }, this);
        const { versions } = this.state;
        let versionList =
        versions.length > 0 &&
        versions.map((item, i) => {
            return (
            <option key={i} value={item.versionId}>
                {item.versionStatus.id == 2 && item.versionType.id == 2
                ? item.versionId + "*"
                : item.versionId}{" "}
                ({moment(item.createdDate).format(`MMM DD YYYY`)}) {item.cutOffDate != undefined && item.cutOffDate != null && item.cutOffDate != '' ? " (" + i18n.t("static.supplyPlan.start") + " " + moment(item.cutOffDate).format('MMM YYYY') + ")" : ""}
            </option>
            );
        }, this);
        const { isDarkMode } = this.state;
        const backgroundColor = isDarkMode ? darkModeColors : lightModeColors;
        const fontColor = isDarkMode ? '#fff' : '#212721';
        const gridLineColor = isDarkMode ? '#444' : '#e0e0e0';

        let uniquePUs = new Set();
        (this.state.table1Body || []).forEach(item => {
            Object.values(item.dataMap || {}).forEach(dataEntry => {
                if (dataEntry.planningUnitIds) {
                    dataEntry.planningUnitIds.split(',').forEach(pu => {
                        let trimmed = pu.trim();
                        if (trimmed) uniquePUs.add(trimmed);
                    });
                }
            });
        });
        let sortedPUs = Array.from(uniquePUs).sort().map(puId => {
            let puObj = (this.state.planningUnitListAll || []).find(p => p.id == puId);
            if (puObj) {
                return { id: puObj.id, label: puObj.label };
            }
            let parts = puId.split(' | ');
            if (parts.length > 1) {
                return { id: parts[1], label: { label_en: parts[0], label_fr: parts[0], label_sp: parts[0], label_pr: parts[0] } };
            }
            return { id: puId, label: { label_en: '', label_fr: '', label_sp: '', label_pr: '' } };
        });

        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
            fontColor: fontColor
        }
        const { rangeValue } = this.state
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }

        const lightModeColors = [
            '#002F6C', '#BA0C2F', '#118B70', '#EDBA26', '#A7C6ED',
            '#651D32', '#6C6463', '#F48521', '#49A4A1', '#212721',
            '#002F6C', '#BA0C2F', '#118B70', '#EDBA26', '#A7C6ED',
            '#651D32', '#6C6463', '#F48521', '#49A4A1', '#212721',
            '#002F6C', '#BA0C2F', '#118B70', '#EDBA26', '#A7C6ED',
            '#651D32', '#6C6463', '#F48521', '#49A4A1', '#212721',
            '#002F6C', '#BA0C2F', '#118B70', '#EDBA26', '#A7C6ED',
            '#651D32', '#6C6463', '#F48521', '#49A4A1', '#212721',
            '#002F6C', '#BA0C2F', '#118B70', '#EDBA26', '#A7C6ED',
            '#651D32', '#6C6463', '#F48521', '#49A4A1', '#212721',
        ]

        const darkModeColors = [
            '#d4bbff', '#BA0C2F', '#0067B9', '#A7C6ED',
            '#EEE4B1', '#ba4e00', '#BC8985', '#cfcdc9',
            '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
            '#d4bbff', '#BA0C2F', '#0067B9', '#A7C6ED',
            '#EEE4B1', '#ba4e00', '#BC8985', '#cfcdc9',
            '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
            '#d4bbff', '#BA0C2F', '#0067B9', '#A7C6ED',
        ]
        const { planningUnitList, lang } = this.state;
        let puList = planningUnitList.length > 0 && planningUnitList.sort(function (a, b) {
            a = getLabelText(a.label, lang).toLowerCase();
            b = getLabelText(b.label, lang).toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        }).map((item, i) => {
            return ({ label: getLabelText(item.label, this.state.lang) + " | " + item.id, value: item.id })
        }, this);

        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon">
                        {this.state.table1Body.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => {
                                        var curTheme = localStorage.getItem("theme");
                                        if (curTheme == "dark") {
                                            this.setState({
                                                isDarkMode: false
                                            }, () => {
                                                setTimeout(() => {
                                                    this.exportPDF();
                                                    if (curTheme == "dark") {
                                                        this.setState({
                                                            isDarkMode: true
                                                        })
                                                    }
                                                }, 0)
                                            })
                                        } else {
                                            this.exportPDF();
                                        }
                                    }}
                                    />
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                                </a>
                            </div>
                        }
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0">
                        <div ref={ref}>
                            <Form >
                                <div className="pl-0">
                                    <div className="row">
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                            <div className="controls edit">
                                                <Picker
                                                    ref="pickRange"
                                                    years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                    value={rangeValue}
                                                    lang={pickerLang}
                                                    onDismiss={this.handleRangeDissmis}
                                                >
                                                    <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                </Picker>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="programIds">{i18n.t('static.program.realmcountry')}</Label>
                                            <span className="reportdown-box-icon fa fa-sort-desc ml-1"></span>
                                            <MultiSelect
                                                bsSize="sm"
                                                name="countryIds"
                                                id="countryIds"
                                                value={this.state.countryValues}
                                                onChange={(e) => { this.handleChange(e) }}
                                                options={countryList && countryList.length > 0 ? countryList : []}
                                                disabled={this.state.loading}
                                                filterOptions={filterOptions}
                                                overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                selectSomeItems: i18n.t('static.common.select')}}
                                            />
                                            {!!this.props.error &&
                                                this.props.touched && (
                                                    <div style={{ color: '#BA0C2F', marginTop: '.5rem' }}>{this.props.error}</div>
                                                )}
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="programIds">{i18n.t('static.program.program')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <MultiSelect
                                                bsSize="sm"
                                                name="programIds"
                                                id="programIds"
                                                value={this.state.programValues}
                                                onChange={(e) => { this.handleChangeProgram(e) }}
                                                options={programList && programList.length > 0 ? programList : []}
                                                disabled={this.state.loading}
                                                filterOptions={filterOptions}
                                                overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                selectSomeItems: i18n.t('static.common.select')}}
                                            />
                                            {!!this.props.error &&
                                                this.props.touched && (
                                                    <div style={{ color: '#BA0C2F', marginTop: '.5rem' }}>{this.props.error}</div>
                                                )}
                                        </FormGroup>
                                        {this.state.programValues.length == 1 && <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="versionId"
                                                    id="versionId"
                                                    bsSize="sm"
                                                    onChange={(e) => {
                                                        this.setVersionId(e);
                                                    }}
                                                    value={this.state.versionId}
                                                >
                                                    <option value="0">
                                                    {i18n.t("static.common.select")}
                                                    </option>
                                                    {versionList}
                                                </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>}
                                        <FormGroup className="col-md-3" id="equivelencyUnitDiv">
                                            <Label htmlFor="appendedInputButton">{i18n.t("static.shipmentReport.yAxisInEquivalencyUnit")}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="yaxisEquUnit"
                                                    id="yaxisEquUnit"
                                                    bsSize="sm"
                                                    value={this.state.yaxisEquUnit}
                                                    onChange={(e) => { this.yAxisChange(e); }}
                                                >
                                                    <option value="-1">{i18n.t('static.program.no')}</option>
                                                    {equivalencyUnitList1}
                                                </Input>

                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3" >
                                            <Label
                                                className="form-check-label"
                                                // check htmlFor="inline-radio1"
                                                title={i18n.t('static.report.planningUnit')}>
                                                {i18n.t('static.report.planningUnit')}
                                            </Label>
                                            <FormGroup id="planningUnitDiv" style={{ "marginTop": "8px" }}>
                                                <div className="controls">
                                                    <div onBlur={this.handleBlur}>
                                                        <MultiSelect
                                                            className={this.state.yaxisEquUnit == -1 ? "hide-checkbox" : ""}
                                                            bsSize="sm"
                                                            name="planningUnitId"
                                                            id="planningUnitId"
                                                            filterOptions={filterOptions}
                                                            value={this.state.planningUnitId}
                                                            onChange={(e) => { this.setPlanningUnit(e); }}
                                                            options={puList && puList.length > 0 ? puList : []}
                                                            hasSelectAll={this.state.yaxisEquUnit == -1 ? false : true}
                                                            showCheckboxes={this.state.yaxisEquUnit == -1 ? false : true}
                                                        />
                                                    </div>
                                                </div>
                                            </FormGroup>
                                            {this.state.programValues.length > 1 && <FormGroup style={{ "marginTop": "-10px" }}>
                                                <div className={this.state.yaxisEquUnit != 1 ? "col-md-12" : "col-md-12"} style={{ "padding-left": "23px", "marginTop": "-25px !important" }}>
                                                <Input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="onlyShowAllPUs"
                                                    name="onlyShowAllPUs"
                                                    checked={this.state.onlyShowAllPUs}
                                                    onClick={(e) => { this.setOnlyShowAllPUs(e); }}
                                                    style={{ marginTop: '2px' }}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                    {i18n.t('static.consumptionGlobal.onlyShowPUsThatArePartOfAllPrograms')}
                                                </Label>
                                                </div>
                                            </FormGroup>}
                                        </FormGroup>
                                         <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">
                                            {i18n.t("static.report.withinstock")}
                                            </Label>
                                             <div className="controls ">
                                                <MultiSelect
                                                    bsSize="sm"
                                                    name="stockStatusId"
                                                    id="stockStatusId"
                                                    value={this.state.stockStatusValues}
                                                    onChange={(e) => { this.setStockStatusId(e); }}
                                                    options={legendcolor.map(item => ({
                                                        value: item.value,
                                                        label: item.text
                                                    }))}
                                                    filterOptions={filterOptions}
                                                    overrideStrings={{
                                                        allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                        selectSomeItems: i18n.t('static.common.select')
                                                    }}
                                                />
                                             </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">Show by</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="viewBy"
                                                        id="viewBy"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.setViewBy(e); }}
                                                        value={this.state.viewBy}
                                                    >
                                                        <option value="1">{i18n.t('static.report.mos')}</option>
                                                        <option value="2">{i18n.t('static.report.quantity')}</option>
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-12 d-flex flex-wrap" style={{ "marginTop": "-15px" }}>
                                            <div className="mr-3 d-flex align-items-center" style={{ "padding-left": "23px" }}>
                                                <Input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="removePlannedShipments"
                                                    name="removePlannedShipments"
                                                    checked={this.state.removePlannedShipments}
                                                    onClick={(e) => { this.setRemovePlannedShipments(e); }}
                                                    style={{ marginTop: '0px' }}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px', marginBottom: '0px' }}>
                                                    {i18n.t('static.report.removePlannedShipments')}
                                                </Label>
                                            </div>
                                            <div className="mr-3 d-flex align-items-center" style={{ "padding-left": "23px" }}>
                                                <Input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="removeTbdFundingSource"
                                                    name="removeTbdFundingSource"
                                                    checked={this.state.removeTbdFundingSource}
                                                    onClick={(e) => { this.setRemoveTBD(e); }}
                                                    style={{ marginTop: '0px' }}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px', marginBottom: '0px' }}>
                                                    {i18n.t('static.report.removeTBDFundingSourceShipments')}
                                                </Label>
                                            </div>
                                            <div className="mr-3 d-flex align-items-center" style={{ "padding-left": "23px" }}>
                                                <Input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="aggregateCountries"
                                                    name="aggregateCountries"
                                                    checked={this.state.aggregateCountries}
                                                    onClick={(e) => { this.setAggregateCountries(e); }}
                                                    style={{ marginTop: '0px' }}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px', marginBottom: '0px' }}>
                                                    {"Aggregate Countries"}
                                                </Label>
                                            </div>
                                            <div className="mr-3 d-flex align-items-center" style={{ "padding-left": "23px" }}>
                                                <Input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="hideIcons"
                                                    name="hideIcons"
                                                    checked={this.state.hideIcons}
                                                    onClick={(e) => { this.setHideIcons(e); }}
                                                    style={{ marginTop: '0px' }}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px', marginBottom: '0px' }}>
                                                    Hide Icons
                                                </Label>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </div>
                            </Form>
                            <div style={{ display: this.state.loading ? "none" : "block" }}>
                                <Col md="12 pl-0">
                                    <div className="globalviwe-scroll">
                                        <div className="row">
                                            <div className="col-md-12">
                                                {this.state.table1Body.length > 0 &&
                                                <CardBody className="pl-lg-1 pr-lg-1 pt-lg-0">
                                                    <div className="d-flex justify-content-start ml-2 p-1">
                                                        <b style={{ color: '#002f6c' }}>
                                                            {this.state.yaxisEquUnit != -1
                                                                ? i18n.t("static.equivalancyUnit.equivalancyUnits") + ": " + this.state.yaxisEquUnitLabel
                                                                : i18n.t("static.report.planningUnit") + ": " + this.state.planningUnitLabels.join(", ")}
                                                        </b>
                                                    </div>
                                                    <div style={{ position: 'relative' }}>
                                                        <div className="d-flex justify-content-start" style={{ position: 'absolute', left: '10px', top: '13px', zIndex: 100 }}>
                                                            <ul className="legendcommitversion list-group mb-0">
                                                                {legendcolor.map((item1) => (
                                                                    <li>
                                                                        <span
                                                                            className="legendcolor"
                                                                            style={{ backgroundColor: item1.color }}
                                                                        ></span>{" "}
                                                                        <span className="legendcommitversionText">
                                                                            {item1.text}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                                <li>
                                                                    <span className="legendcolor" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <i className="fa fa-truck" aria-hidden="true" style={{ fontSize: '12px', color: '#BA0C2F' }}></i>
                                                                    </span>
                                                                    <span className="legendcommitversionText">
                                                                        {i18n.t('static.shipment.shipment')}
                                                                    </span>
                                                                </li>
                                                                <li>
                                                                    <span className="legendcolor" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <i className="fa fa-exclamation-triangle" aria-hidden="true" style={{ fontSize: '12px', color: '#ED8944' }}></i>
                                                                    </span>
                                                                    <span className="legendcommitversionText">
                                                                        {i18n.t('static.supplyPlan.expiry')}
                                                                    </span>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div id="shipmentJexcel" className='jexcelremoveReadonlybackground shipmentJexcel shipmentGlobalSearchRight' style={{ padding: '2px 8px' }}></div>
                                                    </div>
                                                    <div className="mt-3 ml-2">
                                                        <ul style={{ listStyleType: 'none', paddingLeft: 0, fontSize: '13px', color: '#002f6c' }}>
                                                            {sortedPUs.map((pu, index) => (
                                                                <li key={index}><b>{pu.id}</b> {getLabelText(pu.label, this.state.lang)}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </CardBody>
                                                }
                                                {this.state.noData && this.state.planningUnitId.length > 0 &&
                                                    <h5 className="red">{i18n.t("static.shipment.noData")}</h5>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </div>
                            <div style={{ display: this.state.loading ? "block" : "none" }}>
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                        <div class="spinner-border blue ml-4" role="status">
                                        </div>
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
export default StockStatusMatrixGlobal;