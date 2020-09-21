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
// import CryptoJS from 'crypto-js'
// import { SECRET_KEY } from '../../Constants.js'
// import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
// import ProductService from '../../api/ProductService';
// import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
// import moment from 'moment';
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import { LOGO } from '../../CommonComponent/Logo.js';
// import ReportService from '../../api/ReportService';
// import ProcurementAgentService from "../../api/ProcurementAgentService";
// import { Online, Offline } from "react-detect-offline";
// import FundingSourceService from '../../api/FundingSourceService';
// import MultiSelect from 'react-multi-select-component';

// const pickerLang = {
//     months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
//     from: 'From', to: 'To',
// }



// class ProcurementAgentExport extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             regionList: [],
//             message: '',
//             selRegion: [],
//             realmCountryList: [],
//             procurementAgents: [],
//             fundingSources: [],
//             viewby: '',
//             programs: [],
//             versions: [],
//             planningUnits: [],
//             planningUnitValues: [],
//             planningUnitLabels: [],
//             data: [],
//             lang: localStorage.getItem('lang'),
//             rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
//             loading: false
//         }
//         this.formatLabel = this.formatLabel.bind(this);
//         this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
//         this.handleRangeChange = this.handleRangeChange.bind(this);
//         this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
//     }

//     makeText = m => {
//         if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
//         return '?'
//     }

//     getPrograms = () => {
//         if (navigator.onLine) {
//             AuthenticationService.setupAxiosInterceptors();
//             let realmId = AuthenticationService.getRealmId();
//             ProgramService.getProgramByRealmId(realmId)
//                 .then(response => {
//                     // console.log(JSON.stringify(response.data))
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

//     getProcurementAgent = () => {
//         if (navigator.onLine) {
//             AuthenticationService.setupAxiosInterceptors();
//             ProcurementAgentService.getProcurementAgentListAll()
//                 .then(response => {
//                     // console.log(JSON.stringify(response.data))
//                     this.setState({
//                         procurementAgents: response.data
//                     }, () => { this.consolidatedProcurementAgentList() })
//                 }).catch(
//                     error => {
//                         this.setState({
//                             procurementAgents: []
//                         }, () => { this.consolidatedProcurementAgentList() })
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
//             this.consolidatedProcurementAgentList()
//         }

//     }

//     consolidatedProcurementAgentList = () => {
//         const lan = 'en';
//         const { procurementAgents } = this.state
//         var proList = procurementAgents;

//         var db1;
//         getDatabase();
//         var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
//         openRequest.onsuccess = function (e) {
//             db1 = e.target.result;
//             var transaction = db1.transaction(['procurementAgent'], 'readwrite');
//             var procuremntAgent = transaction.objectStore('procurementAgent');
//             var getRequest = procuremntAgent.getAll();

//             getRequest.onerror = function (event) {
//                 // Handle errors!
//             };
//             getRequest.onsuccess = function (event) {
//                 var myResult = [];
//                 myResult = getRequest.result;
//                 var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//                 var userId = userBytes.toString(CryptoJS.enc.Utf8);
//                 // console.log("ProcurementAgentMyResult------>>>>", myResult);
//                 for (var i = 0; i < myResult.length; i++) {

//                     // var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
//                     // var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
//                     // console.log(programNameLabel);

//                     // var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
//                     // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))


//                     var f = 0
//                     for (var k = 0; k < this.state.procurementAgents.length; k++) {
//                         if (this.state.procurementAgents[k].procurementAgentId == myResult[i].procurementAgentId) {
//                             f = 1;
//                             console.log('already exist')
//                         }
//                     }
//                     var programData = myResult[i];
//                     if (f == 0) {
//                         proList.push(programData)
//                     }

//                 }

//                 this.setState({
//                     procurementAgents: proList
//                 })

//             }.bind(this);

//         }.bind(this);
//     }


//     filterVersion = () => {
//         // document.getElementById("planningUnitId").checked = false;
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
//         this.fetchData();
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

//     getPlanningUnit = () => {
//         let programId = document.getElementById("programId").value;
//         let versionId = document.getElementById("versionId").value;
//         this.setState({
//             planningUnits: [],
//             planningUnitLabels:[],
//             planningUnitValues:[]
//         }, () => {
//             if (versionId.includes('Local')) {
//                 const lan = 'en';
//                 var db1;
//                 var storeOS;
//                 getDatabase();
//                 var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
//                 openRequest.onsuccess = function (e) {
//                     db1 = e.target.result;
//                     var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
//                     var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
//                     var planningunitRequest = planningunitOs.getAll();
//                     var planningList = []
//                     planningunitRequest.onerror = function (event) {
//                         // Handle errors!
//                     };
//                     planningunitRequest.onsuccess = function (e) {
//                         var myResult = [];
//                         myResult = planningunitRequest.result;
//                         var programId = (document.getElementById("programId").value).split("_")[0];
//                         var proList = []
//                         // console.log(myResult)
//                         for (var i = 0; i < myResult.length; i++) {
//                             if (myResult[i].program.id == programId) {

//                                 proList[i] = myResult[i]
//                             }
//                         }
//                         this.setState({
//                             planningUnits: proList, message: ''
//                         }, () => {
//                             this.fetchData();
//                         })
//                     }.bind(this);
//                 }.bind(this)


//             }
//             else {
//                 AuthenticationService.setupAxiosInterceptors();

//                 //let productCategoryId = document.getElementById("productCategoryId").value;
//                 ProgramService.getProgramPlaningUnitListByProgramId(programId).then(response => {
//                     // console.log('**' + JSON.stringify(response.data))
//                     this.setState({
//                         planningUnits: response.data, message: ''
//                     }, () => {
//                         this.fetchData();
//                     })
//                 })
//                     .catch(
//                         error => {
//                             this.setState({
//                                 planningUnits: [],
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
//                                         this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }) });
//                                         break;
//                                     default:
//                                         this.setState({ message: 'static.unkownError' });
//                                         break;
//                                 }
//                             }
//                         }
//                     );
//             }
//         });

//     }

//     handlePlanningUnitChange = (planningUnitIds) => {
//         planningUnitIds = planningUnitIds.sort(function (a, b) {
//             return parseInt(a.value) - parseInt(b.value);
//           })
//         this.setState({
//             planningUnitValues: planningUnitIds.map(ele => ele),
//             planningUnitLabels: planningUnitIds.map(ele => ele.label)
//         }, () => {

//             this.fetchData()
//         })
//     }


//     handleRangeChange(value, text, listIndex) {
//         //
//     }
//     handleRangeDissmis(value) {
//         this.setState({ rangeValue: value }, () => {
//             this.fetchData()
//         })
//     }

//     _handleClickRangeBox(e) {
//         this.refs.pickRange.show()
//     }
//     formatter = (value) => {

//         var cell1 = value
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

//     exportCSV(columns) {

//         let viewby = document.getElementById("viewById").value;

//         var csvRow = [];
//         csvRow.push((i18n.t('static.report.dateRange') + ' , ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
//         if (viewby == 1) {
//             csvRow.push(i18n.t('static.procurementagent.procurementagent') + ' , ' + (document.getElementById("procurementAgentId").selectedOptions[0].text).replaceAll(' ', '%20'))
//         } else if (viewby == 2) {
//             csvRow.push(i18n.t('static.budget.fundingsource') + ' , ' + (document.getElementById("fundingSourceId").selectedOptions[0].text).replaceAll(' ', '%20'))
//         }

//         csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
//         csvRow.push(i18n.t('static.report.version').replaceAll(' ', '%20') + '  ,  ' + (document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20'))
//         this.state.planningUnitLabels.map(ele =>
//             csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
//         csvRow.push(i18n.t('static.program.isincludeplannedshipment').replaceAll(' ', '%20') + ' , ' + (document.getElementById("isPlannedShipmentId").selectedOptions[0].text).replaceAll(' ', '%20'))
//         csvRow.push('')
//         csvRow.push('')
//         csvRow.push('')
//         csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
//         csvRow.push('')

//         const headers = [];
//         if (viewby == 3) {
//             columns.splice(0, 2);
//             columns.map((item, idx) => { headers[idx] = ((item.text)) });
//         } else {
//             columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });
//         }




//         var A = [headers]
//         // this.state.data.map(ele => A.push([(getLabelText(ele.program.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (new moment(ele.inventoryDate).format('MMM YYYY')).replaceAll(' ', '%20'), ele.stockAdjustemntQty, ele.lastModifiedBy.username, new moment(ele.lastModifiedDate).format('MMM-DD-YYYY'), ele.notes]));
//         if (viewby == 1) {
//             this.state.data.map(ele => A.push([(getLabelText(ele.procurementAgent.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (ele.procurementAgent.code.replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.qty, ele.productCost, ele.freightPerc, ele.freightCost, ele.totalCost]));
//         } else if (viewby == 2) {
//             this.state.data.map(ele => A.push([(getLabelText(ele.fundingSource.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (ele.fundingSource.code.replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.qty, ele.productCost, ele.freightPerc, ele.freightCost, ele.totalCost]));
//         } else {
//             this.state.data.map(ele => A.push([(getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.qty, ele.productCost, ele.freightPerc, ele.freightCost, ele.totalCost]));
//         }

//         // this.state.data.map(ele => [(ele.procurementAgent).replaceAll(',', ' ').replaceAll(' ', '%20'), (ele.planningUnit).replaceAll(',', ' ').replaceAll(' ', '%20'), ele.qty, ele.totalProductCost, ele.freightPer,ele.freightCost, ele.totalCost]);
//         for (var i = 0; i < A.length; i++) {
//             console.log(A[i])
//             csvRow.push(A[i].join(","))

//         }

//         var csvString = csvRow.join("%0A")
//         console.log('csvString' + csvString)
//         var a = document.createElement("a")
//         a.href = 'data:attachment/csv,' + csvString
//         a.target = "_Blank"
//         a.download = i18n.t('static.report.procurementAgent') + ' by ' + document.getElementById("viewById").selectedOptions[0].text + "-" + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
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
//             var viewby = document.getElementById("viewById").value;

//             for (var i = 1; i <= pageCount; i++) {
//                 doc.setFontSize(12)
//                 doc.setFont('helvetica', 'bold')
//                 doc.setPage(i)
//                 doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
//                 doc.setTextColor("#002f6c");
//                 doc.text(i18n.t('static.report.procurementAgent') + ' by ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 2, 60, {
//                     align: 'center'
//                 })
//                 if (i == 1) {
//                     doc.setFontSize(8)
//                     doc.setFont('helvetica', 'normal')
//                     doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
//                         align: 'left'
//                     })

//                     if (viewby == 1) {
//                         doc.text(i18n.t('static.procurementagent.procurementagent') + ' : ' + document.getElementById("procurementAgentId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
//                             align: 'left'
//                         })
//                     } else if (viewby == 2) {
//                         doc.text(i18n.t('static.budget.fundingsource') + ' : ' + document.getElementById("fundingSourceId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
//                             align: 'left'
//                         })
//                     }

//                     doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
//                         align: 'left'
//                     })

//                     doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
//                         align: 'left'
//                     })
//                     doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("isPlannedShipmentId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 170, {
//                         align: 'left'
//                     })

//                     var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
//                     doc.text(doc.internal.pageSize.width / 8, 190, planningText)


//                 }

//             }
//         }

//         const unit = "pt";
//         const size = "A4"; // Use A1, A2, A3 or A4
//         const orientation = "landscape"; // portrait or landscape

//         const marginLeft = 10;
//         const doc = new jsPDF(orientation, unit, size);

