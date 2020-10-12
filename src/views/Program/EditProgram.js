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
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import classNames from 'classnames';


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
    plannedToSubmittedLeadTime: '',
    submittedToApprovedLeadTime: '',
    approvedToShippedLeadTime: '',
    shippedToArrivedByAirLeadTime: '',
    shippedToArrivedBySeaLeadTime: '',
    arrivedToDeliveredLeadTime: '',
    healthAreaId: '',
    programNotes: '',
    regionId: [],
    uniqueCode:''
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
            .required(i18n.t('static.program.validairfreighttext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),
        seaFreightPerc: Yup.string()
            .required(i18n.t('static.program.validseafreighttext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),
        // deliveredToReceivedLeadTime: Yup.number()
        //     .required(i18n.t('static.program.validdelivertoreceivetext')).min(0, i18n.t('static.program.validvaluetext')),
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
            .required(i18n.t('static.program.validapprovetoshiptext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),
        shippedToArrivedBySeaLeadTime: Yup.string()
            .required(i18n.t('static.program.validapprovetoshiptext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),
        arrivedToDeliveredLeadTime: Yup.string()
            .required(i18n.t('static.program.validapprovetoshiptext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),
        healthAreaId: Yup.string()
            .required(i18n.t('static.program.validhealthareatext')),
        // programNotes: Yup.string()
        //     .required(i18n.t('static.program.validnotestext'))
        regionId: Yup.string()
            .required(i18n.t('static.common.regiontext')),
        uniqueCode: Yup.string()
            .matches(/^[a-zA-Z0-9_'\/-]*$/, i18n.t('static.common.alphabetNumericCharOnly'))
            .required(i18n.t('static.programOnboarding.validprogramCode')),
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
            loading: true

        }

        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.changeLoading = this.changeLoading.bind(this);
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
        ProgramService.getProgramById(this.props.match.params.programId).then(response => {
            console.log("program obj===>", response.data);
            var programCode = response.data.programCode;
            var splitCode = programCode.split("-");
            var uniqueCode = splitCode[3];
            this.setState({
                program: response.data, loading: false,
                uniqueCode: uniqueCode
            })
            // initialValues = {
            //     programName: getLabelText(this.state.program.label, lang),
            //     realmId: this.state.program.realmCountry.realm.realmId,
            //     realmCountryId: this.state.program.realmCountry.realmCountryId,
            //     organisationId: this.state.program.organisation.id,
            //     userId: this.state.program.programManager.userId,
            //     airFreightPerc: this.state.program.airFreightPerc,
            //     seaFreightPerc: this.state.program.seaFreightPerc,
            //     // deliveredToReceivedLeadTime: this.state.program.deliveredToReceivedLeadTime,
            //     plannedToSubmittedLeadTime: this.state.program.plannedToSubmittedLeadTime,
            //     submittedToApprovedLeadTime: this.state.program.submittedToApprovedLeadTime,
            //     approvedToShippedLeadTime: this.state.program.approvedToShippedLeadTime,
            //     shippedToArrivedByAirLeadTime: this.state.program.shippedToArrivedByAirLeadTime,
            //     shippedToArrivedBySeaLeadTime: this.state.program.shippedToArrivedBySeaLeadTime,
            //     arrivedToDeliveredLeadTime: this.state.program.arrivedToDeliveredLeadTime,
            //     healthAreaId: this.state.program.healthArea.id,
            //     programNotes: this.state.program.programNotes,
            //     regionArray: this.state.program.regionArray
            // }
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramManagerList(response.data.realmCountry.realm.realmId)
                .then(response => {
                    console.log("realm list---", response.data);
                    if (response.status == 200) {
                        this.setState({
                            programManagerList: response.data, loading: false
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
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
                            regionList: regList, loading: false
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
                        })
                    }
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
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

        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({
                        message: 'static.unkownError',
                        loading: false
                    });
                } else {
                    switch (error.response ? error.response.status : "") {

                        case 401:
                            this.props.history.push(`/login/static.message.sessionExpired`)
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
        if (event.target.name == 'uniqueCode') {
            var dname = this.state.program.programCode;
            var email_array = dname.split('-');
            var new_string = email_array[3];
            program.programCode = dname.replace(new_string,"").concat(event.target.value.toUpperCase());
            this.state.uniqueCode=event.target.value.toUpperCase()
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
            uniqueCode:''
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
                <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} loading={this.changeLoading} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    programName: getLabelText(this.state.program.label, lang),
                                    realmId: this.state.program.realmCountry.realm.realmId,
                                    realmCountryId: this.state.program.realmCountry.realmCountryId,
                                    organisationId: this.state.program.organisation.id,
                                    userId: this.state.program.programManager.userId,
                                    airFreightPerc: this.state.program.airFreightPerc,
                                    seaFreightPerc: this.state.program.seaFreightPerc,
                                    // deliveredToReceivedLeadTime: this.state.program.deliveredToReceivedLeadTime,
                                    plannedToSubmittedLeadTime: this.state.program.plannedToSubmittedLeadTime,
                                    submittedToApprovedLeadTime: this.state.program.submittedToApprovedLeadTime,
                                    approvedToShippedLeadTime: this.state.program.approvedToShippedLeadTime,
                                    shippedToArrivedByAirLeadTime: this.state.program.shippedToArrivedByAirLeadTime,
                                    shippedToArrivedBySeaLeadTime: this.state.program.shippedToArrivedBySeaLeadTime,
                                    arrivedToDeliveredLeadTime: this.state.program.arrivedToDeliveredLeadTime,
                                    healthAreaId: this.state.program.healthArea.id,
                                    programNotes: this.state.program.programNotes,
                                    regionArray: this.state.program.regionArray,
                                    regionId: this.state.program.regionArray
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    // AuthenticationService.setupAxiosInterceptors();
                                    ProgramService.editProgram(this.state.program).then(response => {
                                        if (response.status == 200) {
                                            this.props.history.push(`/program/listProgram/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode, loading: false
                                            },
                                                () => {
                                                    this.hideSecondComponent();
                                                })
                                        }

                                    }
                                    ).catch(
                                        error => {
                                            if (error.message === "Network Error") {
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false
                                                });
                                            } else {
                                                switch (error.response ? error.response.status : "") {

                                                    case 401:
                                                        this.props.history.push(`/login/static.message.sessionExpired`)
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

                                            <Form onSubmit={handleSubmit} noValidate name='programForm'>
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
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.programDisplayName')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            type="text" name="programCode" valid={!errors.programCode}
                                                            bsSize="sm"
                                                            invalid={touched.programCode && !!errors.programCode || this.state.program.programCode == ''}
                                                            readOnly
                                                            onBlur={handleBlur}
                                                            value={this.state.program.programCode}
                                                            id="programCode" />
                                                        <FormFeedback>{errors.programCode}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
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
                                                    </FormGroup>

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
                                                    <FormGroup className="Selectcontrol-bdrNone">
                                                        <Label htmlFor="select">{i18n.t('static.program.region')}<span class="red Reqasterisk">*</span></Label>
                                                        <Select
                                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                                { 'is-valid': !errors.regionId },
                                                                { 'is-invalid': (touched.regionId && !!errors.regionId || this.state.program.regionArray.length == 0) }
                                                            )}
                                                            bsSize="sm"
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                setFieldValue("regionId", e);
                                                                this.updateFieldData(e);
                                                            }}
                                                            onBlur={() => setFieldTouched("regionId", true)}
                                                            multi
                                                            options={this.state.regionList}
                                                            value={this.state.program.regionArray}
                                                        />
                                                        <FormFeedback>{errors.regionId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.organisation')}<span class="red Reqasterisk">*</span></Label>

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

                                                        <Label htmlFor="select">{i18n.t('static.program.healtharea')}<span class="red Reqasterisk">*</span></Label>

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
                                                            invalid={touched.userId && !!errors.userId || this.state.program.programManager.userId == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur} type="select" name="userId" id="userId">
                                                            {/* <option value="0">Please select</option> */}
                                                            {/* <option value="1">Anchal</option> */}
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {programManagers}

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
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
        // AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramById(this.props.match.params.programId).then(response => {
            var programCode = response.data.programCode;
            var splitCode = programCode.split("-");
            var uniqueCode = splitCode[3];
            this.setState({
                program: response.data,
                uniqueCode:uniqueCode
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
                plannedToSubmittedLeadTime: this.state.program.plannedToSubmittedLeadTime,
                submittedToApprovedLeadTime: this.state.program.submittedToApprovedLeadTime,
                approvedToShippedLeadTime: this.state.program.approvedToShippedLeadTime,
                shippedToArrivedByAirLeadTime: this.state.program.shippedToArrivedByAirLeadTime,
                shippedToArrivedBySeaLeadTime: this.state.program.shippedToArrivedBySeaLeadTime,
                arrivedToDeliveredLeadTime: this.state.program.arrivedToDeliveredLeadTime,
                healthAreaId: this.state.program.healthArea.id,
                programNotes: this.state.program.programNotes,
                regionArray: this.state.program.regionArray,
                uniqueCode:this.state.uniqueCode
            }
            // AuthenticationService.setupAxiosInterceptors();
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
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
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
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
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

        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({
                        message: 'static.unkownError',
                        loading: false
                    });
                } else {
                    switch (error.response ? error.response.status : "") {

                        case 401:
                            this.props.history.push(`/login/static.message.sessionExpired`)
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
}