import React, { Component, lazy, Suspense, DatePicker } from 'react';
import { Bar, Pie, HorizontalBar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import paginationFactory from 'react-bootstrap-table2-paginator'
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle, hexToRgba } from '@coreui/coreui-pro/dist/js/coreui-utilities'
import i18n from '../../i18n'
import Pdf from "react-to-pdf"
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmService from '../../api/RealmService';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductService from '../../api/ProductService';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import RealmCountryService from '../../api/RealmCountryService';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_NAME, INDEXED_DB_VERSION, polling, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import ReportService from '../../api/ReportService';
import ProgramService from '../../api/ProgramService';
import FundingSourceService from '../../api/FundingSourceService';
import ShipmentStatusService from '../../api/ShipmentStatusService';
import { Online, Offline } from "react-detect-offline";
import {MultiSelect} from 'react-multi-select-component';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Multiselect } from 'multiselect-react-dropdown';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
const ref = React.createRef();

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

// Return with commas in between
var numberWithCommas = function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

var dataPack1 = [40, 47, 44, 38, 27];
var dataPack2 = [10, 12, 7, 5, 4];
var dataPack3 = [17, 11, 22, 18, 12];
var dates = ["Some l-o-o-o-o-o-o-o-o-o-o-o-n-n-n-n-n-n-g-g-g-g-g-g-g label", "AAA", "BBB", "CCC", "DDDDDDDDD"];

