// import { getStyle } from '@coreui/coreui-pro/dist/js/coreui-utilities';
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import React, { Component, lazy } from 'react';
// import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
// import {
//     Card, CardBody,
//     // CardFooter,
//     CardHeader, Col, Form, FormGroup, InputGroup, Label, Table, Input
// } from 'reactstrap';
// import ProgramService from '../../api/ProgramService';
// import ReportService from '../../api/ReportService';
// import csvicon from '../../assets/img/csv.png';
// import pdfIcon from '../../assets/img/pdf.png';
// import getLabelText from '../../CommonComponent/getLabelText';
// import { LOGO } from '../../CommonComponent/Logo.js';
// import i18n from '../../i18n';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// import { Online } from 'react-detect-offline';
// import CryptoJS from 'crypto-js'
// import { SECRET_KEY, ON_HOLD_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS } from '../../Constants.js';
// import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
// import ProcurementAgentService from "../../api/ProcurementAgentService";
// import TracerCategoryService from '../../api/TracerCategoryService';
// import PlanningUnitService from '../../api/PlanningUnitService';
// import { BreadcrumbDivider } from "semantic-ui-react";

// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import ProductService from '../../api/ProductService';
// import { act } from 'react-test-renderer';


// // const { getToggledOptions } = utils;
// const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// // const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
// const ref = React.createRef();
// const brandPrimary = getStyle('--primary')
// const brandSuccess = getStyle('--success')
// const brandInfo = getStyle('--info')
// const brandWarning = getStyle('--warning')
// const brandDanger = getStyle('--danger')

// const data = [{ "program": "HIV/AIDS-Malawi-National", "pc": "HIV Rapid Test Kits (RTKs)", "tc": "HIV RTK", "fc": "(Campaign Bulk) LLIN 180x160x170 cm (LxWxH) PBO Rectangular (White)", "UOMCode": "Each", "genericName": "", "MultiplierForecastingUnitToPlanningUnit": "1", "PlanningUnit": "(Campaign Bulk) LLIN 180x160x170 cm (LxWxH) PBO Rectangular (White) 1 Each", "NoOfItems": "3,000", "UOMCodeP": "Each", "MultipliertoForecastingUnit": "1", "Min": "5", "ReorderFrequecy": "4", "ShelfLife": "18", "CatalogPrice": "456,870", "isActive": 'Active' }];


// class ProductCatalog extends Component {
//     constructor(props) {
//         super(props);

//         this.toggledata = this.toggledata.bind(this);
//         this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

//         this.state = {
//             dropdownOpen: false,
//             radioSelected: 2,
//             lang: localStorage.getItem('lang'),
//             procurementAgents: [],
//             programValues: [],
//             programLabels: [],
//             programs: [],
//             message: '',
//             planningUnits: [],
//             versions: [],

//             planningUnitValues: [],
//             planningUnitLabels: [],

//             procurementAgenttValues: [],
//             procurementAgentLabels: [],
//             outPutList: [],
//             productCategories: [],
//             tracerCategories: []
//         };
//         this.filterData = this.filterData.bind(this);
//         this.getPrograms = this.getPrograms.bind(this);
//         this.handleChangeProgram = this.handleChangeProgram.bind(this);
//         this.consolidatedProgramList = this.consolidatedProgramList.bind(this);
//         this.filterVersion = this.filterVersion.bind(this);
//         this.consolidatedVersionList = this.consolidatedVersionList.bind(this);
//         this.getPlanningUnit = this.getPlanningUnit.bind(this);
//         this.getProcurementAgent = this.getProcurementAgent.bind(this);
//         this.consolidatedProcurementAgentList = this.consolidatedProcurementAgentList.bind(this);
//         this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this);
//         this.handleProcurementAgentChange = this.handleProcurementAgentChange.bind(this);
//         this.fetchData = this.fetchData.bind(this);

//         this.getProductCategories = this.getProductCategories.bind(this);
//         this.getTracerCategoryList = this.getTracerCategoryList.bind(this);
//     }

//     exportCSV(columns) {
//         var csvRow = [];
//         csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'));
//         csvRow.push('')
//         csvRow.push('Product Category' + ' , ' + (document.getElementById("productCategoryId").selectedOptions[0].text).replaceAll(' ', '%20'));
//         csvRow.push('')
//         csvRow.push('Tracer Category' + ' , ' + (document.getElementById("tracerCategoryId").selectedOptions[0].text).replaceAll(' ', '%20'));
//         csvRow.push('')
//         csvRow.push('')
//         // this.state.programLabels.map(ele =>
//         // csvRow.push(i18n.t('static.program.program') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
//         // csvRow.push('')
//         // csvRow.push('')
//         // csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
//         // csvRow.push('')
//         // var re;
//         // var A = [[("Program Name").replaceAll(' ', '%20'), ("Freight Cost Sea (%)").replaceAll(' ', '%20'), ("Freight Cost Air (%)").replaceAll(' ', '%20'), ("Plan to Draft LT (Months)").replaceAll(' ', '%20'), ("Draft to Submitted LT (Months)").replaceAll(' ', '%20'), ("Submitted to Approved LT (Months)").replaceAll(' ', '%20'), ("Approved to Shipped LT (Months)").replaceAll(' ', '%20'), ("Shipped to Arrived by Sea LT (Months)").replaceAll(' ', '%20'), ("Shipped to Arrived by Air LT (Months)").replaceAll(' ', '%20'), ("Arrived to Delivered LT (Months)").replaceAll(' ', '%20'), ("Total LT By Sea (Months)").replaceAll(' ', '%20'), ("Total LT By Air (Months)").replaceAll(' ', '%20')]]
//         // re = this.state.procurementAgents
//         csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
//         csvRow.push('')
//         const headers = [];
//         columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });

//         var A = [headers];
//         this.state.outPutList.map(
//             ele => A.push([
//                 (getLabelText(ele.program.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
//                 (getLabelText(ele.productCategory.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
//                 (getLabelText(ele.tracerCategory.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
//                 (getLabelText(ele.forecastingUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
//                 (getLabelText(ele.fUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
//                 ele.genericName.labelId!=0?(getLabelText(ele.genericName, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'):'',
//                 ele.forecastingtoPlanningUnitMultiplier,
//                 (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
//                 (getLabelText(ele.pUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),
//                 ele.minMonthsOfStock,
//                 ele.reorderFrequencyInMonths,
//                 ele.shelfLife,
//                 ele.catalogPrice,
//                 ele.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')
//                 // (new moment(ele.inventoryDate).format('MMM YYYY')).replaceAll(' ', '%20'),
//                 // ele.stockAdjustemntQty,
//                 // ele.lastModifiedBy.username,
//                 // new moment(ele.lastModifiedDate).format('MMM-DD-YYYY'), ele.notes
//             ]));
//         for (var i = 0; i < A.length; i++) {
//             csvRow.push(A[i].join(","))
//         }
//         var csvString = csvRow.join("%0A")
//         var a = document.createElement("a")
//         a.href = 'data:attachment/csv,' + csvString
//         a.target = "_Blank"
//         a.download = "Product Catalog Report.csv"
//         document.body.appendChild(a)
//         a.click()
//     }


