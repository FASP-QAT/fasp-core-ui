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
// import csvicon from '../../assets/img/csv.png'



// const entityname = i18n.t('static.region.region');

// class WarehouseCapacityComponent extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             regionList: [],
//             message: '',
//             selRegion: [],
//             realmCountryList: [],
//             lang: localStorage.getItem('lang'),
//             loading: true
//         }
//         this.editRegion = this.editRegion.bind(this);
//         this.addRegion = this.addRegion.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
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
//                         selRegion: [{
//                             "active": true,
//                             "regionId": 1,
//                             "label": {
//                                 "active": false,
//                                 "labelId": 41,
//                                 "label_en": "National level",
//                                 "label_sp": "",
//                                 "label_fr": "",
//                                 "label_pr": ""
//                             },
//                             "realmCountry": {
//                                 "active": false,
//                                 "realmCountryId": 1,
//                                 "country": {
//                                     "active": false,
//                                     "countryId": 2,
//                                     "countryCode": "KEN",
//                                     "label": {
//                                         "active": false,
//                                         "labelId": 306,
//                                         "label_en": "Kenya",
//                                         "label_sp": "",
//                                         "label_fr": "",
//                                         "label_pr": ""
//                                     },
//                                     "currency": null
//                                 },
//                                 "realm": {
//                                     "active": false,
//                                     "realmId": 1,
//                                     "label": {
//                                         "active": false,
//                                         "labelId": 4,
//                                         "label_en": "USAID",
//                                         "label_sp": "",
//                                         "label_fr": "",
//                                         "label_pr": ""
//                                     },
//                                     "realmCode": "UAID",
//                                     "defaultRealm": false
//                                 },
//                                 "defaultCurrency": null
//                             },
//                             "gln": '1298769856365',
//                             "capacityCbm": '40,000',
//                             "regionIdString": "1",
//                             "programName": "HIV/AIDS - Kenya - Ministry Of Health",
//                         },
//                         {
//                             "active": true,
//                             "regionId": 2,
//                             "label": {
//                                 "active": false,
//                                 "labelId": 42,
//                                 "label_en": "North",
//                                 "label_sp": "",
//                                 "label_fr": "",
//                                 "label_pr": ""
//                             },
//                             "realmCountry": {
//                                 "active": false,
//                                 "realmCountryId": 2,
//                                 "country": {
//                                     "active": false,
//                                     "countryId": 3,
//                                     "countryCode": "MWI",
//                                     "label": {
//                                         "active": false,
//                                         "labelId": 343,
//                                         "label_en": "Malawi",
//                                         "label_sp": "",
//                                         "label_fr": "",
//                                         "label_pr": ""
//                                     },
//                                     "currency": null
//                                 },
//                                 "realm": {
//                                     "active": false,
//                                     "realmId": 1,
//                                     "label": {
//                                         "active": false,
//                                         "labelId": 4,
//                                         "label_en": "USAID",
//                                         "label_sp": "",
//                                         "label_fr": "",
//                                         "label_pr": ""
//                                     },
//                                     "realmCode": "UAID",
//                                     "defaultRealm": false
//                                 },
//                                 "defaultCurrency": null
//                             },
//                             "gln": '6758432123456',
//                             "capacityCbm": '18,000',
//                             "regionIdString": "2",
//                             "programName": "HIV/AIDS - Kenya - Ministry Of Health",
//                         },
//                         {
//                             "active": true,
//                             "regionId": 3,
//                             "label": {
//                                 "active": false,
//                                 "labelId": 43,
//                                 "label_en": "South",
//                                 "label_sp": "",
//                                 "label_fr": "",
//                                 "label_pr": ""
//                             },
//                             "realmCountry": {
//                                 "active": false,
//                                 "realmCountryId": 2,
//                                 "country": {
//                                     "active": false,
//                                     "countryId": 3,
//                                     "countryCode": "MWI",
//                                     "label": {
//                                         "active": false,
//                                         "labelId": 343,
//                                         "label_en": "Malawi",
//                                         "label_sp": "",
//                                         "label_fr": "",
//                                         "label_pr": ""
//                                     },
//                                     "currency": null
//                                 },
//                                 "realm": {
//                                     "active": false,
//                                     "realmId": 1,
//                                     "label": {
//                                         "active": false,
//                                         "labelId": 4,
//                                         "label_en": "USAID",
//                                         "label_sp": "",
//                                         "label_fr": "",
//                                         "label_pr": ""
//                                     },
//                                     "realmCode": "UAID",
//                                     "defaultRealm": false
//                                 },
//                                 "defaultCurrency": null
//                             },
//                             "gln": '5678903456789',
//                             "capacityCbm": '13,500',
//                             "regionIdString": "3",
//                             "programName": "HIV/AIDS - Kenya - Ministry Of Health",
//                         }

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

