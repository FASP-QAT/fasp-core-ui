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
import DropdownService from '../../api/DropdownService';
import classNames from 'classnames';
import { API_URL, SPACE_REGEX } from '../../Constants';
import TicketPriorityComponent from './TicketPriorityComponent';
let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.program.programMaster"))
let summaryText_2 = "Add Program"
/**
 * This const is used to define the validation schema for program ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        programName: Yup.string()
            .required(i18n.t('static.program.validprogramtext')),
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.realm.realmName')))),
        realmCountryId: Yup.string()
            .required(i18n.t('static.healtharea.countrytext')),
        regionId: Yup.string()
            .required(i18n.t('static.common.regiontext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.program.region')))),
        organisationId: Yup.string()
            .required(i18n.t('static.program.validorganisationtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.program.organisation')))),
        healthAreaId: Yup.string()
            .required(i18n.t('static.program.validhealthareatext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.program.healtharea')))),
        programManager: Yup.string()
            .required(i18n.t('static.program.validmanagertext')),
        airFreightPerc: Yup.string()
            .required(i18n.t('static.program.validairfreighttext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\s*(?=.*[1-9])\d{1,2}(?:\.\d{1,2})?\s*$/, i18n.t('static.message.2digitDecimal')),
        seaFreightPerc: Yup.string()
            .required(i18n.t('static.program.validseafreighttext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\s*(?=.*[1-9])\d{1,2}(?:\.\d{1,2})?\s*$/, i18n.t('static.message.2digitDecimal')),
        roadFreightPerc: Yup.string()
            .required(i18n.t('static.program.validroadfreighttext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\s*(?=.*[1-9])\d{1,2}(?:\.\d{1,2})?\s*$/, i18n.t('static.message.2digitDecimal')),
        plannedToSubmittedLeadTime: Yup.string()
            .required(i18n.t('static.program.validplantosubmittext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\s*(?=.*[1-9])\d{1,2}(?:\.\d{1,2})?\s*$/, i18n.t('static.message.2digitDecimal')),
        submittedToApprovedLeadTime: Yup.string()
            .required(i18n.t('static.program.validsubmittoapprovetext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\s*(?=.*[1-9])\d{1,2}(?:\.\d{1,2})?\s*$/, i18n.t('static.message.2digitDecimal')),
        approvedToShippedLeadTime: Yup.string()
            .required(i18n.t('static.program.validapprovetoshiptext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\s*(?=.*[1-9])\d{1,2}(?:\.\d{1,2})?\s*$/, i18n.t('static.message.2digitDecimal')),
        shippedToArrivedByAirLeadTime: Yup.string()
            .required(i18n.t('static.program.shippedToArrivedByAirLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\s*(?=.*[1-9])\d{1,2}(?:\.\d{1,2})?\s*$/, i18n.t('static.message.2digitDecimal')),
        shippedToArrivedBySeaLeadTime: Yup.string()
            .required(i18n.t('static.program.shippedToArrivedBySeaLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\s*(?=.*[1-9])\d{1,2}(?:\.\d{1,2})?\s*$/, i18n.t('static.message.2digitDecimal')),
        shippedToArrivedByRoadLeadTime: Yup.string()
            .required(i18n.t('static.program.shippedToArrivedByRoadtext'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\s*(?=.*[1-9])\d{1,2}(?:\.\d{1,2})?\s*$/, i18n.t('static.message.2digitDecimal')),
        arrivedToDeliveredLeadTime: Yup.string()
            .required(i18n.t('static.program.arrivedToDeliveredLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext'))
            .matches(/^\s*(?=.*[1-9])\d{1,2}(?:\.\d{1,2})?\s*$/, i18n.t('static.message.2digitDecimal')),
        noOfMonthsInPastForBottomDashboard: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow')),
        noOfMonthsInFutureForBottomDashboard: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .integer(i18n.t('static.realm.decimalNotAllow'))
    })
}
/**
 * This component is used to display the program form and allow user to submit the add master request in jira
 */
