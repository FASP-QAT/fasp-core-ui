import React, { Component } from 'react';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from "../../api/ProgramService";
import { Formik } from 'formik';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import Setupprogram from '../../assets/img/SetupProgram.png'
import { PLANNED_TO_SUBMITTED, SUBMITTED_TO_APPROVED, APPROVED_TO_SHIPPED, SHIPPED_TO_ARRIVED_AIR, SHIPPED_TO_ARRIVED_SEA, ARRIVED_TO_RECEIVED } from "../../Constants";
// import Setupprogram from '../../assets/img/setup-program-img.jpg'
import step1 from '../../assets/img/1-step.png'
import step2 from '../../assets/img/2-step.png'
import step3 from '../../assets/img/3-step.png'
import step4 from '../../assets/img/4-step.png'
import step5 from '../../assets/img/5-step.png'
import step6 from '../../assets/img/6-step.png'
import * as Yup from 'yup'
import {
    Button, FormFeedback, CardBody, Row,
    Form, FormGroup, Label, Input, Col,
} from 'reactstrap';

const initialValuesSix = {
    programName: '',
    userId: '',
    airFreightPerc: '',
    seaFreightPerc: '',
    // deliveredToReceivedLeadTime: '',
    plannedToSubmittedLeadTime: PLANNED_TO_SUBMITTED,
    submittedToApprovedLeadTime: SUBMITTED_TO_APPROVED,
    approvedToShippedLeadTime: APPROVED_TO_SHIPPED,
    // healthAreaId: '',
    programNotes: '',
    shippedToArrivedByAirLeadTime: SHIPPED_TO_ARRIVED_AIR,
    shippedToArrivedBySeaLeadTime: SHIPPED_TO_ARRIVED_SEA,
    arrivedToDeliveredLeadTime: ARRIVED_TO_RECEIVED,
    programCode: '',
    programCode1: ''

}

const validationSchemaSix = function (values) {
    return Yup.object().shape({
        programName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.program.validprogramtext')),
        userId: Yup.string()
            .required(i18n.t('static.program.validmanagertext')),
        airFreightPerc: Yup.string()
            // .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount'))
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.validairfreighttext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        seaFreightPerc: Yup.string()
            // .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount'))
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.validseafreighttext'))
            .min(0, i18n.t('static.program.validvaluetext')),

        // deliveredToReceivedLeadTime: Yup.number().typeError(i18n.t('static.procurementUnit.validNumberText'))
        // .required(i18n.t('static.program.validdelivertoreceivetext')).min(0, i18n.t('static.program.validvaluetext')),
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
        // healthAreaId: Yup.string()
        //     .required(i18n.t('static.program.validhealthareatext')),
        // programNotes: Yup.string()
        //     .required(i18n.t('static.program.validnotestext')),
        shippedToArrivedByAirLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.realmcountry.shippedToArrivedAirLeadTimetext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        shippedToArrivedBySeaLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.realmcountry.shippedToArrivedSeaLeadTimetext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        arrivedToDeliveredLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.arrivedToReceivedLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext')),
        // uniqueCode: Yup.string()
        //     .matches(/^[a-zA-Z0-9_'\/-]*$/, i18n.t('static.common.alphabetNumericCharOnly'))
        //     .required(i18n.t('static.programOnboarding.validprogramCode')),

        programCode1: Yup.string()
            .test('programCode', i18n.t('static.programValidation.programCode'),
                function (value) {
                    if (parseInt(document.getElementById("programCode").value.length + value.length) > 45) {
                        return false;
                    } else {
                        return true;
                    }
                }),
    })
}

const validateSix = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationErrorSix(error)
        }
    }
}

const getErrorsFromValidationErrorSix = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}

export default class StepSix extends Component {

    constructor(props) {
        super(props);
        this.state = {
            programManagerList: []
        }

    }

