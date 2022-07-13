// import React, { Compoent, Component } from 'react';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import CurrencyService from '../../api/CurrencyService.js';
// import { NavLink } from 'react-router-dom'
// import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';

// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import data from '../Tables/DataTable/_data';
// import i18n from '../../i18n';
// import getLabelText from '../../CommonComponent/getLabelText'
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator'
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'

// const entityname = i18n.t('static.currency.currencyMaster');
// export default class CurrencyListComponent extends Component {


//     constructor(props) {
//         super(props);
//         // this.table = data.rows;
//         // this.options = {
//         //     sortIndicator: true,
//         //     hideSizePerPage: true,
//         //     paginationSize: 3,
//         //     hidePageListOnlyOnePage: true,
//         //     clearSearch: true,
//         //     alwaysShowAllBtns: false,
//         //     withFirstAndLast: false,
//         //     onRowClick: function (row) {
//         //             this.editCurrency(row);
//         //     }.bind(this)

//         // }
//         this.state = {
//             currencyList: [],
//             message: '',
//             lang: localStorage.getItem('lang'),
//             selCurrency: [],
//             loading: true
//         }
//         this.editCurrency = this.editCurrency.bind(this);
//         this.addNewCurrency = this.addNewCurrency.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);
//     }

//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }
//     hideFirstComponent() {
//         this.timeout = setTimeout(function () {
//         document.getElementById('div1').style.display = 'none';
//         }, 8000);
//         }
//         componentWillUnmount() {
//         clearTimeout(this.timeout);
//         }

//     componentDidMount() {
//         this.hideFirstComponent();
//         CurrencyService.getCurrencyList().then(response => {
//             if (response.status == 200) {
//                 this.setState({
//                     currencyList: response.data,
//                     selCurrency: response.data,
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

//     editCurrency(currency) {
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_CURRENCY')) {
//             this.props.history.push({
//                 pathname: `/currency/editCurrency/${currency.currencyId}`,
//                 // state: { currency: currency }
//             });
//         }
//     }

//     addNewCurrency() {

//         if (navigator.onLine) {
//             this.props.history.push(`/currency/addCurrency`)
//         } else {
//             alert("You must be Online.")
//         }

//     }

//     // showCurrencyLabel(cell, row) {
//     //     return cell.label_en;
//     // }

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
//                 text: i18n.t('static.currency.currency'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'currencyCode',
//                 text: i18n.t('static.currency.currencycode'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             // {
//             //     dataField: 'currencySymbol',
//             //     text: i18n.t('static.currency.currencysymbol'),
//             //     sort: true,
//             //     align: 'center',
//             //     headerAlign: 'center'
//             // },
//             {
//                 dataField: 'conversionRateToUsd',
//                 text: i18n.t('static.currency.conversionrateusd'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             }
//             // {
//             //     dataField: 'active',
//             //     text: i18n.t('static.common.status'),
//             //     sort: true,
//             //     align: 'center',
//             //     headerAlign: 'center',
//             //     formatter: (cellContent, row) => {
//             //         return (
//             //             (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
//             //         );
//             //     }
//             // }
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
//                 text: 'All', value: this.state.selCurrency.length
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
//                         {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.currencylist')}</strong>{' '} */}

//                         <div className="card-header-actions">
//                             <div className="card-header-action">
//                                 {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_CURRENCY') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewCurrency}><i className="fa fa-plus-square"></i></a>}
//                             </div>
//                         </div>
//                     </div>
//                     <CardBody className="pb-lg-0 ">
//                         {/* <BootstrapTable data={this.state.currencyList} version="4" hover pagination search options={this.options}>
//                             <TableHeaderColumn isKey filterFormatted dataField="currencyCode" dataSort dataAlign="center">{i18n.t('static.currency.currencycode')}</TableHeaderColumn>
//                             <TableHeaderColumn filterFormatted dataField="currencySymbol" dataSort dataAlign="center">{i18n.t('static.currency.currencysymbol')}</TableHeaderColumn>
//                             <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showCurrencyLabel} dataAlign="center">{i18n.t('static.currency.currency')}</TableHeaderColumn>
//                             <TableHeaderColumn dataField="conversionRateToUsd" dataSort dataAlign="center">{i18n.t('static.currency.conversionrateusd')}</TableHeaderColumn>
//                         </BootstrapTable> */}
//                         <ToolkitProvider
//                             keyField="currencyId"
//                             data={this.state.selCurrency}
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
//                                                     this.editCurrency(row);
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





