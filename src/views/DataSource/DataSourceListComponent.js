// import React, { Component } from 'react';
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory from 'react-bootstrap-table2-filter';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
// import DataSourceService from '../../api/DataSourceService';
// import DataSourceTypeService from '../../api/DataSourceTypeService';
// import RealmService from '../../api/RealmService';
// import ProgramService from "../../api/ProgramService";
// import getLabelText from '../../CommonComponent/getLabelText';
// import i18n from '../../i18n';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'


// const entityname = i18n.t('static.datasource.datasource');
// export default class DataSourceListComponent extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             realms: [],
//             programs: [],
//             dataSourceTypes: [],
//             dataSourceList: [],
//             message: '',
//             selSource: [],
//             loading: true


//         }
//         this.editDataSource = this.editDataSource.bind(this);
//         this.addNewDataSource = this.addNewDataSource.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
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

//     filterData() {
//         let dataSourceTypeId = document.getElementById("dataSourceTypeId").value;
//         let realmId = document.getElementById("realmId").value;
//         let programId = document.getElementById("programId").value;

//         if (dataSourceTypeId != 0) {
//             const selSource = this.state.dataSourceList.filter(c => c.dataSourceType.id == dataSourceTypeId)
//             this.setState({
//                 selSource
//             });
//         } else {
//             this.setState({
//                 selSource: this.state.dataSourceList
//             });
//         }

//         if (realmId != 0 && dataSourceTypeId != 0 && programId != 0) {
//             const selSource = this.state.dataSourceList.filter(c => c.realm.id == realmId && c.dataSourceType.id == dataSourceTypeId && c.program.id == programId)
//             this.setState({
//                 selSource
//             });
//         } else if (realmId != 0 && dataSourceTypeId != 0) {
//             const selSource = this.state.dataSourceList.filter(c => c.realm.id == realmId && c.dataSourceType.id == dataSourceTypeId)
//             this.setState({
//                 selSource
//             });
//         } else if (realmId != 0 && programId != 0) {
//             const selSource = this.state.dataSourceList.filter(c => c.realm.id == realmId && c.program.id == programId)

//             this.setState({
//                 selSource
//             });
//         } else if (dataSourceTypeId != 0 && programId != 0) {
//             const selSource = this.state.dataSourceList.filter(c => c.program.id == programId && c.dataSourceType.id == dataSourceTypeId)
//             this.setState({
//                 selSource
//             });
//         } else if (realmId != 0) {
//             const selSource = this.state.dataSourceList.filter(c => c.realm.id == realmId)
//             this.setState({
//                 selSource
//             });
//         } else if (dataSourceTypeId != 0) {
//             const selSource = this.state.dataSourceList.filter(c => c.dataSourceType.id == dataSourceTypeId)
//             this.setState({
//                 selSource
//             });
//         } else if (programId != 0) {
//             const selSource = this.state.dataSourceList.filter(c => c.program.id == programId)
//             this.setState({
//                 selSource
//             });
//         } else {
//             this.setState({
//                 selSource: this.state.dataSourceList
//             });
//         }

//     }

//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         this.hideFirstComponent();
//         ProgramService.getProgramList()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         programs: response.data, loading: false
//                     })
//                 }

//                 else {

//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }

//             })
//         .catch(
//             error => {
//                 if (error.message === "Network Error") {
//                     this.setState({ message: error.message });
//                 } else {
//                     switch (error.response ? error.response.status : "") {
//                         case 500:
//                         case 401:
//                         case 404:
//                         case 406:
//                         case 412:
//                             this.setState({ message: error.response.data.messageCode });
//                             break;
//                         default:
//                             this.setState({ message: 'static.unkownError' });
//                             break;
//                     }
//                 }
//             }
//         );

