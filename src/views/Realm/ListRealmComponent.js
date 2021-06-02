// import React, { Component } from 'react';
// import RealmService from '../../api/RealmService'
// import AuthenticationService from '../Common/AuthenticationService.js';
// import { NavLink } from 'react-router-dom'
// import { Card, CardHeader, CardBody, Button } from 'reactstrap';
// import getLabelText from '../../CommonComponent/getLabelText'
// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import i18n from '../../i18n';

// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator'
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'


// const entityname = i18n.t('static.realm.realm');
// export default class ReactListComponent extends Component {


//     constructor(props) {
//         super(props);
//         this.state = {
//             realmList: [],
//             message: '',
//             selRealm: [],
//             loading: true
//         }
//         this.addNewRealm = this.addNewRealm.bind(this);
//         this.editRealm = this.editRealm.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this.hideFirstComponent = this.hideFirstComponent.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);
//     }
//     hideFirstComponent() {
//         setTimeout(function () {
//             document.getElementById('div1').style.display = 'none';
//         }, 8000);
//     }

//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }
//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         this.hideFirstComponent();
//         RealmService.getRealmListAll().then(response => {
//             if (response.status == 200) {
//                 this.setState({
//                     realmList: response.data,
//                     selRealm: response.data,
//                     loading: false
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
//     editRealm(realm) {
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_REALM')) {
//             this.props.history.push({
//                 pathname: `/realm/updateRealm/${realm.realmId}`,
//                 // state: { realm: realm }
//             });
//         }
//     }

//     addNewRealm() {
//         if (navigator.onLine) {
//             this.props.history.push(`/realm/addRealm`)
//         } else {
//             alert("You must be Online.")
//         }

//     }
//     RealmCountry(event, row) {
//         event.stopPropagation();
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_REALM_COUNTRY')) {
//             console.log(JSON.stringify(row))
//             this.props.history.push({
//                 pathname: `/realmCountry/RealmCountry/${row.realmId}`,
//                 state: { realm: row }


//             })
//         }
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

//         const columns = [
//             {
//                 dataField: 'label',
//                 text: i18n.t('static.realm.realmName'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'realmCode',
//                 text: i18n.t('static.realm.realmCode'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'minMosMinGaurdrail',
//                 text: i18n.t('static.realm.minMosMinGaurdraillabel'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'minMosMaxGaurdrail',
//                 text: i18n.t('static.realm.minMosMaxGaurdraillabel'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'maxMosMaxGaurdrail',
//                 text: i18n.t('static.realm.maxMosMaxGaurdraillabel'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'realmId',
//                 text: 'Action',
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cellContent, row) => {
//                     return (<div><Button type="button" size="sm" color="success" onClick={(event) => this.RealmCountry(event, row)} ><i className="fa fa-check"></i>{i18n.t('static.realm.mapcountry')}</Button>
//                     </div>)
//                 }
//             }
//             // {
//             //     dataField: 'defaultRealm',
//             //     text: i18n.t('static.realm.default'),
//             //     sort: true,
//             //     align: 'center',
//             //     headerAlign: 'center',
//             //     formatter: (cellContent, row) => {
//             //         return (
//             //             (row.defaultRealm ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
//             //         );
//             //     }
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
//                 text: 'All', value: this.state.selRealm.length
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
//                                 {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_CREATE_REALM') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewRealm}><i className="fa fa-plus-square"></i></a>}
//                             </div>
//                         </div>
//                     </div>
//                     <CardBody className="pb-lg-0 ">
//                         <ToolkitProvider
//                             keyField="realmId"
//                             data={this.state.selRealm}
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
//                                         <BootstrapTable striped hover noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                                             pagination={paginationFactory(options)}
//                                             rowEvents={{
//                                                 onClick: (e, row, rowIndex) => {
//                                                     this.editRealm(row);
//                                                 }
//                                             }}
//                                             {...props.baseProps}
//                                         />
//                                     </div>
//                                 )
//                             }
//                         </ToolkitProvider>
//                         {/* <BootstrapTable data={this.state.realmList} version="4" hover pagination search options={this.options}>
//                             <TableHeaderColumn isKey filterFormatted dataField="realmCode" dataSort dataAlign="center">Realm Code</TableHeaderColumn>
//                             <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showRealmLabel} dataAlign="center">Realm Name (English)</TableHeaderColumn>
//                             <TableHeaderColumn filterFormatted dataField="monthInPastForAmc" dataSort dataAlign="center">Month In Past For AMC</TableHeaderColumn>
//                             <TableHeaderColumn filterFormatted dataField="monthInFutureForAmc" dataSort dataAlign="center">Month In Future For AMC</TableHeaderColumn>
//                             <TableHeaderColumn filterFormatted dataField="orderFrequency" dataSort dataAlign="center">Order Frequency</TableHeaderColumn>
//                             <TableHeaderColumn dataField="defaultRealm" dataSort dataFormat={this.showStatus} dataAlign="center">Default</TableHeaderColumn>
//                         </BootstrapTable> */}
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
//-------------------------------------------------------------------

import React, { Component } from 'react';
import RealmService from '../../api/RealmService'
import AuthenticationService from '../Common/AuthenticationService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import i18n from '../../i18n';

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import moment from 'moment';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM } from '../../Constants';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';

