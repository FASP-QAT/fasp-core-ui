import React from "react";
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import i18n from '../../i18n';
import { Row, Col, Card, CardFooter, Button, Table, CardBody, Form, Modal, ModalBody, PopoverBody, Popover, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, InputGroupAddon, Collapse, InputGroupText, InputGroup } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import { INDEXED_DB_VERSION, INDEXED_DB_NAME, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL, JEXCEL_DECIMAL_MONTHLY_CHANGE, JEXCEL_DECIMAL_NO_REGEX_LONG_4_DECIMAL } from "../../Constants";
import moment from "moment";
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../../views/Forms/ValidationForms/ValidationForms.css'
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import { Bar, Line, Pie } from 'react-chartjs-2';
import { calculateMovingAvg } from '../Extrapolation/MovingAverages';
import { calculateSemiAverages } from '../Extrapolation/SemiAverages';
import { calculateLinearRegression } from '../Extrapolation/LinearRegression';
import { calculateTES } from '../Extrapolation/TESNew';
import { calculateArima } from '../Extrapolation/Arima';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { JEXCEL_INTEGER_REGEX } from '../../Constants.js'
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import { calculateError } from "../Extrapolation/ErrorCalculations";
import AuthenticationService from '../Common/AuthenticationService.js';
import showguidanceTreeExtrapolationEn from '../../../src/ShowGuidanceFiles/BuildTreeExtrapolationNodeEn.html'
import showguidanceTreeExtrapolationFr from '../../../src/ShowGuidanceFiles/BuildTreeExtrapolationNodeFr.html'
import showguidanceTreeExtrapolationSp from '../../../src/ShowGuidanceFiles/BuildTreeExtrapolationNodeSp.html'
import showguidanceTreeExtrapolationPr from '../../../src/ShowGuidanceFiles/BuildTreeExtrapolationNodePr.html'

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

