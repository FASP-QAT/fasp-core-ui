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

// const pickerLang = {
//     months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
//     from: 'From', to: 'To',
// }



// class StockAdjustmentComponent extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             regionList: [],
//             message: '',
//             selRegion: [],
//             realmCountryList: [],
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
//         var openRequest = indexedDB.open('fasp', 1);
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
//         var openRequest = indexedDB.open('fasp', 1);
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
//             planningUnits: []
//         }, () => {
//             if (versionId.includes('Local')) {
//                 const lan = 'en';
//                 var db1;
//                 var storeOS;
//                 getDatabase();
//                 var openRequest = indexedDB.open('fasp', 1);
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
//                         console.log(myResult)
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
//                     console.log('**' + JSON.stringify(response.data))
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
//         this.setState({
//             planningUnitValues: planningUnitIds.map(ele => ele.value),
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

//         var csvRow = [];
//         csvRow.push((i18n.t('static.report.dateRange') + ' , ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
//         csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
//         csvRow.push(i18n.t('static.report.version').replaceAll(' ', '%20') + '  ,  ' + (document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20'))
//         this.state.planningUnitLabels.map(ele =>
//             csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
//         csvRow.push('')
//         csvRow.push('')
//         csvRow.push('')
//         csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
//         csvRow.push('')

//         const headers = [];
//         columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });


//         var A = [headers]
//         this.state.data.map(ele => A.push([(getLabelText(ele.program.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (new moment(ele.inventoryDate).format('MMM YYYY')).replaceAll(' ', '%20'), ele.stockAdjustemntQty, ele.lastModifiedBy.username, new moment(ele.lastModifiedDate).format('MMM-DD-YYYY'), ele.notes]));
//         for (var i = 0; i < A.length; i++) {
//             console.log(A[i])
//             csvRow.push(A[i].join(","))

//         }

//         var csvString = csvRow.join("%0A")
//         console.log('csvString' + csvString)
//         var a = document.createElement("a")
//         a.href = 'data:attachment/csv,' + csvString
//         a.target = "_Blank"
//         a.download = i18n.t('static.report.stockAdjustment') + "-" + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
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
//                 doc.text(i18n.t('static.report.stockAdjustment'), doc.internal.pageSize.width / 2, 60, {
//                     align: 'center'
//                 })
//                 if (i == 1) {
//                     doc.setFontSize(8)
//                     doc.setFont('helvetica', 'normal')
//                     doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
//                         align: 'left'
//                     })
//                     doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
//                         align: 'left'
//                     })

//                     doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
//                         align: 'left'
//                     })
//                     var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
//                     doc.text(doc.internal.pageSize.width / 8, 150, planningText)

//                 }

//             }
//         }

//         const unit = "pt";
//         const size = "A4"; // Use A1, A2, A3 or A4
//         const orientation = "landscape"; // portrait or landscape

//         const marginLeft = 10;
//         const doc = new jsPDF(orientation, unit, size);

//         doc.setFontSize(8);



//         const headers = [];
//         columns.map((item, idx) => { headers[idx] = (item.text) });
//         let data = this.state.data.map(ele => [getLabelText(ele.program.label, this.state.lang), getLabelText(ele.planningUnit.label, this.state.lang), new moment(ele.inventoryDate).format('MMM YYYY'), this.formatter(ele.stockAdjustemntQty), ele.lastModifiedBy.username, new moment(ele.lastModifiedDate).format('MMM-DD-YYYY'), ele.notes]);
//         let content = {
//             margin: { top: 40 },
//             startY: 200,
//             head: [headers],
//             body: data,
//             styles: { lineWidth: 1, fontSize: 8, cellWidth: 80, halign: 'center' },
//             columnStyles: {
//                 0: { cellWidth: 170 },
//                 1: { cellWidth: 171.89 },
//                 6: { cellWidth: 100 }
//             }
//         };

//         doc.autoTable(content);
//         addHeaders(doc)
//         addFooters(doc)
//         doc.save(i18n.t('static.report.stockAdjustment') + ".pdf")
//     }



//     fetchData = () => {
//         let versionId = document.getElementById("versionId").value;
//         let programId = document.getElementById("programId").value;

//         let planningUnitIds = this.state.planningUnitValues;
//         let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
//         let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();

