import { Formik } from 'formik';
import React, { Component } from 'react';
import {
    Button,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Row
} from 'reactstrap';
import * as Yup from 'yup';
import { API_URL, MAX_PROGRAM_CODE_LENGTH } from '../../Constants';
import ProgramService from "../../api/ProgramService";
import step1 from '../../assets/img/1-step.png';
import step2 from '../../assets/img/2-step.png';
import step3 from '../../assets/img/3-step.png';
import step4 from '../../assets/img/4-step.png';
import step5 from '../../assets/img/5-step.png';
import step6 from '../../assets/img/6-step.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
/**
 * Defines the validation schema for program details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchemaSix = function (values) {
    return Yup.object().shape({
        programName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.program.validprogramtext')),
        userId: Yup.string()
            .required(i18n.t('static.program.validmanagertext')),
        airFreightPerc: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.validairfreighttext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        seaFreightPerc: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.validseafreighttext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        roadFreightPerc: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.validroadfreighttext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        plannedToSubmittedLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.validplantosubmittext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        submittedToApprovedLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.validsubmittoapprovetext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        approvedToShippedLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.validapprovetoshiptext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        monthsInFutureForAmc: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.validfutureamctext')).min(0, i18n.t('static.program.validvaluetext')),
        monthsInPastForAmc: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.validpastamctext')).min(0, i18n.t('static.program.validvaluetext')),
        shelfLife: Yup.number()
            .integer().typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required((i18n.t('static.pipeline.entershelflife'))).min(0, i18n.t('static.program.validvaluetext')),
        arrivedToDeliveredLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.arrivedToReceivedLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext')),
        shippedToArrivedBySeaLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.realmcountry.shippedToArrivedSeaLeadTimetext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        shippedToArrivedByAirLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.realmcountry.shippedToArrivedAirLeadTimetext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        shippedToArrivedByRoadLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.realmcountry.shippedToArrivedRoadLeadTimetext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        programCode1: Yup.string()
            .test('programCode', i18n.t('static.programValidation.programCode'),
                function (value) {
                    if (parseInt(document.getElementById("programCode").value.length + value.length) > MAX_PROGRAM_CODE_LENGTH) {
                        return false;
                    } else {
                        return true;
                    }
                }),
    })
}
/**
 * Component for pipeline program import details
 */
