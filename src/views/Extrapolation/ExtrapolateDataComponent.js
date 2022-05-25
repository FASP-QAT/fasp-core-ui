import React from "react";
import ReactDOM from 'react-dom';
import * as Yup from 'yup';
import '../../views/Forms/ValidationForms/ValidationForms.css'
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form, InputGroup, Modal, FormFeedback, ModalHeader, ModalFooter, ModalBody, Row, Table, PopoverBody, Popover
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, SECRET_KEY, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_MONTH_PICKER_FORMAT, TITLE_FONT } from "../../Constants";
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
import AuthenticationService from "../Common/AuthenticationService";
import { calculateMovingAvg } from '../Extrapolation/MovingAverages';
import { calculateSemiAverages } from '../Extrapolation/SemiAverages';
import { calculateLinearRegression } from '../Extrapolation/LinearRegression';
import { calculateTES } from '../Extrapolation/TESNew';
import { calculateArima } from '../Extrapolation/Arima';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { Prompt } from "react-router";
import pdfIcon from '../../assets/img/pdf.png';
import jsPDF from 'jspdf';
import { LOGO } from "../../CommonComponent/Logo";
import { Formik } from "formik";
import { i } from "mathjs";
import { JEXCEL_INTEGER_REGEX } from '../../Constants.js'
import { calculateError } from "./ErrorCalculations";


