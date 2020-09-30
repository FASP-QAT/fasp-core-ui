// import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
// import { getStyle } from '@coreui/coreui-pro/dist/js/coreui-utilities';
// import CryptoJS from 'crypto-js';
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import React, { Component, lazy } from 'react';
// import Picker from 'react-month-picker';
// import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
// import {
//     Card, CardBody,
//     // CardFooter,
//     CardHeader, Col, Form, FormGroup, InputGroup, Label, Table
// } from 'reactstrap';
// import ProgramService from '../../api/ProgramService';
// import ReportService from '../../api/ReportService';
// import csvicon from '../../assets/img/csv.png';
// import pdfIcon from '../../assets/img/pdf.png';
// import getLabelText from '../../CommonComponent/getLabelText';
// import { LOGO } from '../../CommonComponent/Logo.js';
// import i18n from '../../i18n';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
// // const { getToggledOptions } = utils;
// const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// // const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
// const ref = React.createRef();

// const brandPrimary = getStyle('--primary')
// const brandSuccess = getStyle('--success')
// const brandInfo = getStyle('--info')
// const brandWarning = getStyle('--warning')
// const brandDanger = getStyle('--danger')

// class FunderExport extends Component {

//     constructor(props) {
//         super(props);

//         this.toggledata = this.toggledata.bind(this);
//         this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

//         this.state = {
//             dropdownOpen: false,
//             radioSelected: 2,
//             lang: localStorage.getItem('lang'),
//             funders: [],
//             programValues: [],
//             programLabels: [],
//             programs: [],
//             message: ''
//         };
//         this.filterData = this.filterData.bind(this);
//         this.getPrograms = this.getPrograms.bind(this)
//         this.handleChangeProgram = this.handleChangeProgram.bind(this)
//     }

//     exportCSV() {

//         var csvRow = [];

//         this.state.programLabels.map(ele =>
//             csvRow.push(i18n.t('static.program.program') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
//         csvRow.push('')
//         csvRow.push('')
//         csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
//         csvRow.push('')
//         var re;

//         var A = [[("Program Name").replaceAll(' ', '%20'), ("Budget Name").replaceAll(' ', '%20'), ("Funding Source Name").replaceAll(' ', '%20'), ("Budget Usable").replaceAll(' ', '%20')]]

//         re = this.state.funders

//         for (var item = 0; item < re.length; item++) {
//             A.push([[getLabelText(re[item].program.label).replaceAll(' ', '%20'), getLabelText(re[item].label).replaceAll(' ', '%20'), getLabelText(re[item].fundingSource.label).replaceAll(' ', '%20'), (re[item].budgetUsable ? "Yes" : "No")]])
//         }
//         for (var i = 0; i < A.length; i++) {
//             csvRow.push(A[i].join(","))
//         }
//         var csvString = csvRow.join("%0A")
//         var a = document.createElement("a")
//         a.href = 'data:attachment/csv,' + csvString
//         a.target = "_Blank"
//         a.download = "Funder Report.csv"
//         document.body.appendChild(a)
//         a.click()
//     }
//     exportPDF = () => {
//         const addFooters = doc => {

//             const pageCount = doc.internal.getNumberOfPages()

//             doc.setFont('helvetica', 'bold')
//             doc.setFontSize(8)
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
//             doc.setFont('helvetica', 'bold')
//             for (var i = 1; i <= pageCount; i++) {
//                 doc.setFontSize(12)
//                 doc.setPage(i)
//                 doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
//                 doc.setTextColor("#002f6c");
//                 doc.text("Funder Report", doc.internal.pageSize.width / 2, 60, {
//                     align: 'center'
//                 })
//                 if (i == 1) {
//                     doc.setFontSize(8)
//                     var planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.toString(), doc.internal.pageSize.width * 3 / 4);
//                     doc.text(doc.internal.pageSize.width / 8, 90, planningText)

//                 }

//             }
//         }
//         const unit = "pt";
//         const size = "A4"; // Use A1, A2, A3 or A4
//         const orientation = "landscape"; // portrait or landscape

//         const marginLeft = 10;
//         const doc = new jsPDF(orientation, unit, size, true);

//         doc.setFontSize(8);

//         const title = "Funder Report";
//         // var canvas = document.getElementById("cool-canvas");
//         //creates image