const entityname = i18n.t('static.realm.realm');
export default class ReactListComponent extends Component {


    constructor(props) {
        super(props);
        this.state = {
            realmList: [],
            message: '',
            selRealm: [],
            loading: true,
            lang: localStorage.getItem("lang"),
        }
        this.addNewRealm = this.addNewRealm.bind(this);
        this.editRealm = this.editRealm.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
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
    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        this.hideFirstComponent();
        RealmService.getRealmListAll().then(response => {
            if (response.status == 200) {
                this.setState({
                    realmList: response.data,
                    selRealm: response.data,
                },
                    () => {
                        let realmList = this.state.selRealm;
                        // console.log("realmList---->", realmList);
                        let realmArray = [];
                        let count = 0;

                        for (var j = 0; j < realmList.length; j++) {
                            data = [];
                            data[0] = realmList[j].realmId
                            data[1] = getLabelText(realmList[j].label, this.state.lang)
                            data[2] = realmList[j].realmCode;
                            data[3] = realmList[j].minMosMinGaurdrail;
                            data[4] = realmList[j].minMosMaxGaurdrail;
                            data[5] = realmList[j].maxMosMaxGaurdrail;

                            data[6] = realmList[j].minQplTolerance;
                            data[7] = realmList[j].minQplToleranceCutOff;
                            data[8] = realmList[j].maxQplTolerance;

                            data[9] = realmList[j].lastModifiedBy.username;
                            data[10] = (realmList[j].lastModifiedDate ? moment(realmList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
                            data[11] = realmList[j].active;

                            realmArray[count] = data;
                            count++;
                        }
                        // if (realmList.length == 0) {
                        //     data = [];
                        //     realmArray[0] = data;
                        // }
                        // console.log("realmArray---->", realmArray);
                        this.el = jexcel(document.getElementById("tableDiv"), '');
                        this.el.destroy();
                        var json = [];
                        var data = realmArray;

                        var options = {
                            data: data,
                            columnDrag: true,
                            colWidths: [0, 100, 90, 90, 90, 90, 100, 120, 90],
                            colHeaderClasses: ["Reqasterisk"],
                            columns: [
                                {
                                    title: 'realmId',
                                    type: 'hidden',
                                },
                                {
                                    title: i18n.t('static.realm.realmName'),
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: i18n.t('static.realm.realmCode'),
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: i18n.t('static.realm.minMosMinGaurdraillabel'),
                                    type: 'numeric', mask: '#,##.00', decimal: '.',
                                    readOnly: true
                                },
                                {
                                    title: i18n.t('static.realm.minMosMaxGaurdraillabel'),
                                    type: 'numeric', mask: '#,##.00', decimal: '.',
                                    readOnly: true
                                },
                                {
                                    title: i18n.t('static.realm.maxMosMaxGaurdraillabel'),
                                    type: 'numeric', mask: '#,##.00', decimal: '.',
                                    readOnly: true
                                },
                                {
                                    title: i18n.t('static.realm.minQplTolerance'),
                                    type: 'numeric', mask: '#,##.00', decimal: '.',
                                    readOnly: true
                                },
                                {
                                    title: i18n.t('static.realm.minQplToleranceCutOff'),
                                    type: 'numeric', mask: '#,##.00', decimal: '.',
                                    readOnly: true
                                },
                                {
                                    title: i18n.t('static.realm.maxQplTolerance'),
                                    type: 'numeric', mask: '#,##.00', decimal: '.',
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
                                        items.push({
                                            title: i18n.t('static.realm.mapRealmCountry'),
                                            onclick: function () {
                                                // console.log("onclick------>", this.el.getValueFromCoords(0, y));
                                                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_REALM_COUNTRY')) {
                                                    this.props.history.push({
                                                        pathname: `/realmCountry/RealmCountry/${this.el.getValueFromCoords(0, y)}`,
                                                        // state: { realm: row }
                                                    })
                                                }

                                            }.bind(this)
                                        });
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

    selected = function (instance, cell, x, y, value) {
        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            // console.log("Original Value---->>>>>", this.el.getValueFromCoords(0, x));
            if (this.state.selRealm.length != 0) {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_REALM')) {
                    this.props.history.push({
                        pathname: `/realm/updateRealm/${this.el.getValueFromCoords(0, x)}`,
                    });
                }
            }
        }
    }.bind(this);


    editRealm(realm) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_REALM')) {
            this.props.history.push({
                pathname: `/realm/updateRealm/${realm.realmId}`,
                // state: { realm: realm }
            });
        }
    }

    addNewRealm() {
        if (isSiteOnline()) {
            this.props.history.push(`/realm/addRealm`)
        } else {
            alert("You must be Online.")
        }

    }
    RealmCountry(event, row) {
        event.stopPropagation();
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_REALM_COUNTRY')) {
            console.log(JSON.stringify(row))
            this.props.history.push({
                pathname: `/realmCountry/RealmCountry/${row.realmId}`,
                state: { realm: row }


            })
        }
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
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

        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '} */}

                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_CREATE_REALM') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewRealm}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>
                    </div>
                    <CardBody className=" pt-md-1 pb-md-1 table-responsive">
                        {/* <div id="loader" className="center"></div> */}<div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_REALM') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"}>
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


