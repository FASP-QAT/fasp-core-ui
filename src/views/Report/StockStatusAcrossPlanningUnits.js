// import React, { Component } from 'react';
// import { Card, CardHeader, Form, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import i18n from '../../i18n'
// import RegionService from "../../api/RegionService";
// import AuthenticationService from '../Common/AuthenticationService.js';
// import getLabelText from '../../CommonComponent/getLabelText';
// import RealmCountryService from "../../api/RealmCountryService.js";

// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// import pdfIcon from '../../assets/img/pdf.png';
// import csvicon from '../../assets/img/csv.png';
// import Picker from 'react-month-picker';
// import MonthBox from '../../CommonComponent/MonthBox.js';
// import ProgramService from '../../api/ProgramService';
// import CryptoJS from 'crypto-js';
// import { SECRET_KEY, DATE_FORMAT_CAP, FIRST_DATA_ENTRY_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../../Constants.js';
// import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
// import ProductService from '../../api/ProductService';
// import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
// import moment from 'moment';
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import { LOGO } from '../../CommonComponent/Logo.js';
// import ReportService from '../../api/ReportService';
// const ref = React.createRef();
// export const DEFAULT_MIN_MONTHS_OF_STOCK = 3
// export const DEFAULT_MAX_MONTHS_OF_STOCK = 18

// const pickerLang = {
//     months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
//     from: 'From', to: 'To',
// }



// class StockStatusAcrossPlanningUnits extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             message: '',
//             programs: [],
//             versions: [],
//             planningUnits: [],
//             data: [],
//             lang: localStorage.getItem('lang'),
//             loading: false,
//             singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },

//         }
//     }

//     makeText = m => {
//         if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
//         return '?'
//     }



//     exportCSV = (columns) => {

//         var csvRow = [];
//         csvRow.push((i18n.t('static.report.month') + ' , ' + this.makeText(this.state.singleValue2)).replaceAll(' ', '%20'))
//         csvRow.push((i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20')))
//         csvRow.push((i18n.t('static.report.version') + ' , ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20'))
//         csvRow.push((i18n.t('static.program.isincludeplannedshipment') + ' , ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20'))
//         csvRow.push('')
//         csvRow.push('')
//         csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
//         csvRow.push('')
//         var re;

//         const headers = [];
//         columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });

//         var A = [headers]
//         this.state.data.map(ele => A.push([(getLabelText(ele.planningUnit.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), (ele.mos < ele.minMos ? i18n.t('static.report.low') : (ele.mos > ele.maxMos ? i18n.t('static.report.excess') : i18n.t('static.report.ok'))).replaceAll(' ', '%20'), this.roundN(ele.mos), ele.minMos, ele.maxMos, ele.stock, this.round(ele.amc), (new moment(ele.lastStockCount).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20')]));

//         for (var i = 0; i < A.length; i++) {
//             csvRow.push(A[i].join(","))
//         }
//         var csvString = csvRow.join("%0A")
//         var a = document.createElement("a")
//         a.href = 'data:attachment/csv,' + csvString
//         a.target = "_Blank"
//         a.download = i18n.t('static.dashboard.stockstatusacrossplanningunit') + ".csv"
//         document.body.appendChild(a)
//         a.click()
//     }
//     exportPDF = (columns) => {
//         const addFooters = doc => {

//             const pageCount = doc.internal.getNumberOfPages()

//             doc.setFont('helvetica', 'bold')
//             doc.setFontSize(6)
//             for (var i = 1; i <= pageCount; i++) {
//                 doc.setPage(i)

//                 doc.setPage(i)
//                 doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
//                     align: 'center'
//                 })
//                 doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
//                     align: 'center'
//                 })


//             }
//         }
//         const addHeaders = doc => {

//             const pageCount = doc.internal.getNumberOfPages()
//             for (var i = 1; i <= pageCount; i++) {
//                 doc.setFontSize(12)
//                 doc.setFont('helvetica', 'bold')

//                 doc.setPage(i)
//                 doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
//                 doc.setTextColor("#002f6c");
//                 doc.text(i18n.t('static.dashboard.stockstatusacrossplanningunit'), doc.internal.pageSize.width / 2, 60, {
//                     align: 'center'
//                 })
//                 if (i == 1) {
//                     doc.setFontSize(8)
//                     doc.setFont('helvetica', 'normal')
//                     doc.text(i18n.t('static.report.month') + ' : ' + this.makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 90, {
//                         align: 'left'
//                     })
//                     doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
//                         align: 'left'
//                     })
//                     doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
//                         align: 'left'
//                     })
//                     doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
//                         align: 'left'
//                     })
//                 }

//             }
//         }
//         const unit = "pt";
//         const size = "A4"; // Use A1, A2, A3 or A4
//         const orientation = "landscape"; // portrait or landscape

//         const marginLeft = 10;
//         const doc = new jsPDF(orientation, unit, size, true);

//         doc.setFontSize(8);

//         var width = doc.internal.pageSize.width;
//         var height = doc.internal.pageSize.height;
//         var h1 = 50;
//         const headers = columns.map((item, idx) => (item.text));
//         const data = this.state.data.map(ele => [getLabelText(ele.planningUnit.label), (ele.mos < ele.minMos ? i18n.t('static.report.low') : (ele.mos > ele.maxMos ? i18n.t('static.report.excess') : i18n.t('static.report.ok'))), this.formatterDouble(ele.mos), this.formatterDouble(ele.minMos), this.formatterDouble(ele.maxMos), this.formatter(ele.stock), this.formatter(ele.amc), new moment(ele.lastStockCount).format(`${DATE_FORMAT_CAP}`)]);

//         let content = {
//             margin: { top: 80, bottom: 50 },
//             startY: 170,
//             head: [headers],
//             body: data,
//             styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 75 },
//             columnStyles: {
//                 0: { cellWidth: 236.89 },
//             }
//         };
//         doc.autoTable(content);
//         addHeaders(doc)
//         addFooters(doc)
//         doc.save(i18n.t('static.dashboard.stockstatusacrossplanningunit') + ".pdf")
//     }


//     getPrograms = () => {
//         if (navigator.onLine) {
//             AuthenticationService.setupAxiosInterceptors();
//             let realmId = AuthenticationService.getRealmId();
//             ProgramService.getProgramByRealmId(realmId)
//                 .then(response => {
//                     console.log(JSON.stringify(response.data))
//                     this.setState({
//                         programs: response.data
//                     }, () => { this.consolidatedProgramList() })
//                 }).catch(
//                     error => {
//                         this.setState({
//                             programs: []
//                         }, () => { this.consolidatedProgramList() })
//                         if (error.message === "Network Error") {
//                             this.setState({ message: error.message });
//                         } else {
//                             switch (error.response ? error.response.status : "") {
//                                 case 500:
//                                 case 401:
//                                 case 404:
//                                 case 406:
//                                 case 412:
//                                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
//                                     break;
//                                 default:
//                                     this.setState({ message: 'static.unkownError' });
//                                     break;
//                             }
//                         }
//                     }
//                 );

//         } else {
//             console.log('offline')
//             this.consolidatedProgramList()
//         }

//     }
//     consolidatedProgramList = () => {
//         const lan = 'en';
//         const { programs } = this.state
//         var proList = programs;

//         var db1;
//         getDatabase();
//         var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
//         openRequest.onsuccess = function (e) {
//             db1 = e.target.result;
//             var transaction = db1.transaction(['programData'], 'readwrite');
//             var program = transaction.objectStore('programData');
//             var getRequest = program.getAll();

//             getRequest.onerror = function (event) {
//                 // Handle errors!
//             };
//             getRequest.onsuccess = function (event) {
//                 var myResult = [];
//                 myResult = getRequest.result;
//                 var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//                 var userId = userBytes.toString(CryptoJS.enc.Utf8);
//                 for (var i = 0; i < myResult.length; i++) {
//                     if (myResult[i].userId == userId) {
//                         var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
//                         var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
//                         var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
//                         var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
//                         console.log(programNameLabel)

