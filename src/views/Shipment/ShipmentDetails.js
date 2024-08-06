import CryptoJS from 'crypto-js';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { Formik } from 'formik';
import moment from "moment";
import React from "react";
import Picker from 'react-month-picker';
import { MultiSelect } from "react-multi-select-component";
import NumberFormat from "react-number-format";
import { Prompt } from 'react-router';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import {
    Button,
    Card, CardBody,
    CardFooter,
    Form,
    FormFeedback,
    FormGroup,
    Input, InputGroup,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Table
} from 'reactstrap';
import * as Yup from 'yup';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { generateRandomAplhaNumericCode, paddingZero } from "../../CommonComponent/JavascriptCommonFunctions.js";
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { BATCH_PREFIX, INDEXED_DB_NAME, INDEXED_DB_VERSION, MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS, PLANNED_SHIPMENT_STATUS, QAT_SUGGESTED_DATA_SOURCE_ID, SECRET_KEY, SHIPMENT_MODIFIED, TBD_FUNDING_SOURCE, TBD_PROCUREMENT_AGENT_ID, USD_CURRENCY_ID } from '../../Constants.js';
import i18n from '../../i18n';
import AuthenticationService from "../Common/AuthenticationService.js";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ShipmentsInSupplyPlanComponent from "../SupplyPlan/ShipmentsInSupplyPlanForDataEntry";
import { calculateSupplyPlan } from "../SupplyPlan/SupplyPlanCalculations.js";
const entityname = i18n.t('static.dashboard.shipmentdetails');
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
 * This component is used to allow the users to do the data entry for the shipment records
 */
