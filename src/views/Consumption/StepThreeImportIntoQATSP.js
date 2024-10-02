import CryptoJS from 'crypto-js';
import jexcel from 'jspreadsheet';
import moment from "moment";
import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {
    Button,
    FormGroup, Input, InputGroup,
    Label,
    Modal,
    ModalBody,
    ModalHeader
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import listImportIntoQATSupplyPlanEn from '../../../src/ShowGuidanceFiles/listImportIntoQATSupplyPlanEn.html';
import listImportIntoQATSupplyPlanFr from '../../../src/ShowGuidanceFiles/listImportIntoQATSupplyPlanFr.html';
import listImportIntoQATSupplyPlanPr from '../../../src/ShowGuidanceFiles/listImportIntoQATSupplyPlanPr.html';
import listImportIntoQATSupplyPlanSp from '../../../src/ShowGuidanceFiles/listImportIntoQATSupplyPlanSp.html';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, FORECASTED_CONSUMPTION_MODIFIED, FORECASTED_CONSUMPTION_MONTHS_IN_PAST, FORECAST_DATEPICKER_START_MONTH, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, QAT_DATASOURCE_ID, SECRET_KEY } from '../../Constants.js';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { calculateSupplyPlan } from '../SupplyPlan/SupplyPlanCalculations';
import { addDoubleQuoteToRowContent } from '../../CommonComponent/JavascriptCommonFunctions';
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
/**
 * Component for Import into QAT supply plan step three for the import
 */
