import React from "react";
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import i18n from '../../i18n';
import { Row, Col, Card, CardFooter, Button, Table, CardBody, Form, Modal, ModalBody, PopoverBody, Popover, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, InputGroupAddon, Collapse, InputGroupText, InputGroup } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import { DATE_FORMAT_CAP_WITHOUT_DATE, SECRET_KEY, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, JEXCEL_DATE_FORMAT_WITHOUT_DATE, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE, JEXCEL_PAGINATION_OPTION, ACTUAL_CONSUMPTION_MONTHS_IN_PAST, FORECASTED_CONSUMPTION_MONTHS_IN_PAST, JEXCEL_PRO_KEY, JEXCEL_MONTH_PICKER_FORMAT, ACTUAL_CONSUMPTION_MODIFIED, FORECASTED_CONSUMPTION_MODIFIED } from "../../Constants";
import moment from "moment";
import CryptoJS from 'crypto-js'
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import { Bar, Line, Pie } from 'react-chartjs-2';
import { calculateMovingAvg } from '../Extrapolation/MovingAverages';
import { calculateSemiAverages } from '../Extrapolation/SemiAverages';
import { calculateLinearRegression } from '../Extrapolation/LinearRegression';
import { calculateTES } from '../Extrapolation/TES';
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
export default class TreeExtrapolationComponent extends React.Component {
    constructor(props) {
        super(props);
        this.pickRange = React.createRef();
        this.pickRange1 = React.createRef();
        var startDate = moment("2021-05-01").format("YYYY-MM-DD");
        var endDate = moment("2022-02-01").format("YYYY-MM-DD")
        this.state = {
            monthsForMovingAverage: 5,
            confidenceLevelId: 0.95,
            noOfMonthsForASeason: 4,
            movingAvgData: [],
            alpha: 0.2,
            beta: 0.2,
            gamma: 0.2,
            nodeDataExtrapolationOptionList: [],
            nodeDataExtrapolation: {
                extrapolationMethod: {},
                notes: '',
                // reportingRate
                // month
                // amount
                extrapolationDataList: []
            },
            monthArray: [],
            extrapolationMethodList: [],
            show: false,
            jexcelData: [
                {
                    month: '2020-05-01',
                    node: '155',
                    reportingRate: '98%',
                    adjustedActuals: '158',
                    ma: '233',
                    sa: '233',
                    lr: '233',
                    arima: '233',
                    tesM: '233',
                    selectedForecast: '233',
                    manualChange: '0',
                    monthEndFinal: '233'
                },
                {
                    month: '2020-06-01',
                    node: '180',
                    reportingRate: '98%',
                    adjustedActuals: '184',
                    ma: '246',
                    sa: '246',
                    lr: '246',
                    arima: '246',
                    tesM: '246',
                    selectedForecast: '246',
                    manualChange: '0',
                    monthEndFinal: '246'
                },
                {
                    month: '2020-07-01',
                    node: '',
                    reportingRate: '98%',
                    adjustedActuals: '0',
                    ma: '260',
                    sa: '260',
                    lr: '260',
                    arima: '260',
                    tesM: '260',
                    selectedForecast: '260',
                    manualChange: '0',
                    monthEndFinal: '260'
                },
                {
                    month: '2020-08-01',
                    node: '',
                    reportingRate: '98%',
                    adjustedActuals: '0',
                    ma: '273',
                    sa: '273',
                    lr: '273',
                    arima: '273',
                    tesM: '273',
                    selectedForecast: '273',
                    manualChange: '0',
                    monthEndFinal: '273'
                },
                {
                    month: '2020-09-01',
                    node: '',
                    reportingRate: '98%',
                    adjustedActuals: '0',
                    ma: '287',
                    sa: '287',
                    lr: '287',
                    arima: '287',
                    tesM: '287',
                    selectedForecast: '287',
                    manualChange: '0',
                    monthEndFinal: '287'
                },
                {
                    month: '2020-10-01',
                    node: '',
                    reportingRate: '98%',
                    adjustedActuals: '0',
                    ma: '300',
                    sa: '300',
                    lr: '300',
                    arima: '300',
                    tesM: '300',
                    selectedForecast: '300',
                    manualChange: '0',
                    monthEndFinal: '300'
                },
                {
                    month: '2020-11-01',
                    node: '',
                    reportingRate: '70%',
                    adjustedActuals: '0',
                    ma: '314',
                    sa: '314',
                    lr: '314',
                    arima: '314',
                    tesM: '314',
                    selectedForecast: '314',
                    manualChange: '0',
                    monthEndFinal: '314'
                },
                {
                    month: '2020-12-01',
                    node: '600',
                    reportingRate: '98%',
                    adjustedActuals: '612',
                    ma: '327',
                    sa: '327',
                    lr: '327',
                    arima: '327',
                    tesM: '327',
                    selectedForecast: '327',
                    manualChange: '0',
                    monthEndFinal: '327'
                },
                {
                    month: '2021-01-01',
                    node: '165',
                    reportingRate: '98%',
                    adjustedActuals: '168',
                    ma: '340',
                    sa: '340',
                    lr: '340',
                    arima: '340',
                    tesM: '340',
                    selectedForecast: '340',
                    manualChange: '0',
                    monthEndFinal: '340'
                },
                {
                    month: '2021-02-01',
                    node: '190',
                    reportingRate: '98%',
                    adjustedActuals: '194',
                    ma: '354',
                    sa: '354',
                    lr: '354',
                    arima: '354',
                    tesM: '354',
                    selectedForecast: '354',
                    manualChange: '0',
                    monthEndFinal: '354'
                },
                {
                    month: '2021-03-01',
                    node: '280',
                    reportingRate: '98%',
                    adjustedActuals: '286',
                    ma: '367',
                    sa: '367',
                    lr: '367',
                    arima: '367',
                    tesM: '367',
                    selectedForecast: '367',
                    manualChange: '0',
                    monthEndFinal: '367'
                },
                {
                    month: '2021-04-01',
                    node: '370',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '635',
                    sa: '635',
                    lr: '635',
                    arima: '635',
                    tesM: '635',
                    selectedForecast: '635',
                    manualChange: '0',
                    monthEndFinal: '635'
                },
                {
                    month: '2021-05-01',
                    node: '460',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '172',
                    sa: '172',
                    lr: '172',
                    arima: '172',
                    tesM: '172',
                    selectedForecast: '172',
                    manualChange: '0',
                    monthEndFinal: '172'
                },
                {
                    month: '2021-06-01',
                    node: '550',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '226',
                    sa: '226',
                    lr: '226',
                    arima: '226',
                    tesM: '226',
                    selectedForecast: '226',
                    manualChange: '0',
                    monthEndFinal: '226'
                },
                {
                    month: '2021-07-01',
                    node: '640',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '329',
                    sa: '329',
                    lr: '329',
                    arima: '329',
                    tesM: '329',
                    selectedForecast: '329',
                    manualChange: '0',
                    monthEndFinal: '329'
                },
                {
                    month: '2021-08-01',
                    node: '730',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '721',
                    sa: '721',
                    lr: '721',
                    arima: '721',
                    tesM: '721',
                    selectedForecast: '721',
                    manualChange: '0',
                    monthEndFinal: '721'
                },
                {
                    month: '2021-09-01',
                    node: '820',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '439',
                    sa: '439',
                    lr: '439',
                    arima: '439',
                    tesM: '439',
                    selectedForecast: '439',
                    manualChange: '0',
                    monthEndFinal: '439'
                },
                {
                    month: '2021-10-01',
                    node: '910',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '453',
                    sa: '453',
                    lr: '453',
                    arima: '453',
                    tesM: '453',
                    selectedForecast: '453',
                    manualChange: '0',
                    monthEndFinal: '453'
                },
                {
                    month: '2021-11-01',
                    node: '',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '468',
                    sa: '468',
                    lr: '468',
                    arima: '468',
                    tesM: '468',
                    selectedForecast: '468',
                    manualChange: '0',
                    monthEndFinal: '468'
                },
                {
                    month: '2021-12-01',
                    node: '',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '482',
                    sa: '482',
                    lr: '482',
                    arima: '482',
                    tesM: '482',
                    selectedForecast: '482',
                    manualChange: '0',
                    monthEndFinal: '482'
                },
                {
                    month: '2022-01-01',
                    node: '',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '496',
                    sa: '496',
                    lr: '496',
                    arima: '496',
                    tesM: '496',
                    selectedForecast: '496',
                    manualChange: '0',
                    monthEndFinal: '496'
                },
                {
                    month: '2022-02-01',
                    node: '',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '510',
                    sa: '510',
                    lr: '510',
                    arima: '510',
                    tesM: '510',
                    selectedForecast: '510',
                    manualChange: '0',
                    monthEndFinal: '510'
                },
                {
                    month: '2022-03-01',
                    node: '',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '525',
                    sa: '525',
                    lr: '525',
                    arima: '525',
                    tesM: '525',
                    selectedForecast: '525',
                    manualChange: '0',
                    monthEndFinal: '525'
                },
                {
                    month: '2022-04-01',
                    node: '',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '539',
                    sa: '539',
                    lr: '539',
                    arima: '539',
                    tesM: '539',
                    selectedForecast: '539',
                    manualChange: '0',
                    monthEndFinal: '539'
                },
                {
                    month: '2022-05-01',
                    node: '',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '553',
                    sa: '553',
                    lr: '553',
                    arima: '553',
                    tesM: '553',
                    selectedForecast: '553',
                    manualChange: '0',
                    monthEndFinal: '553'
                },
                {
                    month: '2022-06-01',
                    node: '',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '567',
                    sa: '567',
                    lr: '567',
                    arima: '567',
                    tesM: '567',
                    selectedForecast: '567',
                    manualChange: '0',
                    monthEndFinal: '567'
                },
                {
                    month: '2022-07-01',
                    node: '',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '582',
                    sa: '582',
                    lr: '582',
                    arima: '582',
                    tesM: '582',
                    selectedForecast: '582',
                    manualChange: '0',
                    monthEndFinal: '582'
                },
                {
                    month: '2022-08-01',
                    node: '',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '596',
                    sa: '596',
                    lr: '596',
                    arima: '596',
                    tesM: '596',
                    selectedForecast: '596',
                    manualChange: '0',
                    monthEndFinal: '596'
                },
                {
                    month: '2022-09-01',
                    node: '',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '610',
                    sa: '610',
                    lr: '610',
                    arima: '610',
                    tesM: '610',
                    selectedForecast: '610',
                    manualChange: '0',
                    monthEndFinal: '610'
                },
                {
                    month: '2022-10-01',
                    node: '',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '624',
                    sa: '624',
                    lr: '624',
                    arima: '624',
                    tesM: '624',
                    selectedForecast: '624',
                    manualChange: '0',
                    monthEndFinal: '624'
                },
                {
                    month: '2022-11-01',
                    node: '',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '638',
                    sa: '638',
                    lr: '638',
                    arima: '638',
                    tesM: '638',
                    selectedForecast: '638',
                    manualChange: '0',
                    monthEndFinal: '638'
                },
                {
                    month: '2022-12-01',
                    node: '',
                    reportingRate: '',
                    adjustedActuals: '',
                    ma: '653',
                    sa: '653',
                    lr: '653',
                    arima: '653',
                    tesM: '653',
                    selectedForecast: '653',
                    manualChange: '0',
                    monthEndFinal: '653'
                }
            ],
            dataList: [
                {
                    months: '2022-01-01',
                    actuals: '1000',
                    movingAverages: '2000',
                    semiAveragesForecast: '30000',
                    linearRegression: '40000',
                    tesLcb: '50000',
                    arimaForecast: '60000',
                    tesMedium: '80000',
                    tesUcb: '97000'
                },
                {
                    months: '2022-02-01',
                    actuals: '10000',
                    movingAverages: '20000',
                    semiAveragesForecast: '30000',
                    linearRegression: '400000',
                    tesLcb: '500000',
                    arimaForecast: '60000',
                    tesMedium: '80000',
                    tesUcb: '97000'
                }
            ],
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            rangeValue: { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } },
            movingAvgId: true,
            semiAvgId: true,
            linearRegressionId: true,
            smoothingId: true,
            arimaId: true,
            popoverChooseMethod: false,
            popoverOpenMa: false,
            popoverOpenSa: false,
            popoverOpenLr: false,
            popoverOpenTes: false,
            popoverOpenArima: false,
            semiAvgData: [],
            linearRegressionData: [],
            tesData: [],
            movingAvgError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            semiAvgError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            linearRegressionError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            tesError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
        }
        this.buildJexcel = this.buildJexcel.bind(this);
        this.getExtrapolationMethodList = this.getExtrapolationMethodList.bind(this);
        this.manualChangeExtrapolation = this.manualChangeExtrapolation.bind(this);
        this.interpolate = this.interpolate.bind(this);
        this.extrapolationMethodChange = this.extrapolationMethodChange.bind(this);
    }

    extrapolationMethodChange(e) {
        console.log("extrapolation method id---", e.target.value);
        this.state.nodeDataExtrapolation.extrapolationMethod.id = e.target.value;
        this.state.dataExtrapolation.setValueFromCoords(13, 0, e.target.value, true);
        // this.buildJexcel();
    }

    setMonthsForMovingAverage(e) {
        this.setState({
            // loading: true
        })
        var monthsForMovingAverage = e.target.value;
        this.setState({
            monthsForMovingAverage: monthsForMovingAverage,
            // dataChanged: true
        }, () => {
            // if (this.state.dataExtrapolation != "") {
            //     if (e.target.checked) {
            //         this.state.dataExtrapolation.showColumn(4);
            //     } else {
            //         this.state.dataExtrapolation.hideColumn(4);
            //     }
            // }
            // this.buildJxl()
        })
    }


    setAlpha(e) {
        var alpha = e.target.value;
        this.setState({
            alpha: alpha,
            // dataChanged: true
        }, () => {
            // this.buildJxl();
        })
    }

    setBeta(e) {
        var beta = e.target.value;
        this.setState({
            beta: beta,
            // dataChanged: true
        }, () => {
            // this.buildJxl();
        })
    }

    setGamma(e) {
        var gamma = e.target.value;
        this.setState({
            gamma: gamma,
            // dataChanged: true
        }, () => {
            // this.buildJxl();
        })
    }

    setConfidenceLevelId(e) {
        var confidenceLevelId = e.target.value;
        this.setState({
            confidenceLevelId: confidenceLevelId,
            // dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }

    setSeasonals(e) {
        var seasonals = e.target.value;
        this.setState({
            noOfMonthsForASeason: seasonals,
            // dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }

    interpolate() {
        var monthArray = this.state.monthArray;
        var jexcelDataArr = [];
        var interpolatedData = [];
        var inputDataMovingAvg = [];
        var inputDataSemiAverage = [];
        var inputDataLinearRegression = [];
        var inputDataTes = [];
        var tableJson = this.state.dataExtrapolation.getJson(null, false);
        console.log("tableJson length---", tableJson.length);
        console.log("tableJson---", tableJson);
        for (var i = 0; i < tableJson.length; i++) {
            var map1 = new Map(Object.entries(tableJson[i]));
            console.log("10 map---" + map1.get("10"));
            var json = {
                month: map1.get("0"),
                amount: map1.get("1") != "" ? map1.get("1").toString().replaceAll(",", "") : map1.get("1"),
                reportingRate: map1.get("2")
            }
            jexcelDataArr.push(json);
        }
        for (var j = 0; j < monthArray.length; j++) {
            var dataArr = jexcelDataArr.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))[0];
            console.log(moment(monthArray[j]).format("YYYY-MM") + " " + "dataArr---", dataArr);
            if (dataArr.amount == 0) {
                var startValList = jexcelDataArr.filter(c => moment(c.month).format("YYYY-MM") < moment(monthArray[j]).format("YYYY-MM") && c.amount > 0)
                    .sort(function (a, b) {
                        return new Date(a.month) - new Date(b.month);
                    });
                console.log(moment(monthArray[j]).format("YYYY-MM") + " " + "startValList---", startValList);
                var endValList = jexcelDataArr.filter(c => moment(c.month).format("YYYY-MM") > moment(monthArray[j]).format("YYYY-MM") && c.amount > 0)
                    .sort(function (a, b) {
                        return new Date(a.month) - new Date(b.month);
                    });
                console.log(moment(monthArray[j]).format("YYYY-MM") + " " + "endValList---", endValList);
                if (startValList.length > 0 && endValList.length > 0) {
                    var startVal = startValList[startValList.length - 1].amount;
                    console.log(moment(monthArray[j]).format("YYYY-MM") + " " + "startVal---", startVal);
                    var startMonthVal = startValList[startValList.length - 1].month;
                    console.log(moment(monthArray[j]).format("YYYY-MM") + " " + "startMonthVal---", startMonthVal);
                    var endVal = endValList[0].amount;
                    console.log(moment(monthArray[j]).format("YYYY-MM") + " " + "endVal---", endVal);
                    var endMonthVal = endValList[0].month;
                    console.log(moment(monthArray[j]).format("YYYY-MM") + " " + "endMonthVal---", endMonthVal);
                    const monthDifference = moment(new Date(monthArray[j])).diff(new Date(startMonthVal), 'months', true);
                    const monthDiff = moment(new Date(endMonthVal)).diff(new Date(startMonthVal), 'months', true);
                    var missingActualData = Number(startVal) + (monthDifference * ((Number(endVal) - Number(startVal)) / monthDiff));
                    console.log("month--->>>", monthArray[j]);
                    console.log(moment(monthArray[j]).format("YYYY-MM") + " " + "missingActualData---", missingActualData);
                    const index = jexcelDataArr.findIndex(c => c.month == monthArray[j]);
                    var json = {
                        month: monthArray[j],
                        amount: missingActualData,
                        reportingRate: dataArr.reportingRate
                    }
                    jexcelDataArr.splice(index, 1, json);
                    // interpolatedData.push(json);

                }
            }
            // else {
            //     // interpolatedData.push(dataArr);
            // }
        }
        console.log("interpolatedData---", interpolatedData);
        this.state.nodeDataExtrapolation.extrapolationDataList = jexcelDataArr;
        for (let i = 0; i < jexcelDataArr.length; i++) {
            inputDataMovingAvg.push({ "month": inputDataMovingAvg.length + 1, "actual": jexcelDataArr[i].amount > 0 ? Number(jexcelDataArr[i].amount) : null, "forecast": null })
            inputDataSemiAverage.push({ "month": inputDataSemiAverage.length + 1, "actual": jexcelDataArr[i].amount > 0 ? Number(jexcelDataArr[i].amount) : null, "forecast": null })
            inputDataLinearRegression.push({ "month": inputDataLinearRegression.length + 1, "actual": jexcelDataArr[i].amount > 0 ? Number(jexcelDataArr[i].amount) : null, "forecast": null })
            inputDataTes.push({ "month": inputDataTes.length + 1, "actual": jexcelDataArr[i].amount > 0 ? Number(jexcelDataArr[i].amount) : null, "forecast": null })
            console.log("inputDataTes----", inputDataTes)
        }
        var data = jexcelDataArr.filter(c => c.amount > 0)
            .sort(function (a, b) {
                return new Date(a.month) - new Date(b.month);
            });
        var lastMonth = data[data.length - 1].month;
        var noOfMonthsForProjection = moment(new Date(this.props.items.forecastStopDate)).diff(new Date(lastMonth), 'months', true)
        console.log("noOfMonthsForProjection", noOfMonthsForProjection);
        calculateMovingAvg(inputDataMovingAvg, this.state.monthsForMovingAverage, Math.trunc(noOfMonthsForProjection), this);
        calculateSemiAverages(inputDataSemiAverage, noOfMonthsForProjection, this);
        calculateLinearRegression(inputDataLinearRegression, noOfMonthsForProjection, this);
        if (inputDataTes.length >= (this.state.noOfMonthsForASeason * 2)) {
            console.log("tes inside if")
            calculateTES(inputDataTes, this.state.alpha, this.state.beta, this.state.gamma, this.state.confidenceLevelId, this.state.noOfMonthsForASeason, noOfMonthsForProjection, this);
        } else {
            console.log("tes inside else")
            this.setState({
                tesData: [],
                CI: 0,
                tesError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" }
            })
        }
        // this.buildJexcel();

    }

    updateState(parameterName, value) {
        console.log("#######" + parameterName + "---", value)
        this.setState({
            [parameterName]: value
        }, () => {
            console.log("%%%" + parameterName + "---", value)
            this.buildJexcel();
        })
    }

    manualChangeExtrapolation(e) {
        const { currentItemConfig } = this.props.items;
        (currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario])[0].manualChangesEffectFuture = (e.target.checked == true ? true : false)
        this.state.dataExtrapolation.setValueFromCoords(12, 0, (e.target.checked == true ? true : false), true);
        this.props.updateState("currentItemConfig", currentItemConfig);

    }
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    componentDidMount() {
        this.getExtrapolationMethodList();
    }
    getExtrapolationMethodList() {
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['extrapolationMethod'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('extrapolationMethod');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
                // Handle errors!
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var proList = []
                console.log("myResult===============5", myResult)

                this.setState({
                    extrapolationMethodList: myResult.filter(x => x.active == true)
                }, () => {
                    if (this.props.items.currentScenario.nodeDataExtrapolationOptionList == "") {
                        var nodeDataExtrapolationOptionList = [];
                        for (let i = 0; i < this.state.extrapolationMethodList.length; i++) {
                            var e = this.state.extrapolationMethodList[i];
                            var json;
                            if (e.id == 7) { // moving avg
                                json = {
                                    extrapolationMethod: e.id,
                                    jsonProperties: {
                                        months: this.state.monthsForMovingAverage
                                    }
                                }
                            } else if (e.id == 5 || e.id == 6) { // semi avg
                                json = {
                                    extrapolationMethod: e.id,
                                    jsonProperties: {
                                    }
                                }
                            }
                            else if (e.id == 2) { // TES
                                json = {
                                    extrapolationMethod: e.id,
                                    jsonProperties: {
                                        confidenceLevel: this.state.confidenceLevelId,
                                        seasonality: this.state.noOfMonthsForASeason,
                                        alpha: this.state.alpha,
                                        beta: this.state.beta,
                                        gamma: this.state.gamma
                                    }
                                }
                            }
                            nodeDataExtrapolationOptionList.push(json);
                        }
                        this.setState({ nodeDataExtrapolationOptionList })
                    }
                })
            }.bind(this);
        }.bind(this)
    }

    buildJexcel() {
        let dataArray = [];
        let data = [];
        var list = this.state.jexcelData;

        var month = this.props.items.currentScenario.month;
        var forecastStartDate = this.props.items.forecastStartDate;
        var forecastStopDate = this.props.items.forecastStopDate;
        var minStartDate = month;
        if (moment(month).format("YYYY-MM") > moment(forecastStartDate).format("YYYY-MM")) {
            minStartDate = forecastStartDate;
        }
        console.log("month---", month);
        console.log("forecastStartDate---", forecastStartDate);
        console.log("forecastStopDate---", forecastStopDate);
        console.log("minStartDate---", minStartDate);
        var monthArray = [];
        var curDate1 = minStartDate;
        // monthArray.push('2019-01-01');

        for (var m = 0; curDate1 < moment(forecastStopDate).add(-1, 'months').format("YYYY-MM-DD"); m++) {
            curDate1 = moment(minStartDate).add(m, 'months').format("YYYY-MM-DD");
            monthArray.push(curDate1)
        }
        this.setState({ monthArray });
        // monthArray.push('2025-01-01');
        console.log("monthArray---", monthArray);
        let count = 0;
        for (var j = 0; j < monthArray.length; j++) {
            var cellData = this.state.nodeDataExtrapolation.extrapolationDataList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))[0];
            data = [];
            data[0] = monthArray[j]
            data[1] = cellData != null && cellData != "" ? cellData.amount : (moment(monthArray[j]).isSame(this.props.items.currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].month) ? this.props.items.currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].calculatedDataValue : "");
            data[2] = cellData != null && cellData != "" ? cellData.reportingRate : 100
            data[3] = `=ROUND((B${parseInt(j) + 1}*C${parseInt(j) + 1})/100,2)`
            // data[4] = this.state.movingAvgData[j+1].actual
            data[4] = this.state.movingAvgData.length > 0 ? this.state.movingAvgData[j].forecast : ''
            data[5] = this.state.semiAvgData.length > 0 ? this.state.semiAvgData[j].forecast : ''
            data[6] = this.state.linearRegressionData.length > 0 ? this.state.linearRegressionData[j].forecast : ''
            data[7] = this.state.tesData.length > 0 ? this.state.tesData[j].forecast : ''
            data[8] = ""
            // data[9] = `=IF(ISBLANK(B${parseInt(j) + 1}),10,ROUND(B${parseInt(j) + 1},2))`
            data[9] = `=IF(B${parseInt(j) + 1} != "",ROUND(B${parseInt(j) + 1},2),IF(N1 == 2,H${parseInt(j) + 1},IF(N1 == 7,E${parseInt(j) + 1},IF(N1==5,G${parseInt(j) + 1},IF(N1 == 6,F${parseInt(j) + 1},'')))))` // J
            data[10] = "" // K
            data[11] = `=IF(M1 == true,ROUND(J${parseInt(j)} + K${parseInt(j)},2),ROUND(J${parseInt(j) + 1} + K${parseInt(j) + 1},2))`
            data[12] = this.props.items.currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].manualChangesEffectFuture
            data[13] = this.state.nodeDataExtrapolation.extrapolationMethod.id
            // data[0] = list[j].month
            // data[1] = list[j].node
            // data[2] = list[j].reportingRate
            // data[3] = list[j].adjustedActuals
            // data[4] = list[j].ma
            // data[5] = list[j].sa
            // data[6] = list[j].lr
            // data[7] = list[j].arima
            // data[8] = list[j].tesM
            // data[9] = list[j].selectedForecast
            // data[10] = list[j].manualChange
            // data[11] = list[j].monthEndFinal
            dataArray[count] = data;
            count++;
        }

        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();

        let nestedHeaders = [];
        nestedHeaders.push(
            {
                title: '',
                colspan: '4'
            },

        );
        nestedHeaders.push(
            {
                title: 'Forecast',
                colspan: '5'
            },
        );
        nestedHeaders.push(
            {
                title: '',
                colspan: '3'
            },
        );

        var options = {
            data: dataArray,
            columnDrag: true,
            nestedHeaders: [nestedHeaders],
            columns: [
                {
                    title: 'Month',
                    type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100
                },
                {
                    title: getLabelText(this.props.items.currentItemConfig.context.payload.label, this.state.lang),
                    type: 'number',
                    mask: '#,##.00'
                },
                {
                    title: 'Reporting Rate',
                    type: 'number',
                    mask: '#,##.00%'
                },
                {
                    title: getLabelText(this.props.items.currentItemConfig.context.payload.label, this.state.lang) + '(Adjusted)',
                    type: 'number',
                    readOnly: true,
                    mask: '#,##.00'
                },
                {
                    title: 'Moving Averages',
                    type: 'number',
                    readOnly: true
                },
                {
                    title: 'Semi-Averages',
                    type: 'number',
                    readOnly: true
                },
                {
                    title: 'Linear Regression',
                    type: 'number',
                    readOnly: true
                },
                {
                    title: 'TES',
                    type: 'number',
                    readOnly: true
                },
                {
                    title: 'ARIMA',
                    type: 'number',
                    readOnly: true
                },

                {
                    title: 'Selected Forecast',
                    type: 'number',
                    mask: '#,##.00',
                    // readOnly: true
                },
                {
                    title: 'Manual Change (+/-)',
                    type: 'number',
                    mask: '#,##.00'
                },
                {
                    title: 'Month End (Final)',
                    type: 'number',
                    mask: '#,##.00',
                    readOnly: true
                },
                {
                    title: 'manualChangeAffectsFutureMonth',
                    type: 'hidden'
                },
                {
                    title: 'extrapolationMethodId',
                    type: 'text'
                }
            ],

            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loadedExtrapolation,
            pagination: false,
            search: false,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            oneditionend: this.onedit,
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el.jexcel;
                if (y != null) {
                    var rowData = elInstance.getRowData(y);
                    // if (rowData[0] != "") {
                    if (moment(rowData[0]).isBetween(this.props.items.forecastStartDate, this.props.items.forecastStopDate, undefined, '[)')) {
                        var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                        cell.classList.add('bold');
                    } else {
                        var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                        cell.classList.remove('bold');
                        // elInstance.showIndex(6);
                    }
                    // } 
                    // if (rowData[3] != "" && moment(this.state.minMonth).diff(moment(rowData[3]), 'months') == 0) {
                    //     var cell = elInstance.getCell(("D").concat(parseInt(y) + 1))
                    //     cell.classList.add('readonly');
                    // } else {
                    //     var cell = elInstance.getCell(("D").concat(parseInt(y) + 1))
                    //     cell.classList.remove('readonly');
                    // }

                }
            }.bind(this),
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
        var dataExtrapolation = jexcel(document.getElementById("tableDiv"), options);
        this.el = dataExtrapolation;
        var rmseArr = [];
        var mapeArr = [];
        var mseArr = [];
        var rSqdArr = [];
        var wapeArr = [];

        if (this.state.movingAvgId) {
            rmseArr.push(this.state.movingAvgError.rmse)
        }
        if (this.state.semiAvgId) {
            rmseArr.push(this.state.semiAvgError.rmse)
        }
        if (this.state.linearRegressionId) {
            rmseArr.push(this.state.linearRegressionError.rmse)
        }
        if (this.state.smoothingId) {
            rmseArr.push(this.state.tesError.rmse)
        }

        if (this.state.movingAvgId) {
            mapeArr.push(this.state.movingAvgError.mape)
        }
        if (this.state.semiAvgId) {
            mapeArr.push(this.state.semiAvgError.mape)
        }
        if (this.state.linearRegressionId) {
            mapeArr.push(this.state.linearRegressionError.mape)
        }
        if (this.state.smoothingId) {
            mapeArr.push(this.state.tesError.mape)
        }

        if (this.state.movingAvgId) {
            mseArr.push(this.state.movingAvgError.mse)
        }
        if (this.state.semiAvgId) {
            mseArr.push(this.state.semiAvgError.mse)
        }
        if (this.state.linearRegressionId) {
            mseArr.push(this.state.linearRegressionError.mse)
        }
        if (this.state.smoothingId) {
            mseArr.push(this.state.tesError.mse)
        }

        if (this.state.movingAvgId) {
            rSqdArr.push(this.state.movingAvgError.rSqd)
        }
        if (this.state.semiAvgId) {
            rSqdArr.push(this.state.semiAvgError.rSqd)
        }
        if (this.state.linearRegressionId) {
            rSqdArr.push(this.state.linearRegressionError.rSqd)
        }
        if (this.state.smoothingId) {
            rSqdArr.push(this.state.tesError.rSqd)
        }

        if (this.state.movingAvgId) {
            wapeArr.push(this.state.movingAvgError.wape)
        }
        if (this.state.semiAvgId) {
            wapeArr.push(this.state.semiAvgError.wape)
        }
        if (this.state.linearRegressionId) {
            wapeArr.push(this.state.linearRegressionError.wape)
        }
        if (this.state.smoothingId) {
            wapeArr.push(this.state.tesError.wape)
        }

        var minRmse = Math.min(...rmseArr.filter(c => c != ""));
        var minMape = Math.min(...mapeArr.filter(c => c != ""));
        var minMse = Math.min(...mseArr.filter(c => c != ""));
        var minRsqd = Math.min(...rSqdArr.filter(c => c != ""));
        var minWape = Math.min(...wapeArr.filter(c => c != ""));
        this.setState({
            dataExtrapolation,
            minRmse: minRmse,
            minMape: minMape,
            minMse: minMse,
            minRsqd: minRsqd,
            minWape: minWape
            // dataEl: dataEl, loading: false,
            // inputDataFilter: inputData,
            // inputDataAverageFilter: inputDataAverage,
            // inputDataRegressionFilter: inputDataRegression,
            // startMonthForExtrapolation: startMonth
        })
    }
    loadedExtrapolation = function (instance, cell, x, y, value) {
        //  jExcelLoadedFunctionWithoutPagination(instance);
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild.nextSibling;
        console.log("asterisk", asterisk.firstChild.nextSibling)

        tr.children[3].classList.add('InfoTr');
        tr.children[5].classList.add('InfoTr');
        tr.children[6].classList.add('InfoTr');
        tr.children[7].classList.add('InfoTr');
        tr.children[8].classList.add('InfoTr');
        tr.children[9].classList.add('InfoTr');


    }

    setMovingAvgId(e) {
        var movingAvgId = e.target.checked;
        this.setState({
            movingAvgId: movingAvgId
        }, () => {
            if (this.state.dataExtrapolation != "") {
                if (movingAvgId) {
                    this.state.dataExtrapolation.showColumn(4);
                } else {
                    this.state.dataExtrapolation.hideColumn(4);
                }
            }
        })
    }
    setSemiAvgId(e) {
        var semiAvgId = e.target.checked;
        this.setState({
            semiAvgId: semiAvgId
        }, () => {
            if (this.state.dataExtrapolation != "") {
                if (semiAvgId) {
                    this.state.dataExtrapolation.showColumn(5);
                } else {
                    this.state.dataExtrapolation.hideColumn(5);
                }
            }
        })
    }
    setLinearRegressionId(e) {
        var linearRegressionId = e.target.checked;
        this.setState({
            linearRegressionId: linearRegressionId
        }, () => {
            if (this.state.dataExtrapolation != "") {
                if (linearRegressionId) {
                    this.state.dataExtrapolation.showColumn(6);
                } else {
                    this.state.dataExtrapolation.hideColumn(6);
                }
            }
        })
    }
    setSmoothingId(e) {
        var smoothingId = e.target.checked;
        this.setState({
            smoothingId: smoothingId
        }, () => {
            if (this.state.dataExtrapolation != "") {
                if (smoothingId) {
                    this.state.dataExtrapolation.showColumn(7);
                } else {
                    this.state.dataExtrapolation.hideColumn(7);
                }
            }
        })
    }
    setArimaId(e) {
        var arimaId = e.target.checked;
        this.setState({
            arimaId: arimaId
        }, () => {
            if (this.state.dataExtrapolation != "") {
                if (arimaId) {
                    this.state.dataExtrapolation.showColumn(8);
                } else {
                    this.state.dataExtrapolation.hideColumn(8);
                }
            }
        })
    }
    getDatasetData(e) {

    }

    toggleChooseMethod() {
        this.setState({
            popoverChooseMethod: !this.state.popoverChooseMethod,
        });
    }
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    render() {
        const { extrapolationMethodList } = this.state;
        let extrapolationMethods = extrapolationMethodList.length > 0
            && extrapolationMethodList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        const { rangeValue, rangeValue1 } = this.state;
        const options = {
            title: {
                display: false,
            },

            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'People',
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
                        scaleLabel: {
                            display: true,
                            labelString: 'Month',
                            fontColor: 'black'
                        },
                        ticks: {
                            fontColor: 'black',
                            callback: function (label) {
                                console.log("month label---", label);
                                var xAxis1 = label
                                xAxis1 += '';
                                console.log("month graph---", xAxis1.split('-')[0])
                                var month = moment(label).format(DATE_FORMAT_CAP_WITHOUT_DATE);
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
            // enabled: false,
            // custom: CustomTooltips,
            // callbacks: {
            // label: function (tooltipItem, data) {

            // let label = data.labels[tooltipItem.index];
            // let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

            // var cell1 = value
            // cell1 += '';
            // var x = cell1.split('.');
            // var x1 = x[0];
            // var x2 = x.length > 1 ? '.' + x[1] : '';
            // var rgx = /(\d+)(\d{3})/;
            // while (rgx.test(x1)) {
            // x1 = x1.replace(rgx, '$1' + ',' + '$2');
            // }
            // return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
            // }
            // }

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
            labels: this.state.jexcelData.map((item, index) => (item.month)),
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
                    data: this.state.jexcelData.map((item, index) => (item.adjustedActuals > 0 ? item.adjustedActuals : null))
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
                    data: this.state.jexcelData.map((item, index) => (item.ma > 0 ? item.ma : null))
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
                    data: this.state.jexcelData.map((item, index) => (item.sa > 0 ? item.sa : null))
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
                    data: this.state.jexcelData.map((item, index) => (item.lr > 0 ? item.lr : null))
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
                    data: this.state.jexcelData.map((item, index) => (item.tesM > 0 ? item.tesM : null))
                },
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: 'TES (Medium)',
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
                    data: this.state.jexcelData.map((item, index) => (item.tesM > 0 ? item.tesM : null))
                },
                {
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
                    data: this.state.jexcelData.map((item, index) => (item.tesM > 0 ? item.tesM : null))
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
                    data: this.state.jexcelData.map((item, index) => (item.arima > 0 ? item.arima : null))
                }
            ]
        }
        return (
            <div className="animated fadeIn">
                <CardBody className="pb-lg-2 pt-lg-0">
                    <div className="row pt-lg-0" style={{ float: 'right', marginTop: '-42px' }}>
                        <div className="col-md-12">
                            {/* <SupplyPlanFormulas ref="formulaeChild" /> */}
                            <a className="">
                                <span style={{ cursor: 'pointer', color: '20a8d8' }} ><small className="supplyplanformulas">{i18n.t('Show Guidance')}</small></span>

                            </a>
                        </div>
                    </div>
                    <Form name='simpleForm'>
                        <div className=" pl-0">
                            <div className="row">
                                <FormGroup className="col-md-3 pl-lg-0">
                                    <Label htmlFor="appendedInputButton">Start Month for Historical Data<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
                                    <div className="controls edit readonly">
                                        <Picker

                                            id="month"
                                            name="month"
                                            ref={this.pickAMonth1}
                                            years={{ min: this.props.items.minDate, max: this.props.items.maxDate }}
                                            value={{
                                                year: new Date(this.props.items.currentScenario.month).getFullYear(), month: ("0" + (new Date(this.props.items.currentScenario.month).getMonth() + 1)).slice(-2)
                                            }}
                                            lang={pickerLang.months}
                                        // theme="dark"
                                        // onChange={this.handleAMonthChange1}
                                        // onDismiss={this.handleAMonthDissmis1}
                                        >
                                            <MonthBox value={this.makeText({ year: new Date(this.props.items.currentScenario.month).getFullYear(), month: ("0" + (new Date(this.props.items.currentScenario.month).getMonth() + 1)).slice(-2) })}
                                            />
                                        </Picker>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">Forecast Period<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
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
                                            <MonthBox value={this.props.items.forecastPeriod} />
                                        </Picker>
                                    </div>
                                </FormGroup>
                                {/* <FormGroup className="col-md-3">
 
 <div>
 Show Guidance
 </div>
 </FormGroup> */}
                            </div>
                            <div className="row">
                                <FormGroup className="col-md-12 " style={{ display: this.state.show ? "block" : "none" }}>
                                    <div className="check inline pl-lg-3 pt-lg-2">
                                        <div className="row pl-lg-1 pb-lg-2">
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
                                            {/* {this.state.movingAvgId && */}
                                            <div className="col-md-3 pt-lg-0" style={{ display: this.state.movingAvgId ? '' : 'none' }}>
                                                <Label htmlFor="appendedInputButton"># of Months</Label>
                                                <Input
                                                    className="controls"
                                                    type="text"
                                                    bsSize="sm"
                                                    id="noOfMonthsId"
                                                    name="noOfMonthsId"
                                                    value={this.state.monthsForMovingAverage}
                                                    onChange={(e) => { this.setMonthsForMovingAverage(e); }}
                                                />
                                            </div>
                                            {/* } */}
                                        </div>
                                        <div className="row pl-lg-1 pb-lg-2">
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenSa} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenMa', !this.state.popoverOpenSa)}>
                                                    <PopoverBody>Need to add Info.</PopoverBody>
                                                </Popover>
                                            </div>
                                            <div className="pt-lg-2">
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
                                        </div>
                                        <div className="row pl-lg-1 pb-lg-2">
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenLr} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenLr', !this.state.popoverOpenLr)}>
                                                    <PopoverBody>Need to add Info.</PopoverBody>
                                                </Popover>
                                            </div>
                                            <div className="pt-lg-2">
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
                                        </div>
                                        <div className="row pl-lg-1 pb-lg-2">
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenTes} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenMa', !this.state.popoverOpenTes)}>
                                                    <PopoverBody>Need to add Info.</PopoverBody>
                                                </Popover>
                                            </div>
                                            <div className="pt-lg-2">
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
                                            <div className="row col-md-12 pt-lg-2" style={{ display: this.state.smoothingId ? '' : 'none' }}>
                                                <div className="pt-lg-0" style={{ display: 'contents' }}>
                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.confidenceLevel')}</Label>
                                                        <Input
                                                            className="controls"
                                                            type="select"
                                                            bsSize="sm"
                                                            id="confidenceLevelId"
                                                            name="confidenceLevelId"
                                                            value={this.state.confidenceLevelId}
                                                            onChange={(e) => { this.setConfidenceLevelId(e); }}
                                                        >
                                                            <option value="0.85">85%</option>
                                                            <option value="0.90">90%</option>
                                                            <option value="0.95">95%</option>
                                                            <option value="0.99">99%</option>
                                                            <option value="0.995">99.5%</option>
                                                            <option value="0.999">99.9%</option>
                                                        </Input>
                                                    </div>
                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.seasonality')}</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            bsSize="sm"
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

                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.alpha')}</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="alphaId"
                                                            bsSize="sm"
                                                            name="alphaId"
                                                            value={this.state.alpha}
                                                            onChange={(e) => { this.setAlpha(e); }}
                                                        />
                                                    </div>
                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.beta')}</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="betaId"
                                                            bsSize="sm"
                                                            name="betaId"
                                                            value={this.state.beta}
                                                            onChange={(e) => { this.setBeta(e); }}
                                                        />
                                                    </div>
                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.gamma')}</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            bsSize="sm"
                                                            id="gammaId"
                                                            name="gammaId"
                                                            value={this.state.gamma}
                                                            onChange={(e) => { this.setGamma(e); }}
                                                        />
                                                    </div>
                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                        <Label htmlFor="appendedInputButton">Phi</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="phiId"
                                                            bsSize="sm"
                                                            name="phiId"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row pl-lg-1 pb-lg-2">
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenArima} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)}>
                                                    <PopoverBody>Need to add Info.</PopoverBody>
                                                </Popover>
                                            </div>
                                            <div className="pt-lg-2">
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
                                                    <b>{i18n.t('static.extrapolation.arimaFull')}</b>
                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                </Label>
                                            </div>
                                            {this.state.arimaId &&
                                                <div className="pt-lg-0" style={{ display: 'contents' }}>
                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.p')}</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="pId"
                                                            bsSize="sm"
                                                            name="pId"
                                                        />
                                                    </div>
                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.d')}</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="dId"
                                                            bsSize="sm"
                                                            name="dId"
                                                        />
                                                    </div>
                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                        <Label htmlFor="appendedInputButton">q</Label>
                                                        <Input
                                                            className="controls"
                                                            type="text"
                                                            id="qId"
                                                            bsSize="sm"
                                                            name="qId"
                                                        />
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </FormGroup>
                            </div>
                            <div className="col-md-12 text-left pt-lg-3 pl-lg-0">
                                <Button className="mr-1 btn btn-info btn-md " onClick={this.toggledata}>
                                    {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                                </Button>
                                <Button type="button" color="success" className="mr-1" size="md" onClick={this.interpolate}>Interpolate</Button>
                            </div>
                        </div>
                    </Form>
                    <div className="col-md-12 pl-lg-0 pr-lg-0 pt-lg-3">
                        <div className="col-md-6">
                            {/* <Button type="button" size="md" color="info" className="float-left mr-1" onClick={this.resetTree}>{'Show/hide data'}</Button> */}
                        </div>
                        <div className="col-md-4 float-right" style={{ marginTop: '-42px' }}>
                            <FormGroup className="float-right" >
                                <div className="check inline pl-lg-1 pt-lg-0">
                                    <div>
                                        <Input
                                            className="form-check-input checkboxMargin"
                                            type="checkbox"
                                            id="manualChangeExtrapolation"
                                            name="manualChangeExtrapolation"
                                            // checked={true}
                                            checked={this.props.items.currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].manualChangesEffectFuture}
                                            onClick={(e) => { this.manualChangeExtrapolation(e); }}
                                        />
                                        <Label
                                            className="form-check-label"
                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                            <b>{'Manual change affects future months (cumulative)'}</b>
                                        </Label>
                                    </div>
                                </div>
                            </FormGroup>
                        </div>
                    </div>
                    <div id="tableDiv" className="extrapolateTable consumptionDataEntryTable"></div>
                    {/* Graph */}
                    <div className="col-md-12 pt-lg-4">
                        <div className="chart-wrapper chart-graph-report pl-0 ml-0" style={{ marginLeft: '50px' }}>
                            <Line id="cool-canvas" data={line} options={options} />
                            <div>

                            </div>
                        </div>
                    </div>
                    <div className="table-scroll">
                        <div className="table-wrap table-responsive">
                            <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                <thead>
                                    <tr>
                                        <td width="230px"><b>{i18n.t('static.common.errors')}</b></td>
                                        {this.state.movingAvgId &&
                                            <td width="110px"><b>{i18n.t('static.extrapolation.movingAverages')}</b></td>
                                        }
                                        {this.state.semiAvgId &&
                                            <td width="110px"><b>{i18n.t('static.extrapolation.semiAverages')}</b></td>
                                        }
                                        {this.state.linearRegressionId &&
                                            <td width="110px"><b>{i18n.t('static.extrapolation.linearRegression')}</b></td>
                                        }
                                        {this.state.smoothingId &&
                                            <td width="110px"><b>{i18n.t('static.extrapolation.tes')}</b></td>
                                        }
                                        {this.state.arimaId &&
                                            <td width="110px"><b>{i18n.t('static.extrapolation.arima')}</b></td>
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{i18n.t('static.extrapolation.rmse')}</td>
                                        {this.state.movingAvgId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minRmse == this.state.movingAvgError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse == this.state.movingAvgError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.rmse != "" ? this.state.movingAvgError.rmse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.semiAvgId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minRmse == this.state.semiAvgError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse == this.state.semiAvgError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.rmse != "" ? this.state.semiAvgError.rmse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.linearRegressionId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minRmse == this.state.linearRegressionError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse == this.state.linearRegressionError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.rmse != "" ? this.state.linearRegressionError.rmse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.smoothingId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minRmse == this.state.tesError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse == this.state.tesError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.rmse != "" ? this.state.tesError.rmse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.arimaId &&
                                            <td></td>
                                        }
                                    </tr>
                                    <tr>
                                        <td>{i18n.t('static.extrapolation.mape')}</td>
                                        {this.state.movingAvgId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minMape == this.state.movingAvgError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape == this.state.movingAvgError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.mape != "" ? this.state.movingAvgError.mape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.semiAvgId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minMape == this.state.semiAvgError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape == this.state.semiAvgError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.mape != "" ? this.state.semiAvgError.mape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.linearRegressionId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minMape == this.state.linearRegressionError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape == this.state.linearRegressionError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.mape != "" ? this.state.linearRegressionError.mape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.smoothingId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minMape == this.state.tesError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape == this.state.tesError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.mape != "" ? this.state.tesError.mape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.arimaId &&
                                            <td></td>
                                        }
                                    </tr>
                                    <tr>
                                        <td>{i18n.t('static.extrapolation.mse')}</td>
                                        {this.state.movingAvgId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minMse == this.state.movingAvgError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse == this.state.movingAvgError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.mse != "" ? this.state.movingAvgError.mse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.semiAvgId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minMse == this.state.semiAvgError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse == this.state.semiAvgError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.mse != "" ? this.state.semiAvgError.mse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.linearRegressionId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minMse == this.state.linearRegressionError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse == this.state.linearRegressionError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.mse != "" ? this.state.linearRegressionError.mse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.smoothingId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minMse == this.state.tesError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse == this.state.tesError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.mse != "" ? this.state.tesError.mse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.arimaId &&
                                            <td></td>
                                        }
                                    </tr>
                                    <tr>
                                        <td>{i18n.t('static.extrapolation.wape')}</td>
                                        {this.state.movingAvgId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minWape == this.state.movingAvgError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape == this.state.movingAvgError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.wape != "" ? this.state.movingAvgError.wape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.semiAvgId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minWape == this.state.semiAvgError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape == this.state.semiAvgError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.wape != "" ? this.state.semiAvgError.wape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.linearRegressionId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minWape == this.state.linearRegressionError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape == this.state.linearRegressionError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.wape != "" ? this.state.linearRegressionError.wape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.smoothingId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minWape == this.state.tesError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape == this.state.tesError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.wape != "" ? this.state.tesError.wape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.arimaId &&
                                            <td></td>
                                        }
                                    </tr>
                                    <tr>
                                        <td>{i18n.t('static.extrapolation.rSquare')}</td>
                                        {this.state.movingAvgId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minRsqd == this.state.movingAvgError.rSqd ? "bold" : "normal" }} bgcolor={this.state.minRsqd == this.state.movingAvgError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.rSqd != "" ? this.state.movingAvgError.rSqd.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.semiAvgId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minRsqd == this.state.semiAvgError.rSqd ? "bold" : "normal" }} bgcolor={this.state.minRsqd == this.state.semiAvgError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.rSqd != "" ? this.state.semiAvgError.rSqd.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.linearRegressionId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minRsqd == this.state.linearRegressionError.rSqd ? "bold" : "normal" }} bgcolor={this.state.minRsqd == this.state.linearRegressionError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.rSqd != "" ? this.state.linearRegressionError.rSqd.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.smoothingId &&
                                            <td style={{ textAlign: "right", "fontWeight": this.state.minRsqd == this.state.tesError.rSqd ? "bold" : "normal" }} bgcolor={this.state.minRsqd == this.state.tesError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.rSqd != "" ? this.state.tesError.rSqd.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                        }
                                        {this.state.arimaId &&
                                            <td></td>
                                        }
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>
                    <div className="col-md-12 pl-lg-0 pt-lg-3 pb-lg-3">
                        <ul className="legendcommitversion pl-lg-0">
                            <li><span className="lowestErrorGreenLegend legendcolor"></span> <span className="legendcommitversionText">Lowest Error</span></li>

                        </ul>
                    </div>
                    <div className="col-md-12 pl-lg-0">
                        <Row>
                            <FormGroup className="col-md-3">
                                <Label htmlFor="currencyId">Choose Method<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.togglepopoverChooseMethod('popoverChooseMethod', !this.state.popoverChooseMethod)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                <InputGroup>
                                    <Input
                                        type="select"
                                        name="extrapolationMethodId"
                                        id="extrapolationMethodId"
                                        bsSize="sm"
                                        value={this.state.nodeDataExtrapolation.extrapolationMethod.id}
                                        onChange={(e) => { this.extrapolationMethodChange(e) }}
                                    >
                                        <option value="">{"Select extrapolation method"}</option>
                                        {extrapolationMethods}
                                    </Input>

                                </InputGroup>

                            </FormGroup>
                            <div>
                                <Popover placement="top" isOpen={this.state.popoverChooseMethod} target="Popover1" trigger="hover" toggleChooseMethod={() => this.toggleChooseMethod('popoverChooseMethod', !this.state.popoverChooseMethod)}>
                                    <PopoverBody>Need to add Info.</PopoverBody>
                                </Popover>
                            </div>
                            <FormGroup className="col-md-5">
                                <Label htmlFor="currencyId">Notes</Label>
                                <InputGroup>
                                    <Input
                                        type="textarea"
                                        name="notesExtrapolation"
                                        id="notesExtrapolation"
                                        bsSize="sm"
                                        value={this.state.nodeDataExtrapolation.notes}
                                    // onChange={(e) => { this.setStartAndStopDateOfProgram(e.target.value) }}
                                    ></Input>

                                </InputGroup>

                            </FormGroup>
                            <FormGroup className="pl-lg-3 ExtrapolateSaveBtn">
                                <Button type="submit" color="success" className="mr-1 float-right" size="md"><i className="fa fa-check"></i>{i18n.t('static.pipeline.save')}</Button>
                            </FormGroup>
                        </Row>
                    </div>
                </CardBody>
            </div>
        )
    }
}