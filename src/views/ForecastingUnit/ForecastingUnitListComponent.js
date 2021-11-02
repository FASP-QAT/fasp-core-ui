// import React, { Component } from 'react';
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory from 'react-bootstrap-table2-filter';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import { Card, CardBody, CardHeader, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Form } from 'reactstrap';
// import ForecastingUnitService from '../../api/ForecastingUnitService';
// //import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
// //import data from '../Tables/DataTable/_data';
// import i18n from '../../i18n';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import RealmService from '../../api/RealmService';
// import getLabelText from '../../CommonComponent/getLabelText';
// import ProductService from '../../api/ProductService';
// import TracerCategoryService from '../../api/TracerCategoryService';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'


// const entityname = i18n.t('static.forecastingunit.forecastingunit');
// export default class ForecastingUnitListComponent extends Component {

//     constructor(props) {
//         super(props);

//         this.state = {
//             realms: [],
//             productCategories: [],
//             tracerCategories: [],
//             forecastingUnitList: [],
//             message: '',
//             selSource: [],
//             lang: localStorage.getItem('lang'),
//             realmId: '',
//             loading: true
//         }

//         this.editForecastingUnit = this.editForecastingUnit.bind(this);
//         this.addNewForecastingUnit = this.addNewForecastingUnit.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this.filterDataForRealm = this.filterDataForRealm.bind(this);
//         this.getProductCategories = this.getProductCategories.bind(this);
//         this.hideFirstComponent = this.hideFirstComponent.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);
//     }
//     hideFirstComponent() {
//         this.timeout = setTimeout(function () {
//             document.getElementById('div1').style.display = 'none';
//         }, 8000);
//     }
//     componentWillUnmount() {
//         clearTimeout(this.timeout);
//     }


//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }



//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
//     }

//     filterDataForRealm() {
//         let realmId = document.getElementById("realmId").value;
//         ForecastingUnitService.getForcastingUnitByRealmId(realmId).then(response => {
//             if (response.status == 200) {
//                 console.log("response------->" + response);
//                 this.setState({
//                     forecastingUnitList: response.data,
//                     selSource: response.data
//                 })
//             }
//             else {

//                 this.setState({
//                     message: response.data.messageCode
//                 },
//                     () => {
//                         this.hideSecondComponent();
//                     })
//             }

//         })

//     }

//     filterData() {
//         // let realmId = document.getElementById("realmId").value;
//         let productCategoryId = document.getElementById("productCategoryId").value;
//         let tracerCategoryId = document.getElementById("tracerCategoryId").value;

//         // if (realmId != 0 && productCategoryId != 0 && tracerCategoryId != 0) {
//         //     const selSource = this.state.forecastingUnitList.filter(c => c.realm.id == realmId && c.tracerCategory.id == tracerCategoryId && c.productCategory.id == productCategoryId)
//         //     this.setState({
//         //         selSource
//         //     });
//         // } else
//         //  if (realmId != 0 && productCategoryId != 0) {
//         //     const selSource = this.state.forecastingUnitList.filter(c => c.realm.id == realmId && c.productCategory.id == productCategoryId)
//         //     this.setState({
//         //         selSource
//         //     });
//         // } else 
//         // if (realmId != 0 && tracerCategoryId != 0) {
//         //     const selSource = this.state.forecastingUnitList.filter(c => c.realm.id == realmId && c.tracerCategory.id == tracerCategoryId)

