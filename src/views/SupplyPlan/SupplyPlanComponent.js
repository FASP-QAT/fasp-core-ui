import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import moment from "moment";
import React from "react";
import { Bar } from 'react-chartjs-2';
import 'react-contexify/dist/ReactContexify.min.css';
import Picker from 'react-month-picker';
import { MultiSelect } from "react-multi-select-component";
import NumberFormat from 'react-number-format';
import { Prompt } from 'react-router';
import { Link } from "react-router-dom";
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import {
    Button,
    Card, CardBody,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input, InputGroup,
    Label,
    Modal, ModalBody, ModalFooter, ModalHeader,
    Nav, NavItem, NavLink,
    Row,
    TabContent,
    TabPane,
    Table
} from 'reactstrap';
import * as Yup from 'yup';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { contrast, roundAMC, roundARU, filterOptions } from "../../CommonComponent/JavascriptCommonFunctions";
import { generateRandomAplhaNumericCode, paddingZero } from "../../CommonComponent/JavascriptCommonFunctions.js";
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { APPROVED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, BATCH_PREFIX, CANCELLED_SHIPMENT_STATUS, DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, DELIVERED_SHIPMENT_STATUS, INDEXED_DB_NAME, INDEXED_DB_VERSION, DECIMAL_NO_REGEX_8_DECIMALS, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, NO_OF_MONTHS_ON_LEFT_CLICKED, NO_OF_MONTHS_ON_LEFT_CLICKED_REGION, NO_OF_MONTHS_ON_RIGHT_CLICKED, NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION, ON_HOLD_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, QAT_SUGGESTED_DATA_SOURCE_ID, SECRET_KEY, SHIPMENT_MODIFIED, SHIPPED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, TBD_FUNDING_SOURCE, TBD_PROCUREMENT_AGENT_ID, TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN, USD_CURRENCY_ID } from '../../Constants.js';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ConsumptionInSupplyPlanComponent from "./ConsumptionInSupplyPlan";
import InventoryInSupplyPlanComponent from "./InventoryInSupplyPlan";
import ShipmentsInSupplyPlanComponent from "./ShipmentsInSupplyPlan";
import { calculateSupplyPlan } from "./SupplyPlanCalculations";
import SupplyPlanComparisionComponent from "./SupplyPlanComparisionComponent";
import SupplyPlanFormulas from "./SupplyPlanFormulas";
import { checkValidtion, inValid, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions';
const entityname = i18n.t('static.dashboard.supplyPlan')
/**
 * This const is used to define the validation schema for replan modal popup
 * @param {*} values 
 * @returns 
 */
const validationSchemaReplan = function (values) {
    return Yup.object().shape({
        procurementAgentId: Yup.string()
            .required(i18n.t('static.procurementAgent.selectProcurementAgent')),
        fundingSourceId: Yup.string()
            .required(i18n.t('static.subfundingsource.errorfundingsource')),
    })
}
/**
 * This component is used to allow user to do the supply planning monthwise and view the supply plans for the version that is modified by the user
 */
export default class SupplyPlanComponent extends React.Component {
    constructor(props) {
        super(props);
        var value = JSON.parse(localStorage.getItem("sesStartDate"));
        var date = moment(value.year + "-" + value.month + "-01").format("YYYY-MM-DD");
        if (value.month <= 9) {
            date = moment(value.year + "-0" + value.month + "-01").format("YYYY-MM-DD");
        }
        var currentDate = moment(Date.now()).startOf('month').format("YYYY-MM-DD");
        const monthDifference = moment(new Date(date)).diff(new Date(currentDate), 'months', true) + MONTHS_IN_PAST_FOR_SUPPLY_PLAN;
        this.state = {
            isDarkMode: false,
            planningUnitData: [],
            loading: true,
            monthsArray: [],
            programList: [],
            planningUnitList: [],
            aruList: [],
            planningUnitName: "",
            regionList: [],
            consumptionTotalData: [],
            shipmentsTotalData: [],
            deliveredShipmentsTotalData: [],
            shippedShipmentsTotalData: [],
            orderedShipmentsTotalData: [],
            plannedShipmentsTotalData: [],
            onholdShipmentsTotalData: [],
            consumptionDataForAllMonths: [],
            amcTotalData: [],
            consumptionFilteredArray: [],
            regionListFiltered: [],
            consumptionTotalMonthWise: [],
            consumptionChangedFlag: 0,
            inventoryTotalData: [],
            adjustmentTotalData: [],
            nationalAdjustmentTotalData: [],
            expectedBalTotalData: [],
            suggestedShipmentsTotalData: [],
            inventoryFilteredArray: [],
            inventoryTotalMonthWise: [],
            projectedTotalMonthWise: [],
            inventoryChangedFlag: 0,
            monthCount: monthDifference,
            monthCountConsumption: 0,
            monthCountAdjustments: 0,
            monthCountShipments: 0,
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
            maxQtyArray: [],
            suggestedShipmentChangedFlag: 0,
            message: '',
            activeTab: new Array(3).fill('1'),
            jsonArrForGraph: [],
            display: 'none',
            lang: localStorage.getItem('lang'),
            theme: localStorage.getItem('theme'),
            unmetDemand: [],
            expiredStock: [],
            versionId: "",
            accordion: [true],
            showTotalShipment: false,
            showManualShipment: false,
            showErpShipment: false,
            expiredStockArr: [],
            expiredStockDetails: [],
            expiredStockDetailsTotal: 0,
            showShipments: 0,
            paColors: [],
            programSelect: "",
            showInventory: 0,
            showConsumption: 0,
            consumptionStartDateClicked: moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
            inventoryStartDateClicked: moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
            shipmentStartDateClicked: moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
            startDate: JSON.parse(localStorage.getItem("sesStartDate")),
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            batchInfoInInventoryPopUp: [],
            actualInventoryEditable: 0,
            ledgerForBatch: [],
            showBatchSaveButton: false,
            programQPLDetails: [],
            replanModal: false,
            exportModal: false,
            singleValue: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
            minDateSingle: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
            maxDateSingle: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            planningUnitIdsPlan: [],
            planningUnitIdsExport: [],
            type: 0,
            procurementAgentListPlan: [],
            procurementAgentId: TBD_PROCUREMENT_AGENT_ID,
            fundingSourceListPlan: [],
            fundingSourceId: TBD_FUNDING_SOURCE,
            budgetListPlan: [],
            budgetId: "",
            budgetListPlanAll: [],
            programResult: "",
            showPlanningUnitAndQty: 0,
            showPlanningUnitAndQtyList: [],
            shipmentQtyTotalForPopup: 0,
            batchQtyTotalForPopup: 0,
            multiplier: 1,
            viewById: 1,
            planningUnitNotes: "",
            actualInventoryChanged: false,
            actualInventoryBatchTotalNotMatching: "",
            planningUnit: "",
        }
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.pickRange = React.createRef();
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
        this.leftClickedShipments = this.leftClickedShipments.bind(this);
        this.rightClickedShipments = this.rightClickedShipments.bind(this);
        this.actionCanceled = this.actionCanceled.bind(this);
        this.suggestedShipmentsDetailsClicked = this.suggestedShipmentsDetailsClicked.bind(this);
        this.shipmentsDetailsClicked = this.shipmentsDetailsClicked.bind(this);
        this.toggleAccordionTotalShipments = this.toggleAccordionTotalShipments.bind(this);
        this.toggleAccordionTotalAdjustments = this.toggleAccordionTotalAdjustments.bind(this);
        this.updateState = this.updateState.bind(this)
        this.updateFieldData = this.updateFieldData.bind(this);
        this.updateFieldDataARU = this.updateFieldDataARU.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.hideThirdComponent = this.hideThirdComponent.bind(this);
        this.hideFourthComponent = this.hideFourthComponent.bind(this);
        this.hideFifthComponent = this.hideFifthComponent.bind(this);
        this.hideSixthCompoenent = this.hideSixthCompoenent.bind(this);
        this.toggleReplan = this.toggleReplan.bind(this);
        this.toggleExport = this.toggleExport.bind(this);
        this.setProcurementAgentId = this.setProcurementAgentId.bind(this);
        this.setFundingSourceId = this.setFundingSourceId.bind(this);
        this.setBudgetId = this.setBudgetId.bind(this);
        this.planShipment = this.planShipment.bind(this)
        this.pickAMonthSingle = React.createRef();
        this.setViewById = this.setViewById.bind(this);
        this.addActualInventory = this.addActualInventory.bind(this);
        this.actionCanceledActualInventory = this.actionCanceledActualInventory.bind(this);
        this.saveActualInventory = this.saveActualInventory.bind(this)
    }
    /**
     * This method is used to add commas to the number
     * @param {*} cell This is value of the number
     * @returns It returns the number separated by commas
     */
    addCommas(cell) {
        cell += '';
        var x = cell.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    /**
     * This function is called when date picker is clicked
     * @param {*} e 
     */
    _handleClickRangeBox(e) {
        this.pickRange.current.show()
    }
    /**
     * This function is used to update the date filter value
     * @param {*} value This is the value that user has selected
     */
    handleRangeDissmis(value) {
        var date = moment(value.year + "-" + value.month + "-01").format("YYYY-MM-DD");
        if (value.month <= 9) {
            date = moment(value.year + "-0" + value.month + "-01").format("YYYY-MM-DD");
        }
        var currentDate = moment(Date.now()).startOf('month').format("YYYY-MM-DD");
        const monthDifference = moment(new Date(date)).diff(new Date(currentDate), 'months', true) + MONTHS_IN_PAST_FOR_SUPPLY_PLAN;
        this.setState({ startDate: value, monthCount: monthDifference })
        localStorage.setItem("sesStartDate", JSON.stringify(value));
        this.formSubmit(this.state.planningUnit, monthDifference, 1);
    }
    /**
     * This function is used to hide the messages that are there in div1 after 30 seconds
     */
    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is used to hide the messages that are there in div3 after 30 seconds
     */
    hideThirdComponent() {
        document.getElementById('div3').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div3').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is used to hide the messages that are there in div4 after 30 seconds
     */
    hideFourthComponent() {
        document.getElementById('div4').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div4').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is used to hide the messages that are there in div5 after 30 seconds
     */
    hideFifthComponent() {
        document.getElementById('div5').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div5').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is used to hide the messages that are there in div6 after 30 seconds
     */
    hideSixthCompoenent() {
        document.getElementById('div6').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div6').style.display = 'none';
        }, 30000);
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
        if (this.state.consumptionChangedFlag == 1 || this.state.consumptionBatchInfoChangedFlag == 1 || this.state.inventoryChangedFlag == 1 || this.state.inventoryBatchInfoChangedFlag == 1 || this.state.shipmentChangedFlag == 1 || this.state.shipmentBatchInfoChangedFlag == 1 || this.state.shipmentQtyChangedFlag == 1 || this.state.shipmentDatesChangedFlag == 1 || this.state.suggestedShipmentChangedFlag == 1) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }
    /**
     * This function is used to round the number
     * @param {*} num This is value of the number that needs to be rounded
     * @returns This function returns the rounded number
     */
    roundN = num => {
        if (num != null && num != '') {
            return Number(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
        } else {
            return ''
        }
    }
    /**
     * This function is used to add commas if the value is not null or blank
     * @param {*} value This is value of the number that needs to formatted
     * @returns This function returns the formatted value
     */
    formatter = value => {
        if (value != null && value !== '' && !isNaN(Number(value))) {
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
    /**
     * This function is used to add commas to a decimal number if the value is not null or blank
     * @param {*} value This is value of the number that needs to formatted
     * @returns This function returns the formatted value
     */
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
    /**
     * This function is called when planning unit is changed and is used to call the comparision component
     * @param {*} value This is the value of the planning unit
     */
    updateFieldData(value) {
        if (value != null && value != "" && value != undefined && value.value != 0) {
            var planningUnitDataList = this.state.planningUnitDataList;
            var planningUnitDataFilter = planningUnitDataList.filter(c => c.planningUnitId == value.value);
            var programJson = {};
            if (planningUnitDataFilter.length > 0) {
                var planningUnitData = planningUnitDataFilter[0]
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
            var actualProgramId = this.state.programList.filter(c => c.value == document.getElementById("programId").value)[0].programId;
            var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.program.id == actualProgramId && p.planningUnit.id == value.value))[0];
            this.setState({ planningUnit: value, planningUnitId: value != "" && value != undefined ? value.value : 0, programJson: programJson, planBasedOn: programPlanningUnit.planBasedOn, minQtyPpu: roundARU(programPlanningUnit.minQty, this.state.multiplier), distributionLeadTime: programPlanningUnit.distributionLeadTime }, () => {
                if (this.state.activeTab[0] === '2') {
                    this.refs.compareChild.formSubmit(this.state.monthCount)
                }
            });
        } else {
            this.setState({
                display: 'none',
                planningUnitChange: false,
                planningUnit: "",
                planningUnitId: 0
            })
        }
    }
    /**
     * This function is called when ARU is changed and is used to call the comparision component
     * @param {*} value This is the value of the planning unit
     */
    updateFieldDataARU(value) {
        if (value != null && value != "" && value != undefined && value.value != 0) {
            var aruList = this.state.aruList;
            var aruData = aruList.filter(c => c.value == value.value)[0];
            var planningUnitDataList = this.state.planningUnitDataList;
            var planningUnitDataFilter = planningUnitDataList.filter(c => c.planningUnitId == aruData.planningUnitId);
            var programJson = {};
            if (planningUnitDataFilter.length > 0) {
                var planningUnitData = planningUnitDataFilter[0]
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
            var actualProgramId = this.state.programList.filter(c => c.value == document.getElementById("programId").value)[0].programId;
            var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.program.id == actualProgramId && p.planningUnit.id == aruData.planningUnitId))[0];
            var planningUnitList = this.state.planningUnitList;
            var planningUnitDataFilter = planningUnitList.filter(c => c.value == aruData.planningUnitId);
            this.setState({ planningUnit: planningUnitDataFilter[0], multiplier: aruData.multiplier, aru: value, planningUnitId: value != "" && value != undefined ? aruData.planningUnitId : 0, programJson: programJson, planBasedOn: programPlanningUnit.planBasedOn, minQtyPpu: roundARU(programPlanningUnit.minQty, aruData.multiplier), distributionLeadTime: programPlanningUnit.distributionLeadTime }, () => {
                this.formSubmit(this.state.planningUnit, this.state.monthCount);
                if (this.state.activeTab[0] === '2') {
                    this.refs.compareChild.formSubmit(this.state.monthCount)
                }
            });
        } else {
            this.setState({
                display: 'none',
                planningUnitChange: false,
                aru: "",
            })
        }
    }
    /**
     * This function is used to toggle the accordian for the total shipments
     */
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
    /**
     * This function is used to toggle the accordian for the total adjustments
     */
    toggleAccordionTotalAdjustments() {
        this.setState({
            showTotalAdjustment: !this.state.showTotalAdjustment
        })
        var fields = document.getElementsByClassName("totalAdjustments");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalAdjustment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
    }
    /**
     * This function is when the tab is changed from supply plan local version to supply plan comparsion version
     * @param {*} tabPane
     * @param {*} tab This is the value of the tab
     */
    toggle = (tabPane, tab) => {
        const newArray = this.state.activeTab.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab: newArray,
        });
        if (tab == 2) {
            this.refs.compareChild.formSubmit(this.state.monthCount)
        } else {
            this.formSubmit(this.state.planningUnit, this.state.monthCount);
        }
    }
    /**
     * This function is used to export the supply planning data in CSV format
     */
    exportCSV = () => {
        var csvRow = [];
        csvRow.push("\"" + i18n.t('static.program.program') + ' : ' + ((this.state.programSelect.label).replaceAll(',', '%20')).replaceAll(' ', '%20') + "\"")
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        const header = [...[""], ... (this.state.monthsArray.map(item => (
            ("\'").concat(item.monthName).concat('%20').concat(item.monthYear)
        ))
        )]
        var A = "";
        var planningUnitData = this.state.planningUnitData;
        var list = planningUnitData;
        list.map((ele, index) => {
            var openningArr = [...["\"" + i18n.t('static.supplyPlan.openingBalance').replaceAll(' ', '%20') + "\""], ...ele.data.openingBalanceArray.map(item => item.balance)]
            var consumptionArr = [...["\'" + ("-" + i18n.t('static.supplyPlan.consumption')).replaceAll(' ', '%20') + "\'"], ...ele.data.consumptionTotalData]
            var shipmentArr = [...["\'" + ("+" + i18n.t('static.dashboard.shipments')).replaceAll(' ', '%20') + "\'"], ...ele.data.shipmentsTotalData]
            var suggestedArr = [...["\"" + ("   " + i18n.t('static.supplyPlan.suggestedShipments')).replaceAll(' ', '%20') + "\""], ...ele.data.suggestedShipmentsTotalData.map(item => item.suggestedOrderQty)]
            var deliveredShipmentArr = [...["\"" + ("   " + i18n.t('static.supplyPlan.delivered')).replaceAll(' ', '%20') + "\""], ...ele.data.deliveredShipmentsTotalData.map(item => item.qty)]
            var shippedShipmentArr = [...["\"" + ("   " + i18n.t('static.supplyPlan.shipped')).replaceAll(' ', '%20') + "\""], ...ele.data.shippedShipmentsTotalData.map(item => item.qty)]
            var orderedShipmentArr = [...["\"" + ("   " + i18n.t('static.supplyPlan.submitted')).replaceAll(' ', '%20') + "\""], ...ele.data.orderedShipmentsTotalData.map(item => item.qty)]
            var onholdShipmentArr = [...["\"" + ("   " + i18n.t('static.report.hold')).replaceAll(' ', '%20') + "\""], ...ele.data.onholdShipmentsTotalData.map(item => item.qty)]
            var plannedShipmentArr = [...["\"" + ("   " + i18n.t('static.report.planned')).replaceAll(' ', '%20') + "\""], ...ele.data.plannedShipmentsTotalData.map(item => item.qty)]
            var inventoryArr = [...["\'" + ("+/-" + i18n.t('static.supplyPlan.totalAdjustment')).replaceAll(' ', '%20') + "\'"], ...ele.data.inventoryTotalData]
            var manualAdjustmentArr = [...["\"" + ("   " + i18n.t('static.supplyPlan.manualAdjustment')).replaceAll(' ', '%20') + "\""], ...ele.data.adjustmentTotalData]
            var nationalAdjustmentArr = [...["\"" + ("   " + i18n.t('static.supplyPlan.nationalAdjustment')).replaceAll(' ', '%20') + "\""], ...ele.data.nationalAdjustmentTotalData]
            var expiredStockArr = [...[(i18n.t('static.supplyplan.exipredStock')).replaceAll(' ', '%20') + "\""], ...ele.data.expiredStockArr.map(item => item.qty)]
            var closingBalanceArr = [...["\"" + (i18n.t('static.supplyPlan.endingBalance')).replaceAll(' ', '%20') + "\""], ...ele.data.closingBalanceArray.map(item => item.balance)]
            var monthsOfStockArr = [...["\"" + (i18n.t('static.supplyPlan.monthsOfStock')).replaceAll(' ', '%20') + "\""], ...ele.data.monthsOfStockArray]
            var maxQtyArr = [...["\"" + (i18n.t('static.supplyPlan.maxQty')).replaceAll(' ', '%20') + "\""], ...ele.data.maxQtyArray]
            var amcgArr = [...["\"" + (i18n.t('static.supplyPlan.amc')).replaceAll(' ', '%20') + "\""], ...ele.data.amcTotalData]
            var unmetDemandArr = [...["\"" + (i18n.t('static.supplyPlan.unmetDemandStr')).replaceAll(' ', '%20') + "\""], ...ele.data.unmetDemand]
            csvRow.push('')
            if (index != 0) {
                csvRow.push('')
                csvRow.push('')
            }
            if (this.state.viewById == 1) {
                csvRow.push("\"" + (i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' : ' + (getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(',', '%20')).replaceAll(' ', '%20') + "\"")
            } else {
                csvRow.push("\"" + (i18n.t('static.planningunit.countrysku')).replaceAll(' ', '%20') + ' : ' + (ele.label.replaceAll(',', '%20')).replaceAll(' ', '%20') + "\"")
            }
            csvRow.push("\"" + i18n.t("static.supplyPlan.amcPast").replaceAll(' ', '%20') + ' : ' + ele.info.monthsInPastForAMC + "\"")
            csvRow.push("\"" + i18n.t("static.supplyPlan.amcFuture").replaceAll(' ', '%20') + ' : ' + ele.info.monthsInFutureForAMC + "\"")
            csvRow.push("\"" + i18n.t("static.report.shelfLife").replaceAll(' ', '%20') + ' : ' + ele.info.shelfLife + "\"")
            if (ele.planBasedOn == 1) {
                csvRow.push("\"" + i18n.t("static.supplyPlan.minStockMos").replaceAll(' ', '%20') + ' : ' + ele.info.minStockMoSQty + "\"")
            } else {
                csvRow.push("\"" + i18n.t("static.product.minQuantity").replaceAll(' ', '%20') + ' : ' + ele.minQtyPpu + "\"")
            }
            csvRow.push("\"" + i18n.t("static.supplyPlan.reorderInterval").replaceAll(' ', '%20').replaceAll('#', '%23') + ' : ' + ele.info.reorderFrequency + "\"")
            if (ele.planBasedOn == 1) {
                csvRow.push("\"" + i18n.t("static.supplyPlan.maxStockMos").replaceAll(' ', '%20') + ' : ' + ele.info.maxStockMoSQty + "\"")
            } else {
                csvRow.push("\"" + i18n.t("static.product.distributionLeadTime").replaceAll(' ', '%20') + ' : ' + ele.distributionLeadTime + "\"")
            }
            if (ele.info.planningUnitNotes != null && ele.info.planningUnitNotes != undefined && ele.info.planningUnitNotes.length > 0) {
                csvRow.push('"' + (i18n.t('static.program.notes').replaceAll(' ', '%20') + ' : ' + ele.info.planningUnitNotes + '"'))
            }
            csvRow.push('')
            A = [header]
            A.push(openningArr)
            A.push(consumptionArr.map((c, item) => item != 0 ? c.consumptionQty : c))
            A.push(shipmentArr)
            A.push(suggestedArr)
            A.push(deliveredShipmentArr)
            A.push(shippedShipmentArr)
            A.push(orderedShipmentArr)
            A.push(onholdShipmentArr)
            A.push(plannedShipmentArr)
            A.push(inventoryArr)
            A.push(manualAdjustmentArr)
            A.push(nationalAdjustmentArr)
            A.push(expiredStockArr)
            A.push(closingBalanceArr)
            A.push(ele.planBasedOn == 1 ? (monthsOfStockArr.map(c => c != null ? roundAMC(c) : i18n.t('static.supplyPlanFormula.na'))) : (maxQtyArr.map(c => c != null ? c : "")))
            A.push(amcgArr)
            A.push(unmetDemandArr)
            for (var i = 0; i < A.length; i++) {
                csvRow.push(A[i].join(","))
            }
        })
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.supplyPlan') + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    /**
     * This function is used to export the supply planning data in PDF format
     */
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
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.supplyPlan'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    var splittext = doc.splitTextToSize(i18n.t('static.common.runDate') + moment(new Date()).format(`${DATE_FORMAT_CAP}`) + ' ' + moment(new Date()).format('hh:mm A'), doc.internal.pageSize.width / 8);
                    doc.text(doc.internal.pageSize.width * 3 / 4, 60, splittext)
                    splittext = doc.splitTextToSize(i18n.t('static.user.user') + ' : ' + AuthenticationService.getLoggedInUsername(), doc.internal.pageSize.width / 8);
                    doc.text(doc.internal.pageSize.width / 8, 60, splittext)
                    doc.text(i18n.t('static.program.program') + ' : ' + (this.state.programSelect).label, doc.internal.pageSize.width / 10, 80, {
                        align: 'left'
                    })
                }
            }
        }
        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(15);
        var height = doc.internal.pageSize.height;
        const header = [...[""], ... (this.state.monthsArray.map(item => (
            item.monthName.concat(" ").concat(item.monthYear)
        ))
        )]
        const headers = [header];
        var planningUnitData = this.state.planningUnitData
        var list = planningUnitData;
        var count = 0;
        list.map((ele, index) => {
            if (index != 0) {
                doc.addPage();
            }
            y = 80
            doc.setFontSize(8)
            doc.setTextColor("#002f6c");
            if (this.state.viewById == 1) {
                doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + getLabelText(ele.planningUnit.label, this.state.lang), doc.internal.pageSize.width / 10, 90, {
                    align: 'left'
                })
            } else {
                doc.text(i18n.t('static.planningunit.countrysku') + ' : ' + (ele.label), doc.internal.pageSize.width / 10, 90, {
                    align: 'left'
                })
            }
            doc.text(i18n.t('static.supplyPlan.amcPast') + ' : ' + ele.info.monthsInPastForAMC, doc.internal.pageSize.width / 10, 100, {
                align: 'left'
            })
            doc.text(i18n.t('static.supplyPlan.amcFuture') + ' : ' + ele.info.monthsInFutureForAMC, doc.internal.pageSize.width / 10, 110, {
                align: 'left'
            })
            doc.text(i18n.t('static.report.shelfLife') + ' : ' + ele.info.shelfLife, doc.internal.pageSize.width / 10, 120, {
                align: 'left'
            })
            if (ele.planBasedOn == 1) {
                doc.text(i18n.t('static.supplyPlan.minStockMos') + ' : ' + ele.info.minStockMoSQty, doc.internal.pageSize.width / 10, 130, {
                    align: 'left'
                })
            } else {
                doc.text(i18n.t('static.product.minQuantity') + ' : ' + this.formatter(ele.minQtyPpu), doc.internal.pageSize.width / 10, 130, {
                    align: 'left'
                })
            }
            doc.text(i18n.t('static.supplyPlan.reorderInterval') + ' : ' + ele.info.reorderFrequency, doc.internal.pageSize.width / 10, 140, {
                align: 'left'
            })
            if (ele.planBasedOn == 1) {
                doc.text(i18n.t('static.supplyPlan.maxStockMos') + ' : ' + ele.info.maxStockMoSQty, doc.internal.pageSize.width / 10, 150, {
                    align: 'left'
                })
            } else {
                doc.text(i18n.t('static.product.distributionLeadTime') + ' : ' + this.formatter(ele.distributionLeadTime), doc.internal.pageSize.width / 10, 150, {
                    align: 'left'
                })
            }
            if (ele.info.planningUnitNotes != null && ele.info.planningUnitNotes != undefined && ele.info.planningUnitNotes.length > 0) {
                doc.text(i18n.t('static.program.notes') + ' : ' + ele.info.planningUnitNotes, doc.internal.pageSize.width / 10, 160, {
                    align: 'left'
                })
            }
            doc.setTextColor("#000");
            var openningArr = [...[i18n.t('static.supplyPlan.openingBalance')], ...ele.data.openingBalanceArray.map(item => item.balance)]
            var consumptionArr = [...[("-" + i18n.t('static.supplyPlan.consumption'))], ...ele.data.consumptionTotalData]
            var shipmentArr = [...[("+" + i18n.t('static.dashboard.shipments'))], ...ele.data.shipmentsTotalData]
            var suggestedArr = [...[("   " + i18n.t('static.supplyPlan.suggestedShipments'))], ...ele.data.suggestedShipmentsTotalData.map(item => item.suggestedOrderQty)]
            var deliveredShipmentArr = [...[("   " + i18n.t('static.supplyPlan.delivered'))], ...ele.data.deliveredShipmentsTotalData.map(item => item.qty)]
            var shippedShipmentArr = [...[("   " + i18n.t('static.supplyPlan.shipped'))], ...ele.data.shippedShipmentsTotalData.map(item => item.qty)]
            var orderedShipmentArr = [...[("   " + i18n.t('static.supplyPlan.submitted'))], ...ele.data.orderedShipmentsTotalData.map(item => item.qty)]
            var onholdShipmentArr = [...[("   " + i18n.t('static.report.hold'))], ...ele.data.onholdShipmentsTotalData.map(item => item.qty)]
            var plannedShipmentArr = [...[("   " + i18n.t('static.report.planned'))], ...ele.data.plannedShipmentsTotalData.map(item => item.qty)]
            var inventoryArr = [...[("+/-" + i18n.t('static.supplyPlan.totalAdjustment'))], ...ele.data.inventoryTotalData]
            var manualAdjustmentArr = [...[("   " + i18n.t('static.supplyPlan.manualAdjustment'))], ...ele.data.adjustmentTotalData]
            var nationalAdjustmentArr = [...[("   " + i18n.t('static.supplyPlan.nationalAdjustment'))], ...ele.data.nationalAdjustmentTotalData]
            var expiredStockArr = [...[(i18n.t('static.supplyplan.exipredStock'))], ...ele.data.expiredStockArr.map(item => item.qty)]
            var closingBalanceArr = [...[(i18n.t('static.supplyPlan.endingBalance'))], ...ele.data.closingBalanceArray.map(item => item.balance)]
            var monthsOfStockArr = [...[(i18n.t('static.supplyPlan.monthsOfStock'))], ...ele.data.monthsOfStockArray]
            var maxQtyArr = [...[(i18n.t('static.supplyPlan.maxQty'))], ...ele.data.maxQtyArray]
            var amcgArr = [...[(i18n.t('static.supplyPlan.amc'))], ...ele.data.amcTotalData]
            var unmetDemandArr = [...[(i18n.t('static.supplyPlan.unmetDemandStr'))], ...ele.data.unmetDemand]
            let data1 = [openningArr.map(c => this.formatter(c)), consumptionArr.map((c, item) => item != 0 ? this.formatter(c.consumptionQty) : c), shipmentArr.map(c => this.formatter(c)), suggestedArr.map(c => this.formatter(c)),
            deliveredShipmentArr.map(c => this.formatter(c)), shippedShipmentArr.map(c => this.formatter(c)), orderedShipmentArr.map(c => this.formatter(c)), onholdShipmentArr.map(c => this.formatter(c)), plannedShipmentArr.map(c => this.formatter(c)),
            inventoryArr.map(c => this.formatter(c)), manualAdjustmentArr.map(c => this.formatter(c)), nationalAdjustmentArr.map(c => this.formatter(c)), expiredStockArr.map(c => this.formatter(c)), closingBalanceArr.map(c => this.formatter(c)), ele.planBasedOn == 1 ? (monthsOfStockArr.map(c => c != null ? this.formatterDouble(roundAMC(c)) : i18n.t("static.supplyPlanFormula.na"))) : (maxQtyArr.map(c => c != null ? this.formatter(c) : "")), amcgArr.map(c => this.formatter(c)), unmetDemandArr.map(c => this.formatter(c))];
            var canv = document.getElementById("cool-canvas" + count)
            var canvasImg1 = canv.toDataURL("image/png", 1.0);
            doc.addImage(canvasImg1, 'png', 50, 160, 750, 290, "a" + count, 'CANVAS');
            count++
            let content = {
                margin: { top: 80, bottom: 70 },
                startY: height,
                head: headers,
                body: data1,
                styles: { lineWidth: 1, fontSize: 8, cellWidth: 39, halign: 'center' },
                columnStyles: {
                    0: { cellWidth: 59.89 }
                }
            };
            doc.autoTable(content);
            doc.setFontSize(8)
            doc.setFont('helvetica', 'bold')
            var y = doc.lastAutoTable.finalY + 20
            if (y + 100 > height) {
                doc.addPage();
                y = 80
            }
            doc.text(i18n.t('static.program.notes'), doc.internal.pageSize.width / 9, y, {
                align: 'left'
            })
            doc.setFont('helvetica', 'normal')
            var cnt = 0
            ele.info.inList.map(ele => {
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
                    doc.text(moment(ele.inventoryDate).format('DD-MMM-YY'), doc.internal.pageSize.width / 8, y, {
                        align: 'left'
                    })
                    var splitTitle = doc.splitTextToSize(ele.notes.replace(/[\r\n]+/gm, " "), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 5.7, y, splitTitle);
                    for (var i = 0; i < splitTitle.length; i++) {
                        if (y > doc.internal.pageSize.height - 100) {
                            doc.addPage();
                            y = 80;
                        } else {
                            y = y + 3
                        }
                    }
                    if (splitTitle.length > 1) {
                        y = y + (5 * (splitTitle.length - 1));
                    }
                }
            })
            cnt = 0
            ele.info.coList.map(ele => {
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
                    doc.text(moment(ele.consumptionDate).format('DD-MMM-YY'), doc.internal.pageSize.width / 8, y, {
                        align: 'left'
                    })
                    var splitTitle = doc.splitTextToSize(ele.notes.replace(/[\r\n]+/gm, " "), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 5.7, y, splitTitle);
                    for (var i = 0; i < splitTitle.length; i++) {
                        if (y > doc.internal.pageSize.height - 100) {
                            doc.addPage();
                            y = 80;
                        } else {
                            y = y + 3
                        }
                    }
                    if (splitTitle.length > 1) {
                        y = y + (5 * (splitTitle.length - 1));
                    }
                }
            })
            cnt = 0
            ele.info.shList.map(ele => {
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
                    doc.text(moment(ele.receivedDate == null || ele.receivedDate == '' ? ele.expectedDeliveryDate : ele.receivedDate).format('DD-MMM-YY'), doc.internal.pageSize.width / 8, y, {
                        align: 'left'
                    })
                    var splitTitle = doc.splitTextToSize(ele.notes.replace(/[\r\n]+/gm, " "), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 5.7, y, splitTitle);
                    for (var i = 0; i < splitTitle.length; i++) {
                        if (y > doc.internal.pageSize.height - 100) {
                            doc.addPage();
                            y = 80;
                        } else {
                            y = y + 3
                        }
                    }
                    if (splitTitle.length > 1) {
                        y = y + (5 * (splitTitle.length - 1));
                    }
                }
            }
            )
        })
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.supplyPlan') + ".pdf")
    }
    toggleInventoryActualBatchInfo(batchInfoList, isActual, count, comingFromInventoryData) {
        var cont = false;
        if (this.state.actualInventoryChanged) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.setState({
                batchInfoInInventoryPopUp: batchInfoList,
                actualInventoryChanged: false,
                actualInventoryEditable: isActual,
                actualInventoryBatchTotalNotMatching: "",
                ledgerForBatch: []
            }, () => {
                var batchListForJexcel = [];
                var editable = isActual;
                var programJson = this.state.programJson;
                var planningUnitId = document.getElementById("planningUnitId").value;
                var batchInfoListForProgram = programJson.supplyPlan.filter(c => moment(c.transDate).format("YYYY-MM") <= moment(this.state.monthsArray[count].startDate).format("YYYY-MM")).flatMap(b => b.batchDetails);
                var fullBatchInfoList = programJson.batchInfoList;
                var batchList = [];
                var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == planningUnitId && c.active.toString() == "true" && c.accountFlag.toString() == "true");
                var consumptionBatchList = programJson.consumptionList.filter(c => c.planningUnit.id == planningUnitId).flatMap(consumption => consumption.batchInfoList);
                var inventoryBatchList = programJson.inventoryList.filter(c => c.planningUnit.id == planningUnitId).flatMap(inventory => inventory.batchInfoList);
                var shipmentBatchList = shipmentList.flatMap(shipment => shipment.batchInfoList);
                batchListForJexcel.push({
                    name: i18n.t("static.supplyPlan.qatAutocalculations"),
                    id: -1,
                    createdDate: "",
                    expiryDate: "",
                    autoGenerated: ''
                })
                batchList.push({
                    name: i18n.t("static.supplyPlan.qatAutocalculations"),
                    id: -1,
                    checkQtyValidation: false,
                    createdDate: "",
                    expiryDate: "",
                    autoGenerated: ''
                })
                for (var bd = 0; bd < batchInfoListForProgram.length; bd++) {
                    var index = batchList.findIndex(c => c.batchNo == batchInfoListForProgram[bd].batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(batchInfoListForProgram[bd].expiryDate).format("YYYY-MM"));
                    if (index == -1) {
                        var shipmentBatchListFiltered = shipmentBatchList.filter(c => c.batch.batchNo == batchInfoListForProgram[bd].batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(batchInfoListForProgram[bd].expiryDate).format("YYYY-MM"));
                        var consumptionBatchListFiltered = consumptionBatchList.filter(c => c.batch.batchNo == batchInfoListForProgram[bd].batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(batchInfoListForProgram[bd].expiryDate).format("YYYY-MM"));
                        var inventoryBatchListFiltered = inventoryBatchList.filter(c => c.batch.batchNo == batchInfoListForProgram[bd].batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(batchInfoListForProgram[bd].expiryDate).format("YYYY-MM"));
                        var shipmentTotal = 0;
                        var consumptionTotal = 0;
                        var inventoryTotal = 0;
                        shipmentBatchListFiltered.map(item => {
                            shipmentTotal += Number(item.shipmentQty);
                        })
                        consumptionBatchListFiltered.map(item => {
                            consumptionTotal += Number(item.consumptionQty);
                        })
                        inventoryBatchListFiltered.map(item => {
                            inventoryTotal += Number(item.adjustmentQty)
                        })
                        var batchDetailsToPush = batchInfoListForProgram.filter(c => c.batchNo == batchInfoListForProgram[bd].batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(batchInfoListForProgram[bd].expiryDate).format("YYYY-MM"));
                        if (batchDetailsToPush.length > 0) {
                            batchDetailsToPush[0].qtyAvailable = Number(shipmentTotal) + Number(inventoryTotal) - Number(consumptionTotal);
                            if (shipmentBatchListFiltered.length > 0 || consumptionBatchListFiltered.length > 0 || inventoryBatchListFiltered.length > 0) {
                                batchDetailsToPush[0].checkQtyValidation = false;
                            } else {
                                batchDetailsToPush[0].checkQtyValidation = false;
                            }
                            batchList.push(batchDetailsToPush[0]);
                            if (moment(batchDetailsToPush[0].expiryDate).format("YYYY-MM") > moment(this.state.monthsArray[count].startDate).format("YYYY-MM")) {
                                batchListForJexcel.push({
                                    name: batchDetailsToPush[0].batchNo + "~" + moment(batchDetailsToPush[0].expiryDate).format("MMM-YY"),
                                    id: batchDetailsToPush[0].batchNo + "~" + moment(batchDetailsToPush[0].expiryDate).format("YYYY-MM-DD"),
                                })
                            }
                        }
                    }
                }
                for (var bd = 0; bd < shipmentBatchList.length; bd++) {
                    var index = batchList.findIndex(c => c.batchNo == shipmentBatchList[bd].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(shipmentBatchList[bd].batch.expiryDate).format("YYYY-MM"));
                    if (index == -1) {
                        var shipmentBatchListFiltered = shipmentBatchList.filter(c => c.batch.batchNo == shipmentBatchList[bd].batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(shipmentBatchList[bd].expiryDate).format("YYYY-MM"));
                        var consumptionBatchListFiltered = consumptionBatchList.filter(c => c.batch.batchNo == shipmentBatchList[bd].batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(shipmentBatchList[bd].expiryDate).format("YYYY-MM"));
                        var inventoryBatchListFiltered = inventoryBatchList.filter(c => c.batch.batchNo == shipmentBatchList[bd].batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(shipmentBatchList[bd].expiryDate).format("YYYY-MM"));
                        var shipmentTotal = 0;
                        var consumptionTotal = 0;
                        var inventoryTotal = 0;
                        shipmentBatchListFiltered.map(item => {
                            shipmentTotal += Number(item.shipmentQty);
                        })
                        consumptionBatchListFiltered.map(item => {
                            consumptionTotal += Number(item.consumptionQty);
                        })
                        inventoryBatchListFiltered.map(item => {
                            inventoryTotal += Number(item.adjustmentQty)
                        })
                        var batchDetailsToPush = shipmentBatchList.filter(c => c.batchNo == shipmentBatchList[bd].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(shipmentBatchList[bd].batch.expiryDate).format("YYYY-MM"));
                        if (batchDetailsToPush.length > 0) {
                            batchDetailsToPush[0].qtyAvailable = Number(shipmentTotal) + Number(inventoryTotal) - Number(consumptionTotal);
                            if (shipmentBatchListFiltered.length > 0 || consumptionBatchListFiltered.length > 0 || inventoryBatchListFiltered.length > 0) {
                                batchDetailsToPush[0].checkQtyValidation = false;
                            } else {
                                batchDetailsToPush[0].checkQtyValidation = false;
                            }
                            batchList.push(batchDetailsToPush[0]);
                            if (moment(batchDetailsToPush[0].expiryDate).format("YYYY-MM") > moment(this.state.monthsArray[count].startDate).format("YYYY-MM")) {
                                batchListForJexcel.push({
                                    name: batchDetailsToPush[0].batchNo + "~" + moment(batchDetailsToPush[0].expiryDate).format("MMM-YY"),
                                    id: batchDetailsToPush[0].batchNo + "~" + moment(batchDetailsToPush[0].expiryDate).format("YYYY-MM-DD"),
                                })
                            }
                        }
                    }
                }
                this.setState({
                    actualBatchList: batchList
                })
                let batchInfoList = this.state.batchInfoInInventoryPopUp.filter(c => c.qty > 0);
                let dataArray = [];
                var total = 0;
                var maxDecimals=0;
                for (var j = 0; j < batchInfoList.length; j++) {
                    data = [];
                    var item = batchInfoList[j];
                    if(parseFloat(Number(item.qty).toFixed(8)).toString().split(".")[1]!=undefined && parseFloat(Number(item.qty).toFixed(8)).toString().split(".")[1].length>maxDecimals){
                        maxDecimals=parseFloat(Number(item.qty).toFixed(8)).toString().split(".")[1].length;
                    }
                    console.log("Item Test@123", batchInfoList[j]);
                    data[0] = item.batchNo + "~" + moment(item.expiryDate).format("YYYY-MM-DD");
                    data[1] = moment(item.createdDate).format(DATE_FORMAT_CAP);
                    data[2] = moment(item.expiryDate).format("MMM-YY");
                    data[3] = (item.autoGenerated) ? i18n.t("static.program.yes") : i18n.t("static.program.no")
                    data[4] = Number((Number(item.qty) * Number(this.state.multiplier))).toFixed(8);
                    data[5] = Number(item.qty).toFixed(8);
                    data[6] = 0;
                    total += Number(item.qty);
                    dataArray.push(data);
                }
                if(parseFloat(Number(total).toFixed(8)).toString().split(".")[1]!=undefined && parseFloat(Number(total).toFixed(8)).toString().split(".")[1].length>maxDecimals){
                    maxDecimals=parseFloat(Number(total).toFixed(8)).toString().split(".")[1].length;
                }
                if(parseFloat(Number(this.state.closingBalanceArray[comingFromInventoryData==1?count-2:count].balanceWithoutRounding).toFixed(8)).toString().split(".")[1]!=undefined && parseFloat(Number(this.state.closingBalanceArray[comingFromInventoryData==1?count-2:count].balanceWithoutRounding).toFixed(8)).toString().split(".")[1].length>maxDecimals){
                    maxDecimals=parseFloat(Number(this.state.closingBalanceArray[comingFromInventoryData==1?count-2:count].balanceWithoutRounding).toFixed(8)).toString().split(".")[1].length;
                }
                try {
                    this.el = jexcel(document.getElementById("inventoryActualBatchInfoTable"), '');
                    jexcel.destroy(document.getElementById("inventoryActualBatchInfoTable"), true);
                } catch (err) { }
                var data = dataArray;
                var options = {
                    data: data,
                    columnDrag: false,
                    colWidths: [0, 150, 150, 150, 100, 100, 100],
                    colHeaderClasses: ["Reqasterisk"],
                    columns: [
                        {
                            title: i18n.t("static.supplyPlan.batchId"),
                            type: 'dropdown',
                            width: 200,
                            source: batchListForJexcel,
                            readonly: editable?false:true
                        },
                        {
                            title: i18n.t('static.report.createdDate'),
                            type: 'text',
                            readonly: true
                        },
                        {
                            title: i18n.t('static.inventory.expireDate'),
                            type: 'text',
                            readonly: true
                        },
                        {
                            title: i18n.t('static.supplyPlan.qatGenerated'),
                            type: 'text',
                            readonly: true
                        },
                        {
                            title: i18n.t("static.supplyPlan.projectedQuantity"),
                            type: editable ? 'hidden' : 'numeric',
                            mask: (localStorage.getItem("roundingEnabled") != undefined && localStorage.getItem("roundingEnabled").toString() == "false") ? '#,##.000' : '#,##', decimal: '.',
                            decimal: '.',
                            readonly: true
                        },
                        {
                            title: i18n.t('static.supplyPlan.actualQuantity'),
                            type: editable ? 'numeric' : 'hidden', mask: (maxDecimals!=0?`#,##.` + '0'.repeat(maxDecimals):`#,##`), decimal: '.'
                        },
                        {
                            title: 'Is new',
                            type: 'hidden'
                        }
                    ],
                    editable: editable,
                    onload: function (instance, cell, x, y, value) {
                        jExcelLoadedFunctionOnlyHideRow(instance);
                    },
                    footers: [
                        [
                            '',
                            '',
                            '',
                            i18n.t('static.supplyPlan.batchTotal') + " (" + moment(this.state.monthsArray[count].startDate).format("MMM YYYY") + ")",
                            (localStorage.getItem("roundingEnabled") != undefined && localStorage.getItem("roundingEnabled").toString() == "false")?Number((Number(total) * Number(this.state.multiplier))).toFixed(3).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):Number((Number(total) * Number(this.state.multiplier))).toFixed(0).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
                            editable ? Number(total).toFixed(maxDecimals).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : Number(roundARU(total, this.state.multiplier)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
                        ],
                        [
                            '',
                            '',
                            '',
                            i18n.t('static.supplyPlan.inventoryTotal') + " (" + moment(this.state.monthsArray[count].startDate).format("MMM YYYY") + ")",
                            (localStorage.getItem("roundingEnabled") != undefined && localStorage.getItem("roundingEnabled").toString() == "false")?Number(this.state.closingBalanceArray[comingFromInventoryData==1?count-2:count].balanceWithoutRounding).toFixed(3).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","):Number(this.state.closingBalanceArray[comingFromInventoryData==1?count-2:count].balanceWithoutRounding).toFixed(0).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
                            editable ? Number(this.state.closingBalanceArray[comingFromInventoryData==1?count-2:count].balanceWithoutRounding).toFixed(maxDecimals).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : Number(this.state.closingBalanceArray[comingFromInventoryData==1?count-2:count].balance).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
                        ]
                    ],
                    oneditionend: function (instance, cell, x, y, value) {
                        var rowData = instance.getRowData(y);
                        if (x == 5) {
                            instance.setValueFromCoords(5, y, Number(rowData[5]).toFixed(this.state.maxDecimals), true);
                        }
                    }.bind(this),
                    onchange: function (instance, cell, x, y, value) {
                        this.setState({
                            actualInventoryChanged: true
                        })
                        if (x == 0) {
                            var valid = checkValidtion("text", "A", y, value, this.state.actualInventoryEl);
                            if (valid) {
                                if (value != -1) {
                                    var batchDetails = this.state.actualBatchList.filter(item => (item.batchNo + "~" + moment(item.expiryDate).format("YYYY-MM-DD")) == value)[0];
                                    instance.setValueFromCoords(1, y, moment(batchDetails.createdDate).format(DATE_FORMAT_CAP), true);
                                    instance.setValueFromCoords(2, y, moment(batchDetails.expiryDate).format("MMM-YY"), true);
                                    instance.setValueFromCoords(3, y, (batchDetails.autoGenerated) ? i18n.t("static.program.yes") : i18n.t("static.program.no"), true);
                                } else {
                                    instance.setValueFromCoords(1, y, "", true);
                                    instance.setValueFromCoords(2, y, "", true);
                                    instance.setValueFromCoords(3, y, "", true);
                                }
                                // instance.setValueFromCoords(4,y,(batchDetails.qty!=undefined && batchDetails.qty!=null?batchDetails.qty:0),true);
                            }
                        }
                        if (x == 5) {
                            var totalProjected = 0;
                            var totalActual = 0;
                            this.state.actualInventoryEl.getJson(null, false).map(item => {
                                totalActual += Number(item[5].toString().replaceAll(",", ""))
                            })
                            checkValidtion("number", "F", y, this.state.actualInventoryEl.getValue(`F${parseInt(y) + 1}`, true), this.state.actualInventoryEl, DECIMAL_NO_REGEX_8_DECIMALS, 1, 1);
                            instance.setFooter([[
                                '',
                                '',
                                '',
                                i18n.t('static.supplyPlan.batchTotal') + " (" + moment(this.state.monthsArray[this.state.actualCount].startDate).format("MMM YYYY") + ")",
                                this.formatter(Number((Number(totalProjected) * Number(this.state.multiplier))).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")),
                                this.formatter(Number(totalActual).toFixed(this.state.maxDecimals).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
                            ],
                            [
                                '',
                                '',
                                '',
                                i18n.t('static.supplyPlan.inventoryTotal') + " (" + moment(this.state.monthsArray[this.state.actualCount].startDate).format("MMM YYYY") + ")",
                                this.formatter(Number(this.state.closingBalanceArray[this.state.comingFromInventoryData==1?Number(this.state.actualCount)-2:this.state.actualCount].closingBalance).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")),
                                this.formatter(Number(this.state.closingBalanceArray[this.state.comingFromInventoryData==1?Number(this.state.actualCount)-2:this.state.actualCount].balanceWithoutRounding).toFixed(this.state.maxDecimals).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","))
                            ]])
                        }
                    }.bind(this),
                    pagination: false,
                    search: false,
                    columnSorting: false,
                    wordWrap: true,
                    allowInsertColumn: false,
                    allowManualInsertColumn: false,
                    allowDeleteRow: true,
                    copyCompatibility: true,
                    allowExport: false,
                    position: 'top',
                    filters: false,
                    license: JEXCEL_PRO_KEY,
                    contextMenu: function (obj, x, y, e) {
                        var items = [];
                        if (y != null) {
                            if (editable) {
                                items.push({
                                    title: i18n.t('static.common.addRow'),
                                    onclick: function () {
                                        this.addActualInventory();
                                    }.bind(this)
                                });
                                items.push({
                                    title: i18n.t("static.common.deleterow"),
                                    onclick: function () {
                                        this.setState({
                                            actualInventoryChanged: true
                                        })
                                        obj.deleteRow(parseInt(y));
                                    }.bind(this)
                                });
                            }
                            if (obj.getRowData(y)[0] != -1) {
                                items.push({
                                    title: i18n.t('static.supplyPlan.batchLedger'),
                                    onclick: function () {
                                        this.setState({
                                            ledgerForBatch: []
                                        })
                                        this.showBatchLedgerClicked(obj.getRowData(y)[0].toString().split("~")[0], moment(obj.getRowData(y)[1]).format("YYYY-MM-DD"), moment(obj.getRowData(y)[0].toString().split("~")[1]).format("YYYY-MM-DD"));
                                    }.bind(this)
                                })
                            }
                        }
                        return items;
                    }.bind(this),
                    onbeforepaste: function (obj, data, x, y) {
                        return false;
                    },
                };
                var actualInventoryEl = jexcel(document.getElementById("inventoryActualBatchInfoTable"), options);
                this.el = actualInventoryEl;
                this.setState({
                    actualInventoryEl: actualInventoryEl, loading: false, actualInventoryBatchTotal: Number(total).toFixed(8), actualInventoryDate: this.state.monthsArray[count].startDate, actualCount: count, comingFromInventoryData:comingFromInventoryData, maxDecimals:maxDecimals
                })
            })
        }
    }
    /**
     * This function is used when users click on the add row in the actual inventory
     */
    addActualInventory() {
        var data = [];
        var obj = this.state.actualInventoryEl;
        data[0] = "";
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = 1;
        obj.insertRow(data);
    }
    /**
     * This function is used when users click save for actual inventory
     */
    saveActualInventory() {
        var validation = this.checkValidtionForActualInventory();
        if (validation) {
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');
                var programId = (document.getElementById("programId").value);
                var programRequest = programTransaction.get(programId);
                programRequest.onerror = function (event) {
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataJson = programRequest.result.programData;
                    var generalProgramDataBytes = CryptoJS.AES.decrypt(programDataJson.generalData, SECRET_KEY);
                    var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                    var generalProgramJson = JSON.parse(generalProgramData);
                    var batchInventortList = generalProgramJson.batchInventoryList;
                    if (batchInventortList == undefined) {
                        batchInventortList = [];
                    }
                    var actionList = generalProgramJson.actionList;
                    if (actionList == undefined) {
                        actionList = []
                    }
                    var planningUnitId = document.getElementById("planningUnitId").value;
                    var indexData = batchInventortList.filter(c => (c.planningUnit.id == planningUnitId && moment(c.inventoryDate).format("YYYY-MM") == moment(this.state.actualInventoryDate).format("YYYY-MM")));
                    var batchInventortListFilter = batchInventortList.filter(c => (c.planningUnit.id != planningUnitId) || (c.planningUnit.id == planningUnitId && moment(c.inventoryDate).format("YYYY-MM") != moment(this.state.actualInventoryDate).format("YYYY-MM")));
                    var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                    var curUser = AuthenticationService.getLoggedInUserId();
                    var batchDetailsList = [];
                    var json = this.state.actualInventoryEl.getJson(null, false).filter(c => c[0] != -1);
                    for (var j = 0; j < json.length; j++) {
                        var batchDetails = this.state.actualBatchList.filter(c => (c.batchNo == (json[j][0]).split("~")[0] && moment(c.expiryDate).format("YYYY-MM") == moment((json[j][0]).split("~")[1]).format("YYYY-MM")));
                        console.log("Test@123", Number(this.state.actualInventoryEl.getValue(`F${parseInt(j) + 1}`, true).toString().replaceAll(",", "")))
                        if (batchDetails.length > 0) {
                            batchDetailsList.push({
                                batchInventoryTransId: 0,
                                batch: batchDetails[0],
                                qty: Number(this.state.actualInventoryEl.getValue(`F${parseInt(j) + 1}`, true).toString().replaceAll(",", ""))
                            })
                        }
                    }
                    batchInventortListFilter.push({
                        batchInventoryId: indexData.length > 0 ? indexData[0].batchInventoryId : 0,
                        planningUnit: {
                            id: planningUnitId
                        },
                        inventoryDate: moment(this.state.actualInventoryDate).format("YYYY-MM-DD"),
                        versionId: generalProgramJson.currentVersion.versionId,
                        createdBy: {
                            userId: curUser
                        },
                        createdDate: curDate,
                        lastModifiedBy: {
                            userId: curUser
                        },
                        lastModifiedDate: curDate,
                        batchList: batchDetailsList
                    })
                    generalProgramJson.batchInventoryList = batchInventortListFilter;
                    programDataJson.generalData = (CryptoJS.AES.encrypt(JSON.stringify(generalProgramJson), SECRET_KEY)).toString()
                    programRequest.result.programData = programDataJson;
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        var programId = (document.getElementById("programId").value)
                        var planningUnitId = (document.getElementById("planningUnitId").value)
                        this.setState({
                            actualInventoryChanged: false
                        })
                        var objectStore = "";
                        objectStore = 'programData';
                        calculateSupplyPlan(programId, planningUnitId, objectStore, "actualInventory", this, [], moment(this.state.actualInventoryDate).startOf('month').format("YYYY-MM-DD"));
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }
    }
    checkValidtionForActualInventory() {
        var json = this.state.actualInventoryEl.getJson(null, false);
        var valid = true;
        var tempJson = [];
        var total = 0;
        for (var j = 0; j < json.length; j++) {
            var validation = checkValidtion("text", "A", j, json[j][0], this.state.actualInventoryEl);;
            if (validation == false) {
                valid = false;
            }
            var tmpIndex = tempJson.findIndex(c => c[0] == json[j][0]);
            if (tmpIndex >= 0) {
                valid = false;
                inValid("A", j, i18n.t('static.supplyPlan.duplicateBatchNumber'), this.state.actualInventoryEl);
                inValid("A", tmpIndex, i18n.t('static.supplyPlan.duplicateBatchNumber'), this.state.actualInventoryEl);
            }
            tempJson.push(json[j]);
            total += Number(this.state.actualInventoryEl.getValue(`F${parseInt(j) + 1}`, true).toString().replaceAll(",", ""));
            validation = checkValidtion("number", "F", j, this.state.actualInventoryEl.getValue(`F${parseInt(j) + 1}`, true), this.state.actualInventoryEl, DECIMAL_NO_REGEX_8_DECIMALS, 1, 1);
            if (validation == false) {
                valid = false;
            }
            var batchDetails = this.state.actualBatchList.filter(c => (c.batchNo == (json[j][0]).split("~")[0] && moment(c.expiryDate).format("YYYY-MM") == moment((json[j][0]).split("~")[1]).format("YYYY-MM")));
            if (batchDetails.length > 0) {
                if (batchDetails[0].checkQtyValidation && batchDetails[0].qtyAvailable < Number(this.state.actualInventoryEl.getValue(`F${parseInt(j) + 1}`, true).toString().replaceAll(",", ""))) {
                    inValid("F", j, i18n.t('static.supplyPlan.qtyNotAvailable'), this.state.actualInventoryEl);
                    valid = false;
                }
            }
        }
        if (json.length > 1 && json.filter(c => c[0] == -1).length > 0) {
            valid = false;
            alert(i18n.t('static.supplyPlan.combinationNotAllowed'));
        }
        if (total != this.state.actualInventoryBatchTotal) {
            valid = false;
            this.setState({
                actualInventoryBatchTotalNotMatching: i18n.t("static.supplyPlan.batchQtyNotAvailable")
            }, () => {
                this.hideSixthCompoenent()
            })
        } else {
            this.setState({
                actualInventoryBatchTotalNotMatching: ""
            })
        }
        return valid;
    }
    actionCanceledBatchLedger() {
        this.setState({
            ledgerForBatch: []
        })
    }
    actionCanceledActualInventory() {
        var cont = false;
        if (this.state.actualInventoryChanged) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            try {
                jexcel.destroy(document.getElementById("inventoryActualBatchInfoTable"), true);
            } catch (err) { }
            this.setState({
                actualInventoryChanged: false,
                actualInventoryEl: "",
                ledgerForBatch: [],
                actualInventoryBatchTotalNotMatching: ""
            })
        }
    }
    /**
     * This function contains data that needs to be displayed for both the tabs
     * @returns This function returns the view for both the tabs
     */
    tabPane = () => {
        const { procurementAgentListPlan } = this.state;
        let procurementAgents = procurementAgentListPlan.length > 0
            && procurementAgentListPlan.map((item, i) => {
                return (
                    <option key={i} value={item.procurementAgentId}>
                        {item.procurementAgentCode}
                    </option>
                )
            }, this);
        const { fundingSourceListPlan } = this.state;
        let fundingSources = fundingSourceListPlan.length > 0
            && fundingSourceListPlan.map((item, i) => {
                return (
                    <option key={i} value={item.fundingSourceId}>
                        {item.fundingSourceCode}
                    </option>
                )
            }, this);
        const { budgetListPlan } = this.state;
        let budgets = budgetListPlan.length > 0
            && budgetListPlan.map((item, i) => {
                return (
                    <option key={i} value={item.budgetId}>
                        {item.budgetCode}
                    </option>
                )
            }, this);

        const darkModeColors = [
            '#d4bbff',
            '#757575',
        ];

        const lightModeColors = [
            '#002F6C',  // Color 1 
            '#cfcdc9',
        ];
        const { isDarkMode } = this.state;
        const colors = isDarkMode ? darkModeColors : lightModeColors;
        const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
        const gridLineColor = isDarkMode ? '#444' : '#e0e0e0';
        var chartOptions = {
            title: {
                display: true,
                text: this.state.viewById == 1 ? (this.state.planningUnit != "" && this.state.planningUnit != undefined && this.state.planningUnit != null ? (this.state.programSelect).label + " (Local)" + " - " + this.state.planningUnit.label : entityname) : (this.state.aru != "" && this.state.aru != undefined && this.state.aru != null ? (this.state.programSelect).label + " (Local)" + " - " + this.state.aru.label : entityname),
                fontColor: fontColor
            },
            scales: {
                yAxes: [{
                    id: 'A',
                    scaleLabel: {
                        display: true,
                        labelString: i18n.t('static.shipment.qty'),
                        fontColor: fontColor
                    },
                    stacked: false,
                    ticks: {
                        beginAtZero: true,
                        fontColor: fontColor,
                        callback: function (value) {
                            return value.toLocaleString();
                        }
                    },
                    gridLines: {
                        drawBorder: true,
                        lineWidth: 0,
                        color: gridLineColor,
                        zeroLineColor: gridLineColor
                    },
                    position: 'left',
                },
                {
                    id: 'B',
                    scaleLabel: {
                        display: true,
                        labelString: i18n.t('static.supplyPlan.monthsOfStock'),
                        fontColor: fontColor,
                    },
                    stacked: false,
                    ticks: {
                        beginAtZero: true,
                        fontColor: fontColor,
                    },
                    gridLines: {
                        drawBorder: true,
                        lineWidth: 0,
                        color: gridLineColor,
                        zeroLineColor: gridLineColor
                    },
                    position: 'right',
                }
                ],
                xAxes: [{
                    ticks: {
                        fontColor: fontColor
                    },
                    gridLines: {
                        drawBorder: true,
                        lineWidth: 0,
                        color: gridLineColor,
                        zeroLineColor: gridLineColor
                    }
                }]
            },
            tooltips: {
                mode: 'nearest',
                callbacks: {
                    label: function (tooltipItems, data) {
                        if (tooltipItems.datasetIndex == 0) {
                            var details = this.state.expiredStockArr[tooltipItems.index].details;
                            var infoToShow = [];
                            details.map(c => {
                                infoToShow.push(c.batchNo + " - " + c.expiredQty.toLocaleString());
                            });
                            return (infoToShow.join(' | '));
                        } else if (tooltipItems.datasetIndex == 2) {
                            return "";
                        } else {
                            return data.datasets[tooltipItems.datasetIndex].label + ' : ' + (tooltipItems.yLabel.toLocaleString());
                        }
                    }.bind(this)
                },
                intersect: false,
                // enabled: false,
                // custom: CustomTooltips
            },
            maintainAspectRatio: false
            ,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: fontColor
                }
            }
        }
        var chartOptions1 = {
            title: {
                display: true,
                text: this.state.viewById == 1 ? (this.state.planningUnit != "" && this.state.planningUnit != undefined && this.state.planningUnit != null ? (this.state.programSelect).label + " (Local)" + " - " + this.state.planningUnit.label : entityname) : (this.state.aru != "" && this.state.aru != undefined && this.state.aru != null ? (this.state.programSelect).label + " (Local)" + " - " + this.state.aru.label : entityname),
                fontColor: fontColor
            },
            scales: {
                yAxes: [{
                    id: 'A',
                    scaleLabel: {
                        display: true,
                        labelString: i18n.t('static.shipment.qty'),
                        fontColor: fontColor
                    },
                    stacked: false,
                    ticks: {
                        beginAtZero: true,
                        fontColor: fontColor,
                        callback: function (value) {
                            return value.toLocaleString();
                        }
                    },
                    gridLines: {
                        drawBorder: true,
                        lineWidth: 0,
                        color: gridLineColor,
                        zeroLineColor: gridLineColor
                    },
                    position: 'left',
                }
                ],
                xAxes: [{
                    ticks: {
                        fontColor: fontColor
                    },
                    gridLines: {
                        drawBorder: true,
                        lineWidth: 0,
                        color: gridLineColor,
                        zeroLineColor: gridLineColor
                    }
                }]
            },
            tooltips: {
                mode: 'nearest',
                callbacks: {
                    label: function (tooltipItems, data) {

                        if (tooltipItems.datasetIndex == 0) {
                            var details = this.state.expiredStockArr[tooltipItems.index].details;
                            var infoToShow = [];
                            details.map(c => {
                                infoToShow.push(c.batchNo + " - " + c.expiredQty.toLocaleString());
                            });
                            return (infoToShow.join(' | '));
                        } else if (tooltipItems.datasetIndex == 2) {
                            return "";
                        } else {
                            return data.datasets[tooltipItems.datasetIndex].label + ' : ' + (tooltipItems.yLabel.toLocaleString());
                        }
                    }.bind(this)
                },
                intersect: false,
                // enabled: false,
                // custom: CustomTooltips
            },
            maintainAspectRatio: false
            ,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: fontColor
                }
            }
        }
        let bar = {}
        if (this.state.jsonArrForGraph.length > 0) {
            var datasets = [
                {
                    label: i18n.t('static.supplyplan.exipredStock'),
                    yAxisID: 'A',
                    type: 'line',
                    stack: 7,
                    data: this.state.expiredStockArr.map((item, index) => (item.qty > 0 ? item.qty : null)),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    showLine: false,
                    pointStyle: 'triangle',
                    pointBackgroundColor: '#ED8944',
                    pointBorderColor: '#212721',
                    pointRadius: 10
                },
                {
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
                    pointRadius: 0,
                    showInLegend: true,
                    pointBackgroundColor: '#ba0c2f',
                    pointBorderColor: '#ba0c2f',
                    data: this.state.jsonArrForGraph.map((item, index) => (item.consumption))
                },
                {
                    label: i18n.t('static.report.actualConsumption'),
                    yAxisID: 'A',
                    type: 'line',
                    stack: 7,
                    data: this.state.consumptionTotalData.map((item, index) => (item.consumptionType == 1 ? item.consumptionQty : null)),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    showLine: false,
                    pointStyle: 'point',
                    pointBackgroundColor: '#ba0c2f',
                    pointBorderColor: '#ba0c2f',
                    pointRadius: 3
                },
                {
                    label: i18n.t('static.supplyPlan.delivered'),
                    stack: 1,
                    yAxisID: 'A',
                    backgroundColor: colors[0],
                    borderColor: colors[0],
                    pointBackgroundColor: colors[0],
                    pointBorderColor: colors[0],
                    pointHoverBackgroundColor: colors[0],
                    pointHoverBorderColor: colors[0],
                    data: this.state.jsonArrForGraph.map((item, index) => (item.delivered)),
                },
                {
                    label: i18n.t('static.supplyPlan.shipped'),
                    stack: 1,
                    yAxisID: 'A',
                    backgroundColor: '#49A4A1',
                    borderColor: '#49A4A1',
                    pointBackgroundColor: '#49A4A1',
                    pointBorderColor: '#49A4A1',
                    pointHoverBackgroundColor: '#49A4A1',
                    pointHoverBorderColor: '#49A4A1',
                    data: this.state.jsonArrForGraph.map((item, index) => (item.shipped)),
                },
                {
                    label: i18n.t('static.supplyPlan.submitted'),
                    stack: 1,
                    yAxisID: 'A',
                    backgroundColor: '#0067B9',
                    borderColor: '#0067B9',
                    pointBackgroundColor: '#0067B9',
                    pointBorderColor: '#0067B9',
                    pointHoverBackgroundColor: '#0067B9',
                    pointHoverBorderColor: '#0067B9',
                    data: this.state.jsonArrForGraph.map((item, index) => (item.ordered)),
                },
                {
                    label: i18n.t('static.report.hold'),
                    stack: 1,
                    yAxisID: 'A',
                    backgroundColor: '#6C6463',
                    borderColor: '#6C6463',
                    pointBackgroundColor: '#6C6463',
                    pointBorderColor: '#6C6463',
                    pointHoverBackgroundColor: '#6C6463',
                    pointHoverBorderColor: '#6C6463',
                    data: this.state.jsonArrForGraph.map((item, index) => (item.onhold)),
                },
                {
                    label: i18n.t('static.report.planned'),
                    stack: 1,
                    yAxisID: 'A',
                    backgroundColor: '#A7C6ED',
                    borderColor: '#A7C6ED',
                    pointBackgroundColor: '#A7C6ED',
                    pointBorderColor: '#A7C6ED',
                    pointHoverBackgroundColor: '#A7C6ED',
                    pointHoverBorderColor: '#A7C6ED',
                    data: this.state.jsonArrForGraph.map((item, index) => (item.planned)),
                },
                {
                    label: i18n.t('static.report.stock'),
                    stack: 2,
                    type: 'line',
                    yAxisID: 'A',
                    backgroundColor: colors[1],
                    borderColor: colors[1],
                    borderStyle: 'dotted',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    lineTension: 0,
                    pointStyle: 'circle',
                    pointRadius: 0,
                    showInLegend: true,
                    data: this.state.jsonArrForGraph.map((item, index) => (item.stock))
                },
                {
                    label: this.state.planBasedOn == 1 ? i18n.t('static.supplyPlan.minStockMos') : i18n.t('static.product.minQuantity'),
                    type: 'line',
                    stack: 5,
                    yAxisID: this.state.planBasedOn == 1 ? 'B' : 'A',
                    backgroundColor: 'transparent',
                    borderColor: '#59cacc',
                    pointBackgroundColor: '#59cacc',
                    pointBorderColor: '#59cacc',
                    borderStyle: 'dotted',
                    borderDash: [10, 10],
                    fill: '+1',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    showInLegend: true,
                    pointStyle: 'line',
                    pointRadius: 0,
                    yValueFormatString: "$#,##0",
                    lineTension: 0,
                    data: this.state.jsonArrForGraph.map((item, index) => (this.state.planBasedOn == 1 ? item.minMos : item.minQty))
                },
                {
                    label: this.state.planBasedOn == 1 ? i18n.t('static.supplyPlan.maxStockMos') : i18n.t('static.supplyPlan.maxQty'),
                    type: 'line',
                    stack: 6,
                    yAxisID: this.state.planBasedOn == 1 ? 'B' : 'A',
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: '#59cacc',
                    pointBackgroundColor: '#59cacc',
                    pointBorderColor: '#59cacc',
                    borderStyle: 'dotted',
                    borderDash: [10, 10],
                    fill: true,
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    lineTension: 0,
                    pointStyle: 'line',
                    pointRadius: 0,
                    showInLegend: true,
                    yValueFormatString: "$#,##0",
                    data: this.state.jsonArrForGraph.map((item, index) => (this.state.planBasedOn == 1 ? item.maxMos : item.maxQty))
                }
            ];
            if (this.state.jsonArrForGraph.length > 0 && this.state.planBasedOn == 1) {
                datasets.push({
                    label: i18n.t('static.supplyPlan.monthsOfStock'),
                    type: 'line',
                    stack: 4,
                    yAxisID: 'B',
                    backgroundColor: 'transparent',
                    borderColor: '#118b70',
                    pointBackgroundColor: '#118b70',
                    pointBorderColor: '#118b70',
                    borderStyle: 'dotted',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    lineTension: 0,
                    pointStyle: 'line',
                    pointRadius: 0,
                    showInLegend: true,
                    data: this.state.jsonArrForGraph.map((item, index) => (item.mos))
                })
            }
            bar = {
                labels: [...new Set(this.state.jsonArrForGraph.map(ele => (ele.month)))],
                datasets: datasets
            };
        }
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        return (
            <>
                <TabPane tabId="1">
                    <div id="supplyPlanTableId" style={{ display: this.state.display }}>
                        <Row className="float-right">
                            <div className="col-md-12">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.toggleExport(1)} />
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.toggleExport(2)} />
                            </div>
                        </Row>
                        <div className="col-md-12">
                            <span className="supplyplan-larrow" onClick={this.leftClicked}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                            <span className="supplyplan-rarrow" onClick={this.rightClicked}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                        </div>
                        <div className="table-scroll mt-2">
                            <div className="table-wrap table-responsive fixTableHeadSupplyPlan">
                                <Table className="table-bordered text-center overflowhide main-table " size="sm" options={this.options}>
                                    <thead>
                                        <tr>
                                            <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
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
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone darkModeclrblack" style={{ backgroundColor: '#d9d9d9' }}><b>{i18n.t('static.supplyPlan.openingBalance')}</b></td>
                                            {
                                                this.state.openingBalanceArray.map(item1 => (
                                                    <td align="right" className='darkModeclrblack'>{item1.isActual == 1 ? <b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.balance} /></b> : <NumberFormat displayType={'text'} thousandSeparator={true} value={item1.balance} />}</td>
                                                ))
                                            }
                                        </tr>
                                        <tr>
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone"><b>- {i18n.t('static.supplyPlan.consumption')}</b></td>
                                            {
                                                this.state.consumptionTotalData.map((item1, count) => {
                                                    if (item1.consumptionType == 1) {
                                                        if (item1.consumptionQty != null) {
                                                            return (<td align="right" className="hoverTd lightModeclrblack" onClick={() => this.toggleLarge('Consumption', '', '', '', '', '', '', count)} style={{ color: item1.textColor }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></td>)
                                                        } else {
                                                            return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '', '', '', '', '', count)} style={{ color: item1.textColor }}>{""}</td>)
                                                        }
                                                    } else {
                                                        if (item1.consumptionQty != null) {
                                                            return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '', '', '', '', '', count)} style={{ color: item1.textColor }}><i><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></i></td>)
                                                        } else {
                                                            return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '', '', '', '', '', count)} style={{ color: item1.textColor }}><i>{""}</i></td>)
                                                        }
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr>
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordionTotalShipments()}>
                                                {this.state.showTotalShipment ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                            </td>
                                            <td align="left" className="sticky-col first-col clone"><b>+ {i18n.t('static.dashboard.shipments')}</b></td>
                                            {
                                                this.state.shipmentsTotalData.map((item1, index) => (
                                                    <td align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${this.state.monthsArray[index].startDate}`, `${this.state.monthsArray[index].endDate}`, ``, 'allShipments', index)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                                ))
                                            }
                                        </tr>
                                        <tr className="totalShipments">
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.suggestedShipments')}&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:void();" onClick={this.toggleReplan} title={i18n.t("static.supplyPlan.planMultiplePusByDate")}><i className="fa fa-lg fa-calendar"></i></a></td>
                                            {
                                                this.state.suggestedShipmentsTotalData.map((item1, index) => {
                                                    if (item1.suggestedOrderQty.toString() != "") {
                                                        if (item1.isEmergencyOrder == 1) {
                                                            return (<td align="right" className="emergencyComment hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, `${item1.suggestedOrderQty}`, `${this.state.monthsArray[index].startDate}`, `${this.state.monthsArray[index].endDate}`, `${item1.isEmergencyOrder}`, '', index)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                        } else {
                                                            return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, `${item1.suggestedOrderQty}`, `${this.state.monthsArray[index].startDate}`, `${this.state.monthsArray[index].endDate}`, `${item1.isEmergencyOrder}`, '', index)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
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
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.delivered')}</td>
                                            {
                                                this.state.deliveredShipmentsTotalData.map((item1, count) => {
                                                    if (item1.toString() != "") {
                                                        var classNameForShipments = "";
                                                        if (item1.isLocalProcurementAgent) {
                                                            if (item1.textColor == "#fff") {
                                                                classNameForShipments = classNameForShipments.concat("localProcurement1")
                                                            } else {
                                                                classNameForShipments = classNameForShipments.concat("localProcurement2")
                                                            }
                                                        }
                                                        if (item1.isErp) {
                                                            if (item1.textColor == "#fff") {
                                                                classNameForShipments = classNameForShipments.concat("erpShipment1")
                                                            } else {
                                                                classNameForShipments = classNameForShipments.concat("erpShipment2")
                                                            }
                                                        }
                                                        if (item1.isEmergencyOrder) {
                                                            classNameForShipments = classNameForShipments.concat("emergencyOrder")
                                                        }
                                                        classNameForShipments = classNameForShipments.concat(" hoverTd");
                                                        if (item1.textColor == "#fff") {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right" >{item1}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr className="totalShipments">
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.shipped')}</td>
                                            {
                                                this.state.shippedShipmentsTotalData.map((item1, count) => {
                                                    if (item1.toString() != "") {
                                                        var classNameForShipments = "";
                                                        if (item1.isLocalProcurementAgent) {
                                                            if (item1.textColor == "#fff") {
                                                                classNameForShipments = classNameForShipments.concat("localProcurement1")
                                                            } else {
                                                                classNameForShipments = classNameForShipments.concat("localProcurement2")
                                                            }
                                                        }
                                                        if (item1.isErp) {
                                                            if (item1.textColor == "#fff") {
                                                                classNameForShipments = classNameForShipments.concat("erpShipment1")
                                                            } else {
                                                                classNameForShipments = classNameForShipments.concat("erpShipment2")
                                                            }
                                                        }
                                                        if (item1.isEmergencyOrder) {
                                                            classNameForShipments = classNameForShipments.concat("emergencyOrder")
                                                        }
                                                        classNameForShipments = classNameForShipments.concat(" hoverTd");
                                                        if (item1.textColor == "#fff") {
                                                            return (<td align="right" bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td align="right" bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right" >{item1}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr className="totalShipments">
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.submitted')}</td>
                                            {
                                                this.state.orderedShipmentsTotalData.map((item1, count) => {
                                                    if (item1.toString() != "") {
                                                        var classNameForShipments = "";
                                                        if (item1.isLocalProcurementAgent) {
                                                            if (item1.textColor == "#fff") {
                                                                classNameForShipments = classNameForShipments.concat("localProcurement1")
                                                            } else {
                                                                classNameForShipments = classNameForShipments.concat("localProcurement2")
                                                            }
                                                        }
                                                        if (item1.isErp) {
                                                            if (item1.textColor == "#fff") {
                                                                classNameForShipments = classNameForShipments.concat("erpShipment1")
                                                            } else {
                                                                classNameForShipments = classNameForShipments.concat("erpShipment2")
                                                            }
                                                        }
                                                        if (item1.isEmergencyOrder) {
                                                            classNameForShipments = classNameForShipments.concat("emergencyOrder")
                                                        }
                                                        classNameForShipments = classNameForShipments.concat(" hoverTd");
                                                        if (item1.textColor == "#fff") {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right" >{item1}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr className="totalShipments">
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.report.hold')}</td>
                                            {
                                                this.state.onholdShipmentsTotalData.map((item1, count) => {
                                                    if (item1.toString() != "") {
                                                        var classNameForShipments = "";
                                                        if (item1.isLocalProcurementAgent) {
                                                            if (item1.textColor == "#fff") {
                                                                classNameForShipments = classNameForShipments.concat("localProcurement1")
                                                            } else {
                                                                classNameForShipments = classNameForShipments.concat("localProcurement2")
                                                            }
                                                        }
                                                        if (item1.isErp) {
                                                            if (item1.textColor == "#fff") {
                                                                classNameForShipments = classNameForShipments.concat("erpShipment1")
                                                            } else {
                                                                classNameForShipments = classNameForShipments.concat("erpShipment2")
                                                            }
                                                        }
                                                        if (item1.isEmergencyOrder) {
                                                            classNameForShipments = classNameForShipments.concat("emergencyOrder")
                                                        }
                                                        classNameForShipments = classNameForShipments.concat(" hoverTd");
                                                        if (item1.textColor == "#fff") {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'onholdShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'onholdShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right" >{item1}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr className="totalShipments">
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.report.planned')}</td>
                                            {
                                                this.state.plannedShipmentsTotalData.map((item1, count) => {
                                                    if (item1.toString() != "") {
                                                        var classNameForShipments = "";
                                                        if (item1.isLocalProcurementAgent) {
                                                            if (item1.textColor == "#fff") {
                                                                classNameForShipments = classNameForShipments.concat("localProcurement1")
                                                            } else {
                                                                classNameForShipments = classNameForShipments.concat("localProcurement2")
                                                            }
                                                        }
                                                        if (item1.isErp) {
                                                            if (item1.textColor == "#fff") {
                                                                classNameForShipments = classNameForShipments.concat("erpShipment1")
                                                            } else {
                                                                classNameForShipments = classNameForShipments.concat("erpShipment2")
                                                            }
                                                        }
                                                        if (item1.isEmergencyOrder) {
                                                            classNameForShipments = classNameForShipments.concat("emergencyOrder")
                                                        }
                                                        classNameForShipments = classNameForShipments.concat(" hoverTd");
                                                        if (item1.textColor == "#fff") {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className={classNameForShipments} onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedShipments', count)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right" >{item1}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr>
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordionTotalAdjustments()}>
                                                {this.state.showTotalAdjustment ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                            </td>
                                            <td align="left" className="sticky-col first-col clone"><b>+/- {i18n.t('static.supplyPlan.totalAdjustment')}</b></td>
                                            {
                                                this.state.inventoryTotalData.map((item1, count) => {
                                                    if (item1 != null) {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '', '', '', '', '', count)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                    } else {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '', '', '', '', '', count)}>{""}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr className="totalAdjustments">
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.manualAdjustment')}</td>
                                            {
                                                this.state.adjustmentTotalData.map((item1, count) => {
                                                    if (item1 != null) {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '', '', '', '', '', count)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                    } else {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '', '', '', '', '', count)}>{""}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr className="totalAdjustments">
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.nationalAdjustment')}</td>
                                            {
                                                this.state.nationalAdjustmentTotalData.map((item1, count) => {
                                                    if (item1 != null) {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '', '', '', '', '', count)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                    } else {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '', '', '', '', '', count)}>{""}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr>
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone"><b>- {i18n.t('static.supplyplan.exipredStock')}</b></td>
                                            {
                                                this.state.expiredStockArr.map(item1 => {
                                                    if (item1.toString() != "") {
                                                        if (item1.qty != 0) {
                                                            return (<td align="right" className="hoverTd redColor" onClick={() => this.toggleLarge('expiredStock', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, '')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone darkModeclrblack" style={{ backgroundColor: '#d9d9d9' }}><b>{i18n.t('static.supplyPlan.endingBalance')}</b></td>
                                            {
                                                this.state.closingBalanceArray.map((item1, count) => {
                                                    return (<td align="right" bgcolor={this.state.planBasedOn == 1 ? (item1.balance == 0 ? '#BA0C2F' : '') : (item1.balance == null ? "#cfcdc9" : item1.balance == 0 ? "#BA0C2F" : item1.balance < this.state.minQtyPpu ? "#f48521" : item1.balance > this.state.maxQtyArray[count] ? "#edb944" : "#118b70")} className="hoverTd darkModeclrblack" onClick={() => this.toggleLarge('Adjustments', '', '', '', '', '', '', count)}>{item1.isActual == 1 ? <b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.balance} /></b> : <NumberFormat displayType={'text'} thousandSeparator={true} value={item1.balance} />}</td>)
                                                })
                                            }
                                        </tr>
                                        {this.state.planBasedOn == 1 && <tr>
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone"><b>{i18n.t('static.supplyPlan.monthsOfStock')}</b></td>
                                            {
                                                this.state.monthsOfStockArray.map(item1 => (
                                                    <td align="right" className='darkModeclrblack' style={{ backgroundColor: item1 == null ? "#cfcdc9" : item1 == 0 ? "#BA0C2F" : item1 < this.state.minStockMoSQty ? "#f48521" : item1 > this.state.maxStockMoSQty ? "#edb944" : "#118b70" }}>{item1 != null ? <NumberFormat displayType={'text'} thousandSeparator={true} value={roundAMC(item1)} /> : i18n.t('static.supplyPlanFormula.na')}</td>
                                                ))
                                            }
                                        </tr>}
                                        {this.state.planBasedOn == 2 && <tr>
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone"><b>{i18n.t('static.supplyPlan.maxQty')}</b></td>
                                            {
                                                this.state.maxQtyArray.map(item1 => (
                                                    <td align="right">{item1 != null ? <NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /> : ""}</td>
                                                ))
                                            }
                                        </tr>}
                                        <tr>
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone" title={i18n.t('static.supplyplan.amcmessage')}>{i18n.t('static.supplyPlan.amc')}</td>
                                            {
                                                this.state.amcTotalData.map(item1 => (
                                                    <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                                ))
                                            }
                                        </tr>
                                        <tr>
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone">{i18n.t('static.supplyPlan.unmetDemandStr')}</td>
                                            {
                                                this.state.unmetDemand.map(item1 => {
                                                    if (item1 != null) {
                                                        return (<td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                    } else {
                                                        return (<td align="right">{""}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                            {
                                this.state.jsonArrForGraph.length > 0
                                &&
                                <div className="row" >
                                    <div className="graphwidth">
                                        <div className="col-md-12">
                                            <div className="chart-wrapper chart-graph-report">
                                                {this.state.planBasedOn == 1 && <Bar id="cool-canvas" data={bar} options={chartOptions} />}
                                                {this.state.planBasedOn == 2 && <Bar id="cool-canvas" data={bar} options={chartOptions1} />}
                                            </div>
                                            <div id="bars_div" style={{ display: "none" }}>
                                                {this.state.planningUnitData.map((ele, index) => {
                                                    return (<>{ele.planBasedOn == 1 && <div className="chart-wrapper chart-graph-report"><Bar id={"cool-canvas" + index} data={ele.bar} options={ele.chartOptions} /></div>}
                                                        {ele.planBasedOn == 2 && <div className="chart-wrapper chart-graph-report"><Bar id={"cool-canvas" + index} data={ele.bar} options={ele.chartOptions} /></div>}
                                                    </>)
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 pt-1 DarkThColr"> <span>{i18n.t('static.supplyPlan.noteBelowGraph')}</span></div>
                                </div>
                            }
                        </div>
                    </div>
                    <Modal isOpen={this.state.consumption}
                        className={'modal-lg modalWidth ' + this.props.className} >
                        <ModalHeader toggle={() => this.toggleLarge('Consumption')} className="modalHeaderSupplyPlan">
                            <strong>{i18n.t('static.dashboard.consumptiondetails')} -  {i18n.t('static.planningunit.planningunit')} - {this.state.planningUnitName} </strong>
                            <ul className="legendcommitversion list-group" style={{ display: 'inline-flex' }}>
                                <li><span className="purplelegend legendcolor"></span> <span className="legendcommitversionText" style={{ color: "rgb(170, 85, 161)" }}><i>{i18n.t('static.supplyPlan.forecastedConsumption')}</i></span></li>
                                <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.actualConsumption')} </span></li>
                            </ul>
                            <div className=" card-header-actions" style={{ marginTop: '19px' }}>
                                <a className="card-header-action">
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
                                                                        return (<td align="center" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.regionId}`, `${item1.actualFlag}`, `${item1.month.month}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                                    } else {
                                                                        return (<td align="center" style={{ color: 'rgb(170, 85, 161)' }} className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.regionId}`, `${item1.actualFlag}`, `${item1.month.month}`)}><i><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></i></td>)
                                                                    }
                                                                } else {
                                                                    return (<td align="center" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.regionId}`, ``, `${item1.month.month}`)}></td>)
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
                                                        return (<th style={{ textAlign: 'center' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.qty} /></th>)
                                                    }
                                                })
                                            }
                                        </tr>
                                    </tfoot>
                                </Table>
                                {this.state.showConsumption == 1 && <ConsumptionInSupplyPlanComponent ref="consumptionChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} consumptionPage="supplyPlan" useLocalData={1} />}
                                <div className=" mt-3">
                                    <div id="consumptionTable" className="TableWidth100" />
                                </div>
                                <h6 className="red" id="div3">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchInfoNoStockError || this.state.consumptionBatchError}</h6>
                                <div className="">
                                    <div id="consumptionBatchInfoTable" className="AddListbatchtrHeight"></div>
                                </div>
                                <div id="showConsumptionBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                    <span>{i18n.t("static.dataEntry.missingBatchNote")}</span>
                                    <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledConsumption()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    {this.state.consumptionBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.consumptionChild.saveConsumptionBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                                    {this.refs.consumptionChild != undefined && <Button id="consumptionBatchAddRow" color="info" size="md" className="float-right mr-1" type="button" onClick={this.refs.consumptionChild.addBatchRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
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
                    <Modal isOpen={this.state.adjustments}
                        className={'modal-lg modalWidth ' + this.props.className}>
                        <ModalHeader toggle={() => this.toggleLarge('Adjustments')} className="modalHeaderSupplyPlan">
                            <strong>{i18n.t('static.supplyPlan.adjustmentsDetails')} -  {i18n.t('static.planningunit.planningunit')} - {this.state.planningUnitName} </strong>
                            <div className="card-header-actions" style={{ marginTop: '0px' }}>
                                <a className="card-header-action">
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
                                                                            <td align="center" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item1.adjustmentsQty, this.state.multiplier)} /></td>
                                                                            <td align="center" className={compare ? "hoverTd" : ""} onClick={compare ? () => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1) : ""}><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item1.actualQty, this.state.multiplier)} /></td>
                                                                        </>
                                                                    )
                                                                } else if (item1.adjustmentsQty.toString() != '' && (item1.actualQty.toString() == "" || item1.actualQty.toString() == 0)) {
                                                                    return (
                                                                        <>
                                                                            <td align="center" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item1.adjustmentsQty, this.state.multiplier)} /></td>
                                                                            <td align="center" className={compare ? "hoverTd" : ""} onClick={compare ? () => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1) : ""}></td>
                                                                        </>
                                                                    )
                                                                } else if (item1.adjustmentsQty.toString() == '' && (item1.actualQty.toString() != "" || item1.actualQty.toString() != 0)) {
                                                                    return (
                                                                        <>
                                                                            <td align="center" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}></td>
                                                                            <td align="center" className={compare ? "hoverTd" : ""} onClick={compare ? () => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1) : ""}><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item1.actualQty, this.state.multiplier)} /></td>
                                                                        </>
                                                                    )
                                                                } else {
                                                                    return (<><td align="center" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}></td>
                                                                        <td align="center" className={compare ? "hoverTd" : ""} onClick={compare ? () => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1) : ""}></td>
                                                                    </>)
                                                                }
                                                            }
                                                        })
                                                    }
                                                </tr>
                                            )
                                            )
                                        }
                                        <tr bgcolor='#d9d9d9' className='text-blackDModal'>
                                            <td style={{ textAlign: 'left' }}>{i18n.t('static.supplyPlan.total')}</td>
                                            {
                                                this.state.inventoryFilteredArray.filter(c => c.regionId == -1).map((item, count) => {
                                                    if (count < 7) {
                                                        return (
                                                            <>
                                                                <td><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item.adjustmentsQty, this.state.multiplier)} />
                                                                </td>
                                                                {(item.actualQty) > 0 ? <td><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item.actualQty, this.state.multiplier)} /></td> : <td style={{ textAlign: 'left' }}>{roundARU(item.actualQty, this.state.multiplier)}</td>}
                                                            </>
                                                        )
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr>
                                            <td className="BorderNoneSupplyPlan" colSpan="15"></td>
                                        </tr>
                                        <tr bgcolor='#d9d9d9' className='text-blackDModal'>
                                            <td align="left">{i18n.t("static.supplyPlan.projectedInventory")}</td>
                                            {
                                                this.state.inventoryFilteredArray.filter(c => c.regionId == -1).map((item, count) => {
                                                    if (count < 7) {
                                                        return (
                                                            <td colSpan="2"><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item.projectedInventory, this.state.multiplier)} /></td>
                                                        )
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr bgcolor='#d9d9d9' className='text-blackDModal'>
                                            <td align="left">{i18n.t("static.supplyPlan.nationalAdjustment")}</td>
                                            {
                                                this.state.inventoryFilteredArray.filter(c => c.regionId == -1).map((item1, count) => {
                                                    if (count < 7) {
                                                        if (item1.autoAdjustments.toString() != '') {
                                                            return (<td colSpan="2" ><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item1.autoAdjustments, this.state.multiplier)} /></td>)
                                                        } else {
                                                            return (<td colSpan="2"></td>)
                                                        }
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr bgcolor='#d9d9d9' className='text-blackDModal'>
                                            <td align="left">{i18n.t("static.supplyPlan.finalInventory")}</td>
                                            {
                                                this.state.closingBalanceArray.map((item, count) => {
                                                    if (count < 7) {
                                                        return (
                                                            <td colSpan="2" className={"hoverTd"} onClick={() => this.toggleInventoryActualBatchInfo(item.batchInfoList, item.isActual, count,0)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.balance} /></td>
                                                        )
                                                    }
                                                })
                                            }
                                        </tr>
                                    </tbody>
                                </Table><br />
                                <span className='text-blackD'>{i18n.t('static.supplyPlan.actualInventoryNote1')}</span>
                                {this.state.showInventory == 1 && <InventoryInSupplyPlanComponent ref="inventoryChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} inventoryPage="supplyPlan" hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} adjustmentsDetailsClicked={this.adjustmentsDetailsClicked} useLocalData={1} />}
                                <div className=" mt-3">
                                    <div id="adjustmentsTable" className=" " />
                                </div>
                                <h6 className="red" id="div3">{this.state.inventoryBatchInfoDuplicateError || this.state.inventoryBatchInfoNoStockError || this.state.inventoryBatchError}</h6>
                                <div className="">
                                    <div id="inventoryBatchInfoTable" className="AddListbatchtrHeight"></div>
                                </div>
                                <div id="showInventoryBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                    <span className='text-blackD'>{i18n.t("static.dataEntry.missingBatchNote")}</span>
                                    <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledInventory()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    {this.state.inventoryBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.inventoryChild.saveInventoryBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                                    {this.refs.inventoryChild != undefined && <Button id="inventoryBatchAddRow" color="info" size="md" className="float-right mr-1" type="button" onClick={this.refs.inventoryChild.addBatchRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                                </div>
                                    <>
                                        <div id="inventoryActualBatchInfoTable" className="AddListbatchtrHeight bachTotaltDM"></div><br />
                                        <h6 style={{ "textAlign": "right" }} className="red" id="div6">{this.state.actualInventoryBatchTotalNotMatching}</h6>
                                        {this.state.actualInventoryEditable == 1 && this.state.actualInventoryEl != "" && this.state.actualInventoryEl != undefined && <span className='text-blackD'>{i18n.t('static.supplyPlan.actualInventoryNote2')}</span>}
                                        {this.state.actualInventoryEl != "" && this.state.actualInventoryEl != undefined && <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledActualInventory()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>}
                                        {this.state.actualInventoryChanged && this.state.actualInventoryEl != "" && this.state.actualInventoryEl != undefined && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveActualInventory()} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                                        {this.state.actualInventoryEditable == 1 && this.state.actualInventoryEl != "" && this.state.actualInventoryEl != undefined && <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.addActualInventory}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                                    </>
                                {this.state.ledgerForBatch.length > 0 &&
                                    <>
                                        <br></br>
                                        <br></br>
                                        <br></br>
                                        <>{i18n.t("static.inventory.batchNumber") + " : "}<span className='hoverTd' onClick={() => this.showShipmentWithBatch(this.state.ledgerForBatch[0].batchNo, moment(this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].expiryDate).format("YYYY-MM-DD"))}>{this.state.ledgerForBatch[0].batchNo}</span></>
                                        <br></br>
                                        {i18n.t("static.batchLedger.note")}
                                        <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "60px" }} rowSpan="2" align="center">{i18n.t("static.common.month")}</th>
                                                    <th rowSpan="2" align="center">{i18n.t("static.supplyPlan.openingBalance")}</th>
                                                    <th colSpan="3" align="center">{i18n.t("static.supplyPlan.userEnteredBatches")}</th>
                                                    <th rowSpan="2" align="center">{i18n.t("static.supplyPlan.autoAllocated") + " (+/-)"}</th>
                                                    <th rowSpan="2" align="center">{i18n.t("static.report.closingbalance")}</th>
                                                </tr>
                                                <tr>
                                                    <th align="center">{i18n.t("static.supplyPlan.consumption") + " (-)"}</th>
                                                    <th align="center">{i18n.t("static.inventoryType.adjustment") + " (+/-)"}</th>
                                                    <th align="center">{i18n.t("static.shipment.shipment") + " (+)"}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    ((moment(this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].expiryDate).format("YYYY-MM") == moment(this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].transDate).format("YYYY-MM")) ? this.state.ledgerForBatch.slice(0, -1) : this.state.ledgerForBatch).map(item => (
                                                        <tr>
                                                            <td>{moment(item.transDate).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</td>
                                                            <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.openingBalance != "" ? roundARU(item.openingBalance, this.state.multiplier) : item.openingBalance} /></td>
                                                            <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.consumptionQty != "" ? roundARU(item.consumptionQty, this.state.multiplier) : item.consumptionQty} /></td>
                                                            <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.adjustmentQty != "" ? roundARU(item.adjustmentQty, this.state.multiplier) : item.adjustmentQty} /></td>
                                                            <td>{item.shipmentQty == 0 ? null : <NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item.shipmentQty, this.state.multiplier)} />}</td>
                                                            <td><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(0 - Number(item.unallocatedQty), this.state.multiplier)} /></td>
                                                            {((item.stockQty != null && Number(item.stockQty) > 0) || (item.actualInventoryBatch)) ? <td><b><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item.qty, this.state.multiplier)} /></b></td> : <td><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item.qty, this.state.multiplier)} /></td>}
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td align="right" colSpan="6"><b>{i18n.t("static.supplyPlan.expiry") + " (" + moment(this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].expiryDate).format("MMM-YY") + ")"}</b></td>
                                                    <td><b><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].expiredQty, this.state.multiplier)} /></b></td>
                                                </tr>
                                            </tfoot>
                                        </Table><br />
                                        <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledBatchLedger()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    </>
                                }
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
                    <Modal isOpen={this.state.shipments}
                        className={'modal-lg modalWidth ' + this.props.className}>
                        <ModalHeader toggle={() => this.toggleLarge('shipments')} className="modalHeaderSupplyPlan">
                            <strong>{i18n.t('static.supplyPlan.shipmentsDetails')} -  {i18n.t('static.planningunit.planningunit')} - {this.state.planningUnitName} </strong>
                            <ul className="legendcommitversion">
                                <li className="mt-2"><span className="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.emergencyOrder')}</span></li>
                                <li className="mt-2"><span className=" mediumGreylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.doNotIncludeInProjectedShipment')} </span></li>
                                <li className="mt-2"><span className=" readonlylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.shipment.erpShipment')} </span></li>
                                <li className="mt-2"><span className=" readonlylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.common.readonlyData')} </span></li>
                            </ul>
                            <div className="card-header-actions" style={{ marginTop: '-21px' }}>
                                <a className="card-header-action">
                                    <Link to={`/shipment/shipmentDetails/` + this.state.programId + `/0/` + this.state.planningUnitId} target="_blank"><small className="dataEntryLink">{i18n.t('static.supplyplan.shipmentDataEntry')}</small></Link>
                                </a>
                            </div>
                        </ModalHeader>
                        <div style={{ display: this.state.loading ? "none" : "block" }}>
                            <ModalBody>
                                <div>
                                    <div className="col-md-12">
                                        <span className="supplyplan-larrow-dataentry" onClick={this.leftClickedShipments}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                        <span className="supplyplan-rarrow-dataentry" onClick={this.rightClickedShipments}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                                    </div>
                                    <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                        <thead>
                                            <tr>
                                                <th className="regionTdWidthConsumption"></th>
                                                {
                                                    this.state.monthsArray.map((item, count) => {
                                                        if (count < 7) {
                                                            return (<th onClick={() => this.shipmentsDetailsClicked('allShipments', `${item.startDate}`, `${item.endDate}`)} className={moment(this.state.shipmentStartDateClicked).format("YYYY-MM-DD") == moment(item.startDate).format("YYYY-MM-DD") ? "supplyplan-Thead supplyplanTdWidthForMonths hoverTd" : "supplyplanTdWidthForMonths hoverTd"}>{item.monthName.concat(" ").concat(item.monthYear)}</th>)
                                                        }
                                                    })
                                                }
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td align="left">{i18n.t('static.dashboard.shipments')}</td>
                                                {
                                                    this.state.shipmentsTotalData.map((item1, count) => {
                                                        if (count < 7) {
                                                            if (item1.toString() != '') {
                                                                return (<td align="center" className={this.state.monthsArray.findIndex(c => moment(this.state.shipmentStartDateClicked).format("YYYY-MM-DD") == moment(c.startDate).format("YYYY-MM-DD")) == count ? "supplyplan-Thead hoverTd" : "hoverTd"} onClick={() => this.shipmentsDetailsClicked('allShipments', `${this.state.monthsArray[count].startDate}`, `${this.state.monthsArray[count].endDate}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                            } else {
                                                                return (<td align="center" className={this.state.monthsArray.findIndex(c => moment(this.state.shipmentStartDateClicked).format("YYYY-MM-DD") == moment(c.startDate).format("YYYY-MM-DD")) == count ? "supplyplan-Thead hoverTd" : "hoverTd"} onClick={() => this.shipmentsDetailsClicked('allShipments', `${this.state.monthsArray[count].startDate}`, `${this.state.monthsArray[count].endDate}`)}></td>)
                                                            }
                                                        }
                                                    })
                                                }
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                                {this.state.showShipments == 1 && <ShipmentsInSupplyPlanComponent ref="shipmentChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} hideFourthComponent={this.hideFourthComponent} hideFifthComponent={this.hideFifthComponent} shipmentPage="supplyPlan" useLocalData={1} />}
                                <h6 className="red" id="div2">{this.state.noFundsBudgetError || this.state.shipmentBatchError || this.state.shipmentError}</h6>
                                <div className="">
                                    <div id="shipmentsDetailsTable" className="TableWidth100 ModalTabletextClr" />
                                </div>
                                {this.refs.shipmentChild != undefined && this.refs.shipmentChild.state.originalShipmentIdForPopup !== "" && <><br /><strong>{this.refs.shipmentChild != undefined && this.refs.shipmentChild.state.originalShipmentIdForPopup !== "" ? "For Shipment Id " + this.refs.shipmentChild.state.originalShipmentIdForPopup : ""}</strong></>}
                                <h6 className="red" id="div3">{this.state.qtyCalculatorValidationError}</h6>
                                <div className=" RemoveStriped">
                                    <div id="qtyCalculatorTable"></div>
                                </div>
                                <div className=" RemoveStriped">
                                    <div id="qtyCalculatorTable1" className="jexcelremoveReadonlybackground"></div>
                                </div>
                                <div id="showSaveQtyButtonDiv" style={{ display: 'none' }}>
                                    <Button size="md" color="danger" className="float-right mr-1 mb-2" onClick={() => this.actionCanceledShipments('qtyCalculator')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    {this.state.shipmentQtyChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentQty()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentQty')}</Button>}
                                </div>
                                <h6 className="red" id="div4">{this.state.shipmentDatesError}</h6>
                                <div className="">
                                    <div id="shipmentDatesTable"></div>
                                </div>
                                <div id="showSaveShipmentsDatesButtonsDiv" style={{ display: 'none' }}>
                                    <Button size="md" color="danger" className="float-right mr-1 mb-2" onClick={() => this.actionCanceledShipments('shipmentDates')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    {this.state.shipmentDatesChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentsDate()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentDates')}</Button>}
                                </div>
                                <h6 className="red" id="div5">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                                <div className="">
                                    <div id="shipmentBatchInfoTable" className="AddListbatchtrHeight"></div>
                                </div>
                                <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                    <Button size="md" color="danger" id="shipmentDetailsPopCancelButton" className="float-right mr-1 " onClick={() => this.actionCanceledShipments('shipmentBatch')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    {this.state.showBatchSaveButton && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                                    {this.refs.shipmentChild != undefined && <Button color="info" size="md" id="addRowBatchId" className="float-right mr-1" type="button" onClick={this.refs.shipmentChild.addBatchRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                                    <b><h3 className="float-right mr-2">{i18n.t("static.supplyPlan.shipmentQty") + " : " + this.addCommas(this.state.shipmentQtyTotalForPopup) + " / " + i18n.t("static.supplyPlan.batchQty") + " : " + this.addCommas(this.state.batchQtyTotalForPopup)}</h3></b>
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
                    <Modal isOpen={this.state.replanModal}
                        className={'modal-md'}>
                        <ModalHeader toggle={() => this.toggleReplan()} className="modalHeaderSupplyPlan" id="shipmentModalHeader">
                            <strong>{this.state.showPlanningUnitAndQty == 1 ? i18n.t("static.supplyPlan.listOfNewShipmentsCreated") : i18n.t("static.supplyPlan.planShipmentsByDate")}</strong>
                        </ModalHeader>
                        <Formik
                            enableReinitialize={true}
                            initialValues={{
                                procurementAgentId: this.state.procurementAgentId,
                                fundingSourceId: this.state.fundingSourceId
                            }}
                            validationSchema={validationSchemaReplan}
                            onSubmit={(values, { setSubmitting, setErrors }) => {
                                this.planShipment();
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
                                        <ModalBody>
                                            {this.state.showPlanningUnitAndQty == 0 && <>
                                                <FormGroup className="col-md-12">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.mtexpectedDeliveryDate')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                    <div className="controls edit">
                                                        <Picker
                                                            ref={this.pickAMonthSingle}
                                                            years={{ min: this.state.minDateSingle, max: this.state.maxDateSingle }}
                                                            value={this.state.singleValue}
                                                            lang={pickerLang.months}
                                                            theme="dark"
                                                            key={JSON.stringify(this.state.singleValue)}
                                                            onDismiss={this.handleAMonthDissmisSingle}
                                                        >
                                                            <MonthBox value={makeText(this.state.singleValue)} onClick={this.handleClickMonthBoxSingle} />
                                                        </Picker>
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-12">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.product.product')}
                                                        <span className="reportdown-box-icon  fa fa-sort-desc"></span>
                                                    </Label>
                                                    <div className="controls ">
                                                        <MultiSelect
                                                            name="planningUnitIdsPlan"
                                                            id="planningUnitIdsPlan"
                                                            filterOptions={filterOptions}
                                                            options={this.state.planningUnitList && this.state.planningUnitList.length > 0 ? this.state.planningUnitList : []}
                                                            value={this.state.planningUnitIdsPlan}
                                                            onChange={(e) => { this.setPlanningUnitIdsPlan(e) }}
                                                            labelledBy={i18n.t('static.common.select')}
                                                            overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                        selectSomeItems: i18n.t('static.common.select')}}
                                                        />
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-12">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.procurementAgentName')}</Label>
                                                    <div className="controls ">
                                                        <InputGroup>
                                                            <Input
                                                                type="select"
                                                                name="procurementAgentId"
                                                                id="procurementAgentId"
                                                                bsSize="sm"
                                                                valid={!errors.procurementAgentId}
                                                                invalid={touched.procurementAgentId && !!errors.procurementAgentId}
                                                                onBlur={handleBlur}
                                                                onChange={(e) => { this.setProcurementAgentId(e); handleChange(e); }}
                                                                value={this.state.procurementAgentId}
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {procurementAgents}
                                                            </Input>
                                                            <FormFeedback>{errors.procurementAgentId}</FormFeedback>
                                                        </InputGroup>
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-12">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
                                                    <div className="controls ">
                                                        <InputGroup>
                                                            <Input
                                                                type="select"
                                                                name="fundingSourceId"
                                                                id="fundingSourceId"
                                                                bsSize="sm"
                                                                valid={!errors.fundingSourceId}
                                                                invalid={touched.fundingSourceId && !!errors.fundingSourceId}
                                                                onBlur={handleBlur}
                                                                onChange={(e) => { this.setFundingSourceId(e); handleChange(e); }}
                                                                value={this.state.fundingSourceId}
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {fundingSources}
                                                            </Input>
                                                            <FormFeedback>{errors.fundingSourceId}</FormFeedback>
                                                        </InputGroup>
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-12">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.budget')}</Label>
                                                    <div className="controls ">
                                                        <InputGroup>
                                                            <Input
                                                                type="select"
                                                                name="budgetId"
                                                                id="budgetId"
                                                                bsSize="sm"
                                                                onChange={(e) => { this.setBudgetId(e); }}
                                                                value={this.state.budgetId}
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {budgets}
                                                            </Input>
                                                        </InputGroup>
                                                    </div>
                                                </FormGroup>
                                            </>}
                                            {this.state.showPlanningUnitAndQty == 1 &&
                                                <>
                                                    <Table className="table-bordered text-center mt-2 main-table " bordered size="sm">
                                                        <thead><tr>
                                                            <th>{i18n.t('static.dashboard.planningunitheader')}</th>
                                                            <th>{i18n.t('static.supplyPlan.shipmentQty')}</th>
                                                        </tr></thead>
                                                        <tbody>
                                                            {this.state.showPlanningUnitAndQtyList.map(item => (
                                                                <tr>
                                                                    <td>{item.planningUnitLabel}</td>
                                                                    <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.shipmentQty} /></td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </>
                                            }
                                        </ModalBody>
                                        <ModalFooter>
                                            {this.state.showPlanningUnitAndQty == 0 && <Button type="submit" size="md" color="success" className="float-right mr-1"><i className="fa fa-check"></i>{i18n.t("static.supplyPlan.plan")}</Button>}
                                        </ModalFooter>
                                    </Form>
                                )} />
                    </Modal>
                    <Modal isOpen={this.state.exportModal}
                        className={'modal-md'}>
                        <ModalHeader toggle={() => this.toggleExport(0)} className="modalHeaderSupplyPlan" id="shipmentModalHeader">
                            <strong>{this.state.type == 1 ? i18n.t("static.supplyPlan.exportAsPDF") : i18n.t("static.supplyPlan.exportAsCsv")}</strong>
                        </ModalHeader>
                        <ModalBody>
                            <>
                                <FormGroup className="col-md-12">
                                    <Label htmlFor="appendedInputButton">{this.state.viewById == 1 ? i18n.t('static.product.product') : i18n.t("static.planningunit.countrysku")}
                                        <span className="reportdown-box-icon  fa fa-sort-desc"></span>
                                    </Label>
                                    <div className="controls ">
                                        <MultiSelect
                                            name="planningUnitIdsExport"
                                            id="planningUnitIdsExport"
                                            filterOptions={filterOptions}
                                            options={this.state.viewById == 1 ? (this.state.planningUnitList && this.state.planningUnitList.length > 0 ? this.state.planningUnitList : []) : (this.state.aruList && this.state.aruList.length > 0 ? this.state.aruList : [])}
                                            value={this.state.planningUnitIdsExport}
                                            onChange={(e) => { this.setPlanningUnitIdsExport(e) }}
                                            labelledBy={i18n.t('static.common.select')}
                                        />
                                    </div>
                                </FormGroup>
                            </>
                        </ModalBody>
                        <ModalFooter>
                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.getDataforExport(this.state.type)} ><i className="fa fa-check"></i>{i18n.t("static.common.submit")}</Button>
                        </ModalFooter>
                    </Modal>
                    <Modal isOpen={this.state.expiredStockModal}
                        className={'modal-md modalWidthExpiredStock'}>
                        <ModalHeader toggle={() => this.toggleLarge('expiredStock')} className="modalHeaderSupplyPlan">
                            <strong>{i18n.t('static.dashboard.expiryDetails')}</strong>
                        </ModalHeader>
                        <div style={{ display: this.state.loading ? "none" : "block" }}>
                            <ModalBody>
                                <span style={{ float: "right" }}><b>{i18n.t("static.supplyPlan.batchInfoNote")}</b></span>
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
                                                    <td className="hoverTd" onClick={() => this.showShipmentWithBatch(item.batchNo, item.expiryDate)}>{item.batchNo}</td>
                                                    <td>{moment(item.createdDate).format(DATE_FORMAT_CAP)}</td>
                                                    <td>{moment(item.expiryDate).format("MMM-YY")}</td>
                                                    <td>{(item.autoGenerated) ? i18n.t("static.program.yes") : i18n.t("static.program.no")}</td>
                                                    <td className="hoverTd" onClick={() => this.showBatchLedgerClicked(item.batchNo, item.createdDate, item.expiryDate)}><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item.expiredQty, this.state.multiplier)} /></td>
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
                                {this.state.ledgerForBatch.length > 0 &&
                                    <>
                                        <br></br>
                                        {i18n.t("static.inventory.batchNumber") + " : " + this.state.ledgerForBatch[0].batchNo}
                                        <br></br>
                                        {i18n.t("static.batchLedger.note")}
                                        <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "60px" }} rowSpan="2" align="center">{i18n.t("static.common.month")}</th>
                                                    <th rowSpan="2" align="center">{i18n.t("static.supplyPlan.openingBalance")}</th>
                                                    <th colSpan="3" align="center">{i18n.t("static.supplyPlan.userEnteredBatches")}</th>
                                                    <th rowSpan="2" align="center">{i18n.t("static.supplyPlan.autoAllocated") + " (+/-)"}</th>
                                                    <th rowSpan="2" align="center">{i18n.t("static.report.closingbalance")}</th>
                                                </tr>
                                                <tr>
                                                    <th align="center">{i18n.t("static.supplyPlan.consumption") + " (-)"}</th>
                                                    <th align="center">{i18n.t("static.inventoryType.adjustment") + " (+/-)"}</th>
                                                    <th align="center">{i18n.t("static.shipment.shipment") + " (+)"}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    ((moment(this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].expiryDate).format("YYYY-MM") == moment(this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].transDate).format("YYYY-MM")) ? this.state.ledgerForBatch.slice(0, -1) : this.state.ledgerForBatch).map(item => (
                                                        <tr>
                                                            <td>{moment(item.transDate).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</td>
                                                            <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.openingBalance != "" ? roundARU(item.openingBalance, this.state.multiplier) : item.openingBalance} /></td>
                                                            <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.consumptionQty != "" ? roundARU(item.consumptionQty, this.state.multiplier) : item.consumptionQty} /></td>
                                                            <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.adjustmentQty != "" ? roundARU(item.adjustmentQty, this.state.multiplier) : item.adjustmentQty} /></td>
                                                            <td>{item.shipmentQty == 0 ? null : <NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item.shipmentQty, this.state.multiplier)} />}</td>
                                                            <td><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(0 - Number(item.unallocatedQty), this.state.multiplier)} /></td>
                                                            {((item.stockQty != null && Number(item.stockQty) > 0) || (item.actualInventoryBatch)) ? <td><b><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item.qty, this.state.multiplier)} /></b></td> : <td><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(item.qty, this.state.multiplier)} /></td>}
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td align="right" colSpan="6"><b>{i18n.t("static.supplyPlan.expiry") + " (" + moment(this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].expiryDate).format("MMM-YY") + ")"}</b></td>
                                                    <td><b><NumberFormat displayType={'text'} thousandSeparator={true} value={roundARU(this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].expiredQty, this.state.multiplier)} /></b></td>
                                                </tr>
                                            </tfoot>
                                        </Table>
                                    </>
                                }
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
                </TabPane>
                <TabPane tabId="2">
                    {this.state.planningUnitChange && <SupplyPlanComparisionComponent ref="compareChild" items={this.state} updateState={this.updateState} hideFirstComponent={this.hideFirstComponent} />}
                </TabPane></>)
    }
    /**
     * This function is used to display the ledger of a particular batch No
     * @param {*} batchNo This is the value of the batch number for which the ledger needs to be displayed
     * @param {*} createdDate This is the value of the created date for which the ledger needs to be displayed
     * @param {*} expiryDate  This is the value of the expire date for which the ledger needs to be displayed
     */
    showBatchLedgerClicked(batchNo, createdDate, expiryDate) {
        this.setState({ loading: true })
        var supplyPlanForAllDate = this.state.supplyPlanDataForAllTransDate.filter(c => moment(c.transDate).format("YYYY-MM") >= moment(createdDate).format("YYYY-MM") && moment(c.transDate).format("YYYY-MM") <= moment(expiryDate).format("YYYY-MM"));
        var allBatchLedger = [];
        supplyPlanForAllDate.map(c =>
            c.batchDetails.map(bd => {
                var batchInfo = bd;
                batchInfo.transDate = c.transDate;
                allBatchLedger.push(batchInfo);
            }));
        var ledgerForBatch = allBatchLedger.filter(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
        let finalLedger = [];
        let start = moment(createdDate).format("YYYY-MM");
        let end = moment(expiryDate).format("YYYY-MM");
        let months = new Set(ledgerForBatch.map(e => e.transDate));
        var batchInventortList = this.state.generalProgramJson.batchInventoryList;
        if (batchInventortList == undefined) {
            batchInventortList = []
        }
        while (moment(start).format("YYYY-MM") <= moment(end).format("YYYY-MM")) {
            let month = moment(start).startOf('month').format("YYYY-MM-DD");
            var ledgerData;
            if (months.has(month)) {
                var ledgerData = ledgerForBatch.find(e => e.transDate === month);
                ledgerData.actualInventoryBatch = batchInventortList.filter(c => moment(c.inventoryDate).format("YYYY-MM") == moment(month).format("YYYY-MM")).flatMap(c => c.batchList).length > 0 ? true : false;
                var projectedBalance = Number(ledgerData.openingBalance) - Number(ledgerData.consumptionQty) + Number(ledgerData.adjustmentQty) + Number(ledgerData.shipmentQty) - Number(ledgerData.unallocatedQty);
                if (projectedBalance != Number(ledgerData.qty)) {
                    ledgerData.unallocatedQty = Number(ledgerData.unallocatedQty) - Number((Number(ledgerData.qty) - Number(projectedBalance)))
                }
            } else {
                ledgerData = { transDate: month, openingBalance: 0, consumptionQty: null, adjustmentQty: null, shipmentQty: null, unallocatedQty: null, qty: 0, stockQty: 0, actualInventoryBatch: false, expiryDate: expiryDate, expiredQty: 0 }
            }
            finalLedger.push(ledgerData);
            start = moment(start).add(1, 'month').format('YYYY-MM')
        }
        this.setState({
            ledgerForBatch: finalLedger,
            loading: false
        })
    }
    /**
     * This function is used to redirect the user to shipment details from which a particular batch was created
     * @param {*} batchNo This is the value of the batch number for which a particular shipments needs to be displayed
     * @param {*} expiryDate This is the value of the expire date for which a particular shipments needs to be displayed
     */
    showShipmentWithBatch(batchNo, expiryDate) {
        localStorage.setItem("batchNo", "");
        localStorage.setItem("expiryDate", "");
        var shipmentList = this.state.allShipmentsList;
        shipmentList.map((sl, count) => {
            var batchInfoList = sl.batchInfoList;
            var bi = batchInfoList.filter(c => c.batch.batchNo == batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
            if (bi.length > 0) {
                var shipmentStatus = sl.shipmentStatus.id;
                var index = count;
                this.setState({
                    indexOfShipmentContainingBatch: index
                })
                var date = "";
                if (shipmentStatus == DELIVERED_SHIPMENT_STATUS && sl.receivedDate != "" && sl.receivedDate != null && sl.receivedDate != undefined && sl.receivedDate != "Invalid date") {
                    date = moment(sl.receivedDate).format("YYYY-MM-DD");
                } else {
                    date = moment(sl.expectedDeliveryDate).format("YYYY-MM-DD");
                }
                var currentDate = moment(Date.now()).startOf('month').format("YYYY-MM-DD");
                const monthDifference = moment(new Date(date)).diff(new Date(currentDate), 'months', true) + MONTHS_IN_PAST_FOR_SUPPLY_PLAN - 2;
                this.setState({
                    monthCount: monthDifference
                }, () => {
                    this.toggleLarge('shipments', '', '', moment(date).startOf('month').format("YYYY-MM-DD"), moment(date).endOf('month').format("YYYY-MM-DD"), ``, 'allShipments');
                })
            }
        })
    }
    /**
     * This function is used to get list of programs that user has downloaded
     */
    componentDidMount() {

        // Detect initial theme
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        this.setState({ isDarkMode });

        // Listening for theme changes
        const observer = new MutationObserver(() => {
            const updatedDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
            this.setState({ isDarkMode: updatedDarkMode });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        var fields = document.getElementsByClassName("totalShipments");
        for (var i = 0; i < fields.length; i++) {
            fields[i].style.display = "none";
        }
        var fields = document.getElementsByClassName("totalAdjustments");
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
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "#BA0C2F"
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
                    color: "#BA0C2F"
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
                        var cutOffDate = myResult[i].cutOffDate != undefined && myResult[i].cutOffDate != null && myResult[i].cutOffDate != "" ? myResult[i].cutOffDate : ""
                        var programJson = {
                            label: myResult[i].programCode + "~v" + myResult[i].version + (cutOffDate != "" ? " (" + i18n.t("static.supplyPlan.start") + " " + moment(cutOffDate).format('MMM YYYY') + ")" : ""),
                            value: myResult[i].id,
                            programId: myResult[i].programId
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
                    loading: false,
                    programQPLDetails: getRequest.result
                })
                var programIdd = '';
                if (this.props.match.params.programId != '' && this.props.match.params.programId != undefined) {
                    programIdd = this.props.match.params.programId;
                } else if (proList.length == 1) {
                    programIdd = proList[0].value;
                } else if (localStorage.getItem("sesProgramId") != '' && localStorage.getItem("sesProgramId") != undefined) {
                    programIdd = localStorage.getItem("sesProgramId");
                }
                if (programIdd != '' && programIdd != undefined) {
                    var proListFiltered = proList.filter(c => c.value == programIdd);
                    if (proListFiltered.length > 0) {
                        var programSelect = { value: programIdd, label: proListFiltered[0].label };
                        this.setState({
                            programSelect: programSelect,
                            programId: programIdd
                        })
                        this.getPlanningUnitList(programSelect);
                    }
                }
            }.bind(this);
        }.bind(this);
    };
    /**
     * This function is used to get list of planning units based on a particular program
     * @param {*} value This is the value of program that is selected by the user
     */
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
            planBasedOn: "",
            aru: "",
            minQtyPpu: "",
            distributionLeadTime: "",
            planningUnitId: ""
        })
        var programId = value != "" && value != undefined ? value.value : 0;
        if (programId != 0) {
            localStorage.setItem("sesProgramId", programId);
            var db1;
            getDatabase();
            var regionList = [];
            var dataSourceListAll = [];
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "#BA0C2F"
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
                        color: "#BA0C2F"
                    })
                    this.hideFirstComponent()
                }.bind(this);
                programRequest.onsuccess = function (e) {
                    var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
                    for (var i = 0; i < programJson.regionList.length; i++) {
                        var regionJson = {
                            name: getLabelText(programJson.regionList[i].label, this.state.lang),
                            id: programJson.regionList[i].regionId,
                            label: programJson.regionList[i].label
                        }
                        regionList.push(regionJson);
                    }
                    var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                    var planningunitRequest = planningunitOs.getAll();
                    var planningList = []
                    planningunitRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext'),
                            loading: false,
                            color: "#BA0C2F"
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    planningunitRequest.onsuccess = function (e) {
                        var paTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                        var paTransaction = paTransaction.objectStore('procurementAgent');
                        var paRequest = paTransaction.getAll();
                        paRequest.onsuccess = function (event) {
                            var fsTransaction = db1.transaction(['fundingSource'], 'readwrite');
                            var fsTransaction = fsTransaction.objectStore('fundingSource');
                            var fsRequest = fsTransaction.getAll();
                            fsRequest.onsuccess = function (event) {
                                var bTransaction = db1.transaction(['budget'], 'readwrite');
                                var bTransaction = bTransaction.objectStore('budget');
                                var bRequest = bTransaction.getAll();
                                bRequest.onsuccess = function (event) {
                                    var programId = (value != "" && value != undefined ? value.value : 0).split("_")[0];
                                    var paResult = paRequest.result;
                                    var procurementAgentListPlan = [];
                                    for (var i = 0; i < paResult.length; i++) {
                                        for (var j = 0; j < paResult[i].programList.length; j++) {
                                            if (paResult[i].programList[j].id == programId) {
                                                procurementAgentListPlan.push(paResult[i]);
                                            }
                                        }
                                    }
                                    var fundingSourceListPlan = fsRequest.result;
                                    var budgetListPlan = bRequest.result.filter(c => [...new Set(c.programs.map(ele => ele.id))].includes(parseInt(programId)));
                                    var myResult = [];
                                    myResult = planningunitRequest.result.filter(c => c.program.id == programId);
                                    var proList = []
                                    for (var i = 0; i < myResult.length; i++) {
                                        if (myResult[i].program.id == programId && myResult[i].active == true) {
                                            var productJson = {
                                                label: getLabelText(myResult[i].planningUnit.label, this.state.lang),
                                                value: myResult[i].planningUnit.id,
                                                actualLabel: myResult[i].label,
                                                multiplier: 1
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
                                            color: "#BA0C2F"
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
                                                color: "#BA0C2F"
                                            })
                                            this.hideFirstComponent()
                                        }.bind(this);
                                        dataSourceRequest.onsuccess = function (event) {
                                            var dataSourceResult = [];
                                            dataSourceResult = dataSourceRequest.result;
                                            for (var k = 0; k < dataSourceResult.length; k++) {
                                                if (dataSourceResult[k].program == null || dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0 && dataSourceResult[k].active == true) {
                                                    if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                                                        dataSourceListAll.push(dataSourceResult[k]);
                                                    }
                                                }
                                            }
                                            var rcpuTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                                            var rcpuOs = rcpuTransaction.objectStore('realmCountryPlanningUnit');
                                            var rcpuRequest = rcpuOs.getAll();
                                            rcpuRequest.onsuccess = function (event) {
                                                var rcpuResult = [];
                                                rcpuResult = rcpuRequest.result;
                                                var aruList = [];
                                                for (var i = 0; i < rcpuResult.length; i++) {
                                                    if (rcpuResult[i].realmCountry.id == programJson.realmCountry.realmCountryId && rcpuResult[i].realmCountryPlanningUnitId != 0 && proList.filter(c => c.value == rcpuResult[i].planningUnit.id).length > 0 && rcpuResult[i].active == true) {
                                                        aruList.push({
                                                            label: getLabelText(rcpuResult[i].label, this.state.lang),
                                                            value: rcpuResult[i].realmCountryPlanningUnitId,
                                                            planningUnitId: rcpuResult[i].planningUnit.id,
                                                            multiplier: rcpuResult[i].multiplier
                                                        })
                                                    }
                                                }
                                                var cutOffDate = programJson.cutOffDate != undefined && programJson.cutOffDate != null && programJson.cutOffDate != "" ? programJson.cutOffDate : moment(Date.now()).add(-10, 'years').format("YYYY-MM-DD");
                                                var startDate = this.state.startDate;
                                                var monthDifference = this.state.monthCount;
                                                if (moment(this.state.startDate.year + "-" + (this.state.startDate.month <= 9 ? "0" + this.state.startDate.month : this.state.startDate.month) + "-01").format("YYYY-MM") < moment(cutOffDate).format("YYYY-MM")) {
                                                    startDate = { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) };
                                                    localStorage.setItem("sesStartDate", JSON.stringify(startDate));
                                                    var date = moment(startDate.year + "-" + startDate.month + "-01").format("YYYY-MM-DD");
                                                    if (startDate.month <= 9) {
                                                        date = moment(startDate.year + "-0" + startDate.month + "-01").format("YYYY-MM-DD");
                                                    }
                                                    var currentDate = moment(Date.now()).startOf('month').format("YYYY-MM-DD");
                                                    monthDifference = moment(new Date(date)).diff(new Date(currentDate), 'months', true) + MONTHS_IN_PAST_FOR_SUPPLY_PLAN;
                                                }
                                                if (localStorage.getItem('inventoryDateForBatch') != "" && localStorage.getItem('inventoryDateForBatch') != undefined) {
                                                    var inventoryDateForBatch = moment(localStorage.getItem('inventoryDateForBatch')).format("YYYY-MM-DD");
                                                    startDate = { year: parseInt(moment(inventoryDateForBatch).format("YYYY")), month: parseInt(moment(inventoryDateForBatch).format("M")) };
                                                    localStorage.setItem("sesStartDate", JSON.stringify(startDate));
                                                    var date = moment(startDate.year + "-" + startDate.month + "-01").format("YYYY-MM-DD");
                                                    if (startDate.month <= 9) {
                                                        date = moment(startDate.year + "-0" + startDate.month + "-01").format("YYYY-MM-DD");
                                                    }
                                                    var currentDate = moment(Date.now()).startOf('month').format("YYYY-MM-DD");
                                                    monthDifference = moment(new Date(date)).diff(new Date(currentDate), 'months', true) + MONTHS_IN_PAST_FOR_SUPPLY_PLAN;
                                                }
                                                this.setState({
                                                    planningUnitList: proList.sort(function (a, b) {
                                                        a = a.label.toLowerCase();
                                                        b = b.label.toLowerCase();
                                                        return a < b ? -1 : a > b ? 1 : 0;
                                                    }),
                                                    procurementAgentListPlan: procurementAgentListPlan.filter(c => c.active.toString() == "true").sort(function (a, b) {
                                                        a = a.procurementAgentCode.toLowerCase();
                                                        b = b.procurementAgentCode.toLowerCase();
                                                        return a < b ? -1 : a > b ? 1 : 0;
                                                    }),
                                                    fundingSourceListPlan: fundingSourceListPlan.filter(c => c.active.toString() == "true").sort(function (a, b) {
                                                        a = a.fundingSourceCode.toLowerCase();
                                                        b = b.fundingSourceCode.toLowerCase();
                                                        return a < b ? -1 : a > b ? 1 : 0;
                                                    }),
                                                    budgetListPlanAll: budgetListPlan.filter(c => c.active.toString() == "true").sort(function (a, b) {
                                                        a = a.budgetCode.toLowerCase();
                                                        b = b.budgetCode.toLowerCase();
                                                        return a < b ? -1 : a > b ? 1 : 0;
                                                    }),
                                                    programPlanningUnitList: myResult,
                                                    planningUnitListAll: myResult,
                                                    aruList: aruList.sort(function (a, b) {
                                                        a = a.label.toLowerCase();
                                                        b = b.label.toLowerCase();
                                                        return a < b ? -1 : a > b ? 1 : 0;
                                                    }),
                                                    regionList: regionList.sort(function (a, b) {
                                                        a = a.name.toLowerCase();
                                                        b = b.name.toLowerCase();
                                                        return a < b ? -1 : a > b ? 1 : 0;
                                                    }),
                                                    generalProgramJson: programJson,
                                                    planningUnitDataList: planningUnitDataList,
                                                    dataSourceListAll: dataSourceListAll,
                                                    realmCountryPlanningUnitListAll: rcpuResult,
                                                    minDate: { year: parseInt(moment(cutOffDate).format("YYYY")), month: parseInt(moment(cutOffDate).format("M")) },
                                                    startDate: startDate,
                                                    monthCount: monthDifference,
                                                    planningUnitListForConsumption: planningUnitListForConsumption,
                                                    loading: false
                                                }, () => {
                                                    var planningUnitIdProp = '';
                                                    if (this.props.match.params.planningUnitId != '' && this.props.match.params.planningUnitId != undefined && proList.filter(c => c.value == this.props.match.params.planningUnitId).length > 0) {
                                                        planningUnitIdProp = this.props.match.params.planningUnitId;
                                                    } else if (localStorage.getItem("sesPlanningUnitId") != '' && localStorage.getItem("sesPlanningUnitId") != undefined && proList.filter(c => c.value == localStorage.getItem("sesPlanningUnitId")).length > 0) {
                                                        planningUnitIdProp = localStorage.getItem("sesPlanningUnitId");
                                                    } else if (proList.length == 1) {
                                                        planningUnitIdProp = proList[0].value;
                                                    }
                                                    if (planningUnitIdProp != '' && planningUnitIdProp != undefined) {
                                                        var planningUnit = proList.filter(c => c.value == planningUnitIdProp).length > 0 ? { value: planningUnitIdProp, label: proList.filter(c => c.value == planningUnitIdProp)[0].label } : { value: "", label: "" };
                                                        var planningUnitDataFilter = this.state.planningUnitDataList.filter(c => c.planningUnitId == planningUnitIdProp);
                                                        var programJson = {};
                                                        if (planningUnitDataFilter.length > 0) {
                                                            var planningUnitData = planningUnitDataFilter[0]
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
                                                        var actualProgramId = this.state.programList.filter(c => c.value == document.getElementById("programId").value)[0].programId;
                                                        var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.program.id == actualProgramId && p.planningUnit.id == planningUnitIdProp))[0];
                                                        this.setState({
                                                            planningUnit: planningUnit,
                                                            planningUnitId: planningUnitIdProp,
                                                            programJson: programJson,
                                                            planBasedOn: programPlanningUnit.planBasedOn,
                                                            minQtyPpu: roundARU(programPlanningUnit.minQty, this.state.multiplier),
                                                            distributionLeadTime: programPlanningUnit.distributionLeadTime
                                                        })
                                                        this.formSubmit(planningUnit, this.state.monthCount);
                                                    }
                                                })
                                            }.bind(this);
                                        }.bind(this);
                                    }.bind(this);
                                }.bind(this);
                            }.bind(this)
                        }.bind(this)
                    }.bind(this);
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                loading: false,
                planningUnitList: [],
                aruList: []
            })
        }
    }
    /**
     * This function is used to generate a month array based on the date that user has selected
     * @param {*} currentDate This is the value of the date that user has selected
     * @returns This function returns the month array
     */
    getMonthArray(currentDate) {
        var month = [];
        var curDate = currentDate.subtract(MONTHS_IN_PAST_FOR_SUPPLY_PLAN, 'months');
        var cutOffDate = this.state.generalProgramJson.cutOffDate != undefined && this.state.generalProgramJson.cutOffDate != null && this.state.generalProgramJson.cutOffDate != "" ? this.state.generalProgramJson.cutOffDate : moment(Date.now()).add(-10, 'years').format("YYYY-MM-DD");
        if (moment(curDate).format("YYYY-MM") <= moment(cutOffDate).format("YYYY-MM")) {
            setTimeout(function () {
                document.getElementsByClassName("supplyplan-larrow")[0].style.display = "none";
                [...document.getElementsByClassName("supplyplan-larrow")].map(item => {
                    item.style.display = "none";
                });
                [...document.getElementsByClassName("supplyplan-larrow-dataentry")].map(item => {
                    item.style.display = "none";
                })
            }, 500);
            curDate = moment(cutOffDate);
            if (moment(curDate).format("YYYY-MM") <= moment(cutOffDate).format("YYYY-MM")) {
                currentDate = moment(cutOffDate);
            }
        } else {
            setTimeout(function () {
                [...document.getElementsByClassName("supplyplan-larrow")].map(item => {
                    item.style.display = "block";
                });
                [...document.getElementsByClassName("supplyplan-larrow-dataentry")].map(item => {
                    item.style.display = "block";
                })
            }, 500);
        }
        this.setState({ startDate: { year: parseInt(moment(curDate).format('YYYY')), month: parseInt(moment(curDate).format('M')) } })
        localStorage.setItem("sesStartDate", JSON.stringify({ year: parseInt(moment(curDate).format('YYYY')), month: parseInt(moment(curDate).format('M')) }));
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
    /**
     * This function is used to build all the data that is required for supply planning
     * @param {*} value This is the value of the planning unit
     * @param {*} monthCount This is value in terms of number for the month that user has clicked on or has selected
     */
    formSubmit(value, monthCount, doNotShowLoader) {
        if (value != "" && value != undefined ? value.value : 0 != 0) {
            this.setState({
                planningUnitChange: true,
                display: 'block',
                loading: doNotShowLoader == 1 ? false : true
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
        var actualProgramId = this.state.programList.filter(c => c.value == document.getElementById("programId").value)[0].programId;
        var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.program.id == actualProgramId && p.planningUnit.id == planningUnitId))[0];
        var regionListFiltered = this.state.regionList;
        var consumptionTotalData = [];
        var shipmentsTotalData = [];
        var deliveredShipmentsTotalData = [];
        var shippedShipmentsTotalData = [];
        var orderedShipmentsTotalData = [];
        var plannedShipmentsTotalData = [];
        var onholdShipmentsTotalData = [];
        var totalExpiredStockArr = [];
        var amcTotalData = [];
        var minStockMoS = [];
        var maxStockMoS = [];
        var inventoryTotalData = [];
        var adjustmentTotalData = [];
        var nationalAdjustmentTotalData = [];
        var suggestedShipmentsTotalData = [];
        var openingBalanceArray = [];
        var closingBalanceArray = [];
        var jsonArrForGraph = [];
        var monthsOfStockArray = [];
        var maxQtyArray = [];
        var unmetDemand = [];
        var consumptionArrayForRegion = [];
        var inventoryArrayForRegion = [];
        var paColors = []
        var lastActualConsumptionDate = [];
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "#BA0C2F"
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programJson = this.state.programJson;
            var generalProgramJson = this.state.generalProgramJson;
            var realmTransaction = db1.transaction(['realm'], 'readwrite');
            var realmOs = realmTransaction.objectStore('realm');
            var realmRequest = realmOs.get(generalProgramJson.realmCountry.realm.realmId);
            realmRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "#BA0C2F"
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
                    versionId: generalProgramJson.currentVersion.versionId,
                    monthsInPastForAMC: programPlanningUnit.monthsInPastForAmc,
                    monthsInFutureForAMC: programPlanningUnit.monthsInFutureForAmc,
                    reorderFrequency: programPlanningUnit.reorderFrequencyInMonths,
                    minMonthsOfStock: programPlanningUnit.minMonthsOfStock,
                    minStockMoSQty: minStockMoSQty,
                    maxStockMoSQty: maxStockMoSQty,
                    planningUnitNotes: programPlanningUnit.notes
                })
                var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
                var shipmentStatusRequest = shipmentStatusOs.getAll();
                shipmentStatusRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext'),
                        loading: false,
                        color: "#BA0C2F"
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
                            color: "#BA0C2F"
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    papuRequest.onsuccess = function (event) {
                        var papuResult = [];
                        papuResult = papuRequest.result;
                        var supplyPlanData = [];
                        if (programJson.supplyPlan != undefined) {
                            supplyPlanData = (programJson.supplyPlan).filter(c => c.planningUnitId == planningUnitId);
                        }
                        this.setState({
                            supplyPlanDataForAllTransDate: supplyPlanData,
                            allShipmentsList: programJson.shipmentList
                        })
                        var lastClosingBalance = 0;
                        var lastBatchDetails = [];
                        var lastIsActualClosingBalance = 0;
                        for (var n = 0; n < m.length; n++) {
                            var jsonList = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(m[n].startDate).format("YYYY-MM-DD"));
                            var prevMonthJsonList = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(m[n].startDate).subtract(1, 'months').format("YYYY-MM-DD"));
                            if (jsonList.length > 0) {
                                openingBalanceArray.push({ isActual: prevMonthJsonList.length > 0 && prevMonthJsonList[0].regionCountForStock == prevMonthJsonList[0].regionCount ? 1 : 0, balance: roundARU(jsonList[0].openingBalance, this.state.multiplier) });
                                consumptionTotalData.push({ consumptionQty: roundARU(jsonList[0].consumptionQty, this.state.multiplier), consumptionType: jsonList[0].actualFlag, textColor: jsonList[0].actualFlag == 1 ? "#000000" : "rgb(170, 85, 161)" });
                                var shipmentDetails = programJson.shipmentList.filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true && (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? (c.receivedDate >= m[n].startDate && c.receivedDate <= m[n].endDate) : (c.expectedDeliveryDate >= m[n].startDate && c.expectedDeliveryDate <= m[n].endDate))
                                );
                                shipmentsTotalData.push(shipmentDetails.length > 0 ? roundARU(jsonList[0].shipmentTotalQty, this.state.multiplier) : "");
                                var sd1 = [];
                                var sd2 = [];
                                var sd3 = [];
                                var sd4 = [];
                                var sd5 = [];
                                var paColor1 = "";
                                var paColor2 = "";
                                var paColor3 = "";
                                var paColor4 = "";
                                var paColor5 = "";
                                var paColor1Array = [];
                                var paColor2Array = [];
                                var paColor3Array = [];
                                var paColor4Array = [];
                                var paColor5Array = [];
                                var isEmergencyOrder1 = 0;
                                var isEmergencyOrder2 = 0;
                                var isEmergencyOrder3 = 0;
                                var isEmergencyOrder4 = 0;
                                var isEmergencyOrder5 = 0;
                                var isLocalProcurementAgent1 = 0;
                                var isLocalProcurementAgent2 = 0;
                                var isLocalProcurementAgent3 = 0;
                                var isLocalProcurementAgent4 = 0;
                                var isLocalProcurementAgent5 = 0;
                                var isErp1 = 0;
                                var isErp2 = 0;
                                var isErp3 = 0;
                                var isErp4 = 0;
                                var isErp5 = 0;
                                if (shipmentDetails != "" && shipmentDetails != undefined) {
                                    for (var i = 0; i < shipmentDetails.length; i++) {
                                        if (shipmentDetails[i].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                            if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                paColor1 = this.state.theme == "Dark" ? procurementAgent.colorHtmlDarkCode : procurementAgent.colorHtmlCode;
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
                                            if (shipmentDetails[i].erpFlag.toString() == "true") {
                                                isErp1 = true;
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
                                                paColor2 = this.state.theme == "Dark" ? procurementAgent.colorHtmlDarkCode : procurementAgent.colorHtmlCode;
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
                                            sd2.push(shipmentDetail);
                                            if (paColor2Array.indexOf(paColor2) === -1) {
                                                paColor2Array.push(paColor2);
                                            }
                                            if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                isEmergencyOrder2 = true
                                            }
                                            if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                isLocalProcurementAgent2 = true;
                                            }
                                            if (shipmentDetails[i].erpFlag.toString() == "true") {
                                                isErp2 = true;
                                            }
                                        } else if (shipmentDetails[i].shipmentStatus.id == APPROVED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                            if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                paColor3 = this.state.theme == "Dark" ? procurementAgent.colorHtmlDarkCode : procurementAgent.colorHtmlCode;
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
                                            sd3.push(shipmentDetail);
                                            if (paColor3Array.indexOf(paColor3) === -1) {
                                                paColor3Array.push(paColor3);
                                            }
                                            if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                isEmergencyOrder3 = true
                                            }
                                            if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                isLocalProcurementAgent3 = true;
                                            }
                                            if (shipmentDetails[i].erpFlag.toString() == "true") {
                                                isErp3 = true;
                                            }
                                        } else if (shipmentDetails[i].shipmentStatus.id == PLANNED_SHIPMENT_STATUS) {
                                            if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                paColor4 = this.state.theme == "Dark" ? procurementAgent.colorHtmlDarkCode : procurementAgent.colorHtmlCode;
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
                                            sd4.push(shipmentDetail);
                                            if (paColor4Array.indexOf(paColor4) === -1) {
                                                paColor4Array.push(paColor4);
                                            }
                                            if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                isEmergencyOrder4 = true
                                            }
                                            if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                isLocalProcurementAgent4 = true;
                                            }
                                            if (shipmentDetails[i].erpFlag.toString() == "true") {
                                                isErp4 = true;
                                            }
                                        } else if (shipmentDetails[i].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                                            if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                paColor5 = this.state.theme == "Dark" ? procurementAgent.colorHtmlDarkCode : procurementAgent.colorHtmlCode;
                                                var index = paColors.findIndex(c => c.color == paColor5);
                                                if (index == -1) {
                                                    paColors.push({ color: paColor5, text: procurementAgent.procurementAgentCode })
                                                }
                                            } else {
                                                if (shipmentDetails[i].procurementAgent.id != "") {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor5 = "#efefef"
                                                } else {
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                    var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                    paColor5 = "#efefef"
                                                }
                                            }
                                            sd5.push(shipmentDetail);
                                            if (paColor5Array.indexOf(paColor5) === -1) {
                                                paColor5Array.push(paColor5);
                                            }
                                            if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                isEmergencyOrder5 = true
                                            }
                                            if (shipmentDetails[i].localProcurement.toString() == "true") {
                                                isLocalProcurementAgent5 = true;
                                            }
                                            if (shipmentDetails[i].erpFlag.toString() == "true") {
                                                isErp5 = true;
                                            }
                                        }

                                    }
                                }
                                if ((shipmentDetails.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                                    var colour = paColor1;
                                    if (paColor1Array.length > 1) {
                                        colour = "#d9ead3";
                                    }
                                    deliveredShipmentsTotalData.push({ qty: roundARU(Number(jsonList[0].receivedShipmentsTotalData) + Number(jsonList[0].receivedErpShipmentsTotalData), this.state.multiplier), month: m[n], shipmentDetail: sd1, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder1, isLocalProcurementAgent: isLocalProcurementAgent1, isErp: isErp1 });
                                } else {
                                    deliveredShipmentsTotalData.push("")
                                }
                                if ((shipmentDetails.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                    var colour = paColor2;
                                    if (paColor2Array.length > 1) {
                                        colour = "#d9ead3";
                                    }
                                    shippedShipmentsTotalData.push({ qty: roundARU(Number(jsonList[0].shippedShipmentsTotalData) + Number(jsonList[0].shippedErpShipmentsTotalData), this.state.multiplier), month: m[n], shipmentDetail: sd2, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder2, isLocalProcurementAgent: isLocalProcurementAgent2, isErp: isErp2 });
                                } else {
                                    shippedShipmentsTotalData.push("")
                                }
                                if ((shipmentDetails.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                    var colour = paColor3;
                                    if (paColor3Array.length > 1) {
                                        colour = "#d9ead3";
                                    }
                                    orderedShipmentsTotalData.push({ qty: roundARU(Number(jsonList[0].approvedShipmentsTotalData) + Number(jsonList[0].submittedShipmentsTotalData) + Number(jsonList[0].approvedErpShipmentsTotalData) + Number(jsonList[0].submittedErpShipmentsTotalData), this.state.multiplier), month: m[n], shipmentDetail: sd3, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder3, isLocalProcurementAgent: isLocalProcurementAgent3, isErp: isErp3 });
                                } else {
                                    orderedShipmentsTotalData.push("")
                                }
                                if ((shipmentDetails.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS)).length > 0) {
                                    var colour = paColor4;
                                    if (paColor4Array.length > 1) {
                                        colour = "#d9ead3";
                                    }
                                    plannedShipmentsTotalData.push({ qty: roundARU(Number(jsonList[0].plannedShipmentsTotalData) + Number(jsonList[0].plannedErpShipmentsTotalData), this.state.multiplier), month: m[n], shipmentDetail: sd4, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder4, isLocalProcurementAgent: isLocalProcurementAgent4, isErp: isErp4 });
                                } else {
                                    plannedShipmentsTotalData.push("")
                                }
                                if ((shipmentDetails.filter(c => c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)).length > 0) {
                                    var colour = paColor5;
                                    if (paColor5Array.length > 1) {
                                        colour = "#d9ead3";
                                    }
                                    onholdShipmentsTotalData.push({ qty: roundARU(Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].onholdErpShipmentsTotalData), this.state.multiplier), month: m[n], shipmentDetail: sd5, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder5, isLocalProcurementAgent: isLocalProcurementAgent5, isErp: isErp5 });
                                } else {
                                    onholdShipmentsTotalData.push("")
                                }
                                totalExpiredStockArr.push({ qty: roundARU(jsonList[0].expiredStock, this.state.multiplier), details: jsonList[0].batchDetails.filter(c => moment(c.expiryDate).format("YYYY-MM-DD") >= m[n].startDate && moment(c.expiryDate).format("YYYY-MM-DD") <= m[n].endDate), month: m[n] });
                                monthsOfStockArray.push(jsonList[0].mos != null ? jsonList[0].mos : jsonList[0].mos);
                                maxQtyArray.push(roundAMC(jsonList[0].maxStock !== "" && jsonList[0].maxStock != undefined ? Number(jsonList[0].maxStock) / Number(this.state.multiplier) : jsonList[0].maxStock))
                                amcTotalData.push(jsonList[0].amc != null ? roundAMC(jsonList[0].amc != "" && jsonList[0].amc != undefined ? Number(jsonList[0].amc) / Number(this.state.multiplier) : Number(jsonList[0].amc)) : "");
                                minStockMoS.push(jsonList[0].minStockMoS)
                                maxStockMoS.push(jsonList[0].maxStockMoS)
                                unmetDemand.push(jsonList[0].unmetDemand == 0 ? "" : roundARU(jsonList[0].unmetDemand, this.state.multiplier));
                                closingBalanceArray.push({ isActual: jsonList[0].regionCountForStock == jsonList[0].regionCount ? 1 : 0, balance: roundARU(jsonList[0].closingBalance, this.state.multiplier), balanceWithoutRounding: Number(Number(jsonList[0].closingBalance) * Number(this.state.multiplier)).toFixed(8), batchInfoList: jsonList[0].batchDetails })
                                lastClosingBalance = jsonList[0].closingBalance;
                                lastBatchDetails = jsonList[0].batchDetails
                                lastIsActualClosingBalance = jsonList[0].regionCountForStock == jsonList[0].regionCount ? 1 : 0;
                                var sstd = {}
                                if (this.state.planBasedOn == 1) {
                                    var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                    var compare = (m[n].startDate >= currentMonth);
                                    var amc = Number(jsonList[0].amc);
                                    var spd1 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).format("YYYY-MM"));
                                    var spd2 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(1, 'months').format("YYYY-MM"));
                                    var spd3 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(2, 'months').format("YYYY-MM"));
                                    var mosForMonth1 = spd1.length > 0 ? spd1[0].mos != null ? parseFloat(spd1[0].mos).toFixed(1) : null : 0;
                                    var mosForMonth2 = spd2.length > 0 ? spd2[0].mos != null ? parseFloat(spd2[0].mos).toFixed(1) : null : 0;
                                    var mosForMonth3 = spd3.length > 0 ? spd3[0].mos != null ? parseFloat(spd3[0].mos).toFixed(1) : null : 0;
                                    var suggestShipment = false;
                                    var useMax = false;
                                    if (compare) {
                                        if (Number(amc) == 0) {
                                            suggestShipment = false;
                                        } else if (Number(mosForMonth1) != 0 && Number(mosForMonth1) < Number(minStockMoSQty) && (Number(mosForMonth2) > Number(minStockMoSQty) || Number(mosForMonth3) > Number(minStockMoSQty))) {
                                            suggestShipment = false;
                                        } else if (Number(mosForMonth1) != 0 && Number(mosForMonth1) < Number(minStockMoSQty) && Number(mosForMonth2) < Number(minStockMoSQty) && Number(mosForMonth3) < Number(minStockMoSQty)) {
                                            suggestShipment = true;
                                            useMax = true;
                                        } else if (Number(mosForMonth1) == 0) {
                                            suggestShipment = true;
                                            if (Number(mosForMonth2) < Number(minStockMoSQty) && Number(mosForMonth3) < Number(minStockMoSQty)) {
                                                useMax = true;
                                            } else {
                                                useMax = false;
                                            }
                                        }
                                    } else {
                                        suggestShipment = false;
                                    }
                                    var addLeadTimes = parseFloat(generalProgramJson.plannedToSubmittedLeadTime) + parseFloat(generalProgramJson.submittedToApprovedLeadTime) +
                                        parseFloat(generalProgramJson.approvedToShippedLeadTime) + parseFloat(generalProgramJson.shippedToArrivedBySeaLeadTime) +
                                        parseFloat(generalProgramJson.arrivedToDeliveredLeadTime);
                                    var expectedDeliveryDate = moment(m[n].startDate).subtract(Number(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                    var isEmergencyOrder = 0;
                                    if (expectedDeliveryDate >= currentMonth) {
                                        isEmergencyOrder = 0;
                                    } else {
                                        isEmergencyOrder = 1;
                                    }
                                    if (suggestShipment) {
                                        var suggestedOrd = 0;
                                        if (useMax) {
                                            suggestedOrd = Number(Math.round(amc * Number(maxStockMoSQty)) - Number(jsonList[0].closingBalance) + Number(jsonList[0].unmetDemand));
                                        } else {
                                            suggestedOrd = Number(Math.round(amc * Number(minStockMoSQty)) - Number(jsonList[0].closingBalance) + Number(jsonList[0].unmetDemand));
                                        }
                                        if (suggestedOrd <= 0) {
                                            sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) };
                                        } else {
                                            sstd = { "suggestedOrderQty": roundARU(suggestedOrd, this.state.multiplier), "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) + Number(suggestedOrd) };
                                        }
                                    } else {
                                        sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) };
                                    }
                                    suggestedShipmentsTotalData.push(sstd);
                                } else {
                                    var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                    var compare = (m[n].startDate >= currentMonth);
                                    var spd1 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(this.state.distributionLeadTime, 'months').format("YYYY-MM"));
                                    var spd2 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(1 + this.state.distributionLeadTime, 'months').format("YYYY-MM"));
                                    var spd3 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(2 + this.state.distributionLeadTime, 'months').format("YYYY-MM"));
                                    var amc = spd1.length > 0 ? Number(spd1[0].amc) : 0;
                                    var mosForMonth1 = spd1.length > 0 ? spd1[0].mos != null ? parseFloat(spd1[0].mos).toFixed(1) : null : 0;
                                    var mosForMonth2 = spd2.length > 0 ? spd2[0].mos != null ? parseFloat(spd2[0].mos).toFixed(1) : null : 0;
                                    var mosForMonth3 = spd3.length > 0 ? spd3[0].mos != null ? parseFloat(spd3[0].mos).toFixed(1) : null : 0;
                                    var cbForMonth1 = spd1.length > 0 ? spd1[0].closingBalance : 0;
                                    var cbForMonth2 = spd2.length > 0 ? spd2[0].closingBalance : 0;
                                    var cbForMonth3 = spd3.length > 0 ? spd3[0].closingBalance : 0;
                                    var unmetDemandForMonth1 = spd1.length > 0 ? spd1[0].unmetDemand : 0;
                                    var maxStockForMonth1 = spd1.length > 0 ? spd1[0].maxStock : 0;
                                    var minStockForMonth1 = spd1.length > 0 ? spd1[0].minStock : 0;
                                    var suggestShipment = false;
                                    var useMax = false;
                                    if (compare) {
                                        if (Number(amc) == 0) {
                                            suggestShipment = false;
                                        } else if (Number(cbForMonth1) != 0 && Number(cbForMonth1) < Number(this.state.minQtyPpu) && (Number(cbForMonth2) > Number(this.state.minQtyPpu) || Number(cbForMonth3) > Number(this.state.minQtyPpu))) {
                                            suggestShipment = false;
                                        } else if (Number(cbForMonth1) != 0 && Number(cbForMonth1) < Number(this.state.minQtyPpu) && Number(cbForMonth2) < Number(this.state.minQtyPpu) && Number(cbForMonth3) < Number(this.state.minQtyPpu)) {
                                            suggestShipment = true;
                                            useMax = true;
                                        } else if (Number(cbForMonth1) == 0) {
                                            suggestShipment = true;
                                            if (Number(cbForMonth2) < Number(this.state.minQtyPpu) && Number(cbForMonth3) < Number(this.state.minQtyPpu)) {
                                                useMax = true;
                                            } else {
                                                useMax = false;
                                            }
                                        }
                                    } else {
                                        suggestShipment = false;
                                    }
                                    var addLeadTimes = parseFloat(generalProgramJson.plannedToSubmittedLeadTime) + parseFloat(generalProgramJson.submittedToApprovedLeadTime) +
                                        parseFloat(generalProgramJson.approvedToShippedLeadTime) + parseFloat(generalProgramJson.shippedToArrivedBySeaLeadTime) +
                                        parseFloat(generalProgramJson.arrivedToDeliveredLeadTime);
                                    var expectedDeliveryDate = moment(m[n].startDate).subtract(Number(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                    var isEmergencyOrder = 0;
                                    if (expectedDeliveryDate >= currentMonth) {
                                        isEmergencyOrder = 0;
                                    } else {
                                        isEmergencyOrder = 1;
                                    }
                                    if (suggestShipment) {
                                        var suggestedOrd = 0;
                                        if (useMax) {
                                            suggestedOrd = Number(Math.round(Number(maxStockForMonth1)) - Number(cbForMonth1) + Number(unmetDemandForMonth1));
                                        } else {
                                            suggestedOrd = Number(Math.round(Number(minStockForMonth1)) - Number(cbForMonth1) + Number(unmetDemandForMonth1));
                                        }
                                        if (suggestedOrd <= 0) {
                                            sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) };
                                        } else {
                                            sstd = { "suggestedOrderQty": roundARU(suggestedOrd, this.state.multiplier), "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) + Number(suggestedOrd) };
                                        }
                                    } else {
                                        sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) };
                                    }
                                    suggestedShipmentsTotalData.push(sstd);
                                }
                                var consumptionListForRegion = (programJson.consumptionList).filter(c => (c.consumptionDate >= m[n].startDate && c.consumptionDate <= m[n].endDate) && c.planningUnit.id == planningUnitId && c.active == true);
                                var inventoryListForRegion = (programJson.inventoryList).filter(c => (c.inventoryDate >= m[n].startDate && c.inventoryDate <= m[n].endDate) && c.planningUnit.id == planningUnitId && c.active == true);
                                var adjustmentCount = 0;
                                var adjustmentTotal = 0;
                                inventoryListForRegion.map(item => {
                                    if (item.adjustmentQty != undefined && item.adjustmentQty != null && item.adjustmentQty !== "") {
                                        adjustmentCount += 1;
                                        adjustmentTotal += Number((Math.round(item.adjustmentQty) * parseFloat(item.multiplier)))
                                    }
                                })
                                adjustmentTotalData.push(adjustmentCount > 0 ? roundARU(Number(adjustmentTotal), this.state.multiplier) : "");
                                nationalAdjustmentTotalData.push(jsonList[0].regionCountForStock > 0 && roundARU(jsonList[0].nationalAdjustment, this.state.multiplier) != 0 && jsonList[0].nationalAdjustment != "" && jsonList[0].nationalAdjustment != null ? roundARU(Number(jsonList[0].nationalAdjustment), this.state.multiplier) : "");
                                inventoryTotalData.push((adjustmentCount > 0 || (jsonList[0].regionCountForStock > 0 && roundARU(jsonList[0].nationalAdjustment, this.state.multiplier) != 0 && jsonList[0].nationalAdjustment != "" && jsonList[0].nationalAdjustment != null)) ? roundARU(Number(adjustmentCount > 0 ? Number(roundARU(Number(adjustmentTotal), this.state.multiplier)) : 0) + Number(jsonList[0].regionCountForStock > 0 ? Number(roundARU(Number(jsonList[0].nationalAdjustment), this.state.multiplier)) : 0), 1) : "");
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
                                                consumptionQtyForRegion += (Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
                                                consumptionTotalForRegion += (Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
                                            }
                                            actualFlagForRegion = true;
                                        } else {
                                            consumptionQtyForRegion += (Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
                                            consumptionTotalForRegion += (Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
                                            actualFlagForRegion = false;
                                        }
                                    }
                                    if (consumptionListForRegionalDetails.length == 0) {
                                        consumptionQtyForRegion = "";
                                    }
                                    consumptionArrayForRegion.push({ "regionId": regionListFiltered[r].id, "qty": roundARU(consumptionQtyForRegion, this.state.multiplier), "actualFlag": actualFlagForRegion, "month": m[n] })
                                    var adjustmentsQtyForRegion = 0;
                                    var actualQtyForRegion = 0;
                                    var inventoryListForRegionalDetails = inventoryListForRegion.filter(c => c.region != null && c.region.id != 0 && c.region.id == regionListFiltered[r].id);
                                    var actualCount = 0;
                                    var adjustmentsCount = 0;
                                    for (var cr = 0; cr < inventoryListForRegionalDetails.length; cr++) {
                                        if (inventoryListForRegionalDetails[cr].actualQty != undefined && inventoryListForRegionalDetails[cr].actualQty != null && inventoryListForRegionalDetails[cr].actualQty !== "") {
                                            actualCount += 1;
                                            actualQtyForRegion += (Math.round(inventoryListForRegionalDetails[cr].actualQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
                                            totalActualQtyForRegion += (Math.round(inventoryListForRegionalDetails[cr].actualQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
                                            var index = regionsReportingActualInventory.findIndex(c => c == regionListFiltered[r].id);
                                            if (index == -1) {
                                                regionsReportingActualInventory.push(regionListFiltered[r].id)
                                            }
                                        }
                                        if (inventoryListForRegionalDetails[cr].adjustmentQty != undefined && inventoryListForRegionalDetails[cr].adjustmentQty != null && inventoryListForRegionalDetails[cr].adjustmentQty !== "") {
                                            adjustmentsCount += 1;
                                            adjustmentsQtyForRegion += (Math.round(inventoryListForRegionalDetails[cr].adjustmentQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
                                            totalAdjustmentsQtyForRegion += (Math.round(inventoryListForRegionalDetails[cr].adjustmentQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
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
                                consumptionArrayForRegion.push({ "regionId": -1, "qty": roundARU(consumptionTotalForRegion, this.state.multiplier), "actualFlag": true, "month": m[n] })
                                var projectedInventoryForRegion = jsonList[0].closingBalance - (jsonList[0].nationalAdjustment != "" ? jsonList[0].nationalAdjustment : 0) - (jsonList[0].unmetDemand != "" && jsonList[0].unmetDemand != null ? jsonList[0].unmetDemand : 0);
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
                                    month: m[n].monthName.concat(" ").concat(m[n].monthYear),
                                    consumption: roundARU(jsonList[0].consumptionQty, this.state.multiplier),
                                    stock: roundARU(jsonList[0].closingBalance, this.state.multiplier),
                                    planned: Number(plannedShipmentsTotalData[n] != "" ? plannedShipmentsTotalData[n].qty : 0)
                                    ,
                                    onhold: Number(onholdShipmentsTotalData[n] != "" ? onholdShipmentsTotalData[n].qty : 0)
                                    ,
                                    delivered: Number(deliveredShipmentsTotalData[n] != "" ? deliveredShipmentsTotalData[n].qty : 0)
                                    ,
                                    shipped: Number(shippedShipmentsTotalData[n] != "" ? shippedShipmentsTotalData[n].qty : 0)
                                    ,
                                    ordered: Number(orderedShipmentsTotalData[n] != "" ? orderedShipmentsTotalData[n].qty : 0)
                                    ,
                                    mos: jsonList[0].mos != null ? parseFloat(jsonList[0].mos).toFixed(1) : jsonList[0].mos,
                                    minMos: minStockMoSQty,
                                    maxMos: maxStockMoSQty,
                                    minQty: roundAMC(jsonList[0].minStock != "" && jsonList[0].minStock != undefined ? Number(jsonList[0].minStock) / Number(this.state.multiplier) : jsonList[0].minStock),
                                    maxQty: roundAMC(jsonList[0].maxStock != "" && jsonList[0].maxStock != undefined ? Number(jsonList[0].maxStock) / Number(this.state.multiplier) : jsonList[0].maxStock),
                                    planBasedOn: programPlanningUnit.planBasedOn
                                }
                                jsonArrForGraph.push(json);
                            } else {
                                openingBalanceArray.push({ isActual: lastIsActualClosingBalance, balance: roundARU(lastClosingBalance, this.state.multiplier) });
                                consumptionTotalData.push({ consumptionQty: "", consumptionType: "", textColor: "" });
                                shipmentsTotalData.push("");
                                suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": moment(m[n].startDate).format("YYYY-MM-DD"), "isEmergencyOrder": 0 });
                                deliveredShipmentsTotalData.push("");
                                shippedShipmentsTotalData.push("");
                                orderedShipmentsTotalData.push("");
                                plannedShipmentsTotalData.push("");
                                onholdShipmentsTotalData.push("");
                                inventoryTotalData.push("");
                                adjustmentTotalData.push("");
                                nationalAdjustmentTotalData.push("");
                                totalExpiredStockArr.push({ qty: 0, details: [], month: m[n] });
                                monthsOfStockArray.push(null)
                                maxQtyArray.push(null)
                                amcTotalData.push("");
                                minStockMoS.push(minStockMoSQty);
                                maxStockMoS.push(maxStockMoSQty);
                                unmetDemand.push("");
                                closingBalanceArray.push({ isActual: 0, balance: roundARU(lastClosingBalance, this.state.multiplier), balanceWithoutRounding: Number(Number(lastClosingBalance) * Number(this.state.multiplier)).toFixed(8), batchInfoList: lastBatchDetails });
                                for (var i = 0; i < this.state.regionListFiltered.length; i++) {
                                    consumptionArrayForRegion.push({ "regionId": regionListFiltered[i].id, "qty": "", "actualFlag": "", "month": m[n] })
                                    inventoryArrayForRegion.push({ "regionId": regionListFiltered[i].id, "adjustmentsQty": "", "actualQty": "", "finalInventory": lastClosingBalance, "autoAdjustments": "", "projectedInventory": lastClosingBalance, "month": m[n] });
                                }
                                consumptionArrayForRegion.push({ "regionId": -1, "qty": "", "actualFlag": "", "month": m[n] })
                                inventoryArrayForRegion.push({ "regionId": -1, "adjustmentsQty": "", "actualQty": i18n.t('static.supplyPlan.notAllRegionsHaveActualStock'), "finalInventory": lastClosingBalance, "autoAdjustments": "", "projectedInventory": lastClosingBalance, "month": m[n] });
                                lastActualConsumptionDate.push("");
                                var json = {
                                    month: m[n].monthName.concat(" ").concat(m[n].monthYear),
                                    consumption: null,
                                    stock: roundARU(lastClosingBalance, this.state.multiplier),
                                    planned: 0,
                                    onhold: 0,
                                    delivered: 0,
                                    shipped: 0,
                                    ordered: 0,
                                    mos: "",
                                    minMos: minStockMoSQty,
                                    maxMos: maxStockMoSQty,
                                    minQty: 0,
                                    maxQty: 0,
                                    planBasedOn: programPlanningUnit.planBasedOn
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
                            deliveredShipmentsTotalData: deliveredShipmentsTotalData,
                            shippedShipmentsTotalData: shippedShipmentsTotalData,
                            orderedShipmentsTotalData: orderedShipmentsTotalData,
                            plannedShipmentsTotalData: plannedShipmentsTotalData,
                            onholdShipmentsTotalData: onholdShipmentsTotalData,
                            inventoryTotalData: inventoryTotalData,
                            adjustmentTotalData: adjustmentTotalData,
                            nationalAdjustmentTotalData: nationalAdjustmentTotalData,
                            monthsOfStockArray: monthsOfStockArray,
                            maxQtyArray: maxQtyArray,
                            amcTotalData: amcTotalData,
                            minStockMoS: minStockMoS,
                            maxStockMoS: maxStockMoS,
                            unmetDemand: unmetDemand,
                            inventoryFilteredArray: inventoryArrayForRegion,
                            regionListFiltered: regionListFiltered,
                            consumptionFilteredArray: consumptionArrayForRegion,
                            planningUnitName: planningUnitName,
                            lastActualConsumptionDate: moment(Date.now()).format("YYYY-MM-DD"),
                            lastActualConsumptionDateArr: lastActualConsumptionDate,
                            paColors: paColors,
                            jsonArrForGraph: jsonArrForGraph,
                            closingBalanceArray: closingBalanceArray,
                            loading: false
                        })
                        if (localStorage.getItem("batchNo") != '' && localStorage.getItem("expiryDate") != '') {
                            this.showShipmentWithBatch(localStorage.getItem("batchNo"), localStorage.getItem("expiryDate"));
                        }
                        if (localStorage.getItem('inventoryDateForBatch') != "" && localStorage.getItem('inventoryDateForBatch') != undefined) {
                            this.showInventoryForThatMonth();
                        }
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }
    showInventoryForThatMonth() {
        localStorage.setItem('inventoryDateForBatch', '');
        this.toggleLarge('Adjustments', '', '', '', '', '', '', 0);
        this.toggleInventoryActualBatchInfo(this.state.closingBalanceArray[0].batchInfoList, this.state.closingBalanceArray[0].isActual, 2, 1);
    }
    /**
     * This function is used to toggle the different modals for consumption, inventory, suggested shipments,shipments, Expired stock
     * @param {*} supplyPlanType This values indicates which popup needs to be displayed
     * @param {*} month This value indicates from which month the data shpuld be displayed in the popup
     * @param {*} quantity This value is the suggested shipment quantity
     * @param {*} startDate This value is the start date for the suggested shipment/Shipment
     * @param {*} endDate This value is the end date for the suggested shipment/Shipment
     * @param {*} isEmergencyOrder This value indicates if the particular suggested shipment is emergency order or not
     * @param {*} shipmentType This is type of the shipment that is clicked
     * @param {*} count This is the month number for which popup needs to be displayed
     */
    toggleLarge(supplyPlanType, month, quantity, startDate, endDate, isEmergencyOrder, shipmentType, count) {
        var cont = false;
        if (this.state.consumptionChangedFlag == 1 || this.state.inventoryChangedFlag == 1 || this.state.suggestedShipmentChangedFlag == 1 || this.state.shipmentChangedFlag == 1 || this.state.actualInventoryChanged) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            if(supplyPlanType!='shipments'){
                this.setState({
                    batchInfoInInventoryPopUp: [],
                    actualInventoryChanged:false,
                    actualInventoryBatchTotalNotMatching:"",
                    ledgerForBatch:[]
                })
            }
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
                showShipments: 0,
                showInventory: 0,
                showConsumption: 0
            })
            if (supplyPlanType == 'Consumption') {
                var monthCountConsumption = count != undefined ? this.state.monthCount + count - 2 : this.state.monthCount;
                this.setState({
                    consumption: !this.state.consumption,
                    monthCountConsumption: monthCountConsumption,
                    consumptionStartDateClicked: count != undefined ? this.state.monthsArray[count].startDate : moment(Date.now()).startOf('month').format("YYYY-MM-DD")
                }, () => {
                    this.formSubmit(this.state.planningUnit, monthCountConsumption);
                });
            } else if (supplyPlanType == 'SuggestedShipments') {
                // var roleList = AuthenticationService.getLoggedInUserRole();
                if (AuthenticationService.checkUserACLBasedOnRoleId([(document.getElementById("programId").value).toString().split("_")[0].toString()], 'ROLE_GUEST_USER') || this.state.programQPLDetails.filter(c => c.id == this.state.programId)[0].readonly) {
                } else {
                    var monthCountShipments = count != undefined ? this.state.monthCount + count - 2 : this.state.monthCount;
                    this.setState({
                        shipments: !this.state.shipments,
                        monthCountShipments: monthCountShipments,
                        shipmentStartDateClicked: count != undefined ? this.state.monthsArray[count].startDate : moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
                        isSuggested: 1,
                    }, () => {
                        this.formSubmit(this.state.planningUnit, monthCountShipments)
                        if (this.state.shipments) {
                            this.suggestedShipmentsDetailsClicked(month, quantity, isEmergencyOrder, startDate, endDate);
                        }
                    });
                }
            } else if (supplyPlanType == 'shipments') {
                var monthCountShipments = count != undefined ? this.state.monthCount + count - 2 : this.state.monthCount;
                this.setState({
                    shipments: !this.state.shipments,
                    monthCountShipments: monthCountShipments,
                    shipmentStartDateClicked: count != undefined ? this.state.monthsArray[count].startDate : moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
                    isSuggested: 0,
                }, () => {
                    this.formSubmit(this.state.planningUnit, monthCountShipments)
                    if (this.state.shipments) {
                        this.shipmentsDetailsClicked('allShipments', startDate, endDate);
                    }
                });
            } else if (supplyPlanType == 'Adjustments') {
                var monthCountAdjustments = count != undefined ? this.state.monthCount + count - 2 : this.state.monthCount;
                this.setState({
                    adjustments: !this.state.adjustments,
                    monthCountAdjustments: monthCountAdjustments,
                    inventoryStartDateClicked: count != undefined ? this.state.monthsArray[count].startDate : moment(Date.now()).startOf('month').format("YYYY-MM-DD")
                }, () => {
                    this.formSubmit(this.state.planningUnit, monthCountAdjustments);
                });
            } else if (supplyPlanType == 'expiredStock') {
                this.setState({ loading: true });
                var details = (this.state.expiredStockArr).filter(c => moment(c.month.startDate).format("YYYY-MM-DD") == moment(startDate).format("YYYY-MM-DD"))
                if (startDate != undefined) {
                    this.setState({
                        expiredStockModal: !this.state.expiredStockModal,
                        expiredStockDetails: details[0].details,
                        expiredStockDetailsTotal: details[0].qty,
                        loading: false,
                        ledgerForBatch: []
                    })
                } else {
                    this.setState({
                        expiredStockModal: !this.state.expiredStockModal,
                        loading: false,
                        ledgerForBatch: []
                    })
                }
            }
        }
    }
    /**
     * This function is called when the cancel button is clicked from expired stock popup
     */
    actionCanceledExpiredStock() {
        this.setState({
            expiredStockModal: !this.state.expiredStockModal,
            message: i18n.t('static.actionCancelled'),
            color: '#BA0C2F',
        })
        this.hideFirstComponent()
    }
    /**
     * This function is called when the cancel button is clicked from consumption, inventory, suggested shipments,shipments
     * @param {*} supplyPlanType This values indicates which popup is cancelled
     */
    actionCanceled(supplyPlanType) {
        var cont = false;
        if (this.state.consumptionChangedFlag == 1 || this.state.inventoryChangedFlag == 1 || this.state.suggestedShipmentChangedFlag == 1 || this.state.shipmentChangedFlag == 1 || this.state.actualInventoryChanged) {
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
            if(supplyPlanType!='shipments'){
                this.setState({
                    batchInfoInInventoryPopUp: [],
                    actualInventoryChanged:false,
                    actualInventoryBatchTotalNotMatching:"",
                    ledgerForBatch:[]
                })
            }
            this.setState({
                loading: false,
                message: i18n.t('static.actionCancelled'),
                color: '#BA0C2F',
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
                showConsumption: 0
            },
                () => {
                    var inputs = document.getElementsByClassName("submitBtn");
                    for (var i = 0; i < inputs.length; i++) {
                        inputs[i].disabled = false;
                    }
                    this.hideFirstComponent();
                    this.toggleLarge(supplyPlanType);
                })
        }
    }
    /**
     * This function is called when scroll to left is clicked on the supply plan table
     */
    leftClicked() {
        var monthCount = (this.state.monthCount) - NO_OF_MONTHS_ON_LEFT_CLICKED;
        this.setState({
            monthCount: monthCount
        })
        this.formSubmit(this.state.planningUnit, monthCount, 1)
    }
    /**
     * This function is called when scroll to right is clicked on the supply plan table
     */
    rightClicked() {
        var monthCount = (this.state.monthCount) + NO_OF_MONTHS_ON_RIGHT_CLICKED;
        this.setState({
            monthCount: monthCount
        })
        this.formSubmit(this.state.planningUnit, monthCount, 1)
    }
    /**
     * This function is called when scroll to left is clicked on the consumption table
     */
    leftClickedConsumption() {
        var monthCountConsumption = (this.state.monthCountConsumption) - NO_OF_MONTHS_ON_LEFT_CLICKED_REGION;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(this.state.planningUnit, monthCountConsumption)
    }
    /**
     * This function is called when scroll to right is clicked on the consumption table
     */
    rightClickedConsumption() {
        var monthCountConsumption = (this.state.monthCountConsumption) + NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(this.state.planningUnit, monthCountConsumption);
    }
    /**
     * This function is called when scroll to left is clicked on the inventory/adjustment table
     */
    leftClickedAdjustments() {
        var monthCountAdjustments = (this.state.monthCountAdjustments) - NO_OF_MONTHS_ON_LEFT_CLICKED_REGION;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(this.state.planningUnit, monthCountAdjustments)
    }
    /**
     * This function is called when scroll to right is clicked on the inventory/adjustment table
     */
    rightClickedAdjustments() {
        var monthCountAdjustments = (this.state.monthCountAdjustments) + NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(this.state.planningUnit, monthCountAdjustments);
    }
    /**
     * This function is called when scroll to left is clicked on the shipment table
     */
    leftClickedShipments() {
        var monthCountShipments = (this.state.monthCountShipments) - NO_OF_MONTHS_ON_LEFT_CLICKED_REGION;
        this.setState({
            monthCountShipments: monthCountShipments
        })
        this.formSubmit(this.state.planningUnit, monthCountShipments)
    }
    /**
     * This function is called when scroll to right is clicked on the shipment table
     */
    rightClickedShipments() {
        var monthCountShipments = (this.state.monthCountShipments) + NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION;
        this.setState({
            monthCountShipments: monthCountShipments
        })
        this.formSubmit(this.state.planningUnit, monthCountShipments);
    }
    /**
     * This function is called when a particular consumption record value is clicked
     * @param {*} startDate This value is the start date of the month for which the consumption value is clicked
     * @param {*} endDate  This value is the end date of the month for which the consumption value is clicked
     * @param {*} region This is the value of the region for which the data needs to displayed
     * @param {*} actualFlag This is the value of the consumption type
     * @param {*} month This is the value of the month for which the consumption value is clicked
     */
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
                jexcel.destroy(document.getElementById("consumptionBatchInfoTable"), true);
            }
            var planningUnitId = document.getElementById("planningUnitId").value;
            var programJson = this.state.programJson;
            var batchInfoList = programJson.batchInfoList;
            var consumptionListUnFiltered = (programJson.consumptionList);
            var consumptionList = consumptionListUnFiltered.filter(con =>
                con.planningUnit.id == planningUnitId
                && con.region.id == region
                && ((con.consumptionDate >= startDate && con.consumptionDate <= endDate)));
            var batchList = [];
            var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == planningUnitId && c.active.toString() == "true" && c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS);
            var consumptionBatchList = programJson.consumptionList.filter(c => c.planningUnit.id == planningUnitId).flatMap(consumption => consumption.batchInfoList);
            var inventoryBatchList = programJson.inventoryList.filter(c => c.planningUnit.id == planningUnitId).flatMap(inventory => inventory.batchInfoList);
            var shipmentBatchList = shipmentList.flatMap(shipment => shipment.batchInfoList);
            for (var sl = 0; sl < shipmentList.length; sl++) {
                var bdl = shipmentList[sl].batchInfoList;
                for (var bd = 0; bd < bdl.length; bd++) {
                    var index = batchList.findIndex(c => c.batchNo == bdl[bd].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                    if (index == -1) {
                        var shipmentBatchListFiltered = shipmentBatchList.filter(c => c.batch.batchNo == bdl[bd].batch.batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                        var consumptionBatchListFiltered = consumptionBatchList.filter(c => c.batch.batchNo == bdl[bd].batch.batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                        var inventoryBatchListFiltered = inventoryBatchList.filter(c => c.batch.batchNo == bdl[bd].batch.batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                        var shipmentTotal = 0;
                        var consumptionTotal = 0;
                        var inventoryTotal = 0;
                        shipmentBatchListFiltered.map(item => {
                            shipmentTotal += Number(item.shipmentQty);
                        })
                        consumptionBatchListFiltered.map(item => {
                            consumptionTotal += Number(item.consumptionQty);
                        })
                        inventoryBatchListFiltered.map(item => {
                            inventoryTotal += Number(item.adjustmentQty)
                        })
                        var batchDetailsToPush = batchInfoList.filter(c => c.batchNo == bdl[bd].batch.batchNo && c.planningUnitId == planningUnitId && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                        if (batchDetailsToPush.length > 0) {
                            batchDetailsToPush[0].qtyAvailable = Number(shipmentTotal) + Number(inventoryTotal) - Number(consumptionTotal);
                            batchList.push(batchDetailsToPush[0]);
                        }
                    }
                }
            }
            this.setState({
                programJsonAfterConsumptionClicked: programJson,
                consumptionListUnFiltered: consumptionListUnFiltered,
                batchInfoList: batchList,
                programJson: programJson,
                consumptionList: consumptionList,
                showConsumption: 1,
                consumptionMonth: month,
                consumptionStartDate: startDate,
                consumptionChangedFlag: 0,
                consumptionBatchInfoChangedFlag: 0,
                consumptionRegion: region
            }, () => {
                if (this.refs.consumptionChild != undefined) {
                    this.refs.consumptionChild.showConsumptionData();
                } else {
                    this.setState({
                        loading: false
                    })
                }
            })
        }
    }
    /**
     * This function is called when a particular inventory/adjustment record value is clicked
     * @param {*} region This is the value of the region for which the data needs to displayed
     * @param {*} month This is the value of the month for which the inventory/adjustment value is clicked
     * @param {*} endDate  This value is the end date of the month for which the inventory/adjustment value is clicked
     * @param {*} actualFlag This is the value of the inventory type
     */
    adjustmentsDetailsClicked(region, month, endDate, inventoryType) {
        var cont = false;
        if (this.state.inventoryChangedFlag == 1 || this.state.actualInventoryChanged) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            if (this.state.actualInventoryEl != undefined && this.state.actualInventoryEl != "") {
                try {
                    jexcel.destroy(document.getElementById("inventoryActualBatchInfoTable"), true);
                } catch (err) { }
            }
            this.setState({ loading: true, actualInventoryChanged: false, inventoryStartDateClicked: moment(endDate).startOf('month').format("YYYY-MM-DD"), actualInventoryEl: "", ledgerForBatch: [], actualInventoryBatchTotalNotMatching: "" })
            var elInstance = this.state.inventoryBatchInfoTableEl;
            if (elInstance != undefined && elInstance != "") {
                jexcel.destroy(document.getElementById("inventoryBatchInfoTable"), true);
            }
            var planningUnitId = document.getElementById("planningUnitId").value;
            var programJson = this.state.programJson;
            var batchInfoList = programJson.batchInfoList;
            var batchList = [];
            var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == planningUnitId && c.active.toString() == "true" && c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS);
            var consumptionBatchList = programJson.consumptionList.filter(c => c.planningUnit.id == planningUnitId).flatMap(consumption => consumption.batchInfoList);
            var inventoryBatchList = programJson.inventoryList.filter(c => c.planningUnit.id == planningUnitId).flatMap(inventory => inventory.batchInfoList);
            var shipmentBatchList = shipmentList.flatMap(shipment => shipment.batchInfoList);
            for (var sl = 0; sl < shipmentList.length; sl++) {
                var bdl = shipmentList[sl].batchInfoList;
                for (var bd = 0; bd < bdl.length; bd++) {
                    var index = batchList.findIndex(c => c.batchNo == bdl[bd].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                    if (index == -1) {
                        var shipmentBatchListFiltered = shipmentBatchList.filter(c => c.batch.batchNo == bdl[bd].batch.batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                        var consumptionBatchListFiltered = consumptionBatchList.filter(c => c.batch.batchNo == bdl[bd].batch.batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                        var inventoryBatchListFiltered = inventoryBatchList.filter(c => c.batch.batchNo == bdl[bd].batch.batchNo && moment(c.batch.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                        var shipmentTotal = 0;
                        var consumptionTotal = 0;
                        var inventoryTotal = 0;
                        shipmentBatchListFiltered.map(item => {
                            shipmentTotal += Number(item.shipmentQty);
                        })
                        consumptionBatchListFiltered.map(item => {
                            consumptionTotal += Number(item.consumptionQty);
                        })
                        inventoryBatchListFiltered.map(item => {
                            inventoryTotal += Number(item.adjustmentQty)
                        })
                        var batchDetailsToPush = batchInfoList.filter(c => c.batchNo == bdl[bd].batch.batchNo && c.planningUnitId == planningUnitId && moment(c.expiryDate).format("YYYY-MM") == moment(bdl[bd].batch.expiryDate).format("YYYY-MM"));
                        if (batchDetailsToPush.length > 0) {
                            batchDetailsToPush[0].qtyAvailable = Number(shipmentTotal) + Number(inventoryTotal) - Number(consumptionTotal);
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
                inventoryRegion: region,
                inventoryChangedFlag: 0,
                inventoryBatchInfoChangedFlag: 0
            }, () => {
                if (this.refs.inventoryChild != undefined) {
                    this.refs.inventoryChild.showInventoryData();
                } else {
                    this.setState({
                        loading: false
                    })
                }
            })
        }
    }
    /**
     * This function is called when suggested shipments is clicked to create that shipment and show the table
     * @param {*} month This is month on which user has clicked
     * @param {*} quantity This is suggested quantity
     * @param {*} isEmergencyOrder This is flag for emergency shipment which is calculated based on lead time
     * @param {*} startDate This is the start date for the month where user has clicked
     * @param {*} endDate This is the end date for the month where user has clicked 
     */
    suggestedShipmentsDetailsClicked(month, quantity, isEmergencyOrder, startDate, endDate) {
        this.setState({ loading: true, shipmentStartDateClicked: startDate })
        var programJson = this.state.programJson;
        var planningUnitId = document.getElementById("planningUnitId").value;
        var actualProgramId = this.state.programList.filter(c => c.value == document.getElementById("programId").value)[0].programId;
        var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.program.id == actualProgramId && p.planningUnit.id == planningUnitId))[0];
        var shelfLife = programPlanningUnit.shelfLife;
        var catalogPrice = programPlanningUnit.catalogPrice;
        if (month != "" && quantity != 0) {
            var suggestedShipmentList = this.state.suggestedShipmentsTotalData.filter(c => c.month == month && c.suggestedOrderQty != "");
        } else {
            var suggestedShipmentList = [];
            var json = {
                suggestedOrderQty: 0
            }
            suggestedShipmentList.push(json);
        }
        var shipmentListUnFiltered = programJson.shipmentList;
        this.setState({
            shipmentListUnFiltered: shipmentListUnFiltered
        })
        var shipmentList = programJson.shipmentList.filter(c => c.active.toString() == "true");
        shipmentList = shipmentList.filter(c =>
            (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? c.receivedDate >= startDate && c.receivedDate <= endDate : c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate)
            && c.planningUnit.id == document.getElementById("planningUnitId").value
        );
        if (document.getElementById("addRowId") != null) {
            document.getElementById("addRowId").style.display = "block"
        }
        var emergencyOrder = true;
        if (isEmergencyOrder == 0) {
            emergencyOrder = false;
        }
        var seaFreightPercentage = this.state.generalProgramJson.seaFreightPerc;
        var freightCost = Number(catalogPrice) * Number(suggestedShipmentList[0].suggestedOrderQty) * (Number(Number(seaFreightPercentage) / 100));
        var rcpuFilter = this.state.realmCountryPlanningUnitListAll.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value);
        var rcpuObject = {
            id: "",
            multiplier: ""
        }
        if (rcpuFilter.length == 1) {
            rcpuObject = {
                id: rcpuFilter[0].realmCountryPlanningUnitId,
                multiplier: rcpuFilter[0].multiplier
            }
        } else if (rcpuFilter.length > 1) {
            var rcpuFilterForMultiplerOne = rcpuFilter.filter(c => c.multiplier == 1);
            if (rcpuFilterForMultiplerOne.length >= 1) {
                rcpuObject = {
                    id: rcpuFilterForMultiplerOne[0].realmCountryPlanningUnitId,
                    multiplier: rcpuFilterForMultiplerOne[0].multiplier
                }
            }
        }
        var json = {
            shipmentQty: suggestedShipmentList[0].suggestedOrderQty,
            shipmentRcpuQty: rcpuFilter.length == 1 ? suggestedShipmentList[0].suggestedOrderQty / rcpuObject.multiplier : suggestedShipmentList[0].suggestedOrderQty,
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
                id: QAT_SUGGESTED_DATA_SOURCE_ID
            },
            currency: {
                currencyId: USD_CURRENCY_ID,
                conversionRateToUsd: 1
            },
            expectedDeliveryDate: moment(month).format("YYYY-MM-DD"),
            planningUnit: {
                id: document.getElementById("planningUnitId").value
            },
            realmCountryPlanningUnit: rcpuObject,
            rate: catalogPrice,
            freightCost: freightCost
        }
        shipmentList.unshift(json);
        this.setState({
            shipmentListUnFiltered: programJson.shipmentList,
            programJson: programJson,
            shelfLife: shelfLife,
            catalogPrice: catalogPrice,
            shipmentList: shipmentList,
            showShipments: 1,
            isSuggested: 1,
            programPlanningUnitForPrice: programPlanningUnit,
            shipmentChangedFlag: 0,
            shipmentBatchInfoChangedFlag: 0,
            shipmentQtyChangedFlag: 0,
            shipmentDatesChangedFlag: 0
        }, () => {
            if (this.refs.shipmentChild != undefined) {
                this.refs.shipmentChild.showShipmentData();
            } else {
                this.setState({
                    loading: false
                })
            }
        })
    }
    /**
     * This function is used to toggle the replan model
     */
    toggleReplan() {
        var budgetList = this.state.budgetListPlanAll.filter(c => c.fundingSource.fundingSourceId == TBD_FUNDING_SOURCE);
        this.setState({
            replanModal: !this.state.replanModal,
            budgetListPlan: budgetList,
            procurementAgentId: TBD_PROCUREMENT_AGENT_ID,
            fundingSourceId: TBD_FUNDING_SOURCE,
            budgetId: budgetList.length == 1 ? budgetList[0].budgetId : "",
            showPlanningUnitAndQtyList: [],
            showPlanningUnitAndQty: 0,
            planningUnitIdsPlan: [],
            singleValue: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
        })
    }
    /**
     * This function is called when user clicks on export to excel or PDF and shows the list of planning units for user to select
     * @param {*} type This is type of export that should be generated. 1 for PDF and 2 for CSV
     */
    toggleExport(type) {
        if (this.state.viewById == 1) {
            var list = this.state.planningUnitList;
            this.setState({
                exportModal: !this.state.exportModal,
                planningUnitIdsExport: type != 0 ? list.filter(c => c.value == this.state.planningUnitId) : [],
                type: type
            })
        } else {
            var list = this.state.aruList;
            this.setState({
                exportModal: !this.state.exportModal,
                planningUnitIdsExport: type != 0 ? list.filter(c => c.value == this.state.aru.value) : [],
                type: type
            })
        }
    }
    /**
     * Updates the selected view mode in the state and triggers actions to update the UI.
     * @param {Object} e - The event object containing the selected view mode value.
     */
    setViewById(e) {
        var viewById = e.target.value;
        this.setState({
            viewById: viewById
        }, () => {
            if (viewById == 2) {
                document.getElementById("aruDiv").style.display = "block";
                document.getElementById("planningUnitDiv").style.display = "none";
                this.setState({
                    display: "none",
                    planningUnitChange: false
                })
                // this.fetchData();
            } else {
                document.getElementById("planningUnitDiv").style.display = "block";
                document.getElementById("aruDiv").style.display = "none";
                this.setState({
                    multiplier: 1,
                    aru: ""
                }, () => {
                    this.formSubmit(this.state.planningUnit, this.state.monthCount);
                })
            }
        })
    }
    /**
     * This is used to display the content
     * @returns The supply plan data in tabular format
     */
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
                    when={this.state.consumptionChangedFlag == 1 || this.state.consumptionBatchInfoChangedFlag == 1 || this.state.inventoryChangedFlag == 1 || this.state.inventoryBatchInfoChangedFlag == 1 || this.state.shipmentChangedFlag == 1 || this.state.shipmentBatchInfoChangedFlag == 1 || this.state.shipmentQtyChangedFlag == 1 || this.state.shipmentDatesChangedFlag == 1 || this.state.suggestedShipmentChangedFlag == 1 || this.state.actualInventoryChanged == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname }) || this.state.supplyPlanError}</h5>
                <SupplyPlanFormulas ref="formulaeChild" />
                <Card>
                    <div className="Card-header-reporticon">
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggle() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                            </a>
                        </div>
                    </div>
                    <CardBody className="pt-lg-0 pb-lg-0">
                        <Formik
                            render={
                                ({
                                }) => (
                                    <Form name='simpleForm'>
                                        <div className=" pl-0">
                                            <div className="row">
                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.startMonth')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                    <div className="controls edit">
                                                        <Picker
                                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                            ref={this.pickRange}
                                                            value={this.state.startDate}
                                                            key={JSON.stringify(this.state.minDate) + "-" + JSON.stringify(this.state.startDate)}
                                                            lang={pickerLang}
                                                            onDismiss={this.handleRangeDissmis}
                                                        >
                                                            <MonthBox value={makeText(this.state.startDate)} onClick={this._handleClickRangeBox} />
                                                        </Picker>
                                                    </div>
                                                </FormGroup>
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
                                                            placeholder={i18n.t('static.common.select')}
                                                        />
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-4" style={{ "marginTop": "-20px" }}>
                                                    <FormGroup check inline className='pl-lg-0' style={{ "paddingLeft": "0px" }}>
                                                        <Input
                                                            style={{ "marginLeft": "0px" }}
                                                            type="radio"
                                                            id="viewById"
                                                            name="viewById"
                                                            value={"1"}
                                                            checked={this.state.viewById == 1}
                                                            title={i18n.t('static.report.planningUnit')}
                                                            onChange={this.setViewById}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            // check htmlFor="inline-radio1"
                                                            title={i18n.t('static.report.planningUnit')}>
                                                            {i18n.t('static.report.planningUnit')}
                                                        </Label>
                                                    </FormGroup><br />
                                                    <FormGroup check inline className='pl-lg-0' style={{ "paddingLeft": "0px" }}>
                                                        <Input
                                                            style={{ "marginLeft": "0px" }}
                                                            type="radio"
                                                            id="viewById"
                                                            name="viewById"
                                                            value={"2"}
                                                            checked={this.state.viewById == 2}
                                                            title={i18n.t('static.planningunit.countrysku')}
                                                            onChange={this.setViewById}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            // check htmlFor="inline-radio1"
                                                            title={i18n.t('static.planningunit.countrysku')}>
                                                            {i18n.t('static.planningunit.countrysku')}
                                                        </Label>
                                                    </FormGroup>
                                                    <FormGroup id="planningUnitDiv" className='pt-lg-1'>
                                                        {/* <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.qatProduct')}</Label> */}
                                                        {/* <div className="controls "> */}
                                                        <Select
                                                            name="planningUnit"
                                                            id="planningUnit"
                                                            bsSize="sm"
                                                            options={this.state.planningUnitList}
                                                            value={this.state.planningUnit}
                                                            onChange={(e) => { this.updateFieldData(e); this.formSubmit(e, this.state.monthCount) }}
                                                            placeholder={i18n.t('static.common.select')}
                                                        />
                                                        {/* </div> */}
                                                    </FormGroup>
                                                    <FormGroup id="aruDiv" style={{ display: 'none' }} className='pt-lg-1'>
                                                        {/* <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.countrysku')}</Label> */}
                                                        {/* <div className="controls "> */}
                                                        <Select
                                                            name="aru"
                                                            id="aru"
                                                            bsSize="sm"
                                                            options={this.state.aruList}
                                                            value={this.state.aru}
                                                            onChange={(e) => { this.updateFieldDataARU(e); }}
                                                        />
                                                        {/* </div> */}
                                                    </FormGroup>
                                                </FormGroup>
                                                <input type="hidden" id="planningUnitId" name="planningUnitId" value={this.state.planningUnitId} />
                                                <input type="hidden" id="programId" name="programId" value={this.state.programId} />
                                            </div>
                                        </div>
                                    </Form>
                                )} />
                        <div style={{ display: this.state.loading ? "none" : "block" }}>
                            <div className="animated fadeIn" style={{ display: this.state.display }}>
                                <FormGroup className="col-md-12 pl-0" style={{ marginLeft: '-8px', display: this.state.display }}>
                                    <ul className="legendcommitversion list-group">
                                        <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.supplyPlan.planningUnitSettings")}<i class="fa fa-info-circle icons pl-lg-2" id="Popover2" title={i18n.t("static.tooltip.planningUnitSettings")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i> : </b></span></li>
                                        <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.supplyPlan.amcPastOrFuture")}</b> : {this.state.monthsInPastForAMC}/{this.state.monthsInFutureForAMC}</span></li>
                                        <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.report.shelfLife")}</b> : {this.state.shelfLife}</span></li>
                                        {this.state.planBasedOn == 1 ? <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.supplyPlan.minStockMos")}</b> : {this.state.minStockMoSQty}</span></li> : <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.product.minQuantity")}</b> : {this.formatter(this.state.minQtyPpu)}</span></li>}
                                        <li><span className="lightgreenlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.supplyPlan.reorderInterval")}</b> : {this.state.reorderFrequency}</span></li>
                                        {this.state.planBasedOn == 1 ? <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.supplyPlan.maxStockMos")}</b> : {this.state.maxStockMoSQty}</span></li> : <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.product.distributionLeadTime")}</b> : {this.formatter(this.state.distributionLeadTime)}</span></li>}
                                    </ul>
                                </FormGroup>
                                {this.state.planningUnitNotes != null && this.state.planningUnitNotes != undefined && this.state.planningUnitNotes.length > 0 && <FormGroup className="col-md-12 pl-0" style={{ marginLeft: '-8px', display: this.state.display }}>
                                    <ul className="legendcommitversion list-group">
                                        <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.program.notes")} : </b>{this.state.planningUnitNotes}</span></li>
                                    </ul>
                                </FormGroup>}
                                <FormGroup className="col-md-12 pl-0" style={{ marginLeft: '-8px', display: this.state.display }}>
                                    <ul className="legendcommitversion list-group">
                                        <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.supplyPlan.consumption")} : </b></span></li>
                                        <li><span className="purplelegend legendcolor"></span> <span className="legendcommitversionText" style={{ color: "rgb(170, 85, 161)" }}><i>{i18n.t('static.supplyPlan.forecastedConsumption')}</i></span></li>
                                        <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.actualConsumption')} </span></li>
                                    </ul>
                                </FormGroup>
                                <FormGroup className="col-md-12 pl-0" style={{ marginLeft: '-8px', display: this.state.display }}>
                                    <ul className="legendcommitversion list-group">
                                        <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.dashboard.shipments")} : </b></span></li>
                                        {
                                            this.state.paColors.map(item1 => (
                                                <li><span className="legendcolor" style={{ backgroundColor: item1.color }}></span> <span className="legendcommitversionText">{item1.text}</span></li>
                                            ))
                                        }
                                        <li><span className="lightgreylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.tbd')}</span></li>
                                        <li><span className="lightgreenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.multipleShipments')}</span></li>
                                        <li><span className="legend-localprocurment legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.report.localprocurement')}</span></li>
                                        <li><span className="legend-emergencyComment legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.emergencyOrder')}</span></li>
                                        <li><span className="legend-erp legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.shipment.erpShipment')}</span></li>
                                    </ul>
                                </FormGroup>
                                <FormGroup className="col-md-12 mt-2 pl-0  mt-3" style={{ display: this.state.display }}>
                                    <ul className="legendcommitversion list-group">
                                        <li><span className="redlegend "></span> <span className="legendcommitversionTextStock"><b>{i18n.t("static.supplyPlan.stockBalance")}/{i18n.t("static.report.mos")} : </b></span></li>
                                        <li><span className="legendcolor"></span> <span className="legendcommitversionText"><b>{i18n.t('static.supplyPlan.actualBalance')}</b></span></li>
                                        <li><span className="legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.projectedBalance')}</span></li>
                                        <li><span className="legendcolor" style={{ backgroundColor: "#BA0C2F" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.stockout')}</span></li>
                                        <li><span className="legendcolor" style={{ backgroundColor: "#f48521" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.lowstock')}</span></li>
                                        <li><span className="legendcolor" style={{ backgroundColor: "#118b70" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.okaystock')}</span></li>
                                        <li><span className="legendcolor" style={{ backgroundColor: "#edb944" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.overstock')}</span></li>
                                        <li><span className="legendcolor" style={{ backgroundColor: "#cfcdc9" }}></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlanFormula.na')}</span></li>
                                    </ul>
                                </FormGroup>
                                {(this.state.programQPLDetails.filter(c => c.id == this.state.programId)).length > 0 && (this.state.programQPLDetails.filter(c => c.id == this.state.programId))[0].readonly == 1 && <h5 style={{ color: 'red' }}>{i18n.t('static.dataentry.readonly')}</h5>}
                                <Row>
                                    <Col xs="12" md="12" className="mb-4  mt-3 loadProgramHeight">
                                        <Nav tabs>
                                            <NavItem>
                                                <NavLink
                                                    active={this.state.activeTab[0] === '1'}
                                                    onClick={() => { this.toggle(0, '1'); }}
                                                >{i18n.t('static.supplyPlan.currentSupplyPlan')} </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    active={this.state.activeTab[0] === '2'}
                                                    onClick={() => { this.toggle(0, '2'); }}
                                                >
                                                    {i18n.t('static.supplyPlan.supplyPlanForV')}{this.state.versionId}{(this.state.generalProgramJson != undefined && this.state.generalProgramJson != null && this.state.generalProgramJson != "" && this.state.generalProgramJson.cutOffDate != undefined && this.state.generalProgramJson.cutOffDate != null && this.state.generalProgramJson.cutOffDate != '' ? ' (' + i18n.t('static.supplyPlan.start') + ' ' + moment(this.state.generalProgramJson.cutOffDate).format('MMM YYYY') + ')' : '')}
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                        <TabContent activeTab={this.state.activeTab[0]}>
                                            {this.tabPane()}
                                        </TabContent>
                                    </Col>
                                </Row>
                            </div>
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
                    </CardBody>
                </Card>
            </div>
        )
    }
    /**
     * This function is called when user clicks on a particular shipment
     * @param {*} supplyPlanType This is the type of the shipment row that user has clicked on
     * @param {*} startDate This is the start date of the month which user has clicked on
     * @param {*} endDate This is the end date of the month which user has clicked on 
     */
    shipmentsDetailsClicked(supplyPlanType, startDate, endDate) {
        var cont = false;
        if (this.state.shipmentChangedFlag == 1 || this.state.shipmentBatchInfoChangedFlag == 1 || this.state.shipmentQtyChangedFlag == 1 || this.state.shipmentDatesChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.setState({ loading: true, shipmentStartDateClicked: startDate });
            var programJson = this.state.programJson;
            var planningUnitId = document.getElementById("planningUnitId").value;
            var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.planningUnit.id == planningUnitId))[0];
            var shipmentListUnFiltered = programJson.shipmentList;
            this.setState({
                shipmentListUnFiltered: shipmentListUnFiltered
            })
            var shipmentList = programJson.shipmentList.filter(c => c.active.toString() == "true");
            if (supplyPlanType == 'deliveredShipments') {
                shipmentList = shipmentList.filter(c => (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? c.receivedDate >= startDate && c.receivedDate <= endDate : c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate)
                    && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                if (document.getElementById("addRowId") != null) {
                    document.getElementById("addRowId").style.display = "block"
                }
            } else if (supplyPlanType == 'shippedShipments') {
                shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate
                    && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                if (document.getElementById("addRowId") != null) {
                    document.getElementById("addRowId").style.display = "block"
                }
            } else if (supplyPlanType == 'orderedShipments') {
                shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate
                    && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                if (document.getElementById("addRowId") != null) {
                    document.getElementById("addRowId").style.display = "block"
                }
            } else if (supplyPlanType == 'plannedShipments') {
                shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate
                    && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS));
                if (document.getElementById("addRowId") != null) {
                    document.getElementById("addRowId").style.display = "block"
                }
            } else if (supplyPlanType == 'onholdShipments') {
                shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate
                    && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS));
                if (document.getElementById("addRowId") != null) {
                    document.getElementById("addRowId").style.display = "block"
                }
            } else if (supplyPlanType == 'allShipments') {
                shipmentList = shipmentList.filter(c =>
                    (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? c.receivedDate >= startDate && c.receivedDate <= endDate : c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate)
                    && c.planningUnit.id == document.getElementById("planningUnitId").value
                );
                if (document.getElementById("addRowId") != null) {
                    document.getElementById("addRowId").style.display = "block"
                }
            }
            else {
                shipmentList = [];
            }
            var roleList = AuthenticationService.getLoggedInUserRole();
            if ((roleList.length == 1 && roleList[0].roleId == 'ROLE_GUEST_USER') || this.state.programQPLDetails.filter(c => c.id == this.state.programId)[0].readonly) {
                if (document.getElementById("addRowId") != null) {
                    document.getElementById("addRowId").style.display = "none"
                }
            } else {
            }
            this.setState({
                showShipments: 1,
                shipmentList: shipmentList,
                shipmentListUnFiltered: shipmentListUnFiltered,
                programJson: programJson,
                shelfLife: programPlanningUnit.shelfLife,
                catalogPrice: programPlanningUnit.catalogPrice,
                programPlanningUnitForPrice: programPlanningUnit,
                shipmentChangedFlag: 0,
                shipmentBatchInfoChangedFlag: 0,
                shipmentQtyChangedFlag: 0,
                shipmentDatesChangedFlag: 0
            }, () => {
                if (this.refs.shipmentChild != undefined) {
                    this.refs.shipmentChild.showShipmentData();
                } else {
                    this.setState({
                        loading: false
                    })
                }
            })
        }
    }
    /**
     * This function is used to update the state of this component from any other component
     * @param {*} parameterName This is the name of the key
     * @param {*} value This is the value for the key
     */
    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        })
    }
    /**
     * This is function is called when cancel button is clicked from the shipment modal
     * @param {*} type This is type of the shipment modal for example, the main shipment table, Quantity table and batch table
     */
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
                jexcel.destroy(document.getElementById("qtyCalculatorTable"), true);
                jexcel.destroy(document.getElementById("qtyCalculatorTable1"), true);
                this.refs.shipmentChild.state.shipmentQtyChangedFlag = 0;
                this.refs.shipmentChild.state.originalShipmentIdForPopup = "";
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
                jexcel.destroy(document.getElementById("shipmentDatesTable"), true);
                this.refs.shipmentChild.state.shipmentDatesChangedFlag = 0;
                this.refs.shipmentChild.state.originalShipmentIdForPopup = "";
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
                jexcel.destroy(document.getElementById("shipmentBatchInfoTable"), true);
                this.refs.shipmentChild.state.shipmentBatchInfoChangedFlag = 0;
                this.refs.shipmentChild.state.originalShipmentIdForPopup = "";
                this.setState({
                    shipmentBatchInfoChangedFlag: 0,
                    shipmentValidationBatchError: "",
                    shipmentBatchInfoDuplicateError: ""
                })
            }
        }
    }
    /**
     * This function is called when cancel button is clicked from inventory modal
     */
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
            jexcel.destroy(document.getElementById("inventoryBatchInfoTable"), true);
            this.refs.inventoryChild.state.inventoryBatchInfoChangedFlag = 0;
            this.setState({
                inventoryBatchInfoChangedFlag: 0,
                inventoryBatchInfoDuplicateError: "",
                inventoryBatchInfoNoStockError: "",
                inventoryBatchError: ""
            })
        }
    }
    /**
     * This function is called when cancel button is clicked from consumption modal
     */
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
            jexcel.destroy(document.getElementById("consumptionBatchInfoTable"), true);
            this.refs.consumptionChild.state.consumptionBatchInfoChangedFlag = 0;
            this.setState({
                consumptionBatchInfoChangedFlag: 0,
                consumptionBatchInfoDuplicateError: "",
                consumptionBatchInfoNoStockError: "",
                consumptionBatchError: ""
            })
        }
    }
    /**
     * This function is used to build the data for the PDF or CSV export
     * @param {*} report This is the type of the export that should be generated. 1 for PDF and 2 for CSV
     */
    getDataforExport = (report) => {
        document.getElementById("bars_div").style.display = 'block';
        this.setState({ exportModal: false, loading: true }, () => {
            var m = this.state.monthsArray
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "#BA0C2F"
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
                        color: "#BA0C2F"
                    })
                    this.hideFirstComponent()
                }.bind(this);
                programRequest.onsuccess = function (e) {
                    var programResult = programRequest.result.programData;
                    var planningUnitData = [];
                    var pcnt = 0;
                    var sortedPlanningUnitData = this.state.planningUnitIdsExport.sort(function (a, b) {
                        a = a.label.toLowerCase();
                        b = b.label.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    });
                    sortedPlanningUnitData.map(planningUnit => {
                        var planningUnitId = this.state.viewById == 1 ? planningUnit.value : planningUnit.planningUnitId
                        var multiplier = planningUnit.multiplier;
                        var programJson = {}
                        var planningUnitDataFilter = programResult.planningUnitDataList.filter(c => c.planningUnitId == planningUnitId);
                        if (planningUnitDataFilter.length > 0) {
                            var planningUnitDataFromJson = planningUnitDataFilter[0]
                            var programDataBytes = CryptoJS.AES.decrypt(planningUnitDataFromJson.planningUnitData, SECRET_KEY);
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
                        var actualProgramId = this.state.programList.filter(c => c.value == document.getElementById("programId").value)[0].programId;
                        var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.program.id == actualProgramId && p.planningUnit.id == planningUnitId))[0];
                        var regionListFiltered = this.state.regionList;
                        var consumptionTotalData = [];
                        var shipmentsTotalData = [];
                        var deliveredShipmentsTotalData = [];
                        var shippedShipmentsTotalData = [];
                        var orderedShipmentsTotalData = [];
                        var plannedShipmentsTotalData = [];
                        var onholdShipmentsTotalData = [];
                        var totalExpiredStockArr = [];
                        var amcTotalData = [];
                        var minStockMoS = [];
                        var maxStockMoS = [];
                        var inventoryTotalData = [];
                        var adjustmentTotalData = [];
                        var nationalAdjustmentTotalData = [];
                        var suggestedShipmentsTotalData = [];
                        var openingBalanceArray = [];
                        var closingBalanceArray = [];
                        var jsonArrForGraph = [];
                        var monthsOfStockArray = [];
                        var maxQtyArray = [];
                        var unmetDemand = [];
                        var consumptionArrayForRegion = [];
                        var inventoryArrayForRegion = [];
                        var paColors = []
                        var lastActualConsumptionDate = [];
                        var invList = (programJson.inventoryList).filter(c => c.planningUnit.id == planningUnitId && (moment(c.inventoryDate) >= moment(m[0].startDate) && moment(c.inventoryDate) <= moment(m[17].endDate)) && c.active.toString() == "true")
                        var conList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && (moment(c.consumptionDate) >= moment(m[0].startDate) && moment(c.consumptionDate) <= moment(m[17].endDate)) && c.active.toString() == "true")
                        var shiList = (programJson.shipmentList).filter(c => c.active.toString() == "true" && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag.toString() == "true" && (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? (moment(c.receivedDate) >= moment(m[0].startDate) && moment(c.receivedDate) <= moment(m[17].endDate)) : (moment(c.expectedDeliveryDate) >= moment(m[0].startDate) && moment(c.expectedDeliveryDate) <= moment(m[17].endDate))))
                        var realmTransaction = db1.transaction(['realm'], 'readwrite');
                        var realmOs = realmTransaction.objectStore('realm');
                        var realmRequest = realmOs.get(this.state.generalProgramJson.realmCountry.realm.realmId);
                        realmRequest.onerror = function (event) {
                            this.setState({
                                supplyPlanError: i18n.t('static.program.errortext'),
                                loading: false,
                                color: "#BA0C2F"
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
                            var planningUnitInfo = {
                                shelfLife: programPlanningUnit.shelfLife,
                                versionId: this.state.generalProgramJson.currentVersion.versionId,
                                monthsInPastForAMC: programPlanningUnit.monthsInPastForAmc,
                                monthsInFutureForAMC: programPlanningUnit.monthsInFutureForAmc,
                                reorderFrequency: programPlanningUnit.reorderFrequencyInMonths,
                                minMonthsOfStock: programPlanningUnit.minMonthsOfStock,
                                inList: invList,
                                coList: conList,
                                shList: shiList,
                                minStockMoSQty: minStockMoSQty,
                                maxStockMoSQty: maxStockMoSQty,
                                planningUnitNotes: programPlanningUnit.notes
                            }
                            var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                            var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
                            var shipmentStatusRequest = shipmentStatusOs.getAll();
                            shipmentStatusRequest.onerror = function (event) {
                                this.setState({
                                    supplyPlanError: i18n.t('static.program.errortext'),
                                    loading: false,
                                    color: "#BA0C2F"
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
                                        color: "#BA0C2F"
                                    })
                                    this.hideFirstComponent()
                                }.bind(this);
                                papuRequest.onsuccess = function (event) {
                                    var papuResult = [];
                                    papuResult = papuRequest.result;
                                    var supplyPlanData = [];
                                    if (programJson.supplyPlan != undefined) {
                                        supplyPlanData = (programJson.supplyPlan).filter(c => c.planningUnitId == planningUnitId);
                                    }
                                    var lastClosingBalance = 0;
                                    var lastIsActualClosingBalance = 0;
                                    for (var n = 0; n < m.length; n++) {
                                        var jsonList = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(m[n].startDate).format("YYYY-MM-DD"));
                                        var prevMonthJsonList = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(m[n].startDate).subtract(1, 'months').format("YYYY-MM-DD"));
                                        if (jsonList.length > 0) {
                                            openingBalanceArray.push({ isActual: prevMonthJsonList.length > 0 && prevMonthJsonList[0].regionCountForStock == prevMonthJsonList[0].regionCount ? 1 : 0, balance: roundARU(jsonList[0].openingBalance, multiplier) });
                                            consumptionTotalData.push({ consumptionQty: roundARU(jsonList[0].consumptionQty, multiplier), consumptionType: jsonList[0].actualFlag, textColor: jsonList[0].actualFlag == 1 ? "#000000" : "rgb(170, 85, 161)" });
                                            var shipmentDetails = programJson.shipmentList.filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true && (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? (c.receivedDate >= m[n].startDate && c.receivedDate <= m[n].endDate) : (c.expectedDeliveryDate >= m[n].startDate && c.expectedDeliveryDate <= m[n].endDate))
                                            );
                                            shipmentsTotalData.push(shipmentDetails.length > 0 ? roundARU(jsonList[0].shipmentTotalQty, multiplier) : "");
                                            var sd1 = [];
                                            var sd2 = [];
                                            var sd3 = [];
                                            var sd4 = [];
                                            var sd5 = [];
                                            var paColor1 = "";
                                            var paColor2 = "";
                                            var paColor3 = "";
                                            var paColor4 = "";
                                            var paColor5 = "";
                                            var isEmergencyOrder1 = 0;
                                            var isEmergencyOrder2 = 0;
                                            var isEmergencyOrder3 = 0;
                                            var isEmergencyOrder4 = 0;
                                            var isEmergencyOrder5 = 0;
                                            if (shipmentDetails != "" && shipmentDetails != undefined) {
                                                for (var i = 0; i < shipmentDetails.length; i++) {
                                                    if (shipmentDetails[i].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                                        if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                            var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                            paColor1 = this.state.theme == "Dark" ? procurementAgent.colorHtmlDarkCode : procurementAgent.colorHtmlCode;
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
                                                        sd1.push(shipmentDetail);
                                                    } else if (shipmentDetails[i].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                                        if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                            var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                            paColor2 = this.state.theme == "Dark" ? procurementAgent.colorHtmlDarkCode : procurementAgent.colorHtmlCode;
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
                                                        sd2.push(shipmentDetail);
                                                        if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                            isEmergencyOrder2 = true
                                                        }
                                                    } else if (shipmentDetails[i].shipmentStatus.id == APPROVED_SHIPMENT_STATUS || shipmentDetails[i].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                                        if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                            var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                            paColor3 = this.state.theme == "Dark" ? procurementAgent.colorHtmlDarkCode : procurementAgent.colorHtmlCode;
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
                                                        sd3.push(shipmentDetail);
                                                        if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                            isEmergencyOrder3 = true
                                                        }
                                                    } else if (shipmentDetails[i].shipmentStatus.id == PLANNED_SHIPMENT_STATUS) {
                                                        if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                            var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                            paColor4 = this.state.theme == "Dark" ? procurementAgent.colorHtmlDarkCode : procurementAgent.colorHtmlCode;
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
                                                        sd4.push(shipmentDetail);
                                                        if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                            isEmergencyOrder4 = true
                                                        }
                                                    } else if (shipmentDetails[i].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                                                        if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                            var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                            paColor5 = this.state.theme == "Dark" ? procurementAgent.colorHtmlDarkCode : procurementAgent.colorHtmlCode;
                                                            var index = paColors.findIndex(c => c.color == paColor5);
                                                            if (index == -1) {
                                                                paColors.push({ color: paColor5, text: procurementAgent.procurementAgentCode })
                                                            }
                                                        } else {
                                                            if (shipmentDetails[i].procurementAgent.id != "") {
                                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                                var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                                paColor5 = "#efefef"
                                                            } else {
                                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                                var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                                paColor5 = "#efefef"
                                                            }
                                                        }
                                                        sd5.push(shipmentDetail);
                                                        if (shipmentDetails[i].emergencyOrder.toString() == "true") {
                                                            isEmergencyOrder5 = true
                                                        }
                                                    }
                                                }
                                            }
                                            if ((shipmentDetails.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                                                var colour = paColor1;
                                                if (sd1.length > 1) {
                                                    colour = "#d9ead3";
                                                }
                                                deliveredShipmentsTotalData.push({ qty: roundARU(Number(jsonList[0].receivedShipmentsTotalData) + Number(jsonList[0].receivedErpShipmentsTotalData), multiplier), month: m[n], shipmentDetail: sd1, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder1 });
                                            } else {
                                                deliveredShipmentsTotalData.push("")
                                            }
                                            if ((shipmentDetails.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                                var colour = paColor2;
                                                if (sd2.length > 1) {
                                                    colour = "#d9ead3";
                                                }
                                                shippedShipmentsTotalData.push({ qty: roundARU(Number(jsonList[0].shippedShipmentsTotalData) + Number(jsonList[0].shippedErpShipmentsTotalData), multiplier), month: m[n], shipmentDetail: sd2, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder2 });
                                            } else {
                                                shippedShipmentsTotalData.push("")
                                            }
                                            if ((shipmentDetails.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                                var colour = paColor3;
                                                if (sd3.length > 1) {
                                                    colour = "#d9ead3";
                                                }
                                                orderedShipmentsTotalData.push({ qty: roundARU(Number(jsonList[0].approvedShipmentsTotalData) + Number(jsonList[0].submittedShipmentsTotalData) + Number(jsonList[0].approvedErpShipmentsTotalData) + Number(jsonList[0].submittedErpShipmentsTotalData), multiplier), month: m[n], shipmentDetail: sd3, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder3 });
                                            } else {
                                                orderedShipmentsTotalData.push("")
                                            }
                                            if ((shipmentDetails.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS)).length > 0) {
                                                var colour = paColor4;
                                                if (sd4.length > 1) {
                                                    colour = "#d9ead3";
                                                }
                                                plannedShipmentsTotalData.push({ qty: roundARU(Number(jsonList[0].plannedShipmentsTotalData) + Number(jsonList[0].plannedErpShipmentsTotalData), multiplier), month: m[n], shipmentDetail: sd4, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder4 });
                                            } else {
                                                plannedShipmentsTotalData.push("")
                                            }
                                            if ((shipmentDetails.filter(c => c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)).length > 0) {
                                                var colour = paColor5;
                                                if (sd5.length > 1) {
                                                    colour = "#d9ead3";
                                                }
                                                onholdShipmentsTotalData.push({ qty: roundARU(Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].onholdErpShipmentsTotalData), multiplier), month: m[n], shipmentDetail: sd5, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder5 });
                                            } else {
                                                onholdShipmentsTotalData.push("")
                                            }

                                            totalExpiredStockArr.push({ qty: roundARU(jsonList[0].expiredStock, multiplier), details: jsonList[0].batchDetails.filter(c => moment(c.expiryDate).format("YYYY-MM-DD") >= m[n].startDate && moment(c.expiryDate).format("YYYY-MM-DD") <= m[n].endDate), month: m[n] });
                                            monthsOfStockArray.push(jsonList[0].mos != null ? jsonList[0].mos : jsonList[0].mos);
                                            maxQtyArray.push(roundAMC(jsonList[0].maxStock !== "" && jsonList[0].maxStock != undefined ? Number(jsonList[0].maxStock) / Number(multiplier) : jsonList[0].maxStock))
                                            amcTotalData.push(jsonList[0].amc != null ? roundAMC(jsonList[0].amc != "" && jsonList[0].amc != undefined ? Number(jsonList[0].amc) / Number(multiplier) : Number(jsonList[0].amc)) : "");
                                            minStockMoS.push(jsonList[0].minStockMoS)
                                            maxStockMoS.push(jsonList[0].maxStockMoS)
                                            unmetDemand.push(jsonList[0].unmetDemand == 0 ? "" : roundARU(jsonList[0].unmetDemand, multiplier));
                                            closingBalanceArray.push({ isActual: jsonList[0].regionCountForStock == jsonList[0].regionCount ? 1 : 0, balance: roundARU(jsonList[0].closingBalance, multiplier) })
                                            lastClosingBalance = jsonList[0].closingBalance
                                            lastIsActualClosingBalance = jsonList[0].regionCountForStock == jsonList[0].regionCount ? 1 : 0;
                                            var sstd = {}
                                            if (programPlanningUnit.planBasedOn == 1) {
                                                var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                                var compare = (m[n].startDate >= currentMonth);
                                                var amc = Number(jsonList[0].amc);
                                                var spd1 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).format("YYYY-MM"));
                                                var spd2 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(1, 'months').format("YYYY-MM"));
                                                var spd3 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(2, 'months').format("YYYY-MM"));
                                                var mosForMonth1 = spd1.length > 0 ? spd1[0].mos != null ? parseFloat(spd1[0].mos).toFixed(1) : null : 0;
                                                var mosForMonth2 = spd2.length > 0 ? spd2[0].mos != null ? parseFloat(spd2[0].mos).toFixed(1) : null : 0;
                                                var mosForMonth3 = spd3.length > 0 ? spd3[0].mos != null ? parseFloat(spd3[0].mos).toFixed(1) : null : 0;
                                                var suggestShipment = false;
                                                var useMax = false;
                                                if (compare) {
                                                    if (Number(amc) == 0) {
                                                        suggestShipment = false;
                                                    } else if (Number(mosForMonth1) != 0 && Number(mosForMonth1) < Number(minStockMoSQty) && (Number(mosForMonth2) > Number(minStockMoSQty) || Number(mosForMonth3) > Number(minStockMoSQty))) {
                                                        suggestShipment = false;
                                                    } else if (Number(mosForMonth1) != 0 && Number(mosForMonth1) < Number(minStockMoSQty) && Number(mosForMonth2) < Number(minStockMoSQty) && Number(mosForMonth3) < Number(minStockMoSQty)) {
                                                        suggestShipment = true;
                                                        useMax = true;
                                                    } else if (Number(mosForMonth1) == 0) {
                                                        suggestShipment = true;
                                                        if (Number(mosForMonth2) < Number(minStockMoSQty) && Number(mosForMonth3) < Number(minStockMoSQty)) {
                                                            useMax = true;
                                                        } else {
                                                            useMax = false;
                                                        }
                                                    }
                                                } else {
                                                    suggestShipment = false;
                                                }
                                                var addLeadTimes = parseFloat(this.state.generalProgramJson.plannedToSubmittedLeadTime) + parseFloat(this.state.generalProgramJson.submittedToApprovedLeadTime) +
                                                    parseFloat(this.state.generalProgramJson.approvedToShippedLeadTime) + parseFloat(this.state.generalProgramJson.shippedToArrivedBySeaLeadTime) +
                                                    parseFloat(this.state.generalProgramJson.arrivedToDeliveredLeadTime);
                                                var expectedDeliveryDate = moment(m[n].startDate).subtract(Number(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                                var isEmergencyOrder = 0;
                                                if (expectedDeliveryDate >= currentMonth) {
                                                    isEmergencyOrder = 0;
                                                } else {
                                                    isEmergencyOrder = 1;
                                                }
                                                if (suggestShipment) {
                                                    var suggestedOrd = 0;
                                                    if (useMax) {
                                                        suggestedOrd = Number(Math.round(amc * Number(maxStockMoSQty)) - Number(jsonList[0].closingBalance) + Number(jsonList[0].unmetDemand));
                                                    } else {
                                                        suggestedOrd = Number(Math.round(amc * Number(minStockMoSQty)) - Number(jsonList[0].closingBalance) + Number(jsonList[0].unmetDemand));
                                                    }
                                                    if (suggestedOrd <= 0) {
                                                        sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) };
                                                    } else {
                                                        sstd = { "suggestedOrderQty": roundARU(suggestedOrd, multiplier), "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) + Number(suggestedOrd) };
                                                    }
                                                } else {
                                                    sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) };
                                                }
                                                suggestedShipmentsTotalData.push(sstd);
                                            } else {
                                                var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                                var compare = (m[n].startDate >= currentMonth);
                                                var amc = Number(jsonList[0].amc);
                                                var spd1 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(programPlanningUnit.distributionLeadTime, 'months').format("YYYY-MM"));
                                                var spd2 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(1 + programPlanningUnit.distributionLeadTime, 'months').format("YYYY-MM"));
                                                var spd3 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(m[n].startDate).add(2 + programPlanningUnit.distributionLeadTime, 'months').format("YYYY-MM"));
                                                var amc = spd1.length > 0 ? Number(spd1[0].amc) : 0;
                                                var mosForMonth1 = spd1.length > 0 ? spd1[0].mos != null ? parseFloat(spd1[0].mos).toFixed(1) : null : 0;
                                                var mosForMonth2 = spd2.length > 0 ? spd2[0].mos != null ? parseFloat(spd2[0].mos).toFixed(1) : null : 0;
                                                var mosForMonth3 = spd3.length > 0 ? spd3[0].mos != null ? parseFloat(spd3[0].mos).toFixed(1) : null : 0;
                                                var cbForMonth1 = spd1.length > 0 ? spd1[0].closingBalance : 0;
                                                var cbForMonth2 = spd2.length > 0 ? spd2[0].closingBalance : 0;
                                                var cbForMonth3 = spd3.length > 0 ? spd3[0].closingBalance : 0;
                                                var unmetDemandForMonth1 = spd1.length > 0 ? spd1[0].unmetDemand : 0;
                                                var maxStockForMonth1 = spd1.length > 0 ? spd1[0].maxStock : 0;
                                                var minStockForMonth1 = spd1.length > 0 ? spd1[0].minStock : 0;
                                                var suggestShipment = false;
                                                var useMax = false;
                                                if (compare) {
                                                    if (Number(amc) == 0) {
                                                        suggestShipment = false;
                                                    } else if (Number(cbForMonth1) != 0 && Number(cbForMonth1) < Number(programPlanningUnit.minQty) && (Number(cbForMonth2) > Number(programPlanningUnit.minQty) || Number(cbForMonth3) > Number(programPlanningUnit.minQty))) {
                                                        suggestShipment = false;
                                                    } else if (Number(cbForMonth1) != 0 && Number(cbForMonth1) < Number(programPlanningUnit.minQty) && Number(cbForMonth2) < Number(programPlanningUnit.minQty) && Number(cbForMonth3) < Number(programPlanningUnit.minQty)) {
                                                        suggestShipment = true;
                                                        useMax = true;
                                                    } else if (Number(cbForMonth1) == 0) {
                                                        suggestShipment = true;
                                                        if (Number(cbForMonth2) < Number(programPlanningUnit.minQty) && Number(cbForMonth3) < Number(programPlanningUnit.minQty)) {
                                                            useMax = true;
                                                        } else {
                                                            useMax = false;
                                                        }
                                                    }
                                                } else {
                                                    suggestShipment = false;
                                                }
                                                var addLeadTimes = parseFloat(this.state.generalProgramJson.plannedToSubmittedLeadTime) + parseFloat(this.state.generalProgramJson.submittedToApprovedLeadTime) +
                                                    parseFloat(this.state.generalProgramJson.approvedToShippedLeadTime) + parseFloat(this.state.generalProgramJson.shippedToArrivedBySeaLeadTime) +
                                                    parseFloat(this.state.generalProgramJson.arrivedToDeliveredLeadTime);
                                                var expectedDeliveryDate = moment(m[n].startDate).subtract(Number(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                                var isEmergencyOrder = 0;
                                                if (expectedDeliveryDate >= currentMonth) {
                                                    isEmergencyOrder = 0;
                                                } else {
                                                    isEmergencyOrder = 1;
                                                }
                                                if (suggestShipment) {
                                                    var suggestedOrd = 0;
                                                    if (useMax) {
                                                        suggestedOrd = Number(Math.round(Number(maxStockForMonth1)) - Number(cbForMonth1) + Number(unmetDemandForMonth1));
                                                    } else {
                                                        suggestedOrd = Number(Math.round(Number(minStockForMonth1)) - Number(cbForMonth1) + Number(unmetDemandForMonth1));
                                                    }
                                                    if (suggestedOrd <= 0) {
                                                        sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) };
                                                    } else {
                                                        sstd = { "suggestedOrderQty": roundARU(suggestedOrd, multiplier), "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) + Number(suggestedOrd) };
                                                    }
                                                } else {
                                                    sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) };
                                                }
                                                suggestedShipmentsTotalData.push(sstd);
                                            }
                                            var consumptionListForRegion = (programJson.consumptionList).filter(c => (c.consumptionDate >= m[n].startDate && c.consumptionDate <= m[n].endDate) && c.planningUnit.id == this.state.planningUnitId && c.active == true);
                                            var inventoryListForRegion = (programJson.inventoryList).filter(c => (c.inventoryDate >= m[n].startDate && c.inventoryDate <= m[n].endDate) && c.planningUnit.id == this.state.planningUnitId && c.active == true);
                                            var adjustmentCount = 0;
                                            var adjustmentTotal = 0;
                                            inventoryListForRegion.map(item => {
                                                if (item.adjustmentQty != undefined && item.adjustmentQty != null && item.adjustmentQty !== "") {
                                                    adjustmentCount += 1;
                                                    adjustmentTotal += Number(((item.adjustmentQty) * parseFloat(item.multiplier)))
                                                }
                                            })
                                            adjustmentTotalData.push(adjustmentCount > 0 ? roundARU(Number(adjustmentTotal), this.state.multiplier) : "");
                                            nationalAdjustmentTotalData.push(jsonList[0].regionCountForStock > 0 && roundARU(jsonList[0].nationalAdjustment, this.state.multiplier) != 0 && jsonList[0].nationalAdjustment != "" && jsonList[0].nationalAdjustment != null ? roundARU(Number(jsonList[0].nationalAdjustment), this.state.multiplier) : "");
                                            inventoryTotalData.push((adjustmentCount > 0 || (jsonList[0].regionCountForStock > 0 && roundARU(jsonList[0].nationalAdjustment, this.state.multiplier) != 0 && jsonList[0].nationalAdjustment != "" && jsonList[0].nationalAdjustment != null)) ? roundARU(Number(adjustmentCount > 0 ? roundARU(Number(adjustmentTotal), this.state.multiplier) : 0) + Number(jsonList[0].regionCountForStock > 0 ? roundARU(Number(jsonList[0].nationalAdjustment), this.state.multiplier) : 0), 1) : "");
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
                                                            consumptionQtyForRegion += (Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
                                                            consumptionTotalForRegion += (Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));;
                                                        }
                                                        actualFlagForRegion = true;
                                                    } else {
                                                        consumptionQtyForRegion += (Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
                                                        consumptionTotalForRegion += (Math.round(consumptionListForRegionalDetails[cr].consumptionRcpuQty) * parseFloat(consumptionListForRegionalDetails[cr].multiplier));
                                                        actualFlagForRegion = false;
                                                    }
                                                }
                                                if (consumptionListForRegionalDetails.length == 0) {
                                                    consumptionQtyForRegion = "";
                                                }
                                                consumptionArrayForRegion.push({ "regionId": regionListFiltered[r].id, "qty": roundARU(consumptionQtyForRegion, multiplier), "actualFlag": actualFlagForRegion, "month": m[n] })
                                                var adjustmentsQtyForRegion = 0;
                                                var actualQtyForRegion = 0;
                                                var inventoryListForRegionalDetails = inventoryListForRegion.filter(c => c.region != null && c.region.id != 0 && c.region.id == regionListFiltered[r].id);
                                                var actualCount = 0;
                                                var adjustmentsCount = 0;
                                                for (var cr = 0; cr < inventoryListForRegionalDetails.length; cr++) {
                                                    if (inventoryListForRegionalDetails[cr].actualQty != undefined && inventoryListForRegionalDetails[cr].actualQty != null && inventoryListForRegionalDetails[cr].actualQty !== "") {
                                                        actualCount += 1;
                                                        actualQtyForRegion += (Math.round(inventoryListForRegionalDetails[cr].actualQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
                                                        totalActualQtyForRegion += (Math.round(inventoryListForRegionalDetails[cr].actualQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
                                                        var index = regionsReportingActualInventory.findIndex(c => c == regionListFiltered[r].id);
                                                        if (index == -1) {
                                                            regionsReportingActualInventory.push(regionListFiltered[r].id)
                                                        }
                                                    }
                                                    if (inventoryListForRegionalDetails[cr].adjustmentQty != undefined && inventoryListForRegionalDetails[cr].adjustmentQty != null && inventoryListForRegionalDetails[cr].adjustmentQty !== "") {
                                                        adjustmentsCount += 1;
                                                        adjustmentsQtyForRegion += (Math.round(inventoryListForRegionalDetails[cr].adjustmentQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
                                                        totalAdjustmentsQtyForRegion += (Math.round(inventoryListForRegionalDetails[cr].adjustmentQty) * parseFloat(inventoryListForRegionalDetails[cr].multiplier));
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
                                            consumptionArrayForRegion.push({ "regionId": -1, "qty": roundARU(consumptionTotalForRegion, multiplier), "actualFlag": true, "month": m[n] })
                                            var projectedInventoryForRegion = jsonList[0].closingBalance - (jsonList[0].nationalAdjustment != "" ? jsonList[0].nationalAdjustment : 0) - (jsonList[0].unmetDemand != "" && jsonList[0].unmetDemand != null ? jsonList[0].unmetDemand : 0);
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
                                                month: m[n].monthName.concat(" ").concat(m[n].monthYear),
                                                consumption: roundARU(jsonList[0].consumptionQty, multiplier),
                                                stock: roundARU(jsonList[0].closingBalance, multiplier),
                                                planned: Number(plannedShipmentsTotalData[n] != "" ? plannedShipmentsTotalData[n].qty : 0)
                                                ,
                                                onhold: Number(onholdShipmentsTotalData[n] != "" ? onholdShipmentsTotalData[n].qty : 0)
                                                ,
                                                delivered: Number(deliveredShipmentsTotalData[n] != "" ? deliveredShipmentsTotalData[n].qty : 0)
                                                ,
                                                shipped: Number(shippedShipmentsTotalData[n] != "" ? shippedShipmentsTotalData[n].qty : 0)
                                                ,
                                                ordered: Number(orderedShipmentsTotalData[n] != "" ? orderedShipmentsTotalData[n].qty : 0)
                                                ,
                                                mos: jsonList[0].mos != null ? parseFloat(jsonList[0].mos).toFixed(1) : jsonList[0].mos,
                                                minMos: minStockMoSQty,
                                                maxMos: maxStockMoSQty,
                                                minQty: roundAMC(jsonList[0].minStock != "" && jsonList[0].minStock != undefined ? Number(jsonList[0].minStock) / Number(multiplier) : jsonList[0].minStock),
                                                maxQty: roundAMC(jsonList[0].maxStock != "" && jsonList[0].maxStock != undefined ? Number(jsonList[0].maxStock) / Number(multiplier) : jsonList[0].maxStock),
                                                planBasedOn: programPlanningUnit.planBasedOn
                                            }
                                            jsonArrForGraph.push(json);
                                        } else {
                                            openingBalanceArray.push({ isActual: lastIsActualClosingBalance, balance: roundARU(lastClosingBalance, multiplier) });
                                            consumptionTotalData.push({ consumptionQty: "", consumptionType: "", textColor: "" });
                                            shipmentsTotalData.push("");
                                            suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": moment(m[n].startDate).format("YYYY-MM-DD"), "isEmergencyOrder": 0 });
                                            deliveredShipmentsTotalData.push("");
                                            shippedShipmentsTotalData.push("");
                                            orderedShipmentsTotalData.push("");
                                            plannedShipmentsTotalData.push("");
                                            onholdShipmentsTotalData.push("");
                                            inventoryTotalData.push("");
                                            adjustmentTotalData.push("");
                                            nationalAdjustmentTotalData.push("");
                                            totalExpiredStockArr.push({ qty: 0, details: [], month: m[n] });
                                            monthsOfStockArray.push(null)
                                            maxQtyArray.push(null);
                                            amcTotalData.push("");
                                            minStockMoS.push(minStockMoSQty);
                                            maxStockMoS.push(maxStockMoSQty);
                                            unmetDemand.push("");
                                            closingBalanceArray.push({ isActual: 0, balance: roundARU(lastClosingBalance, multiplier) });
                                            for (var i = 0; i < this.state.regionListFiltered.length; i++) {
                                                consumptionArrayForRegion.push({ "regionId": regionListFiltered[i].id, "qty": "", "actualFlag": "", "month": m[n] })
                                                inventoryArrayForRegion.push({ "regionId": regionListFiltered[i].id, "adjustmentsQty": "", "actualQty": "", "finalInventory": lastClosingBalance, "autoAdjustments": "", "projectedInventory": lastClosingBalance, "month": m[n] });
                                            }
                                            consumptionArrayForRegion.push({ "regionId": -1, "qty": "", "actualFlag": "", "month": m[n] })
                                            inventoryArrayForRegion.push({ "regionId": -1, "adjustmentsQty": "", "actualQty": i18n.t('static.supplyPlan.notAllRegionsHaveActualStock'), "finalInventory": lastClosingBalance, "autoAdjustments": "", "projectedInventory": lastClosingBalance, "month": m[n] });
                                            lastActualConsumptionDate.push("");
                                            var json = {
                                                month: m[n].monthName.concat(" ").concat(m[n].monthYear),
                                                consumption: 0,
                                                stock: roundARU(lastClosingBalance, multiplier),
                                                planned: 0,
                                                onhold: 0,
                                                delivered: 0,
                                                shipped: 0,
                                                ordered: 0,
                                                mos: "",
                                                minMos: minStockMoSQty,
                                                maxMos: maxStockMoSQty,
                                                minQty: 0,
                                                maxQty: 0,
                                                planBasedOn: programPlanningUnit.planBasedOn
                                            }
                                            jsonArrForGraph.push(json);
                                        }
                                    }
                                    var exportData = {
                                        openingBalanceArray: openingBalanceArray,
                                        consumptionTotalData: consumptionTotalData,
                                        expiredStockArr: totalExpiredStockArr,
                                        shipmentsTotalData: shipmentsTotalData,
                                        suggestedShipmentsTotalData: suggestedShipmentsTotalData,
                                        deliveredShipmentsTotalData: deliveredShipmentsTotalData,
                                        shippedShipmentsTotalData: shippedShipmentsTotalData,
                                        orderedShipmentsTotalData: orderedShipmentsTotalData,
                                        plannedShipmentsTotalData: plannedShipmentsTotalData,
                                        onholdShipmentsTotalData: onholdShipmentsTotalData,
                                        inventoryTotalData: inventoryTotalData,
                                        adjustmentTotalData: adjustmentTotalData,
                                        nationalAdjustmentTotalData: nationalAdjustmentTotalData,
                                        monthsOfStockArray: monthsOfStockArray,
                                        maxQtyArray: maxQtyArray,
                                        amcTotalData: amcTotalData,
                                        minStockMoS: minStockMoS,
                                        maxStockMoS: maxStockMoS,
                                        unmetDemand: unmetDemand,
                                        inventoryFilteredArray: inventoryArrayForRegion,
                                        regionListFiltered: regionListFiltered,
                                        consumptionFilteredArray: consumptionArrayForRegion,
                                        lastActualConsumptionDate: moment(Date.now()).format("YYYY-MM-DD"),
                                        lastActualConsumptionDateArr: lastActualConsumptionDate,
                                        paColors: paColors,
                                        jsonArrForGraph: jsonArrForGraph,
                                        closingBalanceArray: closingBalanceArray,
                                        loading: false
                                    }
                                    var datasets = [
                                        {
                                            label: i18n.t('static.supplyplan.exipredStock'),
                                            yAxisID: 'A',
                                            type: 'line',
                                            stack: 7,
                                            data: totalExpiredStockArr.map((item, index) => (item.qty > 0 ? item.qty : null)),
                                            fill: false,
                                            borderColor: 'rgb(75, 192, 192)',
                                            tension: 0.1,
                                            showLine: false,
                                            pointStyle: 'triangle',
                                            pointBackgroundColor: '#ED8944',
                                            pointBorderColor: '#212721',
                                            pointRadius: 10
                                        },
                                        {
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
                                            pointRadius: 0,
                                            showInLegend: true,
                                            data: jsonArrForGraph.map((item, index) => (item.consumption))
                                        },
                                        {
                                            label: i18n.t('static.report.actualConsumption'),
                                            yAxisID: 'A',
                                            type: 'line',
                                            stack: 7,
                                            data: consumptionTotalData.map((item, index) => (item.consumptionType == 1 ? item.consumptionQty : null)),
                                            fill: false,
                                            borderColor: 'rgb(75, 192, 192)',
                                            tension: 0.1,
                                            showLine: false,
                                            pointStyle: 'point',
                                            pointBackgroundColor: '#ba0c2f',
                                            pointBorderColor: '#ba0c2f',
                                            pointRadius: 3
                                        },
                                        {
                                            label: i18n.t('static.supplyPlan.delivered'),
                                            stack: 1,
                                            yAxisID: 'A',
                                            backgroundColor: '#002f6c',
                                            borderColor: '#002f6c',
                                            pointBackgroundColor: '#002f6c',
                                            pointBorderColor: '#002f6c',
                                            pointHoverBackgroundColor: '#002f6c',
                                            pointHoverBorderColor: '#002f6c',
                                            data: jsonArrForGraph.map((item, index) => (item.delivered)),
                                        },
                                        {
                                            label: i18n.t('static.supplyPlan.shipped'),
                                            stack: 1,
                                            yAxisID: 'A',
                                            backgroundColor: '#006789',
                                            borderColor: '#006789',
                                            pointBackgroundColor: '#006789',
                                            pointBorderColor: '#006789',
                                            pointHoverBackgroundColor: '#006789',
                                            pointHoverBorderColor: '#006789',
                                            data: jsonArrForGraph.map((item, index) => (item.shipped)),
                                        },
                                        {
                                            label: i18n.t('static.supplyPlan.ordered'),
                                            stack: 1,
                                            yAxisID: 'A',
                                            backgroundColor: '#205493',
                                            borderColor: '#205493',
                                            pointBackgroundColor: '#205493',
                                            pointBorderColor: '#205493',
                                            pointHoverBackgroundColor: '#205493',
                                            pointHoverBorderColor: '#205493',
                                            data: jsonArrForGraph.map((item, index) => (item.ordered)),
                                        },
                                        {
                                            label: i18n.t('static.report.hold'),
                                            stack: 1,
                                            yAxisID: 'A',
                                            backgroundColor: '#205493',
                                            borderColor: '#205493',
                                            pointBackgroundColor: '#205493',
                                            pointBorderColor: '#205493',
                                            pointHoverBackgroundColor: '#205493',
                                            pointHoverBorderColor: '#205493',
                                            data: jsonArrForGraph.map((item, index) => (item.onhold)),
                                        },
                                        {
                                            label: i18n.t('static.report.planned'),
                                            stack: 1,
                                            yAxisID: 'A',
                                            backgroundColor: '#a7c6ed',
                                            borderColor: '#a7c6ed',
                                            pointBackgroundColor: '#a7c6ed',
                                            pointBorderColor: '#a7c6ed',
                                            pointHoverBackgroundColor: '#a7c6ed',
                                            pointHoverBorderColor: '#a7c6ed',
                                            data: jsonArrForGraph.map((item, index) => (item.planned)),
                                        },
                                        {
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
                                            pointStyle: 'circle',
                                            pointRadius: 0,
                                            showInLegend: true,
                                            data: jsonArrForGraph.map((item, index) => (item.stock))
                                        },
                                        {
                                            label: jsonArrForGraph[0].planBasedOn == 1 ? i18n.t('static.supplyPlan.minStockMos') : i18n.t('static.product.minQuantity'),
                                            type: 'line',
                                            stack: 5,
                                            yAxisID: jsonArrForGraph[0].planBasedOn == 1 ? 'B' : 'A',
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
                                            pointRadius: 0,
                                            yValueFormatString: "$#,##0",
                                            lineTension: 0,
                                            data: jsonArrForGraph.map((item, index) => (jsonArrForGraph[0].planBasedOn == 1 ? item.minMos : item.minQty))
                                        },
                                        {
                                            label: jsonArrForGraph[0].planBasedOn == 1 ? i18n.t('static.supplyPlan.maxStockMos') : i18n.t('static.supplyPlan.maxQty'),
                                            type: 'line',
                                            stack: 6,
                                            yAxisID: jsonArrForGraph[0].planBasedOn == 1 ? 'B' : 'A',
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
                                            pointRadius: 0,
                                            showInLegend: true,
                                            yValueFormatString: "$#,##0",
                                            data: jsonArrForGraph.map((item, index) => (jsonArrForGraph[0].planBasedOn == 1 ? item.maxMos : item.maxQty))
                                        }
                                    ];
                                    if (jsonArrForGraph.length > 0 && jsonArrForGraph[0].planBasedOn == 1) {
                                        datasets.push({
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
                                            pointRadius: 0,
                                            showInLegend: true,
                                            data: jsonArrForGraph.map((item, index) => (item.mos))
                                        })
                                    }
                                    var bar = {
                                        labels: [...new Set(jsonArrForGraph.map(ele1 => (ele1.month)))],
                                        datasets: datasets
                                    }
                                    var chartOptions = {
                                        title: {
                                            display: true,
                                            text: (this.state.programSelect).label + " (Local)" + " - " + this.state.viewById == 1 ? getLabelText(programPlanningUnit.planningUnit.label, this.state.lang) : planningUnit.label
                                        },
                                        scales: {
                                            yAxes: (jsonArrForGraph.length > 0 && jsonArrForGraph[0].planBasedOn == 1 ? [{
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
                                            ] : [{
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
                                            }
                                            ]),
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
                                    var planningUnitDataforExport = {
                                        planningUnit: programPlanningUnit.planningUnit,
                                        info: planningUnitInfo,
                                        data: exportData,
                                        bar: bar,
                                        chartOptions: chartOptions,
                                        planBasedOn: programPlanningUnit.planBasedOn,
                                        minQtyPpu: roundARU(programPlanningUnit.minQty, multiplier),
                                        distributionLeadTime: programPlanningUnit.distributionLeadTime,
                                        label: planningUnit.label
                                    }
                                    planningUnitData.push(planningUnitDataforExport)
                                    pcnt = pcnt + 1
                                    if (pcnt == this.state.planningUnitIdsExport.length) {
                                        this.setState({
                                            planningUnitData: planningUnitData,
                                            loading: false
                                        }, () => {
                                            setTimeout(() => {
                                                report == 1 ? this.exportPDF() : this.exportCSV()
                                                document.getElementById("bars_div").style.display = 'none';
                                            }, 2000)
                                        })
                                    }
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    })
                }.bind(this)
            }.bind(this)
        })
    }
    /**
     * This function is called when replan date picker is clicked
     * @param {*} e 
     */
    handleClickMonthBoxSingle = (e) => {
        this.pickAMonthSingle.current.show()
    }
    /**
     * This function is used to update the replan date filter value
     * @param {*} value This is the value that user has selected
     */
    handleAMonthDissmisSingle = (value) => {
        this.setState({ singleValue: value })
    }
    /**
     * This function is used to set the planning unit Ids that are selected for replan
     * @param {*} e This is value of the event
     */
    setPlanningUnitIdsPlan(e) {
        this.setState({
            planningUnitIdsPlan: e,
        })
    }
    /**
     * This function is used to set the planning unit Ids that are selected for export
     * @param {*} e This is value of the event
     */
    setPlanningUnitIdsExport(e) {
        this.setState({
            planningUnitIdsExport: e,
        })
    }
    /**
     * This function is used to set the procurement agent Id that is selected for replan
     * @param {*} e This is value of the event
     */
    setProcurementAgentId(e) {
        this.setState({
            procurementAgentId: e.target.value
        })
    }
    /**
     * This function is used to set the funding source Id that is selected for replan
     * @param {*} e This is value of the event
     */
    setFundingSourceId(e) {
        var budgetList = this.state.budgetListPlanAll.filter(c => c.fundingSource.fundingSourceId == e.target.value);
        this.setState({
            fundingSourceId: e.target.value,
            budgetListPlan: budgetList,
            budgetId: budgetList.length == 1 ? budgetList[0].budgetId : "",
        })
    }
    /**
     * This function is used to set the budget Id that is selected for replan
     * @param {*} e This is value of the event
     */
    setBudgetId(e) {
        this.setState({
            budgetId: e.target.value
        })
    }
    /**
     * This function is used to actually create the plan shipments based on the user inputs
     */
    planShipment() {
        var programId = document.getElementById('programId').value;
        var db1;
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
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: '#BA0C2F'
                })
                this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var dsTransaction = db1.transaction(['dataSource'], 'readwrite');
                var dsTransaction1 = dsTransaction.objectStore('dataSource');
                var dsRequest = dsTransaction1.getAll();
                dsRequest.onsuccess = function (event) {
                    var ssTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                    var ssTransaction1 = ssTransaction.objectStore('shipmentStatus');
                    var ssRequest = ssTransaction1.getAll();
                    ssRequest.onsuccess = function (event) {
                        var cTransaction = db1.transaction(['currency'], 'readwrite');
                        var cTransaction1 = cTransaction.objectStore('currency');
                        var cRequest = cTransaction1.getAll();
                        cRequest.onsuccess = function (event) {
                            var papuTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                            var papuTransaction1 = papuTransaction.objectStore('procurementAgentPlanningUnit');
                            var papuRequest = papuTransaction1.getAll();
                            papuRequest.onsuccess = function (event) {
                                var rcpuTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                                var rcpuTransaction1 = rcpuTransaction.objectStore('realmCountryPlanningUnit');
                                var rcpuRequest = rcpuTransaction1.getAll();
                                rcpuRequest.onsuccess = function (event) {
                                    var showPlanningUnitAndQtyList = []
                                    var generalProgramDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
                                    var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                                    var generalProgramJson = JSON.parse(generalProgramData);
                                    var actionList = generalProgramJson.actionList;
                                    var shipmentBudgetList = generalProgramJson.shipmentBudgetList;
                                    if (shipmentBudgetList == undefined) {
                                        shipmentBudgetList = [];
                                    }
                                    var realmTransaction = db1.transaction(['realm'], 'readwrite');
                                    var realmOs = realmTransaction.objectStore('realm');
                                    var realmRequest = realmOs.get(generalProgramJson.realmCountry.realm.realmId);
                                    realmRequest.onsuccess = function (event) {
                                        var planningUnitsIds = this.state.planningUnitIdsPlan;
                                        var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                                        var curUser = AuthenticationService.getLoggedInUserId();
                                        var username = AuthenticationService.getLoggedInUsername();
                                        var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
                                        for (var pu = 0; pu < planningUnitsIds.length; pu++) {
                                            var programPlanningUnit = this.state.planningUnitListAll.filter(p => p.program.id == generalProgramJson.programId && p.planningUnit.id == planningUnitsIds[pu].value)[0];
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
                                            var planningUnitDataFilter = planningUnitDataList.filter(c => c.planningUnitId == planningUnitsIds[pu].value);
                                            var planningUnitDataIndex = planningUnitDataList.findIndex(c => c.planningUnitId == planningUnitsIds[pu].value);
                                            var programJson = {};
                                            if (planningUnitDataFilter.length > 0) {
                                                var planningUnitData = planningUnitDataFilter[0]
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
                                            var month = moment(this.state.singleValue.year + (this.state.singleValue.month <= 9 ? "-0" + this.state.singleValue.month : "-" + this.state.singleValue.month) + "-01").format("YYYY-MM-DD")
                                            if (programPlanningUnit.planBasedOn == 1) {
                                                var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                                var compare = (moment(month).format("YYYY-MM") >= moment(currentMonth).format("YYYY-MM"));
                                                var supplyPlanData = programJson.supplyPlan;
                                                var shipmentDataList = programJson.shipmentList;
                                                var batchInfoList = programJson.batchInfoList;
                                                var spd1 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(month).format("YYYY-MM"));
                                                var amc = spd1.length > 0 ? Number(spd1[0].amc) : 0;
                                                var spd2 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(month).add(1, 'months').format("YYYY-MM"));
                                                var spd3 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(month).add(2, 'months').format("YYYY-MM"));
                                                var mosForMonth1 = spd1.length > 0 ? spd1[0].mos != null ? parseFloat(spd1[0].mos).toFixed(1) : null : 0;
                                                var mosForMonth2 = spd2.length > 0 ? spd2[0].mos != null ? parseFloat(spd2[0].mos).toFixed(1) : null : 0;
                                                var mosForMonth3 = spd3.length > 0 ? spd3[0].mos != null ? parseFloat(spd3[0].mos).toFixed(1) : null : 0;
                                                var suggestShipment = false;
                                                var useMax = false;
                                                if (compare) {
                                                    if (Number(amc) == 0) {
                                                        suggestShipment = false;
                                                    } else if (Number(mosForMonth1) != 0 && Number(mosForMonth1) < Number(minStockMoSQty) && (Number(mosForMonth2) > Number(minStockMoSQty) || Number(mosForMonth3) > Number(minStockMoSQty))) {
                                                        suggestShipment = false;
                                                    } else if (Number(mosForMonth1) != 0 && Number(mosForMonth1) < Number(minStockMoSQty) && Number(mosForMonth2) < Number(minStockMoSQty) && Number(mosForMonth3) < Number(minStockMoSQty)) {
                                                        suggestShipment = true;
                                                        useMax = true;
                                                    } else if (Number(mosForMonth1) == 0) {
                                                        suggestShipment = true;
                                                        if (Number(mosForMonth2) < Number(minStockMoSQty) && Number(mosForMonth3) < Number(minStockMoSQty)) {
                                                            useMax = true;
                                                        } else {
                                                            useMax = false;
                                                        }
                                                    }
                                                } else {
                                                    suggestShipment = false;
                                                }
                                                if (suggestShipment) {
                                                    var suggestedOrd = 0;
                                                    if (useMax) {
                                                        suggestedOrd = Number(Math.round(amc * Number(maxStockMoSQty)) - Number(spd1[0].closingBalance) + Number(spd1[0].unmetDemand));
                                                    } else {
                                                        suggestedOrd = Number(Math.round(amc * Number(minStockMoSQty)) - Number(spd1[0].closingBalance) + Number(spd1[0].unmetDemand));
                                                    }
                                                }
                                            } else {
                                                var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                                var compare = (moment(month).format("YYYY-MM") >= moment(currentMonth).format("YYYY-MM"));
                                                var supplyPlanData = programJson.supplyPlan;
                                                var shipmentDataList = programJson.shipmentList;
                                                var batchInfoList = programJson.batchInfoList;
                                                var spd1 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(month).add(programPlanningUnit.distributionLeadTime, 'months').format("YYYY-MM"));
                                                var amc = spd1.length > 0 ? Number(spd1[0].amc) : 0;
                                                var spd2 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(month).add(1 + programPlanningUnit.distributionLeadTime, 'months').format("YYYY-MM"));
                                                var spd3 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(month).add(2 + programPlanningUnit.distributionLeadTime, 'months').format("YYYY-MM"));
                                                var mosForMonth1 = spd1.length > 0 ? spd1[0].mos != null ? parseFloat(spd1[0].mos).toFixed(1) : null : 0;
                                                var mosForMonth2 = spd2.length > 0 ? spd2[0].mos != null ? parseFloat(spd2[0].mos).toFixed(1) : null : 0;
                                                var mosForMonth3 = spd3.length > 0 ? spd3[0].mos != null ? parseFloat(spd3[0].mos).toFixed(1) : null : 0;
                                                var cbForMonth1 = spd1.length > 0 ? spd1[0].closingBalance : 0;
                                                var cbForMonth2 = spd2.length > 0 ? spd2[0].closingBalance : 0;
                                                var cbForMonth3 = spd3.length > 0 ? spd3[0].closingBalance : 0;
                                                var unmetDemandForMonth1 = spd1.length > 0 ? spd1[0].unmetDemand : 0;
                                                var maxStockForMonth1 = spd1.length > 0 ? spd1[0].maxStock : 0;
                                                var minStockForMonth1 = spd1.length > 0 ? spd1[0].minStock : 0;
                                                var suggestShipment = false;
                                                var useMax = false;
                                                if (compare) {
                                                    if (Number(amc) == 0) {
                                                        suggestShipment = false;
                                                    } else if (Number(cbForMonth1) != 0 && Number(cbForMonth1) < Number(programPlanningUnit.minQty) && (Number(cbForMonth2) > Number(programPlanningUnit.minQty) || Number(cbForMonth3) > Number(programPlanningUnit.minQty))) {
                                                        suggestShipment = false;
                                                    } else if (Number(cbForMonth1) != 0 && Number(cbForMonth1) < Number(programPlanningUnit.minQty) && Number(cbForMonth2) < Number(programPlanningUnit.minQty) && Number(cbForMonth3) < Number(programPlanningUnit.minQty)) {
                                                        suggestShipment = true;
                                                        useMax = true;
                                                    } else if (Number(cbForMonth1) == 0) {
                                                        suggestShipment = true;
                                                        if (Number(cbForMonth2) < Number(programPlanningUnit.minQty) && Number(cbForMonth3) < Number(programPlanningUnit.minQty)) {
                                                            useMax = true;
                                                        } else {
                                                            useMax = false;
                                                        }
                                                    }
                                                } else {
                                                    suggestShipment = false;
                                                }
                                                if (suggestShipment) {
                                                    var suggestedOrd = 0;
                                                    if (useMax) {
                                                        suggestedOrd = Number(Math.round(Number(maxStockForMonth1)) - Number(cbForMonth1) + Number(unmetDemandForMonth1));
                                                    } else {
                                                        suggestedOrd = Number(Math.round(Number(minStockForMonth1)) - Number(cbForMonth1) + Number(unmetDemandForMonth1));
                                                    }
                                                }
                                            }
                                            if (suggestShipment) {
                                                if (suggestedOrd <= 0) {
                                                } else {
                                                    var procurementAgentPlanningUnit = papuRequest.result.filter(c => c.procurementAgent.id == this.state.procurementAgentId && c.planningUnit.id == planningUnitsIds[pu].value && c.active);
                                                    var pricePerUnit = 0;
                                                    var programPriceList = programPlanningUnit.programPlanningUnitProcurementAgentPrices.filter(c => c.program.id == generalProgramJson.programId && c.procurementAgent.id == this.state.procurementAgentId && c.planningUnit.id == planningUnitsIds[pu].value && c.active);
                                                    if (programPriceList.length > 0) {
                                                        pricePerUnit = Number(programPriceList[0].price);
                                                    } else {
                                                        if (procurementAgentPlanningUnit.length > 0) {
                                                            pricePerUnit = Number(procurementAgentPlanningUnit[0].catalogPrice);
                                                        } else {
                                                            pricePerUnit = programPlanningUnit.catalogPrice
                                                        }
                                                    }
                                                    var c = cRequest.result.filter(c => c.currencyId == USD_CURRENCY_ID)[0];
                                                    var rcpu = rcpuRequest.result.filter(c => c.multiplier == 1 && c.planningUnit.id == planningUnitsIds[pu].value)[0]
                                                    var programId = (document.getElementById("programId").value).split("_")[0];
                                                    var planningUnitId = planningUnitsIds[pu].value;
                                                    var batchNo = (BATCH_PREFIX).concat(paddingZero(programId, 0, 6)).concat(paddingZero(planningUnitId, 0, 8)).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                                                    var expiryDate = moment(month).add(programPlanningUnit.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                                                    var batchInfo = [{
                                                        shipmentTransBatchInfoId: 0,
                                                        batch: {
                                                            batchNo: batchNo,
                                                            expiryDate: expiryDate,
                                                            batchId: 0,
                                                            autoGenerated: true,
                                                            createdDate: moment(month).format("YYYY-MM-DD")
                                                        },
                                                        shipmentQty: suggestedOrd
                                                    }]
                                                    var tempShipmentId = planningUnitsIds[pu].value.toString().concat(shipmentDataList.length);
                                                    shipmentDataList.push({
                                                        accountFlag: true,
                                                        active: true,
                                                        dataSource: {
                                                            id: QAT_SUGGESTED_DATA_SOURCE_ID,
                                                            label: (dsRequest.result).filter(c => c.dataSourceId == QAT_SUGGESTED_DATA_SOURCE_ID)[0].label
                                                        },
                                                        realmCountryPlanningUnit: {
                                                            id: rcpu.realmCountryPlanningUnitId,
                                                            label: rcpu.label,
                                                            multiplier: rcpu.multiplier
                                                        },
                                                        erpFlag: false,
                                                        localProcurement: false,
                                                        freightCost: Number(Number(pricePerUnit) * Number(suggestedOrd)) * (Number(Number(generalProgramJson.seaFreightPerc) / 100)),
                                                        notes: i18n.t('static.supplyPlan.planByDateNote'),
                                                        planningUnit: {
                                                            id: planningUnitsIds[pu].value,
                                                            label: (this.state.planningUnitList.filter(c => c.value == planningUnitsIds[pu].value)[0]).actualLabel
                                                        },
                                                        procurementAgent: {
                                                            id: this.state.procurementAgentId,
                                                            code: this.state.procurementAgentListPlan.filter(c => c.procurementAgentId == this.state.procurementAgentId)[0].procurementAgentCode,
                                                            label: this.state.procurementAgentListPlan.filter(c => c.procurementAgentId == this.state.procurementAgentId)[0].label
                                                        },
                                                        productCost: (Number(pricePerUnit) * Number(suggestedOrd)).toFixed(2),
                                                        shipmentRcpuQty: suggestedOrd,
                                                        shipmentQty: suggestedOrd,
                                                        rate: pricePerUnit,
                                                        shipmentId: 0,
                                                        shipmentMode: "Sea",
                                                        shipmentStatus: {
                                                            id: PLANNED_SHIPMENT_STATUS,
                                                            label: (ssRequest.result).filter(c => c.shipmentStatusId == PLANNED_SHIPMENT_STATUS)[0].label
                                                        },
                                                        suggestedQty: suggestedOrd,
                                                        budget: {
                                                            id: this.state.budgetId != "" ? this.state.budgetId : "",
                                                            code: this.state.budgetId != "" ? this.state.budgetListPlanAll.filter(c => c.budgetId == this.state.budgetId)[0].budgetCode : "",
                                                            label: this.state.budgetId != "" ? this.state.budgetListPlanAll.filter(c => c.budgetId == this.state.budgetId)[0].label : {},
                                                        },
                                                        emergencyOrder: false,
                                                        currency: c,
                                                        fundingSource: {
                                                            id: this.state.fundingSourceId,
                                                            code: this.state.fundingSourceListPlan.filter(c => c.fundingSourceId == this.state.fundingSourceId)[0].fundingSourceCode,
                                                            label: this.state.fundingSourceListPlan.filter(c => c.fundingSourceId == this.state.fundingSourceId)[0].label,
                                                        },
                                                        plannedDate: null,
                                                        submittedDate: null,
                                                        approvedDate: null,
                                                        shippedDate: null,
                                                        arrivedDate: null,
                                                        expectedDeliveryDate: moment(month).format("YYYY-MM-DD"),
                                                        receivedDate: null,
                                                        index: shipmentDataList.length,
                                                        tempShipmentId: tempShipmentId,
                                                        batchInfoList: batchInfo,
                                                        orderNo: "",
                                                        createdBy: {
                                                            userId: curUser,
                                                            username: username
                                                        },
                                                        createdDate: curDate,
                                                        lastModifiedBy: {
                                                            userId: curUser,
                                                            username: username
                                                        },
                                                        lastModifiedDate: curDate,
                                                        parentLinkedShipmentId: null,
                                                        tempParentLinkedShipmentId: null
                                                    })
                                                    shipmentBudgetList.push({
                                                        shipmentId: 0,
                                                        tempShipmentId: tempShipmentId,
                                                        shipmentAmt: Number(Number(pricePerUnit) * Number(suggestedOrd)) * (Number(Number(generalProgramJson.seaFreightPerc) / 100)) + Number((Number(pricePerUnit) * Number(suggestedOrd)).toFixed(2)),
                                                        budgetId: this.state.budgetId != "" ? this.state.budgetId : "",
                                                        currencyId: c.currencyId,
                                                        conversionRateToUsd: c.conversionRateToUsd
                                                    })
                                                    showPlanningUnitAndQtyList.push({
                                                        planningUnitLabel: getLabelText(programPlanningUnit.planningUnit.label, this.state.lang),
                                                        shipmentQty: suggestedOrd
                                                    })
                                                    var batchDetails = {
                                                        batchId: 0,
                                                        batchNo: batchNo,
                                                        planningUnitId: planningUnitsIds[pu].value,
                                                        expiryDate: expiryDate,
                                                        createdDate: moment(month).format("YYYY-MM-DD"),
                                                        autoGenerated: true
                                                    }
                                                    batchInfoList.push(batchDetails);
                                                }
                                            }
                                            programJson.shipmentList = shipmentDataList;
                                            programJson.batchInfoList = batchInfoList;
                                            if (planningUnitDataIndex != -1) {
                                                planningUnitDataList[planningUnitDataIndex].planningUnitData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                                            } else {
                                                planningUnitDataList.push({ planningUnitId: planningUnitsIds[pu].value, planningUnitData: (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString() });
                                            }
                                        }
                                        for (var p = 0; p < planningUnitsIds.length; p++) {
                                            actionList.push({
                                                planningUnitId: planningUnitsIds[p].value,
                                                type: SHIPMENT_MODIFIED,
                                                date: moment(month).startOf('month').format("YYYY-MM-DD")
                                            })
                                        }
                                        this.setState({
                                            showPlanningUnitAndQtyList: showPlanningUnitAndQtyList
                                        })
                                        generalProgramJson.actionList = actionList;
                                        generalProgramJson.lastModifiedDate=moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                                        generalProgramJson.shipmentBudgetList = shipmentBudgetList;
                                        programRequest.result.programData.planningUnitDataList = planningUnitDataList;
                                        programRequest.result.programData.generalData = (CryptoJS.AES.encrypt(JSON.stringify(generalProgramJson), SECRET_KEY)).toString();
                                        var transaction1 = db1.transaction(['programData'], 'readwrite');
                                        var programTransaction1 = transaction1.objectStore('programData');
                                        var putRequest = programTransaction1.put(programRequest.result);
                                        putRequest.onsuccess = function (event) {
                                            var programId = (document.getElementById("programId").value)
                                            var puList = [...new Set(this.state.planningUnitIdsPlan.map(ele => ele.value))];
                                            if (puList.length > 0 && showPlanningUnitAndQtyList.length > 0) {
                                                calculateSupplyPlan(programId, 0, 'programData', 'shipment1', this, puList, moment(this.state.singleValue.year + (this.state.singleValue.month <= 9 ? "-0" + this.state.singleValue.month : "-" + this.state.singleValue.month) + "-01").format("YYYY-MM-DD"));
                                            } else {
                                                this.setState({
                                                    showPlanningUnitAndQtyList: [],
                                                    showPlanningUnitAndQty: 1
                                                })
                                            }
                                        }.bind(this)
                                    }.bind(this)
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }
}