//         const columns = [
//             {
//                 dataField: 'realmCountry.country.label',
//                 text: i18n.t('static.region.country'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'programName',
//                 text: 'Program',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//             },
//             {
//                 dataField: 'label',
//                 text: i18n.t('static.region.region'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'gln',
//                 text: i18n.t('static.region.gln'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'capacityCbm',
//                 text: 'Capacity (CBM)',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
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
//                 <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5>{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     <CardHeader className="mb-md-3 pb-lg-1">
//                         <i className="icon-menu"></i><strong>Warehouse Capacity Report</strong>{' '}
//                         <div className="card-header-actions">
//                             <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
//                             <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
//                         </div>
//                     </CardHeader>
//                     <CardBody className="pb-lg-0">

//                         {/* <Form >
//                             <Col md="12 pl-0">
//                                 <div className="row">
//                                     <FormGroup className="col-md-3">
//                                         <Label htmlFor="countrysId">{i18n.t('static.program.realmcountry')}</Label>
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
//                                     </FormGroup>

//                                     <FormGroup className="col-md-3">
//                                         <Label htmlFor="countrysId">Program</Label>
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
//                                     </FormGroup>

//                                 </div>
//                             </Col>
//                         </Form> */}

//                         <Col md="6 pl-0">
//                             <div className="d-md-flex Selectdiv2">
//                                 <FormGroup>
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.region.country')}</Label>
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
//                                         <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
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
// export default WarehouseCapacityComponent;

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
// import { Online, Offline } from "react-detect-offline";

// class WarehouseCapacityComponent extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             regionList: [],
//             message: '',
//             selRegion: [],
//             realmCountryList: [],
//             realmCountrys: [],
//             programs: [],
//             versions: [],
//             planningUnits: [],
//             planningUnitValues: [],
//             planningUnitLabels: [],
//             data: [],
//             lang: localStorage.getItem('lang'),
//             loading: false
//         }
//         this.formatLabel = this.formatLabel.bind(this);
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

//     getRealmCountry = () => {
//         if (navigator.onLine) {
//             AuthenticationService.setupAxiosInterceptors();
//             RealmCountryService.getRealmCountryListAll()
//                 .then(response => {
//                     // console.log(JSON.stringify(response.data))
//                     this.setState({
//                         realmCountrys: response.data
//                     }, () => { this.consolidatedRealmCountryList() })
//                 }).catch(
//                     error => {
//                         this.setState({
//                             realmCountrys: []
//                         }, () => { this.consolidatedRealmCountryList() })
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
//             this.consolidatedRealmCountryList()
//         }

//     }

//     consolidatedRealmCountryList = () => {
//         const lan = 'en';
//         const { realmCountrys } = this.state
//         var proList = realmCountrys;

//         var db1;
//         getDatabase();
//         var openRequest = indexedDB.open('fasp', 1);
//         openRequest.onsuccess = function (e) {
//             db1 = e.target.result;
//             var transaction = db1.transaction(['realmCountry'], 'readwrite');
//             var realmCountry = transaction.objectStore('realmCountry');
//             var getRequest = realmCountry.getAll();

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
//                     for (var k = 0; k < this.state.realmCountrys.length; k++) {
//                         if (this.state.realmCountrys[k].realmCountryId == myResult[i].realmCountryId) {
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
//                     realmCountrys: proList
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
//         csvRow.push(i18n.t('static.procurementagent.procurementagent') + ' , ' + (document.getElementById("procurementAgentId").selectedOptions[0].text).replaceAll(' ', '%20'))
//         csvRow.push(i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
//         csvRow.push(i18n.t('static.report.version').replaceAll(' ', '%20') + '  ,  ' + (document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20'))
//         this.state.planningUnitLabels.map(ele =>
//             csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
//         csvRow.push(i18n.t('static.program.isincludeplannedshipment') + ' , ' + (document.getElementById("isPlannedShipmentId").selectedOptions[0].text).replaceAll(' ', '%20'))
//         csvRow.push('')
//         csvRow.push('')
//         csvRow.push('')
//         csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
//         csvRow.push('')

//         const headers = [];
//         columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });


//         var A = [headers]
//         // this.state.data.map(ele => A.push([(getLabelText(ele.program.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (new moment(ele.inventoryDate).format('MMM YYYY')).replaceAll(' ', '%20'), ele.stockAdjustemntQty, ele.lastModifiedBy.username, new moment(ele.lastModifiedDate).format('MMM-DD-YYYY'), ele.notes]));
//         this.state.data.map(ele => A.push([(getLabelText(ele.procurementAgent.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'),(ele.procurementAgent.code.replaceAll(',', ' ')).replaceAll(' ', '%20') , (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.qty, ele.totalProductCost, ele.freightPer, ele.freightCost, ele.totalCost]));
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
//         a.download = i18n.t('static.report.procurementAgent') + "-" + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
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
//                 doc.text(i18n.t('static.report.procurementAgent'), doc.internal.pageSize.width / 2, 60, {
//                     align: 'center'
//                 })
//                 if (i == 1) {
//                     doc.setFontSize(8)
//                     doc.setFont('helvetica', 'normal')
//                     doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
//                         align: 'left'
//                     })
//                     doc.text(i18n.t('static.procurementagent.procurementagent') + ' : ' + document.getElementById("procurementAgentId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
//                         align: 'left'
//                     })
//                     doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
//                         align: 'left'
//                     })

//                     doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
//                         align: 'left'
//                     })

//                     var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
//                     doc.text(doc.internal.pageSize.width / 8, 170, planningText)

//                     doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("isPlannedShipmentId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 200, {
//                         align: 'left'
//                     })

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
//         let data = this.state.data.map(ele => [getLabelText(ele.procurementAgent.label, this.state.lang), ele.procurementAgent.code, getLabelText(ele.planningUnit.label, this.state.lang), ele.qty, ele.totalProductCost, ele.freightPer, ele.freightCost, ele.totalCost]);
//         let content = {
//             margin: { top: 40 },
//             startY: 220,
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
//         doc.save(i18n.t('static.report.procurementAgent') + ".pdf")
//     }



//     fetchData = () => {
//         console.log("-------------------IN FETCHDATA-----------------------------");
//         let versionId = document.getElementById("versionId").value;
//         let programId = document.getElementById("programId").value;
//         let realmCountryId = document.getElementById("realmCountryId").value;

//         if (programId > 0 && versionId != 0 && realmCountryId > 0) {
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
//                     var version = (versionId.split('(')[0]).trim()

//                     //for user id
//                     var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
//                     var userId = userBytes.toString(CryptoJS.enc.Utf8);

//                     //for program id
//                     var program = `${programId}_v${version}_uId_${userId}`

//                     db1 = e.target.result;
//                     var programDataTransaction = db1.transaction(['programData'], 'readwrite');
//                     var programDataOs = programDataTransaction.objectStore('programData');
//                     // console.log(program)
//                     var programRequest = programDataOs.get(program);
//                     programRequest.onerror = function (event) {
//                         this.setState({
//                             message: i18n.t('static.program.errortext')
//                         })
//                     }.bind(this);
//                     programRequest.onsuccess = function (e) {
//                         var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
//                         var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
//                         var programJson = JSON.parse(programData);


//                         var programTransaction = db1.transaction(['program'], 'readwrite');
//                         var programOs = programTransaction.objectStore('program');
//                         var program1Request = programOs.getAll();
//                         program1Request.onsuccess = function (event) {
//                             var programResult = [];
//                             programResult = program1Request.result;

//                             var regionList = (programJson.regionList);
//                             // console.log("regionList---->>>", regionList);

//                             const activeFilter = regionList.filter(c => (c.active == true || c.active == "true"));
//                             // const planningUnitFilter = activeFilter.filter(c => c.planningUnit.id == planningUnitId);

//                             const realmCountryFilter = activeFilter.filter(c => c.realmCountry.realmCountryId == realmCountryId);

//                             let data = [];

//                             console.log("offline data----", realmCountryFilter);
//                             for (let j = 0; j < realmCountryFilter.length; j++) {

//                                 let json = {
//                                     "active": true,
//                                     "region": realmCountryFilter[j],
//                                     "program": programJson,
//                                 }
//                                 data.push(json);
//                             }

//                             this.setState({
//                                 data: data
//                                 , message: ''
//                             })
//                         }.bind(this)
//                     }.bind(this)
//                 }.bind(this)
//             } else {
//                 this.setState({
//                     message: ''
//                 })

