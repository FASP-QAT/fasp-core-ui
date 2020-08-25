import React from "react";


import { Table, Modal, ModalBody, ModalFooter, ModalHeader, Button, Row, } from 'reactstrap';
import i18n from '../../i18n';
import 'react-contexify/dist/ReactContexify.min.css';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN, CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, NO_OF_MONTHS_ON_LEFT_CLICKED, ON_HOLD_SHIPMENT_STATUS, NO_OF_MONTHS_ON_RIGHT_CLICKED, DATE_FORMAT_CAP, INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../../Constants.js'
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
import ShipmentsInSupplyPlanComponent from "./ShipmentsInSupplyPlan";
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import InventoryInSupplyPlanComponent from "./InventoryInSupplyPlan";
import ConsumptionInSupplyPlanComponent from "./ConsumptionInSupplyPlan";

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
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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
                        // var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        // var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson1 = JSON.parse(programData);
                        var programJson = {
                            name: programJson1.programCode + "~v" + myResult[i].version,
                            id: myResult[i].id
                        }
                        proList.push(programJson)
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
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
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
                for (var i = 0; i < programJson.regionList.length; i++) {
                    var regionJson = {
                        // name: // programJson.regionList[i].regionId,
                        name: getLabelText(programJson.regionList[i].label, this.state.lang),
                        id: programJson.regionList[i].regionId
                    }
                    regionList.push(regionJson)

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

    formSubmit(monthCount) {
        this.setState({
            planningUnitChange: true,
            display: 'block'
        })
        var m = this.getMonthArray(moment(Date.now()).add(monthCount, 'months').utcOffset('-0500'));
        var planningUnitId = document.getElementById("planningUnitId").value;
        var planningUnitName = this.props.items.planningUnitName;

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
                    shelfLife: programPlanningUnit.shelfLife,
                    versionId: programJson.currentVersion.versionId,
                    monthsInPastForAMC: programPlanningUnit.monthsInPastForAmc,
                    monthsInFutureForAMC: programPlanningUnit.monthsInFutureForAmc,
                    reorderFrequency: programPlanningUnit.reorderFrequencyInMonths,
                    minMonthsOfStock: programPlanningUnit.minMonthsOfStock
                })
                console.log("ProgramJson", programJson);
                var supplyPlanData = (programJson.supplyPlanData).filter(c => c.planningUnitId == planningUnitId);
                console.log("SUpplyPlan data", supplyPlanData);
                var lastClosingBalance = 0;
                for (var n = 0; n < m.length; n++) {
                    var jsonList = supplyPlanData.filter(c => moment(c.month.startDate).format("YYYY-MM-DD") == moment(m[n].startDate).format("YYYY-MM-DD"));
                    if (jsonList.length > 0) {
                        openingBalanceArray.push(jsonList[0].openingBalance);
                        consumptionTotalData.push(jsonList[0].consumptionJson);
                        shipmentsTotalData.push(jsonList[0].shipmentTotalQty);
                        manualShipmentsTotalData.push(jsonList[0].manualTotalQty);
                        deliveredShipmentsTotalData.push(jsonList[0].deliveredShipmentsTotalData);
                        shippedShipmentsTotalData.push(jsonList[0].shippedShipmentsTotalData);
                        orderedShipmentsTotalData.push(jsonList[0].orderedShipmentsTotalData);
                        plannedShipmentsTotalData.push(jsonList[0].plannedShipmentsTotalData);
                        erpShipmentsTotalData.push(jsonList[0].erpTotalQty);
                        deliveredErpShipmentsTotalData.push(jsonList[0].deliveredErpShipmentsTotalData);
                        shippedErpShipmentsTotalData.push(jsonList[0].shippedErpShipmentsTotalData);
                        orderedErpShipmentsTotalData.push(jsonList[0].orderedErpShipmentsTotalData);
                        plannedErpShipmentsTotalData.push(jsonList[0].plannedErpShipmentsTotalData);
                        inventoryTotalData.push(jsonList[0].adjustmentQty);
                        totalExpiredStockArr.push(jsonList[0].expiredStockArr);
                        suggestedShipmentsTotalData.push(jsonList[0].suggestedShipmentsTotalData);
                        monthsOfStockArray.push(jsonList[0].mos);
                        amcTotalData.push(jsonList[0].amc)
                        minStockMoS.push(jsonList[0].minStockMoS)
                        maxStockMoS.push(jsonList[0].maxStockMoS)
                        unmetDemand.push(jsonList[0].unmetDemand)
                        closingBalanceArray.push(jsonList[0].closingBalance)
                        consumptionArrayForRegion = consumptionArrayForRegion.concat(jsonList[0].consumptionArrayForRegion);
                        inventoryArrayForRegion = inventoryArrayForRegion.concat(jsonList[0].inventoryArrayForRegion);
                        lastClosingBalance = jsonList[0].closingBalance
                        var json = {
                            month: m[n].month,
                            consumption: jsonList[0].consumptionJson.consumptionQty,
                            stock: jsonList[0].closingBalance,
                            planned: jsonList[0].plannedShipmentsTotalData.qty + jsonList[0].plannedErpShipmentsTotalData.qty,
                            delivered: jsonList[0].deliveredShipmentsTotalData.qty + jsonList[0].deliveredErpShipmentsTotalData.qty,
                            shipped: jsonList[0].shippedShipmentsTotalData.qty + jsonList[0].shippedErpShipmentsTotalData.qty,
                            ordered: jsonList[0].orderedShipmentsTotalData.qty + jsonList[0].orderedErpShipmentsTotalData.qty,
                            mos: jsonList[0].mos,
                            minMos: jsonList[0].minStockMoS,
                            maxMos: jsonList[0].maxStockMoS
                        }
                        jsonArrForGraph.push(json);
                    } else {
                        openingBalanceArray.push(lastClosingBalance);
                        consumptionTotalData.push(0);
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
                        minStockMoS.push("");
                        maxStockMoS.push("")
                        unmetDemand.push("");
                        closingBalanceArray.push(lastClosingBalance);
                        consumptionArrayForRegion = consumptionArrayForRegion.concat([])
                        inventoryArrayForRegion = inventoryArrayForRegion.concat([]);
                        var json = {
                            month: m[n].month,
                            consumption: 0,
                            stock: lastClosingBalance,
                            planned: 0,
                            delivered: 0,
                            shipped: 0,
                            ordered: 0,
                            mos: "",
                            minMos: "",
                            maxMos: ""
                        }
                        jsonArrForGraph.push(json);
                    }
                }
                console.log("consumptionFilteredArray", consumptionArrayForRegion);
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
                    lastActualConsumptionDateArr: supplyPlanData[0].lastActualConsumptionDate,
                    paColors: supplyPlanData[supplyPlanData.length - 1].paColors,
                    jsonArrForGraph: jsonArrForGraph,
                    closingBalanceArray: closingBalanceArray
                })
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
            showConsumption: 0

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
            var programDataTransaction = db1.transaction(['downloadedProgramData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('downloadedProgramData');
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

    suggestedShipmentsDetailsClicked(month, quantity, isEmergencyOrder) {

    }

    render() {
        const { programList } = this.state;
        let bar1 = {}
        if (this.state.jsonArrForGraph.length > 0)
            bar1 = {

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
                                        <td align="right" style={{ color: item1.textColor }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></td>
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
                                                return (<td align="right" bgcolor='red' style={{ color: "#FFF" }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
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
                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                            return (<td align="right" bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                            return (<td bgcolor={item1.colour} style={{ color: item1.textColor }} align="right" data-toggle="tooltip" data-placement="right" title={item1.shipmentDetail} className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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

                {/* Consumption modal */}
                <Modal isOpen={this.state.consumption}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge('Consumption')} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.dashboard.consumptiondetails')}</strong>

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
                                                this.state.consumptionFilteredArray.filter(c => c.regionId == item.id).map(item1 => {
                                                    if (item1.qty.toString() != '') {
                                                        if (item1.actualFlag.toString() == 'true') {
                                                            return (<td align="right" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.regionId}`, `${item1.actualFlag}`, `${item1.month.month}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td align="right" style={{ color: 'rgb(170, 85, 161)' }} className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.regionId}`, `${item1.actualFlag}`, `${item1.month.month}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.regionId}`, ``, `${item1.month.month}`)}></td>)
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
                                        this.state.consumptionFilteredArray.filter(c => c.regionId == -1).map(item => (
                                            <th style={{ textAlign: 'right' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item.qty} /></th>
                                        ))
                                    }
                                </tr>
                            </tfoot>
                        </Table>
                        {this.state.showConsumption == 1 && <ConsumptionInSupplyPlanComponent ref="consumptionChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} consumptionPage="supplyPlanCompare" />}
                        <div className="table-responsive mt-3">
                            <div id="consumptionTable" />
                        </div>
                        <h6 className="red">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchInfoNoStockError || this.state.consumptionBatchError}</h6>
                        <div className="table-responsive">
                            <div id="consumptionBatchInfoTable"></div>
                        </div>

                        <div id="showConsumptionBatchInfoButtonsDiv" style={{ display: 'none' }}>
                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledConsumption()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
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
                                                this.state.inventoryFilteredArray.filter(c => c.regionId == item.id).map((item1, count) => {
                                                    if (count >= 3 && count <= 9) {
                                                        if (item1.adjustmentsQty.toString() != '' && (item1.actualQty.toString() != "" || item1.actualQty.toString() != 0)) {
                                                            return (
                                                                <>
                                                                    <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentsQty} /></td>
                                                                    <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>
                                                                </>
                                                            )
                                                        } else if (item1.adjustmentsQty.toString() != '' && (item1.actualQty.toString() == "" || item1.actualQty.toString() == 0)) {
                                                            var lastActualConsumptionDate = moment(((this.state.lastActualConsumptionDateArr.filter(c => item1.regionId == c.region))[0]).lastActualConsumptionDate).format("YYYY-MM");
                                                            var currentMonthDate = moment(item1.month.startDate).format("YYYY-MM");
                                                            if (currentMonthDate > lastActualConsumptionDate) {
                                                                return (
                                                                    <>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentsQty} /></td>
                                                                        <td align="right"></td>
                                                                    </>
                                                                )
                                                            } else {
                                                                return (
                                                                    <>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentsQty} /></td>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}></td>
                                                                    </>
                                                                )
                                                            }

                                                        } else if (item1.adjustmentsQty.toString() == '' && (item1.actualQty.toString() != "" || item1.actualQty.toString() != 0)) {
                                                            var lastActualConsumptionDate = moment(((this.state.lastActualConsumptionDateArr.filter(c => item1.regionId == c.region))[0]).lastActualConsumptionDate).format("YYYY-MM");
                                                            var currentMonthDate = moment(item1.month.startDate).format("YYYY-MM");
                                                            if (currentMonthDate > lastActualConsumptionDate) {
                                                                return (
                                                                    <>
                                                                        <td align="right"></td>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>

                                                                    </>
                                                                )
                                                            } else {
                                                                return (
                                                                    <>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}></td>
                                                                        <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.actualQty} /></td>
                                                                    </>
                                                                )
                                                            }
                                                        } else {
                                                            var lastActualConsumptionDate = moment(((this.state.lastActualConsumptionDateArr.filter(c => item1.regionId == c.region))[0]).lastActualConsumptionDate).format("YYYY-MM");
                                                            var currentMonthDate = moment(item1.month.startDate).format("YYYY-MM");
                                                            if (currentMonthDate > lastActualConsumptionDate) {
                                                                return (<><td align="right"></td><td align="right"></td></>)
                                                            } else {
                                                                return (<><td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 2)}></td>
                                                                    <td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.regionId}`, `${item1.month.month}`, `${item1.month.endDate}`, 1)}></td>
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
                                        this.state.inventoryFilteredArray.filter(c => c.regionId == -1).map((item, count) => {
                                            if (count >= 3 && count <= 9) {
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
                                            if (count >= 3 && count <= 9) {
                                                return (
                                                    <td colSpan="2">{item.projectedInventory}</td>)
                                            }
                                        })
                                    }
                                </tr>
                                <tr bgcolor='#d9d9d9'>
                                    <td align="left">{i18n.t("static.supplyPlan.autoAdjustment")}</td>
                                    {
                                        this.state.inventoryFilteredArray.filter(c => c.regionId == -1).map((item1, count) => {
                                            if (count >= 3 && count <= 9) {
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
                                            if (count >= 3 && count <= 9) {
                                                return (
                                                    <td colSpan="2">{item}</td>)
                                            }
                                        })
                                    }
                                </tr>
                            </tbody>
                        </Table>
                        {this.state.showInventory == 1 && <InventoryInSupplyPlanComponent ref="inventoryChild" items={this.state} toggleLarge={this.toggleLarge} formSubmit={this.formSubmit} updateState={this.updateState} inventoryPage="supplyPlanCompare" />}
                        <div className="table-responsive mt-3">
                            <div id="adjustmentsTable" className="table-responsive" />
                        </div>
                        <h6 className="red">{this.state.inventoryBatchInfoDuplicateError || this.state.inventoryBatchInfoNoStockError || this.state.inventoryBatchError}</h6>
                        <div className="table-responsive">
                            <div id="inventoryBatchInfoTable"></div>
                        </div>

                        <div id="showInventoryBatchInfoButtonsDiv" style={{ display: 'none' }}>
                            <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceledInventory()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
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
                            <Button size="md" color="danger" className="float-right mr-1 mb-2" onClick={() => this.actionCanceledShipments('qtyCalculator')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </div>

                        <h6 className="red">{this.state.shipmentDatesError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentDatesTable"></div>
                        </div>
                        <div id="showSaveShipmentsDatesButtonsDiv" style={{ display: 'none' }}>
                            <Button size="md" color="danger" className="float-right mr-1 mb-2" onClick={() => this.actionCanceledShipments('shipmentDates')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                        </div>
                        <h6 className="red">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentBatchInfoTable"></div>
                        </div>

                        <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                            <Button size="md" color="danger" className="float-right mr-1 mb-2" onClick={() => this.actionCanceledShipments('shipmentBatch')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
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
                                            <td align="right">{item.remainingBatchQty}</td>
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

    updateState(parameterName, value) {
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