import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css';
import i18n from '../../i18n'

// React select
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';

import LanguageService from '../../api/LanguageService.js'
import AuthenticationService from '../common/AuthenticationService.js';

const initialValues = {
    languageName: "",
    languageCode: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        languageName: Yup.string().required('Please enter Language'),
        languageCode: Yup.string().required('Please enter Language code')
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

class AddLanguageComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            language: {},
            message: ''
        }

        // this.Capitalize = this.Capitalize.bind(this);

        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {
        let { language } = this.state;
        if (event.target.name == "langauageName") {
            language.languageName = event.target.value;
        }
        if (event.target.name == "languageCode") {
            language.languageCode = event.target.value;
        }
        this.setState({
            language
        },
            () => { });
    };

    // Capitalize(str) {
    //     this.setState({language: str.charAt(0).toUpperCase() + str.slice(1)});
    // }

    touchAll(setTouched, errors) {
        setTouched({
            languageName: true,
            languageCode: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('simpleForm', (fieldName) => {
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
        AuthenticationService.setupAxiosInterceptors();

    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }



    render() {

        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.language.languageadd')}</strong>{' '}
                            </CardHeader>
                            <CardBody>
                                <Formik
                                    validate={validate(validationSchema)}
                                    onSubmit={(values, { setSubmitting, setErrors }) => {
                                        LanguageService.addLanguage(values).then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/language/listLanguage/${response.data.messageCode}`)
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                })
                                            }
                                        }
                                        )
                                            .catch(
                                                error => {
                                                    switch (error.message) {
                                                        case "Network Error":
                                                            this.setState({
                                                                message: error.message
                                                            })
                                                            break
                                                        default:
                                                            this.setState({
                                                                message: error.response.data.messageCode
                                                            })
                                                            break;
                                                    }
                                                }
                                            )
                                        setTimeout(() => {
                                            setSubmitting(false)
                                        }, 2000)
                                    }
                                    }

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
                                                <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='simpleForm'>
                                                    <FormGroup>
                                                        <Label for="languageName">{i18n.t('static.language.language')}</Label>
                                                        <Input type="text"
                                                            name="languageName"
                                                            id="languageName"
                                                            bsSize="sm"
                                                            valid={!errors.languageName}
                                                            invalid={touched.languageName && !!errors.languageName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.languageName}
                                                            required />
                                                        <FormFeedback>{errors.languageName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="languageCode">Language code</Label>
                                                        <Input type="text"
                                                            name="languageCode"
                                                            id="languageCode"
                                                            bsSize="sm"
                                                            valid={!errors.languageCpde}
                                                            invalid={touched.languageCode && !!errors.languageCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.languageCode}
                                                            required />
                                                        <FormFeedback>{errors.languageCode}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>

                                                        <Button type="submit" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} >{i18n.t('static.common.submit')}</Button>
                                                        {/* <Button type="submit" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}>Submit</Button> */}
                                                        <Button type="reset" color="danger" className="mr-1" onClick={this.cancelClicked}>{i18n.t('static.common.cancel')}</Button>

                                                    </FormGroup>
                                                </Form>
                                            )}
                                />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }

    cancelClicked() {
        this.props.history.push(`/language/listLanguage/` + "static.actionCancelled")
    }


}
export default AddLanguageComponent;