//                 var inputjson = {
//                     realmCountryId: realmCountryId,
//                     programId: programId,
//                     versionId: versionId,
//                 }
//                 AuthenticationService.setupAxiosInterceptors();
//                 ReportService.procurementAgentExporttList(inputjson)
//                     .then(response => {
//                         console.log("Online Data------",response.data);
//                         this.setState({
//                             data: response.data
//                         }, () => {
//                             this.consolidatedProgramList();
//                             this.consolidatedRealmCountryList();
//                         })
//                     }).catch(
//                         error => {
//                             this.setState({
//                                 data: []
//                             }, () => {
//                                 this.consolidatedProgramList();
//                                 this.consolidatedRealmCountryList();
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
//         } else if (realmCountryId == 0) {
//             this.setState({ message: i18n.t('static.report.realmCountrySelect'), data: [] });

//         } else if (programId == 0) {
//             this.setState({ message: i18n.t('static.report.selectProgram'), data: [] });

//         } else if (versionId == -1) {
//             this.setState({ message: i18n.t('static.program.validversion'), data: [] });

//         } 
//     }

//     componentDidMount() {
//         this.getRealmCountry();
//         this.getPrograms();

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
//           x1 = x1.replace(rgx, '$1' + ',' + '$2');
//         }
//         // return "(" + currencyCode + ")" + "  " + x1 + x2;
//         return x1 + x2;
//       }

//     render() {

//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );

//         const { realmCountrys } = this.state;

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


//         const columns = [
//             {
//                 dataField: 'realmcountry.label',
//                 text: i18n.t('static.program.realmcountry'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 }
//             },
//             {
//                 dataField: 'label',
//                 text: i18n.t('static.region.region'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 }
//             },
//             {
//                 dataField: 'program.label',
//                 text: i18n.t('static.program.program'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cell, row) => {
//                     return getLabelText(cell, this.state.lang);
//                 }
//             },
//             {
//                 dataField: 'gln',
//                 text: i18n.t('static.region.gln'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//             },
//             {
//                 dataField: 'capacityCbm',
//                 text: i18n.t('static.region.capacitycbm'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.addCommas
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
//                 <h5>{i18n.t(this.state.message)}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     <CardHeader className="mb-md-3 pb-lg-1">
//                         <i className="icon-menu"></i><strong>{i18n.t('static.report.warehouseCapacity')}</strong>
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
//                     </CardHeader>
//                     <CardBody className="pb-lg-0">

//                         <Col md="12 pl-0">
//                             <div className="d-md-flex Selectdiv2">

//                                 <FormGroup className="">
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.program.realmcountry')}</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="realmCountryId"
//                                                 id="realmCountryId"
//                                                 bsSize="sm"
//                                                 onChange={this.fetchData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.select')}</option>
//                                                 {realmCountrys.length > 0
//                                                     && realmCountrys.map((item, i) => {
//                                                         return (
//                                                             <option key={i} value={item.realmCountryId}>
//                                                                 {getLabelText(item.country.label, this.state.lang)}
//                                                             </option>
//                                                         )
//                                                     }, this)}

//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>

