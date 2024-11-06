import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Container, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import CryptoJS from 'crypto-js';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import InnerBgImg from '../../../../src/assets/img/bg-image/bg-login.jpg';
import { hideFirstComponent, isSiteOnline } from '../../../CommonComponent/JavascriptCommonFunctions';
import { API_URL, SECRET_KEY } from '../../../Constants.js';
import UserService from '../../../api/UserService';
import image1 from '../../../assets/img/QAT-login-logo.png';
import i18n from '../../../i18n';
/**
 * Defines the validation schema for update expired password.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
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
            .matches(/^[a-zA-Z]/i, i18n.t('static.message.newPasswordStartAlphabet'))
            .test('emailId', i18n.t('static.message.newPasswordNotSameAsUsername'),
                function (value) {
                    if ((values.emailId != value)) {
                        return true;
                    }
                })
            .test('oldPassword', i18n.t('static.message.newPasswordNotSameAsOldPassword'),
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
/**
 * Component for updating expired password.
 */
class UpdateExpiredPasswordComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            emailId: this.props.location.state.emailId
        }
        this.logoutClicked = this.logoutClicked.bind(this);
    }
    /**
     * Redirects to login page on logout clicked
     */
    logoutClicked() {
        this.props.history.push(`/login/` + i18n.t('static.logoutSuccess'))
    }
    /**
     * Renders the update expired password form.
     * @returns {JSX.Element} - Update Expired password form.
     */
    render() {
        return (
            <div className="app flex-row align-items-center">
                <div className="Login-component" style={{ backgroundImage: "url(" + InnerBgImg + ")" }}>
                    <Container className="container-login">
                        <Row className="justify-content-center">
                            <Col md="12">
                                <div className="upper-logo mt-1">
                                    <img src={image1} className="img-fluid " />
                                </div>
                            </Col>
                            <Col md="9" lg="7" xl="6 " className="ForgotmarginTop">
                                <h5 className="red" id="div1" className="mx-4">{i18n.t(this.state.message)}</h5>
                                <Card className="mx-4">
                                    <CardHeader>
                                        <i className="fa fa-pencil-square-o frgtpass-heading"></i><strong className="frgtpass-heading">{i18n.t('static.user.updateExpiredPassword')}</strong>{' '}
                                    </CardHeader>
                                    <Formik
                                        initialValues={{
                                            oldPassword: "",
                                            newPassword: "",
                                            confirmNewPassword: "",
                                            emailId: this.state.emailId
                                        }}
                                        validationSchema={validationSchema}
                                        onSubmit={(values, { setSubmitting, setErrors }) => {
                                            if (isSiteOnline()) {
                                                UserService.updateExpiredPassword(this.props.location.state.emailId, values.oldPassword, values.newPassword)
                                                    .then(response => {
                                                        var decoded = jwt_decode(response.data.token);
                                                        let keysToRemove = ["token-" + decoded.userId, "user-" + decoded.userId, "curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken", "lastLoggedInUsersLanguage", "sessionType"];
                                                        keysToRemove.forEach(k => localStorage.removeItem(k))
                                                        decoded.user.syncExpiresOn = moment().format("YYYY-MM-DD HH:mm:ss");
                                                        localStorage.setItem('token-' + decoded.userId, CryptoJS.AES.encrypt((response.data.token).toString(), `${SECRET_KEY}`));
                                                        localStorage.setItem("tokenSetTime", new Date());
                                                        localStorage.setItem('typeOfSession', "Online");
                                                        localStorage.setItem('sessionType', "Online");
                                                        localStorage.setItem('lastActionTaken', CryptoJS.AES.encrypt((moment(new Date()).format("YYYY-MM-DD HH:mm:ss")).toString(), `${SECRET_KEY}`));
                                                        localStorage.setItem('curUser', CryptoJS.AES.encrypt((decoded.userId).toString(), `${SECRET_KEY}`));
                                                        localStorage.setItem('lang', decoded.user.language.languageCode);
                                                        document.documentElement.setAttribute("data-theme", decoded.user.defaultThemeId==1?'light':'dark');
                                                        localStorage.setItem('theme', decoded.user.defaultThemeId==1?'light':'dark');
                                                        localStorage.setItem('showDecimals', decoded.user.showDecimals.toString()=="true"?false:true);
                                                        sessionStorage.setItem('defaultModuleId', decoded.user.defaultModuleId.toString()=="1"?1:2);
                                                        localStorage.setItem('i18nextLng', decoded.user.language.languageCode);
                                                        localStorage.setItem('lastLoggedInUsersLanguage', decoded.user.language.languageCode);
                                                        i18n.changeLanguage(decoded.user.language.languageCode);
                                                        this.props.history.push(`/masterDataSync/`)
                                                    })
                                                    .catch(
                                                        error => {
                                                            if (error.message === "Network Error") {
                                                                this.setState({
                                                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                                                }, () => {
                                                                    document.getElementById('div1').style.display = 'block';
                                                                    hideFirstComponent();
                                                                });
                                                            } else {
                                                                switch (error.response ? error.response.status : "") {
                                                                    case 500:
                                                                    case 401:
                                                                    case 403:
                                                                    case 404:
                                                                    case 406:
                                                                    case 412:
                                                                        this.setState({ message: error.response.data.messageCode },
                                                                            () => {
                                                                                document.getElementById('div1').style.display = 'block';
                                                                                hideFirstComponent();
                                                                            });
                                                                        break;
                                                                    default:
                                                                        this.setState({ message: 'static.unkownError' },
                                                                            () => {
                                                                                document.getElementById('div1').style.display = 'block';
                                                                                hideFirstComponent();
                                                                            });
                                                                        break;
                                                                }
                                                            }
                                                        }
                                                    );
                                            } else {
                                                this.setState({ message: 'static.common.onlinepasswordtext' },
                                                    () => {
                                                        document.getElementById('div1').style.display = 'block';
                                                        hideFirstComponent();
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
                                                            name="emailId"
                                                            id="emailId"
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
                                                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.logoutClicked}><i className="fa fa-times"></i>{i18n.t('static.common.logout')}</Button>
                                                            <Button type="submit" size="md" color="success" className="float-right mr-1" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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