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
            filteredSupplyPlanProgramList: [],
            sourceList: [],
            versionList: [],
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
        this.buildJexcel2 = this.buildJexcel2.bind(this);
        this.filterSupplyPlanPrograms = this.filterSupplyPlanPrograms.bind(this);
        this.addRow = this.addRow.bind(this);
        this.dropdownFilter = this.dropdownFilter.bind(this);
        this.versionChanged = this.versionChanged.bind(this);
        this.versionFilterNew = this.versionFilterNew.bind(this);
        this.changed2 = this.changed2.bind(this);
        this.checkValidationTable1 = this.checkValidationTable1.bind(this);
        this.callFilterData = this.callFilterData.bind(this);
        this.updatePUs = this.updatePUs.bind(this)
        this.loaded = this.loaded.bind(this);
        this.onchangepage = this.onchangepage.bind(this)
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
            // this.buildJexcel2();
        } else {
            window.onbeforeunload = undefined
            // this.buildJexcel2();
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
        if (x == 2 || x == 9 || x == 7 || x==12) {
            var rowData = this.el.getRowData(y);
            this.el.setStyle(`C${parseInt(y) + 1}`, 'text-align', 'left');
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
            if (rowData[12] == 1) {
                // var columnsCount = el.getHeaders().length;
                // console.log('columnsCount: ',columnsCount);
                for (var col = 0; col < colArr.length; col++) {
                    this.el.getCell((colArr[col]).concat(parseInt(y) + 1)).classList.add('regionBold');
                    // el.setStyle(y, col, 'class', 'regionBold');
                    // elInstance.setStyle((colArr[col]).concat(parseInt(y) + 1), "background-color", "yellow");
                }

                //make Forecast Planning Unit readonly
                var cell1 = this.el.getCell(`H${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
            }
            var match = rowData[10];
            if (match == 1 || rowData[1] == rowData[7]) {
                var cell1 = this.el.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
            } else {
                var cell1 = this.el.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.remove('readonly');
            }
            var doNotImport = rowData[7];
            if (doNotImport == -1) {
                var cell1 = this.el.getCell(`H${parseInt(y) + 1}`)
                cell1.classList.add('doNotImport');
                var cell1 = this.el.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                this.el.setComments(`J${parseInt(y) + 1}`, "");
            } else {
                var cell1 = this.el.getCell(`H${parseInt(y) + 1}`)
                cell1.classList.remove('doNotImport');
            }
        }

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

        //new code
        
        this.buildJexcel2();
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
                    this.filterForcastUnit();//to populate FP dropdown
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
        // DropdownService.getProgramBasedOnRealmIdAndProgramTypeId(realmId, PROGRAM_TYPE_SUPPLY_PLAN)
        ProgramService.getProgramListAll()
            .then(response => {
                // console.log('programListAll size: ',response.data.length);
                // console.log('active programList size: ',response.data.filter(p => p.active == true ).length);
                let programListAll = response.data.filter(p => p.active == true && p.realmCountry.realm.realmId ==  realmId);
                console.log('filter programListAll size: ',programListAll.length);
                console.log('programListAll[0]: ',programListAll[0]);
                
                programListAll = programListAll.sort(function (a, b) {
                    a = a.programCode.toLowerCase();
                    b = b.programCode.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });

                this.setState({
                    programs: programListAll,
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

    testTable1Data() {

        var tableJson = this.el2.getJson(null, false);
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                // let json = {
                //     supplyPlanPlanningUnitId: parseInt(map1.get("1")),
                //     forecastPlanningUnitId: parseInt(map1.get("7")),
                //     multiplier: map1.get("9").toString().replace(/,/g, ""),
                // }

                console.log('sp programId: '+parseInt(map1.get("1")));
                console.log('sp versionId: '+parseInt(map1.get("2")));
            }
    }

    /**
     * Reterives planning unit list based on program and version Id
     */
    filterData() {
        console.log('\nfilterData() called');

        let forecastProgramId = document.getElementById("forecastProgramId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        
        var tableJson = this.el2.getJson(null, false);
        console.log('tableJson length: ',tableJson.length);  
        if(tableJson.length > 0) {
            let programPlanningUnitListTemp = [];
            //itterate table 1 
            let selectedSpProgramIdArr = [];
            let count = 1;//used this as for loop is working asynchronous
            for (var i = 0; i < tableJson.length; i++) {
                console.log('for i: ',i);
                console.log('count: ',count);
                var map1 = new Map(Object.entries(tableJson[i]));
                // console.log('tableJson['+i+']: ',tableJson[i]);
                // console.log('map1: ',map1);

                let programId = parseInt(map1.get("1"));
                selectedSpProgramIdArr.push(programId);//to use in step2
                let programCode = '';
                try {
                    programCode = this.state.filteredSupplyPlanProgramList.filter(c => c.id == programId)[0].name;                    
                } catch (error) {
                    
                }
                console.log('program obj: ',programCode);
                let programJson = {
                    programId: programId,
                    programCode: programCode
                };
                let versionId = parseInt(map1.get("2"));

                // console.log('sp programId: '+parseInt(map1.get("1")));
                // console.log('sp versionId: '+parseInt(map1.get("2")));
                if (versionId != 0 && programId > 0 && forecastProgramId > 0) {
                    let selectedSupplyPlanProgram = this.state.programs.filter(c => c.programId == programId)[0];
                    let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == forecastProgramId && c.versionId == this.state.forecastProgramVersionId)[0];
                    if (selectedSupplyPlanProgram.realmCountry.realmCountryId == selectedForecastProgram.realmCountry.realmCountryId) {
                        this.props.updateStepOneData("loading", true);
                        this.props.updateStepOneData("programId", programId);// check this later if comma separated ids to pass
                        this.props.updateStepOneData("versionId", versionId);// check this later if comma separated ids to pass
                        this.props.updateStepOneData("forecastProgramId", forecastProgramId);
                        this.props.updateStepOneData("startDate", startDate);
                        this.props.updateStepOneData("stopDate", stopDate);
                        document.getElementById("stepOneBtn").disabled = false;
                        let tracerCategory = [];
                        console.log('before service call i: ',i);
                        ProgramService.getPlanningUnitByProgramId(programId, tracerCategory)
                            .then(response => {
                                if (response.status == 200) {
                                    console.log('after service resp. i: ',i);
                                    console.log('resp. for PU list received for programId: ',programId);
                                    programPlanningUnitListTemp.push({ program: programJson, puList: response.data });
                                    this.setState({
                                        programPlanningUnitList: programPlanningUnitListTemp,
                                        selSource: programPlanningUnitListTemp,
                                        message: ''
                                    }, () => {
                                        //check what to do for below code

                                        if (response.data.length == 0) {
                                            document.getElementById("stepOneBtn").disabled = true;
                                        }
                                        console.log('after state update i: ',i);
                                        console.log('after state update count: ',count);
                                        if(count == tableJson.length) {// call for last itteration
                                            console.log('last itteration');
                                            this.getProgramPlanningUnit();
                                        }
                                        count++;
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
                }
            }
            //update selectedSpProgramIdArr in props
            this.props.updateStepOneData("selectedSpProgramIdArr", selectedSpProgramIdArr);
        } 
        // else if (programId == 0) {
        //     this.setState({
        //         programPlanningUnitList: [],
        //         selSource: [],
        //         message: i18n.t('static.importFromQATSupplyPlan.selectSupplyPlanProgram'),
        //     })
        //     jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
        //     document.getElementById("stepOneBtn").disabled = true;
        // } else if (versionId == 0) {
        //     this.setState({
        //         programPlanningUnitList: [],
        //         selSource: [],
        //         message: i18n.t('static.importFromQATSupplyPlan.pleaseSelectSupplyPlanVersion'),
        //     })
        //     jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
        //     document.getElementById("stepOneBtn").disabled = true;
        // } 
        else if (forecastProgramId == 0) {
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
     * Function to filter supply plan version based on product category
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    async versionChanged (instance, cell, c, r, source) {
        var mylist = [];
        var spProgramId = (this.state.supplyPlanVersionMapEl.getJson(null, false)[r])[c-1];
        console.log('dropdownFilter. sp Pgm: '+spProgramId);

        //fetch version list here
        if (spProgramId != 0) {

            await DropdownService.getVersionListForProgram(PROGRAM_TYPE_SUPPLY_PLAN, spProgramId)
                .then(response => {
                        let newSource = (response.data.filter(function (x, i, a) {
                            return a.indexOf(x) === i;
                        })).reverse();

                        //build json for dropdown
                        let filteredSpVersionList = [];

                        for (var i = 0; i < newSource.length; i++) {
                            let versionNameStr = ((newSource[i].versionStatus.id == 2 && newSource[i].versionType.id == 2) ? newSource[i].versionId + '*' : newSource[i].versionId) +' ('+ (moment(newSource[i].createdDate).format(`MMM DD YYYY`)) + ')';
                            var paJson = {
                                name: versionNameStr,
                                id: parseInt(newSource[i].versionId),
                            }
                            filteredSpVersionList[i] = paJson
                        }

                        mylist = filteredSpVersionList;
                        console.log('resp. filteredSpVersionList count: '+filteredSpVersionList.length);
                        console.log('resp. filteredSpVersionList: '+JSON.stringify(filteredSpVersionList));                        
                        this.setState({sourceList: mylist})
                        // return filteredSpVersionList;
                        // this.updateColumnSource(filteredSpVersionList);
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
                console.log('if section',mylist);
                
                // return mylist;
        } 
        
        console.log('end of dropdownFilter()');
        // return mylist;
    }

    dropdownFilter (instance, cell, c, r, source) {
        this.versionChanged(instance, cell, c, r, source);
        console.log('after versionChanged()');
        return this.state.sourceList;
    }

    versionFilterNew(instance, cell, c, r, source){
        var myList = [];
        var spProgramId = (this.state.supplyPlanVersionMapEl.getJson(null, false)[r])[c-1];
        console.log('dropdownFilter. sp Pgm: '+spProgramId);

        if(spProgramId != 0) {
            var spProgram = this.state.programs.filter(c => c.programId == spProgramId)[0];
            var versionList = [];
            versionList = spProgram.versionList;
            for (var i = 0; i < versionList.length; i++) {
                // let versionNameStr = ((newSource[i].versionStatus.id == 2 && newSource[i].versionType.id == 2) ? newSource[i].versionId + '*' : newSource[i].versionId) +' ('+ (moment(newSource[i].createdDate).format(`MMM DD YYYY`)) + ')';
                let versionNameStr = ((versionList[i].versionStatus.id == 2 && versionList[i].versionType.id == 2) ? versionList[i].versionId + '*' : versionList[i].versionId) +' ('+ (moment(versionList[i].createdDate).format(`MMM DD YYYY`)) + ')';
                var paJson = {
                    name: versionNameStr,
                    id: parseInt(versionList[i].versionId),
                }
                myList[i] = paJson
            }
            myList.reverse();
            console.log('myList size: ', myList.length);
        }
        return myList;
    }

    /**
   * Function to build a jexcel table.
   * Constructs and initializes a jexcel table using the provided data and options.
   */
    buildJexcel2() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];
        var count = 0;

        data[0] = '';
        data[1] = '';
        papuDataArr[0] = data;
        
        // if (this.state.table1Instance != "" && this.state.table1Instance != undefined) {
        //     jexcel.destroy(document.getElementById("spProgramVersionTable"), true);
        // }
        jexcel.destroy(document.getElementById("spProgramVersionTable"), true);
        var data = papuDataArr;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [100, 100],
            // onchange: (instance, cell, x, y, value) => {
                // if (x == 1) { 
                //     this.versionChanged(instance, cell, x, y, value);
                // }
            // },
            columns: [
                {
                    title: 'newRow',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.supplyPlanProgram'),
                    type: 'autocomplete',
                    source: this.state.filteredSupplyPlanProgramList,
                    filter: this.supplyPlanProgramsForDropdown,
                    required: true,
                    regex: {
                        ex: /^\S+(?: \S+)*$/,
                        text: i18n.t("static.message.spacetext")
                    }
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.supplyPlanVersion'),
                    type: 'autocomplete',
                    source: this.state.versionList,
                    filter: this.versionFilterNew,
                    required: true,
                },
                
                // {
                //     title: 'isChange',
                //     type: 'hidden'
                // },
                // {
                //     title: 'forecastingUnitId',
                //     type: 'hidden'
                // },
                // {
                //     title: 'typeId',
                //     type: 'hidden'
                // },
                // {
                //     title: 'addNewRow',
                //     type: 'hidden'
                // },
                // {
                //     title: 'countVar',
                //     type: 'hidden'
                // }
            ],
            // onchangepage: this.onchangepage,
            pagination: false,
            filters: false,
            search: false,
            columnSorting: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            onchange: this.changed2,
            // onchange: this.handleChange.bind(this),//remove this function
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            // oneditionend: this.oneditionend,
            // onload: this.loaded,
            editable: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y == null) {
                } else {
                    if (obj.options.allowInsertRow == true) {
                            items.push({
                                title: i18n.t('static.common.addRow'),
                                onclick: function () {
                                    var data = [];
                                    data[0] = 1;//for new row
                                    data[1] = "";
                                    data[2] = "";                                    
                                    obj.insertRow(data, parseInt(y));
                                }.bind(this)
                            });
                    }
                    if (obj.options.allowDeleteRow == true) {
                        if (obj.getRowData(y)[0] == 1) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                    this.callFilterData();//build table 2
                                }.bind(this)
                            });
                        }
                    }
                }
                return items;
            }.bind(this)
        };
        var table1Instance = jexcel(document.getElementById("spProgramVersionTable"), options);
        this.el2 = table1Instance;
        this.setState({
            supplyPlanVersionMapEl: table1Instance,
            // loading: false,
            // countVar: count
        })
    }

    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changed2 = function (instance, cell, x, y, value) {
        console.log('changed2() called: ');
        changed(instance, cell, x, y, value);
        if (x == 1) {
            this.el2.setValueFromCoords(2, y, '', true);//clear spVerion dropdown

            // this.setState({
            //     versionList: [],
            // })
        }

        this.callFilterData();

        // if (x == 2) {
        //     this.filterData();
        // }
    }

    callFilterData() {
        var validation = this.checkValidationTable1();
        console.log('validation tbl1 : ',validation);
        if (validation == true) {
            this.filterData();//build table 2
        }
    }

    /**
     * Function to check validation of the jexcel table of supply plan program & version.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidationTable1 = function () {
        var valid = true;
        var json = this.el2.getJson(null, false);
        // valid = checkValidation(this.el);
        for (var y = 0; y < json.length; y++) {
            var value = this.el2.getValueFromCoords(1, y);//for sp program dropdown
            
            
            if (value == '') {
                var col = ("B").concat(parseInt(y) + 1);
                this.el2.setStyle(col, "background-color", "transparent");
                this.el2.setStyle(col, "background-color", "yellow");
                this.el2.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
                
            } else if(this.el2.getValueFromCoords(2, y) == '') { //for sp version dropdown
                var col = ("C").concat(parseInt(y) + 1);
                this.el2.setStyle(col, "background-color", "transparent");
                this.el2.setStyle(col, "background-color", "yellow");
                this.el2.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;

            } else {
                //for sp program dropdown duplicate check
                // console.log('i json.length - 1: ',json.length - 1);
                var col = ("B").concat(parseInt(y) + 1);
                
                for (var i = (json.length - 1); i >= 0; i--) {
                    // console.log('i : ',i);
                    // console.log('y : ',y);
                    var map = new Map(Object.entries(json[i]));
                    var spProgramValue = map.get("1");
                    if (spProgramValue == value && y != i && i > y) {
                        this.el2.setStyle(col, "background-color", "transparent");
                        this.el2.setStyle(col, "background-color", "yellow");
                        this.el2.setComments(col, "Supply Plan Program already exists");
                        i = -1;
                        valid = false;
                    } else {
                        this.el2.setStyle(col, "background-color", "transparent");
                        this.el2.setComments(col, "");
                    }
                }
            }

                /*var col = ("J").concat(parseInt(y) + 1);
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
                }*/
            
        }
        return valid;
    }

    handleChange(instance, cell, x, y, value) {
        console.log('handleChange(): ');
        var elInstance = instance;
        var rowData = elInstance.getRowData(y);
        var spProgramId = rowData[1];
        console.log('spProgramId before if: '+spProgramId);
        if (x == 1) { // Check if the changed cell is in the first column

            console.log('spProgramId: '+spProgramId);

            //fetch version list here
            if (spProgramId != 0) {
                this.setState({
                    // versions: [],
                }, () => {
                    DropdownService.getVersionListForProgram(PROGRAM_TYPE_SUPPLY_PLAN, spProgramId)
                        .then(response => {
                            this.setState({
                                // versions: []
                            }, () => {
                                let newSource = (response.data.filter(function (x, i, a) {
                                    return a.indexOf(x) === i;
                                })).reverse();

                                //build json for dropdown
                                let filteredSpVersionList = [];
                                // <option key={i} value={item.versionId}>
                                //     {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)} ({(moment(item.createdDate).format(`MMM DD YYYY`))})
                                // </option>
                                

                                for (var i = 0; i < newSource.length; i++) {
                                    let versionNameStr = ((newSource[i].versionStatus.id == 2 && newSource[i].versionType.id == 2) ? newSource[i].versionId + '*' : newSource[i].versionId) +' ('+ (moment(newSource[i].createdDate).format(`MMM DD YYYY`)) + ')';
                                    var paJson = {
                                        name: versionNameStr,
                                        id: parseInt(newSource[i].versionId),
                                    }
                                    filteredSpVersionList[i] = paJson
                                }

                                this.updateColumnSource(filteredSpVersionList);
                                // this.setState({
                                //     versions: newSource
                                // }, () => { });
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
                    // versions: [],
                }, () => { })
            }

            // try {
            //     const response = await fetch(`your-api-url?program=${value}`);
            //     const newSource = await response.json();

            //     this.updateColumnSource(newSource);
            // } catch (error) {
            //     console.error("Error fetching data:", error);
            // }
        }
    }

    updateColumnSource(newSource) {
        const table1Instance = this.el2;
        console.log('table1Instance: '+table1Instance);
        

        if (table1Instance) {
            // Get the existing data
            const existingData = table1Instance.getData();

            // Destroy the existing instance
            // jexcel.destroy(document.getElementById("spProgramVersionTable"), true);

            // Rebuild the table with the new source for the third column
            /*var options = {
                data: existingData,
                columnDrag: false,
                colWidths: [100, 100],
                columns: [
                    {
                        title: 'equivalancyUnitMappingId',
                        type: 'hidden',
                    },
                    {
                        title: i18n.t('static.importFromQATSupplyPlan.supplyPlanProgram'),
                        type: 'autocomplete',
                        source: this.state.filteredSupplyPlanProgramList,
                        filter: this.supplyPlanProgramsForDropdown,
                        required: true,
                        regex: {
                            ex: /^\S+(?: \S+)*$/,
                            text: i18n.t("static.message.spacetext")
                        }
                    },
                    {
                        title: i18n.t('static.importFromQATSupplyPlan.supplyPlanVersion'),
                        type: 'autocomplete',
                        source: newSource, // Updated source
                        filter: false,
                        required: true,
                        regex: {
                            ex: /^\S+(?: \S+)*$/,
                            text: i18n.t("static.message.spacetext")
                        }
                    },
                ],
                pagination: false,
                filters: false,
                search: false,
                columnSorting: true,
                wordWrap: true,
                paginationOptions: JEXCEL_PAGINATION_OPTION,
                position: 'top',
                allowInsertColumn: false,
                allowManualInsertColumn: false,
                allowDeleteRow: true,
                copyCompatibility: true,
                allowManualInsertRow: false,
                parseFormulas: true,
                editable: true,
                license: JEXCEL_PRO_KEY,
                onchange: this.handleChange.bind(this), // Bind the handleChange method
            };
            var newTable1Instance = jexcel(document.getElementById("spProgramVersionTable"), options);
            this.el2 = newTable1Instance;*/
            // this.setState({ table1Instance: newTable1Instance });
        }
    
    }

    /**
     * Function to add a new row to the jexcel table.
     */
    addRow = function () {
        var data = [];
        data[0] = 1;
        data[1] = "";
        data[2] = "";
        this.el2.insertRow(data);
        // this.testTable1Data();
    };

    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    buildJexcel() {
        var papuList = this.state.selSource; // planning unit list of SP program
        console.log('papuList: ',papuList);
        var data = [];
        var papuDataArr = [];
        let forecastPlanignUnitListForNotDuplicate = [];
        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                var puList = papuList[j].puList;

                console.log('\n ['+j+'] puList.length: ',puList.length);

                for(var k = 0; k < puList.length; k++) {
                    console.log('puList id: ',puList[k].id);

                    data = [];
                    let planningUnitObj = this.state.planningUnitList.filter(c => c.id == puList[k].id)[0]; // filter PU list of Forecast Program
                    if(k == 0) {
                        data[0] = papuList[j].program.programCode;
                        data[1] = '0';
                        data[2] = '0';
                        data[3] = '0';
                        data[4] = '0';
                        data[5] = '0';
                        data[6] = '0';
                        data[7] = '0';
                        data[8] = '0';
                        data[9] = '0';
                        data[10] = '0';
                        data[11] = planningUnitObj != undefined ? planningUnitObj.forecastingUnit.id : "";
                        data[12] = 1;
                        papuDataArr[count] = data;
                        count++;
                    }                     
                    data = [];
                    data[0] = getLabelText(puList[k].forecastingUnit.tracerCategory.label, this.state.lang)
                    data[1] = puList[k].id
                    data[2] = getLabelText(puList[k].label, this.state.lang) + ' | ' + puList[k].id
                    data[3] = puList[k].multiplier
                    data[4] = puList[k].forecastingUnit.id
                    data[5] = puList[k].forecastingUnit.tracerCategory.id
                    let selectedForecastProgram = this.state.datasetList.filter(c => c.programId == document.getElementById("forecastProgramId").value)[0];
                    let filteredPlanningUnit = selectedForecastProgram.filteredPlanningUnit;
                    let match = filteredPlanningUnit.filter(c => c.id == puList[k].id);
                    if (match.length > 0) {
                        data[6] = puList[k].id
                        data[7] = getLabelText(puList[k].label, this.state.lang) + ' | ' + puList[k].id
                        data[8] = puList[k].multiplier
                        data[9] = 1
                        data[10] = 1
                        forecastPlanignUnitListForNotDuplicate.push({
                            supplyPlanPlanningUnitId: puList[k].id,
                            forecastPlanningUnitId: puList[k].id
                        });
                    } else {
                        data[6] = ''
                        data[7] = ''
                        data[8] = ''
                        data[9] = ''
                        data[10] = ''
                    }                   

                    data[11] = planningUnitObj != undefined ? planningUnitObj.forecastingUnit.id : "";
                    data[12] = 0;
                    papuDataArr[count] = data;
                    count++;
                }

            }
        }
        jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
        jexcel.destroy(document.getElementById("mapRegion"), true);
        jexcel.destroy(document.getElementById("mapImport"), true);
        //change for selSource1 pending
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
                },
                {
                    title: 'ProgramCode',
                    type: 'hidden',
                    readOnly: true
                }
            ],
            onfilter: function (el) {
                var elInstance = el;
                var json = elInstance.getJson();
                var jsonLength;
                jsonLength = json.length;
                for (var y = 0; y < jsonLength; y++) {
                    try {
                        elInstance.setStyle(`C${parseInt(y) + 1}`, 'text-align', 'left');
                        var rowData = elInstance.getRowData(y);
                        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
                        if (rowData[12] == 1) {
                            // var columnsCount = el.getHeaders().length;
                            // console.log('columnsCount: ',columnsCount);
                            for (var col = 0; col < colArr.length; col++) {
                                elInstance.getCell((colArr[col]).concat(parseInt(y) + 1)).classList.add('regionBold');
                                // el.setStyle(y, col, 'class', 'regionBold');
                                // elInstance.setStyle((colArr[col]).concat(parseInt(y) + 1), "background-color", "yellow");
                            }
    
                            //make Forecast Planning Unit readonly
                            var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                        }    
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
                            var cell1 = this.el.getCell(`H${parseInt(y) + 1}`)
                            cell1.classList.add('doNotImport');
                            var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                            elInstance.setComments(`J${parseInt(y) + 1}`, "");
                        } else {
                            var cell1 = this.el.getCell(`H${parseInt(y) + 1}`)
                            cell1.classList.remove('doNotImport');
                        }
                    } catch (error) {

                    }

                    
                }
            }.bind(this),
            // updateTable: function (el, cell, x, y, source, value, id) {
            //     if (y != null) {
            //         var elInstance = el;
            //         elInstance.setStyle(`C${parseInt(y) + 1}`, 'text-align', 'left');
            //         var rowData = elInstance.getRowData(y);
            //         var match = rowData[10];
            //         if (match == 1 || rowData[1] == rowData[7]) {
            //             var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');
            //         } else {
            //             var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
            //             cell1.classList.remove('readonly');
            //         }
            //         var doNotImport = rowData[7];
            //         if (doNotImport == -1) {
            //             elInstance.setStyle(`H${parseInt(y) + 1}`, 'background-color', 'transparent');
            //             elInstance.setStyle(`H${parseInt(y) + 1}`, 'background-color', '#f48282');
            //             let textColor = contrast('#f48282');
            //             elInstance.setStyle(`H${parseInt(y) + 1}`, 'color', textColor);
            //             var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
            //             cell1.classList.add('readonly');
            //             elInstance.setComments(`J${parseInt(y) + 1}`, "");
            //         } else {
            //         }
            //     }
            // }.bind(this),
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
            selSource1: [],
            toggleDoNotImport:false
        }, () => {
            this.filterVersion();
            // this.filterForcastUnit();
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
        /*let programId = this.state.programId;
        if (programId != 0) {
            // const countryId = this.state.programs.filter(c => c.id == programId)[0].realmCountry.id;
            // this.state.getDatasetFilterList = this.state.datasetList
            // console.log('this.state.datasetList size: '+ this.state.datasetList.length);
            // console.log('this.state.datasetList Forecast pgm: '+ JSON.stringify(this.state.datasetList));
            // var datasetlist = this.state.getDatasetFilterList.filter(c => c.realmCountry.realmCountryId == countryId);

            var datasetlist = this.state.datasetList;
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
        }*/

        var datasetlist = this.state.datasetList;
        console.log(' FP datasetlist: '+JSON.stringify(datasetlist));
            this.setState({
                data: [],
            }, () => {
                this.setState({
                    getDatasetFilterList: (datasetlist.filter(function (x, i, a) {
                        return a.indexOf(x) === i;
                    })).reverse()
                }, () => { });
            });
    }
    /**
     * Sets the version id in the component state on change and builds data accordingly.
     */
    setVersionId(event) {
        this.setState({
            versionId: event.target.value,
            toggleDoNotImport:false,
            selSource1: [],
        }, () => {
            this.filterData();
        })
    }
    /**
     * Handles the selection of a forecast program ID and updates the state accordingly.
     * @param {Object} event The event object containing information about the selected forecast program ID.
     */
    setForecastProgramId(event) {
        jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
        jexcel.destroy(document.getElementById("spProgramVersionTable"), true);
        this.buildJexcel2();
        
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
                selSource1: [],
                rangeValue: { from: { year: startDateSplit[1] - 3, month: new Date('01-' + selectedForecastProgram.forecastStartDate).getMonth() + 1 }, to: { year: forecastStopDate.getFullYear(), month: forecastStopDate.getMonth() + 1 } },
                forecastProgramVersionId: forecastProgramVersionId,
                selectedForecastProgram: selectedForecastProgram,
                toggleDoNotImport:false
            }, () => {
                this.props.updateStepOneData("forecastProgramVersionId", forecastProgramVersionId);
                // this.filterData();
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
                toggleDoNotImport:false
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
        console.log('checkValidation->  valid: ',valid);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(7, y);
            var isProgramHeader = this.el.getValueFromCoords(12, y);
            // console.log('y: '+y+', checkValidation value: ',value);
            // console.log('isProgramHeader: ',isProgramHeader);
            var tracerCategoryId = this.el.getValueFromCoords(5, y);
            if (value != -1 && isProgramHeader != 1) {
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
        console.log('formSubmit() validation: ',validation);
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

    filterSupplyPlanPrograms = function (event) {
        var forecastProgramId = event.target.value;
        console.log('filterSupplyPlanPrograms() called. forecastProgramId: '+forecastProgramId);

        if (forecastProgramId != 0) {
            // const countryId = this.state.programs.filter(c => c.id == programId)[0].realmCountry.id;
            // this.state.getDatasetFilterList = this.state.datasetList
            // console.log('this.state.datasetList size: '+ this.state.datasetList.length);
            // console.log('this.state.datasetList Forecast pgm: '+ JSON.stringify(this.state.datasetList));
            // var datasetlist = this.state.getDatasetFilterList.filter(c => c.realmCountry.realmCountryId == countryId);

            let filteredSupplyPlanProgramList = [];
            const countryId = this.state.datasetList.filter(c => c.programId == forecastProgramId)[0].realmCountry.realmCountryId;
            var supplyPlanProgramList = this.state.programs.filter(c => c.realmCountry.realmCountryId == countryId);
            console.log('supplyPlanProgramList count: '+supplyPlanProgramList.length);
            console.log('supplyPlanProgramList: ',supplyPlanProgramList);

            for (var i = 0; i < supplyPlanProgramList.length; i++) {
                var paJson = {
                    name: supplyPlanProgramList[i].programCode,
                    id: parseInt(supplyPlanProgramList[i].programId),
                }
                filteredSupplyPlanProgramList[i] = paJson
            }

            this.setState({
                filteredSupplyPlanProgramList : filteredSupplyPlanProgramList
            },() => {
                console.log('filteredSupplyPlanProgramList: '+JSON.stringify(this.state.filteredSupplyPlanProgramList));
            });
        } else {
            this.setState({
                filteredSupplyPlanProgramList : []
            });
        }
    }
    /**
     * Function to filter version status based on version type
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    supplyPlanProgramsForDropdown = function (instance, cell, c, r, source) {
        // var rowData = (this.state.dataEL.getJson(null, false)[r]);
        return  this.state.filteredSupplyPlanProgramList;
    }.bind(this);

    /**
         * Sets the state to toggle do not import flag.
         * @param {Event} e - The change event.
         * @returns {void}
         */
    setToggleDoNotImport(e) {
        this.setState({
            toggleDoNotImport: e.target.checked,
            loading: true
        }, () => {
            this.updatePUs()
        })
    }
    updatePUs() {
        var tableJson = this.el.getJson(null, false);
        if (this.state.toggleDoNotImport) {
            for (var i = 0; i < tableJson.length; i++) {
                var rowData = this.el.getRowData(i);
                if (rowData[7] == "") {
                    this.el.setValueFromCoords(7, parseInt(i), -1, true);
                }
            }
        } else {
            for (var i = 0; i < tableJson.length; i++) {
                var rowData = this.el.getRowData(i);
                if (rowData[7] == -1) {
                    this.el.setValueFromCoords(7, parseInt(i), "", true);
                }
            }
        }
    }
    /**
     * This function is used to format the consumption table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson(null, false);
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
        for (var y = 0; y < jsonLength; y++) {
            elInstance.setStyle(`C${parseInt(y) + 1}`, 'text-align', 'left');
            var rowData = elInstance.getRowData(y);
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
                        if (rowData[12] == 1) {
                            // var columnsCount = el.getHeaders().length;
                            // console.log('columnsCount: ',columnsCount);
                            for (var col = 0; col < colArr.length; col++) {
                                elInstance.getCell((colArr[col]).concat(parseInt(y) + 1)).classList.add('regionBold');
                                // el.setStyle(y, col, 'class', 'regionBold');
                                // elInstance.setStyle((colArr[col]).concat(parseInt(y) + 1), "background-color", "yellow");
                            }
    
                            //make Forecast Planning Unit readonly
                            var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                        }    
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
                var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                cell1.classList.add('doNotImport');
                var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                elInstance.setComments(`J${parseInt(y) + 1}`, "");
            } else {
                try {
                    var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                    cell1.classList.remove('doNotImport');
                } catch (err) { }
            }

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
            elInstance.setStyle(`C${parseInt(y) + 1}`, 'text-align', 'left');
            var rowData = elInstance.getRowData(y);
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
                        if (rowData[12] == 1) {
                            // var columnsCount = el.getHeaders().length;
                            // console.log('columnsCount: ',columnsCount);
                            for (var col = 0; col < colArr.length; col++) {
                                elInstance.getCell((colArr[col]).concat(parseInt(y) + 1)).classList.add('regionBold');
                                // el.setStyle(y, col, 'class', 'regionBold');
                                // elInstance.setStyle((colArr[col]).concat(parseInt(y) + 1), "background-color", "yellow");
                            }
    
                            //make Forecast Planning Unit readonly
                            var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                            cell1.classList.add('readonly');
                        }    
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
                var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                cell1.classList.add('doNotImport');
                var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                elInstance.setComments(`J${parseInt(y) + 1}`, "");
            } else {
                try {
                    var cell1 = elInstance.getCell(`H${parseInt(y) + 1}`)
                    cell1.classList.remove('doNotImport');
                } catch (err) { }
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
        // console.log('programs [0]: '+JSON.stringify(programs[0]));
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {item.programCode}
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
                                        onChange={(e) => { this.setForecastProgramId(e); this.filterSupplyPlanPrograms(e);}}
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
                        {this.state.selSource != undefined && this.state.selSource.length != 0 && this.state.programId!=0 && this.state.versionId!=0 && this.state.forecastProgramId!=0 && this.state.programId!="" && this.state.versionId!="" && this.state.forecastProgramId!="" && <FormGroup className="col-md-2" style={{ "marginLeft": "20px", "marginTop": "28px" }}>
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
                    <div className="" id="spProgramVersionTable" style={{ display: this.state.loading ? "none" : "block", width: '60%'  }}>
                    </div>
                    <FormGroup>
                        <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                    </FormGroup>
                </div>

                <div className="consumptionDataEntryTable datdEntryRow">
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