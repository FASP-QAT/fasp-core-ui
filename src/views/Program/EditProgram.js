import React, { Component } from "react";
import {
    Row, Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Col, FormFeedback, Form
} from 'reactstrap';
import Select from 'react-select';
import { Formik } from 'formik';
import * as Yup from 'yup';
import '../Forms/ValidationForms/ValidationForms.css';
import 'react-select/dist/react-select.min.css';
import ProgramService from "../../api/ProgramService";
import { lang } from "moment";
import i18n from "../../i18n"
import HealthAreaService from "../../api/HealthAreaService";
import getLabelText from '../../CommonComponent/getLabelText'
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'


const entityname = i18n.t('static.program.programMaster');
let initialValues = {
    programName: '',
    realmId: '',
    realmCountryId: '',
    organisationId: '',
    userId: '',
    airFreightPerc: '',
    seaFreightPerc: '',
    // deliveredToReceivedLeadTime: '',
    draftToSubmittedLeadTime: '',
    plannedToDraftLeadTime: '',
    submittedToApprovedLeadTime: '',
    approvedToShippedLeadTime: '',
    shippedToArrivedByAirLeadTime: '',
    shippedToArrivedBySeaLeadTime: '',
    arrivedToDeliveredLeadTime: '',
    monthsInFutureForAmc: '',
    monthsInPastForAmc: '',
    healthAreaId: '',
    programNotes: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        programName: Yup.string()
            .required(i18n.t('static.program.validprogramtext')),
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        realmCountryId: Yup.string()
            .required(i18n.t('static.program.validcountrytext')),
        organisationId: Yup.string()
            .required(i18n.t('static.program.validorganisationtext')),
        userId: Yup.string()
            .required(i18n.t('static.program.validmanagertext')),
        airFreightPerc: Yup.string()
            .required(i18n.t('static.program.validairfreighttext')).min(0, i18n.t('static.program.validvaluetext')),
        seaFreightPerc: Yup.string()
            .required(i18n.t('static.program.validseafreighttext')).min(0, i18n.t('static.program.validvaluetext')),
        // deliveredToReceivedLeadTime: Yup.number()
        //     .required(i18n.t('static.program.validdelivertoreceivetext')).min(0, i18n.t('static.program.validvaluetext')),
        draftToSubmittedLeadTime: Yup.string()
            .required(i18n.t('static.program.validdrafttosubmittext')).min(0, i18n.t('static.program.validvaluetext')),
        plannedToDraftLeadTime: Yup.string()
            .required(i18n.t('static.program.validplantodrafttext')).min(0, i18n.t('static.program.validvaluetext')),
        submittedToApprovedLeadTime: Yup.string()
            .required(i18n.t('static.program.validsubmittoapprovetext')).min(0, i18n.t('static.program.validvaluetext')),
        approvedToShippedLeadTime: Yup.string()
            .required(i18n.t('static.program.validapprovetoshiptext')).min(0, i18n.t('static.program.validvaluetext')),
        shippedToArrivedByAirLeadTime: Yup.string()
            .required(i18n.t('static.program.validapprovetoshiptext')).min(0, i18n.t('static.program.validvaluetext')),
        shippedToArrivedBySeaLeadTime: Yup.string()
            .required(i18n.t('static.program.validapprovetoshiptext')).min(0, i18n.t('static.program.validvaluetext')),
        arrivedToDeliveredLeadTime: Yup.string()
            .required(i18n.t('static.program.validapprovetoshiptext')).min(0, i18n.t('static.program.validvaluetext')),
        monthsInFutureForAmc: Yup.string()
            .required(i18n.t('static.program.validfutureamctext')).min(0, i18n.t('static.program.validvaluetext')),
        monthsInPastForAmc: Yup.string()
            .required(i18n.t('static.program.validpastamctext')).min(0, i18n.t('static.program.validvaluetext')),
        healthAreaId: Yup.string()
            .required(i18n.t('static.program.validhealthareatext')),
        programNotes: Yup.string()
            .required(i18n.t('static.program.validnotestext'))
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
export default class EditProgram extends Component {
    constructor(props) {
        console.log("in constructor");
        super(props);
        this.state = {
            // program: this.props.location.state.program,
            program: {
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                realm: {
                    realmId: '',
                },
                realmCountry: {
                    realmCountryId: '',
                    country: {
                        label: {
                            label_en: '',
                            label_sp: '',
                            label_pr: '',
                            label_fr: ''
                        }
                    },
                    realm: {
                        realmId: '',
                        label: {
                            label_en: '',
                            label_sp: '',
                            label_pr: '',
                            label_fr: ''
                        }
                    }
                },
                organisation: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }

                },
                programManager: {
                    userId: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                airFreightPerc: '',
                seaFreightPerc: '',
                // deliveredToReceivedLeadTime: '',
                draftToSubmittedLeadTime: '',
                plannedToDraftLeadTime: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                shippedToArrivedByAirLeadTime: '',
                shippedToArrivedBySeaLeadTime: '',
                arrivedToDeliveredLeadTime: '',
                monthsInFutureForAmc: '',
                monthsInPastForAmc: '',
                healthArea: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                programNotes: '',
                regionArray: [],


            },
            // regionList: [{ value: '1', label: 'R1' },
            // { value: '2', label: 'R2' },
            // { value: '3', label: 'R3' }],
            regionId: '',
            lang: localStorage.getItem('lang'),
            realmList: [],
            realmCountryList: [],
            organisationList: [],
            healthAreaList: [],
            programManagerList: [],
            regionList: [],
            message: ''

        }

        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);

    }

    changeMessage(message) {
        this.setState({ message: message })
    }

    Capitalize(str) {
        let { program } = this.state
        program.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramById(this.props.match.params.programId).then(response => {
            this.setState({
                program: response.data
            })
            initialValues = {
                programName: getLabelText(this.state.program.label, lang),
                realmId: this.state.program.realmCountry.realm.realmId,
                realmCountryId: this.state.program.realmCountry.realmCountryId,
                organisationId: this.state.program.organisation.id,
                userId: this.state.program.programManager.userId,
                airFreightPerc: this.state.program.airFreightPerc,
                seaFreightPerc: this.state.program.seaFreightPerc,
                // deliveredToReceivedLeadTime: this.state.program.deliveredToReceivedLeadTime,
                draftToSubmittedLeadTime: this.state.program.draftToSubmittedLeadTime,
                plannedToDraftLeadTime: this.state.program.plannedToDraftLeadTime,
                submittedToApprovedLeadTime: this.state.program.submittedToApprovedLeadTime,
                approvedToShippedLeadTime: this.state.program.approvedToShippedLeadTime,
                shippedToArrivedByAirLeadTime: this.state.program.shippedToArrivedByAirLeadTime,
                shippedToArrivedBySeaLeadTime: this.state.program.shippedToArrivedBySeaLeadTime,
                arrivedToDeliveredLeadTime: this.state.program.arrivedToDeliveredLeadTime,
                monthsInFutureForAmc: this.state.program.monthsInFutureForAmc,
                monthsInPastForAmc: this.state.program.monthsInPastForAmc,
                healthAreaId: this.state.program.healthArea.id,
                programNotes: this.state.program.programNotes,
                regionArray: this.state.program.regionArray
            }
            AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramManagerList(response.data.realmCountry.realm.realmId)
                .then(response => {
                    console.log("realm list---", response.data);
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

            ProgramService.getRegionList(response.data.realmCountry.realmCountryId)
                .then(response => {
                    if (response.status == 200) {
                        console.log("region list---", response.data);
                        var json = response.data;
                        var regList = [];
                        for (var i = 0; i < json.length; i++) {
                            regList[i] = { value: json[i].regionId, label: getLabelText(json[i].label, this.state.lan) }
                        }
                        this.setState({
                            regionList: regList
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode
                        })
                    }
                })

        })

    }
    updateFieldData(value) {
        let { program } = this.state;
        this.setState({ regionId: value });
        var regionId = value;
        var regionIdArray = [];
        for (var i = 0; i < regionId.length; i++) {
            regionIdArray[i] = regionId[i].value;
        }
        program.regionArray = regionIdArray;
        this.setState({ program: program });
    }
    dataChange(event) {
        let { program } = this.state;
        if (event.target.name == "programName") {
            program.label.label_en = event.target.value;
        } if (event.target.name == "realmId") {
            program.realm.realmId = event.target.value;
        } if (event.target.name == 'realmCountryId') {
            program.realmCountry.realmCountryId = event.target.value;
        } if (event.target.name == 'organisationId') {
            program.organisation.id = event.target.value;
        } if (event.target.name == 'airFreightPerc') {
            program.airFreightPerc = event.target.value;
        } if (event.target.name == 'seaFreightPerc') {
            program.seaFreightPerc = event.target.value;
        }
        // if (event.target.name == 'deliveredToReceivedLeadTime') {
        //     program.deliveredToReceivedLeadTime = event.target.value;
        // } 
        if (event.target.name == 'draftToSubmittedLeadTime') {
            program.draftToSubmittedLeadTime = event.target.value;
        } if (event.target.name == 'plannedToDraftLeadTime') {
            program.plannedToDraftLeadTime = event.target.value;
        } if (event.target.name == 'submittedToApprovedLeadTime') {
            program.submittedToApprovedLeadTime = event.target.value;
        } if (event.target.name == 'approvedToShippedLeadTime') {
            program.approvedToShippedLeadTime = event.target.value;
        }
        if (event.target.name == 'shippedToArrivedByAirLeadTime') {
            program.shippedToArrivedByAirLeadTime = event.target.value;
        }
        if (event.target.name == 'shippedToArrivedBySeaLeadTime') {
            program.shippedToArrivedBySeaLeadTime = event.target.value;
        }
        if (event.target.name == 'arrivedToDeliveredLeadTime') {
            program.arrivedToDeliveredLeadTime = event.target.value;
        }
        if (event.target.name == 'monthsInFutureForAmc') {
            program.monthsInFutureForAmc = event.target.value;
        } if (event.target.name == 'monthsInPastForAmc') {
            program.monthsInPastForAmc = event.target.value;
        } if (event.target.name == 'healthAreaId') {
            program.healthArea.id = event.target.value;
        } if (event.target.name == 'userId') {
            program.programManager.userId = event.target.value;
        }
        else if (event.target.name == 'programNotes') {
            program.programNotes = event.target.value;
        }

        this.setState({ program }, () => { console.log(this.state) })

    }
    touchAll(setTouched, errors) {
        setTouched({
            programName: true,
            realmId: true,
            realmCountryId: true,
            organisationId: true,
            userId: true,
            airFreightPerc: true,
            seaFreightPerc: true,
            // deliveredToReceivedLeadTime: true,
            draftToSubmittedLeadTime: true,
            plannedToDraftLeadTime: true,
            submittedToApprovedLeadTime: true,
            approvedToShippedLeadTime: true,
            shippedToArrivedByAirLeadTime: true,
            shippedToArrivedBySeaLeadTime: true,
            arrivedToDeliveredLeadTime: true,
            monthsInFutureForAmc: true,
            monthsInPastForAmc: true,
            healthAreaId: true,
            programNotes: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('programForm', (fieldName) => {
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
                <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} />
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                enableReinitialize={true}
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    ProgramService.editProgram(this.state.program).then(response => {
                                        if (response.status == 200) {
                                            this.props.history.push(`/program/listProgram/` + i18n.t(response.data.messageCode, { entityname }))
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode
                                            })
                                        }

                                    }
                                    )

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

                                            <Form onSubmit={handleSubmit} noValidate name='programForm'>
                                                <CardHeader>
                                                    <strong>{i18n.t('static.common.editEntity', { entityname })}</strong>
                                                </CardHeader>
                                                <CardBody>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.program')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            type="text" name="programName" valid={!errors.programName}
                                                            bsSize="sm"
                                                            invalid={touched.programName && !!errors.programName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.program.label.label_en}
                                                            id="programName" placeholder={i18n.t('static.program.programtext')} />
                                                        <FormFeedback>{errors.programName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="select">{i18n.t('static.program.realm')}</Label>

                                                        <Input
                                                            value={getLabelText(this.state.program.realmCountry.realm.label, this.state.lang)}
                                                            bsSize="sm"
                                                            valid={!errors.realmId}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            disabled
                                                            type="text"
                                                            name="realmId" id="realmId">

                                                        </Input>
                                                        <FormFeedback>{errors.realmId}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.realmcountry')}</Label>

                                                        <Input
                                                            value={getLabelText(this.state.program.realmCountry.country.label, this.state.lang)}
                                                            bsSize="sm"
                                                            valid={!errors.realmCountryId}
                                                            invalid={touched.realmCountryId && !!errors.realmCountryId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            disabled
                                                            type="text" name="realmCountryId" id="realmCountryId">

                                                        </Input>
                                                        <FormFeedback>{errors.realmCountryId}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup >
                                                        <Label htmlFor="select">{i18n.t('static.program.region')}<span class="red Reqasterisk">*</span></Label>
                                                        <Select
                                                            valid={!errors.regionId}
                                                            bsSize="sm"
                                                            invalid={touched.reagonId && !!errors.regionId}
                                                            onChange={(e) => { handleChange(e); this.updateFieldData(e) }}
                                                            onBlur={handleBlur} name="regionId" id="regionId"
                                                            multi
                                                            options={this.state.regionList}
                                                            value={this.state.program.regionArray}
                                                        />
                                                        <FormFeedback>{errors.regionId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.organisation')}</Label>

                                                        <Input
                                                            value={getLabelText(this.state.program.organisation.label, this.state.lang)}
                                                            bsSize="sm"
                                                            valid={!errors.organisationId}
                                                            invalid={touched.organisationId && !!errors.organisationId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            disabled
                                                            type="text" name="organisationId" id="organisationId">

                                                        </Input>
                                                        <FormFeedback>{errors.organisationId}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="select">{i18n.t('static.program.healtharea')}</Label>

                                                        <Input
                                                            value={getLabelText(this.state.program.healthArea.label, this.state.lang)}
                                                            bsSize="sm"
                                                            valid={!errors.healthAreaId}
                                                            invalid={touched.healthAreaId && !!errors.healthAreaId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur} disabled type="text" name="healthAreaId" id="healthAreaId">

                                                        </Input>
                                                        <FormFeedback>{errors.healthAreaId}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.programmanager')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            value={this.state.program.programManager.userId}
                                                            bsSize="sm"
                                                            valid={!errors.userId}
                                                            invalid={touched.userId && !!errors.userId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur} type="select" name="userId" id="userId">
                                                            {/* <option value="0">Please select</option> */}
                                                            {/* <option value="1">Anchal</option> */}
                                                            {programManagers}

                                                        </Input>
                                                        <FormFeedback>{errors.userId}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="select">{i18n.t('static.program.notes')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.programNotes}
                                                            bsSize="sm"
                                                            valid={!errors.programNotes}
                                                            invalid={touched.programNotes && !!errors.programNotes}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="textarea" name="programNotes" id="programNotes" />
                                                        <FormFeedback>{errors.programNotes}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.airfreightperc')} (%) <span class="red ">*</span></Label>

                                                        <Input
                                                            value={this.state.program.airFreightPerc}
                                                            bsSize="sm"
                                                            valid={!errors.airFreightPerc}
                                                            invalid={touched.airFreightPerc && !!errors.airFreightPerc}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="airFreightPerc" id="airFreightPerc" placeholder={i18n.t('static.program.airfreightperctext')} />
                                                        <FormFeedback>{errors.airFreightPerc}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.seafreightperc')} (%) <span class="red ">*</span></Label>

                                                        <Input
                                                            value={this.state.program.seaFreightPerc}
                                                            bsSize="sm"
                                                            valid={!errors.seaFreightPerc}
                                                            invalid={touched.seaFreightPerc && !!errors.seaFreightPerc}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="seaFreightPerc" id="seaFreightPerc" placeholder={i18n.t('static.program.seafreightperctext')} />
                                                        <FormFeedback>{errors.seaFreightPerc}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.draftleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.plannedToDraftLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.plannedToDraftLeadTime}
                                                            invalid={touched.plannedToDraftLeadTime && !!errors.plannedToDraftLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="plannedToDraftLeadTime" id="plannedToDraftLeadTime" placeholder={i18n.t('static.program.draftleadtext')} />
                                                        <FormFeedback>{errors.plannedToDraftLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.drafttosubmitleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.draftToSubmittedLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.draftToSubmittedLeadTime}
                                                            invalid={touched.draftToSubmittedLeadTime && !!errors.draftToSubmittedLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="draftToSubmittedLeadTime" id="draftToSubmittedLeadTime" placeholder={i18n.t('static.program.drafttosubmittext')} />
                                                        <FormFeedback>{errors.draftToSubmittedLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.submittoapproveleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.submittedToApprovedLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.submittedToApprovedLeadTime}
                                                            invalid={touched.submittedToApprovedLeadTime && !!errors.submittedToApprovedLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="submittedToApprovedLeadTime" id="submittedToApprovedLeadTime" placeholder={i18n.t('static.program.submittoapprovetext')} />
                                                        <FormFeedback>{errors.submittedToApprovedLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.approvetoshipleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.approvedToShippedLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.approvedToShippedLeadTime}
                                                            invalid={touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="approvedToShippedLeadTime" id="approvedToShippedLeadTime" placeholder={i18n.t('static.program.approvetoshiptext')} />
                                                        <FormFeedback>{errors.approvedToShippedLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    {/* <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.delivedtoreceivedleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.deliveredToReceivedLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.deliveredToReceivedLeadTime}
                                                            invalid={touched.deliveredToReceivedLeadTime && !!errors.deliveredToReceivedLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="deliveredToReceivedLeadTime" id="deliveredToReceivedLeadTime" placeholder={i18n.t('static.program.delivertoreceivetext')} />
                                                        <FormFeedback>{errors.deliveredToReceivedLeadTime}</FormFeedback>

                                                    </FormGroup> */}
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.realmcountry.shippedToArrivedAirLeadTime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.shippedToArrivedByAirLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.shippedToArrivedByAirLeadTime && this.state.program.shippedToArrivedByAirLeadTime != ''}
                                                            invalid={touched.shippedToArrivedByAirLeadTime && !!errors.shippedToArrivedByAirLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="shippedToArrivedByAirLeadTime" id="shippedToArrivedByAirLeadTime" placeholder={i18n.t('static.realmcountry.shippedToArrivedAirLeadTimetext')} />
                                                        <FormFeedback>{errors.shippedToArrivedByAirLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.realmcountry.shippedToArrivedSeaLeadTime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.shippedToArrivedBySeaLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.shippedToArrivedBySeaLeadTime && this.state.program.shippedToArrivedBySeaLeadTime != ''}
                                                            invalid={touched.shippedToArrivedBySeaLeadTime && !!errors.shippedToArrivedBySeaLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="shippedToArrivedBySeaLeadTime" id="shippedToArrivedBySeaLeadTime" placeholder={i18n.t('static.realmcountry.shippedToArrivedSeaLeadTimetext')} />
                                                        <FormFeedback>{errors.shippedToArrivedBySeaLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.realmcountry.arrivedToDeliveredLeadTime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.arrivedToDeliveredLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.arrivedToDeliveredLeadTime && this.state.program.arrivedToDeliveredLeadTime != ''}
                                                            invalid={touched.arrivedToDeliveredLeadTime && !!errors.arrivedToDeliveredLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="arrivedToDeliveredLeadTime" id="arrivedToDeliveredLeadTime" placeholder={i18n.t('static.realmcountry.arrivedToDeliveredLeadTimetext')} />
                                                        <FormFeedback>{errors.arrivedToDeliveredLeadTime}</FormFeedback>

                                                    </FormGroup>






                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.monthpastamc')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.monthsInPastForAmc}
                                                            bsSize="sm"
                                                            valid={!errors.monthsInPastForAmc}
                                                            invalid={touched.monthsInPastForAmc && !!errors.monthsInPastForAmc}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="monthsInPastForAmc" id="monthsInPastForAmc" placeholder={i18n.t('static.program.monthpastamctext')} />
                                                        <FormFeedback>{errors.monthsInPastForAmc}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.monthfutureamc')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.monthsInFutureForAmc}
                                                            bsSize="sm"
                                                            valid={!errors.monthsInFutureForAmc}
                                                            invalid={touched.monthsInFutureForAmc && !!errors.monthsInFutureForAmc}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="monthsInFutureForAmc" id="monthsInFutureForAmc" placeholder={i18n.t('static.program.monthfutureamctext')} />
                                                        <FormFeedback>{errors.monthsInFutureForAmc}</FormFeedback>
                                                    </FormGroup>

                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>Update</Button>
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
    cancelClicked() {
        this.props.history.push(`/program/listProgram/` + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramById(this.props.match.params.programId).then(response => {
            this.setState({
                program: response.data
            })
            initialValues = {
                programName: getLabelText(this.state.program.label, lang),
                realmId: this.state.program.realmCountry.realm.realmId,
                realmCountryId: this.state.program.realmCountry.realmCountryId,
                organisationId: this.state.program.organisation.id,
                userId: this.state.program.programManager.userId,
                airFreightPerc: this.state.program.airFreightPerc,
                seaFreightPerc: this.state.program.seaFreightPerc,
                // deliveredToReceivedLeadTime: this.state.program.deliveredToReceivedLeadTime,
                draftToSubmittedLeadTime: this.state.program.draftToSubmittedLeadTime,
                plannedToDraftLeadTime: this.state.program.plannedToDraftLeadTime,
                submittedToApprovedLeadTime: this.state.program.submittedToApprovedLeadTime,
                approvedToShippedLeadTime: this.state.program.approvedToShippedLeadTime,
                shippedToArrivedByAirLeadTime: this.state.program.shippedToArrivedByAirLeadTime,
                shippedToArrivedBySeaLeadTime: this.state.program.shippedToArrivedBySeaLeadTime,
                arrivedToDeliveredLeadTime: this.state.program.arrivedToDeliveredLeadTime,
                monthsInFutureForAmc: this.state.program.monthsInFutureForAmc,
                monthsInPastForAmc: this.state.program.monthsInPastForAmc,
                healthAreaId: this.state.program.healthArea.id,
                programNotes: this.state.program.programNotes,
                regionArray: this.state.program.regionArray
            }
            AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramManagerList(response.data.realmCountry.realm.realmId)
                .then(response => {
                    console.log("realm list---", response.data);
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

            ProgramService.getRegionList(response.data.realmCountry.realmCountryId)
                .then(response => {
                    if (response.status == 200) {
                        console.log("region list---", response.data);
                        var json = response.data;
                        var regList = [];
                        for (var i = 0; i < json.length; i++) {
                            regList[i] = { value: json[i].regionId, label: getLabelText(json[i].label, this.state.lan) }
                        }
                        this.setState({
                            regionList: regList
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode
                        })
                    }
                })

        })

    }
}