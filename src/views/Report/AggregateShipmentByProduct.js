// my report 
import React, { Component, lazy, Suspense, DatePicker } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
    Badge, Button, ButtonDropdown, ButtonGroup, ButtonToolbar, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Widgets, Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
    Progress, Pagination, PaginationItem, PaginationLink, Row, CardColumns, Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';

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
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, ON_HOLD_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS, INDEXED_DB_VERSION, INDEXED_DB_NAME, polling } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import { Online, Offline } from "react-detect-offline";
import csvicon from '../../assets/img/csv.png'
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
//import fs from 'fs'
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
        // text: i18n.t('static.dashboard.globalconsumption'),
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
        position: 'top',
        labels: {
            usePointStyle: true,
            fontColor: 'black'
        }
    }
}

const chartData = {
    labels: ["Feb 2020", "May 2020", "Jun 2020"],
    datasets: [{
        label: 'Planned',
        data: [0, 0, 0, 0],
        backgroundColor: 'red',
        borderWidth: 0
    },
    {
        label: 'Ordered',
        data: [0, 17000, 15000],
        backgroundColor: 'green',
        borderWidth: 0,
    },
    {
        label: 'Received',
        data: [20000, 0, 0],
        backgroundColor: 'blue',
        borderWidth: 0,
    },
    {
        label: 'Today',
        data: [0, 0, 0],
        backgroundColor: '#yellow',
        borderWidth: 0,
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


class AggregateShipmentByProduct extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.onRadioBtnClick = this.onRadioBtnClick.bind(this);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);
        this.state = {
            sortType: 'asc',
            dropdownOpen: false,
            radioSelected: 2,
            realms: [],
            programs: [],
            offlinePrograms: [],
            planningUnits: [],
            consumptions: [],
            offlineConsumptionList: [],
            offlinePlanningUnitList: [],
            productCategories: [],
            offlineProductCategoryList: [],
            versions: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            show: false,
            message: '',
            outPutList: [],
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 3, month: new Date().getMonth() + 2 },
            maxDate: { year: new Date().getFullYear() + 3, month: new Date().getMonth() },



        };
        this.getPrograms = this.getPrograms.bind(this);
        this.filterData = this.filterData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        //this.pickRange = React.createRef()
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
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    exportCSV(columns) {

        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        // csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        csvRow.push('')
        this.state.planningUnitLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('')


        const headers = [];
        columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });
        var A = [this.addDoubleQuoteToRowContent(headers)]

        this.state.outPutList.map(
            ele => A.push(this.addDoubleQuoteToRowContent([
                // (getLabelText(ele.program.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                ele.productCost,
                ele.quantity,
                ele.freightPer,
                ele.freightCost,
                ele.totalCost,
                // (new moment(ele.inventoryDate).format('MMM YYYY')).replaceAll(' ', '%20'),
                // ele.stockAdjustemntQty,
                // ele.lastModifiedBy.username,
                // new moment(ele.lastModifiedDate).format('MMM-DD-YYYY'), ele.notes
            ])));
        for (var i = 0; i < A.length; i++) {
            console.log(A[i])
            csvRow.push(A[i].join(","))

        }
        // var re;
        // var A = [[(i18n.t('static.report.consumptionDate')).replaceAll(' ', '%20'), (i18n.t('static.report.forecastConsumption')).replaceAll(' ', '%20'), (i18n.t('static.report.actualConsumption')).replaceAll(' ', '%20')]]
        // if (navigator.onLine) {
        //     re = this.state.consumptions
        // } else {
        //     re = this.state.offlineConsumptionList
        // }

        // for (var item = 0; item < re.length; item++) {
        //     A.push([re[item].consumption_date, re[item].forcast, re[item].Actual])
        // }
        // for (var i = 0; i < A.length; i++) {
        //     csvRow.push(A[i].join(","))
        // }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.report.consumption_') + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to) + ".csv"
        document.body.appendChild(a)
        a.click()
    }


    exportPDF = (columns) => {
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
            // var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
            // var reader = new FileReader();

            //var data='';
            // Use fs.readFile() method to read the file 
            //fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
            //}); 
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                /*doc.addImage(data, 10, 30, {
                align: 'justify'
                });*/
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.consumptionReport'), doc.internal.pageSize.width / 2, 60, {
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
                    // doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                    //     align: 'left'
                    // })
                    // doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                    //     align: 'left'
                    // })
                    var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 150, planningText)
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
        // var canvas = document.getElementById("cool-canvas");
        // //creates image

        // var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        // var h1 = 100;
        // var aspectwidth1 = (width - h1);

        // doc.addImage(canvasImg, 'png', 50, 220, 750, 260, 'CANVAS');

        // const headers = [[i18n.t('static.report.consumptionDate'),
        // i18n.t('static.report.forecastConsumption'),
        // i18n.t('static.report.actualConsumption')]];
        // const data = navigator.onLine ? this.state.consumptions.map(elt => [elt.consumption_date, this.formatter(elt.forcast), this.formatter(elt.Actual)]) : this.state.finalOfflineConsumption.map(elt => [elt.consumption_date, this.formatter(elt.forcast), this.formatter(elt.Actual)]);

        // let content = {
        //     margin: { top: 80 },
        //     startY: height,
        //     head: headers,
        //     body: data,
        //     styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

        // };
        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text) });
        let data = this.state.outPutList.map(ele => [
            // getLabelText(ele.program.label, this.state.lang), 
            getLabelText(ele.planningUnit.label, this.state.lang),
            ele.productCost,
            ele.quantity,
            ele.freightPer,
            ele.freightCost,
            ele.totalCost,
            // new moment(ele.inventoryDate).format('MMM YYYY'), 
            // this.formatter(ele.stockAdjustemntQty), 
            // ele.lastModifiedBy.username, 
            // new moment(ele.lastModifiedDate).format('MMM-DD-YYYY'), ele.notes
        ]);
        let content = {
            margin: { top: 40, bottom: 50 },
            startY: 200,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 80, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 170 },
                1: { cellWidth: 171.89 },
                6: { cellWidth: 100 }
            }
        };
        //doc.text(title, marginLeft, 40);
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save("Consumption.pdf")
        //creates PDF from img
        /* var doc = new jsPDF('landscape');
        doc.setFontSize(20);
        doc.text(15, 15, "Cool Chart");
        doc.save('canvas.pdf');*/
    }



    filterData() {
        // let versionId = document.getElementById("versionId").value;
        // let programId = document.getElementById("programId").value;
        // // let productCategoryId = document.getElementById("productCategoryId").value;
        // let planningUnitId = document.getElementById("planningUnitId").value;
        // let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        // let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
        // if (planningUnitId > 0 && programId > 0 && versionId != 0) {

        //     if (navigator.onLine) {
        //         let realmId = AuthenticationService.getRealmId();
        //         AuthenticationService.setupAxiosInterceptors();
        //         ProductService.getConsumptionData(realmId, programId, planningUnitId, this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01', this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate())
        //             .then(response => {
        //                 console.log(JSON.stringify(response.data));
        //                 this.setState({
        //                     consumptions: response.data,
        //                     message: ''
        //                 })
        //             }).catch(
        //                 error => {
        //                     this.setState({
        //                         consumptions: []
        //                     })

        //                     if (error.message === "Network Error") {
        //                         this.setState({ message: error.message });
        //                     } else {
        //                         switch (error.response ? error.response.status : "") {
        //                             case 500:
        //                             case 401:
        //                             case 404:
        //                             case 406:
        //                             case 412:
        //                                 this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
        //                                 break;
        //                             default:
        //                                 this.setState({ message: 'static.unkownError' });
        //                                 break;
        //                         }
        //                     }
        //                 }
        //             );
        //     } else {
        //         // if (planningUnitId != "" && planningUnitId != 0 && productCategoryId != "" && productCategoryId != 0) {
        //         var db1;
        //         getDatabase();
        //         var openRequest = indexedDB.open(INDEXED_DB_NAME,INDEXED_DB_VERSION );
        //         openRequest.onsuccess = function (e) {
        //             db1 = e.target.result;

        //             var transaction = db1.transaction(['programData'], 'readwrite');
        //             var programTransaction = transaction.objectStore('programData');
        //             var programRequest = programTransaction.get(programId);

        //             programRequest.onsuccess = function (event) {
        //                 var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
        //                 var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
        //                 var programJson = JSON.parse(programData);
        //                 var offlineConsumptionList = (programJson.consumptionList);

        //                 const activeFilter = offlineConsumptionList.filter(c => (c.active == true || c.active == "true"));

        //                 const planningUnitFilter = activeFilter.filter(c => c.planningUnit.id == planningUnitId);
        //                 const productCategoryFilter = planningUnitFilter.filter(c => (c.planningUnit.forecastingUnit != null && c.planningUnit.forecastingUnit != "") && (c.planningUnit.forecastingUnit.productCategory.id == productCategoryId));

        //                 // const dateFilter = planningUnitFilter.filter(c => moment(c.startDate).isAfter(startDate) && moment(c.stopDate).isBefore(endDate))
        //                 const dateFilter = productCategoryFilter.filter(c => moment(c.consumptionDate).isBetween(startDate, endDate, null, '[)'))

        //                 const sorted = dateFilter.sort((a, b) => {
        //                     var dateA = new Date(a.consumptionDate).getTime();
        //                     var dateB = new Date(b.consumptionDate).getTime();
        //                     return dateA > dateB ? 1 : -1;
        //                 });
        //                 let previousDate = "";
        //                 let finalOfflineConsumption = [];
        //                 var json;

        //                 for (let i = 0; i <= sorted.length; i++) {
        //                     let forcast = 0;
        //                     let actual = 0;
        //                     if (sorted[i] != null && sorted[i] != "") {
        //                         previousDate = moment(sorted[i].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY');
        //                         for (let j = 0; j <= sorted.length; j++) {
        //                             if (sorted[j] != null && sorted[j] != "") {
        //                                 if (previousDate == moment(sorted[j].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY')) {
        //                                     if (sorted[j].actualFlag == false || sorted[j].actualFlag == "false") {
        //                                         forcast = forcast + parseFloat(sorted[j].consumptionQty);
        //                                     }
        //                                     if (sorted[j].actualFlag == true || sorted[j].actualFlag == "true") {
        //                                         actual = actual + parseFloat(sorted[j].consumptionQty);
        //                                     }
        //                                 }
        //                             }
        //                         }

        //                         let date = moment(sorted[i].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY');
        //                         json = {
        //                             consumption_date: date,
        //                             Actual: actual,
        //                             forcast: forcast
        //                         }

        //                         if (!finalOfflineConsumption.some(f => f.consumption_date === date)) {
        //                             finalOfflineConsumption.push(json);
        //                         }

        //                         // console.log("finalOfflineConsumption---", finalOfflineConsumption);

        //                     }
        //                 }
        //                 console.log("final consumption---", finalOfflineConsumption);
        //                 this.setState({
        //                     offlineConsumptionList: finalOfflineConsumption
        //                 });

        //             }.bind(this)

        //         }.bind(this)
        //         // }
        //     }
        // } else if (programId == 0) {
        //     this.setState({ message: i18n.t('static.common.selectProgram'), consumptions: [] });

        // } else if (productCategoryId == -1) {
        //     this.setState({ message: i18n.t('static.common.selectProductCategory'), consumptions: [] });

        // } else {
        //     this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), consumptions: [] });

        // }
    }

    getPrograms() {
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramList()
                .then(response => {
                    console.log(JSON.stringify(response.data))
                    this.setState({
                        programs: response.data
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: []
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
            //             programs: []
            //         }, () => { this.consolidatedProgramList() })
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
            //                     this.setState({ message: 'static.unkownError' });
            //                     break;
            //             }
            //         }
            //     }
            // );

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
                        console.log(programNameLabel)

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
            console.log(program)
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
                console.log(verList)
                this.setState({
                    versions: verList.filter(function (x, i, a) {
                        return a.indexOf(x) === i;
                    })
                })

            }.bind(this);
        }.bind(this)
    }

    getPlanningUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            planningUnits: []
        }, () => {
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
                        console.log(myResult)
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

                //let productCategoryId = document.getElementById("productCategoryId").value;
                ProgramService.getActiveProgramPlaningUnitListByProgramId(programId).then(response => {
                    console.log('**' + JSON.stringify(response.data))
                    this.setState({
                        planningUnits: response.data, message: ''
                    }, () => {
                        this.fetchData();
                    })
                })
                    .catch(
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
        });

    }
    fetchData = () => {
        let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;
        let plannedShipments = document.getElementById("shipmentStatusId").value;

        let planningUnitIds = this.state.planningUnitValues;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();

        if (programId > 0 && versionId != 0 && planningUnitIds.length > 0) {
            if (versionId.includes('Local')) {
                var db1;
                var storeOS;
                getDatabase();
                var regionList = [];
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext')
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
                    console.log(program)
                    var programRequest = programDataOs.get(program);
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        console.log(programRequest)
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        var shipmentList = [];
                        var plannedShipmentFilteredList = [];
                        var outPutList = [];
                        console.log("1----", programJson);
                        console.log("2----", programJson.shipmentList);
                        console.log("3----", planningUnitIds);
                        shipmentList = programJson.shipmentList;

                        var list = [];
                        list = shipmentList.filter(c => c.expectedDeliveryDate >= moment(startDate).format('YYYY-MM-DD') && c.expectedDeliveryDate <= moment(endDate).format('YYYY-MM-DD'));
                        console.log("4----", list);

                        var planningUnitfilteredList = [];
                        for (var i = 0; i < planningUnitIds.length; i++) {
                            var l = list.filter(c => c.planningUnit.id == planningUnitIds[i]);
                            for (var j = 0; j < l.length; j++) {
                                console.log("------status", l[j].shipmentStatus.id);
                                planningUnitfilteredList.push(l[j]);
                            }
                        }
                        console.log("5----", planningUnitfilteredList);

                        if (plannedShipments == 1) {
                            plannedShipmentFilteredList = planningUnitfilteredList.filter(c => c.shipmentStatus.id != PLANNED_SHIPMENT_STATUS && c.shipmentStatus.id != DRAFT_SHIPMENT_STATUS && c.shipmentStatus.id != ON_HOLD_SHIPMENT_STATUS)
                        } else {
                            plannedShipmentFilteredList = planningUnitfilteredList;
                        }
                        console.log("6----", plannedShipmentFilteredList);

                        for (var i = 0; i < planningUnitIds.length; i++) {
                            var p = plannedShipmentFilteredList.filter(c => c.planningUnit.id == planningUnitIds[i]);
                            var productCost = 0;
                            var quantity = 0;
                            var freightPer = 0;
                            var freightCost = 0;
                            var totalCost = 0;
                            for (j = 0; j < p.length; j++) {
                                productCost += parseFloat(p[j].productCost) * parseFloat(p[j].currency.conversionRateToUsd);
                                quantity += parseInt(p[j].shipmentQty);
                                freightCost += parseFloat(p[j].freightCost) * parseFloat(p[j].currency.conversionRateToUsd);
                                // freightPer += ((parseFloat(p[j].freightCost) * parseFloat(p[j].currency.conversionRateToUsd)) / (parseFloat(p[j].productCost) * parseFloat(p[j].currency.conversionRateToUsd))) * 100;
                                totalCost += (parseFloat(p[j].productCost) * parseFloat(p[j].currency.conversionRateToUsd)) + (parseFloat(p[j].freightCost) * parseFloat(p[j].currency.conversionRateToUsd));
                            }
                            var planningUnitForJson = this.state.planningUnits.filter(c => c.planningUnit.id == planningUnitIds[i])[0];
                            var json = {
                                // 'program': programJson,
                                'planningUnit': {
                                    'id': planningUnitForJson.planningUnit.id,
                                    'label': planningUnitForJson.planningUnit.label
                                },
                                'productCost': productCost,
                                'quantity': quantity,
                                'freightPer': (freightCost / totalCost) * 100,
                                'freightCost': freightCost,
                                'totalCost': totalCost,
                                // 'lastModifiedBy': programJson.currentVersion.lastModifiedBy,
                                // 'lastModifiedDate': programJson.currentVersion.lastModifiedDate

                            }
                            outPutList.push(json);
                        }
                        console.log("7----", outPutList);

                        this.setState({ outPutList: outPutList });


                    }.bind(this)
                }.bind(this)
            } else {
                var inputjson = {
                    programId: programId,
                    versionId: versionId,
                    startDate: new moment(startDate),
                    stopDate: new moment(endDate),
                    planningUnitIds: planningUnitIds
                }
                // AuthenticationService.setupAxiosInterceptors();

                ReportService.AggregateShipmentByProduct(inputjson)
                    .then(response => {
                        console.log("RESP------", response.data)
                        this.setState({
                            data: response.data
                        }, () => { this.consolidatedProgramList() })
                    }).catch(
                        error => {
                            this.setState({
                                data: []
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
                //             data: []
                //         }, () => { this.consolidatedProgramList() })
                //         if (error.message === "Network Error") {
                //             this.setState({ message: error.message });
                //         } else {
                //             switch (error.response ? error.response.status : "") {
                //                 case 500:
                //                 case 401:
                //                 case 404:
                //                 case 406:
                //                 case 412:
                //                     this.setState({ message: i18n.t(error.response.data.messageCode) });
                //                     break;
                //                 default:
                //                     this.setState({ message: 'static.unkownError' });
                //                     break;
                //             }
                //         }
                //     }
                // );


            }
        } else if (programId == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), data: [] });

        } else if (versionId == 0) {
            this.setState({ message: i18n.t('static.program.validversion'), data: [] });

        } else {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] });

        }
    }
    handlePlanningUnitChange = (planningUnitIds) => {
        this.setState({
            planningUnitValues: planningUnitIds.map(ele => ele.value),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })
    }
    componentDidMount() {
        // if (navigator.onLine) {
        this.getPrograms();


        // } else {
        //     const lan = 'en';
        //     var db1;
        //     getDatabase();

        //     var openRequest = indexedDB.open(INDEXED_DB_NAME,INDEXED_DB_VERSION );
        //     openRequest.onsuccess = function (e) {
        //         db1 = e.target.result;
        //         var transaction = db1.transaction(['programData'], 'readwrite');
        //         var program = transaction.objectStore('programData');
        //         var getRequest = program.getAll();
        //         var proList = []
        //         getRequest.onerror = function (event) {
        //             // Handle errors!
        //         };
        //         getRequest.onsuccess = function (event) {
        //             var myResult = [];
        //             myResult = getRequest.result;
        //             var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        //             var userId = userBytes.toString(CryptoJS.enc.Utf8);
        //             for (var i = 0; i < myResult.length; i++) {
        //                 if (myResult[i].userId == userId) {
        //                     var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
        //                     var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
        //                     var programJson = {
        //                         name: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + myResult[i].version,
        //                         id: myResult[i].id
        //                     }
        //                     proList[i] = programJson
        //                 }
        //             }
        //             this.setState({
        //                 offlinePrograms: proList
        //             })

        //         }.bind(this);
        //     }.bind(this);

        // }
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
        });
    }

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
        this.setState({ rangeValue: value }, () => {
            this.filterData();
        })

    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

    render() {

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const { programs } = this.state;
        const { offlinePrograms } = this.state;

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {/* {item.versionId} */}
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)}
                    </option>
                )
            }, this);
        const { planningUnits } = this.state
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);
        console.log("planningUnits---", planningUnits);

        let bar = "";
        if (isSiteOnline()) {
            bar = {

                labels: this.state.consumptions.map((item, index) => (moment(item.consumption_date, 'MM-YYYY').format('MMM YYYY'))),
                datasets: [
                    {
                        type: "line",
                        linetension: 0,
                        label: i18n.t('static.report.forecastConsumption'),
                        backgroundColor: 'transparent',
                        borderColor: '#000',
                        borderDash: [10, 10],
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        showInLegend: true,
                        pointStyle: 'line',
                        pointBorderWidth: 5,
                        yValueFormatString: "$#,##0",
                        data: this.state.consumptions.map((item, index) => (item.forcast))
                    }, {
                        label: i18n.t('static.report.actualConsumption'),
                        backgroundColor: '#86CD99',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.consumptions.map((item, index) => (item.Actual)),
                    }
                ],



            }
        }
        if (!isSiteOnline()) {
            bar = {

                labels: this.state.offlineConsumptionList.map((item, index) => (moment(item.consumption_date, 'MM-YYYY').format('MMM YYYY'))),
                datasets: [
                    {
                        label: i18n.t('static.report.actualConsumption'),
                        backgroundColor: '#86CD99',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.offlineConsumptionList.map((item, index) => (item.Actual)),
                    }, {
                        type: "line",
                        linetension: 0,
                        label: i18n.t('static.report.forecastConsumption'),
                        backgroundColor: 'transparent',
                        borderColor: 'rgba(179,181,158,1)',
                        borderStyle: 'dotted',
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        showInLegend: true,
                        yValueFormatString: "$#,##0",
                        data: this.state.offlineConsumptionList.map((item, index) => (item.forcast))
                    }
                ],

            }
        }
        const pickerLang = {
            months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }


        const columns = [
            {
                dataField: 'planningUnit.label',
                text: 'Planning Unit',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '170px' },
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'productCost',
                text: 'Product Cost(USD)',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '170px' },
                formatter: (cell, row) => {
                    var decimalFixedValue = cell.toFixed(2);
                    decimalFixedValue += '';
                    var x = decimalFixedValue.split('.');
                    var x1 = x[0];
                    var x2 = x.length > 1 ? '.' + x[1] : '';
                    var rgx = /(\d+)(\d{3})/;
                    while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                    }
                    return x1 + x2;
                }

            },
            {
                dataField: 'quantity',
                text: 'Quantity',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cell, row) => {
                    cell += '';
                    var x = cell.split('.');
                    var x1 = x[0];
                    var x2 = x.length > 1 ? '.' + x[1] : '';
                    var rgx = /(\d+)(\d{3})/;
                    while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                    }
                    return x1 + x2;
                }

            },
            {
                dataField: 'freightPer',
                text: 'Freight(%)',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cell, row) => {
                    var decimalFixedValue = cell.toFixed(2);
                    decimalFixedValue += '';
                    var x = decimalFixedValue.split('.');
                    var x1 = x[0];
                    var x2 = x.length > 1 ? '.' + x[1] : '';
                    var rgx = /(\d+)(\d{3})/;
                    while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                    }
                    return x1 + x2;
                }

            },
            {
                dataField: 'freightCost',
                text: 'Freight Cost(USD)',
                sort: true,
                align: 'center',
                style: { width: '80px' },
                headerAlign: 'center',
                formatter: (cell, row) => {
                    var decimalFixedValue = cell.toFixed(2);
                    decimalFixedValue += '';
                    var x = decimalFixedValue.split('.');
                    var x1 = x[0];
                    var x2 = x.length > 1 ? '.' + x[1] : '';
                    var rgx = /(\d+)(\d{3})/;
                    while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                    }
                    return x1 + x2;
                }
            },
            {
                dataField: 'totalCost',
                text: 'Total Cost(USD)',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cell, row) => {
                    var decimalFixedValue = cell.toFixed(2);
                    decimalFixedValue += '';
                    var x = decimalFixedValue.split('.');
                    var x1 = x[0];
                    var x2 = x.length > 1 ? '.' + x[1] : '';
                    var rgx = /(\d+)(\d{3})/;
                    while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                    }
                    return x1 + x2;
                }
                // formatter: (cell, row) => {
                //     return new moment(cell).format('MMM-DD-YYYY');
                // }
            }
        ];
        const tabelOptions = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '10', value: 10
            }, {
                text: '30', value: 30
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.outPutList.length
            }]
        }

        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>

                <Card>
                    <div className="Card-header-reporticon">
                        {/* <i className="icon-menu"></i><strong>Aggregate Shipment By Product</strong> */}
                        {/* <b className="count-text">{i18n.t('static.report.consumptionReport')}</b> */}
                        {/* <Online> */}
                        {/* {
                                this.state.consumptions.length > 0 && */}
                        <div className="card-header-actions">
                            <a className="card-header-action">

                                {this.state.outPutList.length > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />}

                                {/* <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>

 
 {({ toPdf }) =>
 <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />

 }
 </Pdf>*/}
                            </a>
                            {this.state.outPutList.length > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />}
                        </div>
                        {/* } */}
                        {/* </Online> */}
                        {/* <Offline>
                            {
                                this.state.offlineConsumptionList.length > 0 &&
                                <div className="card-header-actions">
                                    <a className="card-header-action">

                                      {this.state.outPutList.length >0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />}  

                                        {/* <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>

 {({ toPdf }) =>
 <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />

 }
 </Pdf>*/}
                        {/* </a>
                                 {this.state.outPutList.length >0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />}   
                                </div>
                            }
                        </Offline> */}
                    </div>
                    <CardBody className="pt-lg-0 ">
                        <div className="" >
                            <div ref={ref}>
                                <Form >
                                    <Col md="12 pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
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
                                            {/* <Online> */}
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
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
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
                                                            onChange={(e) => { this.getPlanningUnit(); }}
                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {versionList}
                                                        </Input>
                                                    </InputGroup></div>

                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton"> {i18n.t('static.planningunit.planningunit')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls">
                                                    <InputGroup className="box">
                                                        <ReactMultiSelectCheckboxes
                                                            name="planningUnitId"
                                                            id="planningUnitId"
                                                            bsSize="md"
                                                            onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                            options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                                        />

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="shipmentStatusId"
                                                            id="shipmentStatusId"
                                                            bsSize="sm"
                                                            onChange={this.fetchData}
                                                        >
                                                            <option value="0">{i18n.t('sstatic.program.yes')}</option>
                                                            <option value="1">{i18n.t('static.program.no')}</option>
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

                                        </div>
                                    </Col>
                                </Form>

                                <Col md="12 pl-0">
                                    <div className="row">
                                        {/* {
                                                this.state.consumptions.length > 0
                                                && */}
                                        {/* <div className="col-md-12 p-0">
                                                <div className="col-md-12">
                                                    <div className="chart-wrapper chart-graph-report pl-5 ml-3" style={{ marginLeft: '50px' }}> */}
                                        {/* <Bar id="cool-canvas" data={bar} options={options} /> */}
                                        {/* <Bar id="cool-canvas" data={chartData} options={options} />
                                                        <div>

                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                                                        {this.state.show ? 'Hide Data' : 'Show Data'}
                                                    </button>

                                                </div>
                                            </div> */}
                                        {/* } */}



                                        {/* {
                                                this.state.offlineConsumptionList.length > 0
                                                &&
                                                <div className="col-md-12 p-0">
                                                    <div className="col-md-12">
                                                        <div className="chart-wrapper chart-graph-report">
                                                            {/* <Bar id="cool-canvas" data={bar} options={options} /> */}

                                        {/* </div> */}
                                        {/* </div> */}
                                        {/* <div className="col-md-12"> */}
                                        {/* <button className="mr-1 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}> */}
                                        {/* {this.state.show ? 'Hide Data' : 'Show Data'} */}
                                        {/* </button> */}
                                        {/* </div> */}
                                        {/* </div>} */}

                                    </div>
                                    {/* <div className="row">
                                        <div className="col-md-12 pl-0 pr-0">
                                            {/* {this.state.show && */}
                                    {/* <Table responsive className="table-striped table-hover table-bordered text-center mt-2">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '700px', cursor: 'pointer' }}>Planning Unit</th>
                                                        <th style={{ width: '325px', cursor: 'pointer' }}>Quantity</th>
                                                        <th style={{ width: '325px', cursor: 'pointer' }}>Product Cost(USD)</th>
                                                        <th style={{ width: '325px', cursor: 'pointer' }}>Freight(%)</th>
                                                        <th style={{ width: '325px', cursor: 'pointer' }}>Freight Cost(USD)</th>
                                                        <th style={{ width: '325px', cursor: 'pointer' }}>Total Cost(USD)</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    <tr>
                                                        <td>Ceftriaxone 1 gm Powder Vial, 10 Vials</td>
                                                        <td>3000</td>
                                                        <td>5,100,000</td>
                                                        <td>10</td>
                                                        <td>510,000</td>
                                                        <td>5,610,000</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Ceftriaxone 1 gm Powder Vial, 50 Vials</td>
                                                        <td>5000</td>
                                                        <td>8,500,000</td>
                                                        <td>10</td>
                                                        <td>850,000</td>
                                                        <td>9,350,000</td>
                                                    </tr>
                                                </tbody>
                                            </Table> */}
                                    {/* } */}
                                    {/* </div>
                                    </div> */}

                                </Col>
                                <ToolkitProvider
                                    keyField="id"
                                    data={this.state.outPutList}
                                    columns={columns}
                                    search={{ searchFormatted: true }}
                                    hover
                                    filter={filterFactory()}
                                >
                                    {
                                        props => (

                                            <div className="TableCust">
                                                <div className="col-md-3 pr-0 offset-md-9 text-right mob-Left">
                                                    <SearchBar {...props.searchProps} />
                                                    <ClearSearchButton {...props.searchProps} />
                                                </div>
                                                <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                    pagination={paginationFactory(tabelOptions)}
                                                    /* rowEvents={{
                                                         onClick: (e, row, rowIndex) => {
                                                             this.editRegion(row);
                                                         }
                                                     }}*/
                                                    {...props.baseProps}
                                                />
                                            </div>
                                        )
                                    }
                                </ToolkitProvider>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div >
        );
    }
}

export default AggregateShipmentByProduct;