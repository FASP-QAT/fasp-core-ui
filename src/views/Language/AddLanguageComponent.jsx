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
// import AuthenticationService from '../common/AuthenticationService.js';

const initialValues = {
    languageName: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        languageName: Yup.string()
        .required(i18n.t('static.language.languagetext')) 
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
            languageName: '',
            message: ''
        }
        
        this.Capitalize = this.Capitalize.bind(this);

        this.submitClicked = this.submitClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {
        let { languageName } = this.state;

        this.setState({
            languageName
        },
            () => {
                //  console.log("state after update---", this.state.languageName) 
        });
    };

    Capitalize(str) {
        this.setState({languageName: str.charAt(0).toUpperCase() + str.slice(1)});
    }

    touchAll(setTouched, errors) {
        setTouched({
            languageName: true
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
        // AuthenticationService.setupAxiosInterceptors();

    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    };

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
                                    // initialValues={initialValues}
                                    validate={validate(validationSchema)}

                                    onSubmit={(values, { setSubmitting, setErrors }) => {

                                        LanguageService.addLanguage(values).then(response => {
                                            if (response.data.status == "Success") {
                                                this.props.history.push(`/language/listLanguage/${response.data.message}`)
                                              } else {
                                                this.setState({
                                                  message: response.data.message
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
                                                                message: error.response.data.message
                                                            })
                                                            break
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
                                                            valid={!errors.languageName}
                                                            invalid={touched.languageName && !!errors.languageName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.languageName}
                                                            required />
                                                        <FormFeedback>{errors.languageName}</FormFeedback>
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

    submitClicked() {

    }
    cancelClicked() {
        this.props.history.push(`/language/listLanguage/` + "Action Canceled")
    }


}
export default AddLanguageComponent;