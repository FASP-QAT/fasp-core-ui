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
// import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME } from '../../Constants.js'
// import moment, { version } from "moment";
// import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
// import pdfIcon from '../../assets/img/pdf.png';
// import { Online, Offline } from "react-detect-offline";
// import csvicon from '../../assets/img/csv.png'
// import { LOGO } from '../../CommonComponent/Logo.js'
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import RealmCountryService from '../../api/RealmCountryService';
// import ReportService from '../../api/ReportService';
// import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
// //import fs from 'fs'
// const Widget04 = lazy(() => import('../Widgets/Widget04'));
// // const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
// const ref = React.createRef();

// const brandPrimary = getStyle('--primary')
// const brandSuccess = getStyle('--success')
// const brandInfo = getStyle('--info')
// const brandWarning = getStyle('--warning')
// const brandDanger = getStyle('--danger')
// const pickerLang = {
//   months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
//   from: 'From', to: 'To',
// }


// const options = {
//   title: {
//     display: true,
//     fontColor: 'black',
//     fontStyle: "normal",
//     fontSize: "12"
//   },
//   scales: {
//     yAxes: [
//       {
//         scaleLabel: {
//           display: true,
//           labelString: i18n.t('static.report.error'),
//           fontColor: 'black',
//           fontStyle: "normal",
//           fontSize: "12"
//         },
//         ticks: {
//           yValueFormatString: "$#####%",
//           beginAtZero: true,
//           Max: 900,
//           callback: function (value) {
//             return value + "%";
//           }
//         }
//       }
//     ], xAxes: [{

//       scaleLabel: {
//         display: true,
//         labelString: i18n.t('static.report.month'),
//         fontColor: 'black',
//         fontStyle: "normal",
//         fontSize: "12"
//       },
//       ticks: {
//         fontColor: 'black',
//         fontStyle: "normal",
//         fontSize: "12"
//       }
//     }]
//   },
//   hover: {
//     animationDuration: 0
//   },
//   animation: {
//     onComplete: function () {
//       const chartInstance = this.chart,
//         ctx = chartInstance.ctx;


//       ctx.textAlign = "center";
//       ctx.textBaseline = "bottom";
//       this.data.datasets.forEach(function (dataset, i) {
//         const meta = chartInstance.controller.getDatasetMeta(i);
//         meta.data.forEach(function (bar, index) {
//           const data = dataset.data[index] + "%";
//           ctx.fillStyle = "#000";
//           ctx.fillText(data, bar._model.x, bar._model.y - 2);
//         });
//       });
//     }
//   },
//   tooltips: {
//     mode: 'index',
//     callbacks: {
//       label: function (tooltipItems, data) {

//         return tooltipItems.yLabel + "%";
//       }
//     },
//     enabled: true,
//     //    custom: CustomTooltips
//   },
//   maintainAspectRatio: false,
//   legend: {
//     display: true,
//     position: 'bottom',
//     labels: {
//       usePointStyle: true,
//       fontColor: 'black',
//       fontStyle: "normal",
//       fontSize: "12"
//     }
//   },

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




// class ForcastMatrixOverTime extends Component {
//   constructor(props) {
//     super(props);

//     this.toggle = this.toggle.bind(this);
//     this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

//     this.state = {
//       matricsList: [],
//       dropdownOpen: false,
//       radioSelected: 2,
//       programs: [],
//       versions: [],
//       productCategories: [],
//       planningUnits: [],
//       categories: [],
//       countries: [],
//       show: false,
//       singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
//       rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },



//     };

//     this.fetchData = this.fetchData.bind(this);
//     this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
//     this.handleRangeChange = this.handleRangeChange.bind(this);
//     this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
//     // this.getPlanningUnit = this.getPlanningUnit.bind(this);
//     // this.getProductCategories = this.getProductCategories.bind(this)
//     //this.pickRange = React.createRef()
//      this.hideSecondComponent = this.hideSecondComponent.bind(this);
//   }
//   hideSecondComponent() {
//       document.getElementById('div2').style.display = 'block';
//       setTimeout(function () {
//           document.getElementById('div2').style.display = 'none';
//       }, 8000);
//   }

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
//   dateFormatter = value => {
//     return moment(value).format('MMM YY')
//   }
//   makeText = m => {
//     if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
//     return '?'
//   }
//   roundN = num => {
//     if(num!=''&& num!=null){
//     return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
//     }else{
//       return NaN
//     }
//   }
// PercentageFormatter=num=>{

//   if(num!=''&& num!=null){
//     return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2)+'%';
//     }else{
//       return ''
//     }
// }
//   toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

//   exportCSV() {

//     var csvRow = [];
//     csvRow.push((i18n.t('static.report.dateRange') + ' , ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
//     csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
//     csvRow.push((i18n.t('static.report.version')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("versionId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
//     csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
//     csvRow.push('')
//     csvRow.push('')
//     csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
//     csvRow.push('')
//     var re;
//     var A = [[(i18n.t('static.report.month')).replaceAll(' ', '%20'), (i18n.t('static.report.forecastConsumption')).replaceAll(' ', '%20'), (i18n.t('static.report.actualConsumption')).replaceAll(' ', '%20'), ((i18n.t('static.report.error')).replaceAll(' ', '%20')).replaceAll(' ', '%20')]]

//     re = this.state.matricsList


//     for (var item = 0; item < re.length; item++) {
//       A.push([this.dateFormatter(re[item].month).replaceAll(' ', '%20'), re[item].forecastedConsumption, re[item].actualConsumption, this.PercentageFormatter(re[item].forecastError ) ])
//     }
//     for (var i = 0; i < A.length; i++) {
//       csvRow.push(A[i].join(","))
//     }
//     var csvString = csvRow.join("%0A")
//     var a = document.createElement("a")
//     a.href = 'data:attachment/csv,' + csvString
//     a.target = "_Blank"
//     a.download = i18n.t('static.report.forecasterrorovertime')  + ".csv"
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


