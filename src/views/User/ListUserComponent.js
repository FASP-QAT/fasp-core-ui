
// import React, { Component } from 'react';
// import {
//     Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col
// } from 'reactstrap';
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator'
// import i18n from '../../i18n'
// import getLabelText from '../../CommonComponent/getLabelText'
// import RealmService from "../../api/RealmService";
// import UserService from "../../api/UserService";
// import AuthenticationService from '../Common/AuthenticationService.js';
// import moment from 'moment';
// import { DATE_FORMAT_CAP } from '../../Constants.js';
// const entityname = i18n.t('static.user.user')
// class ListUserComponent extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             realms: [],
//             userList: [],
//             message: '',
//             selUserList: [],
//             lang: localStorage.getItem('lang'),
//             loading: true
//         }
//         this.editUser = this.editUser.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.addNewUser = this.addNewUser.bind(this);
//         this.buttonFormatter = this.buttonFormatter.bind(this);
//         this.addAccessControls = this.addAccessControls.bind(this);
//         this.formatDate = this.formatDate.bind(this);
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
//         document.getElementById('div2').style.display = 'block';
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }
//     formatDate(cell, row) {
//         if (cell != null && cell != "") {
//             var modifiedDate = moment(cell).format('MM-DD-YYYY');
//             return modifiedDate;
//         } else {
//             return "";
//         }
//     }

//     buttonFormatter(cell, row) {
//         return <Button type="button" size="sm" color="success" onClick={(event) => this.addAccessControls(event, row)} ><i className="fa fa-check"></i>Add Access Control</Button>;
//     }
//     addAccessControls(event, row) {
//         event.stopPropagation();
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_USER')) {
//             // this.props.history.push({
//             //     pathname: "/user/accessControl",
//             //     state: {
//             //         user: row
//             //     }

//             // })
//             this.props.history.push({
//                 pathname: `/user/accessControl/${row.userId}`,
//             });
//         }
//     }
//     addNewUser() {
//         this.props.history.push("/user/addUser");
//     }
//     filterData() {
//         let realmId = document.getElementById("realmId").value;
//         if (realmId != 0) {
//             const selUserList = this.state.userList.filter(c => c.realm.realmId == realmId)
//             this.setState({
//                 selUserList
//             });
//         } else {
//             this.setState({
//                 selUserList: this.state.userList
//             });
//         }
//     }
//     editUser(user) {
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_USER')) {
//             this.props.history.push({
//                 pathname: `/user/editUser/${user.userId}`,
//                 // pathname: `/language/editLanguage/${language.languageId}`,
//                 // state: { user }
//             });
//         }
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
//             }).catch(
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

//         UserService.getUserList()
//             .then(response => {
//                 if (response.status == 200) {
//                     console.log(response.data)
//                     this.setState({
//                         userList: response.data,
//                         selUserList: response.data
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }

//             }).catch(
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

//     showRealmLabel(cell, row) {
//         return cell.label.label_en;
//     }

//     showRoleLabel(cell, row) {
//         return cell.label.label_en;
//     }
//     showLanguageLabel(cell, row) {
//         return cell.languageName;
//     }
//     showStatus(cell, row) {
//         if (cell) {
//             return "Active";
//         } else {
//             return "Disabled";
//         }
//     }
//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
//     }

//     formatDate(cell, row) {
//         if (cell != null && cell != "") {
//             return moment(cell).format('MM-DD-YYYY hh:mm A');
//         } else {
//             return "";
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
//             dataField: 'username',
//             text: i18n.t('static.user.username'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center'
//         }, {
//             dataField: 'phoneNumber',
//             text: i18n.t('static.user.phoneNumber'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center'
//         }, {
//             dataField: 'emailId',
//             text: i18n.t('static.user.emailid'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center'
//         },
//         {
//             dataField: 'faildAttempts',
//             text: i18n.t('static.user.failedAttempts'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center'
//         }, {
//             dataField: 'lastLoginDate',
//             text: i18n.t('static.user.lastLoginDate'),
//             sort: true,
//             align: 'center',
//             headerAlign: 'center',
//             formatter: (cellContent, row) => {
//                 return (
//                     (row.lastLoginDate ? moment(row.lastLoginDate).format(`${DATE_FORMAT_CAP}`) : null)
//                     // (row.lastLoginDate ? moment(row.lastLoginDate).format('DD-MMM-YY hh:mm A') : null)
//                 );
//             }
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
//         }, {
//             dataField: 'userId',
//             text: i18n.t('static.user.accessControlText'),
//             align: 'center',
//             headerAlign: 'center',
//             formatter: (cellContent, row) => {
//                 return (<Button type="button" size="sm" color="success" title="Add Access Control" onClick={(event) => this.addAccessControls(event, row)} ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
//                 )
//             }
//         }
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
//                 text: 'All', value: this.state.selUserList.length
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
//                                 {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_USER') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewUser}><i className="fa fa-plus-square"></i></a>}
//                             </div>
//                         </div>
//                     </div>
//                     <CardBody className="pb-lg-0">

//                         <Col md="3" className="pl-0">
//                             <FormGroup className="Selectdiv">
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
//                             keyField="userId"
//                             data={this.state.selUserList}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (

//                                     <div className="TableCust userAlignThtd">
//                                         <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
//                                             <SearchBar {...props.searchProps} />
//                                             <ClearSearchButton {...props.searchProps} />
//                                         </div>
//                                         <BootstrapTable striped hover noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                                             pagination={paginationFactory(options)}
//                                             rowEvents={{
//                                                 onClick: (e, row, rowIndex) => {
//                                                     // row.lastLoginDate = moment(row.lastLoginDate).format('YYYY-MM-DD');
//                                                     this.editUser(row);
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
// export default ListUserComponent;
//-----------------------------------------------------


