import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import moment from "moment";
import React from "react";
import { Bar } from 'react-chartjs-2';
import 'react-contexify/dist/ReactContexify.min.css';
import NumberFormat from 'react-number-format';
import { Link } from "react-router-dom";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table, } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import { LOGO } from '../../CommonComponent/Logo.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { APPROVED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, CANCELLED_SHIPMENT_STATUS, DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, DELIVERED_SHIPMENT_STATUS, INDEXED_DB_NAME, INDEXED_DB_VERSION, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, NO_OF_MONTHS_ON_LEFT_CLICKED, NO_OF_MONTHS_ON_LEFT_CLICKED_REGION, NO_OF_MONTHS_ON_RIGHT_CLICKED, NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION, ON_HOLD_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SECRET_KEY, SHIPPED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, TBD_PROCUREMENT_AGENT_ID, TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN } from '../../Constants.js';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationServiceComponent from "../Common/AuthenticationServiceComponent";
import ConsumptionInSupplyPlanComponent from "./ConsumptionInSupplyPlan";
import InventoryInSupplyPlanComponent from "./InventoryInSupplyPlan";
import ShipmentsInSupplyPlanComponent from "./ShipmentsInSupplyPlan";
const entityname = i18n.t('static.dashboard.supplyPlan')
/**
 * This component is used to allow user to do the supply planning monthwise and view the supply plans for the download version
 */
