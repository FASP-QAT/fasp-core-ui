import React from "react";
import ReactDOM from 'react-dom';
import regression from 'regression';
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
        var endDate = moment("2022-02-01").format("YYYY-MM-DD")
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
            lang: localStorage.getItem("lang"),
            movingAvgId: true,
            startMonthForExtrapolation: '',
            semiAvgId: true,
            linearRegressionId: true,
            smoothingId: true,
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
            showGuidance: false
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
                        planningUnitList: datasetJson.planningUnitList
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
        var startMonth = '';
        for (var j = 0; j < monthArray.length; j++) {
            var consumptionData = actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId)
            if (consumptionData.length > 0) {
                if (inputData.length == 0) {
                    startMonth = monthArray[j];
                }
                if (inputDataAverage.length == 0) {
                    startMonth = monthArray[j];
                }
                if (inputDataRegression.length == 0) {
                    startMonth = monthArray[j];
                }
                inputData.push({ "month": inputData.length + 1, "actual": consumptionData[0].amount, "forecast": null })
                inputDataAverage.push({ "month": inputDataAverage.length + 1, "actual": consumptionData[0].amount, "forecast": null })
                inputDataRegression.push({ "month": inputDataRegression.length + 1, "actual": consumptionData[0].amount, "forecast": null })
            }
        }
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
            var monthsForMovingAverage = document.getElementById("noOfMonthsId").value;

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

            //var consumptionData = actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId);
            data[1] = consumptionData.length > 0 ? consumptionData[0].amount : "";
            data[2] = inputDataAverageFilter.length > 0 && inputDataAverageFilter[0].forecast != null ? inputDataAverageFilter[0].forecast.toFixed(2) : '';
            data[3] = inputDataFilter.length > 0 && inputDataFilter[0].forecast != null ? inputDataFilter[0].forecast.toFixed(2) : '';
            data[4] = inputDataRegressionFilter.length > 0 && inputDataRegressionFilter[0].forecast != null ? inputDataRegressionFilter[0].forecast.toFixed(2) : '';
            data[5] = '';
            data[6] = '';
            data[7] = '';
            data[8] = '';
            dataArray.push(data)
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();

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
                    type: 'number'
                },
                {
                    title: 'Moving Averages',
                    type: 'number'
                },
                {
                    title: 'Semi-Averages',
                    type: 'number'
                },
                {
                    title: 'Linear Regression',
                    type: 'number'
                },
                {
                    title: 'TES (Lower Confidence Bound)',
                    type: 'number'
                },
                {
                    title: 'TES (Medium)',
                    type: 'number'
                },
                {
                    title: 'TES (Upper Confidence Bound)',
                    type: 'number'
                },
                {
                    title: 'ARIMA',
                    type: 'number'
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
            startMonthForExtrapolation: startMonth
        })
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
            var programDataTransaction = db1.transaction(['planningUnit'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('planningUnit');
            var programRequest = programDataOs.getAll();
            programRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
                this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var planningUnitList = [];
                var myResult = programRequest.result;
                var forecastProgramListFilter = this.state.forecastProgramList.filter(c => c.id == forecastProgramId)[0]
                var regionList = forecastProgramListFilter.regionList;
                for (var i = 0; i < myResult.length; i++) {
                    var planningUnitDataJson = {
                        name: getLabelText(myResult[i].label, this.state.lang),
                        id: myResult[i].planningUnitId
                    }
                    planningUnitList.push(planningUnitDataJson)
                } console.log("forecastProgramListFilter.planningUnitList===>" + forecastProgramListFilter);
                this.setState({
                    planningUnitList: forecastProgramListFilter.planningUnitList,
                    forecastProgramId: forecastProgramId,
                    regionList: regionList
                })
            }.bind(this)
        }.bind(this)
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
                var consumptionExtrapolationData = consumptionExtrapolationList.findIndex(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 6)
                var consumptionExtrapolationMovingData = consumptionExtrapolationList.findIndex(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 7)
                var consumptionExtrapolationRegression = consumptionExtrapolationList.findIndex(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 5)
                var inputDataFilter = this.state.inputDataFilter;
                var inputDataAverageFilter = this.state.inputDataAverageFilter;
                var inputDataRegressionFilter = this.state.inputDataRegressionFilter;
                console.log("consumptionExtrapolationData", consumptionExtrapolationData);
                console.log("inputDataFilter", inputDataFilter);
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
                    consumptionExtrapolationList[consumptionExtrapolationMovingData].jsonProperties = {};
                    var data = [];
                    for (var i = 0; i < inputDataAverageFilter.length; i++) {
                        data.push({ month: moment(this.state.startMonthForExtrapolation).add(inputDataAverageFilter[i].month - 1, 'months').format("YYYY-MM-DD"), amount: inputDataAverageFilter[i].forecast })
                    }
                    consumptionExtrapolationList[consumptionExtrapolationMovingData].extrapolationDataList = data;
                }

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
console.log('consumptionExtrapolationRegression',consumptionExtrapolationRegression);
                datasetJson.consumptionExtrapolation = consumptionExtrapolationList;
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
        })
    }

    setRegionId(e) {
        var regionId = e.target.value;
        this.setState({
            regionId: regionId
        })
    }

    setExtrapolationMethodId(e) {
        var extrapolationMethodId = e.target.value;
        this.setState({
            extrapolationMethodId: extrapolationMethodId
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


        let line = "";
        line = {
            labels: this.state.dataList.map((item, index) => (item.months)),
            datasets: [
                {
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
                    data: this.state.dataList.map((item, index) => (item.actuals > 0 ? item.actuals : null))
                },
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
                    data: this.state.dataList.map((item, index) => (item.movingAverages > 0 ? item.movingAverages : null))
                },
                {
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
                    data: this.state.dataList.map((item, index) => (item.semiAveragesForecast > 0 ? item.semiAveragesForecast : null))
                },
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
                    data: this.state.dataList.map((item, index) => (item.linearRegression > 0 ? item.linearRegression : null))
                },
                {
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
                    data: this.state.dataList.map((item, index) => (item.tesLcb > 0 ? item.tesLcb : null))
                },
                {
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
                }
            ]
        }


        return (
            <div className="animated fadeIn">
                <Card>
                    <div className="Card-header-reporticon">
                        {/* <strong>{i18n.t('static.dashboard.supplyPlan')}</strong> */}
                        <div className="card-header-actions">
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
                                                <option value="">{i18n.t('static.common.all')}</option>
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
                                                <option value="">{i18n.t('static.common.all')}</option>
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
                                                onChange={(e) => { this.setRegionId(e); this.getDatasetData(e); }}
                                            >
                                                <option value="">{i18n.t('static.common.all')}</option>
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
                                                        onChange={(e) => { this.getDatasetData(e); }}
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
                                                            className="controls"
                                                            type="text"
                                                            id="confidenceLevelId"
                                                            name="confidenceLevelId"
                                                        />
                                                    </div>
                                                    <div className="col-md-2">
                                                        <Label htmlFor="appendedInputButton">Seasonality</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="seasonalityId"
                                                            name="seasonalityId"
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
                                                        />
                                                    </div>
                                                    <div className="col-md-2">
                                                        <Label htmlFor="appendedInputButton">Beta</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="betaId"
                                                            name="betaId"
                                                        />
                                                    </div>
                                                    <div className="col-md-2">
                                                        <Label htmlFor="appendedInputButton">Gamma</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="gammaId"
                                                            name="gammaId"
                                                        />
                                                    </div>
                                                    <div className="col-md-2">
                                                        <Label htmlFor="appendedInputButton">Phi</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="phiId"
                                                            name="phiId"
                                                        />
                                                    </div>
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
                            <div className="col-md-12">
                                <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.reset}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"> </i>Submit</Button>
                            </div>
                        </Form>

                        {/* Graph */}
                        <div className="col-md-12">
                            <div className="chart-wrapper chart-graph-report pl-5 ml-3" style={{ marginLeft: '50px' }}>
                                <Line id="cool-canvas" data={line} options={options} />
                                <div>

                                </div>
                            </div>
                        </div><br /><br />
                        <div className="table-scroll">
                            <div className="table-wrap table-responsive">
                                <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                    <thead>
                                        <tr>
                                            <td width="230px"><b>Errors</b></td>
                                            <td width="110px"><b>Moving Averages</b></td>
                                            <td width="110px"><b>Semi Averages</b></td>
                                            <td width="110px"><b>linear Regression</b></td>
                                            <td width="110px"><b>TES(Lower Confidence Bound)</b></td>
                                            <td width="110px"><b>TES(Medium)</b></td>
                                            <td width="110px"><b>TES(Upper Confidence Bound</b></td>
                                            <td width="110px"><b>ARIMA</b></td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>RMSE</td>
                                            <td>199.896015</td>
                                            <td>180.873394</td>
                                            <td bgcolor="#118B70">176.258641</td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>MAPE</td>
                                            <td>0.506926</td>
                                            <td>0.531222</td>
                                            <td bgcolor="#118B70">0.506034</td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>MSE</td>
                                            <td>39958.416892</td>
                                            <td>32715.184570</td>
                                            <td bgcolor="#118B70">31067.108640</td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>WAPE</td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>R^2</td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                        <div id="tableDiv" className="extrapolateTable"></div>
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