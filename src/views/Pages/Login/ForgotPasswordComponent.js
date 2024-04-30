import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Container, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import i18n from '../../../i18n';
import InnerBgImg from '../../../../src/assets/img/bg-image/bg-login.jpg';
import image1 from '../../../assets/img/QAT-login-logo.png';
import { isSiteOnline } from '../../../CommonComponent/JavascriptCommonFunctions';
import { API_URL } from '../../../Constants';
import UserService from '../../../api/UserService.js';
// Initial values for form fields
const initialValues = {
    emailId: ""
}
/**
 * Defines the validation schema for forgot password.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        emailId: Yup.string()
            .email(i18n.t('static.user.invalidemail'))
            .required(i18n.t('static.user.validemail')),
    })
}
/**
 * Component for forgot password.
 */
class ForgotPasswordComponent extends Component {
    /**
     * Displays a loading indicator while data is being loaded.
     */
    loading = () => <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;
    constructor(props) {
        super(props);
        this.state = {
            message: '', loading: false
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideMessage = this.hideMessage.bind(this);
    }
    /**
     * Redirects to the login screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/login/` + i18n.t('static.actionCancelled'))
    }
    /**
     * Hides message after 30 seconds.
     */
    hideMessage() {
        setTimeout(function () { document.getElementById('hideDiv').style.display = 'none'; }, 30000);
    }
    /**
     * Renders the Forgot password form.
     * @returns {JSX.Element} - Forgot Password form.
     */
    render() {
        return (
            <div className="app flex-row align-items-center">
                <div className="Login-component" style={{ backgroundImage: "url(" + InnerBgImg + ")" }}>
                    <Container className="container-login">
                        <Row className="justify-content-center ">
                            <Col md="12">
                                <div className="upper-logo mt-1">
                                    <img src={image1} className="img-fluid " />
                                </div>
                            </Col>
                            <Col md="9" lg="7" xl="6" className="ForgotmarginTop">
                                <h5 style={{ color: "#BA0C2F" }} className="mx-4" id="hideDiv">{i18n.t(this.state.message)}</h5>
                                <Card className="mx-4 " style={{ display: this.state.loading ? "none" : "block" }}>
                                    <CardHeader>
                                        <i className="fa fa-pencil-square-o frgtpass-heading"></i><strong className="frgtpass-heading">{i18n.t('static.user.forgotpassword')}</strong>{' '}
                                    </CardHeader>
                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={(values, { setSubmitting, setErrors }) => {
                                            if (isSiteOnline()) {
                                                UserService.forgotPassword(values.emailId)
                                                    .then(response => {
                                                        if (response.status == 200) {
                                                            this.props.history.push(`/login/static.message.user.forgotPasswordSuccess`)
                                                        } else {
                                                            this.setState({
                                                                message: response.data.message
                                                            })
                                                        }
                                                    })
                                                    .catch(
                                                        error => {
                                                            if (error.message === "Network Error") {
                                                                this.setState({
                                                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                                                });
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
                                                                        this.setState({
                                                                            message: error.response.data.messageCode,
                                                                            loading: false
                                                                        });
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
                                                    message: "You must be online to update the password."
                                                },
                                                    () => {
                                                        this.hideMessage();
                                                    })
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
                                                <Form onSubmit={handleSubmit} noValidate name='forgotPasswordForm'>
                                                    <CardBody className="p-4">
                                                        <FormGroup>
                                                            <Label for="emailId">{i18n.t('static.user.emailid')}</Label>
                                                            <Input type="text"
                                                                name="emailId"
                                                                id="emailId"
                                                                bsSize="sm"
                                                                valid={!errors.emailId}
                                                                invalid={touched.emailId && !!errors.emailId}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                required
                                                            />
                                                            <FormFeedback>{errors.emailId}</FormFeedback>
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
                                </Card>
                                <div style={{ display: this.state.loading ? "block" : "none" }}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                        <div class="align-items-center">
                                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                            <div class="spinner-border blue ml-4" role="status">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        );
    }
}
export default ForgotPasswordComponent;