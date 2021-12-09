
// import React, { Component } from 'react';
// import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// // import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import i18n from '../../i18n'
// import RealmService from "../../api/RealmService";
// import ProcurementAgentService from "../../api/ProcurementAgentService";
// import AuthenticationService from '../Common/AuthenticationService.js';
// import getLabelText from '../../CommonComponent/getLabelText';
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator'
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'

// const entityname = i18n.t('static.procurementagent.procurementagent')
// class ListProcurementAgentComponent extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             realms: [],
//             procurementAgentList: [],
//             message: '',
//             selProcurementAgent: [],
//             lang: localStorage.getItem('lang'),
//             loading: true
//         }
//         this.editProcurementAgent = this.editProcurementAgent.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.addNewProcurementAgent = this.addNewProcurementAgent.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this.buttonFormatter = this.buttonFormatter.bind(this);
//         this.buttonFormatterForProcurementUnit = this.buttonFormatterForProcurementUnit.bind(this);
//         this.addPlanningUnitMapping = this.addPlanningUnitMapping.bind(this);
//         this.addProcurementUnitMapping = this.addProcurementUnitMapping.bind(this);
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

//     addPlanningUnitMapping(event, cell) {
//         event.stopPropagation();
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_PROCUREMENT_AGENT')) {
//             this.props.history.push({
//                 pathname: `/procurementAgent/addProcurementAgentPlanningUnit/${cell}`,
//             });
//             // AuthenticationService.setupAxiosInterceptors();
//             // ProcurementAgentService.getProcurementAgentPlaningUnitList(cell)
//             //     .then(response => {
//             //         if (response.status == 200) {
//             //             let myReasponse = response.data;
//             //             this.props.history.push({
//             //                 pathname: "/procurementAgent/addProcurementAgentPlanningUnit",
//             //                 state: {
//             //                     procurementAgentPlanningUnit: myReasponse,
//             //                     procurementAgentId:cell
//             //                 }

//             //             })
//             //         } else {
//             //             this.setState({
//             //                 message: response.data.messageCode
//             //             })
//             //         }
//             //     }).catch(
//             //         error => {
//             //             if (error.message === "Network Error") {
//             //                 this.setState({ message: error.message });
//             //             } else {
//             //                 switch (error.response ? error.response.status : "") {
//             //                     case 500:
//             //                     case 401:
//             //                     case 404:
//             //                     case 406:
//             //                     case 412:
//             //                         this.setState({ message: error.response.data.messageCode });
//             //                         break;
//             //                     default:
//             //                         this.setState({ message: 'static.unkownError' });
//             //                         console.log("Error code unkown");
//             //                         break;
//             //                 }
//             //             }
//             //         }
//             //     );
//         }
//     }

//     addProcurementUnitMapping(event, cell) {
//         event.stopPropagation();
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_PROCUREMENT_AGENT')) {
//             this.props.history.push({
//                 pathname: `/procurementAgent/addProcurementAgentProcurementUnit/${cell}`,
//             });
//             // AuthenticationService.setupAxiosInterceptors();
//             // ProcurementAgentService.getProcurementAgentProcurementUnitList(cell)
//             //     .then(response => {
//             //         if (response.status == 200) {
//             //             let myResponse = response.data;
//             //             this.props.history.push({
//             //                 pathname: "/procurementAgent/addProcurementAgentProcurementUnit",
//             //                 state: {
//             //                     procurementAgentProcurementUnit: myResponse,
//             //                     procurementAgentId:cell
//             //                 }
//             //             })
//             //         } else {
//             //             this.setState({
//             //                 message: response.data.messageCode
//             //             })
//             //         }
//             //     }).catch(
//             //         error => {
//             //             if (error.message === "Network Error") {
//             //                 this.setState({ message: error.message });
//             //             } else {
//             //                 switch (error.response ? error.response.status : "") {
//             //                     case 500:
//             //                     case 401:
//             //                     case 404:
//             //                     case 406:
//             //                     case 412:
//             //                         this.setState({ message: error.response.data.messageCode });
//             //                         break;
//             //                     default:
//             //                         this.setState({ message: 'static.unkownError' });
//             //                         console.log("Error code unkown");
//             //                         break;
//             //                 }
//             //             }
//             //         }
//             //     );
//         }
//     }