//                         var f = 0
//                         for (var k = 0; k < this.state.programs.length; k++) {
//                             if (this.state.programs[k].programId == programData.programId) {
//                                 f = 1;
//                                 console.log('already exist')
//                             }
//                         }
//                         if (f == 0) {
//                             proList.push(programData)
//                         }
//                     }


//                 }

//                 this.setState({
//                     programs: proList
//                 })

//             }.bind(this);

//         }.bind(this);


//     }


//     filterVersion = () => {
//         let programId = document.getElementById("programId").value;
//         if (programId != 0) {

//             const program = this.state.programs.filter(c => c.programId == programId)
//             console.log(program)
//             if (program.length == 1) {
//                 if (navigator.onLine) {
//                     this.setState({
//                         versions: []
//                     }, () => {
//                         this.setState({
//                             versions: program[0].versionList.filter(function (x, i, a) {
//                                 return a.indexOf(x) === i;
//                             })
//                         }, () => { this.consolidatedVersionList(programId) });
//                     });


//                 } else {
//                     this.setState({
//                         versions: []
//                     }, () => { this.consolidatedVersionList(programId) })
//                 }
//             } else {

//                 this.setState({
//                     versions: []
//                 })

//             }
//         } else {
//             this.setState({
//                 versions: []
//             })
//         }
//     }
//     consolidatedVersionList = (programId) => {
//         const lan = 'en';
//         const { versions } = this.state
//         var verList = versions;

//         var db1;
//         getDatabase();
//         var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
//         openRequest.onsuccess = function (e) {
//             db1 = e.target.result;
//             var transaction = db1.transaction(['programData'], 'readwrite');
//             var program = transaction.objectStore('programData');
//             var getRequest = program.getAll();

//             getRequest.onerror = function (event) {
//                 // Handle errors!
//             };
//             getRequest.onsuccess = function (event) {
//                 var myResult = [];
//                 myResult = getRequest.result;
//                 var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//                 var userId = userBytes.toString(CryptoJS.enc.Utf8);
//                 for (var i = 0; i < myResult.length; i++) {
//                     if (myResult[i].userId == userId && myResult[i].programId == programId) {
//                         var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
//                         var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
//                         var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
//                         var programData = databytes.toString(CryptoJS.enc.Utf8)
//                         var version = JSON.parse(programData).currentVersion

//                         version.versionId = `${version.versionId} (Local)`
//                         verList.push(version)

//                     }


//                 }

//                 console.log(verList)
//                 this.setState({
//                     versions: verList.filter(function (x, i, a) {
//                         return a.indexOf(x) === i;
//                     })
//                 })

//             }.bind(this);



//         }.bind(this)


//     }

//     roundN = num => {
//         return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
//     }
//     round = num => {
//         return parseFloat(Math.round(num * Math.pow(10, 0)) / Math.pow(10, 0)).toFixed(0);
//     }

//     formatLabel = (cell, row) => {
//         // console.log("celll----", cell);
//         if (cell != null && cell != "") {
//             return getLabelText(cell, this.state.lang);
//         }
//     }

//     formatterDate = (cell, row) => {
//         // console.log("celll----", cell);
//         if (cell != null && cell != "") {
//             return moment(cell).format(`${DATE_FORMAT_CAP}`);
//         }
//     }
//     formatter = value => {

//         var cell1 = this.round(value)
//         cell1 += '';
//         var x = cell1.split('.');
//         var x1 = x[0];
//         var x2 = x.length > 1 ? '.' + x[1] : '';
//         var rgx = /(\d+)(\d{3})/;
//         while (rgx.test(x1)) {
//             x1 = x1.replace(rgx, '$1' + ',' + '$2');
//         }
//         return x1 + x2;
//     }
//     formatterDouble = value => {

//         var cell1 = this.roundN(value)
//         cell1 += '';
//         var x = cell1.split('.');
//         var x1 = x[0];
//         var x2 = x.length > 1 ? '.' + x[1] : '';
//         var rgx = /(\d+)(\d{3})/;
//         while (rgx.test(x1)) {
//             x1 = x1.replace(rgx, '$1' + ',' + '$2');
//         }
//         return x1 + x2;
//     }
//     style = (cell, row) => {
//         if (cell < row.minMOS) {
//             return { align: 'center', color: 'red' }
//         }
//     }

//     handleClickMonthBox2 = (e) => {
//         this.refs.pickAMonth2.show()
//     }
//     handleAMonthChange2 = (value, text) => {
//         //
//         //
//     }
//     handleAMonthDissmis2 = (value) => {
//         this.setState({ singleValue2: value, }, () => {
//             this.fetchData();
//         })

//     }

//     componentDidMount() {
//         this.getPrograms()
//     }





//     fetchData = () => {
//         let programId = document.getElementById("programId").value;
//         let versionId = document.getElementById("versionId").value;
//         let startDate = moment(new Date(this.state.singleValue2.year, this.state.singleValue2.month - 1, 1));
//         let endDate = moment(new Date(this.state.singleValue2.year, this.state.singleValue2.month - 1, new Date(this.state.singleValue2.year, this.state.singleValue2.month, 0).getDate()));
//         let includePlanningShipments = document.getElementById("includePlanningShipments").value
//         if (programId != 0 && versionId != 0) {
//             if (versionId.includes('Local')) {


//                 var db1;
//                 getDatabase();
//                 var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
//                 openRequest.onsuccess = function (e) {
//                     db1 = e.target.result;

//                     var transaction = db1.transaction(['programData'], 'readwrite');
//                     var programTransaction = transaction.objectStore('programData');
//                     var version = (versionId.split('(')[0]).trim()
//                     var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//                     var userId = userBytes.toString(CryptoJS.enc.Utf8);
//                     var program = `${programId}_v${version}_uId_${userId}`
//                     var data = [];
//                     var programRequest = programTransaction.get(program);

//                     programRequest.onsuccess = function (event) {
//                         var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
//                         var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
//                         var programJson = JSON.parse(programData);

//                         var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
//                         var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
//                         var planningunitRequest = planningunitOs.getAll();
//                         var planningList = []
//                         planningunitRequest.onerror = function (event) {
//                             // Handle errors!
//                         };
//                         planningunitRequest.onsuccess = function (e) {
//                             var myResult = [];
//                             myResult = planningunitRequest.result;
//                             var programId = (document.getElementById("programId").value).split("_")[0];
//                             var proList = []
//                             console.log(myResult)
//                             for (var i = 0; i < myResult.length; i++) {
//                                 if (myResult[i].program.id == programId) {

//                                     proList[i] = myResult[i]
//                                 }
//                             }
//                             proList.map(planningUnit => {
//                                 var batchInfoForPlanningUnit = programJson.batchInfoList.filter(c => c.planningUnitId == planningUnit.planningUnit.id);
//                                 var myArray = batchInfoForPlanningUnit.sort(function (a, b) { return new Date(a.expiryDate) - new Date(b.expiryDate) })
//                                 for (var ma = 0; ma < myArray.length; ma++) {
//                                     var shipmentList = programJson.shipmentList;
//                                     var shipmentBatchArray = [];
//                                     for (var ship = 0; ship < shipmentList.length; ship++) {
//                                         var batchInfoList = shipmentList[ship].batchInfoList;
//                                         for (var bi = 0; bi < batchInfoList.length; bi++) {
//                                             shipmentBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].shipmentQty })
//                                         }
//                                     }
//                                     var stockForBatchNumber = shipmentBatchArray.filter(c => c.batchNo == myArray[ma].batchNo)[0];
//                                     var totalStockForBatchNumber = stockForBatchNumber.qty;
//                                     var consumptionList = programJson.consumptionList;
//                                     var consumptionBatchArray = [];

