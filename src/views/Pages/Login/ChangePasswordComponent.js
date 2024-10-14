import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import React, { Component } from 'react';
import 'react-confirm-alert/src/react-confirm-alert.css'; 
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, InputGroup, InputGroupAddon, InputGroupText, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import { API_URL, SECRET_KEY } from '../../../Constants.js';
import UserService from '../../../api/UserService';
import i18n from '../../../i18n';
import AuthenticationService from '../../Common/AuthenticationService.js';
import { hideFirstComponent } from '../../../CommonComponent/JavascriptCommonFunctions.js';
/**
 * Defines the validation schema for change password details.
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
            .test('username', i18n.t('static.message.newPasswordNotSameAsUsername'),
                function (value) {
                    if ((values.username != value)) {
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
 * Component for changing the password.
 */
class ChangePasswordComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            username: "",
            loading: false
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
     * Redirects to the application dashboard screen when cancel button is clicked.
     */
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled'))
    }
    /**
     * Gets logged in username on component mount
     */
    componentDidMount() {
        let username = AuthenticationService.getLoggedInUsername();
        this.setState({ username },
            () => { });
    }
    /**
     * Renders the change password form.
     * @returns {JSX.Element} - Change password form.
     */
    render() {
        return (
            <div className="animated fadeIn">
                <h5 className="red" id="div1">{i18n.t(this.state.message)}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card className="mt-2">
                            <Formik
                                initialValues={{
                                    oldPassword: "",
                                    newPassword: "",
                                    confirmNewPassword: "",
                                    username: ""
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    if (localStorage.getItem("sessionType") === 'Online') {
                                        UserService.changePassword(AuthenticationService.getLoggedInUserId(), values.oldPassword, values.newPassword)
                                            .then(response => {
                                                localStorage.setItem('password', CryptoJS.AES.encrypt((response.data.hashPass).toString(), `${SECRET_KEY}`));
                                                let id = AuthenticationService.displayDashboardBasedOnRole();
                                                this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.message.user.passwordSuccess'))
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
                                                            case 409:
                                                                this.setState({
                                                                    message: i18n.t('static.common.accessDenied'),
                                                                    loading: false,
                                                                    color: "#BA0C2F",
                                                                });
                                                                break;
                                                            case 403:
                                                            case 404:
                                                            case 406:
                                                            case 412:
                                                                this.setState({ message: error.response.data.messageCode },
                                                                    () => {
                                                                        hideFirstComponent();
                                                                    });
                                                                break;
                                                            default:
                                                                this.setState({ message: 'static.unkownError' },
                                                                    () => {
                                                                        hideFirstComponent();
                                                                    });
                                                                break;
                                                        }
                                                    }
                                                }
                                            );
                                    } else {
                                        this.setState({
                                            message: 'static.common.onlinepasswordtext'
                                        },
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
                                                    name="username"
                                                    id="username"
                                                    onChange={handleChange}
                                                    value={this.state.username}
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
                                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
}
export default ChangePasswordComponent;
