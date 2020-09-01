// import React, { Component, lazy, Suspense, DatePicker } from 'react';
// import { Bar, Line, Pie } from 'react-chartjs-2';
// import { Link } from 'react-router-dom';
// import {
//   Badge,
//   Button,
//   ButtonDropdown,
//   ButtonGroup,
//   ButtonToolbar,
//   Card,
//   CardBody,
//   // CardFooter,
//   CardHeader,
//   CardTitle,
//   Col,
//   Widgets,
//   Dropdown,
//   DropdownItem,
//   DropdownMenu,
//   DropdownToggle,
//   Progress,
//   Pagination,
//   PaginationItem,
//   PaginationLink,
//   Row,
//   CardColumns,
//   Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
// } from 'reactstrap';
// import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
// import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
// import { getStyle, hexToRgba } from '@coreui/coreui-pro/dist/js/coreui-utilities'
// import i18n from '../../i18n'
// import Pdf from "react-to-pdf"
// import AuthenticationService from '../Common/AuthenticationService.js';
// import RealmService from '../../api/RealmService';
// import getLabelText from '../../CommonComponent/getLabelText';
// import PlanningUnitService from '../../api/PlanningUnitService';
// import ProductService from '../../api/ProductService';
// import Picker from 'react-month-picker'
// import MonthBox from '../../CommonComponent/MonthBox.js'
// import ProgramService from '../../api/ProgramService';
// import CryptoJS from 'crypto-js'
// import { SECRET_KEY } from '../../Constants.js'
// import moment from "moment";
// import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
// import pdfIcon from '../../assets/img/pdf.png';
// import { Online, Offline } from "react-detect-offline";
// import csvicon from '../../assets/img/csv.png'
// import { LOGO } from '../../CommonComponent/Logo.js'
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// //import fs from 'fs'
// const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// // const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
// const ref = React.createRef();

// const brandPrimary = getStyle('--primary')
// const brandSuccess = getStyle('--success')
// const brandInfo = getStyle('--info')
// const brandWarning = getStyle('--warning')
// const brandDanger = getStyle('--danger')

// const options = {
//   title: {
//     display: true,
//     text: i18n.t('static.dashboard.consumption'),
//     fontColor: 'black'
//   },

//   scales: {

//     yAxes: [{
//       scaleLabel: {
//         display: true,
//         labelString: i18n.t('static.dashboard.consumption'),
//         fontColor: 'black'
//       },
//       ticks: {
//         beginAtZero: true,
//         fontColor: 'black'
//       }
//     }],
//     xAxes: [{
//       ticks: {
//         fontColor: 'black'
//       }
//   }]
//   },

//   tooltips: {
//     enabled: false,
//     custom: CustomTooltips
//   },
//   maintainAspectRatio: false,
//   legend: {
//     display: true,
//     position: 'bottom',
//     labels: {
//       usePointStyle: true,
//       fontColor: "black"
//     }
//   }
// }




// //Random Numbers
// function random(min, max) {
//   return Math.floor(Math.random() * (max - min + 1) + min);
// }

// var elements = 27;
// var data1 = [];
// var data2 = [];
// var data3 = [];

// for (var i = 0; i <= elements; i++) {
//   data1.push(random(50, 200));
//   data2.push(random(80, 100));
//   data3.push(65);
// }

// const pickerLang = {
//   months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
//   from: 'From', to: 'To',
// }


// class Consumption extends Component {
//   constructor(props) {
//     super(props);

//     this.toggle = this.toggle.bind(this);
//     this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

//     this.state = {
//       sortType: 'asc',
//       dropdownOpen: false,
//       radioSelected: 2,
//       realms: [],
//       programs: [],
//       offlinePrograms: [],
//       planningUnits: [],
//       consumptions: [],
//       offlineConsumptionList: [],
//       offlinePlanningUnitList: [],
//       productCategories: [],
//       offlineProductCategoryList: [],
//       show: false,
//       message: '',
//       rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },



//     };
//     this.getPrograms = this.getPrograms.bind(this);
//     this.filterData = this.filterData.bind(this);
//     this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
//     this.handleRangeChange = this.handleRangeChange.bind(this);
//     this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
//     this.getPlanningUnit = this.getPlanningUnit.bind(this);
//     this.getProductCategories = this.getProductCategories.bind(this)
//     //this.pickRange = React.createRef()

//   }


//   makeText = m => {
//     if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
//     return '?'
//   }

//   toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
//   formatter = value => {

//     var cell1 = value
//     cell1 += '';
//     var x = cell1.split('.');
//     var x1 = x[0];
//     var x2 = x.length > 1 ? '.' + x[1] : '';
//     var rgx = /(\d+)(\d{3})/;
//     while (rgx.test(x1)) {
//       x1 = x1.replace(rgx, '$1' + ',' + '$2');
//     }
//     return x1 + x2;
//   }

//   exportCSV() {

//     var csvRow = [];
//     csvRow.push((i18n.t('static.report.dateRange') + ' , ' +this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
//     csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
//     csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
//     csvRow.push('')
//     csvRow.push('')
//     var re;
//     var A = [[(i18n.t('static.report.consumptionDate')).replaceAll(' ', '%20'), (i18n.t('static.report.forecastConsumption')).replaceAll(' ', '%20'), (i18n.t('static.report.actualConsumption')).replaceAll(' ', '%20')]]
//     if (navigator.onLine) {
//       re = this.state.consumptions
//     } else {
//       re = this.state.offlineConsumptionList
//     }

//     for (var item = 0; item < re.length; item++) {
//       A.push([re[item].consumption_date, re[item].forcast, re[item].Actual])
//     }
//     for (var i = 0; i < A.length; i++) {
//       csvRow.push(A[i].join(","))
//     }
//     var csvString = csvRow.join("%0A")
//     var a = document.createElement("a")
//     a.href = 'data:attachment/csv,' + csvString
//     a.target = "_Blank"
//     a.download = i18n.t('static.report.consumption_') + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to) + ".csv"
//     document.body.appendChild(a)
//     a.click()
//   }


//   exportPDF = () => {
//     const addFooters = doc => {

//       const pageCount = doc.internal.getNumberOfPages()

//       doc.setFont('helvetica', 'bold')
//       doc.setFontSize(6)
//       for (var i = 1; i <= pageCount; i++) {
//         doc.setPage(i)

//         doc.setPage(i)
//         doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
//           align: 'center'
//         })
//         doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
//           align: 'center'
//         })


//       }
//     }
//     const addHeaders = doc => {

//       const pageCount = doc.internal.getNumberOfPages()


//       // var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
//       // var reader = new FileReader();

//       //var data='';
//       // Use fs.readFile() method to read the file 
//       //fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
//       //}); 
//       for (var i = 1; i <= pageCount; i++) {
//         doc.setFontSize(12)
//         doc.setFont('helvetica', 'bold')
//         doc.setPage(i)
//         doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
//         /*doc.addImage(data, 10, 30, {
//         align: 'justify'
//         });*/
//         doc.setTextColor("#002f6c");
//         doc.text(i18n.t('static.report.consumptionReport'), doc.internal.pageSize.width / 2, 60, {
//           align: 'center'
//         })
//         if (i == 1) {
//           doc.setFont('helvetica', 'normal')
//           doc.setFontSize(8)
//           doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
//             align: 'left'
//           })
//           doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
//             align: 'left'
//           })
//           doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
//             align: 'left'
//           })
//           doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
//             align: 'left'
//           })
//         }

//       }
//     }
//     const unit = "pt";
//     const size = "A4"; // Use A1, A2, A3 or A4
//     const orientation = "landscape"; // portrait or landscape

//     const marginLeft = 10;
//     const doc = new jsPDF(orientation, unit, size, true);

//     doc.setFontSize(8);

//    // const title = "Consumption Report";
//     var canvas = document.getElementById("cool-canvas");
//     //creates image

//     var canvasImg = canvas.toDataURL("image/png", 1.0);
//     var width = doc.internal.pageSize.width;
//     var height = doc.internal.pageSize.height;
//     var h1 = 100;
//     var aspectwidth1 = (width - h1);

//     doc.addImage(canvasImg, 'png', 50, 220,750,260,'CANVAS');

//     const headers = [[i18n.t('static.report.consumptionDate'),
//     i18n.t('static.report.forecastConsumption'),
//     i18n.t('static.report.actualConsumption')]];
//     const data = navigator.onLine ? this.state.consumptions.map(elt => [elt.consumption_date, this.formatter(elt.forcast), this.formatter(elt.Actual)]) : this.state.finalOfflineConsumption.map(elt => [elt.consumption_date,this.formatter( elt.forcast),this.formatter( elt.Actual)]);

//     let content = {
//       margin: { top: 80 },
//       startY: height,
//       head: headers,
//       body: data,
//       styles: { lineWidth: 1, fontSize: 8, halign : 'center' }

//     };



//     //doc.text(title, marginLeft, 40);
//     doc.autoTable(content);
//     addHeaders(doc)
//     addFooters(doc)
//     doc.save("Consumption.pdf")
//     //creates PDF from img
//     /* var doc = new jsPDF('landscape');
//     doc.setFontSize(20);
//     doc.text(15, 15, "Cool Chart");
//     doc.save('canvas.pdf');*/
//   }



