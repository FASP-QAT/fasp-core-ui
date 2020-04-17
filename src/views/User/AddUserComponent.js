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

const initialValues = {
    username: "",
    realmId: [],
    emailId: "",
    phoneNumber: "",
    languageId: [],
    roleId: []
}
const entityname = i18n.t('static.user.user')
const validationSchema = function (values) {
    return Yup.object().shape({

        username: Yup.string()
            .min(6, i18n.t('static.user.valid6char'))
            .max(30, i18n.t('static.user.validpasswordlength'))
            .matches(/^(?=.*[a-zA-Z]).*$/, i18n.t('static.user.alleast1alpha'))
            .matches(/^\S*$/, i18n.t('static.user.nospace'))
            .required(i18n.t('static.user.validusername')),
        showRealm: Yup.boolean(),
        realmId: Yup.string()
            .when("showRealm", (showRealm, schema) => {
                if (document.getElementById("showRealm").value == "true") {
                    return schema.required(i18n.t('static.common.realmtext'))
                } else {
                    return schema;
                }
                return schema;
            }),
        // roleId: Yup.array()
        //     .min(3, 'Pick at least 3 tags')
        //     .of(
        //         Yup.object().shape({
        //             label: Yup.string().required(),
        //             value: Yup.string().required(),
        //         })
        //     ),
        languageId: Yup.string()
            .required(i18n.t('static.user.validlanguage')),
        emailId: Yup.string()
            .email(i18n.t('static.user.invalidemail'))
            .required(i18n.t('static.user.validemail')),
        phoneNumber: Yup.string()
            .min(4, i18n.t('static.user.validphonemindigit'))
            .max(15, i18n.t('static.user.validphonemaxdigit'))
            .matches(/^[0-9]*$/, i18n.t('static.user.validnumber'))
            .required(i18n.t('static.user.validphone'))
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
            lang: localStorage.getItem('lang'),
            realms: [],
            languages: [],
            user: {
                realm: {},
                language: {

                },
                roles: []
            },
            roleId: '',
            roleList: [],
            message: '',
            validateRealm: ''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.roleChange = this.roleChange.bind(this);
    }

    dataChange(event) {
        let { user } = this.state;
        if (event.target.name == "username") {
            user.username = event.target.value;
        }
        if (event.target.name == "emailId") {
            user.emailId = event.target.value;
        }
        if (event.target.name == "phoneNumber") {
            user.phoneNumber = event.target.value;
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
        let { user } = this.state;
        let count = 0;
        this.setState({ roleId });
        var roleIdArray = [];
        for (var i = 0; i < roleId.length; i++) {
            roleIdArray[i] = roleId[i].value;
            if (roleId[i].value != 'ROLE_APPL_ADMIN') {
                count++;
                // showRealm

            }
        }
        console.log("count---" + count);
        if (count > 0) {
            console.log("if");
            document.getElementById("showRealm").value = true;
        } else {
            console.log("else");
            document.getElementById("showRealm").value = false;
        }
        console.log("value---" + document.getElementById("showRealm").value);
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
            phoneNumber: true,
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
        AuthenticationService.setupAxiosInterceptors();
        LanguageService.getLanguageList()
            .then(response => {
                this.setState({
                    languages: response.data
                })
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

        RealmService.getRealmListAll()
            .then(response => {
                this.setState({
                    realms: response.data
                })
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

        UserService.getRoleList()
            .then(response => {
                var roleList = [];
                for (var i = 0; i < response.data.length; i++) {
                    roleList[i] = { value: response.data[i].roleId, label: getLabelText(response.data[i].label, this.state.lang) }
                }
                this.setState({
                    roleList
                })
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );
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
            <div className="animated fadeIn">
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    console.log(JSON.stringify(this.state.user))
                                    UserService.addNewUser(this.state.user)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/user/listUser/` + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                })
                                            }

                                        })
                                        .catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({ message: error.message });
                                                } else {
                                                    switch (error.response ? error.response.status : "") {
                                                        case 500:
                                                        case 401:
                                                        case 404:
                                                        case 406:
                                                        case 412:
                                                            this.setState({ message: error.response.data.messageCode });
                                                            break;
                                                        default:
                                                            this.setState({ message: 'static.unkownError' });
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
                                        setTouched
                                    }) => (
                                            <Form onSubmit={handleSubmit} noValidate name='userForm'>
                                                <CardBody>
                                                    <Input
                                                        type="hidden"
                                                        name="showRealm"
                                                        id="showRealm"
                                                    />
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.realm.realm')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="realmId"
                                                            id="realmId"
                                                            bsSize="sm"
                                                            valid={!errors.realmId}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.user.realm.realmId}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {realmList}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="username">{i18n.t('static.user.username')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="username"
                                                            id="username"
                                                            bsSize="sm"
                                                            valid={!errors.username}
                                                            invalid={touched.username && !!errors.username}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.user.username}
                                                        /><FormFeedback className="red">{errors.username}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="emailId">{i18n.t('static.user.emailid')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="emailId"
                                                            id="emailId"
                                                            bsSize="sm"
                                                            valid={!errors.emailId}
                                                            invalid={touched.emailId && !!errors.emailId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.user.emailId}
                                                        />
                                                        <FormFeedback className="red">{errors.emailId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="phoneNumber">{i18n.t('static.user.phoneNumber')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="phoneNumber"
                                                            id="phoneNumber"
                                                            bsSize="sm"
                                                            valid={!errors.phoneNumber}
                                                            invalid={touched.phoneNumber && !!errors.phoneNumber}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.user.phoneNumber}
                                                        /><FormFeedback className="red">{errors.phoneNumber}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="roleId">{i18n.t('static.role.role')}<span class="red Reqasterisk">*</span></Label>
                                                        <Select
                                                            valid={!errors.roleId}
                                                            bsSize="sm"
                                                            invalid={touched.roleId && !!errors.roleId}
                                                            onChange={(e) => { handleChange(e); this.roleChange(e) }}
                                                            onBlur={handleBlur}
                                                            name="roleId"
                                                            id="roleId"
                                                            multi
                                                            required
                                                            min={1}
                                                            options={this.state.roleList}
                                                            value={this.state.roleId}
                                                            error={errors.roleId}
                                                            touched={touched.roleId}
                                                        />
                                                        {!!this.props.error &&
                                                            this.props.touched && (
                                                                <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
                                                            )}
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
                                                            <option value="" disabled>{i18n.t('static.common.select')}</option>
                                                            {roleList}
                                                        </Input> */}
                                                        {/* <FormFeedback>{errors.roleId}</FormFeedback> */}
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="languageId">{i18n.t('static.language.language')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="languageId"
                                                            id="languageId"
                                                            bsSize="sm"
                                                            valid={!errors.languageId}
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
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
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

        this.props.history.push(`/user/listUser/` + i18n.t('static.message.cancelled', { entityname }))
    }
}

export default AddUserComponent;
