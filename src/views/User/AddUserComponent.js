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
import getLabelText from '../../CommonComponent/getLabelText';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { SPECIAL_CHARECTER_WITH_NUM,LABEL_REGEX } from '../../Constants.js';
import { ALPHABET_NUMBER_REGEX, SPACE_REGEX } from '../../Constants.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import classNames from 'classnames';

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
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
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
            validateRealm: ''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.roleChange = this.roleChange.bind(this);
        this.realmChange = this.realmChange.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
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

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        LanguageService.getLanguageList()
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
                <h5 style={{ color: "red" }} id="div2">
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
                                    this.setState({
                                        loading: true
                                    })
                                    console.log("user object--->>>>", this.state.user)
                                    this.setState({
                                        message: ''
                                    })
                                    console.log("user object---------------------", this.state.user);
                                    UserService.addNewUser(this.state.user)
                                        .then(response => {
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
        user.emailId = '';
        // user.phoneNumber = '';
        user.orgAndCountry = '';
        user.realm.realmId = '';
        user.language.languageId = '';
        this.state.roleId = '';
        this.setState(
            {
                user
            }
        )
    }
}

export default AddUserComponent;