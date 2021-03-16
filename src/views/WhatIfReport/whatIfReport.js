import React from "react";
import {
    Card, CardBody, CardHeader, CardFooter,
    Col, Table, Modal, ModalBody, ModalFooter, ModalHeader, Button,
    Input, InputGroup, Label, FormGroup, Form, Row, Nav, NavItem, NavLink, Collapse, TabPane, TabContent, FormFeedback
} from 'reactstrap';
import * as Yup from 'yup';
import i18n from '../../i18n';
import 'react-contexify/dist/ReactContexify.min.css';
import DatePicker from 'react-datepicker';
import '../../../node_modules/react-datepicker/dist/react-datepicker.css';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN, CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, NO_OF_MONTHS_ON_LEFT_CLICKED, ON_HOLD_SHIPMENT_STATUS, NO_OF_MONTHS_ON_RIGHT_CLICKED, DATE_FORMAT_CAP, INDEXED_DB_NAME, INDEXED_DB_VERSION, DATE_FORMAT_SM, DATE_PLACEHOLDER_TEXT, TBD_FUNDING_SOURCE, TBD_PROCUREMENT_AGENT_ID, NONE_SELECTED_DATA_SOURCE_ID, PERCENTAGE_REGEX, DATE_FORMAT_CAP_WITHOUT_DATE, INTEGER_NO_REGEX, USD_CURRENCY_ID, NO_OF_MONTHS_ON_LEFT_CLICKED_REGION, NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION, SHIPMENT_MODIFIED, FORECASTED_CONSUMPTION_MODIFIED } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { Link } from "react-router-dom";
import NumberFormat from 'react-number-format';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { Bar } from 'react-chartjs-2';
import pdfIcon from '../../assets/img/pdf.png';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import csvicon from '../../assets/img/csv.png'
import ShipmentsInSupplyPlanComponent from "../SupplyPlan/ShipmentsInSupplyPlan.js";
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import InventoryInSupplyPlanComponent from "../SupplyPlan/InventoryInSupplyPlan.js";
import ConsumptionInSupplyPlanComponent from "../SupplyPlan/ConsumptionInSupplyPlan";
import { calculateSupplyPlan } from "../SupplyPlan/SupplyPlanCalculations";
import SupplyPlanFormulas from "../SupplyPlan/SupplyPlanFormulas";
import AuthenticationService from "../Common/AuthenticationService";
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
// import SupplyPlanFormulas from "./SupplyPlanFormulas";
import { Prompt } from 'react-router'

const entityname = i18n.t('static.dashboard.whatIf')

let initialValues = {
    scenarioId: '',
    percentage: ''
}

const validationSchema = function (values, t) {
    return Yup.object().shape({
        scenarioId: Yup.string()
            .required(i18n.t('static.whatIf.validScenario')),
        needPercentageValidation: Yup.boolean(),
        percentage: Yup.string()
            .when("needPercentageValidation", {
                is: val => {
                    return document.getElementById("needPercentageValidation").value === "true";

                },
                then: Yup.string()
                    .matches(INTEGER_NO_REGEX, i18n.t('static.common.onlyIntegers'))
                    .required(i18n.t('static.whatIf.validpercentage'))
                ,
                otherwise: Yup.string().notRequired()
            }),
    })
}

const validate = (getValidationSchema) => {

    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationError(error)
        }
    }
}

const getErrorsFromValidationError = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}

export default class WhatIfReportComponent extends React.Component {