import React, { Component } from 'react';
import {
    Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText'
import RealmService from "../../api/RealmService";
import UserService from "../../api/UserService";
import AuthenticationService from '../Common/AuthenticationService.js';
import moment from 'moment';
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM } from '../../Constants.js';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'

const entityname = i18n.t('static.user.user')
class ListUserComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            userList: [],
            message: '',
            selUserList: [],
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.editUser = this.editUser.bind(this);
        this.filterData = this.filterData.bind(this);
        this.addNewUser = this.addNewUser.bind(this);
        this.buttonFormatter = this.buttonFormatter.bind(this);
        this.addAccessControls = this.addAccessControls.bind(this);
        this.formatDate = this.formatDate.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
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
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    formatDate(cell, row) {
        if (cell != null && cell != "") {
            var modifiedDate = moment(cell).format('MM-DD-YYYY');
            return modifiedDate;
        } else {
            return "";
        }
    }

    buttonFormatter(cell, row) {
        return <Button type="button" size="sm" color="success" onClick={(event) => this.addAccessControls(event, row)} ><i className="fa fa-check"></i>Add Access Control</Button>;
    }
    addAccessControls(event, row) {
        event.stopPropagation();
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_ACCESS_CONTROL')) {
            // this.props.history.push({
            //     pathname: "/user/accessControl",
            //     state: {
            //         user: row
            //     }

            // })
            this.props.history.push({
                pathname: `/user/accessControl/${row.userId}`,
            });
        }
    }
    addNewUser() {
        this.props.history.push("/user/addUser");
    }
    filterData() {
        let realmId = document.getElementById("realmId").value;
        if (realmId != 0) {
            const selUserList = this.state.userList.filter(c => c.realm.realmId == realmId)
            this.setState({
                selUserList
            }, () => {
                this.buildJExcel();
            });
        } else {
            this.setState({
                selUserList: this.state.userList
            }, () => {
                this.buildJExcel();
            });
        }
    }
    editUser(user) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USER')) {
            this.props.history.push({
                pathname: `/user/editUser/${user.userId}`,
                // pathname: `/language/editLanguage/${language.languageId}`,
                // state: { user }
            });
        }
    }

    buildJExcel() {
        let userList = this.state.selUserList;
        // console.log("userList---->", userList);
        let userArray = [];
        let count = 0;

        for (var j = 0; j < userList.length; j++) {
            data = [];
            data[0] = userList[j].userId
            data[1] = getLabelText(userList[j].realm.label, this.state.lang)
            data[2] = userList[j].username;
            data[3] = userList[j].phoneNumber;
            data[4] = userList[j].emailId;
            data[5] = userList[j].faildAttempts;
            data[6] = (userList[j].lastLoginDate ? moment(userList[j].lastLoginDate).format("YYYY-MM-DD") : null)
            data[7] = userList[j].lastModifiedBy.username;
            data[8] = (userList[j].lastModifiedDate ? moment(userList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
            data[9] = userList[j].active;


            userArray[count] = data;
            count++;
        }
        // if (userList.length == 0) {
        //     data = [];
        //     userArray[0] = data;
        // }
        // console.log("userArray---->", userArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = userArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [50, 50, 50, 50, 120],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'userId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.realm.realm'),
                    type: (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') ? 'text' : 'hidden'),
                    readOnly: true
                },
                {
                    title: i18n.t('static.user.username'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.user.phoneNumber'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.user.emailid'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.user.failedAttempts'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.user.lastLoginDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
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
                    width: 80,
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
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')} `,
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
                            title: i18n.t('static.user.accessControlText'),
                            onclick: function () {
                                // console.log("onclick------>", this.el.getValueFromCoords(0, y));
                                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_ACCESS_CONTROL')) {
                                    this.props.history.push({
                                        pathname: `/user/accessControl/${this.el.getValueFromCoords(0, y)}`,
                                    });
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
    }

    selected = function (instance, cell, x, y, value) {

        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            // console.log("Original Value---->>>>>", this.el.getValueFromCoords(0, x));
            if (this.state.selUserList.length != 0) {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USER')) {
                    this.props.history.push({
                        pathname: `/user/editUser/${this.el.getValueFromCoords(0, x)}`,
                    });
                }
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
                    this.setState({
                        realms: response.data
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

        UserService.getUserList()
            .then(response => {
                if (response.status == 200) {
                    console.log("response.data---->", response.data)
                    this.setState({
                        userList: response.data,
                        selUserList: response.data
                    }, () => {
                        this.buildJExcel();
                    });
                } else {
                    this.setState({
                        message: response.data.messageCode,
                        loading: false
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

    showRealmLabel(cell, row) {
        return cell.label.label_en;
    }

    showRoleLabel(cell, row) {
        return cell.label.label_en;
    }
    showLanguageLabel(cell, row) {
        return cell.label.label_en;
    }
    showStatus(cell, row) {
        if (cell) {
            return "Active";
        } else {
            return "Disabled";
        }
    }
    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    formatDate(cell, row) {
        if (cell != null && cell != "") {
            return moment(cell).format('MM-DD-YYYY hh:mm A');
        } else {
            return "";
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
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_USER') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewUser}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') &&
                            <Col md="3" className="pl-0">
                                <FormGroup className="Selectdiv">
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
                        <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USER') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
export default ListUserComponent;

