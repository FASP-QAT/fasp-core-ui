import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, Tooltip, CardBody, Form, FormGroup, Label, InputGroupAddon, InputGroupText, InputGroup, Input } from 'reactstrap';
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
import i18n from '../../../i18n'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { isSiteOnline } from '../../../CommonComponent/JavascriptCommonFunctions';



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
class ChangePasswordComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            username: "",
loading:false
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.showPopUp = this.showPopUp.bind(this);
    }
    showPopUp() {
        alert("1) "+i18n.t("static.message.newPasswordMinLength")+"\n2) "+i18n.t("static.message.newPasswordPassString")+"\n3) "+i18n.t("static.message.newPasswordSpecialChar")+"\n4) "+i18n.t("static.message.newPasswordNumber")+"\n5) "+i18n.t("static.message.newPasswordUppercase")+"\n6) "+i18n.t("static.message.newPasswordStartAlphabet")+"\n7) "+i18n.t("static.message.newPasswordNotSameAsUsername")+"\n8) "+i18n.t("static.message.newPasswordNotSameAsOldPassword"));
        // confirmAlert({
        //     message: "Anchal&lt;br /&gt;Bhashkar",
        //     buttons: [
        //       {
        //         label: i18n.t('static.common.close')
        //       }
        //     ]
        //   });
    }
    hideFirstComponent() {
//        setTimeout(function () {
  //          document.getElementById('div1').style.display = 'none';
    //    }, 8000);

        // setTimeout(function () {
        //     this.setState({
        //         message:''
        //     },
        //     () => { 
        //         document.getElementById('div1').style.display = 'block';
        //     });
        // }, 8000);

    }

    cancelClicked() {
        // this.props.history.push(`/dashboard/` + 'red/' + i18n.t('static.message.cancelled'))
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled'))
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
    componentDidMount() {
        let username = AuthenticationService.getLoggedInUsername();
        this.setState({ username },
            () => { });
    }
    render() {
        return (
            <div className="animated fadeIn">
                <h5 className="red" id="div1">{i18n.t(this.state.message)}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card className="mt-2">
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.dashboard.changepassword')}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                initialValues={{
                                    oldPassword: "",
                                    newPassword: "",
                                    confirmNewPassword: "",
                                    username: ""
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    if (isSiteOnline()) {
                                        // AuthenticationService.setupAxiosInterceptors();
                                        UserService.changePassword(AuthenticationService.getLoggedInUserId(), values.oldPassword, values.newPassword)
                                            .then(response => {
                                                localStorage.setItem('password', CryptoJS.AES.encrypt((response.data.hashPass).toString(), `${SECRET_KEY}`));
                                                // this.props.history.push(`/ApplicationDashboard/green/` + i18n.t('static.message.user.passwordSuccess'))/
                                                // this.props.history.push(`/ApplicationDashboard/` + '/green/' + i18n.t('static.message.user.passwordSuccess'))
                                                let id = AuthenticationService.displayDashboardBasedOnRole();
                                                this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.message.user.passwordSuccess'))
                                            })
                                            .catch(
                                                error => {
                                                    console.log("error---",error);
                                                    if (error.message === "Network Error") {
                                                        this.setState({ message: error.message }, () => {
                                                            console.log("inside412");
                                                            document.getElementById('div1').style.display = 'block';
                                                            this.hideFirstComponent();
                                                        });
                                                    } else {
                                                        switch (error.response ? error.response.status : "" ){
                                                            case 500:
                                                            case 401:
                                                            case 403:
                                                            case 404:
                                                            case 406:
                                                            case 412:
                                                      //          console.log("error.response.data.messageCode 111 ---", error.response);
                                                                console.log("error.response.data.messageCode ---", error.response.data.messageCode);
                                                                this.setState({ message: error.response.data.messageCode },
                                                                    () => {
                                                                        console.log("inside412->",this.state.message);
                                                                       // document.getElementById('div1').style.display = 'block';
                                                                        this.hideFirstComponent();
                                                                    });

                                                                break;
                                                            default:
                                                                this.setState({ message: 'static.unkownError' },
                                                                    () => {
                                                                        console.log("inside412");
                                                                       //  document.getElementById('div1').style.display = 'block';
                                                                        this.hideFirstComponent();
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
                                                console.log("inside412");
                                                document.getElementById('div1').style.display = 'block';
                                                this.hideFirstComponent();
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
}

export default ChangePasswordComponent;
