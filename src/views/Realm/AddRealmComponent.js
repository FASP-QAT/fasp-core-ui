import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { ACTUAL_CONSUMPTION_MONTHS_IN_PAST, API_URL, FORECASTED_CONSUMPTION_MONTHS_IN_PAST, INVENTORY_MONTHS_IN_PAST } from '../../Constants';
import RealmService from '../../api/RealmService';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Capitalize, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.realm.realm');
// Initial values for form fields
const initialValues = {
    realmCode: '',
    label: '',
    minMosMinGaurdrail: '',
    minMosMaxGaurdrail: '',
    maxMosMaxGaurdrail: '',
    minQplTolerance: '',
    minQplToleranceCutOff: '',
    maxQplTolerance: '',
    actualConsumptionMonthsInPast: Number(ACTUAL_CONSUMPTION_MONTHS_IN_PAST),
    forecastConsumptionMonthsInPast: Number(FORECASTED_CONSUMPTION_MONTHS_IN_PAST),
    inventoryMonthsInPast: Number(INVENTORY_MONTHS_IN_PAST),
    minCountForMode: '',
    minPercForMode: '',
    noOfMonthsInPastForBottomDashboard: 6,
    noOfMonthsInFutureForBottomDashboard: 18,
    noOfMonthsInPastForTopDashboard: 0,
    noOfMonthsInFutureForTopDashboard: 18
}
/**
 * Defines the validation schema for realm details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        realmCode: Yup.string()
            .matches(/^\S*$/, i18n.t('static.validNoSpace.string'))
            .required(i18n.t('static.realm.realmCodeText'))
            .max(6, i18n.t('static.realm.realmCodeLength')),
        label: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.realm.realmNameText')),
        minMosMinGaurdrail: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.realm.minMosMinGaurdrail')),
        minMosMaxGaurdrail: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.realm.minMosMaxGaurdrail')),
        maxMosMaxGaurdrail: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.realm.maxMosMaxGaurdrail')),
        minQplTolerance: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.minQplTolerance'))
            .min(0, i18n.t('static.program.validvaluetext')),
        minQplToleranceCutOff: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.minQplToleranceCutOff'))
            .min(0, i18n.t('static.program.validvaluetext')),
        maxQplTolerance: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.maxQplTolerance'))
            .min(0, i18n.t('static.program.validvaluetext')),
        actualConsumptionMonthsInPast: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.restrictionActualConsumption'))
            .min(0, i18n.t('static.program.validvaluetext')),
        forecastConsumptionMonthsInPast: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.restrictionForecastConsumption'))
            .min(0, i18n.t('static.program.validvaluetext')),
        inventoryMonthsInPast: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.restrictionInventory'))
            .min(0, i18n.t('static.program.validvaluetext')),
        minCountForMode: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.minCountForMode'))
            .min(0, i18n.t('static.program.validvaluetext')),
        minPercForMode: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .required(i18n.t('static.validated.minPercForMode'))
            .min(0, i18n.t('static.program.validvaluetext')),
        noOfMonthsInFutureForTopDashboard: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.restrictionNoOfMonthsInFutureForTopDashboard')),
        noOfMonthsInPastForBottomDashboard: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.restrictionNoOfMonthsInPastForBottomDashboard')),
        noOfMonthsInPastForTopDashboard: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.restrictionNoOfMonthsInPastForTopDashboard')),
        noOfMonthsInFutureForBottomDashboard: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
            .required(i18n.t('static.validated.restrictionNoOfMonthsInFutureForBottomDashboard'))
    })
}
/**
 * Component for adding realm details.
 */
