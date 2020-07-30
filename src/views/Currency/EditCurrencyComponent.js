import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import CurrencyService from '../../api/CurrencyService.js';
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import {LABEL_REGEX,ALPHABETS_REGEX} from '../../Constants.js';


const entityname = i18n.t('static.currency.currencyMaster');
let initialValues = {
    currencyCode: '',
    // currencySymbol: '',
    label: '',
    conversionRate: '',
    isSync: true
}

const validationSchema = function (values) {
    return Yup.object().shape({
        currencyCode: Yup.string()
            .matches(ALPHABETS_REGEX, i18n.t('static.common.alphabetsOnly'))
            .required(i18n.t('static.currency.currencycodetext')),
        // .max(4, i18n.t('static.currency.currencycodemax4digittext')),
        // currencySymbol: Yup.string()
        //     .required(i18n.t('static.currency.currencysymboltext')).
        //     max(3, i18n.t('static.country.countrycodemax3digittext')).
        //     // matches(/^[A-Z@~`!@#$%^&*()_=+\\\\';:\"\\/?>.<,-]*$/i, i18n.t('static.currency.numbernotallowedtext')),
        //     matches(/^([^0-9]*)$/, i18n.t('static.currency.numbernotallowedtext')),
        label: Yup.string()
            .matches(LABEL_REGEX, i18n.t('static.message.rolenamevalidtext'))
            .required(i18n.t('static.currency.currencytext')),
        conversionRate: Yup.string()
            .required(i18n.t('static.currency.conversionrateNumber')).min(0, i18n.t('static.currency.conversionrateMin'))
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


export default class UpdateCurrencyComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            // currency: this.props.location.state.currency,
            currency: {
                currencyCode: '',
                // currencySymbol: '',
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                conversionRateToUsd: '',
                isSync: 'true'
            },
            message: '',
            lang: localStorage.getItem('lang')
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);

    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    changeMessage(message) {
        this.setState({ message: message })
    }

    dataChange(event) {
        let { currency } = this.state

        if (event.target.name === "currencyCode") {
            this.state.currency.currencyCode = event.target.value.toUpperCase();
        }
        // if (event.target.name === "currencySymbol") {
        //     this.state.currency.currencySymbol = event.target.value;
        // }
        if (event.target.name === "label") {
            this.state.currency.label.label_en = event.target.value
        }

        else if (event.target.name === "conversionRate") {
            this.state.currency.conversionRateToUsd = event.target.value
        } else if (event.target.name === "isSync") {
            this.state.currency.isSync = event.target.id === "active2" ? false : true;
        }

        this.setState(
            {
                currency
            }
        )

    };

    touchAll(setTouched, errors) {
        setTouched({
            currencyCode: true,
            // currencySymbol: true,
            label: true,
            conversionRate: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('currencyForm', (fieldName) => {
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
        CurrencyService.getCurrencyById(this.props.match.params.currencyId).then(response => {
            console.log(JSON.stringify(response.data))
            if (response.status == 200) {
                this.setState({
                    currency: response.data
                });
            }
            else {
                this.setState({
                    message: response.data.messageCode
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }


        })

    }

    Capitalize(str) {
        if (str != null && str != "") {
            let { currency } = this.state
            currency.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
        }

    }

    cancelClicked() {
        this.props.history.push(`/currency/listCurrency/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    render() {

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    currencyCode: this.state.currency.currencyCode,
                                    currencySymbol: this.state.currency.currencySymbol,
                                    label: getLabelText(this.state.currency.label, this.state.lang),
                                    conversionRate: this.state.currency.conversionRateToUsd,
                                    isSync: this.state.currency.isSync
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {

                                    CurrencyService.editCurrency(this.state.currency)
                                        .then(response => {
                                            if (response.status == 200) {
                                                // console.log("after update--",response.data);
                                                this.props.history.push(`/currency/listCurrency/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                },
                                                    () => {
                                                        this.hideSecondComponent();
                                                    })
                                            }
                                        })
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
                                            <Form onSubmit={handleSubmit} noValidate name='currencyForm'>
                                                <CardBody className="pb-0">
                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.currency.currency')}<span class="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-money"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label}
                                                            invalid={touched.label && !!errors.label || this.state.currency.label.label_en == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.currency.label.label_en}
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="currencyCode">{i18n.t('static.currency.currencycode')}<span class="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="currencyCode"
                                                            id="currencyCode"
                                                            bsSize="sm"
                                                            valid={!errors.currencyCode}
                                                            invalid={touched.currencyCode && !!errors.currencyCode || this.state.currency.currencyCode == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.currency.currencyCode}
                                                            required
                                                            maxLength={4}
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.currencyCode}</FormFeedback>
                                                    </FormGroup>
                                                    {/* <FormGroup>
                                                        <Label for="currencySymbol">{i18n.t('static.currency.currencysymbol')}<span className="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="currencySymbol"
                                                            id="currencySymbol"
                                                            bsSize="sm"
                                                            valid={!errors.currencySymbol}
                                                            invalid={touched.currencySymbol && !!errors.currencySymbol}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.currency.currencySymbol}
                                                            required />
                                                        <FormFeedback className="red">{errors.currencySymbol}</FormFeedback>
                                                    </FormGroup> */}
                                                    <FormGroup>
                                                        <Label for="conversionRate">{i18n.t('static.currency.conversionrateusd')}<span class="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-exchange"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="conversionRate"
                                                            id="conversionRate"
                                                            bsSize="sm"
                                                            valid={!errors.conversionRate}
                                                            invalid={touched.conversionRate && !!errors.conversionRate || this.state.currency.conversionRateToUsd == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.currency.conversionRateToUsd}
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.conversionRate}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="isSync">{i18n.t('static.common.issync')}  </Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="isSync"
                                                                value={true}
                                                                checked={this.state.currency.isSync === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio1">
                                                                {i18n.t('static.program.yes')}
                                                            </Label>
                                                        </FormGroup>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active2"
                                                                name="isSync"
                                                                value={false}
                                                                checked={this.state.currency.isSync === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio2">
                                                                {i18n.t('static.program.no')}
                                                            </Label>
                                                        </FormGroup>
                                                    </FormGroup>

                                                </CardBody>

                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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

    resetClicked() {
        AuthenticationService.setupAxiosInterceptors();
        CurrencyService.getCurrencyById(this.props.match.params.currencyId).then(response => {
            this.setState({
                currency: response.data
            });
        })
    }

}