//         // var canvasImg = canvas.toDataURL("image/png", 1.0);
//         var width = doc.internal.pageSize.width;
//         var height = doc.internal.pageSize.height;
//         var h1 = 50;
//         // var aspectwidth1 = (width - h1);

//         // doc.addImage(canvasImg, 'png', 50, 200, 750, 290, 'CANVAS');

//         const headers = [["Program Name", "Budget Name", "Funding Source Name", "Budget Usable"]]
//         const data = this.state.funders.map(elt => [getLabelText(elt.program.label), getLabelText(elt.label), getLabelText(elt.fundingSource.label), (elt.budgetUsable ? "Yes" : "No")]);

//         let content = {
//             margin: { top: 80 },
//             startY: 150,
//             head: headers,
//             body: data,
//             styles: { lineWidth: 1, fontSize: 8 }
//         };
//         doc.autoTable(content);
//         addHeaders(doc)
//         addFooters(doc)
//         doc.save("Funder Report.pdf")
//     }
//     handleChangeProgram(programIds) {

//         this.setState({
//             programValues: programIds.map(ele => ele.value),
//             programLabels: programIds.map(ele => ele.label)
//         }, () => {

//             this.filterData();
//         })

//     }
//     filterData() {
//         setTimeout('', 10000);
//         let programIds = this.state.programValues;
//         if (programIds.length > 0) {

//             var inputjson = {
//                 "programIds": programIds
//             }
//             console.log('***' + inputjson)
//             AuthenticationService.setupAxiosInterceptors();

//             ReportService.getFunderExportData(programIds)
//                 .then(response => {
//                     console.log("response---", response.data);
//                     this.setState({
//                         funders: response.data,
//                         message: ''
//                     });
//                     console.log("funders data---", this.state.funders);
//                 }).catch(
//                     error => {
//                         this.setState({
//                             funders: []
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
//             this.setState({ message: i18n.t('static.common.selectProgram'), funders: [] });

//         } else {
//             this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), funders: [] });

//         }
//     }


//     getPrograms() {
//         AuthenticationService.setupAxiosInterceptors();
//         let realmId = AuthenticationService.getRealmId();
//         ProgramService.getProgramByRealmId(realmId)
//             .then(response => {
//                 console.log(JSON.stringify(response.data))
//                 this.setState({
//                     programs: response.data
//                 })
//             }).catch(
//                 error => {
//                     this.setState({
//                         programs: []
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
//     }


//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         this.getPrograms()
//     }

//     toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

//     onRadioBtnClick(radioSelected) {
//         this.setState({
//             radioSelected: radioSelected,
//         });
//     }
//     loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>
//     render() {
//         console.log("funder----", this.state.funders);
//         const { programs } = this.state;
//         let programList = [];
//         programList = programs.length > 0
//             && programs.map((item, i) => {
//                 return (

//                     { label: getLabelText(item.label, this.state.lang), value: item.programId }

//                 )
//             }, this);
//         let consumptiondata = [];

//         return (
//             <div className="animated fadeIn" >

//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />
//                 <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
//                 <h5>{i18n.t(this.state.message)}</h5>

//                 <Card>
//                     <CardHeader>
//                         <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.funderExport')}</strong>
//                         {this.state.funders.length > 0 && <div className="card-header-actions">
//                             <a className="card-header-action">
//                                 <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
//                                 <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
//                             </a>
//                         </div>}
//                     </CardHeader>
//                     <CardBody>
//                         <div ref={ref}>
//                             <Form >
//                                 <Col md="2 pl-0">
//                                     <div className="row">
//                                         <FormGroup className="col-md-1">
//                                             <Label htmlFor="programIds">{i18n.t('static.program.program')}<span className="red Reqasterisk">*</span></Label>
//                                             <InputGroup>
//                                                 <ReactMultiSelectCheckboxes
//                                                     bsSize="sm"
//                                                     name="programIds"
//                                                     id="programIds"
//                                                     onChange={(e) => { this.handleChangeProgram(e) }}
//                                                     options={programList && programList.length > 0 ? programList : []}
//                                                 />
//                                                 {!!this.props.error &&
//                                                     this.props.touched && (
//                                                         <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
//                                                     )}
//                                             </InputGroup>
//                                         </FormGroup>
//                                     </div>
//                                 </Col>
//                             </Form>
//                             <Col md="12 pl-0">