//                                     for (var con = 0; con < consumptionList.length; con++) {
//                                         var batchInfoList = consumptionList[con].batchInfoList;
//                                         for (var bi = 0; bi < batchInfoList.length; bi++) {
//                                             consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
//                                         }
//                                     }
//                                     var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
//                                     if (consumptionForBatchNumber == undefined) {
//                                         consumptionForBatchNumber = [];
//                                     }
//                                     var consumptionQty = 0;
//                                     for (var b = 0; b < consumptionForBatchNumber.length; b++) {
//                                         consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
//                                     }
//                                     var inventoryList = programJson.inventoryList;
//                                     var inventoryBatchArray = [];
//                                     for (var inv = 0; inv < inventoryList.length; inv++) {
//                                         var batchInfoList = inventoryList[inv].batchInfoList;
//                                         for (var bi = 0; bi < batchInfoList.length; bi++) {
//                                             inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier })
//                                         }
//                                     }
//                                     var inventoryForBatchNumber = [];
//                                     if (inventoryBatchArray.length > 0) {
//                                         inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
//                                     }
//                                     if (inventoryForBatchNumber == undefined) {
//                                         inventoryForBatchNumber = [];
//                                     }
//                                     var adjustmentQty = 0;
//                                     for (var b = 0; b < inventoryForBatchNumber.length; b++) {
//                                         adjustmentQty += parseFloat(inventoryForBatchNumber[b].qty);
//                                     }
//                                     var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
//                                     myArray[ma].remainingQty = remainingBatchQty;
//                                 }






















//                                 var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnit.planningUnit.id && c.active == true);
//                                 var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnit.planningUnit.id);
//                                 var shipmentList = []
//                                 // if (document.getElementById("includePlanningShipments").selectedOptions[0].value.toString() == 'true') {
//                                 shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnit.planningUnit.id && c.shipmentStatus.id != 8 && c.accountFlag == true);
//                                 // } else {
//                                 //   shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != 8 && c.shipmentStatus.id != 1 && c.shipmentStatus.id != 2 && c.shipmentStatus.id != 9 && c.accountFlag == true);

//                                 // }
//                                 // calculate openingBalance

//                                 // let invmin=moment.min(inventoryList.map(d => moment(d.inventoryDate)))
//                                 // let shipmin = moment.min(shipmentList.map(d => moment(d.expectedDeliveryDate)))
//                                 // let conmin =  moment.min(consumptionList.map(d => moment(d.consumptionDate)))
//                                 // var minDate = invmin.isBefore(shipmin)&&invmin.isBefore(conmin)?invmin:shipmin.isBefore(invmin)&& shipmin.isBefore(conmin)?shipmin:conmin
//                                 var minDate = moment(FIRST_DATA_ENTRY_DATE);
//                                 let moments = (inventoryList.filter(c => moment(c.inventoryDate).isBefore(endDate) || moment(c.inventoryDate).isSame(endDate))).map(d => moment(d.inventoryDate))
//                                 var maxDate = moments.length > 0 ? moment.max(moments) : ''
//                                 var openingBalance = 0;
//                                 console.log('minDate', minDate, 'startDate', startDate, ' maxDate', maxDate)

//                                 var endingBalance = 0
//                                 for (i = 1; ; i++) {
//                                     var dtstr = minDate.startOf('month').format('YYYY-MM-DD')
//                                     var enddtStr = minDate.endOf('month').format('YYYY-MM-DD')
//                                     console.log(dtstr, ' ', enddtStr)
//                                     var dt = dtstr
//                                     var consumptionQty = 0;
//                                     var unallocatedConsumptionQty = 0;

//                                     var conlist = consumptionList.filter(c => c.consumptionDate === dt)

//                                     var actualFlag = false
//                                     for (var i = 0; i < programJson.regionList.length; i++) {

//                                         var list = conlist.filter(c => c.region.id == programJson.regionList[i].regionId)
//                                         console.log(list)
//                                         if (list.length > 1) {
//                                             for (var l = 0; l < list.length; l++) {
//                                                 if (list[l].actualFlag.toString() == 'true') {
//                                                     actualFlag = true;
//                                                     consumptionQty = consumptionQty + list[l].consumptionQty
//                                                     var qty = 0;
//                                                     if (list[l].batchInfoList.length > 0) {
//                                                         for (var a = 0; a < list[l].batchInfoList.length; a++) {
//                                                             qty += parseInt((list[l].batchInfoList)[a].consumptionQty);
//                                                         }
//                                                     }
//                                                     var remainingQty = parseInt((list[l].consumptionQty)) - parseInt(qty);
//                                                     unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
//                                                 }
//                                             }
//                                         } else {
//                                             consumptionQty = list.length == 0 ? consumptionQty : consumptionQty = consumptionQty + parseInt(list[0].consumptionQty)
//                                             unallocatedConsumptionQty = list.length == 0 ? unallocatedConsumptionQty : unallocatedConsumptionQty = unallocatedConsumptionQty + parseInt(list[0].consumptionQty);
//                                         }
//                                     }
//                                     var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(dtstr).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(dtstr).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
//                                     console.log("--------------------------------------------------------------");
//                                     console.log("Start date", startDate);
//                                     for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua < batchDetailsForParticularPeriod.length; ua++) {
//                                         console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua].batchNo);
//                                         console.log("Unallocated consumption", unallocatedConsumptionQty);
//                                         var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua].batchNo);
//                                         if (parseInt(batchDetailsForParticularPeriod[ua].remainingQty) >= parseInt(unallocatedConsumptionQty)) {
//                                             myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua].remainingQty) - parseInt(unallocatedConsumptionQty);
//                                             unallocatedConsumptionQty = 0
//                                         } else {
//                                             var rq = batchDetailsForParticularPeriod[ua].remainingQty;
//                                             myArray[index].remainingQty = 0;
//                                             unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) - parseInt(rq);
//                                         }
//                                     }


//                                     var adjustmentQty = 0;
//                                     var unallocatedAdjustmentQty = 0;

//                                     var invlist = inventoryList.filter(c => c.inventoryDate === enddtStr)

//                                     for (var i = 0; i < programJson.regionList.length; i++) {

//                                         var list = invlist.filter(c => c.region.id == programJson.regionList[i].regionId)

//                                         for (var l = 0; l < list.length; l++) {

//                                             adjustmentQty += parseFloat((list[l].adjustmentQty * list[l].multiplier));
//                                             var qty1 = 0;
//                                             if (list[l].batchInfoList.length > 0) {
//                                                 for (var a = 0; a < list[l].batchInfoList.length; a++) {
//                                                     qty1 += parseFloat(parseInt((list[l].batchInfoList)[a].adjustmentQty) * list[l].multiplier);
//                                                 }
//                                             }
//                                             var remainingQty = parseFloat((list[l].adjustmentQty * list[l].multiplier)) - parseFloat(qty1);
//                                             unallocatedAdjustmentQty = parseFloat(remainingQty);
//                                             if (unallocatedAdjustmentQty < 0) {
//                                                 for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0; ua--) {
//                                                     console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
//                                                     console.log("Unallocated adjustments", unallocatedAdjustmentQty);
//                                                     var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua - 1].batchNo);
//                                                     if (parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty) > 0) {
//                                                         myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
//                                                         unallocatedAdjustmentQty = 0
//                                                     } else {
//                                                         var rq = batchDetailsForParticularPeriod[ua - 1].remainingQty;
//                                                         myArray[index].remainingQty = 0;
//                                                         unallocatedAdjustmentQty = parseInt(unallocatedAdjustmentQty) + parseInt(rq);
//                                                     }
//                                                 }
//                                             } else {
//                                                 if (batchDetailsForParticularPeriod.length > 0) {
//                                                     console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
//                                                     console.log("Unallocated adjustments", unallocatedAdjustmentQty);
//                                                     batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
//                                                     unallocatedAdjustmentQty = 0;


//                                                 }