//         if (programId > 0 && versionId != 0 && planningUnitIds.length > 0) {
//             if (versionId.includes('Local')) {
//                 var db1;
//                 var storeOS;
//                 getDatabase();
//                 var regionList = [];
//                 var openRequest = indexedDB.open('fasp', 1);
//                 openRequest.onerror = function (event) {
//                     this.setState({
//                         message: i18n.t('static.program.errortext')
//                     })
//                 }.bind(this);
//                 openRequest.onsuccess = function (e) {
//                     db1 = e.target.result;
//                     var programDataTransaction = db1.transaction(['programData'], 'readwrite');
//                     var version = (versionId.split('(')[0]).trim()
//                     var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//                     var userId = userBytes.toString(CryptoJS.enc.Utf8);
//                     var program = `${programId}_v${version}_uId_${userId}`
//                     var programDataOs = programDataTransaction.objectStore('programData');
//                     console.log("1----",program)
//                     var programRequest = programDataOs.get(program);
//                     programRequest.onerror = function (event) {
//                         this.setState({
//                             message: i18n.t('static.program.errortext')
//                         })
//                     }.bind(this);
//                     programRequest.onsuccess = function (e) {
//                         console.log("2----",programRequest)
//                         var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
//                         var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
//                         var programJson = JSON.parse(programData);
//                         var inventoryList = []
//                         // &&( c.inventoryDate>=startDate&& c.inventoryDate<=endDate)
//                         planningUnitIds.map(planningUnitId =>
//                             inventoryList = [...inventoryList, ...((programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId &&( c.inventoryDate>=startDate && c.inventoryDate<=endDate)))]);
//                         var dates = new Set(inventoryList.map(ele => ele.inventoryDate))
//                         var data = []
//                         planningUnitIds.map(planningUnitId => {
//                             dates.map(dt => {

//                                 var list = inventoryList.filter(c => c.inventoryDate === dt && c.planningUnit.id == planningUnitId)
//                                 console.log("3--->",list)
//                                 if (list.length > 0) {
//                                     var adjustment = 0;
//                                     list.map(ele => adjustment = adjustment + ele.adjustmentQty);

//                                     var json = {
//                                         program: programJson,
//                                         inventoryDate: new moment(dt).format('MMM YYYY'),
//                                         planningUnit: list[0].planningUnit,
//                                         stockAdjustemntQty: adjustment,
//                                         lastModifiedBy: programJson.currentVersion.lastModifiedBy,
//                                         lastModifiedDate: programJson.currentVersion.lastModifiedDate,
//                                         notes: list[0].notes
//                                     }
//                                     data.push(json)
//                                 } else {

//                                 }
//                             })
//                         })
//                         console.log(data)
//                         this.setState({
//                             data: data
//                             , message: ''
//                         })
//                     }.bind(this)
//                 }.bind(this)
//             } else {
//                 var inputjson = {
//                     programId: programId,
//                     versionId: versionId,
//                     startDate: new moment(startDate),
//                     stopDate: new moment(endDate),
//                     planningUnitIds: planningUnitIds
//                 }
//                 AuthenticationService.setupAxiosInterceptors();
//                 console.log("inputJson---->",inputjson);
//                 ReportService.stockAdjustmentList(inputjson)
//                     .then(response => {
//                         console.log("-------->");
//                         console.log(JSON.stringify(response.data))
//                         this.setState({
//                             data: response.data
//                         }
//                         )
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
//                                         this.setState({ message: i18n.t(error.response.data.messageCode) });
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

//         } else {
//             this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] });

//         }
//     }

//     componentDidMount() {
//         this.getPrograms()

//     }

//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
//     }

//     render() {

//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );
//         const { programs } = this.state
//         console.log(programs)
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

//         const { realmCountryList } = this.state;
//         let realmCountries = realmCountryList.length > 0
//             && realmCountryList.map((item, i) => {
//                 return (
//                     <option key={i} value={item.realmCountryId}>
//                         {getLabelText(item.country.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);


//         const { rangeValue } = this.state



//         const columns = [
//             {
//                 dataField: 'program.label',
//                 text: i18n.t('static.program.program'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 style: { width: '170px' },
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 }
//             },
//             {
//                 dataField: 'planningUnit.label',
//                 text: i18n.t('static.planningunit.planningunit'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 style: { width: '170px' },
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 }
//             },
//             {
//                 dataField: 'inventoryDate',
//                 text: i18n.t('static.report.month'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 style: { width: '80px' },
//                 formatter: (cell, row) => {
//                     return new moment(cell).format('MMM YYYY');
//                 }
//             },
//             {
//                 dataField: 'stockAdjustemntQty',
//                 text: i18n.t('static.report.stockAdjustment'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 style: { width: '80px' },
//                 formatter: this.formatter

