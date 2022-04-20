import React, { Component } from 'react';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import csvicon from '../../assets/img/csv.png';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import ReportService from '../../api/ReportService';
import { calculateSupplyPlan } from '../SupplyPlan/SupplyPlanCalculations';


import {
    Badge,
    Button,
    ButtonDropdown,
    ButtonGroup,
    ButtonToolbar,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Col,
    Widgets,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Progress,
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,
    CardColumns,
    Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js';
import ProgramService from '../../api/ProgramService';
import getLabelText from '../../CommonComponent/getLabelText';
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import { jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { FORECAST_DATEPICKER_START_MONTH, JEXCEL_INTEGER_REGEX, JEXCEL_DECIMAL_LEAD_TIME, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PRO_KEY, MONTHS_IN_FUTURE_FOR_AMC, MONTHS_IN_PAST_FOR_AMC, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH, JEXCEL_PAGINATION_OPTION, JEXCEL_MONTH_PICKER_FORMAT, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY, FORECASTED_CONSUMPTION_MODIFIED, QUANTIMED_DATA_SOURCE_ID } from '../../Constants.js';
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import CryptoJS from 'crypto-js';

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

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
            // loading: false,
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
        }
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.exportCSV = this.exportCSV.bind(this);
        this.changeColor = this.changeColor.bind(this);
        this.updateState = this.updateState.bind(this);
        this.redirectToDashbaord = this.redirectToDashbaord.bind(this);



    }
    updateState(parameterName, value) {

        this.setState({
            [parameterName]: value
        })
    }

    redirectToDashbaord() {
        this.props.redirectToDashboard();
    }
    changeColor() {

        var elInstance1 = this.el;
        var elInstance = this.state.languageEl;

        var json = elInstance.getJson();

        // var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
        // for (var j = 0; j < json.length; j++) {
        //     var rowData = elInstance.getRowData(j);            
        //     var id = rowData[9];
        //     if (id == 1) {
        //         for (var i = 0; i < colArr.length; i++) {
        //             elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
        //             elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'yellow');
        //             // let textColor = contrast('#f48282');
        //             // elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'color', textColor);
        //         }
        //     } else {
        //         for (var i = 0; i < colArr.length; i++) {
        //             elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
        //         }
        //     }
        // }

        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
        for (var j = 0; j < json.length; j++) {
            var rowData = elInstance.getRowData(j);
            var id = rowData[9];
            if (id == true) {
                for (var i = 0; i < colArr.length; i++) {
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'yellow');
                }
            } else {
                for (var i = 0; i < colArr.length; i++) {
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                }
            }
        }
    }

    dateFormatter = value => {
        return moment(value).format('MMM YY')
    }

    exportCSV() {

        var csvRow = [];

        // this.state.countryLabels.map(ele =>
        //     csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))

        // csvRow.push('"' + (i18n.t('static.region.country') + ' : ' + document.getElementById("realmCountryId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')

        const headers = [];
        // columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });
        headers.push(i18n.t('static.importFromQATSupplyPlan.supplyPlanPlanningUnit'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.forecastPlanningUnit'));
        headers.push(i18n.t('static.program.region'));
        headers.push(i18n.t('static.inventoryDate.inventoryReport'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.supplyPlanConsumption'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.conversionFactor(SupplyPlantoForecast)'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.convertedConsumption'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.currentQATConsumption'));
        headers.push(i18n.t('static.quantimed.importData'));


        var A = [this.addDoubleQuoteToRowContent(headers)]
        this.state.buildCSVTable.map(ele => A.push(this.addDoubleQuoteToRowContent([((ele.supplyPlanPlanningUnit).replaceAll(',', ' ')).replaceAll(' ', '%20'), ((ele.forecastPlanningUnit).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.region, this.dateFormatter(ele.month).replaceAll(' ', '%20'), ele.supplyPlanConsumption, ele.multiplier, ele.convertedConsumption, ele.currentQATConsumption, ele.import == true ? 'Yes' : 'No'])));
        for (var i = 0; i < A.length; i++) {
            // console.log(A[i])
            csvRow.push(A[i].join(","))

        }

        var csvString = csvRow.join("%0A")
        // console.log('csvString' + csvString)
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.importFromQATSupplyPlan.importFromQATSupplyPlan') + ".csv"
        document.body.appendChild(a)
        a.click()
    }

    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

    formSubmit() {
        var minDate = moment(this.props.items.startDate).format("YYYY-MM-DD");
        var curDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss')));
        var curUser = AuthenticationService.getLoggedInUserId();

        confirmAlert({
            title: i18n.t('static.program.confirmsubmit'),
            message: i18n.t('static.importFromQATSupplyPlan.confirmAlert'),
            buttons: [
                {
                    label: i18n.t('static.program.yes'),
                    onClick: () => {
                        this.props.updateStepOneData("loading", true);
                        var db1;
                        var storeOS;
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
                            console.log("programId in submit12", programId)

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
                                    // var qunatimedData = this.state.selSource;
                                    var finalImportQATData = this.state.selSource;
                                    console.log("finalImportQATData===>", finalImportQATData)

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
                                        // var qunatimedDataFiltered = qunatimedData.filter(c => c.product.programPlanningUnitId == finalPuList[pu]);
                                        // console.log("FINAL-----1", qunatimedData)
                                        var elInstance = this.state.languageEl;

                                        var json = elInstance.getJson();
                                        var finalImportQATDataFilter = finalImportQATData.filter((c,indexFilter) => c.v10 == finalPuList[pu] && json[indexFilter][8]==true);
                                        for (var i = 0; i < finalImportQATDataFilter.length; i++) {
                                            // if (finalImportQATData[i].monthlyForecastData != null) {
                                            // for (var j = 0; j < finalImportQATData[i].monthlyForecastData.length; j++) {

                                            var index = consumptionDataList.findIndex(c => moment(c.consumptionDate).format("YYYY-MM") == moment(finalImportQATDataFilter[i].v4).format("YYYY-MM")
                                                && c.region.id == finalImportQATDataFilter[i].v11
                                                && c.actualFlag.toString() == "false" && c.multiplier == 1);
                                            console.log("FINAL-----2", index)

                                            if (index != -1) {
                                                consumptionDataList[index].consumptionQty = finalImportQATDataFilter[i].v7;
                                                consumptionDataList[index].consumptionRcpuQty = finalImportQATDataFilter[i].v7;
                                                consumptionDataList[index].dataSource.id = QUANTIMED_DATA_SOURCE_ID;

                                                consumptionDataList[index].lastModifiedBy.userId = curUser;
                                                consumptionDataList[index].lastModifiedDate = curDate;
                                            } else {

                                                var consumptionJson = {
                                                    consumptionId: 0,
                                                    dataSource: {
                                                        id: QUANTIMED_DATA_SOURCE_ID
                                                    },
                                                    region: {
                                                        id: finalImportQATDataFilter[i].v11
                                                    },
                                                    consumptionDate: moment(finalImportQATDataFilter[i].v4).startOf('month').format("YYYY-MM-DD"),
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
                                                    notes: "",
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
                                                // }
                                                // }
                                            }
                                            // console.log("consumptionDataList===", consumptionDataList)

                                        }
                                        // console.log("FINAL-----2", programJson.consumptionList)
                                        // console.log("FINAL-----2", generalProgramJson.actionList)


                                        programJson.consumptionList = consumptionDataList;
                                        console.log("FINAL--------------@@@@@@@@@", programJson.consumptionList)

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

                                            var index = finalQATPlanningList.findIndex(c => c == finalImportQATData[i].v10)
                                            console.log("inside success", index)

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

    loaded = function (instance, cell, x, y, value) {

    }

    componentDidMount() {

    }

    handleRangeChange(value, text, listIndex) {
        //
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    filterData() {
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
                console.log("Program data@@@@@@@@@@@@@@@", programData1)
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
                console.log("Props items---------------->", this.props.items);

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

                console.log("OnlineInputJson---------------->", inputJson);
                // var unitDescArr = this.props.items.supplyPlanPlanningUnitIds.map(c);

                // console.log("RESP---------->unitDesc", unitDescArr);
                let tempList = [];
                let supplyPlanPlanningUnitId = [];
                let selectedSupplyPlan = this.props.items.supplyPlanPlanningUnitIds;

                let supplyPlanRegionList = this.props.items.stepTwoData;
                console.log("supplyPlanRegionList@@@@@@@@@@@@@", supplyPlanRegionList)
                // for (let i = 0; i < supplyPlanRegionList.length; i++) {
                for (let j = 0; j < selectedSupplyPlan.length; j++) {
                    supplyPlanPlanningUnitId.push(selectedSupplyPlan[j].supplyPlanPlanningUnitId);
                }
                // }

                ReportService.forecastOutput(inputJson)
                    .then(response => {
                        console.log("RESP---------->forecastOutput", response.data);
                        let primaryConsumptionData = response.data;
                        // var count1 = 1;
                        for (let i = 0; i < primaryConsumptionData.length; i++) {
                            for (let j = 0; j < primaryConsumptionData[i].monthlyForecastData.length; j++) {
                                // for (let k = 0; k < selectedSupplyPlan.length; k++) {
                                // for (let l = 0; l < supplyPlanRegionList.length; l++) {
                                // for (let m = 0; m < supplyPlanRegionList[l].supplyPlanRegionList.length; m++) {
                                // console.log("RESP---------->", supplyPlanRegionList[l].supplyPlanRegionList[m].forecastPercentage);
                                var selectedSupplyPlanPlanningUnit = selectedSupplyPlan.filter(c => c.forecastPlanningUnitId == primaryConsumptionData[i].planningUnit.id);
                                var regionFilter = supplyPlanRegionList.filter(c => c.forecastRegionId == primaryConsumptionData[i].region.id);
                                if (primaryConsumptionData[i].monthlyForecastData[j].month != null) {
                                    var checkConsumptionData = fullConsumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(primaryConsumptionData[i].monthlyForecastData[j].month).format("YYYY-MM") && c.planningUnit.id == selectedSupplyPlanPlanningUnit[0].supplyPlanPlanningUnitId && c.actualFlag.toString() == "false" && c.region.id == regionFilter[0].supplyPlanRegionId && c.multiplier == 1);
                                    tempList.push({
                                        v1: getLabelText(primaryConsumptionData[i].planningUnit.label, this.state.lang),//Forecast planning unit
                                        v2: selectedSupplyPlanPlanningUnit[0].supplyPlanPlanningUnitDesc,//Supply plan planning unit name
                                        v3: regionFilter[0].supplyPlanRegionName,// Supply plan region name
                                        v4: primaryConsumptionData[i].monthlyForecastData[j].month, // Month
                                        v5: Math.round((Number(primaryConsumptionData[i].monthlyForecastData[j].consumptionQty) * Number(regionFilter[0].forecastPercentage) / 100)),//Forecasting module consumption qty
                                        v6: Number(selectedSupplyPlanPlanningUnit[0].multiplier),//Multiplier
                                        v7: Math.round((Number(primaryConsumptionData[i].monthlyForecastData[j].consumptionQty) * Number(regionFilter[0].forecastPercentage) / 100) * Number(selectedSupplyPlanPlanningUnit[0].multiplier)),// Multiplication
                                        v8: checkConsumptionData.length > 0 ? checkConsumptionData[0].consumptionRcpuQty : "",//Supply plan module qty
                                        v9: checkConsumptionData.length > 0 ? true : false,// Check
                                        v10: selectedSupplyPlanPlanningUnit[0].supplyPlanPlanningUnitId,// Supply plan planning unit id
                                        v11: regionFilter[0].supplyPlanRegionId // Supply plan region Id
                                    });
                                }
                                // count1++;
                                // }
                                // }
                            }
                        }
                        this.setState({
                            selSource: tempList,
                            loading: true
                        }, () => {
                            this.buildJexcel();
                        })

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

                console.log("step 3-tempList--->", tempList)
            }.bind(this)
        }.bind(this)
    }

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
                data[5] = papuList[j].v6
                data[6] = papuList[j].v7
                data[7] = papuList[j].v8
                data[8] = true;
                data[9] = papuList[j].v9;
                data[10] = papuList[j].v10;
                data[11] = papuList[j].v11;
                // data[9] = papuList[j].id

                papuDataArr[count] = data;
                count++;

            }
        }

        this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
        this.el.destroy();

        this.el = jexcel(document.getElementById("mapRegion"), '');
        this.el.destroy();

        this.el = jexcel(document.getElementById("mapImport"), '');
        this.el.destroy();

        var json = [];
        var data = papuDataArr;
        // console.log("data.length---------->", data.length);

        let planningUnitListJexcel = this.props.items.planningUnitListJexcel
        planningUnitListJexcel.splice(0, 1);

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            columns: [
                {
                    title: 'Forecast Planning Unit',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Supply Plan Planning Unit',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Supply Plan Region',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Month',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Forecasted Consumption(Forecast Module)',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Conversion Factor (Forecast to Supply Plan)',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Converted Forecasted Consumption(to be imported)',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Current Forecasted Consumption(Supply Plan Module)',
                    type: 'text',
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

                // {
                //     title: 'Id',
                //     type: 'hidden'
                // },


            ],
            pagination: 5000000,
            filters: true,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            // allowDeleteRow: true,
            // onchange: this.changed,
            // oneditionend: this.onedit,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            // onpaste: this.onPaste,
            // oneditionend: this.oneditionend,
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: function (obj, x, y, e) {
                // jExcelLoadedFunctionWithoutPagination(obj);
                jExcelLoadedFunction(obj);
                var asterisk = document.getElementsByClassName("resizable")[0];
                var tr = asterisk.firstChild;
                // tr.children[1].classList.add('AsteriskTheadtrTd');
                // tr.children[2].classList.add('AsteriskTheadtrTd');
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

    render() {

        var { rangeValue } = this.state
        if (this.props.items.startDate != "") {
            var startDate1 = moment(this.props.items.startDate).format("YYYY-MM-DD");
            var stopDate1 = moment(this.props.items.stopDate).format("YYYY-MM-DD");
            // rangeValue = { from: { year: new Date(startDate1).getFullYear(), month: new Date(startDate1).getMonth() + 1 }, to: { year: new Date(stopDate1).getFullYear(), month: new Date(stopDate1).getMonth() + 1 } }
            rangeValue = startDate1 + " ~ " + stopDate1
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

                <div style={{ display: this.props.items.loading ? "none" : "block" }} >
                    <div className="row ">
                        <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">Supply Plan Program</Label>
                            <div className="controls ">
                                <InputGroup>
                                    <Input
                                        type="text"
                                        name="supplyPlanProgramId"
                                        id="supplyPlanProgramId"
                                        bsSize="sm"
                                        // onChange={(e) => { this.setForecastProgramId(e); }}
                                        value={supplyPlan == null ? "" : supplyPlan.programCode}
                                    >
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>

                        <FormGroup className="col-md-4">
                            {/* <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.supplyPlanVersion')}</Label> */}
                            <Label htmlFor="appendedInputButton">Supply Plan version</Label>
                            <div className="controls">
                                <InputGroup>
                                    <Input
                                        type="text"
                                        name="supplyPlanVersionId"
                                        id="supplyPlanVersionId"
                                        bsSize="sm"
                                        // onChange={(e) => { this.setVersionId(e); }}
                                        // value={this.state.versionId}
                                        value={supplyPlan == null ? "" : supplyPlan.programVersion}

                                    >
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>

                        <FormGroup className="col-md-4">
                            {/* <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.forecastProgram')}</Label> */}
                            <Label htmlFor="appendedInputButton">Forecast program</Label>
                            <div className="controls ">
                                <InputGroup>
                                    <Input
                                        type="text"
                                        name="forecastProgramId"
                                        id="forecastProgramId"
                                        bsSize="sm"
                                        value={datasets == null ? "" : datasets.programCode}
                                    >
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>
                        <FormGroup className="col-md-4">
                            {/* <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.forecastProgram')}</Label> */}
                            <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.Range')}<span className="stock-box-icon fa fa-sort-desc"></span></Label>
                            <div className="controls ">
                                <InputGroup>
                                    <Input
                                        type="text"
                                        name="rangeValue"
                                        id="rangeValue"
                                        bsSize="sm"
                                        value={rangeValue}
                                    >
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>
                    </div>

                </div>
                <div className="pr-lg-0 Card-header-reporticon">
                    {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.globalconsumption')}</strong> */}
                    {this.state.buildCSVTable.length > 0 && <div className="card-header-actions">
                        <a className="card-header-action">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </a>
                    </div>}
                </div>
                <AuthenticationServiceComponent history={this.props.history} />
                {/* <h4 className="red">{this.props.message}</h4> */}
                {/* <ul className="legendcommitversion list-group">
                    <li><span className="legendcolor" style={{ backgroundColor: "yellow" }}></span><h5 className="red">Data already exists in Forecast Program</h5></li>
                </ul> */}
                <div class="col-md-10 mt-2 pl-lg-0 form-group">
                    <ul class="legendcommitversion list-group">
                        <li><span class="legendcolor" style={{ backgroundColor: "yellow", border: "1px solid #000" }}></span>
                            {/* <span class="legendcommitversionText red">{i18n.t('static.importFromQATSupplyPlan.dataAlreadyExistsInForecastProgram')}</span> */}
                            <span class="legendcommitversionText red">Data already exists in Supply Plan Program</span>
                        </li>
                    </ul>
                </div>
                {/* <h5 className="red">{i18n.t('static.importFromQATSupplyPlan.allValuesBelowAreInSupplyPlanningUnits.')}</h5> */}
                {/* <p><span className="legendcolor" style={{ backgroundColor: "yellow" }}></span> <span className="legendcommitversionText">abccsvsvsn vrsvw</span></p> */}
                <div className="table-responsive" style={{ display: this.props.items.loading ? "none" : "block" }} >

                    <div id="mapImport">
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
                    {/* <Button color="info" size="md" className="float-right mr-1" type="submit" onClick={() => this.formSubmit()}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button> */}
                    <Button color="success" size="md" className="float-right mr-1" type="button" onClick={this.formSubmit}> <i className="fa fa-check"></i>{i18n.t('static.importFromQATSupplyPlan.Import')}</Button>
                    &nbsp;
                    {/* <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.props.previousToStepOne} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button> */}
                    <Button color="info" size="md" className="float-left mr-1 px-4" type="button" onClick={this.props.previousToStepTwo} > <i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                    &nbsp;
                </FormGroup>
            </>
        );
    }

}