export default class PipelineProgramDataStepSix extends Component {
    constructor(props) {
        super(props);
        this.state = {
            programManagerList: [],
            loading: true,
            message: ''
        }
        this.startLoading = this.startLoading.bind(this);
        this.stopLoading = this.stopLoading.bind(this);
        this.setErrorMessage = this.setErrorMessage.bind(this);
    }
    /**
     * Sets loading to true
     */
    startLoading() {
        this.setState({ loading: true });
    }
    /**
     * Sets loading to false
     */
    stopLoading() {
        this.setState({ loading: false });
    }
    /**
     * Sets error message
     * @param {*} message Message that needs to be set 
     */
    setErrorMessage(message) {
        this.setState({ message: message });
    }
    /**
     * Reterives program manager list on component mount
     */
    componentDidMount() {
        var realmId = AuthenticationService.getRealmId();
        ProgramService.getProgramManagerList(realmId)
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        programManagerList: response.data,
                        loading: false
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
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
    /**
     * Renders the pipeline program import details screen.
     * @returns {JSX.Element} - Pipeline program import details screen.
     */
    render() {
        const { programManagerList } = this.state;
        let programManagers = programManagerList.length > 0
            && programManagerList.map((item, i) => {
                return (
                    <option key={i} value={item.userId}>
                        {item.username}
                    </option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <Formik
                    enableReinitialize={true}
                    initialValues={
                        {
                            programName: this.props.items.program.label.label_en,
                            userId: this.props.items.program.programManager.userId,
                            airFreightPerc: this.props.items.program.airFreightPerc,
                            seaFreightPerc: this.props.items.program.seaFreightPerc,
                            roadFreightPerc: this.props.items.program.roadFreightPerc,
                            plannedToSubmittedLeadTime: this.props.items.program.plannedToSubmittedLeadTime,
                            submittedToApprovedLeadTime: this.props.items.program.submittedToApprovedLeadTime,
                            approvedToShippedLeadTime: this.props.items.program.approvedToShippedLeadTime,
                            monthsInFutureForAmc: this.props.items.program.monthsInFutureForAmc,
                            monthsInPastForAmc: this.props.items.program.monthsInPastForAmc,
                            programNotes: this.props.items.program.programNotes,
                            arrivedToDeliveredLeadTime: this.props.items.program.arrivedToDeliveredLeadTime,
                            shippedToArrivedBySeaLeadTime: this.props.items.program.shippedToArrivedBySeaLeadTime,
                            shippedToArrivedByAirLeadTime: this.props.items.program.shippedToArrivedByAirLeadTime,
                            shippedToArrivedByRoadLeadTime: this.props.items.program.shippedToArrivedByRoadLeadTime,
                            shelfLife: this.props.items.program.shelfLife,
                            programCode1: this.props.items.program.programCode,
                            programCode: this.props.items.realmCountryCode + "-" + this.props.items.healthAreaCode + "-" + this.props.items.organisationCode
                        }
                    }
                    validationSchema={validationSchemaSix}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.props.endProgramInfoStepFive && this.props.endProgramInfoStepFive();
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
                            <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='programDataForm' style={{ display: this.state.loading ? "none" : "block" }}>
                                <Row >
                                    <FormGroup style={{ display: 'flex' }} className="col-md-6">
                                        <Col xs="6" className="pl-0">
                                            <FormGroup >
                                                <Label htmlFor="company">{i18n.t('static.program.programCode')}</Label>
                                                <Input
                                                    type="text" name="programCode"
                                                    bsSize="sm"
                                                    disabled
                                                    valid={!errors.programCode1 && this.props.items.program.programCode != ''}
                                                    invalid={touched.programCode1 && !!errors.programCode1}
                                                    value={this.props.items.realmCountryCode + "-" + this.props.items.healthAreaCode + "-" + this.props.items.organisationCode}
                                                    id="programCode" />
                                                <FormFeedback className="red">{errors.programCode1}</FormFeedback>
                                            </FormGroup>
                                        </Col>
                                        <Col xs="1" className="" style={{ marginTop: '32px' }}>
                                            <i class="fa fa-minus" aria-hidden="true"></i>
                                        </Col>
                                        <Col xs="5" className="pr-0">
                                            <FormGroup className="pt-2">
                                                <Label htmlFor="company"></Label>
                                                <Input
                                                    onBlur={handleBlur}
                                                    bsSize="sm"
                                                    onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                                    type="text"
                                                    value={this.props.items.program.programCode}
                                                    maxLength={6}
                                                    name="programCode1" id="programCode1" />
                                            </FormGroup>
                                        </Col>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.program.program')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.programName && this.props.items.program.label.label_en != ''}
                                            invalid={touched.programName && !!errors.programName}
                                            type="text" name="programName"
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            value={this.props.items.program.label.label_en}
                                            id="programName" />
                                        <FormFeedback className="red">{errors.programName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="select">{i18n.t('static.program.programmanager')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.userId && this.props.items.program.programManager.userId != ''}
                                            invalid={touched.userId && !!errors.userId}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="select" name="userId" id="userId"
                                            value={this.props.items.program.programManager.userId}
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {programManagers}
                                        </Input>
                                        <FormFeedback className="red">{errors.userId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.program.airfreightperc')} (%)<span class="red ">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.airFreightPerc && this.props.items.program.airFreightPerc != ''}
                                            invalid={touched.airFreightPerc && !!errors.airFreightPerc}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            value={this.props.items.program.airFreightPerc}
                                            name="airFreightPerc" id="airFreightPerc"
                                        />
                                        <FormFeedback className="red">{errors.airFreightPerc}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.program.seafreightperc')} (%)<span class="red ">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.seaFreightPerc && this.props.items.program.seaFreightPerc != ''}
                                            invalid={touched.seaFreightPerc && !!errors.seaFreightPerc}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            value={this.props.items.program.seaFreightPerc}
                                            name="seaFreightPerc" id="seaFreightPerc" />
                                        <FormFeedback className="red">{errors.seaFreightPerc}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.program.roadfreightperc')} (%)<span class="red ">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.roadFreightPerc && this.props.items.program.roadFreightPerc != ''}
                                            invalid={touched.roadFreightPerc && !!errors.roadFreightPerc}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            value={this.props.items.program.roadFreightPerc}
                                            name="roadFreightPerc" id="roadFreightPerc" />
                                        <FormFeedback className="red">{errors.roadFreightPerc}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.program.planleadtime')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.plannedToSubmittedLeadTime && this.props.items.program.plannedToSubmittedLeadTime != ''}
                                            invalid={touched.plannedToSubmittedLeadTime && !!errors.plannedToSubmittedLeadTime}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            value={this.props.items.program.plannedToSubmittedLeadTime}
                                            name="plannedToSubmittedLeadTime" id="plannedToSubmittedLeadTime" />
                                        <FormFeedback className="red">{errors.plannedToSubmittedLeadTime}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.program.submittoapproveleadtime')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.submittedToApprovedLeadTime && this.props.items.program.submittedToApprovedLeadTime != ''}
                                            invalid={touched.submittedToApprovedLeadTime && !!errors.submittedToApprovedLeadTime}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            value={this.props.items.program.submittedToApprovedLeadTime}
                                            name="submittedToApprovedLeadTime" id="submittedToApprovedLeadTime" />
                                        <FormFeedback className="red">{errors.submittedToApprovedLeadTime}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.program.approvetoshipleadtime')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.approvedToShippedLeadTime && this.props.items.program.approvedToShippedLeadTime != ''}
                                            invalid={touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            value={this.props.items.program.approvedToShippedLeadTime}
                                            name="approvedToShippedLeadTime" id="approvedToShippedLeadTime" />
                                        <FormFeedback className="red">{errors.approvedToShippedLeadTime}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.realmcountry.shippedToArrivedSeaLeadTime')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.shippedToArrivedBySeaLeadTime && this.props.items.program.shippedToArrivedBySeaLeadTime != ''}
                                            invalid={touched.shippedToArrivedBySeaLeadTime && !!errors.shippedToArrivedBySeaLeadTime}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            value={this.props.items.program.shippedToArrivedBySeaLeadTime}
                                            name="shippedToArrivedBySeaLeadTime" id="shippedToArrivedBySeaLeadTime" />
                                        <FormFeedback className="red">{errors.shippedToArrivedBySeaLeadTime}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.realmcountry.shippedToArrivedAirLeadTime')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.shippedToArrivedByAirLeadTime && this.props.items.program.shippedToArrivedByAirLeadTime != ''}
                                            invalid={touched.shippedToArrivedByAirLeadTime && !!errors.shippedToArrivedByAirLeadTime}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            value={this.props.items.program.shippedToArrivedByAirLeadTime}
                                            name="shippedToArrivedByAirLeadTime" id="shippedToArrivedByAirLeadTime" />
                                        <FormFeedback className="red">{errors.shippedToArrivedByAirLeadTime}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.realmcountry.shippedToArrivedRoadLeadTime')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.shippedToArrivedByRoadLeadTime && this.props.items.program.shippedToArrivedByRoadLeadTime != ''}
                                            invalid={touched.shippedToArrivedByRoadLeadTime && !!errors.shippedToArrivedByRoadLeadTime}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            value={this.props.items.program.shippedToArrivedByRoadLeadTime}
                                            name="shippedToArrivedByRoadLeadTime" id="shippedToArrivedByRoadLeadTime" />
                                        <FormFeedback className="red">{errors.shippedToArrivedByRoadLeadTime}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.realmcountry.arrivedToDeliveredLeadTime')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.arrivedToDeliveredLeadTime && this.props.items.program.arrivedToDeliveredLeadTime != ''}
                                            invalid={touched.arrivedToDeliveredLeadTime && !!errors.arrivedToDeliveredLeadTime}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            value={this.props.items.program.arrivedToDeliveredLeadTime}
                                            name="arrivedToDeliveredLeadTime" id="arrivedToDeliveredLeadTime" />
                                        <FormFeedback className="red">{errors.arrivedToDeliveredLeadTime}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.program.monthpastamc')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.monthsInPastForAmc && this.props.items.program.monthsInPastForAmc != ''}
                                            invalid={touched.monthsInPastForAmc && !!errors.monthsInPastForAmc}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            value={this.props.items.program.monthsInPastForAmc}
                                            name="monthsInPastForAmc" id="monthsInPastForAmc" />
                                        <FormFeedback className="red">{errors.monthsInPastForAmc}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.program.monthfutureamc')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.monthsInFutureForAmc && this.props.items.program.monthsInFutureForAmc != ''}
                                            invalid={touched.monthsInFutureForAmc && !!errors.monthsInFutureForAmc}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            value={this.props.items.program.monthsInFutureForAmc}
                                            name="monthsInFutureForAmc" id="monthsInFutureForAmc" />
                                        <FormFeedback className="red">{errors.monthsInFutureForAmc}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.report.shelfLife')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.shelfLife && this.props.items.program.shelfLife != ''}
                                            invalid={touched.shelfLife && !!errors.shelfLife}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            value={this.props.items.program.shelfLife}
                                            name="shelfLife" id="shelfLife" />
                                        <FormFeedback className="red">{errors.shelfLife}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="select">{i18n.t('static.program.notes')}</Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.programNotes && this.props.items.program.programNotes != ''}
                                            invalid={touched.programNotes && !!errors.programNotes}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="textarea"
                                            name="programNotes"
                                            id="programNotes"
                                            value={this.props.items.program.programNotes} />
                                        <FormFeedback className="red">{errors.programNotes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-12">
                                        <ul id="progress">
                                            <li>
                                                <i ><img className="img-left" src={step1} /></i>
                                                <i ><img className="img-right" src={step2} /></i>
                                                <span>{i18n.t('static.setupprogram.PlannedtoSubmitted')}</span>
                                            </li>
                                            <li>
                                                <i ><img className="img-right" src={step3} /></i>
                                                <span>{i18n.t('static.setupprogram.SubmittedtoApproved')}</span>
                                            </li>
                                            <li>
                                                <i ><img className="img-right" src={step4} /></i>
                                                <span>{i18n.t('static.setupprogram.ApprovedtoShipped')}</span>
                                            </li>
                                            <li>
                                                <i ><img className="img-right" src={step5} /></i>
                                                <span>{i18n.t('static.setupprogram.ShippedtoArrived')}</span>
                                            </li>
                                            <li>
                                                <i ><img className="img-right" src={step6} /></i>
                                                <span>{i18n.t('static.setupprogram.ArrivedtoReceived')}</span>
                                            </li>
                                        </ul>
                                    </FormGroup>
                                    <FormGroup className="col-md-12">
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="regionPrevious" id="regionPrevious" onClick={this.props.backToprogramInfoStepFour} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="submit" name="regionSub" id="regionSub">{i18n.t('static.pipeline.save')} <i className="fa fa-angle-double-right"></i></Button>
                                    </FormGroup>
                                </Row>
                            </Form>
                        )} />
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}