//       for (var i = 1; i <= pageCount; i++) {
//         doc.setFontSize(12)
//         doc.setFont('helvetica', 'bold')

//         doc.setPage(i)

//         doc.addImage(LOGO, 'png', 0, 10, 180, 50, '', 'FAST');

//         doc.setTextColor("#002f6c");
//         doc.text(i18n.t('static.report.forecasterrorovertime'), doc.internal.pageSize.width / 2, 60, {
//           align: 'center'
//         })
//         if (i == 1) {
//           doc.setFont('helvetica', 'normal')

//           doc.setFontSize(8)
//           doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
//             align: 'left'
//         })
//           doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
//             align: 'left'
//           })
//           doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
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

//     var canvas = document.getElementById("cool-canvas");
//     //creates image

//     var canvasImg = canvas.toDataURL("image/png", 1.0);
//     var width = doc.internal.pageSize.width;
//     var height = doc.internal.pageSize.height;
//     var h1 = 50;
//     var aspectwidth1 = (width - h1);

//     doc.addImage(canvasImg, 'png', 50, 220, 750, 210, 'CANVAS');
//     const headers = [[i18n.t('static.report.month'),
//     i18n.t('static.report.forecastConsumption'), i18n.t('static.report.actualConsumption'), i18n.t('static.report.error')]];
//     const data = this.state.matricsList.map(elt => [this.dateFormatter(elt.month), this.formatter(elt.forecastedConsumption), this.formatter(elt.actualConsumption), this.PercentageFormatter(elt.forecastError ) ]);

//     let content = {
//       margin: { top: 80,bottom:50 },
//       startY: height,
//       head: headers,
//       body: data,
//       styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

//     };



//     //doc.text(title, marginLeft, 40);
//     doc.autoTable(content);
//     addHeaders(doc)
//     addFooters(doc)
//     doc.save(i18n.t('static.report.forecasterrorovertime')+".pdf")
//     //creates PDF from img
//     /*  var doc = new jsPDF('landscape');
//       doc.setFontSize(20);
//       doc.text(15, 15, "Cool Chart");
//       doc.save('canvas.pdf');*/
//   }
//   getPrograms = () => {
//     if (navigator.onLine) {
//       AuthenticationService.setupAxiosInterceptors();
//       let realmId = AuthenticationService.getRealmId();
//       ProgramService.getProgramByRealmId(realmId)
//         .then(response => {
//           console.log(JSON.stringify(response.data))
//           this.setState({
//             programs: response.data
//           }, () => { this.consolidatedProgramList() })
//         }).catch(
//           error => {
//             this.setState({
//               programs: []
//             }, () => { this.consolidatedProgramList() })
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
//       console.log('offline')
//       this.consolidatedProgramList()
//     }

//   }
//   consolidatedProgramList = () => {
//     const lan = 'en';
//     const { programs } = this.state
//     var proList = programs;

//     var db1;
//     getDatabase();
//     var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
//     openRequest.onsuccess = function (e) {
//       db1 = e.target.result;
//       var transaction = db1.transaction(['programData'], 'readwrite');
//       var program = transaction.objectStore('programData');
//       var getRequest = program.getAll();

//       getRequest.onerror = function (event) {
//         // Handle errors!
//       };
//       getRequest.onsuccess = function (event) {
//         var myResult = [];
//         myResult = getRequest.result;
//         var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//         var userId = userBytes.toString(CryptoJS.enc.Utf8);
//         for (var i = 0; i < myResult.length; i++) {
//           if (myResult[i].userId == userId) {
//             var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
//             var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
//             var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
//             var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
//             console.log(programNameLabel)

//             var f = 0
//             for (var k = 0; k < this.state.programs.length; k++) {
//               if (this.state.programs[k].programId == programData.programId) {
//                 f = 1;
//                 console.log('already exist')
//               }
//             }
//             if (f == 0) {
//               proList.push(programData)
//             }
//           }


//         }

//         this.setState({
//           programs: proList
//         })

//       }.bind(this);

//     }.bind(this);


//   }


//   filterVersion = () => {
//     let programId = document.getElementById("programId").value;
//     if (programId != 0) {

//       const program = this.state.programs.filter(c => c.programId == programId)
//       console.log(program)
//       if (program.length == 1) {
//         if (navigator.onLine) {
//           this.setState({
//             versions: [],
//             planningUnits: []
//           }, () => {
//             this.setState({
//               versions: program[0].versionList.filter(function (x, i, a) {
//                 return a.indexOf(x) === i;
//               })
//             }, () => { this.consolidatedVersionList(programId) });
//           });


//         } else {
//           this.setState({
//             versions: [],
//             planningUnits: []
//           }, () => { this.consolidatedVersionList(programId) })
//         }
//       } else {

//         this.setState({
//           versions: []
//         })

//       }
//     } else {
//       this.setState({
//         versions: []
//       })
//     }
//   }
//   consolidatedVersionList = (programId) => {
//     const lan = 'en';
//     const { versions } = this.state
//     var verList = versions;

//     var db1;
//     getDatabase();
//     var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
//     openRequest.onsuccess = function (e) {
//       db1 = e.target.result;
//       var transaction = db1.transaction(['programData'], 'readwrite');
//       var program = transaction.objectStore('programData');
//       var getRequest = program.getAll();

//       getRequest.onerror = function (event) {
//         // Handle errors!
//       };
//       getRequest.onsuccess = function (event) {
//         var myResult = [];
//         myResult = getRequest.result;
//         var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//         var userId = userBytes.toString(CryptoJS.enc.Utf8);
//         for (var i = 0; i < myResult.length; i++) {
//           if (myResult[i].userId == userId && myResult[i].programId == programId) {
//             var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
//             var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
//             var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
//             var programData = databytes.toString(CryptoJS.enc.Utf8)
//             var version = JSON.parse(programData).currentVersion

//             version.versionId = `${version.versionId} (Local)`
//             verList.push(version)

