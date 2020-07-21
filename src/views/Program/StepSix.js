import React, { Component } from 'react';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from "../../api/ProgramService";
import { Formik } from 'formik';
import * as Yup from 'yup'
import {
    Button, FormFeedback, CardBody, Row,
    Form, FormGroup, Label, Input,
} from 'reactstrap';

const initialValuesSix = {
    programName: '',
    userId: '',
    airFreightPerc: '',
    seaFreightPerc: '',
    // deliveredToReceivedLeadTime: '',
    draftToSubmittedLeadTime: '',
    plannedToDraftLeadTime: '',
    submittedToApprovedLeadTime: '',
    approvedToShippedLeadTime: '',
    monthsInFutureForAmc: '',
    monthsInPastForAmc: '',
    // healthAreaId: '',
    programNotes: '',
    shippedToArrivedByAirLeadTime: '',
    shippedToArrivedBySeaLeadTime: '',
    arrivedToDeliveredLeadTime: ''

}

const validationSchemaSix = function (values) {
    return Yup.object().shape({
        programName: Yup.string()
            .required(i18n.t('static.program.validprogramtext')),
        userId: Yup.string()
            .required(i18n.t('static.program.validmanagertext')),
        airFreightPerc: Yup.number().typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.program.validairfreighttext')).min(0, i18n.t('static.program.validvaluetext')),
        seaFreightPerc: Yup.number().typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.program.validseafreighttext')).min(0, i18n.t('static.program.validvaluetext')),
        // deliveredToReceivedLeadTime: Yup.number().typeError(i18n.t('static.procurementUnit.validNumberText'))
        // .required(i18n.t('static.program.validdelivertoreceivetext')).min(0, i18n.t('static.program.validvaluetext')),
        draftToSubmittedLeadTime: Yup.number().typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.program.validdrafttosubmittext')).min(0, i18n.t('static.program.validvaluetext')),
        plannedToDraftLeadTime: Yup.number().typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.program.validplantodrafttext')).min(0, i18n.t('static.program.validvaluetext')),
        submittedToApprovedLeadTime: Yup.number().typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.program.validsubmittoapprovetext')).min(0, i18n.t('static.program.validvaluetext')),
        approvedToShippedLeadTime: Yup.number().typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.program.validapprovetoshiptext')).min(0, i18n.t('static.program.validvaluetext')),
        monthsInFutureForAmc: Yup.number().typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.program.validfutureamctext')).min(0, i18n.t('static.program.validvaluetext')),
        monthsInPastForAmc: Yup.number().typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.program.validpastamctext')).min(0, i18n.t('static.program.validvaluetext')),
        // healthAreaId: Yup.string()
        //     .required(i18n.t('static.program.validhealthareatext')),
        // programNotes: Yup.string()
        //     .required(i18n.t('static.program.validnotestext')),
        shippedToArrivedByAirLeadTime: Yup.number().typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.program.validdrafttosubmittext')).min(0, i18n.t('static.program.validvaluetext')),
        shippedToArrivedBySeaLeadTime: Yup.number().typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.program.validdrafttosubmittext')).min(0, i18n.t('static.program.validvaluetext')),
        arrivedToDeliveredLeadTime: Yup.number().typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.program.validdrafttosubmittext')).min(0, i18n.t('static.program.validvaluetext')),

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
            draftToSubmittedLeadTime: true,
            plannedToDraftLeadTime: true,
            submittedToApprovedLeadTime: true,
            approvedToShippedLeadTime: true,
            monthsInFutureForAmc: true,
            monthsInPastForAmc: true,
            // healthAreaId: true,
            // programNotes: true,
            shippedToArrivedByAirLeadTime: true,
            shippedToArrivedBySeaLeadTime: true,
            arrivedToDeliveredLeadTime: true

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

    getProgramManagerList() {

        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramManagerList(document.getElementById('realmId').value)
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        programManagerList: response.data
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
                            <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='programDataForm'>
                                <Row>
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
                                            id="programName" placeholder={i18n.t('static.program.programtext')} />
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
                                        <Label htmlFor="company">{i18n.t('static.program.monthpastamc')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.monthsInPastForAmc && this.props.items.program.monthsInPastForAmc != ''}
                                            invalid={touched.monthsInPastForAmc && !!errors.monthsInPastForAmc}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            name="monthsInPastForAmc" id="monthsInPastForAmc" placeholder={i18n.t('static.program.monthpastamctext')} />
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
                                            name="monthsInFutureForAmc" id="monthsInFutureForAmc" placeholder={i18n.t('static.program.monthfutureamctext')} />
                                        <FormFeedback className="red">{errors.monthsInFutureForAmc}</FormFeedback>
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
                                            name="airFreightPerc" id="airFreightPerc" placeholder={i18n.t('static.program.airfreightperctext')} />
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
                                            name="seaFreightPerc" id="seaFreightPerc" placeholder={i18n.t('static.program.seafreightperc')} />
                                        <FormFeedback className="red">{errors.seaFreightPerc}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.program.planleadtime')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.plannedToDraftLeadTime && this.props.items.program.plannedToDraftLeadTime != ''}
                                            invalid={touched.plannedToDraftLeadTime && !!errors.plannedToDraftLeadTime}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            name="plannedToDraftLeadTime" id="plannedToDraftLeadTime" placeholder={i18n.t('static.program.draftleadtext')} />
                                        <FormFeedback className="red">{errors.plannedToDraftLeadTime}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">{i18n.t('static.program.drafttosubmitleadtime')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.draftToSubmittedLeadTime && this.props.items.program.draftToSubmittedLeadTime != ''}
                                            invalid={touched.draftToSubmittedLeadTime && !!errors.draftToSubmittedLeadTime}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            name="draftToSubmittedLeadTime" id="draftToSubmittedLeadTime" placeholder={i18n.t('static.program.drafttosubmittext')} />
                                        <FormFeedback className="red">{errors.draftToSubmittedLeadTime}</FormFeedback>
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
                                            name="submittedToApprovedLeadTime" id="submittedToApprovedLeadTime" placeholder={i18n.t('static.program.submittoapprovetext')} />
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
                                            name="approvedToShippedLeadTime" id="approvedToShippedLeadTime" placeholder={i18n.t('static.program.approvetoshiptext')} />
                                        <FormFeedback className="red">{errors.approvedToShippedLeadTime}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">Shipped To Arrive By Air Lead Time<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.shippedToArrivedByAirLeadTime && this.props.items.program.shippedToArrivedByAirLeadTime != ''}
                                            invalid={touched.shippedToArrivedByAirLeadTime && !!errors.shippedToArrivedByAirLeadTime}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            name="shippedToArrivedByAirLeadTime" id="shippedToArrivedByAirLeadTime" placeholder='please enter shipped to arrived by air lead time' />
                                        <FormFeedback className="red">{errors.shippedToArrivedByAirLeadTime}</FormFeedback>
                                    </FormGroup>

            
            
                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company">Shipped To Arrive By Sea Lead Time<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.shippedToArrivedBySeaLeadTime && this.props.items.program.shippedToArrivedBySeaLeadTime != ''}
                                            invalid={touched.shippedToArrivedBySeaLeadTime && !!errors.shippedToArrivedBySeaLeadTime}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            name="shippedToArrivedBySeaLeadTime" id="shippedToArrivedBySeaLeadTime" placeholder='please enter shipped to arrived by sea lead time' />
                                        <FormFeedback className="red">{errors.shippedToArrivedBySeaLeadTime}</FormFeedback>
                                    </FormGroup>


                                    <FormGroup className="col-md-6">
                                        <Label htmlFor="company"> Arrived to deliver Lead Time<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            onBlur={handleBlur}
                                            valid={!errors.arrivedToDeliveredLeadTime && this.props.items.program.arrivedToDeliveredLeadTime != ''}
                                            invalid={touched.arrivedToDeliveredLeadTime && !!errors.arrivedToDeliveredLeadTime}
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                            type="number"
                                            min="0"
                                            name="arrivedToDeliveredLeadTime" id="arrivedToDeliveredLeadTime" placeholder='please enter shipped to arrived to delivered lead time' />
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
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="regionPrevious" id="regionPrevious" onClick={this.props.previousToStepFive} > <i className="fa fa-angle-double-left"></i> Back</Button>
                                        &nbsp;
                                         <Button color="info" size="md" className="float-left mr-1" type="submit" name="regionSub" id="regionSub" onClick={() => this.touchAllSix(setTouched, errors)} disabled={!isValid}>Next <i className="fa fa-angle-double-right"></i></Button>

                                    </FormGroup>
                                </Row>
                            </Form>
                        )} />


        );
    }
}