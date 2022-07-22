import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, FormFeedback, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import UserService from "../../api/UserService";
import RealmService from "../../api/RealmService";
import LanguageService from "../../api/LanguageService";
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from "../../api/ProgramService";
import DatasetService from "../../api/DatasetService";
import ProductService from "../../api/ProductService"
import OrganisationService from "../../api/OrganisationService"
import HealthAreaService from "../../api/HealthAreaService"
import RealmCountryService from "../../api/RealmCountryService"
import getLabelText from '../../CommonComponent/getLabelText';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { SPECIAL_CHARECTER_WITH_NUM, LABEL_REGEX, SPECIAL_CHARECTER_WITH_NUM_NODOUBLESPACE } from '../../Constants.js';
import { ALPHABET_NUMBER_REGEX, SPACE_REGEX } from '../../Constants.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import classNames from 'classnames';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";

let initialValues = {
    username: "",
    realmId: [],
    emailId: "",
    // phoneNumber: "",
    orgAndCountry: "",
    languageId: [],
    roleId: []
}
const entityname = i18n.t('static.user.user')
const validationSchema = function (values) {
    return Yup.object().shape({

        // username: Yup.string()
        //     .required(i18n.t('static.user.validusername'))
        //     .matches(LABEL_REGEX, i18n.t('static.message.rolenamevalidtext')),
        username: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.user.validusername')),
        showRealm: Yup.boolean(),
        realmId: Yup.string()
            .when("showRealm", {
                is: val => {
                    console.log("validation---------" + document.getElementById("showRealm").value)
                    console.log("result---", (document.getElementById("showRealm").value === "true"));
                    return document.getElementById("showRealm").value === "true";
                },
                then: Yup.string().required(i18n.t('static.common.realmtext')),
                otherwise: Yup.string().notRequired()
            }),
        // .test('showRealm', i18n.t('static.common.realmtext'),
        //     function (value) {
        //         if (document.getElementById("showRealm").value === "true") {
        //             console.log("inside if ---", value);
        //             return true;
        //         }
        //     }),
        // .test('showRealm', i18n.t('static.common.realmtext'),
        //     function (value) {
        //         if (document.getElementById("showRealm").value == "true") {
        //             console.log("inside if ---", document.getElementById("showRealm").value);
        //             return true;
        //         } else {
        //             console.log("else-------------", value);
        //             return false;
        //         }
        //         return true;
        //         console.log("out-------------");
        //     }),
        roleId: Yup.string()
            .test('roleValid', i18n.t('static.common.roleinvalidtext'),
                function (value) {
                    if (document.getElementById("roleValid").value == "false") {
                        console.log("inside if ---", value);
                        return true;
                    }
                })
            .required(i18n.t('static.user.validrole')),
        languageId: Yup.string()
            .required(i18n.t('static.user.validlanguage')),
        emailId: Yup.string()
            .email(i18n.t('static.user.invalidemail'))
            .required(i18n.t('static.user.validemail')),
        // phoneNumber: Yup.string()
        //     .min(4, i18n.t('static.user.validphonemindigit'))
        //     .max(15, i18n.t('static.user.validphonemaxdigit'))
        //     .matches(/^[0-9]*$/, i18n.t('static.user.validnumber'))
        //     .required(i18n.t('static.user.validphone')),

        // needPhoneValidation: Yup.boolean(),
        // phoneNumber: Yup.string()
        //     .when("needPhoneValidation", {
        //         is: val => {
        //             return document.getElementById("needPhoneValidation").value === "true";

        //         },
        //         then: Yup.string().min(6, i18n.t('static.user.validphonemindigit'))
        //             .max(15, i18n.t('static.user.validphonemaxdigit'))
        //             .matches(/^[0-9]*$/, i18n.t('static.user.validnumber'))
        //             .required(i18n.t('static.user.validphone')),
        //         otherwise: Yup.string().notRequired()
        //     }),

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
class AddUserComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showRealmValidation: false,
            appAdminRole: false,
            lang: localStorage.getItem('lang'),
            realms: [],
            languages: [],
            user: {
                realm: {
                    realmId: ''
                },
                language: {
                    languageId: ''
                },
                roles: [],
                username: '',
                emailId: '',
                // phoneNumber: '',
                orgAndCountry: '',
            },
            loading: true,
            roleId: '',
            roleList: [],
            message: '',
            validateRealm: '',
            isValid: false,
            loading1: true,
            programListForFilter: [],
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.roleChange = this.roleChange.bind(this);
        this.realmChange = this.realmChange.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getAccessControlData = this.getAccessControlData.bind(this);
        this.addRow = this.addRow.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.filterOrganisation = this.filterOrganisation.bind(this);
        this.filterHealthArea = this.filterHealthArea.bind(this);
        this.filterProgram = this.filterProgram.bind(this);
        this.filterData = this.filterData.bind(this);
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    realmChange() {
        let { user } = this.state;
        let count = 0;
        let count1 = 0;
        console.log("roles---", this.state.user.roles);
        for (var i = 0; i < this.state.user.roles.length; i++) {
            if (this.state.user.roles[i] != 'ROLE_APPLICATION_ADMIN') {
                count++;
            } else {
                count1++;
            }
        }
        if (count > 0) {
            this.setState({
                showRealmValidation: (this.state.user.realm.realmId != '' ? false : true)
            },
                () => { });

            document.getElementById("showRealm").value = true;
        } else {
            this.setState({
                showRealmValidation: false
            },
                () => { });

            document.getElementById("showRealm").value = false;
        }
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

        if (event.target.name == "realmId") {
            user.realm.realmId = event.target.value;

        }
        if (event.target.name == "languageId") {
            user.language.languageId = event.target.value;
        }
        this.setState({
            user
        },
            () => { });
    };

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
            this.setState({
                showRealmValidation: (this.state.user.realm.realmId != '' ? false : true)
            },
                () => { });
            document.getElementById("showRealm").value = true;
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
                showRealmValidation: false,
                appAdminRole: false
            },
                () => { console.log("show--------------" + this.state.showRealmValidation) });
            console.log("inside else");
            document.getElementById("showRealm").value = false;
            document.getElementById("roleValid").value = false;
        }
        user.roles = roleIdArray;

        this.setState({
            user,
            validateRealm: (count > 0 ? true : false)
        },
            () => { });
    }

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

    filterProgram() {
        let realmId = this.state.user.realm.realmId;
        if (realmId != 0 && realmId != null) {
            const selProgram = this.state.programs.filter(c => c.realmCountry.realm.realmId == realmId && c.active.toString() == "true")
            this.setState({
                selProgram
            });
        } else {
            this.setState({
                selProgram: this.state.programs
            });
        }

        // console.log("realmId---------->", this.state.user.realm.realmId);

        // const selProgram = this.state.programs.filter(c => c.active.toString() == "true")
        // this.setState({
        //     selProgram
        // });
    }
    filterHealthArea() {
        let realmId = this.state.user.realm.realmId;
        let selHealthArea;
        if (realmId != 0 && realmId != null) {
            selHealthArea = this.state.healthAreas.filter(c => c.realm.realmId == realmId)
        } else {
            selHealthArea = this.state.healthAreas
        }

        // selHealthArea = this.state.healthAreas
        // this.setState({
        //     selHealthArea
        // });
    }
    filterOrganisation() {
        let realmId = this.state.user.realm.realmId;
        if (realmId != 0 && realmId != null) {
            const selOrganisation = this.state.organisations.filter(c => c.realm.realmId == realmId && c.active.toString() == "true")
            this.setState({
                selOrganisation
            });
        } else {
            this.setState({
                selOrganisation: this.state.organisations
            });
        }

        // this.setState({
        //     selOrganisation: this.state.organisations.filter(c => c.active.toString() == "true")
        // });
    }
    filterData() {
        let realmId = this.state.user.realm.realmId;
        if (realmId != 0 && realmId != null) {
            const selRealmCountry = this.state.realmCountryList.filter(c => c.realm.realmId == realmId && c.active.toString() == "true")
            this.setState({
                selRealmCountry
            });
        } else {
            this.setState({
                selRealmCountry: this.state.realmCountryList
            });
        }

        // this.setState({
        //     selRealmCountry: this.state.realmCountryList.filter(c => c.active.toString() == "true")
        // });

    }

    getAccessControlData() {
        RealmCountryService.getRealmCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realmCountryList: listArray,
                        selRealmCountry: listArray.filter(c => c.active.toString() == "true")
                    })
                    OrganisationService.getOrganisationList()
                        .then(response => {
                            if (response.status == "200") {
                                var listArray = response.data;
                                listArray.sort((a, b) => {
                                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                    return itemLabelA > itemLabelB ? 1 : -1;
                                });
                                this.setState({
                                    organisations: listArray,
                                    selOrganisation: listArray
                                });
                                HealthAreaService.getHealthAreaList()
                                    .then(response => {
                                        if (response.status == "200") {
                                            var listArray = response.data;
                                            listArray.sort((a, b) => {
                                                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                                return itemLabelA > itemLabelB ? 1 : -1;
                                            });
                                            this.setState({
                                                healthAreas: listArray.filter(c => c.active == true),
                                                selHealthArea: listArray.filter(c => c.active == true)
                                            });
                                            ProgramService.getProgramList()
                                                .then(response => {
                                                    if (response.status == "200") {
                                                        console.log("CountryList------->1", response.data);

                                                        DatasetService.getDatasetList()
                                                            .then(response1 => {
                                                                if (response1.status == "200") {
                                                                    console.log("CountryList------->2", response1.data);

                                                                    var listArray = [...response.data, ...response1.data]
                                                                    listArray.sort((a, b) => {
                                                                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                                                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                                                        return itemLabelA > itemLabelB ? 1 : -1;
                                                                    });
                                                                    this.setState({
                                                                        programs: listArray,
                                                                        selProgram: listArray
                                                                    }, () => {
                                                                        // this.filterData();
                                                                        this.filterOrganisation();
                                                                        this.filterHealthArea();
                                                                        this.filterProgram();
                                                                        this.buildJexcel();
                                                                    });
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
                                                    } else {
                                                        this.setState({
                                                            message: response.data.messageCode
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
                                        } else {
                                            this.setState({
                                                message: response.data.message
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
                            } else {
                                this.setState({
                                    message: response.data.messageCode
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
                } else {
                    this.setState({
                        message: response.data.messageCode
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

    changed = function (instance, cell, x, y, value) {

        //Country
        if (x == 1) {
            this.el.setValueFromCoords(4, y, '', true);
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        //TechnicalArea
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        //Organisation
        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        //Program
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }



    }.bind(this);

    filterProgramByCountryId = function (instance, cell, c, r, source) {

        var mylist = [];
        var value = (instance.jexcel.getJson(null, false)[r])[1];
        console.log("mylist--------->3.2", value);

        // const { selProgram } = this.state;


        var proList = [];
        if (value != -1) {
            console.log("mylist--------->3.11");
            proList = this.state.programListForFilter.filter(c => c.realmCountryId == value);

        } else {
            console.log("mylist--------->3.22");
            proList = this.state.programListForFilter;
        }
        return proList;

    }.bind(this)

    buildJexcel() {
        const { selProgram } = this.state;
        const { selRealmCountry } = this.state;
        const { selOrganisation } = this.state;
        const { selHealthArea } = this.state;
        let programList = [];
        let countryList = [];
        let organisationList = [];
        let healthAreaList = [];

        if (selProgram.length > 0) {
            for (var i = 0; i < selProgram.length; i++) {
                var paJson = {
                    // name: getLabelText(selProgram[i].label, this.state.lang),
                    name: selProgram[i].programCode,
                    id: parseInt(selProgram[i].programId),
                    active: selProgram[i].active,
                    realmCountryId: selProgram[i].realmCountry.realmCountryId,
                }
                programList[i] = paJson
            }
            var paJson = {
                // name: "All",
                name: "All",
                id: -1,
                active: true
            }
            programList.unshift(paJson);
        }
        this.setState({
            programListForFilter: programList
        })

        if (selRealmCountry.length > 0) {
            for (var i = 0; i < selRealmCountry.length; i++) {
                var paJson = {
                    name: getLabelText(selRealmCountry[i].country.label, this.state.lang),
                    id: parseInt(selRealmCountry[i].realmCountryId),
                    active: selRealmCountry[i].active
                }
                countryList[i] = paJson
            }
            var paJson = {
                name: "All",
                id: -1,
                active: true
            }
            countryList.unshift(paJson);
        }

        if (selOrganisation.length > 0) {
            for (var i = 0; i < selOrganisation.length; i++) {
                var paJson = {
                    name: getLabelText(selOrganisation[i].label, this.state.lang),
                    id: parseInt(selOrganisation[i].organisationId),
                    active: selOrganisation[i].active
                }
                organisationList[i] = paJson
            }
            var paJson = {
                name: "All",
                id: -1,
                active: true
            }
            organisationList.unshift(paJson);
        }

        if (selHealthArea.length > 0) {
            for (var i = 0; i < selHealthArea.length; i++) {
                var paJson = {
                    name: getLabelText(selHealthArea[i].label, this.state.lang),
                    id: parseInt(selHealthArea[i].healthAreaId),
                    active: selHealthArea[i].active
                }
                healthAreaList[i] = paJson
            }
            var paJson = {
                name: "All",
                id: -1,
                active: true
            }
            healthAreaList.unshift(paJson);
        }

        console.log("programList----", programList);
        // console.log("countryList----",countryList);
        // console.log("organisationList----",organisationList);
        // console.log("healthAreaList---",healthAreaList);

        var papuList = this.state.rows;
        var data = [];
        var papuDataArr = [];
        // console.log("this.state.user.username------",papuList);

        // var count = 0;
        // if (papuList.length != 0) {
        //     for (var j = 0; j < papuList.length; j++) {


        //         data = [];
        //         data[0] = this.state.user.username;
        //         data[1] = papuList[j].realmCountryId;
        //         data[2] = papuList[j].healthAreaId;
        //         data[3] = papuList[j].organisationId;
        //         data[4] = papuList[j].programId;
        //         papuDataArr[count] = data;
        //         count++;


        //     }
        // }

        // console.log("inventory Data Array-->", papuDataArr);
        if (papuDataArr.length == 0) {
            data = [];
            data[0] = this.state.user.username;
            data[1] = -1;
            data[2] = -1;
            data[3] = -1;
            data[4] = -1;
            papuDataArr[0] = data;
        }
        this.el = jexcel(document.getElementById("paputableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = papuDataArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            columns: [

                {
                    title: i18n.t('static.username.username'),
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.program.realmcountry'),
                    type: 'autocomplete',
                    source: countryList,
                    // filter: this.filterCountry

                },
                {
                    title: i18n.t('static.dashboard.healthareaheader'),
                    type: 'autocomplete',
                    source: healthAreaList,
                    // filter: this.filterHealthArea

                },
                {
                    title: i18n.t('static.organisation.organisation'),
                    type: 'autocomplete',
                    source: organisationList,
                    // filter: this.filterOrganisation

                },
                {
                    title: i18n.t('static.dashboard.programheader'),
                    type: 'autocomplete',
                    source: programList,
                    filter: this.filterProgramByCountryId,
                    // filter: this.filterProgram

                },

            ],
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            onchange: this.changed,
            oneditionend: this.onedit,
            copyCompatibility: true,
            parseFormulas: true,
            onpaste: this.onPaste,
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                //Add consumption batch info


                if (y == null) {
                    // Insert a new column
                    if (obj.options.allowInsertColumn == true) {
                        items.push({
                            title: obj.options.text.insertANewColumnBefore,
                            onclick: function () {
                                obj.insertColumn(1, parseInt(x), 1);
                            }
                        });
                    }

                    if (obj.options.allowInsertColumn == true) {
                        items.push({
                            title: obj.options.text.insertANewColumnAfter,
                            onclick: function () {
                                obj.insertColumn(1, parseInt(x), 0);
                            }
                        });
                    }

                    // Delete a column
                    // if (obj.options.allowDeleteColumn == true) {
                    //     items.push({
                    //         title: obj.options.text.deleteSelectedColumns,
                    //         onclick: function () {
                    //             obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
                    //         }
                    //     });
                    // }

                    // Rename column
                    // if (obj.options.allowRenameColumn == true) {
                    //     items.push({
                    //         title: obj.options.text.renameThisColumn,
                    //         onclick: function () {
                    //             obj.setHeader(x);
                    //         }
                    //     });
                    // }

                    // Sorting
                    if (obj.options.columnSorting == true) {
                        // Line
                        items.push({ type: 'line' });

                        items.push({
                            title: obj.options.text.orderAscending,
                            onclick: function () {
                                obj.orderBy(x, 0);
                            }
                        });
                        items.push({
                            title: obj.options.text.orderDescending,
                            onclick: function () {
                                obj.orderBy(x, 1);
                            }
                        });
                    }
                } else {
                    // Insert new row before
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.common.insertNewRowBefore'),
                            onclick: function () {
                                var data = [];
                                data[0] = this.state.user.username;
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = "";
                                obj.insertRow(data, parseInt(y), 1);
                            }.bind(this)
                        });
                    }
                    // after
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.common.insertNewRowAfter'),
                            onclick: function () {
                                var data = [];
                                data[0] = this.state.user.username;
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = "";
                                obj.insertRow(data, parseInt(y));
                            }.bind(this)
                        });
                    }
                    // Delete a row
                    if (obj.options.allowDeleteRow == true) {
                        // region id
                        // if (obj.getRowData(y)[8] == 0) {
                        items.push({
                            title: i18n.t("static.common.deleterow"),
                            onclick: function () {
                                obj.deleteRow(parseInt(y));
                            }
                        });
                        // }
                    }

                    if (x) {
                        // if (obj.options.allowComments == true) {
                        //     items.push({ type: 'line' });

                        //     var title = obj.records[y][x].getAttribute('title') || '';

                        //     items.push({
                        //         title: title ? obj.options.text.editComments : obj.options.text.addComments,
                        //         onclick: function () {
                        //             obj.setComments([x, y], prompt(obj.options.text.comments, title));
                        //         }
                        //     });

                        //     if (title) {
                        //         items.push({
                        //             title: obj.options.text.clearComments,
                        //             onclick: function () {
                        //                 obj.setComments([x, y], '');
                        //             }
                        //         });
                        //     }
                        // }
                    }
                }

                // Line
                items.push({ type: 'line' });

                // Save
                // if (obj.options.allowExport) {
                //     items.push({
                //         title: i18n.t('static.supplyPlan.exportAsCsv'),
                //         shortcut: 'Ctrl + S',
                //         onclick: function () {
                //             obj.download(true);
                //         }
                //     });
                // }

                return items;
            }.bind(this)
        };

        this.el = jexcel(document.getElementById("paputableDiv"), options);
        this.setState({
            loading: false,
            loading1: false
        })
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        // tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
    }

    addRow() {

        var data = [];
        data[0] = this.state.user.username;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        this.el.insertRow(
            data, 0, 1
        );
    }
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                (instance.jexcel).setValueFromCoords(0, data[i].y, this.state.user.username, true);
                z = data[i].y;
            }
        }
    }

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
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
                    },
                        () => {
                            this.getAccessControlData();
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
                        realms: listArray, loading: false
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

        UserService.getRoleList()
            .then(response => {
                if (response.status == 200) {
                    var roleList = [{ value: "-1", label: i18n.t("static.common.all") }];
                    for (var i = 0; i < response.data.length; i++) {
                        roleList[i + 1] = { value: response.data[i].roleId, label: getLabelText(response.data[i].label, this.state.lang) }
                    }
                    var listArray = roleList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        roleList: listArray,
                        loading: false
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

        let realmId = AuthenticationService.getRealmId();
        if (realmId != -1) {
            // document.getElementById('realmId').value = realmId;
            initialValues = {
                realmId: realmId
            }
            let { user } = this.state;
            user.realm.realmId = realmId;
            document.getElementById("realmId").disabled = true;
            this.setState({
                user
            });
        }
    }

    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {

            //Country
            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(1, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            //TechnicalArea
            var col = ("C").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(2, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            //Organisation
            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            //Program
            var col = ("E").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(4, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

        }
        return valid;
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


        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div2">
                    {i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                enableReinitialize={true}
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {

                                    let isValid = this.checkValidation();
                                    console.log("isValid------------>", isValid);
                                    if (isValid) {

                                        let user = this.state.user;

                                        var tableJson = this.el.getJson(null, false);
                                        let userAcls = [];
                                        for (var i = 0; i < tableJson.length; i++) {
                                            var map1 = new Map(Object.entries(tableJson[i]));

                                            let json = {
                                                "userId": '',
                                                "realmCountryId": parseInt(map1.get("1")),
                                                "countryName": {
                                                    "createdBy": null,
                                                    "createdDate": null,
                                                    "lastModifiedBy": null,
                                                    "lastModifiedDate": null,
                                                    "active": true,
                                                    "labelId": 0,
                                                    "label_en": null,
                                                    "label_sp": null,
                                                    "label_fr": null,
                                                    "label_pr": null
                                                },
                                                "healthAreaId": parseInt(map1.get("2")),
                                                "healthAreaName": {
                                                    "createdBy": null,
                                                    "createdDate": null,
                                                    "lastModifiedBy": null,
                                                    "lastModifiedDate": null,
                                                    "active": true,
                                                    "labelId": 0,
                                                    "label_en": null,
                                                    "label_sp": null,
                                                    "label_fr": null,
                                                    "label_pr": null
                                                },
                                                "organisationId": parseInt(map1.get("3")),
                                                "organisationName": {
                                                    "createdBy": null,
                                                    "createdDate": null,
                                                    "lastModifiedBy": null,
                                                    "lastModifiedDate": null,
                                                    "active": true,
                                                    "labelId": 0,
                                                    "label_en": null,
                                                    "label_sp": null,
                                                    "label_fr": null,
                                                    "label_pr": null
                                                },
                                                "programId": parseInt(map1.get("4")),
                                                "programName": {
                                                    "createdBy": null,
                                                    "createdDate": null,
                                                    "lastModifiedBy": null,
                                                    "lastModifiedDate": null,
                                                    "active": true,
                                                    "labelId": 0,
                                                    "label_en": null,
                                                    "label_sp": null,
                                                    "label_fr": null,
                                                    "label_pr": null
                                                },
                                                "lastModifiedDate": "2020-12-02 12:10:15"
                                            }

                                            userAcls.push(json);

                                        }

                                        user.userAcls = userAcls;


                                        this.setState({
                                            loading: true
                                        })
                                        console.log("user object--->>>>", user)
                                        this.setState({
                                            message: ''
                                        })
                                        console.log("user object---------------------", user);
                                        UserService.addNewUser(user)
                                            .then(response => {
                                                console.log("user object--->>>>response", response);
                                                if (response.status == 200) {
                                                    this.props.history.push(`/user/listUser/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                                                // console.log("user object--->>>>response11");
                                                                this.setState({
                                                                    message: i18n.t('static.accesscontrol.duplicateAccessControl'),
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
                                    } else {
                                        this.setState({
                                            message: 'validation fail',
                                            loading: false
                                        });
                                    }

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
                                        handleReset,
                                        setFieldValue,
                                        setFieldTouched
                                    }) => (
                                        <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='userForm' autocomplete="off">
                                            <CardBody className="pt-2 pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <Input
                                                    type="hidden"
                                                    name="showRealm"
                                                    id="showRealm"
                                                />
                                                <Input
                                                    type="hidden"
                                                    name="roleValid"
                                                    id="roleValid"
                                                />

                                                {/* <Input
                                                        type="hidden"
                                                        name="needPhoneValidation"
                                                        id="needPhoneValidation"
                                                        value={(this.state.user.phoneNumber === '' ? false : true)}
                                                    /> */}

                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.realm.realm')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="realmId"
                                                        id="realmId"
                                                        bsSize="sm"
                                                        // valid={!errors.realmId && !this.state.showRealmValidation && this.state.user.realm.realmId != ''}
                                                        // invalid={(touched.realmId && !!errors.realmId) || this.state.showRealmValidation}
                                                        valid={!errors.realmId && this.state.user.realm.realmId != '' && this.state.showRealmValidation === false}
                                                        invalid={(touched.realmId && !!errors.realmId) || this.state.showRealmValidation === true}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.realmChange(e) }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={this.state.user.realm.realmId}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {realmList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="username">{i18n.t('static.user.username')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        autocomplete="off"
                                                        name="username"
                                                        id="username"
                                                        bsSize="sm"
                                                        valid={!errors.username && this.state.user.username != ''}
                                                        invalid={touched.username && !!errors.username}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        maxLength={25}
                                                        required
                                                        value={this.state.user.username}
                                                    /><FormFeedback className="red">{errors.username}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="emailId">{i18n.t('static.user.emailid')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="search"
                                                        // autocomplete="false"
                                                        name="emailId"
                                                        id="emailId"
                                                        bsSize="sm"
                                                        valid={!errors.emailId && this.state.user.emailId != ''}
                                                        invalid={touched.emailId && !!errors.emailId}
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
                                                            autocomplete="off"
                                                            name="phoneNumber"
                                                            id="phoneNumber"
                                                            bsSize="sm"
                                                            valid={!errors.phoneNumber && this.state.user.phoneNumber != ''}
                                                            invalid={touched.phoneNumber && !!errors.phoneNumber}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.user.phoneNumber}
                                                        /><FormFeedback className="red">{errors.phoneNumber}</FormFeedback>
                                                    </FormGroup> */}
                                                <FormGroup>
                                                    <Label for="orgAndCountry">{i18n.t('static.user.orgAndCountry')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        autocomplete="off"
                                                        name="orgAndCountry"
                                                        id="orgAndCountry"
                                                        bsSize="sm"
                                                        valid={!errors.orgAndCountry && this.state.user.orgAndCountry != ''}
                                                        invalid={touched.orgAndCountry && !!errors.orgAndCountry}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        maxLength={100}
                                                        required
                                                        value={this.state.user.orgAndCountry}
                                                    /><FormFeedback className="red">{errors.orgAndCountry}</FormFeedback>
                                                </FormGroup>

                                                <FormGroup className="Selectcontrol-bdrNone">
                                                    <Label htmlFor="roleId">{i18n.t('static.role.role')}<span class="red Reqasterisk">*</span></Label>
                                                    <Select
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.roleId && this.state.user.roles.length != 0 },
                                                            { 'is-invalid': (touched.roleId && !!errors.roleId || this.state.appAdminRole) }
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
                                                        required
                                                        min={1}
                                                        options={this.state.roleList}
                                                        value={this.state.roleId}
                                                    />
                                                    <FormFeedback className="red">{errors.roleId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="languageId">{i18n.t('static.language.language')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="languageId"
                                                        id="languageId"
                                                        bsSize="sm"
                                                        valid={!errors.languageId && this.state.user.language.languageId != ''}
                                                        invalid={touched.languageId && !!errors.languageId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={this.state.user.language.languageId}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {languageList}
                                                    </Input>
                                                    <FormFeedback>{errors.languageId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <h5><Label htmlFor="select">{'Access control'}</Label></h5>
                                                </FormGroup>

                                                <div id="paputableDiv" style={{ display: this.state.loading1 ? "none" : "block" }}>

                                                </div>
                                                <div style={{ display: this.state.loading1 ? "block" : "none" }}>
                                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                                        <div class="align-items-center">
                                                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                                            <div class="spinner-border blue ml-4" role="status">

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardBody>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button>
                                                    &nbsp;
                                                </FormGroup>
                                            </CardFooter>
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
                                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

                                                    &nbsp;
                                                </FormGroup>
                                            </CardFooter>
                                        </Form>
                                    )} />
                        </Card>
                    </Col>
                </Row>

            </div>
        );
    }
    cancelClicked() {

        this.props.history.push(`/user/listUser/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { user } = this.state;
        user.username = '';
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
            user.realm.realmId = '';
        }
        user.emailId = '';
        // user.phoneNumber = '';
        user.orgAndCountry = '';
        user.language.languageId = '';
        this.state.roleId = '';
        this.setState(
            {
                user
            },
            () => {
                this.getAccessControlData();
            })
    }
}

export default AddUserComponent;