//             },
//             {
//                 dataField: 'lastModifiedBy.username',
//                 text: i18n.t('static.report.lastmodifiedby'),
//                 sort: true,
//                 align: 'center',
//                 style: { width: '80px' },
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'lastModifiedDate',
//                 text: i18n.t('static.report.lastmodifieddate'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 style: { width: '80px' },
//                 formatter: (cell, row) => {
//                     return new moment(cell).format('MMM-DD-YYYY');
//                 }
//             },
//             {
//                 dataField: 'notes',
//                 text: i18n.t('static.program.notes'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 style: { width: '100px' },
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
//                 text: 'All', value: this.state.selRegion.length
//             }]
//         }
//         return (
//             <div className="animated">
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />
//                 <h5>{i18n.t(this.props.match.params.message)}</h5>
//                 <h5>{i18n.t(this.state.message)}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     <CardHeader className="mb-md-3 pb-lg-1">
//                         <i className="icon-menu"></i><strong>Stock Adjustment Report</strong>{' '}
//                         <div className="card-header-actions">
//                             <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
//                             <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
//                         </div>
//                     </CardHeader>
//                     <CardBody className="pb-lg-0">

//                         <Col md="12 pl-0">
//                             <div className="d-md-flex Selectdiv2">
//                                 <FormGroup>
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="Region-box-icon fa fa-sort-desc"></span></Label>
//                                     <div className="controls SelectGo Regioncalender">
//                                         <InputGroup>
//                                             <Picker
//                                                 ref="pickRange"
//                                                 years={{ min: 2013 }}
//                                                 value={rangeValue}
//                                                 lang={pickerLang}
//                                                 //theme="light"
//                                                 onChange={this.handleRangeChange}
//                                                 onDismiss={this.handleRangeDissmis}
//                                             >
//                                                 <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
//                                             </Picker>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>


//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">Program</Label>
//                                     <div className="controls SelectGo">
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
//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">Version</Label>
//                                     <div className="controls SelectGo">
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

//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">Planning Unit</Label>
//                                     <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
//                                     <div className="controls SelectGo">
//                                         <InputGroup className="box">
//                                             <ReactMultiSelectCheckboxes
//                                                 name="planningUnitId"
//                                                 id="planningUnitId"
//                                                 bsSize="md"
//                                                 onChange={(e) => { this.handlePlanningUnitChange(e) }}
//                                                 options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
//                                             />

//                                         </InputGroup>
//                                         </div> 
//                                 </FormGroup>
//                             </div>
//                         </Col>




//                         <ToolkitProvider
//                             keyField="regionId"
//                             data={this.state.data}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (

//                                     <div className="TableCust">
//                                         <div className="col-md-3 pr-0 offset-md-9 text-right mob-Left">
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
//                 <div style={{ display: this.state.loading ? "block" : "none" }}>
//                     <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
//                         <div className="align-items-center">
//                             <div ><h4> <strong>Loading...</strong></h4></div>

//                             <div className="spinner-border blue ml-4" role="status">

//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }
// export default StockAdjustmentComponent;


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
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}



const entityname = i18n.t('static.region.region');

class RegionListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            regionList: [],
            message: '',
            selRegion: [],
            realmCountryList: [],
            lang: localStorage.getItem('lang'),
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            loading: true
        }
        this.editRegion = this.editRegion.bind(this);
        this.addRegion = this.addRegion.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })
        this.filterData(value);
    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }

    filterData() {
        let countryId = document.getElementById("realmCountryId").value;
        if (countryId != 0) {
            const selRegion = this.state.regionList.filter(c => c.realmCountry.realmCountryId == countryId)
            this.setState({
                selRegion: selRegion
            });
        } else {
            this.setState({
                selRegion: this.state.regionList
            });
        }
    }
    editRegion(region) {
        this.props.history.push({
            pathname: `/region/editRegion/${region.regionId}`,
            // state: { region }
        });
    }
    addRegion(region) {
        this.props.history.push({
            pathname: "/region/addRegion"
        });
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RegionService.getRegionList()
            .then(response => {
                console.log("RESP---", response.data);

                if (response.status == 200) {
                    this.setState({
                        regionList: response.data,
                        selRegion: [{
                            "active": true,
                            "regionId": 1,
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                            "planningUnit": "Ceftriaxone 1gm vial,1 vial",
                            "month": "Feb 2020",
                            "stockAdjustment": "100",
                            "createdBy": "Josh",
                            "createdDate": "Feb-01-2020",
                            "notes": "bottle lost",
                            "adjustment": "+",
                            "dataSource": "Cloned Consumption",
                        },
                        {
                            "active": true,
                            "regionId": 2,
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                            "planningUnit": "Ceftriaxone 1gm vial,1 vial",
                            "month": "Mar 2020",
                            "stockAdjustment": "900",
                            "createdBy": "Josh",
                            "createdDate": "Mar-06-2020",
                            "notes": "lost",
                            "adjustment": "+",
                            "dataSource": "Cloned Consumption",
                        },
                        {
                            "active": true,
                            "regionId": 3,
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                            "planningUnit": "Ceftriaxone 1gm vial,1 vial",
                            "month": "Apr 2020",
                            "stockAdjustment": "200",
                            "createdBy": "Josh",
                            "createdDate": "Apr-05-2020",
                            "notes": "damage",
                            "adjustment": "-",
                            "dataSource": "Cloned Consumption",
                        },
                        {
                            "active": true,
                            "regionId": 4,
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                            "planningUnit": "Ceftriaxone 1gm vial,50 vial",
                            "month": "Mar 2020",
                            "stockAdjustment": "900",
                            "createdBy": "Alan",
                            "createdDate": "Mar-01-2020",
                            "notes": "lost",
                            "adjustment": "-",
                            "dataSource": "Facility report",
                        },
                        {
                            "active": true,
                            "regionId": 5,
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health",
                            "planningUnit": "Ceftriaxone 1gm vial,50 vial",
                            "month": "Apr 2020",
                            "stockAdjustment": "1000",
                            "createdBy": "Alan",
                            "createdDate": "Apr-02-2020",
                            "notes": "expire",
                            "adjustment": "-",
                            "dataSource": "Facility report",
                        },
                        {
                            "active": true,
                            "regionId": 6,
                            "programName": "HIV/AIDS - Malawi - National",
                            "planningUnit": "Abacavir 20 mg/mL Solution, 240 mL",
                            "month": "Apr 2020",
                            "stockAdjustment": "500",
                            "createdBy": "Olivia",
                            "createdDate": "Apr-04-2020",
                            "notes": "tablet lost",
                            "adjustment": "-",
                            "dataSource": "Interpolate",
                        },
                        {
                            "active": true,
                            "regionId": 7,
                            "programName": "HIV/AIDS - Malawi - National",
                            "planningUnit": "Abacavir 20 mg/mL Solution, 240 mL",
                            "month": "May 2020",
                            "stockAdjustment": "200",
                            "createdBy": "Olivia",
                            "createdDate": "May-02-2020",
                            "notes": "expire",
                            "adjustment": "+",
                            "dataSource": "Interpolate",
                        }

                        ],
                        loading: false
                    })
                } else {
                    this.setState({ message: response.data.messageCode })
                }
            })

        RealmCountryService.getRealmCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realmCountryList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    render() {

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const { realmCountryList } = this.state;
        let realmCountries = realmCountryList.length > 0
            && realmCountryList.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {getLabelText(item.country.label, this.state.lang)}
                    </option>
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

        const columns = [
            {
                dataField: 'dataSource',
                text: 'Data Source',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '100px' },
            },
            {
                dataField: 'planningUnit',
                text: 'Planning Unit',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '150px' },
            },
            {
                dataField: 'month',
                text: 'Month',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'adjustment',
                text: 'Adjustment',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'stockAdjustment',
                text: 'Stock Adjustment',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'createdBy',
                text: 'Last Updated By',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'createdDate',
                text: 'Last Updated Date',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'notes',
                text: 'Notes',
                sort: true,
                align: 'left',
                headerAlign: 'center',
                style: { width: '200px' },
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
                text: 'All', value: this.state.selRegion.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <CardHeader className="mb-md-3 pb-lg-1">
                        <i className="icon-menu"></i><strong>Stock Adjustment Report</strong>{' '}
                        <div className="card-header-actions">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </div>
                    </CardHeader>
                    <CardBody className="pb-lg-0">

                        <Col md="12 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup>
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="Region-box-icon fa fa-sort-desc"></span></Label>
                                    <div className="controls SelectGo Regioncalender">
                                        <InputGroup>
                                            <Picker
                                                ref="pickRange"
                                                years={{ min: 2013 }}
                                                value={rangeValue}
                                                lang={pickerLang}
                                                //theme="light"
                                                onChange={this.handleRangeChange}
                                                onDismiss={this.handleRangeDissmis}
                                            >
                                                <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                            </Picker>

                                        </InputGroup>
                                    </div>
                                </FormGroup>


                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">Program</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmCountryId"
                                                id="realmCountryId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                <option value="1" selected>HIV/AIDS - Kenya - Ministry Of Health</option>
                                                
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">Version</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmCountryId"
                                                id="realmCountryId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                <option value="1" selected>6</option>
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">Planning Unit</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmCountryId"
                                                id="realmCountryId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                <option value="1" selected>3 Selected</option>
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>




                        <ToolkitProvider
                            keyField="regionId"
                            data={this.state.selRegion}
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
                                            pagination={paginationFactory(options)}
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
export default RegionListComponent;