//                                 <div className="row">
//                                     <div className="col-md-12">
//                                      {this.state.funders.length > 0 && 
//                                         <Table responsive className="table-striped  table-hover table-bordered text-center mt-2">

//                                             <thead>
//                                                 <tr>
//                                                     <th className="text-center "> Program Name </th>
//                                                     <th className="text-center "> Budget Name </th>
//                                                     <th className="text-center"> Funding Source Name </th>
//                                                     <th className="text-center"> Budget Usable </th>
//                                                 </tr>
//                                             </thead>

//                                             <tbody>

//                                                 {

//                                                     this.state.funders.map((item, idx) =>
//                                                         <tr id="addr0" key={idx} >
//                                                             <td>{getLabelText(this.state.funders[idx].program.label, this.state.lang)}</td>
//                                                             <td>{getLabelText(this.state.funders[idx].label, this.state.lang)}</td>
//                                                             <td>{getLabelText(this.state.funders[idx].fundingSource.label, this.state.lang)}</td>
//                                                             <td>{this.state.funders[idx].budgetUsable.toString() ? "Yes" : "No"}</td>
//                                                         </tr>)

//                                                 }
//                                             </tbody>
//                                         </Table>
//                                       }

//                                     </div>
//                                 </div>
//                             </Col>

//                         </div>

//                     </CardBody>
//                 </Card>

//             </div>
//         );
//     }
// }
// export default FunderExport


// mockups screen

// import React, { Component } from 'react';
// import { Card, CardHeader, Form, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import i18n from '../../i18n'
// import RegionService from "../../api/RegionService";
// import AuthenticationService from '../Common/AuthenticationService.js';
// import getLabelText from '../../CommonComponent/getLabelText';
// import RealmCountryService from "../../api/RealmCountryService.js";
// import Picker from 'react-month-picker'
// import MonthBox from '../../CommonComponent/MonthBox.js'

// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// import pdfIcon from '../../assets/img/pdf.png';
// import csvicon from '../../assets/img/csv.png';
// const pickerLang = {
//     months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
//     from: 'From', to: 'To',
// }



// const entityname = i18n.t('static.region.region');

// class FunderExport extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             regionList: [],
//             message: '',
//             selRegion: [],
//             realmCountryList: [],
//             lang: localStorage.getItem('lang'),
//             loading: true,
//             rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
//         }
//         this.editRegion = this.editRegion.bind(this);
//         this.addRegion = this.addRegion.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
//         this.handleRangeChange = this.handleRangeChange.bind(this);
//         this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
//     }

//     makeText = m => {
//         if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
//         return '?'
//     }

//     handleRangeChange(value, text, listIndex) {
//         //
//     }
//     handleRangeDissmis(value) {
//         this.setState({ rangeValue: value })
//         this.filterData(value);
//     }

//     _handleClickRangeBox(e) {
//         this.refs.pickRange.show()
//     }

//     filterData() {
//         let countryId = document.getElementById("realmCountryId").value;
//         if (countryId != 0) {
//             const selRegion = this.state.regionList.filter(c => c.realmCountry.realmCountryId == countryId)
//             this.setState({
//                 selRegion: selRegion
//             });
//         } else {
//             this.setState({
//                 selRegion: this.state.regionList
//             });
//         }
//     }
//     editRegion(region) {
//         this.props.history.push({
//             pathname: `/region/editRegion/${region.regionId}`,
//             // state: { region }
//         });
//     }
//     addRegion(region) {
//         this.props.history.push({
//             pathname: "/region/addRegion"
//         });
//     }

//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         RegionService.getRegionList()
//             .then(response => {
//                 console.log("RESP---", response.data);

