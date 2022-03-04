import React from "react";
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import i18n from '../../i18n';
import { Row, Col, Card, CardFooter, Button, Table, CardBody, Form, Modal, ModalBody, PopoverBody, Popover, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, InputGroupAddon, Collapse, InputGroupText, InputGroup } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import { INDEXED_DB_VERSION, INDEXED_DB_NAME, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_DECIMAL_MONTHLY_CHANGE, JEXCEL_DECIMAL_NO_REGEX_LONG } from "../../Constants";
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
import { calculateTES } from '../Extrapolation/TES';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { JEXCEL_INTEGER_REGEX } from '../../Constants.js'

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
        seasonalityId:
            Yup.string().test('seasonalityId', 'Please enter positive number.',
                function (value) {
                    console.log("***3**", document.getElementById("smoothingId").value);
                    var testNumber = document.getElementById("seasonalityId").value != "" ? JEXCEL_INTEGER_REGEX.test(document.getElementById("seasonalityId").value) : false;
                    // console.log("*****", testNumber);
                    if ((document.getElementById("smoothingId").value) == "true" && (document.getElementById("seasonalityId").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        gammaId:
            Yup.string().test('gammaId', 'Please enter correct gamma value.',
                function (value) {
                    console.log("***4**", document.getElementById("smoothingId").value);
                    var testNumber = document.getElementById("gammaId").value != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(document.getElementById("gammaId").value) : false;
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
                    var testNumber = document.getElementById("betaId").value != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(document.getElementById("betaId").value) : false;
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
                    var testNumber = document.getElementById("alphaId").value != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(document.getElementById("alphaId").value) : false;
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
                    var testNumber = document.getElementById("pId").value != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(document.getElementById("pId").value) : false;
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
                    var testNumber = document.getElementById("dId").value != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(document.getElementById("dId").value) : false;
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
                    var testNumber = document.getElementById("qId").value != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(document.getElementById("qId").value) : false;
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
        extrapolationMethodId: Yup.string()
            .required('Please select extrapolation method.'),

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
export default class TreeExtrapolationComponent extends React.Component {
    constructor(props) {
        super(props);
        this.pickRange = React.createRef();
        this.pickRange1 = React.createRef();
        var startDate = moment("2021-05-01").format("YYYY-MM-DD");
        var endDate = moment("2022-02-01").format("YYYY-MM-DD")
        this.state = {
            extrapolationLoader: true,
            forecastNestedHeader: '5',
            filteredExtrapolationMethodList: [],
            minMonth: '',
            monthsForMovingAverage: 5,
            confidenceLevelId: 0.95,
            noOfMonthsForASeason: 12,
            movingAvgData: [],
            alpha: 0.2,
            beta: 0.2,
            gamma: 0.2,
            p: 95,
            d: 12,
            q: 12,
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
            movingAvgId: false,
            semiAvgId: false,
            linearRegressionId: false,
            smoothingId: false,
            arimaId: false,
            // movingAvgId: true,
            // semiAvgId: true,
            // linearRegressionId: true,
            // smoothingId: true,
            // arimaId: true,
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
        this.checkValidationExtrapolation = this.checkValidationExtrapolation.bind(this);
        this.calculateExtrapolatedData = this.calculateExtrapolatedData.bind(this);
        this.changeNotes = this.changeNotes.bind(this);
        this.checkActualValuesGap = this.checkActualValuesGap.bind(this);
        // this.buildExtrapolationMom = this.buildExtrapolationMom.bind(this);
        // this.updateState = this.updateState.bind(this);
    }

    checkActualValuesGap(type) {
        this.setState({ extrapolationLoader: true }, () => {
            setTimeout(() => {
                var jexcelDataArr = [];
                var tableJson = this.state.dataExtrapolation.getJson(null, false);
                for (var i = 0; i < tableJson.length; i++) {
                    var map1 = new Map(Object.entries(tableJson[i]));
                    var json = {
                        month: map1.get("0"),
                        amount: map1.get("1") != "" ? map1.get("1").toString().replaceAll(",", "") : map1.get("1"),
                        reportingRate: map1.get("2") != "" ? map1.get("2").toString().replaceAll("%", "") : map1.get("2")
                    }
                    jexcelDataArr.push(json);
                }
                console.log("jexcel data 2---", jexcelDataArr);
                var dataList = jexcelDataArr.filter(c => c.amount > 0)
                    .sort(function (a, b) {
                        return new Date(a.month) - new Date(b.month);
                    });
                console.log("gap2---", dataList)
                // console.log(moment(monthArray[j]).format("YYYY-MM") + " " + "startValList---", startValList);
                // var endValList = jexcelDataArr.filter(c => moment(c.month).format("YYYY-MM") > moment(monthArray[j]).format("YYYY-MM") && c.amount > 0)
                //     .sort(function (a, b) {
                //         return new Date(a.month) - new Date(b.month);
                //     });
                var result = jexcelDataArr.filter(c => moment(c.month).format("YYYY-MM") > moment(dataList[0].month).format("YYYY-MM") && moment(c.month).format("YYYY-MM") < moment(dataList[dataList.length - 1].month).format("YYYY-MM") && (c.amount == 0 || c.amount == ''))
                console.log("dataList[0]---", dataList[0]);
                console.log("dataList[dataList.length - 1]---", dataList[dataList.length - 1]);
                console.log("gap3---", moment('2021-02-01').isBetween(dataList[0], dataList[dataList.length - 1]))
                console.log("gap4---", jexcelDataArr.filter(c => c.amount == '' && moment(c.month).isBetween(dataList[0], dataList[dataList.length - 1], null)))
                if (result.length > 0) {
                    this.setState({ extrapolationLoader: false }, () => {
                        setTimeout(() => {
                            alert("Please fill in the blank actual values or interpolate.")
                        }, 0);
                    });
                }
                else {
                    if (type) {
                        this.calculateExtrapolatedData(false);
                    } else {
                        this.buildExtrapolationMom();
                    }
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

        var extrapolationDataList = [];
        var momList = [];
        var tableJson = this.state.dataExtrapolation.getJson(null, false);
        for (var i = 0; i < tableJson.length; i++) {
            var map1 = new Map(Object.entries(tableJson[i]));
            var json = {
                month: map1.get("0"),
                amount: map1.get("1"),
                reportingRate: map1.get("2") != "" ? map1.get("2").toString().replaceAll("%", "") : map1.get("2")
            };
            extrapolationDataList.push(json)
            var json2 = {
                calculatedValue: map1.get("11"),
                difference: 0,
                endValue: map1.get("11"),
                endValueWMC: map1.get("11"),
                manualChange: map1.get("10"),
                month: map1.get("0"),
                seasonalityPerc: 0,
                startValue: map1.get("1")
            };
            momList.push(json2);
        }
        const { nodeDataExtrapolation } = this.state;
        nodeDataExtrapolation.extrapolationDataList = extrapolationDataList;
        var nodeDataExtrapolationOptionList = [];
        var filteredExtrapolationMethodList = this.state.filteredExtrapolationMethodList;
        var json;
        for (let i = 0; i < filteredExtrapolationMethodList.length; i++) {
            //Moving averages
            if (filteredExtrapolationMethodList[i].id == 7) {
                json = {
                    extrapolationMethod: { id: 7 },
                    jsonProperties: {
                        months: this.state.monthsForMovingAverage
                    }
                }
                // json1 = this.state.extrapolationMethodList.filter(c => c.id == 7)[0];
                nodeDataExtrapolationOptionList.push(json);
            }
            // Semi averages
            if (filteredExtrapolationMethodList[i].id == 6) {
                json = {
                    extrapolationMethod: { id: 6 },
                    jsonProperties: {
                    }
                }
                nodeDataExtrapolationOptionList.push(json);
            }
            //Linear regression
            if (filteredExtrapolationMethodList[i].id == 5) {
                json = {
                    extrapolationMethod: { id: 5 },
                    jsonProperties: {
                    }
                }
                nodeDataExtrapolationOptionList.push(json);
            }
            //ARIMA
            if (filteredExtrapolationMethodList[i].id == 4) {
                json = {
                    extrapolationMethod: { id: 4 },
                    jsonProperties: {
                        p: this.state.p,
                        d: this.state.d,
                        q: this.state.q
                    }
                }
                nodeDataExtrapolationOptionList.push(json);
            }
            // TES
            if (filteredExtrapolationMethodList[i].id == 2) {
                json = {
                    extrapolationMethod: { id: 2 },
                    jsonProperties: {
                        confidenceLevel: this.state.confidenceLevelId,
                        seasonality: this.state.noOfMonthsForASeason,
                        alpha: this.state.alpha,
                        beta: this.state.beta,
                        gamma: this.state.gamma
                    }
                }
                nodeDataExtrapolationOptionList.push(json);
            }
        }

        this.setState({
            nodeDataExtrapolation,
            nodeDataExtrapolationOptionList,
            extrapolationLoader: false
        }, () => {
            const { currentItemConfig } = this.props.items;
            currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].nodeDataExtrapolation = this.state.nodeDataExtrapolation;
            currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].nodeDataMomList = momList;
            currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].nodeDataExtrapolationOptionList = this.state.nodeDataExtrapolationOptionList;
            console.log("extrapolation data----", currentItemConfig);
            this.props.updateState("currentItemConfig", currentItemConfig);
        });
    }

    touchAllExtrapolation(setTouched, errors) {
        setTouched({
            extrapolationMethodId: true,
            noOfMonthsId: true,
            confidenceLevelId: true,
            seasonalityId: true,
            gammaId: true,
            betaId: true,
            alphaId: true,
            pId: true,
            dId: true,
            qId: true
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
        var valid = true;
        var json = this.state.dataExtrapolation.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.state.dataExtrapolation.getValueFromCoords(1, y);
            if (value != null && value != "") {
                //Population
                var col = ("B").concat(parseInt(y) + 1);
                var reg = JEXCEL_DECIMAL_NO_REGEX_LONG;
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
                var reg = JEXCEL_DECIMAL_NO_REGEX_LONG;
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
                var reg = JEXCEL_DECIMAL_MONTHLY_CHANGE;
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
        return valid;
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

    setPId(e) {
        this.setState({
            p: e.target.value
        }, () => {
            // this.buildJxl()
        })
    }
    setDId(e) {
        this.setState({
            d: e.target.value
        }, () => {
            // this.buildJxl()
        })
    }

    setQId(e) {
        this.setState({
            q: e.target.value
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
        var resultCount = 0;
        // console.log("my data---",this.props.items.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])
        if (dataAvailabel) {
            var extrapolationDataList = this.state.nodeDataExtrapolation.extrapolationDataList;
            for (var i = 0; i < extrapolationDataList.length; i++) {
                var result = jexcelDataArr.filter(x => x.amount > 0);
                resultCount = (extrapolationDataList[i].amount != "" && extrapolationDataList[i].amount != 0) || result.length > 0 ? resultCount + 1 : resultCount;
                var json = {
                    month: extrapolationDataList[i].month,
                    amount: extrapolationDataList[i].amount,
                    reportingRate: extrapolationDataList[i].reportingRate,
                    monthNo: resultCount
                }
                jexcelDataArr.push(json);
            }
        } else {
            var tableJson = this.state.dataExtrapolation.getJson(null, false);
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("10 map---" + map1.get("10"));
                var result = jexcelDataArr.filter(x => x.amount > 0);
                resultCount = (map1.get("1") != "" && map1.get("1") != 0) || result.length > 0 ? resultCount + 1 : resultCount;
                var json = {
                    month: map1.get("0"),
                    amount: map1.get("1") != "" ? map1.get("1").toString().replaceAll(",", "") : map1.get("1"),
                    reportingRate: map1.get("2") != "" ? map1.get("2").toString().replaceAll("%", "") : map1.get("2"),
                    monthNo: resultCount
                }
                jexcelDataArr.push(json);
            }


        }
        const { nodeDataExtrapolation } = this.state;
        nodeDataExtrapolation.extrapolationDataList = jexcelDataArr;
        console.log("jexcel data 1---", jexcelDataArr);

        this.setState({ jexcelDataArr, nodeDataExtrapolation }, () => {
            setTimeout(() => {
                console.log("tableJson for extrapolation---", this.state.jexcelDataArr);
                if (jexcelDataArr.length > 0) {
                    console.log("jexcelDataArr with month no---->", jexcelDataArr)

                    var valList = jexcelDataArr.filter(c => c.amount > 0)
                        .sort(function (a, b) {
                            return new Date(a.month) - new Date(b.month);
                        });
                    this.setState({
                        minMonth: valList[0].month
                    }, () => {
                        for (let i = 0; i < jexcelDataArr.length; i++) {
                            console.log("month->", jexcelDataArr[i].month + " result->", moment(valList[0].month).format("YYYY-MM") <= moment(jexcelDataArr[i].month).format("YYYY-MM") && jexcelDataArr[i].amount > 0)
                            if (moment(valList[0].month).format("YYYY-MM") <= moment(jexcelDataArr[i].month).format("YYYY-MM") && jexcelDataArr[i].amount > 0) {
                                inputDataMovingAvg.push({ "month": inputDataMovingAvg.length + 1, "actual": jexcelDataArr[i].amount > 0 ? Number(jexcelDataArr[i].amount) : null, "forecast": null })
                                // console.log("inputDataSemiAverage.length----", inputDataSemiAverage.length)
                                // inputDataSemiAverage.push({ "month": inputDataSemiAverage.length + 1, "actual": jexcelDataArr[i].amount > 0 ? Number(jexcelDataArr[i].amount) : null, "forecast": null })
                                // inputDataSemiAverage.push({ "month": inputDataSemiAverage.length + 1, "actual": jexcelDataArr[i].amount > 0 ? Number(jexcelDataArr[i].amount) : null, "forecast": null })
                                // console.log("inputDataSemiAverage----", inputDataSemiAverage)
                                // inputDataLinearRegression.push({ "month": inputDataLinearRegression.length + 1, "actual": jexcelDataArr[i].amount > 0 ? Number(jexcelDataArr[i].amount) : null, "forecast": null })
                                // inputDataTes.push({ "month": inputDataTes.length + 1, "actual": jexcelDataArr[i].amount > 0 ? Number(jexcelDataArr[i].amount) : null, "forecast": null })
                                console.log("inputDataTes----", inputDataTes)
                            }
                        }
                        console.log("inputDataSemiAverage--->>>", inputDataSemiAverage)
                        var data = jexcelDataArr.filter(c => c.amount > 0)
                            .sort(function (a, b) {
                                return new Date(a.month) - new Date(b.month);
                            });
                        var lastMonth = data[data.length - 1].month;
                        var noOfMonthsForProjection = moment(new Date(this.props.items.forecastStopDate)).diff(new Date(lastMonth), 'months', true)
                        console.log("noOfMonthsForProjection", noOfMonthsForProjection);
                        // if (this.state.movingAvgId) {
                        calculateMovingAvg(inputDataMovingAvg, this.state.monthsForMovingAverage, Math.trunc(noOfMonthsForProjection), this);
                        // }
                        // if (this.state.semiAvgId) {
                        console.log("inputDataMovingAvg semi---", inputDataMovingAvg);
                        calculateSemiAverages(inputDataMovingAvg, Math.trunc(noOfMonthsForProjection), this);
                        // }
                        // if (this.state.linearRegressionId) {
                        calculateLinearRegression(inputDataMovingAvg, Math.trunc(noOfMonthsForProjection), this);
                        // }
                        // if (this.state.smoothingId) {
                        if (inputDataMovingAvg.length >= (this.state.noOfMonthsForASeason * 2)) {
                            console.log("tes inside if")
                            calculateTES(JSON.parse(JSON.stringify(inputDataMovingAvg)), this.state.alpha, this.state.beta, this.state.gamma, this.state.confidenceLevelId, this.state.noOfMonthsForASeason, Math.trunc(noOfMonthsForProjection), this);
                        } else {
                            console.log("tes inside else")
                            this.setState({
                                tesData: [],
                                CI: 0,
                                tesError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" }
                            })
                        }
                        // }
                    });
                } else {
                    this.setState({ extrapolationLoader: false });
                }
            }, 0);
        });
        // this.buildJexcel();

    }

    interpolate() {
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
            var result = jexcelDataArr.filter(x => x.amount > 0);
            resultCount = (map1.get("1") != "" && map1.get("1") != 0) || result.length > 0 ? resultCount + 1 : resultCount;
            var json = {
                month: map1.get("0"),
                amount: map1.get("1") != "" ? map1.get("1").toString().replaceAll(",", "") : map1.get("1"),
                reportingRate: map1.get("2") != "" ? map1.get("2").toString().replaceAll("%", "") : map1.get("2"),
                monthNo: resultCount
            }
            jexcelDataArr.push(json);
        }
        this.setState({ jexcelDataArr })
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
                        amount: missingActualData % 1 != 0 ? missingActualData.toFixed(2) : missingActualData,
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
        const { nodeDataExtrapolation } = this.state;
        nodeDataExtrapolation.extrapolationDataList = jexcelDataArr;
        var valList = jexcelDataArr.filter(c => c.amount > 0)
            .sort(function (a, b) {
                return new Date(a.month) - new Date(b.month);
            });
        this.setState({
            minMonth: valList[0].month,
            nodeDataExtrapolation
        }, () => { this.buildJexcel() });
        // for (let i = 0; i < jexcelDataArr.length; i++) {
        //     if (moment(valList[0].month).format("YYYY-MM") <= moment(jexcelDataArr[i].month).format("YYYY-MM")) {
        //         inputDataMovingAvg.push({ "month": inputDataMovingAvg.length + 1, "actual": jexcelDataArr[i].amount > 0 ? Number(jexcelDataArr[i].amount) : null, "forecast": null })
        //         inputDataSemiAverage.push({ "month": inputDataSemiAverage.length + 1, "actual": jexcelDataArr[i].amount > 0 ? Number(jexcelDataArr[i].amount) : null, "forecast": null })
        //         inputDataLinearRegression.push({ "month": inputDataLinearRegression.length + 1, "actual": jexcelDataArr[i].amount > 0 ? Number(jexcelDataArr[i].amount) : null, "forecast": null })
        //         inputDataTes.push({ "month": inputDataTes.length + 1, "actual": jexcelDataArr[i].amount > 0 ? Number(jexcelDataArr[i].amount) : null, "forecast": null })
        //         console.log("inputDataTes----", inputDataTes)
        //     }
        // }
        // var data = jexcelDataArr.filter(c => c.amount > 0)
        //     .sort(function (a, b) {
        //         return new Date(a.month) - new Date(b.month);
        //     });
        // var lastMonth = data[data.length - 1].month;
        // var noOfMonthsForProjection = moment(new Date(this.props.items.forecastStopDate)).diff(new Date(lastMonth), 'months', true)
        // console.log("noOfMonthsForProjection", noOfMonthsForProjection);
        // calculateMovingAvg(inputDataMovingAvg, this.state.monthsForMovingAverage, Math.trunc(noOfMonthsForProjection), this);
        // calculateSemiAverages(inputDataSemiAverage, noOfMonthsForProjection, this);
        // calculateLinearRegression(inputDataLinearRegression, noOfMonthsForProjection, this);
        // if (inputDataTes.length >= (this.state.noOfMonthsForASeason * 2)) {
        //     console.log("tes inside if")
        //     calculateTES(inputDataTes, this.state.alpha, this.state.beta, this.state.gamma, this.state.confidenceLevelId, this.state.noOfMonthsForASeason, noOfMonthsForProjection, this);
        // } else {
        //     console.log("tes inside else")
        //     this.setState({
        //         tesData: [],
        //         CI: 0,
        //         tesError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" }
        //     })
        // }
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
        //     this.getExtrapolationMethodList();
    }
    getExtrapolationMethodList() {
        console.log("### inside did mount")
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
                        if (this.props.items.currentScenario.nodeDataExtrapolationOptionList == null) {
                            console.log("### inside did mount if")
                            this.setState({ extrapolationLoader: false, forecastNestedHeader: 0 }, () => {
                                console.log("### inside did mount if state update")
                                this.buildJexcel();
                            })
                            // var nodeDataExtrapolationOptionList = [];
                            // for (let i = 0; i < this.state.extrapolationMethodList.length; i++) {
                            //     var e = this.state.extrapolationMethodList[i];
                            //     var json;
                            //     if (e.id == 7) { // moving avg
                            //         json = {
                            //             extrapolationMethod: e.id,
                            //             jsonProperties: {
                            //                 months: this.state.monthsForMovingAverage
                            //             }
                            //         }
                            //     } else if (e.id == 5 || e.id == 6) { // semi avg
                            //         json = {
                            //             extrapolationMethod: e.id,
                            //             jsonProperties: {
                            //             }
                            //         }
                            //     }
                            //     else if (e.id == 2) { // TES
                            //         json = {
                            //             extrapolationMethod: e.id,
                            //             jsonProperties: {
                            //                 confidenceLevel: this.state.confidenceLevelId,
                            //                 seasonality: this.state.noOfMonthsForASeason,
                            //                 alpha: this.state.alpha,
                            //                 beta: this.state.beta,
                            //                 gamma: this.state.gamma
                            //             }
                            //         }
                            //     }
                            //     nodeDataExtrapolationOptionList.push(json);
                            // }
                            // this.setState({ nodeDataExtrapolationOptionList, filteredExtrapolationMethodList: JSON.parse(JSON.stringify(this.state.extrapolationMethodList)) })
                        } else {
                            var filteredExtrapolationMethodList = [];
                            var nodeDataExtrapolation = this.props.items.currentScenario.nodeDataExtrapolation;
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
                            var noOfMonthsForASeason = this.state.noOfMonthsForASeason;
                            var alpha = this.state.alpha;
                            var beta = this.state.beta;
                            var gamma = this.state.gamma;
                            var p = this.state.p;
                            var d = this.state.d;
                            var q = this.state.q;

                            for (let i = 0; i < nodeDataExtrapolationOptionList.length; i++) {
                                var id = nodeDataExtrapolationOptionList[i].extrapolationMethod.id;
                                filteredExtrapolationMethodList.push(this.state.extrapolationMethodList.filter(x => x.id == id)[0]);
                                if (id == 7) {
                                    movingAvgId = true;
                                    console.log("nodeDataExtrapolationOptionList[i] inside ---", nodeDataExtrapolationOptionList[i])
                                    monthsForMovingAverage = nodeDataExtrapolationOptionList[i].jsonProperties.months;
                                    console.log("monthsForMovingAverage from json properties---", monthsForMovingAverage)
                                } else if (id == 6) {
                                    semiAvgId = true;
                                } else if (id == 5) {
                                    linearRegressionId = true;
                                }
                                else if (id == 4) {
                                    var p = nodeDataExtrapolationOptionList[i].jsonProperties.p;
                                    var d = nodeDataExtrapolationOptionList[i].jsonProperties.d;
                                    var q = nodeDataExtrapolationOptionList[i].jsonProperties.q;
                                    arimaId = true;
                                }
                                else if (id == 2) {
                                    var confidenceLevelId = nodeDataExtrapolationOptionList[i].jsonProperties.confidenceLevel;
                                    var noOfMonthsForASeason = nodeDataExtrapolationOptionList[i].jsonProperties.seasonality;
                                    var alpha = nodeDataExtrapolationOptionList[i].jsonProperties.alpha;
                                    var beta = nodeDataExtrapolationOptionList[i].jsonProperties.beta;
                                    var gamma = nodeDataExtrapolationOptionList[i].jsonProperties.gamma;
                                    smoothingId = true;
                                }

                            }
                            console.log("filteredExtrapolationMethodList---", filteredExtrapolationMethodList)
                            this.setState({ nodeDataExtrapolation, p, d, q, confidenceLevelId, noOfMonthsForASeason, alpha, beta, gamma, movingAvgId, semiAvgId, linearRegressionId, smoothingId, arimaId, filteredExtrapolationMethodList, forecastNestedHeader: filteredExtrapolationMethodList.length, nodeDataExtrapolationOptionList, movingAvgId, monthsForMovingAverage }, () => {
                                console.log("obj------>>>", this.state.nodeDataExtrapolation)
                                this.calculateExtrapolatedData(true);
                            })
                            // this.setState({ filteredExtrapolationMethodList, forecastNestedHeader: filteredExtrapolationMethodList.length })

                        }
                        // setTimeout(() => {
                        //     this.buildJexcel();
                        // }, 0);

                        // var changed = 0;
                        // if (this.state.changed == 1) {
                        // this.calculateExtrapolatedData();
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
        let count1 = '';
        for (var j = 0; j < monthArray.length; j++) {
            var cellData = this.state.nodeDataExtrapolation.extrapolationDataList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))[0];
            data = [];
            data[0] = monthArray[j]
            data[1] = cellData != null && cellData != "" ? cellData.amount : (moment(monthArray[j]).isSame(this.props.items.currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].month) ? this.props.items.currentItemConfig.context.payload.nodeDataMap[this.props.items.selectedScenario][0].calculatedDataValue : "");
            data[2] = cellData != null && cellData != "" ? cellData.reportingRate : 100
            data[3] = `=ROUND((B${parseInt(j) + 1}*C${parseInt(j) + 1})/100,2)`
            // data[4] = this.state.movingAvgData[j+1].actual
            count1 = moment(this.state.minMonth).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM") ? 0 : moment(this.state.minMonth).format("YYYY-MM") < moment(monthArray[j]).format("YYYY-MM") ? count1 : '';
            console.log("month-", monthArray[j] + " count value-", count1 + " tes data-", this.state.tesData[count1]);
            data[4] = this.state.movingAvgData.length > 0 && count1 != '' ? this.state.movingAvgData[count1].forecast.toFixed(2) : ''
            data[5] = this.state.semiAvgData.length > 0 && this.state.tesData[count1] != null ? this.state.semiAvgData[count1].forecast.toFixed(2) : ''
            data[6] = this.state.linearRegressionData.length > 0 && this.state.tesData[count1] != null ? this.state.linearRegressionData[count1].forecast.toFixed(2) : ''
            data[7] = this.state.tesData.length > 0 && this.state.tesData[count1] != null ? this.state.tesData[count1].forecast.toFixed(2) : ''
            data[8] = ""
            if (count1 >= 0) {
                count1++;
            }
            // data[9] = `=IF(ISBLANK(B${parseInt(j) + 1}),10,ROUND(B${parseInt(j) + 1},2))`
            data[9] = `=IF(D${parseInt(j) + 1} != "",ROUND(D${parseInt(j) + 1},2),IF(N1 == 2,H${parseInt(j) + 1},IF(N1 == 7,E${parseInt(j) + 1},IF(N1==5,G${parseInt(j) + 1},IF(N1 == 6,F${parseInt(j) + 1},'')))))` // J
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
        console.log("### inside jexcel")

        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
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
                    type: this.state.movingAvgId ? 'number' : 'hidden',
                    mask: '#,##.00',
                    readOnly: true
                },
                {
                    title: 'Semi-Averages',
                    type: this.state.semiAvgId ? 'number' : 'hidden',
                    mask: '#,##.00',
                    readOnly: true
                },
                {
                    title: 'Linear Regression',
                    type: this.state.linearRegressionId ? 'number' : 'hidden',
                    mask: '#,##.00',
                    readOnly: true
                },
                {
                    title: 'TES',
                    type: this.state.smoothingId ? 'number' : 'hidden',
                    mask: '#,##.00',
                    readOnly: true
                },
                {
                    title: 'ARIMA',
                    type: this.state.arimaId ? 'number' : 'hidden',
                    mask: '#,##.00',
                    readOnly: true
                },

                {
                    title: 'Selected Forecast',
                    type: 'number',
                    mask: '#,##.00',
                    readOnly: true
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
                    type: 'hidden'
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
            onchange: this.extrapolationChanged,
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
        console.log("### inside jexcel going to update state")
        this.setState({
            dataExtrapolation,
            minRmse: minRmse,
            minMape: minMape,
            minMse: minMse,
            minRsqd: minRsqd,
            minWape: minWape,
            extrapolationLoader: false
            // dataEl: dataEl, loading: false,
            // inputDataFilter: inputData,
            // inputDataAverageFilter: inputDataAverage,
            // inputDataRegressionFilter: inputDataRegression,
            // startMonthForExtrapolation: startMonth
        }, () => {
            console.log("");
            // this.calculateExtrapolatedData();
        })
    }
    loadedExtrapolation = function (instance, cell, x, y, value) {
        //  jExcelLoadedFunctionWithoutPagination(instance);
        jExcelLoadedFunctionOnlyHideRow(instance);
        console.log("my instance---", instance)
        // if (this.state.dataExtrapolation != "") {
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild.nextSibling;
        console.log("asterisk", asterisk.firstChild.nextSibling)

        tr.children[3].classList.add('InfoTr');
        tr.children[5].classList.add('InfoTr');
        tr.children[6].classList.add('InfoTr');
        tr.children[7].classList.add('InfoTr');
        tr.children[8].classList.add('InfoTr');
        tr.children[9].classList.add('InfoTr');
        tr.children[3].title = 'Placeholder'
        // }

    }

    extrapolationChanged = function (instance, cell, x, y, value) {
        // Population
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            var reg = JEXCEL_DECIMAL_NO_REGEX_LONG;
            console.log("population value---", value)
            if (value != "" && !(reg.test(value.toString().replaceAll(",", "")))) {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setStyle(col, "background-color", "yellow");
                instance.jexcel.setComments(col, i18n.t('static.message.invalidnumber'));
            }
            else {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setComments(col, "");
                var reportingRate = instance.jexcel.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "").split("%")[0];
                var col1 = ("C").concat(parseInt(y) + 1);
                if (reportingRate == "") {
                    instance.jexcel.setStyle(col1, "background-color", "transparent");
                    instance.jexcel.setStyle(col1, "background-color", "yellow");
                    instance.jexcel.setComments(col1, i18n.t('static.label.fieldRequired'));
                } else if (reportingRate > 100) {
                    instance.jexcel.setStyle(col1, "background-color", "transparent");
                    instance.jexcel.setStyle(col1, "background-color", "yellow");
                    instance.jexcel.setComments(col1, i18n.t('static.message.invalidnumber'));
                }
                else if (!(reg.test(reportingRate))) {
                    instance.jexcel.setStyle(col1, "background-color", "transparent");
                    instance.jexcel.setStyle(col1, "background-color", "yellow");
                    instance.jexcel.setComments(col1, i18n.t('static.message.invalidnumber'));
                }
                var manualChange = instance.jexcel.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "").split("%")[0];
                var col2 = ("K").concat(parseInt(y) + 1);
                if (manualChange != "" && !(reg.test(manualChange))) {
                    instance.jexcel.setStyle(col2, "background-color", "transparent");
                    instance.jexcel.setStyle(col2, "background-color", "yellow");
                    instance.jexcel.setComments(col2, i18n.t('static.message.invalidnumber'));
                }
                else {
                    instance.jexcel.setStyle(col2, "background-color", "transparent");
                    instance.jexcel.setComments(col2, "");
                }

            }
        }
        // Reporting Rate
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            var reg = JEXCEL_DECIMAL_NO_REGEX_LONG;
            console.log("reporting rate value---", value)
            var actualValue = instance.jexcel.getValue(`B${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // value.split("%")[0];
            value = value.toString().replaceAll(",", "").split("%")[0];
            if (actualValue != "" && value == "") {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setStyle(col, "background-color", "yellow");
                instance.jexcel.setComments(col, i18n.t('static.label.fieldRequired'));
            } else if (value > 100) {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setStyle(col, "background-color", "yellow");
                instance.jexcel.setComments(col, i18n.t('static.message.invalidnumber'));
            }
            else if (!(reg.test(value))) {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setStyle(col, "background-color", "yellow");
                instance.jexcel.setComments(col, i18n.t('static.message.invalidnumber'));
            }
            else {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setComments(col, "");
            }
        }
        // Manual change
        if (x == 10) {
            var col = ("K").concat(parseInt(y) + 1);
            var reg = JEXCEL_DECIMAL_MONTHLY_CHANGE;
            value = value.toString().replaceAll(",", "");
            var actualValue = instance.jexcel.getValue(`B${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (actualValue != "" && value != "" && !(reg.test(value))) {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setStyle(col, "background-color", "yellow");
                instance.jexcel.setComments(col, i18n.t('static.message.invalidnumber'));
            }
            else {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setComments(col, "");
            }
        }
    }.bind(this);

    setMovingAvgId(e) {
        var json;
        var json1;
        var filteredExtrapolationMethodList = this.state.filteredExtrapolationMethodList;
        var movingAvgId = e.target.checked;
        this.setState({
            movingAvgId: movingAvgId
        }, () => {
            if (this.state.dataExtrapolation != "") {
                if (movingAvgId) {
                    json1 = this.state.extrapolationMethodList.filter(c => c.id == 7)[0];
                    filteredExtrapolationMethodList.push(json1);
                    if (this.state.dataExtrapolation != null) {
                        console.log("spreadsheet.getHeaders()---", this.state.dataExtrapolation.getHeader(4));
                        this.state.dataExtrapolation.showColumn(4);
                    }
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
                    this.buildJexcel();
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
            semiAvgId: semiAvgId
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
                    this.buildJexcel();
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
            linearRegressionId: linearRegressionId
        }, () => {
            if (this.state.dataExtrapolation != "") {
                if (linearRegressionId) {
                    // json = {
                    //     extrapolationMethod: { id: 5 },
                    //     jsonProperties: {
                    //     }
                    // }
                    json1 = this.state.extrapolationMethodList.filter(c => c.id == 5)[0];
                    // this.state.nodeDataExtrapolationOptionList.push(json);
                    filteredExtrapolationMethodList.push(json1);
                    if (this.state.dataExtrapolation != null) {
                        this.state.dataExtrapolation.showColumn(6);
                    }
                } else {
                    // const index = this.state.nodeDataExtrapolationOptionList.findIndex(c => c.extrapolationMethod.id == 5);
                    const index1 = filteredExtrapolationMethodList.findIndex(c => c.id == 5);
                    filteredExtrapolationMethodList.splice(index1, 1);
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
                    this.buildJexcel()
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
            smoothingId: smoothingId
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
                    this.buildJexcel()
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
            arimaId: arimaId
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
                    this.buildJexcel()
                })
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
        const { filteredExtrapolationMethodList } = this.state;
        let extrapolationMethods = filteredExtrapolationMethodList.length > 0
            && filteredExtrapolationMethodList.map((item, i) => {
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
            borderColor: '#CFCDC9',
            ticks: {
                fontSize: 2,
                fontColor: 'transparent',
            },
            showInLegend: true,
            pointStyle: 'line',
            pointBorderWidth: 5,
            yValueFormatString: "###,###,###,###",
            data: this.state.jexcelDataArr.map((item, index) => (item.amount > 0 ? item.amount : null))
        })

        let stopDate = moment(this.props.items.forecastStopDate).format("YYYY-MM-DD");
        let startDate = moment(this.props.items.forecastStartDate).format("YYYY-MM-DD");

        console.log("Stop Date&&&", stopDate);
        console.log("Stop Date&&&", this.state.movingAvgData);

        if (this.state.movingAvgId) {
            datasets.push(
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t('static.extrapolation.movingAverages'),
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
                    data: this.state.jexcelDataArr.map((item, index) => (this.state.movingAvgData.filter(x => x.month == item.monthNo).length > 0 && moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && item.amount == "" ? this.state.movingAvgData.filter(x => x.month == item.monthNo)[0].forecast : null))
                })
        }
        if (this.state.semiAvgId) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t('static.extrapolation.semiAverages'),
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
                // data: this.state.semiAvgData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? item.forecast.toFixed(2) : null))
                data: this.state.jexcelDataArr.map((item, index) => (this.state.semiAvgData.filter(x => x.month == item.monthNo).length > 0 && moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && item.amount == "" ? this.state.semiAvgData.filter(x => x.month == item.monthNo)[0].forecast : null))
            })
        }
        if (this.state.linearRegressionId) {
            datasets.push(
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t('static.extrapolation.linearRegression'),
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
                    // data: this.state.linearRegressionData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? item.forecast.toFixed(2) : null))
                    data: this.state.jexcelDataArr.map((item, index) => (this.state.linearRegressionData.filter(x => x.month == item.monthNo).length > 0 && moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && item.amount == "" ? this.state.linearRegressionData.filter(x => x.month == item.monthNo)[0].forecast : null))
                })
        }
        if (this.state.smoothingId) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t('static.extrapolation.tesLower'),
                backgroundColor: 'transparent',
                borderColor: '#002FC6',
                borderStyle: 'dotted',
                borderDash: [10, 10],
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                yValueFormatString: "###,###,###,###",
                // data: this.state.tesData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? (item.forecast - this.state.CI).toFixed(2) : null))
                data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0 && moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && item.amount == "" ? this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast - this.state.CI : null))
            })
        }
        if (this.state.smoothingId) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t('static.extrapolation.tes'),
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
                // data: this.state.tesData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? item.forecast.toFixed(2) : null))
                data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0 && moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && item.amount == "" ? this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast : null))
            })
        }
        if (this.state.smoothingId) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t('static.extrapolation.tesUpper'),
                backgroundColor: 'transparent',
                borderColor: '#6c6463',
                borderStyle: 'dotted',
                borderDash: [10, 10],
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                yValueFormatString: "###,###,###,###",
                // data: this.state.tesData.map((item, index) => (item.forecast > 0 && moment(this.state.minMonth).format("YYYY-MM") <= moment(this.props.items.forecastStopDate).format("YYYY-MM") ? (item.forecast + this.state.CI).toFixed(2) : null))
                data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0 && moment(this.state.minMonth).format('YYYY-MM') < moment(item.month).format('YYYY-MM') && item.amount == "" ? this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast + this.state.CI : null))
            })
        }
        if (this.state.arimaId) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t('static.extrapolation.arima'),
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
                // data: this.state.jexcelDataArr.map((item, index) => (this.state.tesData.filter(x => x.month == item.monthNo).length > 0 ? this.state.tesData.filter(x => x.month == item.monthNo)[0].forecast- this.state.CI : null))
            })
        }
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
                                extrapolationMethodId: this.state.nodeDataExtrapolation.extrapolationMethod != null && this.state.nodeDataExtrapolation.extrapolationMethod != "" ? this.state.nodeDataExtrapolation.extrapolationMethod.id : "",
                                noOfMonthsId: this.state.monthsForMovingAverage,
                                confidenceLevelId: this.state.confidenceLevelId,
                                seasonalityId: this.state.noOfMonthsForASeason,
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
                                if (this.checkValidationExtrapolation()) {
                                    this.checkActualValuesGap(false);
                                    console.log("tree extrapolation on submit called")
                                } else {
                                    console.log("tree extrapolation on submit not called")
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
                                                    <span style={{ cursor: 'pointer', color: '20a8d8' }} ><small className="supplyplanformulas">{i18n.t('Show Guidance')}</small></span>

                                                </a>
                                            </div>
                                        </div>
                                        {/* <Form name='simpleForm'> */}
                                        <div className=" pl-0">
                                            <div className="row">
                                                <FormGroup className="col-md-3 pl-lg-0">
                                                    <Label htmlFor="appendedInputButton">Start Month for Historical Data<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
                                                    <div className="controls edit disabledColor">
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
                                                                    value={this.state.movingAvgId}
                                                                    onClick={(e) => { this.setMovingAvgId(e); }}
                                                                />
                                                                <Label
                                                                    className="form-check-label"
                                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '2px' }}>
                                                                    <b>Moving Averages</b>
                                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                                </Label>
                                                            </div>
                                                            {/* {this.state.movingAvgId && */}
                                                            <div className="row col-md-12 pt-lg-2">
                                                                <div className="col-md-2 pl-lg-0 pt-lg-0" style={{ display: this.state.movingAvgId ? '' : 'none' }}>
                                                                    <Label htmlFor="appendedInputButton"># of Months</Label>
                                                                    <Input
                                                                        className="controls"
                                                                        type="text"
                                                                        bsSize="sm"
                                                                        id="noOfMonthsId"
                                                                        name="noOfMonthsId"
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
                                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '2px' }}>
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
                                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '2px' }}>
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
                                                                    value={this.state.smoothingId}
                                                                    onClick={(e) => { this.setSmoothingId(e); }}
                                                                />
                                                                <Label
                                                                    className="form-check-label"
                                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '2px' }}>
                                                                    <b>Triple-Exponential Smoothing (Holts-Winters)</b>
                                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenTes', !this.state.popoverOpenTes)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                                </Label>
                                                            </div>
                                                            <div className="row col-md-12 pt-lg-2 pl-lg-0" style={{ display: this.state.smoothingId ? '' : 'none' }}>
                                                                <div className="pt-lg-0 pl-lg-0" style={{ display: 'contents' }}>
                                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.confidenceLevel')}</Label>
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
                                                                            <option value="">Please select confidence level</option>
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
                                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.seasonality')}</Label>
                                                                        <Input
                                                                            className="controls"
                                                                            type="text"
                                                                            bsSize="sm"
                                                                            id="seasonalityId"
                                                                            name="seasonalityId"
                                                                            value={this.state.noOfMonthsForASeason}
                                                                            valid={!errors.seasonalityId && this.state.noOfMonthsForASeason != null ? this.state.noOfMonthsForASeason : '' != ''}
                                                                            invalid={touched.seasonalityId && !!errors.seasonalityId}
                                                                            onBlur={handleBlur}
                                                                            onChange={(e) => { handleChange(e); this.setSeasonals(e) }}
                                                                        />
                                                                        <FormFeedback>{errors.seasonalityId}</FormFeedback>
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
                                                                            valid={!errors.alphaId && this.state.alpha != null ? this.state.alpha : '' != ''}
                                                                            invalid={touched.alphaId && !!errors.alphaId}
                                                                            onBlur={handleBlur}
                                                                            onChange={(e) => { handleChange(e); this.setAlpha(e) }}
                                                                        />
                                                                        <FormFeedback>{errors.alphaId}</FormFeedback>
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
                                                                            valid={!errors.betaId && this.state.beta != null ? this.state.beta : '' != ''}
                                                                            invalid={touched.betaId && !!errors.betaId}
                                                                            onBlur={handleBlur}
                                                                            onChange={(e) => { handleChange(e); this.setBeta(e) }}
                                                                        />
                                                                        <FormFeedback>{errors.betaId}</FormFeedback>
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
                                                                    value={this.state.arimaId}
                                                                    onClick={(e) => { this.setArimaId(e); }}
                                                                />
                                                                <Label
                                                                    className="form-check-label"
                                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px', marginTop: '2px' }}>
                                                                    <b>{i18n.t('static.extrapolation.arimaFull')}</b>
                                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                                </Label>
                                                            </div>
                                                            {/* {this.state.arimaId && */}
                                                            <div className="row col-md-12 pt-lg-2 pl-lg-0" style={{ display: this.state.arimaId ? '' : 'none' }}>
                                                                {/* <div className="row col-md-12 pt-lg-2 pl-lg-0"> */}
                                                                <div className="pt-lg-0" style={{ display: 'contents' }}>
                                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.p')}</Label>
                                                                        <Input
                                                                            className="controls"
                                                                            type="text"
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
                                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.d')}</Label>
                                                                        <Input
                                                                            className="controls"
                                                                            type="text"
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
                                                                    <div className="tab-ml-1 mt-md-2 mb-md-0 ExtraCheckboxFieldWidth">
                                                                        <Label htmlFor="appendedInputButton">q</Label>
                                                                        <Input
                                                                            className="controls"
                                                                            type="text"
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
                                                                </div>
                                                            </div>
                                                            {/* } */}
                                                        </div>
                                                    </div>
                                                </FormGroup>
                                            </div>

                                            <div className="col-md-12 row text-left pt-lg-3 pl-lg-0">
                                                {/* <Button className="mr-1 btn btn-info btn-md " onClick={this.toggledata}>
                                                {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                                            </Button> */}
                                                <Button type="button" color="success" className="mr-1" size="md" onClick={this.interpolate}>Interpolate</Button>
                                            </div>
                                        </div>
                                        {/* </Form> */}
                                        <div className="row pl-lg-0 pr-lg-0 pt-lg-3">
                                            <div className="col-md-6">
                                                {/* <Button type="button" size="md" color="info" className="float-left mr-1" onClick={this.resetTree}>{'Show/hide data'}</Button> */}
                                            </div>
                                            <div className="col-md-6 float-right" style={{ marginTop: '-42px' }}>
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
                                        <div className="row pl-lg-0 pr-lg-0 extrapolateTable consumptionDataEntryTable">
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

                                            <div className="table-scroll">
                                                <div className="table-wrap table-responsive">
                                                    <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                                        <thead>
                                                            <tr>

                                                                <td width="60px" className="text-left" title={i18n.t('static.common.errors')}><b>{i18n.t('static.common.errors')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                {this.state.movingAvgId &&
                                                                    <td width="110px" title={i18n.t('static.extrapolation.movingAverages')}><b>{i18n.t('static.extrapolation.movingAverages')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                }
                                                                {this.state.semiAvgId &&
                                                                    <td width="110px" title={i18n.t('static.extrapolation.semiAverages')}><b>{i18n.t('static.extrapolation.semiAverages')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                }
                                                                {this.state.linearRegressionId &&
                                                                    <td width="110px" title={i18n.t('static.extrapolation.linearRegression')}><b>{i18n.t('static.extrapolation.linearRegression')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                }
                                                                {this.state.smoothingId &&
                                                                    <td width="110px" title={i18n.t('static.extrapolation.tes')}><b>{i18n.t('static.extrapolation.tes')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                }
                                                                {this.state.arimaId &&
                                                                    <td width="110px" title={i18n.t('static.extrapolation.arima')}><b>{i18n.t('static.extrapolation.arima')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                }
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td className="text-left">{i18n.t('static.extrapolation.rmse')}</td>
                                                                {this.state.movingAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minRmse == this.state.movingAvgError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse == this.state.movingAvgError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.rmse != "" ? this.state.movingAvgError.rmse.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.semiAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minRmse == this.state.semiAvgError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse == this.state.semiAvgError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.rmse != "" ? this.state.semiAvgError.rmse.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.linearRegressionId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minRmse == this.state.linearRegressionError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse == this.state.linearRegressionError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.rmse != "" ? this.state.linearRegressionError.rmse.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.smoothingId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minRmse == this.state.tesError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse == this.state.tesError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.rmse != "" ? this.state.tesError.rmse.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.arimaId &&
                                                                    <td></td>
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td className="text-left">{i18n.t('static.extrapolation.mape')}</td>
                                                                {this.state.movingAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMape == this.state.movingAvgError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape == this.state.movingAvgError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.mape != "" ? this.state.movingAvgError.mape.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.semiAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMape == this.state.semiAvgError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape == this.state.semiAvgError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.mape != "" ? this.state.semiAvgError.mape.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.linearRegressionId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMape == this.state.linearRegressionError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape == this.state.linearRegressionError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.mape != "" ? this.state.linearRegressionError.mape.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.smoothingId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMape == this.state.tesError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape == this.state.tesError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.mape != "" ? this.state.tesError.mape.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.arimaId &&
                                                                    <td></td>
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td className="text-left">{i18n.t('static.extrapolation.mse')}</td>
                                                                {this.state.movingAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMse == this.state.movingAvgError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse == this.state.movingAvgError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.mse != "" ? this.state.movingAvgError.mse.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.semiAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMse == this.state.semiAvgError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse == this.state.semiAvgError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.mse != "" ? this.state.semiAvgError.mse.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.linearRegressionId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMse == this.state.linearRegressionError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse == this.state.linearRegressionError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.mse != "" ? this.state.linearRegressionError.mse.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.smoothingId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minMse == this.state.tesError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse == this.state.tesError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.mse != "" ? this.state.tesError.mse.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.arimaId &&
                                                                    <td></td>
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td className="text-left">{i18n.t('static.extrapolation.wape')}</td>
                                                                {this.state.movingAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minWape == this.state.movingAvgError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape == this.state.movingAvgError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.wape != "" ? this.state.movingAvgError.wape.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.semiAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minWape == this.state.semiAvgError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape == this.state.semiAvgError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.wape != "" ? this.state.semiAvgError.wape.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.linearRegressionId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minWape == this.state.linearRegressionError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape == this.state.linearRegressionError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.wape != "" ? this.state.linearRegressionError.wape.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.smoothingId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minWape == this.state.tesError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape == this.state.tesError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.wape != "" ? this.state.tesError.wape.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.arimaId &&
                                                                    <td></td>
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td className="text-left">{i18n.t('static.extrapolation.rSquare')}</td>
                                                                {this.state.movingAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minRsqd == this.state.movingAvgError.rSqd ? "bold" : "normal" }} bgcolor={this.state.minRsqd == this.state.movingAvgError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.rSqd != "" ? this.state.movingAvgError.rSqd.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.semiAvgId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minRsqd == this.state.semiAvgError.rSqd ? "bold" : "normal" }} bgcolor={this.state.minRsqd == this.state.semiAvgError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.rSqd != "" ? this.state.semiAvgError.rSqd.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.linearRegressionId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minRsqd == this.state.linearRegressionError.rSqd ? "bold" : "normal" }} bgcolor={this.state.minRsqd == this.state.linearRegressionError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.rSqd != "" ? this.state.linearRegressionError.rSqd.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.smoothingId &&
                                                                    <td style={{ textAlign: "right", "fontWeight": this.state.minRsqd == this.state.tesError.rSqd ? "bold" : "normal" }} bgcolor={this.state.minRsqd == this.state.tesError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.rSqd != "" ? this.state.tesError.rSqd.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                }
                                                                {this.state.arimaId &&
                                                                    <td></td>
                                                                }
                                                            </tr>
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12 row pl-lg-0  pr-lg-0 pt-lg-3 pb-lg-3">
                                            <ul className="legendcommitversion pl-lg-0">
                                                <li><span className="lowestErrorGreenLegend legendcolor"></span> <span className="legendcommitversionText">Lowest Error</span></li>

                                            </ul>
                                        </div>
                                        <div className="col-md-12 pl-lg-0 pr-lg-0">
                                            <Row>
                                                <FormGroup className="col-md-3 pl-lg-0">
                                                    <Label htmlFor="currencyId">Choose Method<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.togglepopoverChooseMethod('popoverChooseMethod', !this.state.popoverChooseMethod)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                    {/* <InputGroup> */}
                                                    <Input
                                                        type="select"
                                                        name="extrapolationMethodId"
                                                        id="extrapolationMethodId"
                                                        bsSize="sm"
                                                        valid={!errors.extrapolationMethodId && this.state.nodeDataExtrapolation.extrapolationMethod != null ? this.state.nodeDataExtrapolation.extrapolationMethod.id : "" != ""}
                                                        invalid={touched.extrapolationMethodId && !!errors.extrapolationMethodId}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => { handleChange(e); this.extrapolationMethodChange(e) }}
                                                        required
                                                        value={this.state.nodeDataExtrapolation.extrapolationMethod != null ? this.state.nodeDataExtrapolation.extrapolationMethod.id : ""}
                                                    >
                                                        <option value="">{"Select extrapolation method"}</option>
                                                        {extrapolationMethods}
                                                    </Input>

                                                    {/* </InputGroup> */}
                                                    <FormFeedback>{errors.extrapolationMethodId}</FormFeedback>
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
                                                            onChange={(e) => { this.changeNotes(e.target.value) }}
                                                        ></Input>

                                                    </InputGroup>

                                                </FormGroup>
                                                <FormGroup className="pl-lg-3 ExtrapolateSaveBtn">
                                                    <Button type="submit" color="success" onClick={() => this.touchAllExtrapolation(setTouched, errors)} className="mr-1 float-right" size="md"><i className="fa fa-check"></i>{i18n.t('static.pipeline.save')}</Button>
                                                    <Button type="button" id="dataCheck" size="md" color="info" className="float-right mr-1" onClick={() => this.checkActualValuesGap(true)}><i className="fa fa-check"></i>Extrapolate</Button>
                                                </FormGroup>
                                            </Row>
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
                </CardBody>
            </div>
        )
    }
}