//                                             }
//                                         }
//                                         var list1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
//                                         for (var j = 0; j < list1.length; j++) {
//                                             adjustmentQty += parseFloat((list1[j].adjustmentQty * list1[j].multiplier));
//                                             unallocatedAdjustmentQty = parseFloat((list1[j].adjustmentQty * list1[j].multiplier));
//                                             if (unallocatedAdjustmentQty < 0) {
//                                                 for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0; ua--) {
//                                                     console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
//                                                     console.log("Unallocated adjustments", unallocatedAdjustmentQty);
//                                                     var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua - 1].batchNo);
//                                                     if (parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty) > 0) {
//                                                         myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
//                                                         unallocatedAdjustmentQty = 0
//                                                     } else {
//                                                         var rq = batchDetailsForParticularPeriod[ua - 1].remainingQty;
//                                                         myArray[index].remainingQty = 0;
//                                                         unallocatedAdjustmentQty = parseInt(unallocatedAdjustmentQty) + parseInt(rq);
//                                                     }
//                                                 }
//                                             } else {
//                                                 if (batchDetailsForParticularPeriod.length > 0) {
//                                                     console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
//                                                     console.log("Unallocated adjustments", unallocatedAdjustmentQty);
//                                                     batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
//                                                     unallocatedAdjustmentQty = 0;
//                                                 }
//                                             }
//                                         }

//                                     }













//                                     var expiredStockArr = myArray;
//                                     console.log(openingBalance)
//                                     console.log(inventoryList)
//                                     var invlist = inventoryList.filter(c => c.inventoryDate === enddtStr)
//                                     var adjustment = 0;
//                                     invlist.map(ele => adjustment = adjustment + (ele.adjustmentQty * ele.multiplier));






//                                     var conlist = consumptionList.filter(c => c.consumptionDate === dt)
//                                     var consumption = 0;

//                                     console.log(programJson.regionList)
//                                     var actualFlag = false
//                                     for (var i = 0; i < programJson.regionList.length; i++) {

//                                         var list = conlist.filter(c => c.region.id == programJson.regionList[i].regionId)
//                                         console.log(list)
//                                         if (list.length > 1) {
//                                             for (var l = 0; l < list.length; l++) {
//                                                 if (list[l].actualFlag.toString() == 'true') {
//                                                     actualFlag = true;
//                                                     consumption = consumption + list[l].consumptionQty
//                                                 }
//                                             }
//                                         } else {
//                                             consumption = list.length == 0 ? consumption : consumption = consumption + parseInt(list[0].consumptionQty)
//                                         }
//                                     }













//                                     var shiplist = shipmentList.filter(c => c.expectedDeliveryDate >= dt && c.expectedDeliveryDate <= enddtStr)
//                                     var shipment = 0;
//                                     shiplist.map(ele => shipment = shipment + ele.shipmentQty);





//                                     var expiredStock = expiredStockArr.filter(c => ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(dtstr).format("YYYY-MM-DD"))) && ((moment(c.expiryDate).format("YYYY-MM-DD")) <= (moment(enddtStr).format("YYYY-MM-DD"))));
//                                     var expiredStockQty = 0;
//                                     for (var j = 0; j < expiredStock.length; j++) {
//                                         expiredStockQty += parseInt((expiredStock[j].remainingQty));
//                                     }




//                                     console.log('openingBalance', openingBalance, 'adjustment', adjustment, ' shipment', shipment, ' consumption', consumption)
//                                     var endingBalance = openingBalance + adjustment + shipment - consumption - expiredStockQty
//                                     console.log('endingBalance', endingBalance)


//                                     endingBalance = endingBalance < 0 ? 0 : endingBalance
//                                     openingBalance = endingBalance
//                                     minDate = minDate.add(1, 'month')

//                                     if (minDate.startOf('month').isAfter(startDate)) {
//                                         break;
//                                     }
//                                 }
//                                 var amcBeforeArray = [];
//                                 var amcAfterArray = [];


//                                 for (var c = 0; c < planningUnit.monthsInPastForAmc; c++) {

//                                     var month1MonthsBefore = moment(dt).subtract(c + 1, 'months').format("YYYY-MM-DD");
//                                     var consumptionListForAMC = consumptionList.filter(con => con.consumptionDate == month1MonthsBefore);
//                                     if (consumptionListForAMC.length > 0) {
//                                         var consumptionQty = 0;
//                                         for (var j = 0; j < consumptionListForAMC.length; j++) {
//                                             var count = 0;
//                                             for (var k = 0; k < consumptionListForAMC.length; k++) {
//                                                 if (consumptionListForAMC[j].consumptionDate == consumptionListForAMC[k].consumptionDate && consumptionListForAMC[j].region.id == consumptionListForAMC[k].region.id && j != k) {
//                                                     count++;
//                                                 } else {

//                                                 }
//                                             }

//                                             if (count == 0) {
//                                                 consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
//                                             } else {
//                                                 if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
//                                                     consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
//                                                 }
//                                             }
//                                         }
//                                         amcBeforeArray.push({ consumptionQty: consumptionQty, month: dtstr });
//                                         var amcArrayForMonth = amcBeforeArray.filter(c => c.month == dtstr);
//                                         /*if (amcArrayForMonth.length == programJson.monthsInPastForAmc) {
//                                             c = 12;
//                                         }*/
//                                     }
//                                 }
//                                 for (var c = 0; c < planningUnit.monthsInFutureForAmc; c++) {
//                                     var month1MonthsAfter = moment(dt).add(c, 'months').format("YYYY-MM-DD");
//                                     var consumptionListForAMC = consumptionList.filter(con => con.consumptionDate == month1MonthsAfter);
//                                     if (consumptionListForAMC.length > 0) {
//                                         var consumptionQty = 0;
//                                         for (var j = 0; j < consumptionListForAMC.length; j++) {
//                                             var count = 0;
//                                             for (var k = 0; k < consumptionListForAMC.length; k++) {
//                                                 if (consumptionListForAMC[j].consumptionDate == consumptionListForAMC[k].consumptionDate && consumptionListForAMC[j].region.id == consumptionListForAMC[k].region.id && j != k) {
//                                                     count++;
//                                                 } else {

//                                                 }
//                                             }

//                                             if (count == 0) {
//                                                 consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
//                                             } else {
//                                                 if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
//                                                     consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
//                                                 }
//                                             }
//                                         }
//                                         amcAfterArray.push({ consumptionQty: consumptionQty, month: dtstr });
//                                         amcArrayForMonth = amcAfterArray.filter(c => c.month == dtstr);
//                                         /* if (amcArrayForMonth.length == programJson.monthsInFutureForAmc) {
//                                              c = 12;
//                                          }*/
//                                     }

//                                 }

//                                 var amcArray = amcBeforeArray.concat(amcAfterArray);
//                                 var amcArrayFilteredForMonth = amcArray.filter(c => dtstr == c.month);
//                                 console.log('amcArrayFilteredForMonth' + JSON.stringify(amcArrayFilteredForMonth))
//                                 var countAMC = amcArrayFilteredForMonth.length;
//                                 var sumOfConsumptions = 0;
//                                 for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
//                                     sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
//                                 }


//                                 var amcCalcualted = 0;
//                                 var mos = 0;
//                                 if (countAMC > 0) {
//                                     amcCalcualted = Math.ceil((sumOfConsumptions) / countAMC);
//                                     console.log('amcCalcualted', amcCalcualted)
//                                     mos = endingBalance < 0 ? 0 / amcCalcualted : endingBalance / amcCalcualted
//                                 }
//                                 var maxForMonths = 0;
//                                 if (DEFAULT_MIN_MONTHS_OF_STOCK > planningUnit.minMonthsOfStock) {
//                                     maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
//                                 } else {
//                                     maxForMonths = planningUnit.minMonthsOfStock
//                                 }
//                                 var minMOS = maxForMonths;
//                                 var minForMonths = 0;
//                                 if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + planningUnit.reorderFrequencyInMonths)) {
//                                     minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
//                                 } else {
//                                     minForMonths = (maxForMonths + planningUnit.reorderFrequencyInMonths);
//                                 }
//                                 var maxMOS = minForMonths;

