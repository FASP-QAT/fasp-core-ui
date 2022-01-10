import React from "react";
import ReactDOM from 'react-dom';
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
import AuthenticationService from "../Common/AuthenticationService";
import { calculateMovingAvg } from '../Extrapolation/MovingAverages';
import { calculateSemiAverages } from '../Extrapolation/SemiAverages';
import { calculateLinearRegression } from '../Extrapolation/LinearRegression';
import { calculateTES } from '../Extrapolation/TES';

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
            confidenceLevelId: 0.85,
            showGuidance: false,
            showData: false,
            consumptionListlessTwelve: [],
            missingMonthList: [],
            toggleDataCheck: false,
            movingAvgData: [],
            semiAvgData: [],
            linearRegressionData: [],
            tesData: [],
            movingAvgError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            semiAvgError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            linearRegressionError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" },
            tesError: { "rmse": "", "mape": "", "mse": "", "wape": "", "rSqd": "" }
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
                var forecastProgramId = "";
                var event = {
                    target: {
                        value: ""
                    }
                };
                if (forecastProgramList.length == 1) {
                    forecastProgramId = forecastProgramList[0].id;
                    event.target.value = forecastProgramList[0].id;
                } else if (localStorage.getItem("sesLiveDatasetId") != "" && forecastProgramList.filter(c => c.id == localStorage.getItem("sesLiveDatasetId")).length > 0) {
                    forecastProgramId = localStorage.getItem("sesLiveDatasetId");
                    event.target.value = localStorage.getItem("sesLiveDatasetId");
                }
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

    }

    reset() {
        console.log('Inside reset')
        this.componentDidMount();
    }

    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })
    }
    handleRangeDissmis1(value) {
        console.log("Value+++", value)
        this.setState({ rangeValue1: value }, () => {
            this.setExtrapolatedParameters(0)
        })
    }

    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        }, () => {
            this.buildActualJxl();
        })
    }

    buildActualJxl() {
        //Jexcel table
        var actualConsumptionList = this.state.actualConsumptionList;
        var monthArray = this.state.monthArray;
        let rangeValue = this.state.rangeValue1;
        var startMonth = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
        var dataArray = [];
        var data = [];
        for (var j = 0; j < monthArray.length; j++) {
            data = [];
            data[0] = monthArray[j];
            var consumptionData = actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId)
            // if (consumptionData.length > 0) {
            //     inputData.push({ "month": inputData.length + 1, "actual": consumptionData[0].amount, "forecast": null })
            // }
            var movingAvgDataFilter = this.state.movingAvgData.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))
            var semiAvgDataFilter = this.state.semiAvgData.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))
            var linearRegressionDataFilter = this.state.linearRegressionData.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))
            var tesDataFilter = this.state.tesData.filter(c => moment(startMonth).add(c.month - 1, 'months').format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM"))
            var CI = this.state.CI;
            //var consumptionData = actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j]).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId);
            data[1] = consumptionData.length > 0 ? consumptionData[0].amount : "";
            data[2] = movingAvgDataFilter.length > 0 && movingAvgDataFilter[0].forecast != null ? movingAvgDataFilter[0].forecast.toFixed(2) : '';
            data[3] = semiAvgDataFilter.length > 0 && semiAvgDataFilter[0].forecast != null ? semiAvgDataFilter[0].forecast.toFixed(2) : '';
            data[4] = linearRegressionDataFilter.length > 0 && linearRegressionDataFilter[0].forecast != null ? linearRegressionDataFilter[0].forecast.toFixed(2) : '';
            data[5] = tesDataFilter.length > 0 && tesDataFilter[0].forecast != null ? (tesDataFilter[0].forecast - CI).toFixed(2) : '';
            data[6] = tesDataFilter.length > 0 && tesDataFilter[0].forecast != null ? tesDataFilter[0].forecast.toFixed(2) : '';
            data[7] = tesDataFilter.length > 0 && tesDataFilter[0].forecast != null ? (tesDataFilter[0].forecast + CI).toFixed(2) : '';
            // data[8] = '';
            dataArray.push(data)
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var options = {
            data: dataArray,
            columnDrag: true,
            columns: [
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
                    type: this.state.smoothingId ? 'numeric' : 'hidden',
                    mask: '#,##.00', decimal: '.'
                },
                {
                    title: i18n.t('static.extrapolation.tes'),
                    type: this.state.smoothingId ? 'numeric' : 'hidden',
                    mask: '#,##.00', decimal: '.'
                },
                {
                    title: i18n.t('static.extrapolation.tesUpper'),
                    type: this.state.smoothingId ? 'numeric' : 'hidden',
                    mask: '#,##.00', decimal: '.'
                },
                // {
                //     title: i18n.t('static.extrapolation.arima'),
                //     type: this.state.arimaId ? 'numeric' : 'hidden',
                //     mask: '#,##.00', decimal: '.'
                // }
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
                    if (moment(rowData[0]).format("YYYY-MM") >= moment(this.state.datasetJson.currentVersion.startDate).format("YYYY-MM") && moment(rowData[0]).format("YYYY-MM") <= moment(this.state.datasetJson.currentVersion.stopDate).format("YYYY-MM")) {
                        var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                        cell.classList.add('jexcelBoldPurpleCell');
                    } else {
                        var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                        cell.classList.remove('jexcelBoldPurpleCell');
                    }
                }
            }.bind(this),
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

        var minRmse = Math.min(...rmseArr);
        var minMape = Math.min(...mapeArr);
        var minMse = Math.min(...mseArr);
        var minRsqd = Math.min(...rSqdArr);
        var minWape = Math.min(...wapeArr);
        this.setState({
            dataEl: dataEl,
            minRmse: minRmse,
            minMape: minMape,
            minMse: minMse,
            minRsqd: minRsqd,
            minWape: minWape,
            loading: false
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
        console.log("this.state.regionId", this.state.regionId)
        console.log("this.state.planningUnitId", this.state.planningUnitId)
        for (var j = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); j++) {
            curDate = moment(startDate).startOf('month').add(j, 'months').format("YYYY-MM-DD");
            var consumptionData = actualConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId)
            inputDataMovingAvg.push({ "month": inputDataMovingAvg.length + 1, "actual": consumptionData.length > 0 ? consumptionData[0].amount : null, "forecast": null })
            inputDataSemiAverage.push({ "month": inputDataSemiAverage.length + 1, "actual": consumptionData.length > 0 ? consumptionData[0].amount : null, "forecast": null })
            inputDataLinearRegression.push({ "month": inputDataLinearRegression.length + 1, "actual": consumptionData.length > 0 ? consumptionData[0].amount : null, "forecast": null })
            inputDataTes.push({ "month": inputDataTes.length + 1, "actual": consumptionData.length > 0 ? consumptionData[0].amount : null, "forecast": null })
        }
        const noOfMonthsForProjection = monthArray.length - inputDataMovingAvg.length;
        this.setState({
            monthArray: monthArray
        })
        calculateMovingAvg(inputDataMovingAvg, this.state.monthsForMovingAverage, noOfMonthsForProjection, this);
        calculateSemiAverages(inputDataSemiAverage, noOfMonthsForProjection, this);
        calculateLinearRegression(inputDataLinearRegression, noOfMonthsForProjection, this);
        calculateTES(inputDataTes, this.state.alpha, this.state.beta, this.state.gamma, this.state.confidenceLevelId, this.state.noOfMonthsForASeason, noOfMonthsForProjection, this);
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
        // tr.children[9].classList.add('InfoTr');


    }
    getPlanningUnitList(e) {
        this.setState({ loading: true })
        localStorage.setItem("sesDatasetId", e.target.value);
        var forecastProgramId = e.target.value;
        if (forecastProgramId != "") {
            var forecastProgramListFilter = this.state.forecastProgramList.filter(c => c.id == forecastProgramId)[0]
            var regionList = forecastProgramListFilter.regionList;
            var startDate = forecastProgramListFilter.datasetData.currentVersion.forecastStartDate;
            var stopDate = forecastProgramListFilter.datasetData.currentVersion.forecastStopDate;
            var rangeValue = { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(stopDate).getFullYear(), month: new Date(stopDate).getMonth() + 1 } }

            var planningUnitList = forecastProgramListFilter.planningUnitList;
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
                rangeValue1: rangeValue,
                loading: false
            }, () => {
                if (planningUnitId != "") {
                    this.setPlanningUnitId(event);
                }
                if (regionId != "") {
                    this.setRegionId(regionEvent);
                }
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
                confidenceLevelId: 0.85,
                loading: false,
                showData: false
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
                var consumptionExtrapolationDataUnFiltered = (datasetJson.consumptionExtrapolation);
                var consumptionExtrapolationList = (datasetJson.consumptionExtrapolation).filter(c => c.planningUnit.id != this.state.planningUnitId && c.region.id != this.state.regionId);
                var consumptionExtrapolationData = -1//Semi Averages
                var consumptionExtrapolationMovingData = -1//Moving averages
                var consumptionExtrapolationRegression = -1//Linear Regression
                var consumptionExtrapolationTESL = -1//TES L
                console.log("consumptionExtrapolationTESL+++", consumptionExtrapolationTESL)
                var consumptionExtrapolationTESM = -1//TES M
                var consumptionExtrapolationTESH = -1//TES H

                var tesData = this.state.tesData;
                var CI = this.state.CI;

                var inputDataFilter = this.state.semiAvgData;
                var inputDataAverageFilter = this.state.movingAvgData;
                var inputDataRegressionFilter = this.state.linearRegressionData;
                console.log("consumptionExtrapolationData", consumptionExtrapolationData);
                console.log("inputDataFilter", inputDataFilter);
                //Semi - averages
                var planningUnitObj = this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.planningUnitId)[0].planningUnit;
                var regionObj = this.state.regionList.filter(c => c.regionId == this.state.regionId)[0];
                console.log("Planning Unit Obj****", planningUnitObj);
                console.log("Region Obj****", regionObj);
                var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                var curUser = AuthenticationService.getLoggedInUserId();
                if (this.state.semiAvgId) {
                    if (consumptionExtrapolationData == -1) {
                        var data = [];
                        for (var i = 0; i < inputDataFilter.length; i++) {
                            data.push({ month: moment(this.state.startMonthForExtrapolation).add(inputDataFilter[i].month - 1, 'months').format("YYYY-MM-DD"), amount: inputDataFilter[i].forecast })
                        }
                        consumptionExtrapolationList.push(
                            {
                                "consumptionExtrapolationId": consumptionExtrapolationDataUnFiltered.length + 1,
                                "planningUnit": planningUnitObj,
                                "region": {
                                    id:regionObj.regionId,
                                    label:regionObj.label
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
                                    "userId": curUser
                                },
                                "createdDate": curDate,
                                "extrapolationDataList": data
                            })
                    } else {
                        // consumptionExtrapolationList[consumptionExtrapolationData].jsonProperties = {};
                        // var data = [];
                        // for (var i = 0; i < inputDataFilter.length; i++) {
                        //     data.push({ month: moment(this.state.startMonthForExtrapolation).add(inputDataFilter[i].month - 1, 'months').format("YYYY-MM-DD"), amount: inputDataFilter[i].forecast })
                        // }
                        // consumptionExtrapolationList[consumptionExtrapolationData].extrapolationDataList = data;
                    }
                }
                console.log("this.state.monthsForMovingAverage+++", this.state.monthsForMovingAverage)
                console.log("consumptionExtrapolationMovingData+++", consumptionExtrapolationMovingData);
                //Moving Averages
                if (this.state.movingAvgId) {
                    if (consumptionExtrapolationMovingData == -1) {
                        var data = [];
                        for (var i = 0; i < inputDataAverageFilter.length; i++) {
                            data.push({ month: moment(this.state.startMonthForExtrapolation).add(inputDataAverageFilter[i].month - 1, 'months').format("YYYY-MM-DD"), amount: inputDataAverageFilter[i].forecast })
                        }
                        consumptionExtrapolationList.push(
                            {
                                "consumptionExtrapolationId": consumptionExtrapolationDataUnFiltered.length + 1,
                                "planningUnit": planningUnitObj,
                                "region": {
                                    id:regionObj.regionId,
                                    label:regionObj.label
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
                                    "userId": curUser
                                },
                                "createdDate": curDate,
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
                }
                if (this.state.linearRegressionId) {
                    //Linear Regression
                    if (consumptionExtrapolationRegression == -1) {
                        var data = [];
                        for (var i = 0; i < inputDataRegressionFilter.length; i++) {
                            data.push({ month: moment(this.state.startMonthForExtrapolation).add(inputDataRegressionFilter[i].month - 1, 'months').format("YYYY-MM-DD"), amount: inputDataRegressionFilter[i].forecast })
                        }
                        consumptionExtrapolationList.push(
                            {
                                "consumptionExtrapolationId": consumptionExtrapolationDataUnFiltered.length + 1,
                                "planningUnit": planningUnitObj,
                                "region": {
                                    id:regionObj.regionId,
                                    label:regionObj.label
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
                                    "userId": curUser
                                },
                                "createdDate": curDate,
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
                }
                //TES L
                if (this.state.smoothingId) {
                    console.log("consumptionExtrapolationTESL@@@", consumptionExtrapolationTESL)
                    if (consumptionExtrapolationTESL == -1) {
                        console.log("in if1")
                        var data = [];
                        for (var i = 0; i < tesData.length; i++) {
                            data.push({ month: moment(this.state.startMonthForExtrapolation).add(tesData[i].month - 1, 'months').format("YYYY-MM-DD"), amount: (Number(tesData[i].forecast) - Number(CI)) })
                        }
                        consumptionExtrapolationList.push(
                            {
                                "consumptionExtrapolationId": consumptionExtrapolationDataUnFiltered.length + 1,
                                "planningUnit": planningUnitObj,
                                "region": {
                                    id:regionObj.regionId,
                                    label:regionObj.label
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
                                    "userId": curUser
                                },
                                "createdDate": curDate,
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
                                "consumptionExtrapolationId": consumptionExtrapolationDataUnFiltered.length + 1,
                                "planningUnit": planningUnitObj,
                                "region": {
                                    id:regionObj.regionId,
                                    label:regionObj.label
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
                                    "userId": curUser
                                },
                                "createdDate": curDate,
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
                                "consumptionExtrapolationId": consumptionExtrapolationDataUnFiltered.length + 1,
                                "planningUnit": planningUnitObj,
                                "region": {
                                    id:regionObj.regionId,
                                    label:regionObj.label
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
                                    "userId": curUser
                                },
                                "createdDate": curDate,
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
                    let id = AuthenticationService.displayDashboardBasedOnRole();
                    this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.compareAndSelect.dataSaved'));
                }.bind(this);
            }.bind(this);
        }.bind(this);
    }

    setPlanningUnitId(e) {
        var planningUnitId = e.target.value;
        localStorage.setItem("sesDatasetPlanningUnitId", e.target.value);
        this.setState({
            planningUnitId: planningUnitId
        }, () => {
            this.setExtrapolatedParameters();
        })
    }

    setRegionId(e) {
        var regionId = e.target.value;
        localStorage.setItem("sesDatasetRegionId", e.target.value);
        this.setState({
            regionId: regionId
        }, () => {
            this.setExtrapolatedParameters();
        })
    }

    setExtrapolatedParameters(updateRangeValue) {
        if (this.state.planningUnitId > 0 && this.state.regionId > 0) {
            this.setState({ loading: true })
            var datasetJson = this.state.datasetJson;
            // Need to filter
            var actualConsumptionListForPlanningUnitAndRegion = datasetJson.actualConsumptionList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId);
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
            var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
            var stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
            var consumptionExtrapolationList = datasetJson.consumptionExtrapolation;
            var monthsForMovingAverage = this.state.monthsForMovingAverage;
            var consumptionExtrapolationFiltered = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId);
            var consumptionExtrapolationData = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 6)//Semi Averages
            var consumptionExtrapolationMovingData = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 7)//Moving averages
            console.log("consumptionExtrapolationMovingData+++", consumptionExtrapolationMovingData)
            var consumptionExtrapolationRegression = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 5)//Linear Regression
            var consumptionExtrapolationTESL = consumptionExtrapolationList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId && c.extrapolationMethod.id == 1)//TES L            
            var movingAvgId = consumptionExtrapolationFiltered.length > 0 ? false : true;
            var semiAvgId = consumptionExtrapolationFiltered.length > 0 ? false : true;
            var linearRegressionId = consumptionExtrapolationFiltered.length > 0 ? false : true;
            var smoothingId = consumptionExtrapolationFiltered.length > 0 ? false : true;
            var arimaId = consumptionExtrapolationFiltered.length > 0 ? false : true;

            if (consumptionExtrapolationMovingData.length > 0) {
                monthsForMovingAverage = consumptionExtrapolationMovingData[0].jsonProperties.months;
                movingAvgId = true;
            }

            if (consumptionExtrapolationData.length > 0) {
                semiAvgId = true;
            }

            if (consumptionExtrapolationRegression.length > 0) {
                linearRegressionId = true;
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
                smoothingId = true;
            }
            this.setState({
                actualConsumptionList: actualConsumptionList,
                startDate: startDate,
                stopDate: stopDate,
                rangeValue1: rangeValue1,
                minDate: actualMin,
                maxDate: actualMax,
                monthsForMovingAverage: monthsForMovingAverage,
                confidenceLevelId: confidenceLevel,
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
                loading: false
            }, () => {
                this.buildJxl();
            })
        } else {
            this.setState({
                showData: false,
                loading: false
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
        this.setState({
            loading: true
        })
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
        }, () => {
            this.buildActualJxl()
        })
    }
    setSemiAvgId(e) {
        var semiAvgId = e.target.checked;
        this.setState({
            semiAvgId: semiAvgId
        }, () => {
            this.buildActualJxl()
        })
    }
    setLinearRegressionId(e) {
        var linearRegressionId = e.target.checked;
        this.setState({
            linearRegressionId: linearRegressionId
        }, () => {
            this.buildActualJxl()
        })
    }
    setSmoothingId(e) {
        var smoothingId = e.target.checked;
        this.setState({
            smoothingId: smoothingId
        }, () => {
            this.buildActualJxl()
        })
    }
    setArimaId(e) {
        var arimaId = e.target.checked;
        this.setState({
            arimaId: arimaId
        }, () => {
            this.buildActualJxl()
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

    getDateDifference() {
        var startDate = moment([this.state.rangeValue1.from.year, this.state.rangeValue1.from.month]);
        var endDate = moment([this.state.rangeValue1.to.year, this.state.rangeValue1.to.month]);
        var monthsDiff = endDate.diff(startDate, 'months');
        console.log("monthsDiff-->", monthsDiff)
        //  document.getElementById('dateDiv').val(monthsDiff);
        //  this.setState({
        //      monthsDiff: monthsDiff
        //  });
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
                    {getLabelText(item.planningUnit.label, this.state.lang)}
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
                display: false,
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
            data: this.state.consumptionData.map((item, index) => (item.amount > 0 ? item.amount : null))
        })
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
                    data: this.state.movingAvgData.map((item, index) => (item.forecast > 0 ? item.forecast : null))
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
                data: this.state.semiAvgData.map((item, index) => (item.forecast > 0 ? item.forecast : null))
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
                    data: this.state.linearRegressionData.map((item, index) => (item.forecast > 0 ? item.forecast : null))
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
                data: this.state.tesData.map((item, index) => (item.forecast > 0 ? (item.forecast - this.state.CI) : null))
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
                data: this.state.tesData.map((item, index) => (item.forecast > 0 ? item.forecast : null))
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
                data: this.state.tesData.map((item, index) => (item.forecast > 0 ? (item.forecast + this.state.CI) : null))
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
                            <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/dataentry/consumptionDataEntryAndAdjustment">{i18n.t('static.dashboard.dataEntryAndAdjustment')}</a></span>
                            <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href="/#/report/compareAndSelectScenario">{i18n.t('static.dashboard.compareAndSelect')}</a></span><br />
                            {/* <strong>{i18n.t('static.dashboard.supplyPlan')}</strong> */}

                            {/* <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                            </a>
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
                        </div>
                    </div>
                    <div className="Card-header-reporticon pb-2">
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                            </a>
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            {/* <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
                        </div>
                    </div>
                    <CardBody className="pb-lg-5 pt-lg-0">
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
                                    <FormGroup className="col-md-3">
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
                                                className="greyColor"
                                            >
                                                <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} />
                                            </Picker>

                                        </div>
                                    </FormGroup>
                                    <FormGroup className="col-md-3 ">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.planningunitheader')}</Label>
                                        <div className="controls ">
                                            <Input
                                                type="select"
                                                name="planningUnitId"
                                                id="planningUnitId"
                                                bsSize="sm"
                                                value={this.state.planningUnitId}
                                                onChange={(e) => { this.setPlanningUnitId(e); }}
                                                className="selectWrapText"
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
                                    <FormGroup className="col-md-12">
                                        <h5>
                                            {this.state.planningUnitId > 0 && i18n.t('static.common.for')}{" "}<b>{this.state.planningUnitId > 0 &&
                                                document.getElementById("planningUnitId").selectedOptions[0].text}</b>
                                            {this.state.regionId > 0 &&
                                                " " + i18n.t('static.common.and') + " "}<b>{this.state.regionId > 0 && document.getElementById("regionId").selectedOptions[0].text + (" ")}</b> {this.state.regionId > 0 && i18n.t('static.extrpolate.selectYourExtrapolationParameters')}
                                        </h5>
                                    </FormGroup>
                                    <FormGroup className="col-md-3">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.dateRangeForHistoricData')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                        <div className="controls edit">

                                            <Picker
                                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                ref={this.pickRange1}
                                                value={rangeValue1}
                                                lang={pickerLang}
                                                // theme="light"
                                                onChange={this.handleRangeChange1, this.getDateDifference()}
                                                onDismiss={this.handleRangeDissmis1}
                                                readOnly
                                            >
                                                <MonthBox value={makeText(rangeValue1.from) + ' ~ ' + makeText(rangeValue1.to)} onClick={this._handleClickRangeBox1} />
                                            </Picker>
                                        </div>
                                    </FormGroup>
                                </div>
                                <div id="dateDiv" className="leftAlignTable">
                                </div>
                                <div className="row">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.selectExtrapolationMethod')}</Label>
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
                                                    <b>{i18n.t('static.extrapolation.movingAverages')}</b>
                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                </Label>
                                            </div>
                                            <div className="col-md-3" style={{ display: this.state.movingAvgId ? '' : 'none' }}>
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.noOfMonths')}</Label>
                                                <Input
                                                    className="controls"
                                                    type="text"
                                                    id="noOfMonthsId"
                                                    name="noOfMonthsId"
                                                    value={this.state.monthsForMovingAverage}
                                                    onChange={(e) => { this.setMonthsForMovingAverage(e); }}
                                                />
                                            </div>

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
                                                    <b>{i18n.t('static.extrapolation.semiAverages')}</b>
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
                                                    <b>{i18n.t('static.extrapolation.linearRegression')}</b>
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
                                                    <b>{i18n.t('static.extrapolation.tripleExponential')}</b>
                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenTes', !this.state.popoverOpenTes)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                </Label>
                                            </div>

                                            <div className="row col-md-12" style={{ display: this.state.smoothingId ? '' : 'none' }}>
                                                <div className="col-md-2">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.confidenceLevel')}</Label>
                                                    <Input
                                                        type="select"
                                                        id="confidenceLevelId"
                                                        name="confidenceLevelId"
                                                        bsSize="sm"
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
                                                <div className="col-md-2">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.seasonality')}</Label>
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
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.alpha')}</Label>
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
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.beta')}</Label>
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
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.gamma')}</Label>
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
                                                    <b>{i18n.t('static.extrapolation.arimaFull')}</b>
                                                    <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                </Label>
                                            </div>

                                            <div className="row" style={{ display: this.state.arimaId ? '' : 'none' }}>
                                                <div className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.p')}</Label>
                                                    <Input
                                                        className="controls"
                                                        type="text"
                                                        id="pId"
                                                        name="pId"
                                                    />
                                                </div>
                                                <div className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.d')}</Label>
                                                    <Input
                                                        className="controls"
                                                        type="text"
                                                        id="dId"
                                                        name="dId"
                                                    />
                                                </div>
                                                <div className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.extrapolation.q')}</Label>
                                                    <Input
                                                        className="controls"
                                                        type="text"
                                                        id="qId"
                                                        name="qId"
                                                    />
                                                </div>
                                            </div>

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
                        <div style={{ display: !this.state.loading ? "block" : "none" }}>
                            {this.state.showData && <div className="col-md-12">
                                <div className="chart-wrapper chart-graph-report">
                                    <Line id="cool-canvas" data={line} options={options} />
                                    <div>

                                    </div>
                                </div>
                            </div>}<br /><br />
                            {this.state.showData &&
                                <div className="col-md-10 pt-4 pb-3">
                                    <ul className="legendcommitversion">
                                        <li><span className=" greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.extrapolation.lowestError')} </span></li>
                                        {/* <li><span className=" redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.label.noFundsAvailable')} </span></li> */}
                                    </ul>
                                </div>}
                            {this.state.showData &&
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
                                                    <td>{i18n.t('static.common.rmse')}</td>
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
                                </div>}
                            {this.state.showData && <div id="tableDiv" className="extrapolateTable"></div>}
                        </div>
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
                            <Button type="button" size="md" color="danger" className="float-right mr-1"><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.showData && <>    <Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" onClick={() => this.saveForecastConsumptionExtrapolation()}><i className="fa fa-check"></i>{i18n.t('static.pipeline.save')}</Button>&nbsp;
                                <Button type="button" id="dataCheck" size="md" color="info" className="float-right mr-1" onClick={() => this.openDataCheckModel()}><i className="fa fa-check"></i>{i18n.t('static.common.dataCheck')}</Button></>}
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

                <Modal isOpen={this.state.toogelDataCheck}
                    className={'modal-lg ' + this.props.className} >
                    <ModalHeader toggle={() => this.openDataCheckModel()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.common.dataCheck')}</strong>
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

    openDataCheckModel() {
        this.setState({
            toogelDataCheck: !this.state.toggleDataCheck
        }, () => {
            this.calculateData();
        })
    }

    calculateData() {
        this.setState({ loading: true })
        var datasetJson = this.state.datasetJson;
        var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
        var stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");

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
                for (var i = 0; curDate < stopDate; i++) {
                    curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                    var consumptionListFilteredForMonth = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId && c.month == curDate);
                    if (consumptionListFilteredForMonth.length == 0) {
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