//         //     this.setState({
//         //         selSource
//         //     });
//         // } else 
//         if (productCategoryId != 0 && tracerCategoryId != 0) {
//             const selSource = this.state.forecastingUnitList.filter(c => c.tracerCategory.id == tracerCategoryId && c.productCategory.id == productCategoryId)
//             this.setState({
//                 selSource
//             });
//         }
//         // else if (realmId != 0) {
//         //     const selSource = this.state.forecastingUnitList.filter(c => c.realm.id == realmId)
//         //     this.setState({
//         //         selSource
//         //     });
//         // } 
//         else if (productCategoryId != 0) {
//             console.log("productCategoryId---"+productCategoryId);
//             const selSource = this.state.forecastingUnitList.filter(c => c.productCategory.id == productCategoryId)
//             console.log("selSource---",selSource);
//             this.setState({
//                 selSource
//             });
//         } else if (tracerCategoryId != 0) {
//             const selSource = this.state.forecastingUnitList.filter(c => c.tracerCategory.id == tracerCategoryId)
//             this.setState({
//                 selSource
//             });
//         } else {
//             this.setState({
//                 selSource: this.state.forecastingUnitList
//             });
//         }
//     }
//     getProductCategories() {
//         AuthenticationService.setupAxiosInterceptors();
//         let realmId = document.getElementById("realmId").value;
//         ProductService.getProductCategoryList(realmId)
//             .then(response => {
//                 console.log("product category list---",JSON.stringify(response.data))


//                 this.setState({
//                     productCategories: response.data
//                 })
//             })

//     }
//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         this.hideFirstComponent();
//         RealmService.getRealmListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         realms: response.data,
//                         realmId: response.data[0].realmId, loading: false
//                     })
//                     this.getProductCategories();
//                     ForecastingUnitService.getForcastingUnitByRealmId(this.state.realmId).then(response => {
//                         // console.log("response------->" + response);
//                         if (response.status == 200) {
//                             this.setState({
//                                 forecastingUnitList: response.data,
//                                 selSource: response.data
//                             },
//                             () => {
//                                 console.log("responsedata------->" + this.state.forecastingUnitList);
//                             })
//                         } else {
//                             this.setState({
//                                 message: response.data.messageCode
//                             },
//                                 () => {
//                                     this.hideSecondComponent();
//                                 })
//                         }


//                     })

//                 } else {

//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }
//             })

//         TracerCategoryService.getTracerCategoryListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         tracerCategories: response.data,
//                         loading: false
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }

//             })

//         ForecastingUnitService.getForecastingUnitListAll().then(response => {
//             console.log("response------->" + response);
//             if (response.status == 200) {
//                 this.setState({
//                     forecastingUnitList: response.data,
//                     selSource: response.data
//                 })
//             } else {
//                 this.setState({
//                     message: response.data.messageCode
//                 },
//                     () => {
//                         this.hideSecondComponent();
//                     })
//             }


//         })

//     }

//     editForecastingUnit(forecastingUnit) {
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_FORECASTING_UNIT')) {
//             this.props.history.push({
//                 pathname: `/forecastingUnit/editForecastingUnit/${forecastingUnit.forecastingUnitId}`,
//                 // state: { forecastingUnit: forecastingUnit }
//             });
//         }
//     }

//     addNewForecastingUnit() {

//         if (navigator.onLine) {
//             this.props.history.push(`/forecastingUnit/addForecastingUnit`)
//         } else {
//             alert(i18n.t('static.common.online'))
//         }
//     }
//     render() {
//         const { realms } = this.state;
//         let realmList = realms.length > 0
//             && realms.map((item, i) => {
//                 return (
//                     <option key={i} value={item.realmId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);
//         const { tracerCategories } = this.state;
//         let tracercategoryList = tracerCategories.length > 0
//             && tracerCategories.map((item, i) => {
//                 return (
//                     <option key={i} value={item.tracerCategoryId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);
//         const { productCategories } = this.state;
//         let productCategoryList = productCategories.length > 0
//             && productCategories.map((item, i) => {
//                 console.log(JSON.stringify("----------",item))
//                 return (
//                     <option key={i} value={item.payload.productCategoryId}>
//                         {getLabelText(item.payload.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );

//         const columns = [{
//             dataField: 'realm.label',
//             text: i18n.t('static.realm.realm'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         }, {
//             dataField: 'productCategory.label',
//             text: i18n.t('static.productcategory.productcategory'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         }, {
//             dataField: 'tracerCategory.label',
//             text: i18n.t('static.tracercategory.tracercategory'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         }, {
//             dataField: 'unit.label',
//             text: i18n.t('static.unit.unit'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         }, {
//             dataField: 'genericLabel',
//             text: i18n.t('static.product.productgenericname'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         }, {
//             dataField: 'label',
//             text: i18n.t('static.forecastingunit.forecastingunit'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         }, {
//             dataField: 'active',
//             text: i18n.t('static.common.status'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: (cellContent, row) => {
//                 return (
//                     (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
//                 );
//             }
//         }];
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
//             paginationSize: 2,
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
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />
//                 <h5 className={this.props.match.params.color} id="div1"><strong></strong>{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     <div className="Card-header-addicon">
//                         {/* <i className="icon-menu"></i><strong> {i18n.t('static.common.listEntity', { entityname })}</strong> */}
//                         <div className="card-header-actions">
//                             <div className="card-header-action">
//                                 {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_FORECASTING_UNIT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewForecastingUnit}><i className="fa fa-plus-square"></i></a>}
//                             </div>
//                         </div>

//                     </div>
//                     <CardBody className="pb-lg-0">
//                         <Form >
//                             <Col md="9 pl-0">
//                                 <div className="d-md-flex Selectdiv2">
//                                     <FormGroup>
//                                         <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
//                                         <div className="controls SelectGo">
//                                             <InputGroup>
//                                                 <Input
//                                                     type="select"
//                                                     name="realmId"
//                                                     id="realmId"
//                                                     bsSize="sm"
//                                                 // onChange={this.filterDataForRealm}
//                                                 >
//                                                     <option value="-1">{i18n.t('static.common.all')}</option>

//                                                     {realmList}
//                                                 </Input>
//                                                 <InputGroupAddon addonType="append">
//                                                     <Button color="secondary Gobtn btn-sm" onClick={this.filterDataForRealm}>{i18n.t('static.common.go')}</Button>
//                                                 </InputGroupAddon>
//                                             </InputGroup>
//                                         </div>
//                                     </FormGroup>
//                                     &nbsp;
//                                     <FormGroup className="tab-ml-1">
//                                         <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
//                                         <div className="controls SelectGo">
//                                             <InputGroup>
//                                                 <Input
//                                                     type="select"
//                                                     name="productCategoryId"
//                                                     id="productCategoryId"
//                                                     bsSize="sm"
//                                                 >
//                                                     {/* <option value="0">{i18n.t('static.common.all')}</option> */}
//                                                     {productCategoryList}
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
//                                                 >
//                                                     <option value="0">{i18n.t('static.common.all')}</option>
//                                                     {tracercategoryList}
//                                                 </Input>
//                                                 <InputGroupAddon addonType="append">
//                                                     <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
//                                                 </InputGroupAddon>
//                                             </InputGroup>
//                                         </div>
//                                     </FormGroup>
//                                 </div>
//                             </Col>
//                         </Form>
//                         <ToolkitProvider
//                             keyField="forecastingUnitId"
//                             data={this.state.selSource}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (
//                                     <div className="TableCust">
//                                         <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
//                                             <SearchBar {...props.searchProps} />
//                                             <ClearSearchButton {...props.searchProps} />
//                                         </div>
//                                         <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                                             pagination={paginationFactory(options)}
//                                             rowEvents={{
//                                                 onClick: (e, row, rowIndex) => {
//                                                     this.editForecastingUnit(row);
//                                                 }
//                                             }}
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





import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody, CardHeader, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Form } from 'reactstrap';
import ForecastingUnitService from '../../api/ForecastingUnitService';
//import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
//import data from '../Tables/DataTable/_data';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmService from '../../api/RealmService';
import getLabelText from '../../CommonComponent/getLabelText';
import ProductService from '../../api/ProductService';
import TracerCategoryService from '../../api/TracerCategoryService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import moment from 'moment';
import jexcel from 'jspreadsheet-pro';
import "../../../node_modules/jspreadsheet-pro/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';


