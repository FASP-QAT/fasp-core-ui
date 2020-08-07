import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css';
import i18n from '../../i18n'

// React select
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';

import LanguageService from '../../api/LanguageService.js'
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import {LABEL_REGEX,ALPHABETS_REGEX} from '../../Constants.js';

const initialValues = {
    languageName: "",
    languageCode: ""
}
const entityname = i18n.t('static.language.language');
const validationSchema = function (values) {
    return Yup.object().shape({

        languageName: Yup.string()
            .matches(LABEL_REGEX, i18n.t('static.message.rolenamevalidtext'))
            .required(i18n.t('static.language.languagetext')),
        languageCode: Yup.string()
        .matches(ALPHABETS_REGEX, i18n.t('static.common.alphabetsOnly'))
        .required(i18n.t('static.language.languagecodetext'))
        // .max(2, i18n.t('static.language.languageCodemax3digittext'))

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
            language: {
                languageName: '',
                languageCode: ''
            },
            message: ''
        }

        // this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
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

    Capitalize(str) {
        // if (str != null && str != "") {
        //     return str.charAt(0).toUpperCase() + str.slice(1);
        // } else {
        //     return "";
        // }

        let { language } = this.state
        language.languageName = str.charAt(0).toUpperCase() + str.slice(1)
    }
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

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }


    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    LanguageService.addLanguage(values).then(response => {
                                        if (response.status == 200) {
                                            this.props.history.push(`/language/listLanguage/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode
                                            },
                                                () => {
                                                    this.hideSecondComponent();
                                                })
                                        }
                                    })
                                    // .catch(
                                    //     error => {
                                    //         if (error.message === "Network Error") {
                                    //             this.setState({ message: error.message });
                                    //         } else {
                                    //             switch (error.response.status) {
                                    //                 case 500:
                                    //                 case 401:
                                    //                 case 404:
                                    //                 case 406:
                                    //                 case 412:
                                    //                     this.setState({ message: error.response.data.messageCode });
                                    //                     break;
                                    //                 default:
                                    //                     this.setState({ message: 'static.unkownError' });
                                    //                     break;
                                    //             }
                                    //         }
                                    //     }
                                    // );
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
                                        setTouched,
                                        handleReset
                                    }) => (
                                            <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="languageName">{i18n.t('static.language.language')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="languageName"
                                                            id="languageName"
                                                            bsSize="sm"
                                                            valid={!errors.languageName && this.state.language.languageName != ''}
                                                            invalid={touched.languageName && !!errors.languageName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.language.languageName}
                                                            required />
                                                        <FormFeedback className="red">{errors.languageName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="languageCode">{i18n.t('static.language.languageCode')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="languageCode"
                                                            id="languageCode"
                                                            bsSize="sm"
                                                            valid={!errors.languageCode && this.state.language.languageCode != ''}
                                                            invalid={touched.languageCode && !!errors.languageCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.language.languageCode}
                                                            required 
                                                            maxLength={2}
                                                            />
                                                        <FormFeedback className="red">{errors.languageCode}</FormFeedback>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
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

    cancelClicked() {
        this.props.history.push(`/language/listLanguage/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { language } = this.state;
        language.languageName = '';
        language.languageCode = '';
        this.setState({
            language
        },
            () => { });

    }


}
export default AddLanguageComponent;