import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n';
// import AuthenticationService from '../common/AuthenticationService.js';
// import * as myConst from '../../Labels.js';
import LanguageService from '../../api/LanguageService.js'

let initialValues = {
    language: ""
}
const validationSchema = function (values) {
    return Yup.object().shape({

        language: Yup.string()
        .required(i18n.t('static.language.languagetext')) ,
        languageCode: Yup.string().required(i18n.t('static.language.languagecodetext'))

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

export default class EditLanguageComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            language: this.props.location.state.language,
            message: ''
        }

        // this.Capitalize = this.Capitalize.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);

    }

    dataChange(event) {
        let { language } = this.state
        if (event.target.name === "languageName") {
            language.languageName = event.target.value
        } else if (event.target.name === "languageCode") {
            language.languageCode = event.target.value
        } else if (event.target.name === "active") {
            language.active = event.target.id === "active2" ? false : true
        }

        this.setState(
            {
                language
            },
            () => { }
        );
    };

    touchAll(setTouched, errors) {
        setTouched({
            languageName: true,
            languageCode: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('languageForm', (fieldName) => {
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

    }

    // Capitalize(str) {
    //     let { language } = this.state
    //     language.languageName = str.charAt(0).toUpperCase() + str.slice(1)
    // }

    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.language.languageedit')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{ language: this.state.language }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    // AuthenticationService.setupAxiosInterceptors();
                                    LanguageService.editLanguage(this.state.language).then(response => {
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
                                        )

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
                                            <Form onSubmit={handleSubmit} noValidate name='languageForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="language">{i18n.t('static.language.language')}</Label>
                                                        <Input type="text"
                                                            name="languageName"
                                                            id="languageName"
                                                            bsSize="sm"
                                                            valid={!errors.languageName}
                                                            invalid={touched.languageName && !!errors.languageName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.language.languageName}
                                                            required />
                                                        <FormFeedback>{errors.languageName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="languageCode">{i18n.t('static.language.languageCode')}</Label>
                                                        <Input type="text"
                                                            name="languageCode"
                                                            id="languageCode"
                                                            bsSize="sm"
                                                            valid={!errors.languageCode}
                                                            invalid={touched.languageCode && !!errors.languageCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.language.languageCode}
                                                            required />
                                                        <FormFeedback>{errors.languageCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label>{i18n.t('static.common.status')}  </Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.language.active === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio1">
                                                                {i18n.t('static.common.active')}
                                                            </Label>
                                                        </FormGroup>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active2"
                                                                name="active"
                                                                value={false}
                                                                checked={this.state.language.active === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio2">
                                                                {i18n.t('static.common.disabled')}
                                                            </Label>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="submit" size="sm" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        &nbsp;
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>

                                        )} />
                        </Card>
                    </Col>
                </Row>
                <div>
                    <h6>{i18n.t('this.state.message')}{}</h6>
                    <h6>{i18n.t('this.props.match.params.message')}{}</h6>
                </div>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/language/listLanguage/` + "static.actionCancelled")
    }

}