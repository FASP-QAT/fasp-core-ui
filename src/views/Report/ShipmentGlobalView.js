import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import Picker from 'react-month-picker';
import { MultiSelect } from 'react-multi-select-component';
import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
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
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP_FOUR_DIGITS, MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH, JEXCEL_PRO_KEY, JEXCEL_PAGINATION_OPTION } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import FundingSourceService from '../../api/FundingSourceService';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import ProductService from '../../api/ProductService';
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

// const backgroundColor = [
//     '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
//     '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
//     '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
//     '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
//     '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
//     '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
//     '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
// ]
/**
 * Component for Shipment Global View Report.
 */
class ShipmentGlobalView extends Component {
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
            procurementAgents: [],
            procurementAgentTypes: [],
            fundingSources: [],
            countryLabels: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            programValues: [],
            programLabels: [],
            programs: [],
            message: '',
            fundingSourceValues: [],
            procurementAgentValues: [],
            procurementAgentTypeValues: [],
            countrySplitList: [],
            countryShipmentSplitList: [],
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
            viewby: 1,
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
            fundingSourceTypes: [],
            fundingSourceTypeValues: [],
            fundingSourceTypeLabels: [],
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
            yaxisEquUnitLabel: [i18n.t('static.program.no')],
            viewByLabel: [i18n.t('static.dashboard.fundingsource')],
        };
        this.getCountrys = this.getCountrys.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.handleChange = this.handleChange.bind(this)
        this.handleChangeProgram = this.handleChangeProgram.bind(this)
        this.filterProgram = this.filterProgram.bind(this);
        this.yAxisChange = this.yAxisChange.bind(this);
        this.buildShipmentJexcel = this.buildShipmentJexcel.bind(this);
        this.calculateTotals = this.calculateTotals.bind(this);
        this.recalculateFooter = this.recalculateFooter.bind(this);
    }
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
    }
    buildShipmentJexcel() {
        if(this.state.countrySplitList.length > 0){
            const countrySplitList = this.state.countrySplitList || [];
            const amountKeys =
                countrySplitList.length > 0
                    ? Object.keys(countrySplitList[0].amount || {})
                    : [];

            // Sort amountKeys alphabetically
            const sortedAmountKeys = amountKeys.slice().sort((a, b) => a.localeCompare(b));

            // Build columns array
            const columns = [
                { type: 'text', title: 'Country' },
                ...sortedAmountKeys.map(key => ({
                    type: 'numeric',
                    title: key,
                    mask: '#,##'
                })),
                { type: 'numeric', title: 'Total', mask: '#,##' }
            ];

            var data = countrySplitList.map(ele => {
                const fundingValues = sortedAmountKeys.map(
                    key => ele.amount?.[key] || 0
                );
                const total = fundingValues.reduce((a, b) => a + b, 0);
                return [
                    ele.country.label.label_en,
                    ...fundingValues,
                    total
                ];
            });

            // Sort data rows by country name (first column)
            data.sort((a, b) => a[0].localeCompare(b[0]));
            let columnTotals = new Array(amountKeys.length).fill(0);
            let grandTotal = 0;

            data.forEach(row => {
                amountKeys.forEach((_, index) => {
                    columnTotals[index] += row[index + 1];
                });
                grandTotal += row[row.length - 1];
            });

            const footerRow = [
                "Total",
                ...columnTotals,
                grandTotal
            ];
            this.el = jexcel(document.getElementById("shipmentJexcel"), '');
            jexcel.destroy(document.getElementById("shipmentJexcel"), true);
            var options = {
            data: data,
            columnDrag: false,
            colWidths: [50, 50, 50],
            colHeaderClasses: ["Reqasterisk"],
            columns: columns,
            onload: this.loaded,
            editable: false,
            onselection: this.selected,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            parseFormulas: true,
            license: JEXCEL_PRO_KEY, onopenfilter:onOpenFilter, allowRenameColumn: false,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
            footers: [
                this.calculateTotals(data, amountKeys.length)
            ],
            onfilter: (instance) => {
                this.recalculateFooter(instance, amountKeys);
            },

            onsort: (instance) => {
                setTimeout(() => {
                    this.recalculateFooter(instance);
                }, 0);
            },
            updateTable: function(instance, cell, col, row) {
                if(cell) {
                    const lastCol = columns.length - 1;
                    if (col === 0 || col === lastCol) {
                        cell.style.fontWeight = 'bold';
                    } else {
                        cell.style.fontWeight = 'normal';
                    }
                    try {
                        if (row === data.length) { 
                            cell.style.background = '#f3f3f3';
                            cell.style.borderTop = '2px solid #888';
                            cell.style.borderBottom = '2px solid #888';
                            cell.style.borderLeft = '1px solid #888';
                            cell.style.borderRight = '1px solid #888';
                        }
                    } catch (e) {
                         console.warn("Footer styling error", e);
                    }
                }
            },
            onchangepage: function(el, pageNo, oldPageNo) {
                var elInstance = el;
                var json = elInstance.getJson(null, false);
                var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
                if (jsonLength == undefined) {
                    jsonLength = 15
                }
                if (json.length < jsonLength) {
                    jsonLength = json.length;
                }
                var start = pageNo * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
                for (var y = start; y < jsonLength; y++) {
                    var rowData = elInstance.getRowData(y);
                    const totalColumns = rowData.length;
                    const firstColumnLetter = getColumnLetter(0);
                    const lastColumnLetter = getColumnLetter(totalColumns - 1);
                    var cell = elInstance.getCell(firstColumnLetter.concat(parseInt(y) + 1))
                    cell.style.fontWeight = 'bold';
                    var cell = elInstance.getCell(lastColumnLetter.concat(parseInt(y) + 1))
                    cell.style.fontWeight = 'bold';
                }
            }
            };
            var shipmentJexcel = jexcel(document.getElementById("shipmentJexcel"), options);
            this.el = shipmentJexcel;
            this.setState({
                shipmentJexcel: shipmentJexcel,
            })
        }
    }
    /**
     * Exports the data to a CSV file.
     */
    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)) + '"')
        csvRow.push('')
        this.state.countryLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + (ele.toString())) + '"'))
        csvRow.push('')
        this.state.programLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + ele.toString()) + '"'))
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.equivalancyUnit.equivalancyUnit') + ' : ' + ( this.state.yaxisEquUnitLabel.join('; '))) + '"')
        csvRow.push('')
        this.state.planningUnitLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + ele.toString()) + '"'))
        var viewby = document.getElementById("viewById").value;
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.display') + ' : ' + (document.getElementById("viewById").selectedOptions[0].text)) + '"')
        csvRow.push('')
        if (viewby == 1) {
            this.state.fundingSourceLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.budget.fundingsource') + ' : ' + (ele.toString())) + '"'))
        } else if (viewby == 2) {
            this.state.procurementAgentLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.procurementagent.procurementagent') + ' : ' + (ele.toString())) + '"'))
        } else if (viewby == 3) {
            this.state.procurementAgentTypeLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.dashboard.procurementagentType') + ' : ' + (ele.toString())) + '"'))
        } else if (viewby == 4) {
            this.state.fundingSourceTypeLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.funderTypeHead.funderType') + ' : ' + (ele.toString())) + '"'))
        }
        csvRow.push('')
        // csvRow.push('"' + ((i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20') + '"'))
        // csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')) + '"')
        csvRow.push('')
        csvRow.push('')
        const amountKeys =
            this.state.countrySplitList.length > 0
                ? Object.keys(this.state.countrySplitList[0].amount || {})
                : [];
        const sortedAmountKeys = amountKeys.slice().sort((a, b) => a.localeCompare(b));

        // Build header
        const csvHeader = [
            i18n.t('static.dashboard.country'),
            ...sortedAmountKeys,
            i18n.t("static.supplyPlan.total")
        ];
        // Build and sort data rows
        const data = this.state.countrySplitList.map(ele => {
            const fundingValues = sortedAmountKeys.map(
                key => ele.amount?.[key] || 0
            );
            const total = fundingValues.reduce((a, b) => a + b, 0);
            return [
                ele.country.label.label_en,
                ...fundingValues,
                total
            ];
        });

        // Sort rows alphabetically by country name
        data.sort((a, b) => a[0].localeCompare(b[0]));

        csvRow.push(addDoubleQuoteToRowContent(csvHeader)); // <-- Add this line
        data.forEach(row => {
            csvRow.push(addDoubleQuoteToRowContent(row));
        });
        if (data.length > 0) {
            const colCount = data[0].length;
            let totals = new Array(colCount).fill(0);
            for (let i = 0; i < data.length; i++) {
                for (let j = 1; j < colCount; j++) {
                    totals[j] += Number(data[i][j]) || 0;
                }
            }
            totals[0] = "Total";
            for (let j = 1; j < colCount; j++) {
                totals[j] = totals[j].toLocaleString('en-US');
            }
            csvRow.push(addDoubleQuoteToRowContent(totals));
        }
        var csvString = csvRow.join("\n")
        var blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.target = "_Blank"
        a.download = i18n.t('static.report.orders') + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to) + ".csv"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a); 
    }
    /**
     * Exports the data to a PDF file.
     */
    exportPDF = async () => {
        const addFooters = doc => {
            const pageCount = doc.internal.getNumberOfPages()
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(6)
            for (var i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setPage(i)
                doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                align: 'center'
                })
                doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                align: 'center'
                })
            }
        }
        const addHeaders = doc => {
            const pageCount = doc.internal.getNumberOfPages()
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.orders') + " (" + i18n.t('static.report.byCountry') + ")", doc.internal.pageSize.width / 2, 60, {
                // doc.text(i18n.t('static.report.consumption_') + " (" + (this.state.yaxisEquUnit == -1 ? this.state.planningUnitLabels[0] : this.state.yaxisEquUnitLabel[0] ) + ")", doc.internal.pageSize.width / 2, 60, {
                align: 'center'
                })
                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                }
            }
        }
        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal')
        doc.setTextColor("#002f6c");
        var y = 110;
        var planningText = doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
            y = y + 10;
        }
        planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
            y = y + 10;
        }
        planningText = doc.splitTextToSize(i18n.t('static.equivalancyUnit.equivalancyUnit') + ' : ' + this.state.yaxisEquUnitLabel.join('; '), doc.internal.pageSize.width * 3 / 4);
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
            y = y + 10;
        }
        planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
            y = y + 10;
        }
        planningText = doc.splitTextToSize(i18n.t('static.common.display') + ' : ' + this.state.viewByLabel.join('; '), doc.internal.pageSize.width * 3 / 4);
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
            y = y + 10;
        }
        planningText = doc.splitTextToSize((this.state.viewByLabel.join('; ') + ' : ' + (this.state.viewby == 1 ? this.state.fundingSourceLabels.join('; ') : this.state.viewby == 2 ? this.state.procurementAgentLabels.join('; ') : this.state.viewby == 3 ? this.state.procurementAgentTypeLabels.join('; ') : this.state.fundingSourceTypeLabels.join('; ') )), doc.internal.pageSize.width * 3 / 4);
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
            y = y + 10;
        }
        // planningText = doc.splitTextToSize((i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").value ), doc.internal.pageSize.width * 3 / 4);
        // y = y + 10;
        // for (var i = 0; i < planningText.length; i++) {
        //     if (y > doc.internal.pageSize.height - 100) {
        //         doc.addPage();
        //         y = 80;
        //     }
        //     doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
        //     y = y + 10;
        // }
        const title = i18n.t('static.dashboard.globalconsumption');
        var canvas = document.getElementById("cool-canvas1");
        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        let startY = y + 10
        let pages = Math.ceil(startY / height)
        for (var j = 1; j < pages; j++) {
            doc.addPage()
        }
        let startYtable = startY - ((height - h1) * (pages - 1))
        doc.setTextColor("#fff");

        // --- Chart Aspect Ratio Logic ---
        const CHART_MAX_WIDTH = 750;
        const CHART_MAX_HEIGHT = 300; // Limit height if needed
        let chartWidth = canvas.width;
        let chartHeight = canvas.height;
        let chartRatio = chartWidth / chartHeight;

        let finalChartWidth = CHART_MAX_WIDTH;
        let finalChartHeight = finalChartWidth / chartRatio;

        if (finalChartHeight > CHART_MAX_HEIGHT) {
             finalChartHeight = CHART_MAX_HEIGHT;
             finalChartWidth = finalChartHeight * chartRatio;
        }

        if (startYtable > (height - finalChartHeight - 50)) { // Check if chart doesn't fit
            doc.addPage()
            startYtable = 100
        }
        let chartX = (doc.internal.pageSize.width - finalChartWidth) / 2;
        doc.addImage(canvasImg, 'png', chartX, startYtable, finalChartWidth, finalChartHeight, 'CANVAS');
        
        // --- Map Export Logic ---
        const mapContainer = document.querySelector(".world-map-container");
        if (mapContainer) {
            const svg = mapContainer.querySelector("svg");
            if (svg) {
                try {
                    const svgData = await new Promise((resolve, reject) => {
                        const serializer = new XMLSerializer();
                        const svgString = serializer.serializeToString(svg);
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        const img = new Image();
                        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
                        const url = URL.createObjectURL(svgBlob);
                        
                        img.onload = () => {
                            canvas.width = svg.getBoundingClientRect().width || 800;
                            canvas.height = svg.getBoundingClientRect().height || 400;
                            ctx.fillStyle = "#ffffff";
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            URL.revokeObjectURL(url);
                            resolve({
                                dataUrl: canvas.toDataURL("image/png"),
                                width: canvas.width,
                                height: canvas.height
                            });
                        };
                        img.onerror = (e) => {
                            reject(e);
                        }
                        img.src = url;
                    });
                    
                    // --- Map Aspect Ratio Logic ---
                    let mapWidth = svgData.width;
                    let mapHeight = svgData.height;
                    let mapRatio = mapWidth / mapHeight;

                    const MAP_MAX_WIDTH = 650;
                    const MAP_MAX_HEIGHT = 400;

                    let finalMapWidth = MAP_MAX_WIDTH;
                    let finalMapHeight = finalMapWidth / mapRatio;

                    if (finalMapHeight > MAP_MAX_HEIGHT) {
                        finalMapHeight = MAP_MAX_HEIGHT;
                        finalMapWidth = finalMapHeight * mapRatio;
                    }

                    let mapY = startYtable + finalChartHeight + 30; // Add spacing after chart
                    if ((mapY + finalMapHeight) > height - 50) { 
                         doc.addPage();
                         mapY = 100;
                    }
                    
                    let mapX = (doc.internal.pageSize.width - finalMapWidth) / 2;
                    doc.addImage(svgData.dataUrl, 'PNG', mapX, mapY, finalMapWidth, finalMapHeight, 'MAP');

                    // --- Draw Gradient Legend ---
                    const countryTotals = {};
                    (this.state.countrySplitList || []).forEach(ele => {
                        const total = Object.values(ele.amount || {}).reduce((sum, val) => sum + val, 0);
                        if (ele.country && ele.country.code) {
                             countryTotals[ele.country.code] = total;
                        }
                    });
                    const maxValue = Math.max(...Object.values(countryTotals), 0);

                    const legendX = mapX + finalMapWidth + 10; 
                    const legendY = mapY + finalMapHeight - 100;
                    const legendWidth = 15;
                    const legendHeight = 100;

                    // Gradient: #E6F2FF (Light) to #002F6C (Dark)
                    const r1 = 230, g1 = 242, b1 = 255; 
                    const r2 = 0, g2 = 47, b2 = 108; 

                    for (let i = 0; i < legendHeight; i++) {
                        const ratio = i / legendHeight;
                        const r = Math.round(r1 + (r2 - r1) * ratio);
                        const g = Math.round(g1 + (g2 - g1) * ratio);
                        const b = Math.round(b1 + (b2 - b1) * ratio);
                        
                        doc.setFillColor(r, g, b);
                        doc.rect(legendX, legendY + legendHeight - 1 - i, legendWidth, 2, 'F');
                    }
                    
                    doc.setDrawColor(200, 200, 200);
                    doc.rect(legendX, legendY, legendWidth, legendHeight, 'S');

                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text("0", legendX + legendWidth + 5, legendY + legendHeight);
                    doc.text(maxValue.toLocaleString('en-US'), legendX + legendWidth + 5, legendY + 5);

                } catch (e) {
                    console.error("Error exporting map", e);
                }
            }
        }
        const amountKeys =
            this.state.countrySplitList.length > 0
                ? Object.keys(this.state.countrySplitList[0].amount || {})
                : [];
        const sortedAmountKeys = amountKeys.slice().sort((a, b) => a.localeCompare(b));

        // Build header
        const headers = [
            i18n.t('static.dashboard.country'),
            ...sortedAmountKeys,
            i18n.t("static.supplyPlan.total")
        ];

        // Build and sort data rows
        const data = this.state.countrySplitList.map(ele => {
            const fundingValues = sortedAmountKeys.map(
                key => (ele.amount?.[key] || 0).toLocaleString('en-US')
            );
            const total = fundingValues
                .map(val => Number(val.replace(/,/g, "")))
                .reduce((a, b) => a + b, 0)
                .toLocaleString('en-US');
            return [
                ele.country.label.label_en,
                ...fundingValues,
                total
            ];
        });

        // Sort rows alphabetically by country name
        data.sort((a, b) => a[0].localeCompare(b[0]));


        let totalRow = [];
        if (data.length > 0) {
            const colCount = data[0].length;
            let totals = new Array(colCount).fill(0);
            for (let i = 0; i < data.length; i++) {
                for (let j = 1; j < colCount; j++) {
                    totals[j] += Number(data[i][j].toString().replace(/,/g, "")) || 0;
                }
            }
            totals[0] = "Total";
            for (let j = 1; j < colCount; j++) {
                totals[j] = totals[j].toLocaleString('en-US');
            }
            totalRow = totals;
        }
        doc.addPage()
        startYtable = 80
        let content = {
            margin: { top: 80, bottom: 50 },
            startY: startYtable,
            head: [headers],
            body: [...data, totalRow],
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
            didParseCell: function (data) {
                if (data.section === 'body') {
                    if (data.row.index === data.table.body.length - 1 || data.column.index === 0 || data.column.index === data.table.columns.length - 1) {
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.report.orders') + " (" + (this.state.yaxisEquUnit == -1 ? this.state.planningUnitLabels[0] : this.state.yaxisEquUnitLabel[0] ) + ")".concat('.pdf'));
    }
    /**
     * Handles the change event for program selection.
     * @param {array} programIds - The array of selected program IDs.
     */
    handleChangeProgram(programIds) {
        this.getProcurementAgent(programIds.map(ele => ele.value));
        programIds = programIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            programValues: programIds.map(ele => ele),
            programLabels: programIds.map(ele => ele.label).sort((a, b) => a.localeCompare(b)),
            yaxisEquUnit: -1,
            yaxisEquUnitLabel: [i18n.t('static.program.no')],
        }, () => {
            this.getFundingSource();
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
                    countrys: listArray, loading: false
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
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Toggles the view based on the selected option.
     */
    toggleView = () => {
        let viewby = document.getElementById("viewById").value;
        var viewByLabel = document.getElementById("viewById").selectedOptions[0].text.toString();
        this.setState({
            viewby: viewby,
            viewByLabel: [viewByLabel]
        });
        if (viewby == 1) {
            document.getElementById("fundingSourceDiv").style.display = "block";
            document.getElementById("fundingSourceTypeDiv").style.display = "none";
            document.getElementById("procurementAgentDiv").style.display = "none";
            document.getElementById("procurementAgentTypeDiv").style.display = "none";
            this.setState({
                data: []
            }, () => {
                this.fetchData();
            })
        } else if (viewby == 2) {
            document.getElementById("procurementAgentDiv").style.display = "block";
            document.getElementById("fundingSourceDiv").style.display = "none";
            document.getElementById("fundingSourceTypeDiv").style.display = "none";
            document.getElementById("procurementAgentTypeDiv").style.display = "none";
            this.setState({
                data: []
            }, () => {
                this.fetchData();
            })
        } else if (viewby == 3) {
            document.getElementById("procurementAgentTypeDiv").style.display = "block";
            document.getElementById("procurementAgentDiv").style.display = "none";
            document.getElementById("fundingSourceDiv").style.display = "none";
            document.getElementById("fundingSourceTypeDiv").style.display = "none";
            this.setState({
                data: []
            }, () => {
                this.fetchData();
            })
        } else if (viewby == 4) {
            document.getElementById("fundingSourceTypeDiv").style.display = "block";
            document.getElementById("procurementAgentTypeDiv").style.display = "none";
            document.getElementById("procurementAgentDiv").style.display = "none";
            document.getElementById("fundingSourceDiv").style.display = "none";
            this.setState({
                data: []
            }, () => {
                this.fetchData();
            })
        }
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
        document.getElementById("procurementAgentDiv").style.display = "none";
        document.getElementById("procurementAgentTypeDiv").style.display = "none";
        document.getElementById("fundingSourceTypeDiv").style.display = "none";
    }
    /**
     * Retrieves the list of planning units for a selected programs.
     */
    getProcurementAgent = (programIds) => {
        this.setState({ loading: true })
        var programJson = programIds
        DropdownService.getProcurementAgentDropdownListForFilterMultiplePrograms(programJson)
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = a.code.toUpperCase();
                    var itemLabelB = b.code.toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    procurementAgents: listArray,
                    procurementAgentValues: listArray.map(item => ({ label: item.code, value: item.id })),
                    procurementAgentLabels: listArray.map(item => item.code),
                    loading: false
                })
            }).catch(
                error => {
                    this.setState({
                        procurementAgents: [], loading: false
                    })
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError', loading: false });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Retrieves the list of procurement agent types.
     */
    getProcurementAgentType = () => {
        this.setState({ loading: true })
        ProcurementAgentService.getProcurementAgentTypeListAll()
            .then(response => {
                let realmId = AuthenticationService.getRealmId();
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    procurementAgentTypes: listArray.filter(c => c.active == true && realmId == c.realm.id), loading: false,
                }, () => { this.fetchData(); })
            }).catch(
                error => {
                    this.setState({
                        procurementAgentTypes: [], loading: false
                    })
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError', loading: false });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Retrieves the list of funding sources.
     */
    getFundingSource = () => {
        this.setState({ loading: true })
        let programIds = this.state.programValues.map((ele) =>
            Number(ele.value)
        );
        DropdownService.getFundingSourceForProgramsDropdownList(programIds)
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = a.code.toUpperCase();
                    var itemLabelB = b.code.toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    fundingSources: listArray,
                    fundingSourceValues: listArray.map(item => ({ label: item.code, value: item.id })),
                    fundingSourceLabels: listArray.map(item => item.code),
                    loading: false
                }, () => { this.getProcurementAgentType(); this.getFundingSourceType(); })
            }).catch(
                error => {
                    this.setState({
                        fundingSources: []
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
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * Retrieves the list of funding sources types.
     */
    getFundingSourceType = () => {
        //Fetch realmId
        let programIds = this.state.programValues.map((ele) =>
            Number(ele.value)
        );
        DropdownService.getFundingSourceTypeForProgramsDropdownList(programIds)
            .then(response => {
                if (response.status == 200) {
                    var fundingSourceTypeValues = [];
                    var fundingSourceTypes = response.data;
                    fundingSourceTypes.sort(function (a, b) {
                        a = a.code.toLowerCase();
                        b = b.code.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    })

                    this.setState({
                        fundingSourceTypes: fundingSourceTypes, loading: false,
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            // this.hideSecondComponent();
                        })
                }
            }).catch(
                error => {
                    this.setState({
                        fundingSourceTypes: [], loading: false
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
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );
    }
    getDropdownLists() {
        var json = {
        programIds: this.state.programValues.map(ele => ele.value),
        onlyAllowPuPresentAcrossAllPrograms: this.state.onlyShowAllPUs
        }
        ReportService.getDropdownListByProgramIds(json).then(response => {
        this.setState({
            equivalencyUnitList: response.data.equivalencyUnitList,
            planningUnitListAll: response.data.planningUnitList,
            planningUnitList: response.data.planningUnitList,
            planningUnitId: [],
            consumptions: []
        }, () => {
            if (this.state.yaxisEquUnit != -1 && this.state.programValues.length > 0) {
            var validFu = this.state.equivalencyUnitList.filter(x => x.id == this.state.yaxisEquUnit)[0].forecastingUnitIds;
            var planningUnitList = this.state.planningUnitList.filter(x => validFu.includes(x.forecastingUnitId.toString()));
            this.setState({
                planningUnitList: planningUnitList
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
                default:
                this.setState({
                    message: 'static.unkownError',
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
        var yaxisEquUnitLabel = document.getElementById("yaxisEquUnit").selectedOptions[0].text.toString()
        if (yaxisEquUnit != -1) {
            var validFu = this.state.equivalencyUnitList.filter(x => x.id == e.target.value)[0].forecastingUnitIds;
            planningUnitList = planningUnitList.filter(x => validFu.includes(x.forecastingUnitId.toString()));
        }
        this.setState({
            yaxisEquUnit: yaxisEquUnit,
            planningUnitList: planningUnitList,
            yaxisEquUnitLabel: [yaxisEquUnitLabel],
            planningUnitId: [],
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
        let viewby = document.getElementById("viewById").value;
        let realmId = AuthenticationService.getRealmId()
        let procurementAgentIds = this.state.procurementAgentValues.length == this.state.procurementAgents.length ? [] : this.state.procurementAgentValues.map(ele => (ele.value).toString());
        let procurementAgentTypeIds = this.state.procurementAgentTypeValues.length == this.state.procurementAgentTypes.length ? [] : this.state.procurementAgentTypeValues.map(ele => (ele.value).toString());
        let fundingSourceIds = this.state.fundingSourceValues.length == this.state.fundingSources.length ? [] : this.state.fundingSourceValues.map(ele => (ele.value).toString());
        let fundingSourcetypeIds = this.state.fundingSourceTypeValues.length == this.state.fundingSourceTypes.length ? [] : this.state.fundingSourceTypeValues.map(ele => (ele.value).toString());
        let CountryIds = this.state.countryValues.length == this.state.countrys.length ? [] : this.state.countryValues.map(ele => (ele.value).toString());
        let includePlanningShipments = true;
        let programIds = this.state.programValues.length == this.state.programLst.length ? [] : this.state.programValues.map(ele => (ele.value).toString());
        let planningUnitIds = this.state.planningUnitId.length == this.state.planningUnits.length ? [] : this.state.planningUnitId.map(ele => (ele.value).toString());
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + String(this.state.rangeValue.to.month).padStart(2, '0') + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        let fundingSourceProcurementAgentIds = [];
        if (viewby == 1) {
            fundingSourceProcurementAgentIds = fundingSourceIds;
        } else if (viewby == 2) {
            fundingSourceProcurementAgentIds = procurementAgentIds;
        } else if (viewby == 3) {
            fundingSourceProcurementAgentIds = procurementAgentTypeIds;
        } else if (viewby == 4) {//for funding source type
            fundingSourceProcurementAgentIds = fundingSourcetypeIds;
        }

        if (realmId > 0 && planningUnitIds.length != 0 && this.state.countryValues.length > 0 && this.state.programValues.length > 0 && ((viewby == 2 && this.state.procurementAgentValues.length > 0) || (viewby == 3 && this.state.procurementAgentTypeValues.length > 0) || (viewby == 1 && this.state.fundingSourceValues.length > 0) || (viewby == 4 && this.state.fundingSourceTypeValues.length > 0))) {
            this.setState({
                message: '',
                loading: true
            })
            var inputjson = {
                realmId: realmId,
                startDate: startDate,
                stopDate: endDate,
                realmCountryIds: CountryIds,
                equivalencyUnitId: this.state.yaxisEquUnit == -1 ? 0 : this.state.yaxisEquUnit,
                programIds: programIds,
                planningUnitIds: planningUnitIds,
                reportView: viewby,
                fundingSourceProcurementAgentIds: fundingSourceProcurementAgentIds,
                includePlannedShipments: includePlanningShipments
            }
            ReportService.ShipmentGlobalView(inputjson)
                .then(response => {
                    if (response.data.countrySplitList.length != 0) {
                        var table1Headers = [];
                        var lab = [];
                        var val = [];
                        var table1Body = [];
                        table1Headers = Object.keys(response.data.countrySplitList[0].amount);
                        table1Headers.unshift(i18n.t('static.dashboard.country'));
                        for (var item = 0; item < response.data.countrySplitList.length; item++) {
                            let obj = {
                                country: response.data.countrySplitList[item].country,
                                amount: Object.values(response.data.countrySplitList[item].amount),
                            }
                            table1Body.push(obj);
                        }
                        this.setState({
                            data: response.data,
                            countrySplitList: response.data.countrySplitList,
                            countryShipmentSplitList: response.data.countryShipmentSplitList,
                            table1Headers: table1Headers,
                            table1Body: table1Body,
                            lab: lab,
                            val: val,
                            loading: false
                        }, () => {
                            this.buildShipmentJexcel();
                        })
                    }
                    else {
                        this.setState({
                            data: response.data,
                            countrySplitList: response.data.countrySplitList,
                            countryShipmentSplitList: response.data.countryShipmentSplitList,
                            table1Headers: [],
                            table1Body: [],
                            lab: [],
                            val: [],
                            loading: false
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
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
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
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (this.state.countryValues.length == 0) {
            this.setState({
                message: i18n.t('static.program.validcountrytext'),
                data: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (this.state.programValues.length == 0) {
            this.setState({
                message: i18n.t('static.common.selectProgram'),
                data: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (planningUnitIds.length == 0) {
            this.setState({
                message: i18n.t('static.procurementUnit.validPlanningUnitText'),
                data: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (viewby == 1 && this.state.fundingSourceValues.length == 0) {
            this.setState({
                message: i18n.t('static.fundingSource.selectFundingSource'),
                data: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (viewby == 2 && this.state.procurementAgentValues.length == 0) {
            this.setState({
                message: i18n.t('static.procurementAgent.selectProcurementAgent'),
                data: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (viewby == 3 && this.state.procurementAgentTypeValues.length == 0) {
            this.setState({
                message: i18n.t('static.shipment.shipmentProcurementAgentType'),
                data: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (viewby == 4 && this.state.fundingSourceTypeValues.length == 0) {
            this.setState({
                message: i18n.t('static.shipment.selectFundingSourceType'),
                data: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        }
    }
    /**
     * Handles the change event for procurement agents.
     * @param {Array} procurementAgentIds - An array containing the selected procurement agent IDs.
     */
    handleProcurementAgentChange(procurementAgentIds) {
        procurementAgentIds = procurementAgentIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            procurementAgentValues: procurementAgentIds.map(ele => ele),
            procurementAgentLabels: procurementAgentIds.map(ele => ele.label),
            fundingSourceValues: [],
            fundingSourceLabels: [],
            procurementAgentTypeValues: [],
            procurementAgentTypeLabels: [],
            fundingSourceTypeValues: [],
            fundingSourceTypeLabels: []
        }, () => {
            this.fetchData();
        })
    }
    /**
     * Handles the change event for procurement agent types.
     * @param {Array} procurementAgentTypeIds - An array containing the selected procurement agent type IDs.
     */
    handleProcurementAgentTypeChange(procurementAgentTypeIds) {
        procurementAgentTypeIds = procurementAgentTypeIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            procurementAgentTypeValues: procurementAgentTypeIds.map(ele => ele),
            procurementAgentTypeLabels: procurementAgentTypeIds.map(ele => ele.label),
            fundingSourceValues: [],
            fundingSourceLabels: [],
            procurementAgentValues: [],
            procurementAgentLabels: [],
            fundingSourceTypeValues: [],
            fundingSourceTypeLabels: []
        }, () => {
            this.fetchData();
        })
    }
    /**
     * Handles the change event for funding sources.
     * @param {Array} fundingSourceIds - An array containing the selected funding source IDs.
     */
    handleFundingSourceChange(fundingSourceIds) {
        fundingSourceIds = fundingSourceIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            fundingSourceValues: fundingSourceIds.map(ele => ele),
            fundingSourceLabels: fundingSourceIds.map(ele => ele.label),
            procurementAgentValues: [],
            procurementAgentLabels: [],
            procurementAgentTypeValues: [],
            procurementAgentTypeLabels: [],
            fundingSourceTypeValues: [],
            fundingSourceTypeLabels: []
        }, () => {
            this.fetchData();
        })
    }
    handleFundingSourceTypeChange = (fundingSourceTypeIds) => {

        fundingSourceTypeIds = fundingSourceTypeIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            fundingSourceTypeValues: fundingSourceTypeIds.map(ele => ele),
            fundingSourceTypeLabels: fundingSourceTypeIds.map(ele => ele.label),
            fundingSourceValues: [],
            fundingSourceLabels: [],
            procurementAgentValues: [],
            procurementAgentLabels: [],
            procurementAgentTypeValues: [],
            procurementAgentTypeLabels: []
        }, () => {
            this.fetchData();
        })
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
            procurementAgentValues: [],
            procurementAgents: [],
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
                                programLst: listArray
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
                                    default:
                                        this.setState({
                                            message: 'static.unkownError',
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
    calculateTotals = (rows, amountKeysLength) => {

        let columnTotals = new Array(amountKeysLength).fill(0);
        let grandTotal = 0;

        rows.forEach(row => {
            for (let i = 0; i < amountKeysLength; i++) {
            columnTotals[i] += Number(row[i + 1]) || 0;
            }
            grandTotal += Number(row[row.length - 1]) || 0;
        });

        return [
            "Total",
            ...columnTotals.map(col => col.toLocaleString('en-US')),
            grandTotal.toLocaleString('en-US')
        ];
    }
    recalculateFooter = (instance) => {

        const data = instance.getData();
        const visibleRows = instance.results && instance.results.length > 0 ? instance.results : data.map((_, idx) => idx);

        if (!visibleRows || visibleRows.length === 0) {
            instance.setFooter([["Total"]]);
            return;
        }

        const columnCount = data[0].length;
        let totals = new Array(columnCount).fill(0);

        visibleRows.forEach(rowIndex => {
            const row = data[rowIndex];
            for (let col = 1; col < columnCount; col++) {
                // Remove commas before summing
                totals[col] += Number(row[col].toString().replace(/,/g, "")) || 0;
            }
        });

        for (let col = 1; col < columnCount; col++) {
            totals[col] = totals[col].toLocaleString('en-US'); 
        }

        totals[0] = "Total";

        instance.setFooter([totals]);
    };
    /**
     * Renders the Shipment Global View report table.
     * @returns {JSX.Element} - Shipment Global View report table.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { procurementAgents } = this.state;
        let procurementAgentList = [];
        procurementAgentList = procurementAgents.length > 0
            && procurementAgents.map((item, i) => {
                return (
                    { label: item.code, value: item.id }
                )
            }, this);
        const { procurementAgentTypes } = this.state;
        let procurementAgentTypeList = [];
        procurementAgentTypeList = procurementAgentTypes.length > 0
            && procurementAgentTypes.map((item, i) => {
                return (
                    { label: item.procurementAgentTypeCode, value: item.procurementAgentTypeId }
                )
            }, this);
        const { fundingSources } = this.state;
        let fundingSourceList = [];
        fundingSourceList = fundingSources.length > 0
            && fundingSources.map((item, i) => {
                return (
                    { label: item.code, value: item.id }
                )
            }, this);
        const { fundingSourceTypes } = this.state;
        let fundingSourceTypeList = [];
        fundingSourceTypeList = fundingSourceTypes.length > 0
            && fundingSourceTypes.map((item, i) => {
                return (
                    { label: item.code, value: item.id }
                )
            }, this);

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
        const { planningUnitList, lang } = this.state;
        let puList = planningUnitList.length > 0 && planningUnitList.sort(function (a, b) {
        a = getLabelText(a.label, lang).toLowerCase();
        b = getLabelText(b.label, lang).toLowerCase();
        return a < b ? -1 : a > b ? 1 : 0;
        }).map((item, i) => {
        return ({ label: getLabelText(item.label, this.state.lang) + " | " + item.id, value: item.id })
        }, this);
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
            '#d4bbff', '#BA0C2F', '#757575', '#0067B9', '#A7C6ED',
            '#EEE4B1', '#ba4e00', '#6C6463', '#BC8985', '#cfcdc9',
            '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
            '#d4bbff', '#BA0C2F', '#757575', '#0067B9', '#A7C6ED',
            '#EEE4B1', '#ba4e00', '#6C6463', '#BC8985', '#cfcdc9',
            '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
            '#d4bbff', '#BA0C2F', '#757575', '#0067B9', '#A7C6ED',
        ]
        const { isDarkMode } = this.state;
        const backgroundColor = isDarkMode ? darkModeColors : lightModeColors;
        const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
        const gridLineColor = isDarkMode ? '#444' : '#e0e0e0';

        const options = {
            title: {
                display: true,
                text: (this.state.yaxisEquUnit == -1 ? this.state.planningUnitLabels[0] : this.state.yaxisEquUnitLabel[0] ),
                fontColor: fontColor
            },
            scales: {
                xAxes: [{
                    labelMaxWidth: 100,
                    stacked: true,
                    fontColor: fontColor,
                    gridLines: {
                        display: true,
                        lineWidth: 0,
                        color: gridLineColor,
                        zeroLineColor: gridLineColor
                    },
                    ticks: {
                        fontColor: fontColor,
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: i18n.t("static.report.qty"),
                        fontColor: fontColor
                    },
                    stacked: true,
                    labelString: i18n.t('static.shipment.amount'),
                    fontColor: fontColor,
                    ticks: {
                        beginAtZero: true,
                        fontColor: fontColor,
                        callback: function (value) {
                            var cell1 = value
                            cell1 += '';
                            var x = cell1.split('.');
                            var x1 = x[0];
                            var x2 = x.length > 1 ? '.' + x[1] : '';
                            var rgx = /(\d+)(\d{3})/;
                            while (rgx.test(x1)) {
                                x1 = x1.replace(rgx, '$1' + ',' + '$2');
                            }
                            return x1 + x2;
                        }
                    },
                    gridLines: {
                        display: true,
                        lineWidth: 0,
                        color: gridLineColor,
                        zeroLineColor: gridLineColor
                    },
                }
                ],
            },
            tooltips: {
                enabled: false,
                custom: CustomTooltips,
                callbacks: {
                    label: function (tooltipItem, data) {
                        let label = data.labels[tooltipItem.index];
                        let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        var cell1 = value
                        cell1 += '';
                        var x = cell1.split('.');
                        var x1 = x[0];
                        var x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                            x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        }
                        return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
                    }
                }
            },
            maintainAspectRatio: false
            ,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: fontColor
                }
            }
        }
        
        const countrySplitList = (this.state.countrySplitList || []).slice().sort((a, b) => 
            a.country.label.label_en.localeCompare(b.country.label.label_en)
        );

        const amountKeys =
        countrySplitList.length > 0
            ? Object.keys(countrySplitList[0].amount || {}).sort((a, b) => a.localeCompare(b))
            : [];

        const datasets = amountKeys.map((key, index) => ({
            label: key,
            data: countrySplitList.map(ele => ele.amount?.[key] || 0),
            backgroundColor: backgroundColor[index], // optional dynamic color function
            borderWidth: 0
        }));

        const bar = {
            labels: countrySplitList.map(
                ele => ele.country.label.label_en
            ),
            datasets: datasets
        };
        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon">
                        {(this.state.countrySplitList.length > 0 || this.state.countryShipmentSplitList.length > 0) &&
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
                                    {(this.state.countrySplitList.length > 0) &&
                                        <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                                    }
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
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="viewById"
                                                        id="viewById"
                                                        bsSize="sm"
                                                        onChange={this.toggleView}
                                                    >
                                                        <option value="1">{i18n.t('static.fundingSourceHead.fundingSource')}</option>
                                                        {/* <option value="4">{i18n.t('static.funderTypeHead.funderType')}</option> */}
                                                        <option value="2">{i18n.t('static.report.procurementAgentName')}</option>
                                                        {/* <option value="3">{i18n.t('static.dashboard.procurementagentType')}</option> */}
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3" id="procurementAgentDiv">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.procurementAgentName')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls ">
                                                <MultiSelect
                                                    name="procurementAgentId"
                                                    id="procurementAgentId"
                                                    bsSize="sm"
                                                    value={this.state.procurementAgentValues}
                                                    onChange={(e) => { this.handleProcurementAgentChange(e) }}
                                                    options={procurementAgentList && procurementAgentList.length > 0 ? procurementAgentList : []}
                                                    filterOptions={filterOptions}
                                                    overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                    selectSomeItems: i18n.t('static.common.select')}}
                                                />
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3" id="procurementAgentTypeDiv">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.procurementagentType')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls ">
                                                <MultiSelect
                                                    name="procurementAgentTypeId"
                                                    id="procurementAgentTypeId"
                                                    bsSize="sm"
                                                    value={this.state.procurementAgentTypeValues}
                                                    onChange={(e) => { this.handleProcurementAgentTypeChange(e) }}
                                                    options={procurementAgentTypeList && procurementAgentTypeList.length > 0 ? procurementAgentTypeList : []}
                                                    filterOptions={filterOptions}
                                                    overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                    selectSomeItems: i18n.t('static.common.select')}}
                                                />
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3" id="fundingSourceDiv">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.fundingSourceHead.fundingSource')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls ">
                                                <MultiSelect
                                                    name="fundingSourceId"
                                                    id="fundingSourceId"
                                                    bsSize="sm"
                                                    value={this.state.fundingSourceValues}
                                                    onChange={(e) => { this.handleFundingSourceChange(e) }}
                                                    options={fundingSourceList && fundingSourceList.length > 0 ? fundingSourceList : []}
                                                    disabled={this.state.loading}
                                                    filterOptions={filterOptions}
                                                    overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                        selectSomeItems: i18n.t('static.common.select')}}
                                                />
                                            </div>
                                        </FormGroup>
                                        <FormGroup id="fundingSourceTypeDiv" className="col-md-3" style={{ zIndex: "1" }} >
                                            <Label htmlFor="fundingSourceTypeId">{i18n.t('static.funderTypeHead.funderType')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls">
                                                <MultiSelect
                                                    name="fundingSourceTypeId"
                                                    id="fundingSourceTypeId"
                                                    bsSize="md"
                                                    value={this.state.fundingSourceTypeValues}
                                                    onChange={(e) => { this.handleFundingSourceTypeChange(e) }}
                                                    options={fundingSourceTypeList && fundingSourceTypeList.length > 0 ? fundingSourceTypeList : []}
                                                    disabled={this.state.loading}
                                                    filterOptions={filterOptions}
                                                    overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                    selectSomeItems: i18n.t('static.common.select')}}
                                                />
                                            </div>
                                        </FormGroup>
                                        {/* <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="includePlanningShipments"
                                                        id="includePlanningShipments"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.fetchData() }}
                                                    >
                                                        <option value="true">{i18n.t('static.program.yes')}</option>
                                                        <option value="false">{i18n.t('static.program.no')}</option>
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup> */}
                                    </div>
                                </div>
                            </Form>
                            <div style={{ display: this.state.loading ? "none" : "block" }}>
                                <Col md="12 pl-0">
                                    <div className="row grid-divider">
                                        {this.state.countryShipmentSplitList.length > 0 && 
                                            <>
                                                <div className="col-md-6">
                                                    <div className="chart-wrapper chart-graph-report">
                                                        <Bar id="cool-canvas1" data={bar} options={options} />
                                                    </div>
                                                </div>
                                                <div className="col-md-6 world-map-container">
                                                    <WorldMap 
                                                        countrySplitList={this.state.countrySplitList} 
                                                        title={(this.state.yaxisEquUnit == -1 ? this.state.planningUnitLabels[0] : this.state.yaxisEquUnitLabel[0] )}
                                                    />
                                                </div>
                                            </>
                                        }
                                    </div>
                                </Col>
                                <Col md="12 pl-0">
                                    <div className="globalviwe-scroll">
                                        <div className="row">
                                            <div className="col-md-12">
                                                {this.state.table1Body.length > 0 &&
                                                <CardBody className="pl-lg-1 pr-lg-1 pt-lg-0">
                                                    <div id="shipmentJexcel" className='jexcelremoveReadonlybackground shipmentJexcel' style={{ padding: '2px 8px' }}></div>
                                                </CardBody>
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
export default ShipmentGlobalView;