//     addNewProcurementAgent() {
//         this.props.history.push("/procurementAgent/addProcurementAgent");
//     }
//     filterData() {
//         let realmId = document.getElementById("realmId").value;
//         if (realmId != 0) {
//             const selProcurementAgent = this.state.procurementAgentList.filter(c => c.realm.id == realmId)
//             this.setState({
//                 selProcurementAgent
//             });
//         } else {
//             this.setState({
//                 selProcurementAgent: this.state.procurementAgentList
//             });
//         }
//     }
//     editProcurementAgent(procurementAgent) {
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_PROCUREMENT_AGENT')) {
//             this.props.history.push({
//                 pathname: `/procurementAgent/editProcurementAgent/${procurementAgent.procurementAgentId}`,
//                 // state: { procurementAgent }
//             });
//         }
//     }
//     buttonFormatter(cell, row) {
//         console.log("button formater cell-----------", cell);
//         return <Button type="button" size="sm" color="success" onClick={(event) => this.addPlanningUnitMapping(event, cell)} ><i className="fa fa-check"></i> {i18n.t('static.common.add')}</Button>;
//     }

//     buttonFormatterForProcurementUnit(cell, row) {
//         return <Button type="button" size="sm" color="success" onClick={(event) => this.addProcurementUnitMapping(event, cell)} ><i className="fa fa-check"></i> {i18n.t('static.common.add')}</Button>;
//     }
//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         this.hideFirstComponent();
//         RealmService.getRealmListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         realms: response.data, loading: false
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
//         // .catch(
//         //     error => {
//         //         if (error.message === "Network Error") {
//         //             this.setState({ message: error.message });
//         //         } else {
//         //             switch (error.response ? error.response.status : "") {
//         //                 case 500:
//         //                 case 401:
//         //                 case 404:
//         //                 case 406:
//         //                 case 412:
//         //                     this.setState({ message: error.response.data.messageCode });
//         //                     break;
//         //                 default:
//         //                     this.setState({ message: 'static.unkownError' });
//         //                     break;
//         //             }
//         //         }
//         //     }
//         // );

//         ProcurementAgentService.getProcurementAgentListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         procurementAgentList: response.data,
//                         selProcurementAgent: response.data
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
//         // .catch(
//         //     error => {
//         //         if (error.message === "Network Error") {
//         //             this.setState({ message: error.message });
//         //         } else {
//         //             switch (error.response ? error.response.status : "") {
//         //                 case 500:
//         //                 case 401:
//         //                 case 404:
//         //                 case 406:
//         //                 case 412:
//         //                     this.setState({ message: error.response.data.messageCode });
//         //                     break;
//         //                 default:
//         //                     this.setState({ message: 'static.unkownError' });
//         //                     break;
//         //             }
//         //         }
//         //     }
//         // );
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