export default class AddRealmComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            realm: {
                realmCode: '',
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                defaultRealm: true,
                minMosMinGaurdrail: '',
                minMosMaxGaurdrail: '',
                maxMosMaxGaurdrail: '',
                minQplTolerance: '',
                minQplToleranceCutOff: '',
                maxQplTolerance: '',
                actualConsumptionMonthsInPast: Number(ACTUAL_CONSUMPTION_MONTHS_IN_PAST),
                forecastConsumptionMonthsInPast: Number(FORECASTED_CONSUMPTION_MONTHS_IN_PAST),
                inventoryMonthsInPast: Number(INVENTORY_MONTHS_IN_PAST),
                minCountForMode: '',
                minPercForMode: '',
                noOfMonthsInPastForBottomDashboard: 6,
                noOfMonthsInFutureForBottomDashboard: 18,
                noOfMonthsInPastForTopDashboard: 0,
                noOfMonthsInFutureForTopDashboard: 18
            },
            message: ''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { realm } = this.state
        if (event.target.name === "label") {
            realm.label.label_en = event.target.value
        }
        if (event.target.name === "realmCode") {
            realm.realmCode = event.target.value.toUpperCase();
        }
        if (event.target.name === "minMosMinGaurdrail") {
            realm.minMosMinGaurdrail = event.target.value
        }
        if (event.target.name === "minMosMaxGaurdrail") {
            realm.minMosMaxGaurdrail = event.target.value
        }
        if (event.target.name === "maxMosMaxGaurdrail") {
            realm.maxMosMaxGaurdrail = event.target.value
        }
        if (event.target.name === "minQplTolerance") {
            realm.minQplTolerance = event.target.value
        }
        if (event.target.name === "minQplToleranceCutOff") {
            realm.minQplToleranceCutOff = event.target.value
        }
        if (event.target.name === "maxQplTolerance") {
            realm.maxQplTolerance = event.target.value
        }
        if (event.target.name === "actualConsumptionMonthsInPast") {
            realm.actualConsumptionMonthsInPast = event.target.value
        }
        if (event.target.name === "forecastConsumptionMonthsInPast") {
            realm.forecastConsumptionMonthsInPast = event.target.value
        }
        if (event.target.name === "inventoryMonthsInPast") {
            realm.inventoryMonthsInPast = event.target.value
        }
        if (event.target.name === "minCountForMode") {
            realm.minCountForMode = event.target.value
        }
        if (event.target.name === "minPercForMode") {
            realm.minPercForMode = event.target.value
        }
        else if (event.target.name === "defaultRealm") {
            realm.defaultRealm = event.target.id === "active2" ? false : true
        }
        if (event.target.name === "noOfMonthsInFutureForTopDashboard") {
            realm.noOfMonthsInFutureForTopDashboard = event.target.value
        }
        if (event.target.name === "noOfMonthsInPastForBottomDashboard") {
            realm.noOfMonthsInPastForBottomDashboard = event.target.value
        }
        if (event.target.name === "noOfMonthsInPastForTopDashboard") {
            realm.noOfMonthsInPastForTopDashboard = event.target.value
        }
        if (event.target.name === "noOfMonthsInFutureForBottomDashboard") {
            realm.noOfMonthsInFutureForBottomDashboard = event.target.value
        }
        this.setState(
            {
                realm
            }
        )
    };
    /**
     * Show loader on component mount
     */
    componentDidMount() {
        this.setState({ loading: false })
    }
    /**
     * Renders the realm details form.
     * @returns {JSX.Element} - Realm details form.
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
                                enableReinitialize={true}
                                initialValues={initialValues}
                                // initialValues={{
                                //     realmCode: this.state.realm.realmCode,
                                //     label: getLabelText(this.state.realm.label, this.state.lang),
                                //     minMosMinGaurdrail: this.state.realm.minMosMinGaurdrail,
                                //     minMosMaxGaurdrail: this.state.realm.minMosMaxGaurdrail,
                                //     maxMosMaxGaurdrail: this.state.realm.maxMosMaxGaurdrail,
                                //     defaultRealm: this.state.realm.defaultRealm,
                                //     minQplTolerance: this.state.realm.minQplTolerance,
                                //     minQplToleranceCutOff: this.state.realm.minQplToleranceCutOff,
                                //     maxQplTolerance: this.state.realm.maxQplTolerance,
                                //     actualConsumptionMonthsInPast: this.state.realm.actualConsumptionMonthsInPast,
                                //     forecastConsumptionMonthsInPast: this.state.realm.forecastConsumptionMonthsInPast,
                                //     inventoryMonthsInPast: this.state.realm.inventoryMonthsInPast,
                                //     minCountForMode: this.state.realm.minCountForMode,
                                //     minPercForMode: this.state.realm.minPercForMode,
                                // }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    RealmService.addRealm(this.state.realm)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/realm/listRealm/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode, loading: false
                                                },
                                                    () => {
                                                        hideSecondComponent();
                                                    })
                                            }
                                        })
                                        .catch(
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
                                                        case 409:
                                                            this.setState({
                                                                message: i18n.t('static.common.accessDenied'),
                                                                loading: false,
                                                                color: "#BA0C2F",
                                                            });
                                                            break;
                                                        case 403:
                                                            this.props.history.push(`/accessDenied`)
                                                            break;
                                                        case 500:
                                                        case 404:
                                                        case 406:
                                                            this.setState({
                                                                message: i18n.t('static.message.alreadExists'),
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
                                        <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='realmForm' autocomplete="off">
                                            <CardBody style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label for="label">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="label"
                                                        id="label"
                                                        bsSize="sm"
                                                        valid={!errors.label && this.state.realm.label.label_en != ''}
                                                        invalid={touched.label && !!errors.label}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.label.label_en}
                                                        required />
                                                    <FormFeedback className="red">{errors.label}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="realmCode">{i18n.t('static.realm.realmCode')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="realmCode"
                                                        id="realmCode"
                                                        bsSize="sm"
                                                        valid={!errors.realmCode && this.state.realm.realmCode != ''}
                                                        invalid={touched.realmCode && !!errors.realmCode}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.realmCode}
                                                        required />
                                                    <FormFeedback className="red">{errors.realmCode}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="minMosMinGaurdrail">{i18n.t('static.realm.minMosMinGaurdraillabel')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="minMosMinGaurdrail"
                                                        id="minMosMinGaurdrail"
                                                        bsSize="sm"
                                                        valid={!errors.minMosMinGaurdrail && this.state.realm.minMosMinGaurdrail != ''}
                                                        invalid={touched.minMosMinGaurdrail && !!errors.minMosMinGaurdrail}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.minMosMinGaurdrail}
                                                        required />
                                                    <FormFeedback className="red">{errors.minMosMinGaurdrail}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="minMosMaxGaurdrail">{i18n.t('static.realm.minMosMaxGaurdraillabel')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="minMosMaxGaurdrail"
                                                        id="minMosMaxGaurdrail"
                                                        bsSize="sm"
                                                        valid={!errors.minMosMaxGaurdrail && this.state.realm.minMosMaxGaurdrail != ''}
                                                        invalid={touched.minMosMaxGaurdrail && !!errors.minMosMaxGaurdrail}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.minMosMaxGaurdrail}
                                                        required />
                                                    <FormFeedback className="red">{errors.minMosMaxGaurdrail}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="maxMosMaxGaurdrail">{i18n.t('static.realm.maxMosMaxGaurdraillabel')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="maxMosMaxGaurdrail"
                                                        id="maxMosMaxGaurdrail"
                                                        bsSize="sm"
                                                        valid={!errors.maxMosMaxGaurdrail && this.state.realm.maxMosMaxGaurdrail != ''}
                                                        invalid={touched.maxMosMaxGaurdrail && !!errors.maxMosMaxGaurdrail}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.maxMosMaxGaurdrail}
                                                        required />
                                                    <FormFeedback className="red">{errors.maxMosMaxGaurdrail}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="minQplTolerance">{i18n.t('static.realm.minQplTolerance')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="minQplTolerance"
                                                        id="minQplTolerance"
                                                        bsSize="sm"
                                                        valid={!errors.minQplTolerance && this.state.realm.minQplTolerance != ''}
                                                        invalid={touched.minQplTolerance && !!errors.minQplTolerance}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.minQplTolerance}
                                                        required />
                                                    <FormFeedback className="red">{errors.minQplTolerance}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="minQplToleranceCutOff">{i18n.t('static.realm.minQplToleranceCutOff')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="minQplToleranceCutOff"
                                                        id="minQplToleranceCutOff"
                                                        bsSize="sm"
                                                        valid={!errors.minQplToleranceCutOff && this.state.realm.minQplToleranceCutOff != ''}
                                                        invalid={touched.minQplToleranceCutOff && !!errors.minQplToleranceCutOff}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.minQplToleranceCutOff}
                                                        required />
                                                    <FormFeedback className="red">{errors.minQplToleranceCutOff}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="maxQplTolerance">{i18n.t('static.realm.maxQplTolerance')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="maxQplTolerance"
                                                        id="maxQplTolerance"
                                                        bsSize="sm"
                                                        valid={!errors.maxQplTolerance && this.state.realm.maxQplTolerance != ''}
                                                        invalid={touched.maxQplTolerance && !!errors.maxQplTolerance}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.maxQplTolerance}
                                                        required />
                                                    <FormFeedback className="red">{errors.maxQplTolerance}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label>{i18n.t('static.realm.restrictionActualConsumption')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="actualConsumptionMonthsInPast"
                                                        id="actualConsumptionMonthsInPast"
                                                        bsSize="sm"
                                                        valid={!errors.actualConsumptionMonthsInPast && this.state.realm.actualConsumptionMonthsInPast != ''}
                                                        invalid={touched.actualConsumptionMonthsInPast && !!errors.actualConsumptionMonthsInPast}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.actualConsumptionMonthsInPast}
                                                        required />
                                                    <FormFeedback className="red">{errors.actualConsumptionMonthsInPast}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label>{i18n.t('static.realm.restrictionForecastConsumption')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="forecastConsumptionMonthsInPast"
                                                        id="forecastConsumptionMonthsInPast"
                                                        bsSize="sm"
                                                        valid={!errors.forecastConsumptionMonthsInPast && this.state.realm.forecastConsumptionMonthsInPast != ''}
                                                        invalid={touched.forecastConsumptionMonthsInPast && !!errors.forecastConsumptionMonthsInPast}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.forecastConsumptionMonthsInPast}
                                                        required />
                                                    <FormFeedback className="red">{errors.forecastConsumptionMonthsInPast}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label>{i18n.t('static.realm.restrictionInventory')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="inventoryMonthsInPast"
                                                        id="inventoryMonthsInPast"
                                                        bsSize="sm"
                                                        valid={!errors.inventoryMonthsInPast && this.state.realm.inventoryMonthsInPast != ''}
                                                        invalid={touched.inventoryMonthsInPast && !!errors.inventoryMonthsInPast}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.inventoryMonthsInPast}
                                                        required />
                                                    <FormFeedback className="red">{errors.inventoryMonthsInPast}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="minCountForMode">{i18n.t('static.realm.minCountForMode')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="minCountForMode"
                                                        id="minCountForMode"
                                                        bsSize="sm"
                                                        valid={!errors.minCountForMode && this.state.realm.minCountForMode != ''}
                                                        invalid={touched.minCountForMode && !!errors.minCountForMode}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.minCountForMode}
                                                        required />
                                                    <FormFeedback className="red">{errors.minCountForMode}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="minPercForMode">{i18n.t('static.realm.minPercForMode')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="minPercForMode"
                                                        id="minPercForMode"
                                                        bsSize="sm"
                                                        valid={!errors.minPercForMode && this.state.realm.minPercForMode != ''}
                                                        invalid={touched.minPercForMode && !!errors.minPercForMode}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.minPercForMode}
                                                        required />
                                                    <FormFeedback className="red">{errors.minPercForMode}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label>{i18n.t('static.realm.noOfMonthsInPastForTopDashboard')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="noOfMonthsInPastForTopDashboard"
                                                        id="noOfMonthsInPastForTopDashboard"
                                                        bsSize="sm"
                                                        valid={!errors.noOfMonthsInPastForTopDashboard && this.state.realm.noOfMonthsInPastForTopDashboard != ''}
                                                        invalid={touched.noOfMonthsInPastForTopDashboard && !!errors.noOfMonthsInPastForTopDashboard}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.noOfMonthsInPastForTopDashboard}
                                                        required />
                                                    <FormFeedback className="red">{errors.noOfMonthsInPastForTopDashboard}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label>{i18n.t('static.realm.noOfMonthsInFutureForTopDashboard')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="noOfMonthsInFutureForTopDashboard"
                                                        id="noOfMonthsInFutureForTopDashboard"
                                                        bsSize="sm"
                                                        valid={!errors.noOfMonthsInFutureForTopDashboard && this.state.realm.noOfMonthsInFutureForTopDashboard != ''}
                                                        invalid={touched.noOfMonthsInFutureForTopDashboard && !!errors.noOfMonthsInFutureForTopDashboard}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.noOfMonthsInFutureForTopDashboard}
                                                        required />
                                                    <FormFeedback className="red">{errors.noOfMonthsInFutureForTopDashboard}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label>{i18n.t('static.realm.noOfMonthsInPastForBottomDashboard')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="noOfMonthsInPastForBottomDashboard"
                                                        id="noOfMonthsInPastForBottomDashboard"
                                                        bsSize="sm"
                                                        valid={!errors.noOfMonthsInPastForBottomDashboard && this.state.realm.noOfMonthsInPastForBottomDashboard != ''}
                                                        invalid={touched.noOfMonthsInPastForBottomDashboard && !!errors.noOfMonthsInPastForBottomDashboard}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.noOfMonthsInPastForBottomDashboard}
                                                        required />
                                                    <FormFeedback className="red">{errors.noOfMonthsInPastForBottomDashboard}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label>{i18n.t('static.realm.noOfMonthsInFutureForBottomDashboard')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="noOfMonthsInFutureForBottomDashboard"
                                                        id="noOfMonthsInFutureForBottomDashboard"
                                                        bsSize="sm"
                                                        valid={!errors.noOfMonthsInFutureForBottomDashboard && this.state.realm.noOfMonthsInFutureForBottomDashboard != ''}
                                                        invalid={touched.noOfMonthsInFutureForBottomDashboard && !!errors.noOfMonthsInFutureForBottomDashboard}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.realm.noOfMonthsInFutureForBottomDashboard}
                                                        required />
                                                    <FormFeedback className="red">{errors.noOfMonthsInFutureForBottomDashboard}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label className="P-absltRadio">{i18n.t('static.realm.default')}  </Label>
                                                    <FormGroup className='form-check form-check-inline' style={{ paddingLeft: '13%' }}>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="active1"
                                                            name="defaultRealm"
                                                            value={true}
                                                            checked={this.state.realm.defaultRealm === true}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio1">
                                                            {i18n.t('static.realm.yes')}
                                                        </Label>
                                                    </FormGroup>
                                                    <FormGroup check inline>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="active2"
                                                            name="defaultRealm"
                                                            value={false}
                                                            checked={this.state.realm.defaultRealm === false}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2">
                                                            {i18n.t('static.realm.no')}
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
                                                    <Button type="reset" color="warning" size="md" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
     * Redirects to the list realm screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/realm/listRealm/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the realm details when reset button is clicked.
     */
    resetClicked() {
        let { realm } = this.state
        realm.label.label_en = ''
        realm.realmCode = ''
        realm.minMosMinGaurdrail = ''
        realm.minMosMaxGaurdrail = ''
        realm.maxMosMaxGaurdrail = ''
        realm.minQplTolerance = ''
        realm.minQplToleranceCutOff = ''
        realm.maxQplTolerance = ''
        realm.actualConsumptionMonthsInPast = ''
        realm.forecastConsumptionMonthsInPast = ''
        realm.inventoryMonthsInPast = ''
        realm.minCountForMode = ''
        realm.minPercForMode = ''
        realm.defaultRealm = true
        this.setState(
            {
                realm
            }
        )
    }
}