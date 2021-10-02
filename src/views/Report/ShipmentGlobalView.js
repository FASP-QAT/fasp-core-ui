import React, { Component, lazy, Suspense, DatePicker } from 'react';
import { Bar, Pie, HorizontalBar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
    Badge,
    Button,
    ButtonDropdown,
    ButtonGroup,
    ButtonToolbar,
    Card,
    CardBody,
    // CardFooter,
    CardHeader,
    CardTitle,
    Col,
    Widgets,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Progress,
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,
    CardColumns,
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
import { SECRET_KEY, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH } from '../../Constants.js'
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
import ProcurementAgentService from "../../api/ProcurementAgentService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import MultiSelect from 'react-multi-select-component';
// const { getToggledOptions } = utils;
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
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
            labelMaxWidth: 100,
            stacked: true,
            gridLines: {
                display: false
            },
        }],
        yAxes: [{
            stacked: true,
            labelString: i18n.t('static.shipment.amount'),
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
            }
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
            fontColor: 'black'
        }
    }
}

const options1 = {
    title: {
        display: true,
        text: i18n.t('static.shipment.shipmentfundingSource'),
        fontColor: 'black'
    },
    scales: {
        xAxes: [{
            labelMaxWidth: 100,
            stacked: true,
            gridLines: {
                display: false
            },
        }],
        yAxes: [{
            stacked: true,
            labelString: i18n.t('static.shipment.amount'),
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
const options2 = {
    title: {
        display: true,
        text: i18n.t('static.shipment.shipmentProcurementAgent'),
        fontColor: 'black'
    },
    scales: {
        xAxes: [{
            labelMaxWidth: 100,
            stacked: true,
            gridLines: {
                display: false
            },
        }],
        yAxes: [{
            stacked: true,
            labelString: i18n.t('static.shipment.amount'),
        }],
    },
    tooltips: {
        enabled: false,
        custom: CustomTooltips
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

const chartData = {
    labels: ["Malawi", "Kenya", "Zimbabwe"],
    datasets: [{
        label: i18n.t('static.shipment.orderedShipment'),
        data: [20000, 10000, 2000],
        backgroundColor: '#6a82a8',
        borderWidth: 0
    },
    {
        label: i18n.t('static.shipment.plannedShipment'),
        data: [20000, 20000, 2000],
        backgroundColor: '#dee7f8',
        borderWidth: 0,
    }
    ]
};

const chartData1 = {
    labels: ["Jan 2019", "Feb 2019", "Mar 2019", "Apr 2019", "May 19", "Jun 19", "Jul 19", "Aug 2019", "Sep 2019", "Oct 2019", "Nov 2019", "Dec 2019"],
    datasets: [
        {
            label: 'PSM',
            data: [0, 40000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#4dbd74',
            borderWidth: 0,
        }, {
            label: 'GF',
            data: [0, 0, 4000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#f86c6b',
            borderWidth: 0
        },
        {
            label: 'Local',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#8aa9e6',
            borderWidth: 0,
        },
        {
            label: 'Govt',
            data: [0, 0, 0, 30000, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#EDB944',
            borderWidth: 0,
        }
    ]
};
const backgroundColor = [
    // '#002f6c',
    // '#212721',
    // '#20a8d8',
    // '#4dbd74',
    // '#f86c6b',
    // '#d1e3f5',
    // '#118b70',
    // '#EDB944',
    // '#F48521',
    // '#ED5626',
    // '#cfcdc9',
    // '#004876', '#0063a0', '#007ecc', '#0093ee', '#82caf8', '#c8e6f4'
    '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
    '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
    '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
    '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
    '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
    '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
    '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
]
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



class ShipmentGlobalView extends Component {
    constructor(props) {
        super(props);

        this.toggledata = this.toggledata.bind(this);
        this.onRadioBtnClick = this.onRadioBtnClick.bind(this);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
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
            productCategories: [],
            countryValues: [],
            procurementAgents: [],
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
            shipmentList: [],
            dateSplitList: [],
            countrySplitList: [],
            countryShipmentSplitList: [],
            data:
            {
                shipmentList: [],
                dateSplitList: [],
                countrySplitList: [],
                countryShipmentSplitList: []
            },
            lab: [],
            val: [],
            realmList: [],
            table1Body: [],
            table1Headers: [],
            viewby: 1,
            // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: true,
            programLst: []


        };
        this.getCountrys = this.getCountrys.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.getPlanningUnit = this.getPlanningUnit.bind(this);
        this.handleChange = this.handleChange.bind(this)
        this.getRandomColor = this.getRandomColor.bind(this)
        this.handleChangeProgram = this.handleChangeProgram.bind(this)
        this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this)
        this.getProductCategories = this.getProductCategories.bind(this)
        this.filterProgram = this.filterProgram.bind(this);
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
        this.state.countryLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        this.state.programLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))

        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.dashboard.productcategory') + ' : ' + (document.getElementById("productCategoryId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + (document.getElementById("planningUnitId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        var viewby = document.getElementById("viewById").value;
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.display') + ' : ' + (document.getElementById("viewById").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        csvRow.push('')

        if (viewby == 1) {
            this.state.fundingSourceLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.budget.fundingsource') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        } else {
            this.state.procurementAgentLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.procurementagent.procurementagent') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        }
        csvRow.push('')
        csvRow.push('"' + ((i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('"' + ((i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20') + '"'))

        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var re;

        if (this.state.table1Body.length > 0) {
            var A = [];

            let tableHead = this.state.table1Headers;
            let tableHeadTemp = [];

            for (var i = 0; i < tableHead.length; i++) {
                tableHeadTemp.push((tableHead[i].replaceAll(',', ' ')).replaceAll(' ', '%20'));
            }
            A[0] = this.addDoubleQuoteToRowContent(tableHeadTemp);
            re = this.state.table1Body
            for (var item = 0; item < re.length; item++) {
                A.push([[('"' + getLabelText(re[item].country.label, this.state.lang)).replaceAll(' ', '%20') + '"', this.addDoubleQuoteToRowContent(re[item].amount)]])
            }
            for (var i = 0; i < A.length; i++) {
                csvRow.push(A[i].join(","))
            }
        }
        csvRow.push('')
        csvRow.push('')
        csvRow.push('')

        if (this.state.shipmentList.length > 0) {
            let tempLabel = '';
            if (viewby == 1) {
                tempLabel = i18n.t('static.budget.fundingsource');
            } else {
                tempLabel = i18n.t('static.procurementagent.procurementagent');
            }
            var B = [this.addDoubleQuoteToRowContent([(i18n.t('static.dashboard.months').replaceAll(',', ' ')).replaceAll(' ', '%20'), (i18n.t('static.program.realmcountry').replaceAll(',', ' ')).replaceAll(' ', '%20'), (i18n.t('static.supplyPlan.amountInUSD').replaceAll(',', ' ')).replaceAll(' ', '%20'), (tempLabel.replaceAll(',', ' ')).replaceAll(' ', '%20'), (i18n.t('static.common.status').replaceAll(',', ' ')).replaceAll(' ', '%20')])];
            re = this.state.shipmentList;
            for (var item = 0; item < re.length; item++) {
                B.push([this.addDoubleQuoteToRowContent([(moment(re[item].transDate, 'YYYY-MM-dd').format('MMM YYYY').replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(re[item].country.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), re[item].amount, (getLabelText(re[item].fundingSourceProcurementAgent.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(re[item].shipmentStatus.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20')])])
            }
            for (var i = 0; i < B.length; i++) {
                csvRow.push(B[i].join(","))
            }
        }

        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.shipmentGlobalViewheader') + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to) + ".csv"
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

                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.shipmentGlobalViewheader'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })

                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)

                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })

                    var countryLabelsText = doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 110, countryLabelsText)
                    var len = 120 + countryLabelsText.length * 10

                    var planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, len, planningText)
                    len = len + 10 + planningText.length * 10
                    doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, len, {
                        align: 'left'
                    })
                    len = len + 20
                    doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, len, {
                        align: 'left'
                    })
                    len = len + 20
                    doc.text(i18n.t('static.common.display') + ' : ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 8, len, {
                        align: 'left'
                    })
                    len = len + 20
                    doc.text(i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text, doc.internal.pageSize.width / 8, len, {
                        align: 'left'
                    })
                    len = len + 20
                    doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, len, {
                        align: 'left'
                    })
                    len = len + 20
                    var viewby = document.getElementById("viewById").value;
                    if (viewby == 1) {

                        var fundingSourceText = doc.splitTextToSize((i18n.t('static.budget.fundingsource') + ' : ' + this.state.fundingSourceLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                        doc.text(doc.internal.pageSize.width / 8, len, fundingSourceText)

                    } else {

                        var procurementAgentText = doc.splitTextToSize((i18n.t('static.procurementagent.procurementagent') + ' : ' + this.state.procurementAgentLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                        doc.text(doc.internal.pageSize.width / 8, len, procurementAgentText)
                    }

                }
            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(10);

        //creates image1
        const title = i18n.t('static.dashboard.shipmentGlobalViewheader');
        var canvas = document.getElementById("cool-canvas1");

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        var aspectwidth1 = (width - h1);
        doc.addImage(canvasImg, 'png', 50, 260, 300, 200, 'a', 'CANVAS');

        //creates image2
        canvas = document.getElementById("cool-canvas2");

        canvasImg = canvas.toDataURL("image/png", 1.0);
        doc.addImage(canvasImg, 'png', width / 2, 260, 300, 200, 'b', 'CANVAS');

        let displaylabel = [];
        displaylabel = this.state.dateSplitList.filter((i, index) => (index < 1)).map(ele => (Object.keys(ele.amount)));
        if (displaylabel.length > 0) {
            displaylabel = displaylabel[0];
        }
        let length = displaylabel.length + 1;

        let content1 = {
            margin: { top: 80, bottom: 50 },
            startY: height,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 550 / displaylabel.length, halign: 'center' },
            columnStyles: {
                // 0: { cellWidth: 100 },
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

        let content2 = {
            margin: { top: 80, bottom: 50 },
            startY: doc.autoTableEndPosY() + 50,
            pageBreak: 'auto',
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 120, halign: 'center' },
            columnStyles: {
                // 0: { cellWidth: 100 },
                // 1: { cellWidth: 100 },
                // 2: { cellWidth: 200 },
                3: { cellWidth: 281.89 },
                // 4: { cellWidth: 100 },
            },
            html: '#mytable2',

            didDrawCell: function (data) {
                if (data.column.index === 5 && data.cell.section === 'body') {
                    var td = data.cell.raw;
                    var img = td.getElementsByTagName('img')[0];
                    var dim = data.cell.height - data.cell.padding('vertical');
                    var textPos = data.cell.textPos;
                    doc.addImage(img.src, textPos.x, textPos.y, dim, dim);
                }
            }
        };

        //doc.text(title, marginLeft, 40);

        doc.autoTable(content2);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.shipmentGlobalViewheader').concat('.pdf'));
        //creates PDF from img
        /*  var doc = new jsPDF('landscape');
          doc.setFontSize(20);
          doc.text(15, 15, "Cool Chart");
          doc.save('canvas.pdf');*/
    }


    // handleChange(countrysId) {
    //     console.log('==>', countrysId)
    //     countrysId = countrysId.sort(function (a, b) {
    //         return parseInt(a.value) - parseInt(b.value);
    //     })
    //     this.setState({
    //         countryValues: countrysId.map(ele => ele),
    //         countryLabels: countrysId.map(ele => ele.label)
    //     }, () => {

    //         this.fetchData()
    //     })
    // }
    handleChangeProgram(programIds) {
        programIds = programIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            programValues: programIds.map(ele => ele),
            programLabels: programIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })

    }

    handlePlanningUnitChange(planningUnitIds) {

        this.setState({
            planningUnitValues: planningUnitIds.map(ele => ele.value),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })
    }



    getCountrys() {

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
    getPlanningUnit() {

        let productCategoryId = document.getElementById("productCategoryId").value;
        // AuthenticationService.setupAxiosInterceptors();
        var lang = this.state.lang
        if (productCategoryId != -1) {
            PlanningUnitService.getActivePlanningUnitByProductCategoryId(productCategoryId).then(response => {
                (response.data).sort(function (a, b) {
                    return getLabelText(a.label, lang).localeCompare(getLabelText(b.label, lang)); //using String.prototype.localCompare()
                });
                this.setState({
                    planningUnits: response.data,
                }, () => {
                    this.fetchData()
                });
            }).catch(
                error => {
                    this.setState({
                        planningUnits: [],
                        planningUnitValues: []
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
            // .catch(
            //     error => {
            //         this.setState({
            //             planningUnits: [],
            //             planningUnitValues: []
            //         })
            //         if (error.message === "Network Error") {
            //             this.setState({ message: error.message });
            //         } else {
            //             switch (error.response ? error.response.status : "") {
            //                 case 500:
            //                 case 401:
            //                 case 404:
            //                 case 406:
            //                 case 412:
            //                     //  this.setState({ message: error.response.data.messageCode });
            //                     break;
            //                 default:
            //                     this.setState({ message: 'static.unkownError' });
            //                     break;
            //             }
            //         }
            //     }
            // );
        }

    }

    toggleView = () => {
        let viewby = document.getElementById("viewById").value;
        this.setState({
            viewby: viewby
        });
        if (viewby == 1) {
            document.getElementById("fundingSourceDiv").style.display = "block";
            document.getElementById("procurementAgentDiv").style.display = "none";
            this.setState({
                data: []
            }, () => {
                this.fetchData();
            })


        } else if (viewby == 2) {
            document.getElementById("procurementAgentDiv").style.display = "block";
            document.getElementById("fundingSourceDiv").style.display = "none";
            this.setState({
                data: []
            }, () => {
                this.fetchData();
            })
        }
    }

    componentDidMount() {

        this.getCountrys();
        this.getPrograms();
        this.getProductCategories();
        this.getProcurementAgent();
        this.getFundingSource();
        document.getElementById("procurementAgentDiv").style.display = "none";

    }

    getPrograms = () => {

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
        //                     this.setState({ loading: false, message: error.response.data.messageCode });
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

    getProcurementAgent = () => {

        // AuthenticationService.setupAxiosInterceptors();
        ProcurementAgentService.getProcurementAgentListAll()
            .then(response => {
                // console.log(JSON.stringify(response.data))
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = a.procurementAgentCode.toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = b.procurementAgentCode.toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    procurementAgents: listArray, loading: false
                })
            }).catch(
                error => {
                    this.setState({
                        procurementAgents: [], loading: false
                    })
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message, loading: false });
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

    getFundingSource = () => {

        // AuthenticationService.setupAxiosInterceptors();
        FundingSourceService.getFundingSourceListAll()
            .then(response => {
                // console.log(JSON.stringify(response.data))
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = a.fundingSourceCode.toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = b.fundingSourceCode.toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    fundingSources: listArray, loading: false
                })
            }).catch(
                error => {
                    this.setState({
                        fundingSources: []
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
        // .catch(
        //     error => {
        //         this.setState({
        //             fundingSources: []
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
        //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
        //                     break;
        //                 default:
        //                     this.setState({ message: 'static.unkownError', loading: false });
        //                     break;
        //             }
        //         }
        //     }
        // );
    }

    getProductCategories() {
        // AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                // console.log(response.data)
                // var list = response.data.slice(1);
                var list = response.data;
                list.sort((a, b) => {
                    var itemLabelA = getLabelText(a.payload.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.payload.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
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
        this.setState({ rangeValue: value })
        this.fetchData();
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

    fetchData = () => {

        let viewby = document.getElementById("viewById").value;
        let realmId = AuthenticationService.getRealmId()
        let procurementAgentIds = this.state.procurementAgentValues.length == this.state.procurementAgents.length ? [] : this.state.procurementAgentValues.map(ele => (ele.value).toString());
        let fundingSourceIds = this.state.fundingSourceValues.length == this.state.fundingSources.length ? [] : this.state.fundingSourceValues.map(ele => (ele.value).toString());
        let productCategoryId = document.getElementById("productCategoryId").value;
        let CountryIds = this.state.countryValues.length == this.state.countrys.length ? [] : this.state.countryValues.map(ele => (ele.value).toString());
        let useApprovedVersion = document.getElementById("includeApprovedVersions").value
        let includePlanningShipments = document.getElementById("includePlanningShipments").value
        let programIds = this.state.programValues.length == this.state.programs.length ? [] : this.state.programValues.map(ele => (ele.value).toString());

        let planningUnitId = document.getElementById("planningUnitId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + String(this.state.rangeValue.to.month).padStart(2, '0') + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        let fundingSourceProcurementAgentIds = [];
        if (viewby == 1) {
            fundingSourceProcurementAgentIds = fundingSourceIds;
        } else {
            fundingSourceProcurementAgentIds = procurementAgentIds;
        }
        // console.log("planningUnitId-------", planningUnitId);
        // console.log("productCategoryId------", productCategoryId);
        // console.log("CountryIds-----", CountryIds);
        // console.log("procurementAgentIds----", procurementAgentIds);
        // console.log("viewby-----", viewby);
        // console.log("startDate-----", startDate);
        // console.log("endDate-----", endDate);

        if (realmId > 0 && planningUnitId != 0 && productCategoryId != -1 && this.state.countryValues.length > 0 && this.state.programValues.length > 0 && ((viewby == 2 && this.state.procurementAgentValues.length > 0) || (viewby == 1 && this.state.fundingSourceValues.length > 0))) {

            this.setState({
                message: '',
                loading: true
            })
            // let realmId = AuthenticationService.getRealmId();
            var inputjson = {
                realmId: realmId,
                startDate: startDate,
                stopDate: endDate,
                realmCountryIds: CountryIds,
                programIds: programIds,
                planningUnitId: planningUnitId,
                reportView: viewby,
                fundingSourceProcurementAgentIds: fundingSourceProcurementAgentIds
                , useApprovedSupplyPlanOnly: useApprovedVersion,
                includePlannedShipments: includePlanningShipments
            }
            console.log("INPUTJSON--------->", inputjson);
            // AuthenticationService.setupAxiosInterceptors();
            ReportService.ShipmentGlobalView(inputjson)
                .then(response => {
                    console.log("RESP------", response.data);
                    if (response.data.countrySplitList.length != 0) {
                        var table1Headers = [];
                        var lab = [];
                        var val = [];
                        var table1Body = [];

                        table1Headers = Object.keys(response.data.countrySplitList[0].amount);
                        // lab = Object.keys(response.data.dateSplitList[0].amount);
                        table1Headers.unshift("Country");


                        // for (var i = 0; i < response.data.dateSplitList.length; i++) {
                        //     let temp = Object.values(response.data.dateSplitList[i].amount)
                        //     val.push(temp);
                        // }


                        for (var item = 0; item < response.data.countrySplitList.length; item++) {
                            let obj = {
                                country: response.data.countrySplitList[item].country,
                                amount: Object.values(response.data.countrySplitList[item].amount),
                            }
                            table1Body.push(obj);
                        }





                        this.setState({
                            data: response.data,
                            shipmentList: response.data.shipmentList,
                            dateSplitList: response.data.dateSplitList,
                            countrySplitList: response.data.countrySplitList,
                            countryShipmentSplitList: response.data.countryShipmentSplitList,
                            table1Headers: table1Headers,
                            table1Body: table1Body,
                            lab: lab,
                            val: val,
                            loading: false
                        }, () => {
                            console.log("shipmentList-----", this.state.shipmentList);
                            console.log("dateSplitList-----", this.state.dateSplitList);
                            console.log("countrySplitList-----", this.state.countrySplitList);
                            console.log("countryShipmentSplitList-----", this.state.countryShipmentSplitList);

                            // console.log("labels---", this.state.labels);
                            // console.log("values---", this.state.values);
                            // console.log("DATA--1---", this.state.table1Headers);
                            // console.log("DATA---2--", this.state.table1Body);
                        })
                    }
                    else {
                        this.setState({
                            data: response.data,
                            shipmentList: response.data.shipmentList,
                            dateSplitList: response.data.dateSplitList,
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
                            // programs: []
                            loading: false
                        }, () => {
                            // this.consolidatedProgramList() 
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
            // .catch(
            //     error => {
            //         this.setState({
            //             // programs: []
            //             loading: false
            //         }, () => {
            //             // this.consolidatedProgramList() 
            //         })
            //         if (error.message === "Network Error") {
            //             this.setState({ message: error.message });
            //         } else {
            //             switch (error.response ? error.response.status : "") {
            //                 case 500:
            //                 case 401:
            //                 case 404:
            //                 case 406:
            //                 case 412:
            //                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
            //                     break;
            //                 default:
            //                     this.setState({ message: '' });
            //                     break;
            //             }
            //         }
            //     }
            // );

        } else if (realmId <= 0) {
            this.setState({
                message: i18n.t('static.common.realmtext'),
                data: [],
                shipmentList: [],
                dateSplitList: [],
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
                shipmentList: [],
                dateSplitList: [],
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
                shipmentList: [],
                dateSplitList: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });

        } else if (productCategoryId == -1) {
            this.setState({
                message: i18n.t('static.common.selectProductCategory'),
                data: [],
                shipmentList: [],
                dateSplitList: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });

        } else if (planningUnitId == 0) {
            this.setState({
                message: i18n.t('static.procurementUnit.validPlanningUnitText'),
                data: [],
                shipmentList: [],
                dateSplitList: [],
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
                shipmentList: [],
                dateSplitList: [],
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
                shipmentList: [],
                dateSplitList: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });

        }

    }

    // handleChange(countrysId) {

    //     this.setState({
    //         countryValues: countrysId.map(ele => ele.value),
    //         countryLabels: countrysId.map(ele => ele.label)
    //     }, () => {

    //         this.fetchData();
    //     })
    // }

    handleProcurementAgentChange(procurementAgentIds) {
        procurementAgentIds = procurementAgentIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            procurementAgentValues: procurementAgentIds.map(ele => ele),
            procurementAgentLabels: procurementAgentIds.map(ele => ele.label),
            fundingSourceValues: [],
            fundingSourceLabels: []
        }, () => {

            this.fetchData();
        })
    }

    handleFundingSourceChange(fundingSourceIds) {
        fundingSourceIds = fundingSourceIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            fundingSourceValues: fundingSourceIds.map(ele => ele),
            fundingSourceLabels: fundingSourceIds.map(ele => ele.label),
            procurementAgentValues: [],
            procurementAgentLabels: []
        }, () => {

            this.fetchData();
        })
    }

    handleChange(countrysId) {
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
            programLabels: []
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

    dateFormatterLanguage = value => {
        if (moment(value).format('MM') === '01') {
            return (i18n.t('static.month.jan') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '02') {
            return (i18n.t('static.month.feb') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '03') {
            return (i18n.t('static.month.mar') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '04') {
            return (i18n.t('static.month.apr') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '05') {
            return (i18n.t('static.month.may') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '06') {
            return (i18n.t('static.month.jun') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '07') {
            return (i18n.t('static.month.jul') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '08') {
            return (i18n.t('static.month.aug') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '09') {
            return (i18n.t('static.month.sep') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '10') {
            return (i18n.t('static.month.oct') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '11') {
            return (i18n.t('static.month.nov') + ' ' + moment(value).format('YY'))
        } else {
            return (i18n.t('static.month.dec') + ' ' + moment(value).format('YY'))
        }
    }

    render() {
        const { planningUnits } = this.state;
        let planningUnitList = [];
        planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (

                    { label: getLabelText(item.label, this.state.lang), value: item.planningUnitId }

                )
            }, this);

        const { procurementAgents } = this.state;
        let procurementAgentList = [];
        procurementAgentList = procurementAgents.length > 0
            && procurementAgents.map((item, i) => {
                return (

                    { label: item.procurementAgentCode, value: item.procurementAgentId }

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

        const { countrys } = this.state;
        let countryList = countrys.length > 0 && countrys.map((item, i) => {
            console.log(JSON.stringify(item))
            return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
        }, this);

        const { productCategories } = this.state;

        // const { realmList } = this.state;
        // let realms = realmList.length > 0
        //     && realmList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.realmId}>
        //                 {getLabelText(item.label, this.state.lang)}
        //             </option>
        //         )
        //     }, this);


        const { programLst } = this.state;
        let programList = [];
        programList = programLst.length > 0
            && programLst.map((item, i) => {
                return (

                    { label: getLabelText(item.label, this.state.lang), value: item.programId }

                )
            }, this);
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }


        const bar = {

            // labels: [...new Set(this.state.consumptions.map(ele => (ele.consumptionDateString)))],
            // datasets: consumptiondata.map((item, index) => ({ stack: 1, label: country[index], data: item, backgroundColor: backgroundColor[index] }))

            labels: this.state.countryShipmentSplitList.map(ele => (ele.country.label.label_en)),
            datasets: [{
                label: i18n.t('static.shipment.orderedShipment'),
                data: this.state.countryShipmentSplitList.map(ele => (ele.orderedShipmentAmt)),
                // backgroundColor: '#6a82a8',
                backgroundColor: '#205493',
                borderWidth: 0
            },
            {
                label: i18n.t('static.shipment.plannedShipment'),
                data: this.state.countryShipmentSplitList.map(ele => (ele.plannedShipmentAmt)),
                // backgroundColor: '#dee7f8',
                backgroundColor: '#a7c6ed',
                borderWidth: 0,
            }
            ]
        }

        // let displaylabel = Object.keys(this.state.dateSplitList[0].amount);
        // let displaylabel = [];
        // if (this.state.viewby == 1) {
        //     displaylabel = this.state.fundingSourceValues.map(ele => ele.label)
        // }
        // else {
        //     displaylabel = this.state.procurementAgentValues.map(ele => ele.label)
        // }
        //this.state.dateSplitList.filter((i, index) => (index < 1 && i)).map(ele => (Object.keys(ele.amount)));
        // if (displaylabel.length > 0) {
        //     displaylabel = displaylabel[0];
        // }
        // displaylabel = displaylabel[0];
        let displaylabel = (this.state.dateSplitList.length > 0 ? Object.keys(this.state.dateSplitList[0].amount) : []);
        console.log("displaylabel------->>>>", displaylabel);
        let dateSplitList = this.state.dateSplitList;
        let displayObject = [];

        // for (var j = 0; j < dateSplitList.length; j++) {
        //     console.log("NODE------", dateSplitList[j].amount);
        // }

        for (var i = 0; i < displaylabel.length; i++) {
            // console.log("DDD------", displaylabel[i]);
            let holdArray = [];
            for (var j = 0; j < dateSplitList.length; j++) {
                let subArraylab = Object.keys(dateSplitList[j].amount);
                let subArrayval = Object.values(dateSplitList[j].amount);
                for (var x = 0; x < subArraylab.length; x++) {
                    if (displaylabel[i].localeCompare(subArraylab[x]) == 0) {
                        holdArray.push(subArrayval[x]);
                        x = subArraylab.length;
                    }
                }
            }
            displayObject.push(holdArray);
        }
        console.log("displayObject------", displayObject);






        var bar1 = []
        const dataSet = displaylabel.map((item, index) => ({ label: item, data: displayObject[index], borderWidth: 0, backgroundColor: backgroundColor[index] }))
        bar1 = {



            // labels: [...new Set(this.state.dateSplitList.map(ele => (moment(ele.transDate, 'YYYY-MM-dd').format('MMM YYYY'))))],
            labels: [...new Set(this.state.dateSplitList.map(ele => (this.dateFormatterLanguage(moment(ele.transDate, 'YYYY-MM-dd')))))],
            datasets: dataSet

        }
        console.log(bar1)
        let viewby = this.state.viewby;


        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>

                <Card>
                    <div className="Card-header-reporticon">

                        {(this.state.shipmentList.length > 0 || this.state.dateSplitList.length > 0 || this.state.countrySplitList.length > 0 || this.state.countryShipmentSplitList.length > 0) &&
                            <div className="card-header-actions">
                                <a className="card-header-action">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                                    {(this.state.shipmentList.length > 0 || this.state.countrySplitList.length > 0) &&
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
                                                    //theme="light"
                                                    onChange={this.handleRangeChange}
                                                    onDismiss={this.handleRangeDissmis}
                                                >
                                                    <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                </Picker>
                                            </div>

                                        </FormGroup>

                                        {/* <FormGroup className="col-md-3">
                                            <Label htmlFor="select">{i18n.t('static.program.realm')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        bsSize="sm"
                                                        // onChange={(e) => { this.dataChange(e) }}
                                                        type="select" name="realmId" id="realmId"
                                                        onChange={(e) => { this.getCountrys(); }}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {realms}
                                                    </Input>

                                                </InputGroup>
                                            </div>
                                        </FormGroup> */}

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
                                            />
                                            {!!this.props.error &&
                                                this.props.touched && (
                                                    <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
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
                                            />
                                            {!!this.props.error &&
                                                this.props.touched && (
                                                    <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
                                                )}

                                        </FormGroup>

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

                                        <FormGroup className="col-sm-3" id="hideDiv">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="planningUnitId"
                                                        id="planningUnitId"
                                                        bsSize="sm"
                                                        onChange={this.fetchData}
                                                    >
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {planningUnits.length > 0
                                                            && planningUnits.map((item, i) => {
                                                                return (
                                                                    <option key={i} value={item.planningUnitId}>
                                                                        {getLabelText(item.label, this.state.lang)}
                                                                    </option>
                                                                )
                                                            }, this)}

                                                    </Input>
                                                </InputGroup>
                                            </div>
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
                                                        <option value="1">{i18n.t('static.dashboard.fundingsource')}</option>
                                                        <option value="2">{i18n.t('static.procurementagent.procurementagent')}</option>

                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>

                                        <FormGroup className="col-md-3" id="procurementAgentDiv">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.procurementagent.procurementagent')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls ">

                                                <MultiSelect

                                                    name="procurementAgentId"
                                                    id="procurementAgentId"
                                                    bsSize="sm"
                                                    value={this.state.procurementAgentValues}
                                                    onChange={(e) => { this.handleProcurementAgentChange(e) }}
                                                    options={procurementAgentList && procurementAgentList.length > 0 ? procurementAgentList : []}
                                                />


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
                                        </FormGroup>


                                    </div>
                                </div>
                            </Form>
                            <div style={{ display: this.state.loading ? "none" : "block" }}>
                                <Col md="12 pl-0">
                                    <div className="row grid-divider">
                                        {/* <div className="col-md-6 p-0 grapg-margin " > */}
                                        {this.state.countryShipmentSplitList.length > 0 &&
                                            <div className="col-md-6">
                                                <div className="chart-wrapper chart-graph-report">
                                                    {/* <Bar id="cool-canvas" data={bar} options={options} /> */}
                                                    <Bar id="cool-canvas1" data={bar} options={options} />
                                                </div>
                                            </div>
                                        }
                                        {/* </div> */}
                                        {/* <div className="col-md-6 p-0 grapg-margin " > */}
                                        {this.state.dateSplitList.length > 0 &&
                                            <div className="col-md-6">
                                                <div className="chart-wrapper chart-graph-report">
                                                    {console.log(bar1)/* <Bar id="cool-canvas" data={bar} options={options} /> */}
                                                    <Bar id="cool-canvas2" data={bar1} options={this.state.viewby == 1 ? options1 : options2} />
                                                </div>
                                            </div>
                                        }
                                        {/* </div> */}
                                        {/* <Col md="12 pl-0"> */}
                                        {/* <div className="chart-wrapper">
                                        <Bar id="cool-canvas" data={chartData} options={options} />
                                    </div> */}
                                        {/* </Col> */}
                                    </div>
                                </Col>
                                <Col md="12 pl-0">
                                    <div className="globalviwe-scroll">

                                        <div className="row">
                                            <div className="col-md-12">

                                                {/* table1 */}
                                                {this.state.table1Body.length > 0 &&
                                                    <div className="table-responsive ">
                                                        <Table id="mytable1" responsive className="table-striped  table-fixed table-bordered text-center mt-2">

                                                            <thead>
                                                                <tr>
                                                                    {
                                                                        this.state.table1Headers.map((item, idx) =>
                                                                            <th id="addr0" key={idx} className="text-center" style={{ width: '350px' }}>
                                                                                {this.state.table1Headers[idx]}
                                                                            </th>
                                                                        )
                                                                    }
                                                                </tr>
                                                            </thead>

                                                            <tbody>

                                                                {
                                                                    this.state.table1Body.map((item, idx) =>
                                                                        <tr id="addr0" key={idx} >
                                                                            <td>{getLabelText(this.state.table1Body[idx].country.label, this.state.lang)}</td>

                                                                            {
                                                                                this.state.table1Body[idx].amount.map((item, idx1) =>
                                                                                    <td id="addr1" key={idx1}>
                                                                                        {this.state.table1Body[idx].amount[idx1].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}
                                                                                    </td>
                                                                                )
                                                                            }

                                                                        </tr>
                                                                    )}
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                }

                                                {/* table2 */}

                                                {this.state.shipmentList.length > 0 &&
                                                    <div className="table-responsive ">
                                                        <Table id="mytable2" responsive className="table-striped  table-fixed table-bordered text-center mt-2">

                                                            <thead>
                                                                <tr>
                                                                    <th className="text-center" style={{ width: '350px' }}> {i18n.t('static.dashboard.months')} </th>
                                                                    <th className="text-center " style={{ width: '350px' }}> {i18n.t('static.program.realmcountry')} </th>
                                                                    <th className="text-center" style={{ width: '350px' }}>{i18n.t('static.supplyPlan.amountInUSD')}</th>
                                                                    {
                                                                        this.state.viewby == 1 &&
                                                                        <th className="text-center" style={{ width: '350px' }}>{i18n.t('static.budget.fundingsource')}</th>
                                                                    }
                                                                    {
                                                                        this.state.viewby != 1 &&
                                                                        <th className="text-center" style={{ width: '350px' }}>{i18n.t('static.procurementagent.procurementagent')}</th>
                                                                    }

                                                                    <th className="text-center" style={{ width: '350px' }}>{i18n.t('static.common.status')}</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                {
                                                                    this.state.shipmentList.map((item, idx) =>
                                                                        <tr id="addr0" key={idx} >
                                                                            <td>{moment(this.state.shipmentList[idx].transDate, 'YYYY-MM-dd').format('MMM YYYY')}</td>
                                                                            <td>{getLabelText(this.state.shipmentList[idx].country.label, this.state.lang)}</td>
                                                                            <td>{this.state.shipmentList[idx].amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                                            <td>{getLabelText(this.state.shipmentList[idx].fundingSourceProcurementAgent.label, this.state.lang)}</td>
                                                                            <td>{getLabelText(this.state.shipmentList[idx].shipmentStatus.label, this.state.lang)}</td>
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

export default ShipmentGlobalView;
