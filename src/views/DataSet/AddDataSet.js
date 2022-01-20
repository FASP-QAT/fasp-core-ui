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
import Picker from 'react-month-picker';
import MonthBox from '../../CommonComponent/MonthBox.js';
import moment from 'moment';
// const ref = React.createRef();
export const DEFAULT_MIN_MONTHS_OF_STOCK = 3
export const DEFAULT_MAX_MONTHS_OF_STOCK = 18

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

const entityname = i18n.t('static.program.programMaster');
let initialValues = {
    realmId: '',
    realmCountryId: '',
    healthAreaId: [],
    organisationId: '',
    programName: '',
    programCode: '',
    programCode1: '',
    userId: '',
    programNotes: '',
}

const validationSchema = function (values) {
    return Yup.object().shape({

        // realmId: Yup.string()
        //     .required(i18n.t('static.common.realmtext')),
        realmCountryId: Yup.string()
            .required(i18n.t('static.program.validcountrytext')),
        healthAreaId: Yup.string()
            .required(i18n.t('static.program.validhealthareatext')),
        organisationId: Yup.string()
            .required(i18n.t('static.program.validorganisationtext')),
        programName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.program.validprogramtext')),
        userId: Yup.string()
            .required(i18n.t('static.program.validmanagertext')),
        regionId: Yup.string()
            .required(i18n.t('static.program.validRegionstext')),
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
                    forecastStartDate: '2022-01-01',
                    forecastStopDate: '2022-12-01',
                    versionId: 1
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
            loading: true,

            organisationCode: '',
            realmCountryCode: '',
            forecastProgramInMonth: '',

            regionList: [],
            regionId: [],
            singleValue1: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
            singleValue2: { year: new Date().getFullYear() + 1, month: new Date().getMonth() + 1 },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
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

    calculateForecastProgramInMonth() {
        let value = this.state.forecastProgramInMonth;
        console.log("singleValue1------->1", this.state.singleValue1);
        let stopDate = new Date(this.state.singleValue1.year + '-' + this.state.singleValue1.month + '-01');
        console.log("singleValue1------->1", stopDate);
        stopDate.setMonth(stopDate.getMonth() + (value - 1));
        console.log("singleValue1------->2", stopDate);
        this.setState({
            forecastProgramInMonth: value,
            singleValue2: { year: new Date(stopDate).getFullYear(), month: new Date(stopDate).getMonth() + 1 },
        });
    }

    calculateForecastEndDate() {
        let d1 = new Date(this.state.singleValue1.year + '-' + this.state.singleValue1.month + '-01');
        let d2 = new Date(this.state.singleValue2.year + '-' + this.state.singleValue2.month + '-01');
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months += d2.getMonth() - d1.getMonth();
        // months = months - 1;
        months = months + 1;
        this.setState({
            forecastProgramInMonth: months,
        });
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

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    handleClickMonthBox2 = (e) => {
        // this.refs.pickAMonth2.show()
        this.pickRange.current.show()
    }
    handleAMonthChange2 = (value, text) => {
        //
        //
    }
    handleAMonthDissmis2 = (value) => {
        this.setState({ singleValue2: value, }, () => {
            this.calculateForecastEndDate();
        })
    }

    handleAMonthDissmis1 = (value) => {
        // console.log("singleValue1------->1", value);
        this.setState({ singleValue1: value, }, () => {
            // this.fetchData();
        }, () => {

        })
    }

    handleClickMonthBox1 = (e) => {
        // this.refs.pickAMonth2.show()
        this.pickRange1.current.show()
    }
    handleAMonthChange1 = (value, text) => {
        //
        //
    }

    getRegionList() {

        // AuthenticationService.setupAxiosInterceptors();
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
                        var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
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

    realmList() {
        HealthAreaService.getRealmList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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

    getRealmCountryList() {
        console.log("in get realmCOuntry list----->", this.state.program.realm.realmId);
        ProgramService.getRealmCountryList(this.state.program.realm.realmId)
            .then(response => {
                if (response.status == 200) {
                    // var realmCountries = response.data.filter(c => c.active == true );
                    var listArray = response.data.filter(c => c.active == true);
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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

    getHealthAreaList() {
        ProgramService.getHealthAreaListByRealmCountryId(this.state.program.realmCountry.realmCountryId)
            .then(response => {
                if (response.status == 200) {
                    console.log("response------>0", response.data);
                    var json = (response.data).filter(c => c.active == true);
                    // var regList = [{ value: "-1", label: i18n.t("static.common.all") }];
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { healthAreaCode: json[i].healthAreaCode, value: json[i].healthAreaId, label: getLabelText(json[i].label, this.state.lang) }
                        // regList[i + 1] = { value: json[i].healthAreaId, label: getLabelText(json[i].label, this.state.lang) }
                    }
                    console.log("response------>1", regList);
                    var listArray = regList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    console.log("response------>2", listArray);
                    let { program } = this.state;
                    program.healthAreaArray = [];
                    this.setState({
                        healthAreaList: listArray,
                        healthAreaId: '',
                        program
                    }, (
                    ) => {
                        console.log("healthAreaList>>>>>>>", this.state.healthAreaList);
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

    getOrganisationList() {
        ProgramService.getOrganisationListByRealmCountryId(this.state.program.realmCountry.realmCountryId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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

    getProgramManagerList() {
        ProgramService.getProgramManagerList(this.state.program.realm.realmId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.username.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.username.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
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

    generateCountryCode(event) {
        let realmCountryCode = this.state.realmCountryList.filter(c => (c.realmCountryId == event.target.value))[0].country.countryCode;
        this.setState({ realmCountryCode: realmCountryCode })
    }

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        this.realmList();
        let { program } = this.state;
        let realmId = AuthenticationService.getRealmId();
        // console.log("realmId----->",realmId);
        if (realmId != -1) {
            // console.log("in if");
            program.realm.realmId = realmId;
            this.setState({ program }, () => {

                this.getRealmCountryList();
                // this.getHealthAreaList();
                // this.getOrganisationList();
                this.getProgramManagerList();

            });
            document.getElementById('realmId').disabled = true;

        } else {
            console.log("in else");
            document.getElementById('realmId').disabled = false;
        }

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
        let organisationCode = this.state.organisationList.filter(c => (c.organisationId == event.target.value))[0].organisationCode;
        this.setState({
            organisationCode: organisationCode
        })
    }

    dataChange(event) {
        let { program } = this.state;
        if (event.target.name == "programName") {
            program.label.label_en = event.target.value;
        } else if (event.target.name == "realmId") {
            program.realm.realmId = event.target.value;
            this.getRealmCountryList();
            // this.refs.healthAreaChild.getHealthAreaList();
            // this.refs.organisationChild.getOrganisationList();
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
        this.setState({ program }, () => { console.log(this.state) })

    }
    touchAll(setTouched, errors) {
        setTouched({
            programName: true,
            realmId: true,
            realmCountryId: true,
            organisationId: true,
            regionId: true,
            userId: true,
            healthAreaId: true,

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
                    <option key={i} value={item.realmCountryId}>
                        {getLabelText(item.country.label, this.state.lang)}
                        {/* {item.country.countryCode} */}
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
                    <option key={i} value={item.organisationId}>
                        {/* {item.organisationCode} */}
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
                                }}
                                validate={validate(validationSchema)}

                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    // AuthenticationService.setupAxiosInterceptors();
                                    let pro = this.state.program;
                                    // pro.programCode = this.state.realmCountryCode + "-" + this.state.healthAreaCode + "-" + this.state.organisationCode + (this.state.uniqueCode.toString().length > 0 ? ("-" + this.state.uniqueCode) : "");
                                    pro.programCode = (this.state.uniqueCode.toString().length > 0 ? (this.state.uniqueCode) : "");

                                    // pro.currentVersion.forecastStartDate = new Date(this.state.singleValue1.year + '-' + this.state.singleValue1.month + '-01');
                                    // pro.currentVersion.forecastStopDate = new Date(new Date(this.state.singleValue2.year + '-' + this.state.singleValue2.month + '-01'));
                                    // pro.currentVersion.forecastStartDate = this.state.singleValue1.year + '-' + this.state.singleValue1.month + '-01';
                                    // pro.currentVersion.forecastStopDate = this.state.singleValue2.year + '-' + this.state.singleValue2.month + '-01';
                                    console.log("Pro=---------------->+++", pro)
                                    ProgramService.addDataset(pro).then(response => {
                                        if (response.status == 200) {
                                            this.props.history.push(`/dataSet/listDataSet/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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

                                        <Form onSubmit={handleSubmit} noValidate name='programForm' autocomplete="off">

                                            <CardBody>

                                                <FormGroup>

                                                    {/* <Label htmlFor="select">{i18n.t('static.program.realm')}<span class="red Reqasterisk">*</span></Label> */}

                                                    <Input
                                                        valid={!errors.realmId && this.state.program.realm.realmId != ''}
                                                        invalid={touched.realmId && !!errors.realmId}
                                                        bsSize="sm"
                                                        // className="col-md-4"
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
                                                        // className="col-md-4"
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
                                                        // disabled={!AuthenticationService.getLoggedInUserRoleIdArr().includes("ROLE_APPLICATION_ADMIN") ? true : false}
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
                                                    />
                                                    <FormFeedback className="red">{errors.regionId}</FormFeedback>
                                                </FormGroup>

                                                <FormGroup>

                                                    <Label htmlFor="company">{i18n.t('static.dataset.forecastingProgram')}<span class="red Reqasterisk">*</span></Label>

                                                    <Input
                                                        type="text" name="programName" valid={!errors.programName}
                                                        bsSize="sm"
                                                        // invalid={touched.programName && !!errors.programName || this.state.program.label.label_en == ''}
                                                        // invalid={touched.programName && !!errors.programName || !!errors.programName}
                                                        valid={!errors.programName && this.state.program.label.label_en != ''}
                                                        invalid={touched.programName && !!errors.programName}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
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
                                                                // valid={!errors.airFreightPerc && this.props.items.program.airFreightPerc != ''}
                                                                // invalid={touched.airFreightPerc && !!errors.airFreightPerc}
                                                                bsSize="sm"
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                type="text"
                                                                maxLength={6}
                                                                value={this.state.uniqueCode}
                                                                // disabled={!AuthenticationService.getLoggedInUserRoleIdArr().includes("ROLE_APPLICATION_ADMIN") ? true : false}
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
                                                        {/* <option value="0">Please select</option> */}
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {programManagers}

                                                    </Input>
                                                    <FormFeedback>{errors.userId}</FormFeedback>

                                                </FormGroup>

                                                <FormGroup>
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.forecastStart')}<span class="red Reqasterisk">*</span></Label>
                                                    <div className="controls edit">
                                                        <Picker
                                                            // ref="pickAMonth2"
                                                            ref={this.pickRange1}
                                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                            value={singleValue1}
                                                            lang={pickerLang.months}
                                                            theme="dark"
                                                            onChange={this.handleAMonthChange1}
                                                            onDismiss={this.handleAMonthDissmis1}
                                                        >
                                                            <MonthBox value={this.makeText(singleValue1)} onClick={this.handleClickMonthBox1} />
                                                        </Picker>
                                                    </div>

                                                </FormGroup>

                                                <FormGroup>
                                                    <Label htmlFor="company">{i18n.t('static.versionSettings.ForecastPeriodInMonth')}</Label>
                                                    <Input
                                                        type="number" name="forecastProgramInMonth"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.dataChange(e) }}
                                                        // onBlur={handleBlur}
                                                        onBlur={(e) => { handleBlur(e); this.calculateForecastProgramInMonth() }}
                                                        value={this.state.forecastProgramInMonth}
                                                        id="forecastProgramInMonth" />
                                                    <FormFeedback>{errors.forecastProgramInMonth}</FormFeedback>
                                                </FormGroup>

                                                <FormGroup>
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.forecastEnd')}<span class="red Reqasterisk">*</span></Label>
                                                    <div className="controls edit">
                                                        <Picker
                                                            // ref="pickAMonth2"
                                                            ref={this.pickRange}
                                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                            value={singleValue2}
                                                            lang={pickerLang.months}
                                                            theme="dark"
                                                            onChange={this.handleAMonthChange2}
                                                            onDismiss={this.handleAMonthDissmis2}
                                                        >
                                                            <MonthBox value={this.makeText(singleValue2)} onClick={this.handleClickMonthBox2} />
                                                        </Picker>
                                                    </div>

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



                                            </CardBody>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    {/* <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button> */}
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
        this.props.history.push(`/dataSet/listDataSet/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

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

        this.setState({
            program
        },
            () => { });
    }
}