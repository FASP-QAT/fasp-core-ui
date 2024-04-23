import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import { Search } from 'react-bootstrap-table2-toolkit';
import {
    Button,
    Card,
    CardBody,
    Col,
    FormGroup, Input, InputGroup,
    Label,
    
    Nav, NavItem, NavLink,
    TabContent, TabPane
} from 'reactstrap';
import * as Yup from 'yup';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, SPECIAL_CHARECTER_WITH_NUM_NODOUBLESPACE } from '../../Constants.js';
import LanguageService from "../../api/LanguageService";
import RealmService from "../../api/RealmService";
import UserService from "../../api/UserService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const entityname = i18n.t('static.user.user')
/**
 * This component is used to show list of users
 */
class ListUserComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            userList: [],
            message: '',
            selUserList: [],
            lang: localStorage.getItem('lang'),
            loading: true,
            activeTab1: new Array(3).fill('1'),
            languages: [],
            roleList: [],
            roleId: '',
            table1Instance: '',
            table2Instance: '',
            roleListJexcel: [],
            realmCountryList: [],
            selRealmCountry: [],
            organisations: [],
            selOrganisation: [],
            healthAreas: [],
            selHealthArea: [],
            programs: [],
            selProgram: [],
            isModalOpen: false,
            userId: '',
            appAdminRole: false,
            roles: [],
            roleListInUpdate: [],
            user: {
                realm: {
                    realmId: '',
                    label: {
                        label_en: ''
                    }
                },
                language: {
                    languageId: ''
                },
                roles: [],
                username: '',
                emailId: '',
                orgAndCountry: '',
                roleList: [],
                message1: ''
            },
        }
        this.filterData = this.filterData.bind(this);
        this.addNewUser = this.addNewUser.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.buildJExcel1 = this.buildJExcel1.bind(this);
        this.buildJExcel2 = this.buildJExcel2.bind(this);
        this.getUserDetails = this.getUserDetails.bind(this);
    }
    /**
     * This function is used to hide the messages that are there in div1 after 30 seconds
     */
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is triggered when this component is about to unmount
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is called when user clicks on add new user button and is redirected to add user screen
     */
    addNewUser() {
        this.props.history.push("/user/addUser");
    }
    /**
     * This function is used to filter user list based on realm Id
     */
    filterData() {
        let realmId = document.getElementById("realmId").value;
        if (realmId != 0) {
            const selUserList = this.state.userList.filter(c => c.realm.realmId == realmId)
            this.setState({
                selUserList
            }, () => {
                this.buildJExcel1();
                this.buildJExcel2();
            });
        } else {
            this.setState({
                selUserList: this.state.userList
            }, () => {
                this.buildJExcel1();
                this.buildJExcel2();
            });
        }
    }
    /**
     * This function is called when user click on the row to edit the user and is redirected to edit user screen
     */
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if ((x == 0 && value != 0) || (y == 0)) {
            } else {
                if (this.state.selUserList.length != 0) {
                    if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USER')) {
                        this.props.history.push({
                            pathname: `/user/editUser/${this.el.getValueFromCoords(0, x)}`,
                        });
                    }
                }
            }
        }
    }.bind(this);
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded2 = function (instance, cell) {
        jExcelLoadedFunction(instance, 1);
    }
    /**
     * This function is used to get list of realms and user list
     */
    componentDidMount() {
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
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                    this.setState({
                        userList: response.data,
                        selUserList: response.data
                    }, () => {
                        UserService.getRoleList()
                            .then(response => {
                                if (response.status == 200) {
                                    var roleListInUpdate = [{ id: "-1", name: i18n.t("static.common.all") }];
                                    var roleList = [];
                                    var roleListJexcel = [];
                                    for (var i = 0; i < response.data.length; i++) {
                                        roleList[i] = { value: response.data[i].roleId, label: getLabelText(response.data[i].label, this.state.lang) }
                                        roleListJexcel[i] = { id: response.data[i].roleId, name: getLabelText(response.data[i].label, this.state.lang) }
                                        roleListInUpdate[i + 1] = { value: response.data[i].roleId, label: getLabelText(response.data[i].label, this.state.lang) }
                                    }
                                    var listArray = roleList;
                                    listArray.sort((a, b) => {
                                        var itemLabelA = a.label.toUpperCase(); 
                                        var itemLabelB = b.label.toUpperCase(); 
                                        return itemLabelA > itemLabelB ? 1 : -1;
                                    });
                                    this.setState({
                                        roleList: listArray,
                                        roleListJexcel: roleListJexcel,
                                        roleListInUpdate: roleListInUpdate,
                                        loading: false,
                                    },
                                        () => {
                                            this.buildJExcel1();
                                            this.buildJExcel2();
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
                                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
    /**
     * This function is used to toggle the tab for user list and user access control
     * @param {*} tabPane
     * @param {*} tab This is the value of the tab
     */
    toggleModal(tabPane, tab) {
        const newArray = this.state.activeTab1.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab1: newArray,
        }, () => {
            if (tab == 1) {
            } else if (tab == 2) {
                this.getUserDetails();
            }
        });
    }
    /**
     * This function has data for both the tabs
     * @returns Returns data for both the tabs
     */
    tabPane1() {
        return (
            <>
                <TabPane tabId="1" className='pb-lg-0'>
                                        <CardBody className="pl-lg-1 pr-lg-1 pt-lg-0">
                                                <div id="tableDiv1" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USER') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
                        </div>
                    </CardBody>
                                                        </TabPane>
                <TabPane tabId="2" className='pb-lg-0'>
                                        <CardBody className="pl-lg-1 pr-lg-1 pt-lg-0">
                                                <div id="tableDiv2" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USER') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
                        </div>
                    </CardBody>
                                                        </TabPane>
            </>
        );
    }
    /**
     * This function is used to get list of user from api
     */
    getUserDetails() {
        UserService.getUserList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        userList: response.data,
                        selUserList: response.data
                    },
                        () => { this.buildJExcel2() })
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
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
    /**
     * This function is used to display the user details list in jexcel tabular format
     */
    buildJExcel1() {
        let userList = this.state.selUserList;
        let userArray = [];
        let count = 0;
        for (var j = 0; j < userList.length; j++) {
            data = [];
            data[0] = userList[j].userId
            data[1] = getLabelText(userList[j].realm.label, this.state.lang)
            data[2] = userList[j].username;
            data[3] = userList[j].orgAndCountry;
            data[4] = userList[j].emailId;
            data[5] = userList[j].roleList.map(a => a.roleId).toString().trim().replaceAll(',', ';');
            data[6] = userList[j].faildAttempts;
            data[7] = (userList[j].lastLoginDate ? moment(userList[j].lastLoginDate).format("YYYY-MM-DD") : null)
            data[8] = userList[j].lastModifiedBy.username;
            data[9] = (userList[j].lastModifiedDate ? moment(userList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
            data[10] = userList[j].active;
            userArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv1"), '');
        jexcel.destroy(document.getElementById("tableDiv1"), true);
        var data = userArray;
        var options = {
            data: data,
            columnDrag: false,
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
                },
                {
                    title: i18n.t('static.user.username'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.user.orgAndCountry'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.user.emailid'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.dashboard.role'),
                    type: 'autocomplete',
                    source: this.state.roleListJexcel,
                    multiple: true,
                },
                {
                    title: i18n.t('static.user.failedAttempts'),
                    type: 'numeric', mask: '#,##',
                },
                {
                    title: i18n.t('static.user.lastLoginDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                    width: 80,
                },
                {
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.common.disabled') }
                    ]
                },
            ],
            onload: this.loaded,
            editable: false,
            onselection: this.selected,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            parseFormulas: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                    }
                }
                return items;
            }.bind(this)
        };
        var table1Instance = jexcel(document.getElementById("tableDiv1"), options);
        this.el = table1Instance;
        this.setState({
            table1Instance: table1Instance,
            loading: false
        })
    }
    /**
     * This function is used to display the user access control details in tabular format
     */
    buildJExcel2() {
        let userList = this.state.selUserList;
        let userArray = [];
        let count = 0;
        for (var j = 0; j < userList.length; j++) {
            data = [];
            data[0] = userList[j].userId
            data[1] = userList[j].username
            data[2] = ([...new Set(userList[j].userAclList.map(a => a.countryName.label_en == "" || a.countryName.label_en == null ? "All" : a.countryName.label_en))]).toString();
            data[3] = ([...new Set(userList[j].userAclList.map(a => a.healthAreaName.label_en == "" || a.healthAreaName.label_en == null ? "All" : a.healthAreaName.label_en))]).toString();
            data[4] = ([...new Set(userList[j].userAclList.map(a => a.organisationName.label_en == "" || a.organisationName.label_en == null ? "All" : a.organisationName.label_en))]).toString();
            data[5] = ([...new Set(userList[j].userAclList.map(a => a.programName.label_en == "" || a.programName.label_en == null ? "All" : a.programName.label_en))]).toString();
            userArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv2"), '');
        jexcel.destroy(document.getElementById("tableDiv2"), true);
        var data = userArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [50, 50, 50, 50, 120],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'userId', 
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.user.username'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.program.realmcountry'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.dashboard.healthareaheader'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.organisation.organisation'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.dashboard.programheader'),
                    type: 'text',
                },
            ],
            editable: false,
            onload: this.loaded2,
            onselection: this.selected,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            parseFormulas: true,
            license: JEXCEL_PRO_KEY,
            editable: true,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                    }
                }
                return items;
            }.bind(this)
        };
        var table2Instance = jexcel(document.getElementById("tableDiv2"), options);
        this.el = table2Instance;
        this.setState({
            table2Instance: table2Instance,
            loading: false
        })
    }
    /**
     * This is used to display the content
     * @returns The user and access control data in tabular format with filters
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
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
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div3">{this.state.message}</h5>
                <Card>
                    <div className="Card-header-addicon">
                                                <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_USER') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewUser}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-3 pt-lg-0">
                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') &&
                            <Col md="3" className="pl-0 pb-lg-5">
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
                                                                                    </InputGroup>
                                    </div>
                                </FormGroup>
                            </Col>
                        }
                        <Nav tabs className='pt-lg-0'>
                            <NavItem>
                                <NavLink
                                    active={this.state.activeTab1[0] === '1'}
                                    onClick={() => { this.toggleModal(0, '1'); }}
                                >
                                    {i18n.t('static.common.userList')}
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    active={this.state.activeTab1[0] === '2'}
                                    onClick={() => { this.toggleModal(0, '2'); }}
                                >
                                    {i18n.t('static.common.accessControlList')}
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab1[0]}>
                            {this.tabPane1()}
                        </TabContent>
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
