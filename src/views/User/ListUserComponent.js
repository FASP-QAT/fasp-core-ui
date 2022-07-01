import React, { Component } from 'react';
import {
    Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, CardFooter, FormFeedback, Form
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import i18n from '../../i18n'
import Select from 'react-select';
import getLabelText from '../../CommonComponent/getLabelText'
import RealmService from "../../api/RealmService";
import UserService from "../../api/UserService";
import AuthenticationService from '../Common/AuthenticationService.js';
import moment from 'moment';
import LanguageService from "../../api/LanguageService";
import ProgramService from "../../api/ProgramService";
import DatasetService from "../../api/DatasetService";
import OrganisationService from "../../api/OrganisationService"
import HealthAreaService from "../../api/HealthAreaService"
import RealmCountryService from "../../api/RealmCountryService"
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM, SPECIAL_CHARECTER_WITH_NUM_NODOUBLESPACE } from '../../Constants.js';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import classNames from 'classnames';

const entityname = i18n.t('static.user.user')

const validationSchema = function (values) {
    return Yup.object().shape({
        username: Yup.string()
            // .min(6, i18n.t('static.user.valid6char'))
            // .max(30, i18n.t('static.user.validpasswordlength'))
            // .matches(/^(?=.*[a-zA-Z]).*$/, i18n.t('static.user.alleast1alpha'))
            // .matches(/^\S*$/, i18n.t('static.user.nospace'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.user.validusername')),
        languageId: Yup.string()
            .required(i18n.t('static.user.validlanguage')),
        emailId: Yup.string()
            .email(i18n.t('static.user.invalidemail'))
            .required(i18n.t('static.user.validemail')),

        roleId: Yup.string()
            .test('roleValid', i18n.t('static.common.roleinvalidtext'),
                function (value) {
                    if (document.getElementById("roleValid").value == "false") {
                        console.log("inside if ---", value);
                        return true;
                    }
                })
            .required(i18n.t('static.user.validrole')),

        orgAndCountry: Yup.string()
            .matches(SPECIAL_CHARECTER_WITH_NUM_NODOUBLESPACE, i18n.t('static.validNoDoubleSpace.string'))
            .required(i18n.t('static.user.org&CountryText')),
    })
}

const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationError(error)
        }
    }
}

