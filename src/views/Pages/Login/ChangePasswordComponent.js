import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
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



const validationSchema = function (values) {
    return Yup.object().shape({
        oldPassword: Yup.string()
            .required('Please enter old password'),
        newPassword: Yup.string()
            .min(6, `Password has to be at least 6 characters`)
            .matches(/^(?!.*password).*$/, 'Password should not contain password string')
            .matches(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/, 'Password must contain atleast 1 special character')
            .matches(/^(?=.*\d).*$/, 'Password must contain atleast 1 number')
            .matches(/^(?=.*[A-Z]).*$/, 'Password must contain atleast 1 uppercase alphabet')
            .matches(/^[a-zA-Z]/i, 'Password must start with alphabet')
            .test('username', "New password should not be same as username ",
                function (value) {
                    if ((values.username != value)) {
                        return true;
                    }
                })
            .test('oldPassword', "New password should not be same as old password ",
                function (value) {
                    if (values.oldPassword != value) {
                        return true;
                    }
                })
            .required('Please enter new password'),
        confirmNewPassword: Yup.string()
            .oneOf([values.newPassword], 'Passwords must match')
            .required('Please confirm new password')
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
            username: ""
        }
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    cancelClicked() {
        this.props.history.push(`/dashboard/Action Canceled`)
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
            () => {  });
    }
    render() {
        return (
            <div className="animated fadeIn">
                <h5>{this.state.message}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.dashboard.changepassword')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={{
                                    oldPassword: "",
                                    newPassword: "",
                                    confirmNewPassword: "",
                                    username: ""
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    if (navigator.onLine) {
                                        AuthenticationService.setupAxiosInterceptors();
                                        UserService.changePassword(AuthenticationService.getLoggedInUserId(), values.oldPassword, values.newPassword)
                                            .then(response => {
                                                localStorage.setItem('password', CryptoJS.AES.encrypt((response.data.hashPass).toString(), `${SECRET_KEY}`));
                                                this.props.history.push(`/dashboard`)
                                            })
                                            .catch(
                                                error => {
                                                    if (error.message === "Network Error") {
                                                        this.setState({ message: error.message });
                                                    } else {
                                                        switch (error.response.status) {
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
                                            message: "You must be online to update the password."
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
                                                        <Label for="oldPassword">Old Password</Label>
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
                                                        <Label for="newPassword">New Password</Label>
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
                                                        <Label for="confirmNewPassword">Confirm New Password</Label>
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
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> Cancel</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>Submit</Button>
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