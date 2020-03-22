import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input,InputGroupAddon,InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import UserService from "../../api/UserService";
import RealmService from "../../api/RealmService";
import LanguageService from "../../api/LanguageService";
import AuthenticationService from '../common/AuthenticationService.js';

const initialValues = {
    username: "",
    realmId: [],
    emailId: "",
    phoneNumber: "",
    languageId: []
}

const validationSchema = function (values) {
    return Yup.object().shape({
        username: Yup.string()
            .min(6, `Username has to be at least 6 characters`)
            .max(30, `Password could be max 30 characters`)
            .matches(/^(?=.*[a-zA-Z]).*$/, 'Username must contain atleast 1 alphabet')
            .matches(/^\S*$/, 'Username should not contain spaces')
            .required('Please enter username'),
        roleId: Yup.string()
            .required('Please select role'),
        languageId: Yup.string()
            .required('Please select language'),
        emailId: Yup.string()
            .email('Invalid email address')
            .required('Please enter email id'),
        phoneNumber: Yup.string()
            .min(4, `Phone number has to be at least 6 characters`)
            .max(15, `Phone number could be max 15 characters`)
            .matches(/^[0-9]*$/, 'Only numbers allowed')
            .required('Please enter phone number.')
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
class EditUserComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            languages: [],
            roles: [],
            user: this.props.location.state.user,
            message: ''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
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
            phoneNumber: true,
            roles: true,
            languageId: true
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
                    realms: response.data.data
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
                this.setState({
                    roles: response.data
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );
    }

    render() {
        const { roles } = this.state;
        const { realms } = this.state;
        const { languages } = this.state;

        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);
        let roleList = roles.length > 0
            && roles.map((item, i) => {
                return (
                    <option key={i} value={item.roleId}>
                        {item.label.label_en}
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
                <h5>{i18n.t(this.state.message)}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.user.useredittext')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={{
                                    username: this.state.user.username,
                                    realmId: this.state.user.realm.realmId,
                                    emailId: this.state.user.emailId,
                                    phoneNumber: this.state.user.phoneNumber,
                                    roles: this.state.user.roles,
                                    languageId: this.state.user.language.languageId
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    UserService.editUser(this.state.user)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/user/listUser/${response.data.messageCode}`)
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
                                                            console.log("Error code unkown");
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
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.realm.realmname')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-pencil"></i></InputGroupText>
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
                                                        </InputGroupAddon>
                                                        <FormFeedback>{errors.realmId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="username">{i18n.t('static.user.username')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-pencil"></i></InputGroupText>
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
                                                        />
                                                         </InputGroupAddon>
                                                        <FormFeedback>{errors.username}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="emailId">{i18n.t('static.common.emailid')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-envelope-o"></i></InputGroupText>
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
                                                         </InputGroupAddon>
                                                        <FormFeedback>{errors.emailId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="phoneNumber">{i18n.t('static.common.phoneNumber')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-phone"></i></InputGroupText>
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
                                                        />
                                                         </InputGroupAddon>
                                                        <FormFeedback>{errors.phoneNumber}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="roleId">{i18n.t('static.role.rolename')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-pencil"></i></InputGroupText>
                                                        <Input
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
                                                        </Input>
                                                        </InputGroupAddon>
                                                        <FormFeedback>{errors.roleId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="languageId">{i18n.t('static.language.language')}</Label>

                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-language"></i></InputGroupText>
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
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {languageList}
                                                        </Input>
                                                        </InputGroupAddon>
                                                        <FormFeedback>{errors.languageId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label>{i18n.t('static.common.status')}</Label>
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
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>

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
        this.props.history.push(`/user/listUser/` + "static.actionCancelled")
    }
}

export default EditUserComponent;