const validationSchemaExtrapolation = function (values) {
    return Yup.object().shape({
        noOfMonthsId:
            Yup.string().test('noOfMonthsId', 'Please enter positive number.',
                function (value) {
                    console.log("***1**", document.getElementById("movingAvgId").value);
                    console.log("***noOfMonthsId**", document.getElementById("noOfMonthsId").value);
                    var testNumber = JEXCEL_INTEGER_REGEX.test((document.getElementById("noOfMonthsId").value).replaceAll(",", ""));
                    console.log("***testNumber***", testNumber)
                    if ((document.getElementById("movingAvgId").value) == "true" && (document.getElementById("noOfMonthsId").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        confidenceLevelId:
            Yup.string().test('confidenceLevelId', 'Please select confidence level.',
                function (value) {
                    console.log("***2**", document.getElementById("smoothingId").value);
                    // var testNumber = document.getElementById("confidenceLevelId").value != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(document.getElementById("confidenceLevelId").value) : false;
                    // console.log("*****", testNumber);
                    if ((document.getElementById("smoothingId").value) == "true" && document.getElementById("confidenceLevelId").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        confidenceLevelIdLinearRegression:
            Yup.string().test('confidenceLevelIdLinearRegression', 'Please select confidence level.',
                function (value) {
                    console.log("***2**", document.getElementById("linearRegressionId").value);
                    if ((document.getElementById("linearRegressionId").value) == "true" && document.getElementById("confidenceLevelIdLinearRegression").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        confidenceLevelIdArima:
            Yup.string().test('confidenceLevelIdArima', 'Please select confidence level.',
                function (value) {
                    console.log("***11**", document.getElementById("arimaId").value);
                    if ((document.getElementById("arimaId").value) == "true" && document.getElementById("confidenceLevelIdArima").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        // seasonalityId:
        //     Yup.string().test('seasonalityId', 'Please enter a valid whole number between 1 & 24.',
        //         function (value) {
        //             console.log("***3**", document.getElementById("smoothingId").value);
        //             var testNumber = document.getElementById("seasonalityId").value != "" ? (/^(?:[1-9]|[1][0-9]|2[0-4])$/).test(document.getElementById("seasonalityId").value) : false;
        //             // console.log("*****", testNumber);
        //             if ((document.getElementById("smoothingId").value) == "true" && (document.getElementById("seasonalityId").value == "" || testNumber == false)) {
        //                 return false;
        //             } else {
        //                 return true;
        //             }
        //         }),
        gammaId:
            Yup.string().test('gammaId', 'Please enter correct gamma value.',
                function (value) {
                    console.log("***4**", document.getElementById("smoothingId").value);
                    var testNumber = document.getElementById("gammaId").value != "" ? (/^((?:[0]*)(?:\.\d{1,2})?|1(?:\.0\d{0,1})?)$/).test(document.getElementById("gammaId").value) : false;
                    // console.log("*****", testNumber);
                    if ((document.getElementById("smoothingId").value) == "true" && (document.getElementById("gammaId").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        betaId:
            Yup.string().test('betaId', 'Please enter correct beta value.',
                function (value) {
                    console.log("***5**", document.getElementById("smoothingId").value);
                    var testNumber = document.getElementById("betaId").value != "" ? (/^((?:[0]*)(?:\.\d{1,2})?|1(?:\.0\d{0,1})?)$/).test(document.getElementById("betaId").value) : false;
                    // console.log("*****", testNumber);
                    if ((document.getElementById("smoothingId").value) == "true" && (document.getElementById("betaId").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        alphaId:
            Yup.string().test('alphaId', 'Please enter correct alpha value.',
                function (value) {
                    console.log("***6**", document.getElementById("smoothingId").value);
                    var testNumber = document.getElementById("alphaId").value != "" ? (/^((?:[0]*)(?:\.\d{1,2})?|1(?:\.0\d{0,1})?)$/).test(document.getElementById("alphaId").value) : false;
                    // console.log("*****", testNumber);
                    if ((document.getElementById("smoothingId").value) == "true" && (document.getElementById("alphaId").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        pId:
            Yup.string().test('pId', 'Please enter correct p value.',
                function (value) {
                    console.log("***7**", document.getElementById("arimaId").value);
                    var testNumber = document.getElementById("pId").value != "" ? (/^\d{0,3}(\.\d{1,4})?$/).test(document.getElementById("pId").value) : false;
                    // console.log("*****", testNumber);
                    if ((document.getElementById("arimaId").value) == "true" && (document.getElementById("pId").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        dId:
            Yup.string().test('dId', 'Please enter correct d value.',
                function (value) {
                    console.log("***8**", document.getElementById("arimaId").value);
                    var testNumber = document.getElementById("dId").value != "" ? (/^\d{0,3}(\.\d{1,4})?$/).test(document.getElementById("dId").value) : false;
                    // var testNumber = JEXCEL_INTEGER_REGEX.test((document.getElementById("dId").value).replaceAll(",", ""));
                    // console.log("*****", testNumber);
                    if ((document.getElementById("arimaId").value) == "true" && (document.getElementById("dId").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        qId:
            Yup.string().test('qId', 'Please enter correct q value.',
                function (value) {
                    console.log("***4 arima**", document.getElementById("arimaId").value);
                    var testNumber = document.getElementById("qId").value != "" ? (/^\d{0,3}(\.\d{1,4})?$/).test(document.getElementById("qId").value) : false;
                    console.log("*****", testNumber);
                    if ((document.getElementById("arimaId").value) == "true" && (document.getElementById("qId").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        // Yup.string().test('qId', 'Please enter correct q value.',
        //     function (value) {
        //         console.log("***9**", document.getElementById("arimaId").value);
        //         // var testNumber = document.getElementById("qId").value != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(document.getElementById("qId").value) : false;
        //         var testNumber = JEXCEL_INTEGER_REGEX.test((document.getElementById("qId").value).replaceAll(",", ""));
        //         // console.log("*****", testNumber);
        //         if ((document.getElementById("arimaId").value) == "true" && (document.getElementById("qId").value == "" || testNumber == false)) {
        //             return false;
        //         } else {
        //             return true;
        //         }
        //     }),
        // extrapolationMethodId:
        //     Yup.string().test('extrapolationMethodId', 'Please enter q value.',
        //         function (value) {
        //             console.log("***extrapolationMethodId**", document.getElementById("extrapolationMethodId").value);
        //             // var testNumber = document.getElementById("qId").value != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(document.getElementById("qId").value) : false;
        //             // console.log("*****", testNumber);
        //             if (document.getElementById("extrapolationMethodId").value == undefined || document.getElementById("extrapolationMethodId").value == "" || document.getElementById("extrapolationMethodId").value == '' || document.getElementById("extrapolationMethodId").value == null) {
        //                 console.log("ex if ")
        //                 return false;
        //             } else {
        //                 console.log("ex else ")
        //                 return true;
        //             }
        //         }),
        extrapolationMethodId:
            Yup.string().test('extrapolationMethodId', 'Please select extrapolation method.',
                function (value) {
                    console.log("***4 buttonFalg**", document.getElementById("buttonFalg").value);
                    if (document.getElementById("buttonFalg").value == 1 && document.getElementById("extrapolationMethodId").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),

    })
}

const validateExtrapolation = (getValidationSchema) => {
    return (values) => {
        const validationSchemaExtrapolation = getValidationSchema(values)
        try {
            validationSchemaExtrapolation.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationErrorExtrapolation(error)
        }
    }
}

const getErrorsFromValidationErrorExtrapolation = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}
function addCommasExtrapolation(cell1, row) {

    if (cell1 != null && cell1 != "") {
        cell1 += '';
        var x = cell1.replaceAll(",", "").split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1].slice(0, 4) : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
        // return cell1.toString().replaceAll(",", "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    } else {
        return "";
    }
}
export default class TreeExtrapolationComponent extends React.Component {
    constructor(props) {
        super(props);
        this.pickRange = React.createRef();
        this.pickRange1 = React.createRef();
        var startDate = moment("2021-05-01").format("YYYY-MM-DD");
        var endDate = moment("2022-02-01").format("YYYY-MM-DD");
        var startDate1 = moment(this.props.items.forecastStartDate).startOf('month').subtract(23, 'months').startOf('month').utc().format("YYYY-MM-DD");
        var endDate1 = moment(this.props.items.forecastStartDate).startOf('month').utc().format("YYYY-MM-DD");
        this.state = {
            rangeValue1: { from: { year: new Date(startDate1).getFullYear(), month: new Date(startDate1).getMonth() + 1 }, to: { year: new Date(endDate1).getFullYear(), month: new Date(endDate1).getMonth() + 1 } },
            seasonality: 0,
            dataChanged: false,
            buttonFalg: 1,
            showJexcelData: false,
            maxMonth: '',
            extrapolationLoader: true,
            forecastNestedHeader: '5',
            filteredExtrapolationMethodList: [],
            minMonth: '',
            monthsForMovingAverage: 5,
            confidenceLevelId: 0.95,
            confidenceLevelIdLinearRegression: 0.95,
            confidenceLevelIdArima: 0.95,
            // noOfMonthsForASeason: 12,
            movingAvgData: [],
            alpha: 0.2,
            beta: 0.2,
            gamma: 0.2,
            p: 0,
            d: 1,
            q: 1,
            nodeDataExtrapolationOptionList: [],
            nodeDataExtrapolation: {
                extrapolationMethod: { id: '' },
                notes: '',
                // reportingRate
                // month
                // amount
                extrapolationDataList: []
            },
            monthArray: [],
            extrapolationMethodList: [],
            show: false,
            jexcelDataArr: [],
            jexcelData: [

            ],
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            maxDateForHistoricalData: { year: new Date(endDate1).getFullYear(), month: new Date(endDate1).getMonth() + 1 },
            rangeValue: { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } },
            movingAvgId: true,
            semiAvgId: true,
            linearRegressionId: true,
            smoothingId: true,
            arimaId: true,
            // movingAvgId: true,
            // semiAvgId: true,
            // linearRegressionId: true,
            // smoothingId: true,
            // arimaId: true,
            popoverOpenQ: false,
            popoverOpenD: false,
            popoverOpenP: false,
            popoverOpenGamma: false,
            popoverOpenBeta: false,
            popoverOpenAlpha: false,
            // popoverOpenSeasonality: false,
            popoverOpenConfidenceLevel: false,
            popoverOpenConfidenceLeve1l: false,
            popoverOpenStartMonth: false,
            popoverOpenChooseMethod: false,
            popoverOpenMa: false,
            popoverOpenSa: false,
            popoverOpenLr: false,
            popoverOpenTes: false,
            popoverOpenArima: false,
            semiAvgData: [],
            linearRegressionData: [],
            tesData: [],
            arimaData: [],
            movingAvgError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            semiAvgError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            linearRegressionError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            tesError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            arimaError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            noDataMessage: "",
        }
        this._handleClickRangeBox1 = this._handleClickRangeBox1.bind(this);
        this.toggleChooseMethod = this.toggleChooseMethod.bind(this);
        this.toggleQ = this.toggleQ.bind(this);
        this.toggleD = this.toggleD.bind(this);
        this.toggleP = this.toggleP.bind(this);
        this.toggleGamma = this.toggleGamma.bind(this);
        this.toggleBeta = this.toggleBeta.bind(this);
        this.toggleAlpha = this.toggleAlpha.bind(this);
        // this.toggleSeasonality = this.toggleSeasonality.bind(this);
        this.toggleConfidenceLevel = this.toggleConfidenceLevel.bind(this);
        this.toggleConfidenceLevel1 = this.toggleConfidenceLevel1.bind(this);
        this.toggleLr = this.toggleLr.bind(this);
        this.toggleTes = this.toggleTes.bind(this);
        this.toggleArima = this.toggleArima.bind(this);
        this.toggleSa = this.toggleSa.bind(this);
        this.toggleStartMonth = this.toggleStartMonth.bind(this);
        this.toggleMa = this.toggleMa.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.getExtrapolationMethodList = this.getExtrapolationMethodList.bind(this);
        this.resetExtrapolation = this.resetExtrapolation.bind(this);
        this.manualChangeExtrapolation = this.manualChangeExtrapolation.bind(this);
        this.interpolate = this.interpolate.bind(this);
        this.extrapolationMethodChange = this.extrapolationMethodChange.bind(this);
        this.checkValidationExtrapolation = this.checkValidationExtrapolation.bind(this);
        this.calculateExtrapolatedData = this.calculateExtrapolatedData.bind(this);
        this.changeNotes = this.changeNotes.bind(this);
        this.checkActualValuesGap = this.checkActualValuesGap.bind(this);
        this.saveJexcelData = this.saveJexcelData.bind(this);
        this.toggleJexcelData = this.toggleJexcelData.bind(this);
        this.seasonalityCheckbox = this.seasonalityCheckbox.bind(this);
        this.getDateDifference = this.getDateDifference.bind(this);
        this.handleRangeDissmis1 = this.handleRangeDissmis1.bind(this);
    }

    getDateDifference() {
        var rangeValue = this.state.rangeValue1;
        let startDate = moment(rangeValue.from.year + '-' + rangeValue.from.month + '-01').format("YYYY-MM");
        let endDate = moment(rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate()).format("YYYY-MM");
        console.log("startDate-->", startDate);
        console.log("endDate-->", endDate);
        // var monthsDiff = moment(endDate).diff(startDate, 'months', true);
        const monthsDiff = moment(new Date(endDate)).diff(new Date(startDate), 'months', true);
        console.log("monthsDiff-->", monthsDiff);
        this.setState({
            monthsDiff: Math.round(monthsDiff) + 1
        });
    }

    handleRangeDissmis1(value) {
        console.log("date range value---", value);
        this.setState({ rangeValue1: value, dataChanged: true }, () => {

            this.getDateDifference();

            var rangeValue = value;
            let stopDate;
            let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
            let forecastStopDate = this.props.items.forecastStopDate;
            let rangeStopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
            if (moment(forecastStopDate).format('YYYY-MM-DD') > moment(rangeStopDate).format('YYYY-MM-DD')) {
                stopDate = forecastStopDate;
            } else {
                stopDate = rangeStopDate;
            }
            var minStartDate = moment(startDate).format('YYYY-MM-DD');
            console.log("minStartDate---", minStartDate);
            var monthArray = [];
            var curDate1 = minStartDate;
            for (var m = 0; curDate1 < moment(stopDate).format("YYYY-MM-DD"); m++) {
                console.log("curDate1---", curDate1 + " stop date---", moment(stopDate).format("YYYY-MM-DD") + " result---", curDate1 < moment(stopDate).format("YYYY-MM-DD"));
                console.log("");
                curDate1 = moment(minStartDate).add(m, 'months').format("YYYY-MM-DD");
                console.log("curDate1 only---", curDate1);
                if (moment(stopDate).format("YYYY-MM-DD") >= curDate1) {
                    console.log("curDate1 condition---", true);
                    monthArray.push(curDate1)
                }

            }

            this.setState({ monthArray }, () => {
                console.log("before month array---", this.state.monthArray);
                let jexcelData = [];
                var json;
                for (var j = 0; j < monthArray.length; j++) {
                    var cellData = this.state.nodeDataExtrapolation.extrapolationDataList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))[0];
                    // data = [];
                    // data[0] = monthArray[j]
                    // data[1] = cellData != null && cellData != "" ? cellData.amount : (moment(monthArray[j]).isSame(this.props.items.currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].month) ? this.props.items.currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].calculatedDataValue : "");
                    json = {
                        month: monthArray[j],
                        amount: cellData != null && cellData != "" ? cellData.amount : (moment(monthArray[j]).isSame(this.props.items.currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].month) ? this.props.items.currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].calculatedDataValue : "")
                    }
                    jexcelData.push(json);
                }

                // var tableJson = this.state.dataExtrapolation.getJson(null, false);
                // var jexcelDataArr = [];
                // var resultCount = 0;
                // for (var i = 0; i < tableJson.length; i++) {
                //     var map1 = new Map(Object.entries(tableJson[i]));
                //     if (moment(map1.get("0")).isBetween(startDate, stopDate, null, '[]')) {
                //         console.log("10 map---" + map1.get("10"));
                //         var result = jexcelDataArr.filter(x => x.amount != "");
                //         resultCount = (map1.get("1") != "" && map1.get("1") != null) || result.length > 0 ? resultCount + 1 : resultCount;
                //         var json = {
                //             month: map1.get("0"),
                //             amount: map1.get("1") != "" ? map1.get("1").toString().replaceAll(",", "") : map1.get("1"),
                //             reportingRate: map1.get("2") != "" ? map1.get("2").toString().replaceAll("%", "") : map1.get("2"),
                //             monthNo: resultCount,
                //             manualChange: map1.get("10").toString().replaceAll(",", ""),
                //             adjustedActuals: (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)) != "" ? (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)).toString().replaceAll(",", "") : (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true))
                //         }
                //         jexcelDataArr.push(json);
                //     }
                // }

                // if (jexcelDataArr.length > 0) {
                //     console.log("jexcelDataArr with month no---->", jexcelDataArr)

                //     var valList = jexcelDataArr.filter(c => c.amount != "" && c.amount != null)
                //         .sort(function (a, b) {
                //             return new Date(a.month) - new Date(b.month);
                //         });


                //     if (moment(startDate).format('YYYY-MM-DD') > moment(jexcelDataArr[0].month).format('YYYY-MM-DD')) {
                //         valList = jexcelDataArr.filter(c => c.amount != "" && c.amount != null && moment(c.month).format('YYYY-MM-DD') >= moment(startDate).format('YYYY-MM-DD'))
                //             .sort(function (a, b) {
                //                 return new Date(a.month) - new Date(b.month);
                //             });

                //     }
                //     console.log("range valList---->", valList)
                //     this.setState({
                //         minMonth: valList.length > 0 ? valList[0].month : moment(startDate).format('YYYY-MM-DD'),
                //         maxMonth: valList.length > 0 ? valList[valList.length - 1].month : moment(stopDate).format('YYYY-MM-DD')
                //     }, () => {
                //         console.log("min month---", this.state.minMonth);
                //         console.log("max month---", this.state.maxMonth);
                //         console.log("range before jexcelDataArr---", jexcelDataArr);
                //         this.buildJexcel();
                //     });

                // }

                if (jexcelData.length > 0) {
                    var valList = jexcelData.filter(c => c.amount != "" && c.amount != null)
                        .sort(function (a, b) {
                            return new Date(a.month) - new Date(b.month);
                        });
                    this.setState({
                        minMonth: valList.length > 0 ? valList[0].month : jexcelData[0].month,
                        maxMonth: valList.length > 0 ? valList[valList.length - 1].month : jexcelData[jexcelData.length - 1].month
                    }, () => {
                        console.log("!!!min month---", this.state.minMonth);
                        console.log("!!!max month---", this.state.maxMonth);
                        console.log("range before jexcelDataArr---", jexcelData);
                        this.buildJexcel();
                    });
                }



            });
            // monthArray.push('2025-01-01');
            console.log("monthArray---", monthArray);
        })
    }

    _handleClickRangeBox1(e) {
        this.pickRange1.current.show()
    }
    seasonalityCheckbox(event) {
        this.setState({
            seasonality: event.target.checked ? 1 : 0
        });
    }
    toggleJexcelData() {
        this.setState({ showJexcelData: !this.state.showJexcelData })
    }
    saveJexcelData() {
        var jexcelDataArr = [];
        var tableJson = this.state.dataExtrapolation.getJson(null, false);
        console.log("tableJson length---", tableJson.length);
        console.log("tableJson---", tableJson);
        var resultCount = 0;
        for (var i = 0; i < tableJson.length; i++) {
            var map1 = new Map(Object.entries(tableJson[i]));
            console.log("10 map---" + map1.get("10"));
            var result = jexcelDataArr.filter(x => x.amount != "");
            resultCount = (map1.get("1") != "" && map1.get("1") != 0) || result.length > 0 ? resultCount + 1 : resultCount;
            var json = {
                month: map1.get("0"),
                amount: map1.get("1") != "" ? map1.get("1").toString().replaceAll(",", "") : map1.get("1"),
                reportingRate: map1.get("2") != "" ? map1.get("2").toString().replaceAll("%", "") : map1.get("2"),
                monthNo: resultCount,
                manualChange: map1.get("10").toString().replaceAll(",", ""),
                adjustedActuals: (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)) != "" ? (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)).toString().replaceAll(",", "") : (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true))
            }
            jexcelDataArr.push(json);
        }
        const { nodeDataExtrapolation } = this.state;
        console.log("nodeDataExtrapolation check---", nodeDataExtrapolation);
        nodeDataExtrapolation.extrapolationDataList = jexcelDataArr;
        this.setState({ jexcelDataArr, nodeDataExtrapolation }, () => { this.buildJexcel() });
    }
    checkActualValuesGap(type) {
        console.log("In check actual Values gaps Test123")
        console.log("Loader 1 Test123")
        this.setState({ extrapolationLoader: true }, () => {
            setTimeout(() => {
                var jexcelDataArr = [];
                var tableJson = this.state.dataExtrapolation.getJson(null, false);
                for (var i = 0; i < tableJson.length; i++) {
                    var map1 = new Map(Object.entries(tableJson[i]));
                    var json = {
                        month: map1.get("0"),
                        amount: map1.get("1") != "" ? map1.get("1").toString().replaceAll(",", "") : map1.get("1"),
                        reportingRate: map1.get("2") != "" ? map1.get("2").toString().replaceAll("%", "") : map1.get("2"),
                        manualChange: map1.get("10").toString().replaceAll(",", ""),
                        adjustedActuals: (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)) != "" ? (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)).toString().replaceAll(",", "") : (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)).toString().replaceAll(",", "")
                    }
                    jexcelDataArr.push(json);
                }
                console.log("jexcel data 2--- Test123", jexcelDataArr);
                var dataList = jexcelDataArr.filter(c => c.amount != "")
                    .sort(function (a, b) {
                        return new Date(a.month) - new Date(b.month);
                    });
                console.log("gap2---", dataList)
            if (dataList.length > 0) {
                var result = jexcelDataArr.filter(c => moment(c.month).format("YYYY-MM") > moment(dataList[0].month).format("YYYY-MM") && moment(c.month).format("YYYY-MM") < moment(dataList[dataList.length - 1].month).format("YYYY-MM") && (c.amount == ''))
                console.log("dataList[0]---", dataList[0]);
                console.log("dataList[dataList.length - 1]---", dataList[dataList.length - 1]);
                console.log("gap3---", moment('2021-02-01').isBetween(dataList[0], dataList[dataList.length - 1]))
                console.log("gap4---", jexcelDataArr.filter(c => c.amount == '' && moment(c.month).isBetween(dataList[0], dataList[dataList.length - 1], null)))
                console.log("Result Test123", result)
                if (result.length > 0) {
                    console.log("Loader 2 Test123")
                    this.setState({ extrapolationLoader: false }, () => {
                        setTimeout(() => {
                            alert("Please fill in the blank actual values or interpolate.")
                        }, 0);
                    });
                }
                else {
                    console.log("In else Test123")
                    if (type) {
                        var dataForExtrapolation = jexcelDataArr.filter(c => c.amount != "");
                        if (dataForExtrapolation.length < 3 || (this.state.smoothingId && dataForExtrapolation.length < 24) || (this.state.arimaId && dataForExtrapolation.length < 14)) {
                            // this.setState({ extrapolationLoader: false }, () => {
                            setTimeout(() => {
                                alert(i18n.t('static.tree.minDataRequiredToExtrapolateNote1') + dataForExtrapolation.length + i18n.t('static.tree.minDataRequiredToExtrapolateNote2') + i18n.t('static.tree.minDataRequiredToExtrapolate'))
                            }, 0);
                            // });
                        }
                        console.log("Before calculate extrapolated Data Test123")
                        this.calculateExtrapolatedData(false);
                    } else {
                        console.log("In build extrapolation mom Test123")
                        this.buildExtrapolationMom();
                    }
                }
            }else{
                console.log("Loader 2 Test123")
                    this.setState({ extrapolationLoader: false }, () => {
                        setTimeout(() => {
                            alert("Please fill in the blank actual values or interpolate.")
                        }, 0);
                    });
            }
            }, 0);
        });
    }
    changeNotes(notes) {
        const { nodeDataExtrapolation } = this.state;
        nodeDataExtrapolation.notes = notes;
        this.setState({
            nodeDataExtrapolation
        })
    }
    buildExtrapolationMom() {
        console.log("is valid result start---", this.props.items.isValidError);
        var rangeValue = this.state.rangeValue1;
        let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
        let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
        var movingAveragesData = [];
        var semiAveragesData = [];
        var linearRegressionData = [];
        var tesData = [];
        var arimaData = [];
        var extrapolationDataList = [];
        var momList = [];
        var tableJson = this.state.dataExtrapolation.getJson(null, false);
        var minMonth = this.state.minMonth;
        var count = 1;
        for (var i = 0; i < tableJson.length; i++) {
            var map1 = new Map(Object.entries(tableJson[i]));
            if (moment(this.state.minMonth).format('YYYY-MM') <= moment(map1.get("0")).format('YYYY-MM')) {
                var json = {
                    month: map1.get("0"),
                    amount: map1.get("1"),
                    reportingRate: map1.get("2") != "" ? map1.get("2").toString().replaceAll("%", "") : map1.get("2"),
                    manualChange: map1.get("10").toString().replaceAll(",", ""),
                    adjustedActuals: (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)) != "" ? (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)).toString().replaceAll(",", "") : (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true))
                };
                extrapolationDataList.push(json)
            }
            // (this.state.dataExtrapolation.getValue(`F${parseInt(i) + 1}`, true)).toString().replaceAll(",", "");
            console.log("this.state.dataExtrapolation---", this.state.dataExtrapolation);
            console.log("start value---", this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true));
            console.log("start value updated---", (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)).toString().replaceAll(",", ""));
            var json2 = {
                calculatedValue: this.state.dataExtrapolation.getValue(`L${parseInt(i) + 1}`, true) != "" && this.state.dataExtrapolation.getValue(`L${parseInt(i) + 1}`, true) != null ? (this.state.dataExtrapolation.getValue(`L${parseInt(i) + 1}`, true)).toString().replaceAll(",", "") : 0,
                difference: 0,
                endValue: this.state.dataExtrapolation.getValue(`L${parseInt(i) + 1}`, true) != "" && this.state.dataExtrapolation.getValue(`L${parseInt(i) + 1}`, true) != null ? (this.state.dataExtrapolation.getValue(`L${parseInt(i) + 1}`, true)).toString().replaceAll(",", "") : 0,
                endValueWMC: this.state.dataExtrapolation.getValue(`L${parseInt(i) + 1}`, true) != "" && this.state.dataExtrapolation.getValue(`L${parseInt(i) + 1}`, true) != null ? (this.state.dataExtrapolation.getValue(`L${parseInt(i) + 1}`, true)).toString().replaceAll(",", "") : 0,
                manualChange: this.state.dataExtrapolation.getValue(`K${parseInt(i) + 1}`, true) != "" && this.state.dataExtrapolation.getValue(`K${parseInt(i) + 1}`, true) != null ? (this.state.dataExtrapolation.getValue(`K${parseInt(i) + 1}`, true)).toString().replaceAll(",", "") : null,
                month: map1.get("0"),
                seasonalityPerc: 0,
                startValue: this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true) != "" && this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true) != null ? (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)).toString().replaceAll(",", "") : 0
            };
            momList.push(json2);
            if (moment(this.state.minMonth).format('YYYY-MM') <= moment(map1.get("0")).format('YYYY-MM')) {
                // Moving averages
                var movingAveragesJson = {
                    month: map1.get("0"),
                    amount: map1.get("4") != "" && map1.get("4") != null ? map1.get("4").toString().replaceAll("%", "") : null,
                }
                movingAveragesData.push(movingAveragesJson);
                // Semi averages
                var semiAveragesJson = {
                    month: map1.get("0"),
                    amount: map1.get("5") != "" && map1.get("5") != null ? map1.get("5").toString().replaceAll("%", "") : null,
                }
                semiAveragesData.push(semiAveragesJson);

                if (this.state.linearRegressionData.length > 0) {
                    var linearRegressionJson = {
                        month: map1.get("0"),
                        amount: map1.get("6") != "" && map1.get("6") != null ? map1.get("6").toString().replaceAll("%", "") : null,
                        ci: this.state.linearRegressionData.filter(x => x.month == count)[0].ci
                    }
                    linearRegressionData.push(linearRegressionJson);
                }

                if (this.state.tesData.length > 0) {
                    console.log("result here rama---", map1.get("7") != "" && map1.get("7") != null && map1.get("7") != 'NaN' ? "A" : "B");
                    var tesJson = {
                        month: map1.get("0"),
                        amount: map1.get("7") != "" && map1.get("7") != null && map1.get("7") != 'NaN' ? map1.get("7").toString().replaceAll("%", "") : null,
                        ci: this.state.tesData.filter(x => x.month == count)[0].ci
                    }
                    tesData.push(tesJson);
                }


                if (this.state.arimaData.length > 0) {
                    var arimaJson = {
                        month: map1.get("0"),
                        amount: map1.get("8") != "" && map1.get("8") != null ? map1.get("8").toString().replaceAll("%", "") : null,
                        ci: this.state.arimaData.filter(x => x.month == count)[0].ci
                    }
                    arimaData.push(arimaJson);
                }
                count++;

            }
        }

        const { nodeDataExtrapolation } = this.state;
        nodeDataExtrapolation.extrapolationDataList = extrapolationDataList;
        nodeDataExtrapolation.startDate = moment(startDate).format('YYYY-MM-DD');
        nodeDataExtrapolation.stopDate = moment(stopDate).format('YYYY-MM-DD');
        var nodeDataExtrapolationOptionList = [];
        var filteredExtrapolationMethodList = this.state.filteredExtrapolationMethodList;
        var json;
        for (let i = 0; i < filteredExtrapolationMethodList.length; i++) {
            //Moving averages
            if (filteredExtrapolationMethodList[i].id == 7) {
                var extrapolationOptionDataList = [];
                var optionDataJson = {
                    month: '',
                    amount: ''
                };
                json = {
                    extrapolationMethod: { id: 7 },
                    jsonProperties: {
                        months: this.state.monthsForMovingAverage
                    },
                    extrapolationOptionDataList: movingAveragesData
                }
                // json1 = this.state.extrapolationMethodList.filter(c => c.id == 7)[0];
                nodeDataExtrapolationOptionList.push(json);
            }
            // Semi averages
            if (filteredExtrapolationMethodList[i].id == 6) {
                json = {
                    extrapolationMethod: { id: 6 },
                    jsonProperties: {
                    },
                    extrapolationOptionDataList: semiAveragesData
                }
                nodeDataExtrapolationOptionList.push(json);
            }
            //Linear regression
            if (filteredExtrapolationMethodList[i].id == 5) {
                json = {
                    extrapolationMethod: { id: 5 },
                    jsonProperties: {
                        confidenceLevelIdLinearRegression: this.state.confidenceLevelIdLinearRegression
                    },
                    extrapolationOptionDataList: linearRegressionData
                }
                nodeDataExtrapolationOptionList.push(json);
            }
            //ARIMA
            if (filteredExtrapolationMethodList[i].id == 4) {
                console.log("seasonality for arima---", this.state.seasonality);
                json = {
                    extrapolationMethod: { id: 4 },
                    jsonProperties: {
                        p: this.state.p,
                        d: this.state.d,
                        q: this.state.q,
                        confidenceLevelIdArima: this.state.confidenceLevelIdArima,
                        seasonality: this.state.seasonality
                    },
                    extrapolationOptionDataList: arimaData
                }
                nodeDataExtrapolationOptionList.push(json);
            }
            // TES
            if (filteredExtrapolationMethodList[i].id == 2) {
                json = {
                    extrapolationMethod: { id: 2 },
                    jsonProperties: {
                        confidenceLevel: this.state.confidenceLevelId,
                        // seasonality: this.state.noOfMonthsForASeason,
                        alpha: this.state.alpha,
                        beta: this.state.beta,
                        gamma: this.state.gamma
                    },
                    extrapolationOptionDataList: tesData
                }
                nodeDataExtrapolationOptionList.push(json);
            }
        }
        console.log("Loader 3 Test123")
        this.setState({
            nodeDataExtrapolation,
            nodeDataExtrapolationOptionList,
            extrapolationLoader: false,
            isChanged: false
        }, () => {
            var currentItemConfig = this.props.items.currentItemConfig;
            var mom = momList.filter(m => moment(m.month).format('YYYY-MM') == moment(currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].month).format('YYYY-MM'));
            currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].nodeDataExtrapolation = this.state.nodeDataExtrapolation;
            currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].nodeDataMomList = momList;
            // currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].nodeDataModelingList = [];
            currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].nodeDataExtrapolationOptionList = this.state.nodeDataExtrapolationOptionList;
            // if (currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].dataValue == "" || currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].dataValue == 0) {
            currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].dataValue = mom.length > 0 ? mom[0].calculatedValue : '0';
            currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].calculatedDataValue = mom.length > 0 ? mom[0].calculatedValue : '0';
            // }
            console.log("is valid result ---", this.props.items.isValidError);
            if (!this.props.items.addNodeFlag) {
                this.props.updateState("currentItemConfig", currentItemConfig);
            } else {
                alert("Please fill all the required fields in Node Data Tab");
            }

        });
    }

    touchAllExtrapolation(setTouched, errors, buttonFalg) {
        this.setState({ buttonFalg }, () => {
            console.log("buttonFalg-----?", this.state.buttonFalg)
        })
        setTouched({
            extrapolationMethodId: true,
            noOfMonthsId: true,
            confidenceLevelId: true,
            // seasonalityId: true,
            gammaId: true,
            betaId: true,
            alphaId: true,
            pId: true,
            dId: true,
            qId: true,
            confidenceLevelIdLinearRegression: true,
            confidenceLevelIdArima: true
        }
        )
        this.validateFormExtrapolation(errors)
    }

    validateFormExtrapolation(errors) {
        this.findFirstErrorExtrapolation('userForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstErrorExtrapolation(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }

    checkValidationExtrapolation() {
        console.log("In check validation Test123");
        var valid = true;
        var json = this.state.dataExtrapolation.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.state.dataExtrapolation.getValueFromCoords(1, y);
            if (value != null && value != "") {
                //Population
                var col = ("B").concat(parseInt(y) + 1);
                var reg = JEXCEL_DECIMAL_NO_REGEX_LONG_4_DECIMAL;
                var value = this.el.getValueFromCoords(1, y);
                if (value != "" && !(reg.test(value.toString().replaceAll(",", "")))) {
                    this.state.dataExtrapolation.setStyle(col, "background-color", "transparent");
                    this.state.dataExtrapolation.setStyle(col, "background-color", "yellow");
                    this.state.dataExtrapolation.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                }
                else {
                    this.state.dataExtrapolation.setStyle(col, "background-color", "transparent");
                    this.state.dataExtrapolation.setComments(col, "");
                    var reportingRate = this.state.dataExtrapolation.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "").split("%")[0];
                    var col1 = ("C").concat(parseInt(y) + 1);
                    if (reportingRate == "") {
                        this.state.dataExtrapolation.setStyle(col1, "background-color", "transparent");
                        this.state.dataExtrapolation.setStyle(col1, "background-color", "yellow");
                        this.state.dataExtrapolation.setComments(col1, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else if (reportingRate > 100) {
                        this.state.dataExtrapolation.setStyle(col1, "background-color", "transparent");
                        this.state.dataExtrapolation.setStyle(col1, "background-color", "yellow");
                        this.state.dataExtrapolation.setComments(col1, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    }
                    else if (!(reg.test(reportingRate))) {
                        this.state.dataExtrapolation.setStyle(col1, "background-color", "transparent");
                        this.state.dataExtrapolation.setStyle(col1, "background-color", "yellow");
                        this.state.dataExtrapolation.setComments(col1, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    }
                }
                // Reporting rate
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
                var reg = JEXCEL_DECIMAL_NO_REGEX_LONG_4_DECIMAL;
                console.log("reporting rate value---", value)
                var actualValue = this.state.dataExtrapolation.getValue(`B${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // value.split("%")[0];
                value = value.toString().replaceAll(",", "").split("%")[0];
                if (actualValue != "" && value == "") {
                    this.state.dataExtrapolation.setStyle(col, "background-color", "transparent");
                    this.state.dataExtrapolation.setStyle(col, "background-color", "yellow");
                    this.state.dataExtrapolation.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else if (value > 100) {
                    this.state.dataExtrapolation.setStyle(col, "background-color", "transparent");
                    this.state.dataExtrapolation.setStyle(col, "background-color", "yellow");
                    this.state.dataExtrapolation.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                }
                else if (!(reg.test(value))) {
                    this.state.dataExtrapolation.setStyle(col, "background-color", "transparent");
                    this.state.dataExtrapolation.setStyle(col, "background-color", "yellow");
                    this.state.dataExtrapolation.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                }
                else {
                    this.state.dataExtrapolation.setStyle(col, "background-color", "transparent");
                    this.state.dataExtrapolation.setComments(col, "");
                }
                // Manual Change
                var col = ("K").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(10, y);
                var reg = JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL;
                value = value.toString().replaceAll(",", "");
                if (value != "" && !(reg.test(value))) {
                    this.state.dataExtrapolation.setStyle(col, "background-color", "transparent");
                    this.state.dataExtrapolation.setStyle(col, "background-color", "yellow");
                    this.state.dataExtrapolation.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                }
                else {
                    this.state.dataExtrapolation.setStyle(col, "background-color", "transparent");
                    this.state.dataExtrapolation.setComments(col, "");
                }
            }
        }
        console.log("After check validation Test123", valid);
        return valid;
    }


    extrapolationMethodChange(e) {
        console.log("extrapolation method id---", e.target.value);
        this.state.nodeDataExtrapolation.extrapolationMethod.id = e.target.value;
        this.state.dataExtrapolation.setValueFromCoords(13, 0, e.target.value, true);
        // this.buildJexcel();
        this.setState({ isChanged: true });
    }

    setMonthsForMovingAverage(e) {
        this.setState({
            // loading: true
        })
        var monthsForMovingAverage = e.target.value;
        this.setState({
            monthsForMovingAverage: monthsForMovingAverage,
            isChanged: true,
            dataChanged: true
            // dataChanged: true
        }, () => {
            console.log("monthsForMovingAverage after state update---", this.state.monthsForMovingAverage);
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
            isChanged: true,
            dataChanged: true
            // dataChanged: true
        }, () => {
            // this.buildJxl();
        })
    }

    setBeta(e) {
        var beta = e.target.value;
        this.setState({
            beta: beta,
            isChanged: true,
            dataChanged: true
            // dataChanged: true
        }, () => {
            // this.buildJxl();
        })
    }

    setGamma(e) {
        var gamma = e.target.value;
        this.setState({
            gamma: gamma,
            isChanged: true,
            dataChanged: true
            // dataChanged: true
        }, () => {
            // this.buildJxl();
        })
    }

    setConfidenceLevelId(e) {
        var confidenceLevelId = e.target.value;
        this.setState({
            confidenceLevelId: confidenceLevelId,
            isChanged: true,
            dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }

    setConfidenceLevelIdLinearRegression(e) {
        var confidenceLevelIdLinearRegression = e.target.value;
        this.setState({
            confidenceLevelIdLinearRegression: confidenceLevelIdLinearRegression,
            isChanged: true,
            dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }
    setConfidenceLevelIdArima(e) {
        var confidenceLevelIdArima = e.target.value;
        this.setState({
            confidenceLevelIdArima: confidenceLevelIdArima,
            isChanged: true,
            dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }
    // setSeasonals(e) {
    //     var seasonals = e.target.value;
    //     this.setState({
    //         noOfMonthsForASeason: seasonals,
    //         isChanged: true
    //         // dataChanged: true
    //     }, () => {
    //         // this.buildJxl()
    //     })
    // }

    setPId(e) {
        this.setState({
            p: e.target.value,
            isChanged: true,
            dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }
    setDId(e) {
        this.setState({
            d: e.target.value,
            isChanged: true,
            dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }

    setQId(e) {
        this.setState({
            q: e.target.value,
            isChanged: true,
            dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }


    calculateExtrapolatedData(dataAvailabel) {
        var monthArray = this.state.monthArray;
        var jexcelDataArr = [];
        var inputDataMovingAvg = [];
        var inputDataSemiAverage = [];
        var inputDataLinearRegression = [];
        var inputDataTes = [];
        var inputDataArima = [];
        var resultCount = 0;
        // console.log("my data---",this.props.items.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])
        if (dataAvailabel) {
            var extrapolationDataList = this.state.nodeDataExtrapolation != null ? this.state.nodeDataExtrapolation.extrapolationDataList : [];
            console.log("monthArray check---", monthArray);
            for (var i = 0; i < monthArray.length; i++) {
                var extrapolationDataListData = extrapolationDataList.filter(x => moment(x.month).format('YYYY-MM') == moment(monthArray[i]).format('YYYY-MM'));
                console.log("extrapolationDataListData---", extrapolationDataListData + " month---", monthArray[i]);
                if (extrapolationDataListData.length > 0) {
                    var result = jexcelDataArr.filter(x => x.amount != "" && x.amount != null);
                    resultCount = (extrapolationDataListData[0].amount != "" && extrapolationDataListData[0].amount != null) || result.length > 0 ? resultCount + 1 : resultCount;
                    var json = {
                        month: extrapolationDataListData[0].month,
                        amount: extrapolationDataListData[0].amount,
                        reportingRate: extrapolationDataListData[0].reportingRate,
                        monthNo: resultCount,
                        manualChange: extrapolationDataListData[0].manualChange,
                        adjustedActuals: extrapolationDataListData[0].amount / (extrapolationDataListData[0].reportingRate / 100)
                    }
                } else {
                    var json = {
                        month: monthArray[i],
                        amount: null,
                        reportingRate: 100,
                        monthNo: resultCount + 1,
                        manualChange: null,
                        adjustedActuals: null
                    }
                }
                console.log("my json---", json);
                jexcelDataArr.push(json);
            }
            console.log("after jexcelDataArr---", jexcelDataArr);
        } else {
            var tableJson = this.state.dataExtrapolation.getJson(null, false);
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("10 map---" + map1.get("10"));
                var result = jexcelDataArr.filter(x => x.amount != "");
                resultCount = (map1.get("1") != "" && map1.get("1") != null) || result.length > 0 ? resultCount + 1 : resultCount;
                var json = {
                    month: map1.get("0"),
                    amount: map1.get("1") != "" ? map1.get("1").toString().replaceAll(",", "") : map1.get("1"),
                    reportingRate: map1.get("2") != "" ? map1.get("2").toString().replaceAll("%", "") : map1.get("2"),
                    monthNo: resultCount,
                    manualChange: map1.get("10").toString().replaceAll(",", ""),
                    adjustedActuals: (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)) != "" ? (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)).toString().replaceAll(",", "") : (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true))
                }
                jexcelDataArr.push(json);
            }

            console.log("before jexcelDataArr---", jexcelDataArr);
        }
        const { nodeDataExtrapolation } = this.state;
        console.log("nodeDataExtrapolation check---", nodeDataExtrapolation);
        nodeDataExtrapolation.extrapolationDataList = jexcelDataArr;
        console.log("jexcel data final data available---", jexcelDataArr);

        this.setState({ jexcelDataArr, nodeDataExtrapolation, isChanged: true, noDataMessage: "" }, () => {
            // setTimeout(() => {
            console.log("tableJson for extrapolation---", this.state.jexcelDataArr);
            if (jexcelDataArr.length > 0) {
                console.log("jexcelDataArr with month no---->", jexcelDataArr)

                var valList = jexcelDataArr.filter(c => c.amount != "" && c.amount != null)
                    .sort(function (a, b) {
                        return new Date(a.month) - new Date(b.month);
                    });
                console.log("valList---->", valList)
                this.setState({
                    minMonth: valList[0].month,
                    maxMonth: valList[valList.length - 1].month
                }, () => {
                    console.log("minMonth hehehe yo---->", this.state.minMonth)
                    console.log("maxMonth hehehe yo---->", this.state.maxMonth)


                    for (let i = 0; i < jexcelDataArr.length; i++) {
                        if (moment(valList[0].month).format("YYYY-MM") <= moment(jexcelDataArr[i].month).format("YYYY-MM") && jexcelDataArr[i].amount != "" && jexcelDataArr[i].amount != null) {
                            inputDataMovingAvg.push({ "month": inputDataMovingAvg.length + 1, "actual": jexcelDataArr[i].adjustedActuals != "" ? Number(jexcelDataArr[i].adjustedActuals) : null, "forecast": null })
                            // console.log("inputDataSemiAverage 1--->>>", jexcelDataArr[i]);
                            // console.log("inputDataSemiAverage 2--->>>", inputDataSemiAverage.length);
                            inputDataSemiAverage.push({ "month": inputDataSemiAverage.length + 1, "actual": jexcelDataArr[i].adjustedActuals != "" ? Number(jexcelDataArr[i].adjustedActuals) : null, "forecast": null })
                            // var json = { "month": inputDataSemiAverage.length + 1, "actual": jexcelDataArr[i].adjustedActuals != "" ? Number(jexcelDataArr[i].adjustedActuals) : null, "forecast": null };
                            // console.log("inputDataSemiAverage 4--->>>", json);
                            // console.log("inputDataSemiAverage 5 before--->>>", inputDataSemiAverage);
                            // inputDataSemiAverage.push(json);
                            console.log("inputDataSemiAverage 6 after--->>>", inputDataSemiAverage);
                            inputDataLinearRegression.push({ "month": inputDataLinearRegression.length + 1, "actual": jexcelDataArr[i].adjustedActuals != "" ? Number(jexcelDataArr[i].adjustedActuals) : null, "forecast": null })
                            // console.log("inputDataSemiAverage 7--->>>", inputDataLinearRegression);
                            inputDataTes.push({ "month": inputDataTes.length + 1, "actual": jexcelDataArr[i].adjustedActuals != "" ? Number(jexcelDataArr[i].adjustedActuals) : null, "forecast": null })
                            console.log("inputDataSemiAverage 8--->>>", inputDataTes)
                            inputDataArima.push({ "month": inputDataArima.length + 1, "actual": jexcelDataArr[i].adjustedActuals != "" ? Number(jexcelDataArr[i].adjustedActuals) : null, "forecast": null })
                            console.log("inputDataArima 8--->>>", inputDataArima)
                        }
                    }
                    if (!dataAvailabel) {
                        console.log("inputDataMovingAvg--->>>", inputDataMovingAvg)
                        var data = jexcelDataArr.filter(c => c.amount != "" && c.amount != null)
                            .sort(function (a, b) {
                                return new Date(a.month) - new Date(b.month);
                            });
                        console.log("jexcelDataArr---%%%", jexcelDataArr);
                        var lastMonth = data[data.length - 1].month;
                        var noOfMonthsForProjection = moment(new Date(this.props.items.forecastStopDate)).diff(new Date(lastMonth), 'months', true)
                        console.log("noOfMonthsForProjection", noOfMonthsForProjection);
                        if (this.state.semiAvgId) {
                            console.log("inputDataSemiAverage---", inputDataSemiAverage);
                            calculateSemiAverages(JSON.parse(JSON.stringify(inputDataSemiAverage)), Math.trunc(noOfMonthsForProjection), this);
                        } else {
                            this.setState({
                                semiAvgData: [],
                                semiAvgError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" }
                            })
                        }
                        if (this.state.movingAvgId) {
                            calculateMovingAvg(JSON.parse(JSON.stringify(inputDataMovingAvg)), this.state.monthsForMovingAverage, Math.trunc(noOfMonthsForProjection), this);
                        } else {
                            this.setState({
                                movingAvgData: [],
                                movingAvgError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" }
                            })
                        }

                        if (this.state.linearRegressionId) {
                            calculateLinearRegression(JSON.parse(JSON.stringify(inputDataLinearRegression)), this.state.confidenceLevelIdLinearRegression, Math.trunc(noOfMonthsForProjection), this, true);
                        } else {
                            this.setState({
                                linearRegressionData: [],
                                linearRegressionError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" }
                            })
                        }
                        if (this.state.smoothingId) {
                            console.log("tes inside if")
                            calculateTES(JSON.parse(JSON.stringify(inputDataTes)), this.state.alpha, this.state.beta, this.state.gamma, this.state.confidenceLevelId, Math.trunc(noOfMonthsForProjection), this, jexcelDataArr[0].month, 1);
                        } else {
                            this.setState({
                                tesData: [],
                                ci: 0,
                                tesError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" }
                            })
                        }
                        if (this.state.arimaId) {
                            try {
                                calculateArima(JSON.parse(JSON.stringify(inputDataArima)), this.state.p, this.state.d, this.state.q, this.state.confidenceLevelIdArima, Math.trunc(noOfMonthsForProjection), this, jexcelDataArr[0].month, 1, this.state.seasonality);
                            } catch (error) {
                                this.setState({
                                    noDataMessage: i18n.t('static.extrapolation.errorOccured'),
                                    arimaData: [],
                                    arimaError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" }
                                })
                            }

                        } else {
                            this.setState({
                                arimaData: [],
                                arimaError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
                                noDataMessage: ""
                            })
                        }
                    } else {
                        console.log("jexcel build else called")
                        console.log("this.state.semiAvgData--->>>", this.state.semiAvgData)
                        if (this.state.semiAvgId) {
                            calculateError(this.state.semiAvgData, "semiAvgError", this);
                        }
                        if (this.state.movingAvgId) {
                            calculateError(this.state.movingAvgData, "movingAvgError", this);
                        }
                        if (this.state.linearRegressionId) {
                            calculateError(this.state.linearRegressionData, "linearRegressionError", this);
                        }
                        if (this.state.smoothingId) {
                            if (this.state.tesData.length > 0) {
                                calculateError(this.state.tesData, "tesError", this);
                            } else {
                                this.setState({
                                    tesData: [],
                                    tesError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" }
                                });
                            }
                        }
                        if (this.state.arimaId) {
                            if (this.state.arimaData.length > 0) {
                                calculateError(this.state.arimaData, "arimaError", this);
                            }
                            else {
                                this.setState({
                                    arimaData: [],
                                    arimaError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
                                    noDataMessage: ""
                                });
                            }
                        }
                        // this.buildJexcel();
                    }
                });

            } else {
                console.log("Loader 4 Test123")
                this.setState({ extrapolationLoader: false });
            }
            // }, 0);
        });
        // this.buildJexcel();

    }

    interpolate() {
        this.setState({ extrapolationLoader: true, isChanged: true, noDataMessage: "" }, () => {
            setTimeout(() => {
                var monthArray = this.state.monthArray;
                var jexcelDataArr = [];
                var interpolatedData = [];
                // var inputDataMovingAvg = [];
                // var inputDataSemiAverage = [];
                // var inputDataLinearRegression = [];
                // var inputDataTes = [];
                var tableJson = this.state.dataExtrapolation.getJson(null, false);
                console.log("tableJson length---", tableJson.length);
                console.log("tableJson---", tableJson);
                var resultCount = 0;
                for (var i = 0; i < tableJson.length; i++) {
                    var map1 = new Map(Object.entries(tableJson[i]));
                    console.log("10 map---" + map1.get("10"));
                    var result = jexcelDataArr.filter(x => x.amount !== "");
                    resultCount = (map1.get("1") !== "" || result.length > 0) ? resultCount + 1 : resultCount;
                    var json = {
                        month: map1.get("0"),
                        amount: map1.get("1") !== "" ? map1.get("1").toString().replaceAll(",", "") : map1.get("1"),
                        reportingRate: map1.get("2") != "" ? map1.get("2").toString().replaceAll("%", "") : map1.get("2"),
                        monthNo: resultCount,
                        manualChange: map1.get("10").toString().replaceAll(",", ""),
                        adjustedActuals: (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)) != "" ? (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true)).toString().replaceAll(",", "") : (this.state.dataExtrapolation.getValue(`D${parseInt(i) + 1}`, true))
                    }
                    jexcelDataArr.push(json);
                }
                this.setState({ jexcelDataArr }, () => {
                    var interpolatedMonths = [];
                    for (var j = 0; j < monthArray.length; j++) {
                        var dataArr = jexcelDataArr.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))[0];
                        console.log(moment(monthArray[j]).format("YYYY-MM") + " " + "dataArr---", dataArr);
                        if (dataArr.amount == "") {
                            var startValList = jexcelDataArr.filter(c => moment(c.month).format("YYYY-MM") < moment(monthArray[j]).format("YYYY-MM") && c.amount != "")
                                .sort(function (a, b) {
                                    return new Date(a.month) - new Date(b.month);
                                });
                            console.log(moment(monthArray[j]).format("YYYY-MM") + " " + "startValList---", startValList);
                            var endValList = jexcelDataArr.filter(c => moment(c.month).format("YYYY-MM") > moment(monthArray[j]).format("YYYY-MM") && c.amount != "")
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
                                interpolatedMonths.push({ month: moment(monthArray[j]).format("YYYY-MM") });
                                const monthDifference = Math.round(Number(moment(new Date(monthArray[j])).diff(new Date(startMonthVal), 'months', true)));
                                const monthDiff = Math.round(Number(moment(new Date(endMonthVal)).diff(new Date(startMonthVal), 'months', true)));
                                var missingActualData = Number(startVal) + (monthDifference * ((Number(endVal) - Number(startVal)) / monthDiff));
                                console.log("month--->>>", monthArray[j]);
                                console.log(moment(monthArray[j]).format("YYYY-MM") + " " + "missingActualData---", missingActualData);
                                const index = jexcelDataArr.findIndex(c => c.month == monthArray[j]);
                                var amount = missingActualData % 1 != 0 ? missingActualData.toFixed(4) : missingActualData;
                                var json = {
                                    month: monthArray[j],
                                    amount: amount,
                                    reportingRate: dataArr.reportingRate,
                                    manualChange: dataArr.manualChange,
                                    adjustedActuals: amount / (dataArr.reportingRate / 100)
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
                    const { nodeDataExtrapolation } = this.state;
                    nodeDataExtrapolation.extrapolationDataList = jexcelDataArr;
                    var valList = jexcelDataArr.filter(c => c.amount != "")
                        .sort(function (a, b) {
                            return new Date(a.month) - new Date(b.month);
                        });
                        if (interpolatedMonths.length == 0) {
                            window.alert(i18n.t('static.consumptionDataEntryAndAdjustment.nothingToInterpolate'));
                          }
                    this.setState({
                        minMonth: valList[0].month,
                        nodeDataExtrapolation,
                        dataChanged: true
                    }, () => { this.buildJexcel() });
                });

            }, 0);
        })
    }

    updateState(parameterName, value) {
        console.log("#######" + parameterName + "---", value)
        this.setState({
            [parameterName]: value,
            dataChanged: false
        }, () => {
            setTimeout(() => {
                console.log("%%%" + parameterName + "---", value)
                this.buildJexcel();
            }, 0);
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
        //     this.getExtrapolationMethodList();
    }
    resetExtrapolation(){
        var startDate1 = moment(this.props.items.forecastStartDate).startOf('month').subtract(23, 'months').startOf('month').utc().format("YYYY-MM-DD");
        var endDate1 = moment(this.props.items.forecastStartDate).startOf('month').utc().format("YYYY-MM-DD");
        this.setState({
            extrapolationLoader: true,
            rangeValue1: { from: { year: new Date(startDate1).getFullYear(), month: new Date(startDate1).getMonth() + 1 }, to: { year: new Date(endDate1).getFullYear(), month: new Date(endDate1).getMonth() + 1 } },
            seasonality: 0,
            dataChanged: false,
            buttonFalg: 1,
            showJexcelData: false,
            maxMonth: '',
            extrapolationLoader: true,
            forecastNestedHeader: '5',
            filteredExtrapolationMethodList: [],
            minMonth: '',
            monthsForMovingAverage: 5,
            confidenceLevelId: 0.95,
            confidenceLevelIdLinearRegression: 0.95,
            confidenceLevelIdArima: 0.95,
            alpha: 0.2,
            beta: 0.2,
            gamma: 0.2,
            p: 0,
            d: 1,
            q: 1,
            movingAvgId: true,
            semiAvgId: true,
            linearRegressionId: true,
            smoothingId: true,
            arimaId: true,
            jexcelDataArr: [],
            nodeDataExtrapolationOptionList: [],
            movingAvgData: [],
            semiAvgData: [],
            linearRegressionData: [],
            tesData: [],
            arimaData: [],
            movingAvgError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            semiAvgError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            linearRegressionError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            tesError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            arimaError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            noDataMessage: "",
        }, () => {
    this.getExtrapolationMethodList();        
    })
}

    getExtrapolationMethodList() {
        console.log("### inside did mount")
        console.log("Loader 6 Test123")
        this.setState({
            extrapolationLoader: true
        }, () => {
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
                        extrapolationMethodList: myResult.filter(x => x.active == true),
                        changed: 1
                    }, () => {
                        var month = this.props.items.currentScenario.month;
                        let forecastStopDate = this.props.items.forecastStopDate;
                        // let rangeStopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();

                        // var forecastStartDate = this.props.items.forecastStartDate;
                        // var forecastStopDate = this.props.items.forecastStopDate;
                        // var minStartDate = month;
                        // if (moment(month).format("YYYY-MM") > moment(forecastStartDate).format("YYYY-MM")) {
                        //     minStartDate = forecastStartDate;
                        // }
                        var tempStartDate = moment(month).subtract(23, 'months').format("YYYY-MM");
                        var tempStopDate = moment(month).subtract(1, 'months').format("YYYY-MM");
                        var rangeValue1;
                        // var rangeValue = this.state.rangeValue1;
                        // monthArray.push('2019-01-01');

                        // for (var m = 0; curDate1 < moment(forecastStopDate).format("YYYY-MM-DD"); m++) {
                        //     console.log("curDate1---", curDate1 + " stop date---", moment(forecastStopDate).format("YYYY-MM-DD") + " result---", curDate1 < moment(forecastStopDate).format("YYYY-MM-DD"));
                        //     console.log("");
                        //     curDate1 = moment(minStartDate).add(m, 'months').format("YYYY-MM-DD");
                        //     console.log("curDate1 only---", curDate1);
                        //     if (moment(forecastStopDate).format("YYYY-MM-DD") >= curDate1) {
                        //         monthArray.push(curDate1)
                        //     }

                        // }


                        console.log("data@@@@@@@@@---", this.props.items.currentScenario.hasOwnProperty('nodeDataExtrapolation') == false);
                        if (this.props.items.currentScenario.hasOwnProperty('nodeDataExtrapolation') == false || this.props.items.currentScenario.nodeDataExtrapolation == null || this.props.items.currentScenario.nodeDataExtrapolation == undefined || this.props.items.currentScenario.nodeDataExtrapolation == "") {
                            var nodeDataExtrapolation = {
                                extrapolationMethod: { id: '' },
                                notes: '',
                                // reportingRate
                                // month
                                // amount
                                extrapolationDataList: []
                            }
                            console.log("inside temp data if");
                            console.log("tempStartDate---", tempStartDate);
                            console.log("tempStopDate", tempStopDate);

                            rangeValue1 = { from: { year: Number(moment(tempStartDate).startOf('month').format("YYYY")), month: Number(moment(tempStartDate).startOf('month').format("M")) }, to: { year: Number(moment(tempStopDate).startOf('month').format("YYYY")), month: Number(moment(tempStopDate).startOf('month').format("M")) } };
                            this.setState({ nodeDataExtrapolation },
                                () => {

                                })
                        } else {
                            console.log("actual start date---", this.props.items.currentScenario.nodeDataExtrapolation);
                            rangeValue1 = { from: { year: Number(moment(this.props.items.currentScenario.nodeDataExtrapolation.startDate).startOf('month').format("YYYY")), month: Number(moment(this.props.items.currentScenario.nodeDataExtrapolation.startDate).startOf('month').format("M")) }, to: { year: Number(moment(this.props.items.currentScenario.nodeDataExtrapolation.stopDate).startOf('month').format("YYYY")), month: Number(moment(this.props.items.currentScenario.nodeDataExtrapolation.stopDate).startOf('month').format("M")) } };
                        }
                        console.log("rangeValue123---", rangeValue1);
                        let stopDate;
                        let startDate = rangeValue1.from.year + '-' + rangeValue1.from.month + '-01';
                        let rangeStopDate = rangeValue1.to.year + '-' + rangeValue1.to.month + '-' + new Date(rangeValue1.to.year, rangeValue1.to.month, 0).getDate();
                        if (moment(forecastStopDate).format('YYYY-MM-DD') > moment(rangeStopDate).format('YYYY-MM-DD')) {
                            stopDate = forecastStopDate;
                        } else {
                            stopDate = rangeStopDate;
                        }

                        var minStartDate = startDate;
                        // console.log("month---", month);
                        // console.log("forecastStartDate---", forecastStartDate);
                        // console.log("forecastStopDate---", forecastStopDate);
                        console.log("minStartDate---", minStartDate);
                        var monthArray = [];
                        var curDate1 = minStartDate;

                        for (var m = 0; curDate1 < moment(stopDate).format("YYYY-MM-DD"); m++) {
                            console.log("curDate1---", curDate1 + " stop date---", moment(stopDate).format("YYYY-MM-DD") + " result---", curDate1 < moment(stopDate).format("YYYY-MM-DD"));
                            console.log("");
                            curDate1 = moment(minStartDate).add(m, 'months').format("YYYY-MM-DD");
                            console.log("curDate1 only---", curDate1);
                            if (moment(stopDate).format("YYYY-MM-DD") >= curDate1) {
                                monthArray.push(curDate1)
                            }

                        }
                        this.setState({ monthArray }, () => {
                            this.getDateDifference();
                        });
                        // monthArray.push('2025-01-01');
                        console.log("monthArray---", monthArray);

                        console.log("### inside did mount current---", this.props.items.currentScenario)
                        if (this.props.items.currentScenario.nodeDataExtrapolationOptionList == null || this.props.items.currentScenario.nodeDataExtrapolationOptionList.length == 0) {
                            console.log("### inside did mount if")
                            console.log("Loader 7 Test123")
                            this.setState({ extrapolationLoader: false, forecastNestedHeader: 5, filteredExtrapolationMethodList: JSON.parse(JSON.stringify(this.state.extrapolationMethodList)) }, () => {
                                console.log("### inside did mount if state update")
                                this.buildJexcel();
                            })

                        } else {
                            console.log("### inside did mount else")
                            var filteredExtrapolationMethodList = [];
                            var nodeDataExtrapolation = this.props.items.currentScenario.nodeDataExtrapolation;
                            var extrapolationDataList = nodeDataExtrapolation.extrapolationDataList;
                            var nodeDataExtrapolationOptionList = this.props.items.currentScenario.nodeDataExtrapolationOptionList;
                            console.log("nodeDataExtrapolationOptionList----", nodeDataExtrapolationOptionList)
                            console.log("nodeDataExtrapolation----", nodeDataExtrapolation)
                            var movingAvgId = false;
                            var semiAvgId = false;
                            var linearRegressionId = false;
                            var smoothingId = false;
                            var arimaId = false;
                            var monthsForMovingAverage = this.state.monthsForMovingAverage;
                            var confidenceLevelId = this.state.confidenceLevelId;
                            var confidenceLevelIdLinearRegression = this.state.confidenceLevelIdLinearRegression;
                            var confidenceLevelIdArima = this.state.confidenceLevelIdArima;
                            // var noOfMonthsForASeason = this.state.noOfMonthsForASeason;
                            var alpha = this.state.alpha;
                            var beta = this.state.beta;
                            var gamma = this.state.gamma;
                            var p = this.state.p;
                            var d = this.state.d;
                            var q = this.state.q;
                            var seasonality = this.state.seasonality;
                            var movingAvgData = [];
                            var semiAvgData = [];
                            var arimaData = [];
                            var tesData = [];
                            var linearRegressionData = [];
                            var json;

                            for (let i = 0; i < nodeDataExtrapolationOptionList.length; i++) {
                                var id = nodeDataExtrapolationOptionList[i].extrapolationMethod.id;
                                console.log("this.state.extrapolationMethodList---", this.state.extrapolationMethodList);
                                var methodData = this.state.extrapolationMethodList.filter(x => x.id == id);
                                if (methodData.length > 0) {
                                    filteredExtrapolationMethodList.push(methodData[0]);
                                }
                                if (id == 7) {
                                    movingAvgId = true;
                                    console.log("nodeDataExtrapolationOptionList[i] inside ---", nodeDataExtrapolationOptionList[i])
                                    monthsForMovingAverage = nodeDataExtrapolationOptionList[i].jsonProperties.months;
                                    console.log("monthsForMovingAverage from json properties---", monthsForMovingAverage)
                                    var movingAvgDataTemp = JSON.parse(JSON.stringify(nodeDataExtrapolationOptionList[i].extrapolationOptionDataList));
                                    console.log("movingAvgDataTemp---", nodeDataExtrapolationOptionList[i].extrapolationOptionDataList)
                                    if (movingAvgDataTemp.length > 0) {
                                        for (let i = 0; i < movingAvgDataTemp.length; i++) {
                                            console.log("i value for ma---", i);
                                            var mvData = extrapolationDataList.filter(x => moment(x.month).format('YYYY-MM') == moment(movingAvgDataTemp[i].month).format('YYYY-MM'));
                                            json = {
                                                month: parseInt(i + 1),
                                                actual: mvData.length > 0 ? mvData[0].amount != "" ? parseFloat(mvData[0].amount) : null : null,
                                                forecast: movingAvgDataTemp[i].amount == null || movingAvgDataTemp[i].amount == "" ? null : parseFloat(movingAvgDataTemp[i].amount)
                                            }
                                            movingAvgData.push(json);
                                        }
                                        console.log("movingAvgData after temp---", movingAvgData);
                                    }
                                } else if (id == 6) {
                                    semiAvgId = true;
                                    var semiAvgDataTemp = JSON.parse(JSON.stringify(nodeDataExtrapolationOptionList[i].extrapolationOptionDataList));
                                    if (semiAvgDataTemp.length > 0) {
                                        for (let i = 0; i < semiAvgDataTemp.length; i++) {
                                            // console
                                            var saData = extrapolationDataList.filter(x => moment(x.month).format('YYYY-MM') == moment(semiAvgDataTemp[i].month).format('YYYY-MM'));
                                            json = {
                                                month: i + 1,
                                                actual: saData.length > 0 ? saData[0].amount != "" ? parseFloat(saData[0].amount) : null : null,
                                                forecast: semiAvgDataTemp[i].amount == null || semiAvgDataTemp[i].amount == "" ? null : parseFloat(semiAvgDataTemp[i].amount)
                                            }
                                            semiAvgData.push(json);
                                        }
                                    }
                                } else if (id == 5) {
                                    linearRegressionId = true;
                                    confidenceLevelIdLinearRegression = nodeDataExtrapolationOptionList[i].jsonProperties.confidenceLevelIdLinearRegression;
                                    var linearRegressionDataTemp = JSON.parse(JSON.stringify(nodeDataExtrapolationOptionList[i].extrapolationOptionDataList));
                                    if (linearRegressionDataTemp.length > 0) {
                                        for (let i = 0; i < linearRegressionDataTemp.length; i++) {
                                            var lrData = extrapolationDataList.filter(x => moment(x.month).format('YYYY-MM') == moment(linearRegressionDataTemp[i].month).format('YYYY-MM'));
                                            json = {
                                                month: i + 1,
                                                actual: lrData.length > 0 ? lrData[0].amount != null && lrData[0].amount != "" ? parseFloat(lrData[0].amount) : null : null,
                                                forecast: linearRegressionDataTemp[i].amount == null || linearRegressionDataTemp[i].amount == "" ? null : parseFloat(linearRegressionDataTemp[i].amount),
                                                ci: linearRegressionDataTemp[i].ci != null && linearRegressionDataTemp[i].ci != "" ? parseFloat(linearRegressionDataTemp[i].ci) : null
                                            }
                                            linearRegressionData.push(json);
                                        }
                                        console.log("linearRegressionData on load---", linearRegressionData);
                                    }
                                }
                                else if (id == 4) {
                                    p = nodeDataExtrapolationOptionList[i].jsonProperties.p;
                                    d = nodeDataExtrapolationOptionList[i].jsonProperties.d;
                                    q = nodeDataExtrapolationOptionList[i].jsonProperties.q;
                                    confidenceLevelIdArima = nodeDataExtrapolationOptionList[i].jsonProperties.confidenceLevelIdArima;
                                    seasonality = nodeDataExtrapolationOptionList[i].jsonProperties.seasonality;
                                    console.log("seasonality for arima on load---", seasonality);
                                    arimaId = true;
                                    var arimaDataTemp = JSON.parse(JSON.stringify(nodeDataExtrapolationOptionList[i].extrapolationOptionDataList));
                                    if (arimaDataTemp.length > 0) {
                                        for (let i = 0; i < arimaDataTemp.length; i++) {
                                            var arData = extrapolationDataList.filter(x => moment(x.month).format('YYYY-MM') == moment(arimaDataTemp[i].month).format('YYYY-MM'));
                                            json = {
                                                month: i + 1,
                                                actual: arData.length > 0 ? arData[0].amount != null && arData[0].amount != "" ? parseFloat(arData[0].amount) : null : null,
                                                forecast: arimaDataTemp[i].amount == null || arimaDataTemp[i].amount == "" ? null : parseFloat(arimaDataTemp[i].amount),
                                                ci: arimaDataTemp[i].ci != null && arimaDataTemp[i].ci != "" ? parseFloat(arimaDataTemp[i].ci) : null
                                            }
                                            arimaData.push(json);
                                        }
                                    }
                                }
                                else if (id == 2) {
                                    confidenceLevelId = nodeDataExtrapolationOptionList[i].jsonProperties.confidenceLevel;
                                    // noOfMonthsForASeason = nodeDataExtrapolationOptionList[i].jsonProperties.seasonality;
                                    alpha = nodeDataExtrapolationOptionList[i].jsonProperties.alpha;
                                    beta = nodeDataExtrapolationOptionList[i].jsonProperties.beta;
                                    gamma = nodeDataExtrapolationOptionList[i].jsonProperties.gamma;
                                    smoothingId = true;
                                    var tesDataTemp = JSON.parse(JSON.stringify(nodeDataExtrapolationOptionList[i].extrapolationOptionDataList));
                                    console.log("tesDataTemp---", tesDataTemp);
                                    if (tesDataTemp.length > 0) {
                                        for (let i = 0; i < tesDataTemp.length; i++) {
                                            var tsData = extrapolationDataList.filter(x => moment(x.month).format('YYYY-MM') == moment(tesDataTemp[i].month).format('YYYY-MM'));
                                            console.log("tesDataTemp[i].amount---", tesDataTemp[i].amount);
                                            json = {
                                                month: i + 1,
                                                actual: tsData.length > 0 ? tsData[0].amount != null && tsData[0].amount != "" ? parseFloat(tsData[0].amount) : null : null,
                                                forecast: tesDataTemp[i].amount == null || tesDataTemp[i].amount == "" ? null : parseFloat(tesDataTemp[i].amount),
                                                ci: tesDataTemp[i].ci != null && tesDataTemp[i].ci != "" ? parseFloat(tesDataTemp[i].ci) : null
                                            }
                                            tesData.push(json);
                                        }
                                    }
                                    console.log("tesData---", tesData);
                                }

                            }
                            console.log("filteredExtrapolationMethodList---", filteredExtrapolationMethodList)
                            filteredExtrapolationMethodList = filteredExtrapolationMethodList.length > 0 && filteredExtrapolationMethodList.sort((a, b) => {
                                var itemLabelA = a.sortOrder; // ignore upper and lowercase
                                var itemLabelB = b.sortOrder; // ignore upper and lowercase                   
                                return itemLabelA > itemLabelB ? 1 : -1;
                            });
                            this.setState({
                                nodeDataExtrapolation, p, d, q,
                                confidenceLevelId, confidenceLevelIdLinearRegression,
                                confidenceLevelIdArima, alpha, beta, gamma, movingAvgId,
                                semiAvgId, linearRegressionId, smoothingId, arimaId,
                                filteredExtrapolationMethodList, forecastNestedHeader: filteredExtrapolationMethodList.length,
                                nodeDataExtrapolationOptionList, movingAvgId, monthsForMovingAverage, seasonality,
                                movingAvgData, semiAvgData, linearRegressionData, tesData, arimaData,rangeValue1
                                // extrapolationLoader: false
                            }, () => {
                                console.log("obj------>>>", this.state.nodeDataExtrapolation);
                                console.log("mv data hehehe------>>>", this.state.movingAvgData);
                                this.calculateExtrapolatedData(true);
                            })
                            // this.setState({ filteredExtrapolationMethodList, forecastNestedHeader: filteredExtrapolationMethodList.length })

                        }
                        // setTimeout(() => {confidenceLevelIdLinearRegression,
                        //     this.buildJexcel();
                        // }, 0);

                        // var changed = 0;
                        // if (this.state.changed == 1) {
                        // } else {
                        //     this.setSa
                        //     changed = 0;
                        // }
                    })
                }.bind(this);
            }.bind(this)
        })
    }

    buildJexcel() {
        console.log("jexcel called");
        console.log("min month check---", this.state.minMonth);
        let dataArray = [];
        let data = [];
        var monthArray = this.state.monthArray;
        console.log("monthArray 1234567---", monthArray);
        let count = 0;
        let count1 = '';
        for (var j = 0; j < monthArray.length; j++) {
            var cellData = this.state.nodeDataExtrapolation.extrapolationDataList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))[0];
            data = [];
            data[0] = monthArray[j]
            data[1] = cellData != null && cellData != "" ? cellData.amount : (moment(monthArray[j]).isSame(this.props.items.currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].month) ? this.props.items.currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].calculatedDataValue : "");
            data[2] = cellData != null && cellData != "" ? cellData.reportingRate : 100
            // data[3] = `=IF(B${parseInt(j) + 1} != "",IF(B${parseInt(j) + 1} == 0,'0',ROUND((B${parseInt(j) + 1}/(C${parseInt(j) + 1}/100)),4)),'')`
            var adjustedActuals;
            if (data[1] === '') {
                adjustedActuals = '';
            } else if (data[1] == 0) {
                adjustedActuals = 0;
            } else {
                adjustedActuals = `=IF(ISBLANK(B${parseInt(j) + 1}),'',IF(B${parseInt(j) + 1} == 0,0,ROUND((B${parseInt(j) + 1}/(C${parseInt(j) + 1}/100)),4)))`
            }
            data[3] = adjustedActuals

            count1 = moment(this.state.minMonth).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM") ? "0" : moment(this.state.minMonth).format("YYYY-MM") < moment(monthArray[j]).format("YYYY-MM") ? count1 : '';
            console.log("mv data hehehe 2------>>>", this.state.movingAvgData);
            console.log("minMonth hehehe semiAvgData---", this.state.semiAvgData);
            console.log("count 1 hehehe---", count1);
            console.log("final hehehe---", this.state.movingAvgData.length > 0 && count1 != '' ? this.state.movingAvgData[count1] != null ? "A" : 'B' : 'C');
            data[4] = this.state.movingAvgData.length > 0 && count1 != '' ? this.state.movingAvgData[count1] != null && this.state.movingAvgData[count1].forecast != null ? parseFloat(this.state.movingAvgData[count1].forecast).toFixed(4) : '' : ''
            data[5] = this.state.semiAvgData.length > 0 && count1 != '' && this.state.semiAvgData[count1] != null && this.state.semiAvgData[count1].forecast != null ? parseFloat(this.state.semiAvgData[count1].forecast).toFixed(4) : ''
            data[6] = this.state.linearRegressionData.length > 0 && count1 != '' && this.state.linearRegressionData[count1] != null && this.state.linearRegressionData[count1].forecast != null ? parseFloat(this.state.linearRegressionData[count1].forecast).toFixed(4) : ''
            data[7] = this.state.tesData.length > 0 && count1 != '' && this.state.tesData[count1] != null && this.state.tesData[count1].forecast != null ? this.state.tesData[count1].forecast : ''
            data[8] = this.state.arimaData.length > 0 && count1 != '' && this.state.arimaData[count1] != null && this.state.arimaData[count1].forecast != null ? this.state.arimaData[count1].forecast : ''

            data[9] = `=IF(ISBLANK(D${parseInt(j) + 1}),IF(N1 == 4,I${parseInt(j) + 1},IF(N1 == 2,H${parseInt(j) + 1},IF(N1 == 7,E${parseInt(j) + 1},IF(N1==5,G${parseInt(j) + 1},IF(N1 == 6,F${parseInt(j) + 1},''))))),ROUND(D${parseInt(j) + 1},4))` // J
            data[10] = cellData != null && cellData != "" ? cellData.manualChange : ""
            // data[11] = `=IF(M1 == true,IF(J${parseInt(j)} + K${parseInt(j)} == "",'',ROUND((J${parseInt(j + 1)} + K${parseInt(j + 1)})-(J${parseInt(j)} + K${parseInt(j)})+(J${parseInt(j + 1)} + K${parseInt(j + 1)}),4)),IF(J${parseInt(j) + 1} + K${parseInt(j) + 1} == "",'',ROUND(J${parseInt(j) + 1} + K${parseInt(j) + 1},4)))`
            // data[11] = `=IF(M1 == true,IF(J${parseInt(j)} + K${parseInt(j)} == "",'',ROUND((J${parseInt(j + 1)} + K${parseInt(j + 1)})-(J${parseInt(j)} + K${parseInt(j)})+(J${parseInt(j + 1)} + K${parseInt(j + 1)}),4)),IF(J${parseInt(j) + 1} + K${parseInt(j) + 1} == "",'',ROUND(J${parseInt(j) + 1} + K${parseInt(j) + 1},4)))`
            data[11] = `=IF(M1 == 1,ROUND((J${parseInt(j + 1)} + SUM(K1:K${parseInt(j) + 1})),4),ROUND((J${parseInt(j + 1)} + K${parseInt(j + 1)}),4))`
            data[12] = this.props.items.currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].manualChangesEffectFuture
            data[13] = this.state.nodeDataExtrapolation.extrapolationMethod.id
            //TES lower
            // data[14] = this.state.tesData.length > 0 && this.state.tesData[count1] != null ? this.state.tesData[count1].forecast - this.state.tesData[count1].CI : ''
            // console.log("tes lower calculations---", this.state.tesData[count1]);
            data[14] = this.state.tesData.length > 0 && count1 != '' && this.state.tesData[count1] != null ? this.state.tesData[count1].forecast != null ? this.state.tesData[count1].ci != null ? this.state.tesData[count1].forecast - this.state.tesData[count1].ci : this.state.tesData[count1].forecast : '' : ''
            //TES Upper
            data[15] = this.state.tesData.length > 0 && count1 != '' && this.state.tesData[count1] != null ? this.state.tesData[count1].forecast != null ? this.state.tesData[count1].ci != null ? this.state.tesData[count1].forecast + this.state.tesData[count1].ci : this.state.tesData[count1].forecast : '' : ''
            //Arima lower
            data[16] = this.state.arimaData.length > 0 && count1 != '' && this.state.arimaData[count1] != null ? this.state.arimaData[count1].forecast != null ? this.state.arimaData[count1].ci != null ? this.state.arimaData[count1].forecast - this.state.arimaData[count1].ci : this.state.arimaData[count1].forecast : '' : ''
            //Arima Upper
            data[17] = this.state.arimaData.length > 0 && count1 != '' && this.state.arimaData[count1] != null ? this.state.arimaData[count1].forecast != null ? this.state.arimaData[count1].ci != null ? this.state.arimaData[count1].forecast + this.state.arimaData[count1].ci : this.state.arimaData[count1].forecast : '' : ''
            //LR Lower
            data[18] = this.state.linearRegressionData.length > 0 && count1 != '' && this.state.linearRegressionData[count1] != null ? this.state.linearRegressionData[count1].forecast != null ? this.state.linearRegressionData[count1].ci != null ? this.state.linearRegressionData[count1].forecast - this.state.linearRegressionData[count1].ci : this.state.linearRegressionData[count1].forecast : '' : ''
            //LR Upper
            data[19] = this.state.linearRegressionData.length > 0 && count1 != '' && this.state.linearRegressionData[count1] != null ? this.state.linearRegressionData[count1].forecast != null ? this.state.linearRegressionData[count1].ci != null ? this.state.linearRegressionData[count1].forecast + this.state.linearRegressionData[count1].ci : this.state.linearRegressionData[count1].forecast : '' : ''
            if (count1 >= 0) {
                count1++;
            }
            // data[20] = `=SUM(K0:K${parseInt(j) + 1})`
            dataArray[count] = data;
            count++;
        }
        console.log("### inside jexcel")

        this.el = jexcel(document.getElementById("tableDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("tableDiv"), true);

        console.log("this.state.forecastNestedHeader---", this.state.forecastNestedHeader)
        let nestedHeaders = [];
        if (this.state.forecastNestedHeader > 0) {
            nestedHeaders.push(
                {
                    title: '',
                    colspan: '4'
                },

            );
            nestedHeaders.push(
                {
                    title: 'Forecast',
                    colspan: this.state.forecastNestedHeader
                    // colspan:'5'
                },
            );
            nestedHeaders.push(
                {
                    title: '',
                    colspan: '3'
                },
            );
        } else {
            nestedHeaders.push(
                {
                    title: '',
                    colspan: '4'
                },

            );
            nestedHeaders.push(
                {
                    title: '',
                    colspan: '3'
                },
            );
        }
        var options = {
            data: dataArray,
            columnDrag: true,
            nestedHeaders: [nestedHeaders],
            columns: [
                {
                    title: 'Month',
                    type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100,
                    readOnly: true
                },
                {
                    title: getLabelText(this.props.items.currentItemConfig.context.payload.label, this.state.lang),
                    type: 'number',
                    mask: '#,##0.0000'
                },
                {
                    title: 'Reporting Rate',
                    type: 'number',
                    mask: '#,##0.0000%'
                },
                {
                    title: getLabelText(this.props.items.currentItemConfig.context.payload.label, this.state.lang) + '(Adjusted)',
                    type: 'number',
                    readOnly: true,
                    mask: '#,##0.0000'
                },
                {
                    title: i18n.t('static.extrapolation.movingAverages'),
                    type: this.state.movingAvgId ? 'number' : 'hidden',
                    mask: '#,##0.0000',
                    readOnly: true
                },
                {
                    title: i18n.t('static.extrapolation.SemiAverages'),
                    type: this.state.semiAvgId ? 'number' : 'hidden',
                    mask: '#,##0.0000',
                    readOnly: true
                },
                {
                    title: i18n.t('static.extrapolation.linearRegression'),
                    type: this.state.linearRegressionId ? 'number' : 'hidden',
                    mask: '#,##0.0000',
                    readOnly: true
                },
                {
                    title: 'TES',
                    type: this.state.smoothingId ? 'number' : 'hidden',
                    mask: '#,##0.0000',
                    readOnly: true
                },
                {
                    title: 'ARIMA',
                    type: this.state.arimaId ? 'number' : 'hidden',
                    mask: '#,##0.0000',
                    readOnly: true
                },

                {
                    title: 'Selected Forecast',
                    type: 'number',
                    // disabledMaskOnEdition: true,
                    // textEditor: true,
                    mask: '#,##0.0000',
                    decimal: '.',
                    readOnly: true
                },
                {
                    title: 'Manual Change (+/-)',
                    type: 'number',
                    disabledMaskOnEdition: true,
                    textEditor: true,
                    mask: '#,##0.0000',
                    decimal: '.',
                },
                {
                    title: 'Month End (Final)',
                    type: 'number',
                    // disabledMaskOnEdition: true,
                    // textEditor: true,
                    mask: '#,##0.0000',
                    decimal: '.',
                    readOnly: true
                },
                {
                    title: 'manualChangeAffectsFutureMonth',
                    type: 'hidden'
                },
                {
                    title: 'extrapolationMethodId',
                    type: 'hidden'
                },
                {
                    title: 'tesLower',
                    type: 'hidden'
                },
                {
                    title: 'tesUpper',
                    type: 'hidden'
                },
                {
                    title: 'arimaLower',
                    type: 'hidden'
                },
                {
                    title: 'arimaUpper',
                    type: 'hidden'
                },
                {
                    title: 'lrLower',
                    type: 'hidden'
                },
                {
                    title: 'lrUpper',
                    type: 'hidden'
                },
                // {
                //     title: 'cumulativeManualChange',
                //     type: 'text'
                // },
            ],

            // text: {
            //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
            onload: this.loadedExtrapolation,
            pagination: false,
            search: false,
            columnSorting: true,
            // tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            oneditionend: this.onedit,
            onchange: this.extrapolationChanged,
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el;
                if (y != null) {
                    var rowData = elInstance.getRowData(y);
                    // if (rowData[0] != "") {
                    if (moment(rowData[0]).isBetween(this.props.items.forecastStartDate, this.props.items.forecastStopDate, undefined, '[]')) {
                        var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                        cell.classList.add('bold');
                        cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');

                    } else {
                        var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                        cell.classList.remove('bold');
                        cell = elInstance.getCell(("K").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        // elInstance.showIndex(6);
                    }
                    var cell;
                    if (this.state.nodeDataExtrapolation.extrapolationMethod.id == 7) {
                        elInstance.getCell(("E").concat(parseInt(y) + 1)).classList.add('highlightExtrapolationMethod');
                        elInstance.getCell(("F").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("G").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("I").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("H").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                    } else if (this.state.nodeDataExtrapolation.extrapolationMethod.id == 6) {
                        elInstance.getCell(("F").concat(parseInt(y) + 1)).classList.add('highlightExtrapolationMethod');
                        elInstance.getCell(("E").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("G").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("I").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("H").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                    } else if (this.state.nodeDataExtrapolation.extrapolationMethod.id == 5) {
                        elInstance.getCell(("G").concat(parseInt(y) + 1)).classList.add('highlightExtrapolationMethod');
                        elInstance.getCell(("E").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("F").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("I").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("H").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                    }
                    else if (this.state.nodeDataExtrapolation.extrapolationMethod.id == 4) {
                        elInstance.getCell(("I").concat(parseInt(y) + 1)).classList.add('highlightExtrapolationMethod');
                        elInstance.getCell(("E").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("F").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("G").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("H").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                    }
                    else if (this.state.nodeDataExtrapolation.extrapolationMethod.id == 2) {
                        elInstance.getCell(("H").concat(parseInt(y) + 1)).classList.add('highlightExtrapolationMethod');
                        elInstance.getCell(("E").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("F").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("G").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("I").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                    } else {
                        elInstance.getCell(("E").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("F").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("G").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("I").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
                        elInstance.getCell(("H").concat(parseInt(y) + 1)).classList.remove('highlightExtrapolationMethod');
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
        if (this.state.arimaId) {
            rmseArr.push(this.state.arimaError.rmse)
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

        if (this.state.arimaId) {
            mapeArr.push(this.state.arimaError.mape)
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

        if (this.state.arimaId) {
            mseArr.push(this.state.arimaError.mse)
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

        if (this.state.arimaId) {
            rSqdArr.push(this.state.arimaError.rSqd)
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

        if (this.state.arimaId) {
            wapeArr.push(this.state.arimaError.wape)
        }

        var minRmse = Math.min(...rmseArr.filter(c => c != ""));
        var minMape = Math.min(...mapeArr.filter(c => c != ""));
        var minMse = Math.min(...mseArr.filter(c => c != ""));
        // var minRsqd = Math.min(...rSqdArr.filter(c => c != ""));
        var maxRsqd = Math.max(...rSqdArr.filter(c => c != "" && !isNaN(c)));
        var minWape = Math.min(...wapeArr.filter(c => c != ""));
        console.log("### inside jexcel going to update state")
        console.log("Loader 8 Test123")
        this.setState({
            dataExtrapolation,
            minRmse: minRmse,
            minMape: minMape,
            minMse: minMse,
            maxRsqd: maxRsqd,
            // minRsqd: minRsqd,
            minWape: minWape,
            extrapolationLoader: false
            // dataEl: dataEl, loading: false,
            // inputDataFilter: inputData,
            // inputDataAverageFilter: inputDataAverage,
            // inputDataRegressionFilter: inputDataRegression,
            // startMonthForExtrapolation: startMonth
        }, () => {
            console.log("");
        })
    }
    loadedExtrapolation = function (instance, cell, x, y, value) {
        //  jExcelLoadedFunctionWithoutPagination(instance);
        jExcelLoadedFunctionOnlyHideRow(instance);
        console.log("my instance---", instance)
        // if (this.state.dataExtrapolation != "") {
        // var asterisk = document.getElementsByClassName("resizable")[0];
        // var tr = asterisk.firstChild.nextSibling;
        // console.log("asterisk", asterisk.firstChild.nextSibling)
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild.nextSibling;

        tr.children[3].classList.add('InfoTr');
        tr.children[3].title = i18n.t('static.tooltip.ReportingRate');
        // tr.children[5].classList.add('InfoTr');
        // tr.children[6].classList.add('InfoTr');
        // tr.children[7].classList.add('InfoTr');
        // tr.children[8].classList.add('InfoTr');
        if (tr.children[5] != undefined) {
            tr.children[5].classList.add('InfoTr');
            tr.children[5].title = i18n.t('static.tooltip.MovingAverages');
        }
        if (tr.children[6] != undefined) {
            tr.children[6].classList.add('InfoTr');
            tr.children[6].title = i18n.t('static.tooltip.SemiAverages');
        }
        if (tr.children[7] != undefined) {
            tr.children[7].classList.add('InfoTr');
            tr.children[7].title = i18n.t('static.tooltip.LinearRegression');
        }
        if (tr.children[8] != undefined) {
            tr.children[8].classList.add('InfoTr');
            tr.children[8].title = i18n.t('static.tooltip.Tes');
        }
        if (tr.children[9] != undefined) {
            tr.children[9].classList.add('InfoTr');
            tr.children[9].title = i18n.t('static.tooltip.arima');
        }

    }

    extrapolationChanged = function (instance, cell, x, y, value) {
        // Population
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            var reg = JEXCEL_DECIMAL_NO_REGEX_LONG_4_DECIMAL;
            console.log("population value---", value)
            this.setState({ dataChanged: true })
            if (value != "" && !(reg.test(value.toString().replaceAll(",", "")))) {
                instance.setStyle(col, "background-color", "transparent");
                instance.setStyle(col, "background-color", "yellow");
                instance.setComments(col, i18n.t('static.message.invalidnumber'));
            }
            else {
                instance.setStyle(col, "background-color", "transparent");
                instance.setComments(col, "");
                var reportingRate = instance.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "").split("%")[0];
                var col1 = ("C").concat(parseInt(y) + 1);
                if (reportingRate == "") {
                    instance.setStyle(col1, "background-color", "transparent");
                    instance.setStyle(col1, "background-color", "yellow");
                    instance.setComments(col1, i18n.t('static.label.fieldRequired'));
                } else if (reportingRate > 100) {
                    instance.setStyle(col1, "background-color", "transparent");
                    instance.setStyle(col1, "background-color", "yellow");
                    instance.setComments(col1, i18n.t('static.message.invalidnumber'));
                }
                else if (!(reg.test(reportingRate))) {
                    instance.setStyle(col1, "background-color", "transparent");
                    instance.setStyle(col1, "background-color", "yellow");
                    instance.setComments(col1, i18n.t('static.message.invalidnumber'));
                } else {
                    // data[3] = `=IF(B${parseInt(j) + 1} == '','',IF(B${parseInt(j) + 1} == 0,0,ROUND((B${parseInt(j) + 1}/(C${parseInt(j) + 1}/100)),4)))`
                    if (value === '') {
                        instance.setValueFromCoords(3, y, '', true);
                    } else if (value == 0) {
                        instance.setValueFromCoords(3, y, 0, true);
                    } else {
                        instance.setValueFromCoords(3, y, `=ROUND((B${parseInt(y) + 1}/(C${parseInt(y) + 1}/100)),4)`, true);
                    }
                }
                var manualChange = instance.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "").split("%")[0];
                var col2 = ("K").concat(parseInt(y) + 1);
                var reg1 = JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL;
                if (manualChange != "" && !(reg1.test(manualChange))) {
                    instance.setStyle(col2, "background-color", "transparent");
                    instance.setStyle(col2, "background-color", "yellow");
                    instance.setComments(col2, i18n.t('static.message.invalidnumber'));
                }
                else {
                    instance.setStyle(col2, "background-color", "transparent");
                    instance.setComments(col2, "");
                }

            }
        }
        // Reporting Rate
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            var reg = JEXCEL_DECIMAL_NO_REGEX_LONG_4_DECIMAL;
            console.log("reporting rate value---", value)
            this.setState({ dataChanged: true })
            var actualValue = instance.getValue(`B${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // value.split("%")[0];
            value = value.toString().replaceAll(",", "").split("%")[0];
            if (actualValue != "" && value == "") {
                instance.setStyle(col, "background-color", "transparent");
                instance.setStyle(col, "background-color", "yellow");
                instance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else if (value > 100) {
                instance.setStyle(col, "background-color", "transparent");
                instance.setStyle(col, "background-color", "yellow");
                instance.setComments(col, i18n.t('static.message.invalidnumber'));
            }
            else if (!(reg.test(value))) {
                instance.setStyle(col, "background-color", "transparent");
                instance.setStyle(col, "background-color", "yellow");
                instance.setComments(col, i18n.t('static.message.invalidnumber'));
            }
            else {
                instance.setStyle(col, "background-color", "transparent");
                instance.setComments(col, "");
            }
        }
        // Manual change
        if (x == 10) {
            var col = ("K").concat(parseInt(y) + 1);
            var reg = JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL;
            value = value.toString().replaceAll(",", "");
            var actualValue = instance.getValue(`B${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (actualValue != "" && value != "" && !(reg.test(value))) {
                instance.setStyle(col, "background-color", "transparent");
                instance.setStyle(col, "background-color", "yellow");
                instance.setComments(col, i18n.t('static.message.invalidnumber'));
            }
            else {
                instance.setStyle(col, "background-color", "transparent");
                instance.setComments(col, "");
            }
        }
        console.log("x value for data change---", x);
        // if (x != 10 && (x == 1 || x > 2)) {
        //     this.setState({ dataChanged: true })
        // }
        this.setState({ isChanged: true })
    }.bind(this);

    setMovingAvgId(e) {
        var json;
        var json1;
        var filteredExtrapolationMethodList = this.state.filteredExtrapolationMethodList;
        var movingAvgId = e.target.checked;
        this.setState({
            movingAvgId: movingAvgId,
            isChanged: true
        }, () => {
            if (this.state.dataExtrapolation != "") {
                if (movingAvgId) {
                    json1 = this.state.extrapolationMethodList.filter(c => c.id == 7)[0];
                    filteredExtrapolationMethodList.push(json1);
                    if (this.state.dataExtrapolation != null) {
                        console.log("spreadsheet.getHeaders()---", this.state.dataExtrapolation.getHeader(4));
                        this.state.dataExtrapolation.showColumn(4);
                    }
                    this.setState({ dataChanged: true });
                } else {
                    const index1 = filteredExtrapolationMethodList.findIndex(c => c.id == 7);
                    filteredExtrapolationMethodList.splice(index1, 1);
                    if (this.state.dataExtrapolation != null) {
                        this.state.dataExtrapolation.hideColumn(4);
                    }
                }
                this.setState({
                    filteredExtrapolationMethodList,
                    forecastNestedHeader: filteredExtrapolationMethodList.length
                }, () => {
                    if (this.state.nodeDataExtrapolation.extrapolationMethod.id != "") {
                        if (this.state.filteredExtrapolationMethodList.filter(x => x.id == this.state.nodeDataExtrapolation.extrapolationMethod.id).length == 0) {
                            const { nodeDataExtrapolation } = this.state;
                            nodeDataExtrapolation.extrapolationMethod.id = '';
                            this.setState({ nodeDataExtrapolation });
                        }
                    }
                    this.saveJexcelData();
                })
            }
        })
    }
    setSemiAvgId(e) {
        var json;
        var json1;
        var filteredExtrapolationMethodList = this.state.filteredExtrapolationMethodList;
        console.log("filteredExtrapolationMethodList--->>>>", this.state.extrapolationMethodList)
        var semiAvgId = e.target.checked;
        this.setState({
            semiAvgId: semiAvgId,
            isChanged: true
        }, () => {
            if (this.state.dataExtrapolation != "") {
                if (semiAvgId) {
                    // json = {
                    //     extrapolationMethod: { id: 6 },
                    //     jsonProperties: {
                    //     }
                    // }
                    json1 = this.state.extrapolationMethodList.filter(c => c.id == 6)[0];
                    console.log("json1---", json1)
                    // this.state.nodeDataExtrapolationOptionList.push(json);
                    filteredExtrapolationMethodList.push(json1);
                    if (this.state.dataExtrapolation != null) {
                        this.state.dataExtrapolation.showColumn(5);
                    }
                    this.setState({ dataChanged: true });
                } else {
                    // const index = this.state.nodeDataExtrapolationOptionList.findIndex(c => c.extrapolationMethod.id == 6);
                    const index1 = filteredExtrapolationMethodList.findIndex(c => c.id == 6);
                    filteredExtrapolationMethodList.splice(index1, 1);
                    // this.state.nodeDataExtrapolationOptionList.splice(index, 1);
                    if (this.state.dataExtrapolation != null) {
                        this.state.dataExtrapolation.hideColumn(5);
                    }
                }
                this.setState({ filteredExtrapolationMethodList, forecastNestedHeader: filteredExtrapolationMethodList.length }, () => {
                    console.log("filteredExtrapolationMethodList new ---", this.state.filteredExtrapolationMethodList)
                    if (this.state.nodeDataExtrapolation.extrapolationMethod.id != "") {
                        if (this.state.filteredExtrapolationMethodList.filter(x => x.id == this.state.nodeDataExtrapolation.extrapolationMethod.id).length == 0) {
                            const { nodeDataExtrapolation } = this.state;
                            nodeDataExtrapolation.extrapolationMethod.id = '';
                            this.setState({ nodeDataExtrapolation });
                        }
                    }
                    this.saveJexcelData();
                })
            }
        })
    }
    setLinearRegressionId(e) {
        var json;
        var json1;
        var filteredExtrapolationMethodList = this.state.filteredExtrapolationMethodList;
        var linearRegressionId = e.target.checked;
        this.setState({
            linearRegressionId: linearRegressionId,
            isChanged: true
        }, () => {
            if (this.state.dataExtrapolation != "") {
                if (linearRegressionId) {
                    // json = {
                    //     extrapolationMethod: { id: 5 },
                    //     jsonProperties: {
                    //     }
                    // }
                    json1 = this.state.extrapolationMethodList.filter(c => c.id == 5)[0];
                    console.log("this.state.extrapolationMethodList---", this.state.extrapolationMethodList);
                    console.log("filteredExtrapolationMethodList json1---", json1)
                    // this.state.nodeDataExtrapolationOptionList.push(json);
                    filteredExtrapolationMethodList.push(json1);
                    if (this.state.dataExtrapolation != null) {
                        this.state.dataExtrapolation.showColumn(6);
                    }
                    this.setState({ dataChanged: true });
                } else {
                    // const index = this.state.nodeDataExtrapolationOptionList.findIndex(c => c.extrapolationMethod.id == 5);
                    const index1 = filteredExtrapolationMethodList.findIndex(c => c.id == 5);
                    filteredExtrapolationMethodList.splice(index1, 1);
                    console.log("filteredExtrapolationMethodList after update---", filteredExtrapolationMethodList)
                    // this.state.nodeDataExtrapolationOptionList.splice(index, 1);
                    if (this.state.dataExtrapolation != null) {
                        this.state.dataExtrapolation.hideColumn(6);
                    }
                }
                this.setState({ filteredExtrapolationMethodList, forecastNestedHeader: filteredExtrapolationMethodList.length }, () => {
                    if (this.state.nodeDataExtrapolation.extrapolationMethod.id != "") {
                        if (this.state.filteredExtrapolationMethodList.filter(x => x.id == this.state.nodeDataExtrapolation.extrapolationMethod.id).length == 0) {
                            const { nodeDataExtrapolation } = this.state;
                            nodeDataExtrapolation.extrapolationMethod.id = '';
                            this.setState({ nodeDataExtrapolation });
                        }
                    }
                    this.saveJexcelData();
                })
            }
        })
    }
    setSmoothingId(e) {
        var json;
        var json1;
        var filteredExtrapolationMethodList = this.state.filteredExtrapolationMethodList;
        var smoothingId = e.target.checked;
        this.setState({
            smoothingId: smoothingId,
            isChanged: true
        }, () => {
            if (this.state.dataExtrapolation != "") {
                if (smoothingId) {
                    // json = {
                    //     extrapolationMethod: { id: 2 },
                    //     jsonProperties: {
                    //         confidenceLevel: this.state.confidenceLevelId,
                    //         seasonality: this.state.noOfMonthsForASeason,
                    //         alpha: this.state.alpha,
                    //         beta: this.state.beta,
                    //         gamma: this.state.gamma
                    //     }
                    // }
                    json1 = this.state.extrapolationMethodList.filter(c => c.id == 2)[0];
                    // this.state.nodeDataExtrapolationOptionList.push(json);
                    filteredExtrapolationMethodList.push(json1);
                    if (this.state.dataExtrapolation != null) {
                        this.state.dataExtrapolation.showColumn(7);
                    }
                    this.setState({ dataChanged: true });
                } else {
                    // const index = this.state.nodeDataExtrapolationOptionList.findIndex(c => c.extrapolationMethod.id == 2);
                    const index1 = filteredExtrapolationMethodList.findIndex(c => c.id == 2);
                    filteredExtrapolationMethodList.splice(index1, 1);
                    // this.state.nodeDataExtrapolationOptionList.splice(index, 1);
                    if (this.state.dataExtrapolation != null) {
                        this.state.dataExtrapolation.hideColumn(7);
                    }
                }
                this.setState({ filteredExtrapolationMethodList, forecastNestedHeader: filteredExtrapolationMethodList.length }, () => {
                    if (this.state.nodeDataExtrapolation.extrapolationMethod.id != "") {
                        if (this.state.filteredExtrapolationMethodList.filter(x => x.id == this.state.nodeDataExtrapolation.extrapolationMethod.id).length == 0) {
                            const { nodeDataExtrapolation } = this.state;
                            nodeDataExtrapolation.extrapolationMethod.id = '';
                            this.setState({ nodeDataExtrapolation });
                        }
                    }
                    this.saveJexcelData();
                })
            }
        })
    }
    setArimaId(e) {
        var json;
        var json1;
        var filteredExtrapolationMethodList = this.state.filteredExtrapolationMethodList;
        var arimaId = e.target.checked;
        this.setState({
            arimaId: arimaId,
            isChanged: true
        }, () => {
            if (this.state.dataExtrapolation != "") {
                if (arimaId) {
                    // json = {
                    //     extrapolationMethod: { id: 4 },
                    //     jsonProperties: {
                    //         p: this.state.p,
                    //         d: this.state.d,
                    //         q: this.state.q
                    //     }
                    // }
                    json1 = this.state.extrapolationMethodList.filter(c => c.id == 4)[0];
                    // this.state.nodeDataExtrapolationOptionList.push(json);
                    filteredExtrapolationMethodList.push(json1);
                    if (this.state.dataExtrapolation != null) {
                        this.state.dataExtrapolation.showColumn(8);
                    }
                    this.setState({ dataChanged: true });
                } else {
                    // const index = this.state.nodeDataExtrapolationOptionList.findIndex(c => c.extrapolationMethod.id == 4);
                    const index1 = filteredExtrapolationMethodList.findIndex(c => c.id == 4);
                    filteredExtrapolationMethodList.splice(index1, 1);
                    // this.state.nodeDataExtrapolationOptionList.splice(index, 1);
                    if (this.state.dataExtrapolation != null) {
                        this.state.dataExtrapolation.hideColumn(8);
                    }
                }
                this.setState({ filteredExtrapolationMethodList, forecastNestedHeader: filteredExtrapolationMethodList.length }, () => {
                    if (this.state.nodeDataExtrapolation.extrapolationMethod.id != "") {
                        if (this.state.filteredExtrapolationMethodList.filter(x => x.id == this.state.nodeDataExtrapolation.extrapolationMethod.id).length == 0) {
                            const { nodeDataExtrapolation } = this.state;
                            nodeDataExtrapolation.extrapolationMethod.id = '';
                            this.setState({ nodeDataExtrapolation });
                        }
                    }
                    this.saveJexcelData();
                })
            }
        })
    }
    getDatasetData(e) {

    }
    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }
    toggleQ() {
        this.setState({
            popoverOpenQ: !this.state.popoverOpenQ,
        });
    }
    toggleD() {
        this.setState({
            popoverOpenD: !this.state.popoverOpenD,
        });
    }
    toggleP() {
        this.setState({
            popoverOpenP: !this.state.popoverOpenP,
        });
    }
    toggleGamma() {
        this.setState({
            popoverOpenGamma: !this.state.popoverOpenGamma,
        });
    }
    toggleBeta() {
        this.setState({
            popoverOpenBeta: !this.state.popoverOpenBeta,
        });
    }
    toggleAlpha() {
        this.setState({
            popoverOpenAlpha: !this.state.popoverOpenAlpha,
        });
    }
    // toggleSeasonality() {
    //     this.setState({
    //         popoverOpenSeasonality: !this.state.popoverOpenSeasonality,
    //     });
    // }
    toggleConfidenceLevel() {
        this.setState({
            popoverOpenConfidenceLevel: !this.state.popoverOpenConfidenceLevel,
        });
    }
    toggleConfidenceLevel1() {
        this.setState({
            popoverOpenConfidenceLevel1: !this.state.popoverOpenConfidenceLevel1,
        });
    }
    toggleLr() {
        this.setState({
            popoverOpenLr: !this.state.popoverOpenLr,
        });
    }
    toggleTes() {
        this.setState({
            popoverOpenTes: !this.state.popoverOpenTes,
        });
    }
    toggleArima() {
        this.setState({
            popoverOpenArima: !this.state.popoverOpenArima,
        });
    }
    toggleSa() {
        this.setState({
            popoverOpenSa: !this.state.popoverOpenSa,
        });
    }
    toggleStartMonth() {
        this.setState({
            popoverOpenStartMonth: !this.state.popoverOpenStartMonth,
        });
    }
    toggleMa() {
        this.setState({
            popoverOpenMa: !this.state.popoverOpenMa,
        });
    }

    toggleChooseMethod() {
        this.setState({
            popoverOpenChooseMethod: !this.state.popoverOpenChooseMethod,
        });
    }
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));



    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        const { filteredExtrapolationMethodList } = this.state;
        console.log("render filteredExtrapolationMethodList ---", filteredExtrapolationMethodList);
        var filteredExtrapolationMethodListNew = filteredExtrapolationMethodList.length > 0 && filteredExtrapolationMethodList.sort((a, b) => {
            var itemLabelA = a.sortOrder; // ignore upper and lowercase
            var itemLabelB = b.sortOrder; // ignore upper and lowercase                   
            return itemLabelA > itemLabelB ? 1 : -1;
        });
        let extrapolationMethods = filteredExtrapolationMethodListNew.length > 0
            && filteredExtrapolationMethodListNew.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        // console.log("extrapolationMethods---", extrapolationMethods);

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
                        labelString: this.props.items.currentItemConfig.context.payload.nodeUnit.label != null && this.props.items.currentItemConfig.context.payload.nodeUnit.label != "" ? getLabelText(this.props.items.currentItemConfig.context.payload.nodeUnit.label, this.state.lang) : "",
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
                        // scaleLabel: {
                        //     display: true,
                        //     labelString: 'Month',
                        //     fontColor: 'black'
                        // },
                        ticks: {
                            fontColor: 'black',
                            autoSkip: false,
                            callback: function (label) {
                                console.log("month label---", label);
                                var xAxis1 = label
                                xAxis1 += '';
                                console.log("month graph---", xAxis1.split('-')[0])
                                var month = xAxis1.split('-')[0];
                                return month;
                            }
                            // ,
                            // changeItemColor: function (item) {
                            //     console.log("graph item---",item);
                            //     // item.scaleLabel.fontColor = color;
                            //     // item.ticks.fontColor = color;
                            //     // item.ticks.minor.fontColor = color;
                            //     // item.ticks.major.fontColor = color;
                            // }
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
                                if (month === "Jul") {
                                    return year;
                                } else {
                                    return "";
                                }
                            },
                            maxRotation: 0,
                            minRotation: 0,
                            autoSkip: false
                        }
                    }]
            },
            tooltips: {
                enabled: false,
                custom: CustomTooltips,
                callbacks: {
                    label: function (tooltipItem, data) {

                        let label = data.labels[tooltipItem.index];
                        let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

                        var cell1 = value
                        cell1 += '';
                        var x = cell1.split('.');
                        var x1 = x[0];
                        var x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                            x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        }
                        return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
                    }
                }

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


        let datasets = [];
        datasets.push({
            type: "line",
            pointRadius: 0,
            lineTension: 0,
            label: i18n.t('static.extrapolation.adjustedActuals'),
            backgroundColor: 'transparent',
            borderColor: '#002F6C',
            borderWidth: 2,
            ticks: {
                fontSize: 2,
                fontColor: 'transparent',
            },
            showInLegend: true,
            pointStyle: 'line',
            pointBorderWidth: 5,
            pointHoverBackgroundColor: 'transparent',
            pointHoverBorderColor: 'transparent',
            // pointHoverBorderWidth: 2,
            // pointRadius: 1,
            pointHitRadius: 5,
            yValueFormatString: "###,###,###,###",
            data: this.state.jexcelDataArr.map((item, index) => (item.adjustedActuals > 0 && this.state.monthArray.filter(x => moment(x).format('YYYY-MM') == moment(item.month).format('YYYY-MM')).length > 0 ? item.adjustedActuals : null))
        })

        let stopDate = moment(this.props.items.forecastStopDate).format("YYYY-MM-DD");
        let startDate = moment(this.props.items.forecastStartDate).format("YYYY-MM-DD");

        // console.log("Stop Date&&&", stopDate);
        console.log("Stop Date 1&&&", this.state.movingAvgData);
        console.log("Stop Date 2&&&", this.state.jexcelDataArr);
        console.log("Stop Date 3&&&", this.state.linearRegressionData);
        console.log("Stop Date 4&&&", this.state.maxMonth);
        console.log("Stop Date 5&&&", this.state.minMonth);
        var data = this.state.jexcelDataArr.map((item, index) =>
        (this.state.movingAvgData.filter(x => x.month == item.monthNo).length > 0
            && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
                || (moment(this.state.minMonth).format('YYYY-MM') <= moment(item.month).format('YYYY-MM')
                    && (item.amount == "" || item.amount == null)))
            ? "Inside if data " : "Inside else data"));
        console.log("Stop Date 6&&&", data);

        var data1 = this.state.jexcelDataArr.map((item, index) =>
        (this.state.movingAvgData.filter(x => x.month == item.monthNo).length > 0
            ? "Inside if data " : "Inside else data"));
        console.log("Stop Date 7&&&", data1);

        var data2 = this.state.jexcelDataArr.map((item, index) =>
        (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
            || (moment(this.state.minMonth).format('YYYY-MM') <= moment(item.month).format('YYYY-MM'))
            ? "Inside if data " : "Inside else data"));
        console.log("Stop Date 8&&&", data2);

        var data3 = this.state.jexcelDataArr.map((item, index) =>
        (
            (item.amount == "" || item.amount == null)
                ? "Inside if data " : "Inside else data"));
        console.log("Stop Date 9&&&", data3);

        if (this.state.nodeDataExtrapolation != null && this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 7) {
            console.log("moving average test 1");
            if (this.state.movingAvgId) {
                datasets.push(
                    {
                        type: "line",
                        pointRadius: 0,
                        lineTension: 0,
                        label: i18n.t('static.extrapolation.movingAverages'),
                        backgroundColor: 'transparent',
                        borderColor: '#BA0C2F',
                        borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 7 ? 4 : 2,
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        showInLegend: true,
                        pointStyle: 'line',
                        pointBorderWidth: 5,
                        pointHoverBackgroundColor: 'transparent',
                        pointHoverBorderColor: 'transparent',
                        // pointHoverBorderWidth: 2,
                        // pointRadius: 1,
                        pointHitRadius: 5,
                        yValueFormatString: "###,###,###,###",
                        data: this.state.jexcelDataArr.map((item, index) => (this.state.movingAvgData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && (item.amount == "" || item.amount == null))) ? this.state.movingAvgData.filter(x => x.month == item.monthNo)[0].forecast : null))
                    })
            }
        }
        // Semi Averages
        else if (this.state.nodeDataExtrapolation != null && this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 6) {
            if (this.state.semiAvgId) {
                datasets.push({
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t('static.extrapolation.semiAverages'),
                    backgroundColor: 'transparent',
                    borderColor: '#118B70',
                    borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 6 ? 4 : 2,
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    pointHoverBackgroundColor: 'transparent',
                    pointHoverBorderColor: 'transparent',
                    // pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 5,
                    yValueFormatString: "###,###,###,###",
                    // data: this.state.semiAvgData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? item.forecast.toFixed(4) : null))
                    data: this.state.jexcelDataArr.map((item, index) => (this.state.semiAvgData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && (item.amount == "" || item.amount == null))) ? this.state.semiAvgData.filter(x => x.month == item.monthNo)[0].forecast : null))
                    // data: this.state.jexcelDataArr.map((item, index) => (this.state.movingAvgData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && item.amount == "")) ? this.state.movingAvgData.filter(x => x.month == item.monthNo)[0].forecast : null))
                })
            }
        }
        // Linear Regression
        else if (this.state.nodeDataExtrapolation != null && this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 5) {
            console.log("inside if linear regression");
            if (this.state.linearRegressionId) {
                console.log("inside if linear regression true");
                datasets.push(
                    {
                        type: "line",
                        pointRadius: 0,
                        lineTension: 0,
                        label: i18n.t("static.extrapolation.lrLower"),
                        backgroundColor: 'transparent',
                        borderColor: '#EDB944',
                        borderStyle: 'dotted',
                        borderDash: [10, 10],
                        borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 5 ? 4 : 2,
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        showInLegend: true,
                        pointStyle: 'line',
                        pointBorderWidth: 5,
                        pointHoverBackgroundColor: 'transparent',
                        pointHoverBorderColor: 'transparent',
                        // pointHoverBorderWidth: 2,
                        // pointRadius: 1,
                        pointHitRadius: 5,
                        yValueFormatString: "###,###,###,###",
                        // data: this.state.linearRegressionData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? item.forecast.toFixed(4) : null))
                        data: this.state.jexcelDataArr.map((item, index) => (this.state.linearRegressionData.filter(x => x.month == item.monthNo).length > 0
                            && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
                                || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && (item.amount == ""
                                    || item.amount == null)))
                            ? (this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != null
                                && this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != ""
                                && this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != undefined
                                ? ((this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast - this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci) < 0 ? 0 : (this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast - this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci))
                                : this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast)
                            : null))
                    })
            }
            // Linear Regression 
            if (this.state.linearRegressionId) {
                datasets.push(
                    {
                        type: "line",
                        pointRadius: 0,
                        lineTension: 0,
                        label: i18n.t('static.extrapolation.linearRegression'),
                        backgroundColor: 'transparent',
                        borderColor: '#EDB944',
                        borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 5 ? 4 : 2,
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        showInLegend: true,
                        pointStyle: 'line',
                        pointBorderWidth: 5,
                        pointHoverBackgroundColor: 'transparent',
                        pointHoverBorderColor: 'transparent',
                        // pointHoverBorderWidth: 2,
                        // pointRadius: 1,
                        pointHitRadius: 5,
                        yValueFormatString: "###,###,###,###",
                        // data: this.state.linearRegressionData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? item.forecast.toFixed(4) : null))
                        data: this.state.jexcelDataArr.map((item, index) => (this.state.linearRegressionData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && (item.amount == "" || item.amount == null))) ? this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast : null))
                    })
            }
            // Linear Regression High
            if (this.state.linearRegressionId) {
                datasets.push(
                    {
                        type: "line",
                        pointRadius: 0,
                        lineTension: 0,
                        label: i18n.t("static.extrapolation.lrUpper"),
                        backgroundColor: 'transparent',
                        borderColor: '#EDB944',
                        borderStyle: 'dotted',
                        borderDash: [10, 10],
                        borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 5 ? 4 : 2,
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        showInLegend: true,
                        pointStyle: 'line',
                        pointBorderWidth: 5,
                        pointHoverBackgroundColor: 'transparent',
                        pointHoverBorderColor: 'transparent',
                        // pointHoverBorderWidth: 2,
                        // pointRadius: 1,
                        pointHitRadius: 5,
                        yValueFormatString: "###,###,###,###",
                        // data: this.state.linearRegressionData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? item.forecast.toFixed(4) : null))
                        data: this.state.jexcelDataArr.map((item, index) => (this.state.linearRegressionData.filter(x => x.month == item.monthNo).length > 0
                            && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
                                || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && (item.amount == ""
                                    || item.amount == null)))
                            ? (this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != null
                                && this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != ""
                                && this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != undefined
                                ? ((this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast + this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci) < 0 ? 0 : (this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast + this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci))
                                : this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast)
                            : null))
                    })
            }
        }
        // TES
        else if (this.state.nodeDataExtrapolation != null && this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 2) {
            // TES low
            if (this.state.smoothingId) {
                datasets.push({
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t('static.extrapolation.tesLower'),
                    backgroundColor: 'transparent',
                    borderColor: '#A7C6ED',
                    borderStyle: 'dotted',
                    borderDash: [10, 10],
                    borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 2 ? 4 : 2,
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    pointHoverBackgroundColor: 'transparent',
                    pointHoverBorderColor: 'transparent',
                    // pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 5,
                    yValueFormatString: "###,###,###,###",
                    // data: this.state.tesData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? (item.forecast - this.state.CI).toFixed(4) : null))
                    // data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && item.amount == "")) ? this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast - this.state.CI : null))
                    data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0
                        && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
                            || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM')
                                && (item.amount == "" || item.amount == null)))
                        ? (this.state.tesData.filter(x => x.month == item.monthNo)[0].ci != null
                            && this.state.tesData.filter(x => x.month == item.monthNo)[0].ci != ""
                            && this.state.tesData.filter(x => x.month == item.monthNo)[0].ci != undefined
                            ? ((this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast - this.state.tesData.filter(x => x.month == item.monthNo)[0].ci) < 0 ? 0 : (this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast - this.state.tesData.filter(x => x.month == item.monthNo)[0].ci))
                            : this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast)
                        : null))
                })
            }
            if (this.state.smoothingId) {
                datasets.push({
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t('static.extrapolation.tes'),
                    backgroundColor: 'transparent',
                    borderColor: '#A7C6ED',
                    borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 2 ? 4 : 2,
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    pointHoverBackgroundColor: 'transparent',
                    pointHoverBorderColor: 'transparent',
                    // pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 5,
                    yValueFormatString: "###,###,###,###",
                    // data: this.state.tesData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? item.forecast.toFixed(4) : null))
                    data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && (item.amount == "" || item.amount == null))) ? this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast : null))
                })
            }
            if (this.state.smoothingId) {
                datasets.push({
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t('static.extrapolation.tesUpper'),
                    backgroundColor: 'transparent',
                    borderColor: '#A7C6ED',
                    borderStyle: 'dotted',
                    borderDash: [10, 10],
                    borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 2 ? 4 : 2,
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    pointHoverBackgroundColor: 'transparent',
                    pointHoverBorderColor: 'transparent',
                    // pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 5,
                    yValueFormatString: "###,###,###,###",
                    // data: this.state.tesData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? (item.forecast + this.state.CI).toFixed(4) : null))
                    // data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && item.amount == "")) ? this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast + this.state.CI : null))
                    data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0
                        && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
                            || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM')
                                && (item.amount == "" || item.amount == null)))
                        ? (this.state.tesData.filter(x => x.month == item.monthNo)[0].ci != null
                            && this.state.tesData.filter(x => x.month == item.monthNo)[0].ci != ""
                            && this.state.tesData.filter(x => x.month == item.monthNo)[0].ci != undefined
                            ? ((this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast + this.state.tesData.filter(x => x.month == item.monthNo)[0].ci) < 0 ? 0 : (this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast + this.state.tesData.filter(x => x.month == item.monthNo)[0].ci))
                            : this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast)
                        : null))
                })
            }
        }
        //ARIMA
        else if (this.state.nodeDataExtrapolation != null && this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 4) {
            console.log("arima method select inside if 1")
            // Arima Lower
            if (this.state.arimaId) {
                console.log("arima method select inside if 2")
                datasets.push({
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t("static.extrapolation.arimaLower"),
                    backgroundColor: 'transparent',
                    borderColor: '#651D32',
                    borderStyle: 'dotted',
                    borderDash: [10, 10],
                    borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 4 ? 4 : 2,
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    pointHoverBackgroundColor: 'transparent',
                    pointHoverBorderColor: 'transparent',
                    // pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 5,
                    yValueFormatString: "###,###,###,###",
                    // data: this.state.tesData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? (item.forecast + this.state.CI).toFixed(4) : null))
                    // data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && item.amount == "")) ? this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast + this.state.CI : null))
                    data: this.state.jexcelDataArr.map((item, index) => (this.state.arimaData.filter(x => x.month == item.monthNo).length > 0
                        && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
                            || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM')
                                && (item.amount == "" || item.amount == null)))
                        ? (this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci != null
                            && this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci != ""
                            && this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci != undefined
                            ? ((this.state.arimaData.filter(x => x.month == item.monthNo)[0].forecast - this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci) < 0 ? 0 : (this.state.arimaData.filter(x => x.month == item.monthNo)[0].forecast - this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci))
                            : this.state.arimaData.filter(x => x.month == item.monthNo)[0].forecast)
                        : null))
                })
            }
            //Arima
            if (this.state.arimaId) {
                console.log("arima method select inside if 3")
                datasets.push({
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t('static.extrapolation.arima'),
                    backgroundColor: 'transparent',
                    borderColor: '#651D32',
                    borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 4 ? 4 : 2,
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    pointHoverBackgroundColor: 'transparent',
                    pointHoverBorderColor: 'transparent',
                    // pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 5,
                    yValueFormatString: "###,###,###,###",
                    data: this.state.jexcelDataArr.map((item, index) => (this.state.arimaData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && (item.amount == "" || item.amount == null))) ? this.state.arimaData.filter(x => x.month == item.monthNo)[0].forecast : null))
                    // data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0 ? this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast- this.state.CI : null))
                })
            }
            // arima Upper
            if (this.state.arimaId) {
                console.log("arima method select inside if 4")
                datasets.push({
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t("static.extrapolation.arimaUpper"),
                    backgroundColor: 'transparent',
                    borderColor: '#651D32',
                    borderStyle: 'dotted',
                    borderDash: [10, 10],
                    borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 4 ? 4 : 2,
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    pointHoverBackgroundColor: 'transparent',
                    pointHoverBorderColor: 'transparent',
                    // pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 5,
                    yValueFormatString: "###,###,###,###",
                    // data: this.state.tesData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? (item.forecast + this.state.CI).toFixed(4) : null))
                    data: this.state.jexcelDataArr.map((item, index) => (this.state.arimaData.filter(x => x.month == item.monthNo).length > 0
                        && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
                            || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM')
                                && (item.amount == "" || item.amount == null)))
                        ? (this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci != null
                            && this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci != ""
                            && this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci != undefined
                            ? ((this.state.arimaData.filter(x => x.month == item.monthNo)[0].forecast + this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci) < 0 ? 0 : (this.state.arimaData.filter(x => x.month == item.monthNo)[0].forecast + this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci))
                            : this.state.arimaData.filter(x => x.month == item.monthNo)[0].forecast)
                        : null))
                })
            }

        }

        // else {
        if (this.state.movingAvgId && (this.state.nodeDataExtrapolation.extrapolationMethod == null || this.state.nodeDataExtrapolation.extrapolationMethod.id != 7)) {
            console.log("moving average test 2");
            datasets.push(
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t('static.extrapolation.movingAverages'),
                    backgroundColor: 'transparent',
                    borderColor: '#BA0C2F',
                    borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 7 ? 4 : 2,
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    pointHoverBackgroundColor: 'transparent',
                    pointHoverBorderColor: 'transparent',
                    // pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 5,
                    yValueFormatString: "###,###,###,###",
                    data: this.state.jexcelDataArr.map((item, index) =>
                    (this.state.movingAvgData.filter(x => x.month == item.monthNo).length > 0
                        && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
                            || (moment(this.state.minMonth).format('YYYY-MM') <= moment(item.month).format('YYYY-MM')
                                && (item.amount == "" || item.amount == null)))
                        ? this.state.movingAvgData.filter(x => x.month == item.monthNo)[0].forecast : null))
                })
        }
        if (this.state.semiAvgId && (this.state.nodeDataExtrapolation.extrapolationMethod == null || this.state.nodeDataExtrapolation.extrapolationMethod.id != 6)) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t('static.extrapolation.semiAverages'),
                backgroundColor: 'transparent',
                borderColor: '#118B70',
                borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 6 ? 4 : 2,
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                pointHoverBackgroundColor: 'transparent',
                pointHoverBorderColor: 'transparent',
                // pointHoverBorderWidth: 2,
                // pointRadius: 1,
                pointHitRadius: 5,
                yValueFormatString: "###,###,###,###",
                // data: this.state.semiAvgData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? item.forecast.toFixed(4) : null))
                data: this.state.jexcelDataArr.map((item, index) => (this.state.semiAvgData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && (item.amount == "" || item.amount == null))) ? this.state.semiAvgData.filter(x => x.month == item.monthNo)[0].forecast : null))
                // data: this.state.jexcelDataArr.map((item, index) => (this.state.movingAvgData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && item.amount == "")) ? this.state.movingAvgData.filter(x => x.month == item.monthNo)[0].forecast : null))
            })
        }
        // Linear Regression Low
        if (this.state.linearRegressionId && (this.state.nodeDataExtrapolation.extrapolationMethod == null || this.state.nodeDataExtrapolation.extrapolationMethod.id != 5)) {
            datasets.push(
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t("static.extrapolation.lrLower"),
                    backgroundColor: 'transparent',
                    borderColor: '#EDB944',
                    borderStyle: 'dotted',
                    borderDash: [10, 10],
                    borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 5 ? 4 : 2,
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    pointHoverBackgroundColor: 'transparent',
                    pointHoverBorderColor: 'transparent',
                    // pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 5,
                    yValueFormatString: "###,###,###,###",
                    // data: this.state.linearRegressionData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? item.forecast.toFixed(4) : null))
                    data: this.state.jexcelDataArr.map((item, index) => (this.state.linearRegressionData.filter(x => x.month == item.monthNo).length > 0
                        && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
                            || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM')
                                && (item.amount == "" || item.amount == null)))
                        ? (this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != null
                            && this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != ""
                            && this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != undefined
                            ? ((this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast - this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci) < 0 ? 0 : (this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast - this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci))
                            : this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast)
                        : null))
                })
        }
        // Linear Regression 
        if (this.state.linearRegressionId && (this.state.nodeDataExtrapolation.extrapolationMethod == null || this.state.nodeDataExtrapolation.extrapolationMethod.id != 5)) {
            datasets.push(
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t('static.extrapolation.linearRegression'),
                    backgroundColor: 'transparent',
                    borderColor: '#EDB944',
                    borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 5 ? 4 : 2,
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    pointHoverBackgroundColor: 'transparent',
                    pointHoverBorderColor: 'transparent',
                    // pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 5,
                    yValueFormatString: "###,###,###,###",
                    // data: this.state.linearRegressionData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? item.forecast.toFixed(4) : null))
                    data: this.state.jexcelDataArr.map((item, index) => (this.state.linearRegressionData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && (item.amount == "" || item.amount == null))) ? this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast : null))
                })
        }
        // Linear Regression High
        if (this.state.linearRegressionId && (this.state.nodeDataExtrapolation.extrapolationMethod == null || this.state.nodeDataExtrapolation.extrapolationMethod.id != 5)) {
            console.log("Stop Date 2&&&", this.state.jexcelDataArr);
            console.log("Stop Date 3&&&", this.state.linearRegressionData);
            console.log("Stop Date 4&&&", this.state.maxMonth);
            console.log("Stop Date 5&&&", this.state.minMonth);
            console.log("final data---", this.state.jexcelDataArr.map((item, index) => (this.state.linearRegressionData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && (item.amount == "" || item.amount == null))) ? (this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != null && this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != "" && this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != undefined ? "A" : "B") : "C")));
            datasets.push(
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t("static.extrapolation.lrUpper"),
                    backgroundColor: 'transparent',
                    borderColor: '#EDB944',
                    borderStyle: 'dotted',
                    borderDash: [10, 10],
                    borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 5 ? 4 : 2,
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    pointHoverBackgroundColor: 'transparent',
                    pointHoverBorderColor: 'transparent',
                    // pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 5,
                    yValueFormatString: "###,###,###,###",
                    // data: this.state.linearRegressionData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? item.forecast.toFixed(4) : null))
                    data: this.state.jexcelDataArr.map((item, index) => (this.state.linearRegressionData.filter(x => x.month == item.monthNo).length > 0
                        && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
                            || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM')
                                && (item.amount == "" || item.amount == null)))
                        ? (this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != null
                            && this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != ""
                            && this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci != undefined
                            ? ((this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast + this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci) < 0 ? 0 : (this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast + this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].ci))
                            : this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast)
                        : null))
                })
        }
        // TES low
        if (this.state.smoothingId && (this.state.nodeDataExtrapolation.extrapolationMethod == null || this.state.nodeDataExtrapolation.extrapolationMethod.id != 2)) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t('static.extrapolation.tesLower'),
                backgroundColor: 'transparent',
                borderColor: '#A7C6ED',
                borderStyle: 'dotted',
                borderDash: [10, 10],
                borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 2 ? 4 : 2,
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                pointHoverBackgroundColor: 'transparent',
                pointHoverBorderColor: 'transparent',
                // pointHoverBorderWidth: 2,
                // pointRadius: 1,
                pointHitRadius: 5,
                yValueFormatString: "###,###,###,###",
                // data: this.state.tesData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? (item.forecast - this.state.CI).toFixed(4) : null))
                // data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && item.amount == "")) ? this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast - this.state.CI : null))
                data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0
                    && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
                        || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM')
                            && (item.amount == "" || item.amount == null)))
                    ? (this.state.tesData.filter(x => x.month == item.monthNo)[0].ci != null
                        && this.state.tesData.filter(x => x.month == item.monthNo)[0].ci != ""
                        && this.state.tesData.filter(x => x.month == item.monthNo)[0].ci != undefined
                        ? ((this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast - this.state.tesData.filter(x => x.month == item.monthNo)[0].ci) < 0 ? 0 : (this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast - this.state.tesData.filter(x => x.month == item.monthNo)[0].ci))
                        : this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast)
                    : null))
            })
        }
        if (this.state.smoothingId && (this.state.nodeDataExtrapolation.extrapolationMethod == null || this.state.nodeDataExtrapolation.extrapolationMethod.id != 2)) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t('static.extrapolation.tes'),
                backgroundColor: 'transparent',
                borderColor: '#A7C6ED',
                borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 2 ? 4 : 2,
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                pointHoverBackgroundColor: 'transparent',
                pointHoverBorderColor: 'transparent',
                // pointHoverBorderWidth: 2,
                // pointRadius: 1,
                pointHitRadius: 5,
                yValueFormatString: "###,###,###,###",
                // data: this.state.tesData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? item.forecast.toFixed(4) : null))
                data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && (item.amount == "" || item.amount == null))) ? this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast : null))
            })
        }
        if (this.state.smoothingId && (this.state.nodeDataExtrapolation.extrapolationMethod == null || this.state.nodeDataExtrapolation.extrapolationMethod.id != 2)) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t('static.extrapolation.tesUpper'),
                backgroundColor: 'transparent',
                borderColor: '#A7C6ED',
                borderStyle: 'dotted',
                borderDash: [10, 10],
                borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 2 ? 4 : 2,
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                pointHoverBackgroundColor: 'transparent',
                pointHoverBorderColor: 'transparent',
                // pointHoverBorderWidth: 2,
                // pointRadius: 1,
                pointHitRadius: 5,
                yValueFormatString: "###,###,###,###",
                // data: this.state.tesData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? (item.forecast + this.state.CI).toFixed(4) : null))
                // data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && item.amount == "")) ? this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast + this.state.CI : null))
                data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0
                    && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
                        || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && (item.amount == ""
                            || item.amount == null)))
                    ? (this.state.tesData.filter(x => x.month == item.monthNo)[0].ci != null
                        && this.state.tesData.filter(x => x.month == item.monthNo)[0].ci != ""
                        && this.state.tesData.filter(x => x.month == item.monthNo)[0].ci != undefined
                        ? ((this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast + this.state.tesData.filter(x => x.month == item.monthNo)[0].ci) < 0 ? 0 : (this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast + this.state.tesData.filter(x => x.month == item.monthNo)[0].ci))
                        : this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast)
                    : null))
            })
        }
        // Arima Lower
        if (this.state.arimaId && (this.state.nodeDataExtrapolation.extrapolationMethod == null || this.state.nodeDataExtrapolation.extrapolationMethod.id != 4)) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t("static.extrapolation.arimaLower"),
                backgroundColor: 'transparent',
                borderColor: '#651D32',
                borderStyle: 'dotted',
                borderDash: [10, 10],
                borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 4 ? 4 : 2,
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                pointHoverBackgroundColor: 'transparent',
                pointHoverBorderColor: 'transparent',
                // pointHoverBorderWidth: 2,
                // pointRadius: 1,
                pointHitRadius: 5,
                yValueFormatString: "###,###,###,###",
                // data: this.state.tesData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? (item.forecast + this.state.CI).toFixed(4) : null))
                // data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && item.amount == "")) ? this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast + this.state.CI : null))
                data: this.state.jexcelDataArr.map((item, index) => (this.state.arimaData.filter(x => x.month == item.monthNo).length > 0
                    && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
                        || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM')
                            && (item.amount == "" || item.amount == null)))
                    ? (this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci != null
                        && this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci != ""
                        && this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci != undefined
                        ? ((this.state.arimaData.filter(x => x.month == item.monthNo)[0].forecast - this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci) < 0 ? 0 : (this.state.arimaData.filter(x => x.month == item.monthNo)[0].forecast - this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci))
                        : this.state.arimaData.filter(x => x.month == item.monthNo)[0].forecast)
                    : null))
            })
        }
        //Arima
        if (this.state.arimaId && (this.state.nodeDataExtrapolation.extrapolationMethod == null || this.state.nodeDataExtrapolation.extrapolationMethod.id != 4)) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t('static.extrapolation.arima'),
                backgroundColor: 'transparent',
                borderColor: '#651D32',
                borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 4 ? 4 : 2,
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                pointHoverBackgroundColor: 'transparent',
                pointHoverBorderColor: 'transparent',
                // pointHoverBorderWidth: 2,
                // pointRadius: 1,
                pointHitRadius: 5,
                yValueFormatString: "###,###,###,###",
                data: this.state.jexcelDataArr.map((item, index) => (this.state.arimaData.filter(x => x.month == item.monthNo).length > 0 && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM') || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && (item.amount == "" || item.amount == null))) ? this.state.arimaData.filter(x => x.month == item.monthNo)[0].forecast : null))
                // data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0 ? this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast- this.state.CI : null))
            })
        }
        // arima Upper
        if (this.state.arimaId && (this.state.nodeDataExtrapolation.extrapolationMethod == null || this.state.nodeDataExtrapolation.extrapolationMethod.id != 4)) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t("static.extrapolation.arimaUpper"),
                backgroundColor: 'transparent',
                borderColor: '#651D32',
                borderStyle: 'dotted',
                borderDash: [10, 10],
                borderWidth: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod.id == 4 ? 4 : 2,
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                pointHoverBackgroundColor: 'transparent',
                pointHoverBorderColor: 'transparent',
                // pointHoverBorderWidth: 2,
                // pointRadius: 1,
                pointHitRadius: 5,
                yValueFormatString: "###,###,###,###",
                // data: this.state.tesData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? (item.forecast + this.state.CI).toFixed(4) : null))
                data: this.state.jexcelDataArr.map((item, index) => (this.state.arimaData.filter(x => x.month == item.monthNo).length > 0
                    && (moment(this.state.maxMonth).format('YYYY-MM') == moment(item.month).format('YYYY-MM')
                        || (moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM')
                            && (item.amount == "" || item.amount == null)))
                    ? (this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci != null
                        && this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci != ""
                        && this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci != undefined
                        ? ((this.state.arimaData.filter(x => x.month == item.monthNo)[0].forecast + this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci) < 0 ? 0 : (this.state.arimaData.filter(x => x.month == item.monthNo)[0].forecast + this.state.arimaData.filter(x => x.month == item.monthNo)[0].ci))
                        : this.state.arimaData.filter(x => x.month == item.monthNo)[0].forecast)
                    : null))
            })
        }
        console.log("datasets---", datasets);
        console.log("this.state.monthArray---", this.state.monthArray);
        let line = {};
        if (true) {
            line = {
                labels: this.state.monthArray.map(c => moment(c).format("MMM-YYYY")),
                datasets: datasets
            }
        }
        return (
            <div className="animated fadeIn">
                <CardBody className="pb-lg-2 pt-lg-0">
                    <div style={{ display: this.state.extrapolationLoader ? "none" : "block" }}>
                        <Formik
                            enableReinitialize={true}
                            initialValues={{
                                extrapolationMethodId: this.state.nodeDataExtrapolation != null && this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod != "" ? this.state.nodeDataExtrapolation.extrapolationMethod.id : "",
                                noOfMonthsId: this.state.monthsForMovingAverage,
                                confidenceLevelId: this.state.confidenceLevelId,
                                // seasonalityId: this.state.noOfMonthsForASeason,
                                gammaId: this.state.gamma,
                                betaId: this.state.beta,
                                alphaId: this.state.alpha,
                                pId: this.state.p,
                                dId: this.state.d,
                                qId: this.state.q
                                // treeName: this.state.curTreeObj.label.label_en,
                                // regionArray: this.state.regionList,
                                // regionId: this.state.regionValues,
                            }}
                            validate={validateExtrapolation(validationSchemaExtrapolation)}
                            onSubmit={(values, { setSubmitting, setErrors }) => {
                                console.log("Check validation Extrapolation Test123", this.checkValidationExtrapolation());
                                if (this.checkValidationExtrapolation()) {
                                    console.log("This.state.button flag Test123", this.state.buttonFalg);
                                    if (this.state.buttonFalg) {
                                        // console.log("In If check value gaps Test123", this.checkActualValuesGap(false));
                                        this.checkActualValuesGap(false);
                                    } else {
                                        // console.log("In else check value gaps Test123", this.checkActualValuesGap(true));
                                        this.checkActualValuesGap(true);
                                    }
                                    console.log("tree extrapolation on submit called Test123")
                                } else {
                                    console.log("tree extrapolation on submit not called Test123")
                                }
                            }}
                            render={
                                ({
                                    values,
                                    errors,
                                    touched,
                                    handleChange,
                                    handleBlur,
                                    handleSubmit,
                                    isSubmitting,
                                    isValid,
                                    setTouched,
                                    handleReset,
                                    setFieldValue,
                                    setFieldTouched
                                }) => (
                                    <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='userForm' autocomplete="off">
                                        {/* formik validation starts here */}
                                        <div className="row pt-lg-0" style={{ float: 'right', marginTop: '-42px' }}>
                                            <div className="row pl-lg-0 pr-lg-0">
                                                {/* <SupplyPlanFormulas ref="formulaeChild" /> */}
                                                <a className="">
                                                    <span onClick={() => { this.toggleShowGuidance() }} style={{ cursor: 'pointer', color: '20a8d8' }} ><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>

                                                </a>
                                            </div>
                                        </div>
                                        {/* <Form name='simpleForm'> */}
                                        <div className=" pl-0">
                                            <div className="row">
                                                <div>
                                                    <Popover placement="top" isOpen={this.state.popoverOpenStartMonth} target="Popover28" trigger="hover" toggle={this.toggleStartMonth}>
                                                        <PopoverBody>{i18n.t('static.tooltip.startMonthForHistoricData')}</PopoverBody>
                                                    </Popover>
                                                </div>
                                                <FormGroup className="col-md-3 pl-lg-0">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.tree.startMonthForHistoricData')}<i class="fa fa-info-circle icons pl-lg-2" id="Popover28" onClick={this.toggleStartMonth} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                    <div className="controls edit">
                                                        {/* <Picker

                                                            id="month"
                                                            name="month"
                                                            ref={this.pickAMonth1}
                                                            years={{ min: this.props.items.minDate, max: this.props.items.maxDate }}
                                                            value={{
                                                                year: new Date(this.props.items.currentScenario.month.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.props.items.currentScenario.month.replace(/-/g, '\/')).getMonth() + 1)).slice(-2)
                                                            }}
                                                            lang={pickerLang}
                                                        >
                                                            <MonthBox value={this.makeText({ year: new Date(this.props.items.currentScenario.month.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.props.items.currentScenario.month.replace(/-/g, '\/')).getMonth() + 1)).slice(-2) })}
                                                            />
                                                        </Picker> */}
                                                        <Picker
                                                            years={{ min: { year: 1001, month: new Date().getMonth() + 1 }, max: this.state.maxDateForHistoricalData }}
                                                            // ref={this.pickRange1}
                                                            ref={this.pickRange1}
                                                            value={rangeValue1}
                                                            lang={pickerLang}
                                                            key={JSON.stringify(rangeValue1)}
                                                            onDismiss={this.handleRangeDissmis1}
                                                            readOnly
                                                        >
                                                            <MonthBox value={makeText(rangeValue1.from) + ' ~ ' + makeText(rangeValue1.to)} onClick={this._handleClickRangeBox1} />
                                                        </Picker>
                                                    </div>
                                                </FormGroup>
                                                <div className="MarginTopCustformonth">
                                                    <Label>{this.state.monthsDiff} {i18n.t('static.report.month')}</Label>
                                                </div>
                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.common.forecastPeriod')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
                                                    <div className="controls edit">

                                                        <Picker
                                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                            ref={this.pickRange}
                                                            value={rangeValue}
                                                            lang={pickerLang}
                                                            // theme="light"
                                                            // onChange={this.handleRangeChange}
                                                            // onDismiss={this.handleRangeDissmis}
                                                            className="disabledColor"
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
                                            {/* formik validation starts here */}
                                            <div className="row">
                                                <FormGroup className="col-md-12 " style={{ display: "block" }}>
                                                    <div className="check inline pl-lg-3 pt-lg-2">
                                                        <div className="row pl-lg-1 pb-lg-2">
                                                            <div>
                                                                <Popover placement="top" isOpen={this.state.popoverOpenMa} target="Popover29" trigger="hover" toggle={this.toggleMa}>
                                                                    <PopoverBody>{i18n.t('static.tooltip.MovingAverages')}</PopoverBody>
                                                                </Popover>
                                                            </div>
                                                            <div>
                                                                <Input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id="movingAvgId"
                                                                    name="movingAvgId"
                                                                    checked={this.state.movingAvgId}
                                                                    value={this.state.movingAvgId}
                                                                    onClick={(e) => { this.setMovingAvgId(e); }}
                                                                />
                                                                <Label
                                                                    className="form-check-label"
                                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '2px' }}>
                                                                    <b>{i18n.t('static.extrapolation.movingAverages')}</b>
                                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover29" onClick={this.toggleMa} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                                </Label>
                                                            </div>
                                                            {/* {this.state.movingAvgId && */}
                                                            <div className="row col-md-12 pt-lg-2">
                                                                <div className="col-md-2 pl-lg-0 pt-lg-0" style={{ display: this.state.movingAvgId ? '' : 'none' }}>
                                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.noOfMonths')}</Label>
                                                                    <Input
                                                                        className="controls"
                                                                        type="number"
                                                                        bsSize="sm"
                                                                        id="noOfMonthsId"
                                                                        name="noOfMonthsId"
                                                                        step={1}
                                                                        value={this.state.monthsForMovingAverage}
                                                                        valid={!errors.noOfMonthsId && this.state.monthsForMovingAverage != null ? this.state.monthsForMovingAverage : '' != ''}
                                                                        invalid={touched.noOfMonthsId && !!errors.noOfMonthsId}
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => { handleChange(e); this.setMonthsForMovingAverage(e) }}
                                                                    />
                                                                    <FormFeedback>{errors.noOfMonthsId}</FormFeedback>
                                                                </div>
                                                            </div>
                                                            {/* } */}
                                                        </div>
                                                        <div className="row pl-lg-1 pb-lg-2">
                                                            <div>
                                                                <Popover placement="top" isOpen={this.state.popoverOpenSa} target="Popover31" trigger="hover" toggle={this.toggleSa}>
                                                                    <PopoverBody>{i18n.t('static.tooltip.SemiAverages')}</PopoverBody>
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
                                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '2px' }}>
                                                                    <b>{i18n.t('static.extrapolation.SemiAverages')}</b>
                                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover31" onClick={this.toggleSa} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                                </Label>
                                                            </div>
                                                        </div>
                                                        <div className="row pl-lg-1 pb-lg-2">
                                                            <div>
                                                                <Popover placement="top" isOpen={this.state.popoverOpenLr} target="Popover32" trigger="hover" toggle={this.toggleLr}>
                                                                    <PopoverBody>{i18n.t('static.tooltip.LinearRegression')}</PopoverBody>
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
                                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '2px' }}>
                                                                    <b>{i18n.t('static.extrapolation.linearRegression')}</b>
                                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover32" onClick={this.toggleLr} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                                </Label>

                                                            </div>
                                                            <div className="row col-md-12 pt-lg-2">
                                                                <div className="col-md-2 pl-lg-0 pt-lg-0" style={{ display: this.state.linearRegressionId ? '' : 'none' }}>
                                                                    <div>
                                                                        <Popover placement="top" isOpen={this.state.popoverOpenConfidenceLevel1} target="Popover60" trigger="hover" toggle={this.toggleConfidenceLevel1}>
                                                                            <PopoverBody>{i18n.t('static.tooltip.confidenceLevel')}</PopoverBody>
                                                                        </Popover>
                                                                    </div>
                                                                    {/* <div className="row col-md-12 pt-lg-2" style={{ display: this.state.linearRegressionId ? '' : 'none' }}>
                                                                <div className="col-md-2"> */}
                                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.confidenceLevel')}
                                                                        <i class="fa fa-info-circle icons pl-lg-2" id="Popover60" onClick={this.toggleConfidenceLevel1} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                                    </Label>
                                                                    <Input
                                                                        className="controls"
                                                                        type="select"
                                                                        bsSize="sm"
                                                                        id="confidenceLevelIdLinearRegression"
                                                                        name="confidenceLevelIdLinearRegression"
                                                                        value={this.state.confidenceLevelIdLinearRegression}
                                                                        valid={!errors.confidenceLevelIdLinearRegression && this.state.confidenceLevelIdLinearRegression != null ? this.state.confidenceLevelIdLinearRegression : '' != ''}
                                                                        invalid={touched.confidenceLevelIdLinearRegression && !!errors.confidenceLevelIdLinearRegression}
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => { handleChange(e); this.setConfidenceLevelIdLinearRegression(e) }}
                                                                    >
                                                                        <option value="0.85">85%</option>
                                                                        <option value="0.90">90%</option>
                                                                        <option value="0.95">95%</option>
                                                                        <option value="0.99">99%</option>
                                                                        <option value="0.995">99.5%</option>
                                                                        <option value="0.999">99.9%</option>
                                                                    </Input>
                                                                    <FormFeedback>{errors.confidenceLevelIdLinearRegression}</FormFeedback>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row pl-lg-1 pb-lg-2">
                                                            <div>
                                                                <Popover placement="top" isOpen={this.state.popoverOpenTes} target="Popover33" trigger="hover" toggle={this.toggleTes}>
                                                                    <PopoverBody>{i18n.t('static.tooltip.Tes')}</PopoverBody>
                                                                </Popover>
                                                            </div>
                                                            <div className="pt-lg-2">
                                                                <Input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id="smoothingId"
                                                                    name="smoothingId"
                                                                    checked={this.state.smoothingId}
                                                                    value={this.state.smoothingId}
                                                                    onClick={(e) => { this.setSmoothingId(e); }}
                                                                />
                                                                <Label
                                                                    className="form-check-label"
                                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '2px' }}>
                                                                    <b>{i18n.t('static.tree.tripleExponentialSmoothing')}</b>
                                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover33" onClick={this.toggleTes} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                                </Label>
                                                            </div>
                                                            <div className="row col-md-12 pt-lg-2 pl-lg-0" style={{ display: this.state.smoothingId ? '' : 'none' }}>
                                                                <div>
                                                                    <Popover placement="top" isOpen={this.state.popoverOpenConfidenceLevel} target="Popover34" trigger="hover" toggle={this.toggleConfidenceLevel}>
                                                                        <PopoverBody>{i18n.t('static.tooltip.confidenceLevel')}</PopoverBody>
                                                                    </Popover>
                                                                </div>
                                                                <div className="pt-lg-0 pl-lg-0" style={{ display: 'contents' }}>
                                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.confidenceLevel')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover34" onClick={this.toggleConfidenceLevel} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                        <Input
                                                                            className="controls"
                                                                            type="select"
                                                                            bsSize="sm"
                                                                            id="confidenceLevelId"
                                                                            name="confidenceLevelId"
                                                                            value={this.state.confidenceLevelId}
                                                                            valid={!errors.confidenceLevelId && this.state.confidenceLevelId != null ? this.state.confidenceLevelId : '' != ''}
                                                                            invalid={touched.confidenceLevelId && !!errors.confidenceLevelId}
                                                                            onBlur={handleBlur}
                                                                            onChange={(e) => { handleChange(e); this.setConfidenceLevelId(e) }}

                                                                        >
                                                                            {/* <option value="">Please select confidence level</option> */}
                                                                            <option value="0.80">80%</option>
                                                                            <option value="0.85">85%</option>
                                                                            <option value="0.90">90%</option>
                                                                            <option value="0.95">95%</option>
                                                                            <option value="0.99">99%</option>
                                                                            <option value="0.995">99.5%</option>
                                                                            <option value="0.999">99.9%</option>
                                                                        </Input>
                                                                        <FormFeedback>{errors.confidenceLevelId}</FormFeedback>
                                                                    </div>
                                                                    {/* <Popover placement="top" isOpen={this.state.popoverOpenSeasonality} target="Popover35" trigger="hover" toggle={this.toggleSeasonality}>
                                                                        <PopoverBody>{i18n.t('static.tooltip.seasonality')}</PopoverBody>
                                                                    </Popover>
                                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.seasonality')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover35" onClick={this.toggleSeasonality} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                        <Input
                                                                            className="controls"
                                                                            type="number"
                                                                            bsSize="sm"
                                                                            id="seasonalityId"
                                                                            name="seasonalityId"
                                                                            min={1}
                                                                            max={24}
                                                                            step={1}
                                                                            value={this.state.noOfMonthsForASeason}
                                                                            valid={!errors.seasonalityId && this.state.noOfMonthsForASeason != null ? this.state.noOfMonthsForASeason : '' != ''}
                                                                            invalid={touched.seasonalityId && !!errors.seasonalityId}
                                                                            onBlur={handleBlur}
                                                                            onChange={(e) => { handleChange(e); this.setSeasonals(e) }}
                                                                        />
                                                                        <FormFeedback>{errors.seasonalityId}</FormFeedback>
                                                                    </div> */}
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
                                                                    <Popover placement="top" isOpen={this.state.popoverOpenAlpha} target="Popover36" trigger="hover" toggle={this.toggleAlpha}>
                                                                        <PopoverBody>{i18n.t('static.tooltip.alpha')}</PopoverBody>
                                                                    </Popover>
                                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.alpha')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover36" onClick={this.toggleAlpha} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                        <Input
                                                                            className="controls"
                                                                            type="number"
                                                                            id="alphaId"
                                                                            bsSize="sm"
                                                                            name="alphaId"
                                                                            min={0}
                                                                            max={1}
                                                                            step={0.1}
                                                                            value={this.state.alpha}
                                                                            valid={!errors.alphaId && this.state.alpha != null ? this.state.alpha : '' != ''}
                                                                            invalid={touched.alphaId && !!errors.alphaId}
                                                                            onBlur={handleBlur}
                                                                            onChange={(e) => { handleChange(e); this.setAlpha(e) }}
                                                                        />
                                                                        <FormFeedback>{errors.alphaId}</FormFeedback>
                                                                    </div>
                                                                    <Popover placement="top" isOpen={this.state.popoverOpenBeta} target="Popover37" trigger="hover" toggle={this.toggleBeta}>
                                                                        <PopoverBody>{i18n.t('static.tooltip.beta')}</PopoverBody>
                                                                    </Popover>
                                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.beta')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover37" onClick={this.toggleBeta} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                        <Input
                                                                            className="controls"
                                                                            type="number"
                                                                            id="betaId"
                                                                            bsSize="sm"
                                                                            name="betaId"
                                                                            min={0}
                                                                            max={1}
                                                                            step={0.1}
                                                                            value={this.state.beta}
                                                                            valid={!errors.betaId && this.state.beta != null ? this.state.beta : '' != ''}
                                                                            invalid={touched.betaId && !!errors.betaId}
                                                                            onBlur={handleBlur}
                                                                            onChange={(e) => { handleChange(e); this.setBeta(e) }}
                                                                        />
                                                                        <FormFeedback>{errors.betaId}</FormFeedback>
                                                                    </div>
                                                                    <Popover placement="top" isOpen={this.state.popoverOpenGamma} target="Popover38" trigger="hover" toggle={this.toggleGamma}>
                                                                        <PopoverBody>{i18n.t('static.tooltip.gamma')}</PopoverBody>
                                                                    </Popover>
                                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.gamma')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover38" onClick={this.toggleGamma} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                        <Input
                                                                            className="controls"
                                                                            type="number"
                                                                            bsSize="sm"
                                                                            id="gammaId"
                                                                            name="gammaId"
                                                                            min={0}
                                                                            max={1}
                                                                            step={0.1}
                                                                            value={this.state.gamma}
                                                                            valid={!errors.gammaId && this.state.gamma != null ? this.state.gamma : '' != ''}
                                                                            invalid={touched.gammaId && !!errors.gammaId}
                                                                            onBlur={handleBlur}
                                                                            onChange={(e) => { handleChange(e); this.setGamma(e) }}
                                                                        />
                                                                        <FormFeedback>{errors.gammaId}</FormFeedback>
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row pl-lg-1 pb-lg-2">
                                                            <div>
                                                                <Popover placement="top" isOpen={this.state.popoverOpenArima} target="Popover39" trigger="hover" toggle={this.toggleArima}>
                                                                    <PopoverBody>{i18n.t('static.tooltip.arima')}</PopoverBody>
                                                                </Popover>
                                                            </div>
                                                            <div className="pt-lg-2">
                                                                <Input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id="arimaId"
                                                                    name="arimaId"
                                                                    checked={this.state.arimaId}
                                                                    value={this.state.arimaId}
                                                                    onClick={(e) => { this.setArimaId(e); }}
                                                                />
                                                                <Label
                                                                    className="form-check-label"
                                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '2px' }}>
                                                                    <b>{i18n.t('static.extrapolation.arimaFull')}</b>
                                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover39" onClick={this.toggleArima} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                                </Label>
                                                            </div>
                                                            {/* {this.state.arimaId && */}
                                                            <div className="row col-md-12 pt-lg-2 pl-lg-0" style={{ display: this.state.arimaId ? '' : 'none' }}>
                                                                {/* <div className="row col-md-12 pt-lg-2 pl-lg-0"> */}
                                                                <div className="pt-lg-0" style={{ display: 'contents' }}>
                                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.confidenceLevel')} </Label>
                                                                        <Input
                                                                            className="controls"
                                                                            type="select"
                                                                            bsSize="sm"
                                                                            id="confidenceLevelIdArima"
                                                                            name="confidenceLevelIdArima"
                                                                            value={this.state.confidenceLevelIdArima}
                                                                            valid={!errors.confidenceLevelIdArima && this.state.confidenceLevelIdArima != null ? this.state.confidenceLevelIdArima : '' != ''}
                                                                            invalid={touched.confidenceLevelIdArima && !!errors.confidenceLevelIdArima}
                                                                            onBlur={handleBlur}
                                                                            onChange={(e) => { handleChange(e); this.setConfidenceLevelIdArima(e) }}
                                                                        >
                                                                            <option value="0.85">85%</option>
                                                                            <option value="0.90">90%</option>
                                                                            <option value="0.95">95%</option>
                                                                            <option value="0.99">99%</option>
                                                                            <option value="0.995">99.5%</option>
                                                                            <option value="0.999">99.9%</option>
                                                                        </Input>
                                                                        <FormFeedback>{errors.confidenceLevelIdArima}</FormFeedback>
                                                                    </div>
                                                                    <Popover placement="top" isOpen={this.state.popoverOpenP} target="Popover41" trigger="hover" toggle={this.toggleP}>
                                                                        <PopoverBody>{i18n.t('static.tooltip.p')}</PopoverBody>
                                                                    </Popover>
                                                                    <div className="pt-lg-0" style={{ display: 'contents' }}>
                                                                        <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.p')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover41" onClick={this.toggleP} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                            <Input
                                                                                className="controls"
                                                                                type="number"
                                                                                id="pId"
                                                                                bsSize="sm"
                                                                                name="pId"
                                                                                value={this.state.p}
                                                                                valid={!errors.pId && this.state.p != null ? this.state.p : '' != ''}
                                                                                invalid={touched.pId && !!errors.pId}
                                                                                onBlur={handleBlur}
                                                                                onChange={(e) => { handleChange(e); this.setPId(e) }}
                                                                            />
                                                                            <FormFeedback>{errors.pId}</FormFeedback>
                                                                        </div>
                                                                        <Popover placement="top" isOpen={this.state.popoverOpenD} target="Popover42" trigger="hover" toggle={this.toggleD}>
                                                                            <PopoverBody>{i18n.t('static.tooltip.d')}</PopoverBody>
                                                                        </Popover>
                                                                        <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.d')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover42" onClick={this.toggleD} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                            <Input
                                                                                className="controls"
                                                                                type="number"
                                                                                id="dId"
                                                                                bsSize="sm"
                                                                                name="dId"
                                                                                value={this.state.d}
                                                                                valid={!errors.dId && this.state.d != null ? this.state.d : '' != ''}
                                                                                invalid={touched.dId && !!errors.dId}
                                                                                onBlur={handleBlur}
                                                                                onChange={(e) => { handleChange(e); this.setDId(e) }}
                                                                            />
                                                                            <FormFeedback>{errors.dId}</FormFeedback>
                                                                        </div>
                                                                        <Popover placement="top" isOpen={this.state.popoverOpenQ} target="Popover43" trigger="hover" toggle={this.toggleQ}>
                                                                            <PopoverBody>{i18n.t('static.tooltip.q')}</PopoverBody>
                                                                        </Popover>
                                                                        <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                                            <Label htmlFor="appendedInputButton">q <i class="fa fa-info-circle icons pl-lg-2" id="Popover43" onClick={this.toggleQ} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                            <Input
                                                                                className="controls"
                                                                                type="number"
                                                                                id="qId"
                                                                                bsSize="sm"
                                                                                name="qId"
                                                                                value={this.state.q}
                                                                                valid={!errors.qId && this.state.q != null ? this.state.q : '' != ''}
                                                                                invalid={touched.qId && !!errors.qId}
                                                                                onBlur={handleBlur}
                                                                                onChange={(e) => { handleChange(e); this.setQId(e) }}
                                                                            />
                                                                            <FormFeedback>{errors.qId}</FormFeedback>
                                                                        </div>
                                                                        <div className="tab-ml-1 ml-lg-5 ExtraCheckboxFieldWidth" style={{ marginTop: '38px' }}>
                                                                            <Input
                                                                                className="form-check-input checkboxMargin"
                                                                                type="checkbox"
                                                                                id="seasonality"
                                                                                name="seasonality"
                                                                                // checked={true}
                                                                                checked={this.state.seasonality}
                                                                                onClick={(e) => { this.seasonalityCheckbox(e); }}
                                                                            />
                                                                            <Label
                                                                                className="form-check-label"
                                                                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                                                <b>{i18n.t('static.extrapolation.seasonality')}</b>
                                                                            </Label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {/* } */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </FormGroup>
                                            </div>

                                            <div className="col-md-12 row text-left pt-lg-0 pl-lg-0">

                                                <div className="col-md-6 pl-lg-0">
                                                    <h5 className={"red"} id="div9">{this.state.noDataMessage}</h5>
                                                    {!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_VIEW_TREE') && <>
                                                        <Button type="button" color="success" className="float-left mr-1" size="md" onClick={this.interpolate}>{i18n.t('static.tree.interpolate')}</Button>
                                                        <Button type="submit" id="extrapolateButton" size="md" color="info" className="float-left mr-1" onClick={() => this.touchAllExtrapolation(setTouched, errors, 0)}><i className="fa fa-calculator"></i> {i18n.t('static.tree.extrapolate')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-left mr-1" onClick={() => { this.resetExtrapolation()}} ><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>    
                                                        </>}
                                                </div>
                                                <div className="col-md-6 pr-lg-0">
                                                    <Button className="btn btn-info btn-md float-right" onClick={this.toggleJexcelData}>
                                                        <i className={this.state.showJexcelData ? "fa fa-eye-slash" : "fa fa-eye"} style={{ color: '#fff' }}></i> {this.state.showJexcelData ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                                                    </Button>
                                                    {/* <Button className="mr-1 btn btn-info btn-md " onClick={this.toggleJexcelData}>
                                                    {this.state.showJexcelData ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                                                </Button> */}
                                                </div>
                                            </div>

                                        </div>
                                        {/* </Form> */}
                                        <div className="row pl-lg-0 pr-lg-0 pt-lg-3" style={{ display: this.state.showJexcelData ? 'block' : 'none' }}>
                                            <div className="col-md-6">
                                                {/* <Button type="button" size="md" color="info" className="float-left mr-1" onClick={this.resetTree}>{'Show/hide data'}</Button> */}
                                            </div>
                                            <div className="col-md-6 float-right" style={{ marginTop: '0px' }}>
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
                                        <div className="row pl-lg-0 pr-lg-0 extrapolateTable consumptionDataEntryTable" style={{ display: this.state.showJexcelData ? 'block' : 'none' }}>
                                            <div id="tableDiv" className=""></div>
                                        </div>
                                        {/* Graph */}
                                        <div className="row">
                                            <div className="col-md-12 pt-lg-4 pl-lg-0 pr-lg-0">
                                                <div className="chart-wrapper chart-graph-report pl-0 ml-0" style={{ marginLeft: '50px' }}>
                                                    <Line id="cool-canvas" data={line} options={options} />
                                                    <div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row pl-lg-0 pr-lg-0">

                                            <div className="">
                                                <div className="table-wrap table-responsive">
                                                    <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                                        <thead>
                                                            <tr>

                                                                <td width="150px" className="text-left" title={i18n.t('static.tooltip.errors')}><b>{i18n.t('static.common.errors')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover44" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                {this.state.movingAvgId &&
                                                                    <td width="150px" title={i18n.t('static.tooltip.MovingAverages')}><b>{i18n.t('static.extrapolation.movingAverages')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover44" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                }
                                                                {this.state.semiAvgId &&
                                                                    <td width="150px" title={i18n.t('static.tooltip.SemiAverages')}><b>{i18n.t('static.extrapolation.semiAverages')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover46" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                }
                                                                {this.state.linearRegressionId &&
                                                                    <td width="150px" title={i18n.t('static.tooltip.LinearRegression')}><b>{i18n.t('static.extrapolation.linearRegression')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover47" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                }
                                                                {this.state.smoothingId &&
                                                                    <td width="150px" title={i18n.t('static.tooltip.Tes')}><b>{i18n.t('static.extrapolation.tes')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover48" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                }
                                                                {this.state.arimaId &&
                                                                    <td width="150px" title={i18n.t('static.tooltip.arima')}><b>{i18n.t('static.extrapolation.arima')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover49" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                }
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td className="text-left">{i18n.t('static.extrapolation.rmse')}</td>
                                                                {this.state.movingAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minRmse == this.state.movingAvgError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse == this.state.movingAvgError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.rmse != "" ? addCommasExtrapolation(this.state.movingAvgError.rmse.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.semiAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minRmse == this.state.semiAvgError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse == this.state.semiAvgError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.rmse != "" ? addCommasExtrapolation(this.state.semiAvgError.rmse.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.linearRegressionId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minRmse == this.state.linearRegressionError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse == this.state.linearRegressionError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.rmse != "" ? addCommasExtrapolation(this.state.linearRegressionError.rmse.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.smoothingId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minRmse == this.state.tesError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse == this.state.tesError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.rmse != "" ? addCommasExtrapolation(this.state.tesError.rmse.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.arimaId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minRmse == this.state.arimaError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse == this.state.arimaError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.arimaError.rmse != "" ? addCommasExtrapolation(this.state.arimaError.rmse.toFixed(4).toString()) : ""}</td>
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td className="text-left">{i18n.t('static.extrapolation.mape')}</td>
                                                                {this.state.movingAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMape == this.state.movingAvgError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape == this.state.movingAvgError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.mape != "" ? addCommasExtrapolation(this.state.movingAvgError.mape.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.semiAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMape == this.state.semiAvgError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape == this.state.semiAvgError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.mape != "" ? addCommasExtrapolation(this.state.semiAvgError.mape.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.linearRegressionId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMape == this.state.linearRegressionError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape == this.state.linearRegressionError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.mape != "" ? addCommasExtrapolation(this.state.linearRegressionError.mape.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.smoothingId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMape == this.state.tesError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape == this.state.tesError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.mape != "" ? addCommasExtrapolation(this.state.tesError.mape.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.arimaId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMape == this.state.arimaError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape == this.state.arimaError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.arimaError.mape != "" ? addCommasExtrapolation(this.state.arimaError.mape.toFixed(4).toString()) : ""}</td>
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td className="text-left">{i18n.t('static.extrapolation.mse')}</td>
                                                                {this.state.movingAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMse == this.state.movingAvgError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse == this.state.movingAvgError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.mse != "" ? addCommasExtrapolation(this.state.movingAvgError.mse.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.semiAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMse == this.state.semiAvgError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse == this.state.semiAvgError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.mse != "" ? addCommasExtrapolation(this.state.semiAvgError.mse.toFixed(4)) : ""}</td>
                                                                }
                                                                {this.state.linearRegressionId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMse == this.state.linearRegressionError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse == this.state.linearRegressionError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.mse != "" ? addCommasExtrapolation(this.state.linearRegressionError.mse.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.smoothingId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMse == this.state.tesError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse == this.state.tesError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.mse != "" ? addCommasExtrapolation(this.state.tesError.mse.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.arimaId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMse == this.state.arimaError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse == this.state.arimaError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.arimaError.mse != "" ? addCommasExtrapolation(this.state.arimaError.mse.toFixed(4).toString()) : ""}</td>
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td className="text-left">{i18n.t('static.extrapolation.wape')}</td>
                                                                {this.state.movingAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minWape == this.state.movingAvgError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape == this.state.movingAvgError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.wape != "" ? addCommasExtrapolation(this.state.movingAvgError.wape.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.semiAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minWape == this.state.semiAvgError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape == this.state.semiAvgError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.wape != "" ? addCommasExtrapolation(this.state.semiAvgError.wape.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.linearRegressionId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minWape == this.state.linearRegressionError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape == this.state.linearRegressionError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.wape != "" ? addCommasExtrapolation(this.state.linearRegressionError.wape.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.smoothingId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minWape == this.state.tesError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape == this.state.tesError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.wape != "" ? addCommasExtrapolation(this.state.tesError.wape.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.arimaId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minWape == this.state.arimaError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape == this.state.arimaError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.arimaError.wape != "" ? addCommasExtrapolation(this.state.arimaError.wape.toFixed(4).toString()) : ""}</td>
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td className="text-left">{i18n.t('static.extrapolation.rSquare')}</td>
                                                                {this.state.movingAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.maxRsqd == this.state.movingAvgError.rSqd ? "bold" : "normal" }} bgcolor={this.state.maxRsqd == this.state.movingAvgError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.rSqd != "" ? addCommasExtrapolation(this.state.movingAvgError.rSqd.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.semiAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.maxRsqd == this.state.semiAvgError.rSqd ? "bold" : "normal" }} bgcolor={this.state.maxRsqd == this.state.semiAvgError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.rSqd != "" ? addCommasExtrapolation(this.state.semiAvgError.rSqd.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.linearRegressionId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.maxRsqd == this.state.linearRegressionError.rSqd ? "bold" : "normal" }} bgcolor={this.state.maxRsqd == this.state.linearRegressionError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.rSqd != "" ? addCommasExtrapolation(this.state.linearRegressionError.rSqd.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.smoothingId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.maxRsqd == this.state.tesError.rSqd ? "bold" : "normal" }} bgcolor={this.state.maxRsqd == this.state.tesError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.rSqd != "" ? addCommasExtrapolation(this.state.tesError.rSqd.toFixed(4).toString()) : ""}</td>
                                                                }
                                                                {this.state.arimaId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.maxRsqd == this.state.arimaError.rSqd ? "bold" : "normal" }} bgcolor={this.state.maxRsqd == this.state.arimaError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.arimaError.rSqd != "" ? addCommasExtrapolation(this.state.arimaError.rSqd.toFixed(4).toString()) : ""}</td>
                                                                }
                                                            </tr>
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12 row pl-lg-0  pr-lg-0 pt-lg-3 pb-lg-3">
                                            <ul className="legendcommitversion pl-lg-0">
                                                <li><span className="lowestErrorGreenLegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.extrapolation.lowestError')}</span></li>
                                                <li><span className="lowestErrorGreenLegend legendcolor"></span> <span className="legendcommitversionText">Highest R^2</span></li>
                                            </ul>
                                        </div>
                                        <Input type="hidden" id="buttonFalg" name="buttonFalg" value={this.state.buttonFalg} />
                                        <div className="col-md-12 pl-lg-0 pr-lg-0">
                                            <Row>
                                                <FormGroup className="col-md-3 pl-lg-0">
                                                    <Label htmlFor="currencyId">{i18n.t('static.common.chooseMethod')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover51" onClick={this.toggleChooseMethod} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                    {/* <InputGroup> */}
                                                    <Input
                                                        type="select"
                                                        name="extrapolationMethodId"
                                                        id="extrapolationMethodId"
                                                        bsSize="sm"
                                                        valid={!errors.extrapolationMethodId && this.state.nodeDataExtrapolation != null && this.state.nodeDataExtrapolation.extrapolationMethod != null ? this.state.nodeDataExtrapolation.extrapolationMethod.id : "" != ""}
                                                        invalid={touched.extrapolationMethodId && !!errors.extrapolationMethodId}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => { handleChange(e); this.extrapolationMethodChange(e) }}
                                                        required
                                                        value={this.state.nodeDataExtrapolation != null && this.state.nodeDataExtrapolation.extrapolationMethod != null ? this.state.nodeDataExtrapolation.extrapolationMethod.id : ""}
                                                    >
                                                        <option value="">{i18n.t('static.option.extrapolationMethod')}</option>
                                                        {extrapolationMethods}
                                                    </Input>

                                                    {/* </InputGroup> */}
                                                    <FormFeedback>{errors.extrapolationMethodId}</FormFeedback>
                                                </FormGroup>
                                                <div>
                                                    <Popover placement="top" isOpen={this.state.popoverOpenChooseMethod} target="Popover51" trigger="hover" toggle={this.toggleChooseMethod}>
                                                        <PopoverBody>{i18n.t('static.tooltip.ChooseMethod')}</PopoverBody>
                                                    </Popover>
                                                </div>
                                                <FormGroup className="col-md-5">
                                                    <Label htmlFor="currencyId">{i18n.t('static.ManageTree.Notes')}</Label>
                                                    <InputGroup>
                                                        <Input
                                                            type="textarea"
                                                            name="notesExtrapolation"
                                                            id="notesExtrapolation"
                                                            bsSize="sm"
                                                            value={this.state.nodeDataExtrapolation != null ? this.state.nodeDataExtrapolation.notes : ''}
                                                            onChange={(e) => { this.changeNotes(e.target.value) }}
                                                        ></Input>

                                                    </InputGroup>

                                                </FormGroup>
                                                <FormGroup className="pl-lg-3 ExtrapolateSaveBtn">
                                                    {this.state.isChanged && !this.state.dataChanged && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_VIEW_TREE') && <Button type="submit" color="success" onClick={() => this.touchAllExtrapolation(setTouched, errors, 1)} className="mr-1 float-right" size="md"><i className="fa fa-check"></i>{i18n.t('static.pipeline.save')}</Button>}
                                                </FormGroup>
                                            </Row>
                                            {!this.state.dataChanged || !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_VIEW_TREE') && <Row>{this.state.dataChanged && <div class="red">{i18n.t('static.message.treeExtrapolationSave')}</div>}</Row>}
                                        </div>
                                    </Form>
                                )} />
                        {/* formik validation ends here */}
                    </div>
                    <div style={{ display: this.state.extrapolationLoader ? "block" : "none" }}>
                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                            <div class="align-items-center">
                                <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                <div class="spinner-border blue ml-4" role="status">

                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody >
                <Modal isOpen={this.state.showGuidance}
                    className={'modal-lg ' + this.props.className} >
                    <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
                        <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
                    </ModalHeader>
                    <div>
                        <ModalBody className="ModalBodyPadding">
                            <div dangerouslySetInnerHTML={{
                                __html: localStorage.getItem('lang') == 'en' ?
                                    showguidanceTreeExtrapolationEn :
                                    localStorage.getItem('lang') == 'fr' ?
                                        showguidanceTreeExtrapolationFr :
                                        localStorage.getItem('lang') == 'sp' ?
                                            showguidanceTreeExtrapolationSp :
                                            showguidanceTreeExtrapolationPr
                            }} />
                            {/* <div>
                                <h3 className='ShowGuidanceHeading'>{i18n.t('static.extrapolation.ExtrapolationNode')}</h3>
                            </div>
                            <p>
                                <p style={{ fontSize: '14px' }}><span className="UnderLineText">{i18n.t('static.listTree.purpose')} :</span>{i18n.t('static.extrapolation.ExtrapolationTabAllowUser')} '<a href="/#/Extrapolation/extrapolateData" target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.dashboard.extrapolation')}</a>' {i18n.t('static.extrapolation.ExtrapolationMethods')}
                                </p>

                            </p>
                            <p>
                                <p style={{ fontSize: '14px' }}><span className="UnderLineText">{i18n.t('static.ModelingTransfer.UsingThisTab')}:  </span></p>
                                <p className='pl-lg-4'>
                                    <ol type="1">
                                        <li>{i18n.t('static.extrapolation.EnterActualValues')}</li>
                                        <li>{i18n.t('static.extrapolation.MissingData')}</li>
                                        <li>{i18n.t('static.extrapolation.OptionalTopScreen')}</li>
                                        <li>{i18n.t('static.extrapolation.ClickExtrapolate')} </li>

                                        <p className="pl-lg-4"><b>{i18n.t('static.versionSettings.note')}:</b>  {i18n.t('static.extrapolation.MinimumValues')}:<br></br>
                                            <span className="ml-lg-5">* {i18n.t('static.extrapolation.TESHoltWinters')}:  {i18n.t('static.extrapolation.ActualConsumption')}<br></br></span>
                                            <span className="ml-lg-5">* {i18n.t('static.extrapolation.ARIMA')}: {i18n.t('static.extrapolation.Seasonality')} : {i18n.t('static.extrapolation.WithoutSeasonality')}<br></br></span>
                                            <span className="ml-lg-5">* {i18n.t('static.extrapolation.MovingAverage')}</span>
                                        </p>
                                        <li>{i18n.t('static.extrapolation.ExtrapolatedValues')}</li>
                                        <li>{i18n.t('static.extrapolation.AfterReviewing')}
                                        </li>
                                    </ol>
                                </p>
                            </p> */}
                        </ModalBody>
                    </div>
                </Modal>

            </div >
        )
    }
}