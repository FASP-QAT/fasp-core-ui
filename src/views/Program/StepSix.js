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
import { MAX_PROGRAM_CODE_LENGTH } from "../../Constants";
import ProgramService from "../../api/ProgramService";
import step1 from '../../assets/img/1-step.png';
import step2 from '../../assets/img/2-step.png';
import step3 from '../../assets/img/3-step.png';
import step4 from '../../assets/img/4-step.png';
import step5 from '../../assets/img/5-step.png';
import step6 from '../../assets/img/6-step.png';
import i18n from '../../i18n';
import Select from 'react-select';
import classNames from 'classnames';
import DropdownService from '../../api/DropdownService';
import getLabelText from '../../CommonComponent/getLabelText';
// Initial values for form fields
const initialValuesSix = {
    programName: '',
    userId: '',
    airFreightPerc: '',
    seaFreightPerc: '',
    roadFreightPerc: '',
    plannedToSubmittedLeadTime: '',
    submittedToApprovedLeadTime: '',
    approvedToShippedLeadTime: '',
    programNotes: '',
    shippedToArrivedByAirLeadTime: '',
    shippedToArrivedBySeaLeadTime: '',
    shippedToArrivedByRoadLeadTime: '',
    arrivedToDeliveredLeadTime: '',
    programCode: '',
    programCode1: '',
    procurementAgents: [],
    fundingSources:[],
    noOfMonthsInPastForBottomDashboard: '',
}
/**
 * Defines the validation schema for step six of program onboarding.
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
        shippedToArrivedByAirLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.realmcountry.shippedToArrivedAirLeadTimetext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        shippedToArrivedBySeaLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.realmcountry.shippedToArrivedSeaLeadTimetext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        shippedToArrivedByRoadLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.realmcountry.shippedToArrivedRoadLeadTimetext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        arrivedToDeliveredLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.arrivedToReceivedLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext')),
        programCode1: Yup.string()
            .test('programCode', i18n.t('static.programValidation.programCode'),
                function (value) {
                    if (parseInt(document.getElementById("programCode").value.length + (value ? value.length : 0)) > MAX_PROGRAM_CODE_LENGTH) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        procurementAgents: Yup.string()
            .required(i18n.t('static.procurementAgent.selectProcurementAgent')),        
        fundingSources: Yup.string()
            .required(i18n.t('static.budget.fundingtext')),            
        noOfMonthsInPastForBottomDashboard: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
    })
}
/**
 * Component for program Onboarding step six for taking the program details
 */