//                 if (response.status == 200) {
//                     this.setState({
//                         regionList: response.data,
//                         selRegion: [
//                             {
//                                 "active": true,
//                                 "regionId": 1,
//                                 "programName": "HIV/AIDS - Kenya - Ministry Of Health",
//                                 "fundingSource": "Global Fund",
//                                 "planningUnit": "Ceftriaxone 1 gm Vial,50 Vials",
//                                 "qty": "50,000",
//                                 "productCost": "7.00",
//                                 "totalProductCost": "350,000",
//                                 "freightPer": "10",
//                                 "freightCost": "35,000",
//                                 "totalCost": "385,000",
//                             },
//                             {
//                                 "active": true,
//                                 "regionId": 2,
//                                 "programName": "HIV/AIDS - Kenya - Ministry Of Health",
//                                 "fundingSource": "Bill & Melinda Gates Foundation",
//                                 "planningUnit": "Ceftriaxone 1 gm Vial,10 Vials",
//                                 "qty": "60,000",
//                                 "productCost": "8.00",
//                                 "totalProductCost": "480,000",
//                                 "freightPer": "12",
//                                 "freightCost": "57,600",
//                                 "totalCost": "537,600",
//                             },
//                             {
//                                 "active": true,
//                                 "regionId": 3,
//                                 "programName": "HIV/AIDS - Kenya - Ministry Of Health",
//                                 "fundingSource": "USAID",
//                                 "planningUnit": "Ceftriaxone 250 gm Powder Vial,10 Vials",
//                                 "qty": "40,000",
//                                 "productCost": "9.00",
//                                 "totalProductCost": "360,000",
//                                 "freightPer": "10",
//                                 "freightCost": "36,000",
//                                 "totalCost": "396,000",
//                             },
//                             {
//                                 "active": true,
//                                 "regionId": 4,
//                                 "programName": "HIV/AIDS - Malawi - National",
//                                 "fundingSource": "UNFPA",
//                                 "planningUnit": "Abacavir 20mg/mL Solution,240 mL",
//                                 "qty": "50,000",
//                                 "productCost": "10.00",
//                                 "totalProductCost": "500,000",
//                                 "freightPer": "15",
//                                 "freightCost": "75,000",
//                                 "totalCost": "575,000",
//                             },
//                         ],
//                         loading: false
//                     })
//                 } else {
//                     this.setState({ message: response.data.messageCode })
//                 }
//             })

//         RealmCountryService.getRealmCountryListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         realmCountryList: response.data
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     })
//                 }
//             })
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

//         const { realmCountryList } = this.state;
//         let realmCountries = realmCountryList.length > 0
//             && realmCountryList.map((item, i) => {
//                 return (
//                     <option key={i} value={item.realmCountryId}>
//                         {getLabelText(item.country.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const pickerLang = {
//             months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//             from: 'From', to: 'To',
//         }
//         const { rangeValue } = this.state

//         const makeText = m => {
//             if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
//             return '?'
//         }

//         const columns = [
//             {
//                 dataField: 'fundingSource',
//                 text: 'Funding Source',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//             },
//             {
//                 dataField: 'planningUnit',
//                 text: 'Planning Unit',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//             },
//             {
//                 dataField: 'qty',
//                 text: 'Qty',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//             },
//             {
//                 dataField: 'totalProductCost',
//                 text: 'Product Cost (USD)',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'freightPer',
//                 text: 'Freight (%)',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'freightCost',
//                 text: 'Freight Cost (USD)',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'totalCost',
//                 text: 'Total Cost (USD)',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
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
//                 <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5>{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     <CardHeader className="mb-md-3 pb-lg-1">
//                         <i className="icon-menu"></i><strong>Funding Source Report</strong>{' '}
//                         <div className="card-header-actions">
//                             <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
//                             <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
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
//                                                 <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
//                                             </Picker>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">Funding Source</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="realmCountryId"
//                                                 id="realmCountryId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {realmCountries}
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">Program</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="realmCountryId"
//                                                 id="realmCountryId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {realmCountries}
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">Planning Unit</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="realmCountryId"
//                                                 id="realmCountryId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {realmCountries}
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">Include Planned Shipments</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="shipmentStatusID"
//                                                 id="shipmentStatusID"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">Yes</option>
//                                                 <option value="1">No</option>
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>
//                             </div>
//                         </Col>



//                         <ToolkitProvider
//                             keyField="regionId"
//                             data={this.state.selRegion}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (

//                                     <div className="TableCust listPrportFundingAlignThtd">
//                                         <div className="col-md-3 pr-0 offset-md-9 text-right mob-Left mt-5">
//                                             <SearchBar {...props.searchProps} />
//                                             <ClearSearchButton {...props.searchProps} />
//                                         </div>
//                                         <BootstrapTable hover striped  noDataIndication={i18n.t('static.common.noData')} tabIndexCell
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
//                         <div class="align-items-center">
//                             <div ><h4> <strong>Loading...</strong></h4></div>

