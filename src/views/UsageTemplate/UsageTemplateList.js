import React, { Component } from "react";
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form,
    Modal, ModalBody, ModalFooter, ModalHeader,


} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';

import i18n from '../../i18n'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import RegionService from "../../api/RegionService";
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature';
import moment from 'moment';
import UsageTemplateService from "../../api/UsageTemplateService";
import TracerCategoryService from '../../api/TracerCategoryService';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import UsagePeriodService from '../../api/UsagePeriodService';
import UnitService from '../../api/UnitService.js';
import ProgramService from '../../api/ProgramService';
import CryptoJS from 'crypto-js';
import { SECRET_KEY, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM, INTEGER_NO_REGEX } from "../../Constants";

let initialValues = {
    number1: "",
    number2: "",
    picker1: [],
    picker2: [],
    textMessage: ''
}

const entityname = i18n.t('static.modelingType.modelingType')

const validationSchema = function (values) {
    return Yup.object().shape({
        picker1: Yup.string()
            .required(i18n.t('static.label.fieldRequired')),
        picker2: Yup.string()
            .required(i18n.t('static.label.fieldRequired')),
        // label: Yup.string()
        //     .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
        //     .required(i18n.t('static.datasource.datasourcetext')),
        number1: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .matches(/^(?=.*[1-9])\d{1,10}$/, i18n.t('static.program.validvaluetext'))
            .required(i18n.t('static.label.fieldRequired'))
        // .min(1, i18n.t('static.program.validvaluetext'))
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
            roleArray: []
        }
        // this.setTextAndValue = this.setTextAndValue.bind(this);
        // this.disableRow = this.disableRow.bind(this);
        // this.submitForm = this.submitForm.bind(this);
        // this.enableRow = this.enableRow.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        // this.Capitalize = this.Capitalize.bind(this);
        // this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this)
        // this.CapitalizeFull = this.CapitalizeFull.bind(this);
        // this.updateRow = this.updateRow.bind(this);
        this.changed = this.changed.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);


        //jumper
        this.getDataSet = this.getDataSet.bind(this);
        this.getTracerCategory = this.getTracerCategory.bind(this);
        this.getForecastingUnit = this.getForecastingUnit.bind(this);
        this.getUnit = this.getUnit.bind(this);
        this.getUsagePeriod = this.getUsagePeriod.bind(this);
        this.getUsageTemplateData = this.getUsageTemplateData.bind(this);
        this.getForcastingUnitById = this.getForcastingUnitById.bind(this);
        this.modelOpenClose = this.modelOpenClose.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    touchAll(setTouched, errors) {
        setTouched({
            'picker1': true,
            'picker2': true,
            'number1': true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('modalForm', (fieldName) => {
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


    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    getForcastingUnitById(forecastingUnitId) {
        console.log("forecastingUnitObj-----1 ", forecastingUnitId);
        ForecastingUnitService.getForcastingUnitById(forecastingUnitId).then(response => {
            if (response.status == 200) {
                this.setState({
                    forecastingUnitObj: response.data, loading: false
                },
                    () => {
                        console.log("forecastingUnitObj-----", this.state.forecastingUnitObj);
                    })
            }
            else {
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
    }



    getDataSet() {
        ProgramService.getDataSetList()
            .then(response => {
                console.log("PROGRAM---------->", response.data)
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.programCode.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.programCode.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });

                    let tempProgramList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: listArray[i].programCode,
                                id: listArray[i].programId,
                                active: listArray[i].active,
                            }
                            tempProgramList[i] = paJson
                        }
                    }

                    let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                    let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                    // console.log("decryptedUser=====>", decryptedUser);

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
                        // loading: false
                    }, () => {
                        // console.log("PROGRAM---------->111", this.state.typeList) 
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

    getTracerCategory() {
        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });

                    let tempList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: getLabelText(listArray[i].label, this.state.lang),
                                id: parseInt(listArray[i].tracerCategoryId),
                                active: listArray[i].active,
                            }
                            tempList[i] = paJson
                        }
                    }

                    this.setState({
                        tracerCategoryList: tempList,
                        // tracerCategoryList1: response.data
                        // loading: false
                    },
                        () => {
                            console.log("TracerCategory------->", this.state.tracerCategoryList)
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

    getForecastingUnit() {
        ForecastingUnitService.getForecastingUnitListAll().then(response => {
            console.log("response------->" + response.data);
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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
                    // loading: false
                },
                    () => {
                        // this.getDataSet();
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


    getUnit() {
        UnitService.getUnitListAll().then(response => {
            console.log("response------->" + response.data);
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });

                // listArray = listArray.filter(c => c.active == true);

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
                    // loading: false
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

    getUsagePeriod() {
        UsagePeriodService.getUsagePeriod().then(response => {
            console.log("response------->" + JSON.stringify(response.data));
            if (response.status == 200) {
                var listArray = response.data;
                // listArray.sort((a, b) => {
                //     var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                //     var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                //     return itemLabelA > itemLabelB ? 1 : -1;
                // });

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

                // console.log("response------->1" + JSON.stringify(tempList.sort((a, b) => parseFloat(a.convertToMonth) - parseFloat(b.convertToMonth))));//ascending
                // console.log("response------->2" + JSON.stringify(tempList.sort((a, b) => parseFloat(b.convertToMonth) - parseFloat(a.convertToMonth))));//decending

                tempList.unshift({
                    name: 'indefinitely',
                    id: -1,
                    active: true,
                });

                this.setState({
                    usagePeriodList: tempList,
                    usagePeriodListLong: response.data.sort((a, b) => parseFloat(b.convertToMonth) - parseFloat(a.convertToMonth))
                    // loading: false
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

    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];

        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {

                data = [];
                data[0] = papuList[j].usageTemplateId
                data[1] = (papuList[j].program == null ? -1 : papuList[j].program.id) //Type
                data[2] = getLabelText(papuList[j].label, this.state.lang);//usage name
                data[3] = papuList[j].tracerCategory.id
                data[4] = papuList[j].forecastingUnit.id
                data[5] = papuList[j].lagInMonths
                data[6] = papuList[j].usageType.id

                data[7] = "Every"
                data[8] = papuList[j].noOfPatients
                data[9] = "patient"

                data[10] = "requires"
                data[11] = papuList[j].noOfForecastingUnits
                data[12] = papuList[j].unit.id

                data[13] = `=ROUND(L${parseInt(j) + 1}/I${parseInt(j) + 1},2)`//hidden

                data[14] = papuList[j].oneTimeUsage

                data[15] = (papuList[j].usageFrequencyCount == null ? '' : papuList[j].usageFrequencyCount);
                data[16] = (papuList[j].oneTimeUsage == false ? "time(s) per" : "")
                data[17] = (papuList[j].usageFrequencyUsagePeriod != null ? papuList[j].usageFrequencyUsagePeriod.usagePeriodId : '')

                let VLookUp = (papuList[j].usageFrequencyUsagePeriod != null ? papuList[j].usageFrequencyUsagePeriod.convertToMonth : '');
                // data[18] = (papuList[j].oneTimeUsage == false ? `=ROUND(P${parseInt(j) + 1}*N${parseInt(j) + 1}* ${(papuList[j].usageFrequencyUsagePeriod != null ? papuList[j].usageFrequencyUsagePeriod.convertToMonth : 1)},2)` : "")//hidden
                // data[18] = (papuList[j].oneTimeUsage == false ? `=ROUND(P${parseInt(j) + 1}*N${parseInt(j) + 1}* ${papuList[j].usageFrequencyUsagePeriod},2)` != null ? (papuList[j].usageFrequencyUsagePeriod.convertToMonth).toFixed(2) : 1 : "")//hidden
                data[18] = (papuList[j].oneTimeUsage == false ? `=ROUND(P${parseInt(j) + 1}*N${parseInt(j) + 1}* ${VLookUp},2)` != null ? `=ROUND(P${parseInt(j) + 1}*N${parseInt(j) + 1}* ${VLookUp},2)` : '' : "")//hidden

                data[19] = (papuList[j].usageType.id == 1 && papuList[j].oneTimeUsage == false ? 'for' : '')
                data[20] = (papuList[j].repeatCount == null ? '' : papuList[j].repeatCount);
                // data[21] = (papuList[j].repeatUsagePeriod != null ? (papuList[j].usageType.id == 2 ? -1 : papuList[j].repeatUsagePeriod.usagePeriodId) : '')
                data[21] = (papuList[j].usageType.id == 2 ? -1 : (papuList[j].repeatUsagePeriod != null ? papuList[j].repeatUsagePeriod.usagePeriodId : ''))


                let usagePeriodConversion = (papuList[j].repeatUsagePeriod != null ? papuList[j].repeatUsagePeriod.convertToMonth : 1);
                let v14 = (papuList[j].repeatCount == null ? '' : papuList[j].repeatCount);
                let t14 = (papuList[j].oneTimeUsage == false ? `=ROUND(P${parseInt(j) + 1}*N${parseInt(j) + 1}* ${papuList[j].usageFrequencyUsagePeriod},2)` != null ? papuList[j].usageFrequencyUsagePeriod.convertToMonth : 1 : 1)
                // data[22] = (papuList[j].usageType.id == 1 ? (papuList[j].oneTimeUsage == false ? `=ROUND(${v14}/${usagePeriodConversion}*${t14},2)` : `=ROUND(N${parseInt(j) + 1},2)`) : '')

                data[22] = (papuList[j].usageType.id == 1 ? (papuList[j].oneTimeUsage == false ? `=ROUND(${v14}/${usagePeriodConversion}*S${parseInt(j) + 1},2)` : `=ROUND(N${parseInt(j) + 1},2)`) : '')


                //(papuList[j].oneTimeUsage == false ? '' : `=ROUND(N${parseInt(j) + 1},2)`)//hidden


                let string = "Every " + papuList[j].noOfPatients + " patient - requires " + papuList[j].noOfForecastingUnits + " " + papuList[j].unit.label.label_en;
                if (!papuList[j].oneTimeUsage) { //one time usage false
                    string += " " + (papuList[j].usageFrequencyCount == null ? '' : papuList[j].usageFrequencyCount) + " time(s) per " + (papuList[j].usageFrequencyUsagePeriod != null ? papuList[j].usageFrequencyUsagePeriod.label.label_en : '');

                    if (papuList[j].usageType.id == 2) {
                        string += " indefinitely";
                    } else {
                        string += " " + (papuList[j].usageType.id == 1 && papuList[j].oneTimeUsage == false ? 'for ' : '') + (papuList[j].repeatCount == null ? '' : ' ' + papuList[j].repeatCount) + " " + (papuList[j].repeatUsagePeriod != null ? papuList[j].repeatUsagePeriod.label.label_en : '');
                    }
                }

                data[23] = string;
                // data[23] = "Every " + papuList[j].noOfPatients + " patient - requires " + papuList[j].noOfForecastingUnits + " " + papuList[j].unit.label.label_en + (papuList[j].oneTimeUsage == false ? (papuList[j].usageFrequencyCount == null ? '' : + ' ' + papuList[j].usageFrequencyCount) + " time(s) per " + (papuList[j].usageFrequencyUsagePeriod != null ? papuList[j].usageFrequencyUsagePeriod.label.label_en : '') + (papuList[j].usageType.id == 2 && papuList[j].oneTimeUsage == false ? ' for' : '') + (papuList[j].repeatCount == null ? '' : ' ' + papuList[j].repeatCount) + (papuList[j].repeatUsagePeriod != null ? (papuList[j].usageType.id == 1 ? ' indefinitely' : ' ' + papuList[j].repeatUsagePeriod.label.label_en) : '') : "") //usage in words


                // =IF(H6="Continuous",CONCAT(I6," ",J6," ",K6," - ",L6," ",M6," ",N6," ",IF(MOD(Q6,1)=0,TEXT(Q6,"0"), TEXT(Q6,"#.##")),", ",R6, " ", S6, " indefinitely"),CONCAT(I6," ",J6," ",K6, " - requires ",M6," ",N6,", ", Q6," ",R6," ",S6," ",U6," ",V6," ",W6))
                // data[23] = `=IF(G${parseInt(j) + 1}="Continuous",CONCAT(H${parseInt(j) + 1}," ",I${parseInt(j) + 1}," ",J${parseInt(j) + 1}," - ",K${parseInt(j) + 1}," ",L${parseInt(j) + 1}," ",M${parseInt(j) + 1}," ",IF(MOD(P${parseInt(j) + 1},1)=0,TEXT(P${parseInt(j) + 1},"0"), TEXT(P${parseInt(j) + 1},"#.##")),", ",Q${parseInt(j) + 1}, " ", R${parseInt(j) + 1}, " indefinitely"),CONCAT(H${parseInt(j) + 1}," ",I${parseInt(j) + 1}," ",J${parseInt(j) + 1}, " - requires ",L${parseInt(j) + 1}," ",M${parseInt(j) + 1},", ", P${parseInt(j) + 1}," ",Q${parseInt(j) + 1}," ",R${parseInt(j) + 1}," ",T${parseInt(j) + 1}," ",U${parseInt(j) + 1}," ",V${parseInt(j) + 1}))`
                // data[23] = `=ROUND(F${parseInt(j) + 1},0)`
                data[24] = 0;
                data[25] = 0;
                data[26] = (papuList[j].program == null ? -1 : papuList[j].program.id)
                data[27] = papuList[j].notes



                papuDataArr[count] = data;
                count++;
            }
        }

        if (papuDataArr.length == 0) {
            data = [];
            data[0] = 0;
            data[1] = "";
            data[2] = "";//usage name
            data[3] = ""
            data[4] = "";
            data[5] = 0;
            data[6] = "";

            data[7] = "Every";
            data[8] = 1;
            data[9] = "patient"

            data[10] = "requires";
            data[11] = 0;
            data[12] = "";

            data[13] = "";

            data[14] = "";

            data[15] = ""
            data[16] = "";
            data[17] = "";

            data[18] = "";

            data[19] = "";
            data[20] = "";
            data[21] = ""

            data[22] = "";

            data[23] = "";
            data[24] = 1;
            data[25] = 1;
            data[26] = 0;
            data[27] = "";
            papuDataArr[0] = data;
        }

        this.el = jexcel(document.getElementById("paputableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = papuDataArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 150, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 120],
            columns: [

                {
                    title: 'usageTemplateId',
                    type: 'hidden',
                    readOnly: true //0
                },
                {
                    title: i18n.t('static.forecastProgram.forecastProgram'),
                    type: 'autocomplete',
                    source: this.state.typeList,
                    filter: this.filterDataset //1
                },
                {
                    title: i18n.t('static.usageTemplate.usageName'),
                    type: 'text',
                    textEditor: true,//2
                },
                {
                    title: i18n.t('static.tracercategory.tracercategory'),
                    type: 'autocomplete',
                    source: this.state.tracerCategoryList, //3

                },
                {
                    title: i18n.t('static.product.unit1'),
                    type: 'autocomplete',
                    source: this.state.forecastingUnitList,
                    filter: this.filterForecastingUnitBasedOnTracerCategory //4
                },
                {
                    title: i18n.t('static.usageTemplate.lagInMonth'),
                    type: 'numeric',
                    textEditor: true, //5
                },
                {
                    title: i18n.t('static.supplyPlan.type'),
                    type: 'dropdown',
                    source: [
                        { id: 1, name: i18n.t('static.usageTemplate.discrete') },
                        { id: 2, name: i18n.t('static.usageTemplate.continuous') }
                    ] //6
                },
                {
                    title: i18n.t('static.usageTemplate.people'),
                    type: 'text',
                    readOnly: true,
                    textEditor: true, //7
                },
                {
                    title: i18n.t('static.usageTemplate.people'),
                    type: 'numeric',
                    // readOnly: true
                    textEditor: true, //8
                },
                {
                    title: i18n.t('static.usageTemplate.people'),
                    type: 'text',
                    readOnly: true,
                    textEditor: true, //9
                },
                {
                    title: i18n.t('static.usageTemplate.fuPerPersonPerTime'),
                    type: 'text',
                    readOnly: true,
                    textEditor: true, //10
                },
                {
                    title: i18n.t('static.usageTemplate.fuPerPersonPerTime'),
                    type: 'numeric',
                    // readOnly: true
                    textEditor: true, //11
                },
                {
                    title: i18n.t('static.usageTemplate.fuPerPersonPerTime'),
                    type: 'autocomplete',
                    readOnly: true,
                    source: this.state.unitList, //12
                },
                {
                    title: i18n.t('static.usageTemplate.fuPerPersonPerTime'),
                    type: 'text',//hidden black
                    readOnly: true,
                    textEditor: true, //13
                },
                {
                    title: i18n.t('static.usageTemplate.onTimeUsage?'),
                    type: 'checkbox',
                    readOnly: false
                    // readOnly: true //14
                },
                {
                    title: i18n.t('static.usageTemplate.usageFrequency'),
                    type: 'numeric',
                    // readOnly: true
                    textEditor: true,
                    decimal: '.', //15
                },
                {
                    title: i18n.t('static.usageTemplate.usageFrequency'),
                    type: 'text',
                    readOnly: true,
                    textEditor: true, //16
                },
                {
                    title: i18n.t('static.usageTemplate.usageFrequency'),
                    type: 'autocomplete',
                    source: this.state.usagePeriodList, //17
                    filter: this.filterUsagePeriod1
                },
                {
                    title: i18n.t('static.usageTemplate.fuPerPersonPerMonth'),
                    type: 'text',//hidden black
                    readOnly: true,
                    textEditor: true, //18
                },
                {
                    title: ' ',//empty for
                    type: 'text',
                    readOnly: true,
                    textEditor: true, //19
                },
                {
                    title: i18n.t('static.usagePeriod.usagePeriod'),
                    type: 'numeric',
                    // readOnly: true
                    textEditor: true, //20
                },
                {
                    title: i18n.t('static.usagePeriod.usagePeriod'),
                    type: 'autocomplete',
                    source: this.state.usagePeriodList, //21
                    filter: this.filterUsagePeriod2
                },
                {
                    title: i18n.t('static.usagePeriod.fuRequired'),
                    type: 'text',//hidden black
                    readOnly: true,
                    textEditor: true, //22
                },
                {
                    title: i18n.t('static.usagePeriod.usageInWords'),
                    type: 'text',
                    readOnly: true,
                    width: 200,
                    textEditor: true, //23
                },
                {
                    title: 'isChange',
                    type: 'hidden' //24
                },
                {
                    title: 'addNewRow',
                    type: 'hidden'//25
                },
                {
                    title: 'typeId',
                    type: 'hidden'//26
                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text',
                    // width: 400
                },


            ],
            // nestedHeaders: [
            //     [
            //         {
            //             title: 'Location',
            //             colspan: '1',
            //         },
            //         {
            //             title: ' Other Information',
            //             colspan: '2'
            //         }
            //     ],
            // ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el.jexcel;
                    var rowData = elInstance.getRowData(y);


                    // var addRowId = rowData[25];
                    // // console.log("addRowId------>", addRowId);
                    // if (addRowId == 0) {//usage template grade out
                    //     var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                    //     cell1.classList.add('readonly');
                    // } else {
                    //     var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                    //     cell1.classList.remove('readonly');
                    // }

                    var typeId = rowData[6];
                    var oneTimeUsage = rowData[14];


                    if (typeId == 2) {
                        var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`O${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                        var cell1 = elInstance.getCell(`O${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    }

                    if (oneTimeUsage) {
                        var cell1 = elInstance.getCell(`P${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`R${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`P${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                        var cell1 = elInstance.getCell(`R${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    }

                    if (typeId == 1 && oneTimeUsage == false) {
                        // elInstance.setValueFromCoords(19, y, 'for', true);
                        var cell1 = elInstance.getCell(`U${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                        var cell1 = elInstance.getCell(`V${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`U${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`V${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    }


                    var typeId = rowData[26];
                    let roleArray = this.state.roleArray;
                    if ((roleArray.includes('ROLE_REALM_ADMIN') && typeId != -1 && typeId != 0) || (roleArray.includes('ROLE_DATASET_ADMIN') && typeId == -1 && typeId != 0)) {
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
                        var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`L${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`O${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`P${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`R${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`U${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`V${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`AB${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');

                    }

                    if (!roleArray.includes('ROLE_REALM_ADMIN') && !roleArray.includes('ROLE_DATASET_ADMIN')) {
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
                        var cell1 = elInstance.getCell(`I${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`L${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`O${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`P${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`R${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`U${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`V${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        var cell1 = elInstance.getCell(`AB${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    }



                }
            }.bind(this),
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            onchange: this.changed,
            // oneditionend: this.onedit,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            // onpaste: this.onPaste,
            oneditionend: this.oneditionend,
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            editable: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                //Add consumption batch info


                if (y == null) {

                } else {

                    // Delete a row
                    if (obj.options.allowDeleteRow == true) {
                        // region id
                        if (obj.getRowData(y)[0] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                }
                            });
                            // Line
                            // items.push({ type: 'line' });
                        }

                        if (!this.el.getValueFromCoords(14, y)) {
                            items.push({
                                title: i18n.t('static.usageTemplate.calculateUsageFrequency'),
                                onclick: function () {
                                    // console.log("onclick------>", this.el.getValueFromCoords(0, y));
                                    let value = this.el.getValueFromCoords(17, y);
                                    let tempUsagePeriodList = [];

                                    if (typeof value === 'number') {
                                        //it's a number

                                        let tempList = this.state.usagePeriodListLong;
                                        let selectedPickerConvertTOMonth = tempList.filter(c => c.usagePeriodId == value)[0].convertToMonth;


                                        for (var i = 0; i < tempList.length; i++) {
                                            if (parseFloat(tempList[i].convertToMonth) <= parseFloat(selectedPickerConvertTOMonth)) {
                                                tempUsagePeriodList.push(tempList[i]);
                                            }
                                        }

                                        // this.setState({
                                        //     usagePeriodDisplayList: tempUsagePeriodList,
                                        // }, () => { });

                                    }



                                    this.setState({
                                        isModalOpen: true,
                                        x: x,
                                        y: y,
                                        number1: (this.el.getValueFromCoords(15, y) != '' ? this.el.getValueFromCoords(15, y) : ''),
                                        number2: (this.el.getValueFromCoords(15, y) != '' ? this.el.getValueFromCoords(15, y) : ''),
                                        picker1: (this.el.getValueFromCoords(17, y) != '' ? this.el.getValueFromCoords(17, y) : ''),
                                        picker2: (this.el.getValueFromCoords(17, y) != '' ? this.el.getValueFromCoords(17, y) : ''),
                                        usagePeriodDisplayList: (tempUsagePeriodList.length == 0 ? [] : tempUsagePeriodList)
                                    })

                                }.bind(this)
                            });
                        }

                    }
                }

                return items;
            }.bind(this)
        };

        this.el = jexcel(document.getElementById("paputableDiv"), options);
        this.setState({
            loading: false
        })
    }

    filterDataset = function (instance, cell, c, r, source) {
        // var mylist = [];
        // var mylist = (instance.jexcel.getJson(null, false)[r])[5];
        // if (value > 0) {
        //     mylist = this.state.forecastingUnitList.filter(c => c.tracerCategoryId == value && c.active.toString() == "true");
        // }
        // console.log("myList--------->1", value);
        // console.log("myList--------->2", mylist);
        // console.log("myList--------->3", this.state.forecastingUnitList);
        var mylist = this.state.typeList;
        if (!this.state.roleArray.includes('ROLE_REALM_ADMIN')) {
            mylist.splice(0, 1);
        }
        return mylist;
        // return mylist.sort(function (a, b) {
        //     a = a.name.toLowerCase();
        //     b = b.name.toLowerCase();
        //     return a < b ? -1 : a > b ? 1 : 0;
        // });
    }.bind(this)

    filterForecastingUnitBasedOnTracerCategory = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson(null, false)[r])[3];
        if (value > 0) {
            mylist = this.state.forecastingUnitList.filter(c => c.tracerCategoryId == value && c.active.toString() == "true");
        }
        // console.log("myList--------->1", value);
        // console.log("myList--------->2", mylist);
        // console.log("myList--------->3", this.state.forecastingUnitList);
        return mylist.sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
    }.bind(this)

    filterUsagePeriod1 = function (instance, cell, c, r, source) {
        var mylist = this.state.usagePeriodList;

        if (mylist[0].id == -1) {
            mylist.splice(0, 1);
        }


        return mylist;
        // .sort(function (a, b) {
        //     a = a.name.toLowerCase();
        //     b = b.name.toLowerCase();
        //     return a < b ? -1 : a > b ? 1 : 0;
        // });
    }.bind(this)


    filterUsagePeriod2 = function (instance, cell, c, r, source) {
        var mylist = this.state.usagePeriodList;
        if (mylist[0].id == -1) {
            mylist.splice(0, 1);
        }
        var value = (instance.jexcel.getJson(null, false)[r])[17];
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

    // filterUsagePeriod2 = function (instance, cell, c, r, source) {
    //     var mylist = this.state.usagePeriodList;
    //     var value = (instance.jexcel.getJson(null, false)[r])[6];

    //     if (value != 1) {
    //         console.log("IF----------->1");
    //         mylist.splice(0, 1);
    //     } else {
    //         console.log("IF----------->2");
    //         if (mylist[0].id != -1) {
    //             console.log("IF----------->3");
    //             mylist.unshift({
    //                 name: 'indefinitely',
    //                 id: -1,
    //                 active: true,
    //             });
    //         }
    //     }

    //     return mylist.sort(function (a, b) {
    //         a = a.name.toLowerCase();
    //         b = b.name.toLowerCase();
    //         return a < b ? -1 : a > b ? 1 : 0;
    //     });
    // }.bind(this)

    getUsageTemplateData() {
        this.hideSecondComponent();
        UsageTemplateService.getUsageTemplateListAll().then(response => {
            if (response.status == 200) {
                console.log("response.data---->", response.data)
                console.log("response.data---->", response.data.filter(c => c.usageTemplateId == 26));

                // var listArray = response.data;
                // listArray.sort((a, b) => {
                //     var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                //     var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                //     return itemLabelA > itemLabelB ? 1 : -1;
                // });

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
                            message: 'static.unkownError',
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

    componentDidMount() {
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
        // console.log("decryptedUser=====>", decryptedUser);

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

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

        // if (x == 2 && !isNaN(rowData[2]) && rowData[2].toString().indexOf('.') != -1) {
        //     // console.log("RESP---------", parseFloat(rowData[2]));
        //     elInstance.setValueFromCoords(2, y, parseFloat(rowData[2]), true);
        // }
        elInstance.setValueFromCoords(24, y, 1, true);

    }
    addRow = function () {
        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";//usage name
        data[3] = ""
        data[4] = "";
        data[5] = 0;
        data[6] = "";

        data[7] = "Every";
        data[8] = 1;
        data[9] = "patient"

        data[10] = "requires";
        data[11] = 0;
        data[12] = "";

        data[13] = "";

        data[14] = "";

        data[15] = ""
        data[16] = "time(s) per";
        data[17] = "";

        data[18] = "";

        data[19] = "";
        data[20] = "";
        data[21] = ""

        data[22] = "";

        data[23] = "";
        data[24] = 1;
        data[25] = 1;
        data[26] = 0;
        data[27] = "";

        this.el.insertRow(
            data, 0, 1
        );
    };

    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.jexcel).getValue(`G${parseInt(data[i].y) + 1}`, true);
                if (index == "" || index == null || index == undefined) {
                    (instance.jexcel).setValueFromCoords(0, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(2, data[i].y, true, true);
                    (instance.jexcel).setValueFromCoords(5, data[i].y, 1, true);
                    (instance.jexcel).setValueFromCoords(6, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }

    formSubmit = function () {

        var validation = this.checkValidation();
        console.log("validation--------->", validation);
        if (validation == true) {
            this.setState({ loading: true })
            var tableJson = this.el.getJson(null, false);
            console.log("tableJson---", tableJson);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("24 map---" + map1.get("24"))
                if (parseInt(map1.get("24")) === 1) {
                    let json = {
                        usageTemplateId: parseInt(map1.get("0")),
                        label: {
                            label_en: map1.get("2"),
                        },
                        program: (parseInt(map1.get("1")) == -1 ? null : { id: parseInt(map1.get("1")) }),
                        tracerCategory: { id: parseInt(map1.get("3")) },
                        forecastingUnit: { id: parseInt(map1.get("4")) },
                        // lagInMonths: map1.get("5").toString().replace(/,/g, ""),
                        lagInMonths: this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        usageType: { id: parseInt(map1.get("6")) },
                        noOfPatients: this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        noOfForecastingUnits: this.el.getValue(`L${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        oneTimeUsage: map1.get("14"),
                        usageFrequencyUsagePeriod: { usagePeriodId: parseInt(map1.get("17")) },
                        usageFrequencyCount: this.el.getValue(`P${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        repeatUsagePeriod: { usagePeriodId: (parseInt(map1.get("21")) == -1 ? null : parseInt(map1.get("21"))) },
                        repeatCount: this.el.getValue(`U${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        active: true,
                        notes: map1.get("27")
                        // capacityCbm: map1.get("2").replace(",", ""),
                        // capacityCbm: map1.get("2").replace(/,/g, ""),
                        // capacityCbm: this.el.getValueFromCoords(2, i).replace(/,/g, ""),
                        // capacityCbm: this.el.getValue(`C${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        // gln: (map1.get("3") === '' ? null : map1.get("3")),
                        // active: map1.get("4"),
                        // realmCountry: {
                        //     realmCountryId: parseInt(map1.get("5"))
                        // },
                        // regionId: parseInt(map1.get("6"))
                    }
                    changedpapuList.push(json);
                }
            }
            console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
            UsageTemplateService.addUpdateUsageTemplateMapping(changedpapuList)
                .then(response => {
                    console.log(response.data);
                    if (response.status == "200") {
                        console.log(response);
                        // this.props.history.push(`/realmCountry/listRealmCountry/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                        this.setState({
                            message: i18n.t('static.usagePeriod.addUpdateMessage'), color: 'green'
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
                                message: 'static.unkownError',
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
                                        // message: i18n.t('static.region.duplicateGLN'),
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
            console.log("Something went wrong");
        }
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        // tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[7].classList.add('AsteriskTheadtrTd');

        tr.children[16].classList.add('CalculatorTheadtr');
        tr.children[17].classList.add('CalculatorTheadtr');
        tr.children[18].classList.add('CalculatorTheadtr');
    }
    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {
        console.log("onchange------------------>", value);
        // //Dataset
        // if (x == 1) {
        //     var budgetRegx = /^\S+(?: \S+)*$/;
        //     var col = ("B").concat(parseInt(y) + 1);
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, i18n.t('static.label.fieldRequired'));
        //     } else {
        //         if (!(budgetRegx.test(value))) {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setStyle(col, "background-color", "yellow");
        //             this.el.setComments(col, i18n.t('static.message.spacetext'));
        //         } else {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setComments(col, "");
        //         }
        //     }
        // }

        // //Tracer Category
        // if (x == 2) {
        //     console.log("LOG---------->2", value);
        //     var budgetRegx = /^\S+(?: \S+)*$/;
        //     var col = ("C").concat(parseInt(y) + 1);
        //     this.el.setValueFromCoords(3, y, '', true);
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, i18n.t('static.label.fieldRequired'));
        //     } else {
        //         if (!(budgetRegx.test(value))) {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setStyle(col, "background-color", "yellow");
        //             this.el.setComments(col, i18n.t('static.message.spacetext'));
        //         } else {
        //             this.el.setStyle(col, "background-color", "transparent");
        //             this.el.setComments(col, "");
        //         }
        //     }
        // }

        if (x == 8 || x == 11) {
            this.el.setValueFromCoords(13, y, `=ROUND(L${parseInt(y) + 1}/I${parseInt(y) + 1},2)`, true);
        }

        if (x == 14) {
            if (!value) {
                // let selectedUTID = this.el.getValueFromCoords(17, x);
                // let selectedUTID = this.el.getValue(`R${parseInt(y) + 1}`, true);

                this.el.setValueFromCoords(16, y, 'time(s) per', true);

                // let selectedUTID = this.el.getValueFromCoords(17, y);
                // let usagePeriodObj = this.state.usagePeriodList.filter(c => c.id == selectedUTID)[0];
                // if (usagePeriodObj != undefined && usagePeriodObj != null) {
                //     this.el.setValueFromCoords(18, y, `=ROUND(P${parseInt(y) + 1}*N${parseInt(y) + 1}* ${(usagePeriodObj.convertToMonth)},2)`, true);
                // }

                this.el.setValueFromCoords(22, y, '', true);


                this.el.setValueFromCoords(15, y, '', true);
                this.el.setValueFromCoords(17, y, '', true);
                this.el.setValueFromCoords(20, y, '', true);
                this.el.setValueFromCoords(21, y, '', true);
            } else {
                this.el.setValueFromCoords(16, y, '', true);
                this.el.setValueFromCoords(18, y, '', true);
                this.el.setValueFromCoords(15, y, '', true);
                this.el.setValueFromCoords(17, y, '', true);
                this.el.setValueFromCoords(20, y, '', true);
                this.el.setValueFromCoords(21, y, '', true);

                var col = ("P").concat(parseInt(y) + 1);
                this.el.setComments(col, "");
                var col = ("R").concat(parseInt(y) + 1);
                this.el.setComments(col, "");
                var col = ("U").concat(parseInt(y) + 1);
                this.el.setComments(col, "");
                var col = ("V").concat(parseInt(y) + 1);
                this.el.setComments(col, "");

                this.el.setValueFromCoords(22, y, `=ROUND(N${parseInt(y) + 1},2)`, true);
            }
        }

        if ((x == 15 || x == 17) && !this.el.getValueFromCoords(14, y)) {
            let selectedUTID = this.el.getValueFromCoords(17, y);
            let usagePeriodObj = this.state.usagePeriodList.filter(c => c.id == selectedUTID)[0];
            if (usagePeriodObj != undefined && usagePeriodObj != null) {
                this.el.setValueFromCoords(18, y, `=ROUND(P${parseInt(y) + 1}*N${parseInt(y) + 1}* ${(usagePeriodObj.convertToMonth)},2)`, true);
                // this.el.setValueFromCoords(18, y, this.el.getValueFromCoords(15, y)*this.el.getValueFromCoords(13, y)*usagePeriodObj.convertToMonth, true);
            }
        }

        if (x == 6 || x == 14) {
            let selectedTypeID = this.el.getValueFromCoords(6, y);
            let selectedTOneTimeUsageID = this.el.getValueFromCoords(14, y);
            if (selectedTypeID == 1 && !selectedTOneTimeUsageID) {
                this.el.setValueFromCoords(19, y, 'for', true);
            } else {
                this.el.setValueFromCoords(19, y, '', true);
            }
        }

        if (x == 6) {
            if (value == 2) {//continuious

                this.el.setValueFromCoords(22, y, '', true);
                this.el.setValueFromCoords(8, y, 1, true);
                var col = ("I").concat(parseInt(y) + 1);
                this.el.setComments(col, "");
                var col = ("O").concat(parseInt(y) + 1);
                this.el.setComments(col, "");

                var col = ("U").concat(parseInt(y) + 1);
                this.el.setComments(col, "");
                var col = ("V").concat(parseInt(y) + 1);
                this.el.setComments(col, "");

                this.el.setValueFromCoords(16, y, 'time(s) per', true);
                this.el.setValueFromCoords(14, y, false, true);



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
                            this.el.setValueFromCoords(21, y, -1, true);
                        })
                } else {
                    this.el.setValueFromCoords(21, y, -1, true);
                }

            } else {//discrete
                this.el.setValueFromCoords(21, y, '', true);
                this.el.setValueFromCoords(8, y, '', true);
                this.el.setValueFromCoords(16, y, '', true);
                this.el.setValueFromCoords(22, y, '', true);

                if (!this.el.getValueFromCoords(14, y)) {
                    this.el.setValueFromCoords(16, y, 'time(s) per', true);
                }

                // let v14 = (this.el.getValue(`U${parseInt(y) + 1}`, true) == null || this.el.getValue(`U${parseInt(y) + 1}`, true) == '' ? 1 : this.el.getValue(`U${parseInt(y) + 1}`, true));
                // let VLookUp = 1;
                // let t14 = (this.el.getValue(`S${parseInt(y) + 1}`, true) == null || this.el.getValue(`S${parseInt(y) + 1}`, true) == '' ? 1 : this.el.getValue(`S${parseInt(y) + 1}`, true));
                // let o14 = (this.el.getValue(`N${parseInt(y) + 1}`, true) == null || this.el.getValue(`N${parseInt(y) + 1}`, true) == '' ? 1 : this.el.getValue(`N${parseInt(y) + 1}`, true));
                // let selectedOneTimeUsageID = this.el.getValueFromCoords(14, y);

                // let selectedUTID = this.el.getValueFromCoords(21, y);
                // let usagePeriodObj = this.state.usagePeriodList.filter(c => c.id == selectedUTID)[0];
                // if (usagePeriodObj != undefined && usagePeriodObj != null) {
                //     VLookUp = usagePeriodObj.convertToMonth;
                // }

                // let string = (selectedOneTimeUsageID ? o14 : v14 / VLookUp * t14);
                // this.el.setValueFromCoords(22, y, string, true);
            }
        }

        if ((x == 18 || x == 20 || x == 21) && this.el.getValueFromCoords(6, y) == 1 && !this.el.getValueFromCoords(14, y)) {
            let v14 = (this.el.getValue(`U${parseInt(y) + 1}`, true) == null || this.el.getValue(`U${parseInt(y) + 1}`, true) == '' ? '' : this.el.getValue(`U${parseInt(y) + 1}`, true));
            let VLookUp = '';
            let t14 = (this.el.getValue(`S${parseInt(y) + 1}`, true) == null || this.el.getValue(`S${parseInt(y) + 1}`, true) == '' ? '' : this.el.getValue(`S${parseInt(y) + 1}`, true));
            let o14 = (this.el.getValue(`N${parseInt(y) + 1}`, true) == null || this.el.getValue(`N${parseInt(y) + 1}`, true) == '' ? '' : this.el.getValue(`N${parseInt(y) + 1}`, true));
            let selectedOneTimeUsageID = this.el.getValueFromCoords(14, y);

            let selectedUTID = this.el.getValueFromCoords(21, y);
            let usagePeriodObj = this.state.usagePeriodList.filter(c => c.id == selectedUTID)[0];
            if (usagePeriodObj != undefined && usagePeriodObj != null) {
                VLookUp = usagePeriodObj.convertToMonth;
            }

            let string = (selectedOneTimeUsageID ? o14 : v14 / VLookUp * t14);
            if (v14 != null && v14 != '' && VLookUp != null && VLookUp != '') {
                // this.el.setValueFromCoords(22, y, parseFloat(string).toFixed(2), true);
                this.el.setValueFromCoords(22, y, `=ROUND(${parseFloat(string)},2)`, true);
            } else {
                this.el.setValueFromCoords(22, y, '', true);
            }

        }

        if (x == 4) {
            // this.getForcastingUnitById(value);
            // this.el.setValueFromCoords(12, y, this.state.forecastingUnitObj.unit.id, true);
            // console.log("-----------XXXXXXXXXXXXXXXXXX", value);
            let obj = this.state.forecastingUnitList.filter(c => c.id == parseInt(value))[0];
            // console.log("-----------XXXXXXXXXXXXXXXXXX", obj);
            if (obj != undefined && obj != null) {
                this.el.setValueFromCoords(12, y, obj.unit.id, true);
            }

        }

        if (x == 4 || x == 8 || x == 11 || x == 15 || x == 16 || x == 17 || x == 20 || x == 21) {
            let string = 'Every ' + this.el.getValue(`I${parseInt(y) + 1}`, true) + ' Patient - requires ' + this.el.getValue(`L${parseInt(y) + 1}`, true) + " " + this.el.getValue(`M${parseInt(y) + 1}`, true);

            if (!this.el.getValueFromCoords(14, y)) {//one time usage false
                string += " " + this.el.getValue(`P${parseInt(y) + 1}`, true) + " " + this.el.getValue(`Q${parseInt(y) + 1}`, true) + " " + this.el.getValue(`R${parseInt(y) + 1}`, true);
                if (this.el.getValueFromCoords(6, y) == 2) {
                    string += " " + this.el.getValue(`V${parseInt(y) + 1}`, true);
                } else {
                    string += " " + this.el.getValue(`T${parseInt(y) + 1}`, true) + " " + this.el.getValue(`U${parseInt(y) + 1}`, true) + " " + this.el.getValue(`V${parseInt(y) + 1}`, true);
                }
            }


            this.el.setValueFromCoords(23, y, string, true);
        }


        //Active
        // if (x != 24) {
        //     this.el.setValueFromCoords(24, y, 1, true);
        // }
        if (x == 14) {
            this.el.setValueFromCoords(24, y, 1, true);
        }

        //validation onchange part start

        //Tracer Category
        if (x == 3) {
            console.log("LOG---------->2", value);
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("D").concat(parseInt(y) + 1);
            this.el.setValueFromCoords(4, y, '', true);
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

        //Forecasting Unit
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
                }
            }
        }

        //Dataset
        if (x == 1) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("B").concat(parseInt(y) + 1);
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

        //Usage Name
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

        //LagInMonth
        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = INTEGER_NO_REGEX;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.common.onlyIntegers'));
                } else {
                    if (isNaN(Number.parseInt(value)) || value < 0) {
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

        //Type
        if (x == 6) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("G").concat(parseInt(y) + 1);
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


        //#People
        if (x == 8) {
            let selectedTypeID = this.el.getValueFromCoords(6, y);
            if (selectedTypeID == 1) {
                var col = ("I").concat(parseInt(y) + 1);
                value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = DECIMAL_NO_REGEX;
                var reg = INTEGER_NO_REGEX;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
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



        //#FU
        if (x == 11) {

            var col = ("L").concat(parseInt(y) + 1);
            value = this.el.getValue(`L${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = DECIMAL_NO_REGEX;
            var reg = INTEGER_NO_REGEX;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
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


        if (x == 15) {
            let onTimeUsage = this.el.getValueFromCoords(14, y);
            if (!onTimeUsage) {//false
                var col = ("P").concat(parseInt(y) + 1);
                value = this.el.getValue(`P${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = DECIMAL_NO_REGEX;
                var reg = /^\d{1,12}(\.\d{1,4})?$/;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
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

        if (x == 17) {
            let onTimeUsage = this.el.getValueFromCoords(14, y);

            if (!onTimeUsage) {//false
                if (this.el.getValueFromCoords(6, y) == 1) {
                    this.el.setValueFromCoords(21, y, '', true);
                }


                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("R").concat(parseInt(y) + 1);
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

        if (x == 6 && this.el.getValueFromCoords(6, y) == 1 && !this.el.getValueFromCoords(14, y)) {
            var col = ("U").concat(parseInt(y) + 1);
            value = this.el.getValue(`U${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = DECIMAL_NO_REGEX;
            var reg = INTEGER_NO_REGEX;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
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

        if (x == 20) {
            let onTimeUsage = this.el.getValueFromCoords(14, y);
            let typeId = this.el.getValueFromCoords(6, y);
            if (!onTimeUsage && typeId == 1) {
                var col = ("U").concat(parseInt(y) + 1);
                value = this.el.getValue(`U${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = DECIMAL_NO_REGEX;
                var reg = INTEGER_NO_REGEX;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
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

        if (x == 21) {
            let onTimeUsage = this.el.getValueFromCoords(14, y);
            let typeId = this.el.getValueFromCoords(6, y);
            if (!onTimeUsage && typeId == 1) {
                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("V").concat(parseInt(y) + 1);
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







    }.bind(this);
    // -----end of changed function

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(24, y);
            if (parseInt(value) == 1) {
                //Dataset
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
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

                //Usage Name
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
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

                //TracerCategory
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(3, y);
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


                //ForecastingUnit
                var col = ("E").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(4, y);
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


                //Lag in month 
                var col = ("F").concat(parseInt(y) + 1);
                value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                console.log("LAG----------->", value);
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
                        if (isNaN(Number.parseInt(value)) || value < 0) {
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


                //Type
                var col = ("G").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(6, y);
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

                //# People
                if (this.el.getValueFromCoords(6, y) == 1) {
                    var col = ("I").concat(parseInt(y) + 1);
                    var value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
                }

                // #FU per person per time
                var col = ("L").concat(parseInt(y) + 1);
                var value = this.el.getValue(`L${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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


                //Usage Frequency
                if (!this.el.getValueFromCoords(14, y)) {
                    var col = ("P").concat(parseInt(y) + 1);
                    var value = this.el.getValue(`P${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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

                    //Usage Frequency
                    var col = ("R").concat(parseInt(y) + 1);
                    var value = this.el.getValueFromCoords(17, y);
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


                if (!this.el.getValueFromCoords(14, y) && this.el.getValueFromCoords(6, y) == 1) {

                    // #Usage Period
                    var col = ("U").concat(parseInt(y) + 1);
                    var value = this.el.getValue(`U${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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


                    //Usage Period
                    var col = ("V").concat(parseInt(y) + 1);
                    var value = this.el.getValueFromCoords(21, y);
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


    render() {

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
                <AuthenticationServiceComponent history={this.props.history} />
                {/* <h5 style={{ color: "red" }}>{i18n.t('static.common.customWarningMessage')}</h5> */}
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                {/* <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5> */}
                <h5 style={{ color: this.state.color }} id="div2">{this.state.message}</h5>
                <Card>
                    <CardBody className="p-0">

                        <Col xs="12" sm="12">
                            <h5>{i18n.t('static.common.customWarningMessage')}</h5>
                            <h5>{i18n.t('static.usageTemplate.usageTemplateText')}</h5>
                            <span className=""><h5><i class="fa fa-calculator" aria-hidden="true"></i>  {i18n.t('static.usageTemplate.calculatorReminderText')}</h5></span>
                            <div id="paputableDiv" className="table-responsive consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
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
                        {(this.state.roleArray.includes('ROLE_REALM_ADMIN') || this.state.roleArray.includes('ROLE_DATASET_ADMIN')) &&
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button>
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
                            {/* <div> */}
                            {/* <Row> */}
                            {/* <Card> */}
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
                                        validate={validate(validationSchema)}
                                        onSubmit={(values, { setSubmitting, setErrors }) => {

                                            this.el.setValueFromCoords(15, this.state.y, this.state.number2, true);
                                            this.el.setValueFromCoords(17, this.state.y, this.state.picker2, true);
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
                                                                    {/* <Label for="number1">{i18n.t('static.procurementagent.procurementagentapprovetoshippedtimeLabel')}<span className="red Reqasterisk">*</span></Label> */}
                                                                    {/* <Label for="number1" style={{ visibility: 'hidden' }}></Label> */}
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
                                                                    {/* <Label htmlFor="programId">{i18n.t('static.dataSource.program')}</Label> */}
                                                                    {/* <Label for="number1" style={{ visibility: 'hidden' }}></Label> */}
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
                                                                {/* <FormGroup className="tab-ml-1 mb-md-0  " style={{ marginTop: '29px' }}>
                                                                <span>---</span>
                                                            </FormGroup> */}
                                                            </fieldset>
                                                            <FormGroup className="tab-ml-1 mb-md-0 pr-lg-3 " style={{ marginTop: '56px' }}>
                                                                <span>=</span>
                                                            </FormGroup>


                                                            <fieldset className="border pl-lg-2 pr-lg-2 pt-lg-0 pb-lg-2" style={{ display: 'flex' }}>
                                                                <legend class="w-auto" style={{ fontSize: '14px' }}>Frequency</legend>
                                                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                                                    {/* <Label for="number1">{i18n.t('static.procurementagent.procurementagentapprovetoshippedtimeLabel')}<span className="red Reqasterisk">*</span></Label> */}
                                                                    {/* <Label for="number1" style={{ visibility: 'hidden' }}></Label> */}
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
                                                                    {/* <Label for="number1">{i18n.t('static.usageTemplate.frequency')}</Label> */}
                                                                    {/* <Label for="label">{i18n.t('static.datasource.datasource')}<span class="red Reqasterisk">*</span></Label> */}
                                                                    <div className="controls SelectGo">
                                                                        <Input type="text"
                                                                            name="label"
                                                                            id="label"
                                                                            bsSize="sm"
                                                                            valid={!errors.textMessage && this.state.textMessage != ''}
                                                                            invalid={touched.textMessage && !!errors.textMessage}
                                                                            // onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                                            onBlur={handleBlur}
                                                                            readOnly
                                                                            value={this.state.textMessage}
                                                                            required />
                                                                    </div>
                                                                    <FormFeedback className="red">{errors.textMessage}</FormFeedback>
                                                                </FormGroup>
                                                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                                                    {/* <Label htmlFor="programId">{i18n.t('static.dataSource.program')}</Label> */}
                                                                    {/* <Label for="number1" style={{ visibility: 'hidden' }}><span className="red Reqasterisk">*</span></Label> */}
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
                                                        {(this.state.roleArray.includes('ROLE_REALM_ADMIN') || this.state.roleArray.includes('ROLE_DATASET_ADMIN')) &&
                                                            <FormGroup>
                                                                <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.modelOpenClose}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                                <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                                &nbsp;

                                                            </FormGroup>
                                                        }
                                                    </CardFooter>
                                                </Form>

                                            )} />

                                </Card>
                            </Col>
                            {/* </Card> */}
                            {/* </Row> */}
                            {/* </div> */}
                            <br />
                        </ModalBody>

                        {/* <ModalFooter>

                        </ModalFooter> */}
                    </Modal>
                </Card>

            </div>
        )
    }

    modelOpenClose() {
        this.setState({
            isModalOpen: !this.state.isModalOpen,
            // loading: true
        },
            () => {
                // this.el.setValueFromCoords(15, this.state.y, 222, true);
                // this.el.setValueFromCoords(17, this.state.y, 1, true);
            })
    }
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled'))
    }

    dataChange(event) {
        if (event.target.name == "number1") {
            let tempList = this.state.usagePeriodListLong;
            let number2 = ''

            if (this.state.picker1 != '' && this.state.picker2 != '') {
                let picker1ConvertTOMonth = tempList.filter(c => c.usagePeriodId == this.state.picker1)[0].convertToMonth;
                let picker2ConvertTOMonth = tempList.filter(c => c.usagePeriodId == this.state.picker2)[0].convertToMonth;
                let number1 = event.target.value;
                number2 = (parseFloat(picker1ConvertTOMonth) / parseFloat(picker2ConvertTOMonth) / parseFloat(number1)).toFixed(2)
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
            }

            this.setState({
                picker2: event.target.value,
                number2: number2

            }, () => { });
        }
    };

}

export default usageTemplate

