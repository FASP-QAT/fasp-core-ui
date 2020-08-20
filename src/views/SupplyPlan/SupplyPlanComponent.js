import React from "react";

import {
    Card, CardBody, CardHeader,
    Col, Table, Modal, ModalBody, ModalFooter, ModalHeader, Button,
    Label, FormGroup, Form, Row, Nav, NavItem, NavLink, TabPane, TabContent
} from 'reactstrap';
import i18n from '../../i18n';
import 'react-contexify/dist/ReactContexify.min.css';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN, CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, NO_OF_MONTHS_ON_LEFT_CLICKED, ON_HOLD_SHIPMENT_STATUS, NO_OF_MONTHS_ON_RIGHT_CLICKED, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, INVENTORY_DATA_SOURCE_TYPE, SHIPMENT_DATA_SOURCE_TYPE, QAT_DATA_SOURCE_ID, FIRST_DATA_ENTRY_DATE, TBD_PROCUREMENT_AGENT_ID, DATE_FORMAT_CAP, INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../../Constants.js'
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
import ShipmentsInSupplyPlanComponent from "./ShipmentsInSupplyPlan";
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import InventoryInSupplyPlanComponent from "./InventoryInSupplyPlan";
import ConsumptionInSupplyPlanComponent from "./ConsumptionInSupplyPlan";

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
            expiredStockArr: [],
            expiredStockDetails: [],
            expiredStockDetailsTotal: 0,
            showShipments: 0,
            paColors: [],
            programSelect: "",
            showInventory: 0,
            showConsumption: 0
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

        this.actionCanceled = this.actionCanceled.bind(this);

        this.suggestedShipmentsDetailsClicked = this.suggestedShipmentsDetailsClicked.bind(this);
        this.shipmentsDetailsClicked = this.shipmentsDetailsClicked.bind(this);
        this.toggleAccordionTotalShipments = this.toggleAccordionTotalShipments.bind(this);
        this.toggleAccordionManualShipments = this.toggleAccordionManualShipments.bind(this);
        this.toggleAccordionErpShipments = this.toggleAccordionErpShipments.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.updateState = this.updateState.bind(this)
        this.updateFieldData = this.updateFieldData.bind(this);
    }

    roundN = num => {
        if (num != '') {
            return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
        } else {
            return ''
        }
    }

    formatter = value => {
        if (value != '' && !isNaN(Number.parseInt(value))) {
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
        } else if (isNaN(Number.parseInt(value))) {
            return value;
        } else {
            return ''
        }
    }

    formatterDouble = value => {
        if (value != '' && !isNaN(Number.parseInt(value))) {
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
        } else if (isNaN(Number.parseInt(value))) {
            return value;
        } else {
            return ''
        }
    }

    updateFieldData(value) {
        console.log("Value", value);
        // console.log(event.value)
        this.setState({ planningUnit: value, planningUnitId: value.value });

    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
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
            csvRow.push(i18n.t('static.program.program') + ' , ' + ((this.state.programSelect.label).replaceAll(',', '%20')).replaceAll(' ', '%20'))
            csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((this.state.planningUnit.label).replaceAll(',', '%20')).replaceAll(' ', '%20'))
            csvRow.push('')
            csvRow.push('')
            csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
            csvRow.push('')

            const header = [...[""], ... (this.state.monthsArray.map(item => (
                item.monthName.concat(" ").concat(item.monthYear)
            ))
            )]
            var A = [header]

            var openningArr = [...[i18n.t('static.supplyPlan.openingBalance').replaceAll(' ', '%20')], ... this.state.openingBalanceArray]
            var consumptionArr = [...[("-" + i18n.t('static.supplyPlan.consumption')).replaceAll(' ', '%20')], ...this.state.consumptionTotalData]
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
                        doc.text(i18n.t('static.program.program') + ' : ' + (this.state.programSelect).label, doc.internal.pageSize.width / 8, 80, {
                            align: 'left'
                        })
                        doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + (this.state.planningUnit).label, doc.internal.pageSize.width / 8, 90, {
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

            const data = [openningArr.map(c => this.formatter(c)), consumptionArr.map(c => this.formatter(c)), shipmentArr.map(c => this.formatter(c)), suggestedArr.map(c => this.formatter(c)), manualEntryShipmentsArr.map(c => this.formatter(c)), deliveredShipmentArr.map(c => this.formatter(c)), shippedShipmentArr.map(c => this.formatter(c)), orderedShipmentArr.map(c => this.formatter(c)), plannedShipmentArr.map(c => this.formatter(c)), erpShipmentsArr.map(c => this.formatter(c)), deliveredErpShipmentArr.map(c => this.formatter(c)), shippedErpShipmentArr.map(c => this.formatter(c)), orderedErpShipmentArr.map(c => this.formatter(c)), plannedErpShipmentArr.map(c => this.formatter(c)), inventoryArr.map(c => this.formatter(c)), closingBalanceArr.map(c => this.formatter(c)), monthsOfStockArr.map(c => this.formatterDouble(c)), amcgArr.map(c => this.formatter(c)), minStocArr.map(c => this.formatter(c)), maxStockArr.map(c => this.formatter(c)), unmetDemandArr.map(c => this.formatter(c))];

            let content = {
                margin: { top: 80, bottom: 50 },
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
                        backgroundColor: '#a5c5ec',
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
                        backgroundColor: '#20a8d8',
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
                        backgroundColor: '#7372cb',
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
                        borderColor: '#d0cece',
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
                        borderColor: '#f45c45',
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
                        borderColor: '#8be665',
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
                        {/* <Row> */}
                        <div className="col-md-12">
                            <span className="supplyplan-larrow" onClick={this.leftClicked}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                            <span className="supplyplan-rarrow" onClick={this.rightClicked}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                        </div>
                        {/* </Row> */}

                        <Table className="table-bordered text-center mt-2 overflowhide" bordered responsive size="sm" options={this.options}>
                            <thead>
                                <tr>
                                    <th className="BorderNoneSupplyPlan"></th>
                                    <th className="supplyplanTdWidth"></th>
                                    {
                                        this.state.monthsArray.map(item => (
                                            <th className="supplyplanTdWidthForMonths" style={{ padding: '10px 0 !important' }}>{item.monthName.concat(" ").concat(item.monthYear)}</th>
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
                                    <td align="left"><b>- {i18n.t('static.supplyPlan.consumption')}</b></td>
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
                                                    return (<td align="right" bgcolor='red' style={{ color: "#FFF" }} className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, `${item1.suggestedOrderQty}`, '', '', `${item1.isEmergencyOrder}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
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

                                <tr className="totalShipments hoverTd">
                                    <td className="BorderNoneSupplyPlan" onClick={() => this.toggleAccordionManualShipments()}>
                                        {this.state.showManualShipment ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                    </td>
                                    <td align="left" onClick={() => this.toggleLarge('SuggestedShipments', "", 0, '', '', "0")}>&emsp;&emsp;{i18n.t('static.supplyPlan.manualEntryShipments')}</td>
                                    {
                                        this.state.manualShipmentsTotalData.map(item1 => (
                                            <td align="right" onClick={() => this.toggleLarge('SuggestedShipments', "", 0, '', '', "0")}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>
                                <tr className="manualShipments">
                                    <td className="BorderNoneSupplyPlan"></td>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.delivered')}</td>

                                    {
                                        this.state.deliveredShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                return (<td align="right" bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                                return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                    </div>
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
                    {/* </div> */}

                    {/* Consumption modal */}
                    <Modal isOpen={this.state.consumption}
                        className={'modal-lg ' + this.props.className, "modalWidth"}>
                        <ModalHeader toggle={() => this.toggleLarge('Consumption')} className="modalHeaderSupplyPlan">
                            <strong>{i18n.t('static.dashboard.consumptiondetails')}</strong>
                            <ul className="legendcommitversion" style={{ display: 'inline-flex' }}>
                                <li><span className="purplelegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.forecastedConsumption')}</span></li>
                                <li><span className=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.actualConsumption')} </span></li>
                            </ul>
                        </ModalHeader>
                        <ModalBody>
                            <h6 className="red">{this.state.consumptionDuplicateError || this.state.consumptionNoStockError || this.state.consumptionError}</h6>
                            <div className="col-md-12">
                                <span className="supplyplan-larrow-dataentry" onClick={this.leftClickedConsumption}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                <span className="supplyplan-rarrow-dataentry" onClick={this.rightClickedConsumption}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                            </div>
                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th className="regionTdWidthConsumption"></th>
                                        {
                                            this.state.monthsArray.map(item => (
                                                <th>{item.monthName.concat(" ").concat(item.monthYear)}</th>
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
                            {this.state.showConsumption == 1 && <ConsumptionInSupplyPlanComponent ref="consumptionChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} consumptionPage="supplyPlan" />}
                            <div className="table-responsive mt-3">
                                <div id="consumptionTable" />
                            </div>
                            <h6 className="red">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchInfoNoStockError || this.state.consumptionBatchError}</h6>
                            <div className="table-responsive">
                                <div id="consumptionBatchInfoTable"></div>
                            </div>

                            <div id="showConsumptionBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledConsumption()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.consumptionBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.consumptionChild.saveConsumptionBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            {this.state.consumptionChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.refs.consumptionChild.saveConsumption}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
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
                                <span className="supplyplan-larrow-dataentry-adjustment" onClick={this.leftClickedAdjustments}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                                <span className="supplyplan-rarrow-dataentry" onClick={this.rightClickedAdjustments}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
                            </div>
                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th className="regionTdWidthAdjustments"></th>
                                        {
                                            this.state.monthsArray.map((item, count) => {
                                                if (count >= 3 && count <= 9) {
                                                    return (<th colSpan="2">{item.monthName.concat(" ").concat(item.monthYear)}</th>)
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr>
                                        <th></th>
                                        {
                                            this.state.monthsArray.map((item, count) => {
                                                if (count >= 3 && count <= 9) {
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
                                                    this.state.inventoryFilteredArray.filter(c => c.region.id == item.id).map((item1, count) => {
                                                        if (count >= 3 && count <= 9) {
                                                            if (item1.adjustmentQty.toString() != '' && (item1.actualQty.toString() != "" || item1.actualQty.toString() != 0)) {
                                                                return (
                                                                    <>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentQty} /></td>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>
                                                                    </>
                                                                )
                                                            } else if (item1.adjustmentQty.toString() != '' && (item1.actualQty.toString() == "" || item1.actualQty.toString() == 0)) {
                                                                var lastActualConsumptionDate = moment(((this.state.lastActualConsumptionDateArr.filter(c => item1.region.id == c.region))[0]).lastActualConsumptionDate).format("YYYY-MM");
                                                                var currentMonthDate = moment(item1.month.startDate).format("YYYY-MM");
                                                                if (currentMonthDate > lastActualConsumptionDate) {
                                                                    return (
                                                                        <>
                                                                            <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentQty} /></td>
                                                                            <td align="right"></td>
                                                                        </>
                                                                    )
                                                                } else {
                                                                    return (
                                                                        <>
                                                                            <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentQty} /></td>
                                                                            <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}></td>
                                                                        </>
                                                                    )
                                                                }

                                                            } else if (item1.adjustmentQty.toString() == '' && (item1.actualQty.toString() != "" || item1.actualQty.toString() != 0)) {
                                                                var lastActualConsumptionDate = moment(((this.state.lastActualConsumptionDateArr.filter(c => item1.region.id == c.region))[0]).lastActualConsumptionDate).format("YYYY-MM");
                                                                var currentMonthDate = moment(item1.month.startDate).format("YYYY-MM");
                                                                if (currentMonthDate > lastActualConsumptionDate) {
                                                                    return (
                                                                        <>
                                                                            <td align="right"></td>
                                                                            <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>

                                                                        </>
                                                                    )
                                                                } else {
                                                                    return (
                                                                        <>
                                                                            <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}></td>
                                                                            <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>
                                                                        </>
                                                                    )
                                                                }
                                                            } else {
                                                                var lastActualConsumptionDate = moment(((this.state.lastActualConsumptionDateArr.filter(c => item1.region.id == c.region))[0]).lastActualConsumptionDate).format("YYYY-MM");
                                                                var currentMonthDate = moment(item1.month.startDate).format("YYYY-MM");
                                                                if (currentMonthDate > lastActualConsumptionDate) {
                                                                    return (<><td align="right"></td><td align="right"></td></>)
                                                                } else {
                                                                    return (<><td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}></td>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}></td>
                                                                    </>)
                                                                }
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
                                            this.state.inventoryTotalMonthWise.map((item, count) => {
                                                if (count >= 3 && count <= 9) {
                                                    return (
                                                        <>
                                                            <td style={{ textAlign: 'right' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.adjustmentQty} />
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
                                            this.state.projectedTotalMonthWise.map((item, count) => {
                                                if (count >= 3 && count <= 9) {
                                                    return (
                                                        <td colSpan="2">{item}</td>)
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr bgcolor='#d9d9d9'>
                                        <td align="left">{i18n.t("static.supplyPlan.autoAdjustment")}</td>
                                        {
                                            this.state.inventoryFilteredArray.filter(c => c.region.id == -1).map((item1, count) => {
                                                if (count >= 3 && count <= 9) {
                                                    if (item1.adjustmentQty.toString() != '') {
                                                        return (<td colSpan="2" ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentQty} /></td>)
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
                                                if (count >= 3 && count <= 9) {
                                                    return (
                                                        <td colSpan="2">{item}</td>)
                                                }
                                            })
                                        }
                                    </tr>
                                </tbody>
                            </Table>
                            {this.state.showInventory == 1 && <InventoryInSupplyPlanComponent ref="inventoryChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} inventoryPage="supplyPlan" adjustmentsDetailsClicked={this.adjustmentsDetailsClicked} />}
                            <div className="table-responsive mt-3">
                                <div id="adjustmentsTable" className="table-responsive " />
                            </div>
                            <h6 className="red">{this.state.inventoryBatchInfoDuplicateError || this.state.inventoryBatchInfoNoStockError || this.state.inventoryBatchError}</h6>
                            <div className="table-responsive">
                                <div id="inventoryBatchInfoTable"></div>
                            </div>

                            <div id="showInventoryBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledInventory()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.inventoryBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.inventoryChild.saveInventoryBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            {this.state.inventoryChangedFlag == 1 && <Button size="md" color="success" className="submitBtn float-right mr-1" onClick={this.refs.inventoryChild.saveInventory}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
                            <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('Adjustments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </Modal>
                    {/* adjustments modal */}

                    {/* Shipments modal */}
                    <Modal isOpen={this.state.shipments}
                        className={'modal-lg ' + this.props.className, "modalWidth"}>
                        <ModalHeader toggle={() => this.toggleLarge('shipments')} className="modalHeaderSupplyPlan">
                            <strong>{i18n.t('static.supplyPlan.shipmentsDetails')} -  {i18n.t('static.planningunit.planningunit')} - {this.state.planningUnitName} </strong>
                        </ModalHeader>
                        <ModalBody>
                            {this.state.showShipments && <ShipmentsInSupplyPlanComponent ref="shipmentChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} shipmentPage="supplyPlan" />}
                            <h6 className="red">{this.state.noFundsBudgetError || this.state.shipmentBatchError || this.state.shipmentError || this.state.supplyPlanError}</h6>
                            <div className="table-responsive">
                                <div id="shipmentsDetailsTable" />
                            </div>

                            <h6 className="red">{this.state.qtyCalculatorValidationError}</h6>
                            <div className="table-responsive">
                                <div id="qtyCalculatorTable"></div>
                            </div>

                            <div className="table-responsive">
                                <div id="qtyCalculatorTable1"></div>
                            </div>

                            <div id="showSaveQtyButtonDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1 mb-2" onClick={() => this.actionCanceledShipments('qtyCalculator')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.shipmentQtyChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentQty()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentQty')}</Button>}
                            </div>

                            <h6 className="red">{this.state.shipmentDatesError}</h6>
                            <div className="table-responsive">
                                <div id="shipmentDatesTable"></div>
                            </div>
                            <div id="showSaveShipmentsDatesButtonsDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1 mb-2" onClick={() => this.actionCanceledShipments('shipmentDates')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.shipmentDatesChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentsDate()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentDates')}</Button>}
                            </div>
                            <h6 className="red">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                            <div className="table-responsive">
                                <div id="shipmentBatchInfoTable"></div>
                            </div>
                            <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                                <Button size="md" color="danger" className="float-right mr-1 " onClick={() => this.actionCanceledShipments('shipmentBatch')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {this.state.shipmentBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            {this.state.shipmentChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipments()}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}
                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('shipments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </Modal>
                    {/* Shipments modal */}
                    {/* Expired Stock modal */}
                    <Modal isOpen={this.state.expiredStockModal}
                        className={'modal-md ' + this.props.className}>
                        <ModalHeader toggle={() => this.toggleLarge('expiredStock')} className="modalHeaderSupplyPlan">
                            <strong>{i18n.t('static.dashboard.expiryDetails')}</strong>
                        </ModalHeader>
                        <ModalBody>
                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th>{i18n.t('static.inventory.batchNumber')}</th>
                                        <th>{i18n.t('static.inventory.expireDate')}</th>
                                        <th>{i18n.t('static.supplyPlan.qatGenerated')}</th>
                                        <th>{i18n.t('static.supplyPlan.expiredQty')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.expiredStockDetails.map(item => (
                                            <tr>
                                                <td align="left">{item.batchNo}</td>
                                                <td align="left">{moment(item.expiryDate).format(DATE_FORMAT_CAP)}</td>
                                                <td align="left">{(item.autoGenerated) ? i18n.t("static.program.yes") : i18n.t("static.program.no")}</td>
                                                <td align="right">{item.remainingQty}</td>
                                            </tr>
                                        )
                                        )
                                    }
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th style={{ textAlign: 'left' }} colSpan="3">{i18n.t('static.supplyPlan.total')}</th>
                                        <th style={{ textAlign: 'right' }}>{this.state.expiredStockDetailsTotal}</th>
                                    </tr>
                                </tfoot>
                            </Table>
                        </ModalBody>
                        <ModalFooter>
                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledExpiredStock()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </ModalFooter>
                    </Modal>
                    {/* Expired stock modal */}
                </TabPane>
                <TabPane tabId="2">
                    {this.state.planningUnitChange && <SupplyPlanComparisionComponent ref="compareChild" items={this.state} />}
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
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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
                        // var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        // var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson1 = JSON.parse(programData);
                        var programJson = {
                            label: programJson1.programCode + "~v" + myResult[i].version,
                            value: myResult[i].id
                        }
                        proList.push(programJson);
                    }
                }
                console.log("ProList", proList);
                this.setState({
                    programList: proList,
                })
                var programIdd = this.props.match.params.programId;
                console.log("programIdd", programIdd);
                if (programIdd != '' && programIdd != undefined) {
                    var programSelect = { value: programIdd, label: proList.filter(c => c.value == programIdd)[0].label };
                    this.setState({
                        programSelect: programSelect,
                        programId: programIdd
                    })
                    this.getPlanningUnitList(programSelect);
                }

            }.bind(this);
        }.bind(this);
        console.log("After component did mount");
    };

    getPlanningUnitList(value) {
        console.log("Vlue", value);
        document.getElementById("planningUnitId").value = 0;
        document.getElementById("planningUnit").value = "";
        this.setState({
            display: 'none',
            planningUnitChange: false,
            programSelect: value,
            programId: value.value,
            planningUnit:"",
            planningUnitId:""
        })
        var db1;
        var storeOS;
        getDatabase();
        var regionList = [];
        var dataSourceList = [];
        var dataSourceListAll = [];
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['programData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('programData');
            var programRequest = programDataOs.get(value.value);
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
                    regionList.push(regionJson);

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
                    var programId = (value.value).split("_")[0];
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
                                planningUnitListForConsumption: planningUnitListForConsumption
                            })
                            var planningUnitIdProp = this.props.match.params.planningUnitId;
                            console.log("planningUnitIdProp===>", planningUnitIdProp);
                            if (planningUnitIdProp != '' && planningUnitIdProp != undefined) {
                                var planningUnit = { value: planningUnitIdProp, label: proList.filter(c => c.value == planningUnitIdProp)[0].label };
                                this.setState({
                                    planningUnit: planningUnit,
                                    planningUnitId: planningUnitIdProp
                                })
                                this.formSubmit(planningUnit, this.state.monthCount);
                            }

                        }.bind(this);
                    }.bind(this);
                }.bind(this);
            }.bind(this)
        }.bind(this)
    }

    getMonthArray(currentDate) {
        var month = [];
        var curDate = currentDate.subtract(MONTHS_IN_PAST_FOR_SUPPLY_PLAN, 'months');
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
        if (value.value != 0) {
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
        var planningUnitId = value.value;
        var planningUnitName = value.label;

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
        var projectedTotalMonthWise = [];
        var filteredArrayInventory = [];
        var openingBalanceArray = [];
        var closingBalanceArray = [];
        var jsonArrForGraph = [];
        var monthsOfStockArray = [];
        var unmetDemand = [];
        var paColors = [];
        var db1;
        var storeOS;
        getDatabase();
        var regionList = [];
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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
                var shelfLife = programPlanningUnit.shelfLife;
                var monthsInPastForAMC = programPlanningUnit.monthsInPastForAmc;
                var monthsInFutureForAMC = programPlanningUnit.monthsInFutureForAmc;
                this.setState({
                    shelfLife: shelfLife,
                    versionId: programJson.currentVersion.versionId,
                    monthsInPastForAMC: monthsInPastForAMC,
                    monthsInFutureForAMC: monthsInFutureForAMC,
                    reorderFrequency: reorderFrequencyInMonths,
                    minMonthsOfStock: minMonthsOfStock
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
                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                        var c = consumptionList.filter(c => (c.consumptionDate >= m[i].startDate && c.consumptionDate <= m[i].endDate) && c.region.id == regionListFiltered[reg].id);
                        var filteredJson = { consumptionQty: '', region: { id: regionListFiltered[reg].id }, month: m[i] };
                        for (var j = 0; j < c.length; j++) {
                            var count = (c.filter(c.actualFlag.toString()=='true')).length;
                            if (count == 0) {
                                consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                                filteredJson = { month: m[i], region: c[j].region, consumptionQty: c[j].consumptionQty, consumptionId: c[j].consumptionId, actualFlag: c[j].actualFlag, consumptionDate: c[j].consumptionDate };
                            } else {
                                if (c[j].actualFlag.toString() == 'true') {
                                    consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
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
                    } else {
                        consumptionTotalData.push(consumptionQty);
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
                        var realm = programJson.realmCountry.realm;
                        var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
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
                        var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
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
                    for (var reg = 0; reg < regionListFiltered.length; reg++) {
                        var adjustmentQtyForRegion = 0;
                        var actualQtyForRegion = 0;
                        var c = inventoryList.filter(c => (c.inventoryDate >= m[i].startDate && c.inventoryDate <= m[i].endDate) && c.region != null && c.region.id == regionListFiltered[reg].id);
                        var filteredJsonInventory = { adjustmentQty: '', actualQty: '', region: { id: regionListFiltered[reg].id }, month: m[i] };
                        for (var j = 0; j < c.length; j++) {
                            adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                            adjustmentQtyForRegion += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                            actualQtyForRegion += parseFloat((c[j].actualQty * c[j].multiplier));
                            filteredJsonInventory = { month: m[i], region: c[j].region, adjustmentQty: adjustmentQtyForRegion, actualQty: actualQtyForRegion, inventoryId: c[j].inventoryId, inventoryDate: c[j].inventoryDate };
                        }
                        filteredArrayInventory.push(filteredJsonInventory);
                    }
                    var c1 = inventoryList.filter(c => (c.inventoryDate >= m[i].startDate && c.inventoryDate <= m[i].endDate) && c.region == null);
                    console.log("c1----------------->", c1);
                    var fInventory = { adjustmentQty: '', actualQty: '', region: { id: -1 }, month: m[i] };
                    var nationalAdjustment = 0;
                    for (var j = 0; j < c1.length; j++) {
                        adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                        nationalAdjustment += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                        fInventory = { month: m[i], region: { id: -1 }, adjustmentQty: nationalAdjustment, actualQty: '', inventoryId: c1[j].inventoryId, inventoryDate: c1[j].inventoryDate };
                    }
                    console.log("National adjustments", nationalAdjustment);
                    filteredArrayInventory.push(fInventory);
                    var adjustmentsTotalData = inventoryList.filter(c => (c.inventoryDate >= m[i].startDate && c.inventoryDate <= m[i].endDate));
                    if (adjustmentsTotalData.length == 0) {
                        inventoryTotalData.push("");
                    } else {
                        inventoryTotalData.push(adjustmentQty);
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
                            filteredArrayInventory.push({ adjustmentQty: '', actualQty: '', region: { id: regionListFiltered[i].id }, month: m[k] })
                        }
                    }
                }
                for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                    var inventoryListFilteredForMonth = filteredArrayInventory.filter(c => c.month.month == m[i].month && c.region.id != -1);
                    console.log("InventoryList Filtered", inventoryListFilteredForMonth);
                    var monthWiseCountAdjustment = 0;
                    var monthWiseCountActual = 0;
                    for (var cL = 0; cL < inventoryListFilteredForMonth.length; cL++) {
                        if (inventoryListFilteredForMonth[cL].adjustmentQty != '') {
                            monthWiseCountAdjustment += parseInt(inventoryListFilteredForMonth[cL].adjustmentQty);
                        }
                        if (inventoryListFilteredForMonth[cL].actualQty != '') {
                            monthWiseCountActual += parseInt(inventoryListFilteredForMonth[cL].actualQty);
                        }
                    }
                    var inventoryFilterForRegion = filteredArrayInventory.filter(c => c.month.month == m[i].month && (c.actualQty != '' || c.actualQty != 0) && c.region.id != -1);
                    if (inventoryFilterForRegion.length < regionListFiltered.length) {
                        if (inventoryFilterForRegion.length == 0) {
                            monthWiseCountActual = "";
                        } else {
                            monthWiseCountActual = i18n.t('static.supplyPlan.notAllRegionsHaveActualStock');
                        }
                    }
                    inventoryTotalMonthWise.push({ adjustmentQty: monthWiseCountAdjustment, actualQty: monthWiseCountActual });
                }
                console.log("Inventory total month wise", inventoryTotalMonthWise);

                console.log("filteredArrayInventory-------------->", filteredArrayInventory);
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
                    this.setState({
                        papuResult: papuResult
                    })
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
                                    if (manualShipmentArr[j].procurementAgent.id != "" && manualShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                        var index = paColors.findIndex(c => c.color == "#" + paColor);
                                        if (index == -1) {
                                            paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                        }
                                    } else {
                                        if (manualShipmentArr[j].procurementAgent.id != "") {
                                            var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        } else {
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        }
                                    }
                                    deliveredShipmentsDetailsArr.push(shipmentDetail);
                                    deliveredShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                                } else if (manualShipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                    if (manualShipmentArr[j].procurementAgent.id != "" && manualShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                        var index = paColors.findIndex(c => c.color == "#" + paColor);
                                        if (index == -1) {
                                            paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                        }
                                    } else {
                                        if (manualShipmentArr[j].procurementAgent.id != "") {
                                            var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        } else {
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        }
                                    }
                                    shippedShipmentsDetailsArr.push(shipmentDetail);
                                    shippedShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                                } else if (manualShipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                    if (manualShipmentArr[j].procurementAgent.id != "" && manualShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                        var index = paColors.findIndex(c => c.color == "#" + paColor);
                                        if (index == -1) {
                                            paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                        }
                                    } else {
                                        if (manualShipmentArr[j].procurementAgent.id != "") {
                                            var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        } else {
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        }
                                    }
                                    orderedShipmentsDetailsArr.push(shipmentDetail);
                                    orderedShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                                } else if (manualShipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                    if (manualShipmentArr[j].procurementAgent.id != "" && manualShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                        var index = paColors.findIndex(c => c.color == "#" + paColor);
                                        if (index == -1) {
                                            paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                        }
                                    } else {
                                        if (manualShipmentArr[j].procurementAgent.id != "") {
                                            var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        } else {
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        }
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
                                deliveredShipmentsTotalData.push({ qty: deliveredShipmentsQty, month: m[i], shipmentDetail: deliveredShipmentsDetailsArr, noOfShipments: deliveredShipmentsDetailsArr.length, colour: colour, textColor: contrast(colour) })
                            } else {
                                deliveredShipmentsTotalData.push("");
                            }

                            if ((manualShipmentArr.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                var colour = paColor;
                                if (shippedShipmentsDetailsArr.length > 1) {
                                    colour = "#d9ead3";
                                }
                                shippedShipmentsTotalData.push({ qty: shippedShipmentsQty, month: m[i], shipmentDetail: shippedShipmentsDetailsArr, noOfShipments: shippedShipmentsDetailsArr.length, colour: colour, textColor: contrast(colour) })
                            } else {
                                shippedShipmentsTotalData.push("");
                            }

                            if ((manualShipmentArr.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS)).length > 0) {
                                var colour = paColor;
                                if (orderedShipmentsDetailsArr.length > 1) {
                                    colour = "#d9ead3";
                                }
                                orderedShipmentsTotalData.push({ qty: orderedShipmentsQty, month: m[i], shipmentDetail: orderedShipmentsDetailsArr, noOfShipments: orderedShipmentsDetailsArr.length, textColor: contrast(colour) })
                            } else {
                                orderedShipmentsTotalData.push("");
                            }

                            if ((manualShipmentArr.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                var colour = paColor;
                                if (plannedShipmentsDetailsArr.length > 1) {
                                    colour = "#d9ead3";
                                }
                                plannedShipmentsTotalData.push({ qty: plannedShipmentsQty, month: m[i], shipmentDetail: plannedShipmentsDetailsArr, noOfShipments: plannedShipmentsDetailsArr.length, colour: colour, textColor: contrast(colour) })
                            } else {
                                plannedShipmentsTotalData.push("");
                            }

                            for (var j = 0; j < erpShipmentArr.length; j++) {
                                erpTotalQty += parseInt((erpShipmentArr[j].shipmentQty));
                                if (erpShipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                    if (erpShipmentArr[j].procurementAgent.id != "" && erpShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + erpShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                        var index = paColors.findIndex(c => c.color == "#" + paColor);
                                        if (index == -1) {
                                            paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                        }
                                    } else {
                                        if (erpShipmentArr[j].procurementAgent.id != "") {
                                            var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        } else {
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        }
                                    }
                                    deliveredErpShipmentsDetailsArr.push(shipmentDetail);
                                    deliveredErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                                } else if (erpShipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                    if (erpShipmentArr[j].procurementAgent.id != "" && erpShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + erpShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                        var index = paColors.findIndex(c => c.color == "#" + paColor);
                                        if (index == -1) {
                                            paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                        }
                                    } else {
                                        if (erpShipmentArr[j].procurementAgent.id != "") {
                                            var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        } else {
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        }
                                    }
                                    shippedErpShipmentsDetailsArr.push(shipmentDetail);
                                    shippedErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                                } else if (erpShipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                    if (erpShipmentArr[j].procurementAgent.id != "" && erpShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + erpShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                        var index = paColors.findIndex(c => c.color == "#" + paColor);
                                        if (index == -1) {
                                            paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                        }
                                    } else {
                                        if (erpShipmentArr[j].procurementAgent.id != "") {
                                            var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        } else {
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        }
                                    }
                                    orderedErpShipmentsDetailsArr.push(shipmentDetail);
                                    orderedErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                                } else if (erpShipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                    if (erpShipmentArr[j].procurementAgent.id != "" && erpShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + erpShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
                                        var index = paColors.findIndex(c => c.color == "#" + paColor);
                                        if (index == -1) {
                                            paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                        }
                                    } else {
                                        if (erpShipmentArr[j].procurementAgent.id != "") {
                                            var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        } else {
                                            var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                            var shipmentDetail = procurementAgent.procurementAgentCode + " - " + manualShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                            paColor = "#efefef"
                                        }
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
                                deliveredErpShipmentsTotalData.push({ qty: deliveredErpShipmentsQty, month: m[i], shipmentDetail: deliveredErpShipmentsDetailsArr, noOfShipments: deliveredErpShipmentsDetailsArr.length, colour: colour, textColor: contrast(colour) })
                            } else {
                                deliveredErpShipmentsTotalData.push("");
                            }

                            if ((erpShipmentArr.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                var colour = paColor;
                                if (shippedErpShipmentsDetailsArr.length > 1) {
                                    colour = "#d9ead3";
                                }
                                shippedErpShipmentsTotalData.push({ qty: shippedErpShipmentsQty, month: m[i], shipmentDetail: shippedErpShipmentsDetailsArr, noOfShipments: shippedErpShipmentsDetailsArr.length, colour: colour, textColor: contrast(colour) })
                            } else {
                                shippedErpShipmentsTotalData.push("");
                            }

                            if ((erpShipmentArr.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS)).length > 0) {
                                var colour = paColor;
                                if (orderedErpShipmentsDetailsArr.length > 1) {
                                    colour = "#d9ead3";
                                }
                                orderedErpShipmentsTotalData.push({ qty: orderedErpShipmentsQty, month: m[i], shipmentDetail: orderedErpShipmentsDetailsArr, noOfShipments: orderedErpShipmentsDetailsArr.length, colour: colour, textColor: contrast(colour) })
                            } else {
                                orderedErpShipmentsTotalData.push("");
                            }

                            if ((erpShipmentArr.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                var colour = paColor;
                                if (plannedErpShipmentsDetailsArr.length > 1) {
                                    colour = "#d9ead3";
                                }
                                plannedErpShipmentsTotalData.push({ qty: plannedErpShipmentsQty, month: m[i], shipmentDetail: plannedErpShipmentsDetailsArr, noOfShipments: plannedErpShipmentsDetailsArr.length, colour: colour, textColor: contrast(colour) })
                            } else {
                                plannedErpShipmentsTotalData.push("");
                            }
                        }
                        console.log("Delivered shipment totral data", deliveredShipmentsTotalData);

                        // Calculations for exipred stock
                        var batchInfoForPlanningUnit = programJson.batchInfoList.filter(c => c.planningUnitId == value.value);
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
                            var totalStockForBatchNumber = 0;
                            if (stockForBatchNumber.length > 0) {
                                var totalStockForBatchNumber = stockForBatchNumber.qty;
                            }
                            // for loop will start here till exipry date
                            var createdDate = moment(myArray[ma].createdDate).startOf('month').format("YYYY-MM-DD");
                            var expiryDate = moment(myArray[ma].expiryDate).startOf('month').format("YYYY-MM-DD");
                            var remainingBatchQty = parseInt(totalStockForBatchNumber);
                            var calculationStartDate = moment(myArray[ma].createdDate).startOf('month').format("YYYY-MM-DD");
                            console.log("Batch Number", myArray[ma].batchNo);
                            console.log("Received Qty", remainingBatchQty);
                            for (var i = 0; createdDate < expiryDate; i++) {
                                createdDate = moment(calculationStartDate).add(i, 'month').format("YYYY-MM-DD");
                                var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                                var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                                console.log("STart date", startDate);
                                var inventoryList = (programJson.inventoryList).filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate));
                                var inventoryBatchArray = [];
                                for (var inv = 0; inv < inventoryList.length; inv++) {
                                    var batchInfoList = inventoryList[inv].batchInfoList;
                                    for (var bi = 0; bi < batchInfoList.length; bi++) {
                                        inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier, actualQty: batchInfoList[bi].actualQty * inventoryList[inv].multiplier })
                                    }
                                }
                                var inventoryForBatchNumber = [];
                                if (inventoryBatchArray.length > 0) {
                                    inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
                                }
                                if (inventoryForBatchNumber == undefined) {
                                    inventoryForBatchNumber = [];
                                }
                                console.log("InventoryBatchArray", inventoryForBatchNumber);
                                var adjustmentQty = 0;
                                for (var b = 0; b < inventoryForBatchNumber.length; b++) {
                                    if (inventoryForBatchNumber[b].actualQty == "" || inventoryForBatchNumber[b].actualQty == 0 || inventoryForBatchNumber[b].actualQty == null) {
                                        remainingBatchQty += parseFloat(inventoryForBatchNumber[b].qty);
                                    } else {
                                        remainingBatchQty = parseFloat(inventoryForBatchNumber[b].actualQty);
                                    }
                                }
                                console.log("Remaining batch Qty after adjustment", remainingBatchQty);
                                var consumptionList = (programJson.consumptionList).filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate));
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
                                remainingBatchQty -= parseInt(consumptionQty);
                                console.log("Remaining batch qty after consumption", remainingBatchQty)
                            }
                            // For loop will end here
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
                                        var qty = 0;
                                        if (c[j].batchInfoList.length > 0) {
                                            for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                                qty += parseInt((c[j].batchInfoList)[a].consumptionQty);
                                            }
                                        }
                                        var remainingQty = parseInt((c[j].consumptionQty)) - parseInt(qty);
                                        unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
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

                            var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) > (moment(startDate).format("YYYY-MM-DD"))));
                            console.log("--------------------------------------------------------------");
                            console.log("Start date", startDate);
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
                                    if (unallocatedAdjustmentQty > 0) {
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
                                if (unallocatedAdjustmentQty > 0) {
                                    if (batchDetailsForParticularPeriod.length > 0) {
                                        console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                        console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                        batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
                                        unallocatedAdjustmentQty = 0;
                                    }
                                }
                            }
                            var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) > (moment(startDate).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
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
                                        for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
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
                                    }

                                }
                            }
                            var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
                            for (var j = 0; j < c1.length; j++) {
                                adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                unallocatedAdjustmentQty = parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
                                if (unallocatedAdjustmentQty < 0) {
                                    for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
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
                            var expiredStockJsonArr = []
                            for (var j = 0; j < expiredStock.length; j++) {
                                expiredStockJsonArr.push({ remainingQty: parseInt((expiredStock[j].remainingQty)), batchNo: (expiredStock[j].batchNo), expiryDate: (expiredStock[j].expiryDate), autoGenerated: (expiredStock[j].autoGenerated) })
                                expiredStockQty += parseInt((expiredStock[j].remainingQty));
                            }
                            totalExpiredStockArr.push({ qty: expiredStockQty, details: expiredStockJsonArr, month: m[i - 1] });
                            // Suggested shipments part
                            var s = i - 1;
                            var month = m[s].startDate;
                            var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                            var compare = (month >= currentMonth);
                            var stockInHand = openingBalanceArray[s] - consumptionQtyForCB + inventoryQtyForCB + shipmentsQtyForCB;
                            if (compare && parseInt(stockInHand) <= parseInt(minStockArray[s])) {
                                var suggestedOrd = parseInt(maxStockArray[s] - minStockArray[s]);
                                if (suggestedOrd == 0) {
                                    var addLeadTimes = parseFloat(programJson.plannedToSubmittedLeadTime) + parseFloat(programJson.submittedToApprovedLeadTime) +
                                        parseFloat(programJson.approvedToShippedLeadTime) + parseFloat(programJson.shippedToArrivedBySeaLeadTime) +
                                        parseFloat(programJson.arrivedToDeliveredLeadTime);
                                    var expectedDeliveryDate = moment(month).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                    var isEmergencyOrder = 0;
                                    if (expectedDeliveryDate >= currentMonth) {
                                        isEmergencyOrder = 0;
                                    } else {
                                        isEmergencyOrder = 1;
                                    }
                                    suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": m[s].startDate, "isEmergencyOrder": isEmergencyOrder });
                                } else {
                                    var addLeadTimes = parseFloat(programJson.plannedToSubmittedLeadTime) + parseFloat(programJson.submittedToApprovedLeadTime) +
                                        parseFloat(programJson.approvedToShippedLeadTime) + parseFloat(programJson.shippedToArrivedBySeaLeadTime) +
                                        parseFloat(programJson.arrivedToDeliveredLeadTime);
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
                                var addLeadTimes = parseFloat(programJson.plannedToSubmittedLeadTime) + parseFloat(programJson.submittedToApprovedLeadTime) +
                                    parseFloat(programJson.approvedToShippedLeadTime) + parseFloat(programJson.shippedToArrivedBySeaLeadTime) +
                                    parseFloat(programJson.arrivedToDeliveredLeadTime);
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
                        console.log("Total exipred stock array", totalExpiredStockArr);
                        console.log("filteredArrayInventory", filteredArrayInventory)
                        for (var pinv = 0; pinv < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; pinv++) {
                            var filteredInventory = filteredArrayInventory.filter(c => c.region.id == -1);
                            console.log("filter inventory for region -1", filteredInventory);
                            if (filteredInventory[pinv].adjustmentQty != "") {
                                var projectedInventory = closingBalanceArray[pinv] - parseInt(filteredInventory[pinv].adjustmentQty);
                            } else {
                                var projectedInventory = closingBalanceArray[pinv];
                            }
                            projectedTotalMonthWise.push(projectedInventory);
                        }
                        this.setState({
                            suggestedShipmentsTotalData: suggestedShipmentsTotalData,
                            inventoryTotalData: inventoryTotalData,
                            inventoryFilteredArray: filteredArrayInventory,
                            regionListFiltered: regionListFiltered,
                            inventoryTotalMonthWise: inventoryTotalMonthWise,
                            projectedTotalMonthWise: projectedTotalMonthWise,
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
                            expiredStockArr: totalExpiredStockArr,
                            paColors: paColors
                        })
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)

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
            var monthCountConsumption = this.state.monthCount;
            this.setState({
                consumption: !this.state.consumption,
                monthCountConsumption: monthCountConsumption,
            });
            this.formSubmit(this.state.planningUnit, monthCountConsumption);
        } else if (supplyPlanType == 'SuggestedShipments') {
            this.setState({
                shipments: !this.state.shipments
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
            this.formSubmit(this.state.planningUnit, monthCountAdjustments);
        } else if (supplyPlanType == 'expiredStock') {
            var details = (this.state.expiredStockArr).filter(c => moment(c.month.startDate).format("YYYY-MM-DD") == moment(startDate).format("YYYY-MM-DD"))
            console.log("startDate", startDate)
            if (startDate != undefined) {
                this.setState({
                    expiredStockModal: !this.state.expiredStockModal,
                    expiredStockDetails: details[0].details,
                    expiredStockDetailsTotal: details[0].qty
                })
            } else {
                this.setState({
                    expiredStockModal: !this.state.expiredStockModal
                })
            }
        }
    }

    actionCanceledExpiredStock() {
        this.setState({
            expiredStockModal: !this.state.expiredStockModal,
            message: i18n.t('static.message.cancelled'),
            color: 'red',
        })
    }

    actionCanceled(supplyPlanType) {
        var inputs = document.getElementsByClassName("submitBtn");
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].disabled = true;
        }
        this.setState({
            message: i18n.t('static.message.cancelled'),
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
            showConsumption: 0

        },
            () => {
                this.hideSecondComponent();
            })
        this.toggleLarge(supplyPlanType);
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
        var monthCountConsumption = (this.state.monthCountConsumption) - NO_OF_MONTHS_ON_LEFT_CLICKED;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(this.state.planningUnit, monthCountConsumption)
    }

    rightClickedConsumption() {
        var monthCountConsumption = (this.state.monthCountConsumption) + NO_OF_MONTHS_ON_RIGHT_CLICKED;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(this.state.planningUnit, monthCountConsumption);
    }

    leftClickedAdjustments() {
        var monthCountAdjustments = (this.state.monthCountAdjustments) - NO_OF_MONTHS_ON_LEFT_CLICKED;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(this.state.planningUnit, monthCountAdjustments)
    }

    rightClickedAdjustments() {
        var monthCountAdjustments = (this.state.monthCountAdjustments) + NO_OF_MONTHS_ON_RIGHT_CLICKED;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(this.state.planningUnit, monthCountAdjustments);
    }

    // Consumption Functionality

    // Show consumption details
    consumptionDetailsClicked(startDate, endDate, region, actualFlag, month) {
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
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['programData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('programData');
            var programRequest = programDataOs.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var batchInfoList = programJson.batchInfoList;
                var consumptionListUnFiltered = (programJson.consumptionList);
                var consumptionList = consumptionListUnFiltered.filter(con =>
                    con.planningUnit.id == planningUnitId
                    && con.region.id == region
                    && ((con.consumptionDate >= startDate && con.consumptionDate <= endDate)));
                this.setState({
                    programJsonAfterConsumptionClicked: programJson,
                    consumptionListUnFiltered: consumptionListUnFiltered,
                    batchInfoList: batchInfoList,
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
    // Consumption Functionality

    // Adjustments Functionality
    // Show adjustments details
    adjustmentsDetailsClicked(region, month, endDate, inventoryType) {
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
                var batchInfoList = programJson.batchInfoList;
                var inventoryListUnFiltered = (programJson.inventoryList);
                var inventoryList = (programJson.inventoryList).filter(c =>
                    c.planningUnit.id == planningUnitId &&
                    c.region != null &&
                    c.region.id == region &&
                    moment(c.inventoryDate).format("MMM YY") == month);
                if (inventoryType == 1) {
                    inventoryList = inventoryList.filter(c => c.actualQty != "" && c.actualQty != 0 && c.actualQty != null);
                } else {
                    inventoryList = inventoryList.filter(c => c.adjustmentQty != "" && c.adjustmentQty != 0 && c.adjustmentQty != null);
                }
                this.setState({
                    batchInfoList: batchInfoList,
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

    // Adjustments Functionality

    // Shipments functionality
    // Suggested shipments

    //Show Suggested shipments details
    suggestedShipmentsDetailsClicked(month, quantity, isEmergencyOrder) {
        var programId = document.getElementById("programId").value;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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
                var planningUnitId = document.getElementById("planningUnitId").value;
                var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.planningUnit.id == planningUnitId))[0];
                var shelfLife = programPlanningUnit.shelfLife;
                if (month != "") {
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
                        id: ""
                    },
                    currency: {
                        currencyId: ""
                    }
                }
                shipmentList.push(json);
                console.log("Shipment list", shipmentList);
                this.setState({
                    shipmentListUnFiltered: programJson.shipmentList,
                    programJson: programJson,
                    shelfLife: shelfLife,
                    shipmentList: shipmentList,
                    showShipments: 1,
                })
            }.bind(this)
        }.bind(this)
    }
    // Shipments Functionality


    render() {
        const { programList } = this.state;
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <h5 className="red">{this.state.supplyPlanError}</h5>

                <Card>
                    <div className="Card-header-reporticon">
                        {/* <strong>{i18n.t('static.dashboard.supplyPlan')}</strong> */}
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <Link to='/supplyPlanFormulas' target="_blank"><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></Link>
                            </a>
                        </div>
                    </div>
                    {/* <CardHeader>
                        <strong>{i18n.t('static.dashboard.supplyPlan')}</strong>
                        <div className="card-header-actions">

                            <a className="card-header-action">
                                <Link to='/supplyPlanFormulas' target="_blank"><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></Link>
                            </a>

                        </div>
                    </CardHeader> */}
                    <CardBody className="pt-lg-0 pb-lg-0">

                        <Formik
                            render={
                                ({
                                }) => (
                                        <Form name='simpleForm'>
                                            <Col md="12 pl-0">
                                                <div className="row">
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
                                                    <FormGroup className="col-md-4 ">
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
                                                <FormGroup className="col-md-12 mt-2 pl-0" style={{ display: this.state.display }}>
                                                    <ul className="legendcommitversion list-group">
                                                        {
                                                            this.state.paColors.map(item1 => (
                                                                <li><span className="legendcolor" style={{ backgroundColor: item1.color }}></span> <span className="legendcommitversionText">{item1.text}</span></li>
                                                            ))
                                                        }
                                                        <li><span className="lightgreylegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.tbd')}</span></li>
                                                        <li><span className="lightgreenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.multipleShipments')}</span></li>
                                                        <li><span className="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.emergencyShipments')} </span></li>
                                                    </ul>
                                                </FormGroup>
                                                <FormGroup className="col-md-12 pl-0" style={{ marginLeft: '-8px' }} style={{ display: this.state.display }}>
                                                    <ul className="legendcommitversion list-group">
                                                        <li><span className="lightgreylegend "></span> <span className="legendcommitversionText"> {i18n.t("static.supplyPlan.minMonthsOfStock")} - {this.state.minMonthsOfStock}</span></li>
                                                        <li><span className="lightgreenlegend "></span> <span className="legendcommitversionText">{i18n.t("static.report.reorderFrequencyInMonths")} - {this.state.reorderFrequency}</span></li>
                                                        <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.report.mospast")} - {this.state.monthsInPastForAMC}</span></li>
                                                        <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.report.mosfuture")} - {this.state.monthsInFutureForAMC}</span></li>
                                                        <li><span className="redlegend "></span> <span className="legendcommitversionText">{i18n.t("static.supplyPlan.shelfLife")} - {this.state.shelfLife}</span></li>
                                                    </ul>
                                                </FormGroup>
                                            </Col>
                                        </Form>
                                    )} />
                        <div className="animated fadeIn" style={{ display: this.state.display }}>
                            <Row>
                                <Col xs="12" md="12" className="mb-4">
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
                                                {i18n.t('static.supplyPlan.supplyPlanForV')}{this.state.versionId}
                                            </NavLink>

                                        </NavItem>
                                    </Nav>
                                    <TabContent activeTab={this.state.activeTab[0]}>
                                        {this.tabPane()}
                                    </TabContent>
                                </Col>
                            </Row>
                        </div>
                    </CardBody>
                </Card>
            </div>
        )
    }

    shipmentsDetailsClicked(supplyPlanType, startDate, endDate) {
        var programId = document.getElementById("programId").value;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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
                var shipmentListUnFiltered = programJson.shipmentList;
                this.setState({
                    shipmentListUnFiltered: shipmentListUnFiltered
                })
                var shipmentList = [];
                // var tableEditableBasedOnSupplyPlan = true;
                if (supplyPlanType == 'deliveredShipments') {
                    shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                } else if (supplyPlanType == 'shippedShipments') {
                    shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                } else if (supplyPlanType == 'orderedShipments') {
                    shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS));
                } else if (supplyPlanType == 'plannedShipments') {
                    shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                } else if (supplyPlanType == 'deliveredErpShipments') {
                    shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                } else if (supplyPlanType == 'shippedErpShipments') {
                    shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                } else if (supplyPlanType == 'orderedErpShipments') {
                    shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS));
                } else if (supplyPlanType == 'plannedErpShipments') {
                    shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                }
                this.setState({
                    showShipments: 1,
                    shipmentList: shipmentList,
                    shipmentListUnFiltered: shipmentListUnFiltered
                })
            }.bind(this)
        }.bind(this)
    }

    updateState(parameterName, value) {
        console.log("in update state")
        this.setState({
            [parameterName]: value
        })
    }

    actionCanceledShipments(type) {
        if (type == "qtyCalculator") {
            document.getElementById("showSaveQtyButtonDiv").style.display = 'none';
            (this.refs.shipmentChild.state.qtyCalculatorTableEl).destroy();
            (this.refs.shipmentChild.state.qtyCalculatorTableEl1).destroy();
            this.refs.shipmentChild.state.shipmentQtyChangedFlag = 0;
            this.setState({
                qtyCalculatorValidationError: "",
                shipmentQtyChangedFlag: 0
            })
        } else if (type == "shipmentDates") {
            document.getElementById("showSaveShipmentsDatesButtonsDiv").style.display = 'none';
            (this.refs.shipmentChild.state.shipmentDatesTableEl).destroy();
            this.refs.shipmentChild.state.shipmentDatesChangedFlag = 0;
            this.setState({
                shipmentDatesChangedFlag: 0,
                shipmentDatesError: ""
            })
        } else if (type == "shipmentBatch") {
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

    actionCanceledInventory() {
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

    actionCanceledConsumption() {
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