//     exportPDF = (columns) => {
//         const addFooters = doc => {
//             const pageCount = doc.internal.getNumberOfPages()

//             for (var i = 1; i <= pageCount; i++) {
//                 doc.setFont('helvetica', 'bold')
//                 doc.setFontSize(6)
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
//                 // doc.setFontSize(12)
//                 // doc.setPage(i)
//                 // doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
//                 // doc.setTextColor("#002f6c");
//                 // doc.text("Product Catalog Report", doc.internal.pageSize.width / 2, 60, {
//                 //     align: 'center'
//                 // })
//                 // if (i == 1) {
//                 //     doc.setFontSize(8)
//                 //     var planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
//                 //     doc.text(doc.internal.pageSize.width / 8, 90, planningText)

//                 // }
//                 doc.setFont('helvetica', 'bold')
//                 doc.setFontSize(12)
//                 doc.setFont('helvetica', 'bold')
//                 doc.setPage(i)
//                 doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
//                 doc.setTextColor("#002f6c");
//                 doc.text('Product Catalog', doc.internal.pageSize.width / 2, 60, {
//                     align: 'center'
//                 })
//                 if (i == 1) {
//                     doc.setFontSize(8)
//                     doc.setFont('helvetica', 'normal')
//                     // doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
//                     //     align: 'left'
//                     // })
//                     doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
//                         align: 'left'
//                     })

//                     doc.text('Product Category' + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
//                         align: 'left'
//                     })
//                     doc.text('Tracer Category' + ' : ' + document.getElementById("tracerCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
//                         align: 'left'
//                     })
//                     // var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
//                     // doc.text(doc.internal.pageSize.width / 8, 150, planningText)

//                 }



//             }
//         }
//         const unit = "pt";
//         const size = "A4"; // Use A1, A2, A3 or A4
//         const orientation = "landscape"; // portrait or landscape
//         const marginLeft = 10;
//         const doc = new jsPDF(orientation, unit, size, true);
//         doc.setFontSize(8);
//         const title = "Product Catalog Report";
//         // var canvas = document.getElementById("cool-canvas");
//         //creates image
//         // var canvasImg = canvas.toDataURL("image/png", 1.0);
//         var width = doc.internal.pageSize.width;
//         var height = doc.internal.pageSize.height;
//         var h1 = 50;
//         // var aspectwidth1 = (width - h1);
//         // doc.addImage(canvasImg, 'png', 50, 200, 750, 290, 'CANVAS');
//         // const headers = [["Program Name", "Freight Cost Sea (%)", "Freight Cost Air (%)", "Plan to Draft LT (Months)", "Draft to Submitted LT (Months)", "Submitted to Approved LT (Months)", "Approved to Shipped LT (Months)", "Shipped to Arrived by Sea LT (Months)", "Shipped to Arrived by Air LT (Months)", "Arrived to Delivered LT (Months)", "Total LT By Sea (Months)", "Total LT By Air (Months)"]]
//         // const data = this.state.procurementAgents.map(elt => [getLabelText(elt.label), elt.seaFreightPerc, elt.airFreightPerc, elt.plannedToDraftLeadTime, elt.draftToSubmittedLeadTime, elt.submittedToApprovedLeadTime, elt.approvedToShippedLeadTime, elt.shippedToArrivedBySeaLeadTime, elt.shippedToArrivedByAirLeadTime, elt.arrivedToDeliveredLeadTime, (elt.plannedToDraftLeadTime + elt.draftToSubmittedLeadTime + elt.submittedToApprovedLeadTime + elt.approvedToShippedLeadTime + elt.shippedToArrivedBySeaLeadTime + elt.arrivedToDeliveredLeadTime), (elt.plannedToDraftLeadTime + elt.draftToSubmittedLeadTime + elt.submittedToApprovedLeadTime + elt.approvedToShippedLeadTime + elt.shippedToArrivedByAirLeadTime + elt.arrivedToDeliveredLeadTime)]);

//         const headers = [];
//         columns.map((item, idx) => { headers[idx] = (item.text) });
//         let data = this.state.outPutList.map(ele => [
//             getLabelText(ele.program.label, this.state.lang),
//             getLabelText(ele.productCategory.label, this.state.lang),
//             getLabelText(ele.tracerCategory.label, this.state.lang),
//             getLabelText(ele.forecastingUnit.label, this.state.lang),
//             getLabelText(ele.fUnit.label, this.state.lang),
//             getLabelText(ele.genericName, this.state.lang),
//             ele.forecastingtoPlanningUnitMultiplier,
//             getLabelText(ele.planningUnit.label, this.state.lang),
//             getLabelText(ele.pUnit.label, this.state.lang),
//             ele.minMonthsOfStock,
//             ele.reorderFrequencyInMonths,
//             ele.shelfLife,
//             ele.catalogPrice,
//             ele.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')
//             // ele.totalSeaLeadTime,
//             // ele.totalAirLeadTime,
//             // ele.localProcurementLeadTime
//         ]);

//         let content = {
//             margin: { top: 90 ,bottom:70},
//             startY: 200,
//             head: [headers],
//             body: data,
//             styles: { lineWidth: 1, fontSize: 8, cellWidth: 55, halign: 'center' },
//             // columnStyles: {
//             //     0: { cellWidth: 170 },
//             //     1: { cellWidth: 171.89 },
//             //     6: { cellWidth: 100 }
//             // }
//         };
//         doc.autoTable(content);
//         addHeaders(doc)
//         addFooters(doc)
//         doc.save("Product Catalog Report.pdf")
//     }
//     handleChangeProgram(programIds) {

//         this.setState({
//             programValues: programIds.map(ele => ele.value),
//             programLabels: programIds.map(ele => ele.label)
//         }, () => {

//             // this.filterData(this.state.rangeValue)
//         })

//     }
//     handlePlanningUnitChange = (planningUnitIds) => {
//         this.setState({
//             planningUnitValues: planningUnitIds.map(ele => ele.value),
//             planningUnitLabels: planningUnitIds.map(ele => ele.label)
//         }, () => {
//             this.fetchData()
//         })
//     }

//     handleProcurementAgentChange = (procurementAgentIds) => {
//         this.setState({
//             procurementAgenttValues: procurementAgentIds.map(ele => ele.value),
//             procurementAgentLabels: procurementAgentIds.map(ele => ele.label)
//         }, () => {
//             this.fetchData()
//         })
//     }