//         doc.setFontSize(8);

//         var viewby = document.getElementById("viewById").value;


//         const headers = [];

//         let data = [];
//         if (viewby == 1) {
//             columns.map((item, idx) => { headers[idx] = (item.text) });
//             data = this.state.data.map(ele => [getLabelText(ele.procurementAgent.label, this.state.lang), ele.procurementAgent.code, getLabelText(ele.planningUnit.label, this.state.lang), (ele.qty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.productCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (parseFloat(ele.freightPerc).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.freightCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.totalCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")]);
//         } else if (viewby == 2) {
//             columns.map((item, idx) => { headers[idx] = (item.text) });
//             data = this.state.data.map(ele => [getLabelText(ele.fundingSource.label, this.state.lang), ele.fundingSource.code, getLabelText(ele.planningUnit.label, this.state.lang), (ele.qty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.productCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (parseFloat(ele.freightPerc).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.freightCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.totalCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")]);
//         } else {
//             columns.splice(0, 2);
//             columns.map((item, idx) => { headers[idx] = (item.text) });
//             data = this.state.data.map(ele => [getLabelText(ele.planningUnit.label, this.state.lang), (ele.qty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.productCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (parseFloat(ele.freightPerc).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.freightCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.totalCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")]);
//         }
//        let startY=190+(this.state.planningUnitValues.length*3)
//         let content = {
//             margin: { top: 80 ,bottom:70},
//             startY: startY,
//             head: [headers],
//             body: data,
//             styles: { lineWidth: 1, fontSize: 8, cellWidth: 80, halign: 'center' },
//             columnStyles: {
//                 0: { cellWidth: 100 },
//                 1: { cellWidth: 100 },
//                 2: { cellWidth: 170 },
//             }
//         };

//         doc.autoTable(content);
//         addHeaders(doc)
//         addFooters(doc)
//         doc.save(i18n.t('static.report.procurementAgent') + ' by ' + document.getElementById("viewById").selectedOptions[0].text + ".pdf")
//     }



//     fetchData = () => {
//         console.log("-------------------IN FETCHDATA-----------------------------");
//         let versionId = document.getElementById("versionId").value;
//         let programId = document.getElementById("programId").value;
//         let viewby = document.getElementById("viewById").value;
//         let procurementAgentId = document.getElementById("procurementAgentId").value;
//         let fundingSourceId = document.getElementById("fundingSourceId").value;
//         let isPlannedShipmentId = document.getElementById("isPlannedShipmentId").value;

//         let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
//         let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
//         let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();

//         if (viewby == 1) {
//             if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0 && procurementAgentId > 0) {
//                 if (versionId.includes('Local')) {
//                     planningUnitIds=this.state.planningUnitValues.map(ele => (ele.value))
//                     var db1;
//                     var storeOS;
//                     getDatabase();
//                     var regionList = [];
//                     var openRequest = indexedDB.open('fasp', 1);
//                     openRequest.onerror = function (event) {
//                         this.setState({
//                             message: i18n.t('static.program.errortext')
//                         })
//                     }.bind(this);
//                     openRequest.onsuccess = function (e) {
//                         var version = (versionId.split('(')[0]).trim()

//                         //for user id
//                         var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//                         var userId = userBytes.toString(CryptoJS.enc.Utf8);

//                         //for program id
//                         var program = `${programId}_v${version}_uId_${userId}`

//                         db1 = e.target.result;
//                         var programDataTransaction = db1.transaction(['programData'], 'readwrite');
//                         var programDataOs = programDataTransaction.objectStore('programData');
//                         // console.log(program)
//                         var programRequest = programDataOs.get(program);
//                         programRequest.onerror = function (event) {
//                             this.setState({
//                                 message: i18n.t('static.program.errortext')
//                             })
//                         }.bind(this);
//                         programRequest.onsuccess = function (e) {
//                             var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
//                             var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
//                             var programJson = JSON.parse(programData);


//                             var programTransaction = db1.transaction(['program'], 'readwrite');
//                             var programOs = programTransaction.objectStore('program');
//                             var program1Request = programOs.getAll();
//                             program1Request.onsuccess = function (event) {
//                                 var programResult = [];
//                                 programResult = program1Request.result;
//                                 let airFreight = 0;
//                                 let seaFreight = 0;
//                                 for (var k = 0; k < programResult.length; k++) {
//                                     if (programId == programResult[k].programId) {
//                                         airFreight = programResult[k].airFreightPerc;
//                                         seaFreight = programResult[k].seaFreightPerc;
//                                     }
//                                 }

//                                 var shipmentList = (programJson.shipmentList);
//                                 console.log("shipmentList----*********----", shipmentList);

//                                 const activeFilter = shipmentList.filter(c => (c.active == true || c.active == "true"));

//                                 let isPlannedShipment = [];
//                                 if (isPlannedShipmentId == 1) {//yes includePlannedShipments = 1 means the report will include all shipments that are Active and not Cancelled
//                                     isPlannedShipment = activeFilter.filter(c => c.shipmentStatus.id != 8);
//                                 } else {//no includePlannedShipments = 0 means only(4,5,6,7) Approve, Shipped, Arrived, Delivered statuses will be included in the report
//                                     isPlannedShipment = activeFilter.filter(c => (c.shipmentStatus.id == 4 && c.shipmentStatus.id == 5 && c.shipmentStatus.id == 6 && c.shipmentStatus.id == 7));
//                                 }

//                                 const procurementAgentFilter = isPlannedShipment.filter(c => c.procurementAgent.id == procurementAgentId);

//                                 const dateFilter = procurementAgentFilter.filter(c => moment(c.shippedDate).isBetween(startDate, endDate, null, '[)'));

//                                 let data = [];
//                                 let planningUnitFilter = [];
//                                 for (let i = 0; i < planningUnitIds.length; i++) {
//                                     for (let j = 0; j < dateFilter.length; j++) {
//                                         if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
//                                             planningUnitFilter.push(dateFilter[j]);
//                                         }
//                                     }
//                                 }

//                                 console.log("offline data----", planningUnitFilter);
//                                 for (let j = 0; j < planningUnitFilter.length; j++) {
//                                     let freight = 0;
//                                     if (planningUnitFilter[j].shipmentMode === "Air") {
//                                         freight = airFreight;
//                                     } else {
//                                         freight = seaFreight;
//                                     }
//                                     let json = {
//                                         "active": true,
//                                         "shipmentId": planningUnitFilter[j].shipmentId,
//                                         "procurementAgent": planningUnitFilter[j].procurementAgent,
//                                         "fundingSource": planningUnitFilter[j].fundingSource,
//                                         "planningUnit": planningUnitFilter[j].planningUnit,
//                                         "qty": planningUnitFilter[j].shipmentQty,
//                                         "productCost": planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd,
//                                         "freightPerc": parseFloat((((planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd) / (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd)) * 100).toFixed(2)),
//                                         "freightCost": planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd,
//                                         "totalCost": (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd) + (planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd),
//                                     }
//                                     data.push(json);
//                                 }

//                                 this.setState({
//                                     data: data
//                                     , message: ''
//                                 })
//                             }.bind(this)
//                         }.bind(this)
//                     }.bind(this)
//                 } else {
//                     this.setState({
//                         message: ''
//                     })
//                     let includePlannedShipments = true;
//                     if (isPlannedShipmentId == 1) {
//                         includePlannedShipments = true;
//                     } else {
//                         includePlannedShipments = false;
//                     }
//                     var inputjson = {
//                         procurementAgentId: procurementAgentId,
//                         programId: programId,
//                         versionId: versionId,
//                         startDate: new moment(startDate),
//                         stopDate: new moment(endDate),
//                         planningUnitIds: planningUnitIds,
//                         includePlannedShipments: includePlannedShipments,
//                     }
//                     console.log("inputjson-------", inputjson);
//                     AuthenticationService.setupAxiosInterceptors();
//                     ReportService.procurementAgentExporttList(inputjson)
//                         .then(response => {
//                             console.log("Online Data------", response.data);
//                             this.setState({
//                                 data: response.data
//                             }, () => {
//                                 this.consolidatedProgramList();
//                                 this.consolidatedProcurementAgentList();
//                             })
//                         }).catch(
//                             error => {
//                                 this.setState({
//                                     data: []
//                                 }, () => {
//                                     this.consolidatedProgramList();
//                                     this.consolidatedProcurementAgentList();
//                                 })
//                                 if (error.message === "Network Error") {
//                                     this.setState({ message: error.message });
//                                 } else {
//                                     switch (error.response ? error.response.status : "") {
//                                         case 500:
//                                         case 401:
//                                         case 404:
//                                         case 406:
//                                         case 412:
//                                             this.setState({ message: i18n.t(error.response.data.messageCode) });
//                                             break;
//                                         default:
//                                             this.setState({ message: 'static.unkownError' });
//                                             break;
//                                     }
//                                 }
//                             }
//                         );


//                 }
//             } else if (programId == 0) {
//                 this.setState({ message: i18n.t('static.report.selectProgram'), data: [] });

//             } else if (versionId == -1) {
//                 this.setState({ message: i18n.t('static.program.validversion'), data: [] });

//             } else if (this.state.planningUnitValues.length == 0) {
//                 this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] });

//             } else if (procurementAgentId == 0) {
//                 this.setState({ message: i18n.t('static.procurementAgent.selectProcurementAgent'), data: [] });
//             }
//         } else if (viewby == 2) {
//             if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0 && fundingSourceId > 0) {
//                 if (versionId.includes('Local')) {
//                     planningUnitIds=this.state.planningUnitValues.map(ele => (ele.value))
//                     var db1;
//                     var storeOS;
//                     getDatabase();
//                     var regionList = [];
//                     var openRequest = indexedDB.open('fasp', 1);
//                     openRequest.onerror = function (event) {
//                         this.setState({
//                             message: i18n.t('static.program.errortext')
//                         })
//                     }.bind(this);
//                     openRequest.onsuccess = function (e) {
//                         var version = (versionId.split('(')[0]).trim()

//                         //for user id
//                         var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//                         var userId = userBytes.toString(CryptoJS.enc.Utf8);

//                         //for program id
//                         var program = `${programId}_v${version}_uId_${userId}`

//                         db1 = e.target.result;
//                         var programDataTransaction = db1.transaction(['programData'], 'readwrite');
//                         var programDataOs = programDataTransaction.objectStore('programData');
//                         // console.log(program)
//                         var programRequest = programDataOs.get(program);
//                         programRequest.onerror = function (event) {
//                             this.setState({
//                                 message: i18n.t('static.program.errortext')
//                             })
//                         }.bind(this);
//                         programRequest.onsuccess = function (e) {
//                             var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
//                             var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
//                             var programJson = JSON.parse(programData);


//                             var programTransaction = db1.transaction(['program'], 'readwrite');
//                             var programOs = programTransaction.objectStore('program');
//                             var program1Request = programOs.getAll();
//                             program1Request.onsuccess = function (event) {
//                                 var programResult = [];
//                                 programResult = program1Request.result;
//                                 let airFreight = 0;
//                                 let seaFreight = 0;
//                                 for (var k = 0; k < programResult.length; k++) {
//                                     if (programId == programResult[k].programId) {
//                                         airFreight = programResult[k].airFreightPerc;
//                                         seaFreight = programResult[k].seaFreightPerc;
//                                     }
//                                 }

//                                 var shipmentList = (programJson.shipmentList);

//                                 const activeFilter = shipmentList.filter(c => (c.active == true || c.active == "true"));
//                                 // const planningUnitFilter = activeFilter.filter(c => c.planningUnit.id == planningUnitId);