export default class ShipmentDetails extends React.Component {
    constructor(props) {
        super(props);
        this.options = props.options;
        var startDate = moment(Date.now()).subtract(6, 'months').startOf('month').format("YYYY-MM-DD");
        var endDate = moment(Date.now()).add(18, 'months').startOf('month').format("YYYY-MM-DD")
        this.state = {
            loading: true,
            message: '',
            lang: localStorage.getItem("lang"),
            programList: [],
            categoryList: [],
            productList: [],
            consumptionDataList: [],
            changedFlag: 0,
            planningUnitList: [],
            planningUnitListForJexcel: [],
            planningUnitListForJexcelAll: [],
            productCategoryId: '',
            shipmentsEl: '',
            timeout: 0,
            showShipments: 0,
            shipmentChangedFlag: 0,
            shipmentModalTitle: "",
            shipmentType: localStorage.getItem("sesShipmentType") != "" ? JSON.parse(localStorage.getItem("sesShipmentType")) : [{ value: 1, label: i18n.t('static.shipment.manualShipments') }, { value: 2, label: i18n.t('static.shipment.erpShipment') }],
            shipmentTypeIds: localStorage.getItem("sesShipmentType") != "" ? [...new Set(JSON.parse(localStorage.getItem("sesShipmentType")).map(ele => ele.value))] : [1, 2],
            rangeValue: localStorage.getItem("sesRangeValue") != "" ? JSON.parse(localStorage.getItem("sesRangeValue")) : { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS, month: new Date().getMonth() + 1 },
            programId: "",
            planningUnitId: "",
            currencyList: [],
            dataSourceList: [],
            fundingSourceList: [],
            procurementAgentList: [],
            budgetList: [],
            shipmentStatusList: [],
            showBatchSaveButton: false,
            programQPLDetails: [],
            replanModal: false,
            singleValue: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
            minDateSingle: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
            maxDateSingle: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            planningUnitIdsPlan: [],
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
            planningUnit: [],
            puData: [],
            shipmentListForSelectedPlanningUnits: [],
            shipmentListForSelectedPlanningUnitsUnfiltered: [],
            shipmentQtyTotalForPopup: 0,
            batchQtyTotalForPopup: 0
        }
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.formSubmit = this.formSubmit.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
        this.updateState = this.updateState.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.hideThirdComponent = this.hideThirdComponent.bind(this);
        this.hideFourthComponent = this.hideFourthComponent.bind(this);
        this.hideFifthComponent = this.hideFifthComponent.bind(this);
        this.updateDataType = this.updateDataType.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.pickRange = React.createRef();
        this.pickAMonthSingle = React.createRef();
        this.openBatchPopUp = this.openBatchPopUp.bind(this);
        this.exportCSV = this.exportCSV.bind(this);
        this.toggleReplan = this.toggleReplan.bind(this);
        this.setProcurementAgentId = this.setProcurementAgentId.bind(this);
        this.setFundingSourceId = this.setFundingSourceId.bind(this);
        this.setBudgetId = this.setBudgetId.bind(this);
        this.planShipment = this.planShipment.bind(this)
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
     * This function is used to export the shipment data entry template so that user can copy paste the bulk data
     */
    exportCSV() {
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(i18n.t('static.supplyplan.shipmentDataEntry'));
        worksheet.columns = [
            { header: i18n.t('static.common.active'), key: 'string', width: 25 },
            { header: i18n.t('static.supplyPlan.erpFlag'), key: 'string', width: 25 },
            { header: i18n.t('static.report.id'), key: 'name', width: 25 },
            { header: i18n.t('static.dataEntry.planningUnitId'), key: 'name', width: 25 },
            { header: i18n.t('static.shipmentDataEntry.shipmentStatus'), key: 'name', width: 25 },
            { header: i18n.t('static.common.receivedate'), key: 'string', width: 25, style: { numFmt: 'YYYY-MM-DD' } },
            { header: i18n.t('static.supplyPlan.shipmentMode'), key: 'name', width: 40 },
            { header: i18n.t('static.procurementagent.procurementagent'), key: 'name', width: 40 },
            { header: i18n.t('static.shipmentDataEntry.localProcurement'), key: 'name', width: 32 },
            { header: i18n.t('static.shipmentDataentry.procurementAgentOrderNo'), key: 'name', width: 32 },
            { header: i18n.t('static.shipmentDataentry.procurementAgentPrimeLineNo'), key: 'name', width: 32 },
            { header: i18n.t('static.supplyPlan.alternatePlanningUnit'), key: 'name', width: 32 },
            { header: i18n.t('static.shipment.shipmentQtyARU'), key: 'name', width: 12 },
            { header: i18n.t('static.unit.multiplierFromARUTOPU'), key: 'name', width: 12 },
            { header: i18n.t('static.supplyPlan.quantityPU'), key: 'name', width: 12 },
            { header: i18n.t('static.supplyPlan.emergencyOrder'), key: 'name', width: 25 },
            { header: i18n.t('static.subfundingsource.fundingsource'), key: 'string', width: 25 },
            { header: i18n.t('static.dashboard.budget'), key: 'string', width: 25 },
            { header: i18n.t('static.dashboard.currency'), key: 'string', width: 25 },
            { header: i18n.t('static.supplyPlan.pricePerPlanningUnit'), key: 'string', width: 25 },
            { header: i18n.t('static.shipment.productcost'), key: 'string', width: 25 },
            { header: i18n.t('static.shipment.freightcost'), key: 'string', width: 25 },
            { header: i18n.t('static.shipment.totalCost'), key: 'string', width: 25 },
            { header: i18n.t('static.datasource.datasource'), key: 'string', width: 25 },
            { header: i18n.t('static.program.notes'), key: 'string', width: 25 },
        ];
        worksheet.getRow(1).eachCell({ includeEmpty: true }, function (cell, colNumber) {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF00' },
                bgColor: { argb: 'FF0000FF' }
            }
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        let activeDropdown = ["True", "False"];
        worksheet.dataValidations.add('A2:A1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${activeDropdown.join(",")}"`],
            showErrorMessage: true
        });
        for (let i = 0; i < 1000; i++) {
            worksheet.getCell('F' + (+i + 2)).note = i18n.t('static.dataEntry.dateValidation');
        }
        let shipmentModeDropdown = [i18n.t('static.supplyPlan.sea'), i18n.t('static.supplyPlan.air'), i18n.t('static.dataentry.road')];
        worksheet.dataValidations.add('G2:G1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${shipmentModeDropdown.join(",")}"`],
            showErrorMessage: true
        });
        let isLocalProcurementAgentDropdown = ["True", "False"];
        worksheet.dataValidations.add('I2:I1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${isLocalProcurementAgentDropdown.join(",")}"`],
            showErrorMessage: true
        });
        let emergencyShipmentDropdown = ["True", "False"];
        worksheet.dataValidations.add('P2:P1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${emergencyShipmentDropdown.join(",")}"`],
            showErrorMessage: true
        });
        let dataSourceVar = [];
        let datasourceList = this.state.dataSourceList.filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
        for (let i = 0; i < datasourceList.length; i++) {
            dataSourceVar.push(datasourceList[i].name);
        }
        worksheet.dataValidations.add('X2:X1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${dataSourceVar.join(",")}"`],
            showErrorMessage: true
        });
        let currencyVar = [];
        let currencyList = this.state.currencyList.filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
        for (let i = 0; i < currencyList.length; i++) {
            currencyVar.push(currencyList[i].name);
        }
        worksheet.dataValidations.add('S2:S1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${currencyVar.join(",")}"`],
            showErrorMessage: true
        });
        let fundingSourceVar = [];
        let fundingSourceList = this.state.fundingSourceList.filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
        for (let i = 0; i < fundingSourceList.length; i++) {
            fundingSourceVar.push(fundingSourceList[i].name);
        }
        worksheet.dataValidations.add('Q2:Q1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${fundingSourceVar.join(",")}"`],
            showErrorMessage: true
        });
        let procurementAgentVar = [];
        let procurementAgentList = this.state.procurementAgentList.filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
        for (let i = 0; i < procurementAgentList.length; i++) {
            procurementAgentVar.push(procurementAgentList[i].name);
        }
        worksheet.dataValidations.add('H2:H1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${procurementAgentVar.join(",")}"`],
            showErrorMessage: true
        });
        let budgetVar = [];
        let budgetList = this.state.budgetList.slice(1).filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
        for (let i = 0; i < budgetList.length; i++) {
            budgetVar.push(budgetList[i].name);
        }
        worksheet.dataValidations.add('R2:R1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${budgetVar.join(",")}"`],
            showErrorMessage: true
        });
        let shipmentStatusVar = [];
        let shipmentStatusList = this.state.shipmentStatusList.filter(c => c.active.toString() == "true");
        for (let i = 0; i < shipmentStatusList.length; i++) {
            shipmentStatusVar.push(shipmentStatusList[i].name);
        }
        worksheet.dataValidations.add('E2:E1000', {
            type: 'list',
            allowBlank: false,
            formulae: [`"${shipmentStatusVar.join(",")}"`],
            showErrorMessage: true
        });
        worksheet.dataValidations.add('M2:M1000', {
            type: 'whole',
            operator: 'greaterThan',
            showErrorMessage: true,
            formulae: [-1]
        });
        worksheet.dataValidations.add('T2:T1000', {
            type: 'whole',
            operator: 'greaterThan',
            showErrorMessage: true,
            formulae: [-1]
        });
        worksheet.dataValidations.add('V2:V1000', {
            type: 'whole',
            operator: 'greaterThan',
            showErrorMessage: true,
            formulae: [-1]
        });
        for (let i = 0; i < 1000; i++) {
            worksheet.getCell('B' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
            worksheet.getCell('C' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
            worksheet.getCell('K' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
            worksheet.getCell('O' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
            worksheet.getCell('W' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
            worksheet.getCell('N' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
            worksheet.getCell('O' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
            worksheet.getCell('U' + (+i + 2)).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc' },
                bgColor: { argb: '96C8FB' }
            }
        }
        worksheet.protect();
        worksheet.getColumn('A').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('D').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('E').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('F').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('G').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('H').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('I').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('J').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('L').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('M').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('P').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('Q').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('R').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('S').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('T').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('V').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('X').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        worksheet.getColumn('Y').eachCell({ includeEmpty: true }, function (cell, rowNumber) {
            cell.protection = { locked: false };
        });
        workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, i18n.t('static.supplyplan.shipmentDataEntry') + '.xlsx');
        })
    }
    /**
     * This function is used to update the shipment date range filter value
     * @param {*} value This is the value that user has selected
     */
    handleRangeDissmis(value) {
        var cont = false;
        if (this.state.shipmentChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            this.setState({ rangeValue: value, shipmentChangedFlag: 0 })
            localStorage.setItem("sesRangeValue", JSON.stringify(value));
            this.formSubmit(this.state.planningUnit, value);
        }
    }
    /**
     * This method is used to update the shipment type
     * @param {*} value This is the value of data type that user has selected
     */
    updateDataType(value) {
        var cont = false;
        if (this.state.shipmentChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            var shipmentTypeIds = value.map(ele => ele.value)
            this.setState({
                shipmentType: value,
                shipmentChangedFlag: 0,
                shipmentTypeIds: shipmentTypeIds
            }, () => {
                localStorage.setItem("sesShipmentType", JSON.stringify(value));
                document.getElementById("shipmentsDetailsTableDiv").style.display = "none";
                if (document.getElementById("addRowButtonId") != null) {
                    document.getElementById("addRowButtonId").style.display = "none";
                }
                if (this.state.planningUnit.length > 0 && (value != "" && value != undefined ? value.value : 0) != 0) {
                    this.formSubmit(this.state.planningUnit, this.state.rangeValue);
                }
            })
        }
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
        if (this.state.shipmentChangedFlag == 1 || this.state.shipmentBatchInfoChangedFlag == 1 || this.state.shipmentDatesChangedFlag == 1 || this.state.shipmentQtyChangedFlag == 1) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }
    /**
     * This function is used to fetch list all the offline programs that the user have downloaded
     */
    componentDidMount = function () {
        document.getElementById("shipmentsDetailsTable").closest('.card').classList.add("removeCardwrap");
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
            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
            var program = transaction.objectStore('programQPLDetails');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: '#BA0C2F'
                })
                this.hideFirstComponent()
            }.bind(this);
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var programJson = {
                            label: myResult[i].programCode + "~v" + myResult[i].version,
                            value: myResult[i].id
                        }
                        proList.push(programJson)
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
                if (document.getElementById("addRowButtonId") != null) {
                    document.getElementById("addRowButtonId").style.display = "none";
                }
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
        }.bind(this)
    };
    /**
     * This function is used to fetch list all the planning units based on the programs that the user has selected
     * @param {*} value This is value of the program that is selected either by user or is autoselected
     */
    getPlanningUnitList(value) {
        var cont = false;
        if (this.state.shipmentChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            document.getElementById("shipmentsDetailsTableDiv").style.display = "none";
            if (document.getElementById("addRowButtonId") != null) {
                document.getElementById("addRowButtonId").style.display = "none";
            }
            this.setState({
                programSelect: value,
                programId: value != "" && value != undefined ? value != "" && value != undefined ? value.value : 0 : 0,
                planningUnit: [],
                loading: true,
                shipmentChangedFlag: 0
            })
            var programId = value != "" && value != undefined ? value.value : 0;
            if (programId != 0) {
                localStorage.setItem("sesProgramId", programId);
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
                    var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                    var planningunitRequest = planningunitOs.getAll();
                    planningunitRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            color: '#BA0C2F'
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
                                    var proList = [];
                                    var planningUnitListForJexcel = [];
                                    for (var i = 0; i < myResult.length; i++) {
                                        if (myResult[i].program.id == programId && myResult[i].active == true) {
                                            var productJson = {
                                                label: getLabelText(myResult[i].planningUnit.label, this.state.lang),
                                                value: myResult[i].planningUnit.id,
                                                actualLabel: myResult[i].planningUnit.label
                                            }
                                            proList.push(productJson)
                                            var productJson1 = {
                                                name: getLabelText(myResult[i].planningUnit.label, this.state.lang),
                                                id: myResult[i].planningUnit.id
                                            }
                                            planningUnitListForJexcel.push(productJson1)
                                        }
                                    }
                                    this.setState({
                                        planningUnitList: proList.sort(function (a, b) {
                                            a = a.label.toLowerCase();
                                            b = b.label.toLowerCase();
                                            return a < b ? -1 : a > b ? 1 : 0;
                                        }),
                                        planningUnitListForJexcelAll: planningUnitListForJexcel.sort(function (a, b) {
                                            a = a.name.toLowerCase();
                                            b = b.name.toLowerCase();
                                            return a < b ? -1 : a > b ? 1 : 0;
                                        }),
                                        planningUnitListAll: myResult,
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
                                        loading: false
                                    })
                                    var planningUnitIdProp = '';
                                    if (this.props.match.params.planningUnitId != '' && this.props.match.params.planningUnitId != undefined) {
                                        planningUnitIdProp = this.props.match.params.planningUnitId;
                                        var proListFiltered = proList.filter(c => c.value == planningUnitIdProp);
                                        if (planningUnitIdProp != '' && planningUnitIdProp != undefined && proListFiltered.length > 0) {
                                            var planningUnit = [{ value: planningUnitIdProp, label: proListFiltered[0].label }];
                                            this.setState({
                                                planningUnit: planningUnit,
                                            })
                                            this.formSubmit(planningUnit, this.state.rangeValue);
                                        }
                                    }
                                    else if (localStorage.getItem("sesPlanningUnitIdMulti") != '' && localStorage.getItem("sesPlanningUnitIdMulti") != undefined) {
                                        planningUnitIdProp = localStorage.getItem("sesPlanningUnitIdMulti");
                                        if (planningUnitIdProp != '' && planningUnitIdProp != undefined) {
                                            var planningUnitIdSession = JSON.parse(planningUnitIdProp);
                                            var updatePlanningUnitList = [];
                                            for (var pu = 0; pu < planningUnitIdSession.length; pu++) {
                                                if (proList.filter(c => c.value == planningUnitIdSession[pu].value).length > 0) {
                                                    updatePlanningUnitList.push(planningUnitIdSession[pu]);
                                                }
                                            }
                                            this.setState({
                                                planningUnit: updatePlanningUnitList,
                                            })
                                            this.formSubmit(updatePlanningUnitList, this.state.rangeValue);
                                        }
                                    }
                                    else if (proList.length == 1) {
                                        planningUnitIdProp = proList[0].value;
                                        if (planningUnitIdProp != '' && planningUnitIdProp != undefined) {
                                            var planningUnit = [{ value: planningUnitIdProp, label: proList.filter(c => c.value == planningUnitIdProp)[0].label }];
                                            this.setState({
                                                planningUnit: planningUnit,
                                            })
                                            this.formSubmit(planningUnit, this.state.rangeValue);
                                        }
                                    }
                                }.bind(this);
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            } else {
                this.setState({
                    loading: false,
                    planningUnitList: [],
                    planningUnitListForJexcel: [],
                    planningUnitListForJexcelAll: [],
                    puData: []
                })
            }
        }
    }
    /**
     * This function is used fetch all the shipment records based on the filters and build all the necessary data
     * @param {*} value This is the value of planning unit
     * @param {*} rangeValue This is the value of date range that is selected
     */
    formSubmit(value, rangeValue) {
        var cont = false;
        if (this.state.shipmentChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }
        } else {
            cont = true;
        }
        if (cont == true) {
            let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
            let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
            this.setState({ loading: true, shipmentChangedFlag: 0 })
            var programId = document.getElementById('programId').value;
            this.setState({ programId: programId, planningUnit: value });
            var puList = value;
            var programId = document.getElementById("programId").value;
            if (puList.length > 0) {
                localStorage.setItem("sesPlanningUnitIdMulti", JSON.stringify(value));
                document.getElementById("shipmentsDetailsTableDiv").style.display = "block";
                if (document.getElementById("addRowButtonId") != null) {
                    if ((this.state.shipmentTypeIds).includes(1)) {
                        document.getElementById("addRowButtonId").style.display = "block";
                        var roleList = AuthenticationService.getLoggedInUserRole();
                        if ((roleList.length == 1 && roleList[0].roleId == 'ROLE_GUEST_USER') || this.state.programQPLDetails.filter(c => c.id == this.state.programId)[0].readonly) {
                            document.getElementById("addRowButtonId").style.display = "none";
                        }
                    } else {
                        document.getElementById("addRowButtonId").style.display = "none";
                    }
                }
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
                        var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
                        var puData = [];
                        var shipmentListForSelectedPlanningUnits = [];
                        var shipmentListForSelectedPlanningUnitsUnfiltered = [];
                        var generalProgramDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData.generalData, SECRET_KEY);
                        var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                        var generalProgramJson = JSON.parse(generalProgramData);
                        var planningUnitListForJexcel = this.state.planningUnitListForJexcelAll;
                        var planningUnitListForJexcelUpdated = [];
                        for (var pu = 0; pu < puList.length; pu++) {
                            planningUnitListForJexcelUpdated.push(planningUnitListForJexcel.filter(c => c.id == puList[pu].value)[0]);
                            var planningUnitDataFilter = planningUnitDataList.filter(c => c.planningUnitId == puList[pu].value);
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
                            var programPlanningUnit = ((this.state.planningUnitListAll).filter(p => p.planningUnit.id == puList[pu].value))[0];
                            var shipmentListUnFiltered = programJson.shipmentList;
                            shipmentListForSelectedPlanningUnitsUnfiltered = shipmentListForSelectedPlanningUnitsUnfiltered.concat(shipmentListUnFiltered);
                            var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == puList[pu].value && c.active.toString() == "true");
                            if (this.state.shipmentTypeIds.length == 1 && (this.state.shipmentTypeIds).includes(1)) {
                                shipmentList = shipmentList.filter(c => c.erpFlag.toString() == "false");
                            } else if (this.state.shipmentTypeIds.length == 1 && (this.state.shipmentTypeIds).includes(2)) {
                                shipmentList = shipmentList.filter(c => c.erpFlag.toString() == "true");
                            }
                            shipmentList = shipmentList.filter(c => c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? moment(c.receivedDate).format("YYYY-MM-DD") >= moment(startDate).format("YYYY-MM-DD") && moment(c.receivedDate).format("YYYY-MM-DD") <= moment(stopDate).format("YYYY-MM-DD") : moment(c.expectedDeliveryDate).format("YYYY-MM-DD") >= moment(startDate).format("YYYY-MM-DD") && moment(c.expectedDeliveryDate).format("YYYY-MM-DD") <= moment(stopDate).format("YYYY-MM-DD"))
                            shipmentListForSelectedPlanningUnits = shipmentListForSelectedPlanningUnits.concat(shipmentList);
                            puData.push({
                                id: puList[pu].value,
                                shelfLife: programPlanningUnit.shelfLife,
                                catalogPrice: programPlanningUnit.catalogPrice,
                                programJson: programJson,
                                shipmentListUnFiltered: shipmentListUnFiltered,
                                shipmentList: shipmentList,
                                showShipments: 1,
                                programPlanningUnitForPrice: programPlanningUnit,
                            })
                        }
                        this.setState({
                            generalProgramJson: generalProgramJson,
                            puData: puData,
                            shipmentListForSelectedPlanningUnits: shipmentListForSelectedPlanningUnits,
                            shipmentListForSelectedPlanningUnitsUnfiltered: shipmentListForSelectedPlanningUnitsUnfiltered,
                            planningUnitListForJexcel: planningUnitListForJexcelUpdated
                        })
                        this.refs.shipmentChild.showShipmentData();
                    }.bind(this)
                }.bind(this)
            } else {
                document.getElementById("shipmentsDetailsTableDiv").style.display = "none";
                if (document.getElementById("addRowButtonId") != null) {
                    document.getElementById("addRowButtonId").style.display = "none";
                }
                this.setState({ loading: false });
            }
        }
    }
    /**
     * This function is called when cancel button is clicked
     */
    cancelClicked() {
        var cont = false;
        if (this.state.shipmentChangedFlag == 1) {
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
                shipmentChangedFlag: 0,
                shipmentBatchInfoChangedFlag: 0,
                shipmentQtyChangedFlag: 0,
                shipmentDatesChangedFlag: 0
            }, () => {
                let id = AuthenticationService.displayDashboardBasedOnRole();
                this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
            })
        }
    }
    /**
     * This function is used to toggle the batch details/Shipment dates or strategic model
     * @param {*} method This method value is used to check if unsaved changes alert should be displayed or not
     */
    toggleLarge(method) {
        var cont = false;
        if (method != "submit" && (this.state.shipmentQtyChangedFlag == 1 || this.state.shipmentBatchInfoChangedFlag == 1 || this.state.shipmentDatesChangedFlag == 1)) {
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
                shipmentBatchInfoChangedFlag: 0,
                shipmentDatesChangedFlag: 0,
                shipmentQtyChangedFlag: 0,
                shipmentBatchInfoDuplicateError: '',
                shipmentValidationBatchError: '',
                qtyCalculatorValidationError: "",
                shipmentDatesError: "",
            })
            this.setState({
                batchInfo: !this.state.batchInfo,
            });
        }
    }
    /**
     * This function is used to dispaly the batch data
     */
    openBatchPopUp() {
        this.setState({
            batchInfo: true,
        });
    }
    /**
     * This function is called when cancel button for batch details/Shipment dates or strategic model popup is clicked
     */
    actionCanceled() {
        var cont = false;
        if (this.state.shipmentQtyChangedFlag == 1 || this.state.shipmentBatchInfoChangedFlag == 1 || this.state.shipmentDatesChangedFlag == 1) {
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
                message: i18n.t('static.actionCancelled'),
                color: '#BA0C2F',
                shipmentQtyChangedFlag: 0,
                shipmentBatchInfoChangedFlag: 0,
                shipmentDatesChangedFlag: 0
            }, () => {
                this.hideFirstComponent()
                this.toggleLarge();
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
     * This is used to display the content
     * @returns The shipment data in tabular format
     */
    render() {
        const checkOnline = localStorage.getItem('sessionType');
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
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
        return (
            <div className="animated fadeIn">
                <Prompt
                    when={this.state.shipmentChangedFlag == 1 || this.state.shipmentBatchInfoChangedFlag == 1 || this.state.shipmentDatesChangedFlag == 1 || this.state.shipmentQtyChangedFlag == 1}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname }) || this.state.supplyPlanError}</h5>
                <h5 className="red" id="div2">{this.state.noFundsBudgetError || this.state.shipmentBatchError || this.state.shipmentError}</h5>
                <Card>
                    {checkOnline === 'Online' &&
                        <div className="Card-header-addicon problemListMarginTop">
                            <div className="card-header-actions">
                                <div className="card-header-action">
                                    <a className="card-header-action">
                                        {this.state.programId != 0 && this.state.planningUnit.length > 0 &&
                                            <a href='javascript:;' onClick={this.exportCSV} ><span style={{ cursor: 'pointer' }}><small className="supplyplanformulas">{i18n.t('static.dataentry.downloadTemplate')}</small></span></a>
                                        }
                                    </a>
                                </div>
                            </div>
                        </div>
                    }
                    <CardBody className="pb-lg-5 pt-lg-0">
                        <Formik
                            render={
                                ({
                                }) => (
                                    <Form name='simpleForm'>
                                        <div className=" pl-0">
                                            <div className="row">
                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                    <div className="controls edit">
                                                        <Picker
                                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                            ref={this.pickRange}
                                                            value={rangeValue}
                                                            lang={pickerLang}
                                                            onDismiss={this.handleRangeDissmis}
                                                        >
                                                            <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                        </Picker>
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-3">
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
                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.qatProduct')}</Label>
                                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                    <div className="controls ">
                                                        <MultiSelect
                                                            name="planningUnit"
                                                            id="planningUnit"
                                                            options={this.state.planningUnitList.length > 0 ? this.state.planningUnitList : []}
                                                            value={this.state.planningUnit}
                                                            onChange={(e) => { this.formSubmit(e, this.state.rangeValue); }}
                                                            labelledBy={i18n.t('static.common.select')}
                                                        />
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-3 ">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.supplyPlan.shipmentType')}</Label>
                                                    <div className="controls ">
                                                        <Select
                                                            name="shipmentType"
                                                            id="shipmentType"
                                                            bsSize="sm"
                                                            multi
                                                            options={[{ value: 1, label: i18n.t('static.shipment.manualShipments') }, { value: 2, label: i18n.t('static.shipment.erpShipment') }]}
                                                            value={this.state.shipmentType}
                                                            onChange={(e) => { this.updateDataType(e); }}
                                                        />
                                                    </div>
                                                </FormGroup>
                                                <input type="hidden" id="planningUnitId" name="planningUnitId" value={this.state.planningUnitId} />
                                                <input type="hidden" id="programId" name="programId" value={this.state.programId} />
                                            </div>
                                        </div>
                                    </Form>
                                )} />
                        {(this.state.programQPLDetails.filter(c => c.id == this.state.programId)).length > 0 && (this.state.programQPLDetails.filter(c => c.id == this.state.programId))[0].readonly == 1 && <h5 style={{ color: 'red' }}>{i18n.t('static.dataentry.readonly')}</h5>}
                        <div className="col-md-10 pb-3">
                            <ul className="legendcommitversion">
                                <li><span className="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.emergencyOrder')}</span></li>
                                <li><span className=" mediumGreylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.doNotIncludeInProjectedShipment')} </span></li>
                                <li><span className=" readonlylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.shipment.erpShipment')} </span></li>
                                <li><span className=" readonlylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.common.readonlyData')} </span></li>
                            </ul>
                        </div>
                        <div className="shipmentconsumptionSearchMarginTop" >
                            <ShipmentsInSupplyPlanComponent ref="shipmentChild" items={this.state} updateState={this.updateState} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} hideFourthComponent={this.hideFourthComponent} hideFifthComponent={this.hideFifthComponent} shipmentPage="shipmentDataEntry" useLocalData={1} openBatchPopUp={this.openBatchPopUp} />
                            <div className="shipmentDataEntryTable" id="shipmentsDetailsTableDiv">
                                <div id="shipmentsDetailsTable" className="jexcelremoveReadonlybackground" style={{ display: this.state.loading ? "none" : "block" }} />
                            </div>
                        </div>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                    <div class="spinner-border blue ml-4" role="status">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.shipmentChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipments()}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}&nbsp;
                            {this.refs.shipmentChild != undefined && <Button id="addRowButtonId" color="info" size="md" className="float-right mr-1" type="button" onClick={this.refs.shipmentChild.addRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}&nbsp;
                            <a style={{ marginTop: "-1.5px" }} className="float-right mr-1" href="javascript:void();" title={i18n.t("static.supplyPlan.planMultiplePusByDate")} onClick={this.toggleReplan}><i className="fa fa-calendar fa-3x"></i></a>
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>
                <Modal isOpen={this.state.batchInfo}
                    className={'modal-lg modalWidth ' + this.props.className}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan" id="shipmentModalHeader">
                        <strong>{this.state.shipmentModalTitle}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red" id="div3">{this.state.qtyCalculatorValidationError}</h6>
                        <div className="RemoveStriped">
                            <div id="qtyCalculatorTable"></div>
                        </div>
                        <div className="RemoveStriped">
                            <div id="qtyCalculatorTable1" className="jexcelremoveReadonlybackground"></div>
                        </div>
                        <h6 className="red" id="div4">{this.state.shipmentDatesError}</h6>
                        <div className="">
                            <div id="shipmentDatesTable" className='TableWidth100'></div>
                        </div>
                        <h6 className="red" id="div5">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                        <div className="">
                            <div id="shipmentBatchInfoTable" className="AddListbatchtrHeight TableWidth100"></div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }} className="mr-0">
                            <Button id="shipmentDetailsPopCancelButton" size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.showBatchSaveButton && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                            {this.refs.shipmentChild != undefined && <Button color="info" id="addShipmentBatchRowId" size="md" className="float-right mr-1" type="button" onClick={this.refs.shipmentChild.addBatchRowInJexcel}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                            <b><h3 className="float-right mr-2">{i18n.t("static.supplyPlan.shipmentQty") + " : " + this.addCommas(this.state.shipmentQtyTotalForPopup) + " / " + i18n.t("static.supplyPlan.batchQty") + " : " + this.addCommas(this.state.batchQtyTotalForPopup)}</h3></b>
                        </div>
                        <div id="showSaveShipmentsDatesButtonsDiv" style={{ display: 'none' }} className="mr-0">
                            <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.shipmentDatesChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentsDate()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentDates')}</Button>}
                        </div>
                        <div id="showSaveQtyButtonDiv" style={{ display: 'none' }} className="mr-0">
                            <Button size="md" color="danger" className="submitBtn float-right mr-2" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.shipmentQtyChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentQty()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentQty')}</Button>}
                        </div>
                    </ModalFooter>
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
                                                        options={this.state.planningUnitList && this.state.planningUnitList.length > 0 ? this.state.planningUnitList : []}
                                                        value={this.state.planningUnitIdsPlan}
                                                        onChange={(e) => { this.setPlanningUnitIdsPlan(e) }}
                                                        labelledBy={i18n.t('static.common.select')}
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
            </div>
        );
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
     * This function is called when shipment date range picker is clicked
     * @param {*} e 
     */
    _handleClickRangeBox(e) {
        this.pickRange.current.show()
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
                                                var spd0 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(month).format("YYYY-MM"));
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
                                                        suggestedOrd = Number(Math.round(Number(maxStockForMonth1)) - Number(spd0[0].closingBalance) + Number(spd0[0].unmetDemand));
                                                    } else {
                                                        suggestedOrd = Number(Math.round(Number(minStockForMonth1)) - Number(spd0[0].closingBalance) + Number(spd0[0].unmetDemand));
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
                                                        tempShipmentId: planningUnitsIds[pu].value.toString().concat(shipmentDataList.length),
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
