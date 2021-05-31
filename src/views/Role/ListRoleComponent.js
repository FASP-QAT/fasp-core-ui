
// import React, { Component } from 'react';
// import {
//     Card, CardHeader, CardBody
// } from 'reactstrap';
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator'
// import i18n from '../../i18n'
// import getLabelText from '../../CommonComponent/getLabelText'
// import UserService from "../../api/UserService";
// import AuthenticationService from '../Common/AuthenticationService.js';
// const entityname = i18n.t('static.role.role');
// class ListRoleComponent extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             roleList: [],
//             message: '',
//             selSource: [],
//             lang: localStorage.getItem('lang'),
//             loading: true
//         }
//         this.editRole = this.editRole.bind(this);
//         this.addNewRole = this.addNewRole.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
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

//     addNewRole() {
//         this.props.history.push("/role/addRole");
//     }
//     editRole(role) {
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_ROLE')) {
//             this.props.history.push({
//                 pathname: `/role/editRole/${role.roleId}`,
//                 // state: { role }
//             });
//         }
//     }

//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         this.hideFirstComponent();
//         UserService.getRoleList()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({ roleList: response.data, selSource: response.data, loading: false })
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

//         // .catch(
//         //     error => {
//         //         switch (error.response ? error.response.status : "") {

//         //             case 500:
//         //             case 401:
//         //             case 404:
//         //             case 406:
//         //             case 412:
//         //                 this.setState({ message: error.response.data.messageCode });
//         //                 break;
//         //             default:
//         //                 this.setState({ message: 'static.unkownError' });
//         //                 break;
//         //         }
//         //     }
//         // );
//     }

//     showRoleLabel(cell, row) {
//         return cell.label_en;
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
//             dataField: 'roleId',
//             text: i18n.t('static.role.roleid'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center'
//         }, {
//             dataField: 'label',
//             text: i18n.t('static.role.role'),
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

//                 <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     <div className="Card-header-addicon">
//                         {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '} */}
//                         <div className="card-header-actions">
//                             <div className="card-header-action">
//                                 {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_ROLE') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewRole}><i className="fa fa-plus-square"></i></a>}
//                                 {/* <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewRole}><i className="fa fa-plus-square"></i></a> */}
//                             </div>
//                         </div>
//                     </div>
//                     <CardBody className="pb-lg-0  ">
//                         <ToolkitProvider
//                             keyField="roleId"
//                             data={this.state.selSource}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (<div className="TableCust">
//                                     <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
//                                         <SearchBar {...props.searchProps} />
//                                         <ClearSearchButton {...props.searchProps} />
//                                     </div>
//                                     <BootstrapTable striped hover noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                                         pagination={paginationFactory(options)}
//                                         rowEvents={{
//                                             onClick: (e, row, rowIndex) => {
//                                                 this.editRole(row);
//                                             }
//                                         }}
//                                         {...props.baseProps}
//                                     />
//                                 </div>
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
// export default ListRoleComponent;



//---------------------------JEXCEL CONVERSION FROM BOOTSTRAP-------------------------------//


import React, { Component } from 'react';
import {
    Card, CardHeader, CardBody
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText'
import UserService from "../../api/UserService";
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';

const entityname = i18n.t('static.role.role');
class ListRoleComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roleList: [],
            message: '',
            selSource: [],
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.editRole = this.editRole.bind(this);
        this.addNewRole = this.addNewRole.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
    }
    buildJexcel() {

        let roleList = this.state.selSource;
        // console.log("langaugeList---->", langaugeList);
        let roleArray = [];
        let count = 0;

        for (var j = 0; j < roleList.length; j++) {
            data = [];
            data[0] = roleList[j].roleId
            data[1] = roleList[j].roleId;
            data[2] = getLabelText(roleList[j].label, this.state.lang)
            roleArray[count] = data;
            count++;
        }
        // if (roleList.length == 0) {
        //     data = [];
        //     roleArray[0] = data;
        // }
        // console.log("roleArray---->", roleArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = roleArray;

        var options = {
            data: data,
            columnDrag: true,
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'roleId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.role.roleid'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.role.role'),
                    type: 'text',
                    readOnly: true
                }
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
        var roleEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = roleEl;
        this.setState({
            roleEl: roleEl, loading: false
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

    addNewRole() {
        this.props.history.push("/role/addRole");
    }
    editRole(role) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_ROLE')) {
            this.props.history.push({
                pathname: `/role/editRole/${role.roleId}`,
                // state: { role }
            });
        }
    }

    selected = function (instance, cell, x, y, value) {
        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            if (this.state.selSource.length != 0) {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_ROLE')) {
                    this.props.history.push({
                        pathname: `/role/editRole/${this.el.getValueFromCoords(0, x)}`,
                        // state: { role }
                    });
                }
            }
        }
    }.bind(this);

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        this.hideFirstComponent();
        UserService.getRoleList()
            .then(response => {
                if (response.status == 200) {
                    // this.setState({ roleList: response.data, selSource: response.data, loading: false })
                    console.log("response.data--->", response.data);
                    this.setState({
                        roleList: response.data, selSource: response.data
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


    showRoleLabel(cell, row) {
        return cell.label_en;
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
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '} */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_ROLE') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewRole}><i className="fa fa-plus-square"></i></a>}
                                {/* <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewRole}><i className="fa fa-plus-square"></i></a> */}
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-md-0 pt-lg-0">
                        <div className="">
                            <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_ROLE') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default ListRoleComponent;