//                                 let isPlannedShipment = [];
//                                 if (isPlannedShipmentId == 1) {//yes includePlannedShipments = 1 means the report will include all shipments that are Active and not Cancelled
//                                     isPlannedShipment = activeFilter.filter(c => c.shipmentStatus.id != 8);
//                                 } else {//no includePlannedShipments = 0 means only(4,5,6,7) Approve, Shipped, Arrived, Delivered statuses will be included in the report
//                                     isPlannedShipment = activeFilter.filter(c => (c.shipmentStatus.id == 4 && c.shipmentStatus.id == 5 && c.shipmentStatus.id == 6 && c.shipmentStatus.id == 7));
//                                 }

//                                 const fundingSourceFilter = isPlannedShipment.filter(c => c.fundingSource.id == fundingSourceId);

//                                 const dateFilter = fundingSourceFilter.filter(c => moment(c.shippedDate).isBetween(startDate, endDate, null, '[)'));

//                                 console.log("DB LIST---", dateFilter);
//                                 console.log("SELECTED LIST---", planningUnitIds);

//                                 let data = [];
//                                 let planningUnitFilter = [];
//                                 for (let i = 0; i < planningUnitIds.length; i++) {
//                                     for (let j = 0; j < dateFilter.length; j++) {
//                                         if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
//                                             planningUnitFilter.push(dateFilter[j]);
//                                         }
//                                     }
//                                 }

//                                 console.log("offline data----", planningUnitFilter);
//                                 for (let j = 0; j < planningUnitFilter.length; j++) {
//                                     let freight = 0;
//                                     if (planningUnitFilter[j].shipmentMode === "Air") {
//                                         freight = airFreight;
//                                     } else {
//                                         freight = seaFreight;
//                                     }
//                                     let json = {
//                                         "active": true,
//                                         "shipmentId": planningUnitFilter[j].shipmentId,
//                                         "fundingSource": planningUnitFilter[j].fundingSource,
//                                         "planningUnit": planningUnitFilter[j].planningUnit,
//                                         "qty": planningUnitFilter[j].shipmentQty,
//                                         "productCost": planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd,
//                                         "freightPerc": parseFloat((((planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd) / (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd)) * 100).toFixed(2)),
//                                         "freightCost": planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd,
//                                         "totalCost": (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd) + (planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd),
//                                     }
//                                     data.push(json);
//                                 }
//                                 console.log("end offline data----", data);
//                                 this.setState({
//                                     data: data
//                                     , message: ''
//                                 })
//                             }.bind(this)
//                         }.bind(this)
//                     }.bind(this)
//                 } else {
//                     this.setState({
//                         message: ''
//                     })
//                     let includePlannedShipments = true;
//                     if (isPlannedShipmentId == 1) {
//                         includePlannedShipments = true;
//                     } else {
//                         includePlannedShipments = false;
//                     }
//                     var inputjson = {
//                         fundingSourceId: fundingSourceId,
//                         programId: programId,
//                         versionId: versionId,
//                         startDate: new moment(startDate),
//                         stopDate: new moment(endDate),
//                         planningUnitIds: planningUnitIds,
//                         includePlannedShipments: includePlannedShipments,
//                     }
//                     AuthenticationService.setupAxiosInterceptors();
//                     ReportService.fundingSourceExportList(inputjson)
//                         .then(response => {
//                             // console.log(JSON.stringify(response.data))
//                             this.setState({
//                                 data: response.data
//                             }, () => {
//                                 this.consolidatedProgramList();
//                                 this.consolidatedFundingSourceList();
//                             })
//                         }).catch(
//                             error => {
//                                 this.setState({
//                                     data: []
//                                 }, () => {
//                                     this.consolidatedProgramList();
//                                     this.consolidatedFundingSourceList();
//                                 })
//                                 if (error.message === "Network Error") {
//                                     this.setState({ message: error.message });
//                                 } else {
//                                     switch (error.response ? error.response.status : "") {
//                                         case 500:
//                                         case 401:
//                                         case 404:
//                                         case 406:
//                                         case 412:
//                                             this.setState({ message: i18n.t(error.response.data.messageCode) });
//                                             break;
//                                         default:
//                                             this.setState({ message: 'static.unkownError' });
//                                             break;
//                                     }
//                                 }
//                             }
//                         );


//                 }
//             } else if (programId == 0) {
//                 this.setState({ message: i18n.t('static.report.selectProgram'), data: [] });

//             } else if (versionId == -1) {
//                 this.setState({ message: i18n.t('static.program.validversion'), data: [] });

//             } else if (this.state.planningUnitValues.length == 0) {
//                 this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] });

//             } else if (fundingSourceId == 0) {
//                 this.setState({ message: i18n.t('static.fundingSource.selectFundingSource'), data: [] });
//             }
//         } else {
//             if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0) {
//                 if (versionId.includes('Local')) {
//                     planningUnitIds=this.state.planningUnitValues.map(ele => (ele.value))

//                     var db1;
//                     var storeOS;
//                     getDatabase();
//                     var regionList = [];
//                     var openRequest = indexedDB.open('fasp', 1);
//                     openRequest.onerror = function (event) {
//                         this.setState({
//                             message: i18n.t('static.program.errortext')
//                         })
//                     }.bind(this);
//                     openRequest.onsuccess = function (e) {
//                         var version = (versionId.split('(')[0]).trim()

//                         //for user id
//                         var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//                         var userId = userBytes.toString(CryptoJS.enc.Utf8);

//                         //for program id
//                         var program = `${programId}_v${version}_uId_${userId}`

//                         db1 = e.target.result;
//                         var programDataTransaction = db1.transaction(['programData'], 'readwrite');
//                         var programDataOs = programDataTransaction.objectStore('programData');
//                         // console.log(program)
//                         var programRequest = programDataOs.get(program);
//                         programRequest.onerror = function (event) {
//                             this.setState({
//                                 message: i18n.t('static.program.errortext')
//                             })
//                         }.bind(this);
//                         programRequest.onsuccess = function (e) {
//                             var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
//                             var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
//                             var programJson = JSON.parse(programData);


//                             var programTransaction = db1.transaction(['program'], 'readwrite');
//                             var programOs = programTransaction.objectStore('program');
//                             var program1Request = programOs.getAll();
//                             program1Request.onsuccess = function (event) {
//                                 var programResult = [];
//                                 programResult = program1Request.result;
//                                 let airFreight = 0;
//                                 let seaFreight = 0;
//                                 for (var k = 0; k < programResult.length; k++) {
//                                     if (programId == programResult[k].programId) {
//                                         airFreight = programResult[k].airFreightPerc;
//                                         seaFreight = programResult[k].seaFreightPerc;
//                                     }
//                                 }

//                                 var shipmentList = (programJson.shipmentList);

//                                 const activeFilter = shipmentList.filter(c => (c.active == true || c.active == "true"));

//                                 let isPlannedShipment = [];
//                                 if (isPlannedShipmentId == 1) {//yes includePlannedShipments = 1 means the report will include all shipments that are Active and not Cancelled
//                                     isPlannedShipment = activeFilter.filter(c => c.shipmentStatus.id != 8);
//                                 } else {//no includePlannedShipments = 0 means only(4,5,6,7) Approve, Shipped, Arrived, Delivered statuses will be included in the report
//                                     isPlannedShipment = activeFilter.filter(c => (c.shipmentStatus.id == 4 && c.shipmentStatus.id == 5 && c.shipmentStatus.id == 6 && c.shipmentStatus.id == 7));
//                                 }

//                                 const dateFilter = isPlannedShipment.filter(c => moment(c.shippedDate).isBetween(startDate, endDate, null, '[)'));

//                                 let data = [];
//                                 let planningUnitFilter = [];
//                                 for (let i = 0; i < planningUnitIds.length; i++) {
//                                     for (let j = 0; j < dateFilter.length; j++) {
//                                         if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
//                                             planningUnitFilter.push(dateFilter[j]);
//                                         }
//                                     }
//                                 }

//                                 console.log("offline data----", planningUnitFilter);
//                                 for (let j = 0; j < planningUnitFilter.length; j++) {
//                                     let freight = 0;
//                                     if (planningUnitFilter[j].shipmentMode === "Air") {
//                                         freight = airFreight;
//                                     } else {
//                                         freight = seaFreight;
//                                     }
//                                     let json = {
//                                         "active": true,
//                                         "shipmentId": planningUnitFilter[j].shipmentId,
//                                         "planningUnit": planningUnitFilter[j].planningUnit,
//                                         "qty": planningUnitFilter[j].shipmentQty,
//                                         "productCost": planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd,
//                                         "freightPerc": parseFloat((((planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd) / (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd)) * 100).toFixed(2)),
//                                         "freightCost": planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd,
//                                         "totalCost": (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd) + (planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd),
//                                     }
//                                     data.push(json);
//                                 }

//                                 this.setState({
//                                     data: data
//                                     , message: ''
//                                 })
//                             }.bind(this)
//                         }.bind(this)
//                     }.bind(this)
//                 } else {
//                     this.setState({
//                         message: ''
//                     })
//                     let includePlannedShipments = true;
//                     if (isPlannedShipmentId == 1) {
//                         includePlannedShipments = true;
//                     } else {
//                         includePlannedShipments = false;
//                     }
//                     var inputjson = {
//                         programId: programId,
//                         versionId: versionId,
//                         startDate: new moment(startDate),
//                         stopDate: new moment(endDate),
//                         planningUnitIds: planningUnitIds,
//                         includePlannedShipments: includePlannedShipments,
//                     }
//                     AuthenticationService.setupAxiosInterceptors();
//                     ReportService.AggregateShipmentByProduct(inputjson)
//                         .then(response => {
//                             console.log("Online Data------", response.data);
//                             this.setState({
//                                 data: response.data
//                             }, () => {
//                                 this.consolidatedProgramList();
//                             })
//                         }).catch(
//                             error => {
//                                 this.setState({
//                                     data: []
//                                 }, () => {
//                                     this.consolidatedProgramList();
//                                     this.consolidatedProcurementAgentList();
//                                 })
//                                 if (error.message === "Network Error") {
//                                     this.setState({ message: error.message });
//                                 } else {
//                                     switch (error.response ? error.response.status : "") {
//                                         case 500:
//                                         case 401:
//                                         case 404:
//                                         case 406:
//                                         case 412:
//                                             this.setState({ message: i18n.t(error.response.data.messageCode) });
//                                             break;
//                                         default:
//                                             this.setState({ message: 'static.unkownError' });
//                                             break;
//                                     }
//                                 }
//                             }
//                         );


//                 }
//             } else if (programId == 0) {
//                 this.setState({ message: i18n.t('static.report.selectProgram'), data: [] });

//             } else if (versionId == -1) {
//                 this.setState({ message: i18n.t('static.program.validversion'), data: [] });

//             } else if (this.state.planningUnitValues.length == 0) {
//                 this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] });

//             }
//         }

//     }

//     toggleView = () => {
//         let viewby = document.getElementById("viewById").value;
//         this.setState({
//             viewby: viewby
//         });
//         if (viewby == 1) {
//             document.getElementById("fundingSourceDiv").style.display = "none";
//             document.getElementById("procurementAgentDiv").style.display = "block";
//             this.setState({
//                 data: []
//             }, () => {
//                 this.fetchData();
//                 // this.consolidatedProgramList();
//                 // this.consolidatedProcurementAgentList();
//             })


