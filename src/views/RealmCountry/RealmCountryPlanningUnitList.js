// import React, { Component } from 'react';
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory from 'react-bootstrap-table2-filter';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
// import getLabelText from '../../CommonComponent/getLabelText';
// import i18n from '../../i18n';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import RealmCountryService from '../../api/RealmCountryService';


// const entityname = i18n.t('static.dashboad.planningunitcountry');
// export default class RealmCountryPlanningUnitList extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             realmCountrys: [],
//             realmCountryPlanningUnitList: [],
//             message: '',
//             selSource: []

//         }
//         this.filterData = this.filterData.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//     }

//     filterData() {
//         let realmCountryId = document.getElementById("realmCountryId").value;
//         AuthenticationService.setupAxiosInterceptors();
//         RealmCountryService.getRealmCountryPlanningUnitAllByrealmCountryId(realmCountryId).then(response => {
//             console.log(response.data)
//             this.setState({
//                 realmCountryPlanningUnitList: response.data,
//                 selSource: response.data
//             })
//         })
//             .catch(
//                 error => {
//                     if (error.message === "Network Error") {
//                         this.setState({ message: error.message });
//                     } else {
//                         switch (error.response ? error.response.status : "") {
//                             case 500:
//                             case 401:
//                             case 404:
//                             case 406:
//                             case 412:
//                                 this.setState({ message: error.response.data.messageCode });
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
//         RealmCountryService.getRealmCountryListAll().then(response => {
//             console.log(response.data)
//             this.setState({
//                 realmCountrys: response.data,

//             })
//         })
//             .catch(
//                 error => {
//                     if (error.message === "Network Error") {
//                         this.setState({ message: error.message });
//                     } else {
//                         switch (error.response ? error.response.status : "") {
//                             case 500:
//                             case 401:
//                             case 404:
//                             case 406:
//                             case 412:
//                                 this.setState({ message: error.response.data.messageCode });
//                                 break;
//                             default:
//                                 this.setState({ message: 'static.unkownError' });
//                                 break;
//                         }
//                     }
//                 }
//             );

//     }



//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
//     }

//     render() {
//         const { realmCountrys } = this.state;
//         let realmCountryList = realmCountrys.length > 0
//             && realmCountrys.map((item, i) => {
//                 return (
//                     <option key={i} value={item.realmCountryId}>
//                         {getLabelText(item.realm.label, this.state.lang) + " - " + getLabelText(item.country.label, this.state.lang)}
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
//                 dataField: 'realmCountry.label',
//                 text: i18n.t('static.dashboard.realmcountry'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'planningUnit.label',
//                 text: i18n.t('static.planningunit.planningunit'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'label',
//                 text: i18n.t('static.planningunit.countrysku'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'skuCode',
//                 text: i18n.t('static.procurementAgentProcurementUnit.skuCode'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'unit.label',
//                 text: i18n.t('static.unit.unit'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             }, {
//                 dataField: 'multiplier',
//                 text: i18n.t('static.unit.multiplier'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 //formatter: this.formatLabel
//             },
//             // {
//             //     dataField: 'gtin',
//             //     text: i18n.t('static.procurementAgentProcurementUnit.gtin'),
//             //     sort: true,
//             //     align: 'center',
//             //     headerAlign: 'center'
//             // },
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
//             }];
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
//                 text: 'All', value: this.state.selSource.length
//             }]
//         }
//         return (
//             <div className="animated">
//                 <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5>{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card>
//                     {/* <CardHeader className="mb-md-3 pb-lg-1">
//                         <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>
//                         <div className="card-header-actions">

//                         </div>

//                     </CardHeader> */}
//                     <CardBody className="mt-3">
//                         <Col md="3 pl-0">
//                             <FormGroup className="Selectdiv">
//                                 <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.realmcountry')}</Label>
//                                 <div className="controls SelectGo">
//                                     <InputGroup>
//                                         <Input
//                                             type="select"
//                                             name="realmCountryId"
//                                             id="realmCountryId"
//                                             bsSize="sm"
//                                             onChange={this.filterData}
//                                         >
//                                             <option value="0">{i18n.t('static.common.select')}</option>
//                                             {realmCountryList}
//                                         </Input>
//                                         {/* <InputGroupAddon addonType="append">
//                                             <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
//                                         </InputGroupAddon> */}
//                                     </InputGroup>
//                                 </div>
//                             </FormGroup>
//                         </Col>
//                         <ToolkitProvider
//                             keyField="realmCountryPlanningUnitId"
//                             data={this.state.selSource}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (
//                                     <div className="TableCust listRealmcountryplanningAlignThtd">
//                                         <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
//                                             <SearchBar {...props.searchProps} />
//                                             <ClearSearchButton {...props.searchProps} />
//                                         </div>
//                                         <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                                             pagination={paginationFactory(options)}
//                                             /* rowEvents={{
//                                                  onClick: (e, row, rowIndex) => {
//                                                      this.editRealmCountryPlanningUnit(row);
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

//--------------------------------------------



// import React, { Component } from 'react';
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory from 'react-bootstrap-table2-filter';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
// import getLabelText from '../../CommonComponent/getLabelText';
// import i18n from '../../i18n';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import RealmCountryService from '../../api/RealmCountryService';
// import jexcel from 'jexcel';
// import "../../../node_modules/jexcel/dist/jexcel.css";
// import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
// import moment from 'moment';
// import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION } from '../../Constants';
// const entityname = i18n.t('static.dashboad.planningunitcountry');
// export default class RealmCountryPlanningUnitList extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             realmCountrys: [],
//             realmCountryPlanningUnitList: [],
//             message: '',
//             selSource: [],
//             loading: true,
//             allowAdd: false

//         }
//         this.filterData = this.filterData.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this.buildJexcel = this.buildJexcel.bind(this);
//         this.addNewEntity = this.addNewEntity.bind(this);
//     }

//     addNewEntity() {
//         let realmCountryId = document.getElementById("realmCountryId").value;
//         if (realmCountryId != 0) {
//             this.props.history.push({
//                 pathname: `/realmCountry/realmCountryPlanningUnit/${realmCountryId}`,
//             })
//         }
//     }

//     buildJexcel() {
//         let realmCountryList = this.state.selSource;
//         // console.log("realmCountryList---->", realmCountryList);
//         let realmCountryArray = [];
//         let count = 0;

//         for (var j = 0; j < realmCountryList.length; j++) {
//             data = [];
//             data[0] = realmCountryList[j].realmCountryId
//             data[1] = getLabelText(realmCountryList[j].realmCountry.label, this.state.lang)
//             data[2] = getLabelText(realmCountryList[j].planningUnit.label, this.state.lang)
//             data[3] = getLabelText(realmCountryList[j].label, this.state.lang)
//             data[4] = realmCountryList[j].skuCode;
//             data[5] = getLabelText(realmCountryList[j].unit.label, this.state.lang)
//             data[6] = realmCountryList[j].multiplier;
//             data[7] = realmCountryList[j].lastModifiedBy.username;
//             data[8] = (realmCountryList[j].lastModifiedDate ? moment(realmCountryList[j].lastModifiedDate).format(`${DATE_FORMAT_CAP}`) : null)
//             data[9] = realmCountryList[j].active;

//             realmCountryArray[count] = data;
//             count++;
//         }
//         // if (realmCountryList.length == 0) {
//         //     data = [];
//         //     realmCountryArray[0] = data;
//         // }
//         // console.log("realmCountryArray---->", realmCountryArray);
//         this.el = jexcel(document.getElementById("tableDiv"), '');
//         this.el.destroy();
//         var json = [];
//         var data = realmCountryArray;

//         var options = {
//             data: data,
//             columnDrag: true,
//             // colWidths: [150, 150, 100],
//             colHeaderClasses: ["Reqasterisk"],
//             columns: [
//                 {
//                     title: 'realmCountryId',
//                     type: 'hidden',
//                     readOnly: true
//                 },
//                 {
//                     title: i18n.t('static.dashboard.realmcountry'),
//                     type: 'text',
//                     readOnly: true
//                 },
//                 {
//                     title: i18n.t('static.planningunit.planningunit'),
//                     type: 'text',
//                     readOnly: true
//                 },

