import classNames from 'classnames';
import { Formik } from 'formik';
import moment from 'moment';
import React, { Component } from "react";
import Picker from 'react-month-picker';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import {
    Button,
    Card, CardBody,
    CardFooter,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Row
} from 'reactstrap';
import * as Yup from 'yup';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from "../../Constants";
import DropdownService from '../../api/DropdownService';
import HealthAreaService from "../../api/HealthAreaService";
import ProgramService from "../../api/ProgramService";
import i18n from "../../i18n";
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Capitalize, hideSecondComponent, makeText } from '../../CommonComponent/JavascriptCommonFunctions.js';
export const DEFAULT_MIN_MONTHS_OF_STOCK = 3
export const DEFAULT_MAX_MONTHS_OF_STOCK = 18
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
// Localized entity name
const entityname = i18n.t('static.program.programMaster');
/**
 * Defines the validation schema for forecast program details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        realmCountryId: Yup.string()
            .required(i18n.t('static.program.validcountrytext')),
        healthAreaId: Yup.string()
            .required(i18n.t('static.program.validhealthareatext')),
        organisationId: Yup.string()
            .required(i18n.t('static.program.validorganisationtext')),
        programName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required('Enter forecasting program name'),
        userId: Yup.string()
            .required(i18n.t('static.program.validmanagertext')),
        regionId: Yup.string()
            .required(i18n.t('static.program.validRegionstext')),
        forecastProgramInMonth: Yup.string()
            .matches(/^[0-9]{0,5}$/, 'Forecast period should not contain negative number, decimal numbers, characters & special symbols')
            .required('Enter forecast period (months)'),
    })
}
/**
 * Component for adding forecast program details.
 */
