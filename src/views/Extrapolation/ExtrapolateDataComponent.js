import React from "react";
import ReactDOM from 'react-dom';
import regression from 'regression';
import { std, sqrt, mean, abs } from 'mathjs';
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form, InputGroup, Modal, ModalHeader, ModalFooter, ModalBody, Row, Table, PopoverBody, Popover
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, SECRET_KEY, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_MONTH_PICKER_FORMAT } from "../../Constants";
import i18n from '../../i18n';
import CryptoJS from 'crypto-js'
import getLabelText from "../../CommonComponent/getLabelText";
import jexcel from 'jexcel-pro';
import { DATE_FORMAT_CAP, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import csvicon from '../../assets/img/csv.png';
import { Bar, Line, Pie } from 'react-chartjs-2';
import moment from "moment"
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'


export default class ExtrapolateDataComponent extends React.Component {
    constructor(props) {
        super(props);
        this.options = props.options;
        var startDate1 = moment(Date.now()).subtract(6, 'months').startOf('month').format("YYYY-MM-DD");
        var endDate1 = moment(Date.now()).add(18, 'months').startOf('month').format("YYYY-MM-DD")
        var startDate = moment("2021-05-01").format("YYYY-MM-DD");
        var endDate = moment("2022-02-01").format("YYYY-MM-DD");


        this.state = {
            forecastProgramId: -1,
            forecastProgramList: [],
            planningUnitId: -1,
            planningUnitList: [],
            regionId: -1,
            regionList: [],
            monthArray: [],
            actualConsumptionList: [],
            inputDataFilter: [],
            inputDataAverageFilter: [],
            inputDataRegressionFilter: [],
            tesdataFilter: [],
            consumptionData: [],
            tesdataFilterLowerBond: [],
            tesdataFilterUpperBond: [],
            lang: localStorage.getItem("lang"),
            movingAvgId: true,
            startMonthForExtrapolation: '',
            semiAvgId: true,
            linearRegressionId: true,
            smoothingId: true,
            rmse: "",
            mape: "",
            mse: "",
            rSqd: "",
            wape: "",
            rmseSemi: "",
            mapeSemi: "",
            mseSemi: "",
            rSqdSemi: "",
            wapeSemi: "",
            rmseMovingAvg: "",
            mapeMovingAvg: "",
            mseMovingAvg: "",
            rSqdMovingAvg: "",
            wapeMovingAvg: "",

            rmseLinearReg: "",
            mapeLinearReg: "",
            mseLinearReg: "",
            rSqdLinearReg: "",
            wapeLinearReg: "",
            alpha: 0.2,
            beta: 0.2,
            gamma: 0.2,
            noOfMonthsForASeason: 12,
            confidence: 0.95,
            monthsForMovingAverage: 6,
            CI: "",
            // showAdvanceId: true,
            arimaId: true,
            dataList: [{ 'months': 'Jan-2020', 'actuals': '155', 'tesLcb': '155', 'tesM': '155', 'tesUcb': '155', 'arimaForecast': '155', 'linearRegression': '211', 'semiAveragesForecast': '277', 'movingAverages': '' }, { 'months': 'Feb-2020', 'actuals': '180', 'tesLcb': '180', 'tesM': '180', 'tesUcb': '180', 'arimaForecast': '180', 'linearRegression': '225', 'semiAveragesForecast': '283', 'movingAverages': '155' }, { 'months': 'Mar-2020', 'actuals': '260', 'tesLcb': '260', 'tesM': '260', 'tesUcb': '260', 'arimaForecast': '260', 'linearRegression': '240', 'semiAveragesForecast': '288', 'movingAverages': '168' }, { 'months': 'Apr-2020', 'actuals': '560', 'tesLcb': '560', 'tesM': '560', 'tesUcb': '560', 'arimaForecast': '560', 'linearRegression': '254', 'semiAveragesForecast': '294', 'movingAverages': '198' }, { 'months': 'May-2020', 'actuals': '160', 'tesLcb': '160', 'tesM': '160', 'tesUcb': '160', 'arimaForecast': '160', 'linearRegression': '268', 'semiAveragesForecast': '299', 'movingAverages': '289' }, { 'months': 'Jun-2020', 'actuals': '185', 'tesLcb': '185', 'tesM': '185', 'tesUcb': '185', 'arimaForecast': '185', 'linearRegression': '282', 'semiAveragesForecast': '304', 'movingAverages': '263' }, { 'months': 'Jul-2020', 'actuals': '270', 'tesLcb': '270', 'tesM': '270', 'tesUcb': '270', 'arimaForecast': '270', 'linearRegression': '297', 'semiAveragesForecast': '310', 'movingAverages': '269' }, { 'months': 'Aug-2020', 'actuals': '600', 'tesLcb': '600', 'tesM': '600', 'tesUcb': '600', 'arimaForecast': '600', 'linearRegression': '311', 'semiAveragesForecast': '315', 'movingAverages': '287' }, { 'months': 'Sep-2020', 'actuals': '165', 'tesLcb': '165', 'tesM': '165', 'tesUcb': '165', 'arimaForecast': '165', 'linearRegression': '325', 'semiAveragesForecast': '321', 'movingAverages': '355' }, { 'months': 'Oct-2020', 'actuals': '190', 'tesLcb': '190', 'tesM': '190', 'tesUcb': '190', 'arimaForecast': '190', 'linearRegression': '339', 'semiAveragesForecast': '326', 'movingAverages': '276' }, { 'months': 'Nov-2020', 'actuals': '280', 'tesLcb': '280', 'tesM': '280', 'tesUcb': '280', 'arimaForecast': '280', 'linearRegression': '354', 'semiAveragesForecast': '332', 'movingAverages': '282' }, { 'months': 'Dec-2020', 'actuals': '635', 'tesLcb': '635', 'tesM': '635', 'tesUcb': '635', 'arimaForecast': '635', 'linearRegression': '368', 'semiAveragesForecast': '337', 'movingAverages': '301' }, { 'months': 'Jan-2021', 'actuals': '172', 'tesLcb': '172', 'tesM': '172', 'tesUcb': '172', 'arimaForecast': '172', 'linearRegression': '382', 'semiAveragesForecast': '342', 'movingAverages': '374' }, { 'months': 'Feb-2021', 'actuals': '226', 'tesLcb': '226', 'tesM': '226', 'tesUcb': '226', 'arimaForecast': '226', 'linearRegression': '396', 'semiAveragesForecast': '348', 'movingAverages': '288' }, { 'months': 'Mar-2021', 'actuals': '329', 'tesLcb': '329', 'tesM': '329', 'tesUcb': '329', 'arimaForecast': '329', 'linearRegression': '411', 'semiAveragesForecast': '353', 'movingAverages': '301' }, { 'months': 'Apr-2021', 'actuals': '721', 'tesLcb': '721', 'tesM': '721', 'tesUcb': '721', 'arimaForecast': '721', 'linearRegression': '425', 'semiAveragesForecast': '359', 'movingAverages': '328' }, { 'months': 'May-2021', 'actuals': '', 'tesLcb': '332', 'tesM': '', 'tesUcb': '', 'arimaForecast': '363', 'linearRegression': '439', 'semiAveragesForecast': '364', 'movingAverages': '417' }, { 'months': 'Jun-2021', 'actuals': '', 'tesLcb': '619', 'tesM': '', 'tesUcb': '', 'arimaForecast': '362', 'linearRegression': '453', 'semiAveragesForecast': '370', 'movingAverages': '373' }, { 'months': 'Jul-2021', 'actuals': '', 'tesLcb': '575', 'tesM': '', 'tesUcb': '', 'arimaForecast': '361', 'linearRegression': '468', 'semiAveragesForecast': '375', 'movingAverages': '413' }, { 'months': 'Aug-2021', 'actuals': '', 'tesLcb': '280', 'tesM': '', 'tesUcb': '', 'arimaForecast': '360', 'linearRegression': '482', 'semiAveragesForecast': '381', 'movingAverages': '451' }, { 'months': 'Sep-2021', 'actuals': '', 'tesLcb': '389', 'tesM': '', 'tesUcb': '', 'arimaForecast': '359', 'linearRegression': '496', 'semiAveragesForecast': '386', 'movingAverages': '475' }, { 'months': 'Oct-2021', 'actuals': '', 'tesLcb': '540', 'tesM': '', 'tesUcb': '', 'arimaForecast': '358', 'linearRegression': '510', 'semiAveragesForecast': '391', 'movingAverages': '426' }, { 'months': 'Nov-2021', 'actuals': '', 'tesLcb': '359', 'tesM': '', 'tesUcb': '', 'arimaForecast': '358', 'linearRegression': '525', 'semiAveragesForecast': '397', 'movingAverages': '427' }, { 'months': 'Dec-2021', 'actuals': '', 'tesLcb': '834', 'tesM': '', 'tesUcb': '', 'arimaForecast': '357', 'linearRegression': '539', 'semiAveragesForecast': '402', 'movingAverages': '438' }, { 'months': 'Jan-2022', 'actuals': '', 'tesLcb': '437', 'tesM': '', 'tesUcb': '', 'arimaForecast': '357', 'linearRegression': '553', 'semiAveragesForecast': '408', 'movingAverages': '443' }, { 'months': 'Feb-2022', 'actuals': '', 'tesLcb': '756', 'tesM': '', 'tesUcb': '', 'arimaForecast': '356', 'linearRegression': '567', 'semiAveragesForecast': '413', 'movingAverages': '442' }],
            rangeValue: { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } },
            rangeValue1: { from: { year: new Date(startDate1).getFullYear(), month: new Date(startDate1).getMonth() + 1 }, to: { year: new Date(endDate1).getFullYear(), month: new Date(endDate1).getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            popoverOpenMa: false,
            popoverOpenSa: false,
            popoverOpenLr: false,
            popoverOpenTes: false,
            popoverOpenArima: false,
            extrapolationMethodId: -1,
            confidenceLevelId: 80,
            showGuidance: false,
            showData: false
        }
        this.toggle = this.toggle.bind(this)
        this.reset = this.reset.bind(this)
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.pickRange = React.createRef();

        this._handleClickRangeBox1 = this._handleClickRangeBox1.bind(this)

        this.handleRangeDissmis1 = this.handleRangeDissmis1.bind(this);
        this.pickRange1 = React.createRef();
    }
    componentDidMount = function () {
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
            var programDataTransaction = db1.transaction(['datasetData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('datasetData');
            var programRequest = programDataOs.getAll();
            programRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
                this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var forecastProgramList = [];
                var myResult = programRequest.result;
                for (var i = 0; i < myResult.length; i++) {
                    var datasetDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                    var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                    var datasetJson = JSON.parse(datasetData);
                    var forecastProgramJson = {
                        name: datasetJson.programCode,
                        id: myResult[i].id,
                        regionList: datasetJson.regionList,
                        planningUnitList: datasetJson.planningUnitList,
                        datasetData: datasetJson
                    }
                    forecastProgramList.push(forecastProgramJson)
                }
                this.setState({
                    forecastProgramList: forecastProgramList
                })
            }.bind(this)
        }.bind(this)

    }

    getDatasetData(e) {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;

            var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
            var datasetOs = datasetTransaction.objectStore('datasetData');
            var dsRequest = datasetOs.get(this.state.forecastProgramId);
            dsRequest.onerror = function (event) {
            }.bind(this);
            dsRequest.onsuccess = function (event) {
                var datasetData = dsRequest.result;
                console.log("datasetData-----" + datasetData);
                var datasetDataBytes = CryptoJS.AES.decrypt(datasetData.programData, SECRET_KEY);
                var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);

                var datasetJson = JSON.parse(datasetData);
                console.log("datasetJson&&&&&&&&&&&&&&&&&", datasetJson)
                var actualConsumptionList = datasetJson.actualConsumptionList;
                console.log(actualConsumptionList[0])
                //            var pu = this.state.planningUnitList.filter(c => c.planningUnitId == this.state.selectedPlanningUnitId)[0];
                var regionList = datasetJson.regionList;
                var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
                var stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
                var consumptionExtrapolationList = datasetJson.consumptionExtrapolation;
                var monthsForMovingAverage = 6;
                var consumptionExtrapolationData = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 6)//Semi Averages
                var consumptionExtrapolationMovingData = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 7)//Moving averages
                console.log("consumptionExtrapolationMovingData+++", consumptionExtrapolationMovingData)
                var consumptionExtrapolationRegression = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 5)//Linear Regression
                if (consumptionExtrapolationMovingData.length > 0) {
                    monthsForMovingAverage = consumptionExtrapolationMovingData[0].jsonProperties.months;
                }
                var monthArray = [];
                var curDate = startDate;
                for (var m = 0; curDate < moment(stopDate).add(-1, 'months').format("YYYY-MM-DD"); m++) {
                    curDate = moment(startDate).add(m, 'months').format("YYYY-MM-DD");
                    monthArray.push(curDate)
                }
                console.log("actualConsumptionList" + actualConsumptionList);
                this.setState({
                    //consumptionList: consumptionList,
                    actualConsumptionList: actualConsumptionList,
                    regionList: regionList,
                    startDate: startDate,
                    stopDate: stopDate,
                    // consumptionUnitList: consumptionUnitList,
                    monthArray: monthArray,
                    datasetJson: datasetJson,
                    monthsForMovingAverage: monthsForMovingAverage

                    // planningUnitList: planningUnitList,
                    // forecastingUnitList: forecastingUnitList
                }, () => { this.buildJxl(); })
            }.bind(this)
        }.bind(this)
    }

    reset() {
        console.log('Inside reset')
        this.componentDidMount();
    }

    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })
    }
    handleRangeDissmis1(value) {
        this.setState({ rangeValue1: value })
    }

    buildJxl() {
        var actualConsumptionList = this.state.actualConsumptionList;
        var monthArray = this.state.monthArray;
        let dataArray = [];

        let data = [];
        let columns = [];
        var inputData = [];
        var inputDataAverage = [];
        var inputDataRegression = [];
        var tesdata = [];
        var startMonth = '';
        console.log("this.state.regionId", this.state.regionId)
        console.log("this.state.planningUnitId", this.state.planningUnitId)
        console.log("monthArray", monthArray)
        for (var j = 0; j < monthArray.length; j++) {
            console.log("monthArray[j]", monthArray[j])

            var consumptionData = actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId)

            console.log("consumptionData", consumptionData)
            //if (consumptionData.length > 0) {
            if (inputData.length == 0) {
                startMonth = monthArray[j];
            }
            if (inputDataAverage.length == 0) {
                startMonth = monthArray[j];
            }
            if (inputDataRegression.length == 0) {
                startMonth = monthArray[j];
            }
            if (tesdata.length == 0) {
                startMonth = monthArray[j];
            }
            inputData.push({ "month": inputData.length + 1, "actual": consumptionData.length > 0 ? consumptionData[0].amount : null, "forecast": null })
            inputDataAverage.push({ "month": inputDataAverage.length + 1, "actual": consumptionData.length > 0 ? consumptionData[0].amount : null, "forecast": null })
            inputDataRegression.push({ "month": inputDataRegression.length + 1, "actual": consumptionData.length > 0 ? consumptionData[0].amount : null, "forecast": null })
            tesdata.push({ "month": tesdata.length + 1, "actual": consumptionData.length > 0 ? consumptionData[0].amount : null, "forecast": null })

        }
        //}
        console.log("inputDataRegression---", inputDataRegression)
        console.log("tesdata---", tesdata)
        const noOfMonthsForProjection = monthArray.length - inputData.length + 1;
        if (inputData.length % 2 != 0) {
            inputData.pop();
        }
        if (inputDataAverage.length % 2 != 0) {
            inputDataAverage.pop();
        }
        if (inputDataRegression.length % 2 != 0) {
            inputDataRegression.pop();
        }
        if (tesdata.length % 2 != 0) {
            tesdata.pop();
        }
        console.log("inputData[inputData.length - 1]", inputData[inputData.length - 1])
        let actualMonths = inputData[inputData.length - 1].month;

        //Semi Average
        if (inputData.length > 0) {
            console.log(inputData);
            let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
            let cnt = 0;
            let m = 0;
            let c = 0;
            for (let x = 1; x <= actualMonths / 2; x++) {
                x1 += inputData[x - 1].month;
                y1 += inputData[x - 1].actual;
                cnt++;
            }
            x1 = x1 / cnt;
            y1 = y1 / cnt;
            for (let x = actualMonths / 2 + 1; x <= actualMonths; x++) {
                x2 += inputData[x - 1].month;
                y2 += inputData[x - 1].actual;
            }
            x2 = x2 / cnt;
            y2 = y2 / cnt;
            m = (y2 - y1) / (x2 - x1);
            c = m * (0 - x2) + y2;

            for (let x = 1; x <= actualMonths + noOfMonthsForProjection; x++) {
                if (x <= actualMonths) {
                    inputData[x - 1].forecast = m * x + c;
                } else {
                    inputData[x - 1] = { "month": x, "actual": null, "forecast": m * x + c };
                }
            }
        }
        // Moving Average

        if (inputDataAverage.length > 0) {
            // var actualMonths = inputDataAverage[inputDataAverage.length - 1].month;
            var monthsForMovingAverage = this.state.monthsForMovingAverage;

            for (let x = 1; x <= actualMonths + noOfMonthsForProjection; x++) {
                console.log("x--->", x)
                var forecast = '';
                let startMonth = x - monthsForMovingAverage;
                if (startMonth < 1) {
                    startMonth = 1;
                }
                let endMonth = x - 1;
                if (endMonth < 1) {
                    forecast = null;
                }
                console.log("startMonth=" + startMonth + ", endMonth=" + endMonth);
                let sum = 0;
                let count = 0;
                for (let x = startMonth; x <= endMonth; x++) {
                    console.log("x%%%%%", x)
                    if (x <= actualMonths) {
                        sum += inputDataAverage[x - 1].actual;
                        count++;
                    } else {
                        sum += inputDataAverage[x - 1].forecast;
                        count++;
                    }
                }
                console.log("sum=" + sum + ", count=" + count);
                if (count == 0) {
                    forecast = null;
                } else {
                    forecast = sum / count;
                }

                if (x <= actualMonths) {
                    inputDataAverage[x - 1].forecast = forecast;
                } else {
                    inputDataAverage[x - 1] = { "month": x, "actual": null, "forecast": forecast };
                }
            }
        }
        //Regression        
        let actualMonthsRegression = inputDataRegression[inputDataRegression.length - 1].month;
        let tmpArray = new Array();
        for (let x = 0; x < inputDataRegression.length; x++) {
            tmpArray.push(new Array(inputDataRegression[x].month, inputDataRegression[x].actual));
        }

        const result = regression.linear(tmpArray);
        const gradient = result.equation[0];
        const yIntercept = result.equation[1];
        for (let x = 1; x <= actualMonthsRegression + noOfMonthsForProjection; x++) {
            console.log("x--", x)
            if (x <= actualMonthsRegression) {
                console.log("x-1", x - 1)
                console.log("inputDataRegression%%%%%%%", inputDataRegression)
                inputDataRegression[x - 1].forecast = gradient * x + yIntercept;
            } else {
                inputDataRegression[x - 1] = { "month": x, "actual": null, "forecast": gradient * x + yIntercept };
            }
        }
        console.log("inputDataRegression", inputDataRegression);
        //Holts-Winters
        const alpha = 0.2
        const beta = 0.2
        const gamma = 0.2
        const noOfMonthsForASeason = 4
        const confidence = 0.95

        // var alpha =  document.getElementById("alphaId").value;
        // var beta =  document.getElementById("betaId").value;
        // var gamma =  document.getElementById("gammaId").value;
        // var noOfMonthsForASeason =  document.getElementById("seasonalityId").value;
        // var confidence =  document.getElementById("confidenceLevelId").value;
        console.log("noOfMonthsForASeason", noOfMonthsForASeason);
        console.log("confidence", confidence);
        console.log("gamma", gamma);
        const tTable = [
            { "df": 1, "zValue": [1.963, 3.078, 6.314, 31.82, 63.66, 318.31] },
            { "df": 2, "zValue": [1.386, 1.886, 2.92, 6.965, 9.925, 22.327] },
            { "df": 3, "zValue": [1.25, 1.638, 2.353, 4.541, 5.841, 10.215] },
            { "df": 4, "zValue": [1.19, 1.533, 2.132, 3.747, 4.604, 7.173] },
            { "df": 5, "zValue": [1.156, 1.476, 2.015, 3.365, 4.032, 5.893] },
            { "df": 6, "zValue": [1.134, 1.44, 1.943, 3.143, 3.707, 5.208] },
            { "df": 7, "zValue": [1.119, 1.415, 1.895, 2.998, 3.499, 4.785] },
            { "df": 8, "zValue": [1.108, 1.397, 1.86, 2.896, 3.355, 4.501] },
            { "df": 9, "zValue": [1.1, 1.383, 1.833, 2.821, 3.25, 4.297] },
            { "df": 10, "zValue": [1.093, 1.372, 1.812, 2.764, 3.169, 4.144] },
            { "df": 11, "zValue": [1.088, 1.363, 1.796, 2.718, 3.106, 4.025] },
            { "df": 12, "zValue": [1.083, 1.356, 1.782, 2.681, 3.055, 3.93] },
            { "df": 13, "zValue": [1.079, 1.35, 1.771, 2.65, 3.012, 3.852] },
            { "df": 14, "zValue": [1.076, 1.345, 1.761, 2.624, 2.977, 3.787] },
            { "df": 15, "zValue": [1.074, 1.341, 1.753, 2.602, 2.947, 3.733] },
            { "df": 16, "zValue": [1.071, 1.337, 1.746, 2.583, 2.921, 3.686] },
            { "df": 17, "zValue": [1.069, 1.333, 1.74, 2.567, 2.898, 3.646] },
            { "df": 18, "zValue": [1.067, 1.33, 1.734, 2.552, 2.878, 3.61] },
            { "df": 19, "zValue": [1.066, 1.328, 1.729, 2.539, 2.861, 3.579] },
            { "df": 20, "zValue": [1.064, 1.325, 1.725, 2.528, 2.845, 3.552] },
            { "df": 21, "zValue": [1.063, 1.323, 1.721, 2.518, 2.831, 3.527] },
            { "df": 22, "zValue": [1.061, 1.321, 1.717, 2.508, 2.819, 3.505] },
            { "df": 23, "zValue": [1.06, 1.319, 1.714, 2.5, 2.807, 3.485] },
            { "df": 24, "zValue": [1.059, 1.318, 1.711, 2.492, 2.797, 3.467] },
            { "df": 25, "zValue": [1.058, 1.316, 1.708, 2.485, 2.787, 3.45] },
            { "df": 26, "zValue": [1.058, 1.315, 1.706, 2.479, 2.779, 3.435] },
            { "df": 27, "zValue": [1.057, 1.314, 1.703, 2.473, 2.771, 3.421] },
            { "df": 28, "zValue": [1.056, 1.313, 1.701, 2.467, 2.763, 3.408] },
            { "df": 29, "zValue": [1.055, 1.311, 1.699, 2.462, 2.756, 3.396] },
            { "df": 30, "zValue": [1.055, 1.31, 1.697, 2.457, 2.75, 3.385] },
            { "df": 40, "zValue": [1.05, 1.303, 1.684, 2.423, 2.704, 3.307] },
            { "df": 60, "zValue": [1.045, 1.296, 1.671, 2.39, 2.66, 3.232] },
            { "df": 80, "zValue": [1.043, 1.292, 1.664, 2.374, 2.639, 3.195] },
            { "df": 100, "zValue": [1.042, 1.29, 1.66, 2.364, 2.626, 3.174] },
            { "df": 1000, "zValue": [1.037, 1.282, 1.646, 2.33, 2.581, 3.098] }
        ]


        //initial_seasonal_components
        let seasonals = new Array();
        let season_averages = new Array();
        let n_seasons = parseInt(tesdata.length / noOfMonthsForASeason);
        for (let x = 0; x < n_seasons; x++) {
            let sum = 0;
            for (let y = 0; y < noOfMonthsForASeason; y++) {
                sum += tesdata[x * Number(noOfMonthsForASeason) + y].actual
            }
            season_averages.push(sum / noOfMonthsForASeason)
        }
        for (let x = 0; x < noOfMonthsForASeason; x++) {
            let sum = 0;
            for (let y = 0; y < n_seasons; y++) {
                sum += tesdata[y * noOfMonthsForASeason + x].actual - season_averages[y]
            }
            seasonals.push(sum / n_seasons)
        }

        //tes
        let resultarr = new Array();
        let smooth = 0, trend = 0, m = 0, val = 0, last_smooth = 0, last_trend = 0;
        for (var x = 0; x < tesdata.length + 12; x++) {
            if (x == 0) { // initial values
                last_smooth = tesdata[0].actual
                smooth = last_smooth

                //initial_trend
                let sum = 0
                for (var x1 = 0; x1 < noOfMonthsForASeason; x1++) {
                    sum += (tesdata[noOfMonthsForASeason + x1].actual - tesdata[x1].actual) / noOfMonthsForASeason
                }
                last_trend = sum / noOfMonthsForASeason

                trend = last_trend
                resultarr.push(tesdata[0].actual)
            } else if (x >= tesdata.length) {
                m = x - tesdata.length + 1
                resultarr.push((smooth + m * trend) + seasonals[x % noOfMonthsForASeason])
            } else {
                val = tesdata[x].actual
                smooth = alpha * (val - seasonals[x % noOfMonthsForASeason]) + (1 - alpha) * (last_smooth + last_trend)
                trend = beta * (smooth - last_smooth) + (1 - beta) * last_trend
                seasonals[x % noOfMonthsForASeason] = gamma * (val - smooth) + (1 - gamma) * seasonals[x % noOfMonthsForASeason]
                resultarr.push(smooth + trend + seasonals[x % noOfMonthsForASeason])
            }
            last_smooth = smooth;
            last_trend = trend;
        }

        const actualLength = tesdata.length;

        for (let x = 0; x < resultarr.length; x++) {
            if (x >= actualLength) {
                tesdata.push = { "month": (x + 1), "actual": null, "forecast": resultarr[x] }
            } else {
                tesdata[x].forecast = resultarr[x]
            }
        }
        console.log("tesdata", tesdata);


        // get Zvalue:

        let final_t_table = null;
        var zValue = null;
        for (let x = 0; x < tTable.length; x++) {
            if (resultarr.length < tTable[x].df) {
                break;
            }
            final_t_table = tTable[x]
        }
        switch (confidence) {
            case 0.85:
                zValue = final_t_table.zValue[0];
                break;
            case 0.90:
                zValue = final_t_table.zValue[1];
                break;
            case 0.95:
                zValue = final_t_table.zValue[2];
                break;
            case 0.99:
                zValue = final_t_table.zValue[3];
                break;
            case 0.995:
                zValue = final_t_table.zValue[4];
                break;
            case 0.999:
                zValue = final_t_table.zValue[5];
                break;
            default:
                zValue = null;
        }
        console.log("resultarr---", resultarr)
        console.log("Z value = " + zValue)
        const stdDev = std(resultarr)
        console.log("Std dev = " + stdDev)
        const CI = zValue * stdDev / sqrt(resultarr.length)
        console.log("CI = " + CI)

        // error Table for TES
        let cnt = 0
        let xBar = 0
        let yBar = 0
        let xyBar = 0
        let xxBar = 0
        let eBar = 0
        let absEBar = 0
        let absEPerABar = 0
        let e2Bar = 0
        let ePerABar = 0

        for (let x = 0; x < tesdata.length; x++) {
            if (tesdata[x].actual) {
                xBar += tesdata[x].actual
                yBar += tesdata[x].forecast
                xyBar += tesdata[x].actual * tesdata[x].forecast
                xxBar += tesdata[x].actual * tesdata[x].actual
                eBar += tesdata[x].forecast - tesdata[x].actual
                absEBar += abs(tesdata[x].forecast - tesdata[x].actual)
                absEPerABar += abs(tesdata[x].forecast - tesdata[x].actual) / tesdata[x].actual
                e2Bar += (tesdata[x].forecast - tesdata[x].actual) * (tesdata[x].forecast - tesdata[x].actual)
                ePerABar += (tesdata[x].forecast - tesdata[x].actual) / tesdata[x].actual
                cnt++
            }
        }
        let wape = eBar / xBar
        xBar = xBar / cnt
        yBar = yBar / cnt
        xxBar = xxBar / cnt
        xyBar = xyBar / cnt
        eBar = eBar / cnt
        absEBar = absEBar / cnt
        absEPerABar = absEPerABar / cnt
        e2Bar = e2Bar / cnt
        ePerABar = ePerABar / cnt

        var mt = (xyBar - xBar * yBar) / (xxBar - (xBar * xBar))
        let c = yBar - mt * xBar

        let regressionSquaredError = 0
        let totalSquaredError = 0
        for (let x = 0; x < tesdata.length; x++) {
            if (tesdata[x].actual) {
                regressionSquaredError += Math.pow(tesdata[x].forecast - (c + mt * x), 2)
                totalSquaredError += Math.pow(tesdata[x].forecast - yBar, 2)
            }
        }

        var rmse = sqrt(e2Bar)
        var mape = absEPerABar
        var mse = e2Bar
        var rSqd = 1 - (regressionSquaredError / totalSquaredError)

        // console.log("wape",wape)
        // console.log("rmse",rmse)
        // console.log("mape",mape)
        // console.log("mse",mse)
        // console.log("rSqd",rSqd)

        // error Table for Semi
        let cntSemi = 0
        let xBarSemi = 0
        let yBarSemi = 0
        let xyBarSemi = 0
        let xxBarSemi = 0
        let eBarSemi = 0
        let absEBarSemi = 0
        let absEPerABarSemi = 0
        let e2BarSemi = 0
        let ePerABarSemi = 0

        for (let x = 0; x < inputData.length; x++) {
            if (inputData[x].actual) {
                xBarSemi += inputData[x].actual
                yBarSemi += inputData[x].forecast
                xyBarSemi += inputData[x].actual * inputData[x].forecast
                xxBarSemi += inputData[x].actual * inputData[x].actual
                eBarSemi += inputData[x].forecast - inputData[x].actual
                absEBarSemi += abs(inputData[x].forecast - inputData[x].actual)
                absEPerABarSemi += abs(inputData[x].forecast - inputData[x].actual) / inputData[x].actual
                e2BarSemi += (inputData[x].forecast - inputData[x].actual) * (inputData[x].forecast - inputData[x].actual)
                ePerABarSemi += (inputData[x].forecast - inputData[x].actual) / inputData[x].actual
                cntSemi++
            }
        }
        let wapeSemi = eBarSemi / xBarSemi
        xBarSemi = xBarSemi / cntSemi
        yBarSemi = yBarSemi / cntSemi
        xxBarSemi = xxBarSemi / cntSemi
        xyBarSemi = xyBarSemi / cntSemi
        eBarSemi = eBarSemi / cntSemi
        absEBarSemi = absEBarSemi / cntSemi
        absEPerABarSemi = absEPerABarSemi / cntSemi
        e2BarSemi = e2BarSemi / cntSemi
        ePerABarSemi = ePerABarSemi / cntSemi

        var mtSemi = (xyBarSemi - xBarSemi * yBarSemi) / (xxBarSemi - (xBarSemi * xBarSemi))
        let cSemi = yBarSemi - mtSemi * xBarSemi

        let regressionSquaredErrorSemi = 0
        let totalSquaredErrorSemi = 0
        for (let x = 0; x < inputData.length; x++) {
            if (inputData[x].actual) {
                regressionSquaredErrorSemi += Math.pow(inputData[x].forecast - (cSemi + mtSemi * x), 2)
                totalSquaredErrorSemi += Math.pow(inputData[x].forecast - yBarSemi, 2)
            }
        }

        var rmseSemi = sqrt(e2BarSemi)
        var mapeSemi = absEPerABarSemi
        var mseSemi = e2BarSemi
        var rSqdSemi = 1 - (regressionSquaredErrorSemi / totalSquaredErrorSemi)

        // error Table for Moving Avegrage
        let cntMovingAvg = 0
        let xBarMovingAvg = 0
        let yBarMovingAvg = 0
        let xyBarMovingAvg = 0
        let xxBarMovingAvg = 0
        let eBarMovingAvg = 0
        let absEBarMovingAvg = 0
        let absEPerABarMovingAvg = 0
        let e2BarMovingAvg = 0
        let ePerABarMovingAvg = 0

        for (let x = 0; x < inputDataAverage.length; x++) {
            if (inputDataAverage[x].actual) {
                xBarMovingAvg += inputDataAverage[x].actual
                yBarMovingAvg += inputDataAverage[x].forecast
                xyBarMovingAvg += inputDataAverage[x].actual * inputDataAverage[x].forecast
                xxBarMovingAvg += inputDataAverage[x].actual * inputDataAverage[x].actual
                eBarMovingAvg += inputDataAverage[x].forecast - inputDataAverage[x].actual
                absEBarMovingAvg += abs(inputDataAverage[x].forecast - inputDataAverage[x].actual)
                absEPerABarMovingAvg += abs(inputDataAverage[x].forecast - inputDataAverage[x].actual) / inputDataAverage[x].actual
                e2BarMovingAvg += (inputDataAverage[x].forecast - inputDataAverage[x].actual) * (inputDataAverage[x].forecast - inputDataAverage[x].actual)
                ePerABarMovingAvg += (inputDataAverage[x].forecast - inputDataAverage[x].actual) / inputDataAverage[x].actual
                cntMovingAvg++
            }
        }
        let wapeMovingAvg = eBarMovingAvg / xBarMovingAvg
        xBarMovingAvg = xBarMovingAvg / cntMovingAvg
        yBarMovingAvg = yBarMovingAvg / cntMovingAvg
        xxBarMovingAvg = xxBarMovingAvg / cntMovingAvg
        xyBarMovingAvg = xyBarMovingAvg / cntMovingAvg
        eBarMovingAvg = eBarMovingAvg / cntMovingAvg
        absEBarMovingAvg = absEBarMovingAvg / cntMovingAvg
        absEPerABarMovingAvg = absEPerABarMovingAvg / cntMovingAvg
        e2BarMovingAvg = e2BarMovingAvg / cntMovingAvg
        ePerABarMovingAvg = ePerABarMovingAvg / cntMovingAvg

        var mtMovingAvg = (xyBarMovingAvg - xBarMovingAvg * yBarMovingAvg) / (xxBarMovingAvg - (xBarMovingAvg * xBarMovingAvg))
        let cMovingAvg = yBarMovingAvg - mtMovingAvg * xBarMovingAvg

        let regressionSquaredErrorMovingAvg = 0
        let totalSquaredErrorMovingAvg = 0
        for (let x = 0; x < inputDataAverage.length; x++) {
            if (inputDataAverage[x].actual) {
                regressionSquaredErrorMovingAvg += Math.pow(inputDataAverage[x].forecast - (cMovingAvg + mtMovingAvg * x), 2)
                totalSquaredErrorMovingAvg += Math.pow(inputDataAverage[x].forecast - yBarMovingAvg, 2)
            }
        }

        var rmseMovingAvg = sqrt(e2BarMovingAvg)
        var mapeMovingAvg = absEPerABarMovingAvg
        var mseMovingAvg = e2BarMovingAvg
        var rSqdMovingAvg = 1 - (regressionSquaredErrorMovingAvg / totalSquaredErrorMovingAvg)

        // error Table for Linear Reggreassion
        let cntLinearReg = 0
        let xBarLinearReg = 0
        let yBarLinearReg = 0
        let xyBarLinearReg = 0
        let xxBarLinearReg = 0
        let eBarLinearReg = 0
        let absEBarLinearReg = 0
        let absEPerABarLinearReg = 0
        let e2BarLinearReg = 0
        let ePerABarLinearReg = 0

        for (let x = 0; x < inputDataRegression.length; x++) {
            if (inputDataRegression[x].actual) {
                xBarLinearReg += inputDataRegression[x].actual
                yBarLinearReg += inputDataRegression[x].forecast
                xyBarLinearReg += inputDataRegression[x].actual * inputDataRegression[x].forecast
                xxBarLinearReg += inputDataRegression[x].actual * inputDataRegression[x].actual
                eBarLinearReg += inputDataRegression[x].forecast - inputDataRegression[x].actual
                absEBarLinearReg += abs(inputDataRegression[x].forecast - inputDataRegression[x].actual)
                absEPerABarLinearReg += abs(inputDataRegression[x].forecast - inputDataRegression[x].actual) / inputDataRegression[x].actual
                e2BarLinearReg += (inputDataRegression[x].forecast - inputDataRegression[x].actual) * (inputDataRegression[x].forecast - inputDataRegression[x].actual)
                ePerABarLinearReg += (inputDataRegression[x].forecast - inputDataRegression[x].actual) / inputDataRegression[x].actual
                cntLinearReg++
            }
        }
        let wapeLinearReg = eBarLinearReg / xBarLinearReg
        xBarLinearReg = xBarLinearReg / cntLinearReg
        yBarLinearReg = yBarLinearReg / cntLinearReg
        xxBarLinearReg = xxBarLinearReg / cntLinearReg
        xyBarLinearReg = xyBarLinearReg / cntLinearReg
        eBarLinearReg = eBarLinearReg / cntLinearReg
        absEBarLinearReg = absEBarLinearReg / cntLinearReg
        absEPerABarLinearReg = absEPerABarLinearReg / cntLinearReg
        e2BarLinearReg = e2BarLinearReg / cntLinearReg
        ePerABarLinearReg = ePerABarLinearReg / cntLinearReg

        var mtLinearReg = (xyBarLinearReg - xBarLinearReg * yBarLinearReg) / (xxBarLinearReg - (xBarLinearReg * xBarLinearReg))
        let cLinearReg = yBarLinearReg - mtLinearReg * xBarLinearReg

        let regressionSquaredErrorLinearReg = 0
        let totalSquaredErrorLinearReg = 0
        for (let x = 0; x < inputDataRegression.length; x++) {
            if (inputDataRegression[x].actual) {
                regressionSquaredErrorLinearReg += Math.pow(inputDataRegression[x].forecast - (cLinearReg + mtLinearReg * x), 2)
                totalSquaredErrorLinearReg += Math.pow(inputDataRegression[x].forecast - yBarLinearReg, 2)
            }
        }

        var rmseLinearReg = sqrt(e2BarLinearReg)
        var mapeLinearReg = absEPerABarLinearReg
        var mseLinearReg = e2BarLinearReg
        var rSqdLinearReg = 1 - (regressionSquaredErrorLinearReg / totalSquaredErrorLinearReg)


        //Jexcel table
        for (var j = 0; j < monthArray.length; j++) {
            data = [];
            data[0] = monthArray[j];
            var consumptionData = actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId)
            if (consumptionData.length > 0) {
                inputData.push({ "month": inputData.length + 1, "actual": consumptionData[0].amount, "forecast": null })
            }
            var inputDataFilter = inputData.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))
            var inputDataAverageFilter = inputDataAverage.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))
            var inputDataRegressionFilter = inputDataRegression.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))
            var tesdataFilter = tesdata.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))

            //var consumptionData = actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId);
            data[1] = consumptionData.length > 0 ? consumptionData[0].amount : "";
            data[2] = inputDataAverageFilter.length > 0 && inputDataAverageFilter[0].forecast != null ? inputDataAverageFilter[0].forecast.toFixed(2) : '';
            data[3] = inputDataFilter.length > 0 && inputDataFilter[0].forecast != null ? inputDataFilter[0].forecast.toFixed(2) : '';
            data[4] = inputDataRegressionFilter.length > 0 && inputDataRegressionFilter[0].forecast != null ? inputDataRegressionFilter[0].forecast.toFixed(2) : '';
            data[5] = tesdataFilter.length > 0 && tesdataFilter[0].forecast != null ? (tesdataFilter[0].forecast - CI).toFixed(2) : '';
            data[6] = tesdataFilter.length > 0 && tesdataFilter[0].forecast != null ? tesdataFilter[0].forecast.toFixed(2) : '';
            data[7] = tesdataFilter.length > 0 && tesdataFilter[0].forecast != null ? (tesdataFilter[0].forecast + CI).toFixed(2) : '';
            data[8] = '';
            dataArray.push(data)
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        console.log("tesdataFilter88888888888888", tesdataFilter)
        console.log("inputDataFilter88888888888888", inputDataFilter)
        var options = {
            data: dataArray,
            columnDrag: true,
            columns: [
                {
                    title: 'Month',
                    type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100
                },
                {
                    title: 'Adjusted Actuals',
                    type: 'numeric', mask: '#,##.00', decimal: '.'
                },
                {
                    title: 'Moving Averages',
                    type: this.state.movingAvgId ? 'numeric' : 'hidden',
                    mask: '#,##.00', decimal: '.'
                },
                {
                    title: 'Semi-Averages',
                    type: this.state.semiAvgId ? 'numeric' : 'hidden',
                    mask: '#,##.00', decimal: '.'
                },
                {
                    title: 'Linear Regression',
                    type: this.state.linearRegressionId ? 'numeric' : 'hidden',
                    mask: '#,##.00', decimal: '.'
                },
                {
                    title: 'TES (Lower Confidence Bound)',
                    type: this.state.smoothingId ? 'numeric' : 'hidden',
                    mask: '#,##.00', decimal: '.'
                },
                {
                    title: 'TES',
                    type: this.state.smoothingId ? 'numeric' : 'hidden',
                    mask: '#,##.00', decimal: '.'
                },
                {
                    title: 'TES (Upper Confidence Bound)',
                    type: this.state.smoothingId ? 'numeric' : 'hidden',
                    mask: '#,##.00', decimal: '.'
                },
                {
                    title: 'ARIMA',
                    type: this.state.arimaId ? 'numeric' : 'hidden',
                    mask: '#,##.00', decimal: '.'
                }
            ],
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: false,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return [];
            }.bind(this),
        };
        var dataEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = dataEl;
        this.setState({
            dataEl: dataEl, loading: false,
            inputDataFilter: inputData,
            inputDataAverageFilter: inputDataAverage,
            inputDataRegressionFilter: inputDataRegression,
            startMonthForExtrapolation: startMonth,
            tesdataFilter: tesdata,
            rmse: rmse,
            mape: mape,
            mse: mse,
            rSqd: rSqd,
            wape: wape,
            rmseSemi: rmseSemi,
            mapeSemi: mapeSemi,
            mseSemi: mseSemi,
            rSqdSemi: rSqdSemi,
            wapeSemi: wapeSemi,
            rmseMovingAvg: rmseMovingAvg,
            mapeMovingAvg: mapeMovingAvg,
            mseMovingAvg: mseMovingAvg,
            rSqdMovingAvg: rSqdMovingAvg,
            wapeMovingAvg: wapeMovingAvg,
            rmseLinearReg: rmseLinearReg,
            mapeLinearReg: mapeLinearReg,
            mseLinearReg: mseLinearReg,
            rSqdLinearReg: rSqdLinearReg,
            wapeLinearReg: wapeLinearReg,
            consumptionData: consumptionData,
            CI: CI
        })
        console.log("tesdataFilter&&&&&&", this.state.tesdataFilter);
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionWithoutPagination(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;

        tr.children[2].classList.add('InfoTr');
        tr.children[3].classList.add('InfoTr');
        tr.children[4].classList.add('InfoTr');
        tr.children[5].classList.add('InfoTr');
        tr.children[6].classList.add('InfoTr');
        tr.children[7].classList.add('InfoTr');
        tr.children[8].classList.add('InfoTr');
        tr.children[9].classList.add('InfoTr');


    }
    getPlanningUnitList(e) {
        var forecastProgramId = e.target.value;
        if (forecastProgramId != "") {
            var forecastProgramListFilter = this.state.forecastProgramList.filter(c => c.id == forecastProgramId)[0]
            var regionList = forecastProgramListFilter.regionList;
            var startDate = forecastProgramListFilter.datasetData.currentVersion.forecastStartDate;
            var stopDate = forecastProgramListFilter.datasetData.currentVersion.forecastStopDate;
            var rangeValue = { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(stopDate).getFullYear(), month: new Date(stopDate).getMonth() + 1 } }
            this.setState({
                planningUnitList: forecastProgramListFilter.planningUnitList,
                forecastProgramId: forecastProgramId,
                regionList: regionList,
                datasetJson: forecastProgramListFilter.datasetData,
                rangeValue: rangeValue
            })
        } else {
            this.setState({
                forecastProgramId: forecastProgramId,
                planningUnitList: [],
                planningUnitId: "",
                regionId: "",
                regionList: [],
                alpha: 0.2,
                beta: 0.2,
                gamma: 0.2,
                noOfMonthsForASeason: 12,
                confidence: 0.95,
                monthsForMovingAverage: 6,
                confidenceLevelId: 80
            })
        }
    }



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
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var datasetTransaction = transaction.objectStore('datasetData');
            var datasetRequest = datasetTransaction.get(this.state.forecastProgramId);
            datasetRequest.onerror = function (event) {
            }.bind(this);
            datasetRequest.onsuccess = function (event) {
                var myResult = datasetRequest.result;
                var datasetDataBytes = CryptoJS.AES.decrypt(myResult.programData, SECRET_KEY);
                var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                var datasetJson = JSON.parse(datasetData);
                var consumptionExtrapolationList = datasetJson.consumptionExtrapolation;
                var consumptionExtrapolationData = consumptionExtrapolationList.findIndex(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 6)//Semi Averages
                var consumptionExtrapolationMovingData = consumptionExtrapolationList.findIndex(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 7)//Moving averages
                var consumptionExtrapolationRegression = consumptionExtrapolationList.findIndex(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 5)//Linear Regression
                var consumptionExtrapolationTESL = consumptionExtrapolationList.findIndex(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 1)//TES L
                console.log("consumptionExtrapolationTESL+++", consumptionExtrapolationTESL)
                var consumptionExtrapolationTESM = consumptionExtrapolationList.findIndex(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 2)//TES M
                var consumptionExtrapolationTESH = consumptionExtrapolationList.findIndex(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 3)//TES H

                var tesData = this.state.tesdataFilter;
                var CI = this.state.CI;

                var inputDataFilter = this.state.inputDataFilter;
                var inputDataAverageFilter = this.state.inputDataAverageFilter;
                var inputDataRegressionFilter = this.state.inputDataRegressionFilter;
                console.log("consumptionExtrapolationData", consumptionExtrapolationData);
                console.log("inputDataFilter", inputDataFilter);
                //Semi - averages
                if (consumptionExtrapolationData == -1) {
                    var data = [];
                    for (var i = 0; i < inputDataFilter.length; i++) {
                        data.push({ month: moment(this.state.startMonthForExtrapolation).add(inputDataFilter[i].month - 1, 'months').format("YYYY-MM-DD"), amount: inputDataFilter[i].forecast })
                    }
                    consumptionExtrapolationList.push(
                        {
                            "consumptionExtrapolationId": consumptionExtrapolationList.length + 1,
                            "planningUnit": {
                                "id": this.state.planningUnitId,
                                "label": {
                                }
                            },
                            "region": {
                                "id": this.state.regionId,
                                "label": {
                                }
                            },
                            "extrapolationMethod": {
                                "id": 6,
                                "label": {
                                    "createdBy": null,
                                    "createdDate": null,
                                    "lastModifiedBy": null,
                                    "lastModifiedDate": null,
                                    "active": true,
                                    "labelId": 34704,
                                    "label_en": "Semi-Averages",
                                    "label_sp": null,
                                    "label_fr": null,
                                    "label_pr": null
                                }
                            },
                            "jsonProperties": {
                            },
                            "createdBy": {
                                "userId": 1,
                                "username": "Anchal C"
                            },
                            "createdDate": "2021-12-14 12:24:20",
                            "extrapolationDataList": data
                        })
                } else {
                    consumptionExtrapolationList[consumptionExtrapolationData].jsonProperties = {};
                    var data = [];
                    for (var i = 0; i < inputDataFilter.length; i++) {
                        data.push({ month: moment(this.state.startMonthForExtrapolation).add(inputDataFilter[i].month - 1, 'months').format("YYYY-MM-DD"), amount: inputDataFilter[i].forecast })
                    }
                    consumptionExtrapolationList[consumptionExtrapolationData].extrapolationDataList = data;
                }
                console.log("this.state.monthsForMovingAverage+++", this.state.monthsForMovingAverage)
                console.log("consumptionExtrapolationMovingData+++", consumptionExtrapolationMovingData);
                //Moving Averages
                if (consumptionExtrapolationMovingData == -1) {
                    var data = [];
                    for (var i = 0; i < inputDataAverageFilter.length; i++) {
                        data.push({ month: moment(this.state.startMonthForExtrapolation).add(inputDataAverageFilter[i].month - 1, 'months').format("YYYY-MM-DD"), amount: inputDataAverageFilter[i].forecast })
                    }
                    consumptionExtrapolationList.push(
                        {
                            "consumptionExtrapolationId": consumptionExtrapolationList.length + 1,
                            "planningUnit": {
                                "id": this.state.planningUnitId,
                                "label": {
                                }
                            },
                            "region": {
                                "id": this.state.regionId,
                                "label": {
                                }
                            },
                            "extrapolationMethod": {
                                "id": 7,
                                "label": {
                                    "createdBy": null,
                                    "createdDate": null,
                                    "lastModifiedBy": null,
                                    "lastModifiedDate": null,
                                    "active": true,
                                    "labelId": 34705,
                                    "label_en": "Moving Averages",
                                    "label_sp": null,
                                    "label_fr": null,
                                    "label_pr": null
                                }
                            },
                            "jsonProperties": {
                                months: this.state.monthsForMovingAverage
                            },
                            "createdBy": {
                                "userId": 1,
                                "username": "Anchal C"
                            },
                            "createdDate": "2021-12-14 12:24:20",
                            "extrapolationDataList": data
                        })
                }
                else {
                    consumptionExtrapolationList[consumptionExtrapolationMovingData].jsonProperties = { months: this.state.monthsForMovingAverage };
                    var data = [];
                    for (var i = 0; i < inputDataAverageFilter.length; i++) {
                        data.push({ month: moment(this.state.startMonthForExtrapolation).add(inputDataAverageFilter[i].month - 1, 'months').format("YYYY-MM-DD"), amount: inputDataAverageFilter[i].forecast })
                    }
                    consumptionExtrapolationList[consumptionExtrapolationMovingData].extrapolationDataList = data;
                }
                //Linear Regression
                if (consumptionExtrapolationRegression == -1) {
                    var data = [];
                    for (var i = 0; i < inputDataRegressionFilter.length; i++) {
                        data.push({ month: moment(this.state.startMonthForExtrapolation).add(inputDataRegressionFilter[i].month - 1, 'months').format("YYYY-MM-DD"), amount: inputDataRegressionFilter[i].forecast })
                    }
                    consumptionExtrapolationList.push(
                        {
                            "consumptionExtrapolationId": consumptionExtrapolationList.length + 1,
                            "planningUnit": {
                                "id": this.state.planningUnitId,
                                "label": {
                                }
                            },
                            "region": {
                                "id": this.state.regionId,
                                "label": {
                                }
                            },
                            "extrapolationMethod": {
                                "id": 5,
                                "label": {
                                    "createdBy": null,
                                    "createdDate": null,
                                    "lastModifiedBy": null,
                                    "lastModifiedDate": null,
                                    "active": true,
                                    "labelId": 34703,
                                    "label_en": "Linear Regression",
                                    "label_sp": null,
                                    "label_fr": null,
                                    "label_pr": null
                                }
                            },
                            "jsonProperties": {
                            },
                            "createdBy": {
                                "userId": 1,
                                "username": "Anchal C"
                            },
                            "createdDate": "2021-12-14 12:24:20",
                            "extrapolationDataList": data
                        })
                } else {
                    consumptionExtrapolationList[consumptionExtrapolationRegression].jsonProperties = {};
                    var data = [];
                    for (var i = 0; i < inputDataRegressionFilter.length; i++) {
                        data.push({ month: moment(this.state.startMonthForExtrapolation).add(inputDataRegressionFilter[i].month - 1, 'months').format("YYYY-MM-DD"), amount: inputDataRegressionFilter[i].forecast })
                    }
                    consumptionExtrapolationList[consumptionExtrapolationRegression].extrapolationDataList = data;
                }
                //TES L
                console.log("consumptionExtrapolationTESL@@@", consumptionExtrapolationTESL)
                if (consumptionExtrapolationTESL == -1) {
                    console.log("in if1")
                    var data = [];
                    for (var i = 0; i < tesData.length; i++) {
                        data.push({ month: moment(this.state.startMonthForExtrapolation).add(tesData[i].month - 1, 'months').format("YYYY-MM-DD"), amount: (Number(tesData[i].forecast) - Number(CI)) })
                    }
                    consumptionExtrapolationList.push(
                        {
                            "consumptionExtrapolationId": consumptionExtrapolationList.length + 1,
                            "planningUnit": {
                                "id": this.state.planningUnitId,
                                "label": {
                                }
                            },
                            "region": {
                                "id": this.state.regionId,
                                "label": {
                                }
                            },
                            "extrapolationMethod": {
                                "id": 1,
                                "label": {
                                    "createdBy": null,
                                    "createdDate": null,
                                    "lastModifiedBy": null,
                                    "lastModifiedDate": null,
                                    "active": true,
                                    "labelId": 34703,
                                    "label_en": "TES Low Confidence",
                                    "label_sp": null,
                                    "label_fr": null,
                                    "label_pr": null
                                }
                            },
                            "jsonProperties": {
                                confidenceLevel: this.state.confidenceLevelId,
                                seasonality: this.state.noOfMonthsForASeason,
                                alpha: this.state.alpha,
                                beta: this.state.beta,
                                gamma: this.state.gamma
                            },
                            "createdBy": {
                                "userId": 1,
                                "username": "Anchal C"
                            },
                            "createdDate": "2021-12-14 12:24:20",
                            "extrapolationDataList": data
                        })
                } else {
                    console.log("in else 1")
                    consumptionExtrapolationList[consumptionExtrapolationTESL].jsonProperties = {
                        confidenceLevel: this.state.confidenceLevelId,
                        seasonality: this.state.noOfMonthsForASeason,
                        alpha: this.state.alpha,
                        beta: this.state.beta,
                        gamma: this.state.gamma
                    };
                    var data = [];
                    for (var i = 0; i < tesData.length; i++) {
                        data.push({ month: moment(this.state.startMonthForExtrapolation).add(tesData[i].month - 1, 'months').format("YYYY-MM-DD"), amount: (Number(tesData[i].forecast) - Number(CI)) })
                    }
                    consumptionExtrapolationList[consumptionExtrapolationTESL].extrapolationDataList = data;
                }
                //TES M
                if (consumptionExtrapolationTESM == -1) {
                    console.log("in if2")
                    var data = [];
                    for (var i = 0; i < tesData.length; i++) {
                        data.push({ month: moment(this.state.startMonthForExtrapolation).add(tesData[i].month - 1, 'months').format("YYYY-MM-DD"), amount: (Number(tesData[i].forecast)) })
                    }
                    consumptionExtrapolationList.push(
                        {
                            "consumptionExtrapolationId": consumptionExtrapolationList.length + 1,
                            "planningUnit": {
                                "id": this.state.planningUnitId,
                                "label": {
                                }
                            },
                            "region": {
                                "id": this.state.regionId,
                                "label": {
                                }
                            },
                            "extrapolationMethod": {
                                "id": 2,
                                "label": {
                                    "createdBy": null,
                                    "createdDate": null,
                                    "lastModifiedBy": null,
                                    "lastModifiedDate": null,
                                    "active": true,
                                    "labelId": 34703,
                                    "label_en": "TES Med Confidence",
                                    "label_sp": null,
                                    "label_fr": null,
                                    "label_pr": null
                                }
                            },
                            "jsonProperties": {
                                confidenceLevel: this.state.confidenceLevelId,
                                seasonality: this.state.noOfMonthsForASeason,
                                alpha: this.state.alpha,
                                beta: this.state.beta,
                                gamma: this.state.gamma
                            },
                            "createdBy": {
                                "userId": 1,
                                "username": "Anchal C"
                            },
                            "createdDate": "2021-12-14 12:24:20",
                            "extrapolationDataList": data
                        })
                } else {
                    console.log("in else 2")
                    consumptionExtrapolationList[consumptionExtrapolationTESM].jsonProperties = {
                        confidenceLevel: this.state.confidenceLevelId,
                        seasonality: this.state.noOfMonthsForASeason,
                        alpha: this.state.alpha,
                        beta: this.state.beta,
                        gamma: this.state.gamma
                    };
                    var data = [];
                    for (var i = 0; i < tesData.length; i++) {
                        data.push({ month: moment(this.state.startMonthForExtrapolation).add(tesData[i].month - 1, 'months').format("YYYY-MM-DD"), amount: (Number(tesData[i].forecast)) })
                    }
                    consumptionExtrapolationList[consumptionExtrapolationTESM].extrapolationDataList = data;
                }
                //TES H
                if (consumptionExtrapolationTESH == -1) {
                    console.log("in if3")
                    var data = [];
                    for (var i = 0; i < tesData.length; i++) {
                        data.push({ month: moment(this.state.startMonthForExtrapolation).add(tesData[i].month - 1, 'months').format("YYYY-MM-DD"), amount: (Number(tesData[i].forecast) + Number(CI)) })
                    }
                    consumptionExtrapolationList.push(
                        {
                            "consumptionExtrapolationId": consumptionExtrapolationList.length + 1,
                            "planningUnit": {
                                "id": this.state.planningUnitId,
                                "label": {
                                }
                            },
                            "region": {
                                "id": this.state.regionId,
                                "label": {
                                }
                            },
                            "extrapolationMethod": {
                                "id": 1,
                                "label": {
                                    "createdBy": null,
                                    "createdDate": null,
                                    "lastModifiedBy": null,
                                    "lastModifiedDate": null,
                                    "active": true,
                                    "labelId": 34703,
                                    "label_en": "TES High Confidence",
                                    "label_sp": null,
                                    "label_fr": null,
                                    "label_pr": null
                                }
                            },
                            "jsonProperties": {
                                confidenceLevel: this.state.confidenceLevelId,
                                seasonality: this.state.noOfMonthsForASeason,
                                alpha: this.state.alpha,
                                beta: this.state.beta,
                                gamma: this.state.gamma
                            },
                            "createdBy": {
                                "userId": 1,
                                "username": "Anchal C"
                            },
                            "createdDate": "2021-12-14 12:24:20",
                            "extrapolationDataList": data
                        })
                } else {
                    consumptionExtrapolationList[consumptionExtrapolationTESH].jsonProperties = {
                        confidenceLevel: this.state.confidenceLevelId,
                        seasonality: this.state.noOfMonthsForASeason,
                        alpha: this.state.alpha,
                        beta: this.state.beta,
                        gamma: this.state.gamma
                    };
                    var data = [];
                    for (var i = 0; i < tesData.length; i++) {
                        data.push({ month: moment(this.state.startMonthForExtrapolation).add(tesData[i].month - 1, 'months').format("YYYY-MM-DD"), amount: (Number(tesData[i].forecast) + Number(CI)) })
                    }
                    consumptionExtrapolationList[consumptionExtrapolationTESH].extrapolationDataList = data;
                }
                console.log('consumptionExtrapolationRegression', consumptionExtrapolationRegression);
                datasetJson.consumptionExtrapolation = consumptionExtrapolationList;
                console.log("consumptionExtrapolationList+++", consumptionExtrapolationList)
                datasetData = (CryptoJS.AES.encrypt(JSON.stringify(datasetJson), SECRET_KEY)).toString()
                myResult.programData = datasetData;
                var putRequest = datasetTransaction.put(myResult);

                putRequest.onerror = function (event) {
                }.bind(this);
                putRequest.onsuccess = function (event) {
                }.bind(this);
            }.bind(this);
        }.bind(this);
    }

    setPlanningUnitId(e) {
        var planningUnitId = e.target.value;
        this.setState({
            planningUnitId: planningUnitId
        }, () => {
            this.setExtrapolatedParameters();
        })
    }

    setRegionId(e) {
        var regionId = e.target.value;
        this.setState({
            regionId: regionId
        }, () => {
            this.setExtrapolatedParameters();
        })
    }

    setExtrapolatedParameters() {
        if (this.state.planningUnitId > 0 && this.state.regionId > 0) {
            var datasetJson = this.state.datasetJson;
            var actualConsumptionList = datasetJson.actualConsumptionList;
            var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
            var stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
            var consumptionExtrapolationList = datasetJson.consumptionExtrapolation;
            var monthsForMovingAverage = this.state.monthsForMovingAverage;
            var consumptionExtrapolationData = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 6)//Semi Averages
            var consumptionExtrapolationMovingData = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 7)//Moving averages
            console.log("consumptionExtrapolationMovingData+++", consumptionExtrapolationMovingData)
            var consumptionExtrapolationRegression = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 5)//Linear Regression
            var consumptionExtrapolationTESL = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 1)//TES L
            if (consumptionExtrapolationMovingData.length > 0) {
                monthsForMovingAverage = consumptionExtrapolationMovingData[0].jsonProperties.months;
            }
            var confidenceLevel = this.state.confidenceLevelId;
            var seasonality = this.state.noOfMonthsForASeason;
            var alpha = this.state.alpha;
            var beta = this.state.beta;
            var gamma = this.state.gamma;
            console.log("consumptionExtrapolationTESL+++", consumptionExtrapolationTESL)
            if (consumptionExtrapolationTESL.length > 0) {
                confidenceLevel = consumptionExtrapolationTESL[0].jsonProperties.confidenceLevel;
                seasonality = consumptionExtrapolationTESL[0].jsonProperties.seasonality;
                alpha = consumptionExtrapolationTESL[0].jsonProperties.alpha;
                beta = consumptionExtrapolationTESL[0].jsonProperties.beta;
                gamma = consumptionExtrapolationTESL[0].jsonProperties.gamma;
            }
            var monthArray = [];
            var curDate = startDate;
            for (var m = 0; curDate < moment(stopDate).add(-1, 'months').format("YYYY-MM-DD"); m++) {
                curDate = moment(startDate).add(m, 'months').format("YYYY-MM-DD");
                monthArray.push(curDate)
            }
            this.setState({
                actualConsumptionList: actualConsumptionList,
                startDate: startDate,
                stopDate: stopDate,
                monthArray: monthArray,
                monthsForMovingAverage: monthsForMovingAverage,
                confidenceLevelId: confidenceLevel,
                noOfMonthsForASeason: seasonality,
                alpha: alpha,
                beta: beta,
                gamma: gamma,
                showData: true
            }, () => {
                this.buildJxl();
            })
        } else {
            this.setState({
                showData: false
            })
        }
    }

    setAlpha(e) {
        var alpha = e.target.value;
        this.setState({
            alpha: alpha
        }, () => {
            this.buildJxl();
        })
    }

    setBeta(e) {
        var beta = e.target.value;
        this.setState({
            beta: beta
        }, () => {
            this.buildJxl();
        })
    }

    setGamma(e) {
        var gamma = e.target.value;
        this.setState({
            gamma: gamma
        }, () => {
            this.buildJxl();
        })
    }

    setSeasonals(e) {
        var seasonals = e.target.value;
        this.setState({
            noOfMonthsForASeason: seasonals
        }, () => {
            this.buildJxl()
        })
    }

    setConfidenceLevelId(e) {
        var confidenceLevelId = e.target.value;
        this.setState({
            confidenceLevelId: confidenceLevelId
        }, () => {
            this.buildJxl()
        })
    }

    setMonthsForMovingAverage(e) {
        var monthsForMovingAverage = e.target.value;
        this.setState({
            monthsForMovingAverage: monthsForMovingAverage
        }, () => {
            this.buildJxl()
        })
    }


    setMovingAvgId(e) {
        var movingAvgId = e.target.checked;
        this.setState({
            movingAvgId: movingAvgId
        })
    }
    setSemiAvgId(e) {
        var semiAvgId = e.target.checked;
        this.setState({
            semiAvgId: semiAvgId
        })
    }
    setLinearRegressionId(e) {
        var linearRegressionId = e.target.checked;
        this.setState({
            linearRegressionId: linearRegressionId
        })
    }
    setSmoothingId(e) {
        var smoothingId = e.target.checked;
        this.setState({
            smoothingId: smoothingId
        })
    }
    setArimaId(e) {
        var arimaId = e.target.checked;
        this.setState({
            arimaId: arimaId
        })
    }
    // setShowAdvanceId(e) {
    //     var showAdvanceId = e.target.checked;
    //     this.setState({
    //         showAdvanceId: showAdvanceId
    //     })
    // }

    toggle(key, value) {
        this.setState({
            [key]: value,
        });
    }

    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }

    render() {
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state
        const { rangeValue1 } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }

        const { forecastProgramList } = this.state;
        let forecastPrograms = forecastProgramList.length > 0 && forecastProgramList.map((item, i) => {
            return (
                <option key={i} value={item.id}>
                    {item.name}
                </option>
            )
        }, this);

        const { planningUnitList } = this.state;
        let planningUnits = planningUnitList.length > 0 && planningUnitList.map((item, i) => {
            return (
                <option key={i} value={item.planningUnit.id}>
                    {item.planningUnit.label.label_en}
                </option>
            )
        }, this);
        const { regionList } = this.state;
        let regions = regionList.length > 0 && regionList.map((item, i) => {
            return (
                <option key={i} value={item.regionId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);

        const options = {
            title: {
                display: false,
            },

            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Consumption Quantity',
                        fontColor: 'black'
                    },
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'black',
                        callback: function (value) {
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
                    }
                }],
                xAxes: [
                    {
                        id: 'xAxis1',
                        gridLines: {
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            fontColor: 'black',
                            callback: function (label) {
                                var xAxis1 = label
                                xAxis1 += '';
                                var month = xAxis1.split('-')[0];
                                return month;
                            }
                        }
                    },
                    {
                        id: 'xAxis2',
                        gridLines: {
                            drawOnChartArea: false, // only want the grid lines for one axis to show up
                        },
                        ticks: {
                            callback: function (label) {
                                var xAxis2 = label
                                xAxis2 += '';
                                var month = xAxis2.split('-')[0];
                                var year = xAxis2.split('-')[1];
                                if (month === "Feb") {
                                    return year;
                                } else {
                                    return "";
                                }
                            }
                        }
                    }]
            },

            // tooltips: {
            //   enabled: false,
            //   custom: CustomTooltips,
            //   callbacks: {
            //     label: function (tooltipItem, data) {

            //       let label = data.labels[tooltipItem.index];
            //       let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

            //       var cell1 = value
            //       cell1 += '';
            //       var x = cell1.split('.');
            //       var x1 = x[0];
            //       var x2 = x.length > 1 ? '.' + x[1] : '';
            //       var rgx = /(\d+)(\d{3})/;
            //       while (rgx.test(x1)) {
            //         x1 = x1.replace(rgx, '$1' + ',' + '$2');
            //       }
            //       return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
            //     }
            //   }

            // },

            maintainAspectRatio: false,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: "black"
                }
            }
        }

        let datasets = [];
        datasets.push({
            type: "line",
            pointRadius: 0,
            lineTension: 0,
            label: 'Adjusted Actuals',
            backgroundColor: 'transparent',
            borderColor: '#CFCDC9',
            ticks: {
                fontSize: 2,
                fontColor: 'transparent',
            },
            showInLegend: true,
            pointStyle: 'line',
            pointBorderWidth: 5,
            yValueFormatString: "###,###,###,###",
            data: this.state.consumptionData.map((item, index) => (item.amount > 0 ? item.amount : null))
        })
        if (this.state.movingAvgId) {
            datasets.push(
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: 'Moving Averages',
                    backgroundColor: 'transparent',
                    borderColor: '#A7C6ED',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    yValueFormatString: "###,###,###,###",
                    data: this.state.inputDataAverageFilter.map((item, index) => (item.forecast > 0 ? item.forecast : null))
                })
        }
        if (this.state.semiAvgId) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: 'Semi-Averages',
                backgroundColor: 'transparent',
                borderColor: '#49A4A1',
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                yValueFormatString: "###,###,###,###",
                data: this.state.inputDataFilter.map((item, index) => (item.forecast > 0 ? item.forecast : null))
            })
        }
        if (this.state.linearRegressionId) {
            datasets.push(
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: 'Linear Regression',
                    backgroundColor: 'transparent',
                    borderColor: '#118B70',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    yValueFormatString: "###,###,###,###",
                    data: this.state.inputDataRegressionFilter.map((item, index) => (item.forecast > 0 ? item.forecast : null))
                })
        }
        if (this.state.smoothingId) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: 'TES (Lower Confidence Bound)',
                backgroundColor: 'transparent',
                borderColor: '#002FC6',
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                yValueFormatString: "###,###,###,###",
                data: this.state.tesdataFilter.map((item, index) => (item.forecast > 0 ? (item.forecast - this.state.CI) : null))
            })
        }
        if (this.state.smoothingId) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: 'TES',
                backgroundColor: 'transparent',
                borderColor: '#651D32',
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                yValueFormatString: "###,###,###,###",
                data: this.state.tesdataFilter.map((item, index) => (item.forecast > 0 ? item.forecast : null))
            })
        }
        if (this.state.smoothingId) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: 'TES (Upper Confidence Bound)',
                backgroundColor: 'transparent',
                borderColor: '#6c6463',
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                yValueFormatString: "###,###,###,###",
                data: this.state.tesdataFilter.map((item, index) => (item.forecast > 0 ? (item.forecast + this.state.CI) : null))
            })
        }
        if (this.state.arimaId) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: 'ARIMA',
                backgroundColor: 'transparent',
                borderColor: '#BA0C2F',
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                yValueFormatString: "###,###,###,###",
                data: this.state.dataList.map((item, index) => (item.arimaForecast > 0 ? item.arimaForecast : null))
            })
        }
        let line = {};
        if (this.state.showData) {
            line = {
                labels: this.state.dataList.map((item, index) => (item.months)),
                datasets: datasets
            }
        }


        return (
            <div className="animated fadeIn">
                <Card>
                    <div className="card-header-actions">
                        <div className="Card-header-reporticon">
                            <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                            <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                            <span className="compareAndSelect-larrowText"> Back to <a href="/#">Consumption Entry & Adjustment</a></span>
                            <span className="compareAndSelect-rarrowText"> Continue to <a href="/#">Campare & Select Forecast</a></span><br />
                            {/* <strong>{i18n.t('static.dashboard.supplyPlan')}</strong> */}

                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">Show Guidance</small></span>
                            </a>
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </div>
                    </div>
                    {/* <div className="Card-header-reporticon pb-2">
                        <div className="card-header-actions">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </div>
                    </div> */}
                    <CardBody className="pb-lg-5 pt-lg-0">
                        <Form name='simpleForm'>
                            <div className=" pl-0">
                                <div className="row">
                                    <FormGroup className="col-md-3 ">
                                        <Label htmlFor="appendedInputButton">Forecast Program</Label>
                                        <div className="controls ">
                                            <Input
                                                type="select"
                                                name="forecastProgramId"
                                                id="forecastProgramId"
                                                bsSize="sm"
                                                value={this.state.forecastProgramId}
                                                onChange={(e) => { this.getPlanningUnitList(e) }}
                                            >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {forecastPrograms}
                                            </Input>
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="col-md-3 ">
                                        <Label htmlFor="appendedInputButton">Planning Unit</Label>
                                        <div className="controls ">
                                            <Input
                                                type="select"
                                                name="planningUnitId"
                                                id="planningUnitId"
                                                bsSize="sm"
                                                value={this.state.planningUnitId}
                                                onChange={(e) => { this.setPlanningUnitId(e); }}
                                            >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {planningUnits}
                                            </Input>
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="col-md-3 ">
                                        <Label htmlFor="appendedInputButton">Region</Label>
                                        <div className="controls ">
                                            <Input
                                                type="select"
                                                name="regionId"
                                                id="regionId"
                                                bsSize="sm"
                                                value={this.state.regionId}
                                                onChange={(e) => { this.setRegionId(e); }}
                                            >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {regions}
                                            </Input>
                                        </div>
                                    </FormGroup>
                                    {/* <FormGroup className="col-md-3 ">
                                        <Label htmlFor="appendedInputButton">Extrapolation Method</Label>
                                        <div className="controls ">
                                            <Input
                                                type="select"
                                                name="extrapolationMethodId"
                                                id="extrapolationMethodId"
                                                bsSize="sm"
                                                value={this.state.extrapolationMethodId}
                                                onChange={(e) => { this.setExtrapolationMethodId(e); }}
                                            >
                                                <option value="">{i18n.t('static.common.all')}</option>
                                                <option value="1">Extrapolate National</option>
                                                <option value="2">Extrapolate by Region from National</option>
                                                <option value="3">Extrapolate by Region</option>
                                            </Input>
                                        </div>
                                    </FormGroup> */}
                                    <FormGroup className="col-md-3">
                                        <Label htmlFor="appendedInputButton">Forecast Period<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                        <div className="controls edit">

                                            <Picker
                                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                ref={this.pickRange}
                                                value={rangeValue}
                                                lang={pickerLang}
                                                // theme="light"
                                                // onChange={this.handleRangeChange}
                                                // onDismiss={this.handleRangeDissmis}
                                                className="greyColor"
                                            >
                                                <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} />
                                            </Picker>
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="col-md-12">
                                        <h5>
                                            {this.state.planningUnitId > 0 &&
                                                document.getElementById("planningUnitId").selectedOptions[0].text}
                                            {this.state.regionId > 0 &&
                                                " and " + document.getElementById("regionId").selectedOptions[0].text + " Region, Select your extrapolation parameters:"}
                                        </h5>
                                    </FormGroup>
                                    <FormGroup className="col-md-3">
                                        <Label htmlFor="appendedInputButton">Select date range for historical data<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                        <div className="controls edit">

                                            <Picker
                                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                ref={this.pickRange1}
                                                value={rangeValue1}
                                                lang={pickerLang}
                                                // theme="light"
                                                onChange={this.handleRangeChange1}
                                                onDismiss={this.handleRangeDissmis1}
                                                readOnly
                                            >
                                                <MonthBox value={makeText(rangeValue1.from) + ' ~ ' + makeText(rangeValue1.to)} onClick={this._handleClickRangeBox1} />
                                            </Picker>
                                        </div>
                                    </FormGroup>
                                </div>
                                <div className="row">
                                    <Label htmlFor="appendedInputButton">Select the Extrapolation methods to be used</Label>
                                </div>
                                <div className="row">
                                    <FormGroup className="col-md-12 ">
                                        <div className="check inline  pl-lg-3 pt-lg-3">
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenMa} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)}>
                                                    <PopoverBody>Need to add Info.</PopoverBody>
                                                </Popover>
                                            </div>
                                            <div>
                                                <Input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="movingAvgId"
                                                    name="movingAvgId"
                                                    checked={this.state.movingAvgId}
                                                    onClick={(e) => { this.setMovingAvgId(e); }}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                    <b>Moving Averages</b>
                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                </Label>
                                            </div>
                                            {this.state.movingAvgId &&
                                                <div className="col-md-3">
                                                    <Label htmlFor="appendedInputButton"># of Months</Label>
                                                    <Input
                                                        className="controls"
                                                        type="text"
                                                        id="noOfMonthsId"
                                                        name="noOfMonthsId"
                                                        value={this.state.monthsForMovingAverage}
                                                        onChange={(e) => { this.setMonthsForMovingAverage(e); }}
                                                    />
                                                </div>
                                            }
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenSa} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenMa', !this.state.popoverOpenSa)}>
                                                    <PopoverBody>Need to add Info.</PopoverBody>
                                                </Popover>
                                            </div>
                                            <div>
                                                <Input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="semiAvgId"
                                                    name="semiAvgId"
                                                    checked={this.state.semiAvgId}
                                                    onClick={(e) => { this.setSemiAvgId(e); }}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                    <b>Semi-Averages</b>
                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenSa', !this.state.popoverOpenSa)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                </Label>
                                            </div>
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenLr} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenLr', !this.state.popoverOpenLr)}>
                                                    <PopoverBody>Need to add Info.</PopoverBody>
                                                </Popover>
                                            </div>
                                            <div>
                                                <Input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="linearRegressionId"
                                                    name="linearRegressionId"
                                                    checked={this.state.linearRegressionId}
                                                    onClick={(e) => { this.setLinearRegressionId(e); }}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                    <b>Linear Regression</b>
                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenLr', !this.state.popoverOpenLr)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                </Label>
                                            </div>
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenTes} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenMa', !this.state.popoverOpenTes)}>
                                                    <PopoverBody>Need to add Info.</PopoverBody>
                                                </Popover>
                                            </div>
                                            <div>
                                                <Input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="smoothingId"
                                                    name="smoothingId"
                                                    checked={this.state.smoothingId}
                                                    onClick={(e) => { this.setSmoothingId(e); }}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                    <b>Triple-Exponential Smoothing (Holts-Winters)</b>
                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenTes', !this.state.popoverOpenTes)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                </Label>
                                            </div>
                                            {this.state.smoothingId &&
                                                <div className="row col-md-12">
                                                    <div className="col-md-2">
                                                        <Label htmlFor="appendedInputButton">Confidence level</Label>
                                                        <Input
                                                            type="select"
                                                            id="confidenceLevelId"
                                                            name="confidenceLevelId"
                                                            bsSize="sm"
                                                            value={this.state.confidenceLevelId}
                                                            onChange={(e) => { this.setConfidenceLevelId(e); }}
                                                        >
                                                            <option value="80">80%</option>
                                                            <option value="85">85%</option>
                                                            <option value="90">90%</option>
                                                            <option value="95">95%</option>
                                                            <option value="99">99%</option>
                                                            <option value="99.9">99.9%</option>
                                                        </Input>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <Label htmlFor="appendedInputButton">Seasonality</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="seasonalityId"
                                                            name="seasonalityId"
                                                            value={this.state.noOfMonthsForASeason}
                                                            onChange={(e) => { this.setSeasonals(e); }}
                                                        />
                                                    </div>
                                                    {/* <div className="col-md-3">
                                                        <Input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="showAdvanceId"
                                                            name="showAdvanceId"
                                                            checked={this.state.showAdvanceId}
                                                            onClick={(e) => { this.setShowAdvanceId(e); }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                            Show Advance
                                                        </Label>
                                                    </div> */}

                                                    <div className="col-md-2">
                                                        <Label htmlFor="appendedInputButton">Alpha</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="alphaId"
                                                            name="alphaId"
                                                            value={this.state.alpha}
                                                            onChange={(e) => { this.setAlpha(e); }}
                                                        />
                                                    </div>
                                                    <div className="col-md-2">
                                                        <Label htmlFor="appendedInputButton">Beta</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="betaId"
                                                            name="betaId"
                                                            value={this.state.beta}
                                                            onChange={(e) => { this.setBeta(e); }}
                                                        />
                                                    </div>
                                                    <div className="col-md-2">
                                                        <Label htmlFor="appendedInputButton">Gamma</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="gammaId"
                                                            name="gammaId"
                                                            value={this.state.gamma}
                                                            onChange={(e) => { this.setGamma(e); }}
                                                        />
                                                    </div>
                                                    {/* <div className="col-md-2">
                                                        <Label htmlFor="appendedInputButton">Phi</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="phiId"
                                                            name="phiId"
                                                        />
                                                    </div> */}
                                                </div>
                                            }
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenArima} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)}>
                                                    <PopoverBody>Need to add Info.</PopoverBody>
                                                </Popover>
                                            </div>
                                            <div>
                                                <Input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="arimaId"
                                                    name="arimaId"
                                                    checked={this.state.arimaId}
                                                    onClick={(e) => { this.setArimaId(e); }}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                    <b>Autoregressive Integrated Moving Average (ARIMA)</b>
                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                </Label>
                                            </div>
                                            {this.state.arimaId &&
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">p</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="pId"
                                                            name="pId"
                                                        />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">d</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="dId"
                                                            name="dId"
                                                        />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">q</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="qId"
                                                            name="qId"
                                                        />
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </FormGroup>
                                </div>
                            </div>
                            {/* <div className="col-md-12">
                                <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.reset}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"> </i>Submit</Button>
                            </div> */}
                        </Form>

                        {/* Graph */}
                        {this.state.showData && <div className="col-md-12">
                            <div className="chart-wrapper chart-graph-report pl-5 ml-3" style={{ marginLeft: '50px' }}>
                                <Line id="cool-canvas" data={line} options={options} />
                                <div>

                                </div>
                            </div>
                        </div>}<br /><br />
                        {this.state.showData &&
                            <div className="table-scroll">
                                <div className="table-wrap table-responsive">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                        <thead>
                                            <tr>
                                                <td width="230px"><b>Errors</b></td>
                                                {this.state.movingAvgId &&
                                                    <td width="110px"><b>Moving Averages</b></td>
                                                }
                                                {this.state.semiAvgId &&
                                                    <td width="110px"><b>Semi Averages</b></td>
                                                }
                                                {this.state.linearRegressionId &&
                                                    <td width="110px"><b>Linear Regression</b></td>
                                                }
                                                {this.state.smoothingId &&
                                                    <td width="110px"><b>TES</b></td>
                                                }
                                                {this.state.arimaId &&
                                                    <td width="110px"><b>ARIMA</b></td>
                                                }
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>RMSE</td>
                                                {this.state.movingAvgId &&
                                                    <td>{this.state.rmseMovingAvg}</td>
                                                }
                                                {this.state.semiAvgId &&
                                                    <td>{this.state.rmseSemi}</td>
                                                }
                                                {this.state.linearRegressionId &&
                                                    <td bgcolor="#118B70">{this.state.rmseLinearReg}</td>
                                                }
                                                {this.state.smoothingId &&
                                                    <td>{this.state.rmse}</td>
                                                }
                                                {this.state.arimaId &&
                                                    <td></td>
                                                }
                                            </tr>
                                            <tr>
                                                <td>MAPE</td>
                                                {this.state.movingAvgId &&
                                                    <td>{this.state.mapeMovingAvg}</td>
                                                }
                                                {this.state.semiAvgId &&
                                                    <td>{this.state.mapeSemi}</td>
                                                }
                                                {this.state.linearRegressionId &&
                                                    <td bgcolor="#118B70">{this.state.mapeLinearReg}</td>
                                                }
                                                {this.state.smoothingId &&
                                                    <td>{this.state.mape}</td>
                                                }
                                                {this.state.arimaId &&
                                                    <td></td>
                                                }
                                            </tr>
                                            <tr>
                                                <td>MSE</td>
                                                {this.state.movingAvgId &&
                                                    <td>{this.state.mseMovingAvg}</td>
                                                }
                                                {this.state.semiAvgId &&
                                                    <td>{this.state.mseSemi}</td>
                                                }
                                                {this.state.linearRegressionId &&
                                                    <td bgcolor="#118B70">{this.state.mseLinearReg}</td>
                                                }
                                                {this.state.smoothingId &&
                                                    <td>{this.state.mse}</td>
                                                }
                                                {this.state.arimaId &&
                                                    <td></td>
                                                }
                                            </tr>
                                            <tr>
                                                <td>WAPE</td>
                                                {this.state.movingAvgId &&
                                                    <td>{this.state.wapeMovingAvg}</td>
                                                }
                                                {this.state.semiAvgId &&
                                                    <td>{this.state.wapeSemi}</td>
                                                }
                                                {this.state.linearRegressionId &&
                                                    <td>{this.state.wapeLinearReg}</td>
                                                }
                                                {this.state.smoothingId &&
                                                    <td>{this.state.wape}</td>
                                                }
                                                {this.state.arimaId &&
                                                    <td></td>
                                                }
                                            </tr>
                                            <tr>
                                                <td>R^2</td>
                                                {this.state.movingAvgId &&
                                                    <td>{this.state.rSqdMovingAvg}</td>
                                                }
                                                {this.state.semiAvgId &&
                                                    <td>{this.state.rSqdSemi}</td>
                                                }
                                                {this.state.linearRegressionId &&
                                                    <td>{this.state.rSqdLinearReg}</td>
                                                }
                                                {this.state.smoothingId &&
                                                    <td>{this.state.rSqd}</td>
                                                }
                                                {this.state.arimaId &&
                                                    <td></td>
                                                }
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </div>}
                        {this.state.showData && <div id="tableDiv" className="extrapolateTable"></div>}
                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1"><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" onClick={() => this.saveForecastConsumptionExtrapolation()}><i className="fa fa-check"></i>Save</Button>
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>
                <Modal isOpen={this.state.showGuidance}
                    className={'modal-lg ' + this.props.className} >
                    <ModalHeader toggle={() => this.toggleShowGuidance()} className="modalHeaderSupplyPlan">
                        <strong>Show Guidance</strong>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                            <p>Methods are organized from simple to robust

                                More sophisticated models are more sensitive to problems in the data

                                If you have poorer data (missing data points, variable reporting rates, less than 12 months of data), use simpler forecast methods
                            </p>
                        </ModalBody>
                    </div>
                </Modal>
            </div>
        )
    }

    _handleClickRangeBox(e) {
        this.pickRange.current.show()
    }
    _handleClickRangeBox1(e) {
        this.pickRange1.current.show()
    }
}