//         RealmService.getRealmListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         realms: response.data
//                     })
//                 } else {
//                     this.setState({ message: response.data.messageCode })
//                 }
//             })
//         .catch(
//             error => {
//                 if (error.message === "Network Error") {
//                     this.setState({ message: error.message });
//                 } else {
//                     switch (error.response ? error.response.status : "") {
//                         case 500:
//                         case 401:
//                         case 404:
//                         case 406:
//                         case 412:
//                             this.setState({ message: error.response.data.messageCode });
//                             break;
//                         default:
//                             this.setState({ message: 'static.unkownError' });
//                             break;
//                     }
//                 }
//             }
//         );

//         DataSourceTypeService.getDataSourceTypeList().then(response => {
//             console.log(response.data)
//             this.setState({
//                 dataSourceTypes: response.data,

//             })
//         })
//         .catch(
//             error => {
//                 if (error.message === "Network Error") {
//                     this.setState({ message: error.message });
//                 } else {
//                     switch (error.response.status) {
//                         case 500:
//                         case 401:
//                         case 404:
//                         case 406:
//                         case 412:
//                             this.setState({ message: error.response.data.messageCode });
//                             break;
//                         default:
//                             this.setState({ message: 'static.unkownError' });
//                             break;
//                     }
//                 }
//             }
//         );

//         DataSourceService.getAllDataSourceList().then(response => {
//             this.setState({
//                 dataSourceList: response.data,
//                 selSource: response.data
//             })
//         })
//         .catch(
//             error => {
//                 if (error.message === "Network Error") {
//                     this.setState({ message: error.message });
//                 } else {
//                     switch (error.response.status) {
//                         case 500:
//                         case 401:
//                         case 404:
//                         case 406:
//                         case 412:
//                             this.setState({ message: error.response.data.messageCode });
//                             break;
//                         default:
//                             this.setState({ message: 'static.unkownError' });
//                             break;
//                     }
//                 }
//             }
//         );
//     }

//     editDataSource(dataSource) {
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_DATA_SOURCE')) {
//             this.props.history.push({
//                 pathname: `/dataSource/editDataSource/${dataSource.dataSourceId}`,
//                 state: { dataSource: dataSource }
//             });
//         }
//     }

//     addNewDataSource() {

//         if (navigator.onLine) {
//             this.props.history.push(`/dataSource/addDataSource`)
//         } else {
//             alert(i18n.t('static.common.online'))
//         }

//     }

//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
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

//         const { dataSourceTypes } = this.state;
//         let dataSourceTypeList = dataSourceTypes.length > 0
//             && dataSourceTypes.map((item, i) => {
//                 return (
//                     <option key={i} value={item.dataSourceTypeId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const { programs } = this.state;
//         let programList = programs.length > 0
//             && programs.map((item, i) => {
//                 return (
//                     <option key={i} value={item.programId}>
//                         {getLabelText(item.label, this.state.lang)}
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
//             dataField: 'dataSourceType.label',
//             text: i18n.t('static.datasourcetype.datasourcetype'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         }, {
//             dataField: 'label',
//             text: i18n.t('static.datasource.datasource'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
//         }, {
//             dataField: 'program.label',
//             text: i18n.t('static.dataSource.program'),
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
//                 <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     <div className="Card-header-addicon">
//                         {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
//                         <div className="card-header-actions">
//                             <div className="card-header-action">
//                                 {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_DATA_SOURCE') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewDataSource}><i className="fa fa-plus-square"></i></a>}
//                             </div>
//                         </div>

//                     </div>
//                     <CardBody className="pb-lg-0">
//                         <Col md="9 pl-0">
//                             <div className="d-md-flex Selectdiv2">
//                                 <FormGroup>
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="realmId"
//                                                 id="realmId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {realmList}
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>
//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.dataSource.program')}</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="programId"
//                                                 id="programId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {programList}
//                                             </Input>