//         } else if (viewby == 2) {
//             document.getElementById("procurementAgentDiv").style.display = "none";
//             document.getElementById("fundingSourceDiv").style.display = "block";
//             this.setState({
//                 data: []
//             }, () => {
//                 this.fetchData();
//                 // this.consolidatedProgramList();
//                 // this.consolidatedProcurementAgentList();
//             })


//         } else {
//             document.getElementById("procurementAgentDiv").style.display = "none";
//             document.getElementById("fundingSourceDiv").style.display = "none";
//             this.setState({
//                 data: []
//             }, () => {
//                 // this.consolidatedProgramList();
//                 // this.consolidatedProcurementAgentList();
//                 this.fetchData();
//             })



//         }
//     }

//     componentDidMount() {
//         this.getProcurementAgent();
//         this.getFundingSource();
//         this.getPrograms();
//         document.getElementById("fundingSourceDiv").style.display = "none";
//         let viewby = document.getElementById("viewById").value;
//         this.setState({
//             viewby: viewby
//         });

//     }

//     getFundingSource = () => {
//         if (navigator.onLine) {
//             AuthenticationService.setupAxiosInterceptors();
//             FundingSourceService.getFundingSourceListAll()
//                 .then(response => {
//                     // console.log(JSON.stringify(response.data))
//                     this.setState({
//                         fundingSources: response.data
//                     }, () => { this.consolidatedFundingSourceList() })
//                 }).catch(
//                     error => {
//                         this.setState({
//                             fundingSources: []
//                         }, () => { this.consolidatedFundingSourceList() })
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
//             this.consolidatedFundingSourceList()
//         }

//     }

//     consolidatedFundingSourceList = () => {
//         const lan = 'en';
//         const { fundingSources } = this.state
//         var proList = fundingSources;

//         var db1;
//         getDatabase();
//         var openRequest = indexedDB.open('fasp', 1);
//         openRequest.onsuccess = function (e) {
//             db1 = e.target.result;
//             var transaction = db1.transaction(['fundingSource'], 'readwrite');
//             var fundingSource = transaction.objectStore('fundingSource');
//             var getRequest = fundingSource.getAll();

//             getRequest.onerror = function (event) {
//                 // Handle errors!
//             };
//             getRequest.onsuccess = function (event) {
//                 var myResult = [];
//                 myResult = getRequest.result;
//                 var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//                 var userId = userBytes.toString(CryptoJS.enc.Utf8);
//                 for (var i = 0; i < myResult.length; i++) {

//                     var f = 0
//                     for (var k = 0; k < this.state.fundingSources.length; k++) {
//                         if (this.state.fundingSources[k].fundingSourceId == myResult[i].fundingSourceId) {
//                             f = 1;
//                             console.log('already exist')
//                         }
//                     }
//                     var programData = myResult[i];
//                     if (f == 0) {
//                         proList.push(programData)
//                     }

//                 }

//                 this.setState({
//                     fundingSources: proList
//                 })

//             }.bind(this);

//         }.bind(this);
//     }


//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
//     }

//     addCommas(cell, row) {
//         // console.log("row---------->", row);

//         cell += '';
//         var x = cell.split('.');
//         var x1 = x[0];
//         var x2 = x.length > 1 ? '.' + x[1] : '';
//         var rgx = /(\d+)(\d{3})/;
//         while (rgx.test(x1)) {
//             x1 = x1.replace(rgx, '$1' + ',' + '$2');
//         }
//         // return "(" + currencyCode + ")" + "  " + x1 + x2;
//         return x1 + x2;
//     }

//     render() {

//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );

//         const { procurementAgents } = this.state;

//         const { fundingSources } = this.state;

//         const { programs } = this.state;

//         const { versions } = this.state;
//         let versionList = versions.length > 0
//             && versions.map((item, i) => {
//                 return (
//                     <option key={i} value={item.versionId}>
//                         {item.versionId}
//                     </option>
//                 )
//             }, this);

//         const { planningUnits } = this.state
//         let planningUnitList = planningUnits.length > 0
//             && planningUnits.map((item, i) => {
//                 return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

//             }, this);

//         const { rangeValue } = this.state


//         let viewby = this.state.viewby;
//         // console.log("RENDER VIEWBY-------", viewby);
//         let obj1 = {}
//         let obj2 = {}
//         if (viewby == 1) {
//             obj1 = {
//                 dataField: 'procurementAgent.label',
//                 text: 'Procurement Agent',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 },
//                 style: { width: '70px' },
//             }

//             obj2 = {
//                 dataField: 'procurementAgent.code',
//                 text: 'Procurement Agent Code',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 style: { width: '70px' },
//             }

//         } else if (viewby == 2) {
//             obj1 = {
//                 dataField: 'fundingSource.label',
//                 text: i18n.t('static.budget.fundingsource'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 },
//                 style: { width: '100px' },
//             }

//             obj2 = {
//                 dataField: 'fundingSource.code',
//                 text: i18n.t('static.fundingsource.fundingsourceCode'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 style: { width: '100px' },
//             }
//         } else {
//             obj1 = {
//                 hidden: true
//             }

//             obj2 = {
//                 hidden: true

//             }
//         }


//         const columns = [
//             obj1,
//             obj2,
//             {
//                 dataField: 'planningUnit.label',
//                 text: i18n.t('static.report.planningUnit'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 },
//                 style: { width: '400px' },
//             },
//             {
//                 dataField: 'qty',
//                 text: i18n.t('static.report.qty'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.addCommas,
//                 style: { width: '100px' },
//             },
//             {
//                 dataField: 'productCost',
//                 text: i18n.t('static.report.productCost'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.addCommas,
//                 style: { width: '100px' },
//             },
//             {
//                 dataField: 'freightPerc',
//                 text: i18n.t('static.report.freightPer'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cell, row) => {
//                     return cell.toFixed(2);
//                 },
//                 style: { width: '100px' },
//             },
//             {
//                 dataField: 'freightCost',
//                 text: i18n.t('static.report.freightCost'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.addCommas,
//                 style: { width: '100px' },
//             },
//             {
//                 dataField: 'totalCost',
//                 text: i18n.t('static.report.totalCost'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.addCommas,
//                 style: { width: '100px' },
//             },

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
//                 text: 'All', value: this.state.selRegion.length
//             }]
//         }
//         return (
//             <div className="animated">
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />
//                 <h5>{i18n.t(this.props.match.params.message)}</h5>
//                 <h5 className="red">{i18n.t(this.state.message)}</h5>
//                 <Card >
//                     <div className="Card-header-reporticon">

//                         {/* <div className="card-header-actions">
//                             <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
//                             <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
//                         </div> */}
//                         <Online>
//                             {
//                                 this.state.data.length > 0 &&
//                                 <div className="card-header-actions">
//                                     <a className="card-header-action">
//                                         <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
//                                     </a>
//                                     <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
//                                 </div>
//                             }
//                         </Online>
//                         <Offline>
//                             {
//                                 this.state.data.length > 0 &&
//                                 <div className="card-header-actions">
//                                     <a className="card-header-action">
//                                         <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
//                                     </a>
//                                     <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
//                                 </div>
//                             }
//                         </Offline>
//                     </div>
//                     <CardBody className="pt-lg-0">

//                         <Col md="12 pl-0">
//                             <div className="row ">
//                                 <FormGroup className="col-md-3">
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc"></span></Label>
//                                     <div className="controls  Regioncalender">

//                                         <Picker
//                                             ref="pickRange"
//                                             years={{ min: 2013 }}
//                                             value={rangeValue}
//                                             lang={pickerLang}
//                                             //theme="light"
//                                             onChange={this.handleRangeChange}
//                                             onDismiss={this.handleRangeDissmis}
//                                         >
//                                             <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
//                                         </Picker>


//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="col-md-3">
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
//                                     <div className="controls ">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="programId"
//                                                 id="programId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterVersion}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.select')}</option>
//                                                 {programs.length > 0
//                                                     && programs.map((item, i) => {
//                                                         return (
//                                                             <option key={i} value={item.programId}>
//                                                                 {getLabelText(item.label, this.state.lang)}
//                                                             </option>
//                                                         )
//                                                     }, this)}

//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="col-md-3">
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
//                                     <div className="controls">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="versionId"
//                                                 id="versionId"
//                                                 bsSize="sm"
//                                                 onChange={(e) => { this.getPlanningUnit(); }}
//                                             >
//                                                 <option value="-1">{i18n.t('static.common.select')}</option>
//                                                 {versionList}
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="col-md-3">
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
//                                     <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
//                                     <div className="controls">
//                                             <MultiSelect
//                                                 name="planningUnitId"
//                                                 id="planningUnitId"
//                                                 bsSize="md"
//                                                 value={this.state.planningUnitValues}
//                                                 onChange={(e) => { this.handlePlanningUnitChange(e) }}
//                                                 options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
//                                             />

//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="col-md-3">
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label>
//                                     <div className="controls ">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="isPlannedShipmentId"
//                                                 id="isPlannedShipmentId"
//                                                 bsSize="sm"
//                                                 onChange={this.fetchData}
//                                             >
//                                                 <option value="1">{i18n.t('static.program.yes')}</option>
//                                                 <option value="2">{i18n.t('static.program.no')}</option>
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="col-md-3">
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
//                                     <div className="controls ">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="viewById"
//                                                 id="viewById"
//                                                 bsSize="sm"
//                                                 onChange={this.toggleView}
//                                             >
//                                                 {/* <option value="-1">{i18n.t('static.common.select')}</option> */}
//                                                 <option value="1">{i18n.t('static.procurementagent.procurementagent')}</option>
//                                                 <option value="2">{i18n.t('static.dashboard.fundingsource')}</option>
//                                                 <option value="3">{i18n.t('static.planningunit.planningunit')}</option>
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="col-md-3" id="procurementAgentDiv">
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.procurementagent.procurementagent')}</Label>
//                                     <div className="controls ">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="procurementAgentId"
//                                                 id="procurementAgentId"
//                                                 bsSize="sm"
//                                                 onChange={this.fetchData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.select')}</option>
//                                                 {procurementAgents.length > 0
//                                                     && procurementAgents.map((item, i) => {
//                                                         return (
//                                                             <option key={i} value={item.procurementAgentId}>
//                                                                 {getLabelText(item.label, this.state.lang)}
//                                                             </option>
//                                                         )
//                                                     }, this)}

//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="col-md-3" id="fundingSourceDiv">
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
//                                     <div className="controls ">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="fundingSourceId"
//                                                 id="fundingSourceId"
//                                                 bsSize="sm"
//                                                 onChange={this.fetchData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.select')}</option>
//                                                 {fundingSources.length > 0
//                                                     && fundingSources.map((item, i) => {
//                                                         return (
//                                                             <option key={i} value={item.fundingSourceId}>
//                                                                 {getLabelText(item.label, this.state.lang)}
//                                                             </option>
//                                                         )
//                                                     }, this)}

//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>



//                             </div>
//                         </Col>

//                         <ToolkitProvider
//                             keyField="shipmentId"
//                             data={this.state.data}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (

//                                     <div className="TableCust">
//                                         <div className="col-md-3 pr-0 offset-md-9 text-right mob-Left table-accesscnl-mt">
//                                             <SearchBar {...props.searchProps} />
//                                             <ClearSearchButton {...props.searchProps} />
//                                         </div>
//                                         <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                                             pagination={paginationFactory(options)}
//                                             /* rowEvents={{
//                                                  onClick: (e, row, rowIndex) => {
//                                                      this.editRegion(row);
//                                                  }
//                                              }}*/
//                                             {...props.baseProps}
//                                         />
//                                     </div>
//                                 )
//                             }
//                         </ToolkitProvider>
//                     </CardBody>
//                 </Card>
//             </div>
//         );
//     }
// }
// export default ProcurementAgentExport;



