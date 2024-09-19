import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import { API_URL, SPECIAL_CHARECTER_WITH_NUM } from '../../Constants.js';
import CurrencyService from '../../api/CurrencyService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Localized entity name
const entityname = i18n.t('static.currency.currencyMaster');
// Initial values for form fields
const initialValues = {
    currencyCode: '',
    label: '',
    conversionRate: '',
    isSync: 'true'
}
/**
 * Defines the validation schema for currency details.
 * @param {*} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        currencyCode: Yup.string()
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .required(i18n.t('static.currency.currencycodetext')),
        label: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.currency.currencytext')),
        // conversionRate: Yup.string()
        //     .matches(/^\d+(\.\d{1,4})?$/, i18n.t('static.currency.conversionrateNumberDecimalPlaces'))
        //     .required(i18n.t('static.currency.conversionrateNumber')).min(0, i18n.t('static.currency.conversionrateMin'))

        conversionRate: Yup.string()
            // .matches(/^\d+(\.\d{1,4})?$/, i18n.t('static.currency.conversionrateNumberDecimalPlaces'))
            .matches(/^\d*(\.\d{1,4})?$/, i18n.t('static.currency.conversionrateNumberDecimalPlaces'))
            .when('isSync', {
                is: false, // when isSync is false
                then: Yup.string().required(i18n.t('static.currency.conversionrateNumber')), // conversionRate is required
                otherwise: Yup.string().notRequired() // conversionRate is not required when isSync is true
            })
    })
}
/**
 * Component for adding currency details.
 */
export default class AddCurrencyComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currencyCode: '',
            label: {
                label_en: ''
            },
            conversionRateToUsd: '',
            isSync: true,
            loading: true
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    /**
     * Hides the message in div2 after 30 seconds.
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * Handles data change in the currency form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        if (event.target.name === "currencyCode") {
            this.state.currencyCode = event.target.value.toUpperCase();
        }
        if (event.target.name === "label") {
            this.state.label.label_en = event.target.value;
        }
        else if (event.target.name === "conversionRate") {
            this.state.conversionRateToUsd = event.target.value;
        } else if (event.target.name === "isSync") {
            this.state.isSync = event.target.id === "active2" ? false : true;
        }
        let { currency } = this.state
        this.setState(
            {
                currency
            }
        )
    };
    /**
     * Stops the loader on component mount 
     */
    componentDidMount() {
        this.setState({ loading: false })
    }
    /**
     * Capitalizes the first letter of the currency name.
     * @param {string} str - The currency name.
     */
    Capitalize(str) {
        this.state.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    /**
     * Renders the currency details form.
     * @returns {JSX.Element} - currency details form.
     */
    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                // initialValues={initialValues}
                                enableReinitialize={true}
                                initialValues={{
                                    currencyCode: this.state.currencyCode,
                                    // currencySymbol: this.state.currency.currencySymbol,
                                    label: this.state.label.label_en,
                                    conversionRate: this.state.conversionRateToUsd,
                                    isSync: this.state.isSync
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    CurrencyService.addCurrency(this.state)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/currency/listCurrency/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                                        <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='currencyForm' autocomplete="off">
                                            <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label for="label">{i18n.t('static.currency.currency')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="label"
                                                        id="label"
                                                        bsSize="sm"
                                                        valid={!errors.label}
                                                        invalid={touched.label && !!errors.label}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.label.label_en}
                                                        required />
                                                    <FormFeedback className="red">{errors.label}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="currencyCode">{i18n.t('static.currency.currencycode')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="currencyCode"
                                                        id="currencyCode"
                                                        bsSize="sm"
                                                        valid={!errors.currencyCode && this.state.currencyCode != ''}
                                                        invalid={touched.currencyCode && !!errors.currencyCode}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.currencyCode}
                                                        required
                                                        maxLength={4}
                                                    />
                                                    <FormFeedback className="red">{errors.currencyCode}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="conversionRate">{i18n.t('static.currency.conversionrateusd')}<span id="conversionRateRequiredSpan" style={{ display: this.state.isSync ? "none" : "inline-block"}} class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="conversionRate"
                                                        id="conversionRate"
                                                        // valid={!errors.conversionRate && this.state.conversionRateToUsd != ''}
                                                        valid={!errors.conversionRate}
                                                        invalid={touched.conversionRate && !!errors.conversionRate || !!errors.conversionRate}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.conversionRateToUsd}
                                                        bsSize="sm"
                                                        required />
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
                                                            checked={this.state.isSync === true}
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
                                                            checked={this.state.isSync === false}
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
                                                    <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    {/* <Button type="submit" color="success" className="mr-1 float-right" size="md" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button> */}
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md"><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
    /**
     * Redirects to the list currency screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/currency/listCurrency/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the currency details form when reset button is clicked.
     */
    resetClicked() {
        this.state.currencyCode = ''
        this.state.currencySymbol = ''
        this.state.label.label_en = ''
        this.state.conversionRateToUsd = ''
        let { currency } = this.state
        this.setState(
            {
                currency
            }
        )
    }
}