//           }


//         }

//         console.log(verList)
//         this.setState({
//           versions: verList.filter(function (x, i, a) {
//             return a.indexOf(x) === i;
//           })
//         })

//       }.bind(this);



//     }.bind(this)


//   }

//   getPlanningUnit = () => {
//     let programId = document.getElementById("programId").value;
//     let versionId = document.getElementById("versionId").value;
//     this.setState({
//       planningUnits: []
//     }, () => {
//       if (versionId.includes('Local')) {
//         const lan = 'en';
//         var db1;
//         var storeOS;
//         getDatabase();
//         var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
//         openRequest.onsuccess = function (e) {
//           db1 = e.target.result;
//           var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
//           var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
//           var planningunitRequest = planningunitOs.getAll();
//           var planningList = []
//           planningunitRequest.onerror = function (event) {
//             // Handle errors!
//           };
//           planningunitRequest.onsuccess = function (e) {
//             var myResult = [];
//             myResult = planningunitRequest.result;
//             var programId = (document.getElementById("programId").value).split("_")[0];
//             var proList = []
//             console.log(myResult)
//             for (var i = 0; i < myResult.length; i++) {
//               if (myResult[i].program.id == programId) {

//                 proList[i] = myResult[i]
//               }
//             }
//             this.setState({
//               planningUnits: proList, message: ''
//             }, () => {
//               this.fetchData();
//             })
//           }.bind(this);
//         }.bind(this)


//       }
//       else {
//         AuthenticationService.setupAxiosInterceptors();

//         ProgramService.getProgramPlaningUnitListByProgramId(programId).then(response => {
//           console.log('**' + JSON.stringify(response.data))
//           this.setState({
//             planningUnits: response.data, message: ''
//           }, () => {
//             this.fetchData();
//           })
//         })
//           .catch(
//             error => {
//               this.setState({
//                 planningUnits: [],
//               })
//               if (error.message === "Network Error") {
//                 this.setState({ message: error.message });
//               } else {
//                 switch (error.response ? error.response.status : "") {
//                   case 500:
//                   case 401:
//                   case 404:
//                   case 406:
//                   case 412:
//                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }) });
//                     break;
//                   default:
//                     this.setState({ message: 'static.unkownError' });
//                     break;
//                 }
//               }
//             }
//           );
//       }
//     });

//   }

//   componentDidMount() {

//     this.getPrograms();


//   }


//   fetchData() {
//     let programId = document.getElementById("programId").value;
//     let versionId = document.getElementById("versionId").value;
//     let planningUnitId = document.getElementById("planningUnitId").value;
//     let monthInCalc=document.getElementById("viewById").value;
//     let startDate = this.state.rangeValue.from.year + '-' + ("00" + this.state.rangeValue.from.month).substr(-2) + '-01';
//     let stopDate = this.state.rangeValue.to.year + '-' + ("00" + this.state.rangeValue.to.month).substr(-2) + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();

//     var input = { "programId": programId,"versionId":versionId, "planningUnitId": planningUnitId, "startDate": startDate, "stopDate": stopDate,"previousMonths":monthInCalc }
//     if (programId > 0 && planningUnitId > 0 && versionId != 0) {
//       if (versionId.includes('Local')) {


//         var db1;
//         getDatabase();
//         var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
//         openRequest.onsuccess = function (e) {
//           db1 = e.target.result;

//           var transaction = db1.transaction(['programData'], 'readwrite');
//           var programTransaction = transaction.objectStore('programData');
//           var version = (versionId.split('(')[0]).trim()
//           var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//           var userId = userBytes.toString(CryptoJS.enc.Utf8);
//           var program = `${programId}_v${version}_uId_${userId}`
//           var data = [];
//           var programRequest = programTransaction.get(program);

//           programRequest.onsuccess = function (event) {
//             var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
//             var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
//             var programJson = JSON.parse(programData);
//             console.log('programJson',programJson)
//             var pu = (this.state.planningUnits.filter(c => c.planningUnit.id == planningUnitId))[0]

//             var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);

//             var monthstartfrom = this.state.rangeValue.from.month
//             for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
//               var monthlydata = [];
//               for (var month = monthstartfrom; month <= 12; month++) {
//                 var year = from;
//                 var actualconsumption = 0;
//                 var forcastConsumption = 0;
//                var montcnt = 0
//                var  absvalue = 0;
//                var currentActualconsumption = 0;
//                var currentForcastConsumption = 0;
//                 for (var i = month, j = 0; j <= monthInCalc; i-- , j++) {
//                   if (i == 0) {
//                     i = 12;
//                     year = year - 1
//                   }
//                   var dt = year + "-" + String(i).padStart(2, '0') + "-01"
//                   var conlist = consumptionList.filter(c => c.consumptionDate === dt)

//                     var actconsumption = 0;
//                     var forConsumption = 0;

//                     for (var l = 0; l < conlist.length; l++) {
//                       if (conlist[l].actualFlag.toString() == 'true') {
//                         actconsumption = actconsumption + conlist[l].consumptionQty
//                       } else {
//                         forConsumption = forConsumption + conlist[l].consumptionQty
//                       }
//                     }
//                         actualconsumption = actualconsumption + actconsumption
//                         forcastConsumption = forcastConsumption + forConsumption
//                         if(j==0){
//                         currentActualconsumption=currentActualconsumption+actconsumption
//                         currentForcastConsumption=currentForcastConsumption+forConsumption}
//                         if(actconsumption>0 && forConsumption>0)
//                         absvalue = absvalue + (Math.abs(actconsumption - forConsumption))





//                 }

//                 var json = {
//                   month: new Date(from, month - 1),
//                   actualConsumption: currentActualconsumption,
//                   forecastedConsumption: currentForcastConsumption,
//                   forecastError:actualconsumption>0?( ((absvalue * 100)/ actualconsumption)):''

//                 }
//                 data.push(json)