//                                 var json = {
//                                     planningUnit: planningUnit.planningUnit,
//                                     lastStockCount: maxDate == '' ? '' : maxDate.format('MMM-DD-YYYY'),
//                                     mos: this.roundN(mos),//planningUnit.planningUnit.id==157?12:planningUnit.planningUnit.id==156?6:mos),
//                                     minMos: minMOS,
//                                     maxMos: maxMOS,
//                                     stock: endingBalance,
//                                     amc: amcCalcualted
//                                 }
//                                 data.push(json)



//                             })
//                             this.setState({
//                                 data: data,
//                                 message: ''
//                             }, () => { console.log(this.state.data) })
//                         }.bind(this)

//                     }.bind(this)
//                 }.bind(this)















//             } else {
//                 var inputjson = {
//                     "programId": programId,
//                     "versionId": versionId,
//                     "dt": startDate.startOf('month').format('YYYY-MM-DD'),
//                     "includePlannedShipments": includePlanningShipments ? 1 : 0

//                 }
//                 /*  this.setState({
//                       data: [{
//                           planningUnit: {
//                               id: 157, label: {
//                                   active: false,
//                                   labelId: 9117,
//                                   label_en: "Abacavir 60 mg Tablet, 60 Tablets",
//                                   label_sp: null,
//                                   label_fr: null,
//                                   label_pr: null
//                               }
//                           },
//                           transDate: moment(new Date()).format('MMM-DD-YYYY'),
//                           mos: this.roundN(2),//planningUnit.planningUnit.id==157?12:planningUnit.planningUnit.id==156?6:mos),
//                           min: 3,
//                           max: 5,
//                           stock: 44103,
//                           amc: 23957
//                       }]
//                   })*/
//                 AuthenticationService.setupAxiosInterceptors();
//                 ReportService.stockStatusForProgram(inputjson)
//                     .then(response => {
//                         console.log(JSON.stringify(response.data));
//                         this.setState({
//                             data: response.data, message: ''
//                         })
//                     }).catch(
//                         error => {
//                             this.setState({
//                                 data: []
//                             })

//                             if (error.message === "Network Error") {
//                                 this.setState({ message: error.message });
//                             } else {
//                                 switch (error.response ? error.response.status : "") {
//                                     case 500:
//                                     case 401:
//                                     case 404:
//                                     case 406:
//                                     case 412:
//                                         this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
//                                         break;
//                                     default:
//                                         this.setState({ message: 'static.unkownError' });
//                                         break;
//                                 }
//                             }
//                         }
//                     );
//             }
//         } else if (programId == 0) {
//             this.setState({ message: i18n.t('static.common.selectProgram'), data: [] });

//         } else if (versionId == 0) {
//             this.setState({ message: i18n.t('static.program.validversion'), data: [] });

//         }
//     }





//     render() {
//         const { singleValue2 } = this.state

//         const { programs } = this.state;
//         let programList = programs.length > 0
//             && programs.map((item, i) => {
//                 return (
//                     <option key={i} value={item.programId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const { versions } = this.state;
//         let versionList = versions.length > 0
//             && versions.map((item, i) => {
//                 return (
//                     <option key={i} value={item.versionId}>
//                         {item.versionId}
//                     </option>
//                 )
//             }, this);


//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );

//         const columns = [

//             {
//                 dataField: 'planningUnit.label',
//                 text: 'Planning Unit',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 style: { align: 'center', width: '350px' },
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'mos',
//                 text: i18n.t('static.report.withinstock'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cell, row) => {
//                     if (cell < row.minMos) {
//                         return i18n.t('static.report.low')
//                     } else if (cell > row.maxMos) {
//                         return i18n.t('static.report.excess')
//                     } else {
//                         return i18n.t('static.report.ok')
//                     }
//                 }
//                 ,
//                 style: function callback(cell, row, rowIndex, colIndex) {
//                     if (cell < row.minMos) {
//                         return { backgroundColor: '#f48282', align: 'center', width: '100px' };
//                     } else if (cell > row.maxMos) {
//                         return { backgroundColor: '#f3d679', align: 'center', width: '100px' };
//                     } else {
//                         return { backgroundColor: '#00c596', align: 'center', width: '100px' };
//                     }
//                 }
//             },
//             {
//                 dataField: 'mos',
//                 text: i18n.t('static.report.mos'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatterDouble,
//                 style: function callback(cell, row, rowIndex, colIndex) {
//                     if (cell < row.minMos) {
//                         return { backgroundColor: '#f48282', align: 'center', width: '100px' };
//                     } else if (cell > row.maxMos) {
//                         return { backgroundColor: '#f3d679', align: 'center', width: '100px' };
//                     } else {
//                         return { backgroundColor: '#00c596', align: 'center', width: '100px' };
//                     }
//                 }
//             },
//             {
//                 dataField: 'minMos',
//                 text: i18n.t('static.supplyPlan.minStockMos'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 style: { align: 'center', width: '100px' },
//                 formatter: this.formatterDouble


//             },
//             {
//                 dataField: 'maxMos',
//                 text: i18n.t('static.supplyPlan.maxStockMos'),
//                 sort: true,
//                 align: 'center',
//                 style: { align: 'center', width: '100px' },
//                 headerAlign: 'center',
//                 formatter: this.formatterDouble
//             }
//             ,
//             {
//                 dataField: 'stock',
//                 text: i18n.t('static.report.stock'),
//                 sort: true,
//                 align: 'center',
//                 style: { align: 'center', width: '100px' },
//                 headerAlign: 'center',
//                 formatter: this.formatter
//             }
//             ,
//             {
//                 dataField: 'amc',
//                 text: i18n.t('static.report.amc'),
//                 sort: true,
//                 align: 'center',
//                 style: { align: 'center', width: '100px' },
//                 headerAlign: 'center',
//                 formatter: this.formatter
//             },
//             {
//                 dataField: 'lastStockCount',
//                 text: i18n.t('static.supplyPlan.lastinventorydt'),
//                 sort: true,
//                 align: 'center',
//                 style: { align: 'center', width: '100px' },
//                 headerAlign: 'center',
//                 formatter: this.formatterDate

//             }
//         ];
//         const options = {
//             hidePageListOnlyOnePage: true,
//             firstPageText: i18n.t('static.common.first'),
//             prePageText: i18n.t('static.common.back'),
//             nextPageText: i18n.t('static.common.next'),
//             lastPageText: i18n.t('static.common.last'),
//             nextPageTitle: i18n.t('static.common.firstPage'),
//             prePageTitle: i18n.t('static.common.prevPage'),
//             firstPageTitle: i18n.t('static.common.nextPage'),
//             lastPageTitle: i18n.t('static.common.lastPage'),
//             showTotal: true,
//             paginationTotalRenderer: customTotal,
//             disablePageTitle: true,
//             sizePerPageList: [{
//                 text: '10', value: 10
//             }, {
//                 text: '30', value: 30
//             }
//                 ,
//             {
//                 text: '50', value: 50
//             },
//             {
//                 text: 'All', value: this.state.data.length
//             }]
//         }
//         return (
//             <div className="animated fadeIn" >
//                 <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
//                 <h5 className="red">{i18n.t(this.state.message)}</h5>

//                 <Card>
//                     <div className="Card-header-reporticon">
//                         {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.stockstatusacrossplanningunit')}</strong> */}

//                         <div className="card-header-actions">

//                             <a className="card-header-action">
//                                 {this.state.data.length > 0 && <div className="card-header-actions">
//                                     <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
//                                     <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
//                                 </div>}
//                             </a>
//                         </div>
//                     </div>
//                     <CardBody className="pb-lg-2 pt-lg-0 CardBodyTop">
//                         <div className="TableCust" >
//                             <div ref={ref}>

//                                 <Form >
//                                     <Col md="12 pl-0">
//                                         <div className="row">