//     filterData(rangeValue) {
//         setTimeout('', 10000);
//         let programIds = this.state.programValues;
//         if (programIds.length > 0) {
//             AuthenticationService.setupAxiosInterceptors();

//             ReportService.getProcurementAgentExportData(programIds)
//                 .then(response => {
//                     console.log(JSON.stringify(response.data));
//                     this.setState({
//                         procurementAgents: response.data,
//                         message: ''
//                     })
//                 }).catch(
//                     error => {
//                         this.setState({
//                             procurementAgents: []
//                         })

//                         if (error.message === "Network Error") {
//                             this.setState({ message: error.message });
//                         } else {
//                             switch (error.response ? error.response.status : "") {
//                                 case 500:
//                                 case 401:
//                                 case 404:
//                                 case 406:
//                                 case 412:
//                                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
//                                     break;
//                                 default:
//                                     this.setState({ message: 'static.unkownError' });
//                                     break;
//                             }
//                         }
//                     }
//                 );
//         } else if (programIds.length == 0) {
//             this.setState({ message: i18n.t('static.common.selectProgram'), procurementAgents: [] });

//         } else {
//             this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), procurementAgents: [] });

//         }
//     }

//     getTracerCategoryList() {
//         var programId = document.getElementById('programId').value;
//         if (programId > 0) {

//             if (navigator.onLine) {

//                 AuthenticationService.setupAxiosInterceptors();
//                 ProgramService.getProgramById(programId).then(response => {
//                     var programJson;
//                     var realmId = 0;
//                     if (response.status == 200) {
//                         programJson = response.data;
//                         realmId = programJson.realmCountry.realm.realmId;

//                         AuthenticationService.setupAxiosInterceptors();
//                         TracerCategoryService.getTracerCategoryByRealmId(realmId).then(response => {

//                             if (response.status == 200) {
//                                 this.setState({
//                                     tracerCategories: response.data
//                                 })
//                             }

//                         }).catch(error => {
//                             if (error.message === "Network Error") {
//                                 this.setState({ message: error.message });
//                             } else {
//                                 switch (error.response ? error.response.status : "") {
//                                     case 500:
//                                     case 401:
//                                     case 404:
//                                     case 406:
//                                     case 412:
//                                         this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
//                                         break;
//                                     default:
//                                         this.setState({ message: 'static.unkownError' });
//                                         break;
//                                 }
//                             }
//                         }
//                         );


//                     }
//                     // console.log("++++++++++++++++", realmId);
//                 }).catch(
//                     error => {
//                         this.setState({
//                             procurementAgents: []
//                         })

//                         if (error.message === "Network Error") {
//                             this.setState({ message: error.message });
//                         } else {
//                             switch (error.response ? error.response.status : "") {
//                                 case 500:
//                                 case 401:
//                                 case 404:
//                                 case 406:
//                                 case 412:
//                                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
//                                     break;
//                                 default:
//                                     this.setState({ message: 'static.unkownError' });
//                                     break;
//                             }
//                         }
//                     }
//                 );

//             } else {
//                 var programId = document.getElementById('programId').value;
//                 const lan = 'en';
//                 const { tracerCategories } = this.state
//                 var proList = tracerCategories;

//                 var db1;
//                 getDatabase();
//                 var openRequest = indexedDB.open('fasp', 1);
//                 openRequest.onsuccess = function (e) {
//                     db1 = e.target.result;

//                     var transaction = db1.transaction(['tracerCategory'], 'readwrite');
//                     var program = transaction.objectStore('tracerCategory');
//                     var getRequest = program.getAll();
//                     getRequest.onerror = function (event) {
//                         // Handle errors!
//                     };
//                     getRequest.onsuccess = function (event) {

//                         var ptransaction = db1.transaction(['program'], 'readwrite');
//                         var p = ptransaction.objectStore('program');
//                         var getRequestP = p.getAll();
//                         getRequestP.onerror = function (event) {
//                             // Handle errors!
//                         };
//                         getRequestP.onsuccess = function (event) {

//                             var filterProgram = getRequestP.result.filter(c => c.programId == programId);
//                             console.log("filterProgram====", filterProgram);
//                             var realmId = filterProgram[0].realmCountry.realm.realmId;
//                             console.log("====", realmId);

//                             var myResult = [];
//                             myResult = getRequest.result.filter(c => c.realm.id == realmId);
//                             this.setState({
//                                 tracerCategories: myResult
//                             })

//                         }.bind(this)
//                     }.bind(this)
//                 }.bind(this)
//                 // this.setState({
//                 //     tracerCategories: []
//                 // })
//             }
//         }
//     }

//     getProductCategories() {
//         if (navigator.onLine) {
//             AuthenticationService.setupAxiosInterceptors();
//             let realmId = AuthenticationService.getRealmId();
//             ProductService.getProductCategoryList(realmId)
//                 .then(response => {
//                     console.log(response.data)
//                     this.setState({
//                         productCategories: response.data
//                     })
//                 }).catch(
//                     error => {
//                         this.setState({
//                             productCategories: []
//                         })
//                         if (error.message === "Network Error") {
//                             this.setState({ message: error.message });
//                         } else {
//                             switch (error.response ? error.response.status : "") {
//                                 case 500:
//                                 case 401:
//                                 case 404:
//                                 case 406:
//                                 case 412:
//                                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
//                                     break;
//                                 default:
//                                     this.setState({ message: 'static.unkownError' });
//                                     break;
//                             }
//                         }
//                     }
//                 );
//         } else {
//             const lan = 'en';
//             const { productCategories } = this.state
//             var proList = productCategories;

//             var db1;
//             getDatabase();
//             var openRequest = indexedDB.open('fasp', 1);
//             openRequest.onsuccess = function (e) {
//                 db1 = e.target.result;
//                 var transaction = db1.transaction(['productCategory'], 'readwrite');
//                 var program = transaction.objectStore('productCategory');
//                 var getRequest = program.getAll();

//                 getRequest.onerror = function (event) {
//                     // Handle errors!
//                 };
//                 getRequest.onsuccess = function (event) {
//                     var myResult = [];
//                     myResult = getRequest.result;
//                     // for (var i = 0; i < myResult.length; i++) {
//                     //     var databytes = CryptoJS.AES.decrypt(myResult[i].productCategory, SECRET_KEY);
//                     //     var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
//                     //     proList.push(programData)
//                     // }
//                     this.setState({
//                         productCategories: myResult
//                     })
//                 }.bind(this)
//             }.bind(this)
//         }
//     }

//     getPrograms() {
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
//                         versions: [],
//                         planningUnits: [],
//                         // outPutList: []

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
//         // let versionId = document.getElementById("versionId").value;
//         this.setState({
//             planningUnits: []
//         }, () => {
//             // if (versionId.includes('Local')) {
//             if (!navigator.onLine) {
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
//         var openRequest = indexedDB.open('fasp', 1);
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