//   filterData() {
//     let programId = document.getElementById("programId").value;
//     let productCategoryId = document.getElementById("productCategoryId").value;
//     let planningUnitId = document.getElementById("planningUnitId").value;
//     let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
//     let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
//     if(productCategoryId>=0 && planningUnitId>0&&programId>0){

//     if (navigator.onLine) {
//       let realmId = AuthenticationService.getRealmId();
//       AuthenticationService.setupAxiosInterceptors();
//       ProductService.getConsumptionData(realmId, programId, planningUnitId, this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01', this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate())
//         .then(response => {
//           console.log(JSON.stringify(response.data));
//           this.setState({
//             consumptions: response.data,
//             message:''
//           })
//         }).catch(
//           error => {
//             this.setState({
//               consumptions: []
//             })

//             if (error.message === "Network Error") {
//               this.setState({ message: error.message });
//             } else {
//               switch (error.response ? error.response.status : "") {
//                 case 500:
//                 case 401:
//                 case 404:
//                 case 406:
//                 case 412:
//                   this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
//                   break;
//                 default:
//                   this.setState({ message: 'static.unkownError' });
//                   break;
//               }
//             }
//           }
//         );
//     } else {
//       // if (planningUnitId != "" && planningUnitId != 0 && productCategoryId != "" && productCategoryId != 0) {
//       var db1;
//       getDatabase();
//       var openRequest = indexedDB.open(INDEXED_DB_NAME,INDEXED_DB_VERSION );
//       openRequest.onsuccess = function (e) {
//         db1 = e.target.result;

//         var transaction = db1.transaction(['programData'], 'readwrite');
//         var programTransaction = transaction.objectStore('programData');
//         var programRequest = programTransaction.get(programId);

//         programRequest.onsuccess = function (event) {
//           var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
//           var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
//           var programJson = JSON.parse(programData);
//           var offlineConsumptionList = (programJson.consumptionList);

//           const activeFilter = offlineConsumptionList.filter(c => (c.active == true || c.active == "true"));

//           const planningUnitFilter = activeFilter.filter(c => c.planningUnit.id == planningUnitId);
//           const productCategoryFilter = planningUnitFilter.filter(c => (c.planningUnit.forecastingUnit != null && c.planningUnit.forecastingUnit != "") && (c.planningUnit.forecastingUnit.productCategory.id == productCategoryId));

//           // const dateFilter = planningUnitFilter.filter(c => moment(c.startDate).isAfter(startDate) && moment(c.stopDate).isBefore(endDate))
//           const dateFilter = productCategoryFilter.filter(c => moment(c.consumptionDate).isBetween(startDate, endDate, null, '[)'))

//           const sorted = dateFilter.sort((a, b) => {
//             var dateA = new Date(a.consumptionDate).getTime();
//             var dateB = new Date(b.consumptionDate).getTime();
//             return dateA > dateB ? 1 : -1;
//           });
//           let previousDate = "";
//           let finalOfflineConsumption = [];
//           var json;

//           for (let i = 0; i <= sorted.length; i++) {
//             let forcast = 0;
//             let actual = 0;
//             if (sorted[i] != null && sorted[i] != "") {
//               previousDate = moment(sorted[i].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY');
//               for (let j = 0; j <= sorted.length; j++) {
//                 if (sorted[j] != null && sorted[j] != "") {
//                   if (previousDate == moment(sorted[j].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY')) {
//                     if (sorted[j].actualFlag == false || sorted[j].actualFlag == "false") {
//                       forcast = forcast + parseFloat(sorted[j].consumptionQty);
//                     }
//                     if (sorted[j].actualFlag == true || sorted[j].actualFlag == "true") {
//                       actual = actual + parseFloat(sorted[j].consumptionQty);
//                     }
//                   }
//                 }
//               }

//               let date = moment(sorted[i].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY');
//               json = {
//                 consumption_date: date,
//                 Actual: actual,
//                 forcast: forcast
//               }

//               if (!finalOfflineConsumption.some(f => f.consumption_date === date)) {
//                 finalOfflineConsumption.push(json);
//               }

//               // console.log("finalOfflineConsumption---", finalOfflineConsumption);

//             }
//           }
//           console.log("final consumption---", finalOfflineConsumption);
//           this.setState({
//             offlineConsumptionList: finalOfflineConsumption
//           });

//         }.bind(this)

//       }.bind(this)
//       // }
//     }}else   if(programId==0){
//       this.setState({ message: i18n.t('static.common.selectProgram') ,consumptions:[]});

//     }else if(productCategoryId==-1){
//       this.setState({ message: i18n.t('static.common.selectProductCategory'),consumptions:[] });

//     }else{
//       this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'),consumptions:[] });

//     }
//   }

//   getPrograms() {
//     if (navigator.onLine) {
//       AuthenticationService.setupAxiosInterceptors();
//       let realmId = AuthenticationService.getRealmId();
//       ProgramService.getProgramByRealmId(realmId)
//         .then(response => {
//           console.log(JSON.stringify(response.data))
//           this.setState({
//             programs: response.data
//           })
//         }).catch(
//           error => {
//             this.setState({
//               programs: []
//             })
//             if (error.message === "Network Error") {
//               this.setState({ message: error.message });
//             } else {
//               switch (error.response ? error.response.status : "") {
//                 case 500:
//                 case 401:
//                 case 404:
//                 case 406:
//                 case 412:
//                   this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
//                   break;
//                 default:
//                   this.setState({ message: 'static.unkownError' });
//                   break;
//               }
//             }
//           }
//         );

//     } else {
//       const lan = 'en';
//       var db1;
//       getDatabase();
//       var openRequest = indexedDB.open(INDEXED_DB_NAME,INDEXED_DB_VERSION );
//       openRequest.onsuccess = function (e) {
//         db1 = e.target.result;
//         var transaction = db1.transaction(['programData'], 'readwrite');
//         var program = transaction.objectStore('programData');
//         var getRequest = program.getAll();
//         var proList = []
//         getRequest.onerror = function (event) {
//           // Handle errors!
//         };
//         getRequest.onsuccess = function (event) {
//           var myResult = [];
//           myResult = getRequest.result;
//           var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//           var userId = userBytes.toString(CryptoJS.enc.Utf8);
//           for (var i = 0; i < myResult.length; i++) {
//             if (myResult[i].userId == userId) {
//               var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
//               var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
//               var programJson = {
//                 name: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + myResult[i].version,
//                 id: myResult[i].id
//               }
//               proList[i] = programJson
//             }
//           }
//           this.setState({
//             programs: proList
//           })

//         }.bind(this);

//       }

//     }


//   }
//   getPlanningUnit() {
//     if (navigator.onLine) {
//       AuthenticationService.setupAxiosInterceptors();
//       let programId = document.getElementById("programId").value;
//       let productCategoryId = document.getElementById("productCategoryId").value;
//       ProgramService.getProgramPlaningUnitListByProgramAndProductCategory(programId, productCategoryId).then(response => {
//         console.log('**' + JSON.stringify(response.data))
//         this.setState({
//           planningUnits: response.data,
//         },() => {
//           this.filterData();
//         })
//       })
//         .catch(
//           error => {
//             this.setState({
//               planningUnits: [],
//             })
//             if (error.message === "Network Error") {
//               this.setState({ message: error.message });
//             } else {
//               switch (error.response ? error.response.status : "") {
//                 case 500:
//                 case 401:
//                 case 404:
//                 case 406:
//                 case 412:
//                   this.setState({ message: error.response.data.messageCode });
//                   break;
//                 default:
//                   this.setState({ message: 'static.unkownError' });
//                   break;
//               }
//             }
//           }
//         );
//     } else {
//       const lan = 'en';
//       var db1;
//       var storeOS;
//       getDatabase();
//       var openRequest = indexedDB.open(INDEXED_DB_NAME,INDEXED_DB_VERSION );
//       openRequest.onsuccess = function (e) {
//         db1 = e.target.result;
//         var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
//         var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
//         var planningunitRequest = planningunitOs.getAll();
//         var planningList = []
//         planningunitRequest.onerror = function (event) {
//           // Handle errors!
//         };
//         planningunitRequest.onsuccess = function (e) {
//           var myResult = [];
//           myResult = planningunitRequest.result;
//           var programId = (document.getElementById("programId").value).split("_")[0];
//           var proList = []
//           for (var i = 0; i < myResult.length; i++) {
//             if (myResult[i].program.id == programId) {
//               var productJson = {
//                 name: getLabelText(myResult[i].planningUnit.label, lan),
//                 id: myResult[i].planningUnit.id
//               }
//               proList[i] = productJson
//             }
//           }
//           this.setState({
//             offlinePlanningUnitList: proList
//           })
//         }.bind(this);
//       }.bind(this)

//     }