    constructor(props) {
        super(props);
        let rows = [];
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);
        var value = JSON.parse(localStorage.getItem("sesStartDate"));
        var date = moment(value.year + "-" + value.month + "-01").format("YYYY-MM-DD");
        var currentDate = moment(Date.now()).startOf('month').format("YYYY-MM-DD");
        const monthDifference = moment(new Date(date)).diff(new Date(currentDate), 'months', true) + MONTHS_IN_PAST_FOR_SUPPLY_PLAN;
        this.state = {
            loading: true,
            monthsArray: [],
            programList: [],
            planningUnitList: [],
            planningUnitName: "",
            regionList: [],
            consumptionTotalData: [],
            shipmentsTotalData: [],
            manualShipmentsTotalData: [],
            deliveredShipmentsTotalData: [],
            shippedShipmentsTotalData: [],
            orderedShipmentsTotalData: [],
            plannedShipmentsTotalData: [],
            erpShipmentsTotalData: [],
            deliveredErpShipmentsTotalData: [],
            shippedErpShipmentsTotalData: [],
            orderedErpShipmentsTotalData: [],
            plannedErpShipmentsTotalData: [],
            consumptionDataForAllMonths: [],
            amcTotalData: [],
            consumptionFilteredArray: [],
            regionListFiltered: [],
            consumptionTotalMonthWise: [],
            consumptionChangedFlag: 0,
            inventoryTotalData: [],
            expectedBalTotalData: [],
            suggestedShipmentsTotalData: [],
            inventoryFilteredArray: [],
            inventoryTotalMonthWise: [],
            projectedTotalMonthWise: [],
            inventoryChangedFlag: 0,
            // Commented the CR
            // monthCount: monthDifference,
            monthCount: 0,
            // Commented the CR
            monthCountConsumption: 0,
            monthCountAdjustments: 0,
            minStockArray: [],
            maxStockArray: [],
            minStockMoS: [],
            maxStockMoS: [],
            minMonthOfStock: 0,
            reorderFrequency: 0,
            programPlanningUnitList: [],
            openingBalanceArray: [],
            closingBalanceArray: [],
            monthsOfStockArray: [],
            suggestedShipmentChangedFlag: 0,
            message: '',
            activeTab: new Array(3).fill('1'),
            jsonArrForGraph: [],
            display: 'none',
            lang: localStorage.getItem('lang'),
            unmetDemand: [],
            expiredStock: [],
            versionId: "",
            accordion: [true],
            showTotalShipment: false,
            showManualShipment: false,
            showErpShipment: false,
            expiredStockArr: [],
            scenarioId: '',
            percentage: '',
            startDate: '',
            stopDate: '',
            rows: rows,
            expiredStockDetails: [],
            expiredStockDetailsTotal: 0,
            showShipments: 0,
            paColors: [],
            programSelect: "",
            showInventory: 0,
            showConsumption: 0,
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 2 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() },
            showScenarioList: false,
            consumptionStartDateClicked: moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
            inventoryStartDateClicked: moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
            startDate: JSON.parse(localStorage.getItem("sesStartDate")),
        }

        this._handleClickRangeBox1 = this._handleClickRangeBox1.bind(this)
        this.handleRangeChange1 = this.handleRangeChange1.bind(this);
        this.handleRangeDissmis1 = this.handleRangeDissmis1.bind(this);
        this.pickRange1 = React.createRef();

        this.getMonthArray = this.getMonthArray.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.formSubmit = this.formSubmit.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
        this.consumptionDetailsClicked = this.consumptionDetailsClicked.bind(this);

        this.adjustmentsDetailsClicked = this.adjustmentsDetailsClicked.bind(this);

        this.leftClicked = this.leftClicked.bind(this);
        this.rightClicked = this.rightClicked.bind(this);
        this.leftClickedConsumption = this.leftClickedConsumption.bind(this);
        this.rightClickedConsumption = this.rightClickedConsumption.bind(this);

        this.leftClickedAdjustments = this.leftClickedAdjustments.bind(this);
        this.rightClickedAdjustments = this.rightClickedAdjustments.bind(this);

        this.actionCanceled = this.actionCanceled.bind(this);

        this.suggestedShipmentsDetailsClicked = this.suggestedShipmentsDetailsClicked.bind(this);
        this.shipmentsDetailsClicked = this.shipmentsDetailsClicked.bind(this);

        this.toggleAccordionTotalShipments = this.toggleAccordionTotalShipments.bind(this);
        this.toggleAccordionManualShipments = this.toggleAccordionManualShipments.bind(this);
        this.toggleAccordionErpShipments = this.toggleAccordionErpShipments.bind(this);
        this.addRow = this.addRow.bind(this);
        this.setTextAndValue = this.setTextAndValue.bind(this);
        this.toggle = this.toggle.bind(this);
        this.tabPane = this.tabPane.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.dataChangeDate = this.dataChangeDate.bind(this);
        this.dataChangeEndDate = this.dataChangeEndDate.bind(this);
        this.updateState = this.updateState.bind(this)
        this.updateFieldData = this.updateFieldData.bind(this);
        this.saveSupplyPlan = this.saveSupplyPlan.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.hideThirdComponent = this.hideThirdComponent.bind(this);
        this.hideFourthComponent = this.hideFourthComponent.bind(this);
        this.hideFifthComponent = this.hideFifthComponent.bind(this);
        this.pickRange = React.createRef();
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);

        this.toggleAccordionScenarioList = this.toggleAccordionScenarioList.bind(this);
        this.addDoubleQuoteToRowContent = this.addDoubleQuoteToRowContent.bind(this);
        this.scenarioCheckedChanged = this.scenarioCheckedChanged.bind(this);
        this.saveScenario = this.saveScenario.bind(this);
    }

    _handleClickRangeBox1(e) {
        this.pickRange1.current.show()
    }

    handleRangeChange1(value, text, listIndex) {
        //
    }
    handleRangeDissmis1(value) {
        var date = moment(value.year + "-" + value.month + "-01").format("YYYY-MM-DD");
        var currentDate = moment(Date.now()).startOf('month').format("YYYY-MM-DD");
        const monthDifference = moment(new Date(date)).diff(new Date(currentDate), 'months', true) + MONTHS_IN_PAST_FOR_SUPPLY_PLAN;
        this.setState({ startDate: value, monthCount: monthDifference })
        localStorage.setItem("sesStartDate", JSON.stringify(value));
        this.formSubmit(this.state.planningUnit, monthDifference);
    }

    show() {
    }
    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })
        this.formSubmit(this.state.planningUnit, value);
    }

    _handleClickRangeBox(e) {
        this.pickRange.current.show()
    }

    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    hideThirdComponent() {
        document.getElementById('div3').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div3').style.display = 'none';
        }, 8000);
    }

    hideFourthComponent() {
        document.getElementById('div4').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div4').style.display = 'none';
        }, 8000);
    }

    hideFifthComponent() {
        document.getElementById('div5').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div5').style.display = 'none';
        }, 8000);
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }

    componentDidUpdate = () => {
        if (this.state.consumptionChangedFlag == 1 || this.state.consumptionBatchInfoChangedFlag == 1 || this.state.inventoryChangedFlag == 1 || this.state.inventoryBatchInfoChangedFlag == 1 || this.state.shipmentChangedFlag == 1 || this.state.shipmentBatchInfoChangedFlag == 1 || this.state.shipmentQtyChangedFlag == 1 || this.state.shipmentDatesChangedFlag == 1 || this.state.suggestedShipmentChangedFlag == 1) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }

    roundN = num => {
        if (num != null && num != '') {
            return Number(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
        } else {
            return ''
        }
    }

    formatter = value => {
        if (value != null && value != '' && !isNaN(Number(value))) {
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
        } else if (value != null && isNaN(Number(value))) {
            return value;
        } else {
            return ''
        }
    }

    formatterDouble = value => {
        if (value != null && value != '' && !isNaN(Number(value))) {
            var cell1 = this.roundN(value)
            cell1 += '';
            var x = cell1.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        } else if (value != null && isNaN(Number(value))) {
            return value;
        } else {
            return ''
        }
    }

    updateFieldData(value) {
        this.setState({ planningUnit: value, planningUnitId: value != "" && value != undefined ? value.value : 0, rows: [] });

    }

    resetClicked() {
        var db1;
        var storeOS;
        getDatabase();
        var regionList = [];
        var dataSourceList = [];
        var dataSourceListAll = [];
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "red"
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['programData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('programData');
            var programRequest = programDataOs.get(document.getElementById("programId").value);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "red"
                })
                this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);

                var whatIfProgramDataTransaction = db1.transaction(['whatIfProgramData'], 'readwrite');
                var whatIfProgramDataOs = whatIfProgramDataTransaction.objectStore('whatIfProgramData');
                var item = {
                    id: programRequest.result.id,
                    programId: programRequest.result.programId,
                    version: programRequest.result.version,
                    programName: (CryptoJS.AES.encrypt(JSON.stringify((programRequest.result.label)), SECRET_KEY)).toString(),
                    programData: programRequest.result.programData,
                    userId: programRequest.result.userId
                }
                var whatIfRequest = whatIfProgramDataOs.put(item);
                whatIfRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext'),
                        loading: false,
                        color: "red",
                    })
                    this.hideFirstComponent()
                }.bind(this);
                whatIfRequest.onsuccess = function (e) {
                    this.formSubmit(this.state.planningUnit, this.state.monthCount);
                    this.setState({
                        message: i18n.t('static.whatIf.supplyPlanReset'),
                        color: 'green',
                        rows: [],
                        scenarioId: '',
                        percentage: '',
                        startDate: '',
                        stopDate: ''
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)

    }

    saveSupplyPlan() {
        var db1;
        var storeOS;
        getDatabase();
        var regionList = [];
        var dataSourceList = [];
        var dataSourceListAll = [];
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "red"
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['whatIfProgramData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('whatIfProgramData');
            var programRequest = programDataOs.get(document.getElementById("programId").value);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "red"
                })
                this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var whatIfProgramDataTransaction = db1.transaction(['programData'], 'readwrite');
                var whatIfProgramDataOs = whatIfProgramDataTransaction.objectStore('programData');
                var item = {
                    id: programRequest.result.id,
                    programId: programRequest.result.programId,
                    version: programRequest.result.version,
                    programName: (CryptoJS.AES.encrypt(JSON.stringify((programRequest.result.label)), SECRET_KEY)).toString(),
                    programData: programRequest.result.programData,
                    userId: programRequest.result.userId
                }
                var whatIfRequest = whatIfProgramDataOs.put(item);
                whatIfRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext'),
                        loading: false,
                        color: "red"
                    })
                    this.hideFirstComponent()
                }.bind(this);
                whatIfRequest.onsuccess = function (e) {
                    this.formSubmit(this.state.planningUnit, this.state.monthCount);
                    this.setState({
                        message: i18n.t('static.whatIf.supplyPlanSaved'),
                        color: 'green',
                        rows: [],
                        scenarioId: '',
                        percentage: '',
                        startDate: '',
                        stopDate: ''
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    setTextAndValue = (event) => {
        if (event.target.name === 'scenarioId') {
            this.setState({ scenarioId: event.target.value });
            if (event.target.value == 1 || event.target.value == 2) {
                document.getElementById("consumptionScenariosFields1").style.display = "inline-flex";
                document.getElementById("consumptionScenariosFields2").style.display = "inline-flex";
            } else if (event.target.value == 3) {
                document.getElementById("consumptionScenariosFields1").style.display = "none";
                document.getElementById("consumptionScenariosFields2").style.display = "inline-flex";

            } else {
                document.getElementById("consumptionScenariosFields1").style.display = "none";
                document.getElementById("consumptionScenariosFields2").style.display = "none";
            }
        } else if (event.target.name === 'percentage') {
            this.setState({ percentage: event.target.value });
        }
    };

    dataChangeDate(date) {
        this.setState({ startDate: date });
    }

    dataChangeEndDate(date) {
        this.setState({ stopDate: date });
    }

    toggle(tabPane, tab) {
        const newArray = this.state.activeTab.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab: newArray,
        });
    }

    scenarioCheckedChanged(id) {
        var rows = this.state.rows;
        rows[id].scenarioChecked = !rows[id].scenarioChecked;
        this.setState({
            rows: rows
        }, () => {
            document.getElementById("saveScenarioDiv").style.display = 'block'
        })
    }

    saveScenario() {
        this.setState({ loading: true });
        var db1;
        var storeOS;
        var programId = (document.getElementById("programId").value);
        var planningUnitId = (document.getElementById("planningUnitId").value);
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "red"
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "red"
                })
                this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                // var consumptionList=programJson.consumptionList;
                // var inventoryList=programJson.inventoryList;
                // var shipmentList=programJson.shipmentList;
                var rows = this.state.rows;
                var minimumDate = moment(Date.now()).format("YYYY-MM-DD");
                for (var r = 0; r < rows.length; r++) {
                    if (rows[r].scenarioChecked) {
                        if (rows[r].scenarioId == 3) {
                            // var rangeValue = this.state.rangeValue;
                            let startDate = moment(rows[r].startDate).startOf('month').format("YYYY-MM-DD");
                            let stopDate = moment(rows[r].stopDate).endOf('month').format("YYYY-MM-DD");
                            var shipmentList = programJson.shipmentList;
                            var actionList = programJson.actionList;
                            if (actionList == undefined) {
                                actionList = []
                            }
                            var shipmentUnFundedList = shipmentList.filter(c => c.fundingSource.id == "" || c.fundingSource.id == TBD_FUNDING_SOURCE && c.planningUnit.id == planningUnitId && moment(c.expectedDeliveryDate).format("YYYY-MM") >= moment(startDate).format("YYYY-MM") && moment(c.expectedDeliveryDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM"));
                            var minDate = moment.min(shipmentUnFundedList.map(d => moment(d.expectedDeliveryDate)))
                            if (moment(minDate).format("YYYY-MM-DD") < moment(minimumDate).format("YYYY-MM-DD")) {
                                minimumDate = minDate;
                            }
                            for (var i = 0; i < shipmentUnFundedList.length; i++) {
                                var index = 0;
                                if (shipmentUnFundedList[i].shipmentId > 0) {
                                    index = shipmentList.findIndex(c => c.shipmentId == shipmentUnFundedList[i].shipmentId);
                                } else {
                                    index = shipmentUnFundedList[i].index;
                                }
                                shipmentList[index].active = 0;
                            }
                            actionList.push({
                                planningUnitId: planningUnitId,
                                type: SHIPMENT_MODIFIED,
                                date: moment(minimumDate).startOf('month').format("YYYY-MM-DD")
                            })
                            programJson.shipmentList = shipmentList;
                            programJson.actionList = actionList;
                        } else if (rows[r].scenarioId == 1) {
                            let startDate = moment(rows[r].startDate).startOf('month').format("YYYY-MM-DD");
                            let stopDate = moment(rows[r].stopDate).endOf('month').format("YYYY-MM-DD");

                            var consumptionList = programJson.consumptionList;
                            var actionList = programJson.actionList;
                            if (actionList == undefined) {
                                actionList = []
                            }
                            var consumptionFiltered = consumptionList.filter(c => c.active == true
                                && c.planningUnit.id == planningUnitId
                                && moment(c.consumptionDate).format("YYYY-MM") >= moment(startDate).format("YYYY-MM")
                                && moment(c.consumptionDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM")
                                && (c.actualFlag).toString() == "false"
                            );
                            var minDate = moment.min(consumptionFiltered.map(d => moment(d.consumptionDate)))
                            if (moment(minDate).format("YYYY-MM-DD") < moment(minimumDate).format("YYYY-MM-DD")) {
                                minimumDate = minDate;
                            }
                            for (var i = 0; i < consumptionFiltered.length; i++) {
                                var index = 0;
                                if (consumptionFiltered[i].consumptionId > 0) {
                                    index = consumptionList.findIndex(c => c.consumptionId == consumptionFiltered[i].consumptionId);
                                } else {
                                    index = consumptionList.findIndex(c =>
                                        c.region.id == consumptionFiltered[i].region.id &&
                                        c.planningUnit.id == consumptionFiltered[i].planningUnit.id &&
                                        moment(c.consumptionDate).format("YYYY-MM") == moment(consumptionFiltered[i].consumptionDate).filter("YYYY-MM") &&
                                        c.actualFlag == consumptionFiltered[i].actualFlag
                                    );
                                }
                                consumptionList[index].consumptionQty = Math.round(Number(Number(consumptionFiltered[i].consumptionQty) + Number(((parseInt(rows[r].percentage)) / 100) * Number(consumptionFiltered[i].consumptionQty))));
                                consumptionList[index].consumptionRcpuQty = Math.round(Number(Number(consumptionFiltered[i].consumptionRcpuQty) + Number(((parseInt(rows[r].percentage)) / 100) * Number(consumptionFiltered[i].consumptionRcpuQty))));
                            }
                            actionList.push({
                                planningUnitId: planningUnitId,
                                type: FORECASTED_CONSUMPTION_MODIFIED,
                                date: moment(minimumDate).startOf('month').format("YYYY-MM-DD")
                            })
                            programJson.consumptionList = consumptionList;
                            programJson.actionList = actionList;
                        } else if (rows[r].scenarioId == 2) {
                            // var rangeValue = this.state.rangeValue;
                            let startDate = moment(rows[r].startDate).startOf('month').format("YYYY-MM-DD");
                            let stopDate = moment(rows[r].stopDate).endOf('month').format("YYYY-MM-DD");
                            var consumptionList = programJson.consumptionList;
                            var actionList = programJson.actionList;
                            if (actionList == undefined) {
                                actionList = []
                            }
                            var consumptionFiltered = consumptionList.filter(c => c.active == true
                                && c.planningUnit.id == planningUnitId
                                && moment(c.consumptionDate).format("YYYY-MM") >= moment(startDate).format("YYYY-MM")
                                && moment(c.consumptionDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM")
                                && (c.actualFlag).toString() == "false"
                            );
                            var minDate = moment.min(consumptionFiltered.map(d => moment(d.consumptionDate)))
                            if (moment(minDate).format("YYYY-MM-DD") < moment(minimumDate).format("YYYY-MM-DD")) {
                                minimumDate = minDate;
                            }
                            for (var i = 0; i < consumptionFiltered.length; i++) {
                                var index = 0;
                                if (consumptionFiltered[i].consumptionId > 0) {
                                    index = consumptionList.findIndex(c => c.consumptionId == consumptionFiltered[i].consumptionId);
                                } else {
                                    index = consumptionList.findIndex(c =>
                                        c.region.id == consumptionFiltered[i].region.id &&
                                        c.planningUnit.id == consumptionFiltered[i].planningUnit.id &&
                                        moment(c.consumptionDate).format("YYYY-MM") == moment(consumptionFiltered[i].consumptionDate).filter("YYYY-MM") &&
                                        c.actualFlag == consumptionFiltered[i].actualFlag
                                    );
                                }
                                consumptionList[index].consumptionQty = Math.round(Number(Number(consumptionFiltered[i].consumptionQty) - Number(((parseInt(rows[r].percentage)) / 100) * Number(consumptionFiltered[i].consumptionQty))));
                                consumptionList[index].consumptionRcpuQty = Math.round(Number(Number(consumptionFiltered[i].consumptionRcpuQty) - Number(((parseInt(rows[r].percentage)) / 100) * Number(consumptionFiltered[i].consumptionRcpuQty))));
                            }
                            actionList.push({
                                planningUnitId: planningUnitId,
                                type: FORECASTED_CONSUMPTION_MODIFIED,
                                date: moment(minimumDate).startOf('month').format("YYYY-MM-DD")
                            })
                            programJson.consumptionList = consumptionList;
                            programJson.actionList = actionList;
                        } else if (rows[r].scenarioId == 4) {
                            var shipmentList = programJson.shipmentList;
                            var actionList = programJson.actionList;
                            if (actionList == undefined) {
                                actionList = []
                            }
                            var shipmentUnFundedList = shipmentList.filter(c => (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS));
                            var minDate = moment.min(shipmentUnFundedList.map(d => moment(d.expectedDeliveryDate)))
                            if (moment(minDate).format("YYYY-MM-DD") < moment(minimumDate).format("YYYY-MM-DD")) {
                                minimumDate = minDate;
                            }
                            for (var i = 0; i < shipmentUnFundedList.length; i++) {
                                var papuResult = this.state.procurementAgentListForWhatIf.filter(c => c.procurementAgentId == shipmentUnFundedList[i].procurementAgent.id)[0];
                                var plannedDate = shipmentUnFundedList[i].plannedDate;
                                var submittedDate = shipmentUnFundedList[i].submittedDate;
                                var approvedDate = shipmentUnFundedList[i].approvedDate;
                                var shippedDate = shipmentUnFundedList[i].shippedDate;
                                var arrivedDate = shipmentUnFundedList[i].arrivedDate;
                                var receivedDate = shipmentUnFundedList[i].receivedDate;
                                var expectedDeliveryDate = shipmentUnFundedList[i].expectedDeliveryDate;
                                if (shipmentUnFundedList[i].localProcurement) {
                                    var addLeadTimes = this.props.items.planningUnitListAll.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].localProcurementLeadTime;
                                    var leadTimesPerStatus = addLeadTimes / 5;
                                    arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                    shippedDate = moment(arrivedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                    approvedDate = moment(shippedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                    submittedDate = moment(approvedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                    plannedDate = moment(submittedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                } else {
                                    var ppUnit = papuResult;
                                    var submittedToApprovedLeadTime = ppUnit.submittedToApprovedLeadTime;
                                    if (submittedToApprovedLeadTime == 0 || submittedToApprovedLeadTime == "" || submittedToApprovedLeadTime == null) {
                                        submittedToApprovedLeadTime = programJson.submittedToApprovedLeadTime;
                                    }
                                    var approvedToShippedLeadTime = "";
                                    approvedToShippedLeadTime = ppUnit.approvedToShippedLeadTime;
                                    if (approvedToShippedLeadTime == 0 || approvedToShippedLeadTime == "" || approvedToShippedLeadTime == null) {
                                        approvedToShippedLeadTime = programJson.approvedToShippedLeadTime;
                                    }

                                    var shippedToArrivedLeadTime = ""
                                    if (shipmentUnFundedList[i].shipmentMode == "Air") {
                                        shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedByAirLeadTime);
                                    } else {
                                        shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedBySeaLeadTime);
                                    }

                                    arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                    shippedDate = moment(arrivedDate).subtract(parseFloat(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                    approvedDate = moment(shippedDate).subtract(parseFloat(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                    submittedDate = moment(approvedDate).subtract(parseFloat(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                    plannedDate = moment(submittedDate).subtract(parseFloat(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                }
                                if (moment(submittedDate).format("YYYY-MM-DD") < moment(Date.now()).format("YYYY-MM-DD")) {
                                    var index = 0;
                                    if (shipmentUnFundedList[i].shipmentId > 0) {
                                        index = shipmentList.findIndex(c => c.shipmentId == shipmentUnFundedList[i].shipmentId);
                                    } else {
                                        index = shipmentUnFundedList[i].index;
                                    }
                                    shipmentList[index].accountFlag = 0;
                                }
                            }
                            actionList.push({
                                planningUnitId: planningUnitId,
                                type: SHIPMENT_MODIFIED,
                                date: moment(minimumDate).startOf('month').format("YYYY-MM-DD")
                            })
                            programJson.shipmentList = shipmentList;
                            programJson.actionList = actionList;
                        } else if (rows[r].scenarioId == 5) {
                            var shipmentList = programJson.shipmentList;
                            var actionList = programJson.actionList;
                            if (actionList == undefined) {
                                actionList = []
                            }
                            var shipmentUnFundedList = shipmentList.filter(c => (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                            var minDate = moment.min(shipmentUnFundedList.map(d => moment(d.expectedDeliveryDate)))
                            if (moment(minDate).format("YYYY-MM-DD") < moment(minimumDate).format("YYYY-MM-DD")) {
                                minimumDate = minDate;
                            }
                            for (var i = 0; i < shipmentUnFundedList.length; i++) {
                                var papuResult = this.state.procurementAgentListForWhatIf.filter(c => c.procurementAgentId == shipmentUnFundedList[i].procurementAgent.id)[0];
                                var plannedDate = shipmentUnFundedList[i].plannedDate;
                                var submittedDate = shipmentUnFundedList[i].submittedDate;
                                var approvedDate = shipmentUnFundedList[i].approvedDate;
                                var shippedDate = shipmentUnFundedList[i].shippedDate;
                                var arrivedDate = shipmentUnFundedList[i].arrivedDate;
                                var receivedDate = shipmentUnFundedList[i].receivedDate;
                                var expectedDeliveryDate = shipmentUnFundedList[i].expectedDeliveryDate;
                                if (shipmentUnFundedList[i].localProcurement) {
                                    var addLeadTimes = this.props.items.planningUnitListAll.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].localProcurementLeadTime;
                                    var leadTimesPerStatus = addLeadTimes / 5;
                                    arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                    shippedDate = moment(arrivedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                    approvedDate = moment(shippedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                    submittedDate = moment(approvedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                    plannedDate = moment(submittedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                } else {
                                    var ppUnit = papuResult;
                                    var submittedToApprovedLeadTime = ppUnit.submittedToApprovedLeadTime;
                                    if (submittedToApprovedLeadTime == 0 || submittedToApprovedLeadTime == "" || submittedToApprovedLeadTime == null) {
                                        submittedToApprovedLeadTime = programJson.submittedToApprovedLeadTime;
                                    }
                                    var approvedToShippedLeadTime = "";
                                    approvedToShippedLeadTime = ppUnit.approvedToShippedLeadTime;
                                    if (approvedToShippedLeadTime == 0 || approvedToShippedLeadTime == "" || approvedToShippedLeadTime == null) {
                                        approvedToShippedLeadTime = programJson.approvedToShippedLeadTime;
                                    }

                                    var shippedToArrivedLeadTime = ""
                                    if (shipmentUnFundedList[i].shipmentMode == "Air") {
                                        shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedByAirLeadTime);
                                    } else {
                                        shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedBySeaLeadTime);
                                    }

                                    arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                    shippedDate = moment(arrivedDate).subtract(parseFloat(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                    approvedDate = moment(shippedDate).subtract(parseFloat(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                    submittedDate = moment(approvedDate).subtract(parseFloat(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                    plannedDate = moment(submittedDate).subtract(parseFloat(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                }
                                if (moment(approvedDate).format("YYYY-MM-DD") < moment(Date.now()).format("YYYY-MM-DD")) {
                                    var index = 0;
                                    if (shipmentUnFundedList[i].shipmentId > 0) {
                                        index = shipmentList.findIndex(c => c.shipmentId == shipmentUnFundedList[i].shipmentId);
                                    } else {
                                        index = shipmentUnFundedList[i].index;
                                    }
                                    shipmentList[index].accountFlag = 0;
                                }
                            }
                            actionList.push({
                                planningUnitId: planningUnitId,
                                type: SHIPMENT_MODIFIED,
                                date: moment(minimumDate).startOf('month').format("YYYY-MM-DD")
                            })
                            programJson.shipmentList = shipmentList;
                            programJson.actionList = actionList;
                        } else if (rows[r].scenarioId == 6) {
                            var shipmentList = programJson.shipmentList;
                            var actionList = programJson.actionList;
                            if (actionList == undefined) {
                                actionList = []
                            }
                            // var shipmentUnFundedList = shipmentList.filter(c => (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS)) || (moment(c.arrivedDate).format("YYYY-MM-DD") <= moment(Date.now()).format("YYYY-MM-DD") && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS));
                            var shipmentUnFundedList = shipmentList.filter(c => (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS));
                            var minDate = moment.min(shipmentUnFundedList.map(d => moment(d.expectedDeliveryDate)))
                            if (moment(minDate).format("YYYY-MM-DD") < moment(minimumDate).format("YYYY-MM-DD")) {
                                minimumDate = minDate;
                            }
                            for (var i = 0; i < shipmentUnFundedList.length; i++) {
                                var papuResult = this.state.procurementAgentListForWhatIf.filter(c => c.procurementAgentId == shipmentUnFundedList[i].procurementAgent.id)[0];
                                var plannedDate = shipmentUnFundedList[i].plannedDate;
                                var submittedDate = shipmentUnFundedList[i].submittedDate;
                                var approvedDate = shipmentUnFundedList[i].approvedDate;
                                var shippedDate = shipmentUnFundedList[i].shippedDate;
                                var arrivedDate = shipmentUnFundedList[i].arrivedDate;
                                var receivedDate = shipmentUnFundedList[i].receivedDate;
                                var expectedDeliveryDate = shipmentUnFundedList[i].expectedDeliveryDate;
                                if (shipmentUnFundedList[i].localProcurement) {
                                    var addLeadTimes = this.props.items.planningUnitListAll.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].localProcurementLeadTime;
                                    var leadTimesPerStatus = addLeadTimes / 5;
                                    arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                    shippedDate = moment(arrivedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                    approvedDate = moment(shippedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                    submittedDate = moment(approvedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                    plannedDate = moment(submittedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                } else {
                                    var ppUnit = papuResult;
                                    var submittedToApprovedLeadTime = ppUnit.submittedToApprovedLeadTime;
                                    if (submittedToApprovedLeadTime == 0 || submittedToApprovedLeadTime == "" || submittedToApprovedLeadTime == null) {
                                        submittedToApprovedLeadTime = programJson.submittedToApprovedLeadTime;
                                    }
                                    var approvedToShippedLeadTime = "";
                                    approvedToShippedLeadTime = ppUnit.approvedToShippedLeadTime;
                                    if (approvedToShippedLeadTime == 0 || approvedToShippedLeadTime == "" || approvedToShippedLeadTime == null) {
                                        approvedToShippedLeadTime = programJson.approvedToShippedLeadTime;
                                    }

                                    var shippedToArrivedLeadTime = ""
                                    if (shipmentUnFundedList[i].shipmentMode == "Air") {
                                        shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedByAirLeadTime);
                                    } else {
                                        shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedBySeaLeadTime);
                                    }

                                    arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                    shippedDate = moment(arrivedDate).subtract(parseFloat(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                    approvedDate = moment(shippedDate).subtract(parseFloat(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                    submittedDate = moment(approvedDate).subtract(parseFloat(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                    plannedDate = moment(submittedDate).subtract(parseFloat(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                }
                                if (moment(shippedDate).format("YYYY-MM-DD") < moment(Date.now()).format("YYYY-MM-DD") && ((shipmentUnFundedList[i].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || shipmentUnFundedList[i].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || shipmentUnFundedList[i].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || shipmentUnFundedList[i].shipmentStatus.id == APPROVED_SHIPMENT_STATUS))) {
                                    var index = 0;
                                    if (shipmentUnFundedList[i].shipmentId > 0) {
                                        index = shipmentList.findIndex(c => c.shipmentId == shipmentUnFundedList[i].shipmentId);
                                    } else {
                                        index = shipmentUnFundedList[i].index;
                                    }
                                    shipmentList[index].accountFlag = 0;
                                }
                                if (moment(arrivedDate).format("YYYY-MM-DD") <= moment(Date.now()).format("YYYY-MM-DD") && ((shipmentUnFundedList[i].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || shipmentUnFundedList[i].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || shipmentUnFundedList[i].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || shipmentUnFundedList[i].shipmentStatus.id == APPROVED_SHIPMENT_STATUS || shipmentUnFundedList[i].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS))) {
                                    var index = 0;
                                    if (shipmentUnFundedList[i].shipmentId > 0) {
                                        index = shipmentList.findIndex(c => c.shipmentId == shipmentUnFundedList[i].shipmentId);
                                    } else {
                                        index = shipmentUnFundedList[i].index;
                                    }
                                    shipmentList[index].accountFlag = 0;
                                }
                            }
                            actionList.push({
                                planningUnitId: planningUnitId,
                                type: SHIPMENT_MODIFIED,
                                date: moment(minimumDate).startOf('month').format("YYYY-MM-DD")
                            })
                            programJson.shipmentList = shipmentList;
                            programJson.actionList = actionList;
                        }
                    }
                }
                var transaction1 = db1.transaction(['whatIfProgramData'], 'readwrite');
                var programTransaction1 = transaction1.objectStore('whatIfProgramData');
                var programRequest1 = programTransaction1.get(programId);
                programRequest1.onsuccess = function (event) {
                    programRequest1.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest1 = programTransaction1.put(programRequest1.result);
                    putRequest1.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext'),
                            loading: false,
                            color: "red"
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    putRequest1.onsuccess = function (event) {
                        document.getElementById("saveScenarioDiv").style.display = 'none'
                        calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'whatIfProgramData', 'whatIf', this, [], moment(minimumDate).startOf('month').format("YYYY-MM-DD"));
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    addRow() {
        this.setState({ loading: true });
        var db1;
        var storeOS;
        var programId = (document.getElementById("programId").value);
        var planningUnitId = (document.getElementById("planningUnitId").value);
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "red"
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['whatIfProgramData'], 'readwrite');
            var programTransaction = transaction.objectStore('whatIfProgramData');
            var programRequest = programTransaction.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "red"
                })
                this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                if (this.state.scenarioId == 3) {
                    var rangeValue = this.state.rangeValue;
                    let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
                    let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
                    var shipmentList = programJson.shipmentList;
                    var actionList = programJson.actionList;
                    if (actionList == undefined) {
                        actionList = []
                    }
                    var shipmentUnFundedList = shipmentList.filter(c => c.fundingSource.id == "" || c.fundingSource.id == TBD_FUNDING_SOURCE && c.planningUnit.id == planningUnitId && moment(c.expectedDeliveryDate).format("YYYY-MM") >= moment(startDate).format("YYYY-MM") && moment(c.expectedDeliveryDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM"));
                    var minDate = moment.min(shipmentUnFundedList.map(d => moment(d.expectedDeliveryDate)))
                    for (var i = 0; i < shipmentUnFundedList.length; i++) {
                        var index = 0;
                        if (shipmentUnFundedList[i].shipmentId > 0) {
                            index = shipmentList.findIndex(c => c.shipmentId == shipmentUnFundedList[i].shipmentId);
                        } else {
                            index = shipmentUnFundedList[i].index;
                        }
                        shipmentList[index].active = 0;
                    }
                    actionList.push({
                        planningUnitId: planningUnitId,
                        type: SHIPMENT_MODIFIED,
                        date: moment(minDate).startOf('month').format("YYYY-MM-DD")
                    })
                    programJson.shipmentList = shipmentList;
                    programJson.actionList = actionList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext'),
                            loading: false,
                            color: "red"
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.state.rows.push({
                            scenarioId: this.state.scenarioId,
                            scenarioName: document.getElementById('scenarioId').options[document.getElementById('scenarioId').selectedIndex].text,
                            percentage: this.state.percentage,
                            startDate: moment(startDate).format(DATE_FORMAT_CAP),
                            stopDate: moment(stopDate).format(DATE_FORMAT_CAP),
                            scenarioChecked: true
                        })
                        var dt = new Date();
                        dt.setMonth(dt.getMonth() - 10);
                        this.setState({ rows: this.state.rows, scenarioId: '', percentage: '', message: i18n.t('static.whatIf.scenarioAdded'), color: 'green' })
                        this.hideFirstComponent();
                        document.getElementById("consumptionScenariosFields1").style.display = "none";
                        document.getElementById("consumptionScenariosFields2").style.display = "none";
                        calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'whatIfProgramData', 'whatIf', this, [], moment(minDate).startOf('month').format("YYYY-MM-DD"));
                    }.bind(this)
                } else if (this.state.scenarioId == 1) {
                    var rangeValue = this.state.rangeValue;
                    let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
                    let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
                    var consumptionList = programJson.consumptionList;
                    var actionList = programJson.actionList;
                    if (actionList == undefined) {
                        actionList = []
                    }
                    var consumptionFiltered = consumptionList.filter(c => c.active == true
                        && c.planningUnit.id == planningUnitId
                        && moment(c.consumptionDate).format("YYYY-MM") >= moment(startDate).format("YYYY-MM")
                        && moment(c.consumptionDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM")
                        && (c.actualFlag).toString() == "false"
                    );
                    var minDate = moment.min(consumptionFiltered.map(d => moment(d.consumptionDate)))
                    for (var i = 0; i < consumptionFiltered.length; i++) {
                        var index = 0;
                        if (consumptionFiltered[i].consumptionId > 0) {
                            index = consumptionList.findIndex(c => c.consumptionId == consumptionFiltered[i].consumptionId);
                        } else {
                            index = consumptionList.findIndex(c =>
                                c.region.id == consumptionFiltered[i].region.id &&
                                c.planningUnit.id == consumptionFiltered[i].planningUnit.id &&
                                moment(c.consumptionDate).format("YYYY-MM") == moment(consumptionFiltered[i].consumptionDate).filter("YYYY-MM") &&
                                c.actualFlag == consumptionFiltered[i].actualFlag
                            );
                        }
                        consumptionList[index].consumptionQty = Math.round(Number(Number(consumptionFiltered[i].consumptionQty) + Number(((parseInt(this.state.percentage)) / 100) * Number(consumptionFiltered[i].consumptionQty))));
                        consumptionList[index].consumptionRcpuQty = Math.round(Number(Number(consumptionFiltered[i].consumptionRcpuQty) + Number(((parseInt(this.state.percentage)) / 100) * Number(consumptionFiltered[i].consumptionRcpuQty))));
                    }
                    actionList.push({
                        planningUnitId: planningUnitId,
                        type: FORECASTED_CONSUMPTION_MODIFIED,
                        date: moment(minDate).startOf('month').format("YYYY-MM-DD")
                    })
                    programJson.consumptionList = consumptionList;
                    programJson.actionList = actionList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext'),
                            loading: false,
                            color: "red"
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.state.rows.push({
                            scenarioId: this.state.scenarioId,
                            scenarioName: document.getElementById('scenarioId').options[document.getElementById('scenarioId').selectedIndex].text,
                            percentage: this.state.percentage,
                            startDate: moment(startDate).format(DATE_FORMAT_CAP),
                            stopDate: moment(stopDate).format(DATE_FORMAT_CAP),
                            scenarioChecked: true
                        })
                        var dt = new Date();
                        dt.setMonth(dt.getMonth() - 10);
                        this.setState({ rows: this.state.rows, scenarioId: '', percentage: '', message: i18n.t('static.whatIf.scenarioAdded'), color: 'green' },
                            () => {
                            })
                        this.hideFirstComponent();
                        document.getElementById("consumptionScenariosFields1").style.display = "none";
                        document.getElementById("consumptionScenariosFields2").style.display = "none";
                        calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'whatIfProgramData', 'whatIf', this, [], moment(minDate).startOf('month').format("YYYY-MM-DD"));
                    }.bind(this)
                } else if (this.state.scenarioId == 2) {
                    var rangeValue = this.state.rangeValue;
                    let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
                    let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
                    var consumptionList = programJson.consumptionList;
                    var actionList = programJson.actionList;
                    if (actionList == undefined) {
                        actionList = []
                    }
                    var consumptionFiltered = consumptionList.filter(c => c.active == true
                        && c.planningUnit.id == planningUnitId
                        && moment(c.consumptionDate).format("YYYY-MM") >= moment(startDate).format("YYYY-MM")
                        && moment(c.consumptionDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM")
                        && (c.actualFlag).toString() == "false"
                    );
                    var minDate = moment.min(consumptionFiltered.map(d => moment(d.consumptionDate)))
                    for (var i = 0; i < consumptionFiltered.length; i++) {
                        var index = 0;
                        if (consumptionFiltered[i].consumptionId > 0) {
                            index = consumptionList.findIndex(c => c.consumptionId == consumptionFiltered[i].consumptionId);
                        } else {
                            index = consumptionList.findIndex(c =>
                                c.region.id == consumptionFiltered[i].region.id &&
                                c.planningUnit.id == consumptionFiltered[i].planningUnit.id &&
                                moment(c.consumptionDate).format("YYYY-MM") == moment(consumptionFiltered[i].consumptionDate).filter("YYYY-MM") &&
                                c.actualFlag == consumptionFiltered[i].actualFlag
                            );
                        }
                        consumptionList[index].consumptionQty = Math.round(Number(Number(consumptionFiltered[i].consumptionQty) - Number(((parseInt(this.state.percentage)) / 100) * Number(consumptionFiltered[i].consumptionQty))));
                        consumptionList[index].consumptionRcpuQty = Math.round(Number(Number(consumptionFiltered[i].consumptionRcpuQty) - Number(((parseInt(this.state.percentage)) / 100) * Number(consumptionFiltered[i].consumptionRcpuQty))));
                    }
                    actionList.push({
                        planningUnitId: planningUnitId,
                        type: FORECASTED_CONSUMPTION_MODIFIED,
                        date: moment(minDate).startOf('month').format("YYYY-MM-DD")
                    })
                    programJson.consumptionList = consumptionList;
                    programJson.actionList = actionList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext'),
                            loading: false,
                            color: "red"
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.state.rows.push({
                            scenarioId: this.state.scenarioId,
                            scenarioName: document.getElementById('scenarioId').options[document.getElementById('scenarioId').selectedIndex].text,
                            percentage: this.state.percentage,
                            startDate: moment(startDate).format(DATE_FORMAT_CAP),
                            stopDate: moment(stopDate).format(DATE_FORMAT_CAP),
                            scenarioChecked: true
                        })
                        var dt = new Date();
                        dt.setMonth(dt.getMonth() - 10);
                        this.setState({ rows: this.state.rows, scenarioId: '', percentage: '', message: i18n.t('static.whatIf.scenarioAdded'), color: 'green' })
                        this.hideFirstComponent();
                        document.getElementById("consumptionScenariosFields1").style.display = "none";
                        document.getElementById("consumptionScenariosFields2").style.display = "none";
                        calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'whatIfProgramData', 'whatIf', this, [], moment(minDate).startOf('month').format("YYYY-MM-DD"));
                    }.bind(this)
                } else if (this.state.scenarioId == 4) {
                    var shipmentList = programJson.shipmentList;
                    var actionList=programJson.actionList;
                    if (actionList == undefined) {
                        actionList = []
                    }
                    var shipmentUnFundedList = shipmentList.filter(c => (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS));
                    var minDate = moment.min(shipmentUnFundedList.map(d => moment(d.expectedDeliveryDate)))
                    for (var i = 0; i < shipmentUnFundedList.length; i++) {
                        var papuResult = this.state.procurementAgentListForWhatIf.filter(c => c.procurementAgentId == shipmentUnFundedList[i].procurementAgent.id)[0];
                        var plannedDate = shipmentUnFundedList[i].plannedDate;
                        var submittedDate = shipmentUnFundedList[i].submittedDate;
                        var approvedDate = shipmentUnFundedList[i].approvedDate;
                        var shippedDate = shipmentUnFundedList[i].shippedDate;
                        var arrivedDate = shipmentUnFundedList[i].arrivedDate;
                        var receivedDate = shipmentUnFundedList[i].receivedDate;
                        var expectedDeliveryDate = shipmentUnFundedList[i].expectedDeliveryDate;
                        if (shipmentUnFundedList[i].localProcurement) {
                            var addLeadTimes = this.props.items.planningUnitListAll.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].localProcurementLeadTime;
                            var leadTimesPerStatus = addLeadTimes / 5;
                            arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            shippedDate = moment(arrivedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            approvedDate = moment(shippedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            submittedDate = moment(approvedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            plannedDate = moment(submittedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                        } else {
                            var ppUnit = papuResult;
                            var submittedToApprovedLeadTime = ppUnit.submittedToApprovedLeadTime;
                            if (submittedToApprovedLeadTime == 0 || submittedToApprovedLeadTime == "" || submittedToApprovedLeadTime == null) {
                                submittedToApprovedLeadTime = programJson.submittedToApprovedLeadTime;
                            }
                            var approvedToShippedLeadTime = "";
                            approvedToShippedLeadTime = ppUnit.approvedToShippedLeadTime;
                            if (approvedToShippedLeadTime == 0 || approvedToShippedLeadTime == "" || approvedToShippedLeadTime == null) {
                                approvedToShippedLeadTime = programJson.approvedToShippedLeadTime;
                            }

                            var shippedToArrivedLeadTime = ""
                            if (shipmentUnFundedList[i].shipmentMode == "Air") {
                                shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedByAirLeadTime);
                            } else {
                                shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedBySeaLeadTime);
                            }

                            arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                            shippedDate = moment(arrivedDate).subtract(parseFloat(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            approvedDate = moment(shippedDate).subtract(parseFloat(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            submittedDate = moment(approvedDate).subtract(parseFloat(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            plannedDate = moment(submittedDate).subtract(parseFloat(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                        }
                        if (moment(submittedDate).format("YYYY-MM-DD") < moment(Date.now()).format("YYYY-MM-DD")) {
                            var index = 0;
                            if (shipmentUnFundedList[i].shipmentId > 0) {
                                index = shipmentList.findIndex(c => c.shipmentId == shipmentUnFundedList[i].shipmentId);
                            } else {
                                index = shipmentUnFundedList[i].index;
                            }
                            shipmentList[index].accountFlag = 0;
                        }
                    }
                    actionList.push({
                        planningUnitId: planningUnitId,
                        type: SHIPMENT_MODIFIED,
                        date: moment(minDate).startOf('month').format("YYYY-MM-DD")
                    })
                    programJson.shipmentList = shipmentList;
                    programJson.actionList=actionList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext'),
                            loading: false,
                            color: "red"
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.state.rows.push({
                            scenarioId: this.state.scenarioId,
                            scenarioName: document.getElementById('scenarioId').options[document.getElementById('scenarioId').selectedIndex].text,
                            percentage: this.state.percentage,
                            startDate: "",
                            stopDate: "",
                            scenarioChecked: true
                        })
                        this.setState({ rows: this.state.rows, scenarioId: '', percentage: '', startDate: '', stopDate: '', message: i18n.t('static.whatIf.scenarioAdded'), color: 'green' })
                        this.hideFirstComponent();
                        document.getElementById("consumptionScenariosFields1").style.display = "none";
                        document.getElementById("consumptionScenariosFields2").style.display = "none";
                        calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'whatIfProgramData', 'whatIf', this, [], moment(minDate).startOf('month').format("YYYY-MM-DD"));

                    }.bind(this)
                } else if (this.state.scenarioId == 5) {
                    var shipmentList = programJson.shipmentList;
                    var actionList=programJson.actionList;
                    if (actionList == undefined) {
                        actionList = []
                    }
                    var shipmentUnFundedList = shipmentList.filter(c => (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                    var minDate = moment.min(shipmentUnFundedList.map(d => moment(d.expectedDeliveryDate)))
                    for (var i = 0; i < shipmentUnFundedList.length; i++) {
                        var papuResult = this.state.procurementAgentListForWhatIf.filter(c => c.procurementAgentId == shipmentUnFundedList[i].procurementAgent.id)[0];
                        var plannedDate = shipmentUnFundedList[i].plannedDate;
                        var submittedDate = shipmentUnFundedList[i].submittedDate;
                        var approvedDate = shipmentUnFundedList[i].approvedDate;
                        var shippedDate = shipmentUnFundedList[i].shippedDate;
                        var arrivedDate = shipmentUnFundedList[i].arrivedDate;
                        var receivedDate = shipmentUnFundedList[i].receivedDate;
                        var expectedDeliveryDate = shipmentUnFundedList[i].expectedDeliveryDate;
                        if (shipmentUnFundedList[i].localProcurement) {
                            var addLeadTimes = this.props.items.planningUnitListAll.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].localProcurementLeadTime;
                            var leadTimesPerStatus = addLeadTimes / 5;
                            arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            shippedDate = moment(arrivedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            approvedDate = moment(shippedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            submittedDate = moment(approvedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            plannedDate = moment(submittedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                        } else {
                            var ppUnit = papuResult;
                            var submittedToApprovedLeadTime = ppUnit.submittedToApprovedLeadTime;
                            if (submittedToApprovedLeadTime == 0 || submittedToApprovedLeadTime == "" || submittedToApprovedLeadTime == null) {
                                submittedToApprovedLeadTime = programJson.submittedToApprovedLeadTime;
                            }
                            var approvedToShippedLeadTime = "";
                            approvedToShippedLeadTime = ppUnit.approvedToShippedLeadTime;
                            if (approvedToShippedLeadTime == 0 || approvedToShippedLeadTime == "" || approvedToShippedLeadTime == null) {
                                approvedToShippedLeadTime = programJson.approvedToShippedLeadTime;
                            }

                            var shippedToArrivedLeadTime = ""
                            if (shipmentUnFundedList[i].shipmentMode == "Air") {
                                shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedByAirLeadTime);
                            } else {
                                shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedBySeaLeadTime);
                            }

                            arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                            shippedDate = moment(arrivedDate).subtract(parseFloat(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            approvedDate = moment(shippedDate).subtract(parseFloat(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            submittedDate = moment(approvedDate).subtract(parseFloat(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            plannedDate = moment(submittedDate).subtract(parseFloat(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                        }
                        if (moment(approvedDate).format("YYYY-MM-DD") < moment(Date.now()).format("YYYY-MM-DD")) {
                            var index = 0;
                            if (shipmentUnFundedList[i].shipmentId > 0) {
                                index = shipmentList.findIndex(c => c.shipmentId == shipmentUnFundedList[i].shipmentId);
                            } else {
                                index = shipmentUnFundedList[i].index;
                            }
                            shipmentList[index].accountFlag = 0;
                        }
                    }
                    actionList.push({
                        planningUnitId: planningUnitId,
                        type: SHIPMENT_MODIFIED,
                        date: moment(minDate).startOf('month').format("YYYY-MM-DD")
                    })
                    programJson.shipmentList = shipmentList;
                    programJson.actionList=actionList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext'),
                            loading: false,
                            color: "red"
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.state.rows.push({
                            scenarioId: this.state.scenarioId,
                            scenarioName: document.getElementById('scenarioId').options[document.getElementById('scenarioId').selectedIndex].text,
                            percentage: this.state.percentage,
                            startDate: "",
                            stopDate: "",
                            scenarioChecked: true
                        })
                        this.setState({ rows: this.state.rows, scenarioId: '', percentage: '', startDate: '', stopDate: '', message: i18n.t('static.whatIf.scenarioAdded'), color: 'green' })
                        this.hideFirstComponent();
                        document.getElementById("consumptionScenariosFields1").style.display = "none";
                        document.getElementById("consumptionScenariosFields2").style.display = "none";
                        calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'whatIfProgramData', 'whatIf', this, [], moment(minDate).startOf('month').format("YYYY-MM-DD"));

                    }.bind(this)
                } else if (this.state.scenarioId == 6) {
                    var shipmentList = programJson.shipmentList;
                    var actionList=programJson.actionList;
                    if (actionList == undefined) {
                        actionList = []
                    }
                    // var shipmentUnFundedList = shipmentList.filter(c => (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS)) || (moment(c.arrivedDate).format("YYYY-MM-DD") <= moment(Date.now()).format("YYYY-MM-DD") && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS));
                    var shipmentUnFundedList = shipmentList.filter(c => (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS));
                    var minDate = moment.min(shipmentUnFundedList.map(d => moment(d.expectedDeliveryDate)))
                    for (var i = 0; i < shipmentUnFundedList.length; i++) {
                        var papuResult = this.state.procurementAgentListForWhatIf.filter(c => c.procurementAgentId == shipmentUnFundedList[i].procurementAgent.id)[0];
                        var plannedDate = shipmentUnFundedList[i].plannedDate;
                        var submittedDate = shipmentUnFundedList[i].submittedDate;
                        var approvedDate = shipmentUnFundedList[i].approvedDate;
                        var shippedDate = shipmentUnFundedList[i].shippedDate;
                        var arrivedDate = shipmentUnFundedList[i].arrivedDate;
                        var receivedDate = shipmentUnFundedList[i].receivedDate;
                        var expectedDeliveryDate = shipmentUnFundedList[i].expectedDeliveryDate;
                        if (shipmentUnFundedList[i].localProcurement) {
                            var addLeadTimes = this.props.items.planningUnitListAll.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].localProcurementLeadTime;
                            var leadTimesPerStatus = addLeadTimes / 5;
                            arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            shippedDate = moment(arrivedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            approvedDate = moment(shippedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            submittedDate = moment(approvedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            plannedDate = moment(submittedDate).subtract(parseFloat(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                        } else {
                            var ppUnit = papuResult;
                            var submittedToApprovedLeadTime = ppUnit.submittedToApprovedLeadTime;
                            if (submittedToApprovedLeadTime == 0 || submittedToApprovedLeadTime == "" || submittedToApprovedLeadTime == null) {
                                submittedToApprovedLeadTime = programJson.submittedToApprovedLeadTime;
                            }
                            var approvedToShippedLeadTime = "";
                            approvedToShippedLeadTime = ppUnit.approvedToShippedLeadTime;
                            if (approvedToShippedLeadTime == 0 || approvedToShippedLeadTime == "" || approvedToShippedLeadTime == null) {
                                approvedToShippedLeadTime = programJson.approvedToShippedLeadTime;
                            }

                            var shippedToArrivedLeadTime = ""
                            if (shipmentUnFundedList[i].shipmentMode == "Air") {
                                shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedByAirLeadTime);
                            } else {
                                shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedBySeaLeadTime);
                            }

                            arrivedDate = moment(expectedDeliveryDate).subtract(parseFloat(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                            shippedDate = moment(arrivedDate).subtract(parseFloat(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            approvedDate = moment(shippedDate).subtract(parseFloat(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            submittedDate = moment(approvedDate).subtract(parseFloat(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            plannedDate = moment(submittedDate).subtract(parseFloat(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                        }
                        if (moment(shippedDate).format("YYYY-MM-DD") < moment(Date.now()).format("YYYY-MM-DD") && ((shipmentUnFundedList[i].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || shipmentUnFundedList[i].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || shipmentUnFundedList[i].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || shipmentUnFundedList[i].shipmentStatus.id == APPROVED_SHIPMENT_STATUS))) {
                            var index = 0;
                            if (shipmentUnFundedList[i].shipmentId > 0) {
                                index = shipmentList.findIndex(c => c.shipmentId == shipmentUnFundedList[i].shipmentId);
                            } else {
                                index = shipmentUnFundedList[i].index;
                            }
                            shipmentList[index].accountFlag = 0;
                        }
                        if (moment(arrivedDate).format("YYYY-MM-DD") <= moment(Date.now()).format("YYYY-MM-DD") && ((shipmentUnFundedList[i].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || shipmentUnFundedList[i].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || shipmentUnFundedList[i].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || shipmentUnFundedList[i].shipmentStatus.id == APPROVED_SHIPMENT_STATUS || shipmentUnFundedList[i].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS))) {
                            var index = 0;
                            if (shipmentUnFundedList[i].shipmentId > 0) {
                                index = shipmentList.findIndex(c => c.shipmentId == shipmentUnFundedList[i].shipmentId);
                            } else {
                                index = shipmentUnFundedList[i].index;
                            }
                            shipmentList[index].accountFlag = 0;
                        }
                    }
                    actionList.push({
                        planningUnitId: planningUnitId,
                        type: SHIPMENT_MODIFIED,
                        date: moment(minDate).startOf('month').format("YYYY-MM-DD")
                    })
                    programJson.shipmentList = shipmentList;
                    programJson.actionList=actionList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext'),
                            loading: false,
                            color: "red"
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.state.rows.push({
                            scenarioId: this.state.scenarioId,
                            scenarioName: document.getElementById('scenarioId').options[document.getElementById('scenarioId').selectedIndex].text,
                            percentage: this.state.percentage,
                            startDate: "",
                            stopDate: "",
                            scenarioChecked: true
                        })
                        this.setState({ rows: this.state.rows, scenarioId: '', percentage: '', startDate: '', stopDate: '', message: i18n.t('static.whatIf.scenarioAdded'), color: 'green' })
                        this.hideFirstComponent();
                        document.getElementById("consumptionScenariosFields1").style.display = "none";
                        document.getElementById("consumptionScenariosFields2").style.display = "none";
                        calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'whatIfProgramData', 'whatIf', this, [], moment(minDate).startOf('month').format("YYYY-MM-DD"));

                    }.bind(this)
                }
            }.bind(this)
        }.bind(this)
    }

    touchAll(errors) {
        this.validateForm(errors);
    }
    validateForm(errors) {
        this.findFirstError('whatIfForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstError(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }

    toggleAccordionScenarioList() {
        this.setState({
            showScenarioList: !this.state.showScenarioList
        })
        var fields = document.getElementsByClassName("scenarioListDiv");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showScenarioList == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
    }

    toggleAccordionTotalShipments() {
        this.setState({
            showTotalShipment: !this.state.showTotalShipment
        })
        var fields = document.getElementsByClassName("totalShipments");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalShipment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }

        fields = document.getElementsByClassName("manualShipments");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalShipment == true && this.state.showManualShipment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }

        fields = document.getElementsByClassName("erpShipments");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalShipment == true && this.state.showErpShipment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }

    }

    toggleAccordionManualShipments() {
        this.setState({
            showManualShipment: !this.state.showManualShipment
        })
        var fields = document.getElementsByClassName("manualShipments");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showManualShipment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
    }

    toggleAccordionErpShipments() {
        this.setState({
            showErpShipment: !this.state.showErpShipment
        })
        var fields = document.getElementsByClassName("erpShipments");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showErpShipment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
    }
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

    exportCSV = () => {

        var csvRow = [];
        csvRow.push("\"" + (i18n.t('static.program.program') + ' : ' + (this.state.programSelect).label).replaceAll(' ', '%20') + "\"")
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')

        csvRow.push("\"" + (i18n.t('static.planningunit.planningunit') + ' : ' + ((this.state.planningUnit).label)).replaceAll(' ', '%20') + "\"")
        csvRow.push("\"" + i18n.t("static.supplyPlan.amcPast").replaceAll(' ', '%20') + ' : ' + this.state.monthsInPastForAMC + "\"")
        csvRow.push("\"" + i18n.t("static.supplyPlan.amcFuture").replaceAll(' ', '%20') + ' : ' + this.state.monthsInFutureForAMC + "\"")
        csvRow.push("\"" + i18n.t("static.report.shelfLife").replaceAll(' ', '%20') + ' : ' + this.state.shelfLife + "\"")
        csvRow.push("\"" + i18n.t("static.supplyPlan.minStockMos").replaceAll(' ', '%20') + ' : ' + this.state.minStockMoSQty + "\"")
        csvRow.push("\"" + i18n.t("static.report.reorderFrequencyInMonths").replaceAll(' ', '%20').replaceAll('#', '%23') + ' : ' + this.state.reorderFrequency + "\"")
        csvRow.push("\"" + i18n.t("static.supplyPlan.maxStockMos").replaceAll(' ', '%20') + ' : ' + this.state.maxStockMoSQty + "\"")

        csvRow.push('')

        const senheaders = [];
        senheaders.push((i18n.t('static.whatIf.scenario')).replaceAll(' ', '%20'))
        senheaders.push((i18n.t('static.common.startdate')).replaceAll(' ', '%20'))
        senheaders.push((i18n.t('static.common.stopdate')).replaceAll(' ', '%20'))
        senheaders.push((i18n.t('static.whatIf.percentage')).replaceAll(' ', '%20'))
        var B = [senheaders]

        this.state.rows.map(
            ele => B.push(this.addDoubleQuoteToRowContent([
                (ele.scenarioName).replaceAll(' ', '%20'),
                (ele.startDate).replaceAll(' ', '%20'),
                (ele.stopDate).replaceAll(' ', '%20'),
                (ele.percentage).replaceAll(' ', '%20'),
            ])));

        for (var i = 0; i < B.length; i++) {
            csvRow.push(B[i].join(","))
        }
        csvRow.push('')

        const header = [...[""], ... (this.state.monthsArray.map(item => (
            item.monthName.concat(" ").concat(item.monthYear)
        ))
        )]
        var A = [header]

        var openningArr = [...["\"" + i18n.t('static.supplyPlan.openingBalance').replaceAll(' ', '%20') + "\""], ... this.state.openingBalanceArray]
        var consumptionArr = [...["\'" + ("-" + i18n.t('static.supplyPlan.consumption')).replaceAll(' ', '%20') + "\'"], ...this.state.consumptionTotalData]
        var shipmentArr = [...["\'" + ("+" + i18n.t('static.dashboard.shipments')).replaceAll(' ', '%20') + "\'"], ...this.state.shipmentsTotalData]
        var suggestedArr = [...["\"" + ("   " + i18n.t('static.supplyPlan.suggestedShipments')).replaceAll(' ', '%20') + "\""], ...this.state.suggestedShipmentsTotalData.map(item => item.suggestedOrderQty)]
        var manualEntryShipmentsArr = [...["\"" + ("  " + i18n.t('static.supplyPlan.manualEntryShipments')).replaceAll(' ', '%20') + "\""], ...this.state.manualShipmentsTotalData]

        var deliveredShipmentArr = [...["\"" + ("     " + i18n.t('static.supplyPlan.delivered')).replaceAll(' ', '%20') + "\""], ...this.state.deliveredShipmentsTotalData.map(item => item.qty)]
        var shippedShipmentArr = [...["\"" + ("     " + i18n.t('static.supplyPlan.shipped')).replaceAll(' ', '%20') + "\""], ...this.state.shippedShipmentsTotalData.map(item => item.qty)]
        var orderedShipmentArr = [...["\"" + ("     " + i18n.t('static.supplyPlan.submitted')).replaceAll(' ', '%20') + "\""], ...this.state.orderedShipmentsTotalData.map(item => item.qty)]
        var plannedShipmentArr = [...["\"" + ("     " + i18n.t('static.supplyPlan.planned')).replaceAll(' ', '%20') + "\""], ...this.state.plannedShipmentsTotalData.map(item => item.qty)]

        var erpShipmentsArr = [...["\"" + ("  " + i18n.t('static.supplyPlan.erpShipments')).replaceAll(' ', '%20') + "\""], ...this.state.erpShipmentsTotalData]
        var deliveredErpShipmentArr = [...["\"" + ("     " + i18n.t('static.supplyPlan.delivered')).replaceAll(' ', '%20') + "\""], ...this.state.deliveredErpShipmentsTotalData.map(item => item.qty)]
        var shippedErpShipmentArr = [...["\"" + ("     " + i18n.t('static.supplyPlan.shipped')).replaceAll(' ', '%20') + "\""], ...this.state.shippedErpShipmentsTotalData.map(item => item.qty)]
        var orderedErpShipmentArr = [...["\"" + ("     " + i18n.t('static.supplyPlan.submitted')).replaceAll(' ', '%20') + "\""], ...this.state.orderedErpShipmentsTotalData.map(item => item.qty)]
        var plannedErpShipmentArr = [...["\"" + ("     " + i18n.t('static.supplyPlan.planned')).replaceAll(' ', '%20') + "\""], ...this.state.plannedErpShipmentsTotalData.map(item => item.qty)]

        var inventoryArr = [...["\"" + (i18n.t('static.supplyPlan.adjustments')).replaceAll(' ', '%20') + "\""], ...this.state.inventoryTotalData]
        var closingBalanceArr = [...["\"" + (i18n.t('static.supplyPlan.endingBalance')).replaceAll(' ', '%20') + "\""], ...this.state.closingBalanceArray]
        var monthsOfStockArr = [...["\"" + (i18n.t('static.supplyPlan.monthsOfStock')).replaceAll(' ', '%20') + "\""], ... this.state.monthsOfStockArray]
        var amcgArr = [...["\"" + (i18n.t('static.supplyPlan.amc')).replaceAll(' ', '%20') + "\""], ...this.state.amcTotalData]

        // var minStocArr = [...["\"" + (i18n.t('static.supplyPlan.minStockMos')).replaceAll(' ', '%20') + "\""], ...this.state.minStockMoS]
        // var maxStockArr = [...["\"" + (i18n.t('static.supplyPlan.maxStockMos')).replaceAll(' ', '%20') + "\""], ...this.state.maxStockMoS]
        var unmetDemandArr = [...["\"" + (i18n.t('static.supplyPlan.unmetDemandStr')).replaceAll(' ', '%20') + "\""], ...this.state.unmetDemand]


        A.push(openningArr)
        A.push(consumptionArr.map((c, item) => item != 0 ? c.consumptionQty : c));
        A.push(shipmentArr)
        A.push(suggestedArr)
        A.push(manualEntryShipmentsArr)
        A.push(deliveredShipmentArr)
        A.push(shippedShipmentArr)
        A.push(orderedShipmentArr)
        A.push(plannedShipmentArr)
        A.push(erpShipmentsArr)
        A.push(deliveredErpShipmentArr)
        A.push(shippedErpShipmentArr)
        A.push(orderedErpShipmentArr)
        A.push(plannedErpShipmentArr)
        A.push(inventoryArr)
        A.push(closingBalanceArr)
        A.push(monthsOfStockArr)
        A.push(amcgArr)

        // A.push(minStocArr)
        // A.push(maxStockArr)
        A.push(unmetDemandArr)
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.whatIf') + ".csv"
        document.body.appendChild(a)
        a.click()
    }

    exportPDF = () => {
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

            // var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
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
                /*doc.addImage(data, 10, 30, {
                align: 'justify'
                });*/
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.whatIf'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')

                    doc.text(i18n.t('static.program.program') + ' : ' + (this.state.programSelect).label, doc.internal.pageSize.width / 10, 80, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + (this.state.planningUnit).label, doc.internal.pageSize.width / 10, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.supplyPlan.amcPast') + ' : ' + this.state.monthsInPastForAMC, doc.internal.pageSize.width / 10, 100, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.supplyPlan.amcFuture') + ' : ' + this.state.monthsInFutureForAMC, doc.internal.pageSize.width / 10, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.shelfLife') + ' : ' + this.state.shelfLife, doc.internal.pageSize.width / 10, 120, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.supplyPlan.minStockMos') + ' : ' + this.state.minStockMoSQty, doc.internal.pageSize.width / 10, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.reorderFrequencyInMonths') + ' : ' + this.state.reorderFrequency, doc.internal.pageSize.width / 10, 140, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.supplyPlan.maxStockMos') + ' : ' + this.state.maxStockMoSQty, doc.internal.pageSize.width / 10, 150, {
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

        doc.setFontSize(15);

        var canvas = document.getElementById("cool-canvas");
        //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 100;
        var aspectwidth1 = (width - h1);

        doc.addImage(canvasImg, 'png', 50, 150, 750, 340, 'CANVAS');
        // doc.addImage(canvasImg, 'png', 50, 110, aspectwidth1, (height - h1) * 3 / 4);

        const senHeaders = [];
        senHeaders.push(i18n.t('static.whatIf.scenario'));
        senHeaders.push(i18n.t('static.common.startdate'));
        senHeaders.push(i18n.t('static.common.stopdate'));
        senHeaders.push(i18n.t('static.whatIf.percentage'));

        let senData = this.state.rows.map(ele => [
            ele.scenarioName,
            ele.startDate,
            ele.stopDate,
            ele.percentage,
        ]);

        let senContent = {
            margin: { top: 80, bottom: 70 },
            startY: height,
            head: [senHeaders],
            body: senData,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
            columnStyles: {
                // 0: { cellWidth: 200 },
                // 1: { cellWidth: 80 },
                // 2: { cellWidth: 80 },
                // 3: { cellWidth: 80 },
            }
        };
        doc.autoTable(senContent);

        const header = [...[""], ... (this.state.monthsArray.map(item => (
            item.monthName.concat(" ").concat(item.monthYear)
        ))
        )]

        const headers = [header];
        var openningArr = [...[i18n.t('static.supplyPlan.openingBalance')], ... this.state.openingBalanceArray]
        var consumptionArr = [...[("-" + i18n.t('static.supplyPlan.consumption'))], ...this.state.consumptionTotalData]
        var shipmentArr = [...[("+" + i18n.t('static.dashboard.shipments'))], ...this.state.shipmentsTotalData]
        var suggestedArr = [...[("   " + i18n.t('static.supplyPlan.suggestedShipments'))], ...this.state.suggestedShipmentsTotalData.map(item => item.suggestedOrderQty)]
        var manualEntryShipmentsArr = [...[("  " + i18n.t('static.supplyPlan.manualEntryShipments'))], ...this.state.manualShipmentsTotalData]

        var deliveredShipmentArr = [...[("     " + i18n.t('static.supplyPlan.delivered'))], ...this.state.deliveredShipmentsTotalData.map(item => item.qty)]
        var shippedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.shipped'))], ...this.state.shippedShipmentsTotalData.map(item => item.qty)]
        var orderedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.submitted'))], ...this.state.orderedShipmentsTotalData.map(item => item.qty)]
        var plannedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.planned'))], ...this.state.plannedShipmentsTotalData.map(item => item.qty)]

        var erpShipmentsArr = [...[("  " + i18n.t('static.supplyPlan.erpShipments'))], ...this.state.erpShipmentsTotalData]
        var deliveredErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.delivered'))], ...this.state.deliveredErpShipmentsTotalData.map(item => item.qty)]
        var shippedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.shipped'))], ...this.state.shippedErpShipmentsTotalData.map(item => item.qty)]
        var orderedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.submitted'))], ...this.state.orderedErpShipmentsTotalData.map(item => item.qty)]
        var plannedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.planned'))], ...this.state.plannedErpShipmentsTotalData.map(item => item.qty)]

        var inventoryArr = [...[(i18n.t('static.supplyPlan.adjustments'))], ...this.state.inventoryTotalData]
        var closingBalanceArr = [...[(i18n.t('static.supplyPlan.endingBalance'))], ...this.state.closingBalanceArray]
        var monthsOfStockArr = [...[(i18n.t('static.supplyPlan.monthsOfStock'))], ... this.state.monthsOfStockArray]
        var amcgArr = [...[(i18n.t('static.supplyPlan.amc'))], ...this.state.amcTotalData]

        // var minStocArr = [...[(i18n.t('static.supplyPlan.minStockMos'))], ...this.state.minStockMoS]
        // var maxStockArr = [...[(i18n.t('static.supplyPlan.maxStockMos'))], ...this.state.maxStockMoS]
        var unmetDemandArr = [...[(i18n.t('static.supplyPlan.unmetDemandStr'))], ...this.state.unmetDemand]

        const data = [openningArr.map(c => this.formatter(c)), consumptionArr.map((c, item) => item != 0 ? this.formatter(c.consumptionQty) : c), shipmentArr.map(c => this.formatter(c)), suggestedArr.map(c => this.formatter(c)), manualEntryShipmentsArr.map(c => this.formatter(c)), deliveredShipmentArr.map(c => this.formatter(c)), shippedShipmentArr.map(c => this.formatter(c)), orderedShipmentArr.map(c => this.formatter(c)), plannedShipmentArr.map(c => this.formatter(c)), erpShipmentsArr.map(c => this.formatter(c)), deliveredErpShipmentArr.map(c => this.formatter(c)), shippedErpShipmentArr.map(c => this.formatter(c)), orderedErpShipmentArr.map(c => this.formatter(c)), plannedErpShipmentArr.map(c => this.formatter(c)), inventoryArr.map(c => this.formatter(c)), closingBalanceArr.map(c => this.formatter(c)), monthsOfStockArr.map(c => this.formatterDouble(c)), amcgArr.map(c => this.formatter(c)), unmetDemandArr.map(c => this.formatter(c))];

        let content = {
            margin: { top: 80, bottom: 70 },
            startY: height,
            head: headers,
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 39, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 59.89 }
            }
        };
        doc.autoTable(content);

        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        var y = doc.autoTableEndPosY() + 20
        if (y + 100 > height) {
            doc.addPage();
            y = 80
        }
        doc.text(i18n.t('static.program.notes'), doc.internal.pageSize.width / 9, y, {
            align: 'left'
        })
        doc.setFont('helvetica', 'normal')
        var cnt = 0
        this.state.inList.map(ele => {

            if (ele.notes != null && ele.notes != '') {
                cnt = cnt + 1
                if (cnt == 1) {
                    y = y + 20
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.inventory.inventory'), doc.internal.pageSize.width / 8, y, {
                        align: 'left'
                    })
                }
                doc.setFontSize(8)
                y = y + 20
                if (y > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    y = 80;

                }
                doc.text(moment(ele.inventoryDate).format('DD-MMM-YY'), doc.internal.pageSize.width / 7, y, {
                    align: 'left'
                })
                doc.text(ele.notes, doc.internal.pageSize.width / 5, y, {
                    align: 'left'
                })
            }
        })

        cnt = 0

        this.state.coList.map(ele => {
            if (ele.notes != null && ele.notes != '') {
                cnt = cnt + 1
                if (cnt == 1) {
                    y = y + 20
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.supplyPlan.consumption'), doc.internal.pageSize.width / 8, y, {
                        align: 'left'
                    })
                }
                doc.setFontSize(8)
                y = y + 20
                if (y > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    y = 80;

                }
                doc.text(moment(ele.consumptionDate).format('DD-MMM-YY'), doc.internal.pageSize.width / 7, y, {
                    align: 'left'
                })
                doc.text(ele.notes, doc.internal.pageSize.width / 5, y, {
                    align: 'left'
                })
            }
        })

        cnt = 0

        this.state.shList.map(ele => {
            if (ele.notes != null && ele.notes != '') {
                cnt = cnt + 1
                if (cnt == 1) {
                    y = y + 20
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.shipment.shipment'), doc.internal.pageSize.width / 8, y, {
                        align: 'left'
                    })
                }
                doc.setFontSize(8)
                y = y + 20
                if (y > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    y = 80;

                }
                doc.text(moment(ele.receivedDate == null || ele.receivedDate == '' ? ele.expectedDeliveryDate : ele.receivedDate).format('DD-MMM-YY'), doc.internal.pageSize.width / 7, y, {
                    align: 'left'
                })
                doc.text(ele.notes, doc.internal.pageSize.width / 5, y, {
                    align: 'left'
                })

            }
        }
        )

        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.whatIf') + ".pdf")

    }

    componentDidMount() {
        var fields = document.getElementsByClassName("totalShipments");
        for (var i = 0; i < fields.length; i++) {
            fields[i].style.display = "none";
        }

        fields = document.getElementsByClassName("manualShipments");
        for (var i = 0; i < fields.length; i++) {
            fields[i].style.display = "none";
        }

        fields = document.getElementsByClassName("erpShipments");
        for (var i = 0; i < fields.length; i++) {
            fields[i].style.display = "none";
        }

        fields = document.getElementsByClassName("scenarioListDiv");
        for (var i = 0; i < fields.length; i++) {
            fields[i].style.display = "none";
        }
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "red",
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
            var program = transaction.objectStore('programQPLDetails');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "red",
                })
                this.hideFirstComponent()
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        // var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        // var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        // var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        // var programJson1 = JSON.parse(programData);
                        var programJson = {
                            label: myResult[i].programCode + "~v" + myResult[i].version,
                            value: myResult[i].id
                        }
                        proList.push(programJson);
                    }
                }
                this.setState({
                    programList: proList.sort(function (a, b) {
                        a = a.label.toLowerCase();
                        b = b.label.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    }),
                    loading: false
                })

                var programIdd = '';
                if (proList.length == 1) {
                    programIdd = proList[0].value;
                } else if (localStorage.getItem("sesProgramId") != '' && localStorage.getItem("sesProgramId") != undefined) {
                    //from session
                    programIdd = localStorage.getItem("sesProgramId");
                }
                if (programIdd != '' && programIdd != undefined) {
                    var programSelect = { value: programIdd, label: proList.filter(c => c.value == programIdd)[0].label };
                    this.setState({
                        programSelect: programSelect,
                        programId: programIdd
                    }, () => {
                        this.getPlanningUnitList(programSelect);
                    })
                }

            }.bind(this);
        }.bind(this);
    };

    getPlanningUnitList(value) {
        document.getElementById("planningUnitId").value = 0;
        document.getElementById("planningUnit").value = "";
        this.setState({
            loading: true,
            display: 'none',
            planningUnitChange: false,
            programSelect: value,
            programId: value != "" && value != undefined ? value.value : 0,
            planningUnit: "",
            rows: []
        })
        var programId = value != "" && value != undefined ? value.value : 0;
        if (programId != 0) {
            localStorage.setItem("sesProgramId", programId);
            var db1;
            var storeOS;
            getDatabase();
            var regionList = [];
            var dataSourceList = [];
            var dataSourceListAll = [];
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "red",
                })
                this.hideFirstComponent()
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                var programDataOs = programDataTransaction.objectStore('programData');
                var programRequest = programDataOs.get(value != "" && value != undefined ? value.value : 0);
                programRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext'),
                        loading: false,
                        color: "red",
                    })
                    this.hideFirstComponent()
                }.bind(this);
                programRequest.onsuccess = function (e) {
                    var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);

                    var whatIfProgramDataTransaction = db1.transaction(['whatIfProgramData'], 'readwrite');
                    var whatIfProgramDataOs = whatIfProgramDataTransaction.objectStore('whatIfProgramData');
                    var item = {
                        id: programRequest.result.id,
                        programId: programRequest.result.programId,
                        version: programRequest.result.version,
                        programName: (CryptoJS.AES.encrypt(JSON.stringify((programRequest.result.label)), SECRET_KEY)).toString(),
                        programData: programRequest.result.programData,
                        userId: programRequest.result.userId
                    }
                    var whatIfRequest = whatIfProgramDataOs.put(item);
                    whatIfRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext'),
                            loading: false,
                            color: "red",
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    whatIfRequest.onsuccess = function (e) {
                        for (var i = 0; i < programJson.regionList.length; i++) {
                            var regionJson = {
                                // name: // programJson.regionList[i].regionId,
                                name: getLabelText(programJson.regionList[i].label, this.state.lang),
                                id: programJson.regionList[i].regionId,
                                label: programJson.regionList[i].label
                            }
                            regionList.push(regionJson)
                        }
                        var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                        var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                        var planningunitRequest = planningunitOs.getAll();
                        var planningList = []
                        planningunitRequest.onerror = function (event) {
                            this.setState({
                                supplyPlanError: i18n.t('static.program.errortext'),
                                loading: false,
                                color: "red",
                            })
                            this.hideFirstComponent()
                        }.bind(this);
                        planningunitRequest.onsuccess = function (e) {
                            var myResult = [];
                            myResult = planningunitRequest.result;
                            var programId = (value != "" && value != undefined ? value.value : 0).split("_")[0];
                            var proList = []
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program.id == programId && myResult[i].active == true) {
                                    var productJson = {
                                        label: getLabelText(myResult[i].planningUnit.label, this.state.lang),
                                        value: myResult[i].planningUnit.id
                                    }
                                    proList.push(productJson);
                                    planningList.push(myResult[i]);
                                }
                            }

                            var puTransaction = db1.transaction(['planningUnit'], 'readwrite');
                            var puOs = puTransaction.objectStore('planningUnit');
                            var puRequest = puOs.getAll();
                            var planningUnitListForConsumption = []
                            puRequest.onerror = function (event) {
                                this.setState({
                                    supplyPlanError: i18n.t('static.program.errortext'),
                                    loading: false,
                                    color: "red",
                                })
                                this.hideFirstComponent()
                            }.bind(this);
                            puRequest.onsuccess = function (e) {
                                var puResult = [];
                                puResult = puRequest.result;
                                planningUnitListForConsumption = puResult;


                                var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                                var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                                var dataSourceRequest = dataSourceOs.getAll();
                                dataSourceRequest.onerror = function (event) {
                                    this.setState({
                                        supplyPlanError: i18n.t('static.program.errortext'),
                                        loading: false,
                                        color: "red",
                                    })
                                    this.hideFirstComponent()
                                }.bind(this);
                                dataSourceRequest.onsuccess = function (event) {
                                    var dataSourceResult = [];
                                    dataSourceResult = dataSourceRequest.result;
                                    for (var k = 0; k < dataSourceResult.length; k++) {
                                        if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0 && dataSourceResult[k].active == true) {
                                            if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                                                dataSourceListAll.push(dataSourceResult[k]);

                                            }
                                        }
                                    }
                                    this.setState({
                                        planningUnitList: proList.sort(function (a, b) {
                                            a = a.label.toLowerCase();
                                            b = b.label.toLowerCase();
                                            return a < b ? -1 : a > b ? 1 : 0;
                                        }),
                                        programPlanningUnitList: myResult,
                                        planningUnitListAll: myResult,
                                        regionList: regionList.sort(function (a, b) {
                                            a = a.name.toLowerCase();
                                            b = b.name.toLowerCase();
                                            return a < b ? -1 : a > b ? 1 : 0;
                                        }),
                                        programJson: programJson,
                                        dataSourceListAll: dataSourceListAll,
                                        planningUnitListForConsumption: planningUnitListForConsumption,
                                        loading: false
                                    })

                                    let planningUnitIdProp = '';

                                    if (localStorage.getItem("sesPlanningUnitId") != '' && localStorage.getItem("sesPlanningUnitId") != undefined) {
                                        planningUnitIdProp = localStorage.getItem("sesPlanningUnitId");
                                    } else if (proList.length == 1) {
                                        planningUnitIdProp = proList[0].value;
                                    }
                                    if (planningUnitIdProp != '' && planningUnitIdProp != undefined) {
                                        var planningUnit = { value: planningUnitIdProp, label: proList.filter(c => c.value == planningUnitIdProp)[0].label };
                                        this.setState({
                                            planningUnit: planningUnit,
                                            planningUnitId: planningUnitIdProp
                                        }, () => {
                                            this.formSubmit(planningUnit, this.state.monthCount);
                                        })

                                    }
                                }.bind(this);
                            }.bind(this);
                        }.bind(this);
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                loading: false,
                planningUnitList: []
            })
        }
    }

    getMonthArray(currentDate) {
        var month = [];
        var curDate = currentDate.subtract(MONTHS_IN_PAST_FOR_SUPPLY_PLAN, 'months');
        this.setState({ startDate: { year: parseInt(moment(curDate).format('YYYY')), month: parseInt(moment(curDate).format('M')) } })
        // Commented the CR
        // localStorage.setItem("sesStartDate", JSON.stringify({ year: parseInt(moment(curDate).format('YYYY')), month: parseInt(moment(curDate).format('M')) }));
        // Commented the CR
        month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')), monthName: i18n.t("static.common." + (curDate.format('MMM')).toLowerCase()), monthYear: curDate.format('YY') })
        for (var i = 1; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
            var curDate = currentDate.add(1, 'months');
            month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')), monthName: i18n.t("static.common." + (curDate.format('MMM')).toLowerCase()), monthYear: curDate.format('YY') })
        }
        this.setState({
            monthsArray: month
        })
        return month;
    }

    formSubmit(value, monthCount) {
        // this.setState({
        //     showTotalShipment: false,
        //     showManualShipment: false,
        //     showErpShipment: false
        // })
        // this.toggleAccordionTotalShipments();
        // this.toggleAccordionManualShipments();
        // this.toggleAccordionErpShipments();

        if (value != "" && value != undefined ? value.value : 0 != 0) {
            this.setState({
                planningUnitChange: true,
                display: 'block',
                loading: true
            })
        } else {
            this.setState({
                planningUnitChange: true,
                display: 'none',
                loading: false
            })
        }
        var m = this.getMonthArray(moment(Date.now()).add(monthCount, 'months').utcOffset('-0500'));
        var planningUnitId = value != "" && value != undefined ? value.value : 0;
        var planningUnitName = "";
        if (planningUnitId != 0) {
            planningUnitName = value.label;
            localStorage.setItem("sesPlanningUnitId", planningUnitId);
        }

        var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.planningUnit.id == planningUnitId))[0];
        var regionListFiltered = this.state.regionList;
        var consumptionTotalData = [];
        var shipmentsTotalData = [];
        var manualShipmentsTotalData = [];
        var deliveredShipmentsTotalData = [];
        var shippedShipmentsTotalData = [];
        var orderedShipmentsTotalData = [];
        var plannedShipmentsTotalData = [];
        var erpShipmentsTotalData = [];
        var deliveredErpShipmentsTotalData = [];
        var shippedErpShipmentsTotalData = [];
        var orderedErpShipmentsTotalData = [];
        var plannedErpShipmentsTotalData = [];
        var totalExpiredStockArr = [];
        var amcTotalData = [];
        var minStockMoS = [];
        var maxStockMoS = [];
        var inventoryTotalData = [];
        var suggestedShipmentsTotalData = [];
        var openingBalanceArray = [];
        var closingBalanceArray = [];
        var jsonArrForGraph = [];
        var monthsOfStockArray = [];
        var unmetDemand = [];
        var consumptionArrayForRegion = [];
        var inventoryArrayForRegion = [];
        var paColors = []
        var lastActualConsumptionDate = [];
        var db1;
        var storeOS;
        getDatabase();
        var regionList = [];
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "red",
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['whatIfProgramData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('whatIfProgramData');
            var programRequest = programDataOs.get(document.getElementById("programId").value);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "red",
                })
                this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var invList = (programJson.inventoryList).filter(c => c.planningUnit.id == planningUnitId && (moment(c.inventoryDate) >= m[0].startDate && moment(c.inventoryDate) <= m[17].endDate) && c.active == 1)
                var conList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && (moment(c.consumptionDate) >= m[0].startDate && moment(c.consumptionDate) <= m[17].endDate) && c.active == 1)
                var shiList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true && (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? (c.receivedDate >= m[0].startDate && c.receivedDate <= m[17].endDate) : (c.expectedDeliveryDate >= m[0].startDate && c.expectedDeliveryDate <= m[17].endDate)))
                var realmTransaction = db1.transaction(['realm'], 'readwrite');
                var realmOs = realmTransaction.objectStore('realm');
                var realmRequest = realmOs.get(programJson.realmCountry.realm.realmId);
                realmRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext'),
                        loading: false,
                        color: "red"
                    })
                    this.hideFirstComponent()
                }.bind(this);
                realmRequest.onsuccess = function (event) {
                    var maxForMonths = 0;
                    var realm = realmRequest.result;
                    var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                    var DEFAULT_MIN_MAX_MONTHS_OF_STOCK = realm.minMosMaxGaurdrail;
                    if (DEFAULT_MIN_MONTHS_OF_STOCK > programPlanningUnit.minMonthsOfStock) {
                        maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                    } else {
                        maxForMonths = programPlanningUnit.minMonthsOfStock
                    }
                    var minStockMoSQty = parseInt(maxForMonths);

                    // Calculations for Max Stock
                    var minForMonths = 0;
                    var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                    if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + programPlanningUnit.reorderFrequencyInMonths)) {
                        minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                    } else {
                        minForMonths = (maxForMonths + programPlanningUnit.reorderFrequencyInMonths);
                    }
                    var maxStockMoSQty = parseInt(minForMonths);
                    if (maxStockMoSQty < DEFAULT_MIN_MAX_MONTHS_OF_STOCK) {
                        maxStockMoSQty = DEFAULT_MIN_MAX_MONTHS_OF_STOCK;
                    }
                    this.setState({
                        shelfLife: programPlanningUnit.shelfLife,
                        versionId: programJson.currentVersion.versionId,
                        monthsInPastForAMC: programPlanningUnit.monthsInPastForAmc,
                        monthsInFutureForAMC: programPlanningUnit.monthsInFutureForAmc,
                        reorderFrequency: programPlanningUnit.reorderFrequencyInMonths,
                        minMonthsOfStock: programPlanningUnit.minMonthsOfStock,
                        minStockMoSQty: minStockMoSQty,
                        maxStockMoSQty: maxStockMoSQty,
                        inList: invList,
                        coList: conList,
                        shList: shiList,
                    })

                    var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                    var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
                    var shipmentStatusRequest = shipmentStatusOs.getAll();
                    shipmentStatusRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext'),
                            loading: false,
                            color: "red",
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    shipmentStatusRequest.onsuccess = function (event) {
                        var shipmentStatusResult = [];
                        shipmentStatusResult = shipmentStatusRequest.result;
                        var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                        var papuOs = papuTransaction.objectStore('procurementAgent');
                        var papuRequest = papuOs.getAll();
                        papuRequest.onerror = function (event) {
                            this.setState({
                                supplyPlanError: i18n.t('static.program.errortext'),
                                loading: false,
                                color: "red",
                            })
                            this.hideFirstComponent()
                        }.bind(this);
                        papuRequest.onsuccess = function (event) {
                            var papuResult = [];
                            papuResult = papuRequest.result;
                            this.setState({
                                procurementAgentListForWhatIf: papuResult
                            })
                            var supplyPlanData = [];
                            if (programJson.supplyPlan != undefined) {
                                supplyPlanData = (programJson.supplyPlan).filter(c => c.planningUnitId == planningUnitId);
                            }
                            // if (supplyPlanData.length > 0) {
                            var lastClosingBalance = 0;
                            for (var n = 0; n < m.length; n++) {
                                var jsonList = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(m[n].startDate).format("YYYY-MM-DD"));
                                if (jsonList.length > 0) {
                                    openingBalanceArray.push(jsonList[0].openingBalance);
                                    consumptionTotalData.push({ consumptionQty: jsonList[0].consumptionQty, consumptionType: jsonList[0].actualFlag, textColor: jsonList[0].actualFlag == 1 ? "#000000" : "rgb(170, 85, 161)" });
                                    shipmentsTotalData.push(jsonList[0].shipmentTotalQty);
                                    manualShipmentsTotalData.push(jsonList[0].manualTotalQty);

                                    // Tomorrow begin from here
                                    var shipmentDetails = programJson.shipmentList.filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true && (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? (c.receivedDate >= m[n].startDate && c.receivedDate <= m[n].endDate) : (c.expectedDeliveryDate >= m[n].startDate && c.expectedDeliveryDate <= m[n].endDate)) && c.erpFlag.toString() == "false");
                                    var sd1 = [];
                                    var sd2 = [];
                                    var sd3 = [];
                                    var sd4 = [];
                                    var paColor1Array = [];
                                    var paColor2Array = [];
                                    var paColor3Array = [];
                                    var paColor4Array = [];
                                    var paColor1 = "";
                                    var paColor2 = "";
                                    var paColor3 = "";
                                    var paColor4 = "";
                                    var isEmergencyOrder1 = 0;
                                    var isEmergencyOrder2 = 0;
                                    var isEmergencyOrder3 = 0;
                                    var isEmergencyOrder4 = 0;
                                    var isLocalProcurementAgent1 = 0;
                                    var isLocalProcurementAgent2 = 0;
                                    var isLocalProcurementAgent3 = 0;
                                    var isLocalProcurementAgent4 = 0;
                                    if (shipmentDetails != "" && shipmentDetails != undefined) {
                                        for (var i = 0; i < shipmentDetails.length; i++) {
                                            if (shipmentDetails[i].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor1 = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == paColor1);
                                                    if (index == -1) {
                                                        paColors.push({ color: paColor1, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor1 = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor1 = "#efefef"
                                                    }
                                                }
                                                if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                    isEmergencyOrder1 = true
                                                }
                                                if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                    isLocalProcurementAgent1 = true;
                                                }
                                                sd1.push(shipmentDetail);
                                                if (paColor1Array.indexOf(paColor1) === -1) {
                                                    paColor1Array.push(paColor1);
                                                }
                                            } else if (shipmentDetails[i].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor2 = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == paColor2);
                                                    if (index == -1) {
                                                        paColors.push({ color: paColor2, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor2 = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor2 = "#efefef"
                                                    }
                                                }
                                                if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                    isEmergencyOrder2 = true
                                                }
                                                if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                    isLocalProcurementAgent2 = true;
                                                }
                                                sd2.push(shipmentDetail);

                                                if (paColor2Array.indexOf(paColor2) === -1) {
                                                    paColor2Array.push(paColor2);
                                                }
                                            } else if (shipmentDetails[i].shipmentStatus.id == APPROVED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {

                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor3 = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == paColor3);
                                                    if (index == -1) {
                                                        paColors.push({ color: paColor3, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor3 = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor3 = "#efefef"
                                                    }
                                                }
                                                if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                    isEmergencyOrder3 = true
                                                }
                                                if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                    isLocalProcurementAgent3 = true;
                                                }
                                                sd3.push(shipmentDetail);

                                                if (paColor3Array.indexOf(paColor3) === -1) {
                                                    paColor3Array.push(paColor3);
                                                }
                                            } else if (shipmentDetails[i].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {

                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor4 = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == paColor4);
                                                    if (index == -1) {
                                                        paColors.push({ color: paColor4, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor4 = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor4 = "#efefef"
                                                    }
                                                }
                                                if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                    isEmergencyOrder4 = true
                                                }
                                                if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                    isLocalProcurementAgent4 = true;
                                                }
                                                sd4.push(shipmentDetail);
                                                if (paColor4Array.indexOf(paColor4) === -1) {
                                                    paColor4Array.push(paColor4);
                                                }
                                            }
                                        }
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor1;
                                        if (paColor1Array.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        deliveredShipmentsTotalData.push({ qty: jsonList[0].receivedShipmentsTotalData, month: m[n], shipmentDetail: sd1, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder1, isLocalProcurementAgent: isLocalProcurementAgent1 });
                                    } else {
                                        deliveredShipmentsTotalData.push("")
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor2;
                                        if (paColor2Array.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        shippedShipmentsTotalData.push({ qty: jsonList[0].shippedShipmentsTotalData, month: m[n], shipmentDetail: sd2, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder2, isLocalProcurementAgent: isLocalProcurementAgent2 });
                                    } else {
                                        shippedShipmentsTotalData.push("")
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor3;
                                        if (paColor3Array.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        orderedShipmentsTotalData.push({ qty: Number(jsonList[0].approvedShipmentsTotalData) + Number(jsonList[0].submittedShipmentsTotalData), month: m[n], shipmentDetail: sd3, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder3, isLocalProcurementAgent: isLocalProcurementAgent3 });
                                    } else {
                                        orderedShipmentsTotalData.push("")
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor4;
                                        if (paColor4Array.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        plannedShipmentsTotalData.push({ qty: Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData), month: m[n], shipmentDetail: sd4, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder4, isLocalProcurementAgent: isLocalProcurementAgent4 });
                                    } else {
                                        plannedShipmentsTotalData.push("")
                                    }

                                    erpShipmentsTotalData.push(jsonList[0].erpTotalQty);


                                    var shipmentDetails = programJson.shipmentList.filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true && (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? (c.receivedDate >= m[n].startDate && c.receivedDate <= m[n].endDate) : (c.expectedDeliveryDate >= m[n].startDate && c.expectedDeliveryDate <= m[n].endDate)) && c.erpFlag.toString() == "true");
                                    var sd1 = [];
                                    var sd2 = [];
                                    var sd3 = [];
                                    var sd4 = [];
                                    var paColor1 = "";
                                    var paColor2 = "";
                                    var paColor3 = "";
                                    var paColor4 = "";
                                    var isEmergencyOrder1 = 0;
                                    var isEmergencyOrder2 = 0;
                                    var isEmergencyOrder3 = 0;
                                    var isEmergencyOrder4 = 0;
                                    var paColor1Array = [];
                                    var paColor2Array = [];
                                    var paColor3Array = [];
                                    var paColor4Array = [];
                                    var isLocalProcurementAgent1 = 0;
                                    var isLocalProcurementAgent2 = 0;
                                    var isLocalProcurementAgent3 = 0;
                                    var isLocalProcurementAgent4 = 0;
                                    if (shipmentDetails != "" && shipmentDetails != undefined) {
                                        for (var i = 0; i < shipmentDetails.length; i++) {
                                            if (shipmentDetails[i].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor1 = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == paColor1);
                                                    if (index == -1) {
                                                        paColors.push({ color: paColor1, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor1 = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor1 = "#efefef"
                                                    }
                                                }
                                                if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                    isEmergencyOrder1 = true
                                                }
                                                if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                    isLocalProcurementAgent1 = true;
                                                }
                                                sd1.push(shipmentDetail);
                                                if (paColor1Array.indexOf(paColor1) === -1) {
                                                    paColor1Array.push(paColor1);
                                                }
                                            } else if (shipmentDetails[i].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor2 = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == paColor2);
                                                    if (index == -1) {
                                                        paColors.push({ color: paColor2, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor2 = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor2 = "#efefef"
                                                    }
                                                }
                                                if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                    isEmergencyOrder2 = true
                                                }
                                                if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                    isLocalProcurementAgent2 = true;
                                                }
                                                sd2.push(shipmentDetail);

                                                if (paColor2Array.indexOf(paColor2) === -1) {
                                                    paColor2Array.push(paColor2);
                                                }
                                            } else if (shipmentDetails[i].shipmentStatus.id == APPROVED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {

                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor3 = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == paColor3);
                                                    if (index == -1) {
                                                        paColors.push({ color: paColor3, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor3 = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor3 = "#efefef"
                                                    }
                                                }
                                                if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                    isEmergencyOrder3 = true
                                                }
                                                if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                    isLocalProcurementAgent3 = true;
                                                }
                                                sd3.push(shipmentDetail);

                                                if (paColor3Array.indexOf(paColor3) === -1) {
                                                    paColor3Array.push(paColor3);
                                                }
                                            } else if (shipmentDetails[i].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {

                                                if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor4 = procurementAgent.colorHtmlCode;
                                                    var index = paColors.findIndex(c => c.color == paColor4);
                                                    if (index == -1) {
                                                        paColors.push({ color: paColor4, text: procurementAgent.procurementAgentCode })
                                                    }
                                                } else {
                                                    if (shipmentDetails[i].procurementAgent.id != "") {
                                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor4 = "#efefef"
                                                    } else {
                                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                        paColor4 = "#efefef"
                                                    }
                                                }
                                                if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                    isEmergencyOrder4 = true
                                                }
                                                if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                    isLocalProcurementAgent4 = true;
                                                }
                                                sd4.push(shipmentDetail);
                                                if (paColor4Array.indexOf(paColor4) === -1) {
                                                    paColor4Array.push(paColor4);
                                                }
                                            }
                                        }
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor1;
                                        if (paColor1Array.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        deliveredErpShipmentsTotalData.push({ qty: jsonList[0].receivedErpShipmentsTotalData, month: m[n], shipmentDetail: sd1, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder1, isLocalProcurementAgent: isLocalProcurementAgent1 });
                                    } else {
                                        deliveredErpShipmentsTotalData.push("")
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor2;
                                        if (paColor2Array.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        shippedErpShipmentsTotalData.push({ qty: jsonList[0].shippedErpShipmentsTotalData, month: m[n], shipmentDetail: sd2, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder2, isLocalProcurementAgent: isLocalProcurementAgent2 });
                                    } else {
                                        shippedErpShipmentsTotalData.push("")
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor3;
                                        if (paColor3Array.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        orderedErpShipmentsTotalData.push({ qty: Number(jsonList[0].approvedErpShipmentsTotalData) + Number(jsonList[0].submittedErpShipmentsTotalData), month: m[n], shipmentDetail: sd3, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder3, isLocalProcurementAgent: isLocalProcurementAgent3 });
                                    } else {
                                        orderedErpShipmentsTotalData.push("")
                                    }

                                    if ((shipmentDetails.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor4;
                                        if (paColor4Array.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        plannedErpShipmentsTotalData.push({ qty: Number(jsonList[0].onholdErpShipmentsTotalData) + Number(jsonList[0].plannedErpShipmentsTotalData), month: m[n], shipmentDetail: sd4, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder4, isLocalProcurementAgent: isLocalProcurementAgent4 });
                                    } else {
                                        plannedErpShipmentsTotalData.push("")
                                    }

                                    inventoryTotalData.push(jsonList[0].adjustmentQty == 0 ? jsonList[0].regionCountForStock > 0 ? jsonList[0].nationalAdjustment : "" : jsonList[0].regionCountForStock > 0 ? jsonList[0].nationalAdjustment : jsonList[0].adjustmentQty);
                                    totalExpiredStockArr.push({ qty: jsonList[0].expiredStock, details: jsonList[0].batchDetails, month: m[n] });
                                    monthsOfStockArray.push(parseFloat(jsonList[0].mos).toFixed(1));
                                    amcTotalData.push(Math.round(Number(jsonList[0].amc)))
                                    minStockMoS.push(jsonList[0].minStockMoS)
                                    maxStockMoS.push(jsonList[0].maxStockMoS)
                                    unmetDemand.push(jsonList[0].unmetDemand == 0 ? "" : jsonList[0].unmetDemand);
                                    closingBalanceArray.push(jsonList[0].closingBalance)


                                    lastClosingBalance = jsonList[0].closingBalance

                                    // suggestedShipmentsTotalData.push(jsonList[0].suggestedShipmentsTotalData);
                                    // consumptionArrayForRegion = consumptionArrayForRegion.concat(jsonList[0].consumptionArrayForRegion);
                                    // inventoryArrayForRegion = inventoryArrayForRegion.concat(jsonList[0].inventoryArrayForRegion);
                                    var sstd = {}
                                    var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                    var compare = (m[n].startDate >= currentMonth);
                                    var stockInHand = jsonList[0].closingBalance;
                                    var amc = Math.round(Number(jsonList[0].amc));
                                    if (compare && Number(stockInHand) <= Number(amc * Number(minStockMoSQty))) {
                                        var suggestedOrd = Number((amc * Number(maxStockMoSQty)) - Number(jsonList[0].closingBalance) + Number(jsonList[0].unmetDemand));
                                        if (suggestedOrd <= 0) {
                                            var addLeadTimes = parseFloat(programJson.plannedToSubmittedLeadTime) + parseFloat(programJson.submittedToApprovedLeadTime) +
                                                parseFloat(programJson.approvedToShippedLeadTime) + parseFloat(programJson.shippedToArrivedBySeaLeadTime) +
                                                parseFloat(programJson.arrivedToDeliveredLeadTime);
                                            var expectedDeliveryDate = moment(m[n].startDate).subtract(Number(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                            var isEmergencyOrder = 0;
                                            if (expectedDeliveryDate >= currentMonth) {
                                                isEmergencyOrder = 0;
                                            } else {
                                                isEmergencyOrder = 1;
                                            }
                                            sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder };
                                        } else {
                                            var addLeadTimes = parseFloat(programJson.plannedToSubmittedLeadTime) + parseFloat(programJson.submittedToApprovedLeadTime) +
                                                parseFloat(programJson.approvedToShippedLeadTime) + parseFloat(programJson.shippedToArrivedBySeaLeadTime) +
                                                parseFloat(programJson.arrivedToDeliveredLeadTime);
                                            var expectedDeliveryDate = moment(m[n].startDate).subtract(Number(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                            var isEmergencyOrder = 0;
                                            if (expectedDeliveryDate >= currentMonth) {
                                                isEmergencyOrder = 0;
                                            } else {
                                                isEmergencyOrder = 1;
                                            }
                                            sstd = { "suggestedOrderQty": suggestedOrd, "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder };
                                        }
                                    } else {
                                        var addLeadTimes = parseFloat(programJson.plannedToSubmittedLeadTime) + parseFloat(programJson.submittedToApprovedLeadTime) +
                                            parseFloat(programJson.approvedToShippedLeadTime) + parseFloat(programJson.shippedToArrivedBySeaLeadTime) +
                                            parseFloat(programJson.arrivedToDeliveredLeadTime);
                                        var expectedDeliveryDate = moment(m[n].startDate).subtract(Number(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                        var isEmergencyOrder = 0;
                                        if (expectedDeliveryDate >= currentMonth) {
                                            isEmergencyOrder = 0;
                                        } else {
                                            isEmergencyOrder = 1;
                                        }
                                        sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder };
                                    }
                                    suggestedShipmentsTotalData.push(sstd);

                                    var consumptionListForRegion = (programJson.consumptionList).filter(c => (c.consumptionDate >= m[n].startDate && c.consumptionDate <= m[n].endDate) && c.planningUnit.id == this.state.planningUnitId && c.active == true);
                                    var inventoryListForRegion = (programJson.inventoryList).filter(c => (c.inventoryDate >= m[n].startDate && c.inventoryDate <= m[n].endDate) && c.planningUnit.id == this.state.planningUnitId && c.active == true);
                                    var consumptionTotalForRegion = 0;
                                    var totalAdjustmentsQtyForRegion = 0;
                                    var totalActualQtyForRegion = 0;
                                    var projectedInventoryForRegion = 0;
                                    var regionsReportingActualInventory = [];
                                    var totalNoOfRegions = (this.state.regionListFiltered).length;
                                    for (var r = 0; r < totalNoOfRegions; r++) {
                                        var consumptionQtyForRegion = 0;
                                        var actualFlagForRegion = "";
                                        var consumptionListForRegionalDetails = consumptionListForRegion.filter(c => c.region.id == regionListFiltered[r].id);
                                        var noOfActualEntries = (consumptionListForRegionalDetails.filter(c => c.actualFlag.toString() == "true")).length;
                                        for (var cr = 0; cr < consumptionListForRegionalDetails.length; cr++) {
                                            if (noOfActualEntries > 0) {
                                                if (consumptionListForRegionalDetails[cr].actualFlag.toString() == "true") {
                                                    consumptionQtyForRegion += Math.round(Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
                                                    consumptionTotalForRegion += Math.round(Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
                                                }
                                                actualFlagForRegion = true;
                                            } else {
                                                consumptionQtyForRegion += Math.round(Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
                                                consumptionTotalForRegion += Math.round(Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
                                                actualFlagForRegion = false;
                                            }
                                        }
                                        if (consumptionListForRegionalDetails.length == 0) {
                                            consumptionQtyForRegion = "";
                                        }
                                        consumptionArrayForRegion.push({ "regionId": regionListFiltered[r].id, "qty": consumptionQtyForRegion, "actualFlag": actualFlagForRegion, "month": m[n] })

                                        var adjustmentsQtyForRegion = 0;
                                        var actualQtyForRegion = 0;
                                        var inventoryListForRegionalDetails = inventoryListForRegion.filter(c => c.region != null && c.region.id != 0 && c.region.id == regionListFiltered[r].id);
                                        var actualCount = 0;
                                        var adjustmentsCount = 0;
                                        for (var cr = 0; cr < inventoryListForRegionalDetails.length; cr++) {
                                            if (inventoryListForRegionalDetails[cr].actualQty != undefined && inventoryListForRegionalDetails[cr].actualQty != null && inventoryListForRegionalDetails[cr].actualQty !== "") {
                                                actualCount += 1;
                                                actualQtyForRegion += Math.round(Math.round(inventoryListForRegionalDetails[cr].actualQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
                                                totalActualQtyForRegion += Math.round(Math.round(inventoryListForRegionalDetails[cr].actualQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
                                                var index = regionsReportingActualInventory.findIndex(c => c == regionListFiltered[r].id);
                                                if (index == -1) {
                                                    regionsReportingActualInventory.push(regionListFiltered[r].id)
                                                }
                                            }
                                            if (inventoryListForRegionalDetails[cr].adjustmentQty != undefined && inventoryListForRegionalDetails[cr].adjustmentQty != null && inventoryListForRegionalDetails[cr].adjustmentQty !== "") {
                                                adjustmentsCount += 1;
                                                adjustmentsQtyForRegion += Math.round(Math.round(inventoryListForRegionalDetails[cr].adjustmentQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
                                                totalAdjustmentsQtyForRegion += Math.round(Math.round(inventoryListForRegionalDetails[cr].adjustmentQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
                                            }
                                        }
                                        if (actualCount == 0) {
                                            actualQtyForRegion = "";
                                        }
                                        if (adjustmentsCount == 0) {
                                            adjustmentsQtyForRegion = "";
                                        }
                                        inventoryArrayForRegion.push({ "regionId": regionListFiltered[r].id, "adjustmentsQty": adjustmentsQtyForRegion, "actualQty": actualQtyForRegion, "month": m[n] })
                                    }
                                    consumptionArrayForRegion.push({ "regionId": -1, "qty": consumptionTotalForRegion, "actualFlag": true, "month": m[n] })
                                    var projectedInventoryForRegion = jsonList[0].closingBalance - (jsonList[0].nationalAdjustment != "" ? jsonList[0].nationalAdjustment : 0);
                                    if (regionsReportingActualInventory.length != totalNoOfRegions) {
                                        totalActualQtyForRegion = i18n.t('static.supplyPlan.notAllRegionsHaveActualStock');
                                    }
                                    inventoryArrayForRegion.push({ "regionId": -1, "adjustmentsQty": totalAdjustmentsQtyForRegion, "actualQty": totalActualQtyForRegion, "finalInventory": jsonList[0].closingBalance, "autoAdjustments": jsonList[0].nationalAdjustment, "projectedInventory": projectedInventoryForRegion, "month": m[n] })
                                    for (var r = 0; r < totalNoOfRegions; r++) {
                                        var consumptionListForRegion = (programJson.consumptionList).filter(c => c.planningUnit.id == this.state.planningUnitId && c.active == true && c.actualFlag.toString() == "true");
                                        let conmax = moment.max(consumptionListForRegion.map(d => moment(d.consumptionDate)))
                                        lastActualConsumptionDate.push({ lastActualConsumptionDate: conmax, region: regionListFiltered[r].id });
                                    }
                                    var json = {
                                        month: m[n].month,
                                        consumption: jsonList[0].consumptionQty,
                                        stock: jsonList[0].closingBalance,
                                        planned: Number(plannedShipmentsTotalData[n] != "" ? plannedShipmentsTotalData[n].qty : 0) + Number(plannedErpShipmentsTotalData[n] != "" ? plannedErpShipmentsTotalData[n].qty : 0),
                                        delivered: Number(deliveredShipmentsTotalData[n] != "" ? deliveredShipmentsTotalData[n].qty : 0) + Number(deliveredErpShipmentsTotalData[n] != "" ? deliveredErpShipmentsTotalData[n].qty : 0),
                                        shipped: Number(shippedShipmentsTotalData[n] != "" ? shippedShipmentsTotalData[n].qty : 0) + Number(shippedErpShipmentsTotalData[n] != "" ? shippedErpShipmentsTotalData[n].qty : 0),
                                        ordered: Number(orderedShipmentsTotalData[n] != "" ? orderedShipmentsTotalData[n].qty : 0) + Number(orderedErpShipmentsTotalData[n] != "" ? orderedErpShipmentsTotalData[n].qty : 0),
                                        mos: parseFloat(jsonList[0].mos).toFixed(1),
                                        minMos: minStockMoSQty,
                                        maxMos: maxStockMoSQty
                                    }
                                    jsonArrForGraph.push(json);
                                } else {
                                    openingBalanceArray.push(lastClosingBalance);
                                    consumptionTotalData.push({ consumptionQty: "", consumptionType: "", textColor: "" });
                                    shipmentsTotalData.push(0);
                                    suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": moment(m[n].startDate).format("YYYY-MM-DD"), "isEmergencyOrder": 0 });
                                    manualShipmentsTotalData.push(0);
                                    deliveredShipmentsTotalData.push("");
                                    shippedShipmentsTotalData.push("");
                                    orderedShipmentsTotalData.push("");
                                    plannedShipmentsTotalData.push("");
                                    erpShipmentsTotalData.push(0);
                                    deliveredErpShipmentsTotalData.push("");
                                    shippedErpShipmentsTotalData.push("");
                                    orderedErpShipmentsTotalData.push("");
                                    plannedErpShipmentsTotalData.push("");
                                    inventoryTotalData.push("");
                                    totalExpiredStockArr.push({ qty: 0, details: [], month: m[n] });
                                    monthsOfStockArray.push("")
                                    amcTotalData.push("");
                                    minStockMoS.push(minStockMoSQty);
                                    maxStockMoS.push(maxStockMoSQty)
                                    unmetDemand.push("");
                                    closingBalanceArray.push(lastClosingBalance);
                                    for (var i = 0; i < this.state.regionListFiltered.length; i++) {
                                        consumptionArrayForRegion.push({ "regionId": regionListFiltered[i].id, "qty": "", "actualFlag": "", "month": m[n] })
                                        inventoryArrayForRegion.push({ "regionId": regionListFiltered[i].id, "adjustmentsQty": "", "actualQty": "", "finalInventory": lastClosingBalance, "autoAdjustments": "", "projectedInventory": lastClosingBalance, "month": m[n] });
                                    }
                                    consumptionArrayForRegion.push({ "regionId": -1, "qty": "", "actualFlag": "", "month": m[n] })
                                    inventoryArrayForRegion.push({ "regionId": -1, "adjustmentsQty": "", "actualQty": i18n.t('static.supplyPlan.notAllRegionsHaveActualStock'), "finalInventory": lastClosingBalance, "autoAdjustments": "", "projectedInventory": lastClosingBalance, "month": m[n] });
                                    lastActualConsumptionDate.push("");

                                    var json = {
                                        month: m[n].month,
                                        consumption: null,
                                        stock: lastClosingBalance,
                                        planned: 0,
                                        delivered: 0,
                                        shipped: 0,
                                        ordered: 0,
                                        mos: "",
                                        minMos: minStockMoSQty,
                                        maxMos: maxStockMoSQty
                                    }
                                    jsonArrForGraph.push(json);
                                }
                            }
                            this.setState({
                                openingBalanceArray: openingBalanceArray,
                                consumptionTotalData: consumptionTotalData,
                                expiredStockArr: totalExpiredStockArr,
                                shipmentsTotalData: shipmentsTotalData,
                                suggestedShipmentsTotalData: suggestedShipmentsTotalData,
                                manualShipmentsTotalData: manualShipmentsTotalData,
                                deliveredShipmentsTotalData: deliveredShipmentsTotalData,
                                shippedShipmentsTotalData: shippedShipmentsTotalData,
                                orderedShipmentsTotalData: orderedShipmentsTotalData,
                                plannedShipmentsTotalData: plannedShipmentsTotalData,
                                erpShipmentsTotalData: erpShipmentsTotalData,
                                deliveredErpShipmentsTotalData: deliveredErpShipmentsTotalData,
                                shippedErpShipmentsTotalData: shippedErpShipmentsTotalData,
                                orderedErpShipmentsTotalData: orderedErpShipmentsTotalData,
                                plannedErpShipmentsTotalData: plannedErpShipmentsTotalData,
                                inventoryTotalData: inventoryTotalData,
                                monthsOfStockArray: monthsOfStockArray,
                                amcTotalData: amcTotalData,
                                minStockMoS: minStockMoS,
                                maxStockMoS: maxStockMoS,
                                unmetDemand: unmetDemand,
                                inventoryFilteredArray: inventoryArrayForRegion,
                                regionListFiltered: regionListFiltered,
                                consumptionFilteredArray: consumptionArrayForRegion,
                                planningUnitName: planningUnitName,
                                lastActualConsumptionDate: moment(Date.now()).format("YYYY-MM-DD"),
                                // lastActualConsumptionDateArr: supplyPlanData[0].lastActualConsumptionDate,
                                lastActualConsumptionDateArr: lastActualConsumptionDate,
                                paColors: paColors,
                                jsonArrForGraph: jsonArrForGraph,
                                closingBalanceArray: closingBalanceArray,
                                loading: false
                            })
                            // } else {
                            //     this.setState({ loading: false })
                            //     // calculateSupplyPlan(document.getElementById("programId").value, document.getElementById("planningUnitId").value, 'programData', 'supplyPlan', this);
                            // }
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    toggleLarge(supplyPlanType, month, quantity, startDate, endDate, isEmergencyOrder, shipmentType, count) {
        var cont = false;
        if (this.state.consumptionChangedFlag == 1 || this.state.inventoryChangedFlag == 1 || this.state.suggestedShipmentChangedFlag == 1 || this.state.shipmentChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            var supplyPlanType = supplyPlanType;
            this.setState({
                consumptionError: '',
                inventoryError: '',
                shipmentError: '',
                shipmentDuplicateError: '',
                shipmentBudgetError: '',
                shipmentBatchError: '',
                suggestedShipmentError: '',
                suggestedShipmentDuplicateError: '',
                budgetError: '',
                consumptionBatchError: '',
                inventoryBatchError: '',
                shipmentValidationBatchError: '',
                consumptionDuplicateError: '',
                inventoryDuplicateError: '',
                consumptionBatchInfoDuplicateError: '',
                consumptionBatchInfoNoStockError: '',
                inventoryBatchInfoDuplicateError: '',
                inventoryBatchInfoNoStockError: '',
                shipmentBatchInfoDuplicateError: '',
                inventoryNoStockError: '',
                consumptionNoStockError: '',
                noFundsBudgetError: '',
                consumptionBatchInfoChangedFlag: 0,
                inventoryBatchInfoChangedFlag: 0,
                consumptionChangedFlag: 0,
                inventoryChangedFlag: 0,
                budgetChangedFlag: 0,
                shipmentBatchInfoChangedFlag: 0,
                shipmentChangedFlag: 0,
                suggestedShipmentChangedFlag: 0,
                shipmentDatesChangedFlag: 0,
                shipmentDatesError: '',
                shipmentQtyChangedFlag: 0,
                qtyCalculatorValidationError: "",
                showShipments: 0,
                showInventory: 0,
                showConsumption: 0

            })
            if (supplyPlanType == 'Consumption') {
                var monthCountConsumption = count - 2;
                this.setState({
                    consumption: !this.state.consumption,
                    monthCountConsumption: monthCountConsumption,
                    consumptionStartDateClicked: count != undefined ? this.state.monthsArray[count].startDate : moment(Date.now()).startOf('month').format("YYYY-MM-DD")
                });
                this.formSubmit(this.state.planningUnit, monthCountConsumption);
            } else if (supplyPlanType == 'SuggestedShipments') {
                var roleList = AuthenticationService.getLoggedInUserRole();
                if (roleList.length == 1 && roleList[0].roleId == 'ROLE_GUEST_USER') {
                } else {
                    this.setState({
                        shipments: !this.state.shipments
                    });
                    this.suggestedShipmentsDetailsClicked(month, quantity, isEmergencyOrder);
                }
            } else if (supplyPlanType == 'shipments') {
                this.setState({
                    shipments: !this.state.shipments
                });
                this.shipmentsDetailsClicked(shipmentType, startDate, endDate);
            } else if (supplyPlanType == 'Adjustments') {
                var monthCountAdjustments = count - 2;
                this.setState({
                    adjustments: !this.state.adjustments,
                    monthCountAdjustments: monthCountAdjustments,
                    inventoryStartDateClicked: count != undefined ? this.state.monthsArray[count].startDate : moment(Date.now()).startOf('month').format("YYYY-MM-DD")
                });
                this.formSubmit(this.state.planningUnit, monthCountAdjustments);
            } else if (supplyPlanType == 'expiredStock') {
                this.setState({ loading: true });
                var details = (this.state.expiredStockArr).filter(c => moment(c.month.startDate).format("YYYY-MM-DD") == moment(startDate).format("YYYY-MM-DD"))
                if (startDate != undefined) {
                    this.setState({
                        expiredStockModal: !this.state.expiredStockModal,
                        expiredStockDetails: details[0].details,
                        expiredStockDetailsTotal: details[0].qty,
                        loading: false
                    })
                } else {
                    this.setState({
                        expiredStockModal: !this.state.expiredStockModal
                    })
                }
            }
        }
    }

    actionCanceledExpiredStock() {
        this.setState({
            expiredStockModal: !this.state.expiredStockModal,
            message: i18n.t('static.actionCancelled'),
            color: 'red',
        })
        this.hideFirstComponent();
    }

    actionCanceled(supplyPlanType) {
        var cont = false;
        if (this.state.consumptionChangedFlag == 1 || this.state.inventoryChangedFlag == 1 || this.state.suggestedShipmentChangedFlag == 1 || this.state.shipmentChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            this.setState({
                message: i18n.t('static.actionCancelled'),
                color: 'red',
                consumptionError: '',
                inventoryError: '',
                shipmentError: '',
                suggestedShipmentError: '',
                shipmentDuplicateError: '',
                shipmentBudgetError: '',
                shipmentBatchError: '',
                suggestedShipmentDuplicateError: '',
                budgetError: '',
                consumptionBatchError: '',
                inventoryBatchError: '',
                shipmentValidationBatchError: '',
                consumptionChangedFlag: 0,
                suggestedShipmentChangedFlag: 0,
                shipmentChangedFlag: 0,
                inventoryChangedFlag: 0,
                consumptionDuplicateError: '',
                inventoryDuplicateError: '',
                inventoryNoStockError: '',
                consumptionNoStockError: '',
                consumptionBatchInfoDuplicateError: '',
                consumptionBatchInfoNoStockError: '',
                inventoryBatchInfoDuplicateError: '',
                inventoryBatchInfoNoStockError: '',
                shipmentBatchInfoDuplicateError: '',
                noFundsBudgetError: '',
                consumptionBatchInfoChangedFlag: 0,
                inventoryBatchInfoChangedFlag: 0,
                consumptionChangedFlag: 0,
                inventoryChangedFlag: 0,
                budgetChangedFlag: 0,
                shipmentBatchInfoChangedFlag: 0,
                shipmentChangedFlag: 0,
                suggestedShipmentChangedFlag: 0,
                shipmentDatesChangedFlag: 0,
                shipmentDatesError: '',
                shipmentQtyChangedFlag: 0,
                qtyCalculatorValidationError: "",
                showShipments: 0,
                showInventory: 0,
                showConsumption: 0,
                loading: false

            },
                () => {
                    this.hideFirstComponent();
                    this.toggleLarge(supplyPlanType);
                })
        }
    }

    leftClicked() {
        var monthCount = (this.state.monthCount) - NO_OF_MONTHS_ON_LEFT_CLICKED;
        this.setState({
            monthCount: monthCount
        })
        this.formSubmit(this.state.planningUnit, monthCount)
    }

    rightClicked() {
        var monthCount = (this.state.monthCount) + NO_OF_MONTHS_ON_RIGHT_CLICKED;
        this.setState({
            monthCount: monthCount
        })
        this.formSubmit(this.state.planningUnit, monthCount)
    }

    leftClickedConsumption() {
        var monthCountConsumption = (this.state.monthCountConsumption) - NO_OF_MONTHS_ON_LEFT_CLICKED_REGION;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(this.state.planningUnit, monthCountConsumption)
    }

    rightClickedConsumption() {
        var monthCountConsumption = (this.state.monthCountConsumption) + NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(this.state.planningUnit, monthCountConsumption);
    }

    leftClickedAdjustments() {
        var monthCountAdjustments = (this.state.monthCountAdjustments) - NO_OF_MONTHS_ON_LEFT_CLICKED_REGION;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(this.state.planningUnit, monthCountAdjustments)
    }

    rightClickedAdjustments() {
        var monthCountAdjustments = (this.state.monthCountAdjustments) + NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(this.state.planningUnit, monthCountAdjustments);
    }

    // Consumption Functionality

    // Show consumption details
    consumptionDetailsClicked(startDate, endDate, region, actualFlag, month) {
        var cont = false;
        if (this.state.consumptionChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.setState({ loading: true, consumptionStartDateClicked: startDate });
            var elInstance = this.state.consumptionBatchInfoTableEl;
            if (elInstance != undefined && elInstance != "") {
                elInstance.destroy();
            }
            var planningUnitId = document.getElementById("planningUnitId").value;
            var programId = document.getElementById("programId").value;
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "red"
                })
                this.hideFirstComponent()
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var programDataTransaction = db1.transaction(['whatIfProgramData'], 'readwrite');
                var programDataOs = programDataTransaction.objectStore('whatIfProgramData');
                var programRequest = programDataOs.get(programId);
                programRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext'),
                        loading: false,
                        color: "red"
                    })
                    this.hideFirstComponent()
                }.bind(this);
                programRequest.onsuccess = function (e) {
                    var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var batchInfoList = programJson.batchInfoList;

                    var batchList = [];
                    var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == planningUnitId && c.active.toString() == "true" && c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS);
                    for (var sl = 0; sl < shipmentList.length; sl++) {
                        var bdl = shipmentList[sl].batchInfoList;
                        for (var bd = 0; bd < bdl.length; bd++) {
                            var index = batchList.findIndex(c => c.batchNo == bdl[bd].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                            if (index == -1) {
                                var batchDetailsToPush = batchInfoList.filter(c => c.batchNo == bdl[bd].batch.batchNo && c.planningUnitId == planningUnitId && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                if (batchDetailsToPush.length > 0) {
                                    batchList.push(batchDetailsToPush[0]);
                                }
                            }
                        }
                    }
                    var consumptionListUnFiltered = (programJson.consumptionList);
                    var consumptionList = consumptionListUnFiltered.filter(con =>
                        con.planningUnit.id == planningUnitId
                        && con.region.id == region
                        && ((con.consumptionDate >= startDate && con.consumptionDate <= endDate)));
                    this.setState({
                        programJsonAfterConsumptionClicked: programJson,
                        consumptionListUnFiltered: consumptionListUnFiltered,
                        batchInfoList: batchList,
                        programJson: programJson,
                        consumptionList: consumptionList,
                        showConsumption: 1,
                        consumptionMonth: month,
                        consumptionStartDate: startDate,
                        consumptionRegion: region
                    })
                    this.refs.consumptionChild.showConsumptionData();
                }.bind(this)
            }.bind(this)
        }
    }
    // Consumption Functionality

    // Adjustments Functionality
    // Show adjustments details
    adjustmentsDetailsClicked(region, month, endDate, inventoryType) {
        var cont = false;
        if (this.state.inventoryChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.setState({ loading: true, inventoryStartDateClicked: moment(endDate).startOf('month').format("YYYY-MM-DD") });
            var elInstance = this.state.inventoryBatchInfoTableEl;
            if (elInstance != undefined && elInstance != "") {
                elInstance.destroy();
            }
            var planningUnitId = document.getElementById("planningUnitId").value;
            var programId = document.getElementById("programId").value;
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "red"
                })
                this.hideFirstComponent()
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['whatIfProgramData'], 'readwrite');
                var programTransaction = transaction.objectStore('whatIfProgramData');
                var programRequest = programTransaction.get(programId);
                programRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext'),
                        loading: false,
                        color: "red"
                    })
                    this.hideFirstComponent()
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var batchInfoList = programJson.batchInfoList;

                    var batchList = [];
                    var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == planningUnitId && c.active.toString() == "true" && c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS);

                    for (var sl = 0; sl < shipmentList.length; sl++) {
                        var bdl = shipmentList[sl].batchInfoList;
                        for (var bd = 0; bd < bdl.length; bd++) {
                            var index = batchList.findIndex(c => c.batchNo == bdl[bd].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                            if (index == -1) {
                                var batchDetailsToPush = batchInfoList.filter(c => c.batchNo == bdl[bd].batch.batchNo && c.planningUnitId == planningUnitId && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                                if (batchDetailsToPush.length > 0) {
                                    batchList.push(batchDetailsToPush[0]);
                                }
                            }
                        }
                    }
                    var inventoryListUnFiltered = (programJson.inventoryList);
                    var inventoryList = (programJson.inventoryList).filter(c =>
                        c.planningUnit.id == planningUnitId &&
                        c.region != null && c.region.id != 0 &&
                        c.region.id == region &&
                        moment(c.inventoryDate).format("MMM YY") == month);
                    if (inventoryType == 1) {
                        inventoryList = inventoryList.filter(c => c.actualQty !== "" && c.actualQty != undefined && c.actualQty != null);
                    } else {
                        inventoryList = inventoryList.filter(c => c.adjustmentQty !== "" && c.adjustmentQty != undefined && c.adjustmentQty != null);
                    }
                    this.setState({
                        batchInfoList: batchList,
                        programJson: programJson,
                        inventoryListUnFiltered: inventoryListUnFiltered,
                        inventoryList: inventoryList,
                        showInventory: 1,
                        inventoryType: inventoryType,
                        inventoryMonth: month,
                        inventoryEndDate: endDate,
                        inventoryRegion: region
                    })
                    this.refs.inventoryChild.showInventoryData();
                }.bind(this)
            }.bind(this)
        }
    }
    // Adjustments Functionality

    // Shipments functionality
    // Suggested shipments

    //Show Suggested shipments details
    suggestedShipmentsDetailsClicked(month, quantity, isEmergencyOrder) {
        this.setState({ loading: true });
        var programId = document.getElementById("programId").value;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "red"
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['whatIfProgramData'], 'readwrite');
            var programTransaction = transaction.objectStore('whatIfProgramData');
            var programRequest = programTransaction.get(programId);
            var consumptionTotalData = [];
            var filteredArray = [];
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "red"
                })
                this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var planningUnitId = document.getElementById("planningUnitId").value;
                var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.planningUnit.id == planningUnitId))[0];
                var shelfLife = programPlanningUnit.shelfLife;
                if (month != "" && quantity != 0) {
                    var suggestedShipmentList = this.state.suggestedShipmentsTotalData.filter(c => c.month == month && c.suggestedOrderQty != "");
                } else {
                    var suggestedShipmentList = [];
                    var json = {
                        suggestedOrderQty: 0
                    }
                    suggestedShipmentList.push(json);
                }
                var shipmentList = [];
                var emergencyOrder = true;
                if (isEmergencyOrder == 0) {
                    emergencyOrder = false;
                }
                var json = {
                    shipmentQty: suggestedShipmentList[0].suggestedOrderQty,
                    index: -1,
                    suggestedQty: suggestedShipmentList[0].suggestedOrderQty,
                    emergencyOrder: emergencyOrder,
                    shipmentId: 0,
                    accountFlag: true,
                    active: true,
                    erpFlag: false,
                    batchInfoList: [],
                    shipmentStatus: {
                        id: ""
                    },
                    procurementAgent: {
                        id: ""
                    },
                    fundingSource: {
                        id: ""
                    },
                    budget: {
                        id: ""
                    },
                    dataSource: {
                        id: NONE_SELECTED_DATA_SOURCE_ID
                    },
                    currency: {
                        currencyId: USD_CURRENCY_ID,
                        conversionRateToUsd: 1
                    },
                    expectedDeliveryDate: moment(month).format("YYYY-MM-DD"),
                    planningUnit: {
                        id: document.getElementById("planningUnitId").value
                    }
                }
                shipmentList.push(json);
                this.setState({
                    shipmentListUnFiltered: programJson.shipmentList,
                    programJson: programJson,
                    shelfLife: shelfLife,
                    shipmentList: shipmentList,
                    showShipments: 1,
                })
                this.refs.shipmentChild.showShipmentData();
            }.bind(this)
        }.bind(this)
    }

    filterBatchInfoForExistingData = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[3];
        if (value != 0) {
            mylist = this.state.batchInfoList.filter(c => c.id != -1);
        } else {
            mylist = this.state.batchInfoList;
        }

        return mylist;
    }.bind(this)

    // Shipments Functionality

    tabPane() {
        const chartOptions = {
            title: {
                display: true,
                text: this.state.planningUnit != "" && this.state.planningUnit != undefined && this.state.planningUnit != null ? entityname + " - " + this.state.planningUnit.label : entityname
            },
            scales: {
                yAxes: [{
                    id: 'A',
                    scaleLabel: {
                        display: true,
                        labelString: i18n.t('static.shipment.qty'),
                        fontColor: 'black'
                    },
                    stacked: false,
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'black',
                        callback: function (value) {
                            return value.toLocaleString();
                        }
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    },
                    position: 'left',
                },
                {
                    id: 'B',
                    scaleLabel: {
                        display: true,
                        labelString: i18n.t('static.supplyPlan.monthsOfStock'),
                        fontColor: 'black'
                    },
                    stacked: false,
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'black'
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    },
                    position: 'right',
                }
                ],
                xAxes: [{
                    ticks: {
                        fontColor: 'black'
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItems, data) {
                        return (tooltipItems.yLabel.toLocaleString());
                    }
                },
                enabled: false,
                custom: CustomTooltips
            },
            maintainAspectRatio: false
            ,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: 'black'
                }
            }
        }
        let bar = {}
        if (this.state.jsonArrForGraph.length > 0)
            bar = {

                labels: [...new Set(this.state.jsonArrForGraph.map(ele => (ele.month)))],
                datasets: [
                    {
                        label: i18n.t('static.supplyPlan.planned'),
                        stack: 1,
                        yAxisID: 'A',
                        backgroundColor: '#a7c6ed',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.planned)),
                    },
                    {
                        label: i18n.t('static.supplyPlan.submitted'),
                        stack: 1,
                        yAxisID: 'A',
                        backgroundColor: '#205493',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.ordered)),
                    },
                    {
                        label: i18n.t('static.supplyPlan.shipped'),
                        stack: 1,
                        yAxisID: 'A',
                        backgroundColor: '#006789',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.shipped)),
                    },
                    {
                        label: i18n.t('static.supplyPlan.delivered'),
                        stack: 1,
                        yAxisID: 'A',
                        backgroundColor: '#002f6c',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.delivered)),
                    }, {
                        label: i18n.t('static.report.stock'),
                        stack: 2,
                        type: 'line',
                        yAxisID: 'A',
                        borderColor: '#cfcdc9',
                        borderStyle: 'dotted',
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0,
                        pointStyle: 'line',
                        showInLegend: true,
                        data: this.state.jsonArrForGraph.map((item, index) => (item.stock))
                    }, {
                        label: i18n.t('static.supplyPlan.consumption'),
                        type: 'line',
                        stack: 3,
                        yAxisID: 'A',
                        backgroundColor: 'transparent',
                        borderColor: '#ba0c2f',
                        borderStyle: 'dotted',
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0,
                        pointStyle: 'line',
                        showInLegend: true,
                        data: this.state.jsonArrForGraph.map((item, index) => (item.consumption))
                    },
                    {
                        label: i18n.t('static.supplyPlan.monthsOfStock'),
                        type: 'line',
                        stack: 4,
                        yAxisID: 'B',
                        backgroundColor: 'transparent',
                        borderColor: '#118b70',
                        borderStyle: 'dotted',
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0,
                        pointStyle: 'line',
                        showInLegend: true,
                        data: this.state.jsonArrForGraph.map((item, index) => (item.mos))
                    },
                    {
                        label: i18n.t('static.supplyPlan.minStockMos'),
                        type: 'line',
                        stack: 5,
                        yAxisID: 'B',
                        backgroundColor: 'transparent',
                        borderColor: '#59cacc',
                        borderStyle: 'dotted',
                        borderDash: [10, 10],
                        fill: '+1',
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        showInLegend: true,
                        pointStyle: 'line',
                        yValueFormatString: "$#,##0",
                        lineTension: 0,
                        data: this.state.jsonArrForGraph.map((item, index) => (item.minMos))
                    },
                    {
                        label: i18n.t('static.supplyPlan.maxStockMos'),
                        type: 'line',
                        stack: 6,
                        yAxisID: 'B',
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderColor: '#59cacc',
                        borderStyle: 'dotted',
                        borderDash: [10, 10],
                        fill: true,
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0,
                        pointStyle: 'line',
                        showInLegend: true,
                        yValueFormatString: "$#,##0",
                        data: this.state.jsonArrForGraph.map((item, index) => (item.maxMos))
                    }
                ]

            };
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        return (
            <>
                {/* <TabPane tabId="1"> */}
                <div id="supplyPlanTableId" style={{ display: this.state.display }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={initialValues}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors, resetForm }) => {
                            this.addRow();
                            resetForm({
                                scenarioId: '',
                                percentage: '',
                                startDate: '',
                                stopDate: ''
                            });
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
                                setTouched
                            }) => (
                                    <Form onSubmit={handleSubmit} noValidate name='whatIfForm'>

                                        <Col md="12 pl-0">
                                            <div className="d-md-flex">
                                                <div className="controls WhatifInputFeild">
                                                    <FormGroup className="">
                                                        <Label htmlFor="select">{i18n.t('static.whatIf.scenario')}</Label>
                                                        <Input
                                                            type="select"
                                                            name="scenarioId"
                                                            id="scenarioId"
                                                            bsSize="sm"
                                                            valid={!errors.scenarioId && this.state.scenarioId != ''}
                                                            invalid={touched.scenarioId && !!errors.scenarioId}
                                                            onBlur={handleBlur}
                                                            value={this.state.scenarioId}
                                                            onChange={event => { handleChange(event); this.setTextAndValue(event) }}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            <option value="1">{i18n.t('static.whatIf.increaseConsumption')}</option>
                                                            <option value="2">{i18n.t('static.whatIf.decreaseConsumption')}</option>
                                                            <option value="3">{i18n.t('static.whatIf.removeUnFundedShipments')}</option>
                                                            <option value="4">{i18n.t('static.whatIf.removePlannedShipmentsNotInLeadTimes')}</option>
                                                            <option value="5">{i18n.t('static.whatIf.removeApprovedShipmentsNotInLeadTimes')}</option>
                                                            <option value="6">{i18n.t('static.whatIf.removeShippedShipmentsNotInLeadTimes')}</option>
                                                        </Input>
                                                        <FormFeedback className="red">{errors.scenarioId}</FormFeedback>
                                                    </FormGroup>
                                                </div>
                                                <Input
                                                    type="hidden"
                                                    name="needPercentageValidation"
                                                    id="needPercentageValidation"
                                                    value={(this.state.scenarioId == 1 || this.state.scenarioId == 2 ? true : false)}
                                                />
                                                <div id="consumptionScenariosFields1" style={{ display: 'none' }}>
                                                    <div className="controls WhatifInputFeild">
                                                        <FormGroup className="tab-ml-1">
                                                            <Label htmlFor="select">{i18n.t('static.whatIf.percentage')}</Label>
                                                            <Input
                                                                type="text"
                                                                name="percentage"
                                                                id="percentage"
                                                                bsSize="sm"
                                                                valid={!errors.percentage && this.state.percentage != ''}
                                                                invalid={touched.percentage && !!errors.percentage}
                                                                onBlur={handleBlur}
                                                                value={this.state.percentage}
                                                                onChange={event => { handleChange(event); this.setTextAndValue(event) }}
                                                            >
                                                            </Input>
                                                            <FormFeedback className="red">{errors.percentage}</FormFeedback>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                                <div id="consumptionScenariosFields2" style={{ display: 'none' }}>
                                                    <div className="controls WhatifInputFeild">
                                                        <FormGroup className="tab-ml-1">
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}</Label>
                                                            <div className="controls edit">
                                                                <Picker
                                                                    years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                                    ref={this.pickRange}
                                                                    value={this.state.rangeValue}
                                                                    lang={pickerLang}
                                                                    //theme="light"
                                                                    onChange={this.handleRangeChange}
                                                                    onDismiss={this.handleRangeDissmis}
                                                                >
                                                                    <MonthBox value={makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                                </Picker>
                                                            </div>
                                                        </FormGroup>
                                                    </div>
                                                    {/* <div className="controls WhatifInputFeild">
                                                        <FormGroup className="tab-ml-1">
                                                            <Label for="stopDate">{i18n.t('static.common.stopdate')}</Label>
                                                            <DatePicker
                                                                id="stopDate"
                                                                name="stopDate"
                                                                bsSize="sm"
                                                                selected={this.state.stopDate}
                                                                onChange={(date) => { this.dataChangeEndDate(date) }}
                                                                minDate={this.state.startDate}
                                                                placeholderText={DATE_PLACEHOLDER_TEXT}
                                                                className="form-control-sm form-control date-color"
                                                                disabledKeyboardNavigation
                                                                autoComplete={"off"}
                                                                dateFormat={DATE_FORMAT_SM}
                                                            />
                                                        </FormGroup>
                                                    </div> */}
                                                </div>
                                                <FormGroup className="tab-ml-1 mt-4">
                                                    <Button type="submit" size="md" color="success" onClick={() => this.touchAll(errors)} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
                                                    &nbsp;
                                                    </FormGroup>
                                            </div>
                                        </Col>

                                    </Form>
                                )} />
                    <span onClick={() => this.toggleAccordionScenarioList()}>{this.state.showScenarioList ? <i className="fa fa-minus-square-o scenarioListIcon" ></i> : <i className="fa fa-plus-square-o scenarioListIcon" ></i>}</span>&nbsp;&nbsp;<span style={{ fontSize: '16px' }}>{i18n.t('static.whatIf.scenarioList')}</span>
                    <Row className="pt-3 pb-3 scenarioListDiv" >
                        <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                            <Col md="12 pl-0" id="realmDiv">
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            {/* // Commented the CR */}
                                            {/* <th></th> */}
                                            {/* // Commented the CR */}
                                            <th className="text-left">{i18n.t('static.whatIf.scenario')}</th>
                                            <th className="text-left">{i18n.t('static.common.startdate')}</th>
                                            <th className="text-left">{i18n.t('static.common.stopdate')}</th>
                                            <th className="text-left">{i18n.t('static.whatIf.percentage')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.rows.map((item, idx) => (
                                                <tr id="addr0" key={idx}>
                                                    {/* // Commented the CR */}
                                                    {/* <td><input type="checkbox" id={"scenarioCheckbox" + idx} checked={this.state.rows[idx].scenarioChecked} onChange={() => this.scenarioCheckedChanged(idx)} /></td> */}
                                                    {/* // Commented the CR */}
                                                    <td>{this.state.rows[idx].scenarioName}</td>
                                                    <td>{moment(this.state.rows[idx].startDate).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</td>
                                                    <td>{moment(this.state.rows[idx].stopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</td>
                                                    <td>{this.state.rows[idx].percentage}</td>

                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </Table>
                                <div id="saveScenarioDiv" style={{ display: "none" }}><Button type="submit" size="md" color="success" onClick={this.saveScenario} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.pipeline.save')}</Button></div>
                            </Col>
                        </Col>
                    </Row>
                    <div className="animated fadeIn">
                        <Row className="float-right">
                            <div className="col-md-12">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        </Row>
                        <Row>
                            <div className="col-md-12">
                                <span className="supplyplan-larrow" onClick={this.leftClicked}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                <span className="supplyplan-rarrow" onClick={this.rightClicked}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                            </div>
                        </Row>

                        <div className="table-scroll">
                            <div className="table-wrap table-responsive">
                                <Table className="table-bordered text-center mt-2 overflowhide" bordered size="sm" options={this.options}>
                                    <thead>
                                        <tr>
                                            <th className="BorderNoneSupplyPlan"></th>
                                            <th className="supplyplanTdWidth sticky-col first-col clone"></th>
                                            {
                                                this.state.monthsArray.map(item => {
                                                    var currentDate = moment(Date.now()).startOf('month').format("YYYY-MM-DD");
                                                    var compare = false;
                                                    if (moment(currentDate).format("YYYY-MM-DD") == moment(item.startDate).format("YYYY-MM-DD")) {
                                                        compare = true;
                                                    }
                                                    return (<th className={compare ? "supplyplan-Thead supplyplanTdWidthForMonths " : "supplyplanTdWidthForMonths "} style={{ padding: '10px 0 !important' }}>{item.monthName.concat(" ").concat(item.monthYear)}</th>)
                                                })
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>

                                        <tr bgcolor='#d9d9d9'>
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone"><b>{i18n.t('static.supplyPlan.openingBalance')}</b></td>
                                            {
                                                this.state.openingBalanceArray.map(item1 => (
                                                    <td align="right"><b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></b></td>
                                                ))
                                            }
                                        </tr>
                                        <tr>
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone"><b>- {i18n.t('static.supplyPlan.consumption')}</b></td>
                                            {
                                                this.state.consumptionTotalData.map((item1, count) => {
                                                    if (item1.consumptionType == 1) {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '', '', '', '', '', count)} style={{ color: item1.textColor }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></td>)
                                                    } else {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '', '', '', '', '', count)} style={{ color: item1.textColor }}><i><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></i></td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr>
                                            <td className="BorderNoneSupplyPlan" onClick={() => this.toggleAccordionTotalShipments()}>
                                                {this.state.showTotalShipment ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                            </td>
                                            <td align="left" className="sticky-col first-col clone"><b>+ {i18n.t('static.dashboard.shipments')}</b></td>
                                            {
                                                this.state.shipmentsTotalData.map(item1 => (
                                                    <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                                ))
                                            }
                                        </tr>

                                        <tr className="totalShipments">
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.suggestedShipments')}</td>
                                            {
                                                this.state.suggestedShipmentsTotalData.map(item1 => {
                                                    if (item1.suggestedOrderQty.toString() != "") {
                                                        if (item1.isEmergencyOrder == 1) {
                                                            return (<td align="right" className="emergencyComment hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, `${item1.suggestedOrderQty}`, '', '', `${item1.isEmergencyOrder}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                        } else {
                                                            return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, `${item1.suggestedOrderQty}`, '', '', `${item1.isEmergencyOrder}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                        }
                                                    } else {
                                                        var compare = item1.month >= moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                                        if (compare) {
                                                            return (<td>{item1.suggestedOrderQty}</td>)
                                                        } else {
                                                            return (<td>{item1.suggestedOrderQty}</td>)
                                                        }
                                                    }
                                                })
                                            }
                                        </tr>

                                        <tr className="totalShipments">
                                            <td className="BorderNoneSupplyPlan" onClick={() => this.toggleAccordionManualShipments()}>
                                                {this.state.showManualShipment ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                            </td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.manualEntryShipments')}</td>
                                            {
                                                this.state.manualShipmentsTotalData.map((item1, count) => {
                                                    // var currentMonthDate = moment(Date.now()).format("YYYY-MM");
                                                    // var manualEntryDate = moment(this.state.monthsArray[count].startDate).format("YYYY-MM");
                                                    // if (manualEntryDate >= currentMonthDate) {
                                                    return (<td align="right" className=" hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', this.state.monthsArray[count].startDate, 0, '', '', "0")}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                    // } else {
                                                    // return (<td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                    // }
                                                })
                                            }
                                        </tr>

                                        <tr className="manualShipments">
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.delivered')}</td>

                                            {
                                                this.state.deliveredShipmentsTotalData.map(item1 => {
                                                    if (item1.toString() != "") {
                                                        if (item1.textColor == "#fff") {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement1EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent1 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement2EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent2 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right" >{item1}</td>)
                                                    }
                                                })
                                            }

                                        </tr>

                                        <tr className="manualShipments">
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.shipped')}</td>
                                            {
                                                this.state.shippedShipmentsTotalData.map(item1 => {
                                                    if (item1.toString() != "") {
                                                        if (item1.textColor == "#fff") {
                                                            return (<td align="right" bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement1EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent1 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td align="right" bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement2EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent2 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right" >{item1}</td>)
                                                    }
                                                })
                                            }
                                        </tr>

                                        <tr className="manualShipments">
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.submitted')}</td>
                                            {
                                                this.state.orderedShipmentsTotalData.map(item1 => {
                                                    if (item1.toString() != "") {
                                                        if (item1.textColor == "#fff") {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement1EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent1 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement2EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent2 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right" >{item1}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr className="manualShipments">
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.planned')}</td>
                                            {
                                                this.state.plannedShipmentsTotalData.map(item1 => {
                                                    if (item1.toString() != "") {
                                                        if (item1.textColor == "#fff") {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement1EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent1 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement2EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent2 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right" >{item1}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr className="totalShipments">
                                            <td className="BorderNoneSupplyPlan" onClick={() => this.toggleAccordionErpShipments()}>
                                                {this.state.showErpShipment ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                            </td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.erpShipments')}</td>
                                            {
                                                this.state.erpShipmentsTotalData.map(item1 => (
                                                    <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                                ))
                                            }
                                        </tr>
                                        <tr className="erpShipments">
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.delivered')}</td>
                                            {
                                                this.state.deliveredErpShipmentsTotalData.map(item1 => {
                                                    if (item1.toString() != "") {
                                                        if (item1.textColor == "#fff") {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement1EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent1 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement2EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent2 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right" >{item1}</td>)
                                                    }
                                                })
                                            }
                                        </tr>

                                        <tr className="erpShipments">
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.shipped')}</td>
                                            {
                                                this.state.shippedErpShipmentsTotalData.map(item1 => {
                                                    if (item1.toString() != "") {
                                                        if (item1.textColor == "#fff") {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement1EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent1 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement2EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent2 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right" >{item1}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr className="erpShipments">
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.submitted')}</td>
                                            {
                                                this.state.orderedErpShipmentsTotalData.map(item1 => {
                                                    if (item1.toString() != "") {
                                                        if (item1.textColor == "#fff") {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement1EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent1 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement2EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent2 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right" >{item1}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr className="erpShipments">
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.planned')}</td>
                                            {
                                                this.state.plannedErpShipmentsTotalData.map(item1 => {
                                                    if (item1.toString() != "") {
                                                        if (item1.textColor == "#fff") {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement1EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent1 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={item1.isEmergencyOrder == true ? item1.isLocalProcurementAgent == true ? "localProcurement2EmergencyComment hoverTd" : "emergencyComment hoverTd" : item1.isLocalProcurementAgent == true ? "localProcurementAgent2 hoverTd" : "hoverTd"} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right" >{item1}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr>
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone"><b>+/- {i18n.t('static.supplyPlan.adjustments')}</b></td>
                                            {
                                                this.state.inventoryTotalData.map((item1, count) => {
                                                    return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '', '', '', '', '', count)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                })
                                            }
                                        </tr>
                                        <tr>
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone"><b>- {i18n.t('static.supplyplan.exipredStock')}</b></td>
                                            {
                                                this.state.expiredStockArr.map(item1 => {
                                                    if (item1.toString() != "") {
                                                        if (item1.qty != 0) {
                                                            return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('expiredStock', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, '')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td align="right"></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right">{item1}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr bgcolor='#d9d9d9'>
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone"><b>{i18n.t('static.supplyPlan.endingBalance')}</b></td>
                                            {
                                                this.state.closingBalanceArray.map((item1, count) => {
                                                    return (<td align="right" bgcolor={item1 == 0 ? 'red' : ''} className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '', '', '', '', '', count)}>{item1 == 0 ? <b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></b> : <NumberFormat displayType={'text'} thousandSeparator={true} value={item1} />}</td>)
                                                })
                                            }
                                        </tr>
                                        <tr>
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone"><b>{i18n.t('static.supplyPlan.monthsOfStock')}</b></td>
                                            {
                                                this.state.monthsOfStockArray.map(item1 => (
                                                    <td align="right" style={{ color: item1 == 0 ? "red" : "" }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                                ))
                                            }
                                        </tr>
                                        <tr>
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone" title={i18n.t('static.supplyplan.amcmessage')}>{i18n.t('static.supplyPlan.amc')}</td>
                                            {
                                                this.state.amcTotalData.map(item1 => (
                                                    <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                                ))
                                            }
                                        </tr>
                                        {/* <tr>
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone">{i18n.t('static.supplyPlan.minStockMos')}</td>
                                            {
                                                this.state.minStockMoS.map(item1 => (
                                                    <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                                ))
                                            }
                                        </tr>
                                        <tr>
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone">{i18n.t('static.supplyPlan.maxStockMos')}</td>
                                            {
                                                this.state.maxStockMoS.map(item1 => (
                                                    <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                                ))
                                            }
                                        </tr> */}
                                        <tr>
                                            <td className="BorderNoneSupplyPlan"></td>
                                            <td align="left" className="sticky-col first-col clone">{i18n.t('static.supplyPlan.unmetDemandStr')}</td>
                                            {
                                                this.state.unmetDemand.map(item1 => (
                                                    <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                                ))
                                            }
                                        </tr>
                                    </tbody>
                                </Table>

                            </div>
                            {/* <div className="row" > */}
                            {
                                this.state.jsonArrForGraph.length > 0
                                &&
                                <div className="row" >

                                    <div className="graphwidth">
                                        <div className="col-md-12">
                                            <div className="chart-wrapper chart-graph-report">
                                                <Bar id="cool-canvas" data={bar} options={chartOptions} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 pt-1 pb-3"> <span>{i18n.t('static.supplyPlan.noteBelowGraph')}</span></div>
                                </div>
                            }

                            {/* </div> */}
                        </div>
                    </div>
                    {/* <div className="row" >
                        {
                            this.state.jsonArrForGraph.length > 0
                            &&
                            <div className="col-md-12" >

                                <div className="col-md-11 float-right">
                                    <div className="chart-wrapper chart-graph-report">
                                        <Bar id="cool-canvas" data={bar} options={chartOptions} />
                                    </div>
                                    <span>{i18n.t('static.supplyPlan.noteBelowGraph')}</span>
                                </div>
                            </div>}

                    </div> */}
                </div>

                {/* Consumption modal */}
                <Modal isOpen={this.state.consumption}
                    className={'modal-lg ' + this.props.className, "modalWidth"} >
                    <ModalHeader toggle={() => this.toggleLarge('Consumption')} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.dashboard.consumptiondetails')}</strong>
                        <ul className="legendcommitversion" style={{ display: 'inline-flex' }}>
                            <li><span className="purplelegend legendcolor"></span> <span className="legendcommitversionText" style={{ color: "rgb(170, 85, 161)" }}><i>{i18n.t('static.supplyPlan.forecastedConsumption')}</i></span></li>
                            <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.actualConsumption')} </span></li>
                        </ul>
                        <div className=" card-header-actions" style={{ marginTop: '-5px' }}>
                            <a className="card-header-action">
                                {/* <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggle() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span> */}
                                <Link to={`/consumptionDetails/` + this.state.programId + `/0/` + this.state.planningUnitId} target="_blank"><small className="dataEntryLink">{i18n.t('static.supplyplan.consumptionDataEntry')}</small></Link>
                            </a>
                        </div>
                    </ModalHeader>
                    <div style={{ display: this.state.loading ? "none" : "block" }}>
                        <ModalBody>
                            <h6 className="red" id="div2">{this.state.consumptionDuplicateError || this.state.consumptionNoStockError || this.state.consumptionError}</h6>
                            <div className="col-md-12">
                                <span className="supplyplan-larrow-dataentry" onClick={this.leftClickedConsumption}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                <span className="supplyplan-rarrow-dataentry" onClick={this.rightClickedConsumption}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                            </div>
                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th className="regionTdWidthConsumption"></th>
                                        {
                                            this.state.monthsArray.map((item, count) => {
                                                if (count < 7) {
                                                    return (<th className={moment(this.state.consumptionStartDateClicked).format("YYYY-MM-DD") == moment(item.startDate).format("YYYY-MM-DD") ? "supplyplan-Thead supplyplanTdWidthForMonths" : "supplyplanTdWidthForMonths"}>{item.monthName.concat(" ").concat(item.monthYear)}</th>)
                                                }
                                            })
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.regionListFiltered.map(item => (
                                            <tr>
                                                <td align="left">{item.name}</td>
                                                {
                                                    this.state.consumptionFilteredArray.filter(c => c.regionId == item.id).map((item1, count) => {
                                                        if (count < 7) {
                                                            if (item1.qty.toString() != '') {
                                                                if (item1.actualFlag.toString() == 'true') {
                                                                    return (<td align="right" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.regionId}`, `${item1.actualFlag}`, `${item1.month.month}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                } else {
                                                                    return (<td align="right" style={{ color: 'rgb(170, 85, 161)' }} className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.regionId}`, `${item1.actualFlag}`, `${item1.month.month}`)}><i><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></i></td>)
                                                                }
                                                            } else {
                                                                return (<td align="right" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.regionId}`, ``, `${item1.month.month}`)}></td>)
                                                            }
                                                        }
                                                    })
                                                }
                                            </tr>
                                        )
                                        )
                                    }
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>{i18n.t('static.supplyPlan.total')}</th>
                                        {
                                            this.state.consumptionFilteredArray.filter(c => c.regionId == -1).map((item, count) => {
                                                if (count < 7) {
                                                    return (<th style={{ textAlign: 'right' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.qty} /></th>)
                                                }
                                            })
                                        }
                                    </tr>
                                </tfoot>
                            </Table>
                            {this.state.showConsumption == 1 && <ConsumptionInSupplyPlanComponent ref="consumptionChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} consumptionPage="whatIf" />}
                            <div className="table-responsive mt-3">
                                <div id="consumptionTable" />
                            </div>
                            <h6 className="red" id="div3">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchInfoNoStockError || this.state.consumptionBatchError}</h6>
                            <div className="table-responsive">
                                <div id="consumptionBatchInfoTable" className="AddListbatchtrHeight"></div>
                            </div>

                            <div id="showConsumptionBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledConsumption()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.consumptionBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.consumptionChild.saveConsumptionBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                                {this.refs.consumptionChild != undefined && <Button color="info" id="consumptionBatchAddRow" size="md" className="float-right mr-1" type="button" onClick={this.refs.consumptionChild.addBatchRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                            </div>
                            <div className="pt-4"></div>
                        </ModalBody>
                        <ModalFooter>
                            {this.refs.consumptionChild != undefined && <Button color="info" id="addConsumptionRowSupplyPlan" size="md" className="float-right mr-1" type="button" onClick={this.refs.consumptionChild.addRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                            {this.state.consumptionChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.refs.consumptionChild.saveConsumption}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
                            <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('Consumption')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </div>
                    <div style={{ display: this.state.loading ? "block" : "none" }} className="modalBackgroundSupplyPlan">
                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                            <div class="align-items-center">
                                <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                <div class="spinner-border blue ml-4" role="status">

                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
                {/* Consumption modal */}
                {/* Adjustments modal */}
                <Modal isOpen={this.state.adjustments}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge('Adjustments')} className="modalHeaderSupplyPlan">{i18n.t('static.supplyPlan.adjustmentsDetails')}
                        <div className="card-header-actions" style={{ marginTop: '-5px' }}>
                            <a className="card-header-action">
                                {/* <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggle() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span> */}
                                <Link to={`/inventory/addInventory/` + this.state.programId + `/0/` + this.state.planningUnitId} target="_blank"><small className="dataEntryLink">{i18n.t('static.supplyplan.adjustmentDataEntry')}</small></Link>
                            </a>
                        </div>
                    </ModalHeader>
                    <div style={{ display: this.state.loading ? "none" : "block" }}>
                        <ModalBody>
                            <h6 className="red" id="div2">{this.state.inventoryDuplicateError || this.state.inventoryNoStockError || this.state.inventoryError}</h6>
                            <div className="col-md-12">
                                <span className="supplyplan-larrow-dataentry-adjustment" onClick={this.leftClickedAdjustments}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                <span className="supplyplan-rarrow-dataentry" onClick={this.rightClickedAdjustments}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                            </div>
                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th className="regionTdWidthAdjustments"></th>
                                        {
                                            this.state.monthsArray.map((item, count) => {
                                                if (count < 7) {
                                                    return (<th colSpan="2" className={moment(this.state.inventoryStartDateClicked).format("YYYY-MM-DD") == moment(item.startDate).format("YYYY-MM-DD") ? "supplyplan-Thead" : ""}>{item.monthName.concat(" ").concat(item.monthYear)}</th>)
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr>
                                        <th></th>
                                        {
                                            this.state.monthsArray.map((item, count) => {
                                                if (count < 7) {
                                                    return (
                                                        <>
                                                            <th>{i18n.t("static.inventoryType.adjustment")}</th>
                                                            <th>{i18n.t("static.inventory.inventory")}</th>
                                                        </>)
                                                }
                                            })
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.regionListFiltered.map(item => (
                                            <tr>
                                                <td style={{ textAlign: 'left' }}>{item.name}</td>
                                                {
                                                    this.state.inventoryFilteredArray.filter(c => c.regionId == item.id).map((item1, count) => {
                                                        var curDate = moment(Date.now()).format("YYYY-MM");
                                                        var inventoryDate = moment(item1.month.endDate).format("YYYY-MM");
                                                        var compare = inventoryDate <= curDate ? true : false;
                                                        if (count < 7) {
                                                            if (item1.adjustmentsQty.toString() != '' && (item1.actualQty.toString() != "" || item1.actualQty.toString() != 0)) {
                                                                return (
                                                                    <>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentsQty} /></td>
                                                                        <td align="right" className={compare ? "hoverTd" : ""} onClick={compare ? () => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1) : ""}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>
                                                                    </>
                                                                )
                                                            } else if (item1.adjustmentsQty.toString() != '' && (item1.actualQty.toString() == "" || item1.actualQty.toString() == 0)) {
                                                                return (
                                                                    <>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentsQty} /></td>
                                                                        <td align="right" className={compare ? "hoverTd" : ""} onClick={compare ? () => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1) : ""}></td>
                                                                    </>
                                                                )
                                                            } else if (item1.adjustmentsQty.toString() == '' && (item1.actualQty.toString() != "" || item1.actualQty.toString() != 0)) {
                                                                return (
                                                                    <>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}></td>
                                                                        <td align="right" className={compare ? "hoverTd" : ""} onClick={compare ? () => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1) : ""}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>
                                                                    </>
                                                                )
                                                            } else {
                                                                return (<><td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}></td>
                                                                    <td align="right" className={compare ? "hoverTd" : ""} onClick={compare ? () => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1) : ""}></td>
                                                                </>)
                                                            }
                                                        }
                                                    })
                                                }
                                            </tr>
                                        )
                                        )

                                    }
                                    <tr bgcolor='#d9d9d9'>
                                        <td style={{ textAlign: 'left' }}>{i18n.t('static.supplyPlan.total')}</td>
                                        {
                                            this.state.inventoryFilteredArray.filter(c => c.regionId == -1).map((item, count) => {
                                                if (count < 7) {
                                                    return (
                                                        <>
                                                            <td style={{ textAlign: 'right' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.adjustmentsQty} />
                                                            </td>
                                                            {(item.actualQty) > 0 ? <td style={{ textAlign: 'right' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.actualQty} /></td> : <td style={{ textAlign: 'left' }}>{item.actualQty}</td>}
                                                        </>
                                                    )
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr>
                                        <td className="BorderNoneSupplyPlan" colSpan="15"></td>
                                    </tr>
                                    <tr bgcolor='#d9d9d9'>
                                        <td align="left">{i18n.t("static.supplyPlan.projectedInventory")}</td>
                                        {
                                            this.state.inventoryFilteredArray.filter(c => c.regionId == -1).map((item, count) => {
                                                if (count < 7) {
                                                    return (
                                                        <td colSpan="2"><NumberFormat displayType={'text'} thousandSeparator={true} value={item.projectedInventory} /></td>
                                                    )

                                                }
                                            })
                                        }
                                    </tr>
                                    <tr bgcolor='#d9d9d9'>
                                        <td align="left">{i18n.t("static.supplyPlan.autoAdjustment")}</td>
                                        {
                                            this.state.inventoryFilteredArray.filter(c => c.regionId == -1).map((item1, count) => {
                                                if (count < 7) {
                                                    if (item1.autoAdjustments.toString() != '') {
                                                        return (<td colSpan="2" ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.autoAdjustments} /></td>)
                                                    } else {
                                                        return (<td colSpan="2"></td>)
                                                    }
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr bgcolor='#d9d9d9'>
                                        <td align="left">{i18n.t("static.supplyPlan.finalInventory")}</td>
                                        {
                                            this.state.closingBalanceArray.map((item, count) => {
                                                if (count < 7) {
                                                    return (
                                                        <td colSpan="2"><NumberFormat displayType={'text'} thousandSeparator={true} value={item} /></td>
                                                    )
                                                }
                                            })
                                        }
                                    </tr>
                                </tbody>
                            </Table>
                            {this.state.showInventory == 1 && <InventoryInSupplyPlanComponent ref="inventoryChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} inventoryPage="whatIf" hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} adjustmentsDetailsClicked={this.adjustmentsDetailsClicked} />}
                            <div className="table-responsive mt-3">
                                <div id="adjustmentsTable" className="table-responsive " />
                            </div>
                            <h6 className="red" id="div3">{this.state.inventoryBatchInfoDuplicateError || this.state.inventoryBatchInfoNoStockError || this.state.inventoryBatchError}</h6>
                            <div className="table-responsive">
                                <div id="inventoryBatchInfoTable" className="AddListbatchtrHeight"></div>
                            </div>

                            <div id="showInventoryBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledInventory()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.inventoryBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.inventoryChild.saveInventoryBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                                {this.refs.inventoryChild != undefined && <Button id="inventoryBatchAddRow" color="info" size="md" className="float-right mr-1" type="button" onClick={this.refs.inventoryChild.addBatchRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                            </div>
                            <div className="pt-4"></div>
                        </ModalBody>
                        <ModalFooter>
                            {this.refs.inventoryChild != undefined && <Button id="addInventoryRowSupplyPlan" color="info" size="md" className="float-right mr-1" type="button" onClick={this.refs.inventoryChild.addRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                            {this.state.inventoryChangedFlag == 1 && <Button size="md" color="success" className="submitBtn float-right mr-1" onClick={this.refs.inventoryChild.saveInventory}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
                            <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('Adjustments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </div>
                    <div style={{ display: this.state.loading ? "block" : "none" }} className="modalBackgroundSupplyPlan">
                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                            <div class="align-items-center">
                                <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                <div class="spinner-border blue ml-4" role="status">

                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
                {/* adjustments modal */}

                {/* Shipments modal */}
                <Modal isOpen={this.state.shipments}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge('shipments')} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.supplyPlan.shipmentsDetails')} -  {i18n.t('static.planningunit.planningunit')} - {this.state.planningUnitName} </strong>
                        <ul className="legendcommitversion list-group" style={{ display: 'inline-flex' }}>
                            <li><span className="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.emergencyOrder')}</span></li>
                            <li><span className=" greylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.doNotIncludeInProjectedShipment')} </span></li>
                        </ul>
                        <div className="card-header-actions" style={{ marginTop: '19px' }}>
                            <a className="card-header-action">
                                {/* <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggle() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span> */}
                                <Link to={`/shipment/shipmentDetails/` + this.state.programId + `/0/` + this.state.planningUnitId} target="_blank"><small className="dataEntryLink">{i18n.t('static.supplyplan.shipmentDataEntry')}</small></Link>
                            </a>
                        </div>
                    </ModalHeader>
                    <div style={{ display: this.state.loading ? "none" : "block" }}>
                        <ModalBody>
                            <ShipmentsInSupplyPlanComponent ref="shipmentChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} hideFourthComponent={this.hideFourthComponent} hideFifthComponent={this.hideFifthComponent} shipmentPage="whatIf" />
                            <h6 className="red" id="div2">{this.state.noFundsBudgetError || this.state.shipmentBatchError || this.state.shipmentError}</h6>
                            <div className="table-responsive">
                                <div id="shipmentsDetailsTable" />
                            </div>

                            <h6 className="red" id="div3">{this.state.qtyCalculatorValidationError}</h6>
                            <div className="table-responsive RemoveStriped">
                                <div id="qtyCalculatorTable"></div>
                            </div>

                            <div className="table-responsive RemoveStriped">
                                <div id="qtyCalculatorTable1"></div>
                            </div>

                            <div id="showSaveQtyButtonDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1 mb-2" onClick={() => this.actionCanceledShipments('qtyCalculator')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.shipmentQtyChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentQty()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentQty')}</Button>}
                            </div>

                            <h6 className="red" id="div4">{this.state.shipmentDatesError}</h6>
                            <div className="table-responsive">
                                <div id="shipmentDatesTable"></div>
                            </div>
                            <div id="showSaveShipmentsDatesButtonsDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1 mb-2" onClick={() => this.actionCanceledShipments('shipmentDates')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.shipmentDatesChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentsDate()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentDates')}</Button>}
                            </div>
                            <h6 className="red" id="div5">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                            <div className="table-responsive">
                                <div id="shipmentBatchInfoTable" className="AddListbatchtrHeight"></div>
                            </div>
                            <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1 " onClick={() => this.actionCanceledShipments('shipmentBatch')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.shipmentBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                                {this.refs.shipmentChild != undefined && <Button color="info" size="md" id="addRowBatchId" className="float-right mr-1" type="button" onClick={this.refs.shipmentChild.addBatchRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                            </div>
                            <div className="pt-4"></div>
                        </ModalBody>
                        <ModalFooter>
                            {this.refs.shipmentChild != undefined && <Button color="info" id="addRowId" size="md" className="float-right mr-1" type="button" onClick={this.refs.shipmentChild.addRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                            {this.state.shipmentChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipments()}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}
                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('shipments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </div>
                    <div style={{ display: this.state.loading ? "block" : "none" }} className="modalBackgroundSupplyPlan">
                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                            <div class="align-items-center">
                                <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                <div class="spinner-border blue ml-4" role="status">

                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
                {/* Shipments modal */}
                {/* Expired Stock modal */}
                <Modal isOpen={this.state.expiredStockModal}
                    className={'modal-md modalWidthExpiredStock'}>
                    <ModalHeader toggle={() => this.toggleLarge('expiredStock')} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.dashboard.expiryDetails')}</strong>
                    </ModalHeader>
                    <div style={{ display: this.state.loading ? "none" : "block" }}>
                        <ModalBody>
                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th>{i18n.t('static.inventory.batchNumber')}</th>
                                        <th>{i18n.t('static.report.createdDate')}</th>
                                        <th>{i18n.t('static.inventory.expireDate')}</th>
                                        <th>{i18n.t('static.supplyPlan.qatGenerated')}</th>
                                        <th>{i18n.t('static.supplyPlan.expiredQty')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.expiredStockDetails.map(item => (
                                            <tr>
                                                <td>{item.batchNo}</td>
                                                <td>{moment(item.createdDate).format(DATE_FORMAT_CAP)}</td>
                                                <td>{moment(item.expiryDate).format(DATE_FORMAT_CAP)}</td>
                                                <td>{(item.autoGenerated) ? i18n.t("static.program.yes") : i18n.t("static.program.no")}</td>
                                                <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.expiredQty} /></td>
                                            </tr>
                                        )
                                        )
                                    }
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th colSpan="4">{i18n.t('static.supplyPlan.total')}</th>
                                        <th><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.expiredStockDetailsTotal} /></th>
                                    </tr>
                                </tfoot>
                            </Table>
                        </ModalBody>
                        <ModalFooter>
                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledExpiredStock()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </div>
                    <div style={{ display: this.state.loading ? "block" : "none" }} className="modalBackgroundSupplyPlan">
                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                            <div class="align-items-center">
                                <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                <div class="spinner-border blue ml-4" role="status">

                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
                {/* Expired stock modal */}
                {/* </TabPane> */}
                {/* <TabPane tabId="2"> */}
                {/* </TabPane> */}
            </>
        );
    }

    render() {
        const { programList } = this.state;
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        return (
            <div className="animated fadeIn">
                <Prompt
                    when={this.state.consumptionChangedFlag == 1 || this.state.consumptionBatchInfoChangedFlag == 1 || this.state.inventoryChangedFlag == 1 || this.state.inventoryBatchInfoChangedFlag == 1 || this.state.shipmentChangedFlag == 1 || this.state.shipmentBatchInfoChangedFlag == 1 || this.state.shipmentQtyChangedFlag == 1 || this.state.shipmentDatesChangedFlag == 1 || this.state.suggestedShipmentChangedFlag == 1}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname }) || this.state.supplyPlanError}</h5>
                <SupplyPlanFormulas ref="formulaeChild" />
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-reporticon">
                        {/* <strong>{i18n.t('static.dashboard.supplyPlan')}</strong> */}
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggle() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                                {/* <Link to='/supplyPlanFormulas' target="_blank"><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></Link> */}
                            </a>
                        </div>
                    </div>
                    <CardBody className="pt-lg-0 pb-lg-0">
                        <div className=" pl-0">
                            <div className="row">
                                {/* Commented the CR */}
                                {/* <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.startMonth')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                    <div className="controls edit">

                                        <Picker
                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                            ref={this.pickRange}
                                            value={this.state.startDate}
                                            lang={pickerLang}
                                            //theme="light"
                                            onChange={this.handleRangeChange}
                                            onDismiss={this.handleRangeDissmis}
                                        >
                                            <MonthBox value={makeText(this.state.startDate)} onClick={this._handleClickRangeBox} />
                                        </Picker>
                                    </div>
                                </FormGroup> */}
                                {/* Commented the CR */}
                                <FormGroup className="col-md-4">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls ">
                                        <Select
                                            name="programSelect"
                                            id="programSelect"
                                            bsSize="sm"
                                            options={this.state.programList}
                                            value={this.state.programSelect}
                                            onChange={(e) => { this.getPlanningUnitList(e); }}
                                        />
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-4 mb-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.qatProduct')}</Label>
                                    <div className="controls ">
                                        <Select
                                            name="planningUnit"
                                            id="planningUnit"
                                            bsSize="sm"
                                            options={this.state.planningUnitList}
                                            value={this.state.planningUnit}
                                            onChange={(e) => { this.updateFieldData(e); this.formSubmit(e, this.state.monthCount) }}
                                        />
                                    </div>
                                </FormGroup>
                                <input type="hidden" id="planningUnitId" name="planningUnitId" value={this.state.planningUnitId} />
                                <input type="hidden" id="programId" name="programId" value={this.state.programId} />
                            </div>
                            <FormGroup className="col-md-12 mt-2 " style={{ display: this.state.display }}>
                                <ul className="legendcommitversion list-group">
                                    {
                                        this.state.paColors.map(item1 => (
                                            <li><span className="legendcolor" style={{ backgroundColor: item1.color }}></span> <span className="legendcommitversionText">{item1.text}</span></li>
                                        ))
                                    }
                                    <li><span className="lightgreylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.tbd')}</span></li>
                                    <li><span className="lightgreenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.multipleShipments')}</span></li>

                                    <li><span className="purplelegend legendcolor"></span> <span className="legendcommitversionText" style={{ color: "rgb(170, 85, 161)" }}><i>{i18n.t('static.supplyPlan.forecastedConsumption')}</i></span></li>
                                    <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.actualConsumption')} </span></li>
                                    <li><span className="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.stockOut')} </span></li>
                                    <li><span className="legend-localprocurment legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.report.localprocurement')}</span></li>
                                    <li><span className="legend-emergencyComment legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.emergencyOrder')}</span></li>
                                </ul>
                            </FormGroup>
                            <FormGroup className="col-md-12 pl-0" style={{ marginLeft: '-8px' }} style={{ display: this.state.display }}>
                                <ul className="legendcommitversion list-group">
                                    <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.supplyPlan.amcPast")} : {this.state.monthsInPastForAMC}</span></li>
                                    <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.supplyPlan.amcFuture")} : {this.state.monthsInFutureForAMC}</span></li>
                                    <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.report.shelfLife")} : {this.state.shelfLife}</span></li>
                                    <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.supplyPlan.minStockMos")} : {this.state.minStockMoSQty}</span></li>
                                    <li><span className="lightgreenlegend "></span> <span className="legendcommitversionText">{i18n.t("static.report.reorderFrequencyInMonths")} : {this.state.reorderFrequency}</span></li>
                                    <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.supplyPlan.maxStockMos")} : {this.state.maxStockMoSQty}</span></li>
                                </ul>
                            </FormGroup>
                        </div>
                        <div className="animated fadeIn" style={{ display: this.state.display }}>
                            {/* <Row>
                                <Col xs="12" md="12" className="mb-4">
                                    <Nav tabs>
                                        <NavItem>
                                            <NavLink
                                                active={this.state.activeTab[0] === '1'}
                                                onClick={() => { this.toggle(0, '1'); }}>
                                                {i18n.t('static.dashboard.supplyPlan')}</NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                active={this.state.activeTab[0] === '2'}
                                                onClick={() => { this.toggle(0, '2'); }}>
                                                {i18n.t('static.whatIf.scenarioList')}
                                            </NavLink>

                                        </NavItem>
                                    </Nav>
                                    <TabContent activeTab={this.state.activeTab[0]}> */}
                            {this.tabPane()}
                            {/* </TabContent>
                                </Col>
                            </Row> */}
                        </div>
                    </CardBody>
                    <CardFooter className="pb-5">
                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        <Button style={{ display: this.state.display }} type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                        <Button style={{ display: this.state.display }} type="submit" size="md" color="success" className="float-right mr-1" onClick={this.saveSupplyPlan}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                    </CardFooter>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div >
        )
    }

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    shipmentsDetailsClicked(supplyPlanType, startDate, endDate) {
        this.setState({ loading: true })
        var programId = document.getElementById("programId").value;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "red"
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['whatIfProgramData'], 'readwrite');
            var programTransaction = transaction.objectStore('whatIfProgramData');
            var programRequest = programTransaction.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "red"
                })
                this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var shipmentListUnFiltered = programJson.shipmentList;
                this.setState({
                    shipmentListUnFiltered: shipmentListUnFiltered
                })
                var shipmentList = programJson.shipmentList.filter(c => c.active.toString() == "true");
                // var tableEditableBasedOnSupplyPlan = true;
                if (supplyPlanType == 'deliveredShipments') {
                    shipmentList = shipmentList.filter(c => (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? c.receivedDate >= startDate && c.receivedDate <= endDate : c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate) && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                    if (document.getElementById("addRowId") != null) {
                        document.getElementById("addRowId").style.display = "block"
                    }
                } else if (supplyPlanType == 'shippedShipments') {
                    shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                    if (document.getElementById("addRowId") != null) {
                        document.getElementById("addRowId").style.display = "block"
                    }
                } else if (supplyPlanType == 'orderedShipments') {
                    shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                    if (document.getElementById("addRowId") != null) {
                        document.getElementById("addRowId").style.display = "block"
                    }
                } else if (supplyPlanType == 'plannedShipments') {
                    shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS));
                    if (document.getElementById("addRowId") != null) {
                        document.getElementById("addRowId").style.display = "block"
                    }
                } else if (supplyPlanType == 'deliveredErpShipments') {
                    shipmentList = shipmentList.filter(c => (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? c.receivedDate >= startDate && c.receivedDate <= endDate : c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate) && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                    if (document.getElementById("addRowId") != null) {
                        document.getElementById("addRowId").style.display = "none"
                    }
                } else if (supplyPlanType == 'shippedErpShipments') {
                    shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                    if (document.getElementById("addRowId") != null) {
                        document.getElementById("addRowId").style.display = "none"
                    }
                } else if (supplyPlanType == 'orderedErpShipments') {
                    shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                    if (document.getElementById("addRowId") != null) {
                        document.getElementById("addRowId").style.display = "none"
                    }
                } else if (supplyPlanType == 'plannedErpShipments') {
                    shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS));
                    if (document.getElementById("addRowId") != null) {
                        document.getElementById("addRowId").style.display = "none"
                    }
                } else {
                    shipmentList = [];
                }

                var roleList = AuthenticationService.getLoggedInUserRole();
                if (roleList.length == 1 && roleList[0].roleId == 'ROLE_GUEST_USER') {
                    if (document.getElementById("addRowId") != null) {
                        document.getElementById("addRowId").style.display = "none"
                    }
                } else {
                }
                this.setState({
                    showShipments: 1,
                    shipmentList: shipmentList,
                    shipmentListUnFiltered: shipmentListUnFiltered
                })
                this.refs.shipmentChild.showShipmentData();
            }.bind(this)
        }.bind(this)
    }

    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        })

    }

    actionCanceledShipments(type) {
        if (type == "qtyCalculator") {
            var cont = false;
            if (this.state.shipmentQtyChangedFlag == 1) {
                var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
                if (cf == true) {
                    cont = true;
                } else {

                }
            } else {
                cont = true;
            }
            if (cont == true) {
                document.getElementById("showSaveQtyButtonDiv").style.display = 'none';
                (this.refs.shipmentChild.state.qtyCalculatorTableEl).destroy();
                (this.refs.shipmentChild.state.qtyCalculatorTableEl1).destroy();
                this.refs.shipmentChild.state.shipmentQtyChangedFlag = 0;
                this.setState({
                    qtyCalculatorValidationError: "",
                    shipmentQtyChangedFlag: 0
                })
            }
        } else if (type == "shipmentDates") {
            var cont = false;
            if (this.state.shipmentDatesChangedFlag == 1) {
                var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
                if (cf == true) {
                    cont = true;
                } else {

                }
            } else {
                cont = true;
            }
            if (cont == true) {
                document.getElementById("showSaveShipmentsDatesButtonsDiv").style.display = 'none';
                (this.refs.shipmentChild.state.shipmentDatesTableEl).destroy();
                this.refs.shipmentChild.state.shipmentDatesChangedFlag = 0;
                this.setState({
                    shipmentDatesChangedFlag: 0,
                    shipmentDatesError: ""
                })
            }
        } else if (type == "shipmentBatch") {
            var cont = false;
            if (this.state.shipmentBatchInfoChangedFlag == 1) {
                var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
                if (cf == true) {
                    cont = true;
                } else {

                }
            } else {
                cont = true;
            }
            if (cont == true) {
                document.getElementById("showShipmentBatchInfoButtonsDiv").style.display = 'none';
                (this.refs.shipmentChild.state.shipmentBatchInfoTableEl).destroy();
                this.refs.shipmentChild.state.shipmentBatchInfoChangedFlag = 0;
                this.setState({
                    shipmentBatchInfoChangedFlag: 0,
                    shipmentValidationBatchError: "",
                    shipmentBatchInfoDuplicateError: ""
                })
            }
        }
    }

    actionCanceledInventory() {
        var cont = false;
        if (this.state.inventoryBatchInfoChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'none';
            (this.refs.inventoryChild.state.inventoryBatchInfoTableEl).destroy();
            this.refs.inventoryChild.state.inventoryBatchInfoChangedFlag = 0;
            this.setState({
                inventoryBatchInfoChangedFlag: 0,
                inventoryBatchInfoDuplicateError: "",
                inventoryBatchInfoNoStockError: "",
                inventoryBatchError: ""
            })
        }
    }

    actionCanceledConsumption() {
        var cont = false;
        if (this.state.consumptionBatchInfoChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {

            }
        } else {
            cont = true;
        }
        if (cont == true) {
            document.getElementById("showConsumptionBatchInfoButtonsDiv").style.display = 'none';
            (this.refs.consumptionChild.state.consumptionBatchInfoTableEl).destroy();
            this.refs.consumptionChild.state.consumptionBatchInfoChangedFlag = 0;
            this.setState({
                consumptionBatchInfoChangedFlag: 0,
                consumptionBatchInfoDuplicateError: "",
                consumptionBatchInfoNoStockError: "",
                consumptionBatchError: ""
            })
        }
    }

}