const entityname = i18n.t('static.dashboard.extrapolation');
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
const validationSchemaExtrapolation = function (values) {
    return Yup.object().shape({
        noOfMonthsId:
            Yup.string().test('noOfMonthsId', 'Please enter positive number.',
                function (value) {
                    var testNumber = JEXCEL_INTEGER_REGEX.test((document.getElementById("noOfMonthsId").value).replaceAll(",", ""));
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
                    if ((document.getElementById("smoothingId").value) == "on" && document.getElementById("confidenceLevelId").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        confidenceLevelIdLinearRegression:
            Yup.string().test('confidenceLevelIdLinearRegression', 'Please select confidence level.',
                function (value) {
                    console.log("***2**", document.getElementById("linearRegressionId").value);
                    if ((document.getElementById("linearRegressionId").value) == "on" && document.getElementById("confidenceLevelIdLinearRegression").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),

        confidenceLevelIdArima:
            Yup.string().test('confidenceLevelIdArima', 'Please select confidence level.',
                function (value) {
                    console.log("***2**", document.getElementById("arimaId").value);
                    if ((document.getElementById("arimaId").value) == "on" && document.getElementById("confidenceLevelIdArima").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        seasonalityId:
            Yup.string().test('seasonalityId', 'Please enter a valid whole number between 1 & 24.',
                function (value) {
                    var testNumber = document.getElementById("seasonalityId").value != "" ? (/^(?:[1-9]|[1][0-9]|2[0-4])$/).test(document.getElementById("seasonalityId").value) : false;
                    if ((document.getElementById("smoothingId").value) == "on" && (document.getElementById("seasonalityId").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        gammaId:
            Yup.string().test('gammaId', 'Please enter correct gamma value.',
                function (value) {
                    var testNumber = document.getElementById("gammaId").value != "" ? (/^(?:(?:[0])(?:\.\d{1,2})?|1(?:\.0\d{0,1})?)$/).test(document.getElementById("gammaId").value) : false;
                    if ((document.getElementById("smoothingId").value) == "on" && (document.getElementById("gammaId").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        betaId:
            Yup.string().test('betaId', 'Please enter correct beta value.',
                function (value) {
                    var testNumber = document.getElementById("betaId").value != "" ? (/^(?:(?:[0])(?:\.\d{1,2})?|1(?:\.0\d{0,1})?)$/).test(document.getElementById("betaId").value) : false;
                    if ((document.getElementById("smoothingId").value) == "on" && (document.getElementById("betaId").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        alphaId:
            Yup.string().test('alphaId', 'Please enter correct alpha value.',
                function (value) {
                    var testNumber = document.getElementById("alphaId").value != "" ? (/^(?:(?:[0])(?:\.\d{1,2})?|1(?:\.0\d{0,1})?)$/).test(document.getElementById("alphaId").value) : false;
                    if ((document.getElementById("smoothingId").value) == "on" && (document.getElementById("alphaId").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        pId:
            Yup.string().test('pId', 'Please enter correct p value.',
                function (value) {
                    var testNumber = document.getElementById("pId").value != "" ? (/^\d{0,3}(\.\d{1,4})?$/).test(document.getElementById("pId").value) : false;
                    if ((document.getElementById("arimaId").value) == "on" && (document.getElementById("pId").value == "" || testNumber == false)) {
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
                    if ((document.getElementById("arimaId").value) == "on" && (document.getElementById("dId").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        qId:
            Yup.string().test('qId', 'Please enter correct q value.',
                function (value) {
                    var testNumber = document.getElementById("qId").value != "" ? (/^\d{0,3}(\.\d{1,4})?$/).test(document.getElementById("qId").value) : false;
                    if ((document.getElementById("arimaId").value) == "on" && (document.getElementById("qId").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                })
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

export default class ExtrapolateDataComponent extends React.Component {
    constructor(props) {
        super(props);
        this.options = props.options;
        var startDate1 = moment(Date.now()).subtract(24, 'months').startOf('month').format("YYYY-MM-DD");
        var endDate1 = moment(Date.now()).startOf('month').format("YYYY-MM-DD")
        // var endDate1 = moment(Date.now()).startOf('month').format("YYYY-MM-DD")
        var startDate = moment("2021-05-01").format("YYYY-MM-DD");
        var endDate = moment("2022-02-01").format("YYYY-MM-DD");


        this.state = {
            popoverOpenConfidenceLevel: false,
            popoverOpenConfidenceLevel1: false,
            popoverOpenConfidenceLevel2: false,
            forecastProgramId: -1,
            forecastProgramId: "",
            forecastProgramList: [],
            planningUnitId: -1,
            planningUnitList: [],
            show: false,
            regionId: -1,
            regionList: [],
            monthArray: [],
            actualConsumptionList: [],
            inputDataFilter: [],
            inputDataAverageFilter: [],
            inputDataRegressionFilter: [],
            tesdataFilter: [],
            consumptionData: [],
            columns: [],
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
            monthsDiff: 0,
            rmseLinearReg: "",
            mapeLinearReg: "",
            mseLinearReg: "",
            rSqdLinearReg: "",
            wapeLinearReg: "",
            alpha: 0.2,
            beta: 0.2,
            gamma: 0.2,
            noOfMonthsForASeason: 4,
            confidence: 0.95,
            monthsForMovingAverage: 6,
            p: 0,
            d: 1,
            q: 1,
            alphaValidate: true,
            buttonFalg: 1,
            betaValidate: true,
            gammaValidate: true,
            noOfMonthsForASeasonValidate: true,
            confidenceValidate: true,
            monthsForMovingAverageValidate: true,
            CI: "",
            // showAdvanceId: true,
            arimaId: true,
            dataList: [{ 'months': 'Jan-2020', 'actuals': '155', 'tesLcb': '155', 'tesM': '155', 'tesUcb': '155', 'arimaForecast': '155', 'linearRegression': '211', 'semiAveragesForecast': '277', 'movingAverages': '' }, { 'months': 'Feb-2020', 'actuals': '180', 'tesLcb': '180', 'tesM': '180', 'tesUcb': '180', 'arimaForecast': '180', 'linearRegression': '225', 'semiAveragesForecast': '283', 'movingAverages': '155' }, { 'months': 'Mar-2020', 'actuals': '260', 'tesLcb': '260', 'tesM': '260', 'tesUcb': '260', 'arimaForecast': '260', 'linearRegression': '240', 'semiAveragesForecast': '288', 'movingAverages': '168' }, { 'months': 'Apr-2020', 'actuals': '560', 'tesLcb': '560', 'tesM': '560', 'tesUcb': '560', 'arimaForecast': '560', 'linearRegression': '254', 'semiAveragesForecast': '294', 'movingAverages': '198' }, { 'months': 'May-2020', 'actuals': '160', 'tesLcb': '160', 'tesM': '160', 'tesUcb': '160', 'arimaForecast': '160', 'linearRegression': '268', 'semiAveragesForecast': '299', 'movingAverages': '289' }, { 'months': 'Jun-2020', 'actuals': '185', 'tesLcb': '185', 'tesM': '185', 'tesUcb': '185', 'arimaForecast': '185', 'linearRegression': '282', 'semiAveragesForecast': '304', 'movingAverages': '263' }, { 'months': 'Jul-2020', 'actuals': '270', 'tesLcb': '270', 'tesM': '270', 'tesUcb': '270', 'arimaForecast': '270', 'linearRegression': '297', 'semiAveragesForecast': '310', 'movingAverages': '269' }, { 'months': 'Aug-2020', 'actuals': '600', 'tesLcb': '600', 'tesM': '600', 'tesUcb': '600', 'arimaForecast': '600', 'linearRegression': '311', 'semiAveragesForecast': '315', 'movingAverages': '287' }, { 'months': 'Sep-2020', 'actuals': '165', 'tesLcb': '165', 'tesM': '165', 'tesUcb': '165', 'arimaForecast': '165', 'linearRegression': '325', 'semiAveragesForecast': '321', 'movingAverages': '355' }, { 'months': 'Oct-2020', 'actuals': '190', 'tesLcb': '190', 'tesM': '190', 'tesUcb': '190', 'arimaForecast': '190', 'linearRegression': '339', 'semiAveragesForecast': '326', 'movingAverages': '276' }, { 'months': 'Nov-2020', 'actuals': '280', 'tesLcb': '280', 'tesM': '280', 'tesUcb': '280', 'arimaForecast': '280', 'linearRegression': '354', 'semiAveragesForecast': '332', 'movingAverages': '282' }, { 'months': 'Dec-2020', 'actuals': '635', 'tesLcb': '635', 'tesM': '635', 'tesUcb': '635', 'arimaForecast': '635', 'linearRegression': '368', 'semiAveragesForecast': '337', 'movingAverages': '301' }, { 'months': 'Jan-2021', 'actuals': '172', 'tesLcb': '172', 'tesM': '172', 'tesUcb': '172', 'arimaForecast': '172', 'linearRegression': '382', 'semiAveragesForecast': '342', 'movingAverages': '374' }, { 'months': 'Feb-2021', 'actuals': '226', 'tesLcb': '226', 'tesM': '226', 'tesUcb': '226', 'arimaForecast': '226', 'linearRegression': '396', 'semiAveragesForecast': '348', 'movingAverages': '288' }, { 'months': 'Mar-2021', 'actuals': '329', 'tesLcb': '329', 'tesM': '329', 'tesUcb': '329', 'arimaForecast': '329', 'linearRegression': '411', 'semiAveragesForecast': '353', 'movingAverages': '301' }, { 'months': 'Apr-2021', 'actuals': '721', 'tesLcb': '721', 'tesM': '721', 'tesUcb': '721', 'arimaForecast': '721', 'linearRegression': '425', 'semiAveragesForecast': '359', 'movingAverages': '328' }, { 'months': 'May-2021', 'actuals': '', 'tesLcb': '332', 'tesM': '', 'tesUcb': '', 'arimaForecast': '363', 'linearRegression': '439', 'semiAveragesForecast': '364', 'movingAverages': '417' }, { 'months': 'Jun-2021', 'actuals': '', 'tesLcb': '619', 'tesM': '', 'tesUcb': '', 'arimaForecast': '362', 'linearRegression': '453', 'semiAveragesForecast': '370', 'movingAverages': '373' }, { 'months': 'Jul-2021', 'actuals': '', 'tesLcb': '575', 'tesM': '', 'tesUcb': '', 'arimaForecast': '361', 'linearRegression': '468', 'semiAveragesForecast': '375', 'movingAverages': '413' }, { 'months': 'Aug-2021', 'actuals': '', 'tesLcb': '280', 'tesM': '', 'tesUcb': '', 'arimaForecast': '360', 'linearRegression': '482', 'semiAveragesForecast': '381', 'movingAverages': '451' }, { 'months': 'Sep-2021', 'actuals': '', 'tesLcb': '389', 'tesM': '', 'tesUcb': '', 'arimaForecast': '359', 'linearRegression': '496', 'semiAveragesForecast': '386', 'movingAverages': '475' }, { 'months': 'Oct-2021', 'actuals': '', 'tesLcb': '540', 'tesM': '', 'tesUcb': '', 'arimaForecast': '358', 'linearRegression': '510', 'semiAveragesForecast': '391', 'movingAverages': '426' }, { 'months': 'Nov-2021', 'actuals': '', 'tesLcb': '359', 'tesM': '', 'tesUcb': '', 'arimaForecast': '358', 'linearRegression': '525', 'semiAveragesForecast': '397', 'movingAverages': '427' }, { 'months': 'Dec-2021', 'actuals': '', 'tesLcb': '834', 'tesM': '', 'tesUcb': '', 'arimaForecast': '357', 'linearRegression': '539', 'semiAveragesForecast': '402', 'movingAverages': '438' }, { 'months': 'Jan-2022', 'actuals': '', 'tesLcb': '437', 'tesM': '', 'tesUcb': '', 'arimaForecast': '357', 'linearRegression': '553', 'semiAveragesForecast': '408', 'movingAverages': '443' }, { 'months': 'Feb-2022', 'actuals': '', 'tesLcb': '756', 'tesM': '', 'tesUcb': '', 'arimaForecast': '356', 'linearRegression': '567', 'semiAveragesForecast': '413', 'movingAverages': '442' }],
            rangeValue: { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } },
            rangeValue1: { from: { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) }, to: { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date(endDate1).getFullYear(), month: new Date().getMonth() + 1 },
            popoverOpenD: false,
            popoverOpenMa: false,
            popoverOpenSa: false,
            popoverOpenLr: false,
            popoverOpenTes: false,
            popoverOpenArima: false,
            popoverOpenP: false,
            popoverOpenQ: false,
            popoverOpenGamma: false,
            popoverOpenBeta: false,
            popoverOpenAlpha: false,
            popoverOpenSeaonality: false,
            popoverOpenConfidence: false,
            popoverOpenConfidenceLR: false,
            popoverOpenConfidenceArima: false,
            popoverOpenError: false,
            loading: false,
            extrapolationMethodId: -1,
            confidenceLevelId: 0.85,
            confidenceLevelIdLinearRegression: 0.85,
            confidenceLevelIdArima: 0.85,
            showGuidance: false,
            showData: false,
            dataEl: "",
            consumptionListlessTwelve: [],
            missingMonthList: [],
            toggleDataCheck: false,
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
            dataChanged: false,
            noDataMessage: "",
            showFits: false,
            checkIfAnyMissingActualConsumption: false,
            extrapolateClicked: false,
            showDate: false,
            seasonality: 1
        }
        // this.toggleD = this.toggleD.bind(this);
        this.toggleConfidenceLevel = this.toggleConfidenceLevel.bind(this);
        this.toggleConfidenceLevel1 = this.toggleConfidenceLevel1.bind(this);
        this.toggleConfidenceLevel2 = this.toggleConfidenceLevel2.bind(this);
        this.toggle = this.toggle.bind(this)
        this.reset = this.reset.bind(this)
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.pickRange = React.createRef();
        this.getDateDifference = this.getDateDifference.bind(this);
        this._handleClickRangeBox1 = this._handleClickRangeBox1.bind(this)
        this.cancelClicked = this.cancelClicked.bind(this);
        this.handleRangeDissmis1 = this.handleRangeDissmis1.bind(this);
        this.pickRange1 = React.createRef();
        this.seasonalityCheckbox = this.seasonalityCheckbox.bind(this);
    }

    seasonalityCheckbox(event) {
        this.setState({
            seasonality: event.target.checked ? 1 : 0
        });
    }

    componentDidMount = function () {
        this.setState({ loading: true })
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
                console.log("result*******", myResult)
                for (var i = 0; i < myResult.length; i++) {
                    var datasetDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                    var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                    var datasetJson = JSON.parse(datasetData);
                    console.log("datasetJson%%%%", datasetJson);
                    var planningUnitList = datasetJson.planningUnitList.filter(c => c.consuptionForecast && c.active == true);
                    var regionList = datasetJson.regionList;

                    planningUnitList.sort((a, b) => {
                        var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    regionList.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });

                    var forecastProgramJson = {
                        name: datasetJson.programCode + "~v" + myResult[i].version,
                        id: myResult[i].id,
                        regionList: regionList,
                        planningUnitList: planningUnitList,
                        datasetData: datasetJson
                    }

                    forecastProgramList.push(forecastProgramJson)
                }
                var forecastProgramId = "";
                var event = {
                    target: {
                        value: ""
                    }
                };
                if (forecastProgramList.length == 1) {
                    forecastProgramId = forecastProgramList[0].id;
                    event.target.value = forecastProgramList[0].id;
                } else if (localStorage.getItem("sesDatasetId") != "" && forecastProgramList.filter(c => c.id == localStorage.getItem("sesDatasetId")).length > 0) {
                    forecastProgramId = localStorage.getItem("sesDatasetId");
                    event.target.value = localStorage.getItem("sesDatasetId");
                }
                forecastProgramList = forecastProgramList.sort(function (a, b) {
                    a = a.name.toLowerCase();
                    b = b.name.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                this.setState({
                    forecastProgramList: forecastProgramList,
                    loading: false
                }, () => {
                    if (forecastProgramId != "") {
                        this.getPlanningUnitList(event);
                    }
                })
            }.bind(this)
        }.bind(this)
        this.getDateDifference();
    }

    reset() {
        console.log('Inside reset')
        this.componentDidMount();
    }

    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })
    }
    handleRangeDissmis1(value) {
        this.setState({ rangeValue1: value }, () => {
            //  this.setExtrapolatedParameters(0)
            this.getDateDifference()
        })
    }

    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        }, () => {
            this.buildActualJxl();
        })
    }

    touchAllExtrapolation(setTouched, errors, buttonFalg) {
        this.setState({ buttonFalg: buttonFalg })
        console.log("buttonFalg-----?", this.state.buttonFalg)
        setTouched({
            noOfMonthsId: true,
            confidenceLevelId: true,
            confidenceLevelIdLinearRegression: true,
            confidenceLevelIdArima: true,
            seasonalityId: true,
            gammaId: true,
            betaId: true,
            alphaId: true,
            pId: true,
            dId: true,
            qId: true
        });
        this.validateFormExtrapolation(errors)
        //   console.log("8888888888888",f)
        //   if(f){

        //       this.setExtrapolatedParameters()
        //   }
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

    buildActualJxl() {
        //Jexcel table
        var actualConsumptionList = this.state.actualConsumptionList;
        console.log("actualConsumptionList---->", actualConsumptionList)
        var monthArray = this.state.monthArray;
        let rangeValue = this.state.rangeValue1;
        var startMonth = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
        var dataArray = [];
        var data = [];
        console.log("monthArray", monthArray)
        var checkIfAnyMissingActualConsumption = false;
        var consumptionDataArr = [];
        // var rangeValue1 = this.state.rangeValue1;
        // let startDate = rangeValue1.from.year + '-' + rangeValue1.from.month + '-01';
        // let stopDate = rangeValue1.to.year + '-' + rangeValue1.to.month + '-' + new Date(rangeValue1.to.year, rangeValue1.to.month, 0).getDate();
        var minDateForActualConsumption = this.state.minDateForConsumption;
        var monthArrayPart1 = monthArray.filter(c => moment(c).format("YYYY-MM") < moment(minDateForActualConsumption).format("YYYY-MM"));
        var monthArrayPart2 = monthArray.filter(c => moment(c).format("YYYY-MM") >= moment(minDateForActualConsumption).format("YYYY-MM"));
        for (var j = 0; j < monthArrayPart1.length; j++) {
            data = [];
            data[0] = monthArrayPart1[j];
            data[1] = "";
            data[2] = "";
            data[3] = "";
            data[4] = "";
            data[5] = "";
            data[6] = "";
            data[7] = "";
            data[8] = "";
            data[9] = "";
            data[10] = "";
            data[11] = "";
            data[12] = "";
            dataArray.push(data)
        }
        var rangeValue2 = this.state.rangeValue1;
        var startDateFromRangeValue1 = rangeValue2.from.year + '-' + rangeValue2.from.month + '-01';
        var stopDateFromRangeValue1 = rangeValue2.to.year + '-' + rangeValue2.to.month + '-' + new Date(rangeValue2.to.year, rangeValue2.to.month, 0).getDate();
        var actualStartDate = moment.min(actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") >= moment(startDateFromRangeValue1).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(stopDateFromRangeValue1).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId).map(d => moment(d.month)));
        var actualStopDate = moment.max(actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") >= moment(startDateFromRangeValue1).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(stopDateFromRangeValue1).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId).map(d => moment(d.month)));
        for (var j = 0; j < monthArrayPart2.length; j++) {
            data = [];
            data[0] = monthArrayPart2[j];
            var consumptionData = actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayPart2[j]).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId);
            if (checkIfAnyMissingActualConsumption == false && consumptionData.length == 0 && moment(monthArrayPart2[j]).format("YYYY-MM") >= moment(actualStartDate).format("YYYY-MM") && moment(monthArrayPart2[j]).format("YYYY-MM") <= moment(actualStopDate).format("YYYY-MM")) {
                checkIfAnyMissingActualConsumption = true;
            }
            // if (consumptionData.length > 0) {
            //     inputData.push({ "month": inputData.length + 1, "actual": consumptionData[0].amount, "forecast": null })
            // }
            console.log("consumptionData0000000", consumptionData)
            var movingAvgDataFilter = this.state.movingAvgData.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArrayPart2[j]).format("YYYY-MM"))
            console.log("movingAvgDataFilter", movingAvgDataFilter);
            var semiAvgDataFilter = this.state.semiAvgData.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArrayPart2[j]).format("YYYY-MM"))
            var linearRegressionDataFilter = this.state.linearRegressionData.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArrayPart2[j]).format("YYYY-MM"))
            var tesDataFilter = this.state.tesData.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArrayPart2[j]).format("YYYY-MM"))
            var arimaDataFilter = this.state.arimaData.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArrayPart2[j]).format("YYYY-MM"))

            // var CI = this.state.CI;
            //var consumptionData = actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId);
            data[1] = consumptionData.length > 0 ? consumptionData[0].puAmount : "";
            consumptionDataArr.push(consumptionData.length > 0 ? consumptionData[0].puAmount : null);
            data[2] = movingAvgDataFilter.length > 0 && movingAvgDataFilter[0].forecast != null ? movingAvgDataFilter[0].forecast.toFixed(2) : '';
            data[3] = semiAvgDataFilter.length > 0 && semiAvgDataFilter[0].forecast != null ? semiAvgDataFilter[0].forecast.toFixed(2) : '';
            data[4] = linearRegressionDataFilter.length > 0 && linearRegressionDataFilter[0].forecast != null ? linearRegressionDataFilter[0].forecast.toFixed(2) : '';
            data[5] = tesDataFilter.length > 0 && tesDataFilter[0].forecast != null && tesDataFilter[0].ci != undefined && tesDataFilter[0] != null ? (tesDataFilter[0].forecast - tesDataFilter[0].ci).toFixed(2) < 0 ? 0 : (tesDataFilter[0].forecast - tesDataFilter[0].ci).toFixed(2) : '';
            data[6] = tesDataFilter.length > 0 && tesDataFilter[0].forecast != null ? Number(tesDataFilter[0].forecast).toFixed(2) : '';
            data[7] = tesDataFilter.length > 0 && tesDataFilter[0].forecast != null && tesDataFilter[0].ci != undefined && tesDataFilter[0] != null ? (tesDataFilter[0].forecast + tesDataFilter[0].ci).toFixed(2) < 0 ? 0 : (tesDataFilter[0].forecast + tesDataFilter[0].ci).toFixed(2) : '';
            data[8] = arimaDataFilter.length > 0 && arimaDataFilter[0].forecast != null ? arimaDataFilter[0].forecast.toFixed(2) : '';;
            data[9] = linearRegressionDataFilter.length > 0 && linearRegressionDataFilter[0].forecast != null && linearRegressionDataFilter[0].ci != undefined && linearRegressionDataFilter[0] != null ? (linearRegressionDataFilter[0].forecast - linearRegressionDataFilter[0].ci).toFixed(2) < 0 ? 0 : (linearRegressionDataFilter[0].forecast - linearRegressionDataFilter[0].ci).toFixed(2) : '';
            data[10] = linearRegressionDataFilter.length > 0 && linearRegressionDataFilter[0].forecast != null && linearRegressionDataFilter[0].ci != undefined && linearRegressionDataFilter[0] != null ? (linearRegressionDataFilter[0].forecast + linearRegressionDataFilter[0].ci).toFixed(2) < 0 ? 0 : (linearRegressionDataFilter[0].forecast + linearRegressionDataFilter[0].ci).toFixed(2) : '';
            data[11] = arimaDataFilter.length > 0 && arimaDataFilter[0].forecast != null && arimaDataFilter[0].ci != undefined && arimaDataFilter[0] != null ? (arimaDataFilter[0].forecast - arimaDataFilter[0].ci).toFixed(2) < 0 ? 0 : (arimaDataFilter[0].forecast - arimaDataFilter[0].ci).toFixed(2) : '';
            data[12] = arimaDataFilter.length > 0 && arimaDataFilter[0].forecast != null && arimaDataFilter[0].ci != undefined && arimaDataFilter[0] != null ? (arimaDataFilter[0].forecast + arimaDataFilter[0].ci).toFixed(2) < 0 ? 0 : (arimaDataFilter[0].forecast + arimaDataFilter[0].ci).toFixed(2) : '';
            data[13] = linearRegressionDataFilter.length > 0 && linearRegressionDataFilter[0].forecast != null && linearRegressionDataFilter[0].ci != undefined && linearRegressionDataFilter[0] != null ? linearRegressionDataFilter[0].ci : null;
            data[14] = tesDataFilter.length > 0 && tesDataFilter[0].forecast != null && tesDataFilter[0].ci != undefined && tesDataFilter[0] != null ? tesDataFilter[0].ci : null;
            data[15] = arimaDataFilter.length > 0 && arimaDataFilter[0].forecast != null && arimaDataFilter[0].ci != undefined && arimaDataFilter[0] != null ? arimaDataFilter[0].ci : null;
            // data[8] = '';
            dataArray.push(data)
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        try {
            this.el.destroy();
        } catch (error) { }
        var options = {
            data: dataArray,
            columnDrag: true,
            columns:
                [
                    {
                        title: i18n.t('static.inventoryDate.inventoryReport'),
                        type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100
                    },
                    {
                        title: i18n.t('static.extrapolation.adjustedActuals'),
                        type: 'numeric', mask: '#,##.00', decimal: '.'
                    },
                    {
                        title: i18n.t('static.extrapolation.movingAverages'),
                        type: this.state.movingAvgId ? 'numeric' : 'hidden',
                        mask: '#,##.00', decimal: '.'
                    },
                    {
                        title: i18n.t('static.extrapolation.semiAverages'),
                        type: this.state.semiAvgId ? 'numeric' : 'hidden',
                        mask: '#,##.00', decimal: '.'
                    },
                    {
                        title: i18n.t('static.extrapolation.linearRegression'),
                        type: this.state.linearRegressionId ? 'numeric' : 'hidden',
                        mask: '#,##.00', decimal: '.'
                    },
                    {
                        title: i18n.t('static.extrapolation.tesLower'),
                        type: 'hidden',
                        mask: '#,##.00', decimal: '.'
                    },
                    {
                        title: i18n.t('static.extrapolation.tes'),
                        type: this.state.smoothingId ? 'numeric' : 'hidden',
                        mask: '#,##.00', decimal: '.'
                    },
                    {
                        title: i18n.t('static.extrapolation.tesUpper'),
                        type: 'hidden',
                        mask: '#,##.00', decimal: '.'
                    },
                    {
                        title: i18n.t('static.extrapolation.arima'),
                        type: this.state.arimaId ? 'numeric' : 'hidden',
                        mask: '#,##.00', decimal: '.'
                    },
                    {
                        title: i18n.t('static.extrapolation.linearRegression') + " L",
                        type: 'hidden',
                        mask: '#,##.00', decimal: '.'
                    },
                    {
                        title: i18n.t('static.extrapolation.linearRegression') + " H",
                        type: 'hidden',
                        mask: '#,##.00', decimal: '.'
                    },
                    {
                        title: i18n.t('static.extrapolation.arima') + " L",
                        type: 'hidden',
                        mask: '#,##.00', decimal: '.'
                    },
                    {
                        title: i18n.t('static.extrapolation.arima') + " H",
                        type: 'hidden',
                        mask: '#,##.00', decimal: '.'
                    },
                    {
                        title: i18n.t('static.extrapolation.linearRegression') + " CI",
                        type: 'hidden',
                        mask: '#,##.00', decimal: '.'
                    },
                    {
                        title: i18n.t('static.extrapolation.tes') + " CI",
                        type: 'hidden',
                        mask: '#,##.00', decimal: '.'
                    },
                    {
                        title: i18n.t('static.extrapolation.arima') + " CI",
                        type: 'hidden',
                        mask: '#,##.00', decimal: '.'
                    },
                ],
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el.jexcel;
                    var rowData = elInstance.getRowData(y);
                    if (moment(rowData[0]).format("YYYY-MM") < moment(this.state.datasetJson.currentVersion.forecastStartDate).format("YYYY-MM")) {
                        // var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                        // cell.classList.add('jexcelBoldCell');
                        var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelPurpleCell');
                        var cell = elInstance.getCell(("D").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelPurpleCell');
                        var cell = elInstance.getCell(("E").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelPurpleCell');
                        var cell = elInstance.getCell(("F").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelPurpleCell');
                        var cell = elInstance.getCell(("G").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelPurpleCell');
                        var cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelPurpleCell');
                        var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelPurpleCell');
                    } else if (moment(rowData[0]).format("YYYY-MM") >= moment(this.state.datasetJson.currentVersion.forecastStartDate).format("YYYY-MM") &&
                        moment(rowData[0]).format("YYYY-MM") <= moment(this.state.datasetJson.currentVersion.forecastStopDate).format("YYYY-MM")) {
                        // if (rowData[1] !== "") {
                        //     var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                        //     cell.classList.add('jexcelBoldPurpleCell');
                        // } else {
                        var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelBoldPurpleCell');
                        // }
                        var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelBoldPurpleCell');
                        var cell = elInstance.getCell(("D").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelBoldPurpleCell');
                        var cell = elInstance.getCell(("E").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelBoldPurpleCell');
                        var cell = elInstance.getCell(("F").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelBoldPurpleCell');
                        var cell = elInstance.getCell(("G").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelBoldPurpleCell');
                        var cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelBoldPurpleCell');
                        var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelBoldPurpleCell');

                    }
                    if (rowData[1] !== "") {
                        // var cell = elInstance.getCell(("B").concat(parseInt(y) + 1))
                        // cell.classList.add('jexcelBoldCell');
                    }
                }
            }.bind(this),
            onload: this.loaded,
            pagination: false,
            search: false,
            columnSorting: true,
            tableOverflow: true,
            defaultColWidth: 130,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            //  onselection: this.selected,
            // oneditionend: this.onedit,
            editable: false,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            //position: 'top',
            filters: false,
            license: JEXCEL_PRO_KEY,
            columnSorting: false,
            contextMenu: function (obj, x, y, e) {
                return [];
            }.bind(this),
        };
        var dataEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = dataEl;
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

        var minRmse = Math.min(...rmseArr.filter(c => c !== ""));
        var minMape = Math.min(...mapeArr.filter(c => c !== ""));
        var minMse = Math.min(...mseArr.filter(c => c !== ""));
        var minRsqd = Math.min(...rSqdArr.filter(c => c !== ""));
        var minWape = Math.min(...wapeArr.filter(c => c !== ""));
        this.setState({
            dataEl: dataEl,
            minRmse: minRmse,
            minMape: minMape,
            minMse: minMse,
            minRsqd: minRsqd,
            minWape: minWape,
            loading: false,
            consumptionData: consumptionDataArr,
            checkIfAnyMissingActualConsumption: checkIfAnyMissingActualConsumption
        })
    }

    buildJxl() {
        this.setState({ loading: true })
        var actualConsumptionList = this.state.actualConsumptionList;
        var rangeValue1 = this.state.rangeValue1;
        let startDate = rangeValue1.from.year + '-' + rangeValue1.from.month + '-01';
        let stopDate = rangeValue1.to.year + '-' + rangeValue1.to.month + '-' + new Date(rangeValue1.to.year, rangeValue1.to.month, 0).getDate();
        var rangeValue = this.state.rangeValue;
        let startDate1 = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
        let stopDate1 = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
        var minStartDate = startDate1;
        var maxStopDate = stopDate1;
        if (moment(startDate1).format("YYYY-MM") > moment(startDate).format("YYYY-MM")) {
            minStartDate = startDate;
        }
        if (moment(stopDate1).format("YYYY-MM") < moment(stopDate).format("YYYY-MM")) {
            maxStopDate = stopDate;
        }
        var monthArray = [];
        var curDate1 = minStartDate;
        for (var m = 0; curDate1 < moment(maxStopDate).add(-1, 'months').format("YYYY-MM-DD"); m++) {
            curDate1 = moment(minStartDate).add(m, 'months').format("YYYY-MM-DD");
            monthArray.push(curDate1)
        }

        let curDate = startDate;
        var inputDataMovingAvg = [];
        var inputDataSemiAverage = [];
        var inputDataLinearRegression = [];
        var inputDataTes = [];
        var inputDataArima = [];
        var minDateForConsumption = curDate;
        var dataFound = false;
        console.log("Data Found@@@@@@@@@@@", dataFound);
        var maxDateWithinRange1 = moment.max(actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") >= moment(startDate).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId).map(d => moment(d.month)))
        for (var j = 0; moment(curDate).format("YYYY-MM") < moment(maxDateWithinRange1).format("YYYY-MM"); j++) {
            curDate = moment(startDate).startOf('month').add(j, 'months').format("YYYY-MM-DD");
            var consumptionData = actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId)
            if (!dataFound && consumptionData.length == 0) {
                minDateForConsumption = curDate;
            }
            if (!dataFound && consumptionData.length > 0) {
                dataFound = true
            }
            console.log("minDateForConsumption@@@@@@@@@@@", minDateForConsumption);
            //   var consumptionData = actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM"))
            //    && c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId)
            console.log("consumptionData--->", consumptionData)
            if (dataFound) {
                console.log("Month@@@@@@@@@@@", inputDataLinearRegression.length + 1);
                console.log("Data1@@@@@@@@@@@", consumptionData)
                console.log("Value@@@@@@@@@@@", consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null);
                inputDataMovingAvg.push({ "month": inputDataMovingAvg.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
                inputDataSemiAverage.push({ "month": inputDataSemiAverage.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
                inputDataLinearRegression.push({ "month": inputDataLinearRegression.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
                inputDataTes.push({ "month": inputDataTes.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
                inputDataArima.push({ "month": inputDataArima.length + 1, "actual": consumptionData.length > 0 ? Number(consumptionData[0].puAmount) : null, "forecast": null })
            }
        }
        const noOfMonthsForProjection = monthArray.length - inputDataMovingAvg.length;
        this.setState({
            monthArray: monthArray,
            minDateForConsumption: minDateForConsumption
        })
        try {
            if (inputDataMovingAvg.filter(c => c.actual != null).length < 3 || (this.state.smoothingId && inputDataMovingAvg.filter(c => c.actual != null).length < 24) || (this.state.arimaId && inputDataMovingAvg.filter(c => c.actual != null).length < 14)) {
                // this.el = jexcel(document.getElementById("tableDiv"), '');
                // this.el.destroy();
                // this.setState({
                //     loading: false,
                //     showData: false,
                //     dataChanged: false,
                //     extrapolateClicked: false,
                //     show: false,
                //     dataEl: ""
                // })
                alert(i18n.t('static.tree.minDataRequiredToExtrapolateNote1') + inputDataMovingAvg.filter(c => c.actual != null).length + i18n.t('static.tree.minDataRequiredToExtrapolateNote2') + i18n.t('static.tree.minDataRequiredToExtrapolate'))
            }
            // } else {
            if (inputDataMovingAvg.filter(c => c.actual != null).length >= 3) {
                if (this.state.movingAvgId && inputDataMovingAvg.filter(c => c.actual != null).length >= 3) {
                    calculateMovingAvg(inputDataMovingAvg, this.state.monthsForMovingAverage, noOfMonthsForProjection, this);
                }
                if (this.state.semiAvgId && inputDataMovingAvg.filter(c => c.actual != null).length >= 3) {
                    calculateSemiAverages(inputDataSemiAverage, noOfMonthsForProjection, this);
                }
                if (this.state.linearRegressionId && inputDataMovingAvg.filter(c => c.actual != null).length >= 3) {
                    calculateLinearRegression(inputDataLinearRegression, this.state.confidenceLevelIdLinearRegression, noOfMonthsForProjection, this, false);
                }
                console.log("inputDataTes.length+++", inputDataTes.length);
                // if (inputDataTes.length >= (this.state.noOfMonthsForASeason * 2)) {
                if (this.state.smoothingId && inputDataMovingAvg.filter(c => c.actual != null).length >= 24) {
                    calculateTES(inputDataTes, this.state.alpha, this.state.beta, this.state.gamma, this.state.confidenceLevelId, noOfMonthsForProjection, this, minStartDate, false);
                }
                if (this.state.arimaId && inputDataMovingAvg.filter(c => c.actual != null).length >= 14) {
                    calculateArima(inputDataArima, this.state.p, this.state.d, this.state.q, this.state.confidenceLevelIdArima, noOfMonthsForProjection, this, minStartDate, false, this.state.seasonality);
                }
                this.setState({
                    extrapolateClicked: true
                })
            } else {
                // this.setState({
                //     loading: false
                // },()=>{
                this.buildActualJxl();
                // })
            }
            // }
        } catch (error) {
            console.log("Error@@@@@@", error)
            // this.el = jexcel(document.getElementById("tableDiv"), '');
            // this.el.destroy();
            this.setState({
                // showData: false,
                // dataEl: "",
                loading: false,
                noDataMessage: i18n.t('static.extrapolation.errorOccured'),
                dataChanged: true,
                // show: false
            })
        }
        // } else {
        //     this.setState({
        //         tesData: [],
        //         CI: 0,
        //         tesError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" }
        //     })
        // }
    }

    loaded = function (instance, cell, x, y, value) {
        // jExcelLoadedFunctionWithoutPagination(instance);
        jExcelLoadedFunctionOnlyHideRow(instance);
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
        tr.children[3].title = i18n.t('static.tooltip.MovingAverages');
        tr.children[4].title = i18n.t('static.tooltip.SemiAverages');
        tr.children[5].title = i18n.t('static.tooltip.LinearRegression');
        // tr.children[6].title = i18n.t('static.tooltip.Tes');
        tr.children[7].title = i18n.t('static.tooltip.Tes');
        // tr.children[8].title = i18n.t('static.tooltip.arima');
        tr.children[9].title = i18n.t('static.tooltip.arima');
        tr.children[2].title = 'Historic time series data may need to be adjusted for reporting rate and/or for stock out rate to better reflect actual demand. Update these on the "Data Entry and Adjustment" screen.';


    }
    getPlanningUnitList(e) {
        var cont = false;
        if (this.state.dataChanged) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.setState({ loading: true })
            localStorage.setItem("sesDatasetId", e.target.value);
            var forecastProgramId = e.target.value;
            if (forecastProgramId != "") {
                var forecastProgramListFilter = this.state.forecastProgramList.filter(c => c.id == forecastProgramId)[0]
                var regionList = forecastProgramListFilter.regionList;
                var startDate = forecastProgramListFilter.datasetData.currentVersion.forecastStartDate;
                var stopDate = forecastProgramListFilter.datasetData.currentVersion.forecastStopDate;
                var rangeValue = { from: { year: Number(moment(startDate).startOf('month').format("YYYY")), month: Number(moment(startDate).startOf('month').format("M")) }, to: { year: Number(moment(stopDate).startOf('month').format("YYYY")), month: Number(moment(stopDate).startOf('month').format("M")) } }

                var planningUnitList = forecastProgramListFilter.planningUnitList;
                planningUnitList = planningUnitList.filter(c => c.active == true);
                var planningUnitId = "";
                var event = {
                    target: {
                        value: ""
                    }
                };
                if (planningUnitList.length == 1) {
                    planningUnitId = planningUnitList[0].planningUnit.id;
                    event.target.value = planningUnitList[0].planningUnit.id;
                } else if (localStorage.getItem("sesDatasetPlanningUnitId") != "" && planningUnitList.filter(c => c.planningUnit.id == localStorage.getItem("sesDatasetPlanningUnitId")).length > 0) {
                    planningUnitId = localStorage.getItem("sesDatasetPlanningUnitId");
                    event.target.value = localStorage.getItem("sesDatasetPlanningUnitId");
                }

                var regionId = "";
                var regionEvent = {
                    target: {
                        value: ""
                    }
                };
                if (regionList.length == 1) {
                    regionId = regionList[0].regionId;
                    regionEvent.target.value = regionList[0].regionId;
                } else if (localStorage.getItem("sesDatasetRegionId") != "" && regionList.filter(c => c.regionId == localStorage.getItem("sesDatasetRegionId")).length > 0) {
                    regionId = localStorage.getItem("sesDatasetRegionId");
                    regionEvent.target.value = localStorage.getItem("sesDatasetRegionId");
                }
                this.setState({
                    planningUnitList: planningUnitList,
                    forecastProgramId: forecastProgramId,
                    regionList: regionList,
                    datasetJson: forecastProgramListFilter.datasetData,
                    rangeValue: rangeValue,
                    // rangeValue1: rangeValue,
                    // maxDate: { year: new Date(stopDate).getFullYear(), month: new Date(stopDate).getMonth() + 1 },
                    loading: false
                }, () => {
                    if (planningUnitId != "") {
                        this.setPlanningUnitId(event);
                    }
                    if (regionId != "") {
                        this.setRegionId(regionEvent);
                    }
                    this.getDateDifference()
                })
            } else {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
                this.setState({
                    forecastProgramId: forecastProgramId,
                    planningUnitList: [],
                    planningUnitId: "",
                    regionId: "",
                    regionList: [],
                    alpha: 0.2,
                    beta: 0.2,
                    gamma: 0.2,
                    noOfMonthsForASeason: 4,
                    confidence: 0.95,
                    monthsForMovingAverage: 6,
                    confidenceLevelId: 0.85,
                    confidenceLevelIdLinearRegression: 0.85,
                    confidenceLevelIdArima: 0.85,
                    loading: false,
                    showData: false,
                    dataEl: ""
                })
            }
        }
    }



    saveForecastConsumptionExtrapolation() {
        // if ((this.state.movingAvgId && !this.state.monthsForMovingAverageValidate) ||
        //     (this.state.smoothingId && !this.state.noOfMonthsForASeasonValidate) ||
        //     (this.state.confidenceLevelId && !this.state.confidenceValidate)) {
        //     alert("Please provide the valid input");
        // } else {
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
                var datasetRequest = datasetTransaction.get(this.state.forecastProgramId);
                datasetRequest.onerror = function (event) {
                }.bind(this);
                datasetRequest.onsuccess = function (event) {


                    var extrapolationMethodList = extrapolationMethodRequest.result;

                    var myResult = datasetRequest.result;
                    var datasetDataBytes = CryptoJS.AES.decrypt(myResult.programData, SECRET_KEY);
                    var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                    var datasetJson = JSON.parse(datasetData);
                    var consumptionExtrapolationDataUnFiltered = (datasetJson.consumptionExtrapolation);
                    console.log("consumptionExtrapolationDataUnFiltered@@@@@@@@@@", consumptionExtrapolationDataUnFiltered);
                    console.log("this.state.planningUnitId@@@@@@@@@@", this.state.planningUnitId);
                    console.log("this.state.regionId@@@@@@@@@@", this.state.regionId);
                    var consumptionExtrapolationList = (datasetJson.consumptionExtrapolation).filter(c => c.planningUnit.id != this.state.planningUnitId || (c.planningUnit.id == this.state.planningUnitId && c.region.id != this.state.regionId));
                    console.log("consumptionExtrapolationList@@@@@@@@@@", consumptionExtrapolationList);
                    var consumptionExtrapolationData = -1//Semi Averages
                    var consumptionExtrapolationMovingData = -1//Moving averages
                    var consumptionExtrapolationRegression = -1//Linear Regression
                    var consumptionExtrapolationTESL = -1//TES L
                    console.log("consumptionExtrapolationTESL+++", consumptionExtrapolationTESL)
                    var consumptionExtrapolationTESM = -1//TES M
                    var consumptionExtrapolationTESH = -1//TES H

                    var tesData = this.state.tesData;
                    var arimaData = this.state.arimaData;
                    var CI = this.state.CI;
                    var rangeValue = this.state.rangeValue1;
                    let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
                    let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();

                    var inputDataFilter = this.state.semiAvgData;
                    var inputDataAverageFilter = this.state.movingAvgData;
                    var inputDataRegressionFilter = this.state.linearRegressionData;
                    console.log("consumptionExtrapolationData", consumptionExtrapolationData);
                    console.log("inputDataFilter", inputDataFilter);
                    //Semi - averages
                    var id = consumptionExtrapolationDataUnFiltered.length > 0 ? Math.max(...consumptionExtrapolationDataUnFiltered.map(o => o.consumptionExtrapolationId)) + 1 : 1;
                    var planningUnitObj = this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.planningUnitId)[0].planningUnit;
                    var regionObj = this.state.regionList.filter(c => c.regionId == this.state.regionId)[0];
                    console.log("Planning Unit Obj****", planningUnitObj);
                    console.log("Region Obj****", regionObj);
                    var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                    var curUser = AuthenticationService.getLoggedInUserId();
                    var json = this.state.dataEl.getJson(null, false);
                    if (this.state.semiAvgId) {
                        var data = [];
                        for (var i = 0; i < json.length; i++) {
                            data.push({ month: moment((json[i])[0]).format("YYYY-MM-DD"), amount: (json[i])[3], ci: null })
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
                                    startDate: moment(startDate).format("YYYY-MM-DD"),
                                    stopDate: moment(stopDate).format("YYYY-MM-DD")
                                },
                                "createdBy": {
                                    "userId": curUser
                                },
                                "createdDate": curDate,
                                "extrapolationDataList": data
                            })
                        id += 1;
                    }
                    console.log("this.state.monthsForMovingAverage+++", this.state.monthsForMovingAverage)
                    console.log("consumptionExtrapolationMovingData+++", consumptionExtrapolationMovingData);
                    //Moving Averages
                    if (this.state.movingAvgId) {
                        var data = [];
                        for (var i = 0; i < json.length; i++) {
                            data.push({ month: moment((json[i])[0]).format("YYYY-MM-DD"), amount: (json[i])[2], ci: null })
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
                                    startDate: moment(startDate).format("YYYY-MM-DD"),
                                    stopDate: moment(stopDate).format("YYYY-MM-DD")
                                },
                                "createdBy": {
                                    "userId": curUser
                                },
                                "createdDate": curDate,
                                "extrapolationDataList": data
                            })
                        id += 1;

                    }
                    if (this.state.linearRegressionId) {
                        //Linear Regression
                        var data = [];
                        for (var i = 0; i < json.length; i++) {
                            data.push({ month: moment((json[i])[0]).format("YYYY-MM-DD"), amount: (json[i])[4], ci: (json[i])[13] })
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
                                    startDate: moment(startDate).format("YYYY-MM-DD"),
                                    stopDate: moment(stopDate).format("YYYY-MM-DD")
                                },
                                "createdBy": {
                                    "userId": curUser
                                },
                                "createdDate": curDate,
                                "extrapolationDataList": data
                            })
                        id += 1;
                    }
                    //TES L
                    if (this.state.smoothingId) {
                        //TES M
                        console.log("in if2")
                        var data = [];
                        for (var i = 0; i < json.length; i++) {
                            data.push({ month: moment((json[i])[0]).format("YYYY-MM-DD"), amount: (json[i])[6], ci: (json[i])[14] })
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
                                    startDate: moment(startDate).format("YYYY-MM-DD"),
                                    stopDate: moment(stopDate).format("YYYY-MM-DD")
                                },
                                "createdBy": {
                                    "userId": curUser
                                },
                                "createdDate": curDate,
                                "extrapolationDataList": data
                            })
                        id += 1;
                    }

                    //Arima L
                    if (this.state.arimaId) {
                        //TES M
                        console.log("in if2")
                        var data = [];
                        for (var i = 0; i < json.length; i++) {
                            data.push({ month: moment((json[i])[0]).format("YYYY-MM-DD"), amount: (json[i])[8], ci: (json[i])[15] })
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
                                    startDate: moment(startDate).format("YYYY-MM-DD"),
                                    stopDate: moment(stopDate).format("YYYY-MM-DD")
                                },
                                "createdBy": {
                                    "userId": curUser
                                },
                                "createdDate": curDate,
                                "extrapolationDataList": data
                            })
                        id += 1;
                    }

                    console.log('consumptionExtrapolationRegression', consumptionExtrapolationRegression);
                    datasetJson.consumptionExtrapolation = consumptionExtrapolationList;
                    console.log("consumptionExtrapolationList@@@@@@@@@@", consumptionExtrapolationList)
                    datasetData = (CryptoJS.AES.encrypt(JSON.stringify(datasetJson), SECRET_KEY)).toString()
                    myResult.programData = datasetData;
                    var putRequest = datasetTransaction.put(myResult);
                    this.setState({
                        dataChanged: false
                    })
                    putRequest.onerror = function (event) {
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        console.log("save");
                        // let id = AuthenticationService.displayDashboardBasedOnRole();
                        // this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.compareAndSelect.dataSaved'));
                        this.setState({
                            // dataEl: "",
                            loading: false,
                            dataChanged: false,
                            message: i18n.t('static.compareAndSelect.dataSaved'),
                            extrapolateClicked: false
                        }, () => {
                            this.hideFirstComponent();
                            this.componentDidMount()
                        })


                        // console.log(" after save",this.state.message);
                        // , () => {
                        //     this.componentDidMount();
                        // })

                    }.bind(this);
                }.bind(this);
            }.bind(this);
        }.bind(this);
        // }
    }
    hideFirstComponent() {
        document.getElementById('div2').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    setPlanningUnitId(e) {
        var cont = false;
        if (this.state.dataChanged) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            var planningUnitId = e.target.value;
            localStorage.setItem("sesDatasetPlanningUnitId", e.target.value);
            this.el = jexcel(document.getElementById("tableDiv"), '');
            this.el.destroy();
            this.setState({
                planningUnitId: planningUnitId,
                showData: false,
                dataEl: "",
                dataChanged: false
            }, () => {
                // this.setExtrapolatedParameters();
                this.showDataOnPlanningAndRegionChange();
            })
        }
    }

    setRegionId(e) {
        var cont = false;
        if (this.state.dataChanged) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            var regionId = e.target.value;
            localStorage.setItem("sesDatasetRegionId", e.target.value);
            this.el = jexcel(document.getElementById("tableDiv"), '');
            this.el.destroy();
            this.setState({
                regionId: regionId,
                showData: false,
                dataEl: "",
                dataChanged: false
            }, () => {
                // this.setExtrapolatedParameters();
                this.showDataOnPlanningAndRegionChange();
            })
        }
    }

    showDataOnPlanningAndRegionChange() {
        if (this.state.planningUnitId > 0 && this.state.regionId > 0) {
            var datasetJson = this.state.datasetJson;
            var actualConsumptionListForPlanningUnitAndRegion = datasetJson.actualConsumptionList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId);
            var consumptionExtrapolationList = datasetJson.consumptionExtrapolation.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId);
            if (consumptionExtrapolationList.length > 1 && actualConsumptionListForPlanningUnitAndRegion.length > 1) {
                this.setState({ loading: true })
                var startDate1 = moment.min((actualConsumptionListForPlanningUnitAndRegion).map(d => moment(d.month)));
                var minStartDate = startDate1;
                var endDate1 = moment.max((actualConsumptionListForPlanningUnitAndRegion).map(d => moment(d.month)));
                var rangeValue2 = { from: { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) }, to: { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) } };
                var minDate = { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) };
                var maxDate = { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) };
                var actualConsumptionList = datasetJson.actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") >= moment(startDate1).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(endDate1).format("YYYY-MM"));
                var monthArray = [];
                var curDate1 = startDate1;

                var monthsForMovingAverage = this.state.monthsForMovingAverage;
                // var consumptionExtrapolationFiltered = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId);
                var consumptionExtrapolationSemiAvg = consumptionExtrapolationList.filter(c => c.extrapolationMethod.id == 6)//Semi Averages
                var consumptionExtrapolationMovingData = consumptionExtrapolationList.filter(c => c.extrapolationMethod.id == 7)//Moving averages
                var consumptionExtrapolationRegression = consumptionExtrapolationList.filter(c => c.extrapolationMethod.id == 5)//Linear Regression
                var consumptionExtrapolationRegressionL = consumptionExtrapolationList.filter(c => c.extrapolationMethod.id == 10)//Linear Regression L
                var consumptionExtrapolationTESL = consumptionExtrapolationList.filter(c => c.extrapolationMethod.id == 1)//TES L           
                var consumptionExtrapolationTESM = consumptionExtrapolationList.filter(c => c.extrapolationMethod.id == 2)//TES M
                var consumptionExtrapolationTESH = consumptionExtrapolationList.filter(c => c.extrapolationMethod.id == 3)//TES H                      
                var consumptionExtrapolationArima = consumptionExtrapolationList.filter(c => c.extrapolationMethod.id == 4)
                var consumptionExtrapolationArimaL = consumptionExtrapolationList.filter(c => c.extrapolationMethod.id == 8)
                if (consumptionExtrapolationMovingData.length > 0) {
                    if (consumptionExtrapolationMovingData[0].jsonProperties.startDate != undefined) {
                        startDate1 = consumptionExtrapolationMovingData[0].jsonProperties.startDate;
                        minStartDate = startDate1;
                        endDate1 = consumptionExtrapolationMovingData[0].jsonProperties.stopDate;
                        rangeValue2 = { from: { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) }, to: { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) } };
                        minDate = { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) };
                        maxDate = { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) };
                        actualConsumptionList = datasetJson.actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") >= moment(startDate1).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(endDate1).format("YYYY-MM"));
                        curDate1 = startDate1;
                    }
                } else if (consumptionExtrapolationSemiAvg.length > 0) {
                    if (consumptionExtrapolationSemiAvg[0].jsonProperties.startDate != undefined) {
                        startDate1 = consumptionExtrapolationSemiAvg[0].jsonProperties.startDate;
                        minStartDate = startDate1;
                        endDate1 = consumptionExtrapolationSemiAvg[0].jsonProperties.stopDate;
                        rangeValue2 = { from: { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) }, to: { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) } };
                        minDate = { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) };
                        maxDate = { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) };
                        actualConsumptionList = datasetJson.actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") >= moment(startDate1).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(endDate1).format("YYYY-MM"));
                        curDate1 = startDate1;
                    }
                } else if (consumptionExtrapolationRegression.length > 0) {
                    if (consumptionExtrapolationRegression[0].jsonProperties.startDate != undefined) {
                        startDate1 = consumptionExtrapolationRegression[0].jsonProperties.startDate;
                        minStartDate = startDate1;
                        endDate1 = consumptionExtrapolationRegression[0].jsonProperties.stopDate;
                        rangeValue2 = { from: { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) }, to: { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) } };
                        minDate = { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) };
                        maxDate = { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) };
                        actualConsumptionList = datasetJson.actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") >= moment(startDate1).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(endDate1).format("YYYY-MM"));
                        curDate1 = startDate1;
                    }
                } else if (consumptionExtrapolationTESM.length > 0) {
                    if (consumptionExtrapolationTESM[0].jsonProperties.startDate != undefined) {
                        startDate1 = consumptionExtrapolationTESM[0].jsonProperties.startDate;
                        minStartDate = startDate1;
                        endDate1 = consumptionExtrapolationTESM[0].jsonProperties.stopDate;
                        rangeValue2 = { from: { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) }, to: { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) } };
                        minDate = { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) };
                        maxDate = { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) };
                        actualConsumptionList = datasetJson.actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") >= moment(startDate1).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(endDate1).format("YYYY-MM"));
                        curDate1 = startDate1;
                    }
                } else if (consumptionExtrapolationArima.length > 0) {
                    if (consumptionExtrapolationArima[0].jsonProperties.startDate != undefined) {
                        startDate1 = consumptionExtrapolationArima[0].jsonProperties.startDate;
                        minStartDate = startDate1;
                        endDate1 = consumptionExtrapolationArima[0].jsonProperties.stopDate;
                        rangeValue2 = { from: { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) }, to: { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) } };
                        minDate = { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) };
                        maxDate = { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) };
                        actualConsumptionList = datasetJson.actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") >= moment(startDate1).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(endDate1).format("YYYY-MM"));
                        curDate1 = startDate1;
                    }
                }

                // var movingAvgId = consumptionExtrapolationFiltered.length > 0 ? false : true;
                // var semiAvgId = consumptionExtrapolationFiltered.length > 0 ? false : true;
                // var linearRegressionId = consumptionExtrapolationFiltered.length > 0 ? false : true;
                // var smoothingId = consumptionExtrapolationFiltered.length > 0 ? false : true;
                // var arimaId = consumptionExtrapolationFiltered.length > 0 ? false : true;
                var movingAvgId = false;
                var semiAvgId = false;
                var linearRegressionId = false;
                var smoothingId = false;
                var arimaId = false;
                console.log("consumptionExtrapolationMovingData--->", consumptionExtrapolationMovingData.length)

                if (consumptionExtrapolationMovingData.length > 0) {
                    console.log("Inside If consumptionExtrapolationMovingData--->", consumptionExtrapolationMovingData.length)
                    monthsForMovingAverage = consumptionExtrapolationMovingData[0].jsonProperties.months;
                    movingAvgId = true;
                }
                if (consumptionExtrapolationSemiAvg.length > 0) {
                    semiAvgId = true;
                }
                var confidenceLevelLinearRegression = this.state.confidenceLevelIdLinearRegression;
                if (consumptionExtrapolationRegression.length > 0) {
                    confidenceLevelLinearRegression = consumptionExtrapolationRegression[0].jsonProperties.confidenceLevel;
                    linearRegressionId = true;
                }
                var confidenceLevel = this.state.confidenceLevelId;
                var seasonality = this.state.noOfMonthsForASeason;
                var alpha = this.state.alpha;
                var beta = this.state.beta;
                var gamma = this.state.gamma;
                console.log("smoothingId--->", smoothingId)

                console.log("consumptionExtrapolationTESM--->", consumptionExtrapolationTESM.length)
                if (consumptionExtrapolationTESM.length > 0) {
                    confidenceLevel = consumptionExtrapolationTESM[0].jsonProperties.confidenceLevel;
                    seasonality = consumptionExtrapolationTESM[0].jsonProperties.seasonality;
                    alpha = consumptionExtrapolationTESM[0].jsonProperties.alpha;
                    beta = consumptionExtrapolationTESM[0].jsonProperties.beta;
                    gamma = consumptionExtrapolationTESM[0].jsonProperties.gamma;
                    smoothingId = true;
                }

                var confidenceLevelArima = this.state.confidenceLevelIdArima;
                var p = this.state.p;
                var d = this.state.d;
                var q = this.state.q;
                console.log("smoothingId--->", smoothingId)

                console.log("consumptionExtrapolationTESM--->", consumptionExtrapolationTESM.length)
                if (consumptionExtrapolationArima.length > 0) {
                    confidenceLevelArima = consumptionExtrapolationArima[0].jsonProperties.confidenceLevel;
                    p = consumptionExtrapolationArima[0].jsonProperties.p;
                    d = consumptionExtrapolationArima[0].jsonProperties.d;
                    q = consumptionExtrapolationArima[0].jsonProperties.q;
                    seasonality = consumptionExtrapolationArima[0].jsonProperties.seasonality;
                    arimaId = true;
                }
                // let curDate = startDate;

                var inputDataMovingAvg = [];
                var inputDataSemiAverage = [];
                var inputDataLinearRegression = [];
                var inputDataTes = [];
                var inputDataArima = [];
                console.log("consumptionExtrapolationMovingData", consumptionExtrapolationMovingData)
                console.log("actualConsumptionList", actualConsumptionList)
                var extrapolationMax = datasetJson.currentVersion.forecastStopDate;
                for (var m = 0; moment(curDate1).format("YYYY-MM") < moment(extrapolationMax).format("YYYY-MM"); m++) {
                    curDate1 = moment(minStartDate).add(m, 'months').format("YYYY-MM-DD");
                    monthArray.push(curDate1);
                    console.log("monthArray", monthArray)
                    console.log("movingAvgId", movingAvgId)
                    var actualForMonth = actualConsumptionListForPlanningUnitAndRegion.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate1).format("YYYY-MM"))
                    console.log("CureDate@@@@@@@@@@##############", curDate1)
                    console.log("Actual for month@@@@@@@@@@##############", actualForMonth);
                    console.log("Actual for month@@@@@@@@@@@@@@@@", actualConsumptionListForPlanningUnitAndRegion);
                    if (movingAvgId) {
                        var extrapolationDataMovingAvg = consumptionExtrapolationMovingData[0].extrapolationDataList.filter(e => moment(e.month).format("YYYY-MM") == moment(curDate1).format("YYYY-MM"));
                        inputDataMovingAvg.push({ "month": inputDataMovingAvg.length + 1, "forecast": extrapolationDataMovingAvg.length > 0 && extrapolationDataMovingAvg[0].amount != "" && extrapolationDataMovingAvg[0].amount != null ? Number(Number(extrapolationDataMovingAvg[0].amount).toFixed(2)) : null, "actual": actualForMonth.length > 0 ? Number(actualForMonth[0].puAmount) : null, ci: null })
                    } if (semiAvgId) {
                        var extrapolationDataSemiAvg = consumptionExtrapolationSemiAvg[0].extrapolationDataList.filter(e => moment(e.month).format("YYYY-MM") == moment(curDate1).format("YYYY-MM"));
                        if (moment(curDate1).format("YYYY-MM") == moment(endDate1).format("YYYY-MM") && m % 2 == 0) {
                            inputDataSemiAverage.push({ "month": inputDataSemiAverage.length + 1, "forecast": (extrapolationDataSemiAvg.length > 0 && extrapolationDataSemiAvg[0].amount != "" && extrapolationDataSemiAvg[0].amount != null ? Number(Number(extrapolationDataSemiAvg[0].amount).toFixed(2)) : null), "actual": (actualForMonth.length > 0 ? null : null), ci: null })
                        } else {
                            inputDataSemiAverage.push({ "month": inputDataSemiAverage.length + 1, "forecast": (extrapolationDataSemiAvg.length > 0 && extrapolationDataSemiAvg[0].amount != "" && extrapolationDataSemiAvg[0].amount != null ? Number(Number(extrapolationDataSemiAvg[0].amount).toFixed(2)) : null), "actual": (actualForMonth.length > 0 ? Number(actualForMonth[0].puAmount) : null), ci: null })
                        }
                    } if (linearRegressionId) {
                        var extrapolationDataLinearRegression = consumptionExtrapolationRegression[0].extrapolationDataList.filter(e => moment(e.month).format("YYYY-MM") == moment(curDate1).format("YYYY-MM"));
                        inputDataLinearRegression.push({ "month": inputDataLinearRegression.length + 1, "forecast": extrapolationDataLinearRegression.length > 0 && extrapolationDataLinearRegression[0].amount != "" && extrapolationDataLinearRegression[0].amount != null ? Number(Number(extrapolationDataLinearRegression[0].amount).toFixed(2)) : null, "actual": actualForMonth.length > 0 ? Number(actualForMonth[0].puAmount) : null, "ci": extrapolationDataLinearRegression.length > 0 && extrapolationDataLinearRegression[0].ci != "" && extrapolationDataLinearRegression[0].ci != null ? Number(extrapolationDataLinearRegression[0].ci) : null })
                    } if (smoothingId) {
                        var extrapolationDataInputDataTes = consumptionExtrapolationTESM[0].extrapolationDataList.filter(e => moment(e.month).format("YYYY-MM") == moment(curDate1).format("YYYY-MM"));
                        inputDataTes.push({ "month": inputDataTes.length + 1, "forecast": extrapolationDataInputDataTes.length > 0 && extrapolationDataInputDataTes[0].amount != "" && extrapolationDataInputDataTes[0].amount != null ? Number(Number(extrapolationDataInputDataTes[0].amount).toFixed(2)) : null, "actual": actualForMonth.length > 0 ? Number(actualForMonth[0].puAmount) : null, "ci": extrapolationDataInputDataTes.length > 0 && extrapolationDataInputDataTes[0].ci != "" && extrapolationDataInputDataTes[0].ci != null ? Number(extrapolationDataInputDataTes[0].ci) : null })
                    }
                    if (arimaId) {
                        var extrapolationDataInputDataArima = consumptionExtrapolationArima[0].extrapolationDataList.filter(e => moment(e.month).format("YYYY-MM") == moment(curDate1).format("YYYY-MM"));
                        inputDataArima.push({ "month": inputDataArima.length + 1, "forecast": extrapolationDataInputDataArima.length > 0 && extrapolationDataInputDataArima[0].amount != "" && extrapolationDataInputDataArima[0].amount != null ? Number(Number(extrapolationDataInputDataArima[0].amount).toFixed(2)) : null, "actual": actualForMonth.length > 0 ? Number(actualForMonth[0].puAmount) : null, "ci": extrapolationDataInputDataArima.length > 0 && extrapolationDataInputDataArima[0].ci != "" && extrapolationDataInputDataArima[0].ci != null ? Number(extrapolationDataInputDataArima[0].ci) : null })
                    }
                }
                console.log("@@@@@@@@@@##############", inputDataSemiAverage)
                if (this.state.semiAvgId) {
                    calculateError(inputDataSemiAverage, "semiAvgError", this);
                }
                if (this.state.movingAvgId) {
                    calculateError(inputDataMovingAvg, "movingAvgError", this);
                }
                if (this.state.linearRegressionId) {
                    calculateError(inputDataLinearRegression, "linearRegressionError", this);
                }
                if (this.state.smoothingId) {
                    calculateError(inputDataTes, "tesError", this);
                }
                if (this.state.arimaId) {
                    calculateError(inputDataArima, "arimaError", this);
                }
                console.log("ActualConsumptionList@@@@@@@@@@@@@", actualConsumptionList)
                this.setState({
                    actualConsumptionList: actualConsumptionList,
                    startDate: startDate1,
                    stopDate: endDate1,
                    rangeValue1: rangeValue2,
                    minDate: startDate1,
                    //  maxDate: actualMax,
                    monthsForMovingAverage: monthsForMovingAverage,
                    confidenceLevelId: confidenceLevel,
                    confidenceLevelIdLinearRegression: confidenceLevelLinearRegression,
                    confidenceLevelIdArima: confidenceLevelArima,
                    noOfMonthsForASeason: seasonality,
                    alpha: alpha,
                    beta: beta,
                    gamma: gamma,
                    showData: true,
                    movingAvgId: movingAvgId,
                    semiAvgId: semiAvgId,
                    linearRegressionId: linearRegressionId,
                    smoothingId: smoothingId,
                    arimaId: arimaId,
                    movingAvgData: inputDataMovingAvg,
                    semiAvgData: inputDataSemiAverage,
                    linearRegressionData: inputDataLinearRegression,
                    tesData: inputDataTes,
                    arimaData: inputDataArima,
                    noDataMessage: "",
                    showDate: true,
                    minDate: minDate,
                    maxDate: maxDate,
                    // dataChanged: true,
                    loading: false,
                    monthArray: monthArray,
                    p: p,
                    d: d,
                    q: q,
                    seasonality: seasonality,
                    minDateForConsumption: monthArray[0]
                }, () => {
                    this.getDateDifference()
                    this.buildActualJxl();
                })
            } else {
                var startDate1 = "";
                var endDate1 = "";
                var actualConsumptionList = [];
                if (actualConsumptionListForPlanningUnitAndRegion.length > 1) {
                    startDate1 = moment.min((actualConsumptionListForPlanningUnitAndRegion).map(d => moment(d.month)));
                    endDate1 = moment.max((actualConsumptionListForPlanningUnitAndRegion).map(d => moment(d.month)));
                    actualConsumptionList = datasetJson.actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") >= moment(startDate1).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(endDate1).format("YYYY-MM"));
                    this.setState({
                        rangeValue1: { from: { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) }, to: { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) } },
                        minDate: { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) },
                        maxDate: { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) },
                        showDate: true,
                        actualConsumptionList: actualConsumptionList
                    }, () => {
                        this.getDateDifference()
                    })
                } else {
                    startDate1 = moment(Date.now()).subtract(24, 'months').startOf('month').format("YYYY-MM-DD");
                    endDate1 = moment(Date.now()).startOf('month').format("YYYY-MM-DD")
                    actualConsumptionList = []
                    this.setState({
                        rangeValue1: { from: { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) }, to: { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) } },
                        minDate: { year: Number(moment(startDate1).startOf('month').format("YYYY")), month: Number(moment(startDate1).startOf('month').format("M")) },
                        maxDate: { year: Number(moment(endDate1).startOf('month').format("YYYY")), month: Number(moment(endDate1).startOf('month').format("M")) },
                        showDate: false,
                        dataEl: "",
                        loading: false,
                        noDataMessage: i18n.t('static.extrapolate.noDataFound'),
                        actualConsumptionList: actualConsumptionList
                    }, () => {
                        this.getDateDifference()
                    })
                }
                // var endDate1 = moment(Date.now()).startOf('month').format("YYYY-MM-DD")
                // var startDate = moment("2021-05-01").format("YYYY-MM-DD");
                // var endDate = moment("2022-02-01").format("YYYY-MM-DD");

            }
        }
    }

    setExtrapolatedParameters(updateRangeValue) {
        // if (this.state.planningUnitId <= 0 || this.state.planningUnitId == "") {
        //     alert("Please select the Planning Unit");
        // } else {
        //     if (this.state.regionId <= 0 || this.state.regionId == "") {
        //         alert("Please select the Region");
        //     }
        //     else {
        //         if ((this.state.movingAvgId && !this.state.monthsForMovingAverageValidate) ||
        //             (this.state.smoothingId && !this.state.noOfMonthsForASeasonValidate) ||
        //             (this.state.confidenceLevelId && !this.state.confidenceValidate)) {
        //             alert("Please provide the valid input");
        //         }
        //         else {
        if (this.state.planningUnitId > 0 && this.state.regionId > 0) {

            console.log("Inside if parameter", this.state.loading)
            this.setState({ loading: true })
            console.log("after Inside if parameter", this.state.loading)
            var datasetJson = this.state.datasetJson;
            // Need to filter
            var actualConsumptionListForPlanningUnitAndRegion = datasetJson.actualConsumptionList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId);
            console.log("actualConsumptionListForPlanningUnitAndRegion---->", actualConsumptionListForPlanningUnitAndRegion)
            if (actualConsumptionListForPlanningUnitAndRegion.length > 1) {
                let actualMin = moment.min(actualConsumptionListForPlanningUnitAndRegion.map(d => moment(d.month)));
                let actualMax = moment.max(actualConsumptionListForPlanningUnitAndRegion.map(d => moment(d.month)));
                var rangeValue1 = "";
                if (updateRangeValue == 0) {
                    rangeValue1 = this.state.rangeValue1;
                } else {
                    rangeValue1 = { from: { year: new Date(actualMin).getFullYear(), month: new Date(actualMin).getMonth() + 1 }, to: { year: new Date(actualMax).getFullYear(), month: new Date(actualMax).getMonth() + 1 } }
                }

                var rangeValue = rangeValue1;
                let startDate1 = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
                let stopDate1 = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
                var actualConsumptionList = datasetJson.actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") >= moment(startDate1).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(stopDate1).format("YYYY-MM"));
                console.log("actualConsumptionList--->", actualConsumptionList)
                var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
                var stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
                // var consumptionExtrapolationList = datasetJson.consumptionExtrapolation;

                var monthsForMovingAverage = this.state.monthsForMovingAverage;
                console.log("monthsForMovingAverage after state update---***********", this.state.monthsForMovingAverage);

                // var consumptionExtrapolationFiltered = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId);
                // var consumptionExtrapolationData = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 6)//Semi Averages
                // var consumptionExtrapolationMovingData = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 7)//Moving averages
                // var consumptionExtrapolationRegression = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 5)//Linear Regression
                // var consumptionExtrapolationTESL = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 1)//TES L            
                var movingAvgId = this.state.movingAvgId;
                var semiAvgId = this.state.semiAvgId;
                var linearRegressionId = this.state.linearRegressionId;
                var smoothingId = this.state.smoothingId;
                var arimaId = this.state.arimaId;

                // var movingAvgId = consumptionExtrapolationFiltered.length > 0 ? false : true;
                // var semiAvgId = consumptionExtrapolationFiltered.length > 0 ? false : true;
                // var linearRegressionId = consumptionExtrapolationFiltered.length > 0 ? false : true;
                // var smoothingId = consumptionExtrapolationFiltered.length > 0 ? false : true;
                // var arimaId = consumptionExtrapolationFiltered.length > 0 ? false : true;


                // if (movingAvgId && consumptionExtrapolationMovingData.length > 0) {
                //     monthsForMovingAverage = consumptionExtrapolationMovingData[0].jsonProperties.months;
                // }

                // if (consumptionExtrapolationMovingData.length > 0) {
                //     monthsForMovingAverage = consumptionExtrapolationMovingData[0].jsonProperties.months;
                //     movingAvgId = true;
                // }

                // if (consumptionExtrapolationData.length > 0) {
                //     semiAvgId = true;
                // }

                // if (consumptionExtrapolationRegression.length > 0) {
                //     linearRegressionId = true;
                // }

                var confidenceLevel = this.state.confidenceLevelId;
                var confidenceLevelLinearRegression = this.state.confidenceLevelIdLinearRegression;
                var confidenceLevelArima = this.state.confidenceLevelIdArima;
                var confidenceLevelArima = this.state.confidenceLevelIdArima;
                var seasonality = this.state.noOfMonthsForASeason;
                var alpha = this.state.alpha;
                var beta = this.state.beta;
                var gamma = this.state.gamma;
                var p = this.state.p;
                var d = this.state.d;
                var q = this.state.q;
                var seasonalityArima = this.state.seasonality;
                // if (smoothingId && consumptionExtrapolationTESL.length > 0) {
                //     confidenceLevel = consumptionExtrapolationTESL[0].jsonProperties.confidenceLevel;
                //     seasonality = consumptionExtrapolationTESL[0].jsonProperties.seasonality;
                //     alpha = consumptionExtrapolationTESL[0].jsonProperties.alpha;
                //     beta = consumptionExtrapolationTESL[0].jsonProperties.beta;
                //     gamma = consumptionExtrapolationTESL[0].jsonProperties.gamma;
                // }
                // if (consumptionExtrapolationTESL.length > 0) {
                //     confidenceLevel = consumptionExtrapolationTESL[0].jsonProperties.confidenceLevel;
                //     seasonality = consumptionExtrapolationTESL[0].jsonProperties.seasonality;
                //     alpha = consumptionExtrapolationTESL[0].jsonProperties.alpha;
                //     beta = consumptionExtrapolationTESL[0].jsonProperties.beta;
                //     gamma = consumptionExtrapolationTESL[0].jsonProperties.gamma;
                //     smoothingId = true;
                // }
                console.log("ActualConsumptionList@@@@@@@@@@@@@", actualConsumptionList)
                this.setState({
                    actualConsumptionList: actualConsumptionList,
                    startDate: startDate,
                    stopDate: stopDate,
                    // rangeValue1: rangeValue1,
                    minDate: actualMin,
                    //  maxDate: actualMax,
                    monthsForMovingAverage: monthsForMovingAverage,
                    confidenceLevelId: confidenceLevel,
                    confidenceLevelIdLinearRegression: confidenceLevelLinearRegression,
                    confidenceLevelIdArima: confidenceLevelArima,
                    noOfMonthsForASeason: seasonality,
                    alpha: alpha,
                    beta: beta,
                    gamma: gamma,
                    showData: true,
                    movingAvgId: movingAvgId,
                    semiAvgId: semiAvgId,
                    linearRegressionId: linearRegressionId,
                    smoothingId: smoothingId,
                    arimaId: arimaId,
                    noDataMessage: "",
                    dataChanged: true,
                    loading: false,
                    p: p,
                    d: d,
                    q: q,
                    seasonality: seasonalityArima
                }, () => {
                    this.buildJxl();
                })
            } else {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
                this.setState({
                    showData: false,
                    dataEl: "",
                    loading: false,
                    noDataMessage: i18n.t('static.extrapolate.noDataFound')
                })
            }
        } else {
            this.el = jexcel(document.getElementById("tableDiv"), '');
            this.el.destroy();
            this.setState({
                dataEl: "",
                showData: false,
                loading: false,
                noDataMessage: ""
            })
        }
    }
    //  }
    // }
    // }
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

    exportCSV() {
        var csvRow = [];

        csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' : ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' : ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.user.user') + ' : ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (document.getElementById("forecastProgramId").selectedOptions[0].text.toString().split("~")[0] + " " + (document.getElementById("forecastProgramId").selectedOptions[0].text.toString().split("~")[1])).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (getLabelText(this.state.datasetJson.label, this.state.lang)).replaceAll(' ', '%20') + '"')
        csvRow.push('')

        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("forecastProgramId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.forecastPeriod') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.dashboard.planningunitheader') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.program.region') + ' : ' + document.getElementById("regionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.extrapolation.dateRangeForHistoricData') + ' : ' + this.makeText(this.state.rangeValue1.from) + ' ~ ' + this.makeText(this.state.rangeValue1.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('')

        var columns = [];
        columns.push(i18n.t('static.common.errors'));
        if (this.state.movingAvgId) {
            columns.push(i18n.t('static.extrapolation.movingAverages'))
        }
        if (this.state.semiAvgId) {
            columns.push(i18n.t('static.extrapolation.semiAverages'))
        }
        if (this.state.linearRegressionId) {
            columns.push(i18n.t('static.extrapolation.linearRegression'))
        }
        if (this.state.smoothingId) {
            columns.push(i18n.t('static.extrapolation.tes'))
        }
        if (this.state.arimaId) {
            columns.push(i18n.t('static.extrapolation.arima'))
        }
        let headers = [];
        columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
        var A = [this.addDoubleQuoteToRowContent(headers)];
        var B = [];
        B.push(i18n.t('static.extrapolation.rmse'))
        if (this.state.movingAvgId) {
            B.push(Number(this.state.movingAvgError.rmse).toFixed(3))
        }
        if (this.state.semiAvgId) {
            B.push(Number(this.state.semiAvgError.rmse).toFixed(3))
        }
        if (this.state.linearRegressionId) {
            B.push(Number(this.state.linearRegressionError.rmse).toFixed(3))
        }
        if (this.state.smoothingId) {
            B.push(Number(this.state.tesError.rmse).toFixed(3))
        }
        if (this.state.arimaId) {
            B.push(Number(this.state.arimaError.rmse).toFixed(3))
        }
        if (this.state.arimaId) {
            B.push("")
        }
        A.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.extrapolation.mape'))
        if (this.state.movingAvgId) {
            B.push(Number(this.state.movingAvgError.mape).toFixed(3))
        }
        if (this.state.semiAvgId) {
            B.push(Number(this.state.semiAvgError.mape).toFixed(3))
        }
        if (this.state.linearRegressionId) {
            B.push(Number(this.state.linearRegressionError.mape).toFixed(3))
        }
        if (this.state.smoothingId) {
            B.push(Number(this.state.tesError.mape).toFixed(3))
        }
        if (this.state.arimaId) {
            B.push(Number(this.state.arimaError.mape).toFixed(3))
        }
        if (this.state.arimaId) {
            B.push("")
        }
        A.push(this.addDoubleQuoteToRowContent(B));

        B = [];
        B.push(i18n.t('static.extrapolation.mse'))
        if (this.state.movingAvgId) {
            B.push(Number(this.state.movingAvgError.mse).toFixed(3))
        }
        if (this.state.semiAvgId) {
            B.push(Number(this.state.semiAvgError.mse).toFixed(3))
        }
        if (this.state.linearRegressionId) {
            B.push(Number(this.state.linearRegressionError.mse).toFixed(3))
        }
        if (this.state.smoothingId) {
            B.push(Number(this.state.tesError.mse).toFixed(3))
        }
        if (this.state.arimaId) {
            B.push(Number(this.state.arimaError.mse).toFixed(3))
        }
        if (this.state.arimaId) {
            B.push("")
        }
        A.push(this.addDoubleQuoteToRowContent(B));


        B = [];
        B.push(i18n.t('static.extrapolation.wape'))
        if (this.state.movingAvgId) {
            B.push(Number(this.state.movingAvgError.wape).toFixed(3))
        }
        if (this.state.semiAvgId) {
            B.push(Number(this.state.semiAvgError.wape).toFixed(3))
        }
        if (this.state.linearRegressionId) {
            B.push(Number(this.state.linearRegressionError.wape).toFixed(3))
        }
        if (this.state.smoothingId) {
            B.push(Number(this.state.tesError.wape).toFixed(3))
        }
        if (this.state.arimaId) {
            B.push(Number(this.state.arimaError.wape).toFixed(3))
        }
        if (this.state.arimaId) {
            B.push("")
        }
        A.push(this.addDoubleQuoteToRowContent(B));

        B = [];
        B.push(i18n.t('static.extrapolation.rSquare'))
        if (this.state.movingAvgId) {
            B.push(Number(this.state.movingAvgError.rSqd).toFixed(3))
        }
        if (this.state.semiAvgId) {
            B.push(Number(this.state.semiAvgError.rSqd).toFixed(3))
        }
        if (this.state.linearRegressionId) {
            B.push(Number(this.state.linearRegressionError.rSqd).toFixed(3))
        }
        if (this.state.smoothingId) {
            B.push(Number(this.state.tesError.rSqd).toFixed(3))
        }
        if (this.state.arimaId) {
            B.push(Number(this.state.arimaError.rSqd).toFixed(3))
        }
        if (this.state.arimaId) {
            B.push("")
        }
        A.push(this.addDoubleQuoteToRowContent(B));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        csvRow.push('')
        csvRow.push('')
        headers = [];
        var columns = [];
        columns.push(i18n.t('static.inventoryDate.inventoryReport'))
        columns.push(i18n.t('static.extrapolation.adjustedActuals'))
        if (this.state.movingAvgId) {
            columns.push(i18n.t('static.extrapolation.movingAverages'))
        } if (this.state.semiAvgId) {
            columns.push(i18n.t('static.extrapolation.semiAverages'))
        } if (this.state.linearRegressionId) {
            columns.push(i18n.t('static.extrapolation.linearRegression'))
        }
        if (this.state.smoothingId) {
            // columns.push(i18n.t('static.extrapolation.tesLower'))
            columns.push(i18n.t('static.extrapolation.tes'))
            // columns.push(i18n.t('static.extrapolation.tesUpper'))
        } if (this.state.arimaId) {
            columns.push(i18n.t('static.extrapolation.arima'))
        }
        headers = [];
        columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
        var C = []
        C.push([this.addDoubleQuoteToRowContent(headers)]);
        var B = [];
        var monthArray = this.state.monthArray;
        let rangeValue = this.state.rangeValue1;
        var startMonth = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
        var actualConsumptionList = this.state.actualConsumptionList;
        var CI = this.state.CI;
        for (var j = 0; j < monthArray.length; j++) {
            B = [];
            var consumptionData = actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId)
            var movingAvgDataFilter = this.state.movingAvgData.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))
            var semiAvgDataFilter = this.state.semiAvgData.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))
            var linearRegressionDataFilter = this.state.linearRegressionData.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))
            var tesDataFilter = this.state.tesData.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))
            console.log("consumptionData--->", consumptionData)
            B.push(
                moment(monthArray[j]).format(DATE_FORMAT_CAP_WITHOUT_DATE).toString().replaceAll(',', ' ').replaceAll(' ', '%20'),
                consumptionData.length > 0 ? consumptionData[0].puAmount : "")
            if (this.state.movingAvgId && movingAvgDataFilter.length > 0 && movingAvgDataFilter[0].forecast != null) {
                B.push(movingAvgDataFilter[0].forecast.toFixed(2))
            } if (this.state.semiAvgId && semiAvgDataFilter.length > 0 && semiAvgDataFilter[0].forecast != null) {
                B.push(semiAvgDataFilter[0].forecast.toFixed(2))
            } if (this.state.linearRegressionId && linearRegressionDataFilter.length > 0 && linearRegressionDataFilter[0].forecast != null) {
                B.push(linearRegressionDataFilter[0].forecast.toFixed(2))
            }
            if (this.state.smoothingId && tesDataFilter.length > 0 && tesDataFilter[0].forecast != null) {
                B.push((Number(tesDataFilter[0].forecast) - CI) > 0 ? (Number(tesDataFilter[0].forecast)) - Number(CI).toFixed(2) : '')
            } if (this.state.arimaId) {
                B.push(Number(this.state.dataEl.getColumnData(8)).toFixed(2))
            }

            // B.push(
            //     moment(monthArray[j]).format(DATE_FORMAT_CAP_WITHOUT_DATE).toString().replaceAll(',', ' ').replaceAll(' ', '%20'),
            //     consumptionData.length > 0 ? consumptionData[0].amount : "",
            //     this.state.movingAvgId && movingAvgDataFilter.length > 0 && movingAvgDataFilter[0].forecast != null ? movingAvgDataFilter[0].forecast.toFixed(2) : '',
            //     this.state.semiAvgId && semiAvgDataFilter.length > 0 && semiAvgDataFilter[0].forecast != null ? semiAvgDataFilter[0].forecast.toFixed(2) : '',
            //     this.state.linearRegressionId && linearRegressionDataFilter.length > 0 && linearRegressionDataFilter[0].forecast != null ? linearRegressionDataFilter[0].forecast.toFixed(2) : '',
            //     this.state.smoothingId && tesDataFilter.length > 0 && tesDataFilter[0].forecast != null ? (Number(tesDataFilter[0].forecast) - CI).toFixed(2) : '',
            //     this.state.smoothingId && tesDataFilter.length > 0 && tesDataFilter[0].forecast != null ? Number(tesDataFilter[0].forecast).toFixed(2) : '',
            //     this.state.smoothingId && tesDataFilter.length > 0 && tesDataFilter[0].forecast != null ? (Number(tesDataFilter[0].forecast) + CI).toFixed(2) : '',
            //     this.state.arimaId ? "" : "")

            C.push(this.addDoubleQuoteToRowContent(B));
        }
        for (var i = 0; i < C.length; i++) {
            csvRow.push(C[i].join(","))
        }

        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = document.getElementById("forecastProgramId").selectedOptions[0].text.toString().split("~")[0] + "-" + document.getElementById("forecastProgramId").selectedOptions[0].text.toString().split("~")[1] + "-" + i18n.t('static.dashboard.extrapolation') + "-" + document.getElementById("planningUnitId").selectedOptions[0].text + "-" + document.getElementById("regionId").selectedOptions[0].text + ".csv"
        document.body.appendChild(a)
        a.click()
    }

    // setAlpha(e) {
    //     var alpha = e.target.value;
    //     var testNumber = alpha != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(alpha) : false;
    //     if (this.state.smoothingId && testNumber == false) {
    //         this.setState({
    //             alpha: alpha,
    //             loading: false,
    //             show:false,
    //             showData:false
    //         })
    //     }
    //     else {
    //         this.setState({
    //             alpha: alpha,
    //             show:false,
    //             showData:false,
    //             dataChanged: true
    //         //     dataChanged: true
    //         // }, () => {
    //         //     this.buildJxl();
    //         })
    //     }
    // }

    // setBeta(e) {
    //     var beta = e.target.value;
    //     var testNumber = beta != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(beta) : false;
    //     if (this.state.smoothingId && testNumber == false) {
    //         this.setState({
    //             beta: beta,
    //             loading: false,
    //             show:false,
    //             showData:false
    //         })
    //     }
    //     else {
    //         this.setState({
    //             beta: beta,
    //             show:false,
    //             showData:false,
    //             dataChanged: true
    //         // }, () => {
    //         //     this.buildJxl();
    //         })
    //     }
    // }

    // setGamma(e) {
    //     var gamma = e.target.value;
    //     var testNumber = gamma != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(gamma) : false;
    //     if (this.state.smoothingId && testNumber == false) {
    //         this.setState({
    //             gamma: gamma,
    //             loading: false,
    //             show:false,
    //             showData:false,
    //             dataChanged: true
    //         })
    //     }
    //     else {
    //         this.setState({
    //             gamma: gamma,
    //             show:false,
    //             showData:false,
    //             dataChanged: true
    //         //     dataChanged: true
    //         // }, () => {
    //         //     this.buildJxl();
    //         })
    //     }
    // }

    // setSeasonals(e) {
    //     var seasonals = e.target.value;
    //     var testNumber = seasonals != "" ? (/^(?:[1-9]|[1][0-9]|2[0-4])$/).test(seasonals) : false;
    //     console.log("testNumberS", testNumber);
    //     if (this.state.smoothingId && testNumber == false) {

    //         this.setState({
    //             noOfMonthsForASeason: seasonals,
    //             noOfMonthsForASeasonValidate: false,
    //             loading: false,
    //             show:false,
    //             showData:false
    //         })
    //     }
    //     else {
    //         this.setState({
    //             noOfMonthsForASeason: seasonals,
    //             noOfMonthsForASeasonValidate: true,
    //             show:false,
    //             showData:false,
    //             dataChanged: true
    //         //     dataChanged: true
    //         // }, () => {
    //         //     this.buildJxl()
    //         })
    //     }
    // }

    // setConfidenceLevelId(e) {
    //     var confidenceLevelId = e.target.value;
    //     var testNumber = confidenceLevelId != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(confidenceLevelId) : false;
    //     if (this.state.smoothingId && testNumber == false) {
    //         this.setState({
    //             confidenceLevelId: confidenceLevelId,
    //             confidenceValidate: false,
    //             loading: false,
    //             show:false,
    //             showData:false
    //         })
    //     }
    //     else {
    //         this.setState({
    //             confidenceLevelId: confidenceLevelId,
    //             confidenceValidate: true,
    //             show:false,
    //             showData:false,
    //             dataChanged: true
    //         // }, () => {
    //         //     this.buildJxl()
    //         })
    //     }
    // }

    setMonthsForMovingAverage(e) {
        this.setState({
            // loading: true
        })
        var monthsForMovingAverage = e.target.value;
        this.setState({
            monthsForMovingAverage: monthsForMovingAverage,
            dataChanged: true
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
            dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }

    setConfidenceLevelIdLinearRegression(e) {
        var confidenceLevelIdLinearRegression = e.target.value;
        this.setState({
            confidenceLevelIdLinearRegression: confidenceLevelIdLinearRegression,
            dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }

    setConfidenceLevelIdArima(e) {
        var confidenceLevelIdArima = e.target.value;
        this.setState({
            confidenceLevelIdArima: confidenceLevelIdArima,
            dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }

    setSeasonals(e) {
        var seasonals = e.target.value;
        this.setState({
            noOfMonthsForASeason: seasonals,
            dataChanged: true
            // dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }

    setPId(e) {
        this.setState({
            p: e.target.value,
            dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }
    setDId(e) {
        this.setState({
            d: e.target.value,
            dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }

    setQId(e) {
        this.setState({
            q: e.target.value,
            dataChanged: true
        }, () => {
            // this.buildJxl()
        })
    }


    // setMonthsForMovingAverage(e) {
    //     var monthsForMovingAverage = e.target.value;
    //     var testNumber = true;
    //     testNumber = (/^[\d]*$/).test(monthsForMovingAverage.replaceAll(",", ""));
    //     if (this.state.movingAvgId && (monthsForMovingAverage == "" || testNumber == false)) {
    //         this.setState({
    //             monthsForMovingAverage: monthsForMovingAverage,
    //             monthsForMovingAverageValidate: false,
    //             loading: false,
    //             showData:false,
    //             show:false
    //         })
    //     } else {
    //         this.setState({
    //             //loading: true,
    //             monthsForMovingAverage: monthsForMovingAverage,
    //             monthsForMovingAverageValidate: true,
    //            dataChanged: true,
    //             showData:false,
    //             show:false
    //         // }, () => {
    //         //     this.buildJxl()
    //         })
    //     }
    // }
    setMovingAvgId(e) {
        var movingAvgId = e.target.checked;
        this.setState({
            movingAvgId: movingAvgId,
            show: false,
            dataChanged: true
        }, () => {
            this.buildActualJxl()
        })
    }
    setSemiAvgId(e) {
        var semiAvgId = e.target.checked;
        this.setState({
            semiAvgId: semiAvgId,
            // show:false,
            dataChanged: true
        }, () => {
            this.buildActualJxl()
        })
    }
    setLinearRegressionId(e) {
        var linearRegressionId = e.target.checked;
        this.setState({
            linearRegressionId: linearRegressionId,
            // show:false,
            dataChanged: true
        }, () => {
            this.buildActualJxl()
        })
    }
    setSmoothingId(e) {
        var smoothingId = e.target.checked;
        this.setState({
            smoothingId: smoothingId,
            // show:false,
            dataChanged: true
        }, () => {
            this.buildActualJxl()
        })
    }
    setArimaId(e) {
        var arimaId = e.target.checked;
        this.setState({
            arimaId: arimaId,
            // show:false,
            dataChanged: true
        }, () => {
            this.buildActualJxl()
        })
    }

    setShowFits(e) {
        this.setState({
            showFits: e.target.checked
        })
    }
    // setShowAdvanceId(e) {
    //     var showAdvanceId = e.target.checked;
    //     this.setState({
    //         showAdvanceId: showAdvanceId
    //     })
    // }
    // toggleD() {
    //     this.setState({
    //         popoverOpenD: !this.state.popoverOpenD,
    //     });
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
    toggleConfidenceLevel2() {
        this.setState({
            popoverOpenConfidenceLevel2: !this.state.popoverOpenConfidenceLevel2,
        });
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

    exportPDFDataCheck() {
        const addFooters = doc => {

            const pageCount = doc.internal.getNumberOfPages()

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(6)
            for (var i = 1; i <= pageCount; i++) {
                doc.setPage(i)

                doc.setPage(i)
                doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })
                doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })


            }
        }
        const addHeaders = doc => {

            const pageCount = doc.internal.getNumberOfPages()


            //  var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
            // var reader = new FileReader();

            //var data='';
            // Use fs.readFile() method to read the file 
            //fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
            //}); 
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');

                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.supplyPlan.runDate') + " " + moment(new Date()).format(`${DATE_FORMAT_CAP}`), doc.internal.pageSize.width - 40, 20, {
                    align: 'right'
                })
                doc.text(i18n.t('static.supplyPlan.runTime') + " " + moment(new Date()).format('hh:mm A'), doc.internal.pageSize.width - 40, 30, {
                    align: 'right'
                })
                doc.text(i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername(), doc.internal.pageSize.width - 40, 40, {
                    align: 'right'
                })
                doc.text(document.getElementById("forecastProgramId").selectedOptions[0].text.toString().split("~")[0] + " " + (document.getElementById("forecastProgramId").selectedOptions[0].text.toString().split("~")[1]), doc.internal.pageSize.width - 40, 50, {
                    align: 'right'
                })
                doc.text(getLabelText(this.state.datasetJson.label, this.state.lang), doc.internal.pageSize.width - 40, 60, {
                    align: 'right'
                })
                doc.setFontSize(TITLE_FONT)
                /*doc.addImage(data, 10, 30, {
                  align: 'justify'
                });*/
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.common.dataCheck'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.dashboard.programheader') + ' : ' + document.getElementById("forecastProgramId").selectedOptions[0].text, doc.internal.pageSize.width / 20, 90, {
                        align: 'left'
                    })

                }

            }
        }


        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal')


        var y = 110;

        doc.setFont('helvetica', 'bold')
        var planningText = doc.splitTextToSize(i18n.t('static.commitTree.consumptionForecast'), doc.internal.pageSize.width * 3 / 4);
        // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
        y = y + 20;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 10;
        }

        doc.setFont('helvetica', 'normal')
        planningText = doc.splitTextToSize("a. " + i18n.t('static.commitTree.monthsMissingActualConsumptionValues'), doc.internal.pageSize.width * 3 / 4);
        // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 10;
        }
        this.state.missingMonthList.map((item, i) => {
            doc.setFont('helvetica', 'bold')
            planningText = doc.splitTextToSize(getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : ", doc.internal.pageSize.width * 3 / 4);
            // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
            y = y + 10;
            for (var i = 0; i < planningText.length; i++) {
                if (y > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    y = 80;

                }
                doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
                y = y + 10;
            }
            doc.setFont('helvetica', 'normal')
            planningText = doc.splitTextToSize("" + item.monthsArray, doc.internal.pageSize.width * 3 / 4);
            // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
            y = y + 3;
            for (var i = 0; i < planningText.length; i++) {
                if (y > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    y = 80;

                }
                doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
                y = y + 10;
            }
        })

        doc.setFont('helvetica', 'normal')
        planningText = doc.splitTextToSize("b. " + i18n.t('static.commitTree.puThatDoNotHaveAtleast24MonthsOfActualConsumptionValues'), doc.internal.pageSize.width * 3 / 4);
        // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
        y = y + 20;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 10;
        }
        this.state.consumptionListlessTwelve.map((item, i) => {
            doc.setFont('helvetica', 'bold')
            planningText = doc.splitTextToSize(getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : ", doc.internal.pageSize.width * 3 / 4);
            // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
            y = y + 10;
            for (var i = 0; i < planningText.length; i++) {
                if (y > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    y = 80;

                }
                doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
                y = y + 10;
            }
            doc.setFont('helvetica', 'normal')
            planningText = doc.splitTextToSize("" + item.noOfMonths + " month(s)", doc.internal.pageSize.width * 3 / 4);
            // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
            y = y + 3;
            for (var i = 0; i < planningText.length; i++) {
                if (y > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    y = 80;

                }
                doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
                y = y + 10;
            }
        })
        addHeaders(doc)
        addFooters(doc)
        doc.save(document.getElementById("forecastProgramId").selectedOptions[0].text.toString().split("~")[0] + "-" + document.getElementById("forecastProgramId").selectedOptions[0].text.toString().split("~")[1] + "-" + i18n.t('static.dashboard.extrapolation') + "-" + i18n.t('static.common.dataCheck') + '.pdf');
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
                    {getLabelText(item.planningUnit.label, this.state.lang) + " | " + item.planningUnit.id}
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

        const { missingMonthList } = this.state;
        let missingMonths = missingMonthList.length > 0 && missingMonthList.map((item, i) => {
            return (
                <li key={i}>
                    <div><span><b>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : "}</b>{"" + item.monthsArray}</span></div>
                </li>
            )
        }, this);

        //Consumption : planning unit less 12 month
        const { consumptionListlessTwelve } = this.state;
        let consumption = consumptionListlessTwelve.length > 0 && consumptionListlessTwelve.map((item, i) => {
            return (
                <li key={i}>
                    <div><span><b>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : "}</b></span><span>{item.noOfMonths + " month(s)"}</span></div>
                </li>
            )
        }, this);

        const options = {
            title: {
                display: true,
                text: this.state.planningUnitId > 0 && this.state.regionId > 0 ? document.getElementById("regionId").selectedOptions[0].text + " " + i18n.t('static.extrpolation.graphTitlePart1') + document.getElementById("planningUnitId").selectedOptions[0].text.split("|")[0] : ""
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: i18n.t('static.report.consupmtionqty'),
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
                            autoSkip: false,
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
                },
                intersect: false

            },

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
        let json = [];
        try {
            json = this.state.dataEl.getJson(null, false);
        } catch (error) {
            json = []
        }
        console.log("json.map(item=>item[1])@@@@@@@@@@@@@@@", json.map(item => Number(item[1])))
        let datasets = [];
        var count = 0;
        if (this.state.showFits == false) {
            json.map((item, c) => {
                if (item[1] !== "") {
                    count = c;
                }
            })
        }
        // count = count - 1;
        console.log("count@@@@@@@@@@@@@@", count)
        datasets.push({
            type: "line",
            pointRadius: 0,
            lineTension: 0,
            label: i18n.t('static.extrapolation.adjustedActuals'),
            backgroundColor: 'transparent',
            borderColor: '#002F6C',
            ticks: {
                fontSize: 2,
                fontColor: 'transparent',
            },
            showInLegend: true,
            pointStyle: 'line',
            pointBorderWidth: 5,
            yValueFormatString: "###,###,###,###",
            data: json.map(item => item[1] !== "" ? item[1] : null)
        })

        let stopDate = this.state.rangeValue1.to.year + '-' + (this.state.rangeValue1.to.month) + '-' + new Date(this.state.rangeValue1.to.year, this.state.rangeValue1.to.month, 0).getDate()
        stopDate = moment(stopDate).format("YYYY-MM-DD");
        let startDate = this.state.rangeValue1.from.year + '-' + (this.state.rangeValue1.from.month) + '-01'
        startDate = moment(startDate).format("YYYY-MM-DD");
        console.log("this.state.movingAvgData@@@@@@@@@@@@", this.state.movingAvgData);

        if (this.state.movingAvgId) {
            datasets.push(
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t('static.extrapolation.movingAverages'),
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
                    data: json.map((item, c) => c >= count && item[2] !== "" ? item[2] : null)
                })
        }
        if (this.state.semiAvgId) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t('static.extrapolation.semiAverages'),
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
                data: json.map((item, c) => c >= count && item[3] !== "" ? item[3] : null)
            })
        }
        if (this.state.linearRegressionId) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t("static.extrapolation.lrLower"),
                backgroundColor: 'transparent',
                borderColor: '#EDB944',
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
                data: json.map((item, c) => c >= count && item[9] !== "" ? item[9] : null)
            })
            datasets.push(
                {
                    type: "line",
                    pointRadius: 0,
                    lineTension: 0,
                    label: i18n.t('static.extrapolation.linearRegression'),
                    backgroundColor: 'transparent',
                    borderColor: '#EDB944',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointBorderWidth: 5,
                    yValueFormatString: "###,###,###,###",
                    data: json.map((item, c) => c >= count && item[4] !== "" ? item[4] : null)
                })
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t("static.extrapolation.lrUpper"),
                backgroundColor: 'transparent',
                borderColor: '#EDB944',
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
                data: json.map((item, c) => c >= count && item[10] !== "" ? item[10] : null)
            })
        }
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
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                yValueFormatString: "###,###,###,###",
                data: json.map((item, c) => c >= count && item[5] !== "" ? item[5] : null)
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
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                yValueFormatString: "###,###,###,###",
                data: json.map((item, c) => c >= count && item[6] !== "" ? item[6] : null)
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
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointBorderWidth: 5,
                yValueFormatString: "###,###,###,###",
                data: json.map((item, c) => c >= count && item[7] !== "" ? item[7] : null)
            })
        }
        if (this.state.arimaId) {
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t("static.extrapolation.arimaLower"),
                backgroundColor: 'transparent',
                borderColor: '#651D32',
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
                data: json.map((item, c) => c >= count && item[11] !== "" ? item[11] : null)
            })
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t('static.extrapolation.arima'),
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
                data: json.map((item, c) => c >= count && item[8] !== "" ? item[8] : null)
            })
            datasets.push({
                type: "line",
                pointRadius: 0,
                lineTension: 0,
                label: i18n.t("static.extrapolation.arimaUpper"),
                backgroundColor: 'transparent',
                borderColor: '#651D32',
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
                data: json.map((item, c) => c >= count && item[12] !== "" ? item[12] : null)
            })
        }
        let line = {};
        if (this.state.showData) {
            line = {
                labels: json.map(c => moment(c[0]).format("MMM-YYYY")),
                datasets: datasets
            }
        }


        return (
            <div className="animated fadeIn">
                <Prompt
                    when={this.state.dataChanged}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <h5 className={"green"} id="div2">{this.state.message}</h5>

                <Card>

                    <div className="card-header-actions">
                        <div className="Card-header-reporticon">
                            <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                            <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                            <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/dataentry/consumptionDataEntryAndAdjustment" className="supplyplanformulas">{i18n.t('static.dashboard.dataEntryAndAdjustments')}</a></span>
                            <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href="/#/report/compareAndSelectScenario" className="supplyplanformulas">{i18n.t('static.dashboard.compareAndSelect')}</a></span><br />
                            {/* <strong>{i18n.t('static.dashboard.supplyPlan')}</strong> */}

                            {/* <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                            </a>
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
                        </div>
                    </div>
                    <div className="Card-header-reporticon pb-0">
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                            </a>
                            {this.state.showData && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />}
                            {/* <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
                        </div>
                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        <Form name='simpleForm'>
                            <div className=" pl-0">
                                <div className="row">
                                    <FormGroup className="col-md-3 ">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
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
                                    {/* <FormGroup className="col-md-3">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.common.forecastPeriod')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
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
                                                <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} />
                                            </Picker>

                                        </div>
                                    </FormGroup> */}
                                    <FormGroup className="col-md-6 ">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.planningunitheader')}</Label>
                                        <div className="controls ">
                                            <Input
                                                type="select"
                                                name="planningUnitId"
                                                id="planningUnitId"
                                                bsSize="sm"
                                                value={this.state.planningUnitId}
                                                onChange={(e) => { this.setPlanningUnitId(e); }}
                                            // className="selectWrapText"
                                            >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {planningUnits}
                                            </Input>
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="col-md-3 ">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.program.region')}</Label>
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
                                    {this.state.showDate && <><FormGroup className="col-md-12">
                                        <h5>
                                            {this.state.planningUnitId > 0 && i18n.t('static.common.for')}{" "}<b>{this.state.planningUnitId > 0 &&
                                                document.getElementById("planningUnitId").selectedOptions[0].text}</b>
                                            {this.state.regionId > 0 &&
                                                " " + i18n.t('static.common.and') + " "}<b>{this.state.regionId > 0 && document.getElementById("regionId").selectedOptions[0].text + (" ")}</b> {this.state.regionId > 0 && i18n.t('static.extrpolate.selectYourExtrapolationParameters')}
                                        </h5>
                                    </FormGroup>
                                        <FormGroup className="col-md-4">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.dateRangeForHistoricData') + "    "}<i>(Forecast: {this.state.forecastProgramId != "" && makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)})</i> </Label>
                                            <div className="controls edit">
                                                <Picker
                                                    years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                    ref={this.pickRange1}
                                                    value={rangeValue1}
                                                    lang={pickerLang}
                                                    key={JSON.stringify(rangeValue1)}
                                                    // theme="light"
                                                    //  onChange={this.getDateDifference}
                                                    onDismiss={this.handleRangeDissmis1}
                                                    readOnly
                                                >
                                                    <MonthBox value={makeText(rangeValue1.from) + ' ~ ' + makeText(rangeValue1.to)} onClick={this._handleClickRangeBox1} />
                                                </Picker>
                                            </div>
                                        </FormGroup>
                                        <div className="MorginTopMonth">
                                            <Label>{this.state.monthsDiff} {i18n.t('static.report.month')}</Label>
                                        </div></>}

                                </div>
                            </div>
                        </Form>
                        <Formik
                            enableReinitialize={true}
                            initialValues={{
                                noOfMonthsId: this.state.monthsForMovingAverage,
                                confidenceLevelId: this.state.confidenceLevelId,
                                confidenceLevelIdLinearRegression: this.state.confidenceLevelIdLinearRegression,
                                confidenceLevelIdArima: this.state.confidenceLevelIdArima,
                                seasonalityId: this.state.noOfMonthsForASeason,
                                gammaId: this.state.gamma,
                                betaId: this.state.beta,
                                alphaId: this.state.alpha,
                                pId: this.state.p,
                                dId: this.state.d,
                                qId: this.state.q
                            }}
                            validate={validateExtrapolation(validationSchemaExtrapolation)}
                            onSubmit={(values, { setSubmitting, setErrors }) => {
                                var flag = this.state.buttonFalg;
                                console.log("BUTTON^^^^^^^^^", flag)
                                if (flag) {
                                    this.saveForecastConsumptionExtrapolation();
                                    console.log("BUTTON^^^^^^^^^save");
                                } else {
                                    this.setExtrapolatedParameters();
                                    console.log("BUTTON^^^^^^^^^Extrapolate");
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
                                    setFieldTouched,
                                    setFieldError
                                }) => (
                                    <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='userForm' autocomplete="off">

                                        <div className="col-md-12 pl-lg-0">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.selectExtrapolationMethod')}</Label>
                                        </div>
                                        <div className="col-md-12 pl-lg-1">
                                            <FormGroup className="">
                                                <div className="check inline  pl-lg-3 pt-lg-3">
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenMa} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)}>
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
                                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                            <b>{i18n.t('static.extrapolation.movingAverages')}</b>
                                                            <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                        </Label>
                                                    </div>
                                                    <div className="col-md-2 pt-lg-2" style={{ display: this.state.movingAvgId ? '' : 'none' }}>
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

                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenSa} target="Popover2" trigger="hover" toggle={() => this.toggle('popoverOpenSa', !this.state.popoverOpenSa)}>
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
                                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                            <b>{i18n.t('static.extrapolation.semiAverages')}</b>
                                                            <i class="fa fa-info-circle icons pl-lg-2" id="Popover2" onClick={() => this.toggle('popoverOpenSa', !this.state.popoverOpenSa)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                        </Label>
                                                    </div>
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenLr} target="Popover3" trigger="hover" toggle={() => this.toggle('popoverOpenLr', !this.state.popoverOpenLr)}>
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
                                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                            <b>{i18n.t('static.extrapolation.linearRegression')}</b>
                                                            <i class="fa fa-info-circle icons pl-lg-2" id="Popover3" onClick={() => this.toggle('popoverOpenLr', !this.state.popoverOpenLr)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                        </Label>
                                                    </div>
                                                    <div className="row col-md-12 pt-lg-2" style={{ display: this.state.linearRegressionId ? '' : 'none' }}>
                                                        <div>
                                                            <Popover placement="top" isOpen={this.state.popoverOpenConfidenceLevel} target="Popover60" trigger="hover" toggle={this.toggleConfidenceLevel}>
                                                                <PopoverBody>{i18n.t('static.tooltip.confidenceLevel')}</PopoverBody>
                                                            </Popover>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.confidenceLevel')}
                                                                <i class="fa fa-info-circle icons pl-lg-2" id="Popover60" onClick={this.toggleConfidenceLevel} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
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
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenTes} target="Popover4" trigger="hover" toggle={() => this.toggle('popoverOpenTes', !this.state.popoverOpenTes)}>
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
                                                            onClick={(e) => { this.setSmoothingId(e); }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                            <b>{i18n.t('static.extrapolation.tripleExponential')}</b>
                                                            <i class="fa fa-info-circle icons pl-lg-2" id="Popover4" onClick={() => this.toggle('popoverOpenTes', !this.state.popoverOpenTes)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                        </Label>
                                                    </div>

                                                    <div className="row col-md-12 pt-lg-2" style={{ display: this.state.smoothingId ? '' : 'none' }}>
                                                        <div>
                                                            <Popover placement="top" isOpen={this.state.popoverOpenConfidenceLevel1} target="Popover61" trigger="hover" toggle={this.toggleConfidenceLevel1}>
                                                                <PopoverBody>{i18n.t('static.tooltip.confidenceLevel')}</PopoverBody>
                                                            </Popover>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.confidenceLevel')}
                                                                <i class="fa fa-info-circle icons pl-lg-2" id="Popover61" onClick={this.toggleConfidenceLevel} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                            </Label>
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
                                                                <option value="0.85">85%</option>
                                                                <option value="0.90">90%</option>
                                                                <option value="0.95">95%</option>
                                                                <option value="0.99">99%</option>
                                                                <option value="0.995">99.5%</option>
                                                                <option value="0.999">99.9%</option>
                                                            </Input>
                                                            <FormFeedback>{errors.confidenceLevelId}</FormFeedback>
                                                        </div>
                                                        <div style={{ display: 'none' }}>
                                                            <Popover placement="top" isOpen={this.state.popoverOpenSeaonality} target="Popover7" trigger="hover" toggle={() => this.toggle('popoverOpenSeaonality', !this.state.popoverOpenSeaonality)}>
                                                                <PopoverBody>{i18n.t('static.tooltip.seasonality')}</PopoverBody>
                                                            </Popover>
                                                        </div>
                                                        <div className="col-md-2" style={{ display: 'none' }}>
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.seasonality')}
                                                                <i class="fa fa-info-circle icons pl-lg-2" id="Popover7" onClick={() => this.toggle('popoverOpenSeaonality', !this.state.popoverOpenSeaonality)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                            </Label>
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
                                                        <div>
                                                            <Popover placement="top" isOpen={this.state.popoverOpenAlpha} target="Popover8" trigger="hover" toggle={() => this.toggle('popoverOpenAlpha', !this.state.popoverOpenAlpha)}>
                                                                <PopoverBody>{i18n.t('static.tooltip.alpha')}</PopoverBody>
                                                            </Popover>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.alpha')}
                                                                <i class="fa fa-info-circle icons pl-lg-2" id="Popover8" onClick={() => this.toggle('popoverOpenAlpha', !this.state.popoverOpenAlpha)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                            </Label>
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
                                                        <div>
                                                            <Popover placement="top" isOpen={this.state.popoverOpenBeta} target="Popover9" trigger="hover" toggle={() => this.toggle('popoverOpenBeta', !this.state.popoverOpenBeta)}>
                                                                <PopoverBody>{i18n.t('static.tooltip.beta')}</PopoverBody>
                                                            </Popover>
                                                        </div>

                                                        <div className="col-md-2">
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.beta')}
                                                                <i class="fa fa-info-circle icons pl-lg-2" id="Popover9" onClick={() => this.toggle('popoverOpenBeta', !this.state.popoverOpenBeta)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                            </Label>
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

                                                        <div>
                                                            <Popover placement="top" isOpen={this.state.popoverOpenGamma} target="Popover10" trigger="hover" toggle={() => this.toggle('popoverOpenGamma', !this.state.popoverOpenGamma)}>
                                                                <PopoverBody>{i18n.t('static.tooltip.gamma')}</PopoverBody>
                                                            </Popover>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.gamma')}
                                                                <i class="fa fa-info-circle icons pl-lg-2" id="Popover10" onClick={() => this.toggle('popoverOpenGamma', !this.state.popoverOpenGamma)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                            </Label>
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

                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenArima} target="Popover5" trigger="hover" toggle={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)}>
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
                                                            onClick={(e) => { this.setArimaId(e); }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                            <b>{i18n.t('static.extrapolation.arimaFull')}</b>
                                                            <i class="fa fa-info-circle icons pl-lg-2" id="Popover5" onClick={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                        </Label>
                                                    </div>

                                                    <div className="row col-md-12 pt-lg-2" style={{ display: this.state.arimaId ? '' : 'none' }}>
                                                        <div>
                                                            <Popover placement="top" isOpen={this.state.popoverOpenConfidenceLevel2} target="Popover62" trigger="hover" toggle={this.toggleConfidenceLevel2}>
                                                                <PopoverBody>{i18n.t('static.tooltip.confidenceLevel')}</PopoverBody>
                                                            </Popover>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.confidenceLevel')}
                                                                <i class="fa fa-info-circle icons pl-lg-2" id="Popover62" onClick={this.toggleConfidenceLevel2} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                            </Label>
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
                                                        <div>
                                                            <Popover placement="top" isOpen={this.state.popoverOpenP} target="Popover11" trigger="hover" toggle={() => this.toggle('popoverOpenP', !this.state.popoverOpenP)}>
                                                                <PopoverBody>{i18n.t('static.tooltip.p')}</PopoverBody>
                                                            </Popover>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.p')}
                                                                <i class="fa fa-info-circle icons pl-lg-2" id="Popover11" onClick={() => this.toggle('popoverOpenP', !this.state.popoverOpenP)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                            </Label>
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
                                                        <div>
                                                            <Popover placement="top" isOpen={this.state.popoverOpenD} target="Popover14" trigger="hover" toggle={() => this.toggle('popoverOpenD', !this.state.popoverOpenD)}>
                                                                <PopoverBody>{i18n.t('static.tooltip.d')}</PopoverBody>
                                                            </Popover>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.d')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover14" onClick={() => this.toggle('popoverOpenD', !this.state.popoverOpenD)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                        <div>
                                                            <Popover placement="top" isOpen={this.state.popoverOpenQ} target="Popover12" trigger="hover" toggle={() => this.toggle('popoverOpenQ', !this.state.popoverOpenQ)}>
                                                                <PopoverBody>{i18n.t('static.tooltip.q')}</PopoverBody>
                                                            </Popover>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.q')}
                                                                <i class="fa fa-info-circle icons pl-lg-2" id="Popover12" onClick={() => this.toggle('popoverOpenQ', !this.state.popoverOpenQ)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                            </Label>
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
                                            </FormGroup>
                                        </div>

                                        {/* </div> */}
                                        {/* <div className="col-md-12">
                                <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.reset}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"> </i>Submit</Button>
                            </div> */}
                                        {/* </Form> */}
                                        <h5 className={"red"} id="div9">{this.state.noDataMessage}</h5>
                                        {/* Graph */}
                                        <div style={{ display: !this.state.loading ? "block" : "none" }}>
                                            {this.state.showData &&
                                                <>
                                                    {this.state.checkIfAnyMissingActualConsumption && <><span className="red"><i class="fa fa-exclamation-triangle"></i><span className="pl-lg-2">{i18n.t('static.extrapolation.missingDataNotePart1')}</span><a href="/#/dataentry/consumptionDataEntryAndAdjustment" target="_blank"><span>{i18n.t('static.dashboard.dataEntryAndAdjustment') + " "}</span></a><span>{i18n.t('static.extrapolation.missingDataNotePart2')}</span></span></>}
                                                    <div className={this.state.checkIfAnyMissingActualConsumption ? "check inline pt-lg-3 pl-lg-3" : "check inline pl-lg-3"}>
                                                        <div className="">
                                                            <Input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="showFits"
                                                                name="showFits"
                                                                checked={this.state.showFits}
                                                                onClick={(e) => { this.setShowFits(e); }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                                <b>{i18n.t('static.extrapolations.showFits')}</b>
                                                                {/* <i class="fa fa-info-circle icons pl-lg-2" id="Popover5" onClick={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i> */}
                                                            </Label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="chart-wrapper chart-graph-report">
                                                            <Line id="cool-canvas" data={line} options={options} />
                                                            <div>

                                                            </div>
                                                        </div>
                                                    </div></>}<br /><br />
                                            {this.state.showData &&
                                                <div className="col-md-10 pt-4 pb-3">
                                                    <ul className="legendcommitversion">
                                                        <li><span className=" greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.extrapolation.lowestError')} </span></li>
                                                        {/* <li><span className=" redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.label.noFundsAvailable')} </span></li> */}
                                                    </ul>
                                                </div>}
                                            {this.state.showData &&
                                                <div className="">
                                                    <div className="">
                                                        <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" style={{ width: 'unset' }}>
                                                            <thead>
                                                                <tr>
                                                                    <td width="160px" title={i18n.t('static.tooltip.errors')}><b>{i18n.t('static.common.errors')}</b>
                                                                        <i class="fa fa-info-circle icons pl-lg-2" id="Popover13" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                    {this.state.movingAvgId &&
                                                                        <td width="160px" title={i18n.t('static.tooltip.MovingAverages')}><b>{i18n.t('static.extrapolation.movingAverages')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover15" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                    }
                                                                    {this.state.semiAvgId &&
                                                                        <td width="160px" title={i18n.t('static.tooltip.SemiAverages')}><b>{i18n.t('static.extrapolation.semiAverages')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover16" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                    }
                                                                    {this.state.linearRegressionId &&
                                                                        <td width="160px" title={i18n.t('static.tooltip.LinearRegression')}><b>{i18n.t('static.extrapolation.linearRegression')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover17" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                    }
                                                                    {this.state.smoothingId &&
                                                                        <td width="160px" title={i18n.t('static.tooltip.Tes')}><b>{i18n.t('static.extrapolation.tes')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover18" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                    }
                                                                    {this.state.arimaId &&
                                                                        <td width="160px" title={i18n.t('static.tooltip.arima')}><b>{i18n.t('static.extrapolation.arima')}</b> <i class="fa fa-info-circle icons pl-lg-2" id="Popover19" aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></td>
                                                                    }
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td>{i18n.t('static.extrapolation.rmse')}</td>
                                                                    {this.state.movingAvgId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minRmse === this.state.movingAvgError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse === this.state.movingAvgError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.rmse !== "" ? this.state.movingAvgError.rmse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.semiAvgId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minRmse === this.state.semiAvgError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse === this.state.semiAvgError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.rmse !== "" ? this.state.semiAvgError.rmse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.linearRegressionId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minRmse === this.state.linearRegressionError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse === this.state.linearRegressionError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.rmse !== "" ? this.state.linearRegressionError.rmse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.smoothingId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minRmse === this.state.tesError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse === this.state.tesError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.rmse !== "" ? this.state.tesError.rmse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.arimaId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minRmse === this.state.arimaError.rmse ? "bold" : "normal" }} bgcolor={this.state.minRmse === this.state.arimaError.rmse ? "#86cd99" : "#FFFFFF"}>{this.state.arimaError.rmse !== "" ? this.state.arimaError.rmse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                </tr>
                                                                <tr>
                                                                    <td>{i18n.t('static.extrapolation.mape')}</td>
                                                                    {this.state.movingAvgId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minMape === this.state.movingAvgError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape === this.state.movingAvgError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.mape !== "" ? this.state.movingAvgError.mape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.semiAvgId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minMape === this.state.semiAvgError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape === this.state.semiAvgError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.mape !== "" ? this.state.semiAvgError.mape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.linearRegressionId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minMape === this.state.linearRegressionError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape === this.state.linearRegressionError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.mape !== "" ? this.state.linearRegressionError.mape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.smoothingId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minMape === this.state.tesError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape === this.state.tesError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.mape !== "" ? this.state.tesError.mape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.arimaId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minMape === this.state.arimaError.mape ? "bold" : "normal" }} bgcolor={this.state.minMape === this.state.arimaError.mape ? "#86cd99" : "#FFFFFF"}>{this.state.arimaError.mape !== "" ? this.state.arimaError.mape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                </tr>
                                                                <tr>
                                                                    <td>{i18n.t('static.extrapolation.mse')}</td>
                                                                    {this.state.movingAvgId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minMse === this.state.movingAvgError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse === this.state.movingAvgError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.mse !== "" ? this.state.movingAvgError.mse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.semiAvgId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minMse === this.state.semiAvgError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse === this.state.semiAvgError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.mse !== "" ? this.state.semiAvgError.mse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.linearRegressionId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minMse === this.state.linearRegressionError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse === this.state.linearRegressionError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.mse !== "" ? this.state.linearRegressionError.mse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.smoothingId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minMse === this.state.tesError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse === this.state.tesError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.mse !== "" ? this.state.tesError.mse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.arimaId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minMse === this.state.arimaError.mse ? "bold" : "normal" }} bgcolor={this.state.minMse === this.state.arimaError.mse ? "#86cd99" : "#FFFFFF"}>{this.state.arimaError.mse !== "" ? this.state.arimaError.mse.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                </tr>
                                                                <tr>
                                                                    <td>{i18n.t('static.extrapolation.wape')}</td>
                                                                    {this.state.movingAvgId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minWape === this.state.movingAvgError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape === this.state.movingAvgError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.wape !== "" ? this.state.movingAvgError.wape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.semiAvgId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minWape === this.state.semiAvgError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape === this.state.semiAvgError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.wape !== "" ? this.state.semiAvgError.wape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.linearRegressionId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minWape === this.state.linearRegressionError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape === this.state.linearRegressionError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.wape !== "" ? this.state.linearRegressionError.wape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.smoothingId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minWape === this.state.tesError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape === this.state.tesError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.wape !== "" ? this.state.tesError.wape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.arimaId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minWape === this.state.arimaError.wape ? "bold" : "normal" }} bgcolor={this.state.minWape === this.state.arimaError.wape ? "#86cd99" : "#FFFFFF"}>{this.state.arimaError.wape !== "" ? this.state.arimaError.wape.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                </tr>
                                                                <tr>
                                                                    <td>{i18n.t('static.extrapolation.rSquare')}</td>
                                                                    {this.state.movingAvgId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minRsqd === this.state.movingAvgError.rSqd ? "bold" : "normal" }} bgcolor={this.state.minRsqd === this.state.movingAvgError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.movingAvgError.rSqd !== "" ? this.state.movingAvgError.rSqd.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.semiAvgId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minRsqd === this.state.semiAvgError.rSqd ? "bold" : "normal" }} bgcolor={this.state.minRsqd === this.state.semiAvgError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.semiAvgError.rSqd !== "" ? this.state.semiAvgError.rSqd.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.linearRegressionId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minRsqd === this.state.linearRegressionError.rSqd ? "bold" : "normal" }} bgcolor={this.state.minRsqd === this.state.linearRegressionError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.linearRegressionError.rSqd !== "" ? this.state.linearRegressionError.rSqd.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.smoothingId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minRsqd === this.state.tesError.rSqd ? "bold" : "normal" }} bgcolor={this.state.minRsqd === this.state.tesError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.tesError.rSqd !== "" ? this.state.tesError.rSqd.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                    {this.state.arimaId &&
                                                                        <td style={{ textAlign: "right", "fontWeight": this.state.minRsqd === this.state.arimaError.rSqd ? "bold" : "normal" }} bgcolor={this.state.minRsqd === this.state.arimaError.rSqd ? "#86cd99" : "#FFFFFF"}>{this.state.arimaError.rSqd !== "" ? this.state.arimaError.rSqd.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}</td>
                                                                    }
                                                                </tr>
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                </div>}
                                            {this.state.dataChanged && this.state.extrapolateClicked && <div className="row float-right mt-lg-3 mr-0 pb-2 pt-2 "> <Button type="submit" id="formSubmitButton" size="md" color="success" className="float-right mr-0" onClick={() => this.touchAllExtrapolation(setTouched, errors, 1)}><i className="fa fa-check"></i>{i18n.t('static.pipeline.save')}</Button>&nbsp;</div>}
                                            {this.state.forecastProgramId != "" && this.state.planningUnitId > 0 && this.state.regionId > 0 && <div className="row float-right mt-lg-3 mr-3 pb-2 pt-2 "><Button type="submit" id="extrapolateButton" size="md" color="info" className="float-right mr-1" onClick={() => this.touchAllExtrapolation(setTouched, errors, 0)}><i className="fa fa-check"></i>Extrapolate</Button></div>}
                                            {/* {this.state.showData && <div id="tableDiv" className="extrapolateTable pt-lg-5"></div>} */}
                                            <div className="row" style={{ display: this.state.show ? "block" : "none" }}>
                                                <div className="col-md-10 pt-4 pb-3">
                                                    {this.state.showData && <ul className="legendcommitversion">
                                                        <li><span className="purplelegend legendcolor"></span> <span className="legendcommitversionText" style={{ color: "rgb(170, 85, 161)" }}><i>{i18n.t('static.common.forecastPeriod')}{" "}<b>{"("}{i18n.t('static.supplyPlan.forecastedConsumption')}{")"}</b></i></span></li>
                                                        <li><span className="legendcolor" style={{ backgroundColor: "black", border: "1px solid #000" }}></span> <span className="legendcommitversionText">{i18n.t('static.consumption.actual')}</span></li>
                                                    </ul>}
                                                </div>
                                                <div className="row  mt-lg-3">
                                                    <div className="pl-lg-4 pr-lg-4 ModelingValidationTable">
                                                        <div id="tableDiv" className="jexcelremoveReadonlybackground" style={{ display: this.state.show && !this.state.loading ? "block" : "none" }}>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </Form>
                                )} />

                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                                    <div class="spinner-border blue ml-4" role="status">

                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.forecastProgramId != "" && this.state.planningUnitId > 0 && <button className="mr-1 float-right btn btn-info btn-md" onClick={this.toggledata}>{this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}</button>}
                            {this.state.showData && <> <Button type="button" id="dataCheck" size="md" color="info" className="float-right mr-1" onClick={() => this.openDataCheckModel()}><i className="fa fa-check"></i>{i18n.t('static.common.dataCheck')}</Button></>}
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>
                <Modal isOpen={this.state.showGuidance}
                    className={'modal-lg ' + this.props.className} >
                    <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
                        <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                            <div>
                                <h3 className='ShowGuidanceHeading'>{i18n.t('static.commitTree.extrapolation')}</h3>
                            </div>
                            <p>
                                <p style={{ fontSize: '13px' }}><span className="UnderLineText">{i18n.t('static.listTree.purpose')} :</span>{i18n.t('static.extrapolation.EnableUsers')} '<a href="/#/dataentry/consumptionDataEntryAndAdjustment" target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.dashboard.dataEntryAndAdjustments')}</a>' {i18n.t('static.extrapolation.SeveralStatistical')} </p>
                            </p>
                            <p>
                                <p style={{ fontSize: '13px' }}><span className="UnderLineText">{i18n.t('static.listTree.useThisScreen')} :</span></p>
                                <b>1.{i18n.t('static.extrapolation.GettingStarted')}:</b>
                                <ul>
                                    <li>{i18n.t('static.extrapolation.BeforeYou')} '<a href="/#/dataentry/consumptionDataEntryAndAdjustment" target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.dashboard.dataEntryAndAdjustments')}</a>' {i18n.t('static.extrapolation.EachPlanningUnit')}</li>
                                    <li>{i18n.t('static.extrapolation.UseFilters')} </li>
                                    <li>{i18n.t('static.extrapolation.AlongLeftHand')} {i18n.t('static.extrapolation.SeeSections')}</li>
                                    <li> {i18n.t('static.extrapolation.NoteThatChanges')} '<a href="/#/dataentry/consumptionDataEntryAndAdjustment" target="_blank" style={{ textDecoration: 'underline' }}>{i18n.t('static.dashboard.compareAndSelect')}</a>'  screen.
                                    </li>
                                </ul>
                                <b>2.{i18n.t('static.extrapolation.ExtrapolationMethods')}</b>
                                <p className="pl-lg-3">{i18n.t('static.extrapolation.ForecastMethods')}</p>
                                <ol type="a">
                                    <li><b>{i18n.t('static.extrapolation.MovingAverage')}:</b> {i18n.t('static.extrapolation.MovingAverageTextOne')} {i18n.t('static.extrapolation.MovingAverageTextTwo')} {i18n.t('static.extrapolation.MovingAverageTextThree')}</li>
                                    <li><b>{i18n.t('static.extrapolation.SemiAverages')}:</b>{i18n.t('static.extrapolation.SemiAveragesTextOne')} {i18n.t('static.extrapolation.SemiAveragesTextTwo')} {i18n.t('static.extrapolation.SemiAveragesTextThree')} </li>
                                    <li><b>{i18n.t('static.extrapolation.LinearRegression')}:</b> {i18n.t('static.extrapolation.LinearRegressionTextOne')} :  {i18n.t('static.extrapolation.LinearRegressionTextTwo')}</li>
                                    <li><b>{i18n.t('static.extrapolation.TripleExponential')}:</b>  {i18n.t('static.extrapolation.TripleExponentialTextOne')} {i18n.t('static.extrapolation.TripleExponentialTextTwo')} {i18n.t('static.extrapolation.TripleExponentialTextThree')} :
                                        <ul>
                                            <li>{i18n.t('static.extrapolation.alpha')}</li>
                                            <li>{i18n.t('static.extrapolation.beta')}</li>
                                            <li>{i18n.t('static.extrapolation.gamma')}</li>
                                            <li>{i18n.t('static.extrapolation.Seasonality')}: {i18n.t('static.extrapolation.SeasonalityText')}</li>
                                            <li>{i18n.t('static.extrapolation.ConfidenceInterval')}:  {i18n.t('static.extrapolation.ConfidenceIntervalText')}</li>
                                        </ul>
                                        <li><b>{i18n.t('static.extrapolation.ARIMA')}:</b> {i18n.t('static.extrapolation.ARIMATextOne')} {i18n.t('static.extrapolation.ARIMATextTwo')} {i18n.t('static.extrapolation.ARIMATextThree')}:
                                            <ul>
                                                <li>{i18n.t('static.extrapolation.LagOrder')}: {i18n.t('static.extrapolation.LagOrderText')}</li>
                                                <li>{i18n.t('static.extrapolation.DegreeOfDifferencing')}: {i18n.t('static.extrapolation.DegreeOfDifferencingText')}</li>
                                                <li>{i18n.t('static.extrapolation.OrderMovingAverage')}: {i18n.t('static.extrapolation.OrderMovingAverageText')}</li><br></br>
                                                <p>{i18n.t('static.extrapolation.ManyPrograms')} <br></br>

                                                {i18n.t('static.extrapolation.ConfidenceInterval')}: {i18n.t('static.extrapolation.ConfidenceIntervalText')}</p>
                                            </ul>
                                        </li>
                                    </li>
                                </ol>
                                <b>3.{i18n.t('static.extrapolation.WhichExtrapolation')}</b>
                                <p className="pl-lg-3">{i18n.t('static.extrapolation.Considerations')}
                                    <ul>
                                        <li>{i18n.t('static.extrapolation.MoreSophisticated')} </li>
                                        <li>{i18n.t('static.extrapolation.PoorerData')} <i class="fa fa-angle-left" aria-hidden="true">12</i> {i18n.t('static.extrapolation.MonthsOfData')}</li>
                                    </ul>
                                </p>
                                <p className="pl-lg-3">{i18n.t('static.extrapolation.ChoiceOfExtrapolation')}:
                                    <ul>
                                        <li>{i18n.t('static.extrapolation.RangeOfObserved')}
                                            <ul>
                                                <li>{i18n.t('static.extrapolation.MovingAverage')}</li>
                                                <li>{i18n.t('static.extrapolation.ExponentialSmoothing')}</li>
                                                <li>{i18n.t('static.extrapolation.ARIMA')}</li>
                                            </ul>
                                        </li>
                                        <li>
                                        {i18n.t('static.extrapolation.Trending')}
                                            <ul>
                                                <li>{i18n.t('static.extrapolation.SemiAveragesProjection')}</li>
                                                <li>{i18n.t('static.extrapolation.SimpleLinear')}</li>
                                            </ul>
                                        </li>
                                        <li>{i18n.t('static.extrapolation.TrendingSeasonal')}
                                            <ul>
                                                <li>{i18n.t('static.extrapolation.ARIMAModel')}</li>
                                                <li>{i18n.t('static.extrapolation.WintersExponential')}</li>
                                            </ul>
                                        </li>
                                        <li>{i18n.t('static.extrapolation.SeasonalWithout')}
                                            <ul>
                                                <li>{i18n.t('static.extrapolation.Multiplicative')}</li><br></br>

                                                <p>{i18n.t('static.extrapolation.SecondStep')} {i18n.t('static.extrapolation.ChoosingToDisregard')} </p>
                                            </ul>
                                        </li>
                                    </ul>
                                </p>
                                <b>4.{i18n.t('static.extrapolation.InterpretErrors')}</b>
                                <p className="pl-lg-3">{i18n.t('static.extrapolation.AutomaticallyCalculates')}:
                                    <ul>
                                        <li>{i18n.t('static.extrapolation.MAPE')}</li>
                                        <li>{i18n.t('static.extrapolation.WAPE')}</li>
                                        <li>{i18n.t('static.extrapolation.RMSE')}</li>
                                        <li>{i18n.t('static.extrapolation.MAE')}<br></br>
                                        {i18n.t('static.extrapolation.LowerTheError')} {i18n.t('static.extrapolation.LowErrorValue')} 
                                        </li>
                                        <p>
                                        {i18n.t('static.extrapolation.SelectionBetween')} {i18n.t('static.extrapolation.Organized')}
                                            <ul>
                                                <li>{i18n.t('static.extrapolation.MoreSensitive')} </li>
                                                <li>{i18n.t('static.extrapolation.PoorerData')} <i class="fa fa-angle-left" aria-hidden="true">12</i> {i18n.t('static.extrapolation.MonthsOfData')} 
                                                    <br></br>
                                                    {i18n.t('static.extrapolation.SecondStep')} {i18n.t('static.extrapolation.ChoosingToDisregard')} 
                                                </li>
                                            </ul>
                                        </p>
                                    </ul>
                                </p>
                            </p>
                            {/* <p>Methods are organized from simple to robust

                                More sophisticated models are more sensitive to problems in the data

                                If you have poorer data (missing data points, variable reporting rates, less than 12 months of data), use simpler forecast methods
                            </p> */}
                            <p>
                                <b>{i18n.t('static.versionSettings.note')} :  {i18n.t('static.extrapolation.YouHave')} {this.state.planningUnitId > 0 && this.state.regionId > 0 ? this.state.actualConsumptionList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId).length : 0} {i18n.t('static.extrapolation.MinimumValues')}: <br></br>
                                    <span className="ml-lg-5">* {i18n.t('static.extrapolation.TESHoltWinters')}: {i18n.t('static.extrapolation.LeastMonths')}<br></br></span>
                                    <span className="ml-lg-5">* {i18n.t('static.extrapolation.ARIMA')}:  {i18n.t('static.extrapolation.LeastFourteenMonths')}<br></br></span>
                                    <span className="ml-lg-5">* {i18n.t('static.extrapolation.MASALR')}: {i18n.t('static.extrapolation.LeastThreeMonths')}</span>
                                </b>
                            </p>
                        </ModalBody>
                    </div>
                </Modal>

                <Modal isOpen={this.state.toggleDataCheck}
                    className={'modal-lg ' + this.props.className} >
                    <ModalHeader toggle={() => this.openDataCheckModel()} className="ModalHead modal-info-Headher">
                        <div>
                            <img className=" pull-right iconClass cursor ml-lg-2" style={{ height: '22px', width: '22px', cursor: 'pointer', marginTop: '-4px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDFDataCheck()} />
                            <strong>{i18n.t('static.common.dataCheck')}</strong>
                        </div>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                            <span><b>{i18n.t('static.commitTree.consumptionForecast')} : </b>(<a href="/#/dataentry/consumptionDataEntryAndAdjustment" target="_blank">{i18n.t('static.commitTree.dataEntry&Adjustment')}</a>, <a href="/#/extrapolation/extrapolateData" target="_blank">{i18n.t('static.commitTree.extrapolation')}</a>)</span><br />
                            <span>a. {i18n.t('static.commitTree.monthsMissingActualConsumptionValues')} :</span><br />
                            <ul>{missingMonths}</ul>
                            <span>b. {i18n.t('static.commitTree.puThatDoNotHaveAtleast24MonthsOfActualConsumptionValues')} :</span><br />
                            <ul>{consumption}</ul>
                        </ModalBody>
                    </div>
                </Modal>
            </div>
        )
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }

    componentDidUpdate = () => {
        if (this.state.dataChanged) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }

    cancelClicked() {
        var cont = false;
        if (this.state.dataChanged) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            let id = AuthenticationService.displayDashboardBasedOnRole();
            this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
        }
    }

    openDataCheckModel() {
        console.log("in method%%%%")
        this.setState({
            toggleDataCheck: !this.state.toggleDataCheck
        }, () => {
            if (this.state.toggleDataCheck) {
                this.calculateData();
            }
        })
    }

    calculateData() {
        console.log("In calculate data%%%%")
        this.setState({ loading: true })
        var datasetJson = this.state.datasetJson;
        var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
        var stopDate = moment(Date.now()).format("YYYY-MM-DD");

        var consumptionList = datasetJson.actualConsumptionList;
        var datasetPlanningUnit = datasetJson.planningUnitList.filter(c => c.consuptionForecast);
        var datasetRegionList = datasetJson.regionList;
        var missingMonthList = [];

        //Consumption : planning unit less 24 month
        var consumptionListlessTwelve = [];
        for (var dpu = 0; dpu < datasetPlanningUnit.length; dpu++) {
            for (var drl = 0; drl < datasetRegionList.length; drl++) {
                var curDate = startDate;
                var monthsArray = [];
                var puId = datasetPlanningUnit[dpu].planningUnit.id;
                var regionId = datasetRegionList[drl].regionId;
                var consumptionListFiltered = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId);
                if (consumptionListFiltered.length < 24) {
                    consumptionListlessTwelve.push({
                        planningUnitId: datasetPlanningUnit[dpu].planningUnit.id,
                        planningUnitLabel: datasetPlanningUnit[dpu].planningUnit.label,
                        regionId: datasetRegionList[drl].regionId,
                        regionLabel: datasetRegionList[drl].label,
                        noOfMonths: consumptionListFiltered.length
                    })
                }

                //Consumption : missing months
                for (var i = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); i++) {
                    var consumptionListFilteredForMonth = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId);
                    let actualMin = moment.min(consumptionListFilteredForMonth.map(d => moment(d.month)));
                    curDate = moment(actualMin).add(i, 'months').format("YYYY-MM-DD");
                    var consumptionListForCurrentMonth = consumptionListFilteredForMonth.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM"));
                    var checkIfPrevMonthConsumptionAva = consumptionListFilteredForMonth.filter(c => moment(c.month).format("YYYY-MM") < moment(curDate).format("YYYY-MM"));
                    var checkIfNextMonthConsumptionAva = consumptionListFilteredForMonth.filter(c => moment(c.month).format("YYYY-MM") > moment(curDate).format("YYYY-MM"));
                    if (consumptionListForCurrentMonth.length == 0 && checkIfPrevMonthConsumptionAva.length > 0 && checkIfNextMonthConsumptionAva.length > 0) {
                        monthsArray.push(moment(curDate).format(DATE_FORMAT_CAP_WITHOUT_DATE));
                    }
                }

                if (monthsArray.length > 0) {
                    missingMonthList.push({
                        planningUnitId: datasetPlanningUnit[dpu].planningUnit.id,
                        planningUnitLabel: datasetPlanningUnit[dpu].planningUnit.label,
                        regionId: datasetRegionList[drl].regionId,
                        regionLabel: datasetRegionList[drl].label,
                        monthsArray: monthsArray
                    })
                }
            }
        }
        this.setState({
            missingMonthList: missingMonthList,
            consumptionListlessTwelve: consumptionListlessTwelve,
            loading: false
        })

    }

    _handleClickRangeBox(e) {
        this.pickRange.current.show()
    }
    _handleClickRangeBox1(e) {
        this.pickRange1.current.show()
    }
}