import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Container, Button, FormFeedback, InputGroupAddon, InputGroupText, InputGroup, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import AuthenticationService from '../../Common/AuthenticationService.js';
import { Online } from "react-detect-offline";
import UserService from '../../../api/UserService'
import i18n from '../../../i18n'
import InnerBgImg from '../../../../src/assets/img/bg-image/bg-login.jpg';
import image1 from '../../../assets/img/QAT-login-logo.png';
import { hideFirstComponent, isSiteOnline } from '../../../CommonComponent/JavascriptCommonFunctions';
import { API_URL } from '../../../Constants';
/**
 * Defines the validation schema for reset password details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        newPassword: Yup.string()
            .min(6, i18n.t('static.message.newPasswordMinLength'))
            .matches(/^(?!.*password).*$/, i18n.t('static.message.newPasswordPassString'))
            .matches(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/, i18n.t('static.message.newPasswordSpecialChar'))
            .matches(/^(?=.*\d).*$/, i18n.t('static.message.newPasswordNumber'))
            .matches(/^(?=.*[A-Z]).*$/, i18n.t('static.message.newPasswordUppercase'))
            .matches(/^[a-zA-Z]/i, i18n.t('static.message.newPasswordStartAlphabet'))
            .test('username', i18n.t('static.message.newPasswordNotSameAsUsername'),
                function (value) {
                    if ((values.username != value)) {
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
 * Component for reseting the password.
 */
class ResetPasswordComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            emailId: this.props.match.params.emailId,
            token: this.props.match.params.token,
            display: 1,
            buttonClicked: false
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.showPopUp = this.showPopUp.bind(this);
    }
    /**
     * Show password info popup
     */
    showPopUp() {
        alert("1) " + i18n.t("static.message.newPasswordMinLength") + "\n2) " + i18n.t("static.message.newPasswordPassString") + "\n3) " + i18n.t("static.message.newPasswordSpecialChar") + "\n4) " + i18n.t("static.message.newPasswordNumber") + "\n5) " + i18n.t("static.message.newPasswordUppercase") + "\n6) " + i18n.t("static.message.newPasswordStartAlphabet") + "\n7) " + i18n.t("static.message.newPasswordNotSameAsUsername") + "\n8) " + i18n.t("static.message.newPasswordNotSameAsOldPassword"));
    }
    /**
     * Redirects to the login screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/login/` + i18n.t('static.message.cancelled'))
    }
    /**
     * Calls confirmForgotPasswordToken to verify the token
     */
    componentDidMount() {
        hideFirstComponent();
        UserService.confirmForgotPasswordToken(this.state.emailId, this.state.token)
            .then(response => {
                this.setState({
                    message: response.data.messageCode
                })
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                        });
                    } else {
                        switch (error.response.status) {
                            case 500:
                            case 401:
                            case 403:
                                this.setState({ display: 0 })
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
    /**
     * Renders the reset password form.
     * @returns {JSX.Element} - Reset password form.
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
                            <Col md="9" lg="7" xl="6" className="ForgotmarginTop">
                                <h4 style={{ color: "#BA0C2F", fontSize: "18px" }} id="div1" className="mx-4 text-center">{i18n.t(this.state.message)}</h4>
                                {this.state.display == 1 && <Card className="mx-4">
                                    <CardHeader>
                                        <i className="fa fa-pencil-square-o frgtpass-heading"></i><strong className="frgtpass-heading">{i18n.t('static.user.resetPassword')}</strong>{' '}
                                    </CardHeader>
                                    <Formik
                                        initialValues={{
                                            newPassword: "",
                                            confirmNewPassword: "",
                                            username: this.state.username
                                        }}
                                        validationSchema={validationSchema}
                                        onSubmit={(values, { setSubmitting, setErrors }) => {
                                            if (isSiteOnline()) {
                                                if (!this.state.buttonClicked) {
                                                    UserService.updatePassword(this.state.emailId, this.state.token, values.newPassword)
                                                        .then(response => {
                                                            if (response.status == 200) {
                                                                this.setState({
                                                                    buttonClicked: true
                                                                });
                                                                this.props.history.push(`/login/static.message.user.passwordSuccess`)
                                                            } else {
                                                                this.setState({
                                                                    message: response.data.message
                                                                });
                                                                document.getElementById('div1').style.display = 'block';
                                                                hideFirstComponent();
                                                            }
                                                        })
                                                        .catch(
                                                            error => {
                                                                this.setState({
                                                                    buttonClicked: false
                                                                });
                                                                if (error.message === "Network Error") {
                                                                    this.setState({
                                                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                                                    });
                                                                    document.getElementById('div1').style.display = 'block';
                                                                    hideFirstComponent();
                                                                } else {
                                                                    switch (error.response ? error.response.status : "") {
                                                                        case 404:
                                                                            this.props.history.push(`/login/${error.response.data.messageCode}`)
                                                                            break;
                                                                        case 500:
                                                                        case 401:
                                                                        case 403:
                                                                        case 406:
                                                                        case 412:
                                                                            this.setState({ message: error.response.data.messageCode },
                                                                                () => {
                                                                                    document.getElementById('div1').style.display = 'block';
                                                                                    hideFirstComponent();
                                                                                });
                                                                            break;
                                                                        case 403:
                                                                        default:
                                                                            this.setState({ message: 'static.unkownError' });
                                                                            document.getElementById('div1').style.display = 'block';
                                                                            hideFirstComponent();
                                                                            break;
                                                                    }
                                                                }
                                                            }
                                                        );
                                                }
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
                                                            value={this.state.username}
                                                            hidden
                                                        />
                                                        <FormGroup>
                                                            <Label for="newPassword">{i18n.t('static.user.newPasswordLabel')}</Label>
                                                            <InputGroup>
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
                                                                <InputGroupAddon addonType="append">
                                                                    <InputGroupText><i class="fa fa-info-circle icons" aria-hidden="true" data-toggle="tooltip" data-html="true" data-placement="bottom" onClick={this.showPopUp} title=""></i></InputGroupText>
                                                                </InputGroupAddon>
                                                                <FormFeedback>{errors.newPassword}</FormFeedback>
                                                            </InputGroup>
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
                                                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                            <Button type="submit" size="md" color="success" className="float-right mr-1" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                            &nbsp;
                                                        </FormGroup>
                                                    </CardFooter>
                                                </Form>
                                            )} />
                                </Card>}
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        );
    }
}
export default ResetPasswordComponent;
