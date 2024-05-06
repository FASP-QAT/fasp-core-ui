import { Formik } from 'formik';
import React, { Component } from "react";
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
    Modal, ModalBody,
    ModalHeader
} from 'reactstrap';
import * as Yup from 'yup';
import CryptoJS from 'crypto-js';
import jexcel from 'jspreadsheet';
import { Prompt } from 'react-router';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { checkValidation, changed, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DECIMAL_NO_REGEX, INTEGER_NO_REGEX, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, SECRET_KEY } from "../../Constants";
import ForecastingUnitService from '../../api/ForecastingUnitService';
import ProgramService from '../../api/ProgramService';
import TracerCategoryService from '../../api/TracerCategoryService';
import UnitService from '../../api/UnitService.js';
import UsagePeriodService from '../../api/UsagePeriodService';
import UsageTemplateService from "../../api/UsageTemplateService";
import i18n from '../../i18n';
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const entityname = i18n.t('static.modelingType.modelingType')
/**
 * This const is used to define the validation schema for usage frequency calculator
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        picker1: Yup.string()
            .required(i18n.t('static.label.fieldRequired')),
        picker2: Yup.string()
            .required(i18n.t('static.label.fieldRequired')),
        number1: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .matches(/^(?=.*[1-9])\d{1,10}$/, i18n.t('static.program.validvaluetext'))
            .required(i18n.t('static.label.fieldRequired'))
    })
}
/**
 * This component is used the display,add or edit the usage templates in tabular format
 */
class usageTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            usageTemplateList: [],
            message: '',
            selSource: [],
            loading: true,
            t1Instance: '',
            t2Instance: '',
            tracerCategoryList: [],
            forecastingUnitList: [],
            roleArray: [],
            typeList: [],
            usagePeriodList: [],
            unitList: [],
            forecastingUnitObj: '',
            isModalOpen: false,
            x: '',
            y: '',
            number1: '',
            number2: '',
            picker1: '',
            picker2: '',
            textMessage: 'time(s) per',
            usagePeriodListLong: [],
            usagePeriodDisplayList: [],
            dimensionList: [],
            isChanged1: false,
            dataEl: '',
            lang: localStorage.getItem('lang'),
            tempTracerCategoryId: '',
            tracerCategoryLoading: true,
            tempForecastingUnitList: [],
            tcListBasedOnProgram:[]
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.loaded = this.loaded.bind(this)
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.changed = this.changed.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.onchangepage = this.onchangepage.bind(this);
        this.getDataSet = this.getDataSet.bind(this);
        this.getTracerCategory = this.getTracerCategory.bind(this);
        this.getForecastingUnit = this.getForecastingUnit.bind(this);
        this.getUnit = this.getUnit.bind(this);
        this.getUsagePeriod = this.getUsagePeriod.bind(this);
        this.getUsageTemplateData = this.getUsageTemplateData.bind(this);
        this.modelOpenClose = this.modelOpenClose.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.getDimensionList = this.getDimensionList.bind(this);
    }
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is used to get the dataset(Program) list
     */
    getDataSet() {
        ProgramService.getDataSetList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.programCode.toUpperCase(); 
                        var itemLabelB = b.programCode.toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    let tempProgramList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: listArray[i].programCode,
                                id: listArray[i].programId,
                                active: listArray[i].active,
                                healthAreaList: listArray[i].healthAreaList
                            }
                            tempProgramList[i] = paJson
                        }
                    }
                    let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                    let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                    var roleList = decryptedUser.roleList;
                    var roleArray = []
                    for (var r = 0; r < roleList.length; r++) {
                        roleArray.push(roleList[r].roleId)
                    }
                    tempProgramList.unshift({
                        name: 'All',
                        id: -1,
                        active: true,
                    });
                    this.setState({
                        typeList: tempProgramList,
                        roleArray: roleArray
                    }, () => {
                        this.getUsagePeriod();
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
                    this.setState({
                        programs: [], loading: false
                    }, () => { })
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
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
     * This function is used to get the tracer category list
     */
    getTracerCategory() {
        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    let tempList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: getLabelText(listArray[i].label, this.state.lang),
                                id: parseInt(listArray[i].tracerCategoryId),
                                active: listArray[i].active,
                                healthAreaId: listArray[i].healthArea.id
                            }
                            tempList[i] = paJson
                        }
                    }
                    this.setState({
                        tracerCategoryList: tempList,
                    },
                        () => {
                            this.getDimensionList();
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
     * This function is used to get the unit list based on dimension
     */
    getDimensionList() {
        UnitService.getUnitListByDimensionId(5)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = (a.unitCode).toUpperCase(); 
                        var itemLabelB = (b.unitCode).toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    let tempList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: listArray[i].unitCode,
                                id: parseInt(listArray[i].unitId),
                                active: listArray[i].active,
                            }
                            tempList[i] = paJson
                        }
                    }
                    this.setState({
                        dimensionList: tempList,
                    },
                        () => {
                            this.getForecastingUnit();
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
     * This function is used to get the list of forecasting units
     */
    getForecastingUnit() {
        let forecastingUnitIds = this.state.tempForecastingUnitList.map(e => e.id)
        ForecastingUnitService.getForecastingUnitByIds(forecastingUnitIds).then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                let tempList = [];
                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: getLabelText(listArray[i].label, this.state.lang) + ' | ' + parseInt(listArray[i].forecastingUnitId),
                            id: parseInt(listArray[i].forecastingUnitId),
                            active: listArray[i].active,
                            tracerCategoryId: listArray[i].tracerCategory.id,
                            unit: listArray[i].unit
                        }
                        tempList[i] = paJson
                    }
                }
                this.setState({
                    forecastingUnitList: tempList,
                },
                    () => {
                        this.getUnit();
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
     * This function is used to get the full unit list
     */
    getUnit() {
        UnitService.getUnitListAll().then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                let tempList = [];
                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: getLabelText(listArray[i].label, this.state.lang),
                            id: parseInt(listArray[i].unitId),
                            active: listArray[i].active,
                        }
                        tempList[i] = paJson
                    }
                }
                this.setState({
                    unitList: tempList,
                },
                    () => {
                        this.getDataSet();
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
     * This function is used to get the usage period list
     */
    getUsagePeriod() {
        UsagePeriodService.getUsagePeriod().then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                let tempList = [];
                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: getLabelText(listArray[i].label, this.state.lang),
                            id: parseInt(listArray[i].usagePeriodId),
                            active: listArray[i].active,
                            convertToMonth: listArray[i].convertToMonth
                        }
                        tempList[i] = paJson
                    }
                }
                tempList.sort((a, b) => parseFloat(b.convertToMonth) - parseFloat(a.convertToMonth));
                tempList.unshift({
                    name: 'indefinitely',
                    id: -1,
                    active: true,
                });
                this.setState({
                    usagePeriodList: tempList,
                    usagePeriodListLong: response.data.sort((a, b) => parseFloat(b.convertToMonth) - parseFloat(a.convertToMonth))
                },
                    () => {
                        this.getUsageTemplateData();
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
     * This function is used to build the jexcel table for usage templates
     */
    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];
        let dropdownList = [];
        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                data = [];
                dropdownList.push({
                    id: papuList[j].forecastingUnit.id,
                    name : papuList[j].forecastingUnit.label.label_en + " | " + papuList[j].forecastingUnit.id,
                });
                data[0] = papuList[j].usageTemplateId
                data[1] = (papuList[j].program == null ? -1 : papuList[j].program.id) 
                data[2] = getLabelText(papuList[j].label, this.state.lang);
                data[3] = papuList[j].tracerCategory.id
                data[4] = papuList[j].forecastingUnit.id
                data[5] = papuList[j].lagInMonths
                data[6] = papuList[j].usageType.id
                data[7] = papuList[j].noOfPatients
                data[8] = papuList[j].unit.id
                data[9] = papuList[j].noOfForecastingUnits
                data[10] = papuList[j].oneTimeUsage
                data[11] = (papuList[j].usageFrequencyCount == null ? '' : papuList[j].usageFrequencyCount);
                data[12] = (papuList[j].usageFrequencyUsagePeriod != null ? papuList[j].usageFrequencyUsagePeriod.usagePeriodId : '')
                data[13] = (papuList[j].repeatCount == null ? '' : papuList[j].repeatCount);
                data[14] = (papuList[j].usageType.id == 2 ? -1 : (papuList[j].repeatUsagePeriod != null ? papuList[j].repeatUsagePeriod.usagePeriodId : ''))
                let usagePeriodConversion = (papuList[j].repeatUsagePeriod != null ? papuList[j].repeatUsagePeriod.convertToMonth : 1);
                let v13 = (papuList[j].repeatCount == null ? '' : papuList[j].repeatCount);
                let i1 = papuList[j].noOfPatients;
                let l1 = papuList[j].noOfForecastingUnits;
                let n1 = parseFloat(l1 / i1).toFixed(2);
                let VLookUp = (papuList[j].usageFrequencyUsagePeriod != null ? papuList[j].usageFrequencyUsagePeriod.convertToMonth : '');
                let p1 = (papuList[j].usageFrequencyCount == null ? '' : papuList[j].usageFrequencyCount);
                let s1 = (papuList[j].oneTimeUsage == false ? (parseFloat(p1 * n1 * VLookUp).toFixed(2)) != null ? (parseFloat(p1 * n1 * VLookUp).toFixed(2)) : '' : "")
                data[15] = (papuList[j].usageType.id == 1 ? (papuList[j].oneTimeUsage == false ? `=ROUND(${v13}/${usagePeriodConversion}*${s1},2)` : `=ROUND(${n1},2)`) : '')
                let unitName = (this.state.dimensionList.filter(c => c.id == papuList[j].unit.id)[0]).name;
                let string = "Every " + (papuList[j].noOfPatients).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") + " " + unitName + "(s) - requires " + papuList[j].noOfForecastingUnits + " " + papuList[j].forecastingUnit.unit.label.label_en + "(s)";
                if (!papuList[j].oneTimeUsage) { 
                    if (papuList[j].usageType.id == 2) {
                        string += " " + (papuList[j].usageFrequencyCount == null ? '' : " Every " + papuList[j].usageFrequencyCount) + " " + (papuList[j].usageFrequencyUsagePeriod != null ? papuList[j].usageFrequencyUsagePeriod.label.label_en : '');
                    } else {
                        string += " " + (papuList[j].usageFrequencyCount == null ? '' : papuList[j].usageFrequencyCount) + " time(s) per " + (papuList[j].usageFrequencyUsagePeriod != null ? papuList[j].usageFrequencyUsagePeriod.label.label_en : '');
                    }
                    if (papuList[j].usageType.id == 2) {
                        string += " indefinitely";
                    } else {
                        string += " " + (papuList[j].usageType.id == 1 && papuList[j].oneTimeUsage == false ? 'for ' : '') + (papuList[j].repeatCount == null ? '' : ' ' + papuList[j].repeatCount) + " " + (papuList[j].repeatUsagePeriod != null ? papuList[j].repeatUsagePeriod.label.label_en : '');
                    }
                }
                data[16] = string;
                data[17] = 0;
                data[18] = 0;
                data[19] = (papuList[j].program == null ? -1 : papuList[j].program.id)
                data[20] = papuList[j].notes
                data[21] = papuList[j].active
                data[22] = papuList[j].createdBy.userId
                papuDataArr[count] = data;
                count++;
            }
        }
        if(dropdownList.length > 0){
            dropdownList = [
                ...new Map(dropdownList.map((item) => [item["id"], item])).values(),
            ];
        }
        if (papuDataArr.length == 0) {
            data = [];
            data[0] = 0;
            data[1] = "";
            data[2] = "";
            data[3] = ""
            data[4] = "";
            data[5] = 0;
            data[6] = "";
            data[7] = 1;
            data[8] = ""
            data[9] = 0;
            data[10] = "";
            data[11] = "";
            data[12] = "";
            data[13] = ""
            data[14] = "";
            data[15] = "";
            data[16] = "";
            data[17] = 1;
            data[18] = 1;
            data[19] = 0;
            data[20] = "";
            data[21] = 0;
            data[22] = papuList[j].createdBy.userId
            papuDataArr[0] = data;
        }
        this.el = jexcel(document.getElementById("paputableDiv"), '');
        jexcel.destroy(document.getElementById("paputableDiv"), true);
        var data = papuDataArr;
        var options = {
            data: data,
            columnDrag: false,
            columns: [
                {
                    type: 'text',
                    visible: false, autoCasting: false
                },
                {
                    title: i18n.t('static.forecastProgram.forecastProgram'),
                    type: 'autocomplete',
                    source: this.state.typeList,
                    width: '120',
                    filter: this.filterDataset //1 B
                },
                {
                    title: i18n.t('static.usageTemplate.usageName'),
                    type: 'text',
                    width: '150',
                    textEditor: true,//2 C
                  
                },
                {
                    title: i18n.t('static.tracercategory.tracercategory'),
                    type: 'autocomplete',
                    width: '130',
                    source: this.state.tracerCategoryList, 
                    filter: this.filterTracerCategoryByProgramId,
                    required: true,
                    regex: {
                        ex: /^\S+(?: \S+)*$/,
                        text: i18n.t('static.validSpace.string')
                    }
                },
                {
                    title: i18n.t('static.product.unit1'),
                    type: 'dropdown',
                    width: '130',
                    source: dropdownList,
                    options: {
                        url: `${API_URL}/api/dropdown/forecastingUnit/autocomplete/filter/tracerCategory/searchText/language/tracerCategoryId`,
                        autocomplete: true,
                        remoteSearch: true,
                        onbeforesearch: function(instance, request) {
                            if(this.state.tracerCategoryLoading == false  && instance.search.length > 2){
                                request.method = 'GET';                                
                                let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                                let jwtToken = CryptoJS.AES.decrypt(localStorage.getItem('token-' + decryptedCurUser).toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                                request.beforeSend = (httpRequest) => {
                                    httpRequest.setRequestHeader('Authorization', 'Bearer '+jwtToken);
                                }
                                const searchText = instance.search;
                                const language = this.state.lang;
                                const tracerCategoryId = this.state.tempTracerCategoryId;
                                request.url = request.url.replace("searchText/language/tracerCategoryId", `${searchText}/${language}/${tracerCategoryId}`);
                                return request;
                            }
                        }.bind(this),
                    },
                    required: true,
                    regex: {
                        ex: /^\S+(?: \S+)*$/,
                        text: i18n.t('static.validSpace.string')
                    }
                },
                {
                    title: i18n.t('static.usageTemplate.lagInMonth'),
                    type: 'numeric',
                    width: '100',
                    textEditor: true, 
                    required: true,
                    number: true,
                    minValue: {
                        value: 0,
                        text: i18n.t('static.planningUnitSetting.negativeValueNotAllowed')
                    },
                    regex: {
                        ex: INTEGER_NO_REGEX,
                        text: i18n.t('static.common.onlyIntegers'),
                    }
                },
                {
                    title: i18n.t('static.supplyPlan.type'),
                    type: 'dropdown',
                    width: '95',
                    source: [
                        { id: 1, name: i18n.t('static.usageTemplate.discrete') },
                        { id: 2, name: i18n.t('static.usageTemplate.continuous') }
                    ],
                    required: true,
                    regex: {
                        ex: /^\S+(?: \S+)*$/,
                        text: i18n.t('static.message.spacetext'),
                    }
                },
                {
                    title: i18n.t('static.usageTemplate.persons'),
                    type: 'numeric',
                    textEditor: true, 
                    mask: '#,##',
                    width: '130',
                    disabledMaskOnEdition: true
                },
                {
                    title: i18n.t('static.usageTemplate.personsUnit'),
                    type: 'autocomplete',
                    width: '130',
                    source: this.state.dimensionList,
                    readOnly: (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN')) ? false : true ,
                    required: true,
                    regex: {
                        ex: /^\S+(?: \S+)*$/,
                        text: i18n.t('static.message.spacetext'),
                    }
                },
                {
                    title: i18n.t('static.usageTemplate.fuPerPersonPerTime'),
                    type: 'numeric',
                    width: '130',
                    textEditor: true, 
                    required: true,
                    number: true,
                    minValue: {
                        value: 0,
                        text: i18n.t('static.planningUnitSetting.negativeValueNotAllowed')
                    },
                    regex: {
                        ex: DECIMAL_NO_REGEX,
                        text: i18n.t('static.common.onlyIntegers')
                    }
                },
                {
                    title: i18n.t('static.usageTemplate.onTimeUsage?'),
                    type: 'checkbox',
                    width: '130',
                    readOnly: false
                },
                {
                    title: i18n.t('static.usageTemplate.timesPerFrequency'),
                    type: 'numeric',
                    width: '130',
                    textEditor: true,
                    decimal: '.', 
                },
                {
                    title: i18n.t('static.usageTemplate.frequency'),
                    type: 'autocomplete',
                    width: '130',
                    source: this.state.usagePeriodList, 
                    filter: this.filterUsagePeriod1
                },
                {
                    title: i18n.t('static.usagePeriod.usagePeriod'),
                    type: 'numeric',
                    width: '130',
                    textEditor: true, 
                },
                {
                    title: i18n.t('static.usageTemplate.periodUnit'),
                    type: 'autocomplete',
                    width: '130',
                    source: this.state.usagePeriodList, 
                    filter: this.filterUsagePeriod2
                },
                {
                    title: i18n.t('static.usagePeriod.fuRequired'),
                    type: 'text',
                    readOnly: true,
                    width: '130',
                    textEditor: true, 
                },
                {
                    title: i18n.t('static.usagePeriod.usageInWords'),
                    type: 'text',
                    readOnly: true,
                    width: 180,
                    textEditor: true, 
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false  
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false   
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false   
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false   
                },
                {
                    title: i18n.t('static.checkbox.active'),
                    type: 'checkbox',
                    width: '130',
                    readOnly: false
                },
                {
                    type: 'text',
                    visible: false, autoCasting: false  
                },
            ],
            onload: this.loaded,
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                }
            }.bind(this),
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            onchange: this.changed,
            oneditionstart: function (instance, cell, x, y, value) {
                this.setState({ tracerCategoryLoading: true })
                let tempId = data[y][3]
                this.setState({ tempTracerCategoryId: tempId }, () => {
                    this.setState({tracerCategoryLoading: false})
                })
            }.bind(this),
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            onsearch: function (el) {
                var elInstance = el;
                var json = elInstance.getJson();
                var jsonLength;
                jsonLength = json.length;
                for (var j = 0; j < jsonLength; j++) {
                    try {
                        var rowData = elInstance.getRowData(j);
                        elInstance.setStyle(`B${parseInt(j) + 1}`, 'text-align', 'left');
                        var rowData = elInstance.getRowData(j);
                        var typeId = rowData[6];
                        var oneTimeUsage = rowData[10];
                        if (typeId == 2) {
                            var cell1 = elInstance.getCell(("H").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("K").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                        } else {
                            var cell1 = elInstance.getCell(("H").concat(parseInt(j) + 1))
                            cell1.classList.remove('readonly');
                            var cell1 = elInstance.getCell(("K").concat(parseInt(j) + 1))
                            cell1.classList.remove('readonly');
                        }
                        if (oneTimeUsage) {
                            var cell1 = elInstance.getCell(("L").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("M").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                        } else {
                            var cell1 = elInstance.getCell(("L").concat(parseInt(j) + 1))
                            cell1.classList.remove('readonly');
                            var cell1 = elInstance.getCell(("M").concat(parseInt(j) + 1))
                            cell1.classList.remove('readonly');
                        }
                        if (typeId == 1 && oneTimeUsage == false) {
                            var cell1 = elInstance.getCell(("N").concat(parseInt(j) + 1))
                            cell1.classList.remove('readonly');
                            var cell1 = elInstance.getCell(("O").concat(parseInt(j) + 1))
                            cell1.classList.remove('readonly');
                        } else {
                            var cell1 = elInstance.getCell(("N").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("O").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                        }
                        var typeId = rowData[19];
                        if ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN') && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL')) && (typeId == -1 && typeId != 0)) {
                            var cell1 = elInstance.getCell(("B").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("C").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("D").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("E").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("F").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("G").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("H").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("I").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("J").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("K").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("L").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("M").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("N").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("O").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("U").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("V").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                        }
                        if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL') && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN')) {
                            var cell1 = elInstance.getCell(("B").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("C").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("D").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("E").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("F").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("G").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("H").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("I").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("J").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("K").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("L").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("M").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("N").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("O").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("U").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("V").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                        }
                    } catch (err) {
                    }
                }
            }.bind(this),
            onfilter: function (el) {
                var elInstance = el;
                var json = elInstance.getJson();
                var jsonLength;
                jsonLength = json.length;
                for (var j = 0; j < jsonLength; j++) {
                    try {
                        var rowData = elInstance.getRowData(j);
                        elInstance.setStyle(`B${parseInt(j) + 1}`, 'text-align', 'left');
                        var rowData = elInstance.getRowData(j);
                        var typeId = rowData[6];
                        var oneTimeUsage = rowData[10];
                        if (typeId == 2) {
                            var cell1 = elInstance.getCell(("H").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("K").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                        } else {
                            var cell1 = elInstance.getCell(("H").concat(parseInt(j) + 1))
                            cell1.classList.remove('readonly');
                            var cell1 = elInstance.getCell(("K").concat(parseInt(j) + 1))
                            cell1.classList.remove('readonly');
                        }
                        if (oneTimeUsage) {
                            var cell1 = elInstance.getCell(("L").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("M").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                        } else {
                            var cell1 = elInstance.getCell(("L").concat(parseInt(j) + 1))
                            cell1.classList.remove('readonly');
                            var cell1 = elInstance.getCell(("M").concat(parseInt(j) + 1))
                            cell1.classList.remove('readonly');
                        }
                        if (typeId == 1 && oneTimeUsage == false) {
                            var cell1 = elInstance.getCell(("N").concat(parseInt(j) + 1))
                            cell1.classList.remove('readonly');
                            var cell1 = elInstance.getCell(("O").concat(parseInt(j) + 1))
                            cell1.classList.remove('readonly');
                        } else {
                            var cell1 = elInstance.getCell(("N").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("O").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                        }
                        var typeId = rowData[19];
                        if ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN') && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL')) && (typeId == -1 && typeId != 0)) {
                            var cell1 = elInstance.getCell(("B").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("C").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("D").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("E").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("F").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("G").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("H").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("I").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("J").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("K").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("L").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("M").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("N").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("O").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("U").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("V").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                        }
                        if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL') && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN')) {
                            var cell1 = elInstance.getCell(("B").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("C").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("D").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("E").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("F").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("G").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("H").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("I").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("J").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("K").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("L").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("M").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("N").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("O").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("U").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                            var cell1 = elInstance.getCell(("V").concat(parseInt(j) + 1))
                            cell1.classList.add('readonly');
                        }
                    } catch (err) {
                    }
                }
            }.bind(this),
            oneditionend: this.oneditionend,
            onchangepage: this.onchangepage,
            editable: (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN')) ? true : false,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y == null) {
                } else {
                    if (obj.options.allowDeleteRow == true) {
                        if (obj.getRowData(y)[0] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                }
                            });
                        }
                        var typeId = this.el.getValueFromCoords(19, y);
                        if (!this.el.getValueFromCoords(10, y) && ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL')) && typeId == -1 && typeId != 0)) {
                            items.push({
                                title: i18n.t('static.usageTemplate.calculateUsageFrequency'),
                                onclick: function () {
                                    let value = this.el.getValueFromCoords(12, y);
                                    value = Number(value);
                                    let tempUsagePeriodList = [];
                                    if (typeof value === 'number') {
                                        let tempList = this.state.usagePeriodListLong;
                                        if (value == 0) {
                                            tempUsagePeriodList = tempList;
                                        } else {
                                            let selectedPickerConvertTOMonth = tempList.filter(c => c.usagePeriodId == value)[0].convertToMonth;
                                            for (var i = 0; i < tempList.length; i++) {
                                                if (parseFloat(tempList[i].convertToMonth) <= parseFloat(selectedPickerConvertTOMonth)) {
                                                    tempUsagePeriodList.push(tempList[i]);
                                                }
                                            }
                                        }
                                    }
                                    this.setState({
                                        isModalOpen: true,
                                        x: x,
                                        y: y,
                                        number1: '',
                                        number2: '',
                                        picker1: '',
                                        picker2: '',
                                        usagePeriodDisplayList: this.state.usagePeriodListLong
                                    })
                                }.bind(this)
                            });
                        }
                    }
                }
                return items;
            }.bind(this)
        };
        var dataEL = "";
        this.el = jexcel(document.getElementById("paputableDiv"), options);
        dataEL = this.el
        this.setState({
            dataEl: dataEL,
            tempForecastingUnitList: dropdownList,
            loading: false
        })
    }
    /**
     * This function is used to filter the dataset(Program) list based on the business function
     */
    filterDataset = function (instance, cell, c, r, source) {
        var mylist = this.state.typeList;
        if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL')) {
            mylist = mylist.filter(c => c.id != -1);
        }
        return mylist;
    }.bind(this)
    /**
     * This function is used to filter the tracer category list by program Id based on active
     */
    filterTracerCategoryByProgramId = function (instance, cell, c, r, source) {
        var mylist = this.state.tracerCategoryList.filter(c=>c.active);
        var value = (this.state.dataEl.getJson(null, false)[r])[1];
        value = Number(value);
        if (value != -1 && value != 0) {
            return this.state.tcListBasedOnProgram.filter(c=>c.active)
        }
        return mylist;
    }.bind(this)
    /**
     * This function is used to filter the frequency
     */
    filterUsagePeriod1 = function (instance, cell, c, r, source) {
        var mylist = this.state.usagePeriodList;
        if (mylist[0].id == -1) {
            mylist.splice(0, 1);
        }
        return mylist;
    }.bind(this)
    /**
     * This function is used to filter the Period Unit
     */
    filterUsagePeriod2 = function (instance, cell, c, r, source) {
        var mylist = this.state.usagePeriodList;
        if (mylist[0].id == -1) {
            mylist.splice(0, 1);
        }
        var value = (this.state.dataEl.getJson(null, false)[r])[12];
        let tempUsagePeriodList = [];
        if (value > 0) {
            let selectedPickerConvertTOMonth = mylist.filter(c => c.id == value)[0].convertToMonth;
            for (var i = 0; i < mylist.length; i++) {
                if (parseFloat(mylist[i].convertToMonth) <= parseFloat(selectedPickerConvertTOMonth)) {
                    tempUsagePeriodList.push(mylist[i]);
                }
            }
        }
        return tempUsagePeriodList;
    }.bind(this)
    /**
     * This function is used to get usage template list
     */
    getUsageTemplateData() {
        this.hideSecondComponent();
        UsageTemplateService.getUsageTemplateListAll().then(response => {
            if (response.status == 200) {
                this.setState({
                    usageTemplateList: response.data,
                    selSource: response.data,
                },
                    () => {
                        this.buildJexcel()
                    })
            }
            else {
                this.setState({
                    message: response.data.messageCode, loading: false, color: "#BA0C2F",
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }
        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false,
                            color: "#BA0C2F",
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
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                        }
                    }
                }
            );
    }
    /**
     * This function is triggered when this component is about to unmount
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }
    /**
     * This function is trigged when this component is updated and is being used to display the warning for leaving unsaved changes
     */
    componentDidUpdate = () => {
        if (this.state.isChanged1 == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }
    /**
     * This function is used to build the role array
     */
    componentDidMount() {
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
        var roleList = decryptedUser.roleList;
        var roleArray = []
        for (var r = 0; r < roleList.length; r++) {
            roleArray.push(roleList[r].roleId)
        }
        this.setState({
            roleArray: roleArray
        },
            () => {
                this.getTracerCategory();
            })
    }
    /**
     * This function is used when the editing for a particular cell is completed to format the cell or to update the value
     * @param {*} instance This is the sheet where the data is being updated
     * @param {*} cell This is the value of the cell whose value is being updated
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} value This is the updated value
     */
    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance;
        elInstance.setValueFromCoords(17, y, 1, true);
    }
    /**
     * This function is called when user clicks on add row button add the usage template row in table
     */
    addRow = function () {
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";
        data[3] = ""
        data[4] = "";
        data[5] = 0;
        data[6] = "";
        data[7] = 1;
        data[8] = ""
        data[9] = 0;
        data[10] = "";
        data[11] = "";
        data[12] = "";
        data[13] = ""
        data[14] = "";
        data[15] = "";
        data[16] = "";
        data[17] = 1;
        data[18] = 1;
        data[19] = 0;
        data[20] = "";
        data[21] = true;
        this.el.insertRow(
            data, 0, 1
        );
        this.el.getCell("E1").classList.add('typing-'+this.state.lang);
    };
    /**
     * This function is called when submit button of the usage template is clicked and is used to save usage templates if all the data is successfully validated.
     */
    formSubmit = function () {
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState({ loading: true })
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("17")) === 1) {
                    let json = {
                        usageTemplateId: parseInt(map1.get("0")),
                        label: {
                            label_en: map1.get("2"),
                        },
                        program: (parseInt(map1.get("1")) == -1 ? null : { id: parseInt(map1.get("1")) }),
                        tracerCategory: { id: parseInt(map1.get("3")) },
                        forecastingUnit: { id: parseInt(map1.get("4")) },
                        unit: { id: parseInt(map1.get("8")) },
                        lagInMonths: this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        usageType: { id: parseInt(map1.get("6")) },
                        noOfPatients: this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        noOfForecastingUnits: this.el.getValue(`J${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        oneTimeUsage: map1.get("10"),
                        usageFrequencyUsagePeriod: { usagePeriodId: parseInt(map1.get("12")) },
                        usageFrequencyCount: this.el.getValue(`L${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        repeatUsagePeriod: { usagePeriodId: (parseInt(map1.get("14")) == -1 ? null : parseInt(map1.get("14"))) },
                        repeatCount: this.el.getValue(`N${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        active: map1.get("21"),
                        notes: map1.get("20")
                    }
                    changedpapuList.push(json);
                }
            }
            UsageTemplateService.addUpdateUsageTemplateMapping(changedpapuList)
                .then(response => {
                    if (response.status == "200") {
                        this.setState({
                            message: i18n.t('static.usagePeriod.addUpdateMessage'), color: 'green', isChanged1: false
                        },
                            () => {
                                this.hideSecondComponent();
                                this.getTracerCategory();
                            })
                    } else {
                        this.setState({
                            message: response.data.messageCode,
                            color: "#BA0C2F", loading: false
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }
                })
                .catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                color: "#BA0C2F", loading: false
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
                                        color: "#BA0C2F", loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        color: "#BA0C2F", loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        color: "#BA0C2F", loading: false
                                    });
                                    break;
                            }
                        }
                    }
                );
        } else {
        }
    }
    /**
     * This function is called when page is changed to make some cells readonly based on multiple condition
     * @param {*} el This is the DOM Element where sheet is created
     * @param {*} pageNo This the page number which is clicked
     * @param {*} oldPageNo This is the last page number that user had selected
     */
    onchangepage(el, pageNo, oldPageNo) {
        var elInstance = el;
        var json = elInstance.getJson(null, false);
        var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var start = pageNo * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        for (var y = start; y < jsonLength; y++) {
            var rowData = elInstance.getRowData(y);
            elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');
            var rowData = elInstance.getRowData(y);
            var typeId = rowData[6];
            var oneTimeUsage = rowData[10];
            if (typeId == 2) {
                var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`K${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
            } else {
                var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                cell1.classList.remove('readonly');
                var cell1 = elInstance.getCell(`K${parseInt(y) + 1}`)
                cell1.classList.remove('readonly');
            }
            if (oneTimeUsage) {
                var cell1 = elInstance.getCell(`L${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`M${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
            } else {
                var cell1 = elInstance.getCell(`L${parseInt(y) + 1}`)
                cell1.classList.remove('readonly');
                var cell1 = elInstance.getCell(`M${parseInt(y) + 1}`)
                cell1.classList.remove('readonly');
            }
            if (typeId == 1 && oneTimeUsage == false) {
                var cell1 = elInstance.getCell(`N${parseInt(y) + 1}`)
                cell1.classList.remove('readonly');
                var cell1 = elInstance.getCell(`O${parseInt(y) + 1}`)
                cell1.classList.remove('readonly');
            } else {
                var cell1 = elInstance.getCell(`N${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`O${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
            }
            var typeId = rowData[19];
            if ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN') && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL')) && (typeId == -1 && typeId != 0)) {
                var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`K${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`L${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`M${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`N${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`O${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`U${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`V${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
            }
            if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL') && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN')) {
                var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`K${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`L${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`M${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`N${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`O${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`U${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(`V${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
            }
        }
    }
    /**
     * This function is used to format the usage template table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance, 0);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[12].classList.add('CalculatorTheadtr');
        tr.children[2].classList.add('InfoTrAsteriskTheadtrTd');
        tr.children[3].classList.add('InfoTrAsteriskTheadtrTd');
        tr.children[6].classList.add('InfoTrAsteriskTheadtrTd');
        tr.children[7].classList.add('InfoTrAsteriskTheadtrTd');
        tr.children[8].classList.add('InfoTr');
        tr.children[9].classList.add('InfoTr');
        tr.children[10].classList.add('InfoTr');
        tr.children[11].classList.add('InfoTr');
        tr.children[12].classList.add('InfoTr');
        tr.children[13].classList.add('InfoTr');
        tr.children[14].classList.add('InfoTr');
        tr.children[15].classList.add('InfoTr');
        tr.children[16].classList.add('InfoTr');
        tr.children[17].classList.add('InfoTr');
        tr.children[2].title = i18n.t('static.tooltip.ForecastProgram');
        tr.children[3].title = i18n.t('static.tooltip.UsageName');
        tr.children[6].title = i18n.t('static.tooltip.LagInMonth');
        tr.children[7].title = i18n.t('static.tooltip.UsageType');
        tr.children[8].title = i18n.t('static.tooltip.Persons');
        tr.children[9].title = i18n.t('static.tooltip.PersonsUnit');
        tr.children[10].title = i18n.t('static.tooltip.FUPersonTime');
        tr.children[11].title = i18n.t('static.tooltip.OneTimeUsage');
        tr.children[12].title = i18n.t('static.tooltip.OfTimeFreqwency');
        tr.children[13].title = i18n.t('static.tooltip.Freqwency');
        tr.children[14].title = i18n.t('static.tooltip.UsagePeriod');
        tr.children[15].title = i18n.t('static.tooltip.PeriodUnit');
        tr.children[16].title = i18n.t('static.tooltip.OfFuRequired');
        tr.children[17].title = i18n.t('static.tooltip.UsageInWords');
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson();
        var jsonLength;
        if ((document.getElementsByClassName("jss_pagination_dropdown")[0] != undefined)) {
            jsonLength = 1 * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        }
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        for (var j = 0; j < jsonLength; j++) {
            var rowData = elInstance.getRowData(j);
            elInstance.setStyle(`B${parseInt(j) + 1}`, 'text-align', 'left');
            var rowData = elInstance.getRowData(j);
            var typeId = rowData[6];
            var oneTimeUsage = rowData[10];
            if (typeId == 2) {
                var cell1 = elInstance.getCell(("H").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("K").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
            } else {
                var cell1 = elInstance.getCell(("H").concat(parseInt(j) + 1))
                cell1.classList.remove('readonly');
                var cell1 = elInstance.getCell(("K").concat(parseInt(j) + 1))
                cell1.classList.remove('readonly');
            }
            if (oneTimeUsage) {
                var cell1 = elInstance.getCell(("L").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("M").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
            } else {
                var cell1 = elInstance.getCell(("L").concat(parseInt(j) + 1))
                cell1.classList.remove('readonly');
                var cell1 = elInstance.getCell(("M").concat(parseInt(j) + 1))
                cell1.classList.remove('readonly');
            }
            if (typeId == 1 && oneTimeUsage == false) {
                var cell1 = elInstance.getCell(("N").concat(parseInt(j) + 1))
                cell1.classList.remove('readonly');
                var cell1 = elInstance.getCell(("O").concat(parseInt(j) + 1))
                cell1.classList.remove('readonly');
            } else {
                var cell1 = elInstance.getCell(("N").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("O").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
            }
            var typeId = rowData[19];
            if ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN') && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL')) && (typeId == -1 && typeId != 0)) {
                var cell1 = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("C").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("D").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("E").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("F").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("G").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("H").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("I").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("J").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("K").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("L").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("M").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("N").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("O").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("U").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("V").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
            }
            if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL') && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN')) {
                var cell1 = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("C").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("D").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("E").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("F").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("G").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("H").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("I").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("J").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("K").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("L").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("M").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("N").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("O").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("U").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
                var cell1 = elInstance.getCell(("V").concat(parseInt(j) + 1))
                cell1.classList.add('readonly');
            }
        }
    }
    /**
     * This function is called when something in the usage template table is changed to add the validations or fill some auto values for the cells
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} value This is the updated value
     */
    changed = function (instance, cell, x, y, value) {
        changed(instance, cell, x, y, value)
        if ((x == 7 || x == 9) && this.el.getValueFromCoords(10, y)) {
            let i1 = this.el.getValueFromCoords(7, y);
            let l1 = this.el.getValueFromCoords(9, y);
            let n1 = l1 / i1;
            this.el.setValueFromCoords(15, y, `=ROUND(${n1},2)`, true);
        }
        if (x == 10) {
            if (!value) {
                this.el.setValueFromCoords(15, y, '', true)
                this.el.setValueFromCoords(11, y, '', true)
                this.el.setValueFromCoords(12, y, '', true)
                this.el.setValueFromCoords(13, y, '', true)
                this.el.setValueFromCoords(14, y, '', true)
            } else {
                this.el.setValueFromCoords(11, y, '', true)
                this.el.setValueFromCoords(12, y, '', true)
                this.el.setValueFromCoords(13, y, '', true)
                this.el.setValueFromCoords(14, y, '', true)
                var col = ("L").concat(parseInt(y) + 1);
                this.el.setComments(col, "");
                var col = ("M").concat(parseInt(y) + 1);
                this.el.setComments(col, "");
                var col = ("N").concat(parseInt(y) + 1);
                this.el.setComments(col, "");
                var col = ("O").concat(parseInt(y) + 1);
                this.el.setComments(col, "");
                let i1 = this.el.getValueFromCoords(7, y);
                let l1 = this.el.getValueFromCoords(9, y);
                let n1 = l1 / i1;
                this.el.setValueFromCoords(15, y, `=ROUND(${n1},2)`, true);
            }
        }
        if (x == 6) {
            if (value == 2) {
                this.el.setValueFromCoords(15, y, '', true)
                this.el.setValueFromCoords(7, y, 1, true);
                var col = ("H").concat(parseInt(y) + 1);
                this.el.setComments(col, "");
                var col = ("K").concat(parseInt(y) + 1);
                this.el.setComments(col, "");
                var col = ("N").concat(parseInt(y) + 1);
                this.el.setComments(col, "");
                var col = ("O").concat(parseInt(y) + 1);
                this.el.setComments(col, "");
                this.el.setValueFromCoords(10, y, false, true);
                var mylist = this.state.usagePeriodList;
                if (mylist[0].id != -1) {
                    mylist.unshift({
                        name: 'indefinitely',
                        id: -1,
                        active: true,
                    });
                    this.setState({
                        usagePeriodList: mylist
                    },
                        () => {
                            this.el.setValueFromCoords(14, y, -1, true);
                        })
                } else {
                    this.el.setValueFromCoords(14, y, -1, true);
                }
            } else {
                this.el.setValueFromCoords(14, y, '', true)
                this.el.setValueFromCoords(7, y, '', true)
                this.el.setValueFromCoords(15, y, '', true)
            }
        }
        if ((x == 13 || x == 14) && this.el.getValueFromCoords(6, y) == 1 && !this.el.getValueFromCoords(10, y)) {
            let v14 = (this.el.getValue(`N${parseInt(y) + 1}`, true) == null || this.el.getValue(`N${parseInt(y) + 1}`, true) == '' ? '' : this.el.getValue(`N${parseInt(y) + 1}`, true));
            let p1 = this.el.getValueFromCoords(11, y);
            let i1 = this.el.getValueFromCoords(7, y);
            let l1 = this.el.getValueFromCoords(9, y);
            let n1 = parseFloat(l1 / i1).toFixed(2);
            let VLookUp1 = '';
            let VLookUp = '';
            let usagePeriodObj1 = this.state.usagePeriodList.filter(c => c.id == this.el.getValueFromCoords(12, y))[0];
            if (usagePeriodObj1 != undefined && usagePeriodObj1 != null) {
                VLookUp1 = usagePeriodObj1.convertToMonth;
            }
            let s1 = (this.el.getValueFromCoords(10, y) == false ? parseFloat(p1 * n1 * VLookUp1).toFixed(2) != null ? parseFloat(p1 * n1 * VLookUp1).toFixed(2) : '' : "")
            let t14 = (s1 == null || s1 == '' ? '' : s1);
            let o14 = (this.el.getValue(`K${parseInt(y) + 1}`, true) == null || this.el.getValue(`K${parseInt(y) + 1}`, true) == '' ? '' : this.el.getValue(`K${parseInt(y) + 1}`, true));
            let selectedOneTimeUsageID = this.el.getValueFromCoords(10, y);
            let selectedUTID = this.el.getValueFromCoords(14, y);
            let usagePeriodObj = this.state.usagePeriodList.filter(c => c.id == selectedUTID)[0];
            if (usagePeriodObj != undefined && usagePeriodObj != null) {
                VLookUp = usagePeriodObj.convertToMonth;
            }
            let string = (selectedOneTimeUsageID ? o14 : v14 / VLookUp * t14);
            if (v14 != null && v14 != '' && VLookUp != null && VLookUp != '') {
                this.el.setValueFromCoords(15, y, `=ROUND(${parseFloat(string)},2)`, true);
            } else {
                this.el.setValueFromCoords(15, y, '', true)
            }
        }
        if (x == 4 || x == 7 || x == 9 || x == 11 || x == 12 || x == 13 || x == 14 || x == 8) {
            let forecastingUnitIds = this.state.tempForecastingUnitList.map(e => e.id)
            ForecastingUnitService.getForecastingUnitByIds(forecastingUnitIds).then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    let tempList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: getLabelText(listArray[i].label, this.state.lang) + ' | ' + parseInt(listArray[i].forecastingUnitId),
                                id: parseInt(listArray[i].forecastingUnitId),
                                active: listArray[i].active,
                                tracerCategoryId: listArray[i].tracerCategory.id,
                                unit: listArray[i].unit
                            }
                            tempList[i] = paJson
                        }
                    }
                    this.setState({
                        forecastingUnitList: tempList,
                    },
                        () => {
                            let unitIdValue = this.el.getValueFromCoords(8, y);
                            let unitName = '';
                            if (unitIdValue != 0) {
                                unitName = this.state.dimensionList.filter(c => c.id == unitIdValue)[0].name;
                            }
                            let unitName1 = '';
                            let obj = this.state.forecastingUnitList.filter(c => c.id == this.el.getValueFromCoords(4, y))[0];
                            if (obj != undefined && obj != null) {
                                let unitId = obj.unit.id;
                                if (unitIdValue != 0) {
                                    unitName1 = this.state.unitList.filter(c => c.id == unitId)[0].name;
                                }
                            }
                            let string = 'Every ' + (this.el.getValue(`H${parseInt(y) + 1}`, true) == '' ? '____' : this.el.getValue(`H${parseInt(y) + 1}`, true)) + ' ' + (unitName == '' ? '____' : unitName) + '(s) - requires ' + (this.el.getValue(`J${parseInt(y) + 1}`, true) == '' ? '____' : this.el.getValue(`J${parseInt(y) + 1}`, true)) + " " + (unitName1 == '' ? '____' : unitName1 + "(s)");
                            let q1 = '';
                            if (this.el.getValueFromCoords(10, y) == false) {
                                if (this.el.getValueFromCoords(6, y) == 1) {
                                    q1 = '';
                                    if (!this.el.getValueFromCoords(10, y)) {
                                        q1 = 'time(s) per';
                                    }
                                }
                            } else {
                                q1 = '';
                            }
                            let t1 = ''
                            if (this.el.getValueFromCoords(6, y) == 1 && !this.el.getValueFromCoords(10, y)) {
                                t1 = 'for';
                            } else {
                                t1 = '';
                            }
                            if (!this.el.getValueFromCoords(10, y)) {
                                if (this.el.getValueFromCoords(6, y) == 2) {
                                    string += " Every " + (this.el.getValue(`L${parseInt(y) + 1}`, true) == '' ? '____' : this.el.getValue(`L${parseInt(y) + 1}`, true)) + " " + (this.el.getValue(`M${parseInt(y) + 1}`, true) == '' ? '____' : this.el.getValue(`M${parseInt(y) + 1}`, true));
                                } else {
                                    string += " " + (this.el.getValue(`L${parseInt(y) + 1}`, true) == '' ? '____' : this.el.getValue(`L${parseInt(y) + 1}`, true)) + " " + (q1 == '' ? '____' : q1) + " " + (this.el.getValue(`M${parseInt(y) + 1}`, true) == '' ? '____' : this.el.getValue(`M${parseInt(y) + 1}`, true));
                                }
                                if (this.el.getValueFromCoords(6, y) == 2) {
                                    string += " " + (this.el.getValue(`O${parseInt(y) + 1}`, true) == '' ? '____' : this.el.getValue(`O${parseInt(y) + 1}`, true));
                                } else {
                                    string += " " + (t1 == '' ? '____' : t1) + " " + (this.el.getValue(`N${parseInt(y) + 1}`, true) == '' ? '____' : this.el.getValue(`N${parseInt(y) + 1}`, true)) + " " + (this.el.getValue(`O${parseInt(y) + 1}`, true) == '' ? '____' : this.el.getValue(`O${parseInt(y) + 1}`, true));
                                }
                            }
                            this.el.setValueFromCoords(16, y, string, true);
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
        if (x == 10 || x == 11 || x == 12 || x == 21) {
            this.el.setValueFromCoords(17, y, 1, true);
        }
        if (x == 2) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(budgetRegx.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.spacetext'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 4) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(budgetRegx.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.spacetext'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.getCell(("E").concat(parseInt(y) + 1)).classList.remove('typing-'+this.state.lang);
                }
            }
        }
        if (x == 1) {
            this.el.setValueFromCoords(3, y, '', true)
            this.el.setValueFromCoords(4, y, '', true)
            let realmId = AuthenticationService.getRealmId();
            if(value!=-1){
        TracerCategoryService.getTracerCategoryByProgramIds(realmId, [value])
          .then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
              var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
              var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            var tcList=[];
            listArray.map(item=>{
                tcList.push({
                    name: getLabelText(item.label, this.state.lang),
                    id: parseInt(item.tracerCategoryId),
                    active: item.active,
                    healthAreaId: item.healthArea.id
                })
            })
            this.setState({
              tcListBasedOnProgram: tcList
            }, () => {
            });
          }).catch(
            error => {
              this.setState({
                tcListBasedOnProgram: []
              }, () => {
              });
            }
          );
        }else{
            this.setState({
                tcListBasedOnProgram: []
              }, () => {
              });
        }
        }

        if (x == 7) {
            let selectedTypeID = this.el.getValueFromCoords(6, y);
            if (selectedTypeID == 1) {
                var col = ("H").concat(parseInt(y) + 1);
                value = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = INTEGER_NO_REGEX;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.common.onlyIntegers'));
                    } else {
                        if (isNaN(Number.parseInt(value)) || value <= 0) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.program.validvaluetext'));
                        } else if (value.toString().length > 10) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.planningUnitSetting.10digitWholeNumber'));
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }
            }
        }
        if (x == 8) {
            this.el.setValueFromCoords(24, y, 1, true);
        }
        if (x == 9) {
            var col = ("J").concat(parseInt(y) + 1);
            value = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.program.validvaluetext'));
            }
        }
        if (x == 11) {
            let onTimeUsage = this.el.getValueFromCoords(10, y);
            if (!onTimeUsage) {
                var col = ("L").concat(parseInt(y) + 1);
                value = this.el.getValue(`L${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = /^\d{1,12}(\.\d{1,4})?$/;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.usageTemplate.usageFrequencyTest'));
                    } else {
                        if (isNaN(Number.parseInt(value)) || value <= 0) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.program.validvaluetext'));
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }
            }
        }
        if (x == 12) {
            let onTimeUsage = this.el.getValueFromCoords(10, y);
            if (!onTimeUsage) {
                if (this.el.getValueFromCoords(6, y) == 1) {
                    this.el.setValueFromCoords(14, y, '', true);
                }
                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("M").concat(parseInt(y) + 1);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    if (!(budgetRegx.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.spacetext'));
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
            }
        }
        if (x == 6 && this.el.getValueFromCoords(6, y) == 1 && !this.el.getValueFromCoords(10, y)) {
            var col = ("N").concat(parseInt(y) + 1);
            value = this.el.getValue(`N${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = INTEGER_NO_REGEX;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.common.onlyIntegers'));
                } else {
                    if (isNaN(Number.parseInt(value)) || value <= 0) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.program.validvaluetext'));
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
            }
        }
        if (x == 13) {
            let onTimeUsage = this.el.getValueFromCoords(10, y);
            let typeId = this.el.getValueFromCoords(6, y);
            if (!onTimeUsage && typeId == 1) {
                var col = ("N").concat(parseInt(y) + 1);
                value = this.el.getValue(`N${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = INTEGER_NO_REGEX;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.common.onlyIntegers'));
                    } else {
                        if (isNaN(Number.parseInt(value)) || value <= 0) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.program.validvaluetext'));
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }
            }
        }
        if (x == 14) {
            let onTimeUsage = this.el.getValueFromCoords(10, y);
            let typeId = this.el.getValueFromCoords(6, y);
            if (!onTimeUsage && typeId == 1) {
                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("O").concat(parseInt(y) + 1);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    if (!(budgetRegx.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.spacetext'));
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
            }
        }
        this.setState({
            isChanged1: true,
        });
        this.el.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');
        if (x == 6) {
            if (value == 2) {
                var cell1 = this.el.getCell(("H").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("K").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
            } else {
                var cell1 = this.el.getCell(("H").concat(parseInt(y) + 1))
                cell1.classList.remove('readonly');
                var cell1 = this.el.getCell(("K").concat(parseInt(y) + 1))
                cell1.classList.remove('readonly');
            }
        }
        if (x == 10) {
            if (value == true) {
                var cell1 = this.el.getCell(("L").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("M").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
            } else {
                var cell1 = this.el.getCell(("L").concat(parseInt(y) + 1))
                cell1.classList.remove('readonly');
                var cell1 = this.el.getCell(("M").concat(parseInt(y) + 1))
                cell1.classList.remove('readonly');
            }
        }
        if (x == 6 || x == 10) {
            if (this.el.getValueFromCoords(6, y) == 1 && this.el.getValueFromCoords(10, y) == false) {
                var cell1 = this.el.getCell(("N").concat(parseInt(y) + 1))
                cell1.classList.remove('readonly');
                var cell1 = this.el.getCell(("O").concat(parseInt(y) + 1))
                cell1.classList.remove('readonly');
            } else {
                var cell1 = this.el.getCell(("N").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("O").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
            }
        }
        if (x == 19) {
            if ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN') && value == -1 && value != 0)) {
                var cell1 = this.el.getCell(("B").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("C").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("D").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("E").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("F").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("G").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("H").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("J").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("K").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("L").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("M").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("N").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("O").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(("U").concat(parseInt(y) + 1))
                cell1.classList.add('readonly');
            }
        }
        if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL') && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN')) {
            var cell1 = this.el.getCell(("B").concat(parseInt(y) + 1))
            cell1.classList.add('readonly');
            var cell1 = this.el.getCell(("C").concat(parseInt(y) + 1))
            cell1.classList.add('readonly');
            var cell1 = this.el.getCell(("D").concat(parseInt(y) + 1))
            cell1.classList.add('readonly');
            var cell1 = this.el.getCell(("E").concat(parseInt(y) + 1))
            cell1.classList.add('readonly');
            var cell1 = this.el.getCell(("F").concat(parseInt(y) + 1))
            cell1.classList.add('readonly');
            var cell1 = this.el.getCell(("G").concat(parseInt(y) + 1))
            cell1.classList.add('readonly');
            var cell1 = this.el.getCell(("H").concat(parseInt(y) + 1))
            cell1.classList.add('readonly');
            var cell1 = this.el.getCell(("J").concat(parseInt(y) + 1))
            cell1.classList.add('readonly');
            var cell1 = this.el.getCell(("K").concat(parseInt(y) + 1))
            cell1.classList.add('readonly');
            var cell1 = this.el.getCell(("L").concat(parseInt(y) + 1))
            cell1.classList.add('readonly');
            var cell1 = this.el.getCell(("M").concat(parseInt(y) + 1))
            cell1.classList.add('readonly');
            var cell1 = this.el.getCell(("N").concat(parseInt(y) + 1))
            cell1.classList.add('readonly');
            var cell1 = this.el.getCell(("O").concat(parseInt(y) + 1))
            cell1.classList.add('readonly');
            var cell1 = this.el.getCell(("U").concat(parseInt(y) + 1))
            cell1.classList.add('readonly');
        }
    }.bind(this);
    /**
     * This function is called before saving the usage template to check validations for all the rows that are available in the table
     * @returns This functions return true or false. It returns true if all the data is sucessfully validated. It returns false if some validation fails.
     */
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        valid = checkValidation(this.el);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(17, y);
            if (parseInt(value) == 1) {
                if (this.el.getValueFromCoords(6, y) == 1) {
                    var col = ("H").concat(parseInt(y) + 1);
                    var value = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                    var reg = INTEGER_NO_REGEX;
                    if (value == "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                        this.setState({
                            message: i18n.t('static.supplyPlan.validationFailed'),
                            color: 'red'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    } else {
                        if (!(reg.test(value))) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.common.onlyIntegers'));
                            valid = false;
                            this.setState({
                                message: i18n.t('static.supplyPlan.validationFailed'),
                                color: 'red'
                            },
                                () => {
                                    this.hideSecondComponent();
                                })
                        } else {
                            if (isNaN(Number.parseInt(value)) || value <= 0) {
                                this.el.setStyle(col, "background-color", "transparent");
                                this.el.setStyle(col, "background-color", "yellow");
                                this.el.setComments(col, i18n.t('static.program.validvaluetext'));
                                valid = false;
                                this.setState({
                                    message: i18n.t('static.supplyPlan.validationFailed'),
                                    color: 'red'
                                },
                                    () => {
                                        this.hideSecondComponent();
                                    })
                            } else if (value.toString().length > 10) {
                                this.el.setStyle(col, "background-color", "transparent");
                                this.el.setStyle(col, "background-color", "yellow");
                                this.el.setComments(col, i18n.t('static.planningUnitSetting.10digitWholeNumber'));
                                valid = false;
                                this.setState({
                                    message: i18n.t('static.supplyPlan.validationFailed'),
                                    color: 'red'
                                },
                                    () => {
                                        this.hideSecondComponent();
                                    })
                            } else {
                                this.el.setStyle(col, "background-color", "transparent");
                                this.el.setComments(col, "");
                            }
                        }
                    }
                }
                var col = ("J").concat(parseInt(y) + 1);
                var value = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = INTEGER_NO_REGEX;
                if (value == 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.program.validvaluetext'));   
                }
                if (!this.el.getValueFromCoords(10, y)) {
                    var col = ("L").concat(parseInt(y) + 1);
                    var value = this.el.getValue(`L${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                    var reg = /^\d{1,12}(\.\d{1,4})?$/;
                    if (value == "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                        this.setState({
                            message: i18n.t('static.supplyPlan.validationFailed'),
                            color: 'red'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    } else {
                        if (!(reg.test(value))) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.common.onlyIntegers'));
                            valid = false;
                            this.setState({
                                message: i18n.t('static.supplyPlan.validationFailed'),
                                color: 'red'
                            },
                                () => {
                                    this.hideSecondComponent();
                                })
                        } else {
                            if (isNaN(Number.parseInt(value)) || value <= 0) {
                                this.el.setStyle(col, "background-color", "transparent");
                                this.el.setStyle(col, "background-color", "yellow");
                                this.el.setComments(col, i18n.t('static.program.validvaluetext'));
                                valid = false;
                                this.setState({
                                    message: i18n.t('static.supplyPlan.validationFailed'),
                                    color: 'red'
                                },
                                    () => {
                                        this.hideSecondComponent();
                                    })
                            } else {
                                this.el.setStyle(col, "background-color", "transparent");
                                this.el.setComments(col, "");
                            }
                        }
                    }
                    var col = ("M").concat(parseInt(y) + 1);
                    var value = this.el.getValueFromCoords(12, y);
                    if (value == "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                        this.setState({
                            message: i18n.t('static.supplyPlan.validationFailed'),
                            color: 'red'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
                if (!this.el.getValueFromCoords(10, y) && this.el.getValueFromCoords(6, y) == 1) {
                    var col = ("N").concat(parseInt(y) + 1);
                    var value = this.el.getValue(`N${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                    var reg = INTEGER_NO_REGEX;
                    if (value == "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                        this.setState({
                            message: i18n.t('static.supplyPlan.validationFailed'),
                            color: 'red'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    } else {
                        if (!(reg.test(value))) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.common.onlyIntegers'));
                            valid = false;
                            this.setState({
                                message: i18n.t('static.supplyPlan.validationFailed'),
                                color: 'red'
                            },
                                () => {
                                    this.hideSecondComponent();
                                })
                        } else {
                            if (isNaN(Number.parseInt(value)) || value <= 0) {
                                this.el.setStyle(col, "background-color", "transparent");
                                this.el.setStyle(col, "background-color", "yellow");
                                this.el.setComments(col, i18n.t('static.program.validvaluetext'));
                                valid = false;
                                this.setState({
                                    message: i18n.t('static.supplyPlan.validationFailed'),
                                    color: 'red'
                                },
                                    () => {
                                        this.hideSecondComponent();
                                    })
                            } else {
                                this.el.setStyle(col, "background-color", "transparent");
                                this.el.setComments(col, "");
                            }
                        }
                    }
                    var col = ("O").concat(parseInt(y) + 1);
                    var value = this.el.getValueFromCoords(14, y);
                    if (value == "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                        this.setState({
                            message: i18n.t('static.supplyPlan.validationFailed'),
                            color: 'red'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
            }
        }
        return valid;
    }
    /**
     * This is used to display the content
     * @returns This returns usage template table along with filters
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { usagePeriodListLong } = this.state;
        let usageList = usagePeriodListLong.length > 0
            && usagePeriodListLong.map((item, i) => {
                return (
                    <option key={i} value={item.usagePeriodId}>{getLabelText(item.label, this.state.lang)}</option>
                )
            }, this);
        const { usagePeriodDisplayList } = this.state;
        let usageDisplayList = usagePeriodDisplayList.length > 0
            && usagePeriodDisplayList.map((item, i) => {
                return (
                    <option key={i} value={item.usagePeriodId}>{getLabelText(item.label, this.state.lang)}</option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <Prompt
                    when={this.state.isChanged1 == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                                <h5 style={{ color: this.state.color }} id="div2">{this.state.message}</h5>
                <Card>
                    <CardBody className="p-0">
                        <Col xs="12" sm="12">
                                                                                    <h5>{i18n.t('static.usageTemplate.usageTemplateText')}</h5>
                            <span className=""><h5><i class="fa fa-calculator" aria-hidden="true"></i>  {i18n.t('static.usageTemplate.calculatorReminderText')}</h5></span>
                            <div className="UsageTemplateTable leftAlignTable1 UsageTemplateTableFilter">
                                <div id="paputableDiv" className="consumptionDataEntryTable usageTemplateDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                                </div>
                            </div>
                            <div style={{ display: this.state.loading ? "block" : "none" }}>
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                        <div class="spinner-border blue ml-4" role="status">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </CardBody>
                    <CardFooter>
                        {(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN')) &&
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.isChanged1 &&
                                    <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                }
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> {i18n.t('static.common.addRow')}</Button>
                                &nbsp;
                            </FormGroup>
                        }
                    </CardFooter>
                    <Modal isOpen={this.state.isModalOpen}
                        className={'modal-xl ' + this.props.className}>
                        <ModalHeader>
                            <strong>{i18n.t('static.usageTemplate.calculateUsageFrequency')}</strong>
                        </ModalHeader>
                        <ModalBody>
                            <h6 className="red" id="div3"></h6>
                                                                                                                <Col sm={12} style={{ flexBasis: 'auto' }}>
                                <Card>
                                    <Formik
                                        enableReinitialize={true}
                                        initialValues={{
                                            number1: this.state.number1,
                                            picker1: this.state.picker1,
                                            number2: this.state.number2,
                                            picker2: this.state.picker2,
                                        }}
                                        validationSchema={validationSchema}
                                        onSubmit={(values, { setSubmitting, setErrors }) => {
                                            this.el.setValueFromCoords(11, this.state.y, this.state.number2, true);
                                            this.el.setValueFromCoords(12, this.state.y, this.state.picker2, true);
                                            this.setState({
                                                isModalOpen: !this.state.isModalOpen,
                                            })
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
                                                <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='modalForm' autocomplete="off">
                                                    <CardBody>
                                                        <div className="d-md-flex">
                                                            <fieldset className="border pl-lg-2 pr-lg-2 pt-lg-0 pb-lg-2" style={{ display: 'flex' }}>
                                                                <legend class="w-auto" style={{ fontSize: '14px' }}>Interval</legend>
                                                                <FormGroup className="pr-lg-2 mt-md-1 pt-lg-2 mb-md-0">
                                                                    <Label for="number1">{i18n.t('static.usageTemplate.every')}</Label>
                                                                </FormGroup>
                                                                <FormGroup className="mt-md-2 mb-md-0 pl-lg-2">
                                                                                                                                                                                                            <div className="controls UsagePopUpInputField">
                                                                        <Input type="number"
                                                                            bsSize="sm"
                                                                            name="number1"
                                                                            id="number1"
                                                                            valid={!errors.number1 && this.state.number1 != ''}
                                                                            invalid={touched.number1 && !!errors.number1}
                                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                            onBlur={handleBlur}
                                                                            required
                                                                            value={this.state.number1}
                                                                            min="1"
                                                                        />
                                                                    </div>
                                                                    <FormFeedback className="red">{errors.number1}</FormFeedback>
                                                                </FormGroup>
                                                                <FormGroup className="tab-ml-1 mt-md-2 pl-lg-2 mb-md-0 ">
                                                                                                                                                                                                            <div className="controls SelectGo">
                                                                        <Input
                                                                            type="select"
                                                                            name="picker1"
                                                                            id="picker1"
                                                                            bsSize="sm"
                                                                            valid={!errors.picker1 && this.state.picker1 != ''}
                                                                            invalid={touched.picker1 && !!errors.picker1}
                                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                            onBlur={handleBlur}
                                                                            required
                                                                            value={this.state.picker1}
                                                                        >
                                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                                            {usageList}
                                                                        </Input>
                                                                    </div>
                                                                    <FormFeedback className="red">{errors.picker1}</FormFeedback>
                                                                </FormGroup>
                                                                                                                            </fieldset>
                                                            <FormGroup className="tab-ml-1 mb-md-0 pr-lg-3 " style={{ marginTop: '56px' }}>
                                                                <span>=</span>
                                                            </FormGroup>
                                                            <fieldset className="border pl-lg-2 pr-lg-2 pt-lg-0 pb-lg-2" style={{ display: 'flex' }}>
                                                                <legend class="w-auto" style={{ fontSize: '14px' }}>Frequency</legend>
                                                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                                                                                                                                                                                            <div className="controls SelectGo">
                                                                        <Input type="number"
                                                                            bsSize="sm"
                                                                            name="number2"
                                                                            id="number2"
                                                                            valid={!errors.number2 && this.state.number2 != ''}
                                                                            invalid={touched.number2 && !!errors.number2}
                                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                            onBlur={handleBlur}
                                                                            readOnly
                                                                            required
                                                                            value={this.state.number2}
                                                                            min="1"
                                                                        />
                                                                    </div>
                                                                    <FormFeedback className="red">{errors.number2}</FormFeedback>
                                                                </FormGroup>
                                                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                                                                                                                                                                                            <div className="controls SelectGo">
                                                                        <Input type="text"
                                                                            name="label"
                                                                            id="label"
                                                                            bsSize="sm"
                                                                            valid={!errors.textMessage && this.state.textMessage != ''}
                                                                            invalid={touched.textMessage && !!errors.textMessage}
                                                                            onBlur={handleBlur}
                                                                            readOnly
                                                                            value={this.state.textMessage}
                                                                            required />
                                                                    </div>
                                                                    <FormFeedback className="red">{errors.textMessage}</FormFeedback>
                                                                </FormGroup>
                                                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                                                                                                                                                                                            <div className="controls SelectGo">
                                                                        <Input
                                                                            type="select"
                                                                            name="picker2"
                                                                            id="picker2"
                                                                            bsSize="sm"
                                                                            valid={!errors.picker2 && this.state.picker2 != ''}
                                                                            invalid={touched.picker2 && !!errors.picker2}
                                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                            onBlur={handleBlur}
                                                                            required
                                                                            value={this.state.picker2}
                                                                        >
                                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                                            {usageDisplayList}
                                                                        </Input>
                                                                    </div>
                                                                    <FormFeedback className="red">{errors.picker2}</FormFeedback>
                                                                </FormGroup>
                                                            </fieldset>
                                                        </div>
                                                    </CardBody>
                                                    <CardFooter>
                                                        {(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_ALL') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_TEMPLATE_OWN')) &&
                                                            <FormGroup>
                                                                <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.modelOpenClose}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                                <Button type="submit" color="success" className="mr-1 float-right" size="md"><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                                &nbsp;
                                                            </FormGroup>
                                                        }
                                                    </CardFooter>
                                                </Form>
                                            )} />
                                </Card>
                            </Col>
                                                                                                                <br />
                        </ModalBody>
                                            </Modal>
                </Card>
            </div>
        )
    }
    /**
     * This function is used to toggle the usage frequency modal
     */
    modelOpenClose() {
        this.setState({
            isModalOpen: !this.state.isModalOpen,
        },
            () => {
            })
    }
    /**
     * This function is called when cancel button is clicked and is redirected to application dashboard screen
     */
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled'))
    }
    /**
     * This function is called when user changes something in calculate usage frequency popup
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        if (event.target.name == "number1") {
            let tempList = this.state.usagePeriodListLong;
            let number2 = ''
            if (this.state.picker1 != '' && this.state.picker2 != '') {
                let picker1ConvertTOMonth = tempList.filter(c => c.usagePeriodId == this.state.picker1)[0].convertToMonth;
                let picker2ConvertTOMonth = tempList.filter(c => c.usagePeriodId == this.state.picker2)[0].convertToMonth;
                let number1 = event.target.value;
                number2 = (parseFloat(picker1ConvertTOMonth) / parseFloat(picker2ConvertTOMonth) / parseFloat(number1)).toFixed(2)
                number2 = (number2.toString().includes('.00') ? parseInt(number2) : number2);
            }
            this.setState({
                number1: event.target.value,
                number2: number2
            }, () => { });
        } else if (event.target.name == "picker1") {
            let tempList = this.state.usagePeriodListLong;
            let selectedPickerConvertTOMonth = tempList.filter(c => c.usagePeriodId == event.target.value)[0].convertToMonth;
            let tempUsagePeriodList = [];
            let number2 = ''
            if (this.state.picker2 != '' && this.state.number1 != '') {
                let picker1ConvertTOMonth = tempList.filter(c => c.usagePeriodId == event.target.value)[0].convertToMonth;
                let picker2ConvertTOMonth = tempList.filter(c => c.usagePeriodId == this.state.picker2)[0].convertToMonth;
                let number1 = this.state.number1;
                number2 = (parseFloat(picker1ConvertTOMonth) / parseFloat(picker2ConvertTOMonth) / parseFloat(number1)).toFixed(2)
                number2 = (number2.toString().includes('.00') ? parseInt(number2) : number2);
            }
            for (var i = 0; i < tempList.length; i++) {
                if (parseFloat(tempList[i].convertToMonth) <= parseFloat(selectedPickerConvertTOMonth)) {
                    tempUsagePeriodList.push(tempList[i]);
                }
            }
            this.setState({
                picker1: event.target.value,
                usagePeriodDisplayList: tempUsagePeriodList,
                number2: number2,
                picker2: ''
            }, () => { });
        } else if (event.target.name == "picker2") {
            let tempList = this.state.usagePeriodListLong;
            let number2 = ''
            if (this.state.picker1 != '' && this.state.number1 != '') {
                let picker1ConvertTOMonth = tempList.filter(c => c.usagePeriodId == this.state.picker1)[0].convertToMonth;
                let picker2ConvertTOMonth = tempList.filter(c => c.usagePeriodId == event.target.value)[0].convertToMonth;
                let number1 = this.state.number1;
                number2 = (parseFloat(picker1ConvertTOMonth) / parseFloat(picker2ConvertTOMonth) / parseFloat(number1)).toFixed(2)
                number2 = (number2.toString().includes('.00') ? parseInt(number2) : number2);
            }
            this.setState({
                picker2: event.target.value,
                number2: number2
            }, () => { });
        }
    };
}
export default usageTemplate