//                                             <FormGroup className="col-md-3">
//                                                 <Label htmlFor="appendedInputButton">{i18n.t('static.report.month')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
//                                                 <div className="controls edit">
//                                                     <Picker
//                                                         ref="pickAMonth2"
//                                                         years={{ min: { year: 2010, month: 1 }, max: { year: 2021, month: 12 } }}
//                                                         value={singleValue2}
//                                                         lang={pickerLang.months}
//                                                         theme="dark"
//                                                         onChange={this.handleAMonthChange2}
//                                                         onDismiss={this.handleAMonthDissmis2}
//                                                     >
//                                                         <MonthBox value={this.makeText(singleValue2)} onClick={this.handleClickMonthBox2} />
//                                                     </Picker>
//                                                 </div>

//                                             </FormGroup>

//                                             <FormGroup className="col-md-3">
//                                                 <Label htmlFor="appendedInputButton">Program</Label>
//                                                 <div className="controls ">
//                                                     <InputGroup>
//                                                         <Input
//                                                             type="select"
//                                                             name="programId"
//                                                             id="programId"
//                                                             bsSize="sm"
//                                                             onChange={(e) => { this.filterVersion(); this.fetchData() }}
//                                                         >
//                                                             <option value="0">{i18n.t('static.common.select')}</option>
//                                                             {programList}
//                                                         </Input>

//                                                     </InputGroup>
//                                                 </div>
//                                             </FormGroup>
//                                             <FormGroup className="col-md-3">
//                                                 <Label htmlFor="appendedInputButton">Version</Label>
//                                                 <div className="controls ">
//                                                     <InputGroup>
//                                                         <Input
//                                                             type="select"
//                                                             name="versionId"
//                                                             id="versionId"
//                                                             bsSize="sm"
//                                                             onChange={(e) => { this.fetchData() }}
//                                                         >
//                                                             <option value="0">{i18n.t('static.common.select')}</option>
//                                                             {versionList}
//                                                         </Input>

//                                                     </InputGroup>
//                                                 </div>
//                                             </FormGroup>
//                                             <FormGroup className="col-md-3">
//                                                 <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label>
//                                                 <div className="controls ">
//                                                     <InputGroup>
//                                                         <Input
//                                                             type="select"
//                                                             name="includePlanningShipments"
//                                                             id="includePlanningShipments"
//                                                             bsSize="sm"
//                                                             onChange={(e) => { this.fetchData() }}
//                                                         >
//                                                             <option value="true">{i18n.t('static.program.yes')}</option>
//                                                             <option value="false">{i18n.t('static.program.no')}</option>
//                                                         </Input>

//                                                     </InputGroup>
//                                                 </div>
//                                             </FormGroup>


//                                         </div>
//                                     </Col>
//                                 </Form>
//                             </div>
//                         </div>
//                         {this.state.data.length > 0 && <ToolkitProvider
//                             keyField="planningUnitId"
//                             data={this.state.data}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (
//                                     <div className="TableCust">
//                                         <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">

//                                         </div>
//                                         <BootstrapTable
//                                             hover
//                                             striped
//                                             // tabIndexCell
//                                             pagination={paginationFactory(options)}

//                                             {...props.baseProps}
//                                         />
//                                     </div>
//                                 )
//                             }
//                         </ToolkitProvider>}


//                     </CardBody>
//                 </Card>

//             </div >

//         );
//     }


// }

// export default StockStatusAcrossPlanningUnits;

import React, { Component } from 'react';
import { Card, CardHeader, Form, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import i18n from '../../i18n'
import RegionService from "../../api/RegionService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService.js";

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png';
import Picker from 'react-month-picker';
import MonthBox from '../../CommonComponent/MonthBox.js';
import ProgramService from '../../api/ProgramService';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, DATE_FORMAT_CAP, FIRST_DATA_ENTRY_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ProductService from '../../api/ProductService';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import moment from 'moment';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LOGO } from '../../CommonComponent/Logo.js';
import ReportService from '../../api/ReportService';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';

const ref = React.createRef();
export const DEFAULT_MIN_MONTHS_OF_STOCK = 3
export const DEFAULT_MAX_MONTHS_OF_STOCK = 18

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

const legendcolor = [
{ text: "Excess stock", color: '#f48521' },
{ text: "Low stock", color: '#edb944' },
{ text: "Okay", color: '#118b70' }];