export default class StepSix extends Component {
    constructor(props) {
        super(props);
        this.state = {
            programManagerList: [],
            procurementAgentList: [],
            fundingSourceList: [],
            procurementAgents:'',
            fundingSources:''
        }
    }
    /**
     * Reterived the program managers list from server
     */
    getProgramManagerList() {
        ProgramService.getProgramManagerList(this.props.items.program.realm.realmId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.username.toUpperCase();
                        var itemLabelB = b.username.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        programManagerList: listArray
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
            DropdownService.getProcurementAgentDropdownList()
            .then(response => {
                if (response.status == 200) {
                    var json = response.data;
                    var paList = [{ value: "-1", label: i18n.t("static.common.all") }];
                    for (var i = 0; i < json.length; i++) {
                        paList[i + 1] = { value: json[i].id, label: getLabelText(json[i].label, this.state.lang) }
                    }
                    var listArray = paList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase(); 
                        var itemLabelB = b.label.toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        procurementAgentList: listArray
                    })
                    this.props.updateStepOneData("procurementAgentList", listArray);//for dropdown usage
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })

            DropdownService.getFundingSourceDropdownList()
            .then(response => {
                if (response.status == 200) {
                    var json = response.data;
                    var fsList = [{ value: "-1", label: i18n.t("static.common.all") }];
                    for (var i = 0; i < json.length; i++) {
                        fsList[i + 1] = { value: json[i].id, label: getLabelText(json[i].label, this.state.lang) }
                    }
                    var listArray = fsList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase(); 
                        var itemLabelB = b.label.toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        fundingSourceList: listArray
                    })
                    this.props.updateStepOneData("fundingSourceList", listArray);//for dropdown usage
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
    }
    /**
     * Renders the program onboarding step six screen.
     * @returns {JSX.Element} - Program onboarding step six screen.
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
            <Formik
                enableReinitialize={true}
                initialValues={initialValuesSix}
                validationSchema={validationSchemaSix}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                    this.props.finishedStepSix && this.props.finishedStepSix();
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
                        setFieldValue,
                        setFieldTouched
                    }) => (
                        <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='programDataForm' autocomplete="off">
                            <Row>
                                <FormGroup style={{ display: 'flex' }} className="col-md-6">
                                    <Col xs="6" className="pl-0">
                                        <FormGroup >
                                            <Label htmlFor="company">{i18n.t('static.program.programCode')}</Label>
                                            <Input
                                                type="text" name="programCode"
                                                bsSize="sm"
                                                valid={!errors.programCode1 && this.props.items.program.programCode != ''}
                                                invalid={touched.programCode1 && !!errors.programCode1}
                                                disabled
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
                                                maxLength={6}
                                                value={this.props.items.program.programCode}
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
                                        onChange={(e) => { handleChange(e); this.props.dataChange(e); this.props.Capitalize(e.target.value) }}
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
                                        type="select" name="userId" id="userId">
                                        <option value="">{i18n.t('static.common.select')}</option>
                                        {programManagers}
                                    </Input>
                                    <FormFeedback className="red">{errors.userId}</FormFeedback>
                                </FormGroup>
                                <div className="col-md-6">
                                <Label htmlFor="select">{i18n.t('static.realm.noOfMonthsInPastForBottomDashboard')}</Label>
                                    <Input type="number"
                                        name="noOfMonthsInPastForBottomDashboard"
                                        id="noOfMonthsInPastForBottomDashboard"
                                        bsSize="sm"
                                        valid={!errors.noOfMonthsInPastForBottomDashboard}
                                        invalid={touched.noOfMonthsInPastForBottomDashboard && !!errors.noOfMonthsInPastForBottomDashboard}
                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                        onBlur={handleBlur}
                                        value={this.props.items.program.noOfMonthsInPastForBottomDashboard}
                                    />
                                    <FormFeedback className="red">{errors.noOfMonthsInPastForBottomDashboard}</FormFeedback>
                                </div>

                                <FormGroup className="Selectcontrol-bdrNone col-md-6 h-100">
                                    <Label htmlFor="select">{i18n.t('static.procurementagent.procurementagent')}<span class="red Reqasterisk">*</span></Label>
                                    <Select
                                        className={classNames('form-control', 'col-md-12', 'd-block', 'w-100', 'bg-light',
                                            { 'is-valid': !errors.procurementAgents && this.props.items.program.procurementAgents.length != 0 },
                                            { 'is-invalid': (touched.procurementAgents && !!errors.procurementAgents) }
                                        )}
                                        bsSize="sm"
                                        onChange={(e) => {
                                            handleChange(e);
                                            setFieldValue("procurementAgents", e);
                                            this.props.updateFieldDataProcurementAgent(e);
                                        }}
                                        onBlur={() => setFieldTouched("procurementAgents", true)}
                                        multi
                                        options={this.state.procurementAgentList}
                                        value={this.props.items.program.procurementAgents}
                                    />
                                    <FormFeedback>{errors.procurementAgents}</FormFeedback>
                                </FormGroup>
                                <FormGroup className="Selectcontrol-bdrNone col-md-6 h-100">
                                    <Label htmlFor="select">{i18n.t('static.budget.fundingsource')}<span class="red Reqasterisk">*</span></Label>
                                    <Select
                                        className={classNames('form-control', 'col-md-12', 'd-block', 'w-100', 'bg-light',
                                            { 'is-valid': !errors.fundingSources && this.props.items.program.fundingSources.length != 0 },
                                            { 'is-invalid': (touched.fundingSources && !!errors.fundingSources) }
                                        )}
                                        bsSize="sm"
                                        onChange={(e) => {
                                            handleChange(e);
                                            setFieldValue("fundingSources", e);
                                            this.props.updateFieldDataFundingSource(e);
                                        }}
                                        onBlur={() => setFieldTouched("fundingSources", true)}
                                        multi
                                        options={this.state.fundingSourceList}
                                        value={this.props.items.program.fundingSources}
                                    />
                                    <FormFeedback>{errors.fundingSources}</FormFeedback>
                                </FormGroup>

                                <FormGroup className="col-md-4">
                                    <Label htmlFor="company">{i18n.t('static.program.airfreightperc')} (%)<span class="red ">*</span></Label>
                                    <Input
                                        onBlur={handleBlur}
                                        valid={!errors.airFreightPerc && this.props.items.program.airFreightPerc != ''}
                                        invalid={touched.airFreightPerc && !!errors.airFreightPerc}
                                        bsSize="sm"
                                        onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                        type="number"
                                        min="0"
                                        name="airFreightPerc" id="airFreightPerc" />
                                    <FormFeedback className="red">{errors.airFreightPerc}</FormFeedback>
                                </FormGroup>
                                <FormGroup className="col-md-4">
                                    <Label htmlFor="company">{i18n.t('static.program.seafreightperc')} (%)<span class="red ">*</span></Label>
                                    <Input
                                        onBlur={handleBlur}
                                        valid={!errors.seaFreightPerc && this.props.items.program.seaFreightPerc != ''}
                                        invalid={touched.seaFreightPerc && !!errors.seaFreightPerc}
                                        bsSize="sm"
                                        onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                        type="number"
                                        min="0"
                                        name="seaFreightPerc" id="seaFreightPerc" />
                                    <FormFeedback className="red">{errors.seaFreightPerc}</FormFeedback>
                                </FormGroup>
                                <FormGroup className="col-md-4">
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
                                <FormGroup className="col-md-4">
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
                                <FormGroup className="col-md-4">
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
                                <FormGroup className="col-md-4">
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
                                <FormGroup className="col-md-4">
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
                                <FormGroup className="col-md-4">
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
                                <FormGroup className="col-md-4">
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
                                    <Label htmlFor="company"> {i18n.t('static.realmcountry.arrivedToDeliveredLeadTime')}<span class="red Reqasterisk">*</span></Label>
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
                                    <Label htmlFor="select">{i18n.t('static.program.notes')}</Label>
                                    <Input
                                        onBlur={handleBlur}
                                        valid={!errors.programNotes && this.props.items.program.programNotes != ''}
                                        invalid={touched.programNotes && !!errors.programNotes}
                                        bsSize="sm"
                                        onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                        type="textarea" name="programNotes" id="programNotes" />
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
                                    <Button color="info" size="md" className="float-left mr-1" type="button" name="regionPrevious" id="regionPrevious" onClick={this.props.previousToStepFive} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                    &nbsp;
                                    <Button color="info" size="md" className="float-left mr-1" type="submit" name="regionSub" id="regionSub" >{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                </FormGroup>
                            </Row>
                        </Form>
                    )} />
        );
    }
}