//                 if (month == this.state.rangeValue.to.month && from == to) {
//                   this.setState({
//                     matricsList: data,
//                     message: ''
//                   })

//                   return;
//                 }
//               }
//               monthstartfrom = 1

//             }

//           }.bind(this)
//         }.bind(this)
//       } else {


//         AuthenticationService.setupAxiosInterceptors();
//         ReportService.getForecastMatricsOverTime(input)
//           .then(response => {
//             console.log(JSON.stringify(response.data));
//             this.setState({
//               matricsList: response.data,
//               message: ''
//             })
//           }).catch(
//             error => {
//               this.setState({
//                 matricsList: []
//               })

//               if (error.message === "Network Error") {
//                 this.setState({ message: error.message });
//               } else {
//                 switch (error.response ? error.response.status : "") {
//                   case 500:
//                   case 401:
//                   case 404:
//                   case 406:
//                   case 412:
//                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
//                     break;
//                   default:
//                     this.setState({ message: 'static.unkownError' });
//                     break;
//                 }
//               }
//             }
//           );
//       }
//     }
//     else if (programId == 0) {
//       this.setState({ message: i18n.t('static.common.selectProgram'), matricsList:[]});

//     } else if (versionId == 0) {
//       this.setState({ message: i18n.t('static.program.validversion'), matricsList:[] });

//     } else {
//       this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), matricsList:[] });

//     }
//     /*   this.setState({
//          matricsList: [{ACTUAL_DATE:"2019-04",errorperc:30},{ACTUAL_DATE:"2019-05",errorperc:50},{ACTUAL_DATE:"2019-06",errorperc:40},]
//        })*/
//     console.log('matrix list updated' + this.state.matricsList)
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
//          setTimeout(() => {this.state.closeable = true}, 250)
//          this.setState({ showed: true })
//      }*/
//   }
//   handleRangeChange(value, text, listIndex) {
//     //
//   }
//   handleRangeDissmis(value) {
//     this.setState({ rangeValue: value }, () => {
//       this.fetchData();
//     })

//   }

//   _handleClickRangeBox(e) {
//     this.refs.pickRange.show()
//   }

//   handleClickMonthBox2 = (e) => {
//     this.refs.pickAMonth2.show()
//   }
//   handleAMonthChange2 = (value, text) => {
//     //
//     //
//   }
//   handleAMonthDissmis2 = (value) => {
//     this.setState({ singleValue2: value }, () => {
//       this.fetchData();
//     })

//   }
//   loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

//   render() {
//     const { planningUnits } = this.state;
//     let planningUnitList = planningUnits.length > 0
//       && planningUnits.map((item, i) => {
//         return (
//           <option key={i} value={item.planningUnit.id}>
//             {getLabelText(item.planningUnit.label, this.state.lang)}
//           </option>
//         )
//       }, this);
//     const { programs } = this.state;
//     let programList = programs.length > 0
//       && programs.map((item, i) => {
//         return (
//           <option key={i} value={item.programId}>
//             {getLabelText(item.label, this.state.lang)}
//           </option>
//         )
//       }, this);
//     const { versions } = this.state;
//     let versionList = versions.length > 0
//       && versions.map((item, i) => {
//         return (
//           <option key={i} value={item.versionId}>
//             {item.versionId}
//           </option>
//         )
//       }, this);

//     const bar = {

//       labels: this.state.matricsList.map((item, index) => (this.dateFormatter(item.month))),
//       datasets: [
//         {
//           type: "line",
//           label: i18n.t('static.report.forecasterrorovertime'),
//           backgroundColor: 'transparent',
//           borderColor: '#ffc107',
//           lineTension: 0,
//           showActualPercentages: true,
//           showInLegend: true,
//           pointStyle: 'line',
//           yValueFormatString: "$#####%",

//           data: this.state.matricsList.map((item, index) => (this.roundN(item.forecastError)))
//         }
//       ],




//     }
//     const pickerLang = {
//       months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
//       from: 'From', to: 'To',
//     }
//     const { rangeValue } = this.state
//     const { singleValue2 } = this.state

//     const makeText = m => {
//       if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
//       return '?'
//     }


//     return (
//       <div className="animated fadeIn" >
//         <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
//         <h5 className="red">{i18n.t(this.state.message)}</h5>
//         <SupplyPlanFormulas ref="formulaeChild" />
//         <Row>
//           <Col lg="12">
//             <Card>
//               <div className="Card-header-reporticon">
//               <div className="card-header-actions">
//               <a className="card-header-action">
//               <span style={{cursor: 'pointer'}} onClick={() => { this.refs.formulaeChild.toggleForecastMatrix() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
//                             </a>
//                 {/* <i className="icon-menu"></i><strong>{i18n.t('static.report.forecasterrorovertime')}</strong> */}

//                   {
//                     this.state.matricsList.length > 0 &&


//                       <a className="card-header-action">
//                       <img style={{ height: '25px', width: '25px',cursor:'pointer' }} src={pdfIcon} title="Export PDF"  onClick={() => this.exportPDF()}/>
//                       <img style={{ height: '25px', width: '25px',cursor:'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
//                       </a> 
//                   }
//                   </div>
//                 </div>
//               <CardBody className="pb-lg-2 pt-lg-0">
//                 <div className="TableCust" >
//                   <div ref={ref}>
//                     <Form >
//                       <Col md="12 pl-0">
//                         <div className="row">
//                         <FormGroup className="col-md-3">
//                         <Label htmlFor="appendedInputButton">Select Period</Label>
//                         <div className="controls  edit">

//                           <Picker
//                             ref="pickRange"
//                             years={{ min: 2013, max: 2022 }}
//                             value={rangeValue}
//                             lang={pickerLang}
//                             //theme="light"
//                             onChange={this.handleRangeChange}
//                             onDismiss={this.handleRangeDissmis}
//                           >
//                             <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
//                           </Picker>
//                         </div>

//                       </FormGroup>

