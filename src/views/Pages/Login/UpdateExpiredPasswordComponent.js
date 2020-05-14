import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, Container, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../../Forms/ValidationForms/ValidationForms.css'

import CryptoJS from 'crypto-js'
import AuthenticationService from '../../Common/AuthenticationService.js';
import { Online } from "react-detect-offline";
import bcrypt from 'bcryptjs';
import jwt_decode from 'jwt-decode'
import { SECRET_KEY } from '../../../Constants.js'
import UserService from '../../../api/UserService'
import moment from 'moment';
import i18n from '../../../i18n'
import InnerBgImg from '../../../../src/assets/img/bg-image/bg-login.jpg';
import image1 from '../../../assets/img/QAT-logo.png';



const validationSchema = function (values) {
    return Yup.object().shape({
        oldPassword: Yup.string()
            .required(i18n.t('static.message.oldPassword')),
        newPassword: Yup.string()
            .min(6, i18n.t('static.message.newPasswordMinLength'))
            .matches(/^(?!.*password).*$/, i18n.t('static.message.newPasswordPassString'))
            .matches(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/, i18n.t('static.message.newPasswordSpecialChar'))
            .matches(/^(?=.*\d).*$/, i18n.t('static.message.newPasswordNumber'))
            .matches(/^(?=.*[A-Z]).*$/, i18n.t('static.message.newPasswordUppercase'))
            .matches(/^[a-zA-Z]/i,  i18n.t('static.message.newPasswordStartAlphabet'))
            .test('username',i18n.t('static.message.newPasswordNotSameAsUsername'),
                function (value) {
                    if ((values.username != value)) {
                        return true;
                    }
                })
            .test('oldPassword',i18n.t('static.message.newPasswordNotSameAsOldPassword'),
                function (value) {
                    if (values.oldPassword != value) {
                        return true;
                    }
                })
            .required(i18n.t('static.message.newPasswordRequired')),
        confirmNewPassword: Yup.string()
            .oneOf([values.newPassword], i18n.t('static.message.confirmPassword'))
            .required(i18n.t('static.message.confirmPasswordRequired'))
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
class UpdateExpiredPasswordComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            username: this.props.location.state.username
        }
        this.logoutClicked = this.logoutClicked.bind(this);
    }

    logoutClicked() {
        this.props.history.push(`/login/`+ i18n.t('static.logoutSuccess'))
    }

    touchAll(setTouched, errors) {
        setTouched({
            oldPassword: true,
            newPassword: true,
            confirmNewPassword: true,
            username: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('updatePasswordForm', (fieldName) => {
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

    render() {
        return (
            <div className="app flex-row align-items-center">
                <div className="Login-component" style={{ backgroundImage: "url(" + InnerBgImg +")" }}>
                    <Container className="container-login">
                        <Row className="justify-content-center">
                            <Col md="12">
                                <div className="upper-logo mt-1">
                                    <img src={image1} className="img-fluid " />
                                </div>
                            </Col>
                            <Col md="9" lg="7" xl="6 " className="mt-4">
                                <h5 className="mx-4">{this.state.message}</h5>
                                <Card className="mx-4">
                                    <CardHeader>
                                        <i className="icon-note frgtpass-heading"></i><strong className="frgtpass-heading">{i18n.t('static.user.updateExpiredPassword')}</strong>{' '}
                                    </CardHeader>
                                    <Formik
                                        initialValues={{
                                            oldPassword: "",
                                            newPassword: "",
                                            confirmNewPassword: "",
                                            username: this.state.username
                                        }}
                                        validate={validate(validationSchema)}
                                        onSubmit={(values, { setSubmitting, setErrors }) => {
                                            if (navigator.onLine) {
                                                UserService.updateExpiredPassword(values.username, values.oldPassword, values.newPassword)
                                                    .then(response => {
                                                        var decoded = jwt_decode(response.data.token);
                                                        let keysToRemove = ["token-" + decoded.userId, "user-" + decoded.userId, "curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken"];
                                                        keysToRemove.forEach(k => localStorage.removeItem(k))

                                                        localStorage.setItem('token-' + decoded.userId, CryptoJS.AES.encrypt((response.data.token).toString(), `${SECRET_KEY}`));
                                                        localStorage.setItem('user-' + decoded.userId, CryptoJS.AES.encrypt(JSON.stringify(decoded.user), `${SECRET_KEY}`));
                                                        localStorage.setItem('typeOfSession', "Online");
                                                        localStorage.setItem('lastActionTaken', CryptoJS.AES.encrypt((moment(new Date()).format("YYYY-MM-DD HH:mm:ss")).toString(), `${SECRET_KEY}`));
                                                        localStorage.setItem('curUser', CryptoJS.AES.encrypt((decoded.userId).toString(), `${SECRET_KEY}`));
                                                        localStorage.setItem('lang', decoded.user.language.languageCode);
                                                        this.props.history.push(`/masterDataSync/static.message.user.passwordSuccess`)
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

                                            } else {
                                                this.setState({
                                                    message: 'static.common.onlinepasswordtext'
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
                                                setTouched
                                            }) => (
                                                    <Form onSubmit={handleSubmit} noValidate name='updatePasswordForm'>
                                                        <CardBody>
                                                            <Input type="text"
                                                                name="username"
                                                                id="username"
                                                                onChange={handleChange}
                                                                hidden
                                                            />
                                                            <FormGroup>
                                                                <Label for="oldPassword">{i18n.t('static.user.oldPasswordLabel')}</Label>
                                                                <Input type="password"
                                                                    name="oldPassword"
                                                                    id="oldPassword"
                                                                    bsSize="sm"
                                                                    valid={!errors.oldPassword}
                                                                    invalid={touched.oldPassword && !!errors.oldPassword}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    required
                                                                />
                                                                <FormFeedback>{errors.oldPassword}</FormFeedback>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label for="newPassword">{i18n.t('static.user.newPasswordLabel')}</Label>
                                                                <Input type="password"
                                                                    name="newPassword"
                                                                    id="newPassword"
                                                                    bsSize="sm"
                                                                    valid={!errors.newPassword}
                                                                    invalid={touched.newPassword && !!errors.newPassword}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    required
                                                                />
                                                                <FormFeedback>{errors.newPassword}</FormFeedback>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label for="confirmNewPassword">{i18n.t('static.user.confirmNewPasswordLabel')}</Label>
                                                                <Input type="password"
                                                                    name="confirmNewPassword"
                                                                    id="confirmNewPassword"
                                                                    bsSize="sm"
                                                                    valid={!errors.confirmNewPassword}
                                                                    invalid={touched.confirmNewPassword && !!errors.confirmNewPassword}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    required
                                                                />
                                                                <FormFeedback>{errors.confirmNewPassword}</FormFeedback>
                                                            </FormGroup>
                                                        </CardBody>
                                                        <CardFooter>
                                                            <FormGroup>
                                                                <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.logoutClicked}><i className="fa fa-times"></i>{i18n.t('static.common.logout')}</Button>
                                                                <Button type="submit" size="sm" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                                &nbsp;
                          </FormGroup>
                                                        </CardFooter>
                                                    </Form>
                                                )} />
                                </Card>
                            </Col>
                        </Row>

                    </Container>
                </div>
            </div>
        );
    }
}

export default UpdateExpiredPasswordComponent;