//     fetchData = () => {
//         // let versionId = document.getElementById("versionId").value;
//         let programId = document.getElementById("programId").value;
//         let productCategoryId = document.getElementById("productCategoryId").value;
//         let tracerCategoryId = document.getElementById("tracerCategoryId").value;
//         // let plannedShipments = document.getElementById("shipmentStatusId").value;
//         // let planningUnitIds = this.state.planningUnitValues;
//         // let procurementAgentIds = this.state.procurementAgenttValues;
//         // let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
//         // let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();

//         let json = {
//             "programId": parseInt(document.getElementById("programId").value),
//             "productCategoryId": parseInt(document.getElementById("productCategoryId").value),
//             "tracerCategoryId": parseInt(document.getElementById("tracerCategoryId").value),

//         }

//         if (programId > 0) {

//             if (navigator.onLine) {
//                 console.log("json---", json);
//                 AuthenticationService.setupAxiosInterceptors();
//                 ReportService.programProductCatalog(json)
//                     .then(response => {
//                         console.log("-----response", JSON.stringify(response.data));
//                         var outPutList = response.data;
//                         // var responseData = response.data;
//                         this.setState({
//                             outPutList: outPutList
//                         })
//                     }).catch(
//                         error => {
//                             this.setState({
//                                 outPutList: []
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
//             } else {
//                 var db1;
//                 var storeOS;
//                 getDatabase();
//                 var openRequest = indexedDB.open('fasp', 1);
//                 openRequest.onerror = function (event) {
//                     this.setState({
//                         message: i18n.t('static.program.errortext')
//                     })
//                 }.bind(this);
//                 openRequest.onsuccess = function (e) {
//                     db1 = e.target.result;
//                     var programDataTransaction = db1.transaction(['program'], 'readwrite');
//                     var programDataOs = programDataTransaction.objectStore('program');
//                     var programRequest = programDataOs.get(parseInt(document.getElementById("programId").value));
//                     programRequest.onerror = function (event) {
//                         this.setState({
//                             message: i18n.t('static.program.errortext')
//                         })
//                     }.bind(this);

//                     programRequest.onsuccess = function (e) {
//                         var result = programRequest.result;
//                         console.log("1------>", result);

//                         var fuTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
//                         var fuOs = fuTransaction.objectStore('forecastingUnit');
//                         var fuRequest = fuOs.getAll();
//                         fuRequest.onerror = function (event) {
//                             this.setState({
//                                 message: i18n.t('static.program.errortext')
//                             })
//                         }.bind(this);

//                         fuRequest.onsuccess = function (e) {
//                             var result1 = fuRequest.result;
//                             console.log("2------>", result1);

//                             var puTransaction = db1.transaction(['planningUnit'], 'readwrite');
//                             var puOs = puTransaction.objectStore('planningUnit');
//                             var puRequest = puOs.getAll();
//                             puRequest.onerror = function (event) {
//                                 this.setState({
//                                     message: i18n.t('static.program.errortext')
//                                 })
//                             }.bind(this);

//                             puRequest.onsuccess = function (e) {
//                                 var result2 = puRequest.result;
//                                 console.log("3------>", result2);

//                                 var ppuTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
//                                 var ppuOs = ppuTransaction.objectStore('programPlanningUnit');
//                                 var ppuRequest = ppuOs.getAll();
//                                 ppuRequest.onerror = function (event) {
//                                     this.setState({
//                                         message: i18n.t('static.program.errortext')
//                                     })
//                                 }.bind(this);

//                                 ppuRequest.onsuccess = function (e) {
//                                     var result3 = ppuRequest.result;
//                                     result3 = result3.filter(c => c.program.id == programId);
//                                     console.log("4------>", result3);

//                                     var outPutList = [];
//                                     for (var i = 0; i < result3.length; i++) {
//                                         var filteredList = result2.filter(c => c.planningUnitId == result3[i].planningUnit.id);
//                                         console.log("5---->", filteredList);
//                                         var program = result3[i].program;
//                                         var planningUnit = result3[i].planningUnit;
//                                         var minMonthOfStock = result3[i].minMonthsOfStock;
//                                         var reorderFrequencyInMonths = result3[i].reorderFrequencyInMonths;
//                                         var shelfLife = result3[i].shelfLife;
//                                         var catalogPrice = result3[i].catalogPrice;
//                                         var active = true;

//                                         for (var j = 0; j < filteredList.length; j++) {
//                                             var productCategory = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).productCategory;
//                                             var tracerCategory = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).tracerCategory;
//                                             var fUnit = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).unit;
//                                             var genericLabel = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).genericLabel;
//                                             // console.log("6---->", productCategory);
//                                             // if (result3[i].active && filteredList[i].active) {
//                                             //     active = true;
//                                             // } else {
//                                             //     active = false;
//                                             // }
//                                             var json = {
//                                                 program: program,
//                                                 productCategory: productCategory,
//                                                 tracerCategory: tracerCategory,
//                                                 forecastingUnit: filteredList[j].forecastingUnit,
//                                                 fUnit: fUnit,
//                                                 genericName: genericLabel,
//                                                 planningUnit: planningUnit,
//                                                 pUnit: filteredList[j].unit,
//                                                 forecastingtoPlanningUnitMultiplier: filteredList[j].multiplier,
//                                                 // noOfItems: 1,
//                                                 // multiplierOne: 1,
//                                                 minMonthsOfStock: minMonthOfStock,
//                                                 reorderFrequencyInMonths: reorderFrequencyInMonths,
//                                                 shelfLife: shelfLife,
//                                                 catalogPrice: catalogPrice,
//                                                 active: active
//                                             }
//                                             outPutList.push(json);
//                                         }
//                                     }

//                                     if (productCategoryId > 0) {
//                                         // console.log("hiiiii1",productCategoryId);
//                                         var filteredPc = outPutList.filter(c => c.productCategory.id == productCategoryId);
//                                         outPutList = filteredPc;
//                                     } else {
//                                         outPutList = outPutList;
//                                     }
//                                     if (tracerCategoryId > 0) {
//                                         // console.log("hiiiii2",tracerCategoryId);
//                                         var filteredTc = outPutList.filter(c => c.tracerCategory.id == tracerCategoryId);
//                                         outPutList = filteredTc;
//                                     } else {
//                                         outPutList = outPutList;
//                                     }
//                                     console.log("outPutList------>", outPutList);
//                                     this.setState({ outPutList: outPutList });

//                                 }.bind(this)
//                             }.bind(this)
//                         }.bind(this)
//                     }.bind(this)
//                 }.bind(this)
//             }

//         } else {
//             this.setState({ message: i18n.t('static.common.selectProgram'), outPutList: [] });
//         }
//         // else {
//         //     this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), outPutList: [] });