//                     <FormGroup className="col-md-3">
//                         <Label htmlFor="appendedInputButton">{i18n.t('static.report.timeWindow')}</Label>
//                         <div className="controls">
//                           <InputGroup>
//                             <Input
//                               type="select"
//                               name="viewById"
//                               id="viewById"
//                               bsSize="sm"
//                               onChange={this.fetchData}
//                             >
//                               <option value="5">6 {i18n.t('static.dashboard.months')}</option>
//                               <option value="2">3 {i18n.t('static.dashboard.months')}</option>
//                               <option value="8">9 {i18n.t('static.dashboard.months')}</option>
//                               <option value="11">12 {i18n.t('static.dashboard.months')}</option>
//                             </Input>
//                           </InputGroup>
//                         </div>
//                       </FormGroup>

//  <FormGroup className="col-md-3">
//                             <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
//                             <div className="controls ">
//                               <InputGroup>
//                                 <Input
//                                   type="select"
//                                   name="programId"
//                                   id="programId"
//                                   bsSize="sm"
//                                   onChange={this.filterVersion}
//                                 >
//                                   <option value="0">{i18n.t('static.common.select')}</option>
//                                   {programs.length > 0
//                                     && programs.map((item, i) => {
//                                       return (
//                                         <option key={i} value={item.programId}>
//                                           {getLabelText(item.label, this.state.lang)}
//                                         </option>
//                                       )
//                                     }, this)}

//                                 </Input>

//                               </InputGroup>
//                             </div>
//                           </FormGroup>

//                           {/* <FormGroup className="col-md-3">
//                               <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.country')}</Label>
//                               <div className="controls ">
//                                 <InputGroup>
//                                   <Input
//                                     type="select"
//                                     name="countryId"
//                                     id="countryId"
//                                     bsSize="sm"
//                                     onChange={this.fetchData}

//                                   >
//                                     <option value="0">{i18n.t('static.common.select')}</option>
//                                     {countryList}
//                                   </Input>

//                                 </InputGroup>
//                               </div>
//                             </FormGroup>
//                             <FormGroup className="col-md-3"> 
//                             <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
//                                         <div className="controls ">
//                                             <InputGroup>
//                                                 <Input
//                                                     type="select"
//                                                     name="productCategoryId"
//                                                     id="productCategoryId"
//                                                     bsSize="sm"
//                                                     onChange={this.getPlanningUnit}
//                                                 >
//                                                     <option value="0">{i18n.t('static.common.select')}</option>
//                                                     {productCategoryList}
//                                                 </Input>

//                                             </InputGroup>
//                                         </div>

//                             </FormGroup>*/}
//                           <FormGroup className="col-md-3">
//                             <Label htmlFor="appendedInputButton">Version</Label>
//                             <div className="controls">
//                               <InputGroup>
//                                 <Input
//                                   type="select"
//                                   name="versionId"
//                                   id="versionId"
//                                   bsSize="sm"
//                                   onChange={(e) => { this.getPlanningUnit(); }}
//                                 >
//                                   <option value="-1">{i18n.t('static.common.select')}</option>
//                                   {versionList}
//                                 </Input>

//                               </InputGroup>
//                             </div>
//                           </FormGroup>
//                           <FormGroup className="col-md-3">
//                             <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
//                             <div className="controls">
//                               <InputGroup>
//                                 <Input
//                                   type="select"
//                                   name="planningUnitId"
//                                   id="planningUnitId"
//                                   bsSize="sm"
//                                   onChange={this.fetchData}
//                                 >
//                                   <option value="0">{i18n.t('static.common.select')}</option>
//                                   {planningUnitList}
//                                 </Input>
//                                 {/* <InputGroupAddon addonType="append">
//                                     <Button color="secondary Gobtn btn-sm" onClick={this.fetchData}>{i18n.t('static.common.go')}</Button>
//                                   </InputGroupAddon> */}
//                               </InputGroup>
//                             </div>
//                           </FormGroup>
//                         </div>
//                       </Col>
//                     </Form>
//                     <Col md="12 pl-0">
//                       <div className="row">
//                         {
//                           this.state.matricsList.length > 0
//                           &&
//                           <div className="col-md-12 p-0">
//                             <div className="col-md-12">
//                               <div className="chart-wrapper chart-graph-report">
//                                 <Bar id="cool-canvas" data={bar} options={options} />
//                               </div>
//                             </div>
//                             <div className="col-md-12">
//                               <button className="mr-1 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
//                                 {this.state.show ? 'Hide Data' : 'Show Data'}
//                               </button>

//                             </div>
//                           </div>}
//                       </div>

//                       <div className="row">
//                         <div className="col-md-12">
//                           {this.state.show && this.state.matricsList.length > 0 &&
//                             <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

//                               <thead>
//                                 <tr>
//                                   <th className="text-center" style={{ width: '20%' }}> {i18n.t('static.report.month')} </th>
//                                   <th className="text-center" style={{ width: '20%' }}> {i18n.t('static.report.forecastConsumption')} </th>
//                                   <th className="text-center" style={{ width: '20%' }}>{i18n.t('static.report.actualConsumption')}</th>
//                                   <th className="text-center" style={{ width: '20%' }}>{i18n.t('static.report.error')}</th>
//                                 </tr>
//                               </thead>

//                               <tbody>
//                                 {
//                                   this.state.matricsList.length > 0
//                                   &&
//                                   this.state.matricsList.map((item, idx) =>

//                                     <tr id="addr0" key={idx} >

//                                       <td>{this.dateFormatter(this.state.matricsList[idx].month)}</td>
//                                       <td>

//                                         {this.formatter(this.state.matricsList[idx].forecastedConsumption)}
//                                       </td>
//                                       <td>
//                                         {this.formatter(this.state.matricsList[idx].actualConsumption)}
//                                       </td>
//                                       <td>
//                                         {this.PercentageFormatter(this.state.matricsList[idx].forecastError) }
//                                       </td>
//                                     </tr>)

//                                 }
//                               </tbody>
//                             </Table>}