//                 {
//                     title: i18n.t('static.planningunit.countrysku'),
//                     type: 'text',
//                     readOnly: true
//                 },

//                 {
//                     title: i18n.t('static.procurementAgentProcurementUnit.skuCode'),
//                     type: 'text',
//                     readOnly: true
//                 },

//                 {
//                     title: i18n.t('static.unit.unit'),
//                     type: 'text',
//                     readOnly: true
//                 },

//                 {
//                     // title: i18n.t('static.planningUnit.multiplierLabel'),
//                     title: i18n.t('static.unit.multiplier'),
//                     type: 'text',
//                     readOnly: true
//                 },
//                 {
//                     title: i18n.t('static.common.lastModifiedBy'),
//                     type: 'text',
//                     readOnly: true
//                 },
//                 {
//                     title: i18n.t('static.common.lastModifiedDate'),
//                     type: 'text',
//                     readOnly: true
//                 },
//                 {
//                     type: 'dropdown',
//                     title: i18n.t('static.common.status'),
//                     readOnly: true,
//                     source: [
//                         { id: true, name: i18n.t('static.common.active') },
//                         { id: false, name: i18n.t('static.common.disabled') }
//                     ]
//                 },
//             ],
//             text: {
//                 showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
//                 show: '',
//                 entries: '',
//             },
//             onload: this.loaded,
//             pagination: localStorage.getItem("sesRecordCount"),
//             search: true,
//             columnSorting: true,
//             tableOverflow: true,
//             wordWrap: true,
//             allowInsertColumn: false,
//             allowManualInsertColumn: false,
//             allowDeleteRow: false,
//             onselection: this.selected,


//             oneditionend: this.onedit,
//             copyCompatibility: true,
//             allowExport: false,
//             paginationOptions: JEXCEL_PAGINATION_OPTION,
//             position: 'top',
//             contextMenu: false
//         };
//         var languageEl = jexcel(document.getElementById("tableDiv"), options);
//         this.el = languageEl;
//         this.setState({
//             languageEl: languageEl, loading: false
//         })
//     }

//     filterData() {
//         this.setState({ loading: true })
//         let realmCountryId = document.getElementById("realmCountryId").value;
//         if (realmCountryId == 0) {
//             this.setState({ allowAdd: false })
//         } else {
//             this.setState({ allowAdd: true })
//         }
//         // AuthenticationService.setupAxiosInterceptors();
//         RealmCountryService.getRealmCountryPlanningUnitAllByrealmCountryId(realmCountryId).then(response => {
//             console.log(response.data)
//             this.setState({
//                 realmCountryPlanningUnitList: response.data,
//                 selSource: response.data,
//             },
//                 () => { this.buildJexcel() })
//         })
//             .catch(
//                 error => {
//                     if (error.message === "Network Error") {
//                         this.setState({
//                             message: 'static.unkownError',
//                             loading: false
//                         });
//                     } else {
//                         switch (error.response ? error.response.status : "") {

//                             case 401:
//                                 this.props.history.push(`/login/static.message.sessionExpired`)
//                                 break;
//                             case 403:
//                                 this.props.history.push(`/accessDenied`)
//                                 break;
//                             case 500:
//                             case 404:
//                             case 406:
//                                 this.setState({
//                                     message: error.response.data.messageCode,
//                                     loading: false
//                                 });
//                                 break;
//                             case 412:
//                                 this.setState({
//                                     message: error.response.data.messageCode,
//                                     loading: false
//                                 });
//                                 break;
//                             default:
//                                 this.setState({
//                                     message: 'static.unkownError',
//                                     loading: false
//                                 });
//                                 break;
//                         }
//                     }
//                 }
//             );

//     }
//     loaded = function (instance, cell, x, y, value) {
//         jExcelLoadedFunction(instance);
//         var asterisk = document.getElementsByClassName("resizable")[0];
//         var tr = asterisk.firstChild;
//         tr.children[7].title = i18n.t("static.message.tooltipMultiplier")
//     }


//     componentDidMount() {
//         // AuthenticationService.setupAxiosInterceptors();
//         // RealmCountryService.getRealmCountryListAll().then(response => {
//         //     console.log(response.data)

//         //     this.setState({
//         //         realmCountrys: response.data
//         //     },
//         //         () => { this.buildJexcel() })
//         // })
//         //     .catch(
//         //         error => {
//         //             if (error.message === "Network Error") {
//         //                 this.setState({ message: error.message, loading: false });
//         //             } else {
//         //                 switch (error.response ? error.response.status : "") {
//         //                     case 500:
//         //                     case 401:
//         //                     case 404:
//         //                     case 406:
//         //                     case 412:
//         //                         this.setState({ message: error.response.data.messageCode, loading: false });
//         //                         break;
//         //                     default:
//         //                         this.setState({ message: 'static.unkownError', loading: false });
//         //                         break;
//         //                 }
//         //             }
//         //         }
//         //     );

//         let realmId = AuthenticationService.getRealmId();
//         RealmCountryService.getRealmCountryrealmIdById(realmId)
//             .then(response => {
//                 console.log("RealmCountryService---->", response.data)
//                 if (response.status == 200) {
//                     this.setState({
//                         realmCountrys: response.data
//                     },
//                         () => { this.buildJexcel() })
//                 } else {
//                     this.setState({ message: response.data.messageCode, loading: false })
//                 }
//             })
//             .catch(
//                 error => {
//                     if (error.message === "Network Error") {
//                         this.setState({
//                             message: 'static.unkownError',
//                             loading: false
//                         });
//                     } else {
//                         switch (error.response ? error.response.status : "") {

//                             case 401:
//                                 this.props.history.push(`/login/static.message.sessionExpired`)
//                                 break;
//                             case 403:
//                                 this.props.history.push(`/accessDenied`)
//                                 break;
//                             case 500:
//                             case 404:
//                             case 406:
//                                 this.setState({
//                                     message: error.response.data.messageCode,
//                                     loading: false
//                                 });
//                                 break;
//                             case 412:
//                                 this.setState({
//                                     message: error.response.data.messageCode,
//                                     loading: false
//                                 });
//                                 break;
//                             default:
//                                 this.setState({
//                                     message: 'static.unkownError',
//                                     loading: false
//                                 });
//                                 break;
//                         }
//                     }
//                 }
//             );

//     }



//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
//     }

//     render() {
//         const { realmCountrys } = this.state;
//         let realmCountryList = realmCountrys.length > 0
//             && realmCountrys.map((item, i) => {
//                 return (
//                     <option key={i} value={item.realmCountryId}>
//                         {getLabelText(item.realm.label, this.state.lang) + " - " + getLabelText(item.country.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );
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
//                 text: 'All', value: this.state.selSource.length
//             }]
//         }
//         return (
//             <div className="animated">
//                 <AuthenticationServiceComponent history={this.props.history} />
//                 <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5>{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     {/* <CardHeader className="mb-md-3 pb-lg-1">
//                         <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>
//                         <div className="card-header-actions">

//                         </div>

//                     </CardHeader> */}
//                     {
//                         this.state.allowAdd &&
//                         < div className="Card-header-addicon">
//                             <div className="card-header-actions">
//                                 <div className="card-header-action">
//                                     {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_REALM_COUNTRY_PLANNING_UNIT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewEntity}><i className="fa fa-plus-square"></i></a>}
//                                 </div>
//                             </div>
//                         </div>
//                     }

//                     <CardBody className="">
//                         <Col md="3 pl-0">

//                             <FormGroup className="Selectdiv mt-md-2 mb-md-0">
//                                 <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.realmcountry')}</Label>
//                                 <div className="controls SelectGo">
//                                     <InputGroup>
//                                         <Input
//                                             type="select"
//                                             name="realmCountryId"
//                                             id="realmCountryId"
//                                             bsSize="sm"
//                                             onChange={this.filterData}
//                                         >
//                                             <option value="0">{i18n.t('static.common.select')}</option>
//                                             {realmCountryList}
//                                         </Input>
//                                         {/* <InputGroupAddon addonType="append">
//                                             <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
//                                         </InputGroupAddon> */}
//                                     </InputGroup>
//                                 </div>
//                             </FormGroup>

