import React, { Component } from "react";
import {
    Row, Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Col, FormFeedback, Form, InputGroupAddon, InputGroupText, FormText
} from 'reactstrap';
import Select from 'react-select';
import { Formik } from 'formik';
import * as Yup from 'yup';
import '../Forms/ValidationForms/ValidationForms.css';
import 'react-select/dist/react-select.min.css';
import ProgramService from "../../api/ProgramService";
import HealthAreaService from "../../api/HealthAreaService";
import getLabelText from '../../CommonComponent/getLabelText'
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'

const entityname = i18n.t('static.program.programMaster');
const initialValues = {
    programName: '',
    realmId: '',
    realmCountryId: '',
    organisationId: '',
    userId: '',
    airFreightPerc: '',
    seaFreightPerc: '',
    deliveredToReceivedLeadTime: '',
    draftToSubmittedLeadTime: '',
    plannedToDraftLeadTime: '',
    submittedToApprovedLeadTime: '',
    approvedToShippedLeadTime: '',
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
        airFreightPerc: Yup.number()
            .required(i18n.t('static.program.validairfreighttext')).min(0, i18n.t('static.program.validvaluetext')),
        seaFreightPerc: Yup.number()
            .required(i18n.t('static.program.validseafreighttext')).min(0, i18n.t('static.program.validvaluetext')),
        deliveredToReceivedLeadTime: Yup.number()
            .required(i18n.t('static.program.validdelivertoreceivetext')).min(0, i18n.t('static.program.validvaluetext')),
        draftToSubmittedLeadTime: Yup.number()
            .required(i18n.t('static.program.validdrafttosubmittext')).min(0, i18n.t('static.program.validvaluetext')),
        plannedToDraftLeadTime: Yup.number()
            .required(i18n.t('static.program.validplantodrafttext')).min(0, i18n.t('static.program.validvaluetext')),
        submittedToApprovedLeadTime: Yup.number()
            .required(i18n.t('static.program.validsubmittoapprovetext')).min(0, i18n.t('static.program.validvaluetext')),
        approvedToShippedLeadTime: Yup.number()
            .required(i18n.t('static.program.validapprovetoshiptext')).min(0, i18n.t('static.program.validvaluetext')),
        monthsInFutureForAmc: Yup.number()
            .required(i18n.t('static.program.validfutureamctext')).min(0, i18n.t('static.program.validvaluetext')),
        monthsInPastForAmc: Yup.number()
            .required(i18n.t('static.program.validpastamctext')).min(0, i18n.t('static.program.validvaluetext')),
        healthAreaId: Yup.string()
            .required(i18n.t('static.program.validhealthareatext')),
        // programNotes: Yup.string()
        //     .required(i18n.t('static.program.validnotestext')),

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

export default class AddProgram extends Component {

    constructor(props) {
        super(props);
        this.state = {
            program: {
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                realm: {
                    realmId: ''
                },
                realmCountry: {
                    realmCountryId: ''
                },
                organisation: {
                    id: ''
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
                deliveredToReceivedLeadTime: '',
                draftToSubmittedLeadTime: '',
                plannedToDraftLeadTime: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                monthsInFutureForAmc: '',
                monthsInPastForAmc: '',
                healthArea: {
                    id: ''
                },
                programNotes: '',
                regionArray: [],


            },
            // regionList: [{ value: '1', label: 'R1' },
            // { value: '2', label: 'R2' },
            // { value: '3', label: 'R3' }],
            lang: localStorage.getItem('lang'),
            regionId: '',
            realmList: [],
            realmCountryList: [],
            organisationList: [],
            healthAreaList: [],
            programManagerList: [],
            regionList: [],
            message: ''

        }
        this.dataChange = this.dataChange.bind(this);
        this.getDependentLists = this.getDependentLists.bind(this);
        this.getRegionList = this.getRegionList.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);

    }

    Capitalize(str) {
        let { program } = this.state
        program.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        HealthAreaService.getRealmList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realmList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
    }
    getDependentLists(e) {
        console.log(e.target.value)

        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramManagerList(e.target.value)
            .then(response => {
                console.log("manager list---", response.data);
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

        ProgramService.getRealmCountryList(e.target.value)
            .then(response => {
                console.log("realm list---", response.data);
                if (response.status == 200) {
                    this.setState({
                        realmCountryList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })

        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getOrganisationList(e.target.value)
            .then(response => {
                console.log("organisation list---", response.data);
                if (response.status == 200) {
                    this.setState({
                        organisationList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })


        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getHealthAreaList(e.target.value)
            .then(response => {
                console.log("health area list---", response.data);
                if (response.status == 200) {
                    this.setState({
                        healthAreaList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
    }

    getRegionList(e) {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getRegionList(e.target.value)
            .then(response => {
                console.log("health area list---", response.data);
                if (response.status == 200) {
                    var json = response.data;
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { value: json[i].regionId, label: getLabelText(json[i].label, this.state.lang) }
                    }
                    this.setState({
                        regionId: '',
                        regionList: regList
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
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
        } if (event.target.name == 'deliveredToReceivedLeadTime') {
            program.deliveredToReceivedLeadTime = event.target.value;
        } if (event.target.name == 'draftToSubmittedLeadTime') {
            program.draftToSubmittedLeadTime = event.target.value;
        } if (event.target.name == 'plannedToDraftLeadTime') {
            program.plannedToDraftLeadTime = event.target.value;
        } if (event.target.name == 'submittedToApprovedLeadTime') {
            program.submittedToApprovedLeadTime = event.target.value;
        } if (event.target.name == 'approvedToShippedLeadTime') {
            program.approvedToShippedLeadTime = event.target.value;
        } if (event.target.name == 'monthsInFutureForAmc') {
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

        this.setState({ program }, () => { })

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
            deliveredToReceivedLeadTime: true,
            draftToSubmittedLeadTime: true,
            plannedToDraftLeadTime: true,
            submittedToApprovedLeadTime: true,
            approvedToShippedLeadTime: true,
            monthsInFutureForAmc: true,
            monthsInPastForAmc: true,
            healthAreaId: true,
            // programNotes: true,

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
        const { realmList } = this.state;
        const { programManagerList } = this.state;
        const { realmCountryList } = this.state;
        const { organisationList } = this.state;
        const { healthAreaList } = this.state;

        let realms = realmList.length > 0
            && realmList.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        let realmCountries = realmCountryList.length > 0
            && realmCountryList.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {getLabelText(item.country.label, this.state.lang)}
                    </option>
                )
            }, this);

        let realmOrganisation = organisationList.length > 0
            && organisationList.map((item, i) => {
                return (
                    <option key={i} value={item.organisationId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        let realmHealthArea = healthAreaList.length > 0
            && healthAreaList.map((item, i) => {
                return (
                    <option key={i} value={item.healthAreaId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);


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
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    ProgramService.addProgram(this.state.program).then(response => {
                                        if (response.status == "200") {
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
                                        setTouched,
                                        handleReset
                                    }) => (

                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='programForm'>
                                                <CardHeader>
                                                    <strong>{i18n.t('static.program.programadd')}</strong>
                                                </CardHeader>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="company">{i18n.t('static.program.program')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            type="text" name="programName" valid={!errors.programName && this.state.program.label.label_en != ''}
                                                            bsSize="sm"
                                                            invalid={touched.programName && !!errors.programName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.program.label.label_en}
                                                            id="programName" placeholder={i18n.t('static.program.programtext')} />
                                                        <FormFeedback className="red">{errors.programName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.realm')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            // value={this.state.program.realm.realmId}
                                                            bsSize="sm"
                                                            valid={!errors.realmId && this.state.program.realm.realmId != ''}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getDependentLists(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.program.realm.realmId}
                                                            type="select" name="realmId" id="realmId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {realms}
                                                        </Input>

                                                        <FormFeedback>{errors.realmId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="select">{i18n.t('static.program.realmcountry')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.realmCountry.realmCountryId}
                                                            bsSize="sm"
                                                            valid={!errors.realmCountryId && this.state.program.realmCountry.realmCountryId != ''}
                                                            invalid={touched.realmCountryId && !!errors.realmCountryId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getRegionList(e) }}
                                                            onBlur={handleBlur}
                                                            type="select" name="realmCountryId" id="realmCountryId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {/* <option value="1">Country #1</option>
                                                        <option value="2">Country #2</option>
                                                        <option value="3">Country #3</option> */}
                                                            {realmCountries}
                                                        </Input>

                                                        <FormFeedback>{errors.realmCountryId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup >
                                                        <Label htmlFor="select">{i18n.t('static.program.region')}<span class="red Reqasterisk">*</span><span class="red Reqasterisk">*</span></Label>

                                                        <Select
                                                            valid={!errors.regionId && this.state.regionId != ''}
                                                            bsSize="sm"
                                                            invalid={touched.reagonId && !!errors.regionId}
                                                            onChange={(e) => { handleChange(e); this.updateFieldData(e) }}
                                                            onBlur={handleBlur}
                                                            name="regionId"
                                                            id="regionId"
                                                            multi
                                                            options={this.state.regionList}
                                                            value={this.state.regionId}
                                                        />
                                                        <FormFeedback>{errors.regionId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.organisation')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            value={this.state.program.organisation.id}
                                                            bsSize="sm"
                                                            valid={!errors.organisationId && this.state.program.organisation.id != ''}
                                                            invalid={touched.organisationId && !!errors.organisationId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="select" name="organisationId" id="organisationId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {realmOrganisation}
                                                            {/* <option value="1">product #1</option>
                                                        <option value="2">product #2</option>
                                                        <option value="3">product #3</option> */}
                                                        </Input>
                                                        <FormFeedback>{errors.organisationId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.healtharea')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            value={this.state.program.healthArea.id}
                                                            bsSize="sm"
                                                            valid={!errors.healthAreaId && this.state.program.healthArea.id != ''}
                                                            invalid={touched.healthAreaId && !!errors.healthAreaId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur} type="select" name="healthAreaId" id="healthAreaId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {realmHealthArea}
                                                            {/* <option value="1">Health Area #1</option>
                                                        <option value="2">Health Area #2</option>
                                                        <option value="3">Health Area #3</option> */}
                                                        </Input>
                                                        <FormFeedback>{errors.healthAreaId}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.programmanager')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            value={this.state.program.programManager.userId}
                                                            bsSize="sm"
                                                            valid={!errors.userId && this.state.program.programManager.userId != ''}
                                                            invalid={touched.userId && !!errors.userId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur} type="select" name="userId" id="userId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {/* <option value="1">Anchal</option> */}
                                                            {/* <option value="2">Akil</option>
                                                        <option value="3">Sameer</option> */}
                                                            {programManagers}
                                                        </Input>
                                                        <FormFeedback>{errors.userId}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.notes')}</Label>
                                                        <Input
                                                            value={this.state.program.programNotes}
                                                            bsSize="sm"
                                                            // valid={!errors.programNotes}
                                                            // invalid={touched.programNotes && !!errors.programNotes}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="textarea" name="programNotes" id="programNotes" />
                                                        <FormFeedback>{errors.programNotes}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="company">{i18n.t('static.program.airfreightperc')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            value={this.state.program.airFreightPerc}
                                                            bsSize="sm"
                                                            valid={!errors.airFreightPerc && this.state.program.airFreightPerc != ''}
                                                            invalid={touched.airFreightPerc && !!errors.airFreightPerc}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="airFreightPerc" id="airFreightPerc" placeholder={i18n.t('static.program.airfreightperctext')} />
                                                        <FormFeedback>{errors.airFreightPerc}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="company">{i18n.t('static.program.seafreightperc')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            value={this.state.program.seaFreightPerc}
                                                            bsSize="sm"
                                                            valid={!errors.seaFreightPerc && this.state.program.seaFreightPerc != ''}
                                                            invalid={touched.seaFreightPerc && !!errors.seaFreightPerc}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="seaFreightPerc" id="seaFreightPerc" placeholder={i18n.t('static.program.seafreightperc')} />
                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.draftleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.plannedToDraftLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.plannedToDraftLeadTime && this.state.program.plannedToDraftLeadTime != ''}
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
                                                            valid={!errors.draftToSubmittedLeadTime && this.state.program.draftToSubmittedLeadTime != ''}
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
                                                            valid={!errors.submittedToApprovedLeadTime && this.state.program.submittedToApprovedLeadTime != ''}
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
                                                            valid={!errors.approvedToShippedLeadTime && this.state.program.approvedToShippedLeadTime != ''}
                                                            invalid={touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="approvedToShippedLeadTime" id="approvedToShippedLeadTime" placeholder={i18n.t('static.program.approvetoshiptext')} />
                                                        <FormFeedback>{errors.approvedToShippedLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.delivertoreceivetext')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.deliveredToReceivedLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.deliveredToReceivedLeadTime && this.state.program.deliveredToReceivedLeadTime != ''}
                                                            invalid={touched.deliveredToReceivedLeadTime && !!errors.deliveredToReceivedLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="deliveredToReceivedLeadTime" id="deliveredToReceivedLeadTime" placeholder={i18n.t('static.program.delivertoreceivetext')} />
                                                        <FormFeedback>{errors.deliveredToReceivedLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.monthpastamc')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.monthsInPastForAmc}
                                                            bsSize="sm"
                                                            valid={!errors.monthsInPastForAmc && this.state.program.monthsInPastForAmc != ''}
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
                                                            valid={!errors.monthsInFutureForAmc && this.state.program.monthsInFutureForAmc != ''}
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
                                                        {/* <Button type="reset" size="sm" color="warning" className="float-right mr-1"><i className="fa fa-refresh"></i> Reset</Button> */}
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="success" className="float-right mr-1" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')} </Button>
                                                        {/* <Button type="submit" size="sm" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>Submit</Button> */}
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
        let { program } = this.state;

        program.label.label_en = ''
        program.realm.realmId = ''
        program.realmCountry.realmCountryId = ''
        this.state.regionId = ''
        program.organisation.id = ''
        program.airFreightPerc = ''
        program.seaFreightPerc = ''
        program.deliveredToReceivedLeadTime = ''
        program.draftToSubmittedLeadTime = ''
        program.plannedToDraftLeadTime = ''
        program.submittedToApprovedLeadTime = ''
        program.approvedToShippedLeadTime = ''
        program.monthsInFutureForAmc = ''
        program.monthsInPastForAmc = ''
        program.healthArea.id = ''
        program.programManager.userId = ''
        program.programNotes = ''

        this.setState({ program }, () => { })

    }
}