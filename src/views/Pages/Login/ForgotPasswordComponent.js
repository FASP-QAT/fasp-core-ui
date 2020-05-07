import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, Container } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../../i18n'
import '../../Forms/ValidationForms/ValidationForms.css';
// import image1 from '../../../../public/assets/img/QAT-logo.png';
import InnerBgImg from '../../../../src/assets/img/bg-image/bg-login.jpg';
import image1 from '../../../assets/img/QAT-logo.png';


import UserService from '../../../api/UserService.js';
import AuthenticationService from '../../Common/AuthenticationService.js';

const initialValues = {
    emailId: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        emailId: Yup.string()
            .email(i18n.t('static.user.invalidemail'))
            .required(i18n.t('static.user.validemail')),
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
        this.props.history.push(`/login/` + i18n.t('static.message.cancelled'))
    }

    touchAll(setTouched, errors) {
        setTouched({
            emailId: true
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
                <div className="Login-component" style={{ backgroundImage: "url(" + InnerBgImg +")" }}>
                    <Container className="container-login">
                        <Row className="justify-content-center ">
                            <Col md="12">
                                <div className="upper-logo mt-1">
                                    <img src={image1} className="img-fluid " />
                                </div>
                            </Col>
                            <Col md="9" lg="7" xl="6" className="mt-4">
                                <h5 className="mx-4">{i18n.t(this.state.message)}</h5>
                                <Card className="mx-4 ">

                                    <CardHeader>
                                        <i className="icon-note frgtpass-heading"></i><strong className="frgtpass-heading">{i18n.t('static.user.forgotpassword')}</strong>{' '}
                                    </CardHeader>
                                    <Formik
                                        initialValues={initialValues}
                                        validate={validate(validationSchema)}
                                        onSubmit={(values, { setSubmitting, setErrors }) => {
                                            if (navigator.onLine) {
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
                                                            console.log(error)
                                                            if (error.message === "Network Error") {
                                                                this.setState({ message: error.message });
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
                                                                <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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

export default ForgotPasswordComponent;