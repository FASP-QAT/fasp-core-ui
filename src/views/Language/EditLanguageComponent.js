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
import { LABEL_REGEX, ALPHABETS_REGEX } from '../../Constants.js';
import { SPECIAL_CHARECTER_WITHOUT_NUM, ALPHABET_NUMBER_REGEX, SPACE_REGEX } from '../../Constants.js';


let initialValues = {
    label: '',
    languageCode: '',
    countryCode: ''
}
const entityname = i18n.t('static.language.language');
const validationSchema = function (values) {
    return Yup.object().shape({

        label: Yup.string()
            // .matches(LABEL_REGEX, i18n.t('static.message.rolenamevalidtext'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.language.languagetext')),
        languageCode: Yup.string()
            // .matches(ALPHABETS_REGEX, i18n.t('static.common.alphabetsOnly'))
            .matches(SPECIAL_CHARECTER_WITHOUT_NUM, i18n.t('static.common.alphabetsOnly'))
            .required(i18n.t('static.language.languagecodetext')),
        // .max(2, i18n.t('static.language.languageCodemax3digittext'))
        countryCode: Yup.string()
            .required(i18n.t('static.language.countrycodetext'))
            .max(2, i18n.t('static.language.countrycode2chartext'))

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
                label: {
                    label_en: ''
                }
            },
            message: '',
            loading: true
        }

        this.Capitalize = this.Capitalize.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.changeLoading = this.changeLoading.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    changeMessage(message) {
        this.setState({ message: message })
    }

    changeLoading(loading) {
        this.setState({ loading: loading })
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    dataChange(event) {
        let { language } = this.state
        if (event.target.name === "label") {
            language.label.label_en = event.target.value
        } else if (event.target.name === "languageCode") {
            language.languageCode = event.target.value
        } else if (event.target.name === "countryCode") {
            language.countryCode = event.target.value
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
            label: true,
            languageCode: true,
            countryCode: true
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
        // AuthenticationService.setupAxiosInterceptors();
        LanguageService.getLanguageById(this.props.match.params.languageId).then(response => {
            if (response.status == 200) {
                this.setState({
                    language: response.data,
                    loading: false
                });
            } else {
                this.setState({
                    message: response.data.messageCode, loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }

        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({
                        message: 'static.unkownError',
                        loading: false
                    });
                } else {
                    switch (error.response ? error.response.status : "") {

                        case 401:
                            this.props.history.push(`/login/static.message.sessionExpired`)
                            break;
                        case 403:
                            this.props.history.push(`/accessDenied`)
                            break;
                        case 500:
                        case 404:
                        case 406:
                            this.setState({
                                message: error.response.data.messageCode,
                                loading: false
                            });
                            break;
                        case 412:
                            this.setState({
                                message: error.response.data.messageCode,
                                loading: false
                            });
                            break;
                        default:
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                            break;
                    }
                }
            }
        );
    }

    Capitalize(str) {
        if (str != null && str != "") {
            let { language } = this.state
            language.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
        }
    }


    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    label: this.state.language.label.label_en,
                                    languageCode: this.state.language.languageCode,
                                    countryCode: this.state.language.countryCode
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    // AuthenticationService.setupAxiosInterceptors();
                                    LanguageService.editLanguage(this.state.language).then(response => {
                                        console.log(response)
                                        if (response.status == 200) {
                                            this.props.history.push(`/language/listLanguage/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode, loading: false
                                            },
                                                () => {
                                                    this.hideSecondComponent();
                                                })
                                        }

                                    }
                                    ).catch(
                                        error => {
                                            if (error.message === "Network Error") {
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false
                                                });
                                            } else {
                                                switch (error.response ? error.response.status : "") {

                                                    case 401:
                                                        this.props.history.push(`/login/static.message.sessionExpired`)
                                                        break;
                                                    case 403:
                                                        this.props.history.push(`/accessDenied`)
                                                        break;
                                                    case 500:
                                                    case 404:
                                                    case 406:
                                                        this.setState({
                                                            message: error.response.data.messageCode,
                                                            loading: false
                                                        });
                                                        break;
                                                    case 412:
                                                        this.setState({
                                                            message: error.response.data.messageCode,
                                                            loading: false
                                                        });
                                                        break;
                                                    default:
                                                        this.setState({
                                                            message: 'static.unkownError',
                                                            loading: false
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    );

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
                                            <Form onSubmit={handleSubmit} noValidate name='languageForm' autocomplete="off">
                                                <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                    <FormGroup>
                                                        <Label for="languageName">{i18n.t('static.language.language')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label}
                                                            // invalid={touched.languageName && !!errors.languageName || this.state.language.languageName == ''}
                                                            invalid={(touched.label && !!errors.label) || !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            maxLength={100}
                                                            value={this.state.language.label.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="languageCode">{i18n.t('static.language.languageCode')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="languageCode"
                                                            id="languageCode"
                                                            bsSize="sm"
                                                            valid={!errors.languageCode}
                                                            // invalid={touched.languageCode && !!errors.languageCode || this.state.language.languageCode == ''}
                                                            invalid={(touched.languageCode && !!errors.languageCode) || !!errors.languageCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.language.languageCode}
                                                            required
                                                            maxLength={2}
                                                        />
                                                        <FormFeedback className="red">{errors.languageCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="countryCode">{i18n.t('static.language.countryCode')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="countryCode"
                                                            id="countryCode"
                                                            bsSize="sm"
                                                            valid={!errors.countryCode}
                                                            invalid={touched.countryCode && !!errors.countryCode || !!errors.countryCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.language.countryCode}
                                                            required
                                                            maxLength={2}
                                                        />
                                                        <FormFeedback className="red">{errors.countryCode}</FormFeedback>
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
                                                <div style={{ display: this.state.loading ? "block" : "none" }}>
                                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                                        <div class="align-items-center">
                                                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                                            <div class="spinner-border blue ml-4" role="status">

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
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
        this.props.history.push(`/language/listLanguage/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }


    resetClicked() {
        // console.log("iiii-------->>>>>", this.props.match.params.languageId)
        LanguageService.getLanguageById(this.props.match.params.languageId).then(response => {
            this.setState({
                language: response.data
            });

        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({
                        message: 'static.unkownError',
                        loading: false
                    });
                } else {
                    switch (error.response ? error.response.status : "") {

                        case 401:
                            this.props.history.push(`/login/static.message.sessionExpired`)
                            break;
                        case 403:
                            this.props.history.push(`/accessDenied`)
                            break;
                        case 500:
                        case 404:
                        case 406:
                            this.setState({
                                message: error.response.data.messageCode,
                                loading: false
                            });
                            break;
                        case 412:
                            this.setState({
                                message: error.response.data.messageCode,
                                loading: false
                            });
                            break;
                        default:
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                            break;
                    }
                }
            }
        );
    }

}