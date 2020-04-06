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


const entityname = i18n.t('static.program.programMaster');
let initialValues = {
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
                    organisationId: '',
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
                deliveredToReceivedLeadTime: '',
                draftToSubmittedLeadTime: '',
                plannedToDraftLeadTime: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                monthsInFutureForAmc: '',
                monthsInPastForAmc: '',
                healthArea: {
                    healthAreaId: '',
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
        this.Capitalize=this.Capitalize.bind(this);

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
                organisationId: this.state.program.organisation.organisationId,
                userId: this.state.program.programManager.userId,
                airFreightPerc: this.state.program.airFreightPerc,
                seaFreightPerc: this.state.program.seaFreightPerc,
                deliveredToReceivedLeadTime: this.state.program.deliveredToReceivedLeadTime,
                draftToSubmittedLeadTime: this.state.program.draftToSubmittedLeadTime,
                plannedToDraftLeadTime: this.state.program.plannedToDraftLeadTime,
                submittedToApprovedLeadTime: this.state.program.submittedToApprovedLeadTime,
                approvedToShippedLeadTime: this.state.program.approvedToShippedLeadTime,
                monthsInFutureForAmc: this.state.program.monthsInFutureForAmc,
                monthsInPastForAmc: this.state.program.monthsInPastForAmc,
                healthAreaId: this.state.program.healthArea.healthAreaId,
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
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ message: error.response.data.messageCode });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    console.log("Error code unkown");
                                    break;
                            }
                        }
                    }
                );
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
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ message: error.response.data.messageCode });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    console.log("Error code unkown");
                                    break;
                            }
                        }
                    }
                );
        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({ message: error.message });
                } else {
                    switch (error.response ? error.response.status : "") {
                        case 500:
                        case 401:
                        case 404:
                        case 406:
                        case 412:
                            this.setState({ message: error.response.data.messageCode });
                            break;
                        default:
                            this.setState({ message: 'static.unkownError' });
                            console.log("Error code unkown");
                            break;
                    }
                }
            }
        );

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
            program.organisation.organisationId = event.target.value;
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
            program.healthArea.healthAreaId = event.target.value;
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
            deliveredToReceivedLeadTime: true,
            draftToSubmittedLeadTime: true,
            plannedToDraftLeadTime: true,
            submittedToApprovedLeadTime: true,
            approvedToShippedLeadTime: true,
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
                <h5>{i18n.t(this.state.message,{entityname})}</h5>
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
                                        .catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({ message: error.message });
                                                } else {
                                                    switch (error.response ? error.response.status : "") {
                                                        case 500:
                                                        case 401:
                                                        case 404:
                                                        case 406:
                                                        case 412:
                                                            this.setState({ message: error.response.data.messageCode });
                                                            break;
                                                        default:
                                                            this.setState({ message: 'static.unkownError' });
                                                            console.log("Error code unkown");
                                                            break;
                                                    }
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
                                                    <strong>{i18n.t('static.common.editEntity',{entityname})}</strong>
                                                </CardHeader>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Col md="5">
                                                            <Label htmlFor="company">{i18n.t('static.program.program')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                type="text" name="programName" valid={!errors.programName}
                                                                invalid={touched.programName && !!errors.programName}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e);this.Capitalize(e.target.value) }}
                                                                onBlur={handleBlur}
                                                                value={this.state.program.label.label_en}
                                                                id="programName" placeholder={i18n.t('static.program.programtext')} />
                                                            <FormFeedback>{errors.programName}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="4">
                                                            <Label htmlFor="select">{i18n.t('static.program.realm')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={getLabelText(this.state.program.realmCountry.realm.label, this.state.lang)}
                                                                valid={!errors.realmId}
                                                                invalid={touched.realmId && !!errors.realmId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                disabled
                                                                type="text"
                                                                name="realmId" id="realmId">

                                                            </Input>
                                                            <FormFeedback>{errors.realmId}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="4">
                                                            <Label htmlFor="select">{i18n.t('static.program.realmcountry')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={getLabelText(this.state.program.realmCountry.country.label, this.state.lang)}
                                                                valid={!errors.realmCountryId}
                                                                invalid={touched.realmCountryId && !!errors.realmCountryId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                disabled
                                                                type="text" name="realmCountryId" id="realmCountryId">

                                                            </Input>
                                                            <FormFeedback>{errors.realmCountryId}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup >
                                                        <Col md="3">
                                                            <Label htmlFor="select">{i18n.t('static.program.region')}</Label>
                                                        </Col>

                                                        <Col xs="12" md="9">
                                                            <Select
                                                                valid={!errors.regionId}
                                                                invalid={touched.reagonId && !!errors.regionId}
                                                                onChange={(e) => { handleChange(e); this.updateFieldData(e) }}
                                                                onBlur={handleBlur} name="regionId" id="regionId"
                                                                multi
                                                                options={this.state.regionList}
                                                                value={this.state.program.regionArray}
                                                            />
                                                            <FormFeedback>{errors.regionId}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="4">
                                                            <Label htmlFor="select">{i18n.t('static.program.organisation')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={getLabelText(this.state.program.organisation.label, this.state.lang)}
                                                                valid={!errors.organisationId}
                                                                invalid={touched.organisationId && !!errors.organisationId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                disabled
                                                                type="text" name="organisationId" id="organisationId">

                                                            </Input>
                                                            <FormFeedback>{errors.organisationId}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="4">
                                                            <Label htmlFor="select">{i18n.t('static.program.healtharea')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={getLabelText(this.state.program.healthArea.label, this.state.lang)}
                                                                valid={!errors.healthAreaId}
                                                                invalid={touched.healthAreaId && !!errors.healthAreaId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur} disabled type="text" name="healthAreaId" id="healthAreaId">

                                                            </Input>
                                                            <FormFeedback>{errors.healthAreaId}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="4">
                                                            <Label htmlFor="select">{i18n.t('static.program.programmanager')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={this.state.program.programManager.userId}
                                                                valid={!errors.userId}
                                                                invalid={touched.userId && !!errors.userId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur} type="select" name="userId" id="userId">
                                                                {/* <option value="0">Please select</option> */}
                                                                {/* <option value="1">Anchal</option> */}
                                                                {programManagers}

                                                            </Input>
                                                            <FormFeedback>{errors.userId}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="4">
                                                            <Label htmlFor="select">{i18n.t('static.program.notes')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={this.state.program.programNotes}
                                                                valid={!errors.programNotes}
                                                                invalid={touched.programNotes && !!errors.programNotes}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="textarea" name="programNotes" id="programNotes" />
                                                            <FormFeedback>{errors.programNotes}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="5">
                                                            <Label htmlFor="company">{i18n.t('static.program.airfreightperc')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={this.state.program.airFreightPerc}
                                                                valid={!errors.airFreightPerc}
                                                                invalid={touched.airFreightPerc && !!errors.airFreightPerc}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="number" 
                                                                min="0"
                                                                name="airFreightPerc" id="airFreightPerc" placeholder={i18n.t('static.program.airfreightperctext')} />
                                                            <FormFeedback>{errors.airFreightPerc}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="5">
                                                            <Label htmlFor="company">{i18n.t('static.program.seafreightperc')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={this.state.program.seaFreightPerc}
                                                                valid={!errors.seaFreightPerc}
                                                                invalid={touched.seaFreightPerc && !!errors.seaFreightPerc}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="number" 
                                                                min="0"
                                                                name="seaFreightPerc" id="seaFreightPerc" placeholder={i18n.t('static.program.seafreightperctext')} />
                                                            <FormFeedback>{errors.seaFreightPerc}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="5">
                                                            <Label htmlFor="company">{i18n.t('static.program.draftleadtime')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={this.state.program.plannedToDraftLeadTime}
                                                                valid={!errors.plannedToDraftLeadTime}
                                                                invalid={touched.plannedToDraftLeadTime && !!errors.plannedToDraftLeadTime}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="number" 
                                                                min="0"
                                                                name="plannedToDraftLeadTime" id="plannedToDraftLeadTime" placeholder={i18n.t('static.program.draftleadtext')} />
                                                            <FormFeedback>{errors.plannedToDraftLeadTime}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="5">
                                                            <Label htmlFor="company">{i18n.t('static.program.drafttosubmitleadtime')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={this.state.program.draftToSubmittedLeadTime}
                                                                valid={!errors.draftToSubmittedLeadTime}
                                                                invalid={touched.draftToSubmittedLeadTime && !!errors.draftToSubmittedLeadTime}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="number" 
                                                                min="0"
                                                                name="draftToSubmittedLeadTime" id="draftToSubmittedLeadTime" placeholder={i18n.t('static.program.drafttosubmittext')} />
                                                            <FormFeedback>{errors.draftToSubmittedLeadTime}</FormFeedback>

                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="5">
                                                            <Label htmlFor="company">{i18n.t('static.program.submittoapproveleadtime')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={this.state.program.submittedToApprovedLeadTime}
                                                                valid={!errors.submittedToApprovedLeadTime}
                                                                invalid={touched.submittedToApprovedLeadTime && !!errors.submittedToApprovedLeadTime}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="number" 
                                                                min="0"
                                                                name="submittedToApprovedLeadTime" id="submittedToApprovedLeadTime" placeholder={i18n.t('static.program.submittoapprovetext')} />
                                                            <FormFeedback>{errors.submittedToApprovedLeadTime}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="5">
                                                            <Label htmlFor="company">{i18n.t('static.program.approvetoshipleadtime')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={this.state.program.approvedToShippedLeadTime}
                                                                valid={!errors.approvedToShippedLeadTime}
                                                                invalid={touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="number" 
                                                                min="0"
                                                                name="approvedToShippedLeadTime" id="approvedToShippedLeadTime" placeholder={i18n.t('static.program.approvetoshiptext')} />
                                                            <FormFeedback>{errors.approvedToShippedLeadTime}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="5">
                                                            <Label htmlFor="company">{i18n.t('static.program.delivedtoreceivedleadtime')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={this.state.program.deliveredToReceivedLeadTime}
                                                                valid={!errors.deliveredToReceivedLeadTime}
                                                                invalid={touched.deliveredToReceivedLeadTime && !!errors.deliveredToReceivedLeadTime}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="number" 
                                                                min="0"
                                                                name="deliveredToReceivedLeadTime" id="deliveredToReceivedLeadTime" placeholder={i18n.t('static.program.delivertoreceivetext')} />
                                                            <FormFeedback>{errors.deliveredToReceivedLeadTime}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="5">
                                                            <Label htmlFor="company">{i18n.t('static.program.monthpastamc')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={this.state.program.monthsInPastForAmc}
                                                                valid={!errors.monthsInPastForAmc}
                                                                invalid={touched.monthsInPastForAmc && !!errors.monthsInPastForAmc}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="number" 
                                                                min="0"
                                                                name="monthsInPastForAmc" id="monthsInPastForAmc" placeholder={i18n.t('static.program.monthpastamctext')} />
                                                            <FormFeedback>{errors.monthsInPastForAmc}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Col md="5">
                                                            <Label htmlFor="company">{i18n.t('static.program.monthfutureamc')}</Label>
                                                        </Col>
                                                        <Col xs="12" md="9">
                                                            <Input
                                                                value={this.state.program.monthsInFutureForAmc}
                                                                valid={!errors.monthsInFutureForAmc}
                                                                invalid={touched.monthsInFutureForAmc && !!errors.monthsInFutureForAmc}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                type="number" 
                                                                min="0"
                                                                name="monthsInFutureForAmc" id="monthsInFutureForAmc" placeholder={i18n.t('static.program.monthfutureamctext')} />
                                                            <FormFeedback>{errors.monthsInFutureForAmc}</FormFeedback>
                                                        </Col>
                                                    </FormGroup>

                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
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

}