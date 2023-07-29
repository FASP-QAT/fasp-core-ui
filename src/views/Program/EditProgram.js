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
import getLabelText from '../../CommonComponent/getLabelText'
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import classNames from 'classnames';
import { API_URL, MAX_PROGRAM_CODE_LENGTH } from "../../Constants";
import DropdownService from "../../api/DropdownService";


const entityname = i18n.t('static.program.programMaster');
let initialValues = {
    programName: '',
    realmId: '',
    realmCountryId: '',
    organisationId: '',
    userId: '',
    airFreightPerc: '',
    seaFreightPerc: '',
    roadFreightPerc: '',
    // deliveredToReceivedLeadTime: '',
    plannedToSubmittedLeadTime: '',
    submittedToApprovedLeadTime: '',
    approvedToShippedLeadTime: '',
    shippedToArrivedByAirLeadTime: '',
    shippedToArrivedBySeaLeadTime: '',
    shippedToArrivedByLandLeadTime: '',
    arrivedToDeliveredLeadTime: '',
    healthAreaId: [],
    programNotes: '',
    regionId: [],
    programCode1: ''
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
        roadFreightPerc: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.validroadfreighttext'))
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
        shippedToArrivedByRoadLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.program.shippedToArrivedByRoadtext'))
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
        programCode1: Yup.string()
            .test('programCode', i18n.t('static.programValidation.programCode'),
                function (value) {
                    if (parseInt(document.getElementById("programCode").value.length + value.length) > MAX_PROGRAM_CODE_LENGTH) {
                        return false;
                    } else {
                        return true;
                    }
                }),
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
                roadFreightPerc: '',
                // deliveredToReceivedLeadTime: '',
                plannedToSubmittedLeadTime: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                shippedToArrivedByAirLeadTime: '',
                shippedToArrivedBySeaLeadTime: '',
                shippedToArrivedByRoadLeadTime: '',
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
                healthAreaArray: []


            },
            // regionList: [{ value: '1', label: 'R1' },
            // { value: '2', label: 'R2' },
            // { value: '3', label: 'R3' }],
            regionId: '',
            healthAreaId: '',
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
        this.updateFieldDataHealthArea = this.updateFieldDataHealthArea.bind(this);
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
        }, 30000);
    }

    Capitalize(str) {
        let { program } = this.state
        program.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramById(this.props.match.params.programId).then(response => {
            var proObj = response.data;
            // var healthAreaArrayDummy=[];
            // healthAreaArrayDummy.push(response.data.healthArea.id);
            // proObj.healthAreaArray=healthAreaArrayDummy;

            var programCode = response.data.programCode;
            var splitCode = programCode.split("-");
            var uniqueCode = splitCode[3];
            // 0     1     2   3   4
            // "MOZ-VMMC-MOH-[CDC-ICAP]"

            if (splitCode.length > 4) {
                uniqueCode = programCode.substring(programCode.indexOf(splitCode[3]), programCode.length);
            }
            var realmCountryCode = splitCode[0];
            var healthAreaCode = splitCode[1];
            var organisationCode = splitCode[2];
            if (uniqueCode == undefined) {
                uniqueCode = ""
            }
            this.setState({
                program: proObj,
                loading: false,
                uniqueCode: uniqueCode,
                healthAreaCode: healthAreaCode,
                organisationCode: organisationCode,
                realmCountryCode: realmCountryCode
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

            // ProgramService.getProgramManagerList(response.data.realmCountry.realm.realmId)
            ProgramService.getProgramManagerListByProgramId(this.props.match.params.programId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = a.username.toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = b.username.toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
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
                                // message: 'static.unkownError',
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                        var json = response.data;
                        var regList = [];
                        for (var i = 0; i < json.length; i++) {
                            regList[i] = { value: json[i].regionId, label: getLabelText(json[i].label, this.state.lan) }
                        }
                        regList.sort((a, b) => {
                            var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
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
                                // message: 'static.unkownError',
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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

            DropdownService.getOrganisationListByRealmCountryId(response.data.realmCountry.realmCountryId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            organisationList: listArray
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
                                // message: 'static.unkownError',
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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

            ProgramService.getHealthAreaListByRealmCountryId(response.data.realmCountry.realmCountryId)
                .then(response => {
                    if (response.status == 200) {
                        var haList = [];
                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")) {
                            var json = response.data;
                            for (var i = 0; i < json.length; i++) {
                                haList[i] = { healthAreaCode: json[i].healthAreaCode, value: json[i].healthAreaId, label: getLabelText(json[i].label, this.state.lang) }
                            }
                        } else {
                            var json = this.state.program.healthAreaList;
                            for (var i = 0; i < json.length; i++) {
                                haList[i] = { healthAreaCode: json[i].code, value: json[i].id, label: getLabelText(json[i].label, this.state.lang) }
                            }
                        }

                        var listArray = haList;
                        listArray.sort((a, b) => {
                            var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            healthAreaId: '',
                            healthAreaList: listArray
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
                                // message: 'static.unkownError',
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                        // message: 'static.unkownError',
                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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

    generateHealthAreaCode(value) {
        var healthAreaId = value;
        let healthAreaCode = ''
        for (var i = 0; i < healthAreaId.length; i++) {
            healthAreaCode += this.state.healthAreaList.filter(c => (c.value == healthAreaId[i].value))[0].healthAreaCode + "/";
        }
        this.setState({
            healthAreaCode: healthAreaCode.slice(0, -1)
        })
    }

    generateOrganisationCode(event) {
        let organisationCode = this.state.organisationList.filter(c => (c.id == event.target.value))[0].code;
        this.setState({
            organisationCode: organisationCode
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
    updateFieldDataHealthArea(value) {
        let { program } = this.state;
        this.setState({ healthAreaId: value });
        var healthAreaId = value;
        var healthAreaIdArray = [];
        for (var i = 0; i < healthAreaId.length; i++) {
            healthAreaIdArray[i] = healthAreaId[i].value;
        }
        program.healthAreaArray = healthAreaIdArray;
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
        }if (event.target.name == 'roadFreightPerc') {
            program.roadFreightPerc = event.target.value;
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
        if (event.target.name == 'shippedToArrivedByRoadLeadTime') {
            program.shippedToArrivedByRoadLeadTime = event.target.value;
        }
        if (event.target.name == 'arrivedToDeliveredLeadTime') {
            program.arrivedToDeliveredLeadTime = event.target.value;
        }
        // if (event.target.name == 'healthAreaId') {
        //     program.healthArea.id = event.target.value;
        // } 
        if (event.target.name == 'userId') {
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

        this.setState({ program }, () => {})

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
            roadFreightPerc: true,
            // deliveredToReceivedLeadTime: true,
            plannedToSubmittedLeadTime: true,
            submittedToApprovedLeadTime: true,
            approvedToShippedLeadTime: true,
            shippedToArrivedByAirLeadTime: true,
            shippedToArrivedBySeaLeadTime: true,
            shippedToArrivedByRoadLeadTime: true,
            arrivedToDeliveredLeadTime: true,
            healthAreaId: true,
            regionId: true,
            programCode1: true
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
        const { programManagerList } = this.state;
        let programManagers = programManagerList.length > 0
            && programManagerList.map((item, i) => {
                return (
                    <option key={i} value={item.userId}>
                        {item.username}
                    </option>
                )
            }, this);
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

        const { organisationList } = this.state;
        let realmOrganisation = organisationList.length > 0
            && organisationList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {/* {item.organisationCode} */}
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);


        return (

            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} loading={this.changeLoading} />
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
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
                                    roadFreightPerc: this.state.program.roadFreightPerc,
                                    // deliveredToReceivedLeadTime: this.state.program.deliveredToReceivedLeadTime,
                                    plannedToSubmittedLeadTime: this.state.program.plannedToSubmittedLeadTime,
                                    submittedToApprovedLeadTime: this.state.program.submittedToApprovedLeadTime,
                                    approvedToShippedLeadTime: this.state.program.approvedToShippedLeadTime,
                                    shippedToArrivedByAirLeadTime: this.state.program.shippedToArrivedByAirLeadTime,
                                    shippedToArrivedBySeaLeadTime: this.state.program.shippedToArrivedBySeaLeadTime,
                                    shippedToArrivedByRoadLeadTime: this.state.program.shippedToArrivedByRoadLeadTime,
                                    arrivedToDeliveredLeadTime: this.state.program.arrivedToDeliveredLeadTime,
                                    healthAreaId: this.state.program.healthAreaArray,
                                    healthAreaArray: this.state.program.healthAreaArray,
                                    programNotes: this.state.program.programNotes,
                                    regionArray: this.state.program.regionArray,
                                    regionId: this.state.program.regionArray,
                                    programCode1: this.state.uniqueCode,
                                    programCode: this.state.realmCountryCode + "-" + this.state.healthAreaCode + "-" + this.state.organisationCode
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    // AuthenticationService.setupAxiosInterceptors();
                                    let pro = this.state.program;
                                    pro.programCode = this.state.realmCountryCode + "-" + this.state.healthAreaCode + "-" + this.state.organisationCode + (this.state.uniqueCode.toString().length > 0 ? ("-" + this.state.uniqueCode) : "");
                                    ProgramService.editProgram(pro).then(response => {
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
                                                    // message: 'static.unkownError',
                                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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

                                        <Form onSubmit={handleSubmit} noValidate name='programForm' autocomplete="off">
                                            {/* <CardHeader>
                                                    <strong>{i18n.t('static.common.editEntity', { entityname })}</strong>
                                                </CardHeader> */}
                                            <CardBody>
                                                <Row>
                                            <FormGroup style={{ display: 'flex' }} className="col-md-6">
                                                    <Col xs="6" className="pl-0">
                                                        <FormGroup >
                                                            <Label htmlFor="company">{i18n.t('static.program.programCode')}</Label>
                                                            <Input
                                                                type="text" name="programCode"
                                                                valid={!errors.programCode1 && this.state.uniqueCode != ''}
                                                                invalid={touched.programCode1 && !!errors.programCode1}
                                                                bsSize="sm"
                                                                disabled
                                                                value={this.state.realmCountryCode + "-" + this.state.healthAreaCode + "-" + this.state.organisationCode}
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
                                                                // valid={!errors.airFreightPerc && this.props.items.program.airFreightPerc != ''}
                                                                // invalid={touched.airFreightPerc && !!errors.airFreightPerc}
                                                                bsSize="sm"
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                type="text"
                                                                maxLength={6}
                                                                value={this.state.uniqueCode}
                                                                disabled={!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN") ? true : false}
                                                                name="programCode1" id="programCode1" />
                                                            {/* <FormFeedback className="red">{errors.programCode1}</FormFeedback> */}
                                                        </FormGroup>
                                                    </Col>
                                                </FormGroup>
                                                <FormGroup className="col-md-6">

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

                                                <FormGroup className="col-md-4">

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
                                                <FormGroup className="col-md-4">
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
                                                <FormGroup  className="col-md-4">
                                                    <Label htmlFor="select">{i18n.t('static.program.organisation')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        valid={!errors.organisationId && this.state.program.organisation.id != ''}
                                                        invalid={touched.organisationId && !!errors.organisationId}
                                                        onBlur={handleBlur}
                                                        bsSize="sm"
                                                        type="select"
                                                        name="organisationId"
                                                        id="organisationId"
                                                        disabled={!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN") ? true : false}
                                                        value={this.state.program.organisation.id}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.generateOrganisationCode(e) }}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {realmOrganisation}

                                                    </Input>

                                                    <FormFeedback className="red">{errors.organisationId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup className="Selectcontrol-bdrNone" className="col-md-6">
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

                                                <FormGroup className="col-md-6">
                                                    <Label htmlFor="select">{i18n.t('static.program.healtharea')}<span class="red Reqasterisk">*</span></Label>
                                                    <Select
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.healthAreaId },
                                                            { 'is-invalid': (touched.healthAreaId && !!errors.healthAreaId || this.state.program.healthAreaArray.length == 0) }
                                                        )}
                                                        bsSize="sm"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue("healthAreaId", e);
                                                            this.updateFieldDataHealthArea(e);
                                                            this.generateHealthAreaCode(e);
                                                        }}
                                                        onBlur={() => setFieldTouched("healthAreaId", true)}
                                                        multi
                                                        options={this.state.healthAreaList}
                                                        value={this.state.program.healthAreaArray}
                                                        disabled={!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN") ? true : false}
                                                        name="healthAreaId"
                                                        id="healthAreaId"

                                                    />

                                                    {/* <Input
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
                                                            {realmHealthArea}
                                                        </Input> */}
                                                    <FormFeedback className="red">{errors.healthAreaId}</FormFeedback>
                                                </FormGroup>

                                                <FormGroup className="col-md-6">
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
                                                <FormGroup className="col-md-6">

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
                                                <FormGroup className="col-md-4">

                                                    <Label htmlFor="company">{i18n.t('static.program.airfreightperc')} (%) <span class="red ">*</span></Label>

                                                    <Input
                                                        value={this.state.program.airFreightPerc}
                                                        bsSize="sm"
                                                        valid={!errors.airFreightPerc}
                                                        invalid={touched.airFreightPerc && !!errors.airFreightPerc || this.state.program.airFreightPerc === ''}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        type="number"
                                                        min="0"
                                                        name="airFreightPerc" id="airFreightPerc" />
                                                    <FormFeedback>{errors.airFreightPerc}</FormFeedback>

                                                </FormGroup>
                                                <FormGroup className="col-md-4">

                                                    <Label htmlFor="company">{i18n.t('static.program.seafreightperc')} (%) <span class="red ">*</span></Label>

                                                    <Input
                                                        value={this.state.program.seaFreightPerc}
                                                        bsSize="sm"
                                                        valid={!errors.seaFreightPerc}
                                                        invalid={touched.seaFreightPerc && !!errors.seaFreightPerc || this.state.program.seaFreightPerc === ''}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        type="number"
                                                        min="0"
                                                        name="seaFreightPerc" id="seaFreightPerc" />
                                                    <FormFeedback>{errors.seaFreightPerc}</FormFeedback>

                                                </FormGroup>
                                                <FormGroup className="col-md-4">

                                                    <Label htmlFor="company">{i18n.t('static.program.roadfreightperc')} (%) <span class="red ">*</span></Label>

                                                    <Input
                                                        value={this.state.program.roadFreightPerc}
                                                        bsSize="sm"
                                                        valid={!errors.roadFreightPerc}
                                                        invalid={touched.roadFreightPerc && !!errors.roadFreightPerc || this.state.program.roadFreightPerc === ''}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        type="number"
                                                        min="0"
                                                        name="roadFreightPerc" id="roadFreightPerc" />
                                                    <FormFeedback>{errors.roadFreightPerc}</FormFeedback>

                                                </FormGroup>
                                                <FormGroup className="col-md-4">

                                                    <Label htmlFor="company">{i18n.t('static.program.planleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                    <Input
                                                        value={this.state.program.plannedToSubmittedLeadTime}
                                                        bsSize="sm"
                                                        valid={!errors.plannedToSubmittedLeadTime}
                                                        invalid={touched.plannedToSubmittedLeadTime && !!errors.plannedToSubmittedLeadTime || this.state.program.plannedToSubmittedLeadTime === ''}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        type="number"
                                                        min="0"
                                                        name="plannedToSubmittedLeadTime" id="plannedToSubmittedLeadTime" />
                                                    <FormFeedback>{errors.plannedToSubmittedLeadTime}</FormFeedback>

                                                </FormGroup>
                                                <FormGroup className="col-md-4">

                                                    <Label htmlFor="company">{i18n.t('static.program.submittoapproveleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                    <Input
                                                        value={this.state.program.submittedToApprovedLeadTime}
                                                        bsSize="sm"
                                                        valid={!errors.submittedToApprovedLeadTime}
                                                        invalid={touched.submittedToApprovedLeadTime && !!errors.submittedToApprovedLeadTime || this.state.program.submittedToApprovedLeadTime === ''}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        type="number"
                                                        min="0"
                                                        name="submittedToApprovedLeadTime" id="submittedToApprovedLeadTime" />
                                                    <FormFeedback>{errors.submittedToApprovedLeadTime}</FormFeedback>

                                                </FormGroup>
                                                <FormGroup className="col-md-4">

                                                    <Label htmlFor="company">{i18n.t('static.program.approvetoshipleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                    <Input
                                                        value={this.state.program.approvedToShippedLeadTime}
                                                        bsSize="sm"
                                                        valid={!errors.approvedToShippedLeadTime}
                                                        invalid={touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime || this.state.program.approvedToShippedLeadTime === ''}
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
                                                <FormGroup className="col-md-4">

                                                    <Label htmlFor="company">{i18n.t('static.realmcountry.shippedToArrivedAirLeadTime')}<span class="red Reqasterisk">*</span></Label>

                                                    <Input
                                                        value={this.state.program.shippedToArrivedByAirLeadTime}
                                                        bsSize="sm"
                                                        valid={!errors.shippedToArrivedByAirLeadTime && this.state.program.shippedToArrivedByAirLeadTime != ''}
                                                        invalid={touched.shippedToArrivedByAirLeadTime && !!errors.shippedToArrivedByAirLeadTime || this.state.program.shippedToArrivedByAirLeadTime === ''}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        type="number"
                                                        min="0"
                                                        name="shippedToArrivedByAirLeadTime" id="shippedToArrivedByAirLeadTime" />
                                                    <FormFeedback>{errors.shippedToArrivedByAirLeadTime}</FormFeedback>

                                                </FormGroup>
                                                <FormGroup className="col-md-4">

                                                    <Label htmlFor="company">{i18n.t('static.realmcountry.shippedToArrivedSeaLeadTime')}<span class="red Reqasterisk">*</span></Label>

                                                    <Input
                                                        value={this.state.program.shippedToArrivedBySeaLeadTime}
                                                        bsSize="sm"
                                                        valid={!errors.shippedToArrivedBySeaLeadTime && this.state.program.shippedToArrivedBySeaLeadTime != ''}
                                                        invalid={touched.shippedToArrivedBySeaLeadTime && !!errors.shippedToArrivedBySeaLeadTime || this.state.program.shippedToArrivedBySeaLeadTime === ''}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        type="number"
                                                        min="0"
                                                        name="shippedToArrivedBySeaLeadTime" id="shippedToArrivedBySeaLeadTime" />
                                                    <FormFeedback>{errors.shippedToArrivedBySeaLeadTime}</FormFeedback>

                                                </FormGroup>
                                                <FormGroup className="col-md-4">

                                                    <Label htmlFor="company">{i18n.t('static.realmcountry.shippedToArrivedRoadLeadTime')}<span class="red Reqasterisk">*</span></Label>

                                                    <Input
                                                        value={this.state.program.shippedToArrivedByRoadLeadTime}
                                                        bsSize="sm"
                                                        valid={!errors.shippedToArrivedByRoadLeadTime && this.state.program.shippedToArrivedByRoadLeadTime != ''}
                                                        invalid={touched.shippedToArrivedByRoadLeadTime && !!errors.shippedToArrivedByRoadLeadTime || this.state.program.shippedToArrivedByRoadLeadTime === ''}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        type="number"
                                                        min="0"
                                                        name="shippedToArrivedByRoadLeadTime" id="shippedToArrivedByRoadLeadTime" />
                                                    <FormFeedback>{errors.shippedToArrivedByRoadLeadTime}</FormFeedback>

                                                </FormGroup>
                                                <FormGroup className="col-md-4">

                                                    <Label htmlFor="company">{i18n.t('static.realmcountry.arrivedToDeliveredLeadTime')}<span class="red Reqasterisk">*</span></Label>

                                                    <Input
                                                        value={this.state.program.arrivedToDeliveredLeadTime}
                                                        bsSize="sm"
                                                        valid={!errors.arrivedToDeliveredLeadTime && this.state.program.arrivedToDeliveredLeadTime != ''}
                                                        invalid={touched.arrivedToDeliveredLeadTime && !!errors.arrivedToDeliveredLeadTime || this.state.program.arrivedToDeliveredLeadTime === ''}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        type="number"
                                                        min="0"
                                                        name="arrivedToDeliveredLeadTime" id="arrivedToDeliveredLeadTime" />
                                                    <FormFeedback>{errors.arrivedToDeliveredLeadTime}</FormFeedback>

                                                </FormGroup>

                                                <FormGroup>
                                                    <Label className="P-absltRadio">{i18n.t('static.common.status')}  </Label>
                                                    <FormGroup check inline>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="active1"
                                                            name="active"
                                                            value={true}
                                                            checked={this.state.program.active === true}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio1">
                                                            {i18n.t('static.common.active')}
                                                        </Label>
                                                    </FormGroup>
                                                    <FormGroup check inline>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="active2"
                                                            name="active"
                                                            value={false}
                                                            checked={this.state.program.active === false}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2">
                                                            {i18n.t('static.common.disabled')}
                                                        </Label>
                                                    </FormGroup>
                                                </FormGroup>
                                            </Row>
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

            var proObj = response.data;
            // var healthAreaArrayDummy=[];
            // healthAreaArrayDummy.push(response.data.healthArea.id);
            // proObj.healthAreaArray=healthAreaArrayDummy;

            this.setState({
                program: proObj,
                uniqueCode: uniqueCode
            })
            initialValues = {
                programName: getLabelText(this.state.program.label, lang),
                realmId: this.state.program.realmCountry.realm.realmId,
                realmCountryId: this.state.program.realmCountry.realmCountryId,
                organisationId: this.state.program.organisation.id,
                userId: this.state.program.programManager.userId,
                airFreightPerc: this.state.program.airFreightPerc,
                seaFreightPerc: this.state.program.seaFreightPerc,
                roadFreightPerc: this.state.program.roadFreightPerc,
                // deliveredToReceivedLeadTime: this.state.program.deliveredToReceivedLeadTime,
                plannedToSubmittedLeadTime: this.state.program.plannedToSubmittedLeadTime,
                submittedToApprovedLeadTime: this.state.program.submittedToApprovedLeadTime,
                approvedToShippedLeadTime: this.state.program.approvedToShippedLeadTime,
                shippedToArrivedByAirLeadTime: this.state.program.shippedToArrivedByAirLeadTime,
                shippedToArrivedBySeaLeadTime: this.state.program.shippedToArrivedBySeaLeadTime,
                shippedToArrivedByRoadLeadTime: this.state.program.shippedToArrivedByRoadLeadTime,
                arrivedToDeliveredLeadTime: this.state.program.arrivedToDeliveredLeadTime,
                // healthAreaId: this.state.program.healthArea.id,
                healthAreaArray: this.state.program.healthAreaArray,
                programNotes: this.state.program.programNotes,
                regionArray: this.state.program.regionArray,
                uniqueCode: this.state.uniqueCode,
                healthAreaArray: this.state.program.healthAreaArray
            }
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramManagerList(response.data.realmCountry.realm.realmId)
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
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                // message: 'static.unkownError',
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                                // message: 'static.unkownError',
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                        // message: 'static.unkownError',
                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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