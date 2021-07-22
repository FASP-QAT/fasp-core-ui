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
// import HealthAreaService from "../../api/HealthAreaService";
import getLabelText from '../../CommonComponent/getLabelText'
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import classNames from 'classnames';


const entityname = i18n.t('static.forecastProgram.forecastProgram');
let initialValues = {
    programName: '',
    realmId: '',
    realmCountryId: '',
    organisationId: '',
    userId: '',
    airFreightPerc: '',
    seaFreightPerc: '',
    // deliveredToReceivedLeadTime: '',
    plannedToSubmittedLeadTime: '',
    submittedToApprovedLeadTime: '',
    approvedToShippedLeadTime: '',
    shippedToArrivedByAirLeadTime: '',
    shippedToArrivedBySeaLeadTime: '',
    arrivedToDeliveredLeadTime: '',
    healthAreaId: '',
    programNotes: '',
    regionId: [],
    uniqueCode: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        programName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
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
            // .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount'))
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.validairfreighttext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        seaFreightPerc: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.validseafreighttext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        // deliveredToReceivedLeadTime: Yup.number()
        //     .required(i18n.t('static.program.validdelivertoreceivetext')).min(0, i18n.t('static.program.validvaluetext')),
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
            .required(i18n.t('static.program.shippedToArrivedByAirtext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        shippedToArrivedBySeaLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.shippedToArrivedBySeatext'))
            .min(0, i18n.t('static.program.validvaluetext')),
        arrivedToDeliveredLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.arrivedToReceivedLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext')),
        healthAreaId: Yup.string()
            .required(i18n.t('static.program.validhealthareatext')),
        // programNotes: Yup.string()
        //     .required(i18n.t('static.program.validnotestext'))
        regionId: Yup.string()
            .required(i18n.t('static.common.regiontext')),
        // uniqueCode: Yup.string()
        //     .matches(/^[a-zA-Z0-9_'\/-]*$/, i18n.t('static.common.alphabetNumericCharOnly'))
        //     .required(i18n.t('static.programOnboarding.validprogramCode')),
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
export default class AddForecastProgram extends Component {
    constructor(props) {
        console.log("in constructor");
        super(props);
        this.state = {
            // program: this.props.location.state.program,
            uniqueCode: '',
            program: {
                programCode: '<%RC%>-<%TA%>-<%OR%>-',
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
                plannedToSubmittedLeadTime: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                shippedToArrivedByAirLeadTime: '',
                shippedToArrivedBySeaLeadTime: '',
                arrivedToDeliveredLeadTime: '',
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
            message: '',
            loading: true,
            healthAreaCode: '',
            organisationCode: '',
            realmCountryCode: ''

        }

        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.changeLoading = this.changeLoading.bind(this);
        this.generateHealthAreaCode = this.generateHealthAreaCode.bind(this);
        this.generateOrganisationCode = this.generateOrganisationCode.bind(this);
    }

    changeMessage(message) {
        this.setState({ message: message })
    }

    changeLoading(loading) {
        this.setState({ loading: loading })
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    Capitalize(str) {
        let { program } = this.state
        program.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        this.setState({
            loading: false
        })



    }

    generateHealthAreaCode(event) {
        let healthAreaCode = this.state.healthAreaList.filter(c => (c.healthAreaId == event.target.value))[0].healthAreaCode;
        this.setState({
            healthAreaCode: healthAreaCode
        })
    }

    generateOrganisationCode(event) {
        let organisationCode = this.state.organisationList.filter(c => (c.organisationId == event.target.value))[0].organisationCode;
        this.setState({
            organisationCode: organisationCode
        })
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
        if (event.target.name == 'plannedToSubmittedLeadTime') {
            program.plannedToSubmittedLeadTime = event.target.value;
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
        } if (event.target.name == 'healthAreaId') {
            program.healthArea.id = event.target.value;
        } if (event.target.name == 'userId') {
            program.programManager.userId = event.target.value;
        }
        if (event.target.name === "active") {
            program.active = event.target.id === "active2" ? false : true
        }
        if (event.target.name == 'programCode1') {
            this.setState({
                uniqueCode: event.target.value
            })
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
            plannedToSubmittedLeadTime: true,
            submittedToApprovedLeadTime: true,
            approvedToShippedLeadTime: true,
            shippedToArrivedByAirLeadTime: true,
            shippedToArrivedBySeaLeadTime: true,
            arrivedToDeliveredLeadTime: true,
            healthAreaId: true,
            regionId: true,
            // uniqueCode:''
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
        // const { programManagerList } = this.state;
        // let programManagers = programManagerList.length > 0
        //     && programManagerList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.userId}>
        //                 {item.username}
        //             </option>
        //         )
        //     }, this);
        // const { healthAreaList } = this.state;
        // let realmHealthArea = healthAreaList.length > 0
        //     && healthAreaList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.healthAreaId}>
        //                 {/* {item.healthAreaCode} */}
        //                 {getLabelText(item.label, this.state.lang)}
        //             </option>
        //         )
        //     }, this);

        // const { organisationList } = this.state;
        // let realmOrganisation = organisationList.length > 0
        //     && organisationList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.organisationId}>
        //                 {/* {item.organisationCode} */}
        //                 {getLabelText(item.label, this.state.lang)}
        //             </option>
        //         )
        //     }, this);


        return (

            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} loading={this.changeLoading} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}

                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    // this.setState({
                                    //     loading: true
                                    // })
                                    // AuthenticationService.setupAxiosInterceptors();


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

                                            <Form onSubmit={handleSubmit} noValidate name='programForm' autocomplete="off">
                                                {/* <CardHeader>
                                                    <strong>{i18n.t('static.common.editEntity', { entityname })}</strong>
                                                </CardHeader> */}
                                                <CardBody>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.program')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            type="text" name="programName" valid={!errors.programName}
                                                            bsSize="sm"
                                                            // invalid={touched.programName && !!errors.programName || this.state.program.label.label_en == ''}
                                                            invalid={touched.programName && !!errors.programName || !!errors.programName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.program.label.label_en}
                                                            id="programName" />
                                                        <FormFeedback>{errors.programName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup style={{ display: 'flex' }}>
                                                        <Col xs="6" className="pl-0">
                                                            <FormGroup >
                                                                <Label htmlFor="company">{i18n.t('static.program.programCode')}</Label>
                                                                <Input
                                                                    type="text" name="programCode"
                                                                    bsSize="sm"
                                                                    disabled
                                                                    value={this.state.realmCountryCode + "-" + this.state.healthAreaCode + "-" + this.state.organisationCode}
                                                                    id="programCode" />
                                                                <FormFeedback className="red">{errors.programCode}</FormFeedback>
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
                                                                    // valid={!errors.airFreightPerc && this.props.items.program.airFreightPerc != ''}
                                                                    // invalid={touched.airFreightPerc && !!errors.airFreightPerc}
                                                                    bsSize="sm"
                                                                    onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                    type="text"
                                                                    maxLength={6}
                                                                    value={this.state.uniqueCode}
                                                                    disabled={!AuthenticationService.getLoggedInUserRoleIdArr().includes("ROLE_APPLICATION_ADMIN") ? true : false}
                                                                    name="programCode1" id="programCode1" />
                                                                <FormFeedback className="red">{errors.programCode1}</FormFeedback>
                                                            </FormGroup>
                                                        </Col>
                                                    </FormGroup>

                                                    {/* <FormGroup>
                                                        <Label htmlFor="company">{i18n.t('static.programOnboarding.programCode')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="text"
                                                            name="uniqueCode"
                                                            bsSize="sm"
                                                            onBlur={handleBlur}
                                                            valid={!errors.uniqueCode && this.state.uniqueCode != ''}
                                                            invalid={touched.uniqueCode && !!errors.uniqueCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            id="uniqueCode"
                                                            value={this.state.uniqueCode}
                                                            required
                                                            maxLength={6}
                                                        />
                                                        <FormFeedback className="red">{errors.uniqueCode}</FormFeedback>
                                                    </FormGroup> */}

                                                    <FormGroup>

                                                        <Label htmlFor="select">{i18n.t('static.program.realm')}<span class="red Reqasterisk">*</span></Label>

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
                                                        <Label htmlFor="select">{i18n.t('static.program.realmcountry')}<span class="red Reqasterisk">*</span></Label>

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

                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.organisation')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            valid={!errors.organisationId && this.state.program.organisation.id != ''}
                                                            invalid={touched.organisationId && !!errors.organisationId}
                                                            onBlur={handleBlur}
                                                            bsSize="sm"
                                                            type="select"
                                                            name="organisationId"
                                                            id="organisationId"
                                                            disabled={!AuthenticationService.getLoggedInUserRoleIdArr().includes("ROLE_APPLICATION_ADMIN") ? true : false}
                                                            value={this.state.program.organisation.id}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.generateOrganisationCode(e) }}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {/* {realmOrganisation} */}

                                                        </Input>

                                                        <FormFeedback className="red">{errors.organisationId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.healtharea')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            valid={!errors.healthAreaId && this.state.program.healthArea.id != ''}
                                                            invalid={touched.healthAreaId && !!errors.healthAreaId}
                                                            onBlur={handleBlur}
                                                            bsSize="sm"
                                                            type="select"
                                                            name="healthAreaId"
                                                            id="healthAreaId"
                                                            disabled={!AuthenticationService.getLoggedInUserRoleIdArr().includes("ROLE_APPLICATION_ADMIN") ? true : false}
                                                            value={this.state.program.healthArea.id}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.generateHealthAreaCode(e); }}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {/* {realmHealthArea} */}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.healthAreaId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.programmanager')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            value={this.state.program.programManager.userId}
                                                            bsSize="sm"
                                                            valid={!errors.userId}
                                                            invalid={touched.userId && !!errors.userId || this.state.program.programManager.userId == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur} type="select" name="userId" id="userId">
                                                            {/* <option value="0">Please select</option> */}
                                                            {/* <option value="1">Anchal</option> */}
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {/* {programManagers} */}

                                                        </Input>
                                                        <FormFeedback>{errors.userId}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="select">{i18n.t('static.program.notes')}</Label>

                                                        <Input
                                                            value={this.state.program.programNotes}
                                                            bsSize="sm"
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            // maxLength={600}
                                                            type="textarea" name="programNotes" id="programNotes" />
                                                        <FormFeedback>{errors.programNotes}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.airfreightperc')} (%) <span class="red ">*</span></Label>

                                                        <Input
                                                            value={this.state.program.airFreightPerc}
                                                            bsSize="sm"
                                                            valid={!errors.airFreightPerc}
                                                            invalid={touched.airFreightPerc && !!errors.airFreightPerc || this.state.program.airFreightPerc == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="airFreightPerc" id="airFreightPerc" />
                                                        <FormFeedback>{errors.airFreightPerc}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.seafreightperc')} (%) <span class="red ">*</span></Label>

                                                        <Input
                                                            value={this.state.program.seaFreightPerc}
                                                            bsSize="sm"
                                                            valid={!errors.seaFreightPerc}
                                                            invalid={touched.seaFreightPerc && !!errors.seaFreightPerc || this.state.program.seaFreightPerc == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="seaFreightPerc" id="seaFreightPerc" />
                                                        <FormFeedback>{errors.seaFreightPerc}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.planleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.plannedToSubmittedLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.plannedToSubmittedLeadTime}
                                                            invalid={touched.plannedToSubmittedLeadTime && !!errors.plannedToSubmittedLeadTime || this.state.program.plannedToSubmittedLeadTime == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="plannedToSubmittedLeadTime" id="plannedToSubmittedLeadTime" />
                                                        <FormFeedback>{errors.plannedToSubmittedLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.submittoapproveleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.submittedToApprovedLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.submittedToApprovedLeadTime}
                                                            invalid={touched.submittedToApprovedLeadTime && !!errors.submittedToApprovedLeadTime || this.state.program.submittedToApprovedLeadTime == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="submittedToApprovedLeadTime" id="submittedToApprovedLeadTime" />
                                                        <FormFeedback>{errors.submittedToApprovedLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.approvetoshipleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.approvedToShippedLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.approvedToShippedLeadTime}
                                                            invalid={touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime || this.state.program.approvedToShippedLeadTime == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="approvedToShippedLeadTime" id="approvedToShippedLeadTime" />
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
                                                            invalid={touched.shippedToArrivedByAirLeadTime && !!errors.shippedToArrivedByAirLeadTime || this.state.program.shippedToArrivedByAirLeadTime == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="shippedToArrivedByAirLeadTime" id="shippedToArrivedByAirLeadTime" />
                                                        <FormFeedback>{errors.shippedToArrivedByAirLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.realmcountry.shippedToArrivedSeaLeadTime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.shippedToArrivedBySeaLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.shippedToArrivedBySeaLeadTime && this.state.program.shippedToArrivedBySeaLeadTime != ''}
                                                            invalid={touched.shippedToArrivedBySeaLeadTime && !!errors.shippedToArrivedBySeaLeadTime || this.state.program.shippedToArrivedBySeaLeadTime == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="shippedToArrivedBySeaLeadTime" id="shippedToArrivedBySeaLeadTime" />
                                                        <FormFeedback>{errors.shippedToArrivedBySeaLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.realmcountry.arrivedToDeliveredLeadTime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.arrivedToDeliveredLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.arrivedToDeliveredLeadTime && this.state.program.arrivedToDeliveredLeadTime != ''}
                                                            invalid={touched.arrivedToDeliveredLeadTime && !!errors.arrivedToDeliveredLeadTime || this.state.program.arrivedToDeliveredLeadTime == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            name="arrivedToDeliveredLeadTime" id="arrivedToDeliveredLeadTime" />
                                                        <FormFeedback>{errors.arrivedToDeliveredLeadTime}</FormFeedback>

                                                    </FormGroup>



                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        &nbsp;
                                            </FormGroup>
                                                </CardFooter>
                                            </Form>
                                        )} />
                        </Card>
                    </Col>
                </Row>
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
    cancelClicked() {
        this.props.history.push(`/program/listProgram/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { forecastMethod } = this.state
        forecastMethod.label.label_en = '';

        this.setState({
            forecastMethod
        },
            () => { });
    }
}