export default class StepThreeImportMapPlanningUnits extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - FORECAST_DATEPICKER_START_MONTH);
        this.state = {
            lang: localStorage.getItem('lang'),
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            selSource: [],
            actualConsumptionData: [],
            stepOneData: [],
            datasetList: [],
            forecastProgramVersionId: '',
            forecastProgramId: '',
            startDate: '',
            stopDate: '',
            buildCSVTable: [],
            languageEl: '',
            consumptionData: [],
            monthArrayList: [],
            realm: {}
        }
        this.buildJexcel = this.buildJexcel.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.exportCSV = this.exportCSV.bind(this);
        this.changeColor = this.changeColor.bind(this);
        this.updateState = this.updateState.bind(this);
        this.redirectToDashbaord = this.redirectToDashbaord.bind(this);
    }
    /**
     * Toggles the visibility of the guidance.
     */
    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }
    /**
     * Updates the component state with the provided parameter name and value.
     * @param {string} parameterName - The name of the parameter to update in the component state.
     * @param {*} value - The new value to set for the parameter.
     */
    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        })
    }
    /**
     * Redirects to the dashboard page.
     */
    redirectToDashbaord() {
        this.props.redirectToDashboard();
    }
    /**
     * Calculates the difference in months between two dates.
     * @param {*} dateFrom The start date.
     * @param {*} dateTo The end date.
     * @returns The difference in months.
     */
    monthDiff(dateFrom, dateTo) {
        return dateTo.getMonth() - dateFrom.getMonth() +
            (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
    }
    /**
     * Changes the background color of cells based on certain conditions.
     */
    changeColor() {
        var elInstance = this.state.languageEl;
        var json = elInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']
        for (var j = 0; j < json.length; j++) {
            var rowData = elInstance.getRowData(j);
            var id = rowData[9];
            var currentForecastedValue = rowData[8];
            var forecastConsumption = rowData[4];
            var isOldDate = rowData[13];
            if (forecastConsumption === "") {
                for (var i = 0; i < colArr.length; i++) {
                    var cell1 = elInstance.getCell(`${colArr[i]}${parseInt(j) + 1}`)
                    cell1.classList.add('readonly');
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                }
            }
            if (id == true && currentForecastedValue !== "") {
                for (var i = 0; i < colArr.length; i++) {
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'yellow');
                }
            } else {
                for (var i = 0; i < colArr.length; i++) {
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                }
            }
            if (!isOldDate && currentForecastedValue !== "") {
                for (var i = 0; i < colArr.length; i++) {
                    var cell1 = elInstance.getCell(`J${parseInt(j) + 1}`)
                    cell1.classList.add('readonly');
                    cell1.classList.add('commitConflict');
                }
            }
        }
    }
    /**
     * Exports the data to a CSV file.
     */
    exportCSV() {
        var csvRow = [];
        const headers = [];
        headers.push(i18n.t('static.importFromQATSupplyPlan.forecastPlanningUnit'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.supplyPlanPlanningUnit'));
        headers.push(i18n.t('static.QATForecastImport.SPRegion'));
        headers.push(i18n.t('static.common.month'));
        headers.push(i18n.t('static.QATForecastImport.forcastConsumption'));
        headers.push(i18n.t('static.QATForecastImport.perOfForecast'));
        headers.push(i18n.t('static.importIntoQATSupplyPlan.conversionFactor'));
        headers.push(i18n.t('static.QATForecastImport.convertedForecastConsumption'));
        headers.push(i18n.t('static.QATForecastImport.currentForecastConsumption'));
        headers.push(i18n.t('static.quantimed.importData'));
        var A = [addDoubleQuoteToRowContent(headers)]
        this.state.buildCSVTable.map(ele => A.push(addDoubleQuoteToRowContent([((ele.v1).replaceAll(',', ' ')).replaceAll(' ', '%20'), ((ele.v2).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.v3, ele.v4.replaceAll(' ', '%20'), ele.v5, ele.v6, ele.v7, ele.v8, ele.v9, ele.v10 == true ? 'Yes' : 'No'])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.importIntoQATSupplyPlan.importIntoQATSupplyPlan') + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    /**
     * Saves consumption data in indexed db
     */
    formSubmit() {
        var minDate = moment(this.props.items.startDate).format("YYYY-MM-DD");
        var curDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss')));
        var curUser = AuthenticationService.getLoggedInUserId();
        var curUserName = AuthenticationService.getLoggedInUsername();
        confirmAlert({
            title: i18n.t('static.program.confirmsubmit'),
            message: i18n.t('static.importFromQATSupplyPlan.confirmAlert'),
            buttons: [
                {
                    label: i18n.t('static.program.yes'),
                    onClick: () => {
                        this.props.updateStepOneData("loading", true);
                        var db1;
                        getDatabase();
                        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                        openRequest.onerror = function (event) {
                            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                            this.props.updateState("color", "#BA0C2F");
                            this.props.hideFirstComponent();
                        }.bind(this);
                        openRequest.onsuccess = function (e) {
                            db1 = e.target.result;
                            var transaction;
                            var programTransaction;
                            transaction = db1.transaction(['programData'], 'readwrite');
                            programTransaction = transaction.objectStore('programData');
                            var programId = this.props.items.programId;
                            var programRequest = programTransaction.get(programId);
                            programRequest.onerror = function (event) {
                                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                                this.props.updateState("color", "#BA0C2F");
                                this.props.hideFirstComponent();
                            }.bind(this);
                            programRequest.onsuccess = function (event) {
                                var programDataJson = programRequest.result.programData;
                                var planningUnitDataList = programDataJson.planningUnitDataList;
                                var generalProgramDataBytes = CryptoJS.AES.decrypt(programDataJson.generalData, SECRET_KEY);
                                var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                                var generalProgramJson = JSON.parse(generalProgramData);
                                var rcpuTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                                var rcpuOs = rcpuTransaction.objectStore('realmCountryPlanningUnit');
                                var rcpuRequest = rcpuOs.getAll();
                                rcpuRequest.onerror = function (event) {
                                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                                    this.props.updateState("color", "#BA0C2F");
                                    this.props.hideFirstComponent();
                                }.bind(this);
                                rcpuRequest.onsuccess = function (event) {
                                    var rcpuResult = [];
                                    rcpuResult = rcpuRequest.result;
                                    var actionList = (generalProgramJson.actionList);
                                    if (actionList == undefined) {
                                        actionList = []
                                    }
                                    var elInstance = this.state.languageEl;
                                    var json = elInstance.getJson();
                                    var finalImportQATDataSelSource = this.state.selSource;
                                    var finalImportQATDataSelSourceFilter = finalImportQATDataSelSource.filter((c, indexFilter) => json[indexFilter][9] == true);
                                    var finalImportQATData = Object.values(finalImportQATDataSelSourceFilter.reduce((a, { v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15, v16, v17, v18 }) => {
                                        if (!a[v16]) {
                                            a[v16] = Object.assign({}, { v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15, v16, v17, v18 });
                                        } else {
                                            a[v16].v7 += v7;
                                        }
                                        return a;
                                    }, {}));
                                    var finalPuList = []
                                    for (var i = 0; i < finalImportQATData.length; i++) {
                                        var index = finalPuList.findIndex(c => c == finalImportQATData[i].v10)
                                        if (index == -1) {
                                            finalPuList.push(parseInt(finalImportQATData[i].v10))
                                            actionList.push({
                                                planningUnitId: parseInt(finalImportQATData[i].v10),
                                                type: FORECASTED_CONSUMPTION_MODIFIED,
                                                date: moment(minDate).startOf('month').format("YYYY-MM-DD")
                                            })
                                        }
                                    }
                                    for (var pu = 0; pu < finalPuList.length; pu++) {
                                        var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == finalPuList[pu]);
                                        var programJson = {}
                                        if (planningUnitDataIndex != -1) {
                                            var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == finalPuList[pu]))[0];
                                            var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                            programJson = JSON.parse(programData);
                                        } else {
                                            programJson = {
                                                consumptionList: [],
                                                inventoryList: [],
                                                shipmentList: [],
                                                batchInfoList: [],
                                                supplyPlan: []
                                            }
                                        }
                                        var consumptionDataList = (programJson.consumptionList);
                                        var finalImportQATDataFilter = finalImportQATData.filter((c, indexFilter) => c.v10 == finalPuList[pu] && c.v18);
                                        for (var i = 0; i < finalImportQATDataFilter.length; i++) {
                                            var index = consumptionDataList.findIndex(c => moment(c.consumptionDate).format("YYYY-MM") == moment(finalImportQATDataFilter[i].v14).format("YYYY-MM")
                                                && c.region.id == finalImportQATDataFilter[i].v11
                                                && c.actualFlag.toString() == "false" && c.multiplier == 1);
                                            var indexWithoutMultiplier1 = consumptionDataList.findIndex(c => moment(c.consumptionDate).format("YYYY-MM") == moment(finalImportQATDataFilter[i].v14).format("YYYY-MM")
                                                && c.region.id == finalImportQATDataFilter[i].v11
                                                && c.actualFlag.toString() == "false");
                                            var remainingConsumptionRecords = consumptionDataList.filter((c, index1) => moment(c.consumptionDate).format("YYYY-MM") == moment(finalImportQATDataFilter[i].v14).format("YYYY-MM")
                                                && c.region.id == finalImportQATDataFilter[i].v11
                                                && c.actualFlag.toString() == "false" && index1 != index && index1 != indexWithoutMultiplier1);
                                            if (index != -1) {
                                                consumptionDataList[index].consumptionQty = finalImportQATDataFilter[i].v7;
                                                consumptionDataList[index].consumptionRcpuQty = finalImportQATDataFilter[i].v7;
                                                consumptionDataList[index].dataSource.id = QAT_DATASOURCE_ID;
                                                consumptionDataList[index].lastModifiedBy.userId = curUser;
                                                consumptionDataList[index].lastModifiedDate = curDate;
                                                consumptionDataList[index].notes = "Imported on " + moment(curDate).format("DD-MMM-YYYY") + " by " + curUserName + " from " + finalImportQATDataFilter[i].v17;
                                            } else if (indexWithoutMultiplier1 != -1) {
                                                consumptionDataList[indexWithoutMultiplier1].consumptionQty = finalImportQATDataFilter[i].v7;
                                                consumptionDataList[indexWithoutMultiplier1].consumptionRcpuQty = finalImportQATDataFilter[i].v7;
                                                consumptionDataList[indexWithoutMultiplier1].dataSource.id = QAT_DATASOURCE_ID;
                                                consumptionDataList[indexWithoutMultiplier1].lastModifiedBy.userId = curUser;
                                                consumptionDataList[indexWithoutMultiplier1].lastModifiedDate = curDate;
                                                consumptionDataList[indexWithoutMultiplier1].notes = "Imported on " + moment(curDate).format("DD-MMM-YYYY") + " by " + curUserName + " from " + finalImportQATDataFilter[i].v17;
                                                consumptionDataList[indexWithoutMultiplier1].realmCountryPlanningUnit = {
                                                    id: rcpuResult.filter(c => c.planningUnit.id == finalImportQATDataFilter[i].v10 && c.multiplier == 1)[0].realmCountryPlanningUnitId,
                                                };
                                                consumptionDataList[indexWithoutMultiplier1].multiplier = 1;
                                            } else {
                                                var consumptionJson = {
                                                    consumptionId: 0,
                                                    dataSource: {
                                                        id: QAT_DATASOURCE_ID
                                                    },
                                                    region: {
                                                        id: finalImportQATDataFilter[i].v11
                                                    },
                                                    consumptionDate: moment(finalImportQATDataFilter[i].v14).startOf('month').format("YYYY-MM-DD"),
                                                    consumptionRcpuQty: finalImportQATDataFilter[i].v7.toString().replaceAll("\,", ""),
                                                    consumptionQty: finalImportQATDataFilter[i].v7.toString().replaceAll("\,", ""),
                                                    dayOfStockOut: "",
                                                    active: true,
                                                    realmCountryPlanningUnit: {
                                                        id: rcpuResult.filter(c => c.planningUnit.id == finalImportQATDataFilter[i].v10 && c.multiplier == 1)[0].realmCountryPlanningUnitId,
                                                    },
                                                    multiplier: 1,
                                                    planningUnit: {
                                                        id: finalImportQATDataFilter[i].v10
                                                    },
                                                    notes: "Imported on " + moment(curDate).format("DD-MMM-YYYY") + " by " + curUserName + " from " + finalImportQATDataFilter[i].v17,
                                                    batchInfoList: [],
                                                    actualFlag: false,
                                                    createdBy: {
                                                        userId: curUser
                                                    },
                                                    createdDate: curDate,
                                                    lastModifiedBy: {
                                                        userId: curUser
                                                    },
                                                    lastModifiedDate: curDate
                                                }
                                                consumptionDataList.push(consumptionJson);
                                            }
                                            remainingConsumptionRecords.map(c => {
                                                c.notes = "De-activated due to forecast import on " + moment(curDate).format("DD-MMM-YYYY");
                                                c.active = false;
                                            })
                                        }
                                        programJson.consumptionList = consumptionDataList;
                                        if (planningUnitDataIndex != -1) {
                                            planningUnitDataList[planningUnitDataIndex].planningUnitData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                                        } else {
                                            planningUnitDataList.push({ planningUnitId: finalPuList[pu], planningUnitData: (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString() });
                                        }
                                    }
                                    generalProgramJson.actionList = actionList;
                                    programDataJson.planningUnitDataList = planningUnitDataList;
                                    programDataJson.generalData = (CryptoJS.AES.encrypt(JSON.stringify(generalProgramJson), SECRET_KEY)).toString()
                                    programRequest.result.programData = programDataJson;
                                    var transaction1;
                                    var programTransaction1;
                                    var finalImportQATData = this.state.selSource;
                                    transaction1 = db1.transaction(['programData'], 'readwrite');
                                    programTransaction1 = transaction1.objectStore('programData');
                                    var putRequest = programTransaction1.put(programRequest.result);
                                    putRequest.onerror = function (event) {
                                        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                                        this.props.updateState("color", "#BA0C2F");
                                        this.props.hideFirstComponent();
                                    }.bind(this);
                                    putRequest.onsuccess = function (event) {
                                        var finalQATPlanningList = [];
                                        for (var i = 0; i < finalImportQATData.length; i++) {
                                            var index = finalQATPlanningList.findIndex(c => c == finalImportQATData[i].v10 && finalImportQATData[i].v18)
                                            if (index == -1) {
                                                finalQATPlanningList.push(parseInt(finalImportQATData[i].v10))
                                            }
                                        }
                                        calculateSupplyPlan(this.props.items.programId, 0, 'programData', 'quantimedImport', this, finalQATPlanningList, minDate);
                                    }.bind(this);
                                }.bind(this);
                            }.bind(this);
                        }.bind(this);
                    }
                },
                {
                    label: i18n.t('static.program.no')
                }
            ]
        });
    }
    /**
     * Retrieves forecast data and supply plan information from an indexed database and API.
     * Processes the data and prepares it for display in the user interface.
     * Updates the component's state with the processed data and loading flags.
     * Handles various error scenarios, such as network errors and authentication failures.
     */
    filterData() {
        document.getElementById("stepThreeImportBtn").disabled = this.props.items.isForecastOver;

        var realmId = AuthenticationService.getRealmId();
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
            var realmTransaction = db1.transaction(['realm'], 'readwrite');
            var realmOS = realmTransaction.objectStore('realm');
            var realmRequest = realmOS.get(realmId);
            realmRequest.onsuccess = function (event) {
                var realm = realmRequest.result;
                var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                var programDataOs = programDataTransaction.objectStore('programData');
                var programRequest = programDataOs.get(this.props.items.programId);
                programRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: '#BA0C2F'
                    })
                    this.hideFirstComponent()
                }.bind(this);
                programRequest.onsuccess = function (e) {
                    var fullConsumptionList = [];
                    var programData1 = programRequest.result.programData;
                    for (var pu = 0; pu < (programData1.planningUnitDataList).length; pu++) {
                        var planningUnitDataIndex = programData1.planningUnitDataList[pu];
                        var programJson = {}
                        if (planningUnitDataIndex != -1) {
                            var planningUnitData = programData1.planningUnitDataList[pu];
                            var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                            var programData2 = programDataBytes.toString(CryptoJS.enc.Utf8);
                            programJson = JSON.parse(programData2);
                        } else {
                            programJson = {
                                consumptionList: [],
                                inventoryList: [],
                                shipmentList: [],
                                batchInfoList: [],
                                supplyPlan: []
                            }
                        }
                        fullConsumptionList = fullConsumptionList.concat(programJson.consumptionList);
                    }
                    var unitIds = ""
                    unitIds = this.props.items.supplyPlanPlanningUnitIds.map(c => c.forecastPlanningUnitId);
                    var startDate = moment(this.props.items.startDate).format("YYYY-MM-DD HH:mm:ss")
                    var stopDate = moment(this.props.items.stopDate).format("YYYY-MM-DD HH:mm:ss")
                    let inputJson = {
                        "programId": Number(this.props.items.forecastProgramId),
                        "versionId": Number(this.props.items.versionId),
                        "startDate": startDate,
                        "stopDate": stopDate,
                        "reportView": 1,
                        "aggregateByYear": false,
                        "unitIds": unitIds
                    }
                    let tempList = [];
                    let supplyPlanPlanningUnitId = [];
                    let selectedSupplyPlan = this.props.items.supplyPlanPlanningUnitIds;
                    let supplyPlanRegionList = this.props.items.stepTwoData;
                    for (let j = 0; j < selectedSupplyPlan.length; j++) {
                        supplyPlanPlanningUnitId.push(selectedSupplyPlan[j].supplyPlanPlanningUnitId);
                    }
                    ReportService.forecastOutput(inputJson)
                        .then(response => {
                            let primaryConsumptionData = response.data;
                            for (let i = 0; i < primaryConsumptionData.length; i++) {
                                let rem = 0;
                                for (let j = 0; j < primaryConsumptionData[i].monthlyForecastData.length; j++) {
                                    var selectedSupplyPlanPlanningUnit = selectedSupplyPlan.filter(c => c.forecastPlanningUnitId == primaryConsumptionData[i].planningUnit.id);
                                    var regionFilter = supplyPlanRegionList.filter(c => c.forecastRegionId == primaryConsumptionData[i].region.id);
                                    if (primaryConsumptionData[i].monthlyForecastData[j].month != null && regionFilter.length > 0 && primaryConsumptionData[i].monthlyForecastData[j].consumptionQty != null) {
                                        var diff = this.monthDiff(new Date(primaryConsumptionData[i].monthlyForecastData[j].month), new Date());
                                        var isOldDate = diff < (realm.forecastConsumptionMonthsInPast + 1);
                                        var checkConsumptionData = fullConsumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(primaryConsumptionData[i].monthlyForecastData[j].month).format("YYYY-MM") && c.planningUnit.id == selectedSupplyPlanPlanningUnit[0].supplyPlanPlanningUnitId && c.actualFlag.toString() == "false" && c.region.id == regionFilter[0].supplyPlanRegionId);
                                        var totalConsumption = 0;
                                        checkConsumptionData.map(item => {
                                            totalConsumption += Number(item.consumptionQty)
                                        })
                                        rem = rem + Number(primaryConsumptionData[i].monthlyForecastData[j].consumptionQty) % 1;
                                        let temp_consumptionQty = Math.floor(primaryConsumptionData[i].monthlyForecastData[j].consumptionQty)
                                        if (rem > 1) {
                                            temp_consumptionQty += 1;
                                            rem -= 1;
                                        }
                                        tempList.push({
                                            v1: getLabelText(primaryConsumptionData[i].planningUnit.label, this.state.lang),//Forecast planning unit
                                            v2: selectedSupplyPlanPlanningUnit[0].supplyPlanPlanningUnitDesc,//Supply plan planning unit name
                                            v3: regionFilter[0].supplyPlanRegionName,// Supply plan region name
                                            v4: moment(primaryConsumptionData[i].monthlyForecastData[j].month).format("MMM-YY"), // Month
                                            v5: primaryConsumptionData[i].monthlyForecastData[j].consumptionQty == null ? "" : Number(Number(primaryConsumptionData[i].monthlyForecastData[j].consumptionQty)).toFixed(2),//Forecasting module consumption qty
                                            v6: Number(selectedSupplyPlanPlanningUnit[0].multiplier),//Multiplier
                                            v7: primaryConsumptionData[i].monthlyForecastData[j].consumptionQty == null ? "" : Number((Number(temp_consumptionQty) * Number(regionFilter[0].forecastPercentage) / 100) * Number(selectedSupplyPlanPlanningUnit[0].multiplier)).toFixed(2),// Multiplication
                                            v8: checkConsumptionData.length > 0 ? totalConsumption : "",//Supply plan module qty
                                            v9: checkConsumptionData.length > 0 ? true : false,// Check
                                            v10: selectedSupplyPlanPlanningUnit[0].supplyPlanPlanningUnitId,// Supply plan planning unit id
                                            v11: regionFilter[0].supplyPlanRegionId, // Supply plan region Id
                                            v12: primaryConsumptionData[i].planningUnit.id, // Forecast planning unit Id
                                            v13: primaryConsumptionData[i].monthlyForecastData[j].month + "~" + selectedSupplyPlanPlanningUnit[0].supplyPlanPlanningUnitId + "~" + regionFilter[0].supplyPlanRegionId + "~" + primaryConsumptionData[i].planningUnit.id,
                                            v14: primaryConsumptionData[i].monthlyForecastData[j].month, // Month without format
                                            v15: regionFilter[0].forecastPercentage,// % of forecast
                                            v16: primaryConsumptionData[i].monthlyForecastData[j].month + "~" + selectedSupplyPlanPlanningUnit[0].supplyPlanPlanningUnitId + "~" + regionFilter[0].supplyPlanRegionId,
                                            v17: primaryConsumptionData[i].selectedForecast.label_en + " from " + this.props.items.selectedForecastProgramDesc + " v" + this.props.items.versionId,
                                            v18: AuthenticationService.checkUserACL([this.props.items.programId.split("_")[0].toString()], "ROLE_BF_READONLY_ACCESS_REALM_ADMIN") ? true : isOldDate
                                        });
                                    }
                                }
                            }
                            let resultTrue = Object.values(tempList.reduce((a, { v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15, v16, v17, v18 }) => {
                                if (!a[v13]) {
                                    a[v13] = Object.assign({}, { v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15, v16, v17, v18 });
                                } else {
                                    a[v13].v7 += v7;
                                    a[v13].v5 += v5;
                                }
                                return a;
                            }, {}));
                            this.setState({
                                selSource: resultTrue,
                                realm: realm,
                                loading: true
                            }, () => {
                                this.buildJexcel();
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
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }
    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];
        var buildCSVTable = [];
        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                data = [];
                data[0] = papuList[j].v1
                data[1] = papuList[j].v2
                data[2] = papuList[j].v3
                data[3] = papuList[j].v4
                data[4] = papuList[j].v5
                data[5] = papuList[j].v15
                data[6] = papuList[j].v6
                data[7] = papuList[j].v7
                data[8] = papuList[j].v8
                data[9] = papuList[j].v5 !== "" && papuList[j].v18 ? true : false;
                data[10] = papuList[j].v9;
                data[11] = papuList[j].v10;
                data[12] = papuList[j].v11;
                data[13] = papuList[j].v18;
                papuDataArr[count] = data;
                count++;
                buildCSVTable.push({
                    v1: papuList[j].v1,
                    v2: papuList[j].v2,
                    v3: papuList[j].v3,
                    v4: papuList[j].v4,
                    v5: papuList[j].v5,
                    v6: papuList[j].v15,
                    v7: papuList[j].v6,
                    v8: papuList[j].v7,
                    v9: papuList[j].v8,
                    v10: true,
                })
            }
        }
        this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
        jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
        this.el = jexcel(document.getElementById("mapRegion"), '');
        jexcel.destroy(document.getElementById("mapRegion"), true);
        this.el = jexcel(document.getElementById("mapImport"), '');
        jexcel.destroy(document.getElementById("mapImport"), true);
        var data = papuDataArr;
        let planningUnitListJexcel = this.props.items.planningUnitListJexcel
        planningUnitListJexcel.splice(0, 1);
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            columns: [
                {
                    title: i18n.t('static.importFromQATSupplyPlan.forecastPlanningUnit'),
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.supplyPlanPlanningUnit'),
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.QATForecastImport.SPRegion'),
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.month'),
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.QATForecastImport.forcastConsumption'),
                    type: 'numeric',
                    decimal: '.',
                    mask: '#,##.00',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.QATForecastImport.perOfForecast'),
                    type: 'numeric',
                    decimal: '.',
                    mask: '#,##.00',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.importIntoQATSupplyPlan.conversionFactor'),
                    type: 'numeric',
                    decimal: '.',
                    mask: '#,##.00',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.QATForecastImport.convertedForecastConsumption'),
                    type: 'numeric',
                    decimal: '.',
                    mask: '#,##.00',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.QATForecastImport.currentForecastConsumption'),
                    type: 'numeric',
                    decimal: '.',
                    mask: '#,##.00',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.quantimed.importData'),
                    type: 'checkbox'
                },
                {
                    type: 'hidden',
                    title: "Already exists"
                },
                {
                    type: 'hidden',
                    title: "Supply Planning unit Id"
                },
                {
                    type: 'hidden',
                    title: "Supply Planning Region Id"
                },
                {
                    title: 'Is Old Data?',
                    type: 'hidden'
                },
            ],
            pagination: 5000000,
            filters: true,
            search: true,
            columnSorting: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            onload: function (obj, x, y, e) {
                jExcelLoadedFunction(obj);
            },
            editable: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: false,
        };
        var languageEl = jexcel(document.getElementById("mapImport"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false, buildCSVTable: buildCSVTable
        }, () => {
            this.props.updateStepOneData("loading", false);
            this.changeColor();
        })
    }
    /**
     * Renders the import into QAT supply plan step three screen.
     * @returns {JSX.Element} - Import into QAT supply plan step three screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        var { rangeValue } = this.state
        if (this.props.items.startDate != "") {
            var startDate1 = moment(this.props.items.startDate).format("MMM YYYY");
            var stopDate1 = moment(this.props.items.stopDate).format("MMM YYYY");
            rangeValue = startDate1 + " to " + stopDate1
        }
        let datasetList = this.props.items.datasetList;
        let datasets = null
        datasets = datasetList.filter(c => c.programId == this.props.items.forecastProgramId)[0]
        let supplyPlanList = this.props.items.programs;
        let supplyPlan = null
        supplyPlan = supplyPlanList.filter(c => c.id == this.props.items.programId)[0]
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div12">{this.state.message}</h5>
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
                <div style={{ display: this.props.items.loading ? "none" : "block" }} >
                    <div className="row ">
                        <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.supplyPlanProgram')}</Label>
                            <div className="controls ">
                                <InputGroup>
                                    <Input
                                        type="text"
                                        name="supplyPlanProgramId"
                                        id="supplyPlanProgramId"
                                        bsSize="sm"
                                        value={supplyPlan == null ? "" : supplyPlan.programCode}
                                        readOnly
                                    >
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>
                        <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">Supply Plan version</Label>
                            <div className="controls">
                                <InputGroup>
                                    <Input
                                        type="text"
                                        name="supplyPlanVersionId"
                                        id="supplyPlanVersionId"
                                        bsSize="sm"
                                        value={supplyPlan == null ? "" : supplyPlan.programVersion}
                                        readOnly
                                    >
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>
                        <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">Forecast program</Label>
                            <div className="controls ">
                                <InputGroup>
                                    <Input
                                        type="text"
                                        name="forecastProgramId"
                                        id="forecastProgramId"
                                        bsSize="sm"
                                        value={datasets == null ? "" : datasets.programCode}
                                        readOnly
                                    >
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>
                        <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.Range')}<span className="stock-box-icon fa fa-sort-desc"></span></Label>
                            <div className="controls ">
                                <InputGroup>
                                    <Input
                                        type="text"
                                        name="rangeValue"
                                        id="rangeValue"
                                        bsSize="sm"
                                        value={rangeValue}
                                        readOnly
                                    >
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>
                    </div>
                </div>
                <div className="pr-lg-0 Card-header-reporticon">
                    {this.state.buildCSVTable.length > 0 && <div className="card-header-actions">
                        <a className="card-header-action">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </a>
                    </div>}
                </div>
                <AuthenticationServiceComponent history={this.props.history} />
                <div class="col-md-10 mt-2 pl-lg-0 form-group" style={{ display: this.props.items.loading ? "none" : "block" }}>
                    <ul class="legendcommitversion list-group">
                        <li><span class="legendcolor" style={{ backgroundColor: "yellow", border: "1px solid #000" }}></span>
                            <span class="legendcommitversionText red">Data already exists in Supply Plan Program</span>
                        </li>
                        <li><span class="legendcolor" style={{ backgroundColor: "#a5a3a3", border: "1px solid #000" }}></span>
                            <span class="legendcommitversionText red">Data exists in Supply Plan Program and is past {this.state.realm.forecastConsumptionMonthsInPast} months, so it cannot be imported.</span>
                        </li>
                    </ul>
                </div>
                <p className='DarkThColr' style={{ display: this.props.items.loading ? "none" : "block" }}>{i18n.t('static.versionSettings.note')}: <i>{i18n.t('static.importIntoSupplyPlan.notes')}</i></p>
                <div className="consumptionDataEntryTable">
                    <div id="mapImport" style={{ display: this.props.items.loading ? "none" : "block" }}>
                    </div>
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
                <FormGroup>
                    <Button color="success" size="md" className="float-right mr-1" id="stepThreeImportBtn" type="button" onClick={this.formSubmit}> <i className="fa fa-check"></i>{i18n.t('static.importFromQATSupplyPlan.Import')}</Button>
                    <span class="red float-right " style={{ marginTop: '7px', marginRight: '5px', display: this.props.items.isForecastOver ? "block" : "none" }}>{i18n.t('static.versionSettings.note')}: <i>{i18n.t('static.importIntoSupplyPlan.forecastRestrictionNotes')}</i></span>
                    &nbsp;
                    <Button color="info" size="md" className="float-left mr-1 px-4" type="button" onClick={this.props.previousToStepTwo} > <i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                    &nbsp;
                </FormGroup>
            </>
        );
    }
}