import CryptoJS from 'crypto-js';
import jexcel from 'jspreadsheet';
import moment from "moment";
import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Prompt } from 'react-router';
import {
    Button, FormGroup
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, SECRET_KEY } from '../../Constants.js';
import ProgramService from '../../api/ProgramService';
import csvicon from '../../assets/img/csv.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { calculateArima } from '../Extrapolation/Arima';
import { calculateLinearRegression } from '../Extrapolation/LinearRegression';
import { calculateMovingAvg } from '../Extrapolation/MovingAverages';
import { calculateSemiAverages } from '../Extrapolation/SemiAverages';
import { calculateTES } from '../Extrapolation/TESNew';
import { addDoubleQuoteToRowContent, dateFormatter } from '../../CommonComponent/JavascriptCommonFunctions';
/**
 * Component for Import from QAT supply plan step three for the import
 */
export default class StepThreeImportMapPlanningUnits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
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
            isChanged1: false,
            confidenceLevelId: 0.85,
            confidenceLevelIdLinearRegression: 0.85,
            confidenceLevelIdArima: 0.85,
            alpha: 0.2,
            beta: 0.2,
            gamma: 0.2,
            noOfMonthsForASeason: 4,
            confidence: 0.95,
            monthsForMovingAverage: 6,
            seasonality: 1,
            p: 0,
            d: 1,
            q: 1,
            CI: "",
            tesData: [],
            arimaData: [],
            jsonDataMovingAvg: [],
            jsonDataSemiAverage: [],
            jsonDataLinearRegression: [],
            jsonDataTes: [],
            jsonDataArima: [],
            count: 0,
            countRecived: 0,
            datasetId: 0,
            listOfPlanningUnits: [],
            datasetDataUnencrypted: {},
            regionListForExtrapolate: []
        }
        this.buildJexcel = this.buildJexcel.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.exportCSV = this.exportCSV.bind(this);
        this.changeColor = this.changeColor.bind(this);
        this.updateMovingAvgData = this.updateMovingAvgData.bind(this);
        this.updateSemiAveragesData = this.updateSemiAveragesData.bind(this);
        this.updateLinearRegressionData = this.updateLinearRegressionData.bind(this);
        this.updateTESData = this.updateTESData.bind(this);
        this.updateArimaData = this.updateArimaData.bind(this);
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
     * Changes the background color of cells based on certain conditions.
     */
    changeColor() {
        var elInstance1 = this.el;
        var elInstance = this.state.languageEl;
        var json = elInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
        for (var j = 0; j < json.length; j++) {
            var rowData = elInstance.getRowData(j);
            var id = rowData[9];
            if (id == 1) {
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
    /**
     * Exports the data to a CSV file.
     */
    exportCSV() {
        var csvRow = [];
        csvRow.push('')
        csvRow.push('')
        const headers = [];
        headers.push('Supply Plan Program (Region)'.replaceAll(' ', '%20'))
        headers.push('Forecast Program (Region)'.replaceAll(' ', '%20'))
        headers.push(i18n.t('static.importFromQATSupplyPlan.supplyPlanPlanningUnit').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.forecastPlanningUnit').replaceAll(' ', '%20'));
        // headers.push(i18n.t('static.program.region').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.inventoryDate.inventoryReport').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.actualConsumption(SupplyPlanModule)').replaceAll(' ', '%20'));
        headers.push('% of Supply Plan'.replaceAll(' ', '%20'))
        headers.push(i18n.t('static.importFromQATSupplyPlan.conversionFactor(SupplyPlantoForecast)').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.convertedActualConsumption(SupplyPlanModule)').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.currentActualConsumption(ForecastModule)').replaceAll(' ', '%20'));
        headers.push(i18n.t('static.quantimed.importData').replaceAll(' ', '%20'));
        var A = [addDoubleQuoteToRowContent(headers)]
        this.state.buildCSVTable.map(ele => A.push(addDoubleQuoteToRowContent([((ele.supplyPlanProgramWithRegion).replaceAll(',', ' ')).replaceAll(' ', '%20'), ((ele.forecastProgramWithRegion).replaceAll(',', ' ')).replaceAll(' ', '%20'), ((ele.supplyPlanPlanningUnit).replaceAll(',', ' ')).replaceAll(' ', '%20'), ((ele.forecastPlanningUnit).replaceAll(',', ' ')).replaceAll(' ', '%20'), dateFormatter(ele.month).replaceAll(' ', '%20'), ele.supplyPlanConsumption != null ? ele.supplyPlanConsumption : "",ele.percentOfSupplyPlan, ele.multiplier, ele.convertedConsumption, ele.currentQATConsumption != null ? ele.currentQATConsumption : "", ele.import == true ? 'Yes' : 'No'])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.importFromQATSupplyPlan.importFromQATSupplyPlan') + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    /**
     * Builds data for extrapolation and runs extrapolation methods
     */
    ExtrapolatedParameters() {
        var listOfPlanningUnits = this.state.listOfPlanningUnits;
        var programData = this.state.datasetDataUnencrypted;
        if (this.state.listOfPlanningUnits.length > 0) {
            this.setState({ loading: true })
            var datasetJson = programData;
            var regionList = this.state.regionListForExtrapolate;
            var count = 0;
            for (var pu = 0; pu < listOfPlanningUnits.length; pu++) {
                for (var i = 0; i < regionList.length; i++) {
                    var actualConsumptionListForPlanningUnitAndRegion = datasetJson.actualConsumptionList.filter(c => c.planningUnit.id == listOfPlanningUnits[pu] && c.region.id == regionList[i]);
                    if (actualConsumptionListForPlanningUnitAndRegion.length > 1) {
                        let minDate = moment.min(actualConsumptionListForPlanningUnitAndRegion.filter(c => c.puAmount >= 0).map(d => moment(d.month)));
                        let maxDate = moment.max(actualConsumptionListForPlanningUnitAndRegion.filter(c => c.puAmount >= 0).map(d => moment(d.month)));
                        let curDate = minDate;
                        var inputDataMovingAvg = [];
                        var inputDataSemiAverage = [];
                        var inputDataLinearRegression = [];
                        var inputDataTes = [];
                        var inputDataArima = [];
                        for (var j = 0; moment(curDate).format("YYYY-MM") < moment(maxDate).format("YYYY-MM"); j++) {
                            curDate = moment(minDate).startOf('month').add(j, 'months').format("YYYY-MM-DD");
                            var consumptionData = actualConsumptionListForPlanningUnitAndRegion.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM"))
                            inputDataMovingAvg.push({ "month": inputDataMovingAvg.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
                            inputDataSemiAverage.push({ "month": inputDataSemiAverage.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
                            inputDataLinearRegression.push({ "month": inputDataLinearRegression.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
                            inputDataTes.push({ "month": inputDataTes.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
                            inputDataArima.push({ "month": inputDataArima.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
                        }
                        var forecastMinDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
                        var forecastMaxDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
                        const monthsDiff = moment(new Date(moment(maxDate).format("YYYY-MM-DD") > moment(forecastMaxDate).format("YYYY-MM-DD") ? moment(maxDate).format("YYYY-MM-DD") : moment(forecastMaxDate).format("YYYY-MM-DD"))).diff(new Date(moment(minDate).format("YYYY-MM-DD") < moment(forecastMinDate).format("YYYY-MM-DD") ? moment(minDate).format("YYYY-MM-DD") : moment(forecastMinDate).format("YYYY-MM-DD")), 'months', true);
                        const noOfMonthsForProjection = (monthsDiff + 1) - inputDataMovingAvg.length;
                        if (inputDataMovingAvg.filter(c => c.actual != null).length >= 3) {
                            count++;
                            calculateMovingAvg(inputDataMovingAvg, this.state.monthsForMovingAverage, noOfMonthsForProjection, this, "importFromQATSP", regionList[i], listOfPlanningUnits[pu]);
                        }
                        if (inputDataMovingAvg.filter(c => c.actual != null).length >= 3) {
                            count++;
                            calculateSemiAverages(inputDataSemiAverage, noOfMonthsForProjection, this, "importFromQATSP", regionList[i], listOfPlanningUnits[pu]);
                        }
                        if (inputDataMovingAvg.filter(c => c.actual != null).length >= 3) {
                            count++;
                            calculateLinearRegression(inputDataLinearRegression, this.state.confidenceLevelIdLinearRegression, noOfMonthsForProjection, this, false, "importFromQATSP", regionList[i], listOfPlanningUnits[pu]);
                        }
                        if (inputDataMovingAvg.filter(c => c.actual != null).length >= 24) {
                            count++;
                            calculateTES(inputDataTes, this.state.alpha, this.state.beta, this.state.gamma, this.state.confidenceLevelId, noOfMonthsForProjection, this, minDate, false, "importFromQATSP", regionList[i], listOfPlanningUnits[pu]);
                        }
                        if (((this.state.seasonality && inputDataMovingAvg.filter(c => c.actual != null).length >= 13) || (!this.state.seasonality && inputDataMovingAvg.filter(c => c.actual != null).length >= 2))) {
                            count++;
                            calculateArima(inputDataArima, this.state.p, this.state.d, this.state.q, this.state.confidenceLevelIdArima, noOfMonthsForProjection, this, minDate, false, this.state.seasonality, "importFromQATSP", regionList[i], listOfPlanningUnits[pu]);
                        }
                    }
                }
            }
            this.setState({
                count: count
            })
        }
    }
    /**
     * Updates the moving average data by adding the provided data to the existing state.
     * @param {Object} data The data to be added to the moving average data set.
     */
    updateMovingAvgData(data) {
        var jsonDataMovingAvg = this.state.jsonDataMovingAvg;
        jsonDataMovingAvg.push(data);
        var countR = this.state.countRecived
        this.setState({
            jsonDataMovingAvg: jsonDataMovingAvg,
            countRecived: countR + 1
        }, () => {
            if (this.state.jsonDataMovingAvg.length
                + this.state.jsonDataSemiAverage.length
                + this.state.jsonDataLinearRegression.length
                + this.state.jsonDataTes.length
                + this.state.jsonDataArima.length
                == this.state.count) {
                this.saveForecastConsumptionExtrapolation();
            }
        })
    }
    /**
     * Updates the semi average data by adding the provided data to the existing state.
     * @param {Object} data The data to be added to the semi average data set.
     */
    updateSemiAveragesData(data) {
        var jsonDataSemiAverage = this.state.jsonDataSemiAverage;
        jsonDataSemiAverage.push(data);
        var countR = this.state.countRecived
        this.setState({
            jsonDataSemiAverage: jsonDataSemiAverage,
            countRecived: countR + 1
        }, () => {
            if (this.state.jsonDataMovingAvg.length
                + this.state.jsonDataSemiAverage.length
                + this.state.jsonDataLinearRegression.length
                + this.state.jsonDataTes.length
                + this.state.jsonDataArima.length
                == this.state.count) {
                this.saveForecastConsumptionExtrapolation();
            }
        })
    }
    /**
     * Updates the linear regression data by adding the provided data to the existing state.
     * @param {Object} data The data to be added to the linear regression data set.
     */
    updateLinearRegressionData(data) {
        var jsonDataLinearRegression = this.state.jsonDataLinearRegression;
        jsonDataLinearRegression.push(data);
        this.setState({
            jsonDataLinearRegression: jsonDataLinearRegression,
            countRecived: this.state.countRecived++
        }, () => {
            if (this.state.jsonDataMovingAvg.length
                + this.state.jsonDataSemiAverage.length
                + this.state.jsonDataLinearRegression.length
                + this.state.jsonDataTes.length
                + this.state.jsonDataArima.length
                == this.state.count) {
                this.saveForecastConsumptionExtrapolation();
            }
        })
    }
    /**
     * Updates the TES data by adding the provided data to the existing state.
     * @param {Object} data The data to be added to the TES data set.
     */
    updateTESData(data) {
        var jsonDataTes = this.state.jsonDataTes;
        jsonDataTes.push(data);
        this.setState({
            jsonDataTes: jsonDataTes,
            countRecived: this.state.countRecived++
        }, () => {
            if (this.state.jsonDataMovingAvg.length
                + this.state.jsonDataSemiAverage.length
                + this.state.jsonDataLinearRegression.length
                + this.state.jsonDataTes.length
                + this.state.jsonDataArima.length
                == this.state.count) {
                this.saveForecastConsumptionExtrapolation();
            }
        })
    }
    /**
     * Updates the ARIMA data by adding the provided data to the existing state.
     * @param {Object} data The data to be added to the ARIMA data set.
     */
    updateArimaData(data) {
        var jsonDataArima = this.state.jsonDataArima;
        jsonDataArima.push(data);
        this.setState({
            jsonDataArima: jsonDataArima,
            countRecived: this.state.countRecived++
        }, () => {
            if (this.state.jsonDataMovingAvg.length
                + this.state.jsonDataSemiAverage.length
                + this.state.jsonDataLinearRegression.length
                + this.state.jsonDataTes.length
                + this.state.jsonDataArima.length
                == this.state.count) {
                this.saveForecastConsumptionExtrapolation();
            }
        })
    }
    /**
     * Saves extrapolation data in indexed DB
     */
    saveForecastConsumptionExtrapolation() {
        this.setState({
            loading: true
        })
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
            this.props.updateState("color", "red");
            this.props.hideFirstComponent();
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var extrapolationMethodTransaction = db1.transaction(['extrapolationMethod'], 'readwrite');
            var extrapolationMethodObjectStore = extrapolationMethodTransaction.objectStore('extrapolationMethod');
            var extrapolationMethodRequest = extrapolationMethodObjectStore.getAll();
            extrapolationMethodRequest.onerror = function (event) {
            }.bind(this);
            extrapolationMethodRequest.onsuccess = function (event) {
                var transaction = db1.transaction(['datasetData'], 'readwrite');
                var datasetTransaction = transaction.objectStore('datasetData');
                let forecastProgramVersionId = this.props.items.forecastProgramVersionId;
                let forecastProgramId = this.props.items.forecastProgramId;
                var datasetId = this.props.items.datasetList.filter(c => c.programId == forecastProgramId && c.versionId == forecastProgramVersionId)[0].id;
                var datasetRequest = datasetTransaction.get(datasetId);
                datasetRequest.onerror = function (event) {
                }.bind(this);
                datasetRequest.onsuccess = function (event) {
                    var extrapolationMethodList = extrapolationMethodRequest.result;
                    var myResult = datasetRequest.result;
                    var datasetDataBytes = CryptoJS.AES.decrypt(myResult.programData, SECRET_KEY);
                    var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                    var datasetJson = JSON.parse(datasetData);
                    var consumptionExtrapolationDataUnFiltered = (datasetJson.consumptionExtrapolation);
                    var listOfPlanningUnits = this.state.listOfPlanningUnits;
                    var regionList = this.state.regionListForExtrapolate;
                    var consumptionExtrapolationList = datasetJson.consumptionExtrapolation;
                    for (var pu = 0; pu < listOfPlanningUnits.length; pu++) {
                        for (var r = 0; r < regionList.length; r++) {
                            var consumptionExtrapolationList = consumptionExtrapolationList.filter(c => c.planningUnit.id != listOfPlanningUnits[pu] || (c.planningUnit.id == listOfPlanningUnits[pu] && c.region.id != regionList[r]));
                            var a = consumptionExtrapolationDataUnFiltered.length > 0 ? Math.max(...consumptionExtrapolationDataUnFiltered.map(o => o.consumptionExtrapolationId)) + 1 : 1;
                            var b = consumptionExtrapolationList.length > 0 ? Math.max(...consumptionExtrapolationList.map(o => o.consumptionExtrapolationId)) + 1 : 1
                            var id = a > b ? a : b;
                            var planningUnitObj = this.props.items.planningUnitList.filter(c => c.id == listOfPlanningUnits[pu])[0];
                            var regionObj = this.state.datasetDataUnencrypted.regionList.filter(c => c.regionId == regionList[r])[0];
                            var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                            var curUser = AuthenticationService.getLoggedInUserId();
                            var datasetJson = this.state.datasetDataUnencrypted;
                            var actualConsumptionListForPlanningUnitAndRegion = datasetJson.actualConsumptionList.filter(c => c.planningUnit.id == listOfPlanningUnits[pu] && c.region.id == regionList[r]);
                            var minDate = moment.min(actualConsumptionListForPlanningUnitAndRegion.filter(c => c.puAmount >= 0).map(d => moment(d.month)));
                            var maxDate = moment.max(actualConsumptionListForPlanningUnitAndRegion.filter(c => c.puAmount >= 0).map(d => moment(d.month)));
                            var jsonDataSemiAvgFilter = this.state.jsonDataSemiAverage.filter(c => c.PlanningUnitId == listOfPlanningUnits[pu] && c.regionId == regionList[r])
                            if (jsonDataSemiAvgFilter.length > 0) {
                                var jsonSemi = jsonDataSemiAvgFilter[0].data;
                                var data = [];
                                for (var i = 0; i < jsonSemi.length; i++) {
                                    data.push({ month: moment(minDate).add(i, 'months').format("YYYY-MM-DD"), amount: jsonSemi[i].forecast != null ? (jsonSemi[i].forecast).toFixed(4) : null, ci: null })
                                }
                                consumptionExtrapolationList.push(
                                    {
                                        "consumptionExtrapolationId": id,
                                        "planningUnit": planningUnitObj,
                                        "region": {
                                            id: regionObj.regionId,
                                            label: regionObj.label
                                        },
                                        "extrapolationMethod": extrapolationMethodList.filter(c => c.id == 6)[0],
                                        "jsonProperties": {
                                            startDate: moment(minDate).format("YYYY-MM-DD"),
                                            stopDate: moment(maxDate).format("YYYY-MM-DD")
                                        },
                                        "createdBy": {
                                            "userId": curUser
                                        },
                                        "createdDate": curDate,
                                        "extrapolationDataList": data
                                    })
                                id += 1;
                            }
                            var data = [];
                            var jsonDataMovingFilter = this.state.jsonDataMovingAvg.filter(c => c.PlanningUnitId == listOfPlanningUnits[pu] && c.regionId == regionList[r])
                            if (jsonDataMovingFilter.length > 0) {
                                var jsonDataMoving = jsonDataMovingFilter[0].data;
                                for (var i = 0; i < jsonDataMoving.length; i++) {
                                    data.push({ month: moment(minDate).add(i, 'months').format("YYYY-MM-DD"), amount: jsonDataMoving[i].forecast != null ? (jsonDataMoving[i].forecast).toFixed(4) : null, ci: null })
                                }
                                consumptionExtrapolationList.push(
                                    {
                                        "consumptionExtrapolationId": id,
                                        "planningUnit": planningUnitObj,
                                        "region": {
                                            id: regionObj.regionId,
                                            label: regionObj.label
                                        },
                                        "extrapolationMethod": extrapolationMethodList.filter(c => c.id == 7)[0],
                                        "jsonProperties": {
                                            months: this.state.monthsForMovingAverage,
                                            startDate: moment(minDate).format("YYYY-MM-DD"),
                                            stopDate: moment(maxDate).format("YYYY-MM-DD")
                                        },
                                        "createdBy": {
                                            "userId": curUser
                                        },
                                        "createdDate": curDate,
                                        "extrapolationDataList": data
                                    })
                            }
                            id += 1;
                            var data = [];
                            var jsonDataLinearFilter = this.state.jsonDataLinearRegression.filter(c => c.PlanningUnitId == listOfPlanningUnits[pu] && c.regionId == regionList[r])
                            if (jsonDataLinearFilter.length > 0) {
                                var jsonDataLinear = jsonDataLinearFilter[0].data;
                                for (var i = 0; i < jsonDataLinear.length; i++) {
                                    data.push({ month: moment(minDate).add(i, 'months').format("YYYY-MM-DD"), amount: jsonDataLinear[i].forecast != null ? (jsonDataLinear[i].forecast).toFixed(4) : null, ci: (jsonDataLinear[i].ci) })
                                }
                                consumptionExtrapolationList.push(
                                    {
                                        "consumptionExtrapolationId": id,
                                        "planningUnit": planningUnitObj,
                                        "region": {
                                            id: regionObj.regionId,
                                            label: regionObj.label
                                        },
                                        "extrapolationMethod": extrapolationMethodList.filter(c => c.id == 5)[0],
                                        "jsonProperties": {
                                            confidenceLevel: this.state.confidenceLevelIdLinearRegression,
                                            startDate: moment(minDate).format("YYYY-MM-DD"),
                                            stopDate: moment(maxDate).format("YYYY-MM-DD")
                                        },
                                        "createdBy": {
                                            "userId": curUser
                                        },
                                        "createdDate": curDate,
                                        "extrapolationDataList": data
                                    })
                                id += 1;
                            }
                            var data = [];
                            var jsonDataTesFilter = this.state.jsonDataTes.filter(c => c.PlanningUnitId == listOfPlanningUnits[pu] && c.regionId == regionList[r])
                            if (jsonDataTesFilter.length > 0) {
                                var jsonDataTes = jsonDataTesFilter[0].data;
                                for (var i = 0; i < jsonDataTes.length; i++) {
                                    data.push({ month: moment(minDate).add(i, 'months').format("YYYY-MM-DD"), amount: jsonDataTes[i].forecast != null ? (jsonDataTes[i].forecast).toFixed(4) : null, ci: (jsonDataTes[i].ci) })
                                }
                                consumptionExtrapolationList.push(
                                    {
                                        "consumptionExtrapolationId": id,
                                        "planningUnit": planningUnitObj,
                                        "region": {
                                            id: regionObj.regionId,
                                            label: regionObj.label
                                        },
                                        "extrapolationMethod": extrapolationMethodList.filter(c => c.id == 2)[0],
                                        "jsonProperties": {
                                            confidenceLevel: this.state.confidenceLevelId,
                                            seasonality: this.state.noOfMonthsForASeason,
                                            alpha: this.state.alpha,
                                            beta: this.state.beta,
                                            gamma: this.state.gamma,
                                            startDate: moment(minDate).format("YYYY-MM-DD"),
                                            stopDate: moment(maxDate).format("YYYY-MM-DD")
                                        },
                                        "createdBy": {
                                            "userId": curUser
                                        },
                                        "createdDate": curDate,
                                        "extrapolationDataList": data
                                    })
                                id += 1;
                            }
                            var data = [];
                            var jsonDataArimaFilter = this.state.jsonDataArima.filter(c => c.PlanningUnitId == listOfPlanningUnits[pu] && c.regionId == regionList[r])
                            if (jsonDataArimaFilter.length > 0) {
                                var jsonDataArima = jsonDataArimaFilter[0].data;
                                for (var i = 0; i < jsonDataArima.length; i++) {
                                    data.push({ month: moment(minDate).add(i, 'months').format("YYYY-MM-DD"), amount: jsonDataArima[i].forecast != null ? (jsonDataArima[i].forecast).toFixed(4) : null, ci: (jsonDataArima[i].ci) })
                                }
                                consumptionExtrapolationList.push(
                                    {
                                        "consumptionExtrapolationId": id,
                                        "planningUnit": planningUnitObj,
                                        "region": {
                                            id: regionObj.regionId,
                                            label: regionObj.label
                                        },
                                        "extrapolationMethod": extrapolationMethodList.filter(c => c.id == 4)[0],
                                        "jsonProperties": {
                                            confidenceLevel: this.state.confidenceLevelIdArima,
                                            seasonality: this.state.seasonality,
                                            p: this.state.p,
                                            d: this.state.d,
                                            q: this.state.q,
                                            startDate: moment(minDate).format("YYYY-MM-DD"),
                                            stopDate: moment(maxDate).format("YYYY-MM-DD")
                                        },
                                        "createdBy": {
                                            "userId": curUser
                                        },
                                        "createdDate": curDate,
                                        "extrapolationDataList": data
                                    })
                                id += 1;
                            }
                        }
                    }
                    datasetJson.consumptionExtrapolation = consumptionExtrapolationList;
                    datasetData = (CryptoJS.AES.encrypt(JSON.stringify(datasetJson), SECRET_KEY)).toString()
                    myResult.programData = datasetData;
                    var putRequest = datasetTransaction.put(myResult);
                    this.setState({
                        dataChanged: false
                    })
                    putRequest.onerror = function (event) {
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.setState({
                            isChanged1: false
                        })
                        localStorage.setItem("sesDatasetId", this.props.items.datasetList[0].id);
                        this.props.history.push(`/dataentry/consumptionDataEntryAndAdjustment/` + 'green/' + i18n.t('static.message.importSuccess'))
                    }.bind(this);
                }.bind(this);
            }.bind(this);
        }.bind(this);
    }
    /**
     * Saves forecast consumption data in indexed db
     */
    formSubmit() {
        confirmAlert({
            title: i18n.t('static.program.confirmsubmit'),
            message: i18n.t('static.importFromQATSupplyPlan.confirmAlert'),
            buttons: [
                {
                    label: i18n.t('static.program.yes'),
                    onClick: () => {
                        this.props.updateStepOneData("loading", true);
                        var tableJson = this.el.getJson(null, false);
                        var listOfForecastPlanningUnits = [...new Set(tableJson.filter(c => c[8].toString() == "true").map(ele => (ele[1])))];
                        var regionListForExtrapolate = [...new Set(tableJson.filter(c => c[8].toString() == "true").map(ele => (ele[10])))];
                        var programs = [];
                        var ImportListNotPink = [];
                        var ImportListPink = [];
                        let datasetList = this.props.items.datasetList
                        let forecastProgramVersionId = this.props.items.forecastProgramVersionId
                        let forecastProgramId = this.props.items.forecastProgramId
                        let selectedForecastProgramObj = datasetList.filter(c => c.programId == forecastProgramId && c.versionId == forecastProgramVersionId)[0];
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                        let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                        let username = decryptedUser.username;
                        for (var i = 0; i < tableJson.length; i++) {
                            var map1 = new Map(Object.entries(tableJson[i]));
                            let selectedPlanningUnitObj = this.props.items.planningUnitList.filter(c => c.id == map1.get("1"))[0];
                            var forecastingUnitObj = selectedPlanningUnitObj.forecastingUnit;
                            forecastingUnitObj.multiplier = map1.get("5");
                            if (map1.get("9") == 0 && map1.get("8") == true) {
                                let regionObj = selectedForecastProgramObj.regionList.filter(c => c.regionId == parseInt(map1.get("10")))[0];
                                let tempJson = {
                                    "actualConsumptionId": null,
                                    "planningUnit": {
                                        "id": selectedPlanningUnitObj.id,
                                        "label": selectedPlanningUnitObj.label,
                                        "forecastingUnit": {
                                            "id": forecastingUnitObj.id,
                                            "label": forecastingUnitObj.label,
                                            "productCategory": {
                                                "id": forecastingUnitObj.productCategory.id,
                                                "label": forecastingUnitObj.productCategory.label,
                                                "idString": '' + forecastingUnitObj.productCategory.id
                                            },
                                            "idString": '' + forecastingUnitObj.id
                                        },
                                        "idString": '' + selectedPlanningUnitObj.id,
                                    },
                                    "puMultiplier": selectedPlanningUnitObj.multiplier,
                                    "region": {
                                        "id": map1.get("10"),
                                        "label": regionObj.label,
                                        "idString": '' + map1.get("10")
                                    },
                                    "month": map1.get("3"),
                                    "amount": parseInt(this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", "")),
                                    "adjustedAmount": parseInt(this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", "")),
                                    "puAmount": parseInt(this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", "")),
                                    "reportingRate": null,
                                    "daysOfStockOut": null,
                                    "exclude": false,
                                    "createdBy": {
                                        "userId": userId,
                                        "username": username
                                    },
                                    "createdDate": moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss")
                                }
                                ImportListNotPink.push(tempJson);
                            }
                            if (map1.get("9") == 1 && map1.get("8") == true) {
                                let tempJsonPink = {
                                    regionId: map1.get("10"),
                                    planningUnitId: map1.get("1"),
                                    month: map1.get("3"),
                                    amount: this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                }
                                ImportListPink.push(tempJsonPink);
                            }
                        }
                        var program = (this.props.items.datasetList1.filter(x => x.programId == this.props.items.forecastProgramId && x.version == this.props.items.forecastProgramVersionId)[0]);
                        var databytes = CryptoJS.AES.decrypt(program.programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                        let originalConsumptionList = programData.actualConsumptionList;
                        for (var i = 0; i < ImportListPink.length; i++) {
                            let index = originalConsumptionList.findIndex(c => new Date(c.month).getTime() == new Date(ImportListPink[i].month).getTime() && c.region.id == ImportListPink[i].regionId && c.planningUnit.id == ImportListPink[i].planningUnitId)
                            if (index != -1) {
                                var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                                var curUser = AuthenticationService.getLoggedInUserId();
                                let indexObj = originalConsumptionList[index];
                                indexObj.amount = ImportListPink[i].amount;
                                indexObj.createdBy = {
                                    userId: curUser
                                };
                                indexObj.createdDate = curDate;
                                originalConsumptionList[index] = indexObj;
                            }
                        }
                        programData.actualConsumptionList = originalConsumptionList.concat(ImportListNotPink);
                        var programDataWithoutEncrypt = programData;
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
                            this.props.updateStepOneData("loading", false);
                        }.bind(this);
                        openRequest.onsuccess = function (e) {
                            db1 = e.target.result;
                            var transaction = db1.transaction(['datasetData'], 'readwrite');
                            transaction.oncomplete = function (event) {
                                db1 = e.target.result;
                                var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                                var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                                var datasetDetailsRequest = datasetDetailsTransaction.get(this.props.items.datasetList[0].id);
                                datasetDetailsRequest.onsuccess = function (e) {
                                    var datasetDetailsRequestJson = datasetDetailsRequest.result;
                                    datasetDetailsRequestJson.changed = 1;
                                    var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                                    datasetDetailsRequest1.onsuccess = function (event) {
                                        this.setState({
                                            listOfPlanningUnits: listOfForecastPlanningUnits,
                                            datasetDataUnencrypted: programDataWithoutEncrypt,
                                            regionListForExtrapolate: regionListForExtrapolate
                                        }, () => {
                                            this.ExtrapolatedParameters();
                                        })
                                    }.bind(this)
                                }.bind(this)
                            }.bind(this);
                            transaction.onerror = function (event) {
                                this.setState({
                                    loading: false,
                                    color: "red",
                                }, () => {
                                    this.hideSecondComponent();
                                    this.props.updateStepOneData("loading", false);
                                });
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
     * Reterives actual consumption data from server
     */
    filterData() {
        let forecastPlanningUnitList = this.props.items.stepOneData.filter(c => c.forecastPlanningUnitId != -1);
        //generate data for ActualConsumptionDataInput
        let programDataList = [];
        let ActualConsumptionData = '';
        let oldProgramId = 0;
        // let planningUnitIds = [];
        for (var i = 0; i < forecastPlanningUnitList.length; i++) {
            let newProgramId = forecastPlanningUnitList[i].supplyPlanProgramId;
            if (newProgramId != oldProgramId) {
                //new sp program data
                let ActualConsumptionData = {
                    programId: forecastPlanningUnitList[i].supplyPlanProgramId,
                    versionId: forecastPlanningUnitList[i].supplyPlanVersionId,
                    planningUnitIds: [forecastPlanningUnitList[i].supplyPlanPlanningUnitId.toString()]
                };

                programDataList.push(ActualConsumptionData);
                // planningUnitIds.push(forecastPlanningUnitList[i].supplyPlanPlanningUnitId.toString());
            } else {
                let obj = programDataList.filter(c => c.programId == newProgramId)[0];
                obj.planningUnitIds.push(forecastPlanningUnitList[i].supplyPlanPlanningUnitId.toString());
            }

            oldProgramId = newProgramId;
        }

        for (var j = 0; j < programDataList.length; j++) {
            let spProgramId = programDataList[j].programId;
            let regionList = this.props.items.stepTwoData.filter(c => c.supplyPlanProgramId == spProgramId);
            let regionIds = regionList.map(ele => ele.supplyPlanRegionId.toString());
            programDataList[j].regionIds = regionIds;
        }

        console.log('programDataList: ', programDataList);

        let supplyPlanPlanningUnitId = forecastPlanningUnitList.map(ele => ele.supplyPlanPlanningUnitId);
        let regionList = this.props.items.stepTwoData.filter(c => c.isRegionInForecastProgram == 1 && c.importRegion == 1);
        let regionIds = regionList.map(ele => ele.supplyPlanRegionId);

        let ActualConsumptionDataInput = {
            programDataList: programDataList, //this will be multiple sp programId's
            startDate: this.props.items.startDate,
            stopDate: this.props.items.stopDate,
        }

        console.log('ActualConsumptionDataInput: ' + JSON.stringify(ActualConsumptionDataInput));

        /*let ActualConsumptionDataInput = {
            programId: this.props.items.programId, //this will be multiple sp programId's
            versionId: this.props.items.versionId, //this will be multiple sp versionId's
            planningUnitIds: supplyPlanPlanningUnitId,
            startDate: this.props.items.startDate,
            stopDate: this.props.items.stopDate,
            regionIds: regionIds // now there will be separate region list for each sp program
        }*/
        ProgramService.getActualConsumptionData(ActualConsumptionDataInput)
            .then(response => {
                if (response.status == 200) {
                    // console.log('ActualConsumptionDataOutput len: '+ JSON.stringify(response.data.length));
                    console.log('inside ActualConsumptionDataInput: ' + JSON.stringify(ActualConsumptionDataInput));
                    // console.log('ActualConsumptionDataOutput: ', response.data);
                    const data = response.data;//getting data in the form of key-value pair
                    // Object.keys(data).forEach(key => {
                    //     console.log(`Key ->`+ key.split('~'));
                    //     console.log(`Key: ${key}`);
                    //     const items = data[key];

                    //     for(var i=0; i < items.length; i++) {
                    //         let planningUnitId = items[i].planningUnit.id;
                    //         console.log('planningUnitId: ',planningUnitId);
                    //         console.log('---');
                    //         break;
                    //     }

                        /*items.forEach(item => {
                            const planningUnitId = item.planningUnit.id;
                            const planningUnitLabelEn = item.planningUnit.label.label_en;
                            // const forecastingUnitLabelEn = item.planningUnit.forecastingUnit.label.label_en;
                            // const regionLabelEn = item.region.label.label_en;
                            // const month = item.month;
                            // const actualConsumption = item.actualConsumption;

                            
                            console.log(`Planning Unit ID: ${planningUnitId}`);
                            console.log(`Planning Unit Label: ${planningUnitLabelEn}`);
                            // console.log(`Forecasting Unit Label: ${forecastingUnitLabelEn}`);
                            // console.log(`Region Label: ${regionLabelEn}`);
                            // console.log(`Month: ${month}`);
                            // console.log(`Actual Consumption: ${actualConsumption}`);
                            console.log('---');
                        });*/
                    // });


                    this.setState({
                        actualConsumptionData: response.data,
                        selSource: response.data
                    }, () => {
                        this.buildJexcel();
                    })
                } else {
                    this.setState({
                        actualConsumptionData: []
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
    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    buildJexcel() {
        var dataMap = this.state.selSource;//getting data in the form of key-value pair
        var data = [];
        var papuDataArr = [];
        var buildCSVTable = [];
        var count = 0;

        Object.keys(dataMap).forEach(key => {
            console.log(`Key: ${key}`);

            let pgmVerKeyArr = key.split('~');
            let programId = pgmVerKeyArr[0];
            let version = pgmVerKeyArr[1];

            let stepOneSelectedObjectList = this.props.items.stepOneData.filter(c => c.supplyPlanProgramId == programId && c.supplyPlanVersionId == version);
            var papuList = dataMap[key];
            for(var j=0; j < papuList.length; j++) {
                let stepOneSelectedObject = stepOneSelectedObjectList.filter(c => c.supplyPlanPlanningUnitId == papuList[j].planningUnit.id)[0];
                let selectedForecastProgram = this.props.items.datasetList.filter(c => c.programId == this.props.items.forecastProgramId && c.versionId == this.props.items.forecastProgramVersionId)[0];
                let match = selectedForecastProgram.actualConsumptionList.filter(c => new Date(c.month).getTime() == new Date(papuList[j].month).getTime() && c.region.id == papuList[j].region.id && c.planningUnit.id == stepOneSelectedObject.supplyPlanPlanningUnitId)
                let supplyPlanProgramCode = stepOneSelectedObject.supplyPlanProgramCode;
                let stepTwoSelectedRegionObject = this.props.items.stepTwoData.filter(c => c.supplyPlanProgramId == programId && c.supplyPlanRegionId == papuList[j].region.id)[0];
                data = [];
                data[0] = supplyPlanProgramCode + ' ('+stepTwoSelectedRegionObject.supplyPlanRegionLabelTxt+')';//SP Program (Region)
                data[1] = selectedForecastProgram.programCode + ' ('+stepTwoSelectedRegionObject.forecastRegionLabelTxt+')';//FC Program (Region)
                data[2] = papuList[j].planningUnit.id; //SP PU
                data[3] = stepOneSelectedObject.forecastPlanningUnitId; //FC PU
                data[4] = papuList[j].month;
                data[5] = papuList[j].actualConsumption; //Actual Consumption. (SP Module)
                data[6] = stepTwoSelectedRegionObject.percentOfSupplyPlan;
                data[7] = stepOneSelectedObject.multiplier; //conversion factor
                data[8] = (stepOneSelectedObject.multiplier * papuList[j].actualConsumption).toFixed(2);//Converted Actual Cons. (SP Module)
                data[9] = (match.length > 0 ? match[0].amount : '') //Current Actual Cons. (FC Module)
                data[10] = true; //import
                data[11] = (match.length > 0 ? 1 : 0); //duplicate
                data[12] = papuList[j].region.id;
                // data[2] = getLabelText(papuList[j].region.label, this.state.lang) //region
                papuDataArr[count] = data;
                count++;
                buildCSVTable.push({
                    supplyPlanProgramWithRegion: data[0],
                    forecastProgramWithRegion: data[1],
                    supplyPlanPlanningUnit: getLabelText(papuList[j].planningUnit.label, this.state.lang) +" | "+ papuList[j].planningUnit.id,
                    forecastPlanningUnit: this.props.items.planningUnitListJexcel.filter(c => c.id == stepOneSelectedObject.forecastPlanningUnitId)[0].name,
                    month: papuList[j].month,
                    supplyPlanConsumption: papuList[j].actualConsumption,
                    percentOfSupplyPlan: stepTwoSelectedRegionObject.percentOfSupplyPlan,
                    multiplier: stepOneSelectedObject.multiplier,
                    convertedConsumption: (stepOneSelectedObject.multiplier * papuList[j].actualConsumption).toFixed(2),
                    // region: getLabelText(papuList[j].region.label, this.state.lang),
                    currentQATConsumption: (match.length > 0 ? match[0].amount : ''),
                    import: true
                })

                // let planningUnitId = items[i].planningUnit.id;
                // console.log('planningUnitId: ',planningUnitId);
                // console.log('---');
                // break;
            }        
            console.log('---');
        });


        /*if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                let stepOneSelectedObject = this.props.items.stepOneData.filter(c => c.supplyPlanPlanningUnitId == papuList[j].planningUnit.id)[0];
                let selectedForecastProgram = this.props.items.datasetList.filter(c => c.programId == this.props.items.forecastProgramId && c.versionId == this.props.items.forecastProgramVersionId)[0];
                let match = selectedForecastProgram.actualConsumptionList.filter(c => new Date(c.month).getTime() == new Date(papuList[j].month).getTime() && c.region.id == papuList[j].region.id && c.planningUnit.id == stepOneSelectedObject.supplyPlanPlanningUnitId)
                
                data = [];
                data[0] = papuList[j].planningUnit.id //SP PU
                data[1] = stepOneSelectedObject.forecastPlanningUnitId //FC PU
                data[2] = getLabelText(papuList[j].region.label, this.state.lang) //region
                data[3] = papuList[j].month
                data[4] = papuList[j].actualConsumption //Actual Consumption. (SP Module)
                data[5] = stepOneSelectedObject.multiplier //conversion factor
                data[6] = (stepOneSelectedObject.multiplier * papuList[j].actualConsumption).toFixed(2)//Converted Actual Cons. (SP Module)
                data[7] = (match.length > 0 ? match[0].amount : '') //Current Actual Cons. (FC Module)
                data[8] = true //import
                data[9] = (match.length > 0 ? 1 : 0) //duplicate
                data[10] = papuList[j].region.id
                papuDataArr[count] = data;
                count++;
                buildCSVTable.push({
                    supplyPlanPlanningUnit: getLabelText(papuList[j].planningUnit.label, this.state.lang),
                    forecastPlanningUnit: this.props.items.planningUnitListJexcel.filter(c => c.id == stepOneSelectedObject.forecastPlanningUnitId)[0].name,
                    region: getLabelText(papuList[j].region.label, this.state.lang),
                    month: papuList[j].month,
                    supplyPlanConsumption: papuList[j].actualConsumption,
                    multiplier: stepOneSelectedObject.multiplier,
                    convertedConsumption: (stepOneSelectedObject.multiplier * papuList[j].actualConsumption).toFixed(2),
                    currentQATConsumption: (match.length > 0 ? match[0].amount : ''),
                    import: true
                })
            }
        }*/
        this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
        jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
        this.el = jexcel(document.getElementById("mapRegion"), '');
        jexcel.destroy(document.getElementById("mapRegion"), true);
        this.el = jexcel(document.getElementById("mapImport"), '');
        jexcel.destroy(document.getElementById("mapImport"), true);
        var json = [];
        var data = papuDataArr;
        let planningUnitListJexcel = this.props.items.planningUnitListJexcel
        planningUnitListJexcel.splice(0, 1);
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            //total 13 column i.e 0 to 12
            columns: [
                {
                    title: 'Supply Plan Program (Region)',
                    // title: i18n.t('static.program.region'),
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Forecast Program (Region)',
                    // title: i18n.t('static.program.region'),
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.supplyPlanPlanningUnit'),
                    type: 'dropdown',
                    source: planningUnitListJexcel,
                    readOnly: true
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.forecastPlanningUnit'),
                    type: 'dropdown',
                    source: planningUnitListJexcel,
                    readOnly: true
                },
                // {
                //     title: i18n.t('static.program.region'),
                //     type: 'text',
                //     textEditor: true,
                //     readOnly: true
                // },
                {
                    title: i18n.t('static.inventoryDate.inventoryReport'),
                    type: 'calendar',
                    options: {
                        format: JEXCEL_MONTH_PICKER_FORMAT,
                        type: 'year-month-picker'
                    },
                    readOnly: true
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.actualConsumption(SupplyPlanModule)'),
                    type: 'numeric',
                    mask: '#,##',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('% of sp'),
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.conversionFactor(SupplyPlantoForecast)'),
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.convertedActualConsumption(SupplyPlanModule)'),
                    type: 'numeric',
                    decimal: '.',
                    mask: '#,##.00',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.currentActualConsumption(ForecastModule)'),
                    type: 'numeric',
                    mask: '#,##',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.quantimed.importData'),
                    type: 'checkbox'
                },
                {
                    title: 'duplicate',
                    type: 'hidden'
                },
                {
                    title: 'regionId',
                    type: 'hidden'
                },
            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el;
                    elInstance.setStyle(`A${parseInt(y) + 1}`, 'text-align', 'left');
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
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            onload: function (obj, x, y, e) {
                jExcelLoadedFunction(obj);
            },
            editable: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this)
        };
        var languageEl = jexcel(document.getElementById("mapImport"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false, buildCSVTable: buildCSVTable, isChanged1: true, datasetId: this.props.items.forecastProgramId
        }, () => {
            this.props.updateStepOneData("loading", false);
            this.changeColor();
        })
    }
    /**
     * Renders the import from QAT supply plan step three screen.
     * @returns {JSX.Element} - Import from QAT supply plan step three screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { rangeValue } = this.state
        return (
            <>
                <Prompt
                    when={this.state.isChanged1 == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <div className="pr-lg-0 Card-header-reporticon">
                    {this.state.buildCSVTable.length > 0 && <div className="card-header-actions">
                        <a className="card-header-action">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </a>
                    </div>}
                </div>
                <AuthenticationServiceComponent history={this.props.history} />
                <div class="col-md-10 mt-2 pl-lg-0 form-group">
                    <ul class="legendcommitversion list-group">
                        <li><span class="legendcolor" style={{ backgroundColor: "yellow", border: "1px solid #000" }}></span>
                            <span class="legendcommitversionText red">{i18n.t('static.importFromQATSupplyPlan.dataAlreadyExistsInForecastProgram')}</span>
                        </li>
                    </ul>
                </div>
                <h5 className="red">{i18n.t('static.importFromQATSupplyPlan.allValuesBelowAreInSupplyPlanningUnits.')}</h5>
                <div className="consumptionDataEntryTable" style={{ display: this.props.items.loading ? "none" : "block" }} >
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
                    <Button color="success" size="md" className="float-right mr-1" type="button" onClick={this.formSubmit}> <i className="fa fa-check"></i>{i18n.t('static.importFromQATSupplyPlan.Import')}</Button>
                    &nbsp;
                    <Button color="info" size="md" className="float-left mr-1 px-4" type="button" onClick={this.props.previousToStepTwo} > <i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                    &nbsp;
                </FormGroup>
            </>
        );
    }
}