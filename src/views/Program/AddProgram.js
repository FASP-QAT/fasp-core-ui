import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Col, FormFeedback, Form
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
            .required(i18n.t('static.program.validrealmtext')),
        realmCountryId: Yup.string()
            .required(i18n.t('static.program.validcountrytext')),
        organisationId: Yup.string()
            .required(i18n.t('static.program.validorganisationtext')),
        userId: Yup.string()
            .required(i18n.t('static.program.validmanagertext')),
        airFreightPerc: Yup.number()
            .required(i18n.t('static.program.validairfreighttext')).min(0, i18n.t('static.program.validvaluetext')),
        seaFreightPerc: Yup.number()
            .required(i18n.t('static.program.validseafreighttext')).min(0,  i18n.t('static.program.validvaluetext')),
        deliveredToReceivedLeadTime: Yup.number()
            .required(i18n.t('static.program.validdelivertoreceivetext')).min(0, i18n.t('static.program.validvaluetext')),
        draftToSubmittedLeadTime: Yup.number()
            .required(i18n.t('static.program.validdrafttosubmittext')).min(0,  i18n.t('static.program.validvaluetext')),
        plannedToDraftLeadTime: Yup.number()
            .required(i18n.t('static.program.validplantodrafttext')).min(0, i18n.t('static.program.validvaluetext')),
        submittedToApprovedLeadTime: Yup.number()
            .required(i18n.t('static.program.validsubmittoapprovetext')).min(0, i18n.t('static.program.validvaluetext')),
        approvedToShippedLeadTime: Yup.number()
            .required(i18n.t('static.program.validapprovetoshiptext')).min(0,  i18n.t('static.program.validvaluetext')),
        monthsInFutureForAmc: Yup.number()
            .required(i18n.t('static.program.validfutureamctext')).min(0,  i18n.t('static.program.validvaluetext')),
        monthsInPastForAmc: Yup.number()
            .required(i18n.t('static.program.validpastamctext')).min(0,  i18n.t('static.program.validvaluetext')),
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

export default class AddProgram extends Component {