//                         </Col>
//                         <div id="tableDiv" className="jexcelremoveReadonlybackground ">
//                         </div>

//                     </CardBody>
//                 </Card>
//                 <div style={{ display: this.state.loading ? "block" : "none" }}>
//                     <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
//                         <div class="align-items-center">
//                             <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

//                             <div class="spinner-border blue ml-4" role="status">

//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div >
//         );
//     }

// }

//-------------------------------------------------

import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Button, Card, CardFooter, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmCountryService from '../../api/RealmCountryService';
import PlanningUnitService from "../../api/PlanningUnitService";
import UnitService from "../../api/UnitService";
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import moment from 'moment';
import ProgramService from '../../api/ProgramService';
import { MultiSelect } from "react-multi-select-component";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import CryptoJS from 'crypto-js';
import { SECRET_KEY, INDEXED_DB_NAME, INDEXED_DB_VERSION, DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_DECIMAL_NO_REGEX, JEXCEL_PRO_KEY, JEXCEL_DECIMAL_NO_REGEX_FOR_MULTIPLIER } from '../../Constants';
const entityname = i18n.t('static.dashboad.planningunitcountry');
export default class RealmCountryPlanningUnitList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            realmCountrys: [],
            realmCountryPlanningUnitList: [],
            message: '',
            selSource: [],
            loading: true,
            allowAdd: false,
            units: [],
            lang: localStorage.getItem('lang'),
            planningUnitCountry: {},
            planningUnits: [],
            realmCountryPlanningUnitId: '',
            realmCountry: {
                realmCountryId: '',
                country: {
                    countryId: '',
                    label: {
                        label_en: ''
                    }
                },
                realm: {
                    realmId: '',
                    label: {
                        label_en: ''
                    }
                }
            }, realmCountryName: '',
            label: {
                label_en: ''
            },
            skuCode: '',
            multiplier: '',
            rows: [],
            planningUnit: {
                planningUnitId: '',
                label: {
                    label_en: ''
                }
            },
            unit: {
                unitId: '',
                label: {
                    label_en: ''
                }
            }, isNew: true,
            updateRowStatus: 0,
            programs: [],
            offlinePrograms: [],
            programValues: [],
            programLabels: [],

        }
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.addNewEntity = this.addNewEntity.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);

        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkDuplicatePlanningUnit = this.checkDuplicatePlanningUnit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.changed = this.changed.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.handleChangeProgram = this.handleChangeProgram.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
    }

    cancelClicked() {
        // this.props.history.push(`/realmCountry/listRealmCountryPlanningUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    addRow = function () {
        // var json = this.el.getJson(null, false);
        // var data = [];
        // data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
        // data[1] = "";
        // data[2] = "";
        // data[3] = "";
        // data[4] = "";
        // data[5] = "";
        // data[6] = true;
        // data[7] = document.getElementById("realmCountryId").value;
        // data[8] = 0;
        // data[9] = 1;

        // this.el.insertRow(
        //     data, 0, 1
        // );

        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = '';//c
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = true;
        data[7] = '';//c
        data[8] = 0;
        data[9] = 1;
        data[10] = "";

        this.el.insertRow(
            data, 0, 1
        );
    };

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

        if (x == 5 && !isNaN(rowData[5]) && rowData[5].toString().indexOf('.') != -1) {
            console.log("RESP---------", parseFloat(rowData[5]));
            elInstance.setValueFromCoords(5, y, parseFloat(rowData[5]), true);
        }
        this.el.setValueFromCoords(9, y, 1, true);
    }

    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.jexcel).getValue(`I${parseInt(data[i].y) + 1}`, true);
                if (index == "" || index == null || index == undefined) {
                    // (instance.jexcel).setValueFromCoords(0, data[i].y, this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en, true);
                    // (instance.jexcel).setValueFromCoords(0, data[i].y, '', true);
                    (instance.jexcel).setValueFromCoords(6, data[i].y, true, true);
                    // (instance.jexcel).setValueFromCoords(7, data[i].y, document.getElementById("realmCountryId").value, true);
                    // (instance.jexcel).setValueFromCoords(7, data[i].y, '', true);
                    (instance.jexcel).setValueFromCoords(8, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(9, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }

    handleChangeProgram(programId) {
        programId = programId.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            programValues: programId.map(ele => ele),
            programLabels: programId.map(ele => ele.label),
            loading: true
        }, () => {
            console.log("VALUE--------->", this.state.programValues);
            this.filterData();
        })
    }

    formSubmit = function () {
        // var duplicateValidation = this.checkDuplicatePlanningUnit();
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState({
                loading: true
            })
            var tableJson = this.el.getJson(null, false);
            console.log("tableJson---", tableJson);
            let changedpapuList = [];
            var isMultiplierChanged = 0;
            for (var i = 0; i < tableJson.length; i++) {
                var value = this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", "");
                var map1 = new Map(Object.entries(tableJson[i]));
                var oldValue = map1.get("10")
                if (value != oldValue && map1.get("8") > 0) {
                    isMultiplierChanged = 1;
                }
                console.log("9 map---" + map1.get("9"))
                if (parseInt(map1.get("9")) === 1) {
                    let json = {
                        planningUnit: {
                            id: parseInt(map1.get("1"))
                        },
                        label: {
                            label_en: map1.get("2"),
                        },
                        skuCode: map1.get("3"),
                        unit: {
                            unitId: parseInt(map1.get("4"))
                        },
                        // multiplier: map1.get("5"),
                        multiplier: this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        active: map1.get("6"),
                        realmCountry: {
                            id: parseInt(map1.get("0"))
                        },
                        realmCountryPlanningUnitId: parseInt(map1.get("8"))
                    }
                    changedpapuList.push(json);
                }
            }
            var submitChanges = true;
            if (isMultiplierChanged) {
                var cf = window.confirm(i18n.t("static.realmCountryPlanningUnitList.warningMultiplierChange"));
                if (cf == true) {
                } else {
                    submitChanges = false;
                }
            }
            if (submitChanges) {
                console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
                RealmCountryService.editPlanningUnitCountry(changedpapuList)
                    .then(response => {
                        console.log(response.data);
                        if (response.status == "200") {
                            console.log(response);
                            this.filterData();
                            this.setState({
                                message: i18n.t(response.data.messageCode, { entityname }),
                                color: "green",
                                loading: false
                            },
                                () => {
                                    this.hideSecondComponent();
                                })
                            // this.props.history.push(`/realmCountry/listRealmCountry/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                        } else {
                            this.setState({
                                message: response.data.messageCode,
                                color: "#BA0C2F",
                                loading: false
                            },
                                () => {
                                    this.hideSecondComponent();
                                })
                        }

                    })
                    .catch(
                        error => {
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: 'static.unkownError',
                                    color: "#BA0C2F",
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
                                            message: error.response.data.messageCode,
                                            color: "#BA0C2F",
                                            loading: false
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: error.response.data.messageCode,
                                            color: "#BA0C2F",
                                            loading: false
                                        });
                                        break;
                                    default:
                                        this.setState({
                                            message: 'static.unkownError',
                                            color: "#BA0C2F",
                                            loading: false
                                        });
                                        break;
                                }
                            }
                        }
                    );
            } else {
                this.setState({
                    loading: false
                })
            }
        } else {
            console.log("Something went wrong");
        }
    }

    checkDuplicatePlanningUnit = function () {
        var tableJson = this.el.getJson(null, false);
        let count = 0;

        let tempArray = tableJson;
        console.log('hasDuplicate------', tempArray);

        var hasDuplicate = false;
        tempArray.map(v => parseInt(v[Object.keys(v)[1]])).sort().sort((a, b) => {
            if (a === b) hasDuplicate = true
        })
        console.log('hasDuplicate', hasDuplicate);
        if (hasDuplicate) {
            this.setState({
                message: i18n.t('static.country.duplicatePlanningUnit'),
                color: "#BA0C2F",
                changedFlag: 0,

            },
                () => {
                    this.hideSecondComponent();
                })
            return false;
        } else {
            return true;
        }
    }

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(9, y);
            if (parseInt(value) == 1) {

                //Country
                var col = ("A").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(0, y);
                console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //Planning Unit
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //Country Planning Unit
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //Sku Code
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(3, y);
                var reg = /^[a-zA-Z0-9\b]+$/;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    // if (!(reg.test(value))) {
                    //     this.el.setStyle(col, "background-color", "transparent");
                    //     this.el.setStyle(col, "background-color", "yellow");
                    //     this.el.setComments(col, i18n.t('static.message.skucodevalid'));
                    // } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    // }
                }

                // Unit
                var col = ("E").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(4, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //Multiplier
                // var col = ("F").concat(parseInt(y) + 1);
                // var value = this.el.getValueFromCoords(5, y);
                // // var reg = /^[0-9\b]+$/;
                // var reg = /^\s*(?=.*[1-9])\d{1,10}(?:\.\d{1,2})?\s*$/;
                // // console.log("---------VAL----------", value);
                // if (value == "" || isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     valid = false;
                //     if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                //         this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                //     }
                //     else {
                //         this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                //     }
                // } else {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setComments(col, "");
                // }

                var col = ("F").concat(parseInt(y) + 1);
                // var value = this.el.getValueFromCoords(5, y);
                var value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_NO_REGEX_FOR_MULTIPLIER;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }



            }
        }
        return valid;
    }

    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {

        //Country
        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                // this.el.setValueFromCoords(2, y, value, true);
                // var text = this.el.getValueFromCoords(1, y);
                // var text = this.el.getValue(`B${parseInt(y) + 1}`, true)
                // console.log("TEXT-------->", text);
                // this.el.setVaslueFromCoords(2, y, text, true);
            }
        }

        //Planning Unit
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                // this.el.setValueFromCoords(2, y, value, true);
                // var text = this.el.getValueFromCoords(1, y);
                var text = this.el.getValue(`B${parseInt(y) + 1}`, true)
                console.log("TEXT-------->", text);
                // this.el.setVaslueFromCoords(2, y, text, true);
            }
        }

        //Country sku code
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            // var value = this.el.getValueFromCoords(2, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }


        //Sku code
        if (x == 3) {
            console.log("-----------------3--------------------");
            var col = ("D").concat(parseInt(y) + 1);
            // var value = this.el.getValueFromCoords(3, y);
            // var reg = /^[a-zA-Z0-9\b]+$/;
            if (value == "") {
                console.log("-----------------blank--------------------");
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
            else {
                console.log("-----------------3--------------------");
                // if (!(reg.test(value))) {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     this.el.setComments(col, i18n.t('static.message.skucodevalid'));
                // } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                // }
            }
        }

        //Unit
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        //Multiplier
        // if (x == 5) {
        //     var col = ("F").concat(parseInt(y) + 1);
        //     var reg = /^[0-9\b]+$/;
        //     if (value == "" || isNaN(parseInt(value)) || !(reg.test(value))) {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, i18n.t('static.message.invalidnumber'));
        //     }
        //     else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }
        // }

        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_DECIMAL_NO_REGEX_FOR_MULTIPLIER;
            if (this.el.getValueFromCoords(x, y) != "") {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
        }


        //Active
        if (x != 9) {
            this.el.setValueFromCoords(9, y, 1, true);
        }



    }.bind(this);
    // -----end of changed function


    addNewEntity() {
        let realmCountryId = document.getElementById("realmCountryId").value;
        if (realmCountryId != 0) {
            this.props.history.push({
                pathname: `/realmCountry/realmCountryPlanningUnit/${realmCountryId}`,
            })
        }
    }

    buildJexcel() {
        const { planningUnits } = this.state;
        const { units } = this.state;
        const { realmCountrys } = this.state;

        let planningUnitArr = [];
        let unitArr = [];
        let realmCountryArr = [];

        if (realmCountrys.length > 0) {
            for (var i = 0; i < realmCountrys.length; i++) {
                var paJson = {
                    name: getLabelText(realmCountrys[i].country.label, this.state.lang),
                    id: parseInt(realmCountrys[i].realmCountryId)
                }
                realmCountryArr[i] = paJson
            }
        }

        if (planningUnits.length > 0) {
            for (var i = 0; i < planningUnits.length; i++) {
                var paJson = {
                    name: getLabelText(planningUnits[i].label, this.state.lang),
                    id: parseInt(planningUnits[i].id)
                }
                planningUnitArr[i] = paJson
            }
        }
        if (units.length > 0) {
            for (var i = 0; i < units.length; i++) {
                var paJson = {
                    name: getLabelText(units[i].label, this.state.lang),
                    id: parseInt(units[i].unitId)
                }
                unitArr[i] = paJson
            }
        }

        // Jexcel starts
        var papuList = this.state.rows;
        var data = [];
        var papuDataArr = [];

        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {

                // data = [];
                // data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
                // data[1] = parseInt(papuList[j].planningUnit.id);
                // data[2] = papuList[j].label.label_en;
                // data[3] = papuList[j].skuCode;
                // data[4] = parseInt(papuList[j].unit.unitId);
                // data[5] = papuList[j].multiplier;
                // data[6] = papuList[j].active;
                // data[7] = papuList[j].realmCountry.id;
                // data[8] = papuList[j].realmCountryPlanningUnitId;
                // data[9] = 0;
                // papuDataArr[count] = data;
                // count++;

                data = [];
                data[0] = parseInt(papuList[j].realmCountry.id);
                data[1] = parseInt(papuList[j].planningUnit.id);
                data[2] = papuList[j].label.label_en;
                data[3] = papuList[j].skuCode;
                data[4] = parseInt(papuList[j].unit.unitId);
                data[5] = papuList[j].multiplier;
                data[6] = papuList[j].active;
                data[7] = papuList[j].realmCountry.id;
                data[8] = papuList[j].realmCountryPlanningUnitId;
                data[9] = 0;
                data[10] = papuList[j].multiplier;
                papuDataArr[count] = data;
                count++;
            }
        }
        if (papuDataArr.length == 0) {
            // data = [];
            // data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
            // data[1] = "";
            // data[2] = "";
            // data[3] = "";
            // data[4] = "";
            // data[5] = "";
            // data[6] = true;
            // data[7] = realmCountryId;
            // data[8] = 0;
            // data[9] = 1;
            // papuDataArr[0] = data;

            data = [];
            data[0] = '';//c
            data[1] = "";
            data[2] = "";
            data[3] = "";
            data[4] = "";
            data[5] = "";
            data[6] = true;
            data[7] = '';//c
            data[8] = 0;
            data[9] = 1;
            data[10] = "";
            papuDataArr[0] = data;
        }


        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = papuDataArr;
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100, 100, 100],
            columns: [

                {
                    title: i18n.t('static.dashboard.realmcountry'),
                    // type: 'text',
                    // readOnly: true
                    type: 'autocomplete',
                    source: realmCountryArr
                },
                {
                    title: i18n.t('static.planningunit.planningunit'),
                    type: 'autocomplete',
                    source: planningUnitArr

                },
                {
                    title: i18n.t('static.planningunit.countrysku'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.procurementAgentProcurementUnit.skuCode'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.unit.unit'),
                    type: 'autocomplete',
                    source: unitArr
                },
                {
                    title: i18n.t('static.unit.multiplierFromARUTOPU'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##.000000',
                    disabledMaskOnEdition: true

                },

                {
                    title: i18n.t('static.checkbox.active'),
                    type: 'checkbox'
                },
                {
                    title: 'realmCountryId',
                    type: 'hidden'
                },
                {
                    title: 'realmCountryPlanningUnitId',
                    type: 'hidden'
                },
                {
                    title: 'isChange',
                    type: 'hidden'
                },
                {
                    title: 'multiplier',
                    type: 'hidden'
                }

            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el.jexcel;
                var rowData = elInstance.getRowData(y);
                var realmCountryPlanningUnitId = rowData[8];
                if (realmCountryPlanningUnitId == 0) {
                    var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                    var cellA = elInstance.getCell(`A${parseInt(y) + 1}`)
                    cell.classList.remove('readonly');
                    cellA.classList.remove('readonly');
                } else {
                    var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                    var cellA = elInstance.getCell(`A${parseInt(y) + 1}`)
                    cell.classList.add('readonly');
                    cellA.classList.add('readonly');
                }

            },
            onsearch: function (el) {
                el.jexcel.updateTable();
            },
            onfilter: function (el) {
                el.jexcel.updateTable();
            },
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            onchange: this.changed,
            onblur: this.blur,
            onfocus: this.focus,
            // oneditionend: this.onedit,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            onpaste: this.onPaste,
            oneditionend: this.oneditionend,
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            filters: true,
            license: JEXCEL_PRO_KEY,
            onload: this.loaded,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                //Add consumption batch info


                if (y == null) {
                    // Insert a new column
                    if (obj.options.allowInsertColumn == true) {
                        items.push({
                            title: obj.options.text.insertANewColumnBefore,
                            onclick: function () {
                                obj.insertColumn(1, parseInt(x), 1);
                            }
                        });
                    }

                    if (obj.options.allowInsertColumn == true) {
                        items.push({
                            title: obj.options.text.insertANewColumnAfter,
                            onclick: function () {
                                obj.insertColumn(1, parseInt(x), 0);
                            }
                        });
                    }

                    // Delete a column
                    // if (obj.options.allowDeleteColumn == true) {
                    //     items.push({
                    //         title: obj.options.text.deleteSelectedColumns,
                    //         onclick: function () {
                    //             obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
                    //         }
                    //     });
                    // }

                    // Rename column
                    // if (obj.options.allowRenameColumn == true) {
                    //     items.push({
                    //         title: obj.options.text.renameThisColumn,
                    //         onclick: function () {
                    //             obj.setHeader(x);
                    //         }
                    //     });
                    // }

                    // Sorting
                    if (obj.options.columnSorting == true) {
                        // Line
                        items.push({ type: 'line' });

                        items.push({
                            title: obj.options.text.orderAscending,
                            onclick: function () {
                                obj.orderBy(x, 0);
                            }
                        });
                        items.push({
                            title: obj.options.text.orderDescending,
                            onclick: function () {
                                obj.orderBy(x, 1);
                            }
                        });
                    }
                } else {
                    // Insert new row before
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.common.insertNewRowBefore'),
                            onclick: function () {
                                // var data = [];
                                // data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
                                // data[1] = "";
                                // data[2] = "";
                                // data[3] = "";
                                // data[4] = "";
                                // data[5] = "";
                                // data[6] = true;
                                // data[7] = realmCountryId;
                                // data[8] = 0;
                                // data[9] = 1;
                                // obj.insertRow(data, parseInt(y), 1);

                                var data = [];
                                data[0] = '';//c
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = "";
                                data[5] = "";
                                data[6] = true;
                                data[7] = '';//c
                                data[8] = 0;
                                data[9] = 1;
                                data[10] = "";
                                obj.insertRow(data, parseInt(y), 1);
                            }.bind(this)
                        });
                    }
                    // after
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.common.insertNewRowAfter'),
                            onclick: function () {
                                // var data = [];
                                // data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
                                // data[1] = "";
                                // data[2] = "";
                                // data[3] = "";
                                // data[4] = "";
                                // data[5] = "";
                                // data[6] = true;
                                // data[7] = realmCountryId;
                                // data[8] = 0;
                                // data[9] = 1;
                                // obj.insertRow(data, parseInt(y));

                                var data = [];
                                data[0] = '';//c
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = "";
                                data[5] = "";
                                data[6] = true;
                                data[7] = '';//c
                                data[8] = 0;
                                data[9] = 1;
                                data[10] = "";
                                obj.insertRow(data, parseInt(y));
                            }.bind(this)
                        });
                    }
                    // Delete a row
                    if (obj.options.allowDeleteRow == true) {
                        // region id
                        if (obj.getRowData(y)[8] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                }
                            });
                        }
                    }

                    if (x) {
                        // if (obj.options.allowComments == true) {
                        //     items.push({ type: 'line' });

                        //     var title = obj.records[y][x].getAttribute('title') || '';

                        //     items.push({
                        //         title: title ? obj.options.text.editComments : obj.options.text.addComments,
                        //         onclick: function () {
                        //             obj.setComments([x, y], prompt(obj.options.text.comments, title));
                        //         }
                        //     });

                        //     if (title) {
                        //         items.push({
                        //             title: obj.options.text.clearComments,
                        //             onclick: function () {
                        //                 obj.setComments([x, y], '');
                        //             }
                        //         });
                        //     }
                        // }
                    }
                }

                // Line
                items.push({ type: 'line' });

                // // Save
                // if (obj.options.allowExport) {
                //     items.push({
                //         title: i18n.t('static.supplyPlan.exportAsCsv'),
                //         shortcut: 'Ctrl + S',
                //         onclick: function () {
                //             obj.download(true);
                //         }
                //     });
                // }

                return items;
            }.bind(this)
        };

        this.el = jexcel(document.getElementById("tableDiv"), options);
        this.setState({
            loading: false
        })
    }

    filterData() {

        if (this.state.programValues.length > 0) {
            console.log("VALUE--------->IF");
            // let programIds = this.state.programValues.length == this.state.programs.length ? [] : this.state.programValues.map(ele => (ele.value).toString());
            let programIds = this.state.programValues.map(ele => (ele.value).toString());
            console.log("RESP--->", programIds);
            const { programs } = this.state;
            let realmCountryList = [];
            for (var i = 0; i < programIds.length; i++) {
                for (var j = 0; j < programs.length; j++) {
                    if (programIds[i] == programs[j].programId) {
                        let json = {
                            realmCountryId: programs[j].realmCountry.realmCountryId,
                            country: programs[j].realmCountry.country,
                            realm: programs[j].realmCountry.realm
                        }
                        realmCountryList.push(json);
                    }
                }
            }
            
            if (realmCountryList.length != 0) {
                realmCountryList.sort((a, b) => {
                    var itemLabelA = getLabelText(a.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                                    
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
            }


            console.log("REALM-COUNTRY--->1", realmCountryList);
            const realmCountrys = [...new Map(realmCountryList.map(item => [item.realmCountryId, item])).values()]
            console.log("REALM-COUNTRY--->2", realmCountrys);

            RealmCountryService.getRealmCountryPlanningUnitByProgramId(programIds)
                .then(response1 => {
                    console.log("RESP--->1", response1.data);
                    UnitService.getUnitListAll()
                        .then(response2 => {
                            console.log("RESP--->2", response2.data);
                            // PlanningUnitService.getActivePlanningUnitList()
                            PlanningUnitService.getPlanningUnitByProgramIds(programIds)
                                .then(response3 => {
                                    console.log("RESP--->3", response3.data);
                                    this.setState({
                                        rows: response1.data,
                                        units: response2.data.sort((a, b) => {
                                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                            return itemLabelA > itemLabelB ? 1 : -1;
                                        }),
                                        planningUnits: response3.data.sort((a, b) => {
                                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                            return itemLabelA > itemLabelB ? 1 : -1;
                                        }),
                                        allowAdd: true,
                                        realmCountrys
                                    }, () => {
                                        this.buildJexcel();
                                    })
                                }).catch(
                                    error => {
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
                                                        message: error.response.data.messageCode,
                                                        loading: false
                                                    });
                                                    break;
                                                case 412:
                                                    this.setState({
                                                        message: error.response.data.messageCode,
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
                        }).catch(
                            error => {
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
                                                message: error.response.data.messageCode,
                                                loading: false
                                            });
                                            break;
                                        case 412:
                                            this.setState({
                                                message: error.response.data.messageCode,
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
                }).catch(
                    error => {
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
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
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
        } else {
            console.log("VALUE--------->ELSE");
            this.setState({
                allowAdd: false,
                loading: false
            }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
            })

        }



        // let realmCountryId = document.getElementById("realmCountryId").value;
        // console.log("realmCountryId--------", realmCountryId);
        // if (realmCountryId != 0) {
        //     this.setState({ loading: true, allowAdd: true });
        //     RealmCountryService.getPlanningUnitCountryForId(realmCountryId).then(response => {
        //         if (response.status == 200) {
        //             let myResponse = response.data;
        //             // if (myResponse.length > 0) {
        //             this.setState({ rows: myResponse });
        //             // }
        //             RealmCountryService.getRealmCountryById(realmCountryId).then(response => {
        //                 if (response.status == 200) {
        //                     this.setState({
        //                         realmCountry: response.data
        //                     })
        //                     UnitService.getUnitListAll()
        //                         .then(response => {
        //                             if (response.status == 200) {
        //                                 this.setState({
        //                                     units: response.data
        //                                 })
        //                                 // PlanningUnitService.getAllPlanningUnitList()
        //                                 PlanningUnitService.getActivePlanningUnitList()
        //                                     .then(response => {
        //                                         if (response.status == 200) {
        //                                             this.setState({
        //                                                 planningUnits: response.data
        //                                             })
        //                                         }
        //                                         const { planningUnits } = this.state;
        //                                         const { units } = this.state;

        //                                         let planningUnitArr = [];
        //                                         let unitArr = [];

        //                                         if (planningUnits.length > 0) {
        //                                             for (var i = 0; i < planningUnits.length; i++) {
        //                                                 var paJson = {
        //                                                     name: getLabelText(planningUnits[i].label, this.state.lang),
        //                                                     id: parseInt(planningUnits[i].planningUnitId)
        //                                                 }
        //                                                 planningUnitArr[i] = paJson
        //                                             }
        //                                         }
        //                                         if (units.length > 0) {
        //                                             for (var i = 0; i < units.length; i++) {
        //                                                 var paJson = {
        //                                                     name: getLabelText(units[i].label, this.state.lang),
        //                                                     id: parseInt(units[i].unitId)
        //                                                 }
        //                                                 unitArr[i] = paJson
        //                                             }
        //                                         }

        //                                         // Jexcel starts
        //                                         var papuList = this.state.rows;
        //                                         var data = [];
        //                                         var papuDataArr = [];

        //                                         var count = 0;
        //                                         if (papuList.length != 0) {
        //                                             for (var j = 0; j < papuList.length; j++) {

        //                                                 data = [];
        //                                                 data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
        //                                                 data[1] = parseInt(papuList[j].planningUnit.id);
        //                                                 data[2] = papuList[j].label.label_en;
        //                                                 data[3] = papuList[j].skuCode;
        //                                                 data[4] = parseInt(papuList[j].unit.unitId);
        //                                                 data[5] = papuList[j].multiplier;
        //                                                 data[6] = papuList[j].active;
        //                                                 data[7] = realmCountryId;
        //                                                 data[8] = papuList[j].realmCountryPlanningUnitId;
        //                                                 data[9] = 0;
        //                                                 papuDataArr[count] = data;
        //                                                 count++;
        //                                             }
        //                                         }
        //                                         if (papuDataArr.length == 0) {
        //                                             data = [];
        //                                             data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
        //                                             data[1] = "";
        //                                             data[2] = "";
        //                                             data[3] = "";
        //                                             data[4] = "";
        //                                             data[5] = "";
        //                                             data[6] = true;
        //                                             data[7] = realmCountryId;
        //                                             data[8] = 0;
        //                                             data[9] = 1;
        //                                             papuDataArr[0] = data;
        //                                         }


        //                                         this.el = jexcel(document.getElementById("tableDiv"), '');
        //                                         this.el.destroy();
        //                                         var json = [];
        //                                         var data = papuDataArr;
        //                                         var options = {
        //                                             data: data,
        //                                             columnDrag: true,
        //                                             colWidths: [100, 100, 100, 100, 100, 100, 100],
        //                                             columns: [

        //                                                 {
        //                                                     title: i18n.t('static.dashboard.realmcountry'),
        //                                                     type: 'text',
        //                                                     readOnly: true
        //                                                 },
        //                                                 {
        //                                                     title: i18n.t('static.planningunit.planningunit'),
        //                                                     type: 'autocomplete',
        //                                                     source: planningUnitArr

        //                                                 },
        //                                                 {
        //                                                     title: i18n.t('static.planningunit.countrysku'),
        //                                                     type: 'text',
        //                                                 },
        //                                                 {
        //                                                     title: i18n.t('static.procurementAgentProcurementUnit.skuCode'),
        //                                                     type: 'text',
        //                                                 },
        //                                                 {
        //                                                     title: i18n.t('static.unit.unit'),
        //                                                     type: 'autocomplete',
        //                                                     source: unitArr
        //                                                 },
        //                                                 {
        //                                                     title: i18n.t('static.unit.multiplierFromARUTOPU'),
        //                                                     type: 'numeric',
        //                                                     textEditor: true,
        //                                                     decimal: '.',
        //                                                     mask: '#,##.000000',
        //                                                     disabledMaskOnEdition: true

        //                                                 },

        //                                                 {
        //                                                     title: i18n.t('static.checkbox.active'),
        //                                                     type: 'checkbox'
        //                                                 },
        //                                                 {
        //                                                     title: 'realmCountryId',
        //                                                     type: 'hidden'
        //                                                 },
        //                                                 {
        //                                                     title: 'realmCountryPlanningUnitId',
        //                                                     type: 'hidden'
        //                                                 },
        //                                                 {
        //                                                     title: 'isChange',
        //                                                     type: 'hidden'
        //                                                 }

        //                                             ],
        //                                             updateTable: function (el, cell, x, y, source, value, id) {
        //                                                 var elInstance = el.jexcel;
        //                                                 var rowData = elInstance.getRowData(y);
        //                                                 var realmCountryPlanningUnitId = rowData[8];
        //                                                 if (realmCountryPlanningUnitId == 0) {
        //                                                     var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
        //                                                     cell.classList.remove('readonly');
        //                                                 } else {
        //                                                     var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
        //                                                     cell.classList.add('readonly');
        //                                                 }

        //                                             },
        //                                             onsearch: function (el) {
        //                                                 el.jexcel.updateTable();
        //                                             },
        //                                             onfilter: function (el) {
        //                                                 el.jexcel.updateTable();
        //                                             },
        //                                             pagination: localStorage.getItem("sesRecordCount"),
        //                                             filters: true,
        //                                             search: true,
        //                                             columnSorting: true,
        //                                             tableOverflow: true,
        //                                             wordWrap: true,
        //                                             paginationOptions: JEXCEL_PAGINATION_OPTION,
        //                                             position: 'top',
        //                                             allowInsertColumn: false,
        //                                             allowManualInsertColumn: false,
        //                                             allowDeleteRow: true,
        //                                             onchange: this.changed,
        //                                             onblur: this.blur,
        //                                             onfocus: this.focus,
        //                                             oneditionend: this.onedit,
        //                                             copyCompatibility: true,
        //                                             allowManualInsertRow: false,
        //                                             parseFormulas: true,
        //                                             onpaste: this.onPaste,
        //                                             text: {
        //                                                 // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
        //                                                 showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        //                                                 show: '',
        //                                                 entries: '',
        //                                             },
        //                                             filters: true,
        //                                             license: JEXCEL_PRO_KEY,
        //                                             onload: this.loaded,
        //                                             license: JEXCEL_PRO_KEY,
        //                                             contextMenu: function (obj, x, y, e) {
        //                                                 var items = [];
        //                                                 //Add consumption batch info


        //                                                 if (y == null) {
        //                                                     // Insert a new column
        //                                                     if (obj.options.allowInsertColumn == true) {
        //                                                         items.push({
        //                                                             title: obj.options.text.insertANewColumnBefore,
        //                                                             onclick: function () {
        //                                                                 obj.insertColumn(1, parseInt(x), 1);
        //                                                             }
        //                                                         });
        //                                                     }

        //                                                     if (obj.options.allowInsertColumn == true) {
        //                                                         items.push({
        //                                                             title: obj.options.text.insertANewColumnAfter,
        //                                                             onclick: function () {
        //                                                                 obj.insertColumn(1, parseInt(x), 0);
        //                                                             }
        //                                                         });
        //                                                     }

        //                                                     // Delete a column
        //                                                     // if (obj.options.allowDeleteColumn == true) {
        //                                                     //     items.push({
        //                                                     //         title: obj.options.text.deleteSelectedColumns,
        //                                                     //         onclick: function () {
        //                                                     //             obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
        //                                                     //         }
        //                                                     //     });
        //                                                     // }

        //                                                     // Rename column
        //                                                     // if (obj.options.allowRenameColumn == true) {
        //                                                     //     items.push({
        //                                                     //         title: obj.options.text.renameThisColumn,
        //                                                     //         onclick: function () {
        //                                                     //             obj.setHeader(x);
        //                                                     //         }
        //                                                     //     });
        //                                                     // }

        //                                                     // Sorting
        //                                                     if (obj.options.columnSorting == true) {
        //                                                         // Line
        //                                                         items.push({ type: 'line' });

        //                                                         items.push({
        //                                                             title: obj.options.text.orderAscending,
        //                                                             onclick: function () {
        //                                                                 obj.orderBy(x, 0);
        //                                                             }
        //                                                         });
        //                                                         items.push({
        //                                                             title: obj.options.text.orderDescending,
        //                                                             onclick: function () {
        //                                                                 obj.orderBy(x, 1);
        //                                                             }
        //                                                         });
        //                                                     }
        //                                                 } else {
        //                                                     // Insert new row before
        //                                                     if (obj.options.allowInsertRow == true) {
        //                                                         items.push({
        //                                                             title: i18n.t('static.common.insertNewRowBefore'),
        //                                                             onclick: function () {
        //                                                                 var data = [];
        //                                                                 data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
        //                                                                 data[1] = "";
        //                                                                 data[2] = "";
        //                                                                 data[3] = "";
        //                                                                 data[4] = "";
        //                                                                 data[5] = "";
        //                                                                 data[6] = true;
        //                                                                 data[7] = realmCountryId;
        //                                                                 data[8] = 0;
        //                                                                 data[9] = 1;
        //                                                                 obj.insertRow(data, parseInt(y), 1);
        //                                                             }.bind(this)
        //                                                         });
        //                                                     }
        //                                                     // after
        //                                                     if (obj.options.allowInsertRow == true) {
        //                                                         items.push({
        //                                                             title: i18n.t('static.common.insertNewRowAfter'),
        //                                                             onclick: function () {
        //                                                                 var data = [];
        //                                                                 data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
        //                                                                 data[1] = "";
        //                                                                 data[2] = "";
        //                                                                 data[3] = "";
        //                                                                 data[4] = "";
        //                                                                 data[5] = "";
        //                                                                 data[6] = true;
        //                                                                 data[7] = realmCountryId;
        //                                                                 data[8] = 0;
        //                                                                 data[9] = 1;
        //                                                                 obj.insertRow(data, parseInt(y));
        //                                                             }.bind(this)
        //                                                         });
        //                                                     }
        //                                                     // Delete a row
        //                                                     if (obj.options.allowDeleteRow == true) {
        //                                                         // region id
        //                                                         if (obj.getRowData(y)[8] == 0) {
        //                                                             items.push({
        //                                                                 title: i18n.t("static.common.deleterow"),
        //                                                                 onclick: function () {
        //                                                                     obj.deleteRow(parseInt(y));
        //                                                                 }
        //                                                             });
        //                                                         }
        //                                                     }

        //                                                     if (x) {
        //                                                         // if (obj.options.allowComments == true) {
        //                                                         //     items.push({ type: 'line' });

        //                                                         //     var title = obj.records[y][x].getAttribute('title') || '';

        //                                                         //     items.push({
        //                                                         //         title: title ? obj.options.text.editComments : obj.options.text.addComments,
        //                                                         //         onclick: function () {
        //                                                         //             obj.setComments([x, y], prompt(obj.options.text.comments, title));
        //                                                         //         }
        //                                                         //     });

        //                                                         //     if (title) {
        //                                                         //         items.push({
        //                                                         //             title: obj.options.text.clearComments,
        //                                                         //             onclick: function () {
        //                                                         //                 obj.setComments([x, y], '');
        //                                                         //             }
        //                                                         //         });
        //                                                         //     }
        //                                                         // }
        //                                                     }
        //                                                 }

        //                                                 // Line
        //                                                 items.push({ type: 'line' });

        //                                                 // // Save
        //                                                 // if (obj.options.allowExport) {
        //                                                 //     items.push({
        //                                                 //         title: i18n.t('static.supplyPlan.exportAsCsv'),
        //                                                 //         shortcut: 'Ctrl + S',
        //                                                 //         onclick: function () {
        //                                                 //             obj.download(true);
        //                                                 //         }
        //                                                 //     });
        //                                                 // }

        //                                                 return items;
        //                                             }.bind(this)
        //                                         };

        //                                         this.el = jexcel(document.getElementById("tableDiv"), options);
        //                                         this.setState({
        //                                             loading: false
        //                                         })



        //                                     })
        //                                     .catch(
        //                                         error => {
        //                                             if (error.message === "Network Error") {
        //                                                 this.setState({
        //                                                     message: 'static.unkownError',
        //                                                     color: "red",
        //                                                     loading: false
        //                                                 });
        //                                             } else {
        //                                                 switch (error.response ? error.response.status : "") {

        //                                                     case 401:
        //                                                         this.props.history.push(`/login/static.message.sessionExpired`)
        //                                                         break;
        //                                                     case 403:
        //                                                         this.props.history.push(`/accessDenied`)
        //                                                         break;
        //                                                     case 500:
        //                                                     case 404:
        //                                                     case 406:
        //                                                         this.setState({
        //                                                             message: error.response.data.messageCode,
        //                                                             color: "red",
        //                                                             loading: false
        //                                                         });
        //                                                         break;
        //                                                     case 412:
        //                                                         this.setState({
        //                                                             message: error.response.data.messageCode,
        //                                                             color: "red",
        //                                                             loading: false
        //                                                         });
        //                                                         break;
        //                                                     default:
        //                                                         this.setState({
        //                                                             message: 'static.unkownError',
        //                                                             color: "red",
        //                                                             loading: false
        //                                                         });
        //                                                         break;
        //                                                 }
        //                                             }
        //                                         }
        //                                     );
        //                             } else {
        //                                 this.setState({
        //                                     message: response.data.messageCode,
        //                                     color: "red",
        //                                 },
        //                                     () => {
        //                                         this.hideSecondComponent();
        //                                     })
        //                             }

        //                         })
        //                         .catch(
        //                             error => {
        //                                 if (error.message === "Network Error") {
        //                                     this.setState({
        //                                         message: 'static.unkownError',
        //                                         color: "red",
        //                                         loading: false
        //                                     });
        //                                 } else {
        //                                     switch (error.response ? error.response.status : "") {

        //                                         case 401:
        //                                             this.props.history.push(`/login/static.message.sessionExpired`)
        //                                             break;
        //                                         case 403:
        //                                             this.props.history.push(`/accessDenied`)
        //                                             break;
        //                                         case 500:
        //                                         case 404:
        //                                         case 406:
        //                                             this.setState({
        //                                                 message: error.response.data.messageCode,
        //                                                 color: "red",
        //                                                 loading: false
        //                                             });
        //                                             break;
        //                                         case 412:
        //                                             this.setState({
        //                                                 message: error.response.data.messageCode,
        //                                                 color: "red",
        //                                                 loading: false
        //                                             });
        //                                             break;
        //                                         default:
        //                                             this.setState({
        //                                                 message: 'static.unkownError',
        //                                                 color: "red",
        //                                                 loading: false
        //                                             });
        //                                             break;
        //                                     }
        //                                 }
        //                             }
        //                         );
        //                 } else {
        //                     this.setState({
        //                         message: response.data.messageCode,
        //                         color: "red",
        //                     },
        //                         () => {
        //                             this.hideSecondComponent();
        //                         })
        //                 }

        //             })
        //                 .catch(
        //                     error => {
        //                         if (error.message === "Network Error") {
        //                             this.setState({
        //                                 message: 'static.unkownError',
        //                                 color: "red",
        //                                 loading: false
        //                             });
        //                         } else {
        //                             switch (error.response ? error.response.status : "") {

        //                                 case 401:
        //                                     this.props.history.push(`/login/static.message.sessionExpired`)
        //                                     break;
        //                                 case 403:
        //                                     this.props.history.push(`/accessDenied`)
        //                                     break;
        //                                 case 500:
        //                                 case 404:
        //                                 case 406:
        //                                     this.setState({
        //                                         message: error.response.data.messageCode,
        //                                         color: "red",
        //                                         loading: false
        //                                     });
        //                                     break;
        //                                 case 412:
        //                                     this.setState({
        //                                         message: error.response.data.messageCode,
        //                                         color: "red",
        //                                         loading: false
        //                                     });
        //                                     break;
        //                                 default:
        //                                     this.setState({
        //                                         message: 'static.unkownError',
        //                                         color: "red",
        //                                         loading: false
        //                                     });
        //                                     break;
        //                             }
        //                         }
        //                     }
        //                 );
        //         }
        //         else {
        //             this.setState({
        //                 message: response.data.messageCode,
        //                 color: "red",
        //             },
        //                 () => {
        //                     this.hideSecondComponent();
        //                 })
        //         }

        //     })
        //         .catch(
        //             error => {
        //                 if (error.message === "Network Error") {
        //                     this.setState({
        //                         message: 'static.unkownError',
        //                         color: "red",
        //                         loading: false
        //                     });
        //                 } else {
        //                     switch (error.response ? error.response.status : "") {

        //                         case 401:
        //                             this.props.history.push(`/login/static.message.sessionExpired`)
        //                             break;
        //                         case 403:
        //                             this.props.history.push(`/accessDenied`)
        //                             break;
        //                         case 500:
        //                         case 404:
        //                         case 406:
        //                             this.setState({
        //                                 message: error.response.data.messageCode,
        //                                 color: "red",
        //                                 loading: false
        //                             });
        //                             break;
        //                         case 412:
        //                             this.setState({
        //                                 message: error.response.data.messageCode,
        //                                 color: "red",
        //                                 loading: false
        //                             });
        //                             break;
        //                         default:
        //                             this.setState({
        //                                 message: 'static.unkownError',
        //                                 color: "red",
        //                                 loading: false
        //                             });
        //                             break;
        //                     }
        //                 }
        //             }
        //         );
        // } else {
        //     this.setState({
        //         allowAdd: false
        //     });
        //     this.el = jexcel(document.getElementById("tableDiv"), '');
        //     this.el.destroy();
        // }
    }
    loaded = function (instance, cell, x, y, value) {
        // jExcelLoadedFunction(instance);
        // var asterisk = document.getElementsByClassName("resizable")[0];
        // var tr = asterisk.firstChild;
        // tr.children[7].title = i18n.t("static.message.tooltipMultiplier")
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[6].title = i18n.t("static.message.tooltipMultiplier")
    }

    blur = function (instance) {
        console.log('on blur called');
    }

    focus = function (instance) {
        console.log('on focus called');
    }

    onedit = function (instance, cell, x, y, value) {
        console.log("------------onedit called")
        this.el.setValueFromCoords(9, y, 1, true);
    }.bind(this);


    componentDidMount() {

        // let realmId = AuthenticationService.getRealmId();
        // RealmCountryService.getRealmCountryrealmIdById(realmId)
        //     .then(response => {
        //         console.log("RealmCountryService---->", response.data)
        //         if (response.status == 200) {
        //             this.setState({
        //                 realmCountrys: (response.data).filter(c => c.active == true), loading: false
        //             },
        //                 () => {
        //                     // this.buildJexcel()
        //                     // this.filterData()
        //                 })
        //         } else {
        //             this.setState({ message: response.data.messageCode, color: "red", loading: false })
        //         }
        //     })
        //     .catch(
        //         error => {
        //             if (error.message === "Network Error") {
        //                 this.setState({
        //                     message: 'static.unkownError',
        //                     color: "red",
        //                     loading: false
        //                 });
        //             } else {
        //                 switch (error.response ? error.response.status : "") {

        //                     case 401:
        //                         this.props.history.push(`/login/static.message.sessionExpired`)
        //                         break;
        //                     case 403:
        //                         this.props.history.push(`/accessDenied`)
        //                         break;
        //                     case 500:
        //                     case 404:
        //                     case 406:
        //                         this.setState({
        //                             message: error.response.data.messageCode,
        //                             color: "red",
        //                             loading: false
        //                         });
        //                         break;
        //                     case 412:
        //                         this.setState({
        //                             message: error.response.data.messageCode,
        //                             color: "red",
        //                             loading: false
        //                         });
        //                         break;
        //                     default:
        //                         this.setState({
        //                             message: 'static.unkownError',
        //                             color: "red",
        //                             loading: false
        //                         });
        //                         break;
        //                 }
        //             }
        //         }
        //     );

        this.getPrograms();
    }

    getPrograms = () => {
        ProgramService.getProgramList()
            .then(response => {
                // console.log(JSON.stringify(response.data))
                console.log("Program----->", response.data);
                this.setState({
                    programs: response.data, loading: false
                })
            }).catch(
                error => {
                    this.setState({
                        programs: [], loading: false
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

    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    render() {
        const { realmCountrys } = this.state;
        let realmCountryList = realmCountrys.length > 0
            && realmCountrys.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {getLabelText(item.realm.label, this.state.lang) + " - " + getLabelText(item.country.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { programs } = this.state;
        let programList = programs.length > 0 && programs.map((item, i) => {
            return ({ label: getLabelText(item.label, this.state.lang), value: item.programId })
        }, this);

        // const { programLst } = this.state;
        // let programList = [];
        // programList = programLst.length > 0
        //     && programLst.map((item, i) => {
        //         return (

        //             { label: getLabelText(item.label, this.state.lang), value: item.programId }

        //         )
        //     }, this);

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
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
                text: 'All', value: this.state.selSource.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    {/* <CardHeader className="mb-md-3 pb-lg-1">
                        <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>
                        <div className="card-header-actions">

                        </div>

                    </CardHeader> */}
                    {/* {
                        this.state.allowAdd &&
                        < div className="Card-header-addicon">
                            <div className="card-header-actions">
                                <div className="card-header-action">
                                    {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_REALM_COUNTRY_PLANNING_UNIT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewEntity}><i className="fa fa-plus-square"></i></a>}
                                </div>
                            </div>
                        </div>
                    } */}

                    <CardBody className="pb-lg-2 pt-lg-0">


                        {/* <FormGroup className="Selectdiv mt-md-2 mb-md-0">
                                <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.realmcountry')}</Label>
                                <div className="controls SelectGo">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="realmCountryId"
                                            id="realmCountryId"
                                            bsSize="sm"
                                            onChange={this.filterData}
                                        >
                                            <option value="0">{i18n.t('static.common.select')}</option>
                                            {realmCountryList}
                                        </Input>
                                    </InputGroup>
                                </div>
                            </FormGroup> */}
                        <Form >
                            <div className="pl-0">
                                <div className="row">

                                    <FormGroup className="col-md-3">
                                        <Label htmlFor="programIds">{i18n.t('static.program.program')}</Label>
                                        <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>

                                        <MultiSelect

                                            bsSize="sm"
                                            name="programIds"
                                            id="programIds"
                                            value={this.state.programValues}
                                            onChange={(e) => { this.handleChangeProgram(e) }}
                                            options={programList && programList.length > 0 ? programList : []}
                                        />
                                        {!!this.props.error &&
                                            this.props.touched && (
                                                <div style={{ color: '#BA0C2F', marginTop: '.5rem' }}>{this.props.error}</div>
                                            )}

                                    </FormGroup>
                                </div>
                            </div>
                        </Form>


                        <div id="tableDiv" style={{ display: this.state.loading ? "none" : "block" }}>
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

                    </CardBody>

                    {
                        this.state.allowAdd &&
                        <CardFooter>
                            {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_REALM_COUNTRY_PLANNING_UNIT') &&
                                <FormGroup>
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                                    &nbsp;
                                </FormGroup>
                            }
                        </CardFooter>
                    }

                </Card>

            </div >
        );
    }

}

