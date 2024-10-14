import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle } from '@coreui/coreui-pro/dist/js/coreui-utilities';
import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import React, { Component } from 'react';
import { HorizontalBar, Pie } from 'react-chartjs-2';
import Chart from 'chart.js';
import Picker from 'react-month-picker';
import { MultiSelect } from 'react-multi-select-component';
import {
    Card,
    CardBody,
    Col,
    Form,
    FormGroup, Input, InputGroup,
    Label,
    Table
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import FundingSourceService from '../../api/FundingSourceService';
import ProductService from '../../api/ProductService';
import RealmService from '../../api/RealmService';
import ReportService from '../../api/ReportService';
import ShipmentStatusService from '../../api/ShipmentStatusService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, filterOptions, makeText, roundARU } from '../../CommonComponent/JavascriptCommonFunctions';
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
// const options = {
//     plugins: {
//         datalabels: {
//             formatter: (value, context) => {
//                 return ``;
//             },
//         },
//     },
//     title: {
//         display: true,
//         text: i18n.t('static.dashboard.shipmentGlobalViewheader'),
//         fontColor: 'black'
//     },
//     scales: {
//         xAxes: [{
//             stacked: true,
//             scaleLabel: {
//                 display: true,
//                 labelString: i18n.t('static.shipment.qty'),
//                 fontColor: 'black',
//                 fontStyle: "normal",
//                 fontSize: "12"
//             },
//             ticks: {
//                 beginAtZero: true,
//                 fontColor: 'black',
//                 callback: function (value) {
//                     var cell1 = value
//                     cell1 += '';
//                     var x = cell1.split('.');
//                     var x1 = x[0];
//                     var x2 = x.length > 1 ? '.' + x[1] : '';
//                     var rgx = /(\d+)(\d{3})/;
//                     while (rgx.test(x1)) {
//                         x1 = x1.replace(rgx, '$1' + ',' + '$2');
//                     }
//                     return x1 + x2;
//                 }
//             },
//             gridLines: {
//                 display: false
//             }
//         }],
//         yAxes: [{
//             stacked: true,
//             labelString: i18n.t('static.common.product'),
//             ticks: {
//                 callback: function (value) {
//                     return (value.length > 40) ? value.substr(0, 40) + "..." : value;
//                 },
//             }
//         }],
//     },
//     tooltips: {
//         enabled: false,
//         custom: CustomTooltips,
//         callbacks: {
//             label: function (tooltipItem, data) {
//                 let label = data.labels[tooltipItem.index];
//                 let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
//                 var cell1 = value
//                 cell1 += '';
//                 var x = cell1.split('.');
//                 var x1 = x[0];
//                 var x2 = x.length > 1 ? '.' + x[1] : '';
//                 var rgx = /(\d+)(\d{3})/;
//                 while (rgx.test(x1)) {
//                     x1 = x1.replace(rgx, '$1' + ',' + '$2');
//                 }
//                 return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
//             }
//         }
//     },
//     maintainAspectRatio: false
//     ,
//     legend: {
//         display: true,
//         position: 'bottom',
//         labels: {
//             usePointStyle: true,
//             fontColor: 'black'
//         }
//     }
// }
// const options1 = {
//     plugins: {
//         datalabels: {
//             formatter: (value, context) => {
//                 return ``;
//             },
//         },
//     },
//     title: {
//         display: true,
//         text: i18n.t('static.dashboard.shipmentGlobalViewheader'),
//         fontColor: 'black'
//     },
//     scales: {
//         xAxes: [{
//             stacked: true,
//             scaleLabel: {
//                 display: true,
//                 labelString: i18n.t('static.shipment.qty'),
//                 fontColor: 'black',
//                 fontStyle: "normal",
//                 fontSize: "12"
//             },
//             ticks: {
//                 beginAtZero: true,
//                 fontColor: 'black',
//                 callback: function (value) {
//                     var cell1 = value
//                     cell1 += '';
//                     var x = cell1.split('.');
//                     var x1 = x[0];
//                     var x2 = x.length > 1 ? '.' + x[1] : '';
//                     var rgx = /(\d+)(\d{3})/;
//                     while (rgx.test(x1)) {
//                         x1 = x1.replace(rgx, '$1' + ',' + '$2');
//                     }
//                     return x1 + x2;
//                 }
//             },
//             gridLines: {
//                 display: false
//             }
//         }],
//         yAxes: [{
//             stacked: true,
//             labelString: i18n.t('static.common.product')
//         }],
//     },
//     maintainAspectRatio: false,
//     legend: {
//         display: true,
//         position: 'bottom',
//         labels: {
//             usePointStyle: true,
//             fontColor: 'black'
//         }
//     }
// }
/*const optionsPie = {
    title: {
        display: true,
        // text: document.getElementById("groupByFundingSourceType").value ? i18n.t('static.funderTypeHead.funderType') : i18n.t('static.fundingSourceHead.fundingSource'),
        text: i18n.t('static.fundingSourceHead.fundingSource'),
        fontColor: 'black',
        padding: 30
    },
    legend: {
        position: 'bottom',
        labels: {
            padding: 25
        }
    },
    tooltips: {
        callbacks: {
            label: function (tooltipItems, data) {
                return data.labels[tooltipItems.index] +
                    " : " + " $ " +
                    (data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index]).toLocaleString();
            }
        }
    },
}*/
/**
 * Component for Shipment Global Demand View Report.
 */
class ShipmentGlobalDemandView extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            labels: ['PSM', 'GF', 'Local', 'Govt'],
            datasets: [{
                data: [5615266, 13824000, 0, 26849952],
                backgroundColor: ['#4dbd74', '#f86c6b', '#8aa9e6', '#EDB944'],
                legend: {
                    position: 'bottom'
                }
            }],
            isDarkMode: false,
            dropdownOpen: false,
            radioSelected: 2,
            lang: localStorage.getItem('lang'),
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
            countrys: [],
            countryValues: [],
            countryLabels: [],
            data: [],
            realmList: [],
            fundingSourceSplit: [],
            planningUnitSplit: [],
            procurementAgentSplit: [],
            table1Headers: [],
            show: false,
            message: '',
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS, month: new Date().getMonth() + 1 },
            loading: true,
            programLst: [],
            procurementAgentTypeId: false,
            fundingSourceTypes: [],
            fundingSourceTypeValues: [],
            fundingSourceTypeLabels: [],
            groupByFundingSourceType: false,
            groupBy: 1
        };
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.getPrograms = this.getPrograms.bind(this)
        this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.getFundingSourceType = this.getFundingSourceType.bind(this);
    }
    /**
     * Exports the data to a CSV file.
     */
    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        if (localStorage.getItem("sessionType") === 'Online') {
            this.state.countryLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
            csvRow.push('')
            this.state.programLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
            csvRow.push('')
            this.state.planningUnitLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + ele.toString()).replaceAll('#', '%23').replaceAll(' ', '%20') + '"'));
            // csvRow.push('')
            // this.state.fundingSourceTypeLabels.map(ele =>
            //     csvRow.push('"' + (i18n.t('static.funderTypeHead.funderType') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'));
            csvRow.push('')
            this.state.fundingSourceLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.budget.fundingsource') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'));
            csvRow.push('')
            this.state.shipmentStatusLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.common.status') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
            csvRow.push('')
            csvRow.push('"' + (i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
            csvRow.push('')
            csvRow.push('"' + (i18n.t('static.shipment.groupByProcurementAgentType') + ' : ' + (this.state.procurementAgentTypeId ? "Yes" : "No")).replaceAll(' ', '%20') + '"')
            // csvRow.push('')
            // csvRow.push('"' + (i18n.t('static.shipment.groupByFundingSourceType') + ' : ' + (this.state.groupByFundingSourceType ? "Yes" : "No")).replaceAll(' ', '%20') + '"')
        } else {
            csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
            csvRow.push('')
            csvRow.push('"' + (i18n.t('static.report.version') + '  :  ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
            csvRow.push('')
            this.state.planningUnitLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'));
            csvRow.push('')
            this.state.fundingSourceLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.budget.fundingsource') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'));
            csvRow.push('')
            this.state.shipmentStatusLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.common.status') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
        }
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var re;
        if (this.state.procurementAgentSplit.length > 0) {
            var A = [];
            let tableHead = this.state.table1Headers;
            let tableHeadTemp = [];
            tableHeadTemp.push(i18n.t('static.report.qatPID').replaceAll(' ', '%20'));
            tableHeadTemp.push(i18n.t('static.dashboard.product').replaceAll(' ', '%20'));
            for (var i = 0; i < tableHead.length; i++) {
                tableHeadTemp.push((tableHead[i].replaceAll(',', ' ')).replaceAll(' ', '%20'));
            }
            tableHeadTemp.push(i18n.t('static.report.totalUnit').replaceAll(' ', '%20'));
            A[0] = addDoubleQuoteToRowContent(tableHeadTemp);
            re = this.state.procurementAgentSplit;
            for (var item = 0; item < re.length; item++) {
                let item1 = Object.values(re[item].procurementAgentQty);
                A.push([addDoubleQuoteToRowContent([re[item].planningUnit.id, (getLabelText(re[item].planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ...item1, re[item].total])])
            }
            for (var i = 0; i < A.length; i++) {
                csvRow.push(A[i].join(","))
            }
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.shipmentGlobalDemandViewheader') + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to) + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    /**
     * Exports the data to a PDF file.
     */
    exportPDF = () => {
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
                doc.text(i18n.t('static.dashboard.shipmentGlobalDemandViewheader'), doc.internal.pageSize.width / 2, 60, {
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
        doc.setTextColor("#002f6c");
        var len = 120
        if (localStorage.getItem("sessionType") === 'Online') {
            var countryLabelsText = doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
            doc.text(doc.internal.pageSize.width / 8, 110, countryLabelsText)
            len = len + countryLabelsText.length * 10
            var planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
            doc.text(doc.internal.pageSize.width / 8, len, planningText)
            len = len + planningText.length * 10
        } else {
            doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                align: 'left'
            })
            doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                align: 'left'
            })
            var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
        }
        doc.setFontSize(8);
        doc.setTextColor("#002f6c");
        var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
        let y = localStorage.getItem("sessionType") === 'Online' ? len : 150

        // var fundingSourceTypeText = doc.splitTextToSize((i18n.t('static.funderTypeHead.funderType') + ' : ' + this.state.fundingSourceTypeLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
        // for (var i = 0; i < fundingSourceTypeText.length; i++) {
        //     if (y > doc.internal.pageSize.height - 100) {
        //         doc.addPage();
        //         y = 80;
        //     };
        //     doc.text(doc.internal.pageSize.width / 8, y, fundingSourceTypeText[i]);
        //     y = y + 10
        // }

        var fundingSourceText = doc.splitTextToSize((i18n.t('static.budget.fundingsource') + ' : ' + this.state.fundingSourceLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
        y = y + 10;
        for (var i = 0; i < fundingSourceText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            };
            doc.text(doc.internal.pageSize.width / 8, y, fundingSourceText[i]);
            y = y + 10
        }
        var statusText = doc.splitTextToSize((i18n.t('static.common.status') + ' : ' + this.state.shipmentStatusLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
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
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
            y = y + 10;
        }
        doc.text(i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text, doc.internal.pageSize.width / 8, y, {
            align: 'left'
        })
        doc.setTextColor("#fff");
        var canvas = document.getElementById("cool-canvas11");
        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        let startY = y + 10
        let pages = Math.ceil(startY / height)
        for (var j = 1; j < pages; j++) {
            doc.addPage()
        }
        let startYtable = startY - ((height - h1) * (pages - 1))
        if (startYtable > height - 500) {
            doc.addPage()
            startYtable = 80
        }
        doc.addImage(canvasImg, 'png', 10, startYtable, 500, 280, 'a', 'CANVAS');
        canvas = document.getElementById("cool-canvas2");
        canvasImg = canvas.toDataURL("image/png", 1.0);
        doc.addImage(canvasImg, 'png', 500, startYtable, 340, 280, 'b', 'CANVAS');
        let length = this.state.table1Headers.length + 3;
        doc.addPage()
        startYtable = 80
        let content1 = {
            margin: { top: 80, bottom: 70 },
            startY: startYtable,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 61.89 },
            },
            html: '#mytable1',
            didDrawCell: function (data) {
                if (data.column.index === length && data.cell.section === 'body') {
                    var td = data.cell.raw;
                    var img = td.getElementsByTagName('img')[0];
                    var dim = data.cell.height - data.cell.padding('vertical');
                    var textPos = data.cell.textPos;
                    doc.addImage(img.src, textPos.x, textPos.y, dim, dim);
                }
            }
        };
        doc.autoTable(content1);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.shipmentGlobalDemandViewheader') + ".pdf")
    }
    /**
     * Fetches data based on selected filters.
     */
    fetchData = () => {
        if (localStorage.getItem("sessionType") === 'Online') {
            let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
            let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
            let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
            let fundingSourceIds = this.state.fundingSourceValues.length == this.state.fundingSources.length ? [] : this.state.fundingSourceValues.map(ele => (ele.value).toString());
            let shipmentStatusIds = this.state.shipmentStatusValues.length == this.state.shipmentStatuses.length ? [] : this.state.shipmentStatusValues.map(ele => (ele.value).toString());
            let realmId = AuthenticationService.getRealmId()
            let useApprovedVersion = document.getElementById("includeApprovedVersions").value
            // let groupByProcurementAgentType = document.getElementById("procurementAgentTypeId").value
            let CountryIds = this.state.countryValues.length == this.state.countrys.length ? [] : this.state.countryValues.map(ele => (ele.value).toString());
            let programIds = this.state.programValues.length == this.state.programLst.length ? [] : this.state.programValues.map(ele => (ele.value).toString());
            let groupByProcurementAgentType = this.state.procurementAgentTypeId;
            let groupByFundingSourceType = this.state.groupByFundingSourceType;

            if (this.state.countryValues.length > 0 && this.state.programValues.length > 0 && this.state.planningUnitValues.length > 0 && this.state.fundingSourceValues.length > 0 && this.state.shipmentStatusValues.length > 0) {
                this.setState({
                    message: '', loading: true
                })
                var inputjson = {
                    realmId: realmId,
                    startDate: startDate,
                    stopDate: endDate,
                    realmCountryIds: CountryIds,
                    programIds: programIds,
                    planningUnitIds: planningUnitIds,
                    fundingSourceIds: fundingSourceIds,
                    shipmentStatusIds: shipmentStatusIds,
                    useApprovedSupplyPlanOnly: useApprovedVersion,
                    groupByProcurementAgentType: groupByProcurementAgentType,
                    groupByFundingSourceType: groupByFundingSourceType
                }
                ReportService.shipmentOverview(inputjson)
                    .then(response => {
                        try {
                            var table1Headers = [];
                            table1Headers = Object.keys(response.data.procurementAgentSplit[0].procurementAgentQty);
                            this.setState({
                                data: response.data,
                                fundingSourceSplit: response.data.fundingSourceSplit,
                                planningUnitSplit: response.data.planningUnitSplit,
                                procurementAgentSplit: response.data.procurementAgentSplit,
                                table1Headers: table1Headers,
                                loading: false
                            }, () => {
                            })
                        } catch (error) {
                            this.setState({ loading: false })
                        }
                    }).catch(
                        error => {
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
            } else if (this.state.countryValues.length == 0) {
                this.setState({
                    message: i18n.t('static.program.validcountrytext'),
                    data: [],
                    fundingSourceSplit: [],
                    planningUnitSplit: [],
                    procurementAgentSplit: [],
                    table1Headers: []
                });
            } else if (this.state.programValues.length == 0) {
                this.setState({
                    message: i18n.t('static.common.selectProgram'),
                    data: [],
                    fundingSourceSplit: [],
                    planningUnitSplit: [],
                    procurementAgentSplit: [],
                    table1Headers: []
                });
            }
            else if (this.state.planningUnitValues.length == 0) {
                this.setState({
                    message: i18n.t('static.procurementUnit.validPlanningUnitText'),
                    data: [],
                    fundingSourceSplit: [],
                    planningUnitSplit: [],
                    procurementAgentSplit: [],
                    table1Headers: []
                });
            } else if (this.state.fundingSourceValues.length == 0) {
                this.setState({
                    message: i18n.t('static.fundingSource.selectFundingSource'),
                    data: [],
                    fundingSourceSplit: [],
                    planningUnitSplit: [],
                    procurementAgentSplit: [],
                    table1Headers: []
                });
            } else if (this.state.shipmentStatusValues.length == 0) {
                this.setState({
                    message: i18n.t('static.report.validShipmentStatusText'),
                    data: [],
                    fundingSourceSplit: [],
                    planningUnitSplit: [],
                    procurementAgentSplit: [],
                    table1Headers: []
                });
            }
        } else {
            let versionId = document.getElementById("versionId").value;
            let programId = document.getElementById("programId").value;
            let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
            let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
            let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
            let fundingSourceIds = this.state.fundingSourceValues.map(ele => (ele.value).toString());
            let shipmentStatusIds = this.state.shipmentStatusValues.map(ele => (ele.value).toString());
            if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0 && this.state.fundingSourceValues.length > 0 && this.state.shipmentStatusValues.length > 0) {
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        loading: false
                    })
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                    var version = (versionId.split('(')[0]).trim()
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    var program = `${programId}_v${version}_uId_${userId}`
                    var programDataOs = programDataTransaction.objectStore('programData');
                    var programRequest = programDataOs.get(program);
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            loading: false
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        this.setState({ loading: true })
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        var shipmentList = (programJson.shipmentList);
                        const activeFilter = shipmentList.filter(c => (c.active == true || c.active == "true") && (c.accountFlag == true || c.accountFlag == "true"));
                        let dateFilter = activeFilter.filter(c => moment((c.receivedDate == null || c.receivedDate == "") ? c.expectedDeliveryDate : c.receivedDate).isBetween(startDate, endDate, null, '[)'))
                        let planningUnitFilter = [];
                        for (let i = 0; i < planningUnitIds.length; i++) {
                            for (let j = 0; j < dateFilter.length; j++) {
                                if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
                                    planningUnitFilter.push(dateFilter[j]);
                                }
                            }
                        }
                        let fundingSourceFilter = [];
                        for (let i = 0; i < fundingSourceIds.length; i++) {
                            for (let j = 0; j < planningUnitFilter.length; j++) {
                                if (planningUnitFilter[j].fundingSource.id == fundingSourceIds[i]) {
                                    fundingSourceFilter.push(planningUnitFilter[j]);
                                }
                            }
                        }
                        let shipmentStatusFilter = [];
                        for (let i = 0; i < shipmentStatusIds.length; i++) {
                            for (let j = 0; j < fundingSourceFilter.length; j++) {
                                if (fundingSourceFilter[j].shipmentStatus.id == shipmentStatusIds[i]) {
                                    shipmentStatusFilter.push(fundingSourceFilter[j]);
                                }
                            }
                        }
                        var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                        var procurementAgentOs = procurementAgentTransaction.objectStore('procurementAgent');
                        var procurementAgentRequest = procurementAgentOs.getAll();
                        var procurementAgentList = [];
                        procurementAgentRequest.onerror = function (event) {
                            this.setState({
                                loading: false
                            })
                        };
                        procurementAgentRequest.onsuccess = function (e) {
                            var myResult = [];
                            myResult = procurementAgentRequest.result;
                            for (var k = 0; k < myResult.length; k++) {
                                var procurementAgentObj = {
                                    id: myResult[k].procurementAgentId,
                                    code: myResult[k].procurementAgentCode
                                }
                                procurementAgentList[k] = procurementAgentObj
                            }
                            let procurementAgentSplit = [];
                            for (let i = 0; i < planningUnitIds.length; i++) {
                                let obj = {};
                                let planningUnitArray = shipmentStatusFilter.filter(c => (planningUnitIds[i] == c.planningUnit.id));
                                if (planningUnitArray.length > 0) {
                                    let planningUnit = planningUnitArray[0].planningUnit;
                                    let total = 0;
                                    let buffer = [];
                                    for (let j = 0; j < procurementAgentList.length; j++) {
                                        let data1 = shipmentStatusFilter.filter(c => (planningUnitIds[i] == c.planningUnit.id && procurementAgentList[j].id == c.procurementAgent.id)).map((item) => { return { procurementAgent: item.procurementAgent, shipmentQty: item.shipmentQty } });
                                        let data2 = Object.values(data1.reduce((a, { procurementAgent, shipmentQty }) => {
                                            if (!a[procurementAgent.id])
                                                a[procurementAgent.id] = Object.assign({}, { procurementAgent, shipmentQty });
                                            else
                                                a[procurementAgent.id].shipmentQty += shipmentQty;
                                            return a;
                                        }, {}));
                                        if (data2.length > 0) {
                                            let value = data2[0].shipmentQty;
                                            let json = {}
                                            json[data2[0].procurementAgent.code] = data2[0].shipmentQty;
                                            buffer.push(json);
                                            total = total + value;
                                        } else {
                                            let value = 0;
                                            let json = {}
                                            json[procurementAgentList[j].code] = value;
                                            buffer.push(json);
                                        }
                                    }
                                    for (let j = 0; j < buffer.length; j++) {
                                        Object.assign(obj, buffer[j]);
                                    }
                                    let json = {
                                        planningUnit: planningUnit,
                                        procurementAgentQty: obj,
                                        total: total
                                    }
                                    procurementAgentSplit.push(json);
                                }
                            }
                            let planningUnitSplitForPlanned = shipmentStatusFilter.filter(c => (1 == c.shipmentStatus.id || 2 == c.shipmentStatus.id || 9 == c.shipmentStatus.id)).map((item) => { return { planningUnit: item.planningUnit, plannedShipmentQty: item.shipmentQty, orderedShipmentQty: 0 } });
                            let planningUnitSplitForOrdered = shipmentStatusFilter.filter(c => (3 == c.shipmentStatus.id || 4 == c.shipmentStatus.id || 5 == c.shipmentStatus.id || 6 == c.shipmentStatus.id || 7 == c.shipmentStatus.id)).map((item) => { return { planningUnit: item.planningUnit, plannedShipmentQty: 0, orderedShipmentQty: item.shipmentQty } });
                            let mergedPlanningUnitSplit = planningUnitSplitForPlanned.concat(planningUnitSplitForOrdered);
                            var result1 = mergedPlanningUnitSplit.reduce(function (mergedPlanningUnitSplit, val) {
                                var o = mergedPlanningUnitSplit.filter(function (obj) {
                                    return obj.planningUnit.id == val.planningUnit.id;
                                }).pop() || { planningUnit: val.planningUnit, plannedShipmentQty: 0, orderedShipmentQty: 0 };
                                o.plannedShipmentQty += val.plannedShipmentQty;
                                o.orderedShipmentQty += val.orderedShipmentQty;
                                mergedPlanningUnitSplit.push(o);
                                return mergedPlanningUnitSplit;
                            }, []);
                            var planningUnitSplit = result1.filter(function (itm, i, a) {
                                return i == a.indexOf(itm);
                            });
                            let preFundingSourceSplit = shipmentStatusFilter.map((item) => { return { fundingSource: item.fundingSource, amount: (item.productCost * item.currency.conversionRateToUsd) + (item.freightCost * item.currency.conversionRateToUsd) } });
                            let fundingSourceSplit = Object.values(preFundingSourceSplit.reduce((a, { fundingSource, amount }) => {
                                if (!a[fundingSource.id])
                                    a[fundingSource.id] = Object.assign({}, { fundingSource, amount });
                                else
                                    a[fundingSource.id].amount += amount;
                                return a;
                            }, {}));
                            var table1Headers = [];
                            table1Headers = (procurementAgentSplit.length == 0) ? [] : Object.keys(procurementAgentSplit[0].procurementAgentQty);
                            this.setState({
                                data: [],
                                message: '',
                                fundingSourceSplit: fundingSourceSplit,
                                planningUnitSplit: planningUnitSplit,
                                procurementAgentSplit: procurementAgentSplit,
                                table1Headers: table1Headers,
                                loading: false
                            }, () => {
                            })
                        }.bind(this);
                    }.bind(this);
                }.bind(this)
            } else if (programId == 0) {
                this.setState({
                    message: i18n.t('static.common.selectProgram'),
                    data: [],
                    fundingSourceSplit: [],
                    planningUnitSplit: [],
                    procurementAgentSplit: [],
                    table1Headers: []
                });
            } else if (versionId == 0) {
                this.setState({
                    message: i18n.t('static.program.validversion'),
                    data: [],
                    fundingSourceSplit: [],
                    planningUnitSplit: [],
                    procurementAgentSplit: [],
                    table1Headers: []
                });
            } else if (this.state.planningUnitValues.length == 0) {
                this.setState({
                    message: i18n.t('static.procurementUnit.validPlanningUnitText'),
                    data: [],
                    fundingSourceSplit: [],
                    planningUnitSplit: [],
                    procurementAgentSplit: [],
                    table1Headers: []
                });
            } else if (this.state.fundingSourceValues.length == 0) {
                this.setState({
                    message: i18n.t('static.fundingSource.selectFundingSource'),
                    data: [],
                    fundingSourceSplit: [],
                    planningUnitSplit: [],
                    procurementAgentSplit: [],
                    table1Headers: []
                });
            } else if (this.state.shipmentStatusValues.length == 0) {
                this.setState({
                    message: i18n.t('static.report.validShipmentStatusText'),
                    data: [],
                    fundingSourceSplit: [],
                    planningUnitSplit: [],
                    procurementAgentSplit: [],
                    table1Headers: []
                });
            }
        }
    }
    /**
     * This function is used to call either function for country list or program list based on online and offline status. It is also used to get the funding source and shipment status lists on page load.
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


        Chart.plugins.register({
            afterDraw: function (chart) {
                if (chart.config.type === 'pie') {
                    const ctx = chart.chart.ctx;
                    const total = chart.data.datasets[0].data.reduce((sum, value) => sum + value, 0);
                    chart.data.datasets.forEach((dataset, datasetIndex) => {
                        const meta = chart.getDatasetMeta(datasetIndex);
                        if (!meta.hidden) {
                            meta.data.forEach((element, index) => {
                                if (!chart.getDatasetMeta(datasetIndex).data[index].hidden) {
                                    // Draw the connecting lines
                                    ctx.save();
                                    const model = element._model;
                                    const midRadius = model.innerRadius + (model.outerRadius - model.innerRadius) / 2;
                                    const startAngle = model.startAngle;
                                    const endAngle = model.endAngle;
                                    const midAngle = startAngle + (endAngle - startAngle) / 2;

                                    const x = Math.cos(midAngle);
                                    const y = Math.sin(midAngle);

                                    // Calculate the end point for the line
                                    const lineX = model.x + x * model.outerRadius;
                                    const lineY = model.y + y * model.outerRadius;
                                    const labelX = model.x + x * (model.outerRadius + 10);
                                    const labelY = model.y + y * (model.outerRadius + 10);

                                    const label = chart.data.labels[index];
                                    const value = dataset.data[index];
                                    const percentage = ((value / total) * 100).toFixed(2) + '%';

                                    if (((value / total) * 100).toFixed(2) > 2) {
                                        ctx.beginPath();
                                        ctx.moveTo(model.x, model.y);
                                        ctx.lineTo(lineX, lineY);
                                        ctx.lineTo(labelX, labelY);
                                        ctx.strokeStyle = dataset.backgroundColor[index];
                                        ctx.stroke();
                                        ctx.textAlign = x >= 0 ? 'left' : 'right';
                                        ctx.font = 'bold 12px Arial';
                                        // ctx.textBaseline = 'middle';
                                        ctx.fillStyle = dataset.backgroundColor[index];
                                        ctx.fillText(`${percentage}`, x < 0 ? x < -0.5 ? labelX : labelX + 8 : x < 0.5 ? labelX - 8 : labelX, y < 0 ? y < -0.5 ? labelY - 8 : labelY : y < 0.5 ? labelY : labelY + 8);
                                        ctx.restore();
                                    }
                                }
                            });
                        }
                    });
                }
            },
        });
        if (localStorage.getItem("sessionType") === 'Online') {
            this.getCountrys();
            // this.getFundingSourceType();
            // this.getFundingSource();
            this.getShipmentStatusList();
        } else {
            this.setState({ loading: false })
            this.getPrograms();
            // this.getFundingSourceType();
            // this.getFundingSource();
            this.getShipmentStatusList();
        }
    }
    /**
     * Retrieves the list of countries based on the realm ID and updates the state with the list.
     */
    getCountrys = () => {
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
                    countrys: listArray
                }, () => { this.fetchData(); })
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
     * Handles the change event for countries.
     * @param {Array} countrysId - An array containing the selected country IDs.
     */
    handleChange = (countrysId) => {
        countrysId = countrysId.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            countryValues: countrysId.map(ele => ele),
            countryLabels: countrysId.map(ele => ele.label),
            programValues: [],
            programLabels: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            data: [],
            fundingSourceSplit: [],
            planningUnitSplit: [],
            procurementAgentSplit: [],
            table1Headers: [],
            programLst: []
        }, () => {
            this.getPrograms();
        })
    }
    /**
     * Handles the change event for program selection.
     * @param {array} programIds - The array of selected program IDs.
     */
    handleChangeProgram = (programIds) => {
        programIds = programIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            programValues: programIds.map(ele => ele),
            programLabels: programIds.map(ele => ele.label)
        }, () => {
            this.getFundingSource();
            this.fetchData();
            this.getPlanningUnit();
        })
    }
    /**
     * Retrieves the list of shipment statuses.
     */
    getShipmentStatusList() {
        const { shipmentStatuses } = this.state
        if (localStorage.getItem("sessionType") === 'Online') {
            ShipmentStatusService.getShipmentStatusListActive()
                .then(response => {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        shipmentStatuses: listArray, loading: false
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
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.common.status') }),
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.common.status') }),
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
            var db2;
            var sStatusResult = [];
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                db2 = e.target.result;
                var sStatusTransaction = db2.transaction(['shipmentStatus'], 'readwrite');
                var sStatusOs = sStatusTransaction.objectStore('shipmentStatus');
                var sStatusRequest = sStatusOs.getAll();
                sStatusRequest.onerror = function (event) {
                }.bind(this);
                sStatusRequest.onsuccess = function (event) {
                    sStatusResult = sStatusRequest.result;
                    this.setState({ shipmentStatuses: sStatusResult });
                }.bind(this)
            }.bind(this)
        }
    }

    /**
   * Retrieves the list of funding sources types.
   */
    getFundingSourceType = () => {
        //Fetch realmId
        let realmId = AuthenticationService.getRealmId();
        this.setState({ loading: true });
        if (localStorage.getItem("sessionType") === 'Online') {
            //Fetch all funding source type list
            FundingSourceService.getFundingsourceTypeListByRealmId(realmId)
                .then(response => {
                    if (response.status == 200) {
                        var fundingSourceTypes = response.data;
                        fundingSourceTypes.sort(function (a, b) {
                            a = a.fundingSourceTypeCode.toLowerCase();
                            b = b.fundingSourceTypeCode.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        })

                        this.setState({
                            fundingSourceTypes: fundingSourceTypes, loading: false,
                            // fundingSourceTypeValues: fundingSourceTypeValues,
                            // fundingSourceTypeLabels: fundingSourceTypeValues.map(ele => ele.label)
                        }, () => {
                            this.consolidatedFundingSourceTypeList();
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
                        },
                            () => {
                                this.consolidatedFundingSourceTypeList();
                            })
                    }
                }).catch(
                    error => {
                        this.setState({
                            fundingSourceTypes: [], loading: false
                        }, () => {
                            this.consolidatedFundingSourceTypeList();
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
        } else {
            //Offline
            this.consolidatedFundingSourceTypeList();
            this.setState({ loading: false });
        }
    }

    /**
     * Consolidates the list of funding source type obtained from Server and local programs.
     */
    consolidatedFundingSourceTypeList = () => {
        let realmId = AuthenticationService.getRealmId();
        const { fundingSourceTypes } = this.state;
        var fstList = fundingSourceTypes;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(["fundingSourceType"], "readwrite");
            var fundingSourceType = transaction.objectStore("fundingSourceType");
            var getRequest = fundingSourceType.getAll();
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result.filter(c => c.realm.id == realmId);
                var userBytes = CryptoJS.AES.decrypt(
                    localStorage.getItem("curUser"),
                    SECRET_KEY
                );
                for (var i = 0; i < myResult.length; i++) {
                    var f = 0;
                    for (var k = 0; k < this.state.fundingSourceTypes.length; k++) {
                        if (
                            this.state.fundingSourceTypes[k].fundingSourceTypeId ==
                            myResult[i].fundingSourceTypeId
                        ) {
                            f = 1;
                        }
                    }
                    var fstData = myResult[i];
                    if (f == 0) {
                        fstList.push(fstData);
                    }
                }
                var lang = this.state.lang;
                var fundingSourceTypesCombined = fstList.sort(function (a, b) {
                    a = a.fundingSourceTypeCode.toLowerCase();
                    b = b.fundingSourceTypeCode.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                this.setState({
                    fundingSourceTypes: fundingSourceTypesCombined,
                });
            }.bind(this);
        }.bind(this);
    };

    handleFundingSourceTypeChange = (fundingSourceTypeIds) => {

        fundingSourceTypeIds = fundingSourceTypeIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            fundingSourceTypeValues: fundingSourceTypeIds.map(ele => ele),
            fundingSourceTypeLabels: fundingSourceTypeIds.map(ele => ele.label)
        }, () => {
            var filteredFundingSourceArr = [];
            var fundingSources = this.state.fundingSourcesOriginal;//original fs list
            for (var i = 0; i < fundingSourceTypeIds.length; i++) {
                for (var j = 0; j < fundingSources.length; j++) {
                    if (fundingSources[j].fundingSourceType.id == fundingSourceTypeIds[i].value) {
                        filteredFundingSourceArr.push(fundingSources[j]);
                    }
                }
            }

            if (filteredFundingSourceArr.length > 0) {
                filteredFundingSourceArr = filteredFundingSourceArr.sort(function (a, b) {
                    a = a.code.toLowerCase();
                    b = b.code.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });
            }
            this.setState({
                fundingSources: filteredFundingSourceArr,
                fundingSourceValues: [],
                fundingSourceLabels: [],
            }, () => {
                this.fetchData();
            });
        })
    }


    /**
     * Retrieves the list of funding sources.
     */
    getFundingSource = () => {
        if (localStorage.getItem("sessionType") === 'Online') {
            let programIds = this.state.programValues.map((ele) =>
                Number(ele.value)
            );
            DropdownService.getFundingSourceForProgramsDropdownList(programIds)
                .then(response => {
                    this.setState({
                        fundingSources: response.data, loading: false,
                        fundingSourceValues: [],
                        fundingSourceLabels: []
                    }, () => { this.consolidatedFundingSourceList() })
                }).catch(
                    error => {
                        this.setState({
                            fundingSources: []
                        }, () => { this.consolidatedFundingSourceList() })
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
            this.consolidatedFundingSourceList()
        }
    }
    /**
     * Consolidates the list of funding source obtained from Server and local programs.
     */
    consolidatedFundingSourceList = () => {
        // const { fundingSources } = this.state
        // var proList = fundingSources;
        // var db1;
        // getDatabase();
        // var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        // openRequest.onsuccess = function (e) {
        //     db1 = e.target.result;
        //     var transaction = db1.transaction(['fundingSource'], 'readwrite');
        //     var fundingSource = transaction.objectStore('fundingSource');
        //     var getRequest = fundingSource.getAll();
        //     getRequest.onerror = function (event) {
        //     };
        //     getRequest.onsuccess = function (event) {
        //         var myResult = [];
        //         myResult = getRequest.result;
        //         var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        //         var userId = userBytes.toString(CryptoJS.enc.Utf8);
        //         for (var i = 0; i < myResult.length; i++) {
        //             var f = 0
        //             for (var k = 0; k < this.state.fundingSources.length; k++) {
        //                 if (this.state.fundingSources[k].fundingSourceId == myResult[i].fundingSourceId) {
        //                     f = 1;
        //                 }
        //             }
        //             var programData = myResult[i];
        //             if (f == 0) {
        //                 proList.push(programData)
        //             }
        //         }
        //         proList.sort((a, b) => {
        //             var itemLabelA = a.fundingSourceCode.toUpperCase();
        //             var itemLabelB = b.fundingSourceCode.toUpperCase();
        //             return itemLabelA > itemLabelB ? 1 : -1;
        //         });
        //         this.setState({
        //             fundingSources: proList
        //         })
        //     }.bind(this);
        // }.bind(this);
    }
    /**
     * Retrieves the list of programs.
     */
    getPrograms = () => {
        if (localStorage.getItem("sessionType") === 'Online') {
            let countryIds = this.state.countryValues.map((ele) => ele.value);
            let newCountryList = [...new Set(countryIds)];
            if (newCountryList.length > 0) {
                DropdownService.getSPProgramWithFilterForMultipleRealmCountryForDropdown(newCountryList)
                    .then(response => {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = a.code.toUpperCase();
                            var itemLabelB = b.code.toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            programLst: listArray, loading: false
                        })
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
            }
        } else {
            this.consolidatedProgramList()
        }
    }
    /**
     * Consolidates the list of program obtained from Server and local programs.
     */
    consolidatedProgramList = () => {
        const { programLst } = this.state
        var proList = programLst;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                        proList.push(programData)
                    }
                }
                proList.sort((a, b) => {
                    var itemLabelA = a.programCode.toUpperCase();
                    var itemLabelB = b.programCode.toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    programLst: proList
                })
            }.bind(this);
        }.bind(this);
    }
    /**
     * Filters versions based on the selected program ID and updates the state accordingly.
     * Sets the selected program ID in local storage.
     * Fetches version list for the selected program and updates the state with the fetched versions.
     * Handles error cases including network errors, session expiry, access denial, and other status codes.
     */
    filterVersion = () => {
        let programId = document.getElementById("programId").value;
        if (programId != 0) {
            const program = this.state.programLst.filter(c => c.id == programId)
            if (program.length == 1) {
                if (localStorage.getItem("sessionType") === 'Online') {
                    this.setState({
                        versions: []
                    }, () => {
                        this.setState({
                            versions: program[0].versionList.filter(function (x, i, a) {
                                return a.indexOf(x) === i;
                            })
                        }, () => { this.consolidatedVersionList(programId) });
                    });
                } else {
                    this.setState({
                        versions: []
                    }, () => { this.consolidatedVersionList(programId) })
                }
            } else {
                this.setState({
                    versions: []
                })
            }
        } else {
            this.setState({
                versions: []
            })
        }
    }
    /**
     * Retrieves data from IndexedDB and combines it with fetched versions to create a consolidated version list.
     * Filters out duplicate versions and reverses the list.
     * Sets the version list in the state and triggers fetching of planning units.
     * Handles cases where a version is selected from local storage or the default version is selected.
     * @param {number} programId - The ID of the selected program
     */
    consolidatedVersionList = (programId) => {
        const { versions } = this.state
        var verList = versions;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId && myResult[i].programId == programId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = databytes.toString(CryptoJS.enc.Utf8)
                        var version = JSON.parse(programData).currentVersion
                        version.versionId = `${version.versionId} (Local)`
                        verList.push(version)
                    }
                }
                this.setState({
                    versions: verList.filter(function (x, i, a) {
                        return a.indexOf(x) === i;
                    })
                })
            }.bind(this);
        }.bind(this);
    }
    /**
     * Retrieves the list of planning units for a selected program.
     */
    getPlanningUnit = () => {
        this.setState({
            planningUnits: [],
            planningUnitValues: []
        }, () => {
            if (!localStorage.getItem("sessionType") === 'Online') {

                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                    var planningunitRequest = planningunitOs.getAll();
                    var planningList = []
                    planningunitRequest.onerror = function (event) {
                    };
                    planningunitRequest.onsuccess = function (e) {
                        var myResult = [];
                        myResult = planningunitRequest.result;
                        var programId = (document.getElementById("programId").value).split("_")[0];
                        var proList = []
                        for (var i = 0; i < myResult.length; i++) {
                            if (myResult[i].program.id == programId && myResult[i].active == true) {
                                proList[i] = myResult[i]
                            }
                        }
                        this.setState({
                            planningUnits: proList, message: ''
                        }, () => {
                            this.fetchData();
                        })
                    }.bind(this);
                }.bind(this)
            }
            else {
                let programValues = this.state.programValues.map(c => c.value);
                this.setState({
                    planningUnits: [],
                    planningUnitValues: [],
                    planningUnitLabels: []
                }, () => {
                    if (programValues.length > 0) {
                        var programJson = {
                            tracerCategoryIds: [],
                            programIds: programValues
                        }
                        DropdownService.getProgramPlanningUnitDropdownList(programJson)
                            .then(response => {
                                var listArray = response.data;
                                listArray.sort((a, b) => {
                                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                                    return itemLabelA > itemLabelB ? 1 : -1;
                                });
                                this.setState({
                                    planningUnits: listArray,
                                }, () => {
                                    this.fetchData()
                                });
                            }).catch(
                                error => {
                                    this.setState({
                                        planningUnits: [],
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
                })
            }
        });
    }
    /**
     * Handles the change event for planning units.
     * @param {Array} event - An array containing the selected planning unit IDs.
     */
    handlePlanningUnitChange = (planningUnitIds) => {
        planningUnitIds = planningUnitIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            planningUnitValues: planningUnitIds.map(ele => ele),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {
            this.fetchData();
        })
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => { this.fetchData(); })
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
     * Handles the change event for funding sources.
     * @param {Array} fundingSourceIds - An array containing the selected funding source IDs.
     */
    handleFundingSourceChange(fundingSourceIds) {
        fundingSourceIds = fundingSourceIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            fundingSourceValues: fundingSourceIds.map(ele => ele),
            fundingSourceLabels: fundingSourceIds.map(ele => ele.label)
        }, () => {
            this.fetchData();
        })
    }
    /**
     * Handles the change event for shipment statuses.
     * @param {Array} fundingSourceIds - An array containing the selected shipment status IDs.
     */
    handleShipmentStatusChange(shipmentStatusIds) {
        shipmentStatusIds = shipmentStatusIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            shipmentStatusValues: shipmentStatusIds.map(ele => ele),
            shipmentStatusLabels: shipmentStatusIds.map(ele => ele.label)
        }, () => {
            this.fetchData();
        })
    }
    /**
     * Sets the procurement agent type ID based on the checkbox state.
     * @param {object} e - The event object containing checkbox information.
     */
    setProcurementAgentTypeId(e) {
        var procurementAgentTypeId = e.target.checked;
        var groupByFundingSourceType = this.state.groupByFundingSourceType;
        if (procurementAgentTypeId == true) {
            groupByFundingSourceType = false;
        }
        this.setState({
            procurementAgentTypeId: procurementAgentTypeId,
            groupByFundingSourceType: groupByFundingSourceType,
        }, () => {
            this.fetchData();
        })
    }
    /**
     * Sets the group by funding source type flag based on the checkbox state.
     * @param {object} e - The event object containing checkbox information.
     */
    setGroupByFundingSourceType(e) {
        var groupByFundingSourceType = e.target.checked;
        var procurementAgentTypeId = this.state.procurementAgentTypeId;
        if (groupByFundingSourceType == true) {
            procurementAgentTypeId = false;
        }
        this.setState({
            groupByFundingSourceType: groupByFundingSourceType,
            procurementAgentTypeId: procurementAgentTypeId
        }, () => {
            this.fetchData();
        })
    }

    /**
     * Sets the group by & related flags to state based on the selected dropdown value.
     * @param {object} e - The event object containing checkbox information.
     */
    setGroupByValues(e) {
        var groupByValue = e.target.value;
        var procurementAgentTypeId = this.state.procurementAgentTypeId;
        var groupByFundingSourceType = this.state.groupByFundingSourceType;
        if (groupByValue == 1) {//Procurement Agent Type
            procurementAgentTypeId = true;
            groupByFundingSourceType = false;
        } else if (groupByValue == 2) {//Funding Source Type
            groupByFundingSourceType = true;
            procurementAgentTypeId = false;
        } else {
            groupByFundingSourceType = false;
            procurementAgentTypeId = false;
        }
        this.setState({
            groupByFundingSourceType: groupByFundingSourceType,
            procurementAgentTypeId: procurementAgentTypeId,
            groupBy: groupByValue
        }, () => {
            this.fetchData();
        })
    }

    /**
     * Renders the Shipment Global Demand View report table.
     * @returns {JSX.Element} - Shipment Global Demand View report table.
     */
    render() {

        const { isDarkMode } = this.state;
        // const backgroundColor = isDarkMode ? darkModeColors : lightModeColors;
        const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
        const gridLineColor = isDarkMode ? '#444' : '#e0e0e0';
        const options = {
            plugins: {
                datalabels: {
                    formatter: (value, context) => {
                        return ``;
                    },
                },
            },
            title: {
                display: true,
                text: i18n.t('static.dashboard.shipmentGlobalViewheader'),
                fontColor: fontColor
            },
            scales: {
                xAxes: [{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: i18n.t('static.shipment.qty'),
                        fontColor: fontColor,
                        fontStyle: "normal",
                        fontSize: "12"
                    },
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
                        display: false,
                        lineWidth: 0,
                        color: gridLineColor,
                        zeroLineColor: gridLineColor
                    }
                }],
                yAxes: [{
                    stacked: true,
                    labelString: i18n.t('static.common.product'),
                    fontColor: fontColor,
                    ticks: {
                        fontColor: fontColor,
                        callback: function (value) {
                            return (value.length > 40) ? value.substr(0, 40) + "..." : value;
                        },
                    },
                    gridLines: {
                        color: gridLineColor,
                        zeroLineColor: gridLineColor
                    }
                }],
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
        const options1 = {
            plugins: {
                datalabels: {
                    formatter: (value, context) => {
                        return ``;
                    },
                },
            },
            title: {
                display: true,
                text: i18n.t('static.dashboard.shipmentGlobalViewheader'),
                fontColor: fontColor
            },
            scales: {
                xAxes: [{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: i18n.t('static.shipment.qty'),
                        fontColor: fontColor,
                        fontStyle: "normal",
                        fontSize: "12"
                    },
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
                        color: gridLineColor,
                        zeroLineColor: gridLineColor,
                        lineWidth: 0,
                    }
                }],
                yAxes: [{
                    stacked: true,
                    labelString: i18n.t('static.common.product'),
                    fontColor: fontColor,
                    gridLines: {

                        borderColor: 'red'

                    },
                }],
            },
            maintainAspectRatio: false,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: fontColor,
                }
            }
        }
        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {item.versionId}
                    </option>
                )
            }, this);
        const { programLst } = this.state;
        let programList = [];
        programList = programLst.length > 0
            && programLst.map((item, i) => {
                return (
                    { label: (item.code), value: item.id }
                )
            }, this);
        const { countrys } = this.state;
        let countryList = countrys.length > 0 && countrys.map((item, i) => {
            return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
        }, this);
        const { planningUnits } = this.state;
        let planningUnitList = [];
        planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    { label: getLabelText(item.label, this.state.lang), value: item.id }
                )
            }, this);
        const { fundingSourceTypes } = this.state;
        const { fundingSources } = this.state;
        let fundingSourceList = [];
        fundingSourceList = fundingSources.length > 0
            && fundingSources.map((item, i) => {
                return (
                    { label: item.code, value: item.id }
                )
            }, this);
        const { shipmentStatuses } = this.state;
        let shipmentStatusList = shipmentStatuses.length > 0 && shipmentStatuses.map((item, i) => {
            return (
                { label: getLabelText(item.label, this.state.lang), value: item.shipmentStatusId }
            )
        }, this);
        const { realmList } = this.state;
        let realms = realmList.length > 0
            && realmList.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const chartData = {
            labels: [...new Set(this.state.planningUnitSplit.map(ele => (getLabelText(ele.planningUnit.label, this.state.lang))))],
            datasets: [{
                label: i18n.t('static.shipment.orderedShipment'),
                data: this.state.planningUnitSplit.map(ele => (roundARU(ele.orderedShipmentQty,1))),
                backgroundColor: '#0067B9',
                borderWidth: 0
            },
            {
                label: i18n.t('static.shipment.plannedShipment'),
                data: this.state.planningUnitSplit.map(ele => (roundARU(ele.plannedShipmentQty,1))),
                backgroundColor: '#A7C6ED',
                borderWidth: 0,
            }
            ]
        };
        
        const darkModeColors = [
            '#d4bbff', '#BA0C2F', '#A7C6ED', '#0067B9', '#A7C6ED',
            '#205493', '#ba4e00', '#6C6463', '#BC8985', '#cfcdc9',
            '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
            '#d4bbff', '#BA0C2F', '#A7C6ED', '#0067B9', '#A7C6ED',
            '#205493', '#ba4e00', '#6C6463', '#BC8985', '#cfcdc9',
            '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
            '#d4bbff', '#BA0C2F', '#A7C6ED', '#0067B9', '#A7C6ED',
        ];
        
        const lightModeColors = [
            '#002F6C', '#BA0C2F', '#6C6463', '#0067B9', '#A7C6ED',
            '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
            '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
            '#002F6C', '#BA0C2F', '#6C6463', '#0067B9', '#A7C6ED',
            '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
            '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
            '#002F6C', '#BA0C2F', '#6C6463', '#0067B9', '#A7C6ED',
        ];
        
        const backgroundColor = isDarkMode ? darkModeColors : lightModeColors;
        
        const chartDataForPie = {
            labels: [...new Set(this.state.fundingSourceSplit.map(ele => ele.fundingSource.code))],
            datasets: [{
                data: this.state.fundingSourceSplit.map(ele => (ele.amount)),
                backgroundColor: backgroundColor,  // Apply the color scheme
                // backgroundColor: [
                //     '#d4bbff', '#BA0C2F', '#757575', '#0067B9', '#A7C6ED',
                //     '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
                //     '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
                //     '#d4bbff', '#BA0C2F', '#757575', '#0067B9', '#A7C6ED',
                //     '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
                //     '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
                //     '#d4bbff', '#BA0C2F', '#757575', '#0067B9', '#A7C6ED',
                // ],
                
        
                legend: {
                    position: 'bottom',
                    fontColor: fontColor,
                }
            }],
        }
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
            fontColor: fontColor,
        }
        const { rangeValue } = this.state
        const checkOnline = localStorage.getItem('sessionType');

        const optionsPie = {
            title: {
                display: true,
                text: this.state.groupByFundingSourceType ? i18n.t('static.funderTypeHead.funderType') : i18n.t('static.fundingSourceHead.fundingSource'),
                fontColor: fontColor,
                padding: 30
            },
            legend: {
                position: 'bottom',
                fontColor: fontColor,
                labels: {
                    padding: 25,
                    fontColor: fontColor,
                }
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItems, data) {
                        return data.labels[tooltipItems.index] +
                            " : " + " $ " +
                            (data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index]).toLocaleString();
                    }
                }
            },
        }

        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon">
                        {(this.state.fundingSourceSplit.length > 0 || this.state.planningUnitSplit.length > 0 || this.state.procurementAgentSplit.length > 0) &&
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
                    <CardBody className=" pt-lg-0 pb-lg-0">
                        <div ref={ref}>
                            <Form >
                                <div className="pl-0">
                                    <div className="row">
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                            <div className="controls ">
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
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls ">
                                                <MultiSelect
                                                    bsSize="sm"
                                                    name="countryIds"
                                                    id="countryIds"
                                                    value={this.state.countryValues}
                                                    onChange={(e) => { this.handleChange(e) }}
                                                    options={countryList && countryList.length > 0 ? countryList : []}
                                                    disabled={this.state.loading}
                                                    overrideStrings={{
                                                        allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                        selectSomeItems: i18n.t('static.common.select')
                                                    }}
                                                    filterOptions={filterOptions}
                                                />
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="programIds">{i18n.t('static.program.program')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls ">
                                                <MultiSelect
                                                    bsSize="sm"
                                                    name="programIds"
                                                    id="programIds"
                                                    value={this.state.programValues}
                                                    onChange={(e) => { this.handleChangeProgram(e) }}
                                                    options={programList && programList.length > 0 ? programList : []}
                                                    disabled={this.state.loading}
                                                    overrideStrings={{
                                                        allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                        selectSomeItems: i18n.t('static.common.select')
                                                    }}
                                                    filterOptions={filterOptions}
                                                />
                                            </div>
                                        </FormGroup>
                                        {checkOnline === 'Offline' &&
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            onChange={this.filterVersion}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {programLst.length > 0
                                                                && programLst.map((item, i) => {
                                                                    return (
                                                                        <option key={i} value={item.programId}>
                                                                            {getLabelText(item.label, this.state.lang)}
                                                                        </option>
                                                                    )
                                                                }, this)}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                        }
                                        {checkOnline === 'Offline' &&
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="versionId"
                                                            id="versionId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.getPlanningUnit(); }}
                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {versionList}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                        }
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls">
                                                <MultiSelect
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    bsSize="md"
                                                    value={this.state.planningUnitValues}
                                                    onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                    options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                                    disabled={this.state.loading}
                                                    overrideStrings={{
                                                        allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                        selectSomeItems: i18n.t('static.common.select')
                                                    }}
                                                    filterOptions={filterOptions}
                                                />
                                            </div>
                                        </FormGroup>
                                        {/* <FormGroup id="fundingSourceTypeDiv" className="col-md-3" style={{ zIndex: "1" }} >
                                            <Label htmlFor="fundingSourceTypeId">{i18n.t('static.funderTypeHead.funderType')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls">
                                                <MultiSelect
                                                    name="fundingSourceTypeId"
                                                    id="fundingSourceTypeId"
                                                    bsSize="md"
                                                    // filterOptions={this.filterOptions}
                                                    value={this.state.fundingSourceTypeValues}
                                                    onChange={(e) => { this.handleFundingSourceTypeChange(e) }}
                                                    options={fundingSourceTypes.length > 0
                                                        && fundingSourceTypes.map((item, i) => {
                                                            return (
                                                                { label: item.fundingSourceTypeCode, value: item.fundingSourceTypeId }
                                                            )
                                                        }, this)}
                                                    disabled={this.state.loading}
                                                />
                                            </div>
                                        </FormGroup> */}
                                        <FormGroup className="col-md-3" id="fundingSourceDiv">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
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
                                                    overrideStrings={{
                                                        allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                        selectSomeItems: i18n.t('static.common.select')
                                                    }}
                                                    filterOptions={filterOptions}
                                                />
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls ">
                                                <MultiSelect
                                                    name="shipmentStatusId"
                                                    id="shipmentStatusId"
                                                    bsSize="sm"
                                                    value={this.state.shipmentStatusValues}
                                                    onChange={(e) => { this.handleShipmentStatusChange(e) }}
                                                    options={shipmentStatusList && shipmentStatusList.length > 0 ? shipmentStatusList : []}
                                                    disabled={this.state.loading}
                                                    overrideStrings={{
                                                        allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                        selectSomeItems: i18n.t('static.common.select')
                                                    }}
                                                    filterOptions={filterOptions}
                                                />
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.includeapproved')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="includeApprovedVersions"
                                                        id="includeApprovedVersions"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.fetchData() }}
                                                    >
                                                        <option value="true">{i18n.t('static.program.yes')}</option>
                                                        <option value="false">{i18n.t('static.program.no')}</option>
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="groupBy">{i18n.t('static.shipment.groupBy')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="groupBy"
                                                        id="groupBy"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.setGroupByValues(e); }}
                                                    >
                                                        <option value="0">{i18n.t('static.supplyPlan.none')}</option>
                                                        <option value="1">{i18n.t('static.dashboard.procurementagentType')}</option>
                                                        <option value="2">{i18n.t('static.funderTypeHead.funderType')}</option>
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        {/* <FormGroup className="col-md-3 pl-lg-5 pt-lg-3">
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="procurementAgentTypeId"
                                                        name="procurementAgentTypeId"
                                                        checked={this.state.procurementAgentTypeId}
                                                        value={this.state.procurementAgentTypeId}
                                                        onChange={(e) => { this.setProcurementAgentTypeId(e); }}
                                                    />
                                                </InputGroup>
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                    <b>{i18n.t('static.shipment.groupByProcurementAgentType')}</b>
                                                </Label>
                                            </div>
                                        </FormGroup> */}
                                        {/* <FormGroup className="col-md-3 pl-lg-5 pt-lg-3">
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="groupByFundingSourceType"
                                                        name="groupByFundingSourceType"
                                                        checked={this.state.groupByFundingSourceType}
                                                        value={this.state.groupByFundingSourceType}
                                                        onChange={(e) => { this.setGroupByFundingSourceType(e); }}
                                                    />
                                                </InputGroup>
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                    <b>{i18n.t('static.shipment.groupByFundingSourceType')}</b>
                                                </Label>
                                            </div>
                                        </FormGroup> */}
                                    </div>
                                </div>
                            </Form>
                            <div style={{ display: this.state.loading ? "none" : "block" }}>
                                <Col md="12 pl-0  ">
                                    <div className="row grid-divider ">
                                        {
                                            this.state.planningUnitSplit.length > 0 &&
                                            <Col md="8 pl-0">
                                                <div className="chart-wrapper shipmentOverviewgraphheight" >
                                                    <HorizontalBar id="cool-canvas1" data={chartData} options={options} />
                                                </div>
                                            </Col>
                                        }
                                        {
                                            this.state.fundingSourceSplit.length > 0 &&
                                            <Col md="4 pl-0">
                                                <div className="chart-wrapper">
                                                    <Pie id="cool-canvas2" data={chartDataForPie} options={optionsPie} height={300}
                                                    /><br />
                                                </div>
                                                <h5 className="red text-center">{i18n.t('static.shipmentOverview.pieChartNote')}</h5>
                                                <h5 className="red text-center">{this.state.groupByFundingSourceType ? i18n.t('static.report.fundingSourceTypeUsdAmount') : i18n.t('static.report.fundingSourceUsdAmount')}</h5>
                                            </Col>
                                        }
                                    </div>
                                </Col>
                                <Col md="12 pl-0" style={{ position: "absolute", opacity: "0.0", }}>
                                    {
                                        this.state.planningUnitSplit.length > 0 &&
                                        <div className="chart-wrapper shipmentOverviewgraphheight">
                                            <HorizontalBar id="cool-canvas11" data={chartData} options={options1} />
                                        </div>
                                    }
                                </Col>
                                <Col md="12 pl-0 pb-lg-1">
                                    <div className="globalviwe-scroll">
                                        <div className="row">
                                            <div className="col-md-12 mt-2">
                                                {this.state.procurementAgentSplit.length > 0 &&
                                                    <div className="fixTableHead">
                                                        <Table id="mytable1" className="table-striped table-bordered text-center">
                                                            <thead className='Theadtablesticky'>
                                                                <tr>
                                                                    <th rowSpan={2}>{i18n.t('static.dashboard.planningunitheader')}</th>
                                                                    <th colSpan={this.state.table1Headers.length} align='center'>{this.state.procurementAgentTypeId ? i18n.t('static.dashboard.procurementagentType') : i18n.t('static.report.procurementAgentName')}</th>
                                                                    <th rowSpan={2}>{i18n.t('static.report.totalUnit')}</th>
                                                                </tr>
                                                                <tr>
                                                                    {
                                                                        this.state.table1Headers.map((item, idx) =>
                                                                            <th id="addr0" key={idx} className="text-center" style={{ width: '100px' }}>
                                                                                {this.state.table1Headers[idx]}
                                                                            </th>
                                                                        )
                                                                    }
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    this.state.procurementAgentSplit.map((item, idx) =>
                                                                        <tr id="addr0" key={idx} >
                                                                            <td>{getLabelText(this.state.procurementAgentSplit[idx].planningUnit.label, this.state.lang)}</td>
                                                                            {
                                                                                Object.values(this.state.procurementAgentSplit[idx].procurementAgentQty).map((item, idx1) =>
                                                                                    <td id="addr1" key={idx1}>
                                                                                        {item.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}
                                                                                    </td>
                                                                                )
                                                                            }
                                                                            <td>{this.state.procurementAgentSplit[idx].total.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                                        </tr>
                                                                    )}
                                                            </tbody>
                                                        </Table>
                                                    </div>
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
            </div >
        );
    }
}
export default ShipmentGlobalDemandView;