//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
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
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="versionId"
//                                                 id="versionId"
//                                                 bsSize="sm"
//                                                 onChange={this.fetchData}
//                                             >
//                                                 <option value="-1">{i18n.t('static.common.select')}</option>
//                                                 {versionList}
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
// export default WarehouseCapacityComponent;

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
import csvicon from '../../assets/img/csv.png'



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
            loading: true
        }
        this.editRegion = this.editRegion.bind(this);
        this.addRegion = this.addRegion.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
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
                            "label": {
                                "active": false,
                                "labelId": 41,
                                "label_en": "National level",
                                "label_sp": "",
                                "label_fr": "",
                                "label_pr": ""
                            },
                            "realmCountry": {
                                "active": false,
                                "realmCountryId": 1,
                                "country": {
                                    "active": false,
                                    "countryId": 2,
                                    "countryCode": "KEN",
                                    "label": {
                                        "active": false,
                                        "labelId": 306,
                                        "label_en": "Kenya",
                                        "label_sp": "",
                                        "label_fr": "",
                                        "label_pr": ""
                                    },
                                    "currency": null
                                },
                                "realm": {
                                    "active": false,
                                    "realmId": 1,
                                    "label": {
                                        "active": false,
                                        "labelId": 4,
                                        "label_en": "USAID",
                                        "label_sp": "",
                                        "label_fr": "",
                                        "label_pr": ""
                                    },
                                    "realmCode": "UAID",
                                    "defaultRealm": false
                                },
                                "defaultCurrency": null
                            },
                            "gln": '1298769856365',
                            "capacityCbm": '40,000',
                            "regionIdString": "1",
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health   \n HIV/AIDS - Malawi - National ",
                        },
                        {
                            "active": true,
                            "regionId": 2,
                            "label": {
                                "active": false,
                                "labelId": 42,
                                "label_en": "North",
                                "label_sp": "",
                                "label_fr": "",
                                "label_pr": ""
                            },
                            "realmCountry": {
                                "active": false,
                                "realmCountryId": 2,
                                "country": {
                                    "active": false,
                                    "countryId": 3,
                                    "countryCode": "MWI",
                                    "label": {
                                        "active": false,
                                        "labelId": 343,
                                        "label_en": "Malawi",
                                        "label_sp": "",
                                        "label_fr": "",
                                        "label_pr": ""
                                    },
                                    "currency": null
                                },
                                "realm": {
                                    "active": false,
                                    "realmId": 1,
                                    "label": {
                                        "active": false,
                                        "labelId": 4,
                                        "label_en": "USAID",
                                        "label_sp": "",
                                        "label_fr": "",
                                        "label_pr": ""
                                    },
                                    "realmCode": "UAID",
                                    "defaultRealm": false
                                },
                                "defaultCurrency": null
                            },
                            "gln": '6758432123456',
                            "capacityCbm": '18,000',
                            "regionIdString": "2",
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health \n Malaria - Kenya - National",
                        },
                        {
                            "active": true,
                            "regionId": 3,
                            "label": {
                                "active": false,
                                "labelId": 43,
                                "label_en": "South",
                                "label_sp": "",
                                "label_fr": "",
                                "label_pr": ""
                            },
                            "realmCountry": {
                                "active": false,
                                "realmCountryId": 2,
                                "country": {
                                    "active": false,
                                    "countryId": 3,
                                    "countryCode": "MWI",
                                    "label": {
                                        "active": false,
                                        "labelId": 343,
                                        "label_en": "Malawi",
                                        "label_sp": "",
                                        "label_fr": "",
                                        "label_pr": ""
                                    },
                                    "currency": null
                                },
                                "realm": {
                                    "active": false,
                                    "realmId": 1,
                                    "label": {
                                        "active": false,
                                        "labelId": 4,
                                        "label_en": "USAID",
                                        "label_sp": "",
                                        "label_fr": "",
                                        "label_pr": ""
                                    },
                                    "realmCode": "UAID",
                                    "defaultRealm": false
                                },
                                "defaultCurrency": null
                            },
                            "gln": '5678903456789',
                            "capacityCbm": '13,500',
                            "regionIdString": "3",
                            "programName": "HIV/AIDS - Kenya - Ministry Of Health \n Malaria - Kenya - National",
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

        const columns = [
            {
                dataField: 'realmCountry.country.label',
                text: i18n.t('static.region.country'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel,
                style: { width: '80px' },
            },
            {
                dataField: 'label',
                text: i18n.t('static.region.region'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel,
                style: { width: '80px' },
            },
            {
                dataField: 'programName',
                text: i18n.t('static.program.program'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
            },
            {
                dataField: 'gln',
                text: i18n.t('static.region.gln'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '10px' },
            },
            {
                dataField: 'capacityCbm',
                text: 'Capacity (CBM)',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '10px' },
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
                        <i className="icon-menu"></i><strong>Warehouse Capacity Report</strong>{' '}
                        <div className="card-header-actions">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </div>
                    </CardHeader>
                    <CardBody className="pb-lg-0">

                        {/* <Form >
                            <Col md="12 pl-0">
                                <div className="row">
                                    <FormGroup className="col-md-3">
                                        <Label htmlFor="countrysId">{i18n.t('static.program.realmcountry')}</Label>
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmCountryId"
                                                id="realmCountryId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {realmCountries}
                                            </Input>
                                        </InputGroup>
                                    </FormGroup>

                                    <FormGroup className="col-md-3">
                                        <Label htmlFor="countrysId">Program</Label>
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmCountryId"
                                                id="realmCountryId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {realmCountries}
                                            </Input>
                                        </InputGroup>
                                    </FormGroup>

                                </div>
                            </Col>
                        </Form> */}

                        <Col md="6 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup>
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.region.country')}</Label>
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
                                                {realmCountries}
                                            </Input>

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
                                                {/* <option value="1" selected>HIV/AIDS - Malawi - Ministry Of Health</option> */}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>

                                {/* <FormGroup className="tab-ml-1">
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
                                </FormGroup> */}
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
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
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