const entityname = i18n.t('static.forecastingunit.forecastingunit');
export default class ForecastingUnitListComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            realms: [],
            productCategories: [],
            tracerCategories: [],
            forecastingUnitList: [],
            message: '',
            selSource: [],
            lang: localStorage.getItem('lang'),
            realmId: '',
            loading: true
        }

        this.editForecastingUnit = this.editForecastingUnit.bind(this);
        this.addNewForecastingUnit = this.addNewForecastingUnit.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.filterDataForRealm = this.filterDataForRealm.bind(this);
        this.getProductCategories = this.getProductCategories.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
    }
    buildJexcel() {
        let forecastingUnitList = this.state.selSource;
        // console.log("forecastingUnitList---->", forecastingUnitList);
        let forecastingUnitListArray = [];
        let count = 0;

        for (var j = 0; j < forecastingUnitList.length; j++) {
            data = [];
            data[0] = forecastingUnitList[j].forecastingUnitId
            data[1] = getLabelText(forecastingUnitList[j].realm.label, this.state.lang)
            data[2] = getLabelText(forecastingUnitList[j].productCategory.label, this.state.lang)
            data[3] = getLabelText(forecastingUnitList[j].tracerCategory.label, this.state.lang)
            data[4] = getLabelText(forecastingUnitList[j].unit.label, this.state.lang)
            data[5] = getLabelText(forecastingUnitList[j].genericLabel, this.state.lang)
            data[6] = getLabelText(forecastingUnitList[j].label, this.state.lang)
            data[7] = forecastingUnitList[j].lastModifiedBy.username;
            data[8] = (forecastingUnitList[j].lastModifiedDate ? moment(forecastingUnitList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            data[9] = forecastingUnitList[j].active;

            forecastingUnitListArray[count] = data;
            count++;
        }
        // if (forecastingUnitList.length == 0) {
        //     data = [];
        //     forecastingUnitListArray[0] = data;
        // }
        // console.log("forecastingUnitListArray---->", forecastingUnitListArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = forecastingUnitListArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [60, 150, 60, 100, 60, 60, 60, 100, 60],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.forecastingUnit.forecastingUnitId'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.realm.realm'),
                    type: (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') ? 'text' : 'hidden'),
                    readOnly: true
                },
                {
                    title: i18n.t('static.productcategory.productcategory'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.tracercategory.tracercategory'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.unit.unit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.product.productgenericname'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.forecastingunit.forecastingunit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
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
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}  ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
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
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
        };
        var forecastingUnitListEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = forecastingUnitListEl;
        this.setState({
            forecastingUnitListEl: forecastingUnitListEl, loading: false
        })
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }


    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }



    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    filterDataForRealm() {
        this.setState({ loading: true })
        let realmId = document.getElementById("realmId").value;
        console.log("realmId---", realmId)
        this.getProductCategories();
        ForecastingUnitService.getForcastingUnitByRealmId(realmId).then(response => {
            if (response.status == 200) {
                console.log("response------->" + response);
                this.setState({
                    forecastingUnitList: response.data,
                    selSource: response.data,
                    loading: false
                },
                    () => {
                        this.buildJexcel();
                    })
            }
            else {

                this.setState({
                    message: response.data.messageCode, loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }

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

    }

    filterData() {
        // let realmId = document.getElementById("realmId").value;
        let productCategoryId = document.getElementById("productCategoryId").value;
        let tracerCategoryId = document.getElementById("tracerCategoryId").value;

        // if (realmId != 0 && productCategoryId != 0 && tracerCategoryId != 0) {
        //     const selSource = this.state.forecastingUnitList.filter(c => c.realm.id == realmId && c.tracerCategory.id == tracerCategoryId && c.productCategory.id == productCategoryId)
        //     this.setState({
        //         selSource
        //     });
        // } else
        //  if (realmId != 0 && productCategoryId != 0) {
        //     const selSource = this.state.forecastingUnitList.filter(c => c.realm.id == realmId && c.productCategory.id == productCategoryId)
        //     this.setState({
        //         selSource
        //     });
        // } else 
        // if (realmId != 0 && tracerCategoryId != 0) {
        //     const selSource = this.state.forecastingUnitList.filter(c => c.realm.id == realmId && c.tracerCategory.id == tracerCategoryId)

        //     this.setState({
        //         selSource
        //     });
        // } else 
        if (productCategoryId != 0 && tracerCategoryId != 0) {
            // productCategories
            var pc = this.state.productCategories.filter(c => c.payload.productCategoryId == productCategoryId)[0]
            console.log("Pc---------->", pc);
            var pcList = this.state.productCategories.filter(c => c.payload.productCategoryId == pc.payload.productCategoryId || c.parentId == pc.id);
            console.log("PcList", pcList);
            var pcIdArray = [];
            for (var pcu = 0; pcu < pcList.length; pcu++) {
                pcIdArray.push(pcList[pcu].payload.productCategoryId);
            }
            console.log("pcIdArray", pcIdArray);
            this.setState({ loading: true })
            const selSource = this.state.forecastingUnitList.filter(c => c.tracerCategory.id == tracerCategoryId && pcIdArray.includes(c.productCategory.id))
            this.setState({
                selSource,
                loading: false
            },
                () => {
                    this.buildJexcel();
                })
        }
        // else if (realmId != 0) {
        //     const selSource = this.state.forecastingUnitList.filter(c => c.realm.id == realmId)
        //     this.setState({
        //         selSource
        //     });
        // } 
        else if (productCategoryId != 0) {
            var pc = this.state.productCategories.filter(c => c.payload.productCategoryId == productCategoryId)[0]
            console.log("Pc---------->", pc);
            var pcList = this.state.productCategories.filter(c => c.payload.productCategoryId == pc.payload.productCategoryId || c.parentId == pc.id);
            console.log("PcList", pcList);
            var pcIdArray = [];
            for (var pcu = 0; pcu < pcList.length; pcu++) {
                pcIdArray.push(pcList[pcu].payload.productCategoryId);
            }
            console.log("pcIdArray", pcIdArray);
            console.log("productCategoryId---" + productCategoryId);
            const selSource = this.state.forecastingUnitList.filter(c => pcIdArray.includes(c.productCategory.id));
            console.log("selSource---", selSource);
            this.setState({
                selSource
            },
                () => {
                    this.buildJexcel();
                })
        } else if (tracerCategoryId != 0) {
            const selSource = this.state.forecastingUnitList.filter(c => c.tracerCategory.id == tracerCategoryId)
            this.setState({
                selSource
            },
                () => {
                    this.buildJexcel();
                })
        } else {
            this.setState({
                selSource: this.state.forecastingUnitList
            },
                () => {
                    this.buildJexcel();
                })
        }
    }
    getProductCategories() {
        // AuthenticationService.setupAxiosInterceptors();
        let realmId = document.getElementById("realmId").value;
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                console.log("product category list---", JSON.stringify(response.data))
                this.setState({
                    productCategories: response.data
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

    }
    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        this.hideFirstComponent();

        if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
            let realmId = AuthenticationService.getRealmId();
            ProductService.getProductCategoryList(realmId)
                .then(response => {
                    console.log("product category list---", JSON.stringify(response.data))
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.payload.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.payload.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        productCategories: listArray
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

        }

        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realms: listArray,
                        realmId: response.data[0].realmId,
                        // loading: false
                    })
                    // this.getProductCategories();
                    // ForecastingUnitService.getForcastingUnitByRealmId(this.state.realmId).then(response => {
                    //     console.log("response------->" + response);
                    //     if (response.status == 200) {
                    //         this.setState({
                    //             forecastingUnitList: response.data,
                    //             selSource: response.data
                    //         })
                    //     } else {
                    //         this.setState({
                    //             message: response.data.messageCode
                    //         },
                    //             () => {
                    //                 this.hideSecondComponent();
                    //             })
                    //     }


                    // })

                } else {

                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
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

        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        tracerCategories: listArray,
                        // loading: false
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }

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

        ForecastingUnitService.getForecastingUnitListAll().then(response => {
            console.log("response------->" + response);
            if (response.status == 200) {
                this.setState({
                    forecastingUnitList: response.data,
                    selSource: response.data,
                    loading: false
                },
                    () => {
                        this.buildJexcel();
                    })
            } else {
                this.setState({
                    message: response.data.messageCode, loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }


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
        // this.filterDataForRealm();

    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    editForecastingUnit(forecastingUnit) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_FORECASTING_UNIT')) {
            this.props.history.push({
                pathname: `/forecastingUnit/editForecastingUnit/${forecastingUnit.forecastingUnitId}`,
                // state: { forecastingUnit: forecastingUnit }
            });
        }
    }
    selected = function (instance, cell, x, y, value) {
        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            if (this.state.selSource.length != 0) {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_FORECASTING_UNIT')) {
                    this.props.history.push({
                        pathname: `/forecastingUnit/editForecastingUnit/${this.el.getValueFromCoords(0, x)}`,
                        // state: { role }
                    });
                }
            }
        }
    }.bind(this);

    addNewForecastingUnit() {

        if (isSiteOnline()) {
            this.props.history.push(`/forecastingUnit/addForecastingUnit`)
        } else {
            alert(i18n.t('static.common.online'))
        }
    }
    render() {
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { tracerCategories } = this.state;
        let tracercategoryList = tracerCategories.length > 0
            && tracerCategories.map((item, i) => {
                return (
                    <option key={i} value={item.tracerCategoryId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { productCategories } = this.state;
        let productCategoryList = productCategories.length > 0
            && productCategories.map((item, i) => {
                console.log(JSON.stringify("----------", item))
                return (
                    <option key={i} value={item.payload.productCategoryId}>
                        {getLabelText(item.payload.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5 className={this.props.match.params.color} id="div1"><strong></strong>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong> {i18n.t('static.common.listEntity', { entityname })}</strong> */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_FORECASTING_UNIT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewForecastingUnit}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>

                    </div>
                    <CardBody className="pb-lg-5 pt-lg-0">

                        <Col md="9 pl-0">
                            <div className="d-md-flex  Selectdiv2">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') &&
                                    <FormGroup className="mt-md-2 mb-md-0 ">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                                        <div className="controls SelectField">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="realmId"
                                                    id="realmId"
                                                    bsSize="sm"
                                                    onChange={this.filterDataForRealm}
                                                >
                                                    <option value="-1">{i18n.t('static.common.all')}</option>

                                                    {realmList}
                                                </Input>
                                                {/* <InputGroupAddon addonType="append">
                                                <Button color="secondary Gobtn btn-sm" onClick={this.filterDataForRealm}>{i18n.t('static.common.go')}</Button>
                                            </InputGroupAddon> */}
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                }

                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                    <div className="controls SelectField">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="productCategoryId"
                                                id="productCategoryId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                {/* <option value="0">{i18n.t('static.common.all')}</option> */}
                                                {productCategoryList}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                    <div className="controls SelectField ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="tracerCategoryId"
                                                id="tracerCategoryId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {tracercategoryList}
                                            </Input>
                                            {/* <InputGroupAddon addonType="append">
                                                <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                            </InputGroupAddon> */}
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>

                        </Col>
                        {/* <div className="SearchMarginTopLarge"> */}
                        <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_FORECASTING_UNIT') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
                        {/* </div> */}

                    </CardBody>
                </Card>

            </div>
        );
    }

}