    touchAllSix(setTouched, errors) {
        setTouched({
            programName: true,
            userId: true,
            airFreightPerc: true,
            seaFreightPerc: true,
            // deliveredToReceivedLeadTime: true,
            plannedToSubmittedLeadTime: true,
            submittedToApprovedLeadTime: true,
            approvedToShippedLeadTime: true,
            // healthAreaId: true,
            // programNotes: true,
            shippedToArrivedByAirLeadTime: true,
            shippedToArrivedBySeaLeadTime: true,
            arrivedToDeliveredLeadTime: true,
            programCode1: true,
            // uniqueCode: true,
            message: ''

        }
        )
        this.validateFormSix(errors)
    }
    validateFormSix(errors) {
        this.findFirstErrorSix('programDataForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstErrorSix(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }

    componentDidMount() {
        // console.log("SIX------", this.props.items.realmCountryCode);
    }

    getProgramManagerList() {

        // AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramManagerList(this.props.items.program.realm.realmId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.username.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.username.toUpperCase(); // ignore upper and lowercase                   
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

    }

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
                validate={validateSix(validationSchemaSix)}
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
                        setTouched
                    }) => (
                        <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='programDataForm' autocomplete="off">
                            <Row>

                                {/* <FormGroup row >
                                       
                                            <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.program.programCode')}</Label>
                                        <Input
                                            type="text" name="programCode"
                                            bsSize="sm"
                                            disabled
                                            value={this.props.items.realmCountryCode + "-" + this.props.items.healthAreaCode + "-" + this.props.items.organisationCode + "-"}
                                            id="programCode" />
                                        <FormFeedback className="red">{errors.programCode}</FormFeedback>
                                        </FormGroup>
                                       
                                        <FormGroup className="col-md-6">
                                        <Label htmlFor="company"></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            // valid={!errors.airFreightPerc && this.props.items.program.airFreightPerc != ''}
                                            // invalid={touched.airFreightPerc && !!errors.airFreightPerc}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="text"
                                            maxLength={6}
                                            name="programCode1" id="programCode1" />
                                        <FormFeedback className="red">{errors.programCode1}</FormFeedback>
                                    </FormGroup>
                                        
                                 </FormGroup> */}

                                <FormGroup style={{ display: 'flex' }} className="col-md-6">
                                    <Col xs="6" className="pl-0">
                                        <FormGroup >
                                            <Label htmlFor="company">{i18n.t('static.program.programCode')}</Label>
                                            <Input
                                                type="text" name="programCode"
                                                bsSize="sm"
                                                valid={!errors.programCode1}
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
                                                // valid={!errors.programCode1}
                                                // invalid={touched.programCode1 && !!errors.programCode1}
                                                bsSize="sm"
                                                onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                                type="text"
                                                maxLength={6}
                                                value={this.props.items.program.programCode}
                                                name="programCode1" id="programCode1" />
                                            {/* <FormFeedback className="red">{errors.programCode1}</FormFeedback> */}
                                        </FormGroup>
                                    </Col>
                                </FormGroup>

                                {/* <FormGroup className="col-md-6">
                                        <Label htmlFor="company"></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            // valid={!errors.airFreightPerc && this.props.items.program.airFreightPerc != ''}
                                            // invalid={touched.airFreightPerc && !!errors.airFreightPerc}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="text"
                                            maxLength={6}
                                            name="programCode1" id="programCode1" />
                                        <FormFeedback className="red">{errors.programCode1}</FormFeedback>
                                    </FormGroup> */}

                                <FormGroup className="col-md-6">
                                    <Label htmlFor="company">{i18n.t('static.program.program')}<span class="red Reqasterisk">*</span></Label>
                                    <Input
                                        onBlur={handleBlur}
                                        valid={!errors.programName && this.props.items.program.label.label_en != ''}
                                        invalid={touched.programName && !!errors.programName}
                                        type="text" name="programName"
                                        bsSize="sm"
                                        onChange={(e) => { handleChange(e); this.props.dataChange(e); this.props.Capitalize(e.target.value) }}
                                        // value={this.state.program.label.label_en}
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
                                        name="airFreightPerc" id="airFreightPerc" />
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
                                        name="seaFreightPerc" id="seaFreightPerc" />
                                    <FormFeedback className="red">{errors.seaFreightPerc}</FormFeedback>
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
                                        // maxLength={600}
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




                                    {/* <img src={Setupprogram} style={{ width: '500px'}} /> */}
                                </FormGroup>

                                <FormGroup className="col-md-12">
                                    <Button color="info" size="md" className="float-left mr-1" type="button" name="regionPrevious" id="regionPrevious" onClick={this.props.previousToStepFive} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                    &nbsp;
                                    <Button color="info" size="md" className="float-left mr-1" type="submit" name="regionSub" id="regionSub" onClick={() => this.touchAllSix(setTouched, errors)} disabled={!isValid}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>

                                </FormGroup>
                            </Row>
                        </Form>
                    )} />

            // </>
        );

    }
}