//         // }
//     }
//     componentDidMount() {
//         // AuthenticationService.setupAxiosInterceptors();
//         this.getPrograms();
//         // this.getProcurementAgent();
//         this.getProductCategories();
//     }

//     toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

//     onRadioBtnClick(radioSelected) {
//         this.setState({
//             radioSelected: radioSelected,
//         });
//     }
//     loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>
//     render() {
//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );

//         const { programs } = this.state;
//         const { versions } = this.state;
//         const { productCategories } = this.state;
//         const { tracerCategories } = this.state;

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

//         const { procurementAgents } = this.state
//         let procurementAgentList = procurementAgents.length > 0
//             && procurementAgents.map((item, i) => {
//                 return ({ label: getLabelText(item.label, this.state.lang), value: item.procurementAgentId })

//             }, this);



//         const columns = [
//             {
//                 dataField: 'program.label',
//                 text: i18n.t('static.program.program'),
//                 sort: true,
//                 align: 'left',
//                 headerAlign: 'left',
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 }
//             },
//             {
//                 dataField: 'productCategory.label',
//                 text: i18n.t('static.dashboard.productcategory'),
//                 sort: true,
//                 align: 'left',
//                 headerAlign: 'left',
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 }
//             },
//             {
//                 dataField: 'tracerCategory.label',
//                 text: i18n.t('static.dashboard.tracercategory'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 }
//             },
//             {
//                 dataField: 'forecastingUnit.label',
//                 text: i18n.t('static.forecastingunit.forecastingunit'),
//                 sort: true,
//                 align: 'left',
//                 headerAlign: 'left',
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 }
//             },
//             {
//                 dataField: 'fUnit.label',
//                 text: i18n.t('static.unit.unit'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 }
//             },
//             {
//                 dataField: 'genericName',
//                 text: i18n.t('static.report.genericName'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 }
//             },
//             {
//                 dataField: 'forecastingtoPlanningUnitMultiplier',
//                 text: i18n.t('static.report.forecastingtoPlanningUnitMultiplier'),
//                 sort: true,
//                 align: 'right',
//                 headerAlign: 'right'
//             },
//             {
//                 dataField: 'planningUnit.label',
//                 text: i18n.t('static.report.planningUnit'),
//                 sort: true,
//                 align: 'left',
//                 headerAlign: 'left',
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 }
//             },
//             // {
//             //     dataField: 'NoOfItems',
//             //     text: "No. Of Items",
//             //     sort: true,
//             //     align: 'right',
//             //     headerAlign: 'right'
//             // },

//             {
//                 dataField: 'pUnit.label',
//                 text: i18n.t('static.unit.unit'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 }
//             },
//             // {
//             //     dataField: 'MultipliertoForecastingUnit',
//             //     text: "Multiplier",
//             //     sort: true,
//             //     align: 'right',
//             //     headerAlign: 'right'
//             // },
//             {
//                 dataField: 'minMonthsOfStock',
//                 text: i18n.t('static.report.min'),
//                 sort: true,
//                 align: 'right',
//                 headerAlign: 'right'
//             },
//             {
//                 dataField: 'reorderFrequencyInMonths',
//                 text: i18n.t('static.report.reorderFrequencyInMonths'),
//                 sort: true,
//                 align: 'right',
//                 headerAlign: 'right'
//             },
//             {
//                 dataField: 'shelfLife',
//                 text: i18n.t('static.report.shelfLife'),
//                 sort: true,
//                 align: 'right',
//                 headerAlign: 'right'
//             },
//             {
//                 dataField: 'catalogPrice',
//                 text: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
//                 sort: true,
//                 align: 'right',
//                 headerAlign: 'right'
//             },
//             {
//                 dataField: 'active',
//                 text: i18n.t('static.common.status'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cellContent, row) => {
//                     return (
//                         (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
//                     );
//                 }
//             }

//         ];

//         const tabelOptions = {
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
//                 text: 'All', value: this.state.outPutList.length
//             }]
//         }

//         return (
//             <div className="animated fadeIn" >
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />
//                 <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
//                 <h5 className="red">{i18n.t(this.state.message)}</h5>

//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     <div className="Card-header-reporticon">
//                         {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntitypc', { entityname })}</strong>{' '} */}
//                         {this.state.outPutList.length > 0 && <div className="card-header-actions">
//                             <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
//                             <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title="Export CSV" onClick={() => this.exportCSV(columns)} />

//                         </div>}
//                     </div>
//                     <CardBody className="pb-lg-2">
//                         {/* <div ref={ref}> */}
//                         <br />
//                         <Form >
//                             <Col md="12 pl-0">
//                                 <div className="d-md-flex Selectdiv2">
//                                     <FormGroup className="">
//                                         <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
//                                         <div className="controls SelectGo">
//                                             <InputGroup>
//                                                 <Input
//                                                     type="select"
//                                                     name="programId"
//                                                     id="programId"
//                                                     bsSize="sm"
//                                                     // onChange={this.filterVersion}
//                                                     onChange={(e) => { this.fetchData(); this.getTracerCategoryList(); }}
//                                                 >
//                                                     <option value="0">{i18n.t('static.common.select')}</option>
//                                                     {programs.length > 0
//                                                         && programs.map((item, i) => {
//                                                             return (
//                                                                 <option key={i} value={item.programId}>
//                                                                     {getLabelText(item.label, this.state.lang)}
//                                                                 </option>
//                                                             )
//                                                         }, this)}
//                                                 </Input>
//                                             </InputGroup>
//                                         </div>
//                                     </FormGroup>
//                                     <FormGroup className="tab-ml-1">
//                                         <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.productcategory')}</Label>
//                                         <div className="controls SelectGo">
//                                             <InputGroup>
//                                                 <Input
//                                                     type="select"
//                                                     name="productCategoryId"
//                                                     id="productCategoryId"
//                                                     bsSize="sm"
//                                                     onChange={this.fetchData}
//                                                 // onChange={(e) => { this.getPlanningUnit(); }}
//                                                 >
//                                                     <option value="-1">{i18n.t('static.common.all')}</option>
//                                                     {productCategories.length > 0
//                                                         && productCategories.map((item, i) => {
//                                                             return (
//                                                                 <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
//                                                                     {Array(item.level).fill(' ').join('') + (getLabelText(item.payload.label, this.state.lang))}
//                                                                 </option>
//                                                             )
//                                                         }, this)}