const getErrorsFromValidationError = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}


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
                // phoneNumber: '',
                orgAndCountry: '',
                roleList: [],
                message1: ''
            },
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
        this.toggleModal = this.toggleModal.bind(this);
        this.buildJExcel1 = this.buildJExcel1.bind(this);
        this.buildJExcel2 = this.buildJExcel2.bind(this);
        this.addRow1 = this.addRow1.bind(this);
        this.addRow2 = this.addRow2.bind(this);
        this.getUserDetails = this.getUserDetails.bind(this);
        this.modelOpenClose = this.modelOpenClose.bind(this);
        this.getUpdateUser = this.getUpdateUser.bind(this);

        this.dataChange = this.dataChange.bind(this);
        this.roleChange = this.roleChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideThirdComponent = this.hideThirdComponent.bind(this);
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    hideThirdComponent() {
        document.getElementById('div3').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div3').style.display = 'none';
        }, 30000);
    }

    formatDate(cell, row) {
        if (cell != null && cell != "") {
            var modifiedDate = moment(cell).format('MM-DD-YYYY');
            return modifiedDate;
        } else {
            return "";
        }
    }

    resetClicked() {
        UserService.getUserByUserId(this.state.userId).then(response => {
            this.setState({
                user: response.data
            });

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

    dataChange(event) {
        let { user } = this.state;
        if (event.target.name == "username") {
            user.username = event.target.value;
        }
        if (event.target.name == "emailId") {
            user.emailId = event.target.value;
        }
        // if (event.target.name == "phoneNumber") {
        //     user.phoneNumber = event.target.value;
        // }
        if (event.target.name == "orgAndCountry") {
            user.orgAndCountry = event.target.value;
        }

        if (event.target.name == "roleId") {
            user.roles = Array.from(event.target.selectedOptions, (item) => item.value);
        }
        if (event.target.name == "realmId") {
            user.realm.realmId = event.target.value;
        }
        if (event.target.name == "languageId") {
            user.language.languageId = event.target.value;
        }
        if (event.target.name == "active") {
            user.active = event.target.id === "active2" ? false : true;
        }

        this.setState({
            user
        },
            () => { });
    };


    touchAll(setTouched, errors) {
        setTouched({
            username: true,
            realmId: true,
            emailId: true,
            // phoneNumber: true,
            orgAndCountry: true,
            languageId: true,
            roleId: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('userForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstError(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }

    roleChange(roleId) {

        var selectedArray = [];
        for (var p = 0; p < roleId.length; p++) {
            selectedArray.push(roleId[p].value);
        }
        if (selectedArray.includes("-1")) {
            this.setState({ roleId: [] });
            var list = this.state.roleList.filter(c => c.value != -1)
            this.setState({ roleId: list });
            var roleId = list;
        } else {
            this.setState({ roleId: roleId });
            var roleId = roleId;
        }

        let { user } = this.state;
        let count = 0;
        let count1 = 0;
        // this.setState({ roleId });
        var roleIdArray = [];
        for (var i = 0; i < roleId.length; i++) {
            roleIdArray[i] = roleId[i].value;
            if (roleId[i].value != 'ROLE_APPLICATION_ADMIN') {
                count++;
                // showRealm

            } else {
                count1++;
            }
        }

        if (count > 0) {
            if (count1 > 0) {
                this.setState({
                    appAdminRole: true
                })
                document.getElementById("roleValid").value = true;
            } else {
                this.setState({
                    appAdminRole: false
                })
                document.getElementById("roleValid").value = false;
            }
        } else {
            this.setState({
                appAdminRole: false
            })
            document.getElementById("roleValid").value = false;
        }
        user.roles = roleIdArray;
        this.setState({
            user,
            validateRealm: (count > 0 ? true : false)
        },
            () => { });
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
            // data[3] = userList[j].phoneNumber;
            data[3] = userList[j].orgAndCountry;
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
                // {
                //     title: i18n.t('static.user.phoneNumber'),
                //     type: 'text',
                //     readOnly: true
                // },
                {
                    title: i18n.t('static.user.orgAndCountry'),
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

    loaded2 = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
        // jExcelLoadedFunctionOnlyHideRow(instance);
        // var asterisk = document.getElementsByClassName("resizable")[0];
        // var tr = asterisk.firstChild;
        // // tr.children[1].classList.add('AsteriskTheadtrTd');
        // tr.children[2].classList.add('AsteriskTheadtrTd');
        // tr.children[3].classList.add('AsteriskTheadtrTd');
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
                    console.log("response.data---->123", response.data)
                    this.setState({
                        userList: response.data,
                        selUserList: response.data
                    }, () => {
                        UserService.getRoleList()
                            .then(response => {
                                if (response.status == 200) {
                                    // var roleList = [{ value: "-1", label: i18n.t("static.common.all") }];
                                    // var roleListJexcel = [{ id: "-1", name: i18n.t("static.common.all") }];
                                    var roleListInUpdate = [{ id: "-1", name: i18n.t("static.common.all") }];
                                    var roleList = [];
                                    var roleListJexcel = [];
                                    for (var i = 0; i < response.data.length; i++) {
                                        // roleList[i + 1] = { value: response.data[i].roleId, label: getLabelText(response.data[i].label, this.state.lang) }
                                        // roleListJexcel[i + 1] = { id: response.data[i].roleId, name: getLabelText(response.data[i].label, this.state.lang) }

                                        roleList[i] = { value: response.data[i].roleId, label: getLabelText(response.data[i].label, this.state.lang) }
                                        roleListJexcel[i] = { id: response.data[i].roleId, name: getLabelText(response.data[i].label, this.state.lang) }

                                        roleListInUpdate[i + 1] = { value: response.data[i].roleId, label: getLabelText(response.data[i].label, this.state.lang) }
                                    }
                                    console.log("roleListJexcel------->", roleListJexcel);
                                    var listArray = roleList;
                                    listArray.sort((a, b) => {
                                        var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                                        var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
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
                                            // LanguageService.getLanguageListActive()
                                            //     .then(response => {
                                            //         if (response.status == 200) {
                                            //             var listArray = response.data;
                                            //             listArray.sort((a, b) => {
                                            //                 var itemLabelA = a.label.label_en.toUpperCase(); // ignore upper and lowercase
                                            //                 var itemLabelB = b.label.label_en.toUpperCase(); // ignore upper and lowercase                   
                                            //                 return itemLabelA > itemLabelB ? 1 : -1;
                                            //             });
                                            //             this.setState({
                                            //                 languages: listArray, loading: false
                                            //             },
                                            //                 () => {
                                            //                     this.buildJExcel1();
                                            //                     this.buildJExcel2();
                                            //                 })
                                            //         } else {
                                            //             this.setState({
                                            //                 message: response.data.messageCode, loading: false
                                            //             },
                                            //                 () => {
                                            //                     this.hideSecondComponent();
                                            //                 })
                                            //         }

                                            //     }).catch(
                                            //         error => {
                                            //             if (error.message === "Network Error") {
                                            //                 this.setState({
                                            //                     message: 'static.unkownError',
                                            //                     loading: false
                                            //                 });
                                            //             } else {
                                            //                 switch (error.response ? error.response.status : "") {

                                            //                     case 401:
                                            //                         this.props.history.push(`/login/static.message.sessionExpired`)
                                            //                         break;
                                            //                     case 403:
                                            //                         this.props.history.push(`/accessDenied`)
                                            //                         break;
                                            //                     case 500:
                                            //                     case 404:
                                            //                     case 406:
                                            //                         this.setState({
                                            //                             message: error.response.data.messageCode,
                                            //                             loading: false
                                            //                         });
                                            //                         break;
                                            //                     case 412:
                                            //                         this.setState({
                                            //                             message: error.response.data.messageCode,
                                            //                             loading: false
                                            //                         });
                                            //                         break;
                                            //                     default:
                                            //                         this.setState({
                                            //                             message: 'static.unkownError',
                                            //                             loading: false
                                            //                         });
                                            //                         break;
                                            //                 }
                                            //             }
                                            //         }
                                            //     );

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

    toggleModal(tabPane, tab) {
        const newArray = this.state.activeTab1.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab1: newArray,
        }, () => {
            if (tab == 1) {
                // this.buildJExcel1();
            } else if (tab == 2) {
                this.getUserDetails();
            }
        });

    }

    tabPane1() {

        return (
            <>
                <TabPane tabId="1" className='pb-lg-0'>
                    {/* <Card> */}
                    <CardBody className="pl-lg-1 pr-lg-1 pt-lg-0">
                        {/* <div id="tableDiv1" className="table-responsive consumptionDataEntryTable"> */}
                        <div id="tableDiv1" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USER') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
                        </div>
                    </CardBody>
                    {/* <CardFooter> */}
                    {/* <FormGroup>
                                <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => { this.addRow1(); }}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button>
                                &nbsp;
                            </FormGroup> */}


                    {/* </CardFooter> */}
                    {/* </Card> */}
                </TabPane>

                <TabPane tabId="2" className='pb-lg-0'>
                    {/* <Card> */}
                    <CardBody className="pl-lg-1 pr-lg-1 pt-lg-0">
                        {/* <div id="tableDiv2" className="table-responsive consumptionDataEntryTable"> */}
                        <div id="tableDiv2" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USER') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
                        </div>
                    </CardBody>
                    {/* <CardFooter> */}
                    {/* <FormGroup>
                                <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => { this.addRow2(); }}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button>
                                &nbsp;
                            </FormGroup> */}


                    {/* </CardFooter> */}
                    {/* </Card> */}
                </TabPane>

            </>
        );
    }

    addRow1 = function () {
        var elInstance = this.state.table1Instance;
        var json = elInstance.getJson(null, false);
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = "";
        data[8] = "";
        data[9] = "";
        data[10] = true;

        elInstance.insertRow(
            data, 0, 1
        );
    };

    getUserDetails() {

        UserService.getUserList()
            .then(response => {
                if (response.status == 200) {
                    // this.setState({ roleList: response.data, selSource: response.data, loading: false })
                    console.log("response.data--->", response.data);
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

    getUpdateUser() {
        // document.getElementById("roleValid").value = false;

        UserService.getUserByUserId(this.state.userId).then(response => {
            if (response.status == 200) {
                console.log("getUpdateUser---", response.data);
                this.setState({
                    user: response.data,
                    loading: false
                }, (
                ) => {
                    // console.log("state after update--- 1", response.data);
                    // if(response.data.phoneNumber == null){
                    //     console.log("state after update--- 2");
                    // }

                });
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


        LanguageService.getLanguageListActive()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.label_en.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.label.label_en.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        languages: listArray, loading: false
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

    modelOpenClose() {
        if (!this.state.isModalOpen) { //didM1
            this.getUpdateUser();//api call to get user by id
        }
        this.setState({
            isModalOpen: !this.state.isModalOpen,
            // isChanged1: false
            // loading: true
        },
            () => {
                // if (this.state.isModalOpen) {
                //     document.getElementById("roleValid").value = false;
                // }
            })
    }

    buildJExcel1() {

        let userList = this.state.selUserList;
        // console.log("userList---->", userList);
        let userArray = [];
        let count = 0;

        for (var j = 0; j < userList.length; j++) {
            data = [];
            data[0] = userList[j].userId
            data[1] = getLabelText(userList[j].realm.label, this.state.lang)
            data[2] = userList[j].username;
            // data[3] = userList[j].phoneNumber;
            data[3] = userList[j].orgAndCountry;
            data[4] = userList[j].emailId;
            // data[1] = papuList[j].healthAreaList.map(a => a.id).toString().trim().replaceAll(',', ';')
            data[5] = userList[j].roleList.map(a => a.roleId).toString().trim().replaceAll(',', ';');
            data[6] = userList[j].faildAttempts;
            data[7] = (userList[j].lastLoginDate ? moment(userList[j].lastLoginDate).format("YYYY-MM-DD") : null)
            data[8] = userList[j].lastModifiedBy.username;
            data[9] = (userList[j].lastModifiedDate ? moment(userList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
            data[10] = userList[j].active;


            userArray[count] = data;
            count++;
        }
        // if (userList.length == 0) {
        //     data = [];
        //     userArray[0] = data;
        // }
        // console.log("userArray---->", userArray);
        // if (this.state.table1Instance != "" && this.state.table1Instance != undefined) {
        //     this.state.table1Instance.destroy();
        // }
        this.el = jexcel(document.getElementById("tableDiv1"), '');
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
                    type: 'hidden',//0A
                },
                {
                    title: i18n.t('static.realm.realm'),
                    type: (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') ? 'text' : 'hidden'),
                    // type: 'hidden',
                    readOnly: true//1B
                },
                {
                    title: i18n.t('static.user.username'),
                    type: 'text',
                    readOnly: true//2C
                },
                // {
                //     title: i18n.t('static.user.phoneNumber'),
                //     type: 'text',
                //     readOnly: true
                // },
                {
                    title: i18n.t('static.user.orgAndCountry'),
                    type: 'text',
                    readOnly: true//3D
                },
                {
                    title: i18n.t('static.user.emailid'),
                    type: 'text',
                    readOnly: true//4E
                },
                {
                    title: i18n.t('static.dashboard.role'),
                    type: 'autocomplete',
                    source: this.state.roleListJexcel,
                    // filter: this.filterHealthArea,
                    multiple: true,
                    readOnly: true//5F
                },
                {
                    title: i18n.t('static.user.failedAttempts'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true//6G
                },
                {
                    title: i18n.t('static.user.lastLoginDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                    readOnly: true//7H
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                    readOnly: true//8I
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                    width: 80,
                    readOnly: true//9J
                },
                {
                    type: 'dropdown',
                    // type: 'checkbox',
                    title: i18n.t('static.common.status'),
                    readOnly: true,
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.common.disabled') }
                    ]//10K
                },

            ],
            // updateTable: function (el, cell, x, y, source, value, id) {
            //     if (y != null) {
            //         var elInstance = el.jexcel;
            //         //left align
            //         // elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');

            //         var rowData = elInstance.getRowData(y);
            //         var addRowId = rowData[9];
            //         console.log("addRowId------>", addRowId);
            //         if (addRowId == 1) {//active grade out
            //             var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
            //             cell1.classList.remove('readonly');
            //         } else {
            //             var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
            //             cell1.classList.remove('readonly');

            //             var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');
            //         }
            //     }
            // },
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')} `,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            onselection: this.selected,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            // onselection: this.selected,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            parseFormulas: true,
            editable: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                        // items.push({
                        //     title: i18n.t('static.user.accessControlText'),
                        //     onclick: function () {
                        //         // console.log("onclick------>", this.el.getValueFromCoords(0, y));
                        //         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_ACCESS_CONTROL')) {
                        //             this.props.history.push({
                        //                 pathname: `/user/accessControl/${this.el.getValueFromCoords(0, y)}`,
                        //             });
                        //         }

                        //     }.bind(this)
                        // });
                    }

                    // Delete a row
                    // if (obj.options.allowDeleteRow == true) {
                    //     // region id
                    //     if (obj.getRowData(y)[0] == 0) {
                    //         items.push({
                    //             title: i18n.t("static.common.deleterow"),
                    //             onclick: function () {
                    //                 obj.deleteRow(parseInt(y));
                    //             }
                    //         });
                    //         // Line
                    //         // items.push({ type: 'line' });
                    //     }
                    // }

                    // if (obj.options.allowInsertRow == true && obj.getRowData(y)[0] != 0 && obj.getRowData(y)[0] != "") {
                    //     items.push({
                    //         title: i18n.t('static.common.update') + ' ' + i18n.t('static.userHead.user'),
                    //         onclick: function () {
                    //             // console.log("onclick------>", this.el.getValueFromCoords(0, y));
                    //             if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USER')) {
                    //                 // this.props.history.push({
                    //                 // pathname: `/user/accessControl/${this.el.getValueFromCoords(0, y)}`,
                    //                 // pathname: `/user/editUser/${user.userId}`,
                    //                 // });
                    //                 this.setState({
                    //                     userId: `${this.el.getValueFromCoords(0, y)}`
                    //                 },
                    //                     () => {
                    //                         this.modelOpenClose();
                    //                     })
                    //             }

                    //         }.bind(this)
                    //     });
                    // }
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


    addRow2 = function () {
        var elInstance = this.state.table2Instance;
        var json = elInstance.getJson(null, false);
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";

        elInstance.insertRow(
            data, 0, 1
        );
    };

    // buildJExcel2() {
    //     RealmCountryService.getRealmCountryListAll()
    //         .then(response => {
    //             if (response.status == 200) {
    //                 var listArray = response.data;
    //                 listArray.sort((a, b) => {
    //                     var itemLabelA = getLabelText(a.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
    //                     var itemLabelB = getLabelText(b.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
    //                     return itemLabelA > itemLabelB ? 1 : -1;
    //                 });
    //                 this.setState({
    //                     realmCountryList: listArray,
    //                     selRealmCountry: listArray.filter(c => c.active.toString() == "true")
    //                 })
    //                 OrganisationService.getOrganisationList()
    //                     .then(response => {
    //                         if (response.status == "200") {
    //                             var listArray = response.data;
    //                             listArray.sort((a, b) => {
    //                                 var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
    //                                 var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
    //                                 return itemLabelA > itemLabelB ? 1 : -1;
    //                             });
    //                             this.setState({
    //                                 organisations: listArray,
    //                                 selOrganisation: listArray.filter(c => c.active.toString() == "true")
    //                             });
    //                             HealthAreaService.getHealthAreaList()
    //                                 .then(response => {
    //                                     if (response.status == "200") {
    //                                         var listArray = response.data;
    //                                         listArray.sort((a, b) => {
    //                                             var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
    //                                             var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
    //                                             return itemLabelA > itemLabelB ? 1 : -1;
    //                                         });
    //                                         this.setState({
    //                                             healthAreas: listArray.filter(c => c.active == true),
    //                                             selHealthArea: listArray.filter(c => c.active == true)
    //                                         });
    //                                         ProgramService.getProgramList()
    //                                             .then(response => {
    //                                                 if (response.status == "200") {
    //                                                     //                                                         var listArray = [...response.data]
    //                                                     //                                                         var arr = [];
    //                                                     // for (var i = 0; i <= response.data.length; i++) {
    //                                                     //     response.data[i].programTypeId = 1;
    //                                                     // }
    //                                                     // var listArray = response.data;
    //                                                     // listArray.sort((a, b) => {
    //                                                     //     var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
    //                                                     //     var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
    //                                                     //     return itemLabelA > itemLabelB ? 1 : -1;
    //                                                     // });
    //                                                     DatasetService.getDatasetList()
    //                                                         .then(response1 => {
    //                                                             if (response1.status == "200") {

    //                                                                 var listArray = [...response.data, ...response1.data]
    //                                                                 listArray.sort((a, b) => {
    //                                                                     var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
    //                                                                     var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
    //                                                                     return itemLabelA > itemLabelB ? 1 : -1;
    //                                                                 });
    //                                                                 this.setState({
    //                                                                     programs: listArray,
    //                                                                     selProgram: listArray.filter(c => c.active.toString() == "true")
    //                                                                 }, (
    //                                                                 ) => {
    //                                                                     // this.buildJexcel2();

    //                                                                     const { selProgram } = this.state;
    //                                                                     const { selRealmCountry } = this.state;
    //                                                                     const { selOrganisation } = this.state;
    //                                                                     const { selHealthArea } = this.state;
    //                                                                     const { selUserList } = this.state;
    //                                                                     let programList = [];
    //                                                                     let countryList = [];
    //                                                                     let organisationList = [];
    //                                                                     let healthAreaList = [];
    //                                                                     let userList1 = [];

    //                                                                     if (selUserList.length > 0) {
    //                                                                         for (var i = 0; i < selUserList.length; i++) {
    //                                                                             var paJson = {
    //                                                                                 // name: getLabelText(selProgram[i].label, this.state.lang),
    //                                                                                 name: selUserList[i].username,
    //                                                                                 id: parseInt(selUserList[i].userId),
    //                                                                                 active: selUserList[i].active
    //                                                                             }
    //                                                                             userList1[i] = paJson
    //                                                                         }
    //                                                                     }

    //                                                                     userList1 = userList1.filter(c => c.active);

    //                                                                     if (selProgram.length > 0) {
    //                                                                         for (var i = 0; i < selProgram.length; i++) {
    //                                                                             var paJson = {
    //                                                                                 // name: getLabelText(selProgram[i].label, this.state.lang),
    //                                                                                 name: selProgram[i].programCode,
    //                                                                                 id: parseInt(selProgram[i].programId),
    //                                                                                 active: selProgram[i].active
    //                                                                             }
    //                                                                             programList[i] = paJson
    //                                                                         }
    //                                                                         var paJson = {
    //                                                                             // name: "All",
    //                                                                             name: "All",
    //                                                                             id: -1,
    //                                                                             active: true
    //                                                                         }
    //                                                                         programList.unshift(paJson);
    //                                                                     }

    //                                                                     if (selRealmCountry.length > 0) {
    //                                                                         for (var i = 0; i < selRealmCountry.length; i++) {
    //                                                                             var paJson = {
    //                                                                                 name: getLabelText(selRealmCountry[i].country.label, this.state.lang),
    //                                                                                 id: parseInt(selRealmCountry[i].realmCountryId),
    //                                                                                 active: selRealmCountry[i].active
    //                                                                             }
    //                                                                             countryList[i] = paJson
    //                                                                         }
    //                                                                         var paJson = {
    //                                                                             name: "All",
    //                                                                             id: -1,
    //                                                                             active: true
    //                                                                         }
    //                                                                         countryList.unshift(paJson);
    //                                                                     }

    //                                                                     if (selOrganisation.length > 0) {
    //                                                                         for (var i = 0; i < selOrganisation.length; i++) {
    //                                                                             var paJson = {
    //                                                                                 name: getLabelText(selOrganisation[i].label, this.state.lang),
    //                                                                                 id: parseInt(selOrganisation[i].organisationId),
    //                                                                                 active: selOrganisation[i].active
    //                                                                             }
    //                                                                             organisationList[i] = paJson
    //                                                                         }
    //                                                                         var paJson = {
    //                                                                             name: "All",
    //                                                                             id: -1,
    //                                                                             active: true
    //                                                                         }
    //                                                                         organisationList.unshift(paJson);
    //                                                                     }

    //                                                                     if (selHealthArea.length > 0) {
    //                                                                         for (var i = 0; i < selHealthArea.length; i++) {
    //                                                                             var paJson = {
    //                                                                                 name: getLabelText(selHealthArea[i].label, this.state.lang),
    //                                                                                 id: parseInt(selHealthArea[i].healthAreaId),
    //                                                                                 active: selHealthArea[i].active
    //                                                                             }
    //                                                                             healthAreaList[i] = paJson
    //                                                                         }
    //                                                                         var paJson = {
    //                                                                             name: "All",
    //                                                                             id: -1,
    //                                                                             active: true
    //                                                                         }
    //                                                                         healthAreaList.unshift(paJson);
    //                                                                     }




    //                                                                     let userList = this.state.selUserList;
    //                                                                     console.log("userList---->1", userList.filter(c => c.userId == 663));
    //                                                                     console.log("userList---->12", countryList);


    //                                                                     let userArray = [];
    //                                                                     let count = 0;

    //                                                                     for (var j = 0; j < userList.length; j++) {
    //                                                                         // console.log("userList---->2", userList.filter(c => c.userId == 663)[0].userAclList.map(a => a.realmCountryId).toString().trim().replaceAll(',', ';'));
    //                                                                         data = [];
    //                                                                         data[0] = userList[j].userId
    //                                                                         data[1] = userList[j].userId
    //                                                                         data[2] = userList[j].userAclList.map(a => a.realmCountryId).toString().trim().replaceAll(',', ';');
    //                                                                         data[3] = userList[j].userAclList.map(a => a.healthAreaId).toString().trim().replaceAll(',', ';');
    //                                                                         // data[1] = papuList[j].healthAreaList.map(a => a.id).toString().trim().replaceAll(',', ';')
    //                                                                         data[4] = userList[j].userAclList.map(a => a.organisationId).toString().trim().replaceAll(',', ';');
    //                                                                         data[5] = userList[j].userAclList.map(a => a.programId).toString().trim().replaceAll(',', ';');


    //                                                                         userArray[count] = data;
    //                                                                         count++;
    //                                                                     }
    //                                                                     // if (userList.length == 0) {
    //                                                                     //     data = [];
    //                                                                     //     userArray[0] = data;
    //                                                                     // }
    //                                                                     // console.log("userArray---->", userArray);
    //                                                                     // if (this.state.table1Instance != "" && this.state.table1Instance != undefined) {
    //                                                                     //     this.state.table1Instance.destroy();
    //                                                                     // }
    //                                                                     this.el = jexcel(document.getElementById("tableDiv2"), '');
    //                                                                     this.el.destroy();
    //                                                                     var json = [];
    //                                                                     var data = userArray;

    //                                                                     var options = {
    //                                                                         data: data,
    //                                                                         columnDrag: true,
    //                                                                         colWidths: [50, 50, 50, 50, 120],
    //                                                                         colHeaderClasses: ["Reqasterisk"],
    //                                                                         columns: [
    //                                                                             {
    //                                                                                 title: 'userId', //0A 
    //                                                                                 type: 'hidden',
    //                                                                             },
    //                                                                             {
    //                                                                                 title: i18n.t('static.user.username'),
    //                                                                                 type: 'autocomplete',
    //                                                                                 source: userList1,
    //                                                                                 // multiple: true,
    //                                                                                 readOnly: true//2C
    //                                                                             },
    //                                                                             {
    //                                                                                 title: i18n.t('static.program.realmcountry'),
    //                                                                                 type: 'autocomplete',
    //                                                                                 source: countryList,
    //                                                                                 multiple: true,
    //                                                                                 readOnly: true//3D
    //                                                                             },
    //                                                                             {
    //                                                                                 title: i18n.t('static.dashboard.healthareaheader'),
    //                                                                                 type: 'autocomplete',
    //                                                                                 source: healthAreaList,
    //                                                                                 multiple: true,
    //                                                                                 readOnly: true//4E
    //                                                                             },
    //                                                                             {
    //                                                                                 title: i18n.t('static.organisation.organisation'),
    //                                                                                 type: 'autocomplete',
    //                                                                                 source: organisationList,
    //                                                                                 readOnly: true,
    //                                                                                 multiple: true,
    //                                                                                 // filter: this.filterOrganisation

    //                                                                             },
    //                                                                             {
    //                                                                                 title: i18n.t('static.dashboard.programheader'),
    //                                                                                 type: 'autocomplete',
    //                                                                                 source: programList,
    //                                                                                 multiple: true,
    //                                                                                 // filter: this.filterProgram
    //                                                                                 readOnly: true

    //                                                                             },


    //                                                                         ],
    //                                                                         // updateTable: function (el, cell, x, y, source, value, id) {
    //                                                                         //     if (y != null) {
    //                                                                         //         var elInstance = el.jexcel;
    //                                                                         //         //left align
    //                                                                         //         // elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');

    //                                                                         //         var rowData = elInstance.getRowData(y);
    //                                                                         //         var addRowId = rowData[9];
    //                                                                         //         console.log("addRowId------>", addRowId);
    //                                                                         //         if (addRowId == 1) {//active grade out
    //                                                                         //             var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
    //                                                                         //             cell1.classList.add('readonly');

    //                                                                         //             var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
    //                                                                         //             cell1.classList.remove('readonly');
    //                                                                         //         } else {
    //                                                                         //             var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
    //                                                                         //             cell1.classList.remove('readonly');

    //                                                                         //             var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
    //                                                                         //             cell1.classList.add('readonly');
    //                                                                         //         }
    //                                                                         //     }
    //                                                                         // },
    //                                                                         text: {
    //                                                                             showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')} `,
    //                                                                             show: '',
    //                                                                             entries: '',
    //                                                                         },
    //                                                                         onload: this.loaded2,
    //                                                                         onselection: this.selected,
    //                                                                         pagination: localStorage.getItem("sesRecordCount"),
    //                                                                         search: true,
    //                                                                         columnSorting: true,
    //                                                                         tableOverflow: true,
    //                                                                         wordWrap: true,
    //                                                                         allowInsertColumn: false,
    //                                                                         allowManualInsertColumn: false,
    //                                                                         allowDeleteRow: true,
    //                                                                         // onselection: this.selected,
    //                                                                         oneditionend: this.onedit,
    //                                                                         copyCompatibility: true,
    //                                                                         allowExport: false,
    //                                                                         paginationOptions: JEXCEL_PAGINATION_OPTION,
    //                                                                         position: 'top',
    //                                                                         filters: true,
    //                                                                         parseFormulas: true,
    //                                                                         license: JEXCEL_PRO_KEY,
    //                                                                         editable: true,
    //                                                                         contextMenu: function (obj, x, y, e) {
    //                                                                             var items = [];

    //                                                                             if (y != null) {
    //                                                                                 if (obj.options.allowInsertRow == true) {
    //                                                                                     // items.push({
    //                                                                                     //     title: i18n.t('static.user.accessControlText'),
    //                                                                                     //     onclick: function () {
    //                                                                                     //         // console.log("onclick------>", this.el.getValueFromCoords(0, y));
    //                                                                                     //         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_ACCESS_CONTROL')) {
    //                                                                                     //             this.props.history.push({
    //                                                                                     //                 pathname: `/user/accessControl/${this.el.getValueFromCoords(0, y)}`,
    //                                                                                     //             });
    //                                                                                     //         }

    //                                                                                     //     }.bind(this)
    //                                                                                     // });

    //                                                                                     // if (obj.options.allowInsertRow == true) {
    //                                                                                     //     items.push({
    //                                                                                     //         title: i18n.t('static.user.accessControlText'),
    //                                                                                     //         onclick: function () {
    //                                                                                     //             // console.log("onclick------>", this.el.getValueFromCoords(0, y));
    //                                                                                     //             if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_ACCESS_CONTROL')) {
    //                                                                                     //                 this.props.history.push({
    //                                                                                     //                     pathname: `/user/accessControl/${this.el.getValueFromCoords(0, y)}`,
    //                                                                                     //                 });
    //                                                                                     //             }

    //                                                                                     //         }.bind(this)
    //                                                                                     //     });
    //                                                                                     // }
    //                                                                                 }

    //                                                                                 // Delete a row                                                                                    
    //                                                                                 // if (obj.options.allowDeleteRow == true) {
    //                                                                                 //     // region id
    //                                                                                 //     console.log("getRowData---------->", obj.getRowData(y));
    //                                                                                 //     if (obj.getRowData(y)[0] == 0) {
    //                                                                                 //         items.push({
    //                                                                                 //             title: i18n.t("static.common.deleterow"),
    //                                                                                 //             onclick: function () {
    //                                                                                 //                 obj.deleteRow(parseInt(y));
    //                                                                                 //             }
    //                                                                                 //         });
    //                                                                                 //         // Line
    //                                                                                 //         // items.push({ type: 'line' });
    //                                                                                 //     }
    //                                                                                 // }
    //                                                                             }


    //                                                                             return items;
    //                                                                         }.bind(this)
    //                                                                     };
    //                                                                     var table2Instance = jexcel(document.getElementById("tableDiv2"), options);
    //                                                                     this.el = table2Instance;
    //                                                                     this.setState({
    //                                                                         table2Instance: table2Instance,
    //                                                                         loading: false
    //                                                                     })







    //                                                                 });
    //                                                             }

    //                                                         }).catch(
    //                                                             error => {
    //                                                                 if (error.message === "Network Error") {
    //                                                                     this.setState({
    //                                                                         message: 'static.unkownError',
    //                                                                         loading: false
    //                                                                     });
    //                                                                 } else {
    //                                                                     switch (error.response ? error.response.status : "") {

    //                                                                         case 401:
    //                                                                             this.props.history.push(`/login/static.message.sessionExpired`)
    //                                                                             break;
    //                                                                         case 403:
    //                                                                             this.props.history.push(`/accessDenied`)
    //                                                                             break;
    //                                                                         case 500:
    //                                                                         case 404:
    //                                                                         case 406:
    //                                                                             this.setState({
    //                                                                                 message: error.response.data.messageCode,
    //                                                                                 loading: false
    //                                                                             });
    //                                                                             break;
    //                                                                         case 412:
    //                                                                             this.setState({
    //                                                                                 message: error.response.data.messageCode,
    //                                                                                 loading: false
    //                                                                             });
    //                                                                             break;
    //                                                                         default:
    //                                                                             this.setState({
    //                                                                                 message: 'static.unkownError',
    //                                                                                 loading: false
    //                                                                             });
    //                                                                             break;
    //                                                                     }
    //                                                                 }
    //                                                             }
    //                                                         );
    //                                                 } else {
    //                                                     this.setState({
    //                                                         message: response.data.messageCode
    //                                                     },
    //                                                         () => {
    //                                                             this.hideSecondComponent();
    //                                                         })
    //                                                 }

    //                                             }).catch(
    //                                                 error => {
    //                                                     if (error.message === "Network Error") {
    //                                                         this.setState({
    //                                                             message: 'static.unkownError',
    //                                                             loading: false
    //                                                         });
    //                                                     } else {
    //                                                         switch (error.response ? error.response.status : "") {

    //                                                             case 401:
    //                                                                 this.props.history.push(`/login/static.message.sessionExpired`)
    //                                                                 break;
    //                                                             case 403:
    //                                                                 this.props.history.push(`/accessDenied`)
    //                                                                 break;
    //                                                             case 500:
    //                                                             case 404:
    //                                                             case 406:
    //                                                                 this.setState({
    //                                                                     message: error.response.data.messageCode,
    //                                                                     loading: false
    //                                                                 });
    //                                                                 break;
    //                                                             case 412:
    //                                                                 this.setState({
    //                                                                     message: error.response.data.messageCode,
    //                                                                     loading: false
    //                                                                 });
    //                                                                 break;
    //                                                             default:
    //                                                                 this.setState({
    //                                                                     message: 'static.unkownError',
    //                                                                     loading: false
    //                                                                 });
    //                                                                 break;
    //                                                         }
    //                                                     }
    //                                                 }
    //                                             );
    //                                     } else {
    //                                         this.setState({
    //                                             message: response.data.message
    //                                         })
    //                                     }

    //                                 }).catch(
    //                                     error => {
    //                                         if (error.message === "Network Error") {
    //                                             this.setState({
    //                                                 message: 'static.unkownError',
    //                                                 loading: false
    //                                             });
    //                                         } else {
    //                                             switch (error.response ? error.response.status : "") {

    //                                                 case 401:
    //                                                     this.props.history.push(`/login/static.message.sessionExpired`)
    //                                                     break;
    //                                                 case 403:
    //                                                     this.props.history.push(`/accessDenied`)
    //                                                     break;
    //                                                 case 500:
    //                                                 case 404:
    //                                                 case 406:
    //                                                     this.setState({
    //                                                         message: error.response.data.messageCode,
    //                                                         loading: false
    //                                                     });
    //                                                     break;
    //                                                 case 412:
    //                                                     this.setState({
    //                                                         message: error.response.data.messageCode,
    //                                                         loading: false
    //                                                     });
    //                                                     break;
    //                                                 default:
    //                                                     this.setState({
    //                                                         message: 'static.unkownError',
    //                                                         loading: false
    //                                                     });
    //                                                     break;
    //                                             }
    //                                         }
    //                                     }
    //                                 );
    //                         } else {
    //                             this.setState({
    //                                 message: response.data.messageCode
    //                             },
    //                                 () => {
    //                                     this.hideSecondComponent();
    //                                 })
    //                         }

    //                     }).catch(
    //                         error => {
    //                             if (error.message === "Network Error") {
    //                                 this.setState({
    //                                     message: 'static.unkownError',
    //                                     loading: false
    //                                 });
    //                             } else {
    //                                 switch (error.response ? error.response.status : "") {

    //                                     case 401:
    //                                         this.props.history.push(`/login/static.message.sessionExpired`)
    //                                         break;
    //                                     case 403:
    //                                         this.props.history.push(`/accessDenied`)
    //                                         break;
    //                                     case 500:
    //                                     case 404:
    //                                     case 406:
    //                                         this.setState({
    //                                             message: error.response.data.messageCode,
    //                                             loading: false
    //                                         });
    //                                         break;
    //                                     case 412:
    //                                         this.setState({
    //                                             message: error.response.data.messageCode,
    //                                             loading: false
    //                                         });
    //                                         break;
    //                                     default:
    //                                         this.setState({
    //                                             message: 'static.unkownError',
    //                                             loading: false
    //                                         });
    //                                         break;
    //                                 }
    //                             }
    //                         }
    //                     );
    //             } else {
    //                 this.setState({
    //                     message: response.data.messageCode
    //                 },
    //                     () => {
    //                         this.hideSecondComponent();
    //                     })
    //             }

    //         }).catch(
    //             error => {
    //                 if (error.message === "Network Error") {
    //                     this.setState({
    //                         message: 'static.unkownError',
    //                         loading: false
    //                     });
    //                 } else {
    //                     switch (error.response ? error.response.status : "") {

    //                         case 401:
    //                             this.props.history.push(`/login/static.message.sessionExpired`)
    //                             break;
    //                         case 403:
    //                             this.props.history.push(`/accessDenied`)
    //                             break;
    //                         case 500:
    //                         case 404:
    //                         case 406:
    //                             this.setState({
    //                                 message: error.response.data.messageCode,
    //                                 loading: false
    //                             });
    //                             break;
    //                         case 412:
    //                             this.setState({
    //                                 message: error.response.data.messageCode,
    //                                 loading: false
    //                             });
    //                             break;
    //                         default:
    //                             this.setState({
    //                                 message: 'static.unkownError',
    //                                 loading: false
    //                             });
    //                             break;
    //                     }
    //                 }
    //             }
    //         );
    // }


    buildJExcel2() {

        let userList = this.state.selUserList;
        // console.log("userList---->1", userList.filter(c => c.userId == 663));
        console.log("userList---->1", userList);

        console.log("userList---->1", (userList.filter(c => c.userId == 1)[0].userAclList.map(c => (c.programName.label_en == "" || c.programName.label_en == null ? "All" : c.programName.label_en))).toString());
        console.log("userList---->1", (userList.filter(c => c.userId == 30)[0].userAclList.map(c => (c.programName.label_en == "" ? "All" : c.programName.label_en))).toString());

        // console.log("userList---->12", countryList);

        let userArray = [];
        let count = 0;

        for (var j = 0; j < userList.length; j++) {
            // console.log("userList---->2", userList.filter(c => c.userId == 663)[0].userAclList.map(a => a.realmCountryId).toString().trim().replaceAll(',', ';'));
            data = [];
            data[0] = userList[j].userId
            data[1] = userList[j].username
            data[2] = ([...new Set(userList[j].userAclList.map(a => a.countryName.label_en == "" || a.countryName.label_en == null ? "All" : a.countryName.label_en))]).toString();
            data[3] = ([...new Set(userList[j].userAclList.map(a => a.healthAreaName.label_en == "" || a.healthAreaName.label_en == null ? "All" : a.healthAreaName.label_en))]).toString();
            // data[1] = papuList[j].healthAreaList.map(a => a.id).toString().trim().replaceAll(',', ';')
            data[4] = ([...new Set(userList[j].userAclList.map(a => a.organisationName.label_en == "" || a.organisationName.label_en == null ? "All" : a.organisationName.label_en))]).toString();
            data[5] = ([...new Set(userList[j].userAclList.map(a => a.programName.label_en == "" || a.programName.label_en == null ? "All" : a.programName.label_en))]).toString();


            userArray[count] = data;
            count++;
        }
        // if (userList.length == 0) {
        //     data = [];
        //     userArray[0] = data;
        // }
        // console.log("userArray---->", userArray);
        // if (this.state.table1Instance != "" && this.state.table1Instance != undefined) {
        //     this.state.table1Instance.destroy();
        // }
        this.el = jexcel(document.getElementById("tableDiv2"), '');
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
                    title: 'userId', //0A 
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.user.username'),
                    type: 'text',
                    readOnly: true//2C
                },
                {
                    title: i18n.t('static.program.realmcountry'),
                    type: 'text',
                    readOnly: true//3D
                },
                {
                    title: i18n.t('static.dashboard.healthareaheader'),
                    type: 'text',
                    readOnly: true//4E
                },
                {
                    title: i18n.t('static.organisation.organisation'),
                    type: 'text',
                    readOnly: true,
                    // filter: this.filterOrganisation

                },
                {
                    title: i18n.t('static.dashboard.programheader'),
                    type: 'text',
                    // filter: this.filterProgram
                    readOnly: true

                },

            ],
            // updateTable: function (el, cell, x, y, source, value, id) {
            //     if (y != null) {
            //         var elInstance = el.jexcel;
            //         //left align
            //         // elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');

            //         var rowData = elInstance.getRowData(y);
            //         var addRowId = rowData[9];
            //         console.log("addRowId------>", addRowId);
            //         if (addRowId == 1) {//active grade out
            //             var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');

            //             var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
            //             cell1.classList.remove('readonly');
            //         } else {
            //             var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
            //             cell1.classList.remove('readonly');

            //             var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');
            //         }
            //     }
            // },
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')} `,
                show: '',
                entries: '',
            },
            onload: this.loaded2,
            onselection: this.selected,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            // onselection: this.selected,
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
                        // items.push({
                        //     title: i18n.t('static.user.accessControlText'),
                        //     onclick: function () {
                        //         // console.log("onclick------>", this.el.getValueFromCoords(0, y));
                        //         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_ACCESS_CONTROL')) {
                        //             this.props.history.push({
                        //                 pathname: `/user/accessControl/${this.el.getValueFromCoords(0, y)}`,
                        //             });
                        //         }

                        //     }.bind(this)
                        // });

                        // if (obj.options.allowInsertRow == true) {
                        //     items.push({
                        //         title: i18n.t('static.user.accessControlText'),
                        //         onclick: function () {
                        //             // console.log("onclick------>", this.el.getValueFromCoords(0, y));
                        //             if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_ACCESS_CONTROL')) {
                        //                 this.props.history.push({
                        //                     pathname: `/user/accessControl/${this.el.getValueFromCoords(0, y)}`,
                        //                 });
                        //             }

                        //         }.bind(this)
                        //     });
                        // }
                    }

                    // Delete a row                                                                                    
                    // if (obj.options.allowDeleteRow == true) {
                    //     // region id
                    //     console.log("getRowData---------->", obj.getRowData(y));
                    //     if (obj.getRowData(y)[0] == 0) {
                    //         items.push({
                    //             title: i18n.t("static.common.deleterow"),
                    //             onclick: function () {
                    //                 obj.deleteRow(parseInt(y));
                    //             }
                    //         });
                    //         // Line
                    //         // items.push({ type: 'line' });
                    //     }
                    // }
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

    render() {
        const { realms } = this.state;
        const { languages } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        let languageList = languages.length > 0
            && languages.map((item, i) => {
                return (
                    <option key={i} value={item.languageId}>
                        {item.label.label_en}
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
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '} */}
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
                                            {/* <InputGroupAddon addonType="append">
                                            <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon> */}
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </Col>
                        }
                        {/* <div id="loader" className="center"></div> */}


                        <Nav tabs className='pt-lg-0'>
                            <NavItem>
                                <NavLink
                                    active={this.state.activeTab1[0] === '1'}
                                    onClick={() => { this.toggleModal(0, '1'); }}
                                >
                                    {'User List'}
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    active={this.state.activeTab1[0] === '2'}
                                    onClick={() => { this.toggleModal(0, '2'); }}
                                >
                                    {'Access Control List'}
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

                    <Modal isOpen={this.state.isModalOpen}
                        className={'modal-lg ' + this.props.className, "modalWidth"}>
                        <ModalHeader>
                            <strong>{i18n.t('static.common.update') + ' ' + i18n.t('static.userHead.user')}</strong>
                        </ModalHeader>
                        <ModalBody>
                            <span><h5 style={{ color: this.state.color }} id="div3">{this.state.message}</h5></span>
                            {/* <h6 className="red" id="div3"></h6> */}

                            <br />

                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    username: this.state.user.username,
                                    realmId: this.state.user.realm.realmId,
                                    emailId: this.state.user.emailId,
                                    // phoneNumber: (this.state.user.phoneNumber == null ? '' : this.state.user.phoneNumber),
                                    orgAndCountry: this.state.user.orgAndCountry,
                                    roles: this.state.user.roleList,
                                    languageId: this.state.user.language.languageId,
                                    roleId: this.state.user.roleList
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    console.log(JSON.stringify(this.state.user))
                                    this.setState({
                                        message: '',
                                        loading: true
                                    })
                                    UserService.editUser(this.state.user)
                                        .then(response => {
                                            if (response.status == 200) {
                                                // this.props.history.push(`/user/listUser/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                                this.modelOpenClose();
                                                this.setState({
                                                    message1: 'User update successfully',
                                                    color: 'green'
                                                },
                                                    () => {
                                                        this.hideThirdComponent();
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

                                }}
                                render={
                                    ({
                                        values,
                                        errors,
                                        touched,
                                        handleChange,
                                        handleBlur,
                                        handleSubmit,
                                        isSubmitting,
                                        isValid,
                                        setTouched,
                                        setFieldValue,
                                        setFieldTouched
                                    }) => (
                                        <Form onSubmit={handleSubmit} noValidate name='userForm' autocomplete="off">
                                            <CardBody className="pt-2 pb-0" >
                                                <Input
                                                    type="hidden"
                                                    name="roleValid"
                                                    id="roleValid"
                                                    value={false}
                                                />
                                                {/* <Input
                                                        type="hidden"
                                                        name="needPhoneValidation"
                                                        id="needPhoneValidation"
                                                        value={((this.state.user.phoneNumber === '' || this.state.user.phoneNumber == null) ? false : true)}
                                                    /> */}
                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.realm.realm')}<span class="red Reqasterisk">*</span></Label><Input
                                                        type="text"
                                                        name="realmId"
                                                        id="realmId"
                                                        bsSize="sm"
                                                        readOnly={true}
                                                        value={this.state.user.realm.label.label_en}
                                                    // value={this.state.user.roleList}
                                                    ></Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="username">{i18n.t('static.user.username')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="username"
                                                        id="username"
                                                        bsSize="sm"
                                                        valid={!errors.username}
                                                        // invalid={touched.username && !!errors.username || this.state.user.username == ''}
                                                        invalid={(touched.username && !!errors.username) || !!errors.username}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        maxLength={25}
                                                        required
                                                        value={this.state.user.username}
                                                    /> <FormFeedback className="red">{errors.username}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="emailId">{i18n.t('static.user.emailid')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="search"
                                                        name="emailId"
                                                        id="emailId"
                                                        bsSize="sm"
                                                        valid={!errors.emailId}
                                                        // invalid={touched.emailId && !!errors.emailId || this.state.user.emailId == ''}
                                                        invalid={(touched.emailId && !!errors.emailId) || !!errors.emailId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        maxLength={50}
                                                        required
                                                        value={this.state.user.emailId}
                                                    />
                                                    <FormFeedback className="red">{errors.emailId}</FormFeedback>
                                                </FormGroup>
                                                {/* <FormGroup>
                                                        <Label for="phoneNumber">{i18n.t('static.user.phoneNumber')}</Label>
                                                        <Input type="text"
                                                            name="phoneNumber"
                                                            id="phoneNumber"
                                                            bsSize="sm"
                                                            valid={!errors.phoneNumber}
                                                            // invalid={touched.phoneNumber && !!errors.phoneNumber}
                                                            invalid={(touched.phoneNumber && !!errors.phoneNumber) || !!errors.phoneNumber}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.user.phoneNumber}
                                                        />
                                                        <FormFeedback className="red">{errors.phoneNumber}</FormFeedback>
                                                    </FormGroup> */}
                                                <FormGroup>
                                                    <Label for="orgAndCountry">{i18n.t('static.user.orgAndCountry')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="orgAndCountry"
                                                        id="orgAndCountry"
                                                        bsSize="sm"
                                                        valid={!errors.orgAndCountry}
                                                        invalid={(touched.orgAndCountry && !!errors.orgAndCountry) || !!errors.orgAndCountry}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        maxLength={100}
                                                        required
                                                        value={this.state.user.orgAndCountry}
                                                    /> <FormFeedback className="red">{errors.orgAndCountry}</FormFeedback>
                                                </FormGroup>


                                                <FormGroup className="Selectcontrol-bdrNone">
                                                    <Label htmlFor="roleId">{i18n.t('static.role.role')}<span class="red Reqasterisk">*</span></Label>
                                                    <Select
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.roleId },
                                                            { 'is-invalid': (touched.roleId && !!errors.roleId || this.state.user.roles.length == 0 || this.state.appAdminRole) }
                                                        )}
                                                        bsSize="sm"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue("roleId", e);
                                                            this.roleChange(e);
                                                        }}
                                                        onBlur={() => setFieldTouched("roleId", true)}
                                                        name="roleId"
                                                        id="roleId"
                                                        multi
                                                        options={this.state.roleListInUpdate}
                                                        value={this.state.user.roles}
                                                    />
                                                    {/* <Input
                                                            type="select"
                                                            name="roleId"
                                                            id="roleId"
                                                            bsSize="sm"
                                                            valid={!errors.roleId}
                                                            invalid={touched.roleId && !!errors.roleId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.user.roles}
                                                            multiple={true}
                                                        >
                                                            <option value="0" disabled>{i18n.t('static.common.select')}</option>
                                                            {roleList}
                                                        </Input> */}
                                                    <FormFeedback className="red">{errors.roleId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="languageId">{i18n.t('static.language.language')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="languageId"
                                                        id="languageId"
                                                        bsSize="sm"
                                                        valid={!errors.languageId}
                                                        // invalid={touched.languageId && !!errors.languageId || this.state.user.language.languageId == ''}
                                                        invalid={touched.languageId && !!errors.languageId || !!errors.languageId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={this.state.user.language.languageId}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {languageList}
                                                    </Input> <FormFeedback className="red">{errors.languageId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label className="P-absltRadio">{i18n.t('static.common.status')}</Label>
                                                    <FormGroup check inline>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="active1"
                                                            name="active"
                                                            value={true}
                                                            checked={this.state.user.active === true}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio1">
                                                            {i18n.t('static.common.active')}
                                                        </Label>
                                                    </FormGroup>
                                                    <FormGroup check inline>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="active2"
                                                            name="active"
                                                            value={false}
                                                            checked={this.state.user.active === false}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2">
                                                            {i18n.t('static.common.disabled')}
                                                        </Label>
                                                    </FormGroup>
                                                </FormGroup>
                                            </CardBody>
                                            <Row style={{ display: this.state.loading ? "block" : "none" }}>
                                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                                    <div class="align-items-center">
                                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                                        <div class="spinner-border blue ml-4" role="status">

                                                        </div>
                                                    </div>
                                                </div>
                                            </Row>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => this.modelOpenClose()}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>

                                                    &nbsp;
                                                </FormGroup>
                                            </CardFooter>
                                        </Form>
                                    )} />
                        </ModalBody>

                        <ModalFooter>
                            {/* {(this.state.roleArray.includes('ROLE_REALM_ADMIN') || this.state.roleArray.includes('ROLE_DATASET_ADMIN')) &&
                                <div className="mr-0">
                                    {this.state.isChanged1 && <Button type="submit" size="md" color="success" className="float-right" onClick={this.formSubmit1} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                                    <Button color="info" size="md" className="float-right mr-1" id="eqUnitAddRow" type="button" onClick={() => this.addRow1()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                                </div>
                            } */}
                            {/* <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.modelOpenClose()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button> */}
                        </ModalFooter>
                    </Modal>

                </Card>

            </div>
        );
    }
}
export default ListUserComponent;