//   }
//   getProductCategories() {
//     let programId = document.getElementById("programId").value;
//     let realmId = AuthenticationService.getRealmId();
//     if (navigator.onLine) {
//       AuthenticationService.setupAxiosInterceptors();
//       ProductService.getProductCategoryListByProgram(realmId, programId)
//         .then(response => {
//           console.log(JSON.stringify(response.data))
//           this.setState({
//             productCategories: response.data
//           },() => {
//             this.filterData();
//           })
//         }).catch(
//           error => {
//             this.setState({
//               productCategories: []
//             })
//             if (error.message === "Network Error") {
//               this.setState({ message: error.message });
//             } else {
//               switch (error.response ? error.response.status : "") {
//                 case 500:
//                 case 401:
//                 case 404:
//                 case 406:
//                 case 412:
//                   this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
//                   break;
//                 default:
//                   this.setState({ message: 'static.unkownError' });
//                   break;
//               }
//             }
//           }
//         );
//     } else {
//       var db1;
//       getDatabase();
//       var openRequest = indexedDB.open(INDEXED_DB_NAME,INDEXED_DB_VERSION );
//       openRequest.onsuccess = function (e) {
//         db1 = e.target.result;

//         var transaction = db1.transaction(['programData'], 'readwrite');
//         var programTransaction = transaction.objectStore('programData');
//         var programRequest = programTransaction.get(programId);

//         programRequest.onsuccess = function (event) {
//           var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
//           var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
//           var programJson = JSON.parse(programData);
//           var offlineConsumptionList = (programJson.consumptionList);

//           let offlineProductCategoryList = [];
//           var json;

//           for (let i = 0; i <= offlineConsumptionList.length; i++) {
//             let count = 0;
//             if (offlineConsumptionList[i] != null && offlineConsumptionList[i] != "" && offlineConsumptionList[i].planningUnit.forecastingUnit != null && offlineConsumptionList[i].planningUnit.forecastingUnit != "") {
//               for (let j = 0; j <= offlineProductCategoryList.length; j++) {
//                 if (offlineProductCategoryList[j] != null && offlineProductCategoryList[j] != "" && (offlineProductCategoryList[j].id == offlineConsumptionList[i].planningUnit.forecastingUnit.productCategory.id)) {
//                   count++;
//                 }
//               }
//               if (count == 0 || i == 0) {
//                 offlineProductCategoryList.push({
//                   id: offlineConsumptionList[i].planningUnit.forecastingUnit.productCategory.id,
//                   name: offlineConsumptionList[i].planningUnit.forecastingUnit.productCategory.label.label_en
//                 });
//               }
//             }
//           }
//           this.setState({
//             offlineProductCategoryList
//           });

//         }.bind(this)

//       }.bind(this)

//     }
//     this.getPlanningUnit();

//   }
//   componentDidMount() {
//     if (navigator.onLine) {
//       this.getPrograms();


//     } else {
//       const lan = 'en';
//       var db1;
//       getDatabase();

//       var openRequest = indexedDB.open(INDEXED_DB_NAME,INDEXED_DB_VERSION );
//       openRequest.onsuccess = function (e) {
//         db1 = e.target.result;
//         var transaction = db1.transaction(['programData'], 'readwrite');
//         var program = transaction.objectStore('programData');
//         var getRequest = program.getAll();
//         var proList = []
//         getRequest.onerror = function (event) {
//           // Handle errors!
//         };
//         getRequest.onsuccess = function (event) {
//           var myResult = [];
//           myResult = getRequest.result;
//           var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//           var userId = userBytes.toString(CryptoJS.enc.Utf8);
//           for (var i = 0; i < myResult.length; i++) {
//             if (myResult[i].userId == userId) {
//               var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
//               var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
//               var programJson = {
//                 name: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + myResult[i].version,
//                 id: myResult[i].id
//               }
//               proList[i] = programJson
//             }
//           }
//           this.setState({
//             offlinePrograms: proList
//           })

//         }.bind(this);
//       }.bind(this);

//     }
//   }

//   toggle() {
//     this.setState({
//       dropdownOpen: !this.state.dropdownOpen,
//     });
//   }

//   onRadioBtnClick(radioSelected) {
//     this.setState({
//       radioSelected: radioSelected,
//     });
//   }

//   show() {
//     /* if (!this.state.showed) {
//     setTimeout(() => {this.state.closeable = true}, 250)
//     this.setState({ showed: true })
//     }*/
//   }
//   handleRangeChange(value, text, listIndex) {
//     //
//   }
//   handleRangeDissmis(value) {
//     this.setState({ rangeValue: value },() => {
//       this.filterData();
//     })

//   }

//   _handleClickRangeBox(e) {
//     this.refs.pickRange.show()
//   }
//   loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

//   render() {
//     const { planningUnits } = this.state;
//     const { offlinePlanningUnitList } = this.state;

//     const { programs } = this.state;
//     const { offlinePrograms } = this.state;

//     const { productCategories } = this.state;
//     const { offlineProductCategoryList } = this.state;

//     let bar = "";
//     if (navigator.onLine) {
//       bar = {

//         labels: this.state.consumptions.map((item, index) => (moment(item.consumption_date, 'MM-YYYY').format('MMM YYYY'))),
//         datasets: [
//            {
//             type: "line",
//             label: i18n.t('static.report.forecastConsumption'),
//             backgroundColor: 'transparent',
//             borderColor: '#000',
//             borderDash: [10, 10],
//             ticks: {
//               fontSize: 2,
//               fontColor: 'transparent',
//             },
//             showInLegend: true,
//             pointStyle: 'line',
//             yValueFormatString: "$#,##0",
//             data: this.state.consumptions.map((item, index) => (item.forcast))
//           },{
//             label: i18n.t('static.report.actualConsumption'),
//             backgroundColor: '#86CD99',
//             borderColor: 'rgba(179,181,198,1)',
//             pointBackgroundColor: 'rgba(179,181,198,1)',
//             pointBorderColor: '#fff',
//             pointHoverBackgroundColor: '#fff',
//             pointHoverBorderColor: 'rgba(179,181,198,1)',
//             data: this.state.consumptions.map((item, index) => (item.Actual)),
//           }
//         ],



//       }
//     }
//     if (!navigator.onLine) {
//       bar = {

//         labels: this.state.offlineConsumptionList.map((item, index) => (moment(item.consumption_date, 'MM-YYYY').format('MMM YYYY'))),
//         datasets: [
//           {
//             label: i18n.t('static.report.actualConsumption'),
//             backgroundColor: '#86CD99',
//             borderColor: 'rgba(179,181,198,1)',
//             pointBackgroundColor: 'rgba(179,181,198,1)',
//             pointBorderColor: '#fff',
//             pointHoverBackgroundColor: '#fff',
//             pointHoverBorderColor: 'rgba(179,181,198,1)',
//             data: this.state.offlineConsumptionList.map((item, index) => (item.Actual)),
//           }, {
//             type: "line",
//             label: i18n.t('static.report.forecastConsumption'),
//             backgroundColor: 'transparent',
//             borderColor: 'rgba(179,181,158,1)',
//             borderStyle: 'dotted',
//             ticks: {
//               fontSize: 2,
//               fontColor: 'transparent',
//             },
//             showInLegend: true,
//             yValueFormatString: "$#,##0",
//             data: this.state.offlineConsumptionList.map((item, index) => (item.forcast))
//           }
//         ],

//       }
//     }
//     const pickerLang = {
//       months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
//       from: 'From', to: 'To',
//     }
//     const { rangeValue } = this.state

//     const makeText = m => {
//       if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
//       return '?'
//     }

//     return (
//       <div className="animated fadeIn" >
//         <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//           this.setState({ message: message })
//         }} />
//         <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
//         <h5>{i18n.t(this.state.message)}</h5>

//         <Card>
//           <CardHeader className="pb-1">
//             <i className="icon-menu"></i><strong>{i18n.t('static.report.consumptionReport')}</strong>
//             {/* <b className="count-text">{i18n.t('static.report.consumptionReport')}</b> */}
//             <Online>
//               {
//                 this.state.consumptions.length > 0 &&
//                 <div className="card-header-actions">
//                   <a className="card-header-action">

//                     <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />

//                     {/* <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>


//  {({ toPdf }) =>
//  <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />

//  }
//  </Pdf>*/}
//                   </a>
//                   <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
//                 </div>
//               }
//             </Online>
//             <Offline>
//               {
//                 this.state.offlineConsumptionList.length > 0 &&
//                 <div className="card-header-actions">
//                   <a className="card-header-action">

//                     <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />

//                     {/* <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>

//  {({ toPdf }) =>
//  <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />

//  }
//  </Pdf>*/}
//                   </a>
//                   <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
//                 </div>
//               }
//             </Offline>
//           </CardHeader>
//           <CardBody>
//             <div className="TableCust" >
//               <div ref={ref}>
//                 <Form >
//                   <Col md="12 pl-0">
//                     <div className="row">
//                       <FormGroup className="col-md-3">
//                         <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
//                         <div className="controls edit">

//                           <Picker
//                             ref="pickRange"
//                             years={{ min: 2013 }}
//                             value={rangeValue}
//                             lang={pickerLang}
//                             //theme="light"
//                             onChange={this.handleRangeChange}
//                             onDismiss={this.handleRangeDissmis}
//                           >
//                             <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
//                           </Picker>
//                         </div>
//                       </FormGroup>
//                       <Online>
//                         <FormGroup className="col-md-3">
//                           <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
//                           <div className="controls ">
//                             <InputGroup>
//                               <Input
//                                 type="select"
//                                 name="programId"
//                                 id="programId"
//                                 bsSize="sm"
//                                 onChange={this.getProductCategories}