//         const { realms } = this.state;
//         let realmList = realms.length > 0
//             && realms.map((item, i) => {
//                 return (
//                     <option key={i} value={item.realmId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const columns = [
//             {
//                 dataField: 'realm.label',
//                 text: i18n.t('static.realm.realm'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'label',
//                 text: i18n.t('static.procurementagent.procurementagentname'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'procurementAgentCode',
//                 text: i18n.t('static.procurementagent.procurementagentcode'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'colorHtmlCode',
//                 text: i18n.t('static.procurementagent.procurementAgentColorCode'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'submittedToApprovedLeadTime',
//                 text: i18n.t('static.procurementagent.procurementagentsubmittoapprovetime'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'approvedToShippedLeadTime',
//                 text: i18n.t('static.procurementagent.procurementagentapprovetoshippedtime'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'localProcurementAgent',
//                 text: i18n.t('static.procurementAgent.localProcurementAgent'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cellContent, row) => {
//                     return (
//                         (row.localProcurementAgent ? i18n.t('static.program.yes') : i18n.t('static.program.no'))
//                     );
//                 }
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
//             },
//             {
//                 dataField: 'procurementAgentId',
//                 text: i18n.t('static.program.mapPlanningUnit'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.buttonFormatter
//             },
//             {
//                 dataField: 'procurementAgentId',
//                 text: i18n.t('static.procurementAgentProcurementUnit.mapProcurementUnit'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.buttonFormatterForProcurementUnit
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
//                 text: 'All', value: this.state.selProcurementAgent.length
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
//                         {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '} */}
//                         <div className="card-header-actions">
//                             <div className="card-header-action">
//                                 {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_PROCUREMENT_AGENT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewProcurementAgent}><i className="fa fa-plus-square"></i></a>}
//                             </div>
//                         </div>
//                     </div>
//                     <CardBody className="pb-lg-0">
//                         <Col md="3 pl-0">
//                             <FormGroup className="Selectdiv ">
//                                 <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
//                                 <div className="controls SelectGo">
//                                     <InputGroup>
//                                         <Input
//                                             type="select"
//                                             name="realmId"
//                                             id="realmId"
//                                             bsSize="sm"
//                                             onChange={this.filterData}
//                                         >
//                                             <option value="0">{i18n.t('static.common.all')}</option>
//                                             {realmList}
//                                         </Input>
//                                         {/* <InputGroupAddon addonType="append">
//                                             <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
//                                         </InputGroupAddon> */}
//                                     </InputGroup>
//                                 </div>
//                             </FormGroup>
//                         </Col>
//                         <ToolkitProvider
//                             keyField="procurementAgentId"
//                             data={this.state.selProcurementAgent}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (
//                                     <div className="TableCust listprocurementagent">
//                                         <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
//                                             <SearchBar {...props.searchProps} />
//                                             <ClearSearchButton {...props.searchProps} />
//                                         </div>
//                                         <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                                             pagination={paginationFactory(options)}
//                                             rowEvents={{
//                                                 onClick: (e, row, rowIndex) => {
//                                                     this.editProcurementAgent(row);
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
// export default ListProcurementAgentComponent;


import React, { Component } from 'react';
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import i18n from '../../i18n'
import RealmService from "../../api/RealmService";
import ProcurementAgentService from "../../api/ProcurementAgentService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import moment from 'moment';
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants';


