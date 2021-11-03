import React, { Component, lazy, Suspense, DatePicker } from 'react';
import { Bar, Pie, HorizontalBar } from 'react-chartjs-2';
import FundingSourceService from '../../api/FundingSourceService';
import BudgetService from '../../api/BudgetService';
import { Link } from 'react-router-dom';
import { Online, Offline } from "react-detect-offline";
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
import { SECRET_KEY, DATE_FORMAT_CAP, JEXCEL_DATE_FORMAT, INDEXED_DB_NAME, INDEXED_DB_VERSION, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, ON_HOLD_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS, CANCELLED_SHIPMENT_STATUS, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_WITHOUT_DATE, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH } from '../../Constants.js'
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
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
import MultiSelect from 'react-multi-select-component';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import { filter } from 'jszip';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { red } from '@material-ui/core/colors';

// const { getToggledOptions } = utils;
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')
const colors = ['#004876', '#0063a0', '#007ecc', '#0093ee', '#82caf8', '#c8e6f4'];

const options = {
    title: {
        display: true,
        text: "Shipments",
        fontColor: 'black'
    },
    scales: {
        xAxes: [{
            labelMaxWidth: 100,
            stacked: true,
            gridLines: {
                display: false
            },

            fontColor: 'black'
        }],
        yAxes: [{
            scaleLabel: {
                display: true,
                labelString: i18n.t('static.graph.costInUSD'),
                fontColor: 'black'
            },
            stacked: true,
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

const chartData = {
    labels: ["Jan 2020", "Feb 2020", "Mar 2020", "Apr 2020", "May 2020", "Jun 2020", "Jul 2020", "Aug 2020", "Sep 2020", "Oct 2020", "Nov 2020", "Dec 2020"],
    datasets: [
        {
            label: 'Received',
            data: [0, 3740000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#042e6a',
            borderWidth: 0,
        },

        {
            label: 'Ordered',
            data: [0, 0, 0, 0, 5610000, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#6a82a8',
            borderWidth: 0,
        },
        {
            label: 'Planned',
            data: [0, 0, 0, 0, 0, 7480000, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#dee7f8',
            borderWidth: 0
        }

    ]
};


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

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}


class ShipmentSummery extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            planningUnitValues: [],
            planningUnitLabels: [],
            sortType: 'asc',
            dropdownOpen: false,
            radioSelected: 2,
            realms: [],
            programs: [],
            offlinePrograms: [],
            versions: [],
            planningUnits: [],
            consumptions: [],
            offlineConsumptionList: [],
            offlinePlanningUnitList: [],
            productCategories: [],
            offlineProductCategoryList: [],
            show: false,
            data: {},
            shipmentDetailsFundingSourceList: [],
            shipmentDetailsList: [],
            shipmentDetailsMonthList: [],
            message: '',
            viewById: 1,
            // rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: true,
            programId: '',
            versionId: '',
            fundingSources: [],
            fundingSourceValues: [],
            fundingSourceLabels: [],

            budgets: [],
            budgetValues: [],
            budgetLabels: [],

            filteredBudgetList: []
        };
        this.formatLabel = this.formatLabel.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        this.getFundingSourceList = this.getFundingSourceList.bind(this);
        this.getBudgetList = this.getBudgetList.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.loaded = this.loaded.bind(this);
        this.selected = this.selected.bind(this);
    }


    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
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
    dateFormatter = value => {
        return moment(value).format('MMM YY')
    }
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    exportCSV() {

        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.version*') + '  :  ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        this.state.planningUnitLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        this.state.fundingSourceLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.budget.fundingsource') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        this.state.budgetLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.budgetHead.budget') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.display') + '  :  ' + document.getElementById("viewById").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')

        let viewById = this.state.viewById;


        var re;
        var A = [this.addDoubleQuoteToRowContent([(i18n.t('static.budget.fundingsource')).replaceAll(' ', '%20'), (i18n.t('static.report.orders')).replaceAll(' ', '%20'), (i18n.t('static.report.qtyBaseUnit')).replaceAll(' ', '%20'), (i18n.t('static.report.costUsd')).replaceAll(' ', '%20')])]

        this.state.shipmentDetailsFundingSourceList.map(ele => A.push(this.addDoubleQuoteToRowContent([(ele.fundingSource.code).replaceAll(' ', '%20'), ele.orderCount, ele.quantity, ele.cost])))

        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }


        csvRow.push('')
        csvRow.push('')
        csvRow.push('')

        var B = [this.addDoubleQuoteToRowContent([(i18n.t('static.report.qatPIDFID')).replaceAll(' ', '%20'), (i18n.t('static.report.planningUnit/ForecastingUnit')).replaceAll(' ', '%20'), (i18n.t('static.report.id')).replaceAll(' ', '%20'),
        i18n.t('static.supplyPlan.consideAsEmergencyOrder').replaceAll(' ', '%20'), i18n.t('static.report.erpOrder').replaceAll(' ', '%20'),
        i18n.t('static.report.localprocurement').replaceAll(' ', '%20'), i18n.t('static.report.orderNo').replaceAll(' ', '%20').replaceAll('#', '%23'),
        (i18n.t('static.report.procurementAgentName')).replaceAll(' ', '%20'),
        (i18n.t('static.budget.fundingsource')).replaceAll(' ', '%20'),
        (i18n.t('static.budgetHead.budget')).replaceAll(' ', '%20'),
        (i18n.t('static.common.status')).replaceAll(' ', '%20'), (i18n.t('static.report.qty')).replaceAll(' ', '%20'),
        (i18n.t('static.report.expectedReceiveddate')).replaceAll(' ', '%20'), (i18n.t('static.report.productCost')).replaceAll(' ', '%20'), (i18n.t('static.report.freightCost')).replaceAll(' ', '%20'),
        (i18n.t('static.report.totalCost')).replaceAll(' ', '%20'), (i18n.t('static.program.notes')).replaceAll(' ', '%20')])]


        re = this.state.shipmentDetailsList

        console.log('shipment detail length', re.length)
        for (var item = 0; item < re.length; item++) {
            //console.log(item,'===>',re[item])
            B.push(this.addDoubleQuoteToRowContent([re[item].planningUnit.id, (getLabelText(re[item].planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), re[item].shipmentId,
            // re[item].emergencyOrder == true ? i18n.t('static.supplyPlan.consideAsEmergencyOrder').replaceAll(' ', '%20') : '',
            re[item].emergencyOrder,
            // re[item].erpOrder == true ? i18n.t('static.report.erpOrder').replaceAll(' ', '%20') : '',
            re[item].erpOrder == true ? true : false,
            // re[item].localProcurement == true ? i18n.t('static.report.localprocurement').replaceAll(' ', '%20') : '',
            re[item].localProcurement,
            // re[item].orderNo != null ? re[item].orderNo : '', (re[item].procurementAgent.code).replaceAll(' ', '%20'),
            re[item].orderNo != null ? re[item].orderNo.toString().replaceAll(' ', '%20').replaceAll('#', '%23') : '',
            ((re[item].procurementAgent.code == null || re[item].procurementAgent.code == "") ? '' : (re[item].procurementAgent.code).replaceAll(' ', '%20')),
            ((re[item].fundingSource.code == null || re[item].fundingSource.code == "") ? '' : (re[item].fundingSource.code).replaceAll(' ', '%20')),
            // (re[item].fundingSource.code).replaceAll(' ', '%20'),
            ((re[item].budget.code == null || re[item].budget.code == "") ? '' : (re[item].budget.code).replaceAll(' ', '%20')),
            // (re[item].budget.code).replaceAll(' ', '%20'),
            (getLabelText(re[item].shipmentStatus.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
            viewById == 1 ? re[item].shipmentQty : (Number(re[item].shipmentQty) * re[item].multiplier).toFixed(2), (moment(re[item].expectedDeliveryDate).format(DATE_FORMAT_CAP).replaceAll(',', ' ')).replaceAll(' ', '%20'),
            Number(re[item].productCost).toFixed(2),
            Number(re[item].freightCost).toFixed(2),
            Number(re[item].totalCost).toFixed(2),
            ((re[item].notes != null && re[item].notes != '' && re[item].notes != "") ? re[item].notes.replaceAll('#', ' ').replaceAll(' ', '%20') : '')

            ]))
        }
        for (var i = 0; i < B.length; i++) {
            console.log(B[i])
            csvRow.push(B[i].join(","))
        }

        var csvString = csvRow.join("%0A")
        console.log(csvString)
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.report.shipmentDetailReport') + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to) + ".csv"
        document.body.appendChild(a)
        a.click()
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
                doc.text(i18n.t('static.report.shipmentDetailReport'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })

                    doc.text(i18n.t('static.report.version*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.common.display') + ' : ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                    var fundingSourceText = doc.splitTextToSize((i18n.t('static.budget.fundingsource') + ' : ' + this.state.fundingSourceLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 170, fundingSourceText)

                    var budgetText = doc.splitTextToSize((i18n.t('static.budgetHead.budget') + ' : ' + this.state.budgetLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 190, budgetText)

                    var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 210, planningText)



                }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);

        // const title = "Consumption Report";
        var canvas = document.getElementById("cool-canvas");
        //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 100;
        var aspectwidth1 = (width - h1);
        let startY = 210 + (this.state.planningUnitLabels.length * 3)
        doc.addImage(canvasImg, 'png', 50, startY, 750, 260, 'CANVAS');

        //Table1
        let content1 = {
            margin: { top: 80, bottom: 100 },
            startY: height,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 190, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 191.89 },
            },
            html: '#mytable1',

            didDrawCell: function (data) {
                if (data.column.index === 4 && data.cell.section === 'body') {
                    var td = data.cell.raw;
                    var img = td.getElementsByTagName('img')[0];
                    var dim = data.cell.height - data.cell.padding('vertical');
                    var textPos = data.cell.textPos;
                    doc.addImage(img.src, textPos.x, textPos.y, dim, dim);
                }
            }
        };
        doc.autoTable(content1);

        //Table2


        // let content2 = {
        //     margin: { top: 80, bottom: 100 },
        //     startY: doc.autoTableEndPosY() + 50,
        //     pageBreak: 'auto',
        //     styles: { lineWidth: 1, fontSize: 8, cellWidth: 46, halign: 'center' },
        //     columnStyles: {
        //         0: { cellWidth: 104.89 },
        //     },
        //     html: '#shipmentDetailsListTableDiv',

        //     didDrawCell: function (data) {
        //         if (data.column.index === 15 && data.cell.section === 'body') {
        //             var td = data.cell.raw;
        //             var img = td.getElementsByTagName('img')[0];
        //             var dim = data.cell.height - data.cell.padding('vertical');
        //             var textPos = data.cell.textPos;
        //             doc.addImage(img.src, textPos.x, textPos.y, dim, dim);
        //         }
        //     }
        // };

        let headerTable2 = []
        headerTable2.push(i18n.t('static.report.planningUnit/ForecastingUnit'));
        headerTable2.push(i18n.t('static.report.id'));
        headerTable2.push(i18n.t('static.supplyPlan.consideAsEmergencyOrder'));
        headerTable2.push(i18n.t('static.report.erpOrder'));
        headerTable2.push(i18n.t('static.report.localprocurement'));
        headerTable2.push(i18n.t('static.report.orderNo'));
        headerTable2.push(i18n.t('static.report.procurementAgentName'));
        headerTable2.push(i18n.t('static.budget.fundingsource'));
        headerTable2.push(i18n.t('static.dashboard.budget'));
        headerTable2.push(i18n.t('static.common.status'));
        headerTable2.push(i18n.t('static.report.qty'));
        headerTable2.push(i18n.t('static.report.expectedReceiveddate'));
        headerTable2.push(i18n.t('static.report.productCost'));
        headerTable2.push(i18n.t('static.report.freightCost'));
        headerTable2.push(i18n.t('static.report.totalCost'));
        headerTable2.push(i18n.t('static.program.notes'));

        let data;
        data = this.state.shipmentDetailsList.map(
            ele => [
                getLabelText(ele.planningUnit.label, this.state.lang),
                ele.shipmentId,
                ele.emergencyOrder,
                ele.erpOrder == true ? true : false,
                ele.localProcurement,
                ele.orderNo != null ? ele.orderNo : '',
                ele.procurementAgent.code,
                ele.fundingSource.code,
                ele.budget.code,
                getLabelText(ele.shipmentStatus.label, this.state.lang),
                this.state.viewById == 1 ? (this.formatter(ele.shipmentQty)) : (this.formatter(Number(ele.shipmentQty) * ele.multiplier)),
                moment(ele.expectedDeliveryDate).format('YYYY-MM-DD'),
                ele.productCost.toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
                ele.freightCost.toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
                ele.totalCost.toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
                ele.notes
            ]);

        // var startYTable2 = 180 + (this.state.planningUnitValues.length * 3)
        let contentTable2 = {
            margin: { top: 80, bottom: 100 },
            startY: 200,
            pageBreak: 'auto',
            head: [headerTable2],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 100 },
                15: { cellWidth: 110 },
            },
        };
        doc.autoTable(contentTable2);

        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.report.shipmentDetailReport') + ".pdf")
        //creates PDF from img
        /* var doc = new jsPDF('landscape');
        doc.setFontSize(20);
        doc.text(15, 15, "Cool Chart");
        doc.save('canvas.pdf');*/
    }

    getFundingSourceList() {
        const { fundingSources } = this.state
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            FundingSourceService.getFundingSourceListAll()
                .then(response => {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.fundingSourceCode.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.fundingSourceCode.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        fundingSources: listArray
                    })
                }).catch(
                    error => {
                        this.setState({
                            fundingSources: []
                        })
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.fundingsource.fundingsource') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else {
            var db3;
            var fSourceResult = [];
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                db3 = e.target.result;
                var fSourceTransaction = db3.transaction(['fundingSource'], 'readwrite');
                var fSourceOs = fSourceTransaction.objectStore('fundingSource');
                var fSourceRequest = fSourceOs.getAll();
                fSourceRequest.onerror = function (event) {
                    //handel error
                }.bind(this);
                fSourceRequest.onsuccess = function (event) {

                    fSourceResult = fSourceRequest.result;
                    console.log("funding source list offline--->", fSourceResult);
                    this.setState({
                        fundingSources: fSourceResult.sort(function (a, b) {
                            a = a.fundingSourceCode.toLowerCase();
                            b = b.fundingSourceCode.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        })
                    });

                }.bind(this)

            }.bind(this)


        }

    }

    getBudgetList() {
        const { budgets } = this.state
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            BudgetService.getBudgetList()
                .then(response => {
                    var listArray = response.data.filter(b => b.program.id == this.state.programId);
                    listArray.sort((a, b) => {
                        var itemLabelA = a.budgetCode.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.budgetCode.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    var budgetValuesFromProps = [];
                    var budgetLabelsFromProps = [];
                    if (this.props.match.params.budgetId != '' && this.props.match.params.budgetId != undefined) {
                        budgetValuesFromProps.push({
                            label: this.props.match.params.budgetCode,
                            value: parseInt(this.props.match.params.budgetId),
                        });
                        budgetLabelsFromProps.push(this.props.match.params.budgetCode);
                    }
                    console.log("budgetValuesFromProps online===>", budgetValuesFromProps);
                    this.setState({
                        budgetValues: budgetValuesFromProps,
                        budgetLabels: budgetLabelsFromProps,
                        budgets: listArray,
                        filteredBudgetList: listArray
                    })
                }).catch(
                    error => {
                        this.setState({
                            budgets: []
                        })
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.fundingsource.fundingsource') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else {
            var db3;
            var fSourceResult = [];
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                db3 = e.target.result;
                var fSourceTransaction = db3.transaction(['budget'], 'readwrite');
                var fSourceOs = fSourceTransaction.objectStore('budget');
                var fSourceRequest = fSourceOs.getAll();
                fSourceRequest.onerror = function (event) {
                    //handel error
                }.bind(this);
                fSourceRequest.onsuccess = function (event) {

                    var budgetValuesFromProps = [];
                    var budgetLabelsFromProps = [];
                    if (this.props.match.params.budgetId != '' && this.props.match.params.budgetId != undefined) {
                        budgetValuesFromProps.push({
                            label: this.props.match.params.budgetCode,
                            value: parseInt(this.props.match.params.budgetId),
                        });
                        budgetLabelsFromProps.push(this.props.match.params.budgetCode);
                    }
                    console.log("budgetValuesFromProps offline===>", budgetValuesFromProps);

                    fSourceResult = fSourceRequest.result.filter(b => b.program.id == this.state.programId);
                    console.log("budget list offline--->", fSourceResult);
                    this.setState({
                        budgetValues: budgetValuesFromProps,
                        budgetLabels: budgetLabelsFromProps,
                        budgets: fSourceResult.sort(function (a, b) {
                            a = a.budgetCode.toLowerCase();
                            b = b.budgetCode.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        filteredBudgetList: fSourceResult.sort(function (a, b) {
                            a = a.budgetCode.toLowerCase();
                            b = b.budgetCode.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        })
                    });

                }.bind(this)

            }.bind(this)
        }

    }

    handleFundingSourceChange = (fundingSourceIds) => {
        console.log("fundingSourceIds+++", fundingSourceIds);
        fundingSourceIds = fundingSourceIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        var fundingSourceIdsArray = [];
        fundingSourceIds.map(fm => {
            fundingSourceIdsArray.push(parseInt(fm.value));
        });
        var budgetList = fundingSourceIdsArray.length > 0 ? this.state.budgets.filter(b => fundingSourceIdsArray.includes(parseInt(b.fundingSource.fundingSourceId))) : this.state.budgets;
        console.log("budgetListFiltered+++", budgetList);
        this.setState({
            budgetValues: [],
            budgetLabels: [],
            fundingSourceValues: fundingSourceIds.map(ele => ele),
            fundingSourceLabels: fundingSourceIds.map(ele => ele.label),
            filteredBudgetList: budgetList
        }, () => {
            this.fetchData()
        })
    }

    handleBudgetChange = (budgetIds) => {
        console.log("budgetIds", budgetIds);
        budgetIds = budgetIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            budgetValues: budgetIds.map(ele => ele),
            budgetLabels: budgetIds.map(ele => ele.label)
        }, () => {
            this.fetchData()
        })
    }

    buildJExcel() {

        let shipmentDetailsList = this.state.shipmentDetailsList;
        let shipmentDetailsListArray = [];
        let count = 0;
        for (var j = 0; j < shipmentDetailsList.length; j++) {
            data = [];
            data[0] = getLabelText(shipmentDetailsList[j].planningUnit.label, this.state.lang)
            data[1] = shipmentDetailsList[j].shipmentId
            // data[2] = shipmentDetailsList[j].emergencyOrder == true ? i18n.t('static.supplyPlan.consideAsEmergencyOrder') : ''
            data[2] = shipmentDetailsList[j].emergencyOrder;
            // data[3] = shipmentDetailsList[j].erpOrder == true ? i18n.t('static.report.erpOrder') : '';
            data[3] = shipmentDetailsList[j].erpFlag;
            // data[4] = shipmentDetailsList[j].localProcurement == true ? i18n.t('static.report.localprocurement') : '';
            data[4] = shipmentDetailsList[j].localProcurement;
            data[5] = shipmentDetailsList[j].orderNo != null ? shipmentDetailsList[j].orderNo : '';
            data[6] = shipmentDetailsList[j].procurementAgent.code;
            data[7] = shipmentDetailsList[j].fundingSource.code;
            data[8] = shipmentDetailsList[j].budget.code;
            data[9] = getLabelText(shipmentDetailsList[j].shipmentStatus.label, this.state.lang);
            data[10] = this.state.viewById == 1 ? (shipmentDetailsList[j].shipmentQty) : (Number(shipmentDetailsList[j].shipmentQty) * shipmentDetailsList[j].multiplier);
            data[11] = moment(shipmentDetailsList[j].expectedDeliveryDate).format('YYYY-MM-DD');
            data[12] = shipmentDetailsList[j].productCost.toFixed(2);
            data[13] = shipmentDetailsList[j].freightCost.toFixed(2);
            data[14] = shipmentDetailsList[j].totalCost.toFixed(2);
            data[15] = shipmentDetailsList[j].notes;
            data[16] = shipmentDetailsList[j].planningUnit.id;

            shipmentDetailsListArray[count] = data;
            count++;
        }

        this.el = jexcel(document.getElementById("shipmentDetailsListTableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = shipmentDetailsListArray;
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.report.planningUnit/ForecastingUnit'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.report.id'),
                    type: 'numeric',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.supplyPlan.consideAsEmergencyOrder'),
                    type: 'hidden',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.report.erpOrder'),
                    type: 'checkbox',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.localprocurement'),
                    type: 'checkbox',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.orderNo'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.report.procurementAgentName'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.budget.fundingsource'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.dashboard.budget'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.common.status'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.report.qty'),
                    type: 'numeric',
                    mask: '#,##.00',
                    decimal: '.',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.report.expectedReceiveddate'),
                    type: 'calendar',
                    // readOnly: true
                    options: {
                        format: JEXCEL_DATE_FORMAT,
                    }
                },
                {
                    title: i18n.t('static.report.productCost'),
                    type: 'numeric',
                    mask: '#,##.00',
                    decimal: '.',
                    // readOnly: true
                },
                {
                    type: 'numeric',
                    mask: '#,##.00',
                    decimal: '.',
                    title: i18n.t('static.report.freightCost'),
                    // readOnly: true
                },
                {
                    title: i18n.t('static.report.totalCost'),
                    type: 'numeric',
                    mask: '#,##.00',
                    decimal: '.',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: 'Planning Unit Id',
                    type: 'hidden',
                    // readOnly: true
                },

            ],
            editable: false,
            license: JEXCEL_PRO_KEY,
            filters: true,
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            // oneditionend: this.onedit,
            // columnResize:true,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            contextMenu: function (obj, x, y, e) {
                return [];
            }.bind(this),
        };
        var shipmentDetailsEl = jexcel(document.getElementById("shipmentDetailsListTableDiv"), options);
        this.el = shipmentDetailsEl;
        this.setState({
            shipmentDetailsEl: shipmentDetailsEl, loading: false
        })
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var elInstance = instance.jexcel;
        var json = elInstance.getJson();
        for (var j = 0; j < json.length; j++) {
            var colArr = ['A', 'B', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']
            var rowData = elInstance.getRowData(j);
            var emergencyOrder = rowData[2];
            if (emergencyOrder) {
                // console.log("hi*** there")
                for (var i = 0; i < colArr.length; i++) {
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'color', '#FF0000');
                }
            }
        }
    }

    selected = function (instance, cell, x, y, value) {
        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            // if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROBLEM')) {
            let versionId = document.getElementById("versionId").value;
            let programId = document.getElementById("programId").value;
            let userId = AuthenticationService.getLoggedInUserId();

            if (versionId.includes('Local')) {
                var planningUnitId = this.el.getValueFromCoords(16, x);
                var rangeValue = this.state.rangeValue;
                var programIdd = programId + '_v' + versionId.split(' ')[0] + '_uId_' + userId;
                console.log("proId***", programIdd);
                console.log("p***", planningUnitId);
                console.log("rangeVlaue***", this.state.rangeValue);
                localStorage.setItem('sesRangeValue', JSON.stringify(rangeValue));
                window.open(window.location.origin + `/#/shipment/shipmentDetails/${programIdd}/${versionId}/${planningUnitId}`);
            }
            // }
        }
    }
    getPrograms = () => {
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramList()
                .then(response => {
                    // console.log(JSON.stringify(response.data))
                    this.setState({
                        programs: response.data, loading: false
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: [], loading: false
                        }, () => { this.consolidatedProgramList() })
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
            //             programs: [], loading: false
            //         }, () => { this.consolidatedProgramList() })
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
            this.setState({ loading: false })
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
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                        // console.log(programNameLabel)

                        var f = 0
                        for (var k = 0; k < this.state.programs.length; k++) {
                            if (this.state.programs[k].programId == programData.programId) {
                                f = 1;
                                console.log('already exist')
                            }
                        }
                        if (f == 0) {
                            proList.push(programData)
                        }
                    }


                }
                var lang = this.state.lang;

                if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = getLabelText(a.label, lang).toLowerCase();
                            b = getLabelText(b.label, lang).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        programId: localStorage.getItem("sesProgramIdReport")
                    }, () => {
                        this.filterVersion();
                        this.getBudgetList();
                    })
                } else {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = getLabelText(a.label, lang).toLowerCase();
                            b = getLabelText(b.label, lang).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                    })
                }


            }.bind(this);

        }.bind(this);

    }

    filterVersion = () => {
        // let programId = document.getElementById("programId").value;
        let programId = this.state.programId;
        if (programId != 0) {

            localStorage.setItem("sesProgramIdReport", programId);
            const program = this.state.programs.filter(c => c.programId == programId)
            // console.log(program)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    this.setState({
                        versions: [],
                        planningUnits: [],
                        planningUnitValues: []

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
                versions: [],
                planningUnits: [],
                planningUnitValues: []
            })
        }
        this.fetchData();
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
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
                        var programData = databytes.toString(CryptoJS.enc.Utf8)
                        var version = JSON.parse(programData).currentVersion

                        version.versionId = `${version.versionId} (Local)`
                        verList.push(version)

                    }


                }

                // console.log(verList)
                let versionList = verList.filter(function (x, i, a) {
                    return a.indexOf(x) === i;
                })

                versionList.reverse();

                if (localStorage.getItem("sesVersionIdReport") != '' && localStorage.getItem("sesVersionIdReport") != undefined) {
                    let versionVar = versionList.filter(c => c.versionId == localStorage.getItem("sesVersionIdReport"));
                    if (versionVar != '' && versionVar != undefined) {
                        this.setState({
                            versions: versionList,
                            versionId: localStorage.getItem("sesVersionIdReport")
                        }, () => {
                            this.getPlanningUnit();
                        })
                    } else {
                        this.setState({
                            versions: versionList,
                            versionId: versionList[0].versionId
                        }, () => {
                            this.getPlanningUnit();
                        })
                    }
                } else {
                    this.setState({
                        versions: versionList,
                        versionId: versionList[0].versionId
                    }, () => {
                        this.getPlanningUnit();
                    })
                }

            }.bind(this);



        }.bind(this)


    }

    getPlanningUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: []
        }, () => {
            if (versionId == 0) {
                this.setState({
                    message: i18n.t('static.program.validversion'), data: [],
                    shipmentDetailsList: [],
                    shipmentDetailsFundingSourceList: [],
                    shipmentDetailsMonthList: []
                });
            } else {
                localStorage.setItem("sesVersionIdReport", versionId);
                if (versionId.includes('Local')) {
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
                            var lang = this.state.lang;
                            this.setState({
                                planningUnits: proList.sort(function (a, b) {
                                    a = getLabelText(a.planningUnit.label, lang).toLowerCase();
                                    b = getLabelText(b.planningUnit.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }), message: ''
                            }, () => {
                                this.fetchData();
                            })
                        }.bind(this);
                    }.bind(this)


                }
                else {
                    // AuthenticationService.setupAxiosInterceptors();

                    //let productCategoryId = document.getElementById("productCategoryId").value;
                    ProgramService.getActiveProgramPlaningUnitListByProgramId(programId).then(response => {
                        // console.log('**' + JSON.stringify(response.data))
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            planningUnits: listArray, message: ''
                        }, () => {
                            this.fetchData();
                        })
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
                                            message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
                                            loading: false
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
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
                    //                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }) });
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
        });

    }

    handlePlanningUnitChange = (planningUnitIds) => {
        planningUnitIds = planningUnitIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            planningUnitValues: planningUnitIds.map(ele => ele),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })
    }


    componentDidMount() {
        this.getPrograms();
        this.getFundingSourceList();
        // this.getBudgetList();
    }

    setProgramId(event) {
        this.setState({
            programId: event.target.value,
            versionId: ''
        }, () => {
            localStorage.setItem("sesVersionIdReport", '');
            this.filterVersion();
            this.getBudgetList();
        })
    }

    setVersionId(event) {
        // this.setState({
        //     versionId: event.target.value
        // }, () => {
        //     if ((this.state.shipmentDetailsList.length != 0 && this.state.shipmentDetailsFundingSourceList.length != 0 && this.state.shipmentDetailsMonthList.length != 0)) {
        //         localStorage.setItem("sesVersionIdReport", this.state.versionId);
        //         this.fetchData();
        //     } else {
        //         this.getPlanningUnit();
        //     }
        // })
        if (this.state.versionId != '' || this.state.versionId != undefined) {
            this.setState({
                versionId: event.target.value
            }, () => {
                localStorage.setItem("sesVersionIdReport", this.state.versionId);
                this.fetchData();
            })
        } else {
            this.setState({
                versionId: event.target.value
            }, () => {
                this.getPlanningUnit();
            })
        }
    }

    fetchData = () => {
        let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;
        let viewById = document.getElementById("viewById").value;

        let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value));
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + String(this.state.rangeValue.to.month).padStart(2, '0') + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();

        let myFundingSourceIds = this.state.fundingSourceValues.length == this.state.fundingSources.length ? [] : this.state.fundingSourceValues.map(ele => (ele.value));
        let myBudgetIds = this.state.budgetValues.length == this.state.budgets.length ? [] : this.state.budgetValues.map(ele => (ele.value));


        console.log("versionId++++", versionId);
        console.log("programId++++", programId);
        console.log("planningUnitIds++++", planningUnitIds);
        console.log("fundingSourceIds++++", myFundingSourceIds);
        console.log("budgetIds++++", myBudgetIds);


        if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0) {

            if (versionId.includes('Local')) {

                this.setState({ loading: true })
                //////////////////------------------------table two content

                planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value));
                console.log("planninuit ids====>", planningUnitIds);

                myFundingSourceIds = this.state.fundingSourceValues.map(ele => (ele.value));
                console.log("fundingSource ids====>", myFundingSourceIds);

                myBudgetIds = this.state.budgetValues.map(ele => (ele.value));
                console.log("budget ids====>", myBudgetIds);

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
                        // console.log("2----", programRequest)
                        // var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        // var programJson = JSON.parse(programData);
                        var planningUnitDataList = programRequest.result.programData.planningUnitDataList;


                        let data = [];
                        let planningUnitFilter = [];
                        for (let i = 0; i < planningUnitIds.length; i++) {

                            var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == planningUnitIds[i]);
                            var programJson = {}
                            if (planningUnitDataIndex != -1) {
                                var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == planningUnitIds[i]))[0];
                                var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                programJson = JSON.parse(programData);
                            } else {
                                programJson = {
                                    consumptionList: [],
                                    inventoryList: [],
                                    shipmentList: [],
                                    batchInfoList: [],
                                    supplyPlan: []
                                }
                            }

                            var shipmentList = (programJson.shipmentList);


                            console.log("shipmentList------>", shipmentList);
                            const activeFilter = shipmentList.filter(c => (c.active == true || c.active == "true") && (c.accountFlag == true || c.accountFlag == "true") && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS);
                            // const activeFilter = shipmentList;
                            console.log(startDate, endDate)
                            // let dateFilter = activeFilter.filter(c => moment(c.deliveredDate).isBetween(startDate, endDate, null, '[)'))
                            let dateFilter = activeFilter.filter(c => (c.receivedDate == null || c.receivedDate === '') ? (c.expectedDeliveryDate >= moment(startDate).format('YYYY-MM-DD') && c.expectedDeliveryDate <= moment(endDate).format('YYYY-MM-DD')) : (c.receivedDate >= moment(startDate).format('YYYY-MM-DD') && c.receivedDate <= moment(endDate).format('YYYY-MM-DD')))
                            console.log('dateFilter', dateFilter)

                            for (let j = 0; j < dateFilter.length; j++) {
                                if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
                                    planningUnitFilter.push(dateFilter[j]);
                                }
                            }
                        }
                        console.log('planningUnitFilter', planningUnitFilter)
                        var planningunitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                        var planningunitOs = planningunitTransaction.objectStore('planningUnit');
                        var planningunitRequest = planningunitOs.getAll();
                        var planningList = [];

                        planningunitRequest.onerror = function (event) {
                            // Handle errors!
                            this.setState({
                                loading: false
                            })
                        };


                        planningunitRequest.onsuccess = function (e) {
                            var myResult = [];
                            myResult = planningunitRequest.result;
                            for (var k = 0; k < myResult.length; k++) {
                                var planningUnitObj = {
                                    id: myResult[k].planningUnitId,
                                    multiplier: myResult[k].multiplier,
                                    label: myResult[k].label,
                                    forecastingUnit: myResult[k].forecastingUnit
                                }
                                planningList[k] = planningUnitObj
                            }
                            var paTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                            var paOs = paTransaction.objectStore('procurementAgent');
                            var paRequest = paOs.getAll();
                            var procurementAgentList = [];

                            paRequest.onerror = function (event) {
                                // Handle errors!
                                this.setState({
                                    loading: false
                                })
                            };


                            paRequest.onsuccess = function (e) {
                                var paResult = [];
                                paResult = paRequest.result;

                                var bTransaction = db1.transaction(['budget'], 'readwrite');
                                var bOs = bTransaction.objectStore('budget');
                                var bRequest = bOs.getAll();

                                bRequest.onerror = function (event) {
                                    // Handle errors!
                                    this.setState({
                                        loading: false
                                    })
                                };


                                bRequest.onsuccess = function (e) {
                                    var bResult = [];
                                    bResult = bRequest.result;
                                    console.log("planningList------>", planningList);

                                    for (let i = 0; i < planningUnitFilter.length; i++) {
                                        let multiplier = 0;
                                        for (let j = 0; j < planningList.length; j++) {
                                            if (planningUnitFilter[i].planningUnit.id == planningList[j].id) {
                                                multiplier = planningList[j].multiplier;
                                                j = planningList.length;
                                            }
                                        }
                                        var planningUnit = planningList.filter(c => c.id == planningUnitFilter[i].planningUnit.id);
                                        var procurementAgent = paResult.filter(c => c.procurementAgentId == planningUnitFilter[i].procurementAgent.id);
                                        if (procurementAgent.length > 0) {
                                            var simplePAObject = {
                                                id: procurementAgent[0].procurementAgentId,
                                                label: procurementAgent[0].label,
                                                code: procurementAgent[0].procurementAgentCode
                                            }
                                        }
                                        var fundingSource = this.state.fundingSources.filter(c => c.fundingSourceId == planningUnitFilter[i].fundingSource.id);
                                        if (fundingSource.length > 0) {
                                            var simpleFSObject = {
                                                id: fundingSource[0].fundingSourceId,
                                                label: fundingSource[0].label,
                                                code: fundingSource[0].fundingSourceCode
                                            }
                                        }
                                        var budget = [];
                                        if (planningUnitFilter[i].budget.id > 0) {
                                            var budget = bResult.filter(c => c.budgetId == planningUnitFilter[i].budget.id);
                                            if (budget.length > 0) {
                                                var simpleBObject = {
                                                    id: budget[0].budgetId,
                                                    label: budget[0].label,
                                                    code: budget[0].budgetCode
                                                }
                                            }
                                        }
                                        let json = {
                                            "shipmentId": planningUnitFilter[i].shipmentId,
                                            "planningUnit": planningUnit.length > 0 ? planningUnit[0] : planningUnitFilter[i].planningUnit,
                                            "forecastingUnit": planningUnit.length > 0 ? planningUnit[0].forecastingUnit : planningUnitFilter[i].planningUnit.forecastingUnit,
                                            "multiplier": multiplier,
                                            "procurementAgent": procurementAgent.length > 0 ? simplePAObject : planningUnitFilter[i].procurementAgent,
                                            "fundingSource": fundingSource.length > 0 ? simpleFSObject : planningUnitFilter[i].fundingSource,
                                            "shipmentStatus": planningUnitFilter[i].shipmentStatus,
                                            "shipmentQty": planningUnitFilter[i].shipmentQty,
                                            "expectedDeliveryDate": planningUnitFilter[i].receivedDate == null || planningUnitFilter[i].receivedDate == '' ? planningUnitFilter[i].expectedDeliveryDate : planningUnitFilter[i].receivedDate,
                                            "productCost": planningUnitFilter[i].productCost * planningUnitFilter[i].currency.conversionRateToUsd,
                                            "freightCost": planningUnitFilter[i].freightCost * planningUnitFilter[i].currency.conversionRateToUsd,
                                            "totalCost": (planningUnitFilter[i].productCost * planningUnitFilter[i].currency.conversionRateToUsd) + (planningUnitFilter[i].freightCost * planningUnitFilter[i].currency.conversionRateToUsd),
                                            "notes": planningUnitFilter[i].notes,
                                            "emergencyOrder": planningUnitFilter[i].emergencyOrder,
                                            "erpFlag": planningUnitFilter[i].erpFlag,
                                            "localProcurement": planningUnitFilter[i].localProcurement,
                                            "orderNo": planningUnitFilter[i].orderNo,
                                            "budget": budget.length > 0 ? simpleBObject : planningUnitFilter[i].budget,
                                            // took program code in josn just for shipmnet details screen when local version is selected by user and user what to naviget to shipment datat entry screen
                                            // "programCode": programJson.programCode
                                        }
                                        data.push(json);
                                    }

                                    data = myFundingSourceIds.length > 0 ? data.filter(f => myFundingSourceIds.includes(f.fundingSource.id)) : data;
                                    data = myBudgetIds.length > 0 ? data.filter(b => myBudgetIds.includes(b.budget.id)) : data;

                                    data = data.sort(function (a, b) {
                                        return parseInt(a.shipmentId) - parseInt(b.shipmentId);
                                    })

                                    console.log("data***", data);
                                    ///////////--------------------------- table one content
                                    var shipmentDetailsFundingSourceList = []
                                    const fundingSourceIds = [...new Set(data.map(q => parseInt(q.fundingSource.id)))];
                                    console.log('fundingSourceIds', fundingSourceIds)
                                    fundingSourceIds.map(ele => {
                                        var fundingSource = this.state.fundingSources.filter(c => c.fundingSourceId == ele);
                                        if (fundingSource.length > 0) {
                                            var simpleFSObject = {
                                                id: fundingSource[0].fundingSourceId,
                                                label: fundingSource[0].label,
                                                code: fundingSource[0].fundingSourceCode
                                            }
                                        }
                                        var fundingSourceList = data.filter(c => c.fundingSource.id == ele)
                                        console.log('fundingSourceList', fundingSourceList)
                                        var cost = 0;
                                        var quantity = 0;
                                        console.log('fundingSourceList', fundingSourceList)
                                        fundingSourceList.map(c => {
                                            cost = cost + Number(c.productCost) + Number(c.freightCost)
                                            quantity = quantity + (viewById == 1 ? Number(c.shipmentQty) : (Number(c.shipmentQty) * c.multiplier))
                                        })
                                        var json = {
                                            "fundingSource": fundingSource.length > 0 ? simpleFSObject : fundingSourceList[0].fundingSource,
                                            "orderCount": fundingSourceList.length,
                                            "cost": cost,
                                            "quantity": quantity
                                        }
                                        shipmentDetailsFundingSourceList.push(json)
                                    })
                                    console.log("data ofline----->", data);
                                    console.log("shipmentDetailsFundingSourceList ofline----->", shipmentDetailsFundingSourceList);

                                    var shipmentDetailsMonthList = [];
                                    var monthstartfrom = this.state.rangeValue.from.month
                                    for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
                                        var monthlydata = [];
                                        console.log(programJson)
                                        for (var month = monthstartfrom; month <= 12; month++) {
                                            var dtstr = from + "-" + String(month).padStart(2, '0') + "-01"
                                            var enddtStr = from + "-" + String(month).padStart(2, '0') + '-' + new Date(from, month, 0).getDate()
                                            console.log(dtstr, ' ', enddtStr)
                                            var dt = dtstr
                                            var shiplist = planningUnitFilter.filter(c => c.receivedDate == null || c.receivedDate == "" ? (c.expectedDeliveryDate >= dt && c.expectedDeliveryDate <= enddtStr) : (c.receivedDate >= dt && c.receivedDate <= enddtStr))

                                            shiplist = myFundingSourceIds.length > 0 ? shiplist.filter(f => myFundingSourceIds.includes(f.fundingSource.id)) : shiplist;
                                            shiplist = myBudgetIds.length > 0 ? shiplist.filter(b => myBudgetIds.includes(b.budget.id)) : shiplist;
                                            console.log("shipList***", shiplist);

                                            var onholdCost = 0
                                            var plannedCost = 0
                                            var receivedCost = 0
                                            var shippedCost = 0
                                            var submittedCost = 0
                                            var approvedCost = 0
                                            var arrivedCost = 0
                                            var submittedCost = 0
                                            shiplist.map(ele => {
                                                console.log(ele)
                                                if (ele.shipmentStatus.id == PLANNED_SHIPMENT_STATUS) {
                                                    plannedCost = plannedCost + (ele.productCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                                } else if (ele.shipmentStatus.id == DRAFT_SHIPMENT_STATUS) {
                                                    //  plannedCost=plannedCost+(ele.sortproductCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                                } else if (ele.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                                    submittedCost = submittedCost + (ele.productCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                                } else if (ele.shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                                    approvedCost = approvedCost + (ele.productCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                                } else if (ele.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS) {
                                                    shippedCost = shippedCost + (ele.productCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                                } else if (ele.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                                    arrivedCost = arrivedCost + (ele.productCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                                } else if (ele.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                                    receivedCost = receivedCost + (ele.productCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                                } else if (ele.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                                                    onholdCost = onholdCost + (ele.productCost * ele.currency.conversionRateToUsd) + (ele.freightCost * ele.currency.conversionRateToUsd)
                                                }
                                            })

                                            let json = {
                                                "dt": new Date(from, month - 1),
                                                "approvedCost": approvedCost,
                                                "arrivedCost": arrivedCost,
                                                "onholdCost": onholdCost,
                                                "plannedCost": plannedCost,
                                                "receivedCost": receivedCost,
                                                "shippedCost": shippedCost,
                                                "submittedCost": submittedCost
                                            }
                                            shipmentDetailsMonthList.push(json)
                                            if (month == this.state.rangeValue.to.month && from == to) {
                                                console.log('shipmentDetailsMonthList', shipmentDetailsMonthList)
                                                this.setState({
                                                    shipmentDetailsList: data,
                                                    shipmentDetailsFundingSourceList: shipmentDetailsFundingSourceList,
                                                    shipmentDetailsMonthList: shipmentDetailsMonthList,
                                                    message: '',
                                                    viewById: viewById, loading: false
                                                }, () => {
                                                    this.buildJExcel();
                                                })
                                                return;
                                            }

                                        }
                                        monthstartfrom = 1

                                    }


                                }.bind(this)
                            }.bind(this);
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            } else {
                this.setState({ loading: true })
                var inputjson = {
                    programId: programId,
                    versionId: versionId,
                    startDate: startDate,
                    stopDate: endDate,
                    planningUnitIds: planningUnitIds,
                    fundingSourceIds: myFundingSourceIds,
                    budgetIds: myBudgetIds,
                    reportView: viewById
                }

                // console.log("inputJson---->", inputjson);
                ReportService.ShipmentSummery(inputjson)
                    .then(response => {

                        console.log("RESP-------->", response.data);
                        this.setState({
                            data: response.data,
                            shipmentDetailsFundingSourceList: response.data.shipmentDetailsFundingSourceList,
                            shipmentDetailsList: response.data.shipmentDetailsList,
                            shipmentDetailsMonthList: response.data.shipmentDetailsMonthList,
                            viewById: viewById,
                            message: '',
                            loading: false
                        }, () => {
                            this.buildJExcel();
                        }
                        )
                    }).catch(
                        error => {
                            this.setState({
                                data: [], loading: false
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
                                            message: i18n.t(error.response.data.messageCode),
                                            loading: false
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: i18n.t(error.response.data.messageCode),
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
                //             data: [], loading: false
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
                //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode) });
                //                     break;
                //                 default:
                //                     this.setState({ message: 'static.unkownError', loading: false });
                //                     break;
                //             }
                //         }
                //     }
                // );


            }
        } else if (programId == 0) {
            this.setState(
                { message: i18n.t('static.common.selectProgram'), data: [], shipmentDetailsList: [], shipmentDetailsFundingSourceList: [], shipmentDetailsMonthList: [] }, () => {
                    this.el = jexcel(document.getElementById("shipmentDetailsListTableDiv"), '');
                    this.el.destroy();
                });

        } else if (versionId == 0) {
            this.setState({ message: i18n.t('static.program.validversion'), data: [], shipmentDetailsList: [], shipmentDetailsFundingSourceList: [], shipmentDetailsMonthList: [] }, () => {
                this.el = jexcel(document.getElementById("shipmentDetailsListTableDiv"), '');
                this.el.destroy();
            });

        } else if (this.state.planningUnitValues.length == 0) {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [], shipmentDetailsList: [], shipmentDetailsFundingSourceList: [], shipmentDetailsMonthList: [] }, () => {
                this.el = jexcel(document.getElementById("shipmentDetailsListTableDiv"), '');
                this.el.destroy();

            });
        }
    }


    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
        });
    }

    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.fetchData();
        })

    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
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
        const { programs } = this.state

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)}
                    </option>
                )
            }, this);

        const { planningUnits } = this.state
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);

        const { fundingSources } = this.state;
        const { filteredBudgetList } = this.state;
        const { rangeValue } = this.state;
        var viewById = this.state.viewById;

        const backgroundColor = [
            '#002f6c',
            '#20a8d8',
            '#118b70',
            '#EDB944',
            '#d1e3f5',
        ]
        /*
                //Graph start
                let shipmentStatus = [...new Set(this.state.data.map(ele => (getLabelText(ele.shipmentStatus.label, this.state.lang))))];
                console.log("shipmentStatus=======>>>", shipmentStatus.sort());
                shipmentStatus=shipmentStatus.sort()
                let shipmentSummerydata = [];
                let data = [];
                var mainData = this.state.data;
                mainData = mainData.sort(function (a, b) {
                    return new Date(a.expectedDeliveryDate) - new Date(b.expectedDeliveryDate);
                });
                console.log("mainData=======>>>>", mainData);
                let dateArray = [...new Set(mainData.map(ele => (moment(ele.expectedDeliveryDate, 'YYYY-MM-dd').format('MM-YYYY'))))]
        
                console.log("dateArray=====>", dateArray);
        
                for (var i = 0; i < shipmentStatus.length; i++) {
        
                    let data1 = mainData.filter(c => shipmentStatus[i].localeCompare(getLabelText(c.shipmentStatus.label, this.state.lang)) == 0).map((item) => {
                        return {
                            shipmentId: item.shipmentId,
                            expectedDeliveryDate: (moment(item.expectedDeliveryDate, 'YYYY-MM-dd').format('MM-YYYY')),
                            totalCost: item.totalCost,
                            forecastCost: item.totalCost * item.multiplier
                        }
                    });
        
                    //logic for add same date data
                    // let result = Object.values(data1.reduce((a, { shipmentId, totalCost, expectedDeliveryDate, forecastCost }) => {
                    //     if (!a[expectedDeliveryDate])
                    //         a[expectedDeliveryDate] = Object.assign({}, { shipmentId, totalCost, expectedDeliveryDate, forecastCost });
                    //     else
                    //         a[expectedDeliveryDate].totalCost += totalCost;
                    //     a[expectedDeliveryDate].forecastCost += forecastCost;
                    //     return a;
                    // }, {}));
        
        
                    var result1 = data1.reduce(function (data1, val) {
                        var o = data1.filter(function (obj) {
                            return obj.expectedDeliveryDate == val.expectedDeliveryDate;
                        }).pop() || { expectedDeliveryDate: val.expectedDeliveryDate, shipmentId: val.shipmentId, totalCost: 0, forecastCost: 0 };
        
                        o.totalCost += val.totalCost;
                        o.forecastCost += val.forecastCost;
                        data1.push(o);
                        return data1;
                    }, []);
                    var result = result1.filter(function (itm, i, a) {
                        return i == a.indexOf(itm);
                    });
                    console.log("result====>", result);
                    let tempdata = [];
                    for (var j = 0; j < dateArray.length; j++) {
                        let hold = 0
                        for (var k = 0; k < result.length; k++) {
                            if (moment(dateArray[j], 'MM-YYYY').isSame(moment(result[k].expectedDeliveryDate, 'MM-YYYY'))) {
                                hold = viewById == 1 ? result[k].totalCost : result[k].forecastCost;
                                k = result.length;
                            } else {
                                hold = 0;
                            }
                        }
                        hold = parseFloat(hold).toFixed(2)
                        tempdata.push(hold);
        
                    }
                    console.log("tempdata==>", tempdata);
                    shipmentSummerydata.push(tempdata);
        
                }
        
                console.log("shipmentSummeryData===>", shipmentSummerydata);
                const bar = {
                    labels: [...new Set(mainData.map(ele => (moment(ele.expectedDeliveryDate, 'YYYY-MM-dd').format('MMM YYYY'))))],
                    datasets: shipmentSummerydata.map((item, index) => ({ label: shipmentStatus[index], data: item, backgroundColor: backgroundColor[index] })),
                };
                //Graph end
        
                //Table-1 start
        
                let tempDataTable = mainData.map((item) => {
                    return {
                        shipmentId: item.shipmentId,
                        fundingSource: item.fundingSource,
                        shipmentQty: item.shipmentQty,
                        totalCost: item.totalCost,
                        forecastCost: item.totalCost * item.multiplier
                    }
                });
        
                console.log("tempDataTable------>>", tempDataTable);
        
                var result1 = tempDataTable.reduce(function (tempDataTable, val) {
                    var o = tempDataTable.filter(function (obj) {
                        return obj.fundingSource.id == val.fundingSource.id;
                    }).pop() || { fundingSource: val.fundingSource, shipmentId: val.shipmentId, shipmentQty: 0, totalCost: 0, forecastCost: 0 };
        
                    o.shipmentQty += val.shipmentQty;
                    o.totalCost += val.totalCost;
                    o.forecastCost += val.forecastCost;
                    tempDataTable.push(o);
                    return tempDataTable;
                }, []);
                var result = result1.filter(function (itm, i, a) {
                    return i == a.indexOf(itm);
                });
        
                console.log("RESULT------->", result);
        
                // let result = Object.values(tempDataTable.reduce((a, { shipmentId, fundingSource, shipmentQty, totalCost, forecastCost }) => {
                //     if (!a[fundingSource.id])
                //         a[fundingSource.id] = Object.assign({}, { shipmentId, fundingSource, shipmentQty, totalCost, forecastCost });
                //     else
                //         a[fundingSource.id].totalCost += totalCost;
                //     a[fundingSource.id].shipmentQty += shipmentQty;
                //     a[fundingSource.id].forecastCost += forecastCost;
                //     return a;
                // }, {}));
                // console.log("RESULT------>>", result);
        
        
                //yessolution
                // var arr = [
                //     { 'name': 'P1', 'value': 150, 'value1': 150 },
                //     { 'name': 'P1', 'value': 150, 'value1': 150 },
                //     { 'name': 'P2', 'value': 200, 'value1': 150 },
                //     { 'name': 'P3', 'value': 450, 'value1': 150 }
                // ];
                // var result1 = arr.reduce(function (acc, val) {
                //     var o = acc.filter(function (obj) {
                //         return obj.name == val.name;
                //     }).pop() || { name: val.name, value: 0, value1: 0 };
        
                //     o.value += val.value;
                //     o.value1 += val.value1;
                //     acc.push(o);
                //     return acc;
                // }, []);
                // var finalresult = result1.filter(function (itm, i, a) {
                //     return i == a.indexOf(itm);
                // });
                // console.log("result1------->>>>>>>>>>", finalresult);
        
        
        
                let perResult = [];
                for (var k = 0; k < result.length; k++) {
                    let count = 0;
                    for (var p = 0; p < mainData.length; p++) {
                        if (result[k].fundingSource.id == mainData[p].fundingSource.id) {
                            count = count + 1;
                        }
                    }
                    let json = {
                        shipmentId: result[k].shipmentId,
                        fundingSource: result[k].fundingSource,
                        shipmentQty: result[k].shipmentQty,
                        totalCost: viewById == 1 ? result[k].totalCost : result[k].forecastCost,
                        orders: count
                    }
                    perResult.push(json);
                }
        
                perResult = perResult.sort((a, b) => parseFloat(b.orders) - parseFloat(a.orders));
        
                // console.log("perResult-------->>", perResult);
        
                //Table-1 end
        
        */
        const bar = {

            // labels: this.state.shipmentDetailsMonthList.map((item, index) => (this.dateFormatter(item.dt))),
            labels: this.state.shipmentDetailsMonthList.map((item, index) => (this.dateFormatterLanguage(item.dt))),
            datasets: [{
                label: i18n.t('static.supplyPlan.delivered'),
                stack: 1,
                // backgroundColor: '#118b70',
                backgroundColor: '#002f6c',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                data: this.state.shipmentDetailsMonthList.map((item, index) => (
                    item.receivedCost))

            }, {
                label: i18n.t('static.report.arrived'),
                backgroundColor: '#0067B9',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                stack: 1,
                data: this.state.shipmentDetailsMonthList.map((item, index) => (
                    item.arrivedCost
                ))
            },
            {
                label: i18n.t('static.report.shipped'),
                stack: 1,
                // backgroundColor: '#1d97c2',
                backgroundColor: '#49A4A1',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                data: this.state.shipmentDetailsMonthList.map((item, index) => (
                    item.shippedCost
                ))
            },
            {
                label: i18n.t('static.supplyPlan.ordered'),
                backgroundColor: '#0067B9',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                stack: 1,
                data: this.state.shipmentDetailsMonthList.map((item, index) => (
                    item.approvedCost
                ))
            },

            {
                label: i18n.t('static.report.submitted'),
                stack: 1,
                backgroundColor: '#25A7FF',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                data: this.state.shipmentDetailsMonthList.map((item, index) => (
                    item.submittedCost
                ))
            },
            {
                label: i18n.t('static.report.planned'),
                // backgroundColor: '#a5c5ec',
                backgroundColor: '#A7C6ED',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                stack: 1,
                data: this.state.shipmentDetailsMonthList.map((item, index) => (
                    item.plannedCost
                ))
            },
            {
                label: i18n.t('static.report.hold'),
                stack: 1,
                backgroundColor: '#6C6463',
                borderColor: 'rgba(179,181,198,1)',
                pointBackgroundColor: 'rgba(179,181,198,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(179,181,198,1)',
                data: this.state.shipmentDetailsMonthList.map((item, index) => (
                    item.onholdCost
                ))
            }

            ]
        };

        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>

                <Card>
                    <div className="Card-header-reporticon">


                        {
                            this.state.shipmentDetailsMonthList.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                                    {/* <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>
 {({ toPdf }) =>
 <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />
 }
 </Pdf>*/}
                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }


                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        <div className="" >
                            <div ref={ref}>
                                <Form >
                                    {/* <Col md="12 pl-0"> */}
                                    <div className="pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
                                                <div className="controls  Regioncalender">
                                                    {/* <InputGroup> */}
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

                                                    {/* </InputGroup> */}
                                                </div>
                                            </FormGroup>


                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            // onChange={this.filterVersion}
                                                            // onChange={(e) => { this.filterVersion(); }}
                                                            onChange={(e) => { this.setProgramId(e); }}
                                                            value={this.state.programId}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {programs.length > 0
                                                                && programs.map((item, i) => {
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
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.version*')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="versionId"
                                                            id="versionId"
                                                            bsSize="sm"
                                                            // onChange={(e) => { this.getPlanningUnit(); }}
                                                            onChange={(e) => { this.setVersionId(e); }}
                                                            value={this.state.versionId}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {versionList}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

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
                                                    />


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
                                                            onChange={this.fetchData}
                                                        >
                                                            <option value="1">{i18n.t('static.report.planningUnit')}</option>
                                                            <option value="2">{i18n.t('static.dashboard.forecastingunit')}</option>
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3" id="fundingSourceDiv">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls">
                                                    <MultiSelect
                                                        name="fundingSourceId"
                                                        id="fundingSourceId"
                                                        bsSize="md"
                                                        value={this.state.fundingSourceValues}
                                                        onChange={(e) => { this.handleFundingSourceChange(e) }}
                                                        options={fundingSources.length > 0
                                                            && fundingSources.map((item, i) => {
                                                                return (
                                                                    { label: item.fundingSourceCode, value: item.fundingSourceId }
                                                                )
                                                            }, this)}
                                                        disabled={this.state.loading}
                                                    />

                                                </div>
                                            </FormGroup>

                                            {this.state.filteredBudgetList.length > 0 && <FormGroup className="col-md-3" id="fundingSourceDiv">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.budgetHead.budget')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls">
                                                    <MultiSelect
                                                        name="budgetId"
                                                        id="budgetId"
                                                        bsSize="md"
                                                        value={this.state.budgetValues}
                                                        onChange={(e) => { this.handleBudgetChange(e) }}
                                                        options={filteredBudgetList.length > 0
                                                            && filteredBudgetList.map((item, i) => {
                                                                return (
                                                                    { label: item.budgetCode, value: item.budgetId }
                                                                )
                                                            }, this)}
                                                    />

                                                </div>
                                            </FormGroup>}


                                        </div>
                                        {/* </Col> */}
                                    </div>
                                </Form>
                                <div style={{ display: this.state.loading ? "none" : "block" }}>
                                    <Col md="12 pl-0">
                                        <div className="row">
                                            {
                                                this.state.shipmentDetailsMonthList.length > 0
                                                &&
                                                <div className="col-md-12 p-0">
                                                    <div className="col-md-12">
                                                        <div className="chart-wrapper chart-graph-report pl-5 ml-3" style={{ marginLeft: '50px' }}>
                                                            {/* <Bar id="cool-canvas" data={bar} options={options} /> */}
                                                            <Bar id="cool-canvas" data={bar} options={options} />
                                                        </div>
                                                    </div>
                                                    {/* <div className="col-md-12">
                                                        <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" style={{ 'marginTop': '7px' }} onClick={this.toggledata}>
                                                            {this.state.show ? 'Hide Data' : 'Show Data'}
                                                        </button>

                                                    </div> */}
                                                </div>
                                            }
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12 pl-0 pr-0">
                                                {this.state.shipmentDetailsFundingSourceList.length > 0 &&
                                                    <Table id="mytable1" responsive className="table-bordered table-striped text-center mt-2">
                                                        <thead>
                                                            <tr>
                                                                <th style={{ width: '225px', cursor: 'pointer', 'text-align': 'center' }}>{i18n.t('static.budget.fundingsource')}</th>
                                                                <th style={{ width: '225px', cursor: 'pointer', 'text-align': 'right' }}>{i18n.t('static.report.orders')}</th>
                                                                <th style={{ width: '225px', cursor: 'pointer', 'text-align': 'right' }}>{i18n.t('static.report.qtyBaseUnit')}</th>
                                                                <th style={{ width: '225px', cursor: 'pointer', 'text-align': 'right' }}>{i18n.t('static.report.costUsd')}</th>
                                                            </tr>
                                                        </thead>
                                                        {/* <tbody>
                                                        <tr>
                                                            <td style={{ 'text-align': 'center' }}>Global Fund</td>
                                                            <td style={{ 'text-align': 'right' }}>2</td>
                                                            <td style={{ 'text-align': 'right' }}>5,000</td>
                                                            <td style={{ 'text-align': 'right' }}>9,350,000</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ 'text-align': 'center' }}>GHSC-PSM</td>
                                                            <td style={{ 'text-align': 'right' }}>1</td>
                                                            <td style={{ 'text-align': 'right' }}>4,000</td>
                                                            <td style={{ 'text-align': 'right' }}>7,480,000</td>
                                                        </tr>
                                                    </tbody> */}
                                                        <tbody>
                                                            {this.state.shipmentDetailsFundingSourceList.length > 0 &&
                                                                this.state.shipmentDetailsFundingSourceList.map((item, idx) =>
                                                                    <tr id="addr0" key={idx} >
                                                                        <td style={{ 'text-align': 'center' }}>{getLabelText(this.state.shipmentDetailsFundingSourceList[idx].fundingSource.label, this.state.lang)}</td>
                                                                        <td style={{ 'text-align': 'right' }}>{this.state.shipmentDetailsFundingSourceList[idx].orderCount}</td>
                                                                        <td style={{ 'text-align': 'right' }}>{(this.state.shipmentDetailsFundingSourceList[idx].quantity).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                                        <td style={{ 'text-align': 'right' }}>{(Number(this.state.shipmentDetailsFundingSourceList[idx].cost).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                                    </tr>
                                                                )}
                                                        </tbody>

                                                    </Table>}
                                            </div>
                                        </div>

                                    </Col>
                                    <Col md="12 pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-10 mt-3 ">
                                                <ul className="legendcommitversion list-group">
                                                    {this.state.shipmentDetailsList.length > 0 && <li><span className="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.emergencyOrder')}</span></li>}
                                                </ul>
                                            </FormGroup>
                                            <div className="ShipmentSummeryReportMarginTop" id="mytable2">
                                                <div id="shipmentDetailsListTableDiv" className={document.getElementById("versionId") != null && document.getElementById("versionId").value.includes('Local') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} >
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
                        </div>
                    </CardBody>
                </Card>

            </div >
        );
    }
}

export default ShipmentSummery;