var bar_ctx = document.getElementById('bar-chart');
const colors = ['#004876', '#0063a0', '#007ecc', '#0093ee', '#82caf8', '#c8e6f4'];
const options = {
    title: {
        display: true,
        text: i18n.t('static.dashboard.shipmentGlobalViewheader'),
        fontColor: 'black'
    },
    scales: {
        xAxes: [{

            stacked: true,
            scaleLabel: {
                display: true,
                labelString: i18n.t('static.shipment.qty'),
                fontColor: 'black',
                fontStyle: "normal",
                fontSize: "12"
            },
            ticks: {
                beginAtZero: true,
                fontColor: 'black',
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
                display: false
            }

        }],
        yAxes: [{
            stacked: true,
            labelString: i18n.t('static.common.product'),
            ticks: {
                callback: function (value) {
                    // return value.substr(0, 40) + "...";//truncate
                    return (value.length > 40) ? value.substr(0, 40) + "..." : value;
                },
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
            fontColor: 'black'
        }
    }
}

const options1 = {
    title: {
        display: true,
        text: i18n.t('static.dashboard.shipmentGlobalViewheader'),
        fontColor: 'black'
    },
    scales: {
        xAxes: [{

            stacked: true,
            scaleLabel: {
                display: true,
                labelString: i18n.t('static.shipment.qty'),
                fontColor: 'black',
                fontStyle: "normal",
                fontSize: "12"
            },
            ticks: {
                beginAtZero: true,
                fontColor: 'black',
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
                display: false
            }

        }],
        yAxes: [{
            stacked: true,
            labelString: i18n.t('static.common.product')
        }],
    },
    maintainAspectRatio: false,
    legend: {
        display: true,
        position: 'bottom',
        labels: {
            usePointStyle: true,
            fontColor: 'black'
        }
    }
}

const optionsPie = {
    title: {
        display: true,
        text: i18n.t('static.fundingSourceHead.fundingSource'),
        fontColor: 'black'
    },
    legend: {
        position: 'bottom'
        //   labels: {
        //     boxWidth: 10
        //   }
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

// var bar_chart = new Chart(bar_ctx, {
//     type: 'bar',
//     data: chartData,
//     options: options,

// }
// );

//Random Numbers
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

var elements = 27;
var data1 = [];
var data2 = [];
var data3 = [];

for (var i = 0; i <= elements; i++) {
    data1.push(random(50, 200));
    data2.push(random(80, 100));
    data3.push(65);
}



class ShipmentGlobalDemandView extends Component {
    constructor(props) {
        super(props);

        this.toggledata = this.toggledata.bind(this);
        this.onRadioBtnClick = this.onRadioBtnClick.bind(this);
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
            // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: true,
            programLst: []
        };


        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.getPrograms = this.getPrograms.bind(this)
        this.getRandomColor = this.getRandomColor.bind(this)
        this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this)
        this.getProductCategories = this.getProductCategories.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.filterProgram = this.filterProgram.bind(this)
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

    exportCSV() {

        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')

        if (isSiteOnline()) {
            this.state.countryLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
            csvRow.push('')
            this.state.programLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
            // csvRow.push('')
            // csvRow.push('"' + (i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text).replaceAll(' ', '%20') + '"');
            csvRow.push('')
            this.state.planningUnitLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'));
            csvRow.push('')
            this.state.fundingSourceLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.budget.fundingsource') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'));
            csvRow.push('')
            this.state.shipmentStatusLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.common.status') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
            csvRow.push('')
            csvRow.push('"' + (i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text).replaceAll(' ', '%20') + '"')


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
                console.log(tableHead[i])
                tableHeadTemp.push((tableHead[i].replaceAll(',', ' ')).replaceAll(' ', '%20'));
            }
            tableHeadTemp.push(i18n.t('static.report.totalUnit').replaceAll(' ', '%20'));

            A[0] = this.addDoubleQuoteToRowContent(tableHeadTemp);
            re = this.state.procurementAgentSplit;
            for (var item = 0; item < re.length; item++) {
                let item1 = Object.values(re[item].procurementAgentQty);
                console.log(item1)
                A.push([this.addDoubleQuoteToRowContent([re[item].planningUnit.id, (getLabelText(re[item].planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ...item1, re[item].total])])
            }
            for (var i = 0; i < A.length; i++) {
                csvRow.push(A[i].join(","))
            }
        }

        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.shipmentGlobalDemandViewheader') + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to) + ".csv"
        document.body.appendChild(a)
        a.click()
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
                /*doc.addImage(data, 10, 30, {
                  align: 'justify'
                });*/
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.shipmentGlobalDemandViewheader'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })

                }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);
        doc.setTextColor("#002f6c");
        var len = 120
        if (isSiteOnline()) {

            var countryLabelsText = doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
            doc.text(doc.internal.pageSize.width / 8, 110, countryLabelsText)
            len = len + countryLabelsText.length * 10

            var planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
            doc.text(doc.internal.pageSize.width / 8, len, planningText)
            len = len + 10 + planningText.length * 10

            // doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, len, {
            //     align: 'left'
            // })
            // len = len + 20

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
        //     doc.text(doc.internal.pageSize.width / 8, 150, planningText)
        let y = isSiteOnline() ? len : 150
        console.log(doc.internal.pageSize.height)
        var fundingSourceText = doc.splitTextToSize((i18n.t('static.budget.fundingsource') + ' : ' + this.state.fundingSourceLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
        // doc.text(doc.internal.pageSize.width / 8, 150+(this.state.planningUnitLabels.length*3), fundingSourceText)
        for (var i = 0; i < fundingSourceText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            };
            doc.text(doc.internal.pageSize.width / 8, y, fundingSourceText[i]);
            y = y + 10
            console.log(y)
        }
        var statusText = doc.splitTextToSize((i18n.t('static.common.status') + ' : ' + this.state.shipmentStatusLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
        //     doc.text(doc.internal.pageSize.width / 8, 150+(this.state.planningUnitLabels.length*3)+(this.state.fundingSourceLabels.lenght*2), statusText)
        // 
        y = y + 10;
        for (var i = 0; i < statusText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 8, y, statusText[i]);
            y = y + 10;
            console.log(y)
        }
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
            y = y + 10;
            console.log(y)
        }
        doc.text(i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text, doc.internal.pageSize.width / 8, y, {
            align: 'left'
        })


        doc.setTextColor("#fff");
        const title = i18n.t('static.dashboard.shipmentGlobalDemandViewheader');
        var canvas = document.getElementById("cool-canvas11");

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        var aspectwidth1 = (width - h1);
        let startY = y + 10//150 + (this.state.planningUnitLabels.length * 3) + (this.state.fundingSourceLabels.length * 3) + (this.state.shipmentStatusLabels.length * 3)
        console.log('startY', startY)
        let pages = Math.ceil(startY / height)
        for (var j = 1; j < pages; j++) {
            doc.addPage()
        }
        let startYtable = startY - ((height - h1) * (pages - 1))
        if (startYtable > height - 500) {
            doc.addPage()
            startYtable = 80
        }
        console.log(startYtable)
        doc.addImage(canvasImg, 'png', 10, startYtable, 500, 280, 'a', 'CANVAS');

        //creates image2
        canvas = document.getElementById("cool-canvas2");

        canvasImg = canvas.toDataURL("image/png", 1.0);

        doc.addImage(canvasImg, 'png', 500, startYtable, 340, 170, 'b', 'CANVAS');

        // let tableHeadLength = this.state.table1Headers.length;
        let length = this.state.table1Headers.length + 3;
        doc.addPage()
        startYtable = 80
        //Tables
        let content1 = {
            margin: { top: 80, bottom: 70 },
            startY: startYtable,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 61.89 },
                // 1: { cellWidth: 100 },
                // 2: { cellWidth: 200 },
                // 3: { cellWidth: 100 },
                // 4: { cellWidth: 100 },
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

        //doc.text(title, marginLeft, 40);
        // doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.shipmentGlobalDemandViewheader') + ".pdf")
        //creates PDF from img
        /*  var doc = new jsPDF('landscape');
          doc.setFontSize(20);
          doc.text(15, 15, "Cool Chart");
          doc.save('canvas.pdf');*/
    }


    fetchData = () => {
        if (isSiteOnline()) {
            let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
            let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();

            // let productCategoryId = document.getElementById("productCategoryId").value;
            let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
            let fundingSourceIds = this.state.fundingSourceValues.length == this.state.fundingSources.length ? [] : this.state.fundingSourceValues.map(ele => (ele.value).toString());
            let shipmentStatusIds = this.state.shipmentStatusValues.length == this.state.shipmentStatuses.length ? [] : this.state.shipmentStatusValues.map(ele => (ele.value).toString());
            let realmId = AuthenticationService.getRealmId()
            let useApprovedVersion = document.getElementById("includeApprovedVersions").value
            let CountryIds = this.state.countryValues.length == this.state.countrys.length ? [] : this.state.countryValues.map(ele => (ele.value).toString());
            let programIds = this.state.programValues.length == this.state.programs.length ? [] : this.state.programValues.map(ele => (ele.value).toString());


            // if (this.state.countryValues.length > 0 && this.state.programValues.length > 0 && productCategoryId != -1 && this.state.planningUnitValues.length > 0 && this.state.fundingSourceValues.length > 0 && this.state.shipmentStatusValues.length > 0) {
            if (this.state.countryValues.length > 0 && this.state.programValues.length > 0 && this.state.planningUnitValues.length > 0 && this.state.fundingSourceValues.length > 0 && this.state.shipmentStatusValues.length > 0) {
                this.setState({
                    message: '', loading: true
                })

                // let realmId = AuthenticationService.getRealmId();

                var inputjson = {
                    realmId: realmId,
                    startDate: startDate,
                    stopDate: endDate,
                    realmCountryIds: CountryIds,
                    programIds: programIds,
                    planningUnitIds: planningUnitIds,
                    fundingSourceIds: fundingSourceIds,
                    shipmentStatusIds: shipmentStatusIds,
                    useApprovedSupplyPlanOnly: useApprovedVersion

                }

                ReportService.shipmentOverview(inputjson)
                    .then(response => {
                        try {
                            console.log("RESP----->", response.data);
                            var table1Headers = [];
                            table1Headers = Object.keys(response.data.procurementAgentSplit[0].procurementAgentQty);
                            // table1Headers.unshift(i18n.t('static.planningunit.planningunit'));
                            // table1Headers.push(i18n.t('static.report.totalUnit'));
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
                            console.log("ERROR---->", error);
                            this.setState({ loading: false })
                        }

                    }).catch(
                        error => {
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                            } else {
                                switch (error.response ? error.response.status : "") {

                                    case 401:
                                        this.props.history.push(`/login/static.message.sessionExpired`)
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
            // else if (productCategoryId == -1) {
            //     this.setState({
            //         message: i18n.t('static.product.productcategorytext'),
            //         data: [],
            //         fundingSourceSplit: [],
            //         planningUnitSplit: [],
            //         procurementAgentSplit: [],
            //         table1Headers: []
            //     });
            // } 
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

            // let fundingSourceIds = this.state.fundingSourceValues.length == this.state.fundingSources.length ? [] : this.state.fundingSourceValues.map(ele => (ele.value).toString());
            // let shipmentStatusIds = this.state.shipmentStatusValues.length == this.state.shipmentStatuses.length ? [] : this.state.shipmentStatusValues.map(ele => (ele.value).toString());

            let fundingSourceIds = this.state.fundingSourceValues.map(ele => (ele.value).toString());
            let shipmentStatusIds = this.state.shipmentStatusValues.map(ele => (ele.value).toString());
            console.log("shipmentStatusIds---->", shipmentStatusIds);
            console.log("planningUnitIds---->", planningUnitIds);
            console.log("fundingSourceIds---->", fundingSourceIds);
            console.log("version---->", versionId);
            console.log("program---->", programId);

            if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0 && this.state.fundingSourceValues.length > 0 && this.state.shipmentStatusValues.length > 0) {
                var db1;
                var storeOS;
                getDatabase();
                var regionList = [];
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
                    // console.log("1----", program)
                    var programRequest = programDataOs.get(program);
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            loading: false
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        this.setState({ loading: true })
                        // console.log("2----", programRequest)
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        var shipmentList = (programJson.shipmentList);
                        console.log("shipmentList Original------>", shipmentList);
                        const activeFilter = shipmentList.filter(c => (c.active == true || c.active == "true") && (c.accountFlag == true || c.accountFlag == "true"));

                        // let dateFilter = activeFilter.filter(c => moment(c.deliveredDate).isBetween(startDate, endDate, null, '[)'))
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
                            // Handle errors!
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

                            console.log("procurementAgentList------>", procurementAgentList);


                            let data = [];
                            let procurementAgentSplit = [];

                            console.log("shipmentStatusFilter--->", shipmentStatusFilter);
                            console.log("planningUnitIds--->", planningUnitIds);
                            //Table-1
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
                                            let key = data2[0].procurementAgent.code;
                                            let value = data2[0].shipmentQty;
                                            let json = {}
                                            json[data2[0].procurementAgent.code] = data2[0].shipmentQty;

                                            buffer.push(json);
                                            total = total + value;
                                        } else {
                                            let key = procurementAgentList[j].code;
                                            let value = 0;
                                            let json = {}
                                            json[procurementAgentList[j].code] = value;
                                            buffer.push(json);
                                        }


                                        // Object.assign(obj, { name: value });

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

                            //Graph-1
                            let planningUnitSplitForPlanned = shipmentStatusFilter.filter(c => (1 == c.shipmentStatus.id || 2 == c.shipmentStatus.id || 3 == c.shipmentStatus.id || 9 == c.shipmentStatus.id)).map((item) => { return { planningUnit: item.planningUnit, plannedShipmentQty: item.shipmentQty, orderedShipmentQty: 0 } });

                            let planningUnitSplitForOrdered = shipmentStatusFilter.filter(c => (4 == c.shipmentStatus.id || 5 == c.shipmentStatus.id || 6 == c.shipmentStatus.id || 7 == c.shipmentStatus.id)).map((item) => { return { planningUnit: item.planningUnit, plannedShipmentQty: 0, orderedShipmentQty: item.shipmentQty } });

                            let mergedPlanningUnitSplit = planningUnitSplitForPlanned.concat(planningUnitSplitForOrdered);

                            // let planningUnitSplit = Object.values(mergedPlanningUnitSplit.reduce((a, { planningUnit, plannedShipmentQty, orderedShipmentQty }) => {
                            //     if (!a[planningUnit.id])
                            //         a[planningUnit.id] = Object.assign({}, { planningUnit, plannedShipmentQty, orderedShipmentQty });
                            //     else
                            //         a[planningUnit.id].plannedShipmentQty += plannedShipmentQty;
                            //     a[planningUnit.id].orderedShipmentQty += orderedShipmentQty;
                            //     return a;
                            // }, {}));


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

                            //Graph-2
                            let preFundingSourceSplit = shipmentStatusFilter.map((item) => { return { fundingSource: item.fundingSource, amount: (item.productCost * item.currency.conversionRateToUsd) + (item.freightCost * item.currency.conversionRateToUsd) } });

                            let fundingSourceSplit = Object.values(preFundingSourceSplit.reduce((a, { fundingSource, amount }) => {
                                if (!a[fundingSource.id])
                                    a[fundingSource.id] = Object.assign({}, { fundingSource, amount });
                                else
                                    a[fundingSource.id].amount += amount;
                                return a;
                            }, {}));
                            console.log("procurementAgentSplit->", procurementAgentSplit);
                            var table1Headers = [];
                            table1Headers = (procurementAgentSplit.length == 0) ? [] : Object.keys(procurementAgentSplit[0].procurementAgentQty);
                            // table1Headers.unshift(i18n.t('static.planningunit.planningunit'));
                            // table1Headers.push(i18n.t('static.report.totalUnit'));



                            // console.log("data----->", data);
                            this.setState({
                                data: [],
                                message: '',
                                fundingSourceSplit: fundingSourceSplit,
                                planningUnitSplit: planningUnitSplit,
                                procurementAgentSplit: procurementAgentSplit,
                                table1Headers: table1Headers,
                                loading: false
                            }, () => {

                                console.log("procurementAgentSplit----->", this.state.procurementAgentSplit);
                                console.log("fundingSourceSplit----->", this.state.fundingSourceSplit);
                                console.log("planningUnitSplit----->", this.state.planningUnitSplit);
                                console.log("table1Headers----->", this.state.table1Headers);
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

    componentDidMount() {

        if (isSiteOnline()) {
            this.getCountrys();
            this.getPrograms();
            //this.getRelamList();
            // this.getProductCategories();
            this.getFundingSource();
            this.getShipmentStatusList();
        } else {
            this.setState({ loading: false })
            this.getPrograms();
            this.getFundingSource();
            this.getShipmentStatusList();

        }

    }
    getCountrys = () => {

        // AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();//document.getElementById('realmId').value
        RealmCountryService.getRealmCountryForProgram(realmId)
            .then(response => {
                var listArray = response.data.map(ele => ele.realmCountry);
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    // countrys: response.data.map(ele => ele.realmCountry)
                    countrys: listArray
                }, () => { this.fetchData(); })
            }).catch(
                error => {
                    this.setState({
                        countrys: []
                    })
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {

                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
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

    handleChange = (countrysId) => {
        console.log('==>', countrysId)
        countrysId = countrysId.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            countryValues: countrysId.map(ele => ele),
            countryLabels: countrysId.map(ele => ele.label)
        }, () => {
            this.filterProgram();
            // this.fetchData()
        })
    }
    filterProgram = () => {
        let countryIds = this.state.countryValues.map(ele => ele.value);
        console.log('countryIds', countryIds, 'programs', this.state.programs)
        this.setState({
            programLst: [],
            programValues: [],
            programLabels: [],
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: []
        }, () => {
            if (countryIds.length != 0) {
                let programLst = [];
                for (var i = 0; i < countryIds.length; i++) {
                    programLst = [...programLst, ...this.state.programs.filter(c => c.realmCountry.realmCountryId == countryIds[i])]
                }

                console.log('programLst', programLst)
                if (programLst.length > 0) {

                    this.setState({
                        programLst: programLst
                    }, () => {
                        this.fetchData()
                    });
                } else {
                    this.setState({
                        programLst: []
                    }, () => {
                        this.fetchData()
                    });
                }
            } else {
                this.setState({
                    programLst: []
                }, () => {
                    this.fetchData()
                });
            }

        })
    }

    handleChangeProgram = (programIds) => {
        programIds = programIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            programValues: programIds.map(ele => ele),
            programLabels: programIds.map(ele => ele.label)
        }, () => {

            this.fetchData();
            this.getPlanningUnit();
        })

    }

    getRelamList = () => {
        // AuthenticationService.setupAxiosInterceptors();
        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realmList: response.data, loading: false
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {

                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
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
        // .catch(
        //     error => {
        //         if (error.message === "Network Error") {
        //             this.setState({ message: error.message, loading: false });
        //         } else {
        //             switch (error.response.status) {
        //                 case 500:
        //                 case 401:
        //                 case 404:
        //                 case 406:
        //                 case 412:
        //                     this.setState({ message: error.response.data.messageCode, loading: false });
        //                     break;
        //                 default:
        //                     this.setState({ message: 'static.unkownError', loading: false });
        //                     console.log("Error code unkown");
        //                     break;
        //             }
        //         }
        //     }
        // );
    }

    getShipmentStatusList() {
        const { shipmentStatuses } = this.state
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ShipmentStatusService.getShipmentStatusListActive()
                .then(response => {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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
                                message: 'static.unkownError',
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
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
            // .catch(
            //     error => {
            //         this.setState({
            //             countrys: []
            //         })
            //         if (error.message === "Network Error") {
            //             this.setState({ message: error.message, loading: false });
            //         } else {
            //             switch (error.response ? error.response.status : "") {
            //                 case 500:
            //                 case 401:
            //                 case 404:
            //                 case 406:
            //                 case 412:
            //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.common.status') }) });
            //                     break;
            //                 default:
            //                     this.setState({ message: 'static.unkownError', loading: false });
            //                     break;
            //             }
            //         }
            //     }
            // );
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
                    //handel error
                }.bind(this);
                sStatusRequest.onsuccess = function (event) {
                    sStatusResult = sStatusRequest.result;
                    console.log("shipment status list offline--->", sStatusResult);
                    this.setState({ shipmentStatuses: sStatusResult });
                }.bind(this)

            }.bind(this)
        }
    }

    getFundingSource = () => {
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            FundingSourceService.getFundingSourceListAll()
                .then(response => {
                    // console.log(JSON.stringify(response.data))
                    this.setState({
                        fundingSources: response.data, loading: false
                    }, () => { this.consolidatedFundingSourceList() })
                }).catch(
                    error => {
                        this.setState({
                            fundingSources: []
                        }, () => { this.consolidatedFundingSourceList() })
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
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
            // .catch(
            //     error => {
            //         this.setState({
            //             fundingSources: []
            //         }, () => { this.consolidatedFundingSourceList() })
            //         if (error.message === "Network Error") {
            //             this.setState({ message: error.message, loading: false });
            //         } else {
            //             switch (error.response ? error.response.status : "") {
            //                 case 500:
            //                 case 401:
            //                 case 404:
            //                 case 406:
            //                 case 412:
            //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
            //                     break;
            //                 default:
            //                     this.setState({ message: 'static.unkownError', loading: false });
            //                     break;
            //             }
            //         }
            //     }
            // );

        } else {
            console.log('offline')
            this.consolidatedFundingSourceList()
        }

    }

    consolidatedFundingSourceList = () => {
        const lan = 'en';
        const { fundingSources } = this.state
        var proList = fundingSources;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['fundingSource'], 'readwrite');
            var fundingSource = transaction.objectStore('fundingSource');
            var getRequest = fundingSource.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {

                    var f = 0
                    for (var k = 0; k < this.state.fundingSources.length; k++) {
                        if (this.state.fundingSources[k].fundingSourceId == myResult[i].fundingSourceId) {
                            f = 1;
                            console.log('already exist')
                        }
                    }
                    var programData = myResult[i];
                    if (f == 0) {
                        proList.push(programData)
                    }

                }
                proList.sort((a, b) => {
                    var itemLabelA = a.fundingSourceCode.toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = b.fundingSourceCode.toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });

                this.setState({
                    fundingSources: proList
                })

            }.bind(this);

        }.bind(this);
    }


    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    getPrograms = () => {
        if (isSiteOnline()) {
            ProgramService.getProgramList()
                .then(response => {
                    console.log(JSON.stringify(response.data))
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        programs: listArray, loading: false
                    })
                }).catch(
                    error => {
                        this.setState({
                            programs: [], loading: false
                        })
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
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
            console.log('offline')
            this.consolidatedProgramList()
        }
    }

    consolidatedProgramList = () => {
        const lan = 'en';
        const { programs } = this.state
        var proList = programs;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                        // console.log(programNameLabel)

                        proList.push(programData)

                    }
                }
                proList.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    programs: proList
                })
            }.bind(this);
        }.bind(this);
    }

    filterVersion = () => {
        let programId = document.getElementById("programId").value;
        if (programId != 0) {

            const program = this.state.programs.filter(c => c.programId == programId)
            // console.log(program)
            if (program.length == 1) {
                if (isSiteOnline()) {
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

    consolidatedVersionList = (programId) => {
        const lan = 'en';
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
                // Handle errors!
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

                // console.log(verList)
                this.setState({
                    versions: verList.filter(function (x, i, a) {
                        return a.indexOf(x) === i;
                    })
                })

            }.bind(this);
        }.bind(this);
    }

    getProductCategories() {
        // AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId()//document.getElementById("realmId").value;
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                // console.log(response.data)
                var list = response.data.slice(1);
                // var list = response.data;
                this.setState({
                    productCategories: list, loading: false
                })
            }).catch(
                error => {
                    this.setState({
                        productCategories: [], loading: false
                    })
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {

                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }),
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }),
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
        // .catch(
        //     error => {
        //         this.setState({
        //             productCategories: [], loading: false
        //         })
        //         if (error.message === "Network Error") {
        //             this.setState({ message: error.message, loading: false });
        //         } else {
        //             switch (error.response ? error.response.status : "") {
        //                 case 500:
        //                 case 401:
        //                 case 404:
        //                 case 406:
        //                 case 412:
        //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
        //                     break;
        //                 default:
        //                     this.setState({ message: 'static.unkownError', loading: false });
        //                     break;
        //             }
        //         }
        //     }
        // );
        this.getPlanningUnit();
    }

    getPlanningUnit = () => {

        this.setState({
            planningUnits: [],
            planningUnitValues: []
        }, () => {
            if (!isSiteOnline()) {
                let programId = document.getElementById("programId").value;
                let versionId = document.getElementById("versionId").value;
                const lan = 'en';
                var db1;
                var storeOS;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                    var planningunitRequest = planningunitOs.getAll();
                    var planningList = []
                    planningunitRequest.onerror = function (event) {
                        // Handle errors!
                    };
                    planningunitRequest.onsuccess = function (e) {
                        var myResult = [];
                        myResult = planningunitRequest.result;
                        var programId = (document.getElementById("programId").value).split("_")[0];
                        var proList = []
                        // console.log(myResult)
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
                // AuthenticationService.setupAxiosInterceptors();
                // let productCategoryId = document.getElementById("productCategoryId").value;
                // var lang = this.state.lang
                // if (productCategoryId != -1) {
                //     PlanningUnitService.getActivePlanningUnitByProductCategoryId(productCategoryId).then(response => {
                //         // console.log("PLANNING-UNIT--->", response.data);
                //         (response.data).sort(function (a, b) {
                //             return getLabelText(a.label, lang).localeCompare(getLabelText(b.label, lang)); //using String.prototype.localCompare()
                //         });
                //         this.setState({
                //             planningUnits: response.data,
                //         }, () => {
                //             this.fetchData()
                //         });
                //     }).catch(
                //         error => {
                //             this.setState({
                //                 planningUnits: [],
                //             })
                //             if (error.message === "Network Error") {
                //                 this.setState({
                //                     message: 'static.unkownError',
                //                     loading: false
                //                 });
                //             } else {
                //                 switch (error.response ? error.response.status : "") {

                //                     case 401:
                //                         this.props.history.push(`/login/static.message.sessionExpired`)
                //                         break;
                //                     case 403:
                //                         this.props.history.push(`/accessDenied`)
                //                         break;
                //                     case 500:
                //                     case 404:
                //                     case 406:
                //                         this.setState({
                //                             message: error.response.data.messageCode,
                //                             loading: false
                //                         });
                //                         break;
                //                     case 412:
                //                         this.setState({
                //                             message: error.response.data.messageCode,
                //                             loading: false
                //                         });
                //                         break;
                //                     default:
                //                         this.setState({
                //                             message: 'static.unkownError',
                //                             loading: false
                //                         });
                //                         break;
                //                 }
                //             }
                //         }
                //     );
                // }


                let programValues = this.state.programValues;
                // console.log("programValues----->", programValues);
                this.setState({
                    planningUnits: [],
                    planningUnitValues: [],
                    planningUnitLabels: []
                }, () => {
                    if (programValues.length > 0) {
                        PlanningUnitService.getPlanningUnitByProgramIds(programValues.map(ele => (ele.value)))
                            .then(response => {
                                // (response.data).sort(function (a, b) {
                                //     return getLabelText(a.label, this.state.lang).localeCompare(getLabelText(b.label, this.state.lang)); //using String.prototype.localCompare()
                                // });
                                var listArray = response.data;
                                listArray.sort((a, b) => {
                                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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
                                            message: 'static.unkownError',
                                            loading: false
                                        });
                                    } else {
                                        switch (error.response ? error.response.status : "") {

                                            case 401:
                                                this.props.history.push(`/login/static.message.sessionExpired`)
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

    handlePlanningUnitChange = (planningUnitIds) => {
        console.log(planningUnitIds)
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

    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    onRadioBtnClick(radioSelected) {
        this.setState({
            radioSelected: radioSelected,
        });
    }

    show() {
        /* if (!this.state.showed) {
             setTimeout(() => {this.state.closeable = true}, 250)
             this.setState({ showed: true })
         }*/
    }
    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => { this.fetchData(); })

    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

    getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    handleFundingSourceChange(fundingSourceIds) {
        fundingSourceIds = fundingSourceIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            fundingSourceValues: fundingSourceIds.map(ele => ele),
            fundingSourceLabels: fundingSourceIds.map(ele => ele.label)
        }, () => {
            console.log("***************", this.state);
            this.fetchData();
        })
    }
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


    render() {

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

                    // { label: getLabelText(item.label, this.state.lang), value: item.programId }
                    { label: (item.programCode), value: item.programId }

                )
            }, this);
        const { countrys } = this.state;
        let countryList = countrys.length > 0 && countrys.map((item, i) => {
            console.log(JSON.stringify(item))
            return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
        }, this);

        // const { productCategories } = this.state;

        // const { planningUnits } = this.state;
        // let planningUnitList = planningUnits.length > 0
        //     && planningUnits.map((item, i) => {
        //         if (navigator.onLine) {
        //             return (
        //                 { label: getLabelText(item.label, this.state.lang), value: item.planningUnitId }
        //             )
        //         } else {
        //             return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })
        //         }


        //     }, this);

        const { planningUnits } = this.state;
        let planningUnitList = [];
        planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (

                    { label: getLabelText(item.label, this.state.lang), value: item.id }

                )
            }, this);


        const { fundingSources } = this.state;
        let fundingSourceList = [];
        fundingSourceList = fundingSources.length > 0
            && fundingSources.map((item, i) => {
                return (

                    { label: item.fundingSourceCode, value: item.fundingSourceId }

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

        // const { shipmentStatuses } = this.state;
        // let shipmentStatusList = shipmentStatuses.length > 0 && shipmentStatuses.map((item, i) => {
        //     return (
        //         <option key={i} value={item.shipmentStatusId}>
        //             {getLabelText(item.label, this.state.lang)}
        //         </option>

        //     )
        // }, this);

        const backgroundColor = [
            '#4dbd74',
            '#c8ced3',
            '#000',
            '#ffc107',
            '#f86c6b',
            '#20a8d8',
            '#042e6a',
            '#59cacc',
            '#118b70',
            '#EDB944',
            '#F48521',
            '#ED5626',
            '#3fe488'
        ]

        const chartData = {
            // labels: ['Male Condom (Latex) Lubricated,Be Safe,53 mm,3000 Units', 'Female Condom (Nitrile) Lubricated, 17 cm,1000 Units', 'Female Condom (Nitrile) Lubricated, 17 cm, 20 Units'],
            // datasets: [{
            //     label: 'Ordered Shipments',
            //     data: [20000, 10000, 2000],
            //     backgroundColor: '#6a82a8',
            //     borderWidth: 0

            // },
            // {
            //     label: 'Planned Shipments',
            //     data: [20000, 20000, 2000],
            //     backgroundColor: '#dee7f8',
            //     borderWidth: 0,
            // }
            // ]

            labels: [...new Set(this.state.planningUnitSplit.map(ele => (getLabelText(ele.planningUnit.label, this.state.lang))))],
            datasets: [{
                label: i18n.t('static.shipment.orderedShipment'),
                data: this.state.planningUnitSplit.map(ele => (ele.orderedShipmentQty)),
                backgroundColor: '#0067B9',
                borderWidth: 0

            },
            {
                label: i18n.t('static.shipment.plannedShipment'),
                data: this.state.planningUnitSplit.map(ele => (ele.plannedShipmentQty)),
                backgroundColor: '#A7C6ED',
                borderWidth: 0,
            }
            ]
        };
        const chartDataForPie = {
            // labels: [...new Set(this.state.fundingSourceSplit.map(ele => (getLabelText(ele.fundingSource.label, this.state.lang))))],
            labels: [...new Set(this.state.fundingSourceSplit.map(ele => ele.fundingSource.code))],
            datasets: [{
                data: this.state.fundingSourceSplit.map(ele => (ele.amount)),
                // backgroundColor: ['#4dbd74', '#f86c6b', '#8aa9e6', '#EDB944', '#20a8d8',
                //     '#042e6a',
                //     '#59cacc', '#118b70',
                //     '#EDB944',
                //     '#F48521',
                //     '#ED5626',
                //     '#3fe488'],
                backgroundColor: [
                    '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
                    '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
                    '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
                    '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
                    '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
                    '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
                    '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
                ],
                legend: {
                    position: 'bottom'
                }
            }],
        }


        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }

        const checkOnline = localStorage.getItem('sessionType');

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
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />

                                </a>
                            </div>
                        }
                    </div>
                    <CardBody className=" pt-lg-0 pb-lg-0">
                        <div ref={ref}>

                            <Form >
                                {/* <Col md="12 pl-0"> */}
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
                                                    //theme="light"
                                                    onChange={this.handleRangeChange}
                                                    onDismiss={this.handleRangeDissmis}
                                                >
                                                    <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                </Picker>

                                            </div>
                                        </FormGroup>
                                        {/* <Online>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="select">{i18n.t('static.program.realm')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            bsSize="sm"
                                                            type="select" name="realmId" id="realmId"
                                                            onChange={(e) => { this.getProductCategories(); this.fetchData(); }}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {realms}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                        </Online> */}
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
                                                />
                                            </div>

                                        </FormGroup>

                                        {/* <Online>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="productCategoryId"
                                                            id="productCategoryId"
                                                            bsSize="sm"
                                                            onChange={this.getPlanningUnit}
                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {productCategories.length > 0
                                                                && productCategories.map((item, i) => {
                                                                    return (
                                                                        <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
                                                                            {Array(item.level).fill(' ').join('') + (getLabelText(item.payload.label, this.state.lang))}
                                                                        </option>
                                                                    )
                                                                }, this)}
                                                        </Input>
                                                    </InputGroup>
                                                </div>

                                            </FormGroup>
                                        </Online> */}
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
                                                // options={fundingSourceList && fundingSourceList.length > 0 ? fundingSourceList : []}
                                                />

                                                {/* <Multiselect
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    bsSize="md"
                                                    showCheckbox={true}
                                                    options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []} // Options to display in the dropdown
                                                    selectedValues={this.state.planningUnitValues} // Preselected value to persist in dropdown
                                                    onSelect={(e) => { this.handlePlanningUnitChange(e) }}
                                                    onRemove={(e) => { this.handlePlanningUnitChange(e) }}
                                                    // onSelect={this.onSelect} // Function will trigger on select event
                                                    // onRemove={this.onRemove} // Function will trigger on remove event
                                                    // displayValue="label" // Property name to display in the dropdown options
                                                /> */}

                                            </div>
                                        </FormGroup>

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

                                        {/* <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="shipmentStatusId"
                                                        id="shipmentStatusId"
                                                        bsSize="sm"
                                                        onChange={this.fetchData}
                                                    >
                                                        <option value="-1">{i18n.t('static.common.all')}</option>
                                                        {shipmentStatusList}
                                                    </Input>

                                                </InputGroup>
                                            </div>
                                        </FormGroup> */}


                                    </div>
                                    {/* </Col> */}
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
                                                    <Pie id="cool-canvas2" data={chartDataForPie} options={optionsPie}
                                                    /><br />
                                                </div>
                                                <h5 className="red text-center">{i18n.t('static.report.fundingSourceUsdAmount')}</h5>
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
                                {/* {
                                this.state.procurementAgentSplit.length > 0 &&
                                <Col md="12 pl-0">
                                    <div className="col-md-12 p-0">
                                        <div className="col-md-12">
                                            <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                                                {this.state.show ? 'Hide Data' : 'Show Data'}
                                            </button>
                                        </div>
                                    </div>
                                </Col>
                            } */}

                                <Col md="12 pl-0 pb-lg-1">
                                    <div className="globalviwe-scroll">
                                        <div className="row">
                                            <div className="col-md-12">
                                                {this.state.procurementAgentSplit.length > 0 &&
                                                    <div className="table-responsive ">
                                                        <Table id="mytable1" responsive className="table-striped  table-fixed table-bordered text-center mt-2">

                                                            <thead>
                                                                <tr>
                                                                    <th rowSpan={2}>{i18n.t('static.dashboard.planningunitheader')}</th>
                                                                    <th colSpan={this.state.table1Headers.length} align='center'>{i18n.t('static.report.procurementAgentName')}</th>
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
