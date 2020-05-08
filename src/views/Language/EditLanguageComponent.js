import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormGroup, Input, InputGroupAddon, InputGroupText, Label, Row, FormFeedback } from 'reactstrap';
import * as Yup from 'yup';
// import * as myConst from '../../Labels.js';
import LanguageService from '../../api/LanguageService.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import '../Forms/ValidationForms/ValidationForms.css';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'


let initialValues = {
    languageName: '',
    languageCode: ''
}
const entityname = i18n.t('static.language.language');
const validationSchema = function (values) {
    return Yup.object().shape({

        languageName: Yup.string()
            .required(i18n.t('static.language.languagetext')),
        languageCode: Yup.string().required(i18n.t('static.language.languagecodetext')).max(2, i18n.t('static.language.languageCodemax3digittext'))

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
            // language: this.props.location.state.language,
            language: {
                languageName: ''
            },
            message: ''
        }

        this.Capitalize = this.Capitalize.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
    }
    changeMessage(message) {
        this.setState({ message: message })
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
        AuthenticationService.setupAxiosInterceptors();
        LanguageService.getLanguageById(this.props.match.params.languageId).then(response => {
            this.setState({
                language: response.data
            });

        })
    }

    Capitalize(str) {
        if (str != null && str != "") {
            let { language } = this.state
            language.languageName = str.charAt(0).toUpperCase() + str.slice(1)
        }
    }


    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} />
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    languageName: this.state.language.languageName,
                                    languageCode: this.state.language.languageCode
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    LanguageService.editLanguage(this.state.language).then(response => {
                                        console.log(response)
                                        if (response.status == 200) {
                                            this.props.history.push(`/language/listLanguage/` + i18n.t(response.data.messageCode, { entityname }))
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode
                                            })
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
                                                        <Label for="languageName">{i18n.t('static.language.language')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="languageName"
                                                            id="languageName"
                                                            bsSize="sm"
                                                            valid={!errors.languageName}
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
                                                            valid={!errors.languageCode}
                                                            invalid={touched.languageCode && !!errors.languageCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.language.languageCode}
                                                            required />
                                                        <FormFeedback className="red">{errors.languageCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label className="P-absltRadio">{i18n.t('static.common.status')}  </Label>
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
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.resetClicked}><i className="fa fa-refresh"></i> Reset</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
        this.props.history.push(`/language/listLanguage/` + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        console.log("iiii-------->>>>>", this.props.match.params.languageId)
        LanguageService.getLanguageById(this.props.match.params.languageId).then(response => {
            this.setState({
                language: response.data
            });

        })
    }

}