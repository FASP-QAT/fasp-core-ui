// import React, { Component } from 'react';
// import LanguageService from '../../api/LanguageService.js'
// import { NavLink } from 'react-router-dom'
// import { Card, CardHeader, CardBody } from 'reactstrap';
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator'
// import AuthenticationService from '../Common/AuthenticationService.js';
// import data from '../Tables/DataTable/_data';
// import i18n from '../../i18n';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';

// // import { HashRouter, Route, Switch } from 'react-router-dom';
// const entityname = i18n.t('static.language.language');
// export default class LanguageListComponent extends Component {

//     constructor(props) {
//         super(props);
//         /* this.table = data.rows;
//          this.options = {
//              sortIndicator: true,
//              hideSizePerPage: true,
//              paginationSize: 3,
//              hidePageListOnlyOnePage: true,
//              clearSearch: true,
//              alwaysShowAllBtns: false,
//              withFirstAndLast: false,
//              onRowClick: function (row) {
//                  // console.log("row--------------", row);
//                  this.editLanguage(row);
//              }.bind(this)

//          }*/

//         this.state = {
//             langaugeList: [],
//             message: '',
//             selSource: []
//         }
//         this.editLanguage = this.editLanguage.bind(this);
//         this.addLanguage = this.addLanguage.bind(this);
//         this.hideFirstComponent = this.hideFirstComponent.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);

//     }

//     hideFirstComponent() {
//         this.timeout = setTimeout(function () {
//         document.getElementById('div1').style.display = 'none';
//         }, 8000);
//         }
//         componentWillUnmount() {
//         clearTimeout(this.timeout);
//         }

//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }

//     editLanguage(language) {
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_LANGUAGE')) {
//             this.props.history.push({
//                 pathname: `/language/editLanguage/${language.languageId}`,
//                 // state: { language }
//             });
//         }
//     }

//     addLanguage() {
//         if (navigator.onLine) {
//             this.props.history.push(`/language/addLanguage`)
//         } else {
//             alert(i18n.t('static.common.online'))
//         }
//     }



//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         this.hideFirstComponent();
//         LanguageService.getLanguageList()
//             .then(response => {
//                 console.log(response.data)
//                 if (response.status == 200) {
//                     this.setState({ langaugeList: response.data, selSource: response.data })
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
//         //             switch (error.response.status) {
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


//     render() {
//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );

//         const columns = [{
//             dataField: 'languageName',
//             text: i18n.t('static.language.language'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center'
//         }, {
//             dataField: 'languageCode',
//             text: i18n.t('static.language.languageCode'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center'
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
//                 text: '100', value: 100
//             },
//             // {
//             //     text: 'All', value: this.state.selSource.length
//             // }
//         ]
//         }
//         return (
//             <div className="animated">
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />
//                 <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card>
//                     <div className="Card-header-addicon">
//                         {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '} */}
//                         <div className="card-header-actions">
//                             <div className="card-header-action">
//                                 {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_LANGUAGE') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addLanguage}><i className="fa fa-plus-square"></i></a>}
//                             </div>
//                         </div>
//                     </div>
//                     <CardBody className="pb-lg-0 pt-lg-0">
//                         <ToolkitProvider
//                             keyField="languageId"
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
//                                         <BootstrapTable striped hover noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                                             pagination={paginationFactory(options)}
//                                             rowEvents={{
//                                                 onClick: (e, row, rowIndex) => {
//                                                     this.editLanguage(row);
//                                                 }
//                                             }}
//                                             {...props.baseProps}
//                                         />
//                                     </div>
//                                 )
//                             }
//                         </ToolkitProvider>
//                     </CardBody>
//                 </Card><div style={{ display: this.state.loading ? "block" : "none" }}>
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


import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form, InputGroup, Modal, ModalHeader, ModalFooter, ModalBody
} from 'reactstrap';
import React, { Component } from 'react';
import LanguageService from '../../api/LanguageService.js'
import { NavLink } from 'react-router-dom'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import AuthenticationService from '../Common/AuthenticationService.js';
import data from '../Tables/DataTable/_data';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';
import moment from 'moment';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';

// import { HashRouter, Route, Switch } from 'react-router-dom';
const entityname = i18n.t('static.language.language');
export default class LanguageListComponent extends Component {

    constructor(props) {
        super(props);
        /* this.table = data.rows;
         this.options = {
             sortIndicator: true,
             hideSizePerPage: true,
             paginationSize: 3,
             hidePageListOnlyOnePage: true,
             clearSearch: true,
             alwaysShowAllBtns: false,
             withFirstAndLast: false,
             onRowClick: function (row) {
                 // console.log("row--------------", row);
                 this.editLanguage(row);
             }.bind(this)
 
         }*/

        this.state = {
            langaugeList: [],
            message: '',
            selSource: [],
            loading: true
        }
        this.editLanguage = this.editLanguage.bind(this);
        this.addLanguage = this.addLanguage.bind(this);
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

    editLanguage(language) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_LANGUAGE')) {
            this.props.history.push({
                pathname: `/language/editLanguage/${language.languageId}`,
                // state: { language }
            });
        }
    }

    addLanguage() {
        if (isSiteOnline()) {
            this.props.history.push(`/language/addLanguage`)
        } else {
            alert(i18n.t('static.common.online'))
        }
    }



    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        this.hideFirstComponent();
        LanguageService.getLanguageList()
            .then(response => {
                console.log("response.data---->", response.data)
                if (response.status == 200) {
                    this.setState({
                        langaugeList: response.data, selSource: response.data
                    },
                        () => {

                            let langaugeList = this.state.langaugeList;
                            // console.log("langaugeList---->", langaugeList);
                            let languageArray = [];
                            let count = 0;

                            for (var j = 0; j < langaugeList.length; j++) {
                                data = [];
                                data[0] = langaugeList[j].languageId
                                data[1] = langaugeList[j].label.label_en;
                                data[2] = langaugeList[j].languageCode;
                                data[3] = langaugeList[j].countryCode;
                                data[4] = langaugeList[j].lastModifiedBy.username;
                                data[5] = (langaugeList[j].lastModifiedDate ? moment(langaugeList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
                                data[6] = langaugeList[j].active;

                                languageArray[count] = data;
                                count++;
                            }
                            // if (langaugeList.length == 0) {
                            //     data = [];
                            //     languageArray[0] = data;
                            // }
                            // console.log("languageArray---->", languageArray);
                            this.el = jexcel(document.getElementById("tableDiv"), '');
                            this.el.destroy();
                            var json = [];
                            var data = languageArray;

                            var options = {
                                data: data,
                                columnDrag: true,
                                colWidths: [0, 150, 150, 150, 100, 100, 100],
                                colHeaderClasses: ["Reqasterisk"],
                                columns: [
                                    {
                                        title: 'LanguageId',
                                        type: 'hidden',
                                        readOnly: true
                                    },
                                    {
                                        title: i18n.t('static.language.language'),
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: i18n.t('static.language.languageCode'),
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: i18n.t('static.language.countryCode'),
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

    selected = function (instance, cell, x, y, value) {

        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            // console.log("Original Value---->>>>>", this.el.getValueFromCoords(0, x));
            if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_LANGUAGE')) {
                this.props.history.push({
                    pathname: `/language/editLanguage/${this.el.getValueFromCoords(0, x)}`,
                });
            }
        }
    }.bind(this);

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
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
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '} */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_LANGUAGE') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addLanguage}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>
                    </div>
                    <CardBody className=" pt-md-1 pt-lg-0 pb-md-1 table-responsive">
                        <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_LANGUAGE') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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

