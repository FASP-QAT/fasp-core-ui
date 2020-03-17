import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import AuthenticationService from '../common/AuthenticationService.js';
import CurrencyService from '../../api/CurrencyService.js';

const initialValues = {
    currencyCode: '',
    currencySymbol: '',
    label: '',
    conversionRate: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        currencyCode: Yup.string()
            .required('Please enter currency code'),
        currencySymbol: Yup.string()
            .required('Please enter currency symbol'),
        label: Yup.string()
            .required('Please enter currency name'),
        conversionRate: Yup.string()
            .required('Please enter conversion rate to usd'),
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


export default class AddCurrencyComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currencyCode: '',
            currencySymbol: '',
            label: {
                label_en: ''
                // freLabel: '',
                // spaLabel: '',
                // porLabel: ''
            },
            conversionRateToUsd: ''
        }
        this.Capitalize = this.Capitalize.bind(this);

        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {
        if (event.target.name === "currencyCode") {
            this.state.currencyCode = event.target.value.toUpperCase();
        } if (event.target.name === "currencySymbol") {
            this.state.currencySymbol = event.target.value;
        } if (event.target.name === "label") {
            this.state.label.label_en = event.target.value;
        }
        else if (event.target.name === "conversionRate") {
            this.state.conversionRateToUsd = event.target.value;
        }
        let { currency } = this.state
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
    }

    Capitalize(str) {
        this.state.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    render() {

        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>Add Currency</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {

                                    // alert("----"+this.state.label.label_en);
                                    // console.log("------IN SUBMIT------", this.state)
                                    CurrencyService.addCurrency(this.state)
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
                                                        <Label for="currencyCode">Currency Code:</Label>
                                                        <Input type="text"
                                                            name="currencyCode"
                                                            id="currencyCode"
                                                            valid={!errors.currencyCode}
                                                            invalid={touched.currencyCode && !!errors.currencyCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            // value={this.state.label.label_en}
                                                            required />
                                                        <FormFeedback>{errors.currencyCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="currencySymbol">Currency Symbol</Label>
                                                        <Input type="text"
                                                            name="currencySymbol"
                                                            id="currencySymbol"
                                                            valid={!errors.currencySymbol}
                                                            invalid={touched.currencySymbol && !!errors.currencySymbol}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required />
                                                        <FormFeedback>{errors.currencySymbol}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="label">Currency Name (English):</Label>
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            valid={!errors.label}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.label.label_en}
                                                            required />
                                                        <FormFeedback>{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="laconversionRatebel">Conversion Rate To Usd:</Label>
                                                        <Input type="text"
                                                            name="conversionRate"
                                                            id="conversionRate"
                                                            valid={!errors.conversionRate}
                                                            invalid={touched.conversionRate && !!errors.conversionRate}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            // value={this.state.country.label.label_en}
                                                            required />
                                                        <FormFeedback>{errors.conversionRate}</FormFeedback>
                                                    </FormGroup>

                                                </CardBody>

                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="submit" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)}>Submit</Button>
                                                        <Button type="reset" color="danger" className="mr-1" onClick={this.cancelClicked}>Cancel</Button>
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
        this.props.history.push(`/currency/listCurrency/` + "Action Canceled")
    }
}