export default class ProgramTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            program: {
                summary: summaryText_1,
                programName: '',
                programCode: '',
                realmId: '',
                realmCountryId: '',
                regionId: [],
                organisationId: '',
                healthAreaId: '',
                programManager: '',
                airFreightPerc: '',
                seaFreightPerc: '',
                roadFreightPerc: '',
                plannedToSubmittedLeadTime: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                shippedToArrivedByAirLeadTime: '',
                shippedToArrivedBySeaLeadTime: '',
                shippedToArrivedByRoadLeadTime: '',
                arrivedToDeliveredLeadTime: '',
                notes: "",
                priority: 3,
                noOfMonthsInPastForBottomDashboard:'',
                noOfMonthsInFutureForBottomDashboard:''
            },
            lang: localStorage.getItem('lang'),
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
            regionId: '',
            countryList: [],
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getDependentLists = this.getDependentLists.bind(this);
        this.getRegionList = this.getRegionList.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        this.getProgramDisplayCode = this.getProgramDisplayCode.bind(this);
        this.changeRealmCountry = this.changeRealmCountry.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { program } = this.state
        if (event.target.name == "summary") {
            program.summary = event.target.value;
        }
        if (event.target.name == "programName") {
            program.programName = event.target.value;
        }
        if (event.target.name == "programCode") {
            program.programCode = event.target.value;
        }
        if (event.target.name == "realmId") {
            program.realmId = event.target.value !== "" ? this.state.realmList.filter(c => c.realmId == event.target.value)[0].label.label_en : "";
            this.state.realmId = event.target.value
        }
        if (event.target.name == "realmCountryId") {
            program.realmCountryId = event.target.value !== "" ? this.state.realmCountryList.filter(c => c.realmCountryId == event.target.value)[0].country.label.label_en : "";
            this.state.realmCountryId = event.target.value
        }
        if (event.target.name == "regionId") {
            program.regionId = event.target.value;
        }
        if (event.target.name == "organisationId") {
            program.organisationId = event.target.value !== "" ? this.state.organisationList.filter(c => c.id == event.target.value)[0].label.label_en : "";
            this.state.organisationId = event.target.value
        }
        if (event.target.name == "healthAreaId") {
            program.healthAreaId = event.target.value !== "" ? this.state.healthAreaList.filter(c => c.healthAreaId == event.target.value)[0].label.label_en : "";
            this.state.healthAreaId = event.target.value
        }
        if (event.target.name == "programManager") {
            program.programManager = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                programManagerId: event.target.value
            })
        }
        if (event.target.name == "airFreightPerc") {
            program.airFreightPerc = event.target.value;
        }
        if (event.target.name == "seaFreightPerc") {
            program.seaFreightPerc = event.target.value;
        }
        if (event.target.name == "roadFreightPerc") {
            program.roadFreightPerc = event.target.value;
        }
        if (event.target.name == "noOfMonthsInPastForBottomDashboard") {
            program.noOfMonthsInPastForBottomDashboard = event.target.value;
        }
        if (event.target.name == "noOfMonthsInFutureForBottomDashboard") {
            program.noOfMonthsInFutureForBottomDashboard = event.target.value;
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
        if (event.target.name == "shippedToArrivedByRoadLeadTime") {
            program.shippedToArrivedByRoadLeadTime = event.target.value;
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
    /**
     * This function is called when realm country is changed
     * @param {*} event This is on change event
     */
    changeRealmCountry(event) {
        if (event === null) {
            let { program } = this.state;
            program.realmCountryId = ''
            this.setState({
                program: program,
                realmCountryId: ''
            });
        } else {
            let { program } = this.state;
            var outText = "";
            if (event.value !== "") {
                var realmCountryT = this.state.realmCountryList.filter(c => c.realmCountryId == event.value)[0];
                outText = realmCountryT.country.label.label_en;
            }
            program.realmCountryId = outText;
            this.setState({
                program: program,
                realmCountryId: event.value
            });
        }
    }
    /**
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        // console.log('priority - : '+newState);
        let { program } = this.state;
        program.priority = newState;
        this.setState(
            {
                program
            }, () => {
                // console.log('priority - state : '+this.state.program.priority);
            }
        );
    }

    /**
     * This function is used to get list of program manager, realm country, organisation, health area
     * @param {*} realmId This is the realm Id for which lists should be loaded
     */
    getDependentLists(realmId) {
        if (realmId != "") {
            ProgramService.getProgramManagerList(realmId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = (a.username).toUpperCase(); 
                            var itemLabelB = (b.username).toUpperCase(); 
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            programManagerList: listArray, loading: false
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
            ProgramService.getRealmCountryList(realmId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.country.label, this.state.lang).toUpperCase(); 
                            var itemLabelB = getLabelText(b.country.label, this.state.lang).toUpperCase(); 
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        var countryList = [];
                        for (var i = 0; i < listArray.length; i++) {
                            countryList[i] = { value: listArray[i].realmCountryId, label: getLabelText(listArray[i].country.label, this.state.lang) }
                        }
                        this.setState({
                            realmCountryList: listArray,
                            countryList: countryList,
                            loading: false
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
            DropdownService.getOrganisationDropdownList(realmId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            organisationList: listArray, loading: false
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
            ProgramService.getHealthAreaList(realmId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            healthAreaList: listArray, loading: false
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
    /**
     * This function is used to get region list
     * @param {*} e This is the on change event
     */
    getRegionList(e) {
        ProgramService.getRegionList(e.value)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    var json = listArray;
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
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
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
    /**
     * This function is used to update region based on user selection
     * @param {*} value This is the values of the regions that user has selected
     */
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
    /**
     * This function is used to load realm list on page load
     */
    componentDidMount() {
        HealthAreaService.getRealmList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realmList: listArray,
                        realmId: this.props.items.userRealmId, loading: false
                    });
                    if (this.props.items.userRealmId !== "") {
                        this.setState({
                            realmList: (response.data).filter(c => c.realmId == this.props.items.userRealmId)
                        })
                        let { program } = this.state;
                        program.realmId = (response.data).filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en;
                        this.setState({
                            program
                        }, () => {
                            this.getDependentLists(this.props.items.userRealmId);
                        })
                    }
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
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
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is called when reset button is clicked to reset the program details
     */
    resetClicked() {
        let { program } = this.state;
        program.programName = '';
        program.programCode = '';
        program.realmId = this.props.items.userRealmId !== "" ? this.state.realmList.filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en : "";
        program.realmCountryId = '';
        program.regionId = '';
        program.organisationId = '';
        program.healthAreaId = '';
        program.programManager = '';
        program.airFreightPerc = '';
        program.seaFreightPerc = '';
        program.roadFreightPerc = '';
        program.noOfMonthsInPastForBottomDashboard='';
        program.noOfMonthsInFutureForBottomDashboard='';
        program.plannedToSubmittedLeadTime = '';
        program.submittedToApprovedLeadTime = '';
        program.approvedToShippedLeadTime = '';
        program.shippedToArrivedByAirLeadTime = '';
        program.shippedToArrivedBySeaLeadTime = '';
        program.shippedToArrivedByRoadLeadTime = '';
        program.arrivedToDeliveredLeadTime = '';
        program.notes = '';
        program.priority = 3;
        this.setState({
            program: program,
            realmId: this.props.items.userRealmId,
            realmCountryId: '',
            organisationId: '',
            healthAreaId: '',
            programManagerId: '',
            regionId: ''
        },
            () => { });
    }
    /**
     * This function is used to get the display code for the program
     */
    getProgramDisplayCode() {
        let items = this.state;
        var country = items.realmCountryId;
        var technicalArea = items.healthAreaId;
        var organisation = items.organisationId;
        if ((country != "" && country != undefined) && (technicalArea != "" && technicalArea != undefined) && (organisation != "" && organisation != undefined)) {
            var countryCode = this.state.realmCountryList.filter(c => c.realmCountryId == country)[0].country.countryCode;
            var technicalAreaCode = this.state.healthAreaList.filter(c => c.healthAreaId == technicalArea)[0].healthAreaCode;
            var organisationCode = this.state.organisationList.filter(c => c.organisationId == organisation)[0].organisationCode;
            var programDisplayCode = countryCode + "-" + technicalAreaCode + "-" + organisationCode;
            let { program } = this.state;
            program.programCode = programDisplayCode;
            this.setState({
                program
            })
        }
    }
    /**
     * This is used to display the content
     * @returns This returns program details form
     */
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
        let realmOrganisation = organisationList.length > 0
            && organisationList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
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
                    <option key={i} value={item.programManager}>
                        {item.username}
                    </option>
                )
            }, this);
        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.program.programMaster')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            programName: '',
                            programCode: '',
                            realmId: this.props.items.userRealmId,
                            realmCountryId: '',
                            regionId: '',
                            organisationId: '',
                            healthAreaId: '',
                            programManager: '',
                            airFreightPerc: '',
                            seaFreightPerc: '',
                            roadFreightPerc: '',
                            noOfMonthsInPastForBottomDashboard:'',
                            noOfMonthsInFutureForBottomDashboard:'',
                            plannedToSubmittedLeadTime: '',
                            submittedToApprovedLeadTime: '',
                            approvedToShippedLeadTime: '',
                            shippedToArrivedByAirLeadTime: '',
                            shippedToArrivedBySeaLeadTime: '',
                            shippedToArrivedByRoadLeadTime: '',
                            arrivedToDeliveredLeadTime: '',
                            notes: "",
                            priority: 3
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.program.summary = summaryText_2;
                            this.state.program.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.program).then(response => {
                                if (response.status == 200 || response.status == 201) {
                                    var msg = response.data.key;
                                    this.setState({
                                        message: msg, loading: false
                                    },
                                        () => {
                                            this.resetClicked();
                                            this.hideSecondComponent();
                                        })
                                } else {
                                    this.setState({
                                        message: i18n.t('static.unkownError'), loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                }
                                this.props.togglehelp();
                                this.props.toggleSmall(this.state.message);
                            }).catch(
                                error => {
                                    if (error.message === "Network Error") {
                                        this.setState({
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
                                handleReset,
                                setFieldValue,
                                setFieldTouched
                            }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary" readOnly={true}
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.program.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.program.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="realmId">{i18n.t('static.program.realm')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmId" id="realmId"
                                            bsSize="sm"
                                            valid={!errors.realmId && this.state.program.realmId != ''}
                                            invalid={touched.realmId && !!errors.realmId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getDependentLists(e.target.value) }}
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
                                        <Select
                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                { 'is-valid': !errors.realmCountryId && this.state.program.realmCountryId != '' },
                                                { 'is-invalid': (touched.realmCountryId && !!errors.realmCountryId) }
                                            )}
                                            bsSize="sm"
                                            name="realmCountryId"
                                            id="realmCountryId"
                                            isClearable={false}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("realmCountryId", e);
                                                this.changeRealmCountry(e); this.getRegionList(e); this.getProgramDisplayCode()
                                            }}
                                            onBlur={() => setFieldTouched("realmCountryId", true)}
                                            required
                                            min={1}
                                            options={this.state.countryList}
                                            value={this.state.realmCountryId}
                                        />
                                        <FormFeedback className="red">{errors.realmCountryId}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="healthAreaId">{i18n.t('static.program.healtharea')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="healthAreaId" id="healthAreaId"
                                            bsSize="sm"
                                            valid={!errors.healthAreaId && this.state.program.healthAreaId != ''}
                                            invalid={touched.healthAreaId && !!errors.healthAreaId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getProgramDisplayCode() }}
                                            onBlur={handleBlur}
                                            value={this.state.healthAreaId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmHealthArea}
                                        </Input>
                                        <FormFeedback className="red">{errors.healthAreaId}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="organisationId">{i18n.t('static.program.organisation')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="organisationId" id="organisationId"
                                            bsSize="sm"
                                            valid={!errors.organisationId && this.state.program.organisationId != ''}
                                            invalid={touched.organisationId && !!errors.organisationId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getProgramDisplayCode() }}
                                            onBlur={handleBlur}
                                            value={this.state.organisationId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmOrganisation}
                                        </Input>
                                        <FormFeedback className="red">{errors.organisationId}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup className="Selectcontrol-bdrNone">
                                        <Label for="regionId">{i18n.t('static.program.region')}<span class="red Reqasterisk">*</span></Label>
                                        <Select
                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                { 'is-valid': !errors.regionId && this.state.program.regionId.length != 0 },
                                                { 'is-invalid': (touched.regionId && !!errors.regionId) }
                                            )}
                                            name="regionId" id="regionId"
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); setFieldValue("regionId", e); this.updateFieldData(e) }}
                                            onBlur={() => setFieldTouched("regionId", true)}
                                            multi
                                            options={this.state.regionList}
                                            value={this.state.regionId}
                                            required />
                                        <FormFeedback className="red">{errors.regionId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="programName">{i18n.t('static.program.programName')}<span class="red Reqasterisk">*</span></Label>
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
                                    <FormGroup>
                                        <Label htmlFor="company">{i18n.t('static.program.programDisplayName')}</Label>
                                        <Input
                                            type="text" name="programCode"
                                            bsSize="sm"
                                            readOnly
                                            onBlur={handleBlur}
                                            value={this.state.program.programCode}
                                            id="programCode" />
                                        <FormFeedback>{errors.programCode}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="programManager">{i18n.t('static.program.programmanager')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="programManager" id="programManager"
                                            bsSize="sm"
                                            valid={!errors.programManager && this.state.program.programManager != ''}
                                            invalid={touched.programManager && !!errors.programManager}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.programManagerId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {programManagers}
                                        </Input>
                                        <FormFeedback className="red">{errors.programManager}</FormFeedback>
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
                                        <Label htmlFor="company">{i18n.t('static.program.roadfreightperc')} (%) <span class="red ">*</span></Label>
                                        <Input
                                            value={this.state.program.roadFreightPerc}
                                            bsSize="sm"
                                            valid={!errors.roadFreightPerc && this.state.program.roadFreightPerc != ''}
                                            invalid={touched.roadFreightPerc && !!errors.roadFreightPerc}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            type="number"
                                            min="0"
                                            name="roadFreightPerc" id="roadFreightPerc" />
                                        <FormFeedback>{errors.roadFreightPerc}</FormFeedback>
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
                                        <Label htmlFor="company">{i18n.t('static.realmcountry.shippedToArrivedRoadLeadTime')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            value={this.state.program.shippedToArrivedByRoadLeadTime}
                                            bsSize="sm"
                                            valid={!errors.shippedToArrivedByRoadLeadTime && this.state.program.shippedToArrivedByRoadLeadTime != ''}
                                            invalid={touched.shippedToArrivedByRoadLeadTime && !!errors.shippedToArrivedByRoadLeadTime}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            type="number"
                                            min="0"
                                            name="shippedToArrivedByRoadLeadTime" id="shippedToArrivedByRoadLeadTime" />
                                        <FormFeedback>{errors.shippedToArrivedByRoadLeadTime}</FormFeedback>
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
                                        <Label>{i18n.t('static.realm.noOfMonthsInPastForBottomDashboard')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="number"
                                            name="noOfMonthsInPastForBottomDashboard"
                                            id="noOfMonthsInPastForBottomDashboard"
                                            bsSize="sm"
                                            valid={!errors.noOfMonthsInPastForBottomDashboard}
                                            invalid={touched.noOfMonthsInPastForBottomDashboard && !!errors.noOfMonthsInPastForBottomDashboard}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.program.noOfMonthsInPastForBottomDashboard}
                                            required />
                                        <FormFeedback className="red">{errors.noOfMonthsInPastForBottomDashboard}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>{i18n.t('static.realm.noOfMonthsInFutureForBottomDashboard')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="number"
                                            name="noOfMonthsInFutureForBottomDashboard"
                                            id="noOfMonthsInFutureForBottomDashboard"
                                            bsSize="sm"
                                            valid={!errors.noOfMonthsInFutureForBottomDashboard}
                                            invalid={touched.noOfMonthsInFutureForBottomDashboard && !!errors.noOfMonthsInFutureForBottomDashboard}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.program.noOfMonthsInFutureForBottomDashboard}
                                            required />
                                        <FormFeedback className="red">{errors.noOfMonthsInFutureForBottomDashboard}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.program.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.program.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.program.priority} updatePriority={this.updatePriority} errors={errors} touched={touched}/>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                                                    </Form>
                            )} />
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}