//----------------------------JEXCEL
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
import { SECRET_KEY, INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ProductService from '../../api/ProductService';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import moment from 'moment';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LOGO } from '../../CommonComponent/Logo.js';
import ReportService from '../../api/ReportService';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import { Online, Offline } from "react-detect-offline";
import FundingSourceService from '../../api/FundingSourceService';
import MultiSelect from 'react-multi-select-component';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}



class ProcurementAgentExport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            regionList: [],
            message: '',
            selRegion: [],
            realmCountryList: [],
            procurementAgents: [],
            fundingSources: [],
            viewby: '',
            programs: [],
            versions: [],
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            data: [],
            lang: localStorage.getItem('lang'),
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 2 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 3, month: new Date().getMonth() },
            maxDate: { year: new Date().getFullYear() + 3, month: new Date().getMonth() + 1 },
            loading: true
        }
        this.formatLabel = this.formatLabel.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    getPrograms = () => {
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
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

    getProcurementAgent = () => {
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            ProcurementAgentService.getProcurementAgentListAll()
                .then(response => {
                    // console.log(JSON.stringify(response.data))
                    this.setState({
                        procurementAgents: response.data, loading: false
                    }, () => { this.consolidatedProcurementAgentList() })
                }).catch(
                    error => {
                        this.setState({
                            procurementAgents: [], loading: false
                        }, () => { this.consolidatedProcurementAgentList() })
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

        } else {
            console.log('offline')
            this.consolidatedProcurementAgentList()
            this.setState({ loading: false })
        }

    }

    consolidatedProcurementAgentList = () => {
        const lan = 'en';
        const { procurementAgents } = this.state
        var proList = procurementAgents;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['procurementAgent'], 'readwrite');
            var procuremntAgent = transaction.objectStore('procurementAgent');
            var getRequest = procuremntAgent.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                // console.log("ProcurementAgentMyResult------>>>>", myResult);
                for (var i = 0; i < myResult.length; i++) {

                    // var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                    // var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                    // console.log(programNameLabel);

                    // var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                    // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))


                    var f = 0
                    for (var k = 0; k < this.state.procurementAgents.length; k++) {
                        if (this.state.procurementAgents[k].procurementAgentId == myResult[i].procurementAgentId) {
                            f = 1;
                            console.log('already exist')
                        }
                    }
                    var programData = myResult[i];
                    if (f == 0) {
                        proList.push(programData)
                    }

                }

                this.setState({
                    procurementAgents: proList
                })

            }.bind(this);

        }.bind(this);
    }


    filterVersion = () => {
        // document.getElementById("planningUnitId").checked = false;
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
            planningUnits: [],
            planningUnitLabels: [],
            planningUnitValues: []
        }, () => {
            if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })
            } else {
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
                                if (myResult[i].program.id == programId) {

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
                    AuthenticationService.setupAxiosInterceptors();

                    //let productCategoryId = document.getElementById("productCategoryId").value;
                    ProgramService.getProgramPlaningUnitListByProgramId(programId).then(response => {
                        // console.log('**' + JSON.stringify(response.data))
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
                                    this.setState({ message: error.message });
                                } else {
                                    switch (error.response ? error.response.status : "") {
                                        case 500:
                                        case 401:
                                        case 404:
                                        case 406:
                                        case 412:
                                            this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }) });
                                            break;
                                        default:
                                            this.setState({ message: 'static.unkownError' });
                                            break;
                                    }
                                }
                            }
                        );
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


    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.fetchData()
        })
    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    formatter = (value) => {

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

    exportCSV(columns) {

        let viewby = document.getElementById("viewById").value;

        var csvRow = [];
        csvRow.push((i18n.t('static.report.dateRange') + ' , ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
        if (viewby == 1) {
            csvRow.push(i18n.t('static.procurementagent.procurementagent') + ' , ' + (document.getElementById("procurementAgentId").selectedOptions[0].text).replaceAll(' ', '%20'))
        } else if (viewby == 2) {
            csvRow.push(i18n.t('static.budget.fundingsource') + ' , ' + (document.getElementById("fundingSourceId").selectedOptions[0].text).replaceAll(' ', '%20'))
        }

        csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push(i18n.t('static.report.version').replaceAll(' ', '%20') + '  ,  ' + (document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20'))
        this.state.planningUnitLabels.map(ele =>
            csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
        csvRow.push(i18n.t('static.program.isincludeplannedshipment').replaceAll(' ', '%20') + ' , ' + (document.getElementById("isPlannedShipmentId").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')

        const headers = [];
        if (viewby == 3) {
            columns.splice(0, 2);
            columns.map((item, idx) => { headers[idx] = ((item.text)) });
        } else {
            columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });
        }




        var A = [headers]
        // this.state.data.map(ele => A.push([(getLabelText(ele.program.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (new moment(ele.inventoryDate).format('MMM YYYY')).replaceAll(' ', '%20'), ele.stockAdjustemntQty, ele.lastModifiedBy.username, new moment(ele.lastModifiedDate).format('MMM-DD-YYYY'), ele.notes]));
        if (viewby == 1) {
            this.state.data.map(ele => A.push([(getLabelText(ele.procurementAgent.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (ele.procurementAgent.code.replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.qty, ele.productCost, ele.freightPerc, ele.freightCost, ele.totalCost]));
        } else if (viewby == 2) {
            this.state.data.map(ele => A.push([(getLabelText(ele.fundingSource.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (ele.fundingSource.code.replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.qty, ele.productCost, ele.freightPerc, ele.freightCost, ele.totalCost]));
        } else {
            this.state.data.map(ele => A.push([(getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.qty, ele.productCost, ele.freightPerc, ele.freightCost, ele.totalCost]));
        }

        // this.state.data.map(ele => [(ele.procurementAgent).replaceAll(',', ' ').replaceAll(' ', '%20'), (ele.planningUnit).replaceAll(',', ' ').replaceAll(' ', '%20'), ele.qty, ele.totalProductCost, ele.freightPer,ele.freightCost, ele.totalCost]);
        for (var i = 0; i < A.length; i++) {
            console.log(A[i])
            csvRow.push(A[i].join(","))

        }

        var csvString = csvRow.join("%0A")
        console.log('csvString' + csvString)
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.report.procurementAgent') + ' by ' + document.getElementById("viewById").selectedOptions[0].text + "-" + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
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
            var viewby = document.getElementById("viewById").value;

            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.procurementAgent') + ' by ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })

                    if (viewby == 1) {
                        doc.text(i18n.t('static.procurementagent.procurementagent') + ' : ' + document.getElementById("procurementAgentId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                            align: 'left'
                        })
                    } else if (viewby == 2) {
                        doc.text(i18n.t('static.budget.fundingsource') + ' : ' + document.getElementById("fundingSourceId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                            align: 'left'
                        })
                    }

                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })

                    doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("isPlannedShipmentId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 170, {
                        align: 'left'
                    })

                    var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 190, planningText)


                }

            }
        }

        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(8);

        var viewby = document.getElementById("viewById").value;


        const headers = [];

        let data = [];
        if (viewby == 1) {
            columns.map((item, idx) => { headers[idx] = (item.text) });
            data = this.state.data.map(ele => [getLabelText(ele.procurementAgent.label, this.state.lang), ele.procurementAgent.code, getLabelText(ele.planningUnit.label, this.state.lang), (ele.qty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.productCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (parseFloat(ele.freightPerc).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.freightCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.totalCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")]);
        } else if (viewby == 2) {
            columns.map((item, idx) => { headers[idx] = (item.text) });
            data = this.state.data.map(ele => [getLabelText(ele.fundingSource.label, this.state.lang), ele.fundingSource.code, getLabelText(ele.planningUnit.label, this.state.lang), (ele.qty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.productCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (parseFloat(ele.freightPerc).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.freightCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.totalCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")]);
        } else {
            columns.splice(0, 2);
            columns.map((item, idx) => { headers[idx] = (item.text) });
            data = this.state.data.map(ele => [getLabelText(ele.planningUnit.label, this.state.lang), (ele.qty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.productCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (parseFloat(ele.freightPerc).toFixed(2)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.freightCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), (ele.totalCost).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")]);
        }
        let startY = 190 + (this.state.planningUnitValues.length * 3)
        let content = {
            margin: { top: 80, bottom: 70 },
            startY: startY,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 76, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 148 },
                2: { cellWidth: 157.89 },
            }
        };
        if (viewby != 2 && viewby != 1) {
            content = {
                margin: { top: 80, bottom: 70 },
                startY: startY,
                head: [headers],
                body: data,
                styles: { lineWidth: 1, fontSize: 8, cellWidth: 108, halign: 'center' },
                columnStyles: {
                    0: { cellWidth: 221.89 },
                }
            };
        }

        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.report.procurementAgent') + ' by ' + document.getElementById("viewById").selectedOptions[0].text + ".pdf")
    }

    buildJExcel() {
        let shipmentCosttList = this.state.data;
        // console.log("shipmentCosttList---->", shipmentCosttList);
        let shipmentCostArray = [];
        let count = 0;

        let viewby = this.state.viewby;

        for (var j = 0; j < shipmentCosttList.length; j++) {
            data = [];
            data[0] = (viewby == 1) ? (getLabelText(shipmentCosttList[j].procurementAgent.label, this.state.lang)) : ((viewby == 2) ? (getLabelText(shipmentCosttList[j].fundingSource.label, this.state.lang)) : ({}))
            data[1] = (viewby == 1) ? shipmentCosttList[j].procurementAgent.code : ((viewby == 2) ? shipmentCosttList[j].fundingSource.code : {})
            data[2] = getLabelText(shipmentCosttList[j].planningUnit.label, this.state.lang)
            data[3] = this.addCommas(shipmentCosttList[j].qty)
            data[4] = this.addCommas(shipmentCosttList[j].productCost)
            data[5] = shipmentCosttList[j].freightPerc.toFixed(2)
            data[6] = this.addCommas(shipmentCosttList[j].freightCost)
            data[7] = this.addCommas(shipmentCosttList[j].totalCost)

            shipmentCostArray[count] = data;
            count++;
        }
        // if (shipmentCosttList.length == 0) {
        //     data = [];
        //     shipmentCostArray[0] = data;
        // }
        // console.log("shipmentCostArray---->", shipmentCostArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = shipmentCostArray;



        // console.log("RENDER VIEWBY-------", viewby);
        let obj1 = {}
        let obj2 = {}
        if (viewby == 1) {
            obj1 = {
                // dataField: 'procurementAgent.label',
                // text: 'Procurement Agent',
                // sort: true,
                // align: 'center',
                // headerAlign: 'center',
                // formatter: (cell, row) => {
                //     return getLabelText(cell, this.state.lang);
                // },
                // style: { width: '70px' },

                title: i18n.t('static.procurementagent.procurementagent'),
                type: 'text',
                readOnly: true
            }

            obj2 = {
                // dataField: 'procurementAgent.code',
                // text: 'Procurement Agent Code',
                // sort: true,
                // align: 'center',
                // headerAlign: 'center',
                // style: { width: '70px' },

                title: i18n.t('static.report.procurementagentcode'),
                type: 'text',
                readOnly: true
            }

        } else if (viewby == 2) {
            obj1 = {
                // dataField: 'fundingSource.label',
                // text: i18n.t('static.budget.fundingsource'),
                // sort: true,
                // align: 'center',
                // headerAlign: 'center',
                // formatter: (cell, row) => {
                //     return getLabelText(cell, this.state.lang);
                // },
                // style: { width: '100px' },

                title: i18n.t('static.budget.fundingsource'),
                type: 'text',
                readOnly: true
            }

            obj2 = {
                // dataField: 'fundingSource.code',
                // text: i18n.t('static.fundingsource.fundingsourceCode'),
                // sort: true,
                // align: 'center',
                // headerAlign: 'center',
                // style: { width: '100px' },

                title: i18n.t('static.fundingsource.fundingsourceCode'),
                type: 'text',
                readOnly: true
            }
        } else {
            obj1 = {
                // hidden: true,
                type: 'hidden',
            }

            obj2 = {
                // hidden: true
                type: 'hidden',

            }
        }

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 70, 150],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                obj1,
                obj2,
                {
                    title: i18n.t('static.report.planningUnit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.qty'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.productCost'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.freightPer'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.freightCost'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.totalCost'),
                    type: 'text',
                    readOnly: true
                },
            ],
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
                show: '',
                entries: '',
            },
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
        console.log("-------------------IN FETCHDATA-----------------------------");
        let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;
        let viewby = document.getElementById("viewById").value;
        let procurementAgentId = document.getElementById("procurementAgentId").value;
        let fundingSourceId = document.getElementById("fundingSourceId").value;
        let isPlannedShipmentId = document.getElementById("isPlannedShipmentId").value;

        let planningUnitIds = this.state.planningUnitValues.length == this.state.planningUnits.length ? [] : this.state.planningUnitValues.map(ele => (ele.value).toString());
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();

        if (viewby == 1) {
            if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0 && procurementAgentId > 0) {
                if (versionId.includes('Local')) {
                    planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value))
                    var db1;
                    var storeOS;
                    getDatabase();
                    this.setState({ loading: true })
                    var regionList = [];
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            loading: false
                        })
                    }.bind(this);
                    openRequest.onsuccess = function (e) {
                        var version = (versionId.split('(')[0]).trim()

                        //for user id
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);

                        //for program id
                        var program = `${programId}_v${version}_uId_${userId}`

                        db1 = e.target.result;
                        var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                        var programDataOs = programDataTransaction.objectStore('programData');
                        // console.log(program)
                        var programRequest = programDataOs.get(program);
                        programRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                loading: false
                            })
                        }.bind(this);
                        programRequest.onsuccess = function (e) {
                            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);


                            var programTransaction = db1.transaction(['program'], 'readwrite');
                            var programOs = programTransaction.objectStore('program');
                            var program1Request = programOs.getAll();

                            program1Request.onerror = function (event) {
                                this.setState({
                                    loading: false
                                })
                            }.bind(this);
                            program1Request.onsuccess = function (event) {
                                
                                var programResult = [];
                                programResult = program1Request.result;
                                let airFreight = 0;
                                let seaFreight = 0;
                                for (var k = 0; k < programResult.length; k++) {
                                    if (programId == programResult[k].programId) {
                                        airFreight = programResult[k].airFreightPerc;
                                        seaFreight = programResult[k].seaFreightPerc;
                                    }
                                }

                                var shipmentList = (programJson.shipmentList);
                                console.log("shipmentList----*********----", shipmentList);

                                const activeFilter = shipmentList.filter(c => (c.active == true || c.active == "true"));
                                // const activeFilter = shipmentList;
                                let isPlannedShipment = [];
                                if (isPlannedShipmentId == 1) {//yes includePlannedShipments = 1 means the report will include all shipments that are Active and not Cancelled
                                    isPlannedShipment = activeFilter.filter(c => c.shipmentStatus.id != 8);
                                } else {//no includePlannedShipments = 0 means only(4,5,6,7) Approve, Shipped, Arrived, Delivered statuses will be included in the report
                                    isPlannedShipment = activeFilter.filter(c => (c.shipmentStatus.id == 4 && c.shipmentStatus.id == 5 && c.shipmentStatus.id == 6 && c.shipmentStatus.id == 7));
                                }

                                const procurementAgentFilter = isPlannedShipment.filter(c => c.procurementAgent.id == procurementAgentId);
                                // const dateFilter = procurementAgentFilter.filter(c => moment(c.shippedDate).isBetween(startDate, endDate, null, '[)'));
                                // EXPECTED_DELIVERY_DATE
                                // console.log("startDate===>", startDate);
                                // console.log("stopDate===>", endDate);
                                const dateFilter = procurementAgentFilter.filter(c => moment((c.receivedDate == null || c.receivedDate == "") ? c.expectedDeliveryDate : c.receivedDate).isBetween(startDate, endDate, null, '[)'));
                                console.log("dateFilter====>", dateFilter);
                                let data = [];
                                let planningUnitFilter = [];
                                for (let i = 0; i < planningUnitIds.length; i++) {
                                    for (let j = 0; j < dateFilter.length; j++) {
                                        if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
                                            planningUnitFilter.push(dateFilter[j]);
                                        }
                                    }
                                }
                                // console.log("offline data----", planningUnitFilter);
                                for (let j = 0; j < planningUnitFilter.length; j++) {
                                    // console.log("hi===>", parseFloat((((planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd) / (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd)) * 100).toFixed(2)));
                                    let freight = 0;
                                    if (planningUnitFilter[j].shipmentMode === "Air") {
                                        freight = airFreight;
                                    } else {
                                        freight = seaFreight;
                                    }
                                    let json = {
                                        "active": true,
                                        "shipmentId": planningUnitFilter[j].shipmentId,
                                        "procurementAgent": planningUnitFilter[j].procurementAgent,
                                        "fundingSource": planningUnitFilter[j].fundingSource,
                                        "planningUnit": planningUnitFilter[j].planningUnit,
                                        "qty": planningUnitFilter[j].shipmentQty,
                                        "productCost": planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd,
                                        "freightPerc": isNaN(parseFloat((((planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd) / (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd)) * 100).toFixed(2))) ? 0.00 : parseFloat((((planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd) / (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd)) * 100).toFixed(2)),
                                        "freightCost": planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd,
                                        "totalCost": (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd) + (planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd),
                                        "currency": planningUnitFilter[j].currency
                                    }
                                    data.push(json);
                                }
                                console.log("data----->", data);
                                var planningUnitsinData = data.map(q => q.planningUnit.id);
                                var useFilter = planningUnitsinData.filter((q, idx) => planningUnitsinData.indexOf(q) === idx);
                                // console.log("userFilter===>", useFilter);
                                var filteredData = [];
                                var myJson = [];
                                for (var uf = 0; uf < useFilter.length; uf++) {
                                    // for (var p = 0; p < data.length; p++) {
                                    var planningUnitFilterdata = data.filter(c => c.planningUnit.id == useFilter[uf]);
                                    // console.log("planningUnitFilterdata===>", planningUnitFilterdata[0]);
                                    var qty = 0;
                                    var productCost = 0;
                                    var freightPerc = 0;
                                    var freightCost = 0;
                                    var totalCost = 0;
                                    for (var pf = 0; pf < planningUnitFilterdata.length; pf++) {
                                        qty = qty + planningUnitFilterdata[pf].qty;
                                        productCost = productCost + planningUnitFilterdata[pf].productCost;
                                        freightPerc = parseFloat(freightPerc) + isNaN(parseFloat((((planningUnitFilterdata[pf].freightCost * planningUnitFilterdata[pf].currency.conversionRateToUsd) / (planningUnitFilterdata[pf].productCost * planningUnitFilterdata[pf].currency.conversionRateToUsd)) * 100).toFixed(2))) ? 0.00 : parseFloat((((planningUnitFilterdata[pf].freightCost * planningUnitFilterdata[pf].currency.conversionRateToUsd) / (planningUnitFilterdata[pf].productCost * planningUnitFilterdata[pf].currency.conversionRateToUsd)) * 100).toFixed(2));
                                        freightCost = freightCost + planningUnitFilterdata[pf].freightCost * planningUnitFilterdata[pf].currency.conversionRateToUsd;
                                        totalCost = totalCost + (planningUnitFilterdata[pf].productCost * planningUnitFilterdata[pf].currency.conversionRateToUsd) + (planningUnitFilterdata[pf].freightCost * planningUnitFilterdata[pf].currency.conversionRateToUsd);
                                    }
                                    myJson = {
                                        "active": true,
                                        "shipmentId": planningUnitFilterdata[0].shipmentId,
                                        "procurementAgent": planningUnitFilterdata[0].procurementAgent,
                                        "fundingSource": planningUnitFilterdata[0].fundingSource,
                                        "planningUnit": planningUnitFilterdata[0].planningUnit,
                                        "qty": qty,
                                        "productCost": productCost,
                                        "freightPerc": freightPerc,
                                        "freightCost": freightCost,
                                        "totalCost": totalCost,
                                    }


                                    // }
                                    filteredData.push(myJson);
                                }
                                console.log("filteredData=====>", filteredData);
                                this.setState({
                                    data: filteredData
                                    , message: ''
                                }, () => {
                                    this.buildJExcel();
                                })
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                } else {
                    this.setState({
                        message: '',
                        loading: true
                    })
                    let includePlannedShipments = true;
                    if (isPlannedShipmentId == 1) {
                        includePlannedShipments = true;
                    } else {
                        includePlannedShipments = false;
                    }
                    var inputjson = {
                        procurementAgentId: procurementAgentId,
                        programId: programId,
                        versionId: versionId,
                        startDate: new moment(startDate),
                        stopDate: new moment(endDate),
                        planningUnitIds: planningUnitIds,
                        includePlannedShipments: includePlannedShipments,
                    }
                    console.log("inputjson-------", inputjson);
                    AuthenticationService.setupAxiosInterceptors();
                    ReportService.procurementAgentExporttList(inputjson)
                        .then(response => {
                            console.log("Online Data------", response.data);
                            this.setState({
                                data: response.data
                            }, () => {
                                this.consolidatedProgramList();
                                this.consolidatedProcurementAgentList();
                                this.buildJExcel();
                            })
                        }).catch(
                            error => {
                                this.setState({
                                    data: [], loading: false
                                }, () => {
                                    this.consolidatedProgramList();
                                    this.consolidatedProcurementAgentList();
                                    this.el = jexcel(document.getElementById("tableDiv"), '');
                                    this.el.destroy();
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
                                            this.setState({ loading: false, message: i18n.t(error.response.data.messageCode) });
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
                this.setState({ message: i18n.t('static.report.selectProgram'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (this.state.planningUnitValues.length == 0) {
                this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (procurementAgentId == 0) {
                this.setState({ message: i18n.t('static.procurementAgent.selectProcurementAgent'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })
            }
        } else if (viewby == 2) {
            if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0 && fundingSourceId > 0) {
                if (versionId.includes('Local')) {
                    planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value))
                    var db1;
                    var storeOS;
                    getDatabase();
                    var regionList = [];
                    this.setState({ loading: true })
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            loading: false
                        })
                    }.bind(this);
                    openRequest.onsuccess = function (e) {
                        var version = (versionId.split('(')[0]).trim()

                        //for user id
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);

                        //for program id
                        var program = `${programId}_v${version}_uId_${userId}`

                        db1 = e.target.result;
                        var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                        var programDataOs = programDataTransaction.objectStore('programData');
                        // console.log(program)
                        var programRequest = programDataOs.get(program);
                        programRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                loading: false
                            })
                        }.bind(this);
                        programRequest.onsuccess = function (e) {
                            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);


                            var programTransaction = db1.transaction(['program'], 'readwrite');
                            var programOs = programTransaction.objectStore('program');
                            var program1Request = programOs.getAll();

                            program1Request.onerror = function (event) {
                                this.setState({
                                    loading: false
                                })
                            }.bind(this);
                            program1Request.onsuccess = function (event) {
                                
                                var programResult = [];
                                programResult = program1Request.result;
                                let airFreight = 0;
                                let seaFreight = 0;
                                for (var k = 0; k < programResult.length; k++) {
                                    if (programId == programResult[k].programId) {
                                        airFreight = programResult[k].airFreightPerc;
                                        seaFreight = programResult[k].seaFreightPerc;
                                    }
                                }

                                var shipmentList = (programJson.shipmentList);

                                const activeFilter = shipmentList.filter(c => (c.active == true || c.active == "true"));
                                // const planningUnitFilter = activeFilter.filter(c => c.planningUnit.id == planningUnitId);

                                let isPlannedShipment = [];
                                if (isPlannedShipmentId == 1) {//yes includePlannedShipments = 1 means the report will include all shipments that are Active and not Cancelled
                                    isPlannedShipment = activeFilter.filter(c => c.shipmentStatus.id != 8);
                                } else {//no includePlannedShipments = 0 means only(4,5,6,7) Approve, Shipped, Arrived, Delivered statuses will be included in the report
                                    isPlannedShipment = activeFilter.filter(c => (c.shipmentStatus.id == 4 && c.shipmentStatus.id == 5 && c.shipmentStatus.id == 6 && c.shipmentStatus.id == 7));
                                }

                                const fundingSourceFilter = isPlannedShipment.filter(c => c.fundingSource.id == fundingSourceId);

                                // const dateFilter = fundingSourceFilter.filter(c => moment(c.shippedDate).isBetween(startDate, endDate, null, '[)'));

                                const dateFilter = fundingSourceFilter.filter(c => moment((c.receivedDate == null || c.receivedDate == "") ? c.expectedDeliveryDate : c.receivedDate).isBetween(startDate, endDate, null, '[)'));
                                console.log("DB LIST---", dateFilter);
                                console.log("SELECTED LIST---", planningUnitIds);

                                let data = [];
                                let planningUnitFilter = [];
                                for (let i = 0; i < planningUnitIds.length; i++) {
                                    for (let j = 0; j < dateFilter.length; j++) {
                                        if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
                                            planningUnitFilter.push(dateFilter[j]);
                                        }
                                    }
                                }

                                console.log("offline data----", planningUnitFilter);
                                for (let j = 0; j < planningUnitFilter.length; j++) {
                                    let freight = 0;
                                    if (planningUnitFilter[j].shipmentMode === "Air") {
                                        freight = airFreight;
                                    } else {
                                        freight = seaFreight;
                                    }
                                    let json = {
                                        "active": true,
                                        "shipmentId": planningUnitFilter[j].shipmentId,
                                        "fundingSource": planningUnitFilter[j].fundingSource,
                                        "planningUnit": planningUnitFilter[j].planningUnit,
                                        "qty": planningUnitFilter[j].shipmentQty,
                                        "productCost": planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd,
                                        "freightPerc": parseFloat((((planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd) / (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd)) * 100).toFixed(2)),
                                        "freightCost": planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd,
                                        "totalCost": (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd) + (planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd),
                                        "currency": planningUnitFilter[j].currency
                                    }
                                    data.push(json);
                                }

                                var planningUnitsinData = data.map(q => q.planningUnit.id);
                                var useFilter = planningUnitsinData.filter((q, idx) => planningUnitsinData.indexOf(q) === idx);
                                // console.log("userFilter===>", useFilter);
                                var filteredData = [];
                                var myJson = [];
                                for (var uf = 0; uf < useFilter.length; uf++) {
                                    // for (var p = 0; p < data.length; p++) {
                                    var planningUnitFilterdata = data.filter(c => c.planningUnit.id == useFilter[uf]);
                                    console.log("planningUnitFilterdata===>", planningUnitFilterdata);
                                    var qty = 0;
                                    var productCost = 0;
                                    var freightPerc = 0;
                                    var freightCost = 0;
                                    var totalCost = 0;
                                    for (var pf = 0; pf < planningUnitFilterdata.length; pf++) {
                                        qty = qty + planningUnitFilterdata[pf].qty;
                                        productCost = productCost + planningUnitFilterdata[pf].productCost;
                                        freightPerc = parseFloat(freightPerc) + isNaN(parseFloat((((planningUnitFilterdata[pf].freightCost * planningUnitFilterdata[pf].currency.conversionRateToUsd) / (planningUnitFilterdata[pf].productCost * planningUnitFilterdata[pf].currency.conversionRateToUsd)) * 100).toFixed(2))) ? 0.00 : parseFloat((((planningUnitFilterdata[pf].freightCost * planningUnitFilterdata[pf].currency.conversionRateToUsd) / (planningUnitFilterdata[pf].productCost * planningUnitFilterdata[pf].currency.conversionRateToUsd)) * 100).toFixed(2));
                                        freightCost = freightCost + planningUnitFilterdata[pf].freightCost * planningUnitFilterdata[pf].currency.conversionRateToUsd;
                                        totalCost = totalCost + (planningUnitFilterdata[pf].productCost * planningUnitFilterdata[pf].currency.conversionRateToUsd) + (planningUnitFilterdata[pf].freightCost * planningUnitFilterdata[pf].currency.conversionRateToUsd);
                                    }
                                    myJson = {
                                        "active": true,
                                        "shipmentId": planningUnitFilterdata[0].shipmentId,
                                        "procurementAgent": planningUnitFilterdata[0].procurementAgent,
                                        "fundingSource": planningUnitFilterdata[0].fundingSource,
                                        "planningUnit": planningUnitFilterdata[0].planningUnit,
                                        "qty": qty,
                                        "productCost": productCost,
                                        "freightPerc": freightPerc,
                                        "freightCost": freightCost,
                                        "totalCost": totalCost,
                                    }


                                    // }
                                    filteredData.push(myJson);
                                }
                                console.log("end offline data----", filteredData);
                                this.setState({
                                    data: filteredData
                                    , message: ''
                                }, () => {
                                    this.buildJExcel();
                                })
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                } else {
                    this.setState({
                        message: '',
                        loading: true
                    })
                    let includePlannedShipments = true;
                    if (isPlannedShipmentId == 1) {
                        includePlannedShipments = true;
                    } else {
                        includePlannedShipments = false;
                    }
                    var inputjson = {
                        fundingSourceId: fundingSourceId,
                        programId: programId,
                        versionId: versionId,
                        startDate: new moment(startDate),
                        stopDate: new moment(endDate),
                        planningUnitIds: planningUnitIds,
                        includePlannedShipments: includePlannedShipments,
                    }
                    AuthenticationService.setupAxiosInterceptors();
                    ReportService.fundingSourceExportList(inputjson)
                        .then(response => {
                            // console.log(JSON.stringify(response.data))
                            this.setState({
                                data: response.data
                            }, () => {
                                this.consolidatedProgramList();
                                this.consolidatedFundingSourceList();
                                this.buildJExcel();
                            })
                        }).catch(
                            error => {
                                this.setState({
                                    data: [], loading: false
                                }, () => {
                                    this.consolidatedProgramList();
                                    this.consolidatedFundingSourceList();
                                    this.el = jexcel(document.getElementById("tableDiv"), '');
                                    this.el.destroy();

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
                                            this.setState({ loading: false, message: i18n.t(error.response.data.messageCode) });
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
                this.setState({ message: i18n.t('static.report.selectProgram'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (this.state.planningUnitValues.length == 0) {
                this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (fundingSourceId == 0) {
                this.setState({ message: i18n.t('static.fundingSource.selectFundingSource'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })
            }
        } else {
            if (programId > 0 && versionId != 0 && this.state.planningUnitValues.length > 0) {
                if (versionId.includes('Local')) {
                    planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value))

                    var db1;
                    var storeOS;
                    getDatabase();
                    var regionList = [];
                    this.setState({ loading: true })
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            loading: false
                        })
                    }.bind(this);
                    openRequest.onsuccess = function (e) {
                        var version = (versionId.split('(')[0]).trim()

                        //for user id
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);

                        //for program id
                        var program = `${programId}_v${version}_uId_${userId}`

                        db1 = e.target.result;
                        var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                        var programDataOs = programDataTransaction.objectStore('programData');
                        // console.log(program)
                        var programRequest = programDataOs.get(program);
                        programRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                loading: false
                            })
                        }.bind(this);
                        programRequest.onsuccess = function (e) {
                            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);


                            var programTransaction = db1.transaction(['program'], 'readwrite');
                            var programOs = programTransaction.objectStore('program');
                            var program1Request = programOs.getAll();

                            program1Request.onerror = function (event) {
                                this.setState({
                                    loading: false
                                })
                            }.bind(this);
                            program1Request.onsuccess = function (event) {
                                
                                var programResult = [];
                                programResult = program1Request.result;
                                let airFreight = 0;
                                let seaFreight = 0;
                                for (var k = 0; k < programResult.length; k++) {
                                    if (programId == programResult[k].programId) {
                                        airFreight = programResult[k].airFreightPerc;
                                        seaFreight = programResult[k].seaFreightPerc;
                                    }
                                }

                                var shipmentList = (programJson.shipmentList);

                                const activeFilter = shipmentList.filter(c => (c.active == true || c.active == "true"));

                                let isPlannedShipment = [];
                                if (isPlannedShipmentId == 1) {//yes includePlannedShipments = 1 means the report will include all shipments that are Active and not Cancelled
                                    isPlannedShipment = activeFilter.filter(c => c.shipmentStatus.id != 8);
                                } else {//no includePlannedShipments = 0 means only(4,5,6,7) Approve, Shipped, Arrived, Delivered statuses will be included in the report
                                    isPlannedShipment = activeFilter.filter(c => (c.shipmentStatus.id == 4 && c.shipmentStatus.id == 5 && c.shipmentStatus.id == 6 && c.shipmentStatus.id == 7));
                                }

                                // const dateFilter = isPlannedShipment.filter(c => moment(c.shippedDate).isBetween(startDate, endDate, null, '[)'));
                                const dateFilter = isPlannedShipment.filter(c => moment((c.receivedDate == null || c.receivedDate == "") ? c.expectedDeliveryDate : c.receivedDate).isBetween(startDate, endDate, null, '[)'));
                                let data = [];
                                let planningUnitFilter = [];
                                for (let i = 0; i < planningUnitIds.length; i++) {
                                    for (let j = 0; j < dateFilter.length; j++) {
                                        if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
                                            planningUnitFilter.push(dateFilter[j]);
                                        }
                                    }
                                }

                                console.log("offline data----", planningUnitFilter);
                                for (let j = 0; j < planningUnitFilter.length; j++) {
                                    let freight = 0;
                                    if (planningUnitFilter[j].shipmentMode === "Air") {
                                        freight = airFreight;
                                    } else {
                                        freight = seaFreight;
                                    }
                                    let json = {
                                        "active": true,
                                        "shipmentId": planningUnitFilter[j].shipmentId,
                                        "planningUnit": planningUnitFilter[j].planningUnit,
                                        "qty": planningUnitFilter[j].shipmentQty,
                                        "productCost": planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd,
                                        "freightPerc": parseFloat((((planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd) / (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd)) * 100).toFixed(2)),
                                        "freightCost": planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd,
                                        "totalCost": (planningUnitFilter[j].productCost * planningUnitFilter[j].currency.conversionRateToUsd) + (planningUnitFilter[j].freightCost * planningUnitFilter[j].currency.conversionRateToUsd),
                                        "currency": planningUnitFilter[j].currency
                                    }
                                    data.push(json);
                                }

                                var planningUnitsinData = data.map(q => q.planningUnit.id);
                                var useFilter = planningUnitsinData.filter((q, idx) => planningUnitsinData.indexOf(q) === idx);
                                // console.log("userFilter===>", useFilter);
                                var filteredData = [];
                                var myJson = [];
                                for (var uf = 0; uf < useFilter.length; uf++) {
                                    // for (var p = 0; p < data.length; p++) {
                                    var planningUnitFilterdata = data.filter(c => c.planningUnit.id == useFilter[uf]);
                                    // console.log("planningUnitFilterdata===>", planningUnitFilterdata[0]);
                                    var qty = 0;
                                    var productCost = 0;
                                    var freightPerc = 0;
                                    var freightCost = 0;
                                    var totalCost = 0;
                                    for (var pf = 0; pf < planningUnitFilterdata.length; pf++) {
                                        qty = qty + planningUnitFilterdata[pf].qty;
                                        productCost = productCost + planningUnitFilterdata[pf].productCost;
                                        freightPerc = parseFloat(freightPerc) + isNaN(parseFloat((((planningUnitFilterdata[pf].freightCost * planningUnitFilterdata[pf].currency.conversionRateToUsd) / (planningUnitFilterdata[pf].productCost * planningUnitFilterdata[pf].currency.conversionRateToUsd)) * 100).toFixed(2))) ? 0.00 : parseFloat((((planningUnitFilterdata[pf].freightCost * planningUnitFilterdata[pf].currency.conversionRateToUsd) / (planningUnitFilterdata[pf].productCost * planningUnitFilterdata[pf].currency.conversionRateToUsd)) * 100).toFixed(2));
                                        freightCost = freightCost + planningUnitFilterdata[pf].freightCost * planningUnitFilterdata[pf].currency.conversionRateToUsd;
                                        totalCost = totalCost + (planningUnitFilterdata[pf].productCost * planningUnitFilterdata[pf].currency.conversionRateToUsd) + (planningUnitFilterdata[pf].freightCost * planningUnitFilterdata[pf].currency.conversionRateToUsd);
                                    }
                                    myJson = {
                                        "active": true,
                                        "shipmentId": planningUnitFilterdata[0].shipmentId,
                                        "procurementAgent": planningUnitFilterdata[0].procurementAgent,
                                        "fundingSource": planningUnitFilterdata[0].fundingSource,
                                        "planningUnit": planningUnitFilterdata[0].planningUnit,
                                        "qty": qty,
                                        "productCost": productCost.toFixed(2),
                                        "freightPerc": freightPerc,
                                        "freightCost": freightCost,
                                        "totalCost": totalCost.toFixed(2),
                                    }


                                    // }
                                    filteredData.push(myJson);
                                }

                                this.setState({
                                    data: filteredData
                                    , message: ''
                                }, () => {
                                    this.buildJExcel();
                                })
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                } else {
                    this.setState({
                        message: '',
                        loading: true
                    })
                    let includePlannedShipments = true;
                    if (isPlannedShipmentId == 1) {
                        includePlannedShipments = true;
                    } else {
                        includePlannedShipments = false;
                    }
                    var inputjson = {
                        programId: programId,
                        versionId: versionId,
                        startDate: new moment(startDate),
                        stopDate: new moment(endDate),
                        planningUnitIds: planningUnitIds,
                        includePlannedShipments: includePlannedShipments,
                    }
                    AuthenticationService.setupAxiosInterceptors();
                    ReportService.AggregateShipmentByProduct(inputjson)
                        .then(response => {
                            console.log("Online Data------", response.data);
                            this.setState({
                                data: response.data
                            }, () => {
                                this.consolidatedProgramList();
                                this.buildJExcel();
                            })
                        }).catch(
                            error => {
                                this.setState({
                                    data: [], loading: false
                                }, () => {
                                    this.consolidatedProgramList();
                                    this.consolidatedProcurementAgentList();
                                    this.el = jexcel(document.getElementById("tableDiv"), '');
                                    this.el.destroy();
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
                                            this.setState({ loading: false, message: i18n.t(error.response.data.messageCode) });
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
                this.setState({ message: i18n.t('static.report.selectProgram'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (versionId == 0) {
                this.setState({ message: i18n.t('static.program.validversion'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            } else if (this.state.planningUnitValues.length == 0) {
                this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                })

            }
        }

    }

    toggleView = () => {
        let viewby = document.getElementById("viewById").value;
        this.setState({
            viewby: viewby
        });
        if (viewby == 1) {
            document.getElementById("fundingSourceDiv").style.display = "none";
            document.getElementById("procurementAgentDiv").style.display = "block";
            this.setState({
                data: []
            }, () => {
                this.fetchData();
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
                // this.consolidatedProgramList();
                // this.consolidatedProcurementAgentList();
            })


        } else if (viewby == 2) {
            document.getElementById("procurementAgentDiv").style.display = "none";
            document.getElementById("fundingSourceDiv").style.display = "block";
            this.setState({
                data: []
            }, () => {
                this.fetchData();
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
                // this.consolidatedProgramList();
                // this.consolidatedProcurementAgentList();
            })


        } else {
            document.getElementById("procurementAgentDiv").style.display = "none";
            document.getElementById("fundingSourceDiv").style.display = "none";
            this.setState({
                data: []
            }, () => {
                // this.consolidatedProgramList();
                // this.consolidatedProcurementAgentList();
                this.fetchData();
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
            })



        }
    }

    componentDidMount() {
        this.getProcurementAgent();
        this.getFundingSource();
        this.getPrograms();
        document.getElementById("fundingSourceDiv").style.display = "none";
        let viewby = document.getElementById("viewById").value;
        this.setState({
            viewby: viewby
        });

    }

    getFundingSource = () => {
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            FundingSourceService.getFundingSourceListAll()
                .then(response => {
                    // console.log(JSON.stringify(response.data))
                    this.setState({
                        fundingSources: response.data, loading: false
                    }, () => { this.consolidatedFundingSourceList() })
                }).catch(
                    error => {
                        this.setState({
                            fundingSources: [], loading: false
                        }, () => { this.consolidatedFundingSourceList() })
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

        } else {
            console.log('offline')
            this.consolidatedFundingSourceList()
            this.setState({ loading: false })
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

                this.setState({
                    fundingSources: proList
                })

            }.bind(this);

        }.bind(this);
    }


    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    addCommas(cell, row) {
        // console.log("row---------->", row);

        cell += '';
        var x = cell.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        // return "(" + currencyCode + ")" + "  " + x1 + x2;
        return x1 + x2;
    }

    render() {

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const { procurementAgents } = this.state;

        const { fundingSources } = this.state;

        const { programs } = this.state;

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {item.versionId}
                    </option>
                )
            }, this);

        const { planningUnits } = this.state
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);

        const { rangeValue } = this.state


        let viewby = this.state.viewby;
        // console.log("RENDER VIEWBY-------", viewby);
        let obj1 = {}
        let obj2 = {}
        if (viewby == 1) {
            obj1 = {
                dataField: 'procurementAgent.label',
                text: 'Procurement Agent',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                },
                style: { width: '70px' },
            }

            obj2 = {
                dataField: 'procurementAgent.code',
                text: 'Procurement Agent Code',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '70px' },
            }

        } else if (viewby == 2) {
            obj1 = {
                dataField: 'fundingSource.label',
                text: i18n.t('static.budget.fundingsource'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                },
                style: { width: '100px' },
            }

            obj2 = {
                dataField: 'fundingSource.code',
                text: i18n.t('static.fundingsource.fundingsourceCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '100px' },
            }
        } else {
            obj1 = {
                hidden: true
            }

            obj2 = {
                hidden: true

            }
        }


        const columns = [
            obj1,
            obj2,
            {
                dataField: 'planningUnit.label',
                text: i18n.t('static.report.planningUnit'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                },
                style: { width: '400px' },
            },
            {
                dataField: 'qty',
                text: i18n.t('static.report.qty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas,
                style: { width: '100px' },
            },
            {
                dataField: 'productCost',
                text: i18n.t('static.report.productCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas,
                style: { width: '100px' },
            },
            {
                dataField: 'freightPerc',
                text: i18n.t('static.report.freightPer'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return cell.toFixed(2);
                },
                style: { width: '100px' },
            },
            {
                dataField: 'freightCost',
                text: i18n.t('static.report.freightCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas,
                style: { width: '100px' },
            },
            {
                dataField: 'totalCost',
                text: i18n.t('static.report.totalCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas,
                style: { width: '100px' },
            },

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
                text: 'All', value: this.state.selRegion.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5>{i18n.t(this.props.match.params.message)}</h5>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <SupplyPlanFormulas ref="formulaeChild" />
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-reporticon">

                        {/* <div className="card-header-actions">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                        </div> */}
                        <Online>
                            {
                                this.state.data.length > 0 &&
                                <div className="card-header-actions">
                                    <a className="card-header-action">
                                        <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleShippmentCost() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                                    </a>
                                    <a className="card-header-action">
                                        <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
                                    </a>
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                                </div>
                            }
                        </Online>
                        <Offline>
                            {
                                this.state.data.length > 0 &&
                                <div className="card-header-actions">
                                    <a className="card-header-action">
                                        <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleShippmentCost() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                                    </a>
                                    <a className="card-header-action">
                                        <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                                    </a>
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                                </div>
                            }
                        </Offline>
                    </div>
                    <CardBody className="pt-lg-2 pb-lg-5">

                        <div className="pl-0">
                            <div className="row ">
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc"></span></Label>
                                    <div className="controls  Regioncalender">

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
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                                    <div className="controls">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="versionId"
                                                id="versionId"
                                                bsSize="sm"
                                                onChange={(e) => { this.getPlanningUnit(); }}
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
                                        />

                                    </div>
                                </FormGroup>

                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="isPlannedShipmentId"
                                                id="isPlannedShipmentId"
                                                bsSize="sm"
                                                onChange={this.fetchData}
                                            >
                                                <option value="1">{i18n.t('static.program.yes')}</option>
                                                <option value="2">{i18n.t('static.program.no')}</option>
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
                                                {/* <option value="-1">{i18n.t('static.common.select')}</option> */}
                                                <option value="1">{i18n.t('static.procurementagent.procurementagent')}</option>
                                                <option value="2">{i18n.t('static.dashboard.fundingsource')}</option>
                                                <option value="3">{i18n.t('static.planningunit.planningunit')}</option>
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="col-md-3" id="procurementAgentDiv">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.procurementagent.procurementagent')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="procurementAgentId"
                                                id="procurementAgentId"
                                                bsSize="sm"
                                                onChange={this.fetchData}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {procurementAgents.length > 0
                                                    && procurementAgents.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.procurementAgentId}>
                                                                {getLabelText(item.label, this.state.lang)}
                                                            </option>
                                                        )
                                                    }, this)}

                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="col-md-3" id="fundingSourceDiv">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="fundingSourceId"
                                                id="fundingSourceId"
                                                bsSize="sm"
                                                onChange={this.fetchData}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {fundingSources.length > 0
                                                    && fundingSources.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.fundingSourceId}>
                                                                {getLabelText(item.label, this.state.lang)}
                                                            </option>
                                                        )
                                                    }, this)}

                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>



                            </div>
                        </div>
                        <div className="ReportSearchMarginTop">
                            <div id="tableDiv" className="jexcelremoveReadonlybackground">
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
            </div>
        );
    }
}
export default ProcurementAgentExport;



