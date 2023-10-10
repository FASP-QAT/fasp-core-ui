import CryptoJS from 'crypto-js';
import jexcel from 'jspreadsheet';
import moment from "moment";
import React, { Component } from 'react';
import Picker from 'react-month-picker';
import {
    Button,
    FormGroup, Input, InputGroup,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Popover, PopoverBody
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import listImportIntoQATSupplyPlanEn from '../../../src/ShowGuidanceFiles/listImportIntoQATSupplyPlanEn.html';
import listImportIntoQATSupplyPlanFr from '../../../src/ShowGuidanceFiles/listImportIntoQATSupplyPlanFr.html';
import listImportIntoQATSupplyPlanPr from '../../../src/ShowGuidanceFiles/listImportIntoQATSupplyPlanPr.html';
import listImportIntoQATSupplyPlanSp from '../../../src/ShowGuidanceFiles/listImportIntoQATSupplyPlanSp.html';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, FORECAST_DATEPICKER_MONTH_DIFF, FORECAST_DATEPICKER_START_MONTH, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, SECRET_KEY } from '../../Constants.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProgramService from '../../api/ProgramService';
import TracerCategoryService from "../../api/TracerCategoryService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
export default class StepOneImportMapPlanningUnits extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - FORECAST_DATEPICKER_START_MONTH);
        this.state = {
            popoverOpenProgramSetting: false,
            mapPlanningUnitEl: '',
            lang: localStorage.getItem('lang'),
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
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
            regionList: [],
            supplyPlanPlanningUnitIds: [],
            forecastPlanignUnitListForNotDuplicate: [],
            supplyPlanPlanignUnitListForNotDuplicate: [],
            programObj: [],
            programListFilter: [],
            forecastPeriod: '',
            selSource1: [],
            selectedForecastProgramDesc: '',
        }
        this.changed = this.changed.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.filterData = this.filterData.bind(this);
        this.getPrograms = this.getPrograms.bind(this);
        this.getProgramDetails = this.getProgramDetails.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        this.setForecastProgramId = this.setForecastProgramId.bind(this);
        this.getDatasetList = this.getDatasetList.bind(this);
        this.getTracerCategoryList = this.getTracerCategoryList.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.toggleProgramSetting = this.toggleProgramSetting.bind(this);
    }
    toggleProgramSetting() {
        this.setState({
            popoverOpenProgramSetting: !this.state.popoverOpenProgramSetting,
        });
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div12').style.display = 'none';
        }, 30000);
    }
    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }
    getPlanningUnitList(value) {
        if (value != 0) {
            localStorage.setItem("sesProgramId", value);
            var db1;
            var storeOS;
            var supplyPlanRegionList = [];
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: '#BA0C2F'
                })
                this.hideFirstComponent()
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                var programDataOs = programDataTransaction.objectStore('programData');
                var programRequest = programDataOs.get(value != "" && value != undefined ? value : 0);
                programRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: '#BA0C2F'
                    })
                    this.hideFirstComponent()
                }.bind(this);
                programRequest.onsuccess = function (e) {
                    var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    for (var i = 0; i < programJson.regionList.length; i++) {
                        var regionJson = {
                            name: getLabelText(programJson.regionList[i].label, this.state.lang),
                            id: programJson.regionList[i].regionId,
                            label: programJson.regionList[i].label
                        }
                        supplyPlanRegionList.push(regionJson)
                    }
                    var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                    var planningunitRequest = planningunitOs.getAll();
                    var planningList = []
                    planningunitRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            color: '#BA0C2F'
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    planningunitRequest.onsuccess = function (e) {
                        var planningunitUnitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                        var planningunitUnitOs = planningunitUnitTransaction.objectStore('planningUnit');
                        var planningunitUnitRequest = planningunitUnitOs.getAll();
                        planningunitUnitRequest.onsuccess = function (e) {
                            var planningUnitListFromtable = planningunitUnitRequest.result;
                            var myResult = [];
                            var programId = (value != "" && value != undefined ? value : 0).split("_")[0];
                            myResult = planningunitRequest.result.filter(c => c.program.id == programId && c.active == true);
                            let tempList = [];
                            if (myResult.length > 0) {
                                for (var i = 0; i < myResult.length; i++) {
                                    var paJson = {
                                        name: getLabelText(myResult[i].planningUnit.label, this.state.lang) + ' | ' + parseInt(myResult[i].planningUnit.id),
                                        id: parseInt(myResult[i].planningUnit.id),
                                        multiplier: myResult[i].multiplier,
                                        active: myResult[i].active,
                                        forecastingUnit: myResult[i].forecastingUnit,
                                        tracerCategoryId: planningUnitListFromtable.filter(c => c.planningUnitId == myResult[i].planningUnit.id)[0].forecastingUnit.tracerCategory.id
                                    }
                                    tempList[i] = paJson
                                }
                            }
                            tempList = tempList.sort(function (a, b) {
                                a = a.name.toLowerCase();
                                b = b.name.toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            })
                            tempList.unshift({
                                name: i18n.t('static.quantimed.doNotImport'),
                                id: -1,
                                multiplier: 1,
                                active: true,
                                forecastingUnit: []
                            });
                            tempList.unshift({
                                name: "No Forecast Selected",
                                id: -2,
                                multiplier: 1,
                                active: true,
                                forecastingUnit: []
                            });
                            tempList.unshift({
                                name: "Forecast is blank",
                                id: -3,
                                multiplier: 1,
                                active: true,
                                forecastingUnit: []
                            });
                            this.setState({
                                planningUnitList: myResult,
                                planningUnitListAll: myResult,
                                generalProgramJson: programJson,
                                supplyPlanRegionList: supplyPlanRegionList.sort(function (a, b) {
                                    a = a.name.toLowerCase();
                                    b = b.name.toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }), loading: false,
                                planningUnitListJexcel: tempList
                            }, () => {
                                this.filterData(true);
                            })
                        }.bind(this);
                    }.bind(this);
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                planningUnitList: [],
                loading: false
            })
        }
    }
    getTracerCategoryList() {
        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                this.setState({
                    tracerCategoryList: response.data,
                },
                    () => {
                        this.getPlanningUnitList();
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
    changed = function (instance, cell, x, y, value) {
        this.props.removeMessageText && this.props.removeMessageText();
        if (x == 2) {
            let supplyPlanPlanningUnitId = this.el.getValueFromCoords(2, y);
            if (supplyPlanPlanningUnitId != -1 && supplyPlanPlanningUnitId != null && supplyPlanPlanningUnitId != '') {
                var selectedPlanningUnitObj = this.state.planningUnitList.filter(c => c.planningUnit.id == supplyPlanPlanningUnitId)[0];
                let multiplier = "";
                if (selectedPlanningUnitObj.forecastingUnit.id == this.el.getValueFromCoords(7, y)) {
                    multiplier = (this.el.getValueFromCoords(3, y) / selectedPlanningUnitObj.multiplier).toFixed(6)
                }
                this.el.setValueFromCoords(3, y, multiplier, true);
            } else {
                this.el.setValueFromCoords(3, y, '', true);
            }
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
        if (x == 3) {
            let supplyPlanUnitId = this.el.getValueFromCoords(2, y);
            var col = ("D").concat(parseInt(y) + 1);
            value = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = /^\d{1,6}(\.\d{1,6})?$/;
            if (supplyPlanUnitId != -1) {
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
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    componentDidMount() {
        document.getElementById("stepOneBtn").disabled = true;
        this.getProgramDetails();
    }
    getDatasetList() {
        ProgramService.getDataSetList().then(response => {
            if (response.status == 200) {
                var responseData = response.data;
                var datasetList = [];
                for (var rd = 0; rd < responseData.length; rd++) {
                    var json = {
                        programCode: responseData[rd].programCode,
                        programVersion: responseData[rd].version,
                        programId: responseData[rd].programId,
                        versionId: responseData[rd].version,
                        id: responseData[rd].id,
                        loading: false,
                        forecastStartDate: (responseData[rd].currentVersion.forecastStartDate ? moment(responseData[rd].currentVersion.forecastStartDate).format(`MMM-YYYY`) : ''),
                        forecastStopDate: (responseData[rd].currentVersion.forecastStopDate ? moment(responseData[rd].currentVersion.forecastStopDate).format(`MMM-YYYY`) : ''),
                        healthAreaList: responseData[rd].healthAreaList,
                        actualConsumptionList: responseData[rd].actualConsumptionList,
                        forecastRegionList: responseData[rd].regionList,
                        label: responseData[rd].label,
                        realmCountry: responseData[rd].realmCountry,
                        versionList: responseData[rd].versionList,
                    }
                    datasetList.push(json);
                }
                this.setState({
                    datasetList: datasetList.sort(function (a, b) {
                        a = a.programCode.toLowerCase();
                        b = b.programCode.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    }),
                    loading: false
                }, () => {
                    this.props.updateStepOneData("datasetList", datasetList);
                    this.props.updateStepOneData("loading", false);
                })
            } else {
                this.setState({
                    message: response.data.messageCode, loading: false
                }, () => {
                    this.hideSecondComponent();
                })
            }
        }).catch(
            error => {
            }
        );
    }
    getProgramDetails() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();
            var programs = [];
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                var filteredGetRequestList = myResult.filter(c => c.userId == userId);
                for (var i = 0; i < filteredGetRequestList.length; i++) {
                    var programDataBytes = CryptoJS.AES.decrypt(filteredGetRequestList[i].programData.generalData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    programs.push({
                        programCode: filteredGetRequestList[i].programCode,
                        programVersion: filteredGetRequestList[i].version,
                        programId: filteredGetRequestList[i].programId,
                        id: filteredGetRequestList[i].id,
                        generalProgramJson: programJson,
                        loading: false,
                    });
                }
                this.setState({
                    programs: programs,
                    loading: false
                }, () => {
                    this.getDatasetList();
                })
                this.props.updateStepOneData("programs", programs);
            }.bind(this);
        }.bind(this);
    }
    getPrograms(value) {
        if (value != 0) {
            var programId = value.split("_")[0];
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: '#BA0C2F'
                })
                this.hideFirstComponent()
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var programDataTransaction1 = db1.transaction(['program'], 'readwrite');
                var programDataOs1 = programDataTransaction1.objectStore('program');
                var programRequest1 = programDataOs1.get(programId != "" && programId != undefined ? Number(programId) : 0);
                programRequest1.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: '#BA0C2F'
                    })
                    this.hideFirstComponent()
                }.bind(this);
                programRequest1.onsuccess = function (e) {
                    var myResult = [];
                    myResult = programRequest1.result;
                    this.setState({
                        programObj: myResult,
                        loading: false
                    })
                }.bind(this);
            }.bind(this)
        } else {
            this.setState({
                programObj: [],
                loading: false
            })
        }
    }
    handleRangeChange(value, text, listIndex) {
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value },
            () => {
                this.filterData(false);
            })
    }
    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    filterData(loadJexcel) {
        this.setState({
            loading: true
        })
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let forecastProgramId = document.getElementById("forecastProgramId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        var programIdSplit = programId != 0 ? programId.split("_")[0] : 0;
        if (versionId != 0 && programIdSplit > 0 && forecastProgramId > 0 && (this.state.rangeValue.from.year != '' && this.state.rangeValue.from.month != '' && this.state.rangeValue.to.year != '' && this.state.rangeValue.to.month != '')) {
            let selectedSupplyPlanProgram = this.state.programObj;
            let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == forecastProgramId && c.versionId == this.state.forecastProgramVersionId)[0];
            if (selectedSupplyPlanProgram.realmCountry.realmCountryId == selectedForecastProgram.realmCountry.realmCountryId) {
                this.props.updateStepOneData("programId", programId);
                this.props.updateStepOneData("versionId", versionId);
                this.props.updateStepOneData("forecastProgramId", forecastProgramId);
                this.props.updateStepOneData("startDate", startDate);
                this.props.updateStepOneData("stopDate", stopDate);
                if (loadJexcel || loadJexcel == undefined) {
                    PlanningUnitService.getPlanningUnitListByProgramVersionIdForSelectedForecastMap(forecastProgramId, versionId)
                        .then(response => {
                            if (response.status == 200) {
                                var planningUnitList = response.data.filter(c => c.active)
                                this.setState({
                                    programPlanningUnitList: planningUnitList,
                                    selSource: planningUnitList,
                                    message: ''
                                }, () => {
                                    if (planningUnitList.length == 0) {
                                        document.getElementById("stepOneBtn").disabled = true;
                                    }
                                    this.buildJexcel();
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
                }
            } else {
                this.setState({
                    message: i18n.t('static.importFromQATSupplyPlan.belongsSameCountry'),
                    color: 'red',
                    loading: false
                },
                    () => {
                    })
            }
        } else if (forecastProgramId == 0) {
            this.setState({
                programPlanningUnitList: [],
                selSource: [],
                message: i18n.t('static.importFromQATSupplyPlan.pleaseSelectForecastProgram'),
                loading: false
            })
            this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
            jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
            document.getElementById("stepOneBtn").disabled = true;
        } else if (versionId == 0) {
            this.setState({
                programPlanningUnitList: [],
                selSource: [],
                message: i18n.t('static.importIntoQATSupplyPlan.pleaseSelectForecastProgramVersion'),
                loading: false
            })
            this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
            jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
            document.getElementById("stepOneBtn").disabled = true;
        } else if (programId == 0) {
            this.setState({
                programPlanningUnitList: [],
                selSource: [],
                message: i18n.t('static.importFromQATSupplyPlan.selectSupplyPlanProgram'),
                loading: false
            })
            this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
            jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
            document.getElementById("stepOneBtn").disabled = true;
        } else {
            this.setState({
                programPlanningUnitList: [],
                selSource: [],
                message: '',
                loading: false
            })
            this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
            jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
            document.getElementById("stepOneBtn").disabled = true;
        }
    }
    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];
        var count = 0;
        var myVar = "";
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                let planningUnitObj = null;
                planningUnitObj = this.state.planningUnitList.filter(c => c.planningUnit.id == papuList[j].planningUnit.id)[0];
                let totalForecast = 0;
                let check = (Object.keys(papuList[j].selectedForecastMap).length == 0)
                let check1 = (Object.keys(papuList[j].selectedForecastMap).map(c => totalForecast += papuList[j].selectedForecastMap[c].totalForecast))
                let isForecastBlank = (!check && totalForecast == 0)
                data = [];
                data[0] = getLabelText(papuList[j].planningUnit.forecastingUnit.tracerCategory.label, this.state.lang)
                data[1] = getLabelText(papuList[j].planningUnit.label, this.state.lang) + ' | ' + papuList[j].planningUnit.id
                data[2] = (check ? "-2" : (isForecastBlank ? "-3" : (planningUnitObj != undefined ? planningUnitObj.planningUnit.id : "")))
                data[3] = (check ? "" : (isForecastBlank ? "" : (planningUnitObj != undefined ? planningUnitObj.multiplier / papuList[j].planningUnit.multiplier : "")))
                data[4] = ""
                data[5] = papuList[j].planningUnit.forecastingUnit.tracerCategory.id
                data[6] = papuList[j].planningUnit.id
                data[7] = Object.keys(papuList[j].selectedForecastMap).length == 0 ? true : false
                data[8] = isForecastBlank ? true : false
                papuDataArr[count] = data;
                count++;
            }
        }
        this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
        jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
        this.el = jexcel(document.getElementById("mapRegion"), '');
        jexcel.destroy(document.getElementById("mapRegion"), true);
        this.el = jexcel(document.getElementById("mapImport"), '');
        jexcel.destroy(document.getElementById("mapImport"), true);
        var json = [];
        var papuList11 = this.state.selSource1;
        var data;
        if (papuList11 != "") {
            data = papuList11
        } else {
            data = papuDataArr
        }
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [50, 100, 100, 100, 100, 50],
            columns: [
                {
                    title: i18n.t('static.importIntoQAT.forecastTracerCategory'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.forecastPlanningUnit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.supplyPlanPlanningUnit'),
                    type: 'autocomplete',
                    source: this.state.planningUnitListJexcel,
                    filter: this.filterPlanningUnitBasedOnTracerCategory
                },
                {
                    title: i18n.t('static.importIntoQATSupplyPlan.conversionFactor'),
                    type: 'numeric',
                    decimal: '.',
                    textEditor: true,
                },
                {
                    title: 'Id',
                    type: 'hidden',
                },
                {
                    title: 'Id',
                    type: 'hidden',
                },
                {
                    title: 'Forcast planning unit id',
                    type: 'hidden',
                },
                {
                    title: 'Selected Forecast Map',
                    type: 'hidden',
                },
                {
                    title: 'No Forecast Selected',
                    type: 'hidden',
                }
            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el;
                    elInstance.setStyle(`C${parseInt(y) + 1}`, 'text-align', 'left');
                    var rowData = elInstance.getRowData(y);
                    var match = rowData[6];
                    if (match == 1) {
                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    }
                    var doNotImport = rowData[2];
                    if (doNotImport == -1) {
                        elInstance.setStyle(`C${parseInt(y) + 1}`, 'background-color', 'transparent');
                        elInstance.setStyle(`C${parseInt(y) + 1}`, 'background-color', '#f48282');
                        let textColor = contrast('#f48282');
                        elInstance.setStyle(`C${parseInt(y) + 1}`, 'color', textColor);
                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else {
                    }
                    var noForecastSelected = rowData[7];
                    if (noForecastSelected) {
                        elInstance.setStyle(`C${parseInt(y) + 1}`, 'background-color', 'transparent');
                        elInstance.setStyle(`C${parseInt(y) + 1}`, 'background-color', '#f48282');
                        let textColor = contrast('#f48282');
                        elInstance.setStyle(`C${parseInt(y) + 1}`, 'color', textColor);
                        var cell11 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        cell11.classList.add('readonly');
                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else {
                    }
                    var isForecastBlank = rowData[8];
                    if (isForecastBlank) {
                        elInstance.setStyle(`C${parseInt(y) + 1}`, 'background-color', 'transparent');
                        elInstance.setStyle(`C${parseInt(y) + 1}`, 'background-color', '#f48282');
                        let textColor = contrast('#f48282');
                        elInstance.setStyle(`C${parseInt(y) + 1}`, 'color', textColor);
                        var cell11 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        cell11.classList.add('readonly');
                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
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
            onload: this.loaded,
            editable: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this)
        };
        myVar = jexcel(document.getElementById("mapPlanningUnit"), options);
        this.el = myVar
        this.setState({
            loading: false,
            mapPlanningUnitEl: myVar
        })
        this.props.updateStepOneData("loading", false);
        document.getElementById("stepOneBtn").disabled = false;
    }
    filterPlanningUnitBasedOnTracerCategory = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (this.state.mapPlanningUnitEl.getJson(null, false)[r])[5];
        var mylist = this.state.planningUnitListJexcel;
        if (value > 0) {
            mylist = mylist.filter(c => (c.id == -1 ? c : c.tracerCategoryId == value && c.active.toString() == "true"));
        }
        return mylist;
    }.bind(this)
    setProgramId(e) {
        var progId = e.target.value
        this.setState({
            programId: progId,
        }, () => {
            this.getPrograms(progId)
            this.getPlanningUnitList(progId);
        })
    }
    filterVersion = () => {
        let forecastProgramId = this.state.forecastProgramId;
        if (forecastProgramId != 0) {
            const forecastProgram = this.state.datasetList.filter(c => c.programId == forecastProgramId)
            this.setState({
                versions: [],
            }, () => {
                var isForecastOver = false;
                const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate()
                const addMonths = (input, months) => {
                    const date = new Date(input)
                    date.setDate(1)
                    date.setMonth(date.getMonth() + months)
                    date.setDate(Math.min(input.getDate(), getDaysInMonth(date.getFullYear(), date.getMonth() + 1)))
                    return date
                }
                var formattedDate = addMonths(new Date(), -5);
                this.setState({
                    selectedForecastProgram: forecastProgram,
                    versions: (forecastProgram[0].versionList.filter(function (x, i, a) {
                        let forecastStartDate = x.forecastStartDate;
                        let forecastStopDate = x.forecastStopDate;
                        if (!(formattedDate > forecastStartDate && formattedDate < forecastStopDate)) {
                            isForecastOver = true;
                        }
                        if (x.versionType.id == 2 && isForecastOver) {
                            return a.indexOf(x) === i;
                        }
                    })).reverse()
                }, () => { });
            });
        } else {
            this.setState({
                versions: [],
            }, () => { })
        }
    }
    setVersionId(event) {
        const forecastProgramVerisonList = this.state.versions.filter(c => c.versionId == event.target.value)
        let forecastStartDate = new Date(moment(forecastProgramVerisonList[0].forecastStartDate).format("MMM-YYYY"));
        let forecastStopDate = new Date(moment(forecastProgramVerisonList[0].forecastStopDate).format("MMM-YYYY"));
        let defaultForecastStartYear = forecastStartDate.getFullYear();
        let defaultForecastStartMonth = forecastStartDate.getMonth() + 1;
        let defaultForecastStopYear = forecastStopDate.getFullYear();
        let defaultForecastStopMonth = forecastStopDate.getMonth() + 1;
        let updatedForecastStartYear = forecastStartDate.getFullYear();
        let updatedForecastStartMonth = forecastStartDate.getMonth() + 1;
        let updatedForecastStopYear = forecastStopDate.getFullYear();
        let updatedForecastStopMonth = forecastStopDate.getMonth() + 1;
        var isWithinLast6Months = false;
        var isForecastAlreadyStarted = false;
        var isForecastOver = false;
        var isFutureForecast = false;
        const monthsDiff = Math.round(moment(new Date()).diff(new Date(forecastStartDate), 'months', true) + 1);
        const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate()
        const addMonths = (input, months) => {
            const date = new Date(input)
            date.setDate(1)
            date.setMonth(date.getMonth() + months)
            date.setDate(Math.min(input.getDate(), getDaysInMonth(date.getFullYear(), date.getMonth() + 1)))
            return date
        }
        var formattedDate = addMonths(new Date(), -5);
        if ((new Date() > forecastStartDate && new Date() < forecastStopDate)) {
            isForecastAlreadyStarted = true;
            isForecastOver = false;
            isWithinLast6Months = false;
            isFutureForecast = false;
        } else {
            if ((formattedDate > forecastStartDate && formattedDate < forecastStopDate)) {
                isForecastAlreadyStarted = false;
                isForecastOver = false;
                isWithinLast6Months = true;
                isFutureForecast = false;
            } else if (monthsDiff < FORECAST_DATEPICKER_MONTH_DIFF) {
                isForecastAlreadyStarted = false;
                isForecastOver = false;
                isWithinLast6Months = false;
                isFutureForecast = true;
            }
            else {
                isForecastAlreadyStarted = false;
                isForecastOver = true;
                isWithinLast6Months = false;
                isFutureForecast = false;
            }
        }
        if (isWithinLast6Months) {
            defaultForecastStartYear = "";
            defaultForecastStartMonth = "";
            defaultForecastStopYear = "";
            defaultForecastStopMonth = "";
            updatedForecastStartYear = formattedDate.getFullYear();
            updatedForecastStartMonth = formattedDate.getMonth() + 1;
        }
        if (isForecastOver) {
            defaultForecastStartYear = "";
            defaultForecastStartMonth = "";
            defaultForecastStopYear = "";
            defaultForecastStopMonth = "";
            updatedForecastStartYear = "";
            updatedForecastStartMonth = "";
            updatedForecastStopYear = "";
            updatedForecastStopMonth = "";
        }
        if (isForecastAlreadyStarted) {
            defaultForecastStartYear = forecastStartDate.getFullYear();
            defaultForecastStartMonth = forecastStartDate.getMonth() + 1;
            defaultForecastStopYear = forecastStopDate.getFullYear();;
            defaultForecastStopMonth = forecastStopDate.getMonth() + 1;
            updatedForecastStartYear = forecastStartDate.getFullYear();
            updatedForecastStartMonth = forecastStartDate.getMonth() + 1;
        }
        if (isFutureForecast) {
            updatedForecastStartYear = forecastStartDate.getFullYear();
            updatedForecastStartMonth = forecastStartDate.getMonth() + 1;
        }
        this.setState({
            versionId: event.target.value,
            minDate: { year: updatedForecastStartYear, month: updatedForecastStartMonth },
            maxDate: { year: updatedForecastStopYear, month: updatedForecastStopMonth },
            rangeValue: { from: { year: defaultForecastStartYear, month: defaultForecastStartMonth }, to: { year: defaultForecastStopYear, month: defaultForecastStopMonth } },
            forecastPeriod: moment(forecastStartDate).format("MMM-YYYY") + " ~ " + moment(forecastStopDate).format("MMM-YYYY")
        }, () => {
            this.filterData(true);
        })
    }
    setForecastProgramId(e) {
        let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == e.target.value)[0];
        var programListFilter = [];
        if (e.target.value != "") {
            programListFilter = this.state.programs.filter(c => c.generalProgramJson.realmCountry.realmCountryId == selectedForecastProgram.realmCountry.realmCountryId);
        }
        let selectedForecastProgramDesc = e.target.options[e.target.selectedIndex].text;
        this.props.updateStepOneData("selectedForecastProgramDesc", selectedForecastProgramDesc);
        this.setState({
            forecastProgramId: e.target.value,
            versionId: '',
            programListFilter: programListFilter.sort(function (a, b) {
                a = a.programCode.toLowerCase();
                b = b.programCode.toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
            }),
        }, () => {
            this.filterVersion();
            this.filterData(true);
        })
    }
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(2, y);
            if (value != -1 && value != -2 && value != -3) {
                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else if (!(budgetRegx.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.spacetext'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(3, y);
                var reg = /^\d{1,6}(\.\d{1,6})?$/;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.usagePeriod.conversionFactorTestString'));
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
        return valid;
    }
    formSubmit = function () {
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState({ loading: true })
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            let supplyPlanPlanningUnitIds = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("2")) != -1 && parseInt(map1.get("2")) != -2 && parseInt(map1.get("2")) != -3) {
                    let json = {
                        supplyPlanPlanningUnitId: parseInt(map1.get("2")),
                        forecastPlanningUnitId: parseInt(map1.get("6")),
                        multiplier: map1.get("3").toString().replace(/,/g, ""),
                        supplyPlanPlanningUnitDesc: this.state.planningUnitListJexcel.filter(c => c.id == parseInt(map1.get("2")))[0].name
                    }
                    supplyPlanPlanningUnitIds.push(json)
                }
            }
            let json = {
                supplyPlanRegionList: this.state.supplyPlanRegionList,
                forecastRegionList: this.state.datasetList.filter(c => c.programId == this.state.forecastProgramId)[0].forecastRegionList,
            }
            changedpapuList.push(json);
            this.setState({
                stepOneData: changedpapuList,
                regionList: changedpapuList,
                supplyPlanPlanningUnitIds: supplyPlanPlanningUnitIds,
                selSource1: tableJson
            }, () => {
                this.props.finishedStepOne();
            })
            let versionId = document.getElementById("versionId").value;
            this.props.updateStepOneData("versionId", versionId);
            this.props.updateStepOneData("stepOneData", changedpapuList);
            this.props.updateStepOneData("regionList", changedpapuList);
            this.props.updateStepOneData("supplyPlanPlanningUnitIds", supplyPlanPlanningUnitIds);
            this.props.updateStepOneData("selSource1", tableJson);
        } else {
        }
    }
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { rangeValue } = this.state
        const { programListFilter } = this.state;
        let programList = programListFilter.length > 0
            && programListFilter.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {item.programCode + ' v' + item.programVersion}
                    </option>
                )
            }, this);
        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {(item.versionId + '*')} ({(moment(item.createdDate).format(`MMM DD YYYY`))})
                    </option>
                )
            }, this);
        const { datasetList } = this.state;
        let datasets = datasetList.length > 0
            && datasetList.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {item.programCode}
                    </option>
                )
            }, this);
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div12">{this.state.message}</h5>
                <div>
                    <Popover placement="top" isOpen={this.state.popoverOpenProgramSetting} target="Popover2" trigger="hover" toggle={this.toggleProgramSetting}>
                        <PopoverBody>{i18n.t('static.importIntoSP.versionTitle')}</PopoverBody>
                    </Popover>
                </div>
                <div style={{ display: this.props.items.loading ? "none" : "block" }} >
                    <div className="Card-header-addicon pb-0">
                        <div className="card-header-actions" style={{ marginTop: '-25px' }}>
                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                            </a>
                        </div>
                    </div>
                    <Modal isOpen={this.state.showGuidance}
                        className={'modal-xl ' + this.props.className} >
                        <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
                            <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
                        </ModalHeader>
                        <div>
                            <ModalBody>
                                <div dangerouslySetInnerHTML={{
                                    __html: localStorage.getItem('lang') == 'en' ?
                                        listImportIntoQATSupplyPlanEn :
                                        localStorage.getItem('lang') == 'fr' ?
                                            listImportIntoQATSupplyPlanFr :
                                            localStorage.getItem('lang') == 'sp' ?
                                                listImportIntoQATSupplyPlanSp :
                                                listImportIntoQATSupplyPlanPr
                                }} />
                            </ModalBody>
                        </div>
                    </Modal>
                    <div className="row ">
                        <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.dataSet.dataSet')}</Label>
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
                            <Label htmlFor="appendedInputButton">{i18n.t('static.importIntoQATSupplyPlan.forecastFinalVersion')}<i class="fa fa-info-circle icons pl-lg-2" id="Popover2" onClick={this.toggleProgramSetting} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                            <Label htmlFor="appendedInputButton">{i18n.t('static.importIntoQAT.dateRange')}<span className="stock-box-icon fa fa-sort-desc"></span> <i>({i18n.t('static.consumption.forcast')}: {this.state.forecastPeriod})</i></Label>
                            <div className="controls  Regioncalender">
                                <Picker
                                    ref="pickRange"
                                    years={{ min: this.state.minDate, max: this.state.maxDate }}
                                    value={rangeValue}
                                    lang={pickerLang}
                                    key={JSON.stringify(rangeValue)}
                                    onChange={this.handleRangeChange}
                                    onDismiss={this.handleRangeDissmis}
                                >
                                    <MonthBox value={this.makeText(rangeValue.from) + ' to ' + this.makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                </Picker>
                            </div>
                        </FormGroup>
                    </div>
                </div>
                <div className="consumptionDataEntryTable" style={{ display: this.props.items.loading ? "none" : "block" }} >
                    <div id="mapPlanningUnit" style={{ display: this.props.items.loading ? "none" : "block" }}>
                    </div>
                </div>
                <div style={{ display: this.props.items.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div className="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>
                            <div className="spinner-border blue ml-4" role="status">
                            </div>
                        </div>
                    </div>
                </div>
                <FormGroup>
                    <Button color="info" size="md" className="float-right mr-1" id="stepOneBtn" type="submit" onClick={() => this.formSubmit()} >{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                </FormGroup>
            </>
        );
    }
}