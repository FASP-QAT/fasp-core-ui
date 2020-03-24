import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../../Forms/ValidationForms/ValidationForms.css'

import UserService from '../../../api/UserService.js';
import AuthenticationService from '../../Common/AuthenticationService.js';

const initialValues = {
    username: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        username: Yup.string()
            .required('Please enter username')
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
class ForgotPasswordComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: ''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    cancelClicked() {
        this.props.history.push(`/login/` + "Action Canceled")
    }

    touchAll(setTouched, errors) {
        setTouched({
            username: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('forgotPasswordForm', (fieldName) => {
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
            <div className="animated fadeIn">
                <h5>{this.state.message}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>Forgot Password</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    if (navigator.onLine) {
                                        console.log(values.username);
                                        UserService.forgotPassword(values.username)
                                            .then(response => {
                                                console.log(response)
                                                this.props.history.push(`/login/${response.statusText}`)
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
                                                                console.log("Error code unkown");
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
                                            <Form onSubmit={handleSubmit} noValidate name='forgotPasswordForm'>
                                                <CardBody>

                                                    <FormGroup>
                                                        <Label for="username">Username</Label>
                                                        <Input type="text"
                                                            name="username"
                                                            id="username"
                                                            bsSize="sm"
                                                            valid={!errors.username}
                                                            invalid={touched.username && !!errors.username}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            required
                                                        />
                                                        <FormFeedback>{errors.username}</FormFeedback>
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
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ForgotPasswordComponent;
