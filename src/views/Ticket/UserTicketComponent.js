import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import UserService from '../../api/UserService';
import RealmService from '../../api/RealmService';
import LanguageService from '../../api/LanguageService';
import getLabelText from '../../CommonComponent/getLabelText';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import classNames from 'classnames';
import { LABEL_REGEX, SPACE_REGEX } from '../../Constants';

let summaryText_1 = (i18n.t("static.ticket.addUpdateUser"))
let summaryText_2 = "Add / Update User"
const selectedRealm = (AuthenticationService.getRealmId() !== "" && AuthenticationService.getRealmId() !== -1) ? AuthenticationService.getRealmId() : ""
const initialValues = {
    summary: summaryText_1,
    realm: selectedRealm,
    name: "",
    emailId: "",
    phoneNumber: "",
    role: "",
    language: "",
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realm: Yup.string()
            .required(i18n.t('static.common.realmtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.realm.realmName')))),
        name: Yup.string()
            .required(i18n.t('static.user.validusername'))
            .matches(LABEL_REGEX, i18n.t('static.message.rolenamevalidtext')),
        emailId: Yup.string()
            .email(i18n.t('static.user.invalidemail'))
            .required(i18n.t('static.user.validemail')),
        // phoneNumber: Yup.string()
        //     .min(4, i18n.t('static.user.validphonemindigit'))
        //     .max(15, i18n.t('static.user.validphonemaxdigit'))
        //     .matches(/^[0-9]*$/, i18n.t('static.user.validnumber'))
        //     .required(i18n.t('static.user.validphone')),
        role: Yup.string()
            .test('roleValid', i18n.t('static.common.roleinvalidtext'),
                function (value) {
                    if (document.getElementById("roleValid").value == "false") {
                        return true;
                    } else {
                        return false;
                    }
                })
            .required(i18n.t('static.user.validrole')),
        language: Yup.string()
            .required(i18n.t('static.user.validlanguage')),
        // notes: Yup.string()
        //     .required(i18n.t('static.common.notestext'))
        needPhoneValidation: Yup.boolean(),
        phoneNumber: Yup.string()
            .when("needPhoneValidation", {
                is: val => {
                    return document.getElementById("needPhoneValidation").value === "true";

                },
                then: Yup.string().min(4, i18n.t('static.user.validphonemindigit'))
                    .max(15, i18n.t('static.user.validphonemaxdigit'))
                    .matches(/^[0-9]*$/, i18n.t('static.user.validnumber'))
                    .required(i18n.t('static.user.validphone')),
                otherwise: Yup.string().notRequired()
            }),
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

