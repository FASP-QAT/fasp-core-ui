import jsPDF from "jspdf";
import jexcel from 'jspreadsheet';
import moment from "moment";
import React, { Component } from 'react';
import {
    Button,
    Modal, ModalBody, ModalFooter, ModalHeader
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import { LOGO } from '../../CommonComponent/Logo';
import getLabelText from '../../CommonComponent/getLabelText';
import { DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, LATEST_VERSION_COLOUR, LOCAL_VERSION_COLOUR, TITLE_FONT } from '../../Constants';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService';
export default class CompareVersionTableCompareVersion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datasetData: {},
            datasetData1: {},
            regionList: [],
            regionList1: [],
            regionList2: []
        }
        this.loaded = this.loaded.bind(this);
        this.exportCSV = this.exportCSV.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
        this.showData = this.showData.bind(this);
        this.acceptCurrentChanges = this.acceptCurrentChanges.bind(this);
        this.acceptIncomingChanges = this.acceptIncomingChanges.bind(this);
    }
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    formatter = value => {
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
    exportPDF() {
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
                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')
                doc.text(i18n.t('static.supplyPlan.runDate') + " " + moment(new Date()).format(`${DATE_FORMAT_CAP}`), doc.internal.pageSize.width - 40, 20, {
                    align: 'right'
                })
                doc.text(i18n.t('static.supplyPlan.runTime') + " " + moment(new Date()).format('hh:mm A'), doc.internal.pageSize.width - 40, 30, {
                    align: 'right'
                })
                doc.text(i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername(), doc.internal.pageSize.width - 40, 40, {
                    align: 'right'
                })
                doc.text(this.props.datasetData.programCode, doc.internal.pageSize.width - 40, 50, {
                    align: 'right'
                })
                doc.text(getLabelText(this.props.datasetData.label, this.state.lang), doc.internal.pageSize.width - 40, 60, {
                    align: 'right'
                })
                doc.setFontSize(TITLE_FONT)
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.compareVersion'), doc.internal.pageSize.width / 2, 80, {
                    align: 'center'
                })
                if (i == 1) {
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
        var y = 100;
        doc.text(i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 20, y, {
            align: 'left'
        })
        doc.text(i18n.t('static.common.forecastPeriod') + ' : ' + moment(this.props.datasetData.currentVersion.forecastStartDate).format(DATE_FORMAT_CAP_WITHOUT_DATE) + " - " + moment(this.props.datasetData.currentVersion.forecastStopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE), doc.internal.pageSize.width / 3, y, {
            align: 'left'
        })
        doc.text(i18n.t('static.common.note') + ' : ' + this.props.datasetData.currentVersion.notes, doc.internal.pageSize.width / 2, y, {
            align: 'left'
        })
        y = y + 10;
        doc.text(i18n.t('static.compareVersion.compareWithVersion') + ' : ' + document.getElementById("versionId1").selectedOptions[0].text, doc.internal.pageSize.width / 20, y, {
            align: 'left'
        })
        doc.text(i18n.t('static.common.forecastPeriod') + ' : ' + moment(this.props.datasetData1.currentVersion.forecastStartDate).format(DATE_FORMAT_CAP_WITHOUT_DATE) + " - " + moment(this.props.datasetData1.currentVersion.forecastStopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE), doc.internal.pageSize.width / 3, y, {
            align: 'left'
        })
        doc.text(i18n.t('static.common.note') + ' : ' + this.props.datasetData1.currentVersion.notes, doc.internal.pageSize.width / 2, y, {
            align: 'left'
        })
        y = y + 10;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        let startY = y + 10
        let pages = Math.ceil(startY / height)
        for (var j = 1; j < pages; j++) {
            doc.addPage()
        }
        let startYtable = startY - ((height - h1) * (pages - 1))
        var columns = [];
        this.state.columns.filter(c => c.type != 'hidden').map((item, idx) => { columns.push(item.title) });
        const headers2 = [
            { content: '', colSpan: 1 },
            { content: '', colSpan: 1 },
            { content: this.props.versionLabel, colSpan: 3 },
            { content: this.props.versionLabel1, colSpan: 3 }
        ];
        var dataArr = [];
        var dataArr1 = [];
        this.state.dataEl.getJson(null, false).map(ele => {
            dataArr = [];
            this.state.columns.map((item, idx) => {
                if (item.type != 'hidden') {
                    if (item.type == 'numeric') {
                        dataArr.push(this.formatter(ele[idx]));
                    } else {
                        dataArr.push(ele[idx]);
                    }
                }
            })
            dataArr1.push(dataArr);
        })
        const data = dataArr1;
        let content = {
            margin: { top: 100, bottom: 50 },
            startY: startYtable,
            head: [headers2, columns],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(this.props.datasetData.programCode + "-" + i18n.t('static.dashboard.compareVersion').concat('.pdf'));
    }
    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' : ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' : ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.user.user') + ' : ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (this.props.datasetData.programCode).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (getLabelText(this.props.datasetData.label, this.state.lang)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.common.forecastPeriod') + ' : ' + moment(this.props.datasetData.currentVersion.forecastStartDate).format(DATE_FORMAT_CAP_WITHOUT_DATE) + " - " + moment(this.props.datasetData.currentVersion.forecastStopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE)).replaceAll(" ", '%20') + '"')
        csvRow.push('"' + (i18n.t('static.common.note') + ' : ' + this.props.datasetData.currentVersion.notes).replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', '') + '"')
        csvRow.push('"' + (i18n.t('static.compareVersion.compareWithVersion') + ' : ' + document.getElementById("versionId1").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.common.forecastPeriod') + ' : ' + moment(this.props.datasetData1.currentVersion.forecastStartDate).format(DATE_FORMAT_CAP_WITHOUT_DATE) + " - " + moment(this.props.datasetData1.currentVersion.forecastStopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE)).replaceAll(" ", '%20') + '"')
        csvRow.push('"' + (i18n.t('static.common.note') + ' : ' + this.props.datasetData1.currentVersion.notes).replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', '') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var re;
        var columns = [];
        const headers = [];
        this.state.columns.filter(c => c.type != 'hidden').map((item, idx) => { headers[idx] = (item.title).replaceAll(' ', '%20') });
        var A = [this.addDoubleQuoteToRowContent(headers)];
        var C = [this.addDoubleQuoteToRowContent(["", "", this.props.versionLabel, this.props.versionLabel, this.props.versionLabel, this.props.versionLabel1, this.props.versionLabel1, this.props.versionLabel1])];
        var B = []
        this.state.dataEl.getJson(null, false).map(ele => {
            B = [];
            this.state.columns.map((item, idx) => {
                if (item.type != 'hidden') {
                    B.push(ele[idx].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23'));
                }
            })
            A.push(this.addDoubleQuoteToRowContent(B));
        })
        for (var i = 0; i < C.length; i++) {
            csvRow.push(C[i].join(","))
        }
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = this.props.datasetData.programCode + "-" + i18n.t('static.dashboard.compareVersion') + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    componentDidMount() {
        this.props.updateState("loading", true);
        var datasetData = this.props.datasetData;
        var datasetData1 = this.props.datasetData1;
        var datasetData2 = this.props.datasetData2;
        var page = this.props.page;
        var planningUnitList = []
        if (page != "compareVersion") {
            planningUnitList = (datasetData.planningUnitList.filter(c => c.active.toString() == "true")).sort(function (a, b) {
                a = getLabelText(a.planningUnit.label, this.state.lang).toLowerCase();
                b = getLabelText(b.planningUnit.label, this.state.lang).toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
            }.bind(this));
        } else {
            planningUnitList = (datasetData.planningUnitList).concat(datasetData1.planningUnitList).concat(datasetData2.planningUnitList).sort(function (a, b) {
                a = getLabelText(a.planningUnit.label, this.state.lang).toLowerCase();
                b = getLabelText(b.planningUnit.label, this.state.lang).toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
            }.bind(this));
        }
        var planningUnitSet = [...new Set(planningUnitList.map(ele => (ele.planningUnit.id)))]
        let dataArray = [];
        let data = [];
        let columns = [];
        let nestedHeaders = [];
        var regionList = datasetData.regionList;
        var regionList1 = datasetData1.regionList;
        var regionList2 = datasetData2.regionList;
        var combineRegionList = [];
        if (page != "compareVersion") {
            combineRegionList = (regionList).sort(function (a, b) {
                a = getLabelText(a.label, this.state.lang).toLowerCase();
                b = getLabelText(b.label, this.state.lang).toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
            }.bind(this));
        } else {
            combineRegionList = (regionList).concat(regionList1).concat(regionList2).sort(function (a, b) {
                a = getLabelText(a.label, this.state.lang).toLowerCase();
                b = getLabelText(b.label, this.state.lang).toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
            }.bind(this));
        }
        var regionSet = [...new Set(combineRegionList.map(ele => (ele.regionId)))]
        this.setState({
            regionList: regionList, regionList1: regionList1, regionList2: regionList2
        })
        nestedHeaders.push(
            [
                {
                    title: '',
                    colspan: '1'
                },
                {
                    title: '',
                    colspan: '1'
                },
                {
                    title: this.props.versionLabel,
                    colspan: 3,
                },
                {
                    title: this.props.versionLabel1,
                    colspan: 3,
                },
            ]
        );
        columns.push({ title: i18n.t('static.consumption.planningunit'), width: 300 })
        columns.push({ title: i18n.t('static.dashboard.regionreport'), width: 100 })
        columns.push({ title: i18n.t('static.compareVersion.selectedForecast'), width: 200 })
        columns.push({ title: i18n.t('static.compareVersion.forecastQty'), width: 120, type: 'numeric', mask: '#,##.00', decimal: '.' })
        columns.push({ title: i18n.t('static.program.notes'), width: 210 })
        columns.push({ title: i18n.t('static.compareVersion.selectedForecast'), width: 200 })
        columns.push({ title: i18n.t('static.compareVersion.forecastQty'), width: 120, type: 'numeric', mask: '#,##.00', decimal: '.' })
        columns.push({ title: i18n.t('static.program.notes'), width: 210 })
        columns.push({ title: i18n.t('static.compareVersion.selectedForecast'), width: 200, type: 'hidden' })
        columns.push({ title: i18n.t('static.compareVersion.forecastQty'), width: 120, type: 'hidden' })
        columns.push({ title: i18n.t('static.program.notes'), width: 210, type: 'hidden' })
        for (var j = 0; j < planningUnitSet.length; j++) {
            for (var k = 0; k < regionSet.length; k++) {
                data = [];
                var pu = datasetData.planningUnitList.filter(c => c.planningUnit.id == planningUnitSet[j]);
                var pu1 = datasetData1.planningUnitList.filter(c => c.planningUnit.id == planningUnitSet[j]);
                var pu2 = datasetData2.planningUnitList.filter(c => c.planningUnit.id == planningUnitSet[j]);
                var rg = regionList.filter(c => c.regionId == regionSet[k]);
                var rg1 = regionList1.filter(c => c.regionId == regionSet[k]);
                var rg2 = regionList2.filter(c => c.regionId == regionSet[k]);
                var selectedForecastData = pu.length > 0 ? pu[0].selectedForecastMap : '';
                var selectedForecastData1 = pu1.length > 0 ? pu1[0].selectedForecastMap : '';
                var selectedForecastData2 = pu2.length > 0 ? pu2[0].selectedForecastMap : '';
                var puFiltered = pu.filter(c => c.region.id == regionSet[k]);
                var puFiltered1 = pu1.filter(c => c.region.id == regionSet[k]);
                data[0] = pu.length > 0 ? getLabelText(pu[0].planningUnit.label, this.state.lang) + " | " + pu[0].planningUnit.id : getLabelText(pu1[0].planningUnit.label) + " | " + pu1[0].planningUnit.id;
                data[1] = rg.length > 0 ? getLabelText(rg[0].label) : getLabelText(rg1[0].label);
                data[2] = puFiltered.length > 0 ? getLabelText(puFiltered[0].selectedForecast) : ""
                data[3] = puFiltered.length > 0 ? puFiltered[0].totalForecast !== "" && puFiltered[0].totalForecast != null ? Number(puFiltered[0].totalForecast).toFixed(2) : "" : "";
                data[4] = puFiltered.length > 0 ? (puFiltered[0].notes != null && puFiltered[0].notes != '' ? puFiltered[0].notes.label_en : '') : ""
                data[5] = puFiltered1.length > 0 ? getLabelText(puFiltered1[0].selectedForecast) : ""
                data[6] = puFiltered1.length > 0 ? puFiltered1[0].totalForecast !== "" && puFiltered1[0].totalForecast != null ? Number(puFiltered1[0].totalForecast).toFixed(2) : "" : "";
                data[7] = puFiltered1.length > 0 ? (puFiltered1[0].notes != null && puFiltered1[0].notes != '' ? puFiltered1[0].notes.label_en : '') : ""
                data[8] = ""
                data[9] = ""
                data[10] = ""
                dataArray.push(data);
            }
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var options = {
            data: dataArray,
            columnDrag: true,
            colHeaderClasses: ["Reqasterisk"],
            columns: columns,
            nestedHeaders: nestedHeaders,
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            editable: false,
            license: JEXCEL_PRO_KEY,
            editable: false,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                return items;
            }.bind(this),
        };
        var dataEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = dataEl;
        this.setState({
            dataEl: dataEl,
            columns: columns
        })
        this.props.updateState("loading", false);
    }
    toggleLarge(data, index) {
        this.setState({
            conflicts: !this.state.conflicts,
            index: index
        });
        if (index != -1) {
            this.showData(data, index);
        }
    }
    showData(data, index) {
        var dataArray = [];
        dataArray.push([data[0], data[1], data[2], data[3], data[4]]);
        dataArray.push([data[0], data[1], data[5], data[6], data[7]]);
        var options = {
            data: dataArray,
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.planningunit.planningunit'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.region.region'),
                    type: 'text',
                },
                {
                    title: "Selected Forecast",
                    type: 'text',
                },
                {
                    title: "Forecast Qty",
                    type: 'text',
                },
                {
                    title: "Notes",
                    type: 'text',
                }
            ],
            pagination: false,
            search: false,
            columnSorting: false,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            editable: false,
            filters: false,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
            onload: this.loadedResolveConflicts
        };
        var resolveConflict = jexcel(document.getElementById("resolveConflictsTable"), options);
        this.el = resolveConflict;
        this.setState({
            resolveConflict: resolveConflict,
            loading: false
        })
        document.getElementById("index").value = index;
    }
    loadedResolveConflicts = function (instance) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var elInstance = instance.worksheets[0];
        var jsonData = elInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E']
        for (var j = 0; j < 8; j++) {
            if (j == 2 || j == 3 || j == 4) {
                var col = (colArr[j]).concat(1);
                var col1 = (colArr[j]).concat(2);
                var valueToCompare = (jsonData[0])[j];
                var valueToCompareWith = (jsonData[1])[j];
                if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col1, "background-color", "transparent");
                } else {
                    elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                    elInstance.setStyle(col1, "background-color", LATEST_VERSION_COLOUR);
                }
            }
        }
    }
    acceptCurrentChanges() {
        var elInstance = this.state.dataEl;
        elInstance.options.editable = true;
        elInstance.setValueFromCoords(11, this.state.index, 1, true);
        elInstance.options.editable = false;
        this.props.updateState("json", elInstance.getJson(null, false));
        this.toggleLarge([], -1);
    }
    acceptIncomingChanges() {
        var elInstance = this.state.dataEl;
        elInstance.options.editable = true;
        elInstance.setValueFromCoords(11, this.state.index, 3, true);
        elInstance.options.editable = false;
        this.props.updateState("json", elInstance.getJson(null, false));
        this.toggleLarge([], -1);
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        if (this.props.page == "commit") {
            var elInstance = instance.worksheets[0];
            var json = elInstance.getJson(null, false);
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X']
            for (var r = 0; r < json.length; r++) {
                var startPt = 2;
                var startPt1 = 5;
                var startPt2 = 8;
                for (var i = 0; startPt < startPt1; i++) {
                    var local = (json[r])[startPt]
                    var server = (json[r])[startPt1 + i]
                    var downloaded = (json[r])[startPt2 + i]
                    if (local == server) {
                    } else {
                        if (local == downloaded) {
                            var col = (colArr[startPt1 + i]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                        } else if (server == downloaded) {
                            var col = (colArr[startPt]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                        } else {
                            var col = (colArr[0]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            var col = (colArr[1]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            var col = (colArr[2]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            var col = (colArr[3]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            var col = (colArr[4]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            var col = (colArr[5]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            var col = (colArr[6]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            var col = (colArr[7]).concat(parseInt(r) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                        }
                    }
                    startPt += 1;
                }
            }
        }
        else {
            var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
            var tr = asterisk.firstChild.nextSibling;
            tr.children[3].classList.add('InfoTr');
            tr.children[4].classList.add('InfoTr');
            tr.children[6].classList.add('InfoTr');
            tr.children[7].classList.add('InfoTr');
            tr.children[3].title = i18n.t('static.compareVersion.selectedForecastTitle');
            tr.children[4].title = i18n.t('static.compareVersion.selectedForecastQtyTitle');
            tr.children[6].title = i18n.t('static.compareVersion.selectedForecastTitle');
            tr.children[7].title = i18n.t('static.compareVersion.selectedForecastQtyTitle');
        }
    }
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <div>
                <Modal isOpen={this.state.conflicts}
                    className={'modal-lg ' + this.props.className + "modalWidth"} style={{ display: this.state.loading ? "none" : "block" }}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.commitVersion.resolveConflicts')}</strong>
                        <ul className="legendcommitversion">
                            <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')}</span></li>
                            <li><span className="notawesome  legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
                        </ul>
                    </ModalHeader>
                    <ModalBody>
                        <div className="table-responsive RemoveStriped">
                            <div id="resolveConflictsTable" />
                            <input type="hidden" id="index" />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.acceptCurrentChanges}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptCurrentVersion')}</Button>{' '}
                        <Button type="submit" size="md" className="acceptLocalChnagesButton submitBtn float-right mr-1" onClick={this.acceptIncomingChanges}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptLatestVersion')}</Button>{' '}
                    </ModalFooter>
                </Modal>
            </div>)
    }
}