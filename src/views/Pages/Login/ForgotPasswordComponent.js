import React, { Component, Suspense } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, Container } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../../Forms/ValidationForms/ValidationForms.css';
import {
    AppFooter,
    AppSidebarFooter,
} from '@coreui/react';

import UserService from '../../../api/UserService.js';
import AuthenticationService from '../../Common/AuthenticationService.js';
const DefaultFooter = React.lazy(() => import('../../../containers/DefaultLayout/DefaultFooter'));

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
    loading = () => <div className="animated fadeIn pt-1 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;
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
            <div className="app flex-row align-items-center">
                <div className="Login-component">
                <Container className="container-login">
                    <Row className="justify-content-center ">
                    <Col md="12">
                        <div className="upper-logo mt-1">
                         <img src={'assets/img/QAT-logo.png'} className="img-fluid " />
                      </div>
                    </Col>
                        <Col md="9" lg="7" xl="6" className="mt-4">
                            <h5 className="mx-4">{this.state.message}</h5>
                            <Card className="mx-4 ">

                                <CardHeader>
                                    <i className="icon-note frgtpass-heading"></i><strong className="frgtpass-heading">Forgot Password</strong>{' '}
                                </CardHeader>
                                <Formik
                                    initialValues={initialValues}
                                    validate={validate(validationSchema)}
                                    onSubmit={(values, { setSubmitting, setErrors }) => {
                                        if (navigator.onLine) {
                                            UserService.forgotPassword(values.username)
                                                .then(response => {
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
                                                    <CardBody className="p-4">

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
                    <AppFooter className="footer-fwp">
                    <Suspense fallback={this.loading()}>
                        <DefaultFooter />
                    </Suspense>
                </AppFooter>
                </Container>
               </div>
            </div>
            
        );
    }
}

export default ForgotPasswordComponent;