export default class UserTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            user: {
                summary: summaryText_1,
                realm: "",
                name: "",
                emailId: "",
                phoneNumber: "",
                role: [],
                language: "",
                notes: ''
            },
            lang: localStorage.getItem('lang'),
            realms: [],
            languages: [],
            roleList: [],
            message: '',
            realmId: '',
            roleId: '',
            languageId: '',
            loading: false
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.roleChange = this.roleChange.bind(this);
    }

    dataChange(event) {
        let { user } = this.state
        if (event.target.name == "summary") {
            user.summary = event.target.value;
        }
        if (event.target.name == "realm") {
            user.realm = event.target.value !== "" ? this.state.realms.filter(c => c.realmId == event.target.value)[0].label.label_en : "";
            this.setState({
                realmId: event.target.value
            })
        }
        if (event.target.name == "name") {
            user.name = event.target.value;
        }
        if (event.target.name == "emailId") {
            user.emailId = event.target.value;
        }
        if (event.target.name == "phoneNumber") {
            user.phoneNumber = event.target.value;
        }
        if (event.target.name == "language") {
            user.language = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                languageId: event.target.value
            })
        }
        if (event.target.name == "notes") {
            user.notes = event.target.value;
        }
        this.setState({
            user
        }, () => { })
    };

    roleChange(roleId) {
        let { user } = this.state;
        let count = 0;
        let count1 = 0;
        this.setState({ roleId });
        var roleIdArray = [];
        for (var i = 0; i < roleId.length; i++) {
            roleIdArray[i] = roleId[i].value;
            if (roleId[i].value != 'ROLE_APPLICATION_ADMIN') {
                count++;
            } else {
                count1++;
            }
        }
        if (count > 0) {
            if (count1 > 0) {
                document.getElementById("roleValid").value = true;
            } else {
                document.getElementById("roleValid").value = false;
            }
        } else {
            document.getElementById("roleValid").value = false;
        }
        user.role = roleIdArray;
        this.setState({
            user
        },
            () => { });
    }

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            realm: true,
            name: true,
            emailId: true,
            phoneNumber: true,
            role: true,
            language: true,
            notes: true
        })
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('simpleForm', (fieldName) => {
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
                    this.setState({
                        languages: response.data
                    })
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

        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {                    
                    this.setState({
                        realms: response.data,
                        realmId: selectedRealm
                    });
                    if (selectedRealm !== "") {
                        this.setState({
                            realms: (response.data).filter(c => c.realmId == selectedRealm)
                        })
    
                        let { user } = this.state;
                        user.realm = (response.data).filter(c => c.realmId == selectedRealm)[0].label.label_en;
                        this.setState({
                            user
                        }, () => {                               
    
                        })
                    }
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

        UserService.getRoleList()
            .then(response => {
                if (response.status == 200) {
                    var roleList = [];
                    for (var i = 0; i < response.data.length; i++) {
                        roleList[i] = { value: response.data[i].roleId, label: getLabelText(response.data[i].label, this.state.lang) }
                    }
                    this.setState({
                        roleList
                    })
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

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { user } = this.state;
        // user.summary = '';
        user.realm = '';
        user.name = '';
        user.emailId = '';
        user.phoneNumber = '';
        user.role = '';
        user.language = '';
        user.notes = '';
        this.setState({
            user
        },
            () => { });
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
                        {item.languageName}
                    </option>
                )
            }, this);

        return (
            <div className="col-md-12">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.ticket.addUpdateUser')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        initialValues={initialValues}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.user.summary = summaryText_2
                            JiraTikcetService.addUpdateUserRequest(this.state.user).then(response => {
                                console.log("Response :", response.status, ":", JSON.stringify(response.data));
                                if (response.status == 200 || response.status == 201) {
                                    var msg = response.data.key;
                                    this.setState({
                                        message: msg, loading: false
                                    },
                                        () => {
                                            this.resetClicked();
                                            this.hideSecondComponent();
                                        })
                                } else {
                                    this.setState({
                                        message: i18n.t('static.unkownError'), loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                }
                                this.props.togglehelp();
                                this.props.toggleSmall(this.state.message);
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
                                    <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                        <Input
                                            type="hidden"
                                            name="roleValid"
                                            id="roleValid"
                                        />
                                        <Input
                                            type="hidden"
                                            name="needPhoneValidation"
                                            id="needPhoneValidation"
                                            value={(this.state.user.phoneNumber === '' ? false : true)}
                                        />

                                        < FormGroup >
                                            <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text" name="summary" id="summary" readOnly={true}
                                                bsSize="sm"
                                                valid={!errors.summary && this.state.user.summary != ''}
                                                invalid={touched.summary && !!errors.summary}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.user.summary}
                                                required>
                                            </Input>
                                            <FormFeedback className="red">{errors.summary}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="realm">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="select" name="realm" id="realm"
                                                bsSize="sm"
                                                valid={!errors.realm && this.state.user.realm != ''}
                                                invalid={touched.realm && !!errors.realm}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.realmId}
                                                required>
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {realmList}
                                            </Input>
                                            <FormFeedback className="red">{errors.realm}</FormFeedback>
                                        </FormGroup>
                                        < FormGroup >
                                            <Label for="name">{i18n.t('static.user.username')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text" name="name" id="name" autoComplete="nope"
                                                bsSize="sm"
                                                valid={!errors.name && this.state.user.name != ''}
                                                invalid={touched.name && !!errors.name}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.user.name}
                                                required />
                                            <FormFeedback className="red">{errors.name}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="emailId">{i18n.t('static.user.emailid')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text" name="emailId" id="emailId"
                                                bsSize="sm"
                                                valid={!errors.emailId && this.state.user.emailId != ''}
                                                invalid={touched.emailId && !!errors.emailId}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.user.emailId}
                                                required />
                                            <FormFeedback className="red">{errors.emailId}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="phoneNumber">{i18n.t('static.user.phoneNumber')}</Label>
                                            <Input type="text" name="phoneNumber" id="phoneNumber" autoComplete="nope"
                                                bsSize="sm"
                                                valid={!errors.phoneNumber && this.state.user.phoneNumber != ''}
                                                invalid={touched.phoneNumber && !!errors.phoneNumber}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.user.phoneNumber}
                                                required
                                            />
                                            <FormFeedback className="red">{errors.phoneNumber}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup className="Selectcontrol-bdrNone">
                                            <Label for="role">{i18n.t('static.role.role')}<span class="red Reqasterisk">*</span></Label>
                                            <Select
                                                className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                    { 'is-valid': !errors.role && this.state.user.role.length != 0 },
                                                    { 'is-invalid': (touched.role && !!errors.role) }
                                                )}
                                                name="role" id="role"
                                                bsSize="sm"
                                                onChange={(e) => { handleChange(e); setFieldValue("role", e); this.roleChange(e); }}
                                                onBlur={() => setFieldTouched("role", true)}
                                                multi
                                                required
                                                min={1}
                                                options={this.state.roleList}
                                                value={this.state.roleId}
                                                error={errors.role}
                                                touched={touched.role}
                                            />
                                            <FormFeedback className="red">{errors.role}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="language">{i18n.t('static.language.language')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="select" name="language" id="language"
                                                bsSize="sm"
                                                valid={!errors.language && this.state.user.language != ''}
                                                invalid={touched.language && !!errors.language}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.languageId}
                                                required>
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {languageList}
                                            </Input>
                                            <FormFeedback className="red">{errors.language}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                            <Input type="textarea" name="notes" id="notes"
                                                bsSize="sm"
                                                valid={!errors.notes && this.state.user.notes != ''}
                                                invalid={touched.notes && !!errors.notes}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.user.notes}
                                            // required 
                                            />
                                            <FormFeedback className="red">{errors.notes}</FormFeedback>
                                        </FormGroup>
                                        <ModalFooter className="pb-0 pr-0">
                                            <Button type="button" size="md" color="info" className=" mr-1" onClick={this.props.toggleMain}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                            <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                            <Button type="submit" size="md" color="success" className=" mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                        </ModalFooter>
                                        {/* <br></br><br></br>
                                    <div className={this.props.className}>
                                        <p>{i18n.t('static.ticket.drodownvaluenotfound')}</p>
                                    </div> */}
                                    </Form>
                                )} />
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}