export default class AddForecastProgram extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uniqueCode: '',
            program: {
                programCode: '',
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
                programNotes: '',
                healthAreaArray: [],
                regionArray: [],
                currentVersion: {
                    forecastStartDate: '',
                    forecastStopDate: '',
                }
            },
            lang: localStorage.getItem('lang'),
            healthAreaId: '',
            healthAreaList: [],
            healthAreaCode: '',
            realmList: [],
            realmCountryList: [],
            organisationList: [],
            programManagerList: [],
            message: '',
            message1: '',
            loading: true,
            organisationCode: '',
            realmCountryCode: '',
            forecastProgramInMonth: 13,
            regionList: [],
            regionId: [],
            singleValue1: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
            singleValue2: { year: new Date().getFullYear() + 1, month: new Date().getMonth() + 1 },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
        }
        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.changeLoading = this.changeLoading.bind(this);
        this.generateHealthAreaCode = this.generateHealthAreaCode.bind(this);
        this.generateOrganisationCode = this.generateOrganisationCode.bind(this);
        this.realmList = this.realmList.bind(this);
        this.getRealmCountryList = this.getRealmCountryList.bind(this);
        this.getHealthAreaList = this.getHealthAreaList.bind(this);
        this.getOrganisationList = this.getOrganisationList.bind(this);
        this.getProgramManagerList = this.getProgramManagerList.bind(this);
        this.generateCountryCode = this.generateCountryCode.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        this.getRegionList = this.getRegionList.bind(this);
        this.updateFieldDataHealthArea = this.updateFieldDataHealthArea.bind(this);
        this.pickRange = React.createRef();
        this.pickRange1 = React.createRef();
        this.calculateForecastProgramInMonth = this.calculateForecastProgramInMonth.bind(this);
        this.calculateForecastEndDate = this.calculateForecastEndDate.bind(this);
    }
    /**
     * Validates and calculates the forecast period in months based on the input value.
     * If the input value is valid, it updates the state with the calculated stop date.
     * If the input value is invalid, it sets an error message in the state.
     */
    calculateForecastProgramInMonth() {
        let value = this.state.forecastProgramInMonth;
        if (value == '') {
            this.setState({
                message1: 'Forecast period (Months) should not be character/null value'
            },
                () => {
                    hideSecondComponent();
                })
        } else if (!Number.isInteger(Number(value))) {
            this.setState({
                message1: 'Forecast period (Months) should not be decimal value'
            },
                () => {
                    hideSecondComponent();
                })
        } else if (Number(value) < 0) {
            this.setState({
                message1: 'Forecast period (Months) should not be negative value'
            },
                () => {
                    hideSecondComponent();
                })
        } else {
            let stopDate = new Date(this.state.singleValue1.year + '-' + this.state.singleValue1.month + '-01');
            stopDate.setMonth(stopDate.getMonth() + (value - 1));
            this.setState({
                forecastProgramInMonth: value,
                singleValue2: { year: new Date(stopDate).getFullYear(), month: new Date(stopDate).getMonth() + 1 },
                message1: ''
            });
        }
    }
    /**
     * Calculates the forecast end date based on the selected start and end months.
     * The start and end months are retrieved from the component state.
     * The calculated forecast period in months is updated in the component state.
     */
    calculateForecastEndDate() {
        let d1 = new Date(moment(new Date(this.state.singleValue1.year + '/' + this.state.singleValue1.month + '/01')).utc().format("YYYY-MM-DD"));
        let d2 = new Date(moment(new Date(this.state.singleValue2.year + '/' + this.state.singleValue2.month + '/01')).utc().format("YYYY-MM-DD"));
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months += d2.getMonth() - d1.getMonth();
        months = months + 1;
        this.setState({
            forecastProgramInMonth: months,
        });
    }
    /**
     * Updates the health area field data in the component state.
     * Sets the selected health area ID in the component state and updates the program object with the selected health area IDs.
     * @param {array} value - An array containing the selected health area IDs.
     */
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
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    handleClickMonthBox2 = (e) => {
        this.pickRange.current.show()
    }
    /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
    handleAMonthDissmis2 = (value) => {
        this.setState({ singleValue2: value, }, () => {
            this.calculateForecastEndDate();
        })
    }
    /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
    handleAMonthDissmis1 = (value) => {
        this.setState({ singleValue1: value, }, () => {
            this.calculateForecastEndDate();
        }, () => {
        })
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    handleClickMonthBox1 = (e) => {
        this.pickRange1.current.show()
    }
    /**
     * Reterives region list from server
     */
    getRegionList() {
        ProgramService.getRegionList(document.getElementById('realmCountryId').value)
            .then(response => {
                if (response.status == 200) {
                    var json = response.data;
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { value: json[i].regionId, label: getLabelText(json[i].label, this.state.lang) }
                    }
                    var listArray = regList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase();
                        var itemLabelB = b.label.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    let { program } = this.state;
                    program.regionArray = [];
                    this.setState({
                        regionId: '',
                        regionList: listArray,
                        program
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
     * Change message state
     * @param {String} message Message that needs to be changed
     */
    changeMessage(message) {
        this.setState({ message: message })
    }
    /**
     * Change loading state
     * @param {String} message loading state new value
     */
    changeLoading(loading) {
        this.setState({ loading: loading })
    }
    /**
     * Reterives realm list from server
     */
    realmList() {
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
    }
    /**
     * Reterives realm country list
     */
    getRealmCountryList() {
        DropdownService.getRealmCountryDropdownList(this.state.program.realm.realmId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realmCountryList: listArray
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
     * Reterives health area list
     */
    getHealthAreaList() {
        ProgramService.getHealthAreaListByRealmCountryId(this.state.program.realmCountry.realmCountryId)
            .then(response => {
                if (response.status == 200) {
                    var json = (response.data).filter(c => c.active == true);
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { healthAreaCode: json[i].healthAreaCode, value: json[i].healthAreaId, label: getLabelText(json[i].label, this.state.lang) }
                    }
                    var listArray = regList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase();
                        var itemLabelB = b.label.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    let { program } = this.state;
                    program.healthAreaArray = [];
                    this.setState({
                        healthAreaList: listArray,
                        healthAreaId: '',
                        program
                    }, (
                    ) => {
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
     * Handles the change event for regions.
     * @param {Array} event - An array containing the selected region IDs.
     */
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
    /**
     * Reterives organisation list
     */
    getOrganisationList() {
        DropdownService.getOrganisationListByRealmCountryId(this.state.program.realmCountry.realmCountryId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    let { program } = this.state;
                    program.organisation.id = ''
                    this.setState({
                        organisationList: listArray, program
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
     * Reterives program manager list
     */
    getProgramManagerList() {
        ProgramService.getProgramManagerList(this.state.program.realm.realmId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.username.toUpperCase();
                        var itemLabelB = b.username.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    listArray = listArray.filter(c => c.active == true);
                    this.setState({
                        programManagerList: listArray
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
     * Generates a country code based on the selected realm country ID.
     * @param {Event} event - The change event containing the selected realm country ID.
     */
    generateCountryCode(event) {
        let realmCountryCode = this.state.realmCountryList.filter(c => (c.id == event.target.value))[0].code;
        this.setState({ realmCountryCode: realmCountryCode })
    }
    /**
     * Calls realm country and program manager list functions on component mount
     */
    componentDidMount() {
        this.realmList();
        let { program } = this.state;
        let realmId = AuthenticationService.getRealmId();
        if (realmId != -1) {
            program.realm.realmId = realmId;
            this.setState({ program }, () => {
                this.getRealmCountryList();
                this.getProgramManagerList();
            });
            document.getElementById('realmId').disabled = true;
        } else {
            document.getElementById('realmId').disabled = false;
        }
    }
    /**
     * Generates a health area code based on the selected health ID.
     * @param {Event} event - The change event containing the selected health area ID.
     */
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
    /**
     * Generates a organisation code based on the selected organisation ID.
     * @param {Event} event - The change event containing the selected organisation ID.
     */
    generateOrganisationCode(event) {
        let organisationCode = this.state.organisationList.filter(c => (c.id == event.target.value))[0].code;
        this.setState({
            organisationCode: organisationCode
        })
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { program } = this.state;
        if (event.target.name == "programName") {
            program.label.label_en = event.target.value;
        } else if (event.target.name == "realmId") {
            program.realm.realmId = event.target.value;
            this.getRealmCountryList();
            this.getProgramManagerList();
        } else if (event.target.name == 'realmCountryId') {
            program.realmCountry.realmCountryId = event.target.value;
            this.getHealthAreaList();
            this.getOrganisationList();
            this.getRegionList();
        } else if (event.target.name == 'organisationId') {
            program.organisation.id = event.target.value;
        } else if (event.target.name == 'userId') {
            program.programManager.userId = event.target.value;
        } else if (event.target.name == 'programCode1') {
            this.setState({
                uniqueCode: event.target.value
            })
        } else if (event.target.name == 'programNotes') {
            program.programNotes = event.target.value;
        } else if (event.target.name == 'forecastProgramInMonth') {
            this.setState({ forecastProgramInMonth: event.target.value }, () => { })
        }
        this.setState({ program }, () => {
        })
    }
    /**
     * Renders the add forecast program screen.
     * @returns {JSX.Element} - Add forecast program screen.
     */
    render() {
        const { singleValue2 } = this.state
        const { singleValue1 } = this.state
        const { realmList } = this.state;
        let realms = realmList.length > 0
            && realmList.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { realmCountryList } = this.state;
        let realmCountries = realmCountryList.length > 0
            && realmCountryList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { programManagerList } = this.state;
        let programManagers = programManagerList.length > 0
            && programManagerList.map((item, i) => {
                return (
                    <option key={i} value={item.userId}>
                        {item.username}
                    </option>
                )
            }, this);
        const { organisationList } = this.state;
        let realmOrganisation = organisationList.length > 0
            && organisationList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
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
                                    realmId: this.state.program.realm.realmId,
                                    realmCountryId: this.state.program.realmCountry.realmCountryId,
                                    healthAreaId: this.state.program.healthAreaArray,
                                    organisationId: this.state.program.organisation.id,
                                    regionId: this.state.program.regionArray,
                                    programName: this.state.program.label.label_en,
                                    programCode: this.state.realmCountryCode + "-" + this.state.healthAreaCode + "-" + this.state.organisationCode,
                                    programCode1: this.state.uniqueCode,
                                    userId: this.state.program.programManager.userId,
                                    programNotes: this.state.program.programNotes,
                                    forecastProgramInMonth: this.state.forecastProgramInMonth
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    let pro = this.state.program;
                                    pro.programCode = (this.state.uniqueCode.toString().length > 0 ? (this.state.uniqueCode) : "");
                                    pro.currentVersion.forecastStartDate = this.state.singleValue1.year + '-' + this.state.singleValue1.month + '-01';
                                    pro.currentVersion.forecastStopDate = this.state.singleValue2.year + '-' + this.state.singleValue2.month + '-01';
                                    ProgramService.addDataset(pro).then(response => {
                                        if (response.status == 200) {
                                            this.props.history.push(`/dataSet/listDataSet/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode, loading: false
                                            },
                                                () => {
                                                    hideSecondComponent();
                                                })
                                        }
                                    }
                                    ).catch(
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
                                        setFieldValue,
                                        setFieldTouched
                                    }) => (
                                        <Form onSubmit={handleSubmit} noValidate name='programForm' autocomplete="off">
                                            <CardBody>
                                                <FormGroup>
                                                    <Input
                                                        valid={!errors.realmId && this.state.program.realm.realmId != ''}
                                                        invalid={touched.realmId && !!errors.realmId}
                                                        bsSize="sm"
                                                        onBlur={handleBlur}
                                                        type="hidden" name="realmId" id="realmId"
                                                        value={this.state.program.realm.realmId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {realms}
                                                    </Input>
                                                    <FormFeedback>{errors.realmId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.program.realmcountry')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        valid={!errors.realmCountryId && this.state.program.realmCountry.realmCountryId != ''}
                                                        invalid={touched.realmCountryId && !!errors.realmCountryId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.generateCountryCode(e) }}
                                                        bsSize="sm"
                                                        onBlur={handleBlur}
                                                        type="select" name="realmCountryId" id="realmCountryId">
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {realmCountries}
                                                    </Input>
                                                    <FormFeedback>{errors.realmCountryId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.dashboard.healthareaheader')}<span class="red Reqasterisk">*</span></Label>
                                                    <Select
                                                        bsSize="sm"
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.healthAreaId && this.state.program.healthAreaArray.length != 0 },
                                                            { 'is-invalid': (touched.healthAreaId && !!errors.healthAreaId) }
                                                        )}
                                                        name="healthAreaId"
                                                        id="healthAreaId"
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
                                                        placeholder={i18n.t('static.common.select')}
                                                    />
                                                    <FormFeedback className="red">{errors.healthAreaId}</FormFeedback>
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
                                                        value={this.state.program.organisation.id}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.generateOrganisationCode(e) }}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {realmOrganisation}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.organisationId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.inventory.region')}<span class="red Reqasterisk">*</span></Label>
                                                    <Select
                                                        bsSize="sm"
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.regionId && this.state.program.regionArray.length != 0 },
                                                            { 'is-invalid': (touched.regionId && !!errors.regionId) }
                                                        )}
                                                        name="regionId"
                                                        id="regionId"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue("regionId", e);
                                                            this.updateFieldData(e);
                                                        }}
                                                        onBlur={() => setFieldTouched("regionId", true)}
                                                        multi
                                                        options={this.state.regionList}
                                                        value={this.state.program.regionArray}
                                                        placeholder={i18n.t('static.common.select')}
                                                    />
                                                    <FormFeedback className="red">{errors.regionId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="company">{i18n.t('static.dataset.forecastingProgram')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="text" name="programName"
                                                        bsSize="sm"
                                                        valid={!errors.programName && this.state.program.label.label_en != ''}
                                                        invalid={touched.programName && !!errors.programName}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.program.label.label_en}
                                                        id="programName" />
                                                    <FormFeedback>{errors.programName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup style={{ display: 'flex' }}>
                                                    <Col xs="6" className="pl-0">
                                                        <FormGroup >
                                                            <Label htmlFor="company">{i18n.t('static.program.datasetDisplayName')}</Label>
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
                                                                bsSize="sm"
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                type="text"
                                                                maxLength={6}
                                                                value={this.state.uniqueCode}
                                                                name="programCode1" id="programCode1" />
                                                            <FormFeedback className="red">{errors.programCode1}</FormFeedback>
                                                        </FormGroup>
                                                    </Col>
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
                                                    <h6><Label htmlFor="select">{i18n.t('static.dataset.version1Settings')}</Label></h6>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.forecastStart')}<span class="red Reqasterisk">*</span></Label>
                                                    <div className="controls edit">
                                                        <Picker
                                                            ref={this.pickRange1}
                                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                            value={singleValue1}
                                                            lang={pickerLang.months}
                                                            theme="dark"
                                                            onDismiss={this.handleAMonthDissmis1}
                                                        >
                                                            <MonthBox value={makeText(singleValue1)} onClick={this.handleClickMonthBox1} />
                                                        </Picker>
                                                    </div>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="company">{i18n.t('static.versionSettings.ForecastPeriodInMonth')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="text" name="forecastProgramInMonth"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.dataChange(e) }}
                                                        valid={!errors.forecastProgramInMonth && this.state.forecastProgramInMonth != ''}
                                                        invalid={touched.forecastProgramInMonth && !!errors.forecastProgramInMonth}
                                                        onBlur={(e) => { handleBlur(e); this.calculateForecastProgramInMonth() }}
                                                        value={this.state.forecastProgramInMonth}
                                                        id="forecastProgramInMonth" />
                                                    <FormFeedback>{errors.forecastProgramInMonth}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.forecastEnd')}<span class="red Reqasterisk">*</span></Label>
                                                    <div className="controls edit MonthPickerUpdateInfo">
                                                        <Picker
                                                            ref={this.pickRange}
                                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                            value={singleValue2}
                                                            lang={pickerLang.months}
                                                            theme="dark"
                                                            onDismiss={this.handleAMonthDissmis2}
                                                            key={JSON.stringify(singleValue2)}
                                                        >
                                                            <MonthBox value={makeText(singleValue2)} onClick={this.handleClickMonthBox2} />
                                                        </Picker>
                                                    </div>
                                                </FormGroup>
                                            </CardBody>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
    /**
     * Redirects to the list forecast program screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/dataSet/listDataSet/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the forecast program details when reset button is clicked.
     */
    resetClicked() {
        let { program } = this.state
        program.label.label_en = '';
        program.realm.realmId = '';
        program.realmCountry.realmCountryId = '';
        program.organisation.id = '';
        this.state.uniqueCode = '';
        this.state.realmCountryCode = '';
        this.state.healthAreaCode = '';
        this.state.organisationCode = '';
        this.state.programCode1 = '';
        program.programNotes = '';
        program.programManager.userId = '';
        this.state.healthAreaList = [];
        program.healthAreaArray = [];
        this.state.regionList = [];
        program.regionArray = [];
        this.state.forecastProgramInMonth = 13;
        this.state.singleValue1 = { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
        this.state.singleValue2 = { year: new Date().getFullYear() + 1, month: new Date().getMonth() + 1 };
        this.state.minDate = { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 };
        this.state.maxDate = { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 };
        this.setState({
            program
        },
            () => { });
    }
}