//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>
//                                 <FormGroup className="tab-ml-1">
//                                     <Label htmlFor="appendedInputButton">{i18n.t('static.datasourcetype.datasourcetype')}</Label>
//                                     <div className="controls SelectGo">
//                                         <InputGroup>
//                                             <Input
//                                                 type="select"
//                                                 name="dataSourceTypeId"
//                                                 id="dataSourceTypeId"
//                                                 bsSize="sm"
//                                                 onChange={this.filterData}
//                                             >
//                                                 <option value="0">{i18n.t('static.common.all')}</option>
//                                                 {dataSourceTypeList}
//                                             </Input>
//                                             {/* <InputGroupAddon addonType="append">
//                                                 <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
//                                             </InputGroupAddon> */}
//                                         </InputGroup>
//                                     </div>
//                                 </FormGroup>
//                             </div>
//                         </Col>
//                         <ToolkitProvider
//                             keyField="dataSourceId"
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
//                                                     this.editDataSource(row);
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


// ---------------------------JEXCEL CONVERSION FROM BOOTSTRAP-------------------------------//




import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
import DataSourceService from '../../api/DataSourceService';
import DataSourceTypeService from '../../api/DataSourceTypeService';
import RealmService from '../../api/RealmService';
import ProgramService from "../../api/ProgramService";
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import moment from 'moment';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM } from '../../Constants';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';