//                                                 </Input>
//                                             </InputGroup>
//                                         </div>
//                                     </FormGroup>
//                                     <FormGroup className="tab-ml-1">
//                                         <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
//                                         <div className="controls SelectGo">
//                                             <InputGroup>
//                                                 <Input
//                                                     type="select"
//                                                     name="tracerCategoryId"
//                                                     id="tracerCategoryId"
//                                                     bsSize="sm"
//                                                     onChange={this.fetchData}
//                                                 // onChange={(e) => { this.getPlanningUnit(); }}
//                                                 >
//                                                     <option value="-1">{i18n.t('static.common.all')}</option>
//                                                     {tracerCategories.length > 0
//                                                         && tracerCategories.map((item, i) => {
//                                                             return (
//                                                                 <option key={i} value={item.tracerCategoryId}>
//                                                                     {getLabelText(item.label, this.state.lang)}
//                                                                 </option>
//                                                             )
//                                                         }, this)}

//                                                 </Input>
//                                             </InputGroup>
//                                         </div>
//                                     </FormGroup>
//                                 </div>
//                             </Col>
//                         </Form>
//                         {/* <br /><br /><br /> */}
//                         <ToolkitProvider
//                             keyField="id"
//                             data={this.state.outPutList}
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
//                                             pagination={paginationFactory(tabelOptions)}
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

//                         {/* </div> */}

//                     </CardBody>
//                 </Card>

//             </div>
//         );
//     }
// }
// export default ProductCatalog

//---------------------------JEXCEL CONVERSION FROM BOOTSTRAP-------------------------------//




import { getStyle } from '@coreui/coreui-pro/dist/js/coreui-utilities';
import jsPDF from "jspdf";
import "jspdf-autotable";
import React, { Component, lazy } from 'react';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import {
    Card, CardBody,
    // CardFooter,
    CardHeader, Col, Form, FormGroup, InputGroup, Label, Table, Input
} from 'reactstrap';
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import getLabelText from '../../CommonComponent/getLabelText';
import { LOGO } from '../../CommonComponent/Logo.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Online } from 'react-detect-offline';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, ON_HOLD_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS, INDEXED_DB_VERSION, INDEXED_DB_NAME, JEXCEL_DEFAULT_PAGINATION, JEXCEL_PAGINATION_OPTION } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ProcurementAgentService from "../../api/ProcurementAgentService";
import TracerCategoryService from '../../api/TracerCategoryService';
import PlanningUnitService from '../../api/PlanningUnitService';
import { BreadcrumbDivider } from "semantic-ui-react";

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ProductService from '../../api/ProductService';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import { act } from 'react-test-renderer';


// const { getToggledOptions } = utils;
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();
const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')

const data = [{ "program": "HIV/AIDS-Malawi-National", "pc": "HIV Rapid Test Kits (RTKs)", "tc": "HIV RTK", "fc": "(Campaign Bulk) LLIN 180x160x170 cm (LxWxH) PBO Rectangular (White)", "UOMCode": "Each", "genericName": "", "MultiplierForecastingUnitToPlanningUnit": "1", "PlanningUnit": "(Campaign Bulk) LLIN 180x160x170 cm (LxWxH) PBO Rectangular (White) 1 Each", "NoOfItems": "3,000", "UOMCodeP": "Each", "MultipliertoForecastingUnit": "1", "Min": "5", "ReorderFrequecy": "4", "ShelfLife": "18", "CatalogPrice": "456,870", "isActive": 'Active' }];


class ProductCatalog extends Component {
    constructor(props) {
        super(props);

        this.toggledata = this.toggledata.bind(this);
        this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

        this.state = {
            dropdownOpen: false,
            radioSelected: 2,
            lang: localStorage.getItem('lang'),
            procurementAgents: [],
            programValues: [],
            programLabels: [],
            programs: [],
            message: '',
            planningUnits: [],
            versions: [],

            planningUnitValues: [],
            planningUnitLabels: [],

            procurementAgenttValues: [],
            procurementAgentLabels: [],
            outPutList: [],
            productCategories: [],
            tracerCategories: [],
            loading: true
        };

        this.getPrograms = this.getPrograms.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.getProductCategories = this.getProductCategories.bind(this);
        this.getTracerCategoryList = this.getTracerCategoryList.bind(this);
    }
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