class StockStatusAcrossPlanningUnits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            programs: [],
            versions: [],
            planningUnits: [],
            data: [],
            lang: localStorage.getItem('lang'),
            loading: true,
            singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },

        }
        this.buildJExcel = this.buildJExcel.bind(this);
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }



    exportCSV = (columns) => {

        var csvRow = [];
        csvRow.push((i18n.t('static.report.month') + ' , ' + this.makeText(this.state.singleValue2)).replaceAll(' ', '%20'))
        csvRow.push((i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20')))
        csvRow.push((i18n.t('static.report.version') + ' , ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push((i18n.t('static.program.isincludeplannedshipment') + ' , ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')
        var re;

        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });

        var A = [headers]
        this.state.data.map(ele => A.push([(getLabelText(ele.planningUnit.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), (ele.mos < ele.minMos ? i18n.t('static.report.low') : (ele.mos > ele.maxMos ? i18n.t('static.report.excess') : i18n.t('static.report.ok'))).replaceAll(' ', '%20'), this.roundN(ele.mos), ele.minMos, ele.maxMos, ele.stock, this.round(ele.amc),ele.lastStockCount!=null?(new moment(ele.lastStockCount).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20'):'']));

        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.stockstatusacrossplanningunit') + ".csv"
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
                doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
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
                doc.text(i18n.t('static.dashboard.stockstatusacrossplanningunit'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.report.month') + ' : ' + this.makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
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

        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        const headers = columns.map((item, idx) => (item.text));
        const data = this.state.data.map(ele => [getLabelText(ele.planningUnit.label), (ele.mos < ele.minMos ? i18n.t('static.report.low') : (ele.mos > ele.maxMos ? i18n.t('static.report.excess') : i18n.t('static.report.ok'))), this.formatterDouble(ele.mos), this.formatterDouble(ele.minMos), this.formatterDouble(ele.maxMos), this.formatter(ele.stock), this.formatter(ele.amc),ele.lastStockCount!=null? new moment(ele.lastStockCount).format(`${DATE_FORMAT_CAP}`):''  ]);

        let content = {
            margin: { top: 80, bottom: 50 },
            startY: 170,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 75 },
            columnStyles: {
                0: { cellWidth: 236.89 },
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.stockstatusacrossplanningunit') + ".pdf")
    }


    getPrograms = () => {
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            let realmId = AuthenticationService.getRealmId();
            ProgramService.getProgramByRealmId(realmId)
                .then(response => {
                    console.log(JSON.stringify(response.data))
                    this.setState({
                        programs: response.data, loading: false
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: [], loading: false
                        }, () => { this.consolidatedProgramList() })
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message, loading: false });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }), loading: false });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError', loading: false });
                                    break;
                            }
                        }
                    }
                );

        } else {
            console.log('offline')
            this.consolidatedProgramList()
            this.setState({ loading: false })
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
                if (navigator.onLine) {
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

    roundN = num => {
        return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
    }
    round = num => {
        return parseFloat(Math.round(num * Math.pow(10, 0)) / Math.pow(10, 0)).toFixed(0);
    }

    formatLabel = (cell, row) => {
        // console.log("celll----", cell);
        if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
        }
    }

    formatterDate = (cell, row) => {
        // console.log("celll----", cell);
        if (cell != null && cell != "") {
            return moment(cell).format(`${DATE_FORMAT_CAP}`);
        }
    }
    formatter = value => {

        var cell1 = this.round(value)
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
    formatterDouble = value => {

        var cell1 = this.roundN(value)
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
    style = (cell, row) => {
        if (cell < row.minMOS) {
            return { align: 'center', color: 'red' }
        }
    }

    handleClickMonthBox2 = (e) => {
        this.refs.pickAMonth2.show()
    }
    handleAMonthChange2 = (value, text) => {
        //
        //
    }
    handleAMonthDissmis2 = (value) => {
        this.setState({ singleValue2: value, }, () => {
            this.fetchData();
        })

    }

    componentDidMount() {
        this.getPrograms()
    }

    buildJExcel() {
        let dataStockStatus = this.state.data;
        // console.log("dataStockStatus---->", dataStockStatus);
        let dataArray = [];
        let count = 0;

        for (var j = 0; j < dataStockStatus.length; j++) {
            let data1 = '';
            if (dataStockStatus[j].mos < dataStockStatus[j].minMos) {
                data1 = i18n.t('static.report.low')
            } else if (dataStockStatus[j].mos > dataStockStatus[j].maxMos) {
                data1 = i18n.t('static.report.excess')
            } else {
                data1 = i18n.t('static.report.ok')
            }

            data = [];
            data[0] = getLabelText(dataStockStatus[j].planningUnit.label, this.state.lang)
            data[1] = data1;
            data[2] = this.formatterDouble(dataStockStatus[j].mos);
            data[3] = this.formatterDouble(dataStockStatus[j].minMos);
            data[4] = this.formatterDouble(dataStockStatus[j].maxMos);
            data[5] = this.formatter(dataStockStatus[j].stock);
            data[6] = this.formatter(dataStockStatus[j].amc);
            data[7] = (dataStockStatus[j].lastStockCount ? moment(dataStockStatus[j].lastStockCount).format(`${DATE_FORMAT_CAP}`) : null);

            dataArray[count] = data;
            count++;
        }
        // if (dataStockStatus.length == 0) {
        //     data = [];
        //     dataArray[0] = data;
        // }
        // console.log("dataArray---->", dataArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = dataArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.dashboard.planningunit'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.withinstock'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.mos'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.supplyPlan.minStockMos'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.supplyPlan.maxStockMos'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.stock'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.report.amc'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.supplyPlan.lastinventorydt'),
                    type: 'text',
                },
            ],
            editable: false,
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
                show: '',
                entries: '',
            },

            updateTable: function (el, cell, x, y, source, value, id) {

                var elInstance = el.jexcel;
                var colArrB = ['B','C'];
                var colArrC = ['C'];
                var colArrD = ['D'];
                var colArrE = ['E'];
                var rowData = elInstance.getRowData(y);

                var mos = parseFloat(rowData[2]);
                var minMos = parseFloat(rowData[3]);
                var maxMos = parseFloat(rowData[4]);
                //------------B--------------
                if (mos < minMos) {
                    console.log('1')
                    for (var i = 0; i < colArrB.length; i++) {
                        elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                        elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'background-color', legendcolor[1].color);
                        let textColor = contrast(legendcolor[1].color);
                        elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'color', textColor);
                    }
                } else if (mos > maxMos) {
                    console.log('2')
                    for (var i = 0; i < colArrB.length; i++) {
                        elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                        elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'background-color', legendcolor[0].color);
                        let textColor = contrast(legendcolor[0].color);
                        elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'color', textColor);
                    }
                } else {
                    console.log('3')
                    for (var i = 0; i < colArrB.length; i++) {
                    elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                    elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'background-color',legendcolor[2].color);
                    let textColor = contrast(legendcolor[2].color);
                    elInstance.setStyle(`${colArrB[i]}${parseInt(y) + 1}`, 'color', textColor);
                    }
                }

                // //-------------C----------------
                // if (mos < minMos) {
                //     for (var i = 0; i < colArrC.length; i++) {
                //         elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                //         elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'background-color', '#f48282');
                //         let textColor = contrast('#f48282');
                //         elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'color', textColor);
                //     }
                // } else if (mos > maxMos) {
                //     for (var i = 0; i < colArrC.length; i++) {
                //         elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                //         elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'background-color', '#f3d679');
                //         let textColor = contrast('#f3d679');
                //         elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'color', textColor);
                //     }
                // } else {
                //     elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                //     elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'background-color', '#00c596');
                //     let textColor = contrast('#00c596');
                //     elInstance.setStyle(`${colArrC[i]}${parseInt(y) + 1}`, 'color', textColor);
                // }

                // //-------------D----------------
                // if (mos < minMos) {
                //     for (var i = 0; i < colArrD.length; i++) {
                //         elInstance.setStyle(`${colArrD[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                //         elInstance.setStyle(`${colArrD[i]}${parseInt(y) + 1}`, 'background-color', '#f48282');
                //     }
                // } else {
                //     elInstance.setStyle(`${colArrD[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                // }

                // //-------------E----------------
                // if (mos < minMos) {
                //     for (var i = 0; i < colArrE.length; i++) {
                //         elInstance.setStyle(`${colArrE[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                //         elInstance.setStyle(`${colArrE[i]}${parseInt(y) + 1}`, 'background-color', '#f48282');
                //     }
                // } else {
                //     elInstance.setStyle(`${colArrE[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
                // }



            }.bind(this),

            onload: this.loaded,
            pagination: 10,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,


            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: [10, 25, 50],
            position: 'top',
            contextMenu: false,
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }



    fetchData = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let startDate = moment(new Date(this.state.singleValue2.year, this.state.singleValue2.month - 1, 1));
        let endDate = moment(new Date(this.state.singleValue2.year, this.state.singleValue2.month - 1, new Date(this.state.singleValue2.year, this.state.singleValue2.month, 0).getDate()));
        let includePlanningShipments = document.getElementById("includePlanningShipments").value
        if (programId != 0 && versionId != 0) {
            if (versionId.includes('Local')) {


                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;

                    var transaction = db1.transaction(['programData'], 'readwrite');
                    var programTransaction = transaction.objectStore('programData');
                    var version = (versionId.split('(')[0]).trim()
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    var program = `${programId}_v${version}_uId_${userId}`
                    var data = [];
                    var programRequest = programTransaction.get(program);

                    programRequest.onsuccess = function (event) {
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);

                        var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                        var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                        var planningunitRequest = planningunitOs.getAll();
                        var planningList = []
                        planningunitRequest.onerror = function (event) {
                            // Handle errors!
                        };
                        planningunitRequest.onsuccess = function (e) {
                            // this.setState({ loading: true })
                            var myResult = [];
                            myResult = planningunitRequest.result;
                            var programId = (document.getElementById("programId").value).split("_")[0];
                            var proList = []
                            console.log(myResult)
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program.id == programId) {

                                    proList[i] = myResult[i]
                                }
                            }
                            
                            proList.map(planningUnit => {

                               var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnit.planningUnit.id);
                                let moments = (inventoryList.filter(c => moment(c.inventoryDate).isBefore(endDate) || moment(c.inventoryDate).isSame(endDate))).map(d => moment(d.inventoryDate))
                                var maxDate = moments.length > 0 ? moment.max(moments) : ''
                                var dtstr = startDate.startOf('month').format('YYYY-MM-DD')
                                var list = programJson.supplyPlan.filter(c => c.planningUnitId == planningUnit.planningUnit.id && c.transDate == dtstr)
                                if (list.length > 0) {
                                var json = {
                                    planningUnit: planningUnit.planningUnit,
                                    lastStockCount: maxDate == '' ? '' : maxDate.format('MMM-DD-YYYY'),
                                    mos: includePlanningShipments == true ?this.roundN(list[0].mos): (list[0].amc > 0)?(list[0].closingBalanceWps /list[0].amc):0,//planningUnit.planningUnit.id==157?12:planningUnit.planningUnit.id==156?6:mos),
                                    minMos: list[0].minStockMoS,
                                    maxMos:  list[0].maxStockMoS,
                                    stock: includePlanningShipments == true ?list[0].closingBalance:list[0].closingBalanceWps,
                                    amc: list[0].amc
                                }
                                data.push(json)

                            }else{
                                var json = {
                                    planningUnit: planningUnit.planningUnit,
                                    lastStockCount: maxDate == '' ? '' : maxDate.format('MMM-DD-YYYY'),
                                    mos: '',
                                    minMos: '',
                                    maxMos: '',
                                    stock: 0,
                                    amc: 0
                                }
                                data.push(json) 
                            }

                            })
                            console.log(data)
                            this.setState({
                                data: data,
                                message: ''
                            }, () => {
                                this.buildJExcel();
                            });
                        }.bind(this)

                    }.bind(this)
                }.bind(this)















            } else {
                var inputjson = {
                    "programId": programId,
                    "versionId": versionId,
                    "dt": startDate.startOf('month').format('YYYY-MM-DD'),
                    "includePlannedShipments": includePlanningShipments ? 1 : 0

                }
                /*  this.setState({
                      data: [{
                          planningUnit: {
                              id: 157, label: {
                                  active: false,
                                  labelId: 9117,
                                  label_en: "Abacavir 60 mg Tablet, 60 Tablets",
                                  label_sp: null,
                                  label_fr: null,
                                  label_pr: null
                              }
                          },
                          transDate: moment(new Date()).format('MMM-DD-YYYY'),
                          mos: this.roundN(2),//planningUnit.planningUnit.id==157?12:planningUnit.planningUnit.id==156?6:mos),
                          min: 3,
                          max: 5,
                          stock: 44103,
                          amc: 23957
                      }]
                  })*/
                AuthenticationService.setupAxiosInterceptors();
                ReportService.stockStatusForProgram(inputjson)
                    .then(response => {
                        console.log(JSON.stringify(response.data));
                        this.setState({
                            data: response.data, message: ''
                        }, () => {
                            this.buildJExcel();
                        });
                    }).catch(
                        error => {
                            this.setState({
                                data: [], loading: false
                            }, () => {
                                this.el = jexcel(document.getElementById("tableDiv"), '');
                                this.el.destroy();
                                // this.buildJExcel();
                            });

                            if (error.message === "Network Error") {
                                this.setState({ message: error.message, loading: false });
                            } else {
                                switch (error.response ? error.response.status : "") {
                                    case 500:
                                    case 401:
                                    case 404:
                                    case 406:
                                    case 412:
                                        this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }), loading: false });
                                        break;
                                    default:
                                        this.setState({ message: 'static.unkownError', loading: false });
                                        break;
                                }
                            }
                        }
                    );
            }
        } else if (programId == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), data: [] }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
                // this.buildJExcel();
            });

        } else if (versionId == 0) {
            this.setState({ message: i18n.t('static.program.validversion'), data: [] }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
                // this.buildJExcel();
            });

        }
    }





    render() {
        const { singleValue2 } = this.state

        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {item.versionId}
                    </option>
                )
            }, this);


        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [

            {
                dataField: 'planningUnit.label',
                text: 'Planning Unit',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '350px' },
                formatter: this.formatLabel
            },
            {
                dataField: 'mos',
                text: i18n.t('static.report.withinstock'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    if (cell < row.minMos) {
                        return i18n.t('static.report.low')
                    } else if (cell > row.maxMos) {
                        return i18n.t('static.report.excess')
                    } else {
                        return i18n.t('static.report.ok')
                    }
                }
                ,
                style: function callback(cell, row, rowIndex, colIndex) {
                    if (cell < row.minMos) {
                        return { backgroundColor: '#f48282', align: 'center', width: '100px' };
                    } else if (cell > row.maxMos) {
                        return { backgroundColor: '#f3d679', align: 'center', width: '100px' };
                    } else {
                        return { backgroundColor: '#00c596', align: 'center', width: '100px' };
                    }
                }
            },
            {
                dataField: 'mos',
                text: i18n.t('static.report.mos'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatterDouble,
                style: function callback(cell, row, rowIndex, colIndex) {
                    if (cell < row.minMos) {
                        return { backgroundColor: '#f48282', align: 'center', width: '100px' };
                    } else if (cell > row.maxMos) {
                        return { backgroundColor: '#f3d679', align: 'center', width: '100px' };
                    } else {
                        return { backgroundColor: '#00c596', align: 'center', width: '100px' };
                    }
                }
            },
            {
                dataField: 'minMos',
                text: i18n.t('static.supplyPlan.minStockMos'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '100px' },
                formatter: this.formatterDouble


            },
            {
                dataField: 'maxMos',
                text: i18n.t('static.supplyPlan.maxStockMos'),
                sort: true,
                align: 'center',
                style: { align: 'center', width: '100px' },
                headerAlign: 'center',
                formatter: this.formatterDouble
            }
            ,
            {
                dataField: 'stock',
                text: i18n.t('static.report.stock'),
                sort: true,
                align: 'center',
                style: { align: 'center', width: '100px' },
                headerAlign: 'center',
                formatter: this.formatter
            }
            ,
            {
                dataField: 'amc',
                text: i18n.t('static.report.amc'),
                sort: true,
                align: 'center',
                style: { align: 'center', width: '100px' },
                headerAlign: 'center',
                formatter: this.formatter
            },
            {
                dataField: 'lastStockCount',
                text: i18n.t('static.supplyPlan.lastinventorydt'),
                sort: true,
                align: 'center',
                style: { align: 'center', width: '100px' },
                headerAlign: 'center',
                formatter: this.formatterDate

            }
        ];
        const options = {
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
                text: 'All', value: this.state.data.length
            }]
        }
        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <SupplyPlanFormulas ref="formulaeChild" />
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-reporticon pb-2">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.stockstatusacrossplanningunit')}</strong> */}

                        <div className="card-header-actions">
                        <a className="card-header-action">
                                 <span style={{cursor: 'pointer'}} onClick={() => { this.refs.formulaeChild.toggleStockStatusAcrossPlaningUnit() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                                 </a>
                            <a className="card-header-action">
                                {this.state.data.length > 0 && <div className="card-header-actions">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                                </div>}
                            </a>
                        </div>
                    </div>
                    <CardBody className="pb-lg-5 pt-lg-0 ">
                        <div className="TableCust" >
                            <div ref={ref}>

                                <Form >
                                    <div className="pl-0">
                                        <div className="row">

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.month')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                <div className="controls edit">
                                                    <Picker
                                                        ref="pickAMonth2"
                                                        years={{ min: { year: 2010, month: 1 }, max: { year: 2021, month: 12 } }}
                                                        value={singleValue2}
                                                        lang={pickerLang.months}
                                                        theme="dark"
                                                        onChange={this.handleAMonthChange2}
                                                        onDismiss={this.handleAMonthDissmis2}
                                                    >
                                                        <MonthBox value={this.makeText(singleValue2)} onClick={this.handleClickMonthBox2} />
                                                    </Picker>
                                                </div>

                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Program</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.filterVersion(); this.fetchData() }}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {programList}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Version</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="versionId"
                                                            id="versionId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.fetchData() }}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {versionList}
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
                                            <FormGroup className="col-md-10 mt-2 " style={{ display: this.state.display }}>
                      <ul className="legendcommitversion list-group">
                        {
                          legendcolor.map(item1 => (
                            <li><span className="legendcolor" style={{ backgroundColor: item1.color }}></span> <span className="legendcommitversionText">{item1.text}</span></li>
                          ))
                        }
                      </ul>
                    </FormGroup>


                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </div>
                        {/* {this.state.data.length > 0 && <ToolkitProvider
                            keyField="planningUnitId"
                            data={this.state.data}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (
                                    <div className="TableCust">
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">

                                        </div>
                                        <BootstrapTable
                                            hover
                                            striped
                                            // tabIndexCell
                                            pagination={paginationFactory(options)}

                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>}
 */}
                    <div className="ReportSearchMarginTop">
                        <div id="tableDiv" className="jexcelremoveReadonlybackground ">
                        </div>
                    </div>
                    </CardBody>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>

            </div >

        );
    }


}

export default StockStatusAcrossPlanningUnits;

