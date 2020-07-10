import React from "react";

import {
    Card, CardBody, CardHeader,
    Col, Table, Modal, ModalBody, ModalFooter, ModalHeader, Button,
    Input, InputGroup, Label, FormGroup, Form, Row, Nav, NavItem, NavLink, Collapse, TabPane, TabContent
} from 'reactstrap';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import i18n from '../../i18n';
import 'react-contexify/dist/ReactContexify.min.css';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN, PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN, MONTHS_IN_PAST_FOR_AMC, MONTHS_IN_FUTURE_FOR_AMC, DEFAULT_MIN_MONTHS_OF_STOCK, CANCELLED_SHIPMENT_STATUS, PSM_PROCUREMENT_AGENT_ID, PLANNED_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, NO_OF_MONTHS_ON_LEFT_CLICKED, ON_HOLD_SHIPMENT_STATUS, NO_OF_MONTHS_ON_RIGHT_CLICKED, DEFAULT_MAX_MONTHS_OF_STOCK, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, INVENTORY_DATA_SOURCE_TYPE, SHIPMENT_DATA_SOURCE_TYPE, QAT_DATA_SOURCE_ID, FIRST_DATA_ENTRY_DATE } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { Link } from "react-router-dom";
import NumberFormat from 'react-number-format';
import SupplyPlanComparisionComponent from "./SupplyPlanComparisionComponent";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { Bar, Line, Pie } from 'react-chartjs-2';
import pdfIcon from '../../assets/img/pdf.png';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import csvicon from '../../assets/img/csv.png'
import { jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationService from "../Common/AuthenticationService";

const entityname = i18n.t('static.dashboard.supplyPlan')

const chartOptions = {
    title: {
        display: true,
        text: i18n.t('static.dashboard.stockstatus')
    },
    scales: {
        yAxes: [{
            id: 'A',
            scaleLabel: {
                display: true,
                labelString: i18n.t('static.dashboard.unit'),
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
                color: 'rgba(171,171,171,171)',
                borderDash: [8, 4],
            },
            position: 'left',
        },
        {
            id: 'B',
            scaleLabel: {
                display: true,
                labelString: i18n.t('static.dashboard.months'),
                fontColor: 'black'
            },
            stacked: false,
            ticks: {
                beginAtZero: true,
                fontColor: 'black'
            },
            gridLines: {
                color: 'rgba(171,171,171,1)',
                lineWidth: 0.5
            },
            position: 'right',
        }
        ],
        xAxes: [{
            ticks: {
                fontColor: 'black'
            },
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


export default class SupplyPlanComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            monthsArray: [],
            programList: [],
            planningUnitList: [],
            planningUnitName: [],
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
            inventoryChangedFlag: 0,
            monthCount: 0,
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
            expiredStockArr: []
        }
        this.getMonthArray = this.getMonthArray.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.formSubmit = this.formSubmit.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
        this.saveConsumption = this.saveConsumption.bind(this);
        this.consumptionDetailsClicked = this.consumptionDetailsClicked.bind(this);
        this.consumptionChanged = this.consumptionChanged.bind(this);

        this.adjustmentsDetailsClicked = this.adjustmentsDetailsClicked.bind(this);
        this.inventoryChanged = this.inventoryChanged.bind(this);
        this.checkValidationConsumption = this.checkValidationConsumption.bind(this);
        this.checkValidationInventory = this.checkValidationInventory.bind(this);
        this.inventoryOnedit = this.inventoryOnedit.bind(this);
        this.saveInventory = this.saveInventory.bind(this);

        this.leftClicked = this.leftClicked.bind(this);
        this.rightClicked = this.rightClicked.bind(this);
        this.leftClickedConsumption = this.leftClickedConsumption.bind(this);
        this.rightClickedConsumption = this.rightClickedConsumption.bind(this);

        this.leftClickedAdjustments = this.leftClickedAdjustments.bind(this);
        this.rightClickedAdjustments = this.rightClickedAdjustments.bind(this);

        this.actionCanceled = this.actionCanceled.bind(this);

        this.suggestedShipmentsDetailsClicked = this.suggestedShipmentsDetailsClicked.bind(this);
        this.suggestedShipmentChanged = this.suggestedShipmentChanged.bind(this);
        this.saveSuggestedShipments = this.saveSuggestedShipments.bind(this);
        this.checkValidationSuggestedShipments = this.checkValidationSuggestedShipments.bind(this);
        this.shipmentStatusDropdownFilter = this.shipmentStatusDropdownFilter.bind(this);
        this.procurementUnitDropdownFilter = this.procurementUnitDropdownFilter.bind(this);
        this.shipmentsDetailsClicked = this.shipmentsDetailsClicked.bind(this);
        this.shipmentChanged = this.shipmentChanged.bind(this);
        this.saveShipments = this.saveShipments.bind(this);
        this.checkValidationForShipments = this.checkValidationForShipments.bind(this);

        this.budgetDropdownFilter = this.budgetDropdownFilter.bind(this);
        this.toggleAccordionTotalShipments = this.toggleAccordionTotalShipments.bind(this);
        this.toggleAccordionManualShipments = this.toggleAccordionManualShipments.bind(this);
        this.toggleAccordionErpShipments = this.toggleAccordionErpShipments.bind(this);
        this.calculationsForOpeningAndClosingBalanceAccordingToMonths = this.calculationsForOpeningAndClosingBalanceAccordingToMonths.bind(this);
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


    toggle = (tabPane, tab) => {
        const newArray = this.state.activeTab.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab: newArray,
        });
    }
    tabPane = () => {
        const exportCSV = () => {

            var csvRow = [];
            csvRow.push(i18n.t('static.program.program') + ' , ' + ((document.getElementById("programId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
            csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
            csvRow.push('')
            csvRow.push('')
            csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
            csvRow.push('')

            const header = [...[""], ... (this.state.monthsArray.map(item => (
                item.month
            ))
            )]
            var A = [header]

            var openningArr = [...[i18n.t('static.supplyPlan.openingBalance').replaceAll(' ', '%20')], ... this.state.openingBalanceArray]
            var consumptionArr = [...[("-" + i18n.t('static.dashboard.consumption')).replaceAll(' ', '%20')], ...this.state.consumptionTotalData]
            var shipmentArr = [...[("+" + i18n.t('static.dashboard.shipments')).replaceAll(' ', '%20')], ...this.state.shipmentsTotalData]
            var suggestedArr = [...[("   " + i18n.t('static.supplyPlan.suggestedShipments')).replaceAll(' ', '%20')], ...this.state.suggestedShipmentsTotalData.map(item => item.suggestedOrderQty)]
            var manualEntryShipmentsArr = [...[("  " + i18n.t('static.supplyPlan.manualEntryShipments')).replaceAll(' ', '%20')], ...this.state.manualShipmentsTotalData]

            var deliveredShipmentArr = [...[("     " + i18n.t('static.supplyPlan.delivered')).replaceAll(' ', '%20')], ...this.state.deliveredShipmentsTotalData.map(item => item.qty)]
            var shippedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.shipped')).replaceAll(' ', '%20')], ...this.state.shippedShipmentsTotalData.map(item => item.qty)]
            var orderedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.ordered')).replaceAll(' ', '%20')], ...this.state.orderedShipmentsTotalData.map(item => item.qty)]
            var plannedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.planned')).replaceAll(' ', '%20')], ...this.state.plannedShipmentsTotalData.map(item => item.qty)]

            var erpShipmentsArr = [...[("  " + i18n.t('static.supplyPlan.erpShipments')).replaceAll(' ', '%20')], ...this.state.erpShipmentsTotalData]
            var deliveredErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.delivered')).replaceAll(' ', '%20')], ...this.state.deliveredErpShipmentsTotalData.map(item => item.qty)]
            var shippedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.shipped')).replaceAll(' ', '%20')], ...this.state.shippedErpShipmentsTotalData.map(item => item.qty)]
            var orderedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.ordered')).replaceAll(' ', '%20')], ...this.state.orderedErpShipmentsTotalData.map(item => item.qty)]
            var plannedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.planned')).replaceAll(' ', '%20')], ...this.state.plannedErpShipmentsTotalData.map(item => item.qty)]

            var inventoryArr = [...[(i18n.t('static.supplyPlan.adjustments')).replaceAll(' ', '%20')], ...this.state.inventoryTotalData]
            var closingBalanceArr = [...[(i18n.t('static.supplyPlan.endingBalance')).replaceAll(' ', '%20')], ...this.state.closingBalanceArray]
            var monthsOfStockArr = [...[(i18n.t('static.supplyPlan.monthsOfStock')).replaceAll(' ', '%20')], ... this.state.monthsOfStockArray]
            var amcgArr = [...[(i18n.t('static.supplyPlan.amc')).replaceAll(' ', '%20')], ...this.state.amcTotalData]

            var minStocArr = [...[(i18n.t('static.supplyPlan.minStockMos')).replaceAll(' ', '%20')], ...this.state.minStockMoS]
            var maxStockArr = [...[(i18n.t('static.supplyPlan.maxStockMos')).replaceAll(' ', '%20')], ...this.state.maxStockMoS]
            var unmetDemandArr = [...[(i18n.t('static.supplyPlan.unmetDemandStr')).replaceAll(' ', '%20')], ...this.state.unmetDemand]


            A.push(openningArr)
            A.push(consumptionArr)
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

            A.push(minStocArr)
            A.push(maxStockArr)
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

        const exportPDF = () => {
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
                    doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                        align: 'center'
                    })


                }
            }
            const addHeaders = doc => {

                const pageCount = doc.internal.getNumberOfPages()
                doc.setFont('helvetica', 'bold')

                // var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
                // var reader = new FileReader();

                //var data='';
                // Use fs.readFile() method to read the file 
                //fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
                //}); 
                for (var i = 1; i <= pageCount; i++) {
                    doc.setFontSize(12)
                    doc.setPage(i)
                    doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                    /*doc.addImage(data, 10, 30, {
                    align: 'justify'
                    });*/
                    doc.setTextColor("#002f6c");
                    doc.text(i18n.t('static.dashboard.supplyPlan'), doc.internal.pageSize.width / 2, 60, {
                        align: 'center'
                    })
                    if (i == 1) {
                        doc.setFontSize(8)
                        doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 80, {
                            align: 'left'
                        })
                        doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 90, {
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

            doc.addImage(canvasImg, 'png', 50, 110, 750, 290, 'CANVAS');
            // doc.addImage(canvasImg, 'png', 50, 110, aspectwidth1, (height - h1) * 3 / 4);
            const header = [...[""], ... (this.state.monthsArray.map(item => (
                item.month
            ))
            )]

            const headers = [header];
            var openningArr = [...[i18n.t('static.supplyPlan.openingBalance')], ... this.state.openingBalanceArray]
            var consumptionArr = [...[("-" + i18n.t('static.dashboard.consumption'))], ...this.state.consumptionTotalData]
            var shipmentArr = [...[("+" + i18n.t('static.dashboard.shipments'))], ...this.state.shipmentsTotalData]
            var suggestedArr = [...[("   " + i18n.t('static.supplyPlan.suggestedShipments'))], ...this.state.suggestedShipmentsTotalData.map(item => item.suggestedOrderQty)]
            var manualEntryShipmentsArr = [...[("  " + i18n.t('static.supplyPlan.manualEntryShipments'))], ...this.state.manualShipmentsTotalData]

            var deliveredShipmentArr = [...[("     " + i18n.t('static.supplyPlan.delivered'))], ...this.state.deliveredShipmentsTotalData.map(item => item.qty)]
            var shippedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.shipped'))], ...this.state.shippedShipmentsTotalData.map(item => item.qty)]
            var orderedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.ordered'))], ...this.state.orderedShipmentsTotalData.map(item => item.qty)]
            var plannedShipmentArr = [...[("     " + i18n.t('static.supplyPlan.planned'))], ...this.state.plannedShipmentsTotalData.map(item => item.qty)]

            var erpShipmentsArr = [...[("  " + i18n.t('static.supplyPlan.erpShipments'))], ...this.state.erpShipmentsTotalData]
            var deliveredErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.delivered'))], ...this.state.deliveredErpShipmentsTotalData.map(item => item.qty)]
            var shippedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.shipped'))], ...this.state.shippedErpShipmentsTotalData.map(item => item.qty)]
            var orderedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.ordered'))], ...this.state.orderedErpShipmentsTotalData.map(item => item.qty)]
            var plannedErpShipmentArr = [...[("     " + i18n.t('static.supplyPlan.planned'))], ...this.state.plannedErpShipmentsTotalData.map(item => item.qty)]

            var inventoryArr = [...[(i18n.t('static.supplyPlan.adjustments'))], ...this.state.inventoryTotalData]
            var closingBalanceArr = [...[(i18n.t('static.supplyPlan.endingBalance'))], ...this.state.closingBalanceArray]
            var monthsOfStockArr = [...[(i18n.t('static.supplyPlan.monthsOfStock'))], ... this.state.monthsOfStockArray]
            var amcgArr = [...[(i18n.t('static.supplyPlan.amc'))], ...this.state.amcTotalData]

            var minStocArr = [...[(i18n.t('static.supplyPlan.minStockMos'))], ...this.state.minStockMoS]
            var maxStockArr = [...[(i18n.t('static.supplyPlan.maxStockMos'))], ...this.state.maxStockMoS]
            var unmetDemandArr = [...[(i18n.t('static.supplyPlan.unmetDemandStr'))], ...this.state.unmetDemand]

            const data = [openningArr, consumptionArr, shipmentArr, suggestedArr, manualEntryShipmentsArr, deliveredShipmentArr, shippedShipmentArr, orderedShipmentArr, plannedShipmentArr, erpShipmentsArr, deliveredErpShipmentArr, shippedErpShipmentArr, orderedErpShipmentArr, plannedErpShipmentArr, inventoryArr, closingBalanceArr, monthsOfStockArr, amcgArr, minStocArr, maxStockArr, unmetDemandArr];

            let content = {
                margin: { top: 80 },
                startY: height,
                head: headers,
                body: data,
                styles: { lineWidth: 1, fontSize: 8 },
            };
            doc.autoTable(content);
            addHeaders(doc)
            addFooters(doc)
            doc.save(i18n.t('static.dashboard.supplyPlan') + ".pdf")

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
                        backgroundColor: '#cfd5ea',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.planned)),
                    },
                    {
                        label: i18n.t('static.supplyPlan.ordered'),
                        stack: 1,
                        yAxisID: 'A',
                        backgroundColor: '#8aa9e6',
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
                        backgroundColor: '#6a82a8',
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
                        backgroundColor: '#042e6a',
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
                        borderColor: 'rgba(179,181,158,1)',
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
                        label: i18n.t('static.dashboard.consumption'),
                        type: 'line',
                        stack: 3,
                        yAxisID: 'A',
                        backgroundColor: 'transparent',
                        borderColor: 'rgba(255.102.102.1)',
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
                        borderColor: '#f4862a',
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
                        backgroundColor: 'rgba(255,193,8,0.2)',
                        borderColor: '#f86c6b',
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
                        borderColor: '#ffc107',
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
        return (
            <>
                <TabPane tabId="1">

                    <div id="supplyPlanTableId" style={{ display: this.state.display }}>
                        <Row className="float-right">
                            <div className="col-md-12">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => exportPDF()} />
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => exportCSV()} />

                            </div>
                        </Row>
                        <Row>
                            <div className="col-md-12">
                                <span className="supplyplan-larrow" onClick={this.leftClicked}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                <span className="supplyplan-rarrow" onClick={this.rightClicked}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                            </div>
                        </Row>
                        <Table className="table-bordered text-center mt-2 overflowhide" bordered responsive size="sm" options={this.options}>
                            <thead>
                                <tr>
                                    <th className="BorderNoneSupplyPlan"></th>
                                    <th className="supplyplanTdWidth"></th>
                                    {
                                        this.state.monthsArray.map(item => (
                                            <th className="supplyplanTdWidthForMonths" style={{ padding: '10px 0 !important' }}>{item.month}</th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody>

                                <tr bgcolor='#d9d9d9'>
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left"><b>{i18n.t('static.supplyPlan.openingBalance')}</b></td>
                                    {
                                        this.state.openingBalanceArray.map(item1 => (
                                            <td align="right"><b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></b></td>
                                        ))
                                    }
                                </tr>
                                <tr className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '')}>
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left"><b>- {i18n.t('static.dashboard.consumption')}</b></td>
                                    {
                                        this.state.consumptionTotalData.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>
                                <tr>
                                    <td className="BorderNoneSupplyPlan" onClick={() => this.toggleAccordionTotalShipments()}>
                                        {this.state.showTotalShipment ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                    </td>
                                    <td align="left"><b>+ {i18n.t('static.dashboard.shipments')}</b></td>
                                    {
                                        this.state.shipmentsTotalData.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>

                                <tr className="totalShipments">
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left">&emsp;&emsp;{i18n.t('static.supplyPlan.suggestedShipments')}</td>
                                    {
                                        this.state.suggestedShipmentsTotalData.map(item1 => {
                                            if (item1.suggestedOrderQty.toString() != "") {
                                                if (item1.isEmergencyOrder == 1) {
                                                    return (<td align="right" bgcolor='red' className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, `${item1.suggestedOrderQty}`, '', '', `${item1.isEmergencyOrder}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                } else {
                                                    return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, `${item1.suggestedOrderQty}`, '', '', `${item1.isEmergencyOrder}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                }
                                            } else {
                                                var compare = item1.month >= moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                                if (compare) {
                                                    return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, ``, '', '', `${item1.isEmergencyOrder}`)}>{item1.suggestedOrderQty}</td>)
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
                                    <td align="left">&emsp;&emsp;{i18n.t('static.supplyPlan.manualEntryShipments')}</td>
                                    {
                                        this.state.manualShipmentsTotalData.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>

                                <tr className="manualShipments">
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.delivered')}</td>

                                    {
                                        this.state.deliveredShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td bgcolor={item1.colour} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                            } else {
                                                return (<td align="right" >{item1}</td>)
                                            }
                                        })
                                    }

                                </tr>

                                <tr className="manualShipments">
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.shipped')}</td>
                                    {
                                        this.state.shippedShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td align="right" bgcolor={item1.colour} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                            } else {
                                                return (<td align="right" >{item1}</td>)
                                            }
                                        })
                                    }
                                </tr>

                                <tr className="manualShipments">
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.ordered')}</td>
                                    {
                                        this.state.orderedShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td bgcolor={item1.colour} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                            } else {
                                                return (<td align="right" >{item1}</td>)
                                            }
                                        })
                                    }
                                </tr>
                                <tr className="manualShipments">
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.planned')}</td>
                                    {
                                        this.state.plannedShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td bgcolor={item1.colour} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                    <td align="left">&emsp;&emsp;{i18n.t('static.supplyPlan.erpShipments')}</td>
                                    {
                                        this.state.erpShipmentsTotalData.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>
                                <tr className="erpShipments">
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.delivered')}</td>
                                    {
                                        this.state.deliveredErpShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td bgcolor={item1.colour} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                            } else {
                                                return (<td align="right" >{item1}</td>)
                                            }
                                        })
                                    }
                                </tr>

                                <tr className="erpShipments">
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.shipped')}</td>
                                    {
                                        this.state.shippedErpShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td bgcolor={item1.colour} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                            } else {
                                                return (<td align="right" >{item1}</td>)
                                            }
                                        })
                                    }
                                </tr>
                                <tr className="erpShipments">
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.ordered')}</td>
                                    {
                                        this.state.orderedErpShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td bgcolor={item1.colour} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                            } else {
                                                return (<td align="right" >{item1}</td>)
                                            }
                                        })
                                    }
                                </tr>
                                <tr className="erpShipments">
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.planned')}</td>
                                    {
                                        this.state.plannedErpShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td bgcolor={item1.colour} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                            } else {
                                                return (<td align="right" >{item1}</td>)
                                            }
                                        })
                                    }
                                </tr>
                                <tr className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '')}>
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left"><b>+/- {i18n.t('static.supplyPlan.adjustments')}</b></td>
                                    {
                                        this.state.inventoryTotalData.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>
                                <tr>
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left"><b>- {i18n.t('static.supplyplan.exipredStock')}</b></td>
                                    {
                                        this.state.expiredStockArr.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>
                                <tr bgcolor='#d9d9d9'>
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left"><b>{i18n.t('static.supplyPlan.endingBalance')}</b></td>
                                    {
                                        this.state.closingBalanceArray.map(item1 => (
                                            <td align="right"><b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></b></td>
                                        ))
                                    }
                                </tr>
                                <tr>
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left"><b>{i18n.t('static.supplyPlan.monthsOfStock')}</b></td>
                                    {
                                        this.state.monthsOfStockArray.map(item1 => (
                                            <td align="right"><b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></b></td>
                                        ))
                                    }
                                </tr>
                                <tr>
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left">{i18n.t('static.supplyPlan.amc')}</td>
                                    {
                                        this.state.amcTotalData.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>
                                <tr>
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left">{i18n.t('static.supplyPlan.minStockMos')}</td>
                                    {
                                        this.state.minStockMoS.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>
                                <tr>
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left">{i18n.t('static.supplyPlan.maxStockMos')}</td>
                                    {
                                        this.state.maxStockMoS.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>
                                <tr>
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left">{i18n.t('static.supplyPlan.unmetDemandStr')}</td>
                                    {
                                        this.state.unmetDemand.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>
                            </tbody>
                        </Table>
                        <div className="row" >
                            {
                                this.state.jsonArrForGraph.length > 0
                                &&
                                <div className="col-md-12" >

                                    <div className="col-md-11 float-right">
                                        <div className="chart-wrapper chart-graph-report">
                                            <Bar id="cool-canvas" data={bar} options={chartOptions} />
                                        </div>
                                    </div>   </div>}

                        </div>
                    </div>

                    {/* Consumption modal */}
                    <Modal isOpen={this.state.consumption}
                        className={'modal-lg ' + this.props.className, "modalWidth"}>
                        <ModalHeader toggle={() => this.toggleLarge('Consumption')} className="modalHeaderSupplyPlan">
                            <strong>{i18n.t('static.dashboard.consumptiondetails')}</strong>
                            {/* <ul className="legend legend-supplypln">
                                <li><span className="purplelegend"></span> <span className="legendText">{i18n.t('static.supplyPlan.forecastedConsumption')}</span></li>
                                <li><span className="blacklegend"></span> <span className="legendText">{i18n.t('static.supplyPlan.actualConsumption')}</span></li>
                            </ul> */}
                            <ul className="legendcommitversion">
                                <li><span className="purplelegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.forecastedConsumption')}</span></li>
                                <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.actualConsumption')} </span></li>

                            </ul>
                        </ModalHeader>
                        <ModalBody>
                            <h6 className="red">{this.state.consumptionDuplicateError || this.state.consumptionNoStockError || this.state.consumptionError}</h6>
                            <div className="col-md-12">
                                <span className="supplyplan-larrow" onClick={this.leftClickedConsumption}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                <span className="supplyplan-rarrow" onClick={this.rightClickedConsumption}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                            </div>
                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        {
                                            this.state.monthsArray.map(item => (
                                                <th>{item.month}</th>
                                            ))
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.regionListFiltered.map(item => (
                                            <tr>
                                                <td align="left">{item.name}</td>
                                                {
                                                    this.state.consumptionFilteredArray.filter(c => c.region.id == item.id).map(item1 => {
                                                        if (item1.consumptionQty.toString() != '') {
                                                            if (item1.actualFlag.toString() == 'true') {
                                                                return (<td align="right" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.region.id}`, `${item1.actualFlag}`, `${item1.month.month}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></td>)
                                                            } else {
                                                                return (<td align="right" style={{ color: 'rgb(170, 85, 161)' }} className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.region.id}`, `${item1.actualFlag}`, `${item1.month.month}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></td>)
                                                            }
                                                        } else {
                                                            return (<td align="right" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.region.id}`, ``, `${item1.month.month}`)}></td>)
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
                                            this.state.consumptionTotalMonthWise.map(item => (
                                                <th style={{ textAlign: 'right' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item} /></th>
                                            ))
                                        }
                                    </tr>
                                </tfoot>
                            </Table>
                            <div className="table-responsive">
                                <div id="consumptionDetailsTable" />
                            </div>
                            <h6 className="red">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchInfoNoStockError || this.state.consumptionBatchError}</h6>
                            <div className="table-responsive">
                                <div id="consumptionBatchInfoTable"></div>
                            </div>

                            <div id="showConsumptionBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                {this.state.consumptionBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveConsumptionBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            {this.state.consumptionChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.saveConsumption}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
                            <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('Consumption')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </Modal>
                    {/* Consumption modal */}
                    {/* Adjustments modal */}
                    <Modal isOpen={this.state.adjustments}
                        className={'modal-lg ' + this.props.className, "modalWidth"}>
                        <ModalHeader toggle={() => this.toggleLarge('Adjustments')} className="modalHeaderSupplyPlan">{i18n.t('static.supplyPlan.adjustmentsDetails')}</ModalHeader>
                        <ModalBody>
                            <h6 className="red">{this.state.inventoryDuplicateError || this.state.inventoryNoStockError || this.state.inventoryError}</h6>
                            <div className="col-md-12">
                                <span className="supplyplan-larrow" onClick={this.leftClickedAdjustments}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                <span className="supplyplan-rarrow" onClick={this.rightClickedAdjustments}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                            </div>
                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        {
                                            this.state.monthsArray.map(item => (
                                                <th>{item.month}</th>
                                            ))
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.regionListFiltered.map(item => (
                                            <tr>
                                                <td style={{ textAlign: 'left' }}>{item.name}</td>
                                                {
                                                    this.state.inventoryFilteredArray.filter(c => c.region.id == item.id).map(item1 => {
                                                        if (item1.adjustmentQty.toString() != '') {
                                                            return (<td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentQty} /></td>)
                                                        } else {
                                                            var lastActualConsumptionDate = moment(((this.state.lastActualConsumptionDateArr.filter(c => item1.region.id == c.region))[0]).lastActualConsumptionDate).format("YYYY-MM");
                                                            var currentMonthDate = moment(item1.month.startDate).format("YYYY-MM");
                                                            if (currentMonthDate > lastActualConsumptionDate) {
                                                                return (<td align="right"></td>)
                                                            } else {
                                                                return (<td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`)}></td>)
                                                            }
                                                        }
                                                    })
                                                }
                                            </tr>
                                        )
                                        )

                                    }
                                    <tr>
                                        <td style={{ textAlign: 'left' }}>{i18n.t('static.supplyPlan.qatAdjustment')}</td>
                                        {
                                            this.state.inventoryFilteredArray.filter(c => c.region.id == -1).map(item1 => {
                                                if (item1.adjustmentQty.toString() != '') {
                                                    return (<td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentQty} /></td>)
                                                } else {
                                                    return (<td align="right"></td>)
                                                }
                                            })
                                        }
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>{i18n.t('static.supplyPlan.total')}</th>
                                        {
                                            this.state.inventoryTotalMonthWise.map(item => (
                                                <th style={{ textAlign: 'right' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item} /></th>
                                            ))
                                        }
                                    </tr>
                                </tfoot>
                            </Table>
                            <div className="table-responsive">
                                <div id="adjustmentsTable" className="table-responsive" />
                            </div>
                            <h6 className="red">{this.state.inventoryBatchInfoDuplicateError || this.state.inventoryBatchInfoNoStockError || this.state.inventoryBatchError}</h6>
                            <div className="table-responsive">
                                <div id="inventoryBatchInfoTable"></div>
                            </div>

                            <div id="showInventoryBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                {this.state.inventoryBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveInventoryBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            {this.state.inventoryChangedFlag == 1 && <Button size="md" color="success" className="submitBtn float-right mr-1" onClick={this.saveInventory}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
                            <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('Adjustments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </Modal>
                    {/* adjustments modal */}

                    {/* Suggested shipments modal */}
                    <Modal isOpen={this.state.suggestedShipments}
                        className={'modal-lg ' + this.props.className, "modalWidth"}>
                        <ModalHeader toggle={() => this.toggleLarge('SuggestedShipments')} className="modalHeaderSupplyPlan">
                            <strong>{i18n.t('static.supplyPlan.suggestedShipmentDetails')}</strong>
                        </ModalHeader>
                        <ModalBody>
                            <h6 className="red">{this.state.suggestedShipmentDuplicateError || this.state.suggestedShipmentError}</h6>
                            <div className="table-responsive">
                                <div id="suggestedShipmentsDetailsTable" />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            {this.state.suggestedShipmentChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.saveSuggestedShipments}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
                            <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('SuggestedShipments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </Modal>
                    {/* Suggested shipments modal */}
                    {/* Shipments modal */}
                    <Modal isOpen={this.state.shipments}
                        className={'modal-lg ' + this.props.className, "modalWidth"}>
                        <ModalHeader toggle={() => this.toggleLarge('shipments')} className="modalHeaderSupplyPlan">
                            <strong>{i18n.t('static.supplyPlan.shipmentsDetails')}</strong>
                        </ModalHeader>
                        <ModalBody>
                            <h6 className="red">{this.state.shipmentDuplicateError || this.state.noFundsBudgetError || this.state.shipmentBatchError || this.state.shipmentBudgetError || this.state.shipmentError}</h6>
                            <div className="table-responsive">
                                <div id="shipmentsDetailsTable" />
                            </div>
                            <h6 className="red">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                            <div className="table-responsive">
                                <div id="shipmentBatchInfoTable"></div>
                            </div>

                            <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                {this.state.shipmentBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveShipmentBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            {this.state.shipmentChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={() => this.saveShipments('shipments')}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}
                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('shipments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </Modal>
                    {/* Shipments modal */}
                </TabPane>
                <TabPane tabId="2">
                    {this.state.planningUnitChange && <SupplyPlanComparisionComponent ref="compareChild" />}
                </TabPane></>)
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
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson1 = JSON.parse(programData);
                        var programJson = {
                            name: getLabelText(JSON.parse(programNameLabel), this.state.lang) + " - " + programJson1.programCode + "~v" + myResult[i].version,
                            id: myResult[i].id
                        }
                        proList[i] = programJson
                    }
                }
                this.setState({
                    programList: proList
                })
            }.bind(this);
        }.bind(this);
    };

    getPlanningUnitList(event) {

        this.setState({
            display: 'none'
        })
        var db1;
        var storeOS;
        getDatabase();
        var regionList = [];
        var dataSourceList = [];
        var dataSourceListAll = [];
        var programPlanningUnitListAll = []
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['programData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('programData');
            var programRequest = programDataOs.get(document.getElementById("programId").value);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                for (var i = 0; i < programJson.regionList.length; i++) {
                    var regionJson = {
                        // name: // programJson.regionList[i].regionId,
                        name: getLabelText(programJson.regionList[i].label, this.state.lang),
                        id: programJson.regionList[i].regionId
                    }
                    regionList[i] = regionJson

                }
                var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                var planningunitRequest = planningunitOs.getAll();
                var planningList = []
                planningunitRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                planningunitRequest.onsuccess = function (e) {
                    var myResult = [];
                    myResult = planningunitRequest.result;
                    var programId = (document.getElementById("programId").value).split("_")[0];
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
                            supplyPlanError: i18n.t('static.program.errortext')
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
                                supplyPlanError: i18n.t('static.program.errortext')
                            })
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
                                planningUnitList: proList,
                                programPlanningUnitList: myResult,
                                regionList: regionList,
                                programJson: programJson,
                                dataSourceListAll: dataSourceListAll,
                                programPlanningUnitListAll: planningList,
                                planningUnitListForConsumption: planningUnitListForConsumption
                            })
                        }.bind(this);
                    }.bind(this);
                }.bind(this);
            }.bind(this)
        }.bind(this)
    }

    getMonthArray(currentDate) {
        var month = [];
        var curDate = currentDate.subtract(MONTHS_IN_PAST_FOR_SUPPLY_PLAN, 'months');
        month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')) })
        for (var i = 1; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
            var curDate = currentDate.add(1, 'months');
            month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')) })
        }
        this.setState({
            monthsArray: month
        })
        return month;
    }

    formSubmit(monthCount) {
        // this.setState({
        //     showTotalShipment: false,
        //     showManualShipment: false,
        //     showErpShipment: false
        // })
        // this.toggleAccordionTotalShipments();
        // this.toggleAccordionManualShipments();
        // this.toggleAccordionErpShipments();
        if (document.getElementById("planningUnitId").value != 0) {
            this.setState({
                planningUnitChange: true,
                display: 'block'
            })
        } else {
            this.setState({
                planningUnitChange: true,
                display: 'none'
            })
        }

        var m = this.getMonthArray(moment(Date.now()).add(monthCount, 'months').utcOffset('-0500'));

        var programId = document.getElementById("programId").value;
        var regionId = -1;
        var planningUnitId = document.getElementById("planningUnitId").value;

        var planningUnit = document.getElementById("planningUnitId");
        var planningUnitName = planningUnit.options[planningUnit.selectedIndex].text;

        var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.planningUnit.id == planningUnitId))[0];
        var minMonthsOfStock = programPlanningUnit.minMonthsOfStock;
        var reorderFrequencyInMonths = programPlanningUnit.reorderFrequencyInMonths;

        var regionListFiltered = [];
        if (regionId != -1) {
            regionListFiltered = (this.state.regionList).filter(r => r.id == regionId);
        } else {
            regionListFiltered = this.state.regionList
        }

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

        var consumptionDataForAllMonths = [];
        var amcTotalData = [];

        var consumptionTotalMonthWise = [];
        var filteredArray = [];
        var minStockArray = [];
        var maxStockArray = [];
        var minStockMoS = [];
        var maxStockMoS = [];

        var inventoryTotalData = [];
        var expectedBalTotalData = [];
        var suggestedShipmentsTotalData = [];
        var inventoryTotalMonthWise = [];
        var filteredArrayInventory = [];
        var openingBalanceArray = [];
        var closingBalanceArray = [];
        var jsonArrForGraph = [];
        var monthsOfStockArray = [];
        var unmetDemand = [];
        var unallocatedConsumption = [];
        var unallocatedAdjustments = [];
        var db1;
        var storeOS;
        getDatabase();
        var regionList = [];
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['programData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('programData');
            var programRequest = programDataOs.get(document.getElementById("programId").value);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                console.log("ProgramJson", programJson);
                var monthsInPastForAMC = programJson.monthsInPastForAmc;
                var monthsInFutureForAMC = programJson.monthsInFutureForAmc;
                var shelfLife = this.state.programPlanningUnitListAll.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].shelfLife;
                this.setState({
                    shelfLife: shelfLife,
                    versionId: programJson.currentVersion.versionId
                })
                var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                var lastActualConsumptionDateArr = [];
                for (var i = 0; i < regionListFiltered.length; i++) {
                    var consumptionListForlastActualConsumptionDate = consumptionList.filter(c => (c.actualFlag.toString() == "true") && c.region.id == regionListFiltered[i].id);
                    var lastActualConsumptionDate = "";
                    for (var lcd = 0; lcd < consumptionListForlastActualConsumptionDate.length; lcd++) {
                        if (lcd == 0) {
                            lastActualConsumptionDate = consumptionListForlastActualConsumptionDate[lcd].consumptionDate;
                        }
                        if (lastActualConsumptionDate < consumptionListForlastActualConsumptionDate[lcd].consumptionDate) {
                            lastActualConsumptionDate = consumptionListForlastActualConsumptionDate[lcd].consumptionDate;
                        }
                    }
                    lastActualConsumptionDateArr.push({ lastActualConsumptionDate: lastActualConsumptionDate, region: regionListFiltered[i].id })
                }
                // if (regionId != -1) {
                //     consumptionList = consumptionList.filter(c => c.region.id == regionId)
                // }

                for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                    var consumptionQty = 0;
                    var consumptionUnaccountedQty = 0;
                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                        var c = consumptionList.filter(c => (c.consumptionDate >= m[i].startDate && c.consumptionDate <= m[i].endDate) && c.region.id == regionListFiltered[reg].id);
                        var filteredJson = { consumptionQty: '', region: { id: regionListFiltered[reg].id }, month: m[i] };
                        for (var j = 0; j < c.length; j++) {
                            var count = 0;
                            for (var k = 0; k < c.length; k++) {
                                if (c[j].consumptionDate == c[k].consumptionDate && c[j].region.id == c[k].region.id && j != k) {
                                    count++;
                                } else {

                                }
                            }
                            if (count == 0) {
                                consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                // if (this.state.batchNoRequired) {
                                consumptionUnaccountedQty += parseInt((c[j].consumptionQty));
                                // }
                                filteredJson = { month: m[i], region: c[j].region, consumptionQty: c[j].consumptionQty, consumptionId: c[j].consumptionId, actualFlag: c[j].actualFlag, consumptionDate: c[j].consumptionDate };
                            } else {
                                if (c[j].actualFlag.toString() == 'true') {
                                    consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                    // if (this.state.batchNoRequired) {
                                    if (c[j].batchInfoList.length == 0) {
                                        consumptionUnaccountedQty += parseInt((c[j].consumptionQty));
                                    }
                                    // }
                                    filteredJson = { month: m[i], region: c[j].region, consumptionQty: c[j].consumptionQty, consumptionId: c[j].consumptionId, actualFlag: c[j].actualFlag, consumptionDate: c[j].consumptionDate };
                                }
                            }
                        }
                        // Consumption details

                        filteredArray.push(filteredJson);
                    }
                    var consumptionWithoutRegion = consumptionList.filter(c => (c.consumptionDate >= m[i].startDate && c.consumptionDate <= m[i].endDate));
                    if (consumptionWithoutRegion.length == 0) {
                        consumptionTotalData.push("");
                        unallocatedConsumption.push("");
                    } else {
                        consumptionTotalData.push(consumptionQty);
                        unallocatedConsumption.push(consumptionUnaccountedQty);
                    }
                }

                // Calculations for AMC
                var amcBeforeArray = [];
                var amcAfterArray = [];
                for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                    for (var c = 0; c < monthsInPastForAMC; c++) {
                        var month1MonthsBefore = moment(m[i].startDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
                        var currentMonth1Before = moment(m[i].endDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
                        var consumptionListForAMC = consumptionList.filter(con => con.consumptionDate >= month1MonthsBefore && con.consumptionDate <= currentMonth1Before);
                        if (consumptionListForAMC.length > 0) {
                            var consumptionQty = 0;
                            for (var j = 0; j < consumptionListForAMC.length; j++) {
                                var count = 0;
                                for (var k = 0; k < consumptionListForAMC.length; k++) {
                                    if (consumptionListForAMC[j].consumptionDate == consumptionListForAMC[k].consumptionDate && consumptionListForAMC[j].region.id == consumptionListForAMC[k].region.id && j != k) {
                                        count++;
                                    } else {

                                    }
                                }

                                if (count == 0) {
                                    consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                                } else {
                                    if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
                                        consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                                    }
                                }
                            }
                            amcBeforeArray.push({ consumptionQty: consumptionQty, month: m[i].month });
                            var amcArrayForMonth = amcBeforeArray.filter(c => c.month == m[i].month);
                            if (amcArrayForMonth.length == monthsInPastForAMC) {
                                c = monthsInPastForAMC;
                            }
                        }

                    }

                    for (var c = 0; c < monthsInFutureForAMC; c++) {
                        var month1MonthsAfter = moment(m[i].startDate).add(c, 'months').format("YYYY-MM-DD");
                        var currentMonth1After = moment(m[i].endDate).add(c, 'months').format("YYYY-MM-DD");
                        var consumptionListForAMC = consumptionList.filter(con => con.consumptionDate >= month1MonthsAfter && con.consumptionDate <= currentMonth1After);
                        if (consumptionListForAMC.length > 0) {
                            var consumptionQty = 0;
                            for (var j = 0; j < consumptionListForAMC.length; j++) {
                                var count = 0;
                                for (var k = 0; k < consumptionListForAMC.length; k++) {
                                    if (consumptionListForAMC[j].consumptionDate == consumptionListForAMC[k].consumptionDate && consumptionListForAMC[j].region.id == consumptionListForAMC[k].region.id && j != k) {
                                        count++;
                                    } else {

                                    }
                                }

                                if (count == 0) {
                                    consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                                } else {
                                    if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
                                        consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                                    }
                                }
                            }
                            amcAfterArray.push({ consumptionQty: consumptionQty, month: m[i].month });
                            var amcArrayForMonth = amcAfterArray.filter(c => c.month == m[i].month);
                            if (amcArrayForMonth.length == monthsInFutureForAMC) {
                                c = monthsInFutureForAMC;
                            }
                        }

                    }
                    var amcArray = amcBeforeArray.concat(amcAfterArray);
                    var amcArrayFilteredForMonth = amcArray.filter(c => m[i].month == c.month);
                    var countAMC = amcArrayFilteredForMonth.length;
                    var sumOfConsumptions = 0;
                    for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
                        sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
                    }
                    if (countAMC != 0) {
                        var amcCalcualted = Math.ceil((sumOfConsumptions) / countAMC);
                        amcTotalData.push(amcCalcualted);

                        // Calculations for Min stock
                        var maxForMonths = 0;
                        if (DEFAULT_MIN_MONTHS_OF_STOCK > minMonthsOfStock) {
                            maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                        } else {
                            maxForMonths = minMonthsOfStock
                        }
                        var minStock = parseInt(parseInt(amcCalcualted) * parseInt(maxForMonths));
                        minStockArray.push(minStock);
                        minStockMoS.push(parseInt(maxForMonths));


                        // Calculations for Max Stock
                        var minForMonths = 0;
                        if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + reorderFrequencyInMonths)) {
                            minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                        } else {
                            minForMonths = (maxForMonths + reorderFrequencyInMonths);
                        }
                        var maxStock = parseInt(parseInt(amcCalcualted) * parseInt(minForMonths));
                        maxStockArray.push(maxStock);
                        maxStockMoS.push(parseInt(minForMonths));
                    } else {
                        amcTotalData.push("");
                        minStockArray.push("");
                        minStockMoS.push("");
                        maxStockMoS.push("");
                        maxStockArray.push("");
                    }
                }

                // Region wise calculations for consumption
                for (var i = 0; i < regionListFiltered.length; i++) {
                    var regionCount = 0;
                    var f = filteredArray.length
                    for (var j = 0; j < f; j++) {
                        if (filteredArray[j].region.id == 0) {
                            filteredArray[j].region.id = regionListFiltered[i].id;
                        }
                        if (regionListFiltered[i].id == filteredArray[j].region.id) {
                            regionCount++;
                        }
                    }
                    if (regionCount == 0) {
                        for (var k = 0; k < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; k++) {
                            filteredArray.push({ consumptionQty: '', region: { id: regionListFiltered[i].id }, month: m[k] })
                        }
                    }
                }
                for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                    var consumptionListFilteredForMonth = filteredArray.filter(c => c.consumptionQty == '' || c.month.month == m[i].month);
                    var monthWiseCount = 0;
                    for (var cL = 0; cL < consumptionListFilteredForMonth.length; cL++) {
                        if (consumptionListFilteredForMonth[cL].consumptionQty != '') {
                            monthWiseCount += parseInt(consumptionListFilteredForMonth[cL].consumptionQty);
                        }
                    }
                    consumptionTotalMonthWise.push(monthWiseCount);
                }

                // Inventory part
                var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                if (regionId != -1) {
                    inventoryList = inventoryList.filter(c => c.region.id == regionId)
                }
                for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                    var adjustmentQty = 0;
                    var adjustmentUnallocatedQty = 0;
                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                        var adjustmentQtyForRegion = 0;
                        var c = inventoryList.filter(c => (c.inventoryDate >= m[i].startDate && c.inventoryDate <= m[i].endDate) && c.region != null && c.region.id == regionListFiltered[reg].id);
                        var filteredJsonInventory = { adjustmentQty: '', region: { id: regionListFiltered[reg].id }, month: m[i] };
                        for (var j = 0; j < c.length; j++) {
                            adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                            if (c[j].batchInfoList.length == 0 && c[j].adjustmentQty < 0) {
                                adjustmentUnallocatedQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                            }
                            adjustmentQtyForRegion += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                            filteredJsonInventory = { month: m[i], region: c[j].region, adjustmentQty: adjustmentQtyForRegion, inventoryId: c[j].inventoryId, inventoryDate: c[j].inventoryDate };
                        }
                        filteredArrayInventory.push(filteredJsonInventory);
                    }
                    var c1 = inventoryList.filter(c => (c.inventoryDate >= m[i].startDate && c.inventoryDate <= m[i].endDate) && c.region == null);
                    var fInventory = { adjustmentQty: '', region: { id: -1 }, month: m[i] };
                    var nationalAdjustment = 0;
                    for (var j = 0; j < c1.length; j++) {
                        adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                        if (c1[j].batchInfoList.length == 0 && c1[j].adjustmentQty < 0) {
                            adjustmentUnallocatedQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                        }
                        nationalAdjustment += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                        fInventory = { month: m[i], region: { id: -1 }, adjustmentQty: nationalAdjustment, inventoryId: c1[j].inventoryId, inventoryDate: c1[j].inventoryDate };
                    }
                    filteredArrayInventory.push(fInventory);
                    var adjustmentsTotalData = inventoryList.filter(c => (c.inventoryDate >= m[i].startDate && c.inventoryDate <= m[i].endDate));
                    if (adjustmentsTotalData.length == 0) {
                        inventoryTotalData.push("");
                        unallocatedAdjustments.push("");
                    } else {
                        inventoryTotalData.push(adjustmentQty);
                        unallocatedAdjustments.push(adjustmentUnallocatedQty);
                    }
                }
                // Region wise calculations for inventory
                for (var i = 0; i < regionListFiltered.length; i++) {
                    var regionCount = 0;
                    var f = filteredArrayInventory.length
                    for (var j = 0; j < f; j++) {
                        if (filteredArrayInventory[j].region.id == 0) {
                            filteredArrayInventory[j].region.id = regionListFiltered[i].id;
                        }
                        if (regionListFiltered[i].id == filteredArrayInventory[j].region.id) {
                            regionCount++;
                        }
                    }
                    if (regionCount == 0) {
                        for (var k = 0; k < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; k++) {
                            filteredArrayInventory.push({ adjustmentQty: '', region: { id: regionListFiltered[i].id }, month: m[k] })
                        }
                    }
                }
                for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                    var inventoryListFilteredForMonth = filteredArrayInventory.filter(c => c.adjustmentQty == '' || c.month.month == m[i].month);
                    var monthWiseCount = 0;
                    for (var cL = 0; cL < inventoryListFilteredForMonth.length; cL++) {
                        if (inventoryListFilteredForMonth[cL].adjustmentQty != '') {
                            monthWiseCount += parseInt(inventoryListFilteredForMonth[cL].adjustmentQty);
                        }
                    }
                    inventoryTotalMonthWise.push(monthWiseCount);
                }



                // Shipments updated part

                var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                var papuOs = papuTransaction.objectStore('procurementAgent');
                var papuRequest = papuOs.getAll();
                papuRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                papuRequest.onsuccess = function (event) {
                    var papuResult = [];
                    papuResult = papuRequest.result;

                    var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                    var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
                    var shipmentStatusRequest = shipmentStatusOs.getAll();
                    shipmentStatusRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    shipmentStatusRequest.onsuccess = function (event) {
                        var shipmentStatusResult = [];
                        shipmentStatusResult = shipmentStatusRequest.result;

                        // Shipments part
                        var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                        for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                            var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate))
                            var shipmentTotalQty = 0;

                            var manualShipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.erpFlag == false);
                            var manualTotalQty = 0;

                            var deliveredShipmentsQty = 0;
                            var shippedShipmentsQty = 0;
                            var orderedShipmentsQty = 0;
                            var plannedShipmentsQty = 0;

                            var deliveredShipmentsDetailsArr = [];
                            var shippedShipmentsDetailsArr = [];
                            var orderedShipmentsDetailsArr = [];
                            var plannedShipmentsDetailsArr = [];

                            var erpShipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.erpFlag == true);
                            var erpTotalQty = 0;

                            var deliveredErpShipmentsQty = 0;
                            var shippedErpShipmentsQty = 0;
                            var orderedErpShipmentsQty = 0;
                            var plannedErpShipmentsQty = 0;

                            var deliveredErpShipmentsDetailsArr = [];
                            var shippedErpShipmentsDetailsArr = [];
                            var orderedErpShipmentsDetailsArr = [];
                            var plannedErpShipmentsDetailsArr = [];
                            var paColor = "";

                            for (var j = 0; j < shipmentArr.length; j++) {
                                shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                            }
                            shipmentsTotalData.push(shipmentTotalQty);

                            for (var j = 0; j < manualShipmentArr.length; j++) {
                                manualTotalQty += parseInt((manualShipmentArr[j].shipmentQty));
                                if (manualShipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                    if (manualShipmentArr[j].procurementAgent.id != "") {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                    } else {
                                        paColor = "#efefef"
                                    }
                                    deliveredShipmentsDetailsArr.push(shipmentDetail);
                                    deliveredShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                                } else if (manualShipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                    if (manualShipmentArr[j].procurementAgent.id != "") {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                    } else {
                                        paColor = "#efefef"
                                    }
                                    shippedShipmentsDetailsArr.push(shipmentDetail);
                                    shippedShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                                } else if (manualShipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                    if (manualShipmentArr[j].procurementAgent.id != "") {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                    } else {
                                        paColor = "#efefef"
                                    }
                                    orderedShipmentsDetailsArr.push(shipmentDetail);
                                    orderedShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                                } else if (manualShipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == DRAFT_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                    if (manualShipmentArr[j].procurementAgent.id != "") {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                    } else {
                                        paColor = "#efefef"
                                    }
                                    plannedShipmentsDetailsArr.push(shipmentDetail);
                                    plannedShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                                }
                            }

                            manualShipmentsTotalData.push(manualTotalQty);

                            if ((manualShipmentArr.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                                var colour = paColor;
                                if (deliveredShipmentsDetailsArr.length > 1) {
                                    colour = "#d9ead3";
                                }
                                deliveredShipmentsTotalData.push({ qty: deliveredShipmentsQty, month: m[i], shipmentDetail: deliveredShipmentsDetailsArr, noOfShipments: deliveredShipmentsDetailsArr.length, colour: colour })
                            } else {
                                deliveredShipmentsTotalData.push("");
                            }

                            if ((manualShipmentArr.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                var colour = paColor;
                                if (shippedShipmentsDetailsArr.length > 1) {
                                    colour = "#d9ead3";
                                }
                                shippedShipmentsTotalData.push({ qty: shippedShipmentsQty, month: m[i], shipmentDetail: shippedShipmentsDetailsArr, noOfShipments: shippedShipmentsDetailsArr.length, colour: colour })
                            } else {
                                shippedShipmentsTotalData.push("");
                            }

                            if ((manualShipmentArr.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS)).length > 0) {
                                var colour = paColor;
                                if (orderedShipmentsDetailsArr.length > 1) {
                                    colour = "#d9ead3";
                                }
                                orderedShipmentsTotalData.push({ qty: orderedShipmentsQty, month: m[i], shipmentDetail: orderedShipmentsDetailsArr, noOfShipments: orderedShipmentsDetailsArr.length, colour: colour })
                            } else {
                                orderedShipmentsTotalData.push("");
                            }

                            if ((manualShipmentArr.filter(c => c.shipmentStatus.id == DRAFT_SHIPMENT_STATUS || c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                var colour = paColor;
                                if (plannedShipmentsDetailsArr.length > 1) {
                                    colour = "#d9ead3";
                                }
                                plannedShipmentsTotalData.push({ qty: plannedShipmentsQty, month: m[i], shipmentDetail: plannedShipmentsDetailsArr, noOfShipments: plannedShipmentsDetailsArr.length, colour: colour })
                            } else {
                                plannedShipmentsTotalData.push("");
                            }

                            for (var j = 0; j < erpShipmentArr.length; j++) {
                                erpTotalQty += parseInt((erpShipmentArr[j].shipmentQty));
                                if (erpShipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                    if (erpShipmentArr[j].procurementAgent.id != "") {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                    } else {
                                        paColor = "#efefef"
                                    }
                                    deliveredErpShipmentsDetailsArr.push(shipmentDetail);
                                    deliveredErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                                } else if (erpShipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                    if (erpShipmentArr[j].procurementAgent.id != "") {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                    } else {
                                        paColor = "#efefef"
                                    }
                                    shippedErpShipmentsDetailsArr.push(shipmentDetail);
                                    shippedErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                                } else if (erpShipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                    if (erpShipmentArr[j].procurementAgent.id != "") {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                    } else {
                                        paColor = "#efefef"
                                    }
                                    orderedErpShipmentsDetailsArr.push(shipmentDetail);
                                    orderedErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                                } else if (erpShipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == DRAFT_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                    if (erpShipmentArr[j].procurementAgent.id != "") {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = getLabelText(procurementAgent.label, this.state.lang) + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                    } else {
                                        paColor = "#efefef"
                                    }
                                    plannedErpShipmentsDetailsArr.push(shipmentDetail);
                                    plannedErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                                }
                            }

                            erpShipmentsTotalData.push(erpTotalQty);

                            if ((erpShipmentArr.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                                var colour = paColor;
                                if (deliveredErpShipmentsDetailsArr.length > 1) {
                                    colour = "#d9ead3";
                                }
                                deliveredErpShipmentsTotalData.push({ qty: deliveredErpShipmentsQty, month: m[i], shipmentDetail: deliveredErpShipmentsDetailsArr, noOfShipments: deliveredErpShipmentsDetailsArr.length, colour: colour })
                            } else {
                                deliveredErpShipmentsTotalData.push("");
                            }

                            if ((erpShipmentArr.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                var colour = paColor;
                                if (shippedErpShipmentsDetailsArr.length > 1) {
                                    colour = "#d9ead3";
                                }
                                shippedErpShipmentsTotalData.push({ qty: shippedErpShipmentsQty, month: m[i], shipmentDetail: shippedErpShipmentsDetailsArr, noOfShipments: shippedErpShipmentsDetailsArr.length, colour: colour })
                            } else {
                                shippedErpShipmentsTotalData.push("");
                            }

                            if ((erpShipmentArr.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS)).length > 0) {
                                var colour = paColor;
                                if (orderedErpShipmentsDetailsArr.length > 1) {
                                    colour = "#d9ead3";
                                }
                                orderedErpShipmentsTotalData.push({ qty: orderedErpShipmentsQty, month: m[i], shipmentDetail: orderedErpShipmentsDetailsArr, noOfShipments: orderedErpShipmentsDetailsArr.length, colour: colour })
                            } else {
                                orderedErpShipmentsTotalData.push("");
                            }

                            if ((erpShipmentArr.filter(c => c.shipmentStatus.id == DRAFT_SHIPMENT_STATUS || c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                var colour = paColor;
                                if (plannedErpShipmentsDetailsArr.length > 1) {
                                    colour = "#d9ead3";
                                }
                                plannedErpShipmentsTotalData.push({ qty: plannedErpShipmentsQty, month: m[i], shipmentDetail: plannedErpShipmentsDetailsArr, noOfShipments: plannedErpShipmentsDetailsArr.length, colour: colour })
                            } else {
                                plannedErpShipmentsTotalData.push("");
                            }
                        }

                        // Calculations for exipred stock
                        var batchInfoForPlanningUnit = programJson.batchInfoList.filter(c => c.planningUnitId == document.getElementById("planningUnitId").value);
                        var myArray = batchInfoForPlanningUnit.sort(function (a, b) { return new Date(a.expiryDate) - new Date(b.expiryDate) })
                        for (var ma = 0; ma < myArray.length; ma++) {
                            var shipmentList = programJson.shipmentList;
                            var shipmentBatchArray = [];
                            for (var ship = 0; ship < shipmentList.length; ship++) {
                                var batchInfoList = shipmentList[ship].batchInfoList;
                                for (var bi = 0; bi < batchInfoList.length; bi++) {
                                    shipmentBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].shipmentQty })
                                }
                            }
                            var stockForBatchNumber = shipmentBatchArray.filter(c => c.batchNo == myArray[ma].batchNo)[0];
                            var totalStockForBatchNumber = stockForBatchNumber.qty;
                            var consumptionList = programJson.consumptionList;
                            var consumptionBatchArray = [];

                            for (var con = 0; con < consumptionList.length; con++) {
                                var batchInfoList = consumptionList[con].batchInfoList;
                                for (var bi = 0; bi < batchInfoList.length; bi++) {
                                    consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
                                }
                            }
                            var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
                            if (consumptionForBatchNumber == undefined) {
                                consumptionForBatchNumber = [];
                            }
                            var consumptionQty = 0;
                            for (var b = 0; b < consumptionForBatchNumber.length; b++) {
                                consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
                            }
                            var inventoryList = programJson.inventoryList;
                            var inventoryBatchArray = [];
                            for (var inv = 0; inv < inventoryList.length; inv++) {
                                var batchInfoList = inventoryList[inv].batchInfoList;
                                for (var bi = 0; bi < batchInfoList.length; bi++) {
                                    inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier })
                                }
                            }
                            var inventoryForBatchNumber = [];
                            if (inventoryBatchArray.length > 0) {
                                inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
                            }
                            if (inventoryForBatchNumber == undefined) {
                                inventoryForBatchNumber = [];
                            }
                            var adjustmentQty = 0;
                            for (var b = 0; b < inventoryForBatchNumber.length; b++) {
                                adjustmentQty += parseFloat(inventoryForBatchNumber[b].qty);
                            }
                            var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
                            myArray[ma].remainingQty = remainingBatchQty;
                        }
                        console.log("MyArray", myArray);

                        var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                        var inventoryList = (programJson.inventoryList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                        var createdDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");
                        var firstDataEntryDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");
                        var curDate = moment(this.state.monthsArray[TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN - 1].startDate).subtract(1, 'months').format("YYYY-MM-DD");
                        for (var i = 0; createdDate < curDate; i++) {
                            createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                            var consumptionQty = 0;
                            var unallocatedConsumptionQty = 0;
                            var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                            var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                            for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].id);
                                for (var j = 0; j < c.length; j++) {
                                    var count = 0;
                                    for (var k = 0; k < c.length; k++) {
                                        if (c[j].consumptionDate == c[k].consumptionDate && c[j].region.id == c[k].region.id && j != k) {
                                            count++;
                                        } else {

                                        }
                                    }
                                    if (count == 0) {
                                        consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                        unallocatedConsumptionQty = unallocatedConsumptionQty + parseInt((c[j].consumptionQty));
                                    } else {
                                        if (c[j].actualFlag.toString() == 'true') {
                                            consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                            var qty = 0;
                                            if (c[j].batchInfoList.length > 0) {
                                                for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                                    qty += parseInt((c[j].batchInfoList)[a].consumptionQty);
                                                }
                                            }
                                            var remainingQty = parseInt((c[j].consumptionQty)) - parseInt(qty);
                                            unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
                                        }
                                    }
                                }
                            }

                            var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
                            console.log("--------------------------------------------------------------");
                            console.log("Start date", startDate);
                            for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua < batchDetailsForParticularPeriod.length; ua++) {
                                console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua].batchNo);
                                console.log("Unallocated consumption", unallocatedConsumptionQty);
                                var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua].batchNo);
                                if (parseInt(batchDetailsForParticularPeriod[ua].remainingQty) >= parseInt(unallocatedConsumptionQty)) {
                                    myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua].remainingQty) - parseInt(unallocatedConsumptionQty);
                                    unallocatedConsumptionQty = 0
                                } else {
                                    var rq = batchDetailsForParticularPeriod[ua].remainingQty;
                                    myArray[index].remainingQty = 0;
                                    unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) - parseInt(rq);
                                }
                            }
                            var adjustmentQty = 0;
                            var unallocatedAdjustmentQty = 0;
                            for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].id);
                                for (var j = 0; j < c.length; j++) {
                                    adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                    var qty1 = 0;
                                    if (c[j].batchInfoList.length > 0) {
                                        for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                            qty1 += parseFloat(parseInt((c[j].batchInfoList)[a].adjustmentQty) * c[j].multiplier);
                                        }
                                    }
                                    var remainingQty = parseFloat((c[j].adjustmentQty * c[j].multiplier)) - parseFloat(qty1);
                                    unallocatedAdjustmentQty = parseFloat(remainingQty);
                                    if (unallocatedAdjustmentQty < 0) {
                                        for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0; ua--) {
                                            console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                            console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                            var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua - 1].batchNo);
                                            if (parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty) > 0) {
                                                myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
                                                unallocatedAdjustmentQty = 0
                                            } else {
                                                var rq = batchDetailsForParticularPeriod[ua - 1].remainingQty;
                                                myArray[index].remainingQty = 0;
                                                unallocatedAdjustmentQty = parseInt(unallocatedAdjustmentQty) + parseInt(rq);
                                            }
                                        }
                                    } else {
                                        if (batchDetailsForParticularPeriod.length > 0) {
                                            console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                            console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                            batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
                                            unallocatedAdjustmentQty = 0;
                                        }
                                    }

                                }
                            }
                            var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                            for (var j = 0; j < c1.length; j++) {
                                adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                unallocatedAdjustmentQty = parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                if (unallocatedAdjustmentQty < 0) {
                                    for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0; ua--) {
                                        console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                        console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                        var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua - 1].batchNo);
                                        if (parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty) > 0) {
                                            myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
                                            unallocatedAdjustmentQty = 0
                                        } else {
                                            var rq = batchDetailsForParticularPeriod[ua - 1].remainingQty;
                                            myArray[index].remainingQty = 0;
                                            unallocatedAdjustmentQty = parseInt(unallocatedAdjustmentQty) + parseInt(rq);
                                        }
                                    }
                                } else {
                                    if (batchDetailsForParticularPeriod.length > 0) {
                                        console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                        console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                        batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
                                        unallocatedAdjustmentQty = 0;
                                    }
                                }
                            }

                        }

                        console.log("My array after accounting all the calcuklations", myArray);
                        var expiredStockArr = myArray;

                        // Calculation of opening and closing balance
                        var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                        var createdDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");
                        var firstDataEntryDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");
                        var curDate = moment(this.state.monthsArray[0].startDate).subtract(1, 'months').format("YYYY-MM-DD");
                        var openingBalance = 0;
                        var expiredStockQty = 0;
                        for (var i = 0; createdDate < curDate; i++) {
                            createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                            var consumptionQty = 0;
                            var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                            var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                            for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].id);
                                for (var j = 0; j < c.length; j++) {
                                    var count = 0;
                                    for (var k = 0; k < c.length; k++) {
                                        if (c[j].consumptionDate == c[k].consumptionDate && c[j].region.id == c[k].region.id && j != k) {
                                            count++;
                                        } else {

                                        }
                                    }
                                    if (count == 0) {
                                        consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                    } else {
                                        if (c[j].actualFlag.toString() == 'true') {
                                            consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                        }
                                    }
                                }
                            }

                            // Inventory part
                            var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                            var adjustmentQty = 0;
                            for (var reg = 0; reg < regionListFiltered.length; reg++) {
                                var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].id);
                                for (var j = 0; j < c.length; j++) {
                                    adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                                }
                            }
                            var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                            for (var j = 0; j < c1.length; j++) {
                                adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                            }

                            // Shipments part
                            var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                            var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate))
                            var shipmentTotalQty = 0;
                            for (var j = 0; j < shipmentArr.length; j++) {
                                shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                            }

                            var expiredStock = expiredStockArr.filter(c => ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && ((moment(c.expiryDate).format("YYYY-MM-DD")) <= (moment(endDate).format("YYYY-MM-DD"))));
                            expiredStockQty = 0;
                            for (var j = 0; j < expiredStock.length; j++) {
                                expiredStockQty += parseInt((expiredStock[j].remainingQty));
                            }

                            var closingBalance = parseInt(openingBalance) + parseInt(shipmentTotalQty) + parseFloat(adjustmentQty) - parseInt(consumptionQty) - parseInt(expiredStockQty);
                            if (closingBalance < 0) {
                                closingBalance = 0;
                            }
                            openingBalance = closingBalance;
                        }
                        openingBalanceArray.push(openingBalance);
                        console.log("Total exipred stock", totalExpiredStockArr);
                        for (var i = 1; i <= TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                            var consumptionQtyForCB = 0;
                            if (consumptionTotalData[i - 1] != "") {
                                consumptionQtyForCB = consumptionTotalData[i - 1];
                            }
                            var inventoryQtyForCB = 0;
                            if (inventoryTotalData[i - 1] != "") {
                                inventoryQtyForCB = inventoryTotalData[i - 1];
                            }
                            var shipmentsQtyForCB = 0;
                            if (shipmentsTotalData[i - 1] != "") {
                                shipmentsQtyForCB = shipmentsTotalData[i - 1];
                            }
                            // Accounting exipred stock in closing balance
                            console.log("M[i].startDate", m[i - 1].startDate);
                            var expiredStock = expiredStockArr.filter(c => ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(m[i - 1].startDate).format("YYYY-MM-DD"))) && ((moment(c.expiryDate).format("YYYY-MM-DD")) <= (moment(m[i - 1].endDate).format("YYYY-MM-DD"))));
                            var expiredStockQty = 0;
                            for (var j = 0; j < expiredStock.length; j++) {
                                expiredStockQty += parseInt((expiredStock[j].remainingQty));
                            }
                            totalExpiredStockArr.push(expiredStockQty);
                            // Suggested shipments part
                            var s = i - 1;
                            var month = m[s].startDate;
                            var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                            var compare = (month >= currentMonth);
                            var stockInHand = openingBalanceArray[s] - consumptionQtyForCB + inventoryQtyForCB + shipmentsQtyForCB;
                            if (compare && parseInt(stockInHand) <= parseInt(minStockArray[s])) {
                                var suggestedOrd = parseInt(maxStockArray[s] - minStockArray[s]);
                                if (suggestedOrd == 0) {
                                    var addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                                        parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                                        parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime);
                                    var expectedDeliveryDate = moment(month).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                    var isEmergencyOrder = 0;
                                    if (expectedDeliveryDate >= currentMonth) {
                                        isEmergencyOrder = 0;
                                    } else {
                                        isEmergencyOrder = 1;
                                    }
                                    suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": m[s].startDate, "isEmergencyOrder": isEmergencyOrder });
                                } else {
                                    var addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                                        parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                                        parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime);
                                    var expectedDeliveryDate = moment(month).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                    var isEmergencyOrder = 0;
                                    if (expectedDeliveryDate >= currentMonth) {
                                        isEmergencyOrder = 0;
                                    } else {
                                        isEmergencyOrder = 1;
                                    }
                                    suggestedShipmentsTotalData.push({ "suggestedOrderQty": suggestedOrd, "month": m[s].startDate, "isEmergencyOrder": isEmergencyOrder });
                                }
                            } else {
                                var addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                                    parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                                    parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime);
                                var expectedDeliveryDate = moment(month).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                var isEmergencyOrder = 0;
                                if (expectedDeliveryDate >= currentMonth) {
                                    isEmergencyOrder = 0;
                                } else {
                                    isEmergencyOrder = 1;
                                }
                                suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": m[s].startDate, "isEmergencyOrder": isEmergencyOrder });
                            }

                            var suggestedShipmentQtyForCB = 0;
                            if (suggestedShipmentsTotalData[i - 1].suggestedOrderQty != "") {
                                suggestedShipmentQtyForCB = suggestedShipmentsTotalData[i - 1].suggestedOrderQty;
                            }
                            var closingBalance = openingBalanceArray[i - 1] - consumptionQtyForCB + inventoryQtyForCB + shipmentsQtyForCB - parseInt(expiredStockQty);
                            if (closingBalance >= 0) {
                                unmetDemand.push("");
                                closingBalance = closingBalance;

                            } else {
                                unmetDemand.push(closingBalance);
                                closingBalance = 0;
                            }
                            closingBalanceArray.push(closingBalance);
                            if (i != TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN) {
                                openingBalanceArray.push(closingBalance);
                            }
                        }
                        console.log("totalExpiredStockArr", totalExpiredStockArr);
                        // Calculations for monthsOfStock
                        for (var s = 0; s < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; s++) {
                            if (closingBalanceArray[s] != 0 && amcTotalData[s] != 0 && closingBalanceArray[s] != "" && amcTotalData[s] != "") {
                                var mos = parseFloat(closingBalanceArray[s] / amcTotalData[s]).toFixed(2);
                                monthsOfStockArray.push(mos);
                            } else {
                                monthsOfStockArray.push("");
                            }
                        }

                        var plannedShipmentArrForGraph = [];
                        var orderedShipmentArrForGraph = [];
                        var shippedShipmentArrForGraph = [];
                        var deliveredShipmentArrForGraph = [];

                        var plannedErpShipmentArrForGraph = [];
                        var orderedErpShipmentArrForGraph = [];
                        var shippedErpShipmentArrForGraph = [];
                        var deliveredErpShipmentArrForGraph = [];
                        for (var jsonForGraph = 0; jsonForGraph < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; jsonForGraph++) {
                            if (plannedShipmentsTotalData[jsonForGraph] != "") {
                                plannedShipmentArrForGraph.push(plannedShipmentsTotalData[jsonForGraph].qty)
                            } else {
                                plannedShipmentArrForGraph.push(0)
                            }

                            if (orderedShipmentsTotalData[jsonForGraph] != "") {
                                orderedShipmentArrForGraph.push(orderedShipmentsTotalData[jsonForGraph].qty)
                            } else {
                                orderedShipmentArrForGraph.push(0)
                            }

                            if (shippedShipmentsTotalData[jsonForGraph] != "") {
                                shippedShipmentArrForGraph.push(shippedShipmentsTotalData[jsonForGraph].qty)
                            } else {
                                shippedShipmentArrForGraph.push(0)
                            }

                            if (deliveredShipmentsTotalData[jsonForGraph] != "") {
                                deliveredShipmentArrForGraph.push(deliveredShipmentsTotalData[jsonForGraph].qty)
                            } else {
                                deliveredShipmentArrForGraph.push(0)
                            }

                            if (plannedErpShipmentsTotalData[jsonForGraph] != "") {
                                plannedErpShipmentArrForGraph.push(plannedErpShipmentsTotalData[jsonForGraph].qty)
                            } else {
                                plannedErpShipmentArrForGraph.push(0)
                            }

                            if (orderedErpShipmentsTotalData[jsonForGraph] != "") {
                                orderedErpShipmentArrForGraph.push(orderedErpShipmentsTotalData[jsonForGraph].qty)
                            } else {
                                orderedErpShipmentArrForGraph.push(0)
                            }

                            if (shippedErpShipmentsTotalData[jsonForGraph] != "") {
                                shippedErpShipmentArrForGraph.push(shippedErpShipmentsTotalData[jsonForGraph].qty)
                            } else {
                                shippedErpShipmentArrForGraph.push(0)
                            }

                            if (deliveredErpShipmentsTotalData[jsonForGraph] != "") {
                                deliveredErpShipmentArrForGraph.push(deliveredErpShipmentsTotalData[jsonForGraph].qty)
                            } else {
                                deliveredErpShipmentArrForGraph.push(0)
                            }
                        }

                        // Building json for graph
                        for (var jsonForGraph = 0; jsonForGraph < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; jsonForGraph++) {
                            var json = {
                                month: m[jsonForGraph].month,
                                consumption: consumptionTotalData[jsonForGraph],
                                stock: closingBalanceArray[jsonForGraph],
                                planned: plannedShipmentArrForGraph[jsonForGraph] + plannedErpShipmentArrForGraph[jsonForGraph],
                                delivered: deliveredShipmentArrForGraph[jsonForGraph] + deliveredErpShipmentArrForGraph[jsonForGraph],
                                shipped: shippedShipmentArrForGraph[jsonForGraph] + shippedErpShipmentArrForGraph[jsonForGraph],
                                ordered: orderedShipmentArrForGraph[jsonForGraph] + orderedErpShipmentArrForGraph[jsonForGraph],
                                mos: monthsOfStockArray[jsonForGraph],
                                minMos: minStockMoS[jsonForGraph],
                                maxMos: maxStockMoS[jsonForGraph]
                            }
                            jsonArrForGraph.push(json);
                        }
                        this.setState({
                            suggestedShipmentsTotalData: suggestedShipmentsTotalData,
                            inventoryTotalData: inventoryTotalData,
                            inventoryFilteredArray: filteredArrayInventory,
                            regionListFiltered: regionListFiltered,
                            inventoryTotalMonthWise: inventoryTotalMonthWise,
                            openingBalanceArray: openingBalanceArray,
                            closingBalanceArray: closingBalanceArray,
                            consumptionTotalData: consumptionTotalData,
                            shipmentsTotalData: shipmentsTotalData,
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
                            consumptionFilteredArray: filteredArray,
                            consumptionTotalMonthWise: consumptionTotalMonthWise,
                            amcTotalData: amcTotalData,
                            minStockArray: minStockArray,
                            maxStockArray: maxStockArray,
                            minStockMoS: minStockMoS,
                            maxStockMoS: maxStockMoS,
                            monthsOfStockArray: monthsOfStockArray,
                            planningUnitName: planningUnitName,
                            jsonArrForGraph: jsonArrForGraph,
                            lastActualConsumptionDate: lastActualConsumptionDate,
                            lastActualConsumptionDateArr: lastActualConsumptionDateArr,
                            unmetDemand: unmetDemand,
                            expiredStockArr: totalExpiredStockArr
                        })
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)

    }

    calculationsForOpeningAndClosingBalanceAccordingToMonths() {
        // var db1;
        // var storeOS;
        // getDatabase();
        // var regionList = this.state.regionList;
        // var regionListFiltered = this.state.regionList;
        // console.log("RegionListFiltered", regionListFiltered)
        // var planningUnitId = document.getElementById("planningUnitId").value;
        // var openRequest = indexedDB.open('fasp', 1);
        // openRequest.onerror = function (event) {
        //     this.setState({
        //         supplyPlanError: i18n.t('static.program.errortext')
        //     })
        // }.bind(this);
        // openRequest.onsuccess = function (e) {
        //     db1 = e.target.result;
        //     var programDataTransaction = db1.transaction(['programData'], 'readwrite');
        //     var programDataOs = programDataTransaction.objectStore('programData');
        //     var programRequest = programDataOs.get(document.getElementById("programId").value);
        //     programRequest.onerror = function (event) {
        //         this.setState({
        //             supplyPlanError: i18n.t('static.program.errortext')
        //         })
        //     }.bind(this);
        //     programRequest.onsuccess = function (e) {
        //         var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
        //         var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
        //         var programJson = JSON.parse(programData);
        //         console.log("ProgramJson in closing balance function", programJson);

        //         console.log("Opening balance inside function", openingBalance)
        //         return openingBalance;
        //     }.bind(this)
        // }.bind(this)
    }

    toggleLarge(supplyPlanType, month, quantity, startDate, endDate, isEmergencyOrder, shipmentType) {
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
            noFundsBudgetError: ''

        })
        if (supplyPlanType == 'Consumption') {
            var monthCountConsumption = this.state.monthCount;
            this.setState({
                consumption: !this.state.consumption,
                monthCountConsumption: monthCountConsumption,
            });
            this.formSubmit(monthCountConsumption);
        } else if (supplyPlanType == 'SuggestedShipments') {
            this.setState({
                suggestedShipments: !this.state.suggestedShipments,
            });
            this.suggestedShipmentsDetailsClicked(month, quantity, isEmergencyOrder);
        } else if (supplyPlanType == 'shipments') {
            this.setState({
                shipments: !this.state.shipments
            });
            this.shipmentsDetailsClicked(shipmentType, startDate, endDate);
        } else if (supplyPlanType == 'Adjustments') {
            var monthCountAdjustments = this.state.monthCount;
            this.setState({
                adjustments: !this.state.adjustments,
                monthCountAdjustments: monthCountAdjustments
            });
            this.formSubmit(monthCountAdjustments);
        }
    }

    actionCanceled(supplyPlanType) {
        var inputs = document.getElementsByClassName("submitBtn");
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].disabled = true;
        }
        this.setState({
            message: i18n.t('static.message.cancelled'),
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
            noFundsBudgetError: ''

        })
        this.toggleLarge(supplyPlanType);
    }

    leftClicked() {
        var monthCount = (this.state.monthCount) - NO_OF_MONTHS_ON_LEFT_CLICKED;
        this.setState({
            monthCount: monthCount
        })
        this.formSubmit(monthCount)
    }

    rightClicked() {
        var monthCount = (this.state.monthCount) + NO_OF_MONTHS_ON_RIGHT_CLICKED;
        this.setState({
            monthCount: monthCount
        })
        this.formSubmit(monthCount)
    }

    leftClickedConsumption() {
        var monthCountConsumption = (this.state.monthCountConsumption) - NO_OF_MONTHS_ON_LEFT_CLICKED;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(monthCountConsumption)
    }

    rightClickedConsumption() {
        var monthCountConsumption = (this.state.monthCountConsumption) + NO_OF_MONTHS_ON_RIGHT_CLICKED;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(monthCountConsumption);
    }

    leftClickedAdjustments() {
        var monthCountAdjustments = (this.state.monthCountAdjustments) - NO_OF_MONTHS_ON_LEFT_CLICKED;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(monthCountAdjustments)
    }

    rightClickedAdjustments() {
        var monthCountAdjustments = (this.state.monthCountAdjustments) + NO_OF_MONTHS_ON_RIGHT_CLICKED;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(monthCountAdjustments);
    }

    // Consumption Functionality

    // Show consumption details
    consumptionDetailsClicked(startDate, endDate, region, actualFlag, month) {
        if (this.state.consumptionChangedFlag == 0) {
            var elInstance = this.state.consumptionBatchInfoTableEl;
            if (elInstance != undefined && elInstance != "") {
                elInstance.destroy();
            }
            var planningUnitId = document.getElementById("planningUnitId").value;
            var programId = document.getElementById("programId").value;
            var dataSourceListAll = this.state.dataSourceListAll.filter(c => c.dataSourceType.id == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE || c.dataSourceType.id == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE);
            var dataSourceList = [];
            for (var k = 0; k < dataSourceListAll.length; k++) {
                var dataSourceJson = {
                    name: getLabelText(dataSourceListAll[k].label, this.state.lang),
                    id: dataSourceListAll[k].dataSourceId
                }
                dataSourceList.push(dataSourceJson);
            }
            var myVar = '';

            var consumptionTotalData = [];
            var filteredArray = [];

            var db1;
            var storeOS;
            getDatabase();
            var regionList = [];
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                var programDataOs = programDataTransaction.objectStore('programData');
                var programRequest = programDataOs.get(document.getElementById("programId").value);
                programRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                programRequest.onsuccess = function (e) {
                    var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    this.setState({
                        programJsonAfterConsumptionClicked: programJson
                    })
                    var batchList = []
                    var batchInfoList = programJson.batchInfoList;
                    // batchInfoList.push({
                    //     batch:{
                    //         batchId:0,
                    //         batchNo:i18n.t('static.supplyPlan.fefo'),
                    //         expiryDate:
                    //     }
                    // })
                    batchList.push({
                        name: i18n.t('static.supplyPlan.fefo'),
                        id: -1
                    })
                    for (var k = 0; k < batchInfoList.length; k++) {
                        if (batchInfoList[k].expiryDate >= startDate && batchInfoList[k].createdDate <= startDate && batchInfoList[k].planningUnitId == document.getElementById("planningUnitId").value) {
                            var batchJson = {
                                name: batchInfoList[k].batchNo,
                                id: batchInfoList[k].batchId
                            }
                            batchList.push(batchJson);
                        }
                    }
                    this.setState({
                        batchInfoList: batchList,
                        batchInfoListAllForConsumption: batchInfoList
                    })
                    var consumptionListUnFiltered = (programJson.consumptionList);
                    this.setState({
                        consumptionListUnFiltered: consumptionListUnFiltered,
                        inventoryListUnFiltered: programJson.inventoryList
                    })
                    var consumptionList = consumptionListUnFiltered.filter(con =>
                        con.planningUnit.id == planningUnitId
                        && con.region.id == region
                        && ((con.consumptionDate >= startDate && con.consumptionDate <= endDate)));
                    this.el = jexcel(document.getElementById("consumptionDetailsTable"), '');
                    this.el.destroy();
                    var data = [];
                    var consumptionDataArr = []
                    for (var j = 0; j < consumptionList.length; j++) {
                        data = [];
                        data[0] = month;
                        data[1] = consumptionList[j].region.id;
                        data[2] = consumptionList[j].dataSource.id;
                        data[3] = consumptionList[j].consumptionQty;
                        data[4] = consumptionList[j].dayOfStockOut;
                        if (consumptionList[j].notes === null || ((consumptionList[j].notes).trim() == "NULL")) {
                            data[5] = "";
                        } else {
                            data[5] = consumptionList[j].notes;
                        }
                        data[6] = consumptionListUnFiltered.findIndex(c => c.planningUnit.id == planningUnitId && c.region.id == region && c.consumptionDate == consumptionList[j].consumptionDate && c.actualFlag.toString() == consumptionList[j].actualFlag.toString());
                        data[7] = startDate;
                        data[8] = consumptionList[j].actualFlag;
                        data[9] = consumptionList[j].active;
                        data[10] = consumptionList[j].batchInfoList;
                        consumptionDataArr[j] = data;
                    }
                    if (consumptionList.length == 0) {
                        data = [];
                        data[0] = month;
                        data[1] = region;
                        data[2] = "";
                        data[3] = "";
                        data[4] = "";
                        data[5] = "";
                        data[6] = -1;
                        data[7] = startDate;
                        data[8] = "";
                        data[9] = true;
                        data[10] = [];
                        consumptionDataArr[0] = data;
                    }
                    var options = {
                        data: consumptionDataArr,
                        colWidths: [80, 150, 200, 90, 80, 350, 20, 20, 100],
                        columns: [
                            { type: 'text', readOnly: true, title: i18n.t('static.report.month') },
                            { type: 'dropdown', readOnly: true, source: this.state.regionList, title: i18n.t('static.region.region') },
                            { type: 'dropdown', source: dataSourceList, title: i18n.t('static.inventory.dataSource') },
                            { type: 'numeric', title: i18n.t('static.consumption.consumptionqty'), mask: '#,##' },
                            { type: 'numeric', title: i18n.t('static.consumption.daysofstockout'), mask: '#,##' },
                            { type: 'text', title: i18n.t('static.program.notes') },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.index') },
                            { type: 'hidden', title: i18n.t('static.report.consumptionDate') },
                            { type: 'dropdown', title: i18n.t('static.consumption.consumptionType'), source: [{ id: true, name: i18n.t('static.consumption.actual') }, { id: false, name: i18n.t('static.consumption.forcast') }] },
                            { type: 'checkbox', title: i18n.t('static.common.active') },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo') }
                        ],
                        pagination: false,
                        search: false,
                        columnSorting: true,
                        tableOverflow: true,
                        wordWrap: true,
                        allowInsertColumn: false,
                        allowManualInsertColumn: false,
                        allowDeleteRow: false,
                        allowManualInsertRow: false,
                        onchange: this.consumptionChanged,
                        allowExport: false,
                        text: {
                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                            show: '',
                            entries: '',
                        },
                        onload: this.loadedConsumption,
                        updateTable: function (el, cell, x, y, source, value, id) {
                            var elInstance = el.jexcel;
                            var rowData = elInstance.getRowData(y);
                            var batchInfo = rowData[10];
                            if (rowData[8].toString() == "true") {
                                if (batchInfo != "") {
                                    var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                                    cell.classList.add('readonly');
                                } else {
                                    var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                                    cell.classList.remove('readonly');
                                }
                            }
                        }.bind(this),
                        contextMenu: function (obj, x, y, e) {
                            var items = [];
                            //Add consumption batch info
                            var rowData = obj.getRowData(y)
                            if (rowData[8].toString() == "true") {
                                items.push({
                                    title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                    onclick: function () {
                                        document.getElementById("showConsumptionBatchInfoButtonsDiv").style.display = 'block';
                                        this.el = jexcel(document.getElementById("consumptionBatchInfoTable"), '');
                                        this.el.destroy();
                                        var json = [];
                                        // var elInstance=this.state.plannedPsmShipmentsEl;
                                        var rowData = obj.getRowData(y)
                                        var batchInfo = rowData[10];
                                        var consumptionQty = (rowData[3]).toString().replaceAll("\,", "");
                                        var consumptionBatchInfoQty = 0;
                                        for (var sb = 0; sb < batchInfo.length; sb++) {
                                            var data = [];
                                            data[0] = batchInfo[sb].batch.batchId;
                                            data[1] = batchInfo[sb].batch.expiryDate;
                                            data[2] = batchInfo[sb].consumptionQty;
                                            data[3] = batchInfo[sb].consumptionTransBatchInfoId;
                                            data[4] = y;
                                            consumptionBatchInfoQty += parseInt(batchInfo[sb].consumptionQty);
                                            json.push(data);
                                        }
                                        if (parseInt(consumptionQty) > consumptionBatchInfoQty && batchInfo.length > 0) {
                                            var data = [];
                                            data[0] = -1;
                                            data[1] = "";
                                            data[2] = parseInt(consumptionQty) - parseInt(consumptionBatchInfoQty);
                                            data[3] = 0;
                                            data[4] = y;
                                            json.push(data);
                                        }
                                        if (batchInfo.length == 0) {
                                            var data = [];
                                            data[0] = "";
                                            data[1] = ""
                                            data[2] = "";
                                            data[3] = 0;
                                            data[4] = y;
                                            json.push(data)
                                        }
                                        var options = {
                                            data: json,
                                            columnDrag: true,
                                            colWidths: [100, 150, 100],
                                            columns: [
                                                {
                                                    title: i18n.t('static.supplyPlan.batchId'),
                                                    type: 'dropdown',
                                                    source: this.state.batchInfoList,
                                                    filter: this.filterBatchInfoForExistingData
                                                },
                                                {
                                                    title: i18n.t('static.supplyPlan.expiryDate'),
                                                    type: 'calendar',
                                                    options: {
                                                        format: 'MM-DD-YYYY',
                                                        validRange: [moment(Date.now()).format("YYYY-MM-DD"), null]
                                                    },
                                                    readOnly: true
                                                },
                                                {
                                                    title: i18n.t('static.report.consupmtionqty'),
                                                    type: 'numeric',
                                                    mask: '#,##'
                                                },
                                                {
                                                    title: i18n.t('static.supplyPlan.consumptionTransBatchInfoId'),
                                                    type: 'hidden',
                                                },
                                                {
                                                    title: i18n.t('static.supplyPlan.rowNumber'),
                                                    type: 'hidden',
                                                }
                                            ],
                                            pagination: false,
                                            search: false,
                                            columnSorting: true,
                                            tableOverflow: true,
                                            wordWrap: true,
                                            allowInsertColumn: false,
                                            allowManualInsertColumn: false,
                                            allowDeleteRow: false,
                                            oneditionend: this.onedit,
                                            copyCompatibility: true,
                                            allowInsertRow: true,
                                            allowManualInsertRow: false,
                                            onchange: this.batchInfoChangedConsumption,
                                            text: {
                                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                show: '',
                                                entries: '',
                                            },
                                            onload: this.loadedBatchInfoConsumption,
                                            contextMenu: function (obj, x, y, e) {
                                                var items = [];
                                                if (y == null) {
                                                    // Insert a new column
                                                    if (obj.options.allowInsertColumn == true) {
                                                        items.push({
                                                            title: obj.options.text.insertANewColumnBefore,
                                                            onclick: function () {
                                                                obj.insertColumn(1, parseInt(x), 1);
                                                            }
                                                        });
                                                    }

                                                    if (obj.options.allowInsertColumn == true) {
                                                        items.push({
                                                            title: obj.options.text.insertANewColumnAfter,
                                                            onclick: function () {
                                                                obj.insertColumn(1, parseInt(x), 0);
                                                            }
                                                        });
                                                    }

                                                    // Delete a column
                                                    if (obj.options.allowDeleteColumn == true) {
                                                        items.push({
                                                            title: obj.options.text.deleteSelectedColumns,
                                                            onclick: function () {
                                                                obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
                                                            }
                                                        });
                                                    }

                                                    // Rename column
                                                    if (obj.options.allowRenameColumn == true) {
                                                        items.push({
                                                            title: obj.options.text.renameThisColumn,
                                                            onclick: function () {
                                                                obj.setHeader(x);
                                                            }
                                                        });
                                                    }

                                                    // Sorting
                                                    if (obj.options.columnSorting == true) {
                                                        // Line
                                                        items.push({ type: 'line' });

                                                        items.push({
                                                            title: obj.options.text.orderAscending,
                                                            onclick: function () {
                                                                obj.orderBy(x, 0);
                                                            }
                                                        });
                                                        items.push({
                                                            title: obj.options.text.orderDescending,
                                                            onclick: function () {
                                                                obj.orderBy(x, 1);
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    // Insert new row
                                                    if (obj.options.allowInsertRow == true) {
                                                        items.push({
                                                            title: i18n.t('static.supplyPlan.addNewBatchInfo'),
                                                            onclick: function () {
                                                                var data = [];
                                                                data[0] = "";
                                                                data[1] = "";
                                                                data[2] = "";
                                                                data[3] = 0;
                                                                data[4] = y;
                                                                obj.insertRow(data);
                                                            }
                                                        });
                                                    }

                                                    if (obj.options.allowDeleteRow == true) {
                                                        items.push({
                                                            title: obj.options.text.deleteSelectedRows,
                                                            onclick: function () {
                                                                obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
                                                            }
                                                        });
                                                    }

                                                    if (x) {
                                                        if (obj.options.allowComments == true) {
                                                            items.push({ type: 'line' });

                                                            var title = obj.records[y][x].getAttribute('title') || '';

                                                            items.push({
                                                                title: title ? obj.options.text.editComments : obj.options.text.addComments,
                                                                onclick: function () {
                                                                    obj.setComments([x, y], prompt(obj.options.text.comments, title));
                                                                }
                                                            });

                                                            if (title) {
                                                                items.push({
                                                                    title: obj.options.text.clearComments,
                                                                    onclick: function () {
                                                                        obj.setComments([x, y], '');
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    }
                                                }

                                                // Line
                                                items.push({ type: 'line' });

                                                // Save
                                                if (obj.options.allowExport) {
                                                    items.push({
                                                        title: i18n.t('static.supplyPlan.exportAsCsv'),
                                                        shortcut: 'Ctrl + S',
                                                        onclick: function () {
                                                            obj.download(true);
                                                        }
                                                    });
                                                }

                                                return items;
                                            }.bind(this)

                                        };
                                        var elVar = jexcel(document.getElementById("consumptionBatchInfoTable"), options);
                                        this.el = elVar;
                                        this.setState({ consumptionBatchInfoTableEl: elVar });
                                    }.bind(this)
                                    // this.setState({ shipmentBudgetTableEl: elVar });
                                });
                            }
                            // -------------------------------------

                            if (y == null) {
                                // Insert a new column
                                if (obj.options.allowInsertColumn == true) {
                                    items.push({
                                        title: obj.options.text.insertANewColumnBefore,
                                        onclick: function () {
                                            obj.insertColumn(1, parseInt(x), 1);
                                        }
                                    });
                                }

                                if (obj.options.allowInsertColumn == true) {
                                    items.push({
                                        title: obj.options.text.insertANewColumnAfter,
                                        onclick: function () {
                                            obj.insertColumn(1, parseInt(x), 0);
                                        }
                                    });
                                }

                                // Delete a column
                                if (obj.options.allowDeleteColumn == true) {
                                    items.push({
                                        title: obj.options.text.deleteSelectedColumns,
                                        onclick: function () {
                                            obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
                                        }
                                    });
                                }

                                // Rename column
                                if (obj.options.allowRenameColumn == true) {
                                    items.push({
                                        title: obj.options.text.renameThisColumn,
                                        onclick: function () {
                                            obj.setHeader(x);
                                        }
                                    });
                                }

                                // Sorting
                                if (obj.options.columnSorting == true) {
                                    // Line
                                    items.push({ type: 'line' });

                                    items.push({
                                        title: obj.options.text.orderAscending,
                                        onclick: function () {
                                            obj.orderBy(x, 0);
                                        }
                                    });
                                    items.push({
                                        title: obj.options.text.orderDescending,
                                        onclick: function () {
                                            obj.orderBy(x, 1);
                                        }
                                    });
                                }
                            } else {
                                // Insert new row
                                if (obj.options.allowInsertRow == true) {
                                    var json = obj.getJson();
                                    if (json.length < 2) {
                                        items.push({
                                            title: i18n.t('static.supplyPlan.addNewConsumption'),
                                            onclick: function () {
                                                var json = obj.getJson();
                                                var map = new Map(Object.entries(json[0]));
                                                var data = [];
                                                data[0] = map.get("0");
                                                data[1] = map.get("1");
                                                data[2] = "";
                                                data[3] = "";
                                                data[4] = "";
                                                data[5] = "";
                                                data[6] = -1;
                                                data[7] = startDate;
                                                data[8] = "";
                                                data[9] = true;
                                                data[10] = [];
                                                consumptionDataArr[0] = data;
                                                obj.insertRow(data);
                                            }.bind(this)
                                        });
                                    }
                                }

                                if (obj.options.allowDeleteRow == true) {
                                    items.push({
                                        title: obj.options.text.deleteSelectedRows,
                                        onclick: function () {
                                            obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
                                        }
                                    });
                                }

                                if (x) {
                                    if (obj.options.allowComments == true) {
                                        items.push({ type: 'line' });

                                        var title = obj.records[y][x].getAttribute('title') || '';

                                        items.push({
                                            title: title ? obj.options.text.editComments : obj.options.text.addComments,
                                            onclick: function () {
                                                obj.setComments([x, y], prompt(obj.options.text.comments, title));
                                            }
                                        });

                                        if (title) {
                                            items.push({
                                                title: obj.options.text.clearComments,
                                                onclick: function () {
                                                    obj.setComments([x, y], '');
                                                }
                                            });
                                        }
                                    }
                                }
                            }

                            // Line
                            items.push({ type: 'line' });

                            // Save
                            if (obj.options.allowExport) {
                                items.push({
                                    title: i18n.t('static.supplyPlan.exportAsCsv'),
                                    shortcut: 'Ctrl + S',
                                    onclick: function () {
                                        obj.download(true);
                                    }
                                });
                            }

                            return items;
                        }.bind(this)
                    };
                    myVar = jexcel(document.getElementById("consumptionDetailsTable"), options);
                    this.el = myVar;
                    this.setState({
                        consumptionEl: myVar
                    })
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                consumptionError: i18n.t('static.supplyPlan.saveDataFirst')
            })
        }
    }

    loadedConsumption = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    loadedBatchInfoConsumption = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    batchInfoChangedConsumption = function (instance, cell, x, y, value) {
        this.setState({
            consumptionBatchError: ''
        })
        var elInstance = instance.jexcel;
        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.setState({
                    consumptionBatchInfoDuplicateError: ''
                })
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                if (value != -1) {
                    var expiryDate = this.state.batchInfoListAllForConsumption.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText)[0].expiryDate;
                    elInstance.setValueFromCoords(1, y, expiryDate, true);
                }
            }
        }
        if (x == 2) {
            var reg = /^[0-9\b]+$/;
            var col = ("C").concat(parseInt(y) + 1);
            value = value.toString().replaceAll("\,", "");
            if (value == "" || value == 0) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.setState({
                        consumptionBatchInfoNoStockError: ''
                    })
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }
        }
        this.setState({
            consumptionBatchInfoChangedFlag: 1
        })
    }.bind(this)

    checkValidationConsumptionBatchInfo() {
        var valid = true;
        var elInstance = this.state.consumptionBatchInfoTableEl;
        var json = elInstance.getJson();
        var mapArray = [];
        for (var y = 0; y < json.length; y++) {


            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);

            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("0") == map.get("0")
            )
            if (checkDuplicateInMap.length > 1) {
                var colArr = ['A'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.supplyPlan.duplicateBatchNumber'));
                }
                valid = false;
                this.setState({
                    consumptionBatchInfoDuplicateError: i18n.t('static.supplyPlan.duplicateBatchNumber')
                })
            }
            else {
                var programJson = this.state.programJsonAfterConsumptionClicked;
                var shipmentList = programJson.shipmentList;
                var shipmentBatchArray = [];
                for (var ship = 0; ship < shipmentList.length; ship++) {
                    var batchInfoList = shipmentList[ship].batchInfoList;
                    for (var bi = 0; bi < batchInfoList.length; bi++) {
                        shipmentBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].shipmentQty })
                    }
                }
                if (map.get("0") != -1) {
                    var stockForBatchNumber = shipmentBatchArray.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText)[0];
                    var totalStockForBatchNumber = stockForBatchNumber.qty;
                    var consumptionList = programJson.consumptionList;
                    var consumptionBatchArray = [];

                    for (var con = 0; con < consumptionList.length; con++) {
                        var consumptionIndex = (this.state.consumptionEl).getRowData(parseInt(map.get("4")))[6];
                        if (con != consumptionIndex) {
                            var batchInfoList = consumptionList[con].batchInfoList;
                            for (var bi = 0; bi < batchInfoList.length; bi++) {
                                consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
                            }
                        }
                    }
                    var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText);
                    if (consumptionForBatchNumber == undefined) {
                        consumptionForBatchNumber = [];
                    }
                    var consumptionQty = 0;
                    for (var b = 0; b < consumptionForBatchNumber.length; b++) {
                        consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
                    }
                    consumptionQty += parseInt(map.get("2").toString().replaceAll("\,", ""));
                    var inventoryList = programJson.inventoryList;
                    var inventoryBatchArray = [];
                    for (var inv = 0; inv < inventoryList.length; inv++) {
                        var batchInfoList = inventoryList[inv].batchInfoList;
                        for (var bi = 0; bi < batchInfoList.length; bi++) {
                            inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier })
                        }
                    }
                    var inventoryForBatchNumber = [];
                    if (inventoryBatchArray.length > 0) {
                        inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText);
                    }
                    if (inventoryForBatchNumber == undefined) {
                        inventoryForBatchNumber = [];
                    }
                    var adjustmentQty = 0;
                    for (var b = 0; b < inventoryForBatchNumber.length; b++) {
                        adjustmentQty += parseFloat(inventoryForBatchNumber[b].qty);
                    }

                    var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
                    if (remainingBatchQty < 0) {
                        var col = ("C").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.supplyPlan.noStockAvailable'));

                        valid = false;
                        this.setState({
                            consumptionBatchInfoNoStockError: i18n.t('static.supplyPlan.noStockAvailable')
                        })
                    }
                } else {
                    var colArr = ['A'];
                    for (var c = 0; c < colArr.length; c++) {
                        var col = (colArr[c]).concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                    var col = ("A").concat(parseInt(y) + 1);
                    var value = elInstance.getValueFromCoords(0, y);
                    if (value == "") {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }

                    var col = ("C").concat(parseInt(y) + 1);
                    var value = elInstance.getValueFromCoords(2, y);
                    value = value.toString().replaceAll("\,", "");
                    var reg = /^[0-9\b]+$/;
                    if (value === "" || isNaN(Number.parseInt(value)) || !(reg.test(value)) || value == 0) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        valid = false;
                        if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                            elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                        } else {
                            elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        }
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                }
            }
        }
        return valid;
    }

    saveConsumptionBatchInfo() {
        var validation = this.checkValidationConsumptionBatchInfo();
        if (validation == true) {
            var elInstance = this.state.consumptionBatchInfoTableEl;
            var json = elInstance.getJson();
            var batchInfoArray = [];
            var rowNumber = 0;
            var totalConsumption = 0;
            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                if (i == 0) {
                    rowNumber = map.get("4");
                }
                var batchInfoJson;
                if (map.get("0") != -1) {
                    var batchNo = elInstance.getCell(`A${parseInt(i) + 1}`).innerText;
                    var filteredBatch = this.state.batchInfoListAllForConsumption.filter(c => c.batchNo == batchNo);
                    var expiryDate = filteredBatch[0].expiryDate;
                    batchInfoJson = {
                        consumptionTransBatchInfoId: map.get("3"),
                        batch: {
                            batchId: map.get("0"),
                            batchNo: elInstance.getCell(`A${parseInt(i) + 1}`).innerText,
                            expiryDate: expiryDate
                        },
                        consumptionQty: map.get("2").toString().replaceAll("\,", "")
                    }
                    batchInfoArray.push(batchInfoJson);
                }
                totalConsumption += parseInt(map.get("2").toString().replaceAll("\,", ""));
            }
            var consumptionInstance = this.state.consumptionEl;
            consumptionInstance.setValueFromCoords(3, parseInt(rowNumber), totalConsumption, true);
            consumptionInstance.setValueFromCoords(10, parseInt(rowNumber), batchInfoArray, true);
            // rowData[10] = batchInfoArray;
            // consumptionInstance.setRowData(rowNumber, rowData);
            this.setState({
                consumptionChangedFlag: 1,
                consumptionBatchInfoChangedFlag: 0,
                consumptionBatchInfoTableEl: ''
            })
            document.getElementById("showConsumptionBatchInfoButtonsDiv").style.display = 'none';
            elInstance.destroy();
        } else {
            this.setState({
                consumptionBatchError: i18n.t('static.supplyPlan.validationFailed')
            })
        }
    }

    // Consumption changed
    consumptionChanged = function (instance, cell, x, y, value) {
        this.setState({
            consumptionError: "",
            consumptionDuplicateError: ""
        })
        var elInstance = this.state.consumptionEl;
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }
        if (x == 8) {
            var col = ("I").concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
        }
        if (x == 3) {
            var reg = /^[0-9\b]+$/;
            var col = ("D").concat(parseInt(y) + 1);
            value = value.toString().replaceAll("\,", "");
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.setState({
                        consumptionNoStockError: ''
                    })
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }
        }
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            var reg = /^[0-9\b]+$/;
            value = value.toString().replaceAll("\,", "");
            if (value != "") {
                if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }
        this.setState({
            consumptionChangedFlag: 1
        })
    }

    // consumption final validations
    checkValidationConsumption() {
        var valid = true;
        var elInstance = this.state.consumptionEl;
        var json = elInstance.getJson();
        var mapArray = [];
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);

            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("8").toString() == map.get("8").toString()
            )
            if (checkDuplicateInMap.length > 1) {
                var colArr = ['I'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.supplyPlan.duplicateConsumption'));
                }
                valid = false;
                this.setState({
                    consumptionDuplicateError: i18n.t('static.supplyPlan.duplicateConsumption')
                })
            } else {
                var colArr = ['I'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                var col = ("C").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(2, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("D").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(3, y);
                value = value.toString().replaceAll("\,", "");
                var reg = /^[0-9\b]+$/;
                if (value === "" || isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var reg = /^[0-9\b]+$/;
                var col = ("E").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(4, y);
                value = value.toString().replaceAll("\,", "");
                if (value != "") {
                    if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        valid = false;
                        if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                            elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                        } else {
                            elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        }
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }
        return valid;
    }

    // Save consumption
    saveConsumption() {
        this.setState({
            consumptionError: '',
            consumptionDuplicateError: ''
        })
        var validation = this.checkValidationConsumption();
        if (validation == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            var elInstance = this.state.consumptionEl;
            var json = elInstance.getJson();
            var planningUnitId = document.getElementById("planningUnitId").value;
            var productCategoryId = (this.state.planningUnitListForConsumption).filter(c => c.planningUnitId == planningUnitId);
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');

                var programId = (document.getElementById("programId").value);

                var programRequest = programTransaction.get(programId);
                programRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var consumptionDataList = (programJson.consumptionList);
                    for (var i = 0; i < json.length; i++) {
                        var map = new Map(Object.entries(json[i]));
                        var actualFlag = false;
                        if (map.get("8").toString() == "true") {
                            actualFlag = true;
                        }
                        if (map.get("6") != -1) {
                            consumptionDataList[parseInt(map.get("6"))].dataSource.id = map.get("2");
                            consumptionDataList[parseInt(map.get("6"))].consumptionQty = (map.get("3")).toString().replaceAll("\,", "");
                            consumptionDataList[parseInt(map.get("6"))].dayOfStockOut = (map.get("4")).toString().replaceAll("\,", "");
                            consumptionDataList[parseInt(map.get("6"))].notes = map.get("5");
                            consumptionDataList[parseInt(map.get("6"))].actualFlag = actualFlag;
                            consumptionDataList[parseInt(map.get("6"))].active = map.get("9");
                            consumptionDataList[parseInt(map.get("6"))].batchInfoList = map.get("10")
                        } else {
                            var consumptionJson = {
                                consumptionId: 0,
                                consumptionDate: moment(map.get("7")).format("YYYY-MM-DD"),
                                region: {
                                    id: map.get("1")
                                },
                                consumptionQty: (map.get("3")).toString().replaceAll("\,", ""),
                                dayOfStockOut: (map.get("4")).toString().replaceAll("\,", ""),
                                dataSource: {
                                    id: map.get("2")
                                },
                                notes: map.get("5"),
                                actualFlag: actualFlag,
                                active: map.get("9"),

                                // planningUnit: {
                                //     id: plannigUnitId
                                // }
                                planningUnit: {
                                    id: planningUnitId,
                                    forecastingUnit: {
                                        productCategory: {
                                            id: productCategoryId[0].forecastingUnit.productCategory.id
                                        }
                                    }
                                },
                                batchInfoList: map.get("10")
                            }
                            consumptionDataList.push(consumptionJson);
                        }
                    }
                    programJson.consumptionList = consumptionDataList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.toggleLarge('Consumption');
                        this.setState({
                            message: i18n.t('static.message.consumptionSaved'),
                            consumptionChangedFlag: 0
                        })
                        this.formSubmit(this.state.monthCount);
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                consumptionError: i18n.t('static.supplyPlan.validationFailed')
            })
        }
    }


    // Consumption Functionality

    // Adjustments Functionality
    // Show adjustments details
    adjustmentsDetailsClicked(region, month, endDate) {
        if (this.state.inventoryChangedFlag == 0) {
            var elInstance = this.state.inventoryBatchInfoTableEl;
            if (elInstance != undefined && elInstance != "") {
                elInstance.destroy();
            }
            var planningUnitId = document.getElementById("planningUnitId").value;
            var programId = document.getElementById("programId").value;
            var db1;
            var dataSourceListAll = this.state.dataSourceListAll.filter(c => c.dataSourceType.id == INVENTORY_DATA_SOURCE_TYPE);
            var dataSourceList = [];
            for (var k = 0; k < dataSourceListAll.length; k++) {
                var dataSourceJson = {
                    name: getLabelText(dataSourceListAll[k].label, this.state.lang),
                    id: dataSourceListAll[k].dataSourceId
                }
                dataSourceList.push(dataSourceJson);
            }
            var countrySKUList = [];
            var countrySKUListAll = [];
            var myVar = '';
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');
                var programRequest = programTransaction.get(programId);
                programRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    this.setState({
                        programJsonAfterAdjustmentClicked: programJson
                    })
                    var batchList = []
                    var batchInfoList = programJson.batchInfoList;
                    batchList.push({
                        name: i18n.t('static.supplyPlan.fefo'),
                        id: -1
                    })
                    for (var k = 0; k < batchInfoList.length; k++) {
                        if (batchInfoList[k].expiryDate >= moment(endDate).startOf("month").format("YYYY-MM-DD") && batchInfoList[k].createdDate <= moment(endDate).startOf("month").format("YYYY-MM-DD") && batchInfoList[k].planningUnitId == document.getElementById("planningUnitId").value) {
                            var batchJson = {
                                name: batchInfoList[k].batchNo,
                                id: batchInfoList[k].batchId
                            }
                            batchList.push(batchJson);
                        }
                    }
                    this.setState({
                        batchInfoList: batchList,
                        batchInfoListAllForInventory: batchInfoList
                    })

                    var countrySKUTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                    var countrySKUOs = countrySKUTransaction.objectStore('realmCountryPlanningUnit');
                    var countrySKURequest = countrySKUOs.getAll();
                    countrySKURequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    countrySKURequest.onsuccess = function (event) {
                        var countrySKUResult = [];
                        countrySKUResult = countrySKURequest.result;
                        for (var k = 0; k < countrySKUResult.length; k++) {
                            if (countrySKUResult[k].realmCountry.id == programJson.realmCountry.realmCountryId && countrySKUResult[k].active == true) {
                                var countrySKUJson = {
                                    name: getLabelText(countrySKUResult[k].label, this.state.lang),
                                    id: countrySKUResult[k].realmCountryPlanningUnitId
                                }

                                countrySKUList.push(countrySKUJson);
                                countrySKUListAll.push(countrySKUResult[k]);
                            }
                        }
                        this.setState({
                            countrySKUListAll: countrySKUListAll
                        })
                        var inventoryListUnFiltered = (programJson.inventoryList)
                        this.setState({
                            inventoryListUnFiltered: inventoryListUnFiltered
                        })
                        var inventoryList = (programJson.inventoryList).filter(c =>
                            c.planningUnit.id == planningUnitId &&
                            c.region != null &&
                            c.region.id == region &&
                            moment(c.inventoryDate).format("MMM YY") == month);
                        this.el = jexcel(document.getElementById("adjustmentsTable"), '');
                        this.el.destroy();
                        var data = [];
                        var inventoryDataArr = [];
                        var readonlyCountrySKU = true;
                        for (var j = 0; j < inventoryList.length; j++) {
                            // var expectedBalPlanningUnitQty = "";
                            // if (j == 0) {
                            //     var openingBalance = (this.state.openingBalanceRegionWise.filter(c => c.month.month == month && c.region.id == region)[0]).balance;
                            //     var consumptionQty = (this.state.consumptionFilteredArray.filter(c => c.month.month == month && c.region.id == region)[0]).consumptionQty;
                            //     expectedBalPlanningUnitQty = (openingBalance - consumptionQty);

                            // } else {
                            //     expectedBalPlanningUnitQty = `=(G${j}+I${j})`
                            // }
                            var expectedBal = "";
                            if (inventoryList[j].adjustmentQty != "" && inventoryList[j].actualQty != "" && inventoryList[j].adjustmentQty != null && inventoryList[j].actualQty != null) {
                                expectedBal = parseInt(inventoryList[j].actualQty) - parseInt(inventoryList[j].adjustmentQty);
                            }
                            var readonlyCountrySKU = true;
                            var adjustmentType = "1";
                            if (inventoryList[j].actualQty == "" || inventoryList[j].actualQty == 0) {
                                adjustmentType = "2"
                            }
                            var readonlyAdjustmentType = "";
                            if (inventoryList[j].batchInfoList.length != 0) {
                                readonlyAdjustmentType = true
                            } else {
                                readonlyAdjustmentType = false
                            }

                            data = [];
                            data[0] = month; //A
                            data[1] = inventoryList[j].region.id; //B
                            data[2] = inventoryList[j].dataSource.id; //C
                            data[3] = inventoryList[j].realmCountryPlanningUnit.id; //D
                            data[4] = inventoryList[j].multiplier; //E
                            // data[5] = adjustmentType;

                            data[5] = adjustmentType; //F
                            data[6] = ``; //G
                            data[7] = inventoryList[j].adjustmentQty; //H
                            data[8] = `=E${parseInt(j) + 1}*H${parseInt(j) + 1}`; //I
                            data[9] = inventoryList[j].actualQty; //J
                            data[10] = `=E${parseInt(j) + 1}*J${parseInt(j) + 1}`;

                            if (inventoryList[j].notes === null || ((inventoryList[j].notes).trim() == "NULL")) {
                                data[11] = "";
                            } else {
                                data[11] = inventoryList[j].notes;
                            }
                            data[12] = inventoryListUnFiltered.findIndex(c => c.planningUnit.id == planningUnitId && c.region.id == region && moment(c.inventoryDate).format("MMM YY") == month && c.inventoryDate == inventoryList[j].inventoryDate && c.realmCountryPlanningUnit.id == inventoryList[j].realmCountryPlanningUnit.id);
                            data[13] = inventoryList[j].active;
                            data[14] = endDate;
                            data[15] = inventoryList[j].batchInfoList;
                            inventoryDataArr[j] = data;
                        }
                        if (inventoryList.length == 0) {
                            var readonlyCountrySKU = false;
                            // var openingBalance = (this.state.openingBalanceRegionWise.filter(c => c.month.month == month && c.region.id == region)[0]).balance;
                            // var consumptionQty = (this.state.consumptionFilteredArray.filter(c => c.month.month == month && c.region.id == region)[0]).consumptionQty;
                            // var expectedBalPlanningUnitQty = (openingBalance - consumptionQty);
                            data = [];
                            data[0] = month;
                            data[1] = region;
                            data[2] = "";
                            data[3] = "";
                            data[4] = "";
                            data[5] = "";
                            data[6] = ``;
                            data[7] = "";
                            data[8] = `=E1*H1`;
                            data[9] = "";
                            data[10] = `=E1*J1`;
                            data[11] = "";
                            data[12] = -1;
                            data[13] = true;
                            data[14] = endDate;
                            data[15] = [];
                            inventoryDataArr[0] = data;
                        }
                        var options = {
                            data: inventoryDataArr,
                            columnDrag: true,
                            colWidths: [80, 100, 100, 150, 10, 100, 10, 80, 10, 80, 10, 200, 10, 50, 10, 10],
                            columns: [
                                { title: i18n.t('static.report.month'), type: 'text', readOnly: true },
                                { title: i18n.t('static.region.region'), type: 'dropdown', readOnly: true, source: this.state.regionList },
                                { title: i18n.t('static.inventory.dataSource'), type: 'dropdown', source: dataSourceList },
                                { title: i18n.t('static.planningunit.countrysku'), type: 'dropdown', source: countrySKUList, readOnly: readonlyCountrySKU },
                                { title: i18n.t('static.supplyPlan.conversionUnits'), type: 'hidden', readOnly: true },
                                { title: i18n.t('static.supplyPlan.inventoryType'), type: 'dropdown', source: [{ id: 1, name: i18n.t('static.consumption.actual') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }], readOnly: readonlyAdjustmentType },
                                { title: i18n.t('static.supplyPlan.planningUnitQty'), type: 'hidden', readOnly: true },
                                { title: i18n.t('static.inventory.manualAdjustment'), type: 'numeric', mask: '[-]#,##' },
                                { title: i18n.t('static.supplyPlan.planningUnitQty'), type: 'hidden', readOnly: true },
                                { title: i18n.t('static.inventory.actualStock'), type: 'numeric', mask: '#,##' },
                                { title: i18n.t('static.supplyPlan.planningUnitQty'), type: 'hidden', readOnly: true },
                                { title: i18n.t('static.program.notes'), type: 'text' },
                                { title: i18n.t('static.supplyPlan.index'), type: 'hidden', readOnly: true },
                                { title: i18n.t('static.inventory.active'), type: 'checkbox' },
                                { title: i18n.t('static.inventory.inventoryDate'), type: 'hidden' },
                                { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo') }
                            ],
                            pagination: false,
                            search: false,
                            columnSorting: true,
                            tableOverflow: true,
                            wordWrap: true,
                            allowInsertColumn: false,
                            allowManualInsertColumn: false,
                            allowDeleteRow: false,
                            // allowInsertRow: false,
                            allowManualInsertRow: false,
                            onchange: this.inventoryChanged,
                            oneditionend: this.inventoryOnedit,
                            text: {
                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                show: '',
                                entries: '',
                            },
                            onload: this.loadedInventory,
                            updateTable: function (el, cell, x, y, source, value, id) {
                                var elInstance = el.jexcel;
                                var rowData = elInstance.getRowData(y);
                                var batchInfo = rowData[15];
                                if (batchInfo != "") {
                                    // 7 and 9
                                    var cell = elInstance.getCell(`H${parseInt(y) + 1}`)
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(`J${parseInt(y) + 1}`)
                                    cell.classList.add('readonly');
                                } else {
                                    var cell = elInstance.getCell(`H${parseInt(y) + 1}`)
                                    cell.classList.remove('readonly');
                                    var cell = elInstance.getCell(`J${parseInt(y) + 1}`)
                                    cell.classList.remove('readonly');
                                }
                                var adjustmentType = rowData[5];
                                if (adjustmentType == 1) {
                                    var cell = elInstance.getCell(`H${parseInt(y) + 1}`)
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(`J${parseInt(y) + 1}`)
                                    cell.classList.remove('readonly');
                                } else {
                                    var cell = elInstance.getCell(`J${parseInt(y) + 1}`)
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(`H${parseInt(y) + 1}`)
                                    cell.classList.remove('readonly');
                                }
                            }.bind(this),
                            contextMenu: function (obj, x, y, e) {
                                var items = [];
                                //Add consumption batch info
                                var rowData = obj.getRowData(y)
                                if (rowData[5] == 1 || rowData[5] == 2) {
                                    items.push({
                                        title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                        onclick: function () {
                                            document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'block';
                                            this.el = jexcel(document.getElementById("inventoryBatchInfoTable"), '');
                                            this.el.destroy();
                                            var json = [];
                                            // var elInstance=this.state.plannedPsmShipmentsEl;
                                            var cell = obj.getCell(`F${parseInt(y) + 1}`)
                                            cell.classList.add('readonly');
                                            var rowData = obj.getRowData(y);
                                            var batchInfo = rowData[15];
                                            var adjustmentType = rowData[5];
                                            var columnTypeForActualStock = "";
                                            var columnTypeForAdjustedQty = "";
                                            if (adjustmentType == 1) {
                                                columnTypeForActualStock = "numeric";
                                                columnTypeForAdjustedQty = "hidden";
                                            } else {
                                                columnTypeForActualStock = "hidden";
                                                columnTypeForAdjustedQty = "numeric";
                                            }
                                            var inventoryQty = 0;
                                            if (adjustmentType == 1) {
                                                inventoryQty = (rowData[9]).toString().replaceAll("\,", "");
                                            } else {
                                                inventoryQty = (rowData[7]).toString().replaceAll("\,", "");
                                            }
                                            var inventoryBatchInfoQty = 0;
                                            for (var sb = 0; sb < batchInfo.length; sb++) {
                                                var data = [];
                                                data[0] = batchInfo[sb].batch.batchId; //A
                                                data[1] = batchInfo[sb].batch.expiryDate;
                                                data[2] = adjustmentType; //B
                                                data[3] = batchInfo[sb].adjustmentQty; //C
                                                data[4] = batchInfo[sb].actualQty; //D
                                                data[5] = batchInfo[sb].inventoryTransBatchInfoId; //E
                                                data[6] = y; //F
                                                if (adjustmentType == 1) {
                                                    inventoryBatchInfoQty += parseInt(batchInfo[sb].actualQty);
                                                } else {
                                                    inventoryBatchInfoQty += parseInt(batchInfo[sb].adjustmentQty);
                                                }
                                                json.push(data);
                                            }
                                            if (parseInt(inventoryQty) != inventoryBatchInfoQty && batchInfo.length > 0) {
                                                var qty = parseInt(inventoryQty) - parseInt(inventoryBatchInfoQty);
                                                var data = [];
                                                data[0] = -1; //A
                                                data[1] = "";
                                                data[2] = adjustmentType; //B
                                                if (adjustmentType == 1) {
                                                    data[3] = ""; //C
                                                    data[4] = qty; //D
                                                } else {
                                                    data[3] = qty; //C
                                                    data[4] = ""; //D
                                                }
                                                data[5] = 0; //E
                                                data[6] = y; //F
                                                json.push(data);
                                            }
                                            if (batchInfo.length == 0) {
                                                var data = [];
                                                data[0] = "";
                                                data[1] = ""
                                                data[2] = adjustmentType;
                                                data[3] = "";
                                                data[4] = "";
                                                data[5] = 0;
                                                data[6] = y;
                                                json.push(data)
                                            }
                                            var options = {
                                                data: json,
                                                columnDrag: true,
                                                colWidths: [100, 150, 290, 100, 100],
                                                columns: [
                                                    {
                                                        title: i18n.t('static.supplyPlan.batchId'),
                                                        type: 'dropdown',
                                                        source: this.state.batchInfoList,
                                                        filter: this.filterBatchInfoForExistingDataForInventory
                                                    },
                                                    {
                                                        title: i18n.t('static.supplyPlan.expiryDate'),
                                                        type: 'calendar',
                                                        options: {
                                                            format: 'MM-DD-YYYY',
                                                            validRange: [moment(Date.now()).format("YYYY-MM-DD"), null]
                                                        },
                                                        readOnly: true
                                                    },
                                                    {
                                                        title: i18n.t('static.supplyPlan.adjustmentType'),
                                                        type: 'hidden',
                                                        source: [{ id: 1, name: i18n.t('static.consumption.actual') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }],
                                                        readOnly: true
                                                    },
                                                    {
                                                        title: i18n.t('static.inventory.manualAdjustment'),
                                                        type: columnTypeForAdjustedQty,
                                                        mask: '[-]#,##'
                                                    },
                                                    {
                                                        title: i18n.t('static.inventory.actualStock'),
                                                        type: columnTypeForActualStock,
                                                        mask: '#,##'
                                                    },
                                                    {
                                                        title: i18n.t('static.supplyPlan.inventoryTransBatchInfoId'),
                                                        type: 'hidden',
                                                    },
                                                    {
                                                        title: i18n.t('static.supplyPlan.rowNumber'),
                                                        type: 'hidden',
                                                    }
                                                ],
                                                pagination: false,
                                                search: false,
                                                columnSorting: true,
                                                tableOverflow: true,
                                                wordWrap: true,
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: false,
                                                oneditionend: this.onedit,
                                                copyCompatibility: true,
                                                allowInsertRow: true,
                                                allowManualInsertRow: false,
                                                onchange: this.batchInfoChangedInventory,
                                                text: {
                                                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                    show: '',
                                                    entries: '',
                                                },
                                                onload: this.loadedBatchInfoInventory,
                                                updateTable: function (el, cell, x, y, source, value, id) {
                                                    var elInstance = el.jexcel;
                                                    var rowData = elInstance.getRowData(y);
                                                    var adjustmentType = rowData[2];
                                                    if (adjustmentType == 1) {
                                                        var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                                                        cell.classList.add('readonly');
                                                        var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                                                        cell.classList.remove('readonly');
                                                    } else {
                                                        var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                                                        cell.classList.remove('readonly');
                                                        var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                                                        cell.classList.add('readonly');
                                                    }
                                                }.bind(this),
                                                contextMenu: function (obj, x, y, e) {
                                                    var items = [];
                                                    if (y == null) {
                                                        // Insert a new column
                                                        if (obj.options.allowInsertColumn == true) {
                                                            items.push({
                                                                title: obj.options.text.insertANewColumnBefore,
                                                                onclick: function () {
                                                                    obj.insertColumn(1, parseInt(x), 1);
                                                                }
                                                            });
                                                        }

                                                        if (obj.options.allowInsertColumn == true) {
                                                            items.push({
                                                                title: obj.options.text.insertANewColumnAfter,
                                                                onclick: function () {
                                                                    obj.insertColumn(1, parseInt(x), 0);
                                                                }
                                                            });
                                                        }

                                                        // Delete a column
                                                        if (obj.options.allowDeleteColumn == true) {
                                                            items.push({
                                                                title: obj.options.text.deleteSelectedColumns,
                                                                onclick: function () {
                                                                    obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
                                                                }
                                                            });
                                                        }

                                                        // Rename column
                                                        if (obj.options.allowRenameColumn == true) {
                                                            items.push({
                                                                title: obj.options.text.renameThisColumn,
                                                                onclick: function () {
                                                                    obj.setHeader(x);
                                                                }
                                                            });
                                                        }

                                                        // Sorting
                                                        if (obj.options.columnSorting == true) {
                                                            // Line
                                                            items.push({ type: 'line' });

                                                            items.push({
                                                                title: obj.options.text.orderAscending,
                                                                onclick: function () {
                                                                    obj.orderBy(x, 0);
                                                                }
                                                            });
                                                            items.push({
                                                                title: obj.options.text.orderDescending,
                                                                onclick: function () {
                                                                    obj.orderBy(x, 1);
                                                                }
                                                            });
                                                        }
                                                    } else {
                                                        // Insert new row
                                                        if (obj.options.allowInsertRow == true) {
                                                            var rowData = obj.getRowData(y);
                                                            var adjustmentType = rowData[1];
                                                            items.push({
                                                                title: i18n.t('static.supplyPlan.addNewBatchInfo'),
                                                                onclick: function () {
                                                                    var data = [];
                                                                    data[0] = "";
                                                                    data[1] = "";
                                                                    data[2] = adjustmentType;
                                                                    data[3] = "";
                                                                    data[4] = "";
                                                                    data[5] = 0;
                                                                    data[6] = y;
                                                                    obj.insertRow(data);
                                                                }
                                                            });
                                                        }

                                                        if (obj.options.allowDeleteRow == true) {
                                                            items.push({
                                                                title: obj.options.text.deleteSelectedRows,
                                                                onclick: function () {
                                                                    obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
                                                                }
                                                            });
                                                        }

                                                        if (x) {
                                                            if (obj.options.allowComments == true) {
                                                                items.push({ type: 'line' });

                                                                var title = obj.records[y][x].getAttribute('title') || '';

                                                                items.push({
                                                                    title: title ? obj.options.text.editComments : obj.options.text.addComments,
                                                                    onclick: function () {
                                                                        obj.setComments([x, y], prompt(obj.options.text.comments, title));
                                                                    }
                                                                });

                                                                if (title) {
                                                                    items.push({
                                                                        title: obj.options.text.clearComments,
                                                                        onclick: function () {
                                                                            obj.setComments([x, y], '');
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    }

                                                    // Line
                                                    items.push({ type: 'line' });

                                                    // Save
                                                    if (obj.options.allowExport) {
                                                        items.push({
                                                            title: i18n.t('static.supplyPlan.exportAsCsv'),
                                                            shortcut: 'Ctrl + S',
                                                            onclick: function () {
                                                                obj.download(true);
                                                            }
                                                        });
                                                    }

                                                    return items;
                                                }.bind(this)

                                            };
                                            var elVar = jexcel(document.getElementById("inventoryBatchInfoTable"), options);
                                            this.el = elVar;
                                            this.setState({ inventoryBatchInfoTableEl: elVar });
                                        }.bind(this)
                                        // this.setState({ shipmentBudgetTableEl: elVar });
                                    });
                                }
                                // -------------------------------------

                                if (y == null) {
                                    // Insert a new column
                                    if (obj.options.allowInsertColumn == true) {
                                        items.push({
                                            title: obj.options.text.insertANewColumnBefore,
                                            onclick: function () {
                                                obj.insertColumn(1, parseInt(x), 1);
                                            }
                                        });
                                    }

                                    if (obj.options.allowInsertColumn == true) {
                                        items.push({
                                            title: obj.options.text.insertANewColumnAfter,
                                            onclick: function () {
                                                obj.insertColumn(1, parseInt(x), 0);
                                            }
                                        });
                                    }

                                    // Delete a column
                                    if (obj.options.allowDeleteColumn == true) {
                                        items.push({
                                            title: obj.options.text.deleteSelectedColumns,
                                            onclick: function () {
                                                obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
                                            }
                                        });
                                    }

                                    // Rename column
                                    if (obj.options.allowRenameColumn == true) {
                                        items.push({
                                            title: obj.options.text.renameThisColumn,
                                            onclick: function () {
                                                obj.setHeader(x);
                                            }
                                        });
                                    }

                                    // Sorting
                                    if (obj.options.columnSorting == true) {
                                        // Line
                                        items.push({ type: 'line' });

                                        items.push({
                                            title: obj.options.text.orderAscending,
                                            onclick: function () {
                                                obj.orderBy(x, 0);
                                            }
                                        });
                                        items.push({
                                            title: obj.options.text.orderDescending,
                                            onclick: function () {
                                                obj.orderBy(x, 1);
                                            }
                                        });
                                    }
                                } else {
                                    // Insert new row
                                    if (obj.options.allowInsertRow == true) {
                                        var json = obj.getJson();
                                        items.push({
                                            title: i18n.t('static.supplyPlan.addNewAdjustments'),
                                            onclick: function () {
                                                var json = obj.getJson();
                                                var map = new Map(Object.entries(json[0]));
                                                var data = [];
                                                data[0] = map.get("0");
                                                data[1] = map.get("1");
                                                data[2] = "";
                                                data[3] = "";
                                                data[4] = "";
                                                data[5] = "";
                                                data[6] = ``;
                                                data[7] = "";
                                                data[8] = `=E${(parseInt(json.length)) + 1}*H${(parseInt(json.length)) + 1}`;
                                                data[9] = "";
                                                data[10] = `=E${(parseInt(json.length)) + 1}*J${(parseInt(json.length)) + 1}`;
                                                data[11] = "";
                                                data[12] = -1;
                                                data[13] = true;
                                                data[14] = endDate;
                                                data[15] = [];
                                                obj.insertRow(data);
                                                var cell = obj.getCell(`D${parseInt(json.length) + 1}`)
                                                cell.classList.remove('readonly');

                                            }.bind(this)
                                        });
                                        // }
                                    }

                                    if (obj.options.allowDeleteRow == true) {
                                        items.push({
                                            title: obj.options.text.deleteSelectedRows,
                                            onclick: function () {
                                                obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
                                            }
                                        });
                                    }

                                    if (x) {
                                        if (obj.options.allowComments == true) {
                                            items.push({ type: 'line' });

                                            var title = obj.records[y][x].getAttribute('title') || '';

                                            items.push({
                                                title: title ? obj.options.text.editComments : obj.options.text.addComments,
                                                onclick: function () {
                                                    obj.setComments([x, y], prompt(obj.options.text.comments, title));
                                                }
                                            });

                                            if (title) {
                                                items.push({
                                                    title: obj.options.text.clearComments,
                                                    onclick: function () {
                                                        obj.setComments([x, y], '');
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }

                                // Line
                                items.push({ type: 'line' });

                                // Save
                                if (obj.options.allowExport) {
                                    items.push({
                                        title: i18n.t('static.supplyPlan.exportAsCsv'),
                                        shortcut: 'Ctrl + S',
                                        onclick: function () {
                                            obj.download(true);
                                        }
                                    });
                                }

                                return items;
                            }.bind(this)
                        };
                        myVar = jexcel(document.getElementById("adjustmentsTable"), options);
                        this.el = myVar;
                        this.setState({
                            inventoryEl: myVar
                        })
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                inventoryError: i18n.t('static.supplyPlan.saveDataFirst')
            })
        }
    }

    loadedInventory = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }


    loadedBatchInfoInventory = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    batchInfoChangedInventory = function (instance, cell, x, y, value) {
        this.setState({
            inventoryBatchError: ''
        })
        var elInstance = instance.jexcel;
        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.setState({
                    inventoryBatchInfoDuplicateError: ''
                })
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");

                if (value != -1) {
                    var expiryDate = this.state.batchInfoListAllForInventory.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText)[0].expiryDate;
                    elInstance.setValueFromCoords(1, y, expiryDate, true);
                }
            }
        }

        if (x == 3) {
            if (elInstance.getValueFromCoords(3, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(3, y).toString().replaceAll("\,", "") != 0) {
                var reg = /-?\d+/
                // var reg = /^[0-9\b]+$/;
                value = value.toString().replaceAll("\,", "");
                var col = ("D").concat(parseInt(y) + 1);
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.setState({
                        inventoryBatchInfoNoStockError: ''
                    })
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else if (elInstance.getValueFromCoords(2, y) == 2) {
                var col = ("D").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                var col = ("D").concat(parseInt(y) + 1);
                this.setState({
                    inventoryBatchInfoNoStockError: ''
                })
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 4) {
            if (elInstance.getValueFromCoords(4, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(4, y).toString().replaceAll("\,", "") != 0) {
                // var reg = /-?\d+/
                var reg = /^[0-9\b]+$/;
                var col = ("E").concat(parseInt(y) + 1);
                value = value.toString().replaceAll("\,", "")
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else if (elInstance.getValueFromCoords(2, y) == 1) {
                var col = ("E").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                var col = ("E").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                if (value == 1) {
                    var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                    cell.classList.remove('readonly');
                    elInstance.setValueFromCoords(3, y, "", true);
                } else {
                    var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                    cell.classList.remove('readonly');
                    elInstance.setValueFromCoords(4, y, "", true);
                }
            }
        }

        this.setState({
            inventoryBatchInfoChangedFlag: 1
        })
    }.bind(this)

    checkValidationInventoryBatchInfo() {
        var valid = true;
        var elInstance = this.state.inventoryBatchInfoTableEl;
        var json = elInstance.getJson();
        var mapArray = [];
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);

            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("0") == map.get("0")
            )
            if (checkDuplicateInMap.length > 1) {
                var colArr = ['A'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.supplyPlan.duplicateBatchNumber'));
                }
                valid = false;
                this.setState({
                    inventoryBatchInfoDuplicateError: i18n.t('static.supplyPlan.duplicateBatchNumber')
                })
            } else {
                var programJson = this.state.programJsonAfterAdjustmentClicked;
                var shipmentList = programJson.shipmentList;
                var shipmentBatchArray = [];
                for (var ship = 0; ship < shipmentList.length; ship++) {
                    var batchInfoList = shipmentList[ship].batchInfoList;
                    for (var bi = 0; bi < batchInfoList.length; bi++) {
                        shipmentBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].shipmentQty })
                    }
                }
                if (map.get("0") != -1) {
                    var stockForBatchNumber = shipmentBatchArray.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText)[0];
                    var totalStockForBatchNumber = stockForBatchNumber.qty;

                    var consumptionList = programJson.consumptionList;
                    var consumptionBatchArray = [];

                    for (var con = 0; con < consumptionList.length; con++) {
                        var batchInfoList = consumptionList[con].batchInfoList;
                        for (var bi = 0; bi < batchInfoList.length; bi++) {
                            consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
                        }
                    }
                    var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText);
                    if (consumptionForBatchNumber == undefined) {
                        consumptionForBatchNumber = [];
                    }
                    var consumptionQty = 0;
                    for (var b = 0; b < consumptionForBatchNumber.length; b++) {
                        consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
                    }
                    consumptionQty += parseInt(map.get("2").toString().replaceAll("\,", ""));
                    var inventoryList = programJson.inventoryList;
                    var inventoryBatchArray = [];
                    for (var inv = 0; inv < inventoryList.length; inv++) {
                        var invIndex = (this.state.inventoryEl).getRowData(parseInt(map.get("6")))[12];
                        if (inv != invIndex) {
                            var batchInfoList = inventoryList[inv].batchInfoList;
                            for (var bi = 0; bi < batchInfoList.length; bi++) {
                                inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier })
                            }
                        }
                    }

                    var inventoryForBatchNumber = [];
                    if (inventoryBatchArray.length > 0) {
                        inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText);
                    }
                    if (inventoryForBatchNumber == undefined) {
                        inventoryForBatchNumber = [];
                    }
                    var adjustmentQty = 0;
                    for (var b = 0; b < inventoryForBatchNumber.length; b++) {
                        adjustmentQty += parseFloat(inventoryForBatchNumber[b].qty);
                    }
                    adjustmentQty += parseInt(map.get("3").toString().replaceAll("\,", ""));
                    var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
                    if (remainingBatchQty < 0) {
                        var col = ("D").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.supplyPlan.noStockAvailable'));

                        valid = false;
                        this.setState({
                            inventoryBatchInfoNoStockError: i18n.t('static.supplyPlan.noStockAvailable')
                        })
                    }
                } else {
                    var colArr = ['A'];
                    for (var c = 0; c < colArr.length; c++) {
                        var col = (colArr[c]).concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                    var col = ("A").concat(parseInt(y) + 1);
                    var value = elInstance.getValueFromCoords(0, y);
                    if (value == "") {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }

                    var col = ("D").concat(parseInt(y) + 1);
                    var value = elInstance.getValueFromCoords(3, y).toString().replaceAll("\,", "");
                    var reg = /-?\d+/;
                    // var reg = /^[0-9\b]+$/;
                    if (elInstance.getValueFromCoords(3, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(3, y).toString().replaceAll("\,", "") != 0) {
                        var reg = /-?\d+/
                        // var reg = /^[0-9\b]+$/;
                        var col = ("D").concat(parseInt(y) + 1);
                        if (isNaN(parseInt(value)) || !(reg.test(value))) {
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", "yellow");
                            elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                            valid = false;
                        } else {
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setComments(col, "");
                        }
                    } else if (elInstance.getValueFromCoords(2, y) == 2) {
                        var col = ("D").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        var col = ("D").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }

                    var value = elInstance.getValueFromCoords(4, y).toString().replaceAll("\,", "");
                    if (elInstance.getValueFromCoords(4, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(4, y).toString().replaceAll("\,", "") != 0) {
                        // var reg = /-?\d+/
                        var reg = /^[0-9\b]+$/;
                        var col = ("E").concat(parseInt(y) + 1);
                        if (isNaN(parseInt(value)) || !(reg.test(value))) {
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", "yellow");
                            elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                            valid = false;
                        } else {
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setComments(col, "");
                        }
                    } else if (elInstance.getValueFromCoords(2, y) == 1) {
                        var col = ("E").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        var col = ("E").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }

                    var value = elInstance.getValueFromCoords(2, y);
                    var col = ("C").concat(parseInt(y) + 1);
                    if (value == "") {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                }
            }
        }
        return valid;
    }

    saveInventoryBatchInfo() {
        var validation = this.checkValidationInventoryBatchInfo();
        if (validation == true) {
            var elInstance = this.state.inventoryBatchInfoTableEl;
            var json = elInstance.getJson();
            var batchInfoArray = [];
            var rowNumber = 0;
            var totalAdjustments = 0;
            var totalActualStock = 0;

            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                if (i == 0) {
                    rowNumber = map.get("6");
                }
                if (map.get("0") != -1) {
                    var batchInfoJson = {
                        consumptionTransBatchInfoId: map.get("5"),
                        batch: {
                            batchId: map.get("0"),
                            batchNo: elInstance.getCell(`A${parseInt(i) + 1}`).innerText,
                            expiryDate: map.get("1")
                        },
                        adjustmentQty: map.get("3").toString().replaceAll("\,", ""),
                        actualQty: map.get("4").toString().replaceAll("\,", "")
                    }
                    batchInfoArray.push(batchInfoJson);
                }
                totalAdjustments += parseInt(map.get("3").toString().replaceAll("\,", ""));
                totalActualStock += parseInt(map.get("4").toString().replaceAll("\,", ""));
            }
            var inventoryInstance = this.state.inventoryEl;
            var rowData = inventoryInstance.getRowData(parseInt(rowNumber));

            if (map.get(1) == 1) {
                inventoryInstance.setValueFromCoords(7, rowNumber, "", true);
                inventoryInstance.setValueFromCoords(9, rowNumber, totalActualStock, true);
            } else {
                inventoryInstance.setValueFromCoords(7, rowNumber, totalAdjustments, true);
                inventoryInstance.setValueFromCoords(9, rowNumber, "", true);
            }
            // rowData[15] = batchInfoArray;
            inventoryInstance.setValueFromCoords(15, rowNumber, batchInfoArray, "");
            this.setState({
                inventoryChangedFlag: 1,
                inventoryBatchInfoChangedFlag: 0,
                inventoryBatchInfoTableEl: ''
            })
            document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'none';
            elInstance.destroy();
        } else {
            this.setState({
                inventoryBatchError: i18n.t('static.supplyPlan.validationFailed')
            })
        }
    }

    // Adjustments changed
    inventoryChanged = function (instance, cell, x, y, value) {
        this.setState({
            inventoryError: '',
            inventoryDuplicateError: '',
        })
        var elInstance = this.state.inventoryEl;
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var countrySKU = this.state.countrySKUListAll.filter(c => c.realmCountryPlanningUnitId == value)[0];
                var multiplier = countrySKU.multiplier;
                elInstance.setValueFromCoords(4, y, multiplier, true);
                // var region = elInstance.getValueFromCoords(1, y);
                // var endDate = elInstance.getValueFromCoords(14, y);
                // var inventoryDetails = this.state.inventoryListUnFiltered.filter(c => c.realmCountryPlanningUnit.id == value
                //     && c.region.id == region
                //     && c.inventoryDate <= endDate
                // );
                // var lastInventoryDate = "";
                // for (var id = 0; id < inventoryDetails.length; id++) {
                //     if (id == 0) {
                //         lastInventoryDate = inventoryDetails[id].inventoryDate;
                //     }
                //     if (lastInventoryDate < inventoryDetails[id].inventoryDate) {
                //         lastInventoryDate = inventoryDetails[id].inventoryDate;
                //     }
                // }
                // var inventoryDetailsFiltered = inventoryDetails.filter(c => c.inventoryDate == lastInventoryDate);
                // var expBal = 0;
                // if (inventoryDetailsFiltered.length > 0) {
                //     var expBal = parseInt(inventoryDetailsFiltered[0].expectedBal) + parseInt(inventoryDetailsFiltered[0].adjustmentQty);
                // }
                // elInstance.setValueFromCoords(5, y, expBal, true);
                // elInstance.setValueFromCoords(6, y, parseInt(expBal)*parseInt(multiplier), true);
                // elInstance.setValueFromCoords(8, y, parseInt(elInstance.getValueFromCoords(7,y))*parseInt(multiplier), true);
                // elInstance.setValueFromCoords(10, y, parseInt(elInstance.getValueFromCoords(9,y))*parseInt(multiplier), true);
            }
        }

        if (x == 7) {
            if (elInstance.getValueFromCoords(7, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(7, y).toString().replaceAll("\,", "") != 0) {
                var reg = /-?\d+/
                // var reg = /^[0-9\b]+$/;
                value = value.toString().replaceAll("\,", "");
                var col = ("H").concat(parseInt(y) + 1);
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else if (elInstance.getValueFromCoords(5, y) == 2) {
                var col = ("H").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                var col = ("H").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 9) {
            if (elInstance.getValueFromCoords(9, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(9, y).toString().replaceAll("\,", "") != 0) {
                // var reg = /-?\d+/
                var reg = /^[0-9\b]+$/;
                var col = ("J").concat(parseInt(y) + 1);
                value = value.toString().replaceAll("\,", "")
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else if (elInstance.getValueFromCoords(5, y) == 1) {
                var col = ("J").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                var col = ("J").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                if (value == 1) {
                    var cell = elInstance.getCell(`H${parseInt(y) + 1}`)
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(`J${parseInt(y) + 1}`)
                    cell.classList.remove('readonly');
                    elInstance.setValueFromCoords(7, y, "", true);
                } else {
                    var cell = elInstance.getCell(`J${parseInt(y) + 1}`)
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(`H${parseInt(y) + 1}`)
                    cell.classList.remove('readonly');
                    elInstance.setValueFromCoords(9, y, "", true);
                }
            }
        }


        this.setState({
            inventoryChangedFlag: 1
        })
    }

    // Adjustments edit
    inventoryOnedit = function (instance, cell, x, y, value) {
        // var elInstance = this.state.inventoryEl;
        // if (x == 7) {
        //     elInstance.setValueFromCoords(9, y, "", true);
        //     elInstance.setValueFromCoords(5, y, "", true);
        // }
    }.bind(this);

    // Adjustments final validation
    checkValidationInventory() {
        var valid = true;
        var elInstance = this.state.inventoryEl;
        var json = elInstance.getJson();
        var mapArray = [];
        // var adjustmentsQty = 0;
        // var openingBalance = 0;
        // var consumptionQty = 0;
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);

            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("4") == map.get("4")
            )
            if (checkDuplicateInMap.length > 1) {
                var colArr = ['D'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.supplyPlan.duplicateAdjustments'));
                }
                valid = false;
                this.setState({
                    inventoryDuplicateError: i18n.t('static.supplyPlan.duplicateAdjustments')
                })
            } else {
                // openingBalance = (this.state.openingBalanceRegionWise.filter(c => c.month.month == map.get("0") && c.region.id == map.get("1"))[0]).balance;
                // consumptionQty = (this.state.consumptionFilteredArray.filter(c => c.month.month == map.get("0") && c.region.id == map.get("1"))[0]).consumptionQty;
                // adjustmentsQty += (map.get("7") * map.get("4"))
                var colArr = ['D'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                var col = ("C").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(2, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("D").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(3, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("H").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(7, y).toString().replaceAll("\,", "");
                var reg = /-?\d+/;
                // var reg = /^[0-9\b]+$/;
                if (elInstance.getValueFromCoords(7, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(7, y).toString().replaceAll("\,", "") != 0) {
                    var reg = /-?\d+/
                    // var reg = /^[0-9\b]+$/;
                    var col = ("H").concat(parseInt(y) + 1);
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                } else if (elInstance.getValueFromCoords(5, y) == 2) {
                    var col = ("H").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ("H").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var value = elInstance.getValueFromCoords(9, y).toString().replaceAll("\,", "");
                if (elInstance.getValueFromCoords(9, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(9, y).toString().replaceAll("\,", "") != 0) {
                    // var reg = /-?\d+/
                    var reg = /^[0-9\b]+$/;
                    var col = ("J").concat(parseInt(y) + 1);
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                } else if (elInstance.getValueFromCoords(5, y) == 1) {
                    var col = ("J").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ("J").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var value = elInstance.getValueFromCoords(5, y);
                var col = ("F").concat(parseInt(y) + 1);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }

        // if ((openingBalance + adjustmentsQty - consumptionQty) < 0) {
        //     valid = false;
        //     this.setState({
        //         inventoryNoStockError: i18n.t('static.supplyPlan.noStockAvailable')
        //     })
        // }
        return valid;
    }

    // Save adjustments
    saveInventory() {
        this.setState({
            inventoryError: ''
        })
        var validation = this.checkValidationInventory();
        if (validation == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            var elInstance = this.state.inventoryEl;
            var planningUnitId = document.getElementById("planningUnitId").value;
            var json = elInstance.getJson();
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');

                var programId = (document.getElementById("programId").value);

                var programRequest = programTransaction.get(programId);
                programRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var inventoryDataList = (programJson.inventoryList);
                    for (var i = 0; i < json.length; i++) {
                        var map = new Map(Object.entries(json[i]));
                        if (parseInt(map.get("12")) != -1) {
                            inventoryDataList[parseInt(map.get("12"))].dataSource.id = map.get("2");
                            inventoryDataList[parseInt(map.get("12"))].adjustmentQty = (map.get("7")).toString().replaceAll("\,", "");
                            inventoryDataList[parseInt(map.get("12"))].actualQty = (map.get("9")).toString().replaceAll("\,", "");
                            inventoryDataList[parseInt(map.get("12"))].notes = map.get("11");
                            inventoryDataList[parseInt(map.get("12"))].active = map.get("13");
                            inventoryDataList[parseInt(map.get("12"))].batchInfoList = map.get("15");
                        } else {
                            var inventoryJson = {
                                inventoryId: 0,
                                dataSource: {
                                    id: map.get("2")
                                },
                                region: {
                                    id: map.get("1")
                                },
                                inventoryDate: map.get("14"),
                                adjustmentQty: map.get("7").toString().replaceAll("\,", ""),
                                actualQty: map.get("9").toString().replaceAll("\,", ""),
                                active: map.get("13"),
                                realmCountryPlanningUnit: {
                                    id: map.get("3"),
                                },
                                multiplier: map.get("4"),
                                planningUnit: {
                                    id: planningUnitId
                                },
                                notes: map.get("11"),
                                batchInfoList: map.get("15")
                            }


                            inventoryDataList.push(inventoryJson);
                        }
                        var invList = inventoryDataList.filter(c => c.inventoryDate == map.get("14") && c.realmCountryPlanningUnit.id == map.get("3") && c.region != null);
                        var actualQty = 0;
                        var adjustmentQty = 0;
                        var actualQtyCount = 0;
                        var regionWiseInventoryCount = 0;
                        for (var i = 0; i < invList.length; i++) {
                            regionWiseInventoryCount += 1;
                            if (invList[i].actualQty != "" && invList[i].actualQty != null) {
                                actualQty += parseFloat(invList[i].actualQty);
                                actualQtyCount += 1;
                            }
                            if (invList[i].adjustmentQty != "" && invList[i].adjustmentQty != null) {
                                adjustmentQty += parseFloat(invList[i].adjustmentQty);
                            }
                        }
                        if (actualQty > 0 && adjustmentQty == 0 && regionWiseInventoryCount == this.state.regionListFiltered.length) {
                            var endDate = map.get("14");
                            var index = this.state.monthsArray.findIndex(c => moment(c.endDate).format("YYYY-MM-DD") == moment(endDate).format("YYYY-MM-DD"));
                            var closingBalance = parseInt(this.state.openingBalanceArray[index]) + parseInt(this.state.shipmentsTotalData[index]) - parseInt(this.state.consumptionTotalData[index]);
                            var nationalAdjustment = parseFloat(actualQty) - parseInt(closingBalance);
                            if (nationalAdjustment != 0) {
                                var nationAdjustmentIndex = inventoryDataList.findIndex(c => c.region == null && c.realmCountryPlanningUnit.id == map.get("3"));
                                if (nationAdjustmentIndex == -1) {
                                    var inventoryJson = {
                                        inventoryId: 0,
                                        dataSource: {
                                            id: QAT_DATA_SOURCE_ID
                                        },
                                        region: null,
                                        inventoryDate: map.get("14"),
                                        adjustmentQty: nationalAdjustment,
                                        actualQty: "",
                                        active: true,
                                        realmCountryPlanningUnit: {
                                            id: map.get("3"),
                                        },
                                        multiplier: map.get("4"),
                                        planningUnit: {
                                            id: planningUnitId
                                        },
                                        notes: "",
                                        batchInfoList: []
                                    }
                                    inventoryDataList.push(inventoryJson);
                                } else {
                                    inventoryDataList[parseInt(nationAdjustmentIndex)].adjustmentQty = nationalAdjustment;
                                }
                            }

                        }
                    }
                    programJson.inventoryList = inventoryDataList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.toggleLarge('Adjustments');
                        this.setState({
                            message: i18n.t('static.message.adjustmentsSaved'),
                            inventoryChangedFlag: 0
                        })
                        this.formSubmit(this.state.monthCount);
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                inventoryError: i18n.t('static.supplyPlan.validationFailed')
            })
        }
    }

    // Adjustments Functionality

    // Shipments functionality
    // Suggested shipments

    //Show Suggested shipments details
    suggestedShipmentsDetailsClicked(month, quantity, isEmergencyOrder) {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var programId = document.getElementById("programId").value;
        var db1;
        var procurementAgentList = [];
        var fundingSourceList = [];
        var currencyList = [];
        var currencyListAll = [];
        var budgetList = [];
        var dataSourceListAll = this.state.dataSourceListAll.filter(c => c.dataSourceType.id == SHIPMENT_DATA_SOURCE_TYPE);
        var dataSourceList = [];
        for (var k = 0; k < dataSourceListAll.length; k++) {
            var dataSourceJson = {
                name: getLabelText(dataSourceListAll[k].label, this.state.lang),
                id: dataSourceListAll[k].dataSourceId
            }
            dataSourceList.push(dataSourceJson);
        }
        var myVar = '';
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);
            var consumptionTotalData = [];
            var filteredArray = [];
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                this.setState({
                    shipmentListUnFiltered: programJson.shipmentList
                })

                // var addLeadTimes = Math.floor(parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                //     parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                //     parseFloat(programJson.deliveredToReceivedLeadTime));
                // var expectedDeliveryDateEnFormat = moment(Date.now()).utcOffset('-0500').add(addLeadTimes, 'months').format("MM-DD-YYYY");
                // var expectedDeliveryDate = moment(Date.now()).utcOffset('-0500').add(addLeadTimes, 'months').format("YYYY-MM-DD");
                var papuTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                var papuOs = papuTransaction.objectStore('procurementAgentPlanningUnit');
                var papuRequest = papuOs.getAll();
                papuRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                papuRequest.onsuccess = function (event) {
                    var papuResult = [];
                    papuResult = papuRequest.result;
                    for (var k = 0; k < papuResult.length; k++) {
                        if (papuResult[k].planningUnit.id == planningUnitId && papuResult[k].active == true) {
                            var papuJson = {
                                name: getLabelText(papuResult[k].procurementAgent.label, this.state.lang),
                                id: papuResult[k].procurementAgent.id
                            }
                            procurementAgentList.push(papuJson);
                        }
                    }

                    var currencyTransaction = db1.transaction(['currency'], 'readwrite');
                    var currencyOs = currencyTransaction.objectStore('currency');
                    var currencyRequest = currencyOs.getAll();
                    currencyRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    currencyRequest.onsuccess = function (event) {
                        var currencyResult = [];
                        currencyResult = (currencyRequest.result).filter(c => c.active == true);
                        for (var k = 0; k < currencyResult.length; k++) {

                            var currencyJson = {
                                name: getLabelText(currencyResult[k].label, this.state.lang),
                                id: currencyResult[k].currencyId
                            }
                            currencyList.push(currencyJson);
                            currencyListAll.push(currencyResult[k]);
                        }
                        this.setState({
                            currencyListAll: currencyListAll
                        })

                        var fsTransaction = db1.transaction(['fundingSource'], 'readwrite');
                        var fsOs = fsTransaction.objectStore('fundingSource');
                        var fsRequest = fsOs.getAll();
                        fsRequest.onerror = function (event) {
                            this.setState({
                                supplyPlanError: i18n.t('static.program.errortext')
                            })
                        }.bind(this);
                        fsRequest.onsuccess = function (event) {
                            var fsResult = [];
                            fsResult = fsRequest.result;
                            for (var k = 0; k < fsResult.length; k++) {
                                if (fsResult[k].realm.id == programJson.realmCountry.realm.realmId && fsResult[k].active == true) {
                                    var fsJson = {
                                        name: getLabelText(fsResult[k].label, this.state.lang) + " - " + fsResult[k].fundingSourceCode,
                                        id: fsResult[k].fundingSourceId
                                    }
                                    fundingSourceList.push(fsJson);
                                }
                            }



                            var paTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                            var paOs = paTransaction.objectStore('procurementAgent');
                            var paRequest = paOs.getAll();
                            paRequest.onerror = function (event) {
                                this.setState({
                                    supplyPlanError: i18n.t('static.program.errortext')
                                })
                            }.bind(this);
                            paRequest.onsuccess = function (event) {
                                var paResult = [];
                                paResult = (paRequest.result).filter(c => c.active == true);
                                this.setState({
                                    procurementAgentListAllForLeadTimes: paResult
                                })

                                var suggestedShipmentList = [];
                                suggestedShipmentList = this.state.suggestedShipmentsTotalData.filter(c => c.month == month && c.suggestedOrderQty != "");
                                this.el = jexcel(document.getElementById("suggestedShipmentsDetailsTable"), '');
                                this.el.destroy();
                                var data = [];
                                var suggestedShipmentsArr = []
                                var orderedDate = moment(Date.now()).format("YYYY-MM-DD");
                                for (var j = 0; j < suggestedShipmentList.length; j++) {
                                    var readOnlySuggestedOrderQty = true;
                                    data = [];
                                    // data[0]= expectedDeliveryDateEnFormat;
                                    data[0] = i18n.t('static.supplyPlan.suggested');
                                    data[1] = this.state.planningUnitName;
                                    data[2] = suggestedShipmentList[j].suggestedOrderQty;
                                    data[3] = `=C${parseInt(j) + 1}`;
                                    data[4] = "";
                                    data[5] = "";
                                    data[6] = "";//Currency
                                    data[7] = "";//ConversionRateToUSD
                                    data[8] = "";//Funding Source
                                    data[9] = "";
                                    data[10] = "";
                                    data[11] = orderedDate;
                                    data[12] = "";
                                    data[13] = isEmergencyOrder;
                                    suggestedShipmentsArr[j] = data;
                                }
                                if (suggestedShipmentList.length == 0) {
                                    var readOnlySuggestedOrderQty = false;
                                    data = [];
                                    // data[0]= expectedDeliveryDateEnFormat;
                                    data[0] = i18n.t('static.supplyPlan.suggested');
                                    data[1] = this.state.planningUnitName;
                                    data[2] = "";
                                    data[3] = `=C1`;
                                    data[4] = "";
                                    data[5] = "";
                                    data[6] = "";//Currency
                                    data[7] = "";//ConversionRateToUSD
                                    data[8] = "";//Funding Source
                                    data[9] = "";
                                    data[10] = "";
                                    data[11] = orderedDate;
                                    data[12] = "";
                                    data[13] = isEmergencyOrder;
                                    suggestedShipmentsArr[0] = data;
                                }
                                var options = {
                                    data: suggestedShipmentsArr,
                                    colWidths: [150, 200, 80, 80, 150, 250, 150, 80, 180, 100, 350, 10, 100],
                                    columns: [
                                        { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.shipmentStatus') },
                                        { type: 'text', readOnly: true, title: i18n.t('static.planningunit.planningunit') },
                                        { type: 'numeric', readOnly: readOnlySuggestedOrderQty, title: i18n.t('static.supplyPlan.suggestedOrderQty'), mask: '#,##' },
                                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.adjustesOrderQty'), mask: '#,##' },
                                        { type: 'dropdown', source: dataSourceList, title: i18n.t('static.datasource.datasource') },
                                        { type: 'dropdown', source: procurementAgentList, title: i18n.t('static.procurementagent.procurementagent') },
                                        { type: 'dropdown', source: currencyList, title: i18n.t('static.dashboard.currency') },
                                        { type: 'text', readOnly: true, title: i18n.t('static.currency.conversionrateusd') },
                                        { type: 'dropdown', source: fundingSourceList, title: i18n.t('static.subfundingsource.fundingsource') },
                                        { type: 'dropdown', source: [{ id: 1, name: i18n.t('static.supplyPlan.sea') }, { id: 2, name: i18n.t('static.supplyPlan.air') }], title: i18n.t('static.supplyPlan.shipmentMode') },
                                        { type: 'text', title: i18n.t('static.program.notes') },
                                        { type: 'hidden', title: i18n.t('static.supplyPlan.orderDate') },
                                        { type: 'calendar', options: { format: 'MM-DD-YYYY', validRange: [moment(Date.now()).format("YYYY-MM-DD"), null] }, title: i18n.t('static.supplyPlan.expectedDeliveryDate') },
                                        { type: 'hidden', title: i18n.t('static.supplyPlan.emergencyOrder') }
                                    ],
                                    pagination: false,
                                    search: false,
                                    columnSorting: true,
                                    tableOverflow: true,
                                    wordWrap: true,
                                    allowInsertColumn: false,
                                    allowManualInsertColumn: false,
                                    allowDeleteRow: false,
                                    // allowInsertRow: false,
                                    allowManualInsertRow: false,
                                    onchange: this.suggestedShipmentChanged,
                                    text: {
                                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                        show: '',
                                        entries: '',
                                    },
                                    onload: this.loadedSuggestedShipements,
                                    contextMenu: function (obj, x, y, e) {
                                        var items = [];
                                        if (y == null) {
                                            // Insert a new column
                                            if (obj.options.allowInsertColumn == true) {
                                                items.push({
                                                    title: obj.options.text.insertANewColumnBefore,
                                                    onclick: function () {
                                                        obj.insertColumn(1, parseInt(x), 1);
                                                    }
                                                });
                                            }

                                            if (obj.options.allowInsertColumn == true) {
                                                items.push({
                                                    title: obj.options.text.insertANewColumnAfter,
                                                    onclick: function () {
                                                        obj.insertColumn(1, parseInt(x), 0);
                                                    }
                                                });
                                            }

                                            // Delete a column
                                            if (obj.options.allowDeleteColumn == true) {
                                                items.push({
                                                    title: obj.options.text.deleteSelectedColumns,
                                                    onclick: function () {
                                                        obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
                                                    }
                                                });
                                            }

                                            // Rename column
                                            if (obj.options.allowRenameColumn == true) {
                                                items.push({
                                                    title: obj.options.text.renameThisColumn,
                                                    onclick: function () {
                                                        obj.setHeader(x);
                                                    }
                                                });
                                            }

                                            // Sorting
                                            if (obj.options.columnSorting == true) {
                                                // Line
                                                items.push({ type: 'line' });

                                                items.push({
                                                    title: obj.options.text.orderAscending,
                                                    onclick: function () {
                                                        obj.orderBy(x, 0);
                                                    }
                                                });
                                                items.push({
                                                    title: obj.options.text.orderDescending,
                                                    onclick: function () {
                                                        obj.orderBy(x, 1);
                                                    }
                                                });
                                            }
                                        } else {
                                            // Insert new row
                                            if (obj.options.allowInsertRow == true) {
                                                items.push({
                                                    title: i18n.t('static.supplyPlan.addNewShipment'),
                                                    onclick: function () {
                                                        var json = obj.getJson();
                                                        var data = [];
                                                        var orderedDate = moment(Date.now()).format("YYYY-MM-DD");
                                                        data[0] = i18n.t('static.supplyPlan.suggested');
                                                        data[1] = this.state.planningUnitName;
                                                        data[2] = "";
                                                        data[3] = `=C${parseInt(json.length) + 1}`;
                                                        data[4] = "";
                                                        data[5] = "";
                                                        data[6] = "";//Currency
                                                        data[7] = "";//ConversionRateToUSD
                                                        data[8] = "";//Funding Source
                                                        data[9] = "";
                                                        data[10] = "";
                                                        data[11] = orderedDate;
                                                        data[12] = "";
                                                        data[13] = 0;
                                                        obj.insertRow(data);
                                                        var cell = obj.getCell(`C${parseInt(json.length) + 1}`)
                                                        cell.classList.remove('readonly');
                                                    }.bind(this)
                                                });
                                            }

                                            if (obj.options.allowDeleteRow == true) {
                                                items.push({
                                                    title: obj.options.text.deleteSelectedRows,
                                                    onclick: function () {
                                                        obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
                                                    }
                                                });
                                            }

                                            if (x) {
                                                if (obj.options.allowComments == true) {
                                                    items.push({ type: 'line' });

                                                    var title = obj.records[y][x].getAttribute('title') || '';

                                                    items.push({
                                                        title: title ? obj.options.text.editComments : obj.options.text.addComments,
                                                        onclick: function () {
                                                            obj.setComments([x, y], prompt(obj.options.text.comments, title));
                                                        }
                                                    });

                                                    if (title) {
                                                        items.push({
                                                            title: obj.options.text.clearComments,
                                                            onclick: function () {
                                                                obj.setComments([x, y], '');
                                                            }
                                                        });
                                                    }
                                                }
                                            }
                                        }

                                        // Line
                                        items.push({ type: 'line' });

                                        // Save
                                        if (obj.options.allowExport) {
                                            items.push({
                                                title: i18n.t('static.supplyPlan.exportAsCsv'),
                                                shortcut: 'Ctrl + S',
                                                onclick: function () {
                                                    obj.download(true);
                                                }
                                            });
                                        }

                                        return items;
                                    }.bind(this)
                                };
                                myVar = jexcel(document.getElementById("suggestedShipmentsDetailsTable"), options);
                                this.el = myVar;
                                this.setState({
                                    suggestedShipmentsEl: myVar
                                })
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    loadedSuggestedShipements = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    // Suggested shipment changed 
    suggestedShipmentChanged = function (instance, cell, x, y, value) {
        this.setState({
            suggestedShipmentError: '',
            suggestedShipmentDuplicateError: ''
        })
        var elInstance = this.state.suggestedShipmentsEl;
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }


        if (x == 6) {
            var col = ("G").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var currency = (this.state.currencyListAll).filter(c => c.currencyId == value)[0];
                elInstance.setValueFromCoords(7, y, currency.conversionRateToUsd, true)
            }
        }

        if (x == 8) {
            var col = ("I").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            var reg = /^[0-9\b]+$/;
            value = value.toString().replaceAll("\,", "");
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }

        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var valueOfG = elInstance.getValueFromCoords(9, y);
                var addLeadTimes = 0;
                if (valueOfG != "") {
                    var db1;
                    var storeOS;
                    getDatabase();
                    var openRequest = indexedDB.open('fasp', 1);
                    openRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    openRequest.onsuccess = function (e) {
                        db1 = e.target.result;
                        var transaction = db1.transaction(['programData'], 'readwrite');
                        var programTransaction = transaction.objectStore('programData');

                        var programId = (document.getElementById("programId").value);

                        var programRequest = programTransaction.get(programId);
                        programRequest.onerror = function (event) {
                            this.setState({
                                supplyPlanError: i18n.t('static.program.errortext')
                            })
                        }.bind(this);
                        programRequest.onsuccess = function (event) {
                            var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);
                            var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                            var papuOs = papuTransaction.objectStore('procurementAgent');
                            var papuRequest = papuOs.get(parseInt(value));
                            papuRequest.onerror = function (event) {
                                this.setState({
                                    supplyPlanError: i18n.t('static.program.errortext')
                                })
                            }.bind(this);
                            papuRequest.onsuccess = function (event) {
                                var papuResult = [];
                                papuResult = papuRequest.result;
                                if (papuResult.localProcurementAgent) {
                                    addLeadTimes = this.state.programPlanningUnitList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].localProcurementLeadTime;
                                } else {
                                    var submittedToApprovedLeadTime = this.state.programPlanningUnitList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].submittedToApprovedLeadTime;
                                    if (submittedToApprovedLeadTime == 0 || submittedToApprovedLeadTime == "") {
                                        submittedToApprovedLeadTime = programJson.submittedToApprovedLeadTime;
                                    }
                                    addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime) +
                                        parseFloat(submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime);

                                    if (valueOfG == 1) {
                                        addLeadTimes = addLeadTimes + parseFloat(programJson.shippedToArrivedBySeaLeadTime);
                                    } else {
                                        addLeadTimes = addLeadTimes + parseFloat(programJson.shippedToArrivedByAirLeadTime);
                                    }
                                }
                                addLeadTimes = addLeadTimes;
                                var expectedDeliveryDate = moment(Date.now()).utcOffset('-0500').add(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                elInstance.setValueFromCoords(12, y, expectedDeliveryDate, true);
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }

                var valueOfJ = elInstance.getValueFromCoords(12, y);
                if (valueOfJ != "") {
                    var col1 = ("M").concat(parseInt(y) + 1);
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }
            }
        }

        if (x == 9) {
            var col = ("J").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var valueOfF = elInstance.getValueFromCoords(5, y);
                var addLeadTimes = 0;
                if (valueOfF != "") {
                    var db1;
                    var storeOS;
                    getDatabase();
                    var openRequest = indexedDB.open('fasp', 1);
                    openRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    openRequest.onsuccess = function (e) {
                        db1 = e.target.result;
                        var transaction = db1.transaction(['programData'], 'readwrite');
                        var programTransaction = transaction.objectStore('programData');

                        var programId = (document.getElementById("programId").value);

                        var programRequest = programTransaction.get(programId);
                        programRequest.onerror = function (event) {
                            this.setState({
                                supplyPlanError: i18n.t('static.program.errortext')
                            })
                        }.bind(this);
                        programRequest.onsuccess = function (event) {
                            var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);

                            var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                            var papuOs = papuTransaction.objectStore('procurementAgent');
                            var papuRequest = papuOs.get(parseInt(valueOfF));
                            papuRequest.onerror = function (event) {
                                this.setState({
                                    supplyPlanError: i18n.t('static.program.errortext')
                                })
                            }.bind(this);
                            papuRequest.onsuccess = function (event) {
                                var papuResult = [];
                                papuResult = papuRequest.result;

                                if (papuResult.localProcurementAgent) {
                                    addLeadTimes = this.state.programPlanningUnitList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].localProcurementLeadTime;
                                } else {
                                    var submittedToApprovedLeadTime = this.state.programPlanningUnitList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].submittedToApprovedLeadTime;
                                    if (submittedToApprovedLeadTime == 0 || submittedToApprovedLeadTime == "") {
                                        submittedToApprovedLeadTime = programJson.submittedToApprovedLeadTime;
                                    }
                                    addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime) +
                                        parseFloat(submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime);

                                    if (value == 1) {
                                        addLeadTimes = addLeadTimes + parseFloat(programJson.shippedToArrivedBySeaLeadTime);
                                    } else {
                                        addLeadTimes = addLeadTimes + parseFloat(programJson.shippedToArrivedByAirLeadTime);
                                    }
                                }
                                addLeadTimes = addLeadTimes;
                                var expectedDeliveryDate = moment(Date.now()).utcOffset('-0500').add(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                elInstance.setValueFromCoords(12, y, expectedDeliveryDate, true);
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }
            }
        }

        if (x == 12) {
            var col = ("M").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                // if (isNaN(Date.parse(value))) {
                //     elInstance.setStyle(col, "background-color", "transparent");
                //     elInstance.setStyle(col, "background-color", "yellow");
                //     elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                // } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var valueOfF = elInstance.getValueFromCoords(5, y);
                if (valueOfF != "") {
                    var col1 = ("F").concat(parseInt(y) + 1);
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }
                // }
            }
        }

        this.setState({
            suggestedShipmentChangedFlag: 1
        });
    }

    // Suggested shipments final validations
    checkValidationSuggestedShipments() {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var valid = true;
        var elInstance = this.state.suggestedShipmentsEl;
        var json = elInstance.getJson();
        for (var y = 0; y < json.length; y++) {

            var col = ("C").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(2, y);
            var reg = /^[0-9\b]+$/;
            value = value.toString().replaceAll("\,", "");
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }


            var col = ("E").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(4, y);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }

            var col = ("F").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(5, y);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }

            var col = ("G").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(6, y);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }

            var col = ("I").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(8, y);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }

            var col = ("J").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(9, y);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }

            var col = ("M").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(12, y);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                // if (isNaN(Date.parse(value))) {
                //     elInstance.setStyle(col, "background-color", "transparent");
                //     elInstance.setStyle(col, "background-color", "yellow");
                //     elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                //     valid = false;
                // } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                // }
            }
        }
        return valid;
    }

    // Save suggested shipments
    saveSuggestedShipments() {
        var validation = this.checkValidationSuggestedShipments();
        if (validation == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            var elInstance = this.state.suggestedShipmentsEl;
            var json = elInstance.getJson();
            var planningUnitId = document.getElementById("planningUnitId").value;
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');

                var programId = (document.getElementById("programId").value);

                var programRequest = programTransaction.get(programId);
                programRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var shipmentDataList = (programJson.shipmentList);
                    for (var jl = 0; jl < json.length; jl++) {
                        var map = new Map(Object.entries(json[jl]));
                        var papuResult = this.state.procurementAgentListAllForLeadTimes.filter(c => c.procurementAgentId == map.get("5"))[0];
                        var addLeadTimes = 0;
                        if (papuResult.localProcurementAgent) {
                            addLeadTimes = this.state.programPlanningUnitList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].localProcurementLeadTime;
                        } else {
                            var submittedToApprovedLeadTime = this.state.programPlanningUnitList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].submittedToApprovedLeadTime;
                            if (submittedToApprovedLeadTime == 0 || submittedToApprovedLeadTime == "") {
                                submittedToApprovedLeadTime = programJson.submittedToApprovedLeadTime;
                            }
                            addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime) +
                                parseFloat(submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime);

                            if (map.get("9") == 1) {
                                addLeadTimes = addLeadTimes + parseFloat(programJson.shippedToArrivedBySeaLeadTime);
                            } else {
                                addLeadTimes = addLeadTimes + parseFloat(programJson.shippedToArrivedByAirLeadTime);
                            }
                        }
                        addLeadTimes = addLeadTimes;
                        var expectedDeliveryDate = moment(Date.now()).utcOffset('-0500').add(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                        var isEmergencyOrder = 0;
                        if (moment(Date.parse(map.get("12"))).format("YYYY-MM") < moment(expectedDeliveryDate).format("YYYY-MM")) {
                            isEmergencyOrder = 1;
                        }
                        var shipmentMode = "Sea";
                        if (map.get("9") == 2) {
                            shipmentMode = "Air";
                        }

                        var shipmentJson = {
                            accountFlag: true,
                            active: true,
                            dataSource: {
                                id: map.get("4")
                            },
                            erpFlag: false,
                            expectedDeliveryDate: moment(Date.parse(map.get("12"))).format("YYYY-MM-DD"),
                            freightCost: 0,
                            notes: map.get("10"),
                            orderedDate: map.get("11"),
                            planningUnit: {
                                id: planningUnitId
                            },
                            procurementAgent: {
                                id: map.get("5")
                            },
                            procurementUnit: {
                                id: 0
                            },
                            productCost: 0,
                            shipmentQty: map.get("2").toString().replaceAll("\,", ""),
                            rate: 0,
                            deliveredDate: "",
                            shipmentId: 0,
                            shipmentMode: shipmentMode,
                            shipmentStatus: {
                                id: PLANNED_SHIPMENT_STATUS
                            },
                            shippedDate: "",
                            suggestedQty: map.get("2").toString().replaceAll("\,", ""),
                            supplier: {
                                id: 0
                            },
                            budget: {
                                id: 0
                            },
                            emergencyOrder: isEmergencyOrder,
                            batchInfoList: [],
                            currency: {
                                currencyId: map.get("6"),
                                conversionRateToUsd: map.get("7")
                            },
                            fundingSource: {
                                id: map.get("8")
                            },
                            index: shipmentDataList.length + jl
                        }
                        shipmentDataList.push(shipmentJson);
                    }
                    programJson.shipmentList = shipmentDataList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.toggleLarge('SuggestedShipments');
                        this.setState({
                            message: i18n.t('static.message.suggestedShipmentsSaved'),
                            suggestedShipmentChangedFlag: 0
                        })
                        this.formSubmit(this.state.monthCount);
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                suggestedShipmentError: i18n.t('static.supplyPlan.validationFailed')
            })
        }
    }

    // Suggested shipments

    budgetDropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[7];
        if (value != "") {
            var budgetList = this.state.budgetList;
            var mylist = budgetList.filter(b => b.fundingSource.fundingSourceId == value);
        }
        return mylist;
    }

    filterOrderBasedOn = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[13];
        if (value > 0) {
            var mylist = [{ id: 1, name: i18n.t('static.supplyPlan.container') }, { id: 2, name: i18n.t('static.supplyPlan.suggestedOrderQty') }, { id: 3, name: i18n.t('static.procurementAgentPlanningUnit.moq') }, { id: 4, name: i18n.t('static.supplyPlan.palletEuro1') }, { id: 5, name: i18n.t('static.supplyPlan.palletEuro2') }]
        } else {
            var mylist = [{ id: 1, name: i18n.t('static.supplyPlan.container') }, { id: 2, name: i18n.t('static.supplyPlan.suggestedOrderQty') }, { id: 3, name: i18n.t('static.procurementAgentPlanningUnit.moq') }, { id: 4, name: i18n.t('static.supplyPlan.palletEuro1') }]
        }
        return mylist;
    }

    filterBatchInfoForExistingData = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[2];
        if (value != 0) {
            mylist = this.state.batchInfoList.filter(c => c.id != -1);
        } else {
            mylist = this.state.batchInfoList;
        }
        return mylist;
    }.bind(this)

    filterBatchInfoForExistingDataForInventory = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[4];
        if (value != 0) {
            mylist = this.state.batchInfoList.filter(c => c.id != -1);
        } else {
            mylist = this.state.batchInfoList;
        }
        return mylist;
    }.bind(this)




    shipmentStatusDropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[38];
        if (value != "") {
            var shipmentStatusList = this.state.shipmentStatusList;
            var shipmentStatus = (this.state.shipmentStatusList).filter(c => c.shipmentStatusId == value)[0];
            var possibleStatusArray = shipmentStatus.nextShipmentStatusAllowedList;
            for (var k = 0; k < shipmentStatusList.length; k++) {
                if (possibleStatusArray.includes(shipmentStatusList[k].shipmentStatusId)) {
                    var shipmentStatusJson = {
                        name: getLabelText(shipmentStatusList[k].label, this.state.lang),
                        id: shipmentStatusList[k].shipmentStatusId
                    }
                    mylist.push(shipmentStatusJson);
                }

            }
        }
        return mylist;
    }

    // Procurement Unit list based on procurement agent

    procurementUnitDropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[5];
        if (value != "") {
            var procurementUnitList = (this.state.procurementUnitListAll).filter(c => c.procurementAgent.id == value);
            for (var k = 0; k < procurementUnitList.length; k++) {
                var procurementUnitJson = {
                    name: getLabelText(procurementUnitList[k].procurementUnit.label, this.state.lang),
                    id: procurementUnitList[k].procurementUnit.id
                }
                mylist.push(procurementUnitJson);
            }
        }
        return mylist;
    }


    // Shipments Functionality


    render() {
        const { programList } = this.state;
        let programs = programList.length > 0
            && programList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        const { planningUnitList } = this.state;
        let planningUnits = planningUnitList.length > 0
            && planningUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        const { regionList } = this.state;
        let regions = regionList.length > 0
            && regionList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <h5 className="red">{this.state.supplyPlanError}</h5>

                <Card>
                    <CardHeader>
                        <strong>{i18n.t('static.dashboard.supplyPlan')}</strong>
                        <div className="card-header-actions">

                            <a className="card-header-action">
                                <Link to='/supplyPlanFormulas' target="_blank"><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></Link>
                            </a>

                        </div>
                    </CardHeader>
                    <CardBody>
                        <Formik
                            render={
                                ({
                                }) => (
                                        <Form name='simpleForm'>
                                            <Col md="12 pl-0">
                                                <div className="d-md-flex">
                                                    <FormGroup className="tab-ml-1">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                        <div className="controls SelectGo">
                                                            <InputGroup>
                                                                <Input type="select"
                                                                    bsSize="sm"
                                                                    value={this.state.programId}
                                                                    name="programId" id="programId"
                                                                    onChange={this.getPlanningUnitList}
                                                                >
                                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                                    {programs}
                                                                </Input>
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                    <FormGroup className="tab-ml-1">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                                        <div className="controls SelectGo">
                                                            <InputGroup>
                                                                <Input
                                                                    type="select"
                                                                    name="planningUnitId"
                                                                    id="planningUnitId"
                                                                    bsSize="sm"
                                                                    value={this.state.planningUnitId}
                                                                    onChange={() => { this.formSubmit(this.state.monthCount); this.refs.compareChild.formSubmit(0) }}
                                                                >
                                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                                    {planningUnits}
                                                                </Input>
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                    <ul className="legendcommitversion">
                                                        <li><span className="lightgreylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.tbd')}</span></li>
                                                        <li><span className="lightgreenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.multipleShipments')}</span></li>

                                                        <li><span className=" redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.emergencyShipments')} </span></li>
                                                        {/* <li><span className=" lightGreenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.multipleProcurementAgent')} </span></li> */}
                                                    </ul>
                                                    {/* <ul className="legend legendsync mt-0" >
                                                        <li><span className="skipedShipmentslegend"></span><span className="legendTextsync">  {i18n.t('static.supplyPlan.skippedShipments')}</span></li>
                                                        <li><span className="redlegend"></span><span className="legendTextsync"> {i18n.t('static.supplyPlan.emergencyShipments')}</span></li>
                                                        <li><span className="skipedShipmentsEmegencylegend"></span><span className="legendTextsync"> {i18n.t('static.supplyPlan.skippedEmergencyShipments')}</span></li>
                                                    </ul> */}
                                                </div>
                                            </Col>
                                        </Form>

                                    )} />

                        <div className="animated fadeIn">
                            <Row>

                                <Col xs="12" md="12" className="mb-4">
                                    <Nav tabs>
                                        <NavItem>
                                            <NavLink
                                                active={this.state.activeTab[0] === '1'}
                                                onClick={() => { this.toggle(0, '1'); }}
                                            >Current Supply Plan </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                active={this.state.activeTab[0] === '2'}
                                                onClick={() => { this.toggle(0, '2'); }}
                                            >
                                                Supply Plan for v{this.state.versionId}
                                            </NavLink>

                                        </NavItem>
                                    </Nav> <TabContent activeTab={this.state.activeTab[0]}>
                                        {this.tabPane()}
                                    </TabContent></Col></Row></div>
                    </CardBody>
                </Card>

            </div>
        )
    }

    shipmentsDetailsClicked(supplyPlanType, startDate, endDate) {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var programId = document.getElementById("programId").value;
        var procurementAgentList = [];
        var procurementAgentListAll = [];
        var fundingSourceList = [];
        var budgetList = [];
        var dataSourceListAll = this.state.dataSourceListAll.filter(c => c.dataSourceType.id == SHIPMENT_DATA_SOURCE_TYPE);
        var dataSourceList = [];
        for (var k = 0; k < dataSourceListAll.length; k++) {
            var dataSourceJson = {
                name: getLabelText(dataSourceListAll[k].label, this.state.lang),
                id: dataSourceListAll[k].dataSourceId
            }
            dataSourceList.push(dataSourceJson);
        }
        var shipmentStatusList = [];
        var shipmentStatusListAll = [];
        var currencyList = [];
        var currencyListAll = [];
        var procurementUnitList = [];
        var procurementUnitListAll = [];
        var supplierList = [];
        var fundingSourceList = [];
        var myVar = '';
        var db1;
        var elVar = "";
        var procurementListForSupplier = [];
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var airFreightPerc = programJson.airFreightPerc;
                var seaFreightPerc = programJson.seaFreightPerc;

                var batchInfoListAll = programJson.batchInfoList.filter(c => c.planningUnitId == document.getElementById("planningUnitId").value);
                this.setState({
                    batchInfoListAll: batchInfoListAll
                })
                var papuTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                var papuOs = papuTransaction.objectStore('procurementAgentPlanningUnit');
                var papuRequest = papuOs.getAll();
                papuRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                papuRequest.onsuccess = function (event) {
                    var papuResult = [];
                    papuResult = papuRequest.result;
                    for (var k = 0; k < papuResult.length; k++) {
                        if (papuResult[k].planningUnit.id == planningUnitId && papuResult[k].active == true) {
                            var papuJson = {
                                name: getLabelText(papuResult[k].procurementAgent.label, this.state.lang),
                                id: papuResult[k].procurementAgent.id
                            }
                            procurementAgentList.push(papuJson);
                            procurementAgentListAll.push(papuResult[k]);
                        }
                    }

                    var fsTransaction = db1.transaction(['fundingSource'], 'readwrite');
                    var fsOs = fsTransaction.objectStore('fundingSource');
                    var fsRequest = fsOs.getAll();
                    fsRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    fsRequest.onsuccess = function (event) {
                        var fsResult = [];
                        fsResult = fsRequest.result;
                        for (var k = 0; k < fsResult.length; k++) {
                            if (fsResult[k].realm.id == programJson.realmCountry.realm.realmId && fsResult[k].active == true) {
                                var fsJson = {
                                    name: getLabelText(fsResult[k].label, this.state.lang) + " - " + fsResult[k].fundingSourceCode,
                                    id: fsResult[k].fundingSourceId
                                }
                                fundingSourceList.push(fsJson);
                            }
                        }



                        var procurementUnitTransaction = db1.transaction(['procurementAgentProcurementUnit'], 'readwrite');
                        var procurementUnitOs = procurementUnitTransaction.objectStore('procurementAgentProcurementUnit');
                        var procurementUnitRequest = procurementUnitOs.getAll();
                        procurementUnitRequest.onerror = function (event) {
                            this.setState({
                                supplyPlanError: i18n.t('static.program.errortext')
                            })
                        }.bind(this);
                        procurementUnitRequest.onsuccess = function (event) {
                            var procurementUnitResult = [];
                            procurementUnitResult = (procurementUnitRequest.result).filter(c => c.active == true);
                            for (var k = 0; k < procurementUnitResult.length; k++) {
                                var procurementUnitJson = {
                                    name: getLabelText(procurementUnitResult[k].procurementUnit.label, this.state.lang),
                                    id: procurementUnitResult[k].procurementUnit.id
                                }
                                procurementUnitList.push(procurementUnitJson);
                                procurementUnitListAll.push(procurementUnitResult[k]);
                            }
                            this.setState({
                                procurementUnitListAll: procurementUnitListAll,
                                procurementAgentListAll: procurementAgentListAll
                            });

                            var puTransaction = db1.transaction(['procurementUnit'], 'readwrite');
                            var puOs = puTransaction.objectStore('procurementUnit');
                            var puRequest = puOs.getAll();
                            puRequest.onerror = function (event) {
                                this.setState({
                                    supplyPlanError: i18n.t('static.program.errortext')
                                })
                            }.bind(this);
                            puRequest.onsuccess = function (event) {
                                var puResult = [];
                                puResult = (puRequest.result);
                                this.setState({
                                    procurementListForSupplier: puResult,
                                });
                                var supplierTransaction = db1.transaction(['supplier'], 'readwrite');
                                var supplierOs = supplierTransaction.objectStore('supplier');
                                var supplierRequest = supplierOs.getAll();
                                supplierRequest.onerror = function (event) {
                                    this.setState({
                                        supplyPlanError: i18n.t('static.program.errortext')
                                    })
                                }.bind(this);
                                supplierRequest.onsuccess = function (event) {
                                    var supplierResult = [];
                                    supplierResult = supplierRequest.result;
                                    for (var k = 0; k < supplierResult.length; k++) {
                                        if (supplierResult[k].realm.id == programJson.realmCountry.realm.realmId && supplierResult[k].active == true) {
                                            var supplierJson = {
                                                name: getLabelText(supplierResult[k].label, this.state.lang),
                                                id: supplierResult[k].supplierId
                                            }
                                            supplierList.push(supplierJson);
                                        }
                                    }

                                    var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                                    var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
                                    var shipmentStatusRequest = shipmentStatusOs.getAll();
                                    shipmentStatusRequest.onerror = function (event) {
                                        this.setState({
                                            supplyPlanError: i18n.t('static.program.errortext')
                                        })
                                    }.bind(this);
                                    shipmentStatusRequest.onsuccess = function (event) {
                                        var shipmentStatusResult = [];
                                        shipmentStatusResult = shipmentStatusRequest.result;
                                        for (var k = 0; k < shipmentStatusResult.length; k++) {

                                            var shipmentStatusJson = {
                                                name: getLabelText(shipmentStatusResult[k].label, this.state.lang),
                                                id: shipmentStatusResult[k].shipmentStatusId
                                            }
                                            shipmentStatusList[k] = shipmentStatusJson
                                            shipmentStatusListAll.push(shipmentStatusResult[k])
                                        }
                                        this.setState({ shipmentStatusList: shipmentStatusListAll })

                                        var currencyTransaction = db1.transaction(['currency'], 'readwrite');
                                        var currencyOs = currencyTransaction.objectStore('currency');
                                        var currencyRequest = currencyOs.getAll();
                                        currencyRequest.onerror = function (event) {
                                            this.setState({
                                                supplyPlanError: i18n.t('static.program.errortext')
                                            })
                                        }.bind(this);
                                        currencyRequest.onsuccess = function (event) {
                                            var currencyResult = [];
                                            currencyResult = (currencyRequest.result).filter(c => c.active == true);
                                            for (var k = 0; k < currencyResult.length; k++) {

                                                var currencyJson = {
                                                    name: getLabelText(currencyResult[k].label, this.state.lang),
                                                    id: currencyResult[k].currencyId
                                                }
                                                currencyList.push(currencyJson);
                                                currencyListAll.push(currencyResult[k]);
                                            }

                                            var bTransaction = db1.transaction(['budget'], 'readwrite');
                                            var bOs = bTransaction.objectStore('budget');
                                            var bRequest = bOs.getAll();
                                            var budgetListAll = []
                                            bRequest.onerror = function (event) {
                                                this.setState({
                                                    supplyPlanError: i18n.t('static.program.errortext')
                                                })
                                            }.bind(this);
                                            bRequest.onsuccess = function (event) {
                                                var bResult = [];
                                                bResult = bRequest.result;
                                                for (var k = 0; k < bResult.length; k++) {
                                                    if (bResult[k].program.id == programJson.programId && bResult[k].active == true) {
                                                        var bJson = {
                                                            name: getLabelText(bResult[k].label, this.state.lang) + " - " + bResult[k].budgetCode,
                                                            id: bResult[k].budgetId
                                                        }
                                                        budgetList.push(bJson);
                                                        budgetListAll.push({
                                                            name: getLabelText(bResult[k].label, this.state.lang),
                                                            id: bResult[k].budgetId,
                                                            fundingSource: bResult[k].fundingSource
                                                        })
                                                    }

                                                }
                                                this.setState({
                                                    budgetList: budgetListAll,
                                                    budgetListAll: bResult,
                                                    currencyListAll: currencyListAll
                                                })

                                                var shipmentListUnFiltered = programJson.shipmentList;
                                                this.setState({
                                                    shipmentListUnFiltered: shipmentListUnFiltered
                                                })
                                                var shipmentList = [];
                                                var tableEditableBasedOnSupplyPlan = true;
                                                if (supplyPlanType == 'deliveredShipments') {
                                                    shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                                                } else if (supplyPlanType == 'shippedShipments') {
                                                    shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                                                } else if (supplyPlanType == 'orderedShipments') {
                                                    shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS));
                                                } else if (supplyPlanType == 'plannedShipments') {
                                                    shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DRAFT_SHIPMENT_STATUS || c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                                                } else if (supplyPlanType == 'deliveredErpShipments') {
                                                    shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                                                    tableEditableBasedOnSupplyPlan = false;
                                                } else if (supplyPlanType == 'shippedErpShipments') {
                                                    shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                                                    tableEditableBasedOnSupplyPlan = false;
                                                } else if (supplyPlanType == 'orderedErpShipments') {
                                                    shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS));
                                                    tableEditableBasedOnSupplyPlan = false;
                                                } else if (supplyPlanType == 'plannedErpShipments') {
                                                    shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DRAFT_SHIPMENT_STATUS || c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                                                    tableEditableBasedOnSupplyPlan = false;
                                                }

                                                this.el = jexcel(document.getElementById("shipmentsDetailsTable"), '');
                                                this.el.destroy();
                                                var data = [];
                                                var shipmentsArr = [];
                                                for (var i = 0; i < shipmentList.length; i++) {
                                                    var moq = 0;
                                                    var pricePerUnit = 0;
                                                    var userQty = "";
                                                    var procurementAgentPlanningUnit = {}
                                                    if (shipmentList[i].procurementAgent.id != "") {
                                                        procurementAgentPlanningUnit = procurementAgentListAll.filter(p => p.procurementAgent.id == shipmentList[i].procurementAgent.id)[0];
                                                        moq = procurementAgentPlanningUnit.moq;
                                                        pricePerUnit = procurementAgentPlanningUnit.catalogPrice;
                                                        if (shipmentList[i].procurementUnit.id != 0) {
                                                            var procurementUnit = procurementUnitListAll.filter(p => p.procurementUnit.id == shipmentList[i].procurementUnit.id && p.procurementAgent.id == shipmentList[i].procurementAgent.id)[0];
                                                            if (procurementUnit.vendorPrice != 0 && procurementUnit.vendorPrice != null) {
                                                                pricePerUnit = procurementUnit.vendorPrice;
                                                            }
                                                        }

                                                        if (procurementAgentPlanningUnit.unitsPerPallet != 0 && procurementAgentPlanningUnit.unitsPerContainer != 0) {
                                                            userQty = shipmentList[i].shipmentQty;
                                                        }
                                                    }
                                                    var totalShipmentQty = 0;

                                                    var shipmentBatchInfoList = shipmentList[i].batchInfoList;
                                                    for (var sb = 0; sb < shipmentBatchInfoList.length; sb++) {
                                                        totalShipmentQty += parseInt(shipmentBatchInfoList[sb].shipmentQty);
                                                    }

                                                    var orderNo = shipmentList[i].orderNo;
                                                    var primeLineNo = shipmentList[i].primeLineNo;
                                                    var orderNoAndPrimeLineNo = "";
                                                    if (orderNo != null && orderNo != "") {
                                                        orderNoAndPrimeLineNo = orderNo;
                                                    }
                                                    if (primeLineNo != null && primeLineNo != "") {
                                                        orderNoAndPrimeLineNo = orderNoAndPrimeLineNo.concat("~").concat(primeLineNo);
                                                    }

                                                    var shipmentMode = 1;
                                                    if (shipmentList[i].shipmentMode == "Air") {
                                                        shipmentMode = 2;
                                                    }
                                                    // budgetAmount = budgetAmount.toFixed(2);
                                                    data[0] = shipmentList[i].expectedDeliveryDate; // A
                                                    data[1] = shipmentList[i].shipmentStatus.id; //B
                                                    data[2] = orderNoAndPrimeLineNo; //C
                                                    data[3] = shipmentList[i].dataSource.id; // D
                                                    data[4] = shipmentList[i].procurementAgent.id; //E
                                                    data[5] = shipmentList[i].currency.currencyId;//F
                                                    data[6] = shipmentList[i].currency.conversionRateToUsd;//G
                                                    data[7] = shipmentList[i].fundingSource.id;//H
                                                    data[8] = shipmentList[i].budget.id;//I
                                                    data[9] = this.state.planningUnitName; //J
                                                    data[10] = shipmentList[i].suggestedQty; //K
                                                    data[11] = moq; //L
                                                    if (shipmentList[i].procurementAgent.id != "") {
                                                        data[12] = procurementAgentPlanningUnit.unitsPerPalletEuro1;//M
                                                        data[13] = procurementAgentPlanningUnit.unitsPerPalletEuro2;//N
                                                        data[14] = procurementAgentPlanningUnit.unitsPerContainer;//O
                                                    } else {
                                                        data[12] = 0;//M
                                                        data[13] = 0;//N
                                                        data[14] = 0;//O
                                                    }
                                                    data[15] = `=ROUND(IF(M${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/M${parseInt(i) + 1},L${parseInt(i) + 1}/M${parseInt(i) + 1}),0),2)`;//P
                                                    data[16] = `=ROUND(IF(N${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/N${parseInt(i) + 1},L${parseInt(i) + 1}/N${parseInt(i) + 1}),0),2)`;//Q
                                                    data[17] = `=ROUND(IF(O${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/O${parseInt(i) + 1},L${parseInt(i) + 1}/O${parseInt(i) + 1}),0),2)`;//R
                                                    data[18] = ""; // Order based on S
                                                    data[19] = ""; // Rounding option T
                                                    data[20] = userQty; // User Qty U
                                                    data[21] = `=IF(S${parseInt(i) + 1}==3,

                                                                IF(T${parseInt(i) + 1}==1,
                                                                        CEILING(L${parseInt(i) + 1},1),
                                                                        FLOOR(L${parseInt(i) + 1},1)
                                                                )
                                                        ,
                                                        IF(S${parseInt(i) + 1}==4,
                                                                IF(NOT(ISBLANK(U${parseInt(i) + 1})),
                                                                        IF(T${parseInt(i) + 1}==1,
                                                                                CEILING(U${parseInt(i) + 1}/M${parseInt(i) + 1},1)*M${parseInt(i) + 1},
                                                                                FLOOR(U${parseInt(i) + 1}/M${parseInt(i) + 1},1)*M${parseInt(i) + 1}
                                                                        ),
                                                                        IF(T${parseInt(i) + 1}==1,
                                                                                CEILING(ROUND(IF(M${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/M${parseInt(i) + 1},L${parseInt(i) + 1}/M${parseInt(i) + 1}),0),2),1)*M${parseInt(i) + 1},
                                                                                FLOOR(ROUND(IF(M${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/M${parseInt(i) + 1},L${parseInt(i) + 1}/M${parseInt(i) + 1}),0),2),1)*M${parseInt(i) + 1}
                                                                        )
                                                                ),
                                                                IF(S${parseInt(i) + 1}==5,
                                                                IF(NOT(ISBLANK(U${parseInt(i) + 1})),
                                                                        IF(T${parseInt(i) + 1}==1,
                                                                                CEILING(U${parseInt(i) + 1}/N${parseInt(i) + 1},1)*N${parseInt(i) + 1},
                                                                                FLOOR(U${parseInt(i) + 1}/N${parseInt(i) + 1},1)*N${parseInt(i) + 1}
                                                                        ),
                                                                        IF(T${parseInt(i) + 1}==1,
                                                                                CEILING(ROUND(IF(N${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/N${parseInt(i) + 1},L${parseInt(i) + 1}/N${parseInt(i) + 1}),0),2),1)*N${parseInt(i) + 1},
                                                                                FLOOR(ROUND(IF(N${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/N${parseInt(i) + 1},L${parseInt(i) + 1}/N${parseInt(i) + 1}),0),2),1)*N${parseInt(i) + 1}
                                                                        )
                                                                ),
                                                                IF(S${parseInt(i) + 1}==1,
                                                                        IF(NOT(ISBLANK(U${parseInt(i) + 1})),
                                                                                IF(T${parseInt(i) + 1}==1,
                                                                                CEILING(U${parseInt(i) + 1}/O${parseInt(i) + 1},1)*O${parseInt(i) + 1},
                                                                                FLOOR(U${parseInt(i) + 1}/O${parseInt(i) + 1},1)*O${parseInt(i) + 1}
                                                                        ),
                                                                                IF(T${parseInt(i) + 1}==1,
                                                                                        CEILING(ROUND(IF(O${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/O${parseInt(i) + 1},L${parseInt(i) + 1}/O${parseInt(i) + 1}),0),2),1)*O${parseInt(i) + 1},
                                                                                        FLOOR(ROUND(IF(O${parseInt(i) + 1}!=0,IF(K${parseInt(i) + 1}>L${parseInt(i) + 1},K${parseInt(i) + 1}/O${parseInt(i) + 1},L${parseInt(i) + 1}/O${parseInt(i) + 1}),0),2),1)*O${parseInt(i) + 1}
                                                                                )
                                                                        ),
                                                                        IF(NOT(ISBLANK(U${parseInt(i) + 1})),
                                                                                IF(T${parseInt(i) + 1}==1,
                                                                                        CEILING(U${parseInt(i) + 1},1),
                                                                                        FLOOR(U${parseInt(i) + 1},1)
                                                                                ),
                                                                                IF(T${parseInt(i) + 1}==1,
                                                                                        CEILING(K${parseInt(i) + 1},1),
                                                                                        FLOOR(K${parseInt(i) + 1},1)
                                                                                )
                                                                        )
                                                                )
                                                        )
                                                        )
                                                 )`;  // V
                                                    data[22] = `=ROUND(IF(M${parseInt(i) + 1}!=0,(V${parseInt(i) + 1}/M${parseInt(i) + 1}),0),2)`; //W
                                                    data[23] = `=ROUND(IF(N${parseInt(i) + 1}!=0,(V${parseInt(i) + 1}/N${parseInt(i) + 1}),0),2)`; //X
                                                    data[24] = `=ROUND(IF(O${parseInt(i) + 1}!=0,(V${parseInt(i) + 1}/O${parseInt(i) + 1}),0),2)`; //Y
                                                    data[25] = shipmentList[i].rate;//Manual price Z
                                                    data[26] = shipmentList[i].procurementUnit.id; //AA
                                                    data[27] = shipmentList[i].supplier.id; //AB
                                                    data[28] = `=ROUND(${pricePerUnit}/G${parseInt(i) + 1},2)`; //AC
                                                    data[29] = `=ROUND(IF(AND(NOT(ISBLANK(Z${parseInt(i) + 1})),(Z${parseInt(i) + 1} != 0)),Z${parseInt(i) + 1},AC${parseInt(i) + 1})*V${parseInt(i) + 1},2)`; //Amount AD
                                                    data[30] = shipmentMode;//Shipment method AE
                                                    data[31] = shipmentList[i].freightCost;// Freight Cost AF
                                                    data[32] = `=ROUND(IF(AE${parseInt(i) + 1}==1,(AD${parseInt(i) + 1}*AK${parseInt(i) + 1})/100,(AD${parseInt(i) + 1}*AJ${parseInt(i) + 1})/100),2)`;// Default frieght cost AG
                                                    data[33] = `=ROUND(AD${parseInt(i) + 1}+IF(AND(NOT(ISBLANK(AF${parseInt(i) + 1})),(AF${parseInt(i) + 1}!= 0)),AF${parseInt(i) + 1},AG${parseInt(i) + 1}),2)`; // Final Amount AE
                                                    data[34] = shipmentList[i].notes;//Notes AI
                                                    data[35] = airFreightPerc; //AJ
                                                    data[36] = seaFreightPerc; //AK
                                                    var index;
                                                    if (shipmentList[i].shipmentId != 0) {
                                                        index = shipmentListUnFiltered.findIndex(c => c.shipmentId == shipmentList[i].shipmentId);
                                                    } else {
                                                        index = shipmentList[i].index;
                                                    }
                                                    data[37] = index; // AL
                                                    data[38] = shipmentList[i].shipmentStatus.id; //AM
                                                    data[39] = supplyPlanType; //AN
                                                    data[40] = shipmentList[i].accountFlag; //AO
                                                    data[41] = shipmentList[i].emergencyOrder; //AP
                                                    data[42] = shipmentList[i].active; //AQ
                                                    data[43] = shipmentList[i].batchInfoList; //AR
                                                    data[44] = totalShipmentQty; //AS
                                                    data[45] = shipmentList[i].erpFlag; //AT
                                                    shipmentsArr.push(data);
                                                }
                                                var options = {
                                                    data: shipmentsArr,
                                                    columns: [
                                                        { type: 'calendar', options: { format: 'MM-DD-YYYY', validRange: [moment(Date.now()).format("YYYY-MM-DD"), null] }, title: i18n.t('static.supplyPlan.expectedDeliveryDate'), width: 100 },
                                                        { type: 'dropdown', title: i18n.t('static.supplyPlan.shipmentStatus'), source: shipmentStatusList, filter: this.shipmentStatusDropdownFilter, width: 100 },
                                                        { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.orderNoAndPrimeLineNo'), width: 150 },
                                                        { type: 'dropdown', title: i18n.t('static.datasource.datasource'), source: dataSourceList, width: 150 },
                                                        { type: 'dropdown', title: i18n.t('static.procurementagent.procurementagent'), source: procurementAgentList, width: 120 },
                                                        { type: 'dropdown', readOnly: true, title: i18n.t('static.dashboard.currency'), source: currencyList, width: 120 },
                                                        { type: 'text', readOnly: true, title: i18n.t('static.currency.conversionrateusd'), width: 80 },
                                                        { type: 'dropdown', title: i18n.t('static.subfundingsource.fundingsource'), source: fundingSourceList, width: 120 },
                                                        { type: 'dropdown', title: i18n.t('static.dashboard.budget'), source: budgetList, filter: this.budgetDropdownFilter, width: 120 },
                                                        { type: 'text', readOnly: true, title: i18n.t('static.planningunit.planningunit'), width: 150 },
                                                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.suggestedOrderQty'), mask: '#,##', width: 80 },
                                                        { type: 'numeric', readOnly: true, title: i18n.t('static.procurementAgentPlanningUnit.moq'), mask: '#,##', width: 80 },
                                                        { type: 'hidden', title: i18n.t('static.procurementAgentPlanningUnit.unitPerPalletEuro1'), width: 0 },
                                                        { type: 'hidden', title: i18n.t('static.procurementAgentPlanningUnit.unitPerPalletEuro2'), width: 0 },
                                                        { type: 'hidden', title: i18n.t('static.procurementUnit.unitsPerContainer'), width: 0 },
                                                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.noOfPalletsEuro1'), width: 80, mask: '#,##.00', decimal: '.' },
                                                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.noOfPalletsEuro2'), width: 80, mask: '#,##.00', decimal: '.' },
                                                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.noOfContainers'), width: 80, mask: '#,##.00', decimal: '.' },
                                                        { type: 'dropdown', title: i18n.t('static.supplyPlan.orderBasedOn'), source: [{ id: 1, name: i18n.t('static.supplyPlan.container') }, { id: 2, name: i18n.t('static.supplyPlan.suggestedOrderQty') }, { id: 3, name: i18n.t('static.procurementAgentPlanningUnit.moq') }, { id: 4, name: i18n.t('static.supplyPlan.palletEuro1') }, { id: 5, name: i18n.t('static.supplyPlan.palletEuro2') }], width: 120, filter: this.filterOrderBasedOn },
                                                        { type: 'dropdown', title: i18n.t('static.supplyPlan.roundingOption'), source: [{ id: 1, name: i18n.t('static.supplyPlan.roundUp') }, { id: 2, name: i18n.t('static.supplyPlan.roundDown') }], width: 120 },
                                                        { type: 'numeric', title: i18n.t('static.supplyPlan.userQty'), width: 80, mask: '#,##' },
                                                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.adjustesOrderQty'), width: 80, mask: '#,##' },
                                                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.adjustedPalletsEuro1'), width: 80, mask: '#,##.00', decimal: '.' },
                                                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.adjustedPalletsEuro2'), width: 80, mask: '#,##.00', decimal: '.' },
                                                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.adjustedContainers'), width: 80, mask: '#,##.00', decimal: '.' },
                                                        { type: 'numeric', title: i18n.t("static.supplyPlan.userPrice"), width: 80, mask: '#,##.00', decimal: '.' },
                                                        { type: 'dropdown', title: i18n.t('static.procurementUnit.procurementUnit'), source: procurementUnitList, filter: this.procurementUnitDropdownFilter, width: 120 },
                                                        { type: 'dropdown', title: i18n.t('static.procurementUnit.supplier'), source: supplierList, width: 120, readOnly: true },
                                                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.pricePerPlanningUnit'), width: 80, mask: '#,##.00', decimal: '.' },
                                                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.amountInUSD'), width: 80, mask: '#,##.00', decimal: '.' },
                                                        { type: 'dropdown', title: i18n.t("static.supplyPlan.shipmentMode"), source: [{ id: 1, name: i18n.t('static.supplyPlan.sea') }, { id: 2, name: i18n.t('static.supplyPlan.air') }], width: 100 },
                                                        { type: 'numeric', title: i18n.t('static.supplyPlan.userFreight'), width: 80, mask: '#,##.00', decimal: '.' },
                                                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.defaultFreight'), width: 80, mask: '#,##.00', decimal: '.' },
                                                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.totalAmount'), width: 80, mask: '#,##.00', decimal: '.' },
                                                        { type: 'text', title: i18n.t('static.program.notes'), width: 200 },
                                                        { type: 'hidden', title: i18n.t('static.realmcountry.airFreightPercentage'), width: 0 },
                                                        { type: 'hidden', title: i18n.t('static.realmcountry.seaFreightPercentage'), width: 0 },
                                                        { type: 'hidden', title: i18n.t('static.supplyPlan.index'), width: 0 },
                                                        { type: 'hidden', title: i18n.t('static.supplyPlan.shipmentStatus'), width: 0 },
                                                        { type: 'hidden', title: i18n.t('static.supplyPlan.supplyPlanType'), width: 0 },
                                                        { type: 'checkbox', title: i18n.t('static.common.accountFlag'), width: 60 },
                                                        { type: 'checkbox', title: i18n.t('static.supplyPlan.emergencyOrder'), width: 60 },
                                                        { type: 'checkbox', title: i18n.t('static.common.active'), width: 60 },
                                                        { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 0 },
                                                        { type: 'hidden', title: i18n.t('static.supplyPlan.totalQtyBatchInfo'), width: 0 },
                                                        { type: 'hidden', title: i18n.t('static.supplyPlan.erpFlag'), width: 0 },
                                                    ],
                                                    pagination: false,
                                                    search: false,
                                                    columnSorting: true,
                                                    tableOverflow: true,
                                                    wordWrap: true,
                                                    allowInsertColumn: false,
                                                    allowManualInsertColumn: false,
                                                    allowDeleteRow: false,
                                                    allowInsertRow: false,
                                                    allowManualInsertRow: false,
                                                    copyCompatibility: true,
                                                    editable: tableEditableBasedOnSupplyPlan,
                                                    onchange: this.shipmentChanged,
                                                    text: {
                                                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                        show: '',
                                                        entries: '',
                                                    },
                                                    onload: this.loadedShipments,
                                                    updateTable: function (el, cell, x, y, source, value, id) {
                                                        var elInstance = el.jexcel;
                                                        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
                                                            'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
                                                            'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG',
                                                            'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ']
                                                        var rowData = elInstance.getRowData(y);
                                                        var unitsPerPalletEuro1ForUpdate = rowData[12];
                                                        var unitsPerPalletEuro2ForUpdate = rowData[13];
                                                        var unitsPerContainerForUpdate = rowData[14];
                                                        var shipmentStatus = rowData[38];
                                                        var erpFlag = rowData[45];
                                                        if (shipmentStatus == DELIVERED_SHIPMENT_STATUS || erpFlag == true) {
                                                            for (var i = 0; i < colArr.length; i++) {
                                                                var cell = elInstance.getCell(`${colArr[i]}${parseInt(y) + 1}`)
                                                                cell.classList.add('readonly');
                                                            }
                                                        } else {
                                                            if (unitsPerPalletEuro1ForUpdate == 0 || unitsPerContainerForUpdate == 0) {
                                                                var cell = elInstance.getCell(`S${parseInt(y) + 1}`)
                                                                cell.classList.add('readonly');
                                                                var cell = elInstance.getCell(`T${parseInt(y) + 1}`)
                                                                cell.classList.add('readonly');
                                                                var cell = elInstance.getCell(`U${parseInt(y) + 1}`)
                                                                cell.classList.add('readonly');
                                                            } else {
                                                                var cell = elInstance.getCell(`S${parseInt(y) + 1}`)
                                                                cell.classList.remove('readonly');
                                                                var cell = elInstance.getCell(`T${parseInt(y) + 1}`)
                                                                cell.classList.remove('readonly');
                                                                var cell = elInstance.getCell(`U${parseInt(y) + 1}`)
                                                                cell.classList.remove('readonly');
                                                            }
                                                        }
                                                    }.bind(this),
                                                    contextMenu: function (obj, x, y, e) {
                                                        var items = [];

                                                        // Add shipment batch info
                                                        var rowData = obj.getRowData(y);
                                                        var expectedDeliveryDate = moment(rowData[0]).format("YYYY-MM-DD");
                                                        var expiryDate = moment(expectedDeliveryDate).add(this.state.shelfLife, 'months').format("YYYY-MM-DD");
                                                        var readOnlyBatchInfo = false;
                                                        if (rowData[38] != DELIVERED_SHIPMENT_STATUS) {
                                                            readOnlyBatchInfo = true
                                                        }
                                                        if ((rowData[1] == DELIVERED_SHIPMENT_STATUS || rowData[1] == SHIPPED_SHIPMENT_STATUS || rowData[1] == ARRIVED_SHIPMENT_STATUS)) {
                                                            items.push({
                                                                title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                                                onclick: function () {
                                                                    document.getElementById("showShipmentBatchInfoButtonsDiv").style.display = 'block';
                                                                    this.el = jexcel(document.getElementById("shipmentBatchInfoTable"), '');
                                                                    this.el.destroy();
                                                                    var json = [];
                                                                    // var elInstance=this.state.plannedPsmShipmentsEl;
                                                                    var rowData = obj.getRowData(y)
                                                                    var batchInfo = rowData[43];
                                                                    var cell = obj.getCell(`A${parseInt(y) + 1}`)
                                                                    cell.classList.add('readonly');
                                                                    for (var sb = 0; sb < batchInfo.length; sb++) {
                                                                        var data = [];
                                                                        data[0] = batchInfo[sb].batch.batchNo;
                                                                        data[1] = batchInfo[sb].batch.expiryDate;
                                                                        data[2] = batchInfo[sb].shipmentQty;
                                                                        data[3] = batchInfo[sb].shipmentTransBatchInfoId;
                                                                        data[4] = y;
                                                                        data[5] = this.state.batchInfoListAll.findIndex(c => c.batchNo == batchInfo[sb].batch.batchNo)
                                                                        json.push(data);
                                                                    }
                                                                    if (batchInfo.length == 0) {
                                                                        var data = [];
                                                                        data[0] = "";
                                                                        data[1] = expiryDate;
                                                                        data[2] = ""
                                                                        data[3] = 0;
                                                                        data[4] = y;
                                                                        data[5] = -1;
                                                                        json.push(data)
                                                                    }
                                                                    var options = {
                                                                        data: json,
                                                                        columnDrag: true,
                                                                        colWidths: [100, 150, 100],
                                                                        columns: [
                                                                            {
                                                                                title: i18n.t('static.supplyPlan.batchId'),
                                                                                type: 'text',
                                                                            },
                                                                            {
                                                                                title: i18n.t('static.supplyPlan.expiryDate'),
                                                                                type: 'calendar',
                                                                                options: {
                                                                                    format: 'MM-DD-YYYY',
                                                                                    validRange: [moment(Date.now()).format("YYYY-MM-DD"), null]
                                                                                }
                                                                            },
                                                                            {
                                                                                title: i18n.t('static.supplyPlan.shipmentQty'),
                                                                                type: 'numeric',
                                                                                mask: '#,##'
                                                                            },
                                                                            {
                                                                                title: i18n.t('static.supplyPlan.shipmentTransBatchInfoId'),
                                                                                type: 'hidden',
                                                                            },
                                                                            {
                                                                                title: i18n.t('static.supplyPlan.rowNumber'),
                                                                                type: 'hidden',
                                                                            },
                                                                            {
                                                                                title: i18n.t('static.supplyPlan.index'),
                                                                                type: 'hidden',
                                                                            }
                                                                        ],
                                                                        pagination: false,
                                                                        search: false,
                                                                        columnSorting: true,
                                                                        tableOverflow: true,
                                                                        wordWrap: true,
                                                                        allowInsertColumn: false,
                                                                        allowManualInsertColumn: false,
                                                                        allowDeleteRow: false,
                                                                        oneditionend: this.onedit,
                                                                        copyCompatibility: true,
                                                                        allowInsertRow: readOnlyBatchInfo,
                                                                        allowManualInsertRow: false,
                                                                        editable: readOnlyBatchInfo,
                                                                        onchange: this.batchInfoChangedShipment,
                                                                        text: {
                                                                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                                            show: '',
                                                                            entries: '',
                                                                        },
                                                                        onload: this.loadedBatchInfoShipment,
                                                                        contextMenu: function (obj, x, y, e) {
                                                                            var items = [];
                                                                            if (y == null) {
                                                                                // Insert a new column
                                                                                if (obj.options.allowInsertColumn == true) {
                                                                                    items.push({
                                                                                        title: obj.options.text.insertANewColumnBefore,
                                                                                        onclick: function () {
                                                                                            obj.insertColumn(1, parseInt(x), 1);
                                                                                        }
                                                                                    });
                                                                                }

                                                                                if (obj.options.allowInsertColumn == true) {
                                                                                    items.push({
                                                                                        title: obj.options.text.insertANewColumnAfter,
                                                                                        onclick: function () {
                                                                                            obj.insertColumn(1, parseInt(x), 0);
                                                                                        }
                                                                                    });
                                                                                }

                                                                                // Delete a column
                                                                                if (obj.options.allowDeleteColumn == true) {
                                                                                    items.push({
                                                                                        title: obj.options.text.deleteSelectedColumns,
                                                                                        onclick: function () {
                                                                                            obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
                                                                                        }
                                                                                    });
                                                                                }

                                                                                // Rename column
                                                                                if (obj.options.allowRenameColumn == true) {
                                                                                    items.push({
                                                                                        title: obj.options.text.renameThisColumn,
                                                                                        onclick: function () {
                                                                                            obj.setHeader(x);
                                                                                        }
                                                                                    });
                                                                                }

                                                                                // Sorting
                                                                                if (obj.options.columnSorting == true) {
                                                                                    // Line
                                                                                    items.push({ type: 'line' });

                                                                                    items.push({
                                                                                        title: obj.options.text.orderAscending,
                                                                                        onclick: function () {
                                                                                            obj.orderBy(x, 0);
                                                                                        }
                                                                                    });
                                                                                    items.push({
                                                                                        title: obj.options.text.orderDescending,
                                                                                        onclick: function () {
                                                                                            obj.orderBy(x, 1);
                                                                                        }
                                                                                    });
                                                                                }
                                                                            } else {
                                                                                // Insert new row
                                                                                if (obj.options.allowInsertRow == true) {
                                                                                    items.push({
                                                                                        title: i18n.t('static.supplyPlan.addNewBatchInfo'),
                                                                                        onclick: function () {
                                                                                            var data = [];
                                                                                            data[0] = "";
                                                                                            data[1] = expiryDate;
                                                                                            data[2] = "";
                                                                                            data[3] = 0;
                                                                                            data[4] = y;
                                                                                            data[5] = -1;
                                                                                            obj.insertRow(data);
                                                                                        }
                                                                                    });
                                                                                }

                                                                                if (obj.options.allowDeleteRow == true) {
                                                                                    items.push({
                                                                                        title: obj.options.text.deleteSelectedRows,
                                                                                        onclick: function () {
                                                                                            obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
                                                                                        }
                                                                                    });
                                                                                }

                                                                                if (x) {
                                                                                    if (obj.options.allowComments == true) {
                                                                                        items.push({ type: 'line' });

                                                                                        var title = obj.records[y][x].getAttribute('title') || '';

                                                                                        items.push({
                                                                                            title: title ? obj.options.text.editComments : obj.options.text.addComments,
                                                                                            onclick: function () {
                                                                                                obj.setComments([x, y], prompt(obj.options.text.comments, title));
                                                                                            }
                                                                                        });

                                                                                        if (title) {
                                                                                            items.push({
                                                                                                title: obj.options.text.clearComments,
                                                                                                onclick: function () {
                                                                                                    obj.setComments([x, y], '');
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }

                                                                            // Line
                                                                            items.push({ type: 'line' });

                                                                            // Save
                                                                            if (obj.options.allowExport) {
                                                                                items.push({
                                                                                    title: i18n.t('static.supplyPlan.exportAsCsv'),
                                                                                    shortcut: 'Ctrl + S',
                                                                                    onclick: function () {
                                                                                        obj.download(true);
                                                                                    }
                                                                                });
                                                                            }

                                                                            return items;
                                                                        }.bind(this)

                                                                    };
                                                                    var elVar = jexcel(document.getElementById("shipmentBatchInfoTable"), options);
                                                                    this.el = elVar;
                                                                    this.setState({ shipmentBatchInfoTableEl: elVar });
                                                                }.bind(this)
                                                                // this.setState({ shipmentBudgetTableEl: elVar });
                                                            });
                                                        }
                                                        // -------------------------------------

                                                        if (y == null) {
                                                            // Insert a new column
                                                            if (obj.options.allowInsertColumn == true) {
                                                                items.push({
                                                                    title: obj.options.text.insertANewColumnBefore,
                                                                    onclick: function () {
                                                                        obj.insertColumn(1, parseInt(x), 1);
                                                                    }
                                                                });
                                                            }

                                                            if (obj.options.allowInsertColumn == true) {
                                                                items.push({
                                                                    title: obj.options.text.insertANewColumnAfter,
                                                                    onclick: function () {
                                                                        obj.insertColumn(1, parseInt(x), 0);
                                                                    }
                                                                });
                                                            }

                                                            // Delete a column
                                                            if (obj.options.allowDeleteColumn == true) {
                                                                items.push({
                                                                    title: obj.options.text.deleteSelectedColumns,
                                                                    onclick: function () {
                                                                        obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
                                                                    }
                                                                });
                                                            }



                                                            // Rename column
                                                            if (obj.options.allowRenameColumn == true) {
                                                                items.push({
                                                                    title: obj.options.text.renameThisColumn,
                                                                    onclick: function () {
                                                                        obj.setHeader(x);
                                                                    }
                                                                });
                                                            }

                                                            // Sorting
                                                            if (obj.options.columnSorting == true) {
                                                                // Line
                                                                items.push({ type: 'line' });

                                                                items.push({
                                                                    title: obj.options.text.orderAscending,
                                                                    onclick: function () {
                                                                        obj.orderBy(x, 0);
                                                                    }
                                                                });
                                                                items.push({
                                                                    title: obj.options.text.orderDescending,
                                                                    onclick: function () {
                                                                        obj.orderBy(x, 1);
                                                                    }
                                                                });
                                                            }
                                                        } else {
                                                            // Insert new row
                                                            if (obj.options.allowInsertRow == true) {
                                                                items.push({
                                                                    title: obj.options.text.insertANewRowBefore,
                                                                    onclick: function () {
                                                                        obj.insertRow(1, parseInt(y), 1);
                                                                    }
                                                                });

                                                                items.push({
                                                                    title: obj.options.text.insertANewRowAfter,
                                                                    onclick: function () {
                                                                        obj.insertRow(1, parseInt(y));
                                                                    }
                                                                });
                                                            }

                                                            if (obj.options.allowDeleteRow == true) {
                                                                items.push({
                                                                    title: obj.options.text.deleteSelectedRows,
                                                                    onclick: function () {
                                                                        obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
                                                                    }
                                                                });
                                                            }

                                                            if (x) {
                                                                if (obj.options.allowComments == true) {
                                                                    items.push({ type: 'line' });

                                                                    var title = obj.records[y][x].getAttribute('title') || '';

                                                                    items.push({
                                                                        title: title ? obj.options.text.editComments : obj.options.text.addComments,
                                                                        onclick: function () {
                                                                            obj.setComments([x, y], prompt(obj.options.text.comments, title));
                                                                        }
                                                                    });

                                                                    if (title) {
                                                                        items.push({
                                                                            title: obj.options.text.clearComments,
                                                                            onclick: function () {
                                                                                obj.setComments([x, y], '');
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            }
                                                        }

                                                        // Line
                                                        items.push({ type: 'line' });

                                                        // Save
                                                        if (obj.options.allowExport) {
                                                            items.push({
                                                                title: i18n.t('static.supplyPlan.exportAsCsv'),
                                                                shortcut: 'Ctrl + S',
                                                                onclick: function () {
                                                                    obj.download(true);
                                                                }
                                                            });
                                                        }
                                                        return items;
                                                    }.bind(this)
                                                };
                                                myVar = jexcel(document.getElementById("shipmentsDetailsTable"), options);
                                                this.el = myVar;
                                                // submitted shipments
                                                this.setState({
                                                    shipmentsEl: myVar,
                                                    shipmentBudgetTableEl: elVar,
                                                    shipmentChangedFlag: 0,
                                                    budgetChangedFlag: 0
                                                })
                                            }.bind(this)
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

    loadedBatchInfoShipment = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    batchInfoChangedShipment = function (instance, cell, x, y, value) {
        this.setState({
            shipmentValidationBatchError: ''
        })
        var elInstance = instance.jexcel;
        if (x == 0) {
            this.setState({
                shipmentBatchInfoDuplicateError: ''
            })
            var col = ("A").concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
        }

        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }
        if (x == 2) {
            var reg = /^[0-9\b]+$/;
            var col = ("C").concat(parseInt(y) + 1);
            value = value.toString().replaceAll("\,", "");
            if (value == "" || value == 0) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }
        }
        this.setState({
            shipmentBatchInfoChangedFlag: 1
        })
    }.bind(this)

    checkValidationShipmentBatchInfo() {
        var valid = true;
        var elInstance = this.state.shipmentBatchInfoTableEl;
        var json = elInstance.getJson();
        var mapArray = [];
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);

            var batchInfoList = this.state.batchInfoListAll;
            var checkDuplicate = batchInfoList.filter(c =>
                c.batchNo == map.get("0")
            )
            var index = batchInfoList.findIndex(c =>
                c.batchNo == map.get("0")
            );

            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("0") == map.get("0")
            )

            if ((checkDuplicate.length >= 1 && index != map.get("5")) || checkDuplicateInMap.length > 1) {
                var colArr = ['A'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.supplyPlan.duplicateBatchNumber'));
                }
                valid = false;
                this.setState({
                    shipmentBatchInfoDuplicateError: i18n.t('static.supplyPlan.duplicateBatchNumber')
                })
            } else {

                var colArr = ['A'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("B").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(1, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("C").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(2, y);
                value = value.toString().replaceAll("\,", "");
                var reg = /^[0-9\b]+$/;
                if (value === "" || isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }


            }
        }
        return valid;
    }

    saveShipmentBatchInfo() {
        var validation = this.checkValidationShipmentBatchInfo();
        if (validation == true) {
            var elInstance = this.state.shipmentBatchInfoTableEl;
            var json = elInstance.getJson();
            var batchInfoArray = [];
            var rowNumber = 0;
            var totalShipmentQty = 0;
            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                if (i == 0) {
                    rowNumber = map.get("4");
                }
                var shipmentInstance = this.state.shipmentsEl;
                var rowData = shipmentInstance.getRowData(parseInt(rowNumber));
                var batchNo = "";
                if (map.get("0") != "") {
                    batchNo = map.get("0");
                } else {
                    batchNo = "QAT".concat(rowData[34]).concat(this.state.versionId).concat(AuthenticationService.getLoggedInUserId());
                }
                var batchInfoJson = {
                    shipmentTransBatchInfoId: map.get("3"),
                    batch: {
                        batchNo: batchNo,
                        expiryDate: moment(map.get("1")).format("YYYY-MM-DD"),
                        batchId: 0
                    },
                    shipmentQty: map.get("2").toString().replaceAll("\,", "")
                }
                batchInfoArray.push(batchInfoJson);
                totalShipmentQty += parseInt(map.get("2").toString().replaceAll("\,", ""))
            }

            rowData[43] = batchInfoArray;
            rowData[44] = totalShipmentQty;
            shipmentInstance.setValueFromCoords(43, rowNumber, batchInfoArray, true);
            shipmentInstance.setValueFromCoords(44, rowNumber, totalShipmentQty, true);
            this.setState({
                shipmentChangedFlag: 1,
                shipmentBatchInfoChangedFlag: 0,
                shipmentBatchInfoTableEl: ''
            })
            var cell = shipmentInstance.getCell(`A${parseInt(rowNumber) + 1}`)
            cell.classList.remove('readonly');
            document.getElementById("showShipmentBatchInfoButtonsDiv").style.display = 'none';
            elInstance.destroy();
        } else {
            this.setState({
                shipmentValidationBatchError: i18n.t('static.supplyPlan.validationFailed')
            })
        }
    }

    loadedShipments = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    shipmentChanged = function (instance, cell, x, y, value) {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var elInstance = this.state.shipmentsEl;
        this.setState({
            shipmentError: '',
            shipmentDuplicateError: '',
            noFundsBudgetError: ''
        })

        if (x == 8 || x == 33) {
            var col = ("I").concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
            var col = ("AH").concat(parseInt(y) + 1);
            if (value != "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                // if (isNaN(Date.parse(value))) {
                //     elInstance.setStyle(col, "background-color", "transparent");
                //     elInstance.setStyle(col, "background-color", "yellow");
                //     elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                // } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var valueOfF = elInstance.getValueFromCoords(5, y);
                if (valueOfF != "") {
                    var col1 = ("F").concat(parseInt(y) + 1);
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }

                // }
            }
        }

        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            var col1 = ("AA").concat(parseInt(y) + 1);
            var col2 = ("AB").concat(parseInt(y) + 1);
            var col3 = ("I").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (value == DELIVERED_SHIPMENT_STATUS || value == SHIPPED_SHIPMENT_STATUS || value == ARRIVED_SHIPMENT_STATUS) {
                    var procurementUnit = elInstance.getValueFromCoords(26, y);
                    var supplier = elInstance.getValueFromCoords(27, y);
                    if (procurementUnit == "") {
                        elInstance.setStyle(col1, "background-color", "transparent");
                        elInstance.setStyle(col1, "background-color", "yellow");
                        elInstance.setComments(col1, i18n.t('static.label.fieldRequired'));
                    } else {
                        elInstance.setStyle(col1, "background-color", "transparent");
                        elInstance.setComments(col1, "");
                    }

                    if (supplier == "") {
                        elInstance.setStyle(col2, "background-color", "transparent");
                        elInstance.setStyle(col2, "background-color", "yellow");
                        elInstance.setComments(col2, i18n.t('static.label.fieldRequired'));
                    } else {
                        elInstance.setStyle(col2, "background-color", "transparent");
                        elInstance.setComments(col2, "");
                    }
                } else if (value == SUBMITTED_SHIPMENT_STATUS) {
                    var budget = elInstance.getValueFromCoords(8, y);
                    if (budget == "") {
                        elInstance.setStyle(col3, "background-color", "transparent");
                        elInstance.setStyle(col3, "background-color", "yellow");
                        elInstance.setComments(col3, i18n.t('static.label.fieldRequired'));
                    } else {
                        elInstance.setStyle(col3, "background-color", "transparent");
                        elInstance.setComments(col3, "");
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                    elInstance.setStyle(col2, "background-color", "transparent");
                    elInstance.setComments(col2, "");
                    elInstance.setStyle(col3, "background-color", "transparent");
                    elInstance.setComments(col3, "");
                }
            }
        }

        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                elInstance.setValueFromCoords(26, y, "", true);
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var procurementAgentPlanningUnit = this.state.procurementAgentListAll.filter(c => c.procurementAgent.id == value && c.planningUnit.id == planningUnitId)[0];
                var procurementUnitValue = elInstance.getRowData(y)[26];
                var pricePerUnit = procurementAgentPlanningUnit.catalogPrice;
                if (procurementUnitValue != "") {
                    var procurementUnit = this.state.procurementUnitListAll.filter(p => p.procurementUnit.id == procurementUnitValue && p.procurementAgent.id == value)[0];
                    if (procurementUnit.vendorPrice != 0 && procurementUnit.vendorPrice != null) {
                        pricePerUnit = procurementUnit.vendorPrice;
                    }
                }
                var conversionRateToUsd = elInstance.getValueFromCoords(6, y);
                pricePerUnit = (pricePerUnit / conversionRateToUsd).toFixed(2);
                elInstance.setValueFromCoords(11, y, procurementAgentPlanningUnit.moq, true);
                elInstance.setValueFromCoords(28, y, pricePerUnit, true);
                elInstance.setValueFromCoords(12, y, procurementAgentPlanningUnit.unitsPerPalletEuro1, true);
                elInstance.setValueFromCoords(13, y, procurementAgentPlanningUnit.unitsPerPalletEuro2, true);
                elInstance.setValueFromCoords(14, y, procurementAgentPlanningUnit.unitsPerContainer, true);
                if (procurementAgentPlanningUnit.unitsPerPalletEuro1 == 0 || procurementAgentPlanningUnit.unitsPerContainer == 0) {
                    elInstance.setValueFromCoords(18, y, "", true);
                    elInstance.setValueFromCoords(19, y, "", true);
                    elInstance.setValueFromCoords(20, y, "", true);
                }
            }
            elInstance.setValueFromCoords(26, y, "", true);
        }

        if (x == 7) {
            var col = ("H").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 20) {
            var col = ("U").concat(parseInt(y) + 1);
            value = value.toString().replaceAll("\,", "");
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            } else {
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }

        if (x == 25) {
            var col = ("Z").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            } else {
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }
        }

        if (x == 26) {
            elInstance.setValueFromCoords(27, y, "", true);
            if (value != "") {
                // Logic for Procurement Unit on change
                var valueOfF = elInstance.getRowData(y)[4];
                if (valueOfF != "") {
                    var procurementUnit = this.state.procurementUnitListAll.filter(p => p.procurementUnit.id == value && p.procurementAgent.id == valueOfF)[0];

                    var pu = this.state.procurementListForSupplier.filter(c => c.procurementUnitId == value)[0];
                    var supplier = pu.supplier.id;
                    var conversionRateToUsd = elInstance.getValueFromCoords(6, y);
                    if (procurementUnit.vendorPrice != 0 && procurementUnit.vendorPrice != null) {
                        pricePerUnit = procurementUnit.vendorPrice;
                        pricePerUnit = (pricePerUnit / conversionRateToUsd).toFixed(2);
                        elInstance.setValueFromCoords(28, y, pricePerUnit, true);
                    }
                    elInstance.setValueFromCoords(27, y, supplier, true);
                }
            }

            var shipmentStatus = elInstance.getRowData(y)[1];
            var col1 = ("AA").concat(parseInt(y) + 1);
            if (shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                var procurementUnit = value;
                if (procurementUnit == "") {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setStyle(col1, "background-color", "yellow");
                    elInstance.setComments(col1, i18n.t('static.label.fieldRequired'));
                } else {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }
            } else {
                elInstance.setStyle(col1, "background-color", "transparent");
                elInstance.setComments(col1, "");
            }
        }

        if (x == 27) {
            var shipmentStatus = elInstance.getRowData(y)[1];
            var col1 = ("AB").concat(parseInt(y) + 1);
            if (shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                var supplier = value;
                if (supplier == "") {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setStyle(col1, "background-color", "yellow");
                    elInstance.setComments(col1, i18n.t('static.label.fieldRequired'));
                } else {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }
            } else {
                elInstance.setStyle(col1, "background-color", "transparent");
                elInstance.setComments(col1, "");
            }
        }

        if (x == 30) {
            var col = ("AE").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 31) {
            var col = ("AF").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            } else {
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }
        }

        if (x == 44) {
            if (value != 0) {
                var adjustedQty = ((elInstance.getCell(`V${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", "");
                if (value != adjustedQty) {
                    var col = ("V").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.supplyPlan.batchNumberMissing'));
                    this.setState({
                        shipmentBatchError: i18n.t('static.supplyPlan.batchNumberMissing'),
                    })
                } else {
                    var col = ("V").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, '');
                    this.setState({
                        shipmentBatchError: '',
                    })
                }
            }
        }

        this.setState({
            shipmentChangedFlag: 1
        });
    }

    checkValidationForShipments() {
        var valid = true;
        var elInstance = this.state.shipmentsEl;
        var json = elInstance.getJson();
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            if (map.get("8") != "") {
                var budget = this.state.budgetListAll.filter(c => c.budgetId == map.get("8"))[0]
                var totalBudget = budget.budgetAmt * budget.currency.conversionRateToUsd;
                var shipmentList = this.state.shipmentListUnFiltered.filter(c => c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.active == true && c.budget.id == map.get("8"));
                var usedBudgetTotalAmount = 0;
                for (var s = 0; s < shipmentList.length; s++) {
                    var index = "";
                    if (shipmentList[s].shipmentId != 0) {
                        index = shipmentList.findIndex(c => c.shipmentId == shipmentList[s].shipmentId);
                    } else {
                        index = shipmentList[s].index;
                    }
                    if (map.get("37") != index) {
                        usedBudgetTotalAmount += parseFloat((parseFloat(shipmentList[s].productCost) + parseFloat(shipmentList[s].freightCost)) * parseFloat(shipmentList[s].currency.conversionRateToUsd));
                    }
                }
                var totalCost = ((elInstance.getCell(`AH${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", "");
                var enteredBudgetAmt = (totalCost * map.get("6"));
                usedBudgetTotalAmount = usedBudgetTotalAmount.toFixed(2);
                enteredBudgetAmt = enteredBudgetAmt.toFixed(2);

                var availableBudgetAmount = totalBudget - usedBudgetTotalAmount;
                if (enteredBudgetAmt > availableBudgetAmount) {
                    valid = false;
                    var col = ("I").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.noFundsAvailable'));

                    var col = ("AH").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.noFundsAvailable'));
                    this.setState({
                        noFundsBudgetError: i18n.t('static.label.noFundsAvailable')
                    })
                }
            } else {

                var col = ("A").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(0, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    // if (isNaN(Date.parse(value))) {
                    //     elInstance.setStyle(col, "background-color", "transparent");
                    //     elInstance.setStyle(col, "background-color", "yellow");
                    //     elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                    //     valid = false;
                    // } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                    // }
                }


                var value = elInstance.getRowData(y)[1];
                var col = ("B").concat(parseInt(y) + 1);
                var col1 = ("AA").concat(parseInt(y) + 1);
                var col2 = ("AB").concat(parseInt(y) + 1);
                var col3 = ("I").concat(parseInt(y) + 1);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (value == DELIVERED_SHIPMENT_STATUS || value == SHIPPED_SHIPMENT_STATUS || value == ARRIVED_SHIPMENT_STATUS) {
                        var procurementUnit = elInstance.getValueFromCoords(26, y);
                        var supplier = elInstance.getValueFromCoords(27, y);
                        if (procurementUnit == "") {
                            elInstance.setStyle(col1, "background-color", "transparent");
                            elInstance.setStyle(col1, "background-color", "yellow");
                            elInstance.setComments(col1, i18n.t('static.label.fieldRequired'));
                            valid = false;
                        } else {
                            elInstance.setStyle(col1, "background-color", "transparent");
                            elInstance.setComments(col1, "");
                        }

                        if (supplier == "") {
                            elInstance.setStyle(col2, "background-color", "transparent");
                            elInstance.setStyle(col2, "background-color", "yellow");
                            elInstance.setComments(col2, i18n.t('static.label.fieldRequired'));
                            valid = false;
                        } else {
                            elInstance.setStyle(col2, "background-color", "transparent");
                            elInstance.setComments(col2, "");
                        }
                    } else if (value == SUBMITTED_SHIPMENT_STATUS) {
                        var budget = elInstance.getValueFromCoords(8, y);
                        if (budget == "") {
                            elInstance.setStyle(col3, "background-color", "transparent");
                            elInstance.setStyle(col3, "background-color", "yellow");
                            elInstance.setComments(col3, i18n.t('static.label.fieldRequired'));
                            valid = false;
                        } else {
                            elInstance.setStyle(col3, "background-color", "transparent");
                            elInstance.setComments(col3, "");
                        }
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                        elInstance.setStyle(col1, "background-color", "transparent");
                        elInstance.setComments(col1, "");
                        elInstance.setStyle(col2, "background-color", "transparent");
                        elInstance.setComments(col2, "");
                        elInstance.setStyle(col3, "background-color", "transparent");
                        elInstance.setComments(col3, "");
                    }
                }

                var col = ("AE").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(30, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("U").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(20, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                } else {
                    if (isNaN(Number.parseInt(value)) || value < 0) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }

                }

                var col = ("E").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(4, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("D").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(3, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("Z").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(25, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                } else {
                    if (isNaN(Number.parseInt(value)) || value < 0) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }

                }

                var col = ("AF").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(31, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                } else {
                    if (isNaN(Number.parseInt(value)) || value < 0) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }

                }
                var shipmentStatus = elInstance.getRowData(y)[1];
                if (shipmentStatus != CANCELLED_SHIPMENT_STATUS && shipmentStatus != ON_HOLD_SHIPMENT_STATUS) {
                    if (shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                        var totalShipmentQty = (elInstance.getValueFromCoords(44, y));
                        var adjustedOrderQty = (elInstance.getCell(`V${parseInt(y) + 1}`)).innerHTML;
                        adjustedOrderQty = adjustedOrderQty.toString().replaceAll("\,", "");
                        var col = ("V").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.supplyPlan.batchNumberMissing'));
                        if (totalShipmentQty != 0 && totalShipmentQty != adjustedOrderQty) {
                            this.setState({
                                shipmentBatchError: i18n.t('static.supplyPlan.batchNumberMissing')
                            })
                            valid = false;
                        } else {
                            var col = ("V").concat(parseInt(y) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setComments(col, "");
                        }
                    }
                }
                // }
                // }
            }
        }
        return valid;
    }

    saveShipments(supplyPlanType) {
        var validation = this.checkValidationForShipments();
        if (validation == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            this.setState({
                shipmentError: "",
                shipmentDuplicateError: '',
                shipmentBudgetError: '',
                shipmentBatchError: '',
                noFundsBudgetError: ''
            })
            var elInstance = this.state.shipmentsEl;
            var json = elInstance.getJson();
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');

                var programId = (document.getElementById("programId").value);

                var programRequest = programTransaction.get(programId);
                programRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var shipmentDataList = (programJson.shipmentList);
                    var batchInfoList = programJson.batchInfoList;
                    for (var j = 0; j < json.length; j++) {
                        var map = new Map(Object.entries(json[j]));
                        var selectedShipmentStatus = map.get("1");
                        var shipmentStatusId = DRAFT_SHIPMENT_STATUS;
                        if (selectedShipmentStatus == PLANNED_SHIPMENT_STATUS) {
                            shipmentStatusId = DRAFT_SHIPMENT_STATUS;
                        } else {
                            shipmentStatusId = selectedShipmentStatus;
                        }


                        var shipmentQty = (elInstance.getCell(`V${j}`)).innerHTML;
                        var productCost = (elInstance.getCell(`AD${j}`)).innerHTML;
                        var rate = 0;
                        if ((elInstance.getCell(`Z${j}`)).innerHTML != "" || (elInstance.getCell(`Z${j}`)).innerHTML != 0) {
                            rate = (elInstance.getCell(`Z${j}`)).innerHTML;
                        } else {
                            rate = (elInstance.getCell(`AC${j}`)).innerHTML;
                        }

                        var freightCost = 0;
                        if ((elInstance.getCell(`AF${j}`)).innerHTML != "" || (elInstance.getCell(`AF${j}`)).innerHTML != 0) {
                            freightCost = (elInstance.getCell(`AF${j}`)).innerHTML;
                        } else {
                            freightCost = (elInstance.getCell(`AG${j}`)).innerHTML;
                        }
                        var shipmentMode = "Sea";
                        if (map.get("30") == 2) {
                            shipmentMode = "Air";
                        }
                        shipmentDataList[parseInt(map.get("37"))].expectedDeliveryDate = moment(map.get("0")).format("YYYY-MM-DD");
                        shipmentDataList[parseInt(map.get("37"))].shipmentStatus.id = shipmentStatusId;
                        shipmentDataList[parseInt(map.get("37"))].dataSource.id = map.get("3");
                        shipmentDataList[parseInt(map.get("37"))].procurementAgent.id = map.get("4");
                        shipmentDataList[parseInt(map.get("37"))].fundingSource.id = map.get("7");
                        shipmentDataList[parseInt(map.get("37"))].budget.id = map.get("8");
                        shipmentDataList[parseInt(map.get("37"))].shipmentQty = shipmentQty.toString().replaceAll("\,", "");
                        shipmentDataList[parseInt(map.get("37"))].rate = rate.toString().replaceAll("\,", "");
                        shipmentDataList[parseInt(map.get("37"))].procurementUnit.id = map.get("26");
                        shipmentDataList[parseInt(map.get("37"))].supplier.id = map.get("27");
                        shipmentDataList[parseInt(map.get("37"))].shipmentMode = shipmentMode;
                        shipmentDataList[parseInt(map.get("37"))].productCost = productCost.toString().replaceAll("\,", "");
                        shipmentDataList[parseInt(map.get("37"))].freightCost = parseFloat(freightCost.toString().replaceAll("\,", "")).toFixed(2);
                        shipmentDataList[parseInt(map.get("37"))].notes = map.get("34");
                        shipmentDataList[parseInt(map.get("37"))].active = map.get("42");
                        shipmentDataList[parseInt(map.get("37"))].accountFlag = map.get("40");
                        shipmentDataList[parseInt(map.get("37"))].emergencyOrder = map.get("41");
                        if (map.get("43").length != 0) {
                            shipmentDataList[parseInt(map.get("37"))].batchInfoList = map.get("43");
                        }
                        if (shipmentStatusId == SHIPPED_SHIPMENT_STATUS) {
                            shipmentDataList[parseInt(map.get("37"))].shippedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
                            shipmentDataList[parseInt(map.get("37"))].deliveredDate = moment(Date.now()).format("YYYY-MM-DD");
                            var shipmentBatchInfoList = map.get("43");
                            if (shipmentBatchInfoList.length == 0) {
                                var batchNo = "QAT".concat(map.get("37")).concat(this.state.versionId).concat(AuthenticationService.getLoggedInUserId());
                                var expectedDeliveryDate = moment(map.get("0")).format("YYYY-MM-DD");
                                var expiryDate = moment(expectedDeliveryDate).add(this.state.shelfLife, 'months').format("YYYY-MM-DD");
                                var batchInfoJson = {
                                    shipmentTransBatchInfoId: 0,
                                    batch: {
                                        batchNo: batchNo,
                                        expiryDate: expiryDate,
                                        batchId: 0
                                    },
                                    shipmentQty: shipmentQty,
                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
                                }
                                var batchArr = [];
                                batchArr.push(batchInfoJson);
                                shipmentDataList[parseInt(map.get("37"))].batchInfoList = batchArr;
                                var batchDetails = {
                                    batchId: 0,
                                    batchNo: batchNo,
                                    planningUnitId: parseInt(document.getElementById("planningUnitId").value),
                                    expiryDate: expiryDate,
                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
                                }
                                batchInfoList.push(batchDetails);
                            }
                            for (var bi = 0; bi < shipmentBatchInfoList.length; bi++) {
                                var batchDetails = {
                                    batchId: shipmentBatchInfoList[bi].batch.batchId,
                                    batchNo: shipmentBatchInfoList[bi].batch.batchNo,
                                    planningUnitId: parseInt(document.getElementById("planningUnitId").value),
                                    expiryDate: shipmentBatchInfoList[bi].batch.expiryDate,
                                    createdDate: moment(Date.now()).format("YYYY-MM-DD")
                                }
                                batchInfoList.push(batchDetails);
                            }
                            programJson.batchInfoList = batchInfoList;
                        }

                    }

                    programJson.shipmentList = shipmentDataList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.toggleLarge(supplyPlanType);
                        this.setState({
                            message: i18n.t('static.message.shipmentsSaved'),
                            shipmentChangedFlag: 0,
                            budgetChangedFlag: 0,
                            shipmentsEl: '',
                            shipmentBudgetTableEl: ''
                        })
                        this.formSubmit(this.state.monthCount);
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                shipmentError: i18n.t('static.supplyPlan.validationFailed')
            })
        }
    }

}
