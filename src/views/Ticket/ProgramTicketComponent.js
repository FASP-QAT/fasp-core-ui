import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import ProgramService from '../../api/ProgramService';
import getLabelText from '../../CommonComponent/getLabelText';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import HealthAreaService from '../../api/HealthAreaService';
import classNames from 'classnames';

const initialValues = {
    summary: "Add / Update Program",
    programName: '',
    realmId: '',
    realmCountryId: '',
    regionId: '',
    organisationId: '',
    healthAreaId: '',
    userId: '',
    airFreightPerc: '',
    seaFreightPerc: '',
    plannedToSubmittedLeadTime: '',
    submittedToApprovedLeadTime: '',
    approvedToShippedLeadTime: '',
    shippedToArrivedByAirLeadTime: '',
    shippedToArrivedBySeaLeadTime: '',
    arrivedToDeliveredLeadTime: '',    
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .required(i18n.t('static.common.summarytext')),
        programName: Yup.string()
            .required(i18n.t('static.program.validprogramtext')),
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        realmCountryId: Yup.string()
            .required(i18n.t('static.healtharea.countrytext')),
        regionId: Yup.string()
            .required(i18n.t('static.common.regiontext')),
        organisationId: Yup.string()
            .required(i18n.t('static.program.validorganisationtext')),
        healthAreaId: Yup.string()
            .required(i18n.t('static.program.validhealthareatext')),
        userId: Yup.string()
            .required(i18n.t('static.program.validmanagertext')),
        airFreightPerc: Yup.string()
            .required(i18n.t('static.program.validairfreighttext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),
        seaFreightPerc: Yup.string()
            .required(i18n.t('static.program.validseafreighttext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),
        plannedToSubmittedLeadTime: Yup.string()
            .required(i18n.t('static.program.validplantosubmittext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),
        submittedToApprovedLeadTime: Yup.string()
            .required(i18n.t('static.program.validsubmittoapprovetext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),
        approvedToShippedLeadTime: Yup.string()
            .required(i18n.t('static.program.validapprovetoshiptext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),
        shippedToArrivedByAirLeadTime: Yup.string()
            .required(i18n.t('static.program.shippedToArrivedByAirLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),
        shippedToArrivedBySeaLeadTime: Yup.string()
            .required(i18n.t('static.program.shippedToArrivedBySeaLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),
        arrivedToDeliveredLeadTime: Yup.string()
            .required(i18n.t('static.program.arrivedToDeliveredLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),        
        // notes: Yup.string()
        //     .required(i18n.t('static.common.notestext'))
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

export default class ProgramTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            program: {
                summary: "Add / Update Program",
                programName: '',
                realmId: '',
                realmCountryId: '',
                regionId: [],
                organisationId: '',
                healthAreaId: '',
                userId: '',
                airFreightPerc: '',
                seaFreightPerc: '',
                plannedToSubmittedLeadTime: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                shippedToArrivedByAirLeadTime: '',
                shippedToArrivedBySeaLeadTime: '',
                arrivedToDeliveredLeadTime: '',                
                notes: ""
            },
            message: '',
            realmId: '',
            realmList: [],
            realmCountryId: '',
            realmCountryList: [],
            organisationId: '',
            organisationList: [],
            healthAreaId: '',
            healthAreaList: [],
            programManagerId: '',
            programManagerList: [], 
            regionList: [],
            regionId: ''
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getDependentLists = this.getDependentLists.bind(this);
        this.getRegionList = this.getRegionList.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
    }

    dataChange(event) {
        let { program } = this.state
        if (event.target.name == "summary") {
            program.summary = event.target.value;
        }
        if (event.target.name == "programName") {
            program.programName = event.target.value;
        }
        if (event.target.name == "realmId") {            
            program.realmId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                realmId : event.target.value
            })            
        }
        if (event.target.name == "realmCountryId") {
            program.realmCountryId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                realmCountryId : event.target.value
            })            
        }
        if (event.target.name == "regionId") {
            program.regionId = event.target.value;
        }
        if (event.target.name == "organisationId") {
            program.organisationId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                organisationId : event.target.value
            })            
        }
        if (event.target.name == "healthAreaId") {
            program.healthAreaId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                healthAreaId : event.target.value
            })            
        }
        if (event.target.name == "userId") {
            program.userId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                programManagerId : event.target.value
            })            
        }
        if (event.target.name == "airFreightPerc") {
            program.airFreightPerc = event.target.value;
        }
        if (event.target.name == "seaFreightPerc") {
            program.seaFreightPerc = event.target.value;
        }
        if (event.target.name == "plannedToSubmittedLeadTime") {
            program.plannedToSubmittedLeadTime = event.target.value;
        }
        if (event.target.name == "submittedToApprovedLeadTime") {
            program.submittedToApprovedLeadTime = event.target.value;
        }
        if (event.target.name == "approvedToShippedLeadTime") {
            program.approvedToShippedLeadTime = event.target.value;
        }
        if (event.target.name == "shippedToArrivedByAirLeadTime") {
            program.shippedToArrivedByAirLeadTime = event.target.value;
        }
        if (event.target.name == "shippedToArrivedBySeaLeadTime") {
            program.shippedToArrivedBySeaLeadTime = event.target.value;
        }
        if (event.target.name == "arrivedToDeliveredLeadTime") {
            program.arrivedToDeliveredLeadTime = event.target.value;
        }        
        if (event.target.name == "notes") {
            program.notes = event.target.value;
        }
        this.setState({
            program
        }, () => { })
    };

    getDependentLists(e) {        
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramManagerList(e.target.value)
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

        ProgramService.getRealmCountryList(e.target.value)
            .then(response => {                
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

        ProgramService.getOrganisationList(e.target.value)
            .then(response => {                
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
        
        ProgramService.getHealthAreaList(e.target.value)
            .then(response => {
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
            regionIdArray[i] = regionId[i].label;
        }
        program.regionId = regionIdArray;
        this.setState({ program: program });
    }

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            programName: true,
            realmId: true,
            realmCountryId: true,
            regionId: true,
            organisationId: true,
            healthAreaId: true,
            userId: true,
            airFreightPerc: true,
            seaFreightPerc: true,
            plannedToSubmittedLeadTime: true,
            submittedToApprovedLeadTime: true,
            approvedToShippedLeadTime: true,
            shippedToArrivedByAirLeadTime: true,
            shippedToArrivedBySeaLeadTime: true,
            arrivedToDeliveredLeadTime: true,
            healthAreaId: true,
            notes: true
        })
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('simpleForm', (fieldName) => {
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

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { program } = this.state;
        program.summary = '';
        program.programName = '';
        program.realmId = '';
        program.realmCountryId = '';
        program.regionId = '';
        program.organisationId = '';
        program.healthAreaId = '';
        program.userId = '';
        program.airFreightPerc = '';
        program.seaFreightPerc = '';
        program.plannedToSubmittedLeadTime = '';
        program.submittedToApprovedLeadTime = '';
        program.approvedToShippedLeadTime = '';
        program.shippedToArrivedByAirLeadTime = '';
        program.shippedToArrivedBySeaLeadTime = '';
        program.arrivedToDeliveredLeadTime = '';        
        program.notes = '';
        this.setState({
            program
        },
            () => { });
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
            <div className="col-md-12">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.program.programMaster')}</h4>
                <br></br>
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        JiraTikcetService.addEmailRequestIssue(this.state.program).then(response => {                                     
                            console.log("Response :",response.status, ":" ,JSON.stringify(response.data));
                            if (response.status == 200 || response.status == 201) {
                                var msg = response.data.key;
                                this.setState({
                                    message: msg
                                },
                                    () => {
                                        this.resetClicked();
                                        this.hideSecondComponent();
                                    })                                
                            } else {
                                this.setState({
                                    // message: response.data.messageCode
                                    message: 'Error while creating query'
                                },
                                    () => {
                                        this.resetClicked();
                                        this.hideSecondComponent();
                                    })                                
                            }                            
                            this.props.togglehelp();
                            this.props.toggleSmall(this.state.message);
                        })
                        // .catch(
                        //     error => {
                        //         switch (error.message) {
                        //             case "Network Error":
                        //                 this.setState({
                        //                     message: 'Network Error'
                        //                 })
                        //                 break
                        //             default:
                        //                 this.setState({
                        //                     message: 'Error'
                        //                 })
                        //                 break
                        //         }
                        //         alert(this.state.message);
                        //         this.props.togglehelp();
                        //     }
                        // );  
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
                            handleReset,
                            setFieldValue,
                            setFieldTouched
                        }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm'>
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary"
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.program.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.program.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="programName">{i18n.t('static.program.program')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="programName" id="programName"
                                            bsSize="sm"
                                            valid={!errors.programName && this.state.program.programName != ''}
                                            invalid={touched.programName && !!errors.programName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.program.programName}
                                            required />
                                        <FormFeedback className="red">{errors.programName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="realmId">{i18n.t('static.program.realm')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmId" id="realmId"
                                            bsSize="sm"
                                            valid={!errors.realmId && this.state.program.realmId != ''}
                                            invalid={touched.realmId && !!errors.realmId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getDependentLists(e)}}
                                            onBlur={handleBlur}
                                            value={this.state.realmId}
                                            required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {realms}
                                            </Input>
                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="realmCountryId">{i18n.t('static.program.realmcountry')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmCountryId" id="realmCountryId"
                                            bsSize="sm"
                                            valid={!errors.realmCountryId && this.state.program.realmCountryId != ''}
                                            invalid={touched.realmCountryId && !!errors.realmCountryId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getRegionList(e)}}
                                            onBlur={handleBlur}
                                            value={this.state.realmCountryId}
                                            required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {realmCountries}
                                            </Input>
                                        <FormFeedback className="red">{errors.realmCountryId}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="regionId">{i18n.t('static.program.region')}<span class="red Reqasterisk">*</span></Label>
                                        <Select 
                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                { 'is-valid': !errors.regionId && this.state.program.regionId.length != 0 },
                                                { 'is-invalid': (touched.regionId && !!errors.regionId) }
                                            )}
                                            name="regionId" id="regionId"
                                            bsSize="sm"                                            
                                            onChange={(e) => { handleChange(e); setFieldValue("regionId", e); this.updateFieldData(e)}}
                                            onBlur={() => setFieldTouched("regionId", true)}
                                            multi
                                            options={this.state.regionList}
                                            value={this.state.regionId}
                                            required />
                                        <FormFeedback className="red">{errors.regionId}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="organisationId">{i18n.t('static.program.organisation')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="organisationId" id="organisationId"
                                            bsSize="sm"
                                            valid={!errors.organisationId && this.state.program.organisationId != ''}
                                            invalid={touched.organisationId && !!errors.organisationId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.organisationId}
                                            required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {realmOrganisation}
                                            </Input>
                                        <FormFeedback className="red">{errors.organisationId}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="healthAreaId">{i18n.t('static.program.healtharea')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="healthAreaId" id="healthAreaId"
                                            bsSize="sm"
                                            valid={!errors.healthAreaId && this.state.program.healthAreaId != ''}
                                            invalid={touched.healthAreaId && !!errors.healthAreaId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.healthAreaId}
                                            required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {realmHealthArea}
                                            </Input>
                                        <FormFeedback className="red">{errors.healthAreaId}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="userId">{i18n.t('static.program.programmanager')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="userId" id="userId"
                                            bsSize="sm"
                                            valid={!errors.userId && this.state.program.userId != ''}
                                            invalid={touched.userId && !!errors.userId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.programManagerId}
                                            required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {programManagers}
                                            </Input>
                                        <FormFeedback className="red">{errors.userId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="company">{i18n.t('static.program.airfreightperc')} (%) <span class="red ">*</span></Label>
                                        <Input
                                            value={this.state.program.airFreightPerc}
                                            bsSize="sm"
                                            valid={!errors.airFreightPerc && this.state.program.airFreightPerc != ''}
                                            invalid={touched.airFreightPerc && !!errors.airFreightPerc}
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
                                            valid={!errors.seaFreightPerc && this.state.program.seaFreightPerc != ''}
                                            invalid={touched.seaFreightPerc && !!errors.seaFreightPerc}
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
                                            valid={!errors.plannedToSubmittedLeadTime && this.state.program.plannedToSubmittedLeadTime != ''}
                                            invalid={touched.plannedToSubmittedLeadTime && !!errors.plannedToSubmittedLeadTime}
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
                                            valid={!errors.submittedToApprovedLeadTime && this.state.program.submittedToApprovedLeadTime != ''}
                                            invalid={touched.submittedToApprovedLeadTime && !!errors.submittedToApprovedLeadTime}
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
                                            valid={!errors.approvedToShippedLeadTime && this.state.program.approvedToShippedLeadTime != ''}
                                            invalid={touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            type="number"
                                            min="0"
                                            name="approvedToShippedLeadTime" id="approvedToShippedLeadTime" />
                                        <FormFeedback>{errors.approvedToShippedLeadTime}</FormFeedback>
                                    </FormGroup>
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
                                            name="shippedToArrivedByAirLeadTime" id="shippedToArrivedByAirLeadTime" />
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
                                            name="shippedToArrivedBySeaLeadTime" id="shippedToArrivedBySeaLeadTime" />
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
                                            name="arrivedToDeliveredLeadTime" id="arrivedToDeliveredLeadTime" />
                                        <FormFeedback>{errors.arrivedToDeliveredLeadTime}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.program.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.program.notes}
                                            // required 
                                            />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                </Form>
                            )} />
            </div>
        );
    }

}