//                             <div class="spinner-border blue ml-4" role="status">

//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }
// export default FunderExport;

// import React, { Component } from 'react';
// import { Card, CardHeader, Form, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import i18n from '../../i18n'
// import RegionService from "../../api/RegionService";
// import AuthenticationService from '../Common/AuthenticationService.js';
// import getLabelText from '../../CommonComponent/getLabelText';
// import RealmCountryService from "../../api/RealmCountryService.js";
// import Picker from 'react-month-picker'
// import MonthBox from '../../CommonComponent/MonthBox.js'

// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// import pdfIcon from '../../assets/img/pdf.png';
// import csvicon from '../../assets/img/csv.png';
// const pickerLang = {
//     months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
//     from: 'From', to: 'To',
// }



// const entityname = i18n.t('static.region.region');

// class FunderExport extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             regionList: [],
//             message: '',
//             selRegion: [],
//             realmCountryList: [],
//             lang: localStorage.getItem('lang'),
//             loading: true,
//             rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
//         }
//         this.editRegion = this.editRegion.bind(this);
//         this.addRegion = this.addRegion.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
//         this.handleRangeChange = this.handleRangeChange.bind(this);
//         this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
//     }

//     makeText = m => {
//         if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
//         return '?'
//     }

//     handleRangeChange(value, text, listIndex) {
//         //
//     }
//     handleRangeDissmis(value) {
//         this.setState({ rangeValue: value })
//         this.filterData(value);
//     }

//     _handleClickRangeBox(e) {
//         this.refs.pickRange.show()
//     }

//     filterData() {
//         let countryId = document.getElementById("realmCountryId").value;
//         if (countryId != 0) {
//             const selRegion = this.state.regionList.filter(c => c.realmCountry.realmCountryId == countryId)
//             this.setState({
//                 selRegion: selRegion
//             });
//         } else {
//             this.setState({
//                 selRegion: this.state.regionList
//             });
//         }
//     }
//     editRegion(region) {
//         this.props.history.push({
//             pathname: `/region/editRegion/${region.regionId}`,
//             // state: { region }
//         });
//     }
//     addRegion(region) {
//         this.props.history.push({
//             pathname: "/region/addRegion"
//         });
//     }

//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         RegionService.getRegionList()
//             .then(response => {
//                 console.log("RESP---", response.data);

//                 if (response.status == 200) {
//                     this.setState({
//                         regionList: response.data,
//                         selRegion: [
//                             {
//                                 "active": true,
//                                 "regionId": 1,
//                                 "programName": "HIV/AIDS - Kenya - Ministry Of Health",
//                                 "fundingSource": "Global Fund",
//                                 "planningUnit": "Ceftriaxone 1 gm Vial,50 Vials",
//                                 "qty": "50,000",
//                                 "productCost": "7.00",
//                                 "totalProductCost": "350,000",
//                                 "freightPer": "10",
//                                 "freightCost": "35,000",
//                                 "totalCost": "385,000",
//                             },
//                             {
//                                 "active": true,
//                                 "regionId": 2,
//                                 "programName": "HIV/AIDS - Kenya - Ministry Of Health",
//                                 "fundingSource": "Bill & Melinda Gates Foundation",
//                                 "planningUnit": "Ceftriaxone 1 gm Vial,10 Vials",
//                                 "qty": "60,000",
//                                 "productCost": "8.00",
//                                 "totalProductCost": "480,000",
//                                 "freightPer": "12",
//                                 "freightCost": "57,600",
//                                 "totalCost": "537,600",
//                             },
//                             {
//                                 "active": true,
//                                 "regionId": 3,
//                                 "programName": "HIV/AIDS - Kenya - Ministry Of Health",
//                                 "fundingSource": "USAID",
//                                 "planningUnit": "Ceftriaxone 250 gm Powder Vial,10 Vials",
//                                 "qty": "40,000",
//                                 "productCost": "9.00",
//                                 "totalProductCost": "360,000",
//                                 "freightPer": "10",
//                                 "freightCost": "36,000",
//                                 "totalCost": "396,000",
//                             },
//                             {
//                                 "active": true,
//                                 "regionId": 4,
//                                 "programName": "HIV/AIDS - Malawi - National",
//                                 "fundingSource": "UNFPA",
//                                 "planningUnit": "Abacavir 20mg/mL Solution,240 mL",
//                                 "qty": "50,000",
//                                 "productCost": "10.00",
//                                 "totalProductCost": "500,000",
//                                 "freightPer": "15",
//                                 "freightCost": "75,000",
//                                 "totalCost": "575,000",
//                             },
//                         ],
//                         loading: false
//                     })
//                 } else {
//                     this.setState({ message: response.data.messageCode })
//                 }
//             })