//                               >
//                                 <option value="-1">{i18n.t('static.common.select')}</option>
//                                 {programs.length > 0
//                                   && programs.map((item, i) => {
//                                     return (
//                                       <option key={i} value={item.programId}>
//                                         {getLabelText(item.label, this.state.lang)}
//                                       </option>
//                                     )
//                                   }, this)}
//                               </Input>

//                             </InputGroup>
//                           </div>
//                         </FormGroup>
//                       </Online>
//                       <Offline>
//                         <FormGroup className="col-md-3">
//                           <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
//                           <div className="controls">
//                             <InputGroup>
//                               <Input
//                                 type="select"
//                                 name="programId"
//                                 id="programId"
//                                 bsSize="sm"
//                                 onChange={this.getProductCategories}

//                               >
//                                 <option value="0">{i18n.t('static.common.select')}</option>
//                                 {offlinePrograms.length > 0
//                                   && offlinePrograms.map((item, i) => {
//                                     return (
//                                       <option key={i} value={item.id}>
//                                         {item.name}
//                                       </option>
//                                     )
//                                   }, this)}
//                               </Input>

//                             </InputGroup>
//                           </div>
//                         </FormGroup>
//                       </Offline>
//                       <Online>
//                         <FormGroup className="col-md-3">
//                           <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
//                           <div className="controls ">
//                             <InputGroup>
//                               <Input
//                                 type="select"
//                                 name="productCategoryId"
//                                 id="productCategoryId"
//                                 bsSize="sm"
//                                 onChange={this.getPlanningUnit}
//                               >
//                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                 {productCategories.length > 0
//                                   && productCategories.map((item, i) => {
//                                     return (
//                                       <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
//                                         {Array(item.level).fill(' ').join('') + (getLabelText(item.payload.label, this.state.lang))}
//                                       </option>
//                                     )
//                                   }, this)}
//                               </Input>
//                             </InputGroup></div>

//                         </FormGroup>
//                       </Online>
//                       <Offline>
//                         <FormGroup className="col-md-3">
//                           <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
//                           <div className="controls">
//                             <InputGroup>
//                               <Input
//                                 type="select"
//                                 name="productCategoryId"
//                                 id="productCategoryId"
//                                 bsSize="sm"
//                                 onChange={this.getPlanningUnit}
//                               >
//                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                 {offlineProductCategoryList.length > 0
//                                   && offlineProductCategoryList.map((item, i) => {
//                                     return (
//                                       <option key={i} value={item.id}>
//                                         {item.name}
//                                       </option>
//                                     )
//                                   }, this)}
//                               </Input>
//                             </InputGroup></div>

//                         </FormGroup>
//                       </Offline>
//                       <Online>
//                         <FormGroup className="col-md-3">
//                           <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
//                           <div className="controls">
//                             <InputGroup>
//                               <Input
//                                 type="select"
//                                 name="planningUnitId"
//                                 id="planningUnitId"
//                                 bsSize="sm"
//                                 onChange={this.filterData}
//                               >
//                                 <option value="0">{i18n.t('static.common.select')}</option>
//                                 {planningUnits.length > 0
//                                   && planningUnits.map((item, i) => {
//                                     return (
//                                       <option key={i} value={item.planningUnit.id}>
//                                         {getLabelText(item.planningUnit.label, this.state.lang)}
//                                       </option>
//                                     )
//                                   }, this)}
//                               </Input>
//                               {/* <InputGroupAddon addonType="append">
//                        <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
//                          </InputGroupAddon> */}
//                             </InputGroup>
//                           </div>
//                         </FormGroup>
//                       </Online>
//                       <Offline>
//                         <FormGroup className="col-md-3">
//                           <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
//                           <div className="controls ">
//                             <InputGroup>
//                               <Input
//                                 type="select"
//                                 name="planningUnitId"
//                                 id="planningUnitId"
//                                 bsSize="sm"
//                                 onChange={this.filterData}
//                               >
//                                 <option value="0">{i18n.t('static.common.select')}</option>
//                                 {offlinePlanningUnitList.length > 0
//                                   && offlinePlanningUnitList.map((item, i) => {
//                                     return (
//                                       <option key={i} value={item.id}>{item.name}</option>
//                                     )
//                                   }, this)}
//                               </Input>
//                               {/* <InputGroupAddon addonType="append">
//                             <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
//                       </InputGroupAddon> */}
//                             </InputGroup>
//                           </div>
//                         </FormGroup>
//                       </Offline>
//                     </div>
//                   </Col>
//                 </Form>

//                 <Col md="12 pl-0">
//                   <div className="row">
//                     <Online>
//                       {
//                         this.state.consumptions.length > 0
//                         &&
//                         <div className="col-md-12 p-0">
//                           <div className="col-md-12">
//                             <div className="chart-wrapper chart-graph-report">
//                               <Bar id="cool-canvas" data={bar} options={options} />

//                             </div>
//                           </div>
//                           <div className="col-md-12">
//                             <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
//                               {this.state.show ? 'Hide Data' : 'Show Data'}
//                             </button>

//                           </div>
//                           </div>}



//                     </Online>
//                     <Offline>
//                       {
//                         this.state.offlineConsumptionList.length > 0
//                         &&
//                         <div className="col-md-12 p-0">
//                           <div className="col-md-12">
//                             <div className="chart-wrapper chart-graph-report">
//                               <Bar id="cool-canvas" data={bar} options={options} />

//                             </div>
//                           </div>
//                           <div className="col-md-12">
//                             <button className="mr-1 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
//                               {this.state.show ? 'Hide Data' : 'Show Data'}
//                             </button>
//                           </div>
//                         </div>}

//                     </Offline>
//                   </div>



//                 <div className="row">
//                 <div className="col-md-12">
//                   {this.state.show && 
//                   <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

//                     <thead>
//                       <tr>
//                         <th className="text-center"> {i18n.t('static.report.consumptionDate')} </th>
//                         <th className="text-center"> {i18n.t('static.report.forecastConsumption')} </th>
//                         <th className="text-center">{i18n.t('static.report.actualConsumption')}</th>
//                       </tr>
//                     </thead>
//                     <Online>
//                       <tbody>
//                         {
//                           this.state.consumptions.length > 0
//                           &&
//                           this.state.consumptions.map((item, idx) =>

//                             <tr id="addr0" key={idx} >
//                               {/* <td>
//                                 {this.state.consumptions[idx].consumption_date}
//                                </td> */}
//                               <td>{moment(this.state.consumptions[idx].consumption_date, 'MM-YYYY').format('MMM YYYY')}</td>
//                               <td>

//                                 {this.formatter(this.state.consumptions[idx].forcast)}
//                               </td>
//                               <td>
//                                 {this.formatter(this.state.consumptions[idx].Actual)}
//                               </td></tr>)

//                         }
//                       </tbody>
//                     </Online>
//                     <Offline>
//                       <tbody>
//                         {
//                           this.state.offlineConsumptionList.length > 0
//                           &&
//                           this.state.offlineConsumptionList.map((item, idx) =>

//                             <tr id="addr0" key={idx} >
//                               {/* <td>
//                                {this.state.offlineConsumptionList[idx].consumption_date}
//                               </td> */}
//                               <td>{moment(this.state.offlineConsumptionList[idx].consumption_date, 'MM-YYYY').format('MMM YYYY')}</td>
//                               <td>

//                                 {this.state.offlineConsumptionList[idx].forcast}
//                               </td>
//                               <td>
//                                 {this.state.offlineConsumptionList[idx].Actual}
//                               </td>
//                             </tr>)

//                         }
//                       </tbody>
//                     </Offline>
//                   </Table>}
//                   </div>
//                 </div>

//               </Col>
//               </div>
//             </div>
//           </CardBody>
//         </Card>
//       </div >
//     );
//   }
// }
// export default Consumption;







// my report 
import React, { Component, lazy, Suspense, DatePicker } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
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
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
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
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import { Online, Offline } from "react-detect-offline";
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
//import fs from 'fs'
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')

const options = {
  title: {
    display: true,
    // text: i18n.t('static.dashboard.consumption'),
    fontColor: 'black'
  },

  scales: {

    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: i18n.t('static.dashboard.consumption'),
        fontColor: 'black'
      },
      ticks: {
        beginAtZero: true,
        fontColor: 'black'
      }
    }],
    xAxes: [{
      ticks: {
        fontColor: 'black'
      }
    }]
  },

  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false,
  legend: {
    display: true,
    position: 'bottom',
    labels: {
      usePointStyle: true,
      fontColor: "black"
    }
  }
}




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


