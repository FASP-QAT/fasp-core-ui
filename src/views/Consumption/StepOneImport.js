import CryptoJS from 'crypto-js';
import jexcel from 'jspreadsheet';
import moment from "moment";
import React, { Component } from 'react';
import Picker from 'react-month-picker';
import { Prompt } from 'react-router';
import {
    Button,
    FormGroup, Input, InputGroup, Label
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { checkValidation, changed, jExcelLoadedFunction, loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions.js';
import { contrast, makeText } from "../../CommonComponent/JavascriptCommonFunctions";
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ProgramService from '../../api/ProgramService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
/**
 * Component for Import from QAT supply plan step one for the import
 */
export default class StepOneImportMapPlanningUnits extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            mapPlanningUnitEl: '',
            forecastProgramVersionId: 0,
            lang: localStorage.getItem('lang'),
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            selSource: [],
            programs: [],
            programId: '',
            versions: [],
            versionId: '',
            datasetList: [],
            datasetList1: [],
            forecastProgramId: '',
            programPlanningUnitList: [],
            tracerCategoryList: [],
            planningUnitList: [],
            planningUnitListJexcel: [],
            stepOneData: [],
            forecastPlanignUnitListForNotDuplicate: [],
            selectedForecastProgram: '',
            getDatasetFilterList: [],
            selSource1: [],
            isChanged1: false,
            toggleDoNotImport: false
        }
        this.changed = this.changed.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.filterData = this.filterData.bind(this);
        this.getPrograms = this.getPrograms.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        this.setForecastProgramId = this.setForecastProgramId.bind(this);
        this.getDatasetList = this.getDatasetList.bind(this);
        this.getTracerCategoryList = this.getTracerCategoryList.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.getProgramPlanningUnit = this.getProgramPlanningUnit.bind(this);
        this.updatePUs = this.updatePUs.bind(this)
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
     * Reterives the tracer category list
     */
    getTracerCategoryList() {
        DropdownService.getTracerCategoryDropdownList()
            .then(response => {
                this.setState({
                    tracerCategoryList: response.data,
                },
                    () => {
                        this.props.updateStepOneData("loading", false);
                        document.getElementById("stepOneBtn").disabled = true;
                        this.filterData();
                    })
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
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changed = function (instance, cell, x, y, value) {
        changed(instance, cell, x, y, value)
        this.props.removeMessageText && this.props.removeMessageText();
        var selectedPlanningUnitObj = "";
        let ForecastPlanningUnitId = this.el.getValueFromCoords(7, y);
        if (x == 7) {
            if (ForecastPlanningUnitId != -1 && ForecastPlanningUnitId != null && ForecastPlanningUnitId != '') {
                selectedPlanningUnitObj = this.state.planningUnitList.filter(c => c.id == ForecastPlanningUnitId)[0];
                let multiplier = "";
                if (selectedPlanningUnitObj.forecastingUnit.id == this.el.getValueFromCoords(11, y)) {
                    multiplier = (this.el.getValueFromCoords(3, y) / selectedPlanningUnitObj.multiplier)
                }
                this.el.setValueFromCoords(6, y, ForecastPlanningUnitId, true);
                this.el.setValueFromCoords(8, y, selectedPlanningUnitObj.multiplier, true);
                this.el.setValueFromCoords(9, y, multiplier, true);
                this.el.setValueFromCoords(10, y, 0, true);
            } else {
                this.el.setValueFromCoords(6, y, '', true);
                this.el.setValueFromCoords(8, y, '', true);
                this.el.setValueFromCoords(9, y, '', true);
                this.el.setValueFromCoords(10, y, 0, true);
            }
            let tracerCategoryId = this.el.getValueFromCoords(5, y);
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("H").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(budgetRegx.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.spacetext'));
                } else if (ForecastPlanningUnitId != -1 && ForecastPlanningUnitId != null && ForecastPlanningUnitId != '' && tracerCategoryId != selectedPlanningUnitObj.forecastingUnit.tracerCategory.id) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.common.tracerCategoryInvalidSelection'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 9) {
            let ForecastPlanningUnitId = this.el.getValueFromCoords(7, y);
            var col = ("J").concat(parseInt(y) + 1);
            value = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE
            if (ForecastPlanningUnitId != -1) {
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.usagePeriod.conversionTOFUTest'));
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
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (!this.state.isChanged1) {
            this.setState({
                isChanged1: true,
            });
        }
    }
    /**
     * Calls getPrograms function on component mount
     */
    componentDidMount() {
        this.getPrograms();
    }
    /**
     * Reterives the forecast programs from indexed db
     */
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
                    var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                    var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                    var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson1 = JSON.parse(programData);
                    let filterForcastUnitObj = programJson1.planningUnitList.filter(ele => ele.active && ele.consuptionForecast);
                    let dupForecastingUnitObj = filterForcastUnitObj.map(ele => ele.planningUnit.forecastingUnit);
                    const ids = dupForecastingUnitObj.map(o => o.id)
                    const filtered = dupForecastingUnitObj.filter(({ id }, index) => !ids.includes(id, index + 1))
                    let dupPlanningUnitObjwithNull = filterForcastUnitObj.map(ele => ele.planningUnit);
                    let dupPlanningUnitObj = dupPlanningUnitObjwithNull.filter(c => c != null);
                    const idsPU = dupPlanningUnitObj.map(o => o.id)
                    const filteredPU = dupPlanningUnitObj.filter(({ id }, index) => !idsPU.includes(id, index + 1))
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
                        actualConsumptionList: programJson1.actualConsumptionList,
                        filteredForecastingUnit: filtered,
                        filteredPlanningUnit: filteredPU,
                        regionList: programJson1.regionList,
                        label: programJson1.label,
                        realmCountry: programJson1.realmCountry,
                    });
                    datasetList1.push(filteredGetRequestList[i])
                }
                datasetList = datasetList.sort(function (a, b) {
                    a = a.programCode.toLowerCase();
                    b = b.programCode.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                this.setState({
                    datasetList: datasetList,
                    datasetList1: datasetList1
                }, () => {
                    this.getTracerCategoryList();
                })
                this.props.updateStepOneData("datasetList", datasetList);
                this.props.updateStepOneData("datasetList1", datasetList1);
            }.bind(this);
        }.bind(this);
    }
    /**
     * Reterives supply plan programs from server
     */
    getPrograms() {
        let realmId = AuthenticationService.getRealmId();
        DropdownService.getProgramBasedOnRealmIdAndProgramTypeId(realmId, PROGRAM_TYPE_SUPPLY_PLAN)
            .then(response => {
                this.setState({
                    programs: response.data,
                    loading: false
                }, () => {
                    this.getDatasetList();
                })
                this.props.updateStepOneData("programs", response.data);
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
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleRangeDissmis(value) {
        this.setState({
            rangeValue: value
        }, () => {
            this.filterData();
        })
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    /**
     * Reterives planning unit list based on program and version Id
     */
    filterData() {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let forecastProgramId = document.getElementById("forecastProgramId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        if (versionId != 0 && programId > 0 && forecastProgramId > 0) {
            let selectedSupplyPlanProgram = this.state.programs.filter(c => c.id == programId)[0];
            let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == forecastProgramId && c.versionId == this.state.forecastProgramVersionId)[0];
            if (selectedSupplyPlanProgram.realmCountry.id == selectedForecastProgram.realmCountry.realmCountryId) {
                this.props.updateStepOneData("loading", true);
                this.props.updateStepOneData("programId", programId);
                this.props.updateStepOneData("versionId", versionId);
                this.props.updateStepOneData("forecastProgramId", forecastProgramId);
                this.props.updateStepOneData("startDate", startDate);
                this.props.updateStepOneData("stopDate", stopDate);
                document.getElementById("stepOneBtn").disabled = false;
                let tracerCategory = [];
                ProgramService.getPlanningUnitByProgramId(programId, tracerCategory)
                    .then(response => {
                        if (response.status == 200) {
                            this.setState({
                                programPlanningUnitList: response.data,
                                selSource: response.data,
                                message: ''
                            }, () => {
                                if (response.data.length == 0) {
                                    document.getElementById("stepOneBtn").disabled = true;
                                }
                                this.getProgramPlanningUnit();
                            })
                        } else {
                            this.setState({
                                programPlanningUnitList: []
                            });
                        }
                    }).catch(
                        error => {
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                    loading: false, color: 'red'
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
                                            loading: false, color: 'red'
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: error.response.data.messageCode,
                                            loading: false, color: 'red'
                                        });
                                        break;
                                    default:
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false, color: 'red'
                                        });
                                        break;
                                }
                            }
                        }
                    );
            } else {
                this.setState({
                    message: i18n.t('static.importFromQATSupplyPlan.belongsSameCountry'),
                    color: 'red'
                },
                    () => {
                    })
            }
        } else if (programId == 0) {
            this.setState({
                programPlanningUnitList: [],
                selSource: [],
                message: i18n.t('static.importFromQATSupplyPlan.selectSupplyPlanProgram'),
            })
            jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
            document.getElementById("stepOneBtn").disabled = true;
        } else if (versionId == 0) {
            this.setState({
                programPlanningUnitList: [],
                selSource: [],
                message: i18n.t('static.importFromQATSupplyPlan.pleaseSelectSupplyPlanVersion'),
            })
            jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
            document.getElementById("stepOneBtn").disabled = true;
        } else if (forecastProgramId == 0) {
            this.setState({
                programPlanningUnitList: [],
                selSource: [],
                message: i18n.t('static.importFromQATSupplyPlan.pleaseSelectForecastProgram'),
            })
            jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
            document.getElementById("stepOneBtn").disabled = true;
        } else {
            this.setState({
                programPlanningUnitList: [],
                selSource: [],
                message: ''
            })
            jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
            document.getElementById("stepOneBtn").disabled = true;
        }
    }
    /**
     * Reterives forecast planning unit list based on forecast program
     */
    getProgramPlanningUnit() {
        let versionId = this.state.forecastProgramVersionId;
        let forecastProgramId = document.getElementById("forecastProgramId").value;
        let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == forecastProgramId && c.versionId == versionId)[0];
        if (selectedForecastProgram.filteredPlanningUnit != undefined) {
            var planningUnitListFilter = selectedForecastProgram.filteredPlanningUnit
            var listArray = planningUnitListFilter;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            let tempList = [];
            if (listArray.length > 0) {
                for (var i = 0; i < listArray.length; i++) {
                    var paJson = {
                        name: getLabelText(listArray[i].label, this.state.lang) + ' | ' + parseInt(listArray[i].id),
                        id: parseInt(listArray[i].id),
                        multiplier: listArray[i].multiplier,
                        active: listArray[i].active,
                        forecastingUnit: listArray[i].forecastingUnit
                    }
                    tempList[i] = paJson
                }
            }
            tempList.unshift({
                name: i18n.t('static.quantimed.doNotImport'),
                id: -1,
                multiplier: 1,
                active: true,
                forecastingUnit: []
            });
            this.setState({
                planningUnitList: planningUnitListFilter,
                planningUnitListJexcel: tempList
            }, () => {
                this.props.updateStepOneData("planningUnitListJexcel", tempList);
                this.props.updateStepOneData("planningUnitList", planningUnitListFilter);
                this.props.updateStepOneData("loading", false);
                this.buildJexcel();
            });
        } else {
            this.setState({
                planningUnitList: []
            });
        }
    }
    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];
        let forecastPlanignUnitListForNotDuplicate = [];
        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                let planningUnitObj = this.state.planningUnitList.filter(c => c.id == papuList[j].id)[0];
                data = [];
                data[0] = getLabelText(papuList[j].forecastingUnit.tracerCategory.label, this.state.lang)
                data[1] = papuList[j].id
                data[2] = getLabelText(papuList[j].label, this.state.lang) + ' | ' + papuList[j].id
                data[3] = papuList[j].multiplier
                data[4] = papuList[j].forecastingUnit.id
                data[5] = papuList[j].forecastingUnit.tracerCategory.id
                let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == document.getElementById("forecastProgramId").value)[0];
                let filteredPlanningUnit = selectedForecastProgram.filteredPlanningUnit;
                let match = filteredPlanningUnit.filter(c => c.id == papuList[j].id);
                if (match.length > 0) {
                    data[6] = papuList[j].id
                    data[7] = getLabelText(papuList[j].label, this.state.lang) + ' | ' + papuList[j].id
                    data[8] = papuList[j].multiplier
                    data[9] = 1
                    data[10] = 1
                    forecastPlanignUnitListForNotDuplicate.push({
                        supplyPlanPlanningUnitId: papuList[j].id,
                        forecastPlanningUnitId: papuList[j].id
                    });
                } else {
                    data[6] = ''
                    data[7] = ''
                    data[8] = ''
                    data[9] = ''
                    data[10] = ''
                }
                data[11] = planningUnitObj != undefined ? planningUnitObj.forecastingUnit.id : ""
                papuDataArr[count] = data;
                count++;
            }
        }
        jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
        jexcel.destroy(document.getElementById("mapRegion"), true);
        jexcel.destroy(document.getElementById("mapImport"), true);
        var papuList1 = this.state.selSource1;
        var data;
        if (papuList1 != "") {
            data = papuList1
        } else {
            data = papuDataArr
        }
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [50, 50, 100, 100, 100, 100, 50, 100, 50],
            columns: [
                {
                    title: i18n.t('static.tracercategory.tracercategory'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Supply Plan Planning Unit Id',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.supplyPlanPlanningUnit'),
                    type: 'text',
                    readOnly: true,
                },
                {
                    title: 'multiplier',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'forecastingUnitId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'tracerCategoryId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'Forecast Planning Unit Id',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.forecastPlanningUnit'),
                    type: 'autocomplete',
                    source: this.state.planningUnitListJexcel,
                    required: true,
                    regex: {
                        ex: /^\S+(?: \S+)*$/,
                        text: i18n.t('static.message.spacetext')
                    }
                },
                {
                    title: 'ForecastMultiplier',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.conversionFactor'),
                    type: 'numeric',
                    decimal: '.',
                    textEditor: true,
                },
                {
                    title: 'Match',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'Supply plan Forcast unit id',
                    type: 'hidden',
                    readOnly: true
                }
            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el;
                    elInstance.setStyle(`C${parseInt(y) + 1}`, 'text-align', 'left');
                    var rowData = elInstance.getRowData(y);
                    var match = rowData[10];
                    if (match == 1 || rowData[1] == rowData[7]) {
                        var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    }
                    var doNotImport = rowData[7];
                    if (doNotImport == -1) {
                        elInstance.setStyle(`H${parseInt(y) + 1}`, 'background-color', 'transparent');
                        elInstance.setStyle(`H${parseInt(y) + 1}`, 'background-color', '#f48282');
                        let textColor = contrast('#f48282');
                        elInstance.setStyle(`H${parseInt(y) + 1}`, 'color', textColor);
                        var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                        elInstance.setComments(`J${parseInt(y) + 1}`, "");
                    } else {
                    }
                }
            }.bind(this),
            pagination: 5000000,
            filters: true,
            search: true,
            columnSorting: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            onchange: this.changed,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            onload: loadedForNonEditableTables,
            editable: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this)
        };
        this.el = jexcel(document.getElementById("mapPlanningUnit"), options);
        this.setState({
            loading: false,
            forecastPlanignUnitListForNotDuplicate: forecastPlanignUnitListForNotDuplicate
        })
        this.props.updateStepOneData("loading", false);
    }
    /**
     * Filters planning unit list based on tracer category
     */
    filterPlanningUnitBasedOnTracerCategory = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson(null, false)[r])[5];
        var mylist = this.state.planningUnitListJexcel;
        let filteredPlanningUnit = this.state.selectedForecastProgram.filteredPlanningUnit;
        let mylistTemp = [];
        mylistTemp.push(mylist[0]);
        for (var i = 0; i < filteredPlanningUnit.length; i++) {
            var filterList = mylist.filter(c => c.id == filteredPlanningUnit[i].id)[0];
            if (filterList != undefined) {
                mylistTemp.push(filterList);
            }
        }
        mylist = mylistTemp;
        if (value > 0) {
            mylist = mylist.filter(c => (c.id == -1 ? c : c.forecastingUnit.tracerCategory.id == value && c.active == "true"));
        }
        return mylist;
    }.bind(this)
    /**
     * Sets the program id in the component state on change and builds data accordingly.
     */
    setProgramId(event) {
        this.setState({
            programId: event.target.value,
            versionId: '',
            forecastProgramId: '',
            selSource1: []
        }, () => {
            this.filterVersion();
            this.filterForcastUnit();
            this.filterData();
        })
    }
    /**
     * Filters versions based on program
     */
    filterVersion = () => {
        let programId = this.state.programId;
        if (programId != 0) {
            this.setState({
                versions: [],
            }, () => {
                DropdownService.getVersionListForProgram(PROGRAM_TYPE_SUPPLY_PLAN, programId)
                    .then(response => {
                        this.setState({
                            versions: []
                        }, () => {
                            this.setState({
                                versions: (response.data.filter(function (x, i, a) {
                                    return a.indexOf(x) === i;
                                })).reverse()
                            }, () => { });
                        });
                    }).catch(
                        error => {
                            this.setState({
                                programs: [], loading: false
                            })
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
            });
        } else {
            this.setState({
                versions: [],
            }, () => { })
        }
    }
    /**
     * Filters the dataset list based on the selected program ID and updates the state accordingly.
     */
    filterForcastUnit = () => {
        let programId = this.state.programId;
        if (programId != 0) {
            const countryId = this.state.programs.filter(c => c.id == programId)[0].realmCountry.id;
            this.state.getDatasetFilterList = this.state.datasetList
            var datasetlist = this.state.getDatasetFilterList.filter(c => c.realmCountry.realmCountryId == countryId);
            this.setState({
                data: [],
            }, () => {
                this.setState({
                    getDatasetFilterList: (datasetlist.filter(function (x, i, a) {
                        return a.indexOf(x) === i;
                    })).reverse()
                }, () => { });
            });
        } else {
            this.setState({
                getDatasetFilterList: [],
            }, () => { })
        }
    }
    /**
     * Sets the version id in the component state on change and builds data accordingly.
     */
    setVersionId(event) {
        this.setState({
            versionId: event.target.value
        }, () => {
            this.filterData();
        })
    }
    /**
     * Handles the selection of a forecast program ID and updates the state accordingly.
     * @param {Object} event The event object containing information about the selected forecast program ID.
     */
    setForecastProgramId(event) {
        var forecastProgramId = event.target.value;
        if (forecastProgramId != "" && forecastProgramId != 0) {
            var sel = document.getElementById("forecastProgramId");
            var tempId = sel.options[sel.selectedIndex].text;
            let forecastProgramVersionId = tempId.split('~')[1];
            let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == event.target.value && c.versionId == forecastProgramVersionId)[0]
            let startDateSplit = selectedForecastProgram.forecastStartDate.split('-');
            let forecastStopDate = new Date('01-' + selectedForecastProgram.forecastStartDate);
            forecastStopDate.setMonth(forecastStopDate.getMonth() - 1);
            this.setState({
                forecastProgramId: event.target.value,
                rangeValue: { from: { year: startDateSplit[1] - 3, month: new Date('01-' + selectedForecastProgram.forecastStartDate).getMonth() + 1 }, to: { year: forecastStopDate.getFullYear(), month: forecastStopDate.getMonth() + 1 } },
                forecastProgramVersionId: forecastProgramVersionId,
                selectedForecastProgram: selectedForecastProgram
            }, () => {
                this.props.updateStepOneData("forecastProgramVersionId", forecastProgramVersionId);
                this.filterData();
            })
        } else {
            var dt = new Date();
            dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
            var dt1 = new Date();
            dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
            this.setState({
                forecastProgramId: event.target.value,
                rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
                forecastProgramVersionId: 0,
                selectedForecastProgram: '',
            }, () => {
                jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
            })
        }
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        valid = checkValidation(this.el);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(7, y);
            var tracerCategoryId = this.el.getValueFromCoords(5, y);
            if (value != -1) {
                var selectedPlanningUnitObj = this.state.planningUnitList.filter(c => c.id == value)[0];
                var col = ("H").concat(parseInt(y) + 1);
                if (tracerCategoryId != selectedPlanningUnitObj.forecastingUnit.tracerCategory.id) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.common.tracerCategoryInvalidSelection'));
                    valid = false;
                } else {
                    for (var i = (json.length - 1); i >= 0; i--) {
                        var map = new Map(Object.entries(json[i]));
                        var planningUnitValue = map.get("7");
                        if (planningUnitValue == value && y != i && i > y) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                            i = -1;
                            valid = false;
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }
                var col = ("J").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(9, y);
                var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.planningUnitSetting.max10Digit4AfterDecimal'));
                        valid = false;
                    } else {
                        if (isNaN(Number.parseInt(value)) || value <= 0) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.program.validvaluetext'));
                            valid = false;
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }
            }
        }
        return valid;
    }
    /**
     * Saves the data in the form of json
     */
    formSubmit = function () {
        var validation = this.checkValidation();
        if (validation == true) {
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                let json = {
                    supplyPlanPlanningUnitId: parseInt(map1.get("1")),
                    forecastPlanningUnitId: parseInt(map1.get("7")),
                    multiplier: map1.get("9").toString().replace(/,/g, ""),
                }
                changedpapuList.push(json);
            }
            this.setState({
                stepOneData: changedpapuList,
                selSource1: tableJson
            }, () => {
                this.props.finishedStepOne();
            })
            this.props.updateStepOneData("stepOneData", changedpapuList);
            this.props.updateStepOneData("selSource1", tableJson);
        } else {
        }
    }
    /**
         * Sets the state to toggle do not import flag.
         * @param {Event} e - The change event.
         * @returns {void}
         */
    setToggleDoNotImport(e) {
        this.props.updateStepOneData("loading", true);
        this.setState({
            toggleDoNotImport: e.target.checked,
            loading:true
        }, () => {
            this.updatePUs()
        })
    }
    updatePUs() {
        var tableJson = this.el.getJson(null, false);
        if (this.state.toggleDoNotImport) {
            for (var i = 0; i < tableJson.length; i++) {
                var rowData = this.el.getRowData(i);
                if (rowData[7] === "") {
                    this.el.setValueFromCoords(7, parseInt(i), -1, true);
                }
            }
        } else {
            for (var i = 0; i < tableJson.length; i++) {
                var rowData = this.el.getRowData(i);
                if (rowData[7] === -1) {
                    this.el.setValueFromCoords(7, parseInt(i), "", true);
                }
            }
        }
    }
    /**
     * Renders the import from QAT supply plan step one screen.
     * @returns {JSX.Element} - Import from QAT supply plan step one screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { rangeValue } = this.state
        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {item.code}
                    </option>
                )
            }, this);
        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)} ({(moment(item.createdDate).format(`MMM DD YYYY`))})
                    </option>
                )
            }, this);
        const { getDatasetFilterList } = this.state;
        let datasets = getDatasetFilterList.length > 0
            && getDatasetFilterList.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {item.programCode + '~' + item.versionId}
                    </option>
                )
            }, this);
        return (
            <>
                <Prompt
                    when={this.state.isChanged1 == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div12">{this.state.message}</h5>
                <div style={{ display: this.props.items.loading ? "none" : "block" }} >
                    <div className="row ">
                        <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.supplyPlanProgram')}</Label>
                            <div className="controls ">
                                <InputGroup>
                                    <Input
                                        type="select"
                                        name="programId"
                                        id="programId"
                                        bsSize="sm"
                                        onChange={(e) => { this.setProgramId(e); }}
                                        value={this.state.programId}
                                    >
                                        <option value="0">{i18n.t('static.common.select')}</option>
                                        {programList}
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>
                        <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.supplyPlanVersion')}</Label>
                            <div className="controls">
                                <InputGroup>
                                    <Input
                                        type="select"
                                        name="versionId"
                                        id="versionId"
                                        bsSize="sm"
                                        onChange={(e) => { this.setVersionId(e); }}
                                        value={this.state.versionId}
                                    >
                                        <option value="0">{i18n.t('static.common.select')}</option>
                                        {versionList}
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>
                        <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.forecastProgram')}</Label>
                            <div className="controls ">
                                <InputGroup>
                                    <Input
                                        type="select"
                                        name="forecastProgramId"
                                        id="forecastProgramId"
                                        bsSize="sm"
                                        onChange={(e) => { this.setForecastProgramId(e); }}
                                        value={this.state.forecastProgramId}
                                    >
                                        <option value="0">{i18n.t('static.common.select')}</option>
                                        {datasets}
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>
                        <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.Range')}<span className="stock-box-icon fa fa-sort-desc"></span></Label>
                            <div className="controls  Regioncalender">
                                <Picker
                                    ref="pickRange"
                                    years={{ min: this.state.minDate, max: this.state.maxDate }}
                                    value={rangeValue}
                                    lang={pickerLang}
                                    key={JSON.stringify(rangeValue)}
                                    onDismiss={this.handleRangeDissmis}
                                >
                                    <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                </Picker>
                            </div>
                        </FormGroup>
                        {this.state.selSource != undefined && this.state.selSource.length != 0 && <FormGroup className="col-md-2" style={{ "marginLeft": "20px", "marginTop": "28px" }}>
                            <Input
                                className="form-check-input"
                                type="checkbox"
                                id="toggleDoNotImport"
                                name="toggleDoNotImport"
                                checked={this.state.toggleDoNotImport}
                                onClick={(e) => { this.setToggleDoNotImport(e); }}
                            />
                            <Label
                                className="form-check-label"
                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                {i18n.t('static.import.doNoImportCheckbox')}
                            </Label>
                        </FormGroup>}
                    </div>
                </div>
                <div className="consumptionDataEntryTable">
                    <div id="mapPlanningUnit" className='TableWidth100' style={{ display: this.props.items.loading ? "none" : "block", width: '100%' }} >
                    </div>
                    <FormGroup>
                        <Button color="info" size="md" className="float-right mr-1" id="stepOneBtn" type="submit" onClick={() => this.formSubmit()} >{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                    </FormGroup>
                </div>
                <div style={{ display: this.props.items.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status">
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}