//         RealmCountryService.getRealmCountryListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         realmCountryList: response.data
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     })
//                 }
//             })
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

//         const { realmCountryList } = this.state;
//         let realmCountries = realmCountryList.length > 0
//             && realmCountryList.map((item, i) => {
//                 return (
//                     <option key={i} value={item.realmCountryId}>
//                         {getLabelText(item.country.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const pickerLang = {
//             months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//             from: 'From', to: 'To',
//         }
//         const { rangeValue } = this.state

//         const makeText = m => {
//             if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
//             return '?'
//         }

//         const columns = [
//             {
//                 dataField: 'fundingSource',
//                 text: 'Funding Source',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//             },
//             {
//                 dataField: 'planningUnit',
//                 text: 'Planning Unit',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//             },
//             {
//                 dataField: 'qty',
//                 text: 'Qty',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//             },
//             {
//                 dataField: 'totalProductCost',
//                 text: 'Product Cost (USD)',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'freightPer',
//                 text: 'Freight (%)',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'freightCost',
//                 text: 'Freight Cost (USD)',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'totalCost',
//                 text: 'Total Cost (USD)',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
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
//                 <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5>{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     <CardHeader className="mb-md-3 pb-lg-1">
//                         <i className="icon-menu"></i><strong>Funding Source Report</strong>{' '}
//                         <div className="card-header-actions">
//                             <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
//                             <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
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
//                                                 <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
//                                             </Picker>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">Funding Source</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="realmCountryId"
//                                                 id="realmCountryId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {realmCountries}
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">Program</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="realmCountryId"
//                                                 id="realmCountryId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {realmCountries}
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">Planning Unit</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="realmCountryId"
//                                                 id="realmCountryId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {realmCountries}
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">Include Planned Shipments</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="shipmentStatusID"
//                                                 id="shipmentStatusID"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">Yes</option>
//                                                 <option value="1">No</option>
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>
//                             </div>
//                         </Col>



//                         <ToolkitProvider
//                             keyField="regionId"
//                             data={this.state.selRegion}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (

//                                     <div className="TableCust listPrportFundingAlignThtd">
//                                         <div className="col-md-3 pr-0 offset-md-9 text-right mob-Left mt-5">
//                                             <SearchBar {...props.searchProps} />
//                                             <ClearSearchButton {...props.searchProps} />
//                                         </div>
//                                         <BootstrapTable hover striped  noDataIndication={i18n.t('static.common.noData')} tabIndexCell
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
//                         <div class="align-items-center">
//                             <div ><h4> <strong>Loading...</strong></h4></div>

//                             <div class="spinner-border blue ml-4" role="status">

//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }
// export default FunderExport;

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
import { Online, Offline } from "react-detect-offline";
import FundingSourceService from '../../api/FundingSourceService';

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}