//---------------------------JEXCEL CONVERSION FROM BOOTSTRAP-------------------------------//






import React, { Compoent, Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import CurrencyService from '../../api/CurrencyService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import data from '../Tables/DataTable/_data';
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText'
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
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM } from '../../Constants.js';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';
const entityname = i18n.t('static.currency.currencyMaster');
export default class CurrencyListComponent extends Component {


    constructor(props) {
        super(props);
        // this.table = data.rows;
        // this.options = {
        //     sortIndicator: true,
        //     hideSizePerPage: true,
        //     paginationSize: 3,
        //     hidePageListOnlyOnePage: true,
        //     clearSearch: true,
        //     alwaysShowAllBtns: false,
        //     withFirstAndLast: false,
        //     onRowClick: function (row) {
        //             this.editCurrency(row);
        //     }.bind(this)

        // }
        this.state = {
            currencyList: [],
            message: '',
            lang: localStorage.getItem('lang'),
            selCurrency: [],
            loading: true
        }
        this.editCurrency = this.editCurrency.bind(this);
        this.addNewCurrency = this.addNewCurrency.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    componentDidMount() {
        this.hideFirstComponent();
        CurrencyService.getCurrencyList().then(response => {
            if (response.status == 200) {
                // this.setState({
                //     currencyList: response.data,
                //     selCurrency: response.data,
                //     loading: false
                // })
                this.setState({
                    currencyList: response.data,
                    selCurrency: response.data,
                    loading: false
                },
                    () => {

                        let currencyList = this.state.currencyList;
                        // console.log("currencyList---->", currencyList);
                        let currencyArray = [];
                        let count = 0;

                        for (var j = 0; j < currencyList.length; j++) {
                            data = [];
                            data[0] = currencyList[j].currencyId
                            data[1] = getLabelText(currencyList[j].label, this.state.lang)
                            data[2] = currencyList[j].currencyCode;
                            data[3] = currencyList[j].conversionRateToUsd;
                            data[4] = currencyList[j].lastModifiedBy.username;
                            data[5] = (currencyList[j].lastModifiedDate ? moment(currencyList[j].lastModifiedDate).format("YYYY-MM-DD") : null)

                            currencyArray[count] = data;
                            count++;
                        }
                        // if (currencyList.length == 0) {
                        //     data = [];
                        //     currencyArray[0] = data;
                        // }
                        // console.log("currencyArray---->", currencyArray);
                        this.el = jexcel(document.getElementById("tableDiv"), '');
                        this.el.destroy();
                        var json = [];
                        var data = currencyArray;

                        var options = {
                            data: data,
                            columnDrag: true,
                            // colWidths: [150, 150, 100],
                            colHeaderClasses: ["Reqasterisk"],
                            columns: [
                                {
                                    title: 'currencyId',
                                    type: 'hidden',
                                    readOnly: true
                                },
                                {
                                    title: i18n.t('static.currency.currency'),
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: i18n.t('static.currency.currencycode'),
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: i18n.t('static.currency.conversionrateusd'),
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
                                    readOnly: true,
                                    type: 'calendar',
                                    options: { format: JEXCEL_DATE_FORMAT_SM },
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
                                return false;
                            }.bind(this),
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

    editCurrency(currency) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_CURRENCY')) {
            this.props.history.push({
                pathname: `/currency/editCurrency/${currency.currencyId}`,
                // state: { currency: currency }
            });
        }
    }
    selected = function (instance, cell, x, y, value) {

        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_CURRENCY')) {
                this.props.history.push({
                    pathname: `/currency/editCurrency/${this.el.getValueFromCoords(0, x)}`,
                    // state: { currency: currency }
                });
            }
        }
    }.bind(this);

    addNewCurrency() {

        if (isSiteOnline()) {
            this.props.history.push(`/currency/addCurrency`)
        } else {
            alert("You must be Online.")
        }

    }

    // showCurrencyLabel(cell, row) {
    //     return cell.label_en;
    // }
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
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.currencylist')}</strong>{' '} */}

                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_CURRENCY') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewCurrency}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>
                    </div>
                    <CardBody className="table-responsive pt-md-1 pb-md-1">
                        {/* <div id="loader" className="center"></div> */}
                        <div className='consumptionDataEntryTable'>
                        <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_CURRENCY') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
                        </div>
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