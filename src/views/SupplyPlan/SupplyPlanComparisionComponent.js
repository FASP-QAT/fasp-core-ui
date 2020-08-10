import React from "react";

import { Table, Modal, ModalBody, ModalFooter, ModalHeader, Button, Row, } from 'reactstrap';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import i18n from '../../i18n';
import 'react-contexify/dist/ReactContexify.min.css';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN, CANCELLED_SHIPMENT_STATUS, PSM_PROCUREMENT_AGENT_ID, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, NO_OF_MONTHS_ON_LEFT_CLICKED, ON_HOLD_SHIPMENT_STATUS, NO_OF_MONTHS_ON_RIGHT_CLICKED, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, INVENTORY_DATA_SOURCE_TYPE, SHIPMENT_DATA_SOURCE_TYPE, QAT_DATA_SOURCE_ID, FIRST_DATA_ENTRY_DATE, NOTES_FOR_QAT_ADJUSTMENTS, TBD_FUNDING_SOURCE, TBD_PROCUREMENT_AGENT_ID } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import NumberFormat from 'react-number-format';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { Bar } from 'react-chartjs-2';
import pdfIcon from '../../assets/img/pdf.png';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import csvicon from '../../assets/img/csv.png'
import { jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import ShipmentsInSupplyPlanComponent from "./ShipmentsInSupplyPlan";


const entityname = i18n.t('static.dashboard.supplyPlan')

const chartOptions1 = {
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
            expiredStockArr: [],
            expiredStockDetails: [],
            expiredStockDetailsTotal: 0

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
        this.updateState = this.updateState.bind(this);
    }

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

    toggleAccordionManualShipments() {
        this.setState({
            showManualShipment: !this.state.showManualShipment
        })
        var fields = document.getElementsByClassName("manualShipments1");
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
        var fields = document.getElementsByClassName("erpShipments1");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showErpShipment == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
    }

    exportCSV = () => {
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

        const data = [openningArr, consumptionArr, shipmentArr, suggestedArr, manualEntryShipmentsArr, deliveredShipmentArr, shippedShipmentArr, orderedShipmentArr, plannedShipmentArr, erpShipmentsArr, deliveredErpShipmentArr, shippedErpShipmentArr, orderedErpShipmentArr, plannedErpShipmentArr, inventoryArr, closingBalanceArr, monthsOfStockArr, amcgArr, minStocArr, maxStockArr, unmetDemandArr];

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




    componentDidMount() {
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
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['downloadedProgramData'], 'readwrite');
            var program = transaction.objectStore('downloadedProgramData');
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
                            name: programJson1.programCode + "~v" + myResult[i].version,
                            id: myResult[i].id
                        }
                        proList[i] = programJson
                    }
                }
                this.setState({
                    programList: proList
                })
                this.getPlanningUnitList();
            }.bind(this);
        }.bind(this);
    };

    getPlanningUnitList(event) {
        var db1;
        var storeOS;
        getDatabase();
        var regionList = [];
        var dataSourceList = [];
        var dataSourceListAll = [];
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['downloadedProgramData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('downloadedProgramData');
            console.log("In compare program Id", document.getElementById("programId").value)
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
                                planningUnitListForConsumption: planningUnitListForConsumption
                            })
                            this.formSubmit(this.state.monthCount)
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
        this.setState({
            planningUnitChange: true,
            display: 'block'
        })
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
            var programDataTransaction = db1.transaction(['downloadedProgramData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('downloadedProgramData');
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

                            if ((manualShipmentArr.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
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
                                    if (erpShipmentArr[j].procurementAgent.id != "" && erpShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                        var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                        var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                        var shipmentDetail = procurementAgent.procurementAgentCode + " - " + erpShipmentArr[j].shipmentQty + " - " + getLabelText(shipmentStatus.label, this.state.lang) + "\n";
                                        paColor = procurementAgent.colorHtmlCode;
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

                            if ((erpShipmentArr.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
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

                            var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))));
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
                            var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
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
                                expiredStockQty += parseInt((expiredStock[j].remainingQty));
                            }
                            totalExpiredStockArr.push(expiredStockQty);
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
            showShipments: 0

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
            this.formSubmit(monthCountAdjustments);
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
            noFundsBudgetError: '',
            showShipments: 0

        },
            () => {
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
                var programDataTransaction = db1.transaction(['downloadedProgramData'], 'readwrite');
                var programDataOs = programDataTransaction.objectStore('downloadedProgramData');
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
                        allowInsertRow: false,
                        editable: false,
                        allowExport: false,
                        text: {
                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                            show: '',
                            entries: '',
                        },
                        onload: this.loadedConsumption,
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
                                                    source: this.state.batchInfoList
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
                                            allowInsertRow: false,
                                            allowManualInsertRow: false,
                                            editable: false,
                                            allowExport: false,
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
                var transaction = db1.transaction(['downloadedProgramData'], 'readwrite');
                var programTransaction = transaction.objectStore('downloadedProgramData');
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
                            if (countrySKUResult[k].realmCountry.id == programJson.realmCountry.realmCountryId && countrySKUResult[k].active == true && countrySKUResult[k].planningUnit.id == document.getElementById("planningUnitId").value) {
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
                        var inventoryList = [];
                        var isInventoryEditable = true;
                        // Region null calculation
                        if (region != -1) {
                            inventoryList = (programJson.inventoryList).filter(c =>
                                c.planningUnit.id == planningUnitId &&
                                c.region != null &&
                                c.region.id == region &&
                                moment(c.inventoryDate).format("MMM YY") == month);
                            isInventoryEditable = true;
                        } else {
                            inventoryList = (programJson.inventoryList).filter(c =>
                                c.planningUnit.id == planningUnitId &&
                                c.region == null &&
                                moment(c.inventoryDate).format("MMM YY") == month);
                            isInventoryEditable = false;
                        }
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
                            if (region != -1) {
                                data[1] = inventoryList[j].region.id; //B
                            } else {
                                data[1] = "";
                            }
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
                            if (region != -1) {
                                data[12] = inventoryListUnFiltered.findIndex(c => c.planningUnit.id == planningUnitId && c.region.id == region && moment(c.inventoryDate).format("MMM YY") == month && c.inventoryDate == inventoryList[j].inventoryDate && c.realmCountryPlanningUnit.id == inventoryList[j].realmCountryPlanningUnit.id);
                            } else {
                                data[12] = 0;
                            }
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
                            allowInsertRow: false,
                            allowManualInsertRow: false,
                            editable: false,
                            allowExport: false,
                            text: {
                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                show: '',
                                entries: '',
                            },
                            onload: this.loadedInventory,
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
                                            console.log('Adjustment type', adjustmentType);
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
                                                        source: this.state.batchInfoList
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
                                                allowInsertRow: false,
                                                allowManualInsertRow: false,
                                                editable: false,
                                                allowExport: false,
                                                text: {
                                                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                    show: '',
                                                    entries: '',
                                                },
                                                onload: this.loadedBatchInfoInventory,
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
                                                            var adjustmentType = rowData[2];
                                                            console.log("Adjustment type", adjustmentType)
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
    // Adjustments Functionality

    suggestedShipmentsDetailsClicked(month, quantity, isEmergencyOrder) {

    }

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

        let bar1 = {}
        if (this.state.jsonArrForGraph.length > 0)
            bar1 = {

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
                        label: i18n.t('static.supplyPlan.consumption'),
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
            <div className="animated fadeIn">
                <div id="supplyPlanTableId" style={{ display: 'block' }}>
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
                    <div className="table-responsive" style={{overflowX:'hidden'}}>
                    <Table className="table-bordered text-center mt-2 overflowhide" bordered  size="sm" options={this.options}>
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

                            <tr className="totalShipments1">
                                <td className="BorderNoneSupplyPlan"></td>
                                <td align="left">&emsp;&emsp;{i18n.t('static.supplyPlan.suggestedShipments')}</td>
                                {
                                    this.state.suggestedShipmentsTotalData.map(item1 => {
                                        if (item1.suggestedOrderQty.toString() != "") {
                                            if (item1.isEmergencyOrder == 1) {
                                                return (<td align="right" bgcolor='red'><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
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

                            <tr className="manualShipments1">
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

                            <tr className="manualShipments1">
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

                            <tr className="manualShipments1">
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
                            <tr className="manualShipments1">
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
                            <tr className="totalShipments1">
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
                            <tr className="erpShipments1">
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

                            <tr className="erpShipments1">
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
                            <tr className="erpShipments1">
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
                            <tr className="erpShipments1">
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
                    {/* </div> */}


                    {
                        this.state.jsonArrForGraph.length > 0
                        &&
                        <div className="col-md-12 " >

                            <div className="col-md-12">
                                <div className="chart-wrapper chart-graph-report">
                                    <Bar id="cool-canvas1" data={bar1} options={chartOptions1} />
                                </div>
                            </div>   </div>}

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
                            <span className="supplyplan-larrow-dataentry" onClick={this.leftClickedConsumption}> <i className="cui-arrow-left icons " > </i> {i18n.t('static.supplyPlan.scrollToLeft')} </span>
                            <span className="supplyplan-rarrow-dataentry" onClick={this.rightClickedConsumption}> {i18n.t('static.supplyPlan.scrollToRight')} <i className="cui-arrow-right icons" ></i> </span>
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
                                                        return (<td align="right"></td>)
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
                        </div>
                    </ModalBody>
                    <ModalFooter>
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
                                                            return (<td align="right"></td>)
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
                                                return (<td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentQty} /></td>)
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
                        </div>
                    </ModalBody>
                    <ModalFooter>
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
                        {this.state.showShipments && <ShipmentsInSupplyPlanComponent ref="shipmentChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} shipmentPage="supplyPlanCompare" />}
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
                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledShipments('qtyCalculator')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </div>

                        <h6 className="red">{this.state.shipmentDatesError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentDatesTable"></div>
                        </div>
                        <div id="showSaveShipmentsDatesButtonsDiv" style={{ display: 'none' }}>
                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledShipments('shipmentDates')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </div>
                        <h6 className="red">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentBatchInfoTable"></div>
                        </div>

                        <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledShipments('shipmentBatch')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </div>

                    </ModalBody>
                    <ModalFooter>
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
                                    <th>{i18n.t('static.supplyPlan.expiredQty')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.expiredStockDetails.map(item => (
                                        <tr>
                                            <td align="left">{item.batchNo}</td>
                                            <td align="left">{item.expiryDate}</td>
                                            <td align="left">{item.remainingQty}</td>
                                        </tr>
                                    )
                                    )
                                }
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th style={{ textAlign: 'center' }} colspan="2">{i18n.t('static.supplyPlan.total')}</th>
                                    <th style={{ textAlign: 'left' }}>{this.state.expiredStockDetailsTotal}</th>
                                </tr>
                            </tfoot>
                        </Table>
                    </ModalBody>
                </Modal>
                {/* Expired stock modal */}
            </div>

        )
    }

    shipmentsDetailsClicked(supplyPlanType, startDate, endDate) {
        var programId = document.getElementById("programId").value;
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
            var transaction = db1.transaction(['downloadedProgramData'], 'readwrite');
            var programTransaction = transaction.objectStore('downloadedProgramData');
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

    loadedBatchInfoShipment = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    loadedShipments = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
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

}