class FunderExport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            regionList: [],
            message: '',
            selRegion: [],
            realmCountryList: [],
            fundingSources: [],
            programs: [],
            versions: [],
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            data: [],
            lang: localStorage.getItem('lang'),
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 2 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate:{year:  new Date().getFullYear()-3, month: new Date().getMonth()+2},
            maxDate:{year:  new Date().getFullYear()+3, month: new Date().getMonth()},
            loading: false
        }
        this.formatLabel = this.formatLabel.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
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
                        programs: response.data
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: []
                        }, () => { this.consolidatedProgramList() })
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
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

    getFundingSource = () => {
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            FundingSourceService.getFundingSourceListAll()
                .then(response => {
                    // console.log(JSON.stringify(response.data))
                    this.setState({
                        fundingSources: response.data
                    }, () => { this.consolidatedFundingSourceList() })
                }).catch(
                    error => {
                        this.setState({
                            fundingSources: []
                        }, () => { this.consolidatedFundingSourceList() })
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );

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

                this.setState({
                    fundingSources: proList
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
        });

    }

    handlePlanningUnitChange = (planningUnitIds) => {
        this.setState({
            planningUnitValues: planningUnitIds.map(ele => ele.value),
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
    addDoubleQuoteToRowContent=(arr)=>{
        return arr.map(ele=>'"'+ele+'"')
     }

    exportCSV(columns) {

        var csvRow = [];
        csvRow.push((i18n.t('static.report.dateRange') + ' , ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
        csvRow.push(i18n.t('static.budget.fundingsource') + ' , ' + (document.getElementById("fundingSourceId").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push(i18n.t('static.report.version').replaceAll(' ', '%20') + '  ,  ' + (document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20'))
        this.state.planningUnitLabels.map(ele =>
            csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
        csvRow.push(i18n.t('static.program.isincludeplannedshipment') + ' , ' + (document.getElementById("isPlannedShipmentId").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')

        const headers = [];
        columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });


        var A = [this.addDoubleQuoteToRowContent(headers)]
        // this.state.data.map(ele => A.push([(getLabelText(ele.program.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (new moment(ele.inventoryDate).format('MMM YYYY')).replaceAll(' ', '%20'), ele.stockAdjustemntQty, ele.lastModifiedBy.username, new moment(ele.lastModifiedDate).format('MMM-DD-YYYY'), ele.notes]));
        this.state.data.map(ele => A.push(this.addDoubleQuoteToRowContent([(getLabelText(ele.fundingSource.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),(ele.fundingSource.code.replaceAll(',', ' ')).replaceAll(' ', '%20') , (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.qty, ele.totalProductCost, ele.freightPer, ele.freightCost, ele.totalCost])));
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
        a.download = i18n.t('static.report.fundingSource') + "-" + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
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
                doc.text(i18n.t('static.report.fundingSource'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.budget.fundingsource') + ' : ' + document.getElementById("fundingSourceId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })

                    doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })

                    var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 170, planningText)

                    doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("isPlannedShipmentId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 200, {
                        align: 'left'
                    })

                }

            }
        }

        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(8);



        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text) });
        let data = this.state.data.map(ele => [getLabelText(ele.fundingSource.label, this.state.lang), ele.fundingSource.code, getLabelText(ele.planningUnit.label, this.state.lang), ele.qty, ele.totalProductCost, ele.freightPer, ele.freightCost, ele.totalCost]);
        let content = {
            margin: { top: 40 ,bottom:50},
            startY: 220,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 80, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 100 },
                1: { cellWidth: 100 },
                2: { cellWidth: 170 },
            }
        };

        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.report.fundingSource') + ".pdf")
    }



    fetchData = () => {
        console.log("-------------------IN FETCHDATA-----------------------------");
        let versionId = document.getElementById("versionId").value;
        let programId = document.getElementById("programId").value;
        let fundingSourceId = document.getElementById("fundingSourceId").value;
        let isPlannedShipmentId = document.getElementById("isPlannedShipmentId").value;

        let planningUnitIds = this.state.planningUnitValues;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();

        if (programId > 0 && versionId != 0 && planningUnitIds.length > 0 && fundingSourceId > 0 && isPlannedShipmentId > 0) {
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


                        var programTransaction = db1.transaction(['program'], 'readwrite');
                        var programOs = programTransaction.objectStore('program');
                        var program1Request = programOs.getAll();
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
                            if (isPlannedShipmentId == 1) {//yes
                                isPlannedShipment = activeFilter;
                            } else {//no
                                isPlannedShipment = activeFilter.filter(c => (c.shipmentStatus.id != 1 || c.shipmentStatus.id != "1"));
                            }

                            const fundingSourceFilter = isPlannedShipment.filter(c => c.fundingSource.id == fundingSourceId);

                            const dateFilter = fundingSourceFilter.filter(c => moment(c.shippedDate).isBetween(startDate, endDate, null, '[)'));

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
                                    "productCost": planningUnitFilter[j].productCost,
                                    "freightPerc": parseFloat(freight),
                                    "freightCost": planningUnitFilter[j].freightCost,
                                    "totalCost": planningUnitFilter[j].productCost + planningUnitFilter[j].freightCost,
                                }
                                data.push(json);
                            }
                            console.log("end offline data----", data);
                            this.setState({
                                data: data
                                , message: ''
                            })
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            } else {
                this.setState({
                    message: ''
                })
                let includePlannedShipments = true;
                if(isPlannedShipmentId == 1){
                    includePlannedShipments = true;
                }else{
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
                        })
                    }).catch(
                        error => {
                            this.setState({
                                data: []
                            }, () => {
                                this.consolidatedProgramList();
                                this.consolidatedFundingSourceList();
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
                                        this.setState({ message: i18n.t(error.response.data.messageCode) });
                                        break;
                                    default:
                                        this.setState({ message: 'static.unkownError' });
                                        break;
                                }
                            }
                        }
                    );


            }
        } else if (fundingSourceId == 0) {
            this.setState({ message: i18n.t('static.fundingSource.selectFundingSource'), data: [] });

        } else if (programId == 0) {
            this.setState({ message: i18n.t('static.report.selectProgram'), data: [] });

        } else if (versionId == -1) {
            this.setState({ message: i18n.t('static.program.validversion'), data: [] });

        } else if (planningUnitIds.length == 0) {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), data: [] });

        } else if (isPlannedShipmentId == 0) {
            this.setState({ message: i18n.t('static.report.isincludeplannedshipmentSelect'), data: [] });
        }
    }

    componentDidMount() {
        this.getFundingSource();
        this.getPrograms();

    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    addCommas(cell, row) {
        // console.log("row---------->", row);
        // var currencyCode = row.currency.currencyCode;
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


        const columns = [
            {
                dataField: 'fundingSource.label',
                text: i18n.t('static.budget.fundingsource'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'fundingSource.code',
                text: i18n.t('static.fundingsource.fundingsourceCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
            },
            {
                dataField: 'planningUnit.label',
                text: i18n.t('static.planningunit.planningunit'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'qty',
                text: i18n.t('static.report.qty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'productCost',
                text: i18n.t('static.report.productCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'freightPerc',
                text: i18n.t('static.report.freightPer'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return cell.toFixed(2);
                }
            },
            {
                dataField: 'freightCost',
                text: i18n.t('static.report.freightCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'totalCost',
                text: i18n.t('static.report.totalCost'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
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
                }} />
                <h5>{i18n.t(this.props.match.params.message)}</h5>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-reporticon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.report.fundingSource')}</strong> */}
                        {/* <div className="card-header-actions">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                        </div> */}
                        <Online>
                            {
                                this.state.data.length > 0 &&
                                <div className="card-header-actions">
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
                                        <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                                    </a>
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                                </div>
                            }
                        </Offline>
                    </div>
                    <CardBody className="pb-lg-2 mt-3">

                        <Col md="12 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup>
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="Region-box-icon fa fa-sort-desc"></span></Label>
                                    <div className="controls SelectGo Regioncalender">
                                        <InputGroup>
                                            <Picker
                                                ref="pickRange"
                                                years={{min: this.state.minDate, max: this.state.maxDate}}
                                                value={rangeValue}
                                                lang={pickerLang}
                                                //theme="light"
                                                onChange={this.handleRangeChange}
                                                onDismiss={this.handleRangeDissmis}
                                            >
                                                <MonthBox value={this.makeText(rangeValue.from) + ' ~ ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                            </Picker>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
                                    <div className="controls SelectGo">
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

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls SelectGo">
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

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                                    <div className="controls SelectGo">
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

                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                    <div className="controls SelectGo">
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
                            </div>
                        </Col>

                        <br /><br /><br /><br />
                        <Col md="12 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup className="">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="isPlannedShipmentId"
                                                id="isPlannedShipmentId"
                                                bsSize="sm"
                                                onChange={this.fetchData}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                <option value="1">{i18n.t('static.program.yes')}</option>
                                                <option value="2">{i18n.t('static.program.no')}</option>
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>




                        <ToolkitProvider
                            keyField="shipmentId"
                            data={this.state.data}
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
                        <div className="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div className="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default FunderExport;


