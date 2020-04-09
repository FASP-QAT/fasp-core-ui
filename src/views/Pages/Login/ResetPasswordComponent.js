import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Container, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
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



const validationSchema = function (values) {
    return Yup.object().shape({
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
class ResetPasswordComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            username: this.props.match.params.username,
            token: this.props.match.params.token
        }
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    cancelClicked() {
        this.props.history.push(`/login/Action Canceled`)
    }

    touchAll(setTouched, errors) {
        setTouched({
            newPassword: true,
            confirmNewPassword: true
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
        UserService.confirmForgotPasswordToken(this.state.username, this.state.token)
            .then(response => {
                this.setState({
                    message: response.data.messageCode
                })
            }).catch(
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

    }
    render() {
        return (
            <div className="app flex-row align-items-center">
                <Container>
                    <Row className="justify-content-center">
                        <Col md="9" lg="7" xl="6">
                            <h5 className="mx-4">{this.state.message}</h5>
                            <Card className="mx-4">
                                <CardHeader>
                                    <i className="icon-note frgtpass-heading"></i><strong className="frgtpass-heading">Reset Password</strong>{' '}
                                </CardHeader>
                                <Formik
                                    initialValues={{
                                        newPassword: "",
                                        confirmNewPassword: "",
                                        username: this.state.username
                                    }}
                                    validate={validate(validationSchema)}
                                    onSubmit={(values, { setSubmitting, setErrors }) => {
                                        if (navigator.onLine) {
                                            UserService.updatePassword(this.state.username, this.state.token, values.newPassword)
                                                .then(response => {
                                                    if (response.status == 200) {
                                                        this.props.history.push(`/login/static.message.user.passwordSuccess`)
                                                    } else {
                                                        this.setState({
                                                            message: response.data.message
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
                                                            <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> Cancel</Button>
                                                            <Button type="submit" size="sm" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>Submit</Button>
                                                            &nbsp;
                          </FormGroup>
                                                    </CardFooter>
                                                </Form>
                                            )} />
                            </Card>>
                            </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default ResetPasswordComponent;
