// import React, { Component } from 'react';
// import DimensionService from '../../api/DimensionService.js';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import { NavLink } from 'react-router-dom'
// import { Card, CardHeader, CardBody } from 'reactstrap';
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator'
// import getLabelText from '../../CommonComponent/getLabelText'
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
// import i18n from '../../i18n';
// const entityname = i18n.t('static.dimension.dimension');
// export default class DimensionListComponent extends Component {

//     constructor(props) {
//         super(props);
//         /*this.table = data.rows;
//         this.options = {
//             sortIndicator: true,
//             hideSizePerPage: true,
//             paginationSize: 3,
//             hidePageListOnlyOnePage: true,
//             clearSearch: true,
//             alwaysShowAllBtns: false,
//             withFirstAndLast: false,
//             onRowClick: function (row) {
//                 // console.log("row--------------", row);
//                 this.editDimension(row);
//             }.bind(this)

//         }*/
//         this.state = {
//             dimensionList: [],
//             message: '',
//             selSource: [],
//             loading: true
//         }
//         this.addNewDimension = this.addNewDimension.bind(this);
//         this.editDimension = this.editDimension.bind(this);
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
//         AuthenticationService.setupAxiosInterceptors();
//         DimensionService.getDimensionListAll().then(response => {
//             if (response.status == 200) {
//                 console.log(response.data)
//                 this.setState({
//                     dimensionList: response.data,
//                     selSource: response.data, loading: false

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


//     editDimension(dimension) {
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_DIMENSION')) {
//             this.props.history.push({
//                 pathname: `/diamension/editDiamension/${dimension.dimensionId}`,
//                 // state: { dimension: dimension }
//             });
//         }
//     }

//     addNewDimension() {
//         if (navigator.onLine) {
//             this.props.history.push(`/diamension/addDiamension`)
//         } else {
//             alert("You must be Online.")
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

//         const columns = [{
//             dataField: 'label',
//             text: i18n.t('static.dimension.dimension'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: this.formatLabel
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
//                                 {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_DIMENSION') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewDimension}><i className="fa fa-plus-square"></i></a>}
//                             </div>
//                         </div>

//                     </div>
//                     <CardBody className="pb-lg-0 ">
//                         <ToolkitProvider
//                             keyField="dimensionId"
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
//                                                     this.editDimension(row);
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


import React, { Component } from 'react';
import DimensionService from '../../api/DimensionService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import getLabelText from '../../CommonComponent/getLabelText'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import i18n from '../../i18n';
import moment from 'moment';
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';
const entityname = i18n.t('static.dimension.dimension');
export default class DimensionListComponent extends Component {

    constructor(props) {
        super(props);
        /*this.table = data.rows;
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
                this.editDimension(row);
            }.bind(this)

        }*/
        this.state = {
            dimensionList: [],
            message: '',
            selSource: [],
            loading: true
        }
        this.addNewDimension = this.addNewDimension.bind(this);
        this.editDimension = this.editDimension.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
    }
    buildJexcel() {
        let dimensionList = this.state.selSource;
        // console.log("dimensionList---->", dimensionList);
        let dimensionArray = [];
        let count = 0;

        for (var j = 0; j < dimensionList.length; j++) {
            data = [];
            data[0] = dimensionList[j].dimensionId
            data[1] = getLabelText(dimensionList[j].label, this.state.lang)
            data[2] = dimensionList[j].lastModifiedBy.username;
            data[3] = (dimensionList[j].lastModifiedDate ? moment(dimensionList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
            dimensionArray[count] = data;
            count++;
        }
        // if (dimensionList.length == 0) {
        //     data = [];
        //     dimensionArray[0] = data;
        // }
        // console.log("dimensionArray---->", dimensionArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = dimensionArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'dimensionId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.dimension.dimension'),
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
                    readOnly: true,
                    options: { format: JEXCEL_DATE_FORMAT_SM }
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
        var DimensionListEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = DimensionListEl;
        this.setState({
            DimensionListEl: DimensionListEl, loading: false
        })
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    componentDidMount() {
        this.hideFirstComponent();
        // AuthenticationService.setupAxiosInterceptors();
        DimensionService.getDimensionListAll().then(response => {
            if (response.status == 200) {
                console.log("response.data---->", response.data)
                // this.setState({
                //     dimensionList: response.data,
                //     selSource: response.data, loading: false

                // })
                this.setState({
                    dimensionList: response.data,
                    selSource: response.data
                },
                    () => { this.buildJexcel() })

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
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    editDimension(dimension) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DIMENSION')) {
            this.props.history.push({
                pathname: `/diamension/editDiamension/${dimension.dimensionId}`,
                // state: { dimension: dimension }
            });
        }
    }

    selected = function (instance, cell, x, y, value) {
        if (x == 0 && value != 0) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            if (this.state.selSource.length != 0) {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DIMENSION')) {
                    this.props.history.push({
                        pathname: `/diamension/editDiamension/${this.el.getValueFromCoords(0, x)}`,
                        // state: { role }
                    });
                }
            }
        }
    }.bind(this);

    addNewDimension() {
        if (isSiteOnline()) {
            this.props.history.push(`/diamension/addDiamension`)
        } else {
            alert("You must be Online.")
        }

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
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_DIMENSION') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewDimension}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>

                    </div>
                    <CardBody className="table-responsive pt-lg-0 pt-md-1 pb-md-1">
                        {/* <div id="loader" className="center"></div> */}
                        <div id="tableDiv" className="jexcelremoveReadonlybackground" style={{ display: this.state.loading ? "none" : "block" }}>
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