//                         </div>
//                       </div></Col>



//                   </div>
//                 </div></CardBody>
//             </Card>
//           </Col>
//         </Row>


//       </div>
//     );
//   }
// }

// export default ForcastMatrixOverTime;

// Loader


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
import moment, { version } from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import { Online, Offline } from "react-detect-offline";
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import RealmCountryService from '../../api/RealmCountryService';
import ReportService from '../../api/ReportService';
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
//import fs from 'fs'
const Widget04 = lazy(() => import('../Widgets/Widget04'));
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


const options = {
  title: {
    display: true,
    fontColor: 'black',
    fontStyle: "normal",
    fontSize: "12"
  },
  scales: {
    yAxes: [
      {
        scaleLabel: {
          display: true,
          labelString: i18n.t('static.report.error'),
          fontColor: 'black',
          fontStyle: "normal",
          fontSize: "12"
        },
        ticks: {
          yValueFormatString: "$#####%",
          beginAtZero: true,
          Max: 900,
          callback: function (value) {
            return value + "%";
          }
        }
      }
    ], xAxes: [{

      scaleLabel: {
        display: true,
        labelString: i18n.t('static.report.month'),
        fontColor: 'black',
        fontStyle: "normal",
        fontSize: "12"
      },
      ticks: {
        fontColor: 'black',
        fontStyle: "normal",
        fontSize: "12"
      }
    }]
  },
  hover: {
    animationDuration: 0
  },
  animation: {
    onComplete: function () {
      const chartInstance = this.chart,
        ctx = chartInstance.ctx;


      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      this.data.datasets.forEach(function (dataset, i) {
        const meta = chartInstance.controller.getDatasetMeta(i);
        meta.data.forEach(function (bar, index) {
          const data = dataset.data[index] + "%";
          ctx.fillStyle = "#000";
          ctx.fillText(data, bar._model.x, bar._model.y - 2);
        });
      });
    }
  },
  tooltips: {
    mode: 'index',
    callbacks: {
      label: function (tooltipItems, data) {

        return tooltipItems.yLabel + "%";
      }
    },
    enabled: true,
    //    custom: CustomTooltips
  },
  maintainAspectRatio: false,
  legend: {
    display: true,
    position: 'bottom',
    labels: {
      usePointStyle: true,
      fontColor: 'black',
      fontStyle: "normal",
      fontSize: "12"
    }
  },

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




class ForcastMatrixOverTime extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      loading: true,
      matricsList: [],
      dropdownOpen: false,
      radioSelected: 2,
      programs: [],
      versions: [],
      productCategories: [],
      planningUnits: [],
      categories: [],
      countries: [],
      show: false,
      singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
      rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 2 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 3, month: new Date().getMonth()+2 },
      maxDate: { year: new Date().getFullYear() + 3, month: new Date().getMonth()  },


    };

    this.fetchData = this.fetchData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    // this.getPlanningUnit = this.getPlanningUnit.bind(this);
    // this.getProductCategories = this.getProductCategories.bind(this)
    //this.pickRange = React.createRef()
    this.hideSecondComponent = this.hideSecondComponent.bind(this);
  }
  hideSecondComponent() {
    document.getElementById('div2').style.display = 'block';
    setTimeout(function () {
      document.getElementById('div2').style.display = 'none';
    }, 8000);
  }

  formatter = value => {
if(value!=null){
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
  }else{
    return '';
  }
  }
  dateFormatter = value => {
    return moment(value).format('MMM YY')
  }
  makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
  }
  roundN = num => {
    if (num != '' && num != null) {
      return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
    } else {
      return NaN
    }
  }
  PercentageFormatter = num => {

    if (num != '' && num != null) {
      return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2) + '%';
    } else {
      return ''
    }
  }
  toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
  addDoubleQuoteToRowContent=(arr)=>{
    return arr.map(ele=>'"'+ele+'"')
 }
  exportCSV() {

    var csvRow = [];
    csvRow.push((i18n.t('static.report.dateRange') + ' , ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
    csvRow.push((i18n.t('static.report.timeWindow')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("viewById").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
    csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
    csvRow.push((i18n.t('static.report.version')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("versionId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
    csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
    csvRow.push('')
    csvRow.push('')
    csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
    csvRow.push('')
    var re;
    var A = [this.addDoubleQuoteToRowContent([(i18n.t('static.report.month')).replaceAll(' ', '%20'), (i18n.t('static.report.forecastConsumption')).replaceAll(' ', '%20'), (i18n.t('static.report.actualConsumption')).replaceAll(' ', '%20'), ((i18n.t('static.report.error')).replaceAll(' ', '%20')).replaceAll(' ', '%20')])]

    re = this.state.matricsList


    for (var item = 0; item < re.length; item++) {
      A.push(this.addDoubleQuoteToRowContent([this.dateFormatter(re[item].month).replaceAll(' ', '%20'), re[item].forecastedConsumption, re[item].actualConsumption, this.PercentageFormatter(re[item].forecastError)]))
    }
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.report.forecasterrorovertime') + ".csv"
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


      for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')

        doc.setPage(i)

        doc.addImage(LOGO, 'png', 0, 10, 180, 50, '', 'FAST');

        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.report.forecasterrorovertime'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFont('helvetica', 'normal')

          doc.setFontSize(8)
          doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
            align: 'left'
          })
          doc.text(i18n.t('static.report.timeWindow') + ' : ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
            align: 'left'
          })
          doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
            align: 'left'
          })
          doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
            align: 'left'
          })
          doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 170, {
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

    var canvas = document.getElementById("cool-canvas");
    //creates image

    var canvasImg = canvas.toDataURL("image/png", 1.0);
    var width = doc.internal.pageSize.width;
    var height = doc.internal.pageSize.height;
    var h1 = 50;
    var aspectwidth1 = (width - h1);

    doc.addImage(canvasImg, 'png', 50, 220, 750, 210, 'CANVAS');
    const headers = [[i18n.t('static.report.month'),
    i18n.t('static.report.forecastConsumption'), i18n.t('static.report.actualConsumption'), i18n.t('static.report.error')]];
    const data = this.state.matricsList.map(elt => [this.dateFormatter(elt.month), this.formatter(elt.forecastedConsumption), this.formatter(elt.actualConsumption), this.PercentageFormatter(elt.forecastError)]);

    let content = {
      margin: { top: 80, bottom: 50 },
      startY: height,
      head: headers,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

    };



    //doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.report.forecasterrorovertime') + ".pdf")
    //creates PDF from img
    /*  var doc = new jsPDF('landscape');
      doc.setFontSize(20);
      doc.text(15, 15, "Cool Chart");
      doc.save('canvas.pdf');*/
  }
  getPrograms = () => {
    if (navigator.onLine) {
      AuthenticationService.setupAxiosInterceptors();
      ProgramService.getProgramList()
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
              this.setState({ loading: false, message: error.message });
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
                  this.setState({ loading: false, message: 'static.unkownError' });
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
            versions: [],
            planningUnits: []
          }, () => {
            this.setState({
              versions: program[0].versionList.filter(function (x, i, a) {
                return a.indexOf(x) === i;
              })
            }, () => { this.consolidatedVersionList(programId) });
          });


        } else {
          this.setState({
            versions: [],
            planningUnits: []
          }, () => { this.consolidatedVersionList(programId) })
        }
      } else {

        this.setState({
          versions: [],
          planningUnits: [],
          planningUnitValues: []
        })
        this.fetchData();
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

      if (versionId == 0) {
        this.setState({ message: i18n.t('static.program.validversion'), data: [] }, () => {
          this.setState({ message: i18n.t('static.program.validversion'), matricsList: [] });
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
              console.log(myResult)
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

          ProgramService.getProgramPlaningUnitListByProgramId(programId).then(response => {
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

  componentDidMount() {

    this.getPrograms();


  }


  fetchData() {
    let programId = document.getElementById("programId").value;
    let versionId = document.getElementById("versionId").value;
    let planningUnitId = document.getElementById("planningUnitId").value;
    let monthInCalc = document.getElementById("viewById").value;
    let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
    let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();

    var input = { "programId": programId, "versionId": versionId, "planningUnitId": planningUnitId, "startDate": startDate, "stopDate": stopDate, "previousMonths": monthInCalc }
    if (programId > 0 && planningUnitId > 0 && versionId != 0) {
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
            // this.setState({ loading: true })
            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson = JSON.parse(programData);
            console.log('programJson', programJson)
            var pu = (this.state.planningUnits.filter(c => c.planningUnit.id == planningUnitId))[0]

            var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);

            var monthstartfrom = this.state.rangeValue.from.month
            for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++) {
              var monthlydata = [];
              for (var month = monthstartfrom; month <= 12; month++) {
                var year = from;
                var actualconsumption = 0;
                var forcastConsumption = 0;
                var montcnt = 0
                var absvalue = 0;
                var currentActualconsumption = null;
                var currentForcastConsumption = 0;
                for (var i = month, j = 0; j <= monthInCalc; i-- , j++) {
                  if (i == 0) {
                    i = 12;
                    year = year - 1
                  }
                  var dt = year + "-" + String(i).padStart(2, '0') + "-01"
                  var conlist = consumptionList.filter(c => c.consumptionDate === dt)

                  var actconsumption = 0;
                  var forConsumption = 0;

                  for (var l = 0; l < conlist.length; l++) {
                    if (conlist[l].actualFlag.toString() == 'true') {
                      actconsumption = actconsumption + parseInt(conlist[l].consumptionQty)
                    } else {
                      forConsumption = forConsumption + parseInt(conlist[l].consumptionQty)
                    }
                  }
                  actualconsumption = actualconsumption + actconsumption
                  forcastConsumption = forcastConsumption + forConsumption
                  if (j == 0) {
                    console.log(currentActualconsumption,' ',actconsumption)
                    if(currentActualconsumption==null && actconsumption>0)
                    {
                      currentActualconsumption=0
                    }
                    if(currentActualconsumption!=null){
                    currentActualconsumption = currentActualconsumption + actconsumption
                    }
                    currentForcastConsumption = currentForcastConsumption + forConsumption
                  }
                  if (actconsumption > 0 && forConsumption > 0)
                    absvalue = absvalue + (Math.abs(actconsumption - forConsumption))





                }

                var json = {
                  month: new Date(from, month - 1),
                  actualConsumption: currentActualconsumption,
                  forecastedConsumption: currentForcastConsumption,
                  forecastError: actualconsumption > 0 ? (((absvalue * 100) / actualconsumption)) : ''

                }
                data.push(json)

                if (month == this.state.rangeValue.to.month && from == to) {
                  this.setState({
                    matricsList: data,
                    message: '',
                    loading: false
                  })

                  return;
                }
              }
              monthstartfrom = 1

            }

          }.bind(this)
        }.bind(this)
      } else {

        this.setState({ loading: true })
        AuthenticationService.setupAxiosInterceptors();
        ReportService.getForecastMatricsOverTime(input)
          .then(response => {
            console.log(JSON.stringify(response.data));
            this.setState({
              matricsList: response.data,
              message: '', loading: false
            })
          }).catch(
            error => {
              this.setState({
                matricsList: [], loading: false
              })

              if (error.message === "Network Error") {
                this.setState({ loading: false, message: error.message });
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
                    this.setState({ loading: false, message: 'static.unkownError' });
                    break;
                }
              }
            }
          );
      }
    }
    else if (programId == 0) {
      this.setState({ message: i18n.t('static.common.selectProgram'), matricsList: [] });

    } else if (versionId == 0) {
      this.setState({ message: i18n.t('static.program.validversion'), matricsList: [] });

    } else {
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), matricsList: [] });

    }
    /*   this.setState({
         matricsList: [{ACTUAL_DATE:"2019-04",errorperc:30},{ACTUAL_DATE:"2019-05",errorperc:50},{ACTUAL_DATE:"2019-06",errorperc:40},]
       })*/
    console.log('matrix list updated' + this.state.matricsList)
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
      this.fetchData();
    })

  }

  _handleClickRangeBox(e) {
    this.refs.pickRange.show()
  }

  handleClickMonthBox2 = (e) => {
    this.refs.pickAMonth2.show()
  }
  handleAMonthChange2 = (value, text) => {
    //
    //
  }
  handleAMonthDissmis2 = (value) => {
    this.setState({ singleValue2: value }, () => {
      this.fetchData();
    })

  }
  loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

  render() {
    const { planningUnits } = this.state;
    let planningUnitList = planningUnits.length > 0
      && planningUnits.map((item, i) => {
        return (
          <option key={i} value={item.planningUnit.id}>
            {getLabelText(item.planningUnit.label, this.state.lang)}
          </option>
        )
      }, this);
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

    const bar = {

      labels: this.state.matricsList.map((item, index) => (this.dateFormatter(item.month))),
      datasets: [
        {
          type: "line",
          label: i18n.t('static.report.forecasterrorovertime'),
          backgroundColor: 'transparent',
          borderColor: '#ffc107',
          lineTension: 0,
          showActualPercentages: true,
          showInLegend: true,
          pointStyle: 'line',
          yValueFormatString: "$#####%",

          data: this.state.matricsList.map((item, index) => (this.roundN(item.forecastError)))
        }
      ],




    }
    const pickerLang = {
      months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
      from: 'From', to: 'To',
    }
    const { rangeValue } = this.state
    const { singleValue2 } = this.state

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
        <SupplyPlanFormulas ref="formulaeChild" />
        <Row>
          <Col lg="12">
            <Card style={{ display: this.state.loading ? "none" : "block" }}>
              <div className="Card-header-reporticon pb-2">
                <div className="card-header-actions">
                  <a className="card-header-action">
                    <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleForecastMatrix() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                  </a>
                  {/* <i className="icon-menu"></i><strong>{i18n.t('static.report.forecasterrorovertime')}</strong> */}

                  {
                    this.state.matricsList.length > 0 &&


                    <a className="card-header-action">
                      <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                      <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                    </a>
                  }
                </div>
              </div>
              <CardBody className="pb-lg-2 pt-lg-0">
                <div className="TableCust" >
                  <div ref={ref}>
                    <Form >
                      <div className=" pl-0">
                        <div className="row">
                          <FormGroup className="col-md-3">
                            <Label htmlFor="appendedInputButton">Select Period</Label>
                            <div className="controls  edit">

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
                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.timeWindow')}</Label>
                            <div className="controls">
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="viewById"
                                  id="viewById"
                                  bsSize="sm"
                                  onChange={this.fetchData}
                                >
                                  <option value="5">6 {i18n.t('static.dashboard.months')}</option>
                                  <option value="2">3 {i18n.t('static.dashboard.months')}</option>
                                  <option value="8">9 {i18n.t('static.dashboard.months')}</option>
                                  <option value="11">12 {i18n.t('static.dashboard.months')}</option>
                                </Input>
                              </InputGroup>
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

                          {/* <FormGroup className="col-md-3">
                              <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.country')}</Label>
                              <div className="controls ">
                                <InputGroup>
                                  <Input
                                    type="select"
                                    name="countryId"
                                    id="countryId"
                                    bsSize="sm"
                                    onChange={this.fetchData}

                                  >
                                    <option value="0">{i18n.t('static.common.select')}</option>
                                    {countryList}
                                  </Input>

                                </InputGroup>
                              </div>
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
                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                    {productCategoryList}
                                                </Input>

                                            </InputGroup>
                                        </div>

                            </FormGroup>*/}
                          <FormGroup className="col-md-3">
                            <Label htmlFor="appendedInputButton">Version</Label>
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
                                  {planningUnitList}
                                </Input>
                                {/* <InputGroupAddon addonType="append">
                                    <Button color="secondary Gobtn btn-sm" onClick={this.fetchData}>{i18n.t('static.common.go')}</Button>
                                  </InputGroupAddon> */}
                              </InputGroup>
                            </div>
                          </FormGroup>
                        </div>
                      </div>
                    </Form>
                    <Col md="12 pl-0">
                      <div className="row">
                        {
                          this.state.matricsList.length > 0
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
                      </div>

                      <div className="row">
                        <div className="col-md-12">
                          {this.state.show && this.state.matricsList.length > 0 &&
                            <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

                              <thead>
                                <tr>
                                  <th className="text-center" style={{ width: '20%' }}> {i18n.t('static.report.month')} </th>
                                  <th className="text-center" style={{ width: '20%' }}> {i18n.t('static.report.forecastConsumption')} </th>
                                  <th className="text-center" style={{ width: '20%' }}>{i18n.t('static.report.actualConsumption')}</th>
                                  <th className="text-center" style={{ width: '20%' }}>{i18n.t('static.report.error')}</th>
                                </tr>
                              </thead>

                              <tbody>
                                {
                                  this.state.matricsList.length > 0
                                  &&
                                  this.state.matricsList.map((item, idx) =>

                                    <tr id="addr0" key={idx} >

                                      <td>{this.dateFormatter(this.state.matricsList[idx].month)}</td>
                                      <td>

                                        {this.formatter(this.state.matricsList[idx].forecastedConsumption)}
                                      </td>
                                      <td>
                                        {this.formatter(this.state.matricsList[idx].actualConsumption)}
                                      </td>
                                      <td>
                                        {this.PercentageFormatter(this.state.matricsList[idx].forecastError)}
                                      </td>
                                    </tr>)

                                }
                              </tbody>
                            </Table>}

                        </div>
                      </div></Col>



                  </div>
                </div></CardBody>
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
          </Col>
        </Row>


      </div>
    );
  }
}

export default ForcastMatrixOverTime;