const entityname = i18n.t('static.datasource.datasource');
export default class DataSourceListComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            programs: [],
            dataSourceTypes: [],
            dataSourceList: [],
            message: '',
            selSource: [],
            loading: true


        }
        this.editDataSource = this.editDataSource.bind(this);
        this.addNewDataSource = this.addNewDataSource.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
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

    filterData() {
        let dataSourceTypeId = document.getElementById("dataSourceTypeId").value;
        let programId = document.getElementById("programId").value;

        let realmId = 0;
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
            realmId = document.getElementById("realmId").value;
        }
        console.log(dataSourceTypeId);
        console.log(realmId);
        console.log(programId);
        // if (dataSourceTypeId != 0) {
        //     const selSource = this.state.dataSourceList.filter(c => c.dataSourceType.id == dataSourceTypeId)
        //     this.setState({
        //         selSource
        //     });
        // } else {
        //     this.setState({
        //         selSource: this.state.dataSourceList
        //     });
        // }

        if (realmId != 0 && dataSourceTypeId != 0 && programId != 0) {
            const selSource = this.state.dataSourceList.filter(c => c.realm.id == realmId && c.dataSourceType.id == dataSourceTypeId && c.program.id == programId)
            this.setState({
                selSource
            },
                () => { this.buildJexcel() });
        } else if (realmId != 0 && dataSourceTypeId != 0) {
            const selSource = this.state.dataSourceList.filter(c => c.realm.id == realmId && c.dataSourceType.id == dataSourceTypeId)
            this.setState({
                selSource
            },
                () => { this.buildJexcel() });
        } else if (realmId != 0 && programId != 0) {
            const selSource = this.state.dataSourceList.filter(c => c.realm.id == realmId && c.program.id == programId)

            this.setState({
                selSource
            },
                () => { this.buildJexcel() });
        } else if (dataSourceTypeId != 0 && programId != 0) {
            const selSource = this.state.dataSourceList.filter(c => c.program.id == programId && c.dataSourceType.id == dataSourceTypeId)
            this.setState({
                selSource
            },
                () => { this.buildJexcel() });
        } else if (realmId != 0) {
            const selSource = this.state.dataSourceList.filter(c => c.realm.id == realmId)
            this.setState({
                selSource
            },
                () => { this.buildJexcel() });
        } else if (dataSourceTypeId != 0) {
            const selSource = this.state.dataSourceList.filter(c => c.dataSourceType.id == dataSourceTypeId)
            this.setState({
                selSource
            },
                () => { this.buildJexcel() });
        } else if (programId != 0) {
            const selSource = this.state.dataSourceList.filter(c => c.program.id == programId)
            this.setState({
                selSource
            },
                () => { this.buildJexcel() });
        } else {
            this.setState({
                selSource: this.state.dataSourceList
            },
                () => { this.buildJexcel() });
        }

    }
    buildJexcel() {
        let dataSourceList = this.state.selSource;
        // console.log("dataSourceList---->", dataSourceList);
        let dataSourceArray = [];
        let count = 0;

        for (var j = 0; j < dataSourceList.length; j++) {
            data = [];
            data[0] = dataSourceList[j].dataSourceId
            data[1] = getLabelText(dataSourceList[j].realm.label, this.state.lang)
            data[2] = getLabelText(dataSourceList[j].dataSourceType.label, this.state.lang)
            data[3] = getLabelText(dataSourceList[j].label, this.state.lang)
            data[4] = getLabelText(dataSourceList[j].program.label, this.state.lang)
            data[5] = dataSourceList[j].lastModifiedBy.username;
            data[6] = (dataSourceList[j].lastModifiedDate ? moment(dataSourceList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            data[7] = dataSourceList[j].active;
            dataSourceArray[count] = data;
            count++;
        }
        // if (dataSourceList.length == 0) {
        //     data = [];
        //     dataSourceArray[0] = data;
        // }
        // console.log("dataSourceArray---->", dataSourceArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = dataSourceArray;

        var options = {
            data: data,
            columnDrag: true,
            // colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'dataSourceId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.realm.realm'),
                    type: (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') ? 'text' : 'hidden'),
                    readOnly: true
                },
                {
                    title: i18n.t('static.datasourcetype.datasourcetype'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.datasource.datasource'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.dataSource.program'),
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
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
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
                return [];
            }.bind(this),
        };
        var dataSourceEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = dataSourceEl;
        this.setState({
            dataSourceEl: dataSourceEl, loading: false
        })
    }

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        this.hideFirstComponent();
        ProgramService.getProgramList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        programs: listArray, loading: false
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

            })
            .catch(
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
                        realms: listArray, loading: false
                    })
                } else {
                    this.setState({ message: response.data.messageCode, loading: false })
                }
            })
            .catch(
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

        DataSourceTypeService.getDataSourceTypeList().then(response => {
            console.log(response.data)
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                dataSourceTypes: listArray, loading: false

            })
        })
            .catch(
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

        DataSourceService.getAllDataSourceList().then(response => {
            // this.setState({
            //     dataSourceList: response.data,
            //     selSource: response.data
            // })
            this.setState({
                dataSourceList: response.data, selSource: response.data, loading: false
            }, () => { this.buildJexcel() })
        })
            .catch(
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
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    editDataSource(dataSource) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DATA_SOURCE')) {
            this.props.history.push({
                pathname: `/dataSource/editDataSource/${dataSource.dataSourceId}`,
                // state: { dataSource: dataSource }
            });
        }
    }

    selected = function (instance, cell, x, y, value) {
        console.log("selected x--->",x);
        console.log("selected y--->",y);
        console.log("selected value--->",value);
        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DATA_SOURCE')) {
                this.props.history.push({
                    pathname: `/dataSource/editDataSource/${this.el.getValueFromCoords(0, x)}`,
                    // state: { currency: currency }
                });
            }
        }
    }.bind(this);
    addNewDataSource() {

        if (isSiteOnline()) {
            this.props.history.push(`/dataSource/addDataSource`)
        } else {
            alert(i18n.t('static.common.online'))
        }

    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
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

        const { dataSourceTypes } = this.state;
        let dataSourceTypeList = dataSourceTypes.length > 0
            && dataSourceTypes.map((item, i) => {
                return (
                    <option key={i} value={item.dataSourceTypeId}>
                        {getLabelText(item.label, this.state.lang)}
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

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_DATA_SOURCE') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewDataSource}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>

                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        <Col md="9 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') &&
                                    <FormGroup className="mt-md-2 mb-md-0 ">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="realmId"
                                                    id="realmId"
                                                    bsSize="sm"
                                                    onChange={this.filterData}
                                                >
                                                    <option value="0">{i18n.t('static.common.all')}</option>
                                                    {realmList}
                                                </Input>

                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                }
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.dataSource.program')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {programList}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.datasourcetype.datasourcetype')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="dataSourceTypeId"
                                                id="dataSourceTypeId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {dataSourceTypeList}
                                            </Input>
                                            {/* <InputGroupAddon addonType="append">
                                                <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                            </InputGroupAddon> */}
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DATA_SOURCE') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"}>
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
                </Card>

            </div>
        );
    }

}
