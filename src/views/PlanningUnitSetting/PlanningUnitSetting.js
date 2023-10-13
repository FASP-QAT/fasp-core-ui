import CryptoJS from 'crypto-js';
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import moment from "moment";
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import Picker from 'react-month-picker';
import { Prompt } from 'react-router';
import { checkValidation, changed, jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Col,
    FormGroup, Input, InputGroup,
    Label,
    Popover, PopoverBody
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import {
    API_URL,
    INDEXED_DB_NAME, INDEXED_DB_VERSION,
    JEXCEL_DECIMAL_CATELOG_PRICE,
    JEXCEL_INTEGER_REGEX,
    JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY,
    REPORT_DATEPICKER_END_MONTH,
    REPORT_DATEPICKER_START_MONTH,
    SECRET_KEY
} from '../../Constants.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import TracerCategoryService from '../../api/TracerCategoryService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
const months = [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')]
const sortArray = (sourceArray) => {
    const sortByName = (a, b) => a.label.label_en.localeCompare(b.label.label_en, 'en', { numeric: true });
    return sourceArray.sort(sortByName);
};
const sortArrayByName = (sourceArray) => {
    const sortByName1 = (a, b) => a.name.localeCompare(b.name, 'en', { numeric: true });
    return sourceArray.sort(sortByName1);
};
export default class PlanningUnitSetting extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            popoverOpenProgramSetting: false,
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            selsource: [],
            loading: true,
            datasetId: '',
            datasetList: [],
            datasetList1: [],
            startDateDisplay: '',
            endDateDisplay: '',
            beforeEndDateDisplay: '',
            allowAdd: false,
            allTracerCategoryList: [],
            allPlanningUnitList: [],
            originalPlanningUnitList: [],
            allProcurementAgentList: [],
            selectedForecastProgram: '',
            filterProcurementAgent: '',
            responsePa: [],
            forecastProgramId: '',
            forecastProgramVersionId: '',
            isChanged1: false,
            productCategoryList: [],
            productCategoryListNew: [],
            planningUnitList: [],
            lang: localStorage.getItem('lang'),
            isPlanningUnitLoaded: false,
            tempSortOrder: '',
            sortOrderLoading: true,
            tempPlanningUnitList: [],
            dropdownList: []
        }
        this.toggleProgramSetting = this.toggleProgramSetting.bind(this);
        this.changed = this.changed.bind(this);
        this.getDatasetList = this.getDatasetList.bind(this);
        this.filterData = this.filterData.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.tracerCategoryList = this.tracerCategoryList.bind(this);
        this.planningUnitList = this.planningUnitList.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.procurementAgentList = this.procurementAgentList.bind(this);
        this.getPlanningUnitByTracerCategoryId = this.getPlanningUnitByTracerCategoryId.bind(this);
        this.getProcurementAgentPlanningUnitByPlanningUnitIds = this.getProcurementAgentPlanningUnitByPlanningUnitIds.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.disablePUNode = this.disablePUNode.bind(this);
        this.disablePUConsumptionData = this.disablePUConsumptionData.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.productCategoryList = this.productCategoryList.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled'))
    }
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        valid = checkValidation(this.el)
        // console.log("json.length-------", json);
        for (var y = 0; y < json.length; y++) {
            //planning unit
            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getRowData(parseInt(y))[1];
            for (var i = (json.length - 1); i >= 0; i--) {
                var map = new Map(Object.entries(json[i]));
                var planningUnitValue = map.get("1");
                if (planningUnitValue == value && y != i && i > y) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                    i = -1;
                    valid = false;
                }
            }
            if(!valid){
                this.setState({
                    message: i18n.t('static.supplyPlan.validationFailed'),
                    color: 'red'
                },
                () => {
                    this.hideSecondComponent();
                })
            }
        }
        return valid;
    }
    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance;
        this.setState({
            tempPlanningUnitList: elInstance.getConfig().columns[1].source
        }, () => {
        })
        var rowData = elInstance.getRowData(y);
        var reg = /^0[0-9].*$/;
        if (x == 8 && !isNaN(rowData[8]) && rowData[8].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(8, y, parseFloat(rowData[8]), true);
        }
        if (x == 8 && reg.test(value)) {
            elInstance.setValueFromCoords(8, y, Number(rowData[8]), true);
        }
        elInstance.setValueFromCoords(10, y, 1, true);
    }
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance).getValue(`N${parseInt(data[i].y) + 1}`, true);
                if (index == 0 || index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(9, data[i].y, true, true);
                    (instance).setValueFromCoords(10, data[i].y, 1, true);
                    (instance).setValueFromCoords(11, data[i].y, 1, true);
                    (instance).setValueFromCoords(12, data[i].y, {}, true);
                    (instance).setValueFromCoords(13, data[i].y, 0, true);
                    (instance).setValueFromCoords(14, data[i].y, true, true);
                    (instance).setValueFromCoords(16, data[i].y, true, true);
                    z = data[i].y;
                }
            }
            if (data[i].x == 0) {
                (instance).setValueFromCoords(0, data[i].y, data[i].value, true);
            }
            if (data[i].x == 1) {
                let temp = data[i].value.split(" | ");
                let temp_obj = {
                    id: parseInt(temp[1]),
                    name: data[i].value
                };
                let temp_list = this.state.dropdownList;
                temp_list[data[i].y] = temp_obj;
                this.setState(
                    {
                        dropdownList: temp_list
                    }, () => {
                        (instance).setValueFromCoords(1, data[i].y, data[i].value, true);
                    }
                )
            }
        }
    }
    changed = function (instance, cell, x, y, value) {

        changed(instance, cell, x, y, value)
        
        if (x == 7) {
            if (value != -1 && value !== null && value !== '') {
                let planningUnitId = this.el.getValueFromCoords(1, y);
                let procurementAgentPlanningUnitList = this.state.originalPlanningUnitList;
                let tempPaList = procurementAgentPlanningUnitList.filter(c => c.planningUnitId == planningUnitId)[0];
                PlanningUnitService.getPlanningUnitWithPricesByIds([planningUnitId])
                    .then(response => {
                        if (response.status == 200) {
                            if (response.data.length > 0) {
                                let obj = response.data[0].procurementAgentPriceList.filter(c => c.id == value)[0];
                                if (typeof obj != 'undefined') {
                                    this.el.setValueFromCoords(8, y, obj.price, true);
                                } else {
                                    let q = '';
                                    q = (this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : '');
                                }
                            }
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
            } else {
            }
        }
        if (x == 0) {
            let q = '';
            q = (this.el.getValueFromCoords(1, y) != '' ? this.el.setValueFromCoords(1, y, '', true) : '');
            q = (this.el.getValueFromCoords(7, y) != '' ? this.el.setValueFromCoords(7, y, '', true) : '');
            q = (this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : '');
        }
        if (x == 1) {
            let q = '';
            q = (this.el.getValueFromCoords(7, y) != '' ? this.el.setValueFromCoords(7, y, '', true) : '');
            q = (this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : '');
            this.el.getCell(("B").concat(parseInt(y) + 1)).classList.remove('typing-' + this.state.lang);
        }

        //planning unit
        if (x == 1) {
            var json = this.el.getJson(null, false);
            var col = ("B").concat(parseInt(y) + 1);
            
            // console.log("json.length", json.length);
            var jsonLength = parseInt(json.length) - 1;
            // console.log("jsonLength", jsonLength);
            for (var i = jsonLength; i >= 0; i--) {
                // console.log("i=---------->", i, "y----------->", y);
                var map = new Map(Object.entries(json[i]));
                var planningUnitValue = map.get("1");
                // console.log("Planning Unit value in change", map.get("1"));
                // console.log("Value----->", value);
                if (planningUnitValue == value && y != i) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                    // this.el.setValueFromCoords(10, y, 1, true);
                    i = -1;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    // this.el.setValueFromCoords(10, y, 1, true);
                }
            }
        }


        //procurement Agent
        if (x == 7) {
        }
        if (this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "") > 0 && this.el.getValue(`H${parseInt(y) + 1}`, true) == "") {
            this.el.setValueFromCoords(7, y, -1, true);
        }

        this.setState({
            isChanged1: true,
        });
        if (x == 11) {
            this.el.setStyle(`A${parseInt(y) + 1}`, 'text-align', 'left');
            this.el.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');
            if (value == 1 || value == "") {
                var cell = this.el.getCell(("B").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
                var cell = this.el.getCell(("A").concat(parseInt(y) + 1))
                cell.classList.remove('readonly');
            } else {
                var cell = this.el.getCell(("B").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                var cell = this.el.getCell(("A").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
            }
        }
    }
    getPlanningUnitByTracerCategoryId(tracerCategoryId) {
        TracerCategoryService.getPlanningUnitByTracerCategoryId(tracerCategoryId)
            .then(response => {
                if (response.status == 200) {
                    return response.data;
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
    getProcurementAgentPlanningUnitByPlanningUnitIds(planningUnitList) {
        PlanningUnitService.getProcurementAgentPlanningUnitByPlanningUnitIds(planningUnitList)
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        responsePa: response.data,
                    },
                        () => {
                            this.buildJExcel();
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
    tracerCategoryList() {
        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    if (listArray.length > 0) {
                        sortArray(listArray);
                    }
                    let tempList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: getLabelText(listArray[i].label, this.state.lang),
                                id: parseInt(listArray[i].tracerCategoryId),
                                active: listArray[i].active,
                                healthArea: listArray[i].healthArea
                            }
                            tempList[i] = paJson
                        }
                    }
                    tempList.unshift({
                        name: 'All',
                        id: -1,
                        active: true,
                        healthArea: {}
                    });
                    this.setState({
                        allTracerCategoryList: tempList,
                    },
                        () => {
                            this.procurementAgentList();
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
    planningUnitList() {
        PlanningUnitService.getPlanningUnitByRealmId(AuthenticationService.getRealmId()).then(response => {
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
                        name: getLabelText(listArray[i].label, this.state.lang) + ' | ' + parseInt(listArray[i].planningUnitId),
                        id: parseInt(listArray[i].planningUnitId),
                        active: listArray[i].active,
                        forecastingUnit: listArray[i].forecastingUnit,
                        label: listArray[i].label
                    }
                    tempList[i] = paJson
                }
            }
            this.setState({
                allPlanningUnitList: tempList,
                originalPlanningUnitList: response.data
            }, () => {
                this.tracerCategoryList();
            });
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
    procurementAgentList() {
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
            var procurementAgentOs = procurementAgentTransaction.objectStore('procurementAgent');
            var procurementAgentRequest = procurementAgentOs.getAll();
            var planningList = []
            procurementAgentRequest.onerror = function (event) {
                this.setState({
                    message: 'unknown error occured', loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            };
            procurementAgentRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = procurementAgentRequest.result;
                var listArray = myResult;
                listArray.sort((a, b) => {
                    var itemLabelA = (a.procurementAgentCode).toUpperCase();
                    var itemLabelB = (b.procurementAgentCode).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                let tempList = [];
                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: listArray[i].procurementAgentCode,
                            id: parseInt(listArray[i].procurementAgentId),
                            active: listArray[i].active,
                            code: listArray[i].procurementAgentCode,
                            label: listArray[i].label
                        }
                        tempList[i] = paJson
                    }
                }
                tempList.unshift({
                    name: 'CUSTOM',
                    id: -1,
                    active: true,
                    code: 'CUSTOM',
                    label: {}
                });
                this.setState({
                    allProcurementAgentList: tempList,
                },
                    () => {
                        this.productCategoryList();
                    })
            }.bind(this);
        }.bind(this)
    }
    componentDidMount() {
        this.getDatasetList();
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }
    componentDidUpdate = () => {
        if (this.state.isChanged1 == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }
    getDatasetList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();
            var datasetList = [];
            var datasetList1 = [];
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                var filteredGetRequestList = myResult.filter(c => c.userId == userId);
                for (var i = 0; i < filteredGetRequestList.length; i++) {
                    var bytes = CryptoJS.AES.decrypt(filteredGetRequestList[i].programName, SECRET_KEY);
                    var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                    var programDataBytes = CryptoJS.AES.decrypt(filteredGetRequestList[i].programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson1 = JSON.parse(programData);
                    datasetList.push({
                        programCode: filteredGetRequestList[i].programCode,
                        programVersion: filteredGetRequestList[i].version,
                        programId: filteredGetRequestList[i].programId,
                        versionId: filteredGetRequestList[i].version,
                        id: filteredGetRequestList[i].id,
                        loading: false,
                        forecastStartDate: (programJson1.currentVersion.forecastStartDate ? moment(programJson1.currentVersion.forecastStartDate).format(`MMM-YYYY`) : ''),
                        forecastStopDate: (programJson1.currentVersion.forecastStopDate ? moment(programJson1.currentVersion.forecastStopDate).format(`MMM-YYYY`) : ''),
                        healthAreaList: programJson1.healthAreaList,
                        consumptionList: programJson1.consumptionList,
                        regionList: programJson1.regionList,
                        label: programJson1.label,
                        realmCountry: programJson1.realmCountry,
                        planningUnitList: programJson1.planningUnitList,
                        treeList: programJson1.treeList
                    });
                    datasetList1.push(filteredGetRequestList[i])
                }
                datasetList = datasetList.sort(function (a, b) {
                    a = a.programCode.toLowerCase();
                    b = b.programCode.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                if (localStorage.getItem("sesForecastProgramIdReport") != '' && localStorage.getItem("sesForecastProgramIdReport") != undefined && localStorage.getItem("sesForecastVersionIdReport") != '' && localStorage.getItem("sesForecastVersionIdReport") != undefined && !localStorage.getItem("sesForecastVersionIdReport").includes('Local')) {
                    this.setState({
                        datasetList: datasetList,
                        datasetList1: datasetList1,
                        forecastProgramId: localStorage.getItem("sesForecastProgramIdReport"),
                        forecastProgramVersionId: localStorage.getItem("sesForecastVersionIdReport"),
                        datasetId: (datasetList.filter(c => c.programId == localStorage.getItem("sesForecastProgramIdReport") && c.programVersion == localStorage.getItem("sesForecastVersionIdReport")).length > 0 ? datasetList.filter(c => c.programId == localStorage.getItem("sesForecastProgramIdReport") && c.programVersion == localStorage.getItem("sesForecastVersionIdReport"))[0].id : ''),
                    }, () => {
                        this.procurementAgentList();
                    })
                } else {
                    this.setState({
                        datasetList: datasetList,
                        datasetList1: datasetList1,
                        forecastProgramId: (datasetList.length == 1 ? datasetList[0].programId : ''),
                        forecastProgramVersionId: (datasetList.length == 1 ? datasetList[0].programVersion : ''),
                        datasetId: (datasetList.length == 1 ? datasetList[0].id : ''),
                    }, () => {
                        this.procurementAgentList();
                    })
                }
            }.bind(this);
        }.bind(this);
    }
    setProgramId(event) {
        var pID = document.getElementById("forecastProgramId").value;
        if (pID != 0) {
            this.setState({
                loading: true
            })
            let programSplit = pID.split('_');
            let programId = programSplit[0];
            let versionId = programSplit[1];
            versionId = versionId.replace(/[^\d]/g, '');
            let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == programId && c.versionId == versionId)[0]
            var myResult1 = selectedForecastProgram.planningUnitList;
            if (myResult1.length > 0) {
                var original = myResult1.map(o => o.planningUnit);
                var listArray = myResult1;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                let tempList = [];
                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: getLabelText(listArray[i].planningUnit.label, this.state.lang) + ' | ' + parseInt(listArray[i].planningUnit.id),
                            id: parseInt(listArray[i].planningUnit.id),
                            label: listArray[i].planningUnit.label
                        }
                        tempList[i] = paJson
                    }
                }
                this.setState({
                    loading: false,
                    allPlanningUnitList: tempList,
                    originalPlanningUnitList: original,
                    planningUnitList: myResult1,
                }, () => {
                    let forecastStartDate = selectedForecastProgram.forecastStartDate;
                    let forecastStopDate = selectedForecastProgram.forecastStopDate;
                    let beforeEndDateDisplay = new Date(selectedForecastProgram.forecastStartDate);
                    beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);
                    localStorage.setItem("sesForecastProgramIdReport", parseInt(programId));
                    localStorage.setItem("sesForecastVersionIdReport", parseInt(versionId));
                    this.setState({
                        rangeValue: { from: { year: new Date(forecastStartDate).getFullYear(), month: new Date(forecastStartDate).getMonth() + 1 }, to: { year: new Date(forecastStopDate).getFullYear(), month: new Date(forecastStopDate).getMonth() + 1 } },
                        startDateDisplay: (forecastStartDate == '' ? '' : months[Number(moment(forecastStartDate, 'MMM-YYYY').startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDate, 'MMM-YYYY').startOf('month').format("YYYY"))),
                        endDateDisplay: (forecastStopDate == '' ? '' : months[Number(moment(forecastStopDate, 'MMM-YYYY').startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDate, 'MMM-YYYY').startOf('month').format("YYYY"))),
                        beforeEndDateDisplay: (!isNaN(beforeEndDateDisplay.getTime()) == false ? '' : months[new Date(beforeEndDateDisplay).getMonth()] + ' ' + new Date(beforeEndDateDisplay).getFullYear()),
                        forecastProgramId: parseInt(programId),
                        forecastProgramVersionId: parseInt(versionId),
                        datasetId: selectedForecastProgram.id,
                    }, () => {
                        this.filterData();
                    })
                });
            } else {
                this.getPlanningUnitList(0);
            }
        } else {
            var dt = new Date();
            dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
            var dt1 = new Date();
            dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
            this.setState(
                {
                    rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
                    startDateDisplay: '',
                    endDateDisplay: '',
                    forecastProgramId: 0,
                    forecastProgramVersionId: 0,
                    datasetId: '',
                    loading: false
                }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                    this.filterData();
                })
        }
    }
    productCategoryList() {
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var productCategoryTransaction = db1.transaction(['productCategory'], 'readwrite');
            var productCategoryOs = productCategoryTransaction.objectStore('productCategory');
            var productCategoryRequest = productCategoryOs.getAll();
            var planningList = []
            productCategoryRequest.onerror = function (event) {
                this.setState({
                    message: 'unknown error occured', loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            };
            productCategoryRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = productCategoryRequest.result;
                myResult = myResult.filter(c => c.payload.active == true || c.payload.realm.id == 0);
                var productCategoryListNew = [];
                for (var k = 0; k < (myResult).length; k++) {
                    var spaceCount = myResult[k].sortOrder.split(".").length;
                    var indendent = "";
                    for (var p = 1; p <= spaceCount - 1; p++) {
                        if (p == 1) {
                            indendent = indendent.concat("|_");
                        } else {
                            indendent = indendent.concat("_");
                        }
                    }
                    var productCategoryJson = {};
                    if (myResult[k].payload.productCategoryId == 0) {
                        productCategoryJson = {
                            name: (myResult[k].payload.label.label_en),
                            id: -1
                        }
                    } else {
                        productCategoryJson = {
                            name: (myResult[k].payload.label.label_en),
                            id: myResult[k].payload.productCategoryId
                        }
                    }
                    productCategoryListNew.push(productCategoryJson);
                }
                const ids = productCategoryListNew.map(o => o.id)
                let filteredEQUnit = productCategoryListNew.filter(({ id }, index) => !ids.includes(id, index + 1))
                filteredEQUnit.sort((a, b) => {
                    var itemLabelA = a.name.toUpperCase();
                    var itemLabelB = b.name.toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    productCategoryList: myResult,
                    productCategoryListNew: filteredEQUnit
                }, () => {
                    this.setProgramId();
                });
            }.bind(this);
        }.bind(this)
    }
    filterData(addRowInJexcel) {
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        var forecastProgramId = this.state.forecastProgramId;
        if (forecastProgramId > 0) {
            let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == this.state.forecastProgramId && c.versionId == this.state.forecastProgramVersionId)[0];
            let planningUnitList = selectedForecastProgram.planningUnitList;
            planningUnitList.sort((a, b) => {
                var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState(
                {
                    selsource: planningUnitList,
                    loading: true,
                    selectedForecastProgram: selectedForecastProgram,
                }, () => {
                    this.buildJExcel(addRowInJexcel);
                })
        } else {
            this.setState(
                {
                    allowAdd: false,
                    loading: false
                }, () => {
                })
        }
    }
    handleRangeChange(value, text, listIndex) {
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.filterData();
        })
    }
    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    dateformatter = value => {
        var dt = new Date(value)
        return moment(dt).format('DD-MMM-YY');
    }
    formatter = value => {
        var cell1 = value
        cell1 += '';
        var x = cell1.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    buildJExcel(addRowInJexcel) {
        let outPutList = this.state.selsource;
        let outPutListArray = [];
        let count = 0;
        let indexVar = 1;
        let dropdownList = this.state.dropdownList;
        for (var j = 0; j < outPutList.length; j++) {
            data = [];
            dropdownList[j] = {
                id: outPutList[j].planningUnit.id,
                name: outPutList[j].planningUnit.label.label_en + " | " + outPutList[j].planningUnit.id
            };
            data[0] = outPutList[j].planningUnit.forecastingUnit.productCategory.id
            data[1] = outPutList[j].planningUnit.id
            data[2] = outPutList[j].consuptionForecast
            data[3] = outPutList[j].treeForecast;
            data[4] = outPutList[j].stock;
            data[5] = outPutList[j].existingShipments;
            data[6] = outPutList[j].monthsOfStock;
            data[7] = (outPutList[j].price === "" || outPutList[j].price == null || outPutList[j].price == undefined) ? "" : (outPutList[j].procurementAgent == null || outPutList[j].procurementAgent == undefined ? -1 : outPutList[j].procurementAgent.id);
            data[8] = outPutList[j].price;
            data[9] = outPutList[j].programPlanningUnitId;
            data[10] = 0;
            data[11] = 0;
            data[12] = outPutList[j].selectedForecastMap;
            data[13] = indexVar;
            data[14] = outPutList[j].treeForecast;
            data[15] = outPutList[j].planningUnitNotes;
            data[16] = outPutList[j].active;
            data[17] = outPutList[j].active;
            outPutListArray[count] = data;
            count++;
            indexVar = indexVar + 1;
        }
        if (outPutList.length == 0) {
            data = [];
            data[0] = -1;
            data[1] = "";
            data[2] = true;
            data[3] = true;
            data[4] = "";
            data[5] = "";
            data[6] = "";
            data[7] = "";
            data[8] = "";
            data[9] = 0;
            data[10] = 1;
            data[11] = 1;
            data[12] = {};
            data[13] = 0;
            data[14] = true;
            data[15] = "";
            data[16] = true;
            data[17] = true;
            outPutListArray[0] = data;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var json = [];
        var data = outPutListArray;
        this.setState({ dropdownList: dropdownList })
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 150, 60, 60, 60, 60, 60, 100, 60, 60, 60, 60, 60, 60, 60, 100, 60, 60],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.productCategory.productCategory'),
                    type: 'autocomplete',
                    source: this.state.productCategoryListNew,
                    required: true,
                    // readOnly: true// 0A
                },
                {
                    title: i18n.t('static.dashboard.planningunitheader'),
                    type: 'dropdown',
                    source: dropdownList,
                    options: {
                        url: `${API_URL}/api/dropdown/planningUnit/autocomplete/filter/productCategory/searchText/language/sortOrder`,
                        autocomplete: true,
                        remoteSearch: true,
                        onbeforesearch: function (instance, request) {
                            if (this.state.sortOrderLoading == false) {
                                request.method = 'GET';
                                let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                                let jwtToken = CryptoJS.AES.decrypt(localStorage.getItem('token-' + decryptedCurUser).toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                                request.beforeSend = (httpRequest) => {
                                    httpRequest.setRequestHeader('Authorization', 'Bearer ' + jwtToken);
                                }
                                const searchText = instance.search;
                                const language = this.state.lang;
                                const sortOrder = this.state.tempSortOrder;
                                request.url = request.url.replace("searchText/language/sortOrder", `${searchText}/${language}/${sortOrder}`);
                                return request;
                            }
                        }.bind(this),
                    },
                    filter: this.filterPlanningUnitList,
                    width: '170',
                    required: true
                    // readOnly: true //1B
                },
                {
                    title: i18n.t('static.commitTree.consumptionForecast') + ' ?',
                    type: 'checkbox',
                    width: '150',
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true)
                },
                {
                    title: i18n.t('static.TreeForecast.TreeForecast') + ' ?',
                    type: 'checkbox',
                    width: '150',
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true)
                },
                {
                    title: i18n.t('static.planningUnitSetting.stockEndOf') + ' ' + this.state.beforeEndDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    width: '150',
                    disabledMaskOnEdition: true,
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true),
                    empty: true,
                    number: true,
                    decimal: false,
                    regex: {
                        ex: JEXCEL_INTEGER_REGEX,
                        text: i18n.t('static.planningUnitSetting.10digitWholeNumber')
                    }
                    // readOnly: true //4E
                },
                {
                    title: i18n.t('static.planningUnitSetting.existingShipments') + this.state.startDateDisplay + ' - ' + this.state.endDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    width: '150',
                    disabledMaskOnEdition: true,
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true),
                    empty: true,
                    number: true,
                    decimal: false,
                    regex: {
                        ex: JEXCEL_INTEGER_REGEX,
                        text: i18n.t('static.planningUnitSetting.10digitWholeNumber')
                    }
                    // readOnly: true //5F
                },
                {
                    title: i18n.t('static.planningUnitSetting.desiredMonthsOfStock') + ' ' + this.state.endDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    disabledMaskOnEdition: true,
                    width: '150',
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true),
                    empty: true,
                    number: true,
                    decimal: false,
                    maxValue: {
                        value: 99,
                        text: i18n.t('static.planningUnitSetting.max99MonthAllowed')
                    },
                    regex: {
                        ex: JEXCEL_INTEGER_REGEX,
                        text: i18n.t('static.planningUnitSetting.10digitWholeNumber')
                    }
                    // readOnly: true //6G
                },
                {
                    title: i18n.t('static.forecastReport.priceType'),
                    type: 'autocomplete',
                    source: this.state.allProcurementAgentList,
                    width: '120',
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true)
                },
                {
                    title: i18n.t('static.forecastReport.unitPrice'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##.00',
                    width: '120',
                    disabledMaskOnEdition: true,
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true),
                    empty: true,
                    number:true,
                    minValue: {
                        value: 0,
                        text: i18n.t('static.planningUnitSetting.negativeValueNotAllowed')
                    },
                    regex: {
                        ex: JEXCEL_DECIMAL_CATELOG_PRICE,
                        text: i18n.t('static.planningUnitSetting.max10Digit4AfterDecimal')
                    }
                    // readOnly: true //8I
                },
                {
                    title: 'programPlanningUnitId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'isChange',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'isNewRowAdded',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'selected forecast map',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'indexVar',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'treeForecast',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text',
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true)
                },
                {
                    title: 'Active',
                    type: 'checkbox',
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? false : true)
                },
                {
                    title: 'active',
                    type: 'hidden',
                    readOnly: true
                },
            ],
            updateTable: function (el, cell, x, y, source, value, id) {
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            allowDeleteRow: true,
            onchange: this.changed,
            onpaste: this.onPaste,
            onchangepage: this.onchangepage,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y == null) {
                } else {
                    if (isSiteOnline()) {
                        if (obj.options.allowInsertRow == true && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) {
                            items.push({
                                title: i18n.t('static.common.addRow'),
                                onclick: function () {
                                    this.getPlanningUnitList(1);
                                }.bind(this)
                            });
                        }
                    }
                    if (obj.options.allowDeleteRow == true) {
                        if (obj.getRowData(y)[11] == 1) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                }
                            });
                        }
                    }
                }
                return items;
            }.bind(this),
            oneditionstart: function (instance, cell, x, y, value) {
                this.setState({ sortOrderLoading: true })
                let tempId = data[y][0]
                let sortOrder;
                if (tempId == -1 || tempId == 0) {
                    sortOrder = "00"
                } else {
                    sortOrder = this.state.productCategoryList.filter(item => item.payload.productCategoryId == tempId)[0].sortOrder
                }
                this.setState({ tempSortOrder: sortOrder }, () => {
                    this.setState({ sortOrderLoading: false })
                })
            }.bind(this),
            oneditionend: this.oneditionend,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            editable: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS')) ? true : false),
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false, allowAdd: true, tempPlanningUnitList: dropdownList
        }, () => {
            if (addRowInJexcel) {
                this.addRow();
            }
        })
    }
    filterPlanningUnitList = function (instance, cell, c, r, source) {
        var mylist = [];
        return mylist;
    }.bind(this)
    filterPlanningUnitListByProductCategoryId = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (this.state.languageEl.getJson(null, false)[r])[0];
        var puList = [];
        if (value != -1) {
            var pc = this.state.productCategoryList.filter(c => c.payload.productCategoryId == value)[0]
            var pcList = this.state.productCategoryList.filter(c => c.payload.productCategoryId == pc.payload.productCategoryId || c.parentId == pc.id);
            var pcIdArray = [];
            for (var pcu = 0; pcu < pcList.length; pcu++) {
                pcIdArray.push(pcList[pcu].payload.productCategoryId);
            }
            puList = (this.state.planningUnitList).filter(c => pcIdArray.includes(c.forecastingUnit.productCategory.id));
        } else {
            puList = this.state.planningUnitList;
        }
        for (var k = 0; k < puList.length; k++) {
            var planningUnitJson = {
                name: puList[k].label.label_en + ' | ' + puList[k].id,
                id: puList[k].id
            }
            mylist.push(planningUnitJson);
        }
        return mylist;
    }.bind(this)
    filterTracerCategoryByHealthArea = function (instance, cell, c, r, source) {
        var mylist = [];
        let selectedForecastProgramHealthAreaList = this.state.selectedForecastProgram.healthAreaList;
        for (var i = 0; i < selectedForecastProgramHealthAreaList.length; i++) {
            let list = [];
            if (i == 0) {
                list = this.state.allTracerCategoryList.filter(c => (c.id == -1 ? c : c.healthArea.id == selectedForecastProgramHealthAreaList[i].id));
            } else {
                list = this.state.allTracerCategoryList.filter(c => c.id != -1 && c.healthArea.id == selectedForecastProgramHealthAreaList[i].id);
            }
            if (list.length != 0) {
                mylist = mylist.concat(list);
            }
        }
        if (mylist.length > 0) {
            sortArrayByName(mylist);
            let mylistObj = mylist.filter(c => c.id == -1)[0];
            mylist = mylist.filter(c => c.id != -1);
            mylist.unshift(mylistObj);
        }
        return mylist;
    }.bind(this)
    onchangepage(el, pageNo, oldPageNo) {
        var elInstance = el;
        var json = elInstance.getJson(null, false);
        var colArr = ['A', 'B'];
        var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var start = pageNo * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        for (var j = start; j < jsonLength; j++) {
            var rowData = elInstance.getRowData(j);
            var programPlanningUnitId = rowData[11];
            elInstance.setStyle(`A${parseInt(j) + 1}`, 'text-align', 'left');
            elInstance.setStyle(`B${parseInt(j) + 1}`, 'text-align', 'left');
            if (programPlanningUnitId == 1) {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.remove('readonly');
                var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
                cell.classList.remove('readonly');
            } else {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            }
        }
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('InfoTr');
        tr.children[6].classList.add('InfoTr');
        tr.children[7].classList.add('InfoTr');
        tr.children[8].classList.add('InfoTr');
        tr.children[5].title = i18n.t('static.tooltip.Stock');
        tr.children[6].title = i18n.t('static.tooltip.ExistingShipments');
        tr.children[7].title = i18n.t('static.tooltip.DesiredMonthsofStock');
        tr.children[8].title = i18n.t('static.tooltip.PriceType');
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson();
        var colArr = ['A', 'B'];
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
            var programPlanningUnitId = rowData[11];
            elInstance.setStyle(`A${parseInt(j) + 1}`, 'text-align', 'left');
            elInstance.setStyle(`B${parseInt(j) + 1}`, 'text-align', 'left');
            if (programPlanningUnitId == 1) {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.remove('readonly');
                var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
                cell.classList.remove('readonly');
            } else {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            }
        }
    }
    formSubmit = function () {
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState({
                loading: true,
                isPlanningUnitLoaded: false
            })
            var tableJson = this.el.getJson(null, false);
            var programs = [];
            var count = 0;
            var planningUnitList = [];
            let indexVar = 0;
            var program = (this.state.datasetList1.filter(x => x.programId == this.state.forecastProgramId && x.version == this.state.forecastProgramVersionId)[0]);
            var databytes = CryptoJS.AES.decrypt(program.programData, SECRET_KEY);
            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
            let originalPlanningUnitList = programData.planningUnitList;
            let listOfDisablePuNode = [];
            let listOfDisablePuNodeActiveInactive = [];
            let planningUnitIds = [];
            for (let i = 0; i < tableJson.length; i++) {
                planningUnitIds.push(parseInt(tableJson[i][1]));
            }
            if (isSiteOnline()) {
                PlanningUnitService.getPlanningUnitByIds(planningUnitIds).then(response => {
                    this.setState({
                        allPlanningUnitList: response.data,
                        originalPlanningUnitList: response.data,
                        planningUnitList: response.data,
                    }, () => {
                        for (var i = 0; i < tableJson.length; i++) {
                            var map1 = new Map(Object.entries(tableJson[i]));
                            let planningUnitObj = this.state.originalPlanningUnitList.filter(c => c.planningUnitId == parseInt(map1.get("1")))[0];
                            let procurementAgentObj = "";
                            if (parseInt(map1.get("7")) === -1) {
                                procurementAgentObj = null
                            } else {
                                procurementAgentObj = this.state.allProcurementAgentList.filter(c => c.id == parseInt(map1.get("7")))[0];
                            }
                            if (parseInt(map1.get("11")) == 1) {
                                let tempJson = {
                                    "programPlanningUnitId": parseInt(map1.get("9")),
                                    "planningUnit": {
                                        "id": parseInt(map1.get("1")),
                                        "label": planningUnitObj.label,
                                        "unit": planningUnitObj.unit,
                                        "multiplier": planningUnitObj.multiplier,
                                        "forecastingUnit": {
                                            "id": planningUnitObj.forecastingUnit.forecastingUnitId,
                                            "label": planningUnitObj.forecastingUnit.label,
                                            "unit": planningUnitObj.forecastingUnit.unit,
                                            "productCategory": planningUnitObj.forecastingUnit.productCategory,
                                            "tracerCategory": planningUnitObj.forecastingUnit.tracerCategory,
                                            "idString": "" + planningUnitObj.forecastingUnit.forecastingUnitId
                                        },
                                        "idString": "" + parseInt(map1.get("1"))
                                    },
                                    "consuptionForecast": map1.get("2"),
                                    "treeForecast": map1.get("3"),
                                    "stock": this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "existingShipments": this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "monthsOfStock": this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "procurementAgent": (procurementAgentObj == null ? null : {
                                        "id": parseInt(map1.get("7")),
                                        "label": procurementAgentObj.label,
                                        "code": procurementAgentObj.code,
                                        "idString": "" + parseInt(map1.get("7"))
                                    }),
                                    "price": this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "higherThenConsumptionThreshold": null,
                                    "lowerThenConsumptionThreshold": null,
                                    "planningUnitNotes": map1.get("15"),
                                    "consumptionDataType": 2,
                                    "otherUnit": null,
                                    "selectedForecastMap": map1.get("12"),
                                    "createdBy": null,
                                    "createdDate": null,
                                    "active": map1.get("16"),
                                }
                                planningUnitList.push(tempJson);
                            } else {
                                let planningUnitobj1 = originalPlanningUnitList[indexVar];
                                let tempJson = {
                                    "programPlanningUnitId": parseInt(map1.get("9")),
                                    "planningUnit": {
                                        "id": parseInt(map1.get("1")),
                                        "label": planningUnitObj.label,
                                        "unit": planningUnitObj.unit,
                                        "multiplier": planningUnitObj.multiplier,
                                        "forecastingUnit": {
                                            "id": planningUnitObj.forecastingUnit.forecastingUnitId,
                                            "label": planningUnitObj.forecastingUnit.label,
                                            "unit": planningUnitObj.forecastingUnit.unit,
                                            "productCategory": planningUnitObj.forecastingUnit.productCategory,
                                            "tracerCategory": planningUnitObj.forecastingUnit.tracerCategory,
                                            "idString": "" + planningUnitObj.forecastingUnit.forecastingUnitId
                                        },
                                        "idString": "" + parseInt(map1.get("1"))
                                    },
                                    "consuptionForecast": map1.get("2"),
                                    "treeForecast": map1.get("3"),
                                    "stock": this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "existingShipments": this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "monthsOfStock": this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "procurementAgent": (procurementAgentObj == null ? null : {
                                        "id": parseInt(map1.get("7")),
                                        "label": procurementAgentObj.label,
                                        "code": procurementAgentObj.code,
                                        "idString": "" + parseInt(map1.get("7"))
                                    }),
                                    "price": this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                    "higherThenConsumptionThreshold": planningUnitobj1.higherThenConsumptionThreshold,
                                    "lowerThenConsumptionThreshold": planningUnitobj1.lowerThenConsumptionThreshold,
                                    "planningUnitNotes": map1.get("15"),
                                    "consumptionDataType": planningUnitobj1.consumptionDataType,
                                    "otherUnit": planningUnitobj1.otherUnit,
                                    "selectedForecastMap": map1.get("12"),
                                    "createdBy": planningUnitobj1.createdBy,
                                    "createdDate": planningUnitobj1.createdDate,
                                    "active": map1.get("16"),
                                }
                                planningUnitList.push(tempJson);
                                indexVar = indexVar + 1;
                            }
                            if (map1.get("3") == false && map1.get("14") == true) {
                                listOfDisablePuNode.push(parseInt(map1.get("1")));
                            }
                            if (map1.get("16") == false && map1.get("17") == true) {
                                listOfDisablePuNode.push(parseInt(map1.get("1")));
                            }
                        }
                        programData.planningUnitList = planningUnitList;
                        programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
                        program.programData = programData;
                        programs.push(program);
                        var db1;
                        getDatabase();
                        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                        openRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                color: 'red'
                            })
                            this.hideFirstComponent()
                        }.bind(this);
                        openRequest.onsuccess = function (e) {
                            db1 = e.target.result;
                            var transaction = db1.transaction(['datasetData'], 'readwrite');
                            var programTransaction = transaction.objectStore('datasetData');
                            programs.forEach(program => {
                                var programRequest = programTransaction.put(program);
                            })
                            transaction.oncomplete = function (event) {
                                db1 = e.target.result;
                                var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                                var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                                var datasetDetailsRequest = datasetDetailsTransaction.get(this.state.datasetId);
                                datasetDetailsRequest.onsuccess = function (e) {
                                    var datasetDetailsRequestJson = datasetDetailsRequest.result;
                                    datasetDetailsRequestJson.changed = 1;
                                    var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                                    datasetDetailsRequest1.onsuccess = function (event) {
                                    }
                                }
                                this.setState({
                                    message: i18n.t('static.mt.dataUpdateSuccess'),
                                    color: "green",
                                    isChanged1: false,
                                }, () => {
                                    listOfDisablePuNode = [...new Set(listOfDisablePuNode)];
                                    if (listOfDisablePuNode.length > 0) {
                                        this.disablePUNode(listOfDisablePuNode);
                                        this.disablePUConsumptionData(listOfDisablePuNode);
                                    }
                                    this.getDatasetList();
                                    this.hideSecondComponent();
                                });
                            }.bind(this);
                            transaction.onerror = function (event) {
                                this.setState({
                                    loading: false,
                                    color: "red",
                                }, () => {
                                    this.hideSecondComponent();
                                });
                            }.bind(this);
                        }.bind(this);
                    });
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
            } else {
                for (var i = 0; i < tableJson.length; i++) {
                    var map1 = new Map(Object.entries(tableJson[i]));
                    let planningUnitObj = originalPlanningUnitList.filter(c => c.planningUnit.Id == parseInt(map1.get("1")))[0];
                    let procurementAgentObj = "";
                    if (parseInt(map1.get("7")) === -1) {
                        procurementAgentObj = null
                    } else {
                        procurementAgentObj = this.state.allProcurementAgentList.filter(c => c.id == parseInt(map1.get("7")))[0];
                    }
                    if (parseInt(map1.get("11")) == 1) {
                        let tempJson = {
                            "programPlanningUnitId": parseInt(map1.get("9")),
                            "planningUnit": {
                                "id": parseInt(map1.get("1")),
                                "label": planningUnitObj.label,
                                "unit": planningUnitObj.unit,
                                "multiplier": planningUnitObj.multiplier,
                                "forecastingUnit": {
                                    "id": planningUnitObj.forecastingUnit.forecastingUnitId,
                                    "label": planningUnitObj.forecastingUnit.label,
                                    "unit": planningUnitObj.forecastingUnit.unit,
                                    "productCategory": planningUnitObj.forecastingUnit.productCategory,
                                    "tracerCategory": planningUnitObj.forecastingUnit.tracerCategory,
                                    "idString": "" + planningUnitObj.forecastingUnit.forecastingUnitId
                                },
                                "idString": "" + parseInt(map1.get("1"))
                            },
                            "consuptionForecast": map1.get("2"),
                            "treeForecast": map1.get("3"),
                            "stock": this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "existingShipments": this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "monthsOfStock": this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "procurementAgent": (procurementAgentObj == null ? null : {
                                "id": parseInt(map1.get("7")),
                                "label": procurementAgentObj.label,
                                "code": procurementAgentObj.code,
                                "idString": "" + parseInt(map1.get("7"))
                            }),
                            "price": this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "higherThenConsumptionThreshold": null,
                            "lowerThenConsumptionThreshold": null,
                            "planningUnitNotes": map1.get("15"),
                            "consumptionDataType": 2,
                            "otherUnit": null,
                            "selectedForecastMap": map1.get("12"),
                            "createdBy": null,
                            "createdDate": null,
                            "active": map1.get("16"),
                        }
                        planningUnitList.push(tempJson);
                    } else {
                        let planningUnitobj1 = originalPlanningUnitList[indexVar];
                        let tempJson = {
                            "programPlanningUnitId": parseInt(map1.get("9")),
                            "planningUnit": planningUnitobj1.planningUnit,
                            "consuptionForecast": map1.get("2"),
                            "treeForecast": map1.get("3"),
                            "stock": this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "existingShipments": this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "monthsOfStock": this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "procurementAgent": (procurementAgentObj == null ? null : {
                                "id": parseInt(map1.get("7")),
                                "label": procurementAgentObj.label,
                                "code": procurementAgentObj.code,
                                "idString": "" + parseInt(map1.get("7"))
                            }),
                            "price": this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            "higherThenConsumptionThreshold": planningUnitobj1.higherThenConsumptionThreshold,
                            "lowerThenConsumptionThreshold": planningUnitobj1.lowerThenConsumptionThreshold,
                            "planningUnitNotes": map1.get("15"),
                            "consumptionDataType": planningUnitobj1.consumptionDataType,
                            "otherUnit": planningUnitobj1.otherUnit,
                            "selectedForecastMap": map1.get("12"),
                            "createdBy": planningUnitobj1.createdBy,
                            "createdDate": planningUnitobj1.createdDate,
                            "active": map1.get("16"),
                        }
                        planningUnitList.push(tempJson);
                        indexVar = indexVar + 1;
                    }
                    if (map1.get("3") == false && map1.get("14") == true) {
                        listOfDisablePuNode.push(parseInt(map1.get("1")));
                    }
                    if (map1.get("16") == false && map1.get("17") == true) {
                        listOfDisablePuNode.push(parseInt(map1.get("1")));
                    }
                }
                programData.planningUnitList = planningUnitList;
                programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
                program.programData = programData;
                programs.push(program);
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: 'red'
                    })
                    this.hideFirstComponent()
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var transaction = db1.transaction(['datasetData'], 'readwrite');
                    var programTransaction = transaction.objectStore('datasetData');
                    programs.forEach(program => {
                        var programRequest = programTransaction.put(program);
                    })
                    transaction.oncomplete = function (event) {
                        db1 = e.target.result;
                        var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                        var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                        var datasetDetailsRequest = datasetDetailsTransaction.get(this.state.datasetId);
                        datasetDetailsRequest.onsuccess = function (e) {
                            var datasetDetailsRequestJson = datasetDetailsRequest.result;
                            datasetDetailsRequestJson.changed = 1;
                            var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                            datasetDetailsRequest1.onsuccess = function (event) {
                            }
                        }
                        this.setState({
                            message: i18n.t('static.mt.dataUpdateSuccess'),
                            color: "green",
                            isChanged1: false,
                        }, () => {
                            listOfDisablePuNode = [...new Set(listOfDisablePuNode)];
                            if (listOfDisablePuNode.length > 0) {
                                this.disablePUNode(listOfDisablePuNode);
                                this.disablePUConsumptionData(listOfDisablePuNode);
                            }
                            this.getDatasetList();
                            this.hideSecondComponent();
                        });
                    }.bind(this);
                    transaction.onerror = function (event) {
                        this.setState({
                            loading: false,
                            color: "red",
                        }, () => {
                            this.hideSecondComponent();
                        });
                    }.bind(this);
                }.bind(this);
            }
        }
    }
    disablePUConsumptionData(listOfDisablePuNode) {
        let datasetList1 = this.state.datasetList1;
        for (var i = 0; i < datasetList1.length; i++) {
            var programs = [];
            var program = datasetList1[i];
            var databytes = CryptoJS.AES.decrypt(program.programData, SECRET_KEY);
            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
            let actualConsumptionList = programData.actualConsumptionList;
            for (var j = 0; j < listOfDisablePuNode.length; j++) {
                for (var k = 0; k < actualConsumptionList.length; k++) {
                    if (parseInt(listOfDisablePuNode[j]) == actualConsumptionList[k].planningUnit.id) {
                        actualConsumptionList[k].amount = 0;
                    }
                }
            }
            programData.actualConsumptionList = actualConsumptionList;
            programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
            program.programData = programData;
            programs.push(program);
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
                this.hideFirstComponent()
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['datasetData'], 'readwrite');
                var programTransaction = transaction.objectStore('datasetData');
                programs.forEach(program => {
                    var programRequest = programTransaction.put(program);
                })
                transaction.oncomplete = function (event) {
                    db1 = e.target.result;
                    var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                    var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                    var datasetDetailsRequest = datasetDetailsTransaction.get(this.state.datasetId);
                    datasetDetailsRequest.onsuccess = function (e) {
                        var datasetDetailsRequestJson = datasetDetailsRequest.result;
                        datasetDetailsRequestJson.changed = 1;
                        var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                        datasetDetailsRequest1.onsuccess = function (event) {
                        }
                    }
                }.bind(this);
                transaction.onerror = function (event) {
                    this.setState({
                        loading: false,
                        color: "red",
                    }, () => {
                        this.hideSecondComponent();
                    });
                }.bind(this);
            }.bind(this);
        }
    }
    disablePUNode(listOfDisablePuNode) {
        let datasetList1 = this.state.datasetList1;
        for (var i = 0; i < datasetList1.length; i++) {
            var programs = [];
            var program = datasetList1[i];
            var databytes = CryptoJS.AES.decrypt(program.programData, SECRET_KEY);
            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
            let treeListForSelectedProgram = programData.treeList;
            for (var j = 0; j < listOfDisablePuNode.length; j++) {
                for (var k = 0; k < treeListForSelectedProgram.length; k++) {
                    let flatlist = treeListForSelectedProgram[k].tree.flatList;
                    let listContainNodeType5 = flatlist.filter(c => c.payload.nodeType.id == 5);
                    for (var l = 0; l < listContainNodeType5.length; l++) {
                        let nodeDataMap = listContainNodeType5[l].payload.nodeDataMap;
                        let nodeDataMapKeys = Object.keys(listContainNodeType5[l].payload.nodeDataMap);
                        for (var m = 0; m < nodeDataMapKeys.length; m++) {
                            let insideArrayOfNodeDataMap = nodeDataMap[nodeDataMapKeys[m]];
                            if (insideArrayOfNodeDataMap[0].puNode.planningUnit.id == parseInt(listOfDisablePuNode[j])) {
                                var sameParentList = flatlist.filter(c => c.parent == listContainNodeType5[l].parent);
                                for (let l = 0; l < sameParentList.length; l++) {
                                    var nodeDataModelingList = sameParentList[l].payload.nodeDataMap[nodeDataMapKeys[m]][0].nodeDataModelingList;
                                    var result = nodeDataModelingList.filter(c => c.transferNodeDataId == nodeDataMap[nodeDataMapKeys[m]][0].nodeDataId);
                                    if (result.length > 0) {
                                        for (let r = 0; r < result.length; r++) {
                                            var findNodeDataIdIndex = nodeDataModelingList.findIndex(n => n.transferNodeDataId == result[r].transferNodeDataId);
                                            nodeDataModelingList.splice(findNodeDataIdIndex, 1);
                                        }
                                    }
                                }
                                var findNodeIndex = flatlist.findIndex(n => n.id == listContainNodeType5[l].id);
                                if (findNodeIndex != -1) {
                                    treeListForSelectedProgram[k].generateMom = 1;
                                    flatlist.splice(findNodeIndex, 1);
                                }
                            }
                        }
                    }
                }
            }
            programData.treeList = treeListForSelectedProgram;
            programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
            program.programData = programData;
            programs.push(program);
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
                this.hideFirstComponent()
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['datasetData'], 'readwrite');
                var programTransaction = transaction.objectStore('datasetData');
                programs.forEach(program => {
                    var programRequest = programTransaction.put(program);
                })
                transaction.oncomplete = function (event) {
                    db1 = e.target.result;
                    var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                    var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                    var datasetDetailsRequest = datasetDetailsTransaction.get(this.state.datasetId);
                    datasetDetailsRequest.onsuccess = function (e) {
                        var datasetDetailsRequestJson = datasetDetailsRequest.result;
                        datasetDetailsRequestJson.changed = 1;
                        var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                        datasetDetailsRequest1.onsuccess = function (event) {
                        }
                    }
                    this.setState({
                    }, () => {
                    });
                }.bind(this);
                transaction.onerror = function (event) {
                    this.setState({
                        loading: false,
                        color: "red",
                    }, () => {
                        this.hideSecondComponent();
                    });
                }.bind(this);
            }.bind(this);
        }
    }
    getPlanningUnitList(callBy) {
        if (callBy == 0) {
            var pID = document.getElementById("forecastProgramId").value;
            if (pID != 0) {
                this.setState({
                    loading: true,
                    isPlanningUnitLoaded: true
                })
                let programSplit = pID.split('_');
                let programId = programSplit[0];
                let versionId = programSplit[1];
                versionId = versionId.replace(/[^\d]/g, '');
                let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == programId && c.versionId == versionId)[0]
                let planningUnitIds = this.state.tempPlanningUnitList.map(e => parseInt(e.id))
                PlanningUnitService.getPlanningUnitByIds(planningUnitIds).then(response => {
                    this.setState({
                        allPlanningUnitList: response.data,
                        originalPlanningUnitList: response.data,
                        planningUnitList: response.data,
                    }, () => {
                        let forecastStartDate = selectedForecastProgram.forecastStartDate;
                        let forecastStopDate = selectedForecastProgram.forecastStopDate;
                        let beforeEndDateDisplay = new Date(selectedForecastProgram.forecastStartDate);
                        beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);
                        localStorage.setItem("sesForecastProgramIdReport", parseInt(programId));
                        localStorage.setItem("sesForecastVersionIdReport", parseInt(versionId));
                        this.setState(
                            {
                                rangeValue: { from: { year: new Date(forecastStartDate).getFullYear(), month: new Date(forecastStartDate).getMonth() + 1 }, to: { year: new Date(forecastStopDate).getFullYear(), month: new Date(forecastStopDate).getMonth() + 1 } },
                                startDateDisplay: (forecastStartDate == '' ? '' : months[Number(moment(forecastStartDate, 'MMM-YYYY').startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDate, 'MMM-YYYY').startOf('month').format("YYYY"))),
                                endDateDisplay: (forecastStopDate == '' ? '' : months[Number(moment(forecastStopDate, 'MMM-YYYY').startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDate, 'MMM-YYYY').startOf('month').format("YYYY"))),
                                beforeEndDateDisplay: (!isNaN(beforeEndDateDisplay.getTime()) == false ? '' : months[new Date(beforeEndDateDisplay).getMonth()] + ' ' + new Date(beforeEndDateDisplay).getFullYear()),
                                forecastProgramId: parseInt(programId),
                                forecastProgramVersionId: parseInt(versionId),
                                datasetId: selectedForecastProgram.id,
                                loading: false
                            }, () => {
                                this.filterData(callBy);
                            })
                    });
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
        } else if (callBy == 1) {
            this.addRow()
        }
    }
    addRow = function () {
        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = -1;
        data[1] = "";
        data[2] = true;
        data[3] = true;
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = "";
        data[8] = "";
        data[9] = 0;
        data[10] = 1;
        data[11] = 1;
        data[12] = {};
        data[13] = 0;
        data[14] = true;
        data[15] = "";
        data[16] = true;
        data[17] = true;
        this.el.insertRow(
            data
        );
        this.el.getCell(("B").concat(parseInt(json.length) + 1)).classList.add('typing-' + this.state.lang);
    };
    toggleProgramSetting() {
        this.setState({
            popoverOpenProgramSetting: !this.state.popoverOpenProgramSetting,
        });
    }
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        const { datasetList } = this.state;
        let datasets = datasetList.length > 0
            && datasetList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {item.programCode + '~v' + item.versionId}
                    </option>
                )
            }, this);
        const { rangeValue } = this.state
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        return (
            <div className="animated fadeIn" >
                <Prompt
                    when={this.state.isChanged1 == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="card-header-actions">
                        <div className="Card-header-reporticon">
                            <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                            <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                            <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/dataset/versionSettings" className="supplyplanformulas">{i18n.t('static.UpdateversionSettings.UpdateversionSettings')}</a></span>
                            <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href={this.state.datasetId != -1 && this.state.datasetId != "" && this.state.datasetId != undefined ? "/#/dataSet/buildTree/tree/0/" + this.state.datasetId : "/#/dataSet/buildTree"} className="supplyplanformulas">{i18n.t('static.common.managetree')}</a> {isSiteOnline() && <>{i18n.t('static.tree.or')} <a href="/#/importFromQATSupplyPlan/listImportFromQATSupplyPlan" className='supplyplanformulas'>{i18n.t('static.importFromQATSupplyPlan.importFromQATSupplyPlan')}</a></>}</span>
                        </div>
                    </div>
                    <CardBody className="pb-lg-3 pt-lg-0">
                        <div className="" >
                            <div ref={ref}>
                                <Col md="12 pl-0">
                                    <div className="row">
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenProgramSetting} target="Popover2" trigger="hover" toggle={this.toggleProgramSetting}>
                                                <PopoverBody>{i18n.t('static.common.loadProgramFirst')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover2" onClick={this.toggleProgramSetting} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="forecastProgramId"
                                                        id="forecastProgramId"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.setProgramId(e); }}
                                                        value={this.state.datasetId}
                                                        disabled={this.state.loading}
                                                    >
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {datasets}
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.forecastPeriod')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="text"
                                                        name="forecastPeriod"
                                                        id="forecastPeriod"
                                                        bsSize="sm"
                                                        disabled={true}
                                                        value={this.state.startDateDisplay + ' ~ ' + this.state.endDateDisplay}
                                                    >
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3" style={{ display: 'none' }}>
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.forecastPeriod')}</Label>
                                            <div className="controls edit">
                                                <Picker
                                                    ref="pickRange"
                                                    years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                    value={rangeValue}
                                                    lang={pickerLang}
                                                    onChange={this.handleRangeChange}
                                                    onDismiss={this.handleRangeDissmis}
                                                >
                                                    <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                </Picker>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </Col>
                            </div>
                        </div>
                        {!isSiteOnline() && <Col md="12" className="pl-lg-0">
                            <div>
                                <p>{i18n.t("static.planningUnitSetting.offlineMsg")}</p>
                            </div>
                        </Col>}
                        {!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS') &&
                            <p>
                                {i18n.t('static.versionSettings.note')}:
                                <i>
                                    {i18n.t("static.PUSettingList.notes")}
                                </i>
                            </p>
                        }
                        <div className="UpdatePlanningSettingTable consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                            <div style={{ width: '100%' }} id="tableDiv">
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
                    </CardBody>
                    {
                        this.state.allowAdd &&
                        <CardFooter>
                            {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT_SETTINGS') &&
                                <FormGroup>
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    {this.state.isChanged1 &&
                                        <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    }
                                    {isSiteOnline() && <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.getPlanningUnitList(1)}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                                    &nbsp;
                                </FormGroup>
                            }
                        </CardFooter>
                    }
                </Card>
            </div>
        );
    }
}