    exportCSV(columns) {
        var csvRow = [];
        csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'));
        csvRow.push('')
        csvRow.push((i18n.t('static.dashboard.productcategory')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("productCategoryId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        csvRow.push('')
        csvRow.push((i18n.t('static.tracercategory.tracercategory')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("tracerCategoryId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')
        const headers = [];
        columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });

        var A = [this.addDoubleQuoteToRowContent(headers)];
        this.state.outPutList.map(
            ele => A.push(this.addDoubleQuoteToRowContent([
               getLabelText(ele.program.label, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.productCategory.label, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.tracerCategory.label, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.forecastingUnit.label, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.fUnit.label, this.state.lang).replaceAll(' ', '%20'),
                ele.genericName.labelId != 0 ? getLabelText(ele.genericName, this.state.lang).replaceAll(' ', '%20') : '',
                ele.forecastingtoPlanningUnitMultiplier,
                getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.pUnit.label, this.state.lang).replaceAll(' ', '%20'),
                ele.minMonthsOfStock,
                ele.reorderFrequencyInMonths,
                ele.shelfLife,
                ele.catalogPrice,
                ele.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')
            ])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.productcatalog') + '.csv';
        document.body.appendChild(a)
        a.click()
    }


    exportPDF = (columns) => {
        const addFooters = doc => {
            const pageCount = doc.internal.getNumberOfPages()

            for (var i = 1; i <= pageCount; i++) {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(6)
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
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.productcatalog'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })

                    doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.tracercategory.tracercategory') + ' : ' + document.getElementById("tracerCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
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
        const title = i18n.t('static.dashboard.productcatalog');
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;

        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text) });
        let data = this.state.outPutList.map(ele => [
            getLabelText(ele.program.label, this.state.lang),
            getLabelText(ele.productCategory.label, this.state.lang),
            getLabelText(ele.tracerCategory.label, this.state.lang),
            getLabelText(ele.forecastingUnit.label, this.state.lang),
            getLabelText(ele.fUnit.label, this.state.lang),
            getLabelText(ele.genericName, this.state.lang),
            ele.forecastingtoPlanningUnitMultiplier,
            getLabelText(ele.planningUnit.label, this.state.lang),
            getLabelText(ele.pUnit.label, this.state.lang),
            ele.minMonthsOfStock,
            ele.reorderFrequencyInMonths,
            ele.shelfLife,
            ele.catalogPrice,
            ele.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')
        ]);

        let content = {
            margin: { top: 90, bottom: 70 },
            startY: 200,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 55, halign: 'center' },
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.productcatalog') + '.pdf')
    }


    getTracerCategoryList() {
        var programId = document.getElementById('programId').value;
        if (programId > 0) {


            AuthenticationService.setupAxiosInterceptors();
            let realmId = AuthenticationService.getRealmId();
            TracerCategoryService.getTracerCategoryByProgramId(realmId, programId).then(response => {

                if (response.status == 200) {
                    this.setState({
                        tracerCategories: response.data
                    })
                }

            }).catch(error => {
                if (error.message === "Network Error") {
                    this.setState({ message: error.message });
                } else {
                    switch (error.response ? error.response.status : "") {
                        case 500:
                        case 401:
                        case 404:
                        case 406:
                        case 412:
                            this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
                            break;
                        default:
                            this.setState({ message: 'static.unkownError' });
                            break;
                    }
                }
            }
            );

        } else {
            this.setState({
                message: i18n.t('static.common.selectProgram'),
                productCategories: [],
                tracerCategories: []
            })
        }
    }



    getPrograms() {

        AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        // ProgramService.getProgramByRealmId(realmId)
        ProgramService.getProgramList()
            .then(response => {
                console.log(JSON.stringify(response.data))
                this.setState({
                    programs: response.data, loading: false
                }, () => { })
            }).catch(
                error => {
                    this.setState({
                        programs: [], loading: false
                    }, () => {})
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



    getProductCategories() {

     
        let programId = document.getElementById("programId").value
        console.log(programId)
        if (programId > 0) {

            AuthenticationService.setupAxiosInterceptors();
            let realmId = AuthenticationService.getRealmId();

            ProductService.getProductCategoryListByProgram(realmId, programId)
                .then(response => {
                    console.log(response.data);
                    // var list = response.data.slice(1);
                    var list = response.data;
                    console.log("my list=======", list);

                    this.setState({
                        productCategories: list
                    })
                }).catch(
                    error => {
                        this.setState({
                            productCategories: []
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
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else {
            this.setState({
                message: i18n.t('static.common.selectProgram'),
                productCategories: [],
                tracerCategories: []
            })
        }
    }


    buildJexcel() {

        let outPutList = this.state.outPutList;
        // console.log("outPutList---->", outPutList);
        let outPutArray = [];
        let count = 0;

        for (var j = 0; j < outPutList.length; j++) {
            data = [];
            data[0] = getLabelText(outPutList[j].program.label, this.state.lang)
            data[1] = getLabelText(outPutList[j].productCategory.label, this.state.lang)
            data[2] = getLabelText(outPutList[j].tracerCategory.label, this.state.lang)
            data[3] = getLabelText(outPutList[j].forecastingUnit.label, this.state.lang)
            data[4] = getLabelText(outPutList[j].fUnit.label, this.state.lang)
            data[5] = getLabelText(outPutList[j].genericName, this.state.lang)
            data[6] = outPutList[j].forecastingtoPlanningUnitMultiplier
            data[7] = getLabelText(outPutList[j].planningUnit.label, this.state.lang)
            data[8] = getLabelText(outPutList[j].pUnit.label, this.state.lang)
            data[9] = outPutList[j].minMonthsOfStock
            data[10] = outPutList[j].reorderFrequencyInMonths
            data[11] = outPutList[j].shelfLife
            data[12] = outPutList[j].catalogPrice
            data[13] = outPutList[j].active;
            outPutArray[count] = data;
            count++;
        }
        // if (outPutList.length == 0) {
        //     data = [];
        //     outPutArray[0] = data;
        // }
        // console.log("outPutArray---->", outPutArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = outPutArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [80, 80, 80, 90, 0, 80, 80, 80, 0, 0, 80, 80, 80, 70],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.program.program'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.dashboard.productcategory'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tracercategory.tracercategory'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.forecastingunit.forecastingunit'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.forcastingUOM'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.genericName'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.forecastingtoPlanningUnitMultiplier'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.planningUnit'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.planningUOM'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.min'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.reorderFrequencyInMonths'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.report.shelfLife'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                    type: 'text',
                    readOnly: true
                },
                {
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    readOnly: true,
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.common.disabled') }
                    ]
                },
            ],
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: JEXCEL_DEFAULT_PAGINATION,
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
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            contextMenu: false
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
        let productCategoryId = document.getElementById("productCategoryId").value;
        let tracerCategoryId = document.getElementById("tracerCategoryId").value;

        let json = {
            "programId": parseInt(document.getElementById("programId").value),
            "productCategoryId": parseInt(document.getElementById("productCategoryId").value) == 0 ? -1 : parseInt(document.getElementById("productCategoryId").value),
            "tracerCategoryId": parseInt(document.getElementById("tracerCategoryId").value),

        }

        if (programId > 0) {

            if (navigator.onLine) {

                this.setState({ loading: true })
                console.log("json---", json);
                // AuthenticationService.setupAxiosInterceptors();
                ReportService.programProductCatalog(json)
                    .then(response => {
                        console.log("-----response", JSON.stringify(response.data));
                        var outPutList = response.data;
                        // var responseData = response.data;
                        this.setState({
                            outPutList: outPutList,
                            message: '',
                            // loading: false
                        },
                            () => { this.buildJexcel() })
                    }).catch(
                        error => {
                            this.setState({
                                outPutList: [],
                                loading: false
                            },
                                () => {
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
                this.setState({ loading: true })
                var db1;
                var storeOS;
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
                    var programDataTransaction = db1.transaction(['program'], 'readwrite');
                    var programDataOs = programDataTransaction.objectStore('program');
                    var programRequest = programDataOs.get(parseInt(document.getElementById("programId").value));
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext')
                        })
                    }.bind(this);

                    programRequest.onerror = function (event) {
                        this.setState({
                            loading: false
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        var result = programRequest.result;
                        console.log("1------>", result);

                        var fuTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
                        var fuOs = fuTransaction.objectStore('forecastingUnit');
                        var fuRequest = fuOs.getAll();
                        fuRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext')
                            })
                        }.bind(this);

                        fuRequest.onerror = function (event) {
                            this.setState({
                                loading: false
                            })
                        }.bind(this);
                        fuRequest.onsuccess = function (e) {
                            var result1 = fuRequest.result;
                            console.log("2------>", result1);

                            var puTransaction = db1.transaction(['planningUnit'], 'readwrite');
                            var puOs = puTransaction.objectStore('planningUnit');
                            var puRequest = puOs.getAll();
                            puRequest.onerror = function (event) {
                                this.setState({
                                    message: i18n.t('static.program.errortext')
                                })
                            }.bind(this);

                            puRequest.onerror = function (event) {
                                this.setState({
                                    loading: false
                                })
                            }.bind(this);
                            puRequest.onsuccess = function (e) {
                                var result2 = puRequest.result;
                                console.log("3------>", result2);

                                var ppuTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                                var ppuOs = ppuTransaction.objectStore('programPlanningUnit');
                                var ppuRequest = ppuOs.getAll();
                                ppuRequest.onerror = function (event) {
                                    this.setState({
                                        message: i18n.t('static.program.errortext')
                                    })
                                }.bind(this);

                                ppuRequest.onerror = function (event) {
                                    this.setState({
                                        loading: false
                                    })
                                }.bind(this);
                                ppuRequest.onsuccess = function (e) {
                                    // this.setState({ loading: true })
                                    var result3 = ppuRequest.result;
                                    result3 = result3.filter(c => c.program.id == programId);
                                    console.log("4------>", result3);

                                    var outPutList = [];
                                    for (var i = 0; i < result3.length; i++) {
                                        var filteredList = result2.filter(c => c.planningUnitId == result3[i].planningUnit.id);
                                        console.log("5---->", filteredList);
                                        var program = result3[i].program;
                                        var planningUnit = result3[i].planningUnit;
                                        var minMonthOfStock = result3[i].minMonthsOfStock;
                                        var reorderFrequencyInMonths = result3[i].reorderFrequencyInMonths;
                                        var shelfLife = result3[i].shelfLife;
                                        var catalogPrice = result3[i].catalogPrice;
                                        var active = true;

                                        for (var j = 0; j < filteredList.length; j++) {
                                            var productCategory = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).productCategory;
                                            var tracerCategory = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).tracerCategory;
                                            var fUnit = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).unit;
                                            var genericLabel = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).genericLabel;
                                            var json = {
                                                program: program,
                                                productCategory: productCategory,
                                                tracerCategory: tracerCategory,
                                                forecastingUnit: filteredList[j].forecastingUnit,
                                                fUnit: fUnit,
                                                genericName: genericLabel,
                                                planningUnit: planningUnit,
                                                pUnit: filteredList[j].unit,
                                                forecastingtoPlanningUnitMultiplier: filteredList[j].multiplier,
                                                // noOfItems: 1,
                                                // multiplierOne: 1,
                                                minMonthsOfStock: minMonthOfStock,
                                                reorderFrequencyInMonths: reorderFrequencyInMonths,
                                                shelfLife: shelfLife,
                                                catalogPrice: catalogPrice,
                                                active: active
                                            }
                                            outPutList.push(json);
                                        }
                                    }

                                    if (productCategoryId > 0) {
                                        // console.log("hiiiii1",productCategoryId);
                                        var filteredPc = outPutList.filter(c => c.productCategory.id == productCategoryId);
                                        outPutList = filteredPc;
                                    } else {
                                        outPutList = outPutList;
                                    }
                                    if (tracerCategoryId > 0) {
                                        // console.log("hiiiii2",tracerCategoryId);
                                        var filteredTc = outPutList.filter(c => c.tracerCategory.id == tracerCategoryId);
                                        outPutList = filteredTc;
                                    } else {
                                        outPutList = outPutList;
                                    }
                                    console.log("outPutList------>", outPutList);
                                    this.setState({ outPutList: outPutList, message: '' },
                                        () => { this.buildJexcel() });

                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }

        } else {
            this.setState({ message: i18n.t('static.common.selectProgram'), outPutList: [] },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                });
        }
        // else {
        //     this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), outPutList: [] });

        // }
    }
    componentDidMount() {
        this.getPrograms();
        // setTimeout(function () { //Start the timer
        //     // this.setState({render: true}) //After 1 second, set render to true
        //     this.setState({ loading: false })
        // }.bind(this), 500)
        // this.getProcurementAgent();
        // this.getProductCategories();

    }

    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    onRadioBtnClick(radioSelected) {
        this.setState({
            radioSelected: radioSelected,
        });
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
        const { productCategories } = this.state;
        const { tracerCategories } = this.state;


        const columns = [
            {
                dataField: 'program.label',
                text: i18n.t('static.program.program'),
                sort: true,
                align: 'left',
                headerAlign: 'left',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'productCategory.label',
                text: i18n.t('static.dashboard.productcategory'),
                sort: true,
                align: 'left',
                headerAlign: 'left',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'tracerCategory.label',
                text: i18n.t('static.tracercategory.tracercategory'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'forecastingUnit.label',
                text: i18n.t('static.forecastingunit.forecastingunit'),
                sort: true,
                align: 'left',
                headerAlign: 'left',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'fUnit.label',
                text: i18n.t('static.report.forcastingUOM'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'genericName',
                text: i18n.t('static.report.genericName'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'forecastingtoPlanningUnitMultiplier',
                text: i18n.t('static.report.forecastingtoPlanningUnitMultiplier'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
            },
            {
                dataField: 'planningUnit.label',
                text: i18n.t('static.report.planningUnit'),
                sort: true,
                align: 'left',
                headerAlign: 'left',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },


            {
                dataField: 'pUnit.label',
                text: i18n.t('static.report.planningUOM'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },

            {
                dataField: 'minMonthsOfStock',
                text: i18n.t('static.report.min'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
            },
            {
                dataField: 'reorderFrequencyInMonths',
                text: i18n.t('static.report.reorderFrequencyInMonths'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
            },
            {
                dataField: 'shelfLife',
                text: i18n.t('static.report.shelfLife'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
            },
            {
                dataField: 'catalogPrice',
                text: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
            },
            {
                dataField: 'active',
                text: i18n.t('static.common.status'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cellContent, row) => {
                    return (
                        (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
                    );
                }
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
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>

                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-reporticon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntitypc', { entityname })}</strong>{' '} */}
                        {this.state.outPutList.length > 0 && <div className="card-header-actions">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title="Export CSV" onClick={() => this.exportCSV(columns)} />

                        </div>}
                    </div>
                    <CardBody className="pb-lg-5 pt-lg-0">
                        {/* <div ref={ref}> */}
                        <br />

                        <Col md="12 pl-0">

                            <div className="d-md-flex  Selectdiv2 ">
                                <FormGroup className="mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls SelectField">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                // onChange={this.filterVersion}
                                                onChange={(e) => { this.fetchData(); this.getProductCategories(); this.getTracerCategoryList(); }}
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
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.productcategory')}</Label>
                                    <div className="controls SelectField">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="productCategoryId"
                                                id="productCategoryId"
                                                bsSize="sm"
                                                onChange={this.fetchData}
                                            // onChange={(e) => { this.getPlanningUnit(); }}
                                            >
                                                {/* <option value="-1">{i18n.t('static.common.all')}</option> */}
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
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                    <div className="controls SelectField">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="tracerCategoryId"
                                                id="tracerCategoryId"
                                                bsSize="sm"
                                                onChange={this.fetchData}
                                            // onChange={(e) => { this.getPlanningUnit(); }}
                                            >
                                                <option value="-1">{i18n.t('static.common.all')}</option>
                                                {tracerCategories.length > 0
                                                    && tracerCategories.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.tracerCategoryId}>
                                                                {getLabelText(item.label, this.state.lang)}
                                                            </option>
                                                        )
                                                    }, this)}

                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>

                        </Col>


                        <div id="tableDiv" className="jexcelremoveReadonlybackground">
                        </div>


                    </CardBody>
                </Card>
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
        );
    }
}
export default ProductCatalog