const entityname = i18n.t('static.procurementagent.procurementagent')
class ListProcurementAgentComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            procurementAgentList: [],
            message: '',
            selProcurementAgent: [],
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.editProcurementAgent = this.editProcurementAgent.bind(this);
        this.filterData = this.filterData.bind(this);
        this.addNewProcurementAgent = this.addNewProcurementAgent.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.buttonFormatter = this.buttonFormatter.bind(this);
        this.buttonFormatterForProcurementUnit = this.buttonFormatterForProcurementUnit.bind(this);
        this.addPlanningUnitMapping = this.addPlanningUnitMapping.bind(this);
        this.addProcurementUnitMapping = this.addProcurementUnitMapping.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);

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

    addPlanningUnitMapping(event, cell) {
        event.stopPropagation();
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_PLANNING_UNIT')) {
            this.props.history.push({
                pathname: `/procurementAgent/addProcurementAgentPlanningUnit/${cell}`,
            });
            // AuthenticationService.setupAxiosInterceptors();
            // ProcurementAgentService.getProcurementAgentPlaningUnitList(cell)
            //     .then(response => {
            //         if (response.status == 200) {
            //             let myReasponse = response.data;
            //             this.props.history.push({
            //                 pathname: "/procurementAgent/addProcurementAgentPlanningUnit",
            //                 state: {
            //                     procurementAgentPlanningUnit: myReasponse,
            //                     procurementAgentId:cell
            //                 }

            //             })
            //         } else {
            //             this.setState({
            //                 message: response.data.messageCode
            //             })
            //         }
            //     }).catch(
            //         error => {
            //             if (error.message === "Network Error") {
            //                 this.setState({ message: error.message });
            //             } else {
            //                 switch (error.response ? error.response.status : "") {
            //                     case 500:
            //                     case 401:
            //                     case 404:
            //                     case 406:
            //                     case 412:
            //                         this.setState({ message: error.response.data.messageCode });
            //                         break;
            //                     default:
            //                         this.setState({ message: 'static.unkownError' });
            //                         console.log("Error code unkown");
            //                         break;
            //                 }
            //             }
            //         }
            //     );
        }
    }

    addProcurementUnitMapping(event, cell) {
        event.stopPropagation();
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_PROCUREMENT_UNIT')) {
            this.props.history.push({
                pathname: `/procurementAgent/addProcurementAgentProcurementUnit/${cell}`,
            });
            // AuthenticationService.setupAxiosInterceptors();
            // ProcurementAgentService.getProcurementAgentProcurementUnitList(cell)
            //     .then(response => {
            //         if (response.status == 200) {
            //             let myResponse = response.data;
            //             this.props.history.push({
            //                 pathname: "/procurementAgent/addProcurementAgentProcurementUnit",
            //                 state: {
            //                     procurementAgentProcurementUnit: myResponse,
            //                     procurementAgentId:cell
            //                 }
            //             })
            //         } else {
            //             this.setState({
            //                 message: response.data.messageCode
            //             })
            //         }
            //     }).catch(
            //         error => {
            //             if (error.message === "Network Error") {
            //                 this.setState({ message: error.message });
            //             } else {
            //                 switch (error.response ? error.response.status : "") {
            //                     case 500:
            //                     case 401:
            //                     case 404:
            //                     case 406:
            //                     case 412:
            //                         this.setState({ message: error.response.data.messageCode });
            //                         break;
            //                     default:
            //                         this.setState({ message: 'static.unkownError' });
            //                         console.log("Error code unkown");
            //                         break;
            //                 }
            //             }
            //         }
            //     );
        }
    }

    addNewProcurementAgent() {
        this.props.history.push("/procurementAgent/addProcurementAgent");
    }
    filterData() {
        let realmId = document.getElementById("realmId").value;
        if (realmId != 0) {
            const selProcurementAgent = this.state.procurementAgentList.filter(c => c.realm.id == realmId)
            this.setState({
                selProcurementAgent
            }, () => {
                this.buildJExcel();
            });
        } else {
            this.setState({
                selProcurementAgent: this.state.procurementAgentList
            }, () => {
                this.buildJExcel();
            });
        }
    }
    editProcurementAgent(procurementAgent) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROCUREMENT_AGENT')) {
            this.props.history.push({
                pathname: `/procurementAgent/editProcurementAgent/${procurementAgent.procurementAgentId}`,
                // state: { procurementAgent }
            });
        }
    }
    buttonFormatter(cell, row) {
        console.log("button formater cell-----------", cell);
        return <Button type="button" size="sm" color="success" onClick={(event) => this.addPlanningUnitMapping(event, cell)} ><i className="fa fa-check"></i> {i18n.t('static.common.add')}</Button>;
    }

    buttonFormatterForProcurementUnit(cell, row) {
        return <Button type="button" size="sm" color="success" onClick={(event) => this.addProcurementUnitMapping(event, cell)} ><i className="fa fa-check"></i> {i18n.t('static.common.add')}</Button>;
    }

    buildJExcel() {
        let procurementAgentList = this.state.selProcurementAgent;
        // console.log("procurementAgentList---->", procurementAgentList);
        let procurementAgentArray = [];
        let count = 0;

        for (var j = 0; j < procurementAgentList.length; j++) {
            data = [];
            data[0] = procurementAgentList[j].procurementAgentId
            data[1] = getLabelText(procurementAgentList[j].realm.label, this.state.lang)
            data[2] = getLabelText(procurementAgentList[j].label, this.state.lang)
            data[3] = procurementAgentList[j].procurementAgentCode;
            data[4] = procurementAgentList[j].colorHtmlCode;
            data[5] = procurementAgentList[j].submittedToApprovedLeadTime;
            data[6] = procurementAgentList[j].approvedToShippedLeadTime;
            data[7] = (procurementAgentList[j].localProcurementAgent ? i18n.t('static.program.yes') : i18n.t('static.program.no'))
            data[8] = procurementAgentList[j].lastModifiedBy.username;
            data[9] = (procurementAgentList[j].lastModifiedDate ? moment(procurementAgentList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            data[10] = procurementAgentList[j].active;


            procurementAgentArray[count] = data;
            count++;
        }
        // if (procurementAgentList.length == 0) {
        //     data = [];
        //     procurementAgentArray[0] = data;
        // }
        // console.log("procurementAgentArray---->", procurementAgentArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = procurementAgentArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [0, 80, 100, 130, 80, 80, 80, 0, 80, 100, 80],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'procurementAgentId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.realm.realm'),
                    type: (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') ? 'text' : 'hidden'),
                    readOnly: true
                },
                {
                    title: i18n.t('static.procurementagent.procurementagentname'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.procurementagent.procurementagentcode'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.procurementagent.procurementAgentColorCode'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.procurementagent.procurementagentsubmittoapprovetimeLabel'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.procurementagent.procurementagentapprovetoshippedtimeLabel'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.procurementAgent.localProcurementAgent'),
                    type: 'hidden',
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
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
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
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {

                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_PLANNING_UNIT')) {
                            items.push({
                                title: i18n.t('static.program.mapPlanningUnit'),
                                onclick: function () {
                                    console.log("onclick------>", this.el.getValueFromCoords(0, y));

                                    this.props.history.push({
                                        pathname: `/procurementAgent/addProcurementAgentPlanningUnit/${this.el.getValueFromCoords(0, y)}`,
                                    });

                                }.bind(this)
                            });
                        }

                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_PROCUREMENT_UNIT')) {
                            items.push({
                                title: i18n.t('static.procurementAgentProcurementUnit.mapProcurementUnit'),
                                onclick: function () {
                                    // console.log("onclick------>", this.el.getValueFromCoords(0, y));

                                    this.props.history.push({
                                        pathname: `/procurementAgent/addProcurementAgentProcurementUnit/${this.el.getValueFromCoords(0, y)}`,
                                    });

                                }.bind(this)
                            });
                        }
                    }
                }


                return items;
            }.bind(this)
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }

    selected = function (instance, cell, x, y, value) {

        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            // console.log("Original Value---->>>>>", this.el.getValueFromCoords(0, x));
            if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROCUREMENT_AGENT')) {
                this.props.history.push({
                    pathname: `/procurementAgent/editProcurementAgent/${this.el.getValueFromCoords(0, x)}`,
                });
            }
        }
    }.bind(this);

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        this.hideFirstComponent();
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
                        realms: listArray
                    })
                } else {
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

        ProcurementAgentService.getProcurementAgentListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        procurementAgentList: response.data,
                        selProcurementAgent: response.data,
                    },
                        () => {
                            this.buildJExcel();
                        })
                } else {
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

        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const columns = [
            {
                dataField: 'realm.label',
                text: i18n.t('static.realm.realm'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel
            },
            {
                dataField: 'label',
                text: i18n.t('static.procurementagent.procurementagentname'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel
            },
            {
                dataField: 'procurementAgentCode',
                text: i18n.t('static.procurementagent.procurementagentcode'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'colorHtmlCode',
                text: i18n.t('static.procurementagent.procurementAgentColorCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'submittedToApprovedLeadTime',
                text: i18n.t('static.procurementagent.procurementagentsubmittoapprovetimeLabel'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'approvedToShippedLeadTime',
                text: i18n.t('static.procurementagent.procurementagentapprovetoshippedtimeLabel'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'localProcurementAgent',
                text: i18n.t('static.procurementAgent.localProcurementAgent'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cellContent, row) => {
                    return (
                        (row.localProcurementAgent ? i18n.t('static.program.yes') : i18n.t('static.program.no'))
                    );
                }
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
            },
            {
                dataField: 'procurementAgentId',
                text: i18n.t('static.program.mapPlanningUnit'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.buttonFormatter
            },
            {
                dataField: 'procurementAgentId',
                text: i18n.t('static.procurementAgentProcurementUnit.mapProcurementUnit'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.buttonFormatterForProcurementUnit
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
                text: 'All', value: this.state.selProcurementAgent.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '} */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_PROCUREMENT_AGENT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewProcurementAgent}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') &&
                            <Col md="3 pl-0">
                                <FormGroup className="Selectdiv mt-md-2 mb-md-0">
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
                                            {/* <InputGroupAddon addonType="append">
                                            <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon> */}
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </Col>
                        }
                        {/* <div id="loader" className="center"></div> */}
                        <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROCUREMENT_AGENT') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
export default ListProcurementAgentComponent;