class Consumption extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      sortType: 'asc',
      dropdownOpen: false,
      radioSelected: 2,
      realms: [],
      programs: [],
      offlinePrograms: [],
      planningUnits: [],
      versions: [],
      consumptions: [],
      offlineConsumptionList: [],
      offlinePlanningUnitList: [],
      productCategories: [],
      offlineProductCategoryList: [],
      show: false,
      message: '',
      rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
      loading: true


    };
    this.getPrograms = this.getPrograms.bind(this);
    this.filterData = this.filterData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.getPlanningUnit = this.getPlanningUnit.bind(this);
    // this.getProductCategories = this.getProductCategories.bind(this);
    this.storeProduct = this.storeProduct.bind(this);
    this.toggleView = this.toggleView.bind(this);
    //this.pickRange = React.createRef()

  }

  toggleView() {
    console.log("In toggle view");
    var tempConsumptionList = [];
    var tempConsumptionList1 = [];
    var multiplier = this.state.multiplier;
    // if (!navigator.onLine) {
    tempConsumptionList = this.state.offlineConsumptionList;
    for (let i = 0; i < tempConsumptionList.length; i++) {
      let json = {
        "transDate": tempConsumptionList[i].transDate,
        "actualConsumption": tempConsumptionList[i].actualConsumption * multiplier,
        "forecastedConsumption": tempConsumptionList[i].forecastedConsumption * multiplier
      }
      tempConsumptionList1.push(json);
    }
    this.setState({
      offlineConsumptionList: tempConsumptionList1,
      consumptions: tempConsumptionList1
    })

    // }

  }

  storeProduct(planningUnitId) {

    let productId = planningUnitId;
    // let productFilter = this.state.productList.filter(c => (c.planningUnit.id == productId));
    // console.log("EEEEEEEEE--------", productId);
    if (navigator.onLine) {
      RealmService.getRealmListAll()
        .then(response => {
          if (response.status == 200) {
            this.setState({
              realmId: response.data[0].realmId,
            })

            PlanningUnitService.getPlanningUnitByRealmId(this.state.realmId).then(response => {
              // console.log("RESP-----", response.data)
              let productFilter = response.data.filter(c => (c.planningUnitId == productId));
              this.setState({
                multiplier: productFilter[0].multiplier,
              },
                () => {
                  console.log("MULTIPLIER----", this.state.multiplier);
                })
            })

          } else {
            this.setState({
              message: response.data.messageCode
            },
              () => {
                // this.hideSecondComponent();
              })
          }
        })
    } else {
      const lan = 'en';
      var db1;
      var storeOS;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var planningunitTransaction = db1.transaction(['planningUnit'], 'readwrite');
        var planningunitOs = planningunitTransaction.objectStore('planningUnit');
        var planningunitRequest = planningunitOs.getAll();
        var planningList = []
        planningunitRequest.onerror = function (event) {
          // Handle errors!
        };
        planningunitRequest.onsuccess = function (e) {
          var myResult = [];
          myResult = planningunitRequest.result;
          let productFilter = myResult.filter(c => (c.planningUnitId == productId));
          this.setState({
            multiplier: productFilter[0].multiplier,
          },
            () => {
              console.log("MULTIPLIER----", this.state.multiplier);
            })
        }.bind(this);
      }.bind(this)
    }

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

  exportCSV() {

    var csvRow = [];
    csvRow.push((i18n.t('static.report.dateRange') + ' , ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
    csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
    csvRow.push(i18n.t('static.report.version') + ' , ' + (document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20'))
    csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
    csvRow.push((i18n.t('static.common.display')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("viewById").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
    csvRow.push('')
    csvRow.push('')
    var re;

    if (navigator.onLine) {
      re = this.state.consumptions
    } else {
      re = this.state.offlineConsumptionList
    }

    // var A = [[(i18n.t('static.report.consumptionDate')).replaceAll(' ', '%20'), (i18n.t('static.report.forecastConsumption')).replaceAll(' ', '%20'), (i18n.t('static.report.actualConsumption')).replaceAll(' ', '%20')]]
    // for (var item = 0; item < re.length; item++) {
    //   A.push([re[item].consumption_date, re[item].forcast, re[item].Actual])
    // }

    let head = [];
    let head1 = [];
    let row1 = [];
    let row2 = [];
    let row3 = [];
    if (navigator.onLine) {
      let consumptionArray = this.state.consumptions;
      head.push('');
      row1.push(i18n.t('static.report.forecasted'));
      row2.push(i18n.t('static.report.actual'));
      for (let i = 0; i < consumptionArray.length; i++) {
        head.push((moment(consumptionArray[i].transDate, 'yyyy-MM-dd').format('MMM YYYY')));
        row1.push(consumptionArray[i].forecastedConsumption);
        row2.push(consumptionArray[i].actualConsumption);
      }
    } else {
      let consumptionArray = this.state.offlineConsumptionList;
      head.push('');
      row1.push(i18n.t('static.report.forecasted'));
      row2.push(i18n.t('static.report.actual'));
      for (let i = 0; i < consumptionArray.length; i++) {
        head.push((moment(consumptionArray[i].transDate, 'yyyy-MM-dd').format('MMM YYYY')));
        row1.push(consumptionArray[i].forecastedConsumption);
        row2.push(consumptionArray[i].actualConsumption);
      }
    }
    var A = [];
    A[0] = head;
    A[1] = row1;
    A[2] = row2;


    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.report.consumption_') + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to) + ".csv"
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
        doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
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
          doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
            align: 'left'
          })
          // doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
          //   align: 'left'
          // })
          doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
            align: 'left'
          })
          doc.text(i18n.t('static.common.display') + ' : ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 8, 170, {
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

    // const title = "Consumption Report";
    var canvas = document.getElementById("cool-canvas");
    //creates image

    var canvasImg = canvas.toDataURL("image/png", 1.0);
    var width = doc.internal.pageSize.width;
    var height = doc.internal.pageSize.height;
    var h1 = 100;
    var aspectwidth1 = (width - h1);

    doc.addImage(canvasImg, 'png', 50, 220, 750, 260, 'CANVAS');

    const headers = [[i18n.t('static.report.consumptionDate'),
    i18n.t('static.report.forecasted'),
    i18n.t('static.report.actual')]];
    const data = navigator.onLine ? this.state.consumptions.map(elt => [elt.transDate, this.formatter(elt.forecastedConsumption), this.formatter(elt.actualConsumption)]) : this.state.offlineConsumptionList.map(elt => [elt.transDate, this.formatter(elt.forecastedConsumption), this.formatter(elt.actualConsumption)]);
    // let content = {
    //   margin: { top: 80 },
    //   startY: height,
    //   head: headers,
    //   body: data,
    //   styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

    // };


    let head = [];
    let head1 = [];
    let row1 = [];
    let row2 = [];
    let row3 = [];
    if (navigator.onLine) {
      let consumptionArray = this.state.consumptions;
      head.push('');
      row1.push(i18n.t('static.report.forecasted'));
      row2.push(i18n.t('static.report.actual'));
      for (let i = 0; i < consumptionArray.length; i++) {
        head.push((moment(consumptionArray[i].transDate, 'yyyy-MM-dd').format('MMM YYYY')));
        row1.push(this.formatter(consumptionArray[i].forecastedConsumption));
        row2.push(this.formatter(consumptionArray[i].actualConsumption));
      }
    } else {
      let consumptionArray = this.state.offlineConsumptionList;
      head.push('');
      row1.push(i18n.t('static.report.forecasted'));
      row2.push(i18n.t('static.report.actual'));
      for (let i = 0; i < consumptionArray.length; i++) {
        head.push((moment(consumptionArray[i].transDate, 'yyyy-MM-dd').format('MMM YYYY')));
        row1.push(this.formatter(consumptionArray[i].forecastedConsumption));
        row2.push(this.formatter(consumptionArray[i].actualConsumption));
      }
    }
    head1[0] = head;
    row3[0] = row1;
    row3[1] = row2;


    let content = {
      margin: { top: 80, bottom: 50 },
      startY: height,
      head: head1,
      body: row3,
      styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

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



  // filterData() {
  //   let programId = 0;
  //   if (navigator.onLine) {
  //     programId = document.getElementById("programId").value;
  //   } else {
  //     programId = (document.getElementById("programId").value).split("_")[0];
  //   }

  //   let viewById = document.getElementById("viewById").value;
  //   let versionId = document.getElementById("versionId").value;
  //   let productCategoryId = document.getElementById("productCategoryId").value;
  //   let planningUnitId = document.getElementById("planningUnitId").value;
  //   let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
  //   let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
  //   if (productCategoryId >= 0 && planningUnitId > 0 && programId > 0) {

  //     if (navigator.onLine) {
  //       let realmId = AuthenticationService.getRealmId();
  //       AuthenticationService.setupAxiosInterceptors();
  //       ProductService.getConsumptionData(realmId, programId, versionId, planningUnitId, this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01', this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate())
  //         .then(response => {
  //           // console.log(JSON.stringify(response.data));
  //           this.setState({
  //             consumptions: response.data,
  //             message: ''
  //           },
  //             () => {
  //               this.storeProduct(planningUnitId);
  //               if (viewById == 2) {
  //                 this.toggleView();
  //               }
  //             })
  //         }).catch(
  //           error => {
  //             this.setState({
  //               consumptions: []
  //             })

  //             if (error.message === "Network Error") {
  //               this.setState({ message: error.message });
  //             } else {
  //               switch (error.response ? error.response.status : "") {
  //                 case 500:
  //                 case 401:
  //                 case 404:
  //                 case 406:
  //                 case 412:
  //                   this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
  //                   break;
  //                 default:
  //                   this.setState({ message: 'static.unkownError' });
  //                   break;
  //               }
  //             }
  //           }
  //         );
  //     } else {
  //       // if (planningUnitId != "" && planningUnitId != 0 && productCategoryId != "" && productCategoryId != 0) {
  //       programId = document.getElementById("programId").value;
  //       var db1;
  //       getDatabase();
  //       var openRequest = indexedDB.open(INDEXED_DB_NAME,INDEXED_DB_VERSION );
  //       openRequest.onsuccess = function (e) {
  //         db1 = e.target.result;

  //         var transaction = db1.transaction(['programData'], 'readwrite');
  //         var programTransaction = transaction.objectStore('programData');
  //         var programRequest = programTransaction.get(programId);

  //         programRequest.onsuccess = function (event) {
  //           var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
  //           var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
  //           var programJson = JSON.parse(programData);
  //           var offlineConsumptionList = (programJson.consumptionList);

  //           const activeFilter = offlineConsumptionList.filter(c => (c.active == true || c.active == "true"));

  //           const planningUnitFilter = activeFilter.filter(c => c.planningUnit.id == planningUnitId);
  //           const productCategoryFilter = planningUnitFilter.filter(c => (c.planningUnit.forecastingUnit != null && c.planningUnit.forecastingUnit != "") && (c.planningUnit.forecastingUnit.productCategory.id == productCategoryId));

  //           // const dateFilter = planningUnitFilter.filter(c => moment(c.startDate).isAfter(startDate) && moment(c.stopDate).isBefore(endDate))
  //           const dateFilter = productCategoryFilter.filter(c => moment(c.consumptionDate).isBetween(startDate, endDate, null, '[)'))

  //           const sorted = dateFilter.sort((a, b) => {
  //             var dateA = new Date(a.consumptionDate).getTime();
  //             var dateB = new Date(b.consumptionDate).getTime();
  //             return dateA > dateB ? 1 : -1;
  //           });
  //           let previousDate = "";
  //           let finalOfflineConsumption = [];
  //           var json;

  //           for (let i = 0; i <= sorted.length; i++) {
  //             let forcast = 0;
  //             let actual = 0;
  //             if (sorted[i] != null && sorted[i] != "") {
  //               previousDate = moment(sorted[i].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY');
  //               for (let j = 0; j <= sorted.length; j++) {
  //                 if (sorted[j] != null && sorted[j] != "") {
  //                   if (previousDate == moment(sorted[j].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY')) {
  //                     if (sorted[j].actualFlag == false || sorted[j].actualFlag == "false") {
  //                       forcast = forcast + parseFloat(sorted[j].consumptionQty);
  //                     }
  //                     if (sorted[j].actualFlag == true || sorted[j].actualFlag == "true") {
  //                       actual = actual + parseFloat(sorted[j].consumptionQty);
  //                     }
  //                   }
  //                 }
  //               }

  //               let date = moment(sorted[i].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY');
  //               json = {
  //                 consumption_date: date,
  //                 Actual: actual,
  //                 forcast: forcast
  //               }

  //               if (!finalOfflineConsumption.some(f => f.consumption_date === date)) {
  //                 finalOfflineConsumption.push(json);
  //               }

  //               // console.log("finalOfflineConsumption---", finalOfflineConsumption);

  //             }
  //           }
  //           console.log("final consumption---", finalOfflineConsumption);
  //           this.setState({
  //             offlineConsumptionList: finalOfflineConsumption
  //           },
  //             () => {
  //               this.storeProduct(planningUnitId);
  //               if (viewById == 2) {
  //                 this.toggleView();
  //               }
  //             });

  //         }.bind(this)

  //       }.bind(this)
  //       // }
  //     }
  //   } else if (programId == 0) {
  //     this.setState({ message: i18n.t('static.common.selectProgram'), consumptions: [] });

  //   } else if (productCategoryId == -1) {
  //     this.setState({ message: i18n.t('static.common.selectProductCategory'), consumptions: [] });

  //   } else {
  //     this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), consumptions: [] });

  //   }
  // }



  filterData() {

    let programId = document.getElementById("programId").value;
    let viewById = document.getElementById("viewById").value;
    let versionId = document.getElementById("versionId").value;
    // let productCategoryId = document.getElementById("productCategoryId").value;
    let planningUnitId = document.getElementById("planningUnitId").value;
    let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
    let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();

    if (planningUnitId > 0 && programId > 0 && versionId != -1) {
      if (versionId.includes('Local')) {
        console.log("------------OFFLINE PART------------");
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
              message: i18n.t('static.program.errortext')
            })
          }.bind(this);
          programRequest.onsuccess = function (e) {
            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson = JSON.parse(programData);

            // var shipmentList = (programJson.shipmentList);
            console.log("consumptionList----*********----", (programJson.consumptionList));

            var offlineConsumptionList = (programJson.consumptionList);

            const activeFilter = offlineConsumptionList.filter(c => (c.active == true || c.active == "true"));

            const planningUnitFilter = activeFilter.filter(c => c.planningUnit.id == planningUnitId);
            // const productCategoryFilter = planningUnitFilter.filter(c => (c.planningUnit.forecastingUnit != null && c.planningUnit.forecastingUnit != "") && (c.planningUnit.forecastingUnit.productCategory.id == productCategoryId));
            console.log("planningUnit------->>>", planningUnitId);
            console.log("planningUnitFilter------->>>", planningUnitFilter);
            // const dateFilter = planningUnitFilter.filter(c => moment(c.startDate).isAfter(startDate) && moment(c.stopDate).isBefore(endDate))
            const dateFilter = planningUnitFilter.filter(c => moment(c.consumptionDate).isBetween(startDate, endDate, null, '[)'))

            console.log("dateFilter------->>>", dateFilter);
            // const sorted = dateFilter.sort((a, b) => {
            //   var dateA = new Date(a.consumptionDate).getTime();
            //   var dateB = new Date(b.consumptionDate).getTime();
            //   return dateA > dateB ? 1 : -1;
            // });

            const flagTrue = dateFilter.filter(c => c.actualFlag == true);
            console.log("flagTrue---->", flagTrue);
            const flagFalse = dateFilter.filter(c => c.actualFlag == false);
            console.log("flagFalse---->", flagFalse);
            //logic for add same date data
            //True
            let resultTrue = Object.values(flagTrue.reduce((a, { consumptionId, consumptionDate, actualFlag, consumptionQty }) => {
              if (!a[consumptionDate])
                a[consumptionDate] = Object.assign({}, { consumptionId, consumptionDate, actualFlag, consumptionQty });
              else
                a[consumptionDate].consumptionQty += consumptionQty;
              return a;
            }, {}));
            console.log("resultTrue---->", resultTrue);


            //Flase
            let resultFalse = Object.values(flagFalse.reduce((a, { consumptionId, consumptionDate, actualFlag, consumptionQty }) => {
              if (!a[consumptionDate])
                a[consumptionDate] = Object.assign({}, { consumptionId, consumptionDate, actualFlag, consumptionQty });
              else
                a[consumptionDate].consumptionQty += consumptionQty;
              return a;
            }, {}));
            console.log("resultFalse---->", resultFalse);


            let result = resultTrue.concat(resultFalse);
            console.log("result------->>>", result);
            const sorted = result.sort((a, b) => {
              var dateA = new Date(a.consumptionDate).getTime();
              var dateB = new Date(b.consumptionDate).getTime();
              return dateA > dateB ? 1 : -1;
            });
            console.log("sorted------->>>", sorted);

            // console.log("CHECK----->>", dateFilter.filter(c => c.consumptionQty == 1800));

            let dateArray = [...new Set(sorted.map(ele => (moment(ele.consumptionDate, 'YYYY-MM-dd').format('MM-YYYY'))))]
            let finalOfflineConsumption = [];
            for (var j = 0; j < dateArray.length; j++) {
              let objActual = sorted.filter(c => (moment(dateArray[j], 'MM-YYYY').isSame(moment(moment(c.consumptionDate, 'YYYY-MM-dd').format('MM-YYYY'), 'MM-YYYY'))) != 0 && c.actualFlag == true);
              let objForecast = sorted.filter(c => (moment(dateArray[j], 'MM-YYYY').isSame(moment(moment(c.consumptionDate, 'YYYY-MM-dd').format('MM-YYYY'), 'MM-YYYY'))) != 0 && c.actualFlag == false);

              let actualValue = 0;
              let forecastValue = 0;
              let transDate = '';

              if (objActual.length > 0) {
                actualValue = objActual[0].consumptionQty;
                transDate = objActual[0].consumptionDate;
              }
              if (objForecast.length > 0) {
                forecastValue = objForecast[0].consumptionQty;
                transDate = objForecast[0].consumptionDate;
              }

              let json = {
                "transDate": transDate,
                "actualConsumption": actualValue,
                "forecastedConsumption": forecastValue
              }
              finalOfflineConsumption.push(json);

            }


            // let previousDate = "";
            // let finalOfflineConsumption = [];
            // var json;

            // for (let i = 0; i <= sorted.length; i++) {
            //   let forcast = 0;
            //   let actual = 0;
            //   if (sorted[i] != null && sorted[i] != "") {
            //     previousDate = moment(sorted[i].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY');
            //     for (let j = 0; j <= sorted.length; j++) {
            //       if (sorted[j] != null && sorted[j] != "") {
            //         if (previousDate == moment(sorted[j].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY')) {
            //           if (sorted[j].actualFlag == false || sorted[j].actualFlag == "false") {
            //             forcast = forcast + parseFloat(sorted[j].consumptionQty);
            //           }
            //           if (sorted[j].actualFlag == true || sorted[j].actualFlag == "true") {
            //             actual = actual + parseFloat(sorted[j].consumptionQty);
            //           }
            //         }
            //       }
            //     }

            //     let date = moment(sorted[i].consumptionDate, 'YYYY-MM-DD').format('MM-YYYY');
            //     // json = {
            //     //   consumption_date: date,
            //     //   Actual: actual,
            //     //   forcast: forcast
            //     // }

            //     let json = {
            //       "transDate": sorted[i].consumptionDate,
            //       "actualConsumption": actual,
            //       "forecastedConsumption": forcast
            //     }

            //     if (!finalOfflineConsumption.some(f => f.consumption_date === date)) {
            //       finalOfflineConsumption.push(json);
            //     }

            //   }
            // }


            console.log("final consumption---", finalOfflineConsumption);
            this.setState({
              offlineConsumptionList: finalOfflineConsumption,
              consumptions: finalOfflineConsumption,
              message: '',

            },
              () => {
                this.storeProduct(planningUnitId);
                if (viewById == 2) {
                  this.toggleView();
                }
              });

          }.bind(this)
        }.bind(this)

      } else {
        this.setState({
          message: '',
          loading: true
        })

        let realmId = AuthenticationService.getRealmId();

        var inputjson = {
          startDate: new moment(startDate),
          stopDate: new moment(endDate),
          programId: programId,
          versionId: versionId,
          planningUnitId: planningUnitId,
          reportView: viewById
        }
        console.log("JSON INPUT---------->", inputjson);
        ProductService.getConsumptionData(inputjson)
          .then(response => {
            console.log("RESP---------->", response.data);
            this.setState({
              consumptions: response.data,
              message: '',
              loading: false
            },
              () => {
                this.storeProduct(planningUnitId);
                // if (viewById == 2) {
                //   this.toggleView();
                // }
              })
          })
      }

    } else if (programId == -1) {
      this.setState({ message: i18n.t('static.common.selectProgram'), consumptions: [] });

    } else if (versionId == -1) {
      this.setState({ message: i18n.t('static.program.validversion'), consumptions: [] });

    } else {
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), consumptions: [] });

    }
  }


  getPrograms() {
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
                  this.setState({ loading: false, emessage: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                  break;
                default:
                  this.setState({ message: 'static.unkownError', loading: false });
                  break;
              }
            }
          }
        );

    } else {
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

  getPlanningUnit() {
    if (navigator.onLine) {

      let programId = document.getElementById("programId").value;
      let versionId = document.getElementById("versionId").value;
      // let productCategoryId = document.getElementById("productCategoryId").value;
      ProgramService.getProgramPlaningUnitListByProgramId(programId).then(response => {
        // console.log('RESP----------', response.data);
        this.setState({
          planningUnits: response.data
        }, () => {
          this.filterData();
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
                  this.setState({ message: error.response.data.messageCode });
                  break;
                default:
                  this.setState({ message: 'static.unkownError' });
                  break;
              }
            }
          }
        );
    } else {
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
          for (var i = 0; i < myResult.length; i++) {
            if (myResult[i].program.id == programId) {
              var productJson = {
                name: getLabelText(myResult[i].planningUnit.label, lan),
                id: myResult[i].planningUnit.id
              }
              proList[i] = productJson
            }
          }
          this.setState({
            offlinePlanningUnitList: proList,
          })
        }.bind(this);
      }.bind(this)

    }
    this.filterData();
  }
  // getProductCategories() {
  //   let programId = document.getElementById("programId").value;
  //   let realmId = AuthenticationService.getRealmId();
  //   if (navigator.onLine) {

  //     ProductService.getProductCategoryListByProgram(realmId, programId)
  //       .then(response => {
  //         console.log(JSON.stringify(response.data))
  //         this.setState({
  //           productCategories: response.data
  //         }, () => {
  //           this.filterData();
  //         })
  //       }).catch(
  //         error => {
  //           this.setState({
  //             productCategories: []
  //           })
  //           if (error.message === "Network Error") {
  //             this.setState({ message: error.message });
  //           } else {
  //             switch (error.response ? error.response.status : "") {
  //               case 500:
  //               case 401:
  //               case 404:
  //               case 406:
  //               case 412:
  //                 this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
  //                 break;
  //               default:
  //                 this.setState({ message: 'static.unkownError' });
  //                 break;
  //             }
  //           }
  //         }
  //       );
  //   } else {
  //     var db1;
  //     getDatabase();
  //     var openRequest = indexedDB.open(INDEXED_DB_NAME,INDEXED_DB_VERSION );
  //     openRequest.onsuccess = function (e) {
  //       db1 = e.target.result;

  //       var transaction = db1.transaction(['programData'], 'readwrite');
  //       var programTransaction = transaction.objectStore('programData');
  //       var programRequest = programTransaction.get(programId);

  //       programRequest.onsuccess = function (event) {
  //         var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
  //         var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
  //         var programJson = JSON.parse(programData);
  //         var offlineConsumptionList = (programJson.consumptionList);

  //         let offlineProductCategoryList = [];
  //         var json;

  //         for (let i = 0; i <= offlineConsumptionList.length; i++) {
  //           let count = 0;
  //           if (offlineConsumptionList[i] != null && offlineConsumptionList[i] != "" && offlineConsumptionList[i].planningUnit.forecastingUnit != null && offlineConsumptionList[i].planningUnit.forecastingUnit != "") {
  //             for (let j = 0; j <= offlineProductCategoryList.length; j++) {
  //               if (offlineProductCategoryList[j] != null && offlineProductCategoryList[j] != "" && (offlineProductCategoryList[j].id == offlineConsumptionList[i].planningUnit.forecastingUnit.productCategory.id)) {
  //                 count++;
  //               }
  //             }
  //             if (count == 0 || i == 0) {
  //               offlineProductCategoryList.push({
  //                 id: offlineConsumptionList[i].planningUnit.forecastingUnit.productCategory.id,
  //                 name: offlineConsumptionList[i].planningUnit.forecastingUnit.productCategory.label.label_en
  //               });
  //             }
  //           }
  //         }
  //         this.setState({
  //           offlineProductCategoryList
  //         });

  //       }.bind(this)

  //     }.bind(this)

  //   }
  //   this.getPlanningUnit();
  //   this.filterVersion();

  // }


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
    this.filterData();
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


  componentDidMount() {
    this.getPrograms();
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
    const { planningUnits } = this.state;
    const { offlinePlanningUnitList } = this.state;

    // const { programs } = this.state;
    // const { offlinePrograms } = this.state;

    const { productCategories } = this.state;
    const { offlineProductCategoryList } = this.state;

    // const { versions } = this.state;
    // let versionList = versions.length > 0
    //   && versions.map((item, i) => {
    //     return (
    //       <option key={i} value={item.versionId}>
    //         {item.versionId}
    //       </option>
    //     )
    //   }, this);

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



    let bar = "";
    if (navigator.onLine) {
      bar = {

        labels: this.state.consumptions.map((item, index) => (moment(item.transDate, 'yyyy-MM-dd').format('MMM YYYY'))),
        datasets: [
          {
            type: "line",
            lineTension: 0,
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
            data: this.state.consumptions.map((item, index) => (item.forecastedConsumption))
          }, {
            label: i18n.t('static.report.actualConsumption'),
            backgroundColor: '#86CD99',
            borderColor: 'rgba(179,181,198,1)',
            pointBackgroundColor: 'rgba(179,181,198,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(179,181,198,1)',
            data: this.state.consumptions.map((item, index) => (item.actualConsumption)),
          }
        ],



      }
    }
    if (!navigator.onLine) {

      bar = {

        labels: this.state.offlineConsumptionList.map((item, index) => (moment(item.transDate, 'yyyy-MM-dd').format('MMM YYYY'))),
        datasets: [
          {
            type: "line",
            lineTension: 0,
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
            data: this.state.offlineConsumptionList.map((item, index) => (item.forecastedConsumption))
          }, {
            label: i18n.t('static.report.actualConsumption'),
            backgroundColor: '#86CD99',
            borderColor: 'rgba(179,181,198,1)',
            pointBackgroundColor: 'rgba(179,181,198,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(179,181,198,1)',
            data: this.state.offlineConsumptionList.map((item, index) => (item.actualConsumption)),
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

    return (
      <div className="animated fadeIn" >
        <AuthenticationServiceComponent history={this.props.history} message={(message) => {
          this.setState({ message: message })
        }} loading={(loading) => {
          this.setState({ loading: loading })
        }} />
        <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
        <h5 className="red">{i18n.t(this.state.message)}</h5>

        <Card style={{ display: this.state.loading ? "none" : "block" }}>
          <div className="Card-header-reporticon pb-2">
            {/* <i className="icon-menu"></i><strong>{i18n.t('static.report.consumptionReport')}</strong> */}
            {/* <b className="count-text">{i18n.t('static.report.consumptionReport')}</b> */}
            <Online>
              {
                this.state.consumptions.length > 0 &&
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
            </Online>
            <Offline>
              {
                this.state.offlineConsumptionList.length > 0 &&
                <div className="card-header-actions">
                  <a className="card-header-action">

                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />

                    {/* <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>

 {({ toPdf }) =>
 <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />

 }
 </Pdf>*/}
                  </a>
                  <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                </div>
              }
            </Offline>
          </div>
          <CardBody className="pb-lg-2 pt-lg-0 ">
            <div className="TableCust" >
              <div ref={ref}>
                <Form >
                  <div className="pl-0">
                    <div className="row">
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
                        <div className="controls edit">

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
                              <option value="-1">{i18n.t('static.common.select')}</option>
                              {programList}
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
                              // onChange={this.filterData}
                              onChange={this.getPlanningUnit}
                            >
                              <option value="-1">{i18n.t('static.common.select')}</option>
                              {versionList}
                            </Input>

                          </InputGroup>
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
                                <option value="0">{i18n.t('static.common.all')}</option>
                                {productCategories.length > 0
                                  && productCategories.map((item, i) => {
                                    return (
                                      <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
                                        {Array(item.level).fill(' ').join('') + (getLabelText(item.payload.label, this.state.lang))}
                                      </option>
                                    )
                                  }, this)}
                              </Input>
                            </InputGroup></div>

                        </FormGroup>
                      </Online> */}

                      {/* <Offline>
                        <FormGroup className="col-md-3">
                          <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                          <div className="controls">
                            <InputGroup>
                              <Input
                                type="select"
                                name="productCategoryId"
                                id="productCategoryId"
                                bsSize="sm"
                                onChange={this.getPlanningUnit}
                              >
                                <option value="0">{i18n.t('static.common.all')}</option>
                                {offlineProductCategoryList.length > 0
                                  && offlineProductCategoryList.map((item, i) => {
                                    return (
                                      <option key={i} value={item.id}>
                                        {item.name}
                                      </option>
                                    )
                                  }, this)}
                              </Input>
                            </InputGroup></div>

                        </FormGroup>
                      </Offline> */}

                      <Online>
                        <FormGroup className="col-md-3">
                          <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
                          <div className="controls">
                            <InputGroup>
                              <Input
                                type="select"
                                name="planningUnitId"
                                id="planningUnitId"
                                bsSize="sm"
                                onChange={this.filterData}
                              // onChange={(e) => { this.storeProduct(e); this.filterData(); }}
                              >
                                <option value="0">{i18n.t('static.common.select')}</option>
                                {planningUnits.length > 0
                                  && planningUnits.map((item, i) => {
                                    return (
                                      <option key={i} value={item.planningUnit.id}>
                                        {getLabelText(item.planningUnit.label, this.state.lang)}
                                      </option>
                                    )
                                  }, this)}
                              </Input>
                              {/* <InputGroupAddon addonType="append">
 <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
 </InputGroupAddon> */}
                            </InputGroup>
                          </div>
                        </FormGroup>
                      </Online>
                      <Offline>
                        <FormGroup className="col-md-3">
                          <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
                          <div className="controls ">
                            <InputGroup>
                              <Input
                                type="select"
                                name="planningUnitId"
                                id="planningUnitId"
                                bsSize="sm"
                                onChange={this.filterData}
                              >
                                <option value="0">{i18n.t('static.common.select')}</option>
                                {offlinePlanningUnitList.length > 0
                                  && offlinePlanningUnitList.map((item, i) => {
                                    return (
                                      <option key={i} value={item.id}>{item.name}</option>
                                    )
                                  }, this)}
                              </Input>
                              {/* <InputGroupAddon addonType="append">
 <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
 </InputGroupAddon> */}
                            </InputGroup>
                          </div>
                        </FormGroup>
                      </Offline>


                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
                        <div className="controls">
                          <InputGroup>
                            <Input
                              type="select"
                              name="viewById"
                              id="viewById"
                              bsSize="sm"
                              onChange={this.filterData}
                            >
                              <option value="1">{i18n.t('static.report.planningUnit')}</option>
                              <option value="2">{i18n.t('static.dashboard.forecastingunit')}</option>
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>


                    </div>
                  </div>
                </Form>

                <Col md="12 pl-0">
                  <div className="row">
                    <Online>
                      {
                        this.state.consumptions.length > 0
                        &&
                        <div className="col-md-12 p-0">
                          <div className="col-md-12">
                            <div className="chart-wrapper chart-graph-report pl-5 ml-3" style={{ marginLeft: '50px' }}>
                              <Bar id="cool-canvas" data={bar} options={options} />
                              <div>

                              </div>
                            </div>
                          </div>
                          <div className="col-md-12">
                            <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                              {this.state.show ? 'Hide Data' : 'Show Data'}
                            </button>

                          </div>
                        </div>}



                    </Online>
                    <Offline>
                      {
                        this.state.offlineConsumptionList.length > 0
                        &&
                        <div className="col-md-12 p-0">
                          <div className="col-md-12">
                            <div className="chart-wrapper chart-graph-report">
                              <Bar id="cool-canvas" data={bar} options={options} />

                            </div>
                          </div>
                          <div className="col-md-12">
                            <button className="mr-1 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                              {this.state.show ? 'Hide Data' : 'Show Data'}
                            </button>
                          </div>
                        </div>}

                    </Offline>
                  </div>



                  <div className="row">
                    <div className="col-md-12 pl-0 pr-0">
                      <Online>
                        {this.state.show && this.state.consumptions.length > 0 &&
                          <Table responsive className="table-striped table-hover table-bordered text-center mt-2" id="tab1">

                            <tbody>
                              <>
                                <tr>
                                  <th style={{ width: '140px' }}></th>
                                  {
                                    this.state.consumptions.length > 0
                                    &&
                                    this.state.consumptions.map((item, idx) =>
                                      <td id="addr0" key={idx}>
                                        {moment(this.state.consumptions[idx].transDate, 'yyyy-MM-dd').format('MMM YYYY')}
                                      </td>
                                    )
                                  }
                                </tr>

                                <tr>
                                  <th style={{ width: '140px' }}>{i18n.t('static.report.forecasted')}</th>
                                  {
                                    this.state.consumptions.length > 0
                                    &&
                                    this.state.consumptions.map((item, idx) =>
                                      <td id="addr0" key={idx}>
                                        {this.formatter(this.state.consumptions[idx].forecastedConsumption)}
                                      </td>
                                    )
                                  }
                                </tr>

                                <tr>
                                  <th style={{ width: '140px' }}>{i18n.t('static.report.actual')}</th>
                                  {
                                    this.state.consumptions.length > 0
                                    &&
                                    this.state.consumptions.map((item, idx) =>
                                      <td id="addr0" key={idx}>
                                        {this.formatter(this.state.consumptions[idx].actualConsumption)}
                                      </td>
                                    )
                                  }
                                </tr>
                              </>
                            </tbody>

                          </Table>}
                      </Online>
                      <Offline>
                        {this.state.show && this.state.offlineConsumptionList.length > 0 &&
                          <Table responsive className="table-striped table-hover table-bordered text-center mt-2" id="tab1">

                            <tbody>
                              <>
                                <tr>
                                  <th style={{ width: '140px' }}></th>
                                  {
                                    this.state.offlineConsumptionList.length > 0
                                    &&
                                    this.state.offlineConsumptionList.map((item, idx) =>
                                      <td id="addr0" key={idx}>
                                        {moment(this.state.offlineConsumptionList[idx].transDate, 'yyyy-MM-dd').format('MMM YYYY')}
                                      </td>
                                    )
                                  }
                                </tr>

                                <tr>
                                  <th style={{ width: '140px' }}>{i18n.t('static.report.forecasted')}</th>
                                  {
                                    this.state.offlineConsumptionList.length > 0
                                    &&
                                    this.state.offlineConsumptionList.map((item, idx) =>
                                      <td id="addr0" key={idx}>
                                        {this.formatter(this.state.offlineConsumptionList[idx].forecastedConsumption)}
                                      </td>
                                    )
                                  }
                                </tr>

                                <tr>
                                  <th style={{ width: '140px' }}>{i18n.t('static.report.actual')}</th>
                                  {
                                    this.state.offlineConsumptionList.length > 0
                                    &&
                                    this.state.offlineConsumptionList.map((item, idx) =>
                                      <td id="addr0" key={idx}>
                                        {this.formatter(this.state.offlineConsumptionList[idx].actualConsumption)}
                                      </td>
                                    )
                                  }
                                </tr>
                              </>
                            </tbody>

                          </Table>}
                      </Offline>
                    </div>
                  </div>

                </Col>
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

export default Consumption;