    constructor(props) {
        super(props);
        this.state = {
            program: {
                label: {
                    label_en: ''
                },
                realm: {
                    realmId: ''
                },
                realmCountry: {
                    realmCountryId: ''
                },
                organisation: {
                    organisationId: ''
                },
                programManager: {
                    userId: ''
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
                    healthAreaId: ''
                },
                programNotes: '',
                regionArray: [],
                lan: 'en'

            },
            // regionList: [{ value: '1', label: 'R1' },
            // { value: '2', label: 'R2' },
            // { value: '3', label: 'R3' }],
            regionId: '',
            realmList: [],
            realmCountryList: [],
            organisationList: [],
            healthAreaList: [],
            programManagerList: [],
            regionList: []

        }
        this.dataChange = this.dataChange.bind(this);
        this.getDependentLists = this.getDependentLists.bind(this);
        this.getRegionList = this.getRegionList.bind(this);
        this.cancelClicked=this.cancelClicked.bind(this);

    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        HealthAreaService.getRealmList()
            .then(response => {
                if (response.status == "Success") {
                 console.log("realm list---", response.data.data);
                this.setState({
                    realmList: response.data.data
                })  } else {
                    this.setState({ message: response.data.messageCode })
                }
            }).catch(
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

    }
    getDependentLists(e) {
        console.log(e.target.value)

        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getRealmCountryList(e.target.value)
            .then(response => {
                console.log("realm list---", response.data.data);
                this.setState({
                    realmCountryList: response.data.data
                })
            }).catch(
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

        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getOrganisationList(e.target.value)
            .then(response => {
                console.log("organisation list---", response.data.data);
                this.setState({
                    organisationList: response.data.data
                })
            }).catch(
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

        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getHealthAreaList(e.target.value)
            .then(response => {
                console.log("health area list---", response.data.data);
                this.setState({
                    healthAreaList: response.data.data
                })
            }).catch(
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

    }

    getRegionList(e) {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getRegionList(e.target.value)
            .then(response => {
                console.log("health area list---", response.data.data);
                var json = response.data.data;
                var regList = [];
                for (var i = 0; i < json.length; i++) {
                    regList[i] = { value: json[i].regionId, label: getLabelText(json[i].label, this.state.lan) }
                }
                this.setState({
                    regionId:'',
                    regionList: regList
                })
            }).catch(
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
        const { realmList } = this.state;
        const { realmCountryList } = this.state;
        const { organisationList } = this.state;
        const { healthAreaList } = this.state;

        let realms = realmList.length > 0
            && realmList.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lan)}
                    </option>
                )
            }, this);

        let realmCountries = realmCountryList.length > 0
            && realmCountryList.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {getLabelText(item.country.label, this.state.lan)}
                    </option>
                )
            }, this);

        let realmOrganisation = organisationList.length > 0
            && organisationList.map((item, i) => {
                return (
                    <option key={i} value={item.organisationId}>
                        {getLabelText(item.label, this.state.lan)}
                    </option>
                )
            }, this);

        let realmHealthArea = healthAreaList.length > 0
            && healthAreaList.map((item, i) => {
                return (
                    <option key={i} value={item.healthAreaId}>
                        {getLabelText(item.label, this.state.lan)}
                    </option>
                )
            }, this);


        return (
            <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                <Card>
                    <Formik
                        initialValues={initialValues}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            AuthenticationService.setupAxiosInterceptors();
                            ProgramService.addProgram(this.state.program).then(response => {
                                // console.log(this.state.program);
                                // console.log(response);
                                if (response.status == "200") {
                                    console.log(response);
                                    this.props.history.push(`/program/listProgram/${response.data.message}`)
                                } else {
                                    this.setState({
                                        message: response.data.message
                                    })
                                }
                                
                            }
                            )
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
                                                    message: error.message
                                                })
                                                break
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
                                            <strong>{i18n.t('static.program.programadd')}</strong>
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
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
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
                                                        value={this.state.program.realm.realmId}
                                                        valid={!errors.realmId}
                                                        invalid={touched.realmId && !!errors.realmId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.getDependentLists(e) }}
                                                        onBlur={handleBlur}
                                                        type="select" name="realmId" id="realmId">
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {realms}
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
                                                        value={this.state.program.realmCountry.realmCountryId}
                                                        valid={!errors.realmCountryId}
                                                        invalid={touched.realmCountryId && !!errors.realmCountryId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.getRegionList(e) }}
                                                        onBlur={handleBlur}
                                                        type="select" name="realmCountryId" id="realmCountryId">
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {/* <option value="1">Country #1</option>
                                                        <option value="2">Country #2</option>
                                                        <option value="3">Country #3</option> */}
                                                        {realmCountries}
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
                                                        value={this.state.regionId}
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
                                                        value={this.state.program.organisation.organisationId}
                                                        valid={!errors.organisationId}
                                                        invalid={touched.organisationId && !!errors.organisationId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        type="select" name="organisationId" id="organisationId">
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {realmOrganisation}
                                                        {/* <option value="1">product #1</option>
                                                        <option value="2">product #2</option>
                                                        <option value="3">product #3</option> */}
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
                                                        value={this.state.program.healthArea.healthAreaId}
                                                        valid={!errors.healthAreaId}
                                                        invalid={touched.healthAreaId && !!errors.healthAreaId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur} type="select" name="healthAreaId" id="healthAreaId">
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {realmHealthArea}
                                                        {/* <option value="1">Health Area #1</option>
                                                        <option value="2">Health Area #2</option>
                                                        <option value="3">Health Area #3</option> */}
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
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        <option value="1">Anchal</option>
                                                        {/* <option value="2">Akil</option>
                                                        <option value="3">Sameer</option> */}
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
                                                        type="number" name="airFreightPerc" id="airFreightPerc" placeholder={i18n.t('static.program.airfreightperctext')} />
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
                                                        type="number" name="seaFreightPerc" id="seaFreightPerc" placeholder={i18n.t('static.program.seafreightperc')} />
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
                                                        type="number" name="plannedToDraftLeadTime" id="plannedToDraftLeadTime" placeholder={i18n.t('static.program.draftleadtext')} />
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
                                                        type="number" name="draftToSubmittedLeadTime" id="draftToSubmittedLeadTime" placeholder={i18n.t('static.program.drafttosubmittext')} />
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
                                                        type="number" name="submittedToApprovedLeadTime" id="submittedToApprovedLeadTime" placeholder={i18n.t('static.program.submittoapprovetext')} />
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
                                                        type="number" name="approvedToShippedLeadTime" id="approvedToShippedLeadTime" placeholder={i18n.t('static.program.approvetoshiptext')} />
                                                    <FormFeedback>{errors.approvedToShippedLeadTime}</FormFeedback>
                                                </Col>
                                            </FormGroup>
                                            <FormGroup>
                                                <Col md="5">
                                                    <Label htmlFor="company">{i18n.t('static.program.delivertoreceivetext')}</Label>
                                                </Col>
                                                <Col xs="12" md="9">
                                                    <Input
                                                        value={this.state.program.deliveredToReceivedLeadTime}
                                                        valid={!errors.deliveredToReceivedLeadTime}
                                                        invalid={touched.deliveredToReceivedLeadTime && !!errors.deliveredToReceivedLeadTime}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        type="number" name="deliveredToReceivedLeadTime" id="deliveredToReceivedLeadTime" placeholder={i18n.t('static.program.delivertoreceivetext')} />
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
                                                        type="number" name="monthsInPastForAmc" id="monthsInPastForAmc" placeholder={i18n.t('static.program.monthpastamctext')} />
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
                                                        type="number" name="monthsInFutureForAmc" id="monthsInFutureForAmc" placeholder={i18n.t('static.program.monthfutureamctext')} />
                                                    <FormFeedback>{errors.monthsInFutureForAmc}</FormFeedback>
                                                </Col>
                                            </FormGroup>

                                        </CardBody>
                                        <CardFooter>
                                            <FormGroup>
                                            {/* <Button type="reset" size="sm" color="warning" className="float-right mr-1"><i className="fa fa-refresh"></i> Reset</Button> */}
                                            <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                            <Button type="submit" size="sm" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')} </Button>
                                            {/* <Button type="submit" size="sm" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>Submit</Button> */}
                                            &nbsp;
                                        </FormGroup>
                                        </CardFooter>
                                    </Form>
                                )} />
                </Card>
            </Col>

        );
    }
    cancelClicked() {
        this.props.history.push(`/program/listProgram/` + "Action Canceled")
    }
}