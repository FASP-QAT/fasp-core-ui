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





import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmCountryService from '../../api/RealmCountryService';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { JEXCEL_DEFAULT_PAGINATION, JEXCEL_PAGINATION_OPTION } from '../../Constants';
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
            allowAdd: false

        }
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.addNewEntity = this.addNewEntity.bind(this);
    }

    addNewEntity() {
        let realmCountryId = document.getElementById("realmCountryId").value;
        if (realmCountryId != 0) {
            this.props.history.push({
                pathname: `/realmCountry/realmCountryPlanningUnit/${realmCountryId}`,
            })
        }
    }

    buildJexcel() {
        let realmCountryList = this.state.selSource;
        // console.log("realmCountryList---->", realmCountryList);
        let realmCountryArray = [];
        let count = 0;

        for (var j = 0; j < realmCountryList.length; j++) {
            data = [];
            data[0] = realmCountryList[j].realmCountryId
            data[1] = getLabelText(realmCountryList[j].realmCountry.label, this.state.lang)
            data[2] = getLabelText(realmCountryList[j].planningUnit.label, this.state.lang)
            data[3] = getLabelText(realmCountryList[j].label, this.state.lang)
            data[4] = realmCountryList[j].skuCode;
            data[5] = getLabelText(realmCountryList[j].unit.label, this.state.lang)
            data[6] = realmCountryList[j].multiplier;
            data[7] = realmCountryList[j].active;

            realmCountryArray[count] = data;
            count++;
        }
        // if (realmCountryList.length == 0) {
        //     data = [];
        //     realmCountryArray[0] = data;
        // }
        // console.log("realmCountryArray---->", realmCountryArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = realmCountryArray;

        var options = {
            data: data,
            columnDrag: true,
            // colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'realmCountryId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.dashboard.realmcountry'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.planningunit.planningunit'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.planningunit.countrysku'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.procurementAgentProcurementUnit.skuCode'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.unit.unit'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.unit.multiplier'),
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

    filterData() {
        this.setState({ loading: true })
        let realmCountryId = document.getElementById("realmCountryId").value;
        if (realmCountryId == 0) {
            this.setState({ allowAdd: false })
        } else {
            this.setState({ allowAdd: true })
        }
        // AuthenticationService.setupAxiosInterceptors();
        RealmCountryService.getRealmCountryPlanningUnitAllByrealmCountryId(realmCountryId).then(response => {
            console.log(response.data)
            this.setState({
                realmCountryPlanningUnitList: response.data,
                selSource: response.data,
            },
                () => { this.buildJexcel() })
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


    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        // RealmCountryService.getRealmCountryListAll().then(response => {
        //     console.log(response.data)

        //     this.setState({
        //         realmCountrys: response.data
        //     },
        //         () => { this.buildJexcel() })
        // })
        //     .catch(
        //         error => {
        //             if (error.message === "Network Error") {
        //                 this.setState({ message: error.message, loading: false });
        //             } else {
        //                 switch (error.response ? error.response.status : "") {
        //                     case 500:
        //                     case 401:
        //                     case 404:
        //                     case 406:
        //                     case 412:
        //                         this.setState({ message: error.response.data.messageCode, loading: false });
        //                         break;
        //                     default:
        //                         this.setState({ message: 'static.unkownError', loading: false });
        //                         break;
        //                 }
        //             }
        //         }
        //     );

        let realmId = AuthenticationService.getRealmId();
        RealmCountryService.getRealmCountryrealmIdById(realmId)
            .then(response => {
                console.log("RealmCountryService---->", response.data)
                if (response.status == 200) {
                    this.setState({
                        realmCountrys: response.data
                    },
                        () => { this.buildJexcel() })
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
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    {/* <CardHeader className="mb-md-3 pb-lg-1">
                        <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>
                        <div className="card-header-actions">

                        </div>

                    </CardHeader> */}
                    {
                        this.state.allowAdd &&
                        < div className="Card-header-addicon">
                            <div className="card-header-actions">
                                <div className="card-header-action">
                                    {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_REALM_COUNTRY_PLANNING_UNIT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewEntity}><i className="fa fa-plus-square"></i></a>}
                                </div>
                            </div>
                        </div>
                    }

                    <CardBody className="">
                        <Col md="3 pl-0">

                            <FormGroup className="Selectdiv mt-md-2 mb-md-0">
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
                                        {/* <InputGroupAddon addonType="append">
                                            <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon> */}
                                    </InputGroup>
                                </div>
                            </FormGroup>

                        </Col>
                        <div id="tableDiv" className="jexcelremoveReadonlybackground ">
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
            </div >
        );
    }

}
