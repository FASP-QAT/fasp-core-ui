import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import { DECIMAL_NO_REGEX, ALPHABETS_REGEX, SPACE_REGEX } from '../../Constants';

const initialValues = {
    summary: "Add Currency",
    currencyName: "",
    currencyCode: "",
    conversionRatetoUSD: "",
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        currencyName: Yup.string()
            .required(i18n.t('static.currency.currencytext'))
            .matches(SPACE_REGEX, i18n.t('static.message.rolenamevalidtext')),
        // currencyCode: Yup.string()
        //     .required(i18n.t('static.currency.currencycodetext'))
        //     .matches(ALPHABETS_REGEX, i18n.t('static.common.alphabetsOnly')),
        conversionRatetoUSD: Yup.string()
            .required(i18n.t('static.currency.currencyconversiontext'))
            .matches(DECIMAL_NO_REGEX, i18n.t('static.currency.conversionrateNumberDecimalPlaces')),
        // notes: Yup.string()
        //     .required(i18n.t('static.common.notestext'))
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

export default class CurrencyTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currency: {
                summary: 'Add Currency',
                currencyName: "",
                currencyCode: "",
                conversionRatetoUSD: "",
                notes: ''
            },
            message: '',
            loading: false
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }

    dataChange(event) {
        let { currency } = this.state
        if (event.target.name == "summary") {
            currency.summary = event.target.value;
        }
        if (event.target.name == "currencyName") {
            currency.currencyName = event.target.value;
        }
        if (event.target.name == "currencyCode") {
            currency.currencyCode = event.target.value;
        }
        if (event.target.name == "conversionRatetoUSD") {
            currency.conversionRatetoUSD = event.target.value;
        }
        if (event.target.name == "notes") {
            currency.notes = event.target.value;
        }
        this.setState({
            currency
        }, () => { })
    };

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            currencyName: true,
            currencyCode: true,
            conversionRatetoUSD: true,
            notes: true
        })
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

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { currency } = this.state;
        // currency.summary = '';
        currency.currencyName = '';
        currency.currencyCode = '';
        currency.conversionRatetoUSD = '';
        currency.notes = '';
        this.setState({
            currency
        },
            () => { });
    }

    render() {

        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.currency.currencyMaster')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        initialValues={initialValues}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            JiraTikcetService.addEmailRequestIssue(values).then(response => {
                                console.log("Response :", response.status, ":", JSON.stringify(response.data));
                                if (response.status == 200 || response.status == 201) {
                                    var msg = response.data.key;
                                    this.setState({
                                        message: msg, loading: false
                                    },
                                        () => {
                                            this.resetClicked();
                                            this.hideSecondComponent();
                                        })
                                } else {
                                    this.setState({
                                        message: i18n.t('static.unkownError'), loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                }
                                this.props.togglehelp();
                                this.props.toggleSmall(this.state.message);
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
                                    <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                        < FormGroup >
                                            <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text" name="summary" id="summary" readOnly={true}
                                                bsSize="sm"
                                                valid={!errors.summary && this.state.currency.summary != ''}
                                                invalid={touched.summary && !!errors.summary}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.currency.summary}
                                                required />
                                            <FormFeedback className="red">{errors.summary}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="currencyName">{i18n.t('static.currency.currencyName')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text" name="currencyName" id="currencyName"
                                                bsSize="sm"
                                                valid={!errors.currencyName && this.state.currency.currencyName != ''}
                                                invalid={touched.currencyName && !!errors.currencyName}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.currency.currencyName}
                                                required />
                                            <FormFeedback className="red">{errors.currencyName}</FormFeedback>
                                        </FormGroup>
                                        < FormGroup >
                                            <Label for="currencyCode">{i18n.t('static.currency.currencycode')}</Label>
                                            <Input type="text" name="currencyCode" id="currencyCode"
                                                bsSize="sm"
                                                // valid={!errors.currencyCode && this.state.currency.currencyCode != ''}
                                                // invalid={touched.currencyCode && !!errors.currencyCode}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.currency.currencyCode}
                                            // required 
                                            />
                                            <FormFeedback className="red">{errors.currencyCode}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="conversionRatetoUSD">{i18n.t('static.currency.conversionrateusd')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="number" name="conversionRatetoUSD" id="conversionRatetoUSD"
                                                bsSize="sm"
                                                valid={!errors.conversionRatetoUSD && this.state.currency.conversionRatetoUSD != ''}
                                                invalid={touched.conversionRatetoUSD && !!errors.conversionRatetoUSD}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.currency.conversionRatetoUSD}
                                                required />
                                            <FormFeedback className="red">{errors.conversionRatetoUSD}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                            <Input type="textarea" name="notes" id="notes"
                                                bsSize="sm"
                                                valid={!errors.notes && this.state.currency.notes != ''}
                                                invalid={touched.notes && !!errors.notes}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                maxLength={600}
                                                value={this.state.currency.notes}
                                            // required 
                                            />
                                            <FormFeedback className="red">{errors.notes}</FormFeedback>
                                        </FormGroup>
                                        <ModalFooter className="pb-0 pr-0">
                                            <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                            <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                            <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check "></i> {i18n.t('static.common.submit')}</Button>
                                        </ModalFooter>
                                    </Form>
                                )} />
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}