export default class SupplyPlanComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDarkMode:false,
            loading: true,
            monthsArray: [],
            programList: [],
            planningUnitList: [],
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
            expectedBalTotalData: [],
            suggestedShipmentsTotalData: [],
            inventoryFilteredArray: [],
            inventoryTotalMonthWise: [],
            projectedTotalMonthWise: [],
            inventoryChangedFlag: 0,
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
            theme:localStorage.getItem('theme'),
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
            showInventory: 0,
            showConsumption: 0,
            consumptionStartDateClicked: moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
            inventoryStartDateClicked: moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
            shipmentStartDateClicked: moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
            batchInfoInInventoryPopUp: [],
            ledgerForBatch: [],
            showBatchSaveButton: false,
            shipmentQtyTotalForPopup: 0,
            batchQtyTotalForPopup: 0
        }
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
        this.shipmentsDetailsClicked = this.shipmentsDetailsClicked.bind(this);
        this.toggleAccordionTotalShipments = this.toggleAccordionTotalShipments.bind(this);
        this.updateState = this.updateState.bind(this);
        this.roundAMC = this.roundAMC.bind(this);
    }
    /**
     * This is function is used to round the AMC value
     * @param {*} amc The value of the AMC
     * @returns This function returns the rounded AMC
     */
    roundAMC(amc) {
        if (amc != null) {
            if (Number(amc).toFixed(0) >= 100) {
                return Number(amc).toFixed(0);
            } else if (Number(amc).toFixed(1) >= 10) {
                return Number(amc).toFixed(1);
            } else if (Number(amc).toFixed(2) >= 1) {
                return Number(amc).toFixed(2);
            } else {
                return Number(amc).toFixed(3);
            }
        } else {
            return null;
        }
    }
    /**
     * This method is used to add commas to the number
     * @param {*} cell This is value of the number
     * @returns It returns the number separated by commas
     */
    addCommas(cell, row) {
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
     * This function is called when scroll to left is clicked on the supply plan table
     */
    leftClicked() {
        var monthCount = (this.props.items.monthCount) - NO_OF_MONTHS_ON_LEFT_CLICKED;
        this.props.updateState("monthCount", monthCount);
        this.formSubmit(monthCount)
    }
    /**
     * This function is called when scroll to right is clicked on the supply plan table
     */
    rightClicked() {
        var monthCount = (this.props.items.monthCount) + NO_OF_MONTHS_ON_RIGHT_CLICKED;
        this.props.updateState("monthCount", monthCount);
        this.formSubmit(monthCount)
    }
    /**
     * This function is used to toggle the accordian for the total shipments
     */
    toggleAccordionTotalShipments() {
        this.setState({
            showTotalShipment: !this.state.showTotalShipment
        })
        var fields = document.getElementsByClassName("totalShipments1");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalShipment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
        fields = document.getElementsByClassName("manualShipments1");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalShipment == true && this.state.showManualShipment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
        fields = document.getElementsByClassName("erpShipments1");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalShipment == true && this.state.showErpShipment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
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
     * This function is used to export the supply planning data in CSV format
     */
    exportCSV = () => {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + (this.props.items.programSelect.label)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push("\"" + (i18n.t('static.planningunit.planningunit') + ' : ' + this.props.items.planningUnitName).replaceAll(' ', '%20') + "\"")
        csvRow.push("\"" + i18n.t("static.supplyPlan.amcPast").replaceAll(' ', '%20') + ' : ' + this.state.monthsInPastForAMC + "\"")
        csvRow.push("\"" + i18n.t("static.supplyPlan.amcFuture").replaceAll(' ', '%20') + ' : ' + this.state.monthsInFutureForAMC + "\"")
        csvRow.push("\"" + i18n.t("static.report.shelfLife").replaceAll(' ', '%20') + ' : ' + this.state.shelfLife + "\"")
        if (this.state.planBasedOn == 1) {
            csvRow.push("\"" + i18n.t("static.supplyPlan.minStockMos").replaceAll(' ', '%20') + ' : ' + this.state.minStockMoSQty + "\"")
        } else {
            csvRow.push("\"" + i18n.t("static.product.minQuantity").replaceAll(' ', '%20') + ' : ' + this.state.minQtyPpu + "\"")
        }
        csvRow.push("\"" + i18n.t("static.supplyPlan.reorderInterval").replaceAll(' ', '%20').replaceAll('#', '%23') + ' : ' + this.state.reorderFrequency + "\"")
        if (this.state.planBasedOn == 1) {
            csvRow.push("\"" + i18n.t("static.supplyPlan.maxStockMos").replaceAll(' ', '%20') + ' : ' + this.state.maxStockMoSQty + "\"")
        } else {
            csvRow.push("\"" + i18n.t("static.product.distributionLeadTime").replaceAll(' ', '%20') + ' : ' + this.state.distributionLeadTime + "\"")
        }
        csvRow.push('')
        const header = [...[""], ... (this.state.monthsArray.map(item => (
            ("\'").concat(item.monthName).concat(" ").concat(item.monthYear)
        ))
        )]
        var A = [header]
        var openningArr = [...["\"" + i18n.t('static.supplyPlan.openingBalance').replaceAll(' ', '%20') + "\""], ... this.state.openingBalanceArray.map(item => item.balance)]
        var consumptionArr = [...["\'" + ("-" + i18n.t('static.supplyPlan.consumption')).replaceAll(' ', '%20') + "\'"], ...this.state.consumptionTotalData]
        var shipmentArr = [...["\'" + ("+" + i18n.t('static.dashboard.shipments')).replaceAll(' ', '%20') + "\'"], ...this.state.shipmentsTotalData]
        var suggestedArr = [...["\"" + ("   " + i18n.t('static.supplyPlan.suggestedShipments')).replaceAll(' ', '%20') + "\""], ...this.state.suggestedShipmentsTotalData.map(item => item.suggestedOrderQty)]
        var deliveredShipmentArr = [...["\"" + ("   " + i18n.t('static.supplyPlan.delivered')).replaceAll(' ', '%20') + "\""], ...this.state.deliveredShipmentsTotalData.map(item => item.qty)]
        var shippedShipmentArr = [...["\"" + ("   " + i18n.t('static.supplyPlan.shipped')).replaceAll(' ', '%20') + "\""], ...this.state.shippedShipmentsTotalData.map(item => item.qty)]
        var orderedShipmentArr = [...["\"" + ("   " + i18n.t('static.supplyPlan.submitted')).replaceAll(' ', '%20') + "\""], ...this.state.orderedShipmentsTotalData.map(item => item.qty)]
        var onholdShipmentArr = [...["\"" + ("   " + i18n.t('static.report.hold')).replaceAll(' ', '%20') + "\""], ...this.state.onholdShipmentsTotalData.map(item => item.qty)]
        var plannedShipmentArr = [...["\"" + ("   " + i18n.t('static.report.planned')).replaceAll(' ', '%20') + "\""], ...this.state.plannedShipmentsTotalData.map(item => item.qty)]
        var inventoryArr = [...["\"" + (i18n.t('static.supplyPlan.adjustments')).replaceAll(' ', '%20') + "\""], ...this.state.inventoryTotalData]
        var expiredStockArr = [...[(i18n.t('static.supplyplan.exipredStock')).replaceAll(' ', '%20') + "\""], ...this.state.expiredStockArr.map(item => item.qty)]
        var closingBalanceArr = [...["\"" + (i18n.t('static.supplyPlan.endingBalance')).replaceAll(' ', '%20') + "\""], ...this.state.closingBalanceArray.map(item => item.balance)]
        var monthsOfStockArr = [...["\"" + (i18n.t('static.supplyPlan.monthsOfStock')).replaceAll(' ', '%20') + "\""], ... this.state.monthsOfStockArray]
        var maxQtyArr = [...["\"" + (i18n.t('static.supplyPlan.maxQty')).replaceAll(' ', '%20') + "\""], ... this.state.maxQtyArray]
        var amcgArr = [...["\"" + (i18n.t('static.supplyPlan.amc')).replaceAll(' ', '%20') + "\""], ...this.state.amcTotalData]
        var unmetDemandArr = [...["\"" + (i18n.t('static.supplyPlan.unmetDemandStr')).replaceAll(' ', '%20') + "\""], ...this.state.unmetDemand]
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
        A.push(expiredStockArr)
        A.push(closingBalanceArr)
        A.push(this.state.planBasedOn == 1 ? (monthsOfStockArr.map(c => c != null ? c : i18n.t("static.supplyPlanFormula.na"))) : maxQtyArr.map(c => c != null ? c : ""))
        A.push(amcgArr)
        A.push(unmetDemandArr)
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.supplyPlan') + ".csv"
        document.body.appendChild(a)
        a.click()
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
     * This function is used to export the supply planning data in PDF format
     */
    exportPDF = () => {
        const addFooters = doc => {
            const pageCount = doc.internal.getNumberOfPages()
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
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
            doc.setFont('helvetica', 'bold')
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.supplyPlan'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.program.program') + ' : ' + (this.props.items.programSelect.label), doc.internal.pageSize.width / 10, 80, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + (this.props.items.planningUnitName), doc.internal.pageSize.width / 10, 90, {
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
                    if (this.state.planBasedOn == 1) {
                        doc.text(i18n.t('static.supplyPlan.minStockMos') + ' : ' + this.state.minStockMoSQty, doc.internal.pageSize.width / 10, 130, {
                            align: 'left'
                        })
                    } else {
                        doc.text(i18n.t('static.product.minQuantity') + ' : ' + this.formatter(this.state.minQtyPpu), doc.internal.pageSize.width / 10, 130, {
                            align: 'left'
                        })
                    }
                    doc.text(i18n.t('static.supplyPlan.reorderInterval') + ' : ' + this.state.reorderFrequency, doc.internal.pageSize.width / 10, 140, {
                        align: 'left'
                    })
                    if (this.state.planBasedOn == 1) {
                        doc.text(i18n.t('static.supplyPlan.maxStockMos') + ' : ' + this.state.maxStockMoSQty, doc.internal.pageSize.width / 10, 150, {
                            align: 'left'
                        })
                    } else {
                        doc.text(i18n.t('static.product.distributionLeadTime') + ' : ' + this.formatter(this.state.distributionLeadTime), doc.internal.pageSize.width / 10, 150, {
                            align: 'left'
                        })
                    }
                }
            }
        }
        const unit = "pt";
        const size = "A4"; 
        const orientation = "landscape"; 
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(15);
        var canvas = document.getElementById("cool-canvas-compare");
        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var height = doc.internal.pageSize.height;
        doc.addImage(canvasImg, 'png', 50, 150, 750, 340, 'CANVAS');
        const header = [...[""], ... (this.state.monthsArray.map(item => (
            item.monthName.concat(" ").concat(item.monthYear)
        ))
        )]
        const headers = [header];
        var openningArr = [...[i18n.t('static.supplyPlan.openingBalance')], ... this.state.openingBalanceArray.map(item => item.balance)]
        var consumptionArr = [...[("-" + i18n.t('static.supplyPlan.consumption'))], ...this.state.consumptionTotalData]
        var shipmentArr = [...[("+" + i18n.t('static.dashboard.shipments'))], ...this.state.shipmentsTotalData]
        var suggestedArr = [...[("   " + i18n.t('static.supplyPlan.suggestedShipments'))], ...this.state.suggestedShipmentsTotalData.map(item => item.suggestedOrderQty)]
        var deliveredShipmentArr = [...[("   " + i18n.t('static.supplyPlan.delivered'))], ...this.state.deliveredShipmentsTotalData.map(item => item.qty)]
        var shippedShipmentArr = [...[("   " + i18n.t('static.supplyPlan.shipped'))], ...this.state.shippedShipmentsTotalData.map(item => item.qty)]
        var orderedShipmentArr = [...[("   " + i18n.t('static.supplyPlan.submitted'))], ...this.state.orderedShipmentsTotalData.map(item => item.qty)]
        var onholdShipmentArr = [...[("   " + i18n.t('static.report.hold'))], ...this.state.onholdShipmentsTotalData.map(item => item.qty)]
        var plannedShipmentArr = [...[("   " + i18n.t('static.report.planned'))], ...this.state.plannedShipmentsTotalData.map(item => item.qty)]
        var inventoryArr = [...[(i18n.t('static.supplyPlan.adjustments'))], ...this.state.inventoryTotalData]
        var expiredStockArr = [...[(i18n.t('static.supplyplan.exipredStock'))], ...this.state.expiredStockArr.map(item => item.qty)]
        var closingBalanceArr = [...[(i18n.t('static.supplyPlan.endingBalance'))], ...this.state.closingBalanceArray.map(item => item.balance)]
        var monthsOfStockArr = [...[(i18n.t('static.supplyPlan.monthsOfStock'))], ... this.state.monthsOfStockArray]
        var maxQtyArr = [...[(i18n.t('static.supplyPlan.maxQty'))], ... this.state.maxQtyArray]
        var amcgArr = [...[(i18n.t('static.supplyPlan.amc'))], ...this.state.amcTotalData]
        var unmetDemandArr = [...[(i18n.t('static.supplyPlan.unmetDemandStr'))], ...this.state.unmetDemand]
        const data = [openningArr.map(c => this.formatter(c)), consumptionArr.map((c, item) => item != 0 ? this.formatter(c.consumptionQty) : c), shipmentArr.map(c => this.formatter(c)), suggestedArr.map(c => this.formatter(c)),
        deliveredShipmentArr.map(c => this.formatter(c)), shippedShipmentArr.map(c => this.formatter(c)), orderedShipmentArr.map(c => this.formatter(c)), onholdShipmentArr.map(c => this.formatter(c)), plannedShipmentArr.map(c => this.formatter(c)),
        inventoryArr.map(c => this.formatter(c)), expiredStockArr.map(c => this.formatter(c)), closingBalanceArr.map(c => this.formatter(c)), this.state.planBasedOn == 1 ? (monthsOfStockArr.map(c => c != null ? this.formatterDouble(c) : i18n.t('static.supplyPlanFormula.na'))) : (maxQtyArr.map(c => c != null ? this.formatter(c) : '')), amcgArr.map(c => this.formatter(c)), unmetDemandArr.map(c => this.formatter(c))];
        let content = {
            margin: { top: 80, bottom: 50 },
            startY: height,
            head: headers,
            body: data,
            styles: { lineWidth: 1, fontSize: 8 },
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
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.supplyPlan') + ".pdf")
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

        var fields = document.getElementsByClassName("totalShipments1");
        for (var i = 0; i < fields.length; i++) {
            fields[i].style.display = "none";
        }
        fields = document.getElementsByClassName("manualShipments1");
        for (var i = 0; i < fields.length; i++) {
            fields[i].style.display = "none";
        }
        fields = document.getElementsByClassName("erpShipments1");
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
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var programJson = {
                            name: myResult[i].programCode + "~v" + myResult[i].version,
                            id: myResult[i].id,
                            programId: myResult[i].programId
                        }
                        proList.push(programJson)
                    }
                }
                this.setState({
                    programList: proList,
                    loading: false,
                    programQPLDetails: getRequest.result
                })
                this.getPlanningUnitList();
            }.bind(this);
        }.bind(this);
    };
    /**
     * This function is used to get list of planning units based on a particular program
     * @param {*} value This is the value of program that is selected by the user
     */
    getPlanningUnitList(event) {
        this.setState({ loading: true })
        var programId = document.getElementById("programId").value;
        if (programId != 0) {
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
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                if(this.props.takeDataFrom=="programData"){
                    var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                    var programDataOs = programDataTransaction.objectStore('programData');
                }else{
                    var programDataTransaction = db1.transaction(['downloadedProgramData'], 'readwrite');
                    var programDataOs = programDataTransaction.objectStore('downloadedProgramData');
                }
                var programRequest = programDataOs.get(document.getElementById("programId").value);
                programRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext'),
                        loading: false,
                        color: "#BA0C2F"
                    })
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
                            color: "#BA0C2F"
                        })
                    }.bind(this);
                    planningunitRequest.onsuccess = function (e) {
                        var myResult = [];
                        var programId = (document.getElementById("programId").value).split("_")[0];
                        myResult = planningunitRequest.result.filter(c => c.program.id == programId);
                        var proList = []
                        for (var i = 0; i < myResult.length; i++) {
                            if (myResult[i].program.id == programId && myResult[i].active == true) {
                                var productJson = {
                                    name: getLabelText(myResult[i].planningUnit.label, this.state.lang),
                                    id: myResult[i].planningUnit.id
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
                                this.setState({
                                    planningUnitList: proList,
                                    programPlanningUnitList: myResult,
                                    planningUnitListAll: myResult,
                                    regionList: regionList,
                                    generalProgramJson: programJson,
                                    planningUnitDataList: planningUnitDataList,
                                    dataSourceListAll: dataSourceListAll,
                                    planningUnitListForConsumption: planningUnitListForConsumption,
                                    loading: false,
                                    programId: document.getElementById("programId").value
                                }, () => {
                                    this.formSubmit(this.props.items.monthCount)
                                })
                            }.bind(this);
                        }.bind(this);
                    }.bind(this);
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                loading: false,
                planningUnitList: []
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
        this.setState({ startDate: { year: parseInt(moment(curDate).format('YYYY')), month: parseInt(moment(curDate).format('M')) } })
        this.props.updateState("startDate", { year: parseInt(moment(curDate).format('YYYY')), month: parseInt(moment(curDate).format('M')) });
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
    formSubmit(monthCount) {
        this.setState({
            planningUnitChange: true,
            display: 'block',
        })
        this.setState({ loading: true });
        var m = this.getMonthArray(moment(Date.now()).add(monthCount, 'months').utcOffset('-0500'));
        var planningUnitId = document.getElementById("planningUnitId").value;
        var planningUnitName = this.props.items.planningUnitName;
        var planningUnitId = document.getElementById("planningUnitId").value;
        var planningUnitDataFilter = this.state.planningUnitDataList.filter(c => c.planningUnitId == planningUnitId);
        var programJsonForPlanningUnit = {};
        if (planningUnitDataFilter.length > 0) {
            var planningUnitData = planningUnitDataFilter[0]
            var programDataBytesForPlanningUnit = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
            var programDataForPlanningUnit = programDataBytesForPlanningUnit.toString(CryptoJS.enc.Utf8);
            programJsonForPlanningUnit = JSON.parse(programDataForPlanningUnit);
        } else {
            programJsonForPlanningUnit = {
                consumptionList: [],
                inventoryList: [],
                shipmentList: [],
                batchInfoList: [],
                supplyPlan: []
            }
        }
        var actualProgramId = this.state.programList.filter(c => c.id == document.getElementById("programId").value)[0].programId;
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
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programJson = programJsonForPlanningUnit;
            var generalProgramJson = this.state.generalProgramJson;
            var invList = (programJson.inventoryList).filter(c => c.planningUnit.id == planningUnitId && (moment(c.inventoryDate) >= moment(m[0].startDate) && moment(c.inventoryDate) <= moment(m[17].endDate)) && c.active.toString() == "true")
            var conList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && (moment(c.consumptionDate) >= moment(m[0].startDate) && moment(c.consumptionDate) <= moment(m[17].endDate)) && c.active.toString() == "true")
            var shiList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true && (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? (c.receivedDate >= m[0].startDate && c.receivedDate <= m[17].endDate) : (c.expectedDeliveryDate >= m[0].startDate && c.expectedDeliveryDate <= m[17].endDate)))
            this.setState({
                allShipmentsList: programJson.shipmentList
            })
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
                    inList: invList,
                    coList: conList,
                    shList: shiList,
                    programJson: programJsonForPlanningUnit,
                    planBasedOn: programPlanningUnit.planBasedOn,
                    minQtyPpu: programPlanningUnit.minQty,
                    distributionLeadTime: programPlanningUnit.distributionLeadTime
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
                    }.bind(this);
                    papuRequest.onsuccess = function (event) {
                        var papuResult = [];
                        papuResult = papuRequest.result;
                        var supplyPlanData = [];
                        if (programJson.supplyPlan != undefined) {
                            supplyPlanData = (programJson.supplyPlan).filter(c => c.planningUnitId == planningUnitId);
                        }
                        this.setState({
                            supplyPlanDataForAllTransDate: supplyPlanData
                        })
                        var lastClosingBalance = 0;
                        var lastBatchDetails = [];
                        var lastIsActualClosingBalance = 0;
                        for (var n = 0; n < m.length; n++) {
                            var jsonList = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(m[n].startDate).format("YYYY-MM-DD"));
                            var prevMonthJsonList = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(m[n].startDate).subtract(1, 'months').format("YYYY-MM-DD"));
                            if (jsonList.length > 0) {
                                openingBalanceArray.push({ isActual: prevMonthJsonList.length > 0 && prevMonthJsonList[0].regionCountForStock == prevMonthJsonList[0].regionCount ? 1 : 0, balance: jsonList[0].openingBalance });
                                consumptionTotalData.push({ consumptionQty: jsonList[0].consumptionQty, consumptionType: jsonList[0].actualFlag, textColor: jsonList[0].actualFlag == 1 ? "#000000" : "rgb(170, 85, 161)" });
                                var shipmentDetails = programJson.shipmentList.filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true && (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? (c.receivedDate >= m[n].startDate && c.receivedDate <= m[n].endDate) : (c.expectedDeliveryDate >= m[n].startDate && c.expectedDeliveryDate <= m[n].endDate))
                                );
                                shipmentsTotalData.push(shipmentDetails.length > 0 ? jsonList[0].shipmentTotalQty : "");
                                var sd1 = [];
                                var sd2 = [];
                                var sd3 = [];
                                var sd4 = [];
                                var sd5 = [];
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
                                                paColor1 = this.state.theme=="Dark"?procurementAgent.colorHtmlDarkCode:procurementAgent.colorHtmlCode;
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
                                                paColor2 = this.state.theme=="Dark"?procurementAgent.colorHtmlDarkCode:procurementAgent.colorHtmlCode;
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
                                            if (shipmentDetails[i].erpFlag.toString() == "true") {
                                                isErp2 = true;
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
                                                paColor3 = this.state.theme=="Dark"?procurementAgent.colorHtmlDarkCode:procurementAgent.colorHtmlCode;
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
                                            if (shipmentDetails[i].erpFlag.toString() == "true") {
                                                isErp3 = true;
                                            }
                                            sd3.push(shipmentDetail);
                                            if (paColor3Array.indexOf(paColor3) === -1) {
                                                paColor3Array.push(paColor3);
                                            }
                                        } else if (shipmentDetails[i].shipmentStatus.id == PLANNED_SHIPMENT_STATUS) {
                                            if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                paColor4 = this.state.theme=="Dark"?procurementAgent.colorHtmlDarkCode:procurementAgent.colorHtmlCode;
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
                                            if (shipmentDetails[i].erpFlag.toString() == "true") {
                                                isErp4 = true;
                                            }
                                            sd4.push(shipmentDetail);
                                            if (paColor4Array.indexOf(paColor4) === -1) {
                                                paColor4Array.push(paColor4);
                                            }
                                        }else if (shipmentDetails[i].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                                            if (shipmentDetails[i].procurementAgent.id != "" && shipmentDetails[i].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == shipmentDetails[i].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == shipmentDetails[i].shipmentStatus.id)[0];
                                                var shipmentDetail = procurementAgent.procurementAgentCode + " - " + Number(shipmentDetails[i].shipmentQty).toLocaleString() + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                                paColor5 = this.state.theme=="Dark"?procurementAgent.colorHtmlDarkCode:procurementAgent.colorHtmlCode;
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
                                    deliveredShipmentsTotalData.push({ qty: Number(jsonList[0].receivedShipmentsTotalData) + Number(jsonList[0].receivedErpShipmentsTotalData), month: m[n], shipmentDetail: sd1, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder1, isLocalProcurementAgent: isLocalProcurementAgent1, isErp: isErp1 });
                                } else {
                                    deliveredShipmentsTotalData.push("")
                                }
                                if ((shipmentDetails.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                    var colour = paColor2;
                                    if (paColor2Array.length > 1) {
                                        colour = "#d9ead3";
                                    }
                                    shippedShipmentsTotalData.push({ qty: Number(jsonList[0].shippedShipmentsTotalData) + Number(jsonList[0].shippedErpShipmentsTotalData), month: m[n], shipmentDetail: sd2, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder2, isLocalProcurementAgent: isLocalProcurementAgent2, isErp: isErp2 });
                                } else {
                                    shippedShipmentsTotalData.push("")
                                }
                                if ((shipmentDetails.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                    var colour = paColor3;
                                    if (paColor3Array.length > 1) {
                                        colour = "#d9ead3";
                                    }
                                    orderedShipmentsTotalData.push({ qty: Number(jsonList[0].approvedShipmentsTotalData) + Number(jsonList[0].submittedShipmentsTotalData) + Number(jsonList[0].approvedErpShipmentsTotalData) + Number(jsonList[0].submittedErpShipmentsTotalData), month: m[n], shipmentDetail: sd3, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder3, isLocalProcurementAgent: isLocalProcurementAgent3, isErp: isErp3 });
                                } else {
                                    orderedShipmentsTotalData.push("")
                                }
                                if ((shipmentDetails.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS)).length > 0) {
                                    var colour = paColor4;
                                    if (paColor4Array.length > 1) {
                                        colour = "#d9ead3";
                                    }
                                    plannedShipmentsTotalData.push({ qty: Number(jsonList[0].plannedShipmentsTotalData) + Number(jsonList[0].plannedErpShipmentsTotalData), month: m[n], shipmentDetail: sd4, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder4, isLocalProcurementAgent: isLocalProcurementAgent4, isErp: isErp4 });
                                } else {
                                    plannedShipmentsTotalData.push("")
                                }
                                if ((shipmentDetails.filter(c => c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)).length > 0) {
                                    var colour = paColor5;
                                    if (paColor5Array.length > 1) {
                                        colour = "#d9ead3";
                                    }
                                    onholdShipmentsTotalData.push({ qty: Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].onholdErpShipmentsTotalData), month: m[n], shipmentDetail: sd5, colour: colour, textColor: contrast(colour), isEmergencyOrder: isEmergencyOrder5, isLocalProcurementAgent: isLocalProcurementAgent5, isErp: isErp5 });
                                } else {
                                    onholdShipmentsTotalData.push("")
                                }
                                inventoryTotalData.push(jsonList[0].adjustmentQty == 0 ? jsonList[0].regionCountForStock > 0 ? jsonList[0].nationalAdjustment : "" : jsonList[0].regionCountForStock > 0 ? jsonList[0].nationalAdjustment : jsonList[0].adjustmentQty);
                                totalExpiredStockArr.push({ qty: jsonList[0].expiredStock, details: jsonList[0].batchDetails.filter(c => moment(c.expiryDate).format("YYYY-MM-DD") >= m[n].startDate && moment(c.expiryDate).format("YYYY-MM-DD") <= m[n].endDate), month: m[n] });
                                monthsOfStockArray.push(jsonList[0].mos != null ? parseFloat(jsonList[0].mos).toFixed(1) : jsonList[0].mos);
                                maxQtyArray.push(this.roundAMC(jsonList[0].maxStock))
                                amcTotalData.push(jsonList[0].amc != null ? this.roundAMC(Number(jsonList[0].amc)) : "");
                                minStockMoS.push(jsonList[0].minStockMoS)
                                maxStockMoS.push(jsonList[0].maxStockMoS)
                                unmetDemand.push(jsonList[0].unmetDemand == 0 ? "" : jsonList[0].unmetDemand);
                                closingBalanceArray.push({ isActual: jsonList[0].regionCountForStock == jsonList[0].regionCount ? 1 : 0, balance: jsonList[0].closingBalance, batchInfoList: jsonList[0].batchDetails })
                                lastClosingBalance = jsonList[0].closingBalance;
                                lastBatchDetails = jsonList[0].batchDetails;
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
                                            sstd = { "suggestedOrderQty": suggestedOrd, "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) + Number(suggestedOrd) };
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
                                            sstd = { "suggestedOrderQty": suggestedOrd, "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) + Number(suggestedOrd) };
                                        }
                                    } else {
                                        sstd = { "suggestedOrderQty": "", "month": m[n].startDate, "isEmergencyOrder": isEmergencyOrder, "totalShipmentQty": Number(jsonList[0].onholdShipmentsTotalData) + Number(jsonList[0].plannedShipmentsTotalData) };
                                    }
                                    suggestedShipmentsTotalData.push(sstd);
                                }
                                var consumptionListForRegion = (programJson.consumptionList).filter(c => (c.consumptionDate >= m[n].startDate && c.consumptionDate <= m[n].endDate) && c.planningUnit.id == planningUnitId && c.active == true);
                                var inventoryListForRegion = (programJson.inventoryList).filter(c => (c.inventoryDate >= m[n].startDate && c.inventoryDate <= m[n].endDate) && c.planningUnit.id == planningUnitId && c.active == true);
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
                                    month: m[n].monthName.concat(" ").concat(m[n].monthYear),
                                    consumption: jsonList[0].consumptionQty,
                                    stock: jsonList[0].closingBalance,
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
                                    minQty: this.roundAMC(jsonList[0].minStock),
                                    maxQty: this.roundAMC(jsonList[0].maxStock),
                                    planBasedOn: programPlanningUnit.planBasedOn
                                }
                                jsonArrForGraph.push(json);
                            } else {
                                openingBalanceArray.push({ isActual: lastIsActualClosingBalance, balance: lastClosingBalance });
                                consumptionTotalData.push({ consumptionQty: "", consumptionType: "", textColor: "" });
                                shipmentsTotalData.push("");
                                suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": moment(m[n].startDate).format("YYYY-MM-DD"), "isEmergencyOrder": 0 });
                                deliveredShipmentsTotalData.push("");
                                shippedShipmentsTotalData.push("");
                                orderedShipmentsTotalData.push("");
                                plannedShipmentsTotalData.push("");
                                onholdShipmentsTotalData.push("");
                                inventoryTotalData.push("");
                                totalExpiredStockArr.push({ qty: 0, details: [], month: m[n] });
                                monthsOfStockArray.push(null)
                                maxQtyArray.push(null)
                                amcTotalData.push("");
                                minStockMoS.push(minStockMoSQty);
                                maxStockMoS.push(maxStockMoSQty)
                                unmetDemand.push("");
                                closingBalanceArray.push({ isActual: 0, balance: lastClosingBalance, batchInfoList: lastBatchDetails });
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
                                    stock: lastClosingBalance,
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
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
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
            showShipments: 0,
            showInventory: 0,
            showConsumption: 0,
            batchInfoInInventoryPopUp: []
        })
        if (supplyPlanType == 'Consumption') {
            var monthCountConsumption = count != undefined ? this.props.items.monthCount + count - 2 : this.props.items.monthCount;
            this.setState({
                consumption: !this.state.consumption,
                monthCountConsumption: monthCountConsumption,
                consumptionStartDateClicked: count != undefined ? this.state.monthsArray[count].startDate : moment(Date.now()).startOf('month').format("YYYY-MM-DD")
            }, () => {
                this.formSubmit(monthCountConsumption);
            });
        } else if (supplyPlanType == 'SuggestedShipments') {
        } else if (supplyPlanType == 'shipments') {
            var monthCountShipments = count != undefined ? this.props.items.monthCount + count - 2 : this.props.items.monthCount;
            this.setState({
                shipments: !this.state.shipments,
                monthCountShipments: monthCountShipments,
                shipmentStartDateClicked: count != undefined ? this.state.monthsArray[count].startDate : moment(Date.now()).startOf('month').format("YYYY-MM-DD"),
                isSuggested: 0,
            }, () => {
                this.formSubmit(monthCountShipments)
                if (this.state.shipments) {
                    this.shipmentsDetailsClicked('allShipments', startDate, endDate);
                }
            });
        } else if (supplyPlanType == 'Adjustments') {
            var monthCountAdjustments = count != undefined ? this.props.items.monthCount + count - 2 : this.props.items.monthCount;
            this.setState({
                adjustments: !this.state.adjustments,
                monthCountAdjustments: monthCountAdjustments,
                inventoryStartDateClicked: count != undefined ? this.state.monthsArray[count].startDate : moment(Date.now()).startOf('month').format("YYYY-MM-DD")
            }, () => {
                this.formSubmit(monthCountAdjustments);
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
    /**
     * This function is called when the cancel button is clicked from expired stock popup
     */
    actionCanceledExpiredStock() {
        this.setState({
            expiredStockModal: !this.state.expiredStockModal,
            loading: false
        })
        this.props.updateState("message", i18n.t('static.actionCancelled'));
        this.props.updateState("color", "#BA0C2F");
        this.props.hideFirstComponent();
    }
    /**
     * This function is called when the cancel button is clicked from consumption, inventory, suggested shipments,shipments
     * @param {*} supplyPlanType This values indicates which popup is cancelled
     */
    actionCanceled(supplyPlanType) {
        var inputs = document.getElementsByClassName("submitBtn");
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].disabled = true;
        }
        this.setState({
            message: i18n.t('static.actionCancelled'),
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
            showShipments: 0,
            showInventory: 0,
            showConsumption: 0,
            batchInfoInInventoryPopUp: [],
        },
            () => {
            })
        this.props.updateState("message", i18n.t('static.actionCancelled'));
        this.props.updateState("color", "#BA0C2F");
        this.props.hideFirstComponent();
        this.toggleLarge(supplyPlanType);
    }
    /**
     * This function is called when scroll to left is clicked on the consumption table
     */
    leftClickedConsumption() {
        var monthCountConsumption = (this.state.monthCountConsumption) - NO_OF_MONTHS_ON_LEFT_CLICKED_REGION;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(monthCountConsumption)
    }
    /**
     * This function is called when scroll to right is clicked on the consumption table
     */
    rightClickedConsumption() {
        var monthCountConsumption = (this.state.monthCountConsumption) + NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(monthCountConsumption);
    }
    /**
     * This function is called when scroll to left is clicked on the inventory/adjustment table
     */
    leftClickedAdjustments() {
        var monthCountAdjustments = (this.state.monthCountAdjustments) - NO_OF_MONTHS_ON_LEFT_CLICKED_REGION;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(monthCountAdjustments)
    }
    /**
     * This function is called when scroll to right is clicked on the inventory/adjustment table
     */
    rightClickedAdjustments() {
        var monthCountAdjustments = (this.state.monthCountAdjustments) + NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(monthCountAdjustments);
    }
    /**
     * This function is called when scroll to left is clicked on the shipment table
     */
    leftClickedShipments() {
        var monthCountShipments = (this.state.monthCountShipments) - NO_OF_MONTHS_ON_LEFT_CLICKED_REGION;
        this.setState({
            monthCountShipments: monthCountShipments
        })
        this.formSubmit(monthCountShipments)
    }
    /**
     * This function is called when scroll to right is clicked on the shipment table
     */
    rightClickedShipments() {
        var monthCountShipments = (this.state.monthCountShipments) + NO_OF_MONTHS_ON_RIGHT_CLICKED_REGION;
        this.setState({
            monthCountShipments: monthCountShipments
        })
        this.formSubmit(monthCountShipments);
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
        this.setState({ loading: true, consumptionStartDateClicked: startDate });
        var elInstance = this.state.consumptionBatchInfoTableEl;
        if (elInstance != undefined && elInstance != "") {
            jexcel.destroy(document.getElementById("consumptionBatchInfoTable"), true);
        }
        var planningUnitId = document.getElementById("planningUnitId").value;
        var programJson = this.state.programJson;
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
    /**
     * This function is called when a particular inventory/adjustment record value is clicked
     * @param {*} region This is the value of the region for which the data needs to displayed
     * @param {*} month This is the value of the month for which the inventory/adjustment value is clicked
     * @param {*} endDate  This value is the end date of the month for which the inventory/adjustment value is clicked
     * @param {*} actualFlag This is the value of the inventory type
     */
    adjustmentsDetailsClicked(region, month, endDate, inventoryType) {
        this.setState({ loading: true, inventoryStartDateClicked: moment(endDate).startOf('month').format("YYYY-MM-DD") })
        var elInstance = this.state.inventoryBatchInfoTableEl;
        if (elInstance != undefined && elInstance != "") {
            jexcel.destroy(document.getElementById("inventoryBatchInfoTable"), true);
        }
        var planningUnitId = document.getElementById("planningUnitId").value;
        var programJson = this.state.programJson;
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
    /**
     * This is used to display the content
     * @returns The supply plan data in tabular format
     */
    render() {
        const darkModeColors = [
            '#d4bbff',      
        ];
        
        const lightModeColors = [
            '#002F6C',  // Color 1    
        ];
        const { isDarkMode } = this.state;
    const colors = isDarkMode ? darkModeColors : lightModeColors;
    const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
    const gridLineColor = isDarkMode ? '#444' : '#e0e0e0';
        const chartOptions1 = {
            title: {
                display: true,
                text: this.props.items.planningUnitName != "" && this.props.items.planningUnitName != undefined && this.props.items.planningUnitName != null ? this.props.items.programSelect.label + " - " + this.props.items.planningUnitName : entityname,
                fontColor:fontColor
            },
            scales: {
                yAxes: [{
                    id: 'A',
                    scaleLabel: {
                        display: true,
                        labelString: i18n.t('static.shipment.qty'),
                        fontColor:fontColor
                    },
                    stacked: false,
                    ticks: {
                        beginAtZero: true,
                        fontColor:fontColor,
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
                        fontColor:fontColor
                    },
                    stacked: false,
                    ticks: {
                        beginAtZero: true,
                        fontColor:fontColor
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
                        fontColor:fontColor
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
                mode:'nearest',
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
                            return data.datasets[tooltipItems.datasetIndex].label + ' : '+(tooltipItems.yLabel.toLocaleString());
                        }
                    }
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
                    fontColor:fontColor
                }
            }
        }
        var chartOptions2 = {
            title: {
                display: true,
                text: this.props.items.planningUnitName != "" && this.props.items.planningUnitName != undefined && this.props.items.planningUnitName != null ? this.props.items.programSelect.label + " - " + this.props.items.planningUnitName : entityname,
                fontColor:fontColor
            },
            scales: {
                yAxes: [{
                    id: 'A',
                    scaleLabel: {
                        display: true,
                        labelString: i18n.t('static.shipment.qty'),
                        fontColor:fontColor
                    },
                    stacked: false,
                    ticks: {
                        beginAtZero: true,
                        fontColor:fontColor,
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
                        fontColor:fontColor
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
                mode:'nearest',
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
                            return data.datasets[tooltipItems.datasetIndex].label + ' : '+(tooltipItems.yLabel.toLocaleString());
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
                    fontColor:fontColor
                }
            }
        }
        let bar1 = {}
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
                    pointBackgroundColor: '#ba0c2f',
                    pointBorderColor: '#ba0c2f',
                    borderStyle: 'dotted',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    lineTension: 0,
                    pointStyle: 'line',
                    pointRadius: 0,
                    showInLegend: true,
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
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: this.state.jsonArrForGraph.map((item, index) => (item.shipped)),
                },
                {
                    label: i18n.t('static.supplyPlan.submitted'),
                    stack: 1,
                    yAxisID: 'A',
                    backgroundColor: '#0067B9',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: this.state.jsonArrForGraph.map((item, index) => (item.ordered)),
                },
                {
                    label: i18n.t('static.report.hold'),
                    stack: 1,
                    yAxisID: 'A',
                    backgroundColor: '#6C6463',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: this.state.jsonArrForGraph.map((item, index) => (item.onhold)),
                },
                {
                    label: i18n.t('static.report.planned'),
                    stack: 1,
                    yAxisID: 'A',
                    backgroundColor: '#A7C6ED',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: this.state.jsonArrForGraph.map((item, index) => (item.planned)),
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
                    pointStyle: 'line',
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
            bar1 = {
                labels: [...new Set(this.state.jsonArrForGraph.map(ele => (ele.month)))],
                datasets: datasets
            };
        }
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <div id="supplyPlanTableId" style={{ display: 'block' }}>
                        <Row className="float-right">
                            <div className="col-md-12">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        </Row>
                        <div className="col-md-12">
                            <span className="supplyplan-larrow" onClick={this.leftClicked}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                            <span className="supplyplan-rarrow" onClick={this.rightClicked}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                        </div>
                        <div className="table-scroll mt-2">
                            <div className="table-wrap table-responsive fixTableHeadSupplyPlan">
                                <Table className="table-bordered text-center overflowhide" size="sm" options={this.options}>
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
                                                            return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '', '', '', '', '', count)} style={{ color: item1.textColor }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></td>)
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
                                            <td align="left" className="sticky-col first-col clone" ><b>+ {i18n.t('static.dashboard.shipments')}</b></td>
                                            {
                                                this.state.shipmentsTotalData.map((item1, index) => {
                                                    if (item1.toString() != "") {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${this.state.monthsArray[index].startDate}`, `${this.state.monthsArray[index].endDate}`, ``, 'allShipments', index)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                    } else {
                                                        return (<td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr className="totalShipments1">
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone">&emsp;&emsp;{i18n.t('static.supplyPlan.suggestedShipments')}</td>
                                            {
                                                this.state.suggestedShipmentsTotalData.map(item1 => {
                                                    if (item1.suggestedOrderQty.toString() != "") {
                                                        if (item1.isEmergencyOrder == 1) {
                                                            return (<td align="right" className="emergencyComment"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                        } else {
                                                            return (<td align="right" ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td>{item1.suggestedOrderQty}</td>)
                                                    }
                                                })
                                            }
                                        </tr>
                                        <tr className="totalShipments1">
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
                                        <tr className="totalShipments1">
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
                                        <tr className="totalShipments1">
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
                                        <tr className="totalShipments1">
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
                                        <tr className="totalShipments1">
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
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone"><b>+/- {i18n.t('static.supplyPlan.adjustments')}</b></td>
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
                                                    return (<td align="right" bgcolor={this.state.planBasedOn == 1 ? (item1.balance == 0 ? '#BA0C2F' : '') : (item1.balance == null ? "#cfcdc9" : item1.balance == 0 ? "#BA0C2F" : item1.balance < this.state.minQtyPpu ? "#f48521" : item1.balance > this.state.maxQtyArray[count] ? "#edb944" : "#118b70")} className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '', '', '', '', '', count)}>{item1.isActual == 1 ? <b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.balance} /></b> : <NumberFormat displayType={'text'} thousandSeparator={true} value={item1.balance} />}</td>)
                                                })
                                            }
                                        </tr>
                                        {this.state.planBasedOn == 1 && <tr>
                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                            <td align="left" className="sticky-col first-col clone"><b>{i18n.t('static.supplyPlan.monthsOfStock')}</b></td>
                                            {
                                                this.state.monthsOfStockArray.map(item1 => (
                                                    <td align="right" className='darkModeclrblack' style={{ backgroundColor: item1 == null ? "#cfcdc9" : item1 == 0 ? "#BA0C2F" : item1 < this.state.minStockMoSQty ? "#f48521" : item1 > this.state.maxStockMoSQty ? "#edb944" : "#118b70" }}>{item1 != null ? <NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /> : i18n.t('static.supplyPlanFormula.na')}</td>
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
                                                {this.state.planBasedOn == 1 && <Bar id="cool-canvas-compare" data={bar1} options={chartOptions1} />}
                                                {this.state.planBasedOn == 2 && <Bar id="cool-canvas-compare" data={bar1} options={chartOptions2} />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 pt-1 DarkThColr"> <span>{i18n.t('static.supplyPlan.noteBelowGraph')}</span></div>
                                </div>}
                        </div>
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
                <Modal isOpen={this.state.consumption}
                    className={'modal-lg modalWidth ' + this.props.className} >
                    <ModalHeader toggle={() => this.toggleLarge('Consumption')} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.dashboard.consumptiondetails')} -  {i18n.t('static.planningunit.planningunit')} - {this.props.items.planningUnitName} </strong>
                        <ul className="legendcommitversion list-group" style={{ display: 'inline-flex' }}>
                            <li><span className="purplelegend legendcolor"></span> <span className="legendcommitversionText" style={{ color: "rgb(170, 85, 161)" }}><i>{i18n.t('static.supplyPlan.forecastedConsumption')}</i></span></li>
                            <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.actualConsumption')} </span></li>
                        </ul>
                        <div className=" card-header-actions" style={{ marginTop: '19px' }}>
                            <a className="card-header-action">
                                <Link to={`/consumptionDetails/` + this.props.items.programId + `/0/` + this.props.items.planningUnitId} target="_blank"><small className="dataEntryLink">{i18n.t('static.supplyplan.consumptionDataEntry')}</small></Link>
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
                                                                return (<td align="center"></td>)
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
                            {this.state.showConsumption == 1 && <ConsumptionInSupplyPlanComponent ref="consumptionChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} consumptionPage="supplyPlanCompare" useLocalData={1} />}
                            <div className=" mt-3">
                                <div id="consumptionTable" />
                            </div>
                            <h6 className="red" id="div3">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchInfoNoStockError || this.state.consumptionBatchError}</h6>
                            <div className="">
                                <div id="consumptionBatchInfoTable" className="AddListbatchtrHeight"></div>
                            </div>
                            <div id="showConsumptionBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                <span>{i18n.t("static.dataEntry.missingBatchNote")}</span>
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledConsumption()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            </div>
                            <div className="pt-4"></div>
                        </ModalBody>
                        <ModalFooter>
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
                        <strong>{i18n.t('static.supplyPlan.adjustmentsDetails')} -  {i18n.t('static.planningunit.planningunit')} - {this.props.items.planningUnitName} </strong>
                        <div className="card-header-actions" style={{ marginTop: '0px' }}>
                            <a className="card-header-action">
                                <Link to={`/inventory/addInventory/` + this.props.items.programId + `/0/` + this.props.items.planningUnitId} target="_blank"><small className="dataEntryLink">{i18n.t('static.supplyplan.adjustmentDataEntry')}</small></Link>
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
                                                        if (count < 7) {
                                                            if (item1.adjustmentsQty.toString() != '' && (item1.actualQty.toString() != "" || item1.actualQty.toString() != 0)) {
                                                                return (
                                                                    <>
                                                                        <td align="center" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentsQty} /></td>
                                                                        <td align="center" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>
                                                                    </>
                                                                )
                                                            } else if (item1.adjustmentsQty.toString() != '' && (item1.actualQty.toString() == "" || item1.actualQty.toString() == 0)) {
                                                                return (
                                                                    <>
                                                                        <td align="center" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentsQty} /></td>
                                                                        <td align="center"></td>
                                                                    </>
                                                                )
                                                            } else if (item1.adjustmentsQty.toString() == '' && (item1.actualQty.toString() != "" || item1.actualQty.toString() != 0)) {
                                                                return (
                                                                    <>
                                                                        <td align="center"></td>
                                                                        <td align="center" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>
                                                                    </>
                                                                )
                                                            } else {
                                                                return (<><td align="center"></td><td align="center"></td></>)
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
                                                            <td style={{ textAlign: 'center' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.adjustmentsQty} />
                                                            </td>
                                                            {(item.actualQty) > 0 ? <td style={{ textAlign: 'center' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.actualQty} /></td> : <td style={{ textAlign: 'left' }}>{item.actualQty}</td>}
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
                                                        <td colSpan="2"><NumberFormat displayType={'text'} thousandSeparator={true} value={item.projectedInventory} /></td>
                                                    )
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr bgcolor='#d9d9d9' className='text-blackDModal'>
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
                                    <tr bgcolor='#d9d9d9' className='text-blackDModal'>
                                        <td align="left">{i18n.t("static.supplyPlan.finalInventory")}</td>
                                        {
                                            this.state.closingBalanceArray.map((item, count) => {
                                                if (count < 7) {
                                                    return (
                                                        <td colSpan="2" className={item.balance != 0 ? "hoverTd" : ""} onClick={() => item.balance != 0 ? this.setState({ batchInfoInInventoryPopUp: item.batchInfoList }) : ""}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.balance} /></td>
                                                    )
                                                }
                                            })
                                        }
                                    </tr>
                                </tbody>
                            </Table>
                            {this.state.batchInfoInInventoryPopUp.filter(c => c.qty > 0).length > 0 &&
                                <>
                                    <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                        <thead>
                                            <tr>
                                                <th>{i18n.t("static.supplyPlan.batchId")}</th>
                                                <th>{i18n.t('static.report.createdDate')}</th>
                                                <th>{i18n.t('static.inventory.expireDate')}</th>
                                                <th>{i18n.t('static.supplyPlan.qatGenerated')}</th>
                                                <th>{i18n.t("static.report.qty")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.batchInfoInInventoryPopUp.filter(c => c.qty > 0).map(item => (
                                                <tr>
                                                    <td>{item.batchNo}</td>
                                                    <td>{moment(item.createdDate).format(DATE_FORMAT_CAP)}</td>
                                                    <td>{moment(item.expiryDate).format(DATE_FORMAT_CAP)}</td>
                                                    <td>{(item.autoGenerated) ? i18n.t("static.program.yes") : i18n.t("static.program.no")}</td>
                                                    <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.qty} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table><br />
                                    <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.setState({ batchInfoInInventoryPopUp: [] })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button><br />
                                </>
                            }
                            {this.state.showInventory == 1 && <InventoryInSupplyPlanComponent ref="inventoryChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} inventoryPage="supplyPlanCompare" hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} adjustmentsDetailsClicked={this.adjustmentsDetailsClicked} useLocalData={1} />}
                            <div className=" mt-3">
                                <div id="adjustmentsTable" className=" " />
                            </div>
                            <h6 className="red" id="div3">{this.state.inventoryBatchInfoDuplicateError || this.state.inventoryBatchInfoNoStockError || this.state.inventoryBatchError}</h6>
                            <div className="">
                                <div id="inventoryBatchInfoTable" className="AddListbatchtrHeight"></div>
                            </div>
                            <div id="showInventoryBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                <span>{i18n.t("static.dataEntry.missingBatchNote")}</span>
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledInventory()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            </div>
                            <div className="pt-4"></div>
                        </ModalBody>
                        <ModalFooter>
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
                        <strong>{i18n.t('static.supplyPlan.shipmentsDetails')} -  {i18n.t('static.planningunit.planningunit')} - {this.props.items.planningUnitName} </strong>
                        <ul className="legendcommitversion">
                            <li className="mt-2"><span className="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.emergencyOrder')}</span></li>
                            <li className="mt-2"><span className=" mediumGreylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.doNotIncludeInProjectedShipment')} </span></li>
                            <li className="mt-2"><span className=" readonlylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.shipment.erpShipment')} </span></li>
                            <li className="mt-2"><span className=" readonlylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.common.readonlyData')} </span></li>
                        </ul>
                        <div className="card-header-actions" style={{ marginTop: '-21px' }}>
                            <a className="card-header-action">
                                <Link to={`/shipment/shipmentDetails/` + this.props.items.programId + `/0/` + this.props.items.planningUnitId} target="_blank"><small className="dataEntryLink">{i18n.t('static.supplyplan.shipmentDataEntry')}</small></Link>
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
                                                        if (this.state.shipmentsTotalData[count] != undefined && this.state.shipmentsTotalData[count].toString() != '') {
                                                            return (<th onClick={() => this.shipmentsDetailsClicked('allShipments', `${item.startDate}`, `${item.endDate}`)} className={moment(this.state.shipmentStartDateClicked).format("YYYY-MM-DD") == moment(item.startDate).format("YYYY-MM-DD") ? "supplyplan-Thead supplyplanTdWidthForMonths hoverTd" : "supplyplanTdWidthForMonths hoverTd"}>{item.monthName.concat(" ").concat(item.monthYear)}</th>)
                                                        } else {
                                                            return (<th className={moment(this.state.shipmentStartDateClicked).format("YYYY-MM-DD") == moment(item.startDate).format("YYYY-MM-DD") ? "supplyplan-Thead supplyplanTdWidthForMonths" : "supplyplanTdWidthForMonths"}>{item.monthName.concat(" ").concat(item.monthYear)}</th>)
                                                        }
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
                                                            return (<td align="center"></td>)
                                                        }
                                                    }
                                                })
                                            }
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                            {this.state.showShipments && <ShipmentsInSupplyPlanComponent ref="shipmentChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} hideFourthComponent={this.hideFourthComponent} hideFifthComponent={this.hideFifthComponent} shipmentPage="supplyPlanCompare" useLocalData={1} />}
                            <h6 className="red" id="div2">{this.state.noFundsBudgetError || this.state.shipmentBatchError || this.state.shipmentError}</h6>
                            <div className="">
                                <div id="shipmentsDetailsTable" />
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
                            </div>
                            <h6 className="red" id="div4">{this.state.shipmentDatesError}</h6>
                            <div className="">
                                <div id="shipmentDatesTable"></div>
                            </div>
                            <div id="showSaveShipmentsDatesButtonsDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1 mb-2" onClick={() => this.actionCanceledShipments('shipmentDates')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            </div>
                            <h6 className="red" id="div5">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                            <div className="">
                                <div id="shipmentBatchInfoTable" className="AddListbatchtrHeight"></div>
                            </div>
                            <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" id="shipmentDetailsPopCancelButton" className="float-right mr-1 " onClick={() => this.actionCanceledShipments('shipmentBatch')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <b><h3 className="float-right mr-2">{i18n.t("static.supplyPlan.shipmentQty") + " : " + this.addCommas(this.state.shipmentQtyTotalForPopup) + " / " + i18n.t("static.supplyPlan.batchQty") + " : " + this.addCommas(this.state.batchQtyTotalForPopup)}</h3></b>
                            </div>
                            <div className="pt-4"></div>
                        </ModalBody>
                        <ModalFooter>
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
                                                <td>{moment(item.expiryDate).format(DATE_FORMAT_CAP)}</td>
                                                <td>{(item.autoGenerated) ? i18n.t("static.program.yes") : i18n.t("static.program.no")}</td>
                                                <td className="hoverTd" onClick={() => this.showBatchLedgerClicked(item.batchNo, item.createdDate, item.expiryDate)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.expiredQty} /></td>
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
                                                        <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.openingBalance} /></td>
                                                        <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.consumptionQty} /></td>
                                                        <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.adjustmentQty} /></td>
                                                        <td>{item.shipmentQty == 0 ? null : <NumberFormat displayType={'text'} thousandSeparator={true} value={item.shipmentQty} />}</td>
                                                        <td><NumberFormat displayType={'text'} thousandSeparator={true} value={0 - Number(item.unallocatedQty)} /></td>
                                                        {item.stockQty != null && Number(item.stockQty) > 0 ? <td><b><NumberFormat displayType={'text'} thousandSeparator={true} value={item.qty} /></b></td> : <td><NumberFormat displayType={'text'} thousandSeparator={true} value={item.qty} /></td>}
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td align="right" colSpan="6"><b>{i18n.t("static.supplyPlan.expiry")}</b></td>
                                                <td><b><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.ledgerForBatch[this.state.ledgerForBatch.length - 1].expiredQty} /></b></td>
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
            </div>
        )
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
        this.setState({
            ledgerForBatch: ledgerForBatch,
            loading: false
        })
    }
    /**
     * This function is used to redirect the user to shipment details from which a particular batch was created
     * @param {*} batchNo This is the value of the batch number for which a particular shipments needs to be displayed
     * @param {*} expiryDate This is the value of the expire date for which a particular shipments needs to be displayed
     */
    showShipmentWithBatch(batchNo, expiryDate) {
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
     * This function is called when user clicks on a particular shipment
     * @param {*} supplyPlanType This is the type of the shipment row that user has clicked on
     * @param {*} startDate This is the start date of the month which user has clicked on
     * @param {*} endDate This is the end date of the month which user has clicked on 
     */
    shipmentsDetailsClicked(supplyPlanType, startDate, endDate) {
        var programJson = this.state.programJson;
        var shipmentListUnFiltered = programJson.shipmentList;
        this.setState({
            shipmentListUnFiltered: shipmentListUnFiltered
        })
        var shipmentList = programJson.shipmentList.filter(c => c.active.toString() == "true");
        if (supplyPlanType == 'deliveredShipments') {
            shipmentList = shipmentList.filter(c => (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? c.receivedDate >= startDate && c.receivedDate <= endDate : c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate) && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
        } else if (supplyPlanType == 'shippedShipments') {
            shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
        } else if (supplyPlanType == 'orderedShipments') {
            shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
        } else if (supplyPlanType == 'plannedShipments') {
            shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS));
        } else if (supplyPlanType == 'onholdShipments') {
            shipmentList = shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS));
        } else if (supplyPlanType == 'allShipments') {
            shipmentList = shipmentList.filter(c =>
                (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date" ? c.receivedDate >= startDate && c.receivedDate <= endDate : c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate)
                && c.planningUnit.id == document.getElementById("planningUnitId").value
            );
            if (document.getElementById("addRowId") != null) {
                document.getElementById("addRowId").style.display = "block"
            }
        } else {
            shipmentList = [];
        }
        this.setState({
            showShipments: 1,
            shipmentList: shipmentList,
            shipmentListUnFiltered: shipmentListUnFiltered,
            programJson: programJson,
            shipmentStartDateClicked: startDate
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
            document.getElementById("showSaveQtyButtonDiv").style.display = 'none';
            jexcel.destroy(document.getElementById("qtyCalculatorTable"), true);
            jexcel.destroy(document.getElementById("qtyCalculatorTable1"), true);
            this.refs.shipmentChild.state.shipmentQtyChangedFlag = 0;
            this.refs.shipmentChild.state.originalShipmentIdForPopup = "";
            this.setState({
                qtyCalculatorValidationError: "",
                shipmentQtyChangedFlag: 0
            })
        } else if (type == "shipmentDates") {
            document.getElementById("showSaveShipmentsDatesButtonsDiv").style.display = 'none';
            jexcel.destroy(document.getElementById("shipmentDatesTable"), true);
            this.refs.shipmentChild.state.shipmentDatesChangedFlag = 0;
            this.refs.shipmentChild.state.originalShipmentIdForPopup = "";
            this.setState({
                shipmentDatesChangedFlag: 0,
                shipmentDatesError: ""
            })
        } else if (type == "shipmentBatch") {
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
    /**
     * This function is called when cancel button is clicked from inventory modal
     */
    actionCanceledInventory() {
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
    /**
     * This function is called when cancel button is clicked from consumption modal
     */
    actionCanceledConsumption() {
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
