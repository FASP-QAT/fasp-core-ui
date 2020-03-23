import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import AuthenticationService from '../common/AuthenticationService.js';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import CurrencyService from '../../api/CurrencyService.js';
import i18n from '../../i18n';

let initialValues = {
    currencyCode: '',
    currencySymbol: '',
    label: '',
    conversionRate: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        currencyCode: Yup.string()
            .required(i18n.t('static.currency.currencycodetext')),

        currencySymbol: Yup.string()
            .required(i18n.t('static.currency.currencysymboltext')),
        label: Yup.string()
            .required(i18n.t('static.currency.currencytext')),
        conversionRate: Yup.string()
            .required(i18n.t('static.currency.currencyconversiontext')),
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
            currency: {
                currencyCode: '',
                currencySymbol: '',
                label: {
                    label_en: ''

                },
                conversionRateToUsd: ''
            }
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        initialValues = {
            currencyCode: this.props.location.state.currency.currencyCode,
            currencySymbol: this.props.location.state.currency.currencySymbol,
            label: this.props.location.state.currency.label.label_en,
            conversionRate: this.props.location.state.currency.conversionRateToUsd
        }
    }

    dataChange(event) {
        let { currency } = this.state

        if (event.target.name === "currencyCode") {
            this.state.currency.currencyCode = event.target.value.toUpperCase();
        }
        if (event.target.name === "currencySymbol") {
            this.state.currency.currencySymbol = event.target.value;
        }
        if (event.target.name === "label") {
            this.state.currency.label.engLabel = event.target.value
        }

        else if (event.target.name === "conversionRate") {
            this.state.currency.conversionRateToUsd = event.target.value
        }

        this.setState(
            {
                currency
            }
        )

    };

    touchAll(setTouched, errors) {
        setTouched({
            'currencyCode': true,
            'currencySymbol': true,
            'label': true,
            'conversionRate': true
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
        this.setState({
            currency: this.props.location.state.currency
        });
    }

    Capitalize(str) {
        let { currency } = this.state
        currency.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    cancelClicked() {
        this.props.history.push(`/currency/listCurrency/` + "Action Canceled")
    }

    render() {

        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.currency.currencyedit')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {

                                    CurrencyService.editCurrency(this.state.currency)
                                        .then(response => {
                                            if (response.data.status == "Success") {
                                                this.props.history.push(`/currency/listCurrency/${response.data.message}`)
                                            } else {
                                                this.setState({
                                                    message: response.data.message
                                                })
                                            }
                                        })
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
                                            <Form onSubmit={handleSubmit} noValidate name='currencyForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="currencyCode">{i18n.t('static.currency.currencycode')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-pencil"></i></InputGroupText>
                                                            <Input type="text"
                                                                name="currencyCode"
                                                                id="currencyCode"
                                                                bsSize="sm"
                                                                valid={!errors.currencyCode}
                                                                invalid={touched.currencyCode && !!errors.currencyCode}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                                onBlur={handleBlur}
                                                                value={this.state.currency.currencyCode}
                                                                required />
                                                        </InputGroupAddon>
                                                        <FormText className="red">{errors.currencyCode}</FormText>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="currencySymbol">{i18n.t('static.currency.currencysymbol')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-usd"></i></InputGroupText>
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
                                                        </InputGroupAddon>
                                                        <FormText className="red">{errors.currencySymbol}</FormText>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.currency.currency')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-money"></i></InputGroupText>
                                                            <Input type="text"
                                                                name="label"
                                                                id="label"
                                                                bsSize="sm"
                                                                valid={!errors.label}
                                                                invalid={touched.label && !!errors.label}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                                onBlur={handleBlur}
                                                                value={this.state.currency.label.label_en}
                                                                required />
                                                        </InputGroupAddon>
                                                        <FormText className="red">{errors.label}</FormText>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="conversionRate">{i18n.t('static.currency.conversionrateusd')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-exchange"></i></InputGroupText>
                                                            <Input type="text"
                                                                name="conversionRate"
                                                                id="conversionRate"
                                                                bsSize="sm"
                                                                valid={!errors.conversionRate}
                                                                invalid={touched.conversionRate && !!errors.conversionRate}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                                onBlur={handleBlur}
                                                                value={this.state.currency.conversionRateToUsd}
                                                                required />
                                                        </InputGroupAddon>
                                                        <FormText className="red">{errors.conversionRate}</FormText>
                                                    </FormGroup>

                                                </CardBody>

                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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

}